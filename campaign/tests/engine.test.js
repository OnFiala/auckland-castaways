'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../dist/engine.js');

const fixture = {
  title: 'Testovací cesta',
  chapters: Array.from({ length: 3 }, (_, chapter) => ({
    id: 'chapter-' + chapter, title: 'Kapitola ' + (chapter + 1), intro: ['Začíná další etapa.'],
    closing: 'Tato etapa je uzavřená.',
    ...(chapter === 1 ? { archive: { title: 'Druhé svědectví', text: 'Připsaná archivní mezihra.' } } : {}),
    steps: Array.from({ length: 3 }, (_, step) => ({
      id: 'step-' + step, title: 'Rozhodnutí ' + (step + 1),
      choices: [
        { id: 'steady', label: 'Společná příprava', detail: 'Získat rezervu.', effects: { food: 2, hope: 1, craft: 2, trust: 1 }, log: 'Připravili jste další práci.' },
        { id: 'costly', label: 'Nákladný pokus', detail: 'Vynaložit síly.', effects: { food: -2, hope: -2, craft: -2, trust: -2 }, log: 'Pokus spotřeboval rezervy.' }
      ]
    }))
  }))
};

function traverse(story, selector, observer = () => {}) {
  let state = E.createGame(), visits = 0;
  const phases = new Set();
  while (state.phase !== 'ending') {
    if (++visits > 1000) throw new Error('Průchod uvázl.');
    phases.add(state.phase);
    observer(state);
    state = state.phase === 'decision'
      ? E.choose(state, selector(E.current(state, story).step.choices, state).id, story)
      : E.advance(state, story);
  }
  observer(state);
  return { state, phases };
}

test('a complete route visits chapter closures, archive and final reunion', () => {
  const { state, phases } = traverse(fixture, choices => choices[0]);
  assert.equal(state.choices.length, 9);
  assert.deepEqual([...phases].sort(), ['archive', 'chapter_end', 'decision', 'intro', 'result']);
  assert.equal(E.progress(state, fixture).percent, 100);
  assert.equal(E.progress(state, fixture).finished, true);
  assert.match(E.ending(state).text, /Všech pět/);
  assert.equal(state.journal.filter(entry => entry.kind === 'archive').length, 1);
});

test('depleted reserves never prevent a valid choice or the historical ending', () => {
  const { state } = traverse(fixture, choices => choices[1]);
  assert.deepEqual(state.stats, { food: 0, hope: 0, craft: 0, trust: 0 });
  assert.equal(state.phase, 'ending');
  assert.match(E.ending(state).reflection, /těžké/);
  assert.match(E.ending(state).text, /Všech pět/);
});

test('state and choice inputs remain immutable and shown changes match the committed state', () => {
  const state = E.advance(E.createGame(), fixture);
  const before = JSON.stringify(state), storyBefore = JSON.stringify(fixture);
  const next = E.choose(state, 'steady', fixture);
  assert.equal(JSON.stringify(state), before);
  assert.equal(JSON.stringify(fixture), storyBefore);
  for (const key of E.STAT_KEYS) assert.equal(next.stats[key] - state.stats[key], next.result.actualEffects[key]);
  assert.equal(next.result.choiceId, 'steady');
});

test('effects are bounded while the result distinguishes requested and actual changes', () => {
  const state = E.advance(E.createGame(), fixture);
  state.stats.food = 9;
  const next = E.choose(state, 'steady', fixture);
  assert.equal(next.stats.food, 10);
  assert.equal(next.result.effects.food, 2);
  assert.equal(next.result.actualEffects.food, 1);
});

test('unknown or repeated decisions cannot advance time', () => {
  const intro = E.createGame();
  assert.throws(() => E.choose(intro, 'steady', fixture), /nezačalo/);
  const decision = E.advance(intro, fixture);
  assert.throws(() => E.advance(decision, fixture), /vyberte/);
  assert.throws(() => E.choose(decision, 'missing', fixture), /dostupná/);
  const result = E.choose(decision, 'steady', fixture);
  assert.throws(() => E.choose(result, 'costly', fixture), /uzavřeno/);
});

test('undo restores the decision including resources and journal, then permits a different choice', () => {
  const decision = E.advance(E.createGame(), fixture);
  const result = E.choose(decision, 'steady', fixture);
  const restored = E.undo(E.advance(result, fixture));
  assert.deepEqual(restored, decision);
  const alternate = E.choose(restored, 'costly', fixture);
  assert.notDeepEqual(alternate.stats, result.stats);
  assert.equal(alternate.choices.length, 1);
  assert.equal(alternate.choices[0].choiceId, 'costly');
});

test('undo works across chapter boundaries and from the ending', () => {
  const { state } = traverse(fixture, choices => choices[0]);
  let undone = state;
  for (let i = 0; i < 9; i++) {
    undone = E.undo(undone);
    assert.equal(undone.phase, 'decision');
    assert(E.restoreGame(undone, fixture));
  }
  assert.equal(undone.chapter, 0);
  assert.equal(undone.step, 0);
  assert.equal(undone.choices.length, 0);
  assert.deepEqual(E.undo(undone), undone);
});

test('every phase and its undo history survive a JSON save and restore', () => {
  traverse(fixture, choices => choices[0], state => {
    assert.deepEqual(E.restoreGame(JSON.parse(JSON.stringify(state)), fixture), state);
  });
});

test('malformed or incompatible saves fail safely', () => {
  const state = E.createGame();
  const bad = [null, {}, { ...state, version: 1 }, { ...state, chapter: 999 }, { ...state, step: -1 },
    { ...state, stats: { ...state.stats, hope: NaN } }, { ...state, history: [null] },
    { ...state, phase: 'archive' }, { ...state, phase: 'result' }, { ...state, choices: [null] },
    { ...state, journal: [{ title: 42 }] }];
  for (const value of bad) assert.equal(E.restoreGame(value, fixture), null);
  const loop = { ...state }; loop.history = [loop];
  assert.equal(E.restoreGame(loop, fixture), null);
});

test('tampered save progression cannot jump straight to the ending', () => {
  const { state } = traverse(fixture, choices => choices[0]);
  assert.equal(E.restoreGame({ ...state, choices: [] }, fixture), null);
  assert.equal(E.restoreGame({ ...state, chapter: 0 }, fixture), null);
  const wrongChoice = JSON.parse(JSON.stringify(state));
  wrongChoice.choices[0].choiceId = 'not-in-story';
  assert.equal(E.restoreGame(wrongChoice, fixture), null);
  const reordered = JSON.parse(JSON.stringify(state));
  [reordered.choices[0], reordered.choices[1]] = [reordered.choices[1], reordered.choices[0]];
  assert.equal(E.restoreGame(reordered, fixture), null);
});

const storyPath = path.join(__dirname, '../dist/story.js');
test('the actual campaign can be completed with every low-score and high-score strategy', { skip: !fs.existsSync(storyPath) }, () => {
  const story = require(storyPath);
  assert.equal(story.chapters.length, 12);
  const total = story.chapters.reduce((sum, chapter) => sum + chapter.steps.length, 0);
  assert.equal(total, 36);
  for (const direction of [-1, 1]) {
    const { state } = traverse(story, choices => choices.slice().sort((a, b) => direction * (
      Object.values(a.effects || {}).reduce((sum, value) => sum + value, 0) - Object.values(b.effects || {}).reduce((sum, value) => sum + value, 0)
    ))[0], state => assert(E.restoreGame(state, story)));
    assert.equal(state.choices.length, total);
    assert.equal(state.phase, 'ending');
  }
});

test('mixed actual campaign routes remain recoverable and never deadlock', { skip: !fs.existsSync(storyPath) }, () => {
  const story = require(storyPath);
  let seed = 1865;
  for (let run = 0; run < 20; run++) {
    const { state } = traverse(story, choices => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return choices[seed % choices.length];
    }, state => {
      assert(E.restoreGame(state, story));
      assert(Object.values(state.stats).every(value => Number.isFinite(value) && value >= 0 && value <= 10));
    });
    assert.equal(E.progress(state, story).percent, 100);
  }
});

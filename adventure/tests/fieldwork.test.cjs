'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../dist/fieldwork.js');
const E = require('../dist/voyage.js');

// Every step below is an exposed action on the painted object or its named control.
const cases = {
  chest: {actions: ['flat', 'strap', 'notch', 'press', 'far', 'press', 'near', 'press'], before: 7},
  roof: {actions: ['drySeam','oldMark','wetSeam','listen','pan','wetSeam','over', 'right', 'left', 'pour', 'relay', 'under', 'right', 'pour', 'left', 'pour'], before: 15},
  drill: {actions: ['old', 'fresh', 'reclaim', 'edge', 'reclaim', 'scratch', 'reclaim'], before: 6},
  fastening: {actions: ['pressPlank','giveNails','strike','stern','strike','loosen','bow','strike','release','proveJoint'], before: 9},
  hull: {actions: ['upper', 'lower', 'middle', 'pitch', 'pack', 'pitch', 'pack', 'pack', 'pitch', 'lift', 'pitch'], before: 10},
  rig: {actions: ['tail', 'clew', 'other', 'lull', 'haul', 'port', 'haul', 'lull', 'haul'], before: 8},
  chart: {actions: ['isles', 'origin', 'west', 'north', 'verify', 'waypoint', 'east', 'verify', 'endpoint', 'inlet', 'verify'], before: 10},
  landing: {actions: ['low', 'high', 'crest', 'trough', 'pay', 'pay', 'trough', 'crest', 'take', 'trough', 'crest'], before: 10}
};

for (const [id, {actions, before}] of Object.entries(cases)) {
  test(id + ' gives feedback on failed attempts and can be completed by hand', () => {
    let state = F.initial(id);
    assert.equal(F.puzzles[id].hints.length, 3);
    actions.forEach((action, i) => {
      const v = F.view(id, state);
      const choice = v.actions.find(a => a.id === action);
      assert.ok(choice, id + ': available action ' + action);
      assert.ok(choice.label && choice.x >= 0 && choice.x <= 100 && choice.y >= 0 && choice.y <= 100);
      const prior = JSON.stringify(state), trial = F.step(id, state, action);
      assert.ok(trial.feedback.length);
      assert.equal(JSON.stringify(state), prior, 'preview and retries are immutable');
      state = trial.state;
      assert.equal(state.done, i >= before, 'no early victory');
    });
    assert.deepEqual(F.view(id, state).actions, []);
    assert.deepEqual(F.step(id, state, 'verify').state, state);
  });
}

test('every reachable partial position has a legal recovery path', () => {
  for (const id of Object.keys(cases)) {
    const first = F.initial(id), queue = [first], seen = new Set([JSON.stringify(first)]);
    const incoming = new Map(), exits = [];
    for (const s of queue) {
      const key = JSON.stringify(s);
      assert.deepEqual(F.step(id, s, 'invalid-action').state, s);
      if (s.done) exits.push(key);
      for (const {id: action} of F.view(id, s).actions) {
        const next = F.step(id, s, action).state, nextKey = JSON.stringify(next);
        if (!incoming.has(nextKey)) incoming.set(nextKey, []);
        incoming.get(nextKey).push(key);
        if (!seen.has(nextKey)) { seen.add(nextKey); queue.push(next); }
      }
    }
    const recoverable = new Set(exits);
    for (const key of exits) for (const previous of incoming.get(key) || []) {
      if (!recoverable.has(previous)) { recoverable.add(previous); exits.push(previous); }
    }
    assert.equal(recoverable.size, seen.size, id + ': no stranded states');
  }
});

function nextScene(s, dest) {
  const q = [[s.scene, null]], seen = new Set([s.scene]);
  for (const [place, first] of q) for (const exit of E.getExits({...s, scene: place})) {
    if (exit.to === dest) return first || exit.to;
    if (!seen.has(exit.to)) { seen.add(exit.to); q.push([exit.to, first || exit.to]); }
  }
  throw Error('No path to ' + dest);
}
test('only a legal, tentative world action opens its chapter workbench', () => {
  let s = E.createGame();
  const encountered = [];
  for (let i = 0; !s.completed && i < 180; i++) {
    let r;
    if (s.chapterComplete) r = E.advance(s);
    else {
      const h = E.hint(s);
      if (h.sceneId !== s.scene) r = E.travel(s, nextScene(s, h.sceneId));
      else if (h.combineItems) r = E.combine(s, ...h.combineItems);
      else if (h.itemId) {
        r = E.useItem(s, h.itemId, h.targetId);
        const id = F.challenge(s, h.itemId, h.targetId, r);
        if (id) {
          const p = F.puzzles[id];
          assert.ok(!s.flags[p.flag], 'opening does not spend the item or unlock the work');
          assert.equal(F.challenge(s, 'wrong', h.targetId, r), null);
          assert.equal(F.challenge(s, h.itemId, 'unrelated', r), null);
          assert.equal(F.challenge(s, h.itemId, h.targetId, {...r, changed: false}), null);
          assert.equal(F.challenge(r.state, h.itemId, h.targetId, r), null);
          if (id === 'drill') assert.ok(r.state.flags.drillFailed && r.state.inventory.includes('ironScrap'));
          if (id === 'hull') {
            const early = {...s, flags: {...s.flags, hullFastened: false}};
            assert.equal(F.challenge(early, h.itemId, h.targetId, E.useItem(early, h.itemId, h.targetId)), null);
          }
          encountered.push(id);
        }
      } else r = E.interact(s, h.targetId, 'use');
    }
    assert.ok(r.changed, r.text); s = r.state;
  }
  assert.ok(s.completed);
  assert.deepEqual(encountered, Object.keys(cases));
});

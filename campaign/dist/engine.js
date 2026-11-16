/* Original narrative game model. Numerical resources and all outcomes are abstractions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CastawayCampaign = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 2;
  const STAT_KEYS = ['food', 'hope', 'craft', 'trust'];
  const PHASES = ['intro', 'decision', 'result', 'chapter_end', 'archive', 'ending'];
  const MAX_HISTORY = 48;
  const copy = value => JSON.parse(JSON.stringify(value));
  const clamp = value => Math.max(0, Math.min(10, value));
  const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const isText = value => typeof value === 'string' && value.length <= 20000;
  const isIndex = value => Number.isInteger(value) && value >= 0 && value < 1000;

  function createGame() {
    return {
      version: VERSION, chapter: 0, step: 0, phase: 'intro',
      stats: { food: 5, hope: 5, craft: 3, trust: 5 },
      history: [], journal: [], choices: [], result: null
    };
  }

  function chapters(story) {
    if (!story || !Array.isArray(story.chapters) || !story.chapters.length) throw new Error('Příběh nemá žádné kapitoly.');
    return story.chapters;
  }

  function current(state, story) {
    const list = chapters(story);
    const chapter = list[state.chapter];
    if (!chapter) throw new Error('Uložená kapitola není součástí příběhu.');
    if (!Array.isArray(chapter.steps) || !chapter.steps.length) throw new Error('V kapitole chybí rozhodnutí.');
    return { chapter, step: state.phase === 'ending' ? null : chapter.steps[state.step] || null };
  }

  function record(state, title, text, kind) {
    state.journal.push({ title: String(title || ''), text: String(text || ''), kind, chapter: state.chapter });
  }

  function snapshot(state) {
    const snap = copy(state);
    delete snap.history;
    return snap;
  }

  function nextChapter(state, story) {
    if (state.chapter + 1 >= chapters(story).length) {
      state.phase = 'ending';
      state.result = null;
      record(state, 'Návrat pro všechny', 'Cesta nekončí první záchranou. Všech pět trosečníků Graftonu je zachráněno. Způsob, jakým jste vedli společnou práci, patří vaší herní variantě.', 'ending');
    } else {
      state.chapter++;
      state.step = 0;
      state.phase = 'intro';
      state.result = null;
    }
    return state;
  }

  function advance(state, story) {
    const { chapter } = current(state, story);
    const next = copy(state);
    switch (state.phase) {
      case 'intro':
        next.phase = 'decision';
        next.step = 0;
        record(next, chapter.title, (chapter.intro || []).join('\n\n'), 'chapter');
        break;
      case 'result':
        next.result = null;
        if (state.step + 1 < chapter.steps.length) {
          next.step++;
          next.phase = 'decision';
        } else {
          next.phase = 'chapter_end';
          record(next, chapter.title + ' · závěr', chapter.closing || '', 'chapter_end');
        }
        break;
      case 'chapter_end':
        if (chapter.archive) {
          next.phase = 'archive';
          record(next, chapter.archive.title, chapter.archive.text, 'archive');
        } else nextChapter(next, story);
        break;
      case 'archive':
        nextChapter(next, story);
        break;
      case 'ending':
        return next;
      default:
        throw new Error('Nejprve vyberte, jak se rozhodnete.');
    }
    return next;
  }

  function describeCondition(stats) {
    const concerns = [];
    if (stats.food <= 2) concerns.push('Zásoby jsou slabé. Další klidnější chvíli má smysl věnovat domácnosti.');
    if (stats.trust <= 2) concerns.push('Dohody se prosazují obtížně. Skupina potřebuje znovu slyšet, co si navzájem slibuje.');
    if (stats.hope <= 2) concerns.push('Naděje zeslábla. I malý dokončený úkol může dát zítřku směr.');
    if (stats.craft <= 2) concerns.push('Práce s materiálem zatím stojí hodně pokusů. Zkušenost má cenu i po nezdaru.');
    if (!concerns.length) concerns.push('Máte z čeho pokračovat. Dnešní rozhodnutí zůstává v deníku společné cesty.');
    return concerns.join(' ');
  }

  function choose(state, choiceId, story) {
    if (state.phase !== 'decision') throw new Error('Toto rozhodnutí už bylo uzavřeno nebo ještě nezačalo.');
    const { chapter, step } = current(state, story);
    if (!step || !Array.isArray(step.choices)) throw new Error('V příběhu chybí dostupné možnosti.');
    const choice = step.choices.find(item => item.id === choiceId);
    if (!choice) throw new Error('Tato možnost není dostupná.');
    const next = copy(state);
    next.history.push(snapshot(state));
    if (next.history.length > MAX_HISTORY) next.history.shift();
    const effects = {}, actualEffects = {};
    for (const key of STAT_KEYS) {
      const delta = choice.effects && choice.effects[key] !== undefined ? choice.effects[key] : 0;
      if (!Number.isFinite(delta) || Math.abs(delta) > 10) throw new Error('Rozhodnutí obsahuje neplatný herní účinek.');
      effects[key] = delta;
      next.stats[key] = clamp(state.stats[key] + delta);
      actualEffects[key] = next.stats[key] - state.stats[key];
    }
    next.result = {
      choiceId: choice.id, label: choice.label, log: choice.log || choice.detail || '',
      effects, actualEffects, reflection: describeCondition(next.stats)
    };
    next.choices.push({ chapter: state.chapter, step: state.step, choiceId: choice.id, label: choice.label, effects, actualEffects });
    next.phase = 'result';
    record(next, chapter.title + ' · ' + step.title, choice.label + '. ' + next.result.log, 'decision');
    return next;
  }

  function undo(state) {
    if (!state.history.length) return copy(state);
    const history = state.history.slice(0, -1);
    const next = copy(state.history[state.history.length - 1]);
    next.history = copy(history);
    return next;
  }

  function progress(state, story) {
    const list = chapters(story);
    const total = list.reduce((sum, chapter) => sum + chapter.steps.length, 0);
    const completed = Math.min(total, state.choices.length);
    return { completed, total, percent: total ? Math.round(completed / total * 100) : 0,
      chapter: state.chapter + 1, chapters: list.length, finished: state.phase === 'ending' };
  }

  function ending(state) {
    const together = state.stats.trust >= 5;
    const prepared = state.stats.food + state.stats.craft >= 10;
    return {
      title: 'Dokud se nevrátíme',
      subtitle: 'Pět lidí. A slib, který platil i za obzorem.',
      text: 'Musgrave se vrátil pro George Harrise a Henryho. Všech pět trosečníků Graftonu přežilo. Vaše cesta mezi těmito doloženými body ukazuje jednu možnou podobu společné práce; její dialogy, volby a čísla jsou autorskou fikcí.',
      reflection: together
        ? 'Ve vaší variantě si lidé uchovali silný základ vzájemné důvěry. Drobné dohody byly stejně důležité jako nástroje.'
        : 'Ve vaší variantě bylo společné rozhodování těžké. Návrat pro čekající muže dává závazku váhu i tam, kde každodenní soužití drhlo.',
      preparation: prepared
        ? 'Průběžná péče o zásoby a řemeslo dala skupině prostor reagovat na nezdary.'
        : 'Rezervy byly napjaté a zkušenosti drahé. Vaše skupina se opakovaně vracela k práci i po nákladném nezdaru.',
      stats: copy(state.stats), decisions: state.choices.length,
      memories: state.choices.slice(-3).map(choice => choice.label)
    };
  }

  function validStats(stats) {
    return isObject(stats) && STAT_KEYS.every(key => Number.isFinite(stats[key]) && stats[key] >= 0 && stats[key] <= 10);
  }
  function validEffects(effects) {
    return isObject(effects) && STAT_KEYS.every(key => Number.isFinite(effects[key]) && Math.abs(effects[key]) <= 10);
  }
  function validResult(result) {
    return result === null || isObject(result) && isText(result.choiceId) && isText(result.label) && isText(result.log)
      && isText(result.reflection) && validEffects(result.effects) && validEffects(result.actualEffects);
  }
  function validCore(raw, story) {
    if (!isObject(raw) || raw.version !== VERSION || !isIndex(raw.chapter) || !isIndex(raw.step) || !PHASES.includes(raw.phase) || !validStats(raw.stats) || !validResult(raw.result)) return false;
    if ((raw.phase === 'result') !== (raw.result !== null)) return false;
    if (!Array.isArray(raw.journal) || raw.journal.length > 500 || raw.journal.some(entry => !isObject(entry) || !isText(entry.title) || !isText(entry.text) || !isText(entry.kind) || !isIndex(entry.chapter))) return false;
    if (!Array.isArray(raw.choices) || raw.choices.length > 500 || raw.choices.some(choice => !isObject(choice) || !isIndex(choice.chapter) || !isIndex(choice.step) || !isText(choice.choiceId) || !isText(choice.label) || !validEffects(choice.effects) || !validEffects(choice.actualEffects))) return false;
    if (story) {
      const list = story.chapters;
      if (!Array.isArray(list) || !list.length) return false;
      const chapter = list[raw.chapter];
      if (!chapter || !Array.isArray(chapter.steps) || !chapter.steps[raw.step]) return false;
      if (raw.phase === 'archive' && !chapter.archive) return false;
      if (raw.phase === 'intro' && raw.step !== 0) return false;
      if (['chapter_end', 'archive', 'ending'].includes(raw.phase) && raw.step !== chapter.steps.length - 1) return false;
      if (raw.phase === 'ending' && raw.chapter !== list.length - 1) return false;
      const orderedSteps = list.flatMap((item, chapterIndex) => item.steps.map((step, stepIndex) => ({ chapterIndex, stepIndex, step })));
      for (let index = 0; index < raw.choices.length; index++) {
        const choice = raw.choices[index], expectedStep = orderedSteps[index];
        if (!expectedStep || choice.chapter !== expectedStep.chapterIndex || choice.step !== expectedStep.stepIndex || !expectedStep.step.choices.some(item => item.id === choice.choiceId)) return false;
      }
      let expected = list.slice(0, raw.chapter).reduce((sum, item) => sum + item.steps.length, 0) + raw.step;
      if (['result', 'chapter_end', 'archive', 'ending'].includes(raw.phase)) expected++;
      if (raw.choices.length !== expected) return false;
      if (raw.phase === 'result' && (!raw.choices.length || raw.choices.at(-1).choiceId !== raw.result.choiceId)) return false;
    }
    return true;
  }

  function restoreGame(raw, story) {
    try {
      if (!validCore(raw, story) || !Array.isArray(raw.history) || raw.history.length > MAX_HISTORY) return null;
      if (raw.history.some(entry => !validCore(entry, story) || entry.phase !== 'decision' || Object.hasOwn(entry, 'history'))) return null;
      return copy(raw);
    } catch (_) { return null; }
  }

  return { VERSION, STAT_KEYS, PHASES, createGame, current, advance, continueChapter: advance, choose, undo, restoreGame, progress, ending, describeCondition };
});

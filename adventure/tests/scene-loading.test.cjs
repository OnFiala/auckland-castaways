'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');
const engine = require('../dist/voyage.js');

const dist = path.resolve(__dirname, '../dist');
const key = 'castaways-adventure-v4';
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)]
  .map(m => m[1]).filter(file => file !== 'app.js' && file !== 'interface.js');
const appSource = fs.readFileSync(path.join(dist, 'app.js'), 'utf8');

function session(saved = {}) {
  const ui = app({initial: {'castaways-adventure-prefs':'{"reduced":true}', ...saved}, scripts, saveKey:key});
  const requests = [];
  ui.context.Image = class {
    set src(url) {
      this.url = url;
      if (url.includes('/tidepaint/')) requests.push(this);
      else queueMicrotask(() => this.onload?.());
    }
    decode() { return this.decoding || Promise.resolve(); }
    removeAttribute() {}
  };
  vm.runInContext(appSource, ui.context);
  const el = id => ui.ids.get(id);
  const latest = () => requests.at(-1);
  async function accept() { latest().onload(); await ui.flush(8); }
  async function reject() { latest().onerror(); await ui.flush(8); }
  const room = () => el('scene').dataset.scene;
  const painting = () => el('backdrop').dataset.painting?.split('/').pop();
  return {ui, el, latest, accept, reject, room, painting, requests};
}

test('cached travel stays visually quiet; a delayed transfer appears after 200 ms and an early error appears immediately', async () => {
  const a = session(), panel = a.el('scene-loading');
  assert(panel.open, 'the native modal already blocks the room');
  assert.equal(panel.dataset.phase, 'quiet');
  assert.match(a.el('scene-load-message').textContent, /Loading/);
  await a.accept();
  assert(!panel.open);
  assert.equal(panel.dataset.phase, 'quiet', 'fast success did not reveal the panel');

  const schedule = a.ui.context.setTimeout;
  let reveal;
  a.ui.context.setTimeout = (fn, ms) => {
    if (ms === 200) reveal = fn;
    return schedule(fn, ms);
  };
  await a.ui.travel('exit_wreck');
  assert(panel.open && panel.dataset.phase === 'quiet');
  reveal();
  assert.equal(panel.dataset.phase, 'loading');
  await a.ui.click('scene-stay');
  assert.equal(a.room(), 'beach');

  await a.ui.travel('exit_wreck');
  const originallyScheduledReveal = reveal;
  await a.reject();
  originallyScheduledReveal();
  assert.equal(panel.dataset.phase, 'retry');
  const retry = a.el('scene-retry');
  assert(!retry.hidden && !retry.disabled);
  await a.ui.click('scene-retry');
  assert.equal(panel.dataset.phase, 'loading');
  assert(!retry.hidden && retry.disabled);
  assert(!a.el('scene-stay').hidden);
  await a.accept(); assert.equal(a.room(), 'wreck');
});

test('a restored room has no targets until its painting decodes; reload and retry preserve the snapshot', async () => {
  const wreck = engine.travel(engine.createGame(),'wreck').state;
  const json = JSON.stringify(wreck);
  const a = session({[key]:json});
  await a.reject();
  assert.equal(a.room(), undefined);
  assert.equal(a.el('targets').children.length, 0);
  assert.equal(a.ui.stored[key], json);
  assert(a.el('scene-loading').open && a.el('scene-stay').hidden);
  assert.match(a.el('scene-load-message').textContent, /couldn’t load/);
  await a.ui.click('scene-retry');
  a.latest().decoding = Promise.reject(Error('bad WebP'));
  await a.accept();
  assert.equal(a.el('scene-retry').hidden, false);
  assert.equal(a.room(), undefined);
  await a.ui.click('scene-retry');
  const accepted = a.latest();
  await a.accept();
  assert.equal(a.room(), 'wreck'); assert(a.ui.target('crate'));
  assert.equal(a.el('backdrop').children[0], accepted);
  assert(!a.el('scene-loading').open);
  assert.equal(a.painting(), 'wreck.webp');
});

test('slow travel keeps the previous room, water and save together; obsolete decode and double retry cannot commit', async () => {
  const a = session(); await a.accept();
  const original = a.ui.stored[key];
  const actor = a.el('backdrop').children[0], water = a.el('place-weather').children[0];
  await a.ui.travel('exit_wreck');
  const slow = a.latest();
  let release;
  slow.decoding = new Promise(resolve => { release = resolve; });
  slow.onload();
  a.ui.runTimers();
  assert.match(a.el('scene-load-message').textContent,/taking longer/);
  assert.equal(a.room(),'beach'); assert(a.ui.target('rope')); assert(!a.ui.target('crate'));
  assert.equal(a.ui.stored[key],original);
  assert.equal(a.el('backdrop').children[0],actor);
  assert.equal(a.el('place-weather').children[0],water);
  await a.ui.click('scene-retry');
  const fresh = a.latest();
  await a.ui.click('scene-retry');
  assert.equal(a.latest(),fresh);
  release(); await a.ui.flush(8);
  assert.equal(a.room(),'beach');
  await a.reject(); assert.equal(a.ui.stored[key],original);
  await a.ui.click('scene-stay'); assert(!a.el('scene-loading').open);
  assert(a.ui.target('rope'));
  await a.ui.travel('exit_wreck');
  a.ui.runTimers();
  await a.accept(); // A timed-out transfer is still allowed to finish.
  assert.equal(a.room(),'wreck'); assert.equal(a.ui.state().scene,'wreck');
  assert.equal(a.el('backdrop').children[0],a.latest()); assert(a.ui.target('crate'));
});

function completeFirstChapter() {
  let s = engine.createGame();
  for (let count=0; count<60 && !s.chapterComplete; count++) {
    const h = engine.hint(s);
    if (s.scene !== h.sceneId) {
      const next = engine.getExits(s).find(e => e.to === h.sceneId) || engine.getExits(s)[0];
      s = engine.travel(s,next.to).state;
    } else if (h.combineItems) s = engine.combine(s,...h.combineItems).state;
    else if (h.itemId) s = engine.useItem(s,h.itemId,h.targetId).state;
    else s = engine.interact(s,h.targetId,'use').state;
  }
  assert(s.chapterComplete && engine.restore(s));
  return s;
}

test('a failed chapter passage retains the completed chapter and can resume into the correct new scene', async () => {
  const a = session({[key]:JSON.stringify(completeFirstChapter())}); await a.accept();
  const before=a.ui.stored[key];
  await a.ui.click('chapter-exit');
  await a.reject();
  assert.equal(a.ui.stored[key],before); assert.equal(a.room(),'camp');
  assert(!a.el('chapter-exit').hidden);
  await a.ui.click('scene-retry'); await a.accept();
  assert.equal(a.ui.state().chapter,2); assert.equal(a.painting(),'cabin-cold.webp');
  assert.equal(a.room(),'cabin'); assert(a.ui.target('roof'));
});

test('cancelling a restart on a slow beach transfer leaves the old voyage and its controls intact', async () => {
  let wreck = engine.travel(engine.createGame(),'wreck').state;
  wreck = engine.interact(wreck,'prybar','use').state;
  const a = session({[key]:JSON.stringify(wreck)}); await a.accept();
  const before = a.ui.stored[key];
  await a.ui.click('settings'); await a.ui.click('restart'); await a.ui.click('confirm-restart');
  const late = a.latest().onload;
  a.ui.runTimers();
  await a.ui.click('scene-stay'); await late(); await a.ui.flush(8);
  assert.equal(a.ui.stored[key], before); assert.equal(a.room(), 'wreck');
  assert(a.ui.item('prybar')); assert(!a.el('scene-loading').open);
  await a.ui.click('settings'); await a.ui.click('restart'); await a.ui.click('confirm-restart');
  await a.accept();
  assert.equal(a.room(),'beach'); assert.equal(a.painting(),'beach.webp');
  assert.deepEqual(a.ui.state().inventory, []);
});

test('a same-room painting failure retains the solved workbench across reload and grants each reward once', async () => {
  let s = engine.travel(engine.createGame(),'wreck').state;
  s = engine.interact(s,'prybar','use').state;
  let a = session({[key]:JSON.stringify(s)}); await a.accept();
  await a.ui.use('prybar','crate');
  for (const step of ['notch','near','press']) await a.ui.click(a.el('workbench').querySelector('[data-fw-point="'+step+'"]'));
  await a.ui.click(a.el('workbench').querySelector('[data-fw-finish]')); await a.reject();
  assert.equal(a.painting(),'wreck.webp'); assert(!a.ui.state().flags.crateOpen);
  assert(a.ui.item('prybar') && !a.ui.item('axe'));
  const progressKey = 'until-we-return.fieldwork.1.chest';
  assert(a.ui.stored[progressKey]);
  a = session({...a.ui.stored}); await a.accept(); await a.ui.use('prybar','crate');
  const finish = a.el('workbench').querySelector('[data-fw-finish]'); assert(finish);
  await a.ui.click(finish); await a.accept();
  assert.equal(a.painting(),'wreck-open.webp');
  assert(a.ui.state().flags.crateOpen); assert(!a.ui.stored[progressKey]);
  assert.equal(a.ui.state().inventory.filter(item=>item==='axe').length,1);
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dist = path.resolve(__dirname, '../dist');
const engine = require('../dist/voyage.js');
const world = require('../dist/voyage-world.js');
const art = require('../dist/voyage-art.js');

function fixture() {
  let reduced = false;
  const timers = [];
  const doc = {createElement: () => new Node()};
  class Node {
    constructor() {
      this.children = [];
      this.ownerDocument = doc;
      this.style = {setProperty: (key, value) => { this.style[key] = value; }};
      this.dataset = {};
    }
    setAttribute(key, value) { this[key] = value; }
    append(node) { this.children.push(node); node.parent = this; }
    replaceChildren(node) { this.children = []; this.append(node); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); }
    querySelector(name) { return this.children.find(n => n.className === name.slice(1)); }
    closest() { return null; }
    addEventListener() {}
  }
  const root = new Node();
  const host = {
    CastawayWorld: world, AdventureArt: art,
    matchMedia: () => ({matches: reduced}), setTimeout: f => timers.push(f)
  };
  vm.runInNewContext(fs.readFileSync(path.join(dist, 'stage-life.js'), 'utf8'), {window: host});
  const life = host.CastawayLife;
  function draw(scene, flags = {}) {
    const state = {scene, flags};
    life.render(root, state);
    return state;
  }
  const detail = id => root.children[0].children.find(n => n.dataset.life === id);
  const work = (s, target) => life.work(root, s, target);
  return {draw, detail, work, root, timers, life, reduce: () => { reduced = true; }};
}

test('every room has registered, bounded material detail and references existing files', () => {
  const f = fixture();
  const assets = new Set();
  for (const scene of engine.SCENES) {
    for (const flags of [{}, Object.fromEntries(engine.FLAGS.map(key => [key, true]))]) {
      f.draw(scene.id, flags);
      const parts = f.root.children[0].children;
      assert.ok(parts.length >= 2, scene.id);
      assert.equal(parts.length, new Set(parts.map(n => n.dataset.life)).size);
      assets.add(f.root.style['--life-plate'].match(/url\("(.+?)"\)/)[1]);
      for (const part of parts) {
        const [x,y,w,h] = Array.from(part.style.cssText.matchAll(/(?:left|top|width|height):([.\d]+)%/g), m => Number(m[1]));
        assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x+w <= 100 && y+h <= 100, scene.id + '/' + part.dataset.life);
        for (const match of (part.innerHTML || '').matchAll(/href="([^"]+)"/g)) assets.add(match[1]);
        for (const match of part.style.cssText.matchAll(/url\("(.+?)"\)/g)) assets.add(match[1]);
      }
    }
  }
  for (const asset of assets) assert.ok(fs.existsSync(path.join(dist, asset)), asset);
});

test('cold, interrupted and completed work each have distinct physical states', () => {
  const f = fixture();
  f.draw('cabin');
  assert.ok(f.detail('leaking-seam'));
  f.draw('cabin', {roofSealed: true, waterStored: true});
  assert.ok(!f.detail('leaking-seam') && !f.detail('warming-water'));
  f.draw('cabin', {roofSealed: true, waterStored: true, warmthReady: true});
  assert.ok(f.detail('warming-water') && f.detail('hearth'));
  f.draw('slipway', {hullPlanked: true});
  assert.ok(f.detail('raised-planking') && !f.detail('sail-on-stocks'));
  f.draw('crossing', {rigSecured: true});
  assert.ok(f.detail('secured-shroud') && f.detail('bilge-water'));
  f.draw('crossing', {rigSecured: true, boatDry: true, sailMended: true});
  assert.ok(f.detail('dry-boards') && f.detail('sail-repair') && !f.detail('bilge-water'));
  f.draw('landing', {boatMoored: true});
  assert.ok(f.detail('mooring-line') && !f.detail('lantern-on-post'));
  f.draw('landing', {boatMoored: true, landingMarked: true});
  assert.ok(f.detail('lantern-on-post'));
});

test('shared furnace target plays the actual work once and preserves the water animation', () => {
  const f = fixture();
  f.draw('forge', {forgeFueled: true});
  const water = f.detail('water-at-door');
  const fitted = f.draw('forge', {forgeFueled: true, bellowsFitted: true});
  const bellows = f.detail('bellows');
  f.work(fitted, 'furnace');
  assert.equal(f.root.children[1].dataset.life, 'work-bellowsFitted');
  const count = f.timers.length;
  f.work(fitted, 'furnace');
  assert.equal(f.timers.length, count);
  const lit = f.draw('forge', {...fitted.flags, forgeLit: true});
  f.work(lit, 'furnace');
  assert.equal(f.root.children[1].dataset.life, 'work-forgeLit');
  assert.equal(f.detail('water-at-door'), water);
  assert.equal(f.detail('bellows'), bellows);
  assert.match(bellows.className, /pumping/);
  f.timers.forEach(fn => fn());
  assert.equal(f.root.children.length, 1);
});

test('reduced motion skips transients while keeping completed material states', () => {
  const f = fixture();
  f.draw('chartroom');
  f.reduce();
  const s = f.draw('chartroom', {rescueRoute: true});
  f.work(s, 'chartTable');
  assert.ok(f.detail('pencilled-course'));
  assert.equal(f.root.children.length, 1);
  assert.equal(f.timers.length, 0);
});

test('crop scale and position reconstruct the original plate at each corner', () => {
  const f = fixture();
  const flags = Object.fromEntries(engine.FLAGS.map(key => [key, true]));
  for (const scene of engine.SCENES) {
    f.draw(scene.id, flags);
    for (const node of f.root.children[0].children.filter(n => n.className.includes('life-paint'))) {
      const css = node.style.cssText;
      const rect = Array.from(css.matchAll(/(?:left|top|width|height):([.\d]+)%/g), m => Number(m[1]));
      const [,sx,sy] = css.match(/background-size:([.\d]+)% ([.\d]+)%/);
      const [,px,py] = css.match(/background-position:([.\d]+)% ([.\d]+)%/);
      for (const [start, length, scale, position] of [[rect[0],rect[2],sx,px],[rect[1],rect[3],sy,py]]) {
        const wholePlate = length * scale / 100;
        const origin = start + (length - wholePlate) * position / 100;
        assert.ok(Math.abs(100 - wholePlate) < .001 && Math.abs(origin) < .001, scene.id+'/'+node.dataset.life);
      }
    }
  }
});

test('scene CSS pauses behind a dialog and has static reduced-motion states', () => {
  const css = fs.readFileSync(path.join(dist, 'stage-life.css'), 'utf8');
  const actors = fs.readFileSync(path.join(dist, 'actors.css'), 'utf8');
  assert.match(css, /body:has\(dialog\[open\]\) #place-life \*[^{]+\{\s*animation-play-state: paused;/);
  assert.match(actors, /\.inactive \*[^{]+\{animation-play-state:paused!important/);
  assert.match(css, /\.reduced #place-life \*[^{]+\{ animation: none !important;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]+#place-life \*[^{]+\{ animation: none !important;/);
  const definitions = new Set(Array.from(css.matchAll(/@keyframes ([\w-]+)/g), m => m[1]));
  for (const [,name] of css.matchAll(/animation: (life-[\w-]+)/g)) assert.ok(definitions.has(name), name);
});

test('optional gestures touch the visible spot from the walk polygon, clear of mandatory object centres', () => {
  const stage = require('../dist/stage-direction.js');
  const poses = require('../dist/work-poses.js');
  const f = fixture(), flags = {bellowsFitted: true};
  const ids = new Set();
  for (const scene of engine.SCENES) {
    const state = {scene:scene.id, flags};
    for (const feature of f.life.features(state)) {
      const {id, x, y, w, h, approach, pose, contact} = feature;
      assert.ok(!ids.has(id), id);
      ids.add(id);
      assert.equal(feature.kind, 'feature');
      assert.equal(feature.paint, false);
      assert.ok(w > 0 && w <= 9 && h > 0 && h <= 11);
      const floor = stage.groundPoint(scene.id, approach.x, approach.y);
      assert.ok(Math.hypot(floor.x-approach.x, floor.y-approach.y) < .14, id+' floor');
      const size = stage.heightAt(scene.id, floor.y);
      const hand = poses.contact(scene.chapter >= 6 ? 'musgrave' : 'player', pose);
      const facing = Math.sign(contact.x-floor.x);
      const error = Math.hypot((floor.x + facing*9/16*hand.x*size - contact.x)*16/9,
                               floor.y - hand.y*size - contact.y);
      assert.ok(error / size < .018, id+' hand');
      for (const obj of scene.targets.filter(t => t.kind !== 'person')) {
        assert.notEqual(obj.id, id);
        const target = stage.stageTarget(scene.id, obj, state);
        assert.ok(Math.abs(x-target.x) > (w+target.w)/2 || Math.abs(y-target.y) > (h+target.h)/2,
          id+' overlaps '+target.id);
      }
      assert.ok(feature.observation.length <= 110);
    }
  }
  assert.equal(ids.size, 10);
});

test('a room feature can be tried repeatedly without progressing, including in reduced motion', () => {
  const f = fixture();
  for (const scene of engine.SCENES) {
    const state = f.draw(scene.id, {bellowsFitted:true});
    const before = JSON.stringify(state);
    f.reduce();
    for (const feature of f.life.features(state)) {
      const first = f.life.tryFeature(f.root, state, feature.id);
      assert.equal(first, feature.observation);
      const firstBeat = f.root.children[1];
      assert.ok(firstBeat.children.length >= 1);
      assert.equal(f.life.tryFeature(f.root, state, feature.id), first);
      assert.equal(f.root.children.length, 2);
      assert.notEqual(f.root.children[1], firstBeat);
    }
    assert.equal(JSON.stringify(state), before);
    assert.equal(f.life.tryFeature(f.root, state, 'unknown'), null);
  }
  assert.deepEqual(Array.from(f.life.features({scene:'forge',flags:{}})), []);
  const lit = f.draw('forge', {bellowsFitted:true, forgeLit:true});
  assert.match(f.life.tryFeature(f.root, lit, 'bellows_handle'), /orange/);
  assert.ok(f.root.children[1].children.some(n => n.dataset.life === 'fresh-air-in-coals'));
});

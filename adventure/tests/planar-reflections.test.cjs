'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {contains} = require('../dist/ground.js');
const {describe} = require('../dist/landscape.js');
const {profile} = require('../dist/stage-direction.js');
const {surfaceFor, update} = require('../dist/planar-reflections.js');

const point = (x, y) => ({x, y});

test('the bilge receiver shares the painted water boundary and disappears when bailed', () => {
  const wet = {scene: 'crossing', flags: {rigSecured: true, boatDry: false}};
  const paintedWater = describe(wet).find(part => part.style === 'bilge');
  const receiver = surfaceFor(wet);
  assert.deepEqual(receiver.points, paintedWater.points.map(([x, y]) => point(x, y)));
  assert(contains(receiver.points, point(66, 79)));
  assert(!contains(receiver.points, point(66, 86)), 'dry planks below the puddle');
  assert(!contains(receiver.points, point(66, 57)), 'the hull beyond the puddle');
  assert.equal(surfaceFor({...wet, flags: {...wet.flags, boatDry: true}}), null);
});

test('shore and wharf receivers intersect the reachable wet ground and exclude solid features', () => {
  const cases = [
    ['beach', point(27, 73), [point(12, 85), point(76, 81), point(72, 63), point(27, 40)]],
    ['harbour', point(53, 79), [point(3, 66), point(37, 64), point(35, 92), point(92, 83)]]
  ];
  for (const [scene, wet, solid] of cases) {
    const receiver = surfaceFor({scene});
    assert(contains(profile(scene).walkPolygon, wet), scene + ' wet sample is reachable');
    assert(contains(receiver.points, wet), scene + ' wet sample casts a reflection');
    for (const point of solid) assert(!contains(receiver.points, point), scene + ' ' + JSON.stringify(point));
  }
  for (const scene of ['camp', 'wreck', 'salvage', 'cabin', 'forge', 'chartroom', 'return_camp']) {
    assert.equal(surfaceFor({scene}), null, scene + ' has no reflective plane');
  }
});

function reflectionStage() {
  const doc = {createElement: () => new Element(), createElementNS: () => new Element()};
  class Element {
    ownerDocument = doc;
    children = [];
    attrs = {};
    dataset = {};
    style = {setProperty(name, value) { this[name] = value; }};
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name]; }
    get firstElementChild() { return this.children[0]; }
    appendChild(node) { this.children.push(node); node.parentElement = this; }
    replaceChildren() { this.children = []; }
    remove() { this.parentElement.children = this.parentElement.children.filter(child => child !== this); }
    querySelector(selector) {
      return this.children.find(child => child.className?.split(' ').includes(selector.slice(1))) ||
        this.children.map(child => child.querySelector(selector)).find(Boolean);
    }
  }
  const stage = new Element(), actor = new Element(), sprite = new Element();
  stage.appendChild(actor);
  actor.appendChild(sprite);
  actor.style.height = '40%';
  function paint(kind, href, box) {
    const svg = new Element(), crop = new Element(), image = new Element();
    svg.className = `${kind}-viewport`;
    svg.setAttribute('viewBox', '0 0 448 500');
    svg.appendChild(crop);
    crop.appendChild(image);
    crop.setAttribute('viewBox', box);
    image.setAttribute('href', href);
    sprite.appendChild(svg);
    return crop;
  }
  return {stage, sprite, paint};
}

test('the reflection follows current painted crops and clears when the receiver is dry or disabled', () => {
  const {stage, sprite, paint} = reflectionStage();
  const walk = paint('walk', 'assets/walk/player.png', '32 5 448 500');
  paint('work', 'assets/work-poses/player.png', '1117 168 396 336');
  sprite.style.transform = 'scaleX(-1)';
  const state = {scene: 'crossing', flags: {boatDry: false}};
  const foot = point(66, 79);
  update(stage, state, foot, sprite);

  const layer = stage.querySelector('.planar-reflections');
  assert.equal(layer.getAttribute('aria-hidden'), 'true');
  const actor = layer.querySelector('.planar-reflection--player');
  assert.equal(actor.id, undefined);
  assert.equal(actor.style['--reflection-facing'], -1);
  assert.equal(actor.style.top, '79%');
  const crop = actor.firstElementChild.firstElementChild;
  assert.equal(crop.getAttribute('viewBox'), '32 5 448 500');

  walk.setAttribute('viewBox', '544 5 448 500');
  update(stage, state, foot, sprite);
  assert.equal(layer.querySelector('.planar-reflection--player'), actor, 'the element persists across walking frames');
  assert.equal(crop.getAttribute('viewBox'), '544 5 448 500');

  sprite.dataset.workPose = 'crouch';
  update(stage, state, foot, sprite);
  assert.equal(crop.getAttribute('viewBox'), '1117 168 396 336');
  assert.equal(crop.firstElementChild.getAttribute('href'), 'assets/work-poses/player.png');
  update(stage, state, point(66, 86), sprite);
  assert.equal(layer.querySelector('.planar-reflection--player'), undefined);

  update(stage, state, foot, sprite);
  update(stage, {...state, flags: {boatDry: true}}, foot, sprite);
  assert.equal(layer.hidden, true);
  assert.equal(layer.children.length, 0);
  update(stage, state, foot, sprite);
  assert.equal(layer.hidden, false);
  update(stage, state, foot, sprite, undefined, false);
  assert.equal(layer.hidden, true);
  assert.equal(layer.children.length, 0);
});

test('edge coverage follows quality and resize without recomputing for each live frame', (t) => {
  const edges = [];
  let resize;
  // The live update calls this optional renderer only for a new receiver or size.
  globalThis.CastawayEdgeCoverage = {update: (...args) => edges.push(args)};
  globalThis.ResizeObserver = class {
    constructor(callback) { resize = width => callback([{contentRect: {width}}]); }
    observe() {}
  };
  t.after(() => {
    delete globalThis.CastawayEdgeCoverage;
    delete globalThis.ResizeObserver;
  });
  const {stage, sprite} = reflectionStage();
  stage.clientWidth = 880;
  stage.dataset.lightingMode = 'cinematic';
  const state = {scene: 'beach'};
  update(stage, state, point(27, 73), sprite);
  update(stage, state, point(26, 74), sprite);
  resize(720);
  update(stage, state, point(25, 75), sprite);
  stage.dataset.lightingMode = 'balanced';
  update(stage, state, point(25, 75), sprite);
  assert.deepEqual(edges.map(args => [args[1], args[3], args[4]]),
    [['wet-sand', 880, true], ['wet-sand', 720, true], ['wet-sand', 720, false]]);
  assert.equal(new Set(edges.map(args => args[0])).size, 1);
});

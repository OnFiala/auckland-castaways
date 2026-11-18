'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Stage = require('../dist/stage-direction.js');
const Motion = require('../dist/animation.js');
const {crewMember} = require('../dist/choreography.js');
const Ground = require('../dist/ground.js');
const Engine = require('../dist/voyage.js');
const dist = path.resolve(__dirname, '../dist');

function cast(room, id, flags = {}) {
  const station = flags => Stage.workStation(room, id, {flags});
  const initial = station(flags);
  const polygon = Stage.profile(room).walkPolygon;
  const member = crewMember(initial, polygon, y => Stage.heightAt(room, y));
  return { initial, station, tick: (flags, ms = 50, options) => member.tick(station(flags), ms, options) };
}

test('entering or restoring any room never repeats the last job or a crouch', () => {
  let stations = 0;
  for (const {id: room, chapter} of Engine.SCENES) {
    for (const flag of [null, ...Engine.FLAGS]) {
      const state = {...Engine.createGame(), chapter, scene: room};
      if (flag) state.flags[flag] = true;
      const people = Engine.getTargets(state).filter(t => t.kind === 'person').map(t => t.id);
      people.push(...Stage.companions(room, state));
      for (const id of people) {
        const actor = cast(room, id, state.flags);
        const snapshot = actor.tick(state.flags);
        assert.equal(snapshot.posture, 'stand', room + '/' + id + '/' + flag);
        assert.equal(snapshot.moving, false);
        assert.deepEqual(actor.tick(state.flags, 100), snapshot);
        assert.ok(Ground.distance(actor.initial, snapshot) < .0001);
        stations++;
      }
    }
  }
  assert.ok(stations > 500);
});

test('a live order produces one walk, plants the feet, works once and stands indefinitely', () => {
  // The camp and the bilge use the actual low painting. The crate and anvil use the high one.
  for (const [room, id, flags, contact] of [
    ['camp', 'henry', {firewoodPlaced:true}, 'crouch'],
    ['crossing', 'musgrave', {rigSecured:true}, 'crouch'],
    ['wreck', 'musgrave', {crateOpen:true}, 'reach'],
    ['forge', 'raynal', {forgeLit:true}, 'reach']
  ]) {
    const actor = cast(room, id);
    const beats = [], contactFrames = [];
    let elapsed = 0, pose;
    for (; elapsed < 15000; elapsed += 50) {
      pose = actor.tick(flags);
      assert.ok(Ground.contains(Stage.profile(room).walkPolygon, pose));
      if (beats.at(-1) !== pose.posture) beats.push(pose.posture);
      if (pose.posture === contact) contactFrames.push(pose);
    }
    assert.deepEqual(beats, ['walk','stand',contact,'stand'], room);
    assert.ok(contactFrames.length * 50 >= 700 && contactFrames.length * 50 <= 1100);
    assert.ok(contactFrames.every(p => !p.moving && p.frame === Motion.REST_FRAME));
    assert.ok(contactFrames.every(p => Ground.distance(p, pose) < 1e-6));
    if (room === 'crossing') {
      const hand = require('../dist/work-poses.js').contact(id, contact);
      const h = Stage.heightAt(room,pose.y);
      const touch = {x:pose.x-hand.x*h*9/16,y:pose.y-hand.y*h};
      assert.ok(Ground.distance(touch,Stage.marks.crossing.bilge) < .5);
      assert.ok(Stage.station(room,'raynal').x < 20, 'Raynal is by the port tiller');
    }
    for (let i = 0; i < 100; i++) assert.deepEqual(actor.tick({...flags, ropeTaken: true}), pose);
  }
});

test('talk during a walk plants an upright listener immediately, facing the approaching player', () => {
  const actor = cast('camp', 'henry');
  const after = {firewoodPlaced:true};
  let step = actor.tick(after, 100);
  for (let i = 0; i < 4; i++) step = actor.tick(after, 100);
  assert.equal(step.posture, 'walk');
  const right = {x:step.x+7, y:step.y}, left = {x:step.x-7, y:step.y};
  for (const player of [right, left]) {
    const held = actor.tick(after, 100, {addressed:true, player});
    assert.deepEqual([held.x,held.y],[step.x,step.y]);
    assert.equal(held.frame, Motion.REST_FRAME);
    assert.equal(held.facing, player === right ? 'right' : 'left');
    assert.equal(held.posture, 'stand');
  }
  const resumed = actor.tick(after, 100);
  assert.notEqual(resumed.x, step.x);
  let working;
  for (let i = 0; i < 130; i++) {
    working = actor.tick(after, 100);
    if (working.posture === 'crouch') break;
  }
  assert.equal(working.posture, 'crouch', 'he still tends the firewood he was walking towards');
  const interrupted = actor.tick(after, 100, {addressed:true, player:left});
  assert.equal(interrupted.posture, 'stand');
  assert.equal(interrupted.x, working.x);
  for (let i = 0; i < 130; i++) assert.equal(actor.tick(after, 100).posture, 'stand');
});

test('hidden or modal work holds the current drawing; reduced motion retires it permanently', () => {
  const actor = cast('camp', 'henry');
  const flags = {firewoodPlaced:true};
  let step;
  for (let i = 0; i < 100; i++) {
    step = actor.tick(flags, 50);
    if (step.posture === 'crouch') break;
  }
  assert.equal(step.posture, 'crouch');
  for (let i = 0; i < 50; i++) assert.deepEqual(actor.tick(flags, 100, {paused:true}), step);
  assert.equal(actor.tick(flags, 50, {reduced:true}).posture, 'stand');
  for (let i = 0; i < 30; i++) assert.equal(actor.tick(flags).posture, 'stand');
  const instant = cast('crossing','musgrave');
  const secured = {rigSecured:true}, now = instant.tick(secured, 0, {reduced:true});
  assert.ok(Ground.distance(now,instant.station(secured)) < .0001);
  assert.equal(now.posture, 'stand'); assert.equal(now.moving, false);
});

test('people near a speaker turn without taking a step; distant people keep their station', () => {
  const actor = cast('return_camp','george');
  const here = actor.initial;
  const person = dx => ({x:here.x+dx, y:here.y});
  assert.equal(here.facing, 'left');
  const seen = actor.tick({}, 100, {player:person(-45),speaker:person(4)});
  assert.equal(seen.facing, 'right'); assert.equal(seen.x,here.x); assert.equal(seen.posture, 'stand');
  assert.equal(actor.tick({}, 100, {player:person(-45)}).facing, 'left');
});

function drawingRig() {
  class Image {
    set src(value) { this.url = value; queueMicrotask(() => this.onload()); }
  }
  const window = {Image};
  vm.runInNewContext(fs.readFileSync(path.join(dist,'work-poses.js'),'utf8'), {window});
  const doc = {createElementNS: () => new Element()};
  class Element {
    constructor() {
      this.ownerDocument = doc; this.attrs = {}; this.dataset = {}; this.children = [];
      this.style = {setProperty(k,v) { this[k] = v; }};
    }
    setAttribute(k,v) { this.attrs[k] = String(v); }
    appendChild(child) { child.parentNode = this; this.children.push(child); }
    querySelector(k) { return this.children.find(n => n.attrs.class === k.slice(1)); }
  }
  const host = new Element(), walk = new Element();
  walk.attrs.class = 'walk-viewport'; host.appendChild(walk);
  return {work:window.CastawayWorkPoses, host, walk};
}

test('the displayed SVG uses the real standing/crouching source cells at one ground anchor', async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(dist,'assets/work-poses/manifest.json')));
  for (const [id, sheet] of Object.entries(manifest.assets)) {
    const {work,host,walk} = drawingRig();
    await work.prepare(id);
    let image;
    for (const [name,face] of [['stand','right'],['crouch','right'],['stand','left'],['reach','left'],['stand','right']]) {
      assert.ok(work.show(host,id,name,face));
      assert.equal(host.dataset.workPose,name); assert.equal(walk.style.visibility,'hidden');
      const viewport = host.children[1], clip = viewport.children[0];
      assert.equal(viewport.style.visibility,'visible');
      const pose = sheet.poses[name];
      assert.equal(clip.attrs.viewBox,pose.crop.join(' '));
      assert.equal(host.style.transform,face === 'right' ? 'scaleX(1)' : 'scaleX(-1)');
      const scale = Number(clip.attrs.height) / pose.crop[3];
      const measuredFootX = Number(clip.attrs.x) + (pose.measuredGround[0]-pose.crop[0])*scale;
      const measuredFootY = Number(clip.attrs.y) + (pose.measuredGround[1]-pose.crop[1])*scale;
      assert.ok(Math.abs(measuredFootX-sheet.walkView[0]/2) < 2,id);
      assert.ok(Math.abs(measuredFootY-sheet.walkGround[1]) < 2,id);
      if (image) assert.equal(clip.children[0],image);
      image = clip.children[0];
      assert.equal(image.attrs.href,sheet.atlas);
      assert.equal(host.children.length,2);
    }
    work.hide(host); assert.equal(host.children[1].style.visibility,'hidden');
    assert.equal(host.dataset.workPose,undefined);
    const atlas = Motion.WALKS[id], cell = Motion.frameBox(id,2);
    const markup = Motion.sprite(id,2);
    const displayX = Number(markup.match(/class="atlas-clip" x="([^"]+)"/)[1]);
    assert.equal(displayX-cell[0]+atlas.groundanchor[0]-atlas.commoncrop[0],sheet.walkView[0]/2);
  }
});

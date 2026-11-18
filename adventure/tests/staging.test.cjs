'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/voyage.js');
const Stage = require('../dist/stage-direction.js');
const Ground = require('../dist/ground.js');
const {walker} = require('../dist/choreography.js');

function inside(id, p) {
  assert(Ground.contains(Stage.profile(id).walkPolygon, p), `${id}: feet at ${p.x}, ${p.y}`);
}

test('all fourteen paintings have reachable entries, prop stations and doors at their own perspective scale', () => {
  let routes = 0, detours = 0;
  for (const scene of E.SCENES) {
    const id = scene.id, profile = Stage.profile(id), polygon = profile.walkPolygon;
    const state = {...E.createGame(), chapter: scene.chapter, scene: id};
    const destinations = [...Object.values(profile.entry), ...Object.values(profile.from)];
    for (const t of E.getTargets(state)) {
      const staged = Stage.stageTarget(id, t, state);
      if (t.kind === 'person') destinations.push(Stage.workStation(id, t.id, state));
      else {
        destinations.push(staged.approach);
        if (staged.artWidth) assert(staged.artWidth > 0 && staged.artHeight > 0, t.id);
      }
    }
    for (const e of E.getExits(state)) destinations.push(Stage.stageExit(id, e).approach);
    destinations.forEach(p => inside(id, p));
    const probes = [...destinations, polygon[Math.floor(polygon.length/3)]];
    for (const from of probes) for (const to of probes) {
      const path = Ground.route(polygon, from, to);routes++;
      if (path.points.length > 2) detours++;
      assert(Ground.distance(Ground.sample(path, 1), to) < .0001, `${id}: exact arrival`);
      for (let t = 0; t <= 10; t++) inside(id, Ground.sample(path, t / 10));
    }
    assert(Stage.heightAt(id, profile.walk[2]) < Stage.heightAt(id, profile.walk[3]));
  }
  assert.equal(E.SCENES.length, 14);assert(detours>0);
  console.log(`Checked ${routes} paths between room stations, including ${detours} obstacle detours.`);
});

test('a queued work route stays still when paused, changes gait with distance and plants both feet at arrival',()=>{
  const id='crossing', poly=Stage.profile(id).walkPolygon, size=y=>Stage.heightAt(id,y);
  const from={x:18,y:76}, to={x:83,y:77}, player=walker(from,'right');
  player.go(poly,to,size);
  const initial=player.tick(0,size);let pose=initial,frames=new Set();
  for(let i=0;i<20;i++){pose=player.tick(16,size);frames.add(pose.frame);inside(id,pose);}
  const held=player.tick(100,size,{paused:true});assert.equal(held.x,pose.x);assert.equal(held.y,pose.y);
  for(let i=0;i<400&&player.active;i++){pose=player.tick(16,size);frames.add(pose.frame);inside(id,pose);}
  assert.equal(frames.size,6);assert(!player.active);assert(!pose.moving);assert(Ground.distance(pose,to)<.00001);
  player.go(poly,from,size);const reduced=player.tick(16,size,{reduced:true});assert(!reduced.moving);assert(Ground.distance(reduced,from)<.00001);
});

test('the return party appears at the landing after preparations and companion work stations have physical causes',()=>{
 const blank=E.createGame();const ready={...blank,chapter:7,scene:'landing',flags:{...blank.flags,boatMoored:true,suppliesShared:true,henryFound:true,georgeFound:true}};
 assert.deepEqual(Stage.companions('landing',blank),[]);assert.deepEqual(Stage.companions('landing',ready),['henry','george']);
 const home=Stage.station('forge','raynal'), atWork=Stage.workStation('forge','raynal',{flags:{forgeLit:true}});
 assert.notDeepEqual({x:home.x,y:home.y},{x:atWork.x,y:atWork.y});inside('forge',atWork);
 assert.equal(atWork.pose,'reach');assert.equal(Stage.stageTarget('crossing',{id:'tornSail',kind:'puzzle'},ready).indirect,true);
});

test('the raised chest lid can be examined from the same station as the box', () => {
  const source = {id: 'crate', kind: 'puzzle'};
  const shut = Stage.stageTarget('wreck', source, {flags: {}});
  const open = Stage.stageTarget('wreck', source, {flags: {crateOpen: true}});
  const contains = (box, x, y) =>
    Math.abs(x - box.x) <= box.w / 2 && Math.abs(y - box.y) <= box.h / 2;
  assert(!contains(shut, 73.8, 39.2));
  assert(contains(open, 73.8, 39.2), 'middle of the raised wooden lid');
  assert(contains(open, 72, 61.5), 'lower front board');
  assert.deepEqual(open.approach, shut.approach);
});

test('the supplies fit the painted crate and the lantern handle reaches the iron ring', () => {
  const sack = Stage.stageTarget('harbour', {id: 'provisions', kind: 'item'}, {});
  const bottom = sack.y + sack.artHeight / 2;
  assert(sack.x - sack.artWidth / 2 >= 77.4 && sack.x + sack.artWidth / 2 <= 83.3);
  assert(bottom >= 59.1 && bottom <= 60.2, 'visible top of the wharf crate');
  inside('harbour', sack.approach);

  const lamp = Stage.marks.landing.lantern;
  const loopTop = lamp.y - lamp.h / 2;
  assert(Math.abs(lamp.x - 77.8) < 0.45);
  assert(loopTop >= 30.7 && loopTop <= 31.8, 'iron ring on the right-hand side of the post');
});

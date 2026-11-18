'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dist/voyage');
const Stage = require('../dist/stage-direction');
const Ground = require('../dist/ground');
const World = require('../dist/voyage-world');

// Use the same planted soles, ground projection and depth-scaled button as
// placeCrew(). A positive gap matters: pointer rounding happens in CSS pixels.
function clearance(state, object, who, stageWidth) {
  const station = Stage.workStation(state.scene, who, state);
  const foot = Ground.project(Stage.profile(state.scene).walkPolygon, station);
  const height = Stage.heightAt(state.scene, foot.y);
  const width = Math.max(6.5, Math.min(10.8, height * .213));
  const horizontal = Math.abs(object.x - foot.x) - width/2;
  const vertical = Math.max(object.y - foot.y, foot.y-height - object.y);
  return Math.max(horizontal, vertical*9/16) * stageWidth/100;
}

test('the captain leaves the fitted side reachable, and Raynal leaves the cutter free when the chart and stores go aboard', () => {
  for (const [chapter, scene, who, object, flag] of [
    [4, 'slipway', 'musgrave', 'boatFrame', 'hullPlanked'],
    [6, 'harbour', 'raynal', 'rescueCutter', 'chartMarked'],
    [6, 'harbour', 'raynal', 'rescueCutter', 'rescueSupplied'],
    [6, 'harbour', 'raynal', 'rescueCutter', 'rescueRigged'],
  ]) {
    const state = {...E.createGame(), chapter, scene, flags:{[flag]:true}};
    const original = E.getTargets(state).find(t=>t.id===object);
    const target = Stage.stageTarget(scene,World.stageTarget(original,state),state);
    assert(clearance(state,target,who,320) >= 6, scene+'/'+flag+' must leave six real pixels at 320px');
    assert(clearance(state,target,who,1280) >= 6);
  }
});

test('late-game crew stations leave each puzzle and loose item centre accessible on phone and desktop', () => {
  for (const room of E.SCENES.filter(room=>room.chapter>=4)) {
    // Every precedence-ordered work station can be selected by its single flag.
    // The final group on the return landing needs four flags simultaneously.
    const reunion={boatMoored:true, suppliesShared:true, henryFound:true, georgeFound:true};
    const cases=[{},...E.FLAGS.map(flag=>({[flag]:true})),reunion,{...reunion,menRescued:true}];
    for(const flags of cases) {
      const state={...E.createGame(),chapter:room.chapter,scene:room.id,flags};
      const targets=E.getTargets(state).map(t=>Stage.stageTarget(room.id,World.stageTarget(t,state),state));
      const cast=[...targets.filter(t=>t.kind==='person').map(t=>t.actor||t.id),...Stage.companions(room.id,state)];
      for(const object of targets.filter(t=>t.kind!=='person')) for(const who of cast) {
        for(const width of [320,1280]) assert(clearance(state,object,who,width)>=1,
          `${room.id}/${who} intercepts ${object.id} at ${width}px with ${Object.keys(flags)}`);
      }
    }
  }
});

const painted = require('../dist/assets/work-poses/manifest.json').assets;

function standingRadius(room, actor, foot) {
  const {standingHeight, poses} = painted[actor];
  const [left,,width] = poses.stand.crop;
  const sole = poses.stand.ground[0];
  // Allow either facing after the working gesture ends and both people look up.
  return Math.max(sole-left, left+width-sole) / standingHeight *
    Stage.heightAt(room,foot.y) * 9/16;
}

test('the working player has a separate place to stand when the crew settle after an action', () => {
  const reunion = {boatMoored:true,suppliesShared:true,henryFound:true,georgeFound:true};
  const examples = [
    ['crossing', 'canvasPatch', 'player', 'musgrave', [{},{rigSecured:true},{boatDry:true}]],
    ['crossing', 'bilge', 'player', 'musgrave', [{rigSecured:true},{boatDry:true}]],
    ['cabin', 'kettle', 'player', 'henry', [{waterStored:true}]],
    ['cabin', 'stove', 'player', 'henry', [{waterStored:true},{warmthReady:true}]],
    ['forge', 'testBlock', 'player', 'raynal', [{drillForged:true},{drillFailed:true}]],
    ['salvage', 'planks', 'player', 'henry', [{},{sailclothTaken:true}]],
    ['salvage', 'oakum', 'player', 'henry', [{planksTaken:true}]],
    ['harbour', 'rescueCutter', 'musgrave', 'raynal', [{},{chartMarked:true},{rescueSupplied:true}]],
    ['landing', 'rescueBoat', 'musgrave', 'henry', [reunion,{...reunion,menRescued:true}]],
    ['landing', 'rescueBoat', 'musgrave', 'george', [reunion,{...reunion,menRescued:true}]],
  ];
  for (const [room,id,player,crew,cases] of examples) for (const flags of cases) {
    const state = {scene:room,flags};
    const object = Stage.stageTarget(room,{id},state);
    const floor = Stage.profile(room).walkPolygon;
    const a = Ground.project(floor,object.approach);
    const b = Ground.project(floor,Stage.workStation(room,crew,state));
    const gap = Math.abs(a.x-b.x) - standingRadius(room,player,a) - standingRadius(room,crew,b);
    assert(gap > 0, `${room}/${id}: ${player} and ${crew}'s upright paintings share a column (${gap.toFixed(2)}%)`);
  }
});

'use strict';
// Source-level geometry and actual UI handlers. Native browser hit testing is a separate release check.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');
const E = require('../dist/voyage.js');
const Stage = require('../dist/stage-direction.js');
const World = require('../dist/voyage-world.js');
const dist = path.resolve(__dirname, '../dist');
const css = fs.readFileSync(path.join(dist, 'stage.css'), 'utf8');
const lifeHost = {};
vm.runInNewContext(fs.readFileSync(path.join(dist, 'stage-life.js'), 'utf8'), {window:lifeHost});

function polygon(selector) {
  const rule = css.slice(css.lastIndexOf(selector)).match(/clip-path:\s*polygon\(([^)]+)\)/);
  assert(rule, selector);
  return rule[1].split(',').map(pair => pair.trim().split(/\s+/).map(parseFloat));
}
function contains(shape, x, y) {
  let inside = false;
  for (let i = 0, j = shape.length-1; i < shape.length; j = i++) {
    const [ax, ay] = shape[i], [bx, by] = shape[j];
    if ((ay > y) !== (by > y) && x < (bx-ax)*(y-ay)/(by-ay)+ax) inside = !inside;
  }
  return inside;
}
function inButton(shape, target, x, y) {
  return contains(shape, 50+(x-target.x)*100/target.w, 50+(y-target.y)*100/target.h);
}

test('points on the upper cleat, vertical fall, sheave and loose end share the same working hand', () => {
  const [target] = lifeHost.CastawayLife.features({scene:'wreck', flags:{}});
  const shape = polygon('[data-target="wreck_hawser"]::before {\n  clip-path');
  for (const point of [[20.5,59],[20.38,63],[24.8,71.6],[31,69.7],[26.1,72.4]]) {
    assert(inButton(shape, target, ...point), 'visible tackle at '+point);
  }
  for (const point of [[26,63],[30.3,60],[20.3,74.6]]) {
    assert(!inButton(shape, target, ...point), 'open rock at '+point);
  }
  assert.deepEqual([target.contact.x,target.contact.y],[26.1,72.4]);
  assert.deepEqual([target.approach.x,target.approach.y],[34.15,76.72]);
});

test('the seated toe and support take a pointer; the sky beside the head and open chest lid passes through', () => {
  const rest = JSON.parse(fs.readFileSync(path.join(dist,'assets/shore-rest/manifest.json')));
  const foot = Stage.station('beach','raynal');
  const shape = polygon('.staged .shore-rest img {');
  const height = Stage.heightAt('beach',foot.y)*rest.heightInStandingHeights;
  const width = height*9/16*rest.size[0]/rest.size[1];
  function onRaynal(x,y) {
    const u=rest.ground[0]/rest.size[0]-(x-foot.x)/width;
    const v=rest.ground[1]/rest.size[1]+(y-foot.y)/height;
    return contains(shape,100*u,100*v);
  }
  assert(onRaynal(72.8,70.8)); assert(onRaynal(83,69.5));
  assert(!onRaynal(73,52)); assert(!onRaynal(70.1,37.6));
  assert.match(css,/\.staged \.person:has\(\.shore-rest\) \{ pointer-events:none/);
  assert.match(css,/\.staged \.shore-rest img \{\s*pointer-events:auto/);
  const chest=Stage.stageTarget('wreck',{id:'crate',kind:'puzzle'},{flags:{crateOpen:true}});
  const lid=polygon('[data-target="crate"]::before {\n  clip-path');
  for(const point of [[74.45,35],[70,37.3],[79.6,37.8],[66.1,55.2],[78.9,62.7]]) {
    assert(inButton(lid,chest,...point), 'painted chest at '+point);
  }
  assert(!inButton(lid,chest,67,38),'the ship and hillside beside the lid');
});

test('a narrow pointer field for bilge water yields to the compass at its painted centre', () => {
  const state={...E.createGame(),scene:'crossing',chapter:5};
  function targets() {return E.getTargets(state).map(t=>Stage.stageTarget('crossing',World.stageTarget(t,state),state));}
  const all=targets(), compass=all.find(t=>t.id==='compass'), water=all.find(t=>t.id==='bilge');
  assert(all.indexOf(water)>all.indexOf(compass),'water is a later DOM sibling');
  for(const width of [320,360,384,1280]){
    const min=width<=700?24:30;
    const waterWidth=Math.max(water.w,min/width*100);
    const waterHeight=Math.max(water.h,min/(width*9/16)*100);
    const overlap=Math.abs(compass.x-water.x)<waterWidth/2 && Math.abs(compass.y-water.y)<waterHeight/2;
    assert.equal(overlap,width<700);
  }
  assert.match(css,/\[data-scene="crossing"\] \[data-target="compass"\],\s*\.staged\[data-scene="landing"\] \[data-target="rescueLine"\] \{ z-index:11 !important/);
  state.flags.compassTaken=true;
  assert(!targets().some(t=>t.id==='compass'));
  assert(targets().some(t=>t.id==='bilge'));
});

test('removed shore and wreck objects leave neither a mouse button nor a keyboard target, including after reload', async () => {
  const ui=app();
  for(const id of ['rope','pole']) {await ui.pick(id);assert(!ui.target(id));}
  await ui.click(ui.item('rope'));await ui.click(ui.item('pole'));
  await ui.use('loopPole','sail');assert(!ui.target('sail'));
  await ui.travel('exit_wreck');await ui.pick('prybar');assert(!ui.target('prybar'));
  await ui.use('prybar','crate');assert(ui.target('crate'));
  await ui.travel('exit_beach_wreck');await ui.use('axe','driftwood');assert(!ui.target('driftwood'));
  const reload=app({initial:ui.stored});
  for(const id of ['rope','pole','sail','driftwood'])assert(!reload.target(id));
  assert(reload.item('firewood'));
  await reload.travel('exit_wreck');assert(!reload.target('prybar'));assert(reload.target('crate'));
  for(const scene of E.SCENES){
    for(const pickup of scene.targets.filter(t=>t.pickupFlag)){
      const state={...E.createGame(),chapter:scene.chapter,scene:scene.id};
      assert(E.getTargets(state).some(t=>t.id===pickup.id));
      state.flags[pickup.pickupFlag]=true;
      assert(!E.getTargets(state).some(t=>t.id===pickup.id));
    }
  }
});


test('the pointed hull ends and boarding plank respond while open water beside them remains free', () => {
  const cutter = Stage.stageTarget('harbour',{id:'rescueCutter',kind:'puzzle'});
  const boat = Stage.stageTarget('landing',{id:'rescueBoat',kind:'puzzle'});
  const harbour = polygon('[data-target="rescueCutter"]::before {\n  clip-path');
  const landing = polygon('[data-target="rescueBoat"]::before {\n  clip-path');
  for (const point of [[11.8,54.5],[14.3,61],[52.7,56.6],[40.5,68.5],[42,52.6]]) {
    assert(inButton(harbour,cutter,...point), 'Flying Scud at '+point);
  }
  for (const point of [[12,66.8],[25,52.5],[52.8,66.1]]) assert(!inButton(harbour,cutter,...point));
  for (const point of [[20.8,49.6],[22.4,55.8],[53.9,46.4],[34,59.8]]) {
    assert(inButton(landing,boat,...point), 'landing boat at '+point);
  }
  for (const point of [[24.4,61.3],[38,45.8],[54.1,58.1]]) assert(!inButton(landing,boat,...point));
  assert.deepEqual(cutter.approach,{x:41.3,y:73.6});
  assert.deepEqual(boat.approach,{x:39.8,y:67.8});
  assert.deepEqual(boat.contact,{x:46.8,y:49});
});

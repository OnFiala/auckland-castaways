'use strict';
// Exercise the real delegated click and close handlers using the shared DOM contract double.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');

function workroom(options) {
  const ui = app(options);
  options?.setup?.(ui);
  for (const name of ['fieldwork.js', 'fieldwork-ui.js']) {
    const file = path.join(__dirname, '../dist', name);
    vm.runInContext(fs.readFileSync(file, 'utf8'), ui.context, {filename: file});
  }
  const dialog = ui.ids.get('workbench'), bench = ui.context.CastawayBench;
  const calls = {complete: 0, close: 0};
  const open = id => bench.open(id, {
    complete() { calls.complete++; },
    close() { calls.close++; }
  });
  const click = async selector => {
    const button = dialog.querySelector(selector);
    assert.ok(button, 'available control ' + selector);
    await ui.click(button);
  };
  const point = id => click('[data-fw-point="' + id + '"]');
  return {ui, dialog, bench, calls, open, point, click};
}

test('painted actions, named controls, hints and unfinished work survive standing back and a reload', async () => {
  const a = workroom();
  a.open('chest');
  assert.ok(a.bench.shown());
  assert.equal(a.dialog.querySelector('.fw-plate').getAttribute('src'), 'assets/workplates/chest.webp');
  assert.equal(a.dialog.querySelector('.fw-controls').open, false);
  await a.point('strap');
  assert.match(a.dialog.querySelector('.fw-feedback').textContent, /no lip/);
  await a.click('[data-fw-hint]');
  const first = a.dialog.querySelector('.fw-hint-text').textContent;
  await a.point('notch');
  await a.click('[data-fw-hint]');
  assert.notEqual(a.dialog.querySelector('.fw-hint-text').textContent, first);
  const second = a.dialog.querySelector('.fw-hint-text').textContent;
  a.dialog.oncancel({preventDefault() {}});
  assert.equal(a.bench.shown(), false);
  assert.deepEqual(a.calls, {complete: 0, close: 1});

  const b = workroom({initial: a.ui.stored});
  b.open('chest');
  assert.equal(b.dialog.querySelector('.fw-hint-text').textContent, second);
  assert.equal(b.dialog.querySelector('[data-fw-point="notch"]'), null);
  await b.click('[data-fw-hint]');
  const third = b.dialog.querySelector('.fw-hint-text').textContent;
  assert.notEqual(third, second);
  await b.click('[data-fw-hint]');
  assert.equal(b.dialog.querySelector('.fw-hint-text').textContent, third);
  // Simulate the details element's native expansion, then use its named button.
  b.dialog.querySelector('.fw-controls').open = true;
  await b.click('[data-fw-action="near"]');
  const before = b.dialog.querySelector('.fw-drawing').innerHTML;
  await b.point('press');
  assert.notEqual(b.dialog.querySelector('.fw-drawing').innerHTML, before, 'the physical position changes');
  const revealed = 'assets/workplates/details/chest-open.webp';
  assert.equal(b.dialog.querySelector('.fw-plate').getAttribute('src'), revealed);
  assert.doesNotMatch(b.dialog.querySelector('.fw-drawing').innerHTML, /fw-bar-crop/);
  assert.equal(b.ui.activeElement(), b.dialog.querySelector('[data-fw-finish]'));
  assert.equal(b.calls.complete, 0);
  await b.click('[data-fw-close]');
  assert.deepEqual(b.calls, {complete: 0, close: 1});
  b.open('chest');
  assert.equal(b.dialog.querySelector('.fw-plate').getAttribute('src'), revealed);
  await b.click('[data-fw-finish]');
  assert.deepEqual(b.calls, {complete: 1, close: 1});
  assert.equal(b.bench.shown(), false);
  assert.ok(!Object.keys(b.ui.stored).some(k => k.includes('fieldwork.')));
});

test('invalid partial saves are discarded, and new-game reset clears work across chapters', async () => {
  const bad = 'until-we-return.fieldwork.1.roof';
  const room = workroom({initial: {[bad]: JSON.stringify({trail: ['under','no-such-action'], hints: 3, done: true})}});
  room.open('roof');
  assert.ok(room.dialog.querySelector('[data-fw-point="pan"]'));
  assert.equal(room.dialog.querySelector('.fw-hint-text').textContent, '');
  await room.point('pan');
  await room.click('[data-fw-close]');
  room.open('drill');
  await room.point('fresh');
  room.bench.reset();
  assert.equal(room.bench.shown(), false);
  assert.ok(!Object.keys(room.ui.stored).some(k => k.includes('fieldwork.')));
  room.open('roof');
  assert.ok(room.dialog.querySelector('[data-fw-point="pan"]'));
});

test('blocked persistent storage still supports a cancel and resume in the same game', async () => {
  const room = workroom({blocked: true});
  room.open('landing');
  await room.point('high');
  await room.point('pay');
  await room.point('crest');
  await room.click('[data-fw-close]');
  room.open('landing');
  assert.equal(room.dialog.querySelector('[data-fw-point="crest"]').getAttribute('aria-pressed'), 'true');
  await room.point('trough');
  await room.click('[data-fw-finish]');
  assert.equal(room.calls.complete, 1);
});

test('a line can be laid by dragging its real endpoints, including cancel, a wrong lead and a repair', async()=>{
 const room=workroom();room.open('rig');const board=room.dialog.querySelector('.fw-board');
 function event(x,y){const box=board.getBoundingClientRect();return {pointerId:1,button:0,clientX:box.left+box.width*x/100,clientY:box.top+box.height*y/100,preventDefault(){}};}
 function drag(x,y,xx,yy){board.onpointerdown(event(x,y));board.onpointermove(event(xx,yy));board.onpointerup(event(xx,yy));}
 board.onpointerdown(event(60,91));board.onpointermove(event(48,31));board.onpointercancel();
 assert(room.dialog.querySelector('[data-fw-point="clew"]'));
 drag(60,91,48,31);drag(48,31,76,72);await room.point('lull');await room.point('haul');
 assert(!room.dialog.querySelector('[data-fw-finish]'));
 drag(48,31,35,76);await room.point('lull');await room.point('haul');await room.click('[data-fw-finish]');
 assert.equal(room.calls.complete,1);
});

test('the room survey is available without a patch, and reading the pan works with its sound muted', async () => {
  const room = workroom();
  const played=[];
  room.ui.context.Audio=class { constructor(src){this.src=src;} play(){played.push(this.src);return Promise.resolve();} pause(){} };
  room.bench.surveyRoof();
  await room.point('oldMark');
  assert.match(room.dialog.querySelector('.fw-feedback').textContent,/dry/);
  await room.point('drySeam');
  assert.match(room.dialog.querySelector('.fw-feedback').textContent,/pan/);
  await room.click('[data-fw-sound]');
  await room.point('listen');
  assert.match(room.dialog.querySelector('.fw-feedback').textContent,/ring opens/);
  assert.deepEqual(played,[]);
  await room.click('[data-fw-sound]');
  await room.point('listen');
  assert.deepEqual(played,['assets/field-scenes/drop-in-pan.wav']);
  await room.point('wetSeam');
  assert.match(room.dialog.querySelector('#fw-description').textContent,/stitched hide/);
  assert.equal(room.dialog.querySelector('[data-fw-point="under"]'),null);
  await room.click('[data-fw-close]');
  const loaded=workroom({initial:room.ui.stored});
  loaded.open('roof');
  await loaded.point('under'); await loaded.point('left'); await loaded.point('right'); await loaded.point('pour');
  assert.match(loaded.dialog.querySelector('.fw-drawing').innerHTML,/fw-runoff/);
  assert.doesNotMatch(loaded.dialog.querySelector('.fw-drawing').innerHTML,/fw-pan-ring/);
  await loaded.click('[data-fw-finish]');
  assert.equal(loaded.calls.complete,1);
});

test('a saved roof repair from the former version keeps its working stitches', async () => {
  const room = workroom({initial: {'until-we-return.fieldwork.1.roof':JSON.stringify({trail:['under','left'],hints:1})}});
  room.open('roof');
  assert.equal(room.dialog.querySelector('[data-fw-point="left"]').getAttribute('aria-pressed'),'true');
  await room.point('right');await room.point('pour');await room.click('[data-fw-finish]');
  assert.equal(room.calls.complete,1);
});

test('the two men resume at the last brace and the joint is tested after both step clear', async () => {
  const room=workroom();room.open('fastening');
  await room.point('pressPlank');await room.point('giveNails');await room.point('stern');await room.point('strike');
  assert.match(room.dialog.querySelector('.fw-feedback').textContent,/open air/);
  const wrong=room.dialog.querySelector('.fw-drawing').innerHTML;
  await room.click('[data-fw-close]');
  const loaded=workroom({initial:room.ui.stored});loaded.open('fastening');
  assert.equal(loaded.dialog.querySelector('[data-fw-point="stern"]').getAttribute('aria-pressed'),'true');
  await loaded.point('bow');
  assert.notEqual(loaded.dialog.querySelector('.fw-drawing').innerHTML,wrong);
  await loaded.point('strike'); assert(!loaded.dialog.querySelector('[data-fw-finish]'));
  await loaded.point('release'); assert(!loaded.dialog.querySelector('[data-fw-finish]'));
  await loaded.point('proveJoint');await loaded.click('[data-fw-finish]');
  assert.equal(loaded.calls.complete,1);
});

test('the shared six walk frames fit the workplate and pause across a hidden tab', async () => {
  let doc,visibilityChanged,reduced=false,now=0;
  const frames=[], viewports=[], phases=[];
  const room=workroom({setup(ui){
    const host=ui.context;
    doc=host.document;
    doc.addEventListener=(type,cb)=>{ if(type==='visibilitychange') visibilityChanged=cb; };
    doc.createElementNS=(_ns,tag)=>{
      const node=doc.createElement(tag);
      if(tag==='svg') viewports.push(node);
      return node;
    };
    const proto=Object.getPrototypeOf(ui.ids.get('workbench'));
    proto.after=function(node) {
      node.parent=this.parent; this.parent.children.splice(this.parent.children.indexOf(this)+1,0,node);
    };
    const motion=require('../dist/animation.js');
    host.CastawayMotion={...motion,frameBox(id,n){phases.push(n);return motion.frameBox(id,n);}};
    host.requestAnimationFrame=cb=>frames.push(cb);
    host.matchMedia=()=>({matches:reduced});
    host.performance={now:()=>now};
  }});
  function tick(ms) { now+=ms;for(const cb of frames.splice(0))cb(now); }
  room.open('fastening');await room.point('pressPlank');await room.point('giveNails');
  await room.point('bow');const actor=room.dialog.querySelector('[data-fw-actor="player"]');
  tick(32);const start=Number(actor.dataset.footX);
  assert.ok(viewports.length);
  for(const viewport of viewports){
    assert.match(viewport.style.width,/px$/);assert.match(viewport.style.height,/px$/);
    assert.notEqual(viewport.style.width,viewport.style.height,'the portrait retains its aspect ratio');
  }
  doc.hidden=true;visibilityChanged();tick(10000);
  doc.hidden=false;visibilityChanged();tick(9000);
  assert.equal(Number(actor.dataset.footX),start,'hidden time does not move Alick');
  for(let i=0;i<25;i++)tick(30);
  assert(Number(actor.dataset.footX)>start);
  assert.equal(new Set(phases).size,6,'both footfalls use all six atlas phases');
  reduced=true;tick(16);
  assert.equal(actor.style.visibility,'');
  assert(Number(actor.dataset.footX)>80,'a live motion preference change settles Alick beside the bow');
});

test('leaving the tab stops the sound of the pan immediately', async () => {
  let doc,visibilityChanged,stops=0;
  const room=workroom({setup(ui) {
    doc=ui.context.document;
    doc.addEventListener=(_,cb)=>{visibilityChanged=cb;};
    ui.context.Audio=class{play(){return Promise.resolve();}pause(){stops++;}};
  }});
  room.bench.surveyRoof();await room.point('listen');
  doc.hidden=true;visibilityChanged();assert.equal(stops,1);
});

test('the walkable room and roof survey share the pan and place the only ring inside its rim', () => {
  const room=workroom();room.bench.surveyRoof();
  const markup=room.dialog.querySelector('.fw-drawing').innerHTML;
  for(const [svg,name] of [[markup,'survey'],[room.bench.cabinTraces(false),'room']]) {
    assert.match(svg,/assets\/tactile\/tin-pan.webp/);
    assert.equal((svg.match(/class="fw-drip"/g)||[]).length,1);
    assert.ok(svg.includes('clip-path="url(#pan-water-'+name+')"'));
    assert.match(svg,/class="fw-pan-ring" cx="59.8" cy="86.5"/);
  }
  const repaired=room.bench.cabinTraces(true);
  assert.match(repaired,/tin-pan.webp/);assert.match(repaired,/roof-hide-room/);
  assert.doesNotMatch(repaired,/fw-drip|fw-pan-ring/);
});

test('the hit field follows the real painted pan at desktop and narrow touch stage sizes',()=>{
  const room=workroom(),markup=room.bench.cabinTraces(false),target=room.bench.panTarget(false);
  const frame=Object.fromEntries([...markup.matchAll(/(?:^|[;"\s])(left|top|width|height):([\d.]+)%/g)].map(m=>[m[1],Number(m[2])]));
  const painted=markup.match(/class="fw-tin-pan"[^>]+/)[0];
  const rect=Object.fromEntries([...painted.matchAll(/\b(x|y|width|height)="([\d.]+)"/g)].map(m=>[m[1],Number(m[2])]));
  for(const width of [320,390,740,1280]){
    const height=width*9/16;
    const x=(frame.left+frame.width*(rect.x+rect.width/2)/100)*width/100;
    const y=(frame.top+frame.height*(rect.y+rect.height/2)/100)*height/100;
    assert(Math.abs(target.x*width/100-x)<.01);
    assert(Math.abs(target.y*height/100-y)<.01);
    assert(Math.abs(target.w*width/100-rect.width*frame.width*width/10000)<.01);
    assert(Math.abs(target.h*height/100-rect.height*frame.height*height/10000)<.01);
  }
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/fieldwork.css'),'utf8'),/\[data-target="tinPan"\]\s*\{ min-width:44px; min-height:44px;/);
});

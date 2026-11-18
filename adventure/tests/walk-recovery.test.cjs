'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');
const E = require('../dist/voyage.js');
const dist = path.join(__dirname, '../dist');
const saved = 'castaways-adventure-v4';

function mount(initial, intercept) {
  const ui = app({initial, scripts:[], saveKey:saved});
  const ctx = ui.context, doc = ctx.document;
  const source = name => fs.readFileSync(path.join(dist, name), 'utf8');
  const requests = [], deadlines = new Map();
  const baseSet = ctx.setTimeout, baseClear = ctx.clearTimeout;
  ctx.setTimeout = (fn, ms) => {
    const timer = baseSet(fn, ms);
    if (ms === 4000) deadlines.set(timer, fn);
    return timer;
  };
  ctx.clearTimeout = timer => { deadlines.delete(timer); baseClear(timer); };
  ctx.Image = class {
    set src(url) {
      this.url = url;
      requests.push(this);
      if (!intercept(url)) queueMicrotask(() => this.onload?.());
    }
  };
  // The shared HTML double flattens markup. Preserve the nested image/clip/viewport
  // of actual actor sprites so paint handoffs and the displayed href are observable.
  const proto = Object.getPrototypeOf(doc.body);
  Object.defineProperty(proto,'parentNode',{get(){return this.parent;}});
  const html = Object.getOwnPropertyDescriptor(proto,'innerHTML');
  Object.defineProperty(proto,'innerHTML',{...html,set(markup){
    html.set.call(this,markup);
    if (!markup.startsWith('<svg class="painted walk-painting')) return;
    const [viewport,clip,image]=this.children;
    this.children=[viewport]; viewport.children=[clip]; clip.parent=viewport;
    clip.children=[image];image.parent=clip;
  }});
  doc.createElementNS = (_,tag)=>doc.createElement(tag);
  const scripts = [...source('index.html').matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
  for (const script of scripts.filter(f=>f!=='interface.js')) vm.runInContext(source(script), ctx, {filename:script});
  const host=ui.ids.get('player-sprite'), player=ui.ids.get('player'), scene=ui.ids.get('scene');
  function point(x,y) { scene.onclick({target:scene,clientX:x*10,clientY:y*5.625}); }
  return {...ui, host, requests, deadlines, point,
    latest(prefix) { return requests.filter(im=>im.url.startsWith(prefix)).at(-1); },
    foot() { return parseFloat(player.style.left); },
    expire() { for(const fn of [...deadlines.values()]) fn(); },
    layer(selector) { return host.querySelector(selector); }
  };
}

function atChapter(number, complete = false) {
  let s=E.createGame();
  for (let n=0;n<200 && (s.chapter<number || (complete && !s.chapterComplete));n++) {
    if (s.chapterComplete) {s=E.advance(s).state;continue;}
    const hint=E.hint(s);
    if (s.scene!==hint.sceneId) {
      const route=E.travel(s,hint.sceneId);s=route.changed?route.state:E.travel(s,'beach').state;
    } else if (hint.combineItems) s=E.combine(s,...hint.combineItems).state;
    else if (hint.itemId) s=E.useItem(s,hint.itemId,hint.targetId).state;
    else s=E.interact(s,hint.targetId,'use').state;
  }
  assert.equal(s.chapter,number);assert(E.restore(s));return s;
}

for(const [chapter,id,mode] of [[1,'player','network error'],[1,'player','decode rejection'],
  [1,'player','no natural size'],[6,'musgrave','hung decode']]){
  test('chapter '+chapter+' keeps the planted '+id+' and resumes measured steps after '+mode,async()=>{
    const state=atChapter(chapter),base='assets/walk/'+id+'.png';
    const ui=mount({[saved]:JSON.stringify(state)},url=>url.startsWith(base));
    await ui.flush(12);
    const start=ui.foot(),first=ui.latest(base);
    assert(first);assert.equal(ui.host.dataset.workPose,'stand');
    assert.match(ui.layer('.work-viewport').querySelector('image').getAttribute('href'),new RegExp('work-poses/'+id));
    ui.point(32,79);
    let release;
    if(mode==='hung decode'){
      first.decode=()=>new Promise(resolve=>{release=resolve;});
      first.onload();ui.expire();
    } else if(mode==='decode rejection'){
      // Image headers alone do not make the pixels drawable.
      first.naturalWidth=1536;first.naturalHeight=1024;
      first.decode=()=>Promise.reject(new Error('broken image data'));
      first.onload();
    } else if(mode==='no natural size'){
      first.naturalWidth=0;first.naturalHeight=0;first.onload();
    } else first.onerror();
    await ui.flush(4);
    assert.equal(ui.foot(),start);assert.match(ui.ids.get('caption').textContent,/try moving again/i);
    assert.equal(ui.host.dataset.workPose,'stand');
    ui.point(32,79);const second=ui.latest(base);
    assert.notEqual(first,second);assert.match(second.url,/\?retry=/);
    release?.();await ui.flush(2);assert.equal(ui.foot(),start);
    second.onload();await ui.flush(20);
    assert(ui.foot()<start && ui.foot()>32);
    assert.equal(ui.host.dataset.moving,'true');
    assert.equal(ui.layer('.walk-viewport').querySelector('image').getAttribute('href'),second.url);
    assert.equal(ui.layer('.work-viewport').style.visibility,'hidden');
    await ui.flush(500);assert.equal(ui.foot(),32);assert.equal(ui.host.dataset.workPose,'stand');
    assert.equal(ui.layer('.work-viewport').style.visibility,'visible');
    assert(!ui.host.innerHTML.includes('assets/sailor.png')&&!ui.host.innerHTML.includes('assets/people/'));
  });
}

test('a failed working atlas recovers with the same crew member and cannot hide a live walking frame',async()=>{
  const base='assets/work-poses/player.png', state=atChapter(1);
  const ui=mount({[saved]:JSON.stringify(state)},url=>url.startsWith(base));
  await ui.flush(12);
  const failed=ui.latest(base);
  failed.decode=()=>Promise.reject(new Error('undecodable work sheet'));failed.onload();
  await ui.flush(3);
  const walk=ui.layer('.walk-viewport');
  assert.equal(walk.querySelector('image').getAttribute('href'),'assets/walk/player.png');
  ui.point(34,79);await ui.flush(20);
  assert.equal(ui.host.dataset.moving,'true');const next=ui.latest(base);
  assert.match(next.url,/\?retry=/);next.onload();await ui.flush(10);
  assert.notEqual(walk.style.visibility,'hidden');
  await ui.flush(500);
  const work=ui.layer('.work-viewport');
  assert.equal(ui.host.dataset.workPose,'stand');assert.equal(work.style.visibility,'visible');
  assert.equal(work.querySelector('image').getAttribute('href'),next.url);
});

test('reduced motion remains immediately usable when the walking transfer has no completion event',async()=>{
  const ui=mount({[saved]:JSON.stringify(atChapter(1)),'castaways-adventure-prefs':'{"reduced":true}'},
    url=>url.startsWith('assets/walk/player.png'));
  await ui.flush(12);ui.point(37,77);await ui.flush(3);
  assert.equal(ui.foot(),37);assert.equal(ui.host.dataset.moving,'false');
});

test('the runtime actor styles and markup never put historical full figures behind the atlas',()=>{
  const files=fs.readdirSync(dist).filter(p=>p.endsWith('.css')||p==='index.html'||p==='app.js');
  for(const filename of files){
    const body=fs.readFileSync(path.join(dist,filename),'utf8');
    assert.doesNotMatch(body,/(?:url\(\s*['"]?|(?:src|href)=["'])[^\n)'"]*assets\/(?:sailor\.|people\/)/,filename);
  }
});

test('a companion with a failed arrival sheet keeps his feet at the door and walks in after a retry',async()=>{
  let before=E.createGame();
  for(const [method,...args] of [
    ['interact','rope','take'],['interact','pole','take'],['combine','rope','pole'],
    ['useItem','loopPole','sail'],['travel','wreck'],['interact','prybar','take'],
    ['useItem','prybar','crate'],['travel','beach'],['useItem','axe','driftwood'],['travel','camp']
  ]) before=E[method](before,...args).state;
  const url='assets/walk/raynal.png';
  const ui=mount({[saved]:JSON.stringify(before)},s=>s.startsWith(url));
  await ui.flush(12);
  await ui.click(ui.item('canvas'));ui.target('shelter').onclick({stopPropagation(){}});
  for(let i=0;i<500 && !ui.target('raynal');i++) await ui.flush(1);
  assert(ui.target('raynal'));const foot=()=>ui.target('raynal').dataset.foot.split(',').map(Number);
  const stage=require('../dist/stage-direction.js'), door=stage.profile('camp').from.beach;
  assert.deepEqual(foot(),[door.x,door.y]);
  ui.latest(url).onerror();await ui.flush(150);
  assert.deepEqual(foot(),[door.x,door.y]);
  assert.equal(ui.ids.get('actor-raynal').dataset.workPose,'stand');
  const retry=ui.latest(url);assert.match(retry.url,/retry=/);retry.onload();
  await ui.flush(40);const station=stage.workStation('camp','raynal',ui.state());
  assert(foot()[0]>door.x && foot()[0]<station.x);
  assert.equal(ui.ids.get('actor-raynal').dataset.moving,'true');
  await ui.flush(500);assert.deepEqual(foot(),[station.x,station.y]);
  await ui.travel('exit_beach_camp');await ui.travel('exit_camp');
  assert.deepEqual(foot(),[station.x,station.y]);
});


test('the same player host changes from Alick to Musgrave at the harbour even if an old Alick paint arrives late',async()=>{
  const state=atChapter(5,true);
  const oldWork='assets/work-poses/player.png';
  const ui=mount({[saved]:JSON.stringify(state)},url=>url.startsWith(oldWork));
  await ui.flush(15);
  const didLoad=ui.latest(oldWork).onload;
  assert.equal(ui.layer('.walk-viewport').querySelector('image').getAttribute('href'),'assets/walk/player.png');
  await ui.click('chapter-exit');await ui.flush(80);
  assert.equal(ui.state().chapter,6);
  didLoad();await ui.flush(5);
  const sources=ui.host.querySelectorAll('image').map(el=>el.getAttribute('href'));
  assert.deepEqual(sources,['assets/walk/musgrave.png','assets/work-poses/musgrave.png']);
  assert.equal(ui.host.dataset.workPose,'stand');
});

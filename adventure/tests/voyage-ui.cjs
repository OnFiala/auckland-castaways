'use strict';
// Executes the actual campaign handlers with a deterministic DOM contract double.
// This does not emulate CSS layout, image rendering, native focus, audio or touch.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const dist=path.join(__dirname,'../dist'),harnessPath=path.join(__dirname,'ui-contract.cjs');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const appSource=fs.readFileSync(path.join(dist,'app.js'),'utf8');
const KEY=(appSource.match(/\bKEY=CAMPAIGN\?'([^']+)'/)||appSource.match(/\bKEY='([^']+)'/)||[])[1];
assert(KEY,'application save key');
const scriptFiles=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]).filter(f=>f!=='interface.js');
assert(scriptFiles.includes('voyage.js'),'published HTML must load the full campaign engine');
function harness(){
 let text=fs.readFileSync(harnessPath,'utf8'),cut=text.indexOf('async function main(');assert(cut>0,'base UI harness boundary');text=text.slice(0,cut);
 text=text.replace("const KEY='castaways-adventure-v3';",`const KEY=${JSON.stringify(KEY)};`);
 text=text.replace(/for\(const f of \[[^\]]+\]\)vm\.runInContext/,`for(const f of ${JSON.stringify(scriptFiles)})vm.runInContext`);
 text=text.replace('return{ids,stored,click,','return{context,document:doc,ids,stored,click,');
 const scope={require:createRequire(harnessPath),__dirname,console,module:{exports:{}}};
 vm.runInNewContext(text+'\nmodule.exports=app;',scope,{filename:harnessPath});return scope.module.exports;
}
const createUi=harness();
const canonical=value=>JSON.parse(JSON.stringify(value));
function engine(ui){return ui.context.AdventureEngine;}
function getChapter(s){return Number(s.chapter||1);}
function signature(s){return JSON.stringify([s.chapter,s.scene,s.inventory.slice().sort(),s.flags,s.completed,s.chapterComplete]);}
async function dismiss(ui){
 if(ui.ids.get('modal')?.open)await ui.click('modal-close');
 if(ui.ids.get('dialogue')&&!ui.ids.get('dialogue').hidden)await ui.click('dialogue-close');
 if(ui.ids.get('cancel-item')&&!ui.ids.get('cancel-item').hidden)await ui.click('cancel-item');
}
function route(E,s,destination){
 const pending=[{scene:s.scene,steps:[]}],seen=new Set([s.scene]);
 for(const at of pending){
  if(at.scene===destination)return at.steps;
  for(const exit of E.getExits({...s,scene:at.scene}))if(!seen.has(exit.to)){seen.add(exit.to);pending.push({scene:exit.to,steps:[...at.steps,exit.id]});}
 }
 throw Error(`No route from ${s.scene} to ${destination} in chapter ${s.chapter}`);
}
async function go(ui,destination){
 for(const exitId of route(engine(ui),ui.state(),destination)){await dismiss(ui);assert(ui.exit(exitId),`visible exit ${exitId}`);await ui.travel(exitId);ui.runTimers();}
 assert.equal(ui.state().scene,destination);
}
const workMoves={
 chest:['notch','near','press'], roof:['under','left','right','pour'], drill:['fresh','scratch','edge','reclaim'],
 hull:['middle','pack','pack','pitch'], rig:['clew','port','lull','haul'], chart:['origin','east','inlet','verify'], landing:['high','pay','crest','trough']
};
const worked=new Set();
async function doWork(ui){
 const bench=ui.ids.get('workbench');if(!bench.open)return;
 const id=bench.dataset.fwPuzzle,start=signature(ui.state());
 for(const move of workMoves[id]){
  const button=bench.querySelector(`[data-fw-point="${move}"]`);assert(button,`painted ${id} control ${move}`);await ui.click(button);
  assert.equal(signature(ui.state()),start,'the scene waits for completed physical work');
 }
 await ui.click(bench.querySelector('[data-fw-finish]'));assert.equal(bench.open,false);worked.add(id);
}
async function hintStep(ui){
 const E=engine(ui),before=ui.state(),h=E.hint(before);assert(h&&typeof h.text==='string');
 await dismiss(ui);await ui.click('hint');assert(ui.ids.get('modal').open);
 if(ui.ids.get('more-clue')){assert(!ui.ids.get('modal-body').innerHTML.includes('hint-icons'));await ui.click('more-clue');await ui.click('more-clue');}
 assert(ui.ids.get('modal-body').innerHTML.includes(h.text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')),'hint copy reaches UI');await ui.click('modal-close');
 if(h.sceneId!==ui.state().scene)await go(ui,h.sceneId);
 if(h.cue==='combine'){
  const pair=h.combineItems||['rope','pole'];assert.equal(pair.length,2,'two illustrated recipe ingredients');
  assert(ui.item(pair[0])&&ui.item(pair[1]),`hinted combination is in inventory: ${pair}`);await ui.click(ui.item(pair[0]));await ui.click(ui.item(pair[1]));
 }else if(h.itemId){assert(ui.item(h.itemId),`hinted tool ${h.itemId} is owned`);assert(ui.target(h.targetId),`hinted target ${h.targetId} exists`);await ui.use(h.itemId,h.targetId);
 }else{assert(ui.target(h.targetId),`hinted action ${h.targetId} exists`);await ui.pick(h.targetId);}
 await doWork(ui);
 assert.notEqual(signature(ui.state()),signature(before),`hint makes progress: chapter ${before.chapter}, ${h.text}`);
 assert(E.restore(ui.state()),'each real-handler state is valid');
}
// The exact in-world chapter passage is fixed by the application integration.
function passage(ui){return ui.ids.get('chapter-exit');}
async function advance(ui){
 await dismiss(ui);const before=ui.state();assert(before.chapterComplete,'chapter must be solved before passage');
 const control=passage(ui);assert(control&&!control.hidden,'solved chapter exposes its in-world passage');await ui.click(control);ui.runTimers();await ui.flush();
 for(let i=0;i<2&&ui.state().chapter===before.chapter;i++){assert.notEqual(ui.state().scene,before.scene,'the ordinary exit must lead toward the chapter departure');await ui.click(passage(ui));ui.runTimers();await ui.flush();}
 assert.equal(getChapter(ui.state()),getChapter(before)+1);assert.equal(ui.state().completed,false);assert.equal(ui.state().chapterComplete,false);
 assert.equal(ui.ids.get('completion').hidden,true,'intermediate chapters cannot show the final rescue ending');
}
const checkpoints=[];
test('real UI handlers complete all seven chapters with hints, inventory puzzles, travel and reloads',async()=>{
 let ui=createUi(),steps=0;assert.equal(engine(ui).VERSION,4);assert.equal(getChapter(ui.state()),1);
 const visits=new Set(),dialogues=new Set();
 while(!ui.state().completed&&steps++<160){
  const s=ui.state(),ch=getChapter(s);visits.add(ch);
  if(!dialogues.has(ch)){
   await ui.flush();const portrait=ui.ids.get('player-sprite').querySelector('image');assert(portrait,'protagonist has a painted image');
   const actorId=ch>=6?'musgrave':'player';
   assert.equal(portrait.attrs.href,ui.context.CastawayMotion.WALKS[actorId].file,'the return uses Captain Musgrave as the player');
   assert.match(portrait.attrs.href,new RegExp('^assets/walk/'+actorId+'\\.(png|webp)$'));
   const people=engine(ui).getTargets(ui.state()).filter(t=>t.kind==='person');
   if(ch>=6)assert(!people.some(t=>t.id==='musgrave'),'protagonist cannot appear again as a companion');
   if(people.length){const before=signature(ui.state());await ui.click(ui.target(people[0].id));assert.equal(ui.ids.get('dialogue').hidden,false);assert(ui.ids.get('dialogue-text').textContent.length>0);await ui.click('dialogue-close');if(ch<7)assert.equal(signature(ui.state()),before,'optional conversation does not gate progress');}
   dialogues.add(ch);
  }
  if(s.chapterComplete){checkpoints.push(canonical(s));await advance(ui);const saved=canonical(ui.stored),before=canonical(ui.state());ui=createUi({initial:saved});assert.deepEqual(canonical(ui.state()),before,'chapter arrival survives reload');continue;}
  await hintStep(ui);
  if(steps%5===0){const before=canonical(ui.state());ui=createUi({initial:canonical(ui.stored)});assert.deepEqual(canonical(ui.state()),before,'partly solved chapter survives reload');}
 }
 assert(ui.state().completed,'full rescue must be reachable in fewer than160 meaningful actions');assert.equal(getChapter(ui.state()),7);assert.deepEqual([...visits],[1,2,3,4,5,6,7]);
 assert.deepEqual([...worked],Object.keys(workMoves));checkpoints.push(canonical(ui.state()));ui.runTimers();assert.equal(ui.ids.get('completion').hidden,false,'final rescue is visibly presented');
 console.log(JSON.stringify({campaignUi:true,chapters:[...visits],progressStepsIncludingPassages:steps,chapterCheckpoints:checkpoints.length,midCampaignReloads:true,protagonistSwitch:true,limitation:'DOM contract only; no browser rendering or animation playback.'}));
});

test('a completed version-3 save imports as chapter one, preserving the way into winter',async()=>{
 const B=require('../dist/engine.js');let s=B.createGame();
 for(const [method,...args]of [['interact','rope','take'],['interact','pole','take'],['combine','rope','pole'],['useItem','loopPole','sail'],['travel','wreck'],['interact','prybar','take'],['useItem','prybar','crate'],['travel','beach'],['useItem','axe','driftwood'],['travel','camp'],['useItem','canvas','shelter'],['useItem','firewood','hearth'],['useItem','tinderbox','hearth'],['useItem','loopPole','cairn'],['useItem','flagcloth','cairn']])s=B[method](s,...args).state;
 assert(s.completed&&s.version===3);const ui=createUi({initial:{'castaways-adventure-v3':JSON.stringify(s)}});assert.equal(ui.state().version,4);assert.equal(getChapter(ui.state()),1);assert(ui.state().chapterComplete);assert(!ui.state().completed);await advance(ui);assert.equal(getChapter(ui.state()),2);
});

test('chapter passage cannot skip unfinished work and wrong tools do not consume inventory',async()=>{
 const ui=createUi();await ui.pick('rope');const before=canonical(ui.state()),control=passage(ui);
 assert(control?.hidden||control?.disabled,'unfinished chapter passage must not invite skipping');
 if(control?.onclick){await ui.click(control);assert.deepEqual(canonical(ui.state()),before);}
 await ui.use('rope','driftwood');assert.deepEqual(canonical(ui.state()),before);assert(ui.item('rope'));
});

function fixture(chapter,finished=false){
 const E=require('../dist/voyage.js');let s=E.createGame();
 for(let i=0;i<160;i++){
  if(getChapter(s)===chapter&&(!finished||s.chapterComplete))return s;
  if(s.chapterComplete){s=E.advance(s).state;continue;}
  const h=E.hint(s);
  for(const id of route(E,s,h.sceneId)){const exit=E.getExits(s).find(e=>e.id===id);s=E.travel(s,exit.to).state;}
  s=h.cue==='combine'?E.combine(s,...h.combineItems).state:h.itemId?E.useItem(s,h.itemId,h.targetId).state:E.interact(s,h.targetId,'use').state;
 }
 throw Error('Fixture route did not finish');
}

test('the saved finale reopens, credits remain readable, and restart cancels old ending state',async()=>{
 const ui=createUi({initial:{[KEY]:JSON.stringify(fixture(7,true))}});await ui.flush();assert(ui.state().completed);assert.equal(ui.ids.get('completion').hidden,false);assert.match(ui.ids.get('completion-title').textContent,/all five/i);
 assert.equal(ui.ids.get('ending-portraits').querySelectorAll('img').length,5);
 await ui.click('credits');assert(ui.ids.get('modal').open);assert.match(ui.ids.get('modal-body').innerHTML,/Invercauld/);await ui.click('modal-close');
 await ui.click('keep-exploring');assert(ui.ids.get('completion').hidden);assert.equal(getChapter(ui.state()),7);
 await ui.click('new-game');assert(ui.ids.get('modal').open);await ui.click('confirm-restart');ui.runTimers();assert.equal(getChapter(ui.state()),1);assert.equal(ui.state().completed,false);assert.equal(ui.state().chapterComplete,false);assert.deepEqual(canonical(ui.state().inventory),[]);assert(ui.ids.get('completion').hidden);
});

test('journey map shows seven chapters but cannot skip unsolved work',async()=>{
 const ui=createUi({initial:{[KEY]:JSON.stringify(fixture(4))}}),before=canonical(ui.state());await ui.click('journey');
 const markup=ui.ids.get('modal-body').innerHTML;assert.equal((markup.match(/<li\b/g)||[]).length,7);assert.match(markup,/class="current"/);assert(!/<button\b/.test(markup),'chapter map has no skip controls');
 for(const c of engine(ui).CHAPTERS)assert(markup.includes(c.title));await ui.click('modal-close');assert.deepEqual(canonical(ui.state()),before);
});

test('settings interrupt a chapter departure without advancing or trapping the passage',async()=>{
 const ui=createUi({initial:{[KEY]:JSON.stringify(fixture(1,true))}}),before=canonical(ui.state());
 passage(ui).onclick({stopPropagation(){}});await ui.click('settings');assert(ui.ids.get('modal').open);assert.deepEqual(canonical(ui.state()),before);
 await ui.click('modal-close');await advance(ui);assert.equal(getChapter(ui.state()),2);
});

test('every campaign inventory item resolves to an existing painted crop',()=>{
 const ui=createUi(),E=engine(ui),A=ui.context.AdventureArt;
 for(const id of Object.keys(E.ITEMS)){
  const art=A.props[id];assert(art,`painted item ${id}`);assert(Array.isArray(art.box)&&art.box.length===4,`crop ${id}`);assert(fs.existsSync(path.join(dist,art.file)),`source image ${id}`);
  const [x,y,w,h]=art.box;assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=art.width&&y+h<=art.height,`bounded crop ${id}`);
 }
});

test('optional room interactions give a repeatable material response while preserving all voyage progress',async()=>{
 const ui=createUi(),before=canonical(ui.state()),life=ui.context.CastawayLife;
 const [feature]=life.features(before);assert(feature&&feature.kind==='feature');
 await ui.click(ui.target(feature.id));assert.deepEqual(canonical(ui.state()),before);
 assert.equal(ui.ids.get('caption').textContent,feature.observation);
 await ui.click('inspect-mode');assert.equal(ui.ids.get('inspect-mode').attrs['aria-pressed'],'true');
 await ui.click(ui.target(feature.id));assert.equal(ui.ids.get('inspect-mode').attrs['aria-pressed'],'false');
 assert.deepEqual(canonical(ui.state()),before);
});

test('standing back from the chest keeps tools and unfinished work through a complete game reload',async()=>{
 let ui=createUi();await go(ui,'wreck');await ui.pick('prybar');await ui.use('prybar','crate');
 let bench=ui.ids.get('workbench');assert(bench.open);await ui.click(bench.querySelector('[data-fw-point="notch"]'));
 await ui.click(bench.querySelector('[data-fw-close]'));assert(!ui.state().flags.crateOpen);assert(ui.item('prybar'));
 ui=createUi({initial:canonical(ui.stored)});await ui.use('prybar','crate');bench=ui.ids.get('workbench');
 assert(!bench.querySelector('[data-fw-point="notch"]'));await ui.click(bench.querySelector('[data-fw-point="near"]'));
 await ui.click(bench.querySelector('[data-fw-point="press"]'));assert(!ui.state().flags.crateOpen);
 await ui.click(bench.querySelector('[data-fw-finish]'));assert(ui.state().flags.crateOpen);assert(ui.item('axe')&&ui.item('tinderbox'));
});

test('a saved sailing puzzle restores the painting and its physical weather response after each repair', async () => {
 const initial = fixture(5);
 let ui = createUi({initial:{[KEY]:JSON.stringify(initial)}});
 const expectedPlates = new Set();
 while (!ui.state().chapterComplete) {
  await hintStep(ui);
  const state = ui.state();
  const flags = state.flags;
  const plate = flags.sailMended ? 'crossing-safe' : flags.boatDry ? 'crossing-bailed' : 'crossing-wet';
  const rig = flags.sailMended ? 'patched canvas' : flags.rigSecured ? 'secured shroud' : 'loose shroud';
  assert.ok(ui.ids.get('backdrop').style.backgroundImage.includes(plate + '.'), plate);
  assert.equal(ui.ids.get('place-weather').dataset.wxRig, rig);
  assert.equal(ui.ids.get('scene').getAttribute('aria-description'), 'Cold squalls on the crossing');
  if (!expectedPlates.has(plate)) {
   ui = createUi({initial:{[KEY]:JSON.stringify(state)}});
   assert.ok(ui.ids.get('backdrop').style.backgroundImage.includes(plate + '.'));
   assert.equal(ui.ids.get('place-weather').dataset.wxRig, rig);
   expectedPlates.add(plate);
  }
 }
 assert.deepEqual([...expectedPlates], ['crossing-wet','crossing-bailed','crossing-safe']);
});

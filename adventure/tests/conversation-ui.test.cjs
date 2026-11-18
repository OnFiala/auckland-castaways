'use strict';
// Production HTML, game scripts, event handlers and animation frames in the shared DOM double.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {app} = require('./ui-contract.cjs');
const E = require('../dist/voyage.js');
const Stage = require('../dist/stage-direction.js');
const html = fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
const scripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g), m => m[1])
  .filter(name => name !== 'interface.js'); // Decorative fittings are covered by interface-art.
const saveKey = 'castaways-adventure-v4';
const prefKey = 'castaways-adventure-prefs';
function mount(initial = {}, speech = null) { return app({initial,scripts,saveKey,speech}); }

function talker(ui,id,name,progress) {
  const rail = ui.ids.get('dialogue');
  assert.equal(rail.hidden,false);
  assert.equal(rail.dataset.speaker,id);
  assert.equal(ui.ids.get('dialogue-speaker').textContent,name);
  assert.equal(ui.ids.get('dialogue-portrait').getAttribute('src'),'assets/cast-portraits/'+id+'.webp');
  assert.equal(ui.ids.get('dialogue-progress').textContent,progress);
}
function foot(ui,id) {
  const value = ui.target(id)?.dataset.foot;
  assert(value,'visible foot for '+id);
  return value.split(',').map(Number);
}

test('the opening swaps faces, marks the person speaking and clears stale audio when interrupted',async()=>{
  const spoken=[];
  const speech={synth:{cancel(){},getVoices(){return [];},speak(line){spoken.push(line);}},Utterance:function(text){this.text=text;}};
  const ui=mount({[prefKey]:JSON.stringify({narration:true})},speech);
  await ui.flush(1);
  talker(ui,'raynal','François Raynal','1 / 3');
  assert(ui.target('raynal').classList.contains('speaking'));
  assert(!ui.ids.get('player').classList.contains('speaking'));
  await ui.click('dialogue-next');
  talker(ui,'player','You · Alick McLaren','2 / 3');
  assert(ui.ids.get('player').classList.contains('speaking'));
  assert(!ui.target('raynal').classList.contains('speaking'));
  const oldVoice=spoken.at(-1);
  await ui.click('dialogue-pause');
  oldVoice.onend();ui.runTimers();
  talker(ui,'player','You · Alick McLaren','2 / 3');
  ui.key('Escape');ui.runTimers();await ui.flush(1);
  assert(ui.ids.get('dialogue').hidden);
  assert.equal(ui.ids.get('inventory-bar').inert,false);
  await ui.click(ui.target('raynal'));
  talker(ui,'raynal','François Raynal','1 / 3');
  oldVoice.onend();
  await ui.travel('exit_wreck');
  assert(ui.ids.get('dialogue').hidden);
  await ui.click(ui.target('musgrave'));
  talker(ui,'musgrave','Thomas Musgrave','1 / 3');
  await ui.click('dialogue-next');
  talker(ui,'player','You · Alick McLaren','2 / 3');
  const reloaded=mount(ui.stored);
  assert(reloaded.ids.get('dialogue').hidden);
});

function beforeCampJob(id) {
  let state=E.createGame();
  const steps=[
    ['interact','rope','take'], ['interact','pole','take'], ['combine','rope','pole'],
    ['useItem','loopPole','sail'], ['travel','wreck'], ['interact','prybar','take'],
    ['useItem','prybar','crate'], ['travel','beach'], ['useItem','axe','driftwood'], ['travel','camp']
  ];
  if(id==='musgrave')steps.push(['useItem','canvas','shelter'], ['useItem','firewood','hearth'],
    ['useItem','tinderbox','hearth'], ['useItem','loopPole','cairn']);
  for(const [method,...args] of steps)state=E[method](state,...args).state;
  assert(E.restore(state));
  return state;
}

async function doJobAndWatch(ui,actor,item,target) {
  assert(!ui.target(actor));
  await ui.click(ui.item(item));
  ui.target(target).onclick({stopPropagation(){}});
  for(let i=0;i<500 && !ui.target(actor);i++)await ui.flush(1);
  return foot(ui,actor);
}

for(const [actor,item,target] of [['raynal','canvas','shelter'],['musgrave','flagcloth','cairn']]){
  test(actor+' comes in at the beach door on the live job and is already sheltered on reload',async()=>{
    const before=beforeCampJob(actor), saved={[saveKey]:JSON.stringify(before)};
    const ui=mount(saved), door=Stage.profile('camp').from.beach;
    assert.deepEqual(await doJobAndWatch(ui,actor,item,target),[door.x,door.y]);
    const station=Stage.workStation('camp',actor,ui.state());
    const end=[station.x,station.y];
    await ui.flush(40);
    const [x]=foot(ui,actor);
    assert(x>door.x && x<station.x,'intermediate physical foot, not a jump between two positions');
    assert.equal(ui.ids.get('actor-'+actor).dataset.moving,'true');
    const restored=mount(ui.stored);
    assert.deepEqual(foot(restored,actor),end,'correct before the first frame');
    await ui.flush(500);
    assert.deepEqual(foot(ui,actor),end);
    assert.equal(ui.ids.get('actor-'+actor).dataset.moving,'false');
    await ui.travel('exit_beach_camp');
    assert(!ui.target('raynal'));
    await ui.travel('exit_camp');
    assert.deepEqual(foot(ui,actor),end);
    assert.equal(ui.ids.get('actor-'+actor).dataset.moving,'false');
    const reduced=mount({...saved,[prefKey]:JSON.stringify({reduced:true})});
    assert.deepEqual(await doJobAndWatch(reduced,actor,item,target),end);
  });
}

function returnState() {
  let state=E.createGame();
  for(let i=0; i<180 && state.chapter<7; i++){
    const h=E.hint(state);
    if(state.chapterComplete)state=E.advance(state).state;
    else if(state.scene!==h.sceneId){
      const step=E.travel(state,h.sceneId);
      state=step.changed ? step.state : E.travel(state,'beach').state;
    } else if(h.combineItems)state=E.combine(state,...h.combineItems).state;
    else if(h.itemId)state=E.useItem(state,h.itemId,h.targetId).state;
    else state=E.interact(state,h.targetId,'use').state;
  }
  assert.equal(state.chapter,7);
  return E.travel(state,'return_camp').state;
}
test('in the reunion the captain answers George as the player, and a second visit remembers the first',async()=>{
  const ui=mount({[saveKey]:JSON.stringify(returnState())});
  await ui.click(ui.target('george'));
  talker(ui,'george','George Harris','1 / 3');
  const first=ui.ids.get('dialogue-text').textContent;
  assert.match(first,/Alick and Raynal/);
  assert(ui.state().flags.georgeFound);
  await ui.click('dialogue-next');
  talker(ui,'musgrave','You · Thomas Musgrave','2 / 3');
  assert(ui.ids.get('player').classList.contains('speaking'));
  assert(!ui.target('musgrave'));
  await ui.click('dialogue-close');
  await ui.click(ui.target('george'));
  assert.notEqual(ui.ids.get('dialogue-text').textContent,first);
});

function chapterStarts(){
  const starts=new Map();
  let state=E.createGame();
  for(let step=0; step<200 && !state.completed; step++){
    if(!starts.has(state.chapter))starts.set(state.chapter,state);
    const hint=E.hint(state);
    if(state.chapterComplete)state=E.advance(state).state;
    else if(state.scene!==hint.sceneId){
      const result=E.travel(state,hint.sceneId);
      state=result.changed?result.state:E.travel(state,'beach').state;
    } else if(hint.combineItems)state=E.combine(state,...hint.combineItems).state;
    else if(hint.itemId)state=E.useItem(state,hint.itemId,hint.targetId).state;
    else state=E.interact(state,hint.targetId,'use').state;
  }
  assert.equal(starts.size,7);
  return starts;
}

test('each painted room names itself once and leaves the command line for the object under consideration',async()=>{
  const starts=chapterStarts();
  assert.equal(E.SCENES.length,14);
  for(const scene of E.SCENES){
    const state={...starts.get(scene.chapter),scene:scene.id};
    assert(E.restore(state));
    const ui=mount({[saveKey]:JSON.stringify(state)});
    await ui.flush(2);
    const label=ui.ids.get('action-label');
    assert.equal(label.textContent,'',scene.id);
    assert(ui.ids.get('scene-label').textContent);
    const first=E.getTargets(state)[0], button=ui.target(first.id);
    button.onmouseenter();assert.equal(label.textContent,first.name);
    button.onmouseleave();assert.equal(label.textContent,'');
    button.focus();assert.equal(label.textContent,first.name);
    const exit=E.getExits(state)[0];
    if(exit){
      ui.exit(exit.id).onmouseenter();assert.equal(label.textContent,exit.name);
      ui.exit(exit.id).onmouseleave();assert.equal(label.textContent,first.name);
    }
    ui.ids.get('scene').focus();assert.equal(label.textContent,'');
    if(scene.id==='harbour'){
      assert.equal(ui.ids.get('scene-label').textContent,'Invercargill Wharf');
      const raynal=ui.ids.get('person-raynal');
      raynal.focus();assert.equal(label.textContent,'François Raynal');
    }
    if(scene.id==='cabin'){
      await ui.click(ui.item('tinderbox'));assert.equal(label.textContent,E.ITEMS.tinderbox.name);
      button.onmouseenter();assert.equal(label.textContent,E.ITEMS.tinderbox.name+' → '+first.name);
      button.onmouseleave();assert.equal(label.textContent,E.ITEMS.tinderbox.name);
      await ui.click('cancel-item');assert.equal(label.textContent,'');
      await ui.click('inspect-mode');assert.equal(label.textContent,'Examine');
      await ui.click('inspect-mode');assert.equal(label.textContent,'');
    }
  }
});

test('Settings reads the published release identifier independently of the save format',async()=>{
  const tag=html.match(/<meta\s+name="game-release"\s+content="([^"]+)"/i);
  assert(tag,'release metadata in the published document');
  const ui=mount();
  const meta={content:tag[1]};
  ui.context.document.head={querySelector(selector){return selector==='meta[name="game-release"]'?meta:null;}};
  await ui.click('settings');
  assert(ui.ids.get('modal-body').innerHTML.includes('Game release '+tag[1]));
  meta.content='27';
  await ui.click('toggle-captions');
  assert(ui.ids.get('modal-body').innerHTML.includes('Game release 27'));
  assert.equal(ui.state().version,4);
});

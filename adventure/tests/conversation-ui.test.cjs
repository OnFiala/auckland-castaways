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

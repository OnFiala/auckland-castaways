'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/engine.js');
function apply(s,method,...args){const result=E[method](s,...args);assert(result&&typeof result.text==='string');assert(result.text.length<160);assert(E.restore(result.state),'every transition must create a restorable state');return result.state;}
const A=(s,id,verb='take')=>apply(s,'interact',id,verb);
const U=(s,item,target)=>apply(s,'useItem',item,target);
const T=(s,scene)=>apply(s,'travel',scene);
function tool(s=E.createGame()){s=A(s,'rope');s=A(s,'pole');return apply(s,'combine','rope','pole');}
function canvas(s=tool()){return U(s,'loopPole','sail');}
function tools(s){s=T(s,'wreck');s=A(s,'prybar');s=U(s,'prybar','crate');return T(s,'beach');}
function finish(s=canvas()){
 s=tools(s);s=U(s,'axe','driftwood');s=T(s,'camp');s=U(s,'canvas','shelter');s=U(s,'firewood','hearth');s=U(s,'tinderbox','hearth');s=U(s,'loopPole','cairn');s=U(s,'flagcloth','cairn');return s;
}
test('the complete three-location inventory puzzle resolves shelter, fire and signal',()=>{
 const s=finish();assert.equal(s.completed,true);assert.equal(s.scene,'camp');assert(s.flags.shelterBuilt&&s.flags.fireLit&&s.flags.signalRaised);assert.deepEqual(s.inventory.sort(),['axe','prybar','tinderbox']);assert(s.actions>=12);
});
test('early use of the essential tool as a mast can be reversed without a deadlock',()=>{
 let s=tool();s=T(s,'camp');s=U(s,'loopPole','cairn');assert.equal(s.inventory.includes('loopPole'),false);assert.equal(E.hint(s).targetId,'cairn');
 s=A(s,'cairn','use');assert(s.inventory.includes('loopPole'));assert.equal(s.flags.mastRaised,false);s=T(s,'beach');s=canvas(s);assert.equal(finish(s).completed,true);
});
test('combining the two parts is order independent and never mutates input',()=>{
 let s=A(A(E.createGame(),'rope'),'pole');const before=JSON.stringify(s);const a=E.combine(s,'rope','pole'),b=E.combine(s,'pole','rope');assert.deepEqual(a.state,b.state);assert.equal(JSON.stringify(s),before);assert.deepEqual(a.consumed,['rope','pole']);assert.deepEqual(a.gained,['loopPole']);
});
test('incorrect combinations and item uses preserve the essential inventory',()=>{
 const s=tool();const before=JSON.stringify(s);for(const r of [E.combine(s,'loopPole','loopPole'),E.useItem(s,'loopPole','driftwood'),E.useItem(s,'axe','crate')]){assert.equal(r.changed,false);assert.deepEqual(r.state,s);}assert.equal(JSON.stringify(s),before);
});
test('a closed crate opens once and only with an owned lever in the correct location',()=>{
 let s=E.createGame();assert.equal(E.useItem(s,'prybar','crate').changed,false);s=T(s,'wreck');s=A(s,'prybar');s=U(s,'prybar','crate');assert(s.flags.crateOpen);const again=E.useItem(s,'prybar','crate');assert.equal(again.changed,false);assert.equal(s.inventory.filter(id=>id==='axe').length,1);assert(s.inventory.includes('tinderbox'));
});
test('fire requires dry fuel and shelter, with distinct visual clues',()=>{
 let s=tools(E.createGame());s=T(s,'camp');let r=E.useItem(s,'tinderbox','hearth');assert.equal(r.cue,'firewood');assert.equal(r.changed,false);
 s=T(s,'beach');s=U(s,'axe','driftwood');s=T(s,'camp');s=U(s,'firewood','hearth');r=E.useItem(s,'tinderbox','hearth');assert.equal(r.cue,'canvas');assert.equal(r.changed,false);assert(s.inventory.includes('tinderbox'));assert(s.flags.firewoodPlaced);
 s=T(s,'beach');s=canvas(tool(s));s=T(s,'camp');s=U(s,'canvas','shelter');s=U(s,'tinderbox','hearth');assert(s.flags.fireLit);
});
test('signalling can be solved before fire without consuming a still-needed item',()=>{
 let s=canvas();s=T(s,'camp');s=U(s,'canvas','shelter');const r=E.useItem(s,'flagcloth','cairn');assert.equal(r.cue,'loopPole');assert.equal(r.changed,false);assert(r.state.inventory.includes('flagcloth'));
 s=U(s,'loopPole','cairn');s=U(s,'flagcloth','cairn');assert(s.flags.signalRaised);assert(!s.completed);s=T(s,'beach');s=tools(s);s=U(s,'axe','driftwood');s=T(s,'camp');s=U(s,'firewood','hearth');s=U(s,'tinderbox','hearth');assert(s.completed);
});
test('world targets reflect taken objects and reconstructed shelter remains inspectable',()=>{
 let s=E.createGame();assert(E.getTargets(s).some(t=>t.id==='rope'));s=A(s,'rope');assert(!E.getTargets(s).some(t=>t.id==='rope'));assert.equal(E.interact(s,'rope','take').changed,false);s=A(s,'pole');s=apply(s,'combine','rope','pole');s=canvas(s);assert(!E.getTargets(s).some(t=>t.id==='sail'));s=T(s,'camp');s=U(s,'canvas','shelter');assert(E.getTargets(s).some(t=>t.id==='shelter'));assert.equal(E.interact(s,'shelter','look').cue,'done');
});
test('travel respects links and remote objects cannot be used through another scene',()=>{
 let s=E.createGame();assert.equal(E.interact(s,'crate','look').changed,false);s=T(s,'wreck');assert.equal(E.travel(s,'camp').changed,false);assert.equal(E.travel(s,'nowhere').changed,false);assert.equal(E.interact(s,'exit_beach_wreck','use').state.scene,'beach');
});
test('inspection and conversations are short optional clues, not progression choices',()=>{
 const s=E.createGame();for(const id of ['raynal','rope','sail']){const r=E.interact(s,id,id==='raynal'?'talk':'look');assert.equal(r.changed,false);assert.deepEqual(r.state,s);assert.equal(typeof r.cue,'string');assert(r.text.length<160);}assert.equal(E.interact(s,'rope','talk').cue,'wrong');
});
test('all genuine saves round-trip and corrupted essential-item states are rejected',()=>{
 const done=finish();assert.deepEqual(E.restore(JSON.parse(JSON.stringify(done))),done);assert.equal(E.restore(null),null);assert.equal(E.restore({...done,version:1}),null);assert.equal(E.restore({...done,scene:'unknown'}),null);
 const s=tool();assert.equal(E.restore({...s,inventory:[]}),null);assert.equal(E.restore({...s,inventory:['loopPole','loopPole']}),null);assert.equal(E.restore({...s,completed:true}),null);assert.equal(E.restore({...s,flags:{...s.flags,fireLit:true}}),null);
 const broken=tools(E.createGame());assert.equal(E.restore({...broken,inventory:broken.inventory.filter(id=>id!=='axe')}),null);
});
test('hints lead from each meaningful stage to an actionable world or inventory target',()=>{
 let s=E.createGame();assert.equal(E.hint(s).targetId,'rope');s=A(s,'rope');assert.equal(E.hint(s).targetId,'pole');s=A(s,'pole');assert.equal(E.hint(s).cue,'combine');s=apply(s,'combine','rope','pole');assert.equal(E.hint(s).targetId,'sail');s=canvas(s);assert.equal(E.hint(s).targetId,'shelter');assert.equal(E.hint(finish(s)).cue,'done');
});
test('every reachable puzzle state has a route to completion, including all valid item orderings',()=>{
 const key=s=>JSON.stringify([s.scene,s.inventory.slice().sort(),E.FLAGS.map(k=>s.flags[k]),s.completed]);
 const states=[E.createGame()],ids=new Map([[key(states[0]),0]]),reverse=[[]],goals=[];
 for(let i=0;i<states.length;i++){
  const s=states[i];assert(E.restore(s));if(s.completed){goals.push(i);continue;}
  const responses=[];
  for(const scene of E.SCENES)responses.push(E.travel(s,scene.id));
  for(const target of E.getTargets(s)){
   responses.push(E.interact(s,target.id,'take'),E.interact(s,target.id,'use'));
   for(const item of s.inventory)responses.push(E.useItem(s,item,target.id));
  }
  for(let a=0;a<s.inventory.length;a++)for(let b=a+1;b<s.inventory.length;b++)responses.push(E.combine(s,s.inventory[a],s.inventory[b]));
  for(const r of responses){if(!r.changed)continue;const k=key(r.state);let to=ids.get(k);if(to===undefined){to=states.length;ids.set(k,to);states.push(r.state);reverse.push([]);}reverse[to].push(i);}
  assert(states.length<20000,'unexpected unbounded state space');
 }
 const reachable=new Set(goals),queue=[...goals];for(const id of queue)for(const before of reverse[id])if(!reachable.has(before)){reachable.add(before);queue.push(before);}
 assert(states.length>100,'must explore real alternative puzzle orderings');assert.equal(reachable.size,states.length,'some reachable state cannot reach the finale');
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/voyage.js'),Base=require('../dist/engine.js');
function route(state,destination){
 const queue=[[state.scene,[]]],seen=new Set([state.scene]);
 for(const [scene,path]of queue){
  if(scene===destination)return path;
  for(const exit of E.SCENES.find(s=>s.id===scene).exits){
   if(!seen.has(exit.to)){seen.add(exit.to);queue.push([exit.to,[...path,exit.to]]);}
  }
 }
 throw Error('No route to '+destination);
}
function hinted(state){
 if(state.chapterComplete)return E.advance(state);
 const h=E.hint(state);
 if(state.scene!==h.sceneId)return E.travel(state,route(state,h.sceneId)[0]);
 if(h.combineItems)return E.combine(state,...h.combineItems);
 if(h.itemId)return E.useItem(state,h.itemId,h.targetId);
 return E.interact(state,h.targetId,'use');
}
function solve(){
 let state=E.createGame();const starts=[state],snapshots=[state],responses=[];
 for(let i=0;i<180&&!state.completed;i++){
  const result=hinted(state);assert(result.changed,`chapter ${state.chapter}: ${result.text}`);
  assert(E.restore(result.state),`unrestorable state after ${result.text}`);
  assert(result.text.length<170,'responses stay short');
  if(result.chapterChanged)starts.push(result.state);
  responses.push(result);state=result.state;snapshots.push(state);
 }
 assert(state.completed,'the complete adventure must end');return {state,starts,snapshots,responses};
}
const solved=solve();
test('all seven chapters form a playable inventory adventure ending with the rescue',()=>{
 assert.equal(solved.starts.length,7);assert.equal(solved.state.chapter,7);assert.equal(solved.state.flags.menRescued,true);
 assert(solved.state.flags.drillFailed&&solved.state.flags.boatSealed&&solved.state.flags.courseSet);
 assert(solved.state.actions>=80);assert(solved.responses.filter(r=>r.chapterChanged).length===6);
 for(const s of solved.snapshots)assert.deepEqual(E.restore(JSON.parse(JSON.stringify(s))),s);
});
test('unfinished and completed version-3 saves import without discarding progress',()=>{
 let old=Base.createGame();old=Base.interact(old,'rope','take').state;
 let imported=E.restore(old);assert.equal(imported.version,4);assert.equal(imported.chapter,1);assert.deepEqual(imported.inventory,['rope']);assert(!imported.completed);
 const first=solved.snapshots.find(s=>s.chapter===1&&s.chapterComplete);
 old={version:3,scene:first.scene,inventory:first.inventory,flags:Object.fromEntries(Base.FLAGS.map(f=>[f,first.flags[f]])),log:first.log,completed:true,actions:first.actions};
 imported=E.restore(old);assert(imported.chapterComplete);assert(!imported.completed);assert.equal(E.advance(imported).state.chapter,2);
});
test('chapter gates and scene links cannot skip work or enter another time period',()=>{
 for(const start of solved.starts){
  assert.equal(E.advance(start).changed,false);
  const outside=E.SCENES.find(scene=>scene.chapter!==start.chapter);assert.equal(E.travel(start,outside.id).changed,false);
  assert(E.getExits(start).every(exit=>E.SCENES.find(scene=>scene.id===exit.to).chapter===start.chapter));
 }
 const end=solved.state;assert.equal(E.advance(end).changed,false);assert.equal(E.advance(end).state.chapter,7);
});
test('the failed drill returns material for the smaller-boat plan without a deadlock',()=>{
 const trial=solved.snapshots.find(s=>s.chapter===3&&s.flags.drillForged&&!s.flags.drillFailed);
 assert(trial.inventory.includes('drillBlank'));assert(!trial.inventory.includes('ironScrap'));
 const failed=E.useItem(trial,'drillBlank','testBlock');assert(failed.changed);assert(failed.state.flags.drillFailed);assert(failed.state.inventory.includes('ironScrap'));
 const nails=E.useItem(failed.state,'ironScrap','anvil');assert(nails.changed);assert(nails.state.inventory.includes('boatNails'));assert(nails.state.chapterComplete);
 assert.equal(E.useItem(nails.state,'ironScrap','anvil').changed,false);
});
test('wrong uses preserve owned items and crafted combinations are order independent',()=>{
 for(const s of solved.snapshots){
  if(!s.inventory.length)continue;
  const before=JSON.stringify(s),item=s.inventory[0];
  const wrong=E.useItem(s,item,'nonexistent');assert(!wrong.changed);assert.deepEqual(wrong.state,s);assert.equal(JSON.stringify(s),before);
 }
 for(const [chapter,a,b]of [[2,'hide','twine'],[3,'leather','metalPipe'],[4,'oakum','resin'],[6,'chart','journal']]){
  const s=solved.snapshots.find(s=>s.chapter===chapter&&s.inventory.includes(a)&&s.inventory.includes(b));assert(s);
  assert.deepEqual(E.combine(s,a,b).state,E.combine(s,b,a).state);
 }
});
test('save validation rejects missing essential items, impossible work and future chapter flags',()=>{
 assert.equal(E.restore(null),null);assert.equal(E.restore({...solved.state,version:99}),null);
 for(const start of solved.starts){
  assert.equal(E.restore({...start,completed:true}),null);
  assert.equal(E.restore({...start,inventory:['unknown']}),null);
  if(start.chapter<7)assert.equal(E.restore({...start,flags:{...start.flags,menRescued:true}}),null);
 }
 const held=solved.snapshots.find(s=>s.chapter===4&&s.inventory.includes('caulking'));
 assert.equal(E.restore({...held,inventory:held.inventory.filter(i=>i!=='caulking')}),null);
 const sea=solved.starts[4];assert.equal(E.restore({...sea,flags:{...sea.flags,boatDry:true,rigSecured:true}}),null);
 const fake={...solved.starts[2],flags:{...solved.starts[2].flags,nailsForged:true},inventory:['tinderbox','boatNails'],chapterComplete:false};assert.equal(E.restore(fake),null);
});
test('the return chapter has the two waiting men and no duplicate captain',()=>{
 const back=E.SCENES.filter(s=>s.chapter===7).flatMap(s=>s.targets.filter(t=>t.kind==='person').map(t=>t.id));
 assert.deepEqual(back.sort(),['george','henry']);
 const crossing=E.SCENES.find(s=>s.id==='crossing').targets.filter(t=>t.kind==='person').map(t=>t.id);assert.deepEqual(crossing.sort(),['musgrave','raynal']);
 assert.equal(E.SCENES.filter(s=>s.chapter===6).flatMap(s=>s.targets.filter(t=>t.kind==='person')).length,0);
});
test('every reachable state in each chapter can reach its exit without losing a critical object',()=>{
 const counts=[];
 for(const start of solved.starts){
  const key=s=>JSON.stringify([s.scene,s.inventory.slice().sort(),E.FLAGS.map(f=>s.flags[f]),s.chapterComplete]);
  const states=[start],indices=new Map([[key(start),0]]),reverse=[[]],goals=[];
  for(let i=0;i<states.length;i++){
   const s=states[i];assert(E.restore(s),`invalid reachable save chapter ${s.chapter}`);
   if(s.chapterComplete){goals.push(i);continue;}
   const responses=E.getExits(s).map(e=>E.travel(s,e.to));
   for(const target of E.getTargets(s)){
    responses.push(E.interact(s,target.id,'use'),E.interact(s,target.id,'talk'));
    for(const item of s.inventory)responses.push(E.useItem(s,item,target.id));
   }
   for(let a=0;a<s.inventory.length;a++)for(let b=a+1;b<s.inventory.length;b++)responses.push(E.combine(s,s.inventory[a],s.inventory[b]));
   for(const r of responses){
    if(!r.changed)continue;const k=key(r.state);let to=indices.get(k);
    if(to===undefined){to=states.length;indices.set(k,to);states.push(r.state);reverse.push([]);}reverse[to].push(i);
   }
   assert(states.length<25000,'unexpected unbounded state space');
  }
  const reachable=new Set(goals),queue=[...goals];
  for(const goal of queue)for(const before of reverse[goal])if(!reachable.has(before)){reachable.add(before);queue.push(before);}
  assert.equal(reachable.size,states.length,`chapter ${start.chapter} contains a dead end`);counts.push(states.length);
 }
 assert.equal(counts[0],172,'chapter one preserves its original puzzle graph');
 console.log('Reachable states by chapter: '+counts.join(', '));
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const plan=(musgrave,raynal,alick,george,henry)=>({musgrave,raynal,alick,george,henry});
const all=task=>Object.fromEntries(E.PEOPLE.map(p=>[p.id,task]));
const SCHEDULE=[
  plan('fuel','project','project','forage','camp'),
  plan('fuel','rest','rest','forage','camp'),
  plan('fuel','project','project','forage','camp'),
  plan('forage','rest','rest','fuel','camp'),
  plan('camp','rest','fuel','rest','rest'),
  plan('rest','rest','rest','rest','camp'),
  plan('project','project','project','forage','camp'),
  plan('project','project','project','forage','camp'),
  plan('fuel','rest','rest','forage','camp'),
  plan('rest','rest','rest','forage','camp')
];
function balancedGame() {
  let s=E.createGame();
  for(const p of SCHEDULE){s=E.resolveTurn(s,p);if(s.council)s=E.chooseCouncil(s,{1:'one_trial',2:'rest_george',3:'boat',4:'credit'}[s.council]);}
  return s;
}
function afterFirstDay(){let s=E.createGame();s=E.resolveTurn(s,SCHEDULE[0]);return E.resolveTurn(s,SCHEDULE[1]);}

test('a complete ten-shift route can keep all five ready and change the boat plan',()=>{
  const s=balancedGame();assert.equal(s.turn,10);assert.equal(s.ending.success,true);assert.equal(s.boat,6);
  assert.equal(s.knowledge,2);assert.equal(s.crew.length,5);assert(s.promises.every(p=>p.status==='kept'));
  assert.throws(()=>E.resolveTurn(s,all('rest')),/skončila/);
});
test('neglecting food and refusing the new project has a distinct unsuccessful ending',()=>{
  let s=E.createGame();for(let i=0;i<10;i++){s=E.resolveTurn(s,all('rest'));if(s.council)s=E.chooseCouncil(s,{1:'open',2:'no_rest',3:'defer',4:'persist'}[s.council]);}
  assert.equal(s.ending.success,false);assert.equal(s.ending.checks.food,false);assert.equal(s.ending.checks.plan,false);
  assert.equal(s.ending.checks.learning,false);assert.equal(s.food,0);
});
test('preview shows exactly the committed result without modifying state or assignment',()=>{
  const s=E.createGame(),p=E.initialPlan(),before=JSON.stringify({s,p});
  const preview=E.previewTurn(s,p);assert.equal(JSON.stringify({s,p}),before);assert.deepEqual(E.resolveTurn(s,p),preview.next);
  assert.equal(preview.next.steel,s.steel-1);assert.equal(preview.next.knowledge,1);
});
test('evening decisions block time and reject unavailable choices',()=>{
  const s=afterFirstDay();assert.equal(s.council,1);assert.throws(()=>E.resolveTurn(s,all('rest')),/dohodu/);
  assert.throws(()=>E.chooseCouncil(s,'boat'),/Neplatná/);assert.equal(E.chooseCouncil(s,'pause').council,null);
});
test('storm closes the coast while allowing work in camp',()=>{
  let s=E.createGame();s.turn=4;
  assert.match(E.taskProblem(s,'george','forage'),/vichřice/);assert(E.previewTurn(s,all('forage')).errors.length);
  assert.equal(E.previewTurn(s,all('camp')).errors.length,0);
});
test('exhaustion prevents heavy work and recovery reopens it',()=>{
  let s=E.createGame();s.crew.find(p=>p.id==='raynal').fatigue=5;
  assert.match(E.taskProblem(s,'raynal','project'),/sil/);
  s=E.resolveTurn(s,all('rest'));assert.equal(E.taskProblem(s,'raynal','project'),'');
});
test('hunger has a consequence even when a rested person rests again',()=>{
  const s=E.createGame();s.food=0;const n=E.resolveTurn(s,all('rest'));
  assert.equal(n.hardship,1);assert(n.crew.every(p=>p.fatigue>=2));
});
test('a failed attempt without steel consumes no project materials',()=>{
  const s=E.createGame();s.steel=0;const n=E.previewTurn(s,all('project'));
  assert.equal(n.next.knowledge,0);assert.equal(n.next.fuel,s.fuel);assert(n.warnings.some(x=>x.includes('ocel')));
});
test('a kept trial limit improves trust; breaking it incurs only one penalty',()=>{
  const s=E.chooseCouncil(afterFirstDay(),'one_trial');
  let kept=E.resolveTurn(s,SCHEDULE[2]);kept=E.resolveTurn(kept,SCHEDULE[3]);
  assert.equal(kept.promises[0].status,'kept');assert.equal(kept.trust,4);
  let broken=E.resolveTurn(s,SCHEDULE[2]);broken=E.resolveTurn(broken,plan('project','rest','rest','project','camp'));
  assert.equal(broken.promises[0].status,'broken');assert.equal(broken.trust,2);
});
test('a promised rest is checked on its target day',()=>{
  let s=E.chooseCouncil(afterFirstDay(),'one_trial');s=E.resolveTurn(s,SCHEDULE[2]);s=E.resolveTurn(s,SCHEDULE[3]);s=E.chooseCouncil(s,'rest_george');
  let kept=E.resolveTurn(s,SCHEDULE[4]);kept=E.resolveTurn(kept,SCHEDULE[5]);assert.equal(kept.promises[1].status,'kept');
  let broken=E.resolveTurn(s,all('camp'));broken=E.resolveTurn(broken,all('camp'));assert.equal(broken.promises[1].status,'broken');assert.equal(broken.trust,3);
});
test('valid saves round-trip, corrupt saves are rejected, and endings are recomputed',()=>{
  const s=balancedGame();assert.deepEqual(E.restoreGame(JSON.parse(JSON.stringify(s))),s);
  assert.equal(E.restoreGame({...s,turn:11}),null);assert.equal(E.restoreGame({...s,crew:[]}),null);
  assert.equal(E.restoreGame({...s,log:[]}),null);assert.equal(E.restoreGame({...s,council:1}),null);
  const altered={...s,ending:{success:false,text:'not authoritative'}};assert.deepEqual(E.restoreGame(altered).ending,s.ending);
});
test('many valid mixed strategies remain finite and saveable through all ten shifts',()=>{
  let seed=97;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
  for(let run=0;run<50;run++){
    let s=E.createGame();for(let turn=0;turn<10;turn++){
      const p=Object.fromEntries(E.PEOPLE.map(person=>{const choices=Object.keys(E.TASKS).filter(task=>!E.taskProblem(s,person.id,task));return[person.id,choices[rand(choices.length)]];}));
      s=E.resolveTurn(s,p);assert(E.restoreGame(s));assert(s.food>=0&&s.fuel>=0&&s.steel>=0&&s.timber>=0);assert(s.crew.every(x=>x.fatigue>=0&&x.fatigue<=6));
      if(s.council){const choices=E.getCouncil(s).choices;s=E.chooseCouncil(s,choices[rand(choices.length)].id);}
    }
    assert.equal(s.turn,10);assert.equal(typeof s.ending.success,'boolean');
  }
});

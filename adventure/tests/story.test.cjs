'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../dist/voyage.js');
const S=require('../dist/voyage-stories.js');
const Stage=require('../dist/stage-direction.js');
const Observations=require('../dist/observations.js');

test('work evokes one brief line from someone in the room, in every chapter',()=>{
  let state=E.createGame();
  const heard=new Map();
  for(let turns=0;!state.completed&&turns<200;turns++){
    let action;
    const hint=E.hint(state);
    if(state.chapterComplete)action=E.advance(state);
    else if(hint.sceneId!==state.scene)action=E.travel(state,hint.sceneId);
    else if(hint.combineItems)action=E.combine(state,...hint.combineItems);
    else if(hint.itemId)action=E.useItem(state,hint.itemId,hint.targetId);
    else action=E.interact(state,hint.targetId,'use');
    // In the first chapter the central beach connects the two outlying rooms.
    if(!action.changed&&state.chapter===1&&hint.sceneId!==state.scene)action=E.travel(state,'beach');
    assert(action.changed,action.text);
    const before=state;
    state=action.state;
    const reaction=S.workBeat(before.flags,state);
    assert.equal(S.workBeat(state.flags,state),null,'reload or repeated inspection should be quiet');
    if(!reaction)continue;
    assert.equal(state.chapter,before.chapter);
    const onStage=['player',...E.getTargets(state).filter(t=>t.kind==='person').map(t=>t.id),
      ...Stage.companions(state.scene,state)];
    assert(onStage.includes(reaction.id),state.scene+' has no '+reaction.id);
    assert(reaction.text.length<=106,reaction.text);
    assert(S.lines(reaction.id,state).speaker);
    if(!heard.has(state.chapter))heard.set(state.chapter,[]);
    heard.get(state.chapter).push(reaction);
  }
  assert(state.completed);
  assert.deepEqual([...heard.keys()],[1,2,3,4,5,6,7]);
  const voices=new Set();
  for(const [chapter,lines] of heard){
    assert(lines.length>=1&&lines.length<=3,'the ambient dialogue should leave room for quiet work');
    for(const line of lines)voices.add(line.id==='player'?S.perspective({chapter}).name:S.lines(line.id,{chapter}).speaker);
  }
  assert.equal(voices.size,5);
});

test('the crossing and the two-person reunion use the witnesses’ roles',()=>{
  const sea={scene:'crossing',chapter:5,flags:{rigSecured:true}};
  assert.match(Observations.look(sea,'raynal'),/tiller/);
  assert.match(S.lines('musgrave',sea).lines.join(' '),/pump/);
  for(const name of ['henry','george'])assert.equal(S.present(name,sea),false);
  assert.equal(S.perspective({chapter:6}).name,'Thomas Musgrave');

  for(const [first,second] of [['henry','george'],['george','henry']]){
    const home={chapter:7,scene:'return_camp',flags:{suppliesShared:true,landingMarked:true,[first+'Found']:true}};
    const known=S.lines('player',home).lines.join(' ');
    assert.match(known,new RegExp(first,'i'));
    assert.match(known,new RegExp(second,'i'));
    assert.match(S.lines('henry',home).lines.join(' '),/sleeve/);
    assert.match(S.lines('george',home).lines.join(' '),/hand/);
    home.flags[second+'Found']=true;
    assert.match(S.lines('player',home).lines.join(' '),/both men/i);
  }
});

test('chapter banners agree with the names in the journey and identify the passage',()=>{
  assert.deepEqual(S.CHAPTER_BEATS.map(x=>x.title),E.CHAPTERS.map(x=>x.title));
  assert.match(S.CHAPTER_BEATS[4].caption,/19–24 July 1865.*Camp Cove/);
  assert.match(S.CHAPTER_BEATS[5].caption,/Port Adventure.*Invercargill/);
  assert.match(S.CHAPTER_BEATS[6].caption,/24 August 1865/);
});

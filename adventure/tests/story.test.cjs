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
    const onStage=[S.perspective(state).id,...E.getTargets(state).filter(t=>t.kind==='person').map(t=>t.id),
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
    for(const line of lines)voices.add(line.id);
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

test('every talk target has a responsive exchange with only the people on its stage', () => {
  const meetings = new Set();
  let state = E.createGame();
  for (let i = 0; i < 200; i++) {
    for (const scene of E.SCENES.filter(scene => scene.chapter === state.chapter)) {
      const room = {...state, scene: scene.id};
      const crew = E.getTargets(room).filter(t => t.kind === 'person').map(t => t.id)
        .concat(Stage.companions(scene.id, room));
      const active = S.perspective(room).id;
      for (const id of crew) {
        const exchange = S.conversation(id, room);
        assert.equal(exchange[0].id, id, scene.id + ' addresses ' + id);
        assert(exchange.some(t => t.id === active), scene.id + ': the viewpoint takes part');
        assert(exchange.length >= 2 && exchange.length <= 4);
        const compatible = S.lines(id, room);
        assert.deepEqual(compatible.lines, exchange.map(t => t.text));
        assert.equal(compatible.speaker, S.speakerInfo(id, room).speaker);
        for (const [index, t] of exchange.entries()) {
          assert(t.id === active || crew.includes(t.id), scene.id + ': missing ' + t.id);
          assert(t.text && t.text.length <= 160, t.text);
          assert.notEqual(t.id, exchange[index - 1]?.id, scene.id + ': consecutive turns by ' + t.id);
        }
        meetings.add(scene.id + '/' + id);
      }
    }
    if (state.completed) break;
    const hint = E.hint(state);
    let step;
    if (state.chapterComplete) step = E.advance(state);
    else if (hint.sceneId !== state.scene) {
      step = E.travel(state, hint.sceneId);
      if (!step.changed && state.chapter === 1) step = E.travel(state, 'beach');
    } else if (hint.combineItems) step = E.combine(state, ...hint.combineItems);
    else if (hint.itemId) step = E.useItem(state, hint.itemId, hint.targetId);
    else step = E.interact(state, hint.targetId, 'use');
    assert(step.changed, step.text);
    state = step.state;
  }
  assert(state.completed);
  for (const meeting of ['beach/raynal','wreck/musgrave','camp/henry','camp/george',
    'cabin/henry','forest/george','forge/raynal','charcoal/george','slipway/musgrave',
    'salvage/henry','crossing/musgrave','crossing/raynal','harbour/raynal',
    'return_camp/henry','return_camp/george','landing/henry','landing/george']) {
    assert(meetings.has(meeting), 'unplayable encounter ' + meeting);
  }
});

test('the opening and reunion respect chronology and chapter viewpoint', () => {
  const shore = E.createGame();
  assert.deepEqual(S.arrival(shore).map(t => t.id), ['raynal','player','raynal']);
  assert.deepEqual(S.arrival({...shore, scene:'wreck'}), []);
  assert.deepEqual(S.arrival({...shore, flags:{ropeTaken:true}}), []);
  assert.deepEqual(S.arrival({...shore, chapter:2}), []);
  assert.match(S.conversation('musgrave',{chapter:1, scene:'wreck', flags:{}})[1].text, /lee of the beach/);
  assert.match(S.conversation('musgrave',{chapter:1, scene:'wreck', flags:{crateOpen:true}})[1].text, /log/);
  const harbour = {chapter:6, scene:'harbour', flags:{}};
  assert.deepEqual(S.conversation('raynal',harbour).map(t => t.id), ['raynal','musgrave','raynal']);
  assert.match(S.speakerInfo('player',harbour).speaker,/Alick/);
  assert.match(S.speakerInfo('musgrave',harbour).speaker,/You.*Musgrave/);
  const home = {chapter:7, scene:'return_camp', flags:{}};
  assert.match(S.conversation('george',home)[0].text,/Alick and Raynal/);
  assert.match(S.conversation('henry',home)[2].text,/post/);
  assert.match(S.conversation('henry',{...home, flags:{henryFound:true,suppliesShared:true}})[2].text,/casks/);
  assert.match(S.conversation('george',{...home, flags:{georgeFound:true,suppliesShared:true}})[2].text,/own ways/);
});

test('Raynal and Musgrave change rooms once, in either puzzle order and after a save reload', () => {
  const FirstNight = require('../dist/engine.js');
  const crewIn = (state, scene) => {
    const room = {...state, scene};
    return E.getTargets(room).filter(t => t.kind === 'person').map(t => t.id)
      .concat(Stage.companions(scene, room));
  };
  function checkPlaces(state) {
    const camp = crewIn(state, 'camp');
    const beach = crewIn(state, 'beach');
    const wreck = crewIn(state, 'wreck');
    assert.deepEqual([...camp, ...beach, ...wreck].sort(), ['george','henry','musgrave','raynal']);
    assert.equal(camp.includes('henry') && camp.includes('george'), true);
    assert.equal(camp.includes('raynal'), state.flags.shelterBuilt);
    assert.equal(beach.includes('raynal'), !state.flags.shelterBuilt);
    assert.equal(camp.includes('musgrave'), state.chapterComplete);
    assert.equal(wreck.includes('musgrave'), !state.chapterComplete);
    for (const [scene, team] of [['camp',camp],['beach',beach],['wreck',wreck]]) {
      const room = {...state, scene};
      for (const id of ['henry','george','musgrave','raynal']) {
        const action = E.interact(room, id, 'talk');
        assert.equal(action.cue === 'wrong', !team.includes(id), scene + '/' + id);
        assert.deepEqual(action.state, room);
      }
      for (const turn of S.conversation('player', room)) {
        assert(turn.id === 'player' || team.includes(turn.id), scene + '/' + turn.id);
      }
    }
  }
  const salvage = [
    ['interact','rope','take'], ['interact','pole','take'], ['combine','rope','pole'],
    ['useItem','loopPole','sail'], ['travel','wreck'], ['interact','prybar','take'],
    ['useItem','prybar','crate'], ['travel','beach'], ['useItem','axe','driftwood'], ['travel','camp']
  ];
  const warmth = [['useItem','firewood','hearth'], ['useItem','tinderbox','hearth']];
  const signal = [['useItem','loopPole','cairn'], ['useItem','flagcloth','cairn']];
  for (const jobs of [[...warmth,...signal],[...signal,...warmth]]) {
    let old = FirstNight.createGame(), current = E.createGame();
    for (const [method,...args] of [...salvage,['useItem','canvas','shelter'],...jobs,['travel','beach'],['travel','wreck']]) {
      old = FirstNight[method](old, ...args).state;
      current = E[method](current, ...args).state;
      const imported = E.restore(JSON.parse(JSON.stringify(old)));
      const loaded = E.restore(JSON.parse(JSON.stringify(current)));
      assert(imported && loaded);
      checkPlaces(imported);
      checkPlaces(loaded);
      assert.deepEqual(current, loaded);
    }
    assert(current.chapterComplete);
    assert.equal(E.advance(E.restore(old)).state.chapter, 2);
  }
});

test('the return is provisioned in Invercargill',()=>{
 const wharf=E.SCENES.find(room=>room.id==='harbour');
 assert.equal(wharf.name,'Invercargill Wharf');
 assert.match(S.CHAPTER_BEATS[5].caption,/Port Adventure.*Invercargill/);
});

test('Musgrave remembers both greetings independently of when the boat, provisions and lantern are ready',()=>{
 const greetings=[
  {henryFound:false,georgeFound:false,next:/word with Henry and George/},
  {henryFound:true,georgeFound:false,next:/word with George/},
  {henryFound:false,georgeFound:true,next:/speak to Henry/},
  {henryFound:true,georgeFound:true}
 ];
 // Marking the landing requires a moored boat. The greetings and provisions are independent.
 for(const [boatMoored,landingMarked] of [[false,false],[true,false],[true,true]]){
  for(const suppliesShared of [false,true]){
   for(const {henryFound,georgeFound,next} of greetings){
    const flags={henryFound,georgeFound,boatMoored,suppliesShared,landingMarked};
    const landing={chapter:7,scene:'landing',flags};
    const turns=S.conversation('player',landing);
    const speech=turns.map(turn=>turn.text).join(' ');
    const expected=!boatMoored ? /steady this boat/i : next || (!suppliesShared ? /provisions/ : !landingMarked ? /lantern/ : /come aboard/i);
    assert.match(speech,expected,JSON.stringify(flags));
    assert.equal(/come aboard/i.test(speech),Object.values(flags).every(Boolean));
    const crew=['musgrave',...Stage.companions('landing',landing)];
    assert(turns.every(turn=>crew.includes(turn.id)));
   }
  }
 }
});

test('revisiting the landing after boarding keeps the reunion in the past',()=>{
 const flags={henryFound:true,georgeFound:true,boatMoored:true,suppliesShared:true,landingMarked:true,menRescued:true};
 const landing={chapter:7,scene:'landing',flags};
 assert.match(S.conversation('player',landing)[0].text,/brought them both back/);
 for(const id of Stage.companions('landing',landing)){
  const turns=S.conversation(id,landing);
  assert.deepEqual(turns.map(turn=>turn.id),[id,'musgrave',id]);
  assert.doesNotMatch(turns.map(turn=>turn.text).join(' '),/coming down|hold the line|long step|come aboard/i);
 }
});

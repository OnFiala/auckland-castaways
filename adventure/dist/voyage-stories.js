/* Original dramatic dialogue, never quotations. Historical boundaries and sources:
   ../HISTORICAL_ADAPTATION.md. Alick is the viewpoint in I–V; Musgrave in VI–VII. */
(function(root,factory){
  const base=typeof module==='object'&&module.exports?require('./stories.js'):root.CastawayStories;
  const api=factory(base);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.CastawayStories=api;root.CastawayVoyageStory=api;}
})(typeof globalThis!=='undefined'?globalThis:this,function(base){
  'use strict';
  const CHAPTER_BEATS=[
    {chapter:1,title:'The First Night',caption:'Auckland Island, January 1864. Five people reach the shore.'},
    {chapter:2,title:'A Home by the Water',caption:'Winter, 1864. Epigwaitt gives the five a place to come back to. The weather is getting in.'},
    {chapter:3,title:'The Last Drill',caption:'Early 1865. The five turn pieces of the wreck into tools for a boat.'},
    {chapter:4,title:'Three Places',caption:'July 1865. The little boat cannot carry all five. Leaving means promising to return.'},
    {chapter:5,title:'Five Days at Sea',caption:'19–24 July 1865. Musgrave, Raynal and Alick sail for help. Henry and George remain.'},
    {chapter:6,title:'Help from the Mainland',caption:'July 1865. From Port Adventure to Invercargill, strangers help turn the promise into a voyage.'},
    {chapter:7,title:'Until We Return',caption:'24 August 1865. Musgrave returns with Captain Cross. Two men are still waiting.'}
  ];
  const PERSPECTIVES={
    1:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/sailor.png'},
    2:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/sailor.png'},
    3:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/sailor.png'},
    4:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/sailor.png'},
    5:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/sailor.png'},
    6:{id:'musgrave',name:'Thomas Musgrave',label:'Playing as Captain Musgrave',portrait:'assets/people/musgrave.png'},
    7:{id:'musgrave',name:'Thomas Musgrave',label:'Playing as Captain Musgrave',portrait:'assets/people/musgrave.png'}
  };
  const NAMES={player:'Alick McLaren',raynal:'François Raynal',musgrave:'Thomas Musgrave',henry:'Henry Forgés',george:'George Harris'};
  const PRESENT={1:['player','raynal','musgrave','henry','george'],2:['player','raynal','musgrave','henry','george'],3:['player','raynal','musgrave','henry','george'],4:['player','raynal','musgrave','henry','george'],5:['player','raynal','musgrave'],6:['player','raynal'],7:['player','henry','george']};
  const ENDING={
    title:'All five survived.',
    line:'The promise was kept.',
    caption:'Musgrave, Raynal, Alick, Henry and George survived. Their rescue was completed on 24 August 1865.',
    crew:Object.keys(NAMES).map(id=>({id,name:NAMES[id],portrait:id==='player'?'assets/sailor.png':`assets/people/${id}.png`})),
    facts:[
      {text:'Grafton was wrecked on 3 January 1864. All five aboard reached land.',sources:['S001','S003','S005'],evidence:['E003']},
      {text:'Musgrave, Raynal and Alick left on 19 July 1865 and reached Port Adventure five days later.',sources:['S001','S003'],evidence:['E032','E033']},
      {text:'Captain Cross’s household and other people at Port Adventure welcomed the three. Raynal records Māori among those present when they came ashore. John Macpherson organised a relief fund in Invercargill.',sources:['S001','S003','S004'],evidence:['E033','E035']},
      {text:'Musgrave returned on Flying Scud. Henry Forgés and George Harris were rescued on 24 August 1865.',sources:['S001'],evidence:['E039']},
      {text:'Invercauld broke up at the northern end of Auckland Island on 10 May 1864. Nineteen of its 25 crew reached shore with little salvage. George Dalgarno, Andrew Smith and Robert Holding were rescued in May 1865. The two crews had remained unaware of one another during their time on the island.',sources:['S002','S005','S007','S038'],evidence:['E011','E012','E014','E036','E048']}
    ],
    note:'Puzzles, conversations, character likenesses and precise staging are fictional. The historical outcome is documented.'
  };
  // Each encounter has an opening and a short response after the chapter's work.
  const voices={
    2:{
      player:[['I used to judge a day by the distance sailed.','Now I judge it by what stays dry.','A small repair can last longer than a good mood.'],['The others will notice the roof before they notice my hands.','That is all right.','Tonight the work can speak for itself.']],
      raynal:[['My first repairs looked better than they worked.','Wet leather teaches the lesson twice.','Let me see where that seam is pulling.'],['There. It need not be handsome to keep the weather out.','We can improve it when our hands are warm.','Not every answer has to arrive on the first attempt.']],
      musgrave:[['I still turn toward the water when the wind changes.','Then I remember the work waiting behind me.','Keeping watch must not mean leaving everything else to the others.'],['Nothing has appeared beyond the harbour.','But the fire is tended, and the house is holding.','That is something I can report honestly.']],
      henry:[['The first pot in the morning is whoever’s turn it is.','Last week I could tell from my bed who had forgotten the water.','Today I can hear the roof dripping into it.'],['Sit where the draught used to be.','You can tell the next cook how we kept the water warm.','I expect to be reminded when it is my turn again.']],
      george:[['Some mornings I do not want to open the door.','It helps if there is one clear thing to do outside.','And someone who will notice when I come back.'],['I thought the whole day had gone wrong.','Then I came home and saw what you had repaired.','Perhaps we are allowed a quiet evening.']]
    },
    3:{
      player:[['Charcoal on my sleeves. Iron on the bench.','Everything here has already belonged to something else.','Let us make this piece earn another life.'],['The work did not give us the ship we first imagined.','It gave us something we can actually use.','We can begin again from there.']],
      raynal:[['A tool can look right and still fail under pressure.','I would rather find that out here than halfway through a hull.','We must test it, not just admire it.'],['There is only so much good steel left.','Repeating the same failure will not make more.','Let us change the work to fit what our hands can make.']],
      musgrave:[['I have been measuring a ship larger than our means.','The drawing is easier than the work.','Tell me what the tools can really do.'],['Then we use the boat we already have.','Smaller, and a harder voyage.','But a real plan can be prepared for.']],
      henry:[['Even the forge needs someone to fetch and carry.','Say when you need a rest.','There is no virtue in letting a tired hand spoil the next piece.'],['You have put the iron down at last.','Good. Now sit down beside it.','We will need those hands again tomorrow.']],
      george:[['Will you need another basket?','Give me a hand with this one and I can fetch a second.','I would like to see the fire from this side when it takes.'],['I can carry those down to the boat.','Put them somewhere I can see them, or I will go looking in the empty basket.','A load I can take in one trip. There is a change.']]
    },
    4:{
      player:[['I have crossed water in better boats than this.','None of them mattered quite so much.','I will check every fastening once more.'],['The boat is ready. I am not sure anyone can be.','Henry and George will watch us leave.','Every mile must lead toward bringing help back.']],
      raynal:[['The boat must carry the sea as well as our hopes.','Try the seams. Work the pump.','Anything we can learn here is cheaper than learning it offshore.'],['I can still find things I would improve.','There will always be one more.','We have to distinguish unfinished work from fear of leaving.']],
      musgrave:[['There is room for three on the passage.','That leaves two here, beyond our sight.','Their provisions belong in the plan as much as ours do.'],['We have prepared the boat and the men who must remain.','I cannot promise a date.','I can promise what I am setting out to do.']],
      henry:[['I have seen that boat in a chop. I would rather stay with the house.','Leave the things George and I need to keep it going.','Your stores can go by the door, where we will know them from ours.'],['The stores are set out. George knows where they are.','Go when the wind lets you, even if I have gone inside.','I will put something warm on when you come back.']],
      george:[['I keep counting places in the boat.','It does not change the number.','Tell me what we can do here while you are away.'],['I will watch from the shore until I cannot see you.','After that, there is the house and the next day.','I would rather have a plan than keep counting.']]
    },
    5:{
      player:[['The boat lifts, and the shore is gone again.','Keep the line clear. Give the helm a steady hand.','The next small task is close enough to reach.'],['Land. I have stopped trusting my eyes.','Raynal sees it too.','Keep working until we are actually ashore.']],
      raynal:[['Clear that loose line before the sea takes it.','We can speak when the next wave has passed.','For now, let your hands tell me you are there.'],['There is a sheltered shore ahead.','I had forgotten that water could look still.','One more careful approach and we can put our feet down.']],
      musgrave:[['I can keep her head steady from here. Alick, how much water came in that time?','Call out if the line comes loose again.','We can keep count when there is room to think.'],['There are people ashore.','When I can speak, ask them to take down the name of the harbour.','They will need to know where to find Henry and George.']]
    },
    6:{
      player:[['Captain Cross had to help me up the shore. Now he is asking how to get back.','My account of the harbour will be of more use laid out where he can see it.','If my hand shakes, he can mark the page for me.'],['Mr Macpherson has been out asking for help again. Look what people have sent.','Captain Cross knows the way as far as I can describe it.','I will go with him and show him the rest.']],
      raynal:[['There is bread here without a day of searching first.','It takes a little getting used to.','Make them understand that two of us are still waiting.'],['I know you want to go home.','First there are two men who need you to find the way back.','Bring them out of that house.']]
    },
    7:{
      player:[['I know the outline of this shore.','I do not know what their last month has been like.','First, find them. Then we can ask.'],['Henry and George are aboard.','There will be time for the things we could not bring.','For now, both places are filled.']],
      henry:[['I heard George before I saw the boat.','Give me a moment. I need to believe you are standing here.','Then tell me what I must carry.'],['I thought I would be the first out of the door.','I have got used to doing one more thing before I go.','Will you walk down with me?']],
      george:[['I looked twice. The sail was still there.','There were days Henry and I could hardly speak to one another.','Today I ran to tell him before I went down to the shore.'],['The door can stay open.','If I go back to shut it, I will find something else to do.','Come on. I know the path even in this light.']]
    }
  };
  // The most recent applicable work beat wins within a voice. The guard covers work players can do out of order.
  const moments={
    1:[{flag:'canvasRecovered',until:'shelterBuilt',voice:'raynal',lines:['That part of the sail is still sound.','Keep it off the stones if you can.','We spent long enough getting it off them.']},
      {flag:'crateOpen',until:'woodCut',voice:'musgrave',lines:['The tinderbox is dry. I thought we had lost it.','There is an axe as well. Someone had better go with you.','I will stay here long enough to see what else the wreck has left us.']},
      {flag:'firewoodPlaced',until:'fireLit',voice:'henry',lines:['That little pile will start quicker than a log.','My hand will be here to keep the wind off it.','Tell me before you strike.']}],
    2:[{flag:'roofSealed',until:'waterStored',voice:'henry',lines:['Listen. The rain is hitting the outside now.','I can set the water to heat once it is here.','Then I would like to sit down while somebody else watches it.']},
      {flag:'waterFetched',voice:'george',lines:['That was easier with the path clear.','I will remember where the water runs when everything else is white.','Shall I walk back with you?']},
      {flag:'waterStored',voice:'henry',lines:['There is enough for five cups.','My sleeves might even be dry by the time they are warm.','Will you stay and listen for the kettle?']}],
    3:[{flag:'bellowsFitted',until:'forgeLit',voice:'raynal',lines:['Put a hand near the opening. Feel that?','There is enough air now, if the fuel will take it.','I can work the iron while someone else keeps the fire going.']},
      {flag:'forgeFueled',voice:'george',lines:['It seems to me there is as much charcoal on my sleeves as in the furnace.','Tell me if it burns well.','If it does, I know where to get you more.']},
      {flag:'drillForged',until:'drillFailed',voice:'raynal',lines:['It looks like the thing I wanted. That is all I know yet.','Let us put it against hard timber.','If it fails here, at least it will tell us before we need it.']},
      {flag:'drillFailed',voice:'raynal',lines:['The point will not do the work. I can feel it giving.','We could use the metal for fastenings.','The small boat is already afloat when we need it. Let us start with that.']},
      {flag:'drillFailed',voice:'musgrave',lines:['Bring the measurements for the boat we have.','I have spent enough time on the one we meant to build.','Let us see what the smaller job asks of us.']}],
    4:[{flag:'hullPlanked',until:'hullFastened',voice:'musgrave',lines:['The height looks better from down here.','Press against that board. You can still feel it give.','I will hold it while you fetch the fastenings.']},
      {flag:'hullFastened',voice:'henry',lines:['Have a look through what is left here before we clear it away.','The house could use a sound board too.','We can leave a little work for ourselves while you are gone.']},
      {flag:'boatSealed',until:'sailRigged',voice:'musgrave',lines:['Run your eye along the joints once more.','We have done what we can on land to keep the water out.','The next gust will tell us about the sail.']}],
    5:[{flag:'rigSecured',until:'boatDry',voice:'raynal',lines:['I can move past the rig without it taking my eye out.','Alick, pass me that scoop when you have a hand free.','Let us get the water out while the line is holding.']},
      {flag:'boatDry',until:'sailMended',voice:'musgrave',lines:['The water is lower. Keep watching it.','It has taken all three of us to gain that much.','Raynal, how much of that sail is still whole?']},
      {flag:'sailMended',voice:'raynal',lines:['There. The wind is working on the cloth again.','My fingers are about done with it.','Can you see anything ahead that stays in one place?']}],
    6:[{flag:'chartMarked',until:'rescueRoute',voice:'player',lines:['That is the arm of the harbour where we built the house.','Captain Cross ought to see it here on the table.','It looks simple with the whole coast spread out in front of you.']},
      {flag:'rescueRoute',voice:'player',lines:['Captain Cross can see where the harbour narrows now.','I have told him where the weather is likely to catch us.','Time to see what people have brought down to the cutter.']},
      {flag:'rescueSupplied',voice:'raynal',lines:['When we came ashore, people had to take our weight between them.','What they have sent will do more good than I can say.','Tell Henry and George where it came from.']}],
    7:[{flag:'suppliesShared',voice:'henry',lines:['Put George’s share where he can reach it.','We have both been watching the last of things for too long.','Give me a minute to clear this table for the last time.']},
      {flag:'suppliesShared',voice:'george',lines:['Henry should have the first look. He kept the last stores longer than I thought we could.','We came up with some work of our own while you were gone.','I will tell you about the raft when we are out of this wind.']},
      {flag:'henryFound',until:'georgeFound',voice:'player',lines:['Henry is here.','George may have heard us from the other side of the room.','I want to tell him myself that the boat can take them both.']},
      {flag:'georgeFound',until:'henryFound',voice:'player',lines:['George is here.','Let me speak to Henry before we go down.','They need to know there is room for both on the cutter.']},
      {flag:'landingMarked',voice:'henry',lines:['The path turns just before the shore.','Let George take the lead. He knows that path as well as I do.','I will follow while the light holds.']}]
  };
  function chapterNumber(state){return Math.max(1,Math.min(7,Number(state&&state.chapter)||1));}
  function perspective(state){return {...PERSPECTIVES[chapterNumber(state)]};}
  function present(id,state){return PRESENT[chapterNumber(state)].includes(id);}
  function lines(id,state){
    const chapter=chapterNumber(state),who=perspective(state);
    const flags=state?.flags||{};
    const finished=Boolean(state&&(state.chapterComplete||state.completed));
    const momentFor=voice=>!finished&&moments[chapter]?.findLast(m=>m.voice===voice&&flags[m.flag]&&!flags[m.until]);
    if(chapter===1){
      const result=base.lines(id,state),moment=momentFor(id);
      if(id==='player')result.speaker='You · Alick McLaren';
      if(moment)result.lines=moment.lines.slice();
      return result;
    }
    // An absent crewmate never speaks from a ship on which he did not travel.
    const resolved=present(id,state)&&voices[chapter][id]?id:'player';
    const encounter=voices[chapter][resolved],moment=momentFor(resolved);
    const bothFound=!finished&&chapter===7&&resolved==='player'&&flags.henryFound&&flags.georgeFound;
    const readyToLeave=flags.landingMarked&&flags.suppliesShared;
    const reunion=readyToLeave?['Both men are here and the boat is ready.','Captain Cross is waiting for us offshore.','This time we can go down to the landing together.']:['I have seen them both.','We will bring them down once the supplies are in and the landing is ready.','This time, nobody has to watch from the shore.'];
    const selected=bothFound?reunion:moment?moment.lines:encounter[finished?1:0];
    return {speaker:resolved==='player'?`You · ${who.name}`:NAMES[resolved],portrait:resolved==='player'?who.portrait:`assets/people/${resolved}.png`,lines:selected.slice()};
  }
  function ambient(id,state){return lines(id,state).lines[0];}
  return {lines,ambient,perspective,present,CHAPTER_BEATS,PERSPECTIVES,ENDING};
});

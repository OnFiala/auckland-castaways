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
    {chapter:1,title:'The First Night',caption:'3 January 1864. The sea has reached the Grafton’s cabin table. At daylight, all five get ashore.'},
    {chapter:2,title:'A House Against the Winter',caption:'Winter, 1864. Ship’s spars now hold up the roof at Epigwaitt. Tonight, water has found a way in.'},
    {chapter:3,title:'What Iron Can Become',caption:'Early 1865. A year ashore. On the blocks lies the beginning of a new cutter. It still needs tools.'},
    {chapter:4,title:'Room for Three',caption:'July 1865. The old dinghy must cross open sea. Henry and George will stay at Epigwaitt.'},
    {chapter:5,title:'Five Days of Ocean',caption:'19–24 July 1865. The three sail from Camp Cove. Alick and Raynal spell each other at the helm. Musgrave works the pump.'},
    {chapter:6,title:'The Promise',caption:'July 1865. At Port Adventure, people help the three ashore. Cross takes them on to Invercargill.'},
    {chapter:7,title:'Until We Return',caption:'24 August 1865. The wind eases. Flying Scud sails up from Camp Cove. Musgrave watches for the roof of Epigwaitt.'}
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
      {text:'Musgrave returned aboard Flying Scud with Captain Cross. Henry Forgés and George Harris were rescued on 24 August 1865. That evening the three ate fish and potatoes, bread and butter, and drank tea aboard the cutter at Camp Cove.',sources:['S001'],evidence:['E039']},
      {text:'Invercauld broke up at the northern end of Auckland Island on 10 May 1864. Nineteen of its 25 crew reached shore with little salvage. George Dalgarno, Andrew Smith and Robert Holding were rescued in May 1865. The two crews had remained unaware of one another during their time on the island.',sources:['S002','S005','S007','S038'],evidence:['E011','E012','E014','E036','E048']}
    ],
    note:'Puzzles, conversations, character likenesses and precise staging are fictional. The historical outcome is documented.'
  };
  // Each encounter has an opening and a short response after the chapter's work.
  const voices={
    2:{
      player:[['I know the house by ear now.','The hinge scrapes. A loose board knocks under George’s boot.','That little ticking sound is new.'],['Henry says it is my move.','The chessboard can come out again.','I had better remember where I left my red knight.']],
      raynal:[['I made the black squares of our chessboard with soot.','Alick keeps rubbing one with his thumb when he thinks.','We shall have a white square there by spring.'],['A dry table at last.','Will you take the red men, Alick?','See if George has finished studying that knight.']],
      musgrave:[['I take my week at the cooking like everybody else.','Something always wants writing down just when the pot needs me.','Call me if I forget.'],['I have written the weather down.','There is still a little light.','Save me a game if there’s time.']],
      henry:[['Hear that little tap? It kept my boot full all night.','I moved the boot. George got it in the neck instead.','We put a pan there between us.'],['Which of you left the chessmen out?','Good. I thought we had put them away for the winter.','Let me warm my hands and I’ll play the winner.']],
      george:[['Mind that smooth stone. I went down it on my backside yesterday.','The water skin made it to the house full.','I thought that showed uncommon talent.'],['Shall we go in?','I can dry this coat while I have a game.','Henry has been keeping me a place.']]
    },
    3:{
      player:[['I knew that lump when it was ballast.','We scarcely gave it a look when it lay in the hold.','Now everybody wants a turn at it.'],['Those nails are warm through my pocket.','For the little boat this time.','I’ll take them down.']],
      raynal:[['We put all those timbers on the blocks. Now every bolt wants a hole.','Give me the smaller piece again.','There’s just enough metal to give the point another turn.'],['The picks went south with us to open a mine.','What’s left of them sits on this bench.','I should like to see these nails put to use.']],
      musgrave:[['I had ten tons in mind when we laid those blocks.','There’s the keel. There’s the stem.','Raynal, can we make the holes?'],['Leave the timbers where they lie.','I want the measure of the dinghy.','Start at her keel, Alick.']],
      henry:[['Do you want me to take the next spell?','Say so while you can still open your hand.','I had to prise mine off a wet haft yesterday.'],['Give me your coat.','You’ve sat in the draught the whole time that forge has been hot.','I’ll hang it where it can dry.']],
      george:[['Have a look at my sleeve. I’ve brought half the charcoal home on it.','Henry says I could mark out a whole chessboard with the cuff.','Here, take the cleaner handle.'],['I can carry those in my palm.','I thought the first thing we took down from here would need all five of us.','Will you show me where they go?']]
    },
    4:{
      player:[['I can touch the two sides almost without moving.','I have been keeping Henry’s share of the gear clear of the boat.','There’s still very little room.'],['George asked if I could see him wave from the beach.','I hope he saw my hand go up.','After that I’ll have the helm to mind.']],
      raynal:[['I want to lean on that side the way a wave will.','Will you steady her, Alick?','I want to feel it move under me.'],['I keep thinking of another little job.','I could fill a week with them.','Hand me my coat.']],
      musgrave:[['I kept trying to find a place for five.','I have to ask two men to stay in that house.','I wish I could give them a date.'],['Alick, when we land they’ll want our names.','Give them Henry Forgés and George Harris too.','They’re the reason we’re going.']],
      henry:[['You have had that boat out in a chop. So have I.','I’ll keep the house. George and I can work here.','Leave our things up out of the wet.'],['There’s no sense in all of us getting wet to say goodbye.','You know the way to this house, Alick.','Show somebody else.']],
      george:[['I wanted to go and I was afraid to go.','I said both things to the captain.','I still mean both.'],['When you get round to Camp Cove you won’t see the house.','So I’ll wave to you here.','I know you saw me the first day.']]
    },
    5:{
      player:[['How long have I had the helm?','My palm still feels the tiller when I let go.','Your spell, Raynal. I’ll see to the water.'],['I can smell the shore.','Wet earth. How long since anything smelt like that?','Hold her a little longer.']],
      raynal:[['I’ve got the tiller. You can uncurl your fingers now.','Alick?','I said I’ve got her.'],['There’s a break in the water ahead.','She’s coming easier to my hand.','Have we really been five nights out here?']],
      musgrave:[['Keep my line clear, will you?','If I let go of it I can’t keep my feet at the pump.','Tell me when you change hands again.'],['I could lie down here and sleep where I stand.','When we get ashore lend me your arm.','Just until I can feel the ground under me.']]
    },
    6:{
      player:[['They had to lead me up to the house at Port Adventure.','I could hardly eat the food they set before me.','Today I can stand up to tell Captain Cross where Henry and George are.'],['Macpherson walked the streets in the rain for this passage.','Cross has given me room aboard.','I wish the men could see how many hands it took.']],
      raynal:[['I woke and listened for the pump.','Somebody was cutting bread in the next room.','I lay there a little longer to hear it.'],['If Henry asks, we’re both safe here.','If George asks, tell him the same again.','He’ll want to hear it twice.']]
    },
    7:{
      player:[['There’s the turn into the harbour.','I was sure I’d see the house by now.','Another bend yet. I had forgotten how late it comes into view.'],['Henry and George are aboard.','Cross has put the kettle on.','I can take my coat off now.']],
      henry:[['Your sleeve is wet, Captain.','Listen to me. A month wondering if I’d ever see you, and that’s what comes out.','Give me your arm a moment.'],['Will you walk down with me?','I spent a month thinking I would run.','I would like to walk.']],
      george:[['Give me your hand.','Sorry, Captain. I’ve got both of mine round it.','Is Alick safe? Is Raynal?'],['Henry has gone back to look round once more.','I said I wouldn’t.','I did.']]
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
      {flag:'drillFailed',voice:'raynal',lines:['The point will not do the work. I can feel it giving.','We could use the metal for fastenings.','There’s the dinghy. She has her keel already.']},
      {flag:'drillFailed',voice:'musgrave',lines:['Bring the measurements for the boat we have.','I have spent enough time on the one we meant to build.','Let us see what the smaller job asks of us.']}],
    4:[{flag:'hullPlanked',until:'hullFastened',voice:'musgrave',lines:['The height looks better from down here.','Press against that board. You can still feel it give.','Give me the nails when you feel where she springs.']},
      {flag:'hullFastened',voice:'henry',lines:['Have a look through what is left here before we clear it away.','The house could use a sound board too.','We can leave a little work for ourselves while you are gone.']},
      {flag:'boatSealed',until:'sailRigged',voice:'musgrave',lines:['Run your eye along the joints once more.','We have done what we can on land to keep the water out.','The next gust will tell us about the sail.']}],
    5:[{flag:'rigSecured',until:'boatDry',voice:'raynal',lines:['The line has come clear of my arm. I can steer now.','Is there room for you to bail beside the captain?','Let us get the water out while the line is holding.']},
      {flag:'boatDry',until:'sailMended',voice:'musgrave',lines:['The water is lower. Keep watching it.','It has taken all three of us to gain that much.','Raynal, how much of that sail is still whole?']},
      {flag:'sailMended',voice:'raynal',lines:['There. The wind is working on the cloth again.','My fingers are about done with it.','Can you see anything ahead that stays in one place?']}],
    6:[{flag:'chartMarked',until:'rescueRoute',voice:'player',lines:['That is the arm of the harbour where we built the house.','Captain Cross ought to see it here on the table.','It looks simple with the whole coast spread out in front of you.']},
      {flag:'rescueRoute',voice:'player',lines:['Captain Cross can see where the harbour narrows now.','I have told him where the weather is likely to catch us.','Time to see what people have brought down to the cutter.']},
      {flag:'rescueSupplied',voice:'raynal',lines:['When we came ashore, people had to take our weight between them.','What they have sent will do more good than I can say.','Tell Henry and George where it came from.']}],
    7:[{flag:'suppliesShared',voice:'henry',lines:['Your sleeve is wet, Captain. Come here.','It’s been weeks since we heard another voice in this house.','Wait till I have my feet under me. Then we’ll go.']},
      {flag:'suppliesShared',voice:'george',lines:['Give me your hand a minute. Are Alick and Raynal safe?','Henry and I had hard words in here. We nearly went our own ways.','We did get that raft afloat, though. Four empty casks.']},
      {flag:'henryFound',until:'georgeFound',voice:'player',lines:['Henry is here.','George may have heard us from the other side of the room.','I want to tell him myself that the boat can take them both.']},
      {flag:'georgeFound',until:'henryFound',voice:'player',lines:['George is here.','Let me speak to Henry before we go down.','They need to know there is room for both on the cutter.']},
      {flag:'landingMarked',voice:'henry',scene:'landing',lines:['Here’s the turning.','You’ve put a light where we can see it from the water.','All right, Captain. I’m coming.']}]
  };
  // One breath of dialogue at the work itself. Only the rising edge speaks, so
  // returning to a room or looking twice never repeats an automatic line.
  const workBeats={
    1:[
      ['shelterBuilt','henry','Get your shoulder under here too, Alick. I can move over.'],
      ['fireLit','player','I can see the tar in my knuckles again. Here, George. Your turn.'],
      ['signalRaised','george','I could see you from the shingle. Did you see my hand go up?']
    ],
    2:[
      ['roofSealed','henry','Listen. Just the rain on top now. I can put my boot back there.'],
      ['waterFetched','george','Give me the heavy side, Alick. I know where the path gives way.'],
      ['warmthReady','player','Put the chessmen out, Henry. There’s a dry stretch of table.']
    ],
    3:[
      ['charcoalTaken','george','Here, take the clean handle. You should see the state of my cuff.'],
      ['drillFailed','raynal','Three days on that point. Leave the big keel on its blocks, Alick.'],
      ['nailsForged','player','Hold out your palm. Those are for the dinghy we already have.']
    ],
    4:[
      ['planksTaken','henry','That board can go. The sound one behind it stays here with George and me.'],
      ['hullFastened','musgrave','Take your hand away, Alick. There. She’s holding.'],
      ['boatSealed','player','The little seams are dark all along her side. How small she looks from here.']
    ],
    5:[
      ['rigSecured','raynal','My spell at the tiller, Alick. Can you open your hand?'],
      ['boatDry','musgrave','I can feel the boards under my feet again. Keep that scoop by you.'],
      ['courseSet','player','Raynal, I can smell wet earth. Look where that dark bit stayed put when the boat rose.']
    ],
    6:[
      ['journalTaken','player','Some weeks I scarcely dared use the last sheets. Now Cross needs what’s on them.'],
      ['rescueRoute','player','There. You lose sight of the house until the last bend. I’ll show Cross myself.'],
      ['rescueSupplied','player','Macpherson walked the wet streets for those blankets. I’ll tell the men where they came from.']
    ],
    7:[
      ['boatMoored','player','Last time I made fast here I had to leave them.'],
      ['suppliesShared','henry','A whole parcel. We’d got into the habit of putting half of everything back.'],
      ['landingMarked','player','A light above the shore again. This time there’s a boat to see it.']
    ]
  };
  function workBeat(previousFlags,state){
    if(!previousFlags||!state?.flags||state.completed)return null;
    const entries=workBeats[state.chapter]||[];
    for(const [flag,id,text] of entries){
      if(!previousFlags[flag]&&state.flags[flag])return {id,text};
    }
    return null;
  }
  function chapterNumber(state){return Math.max(1,Math.min(7,Number(state&&state.chapter)||1));}
  function perspective(state){return {...PERSPECTIVES[chapterNumber(state)]};}
  function present(id,state){return PRESENT[chapterNumber(state)].includes(id);}
  function lines(id,state){
    const chapter=chapterNumber(state),who=perspective(state);
    const flags=state?.flags||{};
    const finished=Boolean(state&&(state.chapterComplete||state.completed));
    const momentFor=voice=>!finished&&moments[chapter]?.findLast(m=>m.voice===voice&&(!m.scene||m.scene===state.scene)&&flags[m.flag]&&!flags[m.until]);
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
    const onLanding=!finished&&chapter===7&&state.scene==='landing'&&flags.henryFound&&flags.georgeFound;
    let selected=moment?moment.lines:encounter[finished?1:0];
    if(bothFound)selected=reunion;
    if(onLanding&&resolved==='george')selected=['When we made our raft I thought I’d never step on another deck.','Henry, mind the step down.','I’ve got the side.'];
    return {speaker:resolved==='player'?`You · ${who.name}`:NAMES[resolved],portrait:resolved==='player'?who.portrait:`assets/people/${resolved}.png`,lines:selected.slice()};
  }
  function ambient(id,state){return lines(id,state).lines[0];}
  return {lines,ambient,workBeat,perspective,present,CHAPTER_BEATS,PERSPECTIVES,ENDING};
});

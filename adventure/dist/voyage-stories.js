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
    {chapter:3,title:'What Iron Can Become',caption:'Early 1865. The keel of a new cutter lies on the blocks. Raynal has made chisels and a saw. How will they bore the bolt holes?'},
    {chapter:4,title:'Room for Three',caption:'July 1865. The old dinghy has room for three. Alick brings the new nails down to finish her sides.'},
    {chapter:5,title:'Five Days of Ocean',caption:'19–24 July 1865. The three sail from Camp Cove. Alick and Raynal spell each other at the helm. Musgrave works the pump.'},
    {chapter:6,title:'The Promise',caption:'Late July 1865. From Port Adventure the three have reached Invercargill. Musgrave helps load the cutter for the return to Henry and George.'},
    {chapter:7,title:'Until We Return',caption:'24 August 1865. Henry and George have seen the cutter. Musgrave and Cross land while Flying Scud keeps under sail.'}
  ];
  const PERSPECTIVES={
    1:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/cast-portraits/player.webp'},
    2:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/cast-portraits/player.webp'},
    3:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/cast-portraits/player.webp'},
    4:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/cast-portraits/player.webp'},
    5:{id:'player',name:'Alick McLaren',label:'Playing as Alick McLaren',portrait:'assets/cast-portraits/player.webp'},
    6:{id:'musgrave',name:'Thomas Musgrave',label:'Playing as Captain Musgrave',portrait:'assets/cast-portraits/musgrave.webp'},
    7:{id:'musgrave',name:'Thomas Musgrave',label:'Playing as Captain Musgrave',portrait:'assets/cast-portraits/musgrave.webp'}
  };
  const NAMES={player:'Alick McLaren',raynal:'François Raynal',musgrave:'Thomas Musgrave',henry:'Henry Forgés',george:'George Harris'};
  const PRESENT={1:['player','raynal','musgrave','henry','george'],2:['player','raynal','musgrave','henry','george'],3:['player','raynal','musgrave','henry','george'],4:['player','raynal','musgrave','henry','george'],5:['player','raynal','musgrave'],6:['musgrave','raynal'],7:['musgrave','henry','george']};
  const ENDING={
    title:'All five survived.',
    line:'Three of Grafton’s crew reached Port Adventure in July. On 24 August 1865, Henry and George came aboard Flying Scud.',
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
  // The film leaves on an image. The first voice belongs to someone in the room.
  const chapterArrivals = {
    cabin:   {chapter:2, id:'henry', text:'Found your red knight, Alick. He was sitting in half an inch of water.'},
    forge:   {chapter:3, id:'raynal', text:'The hearth’s stone cold, Alick. Think we can make a drill before we lose the light?'},
    slipway: {chapter:4, id:'musgrave', text:'Those nails of yours will do, Alick. Come round here and sight along this seam with me.'},
    crossing:{chapter:5, id:'musgrave', text:'I’ve got the pump. Alick, mind that loose end by the tiller!'},
    harbour: {chapter:6, id:'raynal', text:'You’ll see Henry before I do, Captain. Let’s get these supplies aboard.'},
    landing: {chapter:7, id:'musgrave', text:'Henry and George have gone up for their things. I’ll make the boat fast and go after them.'}
  };
  function chapterArrival(state) {
    const line = chapterArrivals[state?.scene];
    if (!line || line.chapter !== state.chapter || state.chapterComplete || state.completed) return null;
    return {id:line.id, text:line.text};
  }
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
      ['journalTaken','musgrave','Some weeks I scarcely dared use the last sheets. Now Cross needs what’s on them.'],
      ['rescueRoute','musgrave','There. You lose sight of the house until the last bend. I’ll show Cross myself.'],
      ['rescueSupplied','musgrave','Macpherson walked the wet streets for those blankets. I’ll tell the men where they came from.']
    ],
    7:[
      ['boatMoored','musgrave','That’ll hold. We can carry whatever Henry and George want to take with them.'],
      ['suppliesShared','henry','A whole parcel. We’d got into the habit of putting half of everything back.'],
      ['landingMarked','musgrave','A light above the shore again. This time there’s a boat to see it.']
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
  const {turn, exchange} = base;
  const Alick = 'player', Raynal = 'raynal', Musgrave = 'musgrave', Henry = 'henry', George = 'george';

  function winter(id, room, f) {
    if (room === 'forest') {
      if (id === Alick) return exchange(Alick, George, 'Which way did you come down?', 'Along the bank. That shiny stone put me on my back yesterday.',
        'Then I’ll go where you went today.');
      if (f.waterFetched) return exchange(George, Alick, 'Let me have the neck of the skin for a minute.', 'Too heavy?',
        'For you to carry up that bank with both hands. Take hold of my sleeve.');
      return exchange(George, Alick, 'Alick! Come up this side. I’ve found a place where you can reach the running water.',
        'Can I put a foot on that flat stone?', 'Only if you want a bath. Give me your hand.');
    }
    if (id === Alick) return exchange(Alick, Henry, 'Where did you put the chessmen?',
      f.warmthReady ? 'Back on the table. It’s your move.' : 'In my boot. It was the first dry thing I came to.',
      f.warmthReady ? 'That knight’s had all winter to think of a move.' : 'Then I’d better do something about that roof.');
    if (f.warmthReady) return exchange(Henry, Alick, 'There’s a cup for George when he comes in.',
      'What’s that in mine?', 'Your red knight. I thought that might bring you back to the table.');
    if (f.roofSealed && f.waterStored) return exchange(Henry, Alick, 'Try the handle, Alick. The kettle’s stone cold.',
      'There’s water in it, and the roof holds.', 'Then we can have something hot for George when he comes in.');
    if (f.roofSealed) return exchange(Henry, Alick, 'Hear it? I’ve had my ear out for that drip all day.',
      'I hear rain on the roof.', 'Exactly. I can set the kettle there again. Did George find good water?');
    if (f.waterStored) return exchange(Henry, Alick, 'I’d move the kettle, but then the roof would fill my boots again.',
      'Keep the water for drinking. I’ll go up and find the leak.', 'Stand where I’m standing first. You can see the drops against the light.');
    if (f.patchStitched) return exchange(Henry, Alick, 'Will that piece cover it?', 'If I can find where the water gets in.',
      'Watch one drop all the way down. It doesn’t come straight through.');
    return exchange(Henry, Alick, 'A drop hit the board just as you moved your knight last night. Listen. There goes another.',
      'Where’s it coming in? I can’t see a hole from here.', 'Watch the next drop against the window. I’ll move the bedding clear.');
  }

  function iron(id, room, f) {
    if (room === 'charcoal') {
      if (id === Alick) return exchange(Alick, George, 'Have you been at the forge already?', 'What gave me away?', 'You’ve scratched your nose with your charcoal hand.');
      if (f.ironTaken && f.charcoalTaken) return exchange(George, Alick, 'What does Raynal think of that scrap?',
        f.drillFailed ? 'It bent. We’ll use it for fastenings.' : 'He wants to see what it’ll do in hard wood.',
        f.drillFailed ? 'Then I’ll keep the little pieces as well.' : 'Let me know. No sense carting the heavy pieces up till we know.');
      if (f.charcoalTaken) return exchange(George, Alick, 'Did the basket carry all right?', 'It did. What have you got there?',
        'Iron I set aside from the wreck. Small enough for the block, I thought.');
      return exchange(George, Alick, 'Take the basket by this handle. The other one pulls through.', 'Did you carry it up here like that?',
        'On my hip. Look at my coat. You can tell which side.');
    }
    if (id === Alick) return exchange(Alick, Raynal, 'That block used to lie in our hold.', 'It makes a fair anvil. Will you turn the piece while I sight along it?',
      'I’ll take the cold end.');
    if (f.nailsForged) return exchange(Raynal, Alick, 'Can you carry this lot without putting a hole in your pocket?',
      'Better give me the cloth. I’ll wrap them in that.', 'Good. Take them down to the dinghy. There’s a hull there already.');
    if (f.drillFailed) return exchange(Raynal, Alick, 'Feel where the point turned over. Three days I’ve been on that bit.',
      'And we need a hole for every bolt in the cutter.', 'Yes. Leave her on the blocks. I can make nails for the dinghy with what’s left.');
    if (f.drillForged) return exchange(Raynal, Alick, 'That point looks handsome enough on the block.',
      'Will it bite deep enough for a bolt?', 'Give it a turn in the timber. I’d sooner find out here than at the keel.');
    if (f.forgeLit) return exchange(Raynal, Alick, 'There’s heat enough now. How many holes did you say we need?',
      'One for every bolt in the big boat.', 'Then our first piece had better be something to bore them with.');
    if (f.bellowsFitted) return exchange(Raynal, Alick, 'Hold your palm by the mouth while I squeeze.', 'I feel it right at the bottom.',
      f.forgeFueled ? 'That should bring the charcoal up once we have a spark.' : 'Good. That’s where George’s charcoal has to burn.');
    return exchange(Raynal, Alick, 'A thin chisel heats through in this fire. The middle of that thick piece stayed cold.',
      'Where do you want the draught, then?', 'Down through the coals. Bring that leather over and I’ll show you.');
  }

  function boatyard(id, room, f) {
    if (room === 'salvage') {
      if (id === Alick) return exchange(Alick, Henry, 'What do you and George need left here?', 'Something to mend with. You’re taking our needle to the boat.',
        'I’ll bring it back to the bench before we go.');
      if (f.planksTaken) return exchange(Henry, Alick, 'That leaves one long board for the house. How’s the boat answering?',
        f.hullFastened ? 'The new side holds when I lean on it.' : 'I’ll know when we lean on the new side.',
        'Lean hard. Once you’ve gone there’s the whole sea to lean against it.');
      return exchange(Henry, Alick, 'Wait, Alick. George and I want the board at the back.', 'For the house? I thought those were all for us.',
        'That one stays dry under the eaves. Take the straight ones in front. They’ll sit better along your hull.');
    }
    if (id === Alick) return exchange(Alick, Musgrave, 'Where will the water come up to when we’re aboard?', 'Show me where you sat last time.',
      'Here. Even with three of us the sea was close enough to put a hand in.');
    if (f.boatSealed && f.sailRigged) return exchange(Musgrave, Alick, 'When we land, they’ll ask how many of us came ashore.',
      'Three in the boat. Henry and George are still here.', 'Say their names just like that. We need a passage back for two.');
    if (f.hullFastened && !f.boatSealed) return exchange(Musgrave, Alick, 'Can you still see my fingers through that seam?',
      'Just a line of daylight. The board holds, though.', 'Keep your eye on it from that side. Show me where the light gets through.');
    if (f.boatSealed) return exchange(Musgrave, Alick, 'Give the side another push. Does the joint open?', 'No. I can feel the whole boat move this time.',
      'Good. Let’s see how she takes the sail.');
    if (f.hullPlanked) return exchange(Musgrave, Alick, 'Press here with your palm. Feel the other end spring?',
      'I can’t hold them both and drive a nail.', 'Give me the nails. You hold her where she springs and I’ll drive one through at the rib.');
    return exchange(Musgrave, Alick, 'Stand here, Alick. Run your hand down the side we’ve raised. Feel where the wood runs out?',
      'Right here, at the rib. Henry has some straight boards under cover.', 'Bring them down. I’ll hold the ends while you fit the last length.');
  }

  function passage(id, f) {
    if (id === Alick) return exchange(Alick, Raynal, 'Will you take my next spell at the helm?', 'Yes. Let go one hand at a time. I’ve got her.',
      'Give me a minute to get the feeling back and I’ll relieve you.');
    if (f.courseSet) return id === Musgrave
      ? exchange(Musgrave, Alick, 'When we get in, lend me your arm.', 'Are your legs bad, sir?', 'I can stand while the boat’s moving. I’ve forgotten how to take a step.')
      : exchange(Raynal, Alick, 'Can you still see the land?', 'Yes. It stays put when we lift on a sea.', 'Keep your eye on it. I’ll hold her there.');
    if (f.sailMended) return id === Musgrave
      ? exchange(Musgrave, Alick, 'I can feel her answering again. What does the compass say?', 'Give me a moment. It’s swinging with the boat.',
          'Take your time over it. I can keep up with the water now.')
      : exchange(Raynal, Alick, 'The sail’s drawing on my hand again. Which way for land?',
          'Wait till I can read the card level.', 'Tap my shoulder when you have it. I can’t look round.');
    if (f.boatDry) return id === Raynal
      ? exchange(Raynal, Alick, 'Listen to that cloth slap. I can feel it through the tiller.', 'The tear gets wider every time it fills.',
          'I’ll ease her for you. You’ll get a moment with it slack.')
      : [turn(Musgrave, 'That scoop helped. I can see the boards again.'), turn(Alick, 'Can you keep up if I leave you for the sail?'),
          turn(Musgrave, 'I can for a bit. Raynal?'), turn(Raynal, 'Go on, Alick. I’ll keep her as steady as she’ll let me.')];
    if (id === Musgrave) return exchange(Musgrave, Alick, 'Mind my rope, Alick. It’s the only thing keeping me at this pump.',
      f.rigSecured ? 'I’ll take the scoop. Where’s it deepest?' : 'Your rope’s clear, sir. It’s the loose rig that keeps catching my sleeve.',
      f.rigSecured ? 'Beside my foot. You work there and I’ll keep pumping.' : 'Get that fast first. I’d sooner have you in the boat.');
    if (f.rigSecured) return exchange(Raynal, Alick, 'There’s room for my elbow now. Let me have the tiller.',
      'Yours. Can you hold her while I bail?', 'Yes. Work beside the captain. The water runs that way when she heels.');
    return [turn(Raynal, 'Wait, Alick. The loose end caught my arm when I reached for the tiller.'),
      turn(Alick, 'I’ll take the line. Have you got her?'), turn(Raynal, 'I have her. You can use both hands.')];
  }

  function relief(id, room, f) {
    // Both playable places are in Invercargill. The men remember their earlier welcome on Stewart Island.
    if (room === 'chartroom') return [turn(Musgrave, f.rescueRoute
      ? 'Cross can follow that line now. I’ll be aboard to show him the turn myself.'
      : f.chartMarked ? 'There’s our harbour on the sheet. I’ll lay it out where Cross can see it.'
      : 'Here’s what Cross needs. My journal gives the turn into the harbour. There’s room to mark it on the chart.')];
    if (id === Musgrave) return exchange(Musgrave, Raynal, 'When they helped us ashore, I could hardly say who else was missing.',
      'You said two names. I heard them from the door.', 'Henry Forgés and George Harris. I’ll say them again to anyone who can help.');
    if (f.rescueRigged && f.rescueSupplied) return exchange(Raynal, Musgrave, 'If George asks about us, what will you tell him?',
      'That Alick had the sense to sleep and you’re on your feet asking questions.', 'That will do. He’ll know you’ve seen me.');
    if (f.rescueSupplied) return exchange(Raynal, Musgrave, 'Will Henry know who sent all this?', 'I’ll tell him about Macpherson going door to door in the rain.',
      'Tell him about the people who opened their doors, too.');
    if (f.provisionsTaken) return exchange(Raynal, Musgrave, 'Keep that bundle where you can reach it.', 'Are you thinking of the landing?',
      'Of Henry. He’ll want to help carry everything before he’s had anything to eat.');
    return exchange(Raynal, Musgrave, 'Macpherson’s blankets are here, Captain. Have you room for food as well?',
      'Plenty. At Port Adventure I could scarcely eat the breakfast they gave me.',
      'Pack a little where you can reach it. They may want a bite the moment you step ashore.');
  }

  function homecoming(id, room, f) {
    if (room === 'landing') {
      const invitation = 'Then come aboard. Cross has places at supper for all three of us.';
      if (f.menRescued) {
        if (id === Henry) return exchange(Henry, Musgrave, 'I can still feel the grain of that post in my palm.',
          'Can you open your hand, Henry?', 'Wide enough for a cup of tea.');
        if (id === George) return exchange(George, Musgrave, 'I owe Alick a handshake when we see him.',
          'And Raynal?', 'One for each hand, then.');
        return [turn(Musgrave, 'When Alick asks, I can tell him I brought them both back.')];
      }
      if (id === Henry) return exchange(Henry, Musgrave, 'Does Cross mind us coming down slowly?', 'He’s waited on worse things than two men walking.',
        'Good. I thought I’d run this whole way when the day came.');
      if (id === George && f.landingMarked) return exchange(George, Musgrave, 'I’ve got Henry’s arm. Is that everything, Captain?',
        invitation, 'You heard him, Henry. Hold on to me.');
      if (id === George) return exchange(George, Musgrave, 'Let me have the side of the boat. Henry, you can lean on me.',
        'I’ve got the line. She’ll keep still for you.', 'All right. It’s a long step after a month wishing for it.');
      if (!f.boatMoored) return [turn(Musgrave, 'Flying Scud has to keep under sail. Steady this boat while I get the line.')];
      if (!f.henryFound && !f.georgeFound) return [turn(Musgrave, 'She’ll hold there. I want a word with Henry and George.')];
      if (!f.georgeFound) return [turn(Musgrave, 'Henry’s on his feet. I want a word with George.')];
      if (!f.henryFound) return [turn(Musgrave, 'George has heard the news. I’ll speak to Henry myself.')];
      if (!f.suppliesShared) return [turn(Musgrave, 'I’ll take the provisions up to the house. Those two have carried enough.')];
      if (!f.landingMarked) return exchange(Musgrave, George, 'Can Cross see this landing from the cutter?',
        'He’ll lose it against the trees when the light goes.', 'Then hold her here, George. I’ll put the lantern up before we leave.');
      return exchange(Musgrave, George, 'Both men here. Is Henry clear of the line?', 'Yes. I’ve got his arm.', invitation);
    }
    if (id === Musgrave) {
      if (f.henryFound && f.georgeFound) return exchange(Musgrave, Henry, 'Both men in front of me at last. Have you got what you want to bring?',
        'I’ll have one more look at the house. George has the rest.', 'I’ll wait at the door.');
      if (f.henryFound) return exchange(Musgrave, Henry, 'Henry, will George want a hand getting out?', 'Ask him yourself. You’ve waited a month to talk to him.',
        'I have. And he’s been waiting on word of the others.');
      if (f.georgeFound) return exchange(Musgrave, George, 'George, can Henry walk down?', 'Let him tell you. He’s had me answering for him long enough.',
        'Fair enough. I’ll go to him.');
      return exchange(Musgrave, George, 'Got your breath back, George? You nearly shook my arm off down on the beach.',
        'I’ve got mine, Captain. Give Henry a moment.', 'Of course. I’ve thought about walking into this room every day since we left.');
    }
    if (id === Henry) {
      if (!f.henryFound) return exchange(Henry, Musgrave, 'Your sleeve is wet, Captain. I can feel it through mine.', 'I’ll move over. Here, take my arm.',
        'Leave it there a moment. When you stepped ashore I had to steady myself against a post.');
      if (f.suppliesShared) return exchange(Henry, Musgrave, 'Hanging on your sleeve again. I used to carry my end of a raft, you know.',
        'You made a raft?', 'Four empty casks. George and I got more work out of them than either of us could do alone.');
      return exchange(Henry, Musgrave, 'How much are we to take down?', 'What you want to keep. There’s room in the cutter.',
        'Then give me time to look along that shelf. A month ago I’d have said there was nothing here worth keeping.');
    }
    if (!f.georgeFound) return exchange(George, Musgrave, 'I shook your hand so hard I forgot to ask. Where are Alick and Raynal?',
      'Both safe. We reached Port Adventure together.', 'Both? Right. You can have your hand back now.');
    if (f.suppliesShared) return exchange(George, Musgrave, 'Look at the size of that parcel. We were down to counting every handful.',
      'How did the two of you manage?', 'Badly some days. We came near to going our own ways. But we got that raft afloat together.');
    return exchange(George, Musgrave, 'Henry keeps looking round. I told him I’d never give this room another look.',
      'And will you?', 'Give me your hand with this bundle first. Then I think I will.');
  }

  // Legacy calls without a room still have a sensible face and voice for the addressed crewmate.
  const roomsFor = {
    2: {default:'cabin', george:'forest'}, 3: {default:'forge', george:'charcoal'},
    4: {default:'slipway', henry:'salvage'}, 5: {default:'crossing'},
    6: {default:'harbour'}, 7: {default:'return_camp'}
  };
  function conversation(id, state) {
    const chapter = chapterNumber(state), f = state?.flags || {};
    if (chapter === 1) return base.conversation(id, state);
    const actor = id === 'player' ? perspective(state).id : id;
    const room = state?.scene || roomsFor[chapter][actor] || roomsFor[chapter].default;
    switch (chapter) {
      case 2: return winter(actor, room, f);
      case 3: return iron(actor, room, f);
      case 4: return boatyard(actor, room, f);
      case 5: return passage(actor, f);
      case 6: return relief(actor, room, f);
      case 7: return homecoming(actor, room, f);
    }
  }
  function speakerInfo(id, state) {
    const info = base.speakerInfo(id);
    if (id === perspective(state).id) info.speaker = 'You · ' + info.speaker;
    return info;
  }
  function lines(id, state) {
    const turns = conversation(id, state);
    return {...speakerInfo(turns[0].id, state), lines: turns.map(line => line.text)};
  }
  function ambient(id, state) { return conversation(id, state)[0].text; }
  return {lines, ambient, conversation, arrival:base.arrival, speakerInfo,
    chapterArrival, workBeat, perspective, present, CHAPTER_BEATS, PERSPECTIVES, ENDING};
});

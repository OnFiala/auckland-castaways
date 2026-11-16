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
    {chapter:2,title:'A Home by the Water',caption:'Winter, 1864. The roof holds. Now they must keep one another going.'},
    {chapter:3,title:'The Last Drill',caption:'Early 1865. Their tools have limits. Their plan must change.'},
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
      {text:'Captain Cross and the people who welcomed and supported them made the return possible.',sources:['S001','S003'],evidence:['E033','E035']},
      {text:'Musgrave returned on Flying Scud. Henry Forgés and George Harris were rescued on 24 August 1865.',sources:['S001'],evidence:['E039']},
      {text:'The Invercauld castaways had a separate ordeal. The two groups did not meet during their marooning.',sources:['S001','S002','S003','S005','S007'],evidence:['E048']}
    ],
    note:'Puzzles, conversations, character likenesses and precise staging are fictional. The historical outcome is documented.'
  };
  // Each encounter has an opening and a short response after the chapter's work.
  const voices={
    2:{
      player:[['I used to judge a day by the distance sailed.','Now I judge it by what stays dry.','A small repair can last longer than a good mood.'],['The others will notice the roof before they notice my hands.','That is all right.','Tonight the work can speak for itself.']],
      raynal:[['My first repairs looked better than they worked.','Wet leather teaches the lesson twice.','Let me see where that seam is pulling.'],['There. It need not be handsome to keep the weather out.','We can improve it when our hands are warm.','Not every answer has to arrive on the first attempt.']],
      musgrave:[['I still turn toward the water when the wind changes.','Then I remember the work waiting behind me.','Keeping watch must not mean leaving everything else to the others.'],['Nothing has appeared beyond the harbour.','But the fire is tended, and the house is holding.','That is something I can report honestly.']],
      henry:[['There is always another wet sleeve beside the fire.','Bring yours nearer. I can move over.','Tomorrow someone else can take this place and keep it going.'],['The room sounds different when everyone has stopped shivering.','Stay until you can feel your fingers.','I will take my turn after you.']],
      george:[['Some mornings I do not want to open the door.','It helps if there is one clear thing to do outside.','And someone who will notice when I come back.'],['I thought the whole day had gone wrong.','Then I came home and saw what you had repaired.','Perhaps we are allowed a quiet evening.']]
    },
    3:{
      player:[['Charcoal on my sleeves. Iron on the bench.','Everything here has already belonged to something else.','Let us make this piece earn another life.'],['The work did not give us the ship we first imagined.','It gave us something we can actually use.','We can begin again from there.']],
      raynal:[['A tool can look right and still fail under pressure.','I would rather find that out here than halfway through a hull.','We must test it, not just admire it.'],['There is only so much good steel left.','Repeating the same failure will not make more.','Let us change the work to fit what our hands can make.']],
      musgrave:[['I have been measuring a ship larger than our means.','The drawing is easier than the work.','Tell me what the tools can really do.'],['Then we use the boat we already have.','Smaller, and a harder voyage.','But a real plan can be prepared for.']],
      henry:[['Even the forge needs someone to fetch and carry.','Say when you need a rest.','There is no virtue in letting a tired hand spoil the next piece.'],['You have put the iron down at last.','Good. Now sit down beside it.','We will need those hands again tomorrow.']],
      george:[['I used to wait for the clever part to happen.','Then I noticed how much of it was carrying fuel.','There is room for me in this work.'],['I know which pieces passed the test.','I helped make them possible.','That is a better thing to carry home than another guess.']]
    },
    4:{
      player:[['I have crossed water in better boats than this.','None of them mattered quite so much.','I will check every fastening once more.'],['The boat is ready. I am not sure anyone can be.','Henry and George will watch us leave.','Every mile must lead toward bringing help back.']],
      raynal:[['The boat must carry the sea as well as our hopes.','Try the seams. Work the pump.','Anything we can learn here is cheaper than learning it offshore.'],['I can still find things I would improve.','There will always be one more.','We have to distinguish unfinished work from fear of leaving.']],
      musgrave:[['There is room for three on the passage.','That leaves two here, beyond our sight.','Their provisions belong in the plan as much as ours do.'],['We have prepared the boat and the men who must remain.','I cannot promise a date.','I can promise what I am setting out to do.']],
      henry:[['Do not pack every useful thing into the boat.','George and I will still have a roof to mend.','Leave us a working home, not an empty one.'],['We know which stores are ours and what needs tending.','Go when the weather lets you.','Come back with more than a story.']],
      george:[['I keep counting places in the boat.','It does not change the number.','Tell me what we can do here while you are away.'],['I will watch from the shore until I cannot see you.','After that, there is the house and the next day.','I would rather have a plan than keep counting.']]
    },
    5:{
      player:[['The boat lifts, and the shore is gone again.','Keep the line clear. Give the helm a steady hand.','The next small task is close enough to reach.'],['Land. I have stopped trusting my eyes.','Raynal sees it too.','Keep working until we are actually ashore.']],
      raynal:[['Take your turn at the helm. I will watch the line.','We can speak when the next sea has passed.','For now, let your hands tell me you are there.'],['There is a sheltered shore ahead.','I had forgotten that water could look still.','Not yet, though. One more careful approach.']],
      musgrave:[['The pump must keep working.','Alick, keep her head steady while Raynal takes the line.','We shall count the hours when there is room to think.'],['There are people ashore.','I have been thinking of Henry and George all this way.','Now we can tell someone where they are.']]
    },
    6:{
      player:[['Someone has put dry clothes within reach.','For the first time, I do not have to make everything we need.','I must explain where the other two are.'],['People I had never met have given us a ship and supplies.','Their kindness is taking a very practical shape.','I will go with Captain Cross and show him the harbour.']],
      raynal:[['There is bread here without a day of searching first.','It takes a little getting used to.','Make them understand that two of us are still waiting.'],['I know you want to go home.','First there are two men who need you to find the way back.','Bring them out of that house.']]
    },
    7:{
      player:[['I know the outline of this shore.','I do not know what their last month has been like.','First, find them. Then we can ask.'],['Henry and George are aboard.','There will be time for the things we could not bring.','For now, both places are filled.']],
      henry:[['I heard George before I saw the boat.','Give me a moment. I need to believe you are standing here.','Then tell me what I must carry.'],['I thought leaving would feel like running.','I can barely make myself step away.','All right. I am coming.']],
      george:[['I have imagined that sail so often.','Today it stayed when I looked again.','Henry is here. I will get him.'],['I have what I need.','No, wait — let me look once more.','Now we can go.']]
    }
  };
  const moments={
    2:[{flag:'roofSealed',voice:'henry',lines:['Listen. The rain has moved to the other side of the roof.','Bring the water in while the way is clear.','I can tend this end of the room.']}],
    3:[{flag:'drillFailed',voice:'raynal',lines:['There is the answer. The edge will not hold.','We can still make fastenings from this metal.','The smaller boat is a change of plan, not the end of one.']},
      {flag:'drillFailed',voice:'musgrave',lines:['I wanted the larger vessel badly enough to mistake it for our only chance.','We already have a boat.','Let us measure what we can do with that.']}],
    4:[{flag:'boatSealed',voice:'player',lines:['The seams are holding better.','Now the boat needs a way to use the wind.','After that, we will have to stop calling this a workshop.']}],
    5:[{flag:'boatDry',voice:'musgrave',lines:['The water is lower. Keep watching it.','It has taken all three of us to gain that much.','Now see what the wind has done to the sail.']}],
    6:[{flag:'rescueRoute',voice:'player',lines:['There. That is the harbour, and this is where they are waiting.','Captain Cross can read the chart with me.','The supplies must be ready before we sail.']}],
    7:[{flag:'henryFound',voice:'player',lines:['Henry is here.','I will not leave with only one of them accounted for.','George cannot be far from the house.']},
      {flag:'georgeFound',voice:'player',lines:['George is here.','Now I need to see Henry safely down to the landing too.','There is room for both on the cutter.']}]
  };
  function chapterNumber(state){return Math.max(1,Math.min(7,Number(state&&state.chapter)||1));}
  function perspective(state){return {...PERSPECTIVES[chapterNumber(state)]};}
  function present(id,state){return PRESENT[chapterNumber(state)].includes(id);}
  function lines(id,state){
    const chapter=chapterNumber(state),who=perspective(state);
    if(chapter===1){const result=base.lines(id,state);if(id==='player')result.speaker='You · Alick McLaren';return result;}
    // An absent crewmate never speaks from a ship on which he did not travel.
    const resolved=present(id,state)&&voices[chapter][id]?id:'player';
    const finished=Boolean(state&&(state.chapterComplete||state.completed));
    const encounter=voices[chapter][resolved],flags=state&&state.flags||{};
    const moment=!finished&&(moments[chapter]||[]).find(m=>m.voice===resolved&&flags[m.flag]&&!(chapter===7&&flags.henryFound&&flags.georgeFound));
    const bothFound=!finished&&chapter===7&&resolved==='player'&&flags.henryFound&&flags.georgeFound;
    const selected=bothFound?['Both men are here.','Make sure the landing is ready and the supplies are shared.','Then we can leave this shore together.']:moment?moment.lines:encounter[finished?1:0];
    return {speaker:resolved==='player'?`You · ${who.name}`:NAMES[resolved],portrait:resolved==='player'?who.portrait:`assets/people/${resolved}.png`,lines:selected.slice()};
  }
  function ambient(id,state){return lines(id,state).lines[0];}
  return {lines,ambient,perspective,present,CHAPTER_BEATS,PERSPECTIVES,ENDING};
});

/* Original fictional dialogue inspired by the research in adventure/STORIES.md.
   No line is a quotation or a reconstructed historical conversation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CastawayStories=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const voices={
 player:{speaker:'You',portrait:'assets/sailor.png',
  arrival:['Five of us ashore. I keep counting, though I know the answer.','There must be something here we can use.','One thing at a time.'],
  shelter:['A roof changes the sound of the rain.','For a moment, I can hear myself think.','We have made a place to come back to.'],
  fire:['My hands are beginning to feel like mine again.','It is easier to look at the others now.','We have something warm to share.'],
  signal:['A scrap of canvas against all that sky.','I want someone out there to notice it.','Until then, there are five of us here.']},
 raynal:{speaker:'François Raynal',portrait:'assets/people/raynal.png',
  arrival:['The illness has left me slower than I would like.','My hands still remember their work.','Bring that sail within reach, and we can make a start.'],
  shelter:['I have worked underground. A low roof does not trouble me.','A leaking one does.','That canvas is worth more to us here than it was in the water.'],
  fire:['I had begun to forget what dry sleeves felt like.','Look at us, admiring a little flame.','Tomorrow we can try something more ambitious.'],
  signal:['I keep finding another use for what the wreck has left us.','It is a habit worth keeping.','That flag gives our work a voice beyond the shore.']},
 musgrave:{speaker:'Thomas Musgrave',portrait:'assets/people/musgrave.png',
  arrival:['I keep looking back at the Grafton.','A captain should have a better answer than an inventory of what washed ashore.','But five men are here. That is where I must begin.'],
  shelter:['On the ship, I knew where everyone belonged.','Here, we shall have to learn that again.','At least tonight we can all get out of the rain.'],
  fire:['I have been watching the sky so long that I nearly missed this.','A fire, and room for everyone beside it.','Let me sit with you a moment.'],
  signal:['I wish I could tell you when a sail will appear.','I cannot.','I can promise to keep looking, and to listen when another man has an idea.']},
 henry:{speaker:'Henry Forgés',portrait:'assets/people/henry.png',
  arrival:['Everyone watches the sea. I keep watching where we will sleep.','I would like one dry place where we can sit together.','It is a small thing to ask of an island.'],
  shelter:['Come under here. You have earned a moment out of the rain.','It is hardly a house yet.','Still, I like the sound of five people making room for one another.'],
  fire:['Give your hands a turn by the fire.','I was saving that patch for you.','We can argue about the best seat when we have six of them.'],
  signal:['The flag can watch the sea for a little while.','Come back before you are cold again.','I would rather have company than the best seat by the fire.']},
 george:{speaker:'George Harris',portrait:'assets/people/george.png',
  arrival:['I keep thinking I hear someone call from the ship.','Then it is only the water moving through her.','It helps to hear a real voice.'],
  shelter:['I carried things up from the beach without knowing where to put them.','Now there is a place.','Funny how much that matters.'],
  fire:['I can see all our faces from here.','Earlier, everyone seemed so far apart, even on this little shore.','Stay a moment, will you?'],
  signal:['From down on the beach, I can see the flag moving.','I stood there longer than I needed to.','It felt good to see something we had put right.']}
};
function stage(state){const f=state&&state.flags||{};return f.signalRaised?'signal':f.fireLit?'fire':f.shelterBuilt?'shelter':'arrival';}
function lines(id,state){const voice=Object.hasOwn(voices,id)?voices[id]:voices.player;return {speaker:voice.speaker,lines:voice[stage(state)].slice(),portrait:voice.portrait};}
function ambient(id,state){return lines(id,state).lines[0];}
return {lines,ambient};
});

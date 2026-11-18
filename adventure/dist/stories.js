/* Original dramatic speech. See ../HISTORICAL_ADAPTATION.md for the evidence. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CastawayStories=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const voices={
    player:{speaker:'You',portrait:'assets/sailor.png',
      arrival:['George! Can you hear me from there?','There. He lifted his hand.','That makes five.'],
      shelter:['Listen under here.','You can hear the rain move across the sail before it reaches you.','I used to hear it overhead in my berth.'],
      fire:['I can bend my fingers again.','Look at the tar in the creases. I thought it was all washed off.','Here, take my place.'],
      signal:['I went down to see how she looked from the water.','For a moment I could only see the trees.','Then our little piece of sail lifted.']},
    raynal:{speaker:'François Raynal',portrait:'assets/people/raynal.png',
      arrival:['This illness has made a very long walk of one short beach.','Sit me up a little, Alick. There.','Watch that corner of sail when the wind drops.'],
      shelter:['Hold it up to the light. See those pinpricks?','We can live with pinpricks.','That split by the edge is the one to watch.'],
      fire:['I thought I would have to ask someone to hold my cup.','Look. One hand.','Tomorrow, if I can, I should like some work.'],
      signal:['I used to keep good canvas away from a knife.','I would have scolded you for cutting that strip.','It looks very well up there.']},
    musgrave:{speaker:'Thomas Musgrave',portrait:'assets/people/musgrave.png',
      arrival:['I was at the pumps when the water reached the cabin table.','I keep looking over there as if I had left something on it.','Who has seen Raynal?'],
      shelter:['When we went ashore I counted you from the boat.','I have just counted you again.','Humour me if you see me do it tomorrow.'],
      fire:['Is there room here for me?','My coat is dripping. I can take it off.','Thank you.'],
      signal:['If anyone comes looking, this is where they ought to look.','I wish I could send word to Sydney.','I have people there who will be watching, too.']},
    henry:{speaker:'Henry Forgés',portrait:'assets/people/henry.png',
      arrival:['Go on. Put a knee down.','Wet through already, isn’t it?','First dry board that comes ashore is for somebody to sleep on.'],
      shelter:['Alick, get your boots inside.','You keep making room and ending up in the rain yourself.','George, shift along a little.'],
      fire:['Hold your hands out. Both of them.','I can turn my own sleeves.','There. Now you can open a fist.'],
      signal:['See that flag from here?','Good. You can sit down to look at it.','I have a dry bit of ground by my left boot.']},
    george:{speaker:'George Harris',portrait:'assets/people/george.png',
      arrival:['Was that you calling my name?','I heard the first bit and then a sea hit the wreck.','Call again if you need me. I’ll put my hand up.'],
      shelter:['I carried a load up, then went down again for another.','First trip I had to look round for you.','Second trip I could see the new roof all the way.'],
      fire:['I can see your faces now.','Raynal, you have a black streak right across your nose.','No, leave it. You’ll only put another there.'],
      signal:['If I go down and wave, will you see me?','Wait till I turn round.','I want to see somebody wave back.']}
  };

  function stage(state){
    const f=state?.flags||{};
    if(f.signalRaised)return 'signal';
    if(f.fireLit)return 'fire';
    return f.shelterBuilt?'shelter':'arrival';
  }
  function lines(id,state){
    const voice=Object.hasOwn(voices,id)?voices[id]:voices.player;
    return {speaker:voice.speaker,lines:voice[stage(state)].slice(),portrait:voice.portrait};
  }
  function ambient(id,state){return lines(id,state).lines[0];}
  return {lines,ambient};
});

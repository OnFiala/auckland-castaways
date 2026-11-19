/* Original dramatic speech. The historical basis is documented in HISTORICAL_ADAPTATION.md. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CastawayStories = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const names = {
    player: 'Alick McLaren', raynal: 'François Raynal', musgrave: 'Thomas Musgrave',
    henry: 'Henry Forgés', george: 'George Harris'
  };
  function speakerInfo(id) {
    if (!Object.hasOwn(names, id)) id = 'player';
    return {speaker: names[id], portrait: 'assets/cast-portraits/' + id + '.webp'};
  }
  function turn(id, text) { return {id, text}; }
  function exchange(first, second, opening, reply, answer) {
    return [turn(first, opening), turn(second, reply), turn(first, answer)];
  }

  function arrival(state) {
    if (state?.scene !== 'beach' || state.chapter > 1 || state.completed || state.chapterComplete ||
        Object.values(state.flags || {}).some(Boolean)) return [];
    return [
      turn('raynal', 'Here, Alick. Let me sit a moment. Did George come through?'),
      turn('player', 'He did. He and Henry are making a place for you up the beach.'),
      turn('raynal', 'There’s the sail we hauled ashore. The wind’s caught it in those branches. Can you reach that corner?')
    ];
  }

  function raynal(f, scene) {
    const talk = (a, b, c) => exchange('raynal', 'player', a, b, c);
    if (scene === 'camp' && !f.fireLit) return talk('You brought the whole sail up. I could only see a scrap of it from down below.',
      'Is it dry where you are? Henry cleared that place for you.', 'Dry enough to sit. Give me that wet coat of yours. I can spread it out from here.');
    if (scene === 'camp') return talk('Henry saved the dry place for me. Where are you going to sleep?',
      'Here by the opening. I want to hear if anything comes ashore.', 'Then put your coat under your head. I have George’s folded one.');
    if (f.signalRaised) return talk('I could see that strip lift from down here.',
      'So could a man off the point?', 'When it blows out, yes. Stand where I am and see.');
    if (f.fireLit) return talk('I can smell the wood smoke from here. Are your hands warm?',
      'Warm enough to help you up. Shall I?', 'Give me your elbow. I should like to walk as far as that fire.');
    if (f.shelterBuilt) return talk('How much of the sail did the branches tear?',
      'One strip came loose. The rest reaches right over Henry’s frame.', 'Keep that strip. White cloth shows a long way off against those trees.');
    if (f.canvasRecovered) return talk('Let me feel the edge. No tear past my thumb.',
      'Henry’s got a frame ready. Can I take it to him?', 'Go on. I’m dry enough in this lee for another minute.');
    return talk('Bear with me, Alick. This illness has taken the legs from under me.',
      'Then sit. Is it the sail you’re looking at?', 'Yes. When the wind drops, the corner hangs clear. I’ll call when I see it.');
  }

  function musgrave(f, scene) {
    const talk = (a, b, c) => exchange('musgrave', 'player', a, b, c);
    if (scene === 'camp') return talk('George, Henry, Raynal, you. There. I can stop counting.',
      'You always leave one out, sir.', 'Myself? So I do. Make a little room.');
    if (!f.crateOpen) {
      if (f.signalRaised) return talk('That strip of sail shows up well from the wreck. Have you got anything dry to burn?',
        'Only what the sea throws up.', 'There was an axe in this chest. Hold the lid a moment while I get my fingers clear.');
      if (f.fireLit) return talk('I can see the smoke against the trees.', 'You can leave this to the next tide. Come and get warm.',
        'Give me one more minute to see what’s washed in.');
      if (f.shelterBuilt) return talk('Has Henry got a roof over him?', 'Yes. But everything under it is wet.',
        'Then this chest is worth opening. We kept the tinderbox in there.');
      if (f.prybarTaken) return talk('Bring that iron here. I can keep the chest from rocking.',
        'Will the hinge stand it?', 'Try the other corner. The lid lifted there when the sea set it down.');
      return talk('Where’s Raynal? I counted five ashore and now I can only see you.',
        'In the lee of the beach. Henry and George have gone ahead. What’s in the chest?',
        'The axe and our tinderbox, if the lid held. I can steady it. See if there’s a bar in that wreckage.');
    }
    if (f.signalRaised) return talk('I can see the flag. Can you see the wreck from up there?',
      'When the squall clears. Shall I keep watch for you?', 'Please. I’d like to take my eyes off her for a little.');
    if (f.fireLit) return talk('There’s the smoke I was waiting for. Did the tinder take first time?',
      'Henry kept the wind off it.', 'I’d better go up before he gives my place away.');
    if (f.woodCut) return talk('Did the axe find anything dry?', 'Right in the middle. Henry can start with those splinters.',
      'Take them up under your coat. We’ve done enough here for one tide.');
    return talk('The lid kept the tinder dry. Can you find anything it’ll light?',
      'There’s a log on the beach. Dry in the middle, I’d say.', 'Take the axe, then. I’ll wait here for what the next sea brings.');
  }

  function henry(f) {
    const talk = (a, b, c) => exchange('henry', 'player', a, b, c);
    if (f.signalRaised) return f.fireLit
      ? talk('George can see the flag from the shingle. Somebody still has to see him back.',
          'I can take the first watch.', 'Come under the edge. You can see him just as well from here.')
      : talk('Fine flag, Alick. Give me a hand down here now.', 'Are those stones out of the wind?',
          'They are when I crouch here. Get me something dry and we’ll see about a fire.');
    if (f.fireLit) return talk('Hold your hands out. Can you open them all the way?',
      'Better than I could at the wreck.', 'Good. Warm the other side, then George can have your place.');
    if (f.firewoodPlaced && !f.shelterBuilt) return talk('I’ve got the dry wood under my coat. What happened to the sail?',
      'You want it stretched over the frame first?', 'Look at the rain coming across that hollow. This wood won’t stay dry without a roof.');
    if (f.firewoodPlaced) return talk('Leave the little splinters against my boot. That keeps the wind off.',
      'Can you hold still while I strike?', 'If you’ll give me back my foot when it catches.');
    if (f.shelterBuilt) return talk('Put your head under here, Alick. Hear the rain go off the edge?',
      'There’s still water running down my neck.', 'That’s because you’ve left half of yourself outside. Come in.');
    return [
      turn('henry', 'I’ve cleared a place above the wash. Is Raynal coming up?'),
      turn('player', 'He can sit in the lee for a bit. What do you need here?'),
      turn('george', 'A cover. Henry’s got the frame steady, but the rain comes straight through it.')
    ];
  }

  function george(f) {
    const talk = (a, b, c) => exchange('george', 'player', a, b, c);
    if (f.signalRaised) return talk('Did you see me lift my hand below the flag?',
      'Clear as day. Could you see us?', 'Just the cloth. That’s something a man in a boat could pick out.');
    if (f.fireLit) return talk('Hold your hand up again, Alick.', 'What for? I’m right beside you.',
      'I know. First time today I can see all five fingers.');
    if (f.shelterBuilt) return talk('On the way back I could see our roof. A boat wouldn’t.',
      'What would you see from a boat?', 'Something white above the scrub. I’ll go down and have a look when it’s up.');
    return talk('Was that you calling me down there?', 'I wanted to know you were on your feet.',
      'I put my hand up. If the surf gets loud again, look for that. I’m taking the dry things up to Henry.');
  }

  function alick(f, scene) {
    if (scene === 'beach' && f.shelterBuilt) return [turn('player', 'Those are the marks from Raynal’s boots. He made it up to the trees.')];
    if (scene === 'wreck' && f.shelterBuilt && f.fireLit && f.signalRaised)
      return [turn('player', 'The captain’s gone up. Nothing here to bring back this tide.')];
    if (scene === 'wreck') return exchange('player', 'musgrave', 'How long have we got here, sir?',
      'How far did the last wave come?', 'Just over that iron. We can work here between seas.');
    if (scene === 'camp') return exchange('player', 'henry', 'Where do you want me?',
      'Here on the high side. That hollow fills with water.', 'I can feel it through my boot. I’ll come round to you.');
    const talk = (a, b, c) => exchange('player', 'raynal', a, b, c);
    if (f.signalRaised) return talk('Look up, François. See anything above those trees?', 'A strip of white. Part of the sail?',
      'Yes. George reckons a boat might see it.');
    if (f.fireLit) return talk('There’s smoke going up from camp.', 'Henry got the wood to burn?',
      'Yes. You can have my place when you’re ready.');
    if (f.shelterBuilt) return talk('The roof’s on. Take my arm when you’re ready.',
      'Did Henry leave room for everyone?', 'For five. I counted.');
    return talk('Can I leave you here while I see what the tide’s thrown up?',
      'Yes. Whistle if you want me to watch that sail again.', 'You’ll hear me from this side of the rocks.');
  }

  const byPerson = {player: alick, raynal, musgrave, henry, george};
  function conversation(id, state) {
    const actor = Object.hasOwn(byPerson, id) ? id : 'player';
    return byPerson[actor](state?.flags || {}, state?.scene);
  }
  function lines(id, state) {
    const turns = conversation(id, state);
    return {...speakerInfo(turns[0].id), lines: turns.map(line => line.text)};
  }
  function ambient(id, state) { return conversation(id, state)[0].text; }
  return {speakerInfo, conversation, arrival, lines, ambient, turn, exchange};
});

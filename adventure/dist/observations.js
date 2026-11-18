/* Optional clue and inspection text for the Grafton campaign. All staging is authored. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CastawayObservations=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  // The target and cue together distinguish several jobs at the same object.
  const CLUES={
    'rope:take':['The tide has left a dark twist among the branches.','Search the driftwood near the waterline for a length of cord.'],
    'pole:take':['Some of what washed up here is straighter than the rest.','On the shore, look for the long piece of wood that can reach past the rocks.'],
    'pole:combine':['The sail is high, and a smooth end would slip off it.','The long pole gives you reach. Something flexible could give it a grip.'],
    sail:['The wind keeps lifting a loose edge just beyond your hand.','Try reaching the loose edge from firm ground with something that can catch it.'],
    shelter:['The frame stands firm. Rain comes straight through the top.','Look for something from the shore broad enough to stretch across the camp frame.'],
    prybar:['Among the wreckage, a narrow piece of metal lies loose.','Find a loose length of iron near the chest at the wreck.'],
    crate:['The boards are sound, but the lid gives a little at one corner.','The gap beneath the chest lid will take something thin and stiff enough to lever it.'],
    driftwood:['The bark is soaked. The end of the log shows paler wood.','The wood behind the bark may still be dry. The chest at the wreck held an edge tool.'],
    'hearth:firewood':['The pit is sheltered, but its stones are bare.','Bring something dry and small enough to catch a first flame to the fire pit.'],
    'hearth:tinderbox':['The small splinters are dry. The canvas above them barely stirs.','The fire pit is ready. Look in the satchel for what was kept dry inside the chest.'],
    'cairn:take':['The upright is wedged between stones and still moves a little.','Go to the camp and pull the pole free if you still need its reach.'],
    'cairn:loopPole':['The heap of stones has a deep gap in the middle.','At camp, see what might stand upright in that gap and rise above the shore.'],
    'cairn:flagcloth':['The upright is hard to pick out against the trees.','Look for something light and bright to lift at the top of the pole at camp.'],

    hide:['Water is getting through one small part of the cabin roof.','Look in the cabin for material wide enough to cover the torn spot.'],
    twine:['The edge of a loose repair could lift in this draught.','Check the sewing bench for something strong enough to hold a seam together.'],
    'roof:combine':['The cut edges will have to stay put through a wet night.','The cabin has a piece of dry hide and a sewing supply. Think about how to join them.'],
    'roof:weatherPatch':['A single gap is making a puddle much bigger than itself.','Take a finished repair to the place where the roof is dripping.'],
    flask:['The kettle stands empty, and the stream is outside.','Look beside the barrel for a container you can carry out and bring back full.'],
    spring:['The water moving over the stones looks clearer than the standing pools.','Follow the way out of the cabin. Take an empty container to the running water.'],
    kettle:['There is a dry ring inside the kettle.','Back in the cabin, transfer what you brought from the stream before you tend the fire.'],
    stove:['The roof holds and the water is ready. The room still feels cold.','Look for a source of sparks and check the cabin hearth.'],

    leather:['A breeze through the doorway barely reaches the bottom of the furnace.','Look around the forge for something flexible enough to form an air chamber.'],
    metalPipe:['Air spreads unless it has a narrow way out.','Find a narrow, hollow fitting near the forge bench.'],
    'furnace:combine':['An air chamber would need somewhere for each breath to go.','A flexible chamber and a hollow fitting could work together. Both are at the forge.'],
    'furnace:bellows':['There is an opening low down in the furnace wall.','Give the air somewhere to enter at the base of the furnace.'],
    charcoal:['The fire bed needs fuel that can burn steadily.','Follow the path from the forge to the charcoal ground and look for a basket.'],
    'furnace:charcoal':['The furnace has a way to draw air, but the fuel bed is empty.','Bring the fuel you collected back to the furnace.'],
    'furnace:tinderbox':['Fuel sits in the bed and air can reach it. The stone is still cold.','The furnace has what it needs to draw a fire. Bring a spark to it.'],
    ironScrap:['Some of the wreck scrap is a better size for working than the rest.','Go back to the charcoal ground and check the pieces set apart from the wood.'],
    anvil:['The fire is hot. The heavy block beside it can take a hammer blow.','Bring workable metal to the forge bench. Think about what the larger boat will need first.'],
    testBlock:['The tool looks sound on the bench. Its edge has yet to do any work.','Put the new tool against the hard piece of wood on the rear workbench.'],

    planks:['The low sides will ship water before we are clear of the harbour.','Look in the salvage pile for straight boards long enough to raise the sides.'],
    'boatFrame:planks':['There is a line to follow along the top of the old hull.','Offer the salvaged boards up to the boat’s low sides.'],
    'boatFrame:boatNails':['The new boards shift when you press against them.','Look in the satchel for the fastenings made at the forge and go back to the boat frame.'],
    oakum:['Thin gaps show between the boards, even where they sit firmly.','Look among the salvage for loose fibres that can be pressed into a narrow gap.'],
    resin:['Loose fibres will take up the space. Water could still seep through them.','Near the boat, look for a covered pot with something sticky at the rim.'],
    'seams:combine':['There are two problems at a seam: the empty space and the water that finds it.','Think about how the loose fibres from the salvage and the sealant near the boat might work together.'],
    'seams:caulking':['Light still shows between the fastened boards.','Work the prepared filler into the open joints of the boat.'],
    sailcloth:['The mast stands bare in the wind.','Look on the ledge beside the salvage chest for a sound fold of canvas.'],
    boatMast:['The hull is fastened. The rig has nothing to draw against.','Bring the sound canvas to the mast on the slipway.'],

    stormLine:['A loose part of the rig jerks whenever the boat rolls.','Look among the gear in the boat for a sound short coil.'],
    rigging:['The loose rigging strikes hard enough to stagger anyone it catches.','Use something from the boat gear to hold the rigging steady.'],
    bailer:['Water is gathering low in the boat. The men have a little time between seas.','Look among the gear underfoot for a scoop that can move water.'],
    bilge:['Each roll carries water from one side of the boat to the other.','With the rig held steady, use the gear that can throw standing water clear.'],
    canvasPatch:['Wind comes through a split in the sail. Its edges flap apart.','Look for the folded piece of canvas in the gear at your feet.'],
    tornSail:['The sail sags at the split even when the wind fills the rest.','With the water under control, take something that can cover the damaged cloth to the sail.'],
    compass:['One patch of grey looks much like any other from here.','Find the small instrument that still gives a direction with no land in sight.'],
    horizon:['The boat will answer the helm again, but there is no coast to steer by.','The view ahead gives no reference point. Bring the instrument that lets you hold a bearing.'],

    chart:['People here can help if they have a place to look.','In the room at Invercargill, look for a printed sheet showing the waters to the south.'],
    journal:['The outline of the island is only part of what Captain Cross needs to know.','In the chart room, look for the record of what was seen and where the men are waiting.'],
    'chartTable:combine':['One page shows a coastline. The other carries the details we brought back.','Transfer the useful details from the written record to the paper that shows the route south.'],
    'chartTable:markedChart':['People outside the crew can now see where to look.','Spread the completed route on the navigation table for the return voyage.'],
    provisions:['There are two more mouths to feed on the way home.','At the harbour, look for the fresh stores that can go aboard the cutter.'],
    'rescueCutter:provisions':['The cutter has room for more than the little boat could carry.','Bring the food and drink gathered at the harbour aboard Flying Scud.'],
    spareSail:['Once out to sea, what goes aboard here is what the cutter will have.','Look near the cutter for the spare fold of canvas.'],
    'rescueCutter:spareSail':['Prepared stores are aboard. There is room for a reserve in case the wind damages the sails.','Stow the spare cloth aboard Flying Scud.'],

    rescueLine:['The swell moves the boat even here in the lee of the shore.','Look along the landing for a length of rope heavy enough to hold the boat in place.'],
    'rescueBoat:rescueLine':['The boat drifts a little farther from the shore with each pull of the swell.','Use the strong line at the landing before going up to Epigwaitt.'],
    rescueProvisions:['There are people ashore who have had to make their stores last.','Check the supplies unloaded at the landing for what you can take to the cabin.'],
    campTable:['The men have cleared a place large enough for what we brought.','Take the fresh supplies to the table inside Epigwaitt.'],
    lantern:['The landing is hard to pick out from the water.','Search the supplies by the landing for a light with a sheltered flame.'],
    signalPost:['Here a light could be seen from the boat without being lost among the branches.','With the boat held in place, put a sheltered light at the landing marker.'],
    'henry:talk':['There is a familiar figure by the table.','Go inside Epigwaitt and let Henry know there is room on the boat for him.'],
    'george:talk':['There is someone on the far side of the room, listening.','Speak with George at Epigwaitt and make sure he is ready to leave.'],
    'rescueBoat:hand':['Both men are accounted for. The island work can pass out of their hands.','Go back to the secured boat at the landing and board with Henry and George.']
  };

  // These read as discoveries in the scene, including when work is already underway.
  const DETAILS={
    rope:'The rope is wet, but the fibres do not pull apart.',
    pole:'The pole is straight and light enough to lift from one end.',
    sail:'A corner of the sail lifts with every gust. It is well beyond arm’s reach.',
    driftwood:f=>f.woodCut?'Pale splinters show where the log has been opened.':'Wet bark covers the log, but no water runs from the broken end.',
    prybar:'The iron is heavy in the middle and thin at one end.',
    crate:f=>f.crateOpen?'The chest is empty. The lid sits crooked where it gave way.':'The lid will not lift by hand. There is a narrow gap at the front edge.',
    shelter:f=>f.shelterBuilt?'Rain runs down the stretched sail instead of between the poles.':'The frame barely moves in the wind. There is nothing to spread the rain away from it.',
    hearth:f=>f.fireLit?'The flame holds steady in the lee of the covered frame.':f.firewoodPlaced?'The splinters sit dry in the middle of the stones.':'The stone ring is sheltered low down. Its centre is empty.',
    cairn:f=>f.signalRaised?'The strip of canvas catches the eye above the darker shore.':f.mastRaised?'The stones hold the pole upright. Its bare tip is hard to pick out.':'The stones leave a gap just deep enough to brace something upright.',
    hide:'The hide is supple and wide enough to overlap the damaged roof.',
    twine:'The thread is coarser than sewing cotton. It holds when pulled hard.',
    flask:'An empty skin hangs by the barrel hoop. The stopper still fits tightly.',
    roof:f=>f.roofSealed?'Drops run across the patch and fall outside.':f.patchStitched?'A dark drip marks the gap where the finished patch could sit.':'A little daylight comes through the join. The floor beneath it is wet.',
    spring:f=>f.waterFetched?'The stream runs on over the stones where the skin was filled.':'Clear water runs between the stones, away from the standing pools.',
    kettle:f=>f.warmthReady?'A little steam rises above the lid.':f.waterStored?'Water sloshes against the inside of the kettle.':'The kettle rings hollow when it is set down.',
    stove:f=>f.warmthReady?'Heat reaches out far enough to dry cold fingers.':'The hearth is cold. The wood is stacked clear of the damp floor.',
    leather:'The soft leather bends without cracking at the fold.',
    metalPipe:'The little iron pipe is clear all the way through.',
    charcoal:'The black pieces leave dry dust at the rim of the basket.',
    ironScrap:'A worked piece of iron has been set aside from the heavier wreckage.',
    furnace:f=>f.forgeLit?'Air through the low opening has brought the fuel to a steady heat.':f.forgeFueled?'The furnace is charged, but the charcoal is cold.':f.bellowsFitted?'Air reaches the fuel bed now. There is nothing in it to burn.':'A low opening in the stone leads straight to the fuel bed.',
    anvil:f=>f.nailsForged?'Fresh fastenings sit where the trial tool was laid.':f.drillFailed?'The battered trial piece can still be shaped into something simpler.':'The heavy block does not shift when the hammer strikes.',
    testBlock:f=>f.drillFailed?'A pale scrape is all the bit left in the hard wood.':'The hard timber will show how an edge holds up under pressure.',
    planks:'These boards have straight edges that can sit together along the hull.',
    oakum:'The old rope has been teased apart into loose fibres.',
    resin:'A trace of dark pitch sticks to the rim of the pot.',
    sailcloth:'The sailcloth inside the fold is free of tears.',
    boatFrame:f=>f.hullFastened?'The raised sides no longer move when pushed.':f.hullPlanked?'The new boards are in place. They still shift under a hand.':'The old sides sit low. The line along the top is sound enough to build on.',
    seams:f=>f.boatSealed?'Filler sits firmly in the joints along the raised sides.':'There are pale slits between the boards where water could find its way in.',
    boatMast:f=>f.sailRigged?'The cloth takes the wind as soon as it is let out.':'The mast and rig stand ready, without anything to draw against the wind.',
    bailer:'The scoop sits solidly in one hand. Its bowl is still empty.',
    stormLine:'A compact coil with no frayed spots where it will need to hold.',
    compass:'The case shuts firmly. Inside it, the needle swings as the boat rolls.',
    canvasPatch:'The folded canvas will cover more than the split in the sail.',
    rigging:f=>f.rigSecured?'The loose rigging no longer whips across the boat.':'A loose part of the rig jerks whenever the sail fills.',
    bilge:f=>f.boatDry?'Little water stands in the bottom now. It will still need watching.':'Water washes from side to side across the bottom of the boat.',
    tornSail:f=>f.sailMended?'The patch draws tight when the wind fills the sail.':'Wind escapes through the split instead of filling that part of the sail.',
    horizon:f=>f.courseSet?'The view gives nothing away, but we have a bearing to hold.':'There is no headland between the sea and the grey sky.',
    chart:'The outline of the coast is printed. There is room to mark where help is needed.',
    journal:'The notes hold bearings, dates and landmarks from the island.',
    chartTable:f=>f.rescueRoute?'The return route is laid out where the two captains can see it.':'A clean space on the table leaves room to lay the route flat.',
    provisions:'Fresh stores have been set out where they can be carried aboard.',
    spareSail:'The dry canvas is folded to stow out of the way.',
    rescueCutter:f=>f.rescueSupplied&&f.rescueRigged?'The cutter has stores for the return and spare canvas stowed.':f.rescueSupplied?'The stores are aboard. There is room left for reserve canvas.':f.rescueRigged?'The reserve canvas is stowed. The stores still have to go aboard.':'Flying Scud has room for stores the small boat could never have carried.',
    rescueLine:'The landing line feels heavy even before it gets wet.',
    rescueProvisions:'There are fresh things here that have been scarce at Epigwaitt.',
    lantern:'A cover keeps the wind from reaching the lantern wick directly.',
    rescueBoat:f=>f.menRescued?'The boat has carried both men back to the cutter.':f.boatMoored?'The boat rises with the swell and comes back against the line.':'The boat moves out from the shore whenever the swell pulls back.',
    signalPost:f=>f.landingMarked?'The light shows clearly from the water.':'The post stands clear of the branches, in full view of the boat.',
    campTable:f=>f.suppliesShared?'The relief supplies are open. There is space for everyone to reach them.':'A space has been cleared on the table for what the cutter brought.'
  };

  const PEOPLE={
    beach:{raynal:f=>f.canvasRecovered?'Raynal checks the recovered canvas for a stretch that will hold.':'Raynal watches the same corner of the sail lift and fall.'},
    wreck:{musgrave:f=>f.crateOpen?'Musgrave looks back from the chest to what remains of the wreck.':'Musgrave runs his hand along the edge of the stuck lid.'},
    camp:{henry:f=>f.fireLit?'Henry makes room nearer the fire.':'Henry has cleared the wet branches away from the fire pit.',george:'George stays close to the others when he comes in from the shore.',raynal:'Raynal looks at the camp as though he is already thinking about morning.',musgrave:'Musgrave is close enough to the fire to hear the others.'},
    cabin:{henry:f=>f.warmthReady?'Henry holds his hands close to the warmth and makes space beside him.':f.roofSealed?'Henry watches the edge of the new patch the next time the wind rises.':'Henry keeps glancing from the drip in the roof to the hearth.'},
    forest:{george:f=>f.waterFetched?'George has come nearer the water. He keeps his feet on the dry side of the stones.':'George waits on the path, looking for a firm way down to the water.'},
    forge:{raynal:f=>f.drillFailed?'Raynal turns the blunt trial bit in his hand, studying where it gave way.':'Raynal looks from the fire bed to the tools laid out beside it.'},
    charcoal:{george:'George has made a place to set things down between trips to the forge.'},
    slipway:{musgrave:f=>f.hullFastened?'Musgrave leans on the raised side to see if it gives.':'Musgrave follows the line of the low hull from bow to stern.'},
    salvage:{henry:'Henry looks through the salvage for what can be spared from the cabin.'},
    crossing:{musgrave:f=>f.boatDry?'Musgrave holds the tiller and keeps an eye on the water across the boat.':'Musgrave braces himself against the pull of the tiller.',raynal:f=>f.sailMended?'Raynal watches how the repaired canvas takes the next gust.':f.rigSecured?'With the line holding, Raynal’s attention has turned to the water in the boat.':'Raynal keeps close to the line as the boat rolls.'},
    return_camp:{henry:f=>f.henryFound?'Henry gathers what he can carry down to the boat.':'Henry looks up from the table when he hears a voice at the door.',george:f=>f.georgeFound?'George stays near the door now that he knows there is a boat.':'George stands back from the table, watching to see who has come in.'}
  };

  function hints(state,hint){
    const flags=state?.flags||{};
    if(hint.cue==='done'){
      return state?.completed?['Both men made it off the island.','All five Grafton castaways are accounted for.',hint.text]:['The work in this place is settled.','When you are ready, follow the chapter passage.',hint.text];
    }
    const clues=hint.targetId==='anvil'&&flags.drillFailed
      ?['The worn edge has answered one question. The metal is still here.','Bring the trial metal back to the anvil and think about the smaller boat’s fastenings.']
      :CLUES[`${hint.targetId}:${hint.cue}`]||CLUES[hint.targetId];
    const [observation,direction]=clues||['Take another look around. Notice what is still out of place.','Return to the area where the unfinished work is visible.'];
    return [observation,direction,hint.text];
  }

  function look(state,id,baseText){
    const detail=PEOPLE[state?.scene]?.[id]??DETAILS[id];
    return typeof detail==='function'?detail(state?.flags||{}):detail||baseText;
  }

  return {hints,look};
});

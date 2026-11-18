/* The later visits keep their geography and have their own painted evidence of elapsed time. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CastawayWorld=factory();})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const painting = name => `assets/tidepaint/${name}.webp`;
const scene=(name,indoor=false,walk=[6,94,74,89])=>({file:painting(name),indoor,walk});
const shore = name => scene(name, false, [6,94,74,90]);
const scenes={beach:shore('beach'),wreck:shore('wreck'),camp:shore('camp'),cabin:scene('cabin',true),forest:scene('forest'),forge:scene('forge',true),charcoal:scene('charcoal'),slipway:scene('slipway'),salvage:scene('salvage',false,[6,94,76,88]),crossing:scene('crossing-wet',false,[20,80,76,88]),harbour:scene('harbour'),chartroom:scene('chartroom',true),return_camp:scene('return-camp',true),landing:scene('landing')};
function decorations(state,{svg,marks}){
 const f=state.flags;let html='';
 const glow=(x,y)=>`<div class="voyage-glow" style="left:${x}%;top:${y}%"></div>`;
 if(state.scene==='forge'&&f.forgeLit)html+=glow(25,28);
 if(state.scene==='cabin'&&f.warmthReady)html+=glow(-2,42)+`<div class="world-steam" style="left:36%;top:39%"></div>`;
 if(state.scene==='return_camp'&&f.suppliesShared)html+=`<div class="change" style="left:37.9%;top:45.2%;width:4.7%;height:8.5%">${svg('rescueProvisions')}</div>`;
 if(state.scene==='landing' && f.landingMarked){
  const lamp=marks?.landing?.lantern || {x:77.8,y:35.3,w:3.2,h:8.5};
  html+=`<div class="change" style="left:${lamp.x}%;top:${lamp.y}%;width:${lamp.w}%;height:${lamp.h}%">${svg('lantern')}</div>`;
 }
 return html;
}
const placements={
 cabin:{hide:[65,54,9,8],twine:[45,49,7,7],flask:[90,45,6,12],roof:[52,12,32,23],kettle:[35,47,7,12],stove:[11,59,18,22],henry:[79,65]},
 forest:{spring:[22,59,21,18],george:[79,65]},
 forge:{leather:[79,42,9,8],metalPipe:[89,43,8,9],furnace:[40,44,22,25],anvil:[65,46,13,18],testBlock:[83,53,12,9],raynal:[83,65]},
 charcoal:{charcoal:[77,60,8,10],ironScrap:[45,69,9,11],george:[85,65]},
 slipway:{resin:[32,45.6,7,8.5],boatFrame:[55.7,55.6,17.9,6.7],seams:[73.2,59,16,7],boatMast:[66,29.4,6.5,43.8],musgrave:[38,50]},
 crossing:{bailer:[24,78,7,7],stormLine:[38,78,7,8],compass:[58,78,6,8],canvasPatch:[71,78,8,7],rigging:[32,38,9,28],bilge:[64,69,18,15],tornSail:[74,18,26,24],horizon:[14,43,22,13],raynal:[29,65],musgrave:[76,65]},
 harbour:{provisions:[57,71,8,14],spareSail:[72,71,11,10],rescueCutter:[35,51,33,26]},
 chartroom:{chart:[36,43,12,9],journal:[67,43,7,9],chartTable:[51,49,27,12]},
 return_camp:{campTable:[38,53,25,17],henry:[62,65],george:[83,65]},
 landing:{rescueLine:[27,70,7,8],rescueProvisions:[57,69,8,13],lantern:[69,69,5,12],rescueBoat:[44,55,30,20],signalPost:[77,48,9,29]}
};
function stageTarget(target,state){
 const xy=placements[state.scene]?.[target.id];const t={...target};if(xy){t.x=xy[0];t.y=xy[1];if(xy[2]){t.w=xy[2];t.h=xy[3];}}
 if(state.scene==='cabin'&&t.id==='kettle')t.art='kettle';
 if(state.scene==='forge'&&t.id==='testBlock')t.art='planks';
 if(state.scene==='slipway'&&t.id==='boatMast')t.paint=false;
 if(state.scene==='crossing'&&t.kind==='person'){t.groundY=82;t.w=8.5;t.h=26;}
 return t;
}
function background({scene: location, flags = {}}) {
 switch (location) {
  case 'wreck': return painting(flags.crateOpen ? 'wreck-open' : 'wreck');
  case 'camp': return painting(flags.shelterBuilt ? 'camp-shelter' : 'camp');
  case 'cabin': return painting(flags.warmthReady ? 'cabin' : 'cabin-cold');
  case 'forge':
   if (flags.forgeLit) return painting('forge-lit');
   return painting(flags.bellowsFitted ? 'forge' : 'forge-cold');
  case 'slipway': return painting(flags.sailRigged ? 'slipway-ready' : 'slipway');
  case 'crossing':
   if (flags.sailMended || flags.courseSet) return painting('crossing-safe');
   return painting(flags.boatDry ? 'crossing-bailed' : 'crossing-wet');
  default: return scenes[location]?.file;
 }
}
return {scenes,decorations,stageTarget,background};});

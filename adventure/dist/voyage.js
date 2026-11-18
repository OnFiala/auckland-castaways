/* Complete seven-chapter adventure. Puzzle recipes and exact staging are original adaptation. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));else root.AdventureEngine=factory(root.AdventureEngine);})(typeof window!=='undefined'?window:globalThis,function(Base){
'use strict';
const VERSION=4,clone=x=>JSON.parse(JSON.stringify(x));
const additions={
 hide:['Leather sheet','A broad piece of preserved hide; it will keep the rain outside.'],twine:['Twine','Strong thread for a weatherproof seam.'],flask:['Empty waterskin','A stoppered skin with room for fresh water.'],weatherPatch:['Stitched patch','The hide and twine make a strong roof patch.'],filledFlask:['Fresh water','Water collected from the stream.'],
 leather:['Bellows leather','Flexible leather for a sealed air chamber.'],metalPipe:['Iron nozzle','A narrow iron tube can direct a stream of air.'],charcoal:['Charcoal','A small basket of charcoal for the forge.'],ironScrap:['Salvaged iron','A piece of the wreck that can become useful hardware.'],bellows:['Bellows','Leather and a nozzle make a simple air chamber.'],drillBlank:['Trial drill','A newly forged bit. It still has to prove itself in hard timber.'],boatNails:['Boat nails','Hand-forged fastenings for the smaller boat.'],
 planks:['Planks','Salvaged boards for raising the sides of the boat.'],oakum:['Oakum','Loose fibres can fill the gaps between planks.'],resin:['Pitch pot','Sticky sealing material in a small covered pot.'],sailcloth:['Sailcloth','A sound length of sail, saved for the voyage.'],caulking:['Prepared caulking','Fibres and sealing compound, ready for the seams.'],
 bailer:['Bailer','A wooden scoop for throwing water overboard.'],stormLine:['Storm line','A short, sound length of rope for securing the rig.'],compass:['Compass','The needle gives a bearing even when the shore has vanished.'],canvasPatch:['Sail patch','A folded patch for a damaged sail.'],
 chart:['Chart','A coastal chart with the Auckland Islands marked far to the south.'],journal:['Journal','Positions and observations preserved from the island.'],provisions:['Provisions','Food and fresh stores for the rescue voyage.'],spareSail:['Spare canvas','Replacement sailcloth for the cutter.'],markedChart:['Rescue chart','The journal positions are marked on the chart.'],
 rescueLine:['Landing line','A strong line to hold the boat safely at the landing.'],rescueProvisions:['Relief supplies','Fresh supplies to share with the two men waiting ashore.'],lantern:['Lantern','A sheltered light to mark the landing for the cutter.']
};
const ITEMS={...Base.ITEMS};for(const [id,[name,description]]of Object.entries(additions))ITEMS[id]={id,name,description,icon:id};
const goal=(flag,label,icon)=>({flag,label,icon});
const CHAPTERS=[
 {id:1,title:'The First Night',subtitle:'Carnley Harbour · January 1864',entry:'beach',exitLabel:'Face the winter',goals:[goal('shelterBuilt','Shelter','shelter'),goal('fireLit','Fire','fireGlyph'),goal('signalRaised','Signal','signal')]},
 {id:2,title:'A House Against the Winter',subtitle:'Epigwaitt · Winter 1864',entry:'cabin',exitLabel:'Build the forge',goals:[goal('roofSealed','Roof','weatherPatch'),goal('waterStored','Water','filledFlask'),goal('warmthReady','Warmth','fireGlyph')]},
 {id:3,title:'What Iron Can Become',subtitle:'Epigwaitt · 1865',entry:'forge',exitLabel:'Rebuild the boat',goals:[goal('bellowsFitted','Air','bellows'),goal('forgeLit','Heat','fireGlyph'),goal('nailsForged','Fastenings','boatNails')]},
 {id:4,title:'Room for Three',subtitle:'Carnley Harbour · July 1865',entry:'slipway',exitLabel:'Sail for help',goals:[goal('hullFastened','Hull','planks'),goal('boatSealed','Seams','caulking'),goal('sailRigged','Sail','sailcloth')]},
 {id:5,title:'Five Days of Ocean',subtitle:'19–24 July 1865 · Southern Ocean',entry:'crossing',exitLabel:'Reach Stewart Island',goals:[goal('rigSecured','Rig','stormLine'),goal('boatDry','Bilge','bailer'),goal('courseSet','Course','compass')]},
 {id:6,title:'The Promise',subtitle:'Stewart Island and Invercargill · July 1865',entry:'harbour',exitLabel:'Return aboard Flying Scud',goals:[goal('rescueRoute','Route','markedChart'),goal('rescueSupplied','Stores','provisions'),goal('rescueRigged','Cutter','spareSail')]},
 {id:7,title:'Until We Return',subtitle:'Auckland Island · August 1865',entry:'landing',exitLabel:'All five survived',goals:[goal('boatMoored','Landing','rescueLine'),goal('suppliesShared','Supplies','rescueProvisions'),goal('menRescued','Homeward','lantern')]}
];
const pickup=(id,name,x,y,flag,art=id)=>({id,name,x,y,kind:'item',item:id,art,pickupFlag:flag,w:8,h:12});
const puzzle=(id,name,x,y,solvedFlag,art)=>({id,name,x,y,kind:'puzzle',solvedFlag,...(art?{art}:{}),w:17,h:20});
const person=(id,name,x,y)=>({id,name,x,y,kind:'person'});
const exits=(a,b,nameA,nameB)=>[{id:'exit_'+b,name:nameB,to:b,x:92,y:77}];
const SCENES=[...Base.SCENES.map(s=>({...s,chapter:1})),
 {id:'cabin',chapter:2,name:'Inside Epigwaitt',background:'cabin',exits:[{id:'exit_forest',name:'To the stream',to:'forest',x:92,y:77}],targets:[pickup('hide','Dry hide',34,70,'hideTaken'),pickup('twine','Twine by the sewing bench',50,70,'twineTaken'),pickup('flask','Empty waterskin',68,72,'flaskTaken'),puzzle('roof','Leaking roof',49,25,'roofSealed'),puzzle('kettle','Water kettle',26,59,'waterStored'),puzzle('stove','Hearth',26,72,'warmthReady'),person('henry','Henry Forgés',79,66)]},
 {id:'forest',chapter:2,name:'The Winter Stream',background:'forest',exits:[{id:'exit_cabin',name:'Back to Epigwaitt',to:'cabin',x:8,y:77}],targets:[puzzle('spring','Fresh-water stream',52,68,'waterFetched'),person('george','George Harris',78,66)]},
 {id:'forge',chapter:3,name:'The Forge',background:'forge',exits:[{id:'exit_charcoal',name:'To the charcoal ground',to:'charcoal',x:92,y:77}],targets:[pickup('leather','Bellows leather',31,72,'leatherTaken'),pickup('metalPipe','Iron nozzle',48,73,'pipeTaken'),puzzle('furnace','Stone furnace',27,48,'forgeLit'),puzzle('anvil','Working anvil',62,63,'nailsForged'),puzzle('testBlock','Hard timber test block',76,72,'drillFailed'),person('raynal','François Raynal',84,65)]},
 {id:'charcoal',chapter:3,name:'Charcoal and Salvage',background:'charcoal',exits:[{id:'exit_forge',name:'Back to the forge',to:'forge',x:8,y:77}],targets:[pickup('charcoal','Charcoal basket',41,70,'charcoalTaken'),pickup('ironScrap','Salvaged iron',63,71,'ironTaken'),person('george','George Harris',80,65)]},
 {id:'slipway',chapter:4,name:'The Boat on the Shore',background:'slipway',exits:[{id:'exit_salvage',name:'To the salvage pile',to:'salvage',x:8,y:77}],targets:[pickup('resin','Pitch pot',31,72,'resinTaken'),puzzle('boatFrame','Raised boat sides',57,53,'hullFastened'),puzzle('seams','Open seams',57,68,'boatSealed'),puzzle('boatMast','Boat mast and sail',65,28,'sailRigged'),person('musgrave','Thomas Musgrave',83,65)]},
 {id:'salvage',chapter:4,name:'The Last Useful Pieces',background:'salvage',exits:[{id:'exit_slipway',name:'Back to the boat',to:'slipway',x:92,y:77}],targets:[pickup('planks','Salvaged planks',35,67,'planksTaken'),pickup('oakum','Loose oakum',55,73,'oakumTaken'),pickup('sailcloth','Folded sail',70,64,'sailclothTaken'),person('henry','Henry Forgés',82,65)]},
 {id:'crossing',chapter:5,name:'An Open Boat',background:'crossing',exits:[],targets:[pickup('bailer','Wooden bailer',28,76,'bailerTaken'),pickup('stormLine','Coiled storm line',45,72,'lineTaken'),pickup('compass','Compass in its case',61,73,'compassTaken'),pickup('canvasPatch','Folded sail patch',76,72,'patchTaken'),puzzle('rigging','Loose rigging',32,36,'rigSecured'),puzzle('bilge','Water in the bilge',52,83,'boatDry'),puzzle('tornSail','Torn sail',66,31,'sailMended'),puzzle('horizon','Northern bearing',48,47,'courseSet'),person('musgrave','Thomas Musgrave',83,62),person('raynal','François Raynal',17,62)]},
 {id:'harbour',chapter:6,name:'Invercargill Wharf',background:'harbour',exits:[{id:'exit_chartroom',name:'To the chart room',to:'chartroom',x:92,y:77}],targets:[pickup('provisions','Fresh provisions',32,72,'provisionsTaken'),pickup('spareSail','Spare canvas',55,71,'spareSailTaken'),puzzle('rescueCutter','Flying Scud',69,48,'rescueRigged')]},
 {id:'chartroom',chapter:6,name:'Invercargill Chart Room',background:'chartroom',exits:[{id:'exit_harbour',name:'Back to the waiting cutter',to:'harbour',x:8,y:77}],targets:[pickup('chart','Coastal chart',32,61,'chartTaken'),pickup('journal','Musgrave’s journal',67,65,'journalTaken'),puzzle('chartTable','Navigation table',49,67,'rescueRoute')]},
 {id:'landing',chapter:7,name:'Back in Carnley Harbour',background:'landing',exits:[{id:'exit_return_camp',name:'To Epigwaitt',to:'return_camp',x:92,y:77}],targets:[pickup('rescueLine','Landing line',32,72,'rescueLineTaken'),pickup('rescueProvisions','Relief supplies',49,71,'rescueProvisionsTaken'),pickup('lantern','Sheltered lantern',67,72,'lanternTaken'),puzzle('rescueBoat','Boat at the landing',44,53,'menRescued'),puzzle('signalPost','Landing marker',77,48,'landingMarked')]},
 {id:'return_camp',chapter:7,name:'The Two Who Waited',background:'return_camp',exits:[{id:'exit_landing',name:'Back to the landing',to:'landing',x:8,y:77}],targets:[puzzle('campTable','Shared table',42,66,'suppliesShared'),person('henry','Henry Forgés',61,64),person('george','George Harris',80,65)]}
];
const sceneById=id=>SCENES.find(s=>s.id===id),has=(s,id)=>s.inventory.includes(id);
const chapter=s=>Number.isInteger(s?.chapter)?s.chapter:1,getChapter=s=>CHAPTERS[chapter(s)-1];
const LOADOUT={2:['tinderbox'],3:['tinderbox'],4:['boatNails'],5:[],6:[],7:[]};
const RECIPES=[
 {chapter:2,items:['hide','twine'],flag:'patchStitched',give:['weatherPatch'],text:'A tight seam turns the hide into a weatherproof patch.'},
 {chapter:3,items:['leather','metalPipe'],flag:'bellowsMade',give:['bellows'],text:'The leather chamber sends air through the iron nozzle.'},
 {chapter:4,items:['oakum','resin'],flag:'caulkingMixed',give:['caulking'],text:'The fibres hold the sealing compound in the seams.'},
 {chapter:6,items:['chart','journal'],flag:'chartMarked',give:['markedChart'],text:'The journal positions are now marked on the chart.'}
];
// Each permanent event has one flag. Wrong actions never consume an item.
const RULES=[
 {chapter:2,item:'weatherPatch',target:'roof',flag:'roofSealed',consume:['weatherPatch'],text:'The stitched hide closes the roof against the winter rain.'},
 {chapter:2,item:'flask',target:'spring',flag:'waterFetched',consume:['flask'],give:['filledFlask'],text:'The waterskin fills from the clear stream.'},
 {chapter:2,item:'filledFlask',target:'kettle',flag:'waterStored',consume:['filledFlask'],text:'Fresh water is ready in the kettle.'},
 {chapter:2,item:'tinderbox',target:'stove',flag:'warmthReady',requires:['roofSealed','waterStored'],text:'Under the repaired roof, the hearth warms water for everyone.',blocked:'Repair the roof and fill the kettle before lighting the hearth.'},
 {chapter:3,item:'bellows',target:'furnace',flag:'bellowsFitted',consume:['bellows'],text:'The bellows are connected to the furnace.'},
 {chapter:3,item:'charcoal',target:'furnace',flag:'forgeFueled',consume:['charcoal'],text:'Charcoal fills the small stone furnace.'},
 {chapter:3,item:'tinderbox',target:'furnace',flag:'forgeLit',requires:['bellowsFitted','forgeFueled'],text:'Air and charcoal bring the forge to working heat.',blocked:'The furnace needs charcoal and a working bellows.'},
 {chapter:3,item:'ironScrap',target:'anvil',flag:'drillForged',requires:['forgeLit'],unless:'drillForged',consume:['ironScrap'],give:['drillBlank'],text:'Raynal shapes a trial bit. The hard timber will be its test.',blocked:'The forge must be hot before the iron can be worked.'},
 {chapter:3,item:'drillBlank',target:'testBlock',flag:'drillFailed',requires:['drillForged'],consume:['drillBlank'],give:['ironScrap'],text:'The bit will not hold its edge. The iron must serve a smaller plan.'},
 {chapter:3,item:'ironScrap',target:'anvil',flag:'nailsForged',requires:['forgeLit','drillFailed'],consume:['ironScrap'],give:['boatNails'],text:'The failed bit becomes fastenings for rebuilding the smaller boat.',blocked:'Test the trial drill in the timber before choosing the next step.'},
 {chapter:4,item:'planks',target:'boatFrame',flag:'hullPlanked',consume:['planks'],text:'The salvaged planks raise the sides of the small boat.'},
 {chapter:4,item:'boatNails',target:'boatFrame',flag:'hullFastened',requires:['hullPlanked'],consume:['boatNails'],text:'The hand-forged nails hold the new sides firmly.',blocked:'Fit the planks before fastening them.'},
 {chapter:4,item:'caulking',target:'seams',flag:'boatSealed',requires:['hullFastened'],consume:['caulking'],text:'The caulking fills the seams between the fastened planks.',blocked:'Fasten the hull before sealing its seams.'},
 {chapter:4,item:'sailcloth',target:'boatMast',flag:'sailRigged',requires:['hullFastened'],consume:['sailcloth'],text:'The sound canvas is bent to the boat’s rig.',blocked:'Finish fastening the boat before setting up the sail.'},
 {chapter:5,item:'stormLine',target:'rigging',flag:'rigSecured',consume:['stormLine'],text:'The line steadies the rig against the sea.'},
 {chapter:5,item:'bailer',target:'bilge',flag:'boatDry',requires:['rigSecured'],text:'Alick scoops water from the bilge while Musgrave keeps the pump going.',blocked:'Secure the loose rigging first.'},
 {chapter:5,item:'canvasPatch',target:'tornSail',flag:'sailMended',requires:['boatDry'],consume:['canvasPatch'],text:'The patch holds. The sail can draw again.',blocked:'Bail the boat before working on the damaged sail.'},
 {chapter:5,item:'compass',target:'horizon',flag:'courseSet',requires:['rigSecured','boatDry','sailMended'],text:'With the boat ready, the northern bearing can be held.',blocked:'Secure the rig, bail the water and mend the sail before holding a course.'},
 {chapter:6,item:'markedChart',target:'chartTable',flag:'rescueRoute',consume:['markedChart'],text:'The return route leads back to Carnley Harbour.'},
 {chapter:6,item:'provisions',target:'rescueCutter',flag:'rescueSupplied',consume:['provisions'],text:'Fresh stores are aboard Flying Scud.'},
 {chapter:6,item:'spareSail',target:'rescueCutter',flag:'rescueRigged',consume:['spareSail'],text:'Spare canvas is stowed for the southward voyage.'},
 {chapter:7,item:'rescueLine',target:'rescueBoat',flag:'boatMoored',consume:['rescueLine'],text:'The landing boat is secured against the swell.'},
 {chapter:7,item:'rescueProvisions',target:'campTable',flag:'suppliesShared',consume:['rescueProvisions'],text:'Fresh supplies are laid out for Henry and George.'},
 {chapter:7,item:'lantern',target:'signalPost',flag:'landingMarked',requires:['boatMoored'],consume:['lantern'],text:'A sheltered light marks the safe landing for the waiting boat.',blocked:'Secure the boat before marking the landing.'},
 {chapter:7,verb:'talk',target:'henry',flag:'henryFound',text:'Henry is ready to leave when the boat and supplies are prepared.'},
 {chapter:7,verb:'talk',target:'george',flag:'georgeFound',text:'George has heard the promise: this time they leave together.'},
 {chapter:7,verb:'use',target:'rescueBoat',flag:'menRescued',requires:['boatMoored','suppliesShared','landingMarked','henryFound','georgeFound'],text:'Henry and George board with Musgrave. All five Grafton castaways have survived.',blocked:'Secure and mark the landing, share the supplies, and speak to both waiting men.'}
];
const PICKUPS=SCENES.flatMap(s=>s.targets.filter(t=>t.pickupFlag).map(t=>({chapter:s.chapter,scene:s.id,target:t.id,flag:t.pickupFlag,give:[t.item]})));
const EVENTS=[...PICKUPS,...RECIPES.map(r=>({...r,consume:r.items})),...RULES];
const FLAGS=[...Base.FLAGS,...new Set(EVENTS.map(r=>r.flag))];
const chapterFlags=n=>EVENTS.filter(r=>r.chapter===n).map(r=>r.flag);
const complete=s=>getChapter(s).goals.every(g=>s.flags[g.flag]);
function normalize(s){s.chapterComplete=complete(s);s.completed=s.chapter===7&&s.chapterComplete;return s;}
function createGame(){const s=Base.createGame();s.version=VERSION;s.chapter=1;s.flags=Object.fromEntries(FLAGS.map(k=>[k,Boolean(s.flags[k])]));return normalize(s);}
function projectBase(s){return {version:3,scene:s.scene,inventory:clone(s.inventory),flags:Object.fromEntries(Base.FLAGS.map(k=>[k,s.flags[k]])),log:s.log.filter(e=>Base.SCENES.some(scene=>scene.id===e.scene)),completed:s.flags.shelterBuilt&&s.flags.fireLit&&s.flags.signalRaised,actions:s.actions};}
function fromBase(original,r){const next=clone(original);for(const k of ['scene','inventory','log','actions'])next[k]=r.state[k];for(const k of Base.FLAGS)next.flags[k]=r.state.flags[k];normalize(next);return {...r,state:next,completed:next.completed,chapterComplete:next.chapterComplete};}
function response(original,next,text,cue='look',gained=[],consumed=[],targetId=null){normalize(next);const changed=JSON.stringify({...original,log:[],actions:0})!==JSON.stringify({...next,log:[],actions:0});if(changed){next.actions=original.actions+1;next.log.push({text,cue,scene:next.scene});next.log=next.log.slice(-80);}return {state:next,text,cue,changed,gained,consumed,targetId,completed:next.completed,chapterComplete:next.chapterComplete};}
const unchanged=(s,text,cue='wrong',targetId=null)=>response(s,clone(s),text,cue,[],[],targetId);
// Their places follow the same work flags in live play and restored saves.
const firstNightCrew = {
 raynal: person('raynal','François Raynal',70.2,58),
 musgrave: person('musgrave','Thomas Musgrave',53,61),
 henry: person('henry','Henry Forgés',56,65),
 george: person('george','George Harris',84,64)
};
function firstNightRoom(s,id) {
 if(id==='raynal'&&!s.flags.shelterBuilt)return 'beach';
 if(id==='musgrave'&&!complete(s))return 'wreck';
 return 'camp';
}
function getTargets(s){
 if(chapter(s)===1){
  const original=Base.getTargets(projectBase(s));
  const targets=original.filter(t=>t.kind!=='person'||firstNightRoom(s,t.id)===s.scene);
  if(s.scene==='camp'){
   for(const [id,actor] of Object.entries(firstNightCrew)){
    if(id!=='henry'&&firstNightRoom(s,id)==='camp')targets.push({...actor});
   }
  }
  return targets;
 }
 const scene=sceneById(s.scene);
 if(!scene||scene.chapter!==chapter(s))return [];
 return scene.targets.filter(t=>!t.pickupFlag||!s.flags[t.pickupFlag]).map(t=>({...t,solved:Boolean(t.solvedFlag&&s.flags[t.solvedFlag])}));
}
function getExits(s){return (sceneById(s.scene)?.exits||[]).filter(e=>sceneById(e.to)?.chapter===chapter(s));}
function findTarget(s,id){return getTargets(s).find(t=>t.id===id)||getExits(s).find(e=>e.id===id);}
function travel(s,id){if(chapter(s)===1)return fromBase(s,Base.travel(projectBase(s),id));if(!getExits(s).some(e=>e.to===id))return unchanged(s,'There is no path there from here.','blocked');const next=clone(s);next.scene=id;return response(s,next,sceneById(id).name,'travel');}
function ready(s,r){return (r.requires||[]).every(f=>s.flags[f])&&(!r.unless||!s.flags[r.unless]);}
function applyEvent(s,r,targetId){if(s.flags[r.flag])return unchanged(s,'That work is already finished.','done',targetId);if(!ready(s,r))return unchanged(s,r.blocked||'Another part of the work must be finished first.','blocked',targetId);if((r.consume||[]).some(i=>!has(s,i)))return unchanged(s,'The necessary item is not in the satchel.','wrong',targetId);const next=clone(s);next.flags[r.flag]=true;for(const id of r.consume||[])next.inventory=next.inventory.filter(i=>i!==id);for(const id of r.give||[])if(!has(next,id))next.inventory.push(id);return response(s,next,r.text||`${ITEMS[r.give[0]].name} is in the satchel.`,r.cue||(r.give?.[0]||'done'),r.give||[],r.consume||[],targetId);}
function interact(s,id,verb='look'){
 if(chapter(s)===1){
  if(Object.hasOwn(firstNightCrew,id)){
   if(firstNightRoom(s,id)!==s.scene)return unchanged(s,'We cannot reach that from here.','wrong',id);
   if(s.scene==='camp'&&id!=='henry'){
    const reports={raynal:'Raynal rests under the sail with the others in earshot.',
     musgrave:'Musgrave counts the faces gathered under the trees.',
     george:'George watches the shore from the edge of camp.'};
    return unchanged(s,reports[id],verb==='look'?'eye':'talk',id);
   }
  }
  return fromBase(s,Base.interact(projectBase(s),id,verb));
 }
 const target=findTarget(s,id);if(!target)return unchanged(s,'We cannot reach that from here.','wrong',id);
 if(target.to)return verb==='look'?unchanged(s,target.name,'travel',id):travel(s,target.to);
 if(verb==='look')return unchanged(s,target.solved?'That work is finished.':target.kind==='item'?ITEMS[target.item].description:target.name+'.',target.art||'eye',id);
 if(target.kind==='item'&&['take','use','interact'].includes(verb))return applyEvent(s,PICKUPS.find(p=>p.chapter===chapter(s)&&p.target===id),id);
 const action=target.kind==='person'?'talk':verb==='interact'?'use':verb;
 const r=RULES.find(r=>r.chapter===chapter(s)&&r.target===id&&r.verb===action);if(r)return applyEvent(s,r,id);
 if(target.kind==='person'){const h=hint(s);return unchanged(s,h.text,'talk',id);}
 return unchanged(s,target.solved?'That work is finished.':'Something from the satchel may help here.',target.solved?'done':target.art||'hand',id);
}
function combine(s,a,b){if(chapter(s)===1)return fromBase(s,Base.combine(projectBase(s),a,b));if(a===b||!has(s,a)||!has(s,b))return unchanged(s,'Both different items need to be in the satchel.');const r=RECIPES.find(r=>r.chapter===chapter(s)&&r.items.includes(a)&&r.items.includes(b));return r?applyEvent(s,{...r,consume:r.items,cue:'combine'},null):unchanged(s,'Those items do not fit together.');}
function useItem(s,item,id){
 if(chapter(s)===1){
  if(Object.hasOwn(firstNightCrew,id)&&firstNightRoom(s,id)!==s.scene)
   return unchanged(s,'We cannot reach that from here.','wrong',id);
  return fromBase(s,Base.useItem(projectBase(s),item,id));
 }
 if(!has(s,item))return unchanged(s,'That item is not in the satchel.');if(has(s,id))return combine(s,item,id);const target=findTarget(s,id);if(!target)return unchanged(s,'We cannot reach that from here.');const matches=RULES.filter(r=>r.chapter===chapter(s)&&r.item===item&&r.target===id);const r=matches.find(r=>!s.flags[r.flag]&&ready(s,r))||matches.find(r=>!s.flags[r.flag])||matches[0];return r?applyEvent(s,r,id):unchanged(s,'Try another item.','wrong',id);}
function advance(s){if(!complete(s))return unchanged(s,'Finish the work in this chapter before leaving.','blocked');if(chapter(s)===7)return unchanged(s,'All five Grafton castaways survived.','done');const next=clone(s);next.chapter++;next.scene=getChapter(next).entry;next.inventory=[...LOADOUT[next.chapter]];const r=response(s,next,getChapter(next).title,'chapter');r.chapterChanged=true;return r;}

// A small household decision travels with the main save. Older crossings have no
// recorded roll; their return must never claim the player chose a place for it.
function stowRoll(s, place) {
 if (s.chapter !== 4 || s.scene !== 'slipway' || !complete(s) || !['peg','board'].includes(place))
  return unchanged(s,'We still have work at the boat.','blocked');
 if (s.repairRoll?.place === place) return unchanged(s,'It is already there.','done');
 const next = clone(s);
 next.repairRoll = {place, seen:false};
 const where = place === 'peg' ? 'on the peg by the door' : 'beneath the loose shelf board';
 return response(s,next,'Alick leaves the sewing roll ' + where + ' for Henry and George.','done');
}
function examineRoll(s, place) {
 if (s.chapter !== 7 || s.scene !== 'return_camp' || !s.repairRoll || s.repairRoll.place !== place)
  return unchanged(s,'Only the marks in the wood.','look');
 if (s.repairRoll.seen) return unchanged(s,'The little repair has held.','look');
 const next = clone(s); next.repairRoll.seen = true;
 const trace = place === 'peg' ? 'George shows Musgrave the blue-striped patch on the hanging canvas.' : 'Henry shows Musgrave a square patch stitched into the folded canvas.';
 return response(s,next,trace,'look');
}
// Tutorial ordering is a hint sequence, not a restriction on valid player ordering.
const STEPS={
 2:[['hideTaken','cabin','hide'],['twineTaken','cabin','twine'],['patchStitched','cabin','roof','hide','twine'],['roofSealed','cabin','roof','weatherPatch'],['flaskTaken','cabin','flask'],['waterFetched','forest','spring','flask'],['waterStored','cabin','kettle','filledFlask'],['warmthReady','cabin','stove','tinderbox']],
 3:[['leatherTaken','forge','leather'],['pipeTaken','forge','metalPipe'],['bellowsMade','forge','furnace','leather','metalPipe'],['bellowsFitted','forge','furnace','bellows'],['charcoalTaken','charcoal','charcoal'],['forgeFueled','forge','furnace','charcoal'],['forgeLit','forge','furnace','tinderbox'],['ironTaken','charcoal','ironScrap'],['drillForged','forge','anvil','ironScrap'],['drillFailed','forge','testBlock','drillBlank'],['nailsForged','forge','anvil','ironScrap']],
 4:[['planksTaken','salvage','planks'],['hullPlanked','slipway','boatFrame','planks'],['hullFastened','slipway','boatFrame','boatNails'],['oakumTaken','salvage','oakum'],['resinTaken','slipway','resin'],['caulkingMixed','slipway','seams','oakum','resin'],['boatSealed','slipway','seams','caulking'],['sailclothTaken','salvage','sailcloth'],['sailRigged','slipway','boatMast','sailcloth']],
 5:[['lineTaken','crossing','stormLine'],['rigSecured','crossing','rigging','stormLine'],['bailerTaken','crossing','bailer'],['boatDry','crossing','bilge','bailer'],['patchTaken','crossing','canvasPatch'],['sailMended','crossing','tornSail','canvasPatch'],['compassTaken','crossing','compass'],['courseSet','crossing','horizon','compass']],
 6:[['chartTaken','chartroom','chart'],['journalTaken','chartroom','journal'],['chartMarked','chartroom','chartTable','chart','journal'],['rescueRoute','chartroom','chartTable','markedChart'],['provisionsTaken','harbour','provisions'],['rescueSupplied','harbour','rescueCutter','provisions'],['spareSailTaken','harbour','spareSail'],['rescueRigged','harbour','rescueCutter','spareSail']],
 7:[['rescueLineTaken','landing','rescueLine'],['boatMoored','landing','rescueBoat','rescueLine'],['rescueProvisionsTaken','landing','rescueProvisions'],['suppliesShared','return_camp','campTable','rescueProvisions'],['lanternTaken','landing','lantern'],['landingMarked','landing','signalPost','lantern'],['henryFound','return_camp','henry'],['georgeFound','return_camp','george'],['menRescued','landing','rescueBoat']]
};
function hint(s){if(chapter(s)===1){const h=Base.hint(projectBase(s));return {...h,...(h.cue==='combine'?{combineItems:['rope','pole']}:{}),...(s.chapterComplete?{text:'The first night is secure. Follow the chapter passage when ready.',cue:'done'}:{})};}if(complete(s))return {sceneId:s.scene,targetId:getTargets(s)[0]?.id||'',cue:'done',text:s.completed?'All five survived.':'The work is complete. Follow the chapter passage.',itemId:null};const [flag,sceneId,targetId,a,b]=STEPS[chapter(s)].find(step=>!s.flags[step[0]]);const t=sceneById(sceneId).targets.find(t=>t.id===targetId);let text,cue;if(b){text=`Combine ${ITEMS[a].name.toLowerCase()} with ${ITEMS[b].name.toLowerCase()}.`;cue='combine';}else if(a){text=`Use ${ITEMS[a].name.toLowerCase()} at ${t.name.toLowerCase()}.`;cue=a;}else{cue=t.kind==='person'?'talk':t.kind==='item'?'take':'hand';text=t.kind==='person'?`Speak to ${t.name}.`:t.kind==='item'?`Pick up ${ITEMS[t.item].name.toLowerCase()}.`:`Return to ${t.name.toLowerCase()} when everyone is ready.`;}return {sceneId,targetId,itemId:a||null,cue,text,...(b?{combineItems:[a,b]}:{})};}
// Replay only the stored permanent event flags to establish exact possible inventory.
function replayChapter(n,flags){const pending=EVENTS.filter(e=>e.chapter===n&&flags[e.flag]),sim={inventory:[...LOADOUT[n]],flags:Object.fromEntries(FLAGS.map(f=>[f,false]))};let progress=true;while(pending.length&&progress){progress=false;for(let i=pending.length-1;i>=0;i--){const e=pending[i];if(!ready(sim,e)||(e.item&&!has(sim,e.item))||(e.consume||[]).some(id=>!has(sim,id)))continue;sim.flags[e.flag]=true;for(const id of e.consume||[])sim.inventory=sim.inventory.filter(x=>x!==id);for(const id of e.give||[])if(!has(sim,id))sim.inventory.push(id);pending.splice(i,1);progress=true;}}return pending.length?null:sim;}
function restore(raw){try{
 if(raw?.version===3){const old=Base.restore(raw);if(!old)return null;const next=createGame();for(const k of ['scene','inventory','log','actions'])next[k]=clone(old[k]);for(const k of Base.FLAGS)next.flags[k]=old.flags[k];return normalize(next);}
 if(!raw||raw.version!==VERSION||!Number.isInteger(raw.chapter)||raw.chapter<1||raw.chapter>7||sceneById(raw.scene)?.chapter!==raw.chapter)return null;
 if(Object.hasOwn(raw,'repairRoll')){
  const roll=raw.repairRoll;
  if(!roll || !['peg','board'].includes(roll.place) || typeof roll.seen!=='boolean' ||
     raw.chapter<4 || (raw.chapter===4&&!complete(raw)) || (roll.seen&&raw.chapter!==7))return null;
 }
 if(!raw.flags||Object.keys(raw.flags).length!==FLAGS.length||FLAGS.some(f=>typeof raw.flags[f]!=='boolean'))return null;
 if(!Array.isArray(raw.inventory)||new Set(raw.inventory).size!==raw.inventory.length||raw.inventory.some(id=>!ITEMS[id])||raw.inventory.length>12)return null;
 if(!Number.isInteger(raw.actions)||raw.actions<0||raw.actions>100000||!Array.isArray(raw.log)||raw.log.length>80||raw.log.some(e=>!e||typeof e.text!=='string'||e.text.length>1000||typeof e.cue!=='string'||!sceneById(e.scene)))return null;
 if(typeof raw.chapterComplete!=='boolean'||raw.chapterComplete!==complete(raw)||typeof raw.completed!=='boolean'||raw.completed!==(raw.chapter===7&&raw.chapterComplete))return null;
 if(raw.chapter===1){if(!Base.restore(projectBase(raw)))return null;}else if(Base.FLAGS.some(f=>!raw.flags[f]))return null;
 for(let n=2;n<=7;n++){
  if(n>raw.chapter){if(chapterFlags(n).some(f=>raw.flags[f]))return null;continue;}
  const sim=replayChapter(n,raw.flags);if(!sim)return null;
  if(n<raw.chapter&&!CHAPTERS[n-1].goals.every(g=>sim.flags[g.flag]))return null;
  if(n===raw.chapter&&JSON.stringify([...sim.inventory].sort())!==JSON.stringify([...raw.inventory].sort()))return null;
 }
 return clone(raw);
 }catch(_){return null;}}
return {VERSION,ITEMS,SCENES,FLAGS,CHAPTERS,chapter,getChapter,getExits,createGame,getTargets,interact,useItem,combine,travel,restore,hint,advance,stowRoll,examineRoll};
});

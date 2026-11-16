/* Original inventory-puzzle model. The puzzle sequence is an authored adaptation, not a reconstructed historical event. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AdventureEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION=3;
const ITEMS={
 rope:{id:'rope',name:'Lano',description:'Pevný kus lana; na konci lze uvázat smyčku.',icon:'rope'},
 pole:{id:'pole',name:'Bidlo',description:'Dlouhé hladké bidlo dosáhne dál než ruka.',icon:'pole'},
 loopPole:{id:'loopPole',name:'Bidlo se smyčkou',description:'Smyčka na konci bidla zachytí vzdálenou věc.',icon:'loopPole'},
 canvas:{id:'canvas',name:'Plachtovina',description:'Zachráněná plachta může zakrýt nízký přístřešek.',icon:'canvas'},
 prybar:{id:'prybar',name:'Železná páka',description:'Kus uvolněného železa poslouží jako páka.',icon:'prybar'},
 axe:{id:'axe',name:'Sekera',description:'Ostří odhalí suché dřevo uvnitř mokrého kmene.',icon:'axe'},
 tinderbox:{id:'tinderbox',name:'Křesadlo a troud',description:'Uzavřená krabička uchovala troud suchý.',icon:'tinderbox'},
 firewood:{id:'firewood',name:'Suché třísky',description:'Třísky ze suchého středu kmene jsou připravené k podpalu.',icon:'firewood'},
 flagcloth:{id:'flagcloth',name:'Pruh plátna',description:'Zbytek plachty bude z dálky vidět na vysokém bidle.',icon:'flagcloth'}
};
const SCENES=[
 {id:'beach',name:'Na břehu',exits:[{id:'exit_wreck',name:'K vraku',to:'wreck',x:8,y:49},{id:'exit_camp',name:'K táboru',to:'camp',x:92,y:54}],targets:[
  {id:'rope',name:'Lano v naplaveninách',x:70,y:63,kind:'item',item:'rope'},
  {id:'pole',name:'Dlouhé bidlo',x:47,y:74,kind:'item',item:'pole'},
  {id:'sail',name:'Zachycená plachta',x:59,y:43,kind:'puzzle'},
  {id:'driftwood',name:'Vyplavený kmen',x:32,y:54,kind:'puzzle'},
  {id:'raynal',name:'François Raynal',x:81,y:63,kind:'person'}]},
 {id:'wreck',name:'U vraku',exits:[{id:'exit_beach_wreck',name:'Zpět na břeh',to:'beach',x:93,y:76}],targets:[
  {id:'prybar',name:'Uvolněné železo',x:55,y:64,kind:'item',item:'prybar'},
  {id:'crate',name:'Bedna s nářadím',x:72,y:56,kind:'puzzle'},
  {id:'musgrave',name:'Thomas Musgrave',x:83,y:63,kind:'person'}]},
 {id:'camp',name:'Pod stromy',exits:[{id:'exit_beach_camp',name:'Zpět na břeh',to:'beach',x:7,y:76}],targets:[
  {id:'shelter',name:'Rám přístřešku',x:72,y:48,kind:'puzzle'},
  {id:'hearth',name:'Ohniště',x:27,y:67,kind:'puzzle'},
  {id:'cairn',name:'Kamenná patka',x:42,y:44,kind:'puzzle'},
  {id:'henry',name:'Henry Forgés',x:56,y:65,kind:'person'}]}
];
const FLAGS=['ropeTaken','poleTaken','canvasRecovered','prybarTaken','crateOpen','woodCut','firewoodPlaced','shelterBuilt','fireLit','mastRaised','signalRaised'];
const clone=s=>JSON.parse(JSON.stringify(s));
const has=(s,id)=>s.inventory.includes(id);
const sceneById=id=>SCENES.find(scene=>scene.id===id);
function createGame(){return {version:VERSION,scene:'beach',inventory:[],flags:Object.fromEntries(FLAGS.map(key=>[key,false])),log:[],completed:false,actions:0};}
function getTargets(state){
 const scene=sceneById(state.scene);
 if(!scene)return [];
 return scene.targets.filter(t=>t.id==='rope'?!state.flags.ropeTaken:t.id==='pole'?!state.flags.poleTaken:t.id==='prybar'?!state.flags.prybarTaken:t.id==='sail'?!state.flags.canvasRecovered:true).map(t=>({...t}));
}
function findTarget(state,id){return getTargets(state).find(t=>t.id===id)||sceneById(state.scene)?.exits.find(t=>t.id===id);}
function response(original,next,text,cue='look',gained=[],consumed=[],targetId=null){
 next.completed=next.flags.shelterBuilt&&next.flags.fireLit&&next.flags.signalRaised;
 const changed=JSON.stringify({...original,log:[],actions:0})!==JSON.stringify({...next,log:[],actions:0});
 if(changed){next.actions=(original.actions||0)+1;next.log.push({text,cue,scene:next.scene});if(next.log.length>80)next.log.shift();}
 return {state:next,text,cue,changed,gained,consumed,targetId,completed:next.completed,moveTo:targetId?findTarget(next,targetId)||null:null};
}
function unchanged(s,text,cue='wrong',targetId=null){return response(s,clone(s),text,cue,[],[],targetId);}
function give(s,id){if(!has(s,id))s.inventory.push(id);}
function consume(s,id){s.inventory=s.inventory.filter(item=>item!==id);}
function travel(state,sceneId){
 if(!sceneById(sceneId))return unchanged(state,'Tudy cesta nevede.','blocked');
 if(state.scene===sceneId)return unchanged(state,'Už jsme tady.','look');
 if(!sceneById(state.scene).exits.some(exit=>exit.to===sceneId))return unchanged(state,'Nejdřív se vrať na břeh.','beach');
 const next=clone(state);next.scene=sceneId;return response(state,next,sceneById(sceneId).name,'travel');
}
function look(state,id){
 const f=state.flags;
 const text={
  rope:'Na konci lana půjde uvázat smyčka.',pole:'Samotné bidlo na hladké plachtě neudrží úchop.',
  sail:'Plachta je příliš daleko; něco ji musí zachytit.',driftwood:f.woodCut?'Suchý střed už je naštípaný.':'Kmen má mokrý povrch, ale uvnitř může zůstat suchý.',
  prybar:'Uvolněné železo poslouží jako páka.',crate:f.crateOpen?'Bedna je otevřená; nástroje už máme.':'Víko drží pevně a pod okrajem je úzká spára.',
  shelter:f.shelterBuilt?'Pod plachtou je sucho a závětří.':'Rám drží, ale chybí mu plachta.',
  hearth:f.fireLit?'Oheň hoří v závětří.':f.firewoodPlaced?'Třísky čekají na jiskru.':'K podpalování potřebujeme suché třísky.',
  cairn:f.signalRaised?'Pruh plátna se pohybuje nad stromy.':f.mastRaised?'Na bidle ještě chybí něco světlého.':'Mezi kameny by mohlo stát dlouhé bidlo.',
  raynal:'Raynal odpočívá v závětří a sleduje vzdálenou plachtu.',musgrave:'Musgrave prohlíží zachráněnou bednu.',henry:'Henry připravuje místo pro přístřešek a oheň.'
 };
 const cue={rope:'rope',pole:'loopPole',sail:'loopPole',driftwood:'axe',prybar:'prybar',crate:f.crateOpen?'done':'prybar',shelter:f.shelterBuilt?'done':'canvas',hearth:f.fireLit?'fire':f.firewoodPlaced?'tinderbox':'firewood',cairn:f.signalRaised?'done':f.mastRaised?'flagcloth':'loopPole'}[id]||'talk';
 return unchanged(state,text[id]||'Tady nic dalšího není.',cue,id);
}
function interact(state,targetId,verb='look'){
 const target=findTarget(state,targetId);
 if(!target)return unchanged(state,'Teď na to nedosáhneme.','wrong');
 if(target.to)return verb==='look'?unchanged(state,target.name,'travel',targetId):travel(state,target.to);
 if(verb==='look')return look(state,targetId);
 if(verb==='talk'){
  if(target.kind!=='person')return unchanged(state,'Tohle nám neodpoví.','wrong',targetId);
  const f=state.flags;
  const advice=targetId==='raynal'?
   (!f.canvasRecovered?['Zachyť plachtu smyčkou na bidle.','loopPole']:!f.shelterBuilt?['Z té plachty bude dobrá střecha.','canvas']:!f.signalRaised?['Zbytek světlého plátna patří na stožár.','flagcloth']:['Znamení je vidět.','done']):targetId==='musgrave'?
   (!f.crateOpen?['Zkus železo podsunout pod víko.','prybar']:!f.woodCut?['Sekera odhalí suchý střed kmene.','axe']:!f.fireLit?['V krabičce je suchý troud a křesadlo.','tinderbox']:['Oheň se udržel.','done']):
   (!f.shelterBuilt?['Potřebujeme střechu, pak se oheň udrží.','canvas']:!f.firewoodPlaced?['Suché třísky patří do ohniště.','firewood']:!f.fireLit?['Teď přilož křesadlo k suchému troudu.','tinderbox']:!f.mastRaised?['Bidlo může stát v kamenné patce.','loopPole']:!f.signalRaised?['Světlý pruh plátna nahoře bude dobře vidět.','flagcloth']:['První noc jsme připraveni přečkat.','done']);
  const [line,cue]=advice;
  return unchanged(state,line,cue,targetId);
 }
 if(verb==='take'||verb==='use'||verb==='interact'){
  const next=clone(state),pickups={rope:'ropeTaken',pole:'poleTaken',prybar:'prybarTaken'};
  if(pickups[targetId]){next.flags[pickups[targetId]]=true;give(next,targetId);return response(state,next,`${ITEMS[targetId].name} je v brašně.`,'take',[targetId],[],targetId);}
  if(targetId==='cairn'&&state.flags.mastRaised&&!state.flags.signalRaised){
   next.flags.mastRaised=false;give(next,'loopPole');return response(state,next,'Bidlo můžeme ještě použít jinde.','take',['loopPole'],[],targetId);
  }
  if(target.kind==='person')return interact(state,targetId,'talk');
  return look(state,targetId);
 }
 return unchanged(state,'Tohle tady nejde.','wrong',targetId);
}
function combine(state,itemA,itemB){
 if(!has(state,itemA)||!has(state,itemB))return unchanged(state,'Obě věci musí být v brašně.','wrong');
 if(new Set([itemA,itemB]).size===2&&[itemA,itemB].includes('rope')&&[itemA,itemB].includes('pole')){
  const next=clone(state);consume(next,'rope');consume(next,'pole');give(next,'loopPole');return response(state,next,'Smyčka na bidle zachytí plachtu.','combine',['loopPole'],['rope','pole']);
 }
 return unchanged(state,'Tyto věci k sobě nepatří.','wrong');
}
function useItem(state,itemId,targetId){
 if(!has(state,itemId))return unchanged(state,'Tuhle věc nemáme v brašně.','wrong',targetId);
 if(has(state,targetId))return combine(state,itemId,targetId);
 const target=findTarget(state,targetId);
 if(!target)return unchanged(state,'Teď na to nedosáhneme.','wrong');
 const next=clone(state),f=next.flags;
 if(itemId==='loopPole'&&targetId==='sail'){
  f.canvasRecovered=true;give(next,'canvas');return response(state,next,'Plachta je konečně na břehu.','canvas_recovered',['canvas'],[],targetId);
 }
 if(itemId==='prybar'&&targetId==='crate'){
  if(f.crateOpen)return unchanged(state,'Bedna už je otevřená.','done',targetId);
  f.crateOpen=true;give(next,'axe');give(next,'tinderbox');return response(state,next,'Uvnitř je sekera a suché křesadlo s troudem.','crate_open',['axe','tinderbox'],[],targetId);
 }
 if(itemId==='axe'&&targetId==='driftwood'){
  if(f.woodCut)return unchanged(state,'Suché třísky už máme připravené.','done',targetId);
  f.woodCut=true;give(next,'firewood');return response(state,next,'Pod mokrou kůrou je dřevo suché.','wood_cut',['firewood'],[],targetId);
 }
 if(itemId==='canvas'&&targetId==='shelter'){
  if(f.shelterBuilt)return unchanged(state,'Střecha už drží.','done',targetId);
  f.shelterBuilt=true;consume(next,'canvas');give(next,'flagcloth');return response(state,next,'Střecha je napnutá a zbyl světlý pruh plátna.','shelter_built',['flagcloth'],['canvas'],targetId);
 }
 if(itemId==='firewood'&&targetId==='hearth'){
  f.firewoodPlaced=true;consume(next,'firewood');return response(state,next,'Suché třísky jsou v ohništi.','fuel_placed',[],['firewood'],targetId);
 }
 if(itemId==='tinderbox'&&targetId==='hearth'){
  if(f.fireLit)return unchanged(state,'Oheň už hoří.','fire',targetId);
  if(!f.firewoodPlaced)return unchanged(state,'Jiskra potřebuje suché třísky.','firewood',targetId);
  if(!f.shelterBuilt)return unchanged(state,'Nejdřív střechu; vítr plamen hned sfoukne.','canvas',targetId);
  f.fireLit=true;return response(state,next,'Oheň se udržel.','fire_lit',[],[],targetId);
 }
 if(itemId==='loopPole'&&targetId==='cairn'){
  if(f.mastRaised)return unchanged(state,'Bidlo už stojí mezi kameny.','flagcloth',targetId);
  f.mastRaised=true;consume(next,'loopPole');return response(state,next,'Bidlo pevně stojí; nahoře chybí světlé plátno.','mast_raised',[],['loopPole'],targetId);
 }
 if(itemId==='flagcloth'&&targetId==='cairn'){
  if(!f.mastRaised)return unchanged(state,'Plátno musí být výš na dlouhém bidle.','loopPole',targetId);
  f.signalRaised=true;consume(next,'flagcloth');return response(state,next,'Znamení je nad pobřežím vidět.','signal_raised',[],['flagcloth'],targetId);
 }
 if(target.kind==='person')return unchanged(state,`${target.name.split(' ')[0]} ukazuje zpět k práci.`,'talk',targetId);
 const needs={sail:'loopPole',crate:'prybar',driftwood:'axe',shelter:'canvas',hearth:f.firewoodPlaced?'tinderbox':'firewood',cairn:f.mastRaised?'flagcloth':'loopPole'};
 return unchanged(state,'Zkus jinou věc. ',needs[targetId]||'wrong',targetId);
}
function hint(state){
 const f=state.flags;
 const result=(sceneId,targetId,cue,text,itemId=null)=>({sceneId,targetId,cue,text,itemId});
 if(state.completed)return result('camp','hearth','done','První večer je zvládnutý.');
 if(!f.canvasRecovered){
  if(f.mastRaised)return result('camp','cairn','take','Vezmi bidlo zpátky ze stojanu.');
  if(!f.ropeTaken)return result('beach','rope','take','Prohlédni naplaveniny u vody.');
  if(!f.poleTaken)return result('beach','pole','take','Na břehu leží dlouhé bidlo.');
  if(!has(state,'loopPole'))return result('beach','pole','combine','Spoj lano s bidlem.','rope');
  return result('beach','sail','loopPole','Smyčka zachytí vzdálenou plachtu.','loopPole');
 }
 if(!f.shelterBuilt)return result('camp','shelter','canvas','Zakryj rám zachráněnou plachtou.','canvas');
 if(!f.prybarTaken)return result('wreck','prybar','take','Ve vraku je kus uvolněného železa.');
 if(!f.crateOpen)return result('wreck','crate','prybar','Páka se vejde pod víko bedny.','prybar');
 if(!f.woodCut)return result('beach','driftwood','axe','Odhal suchý střed kmene.','axe');
 if(!f.firewoodPlaced)return result('camp','hearth','firewood','Přenes suché třísky do ohniště.','firewood');
 if(!f.fireLit)return result('camp','hearth','tinderbox','Teď už se plamen udrží.','tinderbox');
 if(!f.mastRaised)return result('camp','cairn','loopPole','Bidlo poslouží také jako stožár.','loopPole');
 return result('camp','cairn','flagcloth','Přivaž světlý pruh nahoru.','flagcloth');
}
function restore(raw){
 try{
  if(!raw||raw.version!==VERSION||!sceneById(raw.scene)||!Array.isArray(raw.inventory)||new Set(raw.inventory).size!==raw.inventory.length||raw.inventory.some(id=>!Object.hasOwn(ITEMS,id)))return null;
  if(!raw.flags||FLAGS.some(key=>typeof raw.flags[key]!=='boolean')||Object.keys(raw.flags).some(key=>!FLAGS.includes(key)))return null;
  if(typeof raw.completed!=='boolean'||raw.completed!==(raw.flags.shelterBuilt&&raw.flags.fireLit&&raw.flags.signalRaised)||!Number.isInteger(raw.actions)||raw.actions<0||raw.actions>100000)return null;
  if(!Array.isArray(raw.log)||raw.log.length>80||raw.log.some(entry=>!entry||typeof entry.text!=='string'||entry.text.length>1000||typeof entry.cue!=='string'||!sceneById(entry.scene)))return null;
  const f=raw.flags;
  if((f.fireLit&&(!f.shelterBuilt||!f.firewoodPlaced))||(f.signalRaised&&(!f.mastRaised||!f.shelterBuilt))||(f.shelterBuilt&&!f.canvasRecovered)||(f.woodCut&&!f.crateOpen)||(f.firewoodPlaced&&!f.woodCut))return null;
  if((has(raw,'axe')||has(raw,'tinderbox'))&&!f.crateOpen)return null;
  if(has(raw,'canvas')&&(!f.canvasRecovered||f.shelterBuilt))return null;
  if(has(raw,'flagcloth')&&(!f.shelterBuilt||f.signalRaised))return null;
  if(has(raw,'firewood')&&(!f.woodCut||f.firewoodPlaced))return null;
  if(has(raw,'loopPole')&&f.mastRaised)return null;
  if(f.ropeTaken!==has(raw,'rope')&&!has(raw,'loopPole')&&!f.mastRaised)return null;
  if(f.poleTaken!==has(raw,'pole')&&!has(raw,'loopPole')&&!f.mastRaised)return null;
  if((has(raw,'loopPole')||f.mastRaised)&&(!f.ropeTaken||!f.poleTaken||has(raw,'rope')||has(raw,'pole')))return null;
  if(f.prybarTaken!==has(raw,'prybar'))return null;
  if(f.crateOpen&&(!f.prybarTaken||!has(raw,'axe')||!has(raw,'tinderbox')))return null;
  if(f.canvasRecovered&&(!f.ropeTaken||!f.poleTaken||(!f.shelterBuilt&&!has(raw,'canvas'))))return null;
  if(f.woodCut&&!f.firewoodPlaced&&!has(raw,'firewood'))return null;
  if(f.shelterBuilt&&!f.signalRaised&&!has(raw,'flagcloth'))return null;
  return clone(raw);
 }catch(_){return null;}
}
return {VERSION,ITEMS,SCENES,FLAGS,createGame,getTargets,interact,useItem,combine,travel,restore,hint};
});

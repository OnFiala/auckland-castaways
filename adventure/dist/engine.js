/* Original inventory-puzzle model. The puzzle sequence is an authored adaptation, not a reconstructed historical event. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AdventureEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION=3;
const ITEMS={
 rope:{id:'rope',name:'Rope',description:'A sturdy length of rope, long enough to tie a loop at one end.',icon:'rope'},
 pole:{id:'pole',name:'Pole',description:'A long, smooth pole reaches farther than an arm.',icon:'pole'},
 loopPole:{id:'loopPole',name:'Looped pole',description:'The loop at the end can catch something out of reach.',icon:'loopPole'},
 canvas:{id:'canvas',name:'Canvas',description:'A salvaged sail could cover a low shelter.',icon:'canvas'},
 prybar:{id:'prybar',name:'Iron bar',description:'This loose piece of iron could work as a lever.',icon:'prybar'},
 axe:{id:'axe',name:'Axe',description:'The blade can split a wet log to reach the dry wood inside.',icon:'axe'},
 tinderbox:{id:'tinderbox',name:'Tinderbox',description:'The closed box has kept the tinder dry.',icon:'tinderbox'},
 firewood:{id:'firewood',name:'Kindling',description:'Dry splinters from the heart of the log, ready for a fire.',icon:'firewood'},
 flagcloth:{id:'flagcloth',name:'Canvas strip',description:'A scrap of sail could be seen from far away on a tall pole.',icon:'flagcloth'}
};
const SCENES=[
 {id:'beach',name:'The Shore',exits:[{id:'exit_wreck',name:'To the wreck',to:'wreck',x:8,y:49},{id:'exit_camp',name:'To the camp',to:'camp',x:92,y:54}],targets:[
  {id:'rope',name:'Rope in the driftwood',x:70,y:63,kind:'item',item:'rope'},
  {id:'pole',name:'Long pole',x:47,y:74,kind:'item',item:'pole'},
  {id:'sail',name:'Snagged sail',x:59,y:43,kind:'puzzle'},
  {id:'driftwood',name:'Driftwood log',x:32,y:54,kind:'puzzle'},
  {id:'raynal',name:'François Raynal',x:81,y:63,kind:'person'}]},
 {id:'wreck',name:'The Wreck',exits:[{id:'exit_beach_wreck',name:'Back to the shore',to:'beach',x:93,y:76}],targets:[
  {id:'prybar',name:'Loose iron bar',x:55,y:64,kind:'item',item:'prybar'},
  {id:'crate',name:'Tool chest',x:72,y:56,kind:'puzzle'},
  {id:'musgrave',name:'Thomas Musgrave',x:83,y:63,kind:'person'}]},
 {id:'camp',name:'Under the Trees',exits:[{id:'exit_beach_camp',name:'Back to the shore',to:'beach',x:7,y:76}],targets:[
  {id:'shelter',name:'Shelter frame',x:72,y:48,kind:'puzzle'},
  {id:'hearth',name:'Fire pit',x:27,y:67,kind:'puzzle'},
  {id:'cairn',name:'Stone base',x:42,y:44,kind:'puzzle'},
  {id:'henry',name:'Henry Forgés',x:56,y:65,kind:'person'}]}
];
const FLAGS=['ropeTaken','poleTaken','canvasRecovered','prybarTaken','crateOpen','woodCut','firewoodPlaced','shelterBuilt','fireLit','mastRaised','signalRaised'];
const clone=s=>JSON.parse(JSON.stringify(s));
const has=(s,id)=>s.inventory.includes(id);
const sceneById=id=>SCENES.find(scene=>scene.id===id);
function createGame(){return {version:VERSION,scene:'beach',inventory:[],flags:Object.fromEntries(FLAGS.map(key=>[key,false])),log:[],completed:false,actions:0};}
const removedAfter={rope:'ropeTaken',pole:'poleTaken',prybar:'prybarTaken',sail:'canvasRecovered',driftwood:'woodCut'};
function getTargets(state){
 const scene=sceneById(state.scene);
 if(!scene)return [];
 return scene.targets.filter(t=>!state.flags[removedAfter[t.id]]).map(t=>({...t}));
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
 if(!sceneById(sceneId))return unchanged(state,'There is no way through here.','blocked');
 if(state.scene===sceneId)return unchanged(state,'We are already here.','look');
 if(!sceneById(state.scene).exits.some(exit=>exit.to===sceneId))return unchanged(state,'Go back to the shore first.','beach');
 const next=clone(state);next.scene=sceneId;return response(state,next,sceneById(sceneId).name,'travel');
}
function look(state,id){
 const f=state.flags;
 const text={
  rope:'We could tie a loop at the end of the rope.',pole:'The bare pole would just slide off the sail.',
  sail:'The sail is out of reach. We need something to catch it.',driftwood:f.woodCut?'We have already split the dry wood inside.':'The log is wet outside, but it may still be dry inside.',
  prybar:'This loose iron bar could work as a lever.',crate:f.crateOpen?'The chest is open. We have the tools.':'The lid is stuck, but there is a narrow gap under its edge.',
  shelter:f.shelterBuilt?'The canvas keeps out the rain and wind.':'The frame is sound. It still needs a cover.',
  hearth:f.fireLit?'The fire is burning out of the wind.':f.firewoodPlaced?'The kindling is ready for a spark.':'We need dry kindling to start a fire.',
  cairn:f.signalRaised?'The canvas strip flutters above the trees.':f.mastRaised?'The pole needs something bright at the top.':'A long pole could stand between these stones.',
  raynal:'Raynal rests out of the wind, watching the snagged sail.',musgrave:'Musgrave examines the salvaged chest.',henry:'Henry clears a place for shelter and a fire.'
 };
 const cue={rope:'rope',pole:'loopPole',sail:'loopPole',driftwood:'axe',prybar:'prybar',crate:f.crateOpen?'done':'prybar',shelter:f.shelterBuilt?'done':'canvas',hearth:f.fireLit?'fire':f.firewoodPlaced?'tinderbox':'firewood',cairn:f.signalRaised?'done':f.mastRaised?'flagcloth':'loopPole'}[id]||'talk';
 return unchanged(state,text[id]||'There is nothing else here.',cue,id);
}
function interact(state,targetId,verb='look'){
 const target=findTarget(state,targetId);
 if(!target)return unchanged(state,'We cannot reach that from here.','wrong');
 if(target.to)return verb==='look'?unchanged(state,target.name,'travel',targetId):travel(state,target.to);
 if(verb==='look')return look(state,targetId);
 if(verb==='talk'){
  if(target.kind!=='person')return unchanged(state,'That will not answer us.','wrong',targetId);
  const f=state.flags;
  const advice=targetId==='raynal'?
   (!f.canvasRecovered?['Try catching the sail with a loop on the pole.','loopPole']:!f.shelterBuilt?['That sail will make a good roof.','canvas']:!f.signalRaised?['The bright scrap of canvas belongs on the mast.','flagcloth']:['The signal is visible.','done']):targetId==='musgrave'?
   (!f.crateOpen?['Try slipping the iron bar under the lid.','prybar']:!f.woodCut?['The axe can reach the dry heart of the log.','axe']:!f.fireLit?['There is dry tinder and a fire striker in the box.','tinderbox']:['The fire has caught.','done']):
   (!f.shelterBuilt?['We need a roof to keep the fire going.','canvas']:!f.firewoodPlaced?['Put the dry kindling in the fire pit.','firewood']:!f.fireLit?['Now strike a spark into the dry tinder.','tinderbox']:!f.mastRaised?['The pole can stand in the stone base.','loopPole']:!f.signalRaised?['A bright strip of canvas at the top will stand out.','flagcloth']:['We are ready to face our first night.','done']);
  const [line,cue]=advice;
  return unchanged(state,line,cue,targetId);
 }
 if(verb==='take'||verb==='use'||verb==='interact'){
  const next=clone(state),pickups={rope:'ropeTaken',pole:'poleTaken',prybar:'prybarTaken'};
  if(pickups[targetId]){next.flags[pickups[targetId]]=true;give(next,targetId);return response(state,next,`${ITEMS[targetId].name} is in the satchel.`,'take',[targetId],[],targetId);}
  if(targetId==='cairn'&&state.flags.mastRaised&&!state.flags.signalRaised){
   next.flags.mastRaised=false;give(next,'loopPole');return response(state,next,'We can still use the pole elsewhere.','take',['loopPole'],[],targetId);
  }
  if(target.kind==='person')return interact(state,targetId,'talk');
  return look(state,targetId);
 }
 return unchanged(state,'That will not work here.','wrong',targetId);
}
function combine(state,itemA,itemB){
 if(!has(state,itemA)||!has(state,itemB))return unchanged(state,'Both items need to be in the satchel.','wrong');
 if(new Set([itemA,itemB]).size===2&&[itemA,itemB].includes('rope')&&[itemA,itemB].includes('pole')){
  const next=clone(state);consume(next,'rope');consume(next,'pole');give(next,'loopPole');return response(state,next,'The loop on the pole can catch the sail.','combine',['loopPole'],['rope','pole']);
 }
 return unchanged(state,'Those items do not fit together.','wrong');
}
function useItem(state,itemId,targetId){
 if(!has(state,itemId))return unchanged(state,'That item is not in the satchel.','wrong',targetId);
 if(has(state,targetId))return combine(state,itemId,targetId);
 const target=findTarget(state,targetId);
 if(!target)return unchanged(state,'We cannot reach that from here.','wrong');
 const next=clone(state),f=next.flags;
 if(itemId==='loopPole'&&targetId==='sail'){
  f.canvasRecovered=true;give(next,'canvas');return response(state,next,'The sail is finally ashore.','canvas_recovered',['canvas'],[],targetId);
 }
 if(itemId==='prybar'&&targetId==='crate'){
  if(f.crateOpen)return unchanged(state,'The chest is already open.','done',targetId);
  f.crateOpen=true;give(next,'axe');give(next,'tinderbox');return response(state,next,'Inside are an axe and a dry tinderbox.','crate_open',['axe','tinderbox'],[],targetId);
 }
 if(itemId==='axe'&&targetId==='driftwood'){
  if(f.woodCut)return unchanged(state,'We already have dry kindling.','done',targetId);
  f.woodCut=true;give(next,'firewood');return response(state,next,'The wood is dry beneath the wet bark.','wood_cut',['firewood'],[],targetId);
 }
 if(itemId==='canvas'&&targetId==='shelter'){
  if(f.shelterBuilt)return unchanged(state,'The roof is already in place.','done',targetId);
  f.shelterBuilt=true;consume(next,'canvas');give(next,'flagcloth');return response(state,next,'The roof is stretched tight, with a bright strip of canvas left over.','shelter_built',['flagcloth'],['canvas'],targetId);
 }
 if(itemId==='firewood'&&targetId==='hearth'){
  f.firewoodPlaced=true;consume(next,'firewood');return response(state,next,'The dry kindling is in the fire pit.','fuel_placed',[],['firewood'],targetId);
 }
 if(itemId==='tinderbox'&&targetId==='hearth'){
  if(f.fireLit)return unchanged(state,'The fire is already burning.','fire',targetId);
  if(!f.firewoodPlaced)return unchanged(state,'A spark needs dry kindling.','firewood',targetId);
  if(!f.shelterBuilt)return unchanged(state,'A roof first. The wind would blow the flame out.','canvas',targetId);
  f.fireLit=true;return response(state,next,'The fire has caught.','fire_lit',[],[],targetId);
 }
 if(itemId==='loopPole'&&targetId==='cairn'){
  if(f.mastRaised)return unchanged(state,'The pole is already standing between the stones.','flagcloth',targetId);
  f.mastRaised=true;consume(next,'loopPole');return response(state,next,'The pole is secure. It needs bright canvas at the top.','mast_raised',[],['loopPole'],targetId);
 }
 if(itemId==='flagcloth'&&targetId==='cairn'){
  if(!f.mastRaised)return unchanged(state,'The canvas needs to fly higher, on a long pole.','loopPole',targetId);
  f.signalRaised=true;consume(next,'flagcloth');return response(state,next,'The signal is visible above the shore.','signal_raised',[],['flagcloth'],targetId);
 }
 if(target.kind==='person')return unchanged(state,`${target.name.split(' ')[0]} gestures toward the work still to do.`,'talk',targetId);
 const needs={sail:'loopPole',crate:'prybar',driftwood:'axe',shelter:'canvas',hearth:f.firewoodPlaced?'tinderbox':'firewood',cairn:f.mastRaised?'flagcloth':'loopPole'};
 return unchanged(state,'Try another item.',needs[targetId]||'wrong',targetId);
}
function hint(state){
 const f=state.flags;
 const result=(sceneId,targetId,cue,text,itemId=null)=>({sceneId,targetId,cue,text,itemId});
 if(state.completed)return result('camp','hearth','done','We are ready for the first night.');
 if(!f.canvasRecovered){
  if(f.mastRaised)return result('camp','cairn','take','Take the pole back out of the stone base.');
  if(!f.ropeTaken)return result('beach','rope','take','Look through the driftwood by the water.');
  if(!f.poleTaken)return result('beach','pole','take','There is a long pole on the shore.');
  if(!has(state,'loopPole'))return result('beach','pole','combine','Combine the rope with the pole.','rope');
  return result('beach','sail','loopPole','The loop can catch the sail out of reach.','loopPole');
 }
 if(!f.shelterBuilt)return result('camp','shelter','canvas','Cover the frame with the salvaged sail.','canvas');
 if(!f.prybarTaken)return result('wreck','prybar','take','There is a loose iron bar in the wreck.');
 if(!f.crateOpen)return result('wreck','crate','prybar','The bar will fit beneath the lid of the chest.','prybar');
 if(!f.woodCut)return result('beach','driftwood','axe','Split the log to reach the dry wood inside.','axe');
 if(!f.firewoodPlaced)return result('camp','hearth','firewood','Carry the dry kindling to the fire pit.','firewood');
 if(!f.fireLit)return result('camp','hearth','tinderbox','The flame will stay alight now.','tinderbox');
 if(!f.mastRaised)return result('camp','cairn','loopPole','The pole can also serve as a mast.','loopPole');
 return result('camp','cairn','flagcloth','Tie the bright strip of canvas to the top.','flagcloth');
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

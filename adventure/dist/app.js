(function(){'use strict';
const E=window.AdventureEngine,A=window.AdventureArt,M=window.CastawayMotion,S=window.CastawayStories,W=window.CastawayWorld||{},CAMPAIGN=Boolean(E.CHAPTERS),$=id=>document.getElementById(id),KEY=CAMPAIGN?'castaways-adventure-v4':'castaways-adventure-v3',PREF='castaways-adventure-prefs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=E.createGame(),selected=null,player={x:45,y:84},ticket=0,thoughtTimer,captionTimer,revealTimer,completionTimer,saving=true,finalShown=false,modalReturnFocus=null,completionPending=false;
let targetScene=null,worldMarkup=null,actorFocus=null,dialogue=null,dialogueTimer=null,playerFacing=1,walkDistance=0,lastLiveTime=null;
const actorHomes=new Map(),actorTracks=new Map(),actorPositions=new Map(),walkImages=new Map();
const voiceAvailable=Boolean(window.speechSynthesis&&window.SpeechSynthesisUtterance);
const targetMarkup=new Map(),companionMarkup=new Map();
let prefs={narration:false,captions:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
try{state=E.restore(JSON.parse(localStorage.getItem(KEY)))||state;}catch(_){}
if(CAMPAIGN&&!localStorageSafe(KEY)){try{state=E.restore(JSON.parse(localStorage.getItem('castaways-adventure-v3')))||state;}catch(_){}}
function localStorageSafe(key){try{return localStorage.getItem(key);}catch(_){return null;}}
const chapterNumber=()=>state.chapter||1,playerId=()=>CAMPAIGN&&chapterNumber()>=6?'musgrave':'player';
const currentScene=()=>E.SCENES.find(s=>s.id===state.scene);
const exitsFor=()=>E.getExits?E.getExits(state):currentScene().exits;
let chapterTimer,chapterBusy=false;
try{const p=JSON.parse(localStorage.getItem(PREF));if(p){prefs.narration=Boolean(p.narration);prefs.captions=Boolean(p.captions);prefs.reduced=prefs.reduced||Boolean(p.reduced);}}catch(_){}
const drawings={
 shelter:'<path d="m4 53 23-42 30 41M27 11l-3 42M5 52h52M27 11l21-4 12 34" fill="none" stroke-width="4"/>',
 signal:'<path d="M17 58V5M7 58h22M18 6q14-6 32 1l-8 11 7 10q-17-8-31-1" fill="none" stroke-width="3"/>',
 fireGlyph:'<path d="M32 6c2 13-8 15-6 25-5-2-6-6-6-10-8 8-11 15-9 23 2 9 10 14 21 14s19-6 21-15C55 32 48 23 40 16c1 8-2 12-5 14 1-10 0-17-3-24ZM32 54c-7 0-10-4-9-9 1-4 4-7 7-10 0 5 3 6 4 8 2-2 3-5 3-7 4 4 5 7 5 10 0 5-4 8-10 8Z" fill="none" stroke-width="3" stroke-linejoin="round"/>',
 eye:'<path d="M4 32q28-33 56 0-28 33-56 0Z" fill="none"/><circle cx="32" cy="32" r="10" fill="#6b4e34"/>',
 hand:'<path d="M18 54 9 35q-2-8 5-6l8 9V12q0-7 6-4v20-22q6-7 7 1v21-17q7-4 7 4v16-12q7-1 7 6v19l-7 15Z" fill="#c8ad7d"/>',
 wrong:'<path d="m17 17 30 30m0-30L17 47" fill="none" stroke-width="5"/>',
 done:'<path d="m12 31 13 14 28-31" fill="none" stroke-width="5"/>',
 talk:'<path d="M7 13h48v31H30L17 55V44H7Z" fill="none"/><circle cx="20" cy="28" r="2"/><circle cx="32" cy="28" r="2"/><circle cx="44" cy="28" r="2"/>'
};
function painted(a,cls=''){return `<svg class="painted ${cls}" viewBox="${a.box.join(' ')}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg class="atlas-clip" x="${a.box[0]}" y="${a.box[1]}" width="${a.box[2]}" height="${a.box[3]}" viewBox="${a.box.join(' ')}" overflow="hidden" style="width:${a.box[2]}px;height:${a.box[3]}px;overflow:hidden!important"><image href="${a.file}" width="${a.width}" height="${a.height}"/></svg></svg>`;}
const svg=(id,cls='')=>A.props[id]?painted(A.props[id],cls):A.states[id]?painted(A.states[id],cls):`<svg class="glyph ${cls}" viewBox="0 0 64 64" aria-hidden="true">${drawings[id]||drawings.eye}</svg>`;
const person=id=>`<span class="actor-shadow"></span><span class="actor-canvas" id="actor-${id}">${M.sprite(id,M.REST_FRAME)}</span><span class="conversation-mark" aria-hidden="true">···</span>`;
const walkReady=new Map();
function prepareWalk(id){
 if(walkReady.has(id))return walkReady.get(id);
 if(typeof window.Image!=='function'){walkImages.set(id,true);const ready=Promise.resolve(true);walkReady.set(id,ready);return ready;}
 walkImages.set(id,false);
 const ready=new Promise(resolve=>{const img=new window.Image();img.onload=async()=>{try{if(img.decode)await img.decode();}catch(_){}walkImages.set(id,true);resolve(true);};img.onerror=()=>resolve(false);img.src=M.WALKS[id].file;});
 walkReady.set(id,ready);return ready;
}
function actorPose(id,node,moving,frame,facing){
 if(!node)return;prepareWalk(id);M.update(node,id,frame??M.REST_FRAME);
 node.style.transform=`scaleX(${facing==='left'?-1:1})`;
 node.dataset.moving=String(Boolean(moving));
}
function actorGoal(id){
 if(chapterNumber()>1)return 0;
 if(state.completed&&(id==='raynal'||id==='musgrave'))return 0;
 const f=state.flags;
 return id==='raynal'&&f.canvasRecovered?-6:id==='musgrave'&&f.crateOpen?-7:id==='henry'?(f.fireLit?-10:f.shelterBuilt?-6:0):id==='george'&&f.shelterBuilt?-6:0;
}
const backgroundReady=new Map();
function backdropFor(next){return W.background?.(next)||W.scenes?.[next.scene]?.file||(next.scene==='camp'&&next.flags.shelterBuilt?'assets/states/camp-shelter.png':next.scene==='wreck'&&next.flags.crateOpen?'assets/states/wreck-open.png':`assets/${next.scene}.png`);}
function prepareBackground(next){
 const file=backdropFor(next);if(backgroundReady.has(file))return backgroundReady.get(file);
 if(typeof window.Image!=='function')return Promise.resolve(true);
 const ready=new Promise(resolve=>{const image=new window.Image();let ended=false;const finish=ok=>{if(ended)return;ended=true;clearTimeout(timeout);resolve(ok);};const timeout=setTimeout(()=>finish(false),12000);image.onload=async()=>{try{if(image.decode)await image.decode();}catch(_){}finish(true);};image.onerror=()=>finish(false);image.src=file;});backgroundReady.set(file,ready);return ready;
}
function effectiveReduced(){return prefs.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;}
function closeDialogue(){clearTimeout(dialogueTimer);dialogueTimer=null;dialogue=null;actorFocus=null;$('dialogue').hidden=true;if(voiceAvailable)window.speechSynthesis.cancel();}
function showDialogueLine(){if(!dialogue)return;clearTimeout(dialogueTimer);const text=dialogue.lines[dialogue.index];$('dialogue-speaker').textContent=dialogue.speaker;$('dialogue-text').textContent=text;$('dialogue-progress').textContent=`${dialogue.index+1} / ${dialogue.lines.length}`;$('dialogue-next').setAttribute('aria-label',dialogue.index+1===dialogue.lines.length?'Finish conversation':'Continue conversation');$('dialogue').dataset.speaker=dialogue.id;$('dialogue').hidden=false;dialogueTimer=setTimeout(advanceDialogue,Math.max(4300,Math.min(9000,text.split(/\s+/).length*360+1500)));if(prefs.narration&&voiceAvailable){window.speechSynthesis.cancel();const utterance=new window.SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=.94;const voices=window.speechSynthesis.getVoices(),voice=voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));if(voice)utterance.voice=voice;const current=dialogue,index=dialogue.index;utterance.onend=()=>{if(dialogue===current&&dialogue.index===index){clearTimeout(dialogueTimer);dialogueTimer=setTimeout(advanceDialogue,700);}};clearTimeout(dialogueTimer);dialogueTimer=setTimeout(advanceDialogue,Math.max(12000,text.split(/\s+/).length*600));try{window.speechSynthesis.speak(utterance);}catch(_){clearTimeout(dialogueTimer);dialogueTimer=setTimeout(advanceDialogue,6000);}}}
function advanceDialogue(){if(!dialogue)return;if(++dialogue.index>=dialogue.lines.length){closeDialogue();return;}showDialogueLine();}
function startDialogue(id,short=false){closeDialogue();const story=S.lines(id,state);dialogue={id,speaker:story.speaker,lines:short?[story.lines[0]]:story.lines,index:0};actorFocus=id==='player'?null:id;showDialogueLine();}
function liveFrame(now){
 const dt=lastLiveTime===null?0:Math.max(0,Math.min(100,now-lastLiveTime));lastLiveTime=now;
 const paused=Boolean(document.hidden||$('modal').open||!$('completion').hidden||dialogue),reduced=effectiveReduced();
 for(const [id,home]of actorHomes){
  const button=$('person-'+id),canvas=$('actor-'+id);if(!button||!canvas)continue;
  const bodyHeight=home.h*9/16;
  if(!actorTracks.has(id)){const track=M.createTrack(id,{bodyHeight});track.setGoal(actorGoal(id),{immediate:true});actorTracks.set(id,track);}
  const track=actorTracks.get(id);track.setGoal(actorGoal(id));
  const held=paused||!walkImages.get(id)||actorFocus===id||document.activeElement===button||Boolean(button.matches?.(':hover'));
  const pose=track.tick(dt,{paused:held,reduced,bodyHeight}),x=home.x+pose.x,y=home.y+pose.y;
  button.style.left=x+'%';button.style.top=(y-home.h/2)+'%';button.style.zIndex=String(Math.round(y));
  actorPositions.set(id,{x,y});actorPose(id,canvas,pose.moving,pose.frame,actorFocus===id?(player.x<x?'left':'right'):pose.facing);
  button.classList.toggle('speaking',dialogue?.id===id);
 }
 requestAnimationFrame(liveFrame);
}

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));saving=true;}catch(_){saving=false;} $('saved').style.color=saving?'#c4b08a':'#d6a177';$('saved').title=saving?'Saved in this browser':'Saving is unavailable';$('saved').setAttribute('aria-label',$('saved').title);$('saved').textContent=saving?'●':'!';}
function savePrefs(){document.body.classList.toggle('reduced',prefs.reduced);try{localStorage.setItem(PREF,JSON.stringify(prefs));}catch(_){}}
function label(text){$('action-label').textContent=text;}
function setSelected(id){closeDialogue();const focusedItem=document.activeElement?.dataset?.item;selected=id;renderInventory();if(focusedItem)$('inventory').querySelector(`[data-item="${focusedItem}"]`)?.focus();$('cancel-item').hidden=!id;label(id?E.ITEMS[id].name+' → …':E.SCENES.find(s=>s.id===state.scene).name);$('cursor-item').innerHTML=id?svg(id):'';$('cursor-item').style.display=id?'block':'none';}
function showCue(cue,text,items=[]){const aliases={take:items[0]||'hand',combine:items[0]||'loopPole',canvas_recovered:'canvas',crate_open:'axe',wood_cut:'firewood',shelter_built:'shelter',fuel_placed:'firewood',fire_lit:'fire',mast_raised:'signal',signal_raised:'signal',blocked:'wrong',look:'eye',travel:'done',beach:'eye'};const icon=aliases[cue]||cue;$('thought').innerHTML=items.length>1?items.map(id=>svg(id)).join('<span>+</span>'):svg(icon);$('thought').classList.add('show');clearTimeout(thoughtTimer);thoughtTimer=setTimeout(()=>$('thought').classList.remove('show'),2600);$('caption').textContent=text;$('caption').classList.toggle('show',prefs.captions);clearTimeout(captionTimer);captionTimer=setTimeout(()=>$('caption').classList.remove('show'),3500);}
function updatePlayer(){const node=$('player');node.style.left=player.x+'%';node.style.top=player.y+'%';node.style.zIndex=String(Math.round(player.y));node.style.setProperty('--scale',.8+(player.y-68)/70);}
async function walkTo(x,y){
 const bounds=W.scenes?.[state.scene]?.walk||[6,94,74,90];x=Math.max(bounds[0],Math.min(bounds[1],x));y=Math.max(bounds[2],Math.min(bounds[3],y));
 const mine=++ticket,start={...player},dx=x-player.x,dy=y-player.y;
 // Ground coordinates use a 16:9 stage; cadence follows actual distance in body heights.
 const distance=Math.hypot(dx,dy*9/16),scale=.8+(player.y-68)/70,bodyHeight=32*9/16*scale;
 if(Math.abs(dx)>.15)playerFacing=dx>=0?1:-1;
 const ready=await prepareWalk(playerId());if(mine!==ticket)return false;
 const duration=effectiveReduced()||!ready?0:M.travelDuration(distance/bodyHeight),startDistance=walkDistance;
 let elapsed=0,last=performance.now();$('player').classList.add('walking');
 return new Promise(resolve=>{function tick(now){
  if(mine!==ticket){resolve(false);return;}
  const dt=Math.max(0,Math.min(100,now-last));last=now;
  if(document.hidden){requestAnimationFrame(tick);return;}
  elapsed+=dt;const t=duration?Math.min(1,elapsed/duration):1,p=M.ease(t);
  player={x:start.x+dx*p,y:start.y+dy*p};walkDistance=startDistance+distance/bodyHeight*p;updatePlayer();
  actorPose(playerId(),$('player-sprite'),t<1&&!effectiveReduced(),t<1?M.frameIndex(walkDistance):M.REST_FRAME,playerFacing<0?'left':'right');
  if(t<1)requestAnimationFrame(tick);else{$('player').classList.remove('walking');resolve(true);}
 }requestAnimationFrame(tick);});
}
function cancelWalk(){ticket++;$('player').classList.remove('walking');actorPose(playerId(),$('player-sprite'),false,M.REST_FRAME,playerFacing<0?'left':'right');}
function flyItem(id,origin){if(prefs.reduced)return;const item=$('inventory').querySelector(`[data-item="${id}"]`);if(!item)return;const r=item.getBoundingClientRect(),s=$('scene').getBoundingClientRect(),x=s.left+s.width*(origin?.x||player.x)/100,y=s.top+s.height*(origin?.y||player.y)/100;const el=document.createElement('div');el.className='cursor-item flying';el.style.cssText=`display:block;left:${x}px;top:${y}px;width:44px;height:44px`;el.innerHTML=svg(id);document.body.appendChild(el);const animation=el.animate([{transform:'translate(-22px,-22px) scale(1.4)',opacity:1},{transform:`translate(${r.left-x+10}px,${r.top-y+10}px) scale(.75)`,opacity:.8}],{duration:650,easing:'ease-in-out'});animation.onfinish=()=>el.remove();}
function revealCompletion(){if(!state.completed)return;if($('modal').open){completionPending=true;return;}completionPending=false;closeDialogue();$('completion').hidden=false;$('keep-exploring').focus();}
function apply(response,origin){const wasDone=state.completed,wasChapterDone=state.chapterComplete,oldFlags={...state.flags};state=response.state;if(selected&&!state.inventory.includes(selected))selected=null;save();render();showCue(response.cue,response.text,response.gained);response.gained.forEach(id=>flyItem(id,origin));if(CAMPAIGN&&chapterNumber()>1&&!state.completed){if(!oldFlags.drillFailed&&state.flags.drillFailed)startDialogue('raynal',true);else if(!wasChapterDone&&state.chapterComplete)startDialogue('player',true);}if(!wasDone&&state.completed){finalShown=true;completionTimer=setTimeout(revealCompletion,prefs.reduced?0:1800);}}
async function activate(target,inspect=false){if(chapterBusy)return;closeDialogue();$('first-hint').hidden=true;const item=selected;if(target.kind==='person')actorFocus=target.id;const position=actorPositions.get(target.id),x=position?.x??target.x,y=position?.y??target.y;const approach=target.kind==='person'?(player.x<x?-9:9):-5;const arrived=await walkTo(Math.max(14,Math.min(87,x+approach)),Math.max(75,Math.min(86,target.kind==='person'?y+2:y+12)));if(!arrived){actorFocus=null;return;}$('player').classList.add('acting');setTimeout(()=>$('player').classList.remove('acting'),520);if(target.kind==='person'){if(item&&!inspect){showCue('talk','Perhaps a conversation would help.');actorFocus=null;return;}if(E.getTargets(state).some(t=>t.id===target.id))apply(E.interact(state,target.id,'talk'),target);startDialogue(target.id,inspect);return;}const r=inspect?E.interact(state,target.id,'look'):item?E.useItem(state,item,target.id):E.interact(state,target.id,'use');apply(r,target);if(r.changed&&['shelter_built','fire_lit'].includes(r.cue))startDialogue('player',true);}
async function exitScene(exit){
 if(chapterBusy)return;closeDialogue();$('first-hint').hidden=true;if(!await walkTo(exit.x<50?5:95,83))return;cancelWalk();const transition=ticket,response=E.travel(state,exit.to);if(!response.changed)return;
 chapterBusy=true;$('scene-loading').hidden=false;await prepareBackground(response.state);$('scene-loading').hidden=true;
 if(ticket!==transition){chapterBusy=false;return;}
 $('arrival').classList.add('cover');state=response.state;player={x:exit.x<50?84:16,y:84};const bounds=W.scenes?.[state.scene]?.walk;if(bounds)player.x=Math.max(bounds[0],Math.min(bounds[1],player.x));save();render();chapterBusy=false;setTimeout(()=>$('arrival').classList.remove('cover'),prefs.reduced?0:240);
}
function targetArt(t){if(t.kind==='person')return person(t.actor||t.id);if(t.art){const id=t.solvedFlag&&state.flags[t.solvedFlag]?(t.solvedArt||t.art):t.art;return svg(id);}if(t.id==='sail')return svg('canvas');if(t.id==='driftwood'&&state.flags.woodCut)return '';if(['rope','pole','prybar','cairn','driftwood'].includes(t.id))return svg(t.id);return '';}
function dimensions(t){if(t.w&&t.h)return[t.w,t.h];if(t.kind==='person')return[8.5,t.id==='henry'?25.5:27];return{rope:[6.5,9],pole:[18,22],prybar:[6,13],sail:[10,14],driftwood:[15,14],crate:[18,23],shelter:[35,43],hearth:[20,18],cairn:[7,11]}[t.id]||[8,12];}
function worldChanges(){const f=state.flags;let html='';

 if(state.scene==='camp'){
 if(f.firewoodPlaced&&!f.fireLit)html+=`<div class="change ground-prop" style="left:27%;top:67%;width:11%;height:10%">${svg('firewood')}</div>`;
 if(f.fireLit)html+=`<div class="fire-glow" style="left:6%;top:39%"></div><div class="change painted-fire" style="left:27%;top:54%;width:10%;height:29%">${painted(A.states.fire,'flame')}</div>`;
 if(f.mastRaised)html+=`<div class="change signal-mast" style="left:44.4%;top:32%;width:6.1%;height:34%">${painted(f.signalRaised?A.states.mastFlag:A.states.mast,f.signalRaised?'flag-cloth':'bare-mast')}</div>`;

 }
 if(W.decorations)html+=W.decorations(state,{painted,svg});
 if(worldMarkup!==html){$('world-changes').innerHTML=html;worldMarkup=html;}
 syncCompanions();
}
function syncCompanions(){
 const company=state.scene==='camp'&&chapterNumber()===1?[['george',84,79,28],...((state.completed||state.chapterComplete)?[['musgrave',57,74,25.5],['raynal',68,76,27]]:[])]:[];
 const container=$('companions'),present=new Set(company.map(([id])=>id));
 for(const id of companionMarkup.keys())if(!present.has(id)){container.querySelector(`[data-story-person="${id}"]`)?.remove();companionMarkup.delete(id);}
 for(const [id,x,y,h]of company){
  actorHomes.set(id,{x,y,h});prepareWalk(id);
  const markup=`<button id="person-${id}" class="change companion person" data-story-person="${id}" aria-label="Talk to ${S.lines(id,state).speaker}" title="Talk to ${S.lines(id,state).speaker}" style="left:${x}%;top:${y-h/2}%;width:8.5%;height:${h}%;--actor-delay:-${x/17}s;z-index:${y}">${person(id)}</button>`;
  if(companionMarkup.get(id)!==markup){container.querySelector(`[data-story-person="${id}"]`)?.remove();container.insertAdjacentHTML('beforeend',markup);companionMarkup.set(id,markup);}
  const b=container.querySelector(`[data-story-person="${id}"]`);
  b.onclick=e=>{e.stopPropagation();activate({id,name:S.lines(id,state).speaker,kind:'person',x,y});};
 }
}

function inspectKey(event,inspect){if(event.key==='ContextMenu'||(event.key==='F10'&&event.shiftKey)){event.preventDefault();event.stopPropagation();inspect();}}
function renderInventory(){const empty=Math.max(0,8-state.inventory.length);$('inventory').innerHTML=state.inventory.map(id=>`<button class="item ${id===selected?'selected':''}" data-item="${id}" aria-label="${esc(E.ITEMS[id].name)}" aria-pressed="${id===selected}" title="${esc(E.ITEMS[id].name)}">${svg(id)}</button>`).join('')+Array.from({length:empty},()=>'<div class="item empty" aria-hidden="true"></div>').join('');$('inventory').querySelectorAll('[data-item]').forEach(b=>{const id=b.dataset.item;b.onclick=()=>{cancelWalk();if(selected&&selected!==id){const response=E.combine(state,selected,id);if(response.changed){selected=null;apply(response);}else{showCue('wrong',response.text);setSelected(id);}}else setSelected(selected===id?null:id);};b.onmouseenter=()=>label(selected&&selected!==id?`${E.ITEMS[selected].name} + ${E.ITEMS[id].name}`:E.ITEMS[id].name);b.onmouseleave=()=>label(selected?E.ITEMS[selected].name+' → …':E.SCENES.find(s=>s.id===state.scene).name);b.onfocus=b.onmouseenter;b.onblur=b.onmouseleave;b.onkeydown=e=>inspectKey(e,()=>showCue(id,E.ITEMS[id].description));b.oncontextmenu=e=>{e.preventDefault();showCue(id,E.ITEMS[id].description);};});}
function render(){const scene=currentScene(),world=W.scenes?.[state.scene];$('scene').dataset.scene=state.scene;$('scene').dataset.chapter=String(chapterNumber());$('scene').dataset.indoor=String(Boolean(world?.indoor));$('scene').dataset.shelter=String(state.flags.shelterBuilt);$('scene').dataset.crate=String(state.flags.crateOpen);$('scene').classList.toggle('warm',(state.scene==='camp'&&state.flags.fireLit)||Boolean(state.flags.furnaceLit&&state.scene==='forge'));$('scene').setAttribute('aria-label',scene.name);$('scene-label').textContent=scene.name;
 const background=W.background?.(state)||world?.file;if(background)$('backdrop').style.backgroundImage=`url('${background}')`;else $('backdrop').style.backgroundImage='';
 const goals=CAMPAIGN?E.getChapter(state).goals:[{icon:'shelter',flag:'shelterBuilt',label:'Shelter'},{icon:'fire',flag:'fireLit',label:'Fire'},{icon:'signal',flag:'signalRaised',label:'Signal'}];
 $('goals').setAttribute('aria-label','Chapter goals');$('goals').innerHTML=goals.map(g=>`<span class="goal ${state.flags[g.flag]?'done':''}" title="${esc(g.label)}" aria-label="${esc(g.label)}: ${state.flags[g.flag]?'done':'still needed'}">${svg(g.icon==='fire'?'fireGlyph':g.icon)}</span>`).join('');renderChapterUI();
 actorHomes.clear();const targets=E.getTargets(state).map(t=>W.stageTarget?W.stageTarget(t,state):t).filter(t=>CAMPAIGN||!state.completed||state.scene==='camp'||t.kind!=='person'),container=$('targets');
 if(targetScene!==state.scene){container.innerHTML='';targetMarkup.clear();actorTracks.clear();actorPositions.clear();targetScene=state.scene;}
 const present=new Set(targets.map(t=>t.id));
 for(const id of targetMarkup.keys())if(!present.has(id)){container.querySelector(`[data-target="${id}"]`)?.remove();targetMarkup.delete(id);}
 targets.forEach(t=>{const [w,h]=dimensions(t);if(t.kind==='person'){actorHomes.set(t.id,{x:t.x,y:t.groundY??(t.id==='henry'?76:75),h});prepareWalk(t.id);}const y=t.kind==='person'?(t.groundY??(t.id==='henry'?76:75))-h/2:t.y;const markup=`<button ${t.kind==='person'?`id="person-${t.id}"`: ''} class="target ${t.kind==='item'?'pickup':t.kind} ${t.solvedFlag&&state.flags[t.solvedFlag]?'fulfilled':''}" style="left:${t.x}%;top:${y}%;--w:${w}%;--h:${h}%;--actor-delay:-${t.x/17}s;z-index:${t.kind==='person'?(t.groundY??(t.id==='henry'?76:75)):10}" data-target="${t.id}" aria-label="${esc(t.name)}" title="${esc(t.name)}">${targetArt(t)}</button>`;
  if(targetMarkup.get(t.id)!==markup){container.querySelector(`[data-target="${t.id}"]`)?.remove();container.insertAdjacentHTML('beforeend',markup);targetMarkup.set(t.id,markup);}
  const b=container.querySelector(`[data-target="${t.id}"]`);b.onclick=e=>{e.stopPropagation();activate(t);};b.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();activate(t,true);};b.onkeydown=e=>inspectKey(e,()=>activate(t,true));b.onmouseenter=()=>label(selected?`${E.ITEMS[selected].name} → ${t.name}`:t.name);b.onmouseleave=()=>label(selected?E.ITEMS[selected].name+' → …':scene.name);b.onfocus=b.onmouseenter;b.onblur=b.onmouseleave;
 });
 $('exits').innerHTML=exitsFor().map(e=>`<button class="exit" style="left:${e.x}%;top:${e.y}%" data-exit="${e.id}" title="${e.name}" aria-label="${e.name}">${e.x<50?'‹':'›'}</button>`).join('');$('exits').querySelectorAll('[data-exit]').forEach(b=>{const exit=exitsFor().find(x=>x.id===b.dataset.exit);b.onclick=e=>{e.stopPropagation();exitScene(exit);};b.onfocus=b.onmouseenter=()=>label(exit.name);b.onblur=b.onmouseleave=()=>label(selected?E.ITEMS[selected].name+' → …':scene.name);});
 worldChanges();renderInventory();updatePlayer();actorPose(playerId(),$('player-sprite'),false,M.REST_FRAME,playerFacing<0?'left':'right');$('cancel-item').hidden=!selected;$('cursor-item').innerHTML=selected?svg(selected):'';$('cursor-item').style.display=selected?'block':'none';label(selected?E.ITEMS[selected].name+' → …':scene.name);
}
function modal(title,html){closeDialogue();cancelWalk();const dialog=$('modal');if(!dialog.open)modalReturnFocus=document.activeElement;$('modal-title').textContent=title;$('modal-body').innerHTML=html;if(!dialog.open)dialog.showModal();}
function help(){modal('How to play',`<div class="pictogram-help"><div><strong>${svg('hand')}<span>→</span></strong><p>Click the scenery.<br>Your character walks there.</p></div><div><strong>${svg('hand')}<span>↓</span>${svg('rope')}</strong><p>Click an object.<br>Pick it up or examine it.</p></div><div><strong>${svg('rope')}<span>+</span>${svg('pole')}</strong><p>Select an item in your satchel,<br>then another item.</p></div><div><strong>${svg('axe')}<span>→</span>${svg('driftwood')}</strong><p>Select an item,<br>then something in the scene.</p></div></div><p class="small">Right-click, Shift+F10 or the context menu key examines the focused object or place. Esc clears your selection. Space briefly reveals interactive objects. You can also use Tab and Enter. Turn on brief reaction captions in Settings.</p>`);}
function hint(){
 const h=E.hint(state),scene=E.SCENES.find(s=>s.id===h.sceneId)||currentScene(),target=scene.targets.find(t=>t.id===h.targetId);
 if(CAMPAIGN&&state.chapterComplete&&!state.completed){modal('The way ahead',`<div class="hint-icons">${svg('done')}<span>→</span></div><p class="small">${esc(E.getChapter(state).exitLabel)}. Use the passage at the right of the scene.</p>`);return;}
 const targetIcon=target?.art||{roof:'weatherPatch',kettle:'kettle',stove:'fire',spring:'filledFlask',furnace:'fire',anvil:'ironScrap',testBlock:'planks',boatFrame:'planks',seams:'caulking',boatMast:'sailcloth',rigging:'stormLine',bilge:'bailer',tornSail:'canvasPatch',horizon:'compass',rescueCutter:'spareSail',chartTable:'markedChart',rescueBoat:'rescueLine',signalPost:'lantern',campTable:'rescueProvisions',sail:'canvas',shelter:'shelter',hearth:'fire',crate:'crate',driftwood:'driftwood',cairn:state.flags.mastRaised?'signal':'cairn'}[h.targetId]||h.targetId;
 const parts=h.combineItems||['rope','pole'];
 modal('A little hint',h.cue==='combine'?`<div class="hint-icons">${parts.map(id=>svg(id)).join('<span>+</span>')}</div>`:`<div class="hint-icons">${svg(h.itemId||(h.cue==='take'?'hand':h.cue))}<span>→</span>${svg(targetIcon)}</div><p style="text-align:center">${esc(scene.name)}</p>`);$('modal-body').insertAdjacentHTML('beforeend',`<p class="${prefs.captions||CAMPAIGN?'small':'sr-only'}">${esc(h.text)}</p>`);
}
function settings(){modal('Settings',`<div class="setting"><span id="captions-label">Brief reaction captions</span><button id="toggle-captions" aria-labelledby="captions-label" aria-pressed="${prefs.captions}">${prefs.captions?'On':'Off'}</button></div><div class="setting"><span id="motion-label">Reduce motion</span><button id="toggle-motion" aria-labelledby="motion-label" aria-pressed="${prefs.reduced}">${prefs.reduced?'Reduced':'On'}</button></div>${voiceAvailable?`<div class="setting"><span id="narration-label">Narration · device voice</span><button id="toggle-narration" aria-labelledby="narration-label" aria-pressed="${prefs.narration}">${prefs.narration?'On':'Off'}</button></div>`:''}<div class="setting"><span>Return to the shore</span><button id="restart">New game</button></div><p class="small">An original adventure inspired by the Grafton castaways. Puzzles and dialogue are fictional; the historical rescue is documented in the project sources. Artwork was generated with AI.</p><p class="small"><a href="https://github.com/OnFiala/auckland-castaways/tree/main/adventure" target="_blank" rel="noopener noreferrer">Sources and project files ↗</a></p>`);$('toggle-captions').onclick=()=>{prefs.captions=!prefs.captions;savePrefs();settings();$('toggle-captions').focus();};$('toggle-motion').onclick=()=>{prefs.reduced=!prefs.reduced;savePrefs();settings();$('toggle-motion').focus();};if($('toggle-narration'))$('toggle-narration').onclick=()=>{prefs.narration=!prefs.narration;savePrefs();settings();$('toggle-narration').focus();};$('restart').onclick=restart;}
function restart(){modal('Return to the shore?',`<p class="small">This will replace your current progress.</p><button class="dialog-button" id="confirm-restart">Start again</button>`);$('confirm-restart').onclick=()=>{cancelWalk();clearTimeout(completionTimer);clearTimeout(chapterTimer);chapterBusy=false;$('chapter-banner').hidden=true;completionPending=false;closeDialogue();actorTracks.clear();actorPositions.clear();state=E.createGame();selected=null;player={x:45,y:84};finalShown=false;$('completion').hidden=true;modalReturnFocus=null;$('modal').close();save();render();$('scene').focus();};}
function reveal(){document.body.classList.add('show-targets');clearTimeout(revealTimer);revealTimer=setTimeout(()=>document.body.classList.remove('show-targets'),2400);}
function renderChapterUI(){
 $('journey').hidden=!CAMPAIGN;$('chapter-exit').hidden=!CAMPAIGN||!state.chapterComplete||state.completed;
 if(!CAMPAIGN)return;
 const chapter=E.getChapter(state);$('chapter-label').textContent=`${chapterNumber()} / 7 · ${chapter.title}`;
 $('chapter-exit-label').textContent=chapter.exitLabel;$('chapter-exit').setAttribute('aria-label',chapter.exitLabel);
 $('player').dataset.identity=playerId();$('perspective-label').textContent=chapterNumber()>=6?'Captain Musgrave':'Alick McLaren';
 if(state.completed){const end=window.CastawayVoyageStory?.ENDING;$('completion-title').textContent=end?.title||'The promise kept.';$('completion-copy').textContent=end?.line||'Henry and George are aboard. The return is complete.';$('completion-note').textContent='The end · Auckland Islands, 1864–1865';$('keep-exploring').textContent='Return to the shore';
 $('ending-portraits').innerHTML=['musgrave','raynal','player','henry','george'].map(id=>`<figure><img src="${id==='player'?'assets/sailor.png':A.people[id].file}" alt="${esc(({musgrave:'Thomas Musgrave',raynal:'François Raynal',player:'Alick McLaren',henry:'Henry Forgés',george:'George Harris'})[id])}"><figcaption>${({musgrave:'Musgrave',raynal:'Raynal',player:'Alick',henry:'Henry',george:'George'})[id]}</figcaption></figure>`).join('');}
}
function showChapterBanner(){
 if(!CAMPAIGN)return;clearTimeout(chapterTimer);const c=E.getChapter(state),beat=window.CastawayVoyageStory?.CHAPTER_BEATS?.find(x=>x.chapter===chapterNumber());
 $('chapter-banner-title').textContent=c.title;$('chapter-banner-caption').textContent=beat?.caption||c.subtitle||'';$('chapter-banner-role').textContent=chapterNumber()>=6?'Playing as Captain Musgrave':'Playing as Alick McLaren';$('chapter-banner').hidden=false;chapterTimer=setTimeout(()=>$('chapter-banner').hidden=true,effectiveReduced()?2500:6500);
}
async function advanceChapter(){
 if(!CAMPAIGN||chapterBusy||!state.chapterComplete||state.completed)return;chapterBusy=true;closeDialogue();selected=null;clearTimeout(completionTimer);
 if(!await walkTo(94,84)){chapterBusy=false;return;}cancelWalk();const response=E.advance(state);if(!response.changed){chapterBusy=false;return;}
 const transition=ticket;$('scene-loading').hidden=false;await prepareBackground(response.state);$('scene-loading').hidden=true;if(ticket!==transition){chapterBusy=false;return;}
 $('arrival').classList.add('cover');state=response.state;player={x:22,y:84};actorTracks.clear();actorPositions.clear();walkDistance=0;save();render();prepareWalk(playerId());showChapterBanner();chapterBusy=false;setTimeout(()=>$('arrival').classList.remove('cover'),effectiveReduced()?0:400);$('scene').focus();
}
function journey(){
 if(!CAMPAIGN)return;const chapters=Array.isArray(E.CHAPTERS)?E.CHAPTERS:Object.values(E.CHAPTERS);
 modal('Our journey',`<ol class="journey-map">${chapters.map(c=>`<li class="${c.id<chapterNumber()?'past':c.id===chapterNumber()?'current':'ahead'}"><span>${c.id<chapterNumber()?'✓':c.id}</span><div><strong>${esc(c.title)}</strong><small>${esc(c.subtitle||'')}</small></div></li>`).join('')}</ol><p class="small">Progress saves automatically. Complete the work in each place to open the next passage.</p><p class="small">Chapters I–V: Alick McLaren. Chapters VI–VII: Captain Musgrave.</p>`);
}
$('chapter-exit').onclick=e=>{e.stopPropagation();advanceChapter();};$('journey').onclick=journey;$('chapter-banner-close').onclick=()=>$('chapter-banner').hidden=true;
$('credits').onclick=()=>{const end=window.CastawayVoyageStory?.ENDING;modal('The people behind the story',`<p class="small">An original adaptation of the Grafton castaways’ accounts. The playable puzzles, dialogue and portraits are interpretations.</p>${(end?.facts||[]).map(f=>`<p class="small">${esc(f.text)}</p>`).join('')}<p class="small"><a href="https://github.com/OnFiala/auckland-castaways/tree/main/research" target="_blank" rel="noopener noreferrer">Historical sources and adaptation notes ↗</a></p>`);};
$('scene').onclick=e=>{if(chapterBusy)return;if(e.target.closest('button')||e.target.closest('.dialogue'))return;closeDialogue();$('first-hint').hidden=true;const r=$('scene').getBoundingClientRect();walkTo(Math.max(6,Math.min(94,(e.clientX-r.left)/r.width*100)),Math.max(74,Math.min(90,(e.clientY-r.top)/r.height*100)));};
$('scene').oncontextmenu=e=>e.preventDefault();$('hint').onclick=hint;$('reveal').onclick=reveal;$('settings').onclick=settings;$('help').onclick=help;$('cancel-item').onclick=()=>{cancelWalk();setSelected(null);};$('modal-close').onclick=()=>$('modal').close();$('modal').addEventListener('close',()=>{if(modalReturnFocus?.isConnected)modalReturnFocus.focus();modalReturnFocus=null;if(completionPending)revealCompletion();});$('dismiss-hint').onclick=()=>$('first-hint').hidden=true;$('keep-exploring').onclick=()=>{$('completion').hidden=true;if(!CAMPAIGN)startDialogue('george',true);$('scene').focus();};$('new-game').onclick=restart;
window.addEventListener('pointermove',e=>{if(!selected)return;$('cursor-item').style.left=e.clientX+14+'px';$('cursor-item').style.top=e.clientY+12+'px';});window.addEventListener('keydown',e=>{if($('modal').open)return;if(e.key==='Escape'){if(dialogue){closeDialogue();return;}cancelWalk();setSelected(null);}if(e.code==='Space'&&!$('modal').open&&!e.target.closest('button')){e.preventDefault();reveal();}});
$('rain').innerHTML=Array.from({length:28},(_,i)=>`<i style="--x:${i*37%110}%;--speed:${.8+i%5*.12}s;--delay:-${i*.17}s"></i>`).join('');
$('dialogue-next').onclick=e=>{e.stopPropagation();advanceDialogue();};$('dialogue-close').onclick=e=>{e.stopPropagation();closeDialogue();};document.addEventListener?.('visibilitychange',()=>{lastLiveTime=null;document.body.classList.toggle('inactive',document.hidden);if(document.hidden){closeDialogue();cancelWalk();}});
prepareWalk(playerId());savePrefs();save();render();prepareBackground(state);requestAnimationFrame(liveFrame);if(state.actions>0)$('first-hint').hidden=true;if(CAMPAIGN&&state.completed)revealCompletion();else if(CAMPAIGN)showChapterBanner();
})();

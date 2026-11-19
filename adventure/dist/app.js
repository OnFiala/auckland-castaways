(function(){'use strict';
const E=window.AdventureEngine,A=window.AdventureArt,M=window.CastawayMotion,S=window.CastawayStories,W=window.CastawayWorld||{},CAMPAIGN=Boolean(E.CHAPTERS),$=id=>document.getElementById(id),KEY=CAMPAIGN?'castaways-adventure-v4':'castaways-adventure-v3',PREF='castaways-adventure-prefs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=E.createGame(),selected=null,player={x:45,y:84},ticket=0,thoughtTimer,captionTimer,revealTimer,completionTimer,saving=true,finalShown=false,modalReturnFocus=null,completionPending=false;
let targetScene=null,worldMarkup=null,actorFocus=null,dialogue=null,dialogueTimer=null,playerFacing=1,walkDistance=0,lastLiveTime=null;
const Stage=window.CastawayStage, Life=window.CastawayLife, Work=window.CastawayWorkPoses, Ground=window.CastawayGround, Choreo=window.CastawayChoreography, Bench=window.CastawayBench, Observations=window.CastawayObservations;
const Weather=window.CastawayWeather;
const Film=CAMPAIGN ? window.CastawayFilm : null;
let endingFilmDue=false;
const staged=Boolean(CAMPAIGN&&Stage&&Ground&&Choreo);
const lighting = staged ? window.CastawayPaintingLight?.create($('scene'), $('material-lighting'), updateLightingStatus) : null;
let examining=false, playerWork='stand', hintKey='', hintLevel=0;
const actorHomes=new Map(),actorTracks=new Map(),actorPositions=new Map(),walkImages=new Map();
const voiceAvailable=Boolean(window.speechSynthesis&&window.SpeechSynthesisUtterance);
const targetMarkup=new Map(),companionMarkup=new Map(),displayStates=new WeakMap();
let prefs={narration:false,captions:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,lighting:'auto'};
try{state=E.restore(JSON.parse(localStorage.getItem(KEY)))||state;}catch(_){}
if(CAMPAIGN&&!localStorageSafe(KEY)){try{state=E.restore(JSON.parse(localStorage.getItem('castaways-adventure-v3')))||state;}catch(_){}}
function localStorageSafe(key){try{return localStorage.getItem(key);}catch(_){return null;}}
const chapterNumber=()=>state.chapter||1,playerId=()=>CAMPAIGN&&chapterNumber()>=6?'musgrave':'player';
const currentScene=()=>E.SCENES.find(s=>s.id===state.scene);
const exitsFor=()=>E.getExits?E.getExits(state):currentScene().exits;
let chapterBusy=false;
// A film sits between two playable moments. The separate bookmark also lets
// earlier saves keep their chapter, inventory and puzzle progress intact.
const STORY_KEY='castaways-story-v1';
const hasGameSave=Boolean(localStorageSafe(KEY)||localStorageSafe('castaways-adventure-v3'));
let story={openingSeen:false,pending:null},activeReel=null;
if(Film){
 try{
  const stored=JSON.parse(localStorageSafe(STORY_KEY));
  if(stored&&(hasGameSave||(!stored.openingSeen&&stored.pending?.reel==='prologue'))){
   story={openingSeen:stored.openingSeen===true,pending:stored.pending||null};
  }
 }catch(_){}
}
function saveStory(){
 try{localStorage.setItem(STORY_KEY,JSON.stringify(story));}catch(_){}
}
function bookmark(reel,position=0){
 return {reel,position,chapter:chapterNumber(),scene:state.scene,actions:state.actions};
}
function entryFilm(){
 if(!Film)return null;
 const pending=story.pending;
 const expected=state.completed?'epilogue':Film.timeline[chapterNumber()-1]?.id;
 if(pending?.reel===expected&&pending.chapter===chapterNumber()&&pending.scene===state.scene&&pending.actions===state.actions){
  return pending;
 }
 if(!story.openingSeen&&chapterNumber()===1&&state.actions===0&&state.scene==='beach')return bookmark('prologue');
 return null;
}
function retainFilmPosition(){
 if(activeReel&&story.pending?.reel===activeReel){
  story.pending.position=Film.position();
  saveStory();
 }
}
function chapterFilm(id,after,startAt=0){
 if(!Film||!id){after();return;}
 function enterScene(){
  activeReel=null;
  if(id==='prologue')story.openingSeen=true;
  story.pending=null;saveStory();
  after();
 }
 if(Film.chapterMode()!=='skip'){
  activeReel=id;story.pending=bookmark(id,startAt);saveStory();
  if(Film.open([id],{auto:true,startAt,reduced:effectiveReduced(),focus:$('scene'),after:enterScene}))return;
 }
 enterScene();
}
function chapterArrival(){
 const beat=S.chapterArrival?.(state);
 if(beat)startDialogue(beat.id,true,beat.text);
}
try{const p=JSON.parse(localStorage.getItem(PREF));if(p){prefs.narration=Boolean(p.narration);prefs.captions=Boolean(p.captions);prefs.reduced=prefs.reduced||Boolean(p.reduced);prefs.lighting=window.CastawayPaintingLight?.preference(p.lighting)||'auto';}}catch(_){}
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
function person(id) {
 const ashore=staged && id==='raynal' && chapterNumber()===1 && state.scene==='beach';
 const seat=ashore?'<span class="shore-rest" aria-hidden="true"><img src="assets/shore-rest/raynal.webp" alt="" draggable="false"></span>':'';
 return `<span class="actor-shadow"></span>${seat}<span class="actor-canvas" id="actor-${id}">${M.sprite(id,M.REST_FRAME)}</span>`;
}
const walkReady=new Map();
function prepareWalk(id,retry=false){
 if(staged)Work?.prepare(id,retry);
 const previous=walkReady.get(id);
 if(previous && (!previous.failed || (!retry&&performance.now()<previous.retryAt)))return previous.ready;
 if(typeof window.Image!=='function'){
  walkImages.set(id,true);
  const ready=Promise.resolve(true);walkReady.set(id,{ready,url:M.WALKS[id].file});return ready;
 }
 const attempt=(previous?.attempt||0)+1;
 const url=M.WALKS[id].file+(attempt>1?'?retry='+attempt:'');
 const image=new window.Image();
 const entry={image,url,attempt,failed:false};
 walkReady.set(id,entry);
 walkImages.set(id,false);
 entry.ready=new Promise(resolve=>{
  let finished=false;
  function finish(ok){
   if(finished)return;
   finished=true;clearTimeout(deadline);image.onload=image.onerror=null;
   entry.failed=!ok;entry.retryAt=performance.now()+2000;
   walkImages.set(id,ok);resolve(ok);
  }
  const deadline=setTimeout(()=>finish(false),4000);
  image.onload=async()=>{
   try{await image.decode?.();}catch(_){finish(false);return;}
   finish(image.naturalWidth!==0 && image.naturalHeight!==0);
  };
  image.onerror=()=>finish(false);
  image.src=url;
 });
 return entry.ready;
}
function actorPose(id,node,moving,frame,facing,pose='stand') {
 if(!node)return;
 const ready=walkImages.get(id),url=ready?walkReady.get(id)?.url:null;
 const showStep=ready&&(moving||pose==='walk');
 const shownFrame=showStep?(frame??M.REST_FRAME):M.REST_FRAME;
 const signature=[id,shownFrame,showStep,facing,pose,url,Work?.available?.(id)].join('/');
 if(displayStates.get(node)===signature)return;
 displayStates.set(node,signature);
 prepareWalk(id);
 M.update(node,id,shownFrame);
 // A failed SVG image fetch can outlive the preload that recovered. Bind the
 // successfully loaded retry URL before exposing the walking layer again.
 if(url && url!==M.WALKS[id].file){
  const painting=node.querySelector('.walk-viewport')?.querySelector('image');
  if(painting && painting.getAttribute('href')!==url)painting.setAttribute('href',url);
 }
 node.style.transform='scaleX('+(facing==='left'?-1:1)+')';
 node.dataset.moving=String(Boolean(showStep&&moving));
 if(staged&&Work){
  if(showStep)Work.hide(node);else Work.show(node,id,pose==='walk'?'stand':pose,facing);
 }
}
const profile=()=>Stage.profile(state.scene);
const heightAt=y=>Stage.heightAt(state.scene,y);
const actorWidth=h=>Math.max(6.5,Math.min(10.8,h*.213));
function entryPoint(side='default',from=null){
 const room=profile();return {...(room.from?.[from]||room.entry[side]||room.entry.default)};
}
function playerPose(pose='stand'){
 playerWork=pose;if(pose==='stand')$('held-tool').hidden=true;actorPose(playerId(),$('player-sprite'),false,M.REST_FRAME,playerFacing<0?'left':'right',pose);
}
function stationFor(id,fallback){
 return staged?Stage.station(state.scene,id,state)||fallback:fallback;
}
function actorStep(id,home,dt,paused,reduced,speaker){
 const station=Stage.workStation(state.scene,id,state)||home;
 let crew=actorTracks.get(id);
 if(!crew){
  crew=Choreo.crewMember(station,profile().walkPolygon,heightAt);
  actorTracks.set(id,crew);
 }
 return crew.tick(station,dt,{paused,reduced,player,speaker,addressed:actorFocus===id});
}
function actorGoal(id){
 if(chapterNumber()>1)return 0;
 if(state.completed&&(id==='raynal'||id==='musgrave'))return 0;
 const f=state.flags;
 return id==='raynal'&&f.canvasRecovered?-6:id==='musgrave'&&f.crateOpen?-7:id==='henry'?(f.fireLit?-10:f.shelterBuilt?-6:0):id==='george'&&f.shelterBuilt?-6:0;
}
let visiblePlate='', pendingPainting=null;
function backdropFor(next) {
 const registered = W.background?.(next);
 if (registered) return registered;
 // The stand-alone first-night edition can also run without the voyage script.
 let name = next.scene;
 if (name === 'camp' && next.flags.shelterBuilt) name = 'camp-shelter';
 if (name === 'wreck' && next.flags.crateOpen) name = 'wreck-open';
 return `assets/tidepaint/${name}.webp`;
}
// The same decoded element that signalled success becomes the visible backdrop.
function mountPainting(file, image) {
 const surface = $('backdrop');
 if (image) {
  image.alt = '';
  image.draggable = false;
  surface.replaceChildren(image);
  surface.style.backgroundImage = 'none';
 } else {
  surface.style.backgroundImage = `url('${file}')`;
 }
 surface.dataset.painting = file;
 visiblePlate = file;
}

// A pending transition owns its image and continuation. Retry may supersede
// the request while decode() is still running. Late completions cannot commit.
function paintThen(next, commit) {
 if (pendingPainting) return false;
 const file = backdropFor(next);
 if (file === visiblePlate || typeof window.Image !== 'function') {
  if (file !== visiblePlate) mountPainting(file, null);
  chapterBusy = false;
  commit();
  return true;
 }
 const panel = $('scene-loading'), retry = $('scene-retry'), stay = $('scene-stay');
 const status = $('scene-load-message');
 const previousFocus = document.activeElement;
 const name = E.SCENES.find(scene => scene.id === next.scene).name;
 const pending = {image: null, timer: null, attempts: 0};
 pendingPainting = pending;
 chapterBusy = true;
 return new Promise(resolve => {
  // Block input immediately, but leave a cached room change visually uninterrupted.
  panel.dataset.phase = 'quiet';
  const revealTimer = setTimeout(() => {
   if (pendingPainting === pending && panel.dataset.phase === 'quiet') panel.dataset.phase = 'loading';
  }, 200);
  retry.hidden = true;
  function clearRequest() {
   clearTimeout(pending.timer);
   if (pending.image) {
    pending.image.onload = pending.image.onerror = null;
    pending.image.removeAttribute?.('src');
    pending.image = null;
   }
  }
  function finish(image) {
   if (pendingPainting !== pending) return;
   // Keep the accepted element's src intact when releasing request ownership.
   if (image) { image.onload = image.onerror = null; pending.image = null; }
   clearTimeout(revealTimer);
   clearRequest();
   pendingPainting = null;
   chapterBusy = false;
   const loadingHadFocus = panel.contains(document.activeElement);
   panel.close();
   if (loadingHadFocus && document.activeElement === document.body &&
       previousFocus !== document.body && previousFocus?.isConnected && !previousFocus.hidden) {
    previousFocus.focus({preventScroll:true});
   }
   if (image) {
    mountPainting(file, image);
    commit();
   }
   resolve(Boolean(image));
  }
  function request() {
   clearRequest();
   const image = new window.Image();
   image.fetchPriority = 'high';
   pending.image = image;
   const current = () => pendingPainting === pending && pending.image === image;
   const showRetry = message => {
    if (!current()) return;
    clearTimeout(revealTimer);
    panel.dataset.phase = 'retry';
    status.textContent = message;
    retry.hidden = false;
    retry.disabled = false;
    if (document.activeElement === status) retry.focus();
   };
   if (!retry.hidden) panel.dataset.phase = 'loading';
   retry.disabled = true;
   status.textContent = `Loading ${name}…`;
   status.focus();
   pending.timer = setTimeout(() => {
    // A slow connection can still finish without the player starting over.
    showRetry(`${name} is taking longer to load. You can wait or try again.`);
   }, 20000);
   image.onerror = () => {
    if (!current()) return;
    showRetry(`The painting for ${name} couldn’t load. Check your connection and try again.`);
    clearRequest();
   };
   image.onload = async () => {
    if (!current()) return;
    try { if (image.decode) await image.decode(); }
    catch (_) { if (current()) image.onerror(); return; }
    if (current()) finish(image);
   };
   pending.attempts++;
   const separator = file.includes('?') ? '&' : '?';
   image.src = pending.attempts === 1 ? file : `${file}${separator}scene_retry=${Date.now()}-${pending.attempts}`;
  }
  retry.onclick = () => { if (pendingPainting === pending && !retry.hidden && !retry.disabled) request(); };
  stay.hidden = !visiblePlate;
  stay.onclick = () => { if (!stay.hidden) finish(null); };
  panel.oncancel = event => { event.preventDefault(); if (!stay.hidden) finish(null); };
  panel.showModal();
  request();
 });
}
// Each change of chapter departs from a painted place. A player exploring another
// room first takes the ordinary door home and retains control at the destination.
const passages={1:['camp',58,76],2:['cabin',92,75],3:['forge',7,65],4:['slipway',62,69.2],5:['crossing',25,77.7],6:['harbour',41.3,73.6]};
function departure(){
 const gate=passages[chapterNumber()];if(!staged||!gate)return null;
 const [destination,x,y]=gate;if(state.scene===destination)return {x,y};
 const queue=[{room:state.scene,first:null}],seen=new Set([state.scene]);
 for(const place of queue){for(const exit of E.getExits({...state,scene:place.room})){
  if(seen.has(exit.to))continue;seen.add(exit.to);const first=place.first||exit;
  if(exit.to===destination)return {exit:Stage.stageExit(state.scene,first),name:first.name};
  queue.push({room:exit.to,first});
 }}
 return null;
}
function effectiveReduced(){return prefs.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;}
function closeDialogue(finished=false){
 const previous=dialogue;
 clearTimeout(dialogueTimer);dialogueTimer=null;dialogue=null;actorFocus=null;
 $('dialogue').hidden=true;
 delete $('command-dock').dataset.mode;
 $('inventory-bar').inert=false;
 if(previous&&voiceAvailable)window.speechSynthesis.cancel();
 if(previous && $('dialogue').contains(document.activeElement)){
  const target=previous.partner && $('person-'+previous.partner);
  (target||$('scene')).focus({preventScroll:true});
 }
 if(finished && previous?.after)previous.after();
}
function scheduleDialogue(){
 const talk=dialogue, index=talk.index, line=talk.turns[index].text;
 const delivery=++talk.delivery;
 const current=()=>dialogue===talk && talk.index===index && delivery===talk.delivery && !talk.paused;
 const later=delay=>{clearTimeout(dialogueTimer);dialogueTimer=setTimeout(()=>{if(current())advanceDialogue();},delay);};
 clearTimeout(dialogueTimer);
 if(voiceAvailable)window.speechSynthesis.cancel();
 if(talk.paused)return;
 const words=line.trim().split(/\s+/).length;
 const reading=Math.max(5000,Math.min(15000,1800+words*420));
 if(!prefs.narration||!voiceAvailable){later(reading);return;}
 const utterance=new window.SpeechSynthesisUtterance(line);
 utterance.lang='en-GB';utterance.rate=.94;
 const voices=window.speechSynthesis.getVoices();
 const voice=voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
 if(voice)utterance.voice=voice;
 utterance.onend=()=>{if(current())later(700);};
 utterance.onerror=()=>{if(current())later(reading);};
 later(Math.max(15000,words*700));
 try{window.speechSynthesis.speak(utterance);}catch(_){later(reading);}
}
function showDialogueLine(){
 if(!dialogue)return;
 const {turns,index,mode,partner}=dialogue, turn=turns[index];
 const info=S.speakerInfo(turn.id,state);
 const rail=$('dialogue'), portrait=$('dialogue-portrait');
 dialogue.id=turn.id;
 actorFocus=partner || (turn.id!==playerId()?turn.id:null);
 const otherId=turn.id===playerId()?actorFocus:turn.id;
 const other=actorPositions.get(otherId)||actorHomes.get(otherId);
 if(staged && other && dialogue.mode==='exchange' && Math.abs(other.x-player.x)>.5){
  playerFacing=other.x<player.x?-1:1;playerPose();
 }
 const file=info.portrait;
 if(portrait.getAttribute('src')!==file)portrait.setAttribute('src',file);
 $('dialogue-speaker').textContent=info.speaker;
 $('dialogue-text').textContent=turn.text;
 $('dialogue-progress').textContent=`${index+1} / ${turns.length}`;
 const next=index===turns.length-1?'Finish conversation':'Continue conversation';
 $('dialogue-next').setAttribute('aria-label',next);$('dialogue-next').title=next;
 $('dialogue-pause').setAttribute('aria-pressed',String(dialogue.paused));
 rail.dataset.speaker=turn.id;rail.dataset.mode=mode;rail.hidden=false;
 $('command-dock').dataset.mode=mode;$('inventory-bar').inert=mode==='exchange';
 scheduleDialogue();
}
function advanceDialogue(){
 if(!dialogue)return;
 if(++dialogue.index>=dialogue.turns.length){closeDialogue(true);return;}
 showDialogueLine();
}
function beginExchange(turns,partner,mode='exchange'){
 closeDialogue();
 if(!turns?.length)return;
 dialogue={turns,partner,mode,index:0,paused:false,delivery:0};
 $('dialogue-pause').setAttribute('aria-label','Pause conversation');$('dialogue-pause').title='Pause conversation';
 showDialogueLine();
}
function startDialogue(id,short=false,spokenLine=null,storyState=state){
 const who=id==='player'?playerId():id;
 const turns=spokenLine?[{id:who,text:spokenLine}]:S.conversation(id,storyState);
 beginExchange(short?turns.slice(0,1):turns,who===playerId()?null:who,short?'aside':'exchange');
}
function openingConversation(){
 const turns=S.arrival?.(state);
 if(!turns?.length)return;
 $('first-hint').hidden=true;
 beginExchange(turns,'raynal');
}
function pauseDialogue(){
 if(!dialogue)return;
 dialogue.paused=!dialogue.paused;
 const name=dialogue.paused?'Resume conversation':'Pause conversation';
 const button=$('dialogue-pause');button.setAttribute('aria-pressed',String(dialogue.paused));
 button.setAttribute('aria-label',name);button.title=name;
 scheduleDialogue();
}
function placeCrew(button,id,x,y,h){
 if(staged && button.dataset.depth!==String(h)){
  const w=actorWidth(h);
  button.style.height=h+'%';button.style.width=w+'%';
  button.style.setProperty('--canvas-width',(h*.60/w*100)+'%');button.dataset.depth=String(h);
 }
 if(button.dataset.foot!==`${x},${y}`){
  button.style.left=x+'%';button.style.top=(y-h/2)+'%';button.style.zIndex=String(Math.round(y));
  button.dataset.foot=`${x},${y}`;actorPositions.set(id,{x,y});
 }
}
function lightFrame(now, paused, reduced, force=false) {
 if(lighting) lighting.frame({state,choice:prefs.lighting,now,paused,reduced,force,
   weatherRoot:$('place-weather'),player,actors:actorPositions});
}
function liveFrame(now){
 const dt=lastLiveTime===null?0:Math.max(0,Math.min(100,now-lastLiveTime));lastLiveTime=now;
 const paused=Boolean(document.hidden||Film?.shown()||$('modal').open||Bench?.shown()||window.CastawayRepairRoll?.shown()||
   window.CastawayEpilogue?.shown?.()||!$('completion').hidden),reduced=effectiveReduced();
 const speaker=dialogue?.id===playerId()?player:actorPositions.get(dialogue?.id);
 $('player').classList.toggle('speaking',dialogue?.id===playerId());
 for(const [id,home]of actorHomes){
  const button=$('person-'+id),canvas=$('actor-'+id);if(!button||!canvas)continue;
  if(!paused && (!walkImages.get(id)||(staged&&Work&&!Work.available(id))))prepareWalk(id);
  const held=paused||(!reduced&&!walkImages.get(id));
  let pose,x,y,h;
  if(staged){
   pose=actorStep(id,home,dt,held,reduced,speaker);x=pose.x;y=pose.y;h=heightAt(y);
  }else{
   const bodyHeight=home.h*9/16;
   if(!actorTracks.has(id)){const track=M.createTrack(id,{bodyHeight});track.setGoal(actorGoal(id),{immediate:true});actorTracks.set(id,track);}
   const track=actorTracks.get(id);track.setGoal(actorGoal(id));
   pose=track.tick(dt,{paused:held||Boolean(dialogue)||actorFocus===id||document.activeElement===button||Boolean(button.matches?.(':hover')),reduced,bodyHeight});x=home.x+pose.x;y=home.y+pose.y;h=home.h;
   if(actorFocus===id)pose.facing=player.x<x?'left':'right';
  }
  placeCrew(button,id,x,y,h);
  actorPose(id,canvas,pose.moving,pose.frame,pose.facing,pose.posture);
  button.classList.toggle('speaking',dialogue?.id===id);
 }
 lightFrame(now,paused,reduced);
 requestAnimationFrame(liveFrame);
}

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));saving=true;}catch(_){saving=false;} $('saved').style.color=saving?'#c4b08a':'#d6a177';$('saved').title=saving?'Saved in this browser':'Saving is unavailable';$('saved').setAttribute('aria-label',$('saved').title);$('saved').textContent=saving?'●':'!';}
function savePrefs(){
 document.body.classList.toggle('reduced',prefs.reduced);
 const {lighting:choice,...saved}=prefs;
 // The first-night standalone shares this key. Auto is the absence of an
 // override, just as it was for every save created before scene lighting.
 if(choice!=='auto')saved.lighting=choice;
 try{localStorage.setItem(PREF,JSON.stringify(saved));}catch(_){}
}
// Place and viewpoint already have their own labels. The action line follows the
// object under the pointer, the keyboard target or the item the player is holding.
const controlLabels=new WeakMap();
let hoveredControl=null;
function refreshActionLabel(focus=document.activeElement){
 const control=hoveredControl?.isConnected?hoveredControl:focus;
 const description=control?.isConnected&&controlLabels.get(control);
 $('action-label').textContent=description?description():selected?E.ITEMS[selected].name:examining?'Examine':'';
}
function bindActionLabel(button,description){
 controlLabels.set(button,description);
 button.onmouseenter=()=>{hoveredControl=button;refreshActionLabel();};
 button.onmouseleave=()=>{if(hoveredControl===button)hoveredControl=null;refreshActionLabel();};
 button.onfocus=()=>{hoveredControl=null;refreshActionLabel(button);};
 button.onblur=event=>refreshActionLabel(event?.relatedTarget||null);
}
function targetLabel(name){return selected?E.ITEMS[selected].name+' → '+name:name;}
function setSelected(id){closeDialogue();if(id)setExamine(false);const focusedItem=document.activeElement?.dataset?.item;selected=id;if(id)Bench?.prepareForItem(id,state.scene);renderInventory();if(focusedItem)$('inventory').querySelector(`[data-item="${focusedItem}"]`)?.focus();$('cancel-item').hidden=!id;refreshActionLabel();$('cursor-item').innerHTML=id?svg(id):'';$('cursor-item').style.display=id?'block':'none';}
function showCue(cue,text,items=[],showText=false){const aliases={take:items[0]||'hand',combine:items[0]||'loopPole',canvas_recovered:'canvas',crate_open:'axe',wood_cut:'firewood',shelter_built:'shelter',fuel_placed:'firewood',fire_lit:'fire',mast_raised:'signal',signal_raised:'signal',blocked:'wrong',look:'eye',travel:'done',beach:'eye'};const icon=aliases[cue]||cue;$('thought').innerHTML=items.length>1?items.map(id=>svg(id)).join('<span>+</span>'):svg(icon);$('thought').classList.add('show');clearTimeout(thoughtTimer);thoughtTimer=setTimeout(()=>$('thought').classList.remove('show'),2600);$('caption').textContent=text;$('caption').classList.toggle('show',prefs.captions||showText);clearTimeout(captionTimer);captionTimer=setTimeout(()=>$('caption').classList.remove('show'),Math.max(3500,Math.min(9000,text.length*67)));}
function updatePlayer(){const node=$('player');node.style.left=player.x+'%';node.style.top=player.y+'%';node.style.zIndex=String(Math.round(player.y));if(staged){const h=heightAt(player.y);node.style.height=h+'%';node.style.width=(h*.60)+'%';node.style.setProperty('--scale',1);}else node.style.setProperty('--scale',.8+(player.y-68)/70);}
async function walkTo(x,y){
 const mine=++ticket;
 $('player').classList.remove('walking','acting');
 playerPose();
 const loading=prepareWalk(playerId(),true);
 // Only a user-selected motion preference may skip the route.
 const ready=effectiveReduced()||await loading;
 if(mine!==ticket)return false;
 if(!ready){
  showCue('look','The walking picture could not load. Try moving again.',[],true);
  return false;
 }
 if(staged){
  const path=Choreo.walker(player,playerFacing<0?'left':'right',walkDistance);
  path.go(profile().walkPolygon,{x,y},heightAt);
  const stepLength=M.STRIDE / 2;
  let lastContact=Math.floor(walkDistance / stepLength);
  let last=performance.now();$('player').classList.add('walking');
  return new Promise(resolve=>{function tick(now){
   if(mine!==ticket){resolve(false);return;}
   const step=path.tick(now-last,heightAt,{paused:document.hidden,reduced:effectiveReduced()});last=now;
   player={x:step.x,y:step.y};playerFacing=step.facing==='left'?-1:1;walkDistance=path.stride;updatePlayer();
   const contact=Math.floor(walkDistance / stepLength);
   if(step.moving && contact>lastContact){
    Weather?.footfall($('place-weather'),state,player.x,player.y);
   }
   lastContact=contact;
   actorPose(playerId(),$('player-sprite'),step.moving,step.frame,step.facing,path.active?'walk':'stand');
   if(path.active)requestAnimationFrame(tick);else{$('player').classList.remove('walking');resolve(true);}
  }requestAnimationFrame(tick);});
 }
 const bounds=W.scenes?.[state.scene]?.walk||[6,94,74,90];x=Math.max(bounds[0],Math.min(bounds[1],x));y=Math.max(bounds[2],Math.min(bounds[3],y));
 const start={...player},dx=x-player.x,dy=y-player.y;
 // Ground coordinates use a 16:9 stage; cadence follows actual distance in body heights.
 const distance=Math.hypot(dx,dy*9/16),scale=.8+(player.y-68)/70,bodyHeight=32*9/16*scale;
 if(Math.abs(dx)>.15)playerFacing=dx>=0?1:-1;
 const duration=effectiveReduced()?0:M.travelDuration(distance/bodyHeight),startDistance=walkDistance;
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
function cancelWalk(){ticket++;if(!dialogue)actorFocus=null;$('player').classList.remove('walking');$('player').classList.remove('acting');playerPose();}
function flyItem(id,origin){if(prefs.reduced)return;const item=$('inventory').querySelector(`[data-item="${id}"]`);if(!item)return;const r=item.getBoundingClientRect(),s=$('scene').getBoundingClientRect(),x=s.left+s.width*(origin?.x||player.x)/100,y=s.top+s.height*(origin?.y||player.y)/100;const el=document.createElement('div');el.className='cursor-item flying';el.style.cssText=`display:block;left:${x}px;top:${y}px;width:44px;height:44px`;el.innerHTML=svg(id);document.body.appendChild(el);const animation=el.animate([{transform:'translate(-22px,-22px) scale(1.4)',opacity:1},{transform:`translate(${r.left-x+10}px,${r.top-y+10}px) scale(.75)`,opacity:.8}],{duration:650,easing:'ease-in-out'});animation.onfinish=()=>el.remove();}
function revealCompletion(){if(!state.completed)return;if($('modal').open){completionPending=true;return;}completionPending=false;closeDialogue();
 if(endingFilmDue){
  endingFilmDue=false;
  chapterFilm('epilogue',revealCompletion);
  return;
 }
 $('completion').hidden=false;
 if(CAMPAIGN){$('completion-title').focus({preventScroll:true});$('completion').scrollTop=0;}else $('keep-exploring').focus();}
function apply(response,{origin,source,usedItem,after}={}){
 return paintThen(response.state,()=>{
  // Release the hand only when its successful action and required painting commit.
  if(usedItem && usedItem===selected)selected=null;
  applyReady(response,origin,source);
  after?.();
 });
}
function applyReady(response,origin,source){
 const wasDone=state.completed,wasChapterDone=state.chapterComplete,oldFlags=state.flags;
 state=response.state;if(selected&&!state.inventory.includes(selected))selected=null;
 save();render({source,gainedItem:response.gained[0]});showCue(response.cue,response.text,response.gained);
 response.gained.forEach(id=>flyItem(id,origin));
 if(CAMPAIGN&&!state.completed){
  const beat=S.workBeat?.(oldFlags,state);
  if(beat)startDialogue(beat.id,true,beat.text);
  else if(chapterNumber()>1&&!wasChapterDone&&state.chapterComplete)startDialogue('player',true);
 }
 if(!wasDone&&state.completed){
  finalShown=true;endingFilmDue=Boolean(Film);
  if(Film){story.pending=bookmark('epilogue');saveStory();}
  completionTimer=setTimeout(revealCompletion,prefs.reduced?0:1800);
 }
}

function lookAtSewingBench(){
 const roll=state.repairRoll,detail=window.CastawayRepairRoll;
 if(!roll||!detail||state.scene!=='return_camp')return;
 closeDialogue();
 detail.open({phase:'return',...roll,discover:place=>{
  const response=E.examineRoll(state,place);
  if(response.changed){state=response.state;save();}
 }});
}
function setExamine(on){
 examining=Boolean(on);$('inspect-mode').setAttribute('aria-pressed',String(examining));$('scene').classList.toggle('examining',examining);
}
function contactPose(target){
 if(['stand','reach','crouch'].includes(target.pose))return target.pose;
 return (player.y-target.y)/heightAt(player.y)<.32?'crouch':'reach';
}
function showHeldTool(item,pose){
 const node=$('held-tool'),contact=Work?.contact(playerId(),pose);
 if(!item||!contact||pose==='stand'||!A.props[item]){node.hidden=true;return;}
 const span=({loopPole:.64,pole:.64,axe:.29,prybar:.32,bailer:.23,flask:.15,filledFlask:.15,tinderbox:.12,drillBlank:.15,lantern:.22,compass:.15,ironScrap:.18})[item];
 if(!span){node.hidden=true;return;}
 const hostRatio=.60/(9/16);
 node.style.left=(50+playerFacing*contact.x/hostRatio*100)+'%';node.style.top=(100-contact.y*100)+'%';
 node.style.width=(span/hostRatio*100)+'%';node.style.height=(span*100)+'%';
 node.style.setProperty('--tool-angle',(playerFacing<0?-16:16)+'deg');node.innerHTML=svg(item);node.hidden=false;
}
function roomAction(target,action,tool){
 const marker=ticket,room=state.scene;
 const pose=contactPose(target);playerPose(pose);showHeldTool(tool,pose);$('player').classList.add('acting');
 // Show the contact before applying the result; a new intention cancels the pending action.
 let spent=0,last=performance.now();
 function frame(now){
  if(ticket!==marker||state.scene!==room)return;
  if(!document.hidden)spent+=Math.max(0,Math.min(100,now-last));last=now;
  if(!effectiveReduced()&&spent<520){requestAnimationFrame(frame);return;}
  action();
  const finish=()=>{if(ticket===marker){$('player').classList.remove('acting');playerPose();}};
  if(effectiveReduced())finish();else setTimeout(finish,320);
 }
 requestAnimationFrame(frame);
}
async function activate(target,source,inspect=false){
 if(chapterBusy||Bench?.shown())return;
 closeDialogue();$('first-hint').hidden=true;
 inspect=inspect||examining;if(examining)setExamine(false);
 const item=selected,person=target.kind==='person';if(person)actorFocus=target.id;
 const position=actorPositions.get(target.id),x=position?.x??target.x,y=position?.y??target.y;
 let spot;
 if(staged){
  const space=heightAt(y)*.26;
  spot=person?{x:x+(player.x<x?-space:space),y:y+1}:target.approach||{x:x-5,y:y+12};
 }else{const offset=person?(player.x<x?-9:9):-5;spot={x:Math.max(14,Math.min(87,x+offset)),y:Math.max(75,Math.min(86,person?y+2:y+12))};}
 if(!await walkTo(spot.x,spot.y))return;
 const faceX=target.contact?.x??x;if(Math.abs(faceX-player.x)>.12)playerFacing=faceX<player.x?-1:1;playerPose();
 if(person&&!inspect){
  if(item){showCue('talk','Put the tool away to speak.',[],true);actorFocus=null;return;}
  const beforeTalk=state;
  if(E.getTargets(state).some(t=>t.id===target.id)){const reply=E.interact(state,target.id,'talk');if(reply.changed||!CAMPAIGN)apply(reply,{origin:target,source});}
  startDialogue(target.id,false,null,beforeTalk);return;
 }
 if(person&&inspect&&!Observations){startDialogue(target.id,true);return;}
 if(target.kind==='feature'){
  const observe=()=>{Life?.tryFeature($('place-life'),state,target.id);showCue('eye',target.observation,[],true);};
  if(inspect||item){showCue('eye',target.observation,[],true);}else roomAction(target,observe,null);
  return;
 }
 if(state.scene==='cabin'&&target.id==='tinPan'&&Bench?.surveyRoof){Bench.surveyRoof(state.flags.roofSealed);return;}
 if(state.scene==='cabin'&&target.id==='roof'&&!state.flags.roofSealed&&(inspect||!item)&&Bench?.surveyRoof){Bench.surveyRoof();return;}
 if(state.scene==='return_camp'&&target.id==='campTable'&&state.repairRoll&&(inspect||!item)&&window.CastawayRepairRoll){lookAtSewingBench();return;}
 const r=inspect?E.interact(state,target.id,'look'):item?E.useItem(state,item,target.id):E.interact(state,target.id,'use');
 if(!r.changed){
  actorFocus=null;
  if(state.scene==='landing'&&target.id==='rescueBoat'&&!inspect&&!item){startDialogue('player');return;}
  const looking=inspect||!item;const text=looking&&Observations?Observations.look(state,target.id,r.text):r.text;
  showCue(looking?'eye':r.cue,text,[],Boolean(Observations));return;
 }
 const pendingState=state;
 const complete=(atBench=false)=>{
  if(state!==pendingState)return false;
  const commit=()=>apply(r,{origin:target,source,usedItem:inspect?null:item,after:()=>{
   if(staged)Life?.work($('place-life'),state,target.id);
   if(staged)Weather?.respond($('place-weather'),state,target.id);
   if(!CAMPAIGN&&['shelter_built','fire_lit'].includes(r.cue))startDialogue('player',true);
   if(target.id==='campTable'&&r.changed&&state.flags.suppliesShared&&state.repairRoll&&!state.repairRoll.seen){
    if(dialogue)dialogue.after=lookAtSewingBench;else lookAtSewingBench();
   }
   if(atBench)playerPose();
  }});
  if(atBench||!staged)return commit();
  roomAction(target,commit,item);
 };
 const id=window.CastawayFieldwork?.challenge(state,item,target.id,r);
 if(id&&Bench){
  playerPose(contactPose(target));
  Bench.open(id,{complete:()=>complete(true),close:()=>{if(state===pendingState)playerPose();}});
 }else complete();
}
async function exitScene(exit,source){
 if(chapterBusy)return;
 closeDialogue();$('first-hint').hidden=true;
 const departure=staged?exit.approach:null;
 if(!await walkTo(departure?.x??(exit.x<50?5:95),departure?.y??83))return;
 cancelWalk();
 const response=E.travel(state,exit.to);
 if(!response.changed)return;
 return paintThen(response.state,()=>{
  const from=state.scene;state=response.state;
  player=staged?entryPoint(exit.x<50?'right':'left',from):{x:exit.x<50?84:16,y:84};
  const bounds=W.scenes?.[state.scene]?.walk;
  if(!staged&&bounds)player.x=Math.max(bounds[0],Math.min(bounds[1],player.x));
  $('arrival').classList.add('cover');save();render({source,sceneChanged:true});
  setTimeout(()=>$('arrival').classList.remove('cover'),prefs.reduced?0:240);
 });

}
function targetArt(t){if(t.artHidden||t.paint===false)return '';if(t.kind==='person')return person(t.actor||t.id);if(t.art){const id=t.solvedFlag&&state.flags[t.solvedFlag]?(t.solvedArt||t.art):t.art;return svg(id);}if(t.id==='sail')return svg('canvas');if(t.id==='driftwood'&&state.flags.woodCut)return '';if(['rope','pole','prybar','cairn','driftwood'].includes(t.id))return svg(t.id);return '';}
function dimensions(t){if(t.w&&t.h)return[t.w,t.h];if(t.kind==='person')return[8.5,t.id==='henry'?25.5:27];return{rope:[6.5,9],pole:[18,22],prybar:[6,13],sail:[10,14],driftwood:[15,14],crate:[18,23],shelter:[35,43],hearth:[20,18],cairn:[7,11]}[t.id]||[8,12];}
function worldChanges(){const f=state.flags;let html='';

 if(state.scene==='camp'){
 if(f.firewoodPlaced&&!f.fireLit)html+=`<div class="change ground-prop" style="left:27%;top:67%;width:11%;height:10%">${svg('firewood')}</div>`;
 if(f.fireLit)html+=`<div class="fire-glow" style="left:6%;top:39%"></div><div class="change painted-fire" style="left:27.3%;top:55.6%;width:9%;height:23%">${painted(A.states.fire,'flame')}</div>`;
 if(f.mastRaised)html+=`<div class="change signal-mast" style="left:46.9%;top:44%;width:6.8%;height:38%">${painted(f.signalRaised?A.states.mastFlag:A.states.mast,f.signalRaised?'flag-cloth':'bare-mast')}</div>`;

 }
 if(W.decorations)html+=W.decorations(state,{painted,svg,marks:Stage?.marks});
 if(state.scene==='cabin')html+=Bench?.cabinTraces?.(state.flags.roofSealed)||'';
 if(worldMarkup!==html){$('world-changes').innerHTML=html;worldMarkup=html;}
 syncCompanions();
}
function syncCompanions(){
 const company=staged?Stage.companions(state.scene,state).map(id=>{const b=Stage.station(state.scene,id);return [id,b.x,b.y,heightAt(b.y)];}):!CAMPAIGN&&state.scene==='camp'&&chapterNumber()===1?[['george',84,79,28],...((state.completed||state.chapterComplete)?[['musgrave',57,74,25.5],['raynal',68,76,27]]:[])]:[];
 const container=$('companions'),present=new Set(company.map(([id])=>id));
 for(const id of companionMarkup.keys())if(!present.has(id)){container.querySelector(`[data-story-person="${id}"]`)?.remove();companionMarkup.delete(id);}
 for(const [id,bx,by,bh]of company){
  const station=stationFor(id,{x:bx,y:by,h:bh});const {x,y}=station,h=staged?heightAt(y):bh;
  actorHomes.set(id,{...station,h});prepareWalk(id);
  const markup=`<button id="person-${id}" class="change companion person" data-story-person="${id}" aria-label="Talk to ${S.speakerInfo(id,state).speaker}" title="Talk to ${S.speakerInfo(id,state).speaker}" style="left:${x}%;top:${y-h/2}%;width:${staged?actorWidth(h):8.5}%;height:${h}%;--canvas-width:${staged?h*.60/actorWidth(h)*100:160}%;--actor-delay:-${x/17}s;z-index:${Math.round(y)}">${person(id)}</button>`;
  if(companionMarkup.get(id)!==markup){container.querySelector(`[data-story-person="${id}"]`)?.remove();container.insertAdjacentHTML('beforeend',markup);companionMarkup.set(id,markup);}
  const b=container.querySelector(`[data-story-person="${id}"]`);
  b.onclick=e=>{e.stopPropagation();activate({id,name:S.speakerInfo(id,state).speaker,kind:'person',x,y},b);};
  bindActionLabel(b,()=>targetLabel(S.speakerInfo(id,state).speaker));
 }
}

function inspectKey(event,inspect){if(event.key==='ContextMenu'||(event.key==='F10'&&event.shiftKey)){event.preventDefault();event.stopPropagation();inspect();}}
function renderInventory(){const empty=Math.max(0,8-state.inventory.length);$('inventory').innerHTML=state.inventory.map(id=>`<button class="item ${id===selected?'selected':''}" data-item="${id}" aria-label="${esc(E.ITEMS[id].name)}" aria-pressed="${id===selected}" title="${esc(E.ITEMS[id].name)}">${svg(id)}</button>`).join('')+Array.from({length:empty},()=>'<div class="item empty" aria-hidden="true"></div>').join('');$('inventory').querySelectorAll('[data-item]').forEach(b=>{const id=b.dataset.item;b.onclick=()=>{cancelWalk();if(selected&&selected!==id){const response=E.combine(state,selected,id);if(response.changed){selected=null;apply(response,{source:b});}else{showCue('wrong',response.text);setSelected(id);}}else setSelected(selected===id?null:id);};bindActionLabel(b,()=>selected&&selected!==id?`${E.ITEMS[selected].name} + ${E.ITEMS[id].name}`:E.ITEMS[id].name);b.onkeydown=e=>inspectKey(e,()=>showCue(id,E.ITEMS[id].description));b.oncontextmenu=e=>{e.preventDefault();showCue(id,E.ITEMS[id].description);};});}
function restoreRenderFocus(previous,source,gainedItem,sceneChanged){
 if(!previous || previous===document.body || (previous.isConnected && !previous.hidden))return;
 if(document.activeElement!==document.body && document.activeElement!==previous)return;
 // A walk can finish after the player has already moved focus to another control.
 const wasSource=previous===source;
 if(wasSource && sceneChanged){$('scene').focus({preventScroll:true});return;}
 const {item,target,exit,storyPerson}=previous.dataset;
 const nextItem=(wasSource && gainedItem)||item;
 const replacement=nextItem?$('inventory').querySelector(`[data-item="${nextItem}"]`):
  target?$('targets').querySelector(`[data-target="${target}"]`):
  exit?$('exits').querySelector(`[data-exit="${exit}"]`):
  storyPerson?$('person-'+storyPerson):null;
 (replacement||(wasSource?$('scene'):null))?.focus({preventScroll:true});
}
function render({source,gainedItem,sceneChanged=false}={}){const previousFocus=document.activeElement,scene=currentScene(),world=W.scenes?.[state.scene];$('scene').dataset.scene=state.scene;$('scene').dataset.chapter=String(chapterNumber());$('scene').dataset.indoor=String(Boolean(world?.indoor));$('scene').dataset.shelter=String(state.flags.shelterBuilt);$('scene').dataset.crate=String(state.flags.crateOpen);$('scene').classList.toggle('warm',(state.scene==='camp'&&state.flags.fireLit)||Boolean(state.flags.forgeLit&&state.scene==='forge'));const location=staged&&chapterNumber()===1&&state.scene==='beach'?'Grafton wreck · Carnley Harbour, January 1864':scene.name;
 $('scene').setAttribute('aria-label',location);$('scene-label').textContent=location;
 $('scene').classList.toggle('staged',staged);$('inspect-mode').hidden=!staged;
 const goals=CAMPAIGN?E.getChapter(state).goals:[{icon:'shelter',flag:'shelterBuilt',label:'Shelter'},{icon:'fire',flag:'fireLit',label:'Fire'},{icon:'signal',flag:'signalRaised',label:'Signal'}];
 $('goals').setAttribute('aria-label','Chapter goals');$('goals').innerHTML=goals.map(g=>`<span class="goal ${state.flags[g.flag]?'done':''}" title="${esc(g.label)}" aria-label="${esc(g.label)}: ${state.flags[g.flag]?'done':'still needed'}">${svg(g.icon==='fire'?'fireGlyph':g.icon)}</span>`).join('');renderChapterUI();
 actorHomes.clear();const targets=E.getTargets(state).map(t=>{const base=W.stageTarget?W.stageTarget(t,state):t;return staged?Stage.stageTarget(state.scene,base,state):base;}).filter(t=>CAMPAIGN||!state.completed||state.scene==='camp'||t.kind!=='person'),container=$('targets');
 const enteredRoom=targetScene!==state.scene;
 if(enteredRoom){container.innerHTML='';targetMarkup.clear();actorTracks.clear();actorPositions.clear();targetScene=state.scene;}
 if(staged&&Life?.features)targets.push(...Life.features(state));
 if(state.scene==='cabin'&&Bench?.panTarget)targets.push(Bench.panTarget(state.flags.roofSealed));
 const present=new Set(targets.map(t=>t.id));
 for(const id of targetMarkup.keys())if(!present.has(id)){container.querySelector(`[data-target="${id}"]`)?.remove();targetMarkup.delete(id);}
 targets.forEach(t=>{
  const isPerson=t.kind==='person';let [w,h]=dimensions(t),x=t.x,foot=t.groundY??(t.id==='henry'?76:75);
  if(isPerson){const home=stationFor(t.id,{x,y:foot,h});foot=home.y;x=home.x;if(staged){h=heightAt(foot);w=actorWidth(h);}actorHomes.set(t.id,{...home,h});prepareWalk(t.id);}
  const y=isPerson?foot-h/2:t.y,art=targetArt(t);
  const content=staged&&!isPerson&&art?`<span class="scene-prop" style="--art-angle:${t.artAngle||0}deg;--paint-width:${t.artWidth||w}cqw;--paint-height:${(t.artHeight||h)*9/16}cqw">${art}</span>`:art;
  const markup=`<button ${isPerson?`id="person-${t.id}"`: ''} class="target ${t.kind==='item'?'pickup':t.kind} ${t.solvedFlag&&state.flags[t.solvedFlag]?'fulfilled':''}" style="left:${x}%;top:${y}%;--w:${w}%;--h:${h}%;--canvas-width:${isPerson&&staged?h*.60/w*100:160}%;--actor-delay:-${x/17}s;z-index:${isPerson?Math.round(foot):10}" data-target="${t.id}" aria-label="${esc(t.name)}" title="${esc(t.name)}">${content}</button>`;
  if(targetMarkup.get(t.id)!==markup){
   const newcomer=!targetMarkup.has(t.id);
   container.querySelector(`[data-target="${t.id}"]`)?.remove();
   container.insertAdjacentHTML('beforeend',markup);
   targetMarkup.set(t.id,markup);
   if(staged&&isPerson){
    // Only a newly opened place in the camp that is already on screen calls for an entrance.
    // On load or travel the current watch is already at its station.
    if(newcomer&&!enteredRoom&&state.scene==='camp'&&(t.id==='raynal'||t.id==='musgrave')&&!effectiveReduced()){
     const door={...profile().from.beach,facing:'right',pose:'stand'};
     const arriving=Choreo.crewMember(door,profile().walkPolygon,heightAt);
     actorTracks.set(t.id,arriving);
    }
    const pose=actorStep(t.id,actorHomes.get(t.id),0,true,effectiveReduced(),null);
    // Write the first visible foot and facing before the browser can paint the nominal home coordinates.
    placeCrew($('person-'+t.id),t.id,pose.x,pose.y,heightAt(pose.y));
    $('actor-'+t.id).style.transform=`scaleX(${pose.facing==='left'?-1:1})`;
   }
  }
  const b=container.querySelector(`[data-target="${t.id}"]`);b.onclick=e=>{e.stopPropagation();activate(t,b);};b.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();activate(t,b,true);};b.onkeydown=e=>inspectKey(e,()=>activate(t,b,true));bindActionLabel(b,()=>t.id==='tinPan'?t.name:targetLabel(t.name));
 });
 const stagedExits=exitsFor().map(e=>staged?Stage.stageExit(state.scene,e):e);
 $('exits').innerHTML=stagedExits.map(e=>`<button class="exit" style="left:${e.x}%;top:${e.y}%" data-exit="${e.id}" title="${e.name}" aria-label="${e.name}">${e.x<50?'‹':'›'}</button>`).join('');$('exits').querySelectorAll('[data-exit]').forEach(b=>{const exit=stagedExits.find(x=>x.id===b.dataset.exit);b.onclick=e=>{e.stopPropagation();exitScene(exit,b);};bindActionLabel(b,()=>exit.name);});
 worldChanges();Life?.render($('place-life'),state);
 if(staged&&Weather){
  Weather.render($('place-weather'),state);
  $('scene').setAttribute('aria-description',Weather.caption?.($('place-weather'),state)||Weather.describe(state).weather);
 }
 renderInventory();updatePlayer();playerPose(playerWork);$('cancel-item').hidden=!selected;$('cursor-item').innerHTML=selected?svg(selected):'';$('cursor-item').style.display=selected?'block':'none';restoreRenderFocus(previousFocus,source,gainedItem,sceneChanged);refreshActionLabel();
 lightFrame(performance.now(),true,effectiveReduced(),true);
}
function modal(title,html){closeDialogue();cancelWalk();const dialog=$('modal');if(!dialog.open)modalReturnFocus=document.activeElement;$('modal-title').textContent=title;$('modal-body').innerHTML=html;if(!dialog.open)dialog.showModal();}
$('inspect-mode').onclick=()=>{cancelWalk();if(selected)setSelected(null);setExamine(!examining);refreshActionLabel();};
function help(){modal('How to play',`<div class="pictogram-help"><div><strong>${svg('hand')}<span>→</span></strong><p>Click the scenery.<br>Your character walks there.</p></div><div><strong>${svg('hand')}<span>↓</span>${svg('rope')}</strong><p>Click an object.<br>Pick it up or examine it.</p></div><div><strong>${svg('rope')}<span>+</span>${svg('pole')}</strong><p>Select an item in your satchel,<br>then another item.</p></div><div><strong>${svg('axe')}<span>→</span>${svg('driftwood')}</strong><p>Select an item,<br>then something in the scene.</p></div></div><p class="small">Use the magnifying glass to examine something. Right-click, Shift+F10 or the context menu key does the same. In close-up, touch the work itself or use the labelled controls. Esc clears your selection. Space briefly reveals interactive objects. You can also use Tab and Enter. Turn on brief reaction captions in Settings.</p>`);}
function hint(){
 const h=E.hint(state),scene=E.SCENES.find(s=>s.id===h.sceneId)||currentScene(),target=scene.targets.find(t=>t.id===h.targetId);
 if(CAMPAIGN&&state.chapterComplete&&!state.completed){modal('The way ahead',`<div class="hint-icons">${svg('done')}<span>→</span></div><p class="small">${esc(departure()?.name||E.getChapter(state).exitLabel)}. Follow the passage marked in the scene.</p>`);return;}
 if(Observations){
  const key=[chapterNumber(),state.actions,h.targetId,h.itemId].join('/');
  if(key!==hintKey){hintKey=key;hintLevel=0;}
  const tiers=Observations.hints(state,h);
  const draw=()=>{modal('Field notes',`<p class="clue-text" aria-live="polite">${esc(tiers[hintLevel])}</p>${hintLevel<2?`<button class="dialog-button" id="more-clue">${hintLevel===0?'A closer look':'Show the next move'}</button>`:''}`);
   const next=$('more-clue');if(next)next.onclick=()=>{hintLevel++;draw();($('more-clue')||$('modal-close')).focus();};};
  draw();return;
 }
 const targetIcon=target?.art||{roof:'weatherPatch',kettle:'kettle',stove:'fire',spring:'filledFlask',furnace:'fire',anvil:'ironScrap',testBlock:'planks',boatFrame:'planks',seams:'caulking',boatMast:'sailcloth',rigging:'stormLine',bilge:'bailer',tornSail:'canvasPatch',horizon:'compass',rescueCutter:'spareSail',chartTable:'markedChart',rescueBoat:'rescueLine',signalPost:'lantern',campTable:'rescueProvisions',sail:'canvas',shelter:'shelter',hearth:'fire',crate:'crate',driftwood:'driftwood',cairn:state.flags.mastRaised?'signal':'cairn'}[h.targetId]||h.targetId;
 const parts=h.combineItems||['rope','pole'];
 modal('A little hint',h.cue==='combine'?`<div class="hint-icons">${parts.map(id=>svg(id)).join('<span>+</span>')}</div>`:`<div class="hint-icons">${svg(h.itemId||(h.cue==='take'?'hand':h.cue))}<span>→</span>${svg(targetIcon)}</div><p style="text-align:center">${esc(scene.name)}</p>`);$('modal-body').insertAdjacentHTML('beforeend',`<p class="${prefs.captions||CAMPAIGN?'small':'sr-only'}">${esc(h.text)}</p>`);
}
function updateLightingStatus() {
 const note=$('lighting-status');
 if(!note)return;
 const fallback=$('material-lighting')?.dataset.materialState==='fallback';
 note.textContent=fallback && prefs.lighting!=='original'?'Using the still light study for this display.':'';
}
function settings(){
 const release=document.head?.querySelector('meta[name="game-release"]')?.content?.trim();
 const lightChoice=lighting?`<div class="setting"><label for="lighting-quality">Scene lighting</label><select id="lighting-quality">
   <option value="auto">Automatic</option><option value="cinematic">Cinematic</option>
   <option value="balanced">Balanced</option><option value="original">Original painting</option>
   </select></div><p class="small" role="status" id="lighting-status"></p>`:'';
 const releaseNote=release?`<p class="settings-release">Game release ${esc(release)}</p>`:'';
 const filmChoice=Film?`<div class="setting"><label for="film-chapter-mode">Chapter films</label><select id="film-chapter-mode"><option value="watch">Play with the story</option><option value="skip">Skip films</option></select></div>`:'';
 modal('Settings',`${filmChoice}${lightChoice}<div class="setting"><span id="captions-label">Brief reaction captions</span><button id="toggle-captions" aria-labelledby="captions-label" aria-pressed="${prefs.captions}">${prefs.captions?'On':'Off'}</button></div><div class="setting"><span id="motion-label">Reduce motion</span><button id="toggle-motion" aria-labelledby="motion-label" aria-pressed="${prefs.reduced}">${prefs.reduced?'Reduced':'On'}</button></div>${voiceAvailable?`<div class="setting"><span id="narration-label">Narration · device voice</span><button id="toggle-narration" aria-labelledby="narration-label" aria-pressed="${prefs.narration}">${prefs.narration?'On':'Off'}</button></div>`:''}<div class="setting"><span>Return to the shore</span><button id="restart">New game</button></div><p class="small">An original adventure inspired by the Grafton castaways. Puzzles and dialogue are fictional; the historical rescue is documented in the project sources. Artwork was generated with AI.</p><p class="small"><a href="https://github.com/OnFiala/auckland-castaways/tree/main/adventure" target="_blank" rel="noopener noreferrer">Sources and project files ↗</a></p>${releaseNote}`);$('toggle-captions').onclick=()=>{prefs.captions=!prefs.captions;savePrefs();settings();$('toggle-captions').focus();};$('toggle-motion').onclick=()=>{prefs.reduced=!prefs.reduced;savePrefs();settings();$('toggle-motion').focus();};if($('toggle-narration'))$('toggle-narration').onclick=()=>{prefs.narration=!prefs.narration;savePrefs();settings();$('toggle-narration').focus();};$('restart').onclick=restart;
 if(Film){
  const mode=$('film-chapter-mode');mode.value=Film.chapterMode();mode.onchange=()=>Film.setChapterMode(mode.value);
 }
 const selector=$('lighting-quality');
 if(selector) {
  selector.value=prefs.lighting;
  selector.onchange=()=>{
   prefs.lighting=window.CastawayPaintingLight.preference(selector.value);
   savePrefs();
   lightFrame(performance.now(),true,effectiveReduced(),true);
   updateLightingStatus();
  };
  updateLightingStatus();
 }
}
function restart(){
 modal('Return to the shore?',`<p class="small">This will replace your current progress.</p><button class="dialog-button" id="confirm-restart">Start again</button>`);
 $('confirm-restart').onclick=()=>{
  if(pendingPainting)return;
  const fresh=E.createGame();cancelWalk();modalReturnFocus=null;$('modal').close();
  paintThen(fresh,()=>{
   clearTimeout(completionTimer);
   completionPending=false;endingFilmDue=false;closeDialogue();actorTracks.clear();actorPositions.clear();
   Bench?.reset();window.CastawayEpilogue?.reset?.();hintKey='';hintLevel=0;walkDistance=0;
   playerWork='stand';setExamine(false);state=fresh;selected=null;
   player=staged?entryPoint():{x:45,y:84};finalShown=false;$('completion').hidden=true;
   if(Film){story={openingSeen:false,pending:null};saveStory();}
   save();render();$('scene').focus();if(CAMPAIGN)chapterFilm('prologue',openingConversation);
  });
 };
}
function reveal(){document.body.classList.add('show-targets');clearTimeout(revealTimer);revealTimer=setTimeout(()=>document.body.classList.remove('show-targets'),2400);}
function renderChapterUI(){
 $('journey').hidden=!CAMPAIGN;$('chapter-exit').hidden=!CAMPAIGN||!state.chapterComplete||state.completed;
 if(!CAMPAIGN)return;
 const chapter=E.getChapter(state);$('chapter-label').textContent=`${chapterNumber()} / 7 · ${chapter.title}`;
 const route=state.chapterComplete&&!state.completed?departure():null;const label=route?.name||chapter.exitLabel;
 $('chapter-exit-label').textContent=label;$('chapter-exit').setAttribute('aria-label',label);
 $('player').dataset.identity=playerId();$('perspective-label').textContent=chapterNumber()>=6?'Captain Musgrave':'Alick McLaren';
 if(state.completed){
 const illustration=$('homeward-illustration');illustration.src='assets/voyage/promise/ending.webp';illustration.hidden=false;
 $('new-game').hidden=true;$('credits').hidden=true;
 $('open-epilogue').hidden=!window.CastawayEpilogue;
 const end=window.CastawayVoyageStory?.ENDING;$('completion-title').textContent=end?.title||'The promise kept.';$('completion-copy').textContent=end?.line||'Henry and George are aboard. The return is complete.';$('completion-note').textContent='The end · Auckland Islands, 1864–1865';$('keep-exploring').textContent='Revisit the landing';
 $('ending-portraits').innerHTML=['musgrave','raynal','player','henry','george'].map(id=>`<figure><img src="assets/cast-portraits/${id}.webp" alt="${esc(({musgrave:'Thomas Musgrave',raynal:'François Raynal',player:'Alick McLaren',henry:'Henry Forgés',george:'George Harris'})[id])}"><figcaption>${({musgrave:'Musgrave',raynal:'Raynal',player:'Alick',henry:'Henry',george:'George'})[id]}</figcaption></figure>`).join('');}
}
async function advanceChapter(){
 if(!CAMPAIGN||chapterBusy||!state.chapterComplete||state.completed)return;
 const source=$('chapter-exit'),passage=departure();if(passage?.exit){await exitScene(passage.exit,source);return;}chapterBusy=true;closeDialogue();selected=null;clearTimeout(completionTimer);
 if(!await walkTo(passage?.x??94,passage?.y??84)){chapterBusy=false;return;}
 cancelWalk();
 if(chapterNumber()===4&&window.CastawayRepairRoll){
  chapterBusy=false;
  window.CastawayRepairRoll.open({
   phase:'departure',place:state.repairRoll?.place,
   store:place=>{const response=E.stowRoll(state,place);if(response.changed){state=response.state;save();}},
   depart:()=>{if(chapterBusy||chapterNumber()!==4||!state.repairRoll)return;chapterBusy=true;makePassage(source);}
  });
  return;
 }
 await makePassage(source);
}
async function makePassage(source){
 const response=E.advance(state);if(!response.changed){chapterBusy=false;return;}
 return paintThen(response.state,()=>{
  $('arrival').classList.add('cover');state=response.state;player=staged?entryPoint():{x:22,y:84};
  setExamine(false);actorTracks.clear();actorPositions.clear();walkDistance=0;
  save();render({source,sceneChanged:true});prepareWalk(playerId());
  chapterFilm(Film?.timeline[chapterNumber()-1]?.id,chapterArrival);
  setTimeout(()=>$('arrival').classList.remove('cover'),effectiveReduced()?0:400);
 });
}
function journey(){
 if(!CAMPAIGN)return;const chapters=Array.isArray(E.CHAPTERS)?E.CHAPTERS:Object.values(E.CHAPTERS);
 const beats=window.CastawayVoyageStory?.CHAPTER_BEATS||[];
 function replayButton(reel){
  return reel?`<button type="button" class="film-replay" data-replay-film="${esc(reel.id)}" aria-label="Replay film: ${esc(reel.title)}">View film</button>`:'';
 }
 const entries=chapters.map(c=>{
  const unlocked=c.id<=chapterNumber();
  const film=unlocked?Film?.timeline[c.id-1]:null;
  return `<li class="${c.id<chapterNumber()?'past':c.id===chapterNumber()?'current':'ahead'}"><span>${c.id<chapterNumber()?'✓':c.id}</span><div><strong>${esc(c.title)}</strong><small>${esc((unlocked&&beats.find(b=>b.chapter===c.id)?.caption)||c.subtitle||'')}</small></div>${replayButton(film)}</li>`;
 });
 if(state.completed&&Film)entries.push(`<li class="past"><span>✓</span><div><strong>Epilogue</strong><small>The names that came home</small></div>${replayButton(Film.timeline.at(-1))}</li>`);
 modal('Our journey',`<ol class="journey-map">${entries.join('')}</ol><p class="small">Progress saves automatically. Complete the work in each place to open the next passage.</p><p class="small">Chapters I–V: Alick McLaren. Chapters VI–VII: Captain Musgrave.</p>${state.completed&&Film?'<button type="button" id="film-feature" class="dialog-button">Watch the whole story</button>':''}${state.completed?'<button id="return-ending" class="dialog-button">Revisit the ending</button>':''}`);
 for(const button of $('modal-body').querySelectorAll('[data-replay-film]')){
  button.onclick=()=>Film.open([button.dataset.replayFilm],{replay:true,auto:true,reduced:effectiveReduced(),focus:button});
 }
 if(state.completed&&Film)$('film-feature').onclick=()=>Film.open(Film.timeline.map(r=>r.id),{
  replay:true,reduced:effectiveReduced(),auto:true,focus:$('film-feature')
 });
 if(state.completed){
  $('modal-body').insertAdjacentHTML('beforeend','<button id="journey-credits" class="dialog-button">Historical notes</button>');
  $('journey-credits').onclick=showCredits;
  $('return-ending').onclick=()=>{$('modal').close();revealCompletion();};
 }
}
$('chapter-exit').onclick=e=>{e.stopPropagation();advanceChapter();};$('journey').onclick=journey;
$('open-epilogue').onclick=()=>{if(CAMPAIGN&&state.completed)window.CastawayEpilogue?.open();};
function showCredits(){const end=window.CastawayVoyageStory?.ENDING;modal('The people behind the story',`<p class="small">An original adaptation of the Grafton castaways’ accounts. The playable puzzles, dialogue and portraits are interpretations.</p><p class="small">The films draw on Thomas Musgrave, François Raynal, George Dalgarno and Andrew Smith. English narration was synthesized with Kokoro-82M. Music and sound effects were composed for Until We Return.</p>${(end?.facts||[]).map(f=>`<p class="small">${esc(f.text)}</p>`).join('')}<p class="small"><a href="https://github.com/OnFiala/auckland-castaways/tree/main/research" target="_blank" rel="noopener noreferrer">Historical sources and adaptation notes ↗</a></p>`);}
$('credits').onclick=showCredits;
$('scene').onclick=e=>{if(chapterBusy)return;if(e.target.closest('button')||e.target.closest('.dialogue'))return;closeDialogue();$('first-hint').hidden=true;const r=$('scene').getBoundingClientRect();walkTo((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);};
$('scene').oncontextmenu=e=>e.preventDefault();$('hint').onclick=hint;$('reveal').onclick=reveal;$('settings').onclick=settings;$('help').onclick=help;$('cancel-item').onclick=()=>{cancelWalk();setSelected(null);};$('modal-close').onclick=()=>$('modal').close();$('modal').addEventListener('close',()=>{if(modalReturnFocus?.isConnected)modalReturnFocus.focus();modalReturnFocus=null;if(completionPending)revealCompletion();});$('dismiss-hint').onclick=()=>$('first-hint').hidden=true;$('keep-exploring').onclick=()=>{$('completion').hidden=true;if(!CAMPAIGN)startDialogue('george',true);$('scene').focus();};$('new-game').onclick=restart;
window.addEventListener('pointermove',e=>{if(!selected)return;$('cursor-item').style.left=e.clientX+14+'px';$('cursor-item').style.top=e.clientY+12+'px';});window.addEventListener('keydown',e=>{if(pendingPainting||Film?.shown()||$('modal').open||Bench?.shown()||window.CastawayRepairRoll?.shown()||window.CastawayEpilogue?.shown?.())return;if(e.key==='Escape'){setExamine(false);if(dialogue){closeDialogue();return;}cancelWalk();setSelected(null);}if(e.code==='Space'&&!$('modal').open&&!e.target.closest('button')){e.preventDefault();reveal();}});
if(!staged)$('rain').innerHTML=Array.from({length:28},(_,i)=>`<i style="--x:${i*37%110}%;--speed:${.8+i%5*.12}s;--delay:-${i*.17}s"></i>`).join('');
$('dialogue-pause').onclick=e=>{e.stopPropagation();pauseDialogue();};$('dialogue-next').onclick=e=>{e.stopPropagation();advanceDialogue();};$('dialogue-close').onclick=e=>{e.stopPropagation();closeDialogue(true);};document.addEventListener?.('visibilitychange',()=>{lastLiveTime=null;document.body.classList.toggle('inactive',document.hidden);if(document.hidden){retainFilmPosition();closeDialogue();cancelWalk();}});
window.addEventListener('pagehide',retainFilmPosition);
if(staged)player=entryPoint();
prepareWalk(playerId());savePrefs();
const entry=entryFilm();
let roomReady=false,filmReady=!entry;
function enterVoyage(){
 if(!roomReady||!filmReady)return;
 if(CAMPAIGN&&state.completed)revealCompletion();
 else if(entry?.reel==='prologue')openingConversation();
 else if(entry)chapterArrival();
 if(document.activeElement===document.body)$('scene').focus({preventScroll:true});
}
paintThen(state,()=>{
 save();render();requestAnimationFrame(liveFrame);
 if(state.actions>0)$('first-hint').hidden=true;
 roomReady=true;enterVoyage();
});
if(entry)chapterFilm(entry.reel,()=>{filmReady=true;enterVoyage();},entry.position);
})();

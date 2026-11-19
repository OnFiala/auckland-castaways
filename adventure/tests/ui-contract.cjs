// Executes real UI handlers in a small DOM contract mock, not a browser/rendering test.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../dist/');
const KEY='castaways-adventure-v3';
function app({initial={},blocked=false,speech=null,scripts=null,saveKey=KEY,skipFilms=true}={}){
 const ids=new Map(),stored={...initial},raf=[],timers=new Map();let clock=0,timerId=0,doc;const listeners={};
 class El{
  constructor(id='',attrs={}){this.id=id;this.attrs=attrs;this.dataset={};this.children=[];this.style={setProperty(){}};this.open=false;this.hidden=Object.hasOwn(attrs,'hidden');this.disabled=Object.hasOwn(attrs,'disabled');const classes=new Set();this.classList={add(x){classes.add(x);},remove(x){classes.delete(x);},toggle(x,v){if(v===undefined)v=!classes.has(x);v?classes.add(x):classes.delete(x);},contains(x){return classes.has(x);}};for(const [k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;}
  set innerHTML(html){for(const child of this.children)if(child.id&&ids.get(child.id)===child)ids.delete(child.id);this._html=html;this.children=parse(html);for(const child of this.children)child.parent=this;}
  get innerHTML(){return this._html||'';}
  setAttribute(k,v){this.attrs[k]=v;}
  matches(sel){
   if(sel[0]==='#')return this.id===sel.slice(1);
   if(sel[0]==='.')return (this.attrs.class||'').split(/\s+/).includes(sel.slice(1));
   const attr=sel.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
   if(attr)return Object.hasOwn(this.attrs,attr[1])&&(attr[2]===undefined||this.attrs[attr[1]]===attr[2]);
   return this.tag===sel;
  }
  querySelectorAll(sel){return this.children.flatMap(el=>[...(el.matches(sel)?[el]:[]),...el.querySelectorAll(sel)]);}
  querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
  getAttribute(key){return this.attrs[key]??null;}
  hasAttribute(key){return Object.hasOwn(this.attrs,key);}
  contains(el){return this===el||this.children.some(child=>child.contains(el));}
  addEventListener(type,fn){this['on'+type]=fn;}
  insertAdjacentHTML(_,html){const added=parse(html);for(const child of added)child.parent=this;this.children.push(...added);this._html=(this._html||'')+html;}
  get ownerDocument(){return doc;}
  set className(value){this.attrs.class=value;}
  get className(){return this.attrs.class||'';}
  appendChild(el){el.parent=this;this.children.push(el);return el;}
  append(...nodes){for(const el of nodes)this.appendChild(el);}
  replaceChildren(...nodes){this.innerHTML='';this.append(...nodes);}

  remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);if(this.id&&ids.get(this.id)===this)ids.delete(this.id);this.parent=null;}
  get isConnected(){return this.id?ids.get(this.id)===this:!!this.parent&&this.parent.children.includes(this);}
  closest(sel){return this.matches(sel)?this:this.parent?.closest(sel)||null;}
  focus(){if(doc.activeElement!==this){doc.activeElement?.onblur?.();doc.activeElement=this;this.onfocus?.();}}
  getBoundingClientRect(){return {left:0,top:0,right:1000,bottom:562.5,width:1000,height:562.5};}
  animate(){return {};}
  showModal(){this.open=true;}close(){this.open=false;this.onclose?.();}
 }
 function parse(html){const all=[];for(const tag of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)){const attrs={};for(const m of tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[m[1]]=m[2]??'';const el=new El(attrs.id||'',attrs);el.tag=tag[1];all.push(el);if(el.id)ids.set(el.id,el);}return all;}
 parse(fs.readFileSync(root+'index.html','utf8'));
 doc={getElementById:id=>ids.get(id)||null,body:new El('body'),createElement:tag=>{const el=new El();el.tag=tag;return el;}};
 const context={console,document:doc,localStorage:{getItem(k){if(blocked)throw Error('blocked');return stored[k]??null;},setItem(k,v){if(blocked)throw Error('blocked');stored[k]=v;},removeItem(k){if(blocked)throw Error('blocked');delete stored[k];}},matchMedia:()=>({matches:false}),performance:{now:()=>clock},requestAnimationFrame(fn){raf.push(fn);return raf.length;},setTimeout(fn,ms=0){timers.set(++timerId,{fn,ms});return timerId;},clearTimeout(id){timers.delete(id);},addEventListener(type,fn){listeners[type]=fn;}};context.window=context;if(speech){context.speechSynthesis=speech.synth;context.SpeechSynthesisUtterance=speech.Utterance;}
 vm.createContext(context);
 if(scripts){for(const f of scripts)vm.runInContext(fs.readFileSync(root+f,'utf8'),context,{filename:f});}
 else for(const f of ['art.js','engine.js','animation.js','stories.js','app.js'])vm.runInContext(fs.readFileSync(root+f,'utf8'),context,{filename:f});
 // Existing puzzle/actor tests exercise the direct-to-game path. Film-specific
 // tests opt out so they can interact with the production dialog themselves.
 function skipOfferedFilm(){
  if(skipFilms && ids.get('story-film')?.open)ids.get('film-skip').onclick();
 }
 skipOfferedFilm();
 async function flush(frames=600){for(let i=0;i<frames;i++){clock+=16;const batch=raf.splice(0);for(const fn of batch)fn(clock);await Promise.resolve();skipOfferedFilm();}}
 async function click(id){
  const el=typeof id==='string'?ids.get(id):id;assert(el,'control '+id);
  let stopped=false,handled=false;const event={preventDefault(){},stopPropagation(){stopped=true;},target:el};
  for(let at=el;at&&!stopped;at=at.parent){if(at.onclick){handled=true;at.onclick(event);}}
  assert(handled,'click handler '+(el.id||JSON.stringify(el.attrs)));await flush();
 }
 const target=id=>ids.get('targets').querySelector(`[data-target="${id}"]`);
 const item=id=>ids.get('inventory').querySelector(`[data-item="${id}"]`);
 const exit=id=>ids.get('exits').querySelector(`[data-exit="${id}"]`);
 async function pick(id){if(!ids.get('cancel-item').hidden)await click('cancel-item');await click(target(id));}
 async function use(itemId,targetId){if(!ids.get('cancel-item').hidden)await click('cancel-item');await click(item(itemId));await click(target(targetId));}
 async function travel(id){await click(exit(id));}
 function state(){return JSON.parse(stored[saveKey]);}
 function runTimers(){const batch=[...timers.values()];timers.clear();for(const {fn}of batch)fn();skipOfferedFilm();}
 return{ids,stored,click,target,item,exit,pick,use,travel,state,runTimers,flush,context,activeElement:()=>doc.activeElement,key(key,target=doc.activeElement){listeners.keydown({key,code:key,target,preventDefault(){}});}};
}
async function main(){
 const focus=app();
 const person=focus.target('raynal');
 const rope=focus.target('rope');rope.focus();assert.equal(focus.ids.get('action-label').textContent,rope.attrs['aria-label']);
 await focus.pick('rope');assert.equal(focus.target('raynal'),person,'unaffected world target retains its node');assert(!focus.target('rope'));
 const held=focus.item('rope');held.focus();assert.equal(focus.ids.get('action-label').textContent,held.attrs['aria-label']);await focus.click(held);
 assert.equal(focus.activeElement(),focus.item('rope'),'selecting a focused inventory item retains focus');
 assert(!focus.ids.get('cancel-item').hidden);
 focus.ids.get('hint').focus();await focus.click('hint');assert(focus.ids.get('modal').open);
 focus.key('Escape');assert(!focus.ids.get('cancel-item').hidden,'Escape in dialog does not cancel selected item');
 focus.ids.get('modal').close();assert.equal(focus.activeElement(),focus.ids.get('hint'),'closing dialog restores the opener');
 assert(!focus.ids.get('cancel-item').hidden);focus.key('Escape');assert(focus.ids.get('cancel-item').hidden,'Escape outside dialog cancels selection');
 const exitFocus=focus.exit('exit_camp');exitFocus.focus();assert.equal(focus.ids.get('action-label').textContent,exitFocus.attrs['aria-label']);
 focus.runTimers();assert(!focus.ids.get('thought').classList.contains('show'),'transient feedback clears');
 const a=app();
 await a.pick('rope');await a.pick('pole');assert.deepEqual(a.state().inventory,['rope','pole']);
 await a.click(a.item('rope'));await a.click(a.item('pole'));assert.deepEqual(a.state().inventory,['loopPole']);
 // Deliberately plant the sole reaching tool before recovering the sail.
 await a.travel('exit_camp');await a.use('loopPole','cairn');assert(a.state().flags.mastRaised);assert(!a.state().inventory.includes('loopPole'));
 await a.click(a.target('cairn'));assert(!a.state().flags.mastRaised);assert(a.state().inventory.includes('loopPole'));
 await a.travel('exit_beach_camp');await a.use('loopPole','sail');assert(a.state().flags.canvasRecovered);assert(!a.target('sail'));
 // A wrong combination must preserve both critical items.
 await a.click('cancel-item');await a.click(a.item('canvas'));await a.click(a.item('loopPole'));assert(a.state().inventory.includes('canvas'));
 await a.travel('exit_wreck');await a.pick('prybar');await a.use('prybar','crate');assert(a.state().flags.crateOpen);assert(a.item('axe')&&a.item('tinderbox'));
 await a.travel('exit_beach_wreck');await a.use('axe','driftwood');assert(a.state().flags.woodCut);
 // Load the actual saved UI state into a fresh UI instance.
 const b=app({initial:a.stored});assert.deepEqual(b.state(),a.state());assert(b.item('firewood'));
 await b.travel('exit_camp');await b.use('canvas','shelter');assert(b.state().flags.shelterBuilt);assert(b.item('flagcloth'));
 await b.use('firewood','hearth');await b.use('tinderbox','hearth');assert(b.state().flags.fireLit);assert(b.ids.get('world-changes').innerHTML.includes('flame'));
 await b.use('loopPole','cairn');const beforeCompletion={...b.stored};await b.use('flagcloth','cairn');assert(b.state().completed);assert(b.ids.get('world-changes').innerHTML.includes('flag-cloth'));b.runTimers();assert.equal(b.ids.get('completion').hidden,false);
 await b.click('keep-exploring');assert.equal(b.ids.get('completion').hidden,true);assert(b.state().completed);
 await b.click('hint');assert(b.ids.get('modal').open);await b.click('modal-close');await b.click('settings');await b.click('restart');await b.click('confirm-restart');assert(!b.state().completed);assert.equal(b.state().scene,'beach');assert.equal(b.ids.get('completion').hidden,true);assert.equal(b.activeElement(),b.ids.get('scene'));b.runTimers();assert.equal(b.ids.get('completion').hidden,true);
 const race=app({initial:beforeCompletion});await race.use('flagcloth','cairn');assert(race.state().completed);await race.click('settings');await race.click('restart');await race.click('confirm-restart');race.runTimers();assert(!race.state().completed);assert.equal(race.ids.get('completion').hidden,true);
 const c=app({blocked:true});await c.pick('rope');assert(c.item('rope'));assert.equal(c.ids.get('saved').title,'Saving is unavailable');
 console.log(JSON.stringify({realUiHandlers:true,keyboardFocusAndDialog:true,stableUnaffectedTargets:true,transientFeedbackClears:true,fullPuzzleComplete:true,earlyMastRecovered:true,wrongCombinationSafe:true,midPuzzleReload:true,visibleWorldChangesMarkup:true,restart:true,pendingCompletionTimerCleared:true,storageBlockedFallback:true,limitation:'Minimal DOM contract mock only; does not verify rendering, animation, coordinates, touch or browser storage.'},null,2));
}
module.exports={app};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});

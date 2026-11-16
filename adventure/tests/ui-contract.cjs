// Executes real UI handlers in a small DOM contract mock, not a browser/rendering test.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../dist/');
const KEY='castaways-adventure-v3';
function app({initial={},blocked=false}={}){
 const ids=new Map(),stored={...initial},raf=[],timers=new Map();let clock=0,timerId=0,doc;
 class El{
  constructor(id='',attrs={}){this.id=id;this.attrs=attrs;this.dataset={};this.children=[];this.style={setProperty(){}};this.open=false;this.hidden=Object.hasOwn(attrs,'hidden');this.disabled=Object.hasOwn(attrs,'disabled');const classes=new Set();this.classList={add(x){classes.add(x);},remove(x){classes.delete(x);},toggle(x,v){if(v===undefined)v=!classes.has(x);v?classes.add(x):classes.delete(x);},contains(x){return classes.has(x);}};for(const [k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}
  set innerHTML(html){for(const child of this.children)if(child.id&&ids.get(child.id)===child)ids.delete(child.id);this._html=html;this.children=parse(html);}
  get innerHTML(){return this._html||'';}
  setAttribute(k,v){this.attrs[k]=v;}
  querySelectorAll(sel){const match=sel.match(/^\[data-([\w-]+)(?:="([^"]*)")?\]$/);if(match)return this.children.filter(el=>Object.hasOwn(el.dataset,match[1])&&(match[2]===undefined||el.dataset[match[1]]===match[2]));return this.children.filter(el=>el.tag===sel);}
  querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
  addEventListener(type,fn){this['on'+type]=fn;}
  insertAdjacentHTML(_,html){this.children.push(...parse(html));this._html=(this._html||'')+html;}
  appendChild(el){this.children.push(el);}
  remove(){}
  closest(sel){return this.tag===sel?this:null;}
  focus(){doc.activeElement=this;}
  getBoundingClientRect(){return {left:0,top:0,right:1000,bottom:562.5,width:1000,height:562.5};}
  animate(){return {};}
  showModal(){this.open=true;}close(){this.open=false;}
 }
 function parse(html){const all=[];for(const tag of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)){const attrs={};for(const m of tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[m[1]]=m[2]??'';const el=new El(attrs.id||'',attrs);el.tag=tag[1];all.push(el);if(el.id)ids.set(el.id,el);}return all;}
 parse(fs.readFileSync(root+'index.html','utf8'));
 doc={getElementById:id=>ids.get(id)||null,body:new El('body'),createElement:tag=>{const el=new El();el.tag=tag;return el;}};
 const context={console,document:doc,localStorage:{getItem(k){if(blocked)throw Error('blocked');return stored[k]??null;},setItem(k,v){if(blocked)throw Error('blocked');stored[k]=v;}},matchMedia:()=>({matches:false}),performance:{now:()=>clock},requestAnimationFrame(fn){raf.push(fn);return raf.length;},setTimeout(fn,ms=0){timers.set(++timerId,{fn,ms});return timerId;},clearTimeout(id){timers.delete(id);},addEventListener(){}};context.window=context;
 vm.createContext(context);for(const f of ['engine.js','app.js'])vm.runInContext(fs.readFileSync(root+f,'utf8'),context,{filename:f});
 async function flush(){for(let i=0;i<8;i++){clock+=2000;const batch=raf.splice(0);for(const fn of batch)fn(clock);await Promise.resolve();}}
 async function click(id){const el=typeof id==='string'?ids.get(id):id;assert.equal(typeof el?.onclick,'function','click handler '+(id?.id||id));el.onclick({preventDefault(){},stopPropagation(){},target:el});await flush();}
 const target=id=>ids.get('targets').querySelector(`[data-target="${id}"]`);
 const item=id=>ids.get('inventory').querySelector(`[data-item="${id}"]`);
 const exit=id=>ids.get('exits').querySelector(`[data-exit="${id}"]`);
 async function pick(id){if(!ids.get('cancel-item').hidden)await click('cancel-item');await click(target(id));}
 async function use(itemId,targetId){if(!ids.get('cancel-item').hidden)await click('cancel-item');await click(item(itemId));await click(target(targetId));}
 async function travel(id){await click(exit(id));}
 function state(){return JSON.parse(stored[KEY]);}
 function runTimers(){const batch=[...timers.values()];timers.clear();for(const {fn}of batch)fn();}
 return{ids,stored,click,target,item,exit,pick,use,travel,state,runTimers,flush,activeElement:()=>doc.activeElement};
}
async function main(){
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
 const c=app({blocked:true});await c.pick('rope');assert(c.item('rope'));assert.match(c.ids.get('saved').title,/není dostupné/);
 console.log(JSON.stringify({realUiHandlers:true,fullPuzzleComplete:true,earlyMastRecovered:true,wrongCombinationSafe:true,midPuzzleReload:true,visibleWorldChangesMarkup:true,restart:true,pendingCompletionTimerCleared:true,storageBlockedFallback:true,limitation:'Minimal DOM contract mock only; does not verify rendering, animation, coordinates, touch or browser storage.'},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

// Minimal DOM contract only: this is not a browser or rendering test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'../dist/');
function run(storageUnavailable=false){
 const ids=new Map(), log=[],stored={};let doc;
 class El{
  constructor(id,attrs={}){this.id=id;this.attrs=attrs;this.dataset={};this.children=[];this.style={setProperty(){}};this.classList={add(){},remove(){},toggle(){}};this.open=false;for(const [k,v] of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}
  set innerHTML(html){for(const child of this.children)if(child.id&&ids.get(child.id)===child)ids.delete(child.id);this._html=html;this.children=parse(html);}
  get innerHTML(){return this._html||'';}
  setAttribute(k,v){this.attrs[k]=v;}
  querySelectorAll(sel){return this.children.filter(el=>sel==='button'?el.tag==='button':sel==='[data-choice]'?'choice' in el.dataset:sel==='[data-chapter]'?'chapter' in el.dataset:false);}
  querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
  addEventListener(type,fn){this['on'+type]=fn;}
  focus(){doc.activeElement=this;}
  scrollIntoView(){}getBoundingClientRect(){return {top:90,left:0,right:800,bottom:600};}
  animate(){return {};}
  showModal(){this.open=true;}close(){this.open=false;}
 }
 function parse(html){const all=[];for(const tag of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g)){const attrs={};for(const m of tag[2].matchAll(/([\w-]+)="([^"]*)"/g))attrs[m[1]]=m[2];const el=new El(attrs.id||'',attrs);el.tag=tag[1];all.push(el);if(el.id)ids.set(el.id,el);}return all;}
 parse(fs.readFileSync(root+'index.html','utf8'));
 doc={getElementById(id){return ids.get(id)||null;},body:new El('body'),documentElement:new El('html'),addEventListener(){},hidden:false};
 const context={console,document:doc,innerWidth:1200,innerHeight:850,localStorage:{getItem(k){if(storageUnavailable)throw Error('blocked');return stored[k]||null;},setItem(k,v){if(storageUnavailable)throw Error('blocked');stored[k]=v;}},matchMedia(){return {matches:false};},setTimeout(){return 1;},clearTimeout(){},requestAnimationFrame(fn){fn();},scrollTo(){}};context.window=context;
 vm.createContext(context);for(const f of ['story.js','engine.js','app.js'])vm.runInContext(fs.readFileSync(root+f,'utf8'),context,{filename:f});
 function click(id){const el=ids.get(id);assert.equal(typeof el?.onclick,'function','handler '+id);el.onclick({preventDefault(){},stopPropagation(){},target:el});}
 function state(){return JSON.parse(stored['castaways-campaign-v2']);}
 if(storageUnavailable){assert.match(ids.get('save-state').textContent,/nedostupné/);click('continue');assert(ids.get('story-content').children.some(e=>'choice' in e.dataset));return {storageUnavailable:true};}
 let guard=0;const phases={};
 while(state().phase!=='ending'&&guard++<200){const s=state();phases[s.phase]=(phases[s.phase]||0)+1;
  if(s.phase==='decision'){const buttons=ids.get('story-content').querySelectorAll('[data-choice]');assert(buttons.length>=2);buttons[guard%buttons.length].onclick();}
  else click('continue');
  assert(!ids.get('story-content').innerHTML.includes('undefined'),'undefined rendered');
 }
 assert.equal(state().phase,'ending');assert.equal(state().choices.length,36);assert.equal(ids.get('progress-label').textContent,'36 / 36 rozhodnutí');
 click('ending-journal');assert(ids.get('modal').open);click('modal-close');click('map-button');assert(ids.get('modal-body').querySelectorAll('[data-chapter]').length===12);ids.get('modal-body').querySelectorAll('[data-chapter]')[0].onclick();click('back-map');click('modal-close');click('source-button');assert(!ids.get('modal-body').innerHTML.includes('undefined'));click('modal-close');click('undo-button');assert.equal(state().phase,'decision');assert.equal(state().choices.length,35);click('settings-button');click('setting-restart');click('restart-confirm');assert.equal(state().phase,'intro');assert.equal(state().choices.length,0);assert.equal(doc.activeElement.id,'reading');
 return {phases,decisions:36,ending:true,modalJournalMapSource:true,undo:true,restart:true};
}
console.log(JSON.stringify({normal:run(),storageBlocked:run(true),limitation:'Minimal DOM contract mock, not a browser or visual test.'},null,2));

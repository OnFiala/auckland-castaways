'use strict';
// Integration contracts against the existing DOM mock; no browser layout or focus-trap emulation.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const harnessPath=path.join(__dirname,'ui-contract.cjs');
const harness=fs.readFileSync(harnessPath,'utf8');
const cut=harness.indexOf('async function main(){');
assert(cut>0,'ui-contract harness extraction marker');
const sandbox={require:createRequire(harnessPath),__dirname,console,module:{exports:{}}};
vm.runInNewContext(harness.slice(0,cut)+'\nmodule.exports=app;',sandbox,{filename:harnessPath});
const app=sandbox.module.exports;
const engine=require('../dist/engine.js');
const KEY='castaways-adventure-v3', PREF='castaways-adventure-prefs';
function readyToFinish(){
 const s=engine.createGame();s.scene='camp';s.inventory=['prybar','axe','tinderbox','flagcloth'];
 for(const k of engine.FLAGS)s.flags[k]=true;
 s.flags.signalRaised=false;s.completed=false;s.actions=9;
 assert(engine.restore(s),'fixture must be a valid saved state');return {[KEY]:JSON.stringify(s)};
}
function inspect(el,key,shiftKey=false){let prevented=false,stopped=false;el.onkeydown({key,shiftKey,preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});return {prevented,stopped};}
test('settings expose pressed state, preserve focus after rerender and persist',async()=>{
 const a=app();a.ids.get('settings').focus();await a.click('settings');
 assert.equal(a.ids.get('toggle-captions').attrs['aria-pressed'],'false');
 assert.equal(a.ids.get('toggle-captions').attrs['aria-labelledby'],'captions-label');
 assert.equal(a.ids.get('toggle-motion').attrs['aria-labelledby'],'motion-label');
 await a.click('toggle-captions');assert.equal(a.ids.get('toggle-captions').attrs['aria-pressed'],'true');assert.equal(a.activeElement(),a.ids.get('toggle-captions'));
 await a.click('toggle-motion');assert.equal(a.ids.get('toggle-motion').attrs['aria-pressed'],'true');assert.equal(a.activeElement(),a.ids.get('toggle-motion'));
 assert.deepEqual(JSON.parse(a.stored[PREF]),{captions:true,reduced:true,narration:false});
 const b=app({initial:a.stored});await b.click('settings');assert.equal(b.ids.get('toggle-captions').attrs['aria-pressed'],'true');assert.equal(b.ids.get('toggle-motion').attrs['aria-pressed'],'true');
 await b.click('toggle-captions');await b.click('toggle-motion');assert.equal(b.ids.get('toggle-motion').attrs['aria-pressed'],'false');assert.equal(b.ids.get('toggle-captions').attrs['aria-pressed'],'false');
});
test('hint text remains present for assistive technology when captions default off',async()=>{
 const a=app();await a.click('hint');assert.match(a.ids.get('modal-body').innerHTML,/<p class="sr-only">Look through the driftwood by the water\.<\/p>/);
 await a.click('modal-close');await a.click('settings');await a.click('toggle-captions');await a.click('modal-close');await a.click('hint');
 assert.match(a.ids.get('modal-body').innerHTML,/<p class="small">Look through the driftwood by the water\.<\/p>/);
 const css=fs.readFileSync(path.join(__dirname,'../dist/interface.css'),'utf8');assert.match(css,/\.sr-only\s*\{[^}]*clip:/);
});
test('Shift+F10 and ContextMenu inspect without using selected item',async()=>{
 const a=app();await a.pick('rope');await a.click(a.item('rope'));const before=a.state();
 let item=a.item('rope');item.focus();assert.deepEqual(inspect(item,'F10',true),{prevented:true,stopped:true});assert.equal(a.item('rope').attrs['aria-pressed'],'true');assert.deepEqual(a.state(),before);assert.equal(a.activeElement(),item);
 const target=a.target('pole');target.focus();assert.deepEqual(inspect(target,'ContextMenu'),{prevented:true,stopped:true});await a.flush();
 assert.deepEqual(a.state(),before);assert.equal(a.item('rope').attrs['aria-pressed'],'true');assert.equal(a.ids.get('cancel-item').hidden,false);assert.equal(a.activeElement(),target);
});
test('completion focus, exploration and restart return focus to scene',async()=>{
 const a=app({initial:readyToFinish()});await a.use('flagcloth','cairn');assert(a.state().completed);a.runTimers();
 assert.equal(a.ids.get('completion').hidden,false);assert.equal(a.activeElement(),a.ids.get('keep-exploring'));
 await a.click('keep-exploring');assert(a.ids.get('completion').hidden);assert.equal(a.activeElement(),a.ids.get('scene'));
 const b=app({initial:readyToFinish()});await b.use('flagcloth','cairn');b.runTimers();b.ids.get('new-game').focus();await b.click('new-game');assert(b.ids.get('modal').open);await b.click('confirm-restart');
 assert(!b.state().completed);assert.equal(b.state().scene,'beach');assert.equal(b.ids.get('completion').hidden,true);assert.equal(b.activeElement(),b.ids.get('scene'));
});
test('decorative mounts are inert and keep surrounding controls intact',()=>{
 const ui=require('../dist/interface.js');const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
 const paintingTags=[...html.matchAll(/<([^>]+\bdata-ui-painting="[^"]+"[^>]*)>([\s\S]*?)<\/([^>]+)>/g)];assert(paintingTags.length>0);
 for(const m of paintingTags){assert.match(m[1],/^(span|div)\b/);assert.equal(m[2],'');assert.equal(m[3],m[1].split(/\s/)[0]);}
 let clicks=0;const control={onclick(){clicks++;}};
 const material={dataset:{material:'dialog-paper'},children:[control],innerHTML:'<button>Control</button>',insertAdjacentHTML(_where,value){this.innerHTML=value+this.innerHTML;}};
 const paint={dataset:{uiPainting:'brass-button'},innerHTML:''};const doc={querySelectorAll(q){return q==='[data-material]'?[material]:q==='[data-ui-painting]'?[paint]:[];}};
 const original=control.onclick;ui.mount(doc);const once=material.innerHTML;ui.mount(doc);assert.equal(material.innerHTML,once);assert.equal(material.children[0],control);assert.equal(control.onclick,original);control.onclick();assert.equal(clicks,1);
 assert.match(material.innerHTML,/aria-hidden="true"/);assert.match(paint.innerHTML,/aria-hidden="true"/);assert.match(paint.innerHTML,/focusable="false"/);
 assert(!/\b(?:onclick|onkeydown|tabindex)\s*=/.test(material.innerHTML+paint.innerHTML));
});
test('completion waits for open settings to close; restart cancels the pending finale',async()=>{
 const a=app({initial:readyToFinish()});await a.use('flagcloth','cairn');await a.click('settings');a.ids.get('toggle-captions').focus();a.runTimers();
 assert(a.ids.get('modal').open);assert(a.ids.get('completion').hidden);assert.equal(a.activeElement(),a.ids.get('toggle-captions'));
 await a.click('modal-close');assert(!a.ids.get('modal').open);assert(!a.ids.get('completion').hidden);assert.equal(a.activeElement(),a.ids.get('keep-exploring'));
 const b=app({initial:readyToFinish()});await b.use('flagcloth','cairn');await b.click('settings');b.runTimers();await b.click('restart');await b.click('confirm-restart');
 assert(!b.state().completed);assert(b.ids.get('completion').hidden);assert.equal(b.activeElement(),b.ids.get('scene'));b.runTimers();assert(b.ids.get('completion').hidden);
});
test('invalid saved game does not discard valid accessibility preferences',async()=>{
 const a=app({initial:{[KEY]:'{bad json',[PREF]:JSON.stringify({captions:true,reduced:true})}});assert.equal(a.state().scene,'beach');
 await a.click('settings');assert.equal(a.ids.get('toggle-captions').attrs['aria-pressed'],'true');assert.equal(a.ids.get('toggle-motion').attrs['aria-pressed'],'true');
});
test('Henry suggests tinderbox when dry fuel is already in the hearth',async()=>{
 const initial=readyToFinish(),s=JSON.parse(initial[KEY]);s.flags.fireLit=false;initial[KEY]=JSON.stringify(s);assert(engine.restore(s));
 const advice=engine.interact(s,'henry','talk');assert.equal(advice.cue,'tinderbox');
 const art=require('../dist/art.js'),a=app({initial});await a.click(a.target('henry'));
 assert.equal(a.ids.get('caption').textContent,advice.text);assert(a.ids.get('thought').innerHTML.includes(`viewBox="${art.props.tinderbox.box.join(' ')}"`));
});
test('conversation advances, closes on Escape, and is dismissed on travel',async()=>{
 const a=app();await a.click(a.target('raynal'));assert.equal(a.ids.get('dialogue').hidden,false);assert.equal(a.ids.get('dialogue-speaker').textContent,'François Raynal');assert.equal(a.ids.get('dialogue-progress').textContent,'1 / 3');
 await a.click('dialogue-next');assert.equal(a.ids.get('dialogue-progress').textContent,'2 / 3');
 a.key('Escape');assert.equal(a.ids.get('dialogue').hidden,true);a.runTimers();assert.equal(a.ids.get('dialogue').hidden,true);
 await a.click(a.target('raynal'));await a.travel('exit_camp');assert.equal(a.ids.get('dialogue').hidden,true);a.runTimers();assert.equal(a.ids.get('dialogue').hidden,true);
});
test('conversation timers advance and finish, while the speaker stays in place',async()=>{
 const a=app();for(let i=0;i<4;i++)await a.flush();await a.click(a.target('raynal'));
 const actor=a.ids.get('person-raynal'),x=actor.style.left;await a.flush();await a.flush();assert.equal(actor.style.left,x);
 a.runTimers();assert.equal(a.ids.get('dialogue-progress').textContent,'2 / 3');a.runTimers();assert.equal(a.ids.get('dialogue-progress').textContent,'3 / 3');a.runTimers();assert(a.ids.get('dialogue').hidden);
});
test('saved reduced-motion preference stops incidental displacement',async()=>{
 const a=app({initial:{[PREF]:JSON.stringify({reduced:true})}});await a.flush();const actor=a.ids.get('person-raynal'),x=actor.style.left;
 assert.match(x,/%$/);for(let i=0;i<8;i++)await a.flush();assert.equal(actor.style.left,x);
});

test('English device narration is opt-in and stale speech cannot reopen a conversation',async()=>{
 const spoken=[];let canceled=0;const speech={synth:{getVoices:()=>[{lang:'en-GB',name:'Test voice'}],speak:u=>spoken.push(u),cancel:()=>canceled++},Utterance:function(text){this.text=text;}};
 const a=app({speech});await a.click(a.target('raynal'));assert.equal(spoken.length,0);await a.click('dialogue-close');
 await a.click('settings');assert(a.ids.get('toggle-narration'));await a.click('toggle-narration');assert.equal(JSON.parse(a.stored[PREF]).narration,true);await a.click('modal-close');
 await a.click(a.target('raynal'));assert.equal(spoken.length,1);assert.equal(spoken[0].lang,'en-GB');assert.equal(spoken[0].voice.lang,'en-GB');assert.match(spoken[0].text,/illness/);
 const end=spoken[0].onend;await a.click('dialogue-close');end();a.runTimers();assert(a.ids.get('dialogue').hidden);assert(canceled>0);
});


test('resting crew stay at work and their decoded image survives conversation',async()=>{
 const a=app();await a.flush();const actor=a.ids.get('person-raynal'),canvas=a.ids.get('actor-raynal'),picture=canvas.querySelector('image'),viewport=canvas.querySelector('.walk-viewport'),x=actor.style.left;
 assert(picture);for(let i=0;i<4;i++)await a.flush();assert.equal(actor.style.left,x);
 assert.equal(canvas.querySelector('image'),picture);assert.equal(canvas.querySelector('.walk-viewport'),viewport);
 await a.click(a.target('raynal'));await a.click('dialogue-close');await a.flush();assert.equal(canvas.querySelector('image'),picture);assert.equal(actor.style.left,x);
});
test('recovering the canvas prompts one short move, then Raynal stays there',async()=>{
 const a=app();await a.flush();const actor=a.ids.get('person-raynal'),canvas=a.ids.get('actor-raynal'),picture=canvas.querySelector('image');
 await a.pick('rope');await a.pick('pole');await a.click(a.item('rope'));await a.click(a.item('pole'));await a.use('loopPole','sail');await a.flush();
 assert.equal(actor.style.left,'75%');assert.equal(canvas.querySelector('image'),picture);
 for(let i=0;i<4;i++)await a.flush();assert.equal(actor.style.left,'75%');
 const b=app({initial:a.stored});await b.flush();assert.equal(b.ids.get('person-raynal').style.left,'75%');
});
test('approaching a speaker from the right does not cross through him',async()=>{
 const a=app();await a.travel('exit_camp');await a.travel('exit_beach_camp');await a.click(a.target('raynal'));
 assert.equal(a.ids.get('player').style.left,'87%');assert.equal(a.ids.get('dialogue').hidden,false);
});


test('lighting the fire and raising the signal preserve the companion image and position',async()=>{
 const initial=readyToFinish(),state=JSON.parse(initial[KEY]);state.flags.fireLit=false;initial[KEY]=JSON.stringify(state);
 const a=app({initial});await a.flush();const button=a.ids.get('person-george'),canvas=a.ids.get('actor-george'),image=canvas.querySelector('image'),x=button.style.left;
 await a.use('tinderbox','hearth');assert(a.state().flags.fireLit);await a.use('flagcloth','cairn');
 assert.equal(a.ids.get('person-george'),button);assert.equal(a.ids.get('actor-george'),canvas);assert.equal(canvas.querySelector('image'),image);assert.equal(button.style.left,x);
});

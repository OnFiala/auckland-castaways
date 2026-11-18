'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const dist=path.resolve(__dirname,'../dist');
const weather=require('../dist/weather.js');
const engine=require('../dist/voyage.js');
const landscape=require('../dist/landscape.js');

function fixture({motion=false,context=true,world=null}={}) {
  let reduced=motion,frameNumber=0,clock=1000,draws=0,timerId=0,pausedDialog=false,bodyReduced=false,paintedSoles=0;
  const timers=new Map(),frames=new Map(),errors=[],handlers=new Map(),mutations=[],resizes=[];
  const css={};
  const ctx=new Proxy({},{
    get(obj,key) {
      if(key==='createRadialGradient')return ()=>({addColorStop(){}});
      if(key==='clearRect')return ()=>{draws++;paintedSoles=0;};
      if(key==='fill')return ()=>{if(ctx.fillStyle==='#5a4e42'||ctx.fillStyle==='#554c45')paintedSoles++;};
      if(key in obj)return obj[key];
      return (...args)=>{if(args.some(a=>typeof a==='number'&&!Number.isFinite(a)))errors.push(key);};
    }
  });
  const document={hidden:false,body:{},
    createElement: type=>type==='canvas'?{width:300,height:150,getContext:()=>context?ctx:null}:{style:{}},
    addEventListener:(name,listener)=>handlers.set(name,listener),
    removeEventListener:name=>handlers.delete(name),
    querySelector:()=>pausedDialog?{}:null,querySelectorAll:()=>[]};
  const root={ownerDocument:document,dataset:{},isConnected:true,children:[],style:css,
    getBoundingClientRect:()=>({width:1600}),closest:name=>name==='.reduced'&&bodyReduced?{}:null,
    setAttribute(){},replaceChildren(...children){this.children=children;}};
  const media={get matches(){return reduced;},
    addEventListener:(name,listener)=>handlers.set('media',listener),removeEventListener:()=>handlers.delete('media')};
  const host={
    CastawayWorld:world,CastawayLandscape:landscape,devicePixelRatio:2,matchMedia:()=>media,
    setTimeout(fn){timers.set(++timerId,fn);return timerId;},clearTimeout(id){timers.delete(id);},
    requestAnimationFrame(fn){frames.set(++frameNumber,fn);return frameNumber;},cancelAnimationFrame(id){frames.delete(id);},
    MutationObserver:class {constructor(fn){mutations.push(fn);}observe(){}disconnect(){}},
    ResizeObserver:class {constructor(fn){resizes.push(fn);}observe(){}disconnect(){}}
  };
  vm.runInNewContext(fs.readFileSync(path.join(dist,'weather.js'),'utf8'),{window:host});
  function tick() {
    for(const [id,fn] of [...timers]){timers.delete(id);fn();}
    for(const [id,fn] of [...frames]){frames.delete(id);clock+=63;fn(clock);}
  }
  return {root,errors,tick,document,handlers,weather:host.CastawayWeather,
    draw:(scene,flags={})=>{const state={scene,flags};host.CastawayWeather.render(root,state);return state;},
    hide(hidden){document.hidden=hidden;handlers.get('visibilitychange')();},
    reduced(on){reduced=on;handlers.get('media')();},
    pref(on){bodyReduced=on;mutations.forEach(f=>f());},
    dialog(open){pausedDialog=open;mutations.forEach(f=>f());},
    get draws(){return draws;},get paintedSoles(){return paintedSoles;},get pending(){return timers.size+frames.size;}};
}

test('fourteen room weather models use bounded local fields on one transparent canvas',()=>{
  const summary=new Set();
  for(const scene of engine.SCENES) {
    const state={scene:scene.id,flags:{}}, m=weather.describe(state);
    assert.equal(m.chapter,scene.chapter);
    assert.ok(m.zones.length && m.season && m.weather);
    assert.ok(m.wind>0 && m.slant>0);
    assert.equal(new Set(m.zones.map(z=>z.id)).size,m.zones.length);
    let count=0;
    for(const field of m.zones){
      assert.ok(field.points.length>=3);
      let area=0;
      for(let i=0;i<field.points.length;i++){
        const [x,y]=field.points[i],[u,v]=field.points[(i+1)%field.points.length];
        assert.ok(x>=0&&x<=100&&y>=0&&y<=100);area+=x*v-u*y;
      }
      assert.ok(Math.abs(area)/2<2800,scene.id+' full-frame weather');
      count+=field.count;summary.add(field.medium);
    }
    assert.ok(count<=110);
    const r=fixture();r.draw(scene.id);r.tick();r.tick();
    assert.equal(r.errors.length,0);
    assert.equal(r.root.children.length,1);
    assert.equal(r.root.children[0].className,'wx-particles');
    assert.equal(r.root.dataset.landscape,'ready');

  }
  assert.deepEqual([...summary].sort(),['after-rain','rain','sleet','snow']);
});

test('enclosed rooms receive external precipitation only in the painted openings',()=>{
  for(const room of ['cabin','return_camp','chartroom','forge']){
    const m=weather.describe({scene:room,flags:{}});
    assert.ok(m.indoor);
    if(room==='forge'){
      assert.equal(m.zones.length,1);
      assert.ok(m.zones[0].points.every(([x,y])=>x>=2&&x<11&&y>=16&&y<=58));
    }else{
      assert.equal(m.zones.length,4);
      for(const z of m.zones)assert.ok(z.points.every(([x,y])=>x>=3&&x<=29&&y>=9.5&&y<=38));
      for (const [i,a] of m.zones.entries())for(const b of m.zones.slice(i+1)){
        const [ax,ay]=a.points[0],[ar,ab]=a.points[2],[bx,by]=b.points[0],[br,bb]=b.points[2];
        assert.ok(ar<bx||br<ax||ab<by||bb<ay,'mullion gap');
      }
    }
  }
});

test('closing a roof redirects rain and equipment controls response without calming the offshore wind',()=>{
  const describe=(scene,flags={})=>weather.describe({scene,flags});
  const effect=(m,id)=>m.effects.find(e=>e.id===id);
  const open=describe('camp'), built=describe('camp',{shelterBuilt:true});
  assert.ok(open.zones.some(z=>z.id==='through the bare frame'));
  assert.ok(!built.zones.some(z=>z.id==='through the bare frame'));
  assert.ok(effect(built,'runoff at the low eave'));assert.equal(open.wind,built.wind);
  const wet=describe('cabin'),sealed=describe('cabin',{roofSealed:true}),warm=describe('cabin',{roofSealed:true,warmthReady:true});
  assert.match(wet.weather,/seam to the pan/);assert.match(sealed.weather,/seam holds/);
  assert.deepEqual(wet.effects,[],'the roof workplate itself owns its drop and pan');
  assert.equal(warm.shelter,'warm and sealed');
  const loose=describe('crossing'),fast=describe('crossing',{rigSecured:true}),dry=describe('crossing',{rigSecured:true,boatDry:true,sailMended:true});
  assert.notEqual(loose.rig,fast.rig);assert.equal(loose.wind,dry.wind);
  assert.ok(loose.ground.length&&!dry.ground.length);assert.ok(effect(dry,'water beading in the seam'));
  assert.notEqual(describe('landing').rig,describe('landing',{boatMoored:true}).rig);
});

test('render retains its bounded canvas and weather clock across unrelated commits',()=>{
  const f=fixture();f.draw('beach');
  const canvas=f.root.children[0],initial=f.draws;
  assert.equal(canvas.width,1152); assert.equal(canvas.height,648);
  f.draw('beach',{ropeTaken:true});
  assert.equal(f.draws,initial);
  f.tick();assert.ok(f.draws>initial);assert.equal(f.pending,1);
  f.draw('crossing');assert.equal(f.root.children[0],canvas);
  const tied=f.draw('crossing',{rigSecured:true});assert.equal(f.weather.respond(f.root,tied,'bilge'),false);
  assert.equal(f.weather.respond(f.root,tied,'rigging'),true);assert.equal(f.weather.respond(f.root,tied,'rigging'),false);
  const before=JSON.stringify(tied);f.tick();assert.equal(JSON.stringify(tied),before);
  f.weather.dispose(f.root);assert.equal(f.pending,0);assert.equal(f.root.children.length,0);assert.equal(f.handlers.size,0);
});

test('hidden, paused, and either reduced-motion preference stop scheduling; returning never replays a storm',()=>{
  const f=fixture();
  f.draw('forest');f.tick();assert.equal(f.pending,1);
  f.hide(true);const quiet=f.draws;assert.equal(f.pending,0);f.tick();assert.equal(f.draws,quiet);
  f.hide(false);assert.equal(f.pending,1);
  f.dialog(true);assert.equal(f.pending,0);f.dialog(false);assert.equal(f.pending,1);
  f.reduced(true);assert.equal(f.pending,0);assert.equal(f.root.dataset.wxStill,'true');
  f.draw('forge',{bellowsFitted:true});const lit=f.draw('forge',{bellowsFitted:true,forgeLit:true});
  assert.ok(f.weather.respond(f.root,lit,'furnace'));assert.equal(f.pending,0);
  f.reduced(false);assert.equal(f.pending,1);f.pref(true);assert.equal(f.pending,0);
  f.pref(false);assert.equal(f.pending,1);
  const fallback=fixture({context:false});fallback.draw('beach');
  assert.equal(fallback.pending,0);assert.equal(fallback.root.dataset.landscape,'still');
});

test('foot contact only marks a matching ground patch and dissolves as the water is bailed',()=>{
  const f=fixture(),step=(s,x,y)=>f.weather.footfall(f.root,s,x,y);
  let s=f.draw('forest');assert.ok(step(s,28,73));assert.ok(!step(s,85,80));
  assert.ok(!step(s,28,73),'resting on one foot must not stamp a second mark');
  assert.ok(!step(s,NaN,73));
  for(const room of ['forge','cabin','chartroom','return_camp']){
    s=f.draw(room);assert.ok(!step(s,28,73),room);assert.equal(f.paintedSoles,0);
  }
  s=f.draw('crossing',{rigSecured:true});assert.ok(step(s,65.3,81.1));assert.ok(!step(s,16,85));
  s=f.draw('crossing',{rigSecured:true,boatDry:true});assert.ok(!step(s,65.3,81.1));
  s=f.draw('landing');assert.ok(step(s,32,68));
  f.pref(true);assert.ok(!step(s,33,68));assert.equal(f.paintedSoles,0);
  f.pref(false);f.hide(true);assert.ok(!step(s,34,68));
});

test('short-lived tracks are capped at twelve, then fade without changing a save',()=>{
  const f=fixture(), s=f.draw('beach'),original=JSON.stringify(s);
  for(let i=0;i<18;i++)assert.ok(f.weather.footfall(f.root,s,10+i,76));
  assert.equal(f.paintedSoles,24,'twelve toe and heel pairs');
  for(let i=0;i<48;i++)f.tick();
  assert.equal(f.paintedSoles,0);
  assert.equal(JSON.stringify(s),original);
});

test('geometry survives unrelated plate changes without loading or copying images',()=>{
  let lookups=0;
  const f=fixture({world:{background(){lookups++;throw Error('unexpected plate access');}}});
  f.draw('beach');
  const draws=f.draws;
  f.draw('beach',{canvasRecovered:true});
  assert.equal(f.draws,draws);assert.equal(lookups,0);
  assert.equal(f.root.children.length,1);assert.equal(f.root.dataset.landscape,'ready');
  f.draw('camp',{shelterBuilt:true});assert.equal(f.root.dataset.landscape,'ready');assert.equal(lookups,0);
});

test('the chapter clock changes the watch independently of the hands, and survives doors and pauses',()=>{
  const model=fixture(),w=model.weather;
  model.draw('crossing');const departure=model.root.dataset.wxPhase;
  assert.match(departure,/lee/);
  for(let i=0;i<600;i++)model.tick();
  const squall=model.root.dataset.wxPhase;
  assert.match(squall,/squall/);
  const dry=model.draw('crossing',{rigSecured:true,boatDry:true});
  assert.equal(model.root.dataset.wxPhase,squall);assert.match(w.caption(model.root,dry),/Bare boards/);
  model.dialog(true);for(let i=0;i<300;i++)model.tick();assert.equal(model.root.dataset.wxPhase,squall);
  model.dialog(false);for(let i=0;i<500;i++)model.tick();assert.match(model.root.dataset.wxPhase,/rain lifts/);
  model.draw('forest');for(let i=0;i<570;i++)model.tick();
  const winter=model.root.dataset.wxPhase;
  model.draw('cabin',{roofSealed:true});assert.equal(model.root.dataset.wxPhase,winter);
  assert.match(winter,/Sleet/);
  const restored=fixture();restored.draw('crossing',{rigSecured:true,boatDry:true});
  assert.match(restored.root.dataset.wxPhase,/squall/);
  restored.draw('landing',{boatMoored:true});assert.match(restored.root.dataset.wxPhase,/light enough/);
});

test('dry intervals last through more than one wave; crossing holds its gale and rescue holds its window',()=>{
  const at=weather.conditions;
  for(let i=0;i<7;i++){
    let clean=0,best=0,previous;
    for(let t=0;t<220;t+=.25){
      const now=at(i+1,t);
      assert.ok(now.wind>0&&now.rain>=0&&now.rain<=1&&now.shade>=0&&now.shade<=1);
      if(previous)for(const field of ['rain','shade','wind'])assert.ok(Math.abs(now[field]-previous[field])<.09,'gradual sky at '+[i,t,field]);
      clean=now.rain<.005?clean+.25:0;best=Math.max(best,clean);
      previous=now;
    }
    assert.ok(best>=15,'sustained clear interval in chapter '+(i+1));
  }
  assert.ok(at(5,2).wind<at(5,44).wind&&at(5,44).shade>at(5,2).shade);
  for(const t of [77,125,150,199,387])assert.ok(at(5,t).wind>1,'the gale remains');
  for(const t of [31,61,127,488])assert.equal(at(7,t).rain,0,'no storm restarts on the landing');
});

test('airborne sleet, rain and light snow all travel leeward while glass drops run vertically',()=>{
  const p={u:.6,v:.5};
  for(const scene of ['forest','crossing']){
    const m=weather.describe({scene,flags:{}});
    assert.equal(m.direction,scene==='crossing'?-1:1);
    for(const k of ['snow','rain','after-rain']){
      const v=weather.velocity(k,p,.6,m,.92);
      assert.ok(v.vy>0);assert.equal(Math.sign(v.vx),k==='after-rain'?0:m.direction);
      assert.ok(Math.abs(weather.velocity(k,p,.6,m,1.14).vx)>=Math.abs(v.vx));
    }
    assert.ok(weather.velocity('rain',p,1.18,m,.92).vy>weather.velocity('rain',p,.44,m,.92).vy);
    for(const layer of landscape.describe({scene,flags:{}}))assert.equal(layer.windSign||1,m.direction);
  }
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dist = path.resolve(__dirname, '../dist');
const engine = require('../dist/voyage.js');
const art = require('../dist/voyage-art.js');
const paintingSize = require('./painting-size.cjs');

function fixture() {
  let reduced=false, covered=false, supportsCanvas=true, nextId=0;
  const frames=new Map(), timers=new Map(), calls=[];
  const ctx=new Proxy({}, {
    get(target,key) {
      if(key in target) return target[key];
      return (...args)=>calls.push([key,...args]);
    }
  });
  const doc={createElement:tag=>new Node(tag),querySelector:()=>covered,hidden:false};
  class Node {
    constructor(tag) {this.tag=tag;this.children=[];this.ownerDocument=doc;this.style={};this.dataset={};}
    setAttribute(k,v) {this[k]=v;}
    append(n) {this.children.push(n);n.parent=this;}
    replaceChildren(n) {this.children=[];this.append(n);}
    remove() {if(this.parent) this.parent.children=this.parent.children.filter(n=>n!==this);}
    closest() {return null;}
    getContext() {return supportsCanvas?ctx:null;}
  }
  const root=new Node('div');
  const host={
    AdventureArt: art,
    matchMedia:()=>({matches:reduced}),
    setTimeout:cb=>{timers.set(++nextId,cb);return nextId;},clearTimeout:id=>timers.delete(id),
    requestAnimationFrame:cb=>{frames.set(++nextId,cb);return nextId;},cancelAnimationFrame:id=>frames.delete(id)
  };
  vm.runInNewContext(fs.readFileSync(path.join(dist,'stage-life.js'),'utf8'),{window:host});
  const life=host.CastawayLife;
  function draw(scene,flags={}) {const s={scene,flags};life.render(root,s);return s;}
  function step(ms) {const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(ms));}
  function finish() {const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}
  const detail=id=>root.children[0].children.find(n=>n.dataset.life===id);
  return {draw,detail,step,finish,root,doc,calls,ctx,frames,timers,life,
    reduce:()=>{reduced=true;},cover:v=>{covered=v;},noCanvas:()=>{supportsCanvas=false;}};
}

test('all foreground surfaces and state marks are bounded and independent of the background',()=>{
  const f=fixture();
  const assets=new Set();
  for(const scene of engine.SCENES) {
    for(const flags of [{},Object.fromEntries(engine.FLAGS.map(key=>[key,true]))]) {
      const state=f.draw(scene.id,flags), parts=f.root.children[0].children;
      const [feature]=f.life.features(state);
      if(feature){
        const surface=f.detail(feature.id);
        if (surface.tag==='canvas') assert.ok(surface.width>0 && surface.height>0);
        else {
          assert.equal(surface.className,'life-tactile');
          const strip=surface.children.at(-1);
          assert.equal(strip.className,'life-strip'); assert.equal(strip.style.left,'0%');
          for(const image of surface.children) assets.add(image.src);
          const [w,h]=paintingSize(fs.readFileSync(path.join(dist,strip.src)));
          assert.ok(Math.abs((w/9/h)/(feature.materialBox[2]/feature.materialBox[3]*16/9)-1)<.01);
        }
      }
      assert.equal(parts.length,new Set(parts.map(n=>n.dataset.life)).size);
      for(const part of parts) {
        const [x,y,w,h]=Array.from(part.style.cssText.matchAll(/(?:left|top|width|height):([.\d]+)%/g),m=>Number(m[1]));
        assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=100&&y+h<=100,scene.id+'/'+part.dataset.life);
        assert.doesNotMatch(part.style.cssText,/url\(|background|clip-path/);
        for(const match of (part.innerHTML||'').matchAll(/(?:href|src)="([^"]+)"/g)) assets.add(match[1]);
      }
    }
  }
  for(const asset of assets) {
    if (asset!=='assets/tidepaint/details/fitted-strake.webp') assert.doesNotMatch(asset,/scene|tidepaint|states/);
    assert.ok(fs.existsSync(path.join(dist,asset)),asset);
  }
  assert.equal(f.frames.size,0,'the resting material has no permanent foreground clock');
  assert.ok(!f.calls.some(([op])=>op==='drawImage'||op==='getImageData'));
});

test('state marks survive repeated inventory draws and an unfinished build',()=>{
  const f=fixture();
  f.draw('cabin');assert.ok(!f.detail('leaking-seam'),'the pan owns its only drip');assert.ok(!f.detail('warming-water'));
  f.draw('cabin',{roofSealed:true,waterStored:true});assert.ok(!f.detail('leaking-seam'));assert.ok(!f.detail('warming-water'));
  f.draw('cabin',{roofSealed:true,waterStored:true,warmthReady:true});assert.ok(f.detail('warming-water'));
  f.draw('slipway',{hullPlanked:true});assert.ok(f.detail('plank-on-stocks'));assert.ok(!f.detail('caulked-seam'));
  f.draw('slipway',{hullPlanked:true,boatSealed:true});assert.ok(f.detail('caulked-seam'));
  f.draw('slipway',{hullPlanked:true,boatSealed:true,sailRigged:true});assert.ok(!f.detail('plank-on-stocks'));
  f.draw('crossing',{rigSecured:true});assert.ok(f.detail('secured-shroud'));
  f.draw('landing',{boatMoored:true});assert.ok(f.detail('mooring-line'));
  f.draw('forge',{forgeFueled:true});const charcoal=f.detail('charcoal-bed');
  const fitting=f.draw('forge',{forgeFueled:true,bellowsFitted:true});
  f.life.work(f.root,fitting,'furnace');assert.equal(f.root.children[1].dataset.life,'work-bellowsFitted');
  f.life.work(f.root,fitting,'furnace');assert.equal(f.timers.size,1);
  const lit=f.draw('forge',{...fitting.flags,forgeLit:true});
  f.life.work(f.root,lit,'furnace');assert.equal(f.root.children[1].dataset.life,'work-forgeLit');
  assert.ok(!f.detail('charcoal-bed'),'the lit forge plate supplies the hot coals');
  const handle=f.detail('bellows_handle');f.draw('forge',{...lit.flags});assert.equal(f.detail('bellows_handle'),handle);
  f.finish();assert.equal(f.root.children.length,1);assert.equal(charcoal.dataset.life,'charcoal-bed');
  f.life.tryFeature(f.root,lit,'bellows_handle');assert.equal(f.root.children[1].dataset.life,'fresh-air-in-coals');
  f.draw('forge',{bellowsFitted:true});const cold=f.draw('forge',{bellowsFitted:true});
  f.life.tryFeature(f.root,cold,'bellows_handle');assert.equal(f.root.children[1].dataset.life,'dust-at-tuyere');
  f.finish();
  f.reduce();f.draw('chartroom');const charted=f.draw('chartroom',{rescueRoute:true});
  f.life.work(f.root,charted,'chartTable');assert.equal(f.timers.size,0);assert.ok(f.detail('pencilled-course'));
});

test('each material has distinct geometry on contact, without reading any pixels',()=>{
  const f=fixture();
  function strokes(id,t,flags) {
    f.calls.length=0; assert.equal(f.life.paintMaterial(f.ctx,id,t,flags),true);
    const commands=f.calls.filter(([op])=>['moveTo','lineTo','bezierCurveTo','ellipse','translate','rotate'].includes(op));
    for(const [, ...args] of commands) assert.ok(args.every(Number.isFinite),id);
    assert.ok(commands.length>=2,id);
    assert.ok(!f.calls.some(([op])=>['drawImage','getImageData','putImageData'].includes(op)),id);
    return commands;
  }
  for(const scene of engine.SCENES){
    const flags={bellowsFitted:true}, [feature]=f.life.features({scene:scene.id,flags});
    const state=f.draw(scene.id,flags);
    const surface=f.detail(feature.id);
    if(surface.className==='life-tactile') {
      const strip=surface.children.at(-1), support=surface.children[0], origin=surface.style.cssText;
      assert.equal(f.frames.size,0); assert.equal(strip.style.left,'0%');
      f.life.tryFeature(f.root,state,feature.id); f.step(0); f.step(570);
      assert.equal(strip.style.left,'-800%'); assert.equal(surface.style.cssText,origin);
      if(support!==strip) assert.equal(support.style.left,undefined,'the trestle is stationary');
      f.step(1600); assert.equal(strip.style.left,'0%'); assert.equal(f.frames.size,0);
      continue;
    }
    const rest=strokes(feature.id,0,flags);
    assert.notDeepEqual(rest,strokes(feature.id,.38,flags),feature.id);
    assert.deepEqual(rest,strokes(feature.id,0,flags),'deterministic '+feature.id);
  }
  const secured=f.draw('crossing',{rigSecured:true});
  f.life.tryFeature(f.root,secured,'mast_turns'); f.step(0); f.step(550);
  assert.equal(f.detail('mast_turns').children.at(-1).style.left,'-200%','only a small movement remains after securing');
});

test('touch restarts only its own animation, yields a reduced still and cancels on room or visibility changes',()=>{
  const f=fixture();const state=f.draw('forest'), id='runnel_shaving';
  const before=JSON.stringify(state);const obs=f.life.tryFeature(f.root,state,id);assert.match(obs,/shaving/);
  f.step(0);f.step(300);assert.equal(f.frames.size,1);
  f.life.tryFeature(f.root,state,id);assert.equal(f.frames.size,1);
  f.cover(true);f.step(700);assert.equal(f.frames.size,0);
  f.life.tryFeature(f.root,state,id);assert.equal(f.frames.size,0);
  f.cover(false);f.life.tryFeature(f.root,state,id);assert.equal(f.frames.size,1);
  f.draw('beach');assert.equal(f.frames.size,0);
  f.draw('forest');f.life.tryFeature(f.root,state,id);f.step(1000);f.reduce();f.step(1030);
  assert.equal(f.frames.size,0);assert.equal(f.timers.size,1);f.finish();
  assert.equal(f.life.tryFeature(f.root,state,id),obs);assert.equal(f.frames.size,0);assert.equal(f.timers.size,1);
  f.finish();f.doc.hidden=true;assert.equal(f.life.tryFeature(f.root,state,id),obs);assert.equal(f.timers.size,0);
  assert.equal(JSON.stringify(state),before);
  const missing=fixture();missing.noCanvas();
  assert.match(missing.life.tryFeature(missing.root,missing.draw('forest'),id),/shaving/);
  assert.equal(missing.frames.size,0);assert.equal(missing.root.children[0].children.length,1);
});

test('work feedback has a static reduced view and pauses behind a dialog',()=>{
  const css=fs.readFileSync(path.join(dist,'stage-life.css'),'utf8');
  assert.doesNotMatch(css,/background-image|url\(|--life-plate|clip-path|life-paint/);
  assert.match(css,/body:has\(dialog\[open\]\) #place-life \*[^{]+\{ animation-play-state: paused;/);
  assert.match(css,/\.reduced #place-life \* \{ animation: none !important;/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)[\s\S]+#place-life \* \{ animation: none !important;/);
  const keys=new Set(Array.from(css.matchAll(/@keyframes ([\w-]+)/g),m=>m[1]));
  for(const [,name]of css.matchAll(/animation:\s*(life-[\w-]+)/g))assert.ok(keys.has(name),name);
});

test('optional gestures touch the visible spot from the walk polygon, clear of mandatory object centres', () => {
  const stage = require('../dist/stage-direction.js');
  const poses = require('../dist/work-poses.js');
  const f = fixture(), flags = {bellowsFitted: true};
  const ids = new Set();
  for (const scene of engine.SCENES) {
    const state = {scene:scene.id, flags};
    for (const feature of f.life.features(state)) {
      const {id, x, y, w, h, approach, pose, contact} = feature;
      assert.ok(!ids.has(id), id);
      ids.add(id);
      assert.equal(feature.kind, 'feature');
      assert.equal(feature.paint, false);
      assert.ok(w > 0 && w <= 9 && h > 0 && h <= 11);
      const floor = stage.groundPoint(scene.id, approach.x, approach.y);
      assert.ok(Math.hypot(floor.x-approach.x, floor.y-approach.y) < .14, id+' floor');
      const size = stage.heightAt(scene.id, floor.y);
      const hand = poses.contact(scene.chapter >= 6 ? 'musgrave' : 'player', pose);
      const facing = Math.sign(contact.x-floor.x);
      const error = Math.hypot((floor.x + facing*9/16*hand.x*size - contact.x)*16/9,
                               floor.y - hand.y*size - contact.y);
      assert.ok(error / size < .018, id+' hand');
      for (const obj of scene.targets.filter(t => t.kind !== 'person')) {
        assert.notEqual(obj.id, id);
        const target = stage.stageTarget(scene.id, obj, state);
        assert.ok(Math.abs(x-target.x) > (w+target.w)/2 || Math.abs(y-target.y) > (h+target.h)/2,
          id+' overlaps '+target.id);
      }
      // Companions stand above the feature buttons in the stage's depth
      // stack. The centre must stay clickable after each person changes job.
      for(const variant of [{},...engine.FLAGS.map(key=>({[key]:true}))]) {
        const ss={...state,flags:variant};
        const people=[...scene.targets.filter(t=>t.kind==='person').map(t=>t.actor||t.id),
          ...stage.companions(scene.id,ss)];
        for(const who of people) {
          const body=stage.workStation(scene.id,who,ss);
          if(!body) continue;
          const height=stage.heightAt(scene.id,body.y);
          const halfWidth=Math.max(6.5,Math.min(10.8,height*.213))/2;
          assert.ok(Math.abs(x-body.x)>halfWidth || y>body.y || y<body.y-height,
            id+' under '+who);
        }
      }
      assert.ok(feature.observation.length <= 110);
    }
  }
  assert.equal(ids.size, 14);
});

test('a painted gesture shows one held pose and returns to rest in reduced motion',()=>{
  for(const [scene,id] of [['wreck','wreck_hawser'],['forge','bellows_handle']]){
    const f=fixture(); f.reduce(); f.noCanvas();
    const s=f.draw(scene,{bellowsFitted:true}), strip=f.detail(id).children.at(-1);
    f.life.tryFeature(f.root,s,id);assert.equal(f.frames.size,0);assert.equal(strip.style.left,'-800%');
    f.finish();assert.equal(strip.style.left,'0%');assert.equal(f.frames.size,0);
  }
});

test('native paintings and the delivery manifest resolve to their recorded binaries',()=>{
  const sha=file=>require('node:crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  // The deployment contains the delivered WebPs. Read their original art
  // receipts from the source checkout when validating that compact copy.
  const where=path.join(process.env.CASTAWAY_SOURCE_DIST || dist,'assets/tactile');
  const runtime=path.join(dist,'assets/tactile');
  const delivery=JSON.parse(fs.readFileSync(path.join(where,'manifest.json')));
  const sourceManifest=path.resolve(where,delivery.artwork);
  const native=JSON.parse(fs.readFileSync(sourceManifest));
  assert.equal(native.masters.length,4);
  for(const [dir,sourceDir,rows] of [[runtime,where,delivery.assets],[path.dirname(sourceManifest),path.dirname(sourceManifest),native.masters]]){
    for(const row of rows){
      const file=path.join(dir,row.file);
      assert.equal(sha(file),row.sha256,row.file);
      const bytes=fs.readFileSync(file);
      const size=row.file.endsWith('.png')?[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]:paintingSize(bytes);
      assert.deepEqual(size,row.size,row.file);
      for(const source of row.sources||[]) assert.equal(sha(path.resolve(sourceDir,source.file)),source.sha256);
    }
  }
  assert.deepEqual(delivery.assets.map(a=>a.file).sort(),fs.readdirSync(runtime).filter(a=>a.endsWith('.webp')).sort());
});

'use strict';
// Asset and scene-wiring checks. These do not claim browser rendering or playback QA.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const dist=path.join(__dirname,'../dist');
const E=require('../dist/voyage.js');
const A=require('../dist/voyage-art.js');
const W=require('../dist/voyage-world.js');

function asset(file){
 assert.equal(typeof file,'string');
 assert(file.startsWith('assets/')&&!file.includes('..'),'runtime artwork must resolve inside the asset tree');
 const full=path.join(dist,file);assert(fs.existsSync(full),'missing artwork: '+file);return full;
}
function png(file){
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
 return {bytes,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),colorType:bytes[25]};
}
function checkPainting(id,painting){
 assert(painting,'missing painted object: '+id);
 const p=png(asset(painting.file));
 assert.equal(painting.width,p.width,id+' width');assert.equal(painting.height,p.height,id+' height');
 assert(Array.isArray(painting.box)&&painting.box.length===4&&painting.box.every(Number.isFinite),id+' crop');
 const [x,y,w,h]=painting.box;
 assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=p.width&&y+h<=p.height,id+' crop extends outside PNG');
}

test('every campaign inventory item and visible pickup has its own painted asset mapping',()=>{
 for(const id of Object.keys(E.ITEMS))checkPainting(id,A.props[id]);
 for(const scene of E.SCENES)for(const target of scene.targets){
  if(target.kind==='item')checkPainting(scene.id+'/'+target.id,A.props[target.art||target.item||target.id]);
 }
 // Shared base drawings remain valid; extending the campaign must not replace their metadata.
 const original=require('../dist/art.js');
 for(const [id,painting]of Object.entries(original.props))assert.deepEqual(A.props[id],painting,'base prop changed: '+id);
});

test('redrawn props retain their full registration, original-generation provenance and alpha crops',()=>{
 const folder=path.join(dist,'assets/voyage/props');
 const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
 assert.equal(manifest.atlases.length,2);assert.equal(Object.keys(manifest.sprites).length,18);
 const atlases=new Map();
 for(const a of manifest.atlases){
  const p=png(path.join(folder,a.file));
  assert.equal(crypto.createHash('sha256').update(p.bytes).digest('hex'),a.sha256,a.file+' original hash');
  assert.equal(p.bytes.length,a.bytes,a.file+' byte count');
  assert.equal(p.width,a.width);assert.equal(p.height,a.height);assert.equal(p.colorType,6,a.file+' alpha channel');
  assert(a.prompt&&a.original_file&&a.edits,a.file+' provenance');
  assert.match(a.generated_sha256,/^[0-9a-f]{64}$/);assert.match(a.reference_sha256,/^[0-9a-f]{64}$/);
  assert.notEqual(a.generated_sha256,a.sha256,a.file+' native input and registered runtime are distinct');
  atlases.set(a.file,a);
 }
 for(const [id,s]of Object.entries(manifest.sprites)){
  const atlas=atlases.get(s.atlas);assert(atlas,id+' atlas');
  assert.equal(A.props[id].file,'assets/voyage/props/'+s.atlas);
  assert.deepEqual(A.props[id].box,s.viewBox,id+' registered crop');
  const [cx,cy,cw,ch]=s.cell,[x,y,w,h]=s.viewBox,[left,top,right,bottom]=s.alpha16_bbox;
  assert(cx>=0&&cy>=0&&cx+cw<=atlas.width&&cy+ch<=atlas.height,id+' cell bounds');
  assert(x>=cx&&y>=cy&&x+w<=cx+cw&&y+h<=cy+ch,id+' neighboring cell bleed');
  assert(left>=x&&top>=y&&right<=x+w&&bottom<=y+h,id+' meaningful alpha excluded from crop');
  const [sl,st,sr,sb]=s.registration.source_paint_bounds,[rx,ry,rw,rh]=s.registration.registered_rect;
  assert(rx>=x&&ry>=y&&rx+rw<=x+w&&ry+rh<=y+h,id+' complete painted silhouette is inside the crop');
  const scale=s.registration.uniform_scale;
  assert(Math.abs((sr-sl)*scale-rw)<=.51 && Math.abs((sb-st)*scale-rh)<=.51,id+' uniform aspect-preserving fit');
  assert((right-left)/w>.86&&(bottom-top)/h>.78,id+' visible object fills the intended crop');
 }
 for(const [alias,source]of Object.entries(manifest.aliases))assert.deepEqual(A.props[alias],A.props[source],alias+' alias');
 for(const [alias,source]of Object.entries(manifest.reused_original_props))assert.deepEqual(A.props[alias],A.props[source],alias+' reused source');
 assert(manifest.standalone_assets.some(a=>a.id==='kettle'),'the cabin kettle needs visible painted art');
 for(const a of manifest.standalone_assets){
  const p=png(path.join(folder,a.file));
  assert.equal(crypto.createHash('sha256').update(p.bytes).digest('hex'),a.sha256,a.file+' original hash');
  assert.equal(p.width,a.width);assert.equal(p.height,a.height);assert.equal(p.bytes.length,a.bytes);assert.equal(p.colorType,6);
  assert(a.prompt&&a.original_file&&a.visually_inspected,a.file+' provenance');
  checkPainting(a.id,A.props[a.id]);assert.deepEqual(A.props[a.id].box,a.viewBox,a.id+' registered crop');
 }
});

test('all fourteen playable scene IDs resolve to registered paintings and usable walking bounds',()=>{
 const expected=['beach','wreck','camp','cabin','forest','forge','charcoal','slipway','salvage','crossing','harbour','chartroom','return_camp','landing'];
 assert.deepEqual(E.SCENES.map(s=>s.id).sort(),expected.sort());
 assert.equal(new Set(E.SCENES.map(s=>s.id)).size,14);
 const first={beach:'assets/beach.png',wreck:'assets/wreck.png',camp:'assets/camp.png'};
 const later=E.SCENES.filter(s=>s.chapter>1);
 assert.deepEqual(Object.keys(W.scenes).sort(),later.map(s=>s.id).sort(),'staging registry must cover every later scene exactly');
 for(const scene of E.SCENES){
  const entry=W.scenes[scene.id],file=entry?.file||first[scene.id];
  const p=png(asset(file));assert(p.width>1000&&p.height>500,scene.id+' stage resolution');
  if(entry){
   const [minX,maxX,minY,maxY]=entry.walk;
   assert(minX>=0&&maxX<=100&&minX<maxX&&minY>=0&&maxY<=100&&minY<maxY,scene.id+' walking bounds');
  }
 }
});

test('every generated campaign scene and state painting matches its provenance manifest',()=>{
 const folder=path.join(dist,'assets/voyage/scenes');
 const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
 assert(manifest.assets.length>=6,'six original campaign scene paintings are required');
 const files=new Set();
 for(const a of manifest.assets){
  assert(!files.has(a.file),'duplicate scene manifest file '+a.file);files.add(a.file);
  const p=png(path.join(folder,a.file));
  assert.equal(crypto.createHash('sha256').update(p.bytes).digest('hex'),a.sha256,a.file+' original hash');
  assert.equal(p.width,a.width);assert.equal(p.height,a.height);assert.equal(p.bytes.length,a.bytes);
  assert(a.source_original_file&&a.prompt,a.file+' generation provenance');
 }
 for(const entry of Object.values(W.scenes))if(entry.file.startsWith('assets/voyage/scenes/'))assert(files.has(path.basename(entry.file)),entry.file+' missing from manifest');
});

test('the playable page resolves all local scripts/styles and mounts campaign extensions in dependency order',()=>{
 const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
 const links=[...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)].map(m=>m[1]);
 for(const file of [...scripts,...links]){
  assert(!/^(?:https?:|\/\/)/.test(file),'runtime dependency must remain local: '+file);
  assert(fs.existsSync(path.join(dist,file)),'missing runtime dependency: '+file);
 }
 for(const [before,after]of [['art.js','voyage-art.js'],['engine.js','voyage.js'],['stories.js','voyage-stories.js'],['voyage.js','app.js'],['voyage-art.js','app.js'],['voyage-world.js','app.js']]){
  assert(scripts.includes(before)&&scripts.includes(after),before+' / '+after+' script missing');
  assert(scripts.indexOf(before)<scripts.indexOf(after),before+' must load before '+after);
 }
 assert.match(html,/<html\s+lang="en"/);
});

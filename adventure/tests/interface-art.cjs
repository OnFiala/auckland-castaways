'use strict';
// Static provenance and wiring checks; these do not substitute for browser rendering.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dist=path.join(__dirname,'../dist'),dir=path.join(dist,'assets/ui');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'atlas.json'),'utf8'));

const expected={ 'timber-strip':[12,182,493,191], 'inventory-canvas':[522,142,490,261], 'dialog-paper':[1031,94,491,353], satchel:[66,580,382,365], 'brass-button':[604,596,323,329], 'paper-tab':[1059,675,441,183] };
function local(ref){assert(!/^(?:[a-z]+:|\/\/|\/)/i.test(ref),`nonlocal reference ${ref}`);const p=path.resolve(dist,ref);assert(p.startsWith(dist+path.sep),`reference escapes dist: ${ref}`);assert(fs.statSync(p).isFile(),`missing ${ref}`);return p;}
test('UI atlas matches its registration receipt, generation record and PNG dimensions',()=>{
 assert.equal(manifest.asset,'castaway-ui-atlas.png');
 const bytes=fs.readFileSync(local('assets/ui/'+manifest.asset));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
 assert.equal(bytes.length,manifest.bytes);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);assert.equal(bytes[25],6);
 assert.equal(manifest.width,1536);assert.equal(manifest.height,1024);assert.equal(manifest.mode,'RGBA');
 const generation=JSON.parse(fs.readFileSync(path.join(dir,'generation-prompts.json'),'utf8'));
 assert.match(manifest.generated_sha256,/^[0-9a-f]{64}$/);
 assert.equal(generation.generated_sha256,manifest.generated_sha256);
 assert.equal(generation.prompt,manifest.prompt);
 assert.equal(manifest.alpha_extrema[0],0);assert(manifest.alpha_extrema[1]>=250&&manifest.alpha_extrema[1]<=255);
});
test('six fixed UI viewBoxes retain centered visible paint, clear gutters and uniform scale',()=>{
 assert.deepEqual(manifest.items.map(x=>x.id).sort(),Object.keys(expected).sort());
 for(const item of manifest.items){
  assert.deepEqual(item.viewBox,expected[item.id],item.id);
  const [x,y,w,h]=item.viewBox,[left,top,right,bottom]=item.alpha_bounds_by_minimum_alpha['32'].atlas;
  assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=manifest.width&&y+h<=manifest.height,item.id+' in atlas');
  const margins=[left-x,top-y,x+w-right,y+h-bottom];
  assert(margins.every(n=>n>=4&&n<=12),item.id+' readable paint and at least four clear pixels at the visible threshold');
  assert(Math.abs(margins[0]-margins[2])<=2 && Math.abs(margins[1]-margins[3])<=2,item.id+' centered');
  const [l,t,r,b]=item.registration.source_paint_bounds,[rx,ry,rw,rh]=item.registration.registered_rect;
  const scale=item.registration.uniform_scale;
  assert(Math.abs((r-l)*scale-rw)<=.51 && Math.abs((b-t)*scale-rh)<=.51,item.id+' uniform resampling');
  assert(rx>=x&&ry>=y&&rx+rw<=x+w&&ry+rh<=y+h,item.id+' complete cutout inside its viewBox');
 }
});
test('HTML scripts and styles resolve to local files',()=>{
 const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 for(const tag of html.matchAll(/<(?:script|link)\b[^>]*>/gi)){
  const ref=tag[0].match(/\b(?:src|href)="([^"]+)"/i);if(ref)local(ref[1]);
 }
});
test('every interface crop is declared in HTML and mounted with its registered image',()=>{
 const ui=require('../dist/interface.js'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 assert.match(html,/<script\b[^>]*src="interface\.js"/);
 assert.deepEqual(Object.keys(ui.assets).sort(),Object.keys(expected).sort());
 const nodes=[];
 for(const m of html.matchAll(/\bdata-(material|ui-painting)="([^"]+)"/g)){
  const id=m[2];assert(expected[id],`unknown HTML painting ${id}`);
  nodes.push({kind:m[1],dataset:m[1]==='material'?{material:id}:{uiPainting:id},innerHTML:'',insertAdjacentHTML(_where,value){this.innerHTML+=value;}});
 }
 assert.deepEqual([...new Set(nodes.map(n=>n.dataset.material||n.dataset.uiPainting))].sort(),Object.keys(expected).sort());
 for(const [id,a] of Object.entries(ui.assets)){assert.deepEqual(a.box,expected[id]);assert.equal(a.width,1536);assert.equal(a.height,1024);local(a.file);assert.equal(a.file,'assets/ui/'+manifest.asset);}
 const doc={querySelectorAll(selector){return nodes.filter(n=>selector===`[data-${n.kind}]`);}};
 ui.mount(doc);
 for(const n of nodes){const id=n.dataset.material||n.dataset.uiPainting;assert(n.innerHTML.includes(`viewBox="${expected[id].join(' ')}"`),id);assert(n.innerHTML.includes(`href="${ui.assets[id].file}"`),id);assert.match(n.innerHTML,/aria-hidden="true"/);}
});
test('nested SVG clips each atlas crop for both meet and slice panels',()=>{
 const ui=require('../dist/interface.js');
 for(const [id,box] of Object.entries(expected)) for(const fit of ['meet','slice']){
  const markup=ui.painting(id,'',fit),tags=[...markup.matchAll(/<svg\b([^>]*)>/g)];
  assert.equal(tags.length,2,`${id} ${fit}: outer and inner viewport`);
  const attr=(tag,name)=>tag[1].match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
  assert.equal(attr(tags[0],'viewBox'),box.join(' '));assert.equal(attr(tags[0],'preserveAspectRatio'),`xMidYMid ${fit}`);
  for(const [i,key] of ['x','y','width','height'].entries())assert.equal(attr(tags[1],key),String(box[i]),`${id} ${fit} ${key}`);
  assert.equal(attr(tags[1],'viewBox'),box.join(' '));assert.equal(attr(tags[1],'overflow'),'hidden');
  assert.equal(attr(tags[1],'class'),'atlas-clip');
  assert.equal(attr(tags[1],'style'),`width:${box[2]}px;height:${box[3]}px;overflow:hidden!important`,`${id} ${fit}: inline CSS clip`);
  assert.match(markup,/<svg\b[^>]*><image\b[^>]*\/><\/svg><\/svg>$/);
 }
});

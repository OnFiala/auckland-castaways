// Tests painted asset wiring and real UI markup. No rendering or browser claims.
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const webpSize=require('./painting-size.cjs');
const dist=path.join(__dirname,'../dist');
const A=require('../dist/art.js');
const E=require('../dist/engine.js');
const M=require('../dist/animation.js');
const actor=id=>({file:M.WALKS[id].file,box:M.frameBox(id,M.REST_FRAME)});
const KEY='castaways-adventure-v3';
function entries(){return Object.entries(A).filter(([name,value])=>['props','people','states'].includes(name)&&value&&typeof value==='object').flatMap(([group,values])=>Object.entries(values).map(([id,a])=>({group,id,a})));}
function png(file){const b=fs.readFileSync(file);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');return{width:b.readUInt32BE(16),height:b.readUInt32BE(20),colorType:b[25]};}
function localFile(a){assert.equal(typeof a.file,'string');assert(a.file.startsWith('assets/'),'art must use repository-local assets');const resolved=path.resolve(dist,a.file);assert(resolved.startsWith(path.join(dist,'assets')+path.sep));return resolved;}
function sameBox(left,right){return left.length===right.length&&left.every((n,i)=>Math.abs(n-right[i])<.01);}
function hasPainting(markup,a){return [...markup.matchAll(/<svg\b[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/g)].some(m=>sameBox(m[1].trim().split(/[ ,]+/).map(Number),a.box)&&m[2].includes(a.file)&&/<image\b/.test(m[2]));}
function harness(){const source=fs.readFileSync(path.join(__dirname,'ui-contract.cjs'),'utf8');const marker=source.indexOf('async function main(');assert(marker>0,'UI harness export boundary');const context={require,__dirname,console,module:{exports:{}}};vm.runInNewContext(source.slice(0,marker)+'\nmodule.exports=app;',context,{filename:'art-ui-harness.cjs'});return context.module.exports;}
function snapshots(){let s=E.createGame();const all=[s];const use=r=>{s=r.state;all.push(s);};use(E.interact(s,'rope','take'));use(E.interact(s,'pole','take'));use(E.combine(s,'rope','pole'));use(E.useItem(s,'loopPole','sail'));use(E.travel(s,'wreck'));use(E.interact(s,'prybar','take'));use(E.useItem(s,'prybar','crate'));use(E.travel(s,'beach'));use(E.useItem(s,'axe','driftwood'));use(E.travel(s,'camp'));use(E.useItem(s,'canvas','shelter'));use(E.useItem(s,'firewood','hearth'));use(E.useItem(s,'tinderbox','hearth'));use(E.useItem(s,'loopPole','cairn'));use(E.useItem(s,'flagcloth','cairn'));assert(s.completed);return all;}

test('every physical inventory object and every secondary character has painted artwork',()=>{
 for(const id of [...Object.keys(E.ITEMS),'driftwood','cairn'])assert(A.props[id],`missing painted prop ${id}`);
 for(const id of ['musgrave','raynal','henry','george'])assert(A.people[id],`missing painted person ${id}`);
 for (const id of ['fire','mast','mastFlag']) assert(A.states[id], `solved-world prop ${id} has artwork`);
});
test('all registered paintings exist and their crop boxes stay inside the original images',()=>{
 for(const {group,id,a}of entries()){
  const file=localFile(a);
  const [width,height]=a.file.endsWith('.webp')?webpSize(fs.readFileSync(file)):[];
  const meta=width?{width,height}:png(file);assert.equal(a.width,meta.width,`${group}/${id} width`);assert.equal(a.height,meta.height,`${group}/${id} height`);
  assert(Array.isArray(a.box)&&a.box.length===4&&a.box.every(Number.isFinite),`${group}/${id} crop`);
  const[x,y,w,h]=a.box;assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=a.width+.01&&y+h<=a.height+.01,`${group}/${id} crop bounds`);
  if(group==='people')assert([4,6].includes(meta.colorType),`${id} needs an alpha-capable PNG`);
 }
});
test('original generated PNGs still match their provenance manifests',()=>{
 for(const group of ['props','people','states']){
  const folder=path.join(dist,'assets',group),manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
  const assets=manifest.assets||manifest.atlases;
  assert(Array.isArray(assets)&&assets.length>0,`${group} provenance entries`);
  for(const asset of assets){
   assert.equal(typeof asset.sha256,'string',`${group}/${asset.file} recorded hash`);
   const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(folder,asset.file))).digest('hex');
   assert.equal(hash,asset.sha256,`${group}/${asset.file} original bytes`);
  }
 }
});
test('actual inventory and world markup use the correct painted crops throughout the puzzle',()=>{
 const app=harness(),seen=new Set(),css=fs.readFileSync(path.join(dist,'style.css'),'utf8');
 const backgroundRule=(scene,flag,file)=>[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(m=>m[1].includes(`[data-scene=${scene}]`)&&m[1].includes(`[data-${flag}=true]`)&&m[2].includes(file));
 for(const s of snapshots()){
  const ui=app({initial:{[KEY]:JSON.stringify(s)}}),inventory=ui.ids.get('inventory').innerHTML,targets=ui.ids.get('targets').innerHTML,changes=ui.ids.get('world-changes').innerHTML;
  for(const id of s.inventory){assert(hasPainting(inventory,A.props[id]),`inventory ${id} must show its own painted crop`);seen.add(id);}
  for(const t of E.getTargets(s)){
   const prop=t.id==='sail'?'canvas':t.id;
   if(['rope','pole','prybar','canvas'].includes(prop))assert(hasPainting(targets,A.props[prop]),`world ${t.id} must show its own painted crop`);
  }
  assert(!/<path\b/.test(targets),'physical world targets cannot fall back to procedural vector drawings');
  const person={beach:'raynal',wreck:'musgrave',camp:'henry'}[s.scene];assert(hasPainting(targets,actor(person)),`${person} world sprite`);
  if(s.scene==='camp'&&s.flags.fireLit)assert(hasPainting(changes,A.states.fire),'lit fire uses its painted state');
  if(s.scene==='camp'&&s.flags.mastRaised)assert(hasPainting(changes,s.flags.signalRaised?A.states.mastFlag:A.states.mast),'mast state uses the correct painting');
  if(s.scene==='camp'&&s.flags.shelterBuilt){assert.equal(ui.ids.get('scene').dataset.shelter,'true');assert(backgroundRule('camp','shelter','assets/tidepaint/camp-shelter.webp'),'finished shelter selects its painted background');}
  if(s.scene==='wreck'&&s.flags.crateOpen){assert.equal(ui.ids.get('scene').dataset.crate,'true');assert(backgroundRule('wreck','crate','assets/tidepaint/wreck-open.webp'),'opened crate selects its painted background');}
  if(s.completed){for(const id of ['raynal','musgrave','george'])assert(hasPainting(ui.ids.get('companions').innerHTML,actor(id)),`final group ${id}`);}
  assert(!/function person\(color/.test(fs.readFileSync(path.join(dist,'app.js'),'utf8')),'old procedural NPC replacement is gone');
 }
 assert.deepEqual([...seen].sort(),Object.keys(E.ITEMS).sort());
});

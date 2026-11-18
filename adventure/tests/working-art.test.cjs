'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const get = (...parts) => fs.readFileSync(path.join(root,...parts));
const manifest = (...parts) => JSON.parse(get(...parts,'manifest.json'));
const puzzles = require('../dist/fieldwork.js').puzzles;

test('every playable surface has a registered WebP, its corresponding unmodified original and measured feature anchors',()=>{
 const source=manifest('artwork','workplates').assets, published=manifest('dist','assets','workplates').assets;
 assert.equal(source.length,7);assert.equal(published.length,7);
 for(const {id} of source){
  const puzzle=puzzles[id];assert(puzzle);
  const native=source.find(a=>a.id===id), web=published.find(a=>a.id===id);
  const ink=get('artwork','workplates',native.file), plate=get('dist','assets','workplates',web.file);
  assert.equal(hash(ink),native.sha256);assert.equal(web.source_sha256,native.sha256);assert.equal(hash(plate),web.sha256);
  assert.equal(ink.length,native.bytes);assert.equal(plate.length,web.bytes);assert.equal(plate.toString('ascii',8,12),'WEBP');
  assert.deepEqual([ink.readUInt32BE(16),ink.readUInt32BE(20)],[web.width,web.height]);assert.equal(web.width/web.height,1.5);
  assert.equal(web.file,id+'.webp');assert(Object.keys(native.anchors).length>=3,puzzle.title);
 }
});
test('all five original work atlases retain their hashes, right-facing registrations and distinct grounded working poses',()=>{
 const sheets=manifest('dist','assets','work-poses').assets,work=require('../dist/work-poses.js');
 assert.equal(Object.keys(sheets).length,5);
 for(const [id,sheet] of Object.entries(sheets)){
  const ink=get('dist',sheet.atlas);assert.equal(hash(ink),sheet.sha256);assert.equal(ink.length,sheet.byteLength);
  assert.deepEqual([ink.readUInt32BE(16),ink.readUInt32BE(20)],sheet.size);assert.deepEqual(Object.keys(sheet.poses),['stand','reach','crouch']);
  const high=work.contact(id,'reach'),low=work.contact(id,'crouch');assert(high.x>0&&low.x>0&&high.y>low.y);
 }
});

test('the opened chest is a registered native painting of the same keeper and recovered tools',()=>{
 const native = manifest('artwork','workplates').assets.find(a=>a.id==='chest');
 const web = manifest('dist','assets','workplates').assets.find(a=>a.id==='chest');
 const open = native.states.open, runtime = web.states.open;
 const ink = get('artwork','workplates',open.file), plate = get('dist','assets','workplates',runtime.file);
 assert.equal(open.references[0].sha256,native.sha256);
 assert.equal(hash(ink),open.sha256);assert.equal(runtime.source_sha256,open.sha256);
 assert.equal(hash(plate),runtime.sha256);assert.equal(plate.length,runtime.bytes);
 assert.deepEqual(require('./painting-size.cjs')(plate),[native.width,native.height]);
 const keeper=native.anchors.keeper_under_tongue, revealed=open.anchors.revealed_front_keeper;
 assert(Math.hypot(keeper[0]-revealed[0],keeper[1]-revealed[1])<.5);
 for(const key of ['axe_eye','tinderbox']) assert(open.anchors[key][1]<revealed[1]);
 const wedge = web.fulcrum;
 assert.equal(hash(get('artwork','workplates',native.fulcrum.file)), wedge.source_sha256);
 const wood = get('dist','assets','workplates',wedge.file);
 assert.equal(hash(wood),wedge.sha256);
 assert.deepEqual(require('./painting-size.cjs')(wood),[wedge.width,wedge.height]);
});

test('the boat and cabin details use measured crops of the registered scenes and working actors',()=>{
 const receipt=manifest('dist','assets','field-scenes');
 for(const entry of receipt.assets){
  const original=get('dist','assets',entry.source), crop=get('dist','assets','field-scenes',entry.file);
  assert.equal(hash(original),entry.sourceSHA256);
  for(const layer of entry.layers||[]){
    assert.equal(hash(get('dist','assets',layer.source)),layer.sourceSHA256);
    assert(layer.at.every(Number.isInteger));
  }
  assert.equal(hash(crop),entry.sha256);
  assert.equal(crop.toString('ascii',8,12),'WEBP');
  assert(entry.crop[0]>=0 && entry.crop[2]>entry.crop[0]);
  assert(entry.crop[1]>=0 && entry.crop[3]>entry.crop[1]);
 }
 const sound=get('dist','assets','field-scenes',receipt.sound.file);
 assert.equal(hash(sound),receipt.sound.sha256);assert.equal(sound.toString('ascii',8,12),'WAVE');
 assert.equal(sound.readUInt16LE(22),2);
 assert.equal(puzzles.fastening.flag,'hullFastened');
});

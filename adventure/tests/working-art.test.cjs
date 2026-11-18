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
 for(const [id,puzzle] of Object.entries(puzzles)){
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

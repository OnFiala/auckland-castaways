'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const world = require('../dist/voyage-world.js');
const size = require('./painting-size.cjs');

const variants = {
  beach: ['beach'], wreck: ['wreck', 'wreck-open:crateOpen'], camp: ['camp', 'camp-shelter:shelterBuilt'],
  cabin: ['cabin-cold', 'cabin:warmthReady'], forest: ['forest'], charcoal: ['charcoal'],
  forge: ['forge-cold', 'forge:bellowsFitted', 'forge-lit:bellowsFitted,forgeLit'],
  slipway: ['slipway', 'slipway-ready:sailRigged'], salvage: ['salvage'],
  crossing: ['crossing-wet', 'crossing-bailed:boatDry', 'crossing-safe:boatDry,sailMended'],
  harbour: ['harbour'], chartroom: ['chartroom'], return_camp: ['return-camp'], landing: ['landing']
};
test('all painted gameplay states select a local, full-size WebP in the recorded camera', () => {
  const seen = new Set();
  for (const [scene, steps] of Object.entries(variants)) {
    for (const step of steps) {
      const [name, required] = step.split(':');
      const flags = Object.fromEntries((required?.split(',') || []).map(flag => [flag, true]));
      const ref = world.background({scene, flags});
      assert.equal(ref, `assets/tidepaint/${name}.webp`);
      const [w,h] = size(fs.readFileSync(path.join(__dirname,'../dist',ref)));
      assert(w >= 1536 && Math.abs(w/h-16/9) < .01, ref);
      seen.add(name);
    }
  }
  assert.equal(seen.size,22);
  assert.equal(world.background({scene:'crossing',flags:{courseSet:true}}),'assets/tidepaint/crossing-safe.webp');
  assert.equal(world.background({scene:'unknown'}),undefined);
});

test('the three art receipts account for each delivered scene painting and its bytes', () => {
  const digest = bytes => require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  const root = path.join(__dirname,'../dist/assets/tidepaint');
  const records = ['coastal','woodland','voyage'].flatMap(group => {
    const receipt = JSON.parse(fs.readFileSync(path.join(root,group+'.json'),'utf8'));
    return receipt.assets || Object.values(receipt.files);
  });
  const names = new Set();
  for (const record of records) {
    assert(!names.has(record.file), `duplicate painting ${record.file}`);
    names.add(record.file);
    const delivered = fs.readFileSync(path.join(root,record.file));
    assert.deepEqual(size(delivered),record.dimensions || record.size,record.file);
    assert.equal(digest(delivered),record.sha256,record.file);
    assert.equal(delivered.length,record.bytes,record.file);
  }
  assert.equal(names.size,22);
  assert.deepEqual([...names].sort(),fs.readdirSync(root).filter(name=>name.endsWith('.webp')).sort());
});

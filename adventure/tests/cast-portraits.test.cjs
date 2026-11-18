'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const webpSize = require('./painting-size.cjs');
const art = require('../dist/art.js');

const root = path.join(__dirname, '..');
const assets = path.join(root, 'dist/assets');
const faces = path.join(assets, 'cast-portraits');
const people = path.join(assets, 'people');
const cast = ['player', 'raynal', 'musgrave', 'henry', 'george'];
const record = dir => JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')).assets;
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('each speaker has a small square portrait and an individually traceable ImageGen original', () => {
  const all = record(faces);
  assert.deepEqual(all.map(entry => entry.id).sort(), [...cast].sort());
  assert.equal(new Set(all.map(entry => entry.source.output_filename)).size, cast.length);
  const prompts = JSON.parse(fs.readFileSync(path.join(faces, 'prompts.json'), 'utf8'));
  for (const entry of all) {
    assert.equal(entry.file, entry.id + '.webp');
    const publicFile = path.join(faces, entry.file);
    assert.deepEqual(webpSize(fs.readFileSync(publicFile)), [640, 640]);
    assert.equal(digest(publicFile), entry.sha256);
    const master = path.join(root, entry.source.path);
    assert.equal(digest(master), entry.source.sha256);
    assert.equal(entry.source.width, entry.source.height);
    assert.ok(entry.source.width >= 1024);
    assert.equal(prompts.filter(p => p.id === entry.id && p.transparent_background === false).length, 1);
  }
});

test('each standing figure matches its portrait and pose source receipts and keeps the entire silhouette', () => {
  const all = record(people);
  const closeups = record(faces);
  assert.deepEqual(all.map(entry => entry.id).sort(), [...cast].sort());
  for (const entry of all) {
    const file = path.join(people, entry.file);
    assert.equal(digest(file), entry.sha256);
    assert.equal(entry.references[0].sha256, closeups.find(p => p.id === entry.id).source.sha256);
    for (const ref of entry.references) assert.equal(digest(path.join(root, ref.path)), ref.sha256);
    assert.equal(entry.alpha_corner_values.length, 4);
    assert.ok(entry.alpha_corner_values.every(alpha => alpha <= 1));
    const png = fs.readFileSync(file);
    assert.equal(png[25], 6, 'truecolour with alpha');
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [entry.width, entry.height]);
    if (entry.id === 'player') continue;
    const registered = art.people[entry.id];
    assert.equal(path.join(root, 'dist', registered.file), file);
    const [x, y, w, h] = registered.box;
    const [left, top, right, bottom] = entry.alpha_bbox_128;
    assert.ok(x <= left && y <= top && x + w >= right && y + h >= bottom);
  }
});

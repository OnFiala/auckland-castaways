'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {inflateSync} = require('node:zlib');
const atlas = require('../dist/material-atlas.js');
const world = require('../dist/voyage-world.js');
const manifest = require('../dist/assets/materials/manifest.json');

const maps = ['surface','medium','light'];
const dist = path.join(__dirname, '../dist');
const sha = value => createHash('sha256').update(value).digest('hex');
const buffers = new Map();

function png(uri) {
  if (buffers.has(uri)) return buffers.get(uri);
  assert.match(uri, /^data:image\/png;base64,/);
  const bytes = Buffer.from(uri.slice(uri.indexOf(',') + 1), 'base64');
  assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.deepEqual([...bytes.subarray(24,29)], [8,6,0,0,0]); // 8-bit straight RGBA.
  const chunks = [];
  for (let cursor = 8; cursor < bytes.length;) {
    const length = bytes.readUInt32BE(cursor);
    if (bytes.toString('ascii',cursor+4,cursor+8) === 'IDAT') chunks.push(bytes.subarray(cursor+8,cursor+8+length));
    cursor += 12 + length;
  }
  const packed = inflateSync(Buffer.concat(chunks));
  const stride = width*4;
  assert.equal(packed.length, height*(stride+1));
  const data = Buffer.alloc(height*stride);
  function paeth(a,b,c) {
    const p=a+b-c, da=Math.abs(p-a), db=Math.abs(p-b), dc=Math.abs(p-c);
    if (da<=db && da<=dc) return a;
    return db<=dc ? b : c;
  }
  for (let y=0; y<height; y++) {
    const filter = packed[y*(stride+1)];
    assert.ok(filter<=4);
    for (let i=0; i<stride; i++) {
      const j=y*stride+i, left=i>=4 ? data[j-4] : 0, up=y ? data[j-stride] : 0;
      const corner=y && i>=4 ? data[j-stride-4] : 0;
      const prediction=[0,left,up,(left+up)>>1,paeth(left,up,corner)][filter];
      data[j]=packed[y*(stride+1)+1+i]+prediction;
    }
  }
  const bitmap={width,height,digest:sha(bytes),at(x,y) {
    const i=4*(Math.round(height*y/100)*width + Math.round(width*x/100));
    return [...data.subarray(i,i+4)];
  }};
  buffers.set(uri,bitmap);
  return bitmap;
}

function sample(scene,flags,channel,x,y) {
  return png(atlas.get(scene,flags)[channel]).at(x,y);
}

// These combinations are assembled independently of the atlas's selector.
const changes={
  wreck:['crateOpen'],camp:['shelterBuilt','fireLit'],cabin:['warmthReady'],forge:['bellowsFitted','forgeLit'],
  crossing:['boatDry','sailMended','courseSet'],slipway:['sailRigged'],landing:['landingMarked']
};

test('all room states agree with the displayed plate and use verified inline lossless PNGs',()=>{
  const seen=new Set();
  for (const scene of Object.keys(world.scenes)) {
    const names=changes[scene] || [];
    for (let bits=0; bits<2**names.length; bits++) {
      const flags=Object.fromEntries(names.map((n,i)=>[n,Boolean(bits&(1<<i))]));
      const layout=atlas.get(scene,flags);
      assert.strictEqual(atlas.get(scene,{...flags,journalTaken:true}),layout);
      assert.equal(layout.plate,world.background({scene,flags}));
      if (seen.has(layout.key)) continue;
      seen.add(layout.key);
      const record=manifest.layouts[layout.key];
      assert.equal(record.scene,scene);
      assert.equal(sha(fs.readFileSync(path.join(dist,layout.plate))),record.plate_sha256);
      for (const map of maps) {
        const image=png(layout[map]);
        assert.deepEqual([image.width,image.height],[256,144]);
        assert.equal(image.digest,record.png_sha256[map]);
      }
    }
  }
  assert.equal(seen.size,25);
  assert.equal(buffers.size,manifest.png_count);
  assert.equal(sha(fs.readFileSync(path.join(dist,'material-atlas.js'))),manifest.atlas_sha256);
  assert.ok(manifest.atlas_bytes<3_000_000);
  assert.equal(atlas.get('constructor'),null);
});

test('standing water, horizon water, planking, rock, window glass and sky have separate receivers',()=>{
  const wet=(s,f,x,y)=>sample(s,f,'medium',x,y)[1];
  assert.ok(wet('crossing',{},68,81)>190);
  for (const flags of [{boatDry:true},{courseSet:true},{sailMended:true}]) {
    assert.equal(wet('crossing',flags,68,81),0);
    assert.ok(wet('crossing',flags,15,46)>190);
  }
  for (const [scene,flags,x,y] of [
    ['landing',{},40,55], ['landing',{},8,32.8], ['slipway',{},66,55],
    ['cabin',{},18,21], ['forge',{},65,42], ['beach',{},88,35],
    ['crossing',{},13,20], ['wreck',{crateOpen:true},73,45]
  ]) assert.equal(wet(scene,flags,x,y),0,scene+' at '+x+','+y);
  assert.ok(wet('wreck',{},73,45)>190);
  assert.ok(wet('forest',{},24,67)>185);
  assert.ok(wet('beach',{},30,74)>70 && wet('beach',{},30,74)<175);
  assert.equal(wet('beach',{},54,89),0);
});

test('artwork opens and closes relief without extending geometry into the canvas, glass or atmosphere',()=>{
  const surface=(s,f,x,y)=>sample(s,f,'surface',x,y);
  assert.deepEqual(surface('beach',{},22,21),[128,128,128,255]);
  assert.deepEqual(sample('beach',{},'light',22,21).slice(0,3),[128,128,128]);
  assert.equal(surface('cabin',{},18,21)[2],128);
  assert.ok(surface('cabin',{},21.7,21)[2]>142);
  assert.equal(surface('slipway',{sailRigged:true},55,36)[2],128);
  assert.ok(surface('slipway',{},54,53)[2]>144);
  assert.equal(surface('forge',{bellowsFitted:true},24,43)[2],128);
  assert.ok(surface('forge',{},24,43)[2]>143);
  const anvil=sample('forge',{},'medium',65,42), stump=sample('forge',{},'medium',65,55);
  assert.ok(anvil[0]>185 && stump[0]===0);
  assert.ok(surface('forge',{},65,42)[3]+30<surface('forge',{},65,55)[3]);
  assert.ok(sample('forge',{},'medium',41,43)[2]+55<stump[2]);
});

test('local sources follow state and cast copper-coloured indirect light outside their emissive masks',()=>{
  const cases=[
    ['forge',{forgeLit:true},41,43],['camp',{fireLit:true},27.3,64],
    ['landing',{landingMarked:true},77.8,35.4],['cabin',{warmthReady:true},11,62]
  ];
  for (const [s,f,x,y] of cases) {
    assert.equal(sample(s,{},'medium',x,y)[3],0);
    assert.ok(sample(s,f,'medium',x,y)[3]>75,s);
  }
  const hot=sample('forge',{forgeLit:true},'light',41,51);
  const cold=sample('forge',{},'light',41,51);
  assert.ok(sample('forge',{forgeLit:true},'medium',41,51)[3]<5);
  assert.ok(hot[0]>cold[0]+25 && hot[0]>hot[2]+25,'warm masonry beside fire');
  assert.ok(sample('chartroom',{},'light',40,43)[3]>70);
  assert.equal(sample('chartroom',{},'light',90,88)[3],0);
});

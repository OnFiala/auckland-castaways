'use strict';
// Pure animation contracts. These checks do not render the atlases in a browser.
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../dist/animation.js');
test('walk cycle selects six different atlas cells and repeats',()=>{
 assert.deepEqual(Array.from({length:6},(_,i)=>M.frameIndex(i*1.1+0.01)),[0,1,2,3,4,5]);
 assert.equal(M.frameIndex(6.61),0);assert.equal(M.frameIndex(NaN),0);
 for(const id of ['player','raynal','musgrave','henry','george']){
  const boxes=Array.from({length:6},(_,i)=>M.frameBox(id,i));
  assert.equal(new Set(boxes.map(b=>b.join(','))).size,6,id);
  for(const b of boxes){assert(b[0]>=0&&b[1]>=0&&b[0]+b[2]<=1536&&b[1]+b[3]<=1024,id);}
  assert.match(M.sprite(id,3),/aria-hidden="true"/);assert(M.sprite(id,3).includes(`assets/walk/${id}.png`));
 }
 assert.equal(M.frameBox('unknown',0),null);
});
test('patrol freezes while speaking or reduced motion is enabled and resets on scene change',()=>{
 const track=M.createTrack('raynal');for(let i=0;i<24;i++)track.tick(100);
 const moving=track.tick(100);assert(moving.moving);assert.notEqual(moving.x,0);
 for(const options of [{paused:true},{reduced:true}]){
  const frozen=track.tick(100,options);for(let i=0;i<100;i++)assert.equal(track.tick(100,options).x,frozen.x);
  assert.equal(frozen.moving,false);assert.equal(frozen.x,moving.x);
 }
 assert.notEqual(track.tick(100).x,moving.x);track.reset();assert.equal(track.tick(0).x,0);
});
test('each character has a three-beat story at each progression stage',()=>{
 const S=require('../dist/stories.js');
 for(const id of ['player','raynal','musgrave','henry','george']){
  const first=[];
  for(const flags of [{},{shelterBuilt:true},{fireLit:true},{signalRaised:true}]){
   const story=S.lines(id,{flags});assert.equal(story.lines.length,3);assert(story.lines.every(line=>typeof line==='string'&&line.length>0));
   assert(story.speaker&&story.portrait);assert.equal(S.ambient(id,{flags}),story.lines[0]);first.push(story.lines[0]);
  }
  assert.equal(new Set(first).size,4,id);
 }
});
test('walk atlas metadata matches PNG bytes and dimensions',()=>{
 const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
 for(const id of ['player','raynal','musgrave','henry','george']){
  const dir=path.join(__dirname,'../dist/assets/walk'),data=fs.readFileSync(path.join(dir,id+'.png')),meta=JSON.parse(fs.readFileSync(path.join(dir,id+'.json')));
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),meta.sha256,id);
  assert.equal(data.readUInt32BE(16),1536,id);assert.equal(data.readUInt32BE(20),1024,id);
 }
});

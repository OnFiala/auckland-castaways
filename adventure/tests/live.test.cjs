'use strict';
// Pure animation contracts. These checks do not render the atlases in a browser.
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../dist/animation.js');
test('walk cycle uses the same body-height stride for all six atlas cells',()=>{
 assert.deepEqual(Array.from({length:6},(_,i)=>M.frameIndex(i*M.STRIDE/6+0.0001)),[0,1,2,3,4,5]);
 assert.equal(M.frameIndex(M.STRIDE+0.0001),0);assert.equal(M.frameIndex(NaN),0);
 for(const id of ['player','raynal','musgrave','henry','george']){
  const boxes=Array.from({length:6},(_,i)=>M.frameBox(id,i));
  assert.equal(new Set(boxes.map(b=>b.join(','))).size,6,id);
  for(const b of boxes){assert(b[0]>=0&&b[1]>=0&&b[0]+b[2]<=1536&&b[1]+b[3]<=1024,id);}
  assert.match(M.sprite(id,3),/aria-hidden="true"/);assert(M.sprite(id,3).includes(`assets/walk/${id}.png`));
 }
 assert.equal(M.frameBox('unknown',0),null);
});
test('people rest until given a finite goal and never patrol or replay a completed goal',()=>{
 const track=M.createTrack('raynal',{bodyHeight:15});
 for(let i=0;i<200;i++)assert.deepEqual(track.tick(100),{x:0,y:0,moving:false,frame:M.REST_FRAME,facing:'left'});
 assert(track.setGoal(8.25));
 assert(track.tick(100).moving);
 for(let i=0;i<30;i++)track.tick(100);
 const arrived=track.tick(0);assert.equal(arrived.x,8.25);assert.equal(arrived.moving,false);assert.equal(arrived.frame,M.REST_FRAME);
 assert.equal(track.setGoal(8.25),false);
 for(let i=0;i<200;i++)assert.deepEqual(track.tick(100),arrived);
 track.reset();assert.equal(track.tick(0).x,0);assert.equal(track.tick(0).moving,false);
});
test('pause, pointer focus and reduced motion preserve both position and exact pose',()=>{
 const track=M.createTrack('raynal',{bodyHeight:15});track.setGoal(-15);
 for(let i=0;i<7;i++)track.tick(100);
 const moving=track.tick(0);assert(moving.moving);assert.notEqual(moving.x,0);assert.equal(moving.facing,'left');
 for(const options of [{paused:true},{reduced:true}]){
  const frozen=track.tick(100,options);
  for(let i=0;i<100;i++)assert.deepEqual(track.tick(100,options),frozen);
  assert.equal(frozen.moving,false);assert.equal(frozen.x,moving.x);assert.equal(frozen.frame,moving.frame);
 }
 assert.notEqual(track.tick(100).x,moving.x);
});
test('repeating an in-progress goal does not restart it; restored goals can be placed immediately',()=>{
 const a=M.createTrack('george'),b=M.createTrack('george');a.setGoal(9);b.setGoal(9);
 for(let i=0;i<5;i++){a.tick(100);b.tick(100);}
 assert.equal(a.setGoal(9),false);assert.deepEqual(a.tick(100),b.tick(100));
 a.setGoal(12,{immediate:true});assert.equal(a.tick(100).x,12);assert.equal(a.tick(100).moving,false);
 assert.equal(a.setGoal(NaN),false);
});
test('body-normalized speed gives equal gait for differently sized people',()=>{
 const a=M.createTrack('henry',{bodyHeight:12}),b=M.createTrack('musgrave',{bodyHeight:18});a.setGoal(12);b.setGoal(18);
 for(let i=0;i<12;i++){
  const pa=a.tick(100),pb=b.tick(100);assert.equal(pa.frame,pb.frame);assert(Math.abs(pa.x/12-pb.x/18)<1e-10);
 }
 assert.equal(M.travelDuration(.55),1000);assert.equal(M.travelDuration(NaN),0);
 const values=Array.from({length:101},(_,i)=>M.ease(i/100));
 assert.equal(values[0],0);assert.equal(values[100],1);assert(values.every((v,i)=>i===0||v>=values[i-1]));
 assert(M.ease(.01)<.001);assert(1-M.ease(.99)<.001);
 assert.equal(M.routeProgress(500,1000),M.ease(.5));assert.equal(M.routeProgress(0,0),1);
});
test('frame updates preserve the exact SVG image node instead of replacing its markup',()=>{
 function element(){return {attributes:{},setAttribute(k,v){this.attributes[k]=String(v);}};}
 const host={writes:0,querySelector(selector){if(selector==='.walk-viewport')return this.viewport||null;if(selector==='image')return this.image||null;if(selector==='.atlas-clip')return this.clip||null;return null;},
  set innerHTML(value){this.markup=value;this.writes++;this.viewport=element();this.clip=element();this.image=element();this.viewport.querySelector=selector=>selector==='.atlas-clip'?this.clip:null;}};
 assert(M.update(host,'raynal',1));const image=host.querySelector('image'),viewport=host.viewport;
 for(let i=0;i<60;i++){
  assert(M.update(host,'raynal',i%6));assert.equal(host.querySelector('image'),image);assert.equal(host.viewport,viewport);
  assert.equal(host.viewport.attributes.viewBox,M.frameBox('raynal',i%6).join(' '));
 }
 assert.equal(host.writes,1);assert.equal(M.update(host,'missing',1),false);assert.equal(host.writes,1);
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

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const work=require('../dist/work-lighting.js');

test('all eight work surfaces and substituted plates have material registrations',()=>{
  const names=['chest','roof','drill','fastening','hull','rig','chart','landing'];
  for (const id of names) {
    const r=work.registration(id,{located:true});
    assert.ok(r && r.path && r.material,id);
    assert.ok(r.opacity>0 && r.opacity<=.16,id);
  }
  assert.equal(work.registration('roof',{}).material,'tin pan');
  assert.equal(work.registration('roof',{located:true}).material,'damp canvas seam');
  assert.equal(work.registration('roof',{located:true,done:true}).material,'tin pan');
  assert.equal(work.registration('chest',{done:true}).material,'iron hinge and axe');
  assert.equal(work.registration('fastening',{}).material,'hull strakes');
  assert.equal(work.registration('chart',{}).material,'brass dividers');
  assert.equal(work.registration('unknown',{}),null);
});

test('update inserts below the drawing, updates replaced plates, and removes in Original',()=>{
  const drawing={}; let current=null;
  const board={ownerDocument:{createElementNS(){return {dataset:{},attributes:{},setAttribute(k,v){this.attributes[k]=v;},remove(){current=null;}};}},
    querySelector(q){return q==='.fw-drawing'?drawing:current;},
    insertBefore(layer,reference){assert.equal(reference,drawing);current=layer;}};
  const dialog={querySelector(q){return q==='.fw-board'?board:null;}};
  let layer=work.update(dialog,'roof',{located:true},true);
  assert.equal(layer.dataset.material,'damp canvas seam');
  assert.equal(layer.attributes['aria-hidden'],'true');
  assert.match(layer.innerHTML,/path/);
  layer=work.update(dialog,'roof',{done:true},true);
  assert.equal(layer.dataset.material,'tin pan');
  assert.equal(work.update(dialog,'roof',{},false),null);
  assert.equal(current,null);
  assert.equal(work.update(dialog,'unknown',{},true),null);
});


test('minimal DOM without SVG or insertion capability skips safely',()=>{
  for (const board of [
    {ownerDocument:{},querySelector(){return null;},insertBefore(){}},
    {ownerDocument:{createElementNS(){}},querySelector(){return null;}},
    {querySelector(){return null;}}
  ]) {
    assert.equal(work.update({querySelector(){return board;}},'drill',{},true),null);
  }
});

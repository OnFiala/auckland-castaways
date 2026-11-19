'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const lighting = require('../dist/painting-light.js');
const direction = require('../dist/lighting-direction.js');
const coverage = require('../dist/edge-coverage.js');
const reflections = require('../dist/planar-reflections.js');
const ground = require('../dist/ground.js');

test('automatic lighting follows capability while an explicit player choice survives', () => {
  assert.equal(lighting.preference('future-mode'), 'auto');
  assert.equal(lighting.quality('auto', 1100, {deviceMemory:8}, false), 'high');
  assert.equal(lighting.quality('auto', 1100, {deviceMemory:2}, false), 'balanced');
  assert.equal(lighting.quality('auto', 390, {}, false), 'balanced');
  assert.equal(lighting.quality('cinematic', 390, {}, false), 'high');
  assert.equal(lighting.quality('original', 1100, {}, false), 'off');
  assert.equal(lighting.quality('cinematic', 1100, {}, true), 'off');
});

test('local furnace light warms an approaching actor more than one standing by the door', () => {
  const cold = direction.resolve('forge', {shade:.25}, {});
  const hot = direction.resolve('forge', {shade:.25}, {forgeLit:true});
  const body = d => lighting.subjectLight(d,hot.practical.x,hot.practical.y);
  const atDoor = d => lighting.subjectLight(d,.055,.42);
  const brightness = measurement => Number(measurement.filter.match(/brightness\(([^)]+)/)[1]);
  assert.ok(brightness(body(hot)) - brightness(body(cold)) > .1);
  assert.ok(brightness(atDoor(hot)) - brightness(atDoor(cold)) < .03);
  assert.ok(Number.parseFloat(lighting.subjectLight(cold,.81,.58).shadow)>0);
});

test('multisampled receiver triangles cover the authored wet polygon, including its concave edges', () => {
  for (const scene of ['beach','harbour','crossing']) {
    const surface=reflections.surfaceFor({scene,flags:{}}), mesh=coverage.triangles(surface.points);
    assert.equal(mesh.length,(surface.points.length-2)*3);
    const tr=[];
    for(let i=0;i<mesh.length;i+=3)tr.push(mesh.slice(i,i+3));
    for(let y=62.123;y<95;y+=.9)for(let x=.371;x<99;x+=1.25) {
      const p={x,y};
      assert.equal(tr.some(triangle=>ground.contains(triangle,p)),ground.contains(surface.points,p),scene);
    }
  }
});

test('a delayed mask cannot be installed after switching back to the original polygon', () => {
  const jobs=[],window={requestIdleCallback(fn){jobs.push(fn);}};
  const context=vm.createContext({window});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/edge-coverage.js'),'utf8'),context);
  const surface=reflections.surfaceFor({scene:'beach',flags:{}});
  const node={isConnected:true,style:{clipPath:surface.clip},dataset:{}};
  const update=window.CastawayEdgeCoverage.update;
  update(node,surface.name,surface.points,900,true);
  update(node,surface.name,surface.points,900,false);
  assert.equal(jobs.length,1);
  jobs[0]();
  assert.equal(node.style.clipPath,surface.clip);
  assert.equal(node.style.maskImage,'');
  assert.equal(node.dataset.coverage,'polygon');
});

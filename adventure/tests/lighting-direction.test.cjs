'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const light = require('../dist/lighting-direction.js');
const weather = require('../dist/weather.js');

test('all fourteen painted rooms resolve to bounded independent profiles', () => {
  assert.equal(light.rooms.length, 14);
  for (const room of light.rooms) {
    const a=light.resolve(room, {}, {}), b=light.resolve(room, {}, {});
    assert.ok(a.key.x>=0 && a.key.x<=1 && a.key.y>=0 && a.key.y<=1,room);
    for (const c of a.key.color) assert.ok(c>=0 && c<=1,room);
    for (const n of [a.key.intensity,a.exposure,a.ambient,a.lens,a.bloom,a.volume]) assert.ok(Number.isFinite(n) && n>=0,room);
    a.key.color[0]=99;
    assert.notEqual(b.key.color[0],99,room);
  }
  assert.equal(light.resolve('unknown',{},{}),null);
});

test('weather dims existing daylight smoothly and cannot corrupt values', () => {
  const clear=light.resolve('beach',{shade:0,rain:0},{});
  const cloud=light.resolve('beach',{shade:1,rain:1},{});
  assert.ok(cloud.exposure<clear.exposure && cloud.key.intensity<clear.key.intensity);
  assert.ok(cloud.warmth<clear.warmth);
  assert.deepEqual(light.resolve('beach',{shade:Infinity,rain:NaN},{}),clear);
  for (let chapter=1;chapter<=7;chapter++) {
    for (const room of light.rooms) {
      const p=light.resolve(room,weather.conditions(chapter,31),{});
      assert.ok(Number.isFinite(p.exposure));
    }
  }
});

test('practical sources follow real story flags and painted positions', () => {
  for(const [room,flag] of [['camp','fireLit'],['cabin','warmthReady'],['forge','forgeLit']]) {
    assert.equal(light.resolve(room,{},{}).practical,null);
    const p=light.resolve(room,{}, {[flag]:true}).practical;
    assert.ok(p.intensity>0 && p.radius>0);
    assert.ok(p.x<.5 && p.y<.7);
  }
  assert.equal(light.resolve('landing',{},{}).practical,null);
  assert.equal(light.resolve('landing',{}, {landingMarked:true}).practical.x,.778);
  assert.ok(light.resolve('return_camp',{},{}).practical);
  assert.equal(light.resolve('forest',{}, {fireLit:true}).practical,null);
});

'use strict';
// Exercise the real delegated click and close handlers using the shared DOM contract double.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');

function workroom(options) {
  const ui = app(options);
  for (const name of ['fieldwork.js', 'fieldwork-ui.js']) {
    const file = path.join(__dirname, '../dist', name);
    vm.runInContext(fs.readFileSync(file, 'utf8'), ui.context, {filename: file});
  }
  const dialog = ui.ids.get('workbench'), bench = ui.context.CastawayBench;
  const calls = {complete: 0, close: 0};
  const open = id => bench.open(id, {
    complete() { calls.complete++; },
    close() { calls.close++; }
  });
  const click = async selector => {
    const button = dialog.querySelector(selector);
    assert.ok(button, 'available control ' + selector);
    await ui.click(button);
  };
  const point = id => click('[data-fw-point="' + id + '"]');
  return {ui, dialog, bench, calls, open, point, click};
}

test('painted actions, named controls, hints and unfinished work survive standing back and a reload', async () => {
  const a = workroom();
  a.open('chest');
  assert.ok(a.bench.shown());
  assert.equal(a.dialog.querySelector('.fw-controls').open, false);
  await a.point('strap');
  assert.match(a.dialog.querySelector('.fw-feedback').textContent, /no lip/);
  await a.click('[data-fw-hint]');
  const first = a.dialog.querySelector('.fw-hint-text').textContent;
  await a.point('notch');
  await a.click('[data-fw-hint]');
  assert.notEqual(a.dialog.querySelector('.fw-hint-text').textContent, first);
  const second = a.dialog.querySelector('.fw-hint-text').textContent;
  a.dialog.oncancel({preventDefault() {}});
  assert.equal(a.bench.shown(), false);
  assert.deepEqual(a.calls, {complete: 0, close: 1});

  const b = workroom({initial: a.ui.stored});
  b.open('chest');
  assert.equal(b.dialog.querySelector('.fw-hint-text').textContent, second);
  assert.equal(b.dialog.querySelector('[data-fw-point="notch"]'), null);
  await b.click('[data-fw-hint]');
  const third = b.dialog.querySelector('.fw-hint-text').textContent;
  assert.notEqual(third, second);
  await b.click('[data-fw-hint]');
  assert.equal(b.dialog.querySelector('.fw-hint-text').textContent, third);
  // Simulate the details element's native expansion, then use its named button.
  b.dialog.querySelector('.fw-controls').open = true;
  await b.click('[data-fw-action="near"]');
  const before = b.dialog.querySelector('.fw-drawing').innerHTML;
  await b.point('press');
  assert.notEqual(b.dialog.querySelector('.fw-drawing').innerHTML, before, 'the physical position changes');
  assert.equal(b.ui.activeElement(), b.dialog.querySelector('[data-fw-finish]'));
  assert.equal(b.calls.complete, 0);
  await b.click('[data-fw-close]');
  assert.deepEqual(b.calls, {complete: 0, close: 1});
  b.open('chest');
  await b.click('[data-fw-finish]');
  assert.deepEqual(b.calls, {complete: 1, close: 1});
  assert.equal(b.bench.shown(), false);
  assert.ok(!Object.keys(b.ui.stored).some(k => k.includes('fieldwork.')));
});

test('invalid partial saves are discarded, and new-game reset clears work across chapters', async () => {
  const bad = 'until-we-return.fieldwork.1.roof';
  const room = workroom({initial: {[bad]: JSON.stringify({trail: ['under','no-such-action'], hints: 3, done: true})}});
  room.open('roof');
  assert.ok(room.dialog.querySelector('[data-fw-point="under"]'));
  assert.equal(room.dialog.querySelector('.fw-hint-text').textContent, '');
  await room.point('under');
  await room.click('[data-fw-close]');
  room.open('drill');
  await room.point('fresh');
  room.bench.reset();
  assert.equal(room.bench.shown(), false);
  assert.ok(!Object.keys(room.ui.stored).some(k => k.includes('fieldwork.')));
  room.open('roof');
  assert.ok(room.dialog.querySelector('[data-fw-point="under"]'));
});

test('blocked persistent storage still supports a cancel and resume in the same game', async () => {
  const room = workroom({blocked: true});
  room.open('landing');
  await room.point('high');
  await room.point('pay');
  await room.point('crest');
  await room.click('[data-fw-close]');
  room.open('landing');
  assert.equal(room.dialog.querySelector('[data-fw-point="crest"]').getAttribute('aria-pressed'), 'true');
  await room.point('trough');
  await room.click('[data-fw-finish]');
  assert.equal(room.calls.complete, 1);
});

test('a line can be laid by dragging its real endpoints, including cancel, a wrong lead and a repair', async()=>{
 const room=workroom();room.open('rig');const board=room.dialog.querySelector('.fw-board');
 function event(x,y){const box=board.getBoundingClientRect();return {pointerId:1,button:0,clientX:box.left+box.width*x/100,clientY:box.top+box.height*y/100,preventDefault(){}};}
 function drag(x,y,xx,yy){board.onpointerdown(event(x,y));board.onpointermove(event(xx,yy));board.onpointerup(event(xx,yy));}
 board.onpointerdown(event(60,91));board.onpointermove(event(48,31));board.onpointercancel();
 assert(room.dialog.querySelector('[data-fw-point="clew"]'));
 drag(60,91,48,31);drag(48,31,76,72);await room.point('lull');await room.point('haul');
 assert(!room.dialog.querySelector('[data-fw-finish]'));
 drag(48,31,35,76);await room.point('lull');await room.point('haul');await room.click('[data-fw-finish]');
 assert.equal(room.calls.complete,1);
});

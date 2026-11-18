'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');

test('the two grips, the grounded captain and the driven head agree on the slipway painting', async () => {
  const ui = app();
  for (const file of ['fieldwork.js', 'fieldwork-ui.js']) {
    const src = path.join(__dirname, '../dist', file);
    vm.runInContext(fs.readFileSync(src, 'utf8'), ui.context, {filename: src});
  }
  ui.context.CastawayBench.open('fastening', {complete() {}, close() {}});
  const dialog = ui.ids.get('workbench');
  const click = id => ui.click(dialog.querySelector('[data-fw-point="' + id + '"]'));
  const drawing = () => dialog.querySelector('.fw-drawing').innerHTML;
  const feet = id => {
    const figure = dialog.querySelector('[data-fw-actor="' + id + '"]');
    return [Number(figure.dataset.footX), Number(figure.dataset.footY)];
  };
  await click('pressPlank');
  // The lower corner of the trestle is visible behind the hand-off near x58%, y74%.
  assert(feet('musgrave')[1] > 77);
  const pass = dialog.querySelector('[data-fw-point="giveNails"]');
  assert.match(pass.getAttribute('style'), /top:47%/);
  assert.match(drawing(), /translate\(44\.8 47\.2\) scale\(-1 1\)/);
  await click('giveNails');
  await click('stern');
  assert.match(drawing(), /translate\(27 42\) scale\(1 1\)/);
  await click('bow');
  assert.match(drawing(), /translate\(76 35\) scale\(-1 1\)/);
  // The captain's feet are on the gravel beyond the sloping side of the support.
  const [workX, workY] = feet('musgrave');
  assert(workX > 68 && workY > 70.5);
  assert(feet('player')[0] - workX > 17);
  await click('strike');
  const ink = drawing();
  const wrist = ink.match(/translate\(([\d.]+) ([\d.]+)\) scale\(-1 1\) rotate\(([\d.]+)\)/);
  const fastener = ink.match(/<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="\.8"/);
  assert(wrist && fastener);
  const radians = Number(wrist[3]) * Math.PI / 180;
  // Centre of the dark striking face in the hammer's local SVG.
  const x = Number(wrist[1]) - (2.5 * Math.cos(radians) + 5.4 * Math.sin(radians));
  const y = Number(wrist[2]) + 2.5 * Math.sin(radians) - 5.4 * Math.cos(radians);
  assert(Math.hypot(x - Number(fastener[1]), y - Number(fastener[2])) < .25);
  await click('release');
  assert.match(drawing(), /musgrave-stand\.webp/);
  assert.match(drawing(), /player-stand\.webp/);
  assert.deepEqual(feet('musgrave'), [59, 81]);
  await click('proveJoint');
  assert.match(drawing(), /player-reach\.webp/);
  assert.match(drawing(), /musgrave-stand\.webp/);
  assert(dialog.querySelector('[data-fw-finish]'));
});

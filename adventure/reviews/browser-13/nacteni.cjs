'use strict';

// Reproduce two image-loading failures in the project's small DOM test double.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('../../tests/ui-contract.cjs');

const dist = path.join(__dirname, '../../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const scripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g), match => match[1]);
const key = 'castaways-adventure-v4';

function startGame(shouldFail, reduced = false) {
  // Load the same production scripts as the campaign handler tests. Inject the
  // image loader before app.js boots so that the very first request can fail.
  const ui = app({
    scripts: scripts.filter(name => name !== 'interface.js' && name !== 'app.js'),
    saveKey: key,
    initial: {'castaways-adventure-prefs': JSON.stringify({reduced})},
  });
  const requests = [];
  ui.context.Image = class ControlledImage {
    set src(file) {
      requests.push(file);
      const fail = shouldFail(file);
      queueMicrotask(() => {
        if (fail) this.onerror?.();
        else this.onload?.();
      });
    }
    decode() { return Promise.resolve(); }
  };
  vm.runInContext(fs.readFileSync(path.join(dist, 'app.js'), 'utf8'), ui.context, {filename: 'app.js'});
  return {ui, requests};
}

async function withMissingPainting() {
  const {ui, requests} = startGame(file => file.endsWith('/wreck.webp'), true);
  const before = ui.ids.get('backdrop').style.backgroundImage;
  await ui.travel('exit_wreck');
  const after = ui.ids.get('backdrop').style.backgroundImage;
  const room = ui.ids.get('scene').dataset.scene;
  const labels = ui.ids.get('targets').querySelectorAll('[data-target]').map(el => el.getAttribute('data-target'));
  assert(requests.some(file => file.endsWith('/wreck.webp')));
  assert.match(before, /beach\.webp/);
  assert.equal(after, before);
  assert.equal(ui.state().scene, 'wreck');
  assert.equal(room, 'wreck');
  assert(labels.includes('crate'));
  return {firstPainting: before, paintingAfterError: after, activeRoom: room, activeTargets: labels};
}

async function distinctPositions(ui, x) {
  const scene = ui.ids.get('scene');
  const actor = ui.ids.get('player');
  const before = actor.style.left;
  // Walk on free ground in the 1000 × 562.5 scene provided by the test double.
  scene.onclick({target: scene, clientX: x, clientY: 450});
  const positions = new Set();
  for (let frame = 0; frame < 180; frame++) {
    await ui.flush(1);
    if (actor.style.left !== before) positions.add(actor.style.left);
  }
  return positions.size;
}

async function withWalkSheet(failOnce) {
  let failures = 0;
  const sheet = /\/walk\/player\.(png|webp)$/;
  const {ui, requests} = startGame(file => {
    if (failOnce && sheet.test(file) && failures === 0) {
      failures++;
      return true;
    }
    return false;
  });
  await ui.flush(10);
  const first = await distinctPositions(ui, 200);
  const second = await distinctPositions(ui, 850);
  return {failures, imageRequests: requests.filter(file => sheet.test(file)).length, firstWalk: first, returnWalk: second};
}

async function main() {
  const room = await withMissingPainting();
  const healthy = await withWalkSheet(false);
  const failedOnce = await withWalkSheet(true);
  assert(healthy.firstWalk > 5 && healthy.returnWalk > 5);
  assert.deepEqual(failedOnce, {failures: 1, imageRequests: 1, firstWalk: 1, returnWalk: 1});
  console.log(JSON.stringify({room, walk: {healthy, failedOnce}}, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });

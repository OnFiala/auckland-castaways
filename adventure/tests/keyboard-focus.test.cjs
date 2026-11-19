'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');

const dist = path.join(__dirname, '../dist');
const read = name => fs.readFileSync(path.join(dist, name), 'utf8');
const scripts = [...read('index.html').matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)]
  .map(match => match[1]).filter(name => name !== 'interface.js');

function game({loadPaintings = false} = {}) {
  const ui = app({
    initial: {'castaways-adventure-prefs': '{"reduced":true}'},
    scripts: [],
    saveKey: 'castaways-adventure-v4'
  });
  const doc = ui.context.document;
  const element = id => ui.ids.get(id);
  const paintRequests = [];
  // Model the focus reset when a live node is removed. The shared double keeps
  // the old activeElement, which would hide the browser's reset to the body.
  const node = Object.getPrototypeOf(doc.body);
  const markup = Object.getOwnPropertyDescriptor(node, 'innerHTML');
  const remove = node.remove;
  function clearDetachedFocus(wasConnected) {
    if (wasConnected && !ui.activeElement()?.isConnected) doc.body.focus();
  }
  Object.defineProperty(node, 'innerHTML', {...markup, set(value) {
    const wasConnected = ui.activeElement()?.isConnected;
    markup.set.call(this, value);
    clearDetachedFocus(wasConnected);
  }});
  node.remove = function () {
    const wasConnected = ui.activeElement()?.isConnected;
    remove.call(this);
    clearDetachedFocus(wasConnected);
  };
  if (loadPaintings) {
    ui.context.Image = class {
      set src(file) {
        if (file.includes('/tidepaint/')) paintRequests.push(this);
        else queueMicrotask(() => this.onload?.());
      }
      removeAttribute() {}
    };
    const panel = element('scene-loading');
    panel.append(...['scene-load-message', 'scene-retry', 'scene-stay'].map(element));
    const close = panel.close.bind(panel);
    panel.close = () => {
      if (panel.contains(ui.activeElement())) doc.body.focus();
      close();
    };
  }
  for (const script of scripts) vm.runInContext(read(script), ui.context, {filename: script});
  // This harness starts the app after installing its focus double. Enter the
  // first scene before setting up the keyboard action under test.
  if (element('story-film').open) element('film-skip').onclick();
  const focusAndActivate = async control => { control.focus(); await ui.click(control); };
  const acceptPainting = async () => { paintRequests.at(-1).onload(); await ui.flush(12); };
  return {ui, element, focusAndActivate, acceptPainting, paintRequests};
}

test('collecting and combining with keyboard focus leads to the new satchel item', async () => {
  const {ui, focusAndActivate} = game();
  for (const id of ['rope', 'pole']) {
    const pickup = ui.target(id);
    await focusAndActivate(pickup);
    assert.equal(pickup.isConnected, false);
    assert.equal(ui.activeElement(), ui.item(id));
  }
  await focusAndActivate(ui.item('rope'));
  assert.equal(ui.activeElement(), ui.item('rope'));
  await focusAndActivate(ui.item('pole'));
  assert.equal(ui.activeElement(), ui.item('loopPole'));
  assert.deepEqual(ui.state().inventory, ['loopPole']);
});

test('a late pickup preserves a different button or an existing satchel item', async () => {
  const {ui, element, focusAndActivate} = game();
  const rope = ui.target('rope');
  rope.focus();
  const pickup = ui.click(rope);
  const reveal = element('reveal');
  reveal.focus();
  await ui.click(reveal);
  await pickup;
  assert.equal(ui.activeElement(), reveal);
  assert(ui.item('rope'));

  const pole = ui.target('pole');
  const satchelRope = ui.item('rope');
  pole.focus();
  const secondPickup = ui.click(pole);
  satchelRope.focus();
  await secondPickup;
  assert.equal(satchelRope.isConnected, false);
  assert.equal(ui.activeElement(), ui.item('rope'));

  await focusAndActivate(element('hint'));
  const close = element('modal-close');
  close.focus();
  ui.key('Escape');
  element('modal').close();
  assert.equal(ui.activeElement(), element('hint'));
});

test('a click with no focused source leaves focus alone', async () => {
  const {ui} = game();
  const body = ui.context.document.body;
  body.focus();
  await ui.click(ui.target('rope'));
  await ui.click(ui.target('pole'));
  await ui.click(ui.item('rope'));
  await ui.click(ui.item('pole'));
  assert.equal(ui.activeElement(), body);
  assert.deepEqual(ui.state().inventory, ['loopPole']);
});

test('loading and retry own focus until travel closes the panel', async () => {
  const {ui, element, focusAndActivate, acceptPainting, paintRequests} = game({loadPaintings: true});
  await acceptPainting();
  const exit = ui.exit('exit_wreck');
  await focusAndActivate(exit);
  assert.equal(ui.activeElement(), element('scene-load-message'));
  paintRequests.at(-1).onerror();
  const retry = element('scene-retry');
  assert.equal(ui.activeElement(), retry);
  await ui.click(retry);
  assert.equal(ui.activeElement(), element('scene-load-message'));
  await acceptPainting();
  assert.equal(ui.state().scene, 'wreck');
  assert.equal(exit.isConnected, false);
  assert.equal(ui.activeElement(), element('scene'));
});

test('leaving a loading panel returns focus to its opener when travel is cancelled', async () => {
  const {ui, element, focusAndActivate, acceptPainting} = game({loadPaintings: true});
  await acceptPainting();
  const exit = ui.exit('exit_wreck');
  await focusAndActivate(exit);
  await focusAndActivate(element('scene-stay'));
  assert.equal(ui.state().scene, 'beach');
  assert.equal(ui.activeElement(), exit);
});

test('travel does not take focus from a menu control selected during the walk', async () => {
  const {ui, element, acceptPainting} = game({loadPaintings: true});
  await acceptPainting();
  const exit = ui.exit('exit_wreck');
  const reveal = element('reveal');
  exit.focus();
  const travel = ui.click(exit);
  reveal.focus();
  await travel;
  assert.equal(ui.activeElement(), element('scene-load-message'));
  await acceptPainting();
  assert.equal(ui.state().scene, 'wreck');
  assert.equal(ui.activeElement(), reveal);
});

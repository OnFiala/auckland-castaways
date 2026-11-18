'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');

function archive() {
  const ui = app();
  const js = path.join(__dirname, '../dist/epilogue.js');
  vm.runInContext(fs.readFileSync(js, 'utf8'), ui.context, {filename: js});
  const ep = ui.context.CastawayEpilogue;
  const opener = ui.ids.get('open-epilogue');
  const stored = {...ui.stored};

  assert.equal(ep.shown(), false);
  opener.focus();
  ep.open();
  const dialog = ui.context.document.body.querySelector('dialog');
  const find = selector => dialog.querySelector(selector);
  const click = async (attr, value) => {
    const selector = value ? `[data-ep-${attr}="${value}"]` : `[data-ep-${attr}]`;
    const control = find(selector);
    assert.ok(control, `expected an available control for ${selector}`);
    await ui.click(control);
  };
  return {
    ui, ep, dialog, opener, find, click,
    message: () => find('.ep-status').textContent,
    html: () => find('.ep-content').innerHTML,
    async file(id, pocket) { await click('slip', id); await click('place', pocket); },
    unchangedCampaign() { assert.deepEqual(ui.stored, stored); }
  };
}

test('the archive files both witnesses and three events, corrects errors, and keeps the smoke unresolved', async () => {
  const a = archive();
  assert(a.ep.shown());
  assert.equal(a.ui.activeElement(), a.find('#ep-title'));
  assert.equal(a.find('[data-ep-page]'), null);
  await a.click('place', 'smith');
  assert.match(a.message(), /slips first/);
  assert.equal(a.ui.activeElement(), a.find('[data-ep-slip]'));
  await a.file('matches', 'smith');
  assert.match(a.message(), /captain/);
  assert.equal(a.find('[data-ep-slip="matches"]').getAttribute('aria-pressed'), 'true');
  await a.click('place', 'dalgarno');
  assert.match(a.message(), /filed with George Dalgarno/);
  assert(a.find('.ep-reread'));
  assert.equal(a.find('[data-ep-slip="matches"]'), null);
  assert.equal(a.ui.activeElement(), a.find('[data-ep-slip="boat"]'));

  await a.click('close');
  assert.equal(a.ep.shown(), false);
  assert.equal(a.ui.activeElement(), a.opener);
  a.ep.open();
  a.ep.open();
  assert.equal(a.ui.context.document.body.querySelectorAll('dialog').length, 1);
  assert.equal(a.find('[data-ep-slip="matches"]'), null, 'reopening preserves filed evidence');
  await a.file('boat', 'smith');
  assert.equal(a.ui.activeElement(), a.find('[data-ep-page="dates"]'));
  await a.click('page', 'dates');

  await a.file('rescue', 'wreckMay');
  assert.match(a.message(), /year after the wreck/);
  await a.click('place', 'rescueMay');
  await a.file('wreck', 'august');
  assert.match(a.message(), /year before/);
  await a.click('place', 'wreckMay');
  await a.file('slope', 'august');
  assert.equal(a.dialog.querySelectorAll('.ep-filed').length, 3);
  await a.click('page', 'mark');
  assert.match(a.html(), /23 August/);
  assert.match(a.html(), /chart-detail.webp/);
  await a.click('finding', 'fire');
  assert.match(a.message(), /did not establish/);
  await a.click('finding', 'camp');
  assert.match(a.message(), /reached Callao/);
  assert.equal(a.find('.ep-coda'), null);
  await a.click('finding', 'unresolved');
  assert.match(a.html(), /George Dalgarno, Andrew Smith and Robert Holding/);
  assert.match(a.html(), /Origin unknown/);
  assert(a.find('.ep-sources'));
  const links = a.dialog.querySelectorAll('a');
  assert.equal(links.length, 5);
  assert(links.every(a => a.getAttribute('href')));
  await a.click('reset');
  assert.equal(a.dialog.querySelectorAll('[data-ep-slip]').length, 2);
  assert.equal(a.find('.ep-filed'), null);
  assert.equal(a.ui.activeElement(), a.find('#ep-title'));
  a.unchangedCampaign();
});

test('a new game can reset an open or closed archive without touching the saved campaign', async () => {
  const a = archive();
  await a.file('boat', 'smith');
  a.ep.reset();
  assert(a.ep.shown());
  assert.equal(a.dialog.querySelectorAll('[data-ep-slip]').length, 2);
  await a.file('boat', 'smith');
  await a.click('close');
  a.ep.reset();
  assert.equal(a.ep.shown(), false);
  a.ep.open();
  assert(a.find('[data-ep-slip="boat"]'));
  assert.equal(a.find('.ep-filed'), null);
  assert.equal(a.message(), '');
  a.unchangedCampaign();
});

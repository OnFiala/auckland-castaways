'use strict';
// Run on a machine with Playwright and Chromium. Uses a fresh browser profile.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const {chromium} = require('playwright');
const engine = require('../dist/voyage.js');

function completedCampaign() {
  let state = engine.createGame();
  for (let i = 0; i < 250 && !state.completed; i++) {
    if (state.chapterComplete) {
      state = engine.advance(state).state;
      continue;
    }
    const h = engine.hint(state);
    if (state.scene !== h.sceneId) {
      // Walk the shortest connected path to the next meaningful action.
      const paths = [[state.scene]], seen = new Set([state.scene]);
      for (const route of paths) {
        if (route.at(-1) === h.sceneId) {
          state = engine.travel(state, route[1]).state;
          break;
        }
        for (const exit of engine.getExits({...state, scene: route.at(-1)})) {
          if (!seen.has(exit.to)) { seen.add(exit.to); paths.push([...route, exit.to]); }
        }
      }
    } else if (h.combineItems) state = engine.combine(state, ...h.combineItems).state;
    else if (h.itemId) state = engine.useItem(state, h.itemId, h.targetId).state;
    else state = engine.interact(state, h.targetId, 'use').state;
  }
  assert(state.completed && engine.restore(state), 'produce a restorable campaign finale');
  return state;
}

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const save = completedCampaign();
    for (const mobile of [false, true]) {
      const page = await browser.newPage({
        viewport: mobile ? {width: 360, height: 780} : {width: 1280, height: 800},
        hasTouch: mobile,
        reducedMotion: 'reduce'
      });
      const url = 'http://127.0.0.1:19164/index.html';
      const base = path.resolve(__dirname, '../dist');
      await page.route('http://127.0.0.1:19164/**', async route => {
        const asset = path.resolve(base, '.' + new URL(route.request().url()).pathname);
        if (!asset.startsWith(base + path.sep)) return route.abort();
        await route.fulfill({path: asset});
      });
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto(url);
      assert.equal(await page.locator('#open-epilogue').isVisible(), false);
      await page.evaluate(s => localStorage.setItem('castaways-adventure-v4', JSON.stringify(s)), save);
      await page.reload();
      const now = () => page.evaluate(() => localStorage.getItem('castaways-adventure-v4'));
      const saved = await now();
      const button = page.locator('#open-epilogue'), dialog = page.locator('#witness-archive');
      const open = async () => { await button.focus(); await page.keyboard.press('Enter'); };
      const use = async selector => {
        const target = dialog.locator(selector);
        if (mobile) await target.tap();
        else { await target.focus(); await page.keyboard.press('Enter'); }
      };
      const file = async (slip, place) => {
        await use('[data-ep-slip="' + slip + '"]');
        await use('[data-ep-place="' + place + '"]');
      };
      await open();
      assert(await dialog.isVisible() && await page.evaluate(() => CastawayEpilogue.shown()));
      const wide = () => dialog.evaluate(d => d.scrollWidth <= d.clientWidth);
      assert(await wide(), 'all controls fit at chosen width');
      await dialog.locator('img').evaluateAll(images => Promise.all(images.map(i => i.decode())));
      if (process.env.EPILOGUE_PROOF_DIR) {
        await fs.mkdir(process.env.EPILOGUE_PROOF_DIR, {recursive: true});
        await dialog.screenshot({path: path.join(process.env.EPILOGUE_PROOF_DIR, mobile ? 'mobile.png' : 'desktop.png')});
      }
      await use('[data-ep-place="smith"]');
      assert.match(await dialog.locator('.ep-status').textContent(), /slips first/);
      await file('boat', 'dalgarno');
      assert.match(await dialog.locator('.ep-status').textContent(), /mate wrote home/);
      await use('[data-ep-place="smith"]');
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'open-epilogue');
      await open();
      assert.equal(await dialog.locator('.ep-filed').count(), 1);
      await file('matches', 'dalgarno');
      await use('[data-ep-page="dates"]');
      await file('rescue', 'wreckMay');
      assert.match(await dialog.locator('.ep-status').textContent(), /year after/);
      await use('[data-ep-place="rescueMay"]');
      await file('wreck', 'wreckMay');
      await file('slope', 'august');
      await use('[data-ep-page="mark"]');
      assert(await wide());
      await use('[data-ep-finding="camp"]');
      assert.match(await dialog.locator('.ep-status').textContent(), /Callao/);
      await use('[data-ep-finding="fire"]');
      assert.match(await dialog.locator('.ep-status').textContent(), /did not establish/);
      await use('[data-ep-finding="unresolved"]');
      const coda = await dialog.locator('.ep-coda').innerText();
      for (const name of ['George Dalgarno', 'Andrew Smith', 'Robert Holding']) assert(coda.includes(name));
      await use('summary');
      assert.equal(await dialog.locator('.ep-sources a:visible').count(), 5);
      assert.equal(await dialog.locator('img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)), true);
      await use('[data-ep-reset]');
      assert.equal(await dialog.locator('[data-ep-slip]').count(), 2);
      await use('[data-ep-close]');
      assert.equal(await now(), saved, 'archival work must not mutate the campaign');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Epilogue passed in Chromium at 1280×800 with keyboard and 360×780 with touch, both with reduced motion.');
  } finally {
    await browser.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });

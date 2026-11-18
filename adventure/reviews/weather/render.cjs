/* Regenerate the mounted comparison with Node and @napi-rs/canvas. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const dist = path.resolve(__dirname, '../../dist');
const world = require(path.join(dist, 'voyage-world.js'));
const source = fs.readFileSync(path.join(dist, 'weather.js'), 'utf8');

function painting(state) {
  if (state.scene === 'camp') return state.flags.shelterBuilt ? 'assets/states/camp-shelter.png' : 'assets/camp.png';
  return world.background(state);
}

// The DOM boundary supplies a native 2D canvas. All weather and contact marks
// come from the same renderer, clock and public calls used in the adventure.
function weatherFixture() {
  const document = {
    hidden: false, querySelector: () => null,
    createElement: name => name === 'canvas' ? createCanvas(1, 1) : { style: {} }
  };
  const root = {
    dataset: {}, ownerDocument: document, setAttribute() {}, closest: () => null,
    replaceChildren(...nodes) { this.children = nodes; }, getBoundingClientRect: () => ({ width: 1152 })
  };
  let timer, frame, clock = 500;
  const window = {
    CastawayWorld: { background: painting }, devicePixelRatio: 1,
    setTimeout(fn) { timer = fn; return 1; }, clearTimeout() { timer = null; },
    requestAnimationFrame(fn) { frame = fn; return 2; }, cancelAnimationFrame() { frame = null; }
  };
  vm.runInNewContext(source, { window }, { filename: 'weather.js' });
  return { root, weather: window.CastawayWeather, tick() {
    clock += 50;
    if (timer) { const fn = timer; timer = null; fn(); }
    if (frame) { const fn = frame; frame = null; fn(clock); }
  } };
}

const dry = { rigSecured: true, boatDry: true, sailMended: true, courseSet: true };
const rows = [
  { name: 'Rain at the shelter', place: 'Carnley Harbour  /  January 1864', panels: [
    { scene: 'camp', title: 'Open frame', note: 'Rain falls between the unroofed poles.', crop: [44, 24, 51], detail: [60.8, 46.8, 17], shelter: 'bare frame' },
    { scene: 'camp', title: 'Canvas overhead', note: 'Water runs off the low edge of the sail.', crop: [44, 24, 51], detail: [60.8, 46.8, 17], shelter: 'canvas lee', cover: true }
  ] },
  { name: 'Winter at Epigwaitt', place: 'Auckland Island  /  Winter 1864', panels: [
    { scene: 'forest', title: 'At the stream', note: 'Wet snow crosses the track above the meltwater.', crop: [8, 29.5, 59], detail: [46, 42, 21], cold: 'woods' },
    { scene: 'cabin', title: 'Inside the house', note: 'Sleet passes behind the four windowpanes.', crop: [7, 10.6, 34.6], detail: [14.2, 20.3, 14.4], cold: 'glass' }
  ] },
  { name: 'Water in the open boat', place: 'Southern Ocean  /  July 1865', panels: [
    { scene: 'crossing', title: 'Before bailing', note: 'A footstep disturbs water inside the rail.', crop: [39, 37.9, 54], detail: [60.3, 73.6, 12], flags: { rigSecured: true }, splash: true },
    { scene: 'crossing', title: 'Bailed and under way', note: 'The same step lands on dry boards.', crop: [39, 37.9, 54], detail: [60.3, 73.6, 12], flags: dry, splash: false }
  ] }
];

async function renderPanel(spec) {
  const { root, weather, tick } = weatherFixture();
  const state = { scene: spec.scene, flags: { ...spec.flags } };
  weather.render(root, state);
  for (let frame = 1; frame <= 37; frame++) {
    if (spec.cover && frame === 29) {
      state.flags.shelterBuilt = true;
      weather.render(root, state);
      assert.equal(weather.respond(root, state, 'shelter'), true);
    }
    if (typeof spec.splash === 'boolean' && frame === 34) {
      assert.equal(weather.footfall(root, state, 65.7, 77.7), spec.splash);
    }
    tick();
  }
  const model = weather.describe(state);
  if (spec.shelter) assert.equal(model.shelter, spec.shelter);
  if (spec.cold === 'woods') assert.ok(model.zones.some(z => z.medium === 'snow' && z.depth === 'near'));
  if (spec.cold === 'glass') assert.equal(model.zones.filter(z => z.medium === 'sleet').length, 4);
  if (typeof spec.splash === 'boolean') assert.equal(model.effects.some(e => e.id === 'water surging in bilge'), spec.splash);
  const layer = root.children[1];
  assert.equal(layer.width, 1152);
  assert.equal(layer.height, 648);
  const base = await loadImage(path.join(dist, painting(state)));
  weather.dispose(root);
  return { base, layer };
}

const pageW = 2240, pageH = 2440, margin = 76, gutter = 34;
const panelW = (pageW - 2 * margin - gutter) / 2, panelH = 479;
const paper = '#f4efe4', ink = '#262b29', muted = '#4d5653', line = '#c5bbae', rust = '#855239';

function text(ctx, value, x, y, size, family, color = ink, align = 'left') {
  ctx.fillStyle = color; ctx.font = `${size}px "${family}"`; ctx.textAlign = align;
  ctx.fillText(value, x, y);
}
function rule(ctx, y) { ctx.fillStyle = line; ctx.fillRect(margin, y, pageW - 2 * margin, 2); }

function drawCrop(ctx, source, crop, x, y, width = panelW, height = panelH) {
  const [left, top, w] = crop;
  const h = w * (16 / 9) * height / width;
  ctx.drawImage(source, source.width * left / 100, source.height * top / 100,
    source.width * w / 100, source.height * h / 100, x, y, width, height);
}

async function main() {
  const page = createCanvas(pageW, pageH), ctx = page.getContext('2d');
  ctx.fillStyle = paper; ctx.fillRect(0, 0, pageW, pageH);
  text(ctx, 'AUCKLAND CASTAWAYS', margin, 73, 27, 'Noto Sans', rust);
  text(ctx, 'PAINTED WORLD  /  FIELD STUDIES', pageW - margin, 73, 25, 'Noto Sans', muted, 'right');
  text(ctx, 'Weather on the island and at sea', margin - 2, 165, 84, 'Noto Serif Display');
  text(ctx, 'Each painted detail is paired with an isolated sample of the game’s weather layer.', margin, 222, 32, 'Noto Sans', muted);
  rule(ctx, 262);
  for (const [index, row] of rows.entries()) {
    const y = 301 + index * 705;
    text(ctx, row.name, margin, y + 37, 43, 'Noto Serif Display');
    text(ctx, row.place, pageW - margin, y + 32, 27, 'Noto Sans', muted, 'right');
    for (const [col, panel] of row.panels.entries()) {
      const x = margin + col * (panelW + gutter);
      const { base, layer } = await renderPanel(panel);
      drawCrop(ctx, base, panel.crop, x, y + 63);
      drawCrop(ctx, layer, panel.crop, x, y + 63);
      ctx.strokeStyle = '#877e72'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 63.5, panelW - 1, panelH - 1);
      text(ctx, panel.title, x, y + 590, 36, 'Noto Serif Display');
      text(ctx, panel.note, x, y + 630, 26, 'Noto Sans', muted);
      const swatchW = 247, swatchH = 84, sx = x + panelW - swatchW, sy = y + 553;
      assert.ok(ctx.measureText(panel.note).width < panelW - swatchW - 14, `Caption too long: ${panel.note}`);
      ctx.fillStyle = '#393e3b'; ctx.fillRect(sx, sy, swatchW, swatchH);
      drawCrop(ctx, layer, panel.detail, sx, sy, swatchW, swatchH);
    }
  }
  rule(ctx, 2387);
  text(ctx, 'Original game paintings and native Canvas 2D weather  /  Fixed-time details', margin, 2420, 22, 'Noto Sans', muted);
  fs.writeFileSync(path.join(__dirname, 'world-response.webp'), page.toBuffer('image/webp', 92));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

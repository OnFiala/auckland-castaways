'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {spawnSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const {app} = require('./ui-contract.cjs');
const engine = require('../dist/voyage.js');

const dist = path.join(__dirname, '../dist');
const beds = ['shore', 'hearth', 'forge', 'timbers', 'crossing', 'promise', 'homecoming'];
const cues = ['shelter-cue', 'craft-cue', 'setback-cue', 'horizon-cue'];
const track = name => 'assets/island-score/' + name + '.mp3';
const here = new URL('file:///game/index.html');
const audible = element => !element.paused && !element.muted && element.volume > 0;

class Media extends EventTarget {
  constructor() {
    super();
    this.src = '';
    this.currentTime = 0;
    this.paused = true;
    this.ended = false;
    this.muted = false;
    this.volume = 1;
    this.allowed = true;
    this.plays = [];
  }
  get currentSrc() { return this.src && new URL(this.src, here).href; }
  getAttribute(name) { return this[name] || null; }
  setAttribute(name, value) { this[name] = value; }
  removeAttribute(name) { delete this[name]; }
  load() { this.currentTime = 0; this.paused = true; }
  async play() {
    if (!this.allowed) throw new DOMException('A gesture is required', 'NotAllowedError');
    if (this.paused && this.src) this.plays.push(this.src);
    this.paused = false;
    this.ended = false;
    this.dispatchEvent(new Event('playing'));
  }
  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
}

// Use the native-volume path of the local-file edition. Simulated frames also
// let fades finish without sleeping or requiring a particular fade duration.
function game(volume = 65, online = {}) {
  let now = 0, next = 0;
  const timers = new Map();
  const later = (callback, delay = 0) => {
    timers.set(++next, {callback, time:now + delay});
    return next;
  };
  async function settle() {
    for (let i = 0; i < 200; i++) {
      now += 20;
      for (const [id, timer] of [...timers]) {
        if (timer.time <= now && timers.delete(id)) timer.callback(now);
      }
      await Promise.resolve();
    }
  }
  const document = Object.assign(new EventTarget(), {hidden:false, visibilityState:'visible', baseURI:here.href});
  const context = Object.assign(new EventTarget(), {
    document, location:here, console, URL, Event, Date:class extends Date { static now() { return now; } },
    performance:{now:() => now},
    requestAnimationFrame:callback => later(callback, 16), cancelAnimationFrame:id => timers.delete(id),
    setTimeout:later, clearTimeout:id => timers.delete(id)
  }, online);
  context.window = context;
  const bed = new Media(), accent = new Media();
  vm.runInNewContext(fs.readFileSync(path.join(dist, 'island-score.js'), 'utf8'), context);
  const score = context.CastawayScore.create({bed, accent, volume});
  async function start(chapter = 1) {
    score.setChapter(chapter);
    score.unlock();
    await settle();
  }
  function hide(hidden) {
    document.hidden = hidden;
    document.visibilityState = hidden ? 'hidden' : 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
  }
  return {bed, accent, score, start, settle, hide};
}

test('the seven chapters select seven playable loops; updating the same scene keeps its place', async () => {
  const {bed, accent, score, start, settle} = game();
  await start();
  for (const [index, name] of beds.entries()) {
    score.setChapter(index + 1);
    await settle();
    assert.ok(bed.currentSrc.endsWith('/' + track(name)), name);
    assert.ok(bed.loop && audible(bed), name);
    bed.currentTime = 12;
    score.setChapter(index + 1);
    score.unlock();
    await settle();
    assert.equal(bed.currentTime, 12, 'same chapter should keep its musical phrase');
    assert.ok(!audible(accent), 'loading a chapter does not play a puzzle accent');
  }
});

test('a gesture retries browser-blocked music, including a gesture during a film', async () => {
  const {bed, accent, score, settle} = game();
  bed.allowed = accent.allowed = false;
  score.setChapter(1);
  await settle();
  assert.ok(!audible(bed));
  score.setFilm(true);
  bed.allowed = accent.allowed = true;
  score.unlock();
  await settle();
  assert.ok(!audible(bed) && !audible(accent));
  score.setFilm(false);
  await settle();
  assert.ok(audible(bed));
});

test('conversation ducks the score and player volume survives being hidden or in a film', async () => {
  const {bed, accent, score, start, settle, hide} = game();
  await start();
  const before = bed.volume;
  score.setDialogue(true);
  await settle();
  assert.ok(audible(bed) && bed.volume < before, 'leave space for the speaker');
  score.setDialogue(false);
  await settle();
  assert.ok(Math.abs(bed.volume - before) < .01);
  score.setVolume(25);
  await settle();
  assert.ok(audible(bed) && bed.volume < before);
  score.resolved({}, {fireLit:true});
  await settle();
  hide(true);
  await settle();
  assert.ok(!audible(bed) && !audible(accent));
  score.setFilm(true);
  hide(false);
  await settle();
  assert.ok(!audible(bed) && !audible(accent), 'the film still owns the mix');
  score.setVolume(0);
  score.setFilm(false);
  score.unlock();
  await settle();
  assert.ok(!audible(bed) && !audible(accent), 'explicit silence survives new gestures');
  score.setVolume(60);
  await settle();
  assert.ok(audible(bed));
  assert.ok(!audible(accent), 'the old accent must not replay');
});

test('a newly solved situation gets one musical answer; pickups, inspections and past flags get none', async () => {
  for (const [chapter, flag, cue] of [[1,'fireLit','shelter-cue'], [3,'drillFailed','setback-cue'],
    [3,'nailsForged','craft-cue'], [5,'courseSet','horizon-cue']]) {
    const {accent, score, start, settle} = game();
    await start(chapter);
    const old = {ropeTaken:true};
    const solved = {...old, [flag]:true};
    score.resolved({}, old);
    score.resolved(old, old);
    await settle();
    assert.equal(accent.plays.length, 0, 'routine actions');
    score.resolved(old, solved);
    await settle();
    assert.equal(accent.plays.length, 1, flag);
    assert.ok(accent.currentSrc.endsWith('/' + track(cue)), flag);
    accent.pause();
    score.resolved(solved, {...solved});
    await settle();
    assert.equal(accent.plays.length, 1, 'a resolved flag is not rewarded again');
  }
});

test('slow hosted downloads cannot start a previous chapter or a puzzle cue over a film', async () => {
  const pending = new Map(), starts = [];
  class AudioContext {
    state = 'running';
    currentTime = 0;
    destination = {};
    async decodeAudioData(name) { return {name, duration:42}; }
    createBufferSource() {
      return {
        connect() {}, disconnect() {},
        start() { starts.push(this); },
        stop() { this.stopped = true; this.onended?.(); }
      };
    }
    createGain() {
      return {gain:{cancelAndHoldAtTime() {}, linearRampToValueAtTime() {}}, connect() {}, disconnect() {}};
    }
  }
  const online = {
    AudioContext, location:new URL('https://game.example/'),
    fetch:address => new Promise(resolve => pending.set(address, () => resolve({
      ok:true, arrayBuffer:async () => address
    })))
  };
  const {score, settle} = game(65, online);
  score.setChapter(1);
  score.setChapter(2);
  pending.get(track('hearth'))();
  pending.get(track('shore'))();
  await settle();
  assert.deepEqual(starts.map(source => source.buffer.name), [track('hearth')]);
  assert.ok(starts[0].loop);
  score.resolved({}, {roofSealed:true});
  score.setFilm(true);
  pending.get(track('shelter-cue'))();
  await settle();
  assert.ok(starts[0].stopped, 'the film soundtrack has the sound output to itself');
  assert.equal(starts.length, 1, 'the late puzzle accent was discarded');
  score.setFilm(false);
  await settle();
  assert.deepEqual(starts.map(source => source.buffer.name), [track('hearth'), track('hearth')]);
});

test('a hosted audio-decoding failure falls back to the same chapter on the media element', async () => {
  class AudioContext {
    state = 'running';
    async decodeAudioData() { throw Error('decoder unavailable'); }
  }
  const online = {
    AudioContext, location:new URL('https://game.example/'),
    fetch:async () => ({ok:true, arrayBuffer:async () => new ArrayBuffer(0)})
  };
  const {bed, score, start, settle} = game(65, online);
  await start(4);
  assert.ok(bed.currentSrc.endsWith('/' + track('timbers')) && audible(bed));
  score.setFilm(true);
  await settle();
  assert.ok(!audible(bed));
});

function mountCampaign(initial = {}) {
  const entry = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const scripts = [...entry.matchAll(/<script defer src="([^"]+)"/g)].map(match => match[1])
    .filter(name => name !== 'app.js' && name !== 'interface.js');
  const ui = app({initial, scripts, saveKey:'castaways-adventure-v4', skipFilms:false});
  const {context, ids} = ui;
  context.location = here;
  context.document.addEventListener = () => {};
  context.Date = class extends Date { static now() { return context.performance.now(); } };
  const bed = new Media(), accent = new Media();
  ids.set('score-bed', bed);
  ids.set('score-accent', accent);
  const video = ids.get('film-video');
  video.pause = () => { video.paused = true; };
  video.play = async () => { video.paused = false; };
  video.load = () => {};
  video.removeAttribute = attr => delete video.attrs[attr];
  ids.get('film-track').removeAttribute = attr => delete ids.get('film-track').attrs[attr];
  vm.runInContext(fs.readFileSync(path.join(dist, 'app.js'), 'utf8'), context, {filename:'app.js'});
  return Object.assign(ui, {bed, accent});
}

test('the real prologue and journey replay yield to the first playable chapter and take the sound back', async () => {
  const ui = mountCampaign();
  assert.ok(ui.ids.get('story-film').open);
  assert.equal(ui.bed.plays.length, 0, 'the shore music waits for the playable picture');
  await ui.click('film-begin');
  assert.equal(ui.bed.plays.length, 0, 'beginning the film keeps its overture clear of the shore music');
  await ui.click('film-skip');
  assert.equal(ui.bed.plays.length, 1);
  assert.ok(ui.bed.currentSrc.endsWith('/' + track('shore')));
  await ui.click('journey');
  await ui.click(ui.ids.get('modal-body').querySelector('[data-replay-film]'));
  assert.ok(ui.ids.get('story-film').open && ui.bed.paused);
  await ui.click('film-skip');
  assert.ok(!ui.bed.paused);
  assert.equal(ui.accent.plays.length, 0);
});

test('working the hearth plays its phrase, then the volume setting and the solved fire survive reload', async () => {
  let state = engine.createGame();
  const actions = [
    ['interact','rope','take'], ['interact','pole','take'], ['combine','rope','pole'],
    ['useItem','loopPole','sail'], ['travel','wreck'], ['interact','prybar','take'],
    ['useItem','prybar','crate'], ['travel','beach'], ['useItem','axe','driftwood'],
    ['travel','camp'], ['useItem','canvas','shelter'], ['useItem','firewood','hearth']
  ];
  for (const [action, ...args] of actions) state = engine[action](state, ...args).state;
  assert.ok(engine.restore(state) && !state.flags.fireLit);
  const prefs = 'castaways-adventure-prefs';
  const ui = mountCampaign({'castaways-adventure-v4':JSON.stringify(state), [prefs]:JSON.stringify({reduced:true})});
  assert.equal(ui.accent.plays.length, 0, 'restoring a partly solved camp has no accent');
  await ui.use('tinderbox', 'hearth');
  assert.ok(ui.state().flags.fireLit);
  assert.equal(ui.accent.plays.length, 1);
  assert.ok(ui.accent.currentSrc.endsWith('/' + track('shelter-cue')));
  await ui.click('settings');
  const volume = ui.ids.get('music-volume');
  volume.value = '0';
  volume.oninput();
  assert.equal(volume.getAttribute('aria-valuetext'), 'Off');
  assert.equal(JSON.parse(ui.stored[prefs]).music, 0);
  const restored = mountCampaign(ui.stored);
  assert.ok(restored.state().flags.fireLit && restored.bed.paused);
  assert.equal(restored.accent.plays.length, 0);
  await restored.click('settings');
  assert.equal(restored.ids.get('music-volume').value, '0');
});

test('all chapter beds and accents ship as distinct, decodable stereo MP3s', t => {
  const files = [...beds, ...cues].map(name => path.join(dist, track(name)));
  for (const file of files) assert.ok(fs.statSync(file).size > 0, file);
  for (const tool of ['ffprobe','ffmpeg']) {
    if (spawnSync(tool, ['-version']).error?.code === 'ENOENT') return t.skip(tool + ' is not installed');
  }
  const durations = files.map(file => {
    const output = spawnSync('ffprobe', ['-v','error','-show_entries','stream=codec_name,channels:format=duration','-of','json',file],
      {encoding:'utf8'});
    assert.equal(output.status, 0, output.stderr);
    const {streams, format} = JSON.parse(output.stdout);
    assert.equal(streams.length, 1, file);
    assert.deepEqual(streams[0], {codec_name:'mp3', channels:2}, file);
    const pcm = spawnSync('ffmpeg', ['-v','error','-xerror','-i',file,'-map','0:a:0',
      '-ac','1','-ar','8000','-f','s16le','pipe:1'], {maxBuffer:8 * 1024 * 1024});
    assert.equal(pcm.status, 0, pcm.stderr?.toString());
    assert.ok(pcm.stdout.some(byte => byte !== 0), 'the decoded score contains music: ' + file);
    return Number(format.duration);
  });
  assert.ok(durations.every(duration => duration > 0 && Number.isFinite(duration)));
  assert.ok(Math.min(...durations.slice(0, beds.length)) > Math.max(...durations.slice(beds.length)));
  const hashes = files.map(file => createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
  assert.equal(new Set(hashes).size, files.length, 'each file carries its own edit');
});

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {app} = require('./ui-contract.cjs');
const dist = path.join(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const appScript = fs.readFileSync(path.join(dist, 'app.js'), 'utf8');
const gameKey = 'castaways-adventure-v4', filmKey = 'castaways-film-prefs-v1';
const storyKey = 'castaways-story-v1';
const timeline = require('../dist/story-film-script.js').timeline;
const firstCards = timeline[0].shots.filter(shot => shot.titleCard);
const introLead = firstCards.reduce((sum, shot) => sum + shot.seconds, 0);
// Install a controllable native media element before the campaign starts the first reel.
const scripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map(m => m[1])
  .filter(name => !['interface.js','story-film-captions.js','story-film-compat.js','film-interface.js','app.js'].includes(name));

function mount(initial = {}, setup = () => {}, begin = true) {
  const ui = app({initial, scripts, saveKey:gameKey, skipFilms:false});
  const {context} = ui, el = id => ui.ids.get(id), video = el('film-video'), track = el('film-track');
  for (const node of [video, track]) {
    Object.defineProperty(node,'src',{get:() => node.getAttribute('src'),set:src => node.setAttribute('src',src)});
    node.removeAttribute = k => delete node.attrs[k];
  }
  let unloaded = 0;
  video.paused = true;
  video.currentTime = 0;
  video.load = () => { unloaded++; video.currentTime = 0; };
  const permitPlay = () => { video.paused = false; video.ended = false; video.onplay(); return Promise.resolve(); };
  video.play = permitPlay;
  video.pause = () => { video.paused = true; video.onpause(); };
  context.location = {protocol:'file:'};
  context.storyFilmCaptions = {prologue:[
    {start:introLead+.4,end:introLead+2,text:'First phrase'},
    {start:introLead+2,end:introLead+4.5,text:'Second phrase'}
  ]};
  const parts = {ui, context, el, video, track, panel:el('story-film'), permitPlay, unloaded:() => unloaded};
  setup(parts);
  vm.runInContext(appScript, context, {filename:'app.js'});
  if (begin && parts.panel.dataset.mode === 'foreword') el('film-begin').onclick();
  return parts;
}

function useProjection(context, projections) {
  context.CastawayFilmFallback = {
    prime() {},
    start(options) {
      const state = {...options, currentTime:options.time, stopped:false};
      projections.push(state);
      return {
        get currentTime() { return state.currentTime; },
        pause() { state.paused = true; },
        resume() { state.paused = false; },
        setMuted(value) { state.muted = value; },
        stop() { state.stopped = true; }
      };
    }
  };
}

test('a fresh game holds a silent foreword for the reader and the journal replays the film directly', async () => {
  const {ui,el,video,panel} = mount({}, () => {}, false);
  assert(panel.open);
  assert.equal(panel.dataset.film, 'prologue');
  assert.equal(panel.dataset.mode, 'foreword');
  assert.equal(panel.getAttribute('aria-labelledby'), 'foreword-title');
  assert.equal(ui.activeElement(),el('film-begin'));
  assert.equal(video.src, null);
  assert(video.paused && el('film-skip').hidden && el('film-play').hidden);
  ui.runTimers();
  assert.equal(panel.dataset.mode, 'foreword');
  const held = mount(ui.stored, () => {}, false);
  assert.equal(held.panel.dataset.mode, 'foreword', 'reloading an unread page keeps it open');
  await ui.click('film-begin');
  assert.equal(panel.dataset.mode, 'movie');
  assert.equal(panel.getAttribute('aria-labelledby'), 'film-title');
  assert.equal(el('film-card-text').textContent, firstCards[0].line);
  assert.equal(video.src, 'assets/story-film/prologue.mp4');
  assert.equal(video.paused, false);
  assert(el('film-play').hidden && el('film-read').hidden);
  assert.equal(mount(ui.stored, () => {}, false).panel.dataset.mode, 'movie', 'accepted at exactly zero resumes playback');
  const before = ui.stored[gameKey];
  await ui.click('film-skip');
  assert(!panel.open);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
  assert.equal(ui.stored[gameKey],before);
  const restored = mount(ui.stored);
  assert(!restored.panel.open);
  await restored.ui.click('journey');
  const entries = restored.el('modal-body').querySelectorAll('[data-replay-film]');
  assert.equal(entries.length,1);
  await restored.ui.click(entries[0]);
  assert.equal(restored.panel.dataset.mode,'movie');
  assert(!restored.video.paused);
  await restored.ui.click('film-skip');
  assert.equal(restored.ui.activeElement(),entries[0]);
  assert(restored.el('modal').open);
});

test('captions track native boundaries, pauses, seeks, mute and a natural end', async () => {
  const {ui,el,panel,video,track,unloaded} = mount();
  await ui.click('film-mute');
  assert.equal(track.src,null,'offline captions use the packaged cue table');
  assert(video.muted);
  video.currentTime = firstCards[0].seconds; video.onseeked();
  assert.equal(el('film-card-text').textContent,firstCards[1].line);
  assert(el('film-caption').hidden);
  for (const [offset,line] of [[0,''],[.4,'First phrase'],[2,'Second phrase'],[4.5,''],[1,'First phrase']]) {
    video.currentTime = introLead + offset; video.onseeked();
    assert.equal(el('film-caption').textContent,line);
    assert.equal(el('film-caption').hidden,!line);
    assert.equal(el('film-card-text').textContent,'');
  }
  await ui.click('film-pause');
  assert(video.paused);
  assert.equal(el('film-pause').getAttribute('aria-pressed'),'true');
  await ui.click('film-captions');
  assert(el('film-caption').hidden);
  await ui.click('film-pause');
  video.ended = true; video.onended();
  assert(!panel.open);
  assert(video.paused);
  assert.equal(unloaded(),1);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
});

test('the first shore in an older save starts its film once and an interrupted campaign resumes in place', async () => {
  const checkpoint = storyKey;
  const fresh = mount();
  const original = fresh.ui.stored[gameKey];
  const previousVersion = {[gameKey]:original, [checkpoint]:JSON.stringify({openingSeen:true,pending:null})};
  assert.equal(mount(previousVersion, () => {}, false).panel.dataset.mode,'foreword','the new foreword reaches an untouched old shore');
  const optedOut = mount({...previousVersion,[filmKey]:JSON.stringify({chapters:'skip'})}, () => {}, false);
  assert(!optedOut.panel.open,'the saved preference to skip films is honoured');
  let leave;
  const migrated = mount({[gameKey]:original}, ({context}) => {
    const listen = context.addEventListener;
    context.addEventListener = (event, handler) => {
      if (event === 'pagehide') leave = handler;
      listen(event, handler);
    };
  });
  assert.equal(migrated.panel.dataset.film,'prologue');
  migrated.video.currentTime = 21.375;
  leave();
  assert.equal(JSON.parse(migrated.ui.stored[checkpoint]).pending.position,21.375);
  const resumed = mount(migrated.ui.stored);
  assert.equal(resumed.context.CastawayFilm.position(),21.375);
  resumed.video.duration=66+introLead;
  resumed.video.onloadedmetadata();
  assert.equal(resumed.video.currentTime,21.375);
  await resumed.ui.click('film-skip');
  assert.equal(resumed.ui.stored[gameKey],original);
  const played = JSON.parse(resumed.ui.stored[checkpoint]);
  assert(played.openingSeen && played.pending === null);
  const reopened = mount(resumed.ui.stored);
  assert(!reopened.panel.open);
  await reopened.ui.pick('rope');
  const inProgress = mount({[gameKey]:reopened.ui.stored[gameKey], [checkpoint]:migrated.ui.stored[checkpoint]});
  assert(!inProgress.panel.open,'stale film cannot override later work at the shore');
  assert.deepEqual(inProgress.ui.state().inventory,['rope']);
});

test('an interrupted older opening resumes at its narrated scene once', () => {
  const game = mount({}, () => {}, false).ui.stored[gameKey];
  const pending = {reel:'prologue',position:21.375,chapter:1,scene:'beach',actions:0};
  const oldStory = JSON.stringify({openingSeen:false,pending});
  const first = mount({[gameKey]:game,[storyKey]:oldStory}, () => {}, false);
  assert.equal(first.panel.dataset.mode,'movie');
  assert.equal(first.context.CastawayFilm.position(),21.375+introLead);
  assert.equal(mount(first.ui.stored, () => {}, false).context.CastawayFilm.position(),21.375+introLead);
  const untouched = mount({[gameKey]:game,[storyKey]:JSON.stringify({openingSeen:false,pending:{...pending,position:0}})}, () => {}, false);
  assert.equal(untouched.panel.dataset.mode,'foreword');
});

test('dedication, witnesses and end credits have a screen-reader equivalent at the correct picture', async () => {
  const {ui,el,panel,video,context} = mount();
  await ui.click('film-skip');
  const epilogue=timeline.find(reel=>reel.id==='epilogue');
  context.CastawayFilm.open([epilogue.id], {replay:true});
  let time=0;
  for (const shot of epilogue.shots) {
    video.currentTime=time+.1; video.ontimeupdate();
    assert.equal(el('film-card-text').textContent,shot.titleCard?shot.line:'');
    if(shot.titleCard)assert(el('film-caption').hidden, 'there is a single visual copy of the baked lettering');
    time+=shot.seconds;
  }
  assert.equal(time,77);
  video.ended=true;video.onended();
  assert(!panel.open);
});

test('blocked autoplay immediately retries muted, captions override saved silence and a tap restores narration in place', async () => {
  const history = [], forbidden = Object.assign(new Error(), {name:'NotAllowedError'});
  let gesture = false;
  const {ui,el,panel,video} = mount({[filmKey]:'{"chapters":"ask","captions":false}'}, ({video,permitPlay}) => {
    video.play = () => {
      history.push(video.muted);
      return !gesture && !video.muted ? Promise.reject(forbidden) : permitPlay();
    };
  });
  await ui.flush(2);
  assert.deepEqual(history,[false,true]);
  assert.equal(panel.dataset.soundLocked,'true');
  assert.equal(el('film-mute').textContent,'Enable sound');
  assert.equal(ui.context.CastawayFilm.chapterMode(),'watch');
  video.currentTime = introLead+1; video.ontimeupdate();
  assert.equal(el('film-caption').textContent,'First phrase');
  gesture = true;
  await ui.click('film-mute');
  assert(!video.muted && !video.paused);
  assert.equal(video.currentTime,introLead+1);
  assert.equal(panel.dataset.soundLocked,'false');
  assert(el('film-caption').hidden);
  assert.equal(JSON.parse(ui.stored[filmKey]).muted,false);
});

test('reduced motion starts a timed, still, narrated projection and never initiates a native movie', async () => {
  const projections = [];
  const {ui,el,video,panel} = mount({'castaways-adventure-prefs':'{"reduced":true}'}, ({context}) => useProjection(context,projections));
  const film = projections[0];
  assert(film.reduced && !film.paused);
  assert.equal(video.src,null);
  assert.equal(panel.dataset.player,'compatible');
  film.onReady();
  film.currentTime=introLead+2.1; film.onTime(film.currentTime);
  assert.equal(el('film-caption').textContent,'Second phrase');
  await ui.click('film-pause');
  assert(film.paused);
  await ui.click('film-pause');
  assert(!film.paused);
  const saved = ui.stored[gameKey];
  film.onEnd();
  assert(!panel.open && film.stopped);
  assert.equal(ui.stored[gameKey],saved);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
});

test('an interrupted native decoder falls back at its actual media time; a user pause and obsolete callbacks are respected', async () => {
  const projections = [];
  const {ui,el,video,panel} = mount({}, ({context,video}) => {
    useProjection(context,projections);
    video.play = () => new Promise(() => {});
  });
  video.currentTime = 18.5;
  await ui.click('film-pause');
  ui.runTimers();
  assert.equal(projections.length,0);
  await ui.click('film-pause');
  ui.runTimers();
  assert.equal(panel.dataset.player,'compatible');
  const film = projections[0];
  assert.equal(film.time,18.5);
  film.onReady();
  const saved = ui.stored[gameKey];
  await ui.click('film-skip');
  film.onEnd(); film.onError();
  assert(!panel.open && film.stopped);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
  assert.equal(ui.stored[gameKey],saved);
});

test('hosted playback fetches a whole same-origin response and releases the object URL on exit; a late download cannot reopen a reel', async () => {
  const pending = [], urls = [], revoked = [];
  const {ui,context,el,video,panel} = mount({}, ({context}) => {
    context.location.protocol = 'https:';
    context.AbortController = AbortController;
    context.Blob = Blob;
    context.URL = {
      createObjectURL(blob) { urls.push(blob); return 'blob:movie-' + urls.length; },
      revokeObjectURL(url) { revoked.push(url); }
    };
    context.fetch = (file,options) => new Promise(resolve => pending.push({file,options,resolve}));
  });
  assert.equal(panel.dataset.player,'buffered');
  assert.equal(pending.length,1);
  assert.equal(pending[0].file,'assets/story-film/prologue.mp4');
  assert.equal(pending[0].options.credentials,'same-origin');
  assert.equal(pending[0].options.mode,'same-origin');
  assert.equal(pending[0].options.headers,undefined);
  const response = {ok:true, headers:new Headers({'Content-Type':'application/octet-stream'}), arrayBuffer:async () => new Uint8Array(100).buffer};
  await ui.click('film-pause');
  pending[0].resolve(response);
  await ui.flush(4);
  assert.equal(video.src,'blob:movie-1');
  assert.equal(urls[0].type,'video/mp4');
  assert(video.paused);
  assert.equal(el('film-track').src,'assets/story-film/prologue.vtt');
  await ui.click('film-pause');
  assert(!video.paused);
  await ui.click('film-skip');
  assert.deepEqual(revoked,['blob:movie-1']);
  context.CastawayFilm.open(['winter'],{replay:true});
  assert.equal(pending[1].file,'assets/story-film/winter.mp4');
  await ui.click('film-skip');
  assert(pending[1].options.signal.aborted);
  pending[1].resolve(response);
  await ui.flush(4);
  assert(!panel.open);
  assert.equal(urls.length,1);
});

test('unsupported formats advance only once and a total media failure still ends and hands over the shore', async () => {
  const {ui,context,panel,video,el} = mount({}, ({video}) => {
    video.canPlayType = type => type.includes('vp9') ? 'probably' : '';
  });
  assert.equal(video.src,'assets/story-film/prologue.webm');
  video.error = {code:3};
  video.currentSrc = 'file:///example/assets/story-film/prologue.webm';
  video.onerror();
  assert.equal(video.src,'assets/story-film/prologue.mp4');
  video.onerror();
  assert.equal(panel.dataset.player,'native','a stale WebM error cannot consume the new MP4');
  video.currentSrc = 'file:///example/assets/story-film/prologue.mp4';
  video.onerror();
  assert.equal(panel.dataset.player,'paintings');
  assert.equal(panel.dataset.shot,'0');
  assert(!el('film-plate').hidden);
  // Advance the mock monotonic clock, then run the same timer callbacks as the browser.
  const now = context.performance.now();
  assert.equal(el('film-plate').src,firstCards[0].poster);
  context.performance.now = () => now + (firstCards[0].seconds + .25) * 1000;
  ui.runTimers();
  assert.equal(panel.dataset.shot,'1');
  assert.equal(el('film-plate').src,firstCards[1].poster);
  assert.equal(el('film-card-text').textContent,firstCards[1].line);
  context.performance.now = () => now + (67 + introLead) * 1000;
  ui.runTimers();
  assert(!panel.open);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
});

test('the full playlist uses a single video across eight reels, restores focus and leaves campaign and film preferences intact', async () => {
  const {ui,el,context,panel,video} = mount();
  const films = context.CastawayFilm;
  const ids = Array.from(films.timeline,reel => reel.id);
  await ui.click('film-skip');
  await ui.click('journey');
  const opener = el('modal-body').querySelector('[data-replay-film]');
  const previousSave = ui.stored[gameKey], previousPrefs = ui.stored[filmKey];
  films.open(ids,{replay:true,focus:opener});
  for (const id of ids) {
    await ui.flush(1);
    assert.equal(panel.dataset.film,id);
    assert.equal(panel.dataset.mode,'movie');
    assert.equal(video.src,'assets/story-film/'+id+'.mp4');
    video.ended = true; video.onended();
  }
  assert(!panel.open && el('modal').open);
  assert.equal(ui.activeElement(),opener);
  assert.equal(ui.stored[gameKey],previousSave);
  assert.equal(ui.stored[filmKey],previousPrefs);
});

test('a saved story position is clamped, available during loading, and installed as soon as metadata arrives', async () => {
  const {ui,context,video} = mount();
  await ui.click('film-skip');
  const films = context.CastawayFilm;
  films.open(['winter'],{startAt:500,replay:true});
  assert.equal(films.position(),20.75);
  video.duration=21;
  video.onloadedmetadata();
  assert.equal(video.currentTime,20.75);
  video.currentTime=20.8;
  assert.equal(films.position(),20.8);
  await ui.click('film-skip');
  assert.equal(films.position(),0);
});

test('a natural end releases play immediately and one painted frame can bridge the cut', async () => {
  const {ui,el,panel,video} = mount();
  const doc = ui.context.document, create = doc.createElement;
  let snapshot, sourceAtCapture;
  doc.createElement = tag => {
    const node = create(tag);
    if (tag === 'canvas') {
      snapshot = node;
      node.getContext = () => ({drawImage(source) { sourceAtCapture = source.src; }});
    }
    return node;
  };
  Object.assign(video,{readyState:4,videoWidth:960,videoHeight:540});
  video.ended = true; video.onended();
  assert.equal(sourceAtCapture,'assets/story-film/prologue.mp4');
  assert(doc.body.contains(snapshot));
  assert.equal(snapshot.getAttribute('aria-hidden'),'true');
  assert(!panel.open);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
  ui.context.CastawayFilm.open(['winter'],{replay:true});
  assert(!doc.body.contains(snapshot));
});

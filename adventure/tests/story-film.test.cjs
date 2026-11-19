'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {app} = require('./ui-contract.cjs');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const gameKey = 'castaways-adventure-v4';
const filmKey = 'castaways-film-prefs-v1';
// Use a synthetic cue table to test exact boundary times independent of editorial changes.
const scripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map(m => m[1])
  .filter(name => !['interface.js','story-film-captions.js'].includes(name));

function mount(initial={}) {
  const ui = app({initial, scripts, saveKey:gameKey, skipFilms:false});
  const el = id => ui.ids.get(id);
  const video = el('film-video');
  const track = el('film-track');
  for (const node of [video,track]) {
    Object.defineProperty(node,'src',{get:() => node.getAttribute('src'),set:src => node.setAttribute('src',src)});
    node.removeAttribute = k => delete node.attrs[k];
  }
  let loaded = 0;
  video.load = () => { loaded++; };
  video.play = () => { video.paused = false; video.ended = false; video.onplay(); return Promise.resolve(); };
  video.pause = () => { video.paused = true; video.onpause(); };
  video.paused = true;
  ui.context.location = {protocol:'file:'};
  ui.context.storyFilmCaptions = {prologue:[
    {start:0.4,end:2,text:'First phrase'}, {start:2,end:4.5,text:'Second phrase'}
  ]};
  return {ui, el, video, track, panel:el('story-film'), unloaded:() => loaded};
}

test('fresh offer waits for a gesture, stays outside the game save and returns to Raynal', async () => {
  const {ui,el,panel,video} = mount();
  assert(panel.open);
  assert.equal(panel.dataset.film,'prologue');
  assert.equal(panel.dataset.mode,'poster');
  assert.equal(el('film-title').textContent,'Until We Return');
  assert.equal(video.src,null);
  assert.equal(el('dialogue').hidden,true);
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
  await restored.ui.click('film-skip');
  assert.equal(restored.ui.activeElement(),entries[0]);
  assert(restored.el('modal').open);
});

test('local captions follow the media clock on boundaries, pauses, seeks and mute', async () => {
  const {ui,el,panel,video,track,unloaded} = mount();
  await ui.click('film-mute');
  await ui.click('film-play');
  assert.equal(panel.dataset.mode,'movie');
  assert.equal(video.src,'assets/story-film/prologue.mp4');
  assert.equal(track.src,null,'file:// never depends on fetching an external subtitle resource');
  assert(video.muted);
  assert.equal(JSON.parse(ui.stored[filmKey]).chapters,'watch');
  for (const [time,line] of [[0,''],[.4,'First phrase'],[2,'Second phrase'],[4.5,''],[1,'First phrase']]) {
    video.currentTime = time; video.onseeked();
    assert.equal(el('film-caption').textContent,line);
    assert.equal(el('film-caption').hidden,!line);
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

test('reduced motion focuses stills, which can be read at the player’s pace without media', async () => {
  const {ui,el,panel,video} = mount({'castaways-adventure-prefs':'{"reduced":true}'});
  assert.equal(ui.activeElement(),el('film-read'));
  await ui.click('film-read');
  const shots = ui.context.CastawayFilmScript.timeline[0].shots;
  for (let i=0; i<shots.length; i++) {
    assert.equal(panel.dataset.mode,'still');
    assert.equal(el('film-line').textContent,shots[i].line);
    assert.equal(el('film-prev').disabled,i===0);
    assert.equal(video.src,null);
    ui.runTimers();
    assert.equal(el('film-line').textContent,shots[i].line);
    await ui.click('film-next');
  }
  assert(!panel.open);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
});

test('a failed or stale play request always leaves an exit, stills and intact progress', async () => {
  const {ui,el,panel,video} = mount();
  const before = ui.stored[gameKey];
  video.play = async () => { throw Object.assign(new Error(),{name:'NotAllowedError'}); };
  await ui.click('film-play');
  assert.equal(panel.dataset.mode,'poster');
  assert.match(el('film-status').textContent,/Choose Watch film/);
  let reject;
  video.play = () => new Promise((_,no) => {reject=no;});
  await ui.click('film-play');
  await ui.click('film-read');
  reject(new Error('obsolete request')); await ui.flush(1);
  assert.equal(panel.dataset.mode,'still');
  assert.equal(el('film-status').textContent,'');
  panel.oncancel({preventDefault(){}});
  assert(!panel.open);
  assert.equal(ui.stored[gameKey],before);
});

test('the full playlist reuses one video, advances through eight reels and restores focus', async () => {
  const {ui,el,panel,video} = mount();
  const films = ui.context.CastawayFilm;
  const ids = Array.from(films.timeline,reel=>reel.id);
  await ui.click('film-skip');
  await ui.click('journey');
  const opener = el('modal-body').querySelector('[data-replay-film]');
  const before = {...ui.stored};
  ui.context.location.protocol = 'https:';
  films.open(ids,{replay:true,auto:true,focus:opener});
  for (const id of ids) {
    await ui.flush(1);
    assert.equal(panel.dataset.film,id);
    assert.equal(panel.dataset.mode,'movie');
    assert.equal(video.src,'assets/story-film/'+id+'.mp4');
    assert.equal(el('film-track').src,'assets/story-film/'+id+'.vtt');
    video.ended = true; video.onended();
  }
  assert(!panel.open);
  assert(el('modal').open);
  assert.equal(ui.activeElement(),opener);
  assert.deepEqual({...ui.stored},before);
});

test('codec negotiation chooses VP9 when needed and each real decode failure tries the alternate once', async () => {
  const {ui,el,panel,video} = mount();
  await ui.click('film-skip');
  video.canPlayType = mime => mime.includes('vp9') ? 'probably' : '';
  await ui.click('journey');
  await ui.click(el('modal-body').querySelector('[data-replay-film]'));
  await ui.click('film-play');
  assert.equal(video.src,'assets/story-film/prologue.webm');
  video.error = {code:3};
  video.currentSrc = 'file:///example/assets/story-film/prologue.webm';
  video.onerror();
  assert.equal(video.src,'assets/story-film/prologue.mp4');
  video.onerror();
  assert.equal(panel.dataset.mode,'movie','obsolete WebM error cannot consume the MP4 retry');
  video.currentSrc = 'file:///example/assets/story-film/prologue.mp4';
  video.onerror();
  assert.equal(panel.dataset.mode,'poster');
  assert.match(el('film-status').textContent,/Read the stills/);
  await ui.click('film-read');
  assert.equal(panel.dataset.mode,'still');
  await ui.click('film-skip');
  assert(el('modal').open);
});

test('a natural campaign cut releases the scene immediately and discards its captured frame on the next reel', async () => {
  const {ui,el,panel,video} = mount();
  const doc = ui.context.document;
  const create = doc.createElement;
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
  await ui.click('film-play');
  video.ended = true;
  video.onended();
  assert.equal(sourceAtCapture,'assets/story-film/prologue.mp4');
  assert(doc.body.contains(snapshot));
  assert.equal(snapshot.getAttribute('aria-hidden'),'true');
  assert.equal(panel.open,false);
  assert.equal(el('dialogue').dataset.speaker,'raynal');
  assert.equal(video.src,null);
  ui.context.CastawayFilm.open(['winter'],{replay:true});
  assert(!doc.body.contains(snapshot),'new film clears the old transition immediately');
  snapshot.onanimationend();
  assert(panel.open);
  await ui.click('film-skip');
});

/* The player owns media and preferences only. The campaign commits its move before a reel opens. */
(function () {
  'use strict';
  const timeline = window.CastawayFilmScript?.timeline;
  const byId = id => document.getElementById(id);
  const dialog = byId('story-film');
  if (!dialog || !timeline?.length) return;
  const video = byId('film-video');
  const plate = byId('film-plate');
  const track = byId('film-track');
  const directory = 'assets/story-film/';
  const key = 'castaways-film-prefs-v1';
  const modes = ['ask', 'watch', 'skip'];
  let prefs = {chapters:'ask', muted:false, captions:true};
  try {
    const p = JSON.parse(localStorage.getItem(key));
    if (p) prefs = {chapters:modes.includes(p.chapters) ? p.chapters : 'ask', muted:p.muted === true, captions:p.captions !== false};
  } catch (_) { /* The same controls work for this tab when storage is unavailable. */ }

  let session = null;
  let attempt = 0;
  let waitTimer, clearHandoff;
  const watch = byId('film-play'), read = byId('film-read'), pause = byId('film-pause');
  const mute = byId('film-mute'), captions = byId('film-captions'), skip = byId('film-skip');
  const previous = byId('film-prev'), next = byId('film-next'), forward = byId('film-forward');
  const subtitle = byId('film-caption'), status = byId('film-status');
  const labels = ['Prologue', 'Chapter II', 'Chapter III', 'Chapter IV', 'Chapter V', 'Chapter VI', 'Chapter VII', 'Epilogue'];
  const specialPlates = {
    outfit:directory + 'outfit.webp', 'hearth-remains':directory + 'hearth-remains.webp',
    schooner:directory + 'schooner.webp', 'cabin-table':directory + 'cabin-table.webp',
    'shore-dawn':directory + 'shore-dawn.webp', ending:'assets/voyage/promise/ending.webp',
    'invercauld-wreck':'assets/epilogue/wreck.webp', 'skin-boat':'assets/epilogue/skin-boat.webp', julian:'assets/epilogue/julian.webp'
  };
  const picturePath = shot => specialPlates[shot.plate] || 'assets/tidepaint/' + shot.plate + '.webp';

  function savePreferences() {
    try { localStorage.setItem(key, JSON.stringify(prefs)); } catch (_) {}
  }
  function setChapterMode(mode) {
    if (!modes.includes(mode)) return;
    prefs.chapters = mode;
    savePreferences();
  }
  function updateToggles() {
    video.muted = prefs.muted;
    mute.setAttribute('aria-pressed', String(prefs.muted));
    mute.textContent = prefs.muted ? 'Sound off' : 'Sound on';
    captions.setAttribute('aria-pressed', String(prefs.captions));
    captions.textContent = prefs.captions ? 'Captions on' : 'Captions off';
  }
  function showCaption() {
    let line = '';
    if (session?.mode === 'movie' && prefs.captions) {
      const cue = window.storyFilmCaptions?.[session.reel.id]?.find(
        item => item.start <= video.currentTime && video.currentTime < item.end
      );
      line = cue?.text || '';
    }
    if (subtitle.textContent !== line) subtitle.textContent = line;
    subtitle.hidden = !line;
  }
  function updatePause() {
    const stopped = video.paused;
    pause.textContent = stopped ? 'Resume' : 'Pause';
    pause.setAttribute('aria-pressed', String(stopped));
  }
  function setMode(mode) {
    session.mode = mode;
    dialog.dataset.mode = mode;
    const movie = mode === 'movie', still = mode === 'still';
    skip.textContent = session.replay ? 'Back to journey' : mode !== 'poster' ? 'Skip film' :
      session.reel.id === 'prologue' ? 'Play adventure' : session.reel.id === 'epilogue' ? 'Continue to ending' : 'Play chapter';
    video.hidden = !movie;
    plate.hidden = movie;
    watch.hidden = mode !== 'poster';
    pause.hidden = !movie;
    captions.hidden = !movie;
    mute.hidden = still;
    read.hidden = still;
    previous.hidden = next.hidden = !still;
    byId('film-reading').hidden = !still;
    byId('film-credit').hidden = movie;
    updateToggles();
    showCaption();
  }
  function releaseVideo() {
    ++attempt;
    clearTimeout(waitTimer);
    if (!video.hasAttribute('src')) return;
    video.pause();
    video.removeAttribute('src');
    track.removeAttribute('src');
    video.load();
  }
  function setPlate(src, fallback) {
    plate.hidden = false;
    plate.onerror = () => {
      plate.onerror = null;
      if (fallback) plate.src = fallback;
      else plate.hidden = true;
    };
    plate.src = src;
  }
  function showReel(index) {
    releaseVideo();
    session.index = index;
    session.page = 0;
    session.source = 0;
    const canDecode = type => Boolean(video.canPlayType?.(type));
    const webmFirst = !canDecode('video/mp4; codecs="avc1.64001F, mp4a.40.2"') &&
      canDecode('video/webm; codecs="vp9, opus"');
    session.formats = webmFirst ? ['webm','mp4'] : ['mp4','webm'];
    const reel = session.reels[index];
    session.reel = reel;
    const label = labels[timeline.indexOf(reel)];
    dialog.dataset.film = reel.id;
    dialog.dataset.reduced = String(session.reduced);
    byId('film-reel').textContent = reel.id === 'prologue' ? label + ' · ' + reel.title : label;
    byId('film-title').textContent = reel.id === 'prologue' ? 'Until We Return' : reel.title;
    byId('film-dateline').textContent = reel.dateline;
    byId('film-credit').textContent = reel.id === 'epilogue'
      ? 'English narration synthesized with Kokoro-82M. Original music and sound effects for Until We Return.'
      : 'Painted reconstruction from the castaways’ accounts';
    forward.hidden = !session.playlist || index === session.reels.length - 1;
    status.textContent = '';
    setMode('poster');
    setPlate(directory + reel.id + '.webp', picturePath(reel.shots[0]));
  }
  function dissolveIntoScene() {
    if (session.replay || session.reduced || document.hidden ||
        matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !video.videoWidth || !video.videoHeight || video.readyState < 2) return;
    const from = video.getBoundingClientRect(), to = byId('scene').getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return;
    const frame = document.createElement('canvas');
    frame.width = video.videoWidth;
    frame.height = video.videoHeight;
    try {
      const ctx = frame.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
    } catch (_) { return; }
    frame.className = 'film-handoff';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.left = to.left + 'px';
    frame.style.top = to.top + 'px';
    frame.style.width = to.width + 'px';
    frame.style.height = to.height + 'px';
    frame.style.setProperty('--film-origin',
      `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`);
    const remove = () => {
      clearTimeout(deadline);
      frame.remove();
      if (clearHandoff === remove) clearHandoff = null;
    };
    const deadline = setTimeout(remove, 550);
    frame.onanimationend = frame.onanimationcancel = remove;
    clearHandoff = remove;
    document.body.appendChild(frame);
  }
  function finish(natural=false) {
    if (!session) return;
    if (natural === true) dissolveIntoScene();
    const {focus, after} = session;
    session = null;
    releaseVideo();
    plate.onerror = null;
    if (dialog.open) dialog.close();
    if (focus?.isConnected) focus.focus({preventScroll:true});
    after?.();
  }
  function continueReels(reading, natural=false) {
    if (session.index + 1 === session.reels.length) { finish(natural); return; }
    showReel(session.index + 1);
    if (reading) showStill(0);
    else play(false);
  }
  function showStill(page, focus=next) {
    const shots = session.reel.shots;
    if (page < 0 || page >= shots.length) return;
    releaseVideo();
    session.page = page;
    status.textContent = '';
    setMode('still');
    setPlate(picturePath(shots[page]), directory + session.reel.id + '.webp');
    byId('film-page').textContent = session.reel.title + ' · ' + (page + 1) + ' / ' + shots.length;
    byId('film-line').textContent = shots[page].line;
    previous.disabled = page === 0;
    const last = page === shots.length - 1;
    next.textContent = last ? (session.index + 1 < session.reels.length ? 'Next film' : 'Finish reading') : 'Next still';
    (focus.disabled ? next : focus).focus({preventScroll:true});
  }
  function playbackFailed(message) {
    if (!session || session.mode !== 'movie') return;
    showReel(session.index);
    status.textContent = message;
    (session.reduced ? read : watch).focus({preventScroll:true});
  }
  function retryFormat() {
    if (session.source + 1 === session.formats.length) {
      playbackFailed('This film could not load. Read the stills or continue.');
      return;
    }
    session.source++;
    releaseVideo();
    play(false);
  }
  async function play(explicit) {
    if (!session) return;
    if (explicit && !session.replay) setChapterMode('watch');
    const number = ++attempt;
    setMode('movie');
    const file = session.reel.id;
    if (!video.hasAttribute('src')) {
      video.poster = directory + file + '.webp';
      // Browsers can block file:// text tracks. The identical packaged cue table
      // drives the visible captions on disk and HTTPS, including after a seek.
      if (/^https?:$/.test(window.location?.protocol)) {
        track.src = directory + file + '.vtt';
        if (track.track) track.track.mode = 'hidden';
      }
      session.file = directory + file + '.' + session.formats[session.source];
      video.src = session.file;
    }
    status.textContent = '';
    updatePause();
    pause.focus({preventScroll:true});
    clearTimeout(waitTimer);
    waitTimer = setTimeout(() => {
      if (number === attempt) status.textContent = 'Loading film. You can also read the stills.';
    }, 800);
    try {
      await video.play();
      if (number !== attempt) return;
      clearTimeout(waitTimer);
      status.textContent = '';
      updatePause();
    } catch (error) {
      if (number !== attempt) return;
      if (error.name === 'NotAllowedError') playbackFailed('Choose Watch film to begin playback.');
      else if (error.name !== 'AbortError') retryFormat();
    }
  }
  function open(ids, {reduced=false, replay=false, auto=false, focus=document.activeElement, after}={}) {
    if (session) return false;
    const reels = ids.map(id => timeline.find(reel => reel.id === id));
    if (!reels.length || reels.some(reel => !reel)) return false;
    clearHandoff?.();
    session = {reels, reduced, replay, focus, after, playlist:reels.length > 1};
    dialog.dataset.entry = replay ? 'replay' : 'campaign';
    showReel(0);
    dialog.showModal();
    if (auto && !reduced) play(false);
    else (reduced ? read : watch).focus({preventScroll:true});
    return true;
  }
  watch.onclick = () => play(true);
  read.onclick = () => {
    const time = session.mode === 'movie' ? video.currentTime || 0 : 0;
    let boundary = 0;
    const page = session.reel.shots.findIndex(shot => {
      boundary += shot.seconds;
      return time < boundary;
    });
    showStill(page < 0 ? session.reel.shots.length - 1 : page);
  };
  skip.onclick = finish;
  previous.onclick = () => showStill(session.page - 1, previous);
  next.onclick = () => {
    if (session.page + 1 < session.reel.shots.length) showStill(session.page + 1);
    else continueReels(true);
  };
  forward.onclick = () => continueReels(session.mode === 'still' || session.reduced);
  pause.onclick = () => {
    if (video.paused) play(false);
    else { clearTimeout(waitTimer); video.pause(); }
  };
  mute.onclick = () => { prefs.muted = !prefs.muted; savePreferences(); updateToggles(); };
  captions.onclick = () => { prefs.captions = !prefs.captions; savePreferences(); updateToggles(); showCaption(); };
  video.ontimeupdate = video.onseeked = showCaption;
  video.onpause = video.onplay = updatePause;
  video.onended = () => { if (session?.mode === 'movie' && video.ended) continueReels(false, true); };
  video.onerror = () => {
    if (session?.mode !== 'movie' || !video.error || !video.hasAttribute('src')) return;
    // The media error and the rejected play() can both report one failed URL.
    // Only the current resource may consume the alternate format.
    if (!video.currentSrc || video.currentSrc.endsWith('/' + session.file)) retryFormat();
  };
  dialog.oncancel = event => { event.preventDefault(); finish(); };
  dialog.onclose = () => { if (!dialog.open) finish(); };
  document.addEventListener?.('visibilitychange', () => {
    if (document.hidden && session?.mode === 'movie') video.pause();
  });
  window.CastawayFilm = {open, shown:() => Boolean(session), timeline, chapterMode:() => prefs.chapters, setChapterMode};
})();

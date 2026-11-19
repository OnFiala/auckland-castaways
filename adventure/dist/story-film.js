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
  const modes = ['watch', 'skip'];
  let prefs = {chapters:'watch', muted:false, captions:true};
  try {
    const p = JSON.parse(localStorage.getItem(key));
    if (p) prefs = {chapters:p.chapters === 'skip' ? 'skip' : 'watch', muted:p.muted === true, captions:p.captions !== false};
  } catch (_) { /* The same controls work for this tab when storage is unavailable. */ }

  let session = null;
  let native = null, projection = null, preferProjection = false, mediaGeneration = 0;
  let wantsPlay = false, resumeOnVisible = false, waitTimer, stallTimer, clearHandoff;
  const compatibility = () => window.CastawayFilmFallback;
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
    const locked = Boolean(session?.soundBlocked) && !prefs.muted;
    const quiet = prefs.muted || locked, subtitlesOn = captionsEnabled();
    video.muted = quiet;
    dialog.dataset.soundLocked = String(locked);
    mute.setAttribute('aria-label', locked ? 'Enable sound' : quiet ? 'Turn film sound on' : 'Mute film');
    mute.setAttribute('aria-pressed', String(quiet));
    mute.textContent = locked ? 'Enable sound' : prefs.muted ? 'Sound off' : 'Sound on';
    captions.setAttribute('aria-pressed', String(subtitlesOn));
    captions.textContent = subtitlesOn ? 'Captions on' : 'Captions off';
  }
  function captionsEnabled() {
    return prefs.captions || ((session?.soundBlocked || session?.soundUnavailable) && !prefs.muted) || dialog.dataset.player === 'paintings';
  }
  function showCaption() {
    let line = '';
    if (session?.mode === 'movie' && captionsEnabled()) {
      const time = filmTime();
      const cues = window.storyFilmCaptions?.[session.reel.id];
      const cue = cues?.find(item => item.start <= time && time < item.end);
      line = cue?.text || (!cues && dialog.dataset.player === 'paintings' ? session.reel.shots[Number(dialog.dataset.shot)]?.line : '') || '';
    }
    if (subtitle.textContent !== line) subtitle.textContent = line;
    subtitle.hidden = !line;
  }
  function updatePause() {
    const stopped = !wantsPlay;
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
    read.hidden = mode !== 'poster';
    previous.hidden = next.hidden = !still;
    byId('film-reading').hidden = !still;
    byId('film-credit').hidden = movie;
    updateToggles();
    showCaption();
  }
  function filmTime() {
    if (projection) return projection.currentTime;
    if (native?.attached && !native.seek && Number.isFinite(video.currentTime)) return video.currentTime;
    return session?.position || 0;
  }
  function clearTimers() {
    clearTimeout(waitTimer);
    clearTimeout(stallTimer);
  }
  function releaseVideo() {
    mediaGeneration++;
    clearTimers();
    const old = native;
    native = null;
    old?.request?.abort();
    const retiring = projection;
    projection = null;
    retiring?.stop();
    if (video.hasAttribute('src')) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (track.hasAttribute('src')) track.removeAttribute('src');
    if (old?.objectURL) URL.revokeObjectURL(old.objectURL);
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
    wantsPlay = false;
    resumeOnVisible = false;
    session.position = 0;
    session.triedProjection = false;
    session.soundBlocked = false;
    session.soundUnavailable = false;
    session.route = -1;
    delete dialog.dataset.player;
    delete dialog.dataset.shot;
    const canDecode = type => Boolean(video.canPlayType?.(type));
    const webmFirst = !canDecode('video/mp4; codecs="avc1.64001F, mp4a.40.2"') &&
      canDecode('video/webm; codecs="vp9, opus"');
    const formats = webmFirst ? ['webm','mp4'] : ['mp4','webm'];
    const buffered = /^https?:$/.test(window.location?.protocol) && typeof window.fetch === 'function' &&
      typeof window.URL?.createObjectURL === 'function' && typeof window.AbortController === 'function';
    session.routes = formats.flatMap(format => buffered ? [{format, buffered:true}, {format}] : [{format}]);
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
    if (session.replay || session.reduced || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const painted = dialog.dataset.player === 'paintings';
    const source = painted ? plate : projection ? byId('film-compat-canvas') : video;
    const width = painted ? plate.naturalWidth : projection ? source?.width : video.videoWidth;
    const height = painted ? plate.naturalHeight : projection ? source?.height : video.videoHeight;
    if (!width || !height || (!projection && video.readyState < 2)) return;
    const from = source.getBoundingClientRect(), to = byId('scene').getBoundingClientRect();
    if (!from.width || !from.height || !to.width || !to.height) return;
    const frame = document.createElement('canvas');
    frame.width = width;
    frame.height = height;
    try {
      const ctx = frame.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(source, 0, 0);
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
    wantsPlay = false;
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
  function armWatchdog(state) {
    clearTimeout(stallTimer);
    if (!wantsPlay || document.hidden) return;
    const lastTime = video.currentTime;
    const lastFrames = video.getVideoPlaybackQuality?.().totalVideoFrames;
    stallTimer = setTimeout(() => {
      if (native !== state || !wantsPlay || document.hidden) return;
      const frames = video.getVideoPlaybackQuality?.().totalVideoFrames;
      if (state.attached && video.currentTime > lastTime + .04 && (lastFrames == null || frames > lastFrames)) {
        armWatchdog(state);
        return;
      }
      // Some embedded WebViews leave play() pending forever and never dispatch an error.
      // A decoder can also stop producing frames halfway through a reel.
      if (!startProjection()) nextSource();
    }, state.attached ? 6000 : Math.max(0, Math.min(6000, 16000 - (performance.now() - state.started))));
  }
  function startPaintings() {
    // A media outage still has a timed ending. Use the locally packaged plates
    // and caption times, with the same clock and controls as the other players.
    const owner = session, reel = owner.reel;
    let offset = filmTime(), started = performance.now(), running = wantsPlay, timer, shot = -1;
    releaseVideo();
    const generation = mediaGeneration;
    setMode('movie');
    dialog.dataset.player = 'paintings';
    owner.soundBlocked = false;
    video.hidden = mute.hidden = true;
    plate.hidden = read.hidden = false;
    status.textContent = '';
    const duration = reel.shots.reduce((sum, item) => sum + item.seconds, 0);
    const time = () => Math.min(duration, offset + (running ? (performance.now() - started) / 1000 : 0));
    const render = () => {
      if (generation !== mediaGeneration) return;
      const elapsed = time();
      if (elapsed >= duration) { continueReels(false, true); return; }
      let boundary = 0;
      const index = reel.shots.findIndex(item => (boundary += item.seconds) > elapsed);
      if (index !== shot) {
        shot = index;
        dialog.dataset.shot = String(index);
        setPlate(picturePath(reel.shots[index]), directory + reel.id + '.webp');
      }
      showCaption();
      if (running) timer = setTimeout(render, Math.min(150, (boundary - elapsed) * 1000 + 1));
    };
    projection = {
      get currentTime() { return time(); },
      stop() { clearTimeout(timer); },
      pause() { offset = time(); running = false; clearTimeout(timer); },
      resume() { if (!running) { started = performance.now(); running = true; render(); } },
      setMuted() {}
    };
    updateToggles();
    updatePause();
    render();
  }
  function startProjection() {
    const owner = session;
    if (!owner || !compatibility() || owner.triedProjection) return false;
    owner.position = filmTime();
    owner.triedProjection = true;
    releaseVideo();
    const generation = mediaGeneration;
    setMode('movie');
    dialog.dataset.player = 'compatible';
    video.hidden = true;
    plate.hidden = false;
    status.textContent = 'Loading painted film…';
    updatePause();
    // The handle can outlive this reel if the player skips while a sheet or sound is loading.
    const current = () => generation === mediaGeneration;
    const failed = () => {
      if (!current()) return;
      preferProjection = false;
      if (owner.reduced) startPaintings();
      else nextSource();
    };
    try {
      const handle = compatibility().start({
        reel:owner.reel, element:plate, time:owner.position, muted:prefs.muted, paused:!wantsPlay, reduced:owner.reduced,
        onReady() { if (current()) { if (!owner.reduced) preferProjection = true; status.textContent = ''; } },
        onTime() { if (current()) showCaption(); },
        onSound(available, reason) {
          if (!current()) return;
          owner.soundUnavailable = !available && reason === 'unavailable';
          owner.soundBlocked = !available && !owner.soundUnavailable;
          mute.hidden = owner.soundUnavailable;
          updateToggles();
          showCaption();
        },
        onEnd() { if (current()) continueReels(false, true); },
        onError:failed
      });
      if (current()) projection = handle;
      else handle?.stop();
    } catch (_) { failed(); }
    return true;
  }
  async function runNative(state) {
    if (native !== state || !state.attached || !wantsPlay) return;
    const sequence = ++state.plays;
    armWatchdog(state);
    try {
      await video.play();
      if (native !== state || sequence !== state.plays || !wantsPlay) return;
      clearTimeout(waitTimer);
      if (status.textContent.startsWith('Loading')) status.textContent = '';
      updatePause();
    } catch (error) {
      if (native !== state || sequence !== state.plays || !wantsPlay) return;
      if (error.name === 'NotAllowedError') {
        // Keep the same element, source and playback position. Embeds may require
        // a real gesture for narration but can immediately play the muted picture.
        if (!video.muted) {
          session.soundBlocked = true;
          updateToggles();
          showCaption();
          runNative(state);
        } else if (!startProjection()) nextSource();
      } else if (error.name !== 'AbortError') nextSource();
      // Unexpected native AbortError without a subsequent pause is covered by the watchdog.
    }
  }
  function attach(state, url) {
    if (native !== state) return;
    state.attached = true;
    state.url = url;
    video.src = url;
    if (wantsPlay) runNative(state);
  }
  async function bufferReel(state) {
    try {
      const response = await fetch(state.file, {credentials:'same-origin', mode:'same-origin', signal:state.request.signal});
      if (native !== state) return;
      if (!response.ok || /^(?:text\/|application\/(?:json|xhtml))/i.test(response.headers.get('Content-Type') || '')) {
        throw new Error('Film response did not contain media');
      }
      const type = state.format === 'mp4' ? 'video/mp4' : 'video/webm';
      let blob;
      if (response.body?.getReader) {
        const reader = response.body.getReader(), parts = [];
        for (;;) {
          const {done, value} = await reader.read();
          if (native !== state) return;
          if (done) break;
          parts.push(value);
          armWatchdog(state);
        }
        blob = new Blob(parts, {type});
      } else {
        blob = new Blob([await response.arrayBuffer()], {type});
      }
      if (native !== state) return;
      if (!blob.size) throw new Error('Empty film response');
      // A same-origin full GET works on static hosts that answer a Range request
      // with the entire movie. A local Blob gives the decoder a seekable source.
      state.objectURL = URL.createObjectURL(blob);
      attach(state, state.objectURL);
    } catch (_) { if (native === state) nextSource(); }
  }
  function nextSource() {
    if (!session) return;
    session.position = filmTime();
    releaseVideo();
    const route = session.routes[++session.route];
    if (!route) {
      if (!startProjection()) startPaintings();
      return;
    }
    const file = directory + session.reel.id + '.' + route.format;
    const state = {file, format:route.format, seek:session.position, plays:0, started:performance.now()};
    native = state;
    session.soundBlocked = session.soundUnavailable = false;
    setMode('movie');
    dialog.dataset.player = route.buffered ? 'buffered' : 'native';
    status.textContent = '';
    video.poster = directory + session.reel.id + '.webp';
    // An embedded copy of these same cues drives captions both online and offline.
    if (/^https?:$/.test(window.location?.protocol)) {
      track.src = directory + session.reel.id + '.vtt';
      if (track.track) track.track.mode = 'hidden';
    }
    updatePause();
    waitTimer = setTimeout(() => {
      if (native === state && wantsPlay) status.textContent = 'Loading film…';
    }, 900);
    armWatchdog(state);
    if (route.buffered) {
      state.request = new AbortController();
      bufferReel(state);
    } else attach(state, file);
  }
  function play(explicit) {
    if (!session) return;
    if (explicit) {
      compatibility()?.prime();
      if (!session.replay) setChapterMode('watch');
    }
    wantsPlay = true;
    if (projection) projection.resume();
    else if (native) {
      native.started = performance.now();
      armWatchdog(native);
      runNative(native);
    } else if (session.reduced) {
      if (!startProjection()) startPaintings();
    } else if (!preferProjection || !startProjection()) nextSource();
    updatePause();
  }
  function pauseFilm() {
    wantsPlay = false;
    resumeOnVisible = false;
    clearTimers();
    if (projection) projection.pause();
    else if (native?.attached) video.pause();
    updatePause();
  }
  function open(ids, {reduced=false, replay=false, auto=true, startAt=0, focus=document.activeElement, after}={}) {
    if (session) return false;
    const reels = ids.map(id => timeline.find(reel => reel.id === id));
    if (!reels.length || reels.some(reel => !reel)) return false;
    clearHandoff?.();
    session = {reels, reduced, replay, focus, after, playlist:reels.length > 1};
    dialog.dataset.entry = replay ? 'replay' : 'campaign';
    showReel(0);
    const duration = reels[0].shots.reduce((sum, shot) => sum + shot.seconds, 0);
    session.position = Number.isFinite(startAt) ? Math.max(0, Math.min(duration - .25, startAt)) : 0;
    dialog.showModal();
    if (auto) {
      if (replay) compatibility()?.prime();
      play(false);
      if (document.hidden) { pauseFilm(); resumeOnVisible = true; }
    } else (reduced ? read : watch).focus({preventScroll:true});
    return true;
  }
  watch.onclick = () => play(true);
  read.onclick = () => {
    const time = session.mode === 'movie' ? filmTime() : 0;
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
  forward.onclick = () => continueReels(session.mode === 'still');
  pause.onclick = () => {
    if (wantsPlay) pauseFilm();
    else { compatibility()?.prime(); play(false); }
  };
  mute.onclick = () => {
    const unlock = session.soundBlocked;
    prefs.muted = unlock ? false : !prefs.muted;
    session.soundBlocked = false;
    if (!prefs.muted) compatibility()?.prime();
    savePreferences();
    updateToggles();
    if (projection) projection.setMuted(prefs.muted);
    else if (unlock && native && wantsPlay) runNative(native);
    showCaption();
  };
  captions.onclick = () => { prefs.captions = !prefs.captions; savePreferences(); updateToggles(); showCaption(); };
  video.ontimeupdate = video.onseeked = showCaption;
  video.onpause = video.onplay = updatePause;
  video.onloadedmetadata = () => {
    if (native?.seek > 0) {
      video.currentTime = Math.min(native.seek, video.duration || native.seek);
      native.seek = 0;
    }
  };
  video.onended = () => { if (native?.attached && session?.mode === 'movie' && video.ended) continueReels(false, true); };
  video.onerror = () => {
    if (!native?.attached || session?.mode !== 'movie' || !video.error) return;
    if (!video.currentSrc || video.currentSrc === native.url || (!native.objectURL && video.currentSrc.endsWith('/' + native.file))) nextSource();
  };
  dialog.oncancel = event => { event.preventDefault(); finish(); };
  dialog.onclose = () => { if (!dialog.open) finish(); };
  document.addEventListener?.('visibilitychange', () => {
    if (session?.mode !== 'movie') return;
    if (document.hidden && wantsPlay) {
      pauseFilm();
      resumeOnVisible = true;
    } else if (!document.hidden && resumeOnVisible) {
      resumeOnVisible = false;
      play(false);
    }
  });
  window.CastawayFilm = {open, position:filmTime, shown:() => Boolean(session), timeline, chapterMode:() => prefs.chapters, setChapterMode};
})();

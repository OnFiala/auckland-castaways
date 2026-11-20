/* Original instrumental score for the playable chapters. */
(function () {
  'use strict';

  const chapters = ['shore', 'hearth', 'forge', 'timbers', 'crossing', 'promise', 'homecoming'];
  const phrases = {
    menRescued: 'horizon-cue', fireLit: 'shelter-cue', canvasRecovered: 'craft-cue',
    roofSealed: 'shelter-cue', drillFailed: 'setback-cue', nailsForged: 'craft-cue',
    hullFastened: 'craft-cue', sailRigged: 'horizon-cue', courseSet: 'horizon-cue',
    rescueRoute: 'horizon-cue', suppliesShared: 'shelter-cue'
  };
  const folder = 'assets/island-score/';
  const url = name => folder + name + '.mp3';

  function create({bed, accent, volume = 65}) {
    if (typeof bed?.play !== 'function' || typeof accent?.play !== 'function') return null;
    const background = {element: bed, loop: true, offset: 0};
    const phrase = {element: accent, loop: false, offset: 0};
    bed.loop = true;
    accent.loop = false;
    let chapter = 0, film = false, dialogue = false, away = false, lastPhrase = -Infinity;
    let context, resumePending;
    const Context = window.AudioContext || window.webkitAudioContext;
    // Local archives can play their MP3s through native media even in browsers
    // that disallow fetch() from file URLs. The hosted score loops decoded PCM.
    let useBuffers = Boolean(Context && window.fetch && /^https?:$/.test(window.location?.protocol));
    const buffers = new Map();
    const fadingOut = new Set();
    const allowed = () => chapter > 0 && volume > 0 && !film && !away && !document.hidden;
    const level = voice => volume / 100 * (dialogue ? .38 : 1) * (voice.loop ? 1 : .88);

    function blend(voice, target, seconds) {
      clearTimeout(voice.fade);
      if (voice.node) {
        const gain = voice.node.gain.gain, now = context.currentTime;
        if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(now);
        else { const current = gain.value; gain.cancelScheduledValues(now); gain.setValueAtTime(current, now); }
        gain.linearRampToValueAtTime(target, now + seconds);
      } else if (voice.native) {
        const element = voice.element, start = element.volume, since = Date.now();
        function step() {
          const t = seconds ? Math.min(1, (Date.now() - since) / (seconds * 1000)) : 1;
          element.volume = start + (target - start) * t;
          if (t < 1) voice.fade = setTimeout(step, 35);
        }
        step();
      }
    }

    function stop(voice, tail = 0) {
      const node = voice.node;
      if (node) {
        if (voice.loop) voice.offset = (voice.offset + context.currentTime - node.started) % node.source.buffer.duration;
        blend(voice, 0, tail);
        if (tail) fadingOut.add(node);
        node.source.stop(context.currentTime + tail);
        voice.node = null;
      }
      clearTimeout(voice.fade);
      if (voice.native) {
        voice.element.pause();
        if (voice.loop) voice.offset = voice.element.currentTime || 0;
      }
      voice.native = false;
      voice.request = null;
    }

    function silence() {
      stop(background);
      stop(phrase);
      // A film or a hidden tab also takes precedence over a chapter crossfade.
      for (const node of fadingOut) node.source.stop();
      fadingOut.clear();
    }

    function nativePlay(voice, name, request) {
      // Keep the same two elements across gestures and chapter changes. This
      // lets browsers carry the user's playback permission to the next room.
      const el = voice.element;
      if (voice.file !== name) { el.src = url(name); voice.file = name; }
      if (!voice.loop) el.currentTime = 0;
      el.volume = 0;
      voice.native = true;
      const result = el.play();
      Promise.resolve(result).then(() => {
        if (voice.request === request) blend(voice, level(voice), voice.loop ? 1.1 : .045);
      }, () => {
        if (voice.request === request) { voice.native = false; voice.request = null; }
      });
    }

    function readBuffer(name) {
      if (!buffers.has(name)) {
        const pending = window.fetch(url(name)).then(response => {
          if (!response.ok) throw new Error('Score unavailable');
          return response.arrayBuffer();
        }).then(bytes => context.decodeAudioData(bytes));
        buffers.set(name, pending);
        pending.catch(() => { if (buffers.get(name) === pending) buffers.delete(name); });
      }
      return buffers.get(name);
    }

    async function play(voice, name) {
      const request = {at: Date.now()};
      voice.request = request;
      if (useBuffers) {
        try {
          const buffer = await readBuffer(name);
          if (voice.request !== request || !allowed()) return;
          if (!voice.loop && Date.now() - request.at > 2000) return;
          const source = context.createBufferSource(), gain = context.createGain();
          source.buffer = buffer;
          source.loop = voice.loop;
          gain.gain.value = 0;
          source.connect(gain);
          gain.connect(context.destination);
          const node = {source, gain, started: context.currentTime};
          source.onended = () => {
            source.disconnect(); gain.disconnect(); fadingOut.delete(node);
            if (voice.node === node) voice.node = null;
          };
          voice.node = node;
          source.start(0, voice.loop ? voice.offset % buffer.duration : 0);
          blend(voice, level(voice), voice.loop ? 1.1 : .045);
          return;
        } catch (_) { /* The media element can still play a file the Web Audio decoder declined. */ }
      }
      if (voice.request === request && allowed() && (voice.loop || Date.now() - request.at <= 2000)) {
        nativePlay(voice, name, request);
      }
    }

    function sync() {
      if (!allowed()) { silence(); return; }
      if (useBuffers && context?.state !== 'running') return;
      if (!background.request) play(background, chapters[chapter - 1]);
    }

    function activate(gesture = false) {
      if (away || document.hidden || !volume) return;
      if (useBuffers) {
        if (!context) {
          try {
            context = new Context();
            context.onstatechange = sync;
          } catch (_) { useBuffers = false; }
        }
        if (useBuffers && context.state !== 'running') {
          // A browser can leave resume() pending until an actual tap or key.
          // Retry within the gesture itself, including one in the prologue.
          if (gesture || !resumePending) {
            const attempt = context.resume();
            resumePending = attempt;
            attempt.then(sync, () => {}).finally(() => { if (resumePending === attempt) resumePending = null; });
          }
          return;
        }
      }
      sync();
    }

    function setChapter(next) {
      if (!Number.isInteger(next) || !chapters[next - 1] || next === chapter) return;
      if (chapter) buffers.delete(chapters[chapter - 1]);
      stop(background, allowed() ? .45 : 0);
      stop(phrase);
      background.offset = 0;
      lastPhrase = -Infinity;
      chapter = next;
      activate();
    }
    function setFilm(open) {
      film = Boolean(open);
      if (film) silence();
      else if (chapter) activate();
    }
    function setDialogue(talking) {
      if (dialogue === Boolean(talking)) return;
      dialogue = Boolean(talking);
      for (const voice of [background, phrase]) blend(voice, level(voice), dialogue ? .24 : .9);
    }
    function setVolume(value) {
      if (!Number.isFinite(value)) return;
      volume = Math.max(0, Math.min(100, value));
      if (!volume) { silence(); return; }
      for (const voice of [background, phrase]) blend(voice, level(voice), .12);
      if (chapter) activate(true);
    }
    function resolved(before, after) {
      if (!allowed() || (useBuffers && context?.state !== 'running')) return;
      const flag = Object.keys(phrases).find(key => !before[key] && after[key]);
      const now = Date.now();
      if (!flag || now - lastPhrase < 4500) return;
      lastPhrase = now;
      stop(phrase);
      play(phrase, phrases[flag]);
    }

    const unlock = () => activate(true);
    // pointerup also counts as a trusted touch gesture on mobile browsers.
    for (const event of ['pointerup', 'keydown', 'click']) document.addEventListener(event, unlock, true);
    document.addEventListener('visibilitychange', () => { if (document.hidden) sync(); else if (chapter) activate(); });
    window.addEventListener('pagehide', () => { away = true; sync(); });
    window.addEventListener('pageshow', () => { away = false; if (chapter) activate(); });
    return {setChapter, setFilm, setDialogue, setVolume, resolved, unlock};
  }

  window.CastawayScore = {create};
})();

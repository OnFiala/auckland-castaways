/* Play the actual cut and its sound using only the game's ordinary image and script transports. */
(function () {
  'use strict';
  const directory = 'assets/story-film-compat/';
  const width = 448, height = 252, fps = 8, columns = 4, perSheet = 16;
  let context, gestures = 0;

  function audioContext() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio && (!context || context.state === 'closed')) context = new Audio();
    } catch (_) { /* The painted clock also runs without audio hardware. */ }
    return context;
  }

  function prime() {
    gestures++;
    const ctx = audioContext();
    if (ctx && ctx.state !== 'running') {
      try { ctx.resume()?.catch(() => {}); } catch (_) { /* Await the next user gesture. */ }
    }
  }

  // ITU-T G.711 mu-law, normalized once; no audio/video codec or remote voice is required.
  const linear = Float32Array.from({length: 256}, (_, value) => {
    const code = (~value) & 255;
    const level = ((((code & 15) << 3) + 132) << ((code >> 4) & 7)) - 132;
    return (code & 128 ? -level : level) / 32768;
  });

  function start({reel, element, muted = false, paused = false, time = 0, reduced = false,
                  onReady, onTime, onEnd, onSound, onError}) {
    const canvas = document.createElement('canvas');
    canvas.id = 'film-compat-canvas';
    canvas.width = width;
    canvas.height = height;
    canvas.hidden = true;
    canvas.setAttribute('aria-hidden', 'true');
    element.after(canvas);
    const pen = canvas.getContext('2d', {alpha: false});
    let duration = 0;
    const passages = reel.shots.map(passage => {
      const start = duration;
      duration += passage.seconds;
      return start;
    });
    // A held painting changes on the same edit as the movie, even during a sentence.
    const cuts = window.CastawayFilmCuts?.[reel.id] || passages;
    const shots = cuts.map((start, index) => {
      const end = cuts[index + 1] ?? duration;
      const heldTime = start + Math.min(1, (end - start) / 2);
      return {end, frame: Math.floor(heldTime * fps)};
    });
    const frameCount = Math.round(duration * fps);
    const sheets = new Map();
    let gain = null, sound = null, buffer = null, soundRequest = null, soundDeadline = 0;
    let failedSound = false, reportedSound, reportedReason, requestedAtGesture = -1;
    let position = Math.max(0, Math.min(Number(time) || 0, duration));
    let epoch = null, timer = 0, frame = -1, ready = false, active = true, ended = false;
    let ctx;

    function clock() {
      return epoch === null ? position : Math.min(duration, position + (performance.now() - epoch) / 1000);
    }
    function stopSound() {
      if (sound) {
        try { sound.stop(); } catch (_) {}
        sound.disconnect();
        sound = null;
      }
    }
    function reportSound(available, reason) {
      if (active && (available !== reportedSound || reason !== reportedReason)) {
        reportedSound = available;
        reportedReason = reason;
        onSound?.(available, reason);
      }
    }
    function syncSound() {
      if (!active) return;
      if (!ctx || ctx.state !== 'running' || !buffer) {
        if (!ctx || failedSound) reportSound(false, 'unavailable');
        else if (ctx.state !== 'running') reportSound(false, 'gesture');
        stopSound();
        return;
      }
      reportSound(true);
      if (gain) gain.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, .008);
      if (paused || epoch === null || ended) {
        stopSound();
        return;
      }
      if (sound || muted) return;
      try {
        if (!gain) {
          gain = ctx.createGain();
          gain.connect(ctx.destination);
        }
        sound = ctx.createBufferSource();
        sound.buffer = buffer;
        sound.connect(gain);
        sound.start(0, Math.min(clock(), duration - 1 / buffer.sampleRate));
      } catch (_) {
        stopSound();
        reportSound(false, 'unavailable');
      }
    }
    function removeSoundRequest() {
      clearTimeout(soundDeadline);
      if (!soundRequest) return;
      soundRequest.onload = soundRequest.onerror = soundRequest.castawaySound = null;
      soundRequest.remove();
      soundRequest = null;
    }
    function requestSound() {
      if (!ctx || ctx.state === 'closed') {
        ctx?.removeEventListener('statechange', syncSound);
        ctx = audioContext();
        ctx?.addEventListener('statechange', syncSound);
      }
      if (failedSound && gestures > requestedAtGesture) failedSound = false;
      if (!ctx || soundRequest || buffer || failedSound || !active || !ready || muted) {
        syncSound();
        return;
      }
      const script = document.createElement('script');
      soundRequest = script;
      requestedAtGesture = gestures;
      script.async = true;
      script.castawaySound = (id, rate, count, packed) => {
        if (!active || id !== reel.id || rate !== 22050 || count !== duration * rate) return;
        try {
          const bytes = atob(packed);
          if (bytes.length !== count) return;
          const decoded = ctx.createBuffer(1, count, rate);
          const channel = decoded.getChannelData(0);
          for (let i = 0; i < count; i++) channel[i] = linear[bytes.charCodeAt(i)];
          buffer = decoded;
        } catch (_) { /* Complete the reel with the existing timed caption track. */ }
      };
      const complete = () => {
        if (soundRequest !== script) return;
        removeSoundRequest();
        failedSound = !buffer;
        syncSound();
      };
      script.onload = script.onerror = complete;
      soundDeadline = setTimeout(complete, 8000);
      script.src = directory + reel.id + '-audio.js';
      document.head.appendChild(script);
      syncSound();
    }

    function schedule(delay = 0) {
      if (active && !ended && !timer) timer = setTimeout(render, delay);
    }
    function loadSheet(index, urgent) {
      if (sheets.has(index)) return sheets.get(index);
      const image = new Image();
      const sheet = {image, state: 'loading', deadline: 0};
      sheets.set(index, sheet);
      const complete = good => {
        if (sheets.get(index) !== sheet || sheet.state !== 'loading') return;
        clearTimeout(sheet.deadline);
        image.onload = image.onerror = null;
        sheet.state = good ? 'ready' : 'failed';
        schedule();
      };
      image.onload = () => complete(image.naturalWidth === width * columns && image.naturalHeight >= height);
      image.onerror = () => complete(false);
      image.fetchPriority = urgent ? 'high' : 'low';
      sheet.deadline = setTimeout(() => complete(false), 10000);
      image.src = directory + reel.id + '-' + String(index + 1).padStart(2, '0') + '.webp';
      return sheet;
    }
    function discard(index) {
      const sheet = sheets.get(index);
      clearTimeout(sheet.deadline);
      sheet.image.onload = sheet.image.onerror = null;
      sheet.image.removeAttribute('src');
      sheets.delete(index);
    }
    function stop() {
      if (!active) return;
      position = clock();
      epoch = null;
      active = false;
      clearTimeout(timer);
      for (const index of sheets.keys()) discard(index);
      removeSoundRequest();
      stopSound();
      ctx?.removeEventListener('statechange', syncSound);
      gain?.disconnect();
      buffer = null;
      canvas.remove();
    }
    function render() {
      timer = 0;
      if (!active || ended) return;
      const at = clock();
      const currentShot = reduced ? shots.findIndex(shot => at < shot.end) : -1;
      const target = reduced ? shots[currentShot < 0 ? shots.length - 1 : currentShot].frame
        : Math.min(frameCount - 1, Math.floor(at * fps));
      const index = Math.floor(target / perSheet);
      const sheet = loadSheet(index, true);
      if (!pen || sheet.state === 'failed') {
        stop();
        onError?.();
        return;
      }
      if (sheet.state !== 'ready') {
        // A slow image must never leave an empty stage while narration runs on.
        if (epoch !== null) {
          position = at;
          epoch = null;
          stopSound();
        }
        return;
      }
      if (target !== frame) {
        const tile = target % perSheet;
        try {
          pen.drawImage(sheet.image, (tile % columns) * width, Math.floor(tile / columns) * height,
                        width, height, 0, 0, width, height);
        } catch (_) {
          stop();
          onError?.();
          return;
        }
        frame = target;
        canvas.dataset.frame = String(frame);
      }
      if (!ready) {
        ready = true;
        canvas.hidden = false;
        canvas.dataset.ready = 'true';
        onReady?.();
        if (!active) return;
        requestSound();
      }
      onTime?.(at);
      if (!active) return;
      if (at >= duration) {
        position = duration;
        epoch = null;
        ended = true;
        stopSound();
        onEnd?.();
        return;
      }
      // Keep only the displayed image and the next image the selected motion mode can use.
      const upcoming = reduced
        ? (currentShot + 1 < shots.length ? Math.floor(shots[currentShot + 1].frame / perSheet) : -1)
        : ((index + 1) * perSheet < frameCount ? index + 1 : -1);
      for (const cached of sheets.keys()) if (cached !== index && cached !== upcoming) discard(cached);
      if (upcoming >= 0) loadSheet(upcoming, false);
      if (paused) return;
      if (epoch === null) {
        position = at;
        epoch = performance.now();
        syncSound();
      }
      schedule(Math.max(16, 1000 / fps - (clock() * 1000) % (1000 / fps)));
    }
    requestSound();
    schedule();
    return {
      get currentTime() { return clock(); },
      get paused() { return paused || ended; },
      pause() {
        if (!active || paused || ended) return;
        position = clock();
        epoch = null;
        paused = true;
        stopSound();
        schedule();
      },
      resume() {
        if (!active || ended) return;
        paused = false;
        prime();
        requestSound();
        schedule();
      },
      setMuted(value) {
        muted = Boolean(value);
        requestSound();
      },
      stop
    };
  }
  window.CastawayFilmFallback = {prime, start};
})();

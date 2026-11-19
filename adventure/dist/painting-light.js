/* The painted stage, weather clock and live cast share one light direction.
   The camera is fixed. Menus, lettering and hit areas stay outside the pass. */
(function (host, factory) {
  const lighting = factory(host);
  if (typeof module === 'object' && module.exports) module.exports = lighting;
  else host.CastawayPaintingLight = lighting;
})(typeof window !== 'undefined' ? window : globalThis, function (host) {
  'use strict';

  const choices = ['auto', 'cinematic', 'balanced', 'original'];
  const preference = value => choices.includes(value) ? value : 'auto';

  function quality(choice, width, device, forcedColors) {
    if (forcedColors || choice === 'original') return 'off';
    if (choice === 'cinematic') return 'high';
    if (choice === 'balanced') return 'balanced';
    const limited = device?.deviceMemory > 0 && device.deviceMemory <= 4;
    return limited || width < 750 ? 'balanced' : 'high';
  }

  // A standing figure receives light at chest height. An ember cannot light a
  // distant face. The original outline and alpha of every drawing stay intact.
  function subjectLight(direction, footX, sampleY) {
    const key = direction.key, practical = direction.practical;
    let fire = 0;
    if (practical) {
      const dx = (footX - practical.x) * 16 / 9, dy = sampleY - practical.y;
      const d = (dx * dx + dy * dy) / (practical.radius * practical.radius);
      fire = practical.intensity / (1 + 3.5 * d);
    }
    const sky = direction.exposure;
    const brightness = Math.min(1.15, Math.max(.84, .34 + .67 * sky + fire * .31));
    const warmth = Math.max(0, direction.warmth * .8 + fire * .72);
    const chroma = Math.max(.92, Math.min(1.06, 1 + direction.warmth * .16 + fire * .10));
    const sourceX = fire > .10 ? practical.x : key.x;
    const cast = Math.max(-.8, Math.min(.8, (footX - sourceX) * 1.6));
    return {
      filter: 'brightness(' + brightness.toFixed(2) + ') sepia(' + warmth.toFixed(2) + ') saturate(' + chroma.toFixed(2) + ')',
      shadow: (cast * 13).toFixed(1) + '%'
    };
  }

  function create(scene, canvas, onStatus) {
    if (!scene || !canvas) return null;
    const subjects = new WeakMap();
    const colors = host.matchMedia?.('(forced-colors: active)');
    let size, backend, lastFrame = -Infinity, lastCast = -Infinity;
    let lastMode = '', width = 0, height = 0;

    function measure() {
      width = scene.clientWidth || 0;
      height = scene.clientHeight || 0;
      lastFrame = -Infinity;
    }
    measure();
    if (typeof host.ResizeObserver === 'function') {
      size = new host.ResizeObserver(measure);
      size.observe(scene);
    } else host.addEventListener?.('resize', measure);

    function shade(node, profile, x, y) {
      if (!node || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const next = subjectLight(profile, x / 100, y / 100);
      const previous = subjects.get(node);
      if (previous?.filter !== next.filter) node.style.setProperty('--incident-light', next.filter);
      if (previous?.shadow !== next.shadow) node.style.setProperty('--shadow-offset', next.shadow);
      subjects.set(node, next);
    }

    function frame({state, choice, now, paused, reduced, weatherRoot, player, actors, force = false}) {
      if (!width || !height) measure();
      if (!width || !height || !state || host.document?.hidden) return;
      const mode = quality(preference(choice), width, host.navigator, colors?.matches);
      const changed = lastMode !== mode;
      if (!force && !changed && now - lastFrame < (paused || reduced ? 155 : 55)) return;
      lastFrame = now;
      lastMode = mode;
      const modeName = mode === 'high' ? 'cinematic' : mode === 'off' ? 'original' : 'balanced';
      if (scene.dataset.lightingMode !== modeName) scene.dataset.lightingMode = modeName;
      const doc = scene.ownerDocument || host.document;
      const playerSprite = doc.getElementById('player-sprite');
      host.CastawayReflections?.update(scene, state, player, playerSprite, actors, mode !== 'off');
      if (mode === 'off' && !backend) {
        if (canvas.dataset.materialState !== 'off') {
          canvas.dataset.materialState = 'off';
          onStatus?.();
        }
        return;
      }
      if (!backend) backend = host.CastawayMaterialRenderer?.create(canvas, {onStatus});
      const weather = host.CastawayWeather?.illumination(weatherRoot, state);
      if (!weather) return;
      const direction = host.CastawayLightingDirection?.resolve(state.scene, weather, state.flags);
      if (!direction) return;
      backend?.render({scene:state.scene, flags:state.flags, weather, time:weather.time, direction, mode,
        paused, reduced, width, height, dpr:Math.max(1, host.devicePixelRatio || 1)});
      if (mode === 'off' || (!force && !changed && now - lastCast < 140)) return;
      lastCast = now;
      const body = doc.getElementById('player');
      shade(body, direction, player.x, player.y - (parseFloat(body?.style.height) || 30) * .66);
      for (const [id, position] of actors) {
        const actor = doc.getElementById('person-' + id);
        shade(actor, direction, position.x, position.y - (parseFloat(actor?.style.height) || 30) * .66);
      }
      for (const prop of scene.querySelectorAll('.target:not(.person) > .scene-prop')) {
        const anchor = prop.parentElement;
        if (anchor) shade(prop, direction, parseFloat(anchor.style.left), parseFloat(anchor.style.top));
      }
    }

    function dispose() {
      size?.disconnect();
      if (!size) host.removeEventListener?.('resize', measure);
      backend?.dispose();
    }
    return {frame, dispose};
  }
  return {create, preference, quality, subjectLight};
});

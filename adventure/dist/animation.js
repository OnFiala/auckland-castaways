// Painted six-pose atlases use one cell-relative crop and ground anchor per person.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CastawayMotion = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function walk(id) {
    const file = 'assets/walk/' + id + '.png';
    return { id, file, nativefile: file, width: 1536, height: 1024,
      commoncrop: [32, 5, 448, 500], groundanchor: [256, 498] };
  }
  const WALKS = {
    player: walk('player'),
    raynal: walk('raynal'),
    musgrave: walk('musgrave'),
    henry: walk('henry'),
    george: walk('george')
  };
  // Movement units are body heights, so every person takes the same-sized steps.
  // One complete atlas cycle contains two footfalls. At deck-walking pace
  // the feet land about 1.6 times per second.
  const REST_FRAME = 1, SPEED = .55, STRIDE = .88;
  function frameIndex(distanceBodyHeights) {
    return Number.isFinite(distanceBodyHeights)
      ? Math.floor((Math.abs(distanceBodyHeights) + 1e-9) / (STRIDE / 6)) % 6 : 0;
  }
  function frameBox(id, index) {
    const a = WALKS[id];
    if (!a) return null;
    const n = ((Math.floor(Number(index) || 0) % 6) + 6) % 6;
    const c = a.commoncrop;
    return [(n % 3) * 512 + c[0], Math.floor(n / 3) * 512 + c[1], c[2], c[3]];
  }
  function centeredClipX(atlas, frame) {
    const [cropX, , cropWidth] = atlas.commoncrop;
    return frame[0] + cropX + cropWidth / 2 - atlas.groundanchor[0];
  }
  function sprite(id, frame = REST_FRAME) {
    const a = WALKS[id], b = frameBox(id, frame);
    if (!a) return '';
    const box = b.join(' ');
    const groundOffset = (a.commoncrop[1] + a.commoncrop[3] - a.groundanchor[1]) / a.commoncrop[3] * 100;
    return `<svg class="painted walk-painting walk-viewport" style="position:relative;top:${groundOffset}%" viewBox="${box}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg class="atlas-clip" x="${centeredClipX(a, b)}" y="${b[1]}" width="${b[2]}" height="${b[3]}" viewBox="${box}" overflow="hidden" style="width:${b[2]}px;height:${b[3]}px;overflow:hidden!important"><image href="${a.file}" width="${a.width}" height="${a.height}"/></svg></svg>`;
  }
  const mounted = new WeakMap();
  function update(node, id, frame = REST_FRAME) {
    if (!node || !WALKS[id]) return false;
    let record = mounted.get(node);
    if (!record || record.id !== id || node.querySelector('.walk-viewport') !== record.viewport) {
      node.innerHTML = sprite(id, frame);
      const viewport = node.querySelector('.walk-viewport');
      const clip = node.querySelector('.atlas-clip');
      if (!viewport || !clip) return false;
      record = { id, viewport, clip, frame: null };
      mounted.set(node, record);
    }
    const b = frameBox(id, frame), key = b.join(' ');
    if (record.frame === key) return true;
    // Keep the decoded image alive. Only the clipping viewport moves over its atlas.
    record.viewport.setAttribute('viewBox', key);
    record.clip.setAttribute('viewBox', key);
    record.clip.setAttribute('x', centeredClipX(WALKS[id], b));
    record.clip.setAttribute('y', b[1]);
    record.frame = key;
    return true;
  }
  function ease(progress) {
    const t = Math.max(0, Math.min(1, Number(progress) || 0)), ramp = .15;
    if (t < ramp) return t * t / (2 * ramp * (1 - ramp));
    if (t > 1 - ramp) return 1 - (1 - t) * (1 - t) / (2 * ramp * (1 - ramp));
    return (t - ramp / 2) / (1 - ramp);
  }
  function travelDuration(distanceBodyHeights) {
    return Number.isFinite(distanceBodyHeights) ? Math.abs(distanceBodyHeights) / SPEED * 1000 : 0;
  }
  function routeProgress(elapsed, duration) {
    return duration > 0 ? ease(elapsed / duration) : 1;
  }
  function createTrack(id, options = {}) {
    // bodyHeight is measured in horizontal stage-percent units: h * 9 / 16.
    let bodyHeight = Number(options.bodyHeight) > 0 ? Number(options.bodyHeight) : 15;
    let x = 0, goal = 0, start = 0, elapsed = 0, duration = 0;
    let walked = 0, beforeRoute = 0, routeLength = 0, frame = REST_FRAME;
    let facing = 'left', travelling = false;
    function snapshot(held) {
      return { x, y: 0, moving: travelling && !held, frame, facing };
    }
    return {
      setGoal(next, settings = {}) {
        if (!Number.isFinite(next) || next === goal) return false;
        goal = next; start = x; elapsed = 0; beforeRoute = walked;
        routeLength = Math.abs(goal - start) / bodyHeight;
        duration = travelDuration(routeLength);
        facing = goal < start ? 'left' : 'right';
        travelling = duration > 0;
        if (settings.immediate) {
          x = goal; travelling = false; frame = REST_FRAME;
        }
        return true;
      },
      tick(dt, settings = {}) {
        const { paused = false, reduced = false } = settings;
        const nextHeight = Number(settings.bodyHeight);
        if (nextHeight > 0 && nextHeight !== bodyHeight) {
          // Keep the current location and gait phase when the stage scale changes.
          bodyHeight = nextHeight;
          if (travelling) {
            start = x; elapsed = 0; beforeRoute = walked;
            routeLength = Math.abs(goal - start) / bodyHeight;
            duration = travelDuration(routeLength);
          }
        }
        if (paused || reduced || !travelling) return snapshot(paused || reduced);
        if (Number.isFinite(dt)) elapsed += Math.max(0, Math.min(100, dt));
        const p = routeProgress(elapsed, duration);
        x = start + (goal - start) * p;
        walked = beforeRoute + routeLength * p;
        frame = frameIndex(walked);
        if (elapsed >= duration) {
          x = goal; travelling = false; frame = REST_FRAME;
        }
        return snapshot(false);
      },
      reset() {
        x = goal = start = elapsed = duration = walked = beforeRoute = routeLength = 0;
        frame = REST_FRAME; facing = 'left'; travelling = false;
      }
    };
  }
  return { WALKS, REST_FRAME, SPEED, STRIDE, frameIndex, frameBox, sprite, update,
    ease, routeProgress, travelDuration, createTrack };
});

// Painted six-pose atlases use one cell-relative crop and ground anchor per person.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CastawayMotion = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function walk(id, crop, anchor) {
    const file = 'assets/walk/' + id + '.png';
    return { id, file, nativefile: file, width: 1536, height: 1024,
      commoncrop: crop, groundanchor: anchor };
  }
  const WALKS = {
    player: walk('player', [70, 6, 363, 501], [256, 495]),
    raynal: walk('raynal', [79, 4, 380, 504], [256, 500]),
    musgrave: walk('musgrave', [86, 0, 371, 509], [256, 500]),
    henry: walk('henry', [79, 0, 352, 512], [256, 508]),
    george: walk('george', [68, 1, 382, 510], [256, 508])
  };
  function frameIndex(distancePercent) {
    return Number.isFinite(distancePercent) ? Math.floor(Math.abs(distancePercent) / 1.1) % 6 : 0;
  }
  function frameBox(id, index) {
    const a = WALKS[id];
    if (!a) return null;
    const n = ((Math.floor(Number(index) || 0) % 6) + 6) % 6;
    const c = a.commoncrop;
    return [(n % 3) * 512 + c[0], Math.floor(n / 3) * 512 + c[1], c[2], c[3]];
  }
  function sprite(id, frame) {
    const a = WALKS[id], b = frameBox(id, frame);
    if (!a) return '';
    const box = b.join(' ');
    return `<svg class="painted walk-painting" viewBox="${box}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg class="atlas-clip" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" viewBox="${box}" overflow="hidden" style="width:${b[2]}px;height:${b[3]}px;overflow:hidden!important"><image href="${a.file}" width="${a.width}" height="${a.height}"/></svg></svg>`;
  }
  const excursions = { musgrave: 4, raynal: -6, henry: -6, george: 3, player: 0 };
  function createTrack(id) {
    const end = excursions[id] || 0, magnitude = Math.abs(end);
    const startDelay = ({ raynal: 1500, musgrave: 2300, henry: 3100, george: 1100 })[id] || 1500;
    let elapsed = 0;
    function state(paused, reduced) {
      const afterStart = Math.max(0, elapsed - startDelay);
      const cycle = Math.floor(afterStart / 12600);
      const t = afterStart % 12600;
      let x = 0, distance = cycle * 2 * magnitude, moving = false;
      let facing = end < 0 ? 'left' : 'right';
      if (elapsed >= startDelay && t < 2800) {
        x = end * t / 2800; distance += magnitude * t / 2800; moving = !!end;
      } else if (elapsed >= startDelay && t < 7300) {
        x = end; distance += magnitude;
      } else if (elapsed >= startDelay && t < 10100) {
        const p = (t - 7300) / 2800;
        x = end * (1 - p); distance += magnitude * (1 + p); moving = !!end;
        facing = end < 0 ? 'right' : 'left';
      } else if (elapsed >= startDelay) {
        distance += 2 * magnitude;
        facing = end < 0 ? 'right' : 'left';
      }
      return { x, y: 0, moving: moving && !paused && !reduced,
        frame: moving && !paused && !reduced ? frameIndex(distance) : 0, facing };
    }
    return {
      tick(dt, options) {
        const { paused = false, reduced = false } = options || {};
        if (!paused && !reduced && Number.isFinite(dt)) elapsed += Math.max(0, Math.min(100, dt));
        return state(paused, reduced);
      },
      reset() { elapsed = 0; }
    };
  }
  return { WALKS, frameIndex, frameBox, sprite, createTrack };
});

/* Finite walks in painted floor space. There is no idle patrol or elapsed-time gait. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./ground.js'), require('./animation.js'));
  else root.CastawayChoreography = factory(root.CastawayGround, root.CastawayMotion);
})(typeof window !== 'undefined' ? window : globalThis, function (ground, motion) {
  'use strict';
  const aspect = 9 / 16;
  function walker(initial, facing = 'right', initialStride = 0) {
    let foot = { ...initial }, goal = { ...initial }, path = null, elapsed = 0, duration = 0;
    let travelled = initialStride, startStride = initialStride;
    return {
      get foot() { return foot; },
      get stride() { return travelled; },
      go(polygon, point, bodyHeightAt) {
        const destination = ground.project(polygon, point);
        if (ground.distance(goal, destination) < .012) return;
        goal = destination; path = ground.route(polygon, foot, goal); elapsed = 0; startStride = travelled;
        // Express pace in adult body heights. A distant man crosses fewer screen pixels per second.
        const meanHeight = (bodyHeightAt(foot.y) + bodyHeightAt(goal.y)) / 2;
        duration = path.length / (meanHeight * aspect * .70) * 1000;
      },
      tick(dt, heightAt, { paused = false, reduced = false } = {}) {
        let moving = Boolean(path && path.length > .012);
        if (path && !paused) {
          elapsed += Math.max(0, Math.min(100, dt));
          const fraction = reduced || duration <= 0 ? 1 : Math.min(1, elapsed / duration);
          const next = ground.sample(path, motion.ease(fraction)), dx = next.x - foot.x;
          if (Math.abs(dx) > .006) facing = dx < 0 ? 'left' : 'right';
          travelled += ground.distance(foot, next) / (Math.max(1, heightAt((foot.y + next.y) / 2)) * aspect);
          if (!Number.isFinite(travelled)) travelled = startStride;
          foot = next;
          if (fraction === 1) { path = null; moving = false; }
        }
        return { ...foot, facing, moving: moving && !paused && !reduced, frame: path ? motion.frameIndex(travelled) : motion.REST_FRAME };
      },
      get active() { return Boolean(path); }
    };
  }
  return { walker };
});

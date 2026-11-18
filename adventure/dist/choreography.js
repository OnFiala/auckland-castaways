/* Finite walks in painted floor space. There is no idle patrol or elapsed-time gait. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./ground.js'), require('./animation.js'));
  else root.CastawayChoreography = factory(root.CastawayGround, root.CastawayMotion);
})(typeof window !== 'undefined' ? window : globalThis, function (ground, motion) {
  'use strict';
  const aspect = 9 / 16;
  function walker(initial, facing = 'right', initialStride = 0) {
    let foot = { x: initial.x, y: initial.y }, goal = foot, path = null, elapsed = 0, duration = 0;
    let travelled = initialStride, startStride = initialStride;
    return {
      get foot() { return foot; },
      get stride() { return travelled; },
      go(polygon, point, bodyHeightAt) {
        const destination = ground.project(polygon, point);
        if (ground.distance(goal, destination) < .012) return;
        goal = destination; path = ground.route(polygon, foot, goal); elapsed = 0; startStride = travelled;
        const firstStep = path.points[1];
        if (firstStep && Math.abs(firstStep.x - foot.x) > .03) facing = firstStep.x < foot.x ? 'left' : 'right';
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
  // A station is a lasting place. Its hand pose is a one-time response to
  // seeing the job change. Entering a room establishes the current place.
  function crewMember(initialStation, polygon, heightAt) {
    let station = initialStation, workTime = null, noticing = false, gaze = station.facing;
    const path = walker(ground.project(polygon, station), station.facing);

    function lookAt(person, foot, fallback) {
      if (!person || Math.abs(person.x - foot.x) < .65) return fallback;
      return person.x < foot.x ? 'left' : 'right';
    }

    return {
      tick(next, dt, { paused = false, reduced = false, addressed = false, player, speaker } = {}) {
        if (next !== station && (next.x !== station.x || next.y !== station.y ||
            next.facing !== station.facing || next.pose !== station.pose)) {
          station = next;
          path.go(polygon, station, heightAt);
          workTime = station.pose === 'reach' || station.pose === 'crouch' ? 0 : null;
          noticing = false;
          gaze = station.facing;
        }
        // A greeting can interrupt the route before the job starts. Once the
        // hands have touched the object, the greeting ends that gesture.
        if (reduced || (addressed && !path.active && workTime >= 180)) workTime = null;
        const walking = path.active;
        const step = path.tick(dt, heightAt, { paused: paused || addressed, reduced });
        // A click stops the character at their present feet and turns them to
        // the visitor, even during a walk. Resume the route when released.
        if (addressed) {
          gaze = lookAt(player, step, gaze);
          return { ...step, moving: false, frame: motion.REST_FRAME, posture: 'stand', facing: gaze };
        }
        if (path.active) return { ...step, posture: 'walk' };

        let posture = 'stand', facing = station.facing;
        if (workTime !== null) {
          // Plant the feet before touching the wood, iron or rope. A paused
          // room holds the exact beat and a completed job never starts again.
          if (!walking && !paused) workTime += Math.max(0, Math.min(100, dt));
          const hold = station.pose === 'crouch' ? 980 : 760;
          if (workTime >= 180 + hold) workTime = null;
          else if (workTime >= 180) posture = station.pose;
        }
        if (workTime === null) {
          // Only those within conversational reach look up. Separate entry
          // and exit distances prevent flicker at the edge of the group.
          const visitor = speaker || player;
          const distance = visitor ? ground.distance(step, visitor) / (aspect * heightAt(step.y)) : Infinity;
          noticing = distance < (noticing ? 1.13 : .82);
          gaze = noticing ? lookAt(visitor, step, gaze) : station.facing;
          facing = gaze;
        }
        return { ...step, facing, posture };
      }
    };
  }
  return { walker, crewMember };
});

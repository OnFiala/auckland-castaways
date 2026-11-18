/* Feet, hands and props measured on the full 16:9 paintings. Units are percent
   of the stage width or height. These are production coordinates for the game. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CastawayStage = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const point = ([x, y]) => ({ x, y });

  // Each cut reads [x, back of walkable floor, front of walkable floor].
  // Joining the two edges makes a simple polygon, including bays beside the
  // furniture and the detour in front of the mast step in the open boat.
  function room(cuts, heights, first, from = {}) {
    const back = cuts.map(([x, y]) => ({ x, y }));
    const front = cuts.map(([x, , y]) => ({ x, y }));
    const walk = [cuts[0][0], cuts[cuts.length - 1][0],
      Math.min(...back.map(p => p.y)), Math.max(...front.map(p => p.y))];
    const left = cuts[0], right = cuts[cuts.length - 1];
    return {
      cuts, walk, walkPolygon: back.concat(front.reverse()),
      heightFar: heights[0], heightNear: heights[1],
      entry: {
        default: point(first),
        left: { x: left[0] + 3, y: (left[1] + left[2]) / 2 },
        right: { x: right[0] - 3, y: (right[1] + right[2]) / 2 }
      },
      from: Object.fromEntries(Object.entries(from).map(([id, p]) => [id, point(p)]))
    };
  }

  const shoreFloor = [[5, 74, 84], [16, 73, 87.7], [28, 71, 89], [43, 69.3, 91], [56, 65.3, 91], [71, 62.8, 89], [84, 62, 88], [94, 68.8, 85.5]];
  const wreckFloor = [[5.5, 76, 82], [18, 74, 88.5], [39, 73.6, 90], [50, 75.1, 90], [58.5, 76.3, 90], [68, 75.6, 89.5], [77.5, 75.3, 89.5], [84, 73.2, 89], [92, 67.3, 86], [95, 65.2, 83.7]];
  const campFloor = [[6, 69.5, 87.5], [18, 68.6, 90], [23, 70.4, 90], [32, 71.2, 90], [38, 68.8, 90], [51, 65.9, 90], [60, 69.1, 90], [66, 69.6, 90], [73, 67.8, 90], [80, 70.5, 89], [92.5, 72.9, 86.8]];
  const cabinFloor = [[5, 71.4, 88.2], [17, 71.2, 90], [24, 67.9, 90], [29, 70.1, 90], [45, 70.1, 90], [50, 67.8, 90], [54, 70.1, 90], [82, 70.2, 90], [86, 68.8, 90], [94, 70.2, 87.5]];
  const forestFloor = [[6, 73.5, 83.8], [16, 72.7, 87], [21.5, 72.1, 88.2], [29, 70, 90.2], [41, 66.7, 90.2], [52, 64.5, 90], [65, 66.9, 89.8], [75, 68, 87.7], [87, 66.6, 85.4], [94, 70.1, 81.5]];
  const forgeFloor = [[5, 62, 87], [9.5, 64, 90], [19, 66.5, 90], [30.5, 65.4, 90], [43, 63.9, 90], [54, 62.6, 90], [59.3, 63.8, 90], [62, 66.3, 90], [68, 66.3, 90], [72.2, 63.1, 90], [79, 62.4, 90], [92.8, 62.7, 88]];
  const slipwayFloor = [[6, 70, 87.7], [13, 69, 90], [25, 65.3, 90], [39, 61.7, 90], [44, 67.6, 90], [72, 68.2, 90], [77, 67.5, 90], [84.3, 65.1, 89], [90.8, 64.9, 87], [94, 67.6, 85.2]];
  const boatFloor = [[7, 75.6, 88.2], [18, 75.4, 89.3], [22, 77, 89.6], [27, 75.5, 89.7], [36, 75, 90], [39, 76.1, 90], [41, 78.2, 90], [47, 78.2, 90], [50, 75.4, 90], [65, 75.2, 90], [81, 76.1, 89.5], [92.3, 79.1, 88.5]];
  const pierFloor = [[5, 71.5, 90], [18, 71.1, 90.3], [32, 70.9, 90.3], [38.3, 72.3, 90.3], [43.5, 72.3, 90.3], [47, 70.7, 90.3], [66, 70.5, 90.3], [73, 72.4, 90.3], [81.5, 72.3, 90.3], [88, 70.5, 90.3], [94.5, 71.5, 89.5]];
  const chartFloor = [[5.5, 71.5, 88.5], [17, 71.5, 90], [21.5, 68.6, 90], [25, 71.5, 90], [70.5, 71.5, 90], [76.5, 68.4, 90], [85.5, 67.9, 90], [94.3, 71.7, 88.7]];
  const landingFloor = [[5, 66.7, 86.9], [15.3, 65.2, 89], [21, 64.8, 90], [29, 64.5, 90], [49, 64.8, 90], [57.5, 63.5, 90], [66.8, 64.1, 90], [73.5, 66.1, 90], [80, 66.2, 90], [92.7, 66, 88]];

  const rooms = {
    beach: room(shoreFloor, [30.5, 43], [15.7, 78.7], { wreck: [10.5, 78.7], camp: [89.8, 70.8] }),
    wreck: room(wreckFloor, [30, 42], [90.2, 76.2], { beach: [90.2, 76.2] }),
    camp: room(campFloor, [36, 47], [12, 78.2], { beach: [12, 78.2] }),
    cabin: room(cabinFloor, [41.4, 52.4], [48.5, 78.3], { forest: [92, 77.2] }),
    forest: room(forestFloor, [30.2, 42], [12.1, 78.5], { cabin: [12.1, 78.5] }),
    forge: room(forgeFloor, [39, 51.2], [8.1, 69.5], { charcoal: [8.1, 69.5] }),
    charcoal: room(forestFloor, [30.2, 42], [12.3, 78.5], { forge: [12.3, 78.5] }),
    slipway: room(slipwayFloor, [33.3, 46.4], [17.6, 76.4], { salvage: [11.2, 75.6] }),
    salvage: room(wreckFloor, [30, 42], [91.3, 75.9], { slipway: [91.3, 75.9] }),
    crossing: room(boatFloor, [40, 48.3], [49.9, 83.3]),
    harbour: room(pierFloor, [29.1, 41], [53, 79.3], { chartroom: [91, 77.2] }),
    chartroom: room(chartFloor, [41.4, 52], [88, 74.3], { harbour: [88, 74.3] }),
    landing: room(landingFloor, [30, 43.4], [14.7, 72.8], { return_camp: [88.9, 76.8] }),
    return_camp: room(cabinFloor, [41.4, 52.4], [91.8, 76.5], { landing: [91.8, 76.5] })
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function profile(id) { return rooms[id] || null; }

  function groundPoint(id, x, y) {
    const scene = profile(id);
    if (!scene) return { x, y };
    const cuts = scene.cuts;
    x = clamp(x, scene.walk[0], scene.walk[1]);
    let i = 1;
    while (i < cuts.length - 1 && x > cuts[i][0]) i++;
    const left = cuts[i - 1], right = cuts[i];
    const progress = (x - left[0]) / (right[0] - left[0]);
    const back = left[1] + progress * (right[1] - left[1]);
    const front = left[2] + progress * (right[2] - left[2]);
    return { x, y: clamp(y, back, front) };
  }

  // The entire painted standing figure, crown to sole, in % of frame height.
  function heightAt(id, footY) {
    const scene = profile(id);
    if (!scene) return 36;
    const progress = clamp((footY - scene.walk[2]) / (scene.walk[3] - scene.walk[2]), 0, 1);
    return scene.heightFar + progress * (scene.heightNear - scene.heightFar);
  }

  // Target centre, generous click field, soles during the action, working pose.
  // Art dimensions are independent stage percentages. Rotation is clockwise.
  function target(x, y, w, h, footX, footY, pose = 'reach') {
    return { x, y, w, h, approach: { x: footX, y: footY }, pose };
  }
  function prop(x, y, w, h, footX, footY, pose, artWidth, artHeight, artAngle = 0) {
    return { ...target(x, y, w, h, footX, footY, pose), artWidth, artHeight, artAngle };
  }

  const targets = {
    beach: {
      rope: prop(33.9, 67.8, 8, 9.4, 41.8, 72.1, 'crouch', 4.2, 5.1, -8),
      pole: prop(48, 71.9, 19.7, 11.2, 56.1, 76.2, 'crouch', 11.5, 19, 27),
      // Only the free end of the sail shows through the branches.
      sail: { ...prop(69, 33.4, 10, 16.5, 61, 66, 'reach', 6.2, 11.7, -13), art: 'flagcloth', indirect: true },
      driftwood: prop(25.5, 71, 13.1, 9.4, 17.5, 75.3, 'crouch', 11, 8.4, -4)
    },
    wreck: {
      prybar: prop(49.3, 69.5, 9.4, 12.5, 41.4, 74, 'crouch', 5.6, 11.1, 24),
      crate: target(72.2, 55.7, 14.3, 15, 63.9, 76.1)
    },
    camp: {
      shelter: { ...target(71.4, 49.5, 26.3, 30.5, 55.8, 69.9), contact: { x: 64.4, y: 50.5 } },
      hearth: target(27.3, 65.7, 15, 10.4, 19.1, 70.3, 'crouch'),
      cairn: prop(44.4, 60.5, 8.4, 9.3, 52.6, 66.9, 'crouch', 6.3, 6.8)
    },
    cabin: {
      hide: prop(59.1, 53.1, 9.8, 8.1, 48.8, 76.1, 'reach', 6.7, 7.4, -8),
      twine: prop(42.8, 48.5, 7.8, 7.8, 52.5, 70.2, 'reach', 3.2, 3.7),
      flask: prop(86.5, 48.7, 7.4, 10.4, 76.7, 70.4, 'reach', 3.9, 7.6, 3),
      roof: { ...target(53.7, 17.7, 18.5, 13, 50.2, 68.4, 'stand'), indirect: true },
      kettle: { ...prop(30.4, 45.2, 8.1, 11.4, 20.8, 69.6, 'reach', 5.2, 9.2), art: 'kettle' },
      stove: { ...target(10.8, 59.1, 16, 16.2, 21.6, 70.7, 'crouch'), contact: { x: 12.3, y: 65.6 } }
    },
    forest: { spring: target(21, 65.4, 13.4, 12.1, 28.8, 72, 'crouch') },
    forge: {
      leather: prop(77.8, 40.7, 8.5, 9, 86.8, 62.7, 'reach', 5.9, 7.2, -7),
      metalPipe: prop(91.1, 41.5, 7.9, 8.4, 82.1, 62.6, 'reach', 4.4, 5.1, 12),
      furnace: target(41.3, 43.7, 18.6, 20.8, 50.4, 64),
      anvil: { ...target(64.5, 45.9, 11.3, 12.1, 55.5, 63.2), contact: { x: 64.5, y: 43.2 } },
      testBlock: { ...prop(84.5, 40.9, 7.9, 7.3, 75.6, 62.8, 'reach', 5.3, 4.6, 7), art: 'planks' }
    },
    charcoal: {
      charcoal: prop(78.1, 62.8, 9.9, 8.6, 71.1, 68, 'crouch', 5.7, 5.8),
      ironScrap: prop(60.5, 69.5, 8.8, 8.9, 53, 73.7, 'crouch', 5.1, 5.6, 11)
    },
    slipway: {
      resin: prop(31.6, 46.8, 7, 9.2, 23.7, 66, 'reach', 3.2, 6.2),
      boatFrame: target(54.3, 48, 20.9, 8.3, 45.9, 67.8),
      seams: target(71.2, 54.2, 19.7, 7.7, 62.3, 74.1),
      // The unrigged mast crop includes the transparent space for its flag.
      // Offsetting its box keeps the actual shaft over the painted mast step.
      boatMast: { ...prop(64.8, 29.1, 8.6, 39.2, 53.7, 68.4, 'reach', 7, 39.2), contact: { x: 62.1, y: 49.4 }, indirect: true }
    },
    salvage: {
      planks: prop(48.5, 70.8, 12.1, 9.8, 40.7, 75.1, 'crouch', 9.7, 7.9, 9),
      oakum: prop(26.8, 69.5, 8.1, 8.5, 34.4, 73.9, 'crouch', 4.4, 4.8),
      sailcloth: prop(80.2, 59.2, 10.4, 8.7, 72.1, 77.5, 'reach', 7.2, 5.8, -6)
    },
    crossing: {
      bailer: prop(26.4, 76.3, 8.7, 8.4, 35.8, 81.5, 'crouch', 4.6, 5.2, 15),
      stormLine: prop(37.3, 74.6, 8.8, 8.8, 28, 79.7, 'crouch', 4.9, 5.4),
      compass: prop(59.2, 77.1, 7.3, 8.1, 49.6, 82.4, 'crouch', 2.9, 5.2, -4),
      canvasPatch: prop(81.9, 77.5, 9, 8.5, 72.3, 82.8, 'crouch', 4.9, 5.2, -9),
      rigging: { ...target(28.5, 49.7, 6.9, 21.7, 35.4, 76), contact: { x: 26.1, y: 55.1 } },
      bilge: target(66.4, 75.3, 11, 5.8, 57, 80.4, 'crouch'),
      tornSail: { ...target(76, 13.9, 10.4, 11.4, 53.9, 77.1), contact: { x: 44.1, y: 55.9 }, indirect: true },
      horizon: { ...target(8.8, 44.9, 13.5, 8.7, 8.8, 78.7, 'stand'), indirect: true }
    },
    harbour: {
      provisions: prop(76.8, 56.3, 8.5, 10.1, 69.9, 74.7, 'reach', 4.9, 8.5),
      spareSail: prop(61.4, 71.3, 12.2, 9.2, 55, 74.7, 'crouch', 8.1, 6.8, -6),
      rescueCutter: { ...target(38.9, 57.7, 27, 14.1, 41.3, 73.6, 'stand'), indirect: true }
    },
    chartroom: {
      chart: prop(32.3, 43.9, 12.1, 8, 23.1, 70.1, 'reach', 8, 5.9, -5),
      journal: prop(65.7, 45, 8.1, 8, 75, 70, 'reach', 4, 6.2, 7),
      chartTable: target(49.6, 47.6, 18.7, 11.2, 40, 73.3)
    },
    landing: {
      rescueLine: prop(24.4, 61.3, 8.9, 8.3, 30.7, 64.8, 'crouch', 4.9, 5.1),
      rescueProvisions: prop(56.4, 61.2, 9.2, 10, 62.7, 64.5, 'crouch', 5.3, 8.1),
      lantern: prop(79.5, 61.7, 7.5, 11.5, 86, 66.3, 'crouch', 3.5, 8.5),
      rescueBoat: { ...target(40.5, 53.6, 25.5, 12.7, 39.8, 67.8), contact: { x: 46.8, y: 49 } },
      signalPost: { ...target(76.3, 41.6, 7.2, 23.5, 69.3, 67.2), contact: { x: 76.1, y: 48.7 } }
    },
    return_camp: { campTable: target(37.8, 51.4, 19.3, 10.4, 27.9, 75.4) }
  };

  function position(x, y, facing, pose = 'stand') { return { x, y, facing, pose }; }
  function posting(home, changes = []) { return { home, changes }; }
  // A flag changes a job once. Read from the last matching entry so returning
  // to an old room restores one destination without replaying a round of chores.
  const stations = {
    beach: { raynal: posting(position(77.9, 69.1, 'left'), [
      ['canvasRecovered', position(74.3, 66.2, 'left')]
    ]) },
    wreck: { musgrave: posting(position(84.7, 74, 'left'), [
      ['crateOpen', position(80.9, 75.7, 'left', 'reach')]
    ]) },
    camp: {
      henry: posting(position(50.6, 71.9, 'right'), [
        ['shelterBuilt', position(56, 71.5, 'right')],
        ['firewoodPlaced', position(35.4, 70.6, 'left', 'crouch')],
        ['fireLit', position(35.3, 73.2, 'left')]
      ]),
      george: posting(position(88.6, 75, 'left'), [
        ['shelterBuilt', position(86.1, 73.9, 'left')],
        ['signalRaised', position(81.8, 73.2, 'left')]
      ]),
      raynal: posting(position(51, 73.9, 'left')),
      musgrave: posting(position(64.2, 76.7, 'left'))
    },
    cabin: { henry: posting(position(65.8, 70.7, 'left'), [
      ['roofSealed', position(62.7, 70.8, 'left')],
      ['waterStored', position(20.6, 71.7, 'right', 'reach')],
      ['warmthReady', position(22.3, 70.2, 'left')]
    ]) },
    forest: { george: posting(position(64.2, 69.1, 'left'), [
      ['waterFetched', position(33.8, 70.8, 'left')]
    ]) },
    forge: { raynal: posting(position(25.4, 67.1, 'right'), [
      ['bellowsFitted', position(30.1, 66.8, 'right', 'reach')],
      ['forgeLit', position(73.4, 64.8, 'left', 'reach')],
      ['drillForged', position(91.4, 64.1, 'left', 'reach')],
      ['drillFailed', position(73.4, 64.8, 'left', 'reach')],
      ['nailsForged', position(72.7, 65.1, 'left')]
    ]) },
    charcoal: { george: posting(position(88.3, 68.3, 'left'), [
      ['charcoalTaken', position(66.2, 68.9, 'left')],
      ['ironTaken', position(84.1, 68.6, 'left')]
    ]) },
    slipway: { musgrave: posting(position(38.1, 63.9, 'right'), [
      ['hullPlanked', position(59.2, 69.5, 'left', 'reach')],
      ['hullFastened', position(80, 76.1, 'left', 'reach')],
      ['boatSealed', position(83.9, 66.3, 'left')],
      ['sailRigged', position(85.6, 66.1, 'left')]
    ]) },
    salvage: { henry: posting(position(88.5, 73.3, 'left'), [
      // The plank has been lifted. Henry checks the exposed hull beside it.
      ['planksTaken', position(61.8, 77, 'right', 'reach')],
      ['sailclothTaken', position(87.7, 74.1, 'left')]
    ]) },
    crossing: {
      // Musgrave's chapter IX puts Alick and Raynal at the helm in turns.
      // Raynal has the present watch. Musgrave is near the water in the hull.
      raynal: posting(position(19.4, 76.9, 'left'), [
        ['rigSecured', position(19.4, 76.9, 'left', 'reach')],
        ['courseSet', position(19.4, 76.9, 'left')]
      ]),
      musgrave: posting(position(78.6, 79.4, 'left'), [
        ['rigSecured', position(75.2, 79.9, 'left', 'crouch')],
        ['boatDry', position(75.2, 79.9, 'left')]
      ])
    },
    landing: {
      henry: posting(position(30.2, 65.9, 'right'), [
        ['menRescued', position(34.5, 65.2, 'right')]
      ]),
      george: posting(position(51.2, 65.9, 'left'), [
        ['menRescued', position(47.2, 65.4, 'left')]
      ])
    },
    return_camp: {
      henry: posting(position(49.8, 69.6, 'left'), [
        ['suppliesShared', position(45.1, 71.4, 'left', 'reach')],
        ['henryFound', position(58.4, 71.6, 'right')]
      ]),
      george: posting(position(74.5, 71.1, 'left'), [
        ['georgeFound', position(81.3, 71.7, 'right')]
      ])
    }
  };

  // station is a stable home. actorGoal is the offset from home. workStation
  // is the final absolute location; use it directly for a still or reduced motion.
  function station(sceneId, actorId) { return stations[sceneId]?.[actorId]?.home || null; }

  function workStation(sceneId, actorId, state) {
    const posting = stations[sceneId]?.[actorId];
    if (!posting) return null;
    const flags = state?.flags || {};
    for (let i = posting.changes.length - 1; i >= 0; i--) {
      const [flag, next] = posting.changes[i];
      if (flags[flag]) return next;
    }
    return posting.home;
  }

  function actorGoal(sceneId, actorId, state) {
    const home = station(sceneId, actorId), next = workStation(sceneId, actorId, state);
    if (!home) return { x: 0, y: 0, facing: 'right', pose: 'stand' };
    return { x: next.x - home.x, y: next.y - home.y, facing: next.facing, pose: next.pose };
  }

  // Extra speakers only. People supplied by the engine are staged separately.
  function companions(sceneId, state) {
    if (sceneId === 'camp' && (state?.chapter || 1) === 1) {
      return state?.completed || state?.chapterComplete ? ['george', 'musgrave', 'raynal'] : ['george'];
    }
    const f = state?.flags || {};
    return sceneId === 'landing' && f.boatMoored && f.suppliesShared && f.henryFound && f.georgeFound
      ? ['henry', 'george'] : [];
  }

  function stageTarget(sceneId, source, state) {
    const result = { ...source };
    if (source.kind === 'person') {
      const home = station(sceneId, source.actor || source.id);
      if (!home) return result;
      const h = heightAt(sceneId, home.y);
      return { ...result, x: home.x, y: home.y - h / 2, groundY: home.y,
        w: clamp(h * 0.213, 6.5, 10.8), h, facing: home.facing, pose: home.pose };
    }
    const placed = targets[sceneId]?.[source.id];
    if (!placed) return result;
    Object.assign(result, placed);
    // Large objects are already painted in the plate. Only their pointer zone
    // is needed, while loose objects retain their own removable image.
    if (source.kind === 'puzzle' && !placed.artWidth) result.paint = false;
    if (sceneId === 'slipway' && source.id === 'boatMast') {
      result.art = 'mast';
      result.paint = !state?.flags?.sailRigged;
    }
    if (sceneId === 'beach' && source.id === 'driftwood' && state?.flags?.woodCut) result.paint = false;
    return result;
  }

  // Place navigation on the reachable side of the scene. In the harbour the
  // distant painted doorway is beyond the water; the exit stays on the wharf.
  const exits = {
    beach: { wreck: [6.8, 75.8, 8.6, 78], camp: [92.4, 63.3, 90.2, 68.1] },
    wreck: { beach: [93.4, 66.7, 92.5, 69.3] },
    camp: { beach: [7.1, 70.8, 8.8, 73.6] },
    cabin: { forest: [94.2, 74.3, 92, 75.2] },
    forest: { cabin: [6.4, 73.8, 8.5, 75.1] },
    forge: { charcoal: [6.4, 54.2, 6.4, 63.6] },
    charcoal: { forge: [6.4, 73.8, 8.5, 75.1] },
    slipway: { salvage: [6.3, 71.5, 8.8, 73.8] },
    salvage: { slipway: [93.4, 66.7, 92.5, 69.3] },
    harbour: { chartroom: [94.3, 75.2, 92.3, 75.2] },
    chartroom: { harbour: [94.2, 57.2, 91.1, 72.5] },
    landing: { return_camp: [93.1, 68.8, 90.8, 70.4] },
    return_camp: { landing: [94.2, 74.3, 92, 75.2] }
  };

  function stageExit(sceneId, source) {
    const placed = exits[sceneId]?.[source.to];
    if (!placed) return { ...source };
    const [x, y, footX, footY] = placed;
    return { ...source, x, y, approach: { x: footX, y: footY } };
  }

  const marks = {
    camp: { hearth: { x: 27.3, y: 65.7 }, fireBase: { x: 27.3, y: 67.1 },
      mastBase: { x: 44.4, y: 63 }, mastArt: { x: 46.9, y: 44, w: 6.8, h: 38 } },
    cabin: { steam: { x: 30.5, y: 42.4 }, roofPatch: { x: 53.7, y: 17.7, w: 9, h: 7 }, hearth: { x: 10.8, y: 61 } },
    forest: { water: { x: 21, y: 66.8 } },
    forge: { mouth: { x: 41.1, y: 42 }, tuyere: { x: 34.7, y: 44.5 } },
    slipway: { mastStep: { x: 62, y: 49 }, strake: { x: 71.2, y: 54.2 } },
    crossing: { halyard: { x: 44.1, y: 55.9 }, tear: { x: 76, y: 13.9 }, bilge: { x: 66.4, y: 75.3 } },
    landing: { lantern: { x: 75.1, y: 45.1, w: 3.2, h: 8.5 }, line: { x: 76.3, y: 39 } },
    return_camp: { provisions: { x: 37.9, y: 45.2, w: 4.7, h: 8.5 } }
  };

  return { profile, groundPoint, heightAt, stageTarget, stageExit, station, workStation,
    actorGoal, companions, marks };
});

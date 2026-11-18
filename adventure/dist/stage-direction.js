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

  const shoreFloor = [[5, 72.9, 81.5], [12.5, 72, 83.7], [20.2, 70.3, 87.8], [28, 69.1, 90.6], [43, 68.7, 91], [57.5, 69.7, 91], [71, 70.3, 90.3], [81.2, 70.7, 89.6], [87.2, 68.5, 89], [92.3, 64, 87.6], [95, 67.2, 86.6]];
  const wreckFloor = [[5.5, 83.5, 88], [15, 82.8, 89.5], [22, 80.3, 90], [31, 77.9, 90], [34.2, 76.7, 90], [38, 79, 90], [41.4, 82.9, 90], [45.1, 82.8, 90], [50.6, 78.7, 90], [57.2, 77.1, 90], [63.2, 74.4, 90], [71, 73.4, 90], [80.5, 71.1, 89.8], [86, 67.9, 88], [95, 65.2, 85]];
  const campFloor = [[6, 69.5, 87.5], [18, 68.6, 90], [23, 70.4, 90], [32, 71.2, 90], [38, 68.8, 90], [51, 65.9, 90], [60, 69.1, 90], [66, 69.6, 90], [73, 67.8, 90], [80, 70.5, 89], [92.5, 72.9, 86.8]];
  const cabinFloor = [[5, 71.4, 88.2], [17, 71.2, 90], [24, 67.9, 90], [29, 70.1, 90], [45, 70.1, 90], [50, 67.8, 90], [54, 70.1, 90], [82, 70.2, 90], [86, 68.8, 90], [94, 70.2, 87.5]];
  const forestFloor = [[6, 73.5, 83.8], [16, 72.7, 87], [21.5, 72.1, 88.2], [29, 70, 90.2], [41, 66.7, 90.2], [52, 64.5, 90], [65, 66.9, 89.8], [75, 68, 87.7], [87, 66.6, 85.4], [94, 70.1, 81.5]];
  const forgeFloor = [[5, 62, 87], [9.5, 64, 90], [19, 66.5, 90], [30.5, 65.4, 90], [43, 63.9, 90], [54, 62.6, 90], [59.3, 63.8, 90], [62, 66.3, 90], [68, 66.3, 90], [72.2, 63.1, 90], [79, 62.4, 90], [92.8, 62.7, 88]];
  const slipwayFloor = [[10, 81.6, 88.4], [13, 73.8, 90], [16.5, 61.4, 90], [20.1, 59.3, 90], [24.3, 63.5, 90], [29.2, 64.8, 90], [39.5, 62.5, 90], [43.2, 71.5, 90], [48.3, 72.3, 90], [56.7, 69.3, 90], [66.3, 68.5, 90], [70.8, 78.8, 90], [75.1, 79.7, 90], [83.7, 72.4, 89.6], [89.8, 66.9, 84.6], [94, 64.6, 81.1]];
  const boatFloor = [[7, 75.6, 88.2], [18, 75.4, 89.3], [22, 77, 89.6], [27, 75.5, 89.7], [36, 75, 90], [39, 76.1, 90], [41, 78.2, 90], [47, 78.2, 90], [50, 75.4, 90], [65, 75.2, 90], [81, 76.1, 89.5], [92.3, 79.1, 88.5]];
  const pierFloor = [[5, 71.5, 90], [18, 71.1, 90.3], [32, 70.9, 90.3], [38.3, 72.3, 90.3], [43.5, 72.3, 90.3], [47, 70.7, 90.3], [66, 70.5, 90.3], [73, 72.4, 90.3], [81.5, 72.3, 90.3], [88, 70.5, 90.3], [94.5, 71.5, 89.5]];
  const chartFloor = [[5.5, 71.5, 88.5], [17, 71.5, 90], [21.5, 68.6, 90], [25, 71.5, 90], [70.5, 71.5, 90], [76.5, 68.4, 90], [85.5, 67.9, 90], [94.3, 71.7, 88.7]];
  const landingFloor = [[5, 66.7, 86.9], [15.3, 65.2, 89], [21, 64.8, 90], [29, 64.5, 90], [49, 64.8, 90], [57.5, 63.5, 90], [66.8, 64.1, 90], [73.5, 66.1, 90], [80, 66.2, 90], [92.7, 66, 88]];

  const rooms = {
    beach: room(shoreFloor, [30.5, 43], [63.6, 75.7], { wreck: [10.5, 77.8], camp: [90.7, 70.8] }),
    wreck: room(wreckFloor, [30, 42], [93.3, 77.8], { beach: [93.3, 77.8] }),
    camp: room(campFloor, [36, 47], [12, 78.2], { beach: [12, 78.2] }),
    cabin: room(cabinFloor, [41.4, 52.4], [48.5, 78.3], { forest: [92, 77.2] }),
    forest: room(forestFloor, [30.2, 42], [12.1, 78.5], { cabin: [12.1, 78.5] }),
    forge: room(forgeFloor, [39, 51.2], [8.1, 69.5], { charcoal: [8.1, 69.5] }),
    charcoal: room(forestFloor, [30.2, 42], [12.3, 78.5], { forge: [12.3, 78.5] }),
    slipway: room(slipwayFloor, [33.3, 46.4], [23.2, 79], { salvage: [18.7, 65.1] }),
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
      rope: prop(34, 71.6, 8, 8.4, 42.16, 75.54, 'crouch', 4.2, 5.1, -8),
      pole: prop(48.4, 75.4, 17.8, 9.8, 56.98, 79.55, 'crouch', 11.5, 19, 27),
      // Only the free end of the sail shows through the branches.
      sail: { ...prop(70.1, 37.6, 9.1, 14.4, 64.8, 71.6, 'reach', 6.1, 11.4, -13), art: 'flagcloth', indirect: true },
      driftwood: prop(25.5, 73.5, 11.8, 8.4, 17.13, 77.54, 'crouch', 11, 8.4, -4)
    },
    wreck: {
      prybar: prop(53, 77.5, 9.4, 11.2, 61.64, 81.68, 'crouch', 5.6, 11.1, 24),
      crate: { ...target(73, 57.9, 15.4, 15.9, 63.3, 75.72), contact: { x: 71.2, y: 56.5 } }
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
      resin: prop(32, 45.6, 7, 8.5, 23.78, 66.79, 'reach', 3.2, 6.2),
      boatFrame: { ...target(55.7, 55.6, 17.9, 6.7, 44.25, 77.49), contact: { x: 53.5, y: 55 } },
      seams: target(73.2, 59, 16, 7, 63.45, 82.71),
      // The same painted spar sits inside the thwart collar in both states.
      boatMast: { ...target(66, 29.4, 6.5, 43.8, 57.22, 72.66), contact: { x: 66, y: 51.3 }, indirect: true }
    },
    salvage: {
      planks: prop(53.2, 77.5, 12.1, 9.8, 61.84, 81.68, 'crouch', 9.7, 7.9, 9),
      oakum: prop(27.8, 76.2, 8.1, 8.5, 36.29, 80.3, 'crouch', 4.4, 4.8),
      sailcloth: prop(82.2, 61.9, 10.4, 8.7, 90.9, 83.07, 'reach', 7.2, 5.8, -6)
    },
    crossing: {
      bailer: prop(24.4, 80.8, 8.7, 8.4, 34.87, 85.86, 'crouch', 4.6, 5.2, 15),
      stormLine: prop(34.1, 81.1, 8.8, 8.8, 23.59, 86.18, 'crouch', 4.9, 5.4),
      compass: prop(59.2, 77.1, 7.3, 8.1, 49.23, 81.92, 'crouch', 2.9, 5.2, -4),
      canvasPatch: prop(84.7, 80.3, 9, 8.5, 74.30, 85.33, 'crouch', 4.9, 5.2, -9),
      rigging: { ...target(30.1, 49.2, 6.5, 18.2, 37.06, 77.02), contact: { x: 27.8, y: 54.5 } },
      bilge: target(65, 81.2, 13, 6, 54.48, 86.28, 'crouch'),
      tornSail: { ...target(77.1, 14, 9.6, 10.9, 52.11, 84.63), contact: { x: 41.9, y: 59.8 }, indirect: true },
      horizon: { ...target(8.8, 44.9, 13.5, 8.7, 8.8, 78.7, 'stand'), indirect: true }
    },
    harbour: {
      provisions: prop(80.2, 55.5, 8.5, 10.1, 73.1, 74.5, 'reach', 4.9, 8.5),
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
    beach: { raynal: posting(position(77.8, 72.1, 'left'), [
      ['canvasRecovered', position(77.8, 72.1, 'left')]
    ]) },
    wreck: { musgrave: posting(position(86.5, 72.4, 'left'), [
      ['crateOpen', position(81.74, 74.24, 'left', 'reach')]
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
      // The ill man gets the dry place under the sail; the captain can count the group from its open side.
      raynal: posting(position(70.2, 71.8, 'left')),
      musgrave: posting(position(53, 76.6, 'left'))
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
    slipway: { musgrave: posting(position(38, 66.8, 'right'), [
      ['hullPlanked', position(60.1, 77.4, 'left', 'reach')],
      ['hullFastened', position(82.4, 79.8, 'left', 'reach')],
      ['boatSealed', position(89.2, 70.5, 'left')],
      ['sailRigged', position(90, 71.2, 'left')]
    ]) },
    salvage: { henry: posting(position(60.6, 78.2, 'left'), [
      // The plank has been lifted. Henry checks the exposed hull beside it.
      ['planksTaken', position(36.1, 81.9, 'left', 'reach')],
      ['sailclothTaken', position(66.1, 76.7, 'left')]
    ]) },
    crossing: {
      // Musgrave's chapter IX puts Alick and Raynal at the helm in turns.
      // Raynal has the present watch. Musgrave is near the water in the hull.
      raynal: posting(position(19.4, 79.8, 'left'), [
        ['rigSecured', position(19.4, 79.8, 'left', 'reach')],
        ['courseSet', position(19.4, 79.8, 'left')]
      ]),
      musgrave: posting(position(78.6, 79.4, 'left'), [
        ['rigSecured', position(74.49, 86.18, 'left', 'crouch')],
        ['boatDry', position(74.49, 86.18, 'left')]
      ])
    },
    // The dock compresses the time ashore and at Invercargill. Raynal stays
    // beside the landed stores while the player prepares the return passage.
    harbour: { raynal: posting(position(27.5, 74.3, 'right'), [
      ['chartMarked', position(32.2, 74.8, 'right')],
      ['rescueSupplied', position(31.4, 74.8, 'left', 'reach')],
      ['rescueRigged', position(31.4, 74.8, 'left')]
    ]) },
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
    if (sceneId === 'camp' && !state?.chapter) {
      // The standalone first night uses the original engine with fixed scene targets.
      return state?.completed ? ['george', 'musgrave', 'raynal'] : ['george'];
    }
    if (sceneId === 'harbour' && state?.chapter === 6) return ['raynal'];
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
    // The raised lid remains part of the chest when the player examines it.
    if (sceneId === 'wreck' && source.id === 'crate' && state?.flags?.crateOpen) {
      result.y = 49.8;
      result.h = 33;
    }
    if (sceneId === 'beach' && source.id === 'driftwood' && state?.flags?.woodCut) result.paint = false;
    return result;
  }

  // Place navigation on the reachable side of the scene. In the harbour the
  // distant painted doorway is beyond the water; the exit stays on the wharf.
  const exits = {
    beach: { wreck: [6.9, 73.1, 8.7, 76.4], camp: [92.4, 60.7, 92.2, 66.2] },
    wreck: { beach: [94, 59.5, 92.3, 68.6] },
    camp: { beach: [7.1, 70.8, 8.8, 73.6] },
    cabin: { forest: [94.2, 74.3, 92, 75.2] },
    forest: { cabin: [6.4, 73.8, 8.5, 75.1] },
    forge: { charcoal: [6.4, 54.2, 6.4, 63.6] },
    charcoal: { forge: [6.4, 73.8, 8.5, 75.1] },
    slipway: { salvage: [15.8, 59.7, 18, 64.4] },
    salvage: { slipway: [94, 59.5, 92.3, 68.6] },
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
    slipway: { mastStep: { x: 66, y: 51.3 }, strake: { x: 73.2, y: 59 } },
    crossing: { halyard: { x: 41.9, y: 59.8 }, tear: { x: 77.1, y: 14 }, bilge: { x: 65, y: 81.2 } },
    landing: { lantern: { x: 77.8, y: 35.3, w: 3.2, h: 8.5 }, line: { x: 76.3, y: 39 } },
    return_camp: { provisions: { x: 37.9, y: 45.2, w: 4.7, h: 8.5 } }
  };

  return { profile, groundPoint, heightAt, stageTarget, stageExit, station, workStation,
    actorGoal, companions, marks };
});

// Keep the planted supports and camera scale shared with the six-frame walk.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.CastawayWorkPoses = factory(root);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  // Measured native pixels. assets/work-poses/manifest.json records the source and method.
  const SHEETS = {
    player: {
      size: [2172, 724], walkView: [363, 501], walkGround: [186, 489], walkStandingHeight: 475, standingHeight: 705,
      poses: {
        stand: { crop: [244, 4, 274, 714], ground: [383, 713] },
        reach: { crop: [854, 51, 485, 665], ground: [1033, 710], contact: [1333, 333] },
        crouch: { crop: [1569, 244, 461, 469], ground: [1740, 708], contact: [2024, 618] },
      }
    },
    raynal: {
      size: [1881, 836], walkView: [380, 504], walkGround: [177, 496], walkStandingHeight: 487, standingHeight: 801,
      poses: {
        stand: { crop: [171, 11, 255, 810], ground: [306, 816] },
        reach: { crop: [684, 71, 501, 747], ground: [878, 813], contact: [1179, 373] },
        crouch: { crop: [1315, 305, 509, 506], ground: [1496, 806], contact: [1818, 723] },
      }
    },
    musgrave: {
      size: [1774, 887], walkView: [371, 509], walkGround: [170, 500], walkStandingHeight: 493, standingHeight: 843,
      poses: {
        stand: { crop: [156, 6, 258, 852], ground: [287, 853] },
        reach: { crop: [628, 64, 506, 793], ground: [792, 852], contact: [1128, 344] },
        crouch: { crop: [1216, 295, 529, 554], ground: [1423, 844], contact: [1739, 751] },
      }
    },
    henry: {
      size: [1942, 809], walkView: [352, 512], walkGround: [177, 508], walkStandingHeight: 496, standingHeight: 771,
      poses: {
        stand: { crop: [218, 12, 259, 780], ground: [353, 787] },
        reach: { crop: [718, 71, 510, 720], ground: [890, 786], contact: [1222, 330] },
        crouch: { crop: [1341, 303, 499, 487], ground: [1527, 785], contact: [1834, 718] },
      }
    },
    george: {
      size: [1881, 836], walkView: [382, 510], walkGround: [188, 507], walkStandingHeight: 495, standingHeight: 795,
      poses: {
        stand: { crop: [180, 13, 278, 804], ground: [326, 812] },
        reach: { crop: [699, 79, 533, 737], ground: [876, 810], contact: [1226, 366] },
        crouch: { crop: [1321, 291, 522, 523], ground: [1522, 809], contact: [1837, 740] },
      }
    },
  };

  const decoded = new Map();
  const mounted = new WeakMap();
  const svgNS = 'http://www.w3.org/2000/svg';
  const file = id => 'assets/work-poses/' + id + '.png';

  function prepare(id) {
    if (!Object.hasOwn(SHEETS, id) || typeof root.Image !== 'function') return Promise.resolve(false);
    if (decoded.has(id)) return decoded.get(id).ready;
    const image = new root.Image();
    const entry = { image, loaded: false, ready: null };
    entry.ready = new Promise(resolve => {
      image.onload = async function () {
        // An already decoded image can be displayed even on browsers which reject decode().
        if (typeof image.decode === 'function') {
          try { await image.decode(); } catch (_) { /* onload succeeded */ }
        }
        entry.loaded = true;
        resolve(true);
      };
      image.onerror = () => resolve(false);
    });
    decoded.set(id, entry);
    image.src = file(id);
    return entry.ready;
  }

  function poseOf(id, name) {
    if (!Object.hasOwn(SHEETS, id)) return null;
    const poses = SHEETS[id].poses;
    const key = name === 'work' ? 'reach' : name;
    return Object.hasOwn(poses, key) ? poses[key] : null;
  }

  // Signed displacement in upright body heights. Right-facing hands are forward, up is positive.
  function contact(id, name) {
    const pose = poseOf(id, name);
    if (!pose || !pose.contact) return null;
    const height = SHEETS[id].standingHeight;
    return { x: (pose.contact[0] - pose.ground[0]) / height,
      y: (pose.ground[1] - pose.contact[1]) / height };
  }

  function makeMount(host, id) {
    const doc = host.ownerDocument;
    const walk = host.querySelector('.walk-viewport');
    if (!walk || !doc || typeof doc.createElementNS !== 'function') return null;
    const sheet = SHEETS[id];
    const viewport = doc.createElementNS(svgNS, 'svg');
    const clip = doc.createElementNS(svgNS, 'svg');
    const image = doc.createElementNS(svgNS, 'image');
    viewport.setAttribute('class', 'painted work-viewport');
    viewport.setAttribute('aria-hidden', 'true');
    viewport.setAttribute('viewBox', '0 0 ' + sheet.walkView.join(' '));
    viewport.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const offset = (sheet.walkView[1] - sheet.walkGround[1]) / sheet.walkView[1] * 100;
    viewport.style.cssText = 'position:absolute;left:0;top:' + offset +
      '%;width:100%;height:100%;overflow:visible;pointer-events:none;visibility:hidden';
    viewport.style.setProperty('--sole-y', (100 - offset) + '%');
    clip.style.setProperty('overflow', 'hidden', 'important');
    image.setAttribute('href', file(id));
    image.setAttribute('width', sheet.size[0]);
    image.setAttribute('height', sheet.size[1]);
    clip.appendChild(image);
    viewport.appendChild(clip);
    host.appendChild(viewport);
    return { host, id, walk, viewport, clip, pose: null, visible: false, wanted: false,
      awaiting: false, previousVisibility: walk.style.visibility };
  }

  function position(record, name, pose) {
    if (record.pose === name) return;
    const sheet = SHEETS[record.id];
    const scale = sheet.walkStandingHeight / sheet.standingHeight;
    const [x, y, width, height] = pose.crop;
    record.clip.setAttribute('viewBox', pose.crop.join(' '));
    // The painted sole sits on the centre of the button in both facings.
    // Turning around must not move either the standing figure or its shadow.
    record.clip.setAttribute('x', sheet.walkView[0] / 2 + (x - pose.ground[0]) * scale);
    record.clip.setAttribute('y', sheet.walkGround[1] + (y - pose.ground[1]) * scale);
    record.clip.setAttribute('width', width * scale);
    record.clip.setAttribute('height', height * scale);
    // The original game's target stylesheet sizes every nested SVG to 100%.
    record.clip.style.width = width * scale + 'px';
    record.clip.style.height = height * scale + 'px';
    record.pose = name;
  }

  function display(record, visible) {
    if (record.viewport.parentNode !== record.host) return;
    if (record.visible !== visible) {
      record.viewport.style.visibility = visible ? 'visible' : 'hidden';
      record.walk.style.visibility = visible ? 'hidden' : record.previousVisibility;
      record.visible = visible;
    }
    if (visible) {
      if (record.host.dataset.workPose !== record.pose) record.host.dataset.workPose = record.pose;
    } else if (record.host.dataset.workPose) {
      delete record.host.dataset.workPose;
    }
  }

  function hide(host) {
    const record = mounted.get(host);
    if (!record) return false;
    record.wanted = false;
    display(record, false);
    if (record.viewport.parentNode !== host) delete host.dataset.workPose;
    return true;
  }

  function show(host, id, name = 'stand', facing) {
    const pose = poseOf(id, name);
    if (!host || !pose || typeof root.Image !== 'function') {
      if (host) hide(host);
      return false;
    }
    if (facing === 'left' || facing === 'right') {
      const transform = facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
      if (host.style.transform !== transform) host.style.transform = transform;
    }
    let record = mounted.get(host);
    if (!record || record.id !== id || record.viewport.parentNode !== host) {
      delete host.dataset.workPose;
      if (record && record.viewport.parentNode === host) {
        hide(host);
        record.viewport.remove();
      }
      record = makeMount(host, id);
      if (!record) return false;
      mounted.set(host, record);
    }
    record.wanted = true;
    position(record, name === 'work' ? 'reach' : name, pose);
    const ready = prepare(id);
    if (decoded.get(id).loaded) {
      display(record, true);
      return true;
    }
    // A delayed load must never replace a resumed walk or a different person's atlas.
    if (!record.awaiting) {
      record.awaiting = true;
      ready.then(ok => {
        if (ok && record.wanted && mounted.get(host) === record) display(record, true);
      });
    }
    return false;
  }

  return { prepare, show, hide, contact };
});

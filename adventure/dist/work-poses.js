// Keep the planted supports and camera scale shared with the six-frame walk.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(root);
  else root.CastawayWorkPoses = factory(root);
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  // Measured native pixels. assets/work-poses/manifest.json records the source and method.
  const SHEETS = {
    player: {
      size: [1536, 512], walkView: [448, 500], walkGround: [224, 493], walkStandingHeight: 482, standingHeight: 482,
      poses: {
        stand: { crop: [175, 11, 160, 494], ground: [256, 498] },
        reach: { crop: [660, 68, 339, 436], ground: [768, 498], contact: [961, 234] },
        crouch: { crop: [1141, 162, 374, 341], ground: [1280, 498], contact: [1475, 445] }
      }
    },
    raynal: {
      size: [1536, 512], walkView: [448, 500], walkGround: [224, 493], walkStandingHeight: 482, standingHeight: 482,
      poses: {
        stand: { crop: [217, 10, 176, 494], ground: [256, 498] },
        reach: { crop: [685, 71, 314, 434], ground: [768, 498], contact: [961, 226] },
        crouch: { crop: [1164, 181, 340, 322], ground: [1280, 498], contact: [1474, 449] }
      }
    },
    musgrave: {
      size: [1536, 512], walkView: [448, 500], walkGround: [224, 493], walkStandingHeight: 482, standingHeight: 482,
      poses: {
        stand: { crop: [173, 12, 174, 494], ground: [256, 498] },
        reach: { crop: [611, 38, 391, 466], ground: [768, 498], contact: [961, 210] },
        crouch: { crop: [1119, 166, 373, 338], ground: [1280, 498], contact: [1456, 446] }
      }
    },
    henry: {
      size: [1536, 512], walkView: [448, 500], walkGround: [224, 493], walkStandingHeight: 482, standingHeight: 482,
      poses: {
        stand: { crop: [163, 11, 183, 495], ground: [256, 498] },
        reach: { crop: [618, 60, 385, 446], ground: [768, 498], contact: [961, 237] },
        crouch: { crop: [1147, 172, 360, 332], ground: [1280, 498], contact: [1474, 447] }
      }
    },
    george: {
      size: [1536, 512], walkView: [448, 500], walkGround: [224, 493], walkStandingHeight: 482, standingHeight: 482,
      poses: {
        stand: { crop: [211, 11, 191, 495], ground: [256, 498] },
        reach: { crop: [617, 69, 388, 436], ground: [768, 498], contact: [961, 223] },
        crouch: { crop: [1117, 168, 396, 336], ground: [1280, 498], contact: [1473, 447] }
      }
    }
  };

  const decoded = new Map();
  const mounted = new WeakMap();
  const svgNS = 'http://www.w3.org/2000/svg';
  const file = id => 'assets/work-poses/' + id + '.png';

  function available(id) { return Boolean(decoded.get(id)?.loaded); }

  function prepare(id,retry=false) {
    if (!Object.hasOwn(SHEETS, id) || typeof root.Image !== 'function') return Promise.resolve(false);
    const previous = decoded.get(id);
    if (previous && (!previous.failed || (!retry && Date.now()<previous.retryAt))) return previous.ready;
    const attempt = (previous?.attempt || 0) + 1;
    const url = file(id) + (attempt>1 ? '?retry='+attempt : '');
    const image = new root.Image();
    const entry = {image, url, attempt, loaded:false, failed:false};
    decoded.set(id,entry);
    entry.ready = new Promise(resolve => {
      let finished=false;
      function finish(ok) {
        if (finished) return;
        finished=true;
        root.clearTimeout?.(deadline);
        image.onload=image.onerror=null;
        entry.loaded=ok;
        entry.failed=!ok;
        entry.retryAt=Date.now()+2000;
        resolve(ok);
      }
      const deadline=root.setTimeout?.(()=>finish(false),4000);
      image.onload=async()=>{
        try { await image.decode?.(); } catch (_) { finish(false); return; }
        finish(image.naturalWidth!==0 && image.naturalHeight!==0);
      };
      image.onerror=()=>finish(false);
      image.src=url;
    });
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
    return { host, id, walk, viewport, clip, image, pose: null, visible: false, wanted: false,
      waitingFor: null, previousVisibility: walk.style.visibility };
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
      const url=decoded.get(record.id).url;
      if (record.url!==url) {record.image.setAttribute('href',url);record.url=url;}
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
    if (record.waitingFor !== ready) {
      record.waitingFor = ready;
      ready.then(ok => {
        if (ok && record.wanted && mounted.get(host) === record) display(record, true);
      });
    }
    return false;
  }

  return { prepare, available, show, hide, contact };
});

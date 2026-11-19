/* Reflect the paint already selected by the actor renderer onto registered wet surfaces. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root, require('./ground.js'), require('./landscape.js'));
  } else {
    root.CastawayReflections = factory(root, root.CastawayGround, root.CastawayLandscape);
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root, ground, landscape) {
  'use strict';

  const ns = 'http://www.w3.org/2000/svg';
  const records = new WeakMap();
  const forcedColors = root.matchMedia?.('(forced-colors: active)');
  const surface = (name, outline) => ({
    name,
    points: outline.map(([x, y]) => ({x, y})),
    clip: 'polygon(' + outline.map(([x, y]) => `${x}% ${y}%`).join(', ') + ')'
  });

  // The shore plate's silver sand ends above the low foreground rock and wrack.
  // The wharf's return stays inside the bright boards, clear of the dock edge.
  const sand = surface('wet-sand', [
    [5.8, 72.8], [12, 71.6], [20.7, 70.2], [30.8, 69.5], [42.8, 69.6],
    [55.5, 71], [61.6, 73.8], [60.2, 79.7], [56.8, 85], [48, 87.3],
    [39.7, 87.4], [29.4, 85.8], [26.1, 83.4], [17.4, 82.8], [9, 82.1],
    [7, 79.6], [3.6, 77.1]
  ]);
  const wharf = surface('wet-wharf', [
    [5.6, 71.9], [19.8, 70.8], [31.6, 70.5], [43.7, 70.9], [53.6, 70],
    [66, 71.3], [70, 74.7], [68.7, 80.5], [66.2, 85.1], [58.3, 89.7],
    [42.7, 89.9], [34.6, 89.5], [25.2, 90], [14, 89.4], [5.4, 87.6],
    [2, 84.2], [2.4, 77.9]
  ]);
  const standingWater = landscape?.describe({scene: 'crossing'}).find(part => part.style === 'bilge');
  const bilge = standingWater && surface('bilge', standingWater.points);

  function surfaceFor(state) {
    switch (state.scene) {
      case 'beach': return sand;
      case 'harbour': return wharf;
      case 'crossing': return state.flags?.boatDry ? null : bilge;
      default: return null;
    }
  }

  function element(doc, className) {
    const node = doc.createElement('div');
    node.className = className;
    return node;
  }

  function mount(scene) {
    const layer = element(scene.ownerDocument, 'planar-reflections');
    layer.id = 'planar-reflections';
    layer.setAttribute('aria-hidden', 'true');
    scene.appendChild(layer);
    const record = {layer, surface: null, receiver: null, actors: new Map()};
    records.set(scene, record);
    return record;
  }

  function setSurface(record, next) {
    record.layer.hidden = !next;
    record.layer.replaceChildren();
    record.actors.clear();
    record.surface = next;
    record.receiver = null;
    if (!next) {
      delete record.layer.dataset.surface;
      return;
    }
    const receiver = element(record.layer.ownerDocument, 'planar-reflection__receiver');
    receiver.style.clipPath = next.clip;
    record.receiver = receiver;
    record.layer.dataset.surface = next.name;
    record.layer.appendChild(receiver);

    // This fixed reflection uses the painted middle mooring post as its source.
    if (next === wharf) {
      receiver.appendChild(element(receiver.ownerDocument, 'planar-reflection__post'));
    }
  }

  function reflectedActor(receiver, id) {
    const doc = receiver.ownerDocument;
    const projection = element(doc, `planar-reflection__projection planar-reflection--${id}`);
    const svg = doc.createElementNS(ns, 'svg');
    const crop = doc.createElementNS(ns, 'svg');
    const image = doc.createElementNS(ns, 'image');
    svg.setAttribute('focusable', 'false');
    crop.style.setProperty('overflow', 'hidden', 'important');
    crop.appendChild(image);
    svg.appendChild(crop);
    projection.appendChild(svg);
    receiver.appendChild(projection);
    return {projection, svg, crop, image, source: null, signature: '', position: ''};
  }

  function currentPaint(sprite) {
    if (!sprite?.parentElement || sprite.parentElement.querySelector('.shore-rest')) return null;
    // The work-pose loader switches this only after its atlas is decoded.
    const viewport = sprite.querySelector(sprite.dataset.workPose ? '.work-viewport' : '.walk-viewport');
    const crop = viewport?.firstElementChild;
    const image = crop?.firstElementChild;
    return image ? {viewport, crop, image} : null;
  }

  function copyAttributes(from, to, names) {
    for (const name of names) {
      const value = from.getAttribute(name);
      if (value !== null && to.getAttribute(name) !== value) to.setAttribute(name, value);
    }
  }

  function updateActor(record, id, point, sprite) {
    if (!ground.contains(record.surface.points, point)) return false;
    const paint = currentPaint(sprite);
    const height = Number.parseFloat(sprite?.parentElement?.style.height);
    if (!paint || !Number.isFinite(height)) return false;

    let actor = record.actors.get(id);
    if (!actor) {
      actor = reflectedActor(record.receiver, id);
      record.actors.set(id, actor);
    }
    const {viewport, crop, image} = paint;
    const signature = [viewport.getAttribute('viewBox'), crop.getAttribute('viewBox'), image.getAttribute('href')].join('/');
    if (actor.source !== viewport || actor.signature !== signature) {
      copyAttributes(viewport, actor.svg, ['viewBox', 'preserveAspectRatio']);
      copyAttributes(crop, actor.crop, ['x', 'y', 'width', 'height', 'viewBox']);
      copyAttributes(image, actor.image, ['href', 'width', 'height']);
      actor.crop.style.width = crop.style.width;
      actor.crop.style.height = crop.style.height;
      actor.svg.style.top = viewport.style.top;
      actor.source = viewport;
      actor.signature = signature;
    }
    const facing = sprite.style.transform === 'scaleX(-1)' ? -1 : 1;
    const position = `${point.x}/${point.y}/${height}/${facing}`;
    if (actor.position !== position) {
      actor.projection.style.left = point.x + '%';
      actor.projection.style.top = point.y + '%';
      actor.projection.style.width = height * .60 + '%';
      actor.projection.style.height = height + '%';
      actor.projection.style.setProperty('--reflection-facing', facing);
      actor.position = position;
    }
    return true;
  }

  function update(scene, state, player, sprite, companions, enabled = true) {
    const next = enabled && !forcedColors?.matches ? surfaceFor(state) : null;
    let record = records.get(scene);
    if (!record && !next) return;
    if (!record) record = mount(scene);
    if (record.surface !== next) setSurface(record, next);
    if (!next) return;

    updateEdges(scene, record);
    if (!updateActor(record, 'player', player, sprite)) removeActor(record, 'player');
    if (companions) {
      for (const [id, point] of companions) {
        if (id === 'player') continue;
        const counterpart = scene.ownerDocument.getElementById('actor-' + id);
        if (!updateActor(record, id, point, counterpart)) removeActor(record, id);
      }
    }
    for (const id of record.actors.keys()) {
      if (id !== 'player' && !companions?.has(id)) removeActor(record, id);
    }
  }

  function removeActor(record, id) {
    record.actors.get(id)?.projection.remove();
    record.actors.delete(id);
  }

  function updateEdges(scene, record) {
    const coverage = root.CastawayEdgeCoverage;
    if (!coverage) return;
    if (!record.edges) {
      const edges = {width: scene.clientWidth};
      record.edges = edges;
      if (root.ResizeObserver) {
        const observer = new root.ResizeObserver(([entry]) => {
          edges.width = Math.round(entry.contentRect.width);
        });
        observer.observe(scene);
      }
    }
    const edges = record.edges;
    const width = root.ResizeObserver ? edges.width : scene.clientWidth;
    const enabled = scene.dataset.lightingMode === 'cinematic';
    if (edges.receiver === record.receiver && edges.appliedWidth === width && edges.enabled === enabled) return;
    edges.receiver = record.receiver;
    edges.appliedWidth = width;
    edges.enabled = enabled;
    coverage.update(record.receiver, record.surface.name, record.surface.points, width, enabled);
  }

  return {update, surfaceFor};
});

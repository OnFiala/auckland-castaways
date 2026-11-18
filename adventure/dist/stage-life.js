/* Optical movement cut from the active painting. Coordinates are percentages of
   the whole plate; each crop retains its scale and registration with that plate. */
(function (host) {
  'use strict';
  const paintedSea = '0,0 100,0 100,100 0,100';
  const cache = new WeakMap();
  const number = v => Number(v.toFixed(4));
  const rect = ([x, y, w, h]) => `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
  function polygon(points) {
    return points.split(' ').map(pair => pair.split(',').map(n => n + '%').join(' ')).join(',');
  }
  function wash(id, box, motion, shape = paintedSea, file) {
    const [x, y, w, h] = box;
    const size = `${number(10000 / w)}% ${number(10000 / h)}%`;
    const position = `${number(100 * x / (100 - w))}% ${number(100 * y / (100 - h))}%`;
    return {
      id, css: 'life-paint ' + motion, box,
      style: `background-size:${size};background-position:${position};clip-path:polygon(${polygon(shape)})` +
        (file ? `;background-image:url("assets/voyage/scenes/${file}.png")` : '')
    };
  }
  function mark(id, box, css, motif) { return {id, box, css, motif}; }

  // These small marks are light, water and physical work. The objects and all
  // surrounding scenery come from the existing paintings.
  const ink = {
    shaving: '<g class="life-floating-sliver"><path d="M4 57q7-7 17-3-5 4-15 6z"/></g><path class="life-eddy-ring" d="M1 64q13 4 25-2m24-4q12 2 21-4"/>',
    skip: '<path class="life-skipping-stone" d="M80 80q7-5 12-2l-2 4-9 1z"/><g class="life-skip-rings"><ellipse cx="52" cy="45" rx="10" ry="2.7"/><ellipse cx="19" cy="33" rx="13" ry="3.8"/></g>',
    lineTest: '<g class="life-rope-test"><path class="life-rope-shadow" d="M1 11Q38 92 99 52"/><path class="life-rope" d="M1 11Q38 92 99 52"/></g>',
    resinDust: '<g class="life-wood-grains"><path d="m29 45 3-1m10 14 3 1m16-9 2-2m8 13 2 .5"/></g>',
    lashing: '<g class="life-hitch"><path d="M17 22q32 19 67 3M17 37q33 17 64 2M16 52q31 16 64 1m-46 7q-5 15-19 21"/></g>',
    leak: '<g class="life-drips"><path d="M30 8l-.8 3.2q0 1.8 1.6 0z"/><path d="M31 7l-.7 2.8q0 1.4 1.4 0z"/></g><ellipse class="life-drip-ring" cx="31" cy="93" rx="9" ry="1"/>',
    steam: '<g class="life-vapour"><path d="M41 94C61 72 21 57 44 32S53 15 46 3"/><path d="M55 95C41 81 66 63 58 51S42 35 58 17"/></g>',
    sparks: '<g class="life-sparks"><path d="M49 90l-5-8m17 5 5-11m-36 6-6-4m29-7 2-8"/><path d="M55 93l7-6m-13-3-4-12m-8 6-8-8"/></g>',
    coal: '<g class="life-fuel"><path d="m10 83 4-13 8-5 5 14-4 8zm27-3 1-19 7-5 4 15-6 8zm29 1-4-13 7-8 7 8-4 11z"/></g><g class="life-hot"><path d="m16 76 6 2m17-8 4-8m23 8 6-4m10 18 5-8"/></g>',
    dust: '<g class="life-motes"><circle cx="16" cy="23" r=".45"/><circle cx="59" cy="41" r=".66"/><circle cx="48" cy="64" r=".39"/><circle cx="79" cy="76" r=".48"/></g>',
    rope: '<path class="life-rope-shadow" d="M2 94Q53 85 96 3"/><path class="life-rope" d="M2 94Q53 85 96 3"/>',
    overboard: '<g class="life-splash"><path d="M3 64Q32 8 80 33Q92 42 98 68"/><path d="M6 65Q44 14 81 37m8 7 4 7m3 6 2 7"/></g>',
    pour: '<g class="life-pour"><path d="M13 10Q46 15 69 86m-48-72Q50 26 65 80"/><ellipse cx="64" cy="89" rx="10" ry="2"/></g>',
    chips: '<g class="life-chips"><path d="m36 61 13-22-7 24zM58 54l20-19-15 22zM31 50 24 37l10 11z"/></g>',
    twine: '<path class="life-thread" pathLength="100" d="M4 67Q31 28 45 50T74 61L96 32"/>',
    soot: '<g class="life-soot"><ellipse cx="35" cy="65" rx="12" ry="6"/><ellipse cx="50" cy="55" rx="16" ry="9"/><ellipse cx="64" cy="63" rx="9" ry="5"/></g>',
    inkRoute: '<path class="life-course" pathLength="100" d="M3 79Q13 83 20 69T40 65L57 49 72 48 89 19"/><path class="life-chart-cross" d="m86 14 6 9m-8-1 10-7"/>',
    seam: '<path class="life-caulk" pathLength="100" d="M4 53Q42 63 68 49T97 28"/>',
    bilge: '<g class="life-puddle"><path d="M3 67Q19 54 27 56T54 49Q73 39 97 48Q71 51 55 65T18 78Z"/><path d="M19 72q11-6 21-7m18-7 16-5"/></g>',
    fibres: '<g class="life-fibres"><path d="M53 45q-13-11-27-12m24 15-28-6m32 6q-7-14-13-17"/></g>'
  };
  function draw(motif) {
    if (motif?.startsWith('prop-')) {
      const prop = host.AdventureArt?.props[motif.slice(5)];
      if (!prop) return '';
      return `<svg viewBox="${prop.box.join(' ')}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><svg x="${prop.box[0]}" y="${prop.box[1]}" width="${prop.box[2]}" height="${prop.box[3]}" viewBox="${prop.box.join(' ')}" overflow="hidden" style="width:${prop.box[2]}px;height:${prop.box[3]}px;overflow:hidden"><image href="${prop.file}" width="${prop.width}" height="${prop.height}"/></svg></svg>`;
    }
    return motif ? '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + ink[motif] + '</svg>' : '';
  }

  const sea = (id, box, style = 'life-swell') => wash(id, box, style + ' life-feather');
  const light = (id, box, css) => mark(id, box, css);
  const shore = () => [sea('surf', [0, 50.4, 12.4, 10.8], 'life-breaker'), sea('outer-water', [0, 44.1, 7.8, 5.1])];
  const wreck = () => [
    sea('rock-wash', [0, 54.4, 10.1, 13.0], 'life-breaker'),
    wash('tattered-cloth', [24.6, 6.4, 9.4, 22], 'life-rag', '4,5 48,13 95,13 81,44 68,47 61,88 55,70 43,98 39,52 27,66 23,40')
  ];
  const stream = () => [
    wash('seep', [18.2, 49.2, 5.7, 17.7], 'life-fall life-feather'),
    sea('stream-pool', [18.3, 65.4, 11.7, 4.5], 'life-current')
  ];
  function details(s) {
    const f = s.flags;
    switch (s.scene) {
      case 'beach': return shore();
      case 'wreck':
      case 'salvage': return wreck();
      case 'camp': return [
        wash('windward-leaves', [7.4, 2.7, 18.4, 9.2], 'life-fern life-feather'),
        sea('cove', [24.4, 32, 8.8, 3.3], 'life-current'),
        f.shelterBuilt && wash('lean-to', [59.8, 32.2, 23.3, 20.1], 'life-awning', '2,86 20,56 31,38 37,25 96,4 88,86 62,99 31,95'),
        f.fireLit && light('embers-on-stones', [22, 62.8, 10.4, 6.1], 'life-fire-cast')
      ];
      case 'forest': return stream();
      case 'charcoal': return [
        ...stream(),
        wash('fern', [0.3, 85.5, 12, 12.5], 'life-fern life-feather')
      ];
      case 'cabin': return [
        light('window-light', [13.7, 17.3, 13.8, 19.5], 'life-window'),
        !f.roofSealed && mark('leaking-seam', [53.2, 21.6, 5.2, 47.2], 'life-leak', 'leak'),
        f.warmthReady && light('hearth', [7.0, 55.2, 11, 11.2], 'life-hearth'),
        f.warmthReady && mark('warming-water', [28.5, 30.1, 4.6, 12.6], 'life-steam', 'steam')
      ];
      case 'return_camp': return [
        light('fire-in-stones', [6.2, 54.5, 12.6, 12.5], 'life-hearth'),
        light('warm-floor', [5.1, 65.5, 26.1, 10.8], 'life-fire-cast'),
        mark('dust-at-window', [14.1, 19.3, 19.5, 39], 'life-dust', 'dust')
      ];
      case 'forge': return [
        wash('roof-at-door', [2.1, 9.8, 10.7, 8.6], 'life-awning', '0,8 83,26 100,91 44,77 7,43'),
        sea('water-at-door', [2.0, 46.4, 7.0, 7.5], 'life-current'),
        f.bellowsFitted && wash('bellows', [18.2, 33.4, 12.4, 23.3], f.forgeLit ? 'life-bellows pumping' : 'life-bellows', '0,0 40,16 97,49 99,60 48,82 5,98'),
        f.forgeFueled && mark('charcoal-bed', [34.8, 39.6, 13, 6.5], 'life-coals' + (f.forgeLit ? ' burning' : ''), 'coal'),
        f.forgeLit && light('forge-fire', [33.8, 33, 15.1, 15.3], 'life-forge-fire'),
        f.forgeLit && light('forge-apron', [31.6, 44.9, 20.1, 8.1], 'life-fire-cast')
      ];
      case 'slipway': return [
        wash('bench-awning', [27.0, 34.5, 12.7, 6.2], 'life-awning', '0,76 67,31 100,1 86,49 38,97'),
        sea('water-beyond-stocks', [1.0, 31.1, 19.8, 6.6], 'life-current'),
        f.hullPlanked && !f.sailRigged && wash('raised-planking', [42.1, 42.1, 40.9, 14.8], 'life-planking', '0,37 19,54 39,63 59,60 78,44 96,13 100,2 96,55 78,82 55,96 29,97 6,78', 'slipway-ready'),
        f.boatSealed && mark('caulked-seam', [66.8, 50.7, 12.9, 5.3], 'life-sealed-seam', 'seam'),
        f.sailRigged && wash('sail-on-stocks', [62, 9.1, 18.4, 35], 'life-set-sail', '1,2 47,54 98,91 1,100')
      ];
      case 'crossing': return [
        sea('seaward-swell', [49.2, 45.5, 42.8, 13.3], 'life-seaway'),
        sea('port-swell', [1.0, 45.9, 18.6, 6.4], 'life-seaway port'),
        f.rigSecured && mark('secured-shroud', [24.7, 55.5, 2.4, 3.6], 'life-lashing', 'lashing'),
        wash('drawing-sail', [48.1, 0, 51.4, 31.3], f.sailMended ? 'life-ocean-sail mended' : 'life-ocean-sail', '1,0 99,0 96,18 62,55 2,99'),
        !f.boatDry && mark('bilge-water', [59.5, 72.7, 14.1, 4.0], 'life-bilge', 'bilge')
      ];
      case 'harbour': return [
        sea('sun-path', [4.3, 43, 12.2, 11.3], 'life-reflection'),
        sea('harbour-water', [56.3, 55, 10.5, 7.1], 'life-tide'),
        f.rescueSupplied && mark('stores-aboard', [33.4, 48.8, 3.8, 5.8], 'life-cargo', 'prop-provisions'),
        f.rescueRigged && mark('spare-canvas-aboard', [28.2, 52, 4.8, 3.2], 'life-cargo', 'prop-spareSail'),
        wash('furled-sail', [28.8, 46.1, 20.7, 4.8], 'life-harbour-sail', '0,4 21,30 75,17 97,26 91,61 36,90 4,75')
      ];
      case 'chartroom': return [
        mark('light-motes', [4.2, 16.2, 27.8, 39.6], 'life-dust', 'dust'),
        wash('chart-corner', [64.5, 42.2, 8.5, 6.3], 'life-page', '0,0 40,3 100,94 26,92'),
        f.rescueRoute && mark('pencilled-course', [39.5, 40.3, 17.4, 5.1], 'life-map', 'inkRoute')
      ];
      case 'landing': return [
        wash('cutter-at-anchor', [1.9, 15.7, 14.7, 22.4], 'life-anchor-boat life-feather'),
        sea('inlet', [17.6, 35.6, 36.7, 8.0], 'life-current'),
        sea('wash-at-keel', [2.5, 54.5, 17.8, 5.3], 'life-tide'),
        f.boatMoored && mark('mooring-line', [53.7, 39.1, 22.1, 7.3], 'life-mooring', 'rope'),
        f.landingMarked && light('lantern-on-post', [72.4, 41.2, 5.4, 8.6], 'life-lantern')
      ];
      default: return [];
    }
  }

  // Cues are anchored on what moves during the work, even when the clickable
  // part is much larger. They are deliberately silent for dialogue and travel.
  const beats = {
    woodCut: ['driftwood', 'chips', 22.2, 65.2, 6.0, 7.8],
    canvasRecovered: ['sail', 'fibres', 66.1, 31.7, 5.2, 6.2],
    crateOpen: ['crate', 'soot', 65.3, 46.0, 10.5, 8],
    shelterBuilt: ['shelter', 'twine', 78, 31, 5.5, 6.6],
    fireLit: ['hearth', 'sparks', 25.2, 56.5, 4.3, 8],
    signalRaised: ['cairn', 'twine', 44.2, 25.0, 4.6, 6.1],
    roofSealed: ['roof', 'twine', 50.9, 14.9, 6.5, 5.4],
    waterFetched: ['spring', 'overboard', 18.1, 63.8, 5.8, 3.8],
    waterStored: ['kettle', 'pour', 27.2, 36.8, 4.6, 6.4],
    warmthReady: ['stove', 'sparks', 10.3, 56.9, 3.5, 6.4],
    bellowsFitted: ['furnace', 'twine', 28.5, 40.3, 5, 5],
    forgeFueled: ['furnace', 'soot', 35.4, 34.0, 11, 11],
    forgeLit: ['furnace', 'sparks', 38.2, 33.2, 6.8, 10.8],
    drillForged: ['anvil', 'sparks', 62.7, 34, 5.9, 8.4],
    drillFailed: ['testBlock', 'chips', 81.2, 49.0, 5.8, 5.8],
    nailsForged: ['anvil', 'sparks', 62.7, 34, 5.9, 8.4],
    hullPlanked: ['boatFrame', 'chips', 55.3, 47.3, 7, 5.5],
    hullFastened: ['boatFrame', 'chips', 58.7, 47.5, 4.1, 4.8],
    boatSealed: ['seams', 'seam', 53.8, 52.6, 17.5, 4.7],
    sailRigged: ['boatMast', 'twine', 62.8, 41.1, 6.7, 5],
    rigSecured: ['rigging', 'twine', 25.4, 50.6, 5.1, 9.4],
    boatDry: ['bilge', 'overboard', 76.7, 52.5, 11.8, 8.9],
    sailMended: ['tornSail', 'twine', 74, 8.0, 6.5, 7],
    rescueRoute: ['chartTable', 'inkRoute', 39.5, 40.3, 17.4, 5.1],
    rescueSupplied: ['rescueCutter', 'fibres', 37, 53.4, 6, 4.6],
    rescueRigged: ['rescueCutter', 'twine', 38.2, 45.8, 7.6, 5.2],
    boatMoored: ['rescueBoat', 'twine', 73.1, 34.6, 4.1, 6.7],
    landingMarked: ['signalPost', 'sparks', 74.1, 43, 2.1, 2.9],
    suppliesShared: ['campTable', 'fibres', 37, 43.6, 5.4, 6.0],
    menRescued: ['rescueBoat', 'overboard', 51.6, 53.7, 8, 3.6]
  };

  function plate(s) {
    if (s.scene === 'beach') return 'assets/beach.png';
    if (s.scene === 'wreck') return s.flags.crateOpen ? 'assets/states/wreck-open.png' : 'assets/wreck.png';
    if (s.scene === 'camp') return s.flags.shelterBuilt ? 'assets/states/camp-shelter.png' : 'assets/camp.png';
    return host.CastawayWorld?.background(s) || '';
  }
  function element(doc, part) {
    const node = doc.createElement('span');
    node.className = part.css;
    node.dataset.life = part.id;
    node.style.cssText = rect(part.box) + ';' + (part.style || '');
    if (part.motif) node.innerHTML = draw(part.motif);
    return node;
  }

  function render(root, state) {
    if (!root) return;
    const prev = cache.get(root);
    if (prev?.state === state) return;
    let layer = prev?.layer;
    if (!layer || prev.state.scene !== state.scene) {
      layer = root.ownerDocument.createElement('div');
      layer.className = 'life-ambient';
      root.replaceChildren(layer);
      root.setAttribute('aria-hidden', 'true');
    }
    const file = plate(state);
    if (file && prev?.file !== file) root.style.setProperty('--life-plate', `url("${file}")`);
    // Keep unaffected waves, light and cloth running across an inventory change.
    const parts = details(state).filter(Boolean);
    const existing = new Map(Array.from(layer.children, node => [node.dataset.life, node]));
    for (const part of parts) {
      const node = existing.get(part.id);
      if (!node) layer.append(element(root.ownerDocument, part));
      else {
        if (node.className !== part.css) node.className = part.css;
        existing.delete(part.id);
      }
    }
    for (const stale of existing.values()) stale.remove();
    // Some actions share a target. Preserve the actual newly completed flag so a
    // late bellows fitting does not play the charcoal-loading beat, for example.
    const changes = prev?.state.scene === state.scene ? Object.keys(beats).filter(key => state.flags[key] && !prev.state.flags[key]) : [];
    cache.set(root, {state, file, layer, changes});
  }
  // Hands land on existing details in the plate. Each feature is independent
  // of the inventory. Reusing the immutable engine state leaves saves intact.
  function feature(id, name, centre, field, feet, pose, observation) {
    const [x,y] = centre, [w,h] = field;
    return {id, name, kind: 'feature', x, y, w, h, approach: {x: feet[0], y: feet[1]},
      contact: {x, y}, pose, observation, paint: false};
  }
  const places = {
    beach: feature('shore_tussock', 'Part the tussock', [4.3,81.8], [5.6,6.2], [13.7,86.8], 'crouch',
      'The blades spring upright and scatter cold drops across my sleeve.'),
    wreck: feature('wreck_hawser', 'Tug the hawser coil', [22.6,69.4], [7.4,6], [30.4,73.8], 'crouch',
      'I lift the top turn and feel the weight of the wet rope pull it back into the coil.'),
    cabin: feature('bunk_blanket', 'Press the folded blanket', [75.6,53.3], [7.8,6.5], [86.8,78.2], 'reach',
      'The folded blanket gives under my palm, then settles back against the bunk.'),
    forest: feature('runnel_shaving', 'Float a wood shaving', [30.2,69.5], [4.6,5.4], [38.1,73.9], 'crouch',
      'The shaving turns once by the stone before the trickle carries it away.'),
    forge: feature('bellows_handle', 'Press the bellows', [19,45.1], [6.2,10.2], [9.1,67.2], 'reach',
      'The leather folds together under my hand and opens again as I ease off.'),
    slipway: feature('stack_endgrain', 'Brush the sawn end', [18,54.4], [6.2,6.2], [27.5,75.7], 'reach',
      'Loose fibres fall from the end of the board, uncovering the curved lines of the grain.'),
    crossing: feature('mast_turns', 'Test the turns around the mast', [44.1,56.5], [5.6,5.6], [54.3,79.1], 'reach',
      'The outer turn rolls a little under my thumb, then settles against the mast.'),
    harbour: feature('wharf_line', 'Lift the mooring line', [61.5,63.1], [6.2,5.2], [52.8,86.4], 'reach',
      'When I let go, the line hangs in a shallow curve between cutter and wharf.'),
    chartroom: feature('chart_margin', 'Lift the chart corner', [72.4,48.2], [4.6,4.2], [82.5,75.3], 'reach',
      'The corner curls over my finger, then falls flat against the table.'),
    landing: feature('tidal_pebble', 'Skim a pebble', [14.6,61.2], [6.4,5.4], [21.1,65], 'crouch',
      'It skips once, sending two sets of little rings back towards the shingle.')
  };
  function features(state) {
    const item = places[state.scene];
    if (!item || (state.scene === 'forge' && !state.flags.bellowsFitted)) return [];
    let observation = item.observation;
    if (state.scene === 'forge' && state.flags.forgeLit) observation = 'A squeeze of the bellows brings a stripe of orange through the coals.';
    if (state.scene === 'crossing' && state.flags.rigSecured) observation = 'Under my thumb the tightened turn barely shifts against the mast.';
    return [{...item, approach: {...item.approach}, contact: {...item.contact}, observation}];
  }
  function reaction(id, f) {
    switch (id) {
      case 'shore_tussock': return [wash('tussock-blades', [0,79,8.1,11.8], 'life-bent-grass life-feather'),
        mark('tussock-water', [3.4,82.8,4.5,4.8], 'life-grass-drops', 'pour')];
      case 'wreck_hawser': return [wash('top-turn', [18.5,64.7,7.4,6.2], 'life-loose-turn',
        '0,66 9,40 28,19 62,2 91,10 100,35 86,62 56,80 24,100 3,91')];
      case 'bunk_blanket': return [wash('bunk-fold', [65.7,48.8,14.5,7.9], 'life-fold-pressed',
        '0,39 8,6 76,0 94,14 100,48 91,78 49,98 11,88')];
      case 'runnel_shaving': return [mark('floating-shaving', [28.9,67.6,8.6,4.1], 'life-runnel', 'shaving')];
      case 'bellows_handle': return [
        wash('bellows-stroke', [18.2,33.4,12.4,23.3], 'life-bellows-stroke',
          '0,0 40,16 97,49 99,60 48,82 5,98'),
        f.forgeLit ? light('fresh-air-in-coals', [34.6,40.7,12.7,5.6], 'life-coal-blush') :
          mark('air-at-tuyere', [33.7,40,6.1,4.9], 'life-cold-puff', 'soot')
      ];
      case 'stack_endgrain': return [mark('fallen-fibres', [14.7,52,6.4,6.8], 'life-falling-dust', 'resinDust'),
        wash('brushed-wood', [15.8,52.1,5.2,3.8], 'life-brushed-grain life-feather')];
      case 'mast_turns': return [wash('wrapped-line', [41.8,54.1,4.85,5.5],
        f.rigSecured ? 'life-turned-line tight' : 'life-turned-line', '5,8 72,22 100,8 97,85 58,95 0,83')];
      case 'wharf_line': return [mark('lifted-mooring', [54.8,56.1,12.9,8.8], 'life-wharf-rope', 'lineTest')];
      case 'chart_margin': return [wash('turned-margin', [64.5,41.1,8.9,7.6], 'life-paper-lift', '0,0 39,4 100,94 24,93')];
      case 'tidal_pebble': return [mark('pebble-rings', [3.5,50.2,13.5,11.5], 'life-pebble', 'skip')];
      default: return [];
    }
  }
  function tryFeature(root, state, targetId) {
    const feature = features(state).find(entry => entry.id === targetId);
    if (!feature || !root) return null;
    render(root, state);
    root.querySelector('.life-response')?.remove();
    const beat = root.ownerDocument.createElement('div');
    beat.className = 'life-response';
    for (const part of reaction(targetId, state.flags)) beat.append(element(root.ownerDocument, part));
    root.append(beat);
    // The observation remains available to the caller in every motion mode.
    // The reduced-motion version holds a changed material detail without travel.
    beat.addEventListener('animationend', event => { if (event.target === beat) beat.remove(); });
    host.setTimeout(() => beat.remove(), 2100);
    return feature.observation;
  }

  function work(root, state, targetId) {
    if (!root || !targetId) return;
    render(root, state);
    const memory = cache.get(root);
    const flag = memory.changes.find(key => beats[key][0] === targetId);
    if (!flag) return;
    memory.changes = memory.changes.filter(key => key !== flag);
    if (root.closest('.reduced') || host.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const [, motif, ...box] = beats[flag];
    const node = element(root.ownerDocument, mark('work-' + flag, box, 'life-work', motif));
    root.querySelector('.life-work')?.remove();
    root.append(node);
    node.addEventListener('animationend', event => { if (event.target === node) node.remove(); });
    // Cleanup also survives a player enabling reduced motion during the beat.
    host.setTimeout(() => node.remove(), 1700);
  }
  host.CastawayLife = {render, work, features, tryFeature};
})(typeof window !== 'undefined' ? window : globalThis);

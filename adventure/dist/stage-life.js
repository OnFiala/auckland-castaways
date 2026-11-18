/* Physical contacts in the adventure. Small independent drawings sit on a fixed
   stage. Ambient weather and the persistent environment belong to other layers. */
(function (host) {
  'use strict';
  const cache = new WeakMap();
  const rect = ([x,y,w,h]) => `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
  function mark(id, box, css, motif) { return {id, box, css, motif}; }
  // Paths below are original small objects on transparent canvases. Coordinates
  // describe the material itself. No layer needs access to the scenery image.
  function line(c, stroke, width, coords) {
    c.beginPath(); c.moveTo(coords[0], coords[1]);
    for (let i = 2; i < coords.length; i += 6) c.bezierCurveTo(...coords.slice(i, i+6));
    c.lineWidth = width; c.strokeStyle = stroke; c.stroke();
  }
  function shape(c, fill, vertices) {
    c.beginPath(); c.moveTo(...vertices[0]);
    for (const [x,y] of vertices.slice(1)) c.lineTo(x,y);
    c.closePath(); c.fillStyle=fill; c.fill();
  }
  function oval(c, fill, x, y, w, h, tilt = 0) {
    c.beginPath(); c.ellipse(x,y,w,h,tilt,0,Math.PI*2); c.fillStyle=fill; c.fill();
  }
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { const t=clamp(x); return t*t*(3-2*t); };
  const pressure = t => t < .33 ? ease(t/.33) : 1-ease((t-.40)/.51);
  const flight = (t,start,end) => clamp((t-start)/(end-start));
  function rings(c, x,y,t,start,size) {
    const a = flight(t,start,start+.39);
    if (!a || a >= 1) return;
    c.save(); c.globalAlpha = .86*(1-a);
    for(const scale of [.62,1]) {
      c.beginPath(); c.ellipse(x,y,1+a*size*scale,.45+a*size*.20*scale,-.055,.12,5.8);
      c.strokeStyle=scale===1?'#d2dace':'#687c77'; c.lineWidth=1.25; c.stroke();
    }
    c.restore();
  }
  const painters = {
    runnel_shaving(c,t) {
      // Current starts at the hand, folds the shaving into an eddy, and lets
      // it out along the downstream tangent. The second wake follows the first.
      const a=flight(t,.06,.96), turn=Math.sin(a*Math.PI*2);
      const x=84-67*a+2*turn, y=47-4*a+5*Math.sin(a*Math.PI);
      // Loose shavings stay at the bank; only the one lifted away travels.
      shape(c,'#977957',[[84,48],[86,44],[96,42],[93,47]]);
      line(c,'#c3a67e',1.3,[85,50,87,47,91,45,95,46]);
      rings(c,84,47,t,.04,10); rings(c,57,50,t,.42,10);
      c.save(); c.globalAlpha=ease(t/.08)*(1-ease((a-.77)/.23)); c.translate(x,y);
      c.rotate(.2+ease(a/.78)*Math.PI*2+turn*.24);
      shape(c,'#796148',[[-5,1],[-2,-3],[7,-3],[5,0],[-3,3]]);
      line(c,'#d0b180',1.35,[-4,0,-1,-2,3,-3,6,-3]);
      c.restore();
    },
    chart_margin(c,t,p) {
      const tipY=60-23*p;
      shape(c,'rgba(53,46,35,.25)',[[31,48],[69,43],[78,63+p*4],[45,67]]);
      shape(c,'#baad89',[[31,47],[67,40],[78-3*p,tipY],[44,64]]);
      line(c,'#d6c8a5',1.5,[31,47,45,50,59,49-p*6,78-3*p,tipY]);
      if(p>.07)shape(c,'#dbceac',[[46,63],[62,51],[78-3*p,tipY],[67,53+p*1.5]]);
      line(c,'#918870',1,[39,51,46,55,51,48,58,50-p*4]);
    },
    tidal_pebble(c,t) {
      const a=flight(t,.08,.70), first=a<.57, hop=first?a/.57:(a-.57)/.43;
      const x=86-a*67, y=75-60*a-(first?32:14)*Math.sin(Math.PI*hop);
      oval(c,'#66665c',87,75.5,3.2,1.55,-.16);
      oval(c,'#89887a',91,75,2.2,1,.22);
      if(t>0 && a<1){
        c.save();c.globalAlpha=ease(t/.075);
        oval(c,'#535c58',x,y,4.1*(1-a*.55),2.1*(1-a*.5),-.18+.75*a);
        oval(c,'#969b85',x-1,y-.75,2.5*(1-a*.55),.7,-.1);
        c.restore();
      }
      rings(c,48,41,t,.43,14); rings(c,19,15,t,.69,12);
    },
    camp_wind_strip(c,t,p) {
      // A short trial strip knotted onto a twig shows the wind close to ground.
      line(c,'#66513b',3.5,[32,87,34,65,34,53,40,28]);
      shape(c,'#aea186',[[36,41],[39,38],[46+p*19,48-p*8],[59+p*24,53-p*11],[52+p*33,58-p*10],[43+p*14,53-p*6]]);
      line(c,'#746c59',1,[38,40,43,48-p*3,46+p*11,50-p*9,55+p*26,56-p*10]);
      oval(c,'#90816a',39,41,3.3,2,-.35);
    },
    charcoal_break(c,t,p) {
      const a=flight(t,.28,.92);
      shape(c,'#363630',[[28,52],[31,41],[48,33],[56,40],[51,52],[38,60]]);
      shape(c,'#656055',[[31,42],[47,34],[50,37],[39,47]]);
      shape(c,'#45443b',[[47,53],[54,41],[63,40],[67,48],[59,56]]);
      line(c,'#756e61',.8+p*.7,[51,53,56,50,58+p*1.3,47,63,46]);
      if(a>0&&a<1) {
        c.save();c.globalAlpha=1-a*a;
        for(let i=0;i<10;i++)oval(c,i%3?'#34342f':'#797463',48+i%4+(i-4)*2*a,48+(i%3)*2-8*a+33*a*a,1+(i%3)*.35,.8+i%2,i*.7);
        c.restore();
      }
    },
    return_thread(c,t,p) {
      // Stitches define the anchored end; the free tail follows the hand.
      shape(c,'#85745a',[[18,56],[48,42],[59,55],[29,69]]);
      for(let i=0;i<4;i++)line(c,'#c2ad83',1.8,[25+i*5,59-i*2,27+i*5,59-i*2,27+i*5,56-i*2,30+i*5,55-i*2]);
      line(c,'#514b3b',2.05,[45,53,52,83-40*p,68,68-25*p,75+9*p,48-7*p]);
      line(c,'#c7b896',1.1,[45,53,52,83-40*p,68,68-25*p,75+9*p,48-7*p]);
    }
  };
  function paintMaterial(ctx,id,phase=0,flags={}) {
    if (!ctx || !painters[id]) return false;
    const t=clamp(phase);
    ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round';
    painters[id](ctx,t,pressure(t),flags);
    ctx.restore();
    return true;
  }

  const ink = {
    kettleSteam:'<g class="life-kettle-steam"><path pathLength="100" d="M49 98C43 84 71 69 57 53S35 26 58 3"/><path pathLength="100" d="M47 98C63 84 35 70 42 53S64 33 46 16"/></g>',
    sparks: '<g class="life-sparks"><path d="M49 90l-5-8m17 5 5-11m-36 6-6-4m29-7 2-8"/><path d="M55 93l7-6m-13-3-4-12m-8 6-8-8"/></g>',
    overboard: '<g class="life-splash"><path d="M3 64Q32 8 80 33Q92 42 98 68"/><path d="M6 65Q44 14 81 37m8 7 4 7m3 6 2 7"/></g>',
    pour: '<g class="life-pour"><path d="M13 10Q46 15 69 86m-48-72Q50 26 65 80"/><ellipse cx="64" cy="89" rx="10" ry="2"/></g>',
    chips: '<g class="life-chips"><path d="m36 61 13-22-7 24zM58 54l20-19-15 22zM31 50 24 37l10 11z"/></g>',
    twine: '<path class="life-thread" pathLength="100" d="M4 67Q31 28 45 50T74 61L96 32"/>',
    soot: '<g class="life-soot"><ellipse cx="35" cy="65" rx="12" ry="6"/><ellipse cx="50" cy="55" rx="16" ry="9"/><ellipse cx="64" cy="63" rx="9" ry="5"/></g>',
    inkRoute: '<path class="life-course" pathLength="100" d="M3 79Q13 83 20 69T40 65L57 49 72 48 89 19"/><path class="life-chart-cross" d="m86 14 6 9m-8-1 10-7"/>',
    fibres: '<g class="life-fibres"><path d="M53 45q-13-11-27-12m24 15-28-6m32 6q-7-14-13-17"/></g>'
  };
  function draw(motif) {
    if (motif?.startsWith('asset:')) {
      const file=motif.slice(6);
      return `<img class="life-inset" alt="" draggable="false" src="${file}">`;
    }
    if (motif?.startsWith('prop-')) {
      const prop = host.AdventureArt?.props[motif.slice(5)];
      if (!prop) return '';
      return `<svg viewBox="${prop.box.join(' ')}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><svg x="${prop.box[0]}" y="${prop.box[1]}" width="${prop.box[2]}" height="${prop.box[3]}" viewBox="${prop.box.join(' ')}" overflow="hidden" style="width:${prop.box[2]}px;height:${prop.box[3]}px;overflow:hidden"><image href="${prop.file}" width="${prop.width}" height="${prop.height}"/></svg></svg>`;
    }
    return motif ? '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + ink[motif] + '</svg>' : '';
  }

  const beats = {
    woodCut: ['driftwood', 'chips', 23.1, 69.7, 5.4, 5.8],
    canvasRecovered: ['sail', 'fibres', 66.5, 31.0, 5.2, 6.2],
    crateOpen: ['crate', 'soot', 68.2, 53.1, 6.2, 5.4],
    shelterBuilt: ['shelter', 'twine', 62.3, 47.0, 5.5, 6.6],
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
    drillFailed: ['testBlock', 'chips', 82.3, 36.7, 5.8, 5.8],
    nailsForged: ['anvil', 'sparks', 62.7, 34, 5.9, 8.4],
    hullPlanked: ['boatFrame', 'chips', 51.2, 52.4, 5, 4.8],
    hullFastened: ['boatFrame', 'chips', 52, 53.1, 3.4, 4.2],
    sailRigged: ['boatMast', 'twine', 63.8, 48.7, 4.9, 4.5],
    sailMended: ['tornSail', 'twine', 74, 8.0, 6.5, 7],
    rescueRoute: ['chartTable', 'inkRoute', 40.1, 43.8, 17.4, 5.1],
    rescueSupplied: ['rescueCutter', 'fibres', 37, 53.4, 6, 4.6],
    rescueRigged: ['rescueCutter', 'twine', 38.2, 45.8, 7.6, 5.2],
    landingMarked: ['signalPost', 'sparks', 76.75, 34.7, 2.1, 2.9],
    suppliesShared: ['campTable', 'fibres', 37, 43.6, 5.4, 6.0],
    menRescued: ['rescueBoat', 'overboard', 51.6, 53.7, 8, 3.6]
  };


  function feature(id, name, centre, field, feet, pose, observation) {
    const [x,y] = centre, [w,h] = field;
    return {id, name, kind: 'feature', x, y, w, h, approach: {x: feet[0], y: feet[1]},
      contact: {x, y}, pose, observation, paint: false};
  }
  const places = {
    beach: feature('shore_tussock', 'Lift the stranded kelp', [18.5,85.1], [5.6,4.0], [28.16,89.77], 'crouch',
      'The kelp lifts with a skin of cold water. I let it settle back into the wet sand.'),
    camp: feature('camp_wind_strip', 'Test the breeze at the peg', [14.2,74.6], [4.8,5.8], [23.78,79.23], 'crouch',
      'I free the strip from the wet peg. Its loose end streams into the clearing.'),
    charcoal: feature('charcoal_break', 'Rub the edge of the charcoal', [30.9,72.4], [5.4,4.6], [39.01,76.32], 'crouch',
      'A black streak comes off on my thumb. Dry grit falls from the fractured edge.'),
    salvage: feature('salvage_splinter', 'Ease up a splinter', [45.5,66], [3.6,3.4], [54.81,88.65], 'reach',
      'The long fibres lift together. I ease them down before they tear from the plank.'),
    return_camp: feature('return_thread', 'Draw the thread taut', [67,52.5], [5.4,5.0], [77.82,81.21], 'reach',
      'I take up the slack in the tail of the thread. Each stitch holds.'),
    wreck: feature('wreck_hawser', 'Pull the line through the block', [26.1,72.4], [7.4,6], [34.15,76.72], 'crouch',
      'The wooden sheave turns. I ease the line back until the loose end lies on the rock.'),
    cabin: feature('bunk_blanket', 'Press the folded blanket', [75.6,53.3], [7.8,6.5], [86.18,79.02], 'reach',
      'The folded blanket gives under my palm, then settles back against the bunk.'),
    forest: feature('runnel_shaving', 'Float a wood shaving', [29.95,67.5], [4.2,4.4], [37.52,71.16], 'crouch',
      'The shaving turns once by the stone before the trickle carries it away.'),
    forge: feature('bellows_handle', 'Work the forge bellows', [17.5,42.4], [6.2,9.0], [8.49,64.31], 'reach',
      'The board sinks under my palm. A little grey dust lifts from the cold hearth.'),
    slipway: feature('stack_endgrain', 'Feel the sawn board', [4.2,58.2], [5.2,6.2], [13.85,81.67], 'reach',
      'A raised fibre catches my thumb. It bends along the grain of the sawn board.'),
    crossing: feature('mast_turns', 'Test the turns around the mast', [41.9,59.8], [5.2,5.2], [52.11,84.63], 'reach',
      'The outer turn rolls a little under my thumb, then settles against the mast.'),
    harbour: feature('wharf_line', 'Lift a bight of the mooring line', [61.5,64.3], [5.9,3.8], [52.58,87.96], 'reach',
      'The bight rises under my palm. When I let go it settles against the taut line.'),
    chartroom: feature('chart_margin', 'Lift the chart corner', [72.4,48.2], [4.6,4.2], [82.49,74.96], 'reach',
      'The corner curls over my finger, then falls flat against the table.'),
    landing: feature('tidal_pebble', 'Skim a pebble', [14.6,61.2], [6.4,5.4], [20.86,64.81], 'crouch',
      'It skips once, sending two sets of little rings back towards the shingle.')
  };
  function features(state) {
    const item = places[state.scene];
    if (!item || (state.scene === 'forge' && !state.flags.bellowsFitted)) return [];
    let observation = item.observation;
    if (state.scene === 'forge' && state.flags.forgeLit) observation = 'A squeeze of the bellows brings a stripe of orange through the coals.';
    if (state.scene === 'crossing' && state.flags.rigSecured) observation = 'Under my thumb the tightened turn barely shifts against the mast.';
    const materialBox = boxFor(item);
    const feature = {...item, materialBox, approach: {...item.approach}, contact: {...item.contact}, observation};
    if (item.id === 'wreck_hawser') {
      // The player may choose the cleat, hanging line, wooden shell or free end.
      // All four belong to this painted strip. The hand still goes to its lower bight.
      const [left, top, width, height] = materialBox;
      Object.assign(feature, {x: left + width/2, y: top + height/2, w: width, h: height});
    }
    return [feature];
  }

  // [width, height, hand x, hand y]. The hand lies inside the material; the
  // material's base, ends or peg may be outside the small clickable field.
  const mount = {
    runnel_shaving:[10.1,3.8,.84,.47],
    chart_margin:[5.1,4.5,.66,.54], tidal_pebble:[14.3,25.5,.86,.75],
    camp_wind_strip:[7.6,9.7,.48,.49], charcoal_break:[5.5,5.9,.49,.45],
    return_thread:[5.7,5.2,.57,.55]
  };
  // Fixed crops register the native object silhouettes to the same stage as the actors.
  // Front strips contain nine frames, resting at zero. The trestle remains planted.
  const tactile = {
    shore_tussock: {file:'wet-wrack.webp', crop:[235,764,140,76], camera:[1672,941]},
    bunk_blanket: {file:'blanket-fold.webp', crop:[1182,464,140,66], camera:[1664,936]},
    stack_endgrain: {file:'sawn-grain.webp', crop:[32,515,91,81], camera:[1672,941]},
    salvage_splinter: {file:'splinter.webp', crop:[720,595,90,87], camera:[1672,941]},
    mast_turns: {file:'mast-round.webp', crop:[664,538,76,49], camera:[1672,941]},
    wharf_line: {file:'wharf-fall.webp', crop:[864,469,231,141], camera:[1600,900]},
    wreck_hawser: {file:'reeved-block.webp', crop:[303,537,236,157], camera:[1672,941]},
    bellows_handle: {file:'bellows-stroke.webp', support:'bare-trestle.webp', crop:[195,282,381,271], camera:[1664,936]}
  };
  function boxFor(item) {
    const plate=tactile[item.id];
    if(plate) return plate.crop.map((v,i)=>100*v/plate.camera[i%2]);
    const [w,h,u,v]=mount[item.id];
    return [item.x-u*w,item.y-v*h,w,h];
  }

  function details(s) {
    const f=s.flags;
    switch(s.scene) {
      case 'cabin': return [
        f.warmthReady && mark('warming-water',[28.7,31.6,3.6,10.8],'life-kettle','kettleSteam')
      ];
      case 'forge': return [
        f.forgeFueled && !f.forgeLit && mark('charcoal-bed',[36.7,42.05,7.15,3.35],'life-coals','asset:assets/tactile/coal-charge.webp')
      ];
      case 'slipway': return [
        f.hullPlanked && !f.sailRigged && mark('plank-on-stocks',[44.856459,48.352816,21.232057,13.815090],'life-fitted-board','asset:assets/tidepaint/details/fitted-strake.webp'),
        f.boatSealed && mark('caulked-seam',[44.856459,48.352816,21.232057,13.815090],'life-sealed-seam','asset:assets/tactile/paid-seam.webp')
      ];
      case 'crossing': return [f.rigSecured && mark('secured-shroud',[29.365,47.715,2.632,3.613],'life-lashing','asset:assets/tactile/shroud-seizing.webp')];
      case 'harbour': return [
        f.rescueSupplied && mark('stores-aboard',[33.4,48.8,3.8,5.8],'life-cargo','prop-provisions'),
        f.rescueRigged && mark('spare-canvas-aboard',[28.2,52,4.8,3.2],'life-cargo','prop-spareSail')
      ];
      case 'chartroom': return [f.rescueRoute && mark('pencilled-course',[40.1,43.8,17.4,5.1],'life-map','inkRoute')];
      case 'landing': return [f.boatMoored && mark('mooring-line',[53.57,29.75,25.238,19.027],'life-mooring','asset:assets/tactile/landing-warp.webp')];
      default: return [];
    }
  }
  function element(doc,part) {
    const node=doc.createElement('span');
    node.className=part.css; node.dataset.life=part.id;
    node.style.cssText=rect(part.box);
    node.innerHTML=draw(part.motif);
    return node;
  }

  function stationary(root) {
    return Boolean(root.closest?.('.reduced') || host.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }
  function covered(root) {
    return root.ownerDocument.hidden || root.closest?.('.inactive') ||
      root.ownerDocument.querySelector?.('dialog[open], #completion:not([hidden])');
  }
  function paintFrame(record,t) {
    const {ctx,canvas,state,feature}=record;
    if(record.strip){
      const travel = feature.id==='mast_turns' && state.flags.rigSecured ? 2 : 8;
      const frame = Math.round(pressure(t)*travel);
      if(record.frame!==frame) {
        record.strip.style.left = (-100*frame)+'%';
        record.frame = frame;
      }
      return;
    }
    if(!ctx || !feature) return;
    ctx.setTransform(canvas.width/100,0,0,canvas.height/100,0,0);
    ctx.clearRect(0,0,100,100);
    paintMaterial(ctx,feature.id,t,state.flags);
  }
  function mountFeature(root,layer,state,feature) {
    const record={state,feature,layer};
    if(!feature) return record;
    const plate=tactile[feature.id];
    if (plate) {
      const doc=root.ownerDocument, viewport=doc.createElement('span');
      viewport.className='life-tactile'; viewport.dataset.life=feature.id;
      viewport.style.cssText=rect(feature.materialBox);
      const add=(file,cl)=>{
        const image=doc.createElement('img');
        image.className=cl; image.alt=''; image.draggable=false;
        image.src='assets/tactile/'+file; viewport.append(image);
        return image;
      };
      if(plate.support) add(plate.support,'life-support');
      record.strip=add(plate.file,'life-strip');
      record.surface=viewport;
      layer.append(viewport); paintFrame(record,0);
      return record;
    }
    const canvas=root.ownerDocument.createElement('canvas');
    canvas.className='life-material'; canvas.dataset.life=feature.id;
    canvas.style.cssText=rect(feature.materialBox);
    // Rasterize at the largest game's stage width with a two-device-pixel
    // budget so small cord fibres stay sharp at desktop and phone scales.
    canvas.width=Math.ceil(2720*feature.materialBox[2]/100);
    canvas.height=Math.ceil(1530*feature.materialBox[3]/100);
    layer.append(canvas); record.surface=canvas; record.canvas=canvas; record.ctx=canvas.getContext?.('2d');
    paintFrame(record,0);
    return record;
  }
  function stopGesture(record,restore=true) {
    if(!record) return;
    if(record.raf!=null) host.cancelAnimationFrame?.(record.raf);
    if(record.timer!=null) host.clearTimeout?.(record.timer);
    record.raf=null; record.timer=null; record.gesture=null;
    if(restore) paintFrame(record,0);
  }

  function render(root,state) {
    if(!root) return;
    let record=cache.get(root);
    if(record?.state===state) return;
    const previous=record?.state;
    const feature=features(state)[0];
    if(previous?.scene!==state.scene || feature?.id!==record?.feature?.id) {
      stopGesture(record,false);
      const layer=root.ownerDocument.createElement('div');
      layer.className='life-materials';
      root.replaceChildren(layer); root.setAttribute('aria-hidden','true');
      record=mountFeature(root,layer,state,feature); cache.set(root,record);
    }
    record.state=state;
    if(feature && !record.gesture) paintFrame(record,0);
    const existing=new Map(Array.from(record.layer.children).filter(n=>n!==record.surface).map(n=>[n.dataset.life,n]));
    for(const part of details(state).filter(Boolean)) {
      const node=existing.get(part.id);
      if(!node) record.layer.append(element(root.ownerDocument,part));
      else {node.className=part.css; existing.delete(part.id);}
    }
    for(const stale of existing.values()) stale.remove();
    record.changes=previous?.scene===state.scene ?
      Object.keys(beats).filter(key=>state.flags[key]&&!previous.flags[key]):[];
  }
  function tryFeature(root,state,targetId) {
    const feature=features(state).find(f=>f.id===targetId);
    if(!feature||!root) return null;
    render(root,state);
    const record=cache.get(root);
    stopGesture(record);
    if((!record.ctx && !record.strip) || covered(root)) return feature.observation;
    const gesture={};record.gesture=gesture;
    function hold() {
      // A single changed pose conveys the same physical result without travel.
      paintFrame(record,.43);
      record.timer=host.setTimeout(()=>{if(record.gesture===gesture)stopGesture(record);},850);
    }
    if(stationary(root) || !host.requestAnimationFrame) hold();
    else {
      let start;
      const frame=now=>{
        if(record.gesture!==gesture) return;
        if(covered(root)) {stopGesture(record);return;}
        if(stationary(root)) {hold();return;}
        start??=now;
        const t=clamp((now-start)/1450);
        if(t===1) {stopGesture(record);return;}
        paintFrame(record,t); record.raf=host.requestAnimationFrame(frame);
      };
      record.raf=host.requestAnimationFrame(frame);
    }
    if(targetId==='bellows_handle'){
      const response=state.flags.forgeLit
        ? mark('fresh-air-in-coals',[36.178,35.47,10.637,11.538],'life-coal-blush','asset:assets/tactile/stoked-coals.webp')
        : mark('dust-at-tuyere',[37.35,40.1,3.3,4.3],'life-cold-air','soot');
      flash(root,response,1200);
    }
    return feature.observation;
  }
  function flash(root,part,ms) {
    const record=cache.get(root);
    if(record.flash) {host.clearTimeout?.(record.flashTimer); record.flash.remove();}
    const node=element(root.ownerDocument,part);
    record.flash=node;root.append(node);
    record.flashTimer=host.setTimeout(()=>{
      node.remove();
      if(record.flash===node) record.flash=null;
    },ms);
  }
  function work(root,state,targetId) {
    if(!root || !targetId) return;
    render(root,state);
    const record=cache.get(root);
    const flag=record.changes.find(key=>beats[key][0]===targetId);
    if(!flag) return;
    record.changes=record.changes.filter(key=>key!==flag);
    if(stationary(root)||covered(root)) return;
    const [,motif,...box]=beats[flag];
    flash(root,mark('work-'+flag,box,'life-work',motif),1250);
  }
  host.CastawayLife={render,work,features,tryFeature,paintMaterial};
})(typeof window!=='undefined'?window:globalThis);

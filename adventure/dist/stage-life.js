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
  function dew(c, x,y, t, start, dx, dy) {
    const a = flight(t,start,start+.42);
    if (a >= 1) return;
    c.save(); c.globalAlpha = .78*(1-a*a);
    oval(c,'#b7d2cc',x+a*dx,y+dy*a*a,1.1,1.75+a*2,-.17);
    oval(c,'#e1ece0',x+a*dx-.3,y+dy*a*a-.8,.45,.65);
    c.restore();
  }
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
  // A laid rope is darkest under its belly. Short oblique marks follow the
  // curve's tangent; both knots stay pinned while the centre rises or sags.
  function cord(c,ax,ay,bx,by,cx,cy,width,tone='#94764f') {
    const path=[ax,ay,ax+(bx-ax)*2/3,ay+(by-ay)*2/3,cx+(bx-cx)*2/3,cy+(by-cy)*2/3,cx,cy];
    line(c,'#443b32',width+1.8,path); line(c,tone,width,path);
    for(let i=1;i<24;i++){
      const t=i/24,u=1-t, x=u*u*ax+2*u*t*bx+t*t*cx, y=u*u*ay+2*u*t*by+t*t*cy;
      const dx=2*u*(bx-ax)+2*t*(cx-bx), dy=2*u*(by-ay)+2*t*(cy-by), len=Math.hypot(dx,dy)||1;
      const a=(dx*.46-dy*.37)/len*width, b=(dy*.46+dx*.37)/len*width;
      line(c,'#c0a783',width*.24,[x-a*.52,y-b*.52,x,y,x,y,x+a*.52,y+b*.52]);
    }
  }
  const painters = {
    shore_tussock(c,t,p) {
      // The bases and lower control points never move; the distal blades part.
      for(let i=0;i<19;i++){
        const split=(i%2 ? 1 : -1), root=44+(i*13%17), tip=14+(i*17%67);
        const top=13+(i*11%36), shift=split*p*(10+i%9);
        const x=tip+shift, y=top+5*p;
        const col=['#635036','#76623d','#8c784c','#9b8560','#aa9669'][i%5];
        c.beginPath(); c.moveTo(root,92);
        c.bezierCurveTo(root-2,74,tip+7+shift*.53,top+8,x,y);
        c.bezierCurveTo(tip+2+shift*.53,top+10,root+3,73,root+1.5,92);
        c.fillStyle=col;c.fill();
        if(i===4 || i===11 || i===18) dew(c,x,y,t,.13+i*.008,split*13,48);
      }
    },
    wreck_hawser(c,t,p) {
      // The lower round bears the weight. Only the loose bight is lifted.
      cord(c,10,66,50,94,89,58,4.2,'#806c50');
      cord(c,13,63,51,77,86,54,4.4,'#978062');
      cord(c,12,61,48,48-52*p,86,54,5,'#9a8261');
      if(t>.32) dew(c,48,53-p*22,t,.35,2,33);
    },
    bunk_blanket(c,t,p) {
      const sag=8*p;
      shape(c,'#333d43',[[14,43],[66,26],[90,44],[88,66],[32,79],[11,66]]);
      shape(c,'#515866',[[12,42],[66,27],[91,44],[65,55+sag*.3],[47,59+sag],[28,63],[12,56]]);
      for(let i=0;i<4;i++) {
        line(c,i%2?'#6d7380':'#424851',1.5,[16,45+i*4,35,56+i*3,45,59+i*2+sag,61,52+i*3,69,50+i*3,80,49+i*2,88,45+i*2]);
      }
      line(c,'#93634e',2.3,[32,42,37,48,40,54+sag,45,58+sag]);
      for(let i=0;i<16;i++){
        const x=13+i*1.2,y=62+i*.39;
        line(c,'#656a76',1,[x,y,x+2,y+2,x-1,y+5+p,x+1,y+8+p]);
      }
    },
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
    bellows_handle(c,t,p) {
      const y=42+15*p;
      shape(c,'#4c382a',[[19,y],[71,55],[89,63],[89,69],[66,66],[19,y+6]]);
      line(c,'#a28257',2,[18,y,34,y+1,59,53,78,59]);
      for(let i=0;i<3;i++){
        const top=y+5+i*(6-4*p);
        line(c,i%2?'#80624a':'#593f32',3.2,[22,top,31,top+13,58,66+i*.55,83,65+i*.35]);
      }
      oval(c,'#a18d66',84,65,2,1.7);
    },
    stack_endgrain(c,t,p) {
      // A wafer curls off the end. The board remains completely stationary.
      for(let i=0;i<5;i++){
        const y=41+i*4, x=28+i*3;
        line(c,i%2?'#c19a65':'#96764e',1.6,[x,y,x+9,y-3,x+19,y-6-p*10,x+24,y-3-p*10]);
      }
      for(let i=0;i<6;i++){
        const a=flight(t,.23+i*.043,.75+i*.035);
        if(!a||a===1)continue;
        c.save(); c.globalAlpha=1-a*a;
        shape(c,'#c4a16a',[[49+i*2+a*8,44+i+a*a*34],[54+i*2+a*9,42+i+a*a*34],[52+i*2+a*10,46+i+a*a*34]]);
        c.restore();
      }
    },
    mast_turns(c,t,p,f) {
      for(let i=0;i<3;i++)cord(c,31,35+i*9,52,41+i*9,70,33+i*9,3.6);
      cord(c,32,60,54,68-p*(f.rigSecured?6:28),72,52,4,'#a68b65');
    },
    wharf_line(c,t,p) {
      cord(c,4,10,53,117-52*p,96,65,2.4,'#a58c65');
      if(t>.35)dew(c,51,77-p*26,t,.42,1,20);
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
    salvage_splinter(c,t,p) {
      // The heel remains buried in the oblique plank; a handful of grain
      // fibres peel away together as the thumb lifts their fine tips.
      for(let i=0;i<6;i++){
        const x=27+i*1.5,y=86-i*.3;
        const lean=p*(6+i*2.8);
        line(c,i%2?'#96816d':'#c1aa89',1.45,[x,y,x+5,70,41+i+lean*.4,48,53+i*1.8+lean,22+i]);
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
    seamDrop:'<g class="life-seam-drop"><path d="M49 1q-5 1.3-3.6 1.8 3.6.75 7-.1Q53 2.1 49 1z"/><path d="M49 1q-3.8 1.2-3 1.55 3 .62 6-.1Q52 2 49 1z"/></g>',
    kettleSteam:'<g class="life-kettle-steam"><path pathLength="100" d="M49 98C43 84 71 69 57 53S35 26 58 3"/><path pathLength="100" d="M47 98C63 84 35 70 42 53S64 33 46 16"/></g>',
    lashing: '<g class="life-hitch"><path d="M17 22q32 19 67 3M17 37q33 17 64 2M16 52q31 16 64 1m-46 7q-5 15-19 21"/></g>',
    sparks: '<g class="life-sparks"><path d="M49 90l-5-8m17 5 5-11m-36 6-6-4m29-7 2-8"/><path d="M55 93l7-6m-13-3-4-12m-8 6-8-8"/></g>',
    coal: '<g class="life-fuel"><path d="m10 83 4-13 8-5 5 14-4 8zm27-3 1-19 7-5 4 15-6 8zm29 1-4-13 7-8 7 8-4 11z"/></g><g class="life-hot"><path d="m16 76 6 2m17-8 4-8m23 8 6-4m10 18 5-8"/></g>',
    rope: '<path class="life-rope-shadow" d="M2 94Q53 85 96 3"/><path class="life-rope" d="M2 94Q53 85 96 3"/>',
    overboard: '<g class="life-splash"><path d="M3 64Q32 8 80 33Q92 42 98 68"/><path d="M6 65Q44 14 81 37m8 7 4 7m3 6 2 7"/></g>',
    pour: '<g class="life-pour"><path d="M13 10Q46 15 69 86m-48-72Q50 26 65 80"/><ellipse cx="64" cy="89" rx="10" ry="2"/></g>',
    chips: '<g class="life-chips"><path d="m36 61 13-22-7 24zM58 54l20-19-15 22zM31 50 24 37l10 11z"/></g>',
    twine: '<path class="life-thread" pathLength="100" d="M4 67Q31 28 45 50T74 61L96 32"/>',
    soot: '<g class="life-soot"><ellipse cx="35" cy="65" rx="12" ry="6"/><ellipse cx="50" cy="55" rx="16" ry="9"/><ellipse cx="64" cy="63" rx="9" ry="5"/></g>',
    inkRoute: '<path class="life-course" pathLength="100" d="M3 79Q13 83 20 69T40 65L57 49 72 48 89 19"/><path class="life-chart-cross" d="m86 14 6 9m-8-1 10-7"/>',
    seam: '<path class="life-caulk" pathLength="100" d="M4 53Q42 63 68 49T97 28"/>',
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

  const beats = {
    woodCut: ['driftwood', 'chips', 22.2, 65.2, 6.0, 7.8],
    canvasRecovered: ['sail', 'fibres', 66.5, 31.0, 5.2, 6.2],
    crateOpen: ['crate', 'soot', 65.7, 50.1, 8.5, 7.1],
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
    hullPlanked: ['boatFrame', 'chips', 55.3, 47.3, 7, 5.5],
    hullFastened: ['boatFrame', 'chips', 58.7, 47.5, 4.1, 4.8],
    boatSealed: ['seams', 'seam', 53.8, 52.6, 17.5, 4.7],
    sailRigged: ['boatMast', 'twine', 62.8, 41.1, 6.7, 5],
    rigSecured: ['rigging', 'twine', 25.4, 50.6, 5.1, 9.4],
    boatDry: ['bilge', 'overboard', 76.7, 52.5, 11.8, 8.9],
    sailMended: ['tornSail', 'twine', 74, 8.0, 6.5, 7],
    rescueRoute: ['chartTable', 'inkRoute', 40.1, 43.8, 17.4, 5.1],
    rescueSupplied: ['rescueCutter', 'fibres', 37, 53.4, 6, 4.6],
    rescueRigged: ['rescueCutter', 'twine', 38.2, 45.8, 7.6, 5.2],
    boatMoored: ['rescueBoat', 'twine', 73.1, 34.6, 4.1, 6.7],
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
    beach: feature('shore_tussock', 'Part the tussock', [4.3,81.8], [5.6,6.2], [13.7,86.8], 'crouch',
      'The blades spring upright and scatter cold drops across my sleeve.'),
    camp: feature('camp_wind_strip', 'Test the breeze at the peg', [14.2,74.6], [4.8,5.8], [23.8,80], 'crouch',
      'I free the strip from the wet peg. Its loose end streams into the clearing.'),
    charcoal: feature('charcoal_break', 'Rub the edge of the charcoal', [30.9,72.4], [5.4,4.6], [39,77], 'crouch',
      'A black streak comes off on my thumb. Dry grit falls from the fractured edge.'),
    salvage: feature('salvage_splinter', 'Ease up a splinter', [53.7,60.5], [5.2,6.9], [62.7,80.5], 'reach',
      'The long fibres lift together. I ease them down before they tear from the plank.'),
    return_camp: feature('return_thread', 'Draw the thread taut', [67,52.5], [5.4,5.0], [77.8,81.5], 'reach',
      'I take up the slack in the tail of the thread. Each stitch holds.'),
    wreck: feature('wreck_hawser', 'Tug the hawser coil', [22.6,69.4], [7.4,6], [30.4,73.8], 'crouch',
      'I lift the top turn and feel the weight of the wet rope pull it back into the coil.'),
    cabin: feature('bunk_blanket', 'Press the folded blanket', [75.6,53.3], [7.8,6.5], [86.8,78.2], 'reach',
      'The folded blanket gives under my palm, then settles back against the bunk.'),
    forest: feature('runnel_shaving', 'Float a wood shaving', [29.95,67.5], [4.2,4.4], [37.6,71.8], 'crouch',
      'The shaving turns once by the stone before the trickle carries it away.'),
    forge: feature('bellows_handle', 'Press the bellows', [17.5,42.4], [6.2,9.0], [8.0,63.6], 'reach',
      'The handle sinks under my hand. A little grey dust lifts from the cold hearth.'),
    slipway: feature('stack_endgrain', 'Brush the sawn end', [18,54.4], [6.2,6.2], [27.5,75.7], 'reach',
      'Loose fibres fall from the end of the board, uncovering the curved lines of the grain.'),
    crossing: feature('mast_turns', 'Test the turns around the mast', [44.1,56.5], [5.6,5.6], [54.3,79.1], 'reach',
      'The outer turn rolls a little under my thumb, then settles against the mast.'),
    harbour: feature('wharf_line', 'Lift a bight of the mooring line', [61.5,64.3], [5.9,3.8], [52.6,88.3], 'reach',
      'The bight rises under my palm. When I let go it settles against the taut line.'),
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
    return [{...item, materialBox: boxFor(item), approach: {...item.approach}, contact: {...item.contact}, observation}];
  }

  // [width, height, hand x, hand y]. The hand lies inside the material; the
  // material's base, ends or peg may be outside the small clickable field.
  const mount = {
    shore_tussock:[5.7,6.1,.55,.43], wreck_hawser:[7,6.7,.48,.51],
    bunk_blanket:[5.4,4.4,.48,.52], runnel_shaving:[10.1,3.8,.84,.47],
    bellows_handle:[18.5,12.8,.23,.47], stack_endgrain:[5.8,8.3,.48,.48],
    mast_turns:[10.1,6.5,.50,.55], wharf_line:[14.12,14.1,.512,.77],
    chart_margin:[5.1,4.5,.66,.54], tidal_pebble:[14.3,25.5,.86,.75],
    camp_wind_strip:[7.6,9.7,.48,.49], charcoal_break:[5.5,5.9,.49,.45],
    salvage_splinter:[5.6,10.3,.58,.28], return_thread:[5.7,5.2,.57,.55]
  };
  function boxFor(item) {
    const [w,h,u,v]=mount[item.id];
    return [item.x-u*w,item.y-v*h,w,h];
  }

  function details(s) {
    const f=s.flags;
    switch(s.scene) {
      case 'cabin': return [
        !f.roofSealed && mark('leaking-seam',[54.2,18.4,2.0,47.8],'life-roof-drop','seamDrop'),
        f.warmthReady && mark('warming-water',[28.7,31.6,3.6,10.8],'life-kettle','kettleSteam')
      ];
      case 'forge': return [
        f.forgeFueled && mark('charcoal-bed',[35.5,40.8,11.5,5.2],f.forgeLit?'life-coals burning':'life-coals','coal')
      ];
      case 'slipway': return [
        f.hullPlanked && !f.sailRigged && mark('plank-on-stocks',[46.8,46.5,15.3,5.5],'life-fitted-board','board'),
        f.boatSealed && mark('caulked-seam',[66.8,50.7,12.9,5.3],'life-sealed-seam','seam')
      ];
      case 'crossing': return [f.rigSecured && mark('secured-shroud',[24.7,55.5,2.4,3.6],'life-lashing','lashing')];
      case 'harbour': return [
        f.rescueSupplied && mark('stores-aboard',[33.4,48.8,3.8,5.8],'life-cargo','prop-provisions'),
        f.rescueRigged && mark('spare-canvas-aboard',[28.2,52,4.8,3.2],'life-cargo','prop-spareSail')
      ];
      case 'chartroom': return [f.rescueRoute && mark('pencilled-course',[40.1,43.8,17.4,5.1],'life-map','inkRoute')];
      case 'landing': return [f.boatMoored && mark('mooring-line',[53.7,39.1,22.1,7.3],'life-mooring','rope')];
      default: return [];
    }
  }
  ink.board='<path fill="#715238" d="M1 33Q50 60 98 16L97 35Q52 79 2 55Z"/><path fill="none" stroke="#ac8c60" stroke-width="2.5" d="M2 37Q51 62 97 20m-79 28q32 10 67-11"/>';
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
    if(!ctx || !feature) return;
    ctx.setTransform(canvas.width/100,0,0,canvas.height/100,0,0);
    ctx.clearRect(0,0,100,100);
    paintMaterial(ctx,feature.id,t,state.flags);
  }
  function mountFeature(root,layer,state,feature) {
    const record={state,feature,layer};
    if(!feature) return record;
    const canvas=root.ownerDocument.createElement('canvas');
    canvas.className='life-material'; canvas.dataset.life=feature.id;
    canvas.style.cssText=rect(feature.materialBox);
    // Rasterize at the largest game's stage width with a two-device-pixel
    // budget so small cord fibres stay sharp at desktop and phone scales.
    canvas.width=Math.ceil(2720*feature.materialBox[2]/100);
    canvas.height=Math.ceil(1530*feature.materialBox[3]/100);
    layer.append(canvas); record.canvas=canvas; record.ctx=canvas.getContext?.('2d');
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
    const existing=new Map(Array.from(record.layer.children).filter(n=>n!==record.canvas).map(n=>[n.dataset.life,n]));
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
    if(!record.ctx || covered(root)) return feature.observation;
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
        ? mark('fresh-air-in-coals',[34.6,40.7,12.7,5.6],'life-coal-blush')
        : mark('dust-at-tuyere',[34.3,39.5,4.1,6.6],'life-cold-air','soot');
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

/* Weather direction for the fourteen theatrical plates. Coordinates are plate
   percentages. Musgrave's printed pp. 31–34 describe short, changing winter
   falls of rain, sleet and snow. P. 116 records showers easing on 24 August.
   Individual showers here are dramatic timing, not a reconstructed weather log. */
(function (host, factory) {
  const weather = factory(host);
  if (typeof module === 'object' && module.exports) module.exports = weather;
  else host.CastawayWeather = weather;
})(typeof window !== 'undefined' ? window : globalThis, function (host) {
  'use strict';
  const width = 1000, height = 562.5;
  const memory = new WeakMap();
  const zone = (id, medium, depth, count, points) => ({id, medium, depth, count, points});
  const box = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  const fx = (id, kind, x,y,w,h, strength = 1) => ({id,kind,x,y,w,h,strength});
  const crop = (id, rect, shape, motion) => ({id,rect,shape,motion});
  const pane = (id, x,y,w,h, medium) => zone(id,medium,'distant',5,box(x,y,w,h));
  // Each light of the sash has its own aperture. The central mullions and the
  // sill remain opaque, including when a near-white snowflake crosses a pane.
  const cabinPanes = medium => [
    pane('upper-left pane',14.6,16.6,6.2,8.4,medium),pane('upper-right pane',21.9,16.6,6.0,8.4,medium),
    pane('lower-left pane',14.6,26.4,6.2,10.5,medium),pane('lower-right pane',21.9,26.4,6.0,10.5,medium)
  ];
  const chartPanes = [
    pane('upper-west glass',4.6,9.9,6.2,12.1,'rain'),pane('upper-east glass',12.3,10.2,6.1,11.9,'rain'),
    pane('lower-west glass',4.6,24.4,6.2,12.9,'rain'),pane('lower-east glass',12.3,24.4,6.1,12.9,'rain')
  ];
  const winterGully = [[26,19],[44,13],[68,16],[60,34],[50,47],[38,62],[33,55],[31,37]];
  const wreckSeaward = [[0,29],[8,30],[15,54],[10,65],[0,72]];
  const cove = [[0,25],[18,24],[28,30],[22,38],[12,41],[3,38],[0,38]];
  const clearing = [[43,0],[59,0],[53,10],[43,17],[38,32],[30,40],[19,35],[22,26]];
  const scenes = {
    beach: {chapter:1, season:'austral summer', weather:'Squalls off the reef', wind:1.15, slant:.84,
      zones:[zone('outer shoal','rain','middle',32,[[0,4],[28,1],[43,13],[33,29],[22,44],[10,59],[0,64]]),
        zone('windward shingle','rain','near',15,[[0,45],[15,46],[25,59],[21,69],[9,80],[0,84]]),
        zone('breaking water','spray','near',12,[[0,48],[15,47],[18,52],[12,56],[0,60]])],
      effects:[fx('rain on shingle','rings',10.3,61.8,8,2.1),fx('backwash on rock','backwash',.1,56.3,13.2,2.4)],
      cut:crop('shore grass',[0,79.1,8.2,11.8],'0 0,100% 0,100% 80%,0 100%','grass')},
    wreck: {chapter:1, season:'austral summer', weather:'Runoff from the wreck', wind:1.03, slant:.78,
      zones:[zone('exposed water','rain','middle',29,wreckSeaward),
        zone('gap beyond the stern','rain','far',15,[[75,3],[99,3],[98,35],[87,44],[82,33]]),
        zone('spray under the bow','spray','near',9,[[0,54],[10,51],[8,63],[0,68]])],
      effects:[fx('water from broken rail','drip',20.9,49.8,.6,15.6),fx('bow wash','backwash',.3,60.2,7.6,2.7)]},
    camp: {chapter:1, season:'austral summer', weather:'Rain at the edge of the trees', wind:.75, slant:.68,
      zones:[zone('gap in the canopy','rain','far',23,clearing),
        zone('exposed clearing','rain','near',17,[[40,28],[53,28],[55,58],[44,74],[33,71],[38,56]])],
      effects:[fx('water under branches','drip',20.9,24.9,.7,10.8)]},
    cabin: {chapter:2, indoor:true, season:'winter 1864', weather:'Sleet against the cabin glass', wind:.8, slant:.64,
      zones:cabinPanes('sleet'),effects:[]},
    forest: {chapter:2, season:'winter 1864', weather:'Wet snow in the freshwater gully', wind:.65, slant:.62,
      zones:[zone('distant gully','snow','far',41,winterGully),
        zone('near bank','sleet','near',18,[[5,27],[15,32],[27,52],[30,68],[21,71],[8,56]]),
        zone('open path','snow','middle',22,[[50,30],[67,28],[72,45],[56,66],[43,70],[46,50]]),
        zone('flakes below the near canopy','snow','near',20,[[63,27],[73,22],[83,35],[84,61],[72,75],[59,65],[61,49]])],
      effects:[fx('meltwater below the fall','rings',19.5,66.4,6.3,1.7),fx('last flakes on moss','snow-edge',24.8,52.8,5.7,1.7),fx('wet slush at the runnel','slush-edge',22.6,68.2,21,5.0)],
      cut:crop('bank fern',[2,85.7,10.4,11.3],'0 0,100% 0,94% 100%,0 100%','grass')},
    forge: {chapter:3, indoor:true, season:'early 1865', weather:'Fine rain beyond the forge door', wind:.67, slant:.64,
      zones:[zone('doorway below lintel','rain','distant',16,[[2,17],[10.8,19],[10.3,56],[2,58]])],
      effects:[fx('drips outside threshold','drip',3.1,44.2,.5,11.8)]},
    charcoal: {chapter:3, season:'early 1865', weather:'A shower caught in the canopy', wind:.66, slant:.64,
      zones:[zone('hollow beyond the roots','rain','far',17,winterGully),
        zone('dripping stand of trees','rain','middle',11,[[72,20],[85,17],[82,42],[74,57],[69,49]])],
      effects:[fx('water off the roots','drip',17.2,47.5,.8,10.9),fx('droplets at the seep','rings',19,66.4,7,1.6)],
      cut:crop('wind at the pit',[90.4,50.8,9.2,8.2],'0 22%,100% 0,100% 100%,0 94%','grass')},
    slipway: {chapter:4, season:'July 1865', weather:'Needles of sleet off the cove', wind:.94, slant:.84,
      zones:[zone('open cove','sleet','middle',31,cove),
        zone('wind across the stocks','sleet','far',17,[[12,3],[30,4],[39,21],[30,37],[20,41],[13,28]])],
      effects:[fx('wet end of slipway','rings',10.3,63,6.2,1.6)]},
    salvage: {chapter:4, season:'July 1865', weather:'Winter squall against the bow', wind:1, slant:.91,
      zones:[zone('bow exposure','sleet','near',24,wreckSeaward),
        zone('white air past the rail','snow','far',25,[[72,0],[97,0],[99,22],[94,37],[84,37],[78,24]])],
      effects:[fx('winter spray under hull','backwash',.5,63.2,7.3,2),fx('drops from garboard','drip',37.3,51.8,.4,10)]},
    crossing: {chapter:5, season:'July 1865', weather:'Cold squalls on the crossing', wind:1.5, slant:1.32,
      zones:[zone('port sky and sea','rain','middle',43,[[0,0],[37,0],[38,27],[30,48],[24,57],[0,59]]),
        zone('squall beyond canvas','sleet','far',23,[[52,36],[91,19],[97,32],[100,58],[54,59]]),
        zone('spindrift over the rail','spray','near',28,[[50,48],[89,44],[98,53],[88,61],[66,60],[47,62]])],
      effects:[fx('spray caught at the far rail','backwash',62.8,58,12,1.4)]},
    harbour: {chapter:6, season:'July 1865', weather:'A clearing in the harbour', wind:.48, slant:.50,
      zones:[zone('last rain beyond the cutter','rain','far',9,[[0,13],[17,14],[27,24],[23,39],[11,48],[0,46]])],
      effects:[fx('light on water beneath the pier','backwash',54.9,62.8,10.6,1.6),fx('wet bollard','drip',2.6,60.7,.3,5.1)]},
    chartroom: {chapter:6, indoor:true, season:'July 1865', weather:'Passing rain through four panes', wind:.48, slant:.5,
      zones:chartPanes,effects:[]},
    landing: {chapter:7, season:'August 1865', weather:'Sheltered water after the showers', wind:.7, slant:.66,
      zones:[zone('tail of shower across the inlet','rain','far',18,[[7,5],[36,5],[45,13],[39,28],[24,37],[3,39],[2,25]])],
      effects:[fx('last wash of the tide','backwash',2.4,55.6,15.7,2),fx('wet pebbles at the waterline','rings',56,54.2,5.4,1.3)]},
    return_camp: {chapter:7, indoor:true, season:'August 1865', weather:'Evening light after the rain', wind:.60, slant:.66,
      zones:cabinPanes('after-rain'),effects:[fx('fire cast over the floor','warmth',6.5,65,17,6.2)]}
  };

  // These polygons follow the *floor*, independently of the sky and window
  // apertures. Only the damp strip at a waterside yields to a foot.
  const patch=(id,material,points)=>({id,material,points});
  const wreckEdge=patch('stones below the bow','shingle',[[5.4,75],[21,73.4],[33,76.2],[27.7,80.2],[12,83.1],[5.4,80.1]]);
  const patches={
    beach:[patch('wet margin of the beach','shingle',[[5.6,74.2],[23.6,69.4],[38.8,71.1],[32.2,78.5],[13,83.5],[5.6,80.3]])],
    wreck:[wreckEdge],salvage:[wreckEdge],
    camp:[patch('low spot under the trees','earth',[[32.6,70.7],[43,67.7],[52,69],[49,73.2],[35.3,75.1]])],
    forest:[patch('slush at the pool','slush',[[14.6,73.8],[29.3,69.7],[47.5,65.8],[52.8,68.3],[36.2,75.7],[19.6,78.8]])],
    charcoal:[patch('damp track beside the hollow','earth',[[16,74],[27,70],[43,67.9],[48.1,70.2],[38,74.8],[20,78.2]])],
    slipway:[patch('wet grit by the cove','shingle',[[6.1,70],[16,66.4],[31,64],[28.3,70.7],[12.4,77.3],[6.1,75.8]])],
    harbour:[patch('damp edge of the wharf','boards',[[6.4,71.6],[29,70.9],[36,71.8],[34,76.6],[12.5,78]])],
    landing:[patch('shingle above the wash','shingle',[[6,67],[25,64.5],[47.8,65.5],[58,65],[55.1,69],[22,74.1],[6,73.4]])]
  };
  const wetBilge=patch('wet planks by the bilge','bilge',[[55,76],[63,74.7],[73,75.3],[74.2,78.2],[65,81],[57.2,79.1]]);
  const maxTracks=12;
  const controlled = {
    camp:['shelterBuilt','firewoodPlaced','fireLit','mastRaised','signalRaised'],
    cabin:['roofSealed','waterStored','warmthReady'], forge:['bellowsFitted','forgeFueled','forgeLit'],
    slipway:['hullPlanked','boatSealed','sailRigged'], crossing:['rigSecured','boatDry','sailMended','courseSet'],
    forest:['waterFetched'], harbour:['rescueSupplied','rescueRigged'], landing:['boatMoored','landingMarked','menRescued']
  };
  function describe(state) {
    const scene=state?.scene, base=scenes[scene];
    if (!base) return null;
    const f=state.flags || {}, zones=[...base.zones], effects=[...base.effects];
    let shelter='open', rig='none', cut=base.cut;
    if (base.indoor) shelter='indoors';
    if (scene==='camp') {
      shelter=f.shelterBuilt?'canvas lee':'bare frame';
      if (f.shelterBuilt) effects.push(fx('runoff at the low eave','drip',63.1,48.2,.6,16.3),fx('splash beyond shelter','rings',60.9,64.5,4.1,1.1));
      else zones.push(zone('through the bare frame','rain','near',18,[[62,35],[78,29],[80,40],[77,62],[69,67],[61,59]]));
      if(f.fireLit) effects.push(fx('firelight in the lee','warmth',22.9,63.7,9.2,3.7));
      if(f.signalRaised) rig='signal draws'; else if(f.mastRaised) rig='bare signal mast';
    } else if(scene==='cabin') {
      shelter=f.warmthReady?'warm and sealed':f.roofSealed?'sealed, still damp':'leaking seam';
      if (!f.roofSealed) effects.push(fx('ripples below leaking seam','rings',53.2,65.7,3.9,1.2));
      if (!f.warmthReady) effects.push(fx('damp under seam','wet',52.7,65.3,5.1,2.0,f.roofSealed ? 0.55 : 1));
      else effects.push(fx('hearth reflection','warmth',6.7,65.1,14.8,5.5));
    } else if(scene==='forge'&&f.forgeLit) {
      effects.push(fx('heat at the stone lip','heat',36.8,37.7,9.2,6.1));
    } else if(scene==='slipway') {
      rig=f.sailRigged?'sail on stocks':'bare stocks';
      if(f.hullPlanked) effects.push(fx(f.boatSealed?'sealed strake runoff':'water beads on strake','drip',76.6,53.7,.45,f.boatSealed?7.7:2.7));
    } else if(scene==='crossing') {
      rig=f.sailMended?'patched canvas':f.rigSecured?'secured shroud':'loose shroud';
      if(!f.boatDry) effects.push(fx('water surging in bilge','backwash',61.4,73.9,10.1,1.5));
      cut=crop('working shroud',[23.9,37,12.2,23.1],'73% 0,78% 0,14% 100%,8% 100%',f.rigSecured?'fast-line':'loose-line');
    } else if(scene==='landing') {
      rig=f.boatMoored?'boat made fast':'boat unmoored';
      if(f.landingMarked) effects.push(fx('lantern on wet shingle','warmth',73.4,59.5,4.2,2.6));
    }
    return {scene, chapter:base.chapter, season:base.season, weather:base.weather, indoor:!!base.indoor,
      wind:base.wind,slant:base.slant,zones,effects,shelter,rig,cut,
      ground:scene==='crossing' ? (f.boatDry ? [] : [wetBilge]) : (patches[scene] || [])};
  }

  // The atmosphere waxes and slackens in the same weather regardless of how
  // quickly the player solves a puzzle. State only alters the physical response.
  const unit = n => n-Math.floor(n);
  function noise(n) {
    let h = Math.imul(n ^ (n >>> 15), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    return ((h ^ (h >>> 16)) >>> 0)/4294967296;
  }
  function field(z,index) {
    const xs=z.points.map(p=>p[0]*10), ys=z.points.map(p=>p[1]*height/100);
    const x=Math.min(...xs), y=Math.min(...ys), w=Math.max(...xs)-x, h=Math.max(...ys)-y;
    const depth={near:1.18,middle:.9,far:.60,distant:.44}[z.depth];
    const area=Math.abs(xs.reduce((a,x,i)=>a+x*ys[(i+1)%xs.length]-xs[(i+1)%xs.length]*ys[i],0))/2;
    const count=Math.ceil(z.count*Math.min(2.35,w*h/area));
    const grains=Array.from({length:count},(_,i)=>{
      const k=(index+17)*193 + (i+1)*19;
      return {x:noise(k),y:noise(k+3),u:noise(k+7),v:noise(k+11)};
    });
    return {z,x,y,w,h,depth,grains};
  }
  function weatherCycle(t) {
    return .46+.54*(.5+.5*Math.sin(t*.48+.7))*(.63+.37*Math.sin(t*.133-1.1));
  }
  function clipZone(ctx,points) {
    ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x*10,y*height/100):ctx.moveTo(x*10,y*height/100));
    ctx.closePath();ctx.clip();
  }
  function stroke(ctx,x,y,dx,dy) {
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();
  }
  function oval(ctx,x,y,rx,ry,fill) {
    ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);
    if(fill)ctx.fill();else ctx.stroke();
  }
  function air(ctx,field,m,t,gust,still) {
    const {z,x,y,w,h,depth,grains}=field;
    ctx.save();clipZone(ctx,z.points);
    // A soft, local curtain makes the passing fall readable against textured
    // rock and sky. No tint is allowed outside the aperture or over the floor.
    if(!m.indoor && z.medium!=='spray') {
      const silver=z.medium==='snow'||z.medium==='sleet';
      ctx.save();
      ctx.translate(x+w*(.5+.055*Math.sin(.19*t)),y+h*.49);
      ctx.scale(w*.44,h*.48);
      const wash=ctx.createRadialGradient(0,0,0,0,0,1);
      wash.addColorStop(0,silver?'rgba(191,205,212,.22)':'rgba(141,159,168,.16)');
      wash.addColorStop(1,'transparent');
      ctx.fillStyle=wash;ctx.globalAlpha=.65+.35*gust;oval(ctx,0,0,1,1,true);ctx.restore();
    }
    const rate = still ? 0.40 : 0.73 + 0.27 * gust;
    for (let i=0;i<Math.ceil(rate*grains.length);i++) {
      const p=grains[i], kind=z.medium, snow=kind==='snow'||(kind==='sleet'&&p.u>.62), spray=kind==='spray';
      const direction=1; // along the signal cloth and across the exposed water
      if(kind==='after-rain' && p.u<.6) continue;
      const drop=kind==='after-rain';
      const vy=(snow?16+9*p.v:spray?13:drop?7:161+67*p.v)*depth;
      const vx=(snow?24:spray?117:drop?1:87+23*p.u)*m.slant*m.wind*depth;
      const weave=snow?Math.sin(.85*t+7*p.v)*3.7*depth:0;
      const u=unit(p.x+direction*(t*vx+gust*4*depth)/w+weave/w);
      const v=unit(p.y+t*vy/h);
      const px=x+u*w, py=y+v*h;
      const opacity = snow ? 0.76 : spray ? 0.54 : 0.67;
      const alpha = (0.48 + 0.47 * p.u) * opacity * (z.depth === 'far' ? 0.74 : 1);
      ctx.globalAlpha=alpha;
      if (snow) {
        ctx.fillStyle=p.v>.5?'#e9e8e0':'#d4dde0';
        const size=(.95+1.85*p.u)*depth;
        oval(ctx,px,py,size,size*(.77+.23*Math.sin(t+p.v)),true);
      } else if(spray) {
        ctx.lineWidth=(.65+.65*p.v)*depth;ctx.strokeStyle='#e0e2d8';
        stroke(ctx,px,py,(2.6+4.6*p.u)*depth,(-.85+p.v)*depth);
      } else {
        ctx.strokeStyle=drop?'#cbd7d6':'#cdd8d9';ctx.lineWidth=(.66+.62*p.u)*depth+.16;
        const length=(drop?2.2:7+9*p.u)*depth*(still ? 0.71 : 1);
        stroke(ctx,px,py,length*(drop ? 0.11 : 0.39*m.slant*(0.65+0.4*gust)),length);
      }
    }
    ctx.restore();
  }
  function glow(ctx,e,color) {
    const x=e.x*10,y=e.y*height/100,w=e.w*10,h=e.h*height/100;
    ctx.save();ctx.translate(x+w*.5,y+h*.55);ctx.scale(w*.53,h*.5);
    const g=ctx.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;oval(ctx,0,0,1,1,true);ctx.restore();
  }
  function surface(ctx,e,t,gust,still) {
    const x=e.x*10,y=e.y*height/100,w=e.w*10,h=e.h*height/100;
    ctx.save();ctx.lineCap='round';
    if(e.kind==='rings') {
      for(let j=0;j<3;j++) {
        const phase=unit(t*(.49+.12*j)+.37*j);
        ctx.globalAlpha=.5*Math.sin(phase*Math.PI)*e.strength;
        ctx.strokeStyle='#c2ced0';ctx.lineWidth=.66;
        oval(ctx,x+w*(.19+j*.31),y+h*(.38+.25*(j%2)),(.35+phase*2.9),(.15+phase*.72),false);
      }
    } else if(e.kind==='drip') {
      const phase=unit(t*.43+x*.017);
      if(phase<.64||still) {
        const fall = still ? 0.39 : Math.min(phase / 0.64, 1) ** 2;
        ctx.globalAlpha=.60;ctx.strokeStyle='#cad5d0';ctx.lineWidth=.8;
        stroke(ctx,x+w*.5,y+h*fall,-.28,1.1+1.6*fall);
      }
    } else if (e.kind==='backwash') {
      ctx.strokeStyle='#d4ddd5';ctx.lineWidth=.85;
      for(let j=0;j<3;j++) {
        const phase=unit(t*.18+j*.31), px=x+w*(.08+j*.27);
        ctx.globalAlpha=.4*Math.sin(phase*Math.PI)*gust;
        ctx.beginPath();ctx.moveTo(px,y+h*phase);ctx.quadraticCurveTo(px+w*.065,y+h*(phase+.17),px+w*.16,y+h*(phase-.08));ctx.stroke();
      }
    } else if(e.kind==='slush-edge') {
      // Thin fragments at the margin of the runnel, where a boot can disturb
      // the thawing skin. The central footpath remains exposed earth.
      ctx.fillStyle='#d0d2c6';ctx.strokeStyle='#c5cbbf';ctx.lineWidth=.7;
      for(let i=0;i<21;i++){
        const u=noise(73+i),v=noise(91+i),px=x+w*u,py=y+h*(.88-.69*u+.12*v);
        ctx.globalAlpha=.25+.2*v;
        oval(ctx,px,py,1.3+2.1*v,.4+.34*v,true);
        if(i%4===0)stroke(ctx,px,py+.65,1.2+2.8*v,-.35);
      }
    } else if(e.kind==='snow-edge') {
      ctx.fillStyle='#dfddd0';ctx.globalAlpha=.44;
      for(let i=0;i<7;i++) oval(ctx,x+w*noise(i+7),y+h*noise(i+17),.8+noise(i+71),.45,true);
    } else if(e.kind==='heat') {
      ctx.lineWidth=.65;ctx.strokeStyle='#edba773b';
      for(let i=0;i<3;i++) {
        const phase=unit(.31*t+i*.31), px=x+w*(.22+.25*i);
        ctx.globalAlpha=.62*Math.sin(Math.PI*phase);
        ctx.beginPath();ctx.moveTo(px,y+h*(1-phase));ctx.quadraticCurveTo(px+1.8,y+h*(.78-phase),px-.6,y+h*(.69-phase));ctx.stroke();
      }
    } else {
      ctx.globalAlpha = e.strength * (e.kind === 'warmth' ? 0.77+0.13*Math.sin(t*3.3) : 0.9);
      glow(ctx,e,e.kind==='warmth'?'rgba(232,157,74,.30)':'rgba(60,85,86,.30)');
    }
    ctx.restore();
  }

  function pointInPatch(x,y,points) {
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const [ax,ay]=points[i],[bx,by]=points[j];
      if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax) inside=!inside;
    }
    return inside;
  }
  function planted(ctx,track,t) {
    const age=(t-track.start)/track.duration;
    if(age<0||age>=1)return;
    const x=track.x*10, y=track.y*height/100;
    ctx.save();ctx.translate(x,y);ctx.scale(track.direction,1);
    ctx.globalAlpha=.45*(1-age)*(1-age*.45);
    if(track.material!=='bilge'){
      ctx.fillStyle=track.material==='boards'?'#554c45':'#5a4e42';
      oval(ctx,-1.7,-.07,1.8,1.05,true);oval(ctx,1.45,-.24,2.1,1.18,true);
    }
    if(track.material==='slush'){
      ctx.strokeStyle='#d3d6c9';ctx.lineWidth=.78;
      ctx.beginPath();ctx.moveTo(-3.6,.4);ctx.quadraticCurveTo(-.8,1.9,2.3,1.4);ctx.stroke();
      ctx.fillStyle='#e2dfcf';oval(ctx,3.7,1.12,.76,.42,true);
    }
    if(age<.40){
      const spread=age/.40;
      ctx.globalAlpha=(1-spread)*.54;
      ctx.strokeStyle=track.material==='bilge'?'#d5e1dd':'#a3a699';ctx.lineWidth=.7;
      oval(ctx,.1,.1,2.8+spread*6,.7+spread*1.65,false);
    }
    ctx.restore();
  }

  const responses = {
    waterFetched:['forest','spring','disturbed-water',21.8,67.1,5.2,1.4],
    rescueSupplied:['harbour','rescueCutter','disturbed-water',13,64.9,5.2,.76],
    menRescued:['landing','rescueBoat','disturbed-water',53.1,53.2,4.9,.91],
    shelterBuilt:['camp','shelter','shed-rain',62.4,48.4,2.2,16.5],
    fireLit:['camp','hearth','warmth',23,63,8,4],
    signalRaised:['camp','cairn','drawn-cloth',44.4,26.5,5.8,3.1],
    roofSealed:['cabin','roof','last-drop',54.7,24,.8,42],
    warmthReady:['cabin','stove','warmth',7,64,12,4.8],
    forgeLit:['forge','furnace','warmth',35.3,39.6,11.3,5.9],
    boatSealed:['slipway','seams','shed-rain',73.2,53.2,3.7,8.2],
    sailRigged:['slipway','boatMast','drawn-cloth',64.1,27,8.3,9.4],
    rigSecured:['crossing','rigging','rope-settles',26.1,51.9,3.2,7.1],
    boatDry:['crossing','bilge','over-rail',72.8,51.5,10.5,8.7],
    sailMended:['crossing','tornSail','drawn-cloth',74,10.3,5.2,5.5],
    boatMoored:['landing','rescueBoat','rope-settles',73.3,36.7,3.3,5.3],
    landingMarked:['landing','signalPost','warmth',73.2,59.7,4.4,2.2]
  };
  function contactWeather(ctx,a,time) {
    const p=Math.max(0,Math.min(1,(time-a.start)/1.24));
    if(p>=1) return;
    const [, ,kind,x,y,w,h]=responses[a.key];
    ctx.save();
    if(kind==='warmth') {
      ctx.globalAlpha=.8*Math.sin(p*Math.PI);
      glow(ctx,{x,y,w,h},'rgba(249,181,91,.5)');
    } else if(kind==='disturbed-water'){
      ctx.strokeStyle='#cfdbcf';ctx.lineWidth=.97;
      for(let i=0;i<2;i++){
        const advance=Math.max(0,(p-.18*i)/(1-.18*i));
        ctx.globalAlpha=.67*Math.sin(Math.PI*advance)*(1-.5*advance);
        ctx.beginPath();
        ctx.ellipse(x*10,y*height/100,1+w*8*advance,.4+h*height/100*advance,0,.16,Math.PI*1.37);ctx.stroke();
      }
    } else if(kind==='shed-rain'||kind==='last-drop'||kind==='over-rail') {
      const count=kind==='last-drop'?1:6;
      for(let i=0;i<count;i++) {
        const phase=Math.min(1,Math.max(0,(p-i*.025)*1.16));
        const px=(x+w*(kind==='over-rail' ? .1+phase*.83 : .18+.11*i))*10;
        const py=(y+h*(kind==='over-rail'? .88-2.35*phase*(1-phase):phase*phase))*height/100;
        ctx.globalAlpha=.76*Math.sin(phase*Math.PI);
        ctx.fillStyle='#d4dcda';oval(ctx,px,py,.7+.25*(i%3),1.1+.58*phase,true);
      }
    } else {
      const px=x*10,py=y*height/100,span=w*10,drop=h*height/100;
      ctx.strokeStyle=kind==='drawn-cloth'?'#ddc8a4':'#b3a284';ctx.lineWidth=.85;
      ctx.globalAlpha=.51*Math.sin(p*Math.PI);
      ctx.beginPath();ctx.moveTo(px,py);
      const shift=(1-p)*Math.sin(p*11);
      ctx.quadraticCurveTo(px+span*.4,py+drop*(.5+.19*shift),px+span,py+drop*.22);ctx.stroke();
    }
    ctx.restore();
  }

  function background(model,state) {
    const active=host.CastawayWorld?.background?.(state);
    if(active)return active;
    if(model.scene==='beach') return 'assets/beach.png';
    if(model.scene==='camp') return state.flags?.shelterBuilt?'assets/states/camp-shelter.png':'assets/camp.png';
    if(model.scene==='wreck') return state.flags?.crateOpen?'assets/states/wreck-open.png':'assets/wreck.png';
    if(model.scene==='crossing') return 'assets/voyage/scenes/crossing-'+(state.flags.courseSet?'safe':'wet')+'.png';
    return 'assets/voyage/scenes/'+(model.scene==='return_camp'?'return-camp':model.scene)+'.png';
  }
  // The browser already has this URL for the backdrop. The image handle is
  // scoped to the current plate; a late load cannot paint the next location.
  function landscape(r,state,plate) {
    if(!host.CastawayLandscape||!r.ctx||typeof host.Image!=='function')return;
    const layers=host.CastawayLandscape.describe(state);
    const signature=plate+'|'+layers.map(layer=>layer.name+'/'+(layer.power||'')).join('|');
    if(signature===r.landSignature)return;
    r.landSignature=signature;r.landLayers=layers;r.landDirty=true;
    if(plate!==r.landPlate){
      if(r.landImage)r.landImage.onload=r.landImage.onerror=null;
      r.landPlate=plate;r.landImage=null;r.landParts=[];
    }
    prepareLandscape(r);
  }
  function prepareLandscape(r){
    if(!r.landDirty||r.reduced||r.paused||r.doc.hidden||r.disposed)return;
    if(r.landImage){
      if(r.landImage.complete && r.landImage.naturalWidth){
        r.landParts=host.CastawayLandscape.prepare(r.doc,r.landImage,r.landLayers);
        r.landDirty=false;r.root.dataset.landscape=r.landParts.length?'ready':'still';
      }
      return;
    }
    const img=new host.Image();
    r.landImage=img;
    img.onload=()=>{
      if(r.disposed||r.landImage!==img)return;
      prepareLandscape(r);
      if(!r.doc.hidden&&!r.paused&&!r.reduced)paint(r);
    };
    img.onerror=()=>{
      if(r.landImage===img){r.landDirty=false;r.landImage=null;r.root.dataset.landscape='still';}
    };
    r.root.dataset.landscape='loading';
    img.src=r.landPlate;
  }
  function texture(node,model,state) {
    const cut=model.cut;
    node.hidden=!cut;
    if(!cut)return;
    const [x,y,w,h]=cut.rect;
    node.className='wx-cut wx-'+cut.motion;
    node.style.cssText=`left:${x}%;top:${y}%;width:${w}%;height:${h}%;background-image:url("${background(model,state)}");background-size:${10000/w}% ${10000/h}%;background-position:${100*x/(100-w)}% ${100*y/(100-h)}%;clip-path:polygon(${cut.shape})`;
  }
  function paint(r) {
    if(!r.ctx||!r.model)return;
    const {ctx,canvas,model}=r;
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    ctx.clearRect(0,0,width,height);
    const still=r.reduced;
    const t=still?3.8:r.time;
    const gust=weatherCycle(t);
    if(!still && r.landParts?.length)host.CastawayLandscape.paint(ctx,r.landParts,t,gust);
    for(const region of r.fields) air(ctx,region,model,t,gust,still);
    for(const e of model.effects) surface(ctx,e,t,gust,still);
    while(r.tracks.length && t-r.tracks[0].start>=r.tracks[0].duration)r.tracks.shift();
    if(!still)for(const track of r.tracks)planted(ctx,track,t);
    if(r.action&&!still) {
      contactWeather(ctx,r.action,t);
      if(t-r.action.start>=1.24)r.action=null;
    }
  }
  function stop(r) {
    if(r.frame!==null)host.cancelAnimationFrame?.(r.frame);
    if(r.timer!==null)host.clearTimeout(r.timer);
    r.frame=null;r.timer=null;r.last=null;
  }
  function schedule(r) {
    if(r.reduced||r.paused||r.disposed||!r.ctx||!r.model||r.frame!==null||r.timer!==null||!host.requestAnimationFrame)return;
    // No refresh-rate polling. A small window with four panes needs fewer
    // frames than spray moving along the gunwale. The backing store is capped.
    r.timer=host.setTimeout(()=>{
      r.timer=null;
      r.frame=host.requestAnimationFrame(now=>{
        r.frame=null;
        if(r.root.isConnected===false){dispose(r.root);return;}
        if(r.paused||r.reduced||r.disposed)return;
        if(r.last!==null)r.time+=Math.max(0,Math.min(.15,(now-r.last)/1000));
        r.last=now;paint(r);schedule(r);
      });
    },r.model.indoor?60:37);
  }
  function preferences(r) {
    const reduced=Boolean(r.media?.matches||r.root.closest('.reduced'));
    const paused=Boolean(r.doc.hidden||r.root.closest('.inactive')||
      r.doc.querySelector?.('dialog[open], #completion:not([hidden])'));
    if(r.reduced!==reduced||r.paused!==paused) {
      stop(r);r.reduced=reduced;r.paused=paused;
      r.root.dataset.wxStill=String(reduced);r.root.dataset.wxPaused=String(paused);
      if(reduced){r.action=null;r.tracks.length=0;}
      prepareLandscape(r);
      if(!r.doc.hidden)paint(r);
    }
    schedule(r);
  }
  function resize(r) {
    const cssWidth=r.root.getBoundingClientRect().width || 640;
    const px=Math.max(1,Math.min(1152,Math.round(cssWidth*Math.min(1.35,host.devicePixelRatio||1))));
    const py=Math.round(px*9/16);
    if(r.canvas.width!==px||r.canvas.height!==py) {
      r.canvas.width=px;r.canvas.height=py;paint(r);
    }
  }
  function mount(root) {
    const doc=root.ownerDocument, cut=doc.createElement('span'), canvas=doc.createElement('canvas');
    cut.hidden=true;canvas.className='wx-particles';
    root.setAttribute('aria-hidden','true');root.replaceChildren(cut,canvas);
    // Some low-capability renderers expose canvas but have no 2D context.
    // The registered wind cut, CSS state and game path still work in that case.
    let ctx=null;
    try {ctx=canvas.getContext?.('2d',{alpha:true})||null;}catch(_){}
    const r={root,doc,cut,canvas,ctx,model:null,fields:[],frame:null,timer:null,time:3.8,last:null,
      media:host.matchMedia?.('(prefers-reduced-motion: reduce)'),disposed:false,changes:[],flags:{},action:null,tracks:[],side:1};
    memory.set(root,r);
    r.prefListener=()=>preferences(r);
    r.sizeListener=()=>resize(r);
    doc.addEventListener?.('visibilitychange',r.prefListener);
    r.media?.addEventListener?.('change',r.prefListener);
    if(host.ResizeObserver){r.sizeObserver=new host.ResizeObserver(r.sizeListener);r.sizeObserver.observe(root);}
    else host.addEventListener?.('resize',r.sizeListener);
    if(host.MutationObserver){
      r.prefObserver=new host.MutationObserver(r.prefListener);
      if(doc.body)r.prefObserver.observe(doc.body,{attributes:true,attributeFilter:['class']});
      for(const el of doc.querySelectorAll?.('dialog, #completion')||[]){
        r.prefObserver.observe(el,{attributes:true,attributeFilter:['open','hidden']});
      }
    }
    resize(r);preferences(r);return r;
  }
  function render(root,state) {
    if(!root||!state||!scenes[state.scene])return;
    const r=memory.get(root)||mount(root), keys=controlled[state.scene]||[];
    const plate=background({scene:state.scene},state);
    const signature=state.scene+'|'+keys.map(k=>state.flags?.[k]?'1':'0').join('')+'|'+plate;
    if(r.signature===signature)return;
    const same=r.model?.scene===state.scene, f=state.flags||{};
    r.changes=same?keys.filter(k=>f[k]&&!r.flags[k]&&responses[k]):[];
    r.flags=Object.fromEntries(keys.map(k=>[k,!!f[k]]));
    r.signature=signature;r.model=describe(state);r.fields=r.model.zones.map(field);
    if(!same){r.action=null;r.last=null;r.tracks.length=0;}
    if(!r.model.ground.length)r.tracks.length=0;
    root.dataset.wxRoom=r.model.scene;root.dataset.wxShelter=r.model.shelter;root.dataset.wxRig=r.model.rig;
    texture(r.cut,r.model,state);
    landscape(r,state,plate);
    if(!r.doc.hidden)paint(r);
    preferences(r);schedule(r);
  }
  function respond(root,state,targetId) {
    if(!root||!targetId)return false;
    render(root,state);
    const r=memory.get(root);if(!r)return false;
    const key=r.changes.find(k=>responses[k][0]===state.scene&&responses[k][1]===targetId);
    if(!key)return false;
    r.changes=r.changes.filter(k=>k!==key);
    if(!r.reduced&&!r.paused){r.action={key,start:r.time};paint(r);schedule(r);}
    return true;
  }
  function footfall(root,state,x,y) {
    if(!root||!Number.isFinite(x)||!Number.isFinite(y))return false;
    render(root,state);
    const r=memory.get(root);
    if(!r?.ctx||r.paused||r.reduced||r.model.scene!==state.scene)return false;
    const ground=r.model.ground.find(p=>pointInPatch(x,y,p.points));
    if(!ground)return false;
    const previous=r.tracks[r.tracks.length-1];
    if(previous && Math.hypot(x-previous.x,y-previous.y)<.64 && r.time-previous.start<.65)return false;
    const direction=previous&&Math.abs(x-previous.x)>.25 ? Math.sign(x-previous.x) : 1;
    r.side*=-1;
    if(r.tracks.length>=maxTracks)r.tracks.shift();
    r.tracks.push({x,y:y+.14*r.side,direction,start:r.time,
      duration: ground.material === 'bilge' ? 0.9 : ground.material === 'slush' ? 3.6 : 2.7, material:ground.material});
    paint(r);schedule(r);return true;
  }
  function dispose(root) {
    const r=memory.get(root);if(!r)return;
    r.disposed=true;
    if(r.landImage)r.landImage.onload=r.landImage.onerror=null;
    r.landParts=[];r.landImage=null;
    stop(r);r.sizeObserver?.disconnect();r.prefObserver?.disconnect();
    r.doc.removeEventListener?.('visibilitychange',r.prefListener);r.media?.removeEventListener?.('change',r.prefListener);
    if(!r.sizeObserver)host.removeEventListener?.('resize',r.sizeListener);
    root.replaceChildren();memory.delete(root);
  }
  return {describe,render,respond,footfall,dispose};
});

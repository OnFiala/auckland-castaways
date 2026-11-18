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
  const pane = (id, x,y,w,h, medium) => zone(id,medium,'distant',5,box(x,y,w,h));
  // Each light of the sash has its own aperture. The central mullions and the
  // sill remain opaque, including when a near-white snowflake crosses a pane.
  const cabinPanes = medium => [
    pane('upper-left pane',14.6,17.4,6.2,8.4,medium),pane('upper-right pane',22.1,17.5,5.7,8.3,medium),
    pane('lower-left pane',14.6,28,6.2,9.0,medium),pane('lower-right pane',22.1,28,5.7,9.0,medium)
  ];
  const chartPanes = [
    pane('upper-west glass',4.6,9.9,6.2,12.1,'rain'),pane('upper-east glass',12.3,10.2,6.1,11.9,'rain'),
    pane('lower-west glass',4.6,24.4,6.2,12.9,'rain'),pane('lower-east glass',12.3,24.4,6.1,12.9,'rain')
  ];
  const winterGully = [[26,19],[44,13],[68,16],[60,34],[50,47],[38,62],[33,55],[31,37]];
  const wreckSeaward = [[0,26],[3.3,32],[4.3,45],[6.5,55],[10.1,67.9],[7,72],[0,75]];
  const cove = [[0,13],[17,9],[34,21],[36,36],[23,46],[10,52],[0,51]];
  const clearing = [[43,0],[59,0],[53,10],[43,17],[38,32],[30,40],[19,35],[22,26]];
  const scenes = {
    beach: {chapter:1, season:'austral summer', weather:'Surf breaks on the rocks below the path', wind:1.15, slant:.84,
      zones:[zone('shower approaching the reef','rain','middle',51,[[0,12],[22,7],[43,16],[45,37],[41,56],[33,63],[9,66],[0,65]]),
        zone('rain over the exposed flats','rain','near',18,[[0,45],[13,44],[25,60],[30,69],[21,75],[3,79],[0,76]])],
      effects:[fx('drops on the wet sand','rings',12,71.2,15,2.1)]},
    wreck: {chapter:1, season:'austral summer', weather:'Water drips from the end of the rail', wind:1.03, slant:.78,
      zones:[zone('exposed water','rain','middle',20,wreckSeaward),
        zone('shower beyond the stern','rain','far',30,[[66,2],[99,2],[99,26],[86,37],[75,40],[70,35]])],
      effects:[fx('water from broken rail','drip',68.55,46.8,.35,3.3)]},
    camp: {chapter:1, season:'austral summer', weather:'Rain at the edge of the trees', wind:.75, slant:.68,
      zones:[zone('gap in the canopy','rain','far',23,clearing),
        zone('exposed clearing','rain','near',17,[[40,28],[53,28],[55,58],[44,74],[33,71],[38,56]])],
      effects:[fx('water under branches','drip',20.9,24.9,.7,10.8)]},
    cabin: {chapter:2, indoor:true, season:'winter 1864', weather:'The cabin glass looks out into the gully', wind:.8, slant:.64,
      zones:cabinPanes('sleet'),effects:[]},
    forest: {chapter:2, season:'winter 1864', weather:'Water spills down the rock into the pool', wind:.65, slant:.62,
      zones:[zone('distant gully','snow','far',41,winterGully),
        zone('near bank','sleet','near',18,[[5,27],[15,32],[27,52],[30,68],[21,71],[8,56]]),
        zone('open path','snow','middle',22,[[50,30],[67,28],[72,45],[56,66],[43,70],[46,50]]),
        zone('flakes below the near canopy','snow','near',20,[[63,27],[73,22],[83,35],[84,61],[72,75],[59,65],[61,49]])],
      effects:[fx('shower reaching the pool','pool-rings',19.4,65.7,5.9,1.2)]},
    forge: {chapter:3, indoor:true, season:'early 1865', weather:'The fire bed is sheltered inside the forge door', wind:.67, slant:.64,
      zones:[zone('doorway below lintel','rain','distant',16,[[2,17],[10.8,19],[10.3,56],[2,58]])],
      effects:[fx('drops off the forge lintel','drip',3.2,17.7,.3,39.1)]},
    charcoal: {chapter:3, season:'early 1865', weather:'The canopy shelters the charcoal hollow', wind:.66, slant:.64,
      zones:[zone('hollow beyond the roots','rain','far',17,winterGully),
        zone('dripping stand of trees','rain','middle',11,[[72,20],[85,17],[82,42],[74,57],[69,49]])],
      effects:[fx('water off the roots','drip',17.2,47.5,.8,10.9),fx('droplets at the seep','pool-rings',23.7,67.1,3.5,.9)]},
    slipway: {chapter:4, season:'July 1865', weather:'The stocks stand above the reach of the wash', wind:.94, slant:.84,
      zones:[zone('open cove','sleet','middle',31,cove),
        zone('wind across the stocks','sleet','far',17,[[12,3],[30,4],[39,21],[30,37],[20,41],[13,28]])],
      effects:[fx('drops beyond the yard','pool-rings',12.3,49,7,1.1)]},
    salvage: {chapter:4, season:'July 1865', weather:'The broken bow takes the wash', wind:1, slant:.91,
      zones:[zone('bow exposure','sleet','near',24,wreckSeaward),
        zone('white air past the rail','snow','far',25,[[72,0],[97,0],[99,22],[94,37],[84,37],[78,24]])],
      effects:[fx('drops beneath the stern','drip',68.55,46.8,.35,3.3)]},
    crossing: {chapter:5, season:'July 1865', weather:'The sea runs high beyond the rail', wind:1.24, slant:.89, direction:-1,
      zones:[zone('rain over the lookout','rain','middle',52,[[0,4],[28,1],[33,9],[29,32],[23,47],[15.8,51.4],[9,50],[0,50]]),
        zone('shower beneath the boom','rain','far',32,[[60.6,30.1],[72.2,26.4],[85.9,21.1],[87.4,34],[88.2,43.4],[78.4,44.3],[69.3,43.6],[60,46.1]]),
        zone('squall crossing the open rail','rain','near',16,[[0,24],[11,24],[19,37],[19.6,47],[11,50],[2,49],[0,46]])],
      effects:[]},
    harbour: {chapter:6, season:'July 1865', weather:'The water catches the light beside the pier', wind:.48, slant:.50,
      zones:[zone('last rain beyond the cutter','rain','far',9,[[0,13],[17,14],[27,24],[23,39],[11,48],[0,46]])],
      effects:[fx('light on water beneath the pier','backwash',54.9,62.8,10.6,1.6),fx('wet bollard','drip',2.6,60.7,.3,5.1)]},
    chartroom: {chapter:6, indoor:true, season:'July 1865', weather:'The window frame shelters the charts', wind:.48, slant:.5,
      zones:chartPanes,effects:[]},
    landing: {chapter:7, season:'August 1865', weather:'Sheltered water after the showers', wind:.7, slant:.66,
      zones:[zone('tail of shower across the inlet','rain','far',18,[[7,5],[36,5],[45,13],[39,28],[24,37],[3,39],[2,25]])],
      effects:[fx('drops inside the mooring','pool-rings',52,41,10.3,1.3)]},
    return_camp: {chapter:7, indoor:true, season:'August 1865', weather:'The window shelters the room from the wind', wind:.60, slant:.66,
      zones:cabinPanes('after-rain'),effects:[]}
  };

  // All camera directions are screen-relative. A chapter clock follows the
  // player through doors. The departure from the lee and the break in the
  // rescue weather happen once per visit to the chapter, independently of work.
  // Seconds describe dramatic pacing. Musgrave, pp. 33–34, 96–97, 116–117.
  const phase = (seconds, text, rain, wind, shade) => ({seconds,text,rain,wind,shade});
  const passages = {
    1: {repeat:[
      phase(23,'White water runs into the cove.',.20,.78,.36),
      phase(18,'Rain sweeps in from the water.',.91,1,.87),
      phase(33,'Light opens between the showers.',0,.64,.08)
    ]},
    2: {repeat:[
      phase(29,'A pale opening shows between the trees.',0,.32,.07),
      phase(19,'Sleet brushes the trees.',.52,.62,.54),
      phase(22,'Wet snow drifts through the gully.',.88,.78,.78),
      phase(20,'The shower thins to scattered flakes.',.12,.40,.29)
    ]},
    3: {repeat:[
      phase(42,'Light reaches the charcoal bank.',0,.32,.1),
      phase(17,'A shower moves across the hollow.',.56,.59,.65),
      phase(28,'The trees drip after the shower.',0,.36,.30)
    ]},
    4: {repeat:[
      phase(34,'The cove gives the men a lee to work in.',0,.49,.18),
      phase(16,'Sleet comes across the mouth of the cove.',.75,.92,.76),
      phase(29,'The opening beyond the stocks grows bright.',.05,.55,.06)
    ]},
    5: {intro:[
      phase(14,'The boat leaves the lee of the island.',.03,.53,.18),
      phase(21,'The wind fills in. A swell lifts beyond the rail.',.25,.86,.43)
    ],repeat:[
      phase(27,'A squall draws a curtain across the lookout.',.96,1.18,.93),
      phase(34,'The rain lifts. The swell still runs high.',0,1.03,.28),
      phase(22,'Spray flies from the wave tops.',.18,1.10,.55)
    ]},
    6: {repeat:[
      phase(43,'In the harbour, light reaches the water again.',0,.37,.07),
      phase(16,'A thin shower passes beyond the cutter.',.45,.52,.43),
      phase(32,'The last shower moves out across the harbour.',0,.32,.16)
    ]},
    7: {intro:[
      phase(18,'The last shower trails away up the inlet.',.44,.81,.57)
    ],repeat:[
      phase(39,'There is light enough to see the landing.',0,.61,.14),
      phase(32,'Wind still ruffles the water beyond the boat.',0,.73,.27)
    ]}
  };
  const clamp = v => Math.max(0,Math.min(1,v));
  const duration = rows => rows.reduce((sum,row)=>sum+row.seconds,0);
  function conditions(chapter,seconds) {
    const story=passages[chapter];
    if(!story)return null;
    const intro=story.intro||[], loop=story.repeat;
    let elapsed=Math.max(0,seconds), previous=intro[0]||loop[0];
    let rows=intro;
    if(elapsed>=duration(intro)){
      elapsed-=duration(intro);
      previous=elapsed>=duration(loop)?loop[loop.length-1]:intro[intro.length-1]||loop[0];
      elapsed%=duration(loop);
      rows=loop;
    }
    for(const row of rows){
      if(elapsed<row.seconds){
        const u=clamp(elapsed/Math.min(7,row.seconds/3)), blend=u*u*(3-2*u);
        const mix=key=>previous[key]+(row[key]-previous[key])*blend;
        return {phase:row.text,rain:mix('rain'),wind:mix('wind'),shade:mix('shade')};
      }
      elapsed-=row.seconds;
      previous=row;
    }
  }

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
  const wetBilge=patch('wet planks by the bilge','bilge',[[57,79.5],[64.4,78.9],[75.5,78.7],[77,79.5],[71.6,82.9],[65.4,84.5],[62.6,83.2],[60.8,81.4]]);
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
    let shelter='open', rig='none', cue=base.weather+'.';
    if (base.indoor) shelter='indoors';
    if (scene==='camp') {
      shelter=f.shelterBuilt?'canvas lee':'bare frame';
      cue=f.shelterBuilt?'Drops run off the low edge of the stretched sail.':'Rain reaches through the bare shelter frame.';
      if (f.shelterBuilt) effects.push(fx('runoff at the low eave','drip',78.2,59.55,.38,8.1),fx('splash beyond shelter','rings',77.5,67.4,2.2,.73));
      else zones.push(zone('through the bare frame','rain','near',18,[[62,35],[78,29],[80,40],[77,62],[69,67],[61,59]]));
      if(f.signalRaised) rig='signal draws'; else if(f.mastRaised) rig='bare signal mast';
    } else if(scene==='cabin') {
      shelter=f.warmthReady?'warm and sealed':f.roofSealed?'sealed, still damp':'leaking seam';
      // The ceiling seam, travelling drop and catching pan share the roof
      // survey's geometry and clock in fieldwork-ui.js.
      cue=f.roofSealed?'The roof seam holds above the bunks.':'Water follows a roof seam to the pan by the bunks.';
    } else if(scene==='forge'&&f.forgeLit) {
      effects.push(fx('heat at the stone lip','heat',36.8,37.7,9.2,6.1));
    } else if(scene==='slipway') {
      rig=f.sailRigged?'sail on stocks':'bare stocks';
      if(f.hullPlanked) effects.push(fx(f.boatSealed?'sealed strake runoff':'water beads on strake','drip',79.4,64.5,.35,f.boatSealed?5.2:1.4));
    } else if(scene==='crossing') {
      cue=f.courseSet?'One man holds the course while another minds the pump.':
        f.sailMended?'The patch draws tight. The man on watch can look ahead.':
        f.boatDry?'Bare boards show. Water beads again along a seam.':
        f.rigSecured?'The line holds while water runs across the floorboards.':
        'A loose shroud beats. Water washes between the floorboards.';
      rig=f.sailMended?'patched canvas':f.rigSecured?'secured shroud':'loose shroud';
      if(f.boatDry) effects.push(fx('water beading in the seam','beads',62.1,81.2,5.6,.48));
    } else if(scene==='landing') {
      cue=f.boatMoored?'The painter holds the boat beside the shingle.':'The small boat needs a line ashore.';
      rig=f.boatMoored?'boat made fast':'boat unmoored';
    }
    return {scene, chapter:base.chapter, season:base.season, weather:cue, indoor:!!base.indoor,
      wind:base.wind,slant:base.slant,direction:base.direction||1,zones,effects,shelter,rig,
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
  // Speeds are pixels per second in a 1000-wide plate. The streak points
  // along its velocity. The window drips travel vertically on the glass.
  function velocity(kind,p,depth,model,wind) {
    const drift=model.direction*model.wind*model.slant*depth*wind;
    if(kind==='after-rain')return {vx:0,vy:6*depth};
    if(kind==='snow')return {vx:(26+8*p.u)*drift,vy:(21+8*p.v)*depth};
    return {vx:(85+29*p.u)*drift,vy:(145+58*p.v)*depth};
  }
  function air(ctx,field,m,t,windTravel,sky,still) {
    const {z,x,y,w,h,depth,grains}=field;
    const residual=z.medium==='after-rain';
    const distantCurtain=m.scene==='crossing'&&z.depth==='far' ? .26*clamp((42-t)/9) : 0;
    let density=residual ? .23*Math.exp(-t/46) : Math.max(distantCurtain,sky.rain);
    if(m.scene==='crossing' && z.depth==='near')density=clamp((density-.55)*2.2);
    if(density<=0)return;
    ctx.save();clipZone(ctx,z.points);
    for (const p of grains) {
      // The wider gaps in the foreground let the plate and the hands read.
      const weight=z.depth==='near' ? .62 : 1;
      const opacity=clamp((density*weight-p.v*.93)*9);
      if(opacity<=0)continue;
      const kind=z.medium==='sleet'?(p.u>.58?'snow':'rain'):z.medium;
      const v=velocity(kind,p,depth,m,sky.wind), base=velocity(kind,p,depth,m,1);
      const weave=kind==='snow'?1.7*depth*Math.sin(t*.51+p.u*7):0;
      const u=unit(p.x+(base.vx*windTravel+weave)/w);
      const fall=unit(p.y+t*v.vy/h);
      const px=x+w*u,py=y+h*fall;
      ctx.globalAlpha=opacity*(.41+.29*p.u)*(z.depth==='distant' ? .73 : 1);
      if(kind==='snow'){
        ctx.fillStyle=p.u>.72?'#eee9dc':'#d7ddda';
        const size=(.83+1.65*p.u)*depth;
        oval(ctx,px,py,size,size*(.69+.22*Math.sin(t+p.v)),true);
      }else{
        ctx.strokeStyle=residual?'#d3dfdd':'#cdd8d9';
        ctx.lineWidth=(.64+.58*p.u)*depth+.16;
        const length=(residual?2.5:7+9*p.u)*depth*(still ? .72 : 1);
        stroke(ctx,px,py,length*v.vx/v.vy,length);
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
  function surface(ctx,e,t,sky,damp,still) {
    const x=e.x*10,y=e.y*height/100,w=e.w*10,h=e.h*height/100;
    ctx.save();ctx.lineCap='round';
    if(e.kind==='rings'||e.kind==='pool-rings') {
      for(let j=0;j<3;j++) {
        const phase=unit(t*(.49+.12*j)+.37*j);
        ctx.globalAlpha=.5*Math.sin(phase*Math.PI)*e.strength;
        ctx.strokeStyle='#c2ced0';ctx.lineWidth=.66;
        oval(ctx,x+w*(.19+j*.31),y+h*(.38+.25*(j%2)),(.35+phase*2.9),(.15+phase*.72),false);
      }
    } else if(e.kind==='beads'){
      for(let j=0;j<4;j++){
        const phase=unit(t/(9+j)+j*.23);
        ctx.globalAlpha=.56*Math.sin(Math.PI*phase);
        ctx.fillStyle='#cad4c3';
        oval(ctx,x+w*(.1+j*.23),y+h*(.19+j*.17),.5+.98*phase,.38+.39*phase,true);
      }
    } else if(e.kind==='drip') {
      // Water caught on a rail or eave can fall after the squall. Each drop
      // falls for the same brief time; as the surface dries, fewer detach.
      const at=t+e.x*.41, cycle=3.4, n=Math.floor(at/cycle);
      const fall=still ? .42 : (at-n*cycle)/.69;
      if(fall<1&&noise(n+Math.floor(x))<damp){
        ctx.globalAlpha=.66;ctx.strokeStyle='#cad5d0';ctx.lineWidth=.85;
        stroke(ctx,x+w*.5,y+h*fall*fall,0,1.2+1.8*fall);
      }
    } else if (e.kind==='backwash') {
      ctx.strokeStyle='#d4ddd5';ctx.lineWidth=.85;
      for(let j=0;j<3;j++) {
        const phase=unit(t*.18+j*.31), px=x+w*(.08+j*.27);
        ctx.globalAlpha=.4*Math.sin(phase*Math.PI)*sky.wind;
        ctx.beginPath();ctx.moveTo(px,y+h*phase);ctx.quadraticCurveTo(px+w*.065,y+h*(phase+.17),px+w*.16,y+h*(phase-.08));ctx.stroke();
      }
    } else if(e.kind==='heat') {
      ctx.lineWidth=.65;ctx.strokeStyle='#edba773b';
      for(let i=0;i<3;i++) {
        const phase=unit(.31*t+i*.31), px=x+w*(.22+.25*i);
        ctx.globalAlpha=.62*Math.sin(Math.PI*phase);
        ctx.beginPath();ctx.moveTo(px,y+h*(1-phase));ctx.quadraticCurveTo(px+1.8,y+h*(.78-phase),px-.6,y+h*(.69-phase));ctx.stroke();
      }
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
    rescueSupplied:['harbour','rescueCutter','disturbed-water',7.4,54.9,3.8,.9],
    menRescued:['landing','rescueBoat','disturbed-water',56.4,61.1,3.4,.7],
    shelterBuilt:['camp','shelter','shed-rain',77.7,59.5,1.3,8.15],
    fireLit:['camp','hearth','warmth',23,63,8,4],
    signalRaised:['camp','cairn','drawn-cloth',44.4,26.5,5.8,3.1],
    warmthReady:['cabin','stove','warmth',7,64,12,4.8],
    forgeLit:['forge','furnace','warmth',35.3,39.6,11.3,5.9],
    boatSealed:['slipway','seams','shed-rain',78,64.5,2,5.2],
    sailRigged:['slipway','boatMast','drawn-cloth',57.7,36.4,6.3,4.4],
    rigSecured:['crossing','rigging','rope-settles',30.05,49.1,-1.75,7.2],
    boatDry:['crossing','bilge','over-rail',64.5,54.3,15.4,26.5],
    sailMended:['crossing','tornSail','drawn-cloth',74,10.3,5.2,5.5],
    boatMoored:['landing','rescueBoat','rope-settles',77.7,31.5,-4.4,2.65],
    landingMarked:['landing','signalPost','warmth',76.25,33.1,3.1,4.0]
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
    } else if(kind==='shed-rain'||kind==='over-rail') {
      const count=6;
      for(let i=0;i<count;i++) {
        const phase=Math.min(1,Math.max(0,(p-i*.025)*1.16));
        const cast=kind==='over-rail';
        const px=(x+w*(cast?phase*(.76+i*.042):.18+.11*i))*10;
        const py=(y+h*(cast?1-phase-1.94*phase*(1-phase):phase*phase))*height/100;
        ctx.globalAlpha=.81*Math.sin(phase*Math.PI);
        ctx.fillStyle='#d4dcda';oval(ctx,px,py,(cast?1.5:.7)+.25*(i%3),1.1+.58*phase,true);
      }
    } else {
      const px=x*10,py=y*height/100,span=w*10,drop=h*height/100;
      ctx.strokeStyle=kind==='drawn-cloth'?'#ddc8a4':'#b3a284';ctx.lineWidth=.85;
      ctx.globalAlpha=.51*Math.sin(p*Math.PI);
      ctx.beginPath();ctx.moveTo(px,py);
      const shift=(1-p)*Math.sin(p*11);
      if(kind==='rope-settles')
        ctx.quadraticCurveTo(px+span*(.51+.06*shift),py+drop*.54+1.6*shift,px+span,py+drop);
      else ctx.quadraticCurveTo(px+span*.4,py+drop*(.5+.19*shift),px+span,py+drop*.22);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Cache the active scene's small geometry descriptions. No bitmap is loaded,
  // sampled or moved by either weather or landscape.
  function prepareLandscape(r) {
    if(!r.landDirty || r.disposed || r.paused || r.reduced || r.doc.hidden || !r.ctx || !host.CastawayLandscape)return;
    r.landParts=host.CastawayLandscape.prepare(host.CastawayLandscape.describe(r.landState));
    r.landDirty=false;
    r.root.dataset.landscape=r.landParts.length?'ready':'still';
  }
  function syncCaption(r,sky) {
    if(r.skyText===sky.phase)return;
    r.skyText=sky.phase;
    r.root.dataset.wxPhase=sky.phase;
    r.root.closest?.('.scene')?.setAttribute?.('aria-description',sky.phase+' '+r.model.weather);
  }
  function caption(root,state) {
    const r=memory.get(root);
    if(!r?.model||r.model.scene!==state.scene)return describe(state)?.weather||'';
    return conditions(r.model.chapter,r.time).phase+' '+r.model.weather;
  }
  function paint(r) {
    if(!r.ctx||!r.model)return;
    const {ctx,canvas,model}=r;
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    ctx.clearRect(0,0,width,height);
    const still=r.reduced;
    const t=r.time, sky=conditions(model.chapter,t), gust=sky.wind;
    syncCaption(r,sky);
    if(!still && r.landParts?.length)host.CastawayLandscape.paint(ctx,r.landParts,t,gust,sky.shade);
    // Foam and spindrift are emitted by the passing wave's own crest in
    // landscape.js. Precipitation has a separate, registered opening.
    for(const region of r.fields)air(ctx,region,model,t,r.windTravel,sky,still);
    for(const e of model.effects){
      // Moss, timber and eaves hold water after a shower. Rain rings on
      // exposed stones belong only to fresh drops.
      if((e.kind==='rings'||e.kind==='pool-rings')&&sky.rain<.08)continue;
      if(e.kind==='backwash'||e.kind==='pool-rings') host.CastawayLandscape?.onWater(ctx,r.landParts,()=>surface(ctx,e,t,sky,r.damp,still));
      else surface(ctx,e,t,sky,r.damp,still);
    }
    while(r.tracks.length && t-r.tracks[0].start>=r.tracks[0].duration)r.tracks.shift();
    if(!still)for(const track of r.tracks)planted(ctx,track,t);
    if(r.action&&!still) {
      if(responses[r.action.key][2]==='disturbed-water')
        host.CastawayLandscape?.onWater(ctx,r.landParts,()=>contactWeather(ctx,r.action,t));
      else contactWeather(ctx,r.action,t);
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
        if(r.last!==null){
          const dt=Math.max(0,Math.min(.25,(now-r.last)/1000));
          const sky=conditions(r.model.chapter,r.time+dt/2);
          r.windTravel+=dt*sky.wind;
          r.damp=Math.max(sky.rain,r.damp*Math.exp(-dt/29));
          r.time+=dt;
        }
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
    const doc=root.ownerDocument, canvas=doc.createElement('canvas');
    canvas.className='wx-particles';
    root.setAttribute('aria-hidden','true');root.replaceChildren(canvas);
    // Some low-capability renderers expose canvas but have no 2D context.
    // The backplate and game controls remain fully usable in that case.
    let ctx=null;
    try {ctx=canvas.getContext?.('2d',{alpha:true})||null;}catch(_){}
    const r={root,doc,canvas,ctx,model:null,fields:[],frame:null,timer:null,time:0,windTravel:0,damp:.48,last:null,
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
    const signature=state.scene+'|'+keys.map(k=>state.flags?.[k]?'1':'0').join('');
    if(r.signature===signature)return;
    const same=r.model?.scene===state.scene, f=state.flags||{};
    r.changes=same?keys.filter(k=>f[k]&&!r.flags[k]&&responses[k]):[];
    r.flags=Object.fromEntries(keys.map(k=>[k,!!f[k]]));
    if(r.model?.chapter!==scenes[state.scene].chapter){
      // A saved watch with the rig already secured resumes offshore. A repair
      // carried out here never restarts this clock or changes its wind.
      const underway=state.scene==='crossing'&&(f.rigSecured||f.boatDry||f.sailMended||f.courseSet);
      const landed=scenes[state.scene].chapter===7&&(f.boatMoored||f.menRescued);
      r.time=underway?45:landed?32:0;r.windTravel=r.time;r.damp=underway ? .9 : .48;
    }
    r.skyText=null;
    r.signature=signature;r.model=describe(state);
    syncCaption(r,conditions(r.model.chapter,r.time));r.fields=r.model.zones.map(field);
    if(!same){r.action=null;r.last=null;r.tracks.length=0;}
    if(!r.model.ground.length)r.tracks.length=0;
    root.dataset.wxRoom=r.model.scene;root.dataset.wxShelter=r.model.shelter;root.dataset.wxRig=r.model.rig;
    r.landState={scene:state.scene,flags:{...state.flags}};r.landDirty=true;
    r.landParts=[];r.root.dataset.landscape='still';
    prepareLandscape(r);
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
    r.landParts=[];r.landState=null;
    stop(r);r.sizeObserver?.disconnect();r.prefObserver?.disconnect();
    r.doc.removeEventListener?.('visibilitychange',r.prefListener);r.media?.removeEventListener?.('change',r.prefListener);
    if(!r.sizeObserver)host.removeEventListener?.('resize',r.sizeListener);
    root.replaceChildren();memory.delete(root);
  }
  return {describe,conditions,caption,velocity,render,respond,footfall,dispose};
});

/* Moving paint. The masks are traced in percentages on the actual 16:9
   paintings. Rocks, spars, window frames and walkable floors stay in place.
   The weather renderer owns the only clock, canvas and visibility lifecycle. */
(function (host, factory) {
  const landscape = factory();
  if (typeof module === 'object' && module.exports) module.exports = landscape;
  else host.CastawayLandscape = landscape;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const W = 1000, H = 562.5, TAU = 2 * Math.PI;
  const points = outline => outline.split(' ').map(pair => pair.split(',').map(Number));
  const area = (name, kind, power, outline) => ({name, kind, power, points:points(outline)});
  const light = (name, x, y, w, h, color, kind, angle=0) => ({name,x,y,w,h,color,kind,angle});
  const outerWind = area('clouds off the headland','cloud',1,'0,0 65,0 59,8 49,11 39,17 29,23 20,31 0,31');
  const cloudGap = area('sky through the branches','cloud',.66,'32,0 54,0 49,10 47,19 39,20 39,14');
  const leftLeaves = area('windward flowering branches','bough',1,'0,11 4,4 10,0 20,1 25,4 34,9 38,20 35,22 25,17 22,24 16,22 10,16 3,20');
  const gullyLeaves = area('crown over the gully','bough',.84,'4,0 45,0 43,4 39,5 36,12 32,13 28,18 24,16 20,13 12,17 9,18 12,10 4,12');
  const fall = area('water over the two ledges','fall',1,'19,48 21,48 22,54 21.8,60 23.6,61 24.8,67.8 27.6,69 24,70.2 20.3,67.7 20,61.5 18.9,60.5 19.6,55');
  const pool = area('outflow across the track','current',.82,'19,67.4 24,66.8 31.2,68.5 36,70.8 44,72.1 39,74 30.2,72.4 24,70.6 17.4,70.5');
  const cutGrass = area('tussock underfoot','grass',1.08,'0,80 3,83 7.2,85.7 8.6,89 5.8,91 0,89.9');
  const wreckSea = area('surge on the broken bow','surf',1.05,'0,49 12,49.2 12.3,52.3 9.6,57.6 8.5,62.7 6,65.3 4,71.5 0,72.8');
  const cove = area('water off the stocks','sea',.7,'0,29.4 8,29.4 14,29.8 29.8,29.8 25.7,33.4 21,35.8 21.3,38.9 12,42.1 9.7,40 4,38.4 0,38.1');
  const shelterWindow = [
    area('western pane above the fire','sea',.34,'14.7,30 20.8,30.3 20.8,36.4 14.7,36.4'),
    area('eastern pane above the fire','sea',.34,'22,30.3 27.8,30 27.8,36.2 22,36.4')
  ];
  const ceiling = area('underside of the sailcloth roof','canvas',.48,'42,0 82,0 77,7.2 70.7,14 65.7,20.2 59,18.9 50,15.3 44.5,11.7');
  const sillLight = light('cold light across the sill',23.4,39.8,9.2,.85,'163,193,197','window',-.015);
  const reflectedFire = light('hearth light along floor boards',14.9,67.5,13.5,2.4,'251,154,72','fire',.024);
  const hearth = area('flame at the grate','fire',1,'9.3,63.5 10.3,59.3 11.6,55.9 12.2,53.8 13.1,58.1 13.8,57.8 15.2,63.6 13.8,64.4 11.2,64.6');
  const openSea = [
    area('open sea to port','ocean',1.02,'0,45.3 27.2,45.2 25.1,54.8 23.4,58.5 20.9,58 20.4,55.5 15.6,54.1 7,51.8 1,52.3 0,52.7'),
    area('sea through the shrouds','ocean',1.12,'28.8,45.5 42.6,45.4 41.9,53.6 41.2,58.3 26.6,58.6'),
    area('swells abaft the mast','ocean',1.52,'47.6,45.6 93.4,45 94.2,48.5 97.4,59.2 92,59.8 82,59 64,59.3 46.8,59.4')
  ];
  const paintings = {
    beach: [outerWind,
      area('south coast surf','surf',1.24,'0,42.6 13,43.3 19.5,44.9 28,46.4 25.9,48.5 19.9,50.4 18.6,53.6 13.6,54.8 9,60.4 3.7,63.6 0,64.7'),
      area('windward leaves above the track','bough',1,'53,14 60,7.8 66,1.9 87,0 85,6.8 80.3,7.2 78,13 71,14 67.6,20.2 63,21.8 60.4,28.1 56.7,26 59,18.4 53.4,20.4'),cutGrass],
    wreck: [area('clouds behind the stern','cloud',.84,'65,0 100,0 100,9.5 86,15.4 80,17.5 72,13.8'),wreckSea,
      area('weathered square of canvas','rag',1.35,'26,8.1 29,11.7 34.2,10.4 33.2,17.4 31.3,21 30.2,26.9 28.8,24.2 27.6,28.6 26.6,18.3')],
    camp: [cloudGap,area('inlet beyond the clearing','sea',.52,'21,32.8 32.7,31.6 34.7,32.6 30.8,34.9 25,38.7 21.1,38.5 22.2,35.1'),leftLeaves,
      area('tussocks between grey stones','grass',.85,'0,48.5 2.6,48.3 7.8,54.2 9.1,59.4 3.9,60.4 0,60.5')],
    cabin: [...shelterWindow,ceiling,sillLight],
    forest: [gullyLeaves,fall,pool,
      area('ferns on the nearest bank','grass',.75,'0,86.3 3,85.5 6.5,84.5 9.3,86 13.2,91 11.1,96.4 6.7,98.5 0,95.8')],
    charcoal: [gullyLeaves,fall,pool,
      area('ferns beside the charcoal hollow','grass',1,'87.5,52.6 90.1,49.4 93.3,51.1 96.2,47.6 99.8,45.9 99.8,57.2 95,59.3 90.1,58')],
    forge: [
      light('cool spill from the open forge door',6.1,65,5.8,1.25,'175,196,191','window',-.09),
      area('water through the forge door','surf',.63,'0,47.6 8.5,47.5 7,50.2 6,52.1 3.7,54.6 1.8,56.4 0,57'),
      area('loose edge of the smithy curtain','rag',.56,'97.3,19 100,21.1 100,55.2 99,54.6 98.3,56.1 96.6,53.2')],
    slipway: [cove,area('clouds above the bay','cloud',.9,'0,0 38,0 37,6.3 31.3,9.2 18.5,20.7 14.5,20.7 11,24.6 0,24.3'),
      area('wind in the boathouse tree','bough',.88,'41.7,0 76,0 75,6.8 69,9.7 66.3,15.4 57,12.5 52,17.6 47.2,18.4 49,12.4 43.3,11.5 45.5,6.7 39.3,7.5')],
    salvage: [area('clouds seen above the stripped stern','cloud',1.07,'67,0 100,0 100,9.3 88.7,13.6 84,18.1 78.2,20 74.1,16 72.6,11'),
      wreckSea,
      area('streamers on the empty rail','rag',1.44,'25.4,7 29.8,10.6 34.3,10.8 33,18.4 32,22.6 31,23.3 30.4,27.5 30,20.1 28.2,28.8 27.4,25.5 27,15.3')],
    crossing: [area('squall off the port bow','cloud',1.24,'0,0 39,0 33.8,11 29.6,27.6 24.8,42.6 13.2,44.5 0,43.9'), ...openSea],
    harbour: [
      area('western sky at sundown','cloud',.77,'0,0 57,0 50,7 42,15 35,24.5 29.8,31.4 27.7,19.7 23,30.8 18.6,39 12,41.4 0,42'),
      area('sun path and water ahead of the cutter','gold',1.02,'0,45 23.2,45.3 23.1,49.8 16.4,52.1 11.4,52.8 10.1,56.1 10.7,60.2 9.7,66.1 4.5,67.1 1.7,65.4 0,65.5'),
      area('backwash abaft the cutter','current',.95,'55,56.7 66.7,55 68.5,58 67.1,60.7 62,65.6 55.2,67 55,63.6 56,61.4')],
    chartroom: [
      area('harbour through west window','sea',.49,'4.7,31.5 10.8,31.5 10.8,38 4.7,38'),
      area('harbour through east window','sea',.49,'12.4,31.5 18.2,31.5 18.2,37.9 12.4,37.9'),
      area('lifted corner of the working chart','page',.98,'59.9,43.9 66.5,42.8 69.3,43.9 72.8,47.8 72.6,49.1 68,49.2 64.1,48.9 59.5,48.5'),
      light('water light on the chart',35,46.3,12,2.8,'212,211,168','window',-.08),
      light('silver light below the sash',11.6,41.1,10.5,.81,'182,196,192','window',-.036)],
    landing: [
      area('cloud bank over the inlet','cloud',.78,'0,0 67,0 65,6.3 55,12.2 40,16.5 33.7,19 26,21.7 11.6,19.7 3.1,17.5 0,18'),
      area('tidal reach behind the dinghy','sea',1.04,'13.6,31 74,32.7 73.6,46.9 63.3,51.7 55.2,51.7 54.7,45.9 52,44 45.9,47.6 20.8,48.1 18.4,52.1 14.4,55.2 5.7,54.3 2,51 0,52 0,36.5 7.6,36.5 13,34.5'),
      area('grass above the mooring post','grass',.88,'90.8,43.7 94.8,40 96.7,38.7 100,36.1 100,49.7 97,52.9 92,54 89,53.7')],
    return_camp: [...shelterWindow,ceiling,hearth,sillLight,reflectedFire]
  };
  // These are surfaces that can receive moving daylight. Sampling the actual
  // colour and grain of their paint keeps the light on the boulders and path.
  const daylight={
    beach:area('passing sun across the schist','daylight',1.1,'32,51.1 41.5,42.7 48.4,43 62.7,37.9 70.9,41 64.5,48.1 54.2,53.2 49.6,61.6 40.5,60.4 31.2,65.7 28.3,63.5'),
    camp:area('leaves casting shade over the fire ring','daylight',.9,'13.6,62.1 19.1,56.3 33.6,55.6 42.7,53.2 49,55.7 44.2,62.9 38.3,68.8 27.6,73 17.2,72.4 11.2,68.9'),
    forest:area('dapple below the far branches','daylight',.63,'27.7,42.1 39.4,32.6 48.6,34.9 46.6,42.8 42.3,48.2 41,53.6 34.7,59.8 32,53.4'),
    charcoal:area('light crossing the bank of the pit','daylight',.83,'42,54 53.3,43.6 63.3,43.3 69.5,46.6 72.3,49.3 64.2,52.6 57.4,54.8 49.9,59.6 43.4,59.6'),
    slipway:area('changing light on the woodpile','daylight',.9,'2.1,48.9 4,43.7 7.3,42.4 9.4,49.9 17.9,49.8 20.1,54.4 22,57.5 20,60.2 11.7,63.4 7,64.3'),
    landing:area('silver light on the wet shingle','daylight',.8,'6.7,60.4 21,61.1 34,61.4 48.9,60.9 56.3,57.8 61.5,60.1 52.5,64.6 35.8,66.8 19.4,67.8 9.8,65.6')
  };
  function describe(state) {
    const f=state.flags || {}, layers=[...(paintings[state.scene] || [])];
    if(daylight[state.scene])layers.push(daylight[state.scene]);
    switch(state.scene) {
      case 'camp':
        if(f.shelterBuilt) layers.push(area('belly of the shelter sail','canvas',.93,'60.4,53.6 65.4,43.2 68,37.2 80.9,34.5 82,35 80.8,44.8 79.6,54.4 73.3,53.9 66.8,53.7'));
        if(f.fireLit) layers.push(light('fire reflected by the ring stones',26.1,65.9,8,1.8,'254,159,65','fire'));
        break;
      case 'cabin':
        if(f.roofSealed) layers[layers.indexOf(ceiling)]={...ceiling,power:.13};
        if(f.warmthReady) layers.push(hearth,reflectedFire);
        break;
      case 'forge':
        if(f.forgeLit) layers.push(area('hot bed above the stone lip','coals',1,'34.4,45.8 35.7,43 39,41.8 42.3,41.8 45.4,43.3 47,46.5 45.4,47.3 36,47.1'),
          light('coal light on the smithy floor',40.8,67.2,18,3.2,'243,124,49','fire'));
        break;
      case 'slipway':
        if(f.sailRigged) layers.push(area('new sail drawing on the stocks','canvas',1.28,'63.8,19.7 66,25.4 72.6,33.4 80.7,39.8 75.3,40.2 66.7,41.2 64.1,42.2'));
        break;
      case 'crossing':
        layers.push(area('sail drawing against its shrouds','canvas',f.sailMended ? .64 : f.rigSecured?1.04:1.57,'49.5,0 96,0 92.5,7.5 81,15.7 67.4,22.6 48.6,31.6 49.3,20.8'));
        if(!f.boatDry) layers.push(area('standing water on the deck','bilge',1,'36.5,79.1 55,74.9 71.2,74.4 81.9,76.6 78,80 61,82.5 46.3,82.1'));
        break;
      case 'landing':
        if(f.landingMarked) layers.push(light('lantern cast toward the tied boat',75,55.7,2,5.8,'231,171,85','fire',.06));
        break;
    }
    return layers;
  }

  // Capture the paint once per plate or state change. A feathered matte on
  // each small swatch lets it move over the unbroken stationary illustration.
  function swatch(doc, image, part, index) {
    if(!part.points) return {...part,phase:index*.91};
    const px=part.points.map(([x,y])=>[x*W/100,y*H/100]);
    const x=Math.max(0,Math.floor(Math.min(...px.map(p=>p[0])))-2);
    const y=Math.max(0,Math.floor(Math.min(...px.map(p=>p[1])))-2);
    const w=Math.min(W-x,Math.ceil(Math.max(...px.map(p=>p[0])))-x+2);
    const h=Math.min(Math.ceil(H-y),Math.ceil(Math.max(...px.map(p=>p[1])))-y+2);
    const paper=doc.createElement('canvas');paper.width=w;paper.height=h;
    const pen=paper.getContext('2d');
    if(!pen) return null;
    const mat=doc.createElement('canvas');mat.width=w;mat.height=h;
    const mask=mat.getContext('2d');
    if(!mask) return null;
    mask.filter='blur('+(part.kind==='daylight'?6:part.kind==='cloud'?4.5:part.kind==='bough'?2.5:1.2)+'px)';
    mask.beginPath();px.forEach(([u,v],i)=>i?mask.lineTo(u-x,v-y):mask.moveTo(u-x,v-y));mask.closePath();mask.fill();
    pen.drawImage(image,0,0,image.naturalWidth||image.width,image.naturalHeight||image.height,-x,-y,W,H);
    if(part.kind==='daylight'){
      pen.globalCompositeOperation='soft-light';
      pen.fillStyle='#fff2ba';pen.fillRect(0,0,w,h);
    }
    pen.globalCompositeOperation='destination-in';pen.drawImage(mat,0,0);
    const flecks=[];
    // A specular mark must live on the particular body of water, including
    // when that body wraps around a gunwale or entirely surrounds a tiny rock.
    if(['surf','gold','sea','ocean','current','fall','coals','fire','bilge'].includes(part.kind)){
      const step=part.kind==='ocean'?12:part.kind==='gold'?16:part.kind==='fall'?5:7;
      for(let i=0;i<step*6 && flecks.length<step;i++){
        let u=.04+.92*hash(23*index+5*i+13),v=.13+.71*hash(13*index+3*i+27);
        if(part.kind==='gold') u=.08+.59*u;
        const cx=u*w,cy=v*h;
        if(inside(cx+x,cy+y,px))flecks.push({u,v,s:hash(18+i*7),phase:TAU*hash(3+i*37)});
      }
    }
    return {...part,paper,x,y,w,h,phase:hash(index*31+11)*TAU,flecks};
  }
  const hash=n=>{const s=Math.sin(174.83+n*77.17)*43758.5453;return s-Math.floor(s);};
  function inside(x,y,poly){
    let match=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const [ax,ay]=poly[i],[bx,by]=poly[j];
      if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)match=!match;
    }
    return match;
  }
  function prepare(doc,image,layers){
    return layers.map((part,i)=>swatch(doc,image,part,i)).filter(Boolean);
  }

  function illumination(ctx,m,t) {
    const ember=m.kind==='fire';
    const shimmer=ember ? .57+.15*Math.sin(3.53*t)+.1*Math.sin(5.37*t+.6)+.06*Math.sin(8.9*t) :
      .52+.32*Math.sin(1.32*t+m.phase)+.12*Math.sin(2.14*t+m.phase);
    ctx.save();ctx.translate(m.x*10,m.y*H/100);ctx.rotate(m.angle);
    ctx.scale(m.w*10*(.9+.16*shimmer),m.h*H/100);
    const g=ctx.createRadialGradient(0,0,0,0,0,1);
    g.addColorStop(0,'rgba('+m.color+','+((ember ? .48 : .28)*shimmer)+')');g.addColorStop(1,'rgba('+m.color+',0)');
    ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  const liquid={sea:[4.1,1.15,1.28],surf:[7,2.85,1.6],gold:[3.7,1.6,1.13],ocean:[8.2,3.5,1.48],current:[4,1.02,1.72],bilge:[4.3,.64,1.6]};
  function water(ctx,m,t) {
    const [sweep,lift,rate]=liquid[m.kind], speed=t*rate+m.phase;
    // Different parts of the same wave arrive at the camera at different
    // times. Neighbouring strips share their vertical boundary exactly.
    const bands=Math.max(4,Math.min(19,Math.ceil(m.h/3.7)));
    let sourceY=0, destY=0;
    for(let i=0;i<bands;i++){
      const v=(i+1)/bands, edge=Math.round(v*m.h), depth=.32+.68*v;
      const roll=speed-9*v;
      const dy=lift*m.power*depth*(Math.sin(roll)+.28*Math.sin(1.7*roll+.3));
      const newY=edge+dy;
      const dx=sweep*m.power*depth*(Math.sin(roll+.9)+.25*Math.sin(roll*1.77-1.5));
      ctx.drawImage(m.paper,0,sourceY,m.w,edge-sourceY,m.x+dx,m.y+destY,m.w,Math.max(.1,newY-destY+.3));
      sourceY=edge;destY=newY;
    }
  }
  // A few explicitly placed wave fronts turn white at the reef, then pull
  // back. Their bends follow the shingle or the open wave in the painting.
  const wavefronts={
    'south coast surf':[[0,55.1,5.5,54.2,11.2,51.2,16.4,51.8],[0,61.2,3.5,60.5,6.8,57.4,10.9,57.1],[12,48.4,15.4,46.9,20.8,48.4,24.4,47.5]],
    'surge on the broken bow':[[0,58.4,2.7,58.9,5.7,56.9,9.4,56.8],[0,68.1,2.4,66.9,4.9,67.5,6.7,64.5]],
    'swells abaft the mast':[[49,55.9,55,54.8,57.7,51.6,63.8,51.8],[68,53,74.1,54.3,77.4,48.7,84.5,48.9],[82.8,56.2,87.4,57,91.4,52.7,95.9,53.3]],
    'open sea to port':[[0,47.5,4.4,46.2,9,48.7,13.6,48.9],[9.8,50.8,14.4,49.5,19.5,54.3,24.8,52.8]],
    'tidal reach behind the dinghy':[[0,52.7,5.1,54.5,11.6,51.7,17.9,51.8],[54.5,50.2,59.4,51.8,63.8,49.7,67.7,49.2]],
    'water off the stocks':[[2.5,37.6,7.3,37.7,11,37.3,15.8,36.7]],
    'water through the forge door':[[0,52.5,1.3,51.7,3.4,51.4,5.2,50.6]]
  };
  function breaking(ctx,m,t){
    const fronts=wavefronts[m.name];
    if(!fronts)return;
    const rough=m.kind==='ocean'||m.kind==='surf';
    for(const [i,c] of fronts.entries()){
      const phase=t*(rough?1.16:.8)+m.phase+i*2.23;
      const arrive=.5+.5*Math.sin(phase), lift=arrive*arrive;
      if(lift<.06)continue;
      ctx.save();
      ctx.translate(1.5*m.power*Math.sin(phase-.6),(lift-.35)*(rough?4.8:1.7));
      // Broken teeth of foam sit just in front of a broader blue-green lip.
      ctx.beginPath();ctx.moveTo(c[0]*10,c[1]*H/100);
      ctx.bezierCurveTo(c[2]*10,c[3]*H/100,c[4]*10,c[5]*H/100,c[6]*10,c[7]*H/100);
      ctx.globalAlpha=.21*lift;ctx.lineWidth=rough?3.3:1.65;ctx.strokeStyle='#738e91';ctx.stroke();
      ctx.globalAlpha=(rough ? .62 : .37)*lift;ctx.strokeStyle='#e2e7dc';
      ctx.lineWidth=rough?1.37:.84;ctx.lineCap='round';ctx.setLineDash(rough?[7,2,3,1.7,13,3,4,3,2,4]:[8,4,11,4]);ctx.lineDashOffset=-t*(rough?3.8:1.8);ctx.stroke();
      ctx.restore();
    }
  }
  // Work in local swatch coordinates. Each crest is a few linked opaque and
  // broken brush marks, brightening only as the moving wave turns into light.
  function glints(ctx,m,t) {
    const gold=m.kind==='gold',large=m.kind==='ocean'||m.kind==='surf',fire=m.kind==='fire'||m.kind==='coals';
    ctx.save();
    ctx.beginPath();m.points.forEach(([u,v],i)=>i?ctx.lineTo(u*10,v*H/100):ctx.moveTo(u*10,v*H/100));ctx.closePath();ctx.clip();
    breaking(ctx,m,t);
    for(const f of m.flecks) {
      const rate=fire?3.2:m.kind==='fall'?3.4:gold?1.15:1.32;
      const phase=t*rate+f.phase, crest=Math.sin(phase);
      if(crest<-.14)continue;
      const shine=(crest+.14)/1.14;
      let x=m.x+f.u*m.w+Math.sin(phase-.8)*m.power*(large?5:2),y=m.y+f.v*m.h;
      if(fire){
        const scale=m.kind==='fire'?1.6:1;
        ctx.fillStyle=f.s>.48?'#ffad4e':'#ffdc86';ctx.globalAlpha=(.24+.51*f.s)*shine;
        ctx.beginPath();ctx.ellipse(x,y-Math.sin(phase)*scale,.7+f.s*1.3,(.9+shine*1.5)*scale,0,0,TAU);ctx.fill();continue;
      }
      if(m.kind==='fall'){
        y+=5*Math.sin(phase);ctx.strokeStyle='#e6e9de';ctx.globalAlpha=shine*.7;
        ctx.lineWidth=.75+.55*f.s;ctx.beginPath();ctx.moveTo(x,y-3);ctx.quadraticCurveTo(x+.2,y+1.9,x+1.3,y+3+f.s*4.6);ctx.stroke();continue;
      }
      y+=Math.sin(phase)*m.power*(large?1.7:.8);
      const span=Math.min(m.w*.24,(gold?14:large?18:6.5)*(f.s+.38)*(.55+.45*shine));
      const rise=large?1.3+.9*f.s:.26+.38*f.s;
      ctx.globalAlpha=(gold ? .76 : large ? .55 : .47)*shine;
      ctx.fillStyle=gold?'#ffe0a3':m.kind==='bilge'?'#b9ced2':'#d3ded9';
      ctx.beginPath();ctx.moveTo(x-span*.57,y+rise*.4);
      ctx.quadraticCurveTo(x-span*.21,y-rise*.82,x+span*.07,y-rise);
      ctx.quadraticCurveTo(x+span*.27,y-rise*.87,x+span*.54,y-rise*.25);
      ctx.quadraticCurveTo(x+span*.19,y-rise*.46,x+span*.03,y+(large ? .54 : .32));
      ctx.closePath();ctx.fill();
      if(f.s>.52){
        ctx.globalAlpha*=.62;ctx.fillRect(x+span*.62,y-.15,span*.21,.66);
      }
    }
    ctx.restore();
  }
  function flexible(ctx,m,t,gust) {
    const breeze=.63*Math.sin(t*1.28+m.phase)+.25*Math.sin(t*2.15+m.phase)+.12*Math.sin(t*3.26+m.phase*.5);
    const strength=m.power*(.59+gust*.67);
    ctx.save();
    if(m.kind==='daylight'){
      const bands=Math.max(4,Math.min(20,Math.ceil(m.w/12)));
      for(let i=0;i<bands;i++){
        const u=i/bands, left=Math.round(u*m.w),right=Math.round((i+1)*m.w/bands);
        const ray=.5+.5*Math.sin(t*.58-4.6*u+m.phase);
        ctx.globalAlpha=m.power*(.09+.69*ray*ray);
        ctx.drawImage(m.paper,left,0,right-left,m.h,m.x+left,m.y,right-left+.12,m.h);
      }
      ctx.restore();return;
    }
    if(m.kind==='cloud'){
      const tide=Math.sin(t*.28+m.phase), drift=(9.7*tide+4.3*Math.sin(t*.46+m.phase))*strength;
      ctx.globalAlpha=.82;ctx.drawImage(m.paper,m.x+drift,m.y+2.1*tide);ctx.restore();return;
    }
    if(m.kind==='bough'||m.kind==='grass'){
      const grass=m.kind==='grass';
      ctx.translate(m.x+m.w*.45,m.y+m.h);
      ctx.transform(1,0,-(grass ? .125 : .052)*strength*breeze,1+.008*strength*breeze,0,0);
      ctx.drawImage(m.paper,-m.w*.45,-m.h);ctx.restore();return;
    }
    if(m.kind==='page'){
      // The weight of the sheet holds the west edge. Only the last few
      // centimetres lift when a draught reaches the free corner.
      const lift=Math.pow(.5+.5*Math.sin(t*.94+m.phase),3);
      for(let i=0;i<10;i++){
        const u=(i+.5)/10,a=Math.round(i*m.w/10),b=Math.round((i+1)*m.w/10);
        const rise=(2.6+.74*breeze)*lift*u*u*m.power;
        ctx.drawImage(m.paper,a,0,b-a,m.h,m.x+a,m.y-rise,b-a+.16,m.h);
      }
      ctx.restore();return;
    }
    if(m.kind==='fall'){
      const flow=(t*.96)%1;
      ctx.globalAlpha=Math.sin(Math.PI*flow)*.95;
      ctx.drawImage(m.paper,m.x+flow*1.0,m.y+flow*7.4);ctx.restore();return;
    }
    if(m.kind==='fire'||m.kind==='coals'){
      const pulse=.64*Math.sin(t*5.4)+.23*Math.sin(t*8.2)+.13*Math.sin(t*3.37);
      ctx.translate(m.x+m.w/2,m.y+m.h);
      ctx.transform(1+.034*pulse,0,.045*pulse,1+(m.kind==='fire' ? .14 : .037)*pulse,0,0);
      ctx.drawImage(m.paper,-m.w/2,-m.h);ctx.restore();return;
    }
    // The head of a hanging rag is fast. The belly of a sail is fast at head
    // and foot. A travelling fold between those attachments catches the gust.
    const bands=12;
    for(let i=0;i<bands;i++){
      const a=Math.round(i*m.h/bands),b=Math.round((i+1)*m.h/bands),v=(i+.5)/bands;
      if(b<=a)continue;
      const bellying=m.kind==='rag'?v:Math.sin(Math.PI*v);
      const dx=strength*bellying*(m.kind==='rag'?4.8:3.9)*(breeze+.53*Math.sin(t*2.5-v*5+m.phase));
      ctx.drawImage(m.paper,0,a,m.w,b-a,m.x+dx,m.y+a,m.w,b-a+.22);
    }
    ctx.restore();
  }
  function paint(ctx,parts,time,gust) {
    for(const m of parts){
      if(!m.paper){illumination(ctx,m,time);continue;}
      if(liquid[m.kind])water(ctx,m,time);else flexible(ctx,m,time,gust);
      if(m.flecks.length)glints(ctx,m,time);
    }
  }
  return {describe,prepare,paint};
});

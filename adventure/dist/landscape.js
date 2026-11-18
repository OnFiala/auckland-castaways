/* Transparent marks drawn in registration with the plate. This painter only
   receives geometry. It has no plate handle, bitmap or offscreen surfaces. */
(function (host, factory) {
  const landscape = factory();
  if (typeof module === 'object' && module.exports) module.exports = landscape;
  else host.CastawayLandscape = landscape;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const WIDTH = 1000, HEIGHT = 562.5, X = WIDTH/100, Y = HEIGHT/100, TAU = Math.PI*2;
  const unit = n => n-Math.floor(n);
  const pulse = n => Math.sin(Math.PI*Math.max(0,Math.min(1,n)));
  const noise = n => unit(Math.sin(n*78.237+31.43)*47297.33);
  const points = text => text.split(' ').map(pair => pair.split(',').map(Number));
  const rect = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  const area = (name,kind,outline,extra={}) => ({name,kind,points:points(outline),...extra});
  const pane = (name,box,extra={}) => ({name,kind:'water',points:rect(...box),...extra});
  const water = (name,outline,style,breakers=[],holes=[]) =>
    area(name,'water',outline,{style,breakers,holes:holes.map(points)});
  const cloud = (name,outline) => area(name,'cloud',outline);
  const leaves = (name,outline,tips,grass=false) => area(name,'leaves',outline,{tips,grass});
  const glow = (name,kind,x,y,w,h) => ({name,kind,points:rect(x-w,y-h,2*w,2*h),x,y,w,h});
  const cloth = (name,outline,power) => area(name,'cloth',outline,{power});
  // A train starts at (x,y), travels (dx,dy) over one period, and has its
  // crest oriented along (span,slope). All dimensions here are % of the plate.
  const front = (x,y,dx,dy,span,slope,period,phase) => ({x,y,dx,dy,span,slope,period,phase});
  const harbourPeriod = 8.6;
  // January shore. The distant wreck and black reef break the skyline at
  // 59%; the flats below the tongue of surf reflect light but are firm sand.
  const shore = water('outer surf off the wreck',
    '0,60.1 9.5,60.1 17.7,60.2 23.6,60.35 31.2,60.5 39.5,60.65 44.2,60.8 42.7,62.5 40.8,64.2 36,64.8 29.3,65.15 21,65.9 13.2,66.8 6,67.3 0,68.3','reef',
    [front(9.2,60.7,2.1,3.9,23,-.45,7.8),front(28.1,60.9,2.4,2.9,21,-.28,9.9),
     front(2.6,63.1,1.9,4,20,-1.4,8.7),front(19.1,62.3,2.3,2.6,25,-1.6,10.4)]);
  const washLine=water('thin water over the flat sand',
    '0,66.6 6,66.1 13,65.6 20,65.2 31.5,64.8 39.5,64.4 40.5,64.8 36.3,65.3 27,66.1 17,67.1 6,68.8 0,69.5','shoal',
    [front(7.5,66.2,1,1.8,23,-2.6,10.4,.17),front(27.8,64.7,2.3,1.1,19,-1.4,9.9,.14)]);
  const brokenBow=water('surge on the broken bow',
    '0,43 4.5,43 5,47.6 5.7,51.9 6.5,56 7.6,60.1 8.9,64 10.1,68.6 11.6,72.8 12.7,75.1 11.3,75.6 8.5,75.9 5.6,77.1 3.1,77.1 1.2,78.7 0,78.7','reef',
    [front(1.6,47.6,.9,7.4,10,-.5,7.2),front(2.5,54.8,1.2,8.8,10,-.8,8.3),
     front(4.5,63.2,1.2,10.2,12,-1.6,9.1)],
    ['0,70 0.5,70 1,69.1 1.7,68.4 2.6,67.9 3.2,67.7 3.9,68 4.9,68.8 5.4,69.1 6.1,70.2 7.3,71.2 7.3,72.1 0.3,72.2 0,71.9',
     '5.1,68.4 5.5,67.2 6.5,66.1 7.2,65.2 8,65.2 8.5,65.7 9.1,65.4 9.5,65.4 10.1,65.9 11.1,67.3 11,69.7 8.3,70.1 6.3,69.9 5.1,69.7',
     '0,74.6 0.7,74.1 1.1,74.3 1.8,74.1 2.3,73.7 3,73.2 3.5,73.2 3.9,73.9 3.6,75.8 3.2,78.1 0,79',
     '5.3,78.2 6.6,76.5 9.8,75.8 10.8,76.4 12.1,76.7 13,77.8 10.6,79']);
  const sternWater=water('water through the stern gap',
    '69,44.3 79.9,44.4 78.7,46.4 76.6,48 75.6,49.7 71.1,50.1 68.9,50.1 69.15,48','ocean',
    [front(73.8,45.4,1.6,3,10,-.6,8.6)]);
  const headland=cloud('light through the bank over the wreck','0,0 55,0 50,11 49,25 43,37 23,42.5 6,49 0,49');
  const cabinWindow = [pane('water in the western pane',[14.7,35.7,6.1,2.1],{style:'glass'}),
    pane('water in the eastern pane',[22.2,35.4,5.7,2.1],{style:'glass'})];
  const roof = cloth('seam under the sailcloth roof','43,0 79,0 76,7 66,19 55,15 46,10',.69);
  const fire = glow('flame at the grate','hearth',11.7,61.2,3.1,5.3);
  const reflection = glow('hearth light on the floor','reflection',14.3,69.6,10.8,2.05);
  const sill = glow('light returning from the glass','sill',22,39.3,7.1,.69);
  const fallingLeaves = (name,outline,lanes,color) => area(name,'litter',outline,{lanes,color});
  const gully = [
    leaves('ferns beneath the near tree','5.5,56.8 13.8,52.8 18.1,54.9 16.8,62 11.3,62.6',
      [[12.5,57.1,1],[14.7,55.2,-1],[15.8,57.9,1]],true),
    leaves('leaves at the edge of the winter canopy','27.9,12 32,9.8 37.9,7.6 40,8.7 37.4,16 30.8,18.3 28.4,17.4',
      [[35.2,12.4,1],[36.7,11.7,-1],[32.5,14.7,1]]),
    area('western ribbon of the fall','run','19.03,50.3 19.54,50.3 19.83,55.5 19.85,64.8 19.39,64.8 19.38,56.3',
      {lanes:['19.28,50.5 19.59,54.5 19.53,60.8 19.61,64.9'],fall:true,spread:1.8}),
    area('eastern ribbon of the fall','run','20.42,50.4 20.77,50.4 21.02,55.8 21.04,64.9 20.61,64.9 20.53,54.3',
      {lanes:['20.43,50.6 20.73,54.4 20.84,60.3 20.85,64.9'],fall:true,spread:2.1}),
    area('pool fed by the ribbons','run','16.7,65.7 20,65.3 25.8,65.4 28.7,65.9 30,66.9 29.7,68.2 26.9,69.1 20.5,69.6 17.9,69 16.6,67.4',
      {lanes:['19.6,65.8 20.8,66.2 22.4,66.8 26.6,66.6','20.8,66.0 21.5,67.5 23.2,67.9 28.5,68.1'],ripples:[[19.7,65.8],[20.8,65.8]]}),
    fallingLeaves('windfall leaves in the open gully','39,33 50,33 58,61 57,64 43,60 40,48',
      ['42,35 44,44 49,52 50.3,60','47.1,36 46.2,45 54.4,50.1 53.9,59.1'],'#8d9153'),
    leaves('golden fern beside the path','0,82 9,81 15,88 12,97 0,97',
      [[3.3,87,1],[8.3,84.8,-1],[8.8,90.5,.65]],true)
  ];
  const beam = (name,outline) => area(name,'motes',outline);
  const hollow = [
    leaves('fronds on the edge of the hollow','85,78 99,77 100,94 86,98',
      [[91.4,84,1],[90.9,87.2,-1],[95.3,88,-1]],true),
    area('upper spill in the charcoal brook','run','19.5,53.5 20,53.4 21.8,55.3 22.3,58.6 22.3,60.6 21.5,60.6 21.2,57.6 20.6,55.9',
      {lanes:['19.8,53.8 21.7,55.2 21.5,57.3 22.1,60.4'],fall:true,spread:1.9}),
    area('lower spill in the charcoal brook','run','22.8,62.1 23.9,62.3 24.5,63.7 24.7,66.6 24.2,67 23.8,65.6 23.5,63.5',
      {lanes:['23.4,62.5 24.3,63.1 24.2,65.3 24.4,66.7'],fall:true,spread:2}),
    area('eddy below the charcoal bank','run','21.8,67.6 24,66.7 27.3,67.2 29.2,68.1 29,69 25.3,68.8 23.2,68.5',
      {lanes:['22.8,67.7 24.6,67.1 26.4,67.9 28.4,68.2'],ripples:[[24.4,67.2]]}),
    fallingLeaves('fallen leaves turning in the lee','40,32 48,31 55,52 58,64 46,62 40,48',
      ['41.5,35.6 43.8,44 45.5,53.4 50.4,61'],'#ab9252')
  ];
  const offshore = [
    water('open sea to port','0,42.8 30.35,42.7 29.1,46.4 28.7,49 26.4,57.1 26,59.1 20.8,58.8 20.4,55.4 19.8,54 17.4,53.9 17.1,55.2 14.6,53 10.4,51 7.6,50.5 5.1,50.8 2.9,51.8 2.3,52.5 2.1,53.9 2.6,54.9 4.9,53.8 7.4,53.2 10,53.9 13.7,55.5 16.5,57.8 16.4,58.4 11.1,58.7 8.8,59.1 5.4,60.3 2.2,62.4 0,64','ocean',
      [front(9.6,44,2.6,4.7,24,1.1,9.9),front(19,46.6,1.8,5,17,-2,11)]),
    water('sea between the stays','33.6,42.7 41.05,42.7 40.1,56.4 39.7,59.65 30,59.55 30.3,58.5 30.9,56 31.6,53.2 32.1,49.8 32.7,48 33.1,45.5','ocean',
      [front(34,45,1,5.6,13,-1.5,9.4)]),
    {...water('swells abaft the mast','44.7,42.65 49.7,42.1 56,42.1 61.8,41.7 67.4,40.7 69.5,39.7 71.2,39.4 73.8,40.0 76.3,39.9 81,40.6 84,40.5 88.7,40.9 90.5,41 91.4,46.5 91.8,49.5 89,50.7 85.4,51.6 85.1,52.5 85.5,53.2 87,53.1 85.3,54.4 77,56.7 68,57.8 58,58.7 49,59.5 44.3,59.55','ocean',
      [front(55,48.9,2.7,5.9,20,-3.7,11.5),front(79,44.8,2.9,5.4,17,-2.6,12.4)]),
      lip:'47.1,52.6 56.3,49.1 67.4,40.4 71,39.5'},
    water('sea forward of the sheet','91.7,41.2 100,40.7 100,44.3 97.6,47.5 95.3,49.8 93.1,51 92.9,48.2','ocean',
      [front(95,42.4,.8,3,7.5,-.7,10.7)])
  ];
  const hull=[cloud('clouds astern','63.8,0 100,0 100,9 85,16.2 72,22.6 65.9,25'),brokenBow,sternWater];
  const paintings = {
    beach:[headland,shore,washLine,leaves('grass above the sand at the path',
      '90.7,62.4 98.9,58.1 100,59 100,66.9 92.5,69 90.5,68',
      [[95.2,64.3,1],[96.5,64.1,-1],[98.2,62.9,1]],true)],
    wreck:[...hull,cloth('torn canvas on the rail','25.5,11.6 28.2,13.2 34.3,16.2 37.5,15.2 35.7,19.1 34.6,24.1 31.4,21.3 28,18',.85)],
    salvage:[...hull],
    camp:[cloud('cloud through the canopy','35,3 47,0 51,0 46,14 41,18'),
      water('inlet beyond the clearing','22,33.1 32,33 32.7,34 29.1,36.4 24,39.4 23.2,38.7','sheltered'),
      pane('sun in the second inlet',[53.6,34.1,6.5,1.4],{style:'sheltered'}),
      leaves('leaves at the clearing','3,0 24,0 38,16 38,22 27,16 21,21 13,18 6,13',
        [[31,15.2,1],[26.5,10.7,-1],[14.5,9.9,1],[19.7,15.5,-1]])],
    cabin:[...cabinWindow,roof,sill,beam('dust in the diagonal window beam','27,24 31,26 45,44 44,48 38,42 30,32')],
    return_camp:[...cabinWindow,roof,sill,fire,reflection,beam('motes over the warm table','29,31 34,33 44,46 40,48 33,40')],
    forest:gully,
    charcoal:hollow,
    forge:[water('water through the forge door','2.5,46 6.8,45.6 10.6,46.4 10.8,47.1 8.2,48.2 7.2,50 6,51.1 4.8,51.3 3.8,51.5 2.5,52.2','glass'),
      glow('daylight on the threshold','sill',5.7,65.4,4.4,1.1),
      beam('dust between the door and furnace','12,37 17,36.9 29,55 27.5,59 19,48')],
    slipway:[cloud('clouds above the cove','0,0 44.3,0 40.3,8.2 38,18.7 22,19.6 7,29.2 0,31'),
      water('water off the stocks','0,36.2 14,36.2 22.3,37.4 37,37.6 35.4,39.4 31,41.3 29,44 25.2,45.8 24.1,47.5 21.2,48.6 17.4,50.6 14.6,52.4 10.2,53.8 8.1,54.1 6,53.1 4,52.3 0,51.3','reef',
        [front(20,38.4,1.3,4,23,-.9,8.7),front(8.2,43.7,1.8,6,19,-1.6,10.1)],
        ['0,39.1 0.7,39.4 1.5,39.8 2.5,40 3.1,40.8 4,41.2 5.1,41.9 5.6,43 6.4,42.8 7.2,43.3 7.6,44 7.7,45.2 7.1,45.4 5.5,45.4 4.5,44.8 3.7,44.5 2.8,43.8 1.9,43.4 2.7,44.1 3.1,45 3.3,45.9 2.6,46.1 1.5,46.3 0.4,46.3 0,46.6',
         '0,50.6 0.5,50.4 1.1,49.4 1.9,48.9 2.3,49.1 1.6,51.1 2.3,51.3 2.7,52.6 3.6,52.6 4.4,53.1 4.8,54 5.4,54.4 6.8,54.7 7,55.7 0,55.7']),
      leaves('leaves above the stockyard','42,8.7 54.8,2.8 62.5,2.8 58.6,18.4 51.8,22.2 43.2,19.1',
        [[47.6,15.8,1],[54.7,12.8,-1],[52.9,19.3,1]])],
    crossing:[cloud('squalls off the port bow','0,0 33,0 27,30 22,42 0,42'),...offshore],
    harbour:[cloud('evening cloud over the harbour','0,0 56,0 44,13.4 33.2,23 27,27 23,17.6 19,30 0,39'),
      water('sun path beyond the cutter','0,47.6 19,47.6 15.2,54.1 11.8,53.3 10.7,54.4 7.9,58 4.4,60.4 3.7,59 1.5,59 1.3,61.5 0,61.5','gold',
        [front(6.9,48.4,-1,6.6,12,-.3,harbourPeriod)]),
      water('backwash abaft the cutter','56,54 61,55.7 64.6,56.8 66.4,59 65.8,62.3 61,63.2 58.2,61.7 56.4,59.6','sheltered',[],
        ['54.6,54.8 56.7,57.8 60.9,61.9 64.5,63.6 67.2,63.4 67.8,64.4 64.4,65.1 60.2,63.2 56.1,59.4 54.1,56.1'])],
    chartroom:[pane('harbour through west sash',[4.8,37.1,5.9,1.4],{style:'glass'}),pane('harbour through east sash',[12.6,37.1,5.1,1.4],{style:'glass'}),
      glow('silver light below the sash','sill',11.5,41,8,.8),glow('reflected harbour light on the chart','sill',34.5,46.8,8.8,1.3),
      beam('dust above the charts','15,26 18,25 39,39 35.9,42.1 24,35.8')],
    landing:[cloud('passing cloud over the inlet','0,0 65,0 54,11 25,20 0,17.4'),
      water('inlet inside the mooring','0,34 13,33.6 14.6,32.8 72.7,33.7 72.7,45 66.6,48.9 55.4,51 54.2,44.1 49,44.6 43,47 20,47 18.2,50.9 14.5,53.2 0,51.5','sheltered',
        [front(24,37.2,1.9,5,25,-.7,harbourPeriod,.42),front(60.5,40.8,1.4,4.4,20,-.8,harbourPeriod,.24)],
        ['5.9,31.2 13.4,31.3 13.2,34.5 8,35.2 5.9,34.3']),
      // The incoming crest reaches the hull after the two offshore fronts.
      // Its narrow footprint follows the water between the keel and the stones.
      water('shallow wash beside the keel','53.8,59.95 57,59.6 58.2,59.1 62.6,59.2 64.4,59.9 68.8,60.1 72.1,60 72.1,61.8 68.3,61.9 65.1,61.95 62.7,61.55 58.1,61.6 56.1,62.0 53.8,62.1','shoal',
        [front(61.4,59.95,1.7,1.59,20.1,-.23,harbourPeriod,.04)]),
      leaves('grass above the mooring','91,43.8 100,38 100,52 92,54',
        [[96,47.8,1],[97.8,46,-1],[94.2,49.9,1]],true)]
  };
  function describe(state) {
    const f=state.flags||{}, layers=[...(paintings[state.scene]||[])];
    switch(state.scene){
      case 'camp':
        if(f.shelterBuilt) layers.push(cloth('shelter sail','65,48 68,38 79.3,36 78.5,51.7 67,52',.54));
        if(f.fireLit) layers.push(glow('camp fire','hearth',27.5,65.5,2,2.3),glow('fire ring reflection','reflection',27.6,68.3,4.5,.9));
        break;
      case 'cabin':
        if(f.roofSealed) layers[layers.indexOf(roof)]={...roof,power:.12};
        if(f.warmthReady) layers.push(fire,reflection);
        break;
      case 'forge':
        if(f.forgeLit) layers.push(glow('furnace embers','coals',41.5,45.2,4.2,2.1),glow('furnace reflection','reflection',40,65.9,12.4,1.7));
        break;
      case 'slipway':
        if(f.sailRigged) layers.push(cloth('canvas on the stocks','65.3,13.8 65.6,42.8 44.4,40.9 54.1,28.8',.72));
        break;
      case 'crossing':
        layers.push(cloth('sail drawing overhead','48.2,0 97.2,0 94.2,11.8 79.4,16.6 64.1,24.2 47,30.5 48,17.6',f.sailMended ? .38 : f.rigSecured ? .82 : 1.35));
        if(!f.boatDry) layers.push(water('standing bilge water','55.8,79.5 61.6,78.8 65.2,78.3 70.8,78.2 74.8,78.1 78.3,78.4 77.2,80.1 72.6,82.5 68.3,84.4 64.7,84.8 62.4,84.0 61.3,82.6 59.8,81.6 57.5,80.9','bilge'));
        break;
      case 'landing':
        if(f.landingMarked) layers.push(glow('lantern on shingle','reflection',77.8,62.1,2.1,1.2),
          glow('light in the lantern glass','reflection',77.8,35.5,.65,.93));
        break;
    }
    return state.scene==='crossing'?layers.map(layer=>({...layer,windSign:-1})):layers;
  }

  function contains(x,y,poly) {
    let match=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const [ax,ay]=poly[i],[bx,by]=poly[j];
      if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax) match=!match;
    }
    return match;
  }
  function prepare(layers) {
    return layers.map(layer=>{
      const xs=layer.points.map(p=>p[0]), ys=layer.points.map(p=>p[1]);
      const left=Math.min(...xs), top=Math.min(...ys), w=Math.max(...xs)-left, h=Math.max(...ys)-top;
      const seed=Array.from(layer.name).reduce((n,s)=>((n*31)+s.charCodeAt(0))>>>0,23)%6857;
      const marks=[];
      if(layer.kind==='water'){
        const count=Math.min(27,Math.max(4,Math.ceil(w*h/27)));
        for(let i=0;i<count*12 && marks.length<count;i++){
          const x=left+w*noise(seed+9*i),y=top+h*noise(seed+9*i+1);
          if(contains(x,y,layer.points)&&!(layer.holes||[]).some(p=>contains(x,y,p)))
            marks.push({x:x*X,y:y*Y,size:noise(seed+9*i+2),p:noise(seed+9*i+3)});
        }
      }
      return {...layer,left:left*X,top:top*Y,width:w*X,height:h*Y,phase:noise(seed),marks,
        lip:layer.lip?points(layer.lip).map(([x,y])=>[x*X,y*Y]):null,
        lanes:layer.lanes?.map(lane=>points(lane).map(([x,y])=>[x*X,y*Y]))};
    });
  }
  function contour(ctx,poly) {
    poly.forEach(([x,y],i)=>i?ctx.lineTo(x*X,y*Y):ctx.moveTo(x*X,y*Y));
    ctx.closePath();
  }
  function clip(ctx,m) {
    ctx.beginPath();contour(ctx,m.points);ctx.clip();
    // Intersect the original matte with each hole's exterior. A hole which
    // crosses the shoreline cannot open a second island of visible paint.
    for(const hole of m.holes||[]){
      ctx.beginPath();ctx.rect(-1,-1,WIDTH+2,HEIGHT+2);contour(ctx,hole);ctx.clip('evenodd');
    }
  }
  function stroke(ctx,x,y,dx,dy,bend) {
    ctx.beginPath();ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+.48*dx,y+.48*dy-bend,x+dx,y+dy);ctx.stroke();
  }
  function pigment(ctx,x,y,w,h,rgb,alpha) {
    ctx.save();ctx.translate(x,y);ctx.scale(w,h);
    const wash=ctx.createRadialGradient(0,0,0,0,0,1);
    wash.addColorStop(0,'rgba('+rgb+','+alpha+')');wash.addColorStop(1,'rgba('+rgb+',0)');
    ctx.fillStyle=wash;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  function wave(ctx,m,b,index,t,gust) {
    const p=unit(t/b.period+(b.phase ?? m.phase+index*.37));
    const near=m.style==='reef', offshore=m.style==='ocean', rough=near||offshore;
    const power=rough?(near?5.1:6.4):1.65;
    const amplitude=pulse(p)*(.54+.55*gust);
    const width=b.span*X*(.38+.66*Math.sin(Math.PI*p));
    const peel=Math.max(0,Math.min(1,(p-.22)/.48));
    const centreX=(b.x+p*b.dx*(m.windSign||1))*X,centreY=(b.y+p*b.dy)*Y;
    const bottom=1.5+(rough?3.1:1.1)*amplitude;
    const gold=m.style==='gold';
    const samples=22;
    function edge(i){
      const u=i/samples;
      const envelope=Math.sin(Math.PI*u);
      const smallTeeth=.33*Math.sin(i*1.7+index)+.27*Math.cos(i*2.21);
      const lift=power*amplitude*envelope*(.56+.45*Math.sin(4.1*u+index+.7)+smallTeeth*.28);
      return [centreX+width*(u-.5),centreY+Y*b.slope*(u-.5)-lift];
    }
    const line=Array.from({length:samples+1},(_,i)=>edge(i));
    ctx.beginPath();ctx.moveTo(...line[0]);line.slice(1).forEach(v=>ctx.lineTo(...v));
    for(let i=samples;i>=0;i--)ctx.lineTo(line[i][0],line[i][1]+bottom*Math.sin(Math.PI*i/samples));
    ctx.closePath();ctx.globalAlpha=.44*amplitude;ctx.fillStyle=gold?'#b99d69':'#496e72';ctx.fill();
    const white=amplitude*(.22+.78*pulse((p-.16)/.83));
    ctx.strokeStyle=gold?'#f3d59b':m.style==='shoal'?'#e5d9ba':'#ecebd9';
    for(let i=1;i<samples;i++){
      const u=i/samples;
      const distance=Math.abs(u-(.12+.65*peel));
      const edgeLight=Math.max(0,1-distance/(.22+.28*peel))*white;
      if(edgeLight<.06 || (i+index)%7===0)continue;
      ctx.lineWidth=(rough?1.75:m.style==='shoal'?1.48:1.05)*(.58+.75*edgeLight);
      ctx.globalAlpha=Math.min(.94,edgeLight*(near?1.02:.88));
      stroke(ctx,...line[i-1],line[i][0]-line[i-1][0],line[i][1]-line[i-1][1],.42);
      // Breakers curl, burst leeward, then draw a thin ragged lace behind them.
      if(rough && gust>.54 && i%3===0 && p>.38 && p<.85){
        const spray=unit((p-.38)*3.3+i*.21);
        const height=(near?4.2:6.4)*(.66+.58*noise(i+index))*pulse(spray)*gust;
        ctx.globalAlpha=.76*edgeLight*pulse(spray);ctx.lineWidth=.85;
        const windSign=m.windSign||1, drift=spray*(near?6:12)*gust*windSign;
        stroke(ctx,line[i][0]+drift,line[i][1]-height,2.2*windSign,(2*spray-1)*.94,.19);
      }
      if(rough && i%4===0 && p>.47){
        ctx.globalAlpha=.54*edgeLight;ctx.lineWidth=1.1;
        stroke(ctx,line[i][0]+.4,line[i][1]+bottom,4+i%3,1,.7);
      }
    }
  }
  // The big July swell is painted into the sea. A short length of foam
  // spills down its actual lip, runs leeward and separates into small tails.
  function crest(ctx,lane,t,gust,windSign) {
    const phase=unit(t/10.8), centre=1.25*(windSign<0?1-phase:phase)-.12;
    for(let i=0;i<34;i++){
      const u=i/34, light=Math.max(0,1-Math.abs(u-centre)/.23)*Math.sin(Math.PI*u);
      if(light<=.03)continue;
      const [x,y]=bezier(lane,u),[ex,ey]=bezier(lane,(i+1)/34);
      const peel=unit(t*.28+i*.17),foam=Math.sin(Math.PI*peel);
      ctx.globalAlpha=.80*light;ctx.lineWidth=1.5+.8*foam;ctx.strokeStyle='#d9e2da';
      stroke(ctx,x,y+1.3,ex-x,ey-y,.7*foam);
      if(i%2===0){
        ctx.globalAlpha=.60*light*foam;
        ctx.strokeStyle='#d0dcd7';ctx.lineWidth=.93;
        stroke(ctx,x+peel*5*gust*windSign,y+2+peel*2,(2.3+4.8*peel)*windSign,1.7+2.8*peel,.48);
        if(gust>.76)stroke(ctx,x+peel*8*gust*windSign,y-5.8*foam,2.7*windSign,(2*peel-1)*1.35,.22);
      }
    }
  }
  function waterMarks(ctx,m,t,gust) {
    const windSign=m.windSign||1;
    if(m.lip)crest(ctx,m.lip,t,gust,windSign);
    (m.breakers||[]).forEach((b,i)=>wave(ctx,m,b,i,t,gust));
    const gold=m.style==='gold',glass=m.style==='glass',bilge=m.style==='bilge';
    const ocean=m.style==='ocean', rough=m.style==='reef'||ocean;
    for(const f of m.marks){
      const p=unit(t/(3.1+2.7*f.size)+f.p);
      const light=pulse(p);
      const length=(glass?6:ocean?12:rough?18:gold?17:10)*(.32+f.size)*(.42+.58*light);
      const x=f.x+windSign*(p-.5)*(glass?4:bilge?11:12+8*f.size);
      const y=f.y+(p-.5)*(rough?6:3)-light*(rough?1.35:.45);
      ctx.strokeStyle=gold?'#f5db99':bilge?'#c0c5b7':'#d8e3d9';
      ctx.globalAlpha=light*(gold ? .78 : glass ? .52 : ocean ? .34 : .53);
      ctx.lineWidth=(rough?1.25:1)*(.6+.62*f.size);
      const slope=ocean?-.16*length+(f.size-.4)*1.6:(f.size-.4)*(rough?1.9:.9);
      stroke(ctx,x-length*.5,y,length,slope,.35+light*.65);
    }
  }
  function bezier(lane,u) {
    const a=1-u,A=a*a*a,B=3*a*a*u,C=3*a*u*u,D=u*u*u;
    return [A*lane[0][0]+B*lane[1][0]+C*lane[2][0]+D*lane[3][0],
      A*lane[0][1]+B*lane[1][1]+C*lane[2][1]+D*lane[3][1]];
  }
  function flowing(ctx,m,t) {
    const vertical=m.fall;
    for(const [k,lane] of m.lanes.entries()){
      for(let i=0;i<(vertical?13:12);i++){
        const n=noise(29*i+3*k),p=unit(t/(vertical?1.1+n*.45:3.1+n*1.6)+i*.627+m.phase);
        const u=vertical?p*p:p;
        const ahead=Math.min(1,u+(vertical ? .09+.12*p : .025+.023*n));
        const a=bezier(lane,u),b=bezier(lane,ahead);
        const offset=(n-.5)*(m.spread||(vertical?4:6.3));
        const side=(noise(i+6)-.5)*1.4;
        const x=a[0]+(vertical?offset:side),y=a[1]+(vertical?side:offset);
        ctx.globalAlpha=(.50+.45*n)*pulse(p);
        ctx.strokeStyle=vertical?'#e8ebd8':i%4===0?'#a5b7a4':'#dce1ca';
        ctx.lineWidth=.84+1.1*n;
        stroke(ctx,x,y,b[0]-a[0],b[1]-a[1],vertical ? .24 : .43);
        if(!vertical && i%4===0) {
          ctx.fillStyle='#e6e3ce';ctx.beginPath();ctx.ellipse(x+3.1,y-.4,1.1,.56,0,0,TAU);ctx.fill();
        }
      }
      if(vertical){
        const [x,y]=lane[3],p=unit(t*.85+k*.44);
        ctx.strokeStyle='#d5e0cc';ctx.lineWidth=1;ctx.globalAlpha=.65*pulse(p);
        ctx.beginPath();ctx.ellipse(x+1,y-.7,1+6.1*p,.4+1.1*p,0,.23,Math.PI*1.56);ctx.stroke();
      }
    }
  }
  function poolRings(ctx,m,t){
    for(const [i,[x,y]] of (m.ripples||[]).entries()){
      const p=unit(t/(2.1+i*.21)+i*.61);
      ctx.strokeStyle='#d4e2ce';ctx.lineWidth=.95;
      ctx.globalAlpha=.66*pulse(p);
      ctx.beginPath();ctx.ellipse(x*X+2*p,y*Y+1.4*p,2.1+p*11,.5+p*2.3,0,.05,Math.PI*1.78);ctx.stroke();
    }
  }
  function litter(ctx,m,t){
    for(const [i,lane] of m.lanes.entries()){
      const p=unit(t/(11.7+2*i)+m.phase+.49*i);
      if(p>.68)continue;
      const u=p/.68,[x,y]=bezier(lane,u);
      const spin=Math.sin(u*15.3+i),glide=3.4*Math.sin(u*11.2+i);
      ctx.fillStyle=m.color;ctx.globalAlpha=.84*pulse(u);
      ctx.beginPath();ctx.ellipse(x+glide,y,2.4+1.4*Math.abs(spin),.64+1.01*Math.abs(spin),spin*.84,0,TAU);ctx.fill();
    }
  }
  function foliage(ctx,m,t,gust) {
    for(const [index,[u,v,d]] of m.tips.entries()){
      const x=u*X,y=v*Y;
      const wind=(.48+.48*Math.sin(t*1.51+.7*index)+.21*Math.sin(t*3.14+index))*gust;
      for(let k=0;k<3;k++){
        const rootX=x+(k-1)*(m.grass?2.3:3.4),rootY=y+.75*k;
        const length=(m.grass?9.8:5.8)*(1+.23*k);
        const dx=(m.grass?(k-.7)*2:2.2+.9*k)*d+wind*(m.grass?5.3:3.1);
        const dy=-length*(.71+.10*Math.sin(t*1.85+k*.35+index));
        ctx.fillStyle=m.grass?['#8c835a','#b1a474','#847b4e'][k]:['#7c824e','#92905b','#aba26c'][k];
        ctx.globalAlpha=m.grass ? .84 : .83;
        // Each blade attaches at a fixed painted point. There is no branch geometry.
        ctx.beginPath();ctx.moveTo(rootX,rootY);
        ctx.quadraticCurveTo(rootX+dx*.4-1.1,rootY+dy*.47,rootX+dx,rootY+dy);
        ctx.quadraticCurveTo(rootX+dx*.75+(m.grass ? .65 : 1.8),rootY+dy*.47,rootX,rootY);ctx.fill();
      }
    }
  }
  function illumination(ctx,m,t,shade) {
    const x=m.x*X,y=m.y*Y,w=m.w*X,h=m.h*Y;
    const flicker=.6+.16*Math.sin(4.1*t)+.12*Math.sin(6.7*t+.9)+.08*Math.cos(11.3*t);
    if(m.kind==='sill'||m.kind==='reflection'){
      const warm=m.kind==='reflection',v=warm?flicker:.85-.64*shade;
      pigment(ctx,x,y,w*(.89+.1*v),h,warm?'252,150,63':'199,210,193',(warm ? .44 : .33)*v);
      return;
    }
    const coals=m.kind==='coals';
    pigment(ctx,x,y+h*.15,w*.92,h*(coals ? .76 : 1),'255,154,54',.30+.32*flicker);
    for(let i=0;i<(coals?8:4);i++){
      const n=noise(i+31),p=unit(t/(.87+.45*n)+n);
      const cx=x+w*(n-.5)*1.44,cy=y+h*.47;
      ctx.globalAlpha=pulse(p)*(.56+.34*n);
      ctx.fillStyle=i%3===0?'#ffdf87':'#ffad49';
      if(coals){
        ctx.beginPath();ctx.ellipse(cx,cy-h*.22*n,1.4+2.3*n,.9+.72*n,0,0,TAU);ctx.fill();
      }else{
        const high=h*(.28+.78*pulse(p)),bend=2*Math.sin(t*4+i);
        ctx.beginPath();ctx.moveTo(cx-2,cy);ctx.quadraticCurveTo(cx-2.9,cy-high*.48,cx+bend,cy-high);
        ctx.quadraticCurveTo(cx+3.4,cy-high*.31,cx+2,cy);ctx.fill();
      }
      const rise=unit(t*.5+i*.34);
      if(i%3===0) {
        ctx.globalAlpha=.76*pulse(rise);ctx.fillStyle='#fac777';
        ctx.beginPath();ctx.ellipse(cx+rise*3,cy-rise*h*1.37,.86,.67,0,0,TAU);ctx.fill();
      }
    }
  }
  function dust(ctx,m,t,shade){
    const rgb='209,200,163';
    for(let i=0;i<8;i++){
      const p=unit(t/(7.3+2.4*noise(i))+m.phase+i*.381);
      const x=m.left+m.width*(.14+.68*p)+2.3*Math.sin(p*TAU+i);
      const y=m.top+m.height*(.12+.72*p+.11*Math.sin(p*TAU+i*.8));
      const opacity=(.72-.48*shade)*pulse(p)*(.65+.35*Math.sin(p*9+i));
      ctx.fillStyle='rgba('+rgb+','+opacity+')';
      ctx.beginPath();ctx.ellipse(x,y,.65+noise(i+3)*.6,.45+noise(i+1)*.45,0,0,TAU);ctx.fill();
    }
  }
  function airLight(ctx,m,t,gust,shade) {
    if(m.kind==='cloud') {
      // One soft bank drifts leeward over *open sky* as a shower arrives.
      // Light returns slowly in the same aperture. No global plate filter.
      const sweep=unit(t/62+m.phase);
      for (const p of [sweep,unit(sweep+.5)]){
        const u=m.windSign===-1?1-p:p;
        const x=m.left+m.width*(-.18+1.36*u),y=m.top+m.height*(.44-.09*Math.sin(p*TAU));
        pigment(ctx,x,y,m.width*.54,m.height*.58,'29,45,60',.47*shade*pulse(p));
        pigment(ctx,x+m.width*.06,y+m.height*.1,m.width*.36,m.height*.53,'253,230,182',.26*(1-shade)*pulse(p));
      }
    } else {
      // A passing fold catches the light inside the canvas, held at its seams.
      const pos=unit(t/5.6+m.phase),u=m.windSign===-1?1-pos:pos;
      const x=m.left+m.width*(.13+.74*u);
      const y=m.top+m.height*.46;
      ctx.save();ctx.translate(x,y);ctx.rotate(-.48);
      pigment(ctx,0,0,Math.max(2,m.width*.035),m.height*.48,'245,225,179',.30*pulse(pos)*gust*m.power);
      ctx.restore();
    }
  }
  function onWater(ctx,parts,draw) {
    for(const part of parts||[]) {
      if(part.kind!=='run' && part.kind!=='water')continue;
      ctx.save();clip(ctx,part);draw();ctx.restore();
    }
  }
  function paint(ctx,parts,t,gust,shade=.45) {
    for(const part of parts){
      ctx.save();clip(ctx,part);ctx.lineCap='round';ctx.lineJoin='round';
      switch(part.kind){
        case 'water': waterMarks(ctx,part,t,gust);break;
        case 'run': flowing(ctx,part,t);poolRings(ctx,part,t);break;
        case 'litter': litter(ctx,part,t);break;
        case 'motes': dust(ctx,part,t,shade);break;
        case 'leaves': foliage(ctx,part,t,gust);break;
        case 'cloth': case 'cloud': airLight(ctx,part,t,gust,shade);break;
        default: illumination(ctx,part,t,shade);
      }
      ctx.restore();
    }
  }
  return {describe,prepare,paint,onWater};
});

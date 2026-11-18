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
  const shore = water('south coast surf',
    '0,42.6 15.6,43.1 16.9,43.7 18.1,43.4 20.3,44.1 20.1,45 22.4,45.8 24,46.8 26.3,47.1 26.2,48.7 23.2,49.1 21.8,49.8 19.3,49.3 17.3,49.7 16.3,51 15.4,52.7 15.4,54.4 12.5,55.6 11.5,56.4 9.3,56.7 9.1,58 6.2,58.1 5.1,56.8 3.3,56.5 1.8,57.1 0,57.7','reef',
    [front(12,44.4,-1.3,4.1,14,-1.1,5.9),front(6.7,48,.9,6.1,16,-2.1,6.8),front(2.4,50.6,2.1,6.4,13,-2.6,7.3)],
    ['8.6,55.8 9.4,54.4 10.6,53.5 11.8,53.6 12.7,54.2 13.1,55.6 11.1,56.1','13.5,54.9 14.2,53.6 15.4,53 16,54.8','16.3,55.1 16,52.4 17.3,50.8 19.4,49.8 22.4,50.1 23.7,51.3 21.8,53.6','21.3,45.6 22,44.7 23.9,45.4 24.8,46.4','19.9,48.2 20.7,47.7 21.7,47.8 22.6,48.7 21.2,49.4']);
  const brokenBow = water('surge on the broken bow','0,49 14.3,49 14.9,50.6 13.4,52.1 11.3,55 9.4,59.5 9.1,61.7 7.5,62 5.7,62.3 4.9,63.3 2.9,64.3 1.2,63.7 0,63.6','reef',
    [front(4.8,51,.5,4.2,9,-.35,5.6),front(2,56,.75,6.2,9.4,-1.65,6.7)],
    ['2,64 3,62.7 4.2,62.5 5.5,63.6 4.8,65.3 2.2,65.4']);
  const headland = cloud('clouds west of the headland','0,0 56,0 49,6 34,12 29,19 16,29 0,32');
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
    water('open sea to port','0,45.8 27.6,45.8 26,50 22.9,54.9 20.9,54.6 18.7,54.1 14.4,52.5 8.2,51.2 3.5,51.9 2.7,54.6 9,54.3 15,55.7 18.2,57.5 18.1,59 6,59.4 0,60.9','ocean',
      [front(8.5,46.6,3.1,3.6,19,1.5,7.1)],
      ['2.7,54.9 2.8,52.1 4.8,51.3 6.8,50.8 9.7,50.8 12.4,51.4 16,53.6 19.6,55.2 19.7,53.8 22.5,53.8 23,56 22.1,59.9 18.1,59.9 18.1,57.9 15.1,56.4 11.9,54.9 9,54.3 6.2,54.3 3.4,55.1']),
    water('sea between the stays','30.6,45.8 42.1,45.8 41.3,58.8 27.3,58.8','ocean',
      [front(31,49,2.8,4.8,15,-1,8.2)]),
    water('swells abaft the mast','47,45.8 94.7,45.8 97.2,54.1 97.2,58.7 47,58.7','ocean',
      [front(56,47.5,4.2,6.9,24,-1.9,7.8),front(73,46.4,5,4.7,23,-1.1,8.6),front(85,49.4,3.1,8.3,26,-3.1,9.2)])
  ];
  const hull = [cloud('clouds astern','72,0 100,0 100,9 83,16.7 77,16'),brokenBow];
  const paintings = {
    beach:[headland,shore,leaves('shoregrass by the path','0,77 4,80 9,88 6,91 0,89',
      [[2,87.4,1],[4.2,86.8,-1],[3.1,86.9,1]],true)],
    wreck:[...hull,cloth('torn canvas on the rail','27.1,10.1 31.7,12 33.1,11.5 31.6,20.8 29.3,25.7 28.1,21.2',1.12)],
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
    slipway:[cloud('clouds above the cove','0,0 35,0 29,8.7 15,20.1 0,23'),
      water('water off the stocks','0,30.5 21,30.5 25.4,31.7 30.6,32.4 27.5,34.1 24.9,36.8 19.8,38.1 19,40.3 12.1,41.7 10,38.5 7.8,37.9 4.3,38.2 0,39.6','reef',
        [front(9.3,32.4,1.8,3.7,18,-1.1,7.8)]),
      leaves('leaves over the stocks','46,0 72,0 70,8 60,13 53,16.7 47,16',
        [[51,12,1],[59.4,9.8,-1],[66.3,6.2,1]])],
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
        if(f.sailRigged) layers.push(cloth('canvas on the stocks','64.8,24.1 68,28.9 78,39.3 66,40.2',.72));
        break;
      case 'crossing':
        layers.push(cloth('sail drawing overhead','50,0 91,0 80,13.7 69,19.7 50,28.5',f.sailMended ? .38 : f.rigSecured ? .82 : 1.35));
        if(!f.boatDry) layers.push(water('standing bilge water','62.4,75.6 64.4,75.7 65.2,75.9 67.7,75.7 69.6,75.9 70,76.4 68.6,77.2 67.3,77.5 65.8,77.9 64.2,77.4 63.2,77.4 62.8,76.9','bilge'));
        break;
      case 'landing':
        if(f.landingMarked) layers.push(glow('lantern on shingle','reflection',77.8,62.1,2.1,1.2),
          glow('light in the lantern glass','reflection',77.8,35.5,.65,.93));
        break;
    }
    return layers;
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
    const amplitude=pulse(p)*(.75+.4*gust);
    const width=b.span*X*(.38+.66*Math.sin(Math.PI*p));
    const peel=Math.max(0,Math.min(1,(p-.22)/.48));
    const centreX=(b.x+p*b.dx)*X,centreY=(b.y+p*b.dy)*Y;
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
      if(near && i%3===0 && p>.38 && p<.85){
        const spray=unit((p-.38)*3.3+i*.21);
        const height=(1.6+3.8*noise(i+index))*pulse(spray);
        ctx.globalAlpha=.76*edgeLight*pulse(spray);ctx.lineWidth=.85;
        stroke(ctx,line[i][0]+spray*5,line[i][1]-height,1.65,-.6,.25);
      }
      if(rough && i%4===0 && p>.47){
        ctx.globalAlpha=.54*edgeLight;ctx.lineWidth=1.1;
        stroke(ctx,line[i][0]+.4,line[i][1]+bottom,4+i%3,1,.7);
      }
    }
  }
  function waterMarks(ctx,m,t,gust) {
    (m.breakers||[]).forEach((b,i)=>wave(ctx,m,b,i,t,gust));
    const gold=m.style==='gold',glass=m.style==='glass',bilge=m.style==='bilge';
    const rough=m.style==='reef'||m.style==='ocean';
    for(const f of m.marks){
      const p=unit(t/(3.1+2.7*f.size)+f.p);
      const light=pulse(p);
      const length=(glass?6:rough?20:gold?17:10)*(.32+f.size)*(.42+.58*light);
      const x=f.x+(p-.5)*(glass?4:bilge?11:12+8*f.size);
      const y=f.y+(p-.5)*(rough?6:3)-light*(rough?1.35:.45);
      ctx.strokeStyle=gold?'#f5db99':bilge?'#c0c5b7':'#d8e3d9';
      ctx.globalAlpha=light*(gold ? .78 : glass ? .52 : .58);
      ctx.lineWidth=(rough?1.25:1)*(.6+.62*f.size);
      stroke(ctx,x-length*.5,y,length,(f.size-.4)*(rough?1.9:.9),.35+light*.65);
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
  function illumination(ctx,m,t) {
    const x=m.x*X,y=m.y*Y,w=m.w*X,h=m.h*Y;
    const flicker=.6+.16*Math.sin(4.1*t)+.12*Math.sin(6.7*t+.9)+.08*Math.cos(11.3*t);
    if(m.kind==='sill'||m.kind==='reflection'){
      const warm=m.kind==='reflection',v=warm?flicker:.48+.25*Math.sin(.87*t+m.phase);
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
  function dust(ctx,m,t){
    const rgb='209,200,163';
    for(let i=0;i<8;i++){
      const p=unit(t/(7.3+2.4*noise(i))+m.phase+i*.381);
      const x=m.left+m.width*(.14+.68*p)+2.3*Math.sin(p*TAU+i);
      const y=m.top+m.height*(.12+.72*p+.11*Math.sin(p*TAU+i*.8));
      const opacity=.65*pulse(p)*(.65+.35*Math.sin(p*9+i));
      ctx.fillStyle='rgba('+rgb+','+opacity+')';
      ctx.beginPath();ctx.ellipse(x,y,.65+noise(i+3)*.6,.45+noise(i+1)*.45,0,0,TAU);ctx.fill();
    }
  }
  function airLight(ctx,m,t,gust) {
    if(m.kind==='cloud') {
      const p=unit(t/23+m.phase),q=unit(p+.5);
      for(const z of [p,q]){
        const x=m.left+m.width*(.02+.96*z),y=m.top+m.height*(.31+.15*Math.sin(z*TAU));
        pigment(ctx,x,y,Math.max(4,m.width*.25),Math.max(3,m.height*.21),'217,214,190',.17*pulse(z));
      }
    } else {
      // A passing fold catches the light inside the canvas, held at its seams.
      const pos=unit(t/5.6+m.phase),x=m.left+m.width*(.13+.74*pos);
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
  function paint(ctx,parts,t,gust) {
    for(const part of parts){
      ctx.save();clip(ctx,part);ctx.lineCap='round';ctx.lineJoin='round';
      switch(part.kind){
        case 'water': waterMarks(ctx,part,t,gust);break;
        case 'run': flowing(ctx,part,t);poolRings(ctx,part,t);break;
        case 'litter': litter(ctx,part,t);break;
        case 'motes': dust(ctx,part,t);break;
        case 'leaves': foliage(ctx,part,t,gust);break;
        case 'cloth': case 'cloud': airLight(ctx,part,t,gust);break;
        default: illumination(ctx,part,t);
      }
      ctx.restore();
    }
  }
  return {describe,prepare,paint,onWater};
});

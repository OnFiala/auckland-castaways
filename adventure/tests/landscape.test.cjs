'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const landscape=require('../dist/landscape.js');
const rooms=require('../dist/voyage.js').SCENES;
const allFlags={warmthReady:true,sailRigged:true,sailMended:true,shelterBuilt:true,forgeLit:true,fireLit:true,landingMarked:true};
const parts=(scene,flags={})=>landscape.prepare(landscape.describe({scene,flags}));
function instrument() {
  const marks=[],stack=[];
  const ctx=new Proxy({},{
    get(obj,k){
      if(k in obj)return obj[k];
      if(['drawImage','putImageData','getImageData','createPattern'].includes(k))throw Error('Plate access: '+k);
      if(k==='createRadialGradient')return ()=>({addColorStop(){}});
      if(k==='save')return ()=>stack.push(true);
      if(k==='restore')return ()=>assert.ok(stack.pop());
      return (...args)=>{
        if(!['stroke','fill','quadraticCurveTo','lineTo','moveTo','clip','ellipse','fillRect','rotate','translate','scale'].includes(k))return;
        assert.ok(args.every(n=>typeof n!=='number'||Number.isFinite(n)),k);
        marks.push([k,...args]);
      };
    }
  });
  return {ctx,marks,stack};
}

test('all fourteen sets are bounded vector geometry with a clip for every drawn material',()=>{
  for(const {id} of rooms){
    for(const flags of [{},allFlags]){
      const model=parts(id,flags);
      assert.ok(model.length>=2 && model.length<=9,id);
      assert.equal(new Set(model.map(m=>m.name)).size,model.length);
      for(const m of model){
        assert.ok(m.width>0&&m.height>0);
        assert.ok(m.points.flat().every(n=>n>=0&&n<=100));
        assert.ok(!('paper' in m) && !('image' in m));
        const {ctx,marks,stack}=instrument();
        landscape.paint(ctx,[m],3.8,.76);
        assert.equal(marks.filter(v=>v[0]==='clip').length,1+(m.holes||[]).length);
        assert.ok(marks.length<1300,m.name);assert.equal(stack.length,0);
      }
      const draw=t=>{const p=instrument();landscape.paint(p.ctx,model,t,.75);return p.marks;};
      assert.notDeepEqual(draw(3.8),draw(5.9),id);
    }
  }
});
test('repairs change indoor and deck responses independently of the ocean',()=>{
  const get=(scene,flags,name)=>parts(scene,flags).find(m=>m.name===name);
  const power=(s,f,n)=>get(s,f,n).power;
  assert.ok(power('cabin',{},'seam under the sailcloth roof')>power('cabin',{roofSealed:true},'seam under the sailcloth roof'));
  assert.ok(!get('cabin',{},'flame at the grate')&&get('cabin',allFlags,'flame at the grate'));
  assert.ok(!get('forge',{},'furnace embers')&&get('forge',allFlags,'furnace embers'));
  assert.ok(!get('camp',{},'shelter sail')&&get('camp',allFlags,'shelter sail'));
  assert.ok(!get('slipway',{},'canvas on the stocks')&&get('slipway',allFlags,'canvas on the stocks'));
  const strengths=[{}, {rigSecured:true},allFlags].map(f=>power('crossing',f,'sail drawing overhead'));
  assert.ok(strengths[0]>strengths[1]&&strengths[1]>strengths[2]);
  assert.ok(get('crossing',{},'standing bilge water')&&!get('crossing',{boatDry:true},'standing bilge water'));
  assert.deepEqual(get('crossing',{},'swells abaft the mast'),get('crossing',allFlags,'swells abaft the mast'));
});
test('no landscape or weather entry point can access or animate a copy of the source plate',()=>{
  const runtime=['landscape.js','weather.js','weather.css'].map(f=>fs.readFileSync(require.resolve('../dist/'+f),'utf8')).join('\n');
  assert.doesNotMatch(runtime,/drawImage|getImageData|putImageData|createPattern|OffscreenCanvas|new (host\.)?Image\b|background-image\s*:|wx-cut/);
});
let native;
try{native=require('@napi-rs/canvas');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
test('native renderer leaves rocks, banks, wood and rail transparent while surf and the gully change', {skip:!native},()=>{
  const protectedAreas={
    beach:[[103,321,9,7],[560,316,14,11],[220,481,24,9]],
    forest:[[117,79,9,19],[187,15,14,9],[201,292,3,27]],
    crossing:[[45,292,13,5],[409,245,10,32],[473,344,39,8]]
  };
  for(const [scene,areas] of Object.entries(protectedAreas)){
    const model=parts(scene),canvas=native.createCanvas(1000,563),ctx=canvas.getContext('2d');
    let previous;let changed=0;
    for(const t of [0,.8,1.9,3.8,5.1,6.7,9.6]){
      ctx.clearRect(0,0,1000,563);landscape.paint(ctx,model,t,.9);
      for(const [x,y,w,h] of areas){
        const data=ctx.getImageData(x,y,w,h).data;
        assert.ok(!data.some((value,i)=>i%4===3&&value),scene+' protected geometry '+[x,y]);
      }
      const frame=ctx.getImageData(0,0,1000,563).data;
      if(previous) for(let i=3;i<frame.length;i+=4)if(Math.abs(frame[i]-previous[i])>12)changed++;
      previous=frame;
    }
    assert.ok(changed>1600,scene+' visible motion: '+changed);
  }
});
test('a breaking wave progresses toward its shore and foam follows the stream downstream', {skip:!native},()=>{
  function sweep(m,t,bounds){
    const canvas=native.createCanvas(1000,563),ctx=canvas.getContext('2d');
    landscape.paint(ctx,[m],t,.9);
    const data=ctx.getImageData(...bounds).data;let area=0,sx=0,sy=0;
    for(let y=0;y<bounds[3];y++)for(let x=0;x<bounds[2];x++){
      const v=data[(y*bounds[2]+x)*4+3];area+=v;sx+=x*v;sy+=y*v;
    }
    return [sx/area,sy/area];
  }
  const sea=parts('beach').find(p=>p.kind==='water');
  const b=sea.breakers[1],single={...sea,phase:0,breakers:[b],marks:[]};
  const early=sweep(single,.27*b.period,[0,0,1000,563]),late=sweep(single,.70*b.period,[0,0,1000,563]);
  assert.ok(late[1]>early[1]+4,[early,late].join(' / '));
  const stream=parts('forest').filter(p=>p.kind==='run');
  for(const p of stream)for(const lane of p.lanes){
    assert.ok(lane[3][p.fall?1:0]>lane[0][p.fall?1:0],p.name);
  }
});

test('incoming tide reaches the shallows beside the landing skiff while wood and shingle retain their exact painted pixels', {skip:!native},async()=>{
  const path=require('node:path');
  const file=path.join(__dirname,'../dist/assets/tidepaint/landing.webp');
  const source=await native.loadImage(file),model=parts('landing');
  const offshore=model.find(p=>p.name==='inlet inside the mooring');
  const shoal=model.find(p=>p.name==='shallow wash beside the keel');
  assert.equal(shoal.breakers[0].period,offshore.breakers[1].period);
  assert.ok(shoal.breakers[0].phase<offshore.breakers[1].phase,'shoreward travel time');
  const base=native.createCanvas(1000,563),frame=native.createCanvas(1000,563);
  const ink=base.getContext('2d'),ctx=frame.getContext('2d');
  ink.drawImage(source,0,0,1000,563);
  const solid=[[474,318,27,10],[756,322,12,31],[579,358,40,8],[226,340,9,7]];
  const crop=(brush,box)=>brush.getImageData(...box).data;
  const origins=solid.map(box=>crop(ink,box));
  const waterBox=[538,332,183,19],changes=new Set();
  const waterBase=crop(ink,waterBox);
  for(let i=0;i<32;i++){
    ctx.drawImage(base,0,0);
    landscape.paint(ctx,model,i*shoal.breakers[0].period/32,.84);
    solid.forEach((box,k)=>assert.deepEqual(crop(ctx,box),origins[k],String(box)));
    const rgba=crop(ctx,waterBox);
    for(let k=0;k<rgba.length;k+=4)
      if(Math.abs(rgba[k]-waterBase[k])>9)changes.add(k/4);
  }
  assert.ok(changes.size>220,'submerged side of the keel: '+changes.size+' visibly changed pixels');
});

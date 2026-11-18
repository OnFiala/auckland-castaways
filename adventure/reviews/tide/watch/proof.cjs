// Native Canvas evidence for the current paintings. No browser or server.
'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{createHash}=require('node:crypto'),{spawnSync}=require('node:child_process');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const panels=require('./probes.cjs'),W=1000,H=563,count=64,fps=16;
const dist=path.resolve(__dirname,'../../../dist');
const world=require(path.join(dist,'voyage-world.js')),landscape=require(path.join(dist,'landscape.js'));
const weatherSource=fs.readFileSync(path.join(dist,'weather.js'),'utf8');
const record=process.argv.includes('--record'),hash=data=>createHash('sha256').update(data).digest('hex');
const rendererHashes=()=>Object.fromEntries(['weather.js','landscape.js','voyage-world.js'].map(f=>[f,hash(fs.readFileSync(path.join(dist,f)))]));
const sourceHashes=rendererHashes();
const sheet=()=>createCanvas(W,H),pixels=(canvas,box)=>canvas.getContext('2d').getImageData(...box).data;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'castaway-watch-'));
async function room(spec){
  const state={scene:spec.scene,flags:spec.flags||{}},file=world.background(state);
  const base=sheet(),preRain=sheet(),full=sheet(),frame=sheet();
  base.getContext('2d').drawImage(await loadImage(path.join(dist,file)),0,0,W,H);
  const timers=new Map(),frames=new Map();
  let seq=0,clock=0;
  const doc={hidden:false,createElement:()=>frame};
  const root={ownerDocument:doc,dataset:{},closest:()=>null,setAttribute(){},replaceChildren(){},getBoundingClientRect:()=>({width:W})};
  const host={CastawayLandscape:{...landscape,paint(ctx,...args){
    landscape.paint(ctx,...args);
    const saved=preRain.getContext('2d');saved.drawImage(base,0,0);saved.drawImage(frame,0,0);
  }},setTimeout(fn,delay){timers.set(++seq,{fn,due:clock+delay});return seq;},clearTimeout:id=>timers.delete(id),
    requestAnimationFrame(fn){frames.set(++seq,fn);return seq;},cancelAnimationFrame:id=>frames.delete(id)};
  vm.runInNewContext(weatherSource,{window:host});
  const weather=host.CastawayWeather;
  weather.render(root,spec.transitionAt?{scene:state.scene,flags:{}}:state);
  function repair(){weather.render(root,state);assert.ok(weather.respond(root,state,'bilge'));}
  function advance(dt){
    clock+=dt;
    for(const [id,item] of [...timers])if(item.due<=clock){timers.delete(id);item.fn();}
    for(const [id,fn] of [...frames]){frames.delete(id);fn(clock);}
  }
  function combine(){
    const ctx=full.getContext('2d');ctx.drawImage(base,0,0);ctx.drawImage(frame,0,0);
  }
  function dispose(){weather.dispose(root);}
  const measures=spec.probes.map(p=>({...p,paint:pixels(base,p.box),touched:new Uint8Array(p.box[2]*p.box[3]),frames:new Set(),max:0}));
  return {spec,file,base,preRain,full,frame,advance,combine,dispose,repair,measures,caption:()=>weather.caption(root,state)};
}
function inspect(r,p){
  const data=pixels(p.mode==='solid'||p.mode==='land'?r.preRain:r.full,p.box);
  const live=p.mode==='land'||p.mode==='air';
  if(!p.first)p.first=data;
  const reference=p.mode==='land'?p.first:p.mode==='air'?pixels(r.preRain,p.box):p.paint;
  const delta=new Uint8Array(data.length/4);
  for(let i=0;i<data.length;i+=4){
    let d=0;for(let c=0;c<4;c++)d=Math.max(d,Math.abs(data[i+c]-reference[i+c]));
    delta[i/4]=d;p.max=Math.max(p.max,d);
    if(d>=(live?4:1))p.touched[i/4]=1;
  }
  if(live)p.frames.add(hash(p.mode==='air'?delta:data));
}
function report(p){
  const {name,mode,box,max}=p;
  const changed=p.touched.reduce((a,b)=>a+b,0),distinct=p.frames.size;
  const live=mode==='land'||mode==='air';
  return {name,mode,box,changed,max,...(live?{min:p.min,distinct}:{}),pass:live?changed>=p.min&&distinct>=51:max===0};
}
function film(rooms){
  const result=createCanvas(986,517),ctx=result.getContext('2d');
  ctx.fillStyle='#132228';ctx.fillRect(0,0,986,517);
  ctx.font='21px Georgia';ctx.fillStyle='#efe1c4';ctx.fillText('Until We Return',16,30);
  ctx.font='14px sans-serif';ctx.textAlign='right';ctx.fillText('Water, wind and the working coast  •  1864–65',969,30);ctx.textAlign='left';
  rooms.filter(r=>r.spec.crop).forEach((r,i)=>{
    const x=16+i%2*486,y=46+Math.floor(i/2)*230,[sx,sy,sw,sh]=r.spec.crop;
    const scale=Math.min(468/sw,190/sh),dw=sw*scale,dh=sh*scale;
    ctx.fillStyle='#1c2d32';ctx.fillRect(x,y,468,190);
    ctx.drawImage(r.full,sx,sy,sw,sh,x+(468-dw)/2,y+(190-dh)/2,dw,dh);
    ctx.fillStyle='#f1e5cb';ctx.font='16px Georgia';ctx.fillText(r.spec.label,x,y+212);
  });
  return result;
}
function registration(rooms){
  const picks=['beach','wreck','slipway','crossing','forest','cabin'];
  const sheet=createCanvas(1280,1168),ctx=sheet.getContext('2d');
  ctx.fillStyle='#f1e9d6';ctx.fillRect(0,0,1280,1168);
  ctx.fillStyle='#263b37';ctx.font='23px Georgia';ctx.fillText('Registration against the paintings',16,30);
  ctx.font='14px sans-serif';ctx.textAlign='right';ctx.fillText('Amber  water and cloth     •     Blue  fixed material     •     Violet  precipitation',1265,28);ctx.textAlign='left';
  picks.forEach((scene,i)=>{
    const r=rooms.find(r=>r.spec.scene===scene);
    const x=16+i%2*635,y=48+Math.floor(i/2)*370,w=612,h=345;
    ctx.drawImage(r.base,x,y,w,h);
    r.measures.forEach((p,n)=>{
      const [a,b,c,d]=p.box;
      ctx.strokeStyle=p.mode==='air'?'#d6a4f4':p.mode==='land'?'#ffdb6f':'#86f4ec';
      ctx.lineWidth=2;
      ctx.strokeRect(x+a*w/W,y+b*h/H,Math.max(3,c*w/W),Math.max(3,d*h/H));
      ctx.fillStyle=ctx.strokeStyle;ctx.font='bold 13px sans-serif';
      const tx=x+Math.max(2,a*w/W-10),ty=y+b*h/H-3;
      ctx.strokeStyle='#1c2927';ctx.lineWidth=2.4;ctx.strokeText(String(n+1),tx,ty);ctx.fillText(String(n+1),tx,ty);
    });
    ctx.fillStyle='#263b37';ctx.font='16px Georgia';
    ctx.fillText(scene==='crossing'?'Open boat':scene[0].toUpperCase()+scene.slice(1),x,y+h+18);
  });
  return sheet;
}
async function watchStudy() {
  const r=await room({scene:'crossing',flags:{},probes:[]});
  const sheet=createCanvas(1000,694),ctx=sheet.getContext('2d'),rows=[];
  ctx.fillStyle='#172a2e';ctx.fillRect(0,0,sheet.width,sheet.height);
  ctx.fillStyle='#f1e3c6';ctx.font='22px Georgia';ctx.fillText('Five days of ocean',20,29);
  ctx.font='14px sans-serif';ctx.textAlign='right';
  ctx.fillText('Three moments in the same playable watch',979,29);ctx.textAlign='left';
  try{
    let past=0;r.advance(250);
    for(const [i,t] of [6,48,78].entries()){
      for(;past<t;past+=.25)r.advance(250);
      r.combine();
      const box=[0,80,196,185];
      const painted=pixels(r.preRain,box),full=pixels(r.full,box);
      let precipitation=0,brightness=0;
      for(let n=0;n<painted.length;n+=4){
        brightness+=(.2126*painted[n]+.7152*painted[n+1]+.0722*painted[n+2]);
        if(Math.max(...[0,1,2].map(k=>Math.abs(painted[n+k]-full[n+k])))>=4)precipitation++;
      }
      const y=43+i*216;
      ctx.drawImage(r.full,0,149,1000,205,20,y,960,169);
      ctx.fillStyle='#e5d4b2';ctx.font='18px Georgia';
      ctx.fillText(r.caption().split('. ')[0]+'.',20,y+192);
      rows.push({second:t,watch:r.caption(),outlookBox:box,precipitationPixels:precipitation,
        skyMeanLuminance:Number((brightness/(painted.length/4)).toFixed(2))});
    }
    assert.ok(rows[1].precipitationPixels>rows[0].precipitationPixels+20,'rain crosses the lookout during the squall');
    assert.equal(rows[2].precipitationPixels,0,'view clears off the port bow');
    assert.ok(rows[1].skyMeanLuminance<rows[0].skyMeanLuminance,'squall shades the lookout');
    if(record)fs.writeFileSync(path.join(__dirname,'three-watches.webp'),sheet.toBuffer('image/webp',89));
    return rows;
  }finally{r.dispose();}
}
async function main(){
  const rooms=[];
  try{
    for(const spec of panels){
      const r=await room(spec);rooms.push(r);
      r.advance(250); // First production rAF establishes the timestamp.
      for(let i=0;i<spec.seconds*4;i++){
        if(spec.transitionAt&&i===spec.transitionAt*4)r.repair();
        r.advance(250);
      }
    }
    for(let n=0;n<count;n++){
      for(const r of rooms){
        if(n)r.advance(1000/fps);r.combine();r.measures.forEach(p=>inspect(r,p));
      }
      const [wet,...repaired]=rooms.filter(r=>r.spec.scene==='crossing');
      const box=[494,204,364,110];
      for(const r of repaired)assert.deepEqual(pixels(wet.frame,box),pixels(r.frame,box),'offshore marks after repair, frame '+n);
      if(record)fs.writeFileSync(path.join(temp,String(n).padStart(3,'0')+'.png'),film(rooms).toBuffer('image/png'));
    }
    const metrics={canvas:[W,H],frames:count,fps,watchStudy:await watchStudy(),method:'Production atmospheric overlay, production landscape and registered backplates, native Canvas 2D',offshoreEqualFrames:count,
      sha256:sourceHashes,
      rooms:rooms.map(r=>({scene:r.spec.scene,startSeconds:r.spec.seconds,flags:r.spec.flags||{},source:r.file,
        sha256:hash(fs.readFileSync(path.join(dist,r.file))),caption:r.caption(),probes:r.measures.map(report)}))};
    assert.deepEqual(rendererHashes(),sourceHashes,'renderer or registry changed while measuring');
    const fails=metrics.rooms.flatMap(r=>r.probes.filter(p=>!p.pass).map(p=>[r.scene,p]));
    if(fails.length)console.log(JSON.stringify(fails,null,2));
    assert.equal(fails.length,0,'fixed and live pixel checks');
    console.log('64 frames each, '+metrics.rooms.length+' plate states, '+metrics.rooms.flatMap(r=>r.probes).length+' probes; sea unchanged by work.');
    if(record){
      fs.writeFileSync(path.join(__dirname,'registration.webp'),registration(rooms).toBuffer('image/webp',88));
      fs.writeFileSync(path.join(__dirname,'metrics.json'),JSON.stringify(metrics,null,2)+'\n');
      const args=['-hide_banner','-loglevel','error','-y','-framerate',String(fps),'-i',path.join(temp,'%03d.png'),'-an','-c:v','libwebp_anim','-quality','81','-compression_level','4','-loop','0',path.join(__dirname,'wind-and-water.webp')];
      assert.equal(spawnSync('ffmpeg',args,{stdio:'inherit'}).status,0,'animation encoding');
    }
  }finally{rooms.forEach(r=>r.dispose());fs.rmSync(temp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

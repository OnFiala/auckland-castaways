'use strict';
const assert = require('node:assert/strict');
const {createCanvas} = require('@napi-rs/canvas');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {spawnSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const {studio,dist} = require('./runtime.cjs');
const scenes = require('./probes.cjs');
const fps=16, count=64, record=process.argv.includes('--record');
const out = __dirname, scratch=fs.mkdtempSync(path.join(os.tmpdir(),'castaway-tide-'));
const rgba = (canvas, box) => canvas.getContext('2d').getImageData(...box).data;
const hash = a => createHash('sha256').update(a).digest('hex');

function startProbe([name,mode,box,minimum],model) {
  const values=rgba(model.base,box);
  return {name,mode,box,minimum,reference:mode==='live'?null:values, pixels:new Uint8Array(values.length/4),
    strong:new Uint8Array(values.length/4),maxDelta:0, maxBaseDelta:0, hashes:new Set()};
}
function probeFrame(probe, model){
  const {mode,box}=probe;
  const now=rgba(mode==='dry'?model.full:model.geology,box);
  if(!probe.reference) probe.reference=now;
  const base=mode==='dry'?rgba(model.base,box):null;
  const geometry=mode==='dry'?rgba(model.geology,box):null;
  for(let i=0;i<now.length;i+=4){
    let delta=0;
    for(let c=0;c<4;c++) {
      delta=Math.max(delta,Math.abs(now[i+c]-probe.reference[i+c]));
      if(base) probe.maxBaseDelta=Math.max(probe.maxBaseDelta,Math.abs(geometry[i+c]-base[i+c]));
    }
    if(delta) probe.pixels[i/4]=1;
    if(delta>=4) probe.strong[i/4]=1;
    probe.maxDelta=Math.max(probe.maxDelta,delta);
  }
  if(mode==='live') probe.hashes.add(hash(now));
}
function report(probe) {
  const {name,mode,box,minimum,maxDelta,maxBaseDelta}=probe;
  const changes=probe.pixels.reduce((a,b)=>a+b,0);
  const strong=probe.strong.reduce((a,b)=>a+b,0);
  if(mode==='live') return {name,mode,box,changedPixels:changes,atLeast4:strong,maxDelta,distinctFrames:probe.hashes.size,
    pass:strong>=minimum && probe.hashes.size>=count*.8};
  return {name,mode,box,changedPixels:changes,maxDelta,pass:maxDelta===0 && maxBaseDelta===0};
}
// Isolate channels that share the same sea mask. Otherwise ripples alone
// could hide a missing breaker, or snow could hide a still waterfall.
function channelEvidence() {
  const landscape=require(path.join(dist,'landscape.js'));
  const shore=landscape.prepare(landscape.describe({scene:'beach',flags:{}})).find(p=>p.style==='reef');
  const woodland=landscape.prepare(landscape.describe({scene:'forest',flags:{}}));
  const channels=[
    ['běžící hřeben a pěna', [{...shore,marks:[]}], [0,245,155,64]],
    ['odlesky mezi vlnami', [{...shore,breakers:[]}], [0,245,155,64]],
    ['vodopád',woodland.filter(p=>p.kind==='run'&&p.fall),[188,279,28,90]],
    ['lístky kapradiny',woodland.filter(p=>p.kind==='leaves'),[117,296,49,33]]
  ];
  return channels.map(([name,parts,box])=>{
    const canvas=createCanvas(1000,563),ctx=canvas.getContext('2d');
    const active=new Uint8Array(box[2]*box[3]),frames=new Set();
    for(let i=0;i<count;i++){
      ctx.clearRect(0,0,1000,563);landscape.paint(ctx,parts,3.8+i/fps,.8);
      const pixels=rgba(canvas,box);frames.add(hash(pixels));
      for(let p=0;p<active.length;p++) if(pixels[p*4+3]>=16) active[p]=1;
    }
    const visiblePixels=active.reduce((a,b)=>a+b,0);
    assert.ok(visiblePixels>25 && frames.size>50,'Missing independent motion / '+name);
    return {name,box,visiblePixels,distinctFrames:frames.size};
  });
}
function film(models){
  const sheet=createCanvas(1032,356),ctx=sheet.getContext('2d');
  ctx.fillStyle='#282b27';ctx.fillRect(0,0,1032,356);
  ctx.fillStyle='#e2d6b8';ctx.font='small-caps 15px "DejaVu Sans"';
  ctx.fillText('UNTIL WE RETURN',20,29);
  ctx.textAlign='right';ctx.font='13px "DejaVu Sans"';ctx.fillStyle='#c2b49a';
  ctx.fillText('Aucklandovy ostrovy  /  1864–1865',1012,29);
  ctx.textAlign='left';
  models.forEach(({spec,model},i)=>{
    const x=20+i*334, w=324;
    const [cx,cy,cw,ch]=spec.crop, h=216;
    const scale=Math.max(w/cw,h/ch), sw=w/scale, sh=h/scale;
    ctx.drawImage(model.full,cx+(cw-sw)/2,cy+(ch-sh)/2,sw,sh,x,50,w,h);
    ctx.fillStyle='#eee5cf';ctx.font='25px "DejaVu Serif"';ctx.fillText(spec.title,x,304);
    ctx.fillStyle='#c0b297';ctx.font='15px "DejaVu Sans"';ctx.fillText(spec.caption,x,332);
  });
  return sheet;
}
function diagnostic(models){
  const w=580,h=326,pad=20;
  const sheet=createCanvas(1180,1080),ctx=sheet.getContext('2d');
  ctx.fillStyle='#f3eedd';ctx.fillRect(0,0,sheet.width,sheet.height);
  ctx.fillStyle='#34382e';ctx.font='23px "DejaVu Serif"';ctx.fillText('Pevné body a živé povrchy',pad,40);
  models.forEach(({spec,model,results},i)=>{
    const y=62+i*337;
    ctx.drawImage(model.base,pad,y,w,h);
    results.forEach((p,n)=>{
      const [x0,y0,w0,h0]=p.box,x=pad+x0*w/1000,yy=y+y0*h/563;
      ctx.strokeStyle=p.mode==='live'?'#fff184':'#72e4dc';
      ctx.lineWidth=2;ctx.strokeRect(x,yy,Math.max(5,w0*w/1000),Math.max(5,h0*h/563));
      ctx.font='bold 14px "DejaVu Sans"';const label=String(n+1);
      ctx.lineWidth=2.6;ctx.strokeStyle='#282b26';ctx.strokeText(label,x-10,yy-2);
      ctx.fillStyle='white';ctx.fillText(label,x-10,yy-2);
    });
    ctx.fillStyle='#34382e';ctx.font='25px "DejaVu Serif"';ctx.fillText(spec.title,630,y+35);
    results.forEach((p,n)=>{
      ctx.fillStyle='#34382e';ctx.font='16px "DejaVu Sans"';
      const value=p.mode==='live'?p.atLeast4+' px se změnou ≥ 4':p.changedPixels+' změněných px';
      ctx.fillText((n+1)+'   '+p.name+'   ·   '+value,630,y+78+n*31);
    });
  });
  return sheet;
}
async function main() {
  const models=[];
  try {
    for(const spec of scenes){
      const model=await studio(spec.scene,spec.flags);
      models.push({spec,model,probes:spec.probes.map(p=>startProbe(p,model)),material:new Set()});
    }
    for(let n=0;n<count;n++) {
      for(const [i,entry] of models.entries()){
        if(n===10+i*5) assert.ok(entry.model.interact());
        entry.model.advance(500+n*1000/fps);
        entry.probes.forEach(p=>probeFrame(p,entry.model));
        entry.material.add(hash(entry.model.material.toBuffer('image/png')));
      }
      if(record) fs.writeFileSync(path.join(scratch,String(n).padStart(3,'0')+'.png'),film(models).toBuffer('image/png'));
    }
    const rendererHashes=Object.fromEntries(['landscape.js','weather.js','stage-life.js','voyage-world.js']
      .map(file=>[file,hash(fs.readFileSync(path.join(dist,file)))]));
    const metrics={frames:count,fps,rendererHashes,components:'production landscape, weather, foreground interaction',independentChannels:channelEvidence(),scenes:{}};
    for(const e of models){
      e.results=e.probes.map(report);
      metrics.scenes[e.spec.scene]={file:e.model.plateFile,sha256:hash(fs.readFileSync(path.join(dist,e.model.plateFile))),
        foreground:e.model.target.id,foregroundFrames:e.material.size,probes:e.results};
    }
    console.log(JSON.stringify(metrics,null,2));
    for(const e of models){
      assert.ok(e.model.plateFile.includes('tidepaint/'),'Scene registry must use the new master for '+e.spec.scene);
      assert.ok(e.material.size>=9,e.model.target.id+' should deform over time');
      e.results.forEach(p=>assert.ok(p.pass,e.spec.scene+' / '+p.name));
    }
    if(record){
      fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(metrics,null,2)+'\n');
      fs.writeFileSync(path.join(out,'pevne-body.webp'),diagnostic(models).toBuffer('image/webp',89));
      const target=path.join(out,'priboj-a-proud.webp');
      const args=['-hide_banner','-loglevel','error','-y','-framerate',String(fps),'-i',path.join(scratch,'%03d.png'),'-an','-c:v','libwebp_anim','-quality','79','-compression_level','5','-loop','0',target];
      assert.equal(spawnSync('ffmpeg',args,{stdio:'inherit'}).status,0,'WebP encoding');
    }
  } finally {
    models.forEach(e=>e.model.dispose());fs.rmSync(scratch,{force:true,recursive:true});
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

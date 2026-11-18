// node adventure/reviews/release-14/voda/proof.cjs [--record]
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const {createCanvas, loadImage} = require('@napi-rs/canvas');

const dist = path.resolve(__dirname, '../../../dist');
const release12 = 'c2eff1a5f8dd803dccd28d50db0ab66b27949d6e';
const release13 = '4dbfa437c2d04a89102ac06a5813d0e377ccbb80';
const W = 1000, H = 563, fps = 16, frames = 209;
const production = require(path.join(dist, 'landscape.js'));
const weather = fs.readFileSync(path.join(dist, 'weather.js'), 'utf8');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function earlier(revision) {
  const text = execFileSync('git', ['show', revision + ':adventure/dist/landscape.js'], {cwd:dist, encoding:'utf8'});
  const sandbox = {module:{exports:{}}};
  vm.runInNewContext(text, sandbox);
  return sandbox.module.exports;
}
const previous = earlier(release13);
const cases = [
  {scene:'beach', label:'Pláž · příboj pod vrakem', files:['beach'], crop:[0,307,443,92], live:[5,342,275,35], fixed:{
    wreck:[97,324,16,5], reef:[162,330,12,3], branch:[727,185,17,6],
    boulder:[434,354,9,11], sand:[22,401,110,9]}},
  {scene:'wreck', label:'Lednový vrak · balvany pod přídí', files:['wreck','wreck-open'], crop:[0,358,119,74], live:[6,351,47,28], fixed:{
    rockA:[25,384,9,2], rockB:[73,371,5,2], grass:[2,424,4,2], hull:[108,365,10,15]}},
  {scene:'salvage', label:'Zimní vrak · stejné skalisko', files:['salvage'], crop:[0,358,119,74], live:[6,351,47,28], fixed:{
    rockA:[25,384,9,2], rockB:[73,371,5,2], hull:[108,365,10,15]}},
  {scene:'slipway', label:'Loděnice · skalní výběžek a tráva', files:['slipway','slipway-ready'], crop:[0,211,139,91], live:[78,240,35,28], fixed:{
    outcrop:[6,252,12,4], grass:[16,279,2,3], trestle:[724,393,6,18]}},
  {scene:'crossing', label:'Otevřený člun · lana na levoboku', files:['crossing-wet','crossing-bailed','crossing-safe'], crop:[240,238,164,99], live:[332,258,42,31], fixed:{
    ropeCoil:[324,257,3,4], ropeBelow:[321,266,3,3], tiller:[47,291,19,5],
    mast:[416,211,10,41], rail:[542,339,29,6]}},
  {scene:'landing', label:'Návrat · voda pod kýlem', files:['landing'], crop:[485,315,245,55], live:[565,336,96,13], fixed:{
    keel:[474,318,27,10], post:[756,322,12,31]}}
];
function sea(api, scene) {
  return api.prepare(api.describe({scene,flags:{}}).filter(part=>part.kind==='water' && part.style!=='bilge'));
}
function highWater(api, scene) {
  const ctx = createCanvas(W,H).getContext('2d');
  ctx.setTransform(1,0,0,H/562.5,0,0);
  const layers = sea(api,scene);
  const periods = layers.flatMap(part=>part.breakers.map(b=>b.period));
  assert.ok((frames-1)/fps >= Math.max(...periods));
  const peak = new Uint8Array(W*H);
  for(let i=0;i<frames;i++) {
    ctx.clearRect(0,0,W,562.5);
    api.paint(ctx,layers,i/fps,1);
    const data = ctx.getImageData(0,0,W,H).data;
    for(let k=0;k<peak.length;k++) peak[k]=Math.max(peak[k],data[k*4+3]);
  }
  return peak;
}
// Fill the production clipping path even where no wave appeared in the frames.
// Pixels outside this envelope stay protected at *every* phase and gust.
function envelope(api, scene) {
  const ctx = createCanvas(W,H).getContext('2d');
  ctx.setTransform(1,0,0,H/562.5,0,0);
  api.onWater(ctx,sea(api,scene),()=>ctx.fillRect(0,0,W,562.5));
  const rgba = ctx.getImageData(0,0,W,H).data;
  return Uint8Array.from({length:W*H},(_,i)=>rgba[4*i+3]);
}
function hits(mask,[x,y,w,h]) {
  let count=0;
  for(let row=y;row<y+h;row++) for(let col=x;col<x+w;col++) if(mask[row*W+col]) count++;
  return count;
}
function horizon(api){
  const shape=api.describe({scene:'beach',flags:{}}).find(p=>p.kind==='water').points;
  const heights=[];
  shape.forEach(([x,y],i)=>{
    const [endX,endY]=shape[(i+1)%shape.length];
    if(Math.min(x,endX)<=5 && 5<Math.max(x,endX)) heights.push(y+(endY-y)*(5-x)/(endX-x));
  });
  return +Math.min(...heights).toFixed(2);
}
// Exercise production resize and its actual Canvas transform with a test-supplied
// CSS box. A DOM test double cannot measure CSS layout in a browser.
function viewport(dpr,widths) {
  let cssWidth=widths[0], observer;
  const output=createCanvas(1,1);
  const root={ownerDocument:{hidden:false,createElement:()=>output},closest:()=>null,dataset:{},setAttribute(){},replaceChildren(){},getBoundingClientRect:()=>({width:cssWidth})};
  const host={CastawayLandscape:production,devicePixelRatio:dpr,ResizeObserver:class{constructor(fn){observer=fn;}observe(){}disconnect(){}}};
  vm.runInNewContext(weather,{window:host});
  host.CastawayWeather.render(root,{scene:'beach',flags:{}});
  const result=widths.map(width=>{
    cssWidth=width;observer();
    const transform=output.getContext('2d').getTransform();
    assert.ok(Math.abs(transform.a-output.width/1000)<1e-6);
    assert.ok(Math.abs(transform.d-output.height/562.5)<1e-6);
    assert.ok(output.width<=1152);
    const x=50, y=562.5*horizon(production)/100;
    const mapped=[x*transform.a/output.width*width, y*transform.d/output.height*width*9/16];
    const expected=[x/1000*width, y/562.5*width*9/16];
    assert.ok(mapped.every((n,i)=>Math.abs(n-expected[i])<.001));
    return {cssWidth:width,backing:[output.width,output.height],horizonCSS:mapped.map(n=>+n.toFixed(3))};
  });
  host.CastawayWeather.dispose(root);
  return {dpr,sizes:result};
}
function overlay(base,heat) {
  const picture=createCanvas(W,H),ctx=picture.getContext('2d');
  ctx.drawImage(base,0,0,W,H);
  const image=ctx.getImageData(0,0,W,H);
  for(let i=0;i<heat.length;i++){
    const a=Math.min(.83,heat[i]/55);
    for(let c=0;c<3;c++) image.data[i*4+c]=Math.round((1-a)*image.data[i*4+c]+a*[245,36,109][c]);
  }
  ctx.putImageData(image,0,0);return picture;
}
async function main(){
  const oldH=horizon(earlier(release12)),newH=horizon(production);
  assert.equal(horizon(previous),newH);
  assert.ok(newH-oldH>17);
  const result={renderer:hash(fs.readFileSync(path.join(dist,'landscape.js'))),previous:release13,
    frameCount:frames,hz:fps,gust:1,normalisedReference:[W,H],beachTopAtFivePercent:{release12:oldH,release13:newH,release14:newH},
    geometry:[viewport(1,[1360,998]),viewport(3,[390,844,390])],scenes:[]};
  const imageHeight=crop=>Math.min(155,318*crop[3]/crop[2]);
  const sheetHeight=47+cases.reduce((sum,s)=>sum+imageHeight(s.crop)+40,0);
  const sheet=createCanvas(1000,Math.ceil(sheetHeight)),ctx=sheet.getContext('2d');
  ctx.fillStyle='#192828';ctx.fillRect(0,0,sheet.width,sheet.height);
  ctx.font='17px sans-serif';ctx.fillStyle='#f7e9ce';
  ['Malba','Příboj 13','Příboj 14'].forEach((s,i)=>ctx.fillText(s,15+330*i,25));
  let row=43;
  for(const spec of cases){
    const before=highWater(previous,spec.scene),after=highWater(production,spec.scene),clip=envelope(production,spec.scene);
    const fixed=Object.entries(spec.fixed).map(([name,box])=>{
      const old=hits(before,box),now=hits(after,box),allowed=hits(clip,box);
      assert.equal(now,0,spec.scene+'/'+name+' moved');
      assert.equal(allowed,0,spec.scene+'/'+name+' intersects the water matte');
      return {name,box,v13:old,v14:now,permitted:allowed};
    });
    const livePixels=hits(after,spec.live);
    assert.ok(livePixels>30,spec.scene+' adjacent water is quiet');
    if(['wreck','salvage','slipway','crossing'].includes(spec.scene))
      assert.ok(fixed.some(f=>f.v13>0),'baseline must reproduce '+spec.scene);
    const plateHashes={},variantMeanChannelDelta={};
    const plate=createCanvas(W,H),ctxPlate=plate.getContext('2d');
    const registrationBox=spec.scene==='crossing'?[0,223,W,117]:spec.crop;
    let reference;
    for(const [index,file] of spec.files.entries()){
      const bytes=fs.readFileSync(path.join(dist,'assets/tidepaint',file+'.webp'));
      plateHashes[file]=hash(bytes);
      const ctxVariant=index===0?ctxPlate:createCanvas(W,H).getContext('2d');
      ctxVariant.drawImage(await loadImage(bytes),0,0,W,H);
      const data=ctxVariant.getImageData(...registrationBox).data;
      if(index===0){reference=data;continue;}
      let delta=0;
      for(let i=0;i<data.length;i++) if(i%4!==3)delta+=Math.abs(data[i]-reference[i]);
      const mean=delta/(data.length*.75);
      assert.ok(mean<2,file+' shoreline changed; inspect the new plate');
      variantMeanChannelDelta[file]=+mean.toFixed(3);
    }
    result.scenes.push({scene:spec.scene,plateHashes,registrationBox,variantMeanChannelDelta,fixed,activeBox:spec.live,activePixels:livePixels});
    const [x,y,w,h]=spec.crop,scale=Math.min(318/w,155/h),dw=w*scale,dh=h*scale;

    [plate,overlay(plate,before),overlay(plate,after)].forEach((c,i)=>{
      const left=13+i*330;ctx.drawImage(c,x,y,w,h,left,row,dw,dh);
    });
    ctx.fillText(spec.label,15,row+dh+20);
    row+=dh+40;
  }
  if(process.argv.includes('--record')){
    fs.writeFileSync(path.join(__dirname,'srovnani.webp'),sheet.toBuffer('image/webp',92));
    fs.writeFileSync(path.join(__dirname,'mereni.json'),JSON.stringify(result,null,2)+'\n');
  }else{
    assert.deepEqual(result,JSON.parse(fs.readFileSync(path.join(__dirname,'mereni.json'),'utf8')));
  }
  console.log(result.scenes.map(s=>s.scene+' '+s.fixed.reduce((a,p)=>a+p.v13,0)+' → 0; voda '+s.activePixels).join('\n'));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

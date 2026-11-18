'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const landscape = require('../dist/landscape.js');
const voyage = require('../dist/voyage.js');
const byName = (scene, flags, name) => landscape.describe({scene,flags}).find(layer => layer.name===name);

test('fourteen paintings have local moving materials; solid scenery and people stay registered', () => {
  const kinds = new Set();
  for(const scene of voyage.SCENES){
    const parts=landscape.describe({scene:scene.id,flags:{}});
    assert.ok(parts.length>=2 && parts.length<=7,scene.id);
    assert.equal(new Set(parts.map(p=>p.name)).size,parts.length);
    for(const part of parts){
      kinds.add(part.kind);
      if(part.points){
        assert.ok(part.power>0 && part.power<2);
        assert.ok(part.points.length>=3 && part.points.flat().every(n=>n>=0&&n<=100));
        const area=Math.abs(part.points.reduce((sum,[x,y],i)=>{
          const [nextX,nextY]=part.points[(i+1)%part.points.length];return sum+x*nextY-y*nextX;
        },0))/2;
        assert.ok(area>10 && area<2200,scene.id+' '+part.name);
      } else {
        assert.ok(['window','fire'].includes(part.kind));
        assert.ok(part.x-part.w>=0 && part.x+part.w<=100);
      }
    }
  }
  for(const material of ['ocean','surf','gold','sea','current','fall','canvas','rag','grass','bough','cloud','window','fire','bilge'])assert.ok(kinds.has(material),material);
});

test('wind and water respond to repairs and keep that response on a return visit', () => {
  const roof='underside of the sailcloth roof', sail='sail drawing against its shrouds';
  assert.ok(byName('cabin',{roofSealed:true},roof).power<byName('cabin',{},roof).power);
  assert.ok(!byName('cabin',{},'flame at the grate')&&byName('cabin',{warmthReady:true},'flame at the grate'));
  assert.ok(!byName('camp',{},'belly of the shelter sail')&&byName('camp',{shelterBuilt:true},'belly of the shelter sail'));
  assert.ok(!byName('forge',{forgeFueled:true},'hot bed above the stone lip')&&byName('forge',{forgeLit:true},'hot bed above the stone lip'));
  assert.ok(!byName('slipway',{hullPlanked:true},'new sail drawing on the stocks')&&byName('slipway',{sailRigged:true},'new sail drawing on the stocks'));
  const powers=[{}, {rigSecured:true}, {rigSecured:true,sailMended:true}].map(f=>byName('crossing',f,sail).power);
  assert.ok(powers[0]>powers[1]&&powers[1]>powers[2]);
  assert.ok(byName('crossing',{},'standing water on the deck')&&!byName('crossing',{boatDry:true},'standing water on the deck'));
  assert.equal(byName('crossing',{},'swells abaft the mast').power,byName('crossing',{boatDry:true,sailMended:true},'swells abaft the mast').power);
});

test('the painter samples the selected asset only at preparation and shares the weather clock', () => {
  const images=[];
  function pen(){
    return new Proxy({},{get:(obj,k)=>{
      if(k in obj)return obj[k];
      if(k==='createRadialGradient')return ()=>({addColorStop(){}});
      if(k==='drawImage')return (image,...values)=>{
        assert.ok(values.every(Number.isFinite));images.push({image,values});
      };
      return ()=>{};
    }});
  }
  const doc={createElement:()=>({getContext:pen})}, image={width:1536,height:1024};
  const allFlags={warmthReady:true,sailRigged:true,sailMended:true,shelterBuilt:true,forgeLit:true,fireLit:true,landingMarked:true};
  for(const room of voyage.SCENES){
    const parts=landscape.prepare(doc,image,landscape.describe({scene:room.id,flags:allFlags}));
    const swatches=parts.filter(p=>p.paper);
    const size=swatches.reduce((sum,m)=>sum+m.w*m.h,0);
    assert.ok(size>100 && size<500000,room.id+' canvas budget');
    images.length=0;landscape.paint(pen(),parts,3.8,.7);
    const first=images.map(i=>i.values);assert.ok(first.length>0 && first.length<150,room.id+' draw budget');
    assert.ok(images.every(i=>i.image!==image),'do not resample the full plate on a frame');
    images.length=0;landscape.paint(pen(),parts,5.9,.7);
    assert.notDeepEqual(images.map(i=>i.values),first,room.id+' is stationary');images.length=0;
  }
});

test('late decodes, hidden tabs, reduced motion and repeat renders leave only the active plate prepared',()=>{
  const fs=require('node:fs'),vm=require('node:vm');
  const images=[],prepared=[],timers=new Map(),handlers=new Map();
  let reduced=true,handle=0;
  const pen=new Proxy({}, {get:(obj,k)=>k in obj?obj[k]:k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
  const doc={hidden:false,querySelector:()=>null,querySelectorAll:()=>[],addEventListener:(k,f)=>handlers.set(k,f),removeEventListener:k=>handlers.delete(k),
    createElement:name=>name==='canvas'?{width:1000,height:563,getContext:()=>pen}:{style:{}}};
  const root={ownerDocument:doc,dataset:{},setAttribute(){},replaceChildren(){},getBoundingClientRect:()=>({width:870}),closest:()=>null};
  const window={CastawayWorld:require('../dist/voyage-world.js'),
    CastawayLandscape:{describe:landscape.describe,prepare:(doc,img)=>{prepared.push(img.src);return [{name:'sample'}];},paint(){}},
    Image:class{constructor(){images.push(this);}finish(){this.complete=true;this.naturalWidth=1000;this.onload?.();}},
    setTimeout:fn=>{timers.set(++handle,fn);return handle;},clearTimeout:id=>timers.delete(id),requestAnimationFrame(){},
    matchMedia:()=>({get matches(){return reduced;},addEventListener:(k,f)=>handlers.set('motion',f),removeEventListener:()=>{}})};
  vm.runInNewContext(fs.readFileSync(require.resolve('../dist/weather.js'),'utf8'),{window});
  const render=(scene,flags={})=>window.CastawayWeather.render(root,{scene,flags});
  render('beach');assert.equal(images.length,0);assert.equal(timers.size,0);
  reduced=false;handlers.get('motion')();assert.equal(images.length,1);
  const stale=images[0].onload;
  render('camp');assert.equal(images[0].onload,null);
  images[0].complete=true;images[0].naturalWidth=1000;stale();assert.deepEqual(prepared,[]);
  doc.hidden=true;handlers.get('visibilitychange')();images[1].finish();assert.deepEqual(prepared,[]);assert.equal(timers.size,0);
  doc.hidden=false;handlers.get('visibilitychange')();assert.deepEqual(prepared,['assets/camp.png']);assert.equal(timers.size,1);
  render('camp',{ropeTaken:true});assert.equal(prepared.length,1);
  render('camp',{shelterBuilt:true});assert.equal(images.length,3);images[2].finish();
  assert.equal(prepared.at(-1),'assets/states/camp-shelter.png');
  render('crossing');const last=images.at(-1).onload;window.CastawayWeather.dispose(root);
  last();assert.equal(timers.size,0);assert.equal(prepared.length,2);
});

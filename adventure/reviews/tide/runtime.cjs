'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const dist = path.resolve(__dirname, '../../dist');
const W = 1000, H = 563;
const world = require(path.join(dist,'voyage-world.js'));
const landscape = require(path.join(dist,'landscape.js'));
const weatherSource = fs.readFileSync(path.join(dist,'weather.js'),'utf8');
const foregroundSource = fs.readFileSync(path.join(dist,'stage-life.js'),'utf8');
const paper = () => createCanvas(W,H);

// The DOM adapter schedules the unmodified production weather's own frames.
// The adapter supplies local canvas elements and the deterministic clock.
async function studio(scene, flags = {}) {
  const state = {scene,flags};
  const plateFile = world.background(state);
  const image = await loadImage(path.join(dist,plateFile));
  const base = paper(), full = paper(), geology = paper();
  const baseCtx = base.getContext('2d'), fullCtx = full.getContext('2d'), geoCtx = geology.getContext('2d');
  baseCtx.drawImage(image,0,0,W,H);
  const timers = new Map(), frames = new Map();
  let next = 0, captures = 0, clock = 0;
  const doc = {hidden:false,querySelector(){return null;},createElement(tag) {
    const node = tag === 'canvas' ? paper() : {
      children:[],append(child){this.children.push(child);child.parentNode=this;},
      remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);},
      replaceChildren(...children){this.children=children;}
    };
    node.style={}; node.dataset={};
    return node;
  }};
  function mount() {
    return Object.assign(doc.createElement('div'), {ownerDocument:doc,
      setAttribute(){},closest(){return null;},getBoundingClientRect(){return {width:W};}});
  }
  const root=mount(), lifeRoot=mount();
  const host = {CastawayWorld:world,CastawayLandscape:{...landscape,
    paint(ctx,...args) {
      landscape.paint(ctx,...args);
      geoCtx.drawImage(base,0,0);
      geoCtx.drawImage(ctx.canvas,0,0);
      captures++;
    }
  },setTimeout(fn,delay=0){timers.set(++next,{fn,due:clock+delay});return next;},clearTimeout(id){timers.delete(id);},
    requestAnimationFrame(fn){frames.set(++next,fn);return next;},cancelAnimationFrame(id){frames.delete(id);}};
  vm.runInNewContext(weatherSource,{window:host});
  vm.runInNewContext(foregroundSource,{window:host});
  host.CastawayWeather.render(root,state);
  host.CastawayLife.render(lifeRoot,state);
  const target=host.CastawayLife.features(state)[0];
  const material=lifeRoot.children[0].children.find(node=>node.className==='life-material');
  if (!captures || !material) throw Error('Room failed to mount '+scene);
  function advance(ms) {
    clock=ms;
    for(const [id,timer] of [...timers]) if(timer.due<=ms){timers.delete(id);timer.fn();}
    for(const [id,fn] of [...frames]){frames.delete(id);fn(ms);}
    fullCtx.drawImage(base,0,0);
    fullCtx.drawImage(root.children.find(node=>node.className==='wx-particles'),0,0);
    const [x,y,w,h]=target.materialBox;
    fullCtx.drawImage(material,x*W/100,y*H/100,w*W/100,h*H/100);
  }
  function interact(){return host.CastawayLife.tryFeature(lifeRoot,state,target.id);}
  return {state,plateFile,base,geology,full,target,material,advance,interact,
    dispose(){host.CastawayWeather.dispose(root);}};
}
module.exports = {dist, studio};

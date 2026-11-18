// Reconstruct the production SVG's planted sole and calibrated hand on the plate.
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path'), fs = require('node:fs');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const {studio,dist}=require('./runtime.cjs');
const Stage=require(path.join(dist,'stage-direction.js'));
const Ground=require(path.join(dist,'ground.js'));
const Work=require(path.join(dist,'work-poses.js'));
const Game=require(path.join(dist,'voyage.js'));
const World=require(path.join(dist,'voyage-world.js'));
const atlas=require(path.join(dist,'assets/work-poses/manifest.json')).assets;
const selected={
  camp:['Kolík ve větru','Alick McLaren  ·  tábor'],
  charcoal:['Křehký uhlík','Alick McLaren  ·  uhlířská jáma'],
  salvage:['Uvolněná tříska','Alick McLaren  ·  u vraku'],
  return_camp:['Napnutá nit','Thomas Musgrave  ·  při návratu']
};
async function main(){
  const sheet=createCanvas(1040,734),ctx=sheet.getContext('2d');
  ctx.fillStyle='#272c29';ctx.fillRect(0,0,sheet.width,sheet.height);
  const table=[];
  for(const room of Game.SCENES){
    const flags=room.id==='forge'?{bellowsFitted:true}:{};
    const model=await studio(room.id,flags);
    const state=Object.assign(Game.createGame(),{scene:room.id,chapter:room.chapter,flags});
    const f=model.target,actor=room.chapter>=6?'musgrave':'player',meta=atlas[actor];
    const feet=Ground.project(Stage.profile(room.id).walkPolygon,f.approach);
    const height=Stage.heightAt(room.id,feet.y)*5.625;
    const scale=height*meta.walkStandingHeight/meta.walkView[1];
    const hand=Work.contact(actor,f.pose),dir=f.x<feet.x?-1:1;
    const dx=feet.x*10+dir*hand.x*scale-f.x*10;
    const dy=feet.y*5.625-hand.y*scale-f.y*5.625;
    assert.ok(Math.abs(dx)<f.w*5 && Math.abs(dy)<f.h*5.625/2,f.id+' fingertips outside the click field');
    const targets=Game.getTargets(state).map(t=>Stage.stageTarget(room.id,World.stageTarget(t,state),state));
    const company=[...targets.filter(t=>t.kind==='person').map(t=>t.id),...Stage.companions(room.id,state)];
    for(const id of new Set(company)){
      const where=Stage.workStation(room.id,id,state);
      if(!where)continue;
      const h=Stage.heightAt(room.id,where.y),w=Math.max(6.5,Math.min(10.8,h*.213));
      assert.ok(Math.abs(where.x-f.x)>w/2||f.y<where.y-h||f.y>where.y,f.id+' is behind '+id);
    }
    table.push([room.id,f.id,actor,height.toFixed(1),Math.hypot(dx,dy).toFixed(1)].join('\t'));
    const slot=Object.keys(selected).indexOf(room.id);
    if(slot>=0){
      model.interact(); model.advance(500);model.advance(590);model.advance(680);model.advance(770);model.advance(860);
      const stage=createCanvas(1000,563),paint=stage.getContext('2d');paint.drawImage(model.full,0,0);
      const p=meta.poses[f.pose],stand=meta.poses.stand;
      const s=scale/(stand.measuredGround[1]-stand.alphaBounds[1]);
      const [x,y,w,h]=p.crop, [gx,gy]=p.measuredGround;
      const image=await loadImage(path.join(dist,meta.atlas));
      paint.save();paint.translate(feet.x*10,feet.y*5.625);paint.scale(dir*s,s);
      paint.drawImage(image,x,y,w,h,x-gx,y-gy,w,h);paint.restore();
      const cx=10*(feet.x+f.x)/2,cy=feet.y*5.625-.48*height;
      const sw=464,sh=248,left=Math.min(1000-sw,Math.max(0,cx-sw/2));
      const top=Math.min(563-sh,Math.max(0,cy-sh/2));
      const xx=18+slot%2*514,yy=18+Math.floor(slot/2)*358;
      ctx.drawImage(stage,left,top,sw,sh,xx,yy,490,262);
      ctx.fillStyle='#eee4cd';ctx.font='25px "DejaVu Serif"';ctx.fillText(selected[room.id][0],xx,yy+297);
      ctx.fillStyle='#c9bda2';ctx.font='16px "DejaVu Sans"';ctx.fillText(selected[room.id][1],xx,yy+322);
    }
    model.dispose();
  }
  console.log(['scene\tfeature\tactor\tstageBodyHeightPx\tfingertipMissPx',...table].join('\n'));
  if(process.argv.includes('--record')) fs.writeFileSync(path.join(__dirname,'gesta.webp'),sheet.toBuffer('image/webp',88));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

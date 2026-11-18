/* Render the production weather surface at a fixed timestep in Chromium.
   Run with Node, playwright, Chromium and ffmpeg (libwebp_anim). */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {spawnSync}=require('node:child_process');
const {once}=require('node:events');
const dist=path.resolve(__dirname,'../../dist');
const fixture='<!doctype html><meta charset="utf-8"><script src="voyage-world.js"></script><script src="landscape.js"></script><script src="weather.js"></script>';
const frames=80,fps=16;
async function main(){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'castaways-painted-water-'));
  let browser,server;
  try{
    server=http.createServer((req,res)=>{
      const pathname=new URL(req.url,'http://localhost').pathname;
      if(pathname==='/'){res.writeHead(200,{'Content-Type':'text/html'});return res.end(fixture);}
      const file=path.resolve(dist,'.'+pathname);
      if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
        res.writeHead(404);return res.end();
      }
      res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':'image/png'});fs.createReadStream(file).pipe(res);
    });
    server.listen(0,'127.0.0.1');await once(server,'listening');
    const executablePath=process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
    browser=await chromium.launch({executablePath,args:['--disable-dev-shm-usage']});
    const page=await browser.newPage({viewport:{width:1000,height:563},deviceScaleFactor:1});
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.evaluate(async()=>{
      // Only the scheduling boundary is replaced. Canvas 2D, cached painting
      // decode, masks, glints, snowfall and the scene model run in the browser.
      const timers=new Map(),frames=new Map();let handle=0;
      window.setTimeout=fn=>{timers.set(++handle,fn);return handle;};
      window.clearTimeout=id=>timers.delete(id);
      window.requestAnimationFrame=fn=>{frames.set(++handle,fn);return handle;};
      window.cancelAnimationFrame=id=>frames.delete(id);
      window.proofTick=now=>{
        for(const [id,fn] of [...timers]){timers.delete(id);fn();}
        for(const [id,fn] of [...frames]){frames.delete(id);fn(now);}
      };
      const specs=[
        {scene:'crossing',flags:{rigSecured:true},label:'The open sea',detail:'July 1865  /  Looking over the gunwale',crop:[380,173,426,261]},
        {scene:'forest',flags:{},label:'The winter stream',detail:'Epigwaitt  /  Water falling over two ledges',crop:[82,210,320,196]}
      ];
      window.panels=[];
      for(const s of specs){
        const el=document.createElement('div');
        el.style.cssText='position:absolute;left:0;top:0;width:1000px;height:562.5px';
        document.body.append(el);
        const img=new Image();img.src=CastawayWorld.background(s);await img.decode();
        CastawayWeather.render(el,s);
        window.panels.push({...s,img,el,wx:el.querySelector('.wx-particles')});
      }
      const sheet=document.createElement('canvas');sheet.width=880;sheet.height=354;
      const ctx=sheet.getContext('2d');
      window.proofFrame=n=>{
        proofTick(500+n*62.5);
        ctx.fillStyle='#292822';ctx.fillRect(0,0,880,354);
        ctx.textAlign='left';ctx.font='12px sans-serif';ctx.fillStyle='#d8c6a7';
        ctx.fillText('UNTIL WE RETURN',18,22);ctx.textAlign='right';ctx.fillStyle='#b6b5a6';ctx.fillText('STUDIES FROM THE MOVING PAINTINGS',862,22);
        ctx.textAlign='left';
        for(const [i,p] of panels.entries()){
          const x=18+426*i,y=37,w=418,h=256;const [left,top,cw,ch]=p.crop;
          for(const [pic,pw,ph] of [[p.img,p.img.naturalWidth,p.img.naturalHeight],[p.wx,p.wx.width,p.wx.height]]){
            ctx.drawImage(pic,left*pw/1000,top*ph/562.5,cw*pw/1000,ch*ph/562.5,x,y,w,h);
          }
          ctx.font='22px Georgia,serif';ctx.fillStyle='#f1e5d0';ctx.fillText(p.label,x,319);
          ctx.font='12px sans-serif';ctx.fillStyle='#cabda4';ctx.fillText(p.detail,x,338);
        }
        return sheet.toDataURL('image/png').split(',')[1];
      };
    });
    await page.waitForFunction(()=>panels.length===2 && panels.every(p=>p.el.dataset.landscape==='ready'),null,{polling:50});
    for(let i=0;i<frames;i++){
      const frame=await page.evaluate(i=>proofFrame(i),i);
      fs.writeFileSync(path.join(temp,String(i).padStart(3,'0')+'.png'),Buffer.from(frame,'base64'));
    }
    const target=path.join(__dirname,'sea-and-stream.webp');
    const result=spawnSync('ffmpeg',['-v','error','-y','-framerate',String(fps),'-i',path.join(temp,'%03d.png'),'-an','-c:v','libwebp_anim','-lossless','0','-quality','73','-compression_level','5','-loop','0',target],{stdio:'inherit'});
    if(result.status!==0)throw new Error('ffmpeg could not encode the sample');
    if(fs.statSync(target).size>3000000)throw new Error('Expected the proof to fit in 3 MB');
    console.log(frames+' production frames at '+fps+' fps; '+fs.statSync(target).size+' bytes.');
  } finally {
    if(browser)await browser.close();
    if(server)server.close();
    fs.rmSync(temp,{recursive:true,force:true});
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});

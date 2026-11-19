/* Material light for the painted stage. Art and actors stay in their own layers.
   The atlas is data, not an image to composite. RGB in zero-alpha texels matters.
   All lighting is linear until the final display transform. Intermediate targets
   store the premultiplied, tone-mapped overlay. They do not contain the painting. */
(function (host) {
  'use strict';
  const vertex = `#version 300 es
  out vec2 uv;
  void main() {
    vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    uv = p;
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  }`;
  const lighting = `#version 300 es
  precision highp float;
  in vec2 uv;
  out vec4 pixel;
  uniform sampler2D surfaceMap, mediumMap, lightMap;
  uniform vec2 jitter, lightOrigin, heatOrigin;
  uniform vec3 keyColor, heatColor;
  uniform vec4 optics; // exposure, edge falloff, bloom, volume
  uniform float ambientGain, warmth, heatRadius;
  uniform vec3 weather; // cloud cover, precipitation, lingering damp
  uniform float time, inside, heat, detail, strength, aspect;
  const float PI = 3.14159265;
  float luminance(vec3 x) {return dot(x, vec3(.2126,.7152,.0722));}
  vec3 linearize(vec3 c) {
    return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));
  }
  vec3 displayColor(vec3 c) {
    return mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1./2.4))-.055,step(vec3(.0031308),c));
  }
  vec3 film(vec3 x) {
    // ACES fitted display curve; the lighting computation may exceed 1.
    return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);
  }
  vec2 reliefUV(vec2 p, float height, vec3 view) {
    // 128 is the exact flat code outside authored solid material. Use a small
    // view-dependent ray with five layers. Refine the crossing by interpolation.
    float gate = smoothstep(.008,.055,abs(height-128./255.))*detail;
    if (gate < .01) return p;
    vec2 ray = vec2(view.x/aspect,-view.y)/view.z * .009*gate;
    vec2 delta = ray*.2;
    vec2 here = p + .5*ray;
    float layer = 0.;
    float depth = 1.-texture(surfaceMap,here).b;
    float before = depth;
    for (int i=0;i<5;i++) {
      if (layer>=depth) break;
      before = depth-layer;
      here -= delta;
      layer += .2;
      depth = 1.-texture(surfaceMap,here).b;
    }
    float beyond = max(layer-depth,0.);
    return here+delta*(beyond/max(.0001,before+beyond));
  }
  vec3 specBRDF(vec3 n, vec3 v, vec3 l, vec3 f0, float rough) {
    vec3 h=normalize(v+l);
    float nv=max(dot(n,v),.012), nl=max(dot(n,l),.001);
    float nh=max(dot(n,h),0.), vh=max(dot(v,h),0.);
    float a=rough*rough, a2=a*a;
    float denom=nh*nh*(a2-1.)+1.;
    float d=a2/(PI*denom*denom);
    float gv=nl*sqrt(nv*nv*(1.-a2)+a2);
    float gl=nv*sqrt(nl*nl*(1.-a2)+a2);
    vec3 fresnel=f0+(1.-f0)*pow(1.-vh,5.);
    return fresnel*d*.5/max(.0001,gv+gl)*nl;
  }
  void main() {
    // Screen UV is bottom-up, atlas rows start at the top, normals are Y-up.
    vec2 p=vec2(uv.x,1.-uv.y)+jitter;
    vec3 v=normalize(vec3((.50-p.x)*.54,(p.y-.55)*.32,1.));
    vec4 surf=texture(surfaceMap,p);
    vec2 q=reliefUV(p,surf.b,v);
    surf=texture(surfaceMap,q);
    vec4 m=texture(mediumMap,p), lm=texture(lightMap,p);
    vec2 xy=(surf.rg*255.-128.)/127.;
    vec3 n=normalize(vec3(xy,sqrt(max(.025,1.-dot(xy,xy)))));
    float ao=m.b, metal=m.r, receiver=m.g;
    float wet=receiver*(.30+.70*max(weather.y,weather.z));
    float rough=clamp(surf.a*(1.-.41*wet),.19,1.);
    vec3 f0=mix(vec3(.04),vec3(.60,.53,.45),metal);
    vec2 offset=vec2((lightOrigin.x-p.x)*aspect,p.y-lightOrigin.y);
    vec3 l=normalize(vec3(offset,.64));
    float nl=max(dot(n,l),0.);
    vec3 ambient=linearize(lm.rgb);
    float clear=1.-weather.x;
    float daylight=(.46+.54*clear)*mix(1.,.76,inside);
    vec3 sky=keyColor*mix(vec3(.75,.86,1.),vec3(1.),clear)*daylight;
    vec3 dielectric=(1.-f0)*(1.-metal);
    vec3 diffuse=dielectric*nl/PI;
    vec3 direct=sky*(diffuse+specBRDF(n,v,l,f0,rough));
    vec3 fdir=normalize(vec3((heatOrigin.x-p.x)*aspect,p.y-heatOrigin.y,.15));
    float lampFalloff=heat/(1.+3./max(.003,heatRadius*heatRadius)*dot((p-heatOrigin)*vec2(aspect,1.),(p-heatOrigin)*vec2(aspect,1.)));
    vec3 lamp=heatColor*5.*lampFalloff;
    vec3 local=lamp*(dielectric*max(dot(n,fdir),0.)/PI+specBRDF(n,v,fdir,f0,rough));

    // Wet receivers reflect the local baked light field. Sampling its mirrored
    // elevation gives the water a broken reflection without sampling actors.
    vec3 reflection=vec3(0.);
    if(receiver>.015) {
      float ripple=sin(p.y*330.+time*1.08+sin(p.x*25.))*.004*wet;
      vec2 skyUV=clamp(vec2(p.x+xy.x*.046+ripple, .57-.57*p.y+xy.y*.028),.01,.99);
      vec3 environment=linearize(texture(lightMap,skyUV).rgb)*1.6+sky*.31;
      float grazing=pow(1.-clamp(abs(n.y+.27),0.,1.),5.);
      reflection=environment*wet*(.16+.84*grazing)*(1.-.55*rough);
    }

    // A baked shaft stores integrated path density / occlusion, not a screen-
    // wide fog rectangle. A short transmittance integral samples upstream.
    vec2 march=(lightOrigin-p)*.013;
    float upstream=texture(lightMap,p+march).a*.55+texture(lightMap,p+2.*march).a*.45;
    float optical=lm.a*(.58+.42*upstream)*(.75+.45*weather.y)*ao;
    vec3 shaft=sky*(1.-exp(-optical*1.65))*optics.w*5.;
    float emission=m.a*heat;
    vec3 emitted=heatColor*7.*emission;
    vec2 texel=1./vec2(textureSize(mediumMap,0));
    float halo=0.;
    if (heat>.001) {
      halo=(texture(mediumMap,p+texel*vec2(2.5,0)).a+
            texture(mediumMap,p-texel*vec2(2.5,0)).a+
            texture(mediumMap,p+texel*vec2(0,2.5)).a+
            texture(mediumMap,p-texel*vec2(0,2.5)).a)*.25*heat;
    }
    // Small bloom from the bright emissive field, before exposure and film.
    vec3 bloom=heatColor*optics.z*12.*max(halo-.06,0.)*ao;
    vec3 hdr=(direct+local+reflection)*ao+ambient*ambientGain+shaft+emitted+bloom;
    float edge=dot((p-.5)*vec2(1.15,.86),(p-.5)*vec2(1.15,.86));
    float exposure=optics.x*(1.-optics.y*edge);
    hdr*=vec3(1.+warmth,1.,1.-warmth);
    vec3 lit=displayColor(film(hdr*exposure));
    float glint=luminance(specBRDF(n,v,l,f0,rough)*sky);
    float volume=luminance(shaft), shine=luminance(reflection);
    float bounce=clamp(luminance(ambient)-.215,-.20,.55);
    float litAlpha=(.022+.086*nl+.13*max(0.,bounce)+.22*shine+
      .19*min(glint,1.)+.25*volume+.25*emission+.13*lampFalloff+.11*halo)*ao;
    float shadeAlpha=optics.y*.58*edge+.12*(1.-ao)+.084*weather.x+.064*max(0.,l.z-nl);
    litAlpha=clamp(litAlpha*strength,0.,.55);
    shadeAlpha=clamp(shadeAlpha*strength,0.,.29);
    // Source-over, premultiplied sRGB for the DOM compositor.
    vec3 color=lit*litAlpha+vec3(.047,.069,.093)*shadeAlpha*(1.-litAlpha);
    pixel=vec4(color,litAlpha+shadeAlpha*(1.-litAlpha));
  }`;
  const resolve = `#version 300 es
  precision highp float;
  in vec2 uv;
  out vec4 pixel;
  uniform sampler2D frame, history;
  uniform vec2 stepUV;
  uniform float pastWeight;
  uniform int filterMode; // 0 = exact sample; 1 = FXAA; 2 = clamped TAA resolve.
  float luma(vec4 c) {
    // Include alpha coverage, measured over neutral paper. A silhouette in a
    // pure-black shadow overlay would disappear from premultiplied RGB alone.
    return dot(c.rgb,vec3(.299,.587,.114))+.45*(1.-c.a);
  }
  void main(){
    vec4 c=texture(frame,uv);
    if(filterMode==0){pixel=c;return;}
    vec4 nw=texture(frame,uv+stepUV*vec2(-1,1)), ne=texture(frame,uv+stepUV);
    vec4 sw=texture(frame,uv-stepUV), se=texture(frame,uv+stepUV*vec2(1,-1));
    if(filterMode==2){
      vec4 low=min(c,min(min(nw,ne),min(sw,se))), high=max(c,max(max(nw,ne),max(sw,se)));
      vec4 old=clamp(texture(history,uv),low,high);
      float change=abs(luma(old)-luma(c));
      pixel=mix(c,old,pastWeight*(1.-smoothstep(.018,.08,change)));
      return;
    }
    float a=luma(nw),b=luma(ne),d=luma(sw),e=luma(se),center=luma(c);
    float low=min(center,min(min(a,b),min(d,e))), high=max(center,max(max(a,b),max(d,e)));
    if(high-low<max(.003,high*.016)){pixel=c;return;}
    vec2 dir=vec2(-(a+b-d-e),a+d-b-e);
    float reduce=max((a+b+d+e)*.03125,.001);
    dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+reduce),-5.,5.)*stepUV;
    vec4 inner=.5*(texture(frame,uv-dir/6.)+texture(frame,uv+dir/6.));
    vec4 full=.5*inner+.25*(texture(frame,uv-.5*dir)+texture(frame,uv+.5*dir));
    float f=luma(full);
    pixel=(f<low||f>high)?inner:full;
  }`;

  const indoor = new Set(['cabin','forge','chartroom','return_camp']);

  // These four +/- quarter-pixel phase offsets have a zero-mean cycle.
  const samples = [[-.375,-.125],[.125,-.375],[.375,.125],[-.125,.375]];
  const clamp = (n,lo,hi) => Math.min(hi,Math.max(lo,n));
  const value = (n,fallback) => Number.isFinite(n)?n:fallback;
  function program(gl, source, names) {
    const handle=gl.createProgram(), shaders=[];
    try {
      for(const [type,body] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,source]]) {
        const shader=gl.createShader(type);
        shaders.push(shader);
        gl.shaderSource(shader,body);gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
        gl.attachShader(handle,shader);
      }
      gl.linkProgram(handle);
      if(!gl.getProgramParameter(handle,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(handle));
      const u=Object.fromEntries(names.split(' ').map(name=>[name,gl.getUniformLocation(handle,name)]));
      return {handle,u};
    } catch(error) {gl.deleteProgram(handle);throw error;}
    finally {shaders.forEach(shader=>gl.deleteShader(shader));}
  }
  function texture(gl) {
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    return tex;
  }
  function target(gl,w,h) {
    const tex=texture(gl),fb=gl.createFramebuffer();
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteTexture(tex);gl.deleteFramebuffer(fb);throw Error('framebuffer');
    }
    return {tex,fb,w,h};
  }
  async function decode(uri) {
    // HTML image / 2D canvas decoding can irreversibly clear RGB where A=0.
    // Use the room's static CSS mask on platforms without a raw bitmap decoder.
    if (!host.createImageBitmap || !host.fetch) throw Error('raw bitmap unavailable');
    const response=await host.fetch(uri);
    if(!response.ok)throw Error('atlas read');
    return host.createImageBitmap(await response.blob(),{colorSpaceConversion:'none',premultiplyAlpha:'none'});
  }

  function create(canvas,{onStatus}={}) {
    let gl=null, shaders=null, vao=null, maps=[], buffers=[], history=[], signature='';
    let latest=null, sceneKey=null, entry=null, mapKey=null, epoch=0, dead=false, lost=false, unsupported='';
    let frameCount=0, sampleCount=0, last=null, previousTime=0, previousDraw=-Infinity;
    let state={state:'idle',key:'',quality:'off',antialias:'off',reason:''};
    const put=(key,val)=>{if(canvas.dataset[key]!==String(val))canvas.dataset[key]=String(val);};
    function report(kind,key,quality,antialias,reason='') {
      const same=state.state===kind&&state.key===key&&state.quality===quality&&
        state.antialias===antialias&&state.reason===reason;
      state={state:kind,key,quality,antialias,reason};
      put('materialState',kind);put('materialKey',key);put('materialQuality',quality);
      put('antialias',antialias);put('materialReason',reason);
      if(!same&&onStatus)onStatus({...state});
    }
    function resetHistory() {
      sampleCount=0;last=null;previousDraw=-Infinity;put('materialHistory',0);
    }
    function clear() {
      if(gl&&!lost){
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
    function cleanMask() {
      canvas.style.background='';canvas.style.maskImage='';canvas.style.maskSize='';
      canvas.style.webkitMaskImage='';canvas.style.webkitMaskSize='';
    }
    let fallbackKey=null;
    function fallback(reason) {
      if(!latest)return;
      const key=entry?.key||latest.scene;
      // Low-capability and context-lost devices still see the authored static
      // shaft shape. Only alpha is significant to the CSS mask.
      if(fallbackKey!==key) {
        fallbackKey=key;cleanMask();
        if(entry?.light){
          const dir=profile(latest), rgb=dir.key.color.map(v=>Math.round(v*255)).join(',');
          canvas.style.background='rgba('+rgb+',0.075)';
          canvas.style.maskImage='url("'+entry.light+'")';
          canvas.style.webkitMaskImage=canvas.style.maskImage;
          canvas.style.maskSize='100% 100%';canvas.style.webkitMaskSize='100% 100%';
        }
      }
      report('fallback',key,'static','static',reason);
    }
    function freeBuffers() {
      for(const b of buffers) {gl.deleteTexture(b.tex);gl.deleteFramebuffer(b.fb);}
      buffers=[];history=[];signature='';
    }
    function freeMaps() { maps.forEach(tex=>gl.deleteTexture(tex));maps=[]; }
    function initialize() {
      try {
        gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,
          stencil:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
        if(!gl){unsupported='no-webgl2';return;}
        const light=program(gl,lighting,'surfaceMap mediumMap lightMap jitter lightOrigin heatOrigin keyColor heatColor optics ambientGain warmth heatRadius weather time inside heat detail strength aspect');
        try {shaders={light,resolve:program(gl,resolve,'frame history stepUV pastWeight filterMode')};}
        catch(error){gl.deleteProgram(light.handle);throw error;}
        vao=gl.createVertexArray();gl.bindVertexArray(vao);
        gl.disable(gl.BLEND);gl.disable(gl.DITHER);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
        gl.useProgram(shaders.light.handle);
        ['surfaceMap','mediumMap','lightMap'].forEach((name,i)=>gl.uniform1i(shaders.light.u[name],i));
        gl.useProgram(shaders.resolve.handle);
        gl.uniform1i(shaders.resolve.u.frame,0);gl.uniform1i(shaders.resolve.u.history,1);
        unsupported='';
      } catch(_) {unsupported='webgl-setup';}
    }
    function bind(tex,index) {
      gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,tex);
    }
    async function loadMap(atlas,request) {
      const results=await Promise.allSettled([atlas.surface,atlas.medium,atlas.light].map(decode));
      const images=results.filter(r=>r.status==='fulfilled').map(r=>r.value);
      try {
        if(dead||request!==epoch||lost)return;
        if(images.length!==3)throw Error('atlas decode');
        for(const img of images) {
          if(!img.width||img.width!==atlas.width||img.height!==atlas.height)throw Error('atlas dimensions');
          const tex=texture(gl);maps.push(tex);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        }
        if(gl.getError()!==gl.NO_ERROR)throw Error('atlas texture upload');
        mapKey=atlas.key;
        render(latest);
      } catch(_) {
        if(!dead&&!lost&&request===epoch){freeMaps();fallback('atlas-load');}
      } finally {images.forEach(img=>img.close?.());}
    }
    function profile(f) {
      const flags=f.flags||{};
      const dir=f.direction||host.CastawayLightingDirection?.resolve(f.scene,f.weather,flags);
      if(dir)return dir;
      return {key:{x:.25,y:.20,color:[.83,.87,.92],intensity:.70}, practical:null,
        exposure:.98,warmth:0,ambient:.68,lens:.1,bloom:.08,volume:.12};
    }
    function sizeFrame(f,quality,aa) {
      const ratio=clamp(value(f.dpr,host.devicePixelRatio||1),.5,quality==='high'?1.5:1);
      const cssW=value(f.width,canvas.clientWidth||640),cssH=value(f.height,canvas.clientHeight||360);
      const limit=quality==='high'?1216:quality==='low'?576:896;
      const scale=Math.min(ratio,limit/Math.max(1,cssW,cssH));
      const w=Math.max(1,Math.round(cssW*scale)),h=Math.max(1,Math.round(cssH*scale));
      const internal=aa==='taau'?.74:1;
      const id=w+'x'+h+'@'+internal+aa;
      if(id===signature)return;
      freeBuffers();resetHistory();
      canvas.width=w;canvas.height=h;
      buffers.push(target(gl,Math.max(1,Math.round(w*internal)),Math.max(1,Math.round(h*internal))));
      if(aa==='taau') {
        for(let i=0;i<2;i++){const b=target(gl,w,h);buffers.push(b);history.push(b);}
      }
      signature=id;
    }
    function qualityOf(mode) {
      if(mode==='auto'||!mode) {
        return (host.navigator?.hardwareConcurrency||4)>=6 &&
          !host.matchMedia?.('(pointer: coarse)').matches ? 'high':'balanced';
      }
      if(mode==='high'||mode==='cinematic')return 'high';
      return mode==='low'?'low':'balanced';
    }
    function draw(f,quality,aa) {
      sizeFrame(f,quality,aa);
      const frame=buffers[0], still=!!(f.paused||f.reduced||quality==='low');
      const w=f.weather||{}, cloud=clamp(value(w.shade,.18),0,1), rain=clamp(value(w.rain,0),0,1);
      const damp=clamp(value(f.damp,value(w.damp,rain)),0,1);
      const t=value(f.time,0),dir=profile(f), practical=dir.practical;
      const motion=f.motionKey??f.cameraKey??'';
      const jump=!last||last.aa!==aa||last.quality!==quality||last.still!==still||last.motion!==motion||
        t<previousTime||Math.abs(t-previousTime)>1.7||Math.abs(last.cloud-cloud)>.13||
        Math.abs(last.rain-rain)>.16||Math.abs(last.damp-damp)>.18||last.heat!==(practical?.intensity||0)||
        Math.abs(last.exposure-dir.exposure)>.08||Math.hypot(last.x-dir.key.x,last.y-dir.key.y)>.025;
      previousTime=t;
      if(jump)resetHistory();
      if(!jump&&still)return;
      // The material maps have far less spatial bandwidth than the stage art.
      // Leave the game loop responsive and the plate and actors at full detail.
      if(!jump&&t-previousDraw<1/(quality==='high'?20:13))return;
      previousDraw=t;
      const sample=aa==='taau'?samples[sampleCount%4]:[0,0],light=shaders.light.u;
      gl.bindVertexArray(vao);gl.useProgram(shaders.light.handle);
      gl.bindFramebuffer(gl.FRAMEBUFFER,frame.fb);gl.viewport(0,0,frame.w,frame.h);
      maps.forEach(bind);
      gl.uniform2f(light.jitter,sample[0]/frame.w,sample[1]/frame.h);
      gl.uniform2f(light.lightOrigin,dir.key.x,dir.key.y);
      gl.uniform2f(light.heatOrigin,practical?.x||0,practical?.y||0);
      // Profile RGB is display encoded. Exposure and intensity act on radiance.
      const srgb=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
      gl.uniform3fv(light.keyColor,dir.key.color.map(c=>srgb(c)*dir.key.intensity*2.4));
      gl.uniform3fv(light.heatColor,(practical?.color||[1,.55,.26]).map(srgb));
      gl.uniform4f(light.optics,dir.exposure,dir.lens,dir.bloom,dir.volume);
      gl.uniform1f(light.ambientGain,dir.ambient);gl.uniform1f(light.warmth,dir.warmth);
      gl.uniform1f(light.heatRadius,practical?.radius||.24);
      gl.uniform3f(light.weather,cloud,rain,damp);gl.uniform1f(light.time,still?0:t%4000);
      gl.uniform1f(light.inside,indoor.has(f.scene)?1:0);
      gl.uniform1f(light.heat,practical?.intensity||0);
      gl.uniform1f(light.detail,quality==='low'?0:1);
      gl.uniform1f(light.strength,quality==='low'?.62:1);
      gl.uniform1f(light.aspect,frame.w/frame.h);
      gl.drawArrays(gl.TRIANGLES,0,3);

      const temporal=aa==='taau', final=temporal?history[0]:null;
      gl.bindFramebuffer(gl.FRAMEBUFFER,final?.fb||null);
      gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(shaders.resolve.handle);
      bind(frame.tex,0);bind(temporal?history[1].tex:frame.tex,1);
      const u=shaders.resolve.u;
      gl.uniform2f(u.stepUV,1/frame.w,1/frame.h);
      gl.uniform1i(u.filterMode,temporal?2:aa==='fxaa'?1:0);
      gl.uniform1f(u.pastWeight,temporal?Math.min(sampleCount/(sampleCount+1),.75):0);
      gl.drawArrays(gl.TRIANGLES,0,3);
      if(temporal) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER,final.fb);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,null);
        gl.blitFramebuffer(0,0,final.w,final.h,0,0,canvas.width,canvas.height,gl.COLOR_BUFFER_BIT,gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        history.reverse();sampleCount++;
      }
      last={quality,aa,still,motion,cloud,rain,damp,heat:practical?.intensity||0,
        exposure:dir.exposure,x:dir.key.x,y:dir.key.y};
      put('materialFrames',++frameCount);put('materialHistory',Math.min(4,sampleCount));
      report('ready',mapKey,quality,aa);
    }
    function render(f) {
      if(dead||!f)return;
      latest=f;
      if(f.mode==='off'||f.mode==='original') {
        if(state.state==='off')return;
        ++epoch;entry=null;sceneKey=null;mapKey=null;fallbackKey=null;
        if(gl&&!lost){freeMaps();freeBuffers();clear();}
        cleanMask();resetHistory();report('off','','off','off');return;
      }
      const atlas=host.CastawayMaterialAtlas?.get(f.scene,f.flags||{})||null;
      if(f.scene!==sceneKey||atlas?.key!==entry?.key) {
        ++epoch;sceneKey=f.scene;mapKey=null;entry=atlas;fallbackKey=null;
        if(gl&&!lost){clear();freeMaps();}
        cleanMask();resetHistory();
        if(!atlas){fallback('no-atlas');return;}
        if(!unsupported&&!lost){
          report('loading',atlas.key,qualityOf(f.mode),'off');loadMap(atlas,epoch);
          return;
        }
      }
      if(!atlas||unsupported||lost){fallback(lost?'context-lost':unsupported||'no-atlas');return;}
      if(mapKey!==atlas.key)return;
      const quality=qualityOf(f.mode), still=f.paused||f.reduced||quality==='low';
      let aa='fxaa';
      if(f.aa==='off')aa='off';
      else if(quality==='high'&&!still&&f.aa!=='fxaa')aa='taau';
      try {draw(f,quality,aa);}
      catch(_){unsupported='draw-unavailable';clear();fallback(unsupported);}
    }
    function onLost(e) {
      e.preventDefault();lost=true;++epoch;entry=latest?host.CastawayMaterialAtlas?.get(latest.scene,latest.flags||{}):null;
      mapKey=null;buffers=[];history=[];maps=[];shaders=null;vao=null;signature='';resetHistory();
      if(latest&&latest.mode!=='off'&&latest.mode!=='original')fallback('context-lost');
    }
    function onRestore() {
      if(dead)return;
      lost=false;entry=null;mapKey=null;fallbackKey=null;cleanMask();initialize();
      if(latest)render(latest);
    }
    function dispose() {
      if(dead)return;
      dead=true;++epoch;canvas.removeEventListener('webglcontextlost',onLost);
      canvas.removeEventListener('webglcontextrestored',onRestore);
      if(gl&&!lost){
        freeBuffers();freeMaps();
        if(shaders){gl.deleteProgram(shaders.light.handle);gl.deleteProgram(shaders.resolve.handle);}
        gl.deleteVertexArray(vao);clear();
      }
      cleanMask();report('off','','off','off');
    }
    canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestore);
    initialize();
    return {render,dispose,get status(){return {...state,frames:frameCount,history:Math.min(sampleCount,4)};}};
  }
  const api={create};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else host.CastawayMaterialRenderer=api;
})(typeof window!=='undefined'?window:globalThis);

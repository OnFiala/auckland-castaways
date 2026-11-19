/* Subpixel coverage of the boundary between the painted puddle and dry ground.
   The scene light is a full-screen pass. Multisampling belongs here, on actual
   geometry. Rasterize the small mask once and let the compositor reuse it. */
(function (host, factory) {
  const api = factory(host);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else host.CastawayEdgeCoverage = api;
})(typeof window !== 'undefined' ? window : globalThis, function (host) {
  'use strict';
  const jobs = new WeakMap(), images = new Map();
  let renderer;

  const turn = (a,b,c) => (b.x-a.x)*(c.y-a.y) - (b.y-a.y)*(c.x-a.x);
  function triangles(points) {
    const ring = points.slice(), result = [];
    const area = ring.reduce((n,p,i) => {
      const q=ring[(i+1)%ring.length]; return n+p.x*q.y-p.y*q.x;
    },0);
    if (area < 0) ring.reverse();
    while (ring.length > 2) {
      let ear = -1;
      for (let i=0;i<ring.length;i++) {
        const a=ring[(i+ring.length-1)%ring.length], b=ring[i], c=ring[(i+1)%ring.length];
        if (turn(a,b,c) <= 1e-7) continue;
        const occupied = ring.some(p=>p!==a && p!==b && p!==c &&
          turn(a,b,p)>=0 && turn(b,c,p)>=0 && turn(c,a,p)>=0);
        if (!occupied) {
          result.push(a,b,c);
          ear=i;
          break;
        }
      }
      if (ear === -1) return [];
      ring.splice(ear,1);
    }
    return result;
  }

  function device() {
    if (renderer !== undefined) return renderer;
    renderer = null;
    const canvas = host.document.createElement('canvas');
    const gl = canvas.getContext('webgl2',{alpha:true, antialias:false, depth:false,
      stencil:false, premultipliedAlpha:true, powerPreference:'low-power'});
    if (!gl) return null;
    const samples = Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER,gl.RGBA8,gl.SAMPLES))
      .filter(n=>n>1 && n<=4).sort((a,b)=>b-a)[0];
    if (!samples) return null;
    const program=gl.createProgram(), shaders=[];
    try {
      for (const [type,source] of [
        [gl.VERTEX_SHADER,'#version 300 es\nlayout(location=0) in vec2 point; void main(){gl_Position=vec4(point,0.,1.);}'],
        [gl.FRAGMENT_SHADER,'#version 300 es\nprecision mediump float; out vec4 ink; void main(){ink=vec4(1.);}']
      ]) {
        const shader=gl.createShader(type); shaders.push(shader);
        gl.shaderSource(shader,source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error('coverage shader');
        gl.attachShader(program,shader);
      }
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error('coverage program');
    } catch (_) {
      gl.deleteProgram(program);
      return null;
    } finally { shaders.forEach(shader=>gl.deleteShader(shader)); }
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;});
    canvas.addEventListener('webglcontextrestored',()=>{renderer=undefined;});
    renderer={canvas,gl,program,samples};
    return renderer;
  }

  function mask(points,width) {
    const gpu=device(), mesh=triangles(points);
    if (!gpu || !mesh.length) return null;
    const {canvas,gl,program,samples}=gpu;
    const height=Math.round(width*9/16);
    canvas.width=width;canvas.height=height;
    const color=gl.createRenderbuffer(), fb=gl.createFramebuffer(), vertices=gl.createBuffer();
    try {
      gl.bindRenderbuffer(gl.RENDERBUFFER,color);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER,samples,gl.RGBA8,width,height);
      gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,color);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE) return null;
      gl.viewport(0,0,width,height);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      const data = new Float32Array(mesh.flatMap(p=>[p.x/50-1,1-p.y/50]));
      gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STREAM_DRAW);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
      gl.drawArrays(gl.TRIANGLES,0,mesh.length);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,null);
      gl.blitFramebuffer(0,0,width,height,0,0,width,height,gl.COLOR_BUFFER_BIT,gl.NEAREST);
      if (gl.isContextLost()) return null;
      const url=canvas.toDataURL('image/png');
      return url.startsWith('data:image/png;') ? {url,samples} : null;
    } finally {
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.deleteFramebuffer(fb);gl.deleteRenderbuffer(color);gl.deleteBuffer(vertices);
      // Keep the tiny program, release the full-sized drawing buffer until
      // another receiver is visited. The CSS mask now owns a static PNG.
      canvas.width=1;canvas.height=1;
    }
  }

  function update(element,name,points,cssWidth,enabled) {
    if (!element || !cssWidth) return;
    const width = Math.max(256,Math.min(1152,Math.round(cssWidth/128)*128));
    const key=enabled ? name+'@'+width : '';
    const old=jobs.get(element);
    if (old?.key===key) return;
    const entry={key,clip:old?.clip||element.style.clipPath};
    jobs.set(element,entry);
    element.style.clipPath=entry.clip;
    element.style.maskImage='';
    element.dataset.coverage='polygon';
    if (!enabled) return;
    function commit(image) {
      if (!image || jobs.get(element)!==entry || !element.isConnected) return;
      element.style.maskImage='url("'+image.url+'")';
      element.style.maskSize='100% 100%';
      element.style.maskRepeat='no-repeat';
      element.style.clipPath='none';
      element.dataset.coverage='msaa-'+image.samples;
    }
    if (images.has(key)) { commit(images.get(key)); return; }
    const bake=()=>{
      if (jobs.get(element)!==entry || !element.isConnected) return;
      let image=null;
      try { image=mask(points,width); } catch (_) { /* Keep the painted polygon on this device. */ }
      if (images.size>=8) images.delete(images.keys().next().value);
      if (image) images.set(key,image);
      commit(image);
    };
    if (host.requestIdleCallback) host.requestIdleCallback(bake,{timeout:650});
    else host.setTimeout(bake,0);
  }
  return {update,triangles};
});

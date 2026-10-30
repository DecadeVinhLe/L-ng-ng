/**
 * Real-time 3D coffee cup, no libraries: a WebGL fragment shader ray-marches a cup, saucer,
 * beans and table with soft shadows, ambient occlusion, reflections and steam.
 * If WebGL is missing, callers keep the drawn illustrations.
 */
const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes,uOff; uniform float uT,uAng,uZ,uArt,uSteam; uniform vec3 uLiq,uTab,uBg;
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float cyl(vec3 p,float r,float h){vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h);return min(max(d.x,d.y),0.)+length(max(d,0.));}
float ell(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/k1;}
vec2 map(vec3 p){
  float tb=p.y+.30; vec2 r=vec2(tb,0.);
  vec3 s=p-vec3(0.,-.255,0.);
  float sauc=smin(cyl(s,.85,.02)-.01,length(vec2(length(s.xz)-.83,s.y-.03))-.025,.05);
  vec3 c=p-vec3(0.,.3055,0.);
  float outer=max(length(c)-.5055,p.y-.38), inner=length(c)-.4555;
  float body=max(outer,-inner);
  body=smin(body,cyl(p-vec3(0.,-.2,0.),.2,.03)-.01,.05);
  vec3 q=p-vec3(.52,.12,0.);
  float hdl=max(length(vec2(length(q.xy)-.17,q.z))-.04,-inner);
  float cer=min(min(body,hdl),sauc);
  if(cer<r.x)r=vec2(cer,1.);
  float cof=cyl(p-vec3(0.,.284,0.),.46,.004);
  if(cof<r.x)r=vec2(cof,2.);
  float b=min(ell(p-vec3(1.05,-.27,.35),vec3(.075,.045,.05)),min(ell(p-vec3(-1.0,-.27,.7),vec3(.05,.045,.075)),ell(p-vec3(.8,-.27,1.0),vec3(.07,.045,.05))));
  if(b<r.x)r=vec2(b,3.);
  return r;
}
vec3 nor(vec3 p){vec2 e=vec2(.0012,-.0012);return normalize(e.xyy*map(p+e.xyy).x+e.yyx*map(p+e.yyx).x+e.yxy*map(p+e.yxy).x+e.xxx*map(p+e.xxx).x);}
float shadow(vec3 ro,vec3 rd){float res=1.,t=.02;for(int i=0;i<28;i++){float h=map(ro+rd*t).x;res=min(res,10.*h/t);t+=clamp(h,.02,.3);if(res<.01||t>4.)break;}return clamp(res,0.,1.);}
float ao(vec3 p,vec3 n){float o=0.,sc=1.;for(int i=1;i<=5;i++){float h=.02+.09*float(i);o+=(h-map(p+n*h).x)*sc;sc*=.75;}return clamp(1.-1.6*o,0.,1.);}
float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float vnoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 sky(vec3 rd){
  vec3 s=mix(uBg*.35,uBg*1.25,smoothstep(-.1,.8,rd.y));
  s+=pow(max(dot(rd,normalize(vec3(-.5,.6,.6))),0.),18.)*vec3(1.,.8,.55)*1.6;
  return s;
}
void main(){
  vec2 p=(2.*gl_FragCoord.xy-uRes)/uRes.y-uOff;
  vec3 ta=vec3(0.,.08,0.), ro=ta+3.4*vec3(sin(uAng)*cos(.36),sin(.36),cos(uAng)*cos(.36));
  vec3 cw=normalize(ta-ro),cu=normalize(cross(cw,vec3(0.,1.,0.))),cv=cross(cu,cw);
  vec3 rd=normalize(p.x*cu+p.y*cv+uZ*cw);
  float t=0.;vec2 h=vec2(1.,-1.);
  for(int i=0;i<90;i++){h=map(ro+rd*t);if(h.x<.0006||t>14.)break;t+=h.x;}
  vec3 col=sky(rd)*.9; float hitT=14.;
  if(t<14.){
    hitT=t; vec3 pos=ro+rd*t,n=nor(pos);
    vec3 L=normalize(vec3(-.6,.9,.55)); vec3 hv=normalize(L-rd);
    float dif=max(dot(n,L),0.)*shadow(pos+n*.01,L), a=ao(pos,n);
    float fr=pow(1.-max(dot(n,-rd),0.),5.);
    vec3 alb=vec3(.95,.92,.86); float spc=.7,rf=.04,sh=90.;
    if(h.y<.5){ alb=uTab*.5*(.88+.12*sin(pos.x*9.+vnoise(pos*vec3(2.,30.,2.))*3.)); spc=.08;rf=.02;sh=30.; }
    else if(h.y>2.5){ alb=vec3(.20,.10,.05); spc=.5; sh=40.; }
    else if(h.y>1.5){
      vec2 u=vec2(pos.x,-pos.z)/.3+vec2(0.,.1);
      float heart=pow(u.x*u.x+u.y*u.y-1.,3.)-u.x*u.x*u.y*u.y*u.y;
      float m=(1.-smoothstep(-.02,.02,heart))*uArt;
      m+=uArt*.55*(1.-smoothstep(.02,.07,abs(length(pos.xz)-.38)));
      alb=mix(uLiq,vec3(.93,.80,.62),clamp(m,0.,1.)); spc=1.; rf=.1; sh=140.;
    }
    vec3 amb=mix(uBg*.25,uBg*.9,n.y*.5+.5)*a;
    col=alb*(vec3(1.,.86,.7)*1.8*dif+amb*.9);
    col+=vec3(1.,.9,.75)*pow(max(dot(n,hv),0.),sh)*spc*dif*2.;
    col=mix(col,sky(reflect(rd,n))*a,clamp(rf+fr*.8*(h.y<.5?.0:1.),0.,1.));
    col=mix(col,sky(rd)*.9,smoothstep(6.,14.,t));
  }
  if(uSteam>.5){
    float acc=0.,t0=dot(ta-ro,rd)-1.8;
    for(int i=0;i<22;i++){
      float tt=t0+float(i)*.17; if(tt>hitT)break;
      vec3 q=ro+rd*tt; float y=q.y-.3; if(y<0.||y>1.8)continue;
      vec2 sw=vec2(sin(y*3.-uT*1.1),cos(y*2.4-uT*.9))*.15*y;
      float rad=length(q.xz-sw), w=.2+.2*y;
      float nz=vnoise(vec3(q.xz*4.,y*1.8-uT*.9))*.65+vnoise(vec3(q.xz*9.,y*3.5-uT*1.4))*.35;
      acc+=(1.-smoothstep(0.,w,rad))*smoothstep(.42,.72,nz)*(1.-smoothstep(.3,1.8,y))*.4;
    }
    col+=vec3(1.,.97,.92)*min(acc,.8);
  }
  col=(col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
  gl_FragColor=vec4(pow(col,vec3(.4545)),1.);
}`;
/** Same six drinks as the illustrations: espresso, cappuccino, matcha, mocha, cold brew, pour over. */
const LOOKS = [
    { liq: [0.1, 0.05, 0.025], art: 0, tab: [0.36, 0.21, 0.12], bg: [0.55, 0.32, 0.17] },
    { liq: [0.42, 0.26, 0.15], art: 1, tab: [0.4, 0.24, 0.15], bg: [0.6, 0.36, 0.2] },
    { liq: [0.42, 0.55, 0.22], art: 1, tab: [0.3, 0.2, 0.12], bg: [0.35, 0.45, 0.28] },
    { liq: [0.2, 0.09, 0.06], art: 1, tab: [0.34, 0.19, 0.16], bg: [0.5, 0.26, 0.3] },
    { liq: [0.07, 0.04, 0.03], art: 0, tab: [0.25, 0.2, 0.22], bg: [0.3, 0.38, 0.55] },
    { liq: [0.25, 0.12, 0.06], art: 0, tab: [0.42, 0.27, 0.14], bg: [0.62, 0.42, 0.18] },
];
/** Hero: espresso with a heart, on a cool concrete table so the warm cup stands out. */
const HERO_LOOK = { liq: [0.3, 0.17, 0.09], art: 1, tab: [0.27, 0.26, 0.25], bg: [0.17, 0.2, 0.27] };
const look = (i) => LOOKS[((i % LOOKS.length) + LOOKS.length) % LOOKS.length] ?? LOOKS[0];
function makeRenderer(canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl)
        return undefined;
    const sh = (type, src) => {
        const s = gl.createShader(type);
        if (!s)
            return undefined;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : undefined;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog)
        return undefined;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        return undefined;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const U = { res: u('uRes'), off: u('uOff'), t: u('uT'), ang: u('uAng'), z: u('uZ'), art: u('uArt'), steam: u('uSteam'), liq: u('uLiq'), tab: u('uTab'), bg: u('uBg') };
    return {
        gl,
        draw: (o) => {
            canvas.width = o.w;
            canvas.height = o.h;
            gl.viewport(0, 0, o.w, o.h);
            gl.uniform2f(U.res, o.w, o.h);
            gl.uniform2f(U.off, o.off[0], o.off[1]);
            gl.uniform1f(U.t, o.t);
            gl.uniform1f(U.ang, o.ang);
            gl.uniform1f(U.z, o.zoom);
            gl.uniform1f(U.art, o.look.art);
            gl.uniform1f(U.steam, o.steam ? 1 : 0);
            gl.uniform3fv(U.liq, o.look.liq);
            gl.uniform3fv(U.tab, o.look.tab);
            gl.uniform3fv(U.bg, o.look.bg);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        },
        dispose: () => gl.getExtension('WEBGL_lose_context')?.loseContext(),
    };
}
let stopHero;
/** Live, mouse-reactive cup behind the hero text. Returns false if WebGL is unavailable. */
function mountHero(hero) {
    stopHero?.();
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-gl';
    canvas.setAttribute('aria-hidden', 'true');
    const r = makeRenderer(canvas);
    if (!r)
        return false;
    hero.prepend(canvas);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mx = 0;
    let ang = 0.5;
    let raf = 0;
    let visible = true;
    let last = 0;
    const onMove = (e) => { mx = e.clientX / window.innerWidth - 0.5; };
    window.addEventListener('pointermove', onMove);
    const io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true; });
    io.observe(hero);
    const frame = (now) => {
        if (!canvas.isConnected) {
            stop();
            return;
        }
        if (visible && !document.hidden && now - last > (hero.clientWidth <= 820 ? 42 : 33)) {
            last = now;
            const small = hero.clientWidth <= 820;
            // Phones get a lower render size: fewer pixels to shade, same look.
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * (small ? 0.6 : 0.9);
            const w = Math.max(2, Math.round(hero.clientWidth * dpr));
            const h = Math.max(2, Math.round(hero.clientHeight * dpr));
            ang += (0.5 + mx * 1.4 + Math.sin(now / 4000) * 0.18 - ang) * 0.06;
            const wide = hero.clientWidth > 820;
            r.draw({ w, h, look: HERO_LOOK, ang, zoom: wide ? 2.9 : 2.1, off: wide ? [0.6, -0.12] : [0, -0.5], t: now / 1000, steam: true });
        }
        if (!still)
            raf = requestAnimationFrame(frame);
    };
    function stop() {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        io.disconnect();
        r?.dispose();
        stopHero = undefined;
    }
    stopHero = stop;
    raf = requestAnimationFrame(frame);
    hero.classList.add('gl');
    return true;
}

export { LOOKS, mountHero };

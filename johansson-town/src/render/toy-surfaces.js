import * as THREE from '../../vendor/three.module.js';

/**
 * Painted ground, in place of photographs.
 *
 * The town's crazy paving and lawn were photographed surfaces: dark, contrasty and
 * busy, which read as a real street rather than a toy town. These are drawn instead —
 * soft stones with pale grout, and an even lawn with a faint mown weave — so the
 * ground is a bright, calm floor for the residents, the way a life-sim island is.
 * Both tile seamlessly and are generated once, then shared.
 */
const cache=new Map();
const hash=(x,y,s=0)=>{const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return n-Math.floor(n);};

function finish(key,data,size){
 const map=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
 map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;
 map.anisotropy=8;map.userData.sharedAsset=true;map.needsUpdate=true;
 cache.set(key,map);return map;
}

/**
 * Crazy paving: irregular stones (a jittered Voronoi, wrapped so it tiles) in a few
 * warm pale tints, each softly domed, with light grout between them.
 */
export function paintedPaving(size=256){
 if(cache.has('paving'))return cache.get('paving');
 const cells=7,points=[];
 for(let j=0;j<cells;j++)for(let i=0;i<cells;i++)points.push([(i+.15+hash(i,j,1)*.7)/cells,(j+.15+hash(i,j,2)*.7)/cells,hash(i,j,3)]);
 const tints=[[236,234,228],[228,227,222],[242,240,234],[224,224,220],[234,231,224]];
 const data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;let d1=9,d2=9,tone=0;
  for(const [px,py,t] of points)for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
   const dx=u-(px+ox),dy=v-(py+oy),d=Math.hypot(dx,dy);
   if(d<d1){d2=d1;d1=d;tone=t;}else if(d<d2)d2=d;
  }
  const edge=d2-d1,grout=1-THREE.MathUtils.smoothstep(edge,.006,.016);
  const c=tints[Math.floor(tone*tints.length)%tints.length];
  // A gentle dome: each stone a touch lighter in the middle than at its rim.
  const dome=.94+.06*THREE.MathUtils.smoothstep(edge,.01,.07);
  const speck=(hash(x,y,9)-.5)*6;
  const i=(y*size+x)*4;
  for(let k=0;k<3;k++)data[i+k]=Math.round(THREE.MathUtils.clamp(THREE.MathUtils.lerp(c[k]*dome+speck,248,grout),0,255));
  data[i+3]=255;
 }
 return finish('paving',data,size);
}

/**
 * Lawn: near white, so the material's tint sets the green, with broad soft patches and
 * a faint diagonal mowing weave rather than photographed blades and bare earth.
 */
export function paintedTurf(size=256){
 if(cache.has('turf'))return cache.get('turf');
 const data=new Uint8Array(size*size*4);
 const smooth=(x,y,f,s)=>{
  const X=x*f,Y=y*f,ix=Math.floor(X),iy=Math.floor(Y);let a=X-ix,b=Y-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);
  const h=(i,j)=>hash(((i%f)+f)%f,((j%f)+f)%f,s);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(h(ix,iy),h(ix+1,iy),a),THREE.MathUtils.lerp(h(ix,iy+1),h(ix+1,iy+1),a),b);
 };
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size;
  const patch=smooth(u,v,4,1)*.6+smooth(u,v,8,2)*.4;
  const weave=Math.sin((u+v)*Math.PI*8)*.5+.5;
  const blade=hash(x,y,5);
  const light=196+patch*20+weave*7+(blade>.93?10:0)-(blade<.05?9:0);
  const i=(y*size+x)*4;
  data[i]=Math.round(light*.97);data[i+1]=Math.round(Math.min(255,light));data[i+2]=Math.round(light*.9);data[i+3]=255;
 }
 return finish('turf',data,size);
}

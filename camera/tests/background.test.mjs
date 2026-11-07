// Remove background (background.js) without a browser: the plain-background flood keeps a subject on a flat ground,
// takes a patch of ground inside it, leaves a speck alone, and gives up on a ground that is not one colour; the
// person mask is firmed at its edge and refused when it covers nearly nothing or nearly all.
//   node camera/tests/background.test.mjs
import assert from 'node:assert/strict';
import {plainMask,personMask} from '../background.js';

const image=(w,h,at)=>{const d=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const [r,g,b]=at(x,y),i=(y*w+x)*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255;}return {data:d,width:w,height:h};};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('ok  '+name);};
const at=(m,x,y)=>m.mask[y*m.width+x];

check('a red disc on a flat grey ground: the disc kept whole, the ground gone, the share about right',()=>{
 const w=160,h=120,disc=(x,y)=>Math.hypot(x-80,y-60)<36;
 const m=plainMask(image(w,h,(x,y)=>disc(x,y)?[200,40,50]:[214,214,210]));
 assert.ok(m,'found');assert.equal(at(m,80,60),1);assert.equal(at(m,2,2),0);assert.equal(at(m,157,117),0);assert.equal(at(m,80,10),0);
 assert.ok(Math.abs(m.coverage-Math.PI*36*36/(w*h))<.02,`coverage ${m.coverage}`);
 assert.ok(at(m,80,60-36)>0&&at(m,80,60-36)<1,'a soft edge');
});
check('a ground that is lit unevenly (a gentle gradient) still floods; a patch of ground inside the subject goes too; a speck of it stays',()=>{
 const w=200,h=150;
 const ring=(x,y)=>{const d=Math.hypot(x-100,y-75);return d<50&&d>22;},speck=(x,y)=>Math.hypot(x-100,y-75)<2;
 const m=plainMask(image(w,h,(x,y)=>ring(x,y)?[30,60,160]:[230-x*.1,228-y*.08,222]));
 assert.ok(m,'found');assert.equal(at(m,100,40),1,'the ring');assert.equal(at(m,100,75),0,'the hole inside the ring is ground');assert.equal(at(m,3,3),0);
 const n=plainMask(image(w,h,(x,y)=>Math.hypot(x-100,y-75)<40&&!speck(x,y)?[30,60,160]:[230,228,222]));
 assert.ok(n);assert.ok(at(n,100,75)>.5,'a speck of ground colour inside the subject is left to it');
});
check('a ground that is not one colour (noise, a photograph) is refused; so is a subject that is nearly all or nothing',()=>{
 let seed=7;const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 assert.equal(plainMask(image(120,90,()=>[rnd()*255,rnd()*255,rnd()*255])),null,'noise');
 assert.equal(plainMask(image(120,90,()=>[200,200,200])),null,'nothing but ground');
 assert.equal(plainMask(image(120,90,(x,y)=>x<2||y<2||x>117||y>87?[200,200,200]:[20,20,20])),null,'nothing but subject');
});
check('the person mask: firmed at the edge, the share measured, refused when nearly nothing or all',()=>{
 const w=64,h=64,m=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)m[y*w+x]=Math.max(0,Math.min(1,1-(Math.hypot(x-32,y-32)-16)/6));
 const p=personMask(m,w,h);assert.ok(p);assert.equal(at(p,32,32),1);assert.equal(at(p,1,1),0);assert.ok(p.coverage>.15&&p.coverage<.3,`${p.coverage}`);
 assert.ok(at(p,32,32-19)<at(p,32,32-15),'the edge keeps its order');
 assert.equal(personMask(new Float32Array(w*h),w,h),null,'nobody');assert.equal(personMask(new Float32Array(w*h).fill(1),w,h),null,'everything');
 assert.equal(personMask(null,0,0),null);
});
console.log(`background: ${checks} checks passed`);

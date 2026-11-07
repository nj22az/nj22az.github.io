// The cut-out edge's refinement (matte.js) without a browser: a disc with hair-thin spokes against a plain ground,
// masked coarsely (the spokes lost in a soft band), gets its spokes back and the ground between them clear; the box
// mean, the resampling and the guided filter behave.
//   node camera/tests/matte.test.mjs
import assert from 'node:assert/strict';
import {boxMean,resample,guidedFilter,guidedFilterColour,refineMask} from '../matte.js';
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('ok  '+name);};

check('the box mean: flat stays flat, an edge is averaged across the window, the picture\'s edges are clipped not darkened',()=>{
 const w=20,h=10,flat=boxMean(new Float32Array(w*h).fill(.4),w,h,3);assert.ok(flat.every(v=>Math.abs(v-.4)<1e-6));
 const step=new Float32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)step[y*w+x]=x<10?0:1;
 const m=boxMean(step,w,h,2);assert.equal(m[5*w+0],0);assert.equal(m[5*w+19],1);assert.ok(m[5*w+9]>.3&&m[5*w+9]<.7);
 assert.equal(boxMean(new Float32Array(w*h).fill(1),w,h,4)[0],1,'the corner is a mean over its clipped window');
});
check('resampling: a 2 × 2 checker to 8 × 8 is smooth in between and exact at the centres',()=>{
 const r=resample(new Float32Array([0,1,1,0]),2,2,8,8);assert.ok(r[0]<.1&&r[7]>.9&&r[7*8]>.9&&r[63]<.1);assert.ok(r[3*8+3]>.3&&r[3*8+3]<.7);
});
check('the guided filter keeps an edge the guide has and smooths noise where the guide is flat',()=>{
 const w=40,h=20,I=new Float32Array(w*h),p=new Float32Array(w*h);let s=5;const rnd=()=>((s=(1664525*s+1013904223)>>>0)/4294967296);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){I[y*w+x]=x<20?.2:.8;p[y*w+x]=(x<20?0:1)+(rnd()-.5)*.3;}
 const q=guidedFilter(I,p,w,h,3,1e-3);
 assert.ok(q[10*w+19]<.25&&q[10*w+20]>.75,'the step is kept where the guide steps');
 let dev=0;for(let x=2;x<16;x++)dev+=Math.abs(q[10*w+x]-0);assert.ok(dev/14<.06,`flat side smoothed to ${dev/14}`);
});
check('the colour guided filter keeps an edge the guide has in colour alone (same grey, other hue)',()=>{
 const w=40,h=20,n=w*h,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),p=new Float32Array(n);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,left=x<20;R[i]=left?.6:.2;G[i]=left?.2:.6;B[i]=.3;p[i]=Math.max(0,Math.min(1,(x-14)/12));}
 const q=guidedFilterColour(R,G,B,p,w,h,4,1e-3);
 assert.ok(q[10*w+18]<.3&&q[10*w+21]>.7,`a ramp over a colour edge is pulled onto it: ${q[10*w+18].toFixed(2)} ${q[10*w+21].toFixed(2)}`);
});
check('a disc with hair-thin spokes in the coarse mask\'s soft ramp: the spokes keep their alpha, the ground between them lets go, the edge is crisp',()=>{
 const w=400,h=400,rgba=new Uint8ClampedArray(w*h*4);
 const spoke=(x,y)=>{const dx=x-200,dy=y-200,d=Math.hypot(dx,dy);if(d<=92)return true;if(d>102)return false;const a=Math.atan2(dy,dx),k=Math.round(a/(Math.PI/8))*(Math.PI/8);return Math.abs(d*Math.sin(a-k))<1.3;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=spoke(x,y);rgba[i]=s?60:225;rgba[i+1]=s?35:220;rgba[i+2]=s?20:210;rgba[i+3]=255;}
 // The coarse mask at 100 across: a disc a little too wide with a soft ramp that covers the spokes, as a segmenter gives it.
 const cw=100,ch=100,coarse=new Float32Array(cw*ch);for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const d=Math.hypot((x+.5)*4-200,(y+.5)*4-200);coarse[y*cw+x]=Math.max(0,Math.min(1,(106-d)/18));}
 const out=refineMask(rgba,w,h,coarse,cw,ch);
 const at=(x,y)=>out[y*w+x];
 assert.equal(at(200,200),1,'the disc');assert.equal(at(5,5),0,'the corner');
 const onSpoke=at(200+97,200),between=at(200+Math.round(97*Math.cos(Math.PI/16)),200+Math.round(97*Math.sin(Math.PI/16)));
 assert.ok(onSpoke>.55,`a spoke keeps its alpha: ${onSpoke.toFixed(2)}`);assert.ok(between<.3,`the ground between spokes lets go: ${between.toFixed(2)}`);
 const c=resample(coarse,cw,ch,w,h);assert.ok(Math.abs(c[200*w+297]-c[(200+Math.round(97*Math.sin(Math.PI/16)))*w+(200+Math.round(97*Math.cos(Math.PI/16)))])<.3,'the coarse mask could not tell them apart');
 assert.ok(at(200+88,200)>.9&&at(200+108,200)<.1,`the disc's own edge is crisp on both sides: ${at(288,200).toFixed(2)} ${at(308,200).toFixed(2)}`);
 // crisper than the coarse ramp: fewer half-way pixels along the disc's edge
 let hc=0,hr=0;for(let i=0;i<w*h;i++){if(c[i]>.1&&c[i]<.9)hc++;if(out[i]>.1&&out[i]<.9)hr++;}
 assert.ok(hr<hc*.8,`half-way pixels ${hr} against the coarse ${hc} (the spokes are partial by right)`);
});
console.log(`matte: ${checks} checks passed`);

import assert from 'node:assert/strict';
import {MIXES,measureImage,photoSettings,photoCandidates,scorePhoto,choosePhotoCandidate} from '../smart-shuffle.js';
const image=(fn)=>{const width=64,height=48,data=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;data.set([...fn(x,y),255],i);}return {data,width,height};};
const gradient=image((x,y)=>{const v=30+x*2.5+y;return [v,v*.9,v*.8];}),reference=measureImage(gradient);
const layers=[{look:'instant',amount:.6},{look:'mono',amount:.1}];
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('ok '+name);};
check('measures the supplied pixels, and rejects incomplete images',()=>{
 assert.ok(reference.range>.4&&reference.edge>0&&reference.saturation>0);assert.equal(reference.grid.length,64);
 assert.throws(()=>measureImage({width:4,height:4,data:new Uint8Array(4)}),TypeError);
});
check('tonal suggestions brighten dark sources and restrain bright sources',()=>{
 const dark=photoSettings(measureImage(image((x,y)=>[8+x/3+y/4,10+x/3,12+x/3])));
 const bright=photoSettings(measureImage(image((x,y)=>[210+x/3,215+y/3,220+x/3])));
 assert.ok(dark.adjust.light>0&&bright.adjust.light<0);assert.ok(dark.enhance>0&&dark.enhance<=1);
});
check('real structural content outranks blank white, black and scrambled noise',()=>{
 const white=measureImage(image(()=>[255,255,255])),black=measureImage(image(()=>[0,0,0]));
 let n=37;const noise=measureImage(image(()=>{n=(1664525*n+1013904223)>>>0;const v=n>>>24;return [v,v,v];}));
 const good=scorePhoto(reference,reference,layers);
 for(const bad of [white,black,noise])assert.ok(good>scorePhoto(reference,bad,layers),JSON.stringify({good,bad:scorePhoto(reference,bad,layers)}));
});
check('black, white and constant inputs produce finite bounded quality scores',()=>{
 for(const v of [0,128,255]){const p=measureImage(image(()=>[v,v,v]));const score=scorePhoto(p,p,layers);assert.ok(Number.isFinite(score)&&score>=0&&score<=1);}
});
check('search is bounded and varies strengths and settings from the actual source',()=>{
 let n=11;const random=()=>((n=(1664525*n+1013904223)>>>0)/4294967296),plans=photoCandidates(reference,{random,previous:{name:'prior',layers}});
 assert.ok(plans.length>=4&&plans.length<=16);assert.ok(plans.some(p=>p.name==='prior'));
 for(const p of plans){assert.equal(p.layers.length,2);for(const l of p.layers)assert.ok(l.amount>=0&&l.amount<=1);for(const v of Object.values(p.adjust))assert.ok(v>=-1&&v<=1);}
 assert.ok(new Set(plans.map(p=>JSON.stringify(p.adjust))).size>1);
 assert.equal(MIXES.length,20,'the live-camera curated vocabulary is retained');
});
check('unsupported styles are never proposed',()=>{
 const plans=photoCandidates(reference,{available:name=>name==='instant'||name==='mono',random:()=>.5});
 assert.equal(plans.length,2);assert.ok(plans.every(p=>p.layers.every(l=>['instant','mono'].includes(l.look))));
 assert.deepEqual(photoCandidates(reference,{available:()=>false}),[]);
});
check('selection stays within the strongest group and avoids a repeat when possible',()=>{
 const a={name:'a',score:.91},b={name:'b',score:.9},bad={name:'bad',score:.2};
 assert.equal(choosePhotoCandidate([bad,b,a],{lastName:'a',random:()=>0}),b);
 assert.equal(choosePhotoCandidate([bad]),null);assert.equal(choosePhotoCandidate([]),null);
});
console.log(`${checks}/${checks} Smart Surprise unit checks passed`);

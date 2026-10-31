import assert from 'node:assert/strict';
import {MAKEUP_SHADES,normaliseFace,normaliseMakeup,makeupPixels,detectMakeupFace} from '../makeup.js';
const image=(fn,width=180,height=220)=>{const data=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++)data.set(fn(x,y),(y*width+x)*4);return {data,width,height};};
const face={x:.15,y:.1,w:.7,h:.8},base={skin:0,blush:0,lips:0,face};
const colour=[145,108,91,255],plain=image(()=>colour),at=(p,x,y)=>[...p.data.slice((y*p.width+x)*4,(y*p.width+x)*4+4)];
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('ok '+name);};
check('corrupt/foreign recipes become finite bounded controls and guide anchors',()=>{
 const m=normaliseMakeup({skin:Infinity,blush:400,lips:-3,shade:'network',face:{x:-3,y:8,w:2,h:0,angle:Infinity,eyes:[{x:-9,y:9}],mouth:{x:'bad',y:2,w:0,h:80}}});
 assert.equal(m.skin,0);assert.equal(m.blush,1);assert.equal(m.lips,0);assert.equal(m.shade,'rose');
 assert.equal(m.face.x,0);assert.ok(m.face.y<=1-m.face.h);assert.equal(m.face.w,1);assert.equal(m.face.h,.025);assert.equal(m.face.angle,0);
 for(const p of [...m.face.eyes,m.face.mouth])for(const v of [p.x,p.y])assert.ok(v>=.08&&v<=.92);
 assert.equal(m.face.mouth.w,.12);assert.equal(m.face.mouth.h,.2);assert.equal(normaliseFace(null),null);
});
check('off and missing-face paths preserve the exact original object and pixels',()=>{
 assert.equal(makeupPixels(plain,base),plain);assert.equal(makeupPixels(plain,{skin:1,lips:1,blush:1}),plain);
 assert.throws(()=>makeupPixels({data:new Uint8Array(1),width:1,height:1},base),TypeError);
});
check('each tint changes pixels, is deterministic, and leaves the source and alpha unchanged',()=>{
 const before=new Uint8ClampedArray(plain.data);
 for(const effect of ['lips','blush'])for(const shade of MAKEUP_SHADES){
  const m={...base,[effect]:1,shade:shade.id},a=makeupPixels(plain,m),b=makeupPixels(plain,m);
  assert.notDeepEqual(a.data,before);assert.deepEqual(a.data,b.data);
  for(let i=3;i<a.data.length;i+=4)assert.equal(a.data[i],255);
 }
 assert.deepEqual(plain.data,before);
});
check('all pixels outside the feathered face remain exact, including transparent pixels',()=>{
 const p=image((x,y)=>[145,108,91,(x===90&&y===140)?0:217]),r=makeupPixels(p,{...base,skin:1,lips:1,blush:1});
 for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(x<27||x>153||y<22||y>198)assert.deepEqual(at(r,x,y),at(p,x,y));
 assert.deepEqual(at(r,90,140),at(p,90,140));
 for(let i=3;i<p.data.length;i+=4)assert.equal(r.data[i],p.data[i]);
});
check('smoothing preserves uniform complexion and the eye/mouth/nose feature centres',()=>{
 assert.deepEqual(makeupPixels(plain,{...base,skin:1}).data,plain.data);
 const f=normaliseFace(face),anchors=[...f.eyes,f.mouth,{x:.5,y:.61}];
 const positions=anchors.map(p=>[Math.floor((f.x+p.x*f.w)*plain.width),Math.floor((f.y+p.y*f.h)*plain.height)]);
 const p=image((x,y)=>positions.some(([px,py])=>x===px&&y===py)?[60,40,30,255]:colour),r=makeupPixels(p,{...base,skin:1});
 for(const [x,y] of positions)assert.deepEqual(at(r,x,y),at(p,x,y));
});
check('smoothing reduces fine noise in cheek skin without moving strong edges',()=>{
 const p=image((x,y)=>{const n=(x+y)%2?7:-7;return [145+n,108+n,91+n,255];}),r=makeupPixels(p,{...base,skin:1});
 let before=0,after=0;for(let y=110;y<128;y++)for(let x=51;x<66;x++){before+=Math.abs(at(p,x,y)[0]-145);after+=Math.abs(at(r,x,y)[0]-145);}
 assert.ok(after<before*.9,JSON.stringify({before,after}));
 const edge=image((x)=>x<90?[30,30,30,255]:[230,230,230,255]),smooth=makeupPixels(edge,{...base,skin:1});
 assert.deepEqual(at(smooth,89,115),at(edge,89,115));assert.deepEqual(at(smooth,90,115),at(edge,90,115));
});
check('lip tint excludes a bright neutral mouth opening and changes the adjoining lip',()=>{
 const f=normaliseFace(face),mx=Math.floor((f.x+f.mouth.x*f.w)*plain.width),my=Math.floor((f.y+f.mouth.y*f.h)*plain.height);
 const p=image((x,y)=>Math.abs(x-mx)<10&&Math.abs(y-my)<2?[245,245,245,255]:[145,72,68,255]);
 const r=makeupPixels(p,{...base,lips:1});assert.deepEqual(at(r,mx,my),at(p,mx,my));
 assert.notDeepEqual(at(r,mx,my+4),at(p,mx,my+4));
});
check('moving the mouth anchor moves the effect, and rotation preserves the exterior',()=>{
 const a=makeupPixels(plain,{...base,lips:1}),b=makeupPixels(plain,{...base,lips:1,face:{...face,mouth:{x:.55,y:.6}}});
 let ay=0,an=0,by=0,bn=0;for(let y=0;y<plain.height;y++)for(let x=0;x<plain.width;x++){
  if(at(a,x,y)[0]!==colour[0]){ay+=y;an++;}if(at(b,x,y)[0]!==colour[0]){by+=y;bn++;}
 }
 assert.ok(ay/an>by/bn+15);
 const rotated=makeupPixels(plain,{...base,lips:1,blush:1,face:{...face,angle:35}});
 assert.notDeepEqual(rotated.data,a.data);assert.deepEqual(at(rotated,0,0),colour);
});
// Native API boundaries can be checked without a platform detector. This does not establish native device support.
const previous=globalThis.FaceDetector;
try{
 globalThis.FaceDetector=class{async detect(){return [{boundingBox:{x:20,y:10,width:120,height:160},landmarks:[{type:'eye',locations:[{x:56,y:70}]},{type:'eye',locations:[{x:104,y:74}]},{type:'mouth',locations:[{x:80,y:130}]}]}];}};
 const r=await detectMakeupFace({width:180,height:220});assert.equal(r.status,'detected');assert.ok(r.face.angle>0);assert.ok(Math.abs(r.face.mouth.y-.75)<.02);checks++;console.log('ok native detector landmarks map into source-space face guides');
}finally{if(previous===undefined)delete globalThis.FaceDetector;else globalThis.FaceDetector=previous;}
console.log(`${checks}/${checks} makeup unit checks passed`);

// Makeup (makeup.js) without a browser: the recipe, a face synthesised from the guide, and the pure pass on pixels:
// nothing outside the face's region changes, alpha is kept, off is the same bytes.
//   node camera/tests/makeup.test.mjs
import assert from 'node:assert/strict';
import {MAKEUP_LOOKS,MAKEUP_SHADES,SHADOW_TONES,LINER_TONES,normaliseFace,normaliseMakeup,makeupAmounts,makeupActive,faceFromGuide,makeupFaces,makeupPixels,faceCrop,facesInCrop} from '../makeup.js';
import {normaliseFace as compact} from '../face-pack.js';

// The pass rasterises masks with a 2D canvas; the unit test gives it a tiny one of its own.
const {createCanvas}=await (async()=>{try{return await import('canvas');}catch{return {createCanvas:null};}})();
if(!createCanvas&&typeof OffscreenCanvas!=='function'){
 globalThis.OffscreenCanvas=class{constructor(w,h){this.width=w;this.height=h;this.m=new Float32Array(w*h);}getContext(){const self=this;let path=[],fill=1;return {clearRect(){self.m.fill(0);},beginPath(){path=[];},moveTo(x,y){path.push([[x,y]]);},lineTo(x,y){path[path.length-1].push([x,y]);},closePath(){},ellipse(x,y,rx,ry){path.push(Array.from({length:24},(_,i)=>[x+rx*Math.cos(i/24*2*Math.PI),y+ry*Math.sin(i/24*2*Math.PI)]));},
  fill(rule){const inside=(x,y,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
   for(let y=0;y<self.height;y++)for(let x=0;x<self.width;x++){let n=0;for(const p of path)if(p.length>2&&inside(x+.5,y+.5,p))n++;if(rule==='evenodd'?n%2===1:n>0)self.m[y*self.width+x]=1;}},
  stroke(){},getImageData(){const d=new Uint8ClampedArray(self.width*self.height*4);for(let i=0;i<self.m.length;i++)d[4*i+3]=self.m[i]*255;return {data:d};},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},set lineJoin(v){},set lineCap(v){}};}};
}

const guide={x:.2,y:.15,w:.6,h:.7,angle:0,eyes:[{x:.31,y:.4},{x:.69,y:.4}],mouth:{x:.5,y:.75,w:.36,h:.08}};
const image=(w,h,at)=>{const d=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const [r,g,b,a=255]=at(x,y),i=(y*w+x)*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=a;}return {data:d,width:w,height:h};};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('ok  '+name);};

check('the recipe: looks, strength, shade, fine-tune; an older Skin/Lips/Blush recipe becomes the custom look',()=>{
 const m=normaliseMakeup({});assert.deepEqual([m.look,m.strength,m.shade,m.face],['none',1,'auto',null]);assert.deepEqual(m.tune,{skin:1,lips:1,blush:1,eyes:1,teeth:1});
 const n=normaliseMakeup({look:'bold',strength:2,shade:'berry',tune:{skin:9,lips:-1,eyes:'x'}});assert.equal(n.strength,1);assert.equal(n.shade,'berry');assert.deepEqual(n.tune,{skin:1.5,lips:0,blush:1,eyes:1,teeth:1});
 assert.equal(normaliseMakeup({look:'invented'}).look,'none');
 const old=normaliseMakeup({skin:.3,lips:.65,blush:.4,shade:'peach',face:guide});assert.equal(old.look,'custom');assert.deepEqual(old.tune,{skin:.3,lips:.65,blush:.4,eyes:0,teeth:0});assert.equal(old.shade,'peach');assert.ok(old.face);
 assert.equal(normaliseMakeup({skin:0,lips:0,blush:0}).look,'none');
 assert.ok(MAKEUP_LOOKS.length>=8&&MAKEUP_LOOKS.every(l=>l.id&&l.label&&l.lips&&l.blush&&l.liner&&l.shadow));assert.ok(MAKEUP_SHADES.every(s=>s.lab&&Number.isFinite(s.lab.a)));
 assert.ok(MAKEUP_LOOKS.every(l=>LINER_TONES[l.liner.tone]&&SHADOW_TONES[l.shadow.tone]&&l.liner.wing>=0&&l.liner.wing<=1),'every look names a liner tone, a shadow tone and a wing in 0–1');
 assert.equal(MAKEUP_LOOKS.find(l=>l.id==='clean').liner.amount+MAKEUP_LOOKS.find(l=>l.id==='clean').shadow.amount,0,'Clean draws neither');
});
check('the amounts: a look at Strength, by the fine-tune; none is nothing; custom is its own amounts',()=>{
 const a=makeupAmounts(normaliseMakeup({look:'fresh'}));assert.ok(a.skin>0&&a.lipsAmount===1&&a.blush.amount>0&&a.lips.shade==='peach');
 const half=makeupAmounts(normaliseMakeup({look:'fresh',strength:.5,tune:{lips:0}}));assert.equal(half.skin,a.skin*.5);assert.equal(half.lipsAmount,0);
 assert.equal(makeupAmounts(normaliseMakeup({look:'fresh',shade:'red'})).lips.shade,'red');
 const z=makeupAmounts(normaliseMakeup({look:'none'}));assert.equal(z.skin+z.lipsAmount+z.blush.amount+z.eyes+z.teeth+z.liner.amount+z.shadow.amount,0);
 const c=makeupAmounts(normaliseMakeup({skin:.3,lips:.65,blush:.4}));assert.equal(c.skin,.3);assert.equal(c.lipsAmount,.65);assert.equal(c.blush.amount,.4);assert.equal(c.liner.amount+c.shadow.amount,0,'an older recipe has no liner or shadow');
 // The liner and the shadow follow Strength and the Eyes fine-tune, as the whites and irises do.
 const ev=makeupAmounts(normaliseMakeup({look:'evening'}));assert.deepEqual(ev.liner,{tone:'black',wing:.6,amount:.7});assert.deepEqual(ev.shadow,{tone:'smoke',amount:.6});
 const evHalf=makeupAmounts(normaliseMakeup({look:'evening',strength:.5,tune:{eyes:.5}}));assert.ok(Math.abs(evHalf.liner.amount-.175)<1e-9&&Math.abs(evHalf.shadow.amount-.15)<1e-9);
 assert.equal(makeupAmounts(normaliseMakeup({look:'evening',tune:{eyes:0}})).liner.amount,0);
});
check('a face synthesised from the guide is a complete compact face; the guide alone is enough to be active',()=>{
 const f=faceFromGuide(guide);assert.ok(f);const ok=compact(f);assert.ok(ok,'valid for the face pack');
 assert.deepEqual([f.lipsOuter.length,f.lipsInner.length,f.eyeL.length,f.eyeR.length,f.browL.length,f.browR.length,f.oval.length],[20,20,16,16,10,10,36]);
 assert.ok(f.eyes[0].x<f.eyes[1].x&&f.eyes[0].r>0);
 assert.equal(faceFromGuide(null),null);
 assert.equal(makeupActive(normaliseMakeup({look:'natural'}),[]),false);
 assert.equal(makeupActive(normaliseMakeup({look:'natural',face:guide}),[]),true);
 assert.equal(makeupFaces(normaliseMakeup({look:'natural',face:guide}),[]).length,1);
 assert.equal(makeupFaces(normaliseMakeup({look:'natural',face:guide}),[f])[0],f,'found faces win');
});
check('off is the same object; bad pixels throw; the pass keeps alpha and leaves the outside of the face untouched',()=>{
 const skin=[196,150,128],plain=image(120,160,()=>[...skin,255]);
 assert.equal(makeupPixels(plain,{look:'none',face:guide}),plain);
 assert.equal(makeupPixels(plain,{look:'natural'}),plain,'no face, nothing to draw on');
 assert.throws(()=>makeupPixels({data:new Uint8Array(1),width:1,height:1},{look:'natural',face:guide}),TypeError);
 const dotted=image(120,160,(x,y)=>[...skin,(x===3&&y===3)||(x===60&&y===80)?0:255]);
 for(const look of MAKEUP_LOOKS){
  const r=makeupPixels(dotted,{look:look.id,face:guide});
  assert.notEqual(r,dotted,look.id);assert.equal(r.data.length,dotted.data.length);
  for(let i=3;i<r.data.length;i+=4)assert.equal(r.data[i],dotted.data[i],'alpha kept');
  // outside the guide's box (with its room) nothing changes; the corner pixel and the top row are outside
  for(const [x,y] of [[0,0],[119,0],[0,159],[119,159],[60,2]]){const i=(y*120+x)*4;assert.deepEqual([...r.data.slice(i,i+3)],[...dotted.data.slice(i,i+3)],`${look.id} at ${x},${y}`);}
 }
 const bold=makeupPixels(plain,{look:'bold',face:guide}),mx=Math.round((guide.x+guide.mouth.x*guide.w)*120),my=Math.round((guide.y+guide.mouth.y*guide.h)*160),i=(my*120+mx)*4;
 assert.ok(bold.data[i]-bold.data[i+1]>skin[0]-skin[1]+10,'the lips went redder');
 const none=makeupPixels(plain,{look:'bold',strength:0,face:guide});assert.deepEqual(none.data,plain.data,'strength 0 draws nothing');
});
check('a lip colour chosen by hand goes on fully and reads as that colour: eighteen shades, each distinct; the blush follows only a blush colour',()=>{
 assert.ok(MAKEUP_SHADES.length>=18&&MAKEUP_SHADES.every(s=>/^#[0-9a-f]{6}$/.test(s.colour)&&s.label));
 // (sampled on the lower lip, two rows under the mouth's centre line, where the lip mask is whole)
 const skin=[196,150,128],plain=image(120,160,()=>[...skin,255]),mx=Math.round((guide.x+guide.mouth.x*guide.w)*120),my=Math.round((guide.y+guide.mouth.y*guide.h)*160)+2,i=(my*120+mx)*4;
 const lip=(shade,look='natural')=>{const r=makeupPixels(plain,{look,shade,face:guide});return [...r.data.slice(i,i+3)];};
 const lum=([r,g,b])=>.2126*r+.7152*g+.0722*b;
 const own=lip('auto'),black=lip('black'),blue=lip('blue'),nude=lip('nude'),cherry=lip('cherry'),violet=lip('violet');
 assert.ok(lum(black)<lum(own)*.6,`black darkens the lip: ${black} against ${own}`);
 assert.ok(blue[2]>blue[0]+20,`blue is blue: ${blue}`);assert.ok(cherry[0]>cherry[1]+70&&cherry[0]>cherry[2]+60,`cherry is red: ${cherry}`);
 assert.ok(violet[2]>violet[1]+20&&violet[0]>violet[1],`violet is violet: ${violet}`);assert.ok(lum(nude)>lum(black)+60,'nude is far from black');
 // every shade lands somewhere of its own (no two within a few steps of each other)
 const all=MAKEUP_SHADES.map(s=>lip(s.id));for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++){const d=Math.hypot(...all[a].map((v,k)=>v-all[b][k]));assert.ok(d>8,`${MAKEUP_SHADES[a].id} and ${MAKEUP_SHADES[b].id} look the same: ${all[a]} ${all[b]}`);}
 // a chosen colour on Natural (mix .3 by itself) is stronger than the look's own move
 assert.ok(Math.hypot(...cherry.map((v,k)=>v-skin[k]))>Math.hypot(...own.map((v,k)=>v-skin[k]))*1.5,'chosen is fuller than the look\'s own');
 const a=makeupAmounts(normaliseMakeup({look:'soft',shade:'blue'}));assert.equal(a.blush.tone,'rose','a blue lip leaves the blush rose');assert.equal(a.lips.shade,'blue');assert.ok(a.lips.mix>=.9);
 const c=makeupAmounts(normaliseMakeup({look:'soft',shade:'cherry'}));assert.equal(c.blush.tone,'cherry','a cherry lip takes the blush with it');
 assert.equal(normaliseMakeup({look:'soft',shade:'black'}).shade,'black');assert.equal(normaliseMakeup({look:'soft',shade:'teal'}).shade,'auto','an unknown shade is the look\'s own');
});
check('eyeliner and eyeshadow: the lash line goes toward the tone, the lid takes the wash, the wing reaches past the corner; Clean and Eyes 0 draw neither',()=>{
 const W=480,H=640,skin=[196,150,128],plain=image(W,H,()=>[...skin,255]);
 const f=faceFromGuide(guide),lid=f.eyeL.slice(0,9).map(([x,y])=>[x*W,y*H]);// the photo's left eye: its first point is the outer corner
 const eyeW=Math.hypot((f.eyes[1].x-f.eyes[0].x)*W,(f.eyes[1].y-f.eyes[0].y)*H);
 const at=(r,[x,y])=>{const i=(Math.round(y)*W+Math.round(x))*4;return [r.data[i],r.data[i+1],r.data[i+2]];};
 const lum=([r,g,b])=>.2126*r+.7152*g+.0722*b,skinLum=lum(skin);
 const linerPx=[lid[1][0],lid[1][1]-eyeW*.016],shadowPx=[lid[4][0],lid[4][1]-eyeW*.11],wingPx=[lid[0][0]-eyeW*.03,lid[0][1]-eyeW*.026];
 const evening=makeupPixels(plain,{look:'evening',face:guide}),clean=makeupPixels(plain,{look:'clean',face:guide}),rose=makeupPixels(plain,{look:'rose',face:guide});
 assert.ok(lum(at(evening,linerPx))<skinLum*.6,`the liner is dark: ${at(evening,linerPx)} against ${skin}`);
 assert.ok(lum(at(evening,wingPx))<skinLum*.85,`the wing goes past the corner: ${at(evening,wingPx)}`);
 assert.ok(lum(at(evening,shadowPx))<skinLum*.9&&lum(at(evening,shadowPx))>skinLum*.55,`a smoky lid, not a black one: ${at(evening,shadowPx)}`);
 const rs=at(rose,shadowPx);assert.ok(rs[0]-rs[1]>skin[0]-skin[1]+6,`the rose wash is redder: ${rs}`);
 // Clean draws no line and no wash (its eye work lifts the whites, which can reach a pixel beside the lash line a touch).
 assert.ok(lum(at(clean,linerPx))>=skinLum-1,`Clean leaves the lash line: ${at(clean,linerPx)}`);assert.deepEqual(at(clean,shadowPx),skin,'Clean leaves the lid');
 const noEyes=makeupPixels(plain,{look:'evening',tune:{eyes:0},face:guide});assert.deepEqual(at(noEyes,linerPx),skin);assert.deepEqual(at(noEyes,shadowPx),skin);
 // The natural look: a brown line that is there, but light; the eye itself is never drawn on.
 const natural=makeupPixels(plain,{look:'natural',face:guide}),nl=lum(at(natural,linerPx));assert.ok(nl<skinLum-8&&nl>skinLum*.6,`a light brown line: ${at(natural,linerPx)}`);
 const centre=[f.eyes[0].x*W,f.eyes[0].y*H];assert.ok(at(evening,centre)[0]>=skin[0]-2,`the eye is not under the liner (its whites were lifted, if anything): ${at(evening,centre)}`);
});
check('a crop round a face and the faces re-measured inside it',()=>{
 const f=faceFromGuide(guide),c=faceCrop(f,120,160);assert.ok(c.w>0&&c.h>0&&c.x>=0&&c.y>=0&&c.x+c.w<=1&&c.y+c.h<=1);
 const [g]=facesInCrop([f],c);assert.ok(g.eyes[0].x>0&&g.eyes[0].x<1&&g.lipsOuter.every(([x,y])=>x>0&&x<1&&y>0&&y<1));
 assert.equal(normaliseFace(null),null);
});
console.log(`makeup: ${checks} checks passed`);

/**
 * Remove background (the owner, 3 November 2026: "I want an invert function too and remove background"): the subject
 * kept, the rest made see-through. Two ways, tried in turn:
 *  - a person, found by MediaPipe's Selfie Segmenter in the face pack's worker (face-pack.js findPerson), when it covers
 *    a sensible share of the picture;
 *  - a plain background (a product on a table, a logo, a drawing on paper): the picture's edges flooded by colour, and
 *    any other patch of that colour big enough to be background too.
 * The mask is kept beside the picture, never baked into it, so the Looks still see the whole photograph (a blur over a
 * hole would drag a dark fringe into the subject) and the mask is applied to what is shown (a CSS mask on the preview)
 * and to what is saved (a PNG). Nothing is uploaded.
 */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const WORK=512;

/**
 * A plain background flooded from the edges. `image` is RGBA pixels (ImageData-like, at a working size). Returns
 * {mask: Float32Array (1 = keep), width, height, coverage (the subject's share), spread} or null when the edges are
 * not one colour, or the flood takes nearly everything or nearly nothing.
 */
export function plainMask(image){
 const {data:d,width:w,height:h}=image,n=w*h;if(n<16)return null;
 // The edge's colour: the median of a one-pixel ring, and how far the ring strays from it.
 const ring=[];for(let x=0;x<w;x++){ring.push(x,(h-1)*w+x);}for(let y=1;y<h-1;y++){ring.push(y*w,y*w+w-1);}
 const med=c=>{const v=ring.map(i=>d[4*i+c]).sort((a,b)=>a-b);return v[v.length>>1];};
 const mr=med(0),mg=med(1),mb=med(2);
 const dist=i=>Math.max(Math.abs(d[4*i]-mr),Math.abs(d[4*i+1]-mg),Math.abs(d[4*i+2]-mb));
 let spread=0;for(const i of ring)spread+=dist(i);spread/=ring.length;
 if(spread>26)return null;
 const near=clamp(16+spread*2.4,16,46),step=Math.max(12,near*.7);
 const bg=new Uint8Array(n),queue=new Int32Array(n);
 const flood=(seeds,limit)=>{let head=0,tail=0,count=0;for(const s of seeds){if(bg[s]||dist(s)>=limit)continue;bg[s]=1;queue[tail++]=s;}
  while(head<tail){const i=queue[head++];count++;const x=i%w,y=(i-x)/w,di=d[4*i],dg=d[4*i+1],db=d[4*i+2];
   for(const j of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1]){if(j<0||bg[j])continue;
    if(dist(j)<limit&&Math.max(Math.abs(d[4*j]-di),Math.abs(d[4*j+1]-dg),Math.abs(d[4*j+2]-db))<step){bg[j]=1;queue[tail++]=j;}}}
  return count;};
 flood(ring,near*1.6);
 // Patches of the edge's colour the edges do not reach (between an arm and a body, inside a letter): background too,
 // when they are more than a speck.
 const minPatch=Math.max(24,n*.002);
 for(let i=0;i<n;i++){if(bg[i]||dist(i)>=near*.6)continue;
  const before=flood([i],near*1.2);if(before<minPatch){/* a speck of background colour inside the subject: keep it */let head=0;const stack=[i];bg[i]=2;while(head<stack.length){const k=stack[head++];const x=k%w,y=(k-x)/w;for(const j of [x>0?k-1:-1,x<w-1?k+1:-1,y>0?k-w:-1,y<h-1?k+w:-1])if(j>=0&&bg[j]===1){bg[j]=2;stack.push(j);}}}}
 let kept=0;const mask=new Float32Array(n);for(let i=0;i<n;i++){const keep=bg[i]===1?0:1;mask[i]=keep;kept+=keep;}
 const coverage=kept/n;if(coverage<.02||coverage>.9)return null;
 return {mask:soften(mask,w,h),width:w,height:h,coverage:+coverage.toFixed(3),spread:+spread.toFixed(1)};
}
/** A one-pixel box blur, so the cut edge is not a staircase once scaled up. */
function soften(m,w,h){
 const o=new Float32Array(m.length);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0,c=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;s+=m[yy*w+xx];c++;}o[y*w+x]=s/c;}
 return o;
}
/** A person's mask from the segmenter (0–1 per pixel) firmed at its edge; null when it covers nearly nothing or all. */
export function personMask(mask,width,height){
 if(!mask||!(width>0&&height>0)||mask.length<width*height)return null;
 let on=0;for(let i=0;i<width*height;i++)if(mask[i]>.5)on++;
 const coverage=on/(width*height);if(coverage<.03||coverage>.97)return null;
 const out=new Float32Array(width*height);
 for(let i=0;i<out.length;i++){const t=clamp((mask[i]-.3)/.4,0,1);out[i]=t*t*(3-2*t);}
 return {mask:out,width,height,coverage:+coverage.toFixed(3)};
}
/** A mask as a canvas of the picture's size: white with the mask as its alpha, scaled smoothly. */
export function maskCanvas({mask,width,height},W,H){
 const small=document.createElement('canvas');small.width=width;small.height=height;
 const sg=small.getContext('2d'),img=sg.createImageData(width,height);
 for(let i=0;i<width*height;i++){img.data[4*i]=img.data[4*i+1]=img.data[4*i+2]=255;img.data[4*i+3]=Math.round(clamp(mask[i],0,1)*255);}
 sg.putImageData(img,0,0);
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(small,0,0,W,H);
 c.kind=null;return c;
}
const dims=s=>({width:s.naturalWidth||s.videoWidth||s.width,height:s.naturalHeight||s.videoHeight||s.height});
// The edge refined off the page's thread (matte.js, in matte-worker.js): the person's coarse mask re-solved in a band
// round its edge from the photograph's own colours, so hair keeps its strands (the owner, 3 November 2026: "Make the
// cut-out edge crisper on hair").
let matte=null,matteSeq=0;const mattePending=new Map();
function matteWorker(){
 if(matte)return matte;
 matte=new Worker(new URL('./matte-worker.js?v=20261104ui1',import.meta.url),{type:'module'});
 matte.onmessage=({data})=>{const p=mattePending.get(data.id);if(!p)return;mattePending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.mask);};
 matte.onerror=e=>{for(const p of mattePending.values())p.reject(new Error(e.message||'The edge could not be refined'));mattePending.clear();matte.terminate();matte=null;};
 return matte;
}
/** The person's mask refined at up to `longSide` pixels across: {mask, width, height, coverage}. */
export async function refinePerson(picture,person,{longSide=1024}={}){
 const {width:W,height:H}=dims(picture),k=Math.min(1,longSide/Math.max(W,H)),w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k));
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingQuality='high';g.drawImage(picture,0,0,w,h);
 const rgba=g.getImageData(0,0,w,h).data;
 const mask=await new Promise((resolve,reject)=>{const id=++matteSeq;mattePending.set(id,{resolve,reject});matteWorker().postMessage({id,rgba:rgba.buffer,w,h,coarse:person.mask,cw:person.width,ch:person.height},[rgba.buffer]);});
 return {mask,width:w,height:h,coverage:person.coverage};
}
/** The picture's pixels at the working size. */
function workPixels(picture){
 const {width:W,height:H}=dims(picture),k=Math.min(1,WORK/Math.max(W,H)),w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k));
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(picture,0,0,w,h);
 return g.getImageData(0,0,w,h);
}
/**
 * Finds the background of a picture: {mask: canvas (the picture's size, alpha = keep), kind: 'person'|'plain',
 * coverage}, or null. `findPerson(picture)` is the face pack's segmenter (async, may be absent or fail); a photo with
 * faces asks it first, any other tries the plain background first.
 */
export async function findBackground(picture,{faces=[],findPerson=null}={}){
 const {width:W,height:H}=dims(picture);if(!(W>0&&H>0))return null;
 const person=async()=>{
  if(!findPerson)return null;
  try{
   const r=await findPerson(picture),p=r&&personMask(r.mask,r.width,r.height);if(!p)return null;
   // The segmenter's edge is 256 pixels across; the matte brings the hair back. Its failure leaves the coarse edge.
   let fine=null;try{fine=await refinePerson(picture,p);}catch{fine=null;}
   return {mask:maskCanvas(fine||p,W,H),kind:'person',coverage:p.coverage,refined:!!fine};
  }catch{return null;}
 };
 const plain=()=>{const p=plainMask(workPixels(picture));return p&&{mask:maskCanvas(p,W,H),kind:'plain',coverage:p.coverage};};
 const order=faces.length?[person,plain]:[plain,person];
 for(const way of order){const found=await way();if(found)return found;}
 return null;
}
/** Applies a mask to a drawn picture: the crop's part of it over the whole canvas (destination-in). */
export function applyMask(g,mask,crop,width,height){
 const c=crop||{x:0,y:0,w:1,h:1};
 g.save();g.globalCompositeOperation='destination-in';g.imageSmoothingQuality='high';
 g.drawImage(mask,c.x*mask.width,c.y*mask.height,c.w*mask.width,c.h*mask.height,0,0,width,height);g.restore();
}
/** The crop's part of a mask as a small PNG data URL, for a CSS mask on the preview. */
export function maskDataURL(mask,crop,longSide=512){
 const c=crop||{x:0,y:0,w:1,h:1},sw=c.w*mask.width,sh=c.h*mask.height,k=Math.min(1,longSide/Math.max(sw,sh));
 const o=document.createElement('canvas');o.width=Math.max(1,Math.round(sw*k));o.height=Math.max(1,Math.round(sh*k));
 const g=o.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(mask,c.x*mask.width,c.y*mask.height,sw,sh,0,0,o.width,o.height);
 return o.toDataURL('image/png');
}
/** A mask canvas from a stored PNG (a saved photo re-edited), or null. */
export async function maskFromBlob(blob,W,H){
 if(!(blob instanceof Blob))return null;
 try{const bmp=await createImageBitmap(blob);const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(bmp,0,0,W,H);bmp.close?.();return c;}catch{return null;}
}

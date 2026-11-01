// Exercises the actual bundled cascade and public detector API without browser/native canvas dependencies.
// Canvas sampling is supplied by recorded grayscale pixels; this does not claim browser resampling or visual QA.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {after,before,test} from 'node:test';

const fixture=name=>{
 const pgm=gunzipSync(readFileSync(new URL(`./fixtures/${name}-gray.pgm.gz`,import.meta.url)));
 const header=pgm.subarray(0,50).toString('ascii').match(/^P5\n(\d+) (\d+)\n255\n/);
 assert.ok(header,'known binary grayscale format');
 const width=+header[1],height=+header[2],pixels=pgm.subarray(header[0].length);
 assert.equal(pixels.length,width*height);
 const rgba=new Uint8ClampedArray(pixels.length*4);
 for(let i=0;i<pixels.length;i++){rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=pixels[i];rgba[i*4+3]=255;}
 return {width,height,rgba};
};
const portrait=fixture('portrait-braids'),harbour=fixture('harbour');
const model=readFileSync(new URL('../vendor/facefinder.bin',import.meta.url));
const oldFetch=globalThis.fetch,oldDocument=globalThis.document;
let requests=[],mode='valid',canvases=[];
before(()=>{
 globalThis.fetch=async url=>{
  const path=new URL(url);assert.equal(path.pathname,new URL('../vendor/facefinder.bin',import.meta.url).pathname);
  assert.match(path.search,/^\?v=/,'same-origin versioned model request');requests.push(path.href);
  if(mode==='offline')throw new Error('simulated missing cache');
  return {ok:true,arrayBuffer:async()=>mode==='incomplete'?new ArrayBuffer(10):model.buffer.slice(model.byteOffset,model.byteOffset+model.byteLength)};
 };
 globalThis.document={createElement:tag=>{
  assert.equal(tag,'canvas');let drawn=null;
  const canvas={width:0,height:0,getContext:(kind,options)=>{
   assert.equal(kind,'2d');assert.ok(options.willReadFrequently);
   return {fillRect(){},drawImage:(source,x,y,w,h)=>{
    assert.deepEqual([x,y,w,h],[0,0,canvas.width,canvas.height]);
    assert.equal(source.sample.width,w);assert.equal(source.sample.height,h);drawn=source.sample;
   },getImageData:(x,y,w,h)=>{
    assert.ok(drawn);assert.deepEqual([x,y,w,h],[0,0,canvas.width,canvas.height]);return {data:drawn.rgba};
   }};
  }};canvases.push(canvas);return canvas;
 }};
});
after(()=>{globalThis.fetch=oldFetch;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
const source=(sample,scale=1)=>({width:sample.width*scale,height:sample.height*scale,sample});
const detector=await import('../face-detect.js');

test('actual trained cascade finds the recorded portrait and returns source-normalized face bounds',async()=>{
 const face=await detector.detectLocalFace(source(portrait));
 assert.ok(face,'actual photo has one confidently detected face');
 assert.ok(face.x>.3&&face.x<.5&&face.y>.1&&face.y<.25,'bounds cover the face in the portrait');
 assert.ok(face.w>.35&&face.w<.6&&face.h>.3&&face.h<.5,'face has the expected approximate size');
 assert.ok(face.x>=0&&face.y>=0&&face.x+face.w<=1&&face.y+face.h<=1);
 assert.equal(requests.length,1,'classifier loaded from the bundled file');
});

test('actual classifier rejects the harbour photograph and a flat image without inventing a face',async()=>{
 assert.equal(await detector.detectLocalFace(source(harbour)),null);
 const flat={width:320,height:240,rgba:new Uint8ClampedArray(320*240*4).fill(160)};
 for(let i=3;i<flat.rgba.length;i+=4)flat.rgba[i]=255;
 assert.equal(await detector.detectLocalFace(source(flat)),null);
 assert.equal(requests.length,1,'same classifier reused for further photos');
});

test('large source coordinates retain the same face while the actual scan stays at 480 pixels',async()=>{
 const original=await detector.detectLocalFace(source(portrait));
 const large=await detector.detectLocalFace(source(portrait,10));
 assert.deepEqual(large,original);
 const canvas=canvases.at(-1);assert.equal(canvas.width,320);assert.equal(canvas.height,480);
});

test('missing or empty source returns null before loading a model or allocating a canvas',async()=>{
 const count=canvases.length,fetches=requests.length;
 for(const value of [null,undefined,{}, {width:0,height:0}])assert.equal(await detector.detectLocalFace(value),null);
 assert.equal(canvases.length,count);assert.equal(requests.length,fetches);
});

test('missing offline model and truncated model reject, then retry successfully',async()=>{
 const retry=await import('../face-detect.js?unit=retry'),start=requests.length;
 try{
  mode='offline';await assert.rejects(retry.detectLocalFace(source(portrait)),/simulated missing cache/);
  mode='incomplete';await assert.rejects(retry.detectLocalFace(source(portrait)),/incomplete/);
  mode='valid';assert.ok(await retry.detectLocalFace(source(portrait)));
  assert.equal(requests.length-start,3,'failed loading is not cached permanently');
 }finally{mode='valid';}
});

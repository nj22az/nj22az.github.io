/** DOM/canvas integration checks, not browser or device acceptance.
 * npm install --prefix /tmp/wardrobe-dom jsdom @napi-rs/canvas
 * TOWN_DOM_MODULES=/tmp/wardrobe-dom/node_modules node --test avatar-creator/tests/fabric-editor.dom.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(path.resolve(process.env.TOWN_DOM_MODULES||'node_modules','package.json'));
const {JSDOM}=require('jsdom'),{createCanvas,loadImage}=require('@napi-rs/canvas');
import {openFabricEditor} from '../../johansson-town/src/avatars/fabric-editor.js';
import {normalizeRecipe} from '../../johansson-town/src/avatars/recipe.js';
import {paintGarment,GARMENT,PLAIN_UV} from '../../johansson-town/src/avatars/garment.js';
import {blankFabric} from '../../johansson-town/src/avatars/fabric.js';
import {measure} from '../../johansson-town/src/avatars/build.js';
function setup(){
 const dom=new JSDOM('<!doctype html><body><button id="open">Design fabric</button></body>',{url:'https://example.test/avatar-creator/?wardrobe'}),w=dom.window;
 globalThis.document=w.document;globalThis.window=w;
 const canvases=new WeakMap(),backing=e=>{let c=canvases.get(e);if(!c){c=createCanvas(e.width,e.height);canvases.set(e,c);}return c;};
 w.HTMLCanvasElement.prototype.getContext=function(){return backing(this).getContext('2d');};
 w.HTMLCanvasElement.prototype.toDataURL=function(){return backing(this).toDataURL('image/png');};
 w.HTMLCanvasElement.prototype.setPointerCapture=function(){};
 w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:320,height:320});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 let download;w.HTMLAnchorElement.prototype.click=function(){download={href:this.href,name:this.download};};
 globalThis.createImageBitmap=async file=>{const image=await loadImage(Buffer.from(await file.arrayBuffer()));image.close=()=>{};return image;};
 document.querySelector('#open').focus();return {dom,w,download:()=>download};
}
const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent===text);
const change=(el,value,w)=>{el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));};

test('actual editor draws, fills, undoes, previews both garments, cancels and preserves keyboard focus',async()=>{
 const {w}=setup(),initial=normalizeRecipe({name:'Review',outfit:{top:'blouse',topColour:'#f4f1ea',bottom:'pleatedskirt'}});let seen=initial,pictures=0;
 openFabricEditor({recipe:initial,onPreview:r=>{seen=normalizeRecipe(r);},getPreview:()=>{pictures++;return 'data:image/png;base64,AA==';}});
 assert.ok(document.querySelector('dialog').open);button('Checks').click();assert.ok(seen.outfit.topFabric);assert.equal(seen.outfit.pattern,'none');assert.ok(pictures>=2);
 button('Undo stroke').click();assert.equal(seen.outfit.topFabric,null);
 button('Stripes').click();const stripes=seen.outfit.topFabric.pixels;
 const canvas=document.querySelector('canvas');canvas.dispatchEvent(new w.MouseEvent('pointerdown',{clientX:170,clientY:170,button:0,bubbles:true}));canvas.dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true}));assert.notEqual(seen.outfit.topFabric.pixels,stripes);
 button('Undo stroke').click();assert.equal(seen.outfit.topFabric.pixels,stripes);
 button('Eraser').click();canvas.dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',bubbles:true}));assert.equal(seen.outfit.topFabric.pixels[136],'.');
 change(document.querySelector('[data-target]'),'skirt',w);button('Checks').click();assert.equal(seen.outfit.bottom,'pleatedskirt');assert.equal(seen.outfit.skirtCut,'pressed');assert.ok(seen.outfit.skirtFabric);
 const dialog=document.querySelector('dialog');dialog.dispatchEvent(new w.Event('cancel',{cancelable:true}));assert.deepEqual(seen,initial);assert.equal(document.querySelector('dialog'),null);assert.equal(document.activeElement.id,'open');
});

test('keeping fabric supports image import, transparent PNG export and clearing without losing the other garment',async()=>{
 const {w,download}=setup(),initial=normalizeRecipe({outfit:{bottom:'trousers'}});let seen=initial;
 openFabricEditor({recipe:initial,target:'skirt',onPreview:r=>{seen=normalizeRecipe(r);}});
 const image=createCanvas(16,16),g=image.getContext('2d');g.fillStyle='#ff0000';g.fillRect(0,0,8,16);const bytes=image.toBuffer('image/png'),input=document.querySelector('input[type=file]');
 Object.defineProperty(input,'files',{value:[{type:'image/png',size:bytes.length,arrayBuffer:async()=>bytes}],configurable:true});await input.onchange({target:input});
 assert.equal(seen.outfit.bottom,'skirt');assert.equal(seen.outfit.skirtCut,'panel');assert.ok(seen.outfit.skirtFabric.pixels.includes('.'));
 button('Export tile PNG').click();assert.match(download().href,/^data:image\/png;base64,/);assert.equal(download().name,'Johansson-fabric-tile.png');
 button('Keep fabric').click();assert.equal(document.querySelector('dialog'),null);assert.ok(seen.outfit.skirtFabric);
 openFabricEditor({recipe:seen,target:'top',onPreview:r=>{seen=normalizeRecipe(r);}});button('Checks').click();button('Keep fabric').click();const savedSkirt=structuredClone(seen.outfit.skirtFabric);
 openFabricEditor({recipe:seen,target:'top',onPreview:r=>{seen=normalizeRecipe(r);}});button('Clear tile').click();button('Keep fabric').click();assert.equal(seen.outfit.topFabric,null);assert.deepEqual(seen.outfit.skirtFabric,savedSkirt);
});

test('stale image imports cannot overwrite newer painting or a cancelled editor',async()=>{
 setup();let seen=normalizeRecipe({}),resolveBitmap;const initial=seen;
 openFabricEditor({recipe:initial,onPreview:r=>{seen=normalizeRecipe(r);}});
 globalThis.createImageBitmap=()=>new Promise(resolve=>{resolveBitmap=resolve;});
 const input=document.querySelector('input[type=file]');Object.defineProperty(input,'files',{value:[{type:'image/png',size:40}],configurable:true});const importing=input.onchange({target:input});
 button('Checks').click();const drawn=structuredClone(seen);let closed=0;resolveBitmap({close(){closed++;}});await importing;assert.deepEqual(seen,drawn);assert.equal(closed,1);
 document.querySelector('[data-action=cancel]').click();assert.deepEqual(seen,initial);
});

test('fabric paints actual garment pixels and sleeves while the skin UV strip stays transparent',()=>{
 setup();const tile={...blankFabric(),pixels:'2'.repeat(256)},recipe=normalizeRecipe({outfit:{top:'blouse',pattern:'none',topFabric:tile}}),m=measure(recipe),canvas=createCanvas(GARMENT.width,GARMENT.height),ctx=canvas.getContext('2d');
 const marks=paintGarment(ctx,recipe,m,()=>1);assert.ok(marks.includes('custom-fabric'));
 const pixel=(x,y)=>[...ctx.getImageData(x,y,1,1).data];
 const red=p=>{const expected=[200,71,58,255];assert.ok(p.every((v,i)=>Math.abs(v-expected[i])<=1),`fabric pixel ${p}`);};
 red(pixel(30,140));
 red(pixel(30,Math.round((1-GARMENT.SLEEVE.v1)*GARMENT.height)+12));
 assert.equal(pixel(PLAIN_UV[0]*GARMENT.width,(1-PLAIN_UV[1])*GARMENT.height)[3],0);
});

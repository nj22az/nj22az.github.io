import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {createFilm,paint} from '../src/film.mjs';
const T=JSON.parse(readFileSync('src/timeline.json')),film=createFilm(T);
GlobalFonts.registerFromPath('assets/FilmSans.ttf','Film Sans');GlobalFonts.registerFromPath('assets/FilmSans-Bold.ttf','Film Sans');
const covered=new Set(T.scenes.flatMap(s=>s.slides));assert.deepEqual([...Array(70)].map((_,i)=>i+1).filter(n=>!covered.has(n)),[]);
assert.equal(T.scenes.length,37);assert.equal(T.chapters.length,12);
for(const c of T.captions){assert(c.start<c.end);assert(c.start>=0&&c.end<=T.duration);}
for(const s of T.scenes){assert(s.start*30%15===0);assert(s.voiceStart+s.voiceDuration<s.start+s.duration);assert.equal(T.captions.filter(c=>c.scene===s.id).map(c=>c.text).join(' '),s.say);}
const calc=[Math.abs(12/121-.099173553719)<1e-10,Math.abs(10*(10/11)/(1+10/11)-100/21)<1e-10,1000*1000/2000===500,Math.abs(.005*24+2*.01-.14)<1e-12];assert(calc.every(Boolean));
const canvas=createCanvas(1920,1080),ctx=canvas.getContext('2d'),env={W:1920,H:1080,scale:1,cache:new Map()};
const probes=T.scenes.map(s=>Math.round((s.start+Math.min(8,s.duration*.6))*30));
const hashes=new Map();let visibleChanges=0;const clipped=[];
const orig=ctx.fillText.bind(ctx);ctx.fillText=(text,x,y,...rest)=>{const width=ctx.measureText(text).width,left=ctx.textAlign==='right'?x-width:ctx.textAlign==='center'?x-width/2:x;const m=ctx.getTransform(),gx=m.a*left+m.c*y+m.e,gy=m.b*left+m.d*y+m.f,right=m.a*(left+width)+m.c*y+m.e;if(gx<-.5||right>1920.5||gy>1075)clipped.push({text,x:gx,y:gy,width:right-gx});return orig(text,x,y,...rest)};
for(const frame of probes){paint(film,T,ctx,frame,env,true);hashes.set(frame,createHash('sha256').update(canvas.data()).digest('hex'));paint(film,T,ctx,frame+30,env,true);if(hashes.get(frame)!==createHash('sha256').update(canvas.data()).digest('hex'))visibleChanges++;}
for(const frame of [...probes].reverse()){paint(film,T,ctx,frame,env,true);assert.equal(hashes.get(frame),createHash('sha256').update(canvas.data()).digest('hex'));}
assert.equal(clipped.length,0,JSON.stringify(clipped));assert.equal(visibleChanges,37,'One-second change check');
const report={slidesCovered:covered.size,scenes:T.scenes.length,chapters:T.chapters.length,duration:T.duration,captionCues:T.captions.length,deterministicFrames:probes.length,changedAfterOneSecond:visibleChanges,textOutsideFrame:clipped.length,mathChecks:calc.length};writeFileSync('build/check.json',JSON.stringify(report,null,2));console.log(report);

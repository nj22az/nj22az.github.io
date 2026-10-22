// Inspect the encoded moving stream during real-time browser playback, then verify exact-time seeking.
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {StudioPage} from '../../../johansson-town/tools/studio/page.mjs';import {frameAt} from './timeline.mjs';
const require=createRequire(new URL('../../../johansson-town/package.json',import.meta.url));const {chromium}=require('playwright');
const root='production/vy-classroom',browser=await chromium.launch({headless:true,...process.env.STUDIO_BROWSER?{executablePath:process.env.STUDIO_BROWSER}:{},args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const report={};
try{
 const page=await browser.newPage();await page.setContent('<video muted playsinline></video>');
 const b64=(await fs.readFile(root+'/Vy-Classroom-Review.mp4')).toString('base64');
 report.playback=await page.evaluate(async b64=>{
  const v=document.querySelector('video');v.src='data:video/mp4;base64,'+b64;const seen=[];
  const sample=(now,m)=>{seen.push({time:m.mediaTime,frame:m.presentedFrames});if(!v.ended)v.requestVideoFrameCallback(sample);};v.requestVideoFrameCallback(sample);
  await new Promise((resolve,reject)=>{v.onended=resolve;v.onerror=()=>reject(Error('Encoded MP4 failed to play'));v.play().catch(reject);});
  const q=v.getVideoPlaybackQuality();return {ended:v.ended,duration:v.duration,width:v.videoWidth,height:v.videoHeight,total:q.totalVideoFrames,dropped:q.droppedVideoFrames,callbacks:seen.length,first:seen[0],last:seen.at(-1)};
 },b64);assert.equal(report.playback.ended,true);assert.equal(report.playback.total,600);assert.equal(report.playback.width,540);
}finally{await browser.close();}
const s=new StudioPage();try{
 await s.start();const project=JSON.parse(await fs.readFile(root+'/source.studio.json','utf8')),motions=JSON.parse(await fs.readFile(root+'/motions.json','utf8')),env=JSON.parse(await fs.readFile(root+'/envelopes.json','utf8'));
 const scenes=[330,10,599,330].map(f=>frameAt(project,f/30,motions,env).scene);
 report.exactSeek=await s.evaluate(async scenes=>{
  const {createSceneWorkspace}=await import('/avatar-creator/scene.js');const w=createSceneWorkspace({getCharacter:()=>scenes[0].actors[0].recipe,onEdit(){},onMode(){}});document.body.append(w.root);
  try{let first,last;for(let i=0;i<scenes.length;i++){const r=await w.renderScene(scenes[i],{width:540});if(i===0)first=r.image;if(i===scenes.length-1)last=r.image;}return {samePixels:first===last,sequence:[330,10,599,330]};}finally{w.dispose();}
 },scenes);assert.equal(report.exactSeek.samePixels,true);assert.deepEqual(s.errors,[]);
}finally{await s.close();}
await fs.writeFile(root+'/encoded-review.json',JSON.stringify(report,null,2));console.log(report);

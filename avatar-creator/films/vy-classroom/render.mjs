import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {StudioPage} from '../../../johansson-town/tools/studio/page.mjs';
import {FPS,DURATION,frameAt,subtitles} from './timeline.mjs';
const root=path.resolve('production/vy-classroom'),project=JSON.parse(await fs.readFile(process.argv[2]||'production/vy-classroom/source.studio.json','utf8'));
await fs.mkdir(root+'/frames',{recursive:true});
const envelopes=JSON.parse(await fs.readFile(root+'/envelopes.json','utf8').catch(()=>'{}'));
const studio=new StudioPage();
try{
 await studio.start();console.log('Studio ready');
 await studio.page.setViewportSize({width:820,height:1180});
 const motions=await studio.evaluate(async recipe=>{
  const {buildAvatar}=await import('/johansson-town/src/avatars/build.js');
  const {poseSceneAvatar}=await import('/avatar-creator/scene-avatar.js');
  const {MOTION_JOINTS,normalizeMotion}=await import('/johansson-town/src/avatars/motion.js');
  const {exportAvatarGLB}=await import('/johansson-town/src/avatars/export.js');
  const {importMotionGLB}=await import('/johansson-town/src/avatars/motion-import.js');
  const sample=(pose,duration,modify=()=>{})=>{
   const a=buildAvatar(recipe),times=Array.from({length:Math.round(duration*30)+1},(_,i)=>i/30),joints=Object.fromEntries(MOTION_JOINTS.map(n=>[n,[]]));
   for(const t of times){a.root.position.set(0,0,0);poseSceneAvatar(a,{pose,expression:'scared',time:t});modify(a,t);for(const n of MOTION_JOINTS)a.bones[n].quaternion.toArray(joints[n],joints[n].length);}
   a.dispose();return normalizeMotion({format:'johansson-motion',version:1,name:'Vy '+pose,times,joints});
  };
  const run=sample('SchoolRun',1.2),protest=sample('SchoolProtest',6.8,(a,t)=>{a.bones.chest.rotation.z+=.035*Math.sin(t*6);a.bones.shoulderL.rotation.z+=.12*Math.sin(t*7);});
  // Exercise PR #297 with actual Vy geometry, not an invented dummy skeleton.
  const glb=await exportAvatarGLB(recipe,{motion:run});const source=await importMotionGLB(glb,()=>buildAvatar(recipe));let imported;
  try{imported=source.motion(0);}finally{source.dispose();}
  window.__vyGLB=Array.from(new Uint8Array(glb));
  window.__vyWorkspace=(await import('/avatar-creator/scene.js')).createSceneWorkspace({getCharacter:()=>recipe,onEdit(){},onMode(){}});document.body.append(window.__vyWorkspace.root);
  return {run:imported,protest};
 },project.panelScenes[0].actors[0].recipe);
 await fs.writeFile(root+'/vy-run.glb',Buffer.from(await studio.evaluate(()=>window.__vyGLB)));
 await fs.writeFile(root+'/motions.json',JSON.stringify(motions));
 const reports=[];const checkpoints=process.env.FILM_CHECKPOINTS?.split(',').map(Number);
 const frames=checkpoints||Array.from({length:FPS*DURATION},(_,i)=>i);
 for(const f of frames){
  const state=frameAt(project,f/FPS,motions,envelopes);
  const result=await studio.evaluate(async ({scene,subtitle})=>{
   const r=await window.__vyWorkspace.renderScene(scene,{width:540});
   const img=new Image();img.src=r.image;await img.decode();
   const c=document.createElement('canvas');c.width=540;c.height=800;const x=c.getContext('2d');x.fillStyle='#faf7ee';x.fillRect(0,0,540,800);x.drawImage(img,0,0,540,720);
   x.fillStyle='#514a40';x.font='13px sans-serif';x.textAlign='right';x.fillText('BẢN XEM THỬ',520,23);
   if(subtitle){x.textAlign='center';x.fillStyle='#30291f';x.font='bold 19px sans-serif';const words=subtitle.split(' '),lines=[];let line='';for(const w of words){if(x.measureText(line+' '+w).width>490){lines.push(line);line=w;}else line+=(line?' ':'')+w;}if(line)lines.push(line);lines.forEach((s,i)=>x.fillText(s,270,748+i*24));}
   return {image:c.toDataURL('image/png'),contacts:r.contacts,framing:r.framing};
  },{scene:state.scene,subtitle:subtitles.find(s=>f/FPS>=s.start&&f/FPS<s.end)?.text||''});
  const name=String(f).padStart(5,'0');await fs.writeFile(root+'/frames/'+name+'.png',StudioPage.bytes(result.image));
  reports.push({frame:f,beat:state.beat,contacts:result.contacts,framing:result.framing});
  if(f%30===0)console.log(`frame ${f}/${FPS*DURATION}`);
 }
 assert.deepEqual(studio.errors,[]);for(const r of reports){for(const c of r.contacts){if(c.contact==='floor')assert.ok(Math.abs(c.error)<1e-6,'Sole support at frame '+r.frame);if(c.contact==='desk')assert.ok(c.error<.01,'Desk hand contact at frame '+r.frame);if(c.contact==='back-of-blouse')assert.ok(c.right<.01,'Blouse grip at frame '+r.frame);}for(const a of r.framing)assert.ok(a.visible,'Head visibility at frame '+r.frame);}
 await fs.writeFile(root+'/checks.json',JSON.stringify(reports,null,2));
 console.log('Rendered',reports.length,'frames; browser errors:',studio.errors.length);
}finally{await studio.close();}

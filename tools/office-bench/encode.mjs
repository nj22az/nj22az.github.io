// Run after render.mjs. ffmpeg is an authoring dependency, never a browser dependency.
import {spawnSync} from 'node:child_process';
import {mkdir,stat,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(new URL('../..',import.meta.url).pathname),out=resolve(root,'assets/office-bench');await mkdir(out,{recursive:true});
const people=[['fujita','Fujita','Umineko beer can'],['johansson','Johansson','J-Coffee can'],['thuan','Thuận',null],['tetsuo','Tetsuo',null]],manifest=[];
function ffmpeg(args){const r=spawnSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});if(r.status!==0)throw Error('ffmpeg failed');}
for(const [id,name,prop] of people){
 const frames=resolve(root,'output/office-bench/frames',id);
 ffmpeg(['-i',resolve(frames,'000.png'),'-frames:v','1','-c:v','libwebp','-quality','82','-compression_level','6',resolve(out,id+'.webp')]);
 ffmpeg(['-framerate','12','-i',resolve(frames,'%03d.png'),'-c:v','libx264','-preset','slow','-crf','31','-pix_fmt','yuv420p','-movflags','+faststart','-an',resolve(out,id+'.mp4')]);
 const posterBytes=(await stat(resolve(out,id+'.webp'))).size,videoBytes=(await stat(resolve(out,id+'.mp4'))).size;
 if(videoBytes>80000||posterBytes>24000)throw Error(id+' exceeds the decorative scene budget');
 manifest.push({id,name,prop,width:480,height:360,seconds:10,fps:12,posterBytes,videoBytes});
}
await writeFile(resolve(out,'manifest.json'),JSON.stringify({source:'Johansson World character rigs, Harbour Park and original Blender bench',runtime3D:false,residents:manifest},null,2)+'\n');console.log(manifest);

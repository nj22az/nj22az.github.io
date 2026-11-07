// Run after render.mjs. ffmpeg is an authoring dependency, never a browser dependency.
import {spawnSync} from 'node:child_process';
import {mkdir,stat,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(new URL('../..',import.meta.url).pathname),out=resolve(root,'assets/office-port');await mkdir(out,{recursive:true});
const people=[['fujita','Fujita',null],['johansson','Johansson',null],['thuan','Thuận',null],['tetsuo','Tetsuo',null]],manifest=[];
function ffmpeg(args){const r=spawnSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});if(r.status!==0)throw Error('ffmpeg failed');}
for(const [id,name,prop] of people){
 const frames=resolve(root,'output/office-port/frames',id);
 
 ffmpeg(['-framerate','15','-i',resolve(frames,'%03d.png'),'-frames:v','135','-c:v','libx264','-preset','slow','-crf','32','-pix_fmt','yuv420p','-movflags','+faststart','-an',resolve(out,id+'.mp4')]);
 const videoBytes=(await stat(resolve(out,id+'.mp4'))).size;
 if(videoBytes>500000)throw Error(id+' exceeds the decorative scene budget');
 manifest.push({id,name,prop,width:960,height:540,seconds:9,fps:15,videoBytes});
}
ffmpeg(['-i',resolve(root,'output/office-port/harbour.png'),'-frames:v','1','-c:v','libwebp','-quality','82','-compression_level','6',resolve(out,'harbour.webp')]);
const posterBytes=(await stat(resolve(out,'harbour.webp'))).size;if(posterBytes>100000)throw Error('Port poster exceeds 100 KB');
await writeFile(resolve(out,'manifest.json'),JSON.stringify({source:'Johansson World createSpawnScene, minato-maru port opening and actual town geometry',runtime3D:false,posterBytes,autoplay:'once',drinks:false,residents:manifest},null,2)+'\n');console.log(manifest);

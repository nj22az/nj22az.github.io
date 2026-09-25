// Helios drives the same Anidoodle frame contract for native Canvas video export.
// No browser, browser automation or screen recording. Deterministic frame seeking.
import {Helios,NoopDriver,ManualTicker} from '@helios-project/core';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {createFilm,paint} from '../src/film.mjs';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
const timeline=JSON.parse(readFileSync('src/timeline.json'));
GlobalFonts.registerFromPath('assets/FilmSans.ttf','Film Sans');GlobalFonts.registerFromPath('assets/FilmSans-Bold.ttf','Film Sans');
const film=createFilm(timeline),args=process.argv.slice(2);
const get=(k,d)=>{let i=args.indexOf(k);return i<0?d:args[i+1]};
const start=Number(get('--start','0')),end=Math.min(Number(get('--end',timeline.duration)),timeline.duration);
const width=Number(get('--width','1920')),height=width*9/16,out=get('--out','build/Alternating_Current_Aboard_EN.mp4');
const first=Math.round(start*30),last=Math.round(end*30);
const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
const env={W:1920,H:1080,scale:width/1920,cache:new Map(),canvas(w,h){const a=createCanvas(w,h);return {canvas:a,ctx:a.getContext('2d')}}};
const helios=new Helios({duration:timeline.duration,fps:30,width:1920,height:1080,driver:new NoopDriver(),ticker:new ManualTicker()});
helios.subscribe(state=>paint(film,timeline,ctx,state.currentFrame,env,true));
mkdirSync('build',{recursive:true});
if(!existsSync('build/mix.wav')){const m=spawnSync('ffmpeg',['-v','error','-y','-i','assets/narration-en.mp3','-i','assets/music-en.mp3','-filter_complex','[0:a][1:a]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false:latency=true[a]','-map','[a]','-ar','48000','-ac','2','build/mix.wav'],{stdio:'inherit'});if(m.status)throw Error('Could not rebuild soundtrack');}
const chapterRanges=timeline.chapters.map((title,i)=>({title,start:timeline.scenes.find(s=>s.chapter===i).start,end:i+1<timeline.chapters.length?timeline.scenes.find(s=>s.chapter===i+1).start:timeline.duration}));
const chapterFile=`build/chapters-${first}-${last}.ffmeta`;
writeFileSync(chapterFile,';FFMETADATA1\ntitle=Alternating Current Aboard — Sjöskolan\nartist=Sjöskolan\nlanguage=eng\n'+chapterRanges.filter(c=>c.end>start&&c.start<end).map(c=>`[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round((Math.max(c.start,start)-start)*1000)}\nEND=${Math.round((Math.min(c.end,end)-start)*1000)}\ntitle=${c.title}\n`).join(''));
const cmd=['-hide_banner','-loglevel','warning','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${width}x${height}`,'-r','30','-i','pipe:0','-ss',String(start),'-i','build/mix.wav','-i',chapterFile,'-map','0:v','-map','1:a','-map_metadata','2','-map_chapters','2','-metadata:s:a:0','language=eng','-c:v','libx264','-preset','slow','-crf',get('--crf','27'),'-pix_fmt','yuv420p','-threads','3','-c:a','aac','-b:a','96k','-t',String(end-start),'-movflags','+faststart',out];
const ff=spawn('ffmpeg',cmd,{stdio:['pipe','inherit','inherit']});
let error=null;ff.on('error',e=>error=e);const finished=once(ff,'close');
const before=Date.now();
for(let frame=first;frame<last;frame++){
 helios.seek(frame);if(frame===first)paint(film,timeline,ctx,frame,env,true);
 const pixels=ctx.getImageData(0,0,width,height).data;
 if(!ff.stdin.write(Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength)))await once(ff.stdin,'drain');
 if((frame-first)%900===0)console.log(`${out}: ${((frame-first)/(last-first)*100).toFixed(1)}% (${((Date.now()-before)/1000).toFixed(0)}s)`);
}
ff.stdin.end();const [code]=await finished;if(error||code)throw error||Error(`ffmpeg ${code}`);
helios.dispose();console.log(JSON.stringify({out,start,end,width,height,frames:last-first,elapsed:(Date.now()-before)/1000}));

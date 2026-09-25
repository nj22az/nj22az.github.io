import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {scenes,chapters} from '../src/content.mjs';
import {drawScene,drawCaptions} from '../src/draw.mjs';
import {mkdirSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
GlobalFonts.registerFromPath(new URL('../assets/FilmSans.ttf',import.meta.url).pathname,'Film Sans');
GlobalFonts.registerFromPath(new URL('../assets/FilmSans-Bold.ttf',import.meta.url).pathname,'Film Sans');
const timeline=existsSync('src/timeline.json')?JSON.parse(readFileSync('src/timeline.json')):null;
mkdirSync('build/frames',{recursive:true});
let ids=process.argv.slice(2);if(!ids.length)ids=['welcome'];if(ids[0]==='all')ids=scenes.map(s=>s.id);
for(const id of ids){const s=timeline?.scenes.find(s=>s.id===id)||{...scenes.find(s=>s.id===id),duration:24};if(!s)throw Error(id);const c=createCanvas(1920,1080),ctx=c.getContext('2d');let time=Math.min(s.duration*.6,14);s.chapterName=chapters[s.chapter];drawScene(ctx,s,time,{scale:1});drawCaptions(ctx,timeline?.captions||[],(s.start||0)+time,1);writeFileSync(`build/frames/${id}.png`,c.toBuffer('image/png'));console.log(id);}

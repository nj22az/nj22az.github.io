import {renderFrame,validate} from '../vendor/anidoodle-film.mjs';
import {drawScene,drawCaptions} from './draw.mjs';
export function createFilm(timeline){
 const film={meta:{title:'Alternating Current Aboard',W:1920,H:1080,fps:30,bpm:120,durationFrames:Math.round(timeline.duration*30),raster:'cpu'},assets:{images:{}},shots:timeline.scenes.map(scene=>({id:scene.id,start:Math.round(scene.start*30),end:Math.round((scene.start+scene.duration)*30),draw:(ctx,local,env)=>drawScene(ctx,{...scene,chapterName:timeline.chapters[scene.chapter]},local/30,env)}))};
 const errors=validate(film);if(errors.length)throw Error(errors.join('\n'));return film;
}
export function paint(film,timeline,ctx,frame,env,captions=true){
 const bounded=Math.max(0,Math.min(film.meta.durationFrames-1,Math.round(frame)));
 const id=renderFrame(film,ctx,bounded,env);
 if(captions)drawCaptions(ctx,timeline.captions,bounded/30,env.scale);
 return id;
}

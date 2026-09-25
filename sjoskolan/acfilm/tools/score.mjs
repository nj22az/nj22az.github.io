// Original composition: "Mätresan", C major, 120 BPM, lilting triplet arpeggios.
// Anidoodle's music recipe informs synthesis; all notes and arrangement are original.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const T=JSON.parse(readFileSync('src/timeline.json'));mkdirSync('build',{recursive:true});
const notes=[],score=['frame,seconds,midi,note,velocity,instrument,pan'];
const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
function note(frame,midi,velocity,instrument,pan=0){if(frame>=T.duration*30)return;notes.push([frame,midi,velocity,instrument,pan]);score.push([frame,(frame/30).toFixed(3),midi,names[midi%12]+(Math.floor(midi/12)-1),velocity,instrument,pan].join(','));}
const chords=[[60,64,67],[65,69,72],[67,71,74],[60,64,67]];
const melodies=[[76,74,72,76],[77,76,74,72],[74,76,74,79],[76,74,72,72], [79,76,74,72],[77,79,81,77],[79,77,74,79],[76,74,72,72]];
for(let bar=0;bar*60<T.duration*30;bar++){
 const frame=bar*60,chord=chords[bar%4],melody=melodies[bar%8];
 const scene=T.scenes.find(s=>frame/30>=s.start&&frame/30<s.start+s.duration)||T.scenes.at(-1);
 const density=scene.visual==='intro'||scene.visual==='outro'?1:0;
 // Major-key four-bar phrases always resolve on C; arrange more lightly under calculation chapters.
 for(let beat=0;beat<4;beat++){note(frame+beat*15,melody[beat],beat%2?.48:.67,0,.16);if(density===2&&bar%4===3)note(frame+beat*15,melody[beat]+12,.16,0,.4);}
 if(density>=0){note(frame,chord[0]-24,.60,1,-.12);note(frame+30,chord[2]-24,.39,1,-.12);}
 if(density>=1)for(let k=0;k<12;k++){const pattern=[0,2,1,2];note(frame+k*5,chord[pattern[k%4]],.22,0,-.24);}
 if(scene.visual==='intro'||scene.visual==='outro')for(let k=0;k<4;k++)note(frame+k*15,0,.10,k%2?3:2,0);
}
const endFrame=Math.floor((T.duration-3)/.5)*15;note(endFrame,72,.8,4,0);note(endFrame,60,.4,4,0);
writeFileSync('build/notes.tsv',notes.map(n=>n.join('\t')).join('\n'));
writeFileSync('assets/score.csv',score.join('\n'));
writeFileSync('build/voice-spans.tsv',T.scenes.map(s=>[s.voiceStart,s.voiceStart+s.voiceDuration].join('\t')).join('\n'));
let r=spawnSync('java',['tools/MusicScore.java',String(T.duration),'build/notes.tsv','build/voice-spans.tsv','build/music.wav'],{stdio:'inherit'});if(r.status)process.exit(r.status);
const run=args=>{const r=spawnSync('ffmpeg',['-v','error','-y',...args],{stdio:'inherit'});if(r.status)process.exit(r.status)};
run(['-i','build/music.wav','-c:a','libmp3lame','-b:a','128k','assets/music-en.mp3']);
run(['-i','build/narration.wav','-i','build/music.wav','-filter_complex','[0:a][1:a]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false:latency=true[a]','-map','[a]','-ar','48000','-ac','2','build/mix.wav']);
console.log(JSON.stringify({notes:notes.length,seconds:T.duration,score:'assets/score.csv',synthesizer:'Java 17'}));

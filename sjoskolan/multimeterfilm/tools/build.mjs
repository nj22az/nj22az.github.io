import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
const T=JSON.parse(readFileSync('src/timeline.json'));
// Tie instructional state changes to the English narration, not the old Swedish timings.
const events={kontinuitet:{fuse:'An intact fuse',open:'An open path'},parallellohm:{disconnect:'Disconnecting one branch'},aterstall:{restore:'Move the red lead back'},feluttag:{answer:'The current input has low resistance'},katval:{answer:'B meets both requirements'}};
for(const scene of T.scenes){scene.cues={};for(const [key,phrase] of Object.entries(events[scene.id]||{})){const cue=T.captions.find(c=>c.scene===scene.id&&c.text.includes(phrase));if(!cue)throw Error(`Missing animation cue: ${scene.id}/${key}`);scene.cues[key]=cue.start-scene.start;}}
writeFileSync('src/timeline.json',JSON.stringify(T,null,2));
await build({entryPoints:['src/player.mjs'],outfile:'player.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
const mm=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
writeFileSync('SCRIPT_EN.md','# Multimeter Aboard\n\nSjöskolan. British English narration and original music.\n\n'+T.scenes.map(s=>`## ${mm(s.start)} · ${s.title}\n\nPowerPoint slides: ${s.slides.join(', ')}.\n\n${s.say}\n`).join('\n'));
writeFileSync('COVERAGE.md','# PowerPoint coverage\n\nSource: v39_03_Multimeter_och_matfel_elev.pptx, 70 slides.\n\nThe English edition retains all 37 scenes and all numerical examples from the Swedish film. Linked external films on slide 69 are referenced, not reproduced.\n\n| Time | Film scene | PowerPoint slides |\n|---|---|---|\n'+T.scenes.map(s=>`| ${mm(s.start)} | ${s.title} | ${s.slides.join(', ')} |`).join('\n'));
console.log(`Built: ${T.scenes.length} scenes, ${T.chapters.length} chapters, ${mm(T.duration)}.`);

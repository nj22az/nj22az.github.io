import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
const T=JSON.parse(readFileSync('src/timeline.json'));
for(const scene of T.scenes){
 const cues=T.captions.filter(c=>c.scene===scene.id);
 const cue=phrase=>{const c=cues.find(c=>c.text.includes(phrase));if(!c)throw Error(`Missing cue ${scene.id}: ${phrase}`);return c.start-scene.start;};
 scene.stepTimes=(scene.stepCues||[]).map(cue);
 scene.revealTime=scene.reveal?cue(scene.reveal):0;
 scene.answerTime=scene.pauseBefore?cue(scene.pauseBefore):null;
}
writeFileSync('src/timeline.json',JSON.stringify(T,null,2));
await build({entryPoints:['src/player.mjs'],outfile:'player.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
const mm=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
writeFileSync('SCRIPT_EN.md','# Alternating Current Aboard\n\nSjöskolan, week 40, 28 September–2 October 2026. British English synthetic narration.\n\n'+T.scenes.map(s=>`## ${mm(s.start)} · ${s.title}\n\nLesson ${s.chapter+1}, source slides: ${s.slides.join(', ')}.\n\n${s.say}\n`).join('\n'));
writeFileSync('COVERAGE.md','# Week 40 teaching coverage\n\nOriginal source decks, archived on 25 September 2026 under ../vecka-40/arkiv/2026-09-25/: 36 slides each (108 total). Slide numbers below refer to that archive, not the shorter current presentations. This film explains the core theory, all six worked-example slides (9 and 24 in each deck), and selected practice methods. It does not read every support slide or provide a complete answer key to all thirty exercises. The current week page defines the basic guided tasks and optional extension work.\n\nSources:\n- v40_01_Sinusformad_vaxelspanning_elev.pptx\n- v40_02_Reaktans_och_impedans_elev.pptx\n- v40_03_Effekt_i_vaxelstromskretsar_elev.pptx\n\nThree additional questions have a six-second thinking pause before the answer; students can pause longer. Source slide numbers refer to the individual lesson deck.\n\n| Time | Chapter | Scene | Source slides |\n|---|---|---|---|\n'+T.scenes.map(s=>`| ${mm(s.start)} | ${s.chapter+1} | ${s.title} | ${s.slides.join(', ')} |`).join('\n'));
console.log(JSON.stringify({scenes:T.scenes.length,chapters:T.chapters.length,duration:T.duration,minutes:mm(T.duration)}));


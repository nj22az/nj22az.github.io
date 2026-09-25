import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
await build({entryPoints:['src/player.mjs'],outfile:'player.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof'});
const T=JSON.parse(readFileSync('src/timeline.json'));
const mm=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
writeFileSync('MANUS_SV.md','# Multimetern ombord\n\nSjöskolan. Svensk berättarröst och originalmusik.\n\n'+T.scenes.map(s=>`## ${mm(s.start)} · ${s.title}\n\nPowerPoint: bild ${s.slides.join(', ')}.\n\n${s.say}\n`).join('\n'));
writeFileSync('COVERAGE.md','# Koppling till PowerPoint\n\nUnderlag: Multimeter_Sjoskolan_v7_SV.pptx, 70 bilder.\n\n| Tid | Filmscen | PowerPoint |\n|---|---|---|\n'+T.scenes.map(s=>`| ${mm(s.start)} | ${s.title} | ${s.slides.join(', ')} |`).join('\n'));
console.log(`Built: ${T.scenes.length} scenes, ${T.chapters.length} chapters, ${mm(T.duration)}.`);

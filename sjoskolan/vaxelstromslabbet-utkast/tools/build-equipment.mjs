import {build} from 'esbuild';
import {copyFile,mkdir} from 'node:fs/promises';
await build({entryPoints:['equipment.mjs'],outfile:'equipment.js',bundle:true,format:'esm',minify:true,target:'es2022',external:['./equipment-state.mjs'],legalComments:'eof'});
await mkdir('vendor',{recursive:true});await copyFile('node_modules/three/LICENSE','vendor/THREE-LICENSE.txt');
console.log('Built the Three.js instrument bench.');

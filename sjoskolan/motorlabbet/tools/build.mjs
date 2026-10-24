// Bygger motorlabbets 3D-bänk: scen.mjs + three.js → scen.js (en fil, ingen extern CDN).
// three och esbuild hämtas från vaxelstromslabbet/node_modules (samma versioner som växelströmslabbets bänk).
//   (cd sjoskolan/vaxelstromslabbet && npm ci) && node sjoskolan/motorlabbet/tools/build.mjs
import { build } from '../../vaxelstromslabbet/node_modules/esbuild/lib/main.js';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const hit = path.dirname(fileURLToPath(import.meta.url)), rot = path.resolve(hit, '..'), nm = path.resolve(rot, '../vaxelstromslabbet/node_modules');
await build({
  entryPoints: [path.join(rot, 'scen.mjs')], outfile: path.join(rot, 'scen.js'), bundle: true, format: 'esm', minify: true,
  target: 'es2022', nodePaths: [nm], legalComments: 'eof',
});
await mkdir(path.join(rot, 'vendor'), { recursive: true });
await copyFile(path.join(nm, 'three/LICENSE'), path.join(rot, 'vendor/THREE-LICENSE.txt'));
console.log('Byggde motorlabbets 3D-bänk (scen.js).');

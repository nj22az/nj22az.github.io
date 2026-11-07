// Bygger 3D-figurernas buntar med three och esbuild från vaxelstromslabbet/node_modules:
//   rendera.js (renderaren för stillbilder) och ../generatorn/scen.js (den interaktiva generatorn).
import { build } from '../../vaxelstromslabbet/node_modules/esbuild/lib/main.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), nm = path.resolve(rot, '../vaxelstromslabbet/node_modules');
const opt = { bundle: true, format: 'esm', minify: true, target: 'es2022', nodePaths: [nm], legalComments: 'eof' };
await build({ ...opt, entryPoints: [path.join(rot, 'rendera.mjs')], outfile: path.join(rot, 'rendera.js') });
await build({ ...opt, entryPoints: [path.resolve(rot, '../generatorn/scen.mjs')], outfile: path.resolve(rot, '../generatorn/scen.js') }).catch((e) => { if (!String(e).includes('Could not resolve')) throw e; });
console.log('Byggde rendera.js och generatorn/scen.js.');

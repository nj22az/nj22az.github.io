import {build} from 'vite';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {runtimeSourceHash} from './runtime-source.mjs';
const root=resolve(new URL('..',import.meta.url).pathname);
// configFile:false means vite.config.js is not read, so base has to be set here too.
// Without it the build defaults to '/', and the preload helper asks for every chunk
// at the site root: each dynamic import 404s its hint and loads unprefetched.
await build({configFile:false,root,publicDir:false,base:'./',build:{target:'es2022',outDir:'runtime',emptyOutDir:false,minify:'esbuild',manifest:true,rollupOptions:{input:{boot:resolve(root,'src/boot.js'),audio:resolve(root,'src/audio/town-audio.js')+'?snappy=1'},preserveEntrySignatures:'strict',output:{entryFileNames:'[name]-[hash].js',chunkFileNames:'[name]-[hash].js',assetFileNames:'[name]-[hash][extname]'}}}});
const manifest=JSON.parse(await readFile(resolve(root,'runtime/.vite/manifest.json'),'utf8'));
const boot=manifest['src/boot.js'].file,audio=Object.values(manifest).find(entry=>entry.isEntry&&entry.name==='audio').file;
let html=await readFile(resolve(root,'index.html'),'utf8');
html=html.replace(/from ['"]\.\/(?:src\/audio\/town-audio\.js(?:\?[^'"]*)?|runtime\/audio-[^'"]+)['"]/g,`from './runtime/${audio}'`);
html=html.replace(/import\(['"]\.\/(?:src\/boot\.js(?:\?[^'"]*)?|runtime\/boot-[^'"]+)['"]\)/g,`import('./runtime/${boot}')`);
// Fetch the compiled boot graph while the title screen is visible. This does not
// execute the game, unlock sound, or start model downloads before Enter Town.
html=html.replace(/<link rel="modulepreload" data-town-runtime[^>]*>\n?/g,'');
// Preload the modules the entry gate will need, not just boot. game.js was imported
// only after the street assets settled, so its chunk started downloading when the gate
// was nearly over and the player waited through it serially. Preloading fetches it
// alongside the assets without executing it, so the import resolves from cache.
const preloadEntries=['src/boot.js','touch-ui.js?ui=controls-3','src/game.js?snappy=1'];
const preloadFiles=[...new Set(preloadEntries.flatMap(name=>{
 const entry=manifest[name];
 return entry?[entry.file,...(entry.imports||[]).map(dep=>manifest[dep]?.file).filter(Boolean)]:[];
}))];
const preloadLinks=preloadFiles.map(file=>`<link rel="modulepreload" data-town-runtime href="./runtime/${file}">`).join('\n');
html=html.replace('</head>',`${preloadLinks}\n</head>`);
// Stamp every local stylesheet with a hash of its contents. These links carried
// hand-written query strings, so editing a stylesheet without remembering to bump its
// version served the old file from cache: new markup with stale CSS. The hash means
// the link changes exactly when the file does, and never when it does not.
const cssHashes=[];
html=html.replace(/href="(\.\/)?([\w-]+\.css)(\?[^"]*)?"/g,(match,prefix='',file)=>{
 const path=resolve(root,file);
 if(!existsSync(path))return match;
 const hash=createHash('sha256').update(readFileSync(path)).digest('hex').slice(0,8);
 cssHashes.push(file+' '+hash);
 return `href="${prefix}${file}?h=${hash}"`;
});
await writeFile(resolve(root,'index.html'),html);
await writeFile(resolve(root,'runtime/source.json'),JSON.stringify({sha256:await runtimeSourceHash(root)},null,2)+'\n');
console.log('Stylesheet hashes:',cssHashes.join(', '));
console.log('Published runtime entry points:',boot,audio,'files:',(await readdir(resolve(root,'runtime'))).filter(f=>f.endsWith('.js')).length);

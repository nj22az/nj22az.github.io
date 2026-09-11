import {build} from 'vite';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
await build({configFile:false,root,publicDir:false,build:{target:'es2022',outDir:'runtime',emptyOutDir:false,minify:'esbuild',manifest:true,rollupOptions:{input:{boot:resolve(root,'src/boot.js'),audio:resolve(root,'src/audio/town-audio.js')+'?snappy=1'},preserveEntrySignatures:'strict',output:{entryFileNames:'[name]-[hash].js',chunkFileNames:'[name]-[hash].js',assetFileNames:'[name]-[hash][extname]'}}}});
const manifest=JSON.parse(await readFile(resolve(root,'runtime/.vite/manifest.json'),'utf8'));
const boot=manifest['src/boot.js'].file,audio=Object.values(manifest).find(entry=>entry.isEntry&&entry.name==='audio').file;
let html=await readFile(resolve(root,'index.html'),'utf8');
html=html.replace(/from ['"]\.\/(?:src\/audio\/town-audio\.js(?:\?[^'"]*)?|runtime\/audio-[^'"]+)['"]/g,`from './runtime/${audio}'`);
html=html.replace(/import\(['"]\.\/(?:src\/boot\.js(?:\?[^'"]*)?|runtime\/boot-[^'"]+)['"]\)/g,`import('./runtime/${boot}')`);
// Fetch the compiled boot graph while the title screen is visible. This does not
// execute the game, unlock sound, or start model downloads before Enter Town.
html=html.replace(/<link rel="modulepreload" data-town-runtime[^>]*>\n?/g,'');
html=html.replace('</head>',`<link rel="modulepreload" data-town-runtime href="./runtime/${boot}">\n</head>`);
await writeFile(resolve(root,'index.html'),html);
console.log('Published runtime entry points:',boot,audio,'files:',(await readdir(resolve(root,'runtime'))).filter(f=>f.endsWith('.js')).length);

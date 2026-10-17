#!/usr/bin/env node
// Dev dependency: @napi-rs/canvas. The browser uses the identical exporter via Studio > Files.
import {createRequire} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {createCanvas}=require(process.env.STUDIO_CANVAS_MODULE||'@napi-rs/canvas');
globalThis.document={createElement(tag){if(tag!=='canvas')throw Error('Unexpected DOM element '+tag);return createCanvas(256,256);}};
const root=resolve(process.argv[2]||'..'),out=resolve(process.argv[3]||'assets/characters');
const {exportNativeFighter}=await import(pathToFileURL(resolve(root,'avatar-creator/native-export.js')));
const {recipeFor}=await import(pathToFileURL(resolve(root,'johansson-town/src/avatars/cast.js')));
await mkdir(out,{recursive:true});const manifest={format:'Johansson Studio native fighters',version:3,characters:[]};
for(const name of ['Thao','Thuan']){
 const result=exportNativeFighter(recipeFor(name));const bytes=Buffer.from(result.bytes);
 await writeFile(resolve(out,name.toLowerCase()+'.jwf.gz'),gzipSync(bytes,{level:9,mtime:0}));
 manifest.characters.push({...result,bytes:undefined,name,sha256:createHash('sha256').update(bytes).digest('hex')});
 console.log(name+': '+result.vertices+' vertices, '+result.bones+' bones, '+bytes.length+' bytes');
}
await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');

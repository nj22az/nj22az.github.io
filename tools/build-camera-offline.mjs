// Public runtime assets only: no personal photos, albums, QA, repository documents or World scene/models.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const root=fileURLToPath(new URL('../',import.meta.url));
const hash=data=>createHash('sha256').update(data).digest('hex');
export async function build(){
 const names=new Set(),page=await readFile(path.join(root,'camera/index.html'),'utf8'),version=page.match(/src="app\.js\?v=([\w-]+)"/)[1];
 async function add(name){if(names.has(name))return;names.add(name);
  if(!name.endsWith('.js')||name.startsWith('camera/'))return;
  const source=await readFile(path.join(root,name),'utf8');for(const [,url] of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g))if(url.startsWith('.'))await add(path.posix.normalize(path.posix.join(path.posix.dirname(name),url.split('?')[0])));
 }
 for(const name of await readdir(path.join(root,'camera')))if(name!=='sw.js'&&/\.(js|css|webmanifest|wasm|png|svg|webp|jpg)$/.test(name))await add('camera/'+name);
 await add('camera/index.html');await add('johansson-town/src/render/looks.js');
 async function folder(dir){for(const e of await readdir(path.join(root,dir),{withFileTypes:true})){const name=dir+'/'+e.name;if(e.isDirectory())await folder(name);else if(!/\.txt$/.test(name))await add(name);}}
 for(const dir of ['assets','icons','stickers','cards','samples','fonts','frames'])await folder('camera/'+dir);
 const files=[];for(const name of [...names].sort()){const bytes=await readFile(path.join(root,name));files.push({url:'/'+name,sha256:hash(bytes),bytes:bytes.length});}
 const manifest=JSON.stringify({version,bytes:files.reduce((sum,f)=>sum+f.bytes,0),files},null,2)+'\n';return {manifest,build:hash(manifest)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const b=await build(),worker=path.join(root,'camera/sw.js'),source=await readFile(worker,'utf8');
 await writeFile(path.join(root,'camera/offline.json'),b.manifest);await writeFile(worker,source.replace(/const BUILD='[^']+';/,"const BUILD='"+b.build+"';"));
 console.log(JSON.parse(b.manifest).files.length+' offline assets; '+JSON.parse(b.manifest).bytes+' bytes');
}

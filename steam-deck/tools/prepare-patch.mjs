// Fetch only the previous release's small file inventory. A missing inventory
// means this is the bootstrap update and the normal full download is published.
import {execFileSync} from 'node:child_process';
import {mkdirSync,appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import updater from '../updater.cjs';
import {readFileSync} from 'node:fs';
const app=resolve(import.meta.dirname,'..'),version=JSON.parse(readFileSync(resolve(app,'package.json'))).version;
const releases=JSON.parse(execFileSync('gh',['api','repos/nj22az/nj22az.github.io/releases?per_page=30'],{encoding:'utf8'}));
const prefix='johansson-world-linux-v';
const base=releases.filter(r=>!r.draft&&r.tag_name.startsWith(prefix)&&updater.newer(version,r.tag_name.slice(prefix.length))).sort((a,b)=>updater.newer(a.tag_name.slice(prefix.length),b.tag_name.slice(prefix.length))?-1:1)[0];
if(base?.assets.some(a=>a.name==='bundle-manifest.json')){
 const directory=resolve(app,'.patch-base');mkdirSync(directory,{recursive:true});
 execFileSync('gh',['release','download',base.tag_name,'--repo','nj22az/nj22az.github.io','--pattern','bundle-manifest.json','--dir',directory,'--clobber'],{stdio:'inherit'});
 const file=resolve(directory,'bundle-manifest.json');
 if(process.env.GITHUB_ENV)appendFileSync(process.env.GITHUB_ENV,'JOHANSSON_PATCH_BASE='+file+'\n');
 console.log('Patch base:',base.tag_name,file);
}else console.log('No patch-capable predecessor. Publishing the full bootstrap package.');

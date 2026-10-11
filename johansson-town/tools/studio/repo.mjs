import {fileURLToPath} from 'node:url';
import {resolve,relative,dirname,sep,posix} from 'node:path';
import {lstat,realpath,readFile,writeFile,rename,unlink,mkdir,readdir,stat} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';

/**
 * Where Johansson Studio's tools may read and write, and the only way they write.
 *
 * - The repository is found from this file (johansson-town/tools/studio/ → three folders up). JOHANSSON_STUDIO_ROOT
 *   moves it only inside `node --test` (NODE_TEST_CONTEXT), so a stray variable can never point the tools elsewhere.
 * - A write is allowed only to the paths below; anything else, a path that climbs out ("..") or a symbolic link
 *   anywhere on the way is refused. Every target is checked again with realpath and lstat just before writing.
 * - Writes go to a new temporary file beside the target and are renamed over it, one at a time (a serial queue), so a
 *   reader never sees half a file and two changes never interleave.
 * - Nothing here writes .mcp.json, settings, workflows, code or git, and nothing commits.
 */
export const CODE_ROOT=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
export function defaultRoot(){
 const forTests=process.env.NODE_TEST_CONTEXT&&process.env.JOHANSSON_STUDIO_ROOT;
 return resolve(forTests||CODE_ROOT);
}

export const PATHS=Object.freeze({
 looks:'johansson-town/data/studio/looks.json',
 products:'johansson-town/data/studio/products.json',
 log:'johansson-town/data/studio/log.json',
 brands:'johansson-town/data/studio/brand-rules.json',
 looksModule:'johansson-town/src/avatars/looks-data.js',
 productsModule:'johansson-town/src/commerce/products-data.js',
 output:'output/studio-mcp',
});
const WRITABLE=[PATHS.looks,PATHS.products,PATHS.log,PATHS.looksModule,PATHS.productsModule];
const LABEL=/^johansson-town\/assets\/graphics\/labels\/[a-z][a-z0-9-]{1,39}\.r[1-9][0-9]{0,3}\.webp$/;
const OUTPUT=/^output\/studio-mcp\/(?:[a-z0-9][a-z0-9._-]{0,80}\/){0,3}[a-z0-9][a-z0-9._-]{0,120}\.(png|webp|json|txt)$/;
export const OUTPUT_CAP=50*1024*1024;

/** Is this repository-relative path one Studio may write? (Checked before anything touches the disk.) */
export function writable(path){
 if(typeof path!=='string'||path.includes('\\')||path.includes('\0'))return false;
 const clean=posix.normalize(path);
 if(clean!==path||clean.startsWith('/')||clean.split('/').some(part=>part==='..'||part==='.'||part===''))return false;
 return WRITABLE.includes(clean)||LABEL.test(clean)||(OUTPUT.test(clean)&&!clean.split('/').some(p=>p.startsWith('.')));
}

let queue=Promise.resolve();
/** Run a task after every earlier one has finished (one writer at a time). */
export function serial(task){const run=queue.then(task);queue=run.catch(()=>{});return run;}

export function openRepo(root=defaultRoot()){
 root=resolve(root);
 const abs=path=>resolve(root,path);
 /** Refuses a path unless every folder on the way is a real folder inside the repository and the file is no link. */
 async function guard(path,{create=false}={}){
  if(!writable(path))throw Error(`Studio may not write ${JSON.stringify(path)}: only its data files, its generated modules, label pictures and output/studio-mcp are writable.`);
  const realRoot=await realpath(root),target=abs(path);
  let folder=dirname(target);
  if(create)await mkdirInside(realRoot,relative(root,folder));
  const realFolder=await realpath(folder);
  if(realFolder!==resolve(realRoot,relative(root,folder)))throw Error(`Studio will not write ${path}: a folder on the way is a link to somewhere else.`);
  const info=await lstat(target).catch(()=>null);
  if(info&&!info.isFile())throw Error(`Studio will not write ${path}: it is ${info.isSymbolicLink()?'a link to another file':'not an ordinary file'}.`);
  return target;
 }
 /** Make folders one at a time, refusing any that is (or becomes) a link. */
 async function mkdirInside(realRoot,folder){
  let at=realRoot;
  for(const part of folder.split(sep).filter(Boolean)){
   at=resolve(at,part);
   const info=await lstat(at).catch(()=>null);
   if(!info)await mkdir(at).catch(e=>{if(e.code!=='EEXIST')throw e;});
   else if(!info.isDirectory())throw Error(`Studio will not write inside ${relative(realRoot,at)}: it is ${info.isSymbolicLink()?'a link':'not a folder'}.`);
  }
 }
 async function write(path,content){
  const target=await guard(path,{create:path.startsWith(PATHS.output+'/')||LABEL.test(path)});
  const temporary=`${target}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(temporary,content,{flag:'wx'});
  try{await guard(path);await rename(temporary,target);}catch(e){await unlink(temporary).catch(()=>{});throw e;}
  if(path.startsWith(PATHS.output+'/'))await capOutput();
  return path;
 }
 async function read(path,encoding='utf8'){
  const target=abs(path),info=await lstat(target);
  if(info.isSymbolicLink())throw Error(`Studio will not read ${path}: it is a link to another file.`);
  return readFile(target,encoding);
 }
 const readJSON=async path=>JSON.parse(await read(path));
 const exists=path=>lstat(abs(path)).then(()=>true,()=>false);
 /** output/studio-mcp stays under 50 MB: the oldest files go first. */
 async function capOutput(){
  const files=[];
  async function scan(folder){for(const entry of await readdir(folder,{withFileTypes:true}).catch(()=>[])){const p=resolve(folder,entry.name);
   if(entry.isDirectory())await scan(p);else if(entry.isFile()){const s=await stat(p);files.push({p,size:s.size,time:s.mtimeMs});}}}
  await scan(abs(PATHS.output));
  let total=files.reduce((a,f)=>a+f.size,0);
  for(const f of files.sort((a,b)=>a.time-b.time)){if(total<=OUTPUT_CAP)break;await unlink(f.p).catch(()=>{});total-=f.size;}
 }
 return {root,abs,guard,write,read,readJSON,exists,capOutput};
}

/** JSON as Studio writes it: two spaces and a newline at the end, so the same data is always the same bytes. */
export const jsonText=data=>JSON.stringify(data,null,2)+'\n';

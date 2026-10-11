#!/usr/bin/env node
/**
 * Johansson Studio's changes: adding a change file to Studio's draft, publishing the draft into World's data, and
 * taking changes out of the draft. Nothing here commits or pushes ("update World", avatar-creator/docs/STUDIO-MCP.md).
 *
 * The draft (data/studio/draft/pending.json, which git ignores) holds the changes the creator has said yes to and not
 * yet published. Studio's tools show everybody as the published data with the draft laid over it. Only publishDraft
 * writes World's files (data/studio/looks.json, the generated modules, data/studio/log.json), and only when the creator
 * says "update World", so a change can never reach World through somebody else's commit.
 *
 *   node johansson-town/tools/studio/apply.mjs change.json           a dry run: what would change, nothing written
 *   node johansson-town/tools/studio/apply.mjs change.json --write   add it to the draft
 * Adding a change (1) validates it, (2) checks every step's `was` against the draft, (3) checks its pictures (stage 2:
 * no stage-1 step uses one) and (4) adds it to the draft, all in one step under Studio's write lock (repo.mjs).
 */
import {fileURLToPath} from 'node:url';
import {readFile,stat} from 'node:fs/promises';
import {openRepo,PATHS,serial,jsonText} from './repo.mjs';
import {looksModule,charactersModule} from './build-data.mjs';
import {validateChange,validateLooks,LIMITS} from '../../src/studio/rules.js';
import {applyOps} from '../../src/studio/change.js';
import {CHANGE_FORMAT,CHANGE_VERSION} from '../../src/studio/ops.js';
import {sha256,recordSha256} from '../../src/studio/sha256.js';

const DRAFT_FORMAT='johansson-studio-draft';
const emptyDraft=()=>({format:DRAFT_FORMAT,version:1,changes:[]});
const problem=(where,rule,sentence)=>({where,rule,sentence});
const refuse=(problems,extra={})=>({ok:false,applied:false,problems,...extra});
const asChange=r=>({format:CHANGE_FORMAT,version:CHANGE_VERSION,id:r.id,made:r.made,by:r.by,note:r.note,ops:r.ops});
const own=(map,key)=>map&&Object.hasOwn(map,key)?map[key]:undefined;

/** The real-brand rules every name and label is checked against. */
const readBrands=repo=>repo.readJSON(PATHS.brands);
/** The draft: the changes said yes to and not yet published, oldest first. */
async function readDraft(repo){
 if(!await repo.exists(PATHS.draft))return emptyDraft();
 const draft=await repo.readJSON(PATHS.draft);
 if(draft?.format!==DRAFT_FORMAT||draft.version!==1||!Array.isArray(draft.changes))
  throw Error(`${PATHS.draft} is not a Johansson Studio draft. Move it aside; the changes in it would have to be made again.`);
 return draft;
}

/**
 * The published looks with the draft's changes laid over them, in order. A drafted change that no longer fits (its
 * `was` no longer matches, or it fails today's checks) is left out and reported in `stale`; it is never half applied.
 */
function replay(published,records,{brands}){
 const steps=[],stale=[];let looks=published;
 for(const record of records){
  const checked=validateChange(asChange(record),{brands});
  if(!checked.ok){stale.push({id:record.id,note:record.note,sentences:checked.problems.map(p=>p.sentence)});continue;}
  const r=applyOps({looks},checked.change.ops,{made:record.made,note:record.note});
  if(r.conflicts.length){stale.push({id:record.id,note:record.note,sentences:r.conflicts.map(c=>c.sentence)});continue;}
  steps.push({record,ops:checked.change.ops,before:looks,after:r.data.looks,inverse:r.inverse,results:r.results});
  looks=r.data.looks;
 }
 return {looks,steps,stale};
}
const staleSentence=s=>`The drafted change ${s.id} ("${s.note}") no longer fits today's data: ${s.sentences.join(' ')} Take it out with discard_draft, then make it again if it is still wanted.`;

/**
 * Studio's data as the tools see it: {published, looks (the published looks with the draft laid over them), draft
 * (the drafted changes), stale (drafted changes that no longer fit), fingerprint:{published, looks}}.
 */
export async function readData(repo=openRepo()){
 const text=await repo.read(PATHS.looks),published=JSON.parse(text),draft=await readDraft(repo);
 const {looks,stale}=replay(published,draft.changes,{brands:await readBrands(repo)});
 return {published,looks,draft:draft.changes,stale,fingerprint:{published:sha256(text),looks:sha256(jsonText(looks))}};
}

/** An id no other change uses: the same id with -2, -3 … (kept within the change id's 40 letters). */
function freeId(id,used){
 const at=id.indexOf('Z-')+2,stem=id.slice(0,at),slug=id.slice(at);
 for(let n=2;;n++){const tail=`-${n}`,candidate=stem+slug.slice(0,40-tail.length)+tail;if(!used.has(candidate))return candidate;}
}

/**
 * Check a change and, unless dryRun, add it to the draft. Returns {ok, applied, dryRun, id, problems, warnings,
 * conflicts, results, writes, looks (the data as it is, or would be, afterwards)}. A conflict or a problem writes
 * nothing. An id is used once (World's log and the draft): with uniqueId (the tools, which make their own ids) a used
 * id gets -2, -3 …; a change file that reuses one is refused when it is applied (a dry run only warns).
 */
export function applyChange(change,{dryRun=true,repo=openRepo(),bytes,uniqueId=false}={}){
 return serial(()=>repo.locked(async()=>{
  const brands=await readBrands(repo),checked=validateChange(change,{bytes,brands});
  if(!checked.ok)return refuse(checked.problems,{warnings:checked.warnings,dryRun});
  const ready=checked.change,now=await readData(repo),warnings=[...checked.warnings];
  if(ready.base?.looks&&![now.fingerprint.looks,now.fingerprint.published].includes(ready.base.looks))
   warnings.push(problem('change.base.looks','base','The looks have changed since this change was made; each step was checked on its own against today\'s looks.'));
  if(now.stale.length)warnings.push(...now.stale.map(s=>problem(`draft.${s.id}`,'stale',staleSentence(s))));
  const {data,conflicts,results}=applyOps({looks:now.looks},ready.ops,{made:ready.made,note:ready.note});
  const diff=results.map(r=>({...r,...describe(ready.ops[r.op])}));
  if(conflicts.length)return {ok:false,applied:false,dryRun,problems:[],conflicts,warnings,results:diff};
  const changed=results.some(r=>r.status==='applied');
  const base={ok:true,dryRun,id:ready.id,problems:[],conflicts:[],warnings,results:diff,writes:changed?[PATHS.draft]:[],looks:data.looks,
   nothing:!changed?'Nothing to change: Studio already has all of this.':undefined};
  if(!changed)return {...base,applied:false};
  const log=await repo.readJSON(PATHS.log),used=new Map([...log.changes,...now.draft].map(c=>[c.id,c]));
  let id=ready.id;
  if(used.has(id)){
   if(uniqueId)id=freeId(id,used);
   else{
    const sentence=`Another change already used the id ${id} (${used.get(id).note}). Give this change an id of its own.`;
    if(!dryRun)return refuse([problem('change.id','id',sentence)],{dryRun,warnings});
    warnings.push(problem('change.id','id',`${sentence} Applied as it is, it would be refused.`));
   }
  }
  if(dryRun)return {...base,id,applied:false};
  const draft=await readDraft(repo);
  draft.changes.push({id,made:ready.made,by:ready.by,note:ready.note,applied:new Date().toISOString(),sha256:recordSha256(ready.ops),ops:ready.ops});
  await repo.write(PATHS.draft,jsonText(draft));
  return {...base,id,applied:true};
 }));
}

/** Who a draft changes, against the published data: residents' fields, and Studio characters added, changed or deleted. */
export function draftSummary(published,looks){
 const out=[],names=new Set([...Object.keys(published.looks||{}),...Object.keys(looks.looks||{})]);
 for(const name of [...names].sort()){
  const was=own(published.looks,name)?.set||{},now=own(looks.looks,name)?.set||{};
  const fields=[...new Set([...Object.keys(was),...Object.keys(now)])].filter(p=>!Object.is(was[p],now[p]))
   .map(path=>({path,from:Object.hasOwn(was,path)?was[path]:'as World draws them',to:Object.hasOwn(now,path)?now[path]:'as World draws them'}));
  if(fields.length)out.push({name,kind:'resident',fields});
 }
 const ids=new Set([...Object.keys(published.characters||{}),...Object.keys(looks.characters||{})]);
 for(const id of [...ids].sort()){
  const was=own(published.characters,id),now=own(looks.characters,id);
  if(!was)out.push({id,name:now.name,kind:'studio',what:'added'});
  else if(!now)out.push({id,name:was.name,kind:'studio',what:'deleted'});
  else if(recordSha256(was)!==recordSha256(now))out.push({id,name:now.name,kind:'studio',what:'changed'});
 }
 return out;
}

/**
 * Publish the draft into World's data, only when the creator says "update World": the drafted changes are laid over
 * the published looks in order, checked as a whole, and written in one step: src/avatars/looks-data.js,
 * src/studio/characters-data.js, data/studio/looks.json, data/studio/log.json (each change with the steps that undo
 * it) and an empty draft. A drafted change that no longer fits stops it, and nothing is written. Dry run by default.
 */
export function publishDraft({dryRun=true,repo=openRepo()}={}){
 return serial(()=>repo.locked(async()=>{
  const text=await repo.read(PATHS.looks),published=JSON.parse(text),draft=await readDraft(repo),log=await repo.readJSON(PATHS.log),brands=await readBrands(repo);
  // A change World's log already has was published by a publish that stopped before it emptied the draft.
  const done=new Set(log.changes.map(c=>c.id)),records=draft.changes.filter(c=>!done.has(c.id));
  const {looks,steps,stale}=replay(published,records,{brands});
  if(stale.length)return refuse(stale.map(s=>problem(`draft.${s.id}`,'stale',staleSentence(s))),{dryRun,stale:stale.map(s=>s.id)});
  const whole=validateLooks(looks,{brands});
  if(!whole.ok)return refuse(whole.problems,{dryRun});
  const looksText=jsonText(looks),at=new Date().toISOString();
  const entries=steps.filter(s=>s.results.some(r=>r.status==='applied')).map(s=>({id:s.record.id,made:s.record.made,by:s.record.by,note:s.record.note,
   applied:s.record.applied,published:at,sha256:s.record.sha256,before:{looks:sha256(jsonText(s.before))},after:{looks:sha256(jsonText(s.after))},
   ops:s.ops,inverse:s.inverse,results:s.results.map(({op,status})=>({op,status}))}));
  const files=[];
  for(const [path,content] of [[PATHS.looksModule,looksModule(looksText)],[PATHS.charactersModule,charactersModule(looksText)],[PATHS.looks,looksText]])
   if(await repo.read(path).catch(()=>null)!==content)files.push([path,content]);
  if(entries.length)files.push([PATHS.log,jsonText({...log,changes:[...log.changes,...entries]})]);
  if(draft.changes.length)files.push([PATHS.draft,jsonText(emptyDraft())]);
  const result={ok:true,dryRun,problems:[],changes:entries.map(e=>({id:e.id,made:e.made,by:e.by,note:e.note})),people:draftSummary(published,looks),
   writes:files.map(([path])=>path),nothing:!draft.changes.length?'The draft is empty: World already has everything the creator said yes to.':undefined};
  if(dryRun||!files.length)return {...result,applied:false};
  await repo.writeAll(files);
  return {...result,applied:true};
 }));
}

/** Take drafted changes out (by id, or all of them) before they are published. Dry run by default. */
export function discardDraft({ids=[],all=false,dryRun=true,repo=openRepo()}={}){
 return serial(()=>repo.locked(async()=>{
  if(!all&&!ids.length)return refuse([problem('ids','missing','Name the drafted changes to take out (ids, as publish_draft lists them), or all:true.')],{dryRun});
  const draft=await readDraft(repo),unknown=ids.filter(id=>!draft.changes.some(c=>c.id===id));
  if(unknown.length)return refuse(unknown.map(id=>problem('ids','unknown',`There is no drafted change ${id}; publish_draft (a dry run) lists the drafted changes.`)),{dryRun});
  const gone=draft.changes.filter(c=>all||ids.includes(c.id)),kept=draft.changes.filter(c=>!gone.includes(c));
  const {stale}=replay(await repo.readJSON(PATHS.looks),kept,{brands:await readBrands(repo)});
  const result={ok:true,dryRun,problems:[],discarded:gone.map(c=>({id:c.id,note:c.note})),kept:kept.length,writes:gone.length?[PATHS.draft]:[],
   warnings:stale.map(s=>staleSentence(s))};
  if(dryRun||!gone.length)return {...result,applied:false};
  await repo.write(PATHS.draft,jsonText({...draft,changes:kept}));
  return {...result,applied:true};
 }));
}

/** A step in a few words, for the plain-words results. */
function describe(op){
 const who=op.name||op.id;
 return {who,what:{'look.set':'look changed','look.reset':'look reset to how World draws them','character.create':'Studio character added',
  'character.set':'Studio character changed','character.delete':'Studio character deleted'}[op.op]||op.op};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const file=process.argv.slice(2).find(a=>!a.startsWith('--'));
 if(!file){console.error('Usage: node johansson-town/tools/studio/apply.mjs change.json [--write]');process.exit(2);}
 const size=(await stat(file).catch(()=>null))?.size;
 if(size===undefined){console.error(`There is no file ${file}.`);process.exit(2);}
 if(size>LIMITS.bytes){console.error(`${file} is ${(size/1048576).toFixed(1)} MB; a change may be at most 8 MB. Split it into smaller changes.`);process.exit(1);}
 const text=await readFile(file,'utf8');let change;
 try{change=JSON.parse(text);}catch{console.error(`${file} is not JSON.`);process.exit(1);}
 const r=await applyChange(change,{dryRun:!process.argv.includes('--write'),bytes:Buffer.byteLength(text)});
 const {looks:_,...shown}=r;
 console.log(JSON.stringify(shown,null,1));
 if(!r.ok)process.exitCode=1;
}

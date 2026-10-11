#!/usr/bin/env node
/**
 * Apply a Johansson Studio change file to Studio's data. It never commits and never pushes: "update World" is a
 * separate step the creator asks for (avatar-creator/docs/STUDIO-MCP.md).
 *   node johansson-town/tools/studio/apply.mjs change.json           a dry run: what would change, nothing written
 *   node johansson-town/tools/studio/apply.mjs change.json --write   apply it
 * In order it (1) validates the change, (2) checks every step's `was` against today's data, (3) checks and re-encodes
 * its pictures (stage 2: no stage-1 step uses one), (4) writes the data atomically, (5) regenerates World's modules,
 * (6) appends the change, with the steps that undo it, to data/studio/log.json.
 */
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {openRepo,PATHS,serial,jsonText} from './repo.mjs';
import {looksModule} from './build-data.mjs';
import {validateChange} from '../../src/studio/rules.js';
import {applyOps} from '../../src/studio/change.js';
import {OPS} from '../../src/studio/ops.js';
import {sha256,recordSha256} from '../../src/studio/sha256.js';

const refuse=(problems,extra={})=>({ok:false,applied:false,problems,...extra});

/** Today's Studio data with its fingerprints. */
export async function readData(repo=openRepo()){
 const text=await repo.read(PATHS.looks);
 return {looks:JSON.parse(text),fingerprint:{looks:sha256(text)}};
}

/**
 * Check a change and, unless dryRun, write it. Returns {ok, applied, dryRun, problems, warnings, conflicts, results,
 * diff, writes, id}. A conflict or a problem writes nothing.
 */
export function applyChange(change,{dryRun=true,repo=openRepo(),bytes}={}){
 return serial(async()=>{
  const checked=validateChange(change,{bytes});
  if(!checked.ok)return refuse(checked.problems,{warnings:checked.warnings,dryRun});
  const ready=checked.change,now=await readData(repo),warnings=[...checked.warnings];
  const log=await repo.readJSON(PATHS.log);
  const earlier=log.changes.find(c=>c.id===ready.id);
  if(earlier&&earlier.sha256!==recordSha256(ready.ops))return refuse([{where:'change.id',rule:'id',sentence:`Another change already used the id ${ready.id} (${earlier.note}). Give this change an id of its own.`}],{dryRun});
  if(ready.base?.looks&&ready.base.looks!==now.fingerprint.looks)
   warnings.push({where:'change.base.looks',rule:'base',sentence:'The looks have changed since this change was made; each step was checked on its own against today\'s looks.'});
  const targets=new Set(ready.ops.map(op=>OPS[op.op].target));
  const {data,inverse,conflicts,results}=applyOps({looks:now.looks},ready.ops,{made:ready.made,note:ready.note});
  const diff=results.map(r=>({...r,...describe(ready.ops[r.op])}));
  if(conflicts.length)return {ok:false,applied:false,dryRun,problems:[],conflicts,warnings,results:diff};
  const changed=results.some(r=>r.status==='applied');
  const writes=!changed?[]:[...targets.has('looks')?[PATHS.looks,PATHS.looksModule]:[],PATHS.log];
  const base={ok:true,dryRun,id:ready.id,problems:[],conflicts:[],warnings,results:diff,writes,
   nothing:!changed?'Nothing to change: World already has all of this.':undefined};
  if(dryRun||!changed)return {...base,applied:false};
  // (3) Pictures: no stage-1 step uses one, so rules.js refuses any picture in a change. When label pictures arrive
  // (stage 2) each is re-encoded by page.mjs reencodeWebp before it is written, so no EXIF or GPS ever reaches the repo.
  // Every target is checked before the first byte is written, so a refused one never leaves half a change behind.
  for(const path of writes)await repo.guard(path);
  const looksText=jsonText(data.looks);
  await repo.write(PATHS.looks,looksText);
  await repo.write(PATHS.looksModule,looksModule(looksText));
  log.changes.push({id:ready.id,made:ready.made,by:ready.by,note:ready.note,applied:new Date().toISOString(),sha256:recordSha256(ready.ops),
   before:now.fingerprint,after:{looks:sha256(looksText)},ops:ready.ops,inverse,results:results.map(({op,status})=>({op,status}))});
  await repo.write(PATHS.log,jsonText(log));
  return {...base,applied:true};
 });
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
 const text=await readFile(file,'utf8');let change;
 try{change=JSON.parse(text);}catch{console.error(`${file} is not JSON.`);process.exit(1);}
 const r=await applyChange(change,{dryRun:!process.argv.includes('--write'),bytes:Buffer.byteLength(text)});
 console.log(JSON.stringify(r,null,1));
 if(!r.ok)process.exitCode=1;
}

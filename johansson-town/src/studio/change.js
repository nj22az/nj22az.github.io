import {applyLook,readPath,LOOK_PATHS} from '../avatars/looks.js';
import {baseRecipe} from '../avatars/cast.js';
import {normalizeRecipe} from '../avatars/recipe.js';
import {recordSha256} from './sha256.js';

/**
 * Applying a change's steps to Studio's data, with no files, no DOM and no clock: the same function runs on the
 * iPad (to preview a draft), in the Node tools (to write it) and in the tests.
 *
 * applyOps({looks}, ops, {made, note}) returns {data, inverse, conflicts, results}:
 * - data: the new data (the input is never changed);
 * - inverse: steps that undo the applied ones, newest first (log.json keeps them; undo is stage 4);
 * - conflicts: [{op, where, path, expected, found, wanted, sentence}] — any conflict means nothing should be written;
 * - results: per step, 'applied', 'unchanged' (World already has it) or 'conflict', with the fields it changes.
 * Steps are expected to have passed rules.js validateOp; a step this file does not know is a conflict.
 */
const same=(a,b)=>Object.is(a,b)||(a!==null&&b!==null&&typeof a==='object'&&typeof b==='object'&&recordSha256(a)===recordSha256(b));
const shown=v=>v===undefined?'not set':typeof v==='string'?`"${v}"`:JSON.stringify(v);
const ordered=set=>Object.fromEntries(LOOK_PATHS.filter(p=>Object.hasOwn(set,p)).map(p=>[p,set[p]]));
const sorted=map=>Object.fromEntries(Object.keys(map).sort().map(k=>[k,map[k]]));

/** A resident's look as World draws it with a published look laid over it (and no device wardrobe). */
export function lookedRecipe(name,set){return set&&Object.keys(set).length?normalizeRecipe(applyLook(baseRecipe(name),set)):baseRecipe(name);}

/** The fields a step changes: each must find `was` (or already be the new value). */
function compare(current,set,was,{who,where}){
 const changes={},conflicts=[],diff=[];
 for(const [path,wanted] of Object.entries(set)){
  const found=readPath(current,path);
  if(same(found,wanted))continue;
  if(same(found,was[path])){changes[path]=wanted;diff.push({path,from:found,to:wanted});continue;}
  conflicts.push({where:`${where}.was.${path}`,path,expected:was[path],found,wanted,
   sentence:`${who}'s ${path} is now ${shown(found)}, not ${shown(was[path])} as this change expected; it was left as ${shown(found)}.`});
 }
 return {changes,conflicts,diff};
}

const handlers={
 'look.set'(data,op,{made,note,where}){
  const looks=data.looks.looks,entry=looks[op.name],current=lookedRecipe(op.name,entry?.set);
  const {changes,conflicts,diff}=compare(current,op.set,op.was,{who:op.name,where});
  if(conflicts.length)return {status:'conflict',conflicts};
  if(!diff.length)return {status:'unchanged',diff};
  // Fields that end up as World draws them anyway are left out, so a look holds only what Studio changed.
  const base=baseRecipe(op.name),merged={...(entry?.set||{}),...changes};
  for(const path of Object.keys(merged))if(same(merged[path],readPath(base,path)))delete merged[path];
  if(Object.keys(merged).length)looks[op.name]={set:ordered(merged),note:op.note||note||entry?.note||'',made};else delete looks[op.name];
  data.looks.looks=sorted(looks);
  const back=Object.fromEntries(diff.map(d=>[d.path,d.from]));
  return {status:'applied',diff,inverse:{op:'look.set',name:op.name,set:back,was:ordered(changes)}};
 },
 'look.reset'(data,op,{where}){
  const looks=data.looks.looks,entry=looks[op.name];
  if(!entry)return {status:'unchanged',diff:[]};
  const have=entry.set||{},conflicts=[];
  for(const path of LOOK_PATHS.filter(p=>Object.hasOwn(have,p)||Object.hasOwn(op.was,p)))if(!same(have[path],op.was[path]))
   conflicts.push({where:`${where}.was.${path}`,path,expected:op.was[path],found:have[path],wanted:undefined,
    sentence:`${op.name}'s published look has ${path} ${shown(have[path])}, not ${shown(op.was[path])} as this change expected; the look was kept.`});
  if(conflicts.length)return {status:'conflict',conflicts};
  const base=baseRecipe(op.name),diff=Object.keys(have).map(path=>({path,from:have[path],to:readPath(base,path)}));
  delete looks[op.name];
  return {status:'applied',diff,inverse:{op:'look.set',name:op.name,set:{...have},was:Object.fromEntries(diff.map(d=>[d.path,d.to]))}};
 },
 'character.create'(data,op,{made,where}){
  const characters=data.looks.characters,c=op.character,record={name:c.name,recipe:normalizeRecipe({...c.recipe,name:c.name}),card:{role:c.card.role,why:c.card.why},made};
  const existing=characters[op.id];
  if(existing){
   const {made:_,...had}=existing,{made:__,...wanted}=record;
   if(same(had,wanted))return {status:'unchanged',diff:[]};
   return {status:'conflict',conflicts:[{where:`${where}.id`,path:'id',expected:undefined,found:op.id,wanted:op.id,sentence:`A Studio character with the id "${op.id}" already exists (${existing.name}); choose another id.`}]};
  }
  characters[op.id]=record;data.looks.characters=sorted(characters);
  return {status:'applied',diff:[{path:'character',from:undefined,to:c.name}],inverse:{op:'character.delete',id:op.id,was:recordSha256(record)}};
 },
 'character.set'(data,op,{made,where}){
  const record=data.looks.characters[op.id];
  if(!record)return {status:'conflict',conflicts:[{where:`${where}.id`,path:'id',expected:op.id,found:undefined,wanted:op.id,sentence:`There is no Studio character with the id "${op.id}".`}]};
  const {changes,conflicts,diff}=compare(record.recipe,op.set,op.was,{who:record.name,where});
  if(conflicts.length)return {status:'conflict',conflicts};
  if(!diff.length)return {status:'unchanged',diff};
  data.looks.characters[op.id]={...record,recipe:normalizeRecipe(applyLook(record.recipe,changes)),made};
  return {status:'applied',diff,inverse:{op:'character.set',id:op.id,set:Object.fromEntries(diff.map(d=>[d.path,d.from])),was:ordered(changes)}};
 },
 'character.delete'(data,op,{where}){
  const record=data.looks.characters[op.id];
  if(!record)return {status:'unchanged',diff:[]};
  if(recordSha256(record)!==op.was)return {status:'conflict',conflicts:[{where:`${where}.was`,path:'record',expected:op.was,found:recordSha256(record),wanted:undefined,
   sentence:`${record.name} has changed since this change was made; nothing was deleted. Look at them again first.`}]};
  delete data.looks.characters[op.id];
  return {status:'applied',diff:[{path:'character',from:record.name,to:undefined}],inverse:{op:'character.create',id:op.id,character:{name:record.name,recipe:record.recipe,card:record.card}}};
 },
};

export function applyOps(data,ops,{made='',note=''}={}){
 const next=structuredClone(data),inverse=[],conflicts=[],results=[];
 next.looks??={format:'johansson-looks',version:1,looks:{},characters:{}};next.looks.looks??={};next.looks.characters??={};
 ops.forEach((op,i)=>{
  const where=`ops[${i}]`,handler=handlers[op?.op];
  const r=handler?handler(next,op,{made,note,where}):{status:'conflict',conflicts:[{where:`${where}.op`,path:'op',sentence:`"${op?.op}" is not a step this Studio can apply.`}]};
  results.push({op:i,step:op?.op,status:r.status,diff:r.diff||[]});
  if(r.conflicts)conflicts.push(...r.conflicts.map(c=>({op:i,...c})));
  if(r.inverse)inverse.unshift(r.inverse);
 });
 return {data:next,inverse,conflicts,results};
}

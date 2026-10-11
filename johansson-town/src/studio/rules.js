import {OPS,OP_NAMES,CHANGE_SCHEMA,ID_PATTERN} from './ops.js';
import {LOOK_PATHS,LOOK_FIELDS} from '../avatars/looks.js';
import {RESIDENT_NAMES} from '../avatars/cast.js';
import {normalizeRecipe,ageClass} from '../avatars/recipe.js';
import {PROFILES} from '../people/profiles.js';
import {sha256} from './sha256.js';

/**
 * Johansson Studio's checks, shared by the Studio page, the Node tools (MCP and command line) and the tests. Every
 * check answers {ok, problems:[{where, rule, sentence}], warnings}, and every sentence says in plain words what is
 * wrong and what to do. Nothing that arrives in a change is ever run as code: texts are cleaned, words come from fixed
 * lists, colours are #rrggbb, and pictures must really be pictures.
 */
export const LIMITS=Object.freeze({bytes:8*1024*1024,ops:50,files:12,image:2*1024*1024,purposeWords:4,
 text:Object.freeze({note:500,lookNote:300,name:24,role:60,why:300})});
const ID=new RegExp(ID_PATTERN);
const problem=(where,rule,sentence)=>({where,rule,sentence});
const quote=v=>typeof v==='string'?`"${v}"`:JSON.stringify(v);
export const result=(problems=[],warnings=[],extra={})=>({ok:!problems.length,problems,warnings,...extra});
const words=s=>String(s).trim().split(/\s+/).filter(Boolean).length;

/**
 * A text from outside, made safe: NFKC (so full-width letters and look-alikes become plain ones), trimmed, with no
 * control characters and no "<", and no longer than `max`. Returns {text, problems}.
 */
export function cleanText(value,{where,max,min=1,label='This text'}){
 if(typeof value!=='string')return {text:'',problems:[problem(where,'text',`${label} must be words, not ${value===undefined?'missing':typeof value}.`)]};
 const text=value.normalize('NFKC').trim(),problems=[];
 if(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(text))problems.push(problem(where,'text',`${label} has an invisible control character in it; type it again as plain words.`));
 if(text.includes('<'))problems.push(problem(where,'text',`${label} may not contain "<".`));
 if([...text].length>max)problems.push(problem(where,'text',`${label} is ${[...text].length} characters long; keep it to ${max}.`));
 if([...text].length<min)problems.push(problem(where,'text',`${label} is empty.`));
 return {text,problems};
}

/**
 * The JSON Schema subset ops.js uses, checked with plain-word sentences: type, const, enum, pattern, min/maxLength,
 * minimum/maximum, properties, required, additionalProperties, propertyNames, min/maxProperties, items, min/maxItems.
 */
export function checkSchema(value,schema,where='change'){
 const out=[],types=[].concat(schema.type||[]);
 const typeOf=v=>v===null?'null':Array.isArray(v)?'array':Number.isInteger(v)?'integer':typeof v;
 if(types.length&&!types.some(t=>t===typeOf(value)||(t==='number'&&typeof value==='number'&&Number.isFinite(value)))){
  out.push(problem(where,'type',`${where} should be ${types.join(' or ')}, not ${typeOf(value)}.`));return out;}
 if('const' in schema&&value!==schema.const)out.push(problem(where,'value',`${where} must be ${quote(schema.const)}, not ${quote(value)}.`));
 if(schema.enum&&!schema.enum.includes(value))out.push(problem(where,'value',`${where} must be one of ${schema.enum.map(quote).join(', ')}, not ${quote(value)}.`));
 if(typeof value==='string'){
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))out.push(problem(where,'pattern',`${where} is not written the way it must be (${quote(value.slice(0,60))}).`));
  if(schema.maxLength!==undefined&&value.length>schema.maxLength)out.push(problem(where,'length',`${where} is too long (${value.length} characters; at most ${schema.maxLength}).`));
  if(schema.minLength!==undefined&&value.length<schema.minLength)out.push(problem(where,'length',`${where} is empty.`));
 }
 if(typeof value==='number'){
  if(!Number.isFinite(value))out.push(problem(where,'number',`${where} must be a real number.`));
  if(schema.minimum!==undefined&&value<schema.minimum)out.push(problem(where,'range',`${where} must be at least ${schema.minimum}.`));
  if(schema.maximum!==undefined&&value>schema.maximum)out.push(problem(where,'range',`${where} must be at most ${schema.maximum}.`));
 }
 if(Array.isArray(value)){
  if(schema.maxItems!==undefined&&value.length>schema.maxItems)out.push(problem(where,'limit',`${where} has ${value.length} entries; at most ${schema.maxItems} are allowed.`));
  if(schema.minItems!==undefined&&value.length<schema.minItems)out.push(problem(where,'limit',`${where} needs at least ${schema.minItems} ${schema.minItems===1?'entry':'entries'}.`));
  if(schema.items)value.slice(0,(schema.maxItems??value.length)+1).forEach((v,i)=>out.push(...checkSchema(v,schema.items,`${where}[${i}]`)));
 }
 if(value&&typeof value==='object'&&!Array.isArray(value)){
  const keys=Object.keys(value),props=schema.properties||{};
  for(const key of schema.required||[])if(!Object.hasOwn(value,key))out.push(problem(where,'missing',`${where} is missing "${key}".`));
  if(schema.maxProperties!==undefined&&keys.length>schema.maxProperties)out.push(problem(where,'limit',`${where} has ${keys.length} entries; at most ${schema.maxProperties} are allowed.`));
  if(schema.minProperties!==undefined&&keys.length<schema.minProperties)out.push(problem(where,'missing',`${where} is empty.`));
  for(const key of keys){
   if(schema.propertyNames?.pattern&&!new RegExp(schema.propertyNames.pattern).test(key)){out.push(problem(`${where}.${key}`,'unknown-key',`${where} has a name Studio does not accept: ${quote(key.slice(0,60))}.`));continue;}
   if(Object.hasOwn(props,key))out.push(...checkSchema(value[key],props[key],`${where}.${key}`));
   else if(schema.additionalProperties===false)out.push(problem(`${where}.${key}`,'unknown-key',`${where} has a field Studio does not know: ${quote(key.slice(0,60))}.`));
   else if(schema.additionalProperties&&typeof schema.additionalProperties==='object')out.push(...checkSchema(value[key],schema.additionalProperties,`${where}.${key}`));
  }
 }
 return out;
}

/**
 * One look field's value, checked: words from the maker's own lists, colours as #rrggbb (any case, stored lower
 * case), yes/no as true or false, numbers clamped to 0..1 (the clamp is reported, not refused).
 * Returns {value, clamped?, problem?}.
 */
export function lookValue(path,value,where=path){
 const field=LOOK_FIELDS[path];
 if(!field)return {problem:problem(where,'unknown-field',`"${path}" is not a part of a look Studio can change. The parts are listed by character_get with options:true.`)};
 if(field.kind==='word'){
  if(typeof value==='string'&&field.words.includes(value))return {value};
  return {problem:problem(where,'unknown-word',`${quote(value)} is not a choice for ${path}; choose one of: ${field.words.join(', ')}.`)};
 }
 if(field.kind==='colour'){
  if(typeof value==='string'&&/^#[0-9a-fA-F]{6}$/.test(value))return {value:value.toLowerCase()};
  return {problem:problem(where,'colour',`${path} must be a colour written #rrggbb, not ${quote(value)}.`)};
 }
 if(field.kind==='yes/no'){
  if(typeof value==='boolean')return {value};
  return {problem:problem(where,'yes/no',`${path} is yes or no (true or false), not ${quote(value)}.`)};
 }
 if(typeof value!=='number'||!Number.isFinite(value))return {problem:problem(where,'number',`${path} is a number from 0 to 1, not ${quote(value)}.`)};
 const used=Math.min(field.max,Math.max(field.min,value));
 return used===value?{value}:{value:used,clamped:{path,given:value,used}};
}

/** A look's `set` (or `was`), checked field by field and put in LOOK_PATHS order. Returns {set, clamped, problems}. */
export function validateLookSet(set,{where='set',allowEmpty=false}={}){
 const problems=[],clamped=[],out={};
 if(!set||typeof set!=='object'||Array.isArray(set))return {set:{},clamped,problems:[problem(where,'type',`${where} must list fields and their values.`)]};
 const keys=Object.keys(set);
 if(!keys.length&&!allowEmpty)problems.push(problem(where,'missing',`${where} changes nothing; name at least one field.`));
 for(const key of keys){const r=lookValue(key,set[key],`${where}.${key}`);if(r.problem)problems.push(r.problem);else{out[key]=r.value;if(r.clamped)clamped.push(r.clamped);}}
 return {set:Object.fromEntries(LOOK_PATHS.filter(p=>Object.hasOwn(out,p)).map(p=>[p,out[p]])),clamped,problems};
}

const AGE_OF=new Map(PROFILES.map(p=>[p.name,p.age]));
/** A resident with an age in World keeps the life stage that age gives them: a look changes clothes, not years. */
function ageProblems(name,set,where){
 if(!Object.hasOwn(set,'age')||!AGE_OF.has(name))return [];
 const stage=ageClass(AGE_OF.get(name));
 return set.age===stage?[]:[problem(`${where}.age`,'age',`${name} is ${AGE_OF.get(name)} in World, so is drawn as ${stage==='adult'||stage==='elder'?'an':'a'} ${stage}; a look cannot make them ${set.age==='adult'||set.age==='elder'?'an':'a'} ${set.age}.`)];
}

const sameKeys=(a,b)=>{const x=Object.keys(a).sort(),y=Object.keys(b).sort();return x.length===y.length&&x.every((k,i)=>k===y[i]);};

/** Real brand names in a product, brand or label field. `rules` is data/studio/brand-rules.json. */
export function brandProblems(text,where,rules){
 if(!rules||typeof text!=='string')return [];
 const plain=text.normalize('NFKC').toLowerCase(),found=[];
 for(const brand of rules.brands||[]){
  const escaped=brand.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,'u').test(plain))found.push(brand);
 }
 for(const kana of rules.kana||[])if(plain.includes(kana.normalize('NFKC').toLowerCase()))found.push(kana);
 return found.map(b=>problem(where,'brand',`"${b}" is a real brand. Everything sold or labelled in Johansson World has a made-up name; choose one of the town's own.`));
}

/** The kind of picture some bytes are, from their first bytes: png, jpeg, webp, or null. */
export function pictureKind(bytes){
 const b=bytes,at=(i,...v)=>v.every((x,j)=>b[i+j]===x);
 if(b.length>=8&&at(0,0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a))return 'png';
 if(b.length>=3&&at(0,0xff,0xd8,0xff))return 'jpeg';
 if(b.length>=12&&at(0,0x52,0x49,0x46,0x46)&&at(8,0x57,0x45,0x42,0x50))return 'webp';
 return null;
}
export function decodeBase64(data){const bin=atob(data);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}

/** A picture in a change file: really a PNG, JPEG or WebP, at most 2 MB, and the bytes its sha256 says. */
export function pictureProblems(name,file,where=`files.${name}`){
 let bytes;
 try{bytes=decodeBase64(file.data);}catch{return [problem(where,'picture',`${name} is not readable base64.`)];}
 const out=[];
 if(bytes.length>LIMITS.image)out.push(problem(where,'picture',`${name} is ${(bytes.length/1048576).toFixed(1)} MB; a picture may be at most 2 MB.`));
 const kind=pictureKind(bytes);
 if(!kind)out.push(problem(where,'picture',`${name} is not a PNG, JPEG or WebP picture.`));
 else if(!new RegExp(`\\.(${kind==='jpeg'?'jpe?g':kind})$`).test(name))out.push(problem(where,'picture',`${name} is really a ${kind.toUpperCase()} picture; its name must end in .${kind==='jpeg'?'jpg':kind}.`));
 if(sha256(bytes)!==file.sha256)out.push(problem(where,'picture',`${name} does not match its checksum: it changed on the way. Save the change file again.`));
 return out;
}

/** The pictures a step uses. No step of stage 1 uses one; labels arrive with products in stage 2. */
export const picturesUsed=()=>new Set();

/**
 * A change file, checked before anything is read or written. `bytes` is the size of the file as received.
 * Returns {ok, problems, warnings, change}: `change` has its texts cleaned and its values normalised.
 */
export function validateChange(change,{bytes}={}){
 const problems=[],warnings=[];
 if(!change||typeof change!=='object'||Array.isArray(change))return result([problem('change','type','This is not a Johansson Studio change file.')]);
 const size=bytes??new TextEncoder().encode(JSON.stringify(change)).length;
 if(size>LIMITS.bytes)problems.push(problem('change','limit',`This change file is ${(size/1048576).toFixed(1)} MB; a change may be at most 8 MB. Split it into smaller changes.`));
 problems.push(...checkSchema(change,CHANGE_SCHEMA,'change'));
 const out={...change};
 if(typeof change.note==='string'){
  const note=cleanText(change.note,{where:'change.note',max:LIMITS.text.note,label:'The note'});problems.push(...note.problems);out.note=note.text;
  if(!note.problems.length&&words(note.text)<LIMITS.purposeWords)problems.push(problem('change.note','purpose',`Say why in at least ${LIMITS.purposeWords} words; the note is how World remembers the reason for a change.`));
 }
 const ops=Array.isArray(change.ops)?change.ops.slice(0,LIMITS.ops+1):[];
 out.ops=ops.map((op,i)=>{const r=validateOp(op,i);problems.push(...r.problems);warnings.push(...r.warnings);return r.op;});
 const used=picturesUsed(out.ops);
 for(const [name,file] of Object.entries(change.files&&typeof change.files==='object'?change.files:{})){
  if(!file||typeof file!=='object'||typeof file.data!=='string')continue;
  problems.push(...pictureProblems(name,file));
  if(!used.has(name))problems.push(problem(`files.${name}`,'unused',`No step in this change uses the picture ${name}; take it out of the file.`));
 }
 return result(problems,warnings,{change:out});
}

/** One step, checked against its schema and then for sense. Returns {op, problems, warnings}. */
export function validateOp(op,i){
 const where=`ops[${i}]`,problems=[],warnings=[];
 if(!op||typeof op!=='object'||Array.isArray(op))return {op,problems:[problem(where,'type',`${where} is not a step.`)],warnings};
 const spec=OPS[op.op];
 if(!spec)return {op,problems:[problem(`${where}.op`,'unknown-op',`${quote(String(op.op).slice(0,40))} is not a Studio step. The steps are: ${OP_NAMES.join(', ')}.`)],warnings};
 problems.push(...checkSchema(op,spec.schema,where));
 if(!spec.ready)problems.push(problem(`${where}.op`,'not-yet',`"${op.op}" is not switched on yet: products move into Studio's data in stage 2.`));
 if(problems.length)return {op,problems,warnings};
 const out={...op};
 if(op.op.startsWith('look.')){
  if(!RESIDENT_NAMES.includes(op.name))problems.push(problem(`${where}.name`,'unknown-name',`${quote(op.name)} is not a resident World knows. character_list lists them; Studio-only characters change with character.set.`));
 }
 if(op.op==='look.set'||op.op==='character.set'){
  const set=validateLookSet(op.set,{where:`${where}.set`}),was=validateLookSet(op.was,{where:`${where}.was`});
  problems.push(...set.problems,...was.problems);
  if(set.clamped.length)warnings.push(...set.clamped.map(c=>problem(`${where}.set.${c.path}`,'clamped',`${c.path} was ${c.given}; it runs from 0 to 1, so ${c.used} is used.`)));
  if(!set.problems.length&&!was.problems.length&&!sameKeys(set.set,was.set))problems.push(problem(`${where}.was`,'was',`${where}.was must give today's value of every field the step changes, and only those.`));
  if(op.op==='look.set')problems.push(...ageProblems(op.name,set.set,`${where}.set`));
  out.set=set.set;out.was=was.set;
 }
 if(op.op==='look.reset'){const was=validateLookSet(op.was,{where:`${where}.was`,allowEmpty:true});problems.push(...was.problems);out.was=was.set;}
 if(op.note!==undefined){const note=cleanText(op.note,{where:`${where}.note`,max:LIMITS.text.lookNote,min:0,label:'The note'});problems.push(...note.problems);out.note=note.text;}
 if(op.op.startsWith('character.')&&!ID.test(op.id))problems.push(problem(`${where}.id`,'id',`A character's id is 2 to 40 small letters, digits and hyphens, starting with a letter.`));
 if(op.op==='character.create'){
  const c=op.character,name=cleanText(c.name,{where:`${where}.character.name`,max:LIMITS.text.name,label:'The name'});
  const role=cleanText(c.card.role,{where:`${where}.character.card.role`,max:LIMITS.text.role,label:'The role'});
  const why=cleanText(c.card.why,{where:`${where}.character.card.why`,max:LIMITS.text.why,label:'Why they exist'});
  problems.push(...name.problems,...role.problems,...why.problems);
  if(RESIDENT_NAMES.includes(name.text))problems.push(problem(`${where}.character.name`,'name',`${name.text} already lives in World; give a Studio character a name of their own, or change the resident's look instead.`));
  if(!why.problems.length&&words(why.text)<LIMITS.purposeWords)problems.push(problem(`${where}.character.card.why`,'purpose',`Say who they are for and why they exist in at least ${LIMITS.purposeWords} words; nobody in Johansson World is random.`));
  out.character={name:name.text,recipe:normalizeRecipe({...c.recipe,name:name.text}),card:{role:role.text,why:why.text}};
 }
 return {op:out,problems,warnings};
}

/** A whole looks file, checked (CI, build-data, publish_check). */
export function validateLooks(file){
 const problems=[],where='looks.json';
 if(!file||file.format!=='johansson-looks'||file.version!==1)return result([problem(where,'format','looks.json is not a Johansson looks file (format "johansson-looks", version 1).')]);
 for(const key of Object.keys(file))if(!['format','version','looks','characters'].includes(key))problems.push(problem(`${where}.${key}`,'unknown-key',`looks.json has a field Studio does not know: "${key}".`));
 for(const [name,look] of Object.entries(file.looks||{})){
  const at=`looks.${name}`;
  if(!RESIDENT_NAMES.includes(name))problems.push(problem(at,'unknown-name',`${quote(name)} is not a resident World knows.`));
  const set=validateLookSet(look?.set,{where:`${at}.set`});problems.push(...set.problems,...ageProblems(name,set.set,`${at}.set`));
  if(set.clamped.length)problems.push(problem(`${at}.set`,'range',`${at} has numbers outside 0 to 1.`));
  for(const key of Object.keys(look||{}))if(!['set','note','made'].includes(key))problems.push(problem(`${at}.${key}`,'unknown-key',`${at} has a field Studio does not know: "${key}".`));
 }
 for(const [id,character] of Object.entries(file.characters||{})){
  const at=`characters.${id}`;
  if(!ID.test(id))problems.push(problem(at,'id',`${quote(id)} is not a character id (2 to 40 small letters, digits and hyphens).`));
  for(const key of Object.keys(character||{}))if(!['name','recipe','card','made'].includes(key))problems.push(problem(`${at}.${key}`,'unknown-key',`${at} has a field Studio does not know: "${key}".`));
  const r=validateOp({op:'character.create',id,character:{name:character?.name,recipe:character?.recipe,card:character?.card}},0);
  problems.push(...r.problems.map(p=>({...p,where:p.where.replace('ops[0].character',at)})));
 }
 return result(problems);
}

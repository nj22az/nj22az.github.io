import {OPS,OP_NAMES,CHANGE_SCHEMA,ID_PATTERN} from './ops.js';
import {LOOK_PATHS,LOOK_FIELDS} from '../avatars/looks.js';
import {RESIDENT_NAMES,baseRecipe} from '../avatars/cast.js';
import {normalizeRecipe} from '../avatars/recipe.js';
import {PROFILES} from '../people/profiles.js';
import {RENAMED_RESIDENTS} from '../people/renamed.js';
import {sha256} from './sha256.js';

/**
 * Johansson Studio's checks, shared by the Studio page, the Node tools (MCP and command line) and the tests. Every
 * check answers {ok, problems:[{where, rule, sentence}], warnings}, and every sentence says in plain words what is
 * wrong and what to do. Nothing that arrives in a change is ever run as code: texts are cleaned, words come from fixed
 * lists, colours are #rrggbb, and pictures must really be pictures.
 */
export const LIMITS=Object.freeze({bytes:8*1024*1024,ops:50,files:12,image:2*1024*1024,purposeWords:4,side:8192,pixels:40e6,
 text:Object.freeze({note:500,lookNote:300,name:24,role:60,why:300})});
const ID=new RegExp(ID_PATTERN);
const problem=(where,rule,sentence)=>({where,rule,sentence});
const quote=v=>typeof v==='string'?`"${v}"`:JSON.stringify(v);
export const result=(problems=[],warnings=[],extra={})=>({ok:!problems.length,problems,warnings,...extra});
const words=s=>String(s).trim().split(/\s+/).filter(Boolean).length;
const MADE=new RegExp(CHANGE_SCHEMA.properties.made.pattern);
const a=stage=>stage==='adult'||stage==='elder'?'an':'a';

/** A name as people type it: no accents, any case, single spaces ("koji" finds Kōji, "mr fujita" Mr Fujita). */
export const foldName=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
/** Names World draws that are not residents, so they have no look of their own to change. */
export const NOT_RESIDENTS=new Map([['Harbour visitor','Harbour visitor is a starting template in the maker (creator.js), not a resident of World, so there is no look of theirs to change.']]);
/** Names Studio keeps for itself: a character id may not be one of the names every JavaScript object already has. */
const RESERVED=new Set([...Object.getOwnPropertyNames(Object.prototype),'__proto__']);
const renamedTo=name=>Object.hasOwn(RENAMED_RESIDENTS,name)?` ${name} is now called ${RENAMED_RESIDENTS[name]} in World; move the look to ${RENAMED_RESIDENTS[name]}.`:'';

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
 const field=Object.hasOwn(LOOK_FIELDS,path)?LOOK_FIELDS[path]:null;
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
/**
 * A look changes clothes, not years: every resident keeps the life stage World draws them at (from their age, where
 * their profile has one, else from cast.js), because their walk and their voice stay those of that stage.
 */
function ageProblems(name,set,where){
 if(!Object.hasOwn(set,'age')||!RESIDENT_NAMES.includes(name))return [];
 const stage=baseRecipe(name).age;
 if(set.age===stage)return [];
 const drawn=AGE_OF.has(name)?`${name} is ${AGE_OF.get(name)} in World, so is drawn as ${a(stage)} ${stage}`:`${name} is drawn as ${a(stage)} ${stage} in World`;
 return [problem(`${where}.age`,'age',`${drawn}; a look cannot make them ${a(set.age)} ${set.age}.`)];
}

/** A resident's name for a look: one World knows, and not a template. */
function residentProblems(name,where){
 if(NOT_RESIDENTS.has(name))return [problem(where,'name',NOT_RESIDENTS.get(name))];
 if(!RESIDENT_NAMES.includes(name))return [problem(where,'unknown-name',`${quote(name)} is not a resident World knows.${renamedTo(name)} character_list lists them; Studio-only characters change with character.set.`)];
 return [];
}

/** A Studio character's name: their own, not a resident's, not a name World used to have, and no real brand. */
function characterNameProblems(name,where,brands){
 const f=foldName(name),out=[];
 const resident=RESIDENT_NAMES.find(n=>foldName(n)===f),template=[...NOT_RESIDENTS.keys()].find(n=>foldName(n)===f);
 if(resident)out.push(problem(where,'name',`${resident} already lives in World; give a Studio character a name of their own, or change the resident's look instead.`));
 if(template)out.push(problem(where,'name',`${template} is a name World already uses (a template in the maker); give a Studio character a name of their own.`));
 const former=Object.keys(RENAMED_RESIDENTS).find(n=>foldName(n)===f);
 if(former)out.push(problem(where,'name',`${former} is the name World used to give ${RENAMED_RESIDENTS[former]}, and old saves and stories still read it as ${RENAMED_RESIDENTS[former]}; choose another name.`));
 return [...out,...brandProblems(name,where,brands)];
}

const sameKeys=(a,b)=>{const x=Object.keys(a).sort(),y=Object.keys(b).sort();return x.length===y.length&&x.every((k,i)=>k===y[i]);};

/** Real brand names in a label: a product, brand or label field, or a character's name or role. `rules` is data/studio/brand-rules.json. */
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

/**
 * The size a picture says it has, read from its header before anything decodes it: {width, height}, or null when the
 * header cannot be read. PNG (IHDR), JPEG (the first SOF segment) and WebP (VP8, VP8L, VP8X).
 */
export function pictureSize(bytes){
 const b=bytes,u16=i=>b[i]<<8|b[i+1],u16le=i=>b[i]|b[i+1]<<8,u24le=i=>b[i]|b[i+1]<<8|b[i+2]<<16,u32=i=>(b[i]<<24>>>0)+(b[i+1]<<16|b[i+2]<<8|b[i+3]);
 const at=(i,text)=>[...text].every((c,j)=>b[i+j]===c.charCodeAt(0));
 const kind=pictureKind(b);
 if(kind==='png')return b.length>=24&&at(12,'IHDR')?{width:u32(16),height:u32(20)}:null;
 if(kind==='jpeg'){
  for(let i=2;i+9<b.length;){
   if(b[i]!==0xff){i++;continue;}
   const marker=b[i+1];
   if(marker===0xff){i++;continue;}
   if(marker===0xd8||marker===0x01||(marker>=0xd0&&marker<=0xd7)){i+=2;continue;}
   if(marker===0xda||marker===0xd9)return null;
   if(marker>=0xc0&&marker<=0xcf&&![0xc4,0xc8,0xcc].includes(marker))return {width:u16(i+7),height:u16(i+5)};
   i+=2+u16(i+2);
  }
  return null;
 }
 if(kind==='webp'){
  if(at(12,'VP8 ')&&b.length>=30)return {width:u16le(26)&0x3fff,height:u16le(28)&0x3fff};
  if(at(12,'VP8L')&&b.length>=25){const bits=u16le(21)|u16le(23)<<16;return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};}
  if(at(12,'VP8X')&&b.length>=30)return {width:u24le(24)+1,height:u24le(27)+1};
 }
 return null;
}

/** A picture in a change file: really a PNG, JPEG or WebP, at most 2 MB and 8192 pixels a side, and the bytes its sha256 says. */
export function pictureProblems(name,file,where=`files.${name}`){
 let bytes;
 try{bytes=decodeBase64(file.data);}catch{return [problem(where,'picture',`${name} is not readable base64.`)];}
 const out=[];
 if(bytes.length>LIMITS.image)out.push(problem(where,'picture',`${name} is ${(bytes.length/1048576).toFixed(1)} MB; a picture may be at most 2 MB.`));
 const kind=pictureKind(bytes);
 if(!kind)out.push(problem(where,'picture',`${name} is not a PNG, JPEG or WebP picture.`));
 else if(!new RegExp(`\\.(${kind==='jpeg'?'jpe?g':kind})$`).test(name))out.push(problem(where,'picture',`${name} is really a ${kind.toUpperCase()} picture; its name must end in .${kind==='jpeg'?'jpg':kind}.`));
 if(kind)out.push(...sizeProblems(name,pictureSize(bytes),where));
 if(sha256(bytes)!==file.sha256)out.push(problem(where,'picture',`${name} does not match its checksum: it changed on the way. Save the change file again.`));
 return out;
}

/** A picture's size, checked before it is decoded: a small file may still claim to be enormous. */
export function sizeProblems(name,size,where=name){
 if(!size||!size.width||!size.height)return [problem(where,'picture',`${name} does not say how big it is; save it again as an ordinary PNG, JPEG or WebP.`)];
 if(Math.max(size.width,size.height)>LIMITS.side||size.width*size.height>LIMITS.pixels)
  return [problem(where,'picture',`${name} is ${size.width} × ${size.height} pixels; a picture may be at most ${LIMITS.side} pixels a side and ${LIMITS.pixels/1e6} million pixels in all.`)];
 return [];
}

/** The pictures a step uses. No step of stage 1 uses one; labels arrive with products in stage 2. */
export const picturesUsed=()=>new Set();

/**
 * A change file, checked before anything is read or written. `bytes` is the size of the file as received.
 * Returns {ok, problems, warnings, change}: `change` has its texts cleaned and its values normalised.
 */
export function validateChange(change,{bytes,brands}={}){
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
 out.ops=ops.map((op,i)=>{const r=validateOp(op,i,{brands});problems.push(...r.problems);warnings.push(...r.warnings);return r.op;});
 const used=picturesUsed(out.ops);
 for(const [name,file] of Object.entries(change.files&&typeof change.files==='object'?change.files:{})){
  if(!file||typeof file!=='object'||typeof file.data!=='string')continue;
  problems.push(...pictureProblems(name,file));
  if(!used.has(name))problems.push(problem(`files.${name}`,'unused',`No step in this change uses the picture ${name}; take it out of the file.`));
 }
 return result(problems,warnings,{change:out});
}

/** One step, checked against its schema and then for sense. `brands` is data/studio/brand-rules.json. Returns {op, problems, warnings}. */
export function validateOp(op,i,{brands}={}){
 const where=`ops[${i}]`,problems=[],warnings=[];
 if(!op||typeof op!=='object'||Array.isArray(op))return {op,problems:[problem(where,'type',`${where} is not a step.`)],warnings};
 const spec=typeof op.op==='string'&&Object.hasOwn(OPS,op.op)?OPS[op.op]:null;
 if(!spec)return {op,problems:[problem(`${where}.op`,'unknown-op',`${quote(String(op.op).slice(0,40))} is not a Studio step. The steps are: ${OP_NAMES.join(', ')}.`)],warnings};
 problems.push(...checkSchema(op,spec.schema,where));
 if(!spec.ready)problems.push(problem(`${where}.op`,'not-yet',`"${op.op}" is not switched on yet: products move into Studio's data in stage 2.`));
 if(problems.length)return {op,problems,warnings};
 const out={...op};
 if(op.op.startsWith('look.'))problems.push(...residentProblems(op.name,`${where}.name`));
 if(op.op==='look.set'||op.op==='character.set'){
  const set=validateLookSet(op.set,{where:`${where}.set`}),was=validateLookSet(op.was,{where:`${where}.was`});
  problems.push(...set.problems,...was.problems);
  if(set.clamped.length)warnings.push(...set.clamped.map(c=>problem(`${where}.set.${c.path}`,'clamped',`${c.path} was ${c.given}; it runs from 0 to 1, so ${c.used} is used.`)));
  if(!set.problems.length&&!was.problems.length&&!sameKeys(set.set,was.set))problems.push(problem(`${where}.was`,'was',`${where}.was must give today's value of every field the step changes, and only those.`));
  if(op.op==='look.set')problems.push(...ageProblems(op.name,set.set,`${where}.set`));
  out.set=set.set;out.was=was.set;
 }
 if(op.op==='look.reset'){const was=validateLookSet(op.was,{where:`${where}.was`,allowEmpty:true});problems.push(...was.problems);out.was=was.set;}
 if(op.note!==undefined){
  const note=cleanText(op.note,{where:`${where}.note`,max:LIMITS.text.lookNote,min:0,label:'The note'});problems.push(...note.problems);out.note=note.text;
  if(!note.problems.length&&note.text&&words(note.text)<LIMITS.purposeWords)problems.push(problem(`${where}.note`,'purpose',`Say why in at least ${LIMITS.purposeWords} words (or leave the step's note out, and the change's note is used).`));
 }
 if(op.op.startsWith('character.')){
  if(!ID.test(op.id))problems.push(problem(`${where}.id`,'id',`A character's id is 2 to 40 small letters, digits and hyphens, starting with a letter.`));
  else if(RESERVED.has(op.id))problems.push(problem(`${where}.id`,'id',`"${op.id}" is a word Studio keeps for itself; give the character another id.`));
 }
 if(op.op==='character.create'){
  const c=op.character,name=cleanText(c.name,{where:`${where}.character.name`,max:LIMITS.text.name,label:'The name'});
  const role=cleanText(c.card.role,{where:`${where}.character.card.role`,max:LIMITS.text.role,label:'The role'});
  const why=cleanText(c.card.why,{where:`${where}.character.card.why`,max:LIMITS.text.why,label:'Why they exist'});
  problems.push(...name.problems,...role.problems,...why.problems);
  if(!name.problems.length)problems.push(...characterNameProblems(name.text,`${where}.character.name`,brands));
  if(!role.problems.length)problems.push(...brandProblems(role.text,`${where}.character.card.role`,brands));
  if(!why.problems.length&&words(why.text)<LIMITS.purposeWords)problems.push(problem(`${where}.character.card.why`,'purpose',`Say who they are for and why they exist in at least ${LIMITS.purposeWords} words; nobody in Johansson World is random.`));
  out.character={name:name.text,recipe:normalizeRecipe({...c.recipe,name:name.text}),card:{role:role.text,why:why.text}};
 }
 return {op:out,problems,warnings};
}

/**
 * A whole looks file, checked (CI, publish_check, and the draft before it is published). Each published look keeps,
 * for every field it changes, the reason it was changed (`notes`) and when it last changed (`made`).
 */
export function validateLooks(file,{brands}={}){
 const problems=[],where='looks.json';
 if(!file||file.format!=='johansson-looks'||file.version!==1)return result([problem(where,'format','looks.json is not a Johansson looks file (format "johansson-looks", version 1).')]);
 for(const key of Object.keys(file))if(!['format','version','looks','characters'].includes(key))problems.push(problem(`${where}.${key}`,'unknown-key',`looks.json has a field Studio does not know: "${key}".`));
 for(const [name,look] of Object.entries(file.looks||{})){
  const at=`looks.${name}`;
  problems.push(...residentProblems(name,at));
  const set=validateLookSet(look?.set,{where:`${at}.set`});problems.push(...set.problems,...ageProblems(name,set.set,`${at}.set`));
  if(set.clamped.length)problems.push(problem(`${at}.set`,'range',`${at} has numbers outside 0 to 1.`));
  for(const key of Object.keys(look||{}))if(!['set','notes','made'].includes(key))problems.push(problem(`${at}.${key}`,'unknown-key',`${at} has a field Studio does not know: "${key}".`));
  const notes=look?.notes;
  if(!notes||typeof notes!=='object'||Array.isArray(notes))problems.push(problem(`${at}.notes`,'notes',`${at} must keep, for each field it changes, why it was changed (notes).`));
  else{
   for(const path of Object.keys(look?.set||{}))if(!Object.hasOwn(notes,path))problems.push(problem(`${at}.notes`,'notes',`${at} does not say why ${path} was changed.`));
   for(const [path,text] of Object.entries(notes)){
    if(!Object.hasOwn(look?.set||{},path)){problems.push(problem(`${at}.notes.${path}`,'notes',`${at} has a note for ${path}, which the look does not change.`));continue;}
    const note=cleanText(text,{where:`${at}.notes.${path}`,max:LIMITS.text.lookNote,label:`The note for ${path}`});problems.push(...note.problems);
    if(!note.problems.length&&words(note.text)<LIMITS.purposeWords)problems.push(problem(`${at}.notes.${path}`,'purpose',`The note for ${name}'s ${path} must say why in at least ${LIMITS.purposeWords} words.`));
   }
  }
  if(typeof look?.made!=='string'||!MADE.test(look.made))problems.push(problem(`${at}.made`,'made',`${at}.made must be the time the look last changed, written like 2026-10-11T09:14:00Z.`));
 }
 for(const [id,character] of Object.entries(file.characters||{})){
  const at=`characters.${id}`;
  if(!ID.test(id)||RESERVED.has(id))problems.push(problem(at,'id',`${quote(id)} is not a character id (2 to 40 small letters, digits and hyphens).`));
  for(const key of Object.keys(character||{}))if(!['name','recipe','card','made'].includes(key))problems.push(problem(`${at}.${key}`,'unknown-key',`${at} has a field Studio does not know: "${key}".`));
  if(typeof character?.made!=='string'||!MADE.test(character.made))problems.push(problem(`${at}.made`,'made',`${at}.made must be the time the character last changed, written like 2026-10-11T09:14:00Z.`));
  const r=validateOp({op:'character.create',id:ID.test(id)&&!RESERVED.has(id)?id:'x-invalid',character:{name:character?.name,recipe:character?.recipe,card:character?.card}},0,{brands});
  problems.push(...r.problems.map(p=>({...p,where:p.where.replace('ops[0].character',at)})));
 }
 const names=new Map();
 for(const [id,character] of Object.entries(file.characters||{})){const f=foldName(character?.name??'');
  if(names.has(f))problems.push(problem(`characters.${id}.name`,'name',`Two Studio characters are called ${character.name} (${names.get(f)} and ${id}); each needs a name of their own.`));else names.set(f,id);}
 return result(problems);
}

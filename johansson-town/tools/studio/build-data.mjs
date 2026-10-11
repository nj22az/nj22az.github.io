#!/usr/bin/env node
/**
 * Makes World's modules from Studio's published data, so World reads the data synchronously like any other module:
 *   data/studio/looks.json → src/avatars/looks-data.js        each resident's published look: only its fields (cast.js)
 *                          → src/studio/characters-data.js    the Studio-only characters (Johansson Studio's pickers)
 * (products.json → src/commerce/products-data.js arrives in stage 2.)
 * The notes and dates stay in looks.json, and the characters have a module of their own that World's avatar code does
 * not import, so a new Studio character or a note never makes the resident guide's portraits (which hash
 * looks-data.js) out of date.
 *   node johansson-town/tools/studio/build-data.mjs           write the modules
 *   node johansson-town/tools/studio/build-data.mjs --check   only say whether they are up to date (CI, publish_check)
 * publishDraft (apply.mjs) writes them too, in the same step as looks.json.
 */
import {fileURLToPath} from 'node:url';
import {openRepo,PATHS,serial} from './repo.mjs';
import {recordSha256} from '../../src/studio/sha256.js';

const value=v=>JSON.stringify(v,null,1);
const FREEZE='const freeze=value=>{if(value&&typeof value===\'object\'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;};';

/** The published looks as World reads them: a resident's name → {set}. */
export const looksSets=file=>Object.fromEntries(Object.entries(file.looks||{}).map(([name,look])=>[name,{set:look.set}]));
/** The Studio-only characters as Studio reads them: id → {name, recipe, card}. */
export const studioCharacters=file=>Object.fromEntries(Object.entries(file.characters||{}).map(([id,c])=>[id,{name:c.name,recipe:c.recipe,card:c.card}]));

/** looks-data.js for a looks.json. */
export function looksModule(jsonText){
 const sets=looksSets(JSON.parse(jsonText));
 return `// Generated from data/studio/looks.json by tools/studio/build-data.mjs. Do not edit it: change a look in Johansson Studio
// or with the johansson-studio tools (avatar-creator/docs/STUDIO-MCP.md). CI refuses a copy that does not match the data.
${FREEZE}
/** The sha256 of the published looks' fields (their canonical JSON). */
export const LOOKS_SHA256='${recordSha256(sets)}';
/** Published looks: a resident's name → {set}. cast.js recipeFor lays \`set\` over how World draws them. */
export const LOOKS=freeze(${value(sets)});
`;
}

/** characters-data.js for a looks.json. */
export function charactersModule(jsonText){
 const characters=studioCharacters(JSON.parse(jsonText));
 return `// Generated from data/studio/looks.json by tools/studio/build-data.mjs. Do not edit it: make a character in Johansson
// Studio or with the johansson-studio tools (avatar-creator/docs/STUDIO-MCP.md). CI refuses a copy that does not match.
${FREEZE}
/** The sha256 of the Studio characters (their canonical JSON). */
export const STUDIO_CHARACTERS_SHA256='${recordSha256(characters)}';
/** Studio-only characters, listed in Johansson Studio's pickers (World does not place them yet): id → {name, recipe, card}. */
export const STUDIO_CHARACTERS=freeze(${value(characters)});
`;
}

/** Each generated module and whether it matches its data: [{path, from, fresh, text}]. */
export async function plan(repo=openRepo()){
 const looks=await repo.read(PATHS.looks),items=[];
 for(const [path,make] of [[PATHS.looksModule,looksModule],[PATHS.charactersModule,charactersModule]]){
  const text=make(looks),now=await repo.read(path).catch(()=>null);
  items.push({path,from:PATHS.looks,fresh:now===text,text});
 }
 return items;
}
export async function check(repo=openRepo()){const items=await plan(repo);return {ok:items.every(i=>i.fresh),stale:items.filter(i=>!i.fresh).map(i=>i.path)};}
/** Write the modules that are out of date, as one step under Studio's write lock. Returns the paths written. */
export function build(repo=openRepo()){
 return serial(()=>repo.locked(async()=>{const stale=(await plan(repo)).filter(i=>!i.fresh);return stale.length?repo.writeAll(stale.map(i=>[i.path,i.text])):[];}));
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 if(process.argv.includes('--check')){
  const r=await check();
  if(r.ok)console.log('Studio\'s generated modules match their data.');
  else{console.error(`Out of date: ${r.stale.join(', ')}. Run: node johansson-town/tools/studio/build-data.mjs`);process.exitCode=1;}
 }else{const written=await build();console.log(written.length?`Wrote ${written.join(', ')}.`:'Already up to date.');}
}

#!/usr/bin/env node
/**
 * Makes World's modules from Studio's data, so World reads the data synchronously like any other module:
 *   data/studio/looks.json → src/avatars/looks-data.js
 * (products.json → src/commerce/products-data.js arrives in stage 2.)
 *   node johansson-town/tools/studio/build-data.mjs           write the modules
 *   node johansson-town/tools/studio/build-data.mjs --check   only say whether they are up to date (CI, publish_check)
 * The module names follow the town's import rule (from './name.js'), so the film's sync-town.sh copies them too.
 */
import {fileURLToPath} from 'node:url';
import {openRepo,PATHS,serial} from './repo.mjs';
import {sha256} from '../../src/studio/sha256.js';

/** The module text for a looks.json. */
export function looksModule(jsonText){
 const data=JSON.parse(jsonText),value=v=>JSON.stringify(v,null,1);
 return `// Generated from data/studio/looks.json by tools/studio/build-data.mjs. Do not edit it: change a look in Johansson Studio
// or with the johansson-studio tools (avatar-creator/docs/STUDIO-MCP.md). CI refuses a copy that does not match the data.
const freeze=value=>{if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;};
/** The sha256 of the looks.json this module was made from. */
export const LOOKS_SHA256='${sha256(jsonText)}';
/** Published looks: a resident's name → {set, note, made}. cast.js recipeFor lays \`set\` over how World draws them. */
export const LOOKS=freeze(${value(data.looks||{})});
/** Studio-only characters (World does not place them yet): id → {name, recipe, card, made}. */
export const STUDIO_CHARACTERS=freeze(${value(data.characters||{})});
`;
}

/** Each generated module and whether it matches its data: [{path, from, fresh, text}]. */
export async function plan(repo=openRepo()){
 const looks=await repo.read(PATHS.looks),text=looksModule(looks);
 const now=await repo.read(PATHS.looksModule).catch(()=>null);
 return [{path:PATHS.looksModule,from:PATHS.looks,fresh:now===text,text}];
}
export async function check(repo=openRepo()){const items=await plan(repo);return {ok:items.every(i=>i.fresh),stale:items.filter(i=>!i.fresh).map(i=>i.path)};}
/** Write the modules that are out of date. Returns the paths written. */
export function build(repo=openRepo()){
 return serial(async()=>{const written=[];for(const item of await plan(repo))if(!item.fresh)written.push(await repo.write(item.path,item.text));return written;});
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 if(process.argv.includes('--check')){
  const r=await check();
  if(r.ok)console.log('Studio\'s generated modules match their data.');
  else{console.error(`Out of date: ${r.stale.join(', ')}. Run: node johansson-town/tools/studio/build-data.mjs`);process.exitCode=1;}
 }else{const written=await build();console.log(written.length?`Wrote ${written.join(', ')}.`:'Already up to date.');}
}

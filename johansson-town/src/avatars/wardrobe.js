import {normalizeRecipe,encodeRecipe,decodeRecipe} from './recipe.js';
import {formerNames} from '../people/renamed.js';
export const WARDROBE_KEY='johansson-town-resident-wardrobes';
export function residentRecipe(name,storage=globalThis.localStorage){
 // A look saved before a resident was renamed is still theirs (people/renamed.js).
 try{const entries=JSON.parse(storage?.getItem(WARDROBE_KEY)||'{}');const code=entries[name]||formerNames(name).map(old=>entries[old]).find(Boolean);
  const r=decodeRecipe(code||'');return r&&r.name!==name?{...r,name}:r;}catch{return null;}
}
export function saveResidentRecipe(name,recipe,storage=globalThis.localStorage){
 const r=normalizeRecipe({...recipe,name});let entries={};try{entries=JSON.parse(storage?.getItem(WARDROBE_KEY)||'{}')||{};}catch{}
 entries[name]=encodeRecipe(r);storage?.setItem(WARDROBE_KEY,JSON.stringify(entries));
 globalThis.dispatchEvent?.(new Event('johansson-appearance-change'));return r;
}

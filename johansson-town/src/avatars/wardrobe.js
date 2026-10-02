import {normalizeRecipe,encodeRecipe,decodeRecipe} from './recipe.js';
export const WARDROBE_KEY='johansson-town-resident-wardrobes';
export function residentRecipe(name,storage=globalThis.localStorage){
 try{return decodeRecipe(JSON.parse(storage?.getItem(WARDROBE_KEY)||'{}')[name]||'');}catch{return null;}
}
export function saveResidentRecipe(name,recipe,storage=globalThis.localStorage){
 const r=normalizeRecipe({...recipe,name});let entries={};try{entries=JSON.parse(storage?.getItem(WARDROBE_KEY)||'{}')||{};}catch{}
 entries[name]=encodeRecipe(r);storage?.setItem(WARDROBE_KEY,JSON.stringify(entries));
 globalThis.dispatchEvent?.(new Event('johansson-appearance-change'));return r;
}

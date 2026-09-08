export const SAVE_KEY='johansson-town-1988-v5';
export const LEGACY_KEYS=['johansson-town-1988-v4','johansson-town-1988-v3'];
export function readSave(storage){
  for(const key of [SAVE_KEY,...LEGACY_KEYS])try{const value=JSON.parse(storage.getItem(key));if(value&&typeof value==='object'&&!Array.isArray(value))return value;}catch{}
  return null;
}

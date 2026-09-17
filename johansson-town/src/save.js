import {migratedVisits} from './world/businesses.js';

export const SAVE_KEY='johansson-town-1988-v5';
export const LEGACY_KEYS=['johansson-town-1988-v4','johansson-town-1988-v3'];
export function migrateThuan(saved){
  // Keep the existing home ID and move only the renamed resident's records.
  // Yui was the original Sakura clerk and Yuri the later one; both read as Thuan.
  // A newer Thuan record wins if a save contains more than one of the names.
  const rename=text=>typeof text==='string'?text.replace(/\b(?:Yuri|Yui)\b/g,'Thuan'):text;
  for(const key of ['residentLocations','residentLife']){
    const records=saved[key];
    if(!records||typeof records!=='object'||Array.isArray(records))continue;
    for(const legacy of ['Yuri','Yui']){
      if(!Object.hasOwn(records,legacy))continue;
      if(!Object.hasOwn(records,'Thuan'))records.Thuan=records[legacy];
      delete records[legacy];
    }
  }
  if(Array.isArray(saved.notes))saved.notes=[...new Set(saved.notes.map(rename))];
  for(const record of Object.values(saved.residentLife||{}))if(Array.isArray(record?.activities))record.activities=record.activities.map(rename);
  // The ledger prints the buyer column, so untouched rows would still show the old name.
  if(Array.isArray(saved.sakura?.journal))for(const row of saved.sakura.journal)if(row&&typeof row==='object')row.buyer=rename(row.buyer);
  return saved;
}
export function readSave(storage){
  for(const key of [SAVE_KEY,...LEGACY_KEYS])try{const value=JSON.parse(storage.getItem(key));if(value&&typeof value==='object'&&!Array.isArray(value)){if(Array.isArray(value.visited))value.visited=migratedVisits(value.visited.filter(id=>typeof id==='string'));return migrateThuan(value);}}catch{}
  return null;
}

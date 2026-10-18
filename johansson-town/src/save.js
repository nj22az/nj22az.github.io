import {canonicalHomeId} from './people/households.js';
import {migratedVisits} from './world/businesses.js';
import {RENAMED_RESIDENTS,renameResidents} from './people/renamed.js';
export {RENAMED_RESIDENTS,renameResidents};

export const SAVE_KEY='johansson-town-1988-v5';
export const LEGACY_KEYS=['johansson-town-1988-v4','johansson-town-1988-v3'];
/** Moves records kept under an old name to the new one; a record already under the new name wins. */
function renameKeys(records,key=k=>RENAMED_RESIDENTS[k]){
 if(!records||typeof records!=='object'||Array.isArray(records))return;
 for(const old of Object.keys(records)){const now=key(old);if(!now||now===old)continue;if(!Object.hasOwn(records,now))records[now]=records[old];delete records[old];}
}
export function migrateThuan(saved){
  // Keep the existing home IDs (resident-home-aya, yuri-home) and move only the renamed
  // residents' records.
  for(const key of ['residentLocations','residentLife','friendship','treats'])renameKeys(saved[key]);
  // The bookshop remembers finished jobs as `day:Name`.
  renameKeys(saved.bookshop?.completed,k=>{const at=k.lastIndexOf(':');return at<0?null:k.slice(0,at+1)+renameResidents(k.slice(at+1));});
  if(Array.isArray(saved.notes))saved.notes=[...new Set(saved.notes.map(renameResidents))];
  for(const record of Object.values(saved.residentLife||{}))if(Array.isArray(record?.activities))record.activities=record.activities.map(renameResidents);
  // The ledger prints the buyer column, so untouched rows would still show the old name.
  if(Array.isArray(saved.sakura?.journal))for(const row of saved.sakura.journal)if(row&&typeof row==='object')row.buyer=renameResidents(row.buyer);
  if(Array.isArray(saved.documentArchive))for(const doc of saved.documentArchive)if(doc&&typeof doc==='object')doc.author=renameResidents(doc.author);
  return saved;
}
/** One-time, idempotent housing migration. Never treats a shop visit as an old home visit. */
export function migrateHousing(saved){
 if(saved.housingRevision>=1)return saved;
 const moved=['Grandmother Chinen','Grandmother Sakurai','Mr Nakandakari','Ms Ganaha'];
 for(const name of moved)if(saved.residentLocations)delete saved.residentLocations[name];
 for(const name of moved){const life=saved.residentLife?.[name];if(life){delete life.home;delete life.homeId;delete life.sleepingPlace;}}
 for(const key of ['homeTarget','navigationTarget','lastHome'])if(typeof saved[key]==='string')saved[key]=canonicalHomeId(saved[key]);
 saved.housingRevision=1;return saved;
}
/**
 * Local players. Everybody who plays on this device can have their own save: a name and
 * a slot in localStorage. The first player keeps the original save key, so progress from
 * before players existed is simply theirs.
 */
export const PLAYERS_KEY='johansson-town-players';
export const DEFAULT_PLAYER=Object.freeze({id:'player-1',name:'Visitor'});
export const slotKey=id=>id===DEFAULT_PLAYER.id?SAVE_KEY:SAVE_KEY+'@'+id;
const cleanName=name=>String(name||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,24);
export function readPlayers(storage){
  let data=null;try{data=JSON.parse(storage?.getItem?.(PLAYERS_KEY));}catch{}
  const players=Array.isArray(data?.players)?data.players.filter(p=>p&&typeof p.id==='string'&&/^[\w-]{1,40}$/.test(p.id)).map(p=>({id:p.id,name:cleanName(p.name)||'Visitor',created:Number(p.created)||0,lastPlayed:Number(p.lastPlayed)||0})):[];
  if(!players.some(p=>p.id===DEFAULT_PLAYER.id))players.unshift({...DEFAULT_PLAYER,created:0,lastPlayed:0});
  const active=players.some(p=>p.id===data?.active)?data.active:DEFAULT_PLAYER.id;
  return {active,players};
}
export function writePlayers(storage,roster){try{storage.setItem(PLAYERS_KEY,JSON.stringify(roster));return true;}catch{return false;}}
export const activePlayer=storage=>{const roster=readPlayers(storage);return roster.players.find(p=>p.id===roster.active);};
export function addPlayer(storage,name,now=Date.now()){
  const roster=readPlayers(storage),id='player-'+now.toString(36)+Math.floor(Math.random()*1296).toString(36);
  roster.players.push({id,name:cleanName(name)||'Visitor',created:now,lastPlayed:now});roster.active=id;writePlayers(storage,roster);return id;
}
export function switchPlayer(storage,id){const roster=readPlayers(storage);if(!roster.players.some(p=>p.id===id))return false;roster.active=id;return writePlayers(storage,roster);}
export function renamePlayer(storage,name){const roster=readPlayers(storage),p=roster.players.find(p=>p.id===roster.active);if(!p||!cleanName(name))return false;p.name=cleanName(name);return writePlayers(storage,roster);}
export function touchPlayer(storage,now=Date.now()){const roster=readPlayers(storage),p=roster.players.find(p=>p.id===roster.active);if(p){p.lastPlayed=now;writePlayers(storage,roster);}}
/**
 * Never destroy the only good copy (Mario Artist's file system writes a temporary file, then renames: research/mario-artist
 * report.md §2.5). localStorage writes a key whole, so the dangers here are different: a save that no longer reads (a bug,
 * an extension), a full storage quota, and a load that half-fails and is then saved over with defaults.
 *   writeSave  keeps the last save that reads as the previous copy (<key>~prev) before writing the new one; when the
 *              storage is full it gives up the previous copy first, never the save itself
 *   readSave   falls back to the previous copy when the save does not read
 *   rescueSave keeps the raw save once (<key>~rescue, never overwritten) when loading it failed part-way, so the next
 *              auto-save cannot destroy the only good copy; the game says so
 */
export const PREV_SUFFIX='~prev',RESCUE_SUFFIX='~rescue';
const readsAsSave=text=>{try{const v=JSON.parse(text);return !!v&&typeof v==='object'&&!Array.isArray(v);}catch{return false;}};
export function writeSave(storage,key,json){
  const now=storage.getItem(key);
  if(now!=null&&now!==json&&readsAsSave(now))try{storage.setItem(key+PREV_SUFFIX,now);}catch{try{storage.removeItem(key+PREV_SUFFIX);}catch{}}
  try{storage.setItem(key,json);return true;}catch{}
  // Full: give up the previous copies (every player's: they are the least needed things here), then try again. A
  // rescued save is the player's own progress and is never dropped to make room.
  try{
   const prevs=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.endsWith(PREV_SUFFIX))prevs.push(k);}
   for(const k of prevs.length?prevs:[key+PREV_SUFFIX])storage.removeItem(k);
   storage.setItem(key,json);return true;
  }catch{return false;}
}
export function rescueSave(storage,key){
  try{if(storage.getItem(key+RESCUE_SUFFIX)!=null)return false;const raw=storage.getItem(key);if(raw==null)return false;storage.setItem(key+RESCUE_SUFFIX,raw);return true;}catch{return false;}
}
/** The key the active player's save lives under. */
export const activeSlot=storage=>slotKey(readPlayers(storage).active);
export function readSave(storage){
  const slot=slotKey(readPlayers(storage).active);
  for(const key of slot===SAVE_KEY?[SAVE_KEY,SAVE_KEY+PREV_SUFFIX,...LEGACY_KEYS]:[slot,slot+PREV_SUFFIX])try{const value=JSON.parse(storage.getItem(key));if(value&&typeof value==='object'&&!Array.isArray(value)){if(Array.isArray(value.visited))value.visited=migratedVisits(value.visited.filter(id=>typeof id==='string'));const out=migrateHousing(migrateThuan(value));Object.defineProperty(out,'readFrom',{value:key,enumerable:false});return out;}}catch{}
  return null;
}

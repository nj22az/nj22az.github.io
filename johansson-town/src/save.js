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
export function readSave(storage){
  const slot=slotKey(readPlayers(storage).active);
  for(const key of slot===SAVE_KEY?[SAVE_KEY,...LEGACY_KEYS]:[slot])try{const value=JSON.parse(storage.getItem(key));if(value&&typeof value==='object'&&!Array.isArray(value)){if(Array.isArray(value.visited))value.visited=migratedVisits(value.visited.filter(id=>typeof id==='string'));return migrateThuan(value);}}catch{}
  return null;
}

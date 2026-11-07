/**
 * What a game opens. The Game Boy Camera unlocked its last stamps by a score in Ball; Pocket Camera opens its secret
 * sticker sheet, the Pocket faces, by a win in the game room. Wins are counted per game in the settings store
 * (`wins`), and what is open is kept there too (`unlocked`), so an unlocked sheet stays unlocked.
 */
export const UNLOCKS=Object.freeze([
 Object.freeze({id:'pocket-faces',label:'Pocket faces',by:Object.freeze(['memory','solitaire','ball']),hint:'Win a game of Memory or Solitaire, or score 500 in Ball, to open this sheet.'}),
]);
/** The games whose wins count: a Memory board cleared, a Solitaire finished, a Blackjack hand won, five hundred in Ball. */
export const GAMES=Object.freeze(['memory','solitaire','blackjack','ball']);
const titled=s=>s[0].toUpperCase()+s.slice(1);

/** The settings with this win counted, and the ids of what it opened that was not open before. */
export function recordWin(saved,game){
 saved=saved&&typeof saved==='object'?saved:{};
 if(!GAMES.includes(game))return {saved,unlocked:[]};
 const wins={...(saved.wins&&typeof saved.wins==='object'?saved.wins:{})};
 wins[game]=(Number.isInteger(wins[game])?wins[game]:0)+1;
 const had=new Set(Array.isArray(saved.unlocked)?saved.unlocked:[]),now=new Set(had);
 for(const u of UNLOCKS)if(u.by.includes(game))now.add(u.id);
 return {saved:{...saved,wins,unlocked:[...now]},unlocked:[...now].filter(id=>!had.has(id))};
}
/** Whether a sheet (or anything else unlockable) is open. */
export const isUnlocked=(saved,id)=>Array.isArray(saved?.unlocked)&&saved.unlocked.includes(id);
/** How to open it, for the locked tab. */
export function unlockHint(id){
 const u=UNLOCKS.find(x=>x.id===id);
 return u?u.hint||`Win a game of ${u.by.map(titled).join(' or ')} to open this sheet.`:'';
}

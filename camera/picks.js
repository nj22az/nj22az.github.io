/**
 * What to offer first (the owner, 13 November 2026: "try to make the sticker sections more intelligent and choosing
 * filter too, it's a bit overwhelming as it is now"). Forty-three Looks and some four hundred stickers are too many to
 * be shown at once, so each picker opens on a short page "For you" and keeps the rest one tap behind:
 *
 *   Looks      the photo as it is, what was used lately, and a handful picked for this photo: from what the photo is
 *              (dark or bright, pale or colourful, busy or plain, a face or none; smart-shuffle.js measures it, never
 *              keeping the photo) and, in the editor, from how each candidate really comes out on it (its preview
 *              scored as Surprise scores a mix). No two picks of one kind crowd the others out.
 *   Stickers   what was used lately, the season that is here or coming, things to wear when there is a face, and a
 *              handful that changes with the day, so the sheets are met a few at a time.
 *
 * Plain functions of their inputs: nothing here touches the page, so the choices can be tested (tests/picks.test.mjs).
 */
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));

/** How widely each Look suits a photo at all, before anything is known about the photo. */
const BASE=Object.freeze({
 mono:.5,sepia:.45,negative:.1,instant:.6,tilt:.3,nightVision:.15,
 popArt:.5,poster:.5,neon:.35,thermal:.2,funhouse:.15,
 pocket:.45,colourHandheld:.3,redVisor:.15,eightBit:.35,snes:.3,thirtyTwoBit:.25,sixtyFourBit:.25,
 crt:.35,camcorder:.4,
 lines:.4,sketchbook:.45,crayon:.4,pencilManga:.45,manga:.5,flat:.4,adventureInk:.5,
 halftone:.45,goldenAge:.45,actionManga:.35,oldCartoon:.4,
 watercolour:.6,oil:.45,brushOil:.4,
 print:.35,stamp:.3,cyanotype:.35,
 riso:.45,risoPinkBlue:.35,risoRedNavy:.35,risoBlackPink:.3,risoThree:.4,
});
/** What a photo's nature adds to or takes from a Look: [is it so?, by how much, the Looks]. */
const NATURE=photo=>[
 [photo.face,.25,['manga','popArt','instant','watercolour','goldenAge','pencilManga','oldCartoon']],
 [photo.face,.1,['sepia','funhouse','mono']],
 [photo.face,-.2,['thermal','negative','tilt','stamp']],
 [photo.median<.3,.45,['nightVision']],[photo.median<.3,.25,['neon','crt','camcorder']],[photo.median<.3,-.15,['watercolour','sketchbook','lines','flat']],
 [photo.median>.62,.15,['watercolour','sketchbook','lines','flat','riso']],
 [photo.saturation<.14,.25,['mono']],[photo.saturation<.14,.2,['sepia','cyanotype','sketchbook','pencilManga','manga']],[photo.saturation<.14,-.1,['popArt','risoThree','poster']],
 [photo.saturation>.38,.25,['popArt','poster','risoThree','halftone','flat']],[photo.saturation>.38,.1,['thermal','crayon']],
 [photo.edge>.1,.2,['lines','adventureInk','manga','stamp','sketchbook']],[photo.edge>.1,.15,['watercolour','oil','tilt']],
 [photo.edge<.045,.2,['flat','poster','halftone','pocket','eightBit']],
 [photo.red-photo.blue>.05,.15,['sepia','instant','goldenAge','oil']],
 [photo.blue-photo.red>.05,.15,['cyanotype','risoPinkBlue','watercolour','camcorder']],
];
/** How well each Look is likely to suit a photo, 0 to 1, from the photo's measurements and whether it has a face. */
export function lookPrior(photo={},{face=false}={}){
 const p={median:.5,saturation:.25,edge:.07,red:.5,blue:.5,...photo,face},out={...BASE};
 for(const [so,by,looks] of NATURE(p))if(so)for(const look of looks)if(look in out)out[look]+=by;
 for(const look in out)out[look]=clamp(out[look]);
 return out;
}
/**
 * The Looks to offer first: the photo as it is ('none'), up to two used lately, then `count` picked. `prior` is
 * lookPrior's; `scores` (optional) how each candidate came out on the photo, 0 to 1; `kindOf` names a Look's kind (at
 * most two picks of a kind); `available` says whether a Look can be offered at all.
 */
export function lookPicks({prior={},scores={},recent=[],kindOf=()=>'',available=()=>true,count=6}={}){
 const ok=name=>name!=='none'&&available(name),lately=[...new Set(recent)].filter(ok).slice(0,2);
 const rank=name=>name in scores?.55*scores[name]+.45*(prior[name]??0):(prior[name]??0);
 const order=Object.keys(prior).filter(ok).filter(name=>!lately.includes(name)).sort((a,b)=>rank(b)-rank(a)||a.localeCompare(b));
 const taken=new Map(),picked=[];
 for(const name of order){
  if(picked.length>=count)break;
  const kind=kindOf(name),n=taken.get(kind)||0;if(n>=2)continue;
  taken.set(kind,n+1);picked.push(name);
 }
 return ['none',...lately,...picked];
}
/** The candidates worth trying on the photo itself: the likeliest `count` by the prior. */
export const lookCandidates=(prior,{available=()=>true,count=14}={})=>Object.keys(prior).filter(n=>n!=='none'&&available(n)).sort((a,b)=>prior[b]-prior[a]||a.localeCompare(b)).slice(0,count);
/** `id` put at the head of a list of things used lately, once, the list kept to `max`. */
export const usedLately=(list,id,max=8)=>[id,...(Array.isArray(list)?list:[]).filter(x=>x!==id&&typeof x==='string')].slice(0,max);

/** How many months until a season's sheet is in season (0 while it is; a sheet with no months comes last). */
export const untilSeason=(set,today)=>{const now=today.getMonth()+1,when=Array.isArray(set.when)?set.when:[];return when.length?Math.min(...when.map(m=>(m-now+12)%12)):12;};
const dayOfYear=d=>Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/864e5);
/**
 * The stickers' first page: rows of {title, stickers}. `sets` are the loaded sheets (a locked one is left out by the
 * caller), `recent` the ids used lately, `face` whether there is a face to dress.
 */
export function stickerPicks({sets=[],recent=[],today=new Date(),face=false,row=8}={}){
 const byId=new Map(sets.flatMap(set=>set.stickers.map(s=>[s.id,s]))),shown=new Set(),rows=[];
 const add=(title,stickers)=>{const fresh=stickers.filter(s=>s&&!shown.has(s.id)).slice(0,row);for(const s of fresh)shown.add(s.id);if(fresh.length)rows.push({title,stickers:fresh});};
 add('Lately',recent.map(id=>byId.get(id)));
 // The season that is here, or the next to come: its sheets together (two sheets of one name are one season).
 const seasons=sets.filter(set=>set.kind==='season').map((set,i)=>({set,i,until:untilSeason(set,today)})).sort((a,b)=>a.until-b.until||a.i-b.i);
 if(seasons.length){const name=seasons[0].set.name,sheets=seasons.filter(x=>x.set.name===name).map(x=>x.set);add(name,interleave(sheets.map(set=>set.stickers)));}
 if(face)add('To wear',['bits/crown','bits/shades','bits/bow','halloween/witch-hat','halloween/cat-ears','halloween/pumpkin-cap'].map(id=>byId.get(id)));
 // A handful that changes with the day: the friends and the residents, a few from each, never the same row twice running.
 const pool=sets.filter(set=>!set.kind||set.kind==='cute'),day=dayOfYear(today),today_=[];
 for(let k=0;today_.length<row*2&&k<row*4&&pool.length;k++){const set=pool[(day+k)%pool.length],s=set.stickers[(day*7+k*3)%set.stickers.length];if(s&&!today_.includes(s))today_.push(s);}
 add('Today',today_);
 return rows;
}
/** One from each list in turn, so two sheets share a row fairly. */
function interleave(lists){const out=[];for(let i=0;lists.some(l=>i<l.length);i++)for(const l of lists)if(i<l.length)out.push(l[i]);return out;}

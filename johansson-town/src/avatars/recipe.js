/**
 * Shimanchu (島人, islander): the town's avatars.
 *
 * Every person in the town is a recipe: a few hundred bytes saying what their face,
 * hair, body and clothes are. The recipe is all that is stored or shared; the body is
 * built from it (build.js), the face is painted from it (face.js) and it is animated
 * the same way for everyone (animate.js), so the whole cast shares one look -- round
 * heads, stubby limbs, drawn-on faces -- whether it is Thuan, Johansson or the postman.
 *
 * Everything here is original to this town: the part shapes, the palettes, the names.
 */

/** Skin, hair, eyes and cloth. Chosen to sit well under the town's cel grade. */
export const PALETTE=Object.freeze({
 skin:Object.freeze(['#f7dcc4','#f1cfae','#e8bf98','#dca97e','#c98d62','#b27449','#8f5a38','#6b4029']),
 hair:Object.freeze(['#1c1714','#3a2618','#5a3a22','#8a5a2e','#c08a4a','#e0c078','#9a9a96','#d8d6d0','#b8412e','#3d4f8a']),
 eyes:Object.freeze(['#2a1d16','#5a3a22','#3d6a8a','#4a7a4a','#6a5a8a','#1c1c24']),
 cloth:Object.freeze(['#f4f1ea','#d8342c','#e8742a','#f4d23c','#8fbf4a','#2a8a5a','#3fa0c8','#2f5f9e','#27304d','#8a4ab8','#e98aa6','#9a6a42','#6d7478','#2b2b2b','#c8b48a','#7fb0d8']),
 lips:Object.freeze(['#b8544a','#a8433e','#cc3d52','#e06a7a','#d8342c','#8a3a3a']),
});

export const PARTS=Object.freeze({
 hair:Object.freeze(['crop','sidepart','bob','long','ponytail','braids','bun','spiky','perm','buzz','afro','horseshoe','bald']),
 eyes:Object.freeze(['round','dot','almond','sleepy','lashes','narrow','sparkle','gentle']),
 brows:Object.freeze(['straight','arched','thick','thin','worried','bushy','none']),
 nose:Object.freeze(['button','dot','line','wide','hook','none']),
 mouth:Object.freeze(['smile','flat','grin','small','wide','smirk','pout']),
 glasses:Object.freeze(['none','round','square','sun','half']),
 facial:Object.freeze(['none','moustache','walrus','stubble','beard','goatee']),
 top:Object.freeze(['tee','kariyushi','polo','blouse','jacket','apron','smock']),
 bottom:Object.freeze(['shorts','trousers','skirt','longskirt']),
 hat:Object.freeze(['none','cap','captain','police','helmet','straw','headband','kerchief']),
});

const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,Number.isFinite(+v)?+v:lo));
const pick=(list,v,fallback)=>list.includes(v)?v:fallback??list[0];
const colour=v=>/^#[0-9a-f]{6}$/i.test(String(v))?String(v).toLowerCase():null;

/** The recipe every other one starts from: a friendly nobody. */
export const DEFAULT_RECIPE=Object.freeze({
 v:1,name:'',
 body:Object.freeze({height:.5,build:.5,skin:'#e8bf98'}),
 head:Object.freeze({size:.5,shape:.5}),
 hair:Object.freeze({style:'crop',colour:'#1c1714',flip:false}),
 eyes:Object.freeze({style:'round',colour:'#2a1d16',size:.5,spacing:.5,height:.5,tilt:.5}),
 brows:Object.freeze({style:'straight',colour:'#1c1714',size:.5,height:.5,tilt:.5}),
 nose:Object.freeze({style:'button',size:.5,height:.5}),
 mouth:Object.freeze({style:'smile',colour:'#b8544a',size:.5,height:.5}),
 glasses:Object.freeze({style:'none',colour:'#2b2b2b'}),
 facial:Object.freeze({style:'none',colour:'#1c1714'}),
 blush:.25,freckles:false,mole:false,wrinkles:0,
 outfit:Object.freeze({top:'tee',topColour:'#3fa0c8',pattern:'none',bottom:'trousers',bottomColour:'#27304d',shoes:'#6d4a32',hat:'none',hatColour:'#f4f1ea',accent:'#f4d23c'}),
 swim:Object.freeze({colour:'#2f5f9e'}),
});

/** Any object in, a complete and safe recipe out. Unknown fields are dropped. */
export function normalizeRecipe(input={}){
 const r=input&&typeof input==='object'?input:{},d=DEFAULT_RECIPE;
 const sub=(key,spec)=>{const src=r[key]&&typeof r[key]==='object'?r[key]:{},out={};for(const [k,fn] of Object.entries(spec))out[k]=fn(src[k],d[key][k]);return out;};
 const num=(v,f)=>v===undefined?f:clamp(v);
 const col=(v,f)=>colour(v)||f;
 const flag=(v,f)=>v===undefined?f:!!v;
 return {
  v:1,name:String(r.name||'').slice(0,24),
  body:sub('body',{height:num,build:num,skin:col}),
  head:sub('head',{size:num,shape:num}),
  hair:sub('hair',{style:(v,f)=>pick(PARTS.hair,v,f),colour:col,flip:flag}),
  eyes:sub('eyes',{style:(v,f)=>pick(PARTS.eyes,v,f),colour:col,size:num,spacing:num,height:num,tilt:num}),
  brows:sub('brows',{style:(v,f)=>pick(PARTS.brows,v,f),colour:col,size:num,height:num,tilt:num}),
  nose:sub('nose',{style:(v,f)=>pick(PARTS.nose,v,f),size:num,height:num}),
  mouth:sub('mouth',{style:(v,f)=>pick(PARTS.mouth,v,f),colour:col,size:num,height:num}),
  glasses:sub('glasses',{style:(v,f)=>pick(PARTS.glasses,v,f),colour:col}),
  facial:sub('facial',{style:(v,f)=>pick(PARTS.facial,v,f),colour:col}),
  blush:num(r.blush,d.blush),freckles:!!r.freckles,mole:!!r.mole,wrinkles:num(r.wrinkles,d.wrinkles),
  outfit:sub('outfit',{top:(v,f)=>pick(PARTS.top,v,f),topColour:col,pattern:(v,f)=>['none','flowers','stripes','dots'].includes(v)?v:f,bottom:(v,f)=>pick(PARTS.bottom,v,f),bottomColour:col,shoes:col,hat:(v,f)=>pick(PARTS.hat,v,f),hatColour:col,accent:col}),
  swim:sub('swim',{colour:col}),
 };
}

/** A recipe as a short code you can paste or put in a link, and back. */
export function encodeRecipe(recipe){
 const json=JSON.stringify(normalizeRecipe(recipe));
 const bytes=new TextEncoder().encode(json);let bin='';for(const b of bytes)bin+=String.fromCharCode(b);
 return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeRecipe(code){
 try{
  const bin=atob(String(code).replace(/-/g,'+').replace(/_/g,'/'));
  const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
  return normalizeRecipe(JSON.parse(new TextDecoder().decode(bytes)));
 }catch{return null;}
}

/** A deterministic random source from a string, so a name always makes the same face. */
export function seeded(text=''){
 let h=2166136261;for(const c of String(text))h=Math.imul(h^c.codePointAt(0),16777619)>>>0;
 return ()=>{h=(h+0x6D2B79F5)>>>0;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}

/** Somebody new, at random (or from a seed): what the creator's dice button does. */
export function randomRecipe(seed=Math.random().toString(36)){
 const r=seeded(seed),any=list=>list[Math.floor(r()*list.length)],pal=PALETTE;
 const older=r()<.3,feminine=r()<.5;
 const hair=older?(feminine?any(['perm','bun','bob']):any(['horseshoe','buzz','crop','bald'])):feminine?any(['bob','long','ponytail','braids','bun','sidepart']):any(['crop','sidepart','spiky','buzz','afro']);
 return normalizeRecipe({
  body:{height:.3+r()*.5,build:.25+r()*.55,skin:any(pal.skin.slice(0,7))},
  head:{size:.4+r()*.25,shape:r()},
  hair:{style:hair,colour:older?any(['#9a9a96','#d8d6d0','#5a3a22']):any(pal.hair.slice(0,6)),flip:r()<.5},
  eyes:{style:any(PARTS.eyes),colour:any(pal.eyes),size:.3+r()*.5,spacing:.3+r()*.4,height:.4+r()*.2,tilt:.35+r()*.3},
  brows:{style:any(PARTS.brows.slice(0,6)),colour:older?'#8a8a86':'#1c1714',size:.4+r()*.3,height:.4+r()*.3,tilt:.3+r()*.4},
  nose:{style:any(PARTS.nose.slice(0,5)),size:.3+r()*.5,height:.4+r()*.2},
  mouth:{style:any(PARTS.mouth),colour:feminine&&r()<.5?any(pal.lips):'#b8544a',size:.35+r()*.4,height:.4+r()*.2},
  glasses:{style:r()<.25?any(PARTS.glasses.slice(1)):'none',colour:any(['#2b2b2b','#8a4a3a','#c8a060','#e06a7a'])},
  facial:{style:!feminine&&r()<.3?any(PARTS.facial.slice(1)):'none',colour:'#3a2618'},
  blush:feminine?.3+r()*.4:r()*.2,freckles:r()<.12,mole:r()<.1,wrinkles:older?.5+r()*.5:0,
  outfit:{top:any(['tee','kariyushi','polo','blouse','jacket']),topColour:any(pal.cloth),pattern:r()<.3?any(['flowers','stripes','dots']):'none',
   bottom:feminine&&r()<.4?any(['skirt','longskirt']):any(['shorts','trousers']),bottomColour:any(['#27304d','#6d7478','#c8b48a','#2b2b2b','#9a6a42','#2f5f9e']),shoes:any(['#6d4a32','#2b2b2b','#f4f1ea','#d8342c']),hat:'none',hatColour:'#f4f1ea',accent:any(pal.cloth)},
 });
}

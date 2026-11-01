/** Camera-only Look families. Old recipe IDs remain valid; choices live inside one mix layer. */
export const FAMILIES=Object.freeze([
 {id:'handheld',label:'Handheld',choice:'Handheld model',looks:['pocket','colourHandheld','redVisor'],variants:[['pocket','Game Boy'],['pocket:pocket','Game Boy Pocket'],['pocket:light','Game Boy Light'],['colourHandheld','Game Boy Colour'],['redVisor','Red visor']]},
 {id:'console',label:'Game system',choice:'Game system',looks:['eightBit','snes','thirtyTwoBit','sixtyFourBit'],variants:[['eightBit','8-bit console'],['snes','16-bit console'],['thirtyTwoBit','32-bit console'],['sixtyFourBit','64-bit console']]},
 {id:'riso',label:'Riso',choice:'Ink palette',looks:['riso','risoPinkBlue','risoRedNavy','risoBlackPink','risoThree'],variants:[['riso','Coral & teal'],['risoPinkBlue','Pink & blue'],['risoRedNavy','Red & navy'],['risoBlackPink','Black & pink'],['risoThree','Three-colour']]},
]);
export const familyFor=look=>FAMILIES.find(f=>f.looks.includes(look));
export const hasScreen=look=>['handheld','console'].includes(familyFor(look)?.id)||['crt','camcorder'].includes(look);
export const hasLookSettings=look=>!!familyFor(look)||hasScreen(look);
export const variantFor=layer=>layer.look==='pocket'&&layer.handheld?`pocket:${layer.handheld}`:layer.look;
export function selectVariant(layer,value){
 const family=familyFor(layer.look);
 if(!family?.variants.some(([id])=>id===value))return false;
 const [look,model]=value.split(':');layer.look=look;delete layer.handheld;
 if(model)layer.handheld=model;
 return true;
}
const bounded=(v,d=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):d;
export function normalScreen(value){
 const mode=['lcd','crt'].includes(value?.mode)?value.mode:'none';
 return {mode,scanlines:bounded(value?.scanlines),glow:bounded(value?.glow),curve:bounded(value?.curve),mask:bounded(value?.mask)};
}
export function screenDefaults(mode){
 return mode==='crt'?{mode,scanlines:.45,glow:.25,curve:.3,mask:.15}:mode==='lcd'?{mode,scanlines:0,glow:.08,curve:0,mask:.3}:normalScreen();
}
export function layerOptions(layer){
 const out={};
 if(layer?.look==='pocket'&&['pocket','light'].includes(layer.handheld))out.handheld=layer.handheld;
 if(hasScreen(layer?.look)&&layer?.screen&&typeof layer.screen==='object'){out.screen=normalScreen(layer.screen);if(layer.look==='crt'&&out.screen.mode==='lcd')out.screen.mode='crt';}
 return out;
}
/** No extra pass for a clean screen, including a zeroed finish. */
export function screenActive(layer){
 const s=normalScreen(layer?.screen);
 return layer?.look!=='crt'&&hasScreen(layer?.look)&&s.mode!=='none'&&[s.scanlines,s.glow,s.curve,s.mask].some(v=>v>0);
}
/** One tile per family, with its selected variant visible. */
export function familyTileVisible(name,selected){
 const family=familyFor(name);
 return !family||name===(family.looks.includes(selected)?selected:family.looks[0]);
}

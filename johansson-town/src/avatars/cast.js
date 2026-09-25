import {normalizeRecipe,seeded,PARTS} from './recipe.js';
import {residentPersonality} from '../people/resident-personalities.js';

/**
 * Who everybody is, as recipes. Johansson and Thuan are drawn from the photographs the
 * town was built for: he is sixty-odd, bald and sunburnt in his kariyushi shirt; she has
 * her braids with the yellow ties, the side part, round rose glasses and lipstick.
 */
const R=(o)=>normalizeRecipe(o);

export const CAST_RECIPES=Object.freeze({
 Johansson:R({name:'Johansson',
  body:{height:.72,build:.72,skin:'#dc9d7a'},head:{size:.52,shape:.35},
  hair:{style:'horseshoe',colour:'#b8b4aa'},
  eyes:{style:'gentle',colour:'#3d6a8a',size:.45,spacing:.52,height:.5,tilt:.45},
  brows:{style:'bushy',colour:'#a8a49a',size:.6,height:.55,tilt:.45},
  nose:{style:'wide',size:.6,height:.48},mouth:{style:'smile',colour:'#a8433e',size:.55,height:.5},
  facial:{style:'stubble',colour:'#b8b4aa'},wrinkles:.7,blush:.35,
  outfit:{top:'kariyushi',topColour:'#7fb0d8',pattern:'flowers',bottom:'shorts',bottomColour:'#c8b48a',shoes:'#6d4a32',accent:'#f4f1ea'},
  swim:{colour:'#2f5f9e'}}),
 Thuan:R({name:'Thuan',
  body:{height:.36,build:.35,skin:'#f1cfae'},head:{size:.55,shape:.6},
  hair:{style:'braids',colour:'#1c1714',flip:false},
  eyes:{style:'lashes',colour:'#2a1d16',size:.78,spacing:.5,height:.48,tilt:.55},
  brows:{style:'arched',colour:'#2a1d16',size:.42,height:.55,tilt:.5},
  nose:{style:'dot',size:.35,height:.5},mouth:{style:'smile',colour:'#cc3d52',size:.42,height:.5},
  glasses:{style:'round',colour:'#e06a7a'},blush:.65,
  outfit:{top:'blouse',topColour:'#f4d23c',pattern:'flowers',bottom:'trousers',bottomColour:'#27304d',shoes:'#f4f1ea',accent:'#f4d23c'},
  swim:{colour:'#e98aa6'}}),
 Nao:R({name:'Nao',body:{height:.42,build:.45,skin:'#e8bf98'},head:{size:.5,shape:.45},
  hair:{style:'ponytail',colour:'#292a30'},eyes:{style:'almond',colour:'#2a1d16',size:.55,spacing:.5,height:.5,tilt:.6},
  brows:{style:'straight',colour:'#292a30',size:.5},nose:{style:'button',size:.4},mouth:{style:'grin',colour:'#b8544a',size:.5},blush:.3,
  outfit:{top:'apron',topColour:'#bd7557',bottom:'trousers',bottomColour:'#394b58',shoes:'#2b2b2b',hat:'kerchief',hatColour:'#27304d',accent:'#f4f1ea'}}),
});

/** The people of the new streets, drawn to their lines in neighbours.js. */
export const NEIGHBOUR_RECIPES=Object.freeze({
 'Grandmother Higa':R({body:{height:.2,build:.6,skin:'#dca97e'},head:{size:.55,shape:.7},hair:{style:'perm',colour:'#d8d6d0'},eyes:{style:'gentle',size:.4},brows:{style:'thin',colour:'#9a9a96'},nose:{style:'button',size:.55},mouth:{style:'smile',size:.45},glasses:{style:'half',colour:'#8a4a3a'},wrinkles:1,blush:.4,outfit:{top:'blouse',topColour:'#8a4ab8',pattern:'flowers',bottom:'longskirt',bottomColour:'#6d7478',shoes:'#2b2b2b'}}),
 'Mr Ōshiro':R({body:{height:.4,build:.4,skin:'#b27449'},hair:{style:'buzz',colour:'#d8d6d0'},eyes:{style:'narrow'},brows:{style:'bushy',colour:'#d8d6d0'},nose:{style:'hook',size:.6},mouth:{style:'flat'},facial:{style:'stubble',colour:'#d8d6d0'},wrinkles:.9,outfit:{top:'tee',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#6d7478',shoes:'#2b2b2b',hat:'straw',hatColour:'#e0c078'}}),
 'Uncle Kinjō':R({body:{height:.55,build:.75,skin:'#c98d62'},hair:{style:'crop',colour:'#5a3a22'},eyes:{style:'dot'},brows:{style:'thick'},nose:{style:'wide'},mouth:{style:'wide'},facial:{style:'moustache',colour:'#3a2618'},wrinkles:.5,outfit:{top:'polo',topColour:'#2a8a5a',bottom:'shorts',bottomColour:'#c8b48a',shoes:'#6d4a32',hat:'cap',hatColour:'#d8342c'}}),
 'Mrs Nakamura':R({body:{height:.25,build:.6,skin:'#e8bf98'},hair:{style:'bun',colour:'#5a3a22'},eyes:{style:'round',size:.55},brows:{style:'arched'},nose:{style:'button'},mouth:{style:'grin',colour:'#cc3d52'},blush:.5,wrinkles:.4,outfit:{top:'apron',topColour:'#3fa0c8',bottom:'skirt',bottomColour:'#27304d',shoes:'#f4f1ea',hat:'kerchief',hatColour:'#f4f1ea',accent:'#f4f1ea'}}),
 'Mr Shimabukuro':R({body:{height:.5,build:.45,skin:'#dca97e'},hair:{style:'sidepart',colour:'#1c1714'},eyes:{style:'almond'},brows:{style:'straight'},nose:{style:'line'},mouth:{style:'smirk'},facial:{style:'moustache',colour:'#1c1714'},wrinkles:.3,outfit:{top:'smock',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#2b2b2b',shoes:'#2b2b2b'}}),
 'Mrs Yonamine':R({body:{height:.3,build:.55,skin:'#c98d62'},hair:{style:'ponytail',colour:'#3a2618'},eyes:{style:'sparkle'},brows:{style:'thick'},nose:{style:'button'},mouth:{style:'wide'},blush:.3,outfit:{top:'apron',topColour:'#2f5f9e',bottom:'trousers',bottomColour:'#27304d',shoes:'#f4f1ea',hat:'headband',hatColour:'#d8342c',accent:'#f4f1ea'}}),
 'Mrs Miyagi':R({body:{height:.1,build:.4,skin:'#c98d62'},head:{size:.6},hair:{style:'bun',colour:'#f4f1ea'},eyes:{style:'sleepy'},brows:{style:'thin',colour:'#d8d6d0'},nose:{style:'button'},mouth:{style:'small'},wrinkles:1,outfit:{top:'blouse',topColour:'#f4f1ea',bottom:'longskirt',bottomColour:'#2f5f9e',shoes:'#2b2b2b'}}),
 'Mr Tamaki':R({body:{height:.6,build:.7,skin:'#c98d62'},hair:{style:'spiky',colour:'#1c1714'},eyes:{style:'round'},brows:{style:'thick'},nose:{style:'wide'},mouth:{style:'grin'},outfit:{top:'jacket',topColour:'#e8742a',bottom:'trousers',bottomColour:'#27304d',shoes:'#2b2b2b',hat:'headband',hatColour:'#f4f1ea'}}),
 'Kōji':R({body:{height:.58,build:.5,skin:'#b27449'},hair:{style:'crop',colour:'#3a2618'},eyes:{style:'dot'},brows:{style:'straight'},nose:{style:'button'},mouth:{style:'grin'},outfit:{top:'tee',topColour:'#d8342c',bottom:'shorts',bottomColour:'#2f5f9e',shoes:'#f4f1ea',hat:'kerchief',hatColour:'#2f5f9e'}}),
 'Mr Nakasone':R({body:{height:.42,build:.55,skin:'#dca97e'},hair:{style:'horseshoe',colour:'#d8d6d0'},eyes:{style:'gentle'},brows:{style:'bushy',colour:'#d8d6d0'},nose:{style:'wide'},mouth:{style:'smile'},glasses:{style:'square',colour:'#2b2b2b'},wrinkles:.8,outfit:{top:'polo',topColour:'#d8342c',bottom:'trousers',bottomColour:'#c8b48a',shoes:'#f4f1ea',hat:'cap',hatColour:'#f4f1ea'}}),
 'Mrs Kamiya':R({body:{height:.2,build:.5,skin:'#e8bf98'},hair:{style:'perm',colour:'#9a9a96'},eyes:{style:'round',size:.45},brows:{style:'arched',colour:'#9a9a96'},nose:{style:'dot'},mouth:{style:'small',colour:'#e06a7a'},wrinkles:.8,blush:.4,outfit:{top:'polo',topColour:'#3fa0c8',bottom:'trousers',bottomColour:'#f4f1ea',shoes:'#f4f1ea',hat:'straw',hatColour:'#f4f1ea'}}),
 'Mr Arakaki':R({body:{height:.35,build:.35,skin:'#dca97e'},hair:{style:'bald',colour:'#9a9a96'},eyes:{style:'narrow'},brows:{style:'worried',colour:'#9a9a96'},nose:{style:'hook'},mouth:{style:'flat'},glasses:{style:'round',colour:'#2b2b2b'},wrinkles:.9,outfit:{top:'polo',topColour:'#f4d23c',bottom:'trousers',bottomColour:'#27304d',shoes:'#2b2b2b',hat:'cap',hatColour:'#2f5f9e'}}),
 'Mrs Kinjō':R({body:{height:.32,build:.55,skin:'#dca97e'},hair:{style:'bob',colour:'#3a2618'},eyes:{style:'round'},brows:{style:'arched'},nose:{style:'button'},mouth:{style:'smile',colour:'#b8544a'},blush:.4,wrinkles:.3,outfit:{top:'blouse',topColour:'#e98aa6',pattern:'dots',bottom:'skirt',bottomColour:'#6d7478',shoes:'#9a6a42'}}),
 'Postman Tōma':R({body:{height:.6,build:.4,skin:'#e8bf98'},hair:{style:'sidepart',colour:'#3a2618',flip:true},eyes:{style:'round'},brows:{style:'straight'},nose:{style:'line'},mouth:{style:'smile'},outfit:{top:'polo',topColour:'#2f5f9e',bottom:'trousers',bottomColour:'#27304d',shoes:'#2b2b2b',hat:'cap',hatColour:'#2f5f9e'}}),
});

/** Hats for the residents whose job is a hat. */
const ACCESSORY_HAT={captain:['captain','#f4f1ea'],police:['police','#27304d'],driver:['cap','#2a8a5a'],apron:['kerchief','#f4f1ea'],'headband-scarf':['headband','#efe2c3'],headband:['headband','#e8cf85'],'headband-satchel':['headband','#7b5746']};

/**
 * The recipe for anyone by name: the cast and the neighbours as drawn; everybody else from
 * the colours the resident personalities already give them, with a face made from their
 * name so it is the same face every time they are met.
 */
export function recipeFor(name=''){
 if(CAST_RECIPES[name])return CAST_RECIPES[name];
 if(NEIGHBOUR_RECIPES[name])return NEIGHBOUR_RECIPES[name];
 const style=residentPersonality(name),r=seeded(name),any=list=>list[Math.floor(r()*list.length)];
 const feminine=/female/.test(style.source||'')||/^(Mrs |Aya|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(name);
 const grey=/^#[a-f0-9]{6}$/i.test(style.hair||'')&&parseInt(style.hair.slice(1,3),16)>150;
 const hat=ACCESSORY_HAT[style.accessory]||(style.helmet?['helmet',style.helmet]:['none','#f4f1ea']);
 return normalizeRecipe({name,
  body:{height:.3+r()*.45,build:.3+(Math.min(1.2,style.width||1)-.85)*1.6,skin:style.skin||'#e8bf98'},
  head:{size:.45+r()*.2,shape:r()},
  hair:{style:grey&&!feminine?any(['horseshoe','buzz','crop']):feminine?any(['bob','long','ponytail','bun','sidepart']):any(['crop','sidepart','spiky','buzz']),colour:style.hair||'#1c1714',flip:r()<.5},
  eyes:{style:any(PARTS.eyes),size:.35+r()*.35,spacing:.4+r()*.2,tilt:.4+r()*.2},
  brows:{style:any(PARTS.brows.slice(0,6)),colour:style.hair||'#1c1714'},
  nose:{style:any(PARTS.nose.slice(0,5)),size:.35+r()*.4},
  mouth:{style:any(PARTS.mouth),colour:feminine?'#cc3d52':'#b8544a'},
  glasses:{style:/glasses/.test(style.accessory||'')?'square':'none',colour:'#2b2b2b'},
  facial:{style:!feminine&&r()<.25?any(['moustache','stubble','goatee']):'none',colour:style.hair||'#1c1714'},
  blush:feminine?.4:.15,wrinkles:grey?.7:0,
  outfit:{top:style.accessory==='apron'?'apron':style.accessory==='hawaiian'?'kariyushi':feminine?'blouse':'polo',topColour:style.top||'#3fa0c8',pattern:style.accessory==='hawaiian'?'flowers':'none',
   bottom:feminine&&style.top===style.trousers?'longskirt':'trousers',bottomColour:style.trousers||'#27304d',shoes:'#2b2b2b',hat:hat[0],hatColour:hat[1],accent:style.accent||'#f4d23c'},
 });
}

import {HARBOUR_POLO_OUTFIT} from './outfits.js';
import {residentRecipe} from './wardrobe.js';
import {normalizeRecipe,seeded,PARTS,ageClass} from './recipe.js';
import {PROFILES} from '../people/profiles.js';
import {residentPersonality} from '../people/resident-personalities.js';
import {withTownDials} from './personality.js';

/**
 * Who everybody is, as recipes. Johansson and Thuan are drawn from the photographs the
 * town was built for: he is sixty-odd, bald and sunburnt in his kariyushi shirt; she has
 * her braids with the yellow ties, the side part, round rose glasses and lipstick.
 */
const R=(o)=>normalizeRecipe(withTownDials(o));
const FEMALE_NEIGHBOURS=new Set(['Thuan','Mrs Higa','Mina','Grandmother Higa','Mrs Nakamura','Mrs Yonamine','Mrs Miyagi','Mrs Kamiya','Mrs Kinjō']);
const castSet=entries=>Object.freeze(Object.fromEntries(Object.entries(entries).map(([name,r])=>{
 const female=PROFILES.find(p=>p.name===name)?.female??FEMALE_NEIGHBOURS.has(name);
 return [name,normalizeRecipe({...r,body:{...r.body,silhouette:r.body.silhouette==='neutral'?(female?'feminine':'masculine'):r.body.silhouette}})];
})));

export const CAST_RECIPES=castSet({
 // Photo reference: a blonde adult with side-swept tied hair, arched brows,
 // almond eyes and berry lips. A neutral editable name, not an invented identity.
 'Harbour visitor':R({name:'Harbour visitor',age:'adult',
  body:{height:.56,build:.25,silhouette:'feminine',skin:'#f1cfae'},
  head:{size:.44,shape:.42,form:'oval',jaw:.32,cheeks:.38},
  hair:{style:'sweptponytail',colour:'#caa568',flip:false},
  eyes:{style:'lashes',colour:'#625644',size:.48,width:.58,spacing:.48,height:.52,tilt:.52},
  brows:{style:'arched',colour:'#826447',size:.44,height:.57,tilt:.52},
  nose:{style:'ridge',size:.40,height:.48},
  mouth:{style:'soft',colour:'#a84353',size:.48,width:.54,height:.48},
  blush:.20,freckles:false,mole:false,wrinkles:.12,
  outfit:HARBOUR_POLO_OUTFIT}),
 Johansson:R({name:'Johansson',
  body:{height:.72,build:.72,silhouette:'masculine',skin:'#dc9d7a'},head:{size:.48,shape:.45,form:'square',jaw:.75,cheeks:.55},
  hair:{style:'horseshoe',colour:'#b8b4aa'},
  eyes:{style:'gentle',colour:'#3d6a8a',size:.45,spacing:.52,height:.5,tilt:.45},
  brows:{style:'bushy',colour:'#a8a49a',size:.6,height:.55,tilt:.45},
  nose:{style:'wide',size:.6,height:.48},mouth:{style:'smile',colour:'#a8433e',size:.55,height:.5},
  facial:{style:'stubble',colour:'#b8b4aa'},wrinkles:.7,blush:.35,
  outfit:{top:'kariyushi',topColour:'#7fb0d8',pattern:'flowers',bottom:'shorts',bottomColour:'#c8b48a',footwear:'sandals',shoes:'#6d4a32',accent:'#f4f1ea'},
  swim:{colour:'#2f5f9e'}}),
 Thuan:R({name:'Thuan',accessories:{earrings:'studs',neckwear:'pendant',colour:'#e0b93a'},
  body:{height:.36,build:.35,silhouette:'feminine',skin:'#f1cfae'},head:{size:.48,shape:.48,form:'heart',jaw:.3,cheeks:.62},
  hair:{style:'braids',colour:'#1c1714',flip:false},
  eyes:{style:'lashes',colour:'#2a1d16',size:.78,spacing:.5,height:.48,tilt:.55},
  brows:{style:'arched',colour:'#2a1d16',size:.42,height:.55,tilt:.5},
  nose:{style:'dot',size:.35,height:.5},mouth:{style:'smile',colour:'#cc3d52',size:.42,height:.5},
  glasses:{style:'round',colour:'#e06a7a'},blush:.65,
  outfit:{top:'blouse',topColour:'#f4d23c',pattern:'flowers',bottom:'trousers',bottomColour:'#27304d',shoes:'#f4f1ea',accent:'#f4d23c'},
  swim:{colour:'#e98aa6'}}),
 // Thuan's middle sister: slim, a high ponytail, a plain white tee and blue shorts.
 // Stubborn but friendly: the flat set mouth and straight brows, and the grin under them.
 Thao:R({name:'Thao',body:{height:.44,build:.3,silhouette:'feminine',skin:'#ecc6a0'},head:{size:.46,shape:.4,form:'oval',jaw:.3,cheeks:.4},
  hair:{style:'ponytail',colour:'#1c1714'},eyes:{style:'almond',colour:'#2a1d16',size:.5,spacing:.5,height:.5,tilt:.55},
  brows:{style:'straight',colour:'#1c1714',size:.45,tilt:.42},nose:{style:'button',size:.35},mouth:{style:'flat',colour:'#b8544a',size:.42},blush:.2,
  accessories:{earrings:'studs',colour:'#e0b93a'},
  outfit:{top:'tee',topColour:'#f4f1ea',bottom:'shorts',bottomColour:'#7fb0d8',footwear:'sandals',shoes:'#f4f1ea',accent:'#7fb0d8'}}),
 // Front-Row Books & Workshop, and the two little houses behind it. Nhung is the eldest of
 // the three sisters (Nhung, Thao, Thuan).
 Nhung:R({name:'Nhung',accessories:{earrings:'hoops',pin:true,colour:'#c8a060'},body:{height:.34,build:.38,skin:'#efc9a4'},head:{size:.5,shape:.52,form:'round',jaw:.35,cheeks:.6},
  hair:{style:'bob',colour:'#2e211b'},eyes:{style:'round',colour:'#3a2a1e',size:.6,spacing:.5,height:.5,tilt:.5},
  brows:{style:'arched',colour:'#2e211b',size:.45},nose:{style:'button',size:.35},mouth:{style:'small',colour:'#c4485a',size:.45},
  blush:.45,
  outfit:{hat:'beret',hatColour:'#5f8f6a',top:'jacket',topColour:'#5f8f6a',pattern:'dots',bottom:'longskirt',bottomColour:'#e6d3b0',shoes:'#6b4a2e',accent:'#f4e4c8'}}),
 Reiko:R({name:'Reiko',accessories:{neckwear:'scarf',colour:'#d8342c'},body:{height:.46,build:.42,skin:'#e8bf98'},head:{size:.47,shape:.44,form:'oval',jaw:.4,cheeks:.4},
  hair:{style:'ponytail',colour:'#1c1714'},eyes:{style:'almond',colour:'#2a1d16',size:.5,tilt:.6},
  brows:{style:'straight',colour:'#1c1714',size:.5},nose:{style:'line',size:.4},mouth:{style:'smirk',colour:'#a8433e',size:.45},
  outfit:{top:'smock',topColour:'#3f5f7a',bottom:'trousers',bottomColour:'#2b2b33',shoes:'#2b2b2b',accent:'#f4f1ea'}}),
 // The repair shop: wiry and sun-browned, a dark cap pulled down, a pale blue tee with an
 // orange trim (the roundel on his chest wants a print of its own), black shorts and sandals.
 Chin:R({name:'Chin',body:{height:.5,build:.32,silhouette:'masculine',skin:'#b27449'},head:{size:.47,shape:.42,form:'narrow',jaw:.5,cheeks:.3},
  hair:{style:'buzz',colour:'#1c1714'},eyes:{style:'narrow',colour:'#2a1d16',size:.45},
  brows:{style:'straight',colour:'#1c1714',size:.45},nose:{style:'line',size:.45},mouth:{style:'soft',size:.45},
  outfit:{top:'tee',topColour:'#a9c3df',bottom:'shorts',bottomColour:'#2b2b2b',footwear:'sandals',shoes:'#6d4a32',hat:'cap',hatColour:'#1f2228',accent:'#e8742a'}}),
 Tetsuo:R({name:'Tetsuo',accessories:{pin:true,colour:'#e0b93a'},body:{height:.62,build:.5,skin:'#dca97e'},head:{size:.5,shape:.5,form:'narrow',jaw:.55,cheeks:.35},
  hair:{style:'horseshoe',colour:'#8a8680'},eyes:{style:'sleepy',colour:'#2a1d16',size:.45},
  brows:{style:'bushy',colour:'#8a8680',size:.6},nose:{style:'hook',size:.55},mouth:{style:'flat',size:.8,width:1},
  glasses:{style:'half',colour:'#2b2b2b'},wrinkles:.6,
  outfit:{top:'jacket',topColour:'#6b6f4a',bottom:'trousers',bottomColour:'#4a4238',shoes:'#3a2a1e',accent:'#e8d7b0'}}),
 // Mrs Sato, who cooks the lunch ramen at the corner of Minato's building.
 'Mrs Sato':R({name:'Mrs Sato',body:{height:.22,build:.6,skin:'#e2b48c'},head:{size:.5,shape:.56,form:'round',jaw:.4,cheeks:.6},
  hair:{style:'bun',colour:'#c9c6c0'},eyes:{style:'gentle',colour:'#2a1d16',size:.45},
  brows:{style:'arched',colour:'#b9b6b0',size:.5},nose:{style:'button',size:.45},mouth:{style:'smile',colour:'#b8544a',size:.5},
  glasses:{style:'round',colour:'#6b4a2e'},wrinkles:.7,blush:.3,
  outfit:{top:'apron',topColour:'#ad6178',bottom:'trousers',bottomColour:'#4a4040',shoes:'#2b2b2b',hat:'kerchief',hatColour:'#f4f1ea',accent:'#f4f1ea'}}),
 // Higa-san, who has kept the bandai at Umi-no-yu for thirty years.
 'Mrs Higa':R({name:'Mrs Higa',body:{height:.24,build:.58,skin:'#c99a74'},head:{size:.5,shape:.55,form:'round',jaw:.35,cheeks:.6},
  hair:{style:'perm',colour:'#9a968e'},eyes:{style:'sleepy',colour:'#2a1d16',size:.42},
  brows:{style:'thin',colour:'#8a8680',size:.45},nose:{style:'button',size:.45},mouth:{style:'small',colour:'#a8433e',size:.45},
  glasses:{style:'half',colour:'#6b4a2e'},wrinkles:.75,blush:.25,
  outfit:{top:'blouse',topColour:'#6d8a74',bottom:'skirt',bottomColour:'#3a3a42',shoes:'#2b2b2b',accent:'#f4f1ea'}}),
 // The harbour master, who lives in his office, and Officer Mori at the police box.
 'Harbour master':R({name:'Harbour master',body:{height:.52,build:.68,skin:'#b5805d'},head:{size:.52,shape:.55,form:'round',jaw:.6,cheeks:.5},
  hair:{style:'horseshoe',colour:'#b9b7b0'},eyes:{style:'gentle',colour:'#2a1d16',size:.45},
  brows:{style:'bushy',colour:'#cfcdc6',size:.6},nose:{style:'wide',size:.55},mouth:{style:'flat',size:.5},
  glasses:{style:'round',colour:'#2b2b2b'},facial:{style:'walrus',colour:'#dedbd3'},wrinkles:.55,
  outfit:{top:'jacket',topColour:'#2c3e5c',bottom:'trousers',bottomColour:'#27304d',shoes:'#1c1c24',hat:'captain',hatColour:'#f4f1ea',accent:'#e0b93a'}}),
 'Officer Mori':R({name:'Officer Mori',body:{height:.7,build:.48,skin:'#c79872'},head:{size:.48,shape:.46,form:'oval',jaw:.5,cheeks:.4},
  hair:{style:'crop',colour:'#4a4845'},eyes:{style:'round',colour:'#2a1d16',size:.62},
  brows:{style:'worried',colour:'#3a3835',size:.55},nose:{style:'button',size:.45},mouth:{style:'smile',size:.45},
  blush:.2,wrinkles:.2,
  outfit:{top:'police',topColour:'#273858',bottom:'trousers',bottomColour:'#27304d',shoes:'#1c1c24',hat:'police',hatColour:'#27304d',accent:'#e0b93a'}}),
});

/** The people of the new streets, drawn to their lines in neighbours.js. */
export const NEIGHBOUR_RECIPES=castSet({
 // Vy: a high-school girl in her sailor uniform -- white blouse, red ribbon, navy pleated
 // skirt -- long dark hair tied back. A teen, so the maker's life stage sets her height
 // and proportions (recipe.js AGES).
 Vy:R({name:'Vy',age:'teen',body:{silhouette:'feminine',height:.42,build:.3,skin:'#efd2b4'},head:{size:.5,shape:.42,form:'oval',jaw:.3,cheeks:.5},
  hair:{style:'ponytail',colour:'#1c1714'},eyes:{style:'gentle',colour:'#2a1d16',size:.58,tilt:.5},brows:{style:'thin',colour:'#1c1714',size:.45},
  nose:{style:'dot',size:.32},mouth:{style:'soft',colour:'#c4485a',size:.4},blush:.35,
  outfit:{top:'sailor',topColour:'#f4f1ea',bottom:'pleatedskirt',bottomColour:'#27304d',footwear:'shoes',shoes:'#2b2b2b',accent:'#d8342c'}}),
 // Mr Toguchi, the fish seller: weathered from dawns at the auction, a twisted towel headband,
 // a rubber apron over a work shirt and white boots for the wet ice of his cart.
 'Mr Toguchi':R({name:'Mr Toguchi',body:{height:.4,build:.62,skin:'#c98d62'},head:{size:.48,shape:.6,form:'square',jaw:.6,cheeks:.45},
  hair:{style:'buzz',colour:'#5a5650'},eyes:{style:'squint',colour:'#2a1d16',size:.42,tilt:.48},brows:{style:'bushy',colour:'#5a5650',size:.6},
  nose:{style:'wide',size:.55},mouth:{style:'grin',colour:'#9c5a4a',size:.5},blush:.1,
  outfit:{top:'apron',topColour:'#2f5d74',bottom:'trousers',bottomColour:'#4a4a48',footwear:'boots',shoes:'#f2f0ea',accent:'#f2f0ea',hat:'headband'}}),
 Riku:R({body:{silhouette:'masculine',height:.56,build:.55,skin:'#c89a74'},hair:{style:'crop',colour:'#33271f'},eyes:{style:'round'},brows:{style:'thick'},mouth:{style:'smile'},outfit:{top:'polo',topColour:'#587d83',bottom:'trousers',bottomColour:'#505f65',hat:'helmet',hatColour:'#dabb55'}}),
 'Emi Kado':R({body:{silhouette:'feminine',height:.43,build:.42,skin:'#d1a079'},hair:{style:'ponytail',colour:'#3c2c24'},eyes:{style:'almond'},mouth:{style:'smile'},outfit:{top:'polo',topColour:'#a77e67',bottom:'trousers',bottomColour:'#465d69',hat:'cap',hatColour:'#465d69'}}),
 Haru:R({head:{form:'square',jaw:.72,cheeks:.4},body:{height:.63,build:.58,skin:'#bf875f'},hair:{style:'crop',colour:'#302419'},eyes:{style:'narrow'},brows:{style:'thick'},nose:{style:'wide'},mouth:{style:'smile'},facial:{style:'stubble',colour:'#302419'},outfit:{top:'polo',topColour:'#607c84',bottom:'shorts',bottomColour:'#7b7155',hat:'cap',hatColour:'#c4b486'}}),
 Mina:R({head:{form:'oval',jaw:.35,cheeks:.6},body:{height:.4,build:.45,skin:'#d8ac87'},hair:{style:'bun',colour:'#3b2920'},eyes:{style:'gentle',size:.48},brows:{style:'arched'},nose:{style:'button'},mouth:{style:'smile'},outfit:{top:'apron',topColour:'#849267',bottom:'longskirt',bottomColour:'#5c6e75'}}),
 Jun:R({head:{form:'narrow',jaw:.4,cheeks:.3},body:{height:.53,build:.4,skin:'#dbb393'},hair:{style:'sidepart',colour:'#29241e'},eyes:{style:'almond'},brows:{style:'straight'},nose:{style:'line'},mouth:{style:'small'},glasses:{style:'half',colour:'#5b5c52'},outfit:{top:'polo',topColour:'#e0dac7',bottom:'trousers',bottomColour:'#3e596d'}}),

 'Grandmother Higa':R({head:{size:.48,shape:.5,form:'round',jaw:0.7,cheeks:0.85},body:{height:.2,build:.6,skin:'#dca97e'},hair:{style:'perm',colour:'#d8d6d0'},eyes:{style:'gentle',size:.4},brows:{style:'thin',colour:'#9a9a96'},nose:{style:'button',size:.55},mouth:{style:'smile',size:.45},glasses:{style:'half',colour:'#8a4a3a'},wrinkles:1,blush:.4,outfit:{top:'blouse',topColour:'#8a4ab8',pattern:'flowers',bottom:'longskirt',bottomColour:'#6d7478',shoes:'#2b2b2b'}}),
 'Mr Ōshiro':R({head:{size:.48,shape:.5,form:'narrow',jaw:0.45,cheeks:0.3},body:{height:.4,build:.4,skin:'#b27449'},hair:{style:'buzz',colour:'#d8d6d0'},eyes:{style:'narrow'},brows:{style:'bushy',colour:'#d8d6d0'},nose:{style:'hook',size:.6},mouth:{style:'flat'},facial:{style:'stubble',colour:'#d8d6d0'},wrinkles:.9,outfit:{top:'tee',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#6d7478',shoes:'#2b2b2b',hat:'straw',hatColour:'#e0c078'}}),
 'Uncle Kinjō':R({head:{size:.48,shape:.5,form:'square',jaw:0.8,cheeks:0.65},body:{height:.55,build:.75,skin:'#c98d62'},hair:{style:'crop',colour:'#5a3a22'},eyes:{style:'dot'},brows:{style:'thick'},nose:{style:'wide'},mouth:{style:'wide'},facial:{style:'moustache',colour:'#3a2618'},wrinkles:.5,outfit:{top:'polo',topColour:'#2a8a5a',bottom:'shorts',bottomColour:'#c8b48a',shoes:'#6d4a32',hat:'cap',hatColour:'#d8342c'}}),
 'Mrs Nakamura':R({head:{size:.48,shape:.5,form:'round',jaw:0.55,cheeks:0.8},body:{height:.25,build:.6,skin:'#e8bf98'},hair:{style:'bun',colour:'#5a3a22'},eyes:{style:'round',size:.55},brows:{style:'arched'},nose:{style:'button'},mouth:{style:'grin',colour:'#cc3d52'},blush:.5,wrinkles:.4,outfit:{top:'apron',topColour:'#3fa0c8',bottom:'skirt',bottomColour:'#27304d',shoes:'#f4f1ea',hat:'kerchief',hatColour:'#f4f1ea',accent:'#f4f1ea'}}),
 'Mr Shimabukuro':R({head:{size:.48,shape:.5,form:'narrow',jaw:0.5,cheeks:0.35},body:{height:.5,build:.45,skin:'#dca97e'},hair:{style:'sidepart',colour:'#1c1714'},eyes:{style:'almond'},brows:{style:'straight'},nose:{style:'line'},mouth:{style:'smirk'},facial:{style:'moustache',colour:'#1c1714'},wrinkles:.3,outfit:{top:'smock',topColour:'#f4f1ea',bottom:'trousers',bottomColour:'#2b2b2b',shoes:'#2b2b2b'}}),
 'Mrs Yonamine':R({head:{size:.48,shape:.5,form:'heart',jaw:0.3,cheeks:0.65},body:{height:.3,build:.55,skin:'#c98d62'},hair:{style:'ponytail',colour:'#3a2618'},eyes:{style:'sparkle'},brows:{style:'thick'},nose:{style:'button'},mouth:{style:'wide'},blush:.3,outfit:{top:'apron',topColour:'#2f5f9e',bottom:'trousers',bottomColour:'#27304d',shoes:'#f4f1ea',hat:'headband',hatColour:'#d8342c',accent:'#f4f1ea'}}),
 'Mrs Miyagi':R({head:{size:.48,shape:.5,form:'oval',jaw:0.35,cheeks:0.4},body:{height:.1,build:.4,skin:'#c98d62'},hair:{style:'bun',colour:'#f4f1ea'},eyes:{style:'sleepy'},brows:{style:'thin',colour:'#d8d6d0'},nose:{style:'button'},mouth:{style:'small'},wrinkles:1,outfit:{top:'blouse',topColour:'#f4f1ea',bottom:'longskirt',bottomColour:'#2f5f9e',shoes:'#2b2b2b'}}),
 'Mr Tamaki':R({head:{size:.48,shape:.5,form:'square',jaw:0.7,cheeks:0.4},body:{height:.6,build:.7,skin:'#c98d62'},hair:{style:'spiky',colour:'#1c1714'},eyes:{style:'round'},brows:{style:'thick'},nose:{style:'wide'},mouth:{style:'grin'},outfit:{top:'jacket',topColour:'#e8742a',bottom:'trousers',bottomColour:'#27304d',shoes:'#2b2b2b',hat:'headband',hatColour:'#f4f1ea'}}),
 'Kōji':R({head:{size:.48,shape:.5,form:'oval',jaw:0.65,cheeks:0.4},body:{height:.58,build:.5,skin:'#b27449'},hair:{style:'crop',colour:'#3a2618'},eyes:{style:'dot'},brows:{style:'straight'},nose:{style:'button'},mouth:{style:'grin'},outfit:{top:'tee',topColour:'#d8342c',bottom:'shorts',bottomColour:'#2f5f9e',shoes:'#f4f1ea',hat:'kerchief',hatColour:'#2f5f9e'}}),
 'Mr Nakasone':R({head:{size:.48,shape:.5,form:'square',jaw:0.75,cheeks:0.6},body:{height:.42,build:.55,skin:'#dca97e'},hair:{style:'horseshoe',colour:'#d8d6d0'},eyes:{style:'gentle'},brows:{style:'bushy',colour:'#d8d6d0'},nose:{style:'wide'},mouth:{style:'smile'},glasses:{style:'square',colour:'#2b2b2b'},wrinkles:.8,outfit:{top:'polo',topColour:'#d8342c',bottom:'trousers',bottomColour:'#c8b48a',shoes:'#f4f1ea',hat:'cap',hatColour:'#f4f1ea'}}),
 'Mrs Kamiya':R({head:{size:.48,shape:.5,form:'round',jaw:0.5,cheeks:0.7},body:{height:.2,build:.5,skin:'#e8bf98'},hair:{style:'perm',colour:'#9a9a96'},eyes:{style:'round',size:.45},brows:{style:'arched',colour:'#9a9a96'},nose:{style:'dot'},mouth:{style:'small',colour:'#e06a7a'},wrinkles:.8,blush:.4,outfit:{top:'polo',topColour:'#3fa0c8',bottom:'trousers',bottomColour:'#f4f1ea',shoes:'#f4f1ea',hat:'straw',hatColour:'#f4f1ea'}}),
 'Mr Arakaki':R({head:{size:.48,shape:.5,form:'narrow',jaw:0.3,cheeks:0.25},body:{height:.35,build:.35,skin:'#dca97e'},hair:{style:'bald',colour:'#9a9a96'},eyes:{style:'narrow'},brows:{style:'worried',colour:'#9a9a96'},nose:{style:'hook'},mouth:{style:'flat'},glasses:{style:'round',colour:'#2b2b2b'},wrinkles:.9,outfit:{top:'polo',topColour:'#f4d23c',bottom:'trousers',bottomColour:'#27304d',shoes:'#2b2b2b',hat:'cap',hatColour:'#2f5f9e'}}),
 'Mrs Kinjō':R({head:{size:.48,shape:.5,form:'heart',jaw:0.4,cheeks:0.55},body:{height:.32,build:.55,skin:'#dca97e'},hair:{style:'bob',colour:'#3a2618'},eyes:{style:'round'},brows:{style:'arched'},nose:{style:'button'},mouth:{style:'smile',colour:'#b8544a'},blush:.4,wrinkles:.3,outfit:{top:'blouse',topColour:'#e98aa6',pattern:'dots',bottom:'skirt',bottomColour:'#6d7478',shoes:'#9a6a42'}}),
 'Postman Tōma':R({head:{size:.48,shape:.5,form:'oval',jaw:0.5,cheeks:0.4},body:{height:.6,build:.4,skin:'#e8bf98'},hair:{style:'sidepart',colour:'#3a2618',flip:true},eyes:{style:'round'},brows:{style:'straight'},nose:{style:'line'},mouth:{style:'smile'},outfit:{top:'polo',topColour:'#2f5f9e',bottom:'trousers',bottomColour:'#27304d',shoes:'#2b2b2b',hat:'cap',hatColour:'#2f5f9e'}}),
});

/** Hats for the residents whose job is a hat. */
const ACCESSORY_HAT={captain:['captain','#f4f1ea'],police:['police','#27304d'],driver:['cap','#2a8a5a'],apron:['kerchief','#f4f1ea'],'headband-scarf':['headband','#efe2c3'],headband:['headband','#e8cf85'],'headband-satchel':['headband','#7b5746']};

/**
 * The recipe for anyone by name: the cast and the neighbours as drawn; everybody else from
 * the colours the resident personalities already give them, with a face made from their
 * name so it is the same face every time they are met.
 */
const AGE_OF=new Map(PROFILES.map(p=>[p.name,p.age]));
/** A drawn recipe at the life stage the resident's profile gives them. */
// A recipe always carries its resident's name: the body's own ways (its gait, its seeded
// habits) are keyed by it.
const aged=(recipe,name)=>{const age=ageClass(AGE_OF.get(name)),named=name&&!recipe.name?{...recipe,name}:recipe;return AGE_OF.has(name)&&named.age!==age?normalizeRecipe({...named,age}):named;};
export function recipeFor(name=''){
 const saved=residentRecipe(name);if(saved)return saved;
 if(CAST_RECIPES[name])return aged(CAST_RECIPES[name],name);
 if(NEIGHBOUR_RECIPES[name])return aged(normalizeRecipe(withTownDials(NEIGHBOUR_RECIPES[name],name)),name);
 const style=residentPersonality(name),r=seeded(name),any=list=>list[Math.floor(r()*list.length)];
 const feminine=PROFILES.find(p=>p.name===name)?.female??(/female/.test(style.source||'')||/^(Mrs |Nhung|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(name));
 const grey=/^#[a-f0-9]{6}$/i.test(style.hair||'')&&parseInt(style.hair.slice(1,3),16)>150;
 const hat=ACCESSORY_HAT[style.accessory]||(style.helmet?['helmet',style.helmet]:['none','#f4f1ea']);
 const generated=normalizeRecipe(withTownDials({name,age:ageClass(AGE_OF.get(name)),
  body:{silhouette:feminine?'feminine':'masculine',height:.3+r()*.45,build:.3+(Math.min(1.2,style.width||1)-.85)*1.6,skin:style.skin||'#e8bf98'},
  head:{size:.38+r()*.22,shape:r(),form:any(PARTS.head),jaw:.25+r()*.5,cheeks:.25+r()*.5},
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
 }));
 if(name==='Hana')return normalizeRecipe({...generated,outfit:{...generated.outfit,top:'sailor',topColour:'#f3ecd9',bottom:'pleatedskirt',bottomColour:'#343959',footwear:'shoes',shoes:'#483b36',hat:'none',accent:'#428b88',pattern:'none'}});
 return generated;
}

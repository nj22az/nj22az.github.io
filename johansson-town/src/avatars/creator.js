import {ISLAND_OUTFITS,ISLAND_COSTUMES,outfitAllowedFor,appropriateOutfit} from './outfits.js';
import * as THREE from '../../vendor/three.module.js';
import {buildAvatar,wearsBathTowel} from './build.js';
import {createAvatarAnimator} from './animate.js';
import {drawPart,drawFace,EXPRESSION_NAMES} from './face.js';
import {PALETTE,PARTS,normalizeRecipe,encodeRecipe,decodeRecipe,randomRecipe,AGES} from './recipe.js';
import {POSITION_FEATURES,hitFaceFeature,draggedFaceFields} from './face-position.js';
import {CAST_RECIPES,ORIGINAL_THUAN_RECIPE} from './cast.js';
import {MOVES} from './moves.js';
import {DIALS,DIAL_STEPS,dialStep,stepValue,personalityOf,voiceOf,MONTHS,daysIn,hello} from './personality.js';
import {svg} from '../ui/icons.js';
import {headProfile,shapeHeadPoint} from './head-profile.js';

/** Front silhouettes drawn from the same profile deformation as the game head. */
export function drawFaceFormThumb(canvas,form,skin='#f5d0ae'){
 const ctx=canvas.getContext('2d'),profile=headProfile({form,shape:.5,jaw:.5,cheeks:.5});ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(canvas.width/136,canvas.height/136);ctx.fillStyle=skin;ctx.strokeStyle='#344b57';ctx.lineWidth=3;ctx.beginPath();
 for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,p=shapeHeadPoint({x:Math.sin(a),y:Math.cos(a),z:0},profile),x=68+p.x*44*profile.width,y=67-p.y*49*profile.height;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#344b57';for(const x of [55,81]){ctx.beginPath();ctx.arc(x,65,3.5,0,Math.PI*2);ctx.fill();}ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(68,71);ctx.lineTo(65,79);ctx.lineTo(70,79);ctx.stroke();ctx.beginPath();ctx.arc(68,82,10,.25,Math.PI-.25);ctx.stroke();ctx.restore();
}

/**
 * The Shimanchu maker: where somebody new moves to the island.
 *
 * It runs the way a life-sim's character maker does, in four steps:
 *   1. Choose a face   -- a grid of faces to start from, so nobody begins from a blank.
 *   2. Make them       -- a tab per feature. Each tab has Style (a grid of the parts,
 *                         each drawn on its own), Colour, and Adjust: step buttons that
 *                         move, size, space and tilt the part, a notch at a time.
 *   3. Who are they?   -- birthday, favourite colour, four personality dials that give
 *                         one of sixteen island personalities, a voice and a catchphrase.
 *   4. Say hello       -- they wave and introduce themselves in their own voice.
 * Thumb first: every target is at least 44 px, nothing needs a hover, and the figure
 * turns with a drag. The parts, pictures, names and wording are the town's own.
 *
 * openCreator() works inside the game (from the Town book) and on its own page
 * (creator/), which is what a shared link opens.
 */

const FEATURE_PATHS={
 head:'<path d="M8 21v-3C3 15 3 4 10 3c8-2 11 6 8 12l-3 3v3z"/>',
 hair:'<path d="M5 18C0 7 6 2 12 2s12 5 7 16M5 12c4-1 7-4 9-7 0 5 2 6 5 7M6 12c0 6 3 9 6 9s6-3 6-9"/>',
 eyes:'<path d="M1 12s4-7 9 0c-5 7-9 0-9 0zM14 12s4-7 9 0c-5 7-9 0-9 0z"/><circle cx="5.5" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/>',
 brows:'<path d="M2 9q4-5 8 0M14 9q4-5 8 0M2 13q4-4 8 0M14 13q4-4 8 0"/>',
 nose:'<path d="M10 3L8 13l-3 3q1 4 5 1h4q4 3 5-1l-3-3-2-10"/>',
 mouth:'<path d="M2 12q5-8 10-3 5-5 10 3-10 14-20 0zM2 12h20"/>',
 extras:'<circle cx="6" cy="12" r="5"/><circle cx="18" cy="12" r="5"/><path d="M11 11h2"/>',
 bottom:'<path d="M6 3h12l2 18h-7l-1-11-1 11H4z"/>',
 shoes:'<path d="M5 3h8v10l7 3v5H3v-8z"/>',
 hat:'<path d="M5 14V9a7 7 0 0114 0v5M1 14h22v4H1z"/>',
 accessories:'<path d="M4 4q0 14 8 16 8-2 8-16M9 17l3 5 3-5z"/>'
};
const featureIcon=id=>FEATURE_PATHS[id]?'<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+FEATURE_PATHS[id]+'</svg>':svg(id==='top'?'shirt':'person');

const FACE_TABS=new Set(['head','hair','eyes','brows','nose','mouth','extras','hat','accessories']);
/**
 * What the preview can show someone in: their clothes, or what they would wear at Umi-no-yu --
 * swimwear (the shared bath), for a grown-up the bath towel wrap (yuamigi) with a towel on the
 * head (behind the noren), and the after-bath clothes of the lobby (outfits.js AFTERBATH).
 * Children keep their swimwear and their clothes there, so the towel and the after-bath clothes
 * are offered to grown-ups only.
 */
export const PREVIEW_OUTFITS=Object.freeze([['clothes','Clothes'],['swim','Swimwear'],['towel','Bath towel'],['afterbath','After the bath']]);
export const BATH_CHILD_NOTE='At Umi-no-yu children wear swimwear behind the noren and their own clothes in the lobby. The bath towel wrap and the after-bath clothes are for grown-ups.';
const GROWN_UP_OUTFITS=new Set(['towel','afterbath']);
/** The preview's outfits for this recipe, the grown-ups' ones disabled (and saying why) for a child or teenager. */
export function previewOutfits(recipe){
 const grown=wearsBathTowel(normalizeRecipe(recipe));
 return PREVIEW_OUTFITS.map(([value,label])=>{const off=GROWN_UP_OUTFITS.has(value)&&!grown;return {value,label:off?label+' (grown-ups)':label,disabled:off};});
}
const LABEL={
 towel:'Bath towel',swimwear:'Swimwear',
 crop:'Crop',sidepart:'Side part',bob:'Bob',long:'Long',sweptponytail:'Swept low ponytail',ponytail:'Ponytail',braids:'Original Thuận braids',longbraids:'Twin braids · Thuan',bun:'Bun',spiky:'Spiky',perm:'Perm',buzz:'Buzz',afro:'Afro',horseshoe:'Horseshoe',bald:'Bald',
 pixie:'Pixie',shoulder:'Shoulder',curtains:'Centre part',slick:'Slicked back',mullet:'Mullet',topknot:'Topknot',pigtails:'Pigtails',twinbuns:'Twin buns',
 round:'Round',dot:'Dot',almond:'Almond',sleepy:'Sleepy',lashes:'Lashes',narrow:'Narrow',sparkle:'Sparkle',gentle:'Gentle',
 doe:'Doe',cat:'Cat',droopy:'Droopy',heavy:'Heavy-lidded',bright:'Bright',tired:'Tired',squint:'Squint',starry:'Starry',
 angled:'Angled',short:'Short',rounded:'Rounded',tapered:'Tapered',feathered:'Feathered',maro:'Maro',
 pointed:'Pointed',snub:'Snub',bulb:'Bulb',ridge:'Ridge',
 teeth:'Teeth',open:'Open',lopsided:'Lopsided',tongue:'Tongue out',buck:'Buck teeth',soft:'Soft',
 handlebar:'Handlebar',pencil:'Pencil',chinstrap:'Chinstrap',
 straight:'Straight',arched:'Arched',thick:'Thick',thin:'Thin',worried:'Worried',bushy:'Bushy',none:'None',
 button:'Button',line:'Line',wide:'Wide',hook:'Hook',
 smile:'Smile',flat:'Flat',grin:'Grin',small:'Small',smirk:'Smirk',pout:'Pout',
 square:'Square',oval:'Oval',heart:'Heart',sun:'Shades',half:'Half-rim',
 moustache:'Moustache',walrus:'Walrus',stubble:'Stubble',beard:'Beard',goatee:'Goatee',
 lighthouse:'Lighthouse costume',lantern:'Lantern costume',reef:'Reef costume',sailorlong:'Long-sleeved sailor',police:'Police jacket',sailor:'Sailor shirt',hoodie:'Hooded sweater',cardigan:'Cardigan',overalls:'Work overalls',sundress:'Sundress bodice',festival:'Festival coat',widepants:'Wide trousers',cropped:'Cropped trousers',culottes:'Culottes',pleatedskirt:'Pleated skirt',squid:'Squid cap',teapot:'Teapot hat',sunflower:'Sunflower bonnet',paperboat:'Paper-boat hat',mountain:'Mount Aoba hat',
 tank:'Tank top',underwear:'Underwear',barefoot:'Bare feet',sneakers:'Sneakers',sandals:'Sandals',shoes:'Shoes',
 tee:'T-shirt',kariyushi:'Kariyushi',contrastpolo:'Contrast-collar polo',polo:'Polo',blouse:'Blouse',jacket:'Jacket',apron:'Apron',smock:'Smock',
 boots:'Boots',shorts:'Shorts',trousers:'Trousers',skirt:'Skirt',longskirt:'Long skirt',
 cap:'Cap',captain:'Captain',police:'Police',helmet:'Helmet',straw:'Straw hat',headband:'Headband',kerchief:'Kerchief',
 beanie:'Beanie',beret:'Beret',bucket:'Bucket hat',ribbon:'Hair bow',studs:'Studs',hoops:'Hoops',pendant:'Pendant',scarf:'Scarf',
 flowers:'Flowers',stripes:'Stripes',dots:'Dots',
 child:'Child',teen:'Teen',adult:'Adult',elder:'Elder',
};

/**
 * Every feature tab. Each control lives on one page of the tab: 'style', 'colour' or
 * 'adjust'. `at` is where in the recipe a control writes, as 'section.field'.
 * Steppers carry the words for their two buttons.
 */
export const TABS=[
 {id:'body',name:'Body',controls:[
  {kind:'chips',page:'style',at:'age',label:'Age',list:AGES},
  {kind:'chips',page:'style',at:'body.proportion',label:'Proportions',list:['classic','rounded']},
  {kind:'chips',page:'style',at:'body.silhouette',label:'Silhouette',list:PARTS.silhouette},
  {kind:'colours',page:'colour',at:'body.skin',label:'Skin',palette:PALETTE.skin},
  {kind:'stepper',page:'adjust',at:'body.height',label:'Height',less:'Shorter',more:'Taller'},
  {kind:'stepper',page:'adjust',at:'body.build',label:'Build',less:'Slimmer',more:'Sturdier'}]},
 {id:'head',name:'Face',controls:[
  {kind:'face-forms',page:'style',at:'head.form',label:'Face shape',list:PARTS.head},
  {kind:'toggle',page:'style',at:'freckles',label:'Freckles'},{kind:'toggle',page:'style',at:'mole',label:'Beauty spot'},
  {kind:'position',page:'adjust',at:'moleSpot.height',horizontal:'moleSpot.x',label:'Beauty spot',when:r=>r.mole},
  {kind:'stepper',page:'adjust',at:'moleSpot.size',label:'Spot size',less:'Smaller spot',more:'Bigger spot',when:r=>r.mole},
  {kind:'colours',page:'colour',at:'body.skin',label:'Skin',palette:PALETTE.skin},
  {kind:'stepper',page:'adjust',at:'head.size',label:'Head size',less:'Smaller head',more:'Bigger head'},
  {kind:'stepper',page:'adjust',at:'head.shape',label:'Width',less:'Narrower',more:'Broader'},
  {kind:'stepper',page:'adjust',at:'head.jaw',label:'Jaw',less:'Narrower jaw',more:'Wider jaw'},
  {kind:'stepper',page:'adjust',at:'head.cheeks',label:'Cheeks',less:'Slimmer cheeks',more:'Fuller cheeks'},
  {kind:'slider',page:'adjust',at:'head.roundness',label:'Face roundness',low:'Oval',high:'Round'},
  {kind:'stepper',page:'adjust',at:'blush',label:'Rosy cheeks',less:'Less rosy',more:'More rosy'},
  {kind:'stepper',page:'adjust',at:'wrinkles',label:'Laughter lines',less:'Fewer lines',more:'More lines'}]},
 {id:'hair',name:'Hair',controls:[
  {kind:'parts',page:'style',at:'hair.style',list:PARTS.hair,draw:'head'},
  {kind:'toggle',page:'style',at:'hair.flip',label:'Part on the other side'},
  {kind:'colours',page:'colour',at:'hair.colour',label:'Colour',palette:PALETTE.hair},
  {kind:'colours',page:'colour',at:'hair.tieColour',label:'Braid ties',palette:PALETTE.cloth,when:r=>['braids','longbraids'].includes(r.hair.style)},
  {kind:'slider',page:'adjust',at:'hair.length',label:'Braid length',low:'Upper chest',high:'Past waist',when:r=>r.hair.style==='longbraids'},
  {kind:'slider',page:'adjust',at:'hair.volume',label:'Braid volume',low:'Fine',high:'Full',when:r=>r.hair.style==='longbraids'}]},
 {id:'eyes',name:'Eyes',controls:[
  {kind:'parts',page:'style',at:'eyes.style',list:PARTS.eyes,draw:'eyes'},
  {kind:'colours',page:'colour',at:'eyes.colour',label:'Colour',palette:PALETTE.eyes},
  {kind:'position',page:'adjust',at:'eyes.height',horizontal:'eyes.spacing',paired:true},
  {kind:'stepper',page:'adjust',at:'eyes.size',label:'Size',less:'Smaller',more:'Bigger'},
  {kind:'stepper',page:'adjust',at:'eyes.width',label:'Stretch',less:'Taller eyes',more:'Wider eyes'},
  {kind:'stepper',page:'adjust',at:'eyes.tilt',label:'Tilt',less:'Tilt down',more:'Tilt up'}]},
 {id:'brows',name:'Brows',controls:[
  {kind:'parts',page:'style',at:'brows.style',list:PARTS.brows,draw:'brows'},
  {kind:'colours',page:'colour',at:'brows.colour',label:'Colour',palette:PALETTE.hair},
  {kind:'position',page:'adjust',at:'brows.height',horizontal:'brows.spacing',paired:true},
  {kind:'stepper',page:'adjust',at:'brows.size',label:'Size',less:'Smaller',more:'Bigger'},
  {kind:'stepper',page:'adjust',at:'brows.tilt',label:'Tilt',less:'Tilt down',more:'Tilt up'}]},
 {id:'nose',name:'Nose',controls:[
  {kind:'parts',page:'style',at:'nose.style',list:PARTS.nose,draw:'nose'},
  {kind:'position',page:'adjust',at:'nose.height',horizontal:'nose.x'},
  {kind:'stepper',page:'adjust',at:'nose.size',label:'Size',less:'Smaller',more:'Bigger'}]},
 {id:'mouth',name:'Mouth',controls:[
  {kind:'parts',page:'style',at:'mouth.style',list:PARTS.mouth,draw:'mouth'},
  {kind:'colours',page:'colour',at:'mouth.colour',label:'Lips',palette:PALETTE.lips},
  {kind:'position',page:'adjust',at:'mouth.height',horizontal:'mouth.x'},
  {kind:'stepper',page:'adjust',at:'mouth.size',label:'Size',less:'Smaller',more:'Bigger'},
  {kind:'stepper',page:'adjust',at:'mouth.width',label:'Width',less:'Narrower',more:'Wider'}]},
 {id:'extras',name:'Glasses & beard',controls:[
  {kind:'parts',page:'style',at:'glasses.style',label:'Glasses',list:PARTS.glasses,draw:'glasses'},
  {kind:'toggle',page:'style',at:'glasses.enabled',label:'Wear glasses'},
  {kind:'parts',page:'style',at:'facial.moustache',label:'Moustache',list:PARTS.moustache,draw:'moustache'},
  {kind:'parts',page:'style',at:'facial.beard',label:'Beard',list:PARTS.beard,draw:'beard'},
  {kind:'colours',page:'colour',at:'glasses.colour',label:'Frames',palette:['#2b2b2b','#8a4a3a','#c8a060','#e06a7a','#3d6a8a','#d8342c']},
  {kind:'colours',page:'colour',at:'facial.colour',label:'Moustache & beard',palette:PALETTE.hair},
  {kind:'stepper',page:'adjust',at:'glasses.size',label:'Glasses size',less:'Smaller glasses',more:'Bigger glasses'},
  {kind:'stepper',page:'adjust',at:'glasses.height',label:'Glasses height',less:'Lower glasses',more:'Higher glasses'},
  {kind:'stepper',page:'adjust',at:'facial.size',label:'Whiskers size',less:'Smaller moustache and beard',more:'Bigger moustache and beard'},
  {kind:'stepper',page:'adjust',at:'facial.height',label:'Whiskers height',less:'Lower moustache',more:'Higher moustache'}]},
 // The wardrobe. Everyone has the base layer on (tank top, underwear, bare feet);
 // clothes are added over it, and the first tile of each grid takes them off again.
 {id:'top',name:'Top',wardrobe:true,controls:[
  {kind:'parts',page:'style',at:'outfit.top',list:PARTS.top,draw:'figure'},
  {kind:'chips',page:'style',at:'outfit.pattern',list:['none','flowers','stripes','dots'],label:'Print'},
  {kind:'colours',page:'colour',at:'outfit.topColour',label:'Colour',palette:PALETTE.cloth},
  {kind:'colours',page:'colour',at:'outfit.accent',label:'Ribbons & print',palette:PALETTE.cloth}]},
 {id:'bottom',name:'Bottoms',wardrobe:true,controls:[
  {kind:'parts',page:'style',at:'outfit.bottom',list:PARTS.bottom,draw:'figure'},
  {kind:'colours',page:'colour',at:'outfit.bottomColour',label:'Colour',palette:PALETTE.cloth},
  {kind:'colours',page:'colour',at:'swim.colour',label:'Swimwear, for the onsen',palette:PALETTE.cloth},
  // What they wear behind Umi-no-yu's noren: grown-ups choose; children wear swimwear. (Past the bath doors, in the shared
  // bath, everybody wears swimwear.)
  {kind:'chips',page:'style',at:'swim.bath',list:['towel','swimwear'],label:'Behind the noren at Umi-no-yu',when:r=>wearsBathTowel(r)},
  {kind:'note',page:'style',text:BATH_CHILD_NOTE,when:r=>!wearsBathTowel(r)}]},
 {id:'shoes',name:'Shoes',wardrobe:true,controls:[
  {kind:'parts',page:'style',at:'outfit.footwear',list:PARTS.footwear,draw:'feet'},
  {kind:'colours',page:'colour',at:'outfit.shoes',label:'Colour',palette:['#6d4a32','#2b2b2b','#f4f1ea','#d8342c','#3fa0c8','#f4d23c','#8fbf4a','#e98aa6']}]},
 {id:'hat',name:'Hats & bows',wardrobe:true,controls:[
  {kind:'parts',page:'style',at:'outfit.hat',list:PARTS.hat,draw:'head'},
  {kind:'colours',page:'colour',at:'outfit.hatColour',label:'Colour',palette:PALETTE.cloth}]},
 {id:'accessories',name:'Accessories',wardrobe:true,controls:[
  {kind:'parts',page:'style',at:'accessories.earrings',label:'Earrings',list:PARTS.earrings,draw:'head'},
  {kind:'parts',page:'style',at:'accessories.neckwear',label:'Neckwear',list:PARTS.neckwear,draw:'figure'},
  {kind:'toggle',page:'style',at:'accessories.pin',label:'Lapel pin'},
  {kind:'colours',page:'colour',at:'accessories.colour',label:'Earring and pin colour',palette:PALETTE.cloth},
  {kind:'colours',page:'colour',at:'accessories.necklaceColour',label:'Necklace colour',palette:PALETTE.cloth}]},
];
const PAGES=[['style','Style'],['colour','Colour'],['adjust','Adjust']];
const STEPS=[['start','Choose a face'],['look','Make them'],['profile','Who are they?'],['hello','Say hello']];
/** How far one press of a step button moves a value (0–1). */
const NOTCH=1/16;

const POSES=[...new Map([...[['idle','Stand'],['Wave','Wave'],['Hop','Happy'],['walk','Walk'],['Kachashi','Dance'],['Bow','Bow'],['Heart','Heart'],['Peace','Cheek'],['Coy','Coy'],['Tada','Ta-da!'],['HandsOnHips','Hips'],['HeelKick','Heel kick'],['EvilLaugh','Evil laugh'],['sit','Sit'],['lie','Knocked out']],...MOVES].map(entry=>[entry[0],entry])).values()];

const get=(r,at)=>at.split('.').reduce((o,k)=>o?.[k],r);
function set(r,at,value){const keys=at.split('.'),last=keys.pop();let o=r;for(const k of keys)o=o[k];o[last]=value;}
/** Keeps the parts of a recipe that are who someone is when their looks change. */
const keepSelf=(looks,self)=>normalizeRecipe({...looks,name:self.name,profile:self.profile});

const CSS=`
.shm{position:fixed;inset:0;z-index:4000;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden;background:radial-gradient(circle at 20% 10%,#fffbe8,#fff1cf 45%,#ffe4b8);color:var(--isle-ink,#3b3f55);font-family:var(--isle-font,"M PLUS Rounded 1c",system-ui,sans-serif);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.shm *{box-sizing:border-box;min-width:0}
.shm button,.shm select,.shm input{font-family:inherit}
.shm button{cursor:pointer}
.shm button:focus-visible,.shm input:focus-visible,.shm select:focus-visible,.shm textarea:focus-visible{outline:3px solid #2a8fcc;outline-offset:2px}
.shm button:disabled{opacity:.4;cursor:default}
.shm .ui-icon{flex-shrink:0;width:20px;height:20px}
.shm-top{display:flex;align-items:center;gap:10px;padding:max(8px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left))}
.shm-top h2{margin:0;font-size:20px;white-space:nowrap}
.shm-top h2 small{display:block;font-size:12px;font-weight:700;color:#8a7a5a;letter-spacing:.04em}
.shm-name{flex:1;max-width:260px;margin-left:auto;height:44px;padding:0 14px;border:2px solid #f0dcb0;border-radius:22px;background:#fff;color:inherit;font-size:16px;font-weight:700}
.shm-pill,.shm-save,.shm-select,.shm-next{min-height:44px;padding:8px 16px;border:2px solid #f0dcb0;border-radius:22px;background:#fff;color:inherit;font-size:14px;font-weight:800}
.shm-pill{display:inline-flex;align-items:center;justify-content:center;gap:7px}
.shm-main{display:grid;grid-template-columns:minmax(0,1fr) clamp(112px,32%,340px);gap:12px;min-height:0;padding:0 max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left))}
.shm[data-step=hello] .shm-main{grid-template-columns:minmax(0,1fr)}
.shm[data-step=hello] .shm-panel{display:none}
.shm-side{display:flex;flex-direction:column;gap:8px;min-height:0}
.shm-stage{position:relative;flex:0 1 auto;width:100%;aspect-ratio:3/4;max-height:100%;min-height:0;overflow:hidden;border:3px solid #f0dcb0;border-radius:24px;background:radial-gradient(circle at 50% 35%,#fffdf6,#ffeccc)}
.shm[data-step=hello] .shm-stage{flex:1;aspect-ratio:auto;border:0;background:transparent}
.shm-stage>canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.shm-dice{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.shm-dice button{display:grid;place-items:center;width:44px;height:44px;border:2px solid #f0dcb0;border-radius:50%;background:#fff;color:inherit}
.shm-poses{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px}
.shm-poses .shm-select{flex:1 1 90px;min-width:0}
.shm[data-focus=face] .shm-poses,.shm[data-step=hello] .shm-poses,.shm[data-step=hello] .shm-dice{display:none}
.shm[data-step=start] .shm-panel>.shm-category-wrap,.shm[data-step=profile] .shm-panel>.shm-category-wrap,.shm[data-step=start] .shm-pages,.shm[data-step=profile] .shm-pages{display:none}
.shm-note{margin:0 0 8px;font-size:13px;line-height:1.45;color:#6b5d44}
.shm-undress{margin-bottom:6px}
.shm-bubble{position:absolute;left:50%;bottom:14px;width:min(560px,calc(100% - 24px));transform:translateX(-50%);padding:16px 20px;border:3px solid #3b3f55;border-radius:24px;background:#fffdf6;font-size:18px;font-weight:700;line-height:1.45;white-space:pre-line;box-shadow:0 6px 0 #3b3f5522}
.shm-bubble[hidden]{display:none}
.shm-panel{display:grid;grid-template-rows:auto auto minmax(0,1fr);min-height:0;margin:0;border:3px solid #f0dcb0;border-radius:26px;background:#fffdf6;overflow:hidden}
.shm-tabs{display:flex;overflow-x:auto;padding:8px;gap:6px;border-bottom:2px solid #f6e8c8;scrollbar-width:none}
.shm-tabs button{flex:0 0 auto;min-height:44px;padding:8px 14px;border:0;border-radius:22px;background:#fff4dc;color:inherit;font-size:13px;font-weight:800}
.shm-tabs button[aria-selected=true]{background:#ff9d3c;color:#fff;box-shadow:0 3px 0 #d9741a}
.shm-category{display:none;padding:8px 12px;border-bottom:2px solid #f6e8c8;align-items:center;gap:10px;font-size:13px;font-weight:800}
.shm-category select{flex:1;width:100%}
.shm-pages{display:flex;gap:4px;margin:8px 12px 0;padding:4px;border-radius:24px;background:#f6ecd6}
.shm-pages button{flex:1;min-height:40px;border:0;border-radius:20px;background:transparent;color:#6b5d44;font-size:13px;font-weight:800}
.shm-pages button[aria-selected=true]{background:#fff;color:#3b3f55;box-shadow:0 2px 0 #e3d2ac}
.shm-pages[hidden]{display:none}
.shm-body{overflow-y:auto;overscroll-behavior:contain;padding:12px 16px 20px;scrollbar-width:thin}
.shm-body h4{margin:16px 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a7a5a}
.shm-body h4:first-child{margin-top:0}
.shm-face-picker{display:grid;grid-template-columns:minmax(0,1fr) 50px;gap:12px;align-items:start}.shm-face-picker .shm-face-forms{grid-template-columns:repeat(3,minmax(0,1fr))}.shm-face-skin{flex-direction:column;flex-wrap:nowrap!important;gap:10px!important}.shm-face-forms button canvas{width:min(64px,100%);height:auto;aspect-ratio:1}
.shm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:10px}
.shm-grid button{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:92px;padding:6px 4px;border:3px solid #f0dcb0;border-radius:18px;background:#fff;color:inherit;font-size:11px;font-weight:800}
.shm-grid button canvas{width:64px;height:64px;border-radius:14px;background:#f3ecdc}
.shm-grid button[aria-pressed=true]{border-color:#ff9d3c;background:#fff4e2}
.shm-grid button[aria-pressed=true]::after{content:"✓";position:absolute;top:-8px;right:-8px;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#ff9d3c;color:#fff;font-size:13px}
.shm-faces{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}
.shm-faces button canvas{width:84px;height:84px;border-radius:50%}
.shm-swatches{display:flex;flex-wrap:wrap;gap:10px;padding:3px}
.shm-swatches button{width:44px;height:44px;border:4px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #f0dcb0}
.shm-swatches button[aria-pressed=true]{box-shadow:0 0 0 4px #ff9d3c}
.shm-step{display:grid;grid-template-columns:96px 44px minmax(0,1fr) 44px;align-items:center;gap:8px;margin:8px 0}
.shm-step>span{font-size:12px;font-weight:800}
.shm-step button,.shm-pad button{display:grid;place-items:center;width:44px;height:44px;border:2px solid #f0dcb0;border-radius:50%;background:#fff;color:inherit;font-size:20px;font-weight:900;line-height:1}
.shm-meter{display:flex;gap:3px;height:12px}
.shm-meter i{flex:1;border-radius:6px;background:#efe3c8}
.shm-meter i.on{background:#ff9d3c}
.shm-pad{display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(3,44px);gap:6px;justify-content:center;margin:4px 0 10px}
.shm-pad .up{grid-area:1/2}.shm-pad .left{grid-area:2/1}.shm-pad .right{grid-area:2/3}.shm-pad .down{grid-area:3/2}
.shm-pad b{grid-area:2/2;display:grid;place-items:center;font-size:11px;color:#8a7a5a}
.shm-chips{display:flex;flex-wrap:wrap;gap:8px}
.shm-chips button,.shm-toggle{min-height:44px;padding:8px 16px;border:2px solid #f0dcb0;border-radius:22px;background:#fff;color:inherit;font-size:13px;font-weight:800}
.shm-chips button[aria-pressed=true],.shm-toggle[aria-pressed=true]{background:#fff4e2;border-color:#ff9d3c}
.shm-toggle{display:block;margin:10px 0}
.shm-dial{margin:10px 0 14px}
.shm-dial>div:first-child{display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:#8a7a5a;margin-bottom:4px}
.shm-dial>div:first-child strong{color:#3b3f55}
.shm-pips{display:flex;gap:4px}
.shm-pips button{flex:1;min-height:44px;border:2px solid #f0dcb0;border-radius:12px;background:#fff}
.shm-pips button.on{background:#ffd9a8;border-color:#ffb766}
.shm-pips button[aria-pressed=true]{background:#ff9d3c;border-color:#d9741a}
.shm-type{margin:6px 0 14px;padding:14px 16px;border-radius:20px;border:3px solid #d9b781;background:#fff6df;color:#35434d;font-weight:800}.shm-type small{font-size:10px;letter-spacing:.1em;color:#7f715e}.shm-persona-moment{margin-top:12px}.shm-persona-moment b{font-size:12px}.shm-persona-moment p{font-size:13px;line-height:1.45;margin:3px 0 0;font-weight:500}
.shm-type strong{display:block;font-size:20px}
.shm-type span{font-size:13px;font-weight:700;opacity:.95}
.shm-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.shm-row select{flex:1;min-width:120px}
.shm-text{width:100%;height:44px;padding:0 14px;border:2px solid #f0dcb0;border-radius:22px;background:#fff;color:inherit;font-size:16px}
.shm-foot{display:flex;gap:8px;align-items:center;padding:8px max(12px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
.shm-dots{display:flex;gap:6px;margin:0 auto}
.shm-dots button{display:grid;place-items:center;min-width:44px;height:44px;padding:0 10px;border:2px solid #f0dcb0;border-radius:22px;background:#fff;color:#8a7a5a;font-size:13px;font-weight:800}
.shm-dots button[aria-current=step]{background:#3b3f55;border-color:#3b3f55;color:#fff}
.shm-dots button span{display:none;margin-left:6px}
.shm-dots button[aria-current=step] span{display:inline}
.shm-next{background:#ff9d3c;border-color:#d9741a;color:#fff;box-shadow:0 3px 0 #d9741a}
.shm-save{background:#45b7f0;border-color:#2a8fcc;color:#fff;box-shadow:0 3px 0 #2a8fcc}
.shm-share{position:absolute;inset:0;z-index:1;display:grid;place-items:center;padding:12px;background:#25374680}
.shm-share>div{width:min(520px,100%);max-height:100%;overflow-y:auto;overscroll-behavior:contain;padding:20px;border:3px solid #f0dcb0;border-radius:24px;background:#fffdf6}
.shm-share h3{margin:0 0 8px}
.shm-share p{margin:0 0 12px;font-size:13px;line-height:1.5}
.shm-share textarea{width:100%;height:72px;padding:10px;border:2px solid #f0dcb0;border-radius:14px;background:#fff;font:16px ui-monospace,monospace;resize:none;overflow-wrap:anywhere}
.shm-share .row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 16px}
@media(max-width:760px){
 .shm-top h2{font-size:16px}
 .shm-tabs{display:none}.shm-category{display:flex}
 .shm-body{padding:12px}
 .shm-step{grid-template-columns:72px 44px minmax(0,1fr) 44px}
 .shm-dots button[aria-current=step] span{display:none}
}
@media(max-width:520px){.shm-top h2{display:none}.shm-name{max-width:none}.shm-foot .shm-pill{padding:8px 10px}.shm-dots{gap:3px}.shm-dots button{min-width:36px;padding:0 6px}.shm-main{gap:8px;padding:0 8px}.shm-grid{grid-template-columns:repeat(auto-fill,minmax(68px,1fr));gap:8px}.shm-step{grid-template-columns:56px 40px minmax(0,1fr) 40px;gap:4px}.shm-step button{width:40px;height:40px}}
@media(max-height:500px){.shm-top h2 small{display:none}.shm-pages{margin:4px 8px 0}.shm-pages button{min-height:34px}.shm-category{padding:4px 8px}.shm-top,.shm-foot{padding-top:4px;padding-bottom:4px}.shm-tabs{display:none}.shm-category{display:flex}.shm-dots button span{display:none!important}}
/* Part-led studio: feature rail, large figure, and a compact choices tray. */
.shm[data-step=look]{background:radial-gradient(ellipse at 45% 38%,#f2f0e9,#d9d7cf);color:#303b43}
.shm-part-title,.shm-palette{display:none}
.shm[data-step=look] .shm-main{grid-template-columns:76px minmax(0,1fr) 340px;gap:18px}
.shm-main>.shm-tabs{display:none}
.shm[data-step=look] .shm-main>.shm-tabs{display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;padding:0 4px 8px;border:0;gap:7px;scrollbar-width:thin}
.shm[data-step=look] .shm-tabs button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex:0 0 auto;min-height:62px;padding:6px 2px;border:1px solid #b6b8b6;border-radius:12px;background:#f9f9f6;font-size:10px;box-shadow:0 2px 2px #0002}
.shm[data-step=look] .shm-tabs .ui-icon{width:30px;height:30px}
.shm[data-step=look] .shm-tabs button[aria-selected=true]{background:#dbe9e7;color:#203f3c;border:2px solid #498579;box-shadow:none}
.shm[data-step=look] .shm-side{grid-column:2;grid-row:1}
.shm[data-step=look] .shm-stage{flex:1;aspect-ratio:auto;max-height:none;border:0;background:transparent;border-radius:0}
.shm[data-step=look] .shm-panel{grid-column:3;grid-row:1;background:#ffffff35;border:0;border-radius:18px;grid-template-rows:auto auto auto minmax(0,1fr) auto}
.shm[data-step=look] .shm-part-title{display:block;margin:14px 16px 4px;font-size:32px;text-transform:uppercase;letter-spacing:.04em}
.shm[data-step=look] .shm-category{display:none}
.shm[data-step=look] .shm-pages{background:#c9cecb80;margin:8px 12px}
.shm[data-step=look] .shm-body{padding:8px 14px 14px}
.shm[data-step=look] .shm-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.shm[data-step=look] .shm-grid button{border:2px solid #d5d6d1;border-radius:13px;background:#f9f9f5;font-size:11px;min-height:96px}
.shm[data-step=look] .shm-grid button canvas{background:#eeeee8}
.shm[data-step=look] .shm-grid button[aria-pressed=true]{border-color:#498579;background:#e6f1ee}
.shm[data-step=look] .shm-grid button[aria-pressed=true]::after{background:#498579}
.shm[data-step=look] .shm-face-picker{display:block}.shm[data-step=look] .shm-face-skin{display:none}
.shm[data-step=look] .shm-palette:not([hidden]){display:block;padding:10px 16px 14px;border-top:1px solid #bbc1bb}
.shm-palette h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.shm[data-step=look] .shm-swatches{gap:10px}
.shm[data-step=look] .shm-swatches button{border-radius:8px;box-shadow:0 0 0 1px #b9bfba;border:2px solid #f9f9f5}
.shm[data-step=look] .shm-swatches button[aria-pressed=true]{box-shadow:0 0 0 3px #498579}
.shm[data-step=look] .shm-dice button{border-color:#b9bfba;background:#f9f9f5}
.shm[data-step=hello] .shm-side{grid-column:1}
@media(max-width:760px){
 .shm[data-step=look] .shm-main{grid-template-columns:56px minmax(0,1fr);grid-template-rows:minmax(220px,42%) minmax(0,1fr);gap:8px}
 .shm[data-step=look] .shm-main>.shm-tabs{grid-column:1;grid-row:1/3}
 .shm[data-step=look] .shm-tabs button{min-height:56px;font-size:9px;border-radius:10px}
 .shm[data-step=look] .shm-tabs .ui-icon{width:25px;height:25px}
 .shm[data-step=look] .shm-panel{grid-column:2;grid-row:2;border-radius:12px;grid-template-rows:auto auto auto minmax(0,1fr) auto}
 .shm[data-step=look] .shm-side{grid-column:2;grid-row:1;position:relative;gap:0}
 .shm[data-step=look] .shm-dice{position:absolute;bottom:0;left:0;gap:4px}
 .shm[data-step=look] .shm-dice button{width:36px;height:36px}
 .shm[data-step=look] .shm-part-title{font-size:20px;margin:6px 10px 0}
 .shm[data-step=look] .shm-pages{margin:4px 8px}.shm[data-step=look] .shm-pages button{min-height:36px}
 .shm[data-step=look] .shm-body{padding:8px}.shm[data-step=look] .shm-palette:not([hidden]){padding:8px 10px}
 .shm[data-step=look] .shm-grid{gap:6px}.shm[data-step=look] .shm-grid button{min-height:82px}.shm[data-step=look] .shm-grid button canvas{width:52px;height:52px}
 .shm[data-step=look] .shm-swatches{gap:7px}.shm[data-step=look] .shm-swatches button{width:36px;height:36px}
}
@media(max-height:500px) and (min-width:761px){.shm[data-step=look] .shm-main{grid-template-columns:60px minmax(0,1fr) 300px}.shm[data-step=look] .shm-tabs button{min-height:54px}.shm[data-step=look] .shm-part-title{font-size:22px;margin:4px 12px 0}.shm[data-step=look] .shm-palette:not([hidden]){padding:6px 12px}}

`;

/**
 * @param {object} options
 * @param {object} [options.recipe] who to start from
 * @param {(recipe:object)=>void} [options.onSave]
 * @param {()=>void} [options.onClose]
 * @param {string} [options.saveLabel]
 * @param {(code:string)=>string} [options.shareLink] a link that opens a recipe code
 * @param {'start'|'look'|'profile'|'hello'} [options.startAt] the step to open on
 * @param {(freq:number,type:string)=>void} [options.voice] plays one voice blip
 * @param {Array<[string,object]>} [options.templates] optional starting templates
 * @param {boolean} [options.keepOpenOnSave] save without leaving the editor
 * @returns {object} creator controls, current recipe and transparent PNG export
 */
export function openCreator({recipe:start=CAST_RECIPES.Johansson,onSave=()=>{},onClose=()=>{},saveLabel='Save and play',shareLink=null,startAt='look',voice=()=>{},owner=null,templates=null,keepOpenOnSave=false}={}){
 if(!document.getElementById('shimanchu-css')){const style=document.createElement('style');style.id='shimanchu-css';style.textContent=CSS;document.head.append(style);}
 let wardrobeOwner=owner||start.name;let recipe=normalizeRecipe({...start,outfit:appropriateOutfit(wardrobeOwner,start.outfit)});const history=[];let featureBaseline=structuredClone(recipe);
 let step=STEPS.some(s=>s[0]===startAt)?startAt:'look',tab='body',page='style',pose='idle',expression='auto',previewFacing=0,hairThumbView='front',wearing='clothes',dress=null,previewFraming='auto';
 const el=(tag,props={},...children)=>{const e=Object.assign(document.createElement(tag),props);for(const c of children)if(c!=null)e.append(c);return e;};

 // ----- Layout -----
 const previousFocus=document.activeElement;
 const root=el('div',{className:'shm',role:'dialog',ariaModal:'true',ariaLabel:'Make your islander'});
 const iconButton=(icon,label,props={})=>{const b=el('button',{type:'button',ariaLabel:label,title:label,...props});b.innerHTML=svg(icon);return b;};
 const name=el('input',{className:'shm-name',value:recipe.name||'',placeholder:'Name',maxLength:24,ariaLabel:'Name'});
 const close=iconButton('close','Close',{className:'shm-pill'});
 const share=el('button',{className:'shm-pill',textContent:'Share'});
 const title=el('h2',{});
 root.append(el('div',{className:'shm-top'},title,name,share,close));
 const canvas=el('canvas',{ariaLabel:'Your islander. Drag to turn.'});
 const dice=iconButton('shuffle','Randomise appearance'),undo=iconButton('undo','Undo',{disabled:true}),reset=iconButton('reset','Start over');
 const poses=el('div',{className:'shm-poses'});
 const bubble=el('div',{className:'shm-bubble',hidden:true,role:'status'});
 // The figure lives in a small frame in the corner, with its buttons underneath, so
 // the menus have the room. The canvas is pinned inside the frame: left to size
 // itself, Safari grows a canvas each time it is resized, over everything else.
 const dragHint=el('p',{className:'shm-note',id:'shm-drag-hint',hidden:true});
 canvas.setAttribute('aria-describedby','shm-drag-hint');
 const stage=el('div',{className:'shm-stage'},canvas,bubble);
 const side=el('div',{className:'shm-side'},stage,dragHint,el('div',{className:'shm-dice'},dice,undo,reset),poses);
 const category=el('select',{className:'shm-select',ariaLabel:'Appearance category'},...TABS.map(t=>el('option',{value:t.id,textContent:t.name})));
 const categoryRow=el('label',{className:'shm-category'},'Edit',category);
 const tabs=el('div',{className:'shm-tabs',role:'tablist',ariaLabel:'Appearance category'});
 const pages=el('div',{className:'shm-pages',role:'tablist',ariaLabel:'Part, colour or adjust'});
 const body=el('div',{className:'shm-body',id:'shm-body',role:'tabpanel'});
 const panel=el('div',{className:'shm-panel'},el('div',{className:'shm-category-wrap'},categoryRow),pages,body);
 const paletteTray=el('div',{className:'shm-palette',role:'group',ariaLabel:'Part colours',hidden:true});
 const partTitle=el('h3',{className:'shm-part-title'});panel.prepend(partTitle);panel.append(paletteTray);
 root.append(el('div',{className:'shm-main'},tabs,side,panel));
 const back=el('button',{className:'shm-pill',textContent:'Back'});
 const dots=el('nav',{className:'shm-dots',ariaLabel:'Steps'});
 const next=el('button',{className:'shm-next'});
 root.append(el('div',{className:'shm-foot'},back,dots,next));
 document.body.append(root);
 const viewport=window.visualViewport;
 const fitViewport=()=>{if(viewport){root.style.height=viewport.height+'px';root.style.top=viewport.offsetTop+'px';root.style.bottom='auto';}};
 viewport?.addEventListener('resize',fitViewport);viewport?.addEventListener('scroll',fitViewport);fitViewport();
 // Keys typed here are for the name box, not for walking about behind the maker.
 let shareLayer=null;
 const closeShare=()=>{shareLayer?.remove();shareLayer=null;for(const child of root.children)child.inert=false;share.focus();};
 const swallow=e=>{
  if(!root.isConnected)return;e.stopPropagation();
  if(e.type!=='keydown')return;
  if(e.key==='Escape'){e.preventDefault();shareLayer?closeShare():finish(false);}
  if(e.key==='Tab'){const scope=shareLayer||root,items=[...scope.querySelectorAll('button:not(:disabled),input,select,textarea,[tabindex="0"]')].filter(x=>x.getClientRects().length);
   const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
 };
 root.addEventListener('keydown',swallow);root.addEventListener('keyup',swallow);

 // ----- The figure -----
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();
 const fillLight=new THREE.HemisphereLight(0xffffff,0xc8a878,2.2);scene.add(fillLight);
 const sun=new THREE.DirectionalLight(0xfff4e0,1.9);sun.position.set(2,4,5);scene.add(sun);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(.62,40),new THREE.MeshBasicMaterial({color:0xf6d79c}));floor.rotation.x=-Math.PI/2;scene.add(floor);
 const holder=new THREE.Group();scene.add(holder);
 const camera=new THREE.PerspectiveCamera(28,1,.05,50);
 let avatar=null,animator=null,spin=0,spinVelocity=0,dragging=null,frame=0,dirty=true,clock=performance.now(),focus=0,featureDrag=null;
 const frames={face:null,full:null};
 function rebuild(){
  if(avatar){avatar.root.removeFromParent();avatar.dispose();}
  avatar=buildAvatar(recipe,{shadows:false,faceSize:512});animator=createAvatarAnimator(avatar);holder.add(avatar.root);
  // Dressed as the preview says; a child asked into the towel comes out in swimwear.
  if(wearing!=='clothes')wearing=avatar.wear(wearing);fillDress();
  if(!['idle','walk','sit','lie'].includes(pose))animator.play(pose);
  // Frame from the real meshes, not from estimates, so a big head or a tall hat is
  // never cut off and the face fills the view the same way for everybody.
  avatar.root.updateMatrixWorld(true);
  const m=avatar.measure,head=new THREE.Box3();
  if(avatar.face?.head)head.setFromObject(avatar.face.head);else head.set(new THREE.Vector3(-m.Rh,m.headY,-m.Rh),new THREE.Vector3(m.Rh,m.headY+m.Rh*2,m.Rh));
  frames.face={centre:head.getCenter(new THREE.Vector3()),size:head.getSize(new THREE.Vector3()).multiplyScalar(1.12)};
  frames.full={centre:new THREE.Vector3(0,m.H*.5,0),size:new THREE.Vector3(m.width*2.2,m.H*1.04,m.depth)};
 }
 function resize(){
  const w=canvas.clientWidth||300,h=canvas.clientHeight||300;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 /** The distance at which a box of this size fits the view with some air round it. */
 const fit=(size,air)=>{const t=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));return Math.max(size.y*air/2/t,size.x*air/2/(t*camera.aspect))+size.z/2;};
 const faceFocus=()=>previewFraming==='face'||(previewFraming==='auto'&&step==='look'&&FACE_TABS.has(tab));
 function aim(dt){
  const want=faceFocus()?1:0;focus+=(want-focus)*Math.min(1,dt*5);
  const F=frames.face,B=frames.full;
  // On the face tabs the head sits a little high, leaving room for the chin and neck.
  const fullD=fit(B.size,1.18),faceD=fit(F.size,1.7);
  const y=THREE.MathUtils.lerp(B.centre.y,F.centre.y-F.size.y*.05,focus),d=THREE.MathUtils.lerp(fullD,faceD,focus);
  camera.position.set(0,y+.06*(1-focus),d);camera.lookAt(0,y,0);
 }
 function loop(){
  frame=requestAnimationFrame(loop);
  const now=performance.now(),dt=Math.min(.05,(now-clock)/1000);clock=now;
  if(dirty){
   if(featureDrag){drawFace(avatar.face.ctx,recipe,{expression:'neutral',size:avatar.face.canvas.width,objects:true});avatar.face.texture.needsUpdate=true;}
   else rebuild();
   dirty=false;
  }
  if(!dragging){spin+=spinVelocity*dt;spinVelocity*=Math.exp(-dt*3);if(Math.abs(spinVelocity)<.05)spin+=(previewFacing-spin)*Math.min(1,dt*1.5)*(pose==='walk'?0:1);}
  // A body faces -z in the town; here it turns round to face you.
  if(!featureDrag)holder.rotation.y=Math.PI+spin+(pose==='walk'?now/1000*.6:0);
  const talking=speech&&speech.typing;
  if(!featureDrag)animator.update(dt,{speed:pose==='walk'?1.2:0,seated:pose==='sit',seatHeight:.42,lying:pose==='lie',talk:talking?.5+.5*Math.sin(now/70):0,
   expression:expression!=='auto'?expression:step==='hello'?'happy':pose==='lie'?'dizzy':pose==='EvilLaugh'?'scheme':pose==='Hop'?'happy':pose==='Kachashi'?'laugh':pose==='idle'?'neutral':'smile'});
  if(!featureDrag)aim(dt);renderer.render(scene,camera);
 }
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function facePoint(e){
  const rect=canvas.getBoundingClientRect();
  pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObject(avatar.face.head,false)[0];
  return hit?.uv?{x:hit.uv.x*256,y:(1-hit.uv.y)*256}:null;
 }
 function syncPositionInputs(){
  for(const meter of body.querySelectorAll('.shm-meter[data-at]')){
   const v=get(recipe,meter.dataset.at);[...meter.children].forEach((notch,i)=>notch.classList.toggle('on',i<Math.round(v*16)));
  }
  for(const range of body.querySelectorAll('input[type=range]')){
   const value=get(recipe,range.dataset.at);
   range.value=range.dataset.invert==='true'?1-value:value;
  }
 }
 canvas.addEventListener('pointerdown',e=>{
  if(dragging||e.button!==0||!e.isPrimary)return;
  const point=step==='look'&&POSITION_FEATURES.has(tab)?facePoint(e):null;
  const hit=point&&hitFaceFeature(recipe,tab,point);
  if(hit){
   featureDrag={...hit,point,start:structuredClone(recipe),remembered:false};spinVelocity=0;
  }
  dragging={id:e.pointerId,x:e.clientX,spin,t:performance.now()};canvas.setPointerCapture(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  if(featureDrag){
   const point=facePoint(e);if(!point)return;
   const fields=draggedFaceFields(featureDrag.start,featureDrag,point.x-featureDrag.point.x,point.y-featureDrag.point.y);
   if(Object.entries(fields).every(([at,value])=>get(recipe,at)===value))return;
   if(!featureDrag.remembered){history.push(structuredClone(featureDrag.start));if(history.length>60)history.shift();featureDrag.remembered=true;}
   for(const [at,value] of Object.entries(fields))set(recipe,at,value);
   recipe=normalizeRecipe(recipe);dirty=true;undo.disabled=false;syncPositionInputs();
   return;
  }
  const dx=(e.clientX-dragging.x)/Math.max(120,canvas.clientWidth)*Math.PI*1.6;
  spinVelocity=(spin-(dragging.spin+dx))/-.016;spin=dragging.spin+dx;spinVelocity=THREE.MathUtils.clamp(spinVelocity,-8,8);
 });
 function endDrag(e){
  if(!dragging||(e&&e.pointerId!==dragging.id))return;
  const id=dragging.id;
  if(featureDrag){
   if(e?.type==='pointercancel'&&featureDrag.remembered){recipe=featureDrag.start;history.pop();undo.disabled=!history.length;syncPositionInputs();}
   else if(featureDrag.remembered&&JSON.stringify(recipe)===JSON.stringify(featureDrag.start)){history.pop();undo.disabled=!history.length;}
   dirty=true;featureDrag=null;renderPictures();
  }
  dragging=null;if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
 }
 canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(canvas);resize();

 // ----- Part pictures -----
 // Face parts are drawn flat, one feature at a time, by the face painter. Hair, hats and
 // clothes are the figure itself, rendered small and straight on.
 const thumbs=new Map();
 const thumbTarget=new THREE.WebGLRenderTarget(136,136);thumbTarget.texture.colorSpace=THREE.SRGBColorSpace;
 const thumbCamera=new THREE.PerspectiveCamera(30,1,.05,20),thumbScene=new THREE.Scene();
 thumbScene.add(new THREE.HemisphereLight(0xffffff,0xc8a878,2.2));const thumbSun=sun.clone();thumbScene.add(thumbSun);
 function figureThumb(r,c,framing){
  const a=buildAvatar(r,{shadows:false,faceSize:128}),m=a.measure;
  a.root.rotation.y=framing==='figure'?.35:framing==='feet'?.6:.2+(framing==='hair-rear'?Math.PI:0);thumbScene.add(a.root);a.root.updateMatrixWorld(true);
  const px=c.width;
  if(framing==='outfit'){const y=m.H*.5;thumbCamera.position.set(0,y,m.H*2.7);thumbCamera.lookAt(0,y,0);}
  else if(framing==='feet'){const y=m.foot*1.6+m.legR,d=m.H*.42;thumbCamera.position.set(0,y+m.H*.12,d);thumbCamera.lookAt(0,y,0);}
  else if(framing==='figure'){const y=r.__bottom?m.hipY*.7:m.hipY+m.torso*.5,d=r.__bottom?m.H*1.05:m.H*1.08;thumbCamera.position.set(0,y+.1,d);thumbCamera.lookAt(0,y,0);}
  else{const hb=new THREE.Box3();if(a.face?.head)hb.setFromObject(a.face.head);else hb.set(new THREE.Vector3(-m.Rh,m.headY,-m.Rh),new THREE.Vector3(m.Rh,m.headY+m.Rh*2,m.Rh));
   const c3=hb.getCenter(new THREE.Vector3()),s=hb.getSize(new THREE.Vector3());thumbCamera.position.set(0,c3.y+s.y*.08,c3.z+s.y*2.75);thumbCamera.lookAt(0,c3.y+s.y*.04,c3.z);}
  renderer.setRenderTarget(thumbTarget);renderer.setClearColor(0xfff4dc,1);renderer.clear();renderer.render(thumbScene,thumbCamera);
  const pixels=new Uint8Array(px*px*4);renderer.readRenderTargetPixels(thumbTarget,0,0,px,px,pixels);
  const ctx=c.getContext('2d'),image=ctx.createImageData(px,px);
  for(let y=0;y<px;y++)image.data.set(pixels.subarray((px-1-y)*px*4,(px-y)*px*4),y*px*4);
  ctx.putImageData(image,0,0);
  renderer.setRenderTarget(null);renderer.setClearColor(0x000000,0);
  a.root.removeFromParent();a.dispose();
 }
 function cached(key,c,draw){
  if(thumbs.has(key)){c.getContext('2d').drawImage(thumbs.get(key),0,0);return;}
  draw();const copy=document.createElement('canvas');copy.width=c.width;copy.height=c.height;copy.getContext('2d').drawImage(c,0,0);thumbs.set(key,copy);
 }
 function drawThumb(control,value,c){
  const r=structuredClone(recipe);set(r,control.at,value);
  if(control.at==='glasses.style')r.glasses.enabled=true;
  // A hat on the hat tab only, and a bare head for the hairstyles and earrings.
  if(control.at!=='outfit.hat')r.outfit.hat='none';
  if(control.at==='outfit.bottom')r.__bottom=true;
  const framing=control.at==='hair.style'&&hairThumbView==='rear'?'hair-rear':control.draw;
  const objects=['glasses','moustache','beard'].includes(control.draw);
  if(objects){r.hair.style='bald';if(control.draw==='moustache')r.facial.beard='none';if(control.draw==='beard')r.facial.moustache='none';if(control.draw!=='glasses')r.glasses.enabled=false;}
  const flat=!objects&&!['head','figure','feet'].includes(control.draw);
  const key=control.at+'|'+framing+'|'+value+'|'+JSON.stringify(flat?{eyes:r.eyes,brows:r.brows,nose:r.nose,mouth:r.mouth,glasses:r.glasses,facial:r.facial,skin:r.body.skin}:{...r,name:0,profile:0});
  cached(key,c,()=>flat?drawPart(c.getContext('2d'),normalizeRecipe(r),control.draw,c.width):figureThumb(r,c,framing));
 }

 // ----- Editing -----
 function remember(){history.push(structuredClone(recipe));if(history.length>60)history.shift();undo.disabled=false;}
 function change(at,value,keep=true){
  if(at.startsWith('outfit')&&!outfitAllowedFor(wardrobeOwner,at==='outfit'?value:{...recipe.outfit,[at.split('.')[1]]:value}))return;
  endDrag();
  if(get(recipe,at)===value)return;
  if(keep)remember();
  set(recipe,at,value);if(at==='glasses.style')recipe.glasses.enabled=true;recipe=normalizeRecipe(recipe);dirty=true;
 }
 function chooseTab(id){endDrag();tab=id;category.value=id;const t=TABS.find(x=>x.id===id);if(!t.controls.some(c=>c.page===page))page='style';renderTabs();renderBody();body.scrollTop=0;syncFocus();}
 category.onchange=()=>chooseTab(category.value);
 function renderTabs(){
  if(!tabs.children.length)tabs.append(...TABS.map(t=>{const b=el('button',{role:'tab',id:'shm-tab-'+t.id,ariaLabel:t.name,title:t.name});b.innerHTML=featureIcon(t.id);b.append(el('span',{textContent:t.name}));b.setAttribute('aria-controls','shm-body');b.onclick=()=>chooseTab(t.id);return b;}));
  [...tabs.children].forEach((b,i)=>{const active=TABS[i].id===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  const t=TABS.find(x=>x.id===tab);
  pages.replaceChildren(...PAGES.filter(([id])=>t.controls.some(c=>c.page===id)).map(([id,label])=>{const b=el('button',{role:'tab',textContent:label});b.setAttribute('aria-selected',String(id===page));b.onclick=()=>{page=id;renderTabs();renderBody();};return b;}));
  body.setAttribute('aria-label',TABS.find(t=>t.id===tab).name);partTitle.textContent=TABS.find(t=>t.id===tab).name;
  const positioning=step==='look'&&POSITION_FEATURES.has(tab);
  dragHint.textContent=positioning?'Drag the '+tab+' on the face to position them. Adjustment buttons also work.':'';
  dragHint.hidden=!positioning;
  canvas.ariaLabel=positioning?'Your islander. Drag '+tab+' to position; drag elsewhere to turn.':'Your islander. Drag to turn.';
 }
 tabs.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=TABS.findIndex(t=>t.id===tab),n=e.key==='Home'?0:e.key==='End'?TABS.length-1:(i+(e.key==='ArrowRight'?1:-1)+TABS.length)%TABS.length;chooseTab(TABS[n].id);tabs.children[n].focus();tabs.children[n].scrollIntoView({block:'nearest',inline:'nearest'});};
 let pictureQueue=[],pictureJobs=[],pictureFrame=0,picturesDue=0;
 // Pictures are drawn a few a frame, so a page opens at once and fills in.
 function paintQueued(){pictureFrame=requestAnimationFrame(()=>{const t0=performance.now();while(pictureQueue.length&&performance.now()-t0<12)pictureQueue.shift()();if(pictureQueue.length)paintQueued();});}
 function renderPictures(){clearTimeout(picturesDue);picturesDue=setTimeout(()=>{cancelAnimationFrame(pictureFrame);pictureQueue=[...pictureJobs];paintQueued();},180);}
 const pressed=(row,b)=>{for(const x of row.children)x.setAttribute('aria-pressed',String(x===b));};
 /** A meter of sixteen notches and the two buttons either side of it. */
 function stepper(label,at,less,more,after=()=>{}){
  const meter=el('div',{className:'shm-meter',ariaHidden:'true'});meter.dataset.at=at;
  const paint=()=>{const v=get(recipe,at);meter.replaceChildren(...Array.from({length:16},(_,i)=>el('i',{className:i<Math.round(v*16)?'on':''})));};
  const bump=d=>{change(at,Math.round(Math.max(0,Math.min(1,get(recipe,at)+d))*16)/16);paint();after();};
  const minus=el('button',{type:'button',textContent:'−',ariaLabel:less,title:less}),plus=el('button',{type:'button',textContent:'+',ariaLabel:more,title:more});
  minus.onclick=()=>bump(-NOTCH);plus.onclick=()=>bump(NOTCH);paint();
  return el('div',{className:'shm-step'},el('span',{textContent:label}),minus,meter,plus);
 }
 function renderLook(){
  const t=TABS.find(x=>x.id===tab);
  if(t.id==='hair'&&page==='style'){
   const views=el('div',{className:'shm-row',role:'group',ariaLabel:'Hairstyle pictures'});
   for(const [value,label] of [['front','Front views'],['rear','Rear views']]){
    const b=el('button',{type:'button',className:'shm-pill',textContent:label});b.setAttribute('aria-pressed',String(hairThumbView===value));
    b.onclick=()=>{hairThumbView=value;renderBody();};views.append(b);
   }
   body.append(views,el('p',{className:'shm-note',textContent:'Compare the fringe and the back. Choose a style, then set its colour and parting independently.'}));
  }
  if(t.id==='top'&&page==='style'){for(const [title,presets] of [['Island outfit sets',ISLAND_OUTFITS],['Island costumes',ISLAND_COSTUMES]]){const sets=el('div',{className:'shm-grid'});sets.setAttribute('aria-label',title);for(const preset of presets.filter(p=>outfitAllowedFor(wardrobeOwner,p.outfit))){const c=el('canvas',{width:136,height:136}),button=el('button',{type:'button',ariaLabel:preset.name,title:preset.name},c,preset.name);button.onclick=()=>change('outfit',{...recipe.outfit,...preset.outfit});sets.append(button);pictureJobs.push(()=>{const r=normalizeRecipe({...recipe,outfit:{...recipe.outfit,...preset.outfit}});cached('outfit|'+preset.name+'|'+JSON.stringify(r),c,()=>figureThumb(r,c,'outfit'));});}body.append(el('h3',{},title),sets);}}
  if(t.wardrobe&&page==='style'){
   const off=el('button',{type:'button',className:'shm-pill shm-undress',textContent:'Take all clothes off'});
   off.onclick=()=>{remember();Object.assign(recipe.outfit,{top:'tank',topColour:'#f4f1ea',pattern:'none',bottom:'underwear',bottomColour:'#7fb0d8',footwear:'barefoot',hat:'none'});Object.assign(recipe.accessories,{earrings:'none',neckwear:'none',pin:false});recipe=normalizeRecipe(recipe);dirty=true;renderBody();};
   body.append(el('p',{className:'shm-note',textContent:'Underneath it all: a tank top, underwear and bare feet. Tap something to put it on; the first picture takes it off.'}),off);
  }
  for(const control of t.controls.filter(c=>c.page===page&&(!c.when||c.when(recipe)))){
   if(control.label&&control.kind!=='toggle'&&control.kind!=='stepper'&&control.kind!=='position')body.append(el('h4',{textContent:control.label}));
   if(control.kind==='face-forms'){
    const grid=el('div',{className:'shm-grid shm-face-forms',role:'group',ariaLabel:'Face shapes'}),skin=el('div',{className:'shm-swatches shm-face-skin',role:'group',ariaLabel:'Skin tone'});
    for(const form of control.list){const c=el('canvas',{width:136,height:136}),label=({'soft-square':'Soft square','soft-round':'Soft round',wide:'Broad'}[form]||form[0].toUpperCase()+form.slice(1)),b=el('button',{type:'button',ariaLabel:label,title:label},c,label);b.setAttribute('aria-pressed',String(recipe.head.form===form));b.onclick=()=>{change('head.form',form);pressed(grid,b);};drawFaceFormThumb(c,form,recipe.body.skin);grid.append(b);}
    for(const [i,hex] of PALETTE.skin.entries()){const b=el('button',{type:'button',ariaLabel:'Skin tone '+(i+1),title:'Skin tone '+(i+1)});b.style.background=hex;b.setAttribute('aria-pressed',String(recipe.body.skin===hex));b.onclick=()=>{change('body.skin',hex);renderBody();};skin.append(b);}
    body.append(el('div',{className:'shm-face-picker'},grid,skin));
   }else if(control.kind==='parts'){
    const grid=el('div',{className:'shm-grid'});
    for(const value of control.list.filter(v=>!control.at.startsWith('outfit')||outfitAllowedFor(wardrobeOwner,{...recipe.outfit,[control.at.split('.')[1]]:v}))){
     const c=el('canvas',{width:136,height:136});
     const b=el('button',{type:'button'},c,LABEL[value]||value);b.setAttribute('aria-pressed',String(get(recipe,control.at)===value));
     b.onclick=()=>{change(control.at,value);pressed(grid,b);};
     grid.append(b);pictureJobs.push(()=>drawThumb(control,value,c));
    }
    body.append(grid);
   }else if(control.kind==='colours'){
    const row=el('div',{className:'shm-swatches'});
    for(const hex of control.palette){const b=el('button',{type:'button',ariaLabel:hex});b.style.background=hex;b.setAttribute('aria-pressed',String(get(recipe,control.at)===hex));
     b.onclick=()=>{change(control.at,hex);pressed(row,b);};row.append(b);}
    body.append(row);
   }else if(control.kind==='position'){
    body.append(el('h4',{textContent:control.label||'Position'}));
    const pad=el('div',{className:'shm-pad',role:'group',ariaLabel:'Move '+(control.label||t.name).toLowerCase()});
    const directions=[['up','arrow-up','Move up',control.at,NOTCH],['down','arrow-down','Move down',control.at,-NOTCH],
     ['left','arrow-left',control.paired?'Closer':'Move left',control.horizontal,-NOTCH],['right','arrow-right',control.paired?'Wider apart':'Move right',control.horizontal,NOTCH]];
    for(const [cls,icon,label,at,delta] of directions){const b=iconButton(icon,label,{className:cls});b.onclick=()=>change(at,Math.round(Math.max(0,Math.min(1,get(recipe,at)+delta))*16)/16);pad.append(b);}
    pad.append(el('b',{textContent:control.paired?'apart':'move'}));
    body.append(pad);
   }else if(control.kind==='slider'){
    const slider=el('input',{type:'range',min:0,max:1,step:.01,value:get(recipe,control.at),ariaLabel:control.label});
    slider.style.cssText='width:100%;min-height:44px;accent-color:#356579';
    const output=el('output',{textContent:Math.round(slider.value*100)+'%'});
    let dragging=false;
    slider.oninput=()=>{if(!dragging){remember();dragging=true;}change(control.at,Number(slider.value),false);output.textContent=Math.round(slider.value*100)+'%';};
    slider.onchange=()=>{dragging=false;};
    body.append(el('label',{},control.low+' — '+control.high,slider,output));
   }else if(control.kind==='stepper'){
    body.append(stepper(control.label,control.at,control.less,control.more));
   }else if(control.kind==='toggle'){
    const b=el('button',{type:'button',className:'shm-toggle',textContent:control.label});b.setAttribute('aria-pressed',String(!!get(recipe,control.at)));
    b.onclick=()=>{change(control.at,!get(recipe,control.at));b.setAttribute('aria-pressed',String(!!get(recipe,control.at)));};
    body.append(b);
   }else if(control.kind==='chips'){
    const row=el('div',{className:'shm-chips'});
    for(const value of control.list.filter(v=>!control.at.startsWith('outfit')||outfitAllowedFor(wardrobeOwner,{...recipe.outfit,[control.at.split('.')[1]]:v}))){const b=el('button',{type:'button',textContent:LABEL[value]||value[0].toUpperCase()+value.slice(1)});b.setAttribute('aria-pressed',String(get(recipe,control.at)===value));b.onclick=()=>{change(control.at,value);pressed(row,b);if(control.at==='swim.bath')showIn(value==='towel'?'towel':'swim');};row.append(b);}
    body.append(row);
   }else if(control.kind==='note'){
    body.append(el('p',{className:'shm-note',textContent:control.text}));
   }
  }
 }
 // Step 1: faces to start from. The first is whoever you came in with.
 let faces=[],faceSeed=0;
 function dealFaces(){faces=[recipe,...Array.from({length:11},()=>keepSelf(randomRecipe('face-'+Date.now().toString(36)+'-'+(faceSeed++)),recipe))];}
 function renderStart(){
  if(!faces.length)dealFaces();
  const defaults=templates||[['Harbour visitor',CAST_RECIPES['Harbour visitor']],['Thuận · original',ORIGINAL_THUAN_RECIPE],['Thuận · photo reference',CAST_RECIPES.Thuan]];
  if(!owner)for(const [label,preset] of defaults){const button=el('button',{type:'button',className:'shm-pill',textContent:label});button.onclick=()=>setRecipe(preset);body.append(button);}
  body.append(el('h4',{textContent:'Pick someone to start from'}));
  const grid=el('div',{className:'shm-grid shm-faces'});
  faces.forEach((face,i)=>{
   const c=el('canvas',{width:136,height:136});
   const b=el('button',{type:'button',ariaLabel:i?'Face '+(i+1):'As they are'},c,i?'':'As they are');
   b.setAttribute('aria-pressed',String(JSON.stringify({...face,name:0,profile:0})===JSON.stringify({...recipe,name:0,profile:0})));
   b.onclick=()=>{remember();recipe=keepSelf(face,recipe);dirty=true;pressed(grid,b);};
   grid.append(b);pictureJobs.push(()=>cached('face|'+JSON.stringify({...face,name:0,profile:0}),c,()=>figureThumb(face,c,'head')));
  });
  const more=el('button',{type:'button',className:'shm-pill',textContent:'Different faces'});
  more.onclick=()=>{faces=[recipe];for(let i=0;i<11;i++)faces.push(keepSelf(randomRecipe('face-'+Date.now().toString(36)+'-'+(faceSeed++)),recipe));renderBody();};
  body.append(grid,el('div',{className:'shm-row',style:'margin-top:14px'},more));
 }
 // Step 3: who they are.
 function renderProfile(){
  const p=recipe.profile,at=k=>'profile.'+k;
  body.append(el('h4',{textContent:'Birthday'}));
  const month=el('select',{className:'shm-select',ariaLabel:'Birthday month'},...MONTHS.map((m,i)=>el('option',{value:i+1,textContent:m})));month.value=p.month;
  const day=el('select',{className:'shm-select',ariaLabel:'Birthday day'});
  const fillDays=()=>{day.replaceChildren(...Array.from({length:daysIn(recipe.profile.month)},(_,i)=>el('option',{value:i+1,textContent:i+1})));day.value=recipe.profile.day;};fillDays();
  month.onchange=()=>{change(at('month'),+month.value);fillDays();};day.onchange=()=>change(at('day'),+day.value);
  body.append(el('div',{className:'shm-row'},month,day));
  body.append(el('h4',{textContent:'Favourite colour'}));
  const swatches=el('div',{className:'shm-swatches'});
  for(const hex of PALETTE.cloth){const b=el('button',{type:'button',ariaLabel:'Favourite '+hex});b.style.background=hex;b.setAttribute('aria-pressed',String(p.favourite===hex));b.onclick=()=>{change(at('favourite'),hex);pressed(swatches,b);};swatches.append(b);}
  const wear=el('button',{type:'button',className:'shm-pill',textContent:'Wear it'});wear.onclick=()=>change('outfit.topColour',recipe.profile.favourite);
  body.append(swatches,el('div',{className:'shm-row',style:'margin-top:8px'},wear));
  body.append(el('h4',{textContent:'Personality'}));
  const card=el('div',{className:'shm-type',role:'status'});
  const paintCard=()=>{const type=personalityOf(recipe.profile);card.style.borderColor=type.colour;card.replaceChildren(el('small',{textContent:'ISLAND PERSONALITY'}),el('strong',{textContent:type.name}),el('span',{textContent:type.line}),el('div',{className:'shm-persona-moment'},el('b',{textContent:'♡ At their best'}),el('p',{textContent:type.strength})),el('div',{className:'shm-persona-moment'},el('b',{textContent:'☀ An island moment'}),el('p',{textContent:type.islandMoment})));};
  for(const dial of DIALS){
   const pips=el('div',{className:'shm-pips',role:'group',ariaLabel:dial.label});
   const paint=()=>{const s=dialStep(recipe.profile[dial.key]);[...pips.children].forEach((b,i)=>{b.classList.toggle('on',i<s);b.setAttribute('aria-pressed',String(i+1===s));});};
   for(let i=1;i<=DIAL_STEPS;i++){const b=el('button',{type:'button',ariaLabel:`${dial.label} ${i} of ${DIAL_STEPS}`});b.onclick=()=>{change(at(dial.key),stepValue(i));paint();paintCard();if(dial.key==='show'){pose=i>4?'Hop':'idle';if(pose!=='idle')animator.play(pose);else animator.stop();}};pips.append(b);}
   paint();
   body.append(el('div',{className:'shm-dial'},el('div',{},el('span',{textContent:dial.low}),el('strong',{textContent:dial.label}),el('span',{textContent:dial.high})),pips));
  }
  paintCard();body.prepend(card);
  body.append(el('h4',{textContent:'Voice'}));
  body.append(stepper('Pitch',at('pitch'),'Lower voice','Higher voice',()=>sayLine('La la la!')),stepper('Speed',at('speed'),'Slower voice','Faster voice',()=>sayLine('La la la!')));
  const hear=el('button',{type:'button',className:'shm-pill',textContent:'Hear them'});hear.onclick=()=>sayLine(hello({...recipe,name:name.value}).split('\n')[0]);
  body.append(el('div',{className:'shm-row'},hear));
  body.append(el('h4',{textContent:'Catchphrase'}));
  const phrase=el('input',{className:'shm-text',value:p.catchphrase,maxLength:40,placeholder:'Haisai!',ariaLabel:'Catchphrase'});
  phrase.onfocus=()=>remember();phrase.oninput=()=>{recipe.profile.catchphrase=phrase.value.slice(0,40);};
  body.append(phrase);
 }
 function renderBody(){recipe.outfit=appropriateOutfit(wardrobeOwner,recipe.outfit);
  cancelAnimationFrame(pictureFrame);clearTimeout(picturesDue);pictureQueue=[];pictureJobs=[];
  body.replaceChildren();paletteTray.replaceChildren();paletteTray.hidden=true;
  if(step==='start')renderStart();else if(step==='profile')renderProfile();else if(step==='look'){renderLook();
   const colour=TABS.find(t=>t.id===tab).controls.find(c=>c.kind==='colours'&&(!c.when||c.when(recipe)));
   if(page==='style'&&colour){paletteTray.hidden=false;paletteTray.append(el('h4',{textContent:colour.label}),el('div',{className:'shm-swatches'}));const row=paletteTray.lastChild;
    for(const hex of colour.palette){const b=el('button',{type:'button',ariaLabel:colour.label+' '+hex,title:hex});b.style.background=hex;b.setAttribute('aria-pressed',String(get(recipe,colour.at)===hex));b.onclick=()=>{change(colour.at,hex);pressed(row,b);renderPictures();};row.append(b);}
   }
  }
  pictureQueue=[...pictureJobs];paintQueued();
 }

 // ----- Voice -----
 // The line types itself out in the bubble with a blip every other letter, pitched and
 // paced from the profile, and the mouth moves while it does.
 let speech=null;
 function sayLine(text,show=false){
  stopSpeech();
  const v=voiceOf(recipe.profile);let i=0;speech={typing:true,timer:0};
  if(show){bubble.hidden=false;bubble.textContent='';}
  speech.timer=setInterval(()=>{
   i++;if(show)bubble.textContent=text.slice(0,i);
   const ch=text[i-1]||'';if(i%2&&/\w/.test(ch))voice(i%4===1?v.freq:v.freq*v.swing,v.type);
   if(i>=text.length){clearInterval(speech.timer);speech.typing=false;}
  },v.letterMs);
 }
 function stopSpeech(){if(speech){clearInterval(speech.timer);speech=null;}}

 // ----- Steps -----
 function syncFocus(){root.dataset.focus=faceFocus()?'face':'body';}
 function goTo(id){
  endDrag();
  stopSpeech();bubble.hidden=true;step=id;root.dataset.step=id;
  const index=STEPS.findIndex(s=>s[0]===id);
  title.replaceChildren(document.createTextNode(STEPS[index][1]),el('small',{textContent:`Step ${index+1} of ${STEPS.length}`}));
  dots.replaceChildren(...STEPS.map(([sid,label],i)=>{const b=el('button',{type:'button',ariaLabel:`Step ${i+1}: ${label}`},String(i+1),el('span',{textContent:label}));if(sid===id)b.setAttribute('aria-current','step');b.onclick=()=>goTo(sid);return b;}));
  back.disabled=index===0;
  const last=index===STEPS.length-1;next.className=last?'shm-save':'shm-next';next.textContent=last?saveLabel:'Next';
  dice.hidden=id!=='look'&&id!=='start';
  if(id==='hello'){pose='Wave';animator?.play('Wave');previewFacing=0;spin=0;setTimeout(()=>{if(step==='hello')sayLine(hello({...recipe,name:name.value}),true);},450);}
  else if(pose==='Wave'){pose='idle';animator?.stop();}
  renderTabs();renderBody();body.scrollTop=0;syncFocus();
 }
 back.onclick=()=>{const i=STEPS.findIndex(s=>s[0]===step);if(i>0)goTo(STEPS[i-1][0]);};
 next.onclick=()=>{const i=STEPS.findIndex(s=>s[0]===step);if(i<STEPS.length-1)goTo(STEPS[i+1][0]);else finish(true);};
 function renderPoses(){
  const angle=el('select',{className:'shm-select shm-angle',ariaLabel:'Preview angle'},el('option',{value:'front',textContent:'Front'}),el('option',{value:'back',textContent:'Back'}));
  angle.onchange=()=>{endDrag();previewFacing=angle.value==='back'?Math.PI:0;spin=previewFacing;spinVelocity=0;};
  const select=el('select',{className:'shm-select',ariaLabel:'Preview pose'},...POSES.map(([id,label])=>el('option',{value:id,textContent:label})));select.value=pose;
  select.onchange=()=>{endDrag();pose=select.value;if(!['idle','walk','sit','lie'].includes(pose))animator.play(pose);else animator.stop();};
  dress=el('select',{className:'shm-select',ariaLabel:'Preview outfit'});fillDress();
  dress.onchange=()=>{endDrag();showIn(dress.value);};
  const exportButton=el('button',{type:'button',className:'shm-pill',textContent:'Export T-pose (.glb)'});
  exportButton.onclick=async()=>{
   exportButton.disabled=true;exportButton.textContent='Exporting…';
   try{
    const {exportAvatarGLB}=await import('./export.js'),data=await exportAvatarGLB(recipe);
    const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'})),link=el('a',{href:url,download:(recipe.name||'islander').replace(/[^a-z0-9_-]/gi,'-')+'-tpose.glb'});
    link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);exportButton.textContent='Export T-pose (.glb)';
   }catch(error){console.error(error);exportButton.textContent='Export failed — retry';}
   finally{exportButton.disabled=false;}
  };
  const mood=el('select',{className:'shm-select',ariaLabel:'Preview expression'},el('option',{value:'auto',textContent:'Expression: automatic'}),...EXPRESSION_NAMES.map(value=>el('option',{value,textContent:value[0].toUpperCase()+value.slice(1)})));
  mood.onchange=()=>{expression=mood.value;};
  poses.append(angle,select,dress,mood,exportButton);
 }
 /** The preview's outfit list, for whoever is in the maker now (the towel is for grown-ups). */
 function fillDress(){if(!dress)return;dress.replaceChildren(...previewOutfits(recipe).map(o=>el('option',{value:o.value,textContent:o.label,disabled:o.disabled})));dress.value=wearing;}
 /** Show them in their clothes, their swimwear or the bath towel, without changing the recipe. */
 function showIn(outfit){wearing=avatar?avatar.wear(outfit):outfit;if(dress)dress.value=wearing;}

 // ----- Buttons -----
 name.oninput=()=>{endDrag();recipe.name=name.value.slice(0,24);};
 // The dice change how someone looks, never who they are.
 dice.onclick=()=>{endDrag();remember();recipe=keepSelf(randomRecipe(),{...recipe,name:name.value});dirty=true;if(step==='start')faces[0]=recipe;renderBody();};
 undo.onclick=()=>{endDrag();const r=history.pop();if(!r)return;recipe=r;name.value=recipe.name||'';dirty=true;undo.disabled=!history.length;renderBody();};
 reset.onclick=()=>{endDrag();remember();recipe=keepSelf(CAST_RECIPES.Johansson,{...recipe,name:name.value});dirty=true;renderBody();};
 share.onclick=()=>{
  endDrag();
  const code=encodeRecipe({...recipe,name:name.value});const link=shareLink?.(code);
  const text=el('textarea',{value:link||code,readOnly:true,ariaLabel:'Share link or code'});
  const paste=el('textarea',{placeholder:'Paste a code or link here to try it on',ariaLabel:'Import an islander'});
  const copy=el('button',{className:'shm-pill',textContent:'Copy'}),use=el('button',{className:'shm-pill',textContent:'Try the pasted one'}),done=el('button',{className:'shm-pill',textContent:'Done'});
  const layer=el('div',{className:'shm-share',role:'dialog',ariaModal:'true',ariaLabel:'Share your islander'},el('div',{},el('h3',{textContent:'Share your islander'}),el('p',{textContent:link?'Send this link and it opens the maker with your islander in it.':'This code is your islander. Anyone can paste it into their maker.'}),text,el('div',{className:'row'},copy),el('h3',{textContent:'Try someone else’s'}),paste,el('div',{className:'row'},use,done)));
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);copy.textContent='Copied';}catch{text.select();}};
  use.onclick=()=>{const raw=paste.value.trim();let code=raw;try{if(raw.includes('=')){const url=new URL(raw,location.href);code=url.searchParams.get('r')||url.searchParams.get('avatar');}}catch{code='';}const r=decodeRecipe(code||'');
   if(!r){use.textContent='That code did not work';return;}remember();recipe=r;name.value=r.name||'';dirty=true;renderBody();closeShare();};
  done.onclick=closeShare;shareLayer=layer;for(const child of root.children)child.inert=true;root.append(layer);
  // Start a scrollable dialog at its heading, with the next Tab reaching the code.
  const heading=layer.querySelector('h3');heading.tabIndex=-1;heading.focus({preventScroll:true});
 };
 function finish(saving){
  if(!root.isConnected)return;
  if(saving&&keepOpenOnSave){onSave(normalizeRecipe({...recipe,name:name.value}));return;}
  endDrag();
  stopSpeech();cancelAnimationFrame(frame);cancelAnimationFrame(pictureFrame);clearTimeout(picturesDue);observer?.disconnect();viewport?.removeEventListener('resize',fitViewport);viewport?.removeEventListener('scroll',fitViewport);
  root.removeEventListener('keydown',swallow);root.removeEventListener('keyup',swallow);
  const out=normalizeRecipe({...recipe,name:name.value});
  avatar?.dispose();thumbTarget.dispose();renderer.dispose();renderer.forceContextLoss?.();floor.geometry.dispose();floor.material.dispose();root.remove();previousFocus?.focus?.();
  if(saving)onSave(out);onClose(out,saving);
 }
 close.onclick=()=>finish(false);

 /** Replace the editable character without closing the studio. */
 function setRecipe(value){endDrag();remember();recipe=normalizeRecipe(value);featureBaseline=structuredClone(recipe);wardrobeOwner=recipe.name;name.value=recipe.name;dirty=true;faces=[];renderBody();}
 /** Restore only controls belonging to the selected feature, as one undoable edit. */
 function resetFeature(){
  endDrag();const next=structuredClone(recipe),controls=TABS.find(t=>t.id===tab).controls;
  for(const control of controls)for(const at of [control.at,control.horizontal].filter(Boolean))set(next,at,structuredClone(get(featureBaseline,at)));
  if(JSON.stringify(next)===JSON.stringify(recipe))return;
  remember();recipe=normalizeRecipe(next);dirty=true;renderBody();
 }
 /** Preview settings never modify the saved character. */
 function setPreview({angle,framing,lighting,mood}={}){
  endDrag();
  const angles={front:0,quarter:-Math.PI/4,left:-Math.PI/2,right:Math.PI/2,back:Math.PI};
  if(Object.hasOwn(angles,angle)){previewFacing=angles[angle];spin=previewFacing;spinVelocity=0;const input=poses.querySelector('.shm-angle');if(input)input.value=angle;}
  if(['auto','face','full'].includes(framing)){previewFraming=framing;syncFocus();}
  if(mood==='auto'||EXPRESSION_NAMES.includes(mood)){expression=mood;const input=poses.querySelector('[aria-label="Preview expression"]');if(input)input.value=mood;}
  const lights={warm:[0xffffff,0xc8a878,2.2,0xfff4e0,1.9,[2,4,5]],neutral:[0xffffff,0x8896aa,1.8,0xffffff,2.2,[-3,4,5]],contour:[0xddeaff,0x647388,1.1,0xffffff,3.2,[4,2,2]]};
  if(Object.hasOwn(lights,lighting)){const [sky,ground,fill,key,power,position]=lights[lighting];fillLight.color.setHex(sky);fillLight.groundColor.setHex(ground);fillLight.intensity=fill;sun.color.setHex(key);sun.intensity=power;sun.position.set(...position);}
 }
 /** Render a full-body transparent PNG independently of the preview's face zoom. */
 function exportPNG(size=1024){
  endDrag();if(dirty){rebuild();dirty=false;}
  size=Math.max(256,Math.min(2048,Math.round(size)||1024));
  const target=new THREE.WebGLRenderTarget(size,size,{depthBuffer:true});target.texture.colorSpace=THREE.SRGBColorSpace;
  const previous=renderer.getRenderTarget(),clearColour=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),floorVisible=floor.visible;
  const shot=camera.clone();shot.aspect=1;shot.updateProjectionMatrix();
  try{
   floor.visible=false;scene.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(avatar.root),centre=box.getCenter(new THREE.Vector3()),bounds=box.getSize(new THREE.Vector3());
   const distance=Math.max(bounds.y,bounds.x)*1.18/(2*Math.tan(THREE.MathUtils.degToRad(shot.fov/2)))+bounds.z/2;
   shot.position.set(centre.x,centre.y,centre.z+distance);shot.lookAt(centre);
   renderer.setRenderTarget(target);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(scene,shot);
   const pixels=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
   const image=el('canvas',{width:size,height:size}),ctx=image.getContext('2d'),data=ctx.createImageData(size,size),stride=size*4;
   for(let row=0;row<size;row++)data.data.set(pixels.subarray((size-1-row)*stride,(size-row)*stride),row*stride);
   ctx.putImageData(data,0,0);return image.toDataURL('image/png');
  }finally{floor.visible=floorVisible;renderer.setRenderTarget(previous);renderer.setClearColor(clearColour,alpha);target.dispose();}
 }

 rebuild();dirty=false;renderPoses();goTo(step);loop();close.focus();
 return {close:()=>finish(false),get recipe(){return normalizeRecipe({...recipe,name:name.value});},get root(){return root;},goTo,showIn,setRecipe,setPreview,resetFeature,exportPNG,save:()=>finish(true),get wearing(){return wearing;}};
}

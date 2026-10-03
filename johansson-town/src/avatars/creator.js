import {ISLAND_OUTFITS,ISLAND_COSTUMES,outfitAllowedFor,appropriateOutfit} from './outfits.js';
import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from './build.js';
import {createAvatarAnimator} from './animate.js';
import {drawPart} from './face.js';
import {PALETTE,PARTS,normalizeRecipe,encodeRecipe,decodeRecipe,randomRecipe,AGES} from './recipe.js';
import {CAST_RECIPES} from './cast.js';
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

const FACE_TABS=new Set(['head','hair','eyes','brows','nose','mouth','extras','hat','accessories']);
const LABEL={
 crop:'Crop',sidepart:'Side part',bob:'Bob',long:'Long',ponytail:'Ponytail',braids:'Braids',bun:'Bun',spiky:'Spiky',perm:'Perm',buzz:'Buzz',afro:'Afro',horseshoe:'Horseshoe',bald:'Bald',
 round:'Round',dot:'Dot',almond:'Almond',sleepy:'Sleepy',lashes:'Lashes',narrow:'Narrow',sparkle:'Sparkle',gentle:'Gentle',
 straight:'Straight',arched:'Arched',thick:'Thick',thin:'Thin',worried:'Worried',bushy:'Bushy',none:'None',
 button:'Button',line:'Line',wide:'Wide',hook:'Hook',
 smile:'Smile',flat:'Flat',grin:'Grin',small:'Small',smirk:'Smirk',pout:'Pout',
 square:'Square',oval:'Oval',heart:'Heart',sun:'Shades',half:'Half-rim',
 moustache:'Moustache',walrus:'Walrus',stubble:'Stubble',beard:'Beard',goatee:'Goatee',
 lighthouse:'Lighthouse costume',lantern:'Lantern costume',reef:'Reef costume',sailorlong:'Long-sleeved sailor',police:'Police jacket',sailor:'Sailor shirt',hoodie:'Hooded sweater',cardigan:'Cardigan',overalls:'Work overalls',sundress:'Sundress bodice',festival:'Festival coat',widepants:'Wide trousers',cropped:'Cropped trousers',culottes:'Culottes',pleatedskirt:'Pleated skirt',squid:'Squid cap',teapot:'Teapot hat',sunflower:'Sunflower bonnet',paperboat:'Paper-boat hat',mountain:'Mount Aoba hat',
 tank:'Tank top',underwear:'Underwear',barefoot:'Bare feet',sneakers:'Sneakers',sandals:'Sandals',shoes:'Shoes',
 tee:'T-shirt',kariyushi:'Kariyushi',polo:'Polo',blouse:'Blouse',jacket:'Jacket',apron:'Apron',smock:'Smock',
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
const TABS=[
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
  {kind:'colours',page:'colour',at:'body.skin',label:'Skin',palette:PALETTE.skin},
  {kind:'stepper',page:'adjust',at:'head.size',label:'Head size',less:'Smaller head',more:'Bigger head'},
  {kind:'stepper',page:'adjust',at:'head.shape',label:'Width',less:'Narrower',more:'Broader'},
  {kind:'stepper',page:'adjust',at:'head.jaw',label:'Jaw',less:'Narrower jaw',more:'Wider jaw'},
  {kind:'stepper',page:'adjust',at:'head.cheeks',label:'Cheeks',less:'Slimmer cheeks',more:'Fuller cheeks'},
  {kind:'stepper',page:'adjust',at:'blush',label:'Rosy cheeks',less:'Less rosy',more:'More rosy'},
  {kind:'stepper',page:'adjust',at:'wrinkles',label:'Laughter lines',less:'Fewer lines',more:'More lines'}]},
 {id:'hair',name:'Hair',controls:[
  {kind:'parts',page:'style',at:'hair.style',list:PARTS.hair,draw:'head'},
  {kind:'toggle',page:'style',at:'hair.flip',label:'Part on the other side'},
  {kind:'colours',page:'colour',at:'hair.colour',label:'Colour',palette:PALETTE.hair}]},
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
  {kind:'parts',page:'style',at:'facial.style',label:'Beard',list:PARTS.facial,draw:'facial'},
  {kind:'colours',page:'colour',at:'glasses.colour',label:'Frames',palette:['#2b2b2b','#8a4a3a','#c8a060','#e06a7a','#3d6a8a','#d8342c']},
  {kind:'colours',page:'colour',at:'facial.colour',label:'Beard',palette:PALETTE.hair}]},
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
  {kind:'colours',page:'colour',at:'swim.colour',label:'Swimwear, for the onsen',palette:PALETTE.cloth}]},
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
  {kind:'colours',page:'colour',at:'accessories.colour',label:'Accessory colour',palette:PALETTE.cloth}]},
];
const PAGES=[['style','Style'],['colour','Colour'],['adjust','Adjust']];
const STEPS=[['start','Choose a face'],['look','Make them'],['profile','Who are they?'],['hello','Say hello']];
/** How far one press of a step button moves a value (0–1). */
const NOTCH=1/16;

const POSES=[['idle','Stand'],['Wave','Wave'],['Hop','Happy'],['walk','Walk'],['Kachashi','Dance'],['Bow','Bow'],['Heart','Heart'],['Peace','Cheek'],['Coy','Coy'],['Tada','Ta-da!'],['HandsOnHips','Hips'],['HeelKick','Heel kick'],['sit','Sit']];

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
.shm[data-step=start] .shm-panel>div:first-child,.shm[data-step=profile] .shm-panel>div:first-child,.shm[data-step=start] .shm-pages,.shm[data-step=profile] .shm-pages{display:none}
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
 * @returns {{close:()=>void, get recipe():object}}
 */
export function openCreator({recipe:start=CAST_RECIPES.Johansson,onSave=()=>{},onClose=()=>{},saveLabel='Save and play',shareLink=null,startAt='look',voice=()=>{},owner=null}={}){
 if(!document.getElementById('shimanchu-css')){const style=document.createElement('style');style.id='shimanchu-css';style.textContent=CSS;document.head.append(style);}
 const wardrobeOwner=owner||start.name;let recipe=normalizeRecipe({...start,outfit:appropriateOutfit(wardrobeOwner,start.outfit)});const history=[];
 let step=STEPS.some(s=>s[0]===startAt)?startAt:'look',tab='body',page='style',pose='idle',previewFacing=0;
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
 const stage=el('div',{className:'shm-stage'},canvas,bubble);
 const side=el('div',{className:'shm-side'},stage,el('div',{className:'shm-dice'},dice,undo,reset),poses);
 const category=el('select',{className:'shm-select',ariaLabel:'Appearance category'},...TABS.map(t=>el('option',{value:t.id,textContent:t.name})));
 const categoryRow=el('label',{className:'shm-category'},'Edit',category);
 const tabs=el('div',{className:'shm-tabs',role:'tablist',ariaLabel:'Appearance category'});
 const pages=el('div',{className:'shm-pages',role:'tablist',ariaLabel:'Part, colour or adjust'});
 const body=el('div',{className:'shm-body',id:'shm-body',role:'tabpanel'});
 const panel=el('div',{className:'shm-panel'},el('div',{},tabs,categoryRow),pages,body);
 root.append(el('div',{className:'shm-main'},panel,side));
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
 scene.add(new THREE.HemisphereLight(0xffffff,0xc8a878,2.2));
 const sun=new THREE.DirectionalLight(0xfff4e0,1.9);sun.position.set(2,4,5);scene.add(sun);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(.62,40),new THREE.MeshBasicMaterial({color:0xf6d79c}));floor.rotation.x=-Math.PI/2;scene.add(floor);
 const holder=new THREE.Group();scene.add(holder);
 const camera=new THREE.PerspectiveCamera(28,1,.05,50);
 let avatar=null,animator=null,spin=0,spinVelocity=0,dragging=null,frame=0,dirty=true,clock=performance.now(),focus=0;
 const frames={face:null,full:null};
 function rebuild(){
  if(avatar){avatar.root.removeFromParent();avatar.dispose();}
  avatar=buildAvatar(recipe,{shadows:false,faceSize:512});animator=createAvatarAnimator(avatar);holder.add(avatar.root);
  if(pose!=='idle'&&pose!=='walk'&&pose!=='sit')animator.play(pose);
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
 const faceFocus=()=>step==='look'&&FACE_TABS.has(tab);
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
  if(dirty){rebuild();dirty=false;}
  if(!dragging){spin+=spinVelocity*dt;spinVelocity*=Math.exp(-dt*3);if(Math.abs(spinVelocity)<.05)spin+=(previewFacing-spin)*Math.min(1,dt*1.5)*(pose==='walk'?0:1);}
  // A body faces -z in the town; here it turns round to face you.
  holder.rotation.y=Math.PI+spin+(pose==='walk'?now/1000*.6:0);
  const talking=speech&&speech.typing;
  animator.update(dt,{speed:pose==='walk'?1.2:0,seated:pose==='sit',seatHeight:.42,talk:talking?.5+.5*Math.sin(now/70):0,
   expression:step==='hello'?'happy':pose==='Hop'?'happy':pose==='Kachashi'?'laugh':pose==='idle'?'neutral':'smile'});
  aim(dt);renderer.render(scene,camera);
 }
 canvas.addEventListener('pointerdown',e=>{dragging={x:e.clientX,spin,t:performance.now()};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=(e.clientX-dragging.x)/Math.max(120,canvas.clientWidth)*Math.PI*1.6;spinVelocity=(spin-(dragging.spin+dx))/-.016;spin=dragging.spin+dx;spinVelocity=THREE.MathUtils.clamp(spinVelocity,-8,8);});
 const endDrag=()=>{dragging=null;};canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
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
  a.root.rotation.y=framing==='figure'?.35:framing==='feet'?.6:.2;thumbScene.add(a.root);a.root.updateMatrixWorld(true);
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
  // A hat on the hat tab only, and a bare head for the hairstyles and earrings.
  if(control.at!=='outfit.hat')r.outfit.hat='none';
  if(control.at==='outfit.bottom')r.__bottom=true;
  const flat=!['head','figure','feet'].includes(control.draw);
  const key=control.at+'|'+value+'|'+JSON.stringify(flat?{eyes:r.eyes,brows:r.brows,nose:r.nose,mouth:r.mouth,glasses:r.glasses,facial:r.facial,skin:r.body.skin}:{...r,name:0,profile:0});
  cached(key,c,()=>flat?drawPart(c.getContext('2d'),normalizeRecipe(r),control.draw,c.width):figureThumb(r,c,control.draw));
 }

 // ----- Editing -----
 function remember(){history.push(structuredClone(recipe));if(history.length>60)history.shift();undo.disabled=false;}
 function change(at,value,keep=true){
  if(at.startsWith('outfit')&&!outfitAllowedFor(wardrobeOwner,at==='outfit'?value:{...recipe.outfit,[at.split('.')[1]]:value}))return;
  if(get(recipe,at)===value)return;
  if(keep)remember();
  set(recipe,at,value);recipe=normalizeRecipe(recipe);dirty=true;
 }
 function chooseTab(id){tab=id;category.value=id;const t=TABS.find(x=>x.id===id);if(!t.controls.some(c=>c.page===page))page='style';renderTabs();renderBody();body.scrollTop=0;syncFocus();}
 category.onchange=()=>chooseTab(category.value);
 function renderTabs(){
  if(!tabs.children.length)tabs.append(...TABS.map(t=>{const b=el('button',{role:'tab',id:'shm-tab-'+t.id,textContent:t.name});b.setAttribute('aria-controls','shm-body');b.onclick=()=>chooseTab(t.id);return b;}));
  [...tabs.children].forEach((b,i)=>{const active=TABS[i].id===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  const t=TABS.find(x=>x.id===tab);
  pages.replaceChildren(...PAGES.filter(([id])=>t.controls.some(c=>c.page===id)).map(([id,label])=>{const b=el('button',{role:'tab',textContent:label});b.setAttribute('aria-selected',String(id===page));b.onclick=()=>{page=id;renderTabs();renderBody();};return b;}));
 }
 tabs.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=TABS.findIndex(t=>t.id===tab),n=e.key==='Home'?0:e.key==='End'?TABS.length-1:(i+(e.key==='ArrowRight'?1:-1)+TABS.length)%TABS.length;chooseTab(TABS[n].id);tabs.children[n].focus();tabs.children[n].scrollIntoView({block:'nearest',inline:'nearest'});};
 let pictureQueue=[],pictureJobs=[],pictureFrame=0,picturesDue=0;
 // Pictures are drawn a few a frame, so a page opens at once and fills in.
 function paintQueued(){pictureFrame=requestAnimationFrame(()=>{const t0=performance.now();while(pictureQueue.length&&performance.now()-t0<12)pictureQueue.shift()();if(pictureQueue.length)paintQueued();});}
 function renderPictures(){clearTimeout(picturesDue);picturesDue=setTimeout(()=>{cancelAnimationFrame(pictureFrame);pictureQueue=[...pictureJobs];paintQueued();},180);}
 const pressed=(row,b)=>{for(const x of row.children)x.setAttribute('aria-pressed',String(x===b));};
 /** A meter of sixteen notches and the two buttons either side of it. */
 function stepper(label,at,less,more,after=()=>{}){
  const meter=el('div',{className:'shm-meter',ariaHidden:'true'});
  const paint=()=>{const v=get(recipe,at);meter.replaceChildren(...Array.from({length:16},(_,i)=>el('i',{className:i<Math.round(v*16)?'on':''})));};
  const bump=d=>{change(at,Math.round(Math.max(0,Math.min(1,get(recipe,at)+d))*16)/16);paint();after();};
  const minus=el('button',{type:'button',textContent:'−',ariaLabel:less,title:less}),plus=el('button',{type:'button',textContent:'+',ariaLabel:more,title:more});
  minus.onclick=()=>bump(-NOTCH);plus.onclick=()=>bump(NOTCH);paint();
  return el('div',{className:'shm-step'},el('span',{textContent:label}),minus,meter,plus);
 }
 function renderLook(){
  const t=TABS.find(x=>x.id===tab);
  if(t.id==='top'&&page==='style'){for(const [title,presets] of [['Island outfit sets',ISLAND_OUTFITS],['Island costumes',ISLAND_COSTUMES]]){const sets=el('div',{className:'shm-grid'});sets.setAttribute('aria-label',title);for(const preset of presets.filter(p=>outfitAllowedFor(wardrobeOwner,p.outfit))){const c=el('canvas',{width:136,height:136}),button=el('button',{type:'button',ariaLabel:preset.name,title:preset.name},c,preset.name);button.onclick=()=>change('outfit',{...recipe.outfit,...preset.outfit});sets.append(button);pictureJobs.push(()=>{const r=normalizeRecipe({...recipe,outfit:{...recipe.outfit,...preset.outfit}});cached('outfit|'+preset.name+'|'+JSON.stringify(r),c,()=>figureThumb(r,c,'outfit'));});}body.append(el('h3',{},title),sets);}}
  if(t.wardrobe&&page==='style'){
   const off=el('button',{type:'button',className:'shm-pill shm-undress',textContent:'Take all clothes off'});
   off.onclick=()=>{remember();Object.assign(recipe.outfit,{top:'tank',topColour:'#f4f1ea',pattern:'none',bottom:'underwear',bottomColour:'#7fb0d8',footwear:'barefoot',hat:'none'});Object.assign(recipe.accessories,{earrings:'none',neckwear:'none',pin:false});recipe=normalizeRecipe(recipe);dirty=true;renderBody();};
   body.append(el('p',{className:'shm-note',textContent:'Underneath it all: a tank top, underwear and bare feet. Tap something to put it on; the first picture takes it off.'}),off);
  }
  for(const control of t.controls.filter(c=>c.page===page)){
   if(control.label&&control.kind!=='toggle'&&control.kind!=='stepper')body.append(el('h4',{textContent:control.label}));
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
    body.append(el('h4',{textContent:'Position'}));
    const pad=el('div',{className:'shm-pad',role:'group',ariaLabel:'Move '+t.name.toLowerCase()});
    const directions=[['up','arrow-up','Move up',control.at,NOTCH],['down','arrow-down','Move down',control.at,-NOTCH],
     ['left','arrow-left',control.paired?'Closer':'Move left',control.horizontal,-NOTCH],['right','arrow-right',control.paired?'Wider apart':'Move right',control.horizontal,NOTCH]];
    for(const [cls,icon,label,at,delta] of directions){const b=iconButton(icon,label,{className:cls});b.onclick=()=>change(at,Math.round(Math.max(0,Math.min(1,get(recipe,at)+delta))*16)/16);pad.append(b);}
    pad.append(el('b',{textContent:control.paired?'apart':'move'}));
    body.append(pad);
   }else if(control.kind==='stepper'){
    body.append(stepper(control.label,control.at,control.less,control.more));
   }else if(control.kind==='toggle'){
    const b=el('button',{type:'button',className:'shm-toggle',textContent:control.label});b.setAttribute('aria-pressed',String(!!get(recipe,control.at)));
    b.onclick=()=>{change(control.at,!get(recipe,control.at));b.setAttribute('aria-pressed',String(!!get(recipe,control.at)));};
    body.append(b);
   }else if(control.kind==='chips'){
    const row=el('div',{className:'shm-chips'});
    for(const value of control.list.filter(v=>!control.at.startsWith('outfit')||outfitAllowedFor(wardrobeOwner,{...recipe.outfit,[control.at.split('.')[1]]:v}))){const b=el('button',{type:'button',textContent:LABEL[value]||value[0].toUpperCase()+value.slice(1)});b.setAttribute('aria-pressed',String(get(recipe,control.at)===value));b.onclick=()=>{change(control.at,value);pressed(row,b);};row.append(b);}
    body.append(row);
   }
  }
 }
 // Step 1: faces to start from. The first is whoever you came in with.
 let faces=[],faceSeed=0;
 function dealFaces(){faces=[recipe,...Array.from({length:11},()=>keepSelf(randomRecipe('face-'+Date.now().toString(36)+'-'+(faceSeed++)),recipe))];}
 function renderStart(){
  if(!faces.length)dealFaces();
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
  body.replaceChildren();
  if(step==='start')renderStart();else if(step==='profile')renderProfile();else if(step==='look')renderLook();
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
  angle.onchange=()=>{previewFacing=angle.value==='back'?Math.PI:0;spin=previewFacing;spinVelocity=0;};
  const select=el('select',{className:'shm-select',ariaLabel:'Preview pose'},...POSES.map(([id,label])=>el('option',{value:id,textContent:label})));select.value=pose;
  select.onchange=()=>{pose=select.value;if(!['idle','walk','sit'].includes(pose))animator.play(pose);else animator.stop();};
  poses.append(angle,select);
 }

 // ----- Buttons -----
 name.oninput=()=>{recipe.name=name.value.slice(0,24);};
 // The dice change how someone looks, never who they are.
 dice.onclick=()=>{remember();recipe=keepSelf(randomRecipe(),{...recipe,name:name.value});dirty=true;if(step==='start')faces[0]=recipe;renderBody();};
 undo.onclick=()=>{const r=history.pop();if(!r)return;recipe=r;name.value=recipe.name||'';dirty=true;undo.disabled=!history.length;renderBody();};
 reset.onclick=()=>{remember();recipe=keepSelf(CAST_RECIPES.Johansson,{...recipe,name:name.value});dirty=true;renderBody();};
 share.onclick=()=>{
  const code=encodeRecipe({...recipe,name:name.value});const link=shareLink?.(code);
  const text=el('textarea',{value:link||code,readOnly:true,ariaLabel:'Share link or code'});
  const paste=el('textarea',{placeholder:'Paste a code or link here to try it on',ariaLabel:'Import an islander'});
  const copy=el('button',{className:'shm-pill',textContent:'Copy'}),use=el('button',{className:'shm-pill',textContent:'Try the pasted one'}),done=el('button',{className:'shm-pill',textContent:'Done'});
  const layer=el('div',{className:'shm-share',role:'dialog',ariaModal:'true',ariaLabel:'Share your islander'},el('div',{},el('h3',{textContent:'Share your islander'}),el('p',{textContent:link?'Send this link and it opens the maker with your islander in it.':'This code is your islander. Anyone can paste it into their maker.'}),text,el('div',{className:'row'},copy),el('h3',{textContent:'Try someone else’s'}),paste,el('div',{className:'row'},use,done)));
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);copy.textContent='Copied';}catch{text.select();}};
  use.onclick=()=>{const raw=paste.value.trim();let code=raw;try{if(raw.includes('=')){const url=new URL(raw,location.href);code=url.searchParams.get('r')||url.searchParams.get('avatar');}}catch{code='';}const r=decodeRecipe(code||'');
   if(!r){use.textContent='That code did not work';return;}remember();recipe=r;name.value=r.name||'';dirty=true;renderBody();closeShare();};
  done.onclick=closeShare;shareLayer=layer;for(const child of root.children)child.inert=true;root.append(layer);done.focus();
 };
 function finish(saving){
  if(!root.isConnected)return;
  stopSpeech();cancelAnimationFrame(frame);cancelAnimationFrame(pictureFrame);clearTimeout(picturesDue);observer?.disconnect();viewport?.removeEventListener('resize',fitViewport);viewport?.removeEventListener('scroll',fitViewport);
  root.removeEventListener('keydown',swallow);root.removeEventListener('keyup',swallow);
  const out=normalizeRecipe({...recipe,name:name.value});
  avatar?.dispose();thumbTarget.dispose();renderer.dispose();renderer.forceContextLoss?.();floor.geometry.dispose();floor.material.dispose();root.remove();previousFocus?.focus?.();
  if(saving)onSave(out);onClose(out,saving);
 }
 close.onclick=()=>finish(false);

 rebuild();dirty=false;renderPoses();goTo(step);loop();close.focus();
 return {close:()=>finish(false),get recipe(){return normalizeRecipe({...recipe,name:name.value});},get root(){return root;},goTo};
}

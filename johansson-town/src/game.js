import {japaneseSign,signText} from './world/okinawa/signs.js';
import {recipeFor} from './avatars/cast.js';
import {saveResidentRecipe} from './avatars/wardrobe.js';
import {createIslandPlay,NAHA_ARRIVALS} from './island/play.js';
import {buildAirportArrivals} from './world/interiors/airport-arrivals.js';
import {createBookshopCustomers} from './people/bookshop-customers.js';
import {createPhotoStudio} from './photo/studio.js';
import {createGamepadInput,createMenuRepeat,lookStep} from './input/analogue.js';
import {createTouchSticks} from './input/touch-sticks.js';
import {createCameraControls,navigateControls,focusableControls} from './input/camera-controls.js';
import {createTownCatchup,MAX_ABSENCE_MINUTES} from './people/town-absence.js';
import {createTownCleanup} from './world/town-cleanup.js';
import {streetToRoom,roomToStreet} from './world/doorway.js';
import {buildClassroom} from './world/interiors/classroom.js';
import {buildOnsenInterior,ONSEN_ROOM} from './world/interiors/onsen.js';
import {realTownMinutes,clockCatchUp,townClockLineAt,readClockSetting,writeClockSetting,startingMinutes,createClock} from './town-clock.js';
import {createRamenPlayerService} from './people/ramen-player-service.js';
import {createRamenKitchen} from './people/ramen-kitchen.js';
import {RAMEN_LAYOUT} from './world/interiors/ramen-layout.js';
import {SAKURA_LAYOUT} from './world/interiors/sakura-layout.js';
import {createSakuraShop} from './people/sakura-shop.js';
import {createPeninsulaBusinesses,businessId} from './world/businesses.js';
import {buildCompactShop} from './world/interiors/compact-shops.js';
import {buildBusinessContent,BUSINESS_CONTENT_CATALOGUE} from './world/interiors/business-content.js';
import {WAREHOUSE} from './world/warehouse.js';
import {assignWorkplaces} from './people/workplaces.js';
import {createHomeResidents} from './people/home-residents.js';
import {buildKobanInterior} from './world/interiors/koban.js';
import {chooseOpening} from './world/openings.js';
import {createMotion,createAutoRun,swipeLook,steerYaw} from './input/touch-feel.js';
import {buildSatoRamenRoom} from './world/interiors/sato-ramen.js';
import {SATO_ROOM,SATO_COLLIDERS,SATO_MENU,SATO_RAMEN,SATO_GUEST_SEATS,SATO_LUNCH_DRINK,satoRamenOpen} from './world/sato-ramen-layout.js';
import {transitStop} from './world/transit.js';
import {buildDungeon} from './dungeon/dungeon.js';
import {createFists,bestWeapon} from './interact/fists.js';
import {CAVE_MOUTH} from './world/coyote-tunnel.js';
import {homeOwner} from './people/home-life.js';
import {buildResidentHome} from './world/interiors/resident-home.js';
import {createWorkplaceResidents} from './people/workplace-residents.js';
import {createResidentLedger} from './people/resident-personalities.js';
import {createTownActivities} from './people/town-activities.js';
import {createVenueService,MEALS} from './people/venue-service.js';
import {buildWarehouseInterior} from './world/interiors/warehouse.js';
import {createDetailStream} from './world/detail-stream.js';
import {createTownSections} from './render/town-sections.js';
import {createShopStreetView} from './render/shop-street-view.js?konbini-1';
import {createNeighbourChats,createChatBubble,clearChatLine} from './people/neighbour-chats.js?konbini-1';
import {createFacing} from './people/facing.js';
import {createIndoorResidents} from './people/indoor-residents.js?konbini-1';
import {buildSuppliedRoom,suppliedRoomBoundsBlocked,preloadSuppliedRooms,suppliedRoomReady,isSuppliedRoom} from './world/supplied-rooms.js?snappy=1';
import {FULL_TOWN} from './world/full-town-state.js';
import {travelProgress} from './progression/travel.js';
import {openWant,wantPool,heartLine,withArticle} from './people/friendship.js';
import {ensureDailyQuests,form3NudgeAllowed,hasDailyQuest,isDailyDone,markDailyDone,FORM3_NUDGE,QUAY_NUDGE,RADIO_821} from './progression/soft-quests.js';
import {buildIzakayaRoom,preloadIzakaya,izakayaReady} from './world/izakaya.js?snappy=1';
import {createIzakayaGuests} from './people/izakaya-guests.js';
import {controlVisibility,roomExitVisible} from './interact/control-visibility.js';
import {createTownSky} from './render/sky.js';
import {bicycleRiderFit,bicycleBlocked} from './world/bicycle-fit.js';
import {createBicycleController} from './world/bicycle-controller.js';
import {conversationViewport} from './conversation-layout.js';
import {shelfAimScore} from './interact/aim.js';
import {atmosphere} from './render/atmosphere.js?dusk-1';
import {clock as duskClock, daylight} from './render/dusk.js';
import {setOceanLight} from './world/ocean.js';
import {buildMayorOffice,buildMayorHome,buildCommunityKitchen,buildClinic} from './world/interiors/town-hall.js';
import {buildCityRestaurant,CITY_RESTAURANT} from './world/interiors/city-restaurant.js';
import {buildFamilyHome} from './world/interiors/family-home.js';
import {loadTownEnvironment} from './render/environment.js';
import {createHands} from './interact/hands.js?ui=compact-3';
import {lineFeeling} from './avatars/body-language.js';
import {sharedMind,startMindIfChosen} from './people/thuan-mind.js';
import {createNeighbourWriter} from './people/town-mind.js';
import {MOVES} from './avatars/moves.js';
import {createAvatarJohansson,playerRecipe,savePlayerRecipe,importRecipeFromURL} from './avatars/actors.js';
import {openCreator} from './avatars/creator.js';
import {assetURL} from './assets.js';
import {createBeerService,createDrinkProp,createBiteProp,setPropPortion,DRINKS} from './people/izakaya-beer.js';
import {DRUNK,LAGER_ALCOHOL,soberUp,wantsAnother,drink as drinkUp} from './people/drunk.js';
import {createShopCarry} from './interact/shop-carry.js';
import {townAudio} from './audio/town-audio.js?snappy=1';
import {routeAt,groundHeight,planHeight,setWalkSurface} from './world/layout.js?snappy=1';
import {createWalkSurface} from './world/walk-surface.js';
import {COAST_BOUNDS} from './world/peninsula.js';
import {createNeighbours} from './people/neighbours.js';
import {drawTownMap} from './world/map.js?snappy=1';
import * as THREE from '../vendor/three.module.js';
import { createTown } from './world/town.js?snappy=1';
import { createActivities } from '../activities.js?snappy=1';
import { createInspector } from '../inspect-3d.js';
import {createItemViewer} from './world/interiors/item-viewer.js';
import { createCastAI } from './people/schedules.js?snappy=1';
import { createCharacters } from './people/characters.js?snappy=1';
import { circleHitsRect,circleHitsCircle,standingHitsRect,canStepBetween,roomBoundsBlocked,townBoundsBlocked } from '../physics.js?snappy=1';
import { createCelPass } from './render/cel.js?snappy=1';
import { createInkPipeline, GRADE_DEFAULTS } from './render/ink-pipeline.js?snappy=1';
import { createInkRecovery } from './render/ink-recovery.js';
import {dressHud,runButtonFace} from './ui/hud-icons.js';

// Change the emitted game chunk URL when repairing a cached live runtime.
window.__JOHANSSON_RUNTIME_VERSION__='town-bicycle-ride-2';

const $=s=>document.querySelector(s);
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const mobile=isIOS||touch,tabletLike=touch&&Math.min(innerWidth,innerHeight)>=700,highTier=!mobile||tabletLike,shadows=highTier,canvas=$('#game');
// Tablets draw close to their screen: at 1.45 a 2x iPad stretched a small picture up and
// every edge stair-stepped. Phones stay a little lower to keep the frame rate.
let dprScale=1;
const renderDpr=()=>Math.max(1,Math.min(window.devicePixelRatio||1,mobile?(tabletLike?1.85:1.5):2)*dprScale);
/**
 * Keeps the frame rate up on slower devices: if frames average slower than about 24 a
 * second for a few seconds, the drawing buffer steps down a notch (never below 1x), and
 * it never steps back up within the session, so the picture does not pump.
 */
const dprGovernor={time:0,frames:0,cooldown:4};
/**
 * A "!" card over anyone who wants something today (people/friendship.js), the way a
 * life sim shows who has something to ask. Checked every couple of seconds, not every frame.
 */
let wantCardTexture=null,wantCardTimer=0;
function wantCard(){
 if(wantCardTexture)return wantCardTexture;
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
 ctx.fillStyle='#ffffff';ctx.strokeStyle='#2e2a33';ctx.lineWidth=8;ctx.beginPath();ctx.roundRect?.(14,10,100,92,26);if(!ctx.roundRect)ctx.rect(14,10,100,92);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(52,100);ctx.lineTo(64,122);ctx.lineTo(76,100);ctx.fill();ctx.stroke();ctx.fillStyle='#ffffff';ctx.fillRect(50,94,28,10);
 ctx.fillStyle='#e2563f';ctx.font='900 72px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',64,58);
 wantCardTexture=new THREE.CanvasTexture(c);wantCardTexture.colorSpace=THREE.SRGBColorSpace;return wantCardTexture;
}
function updateWantCards(dt){
 if((wantCardTimer-=dt)>0||!activities?.state)return;wantCardTimer=2;
 const names=wantPool();
 for(const p of world.people){
  const g=p.g,name=g.userData.name,want=!current&&openWant(activities.state,minutes,names,name);
  let card=g.userData.wantCard;
  if(!want){if(card)card.visible=false;continue;}
  if(!card){card=new THREE.Sprite(new THREE.SpriteMaterial({map:wantCard(),depthTest:true,transparent:true}));card.scale.set(.42,.42,1);card.name='Want card';card.raycast=()=>{};card.userData.dynamicProp=true;g.add(card);g.userData.wantCard=card;}
  const head=characters?.conversationTarget?.(g);card.position.set(0,head?Math.max(1.6,head.y-g.position.y+.62):2.2,0);card.visible=true;
 }
}
function governResolution(dt){
 if(!mobile||document.hidden)return;
 dprGovernor.cooldown-=dt;dprGovernor.time+=dt;dprGovernor.frames++;
 if(dprGovernor.time<3)return;
 const average=dprGovernor.time/dprGovernor.frames;dprGovernor.time=0;dprGovernor.frames=0;
 if(dprGovernor.cooldown>0||average<1/24||dprScale<=.62)return;
 dprScale=Math.max(.6,dprScale-.13);dprGovernor.cooldown=5;resizeRenderer();
}
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false,preserveDrawingBuffer:false});
renderer.setPixelRatio(renderDpr());renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=shadows;renderer.shadowMap.type=THREE.PCFShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8dce9);scene.fog=null;// The near plane sets how much of the depth buffer the first metre eats, and at 7cm
// it was eating most of it: a phone could not tell two centimetres apart at the far
// end of the street, and the harbour came back from one as flashing texture. Nothing
// gets within 15cm of the eye -- collision keeps the camera a third of a metre off
// any wall -- so the tighter plane bought nothing and cost better than twice the
// precision everywhere else.
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.15,480);
const bands=new Uint8Array([48,48,48,255,115,115,115,255,184,184,184,255,255,255,255,255]),gradient=new THREE.DataTexture(bands,4,1,THREE.RGBAFormat);gradient.needsUpdate=true;gradient.magFilter=THREE.NearestFilter;gradient.minFilter=THREE.NearestFilter;
const outlineMat=new THREE.MeshBasicMaterial({color:0x252821,side:THREE.BackSide}),boxCache=new Map();
const toon=(c,map=null)=>new THREE.MeshStandardMaterial({color:c,map,roughness:.82});
const boxGeo=s=>{const k=s.join(',');if(!boxCache.has(k))boxCache.set(k,new THREE.BoxGeometry(...s));return boxCache.get(k)};
function box(size,pos,color,parent,outline=true){const g=boxGeo(size),m=new THREE.Mesh(g,toon(color));m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);if(false&&outline){const o=new THREE.Mesh(g,outlineMat);o.position.copy(m.position);o.rotation.copy(m.rotation);o.scale.set(1.018,1.018,1.018);parent.add(o)}return m}
function mesh(geo,pos,color,parent,outline=true){const m=new THREE.Mesh(geo,toon(color));m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);if(false&&outline){const o=new THREE.Mesh(geo,outlineMat);o.position.copy(m.position);o.scale.set(1.022,1.022,1.022);parent.add(o)}return m}
function signTex(a,b,accent='#9b4035'){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='#efe3c7';x.fillRect(0,0,512,128);x.fillStyle=accent;x.fillRect(0,0,14,128);x.strokeStyle='#252821';x.lineWidth=5;x.strokeRect(5,5,502,118);x.fillStyle='#252821';x.textAlign='center';x.textBaseline='middle';x.font='700 43px Yu Gothic,system-ui';signText(x,japaneseSign(a),256,50,465,43);x.font='800 15px system-ui';signText(x,b.toUpperCase(),256,99,465,15);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}

const townSections=createTownSections({mobile});window.__JOHANSSON_SECTIONS__=townSections.stats;
const shopStreetView=createShopStreetView();window.__JOHANSSON_SHOP_VIEW__=shopStreetView.stats;
const town=new THREE.Group(),room=new THREE.Group();scene.add(town,room);room.visible=false;

// The drawn look, after Sakura Crossing (Kenton-GMI, MIT): quantised light with
// violet shadows, screen-space ink from the depth buffer, and an anime colour grade.
// Both halves fail soft — if the pipeline cannot be built the town renders exactly as
// it did before, which matters more than the look does.
const celPass=createCelPass();
/**
 * How the town is drawn, and what happens when the driver says no.
 *
 * The ink and the grade are the look. They used to be given up for the whole session
 * on the strength of one bad frame: a single throw disposed the pipeline, set it to
 * null and left the town rendering plain until reload. On a phone that is the wrong
 * trade. iOS drops and restores WebGL contexts under memory pressure and when a tab
 * is backgrounded, so the frame that fails is usually a moment rather than a verdict,
 * and what the player sees is the cel shading vanishing mid-walk and never returning.
 *
 * So a failure now costs a few seconds instead of the session. The pipeline is rebuilt
 * after a cooling-off that lengthens each time, a few times over, and a restored
 * context resets that immediately. A driver that truly cannot do it settles into the
 * plain path after the retries, which is where it used to start.
 */
const INK_OPTIONS={
 // Supersampling is what keeps the line work clean, and it is also the most
 // expensive thing here. renderDpr already holds a phone's draw buffer well below
 // its screen, so a modest factor there costs little and is what stops the ink
 // stair-stepping when the small buffer is scaled back up to a 3x display.
 // With MSAA on the scene target (ink-pipeline.js) supersampling is no longer what
 // keeps edges clean, so mobile renders at its drawing buffer and spends the budget
 // on resolution instead.
 superScale:mobile?1:1.25,samples:4,
 pixelBudget:mobile?2.4e6:4.6e6,
 // FXAA is a single pass and it is the one that resolves the line work, so it is
 // worth having on the devices whose buffers need it most.
 fxaa:true,
 // Sakura Crossing grades flat painted colour. This town is built on photographed
 // concrete and timber, which starts darker and busier, so the darks are tinted
 // less heavily and lifted further than the reference does — otherwise the street
 // goes to mud rather than to violet.
 inkOptions:{thickness:1.05,strength:.68,concaveAmount:.25},
 // Bright, soft and saturated, the way a life-sim island is: pale lilac shadows, a
 // gentle lift in the darks and almost no vignette.
 gradeOptions:{shadowTint:0xe0dcf0,lift:.045,saturation:1.08,warmth:.02,vignette:.05}
};
const inkRecovery=createInkRecovery({retries:4,cooldown:3500});
let pipeline=null;
/** Plain output, for while the ink is away. */
function renderPlain(){renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=.96;}
function buildInk(){
 try{pipeline=createInkPipeline(renderer,INK_OPTIONS);renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1;return true;}
 catch(error){pipeline=null;console.warn('Ink pipeline unavailable, rendering plain:',error.message);renderPlain();return false;}
}
buildInk();
// A restored context is the one case worth trying again at once: the old pipeline's
// targets died with the context and the new one will be built against a live driver.
renderer.domElement.addEventListener('webglcontextrestored',()=>inkRecovery.restored(),false);
window.__JOHANSSON_LOOK__={get ink(){return !!pipeline;},get inkFailures(){return inkRecovery.failures;},get inkRetrying(){return !pipeline&&inkRecovery.retrying;},cel:celPass.stats,
 get scale(){return pipeline?pipeline.width/Math.max(1,renderer.getDrawingBufferSize(new THREE.Vector2()).x):1;},
 // What the east lawn's planting is actually wearing. The shrubs take the park's own
 // leaf once the model streams in, and when that hand-over goes wrong they render as
 // white blobs on the grass with nothing in the console to say so.
 get planting(){
  let found=null;
  scene.traverse(o=>{if(found||o.name!=='East lawn planting')return;
   found={count:o.count,uv:!!o.geometry.attributes.uv,map:!!o.material.map,
    image:!!o.material.map?.image,tint:'#'+o.material.color.getHexString(),
    instance:o.instanceColor?[...o.instanceColor.array.slice(0,3)].map(v=>+v.toFixed(2)):null};});
  return found;
 },
 // Live knobs, so the look can be judged against the town instead of against numbers.
 tune:v=>pipeline?.tune(v),
 flatten:v=>celPass.setFlatten(v),
 get lights(){return {ambient,bounce,uplight,sun};},
 get state(){return pipeline?.state||null;}};
let celTick=0;
/** Cel-shades whatever has arrived since the last sweep. Districts stream in for the
 * whole session, so this cannot be a one-off at startup. */
function sweepCel(dt){
 if((celTick-=dt)>0)return;
 celTick=.4;
 celPass.apply(scene);
}
sweepCel(0);
/**
 * Runs one frame's drawing through the ink and grade, or straight out without them.
 *
 * A driver that cannot give us a depth texture or a half-float target throws on the
 * first frame rather than at construction, so the fallback lives here: the look is
 * dropped once, tone mapping comes back, and the town keeps running. Being playable
 * beats being drawn.
 */
function present(draw,view=camera){
 if(!pipeline){
  if(inkRecovery.ready())buildInk();
  if(!pipeline){draw(renderer);return;}
 }
 pipeline.setCamera(view);
 try{pipeline.render(draw);}
 catch(error){
  const again=inkRecovery.failed();
  console.warn('Ink pipeline failed, rendering plain'+(again?', retrying shortly':' for good')+':',error.message);
  try{pipeline.dispose();}catch{}
  pipeline=null;
  // Whatever threw may well be the call that unbinds the target, so this one is
  // allowed to fail too rather than take the frame down with it.
  try{renderer.setRenderTarget?.(null);}catch{}
  renderPlain();
  draw(renderer);
 }
}
loadTownEnvironment(scene,renderer);
const townSky=createTownSky(scene);
// Two-light anime setup. One warm key that the ramp quantises into flat bands, one
// strong cool bounce from the opposite quarter, and a weak up-light — because an
// anime background has *coloured* shadows rather than dark ones, and the fill has to
// be strong enough to carry them. The hemisphere's ground colour is violet for the
// same reason. MeshToonMaterial ignores scene.environment entirely, so the HDR that
// used to do this work no longer reaches the town and these lights replace it.
// A toon ramp shapes direct light only, and MeshToonMaterial has no image-based
// lighting at all, so the sky fill has to make up what scene.environment used to add.
const CEL_FILL=1.35;
// With tone mapping off, the grade carries the overall level; flat bands need more
// headroom than the rolled-off highlights AgX used to give.
const CEL_EXPOSURE=1.04;
const NIGHT_TINT=Object.freeze({light:GRADE_DEFAULTS.lightTint??0xffffff,shadow:0xe0dcf0});
const ambient=new THREE.HemisphereLight(0xdbe7f2,0x6b5f8c,1.15);scene.add(ambient);
const bounce=new THREE.DirectionalLight(0x9db6e8,1.25);bounce.position.set(26,16,-22);scene.add(bounce);
const uplight=new THREE.DirectionalLight(0xc9b9e0,.35);uplight.position.set(4,-18,6);scene.add(uplight);
const sun=new THREE.DirectionalLight(0xffdca8,highTier?2.6:2.3);sun.position.set(-28,38,18);sun.castShadow=shadows;
if(shadows){sun.shadow.mapSize.set(tabletLike?1024:2048,tabletLike?1024:2048);sun.shadow.camera.left=-26;sun.shadow.camera.right=26;sun.shadow.camera.top=26;sun.shadow.camera.bottom=-26;sun.shadow.camera.near=.5;sun.shadow.camera.far=120;sun.shadow.bias=-.00035;sun.shadow.normalBias=.045}scene.add(sun);

// Separate bookshop, dock workshop and harbour office keep their own addresses.
const SITES=createPeninsulaBusinesses();

const interactables=[],roomColliders=[],doors=new Map();
let catchingUp=false,hiddenAt=0;
// Declared before the activities are created: they restore a saved clock time through
// onTime() at creation, which reads this. Declared further down, a saved game could not start.
let followRealClock=true;
// Goods off Sakura's shelves, held up to read (item-viewer.js). Made the first time
// something is picked up.
let itemViewer=null;
let inspector=null,content=null,castAI=null,hands=null,fists=null,storeService=null,ramenPlayerService=null,venueService=null,izakayaTV=null,seated=false,parkSeat=null,touchRunning=false;
let bicycleRide=null;
// PURPOSE BRIEF soft-guides: calendar dayKey soft quests (stand Form 3 / quay / notice).
// Contextual touch-control state. Declared with the rest of the player state because
// starting play stamps the touch clock, and that can happen while this module runs.
let controlsMovingUntil=0,controlsTargetUntil=0,controlsTouchedAt=0;
let stickHintUntil=0;
// A control under a finger must not be hidden out from under it. Any pointer release
// ends every press, so a control can never stay pinned on by a touch we lost track of.
const pressedControls=new Set();
let neighbours=null,islandPlay=null;let photoOrigin=null,photoReturning=false;
let conversationName=null,conversationCamera=null,navigationTarget=null,beerService=null,tipsy=0,tipsyClock=null;
let activeRoomLayout=null;
let photoStudio=null,photoLoading=false;
let current=null,active=null,started=false,yaw=0,pitch=-.05,minutes=realTownMinutes(),subtitleTimer=0,weather=false,activities=null,timePreset=0,characters=null;
const keys={},clock=new THREE.Clock();
const gamepadInput=createGamepadInput(),menuRepeat=createMenuRepeat();
let controllerFrame=gamepadInput.sample([]),controllerConnected=false;
const cameraControls=createCameraControls({onChange:()=>syncView(),onCentre:centreCamera,onOpen:()=>resetInput(),onClose:()=>resetInput()});
camera.fov=cameraControls.settings.fov;camera.updateProjectionMatrix();
document.documentElement.classList.toggle('touch-controls',touch);
function centreCamera(){pitch=0;camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
function controlsAllowed(){return !islandPlay?.active&&!photoStudio?.active&&!photoLoading&&!photoReturning&&!creatorOpen&&started&&!document.hidden&&!roomLoading&&!activities?.paused&&!inspector?.active&&!cameraControls.active&&$('#directory').classList.contains('hidden')&&$('#qte').classList.contains('hidden');}
// Swipes scale to the screen and barely tip the view when they are mostly sideways (input/touch-feel.js).
function dragLook(dx,dy){const turn=swipeLook(dx,dy,innerWidth,cameraControls.settings);yaw+=turn.yaw;pitch=THREE.MathUtils.clamp(pitch+turn.pitch,-1.25,1.15);}
const walkMotion=createMotion(),touchAutoRun=createAutoRun();
const touchSticks=createTouchSticks({canvas,movePad:$('#stick'),stickBase:$('#stickBase'),stickKnob:$('#knob'),enabled:controlsAllowed,onDrag:dragLook});
async function openPhotoStudio(){
 if(photoLoading||photoStudio?.active||!started||creatorOpen||roomLoading||catchingUp||inspector?.active||activities?.paused)return;
 toggleDir(false);cameraControls.close();resetInput();photoLoading=true;photoOrigin={site:current,position:player.position.clone(),yaw,pitch,seated,parkSeat};
 try{
  if(!photoStudio){
   photoStudio=createPhotoStudio({scene,renderer,gameCamera:camera,cameraBlocked,
    getLocations:()=>[...new Map([...SITES.map(s=>({id:s.id,title:s.title,icon:s.homeOwner?'home':'door',site:s})),...(world.landmarks||[]).map(s=>s.id==='warehouse'?{id:s.id,title:s.title,icon:'door',site:s}:{id:s.id,title:s.title,icon:'map',x:s.exitPosition?.[0]??s.x,z:s.exitPosition?.[2]??s.z,y:s.exitPosition?.[1]}),{id:NAHA_ARRIVALS.id,title:NAHA_ARRIVALS.title,icon:'door',site:NAHA_ARRIVALS},{id:NAHA_TRIP.id,title:NAHA_TRIP.title,icon:'bowl',site:NAHA_TRIP},
     ...[{id:'photo-harbour',title:'Working harbour',x:-22,z:-39},{id:'photo-main',title:'Main shopping street',x:-3,z:-20},{id:'photo-beach',title:'East beach',x:38,z:-12},{id:'photo-garden',title:'Aoba pond garden',x:-28,z:118},{id:'photo-rainflower',title:'Rainflower Lane',x:90,z:101},{id:'photo-village',title:'Hoshizaki fishing village',x:132,z:190},{id:'photo-lighthouse',title:'West Cape lighthouse',x:-54,z:204}].map(p=>({...p,icon:'map'}))].map(p=>[p.id,p])).values()],
    onLocation:async place=>{if(current)leaveRoom();if(place.site){await enterRoom(place.site);if(!current)throw Error('Room unavailable');}
     else{let x=place.x,z=place.z;if(environmentBlocked(x,z,.32)){[x,z]=findClear(x,z);if(environmentBlocked(x,z,.32))throw Error('Choose a clear place');}player.position.set(x,place.y??groundHeight(x,z),z);yaw=0;pitch=0;}},
    getContext:()=>({position:player.position.clone(),yaw,
     cast:(characters?.actors||[]).map(a=>({name:a.entity.userData.name||a.avatar?.recipe?.name||'Resident',recipe:a.avatar?.recipe,outfit:a.outfit})),
     hide:[camera,johansson?.root,...(characters?.actors||[]).map(a=>a.entity)]}),
    draw:(view,position)=>{if(!current)townSections.render({renderer,scene,camera:view,town,position});else if(current.id==='market')shopStreetView.render({renderer,scene,camera:view,town,room,frontage:current.streetFrontage?{...current.streetFrontage,interiorZ:sakuraShop.layout.frontZ}:null});else renderer.render(scene,view);},
    onOpen:()=>{resetInput();neighbourChats.cancel();chatBubble.hide();$('#prompt').classList.remove('on');izakayaTV?.update({camera,active:false,paused:true});townAudio.update({player:player.position,yaw,minutes,rain:weather,inside:!!current,station:activities.state.radioStation||0,paused:true});},
    onClose:()=>{const origin=photoOrigin;photoOrigin=null;photoReturning=true;const restore=async()=>{if(!origin)return;if(current?.id!==origin.site?.id){if(current)leaveRoom();if(origin.site)await enterRoom(origin.site);}player.position.copy(origin.position);yaw=origin.yaw;pitch=origin.pitch;seated=origin.seated;parkSeat=origin.parkSeat;johansson?.seat?.(seated?(parkSeat?.soak?'Soak':'Sit'):null);syncView();};restore().finally(()=>{photoReturning=false;}).catch(e=>console.warn('Photo return failed',e));resetInput();clock.getDelta();if(townClock.mode==='set')townClock.set(minutes,townClock.speed);resizeRenderer();},
   });
  }
  photoStudio.open();
 }catch(error){console.warn('Photo studio could not open',error);say('Photo studio could not open. Please try again.',4);}
 finally{photoLoading=false;}
}
$('#photoButton').onclick=openPhotoStudio;
function openCamera(){if(!started||inspector?.active||activities?.paused)return;cameraControls.open();}
$('#cameraButton').onclick=()=>{toggleDir(false);openCamera();};$('#viewButton')&&($('#viewButton').onclick=()=>{if(started){toggleDir(false);setThirdPerson(!thirdPerson);}});$('#movesButton')&&($('#movesButton').onclick=()=>{toggleDir(false);movesMenu();});
const PLAYER_RADIUS=.28,NPC_RADIUS=.35,MAX_FRAME_DT=.1,SIM_STEP=1/60;
const move2=new THREE.Vector2(),fwVec=new THREE.Vector3(),rtVec=new THREE.Vector3(),moveVec=new THREE.Vector3(),turnQ=new THREE.Quaternion(),yAxis=new THREE.Vector3(0,1,0);

const player=new THREE.Group();scene.add(player);player.position.set(0,0,46);
player.visible=false;

const reg=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};if(!interactables.includes(o))interactables.push(o)};
function say(t,sec=3){const e=$('#subtitle');e.textContent=t;e.classList.add('on');subtitleTimer=sec}

 const world=createTown({scene:town,sites:SITES,townMode:'peninsula',mobile,shadows,maxAnisotropy:renderer.capabilities.getMaxAnisotropy(),register:reg,enter:s=>crossThreshold(()=>enterRoom(s)),getPlayerPosition:()=>player.position,onAction:(...args)=>{if(islandPlay?.action(...args))return;if(args[0]==='bicycle'){startBicycleRide(args[1]);return;}if(args[0]==='dungeon'){enterDungeon();return;}if(args[0]==='resident'){const person=world.people.find(p=>p.g.userData.name===args[1]);if(person?.g.userData.sleeping){say(args[1]+' is sleeping. You can stay and watch the morning routine.',4);return;}if(person?.g.userData.waking||person?.g.userData.roomTransition){say(args[1]+' is '+person.g.userData.activity+'.',3);return;}if(person){person.g.userData.facePlayerUntil=performance.now()+1600;characters?.gesture(person.g);}}if(args[1]==='Convex traffic mirror')world.beats?.mirror();activities.action(...args);}});
assignWorkplaces(world,SITES);
// The evening boat to Naha leaves from the ferry terminal: dinner with Thuan in the city
// (interiors/city-restaurant.js). It is an outing, not a door in town, so it is not one of
// the SITES: no map pin, no directory entry.
const NAHA_TRIP=Object.freeze({...CITY_RESTAURANT,arrival:true,x:6.4,z:-42.6,door:[6.4,0,-42.6],exitPosition:[6.4,0,-42.6],entryFacing:0,color:0x2b2d5a,accent:'#2b2d5a',
 line:'Evening boat to Naha · back on the last sailing'});
if(world.townMode==='peninsula'){
 const naha=new THREE.Object3D();naha.position.set(6.4,1.2,-43.3);town.add(naha);
 reg(naha,'Take the evening boat to Naha with Thuan',()=>{
  const m=((minutes%1440)+1440)%1440;
  if(m<CITY_RESTAURANT.sailFrom||m>CITY_RESTAURANT.sailUntil){say('The evening boat to Naha sails from 17:00 until half past nine. Thuan said she would meet you here.',5);return;}
  activities.action('city-trip',null,{go:()=>crossThreshold(()=>enterRoom(NAHA_TRIP))});
 });
}
SITES.forEach(s=>doors.set(s.id,new THREE.Vector3(...(s.door||[s.side*4,0,s.z+2.5]))));
for(const place of world.landmarks||[])doors.set(place.id,new THREE.Vector3(...place.exitPosition));
// Start seated on the east sidewalk, looking across at Sakura Shōten.
const konbini=SITES.find(site=>site.id==='market');
const konbiniDoor=doors.get('market');
const benchSeat=(!FULL_TOWN.active&&world.sakuraBench?.seat)||null;
if(benchSeat){
  player.position.set(...benchSeat.position);
  yaw=benchSeat.yaw;pitch=benchSeat.pitch;
  parkSeat={position:benchSeat.position,stand:benchSeat.stand,eyeY:benchSeat.eyeY,yaw:benchSeat.yaw,pitch:benchSeat.pitch};
  seated=true;world.spawn=benchSeat.stand;
}else if(konbiniDoor){player.position.copy(konbiniDoor);yaw=konbini.streetFrontage?.yaw??Math.PI/2;world.spawn=player.position.toArray();}
else if(world.spawn)player.position.set(...world.spawn);
activities=createActivities({say,onOutfit:on=>wearSwim(on),getOutfit:()=>swimwear,onMove:name=>{johansson?.play(name);},getBeerTable:()=>beerService?{drink:beerService.drink,dish:beerService.dish,order:beerService.pending,naoHere:!!world.people.find(p=>p.profile.name==='Nao'&&p.g.userData.inIzakaya&&p.g.visible)}:null,onOrderDrink:kind=>!!beerService?.order(kind,parkSeat?.izakaya),getTipsy:()=>tipsy,onSip:()=>sipDrink(),onEat:()=>eatDish(),onTreat:name=>{const g=world.people.find(p=>p.profile.name===name)?.g;if(g){g.userData.residentSpeech={text:"Cheers!",until:minutes+4};characters?.gesture?.(g);}},onInspectModel:item=>inspector.open(item),onInspectShopGood:item=>{resetInput();document.exitPointerLock?.();(itemViewer??=createItemViewer()).open(item);},getResidentLocations:()=>castAI?.snapshot?.(),getTableService:()=>current?.id==='ramen'&&Number.isInteger(parkSeat?.ramenSeatId)?ramenPlayerService:null,onStand:standUp,onConversation:setConversation,onDialoguePhase,getMinutes:()=>minutes,getSocialContext:()=>({inside:current?.id,thuanAvailable:world.people.some(p=>p.profile.name==='Thuan'&&p.g.userData.inMarket&&p.g.visible&&!p.g.userData.sleeping),names:current?.id==='izakaya'?izakayaGuests.sync(minutes):current?.id==='ramen'?ramenGuests.sync(minutes):[]}),onMap:()=>{const c=document.createElement("canvas");c.width=680;c.height=640;c.style.width="100%";c.style.height="auto";c.style.position="static";c.setAttribute("aria-label","Folded visitor map, Johansson Town, 1997");drawTownMap(c.getContext("2d"),c.width,c.height,{sites:SITES,landmarks:world.landmarks,people:world.people,player:current?doors.get(current.id):player.position,yaw,visited:activities.state.visited});return c;},onPhone:()=>{const p=world.people.find(p=>p.g.userData.name==='Harbour master');if(p&&(FULL_TOWN.active||p.g.position.z<-37)){characters.gesture(p.g);activities.close();say('The harbour master answers from the quay.',4);return true;}return false;},onPurchase:name=>{const p=new THREE.Vector3();active?.object?.getWorldPosition(p);hands.offer(name,p);return true;},onSeat:name=>{if(active?.object?.userData.reservedBy){say('That seat is occupied.',3);return true;}const selected=active?.object?.userData.seat;if((selected?.soak||selected?.wash)&&!activities.onsenPaid()){say('Pay ¥300 at the bandai by the door first.',4);return true;}if(selected?.soak||selected?.wash)wearSwim(true);{const inside=selected?.izakaya?'inIzakaya':Number.isInteger(selected?.ramenSeatId)?'inRamen':null;if(inside&&world.people.some(p=>p.g.userData[inside]&&p.g.visible&&Math.hypot(p.g.position.x-selected.position[0],p.g.position.z-selected.position[2])<.4)){say('Someone is already sitting there.',3);return true;}}if(selected?.storeSeatId&&(storeService?.occupied(selected.storeSeatId)||world.people.some(p=>p.g.userData.inMarket&&p.g.userData.storeSeatId===selected.storeSeatId))){say('That chair is occupied.',3);return true;}activities.close();const ax=player.position.x,az=player.position.z,ay=player.position.y,seat=active?.object?.userData.seat,approachClear=!environmentBlocked(ax,az)&&!occupiedByPerson(ax,az);const sit=seat?.position||[ax,ay,az];const stand=approachClear?[ax,ay,az]:seat?.stand||(()=>{const p=findClear(ax,az);return [p[0],ay,p[1]];})();parkSeat={seatId:seat?.id,ramenSeatId:seat?.ramenSeatId,storeSeatId:seat?.storeSeatId,izakaya:seat?.izakaya||null,surfaceY:seat?.surfaceY,soak:!!seat?.soak,wash:!!seat?.wash,beachCorner:!!seat?.beachCorner,position:sit,stand,eyeY:seat?.eyeY??1.15,yaw:Number.isFinite(seat?.yaw)?seat.yaw:yaw,pitch:Number.isFinite(seat?.pitch)?seat.pitch:pitch};player.position.set(...parkSeat.position);if(Number.isFinite(parkSeat.yaw))yaw=parkSeat.yaw;if(Number.isFinite(parkSeat.pitch))pitch=parkSeat.pitch;seated=true;johansson?.seat(parkSeat.soak?'Soak':'Sit');resetInput();say(Number.isInteger(parkSeat.ramenSeatId)?'Ramen counter · E or tap to order, eat or stand':parkSeat.izakaya?name+' · E to order a beer, drink or stand':name+' · E to stand',5);return true;},onDrink:name=>{activities.close();if(hands.held===name)hands.drink();else hands.offer(name,player.position,true);return true;},onEscort:()=>{activities.state.kenjiEscort='walking';activities.save();},onWeather:value=>{weather=value;world.setRain(value);},onTime:value=>{
  // time passes in the telling. The TIME button says what time and day it is in town.
  if(value&&typeof value==='object'){if(!followRealClock)minutes=value.restore;return;}
  if(value==='cycle'){if(followRealClock){clockMenu();return;}timePreset=(timePreset+1)%4;minutes=[1002,1110,1230,540][timePreset];}
  // Time spent on something moves the town on, whichever clock it keeps. In real time
  // the town then runs that far ahead of your own clock until you bring it back.
  else if(!followRealClock)minutes+=value;
  else if(Number.isFinite(value)&&value>0){minutes+=value;townClock.pass(value);activities.state.clockAhead=townClock.ahead;}
  evictIfClosed();}});
islandPlay=createIslandPlay({world,player,camera,activities,onWardrobe:(entity,outfit)=>characters?.wear(entity,outfit),getMinutes:()=>minutes,getRain:()=>weather,passTime:value=>{minutes+=value;townClock.pass(value);activities.state.clockAhead=townClock.ahead;activities.save();},place:(x,z)=>{standUpAt(x,z,0);resetInput();},enterNaha:()=>crossThreshold(()=>enterRoom(NAHA_ARRIVALS)),leaveNaha:()=>leaveRoom()});
syncView();
fists=createFists({camera,skin:playerRecipe()?.body?.skin||'#d9a57c',sleeve:playerRecipe()?.outfit?.topColour||'#3f6a8a'});
hands=createHands({scene,camera,say,consume:name=>{const i=activities.state.inventory.indexOf(name);if(i<0)return false;const lager=name==='Umineko lager';if(lager&&!wantsAnother(tipsy,LAGER_ALCOHOL)){say('Enough for tonight. The can goes back in your bag for tomorrow.',3);return false;}if(lager)tipsy=drinkUp(tipsy,LAGER_ALCOHOL);activities.state.inventory.splice(i,1);activities.state.inventory.push('Empty can');activities.save();return true;},onDrink:()=>johansson?.play(seated?'SitDrink':'Drink')});
// Johansson himself, for the third-person view. The model loads the first time the view is used.
const VIEW_KEY='johansson-town-view';
let thirdPerson=false,johansson=null,playerSpeed=0,playerRunning=false,thirdDistance=3.1;
const shopCarry=createShopCarry({holder:()=>johansson});
// Third person unless you have asked for your own eyes: a life-sim is about seeing your
// islander in the town (docs/AMPLIFY-AUDIT.md, decision 5). V switches.
try{thirdPerson=globalThis.localStorage?.getItem(VIEW_KEY)!=='first';}catch{}
/**
 * The Shimanchu maker, from the Town book. The town stops while it is open (it is a
 * menu, not a pause in the telling) and whoever you make walks out of it.
 */
let creatorOpen=false;
function openAvatarMaker(name=null){
 if(typeof name!=='string')name=null;
 if(creatorOpen)return;
 toggleDir(false);resetInput();document.exitPointerLock?.();creatorOpen=true;
 openCreator({owner:name||'Johansson',recipe:name?recipeFor(name):playerRecipe(),saveLabel:name?'Save appearance':'Save and play',voice:(freq,type)=>townAudio.blip?.(freq,type),shareLink:code=>new URL('./creator/?r='+code,location.href).href,
  onSave:r=>{if(name){saveResidentRecipe(name,r);if(name==='Thuan'){activities.state.thuanOutfit='clothes';const actor=characters.actors.find(a=>a.entity?.userData.name===name);if(actor)actor.entity.userData.alternativeOutfit='clothes';activities.save();}characters.refresh(name);say(name+' has a new look.',3);return;}savePlayerRecipe(r);ensureJohansson().setRecipe?.(r);if(!thirdPerson)setThirdPerson(true,false);say((r.name?r.name+' · ':'')+'Looking good. V switches between your eyes and this view.',4);},
  onClose:()=>{creatorOpen=false;resetInput();clock.getDelta();}});
}
// A shared link (?avatar=code) is somebody to walk the town as.
{const shared=importRecipeFromURL();if(shared)setTimeout(()=>say('Walking the town as '+(shared.name||'a new islander')+'.',4),4000);}
function ensureJohansson(){if(!johansson){johansson=createAvatarJohansson({scene});window.__JOHANSSON_MODEL__=johansson;}return johansson;}
/**
 * Indoors you see through your own eyes. A room is two or three metres across, and a
 * camera behind your islander in a classroom or a shop is mostly the back of their head
 * (docs/AMPLIFY-AUDIT.md, decision 5). The street view comes back at the door. The
 * onsen keeps whichever view you had: the bath is somewhere you look at yourself in.
 * Pressing V indoors is a real choice and is kept.
 */
let streetThirdPerson=null;
function roomView(entering,site){
 if(entering){if(thirdPerson&&site?.id!=='onsen'){streetThirdPerson=true;thirdPerson=false;hands.firstPersonVisible=true;}}
 else if(streetThirdPerson){streetThirdPerson=null;thirdPerson=true;ensureJohansson();hands.firstPersonVisible=false;}
}
function setThirdPerson(value,announce=true){if(bicycleRide&&value!==true){if(announce)say('Thuan stays in view while she rides.',2);return;}streetThirdPerson=null;thirdPerson=!!value;try{localStorage.setItem(VIEW_KEY,thirdPerson?'third':'first');}catch{}if(thirdPerson)ensureJohansson();hands.firstPersonVisible=!thirdPerson;const b=$('#viewButton');if(b){b.textContent=thirdPerson?'Behind him':'His own eyes';b.setAttribute('aria-pressed',String(thirdPerson));}if(announce)say(thirdPerson?'Third-person view · V to look through his eyes again':'First-person view · V to step back',3);}
function startBicycleRide(entry){
 if(bicycleRide||current||seated)return;
 const bike=entry||world.bicycle,thuan=world.people.find(p=>p.profile?.name==='Thuan');
 if(!bike||!thuan?.g.userData.visualReady||!thuan.g.userData.character){say('Thuan is still getting ready. Try the bicycle again in a moment.',4);return;}
 const object=bike.object,position=object.getWorldPosition(new THREE.Vector3()),heading=object.rotation.y||0;
 const previousThirdPerson=thirdPerson,colliderIndex=world.colliders.indexOf(bike.collider);
 if(colliderIndex>=0)world.colliders.splice(colliderIndex,1);
 const flagNames=['inWorkplace','inIzakaya','inOnsen','inMarket','inRamen','inHome','indoors','roomTransition','sleeping','sleepBlend','floorHeight','chairBlend','socialPose','seatHeight'];
 const flags=Object.fromEntries(flagNames.map(key=>[key,{exists:Object.hasOwn(thuan.g.userData,key),value:thuan.g.userData[key]}]));
 bicycleRide={bike,thuan,controller:createBicycleController({x:position.x,z:position.z,yaw:heading}),previousThirdPerson,colliderRemoved:colliderIndex>=0,wheelAngle:0,originParent:thuan.g.parent,originPosition:thuan.g.position.clone(),originRotation:thuan.g.rotation.clone(),originVisible:thuan.g.visible,flags};
 player.position.set(position.x,groundHeight(position.x,position.z),position.z);player.quaternion.setFromAxisAngle(yAxis,heading);player.visible=true;
 player.add(object);object.position.set(0,0,0);object.rotation.set(0,0,0);
 player.add(thuan.g);thuan.g.position.set(0,0,0);thuan.g.rotation.set(0,0,0);thuan.g.visible=true;
 for(const key of Object.keys(flags))delete thuan.g.userData[key];
 thuan.g.userData.playerControlled=true;thuan.g.userData.bicyclePhase=0;thuan.g.userData.socialPose='Sit';thuan.g.userData.seatHeight=.92;thuan.g.userData.activity='riding her bicycle';
 const actor=thuan.g.userData.character;if(actor){actor.last.copy(thuan.g.position);actor.speed=0;actor.moving=false;}
 const fit=actor?.isAvatar?bicycleRiderFit(actor.avatar.measure):{scale:1,saddle:.9575};bike.setRiderFit(fit);bike.animateRide(0,true);thuan.g.userData.bicycleFit=fit;
 playerSpeed=0;playerRunning=false;setRunning(false);resetInput();
 setThirdPerson(true,false);yaw=heading;pitch=-.12;thirdDistance=3.6;
 say('Thuan’s bicycle · WASD / left stick to ride · E to dismount',5);
}
function stopBicycleRide(){
 if(!bicycleRide)return;
 const ride=bicycleRide,{bike,thuan}=ride,x=ride.controller.state.x,z=ride.controller.state.z,heading=ride.controller.state.yaw;
 bike.animateRide(thuan.g.userData.bicyclePhase||0,false);bike.object.removeFromParent();world.group.add(bike.object);bike.object.position.set(x,groundHeight(x,z),z);bike.object.rotation.set(0,heading,0);
 bike.collider.x=x;bike.collider.z=z;
 bike.collider.w=(Math.abs(Math.cos(heading))*.62+Math.abs(Math.sin(heading))*1.88)*bike.object.scale.x;
 bike.collider.d=(Math.abs(Math.sin(heading))*.62+Math.abs(Math.cos(heading))*1.88)*bike.object.scale.x;
 if(ride.colliderRemoved)world.colliders.push(bike.collider);
 const rightX=Math.cos(heading),rightZ=-Math.sin(heading),thuanX=x-rightX*1.25,thuanZ=z-rightZ*1.25;
 thuan.g.removeFromParent();
 const wasInside=['inWorkplace','inIzakaya','inOnsen','inMarket','inRamen','inHome','indoors'].some(key=>ride.flags[key]?.value),parent=wasInside&&ride.originParent?.parent?ride.originParent:world.group;
 parent.add(thuan.g);
 if(wasInside){thuan.g.position.copy(ride.originPosition);thuan.g.rotation.copy(ride.originRotation);thuan.g.visible=ride.originVisible;}
 else{thuan.g.position.set(thuanX,groundHeight(thuanX,thuanZ),thuanZ);thuan.g.rotation.set(0,heading,0);}
 thuan.g.userData.playerControlled=false;delete thuan.g.userData.bicyclePhase;delete thuan.g.userData.bicycleFit;
 for(const [key,flag] of Object.entries(ride.flags)){delete thuan.g.userData[key];if(flag.exists)thuan.g.userData[key]=flag.value;}
 const [px,pz]=findClear(x+rightX*1.25,z+rightZ*1.25);player.position.set(px,groundHeight(px,pz),pz);
 const actor=thuan.g.userData.character;if(actor){actor.last.copy(thuan.g.position);actor.speed=0;actor.moving=false;}
 player.visible=false;player.quaternion.setFromAxisAngle(yAxis,heading);yaw=heading;playerSpeed=0;playerRunning=false;
 bicycleRide=null;resetInput();setThirdPerson(ride.previousThirdPerson,false);
 say('Thuan parks her bicycle. E to ride again.',3);
}
function playMove(name){if(!thirdPerson)setThirdPerson(true,false);ensureJohansson().play(name);}
function movesMenu(){if(!started||activities.paused)return;activities.menu('Moves','Johansson, sixty-odd, bald and sunburnt, in his kariyushi shirt. What will he do?',[...MOVES.map(([name,label])=>[label,()=>{activities.close();playMove(name);}]),['Back',activities.close]]);}
const tpPivot=new THREE.Vector3(),tpDir=new THREE.Vector3(),tpRight=new THREE.Vector3(),lookPoint=new THREE.Vector3();
/** Over the right shoulder, pulled in before anything solid comes between him and the lens. */
/** Whether the camera itself would be inside something: walls and anything taller than the lens. */
function cameraBlocked(x,z,y,r){
 const bounds=current?(activeRoomLayout?suppliedRoomBoundsBlocked(activeRoomLayout,x,z,r):roomBoundsBlocked(x,z,r)):townBoundsBlocked(x,z,r);if(bounds)return true;
 return (current?roomColliders:world.colliders).some(c=>(c.minY||0)<y+.12&&(!Number.isFinite(c.height)||(c.minY||0)+c.height>y-.12)&&circleHitsRect(x,z,r,c));
}
function placeThirdPerson(dt){
 // Seated, the lens rises a little so his head does not fill the view of the table. In a
 // bath he is down at the water, so it looks over his shoulder from standing height.
 const lens=johansson?.lens,tall=lens?lens.eye-1.6:0;
 const eye=(seated&&parkSeat?(parkSeat.soak?1.25:Math.min(1.45,parkSeat.eyeY-player.position.y)+.3):1.6)+tall;
 tpDir.set(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));tpRight.set(Math.cos(yaw),0,-Math.sin(yaw));
 tpPivot.set(player.position.x,player.position.y+eye+(camera.aspect<1?.18:0),player.position.z).addScaledVector(tpRight,lens?.side??.34);
 // On a portrait screen (an iPad held upright) the frame is narrow and his big Shimanchu
 // head filled a third of it: the lens stands further back and a little higher there.
 const portrait=camera.aspect<1,want=(current?2.2:3.2)*(portrait?1.32:1);let reach=want;
 // His own bench or chair is not in the way: only look for obstacles once clear of where he is.
 for(let d=.3;d<=want+.001;d+=.1){const x=tpPivot.x-tpDir.x*d,z=tpPivot.z-tpDir.z*d;if(Math.hypot(x-player.position.x,z-player.position.z)<.85)continue;if(cameraBlocked(x,z,tpPivot.y-tpDir.y*d,.16)){reach=Math.max(.3,d-.22);break;}}
 thirdDistance=reach<thirdDistance?reach:THREE.MathUtils.damp(thirdDistance,reach,4,dt);
 camera.position.copy(tpPivot).addScaledVector(tpDir,-thirdDistance);
 camera.position.y=Math.max(camera.position.y,player.position.y+.3);
}
/** R, the drink button, or Drink at the table: a can from the bag, or a sip of what Nao brought. */
function drinkNow(){if(parkSeat?.izakaya&&beerService?.drink)return sipDrink();return hands.drink();}
function sipDrink(){
 if(Math.max(sipDrink.busyUntil||0,eatDish.busyUntil||0)>performance.now())return false;
 const table=beerService?.drink;if(!table||table.left<=0)return false;
 const first=table.left===table.sips,r=beerService.sip();if(!r)return false;
 tipsy=drinkUp(tipsy,r.alcohol);minutes+=2;townClock.pass(2);activities.state.clockAhead=townClock.ahead;
 sipDrink.busyUntil=performance.now()+2500;
 if(thirdPerson&&johansson?.ready){johansson.play(first?'SitToast':'SitDrink');const prop=createDrinkProp(r.kind,{held:true});prop.userData.startPortion=table.left/table.sips;prop.userData.finishPortion=r.left/table.sips;setPropPortion(prop,prop.userData.startPortion,{immediate:true});johansson.hold(prop);clearTimeout(sipDrink.timer);sipDrink.timer=setTimeout(()=>johansson?.hold(null),2500);}
 else hands.sip(r.kind,table.left/table.sips,r.left/table.sips);
 say(first?"Cheers! The first mouthful is the coldest thing in Okinawa.":r.left?'Another mouthful. '+r.left+' left.':"The last of it. Nao glances over: Another drink?",3);
 return true;
}
/** A mouthful of ramen, or a sip of what came with it, at a ramen counter (ramen-player-service.js). */
function ramenMouthful(item,{drink,kind,start,finish}){
 minutes+=1;townClock.pass(1);activities.state.clockAhead=townClock.ahead;
 if(drink&&kind==='bottle')tipsy=drinkUp(tipsy,DRINKS.bottle.alcohol/6);
 if(thirdPerson&&johansson?.ready){
  johansson.play(drink?'SitDrink':'SitEat');
  const prop=drink?createDrinkProp(kind,{held:true}):createBiteProp(kind);
  if(drink){prop.userData.startPortion=start;prop.userData.finishPortion=finish;setPropPortion(prop,start,{immediate:true});}else{prop.userData.startPortion=1;prop.userData.finishPortion=0;}
  johansson.hold(prop);clearTimeout(sipDrink.timer);sipDrink.timer=setTimeout(()=>johansson?.hold(null),2500);
 }else if(drink)hands.sip(kind,start,finish);else hands.bite(kind);
}
/** E at the table with a dish in front of you: one mouthful of it. */
function eatDish(){
 if(Math.max(sipDrink.busyUntil||0,eatDish.busyUntil||0)>performance.now())return false;
 const r=beerService?.bite();if(!r)return false;
 minutes+=2;townClock.pass(2);activities.state.clockAhead=townClock.ahead;
 eatDish.busyUntil=performance.now()+2500;
 if(thirdPerson&&johansson?.ready){johansson.play('SitEat');const prop=createBiteProp(r.kind);prop.userData.startPortion=1;prop.userData.finishPortion=0;johansson.hold(prop);clearTimeout(sipDrink.timer);sipDrink.timer=setTimeout(()=>johansson?.hold(null),2500);}else hands.bite(r.kind);
 say(r.left?"Enjoy your meal. "+(r.left===1?'One mouthful left.':r.left+' mouthfuls left.'):"Thank you for the meal. The plate is clean.",3);
 return true;
}
const seatRay=new THREE.Raycaster(),seatDown=new THREE.Vector3(0,-1,0),seatFrom=new THREE.Vector3();
/**
 * Where his weight goes on this seat: the flat, sittable surface nearest the seat point,
 * found by looking straight down, so he sits on the planks of a small park bench and on
 * the cushion of a Minato stool rather than on an average height beside them.
 */
function seatFit(seat){
 if(seat.fit)return seat.fit;
 if(Number.isFinite(seat.surfaceY))return seat.fit={x:seat.position[0],z:seat.position[2],top:seat.surfaceY,found:true};
 const [sx,sy,sz]=seat.position,floor=sy,target=current?room:world.group,hits=[];
 for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){
  seatFrom.set(sx+i*.1,floor+1.1,sz+j*.1);seatRay.set(seatFrom,seatDown);seatRay.far=1.1;
  for(const h of seatRay.intersectObject(target,true)){
   if(!h.face||!h.object.visible)continue;const up=h.face.normal.clone().transformDirection(h.object.matrixWorld).y;
   if(up>.75&&h.point.y>floor+.2&&h.point.y<floor+.78){hits.push(h.point);break;}
  }
 }
 let fit={x:sx,z:sz,top:seat.eyeY-.74,found:false};
 if(hits.length){
  const bins=new Map();for(const p of hits){const k=Math.round(p.y/.03);bins.set(k,[...(bins.get(k)||[]),p]);}
  const best=[...bins.values()].sort((a,b)=>b.length-a.length)[0];
  fit={x:best.reduce((a,p)=>a+p.x,0)/best.length,z:best.reduce((a,p)=>a+p.z,0)/best.length,top:best.reduce((a,p)=>a+p.y,0)/best.length,found:true};
 }
 seat.fit=fit;return fit;
}
/** Swimwear on or off: the model changes, and the game remembers for the camera-less view. */
let swimwear=false;
function wearSwim(on){if(swimwear===!!on)return;swimwear=!!on;if(on&&!johansson)ensureJohansson();johansson?.wear(on?'swim':'clothes');if(on)say('You change into your swimming trunks at the lockers.',3);}
function updateJohansson(dt){
 if(!johansson)return;
 const r=johansson.root;r.position.copy(player.position);
 if(seated&&parkSeat){
  // Hips on the seat, facing the way the seat faces.
  if(Number.isFinite(parkSeat.yaw))r.rotation.set(0,parkSeat.yaw,0);
  if(johansson.ready){const fit=seatFit(parkSeat);r.position.set(fit.x,fit.top+.09-johansson.sitHip,fit.z);}
 }else r.quaternion.copy(player.quaternion);
 const partner=conversationName?(conversationName==='Thuan'?storeClerk:world.people.find(p=>p.g.userData.name===conversationName)?.g):null;
 if(partner){partner.getWorldPosition(lookPoint);lookPoint.y+=1.5;johansson.lookAt(lookPoint);}else johansson.lookAt(null);
 johansson.update(dt,{speed:playerSpeed,running:playerRunning,seated,tipsy,airborne:!!characters?.jumping,visible:thirdPerson&&started&&!inspector?.active&&!bicycleRide});
 // Sakura: one thing in his hand, more in a basket, until he pays (shop-carry.js).
 shopCarry.sync(activities?.state?.konbini?.basket,current?.id==='market'&&johansson.ready);
}
if(thirdPerson)setThirdPerson(true,false);
characters=createCharacters({mobile,shadows,onJump:()=>johansson?.jump(),canJump:()=>!seated&&!bicycleRide&&controlsAllowed(),isBlocked:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),onError:(name,error)=>console.warn('Character construction failed:',name,error)});characters.attach(player,'player',1.82);world.people.forEach(p=>characters.attach(p.g,p.g.userData.name,p.profile?.height));
// The people of the new streets: shopkeepers at their counters, the old men at gateball,
// Grandmother Higa on her verandah, a postman on his round. See people/neighbours.js.
neighbours=createNeighbours({parent:town,register:reg,characters,blocked:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),onAction:(kind,name)=>{
 const who=neighbours.talkTo(name,player.position);if(who)characters.gesture(who);activities.action(kind,name);
}});
world.neighbours=neighbours.entities;
// Thuan is the heaviest single asset in the town and she is kept at full detail, so
// fetching her before the first frame put nine megabytes in front of the chunks the
// game needs to start: on a 1.6 Mbps link that was most of the wait. She is still the
// first thing requested once the opening frame has painted, so she is in the window by
// the time the player crosses the road, and the procedural stand-in covers the gap.

inspector=createInspector({scene,camera,renderer,canvas,resetInput,onReturn:item=>{const o=content?.objects.get(item.id);if(o)o.visible=true;},onInspect:item=>{const o=content?.objects.get(item.id);if(o)o.visible=false;activities.inspectItem(item);if(item.id==='model')say(item.note,4);},onLink:()=>{},onContact:()=>{}});
content={items:BUSINESS_CONTENT_CATALOGUE,objects:new Map()};
const residentLedger=createResidentLedger(()=>activities.state);
const townCleanup=createTownCleanup({parent:town,register:reg,action:activities.action,getState:()=>activities.state,blocked:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c))});
const npcActivities=createTownActivities({getTargets:()=>interactables,collides:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),getPlayerPosition:()=>current?null:player.position,ledger:residentLedger,getState:()=>activities.state});
castAI=createCastAI({activities:npcActivities,world,player,getObserverPosition:()=>current?doors.get(current.id):player.position,state:()=>activities.state,paused:()=>false,collides:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c))});
const workplaceResidents=createWorkplaceResidents({world,parent:scene,getEntrance:()=>activeRoomLayout?.spawn||[0,0,5.2],getLayout:()=>activeRoomLayout,getTargets:()=>interactables,collides:environmentBlocked,getPlayerPosition:()=>player.position,getState:()=>activities.state,ledger:residentLedger,onBorrow:npcActivities.release});
const bookshopCustomers=createBookshopCustomers({world,parent:scene,getLayout:()=>activeRoomLayout,getPlayerPosition:()=>player.position,collides:environmentBlocked,getState:()=>activities.state,ledger:residentLedger,onBorrow:npcActivities.release,save:()=>activities.save()});
const chatBlocked=(a,b)=>!clearChatLine(a,b,current?roomColliders:world.colliders);
// The neighbours' small talk: written lines, or the town's language model when the
// player has turned it on (it then starts by itself on later visits). See town-mind.js.
const neighbourWriter=createNeighbourWriter({mind:sharedMind()});startMindIfChosen();
const neighbourChats=createNeighbourChats({world,observer:()=>player.position,blocked:chatBlocked,state:()=>activities.state,writer:neighbourWriter});
const chatBubble=createChatBubble({camera,canvas,target:g=>characters.conversationTarget(g),blocked:chatBlocked});
// Whoever you are talking to turns to face you, unless they are mid-something, in
// which case they answer over their shoulder. See people/facing.js.
const facing=createFacing({world,getPlayerPosition:()=>player.position});
let conversationLine=null;
/**
 * Conversations are staged like Shenmue: the camera sits over Johansson's shoulder on
 * whoever is talking to him, and cuts to the reverse angle, over their shoulder onto
 * him, while he says his line. Both shots stay on the same side of the pair, so a cut
 * never flips them round. If a wall or a shelf is where a shot would be, the two of
 * them share one side-on shot instead. The picture also eases up a little so faces sit
 * above the subtitles, and the ordinary camera (paused while a window is open) is left
 * where it was for when you walk away.
 */
let conversationShot='speaker',conversationSide=0,shotCut=true,conversationLift=0;
const speakerHead=new THREE.Vector3(),playerHead=new THREE.Vector3(),shotPos=new THREE.Vector3(),shotLook=new THREE.Vector3(),shotStep=new THREE.Vector3(),facingSpeaker=new THREE.Quaternion(),shotAim=new THREE.Matrix4(),shotQ=new THREE.Quaternion();
function onDialoguePhase({phase,seconds}){
 if(phase==='player'){
  conversationShot='player';shotCut=true;
  if(conversationLine?.speaker)conversationLine.speaker.userData.speakingUntil=0;
  johansson?.speak(seconds||2);
 }else if(conversationShot!=='speaker'){conversationShot='speaker';shotCut=true;}
}
/** Nothing solid between `from` and a lens at `to`. */
function shotClear(from,to){
 for(let t=.2;t<=1.001;t+=.1){shotStep.lerpVectors(from,to,t);if(cameraBlocked(shotStep.x,shotStep.z,shotStep.y,.14))return false;}
 return true;
}
/** An over-the-shoulder lens: behind `near`, off to `side`, looking at `far`. */
// Shimanchu heads are big, so the lens stands further back and wider to see past one.
const SHOULDER={back:1.05,side:.8,up:.16};
function overShoulder(near,far,ux,uz,side,out){
 return out.set(near.x-ux*SHOULDER.back+uz*side*SHOULDER.side,near.y+SHOULDER.up,near.z-uz*SHOULDER.back-ux*side*SHOULDER.side);
}
function frameConversation(dt){
 const speaker=conversationLine?.speaker;
 if(!speaker?.visible||bicycleRide)return;
 speakerHead.copy(characters.conversationTarget(speaker));
 playerHead.set(player.position.x,player.position.y+(johansson?.lens?.head??1.58),player.position.z);
 const dx=speakerHead.x-playerHead.x,dz=speakerHead.z-playerHead.z,dist=Math.hypot(dx,dz);
 if(dist<.2||dist>8)return;
 const k=1-Math.exp(-dt*4),want=Math.atan2(-dx,-dz);
 // Sitting down, you turn your head rather than your body: the view swings round to
 // whoever is talking, and the bench stays where it is.
 if(!seated){facingSpeaker.setFromAxisAngle(yAxis,want);player.quaternion.slerp(facingSpeaker,k);}
 yaw+=Math.atan2(Math.sin(want-yaw),Math.cos(want-yaw))*k;
 if(!thirdPerson||seated){
  const wantPitch=THREE.MathUtils.clamp(Math.atan2(speakerHead.y-(player.position.y+1.6),dist)-.06,-.3,.12);
  pitch+=(wantPitch-pitch)*k;camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);return;
 }
 const ux=dx/dist,uz=dz/dist;
 // Pick the side once per conversation: the one where both shoulders give a clear view.
 if(!conversationSide){
  conversationSide=2;
  for(const side of [1,-1]){
   if(shotClear(speakerHead,overShoulder(playerHead,speakerHead,ux,uz,side,shotPos))&&shotClear(playerHead,overShoulder(speakerHead,playerHead,-ux,-uz,-side,shotPos))){conversationSide=side;break;}
  }
 }
 if(conversationSide===2){
  // No clear shoulder: both of them, side on, from whichever side is open.
  const midX=playerHead.x+dx*.5,midZ=playerHead.z+dz*.5;let best=null;
  for(const side of [1,-1]){let sx=uz*side-ux*.45,sz=-ux*side-uz*.45;const n=Math.hypot(sx,sz);sx/=n;sz/=n;
   let reach=Math.max(1.8,dist*1.35);for(let d=.3;d<=reach;d+=.1)if(cameraBlocked(midX+sx*d,midZ+sz*d,playerHead.y,.16)){reach=Math.max(.9,d-.25);break;}
   if(!best||reach>best.reach+.05)best={sx,sz,reach};}
  shotPos.set(midX+best.sx*best.reach,playerHead.y+.12,midZ+best.sz*best.reach);shotLook.set(midX+dx*.15,playerHead.y-.08,midZ+dz*.15);
 }else if(conversationShot==='player'){
  overShoulder(speakerHead,playerHead,-ux,-uz,-conversationSide,shotPos);shotLook.copy(playerHead);shotLook.y-=.04;
 }else{
  overShoulder(playerHead,speakerHead,ux,uz,conversationSide,shotPos);shotLook.copy(speakerHead);shotLook.y-=.06;
 }
 shotAim.lookAt(shotPos,shotLook,yAxis);shotQ.setFromRotationMatrix(shotAim);
 // A cut is a cut; within a shot the lens only drifts.
 if(shotCut){camera.position.copy(shotPos);camera.quaternion.copy(shotQ);shotCut=false;}
 else{camera.position.lerp(shotPos,k*.6);camera.quaternion.slerp(shotQ,k);}
}
function updateConversationLift(dt){
 if(conversationLine)frameConversation(dt);
 const target=conversationLine?.1:0;
 if(Math.abs(target-conversationLift)<.001&&conversationLift===target)return;
 conversationLift+=(target-conversationLift)*Math.min(1,dt*7);
 if(Math.abs(target-conversationLift)<.002)conversationLift=target;
 const w=canvas.width,h=canvas.height;
 if(conversationLift>0)camera.setViewOffset(w,h,0,Math.round(h*conversationLift),w,h);else camera.clearViewOffset();
}
function residentSpeech(){const person=world.people.filter(p=>!p.g.userData.playerControlled&&p.g.userData.residentSpeech?.until>minutes&&p.g.visible&&p.g.userData.hit.inside===!!current&&(!p.g.userData.inMarket||current?.id==='market')).sort((a,b)=>a.g.position.distanceToSquared(player.position)-b.g.position.distanceToSquared(player.position))[0];return person?{speaker:person,text:person.g.userData.residentSpeech.text}:null;}
function roomHit(object,label,kind,title,text){reg(object,label,()=>activities.action(kind,title,text),true);return object;}
function roomCollider(x,z,w,d,height=2.8,minY=0){roomColliders.push({x,z,w,d,height,minY});}

// Umi-no-yu has one regular guest: Thuan, on the evenings she has been asked along.
const onsenGuests=createIndoorResidents({world,parent:scene,collides:environmentBlocked,getRain:()=>weather,place:'onsen',layout:{entrance:ONSEN_ROOM.spawn},getPlayerSeat:()=>parkSeat?.seatId,onBorrow:npcActivities.release,getState:()=>activities.state});
const izakayaGuests=createIzakayaGuests({world,parent:scene,collides:environmentBlocked,getPlayerSeat:()=>parkSeat?.izakaya?.position||null,getRain:()=>weather,getState:()=>activities.state,onBorrow:npcActivities.release,getThuan:()=>{const g=ensureThuan();if(!interactables.includes(g))reg(g,'Catch up with Thuan',()=>activities.action('resident','Thuan'),true);return g;}});
const ramenLife=new THREE.Group();ramenLife.name='Inakaya continuous dining';ramenLife.userData.sharedAsset=true;ramenLife.visible=false;scene.add(ramenLife);
// On the peninsula the ramen counter is Sato Ramen, inside Minato's building (world/sato-ramen-layout.js).
const satoRamen=()=>world.townMode==='peninsula';
const ramenBlocked=(x,z,r=.3)=>satoRamen()?suppliedRoomBoundsBlocked(SATO_ROOM,x,z,r)||SATO_COLLIDERS.some(c=>circleHitsRect(x,z,r,c)):suppliedRoomBoundsBlocked(RAMEN_LAYOUT,x,z,r)||RAMEN_LAYOUT.colliders.some(c=>circleHitsRect(x,z,r,c));
function hideRamen(){scene.add(ramenLife);ramenLife.visible=false;}
const ramenGuests=createIndoorResidents({world,parent:ramenLife,collides:ramenBlocked,getRain:()=>weather,place:'ramen',onBorrow:npcActivities.release,getState:()=>activities.state}),homeGuests=createHomeResidents({world,parent:scene,getState:()=>activities.state,collides:environmentBlocked,onBorrow:npcActivities.release,getRain:()=>weather});
// Mrs Sato's kitchen: she cooks and carries every bowl, the regulars' and yours (people/ramen-kitchen.js).
const satoKitchen=satoRamen()?createRamenKitchen({getCook:()=>{const g=world.people.find(p=>p.profile.name==='Mrs Sato')?.g;return g&&g.visible&&g.userData.inRamen&&!g.userData.roomTransition?g:null;}}):null;
const ramenMeals=createVenueService({room:ramenLife,place:'ramen',getMinutes:()=>minutes,ledger:residentLedger,getCustomers:()=>world.people.filter(p=>p.g.userData.inRamen),
 ...(satoRamen()?{staffName:'Mrs Sato',venueName:'Sato Ramen',getStaff:()=>world.people.find(p=>p.profile.name==='Mrs Sato')?.g||null,
  kitchen:satoKitchen,meal:MEALS.lunch,drinkFor:name=>SATO_LUNCH_DRINK[name]||'mugicha',tableFor:p=>SATO_GUEST_SEATS[p.g.userData.ramenSeat]?.table}:{})});
let storeClerk=world.people.find(p=>p.profile.name==='Thuan').g,storeWelcomed=false;
const sakuraShop=createSakuraShop({world,scene,state:activities.state,ledger:residentLedger,register:reg,action:activities.action,exit:leaveRoom,getMinutes:()=>minutes,getPlayerSeat:()=>parkSeat?.storeSeatId,getPlayerPosition:()=>player.position,isInside:()=>current?.id==='market',pay:activities.spend,say,onBorrow:npcActivities.release,getRain:()=>weather,save:()=>{if(!catchingUp)activities.save();}});
storeService=sakuraShop.service;
/**
 * Puts the real shop behind the real glazing, and retires the stand-in shelves that
 * stood there while it was only a facade. The interior arrives with the rest of the
 * street detail, so this is called again when it lands; until then the stand-in keeps
 * the window from being empty.
 */
function showShopThroughWindow(){
 const site=SITES.find(s=>s.id==='market');
 if(!site?.streetFrontage||!sakuraShop.street(town,site.streetFrontage)){sakuraShop.hide();return false;}
 if(site.standInFittings)site.standInFittings.visible=false;
 shopStreetView.invalidate();townSections.invalidate();
 return true;
}
function ensureThuan(){return storeClerk;}
function startVenueService(place){venueService=createVenueService({room,place,getMinutes:()=>minutes,ledger:residentLedger,getCustomers:()=>world.people.filter(p=>place==='izakaya'?p.g.userData.inIzakaya:p.g.userData.inRamen),getStaff:()=>place==='izakaya'?world.people.find(p=>p.profile.name==='Nao')?.g:null});}
function addRoomProps(s){
  if(s.id==='market'){shopStreetView.invalidate();storeWelcomed=false;sakuraShop.enter(room);roomColliders.push(...sakuraShop.colliders);sakuraShop.update(0);return;}
  if(s.id==='warehouse')return;
  if(s.id==='school'){roomColliders.push(...activeRoomLayout.colliders);activeRoomLayout.tick(0,minutes,elapsed);return;}
  if(s.id==='onsen'){roomColliders.push(...activeRoomLayout.colliders);activeRoomLayout.tick(0,minutes);onsenGuests.sync(minutes);return;}
  if(activeRoomLayout){
    if(s.id==='ramen'){room.add(ramenLife);ramenLife.visible=true;ramenGuests.sync(minutes);ramenPlayerService=createRamenPlayerService({room,getSeat:()=>Number.isInteger(parkSeat?.ramenSeatId)?parkSeat:null,getMinutes:()=>minutes,getBalance:()=>activities.state.yen,pay:activities.spend,say,
      onMouthful:ramenMouthful,canOrder:item=>item.prop==='beer'&&!wantsAnother(tipsy,DRINKS.bottle.alcohol)?"Mrs Sato shakes her head: You’ve had enough. Have a cold barley tea instead.":true,
      ...(satoRamen()?{menu:SATO_MENU,isOpen:satoRamenOpen,title:SATO_RAMEN.title,server:'Mrs Sato',kitchen:satoKitchen,closedLine:'Sato Ramen serves lunch, 11:00 to 14:00. Mrs Sato has put the stools up.'}:{})});}
    if(homeOwner(s)){activeRoomLayout.tick?.(0,minutes,elapsed);homeGuests.enter(activeRoomLayout.prepareBedding?{...s,homeLayouts:{[homeOwner(s)]:activeRoomLayout}}:s,minutes);}
    return;
  }
  if(s.id==='izakaya'){activeRoomLayout=buildIzakayaRoom({room,box,reg,collider:roomCollider,action:activities.action,exit:leaveRoom,signTexture:signTex});izakayaTV=activeRoomLayout.television;izakayaGuests.sync(minutes);startVenueService('izakaya');beerService=createBeerService({room,say,blocked:environmentBlocked,getNao:()=>{const n=world.people.find(p=>p.profile.name==='Nao')?.g;return n&&n.userData.inIzakaya&&n.visible&&!n.userData.roomTransition?n:null;}});const light=new THREE.HemisphereLight(0xffdfaa,0x886d5f,1.6);room.add(light);return;}

}

function clearRoom(){activeRoomLayout?.dispose?.();showShopThroughWindow();izakayaTV?.dispose();izakayaTV=null;activeRoomLayout?.workshop?.dispose();storeService?.cancel();ramenPlayerService?.dispose();ramenPlayerService=null;venueService?.dispose();venueService=null;beerService?.clear();beerService=null;workplaceResidents.restore();bookshopCustomers.restore();neighbourChats.cancel();chatBubble.hide();activeRoomLayout=null;izakayaGuests.restore();onsenGuests.restore();hideRamen();homeGuests.restore();roomColliders.length=0;const materials=new Set(),geos=new Set();room.traverse(o=>{for(let p=o;p&&p!==room;p=p.parent)if(p.userData.sharedAsset)return;if(o.isMesh){const list=Array.isArray(o.material)?o.material:[o.material];if(!o.userData.preserveMaterial)list.forEach(m=>m&&materials.add(m));if(![...boxCache.values()].includes(o.geometry))geos.add(o.geometry);}});materials.forEach(m=>{if(!m.map?.userData?.sharedAsset)m.map?.dispose?.();m.dispose?.();});geos.forEach(g=>g.dispose?.());while(room.children.length)room.remove(room.children[0]);for(let i=interactables.length-1;i>=0;i--)if(interactables[i].userData?.hit?.inside&&!interactables[i].userData.persistentShop&&!interactables[i].userData.name)interactables.splice(i,1);}
function roomShell(s){
 if(s.id===NAHA_ARRIVALS.id){clearRoom();town.visible=false;room.visible=true;activeRoomLayout=buildAirportArrivals({room,reg,onReturn:()=>islandPlay.returnFlight()});return;}
 clearRoom();town.visible=false;room.visible=true;
 const shared={site:s,room,reg,collider:roomCollider,action:(...args)=>{if(!islandPlay?.action(...args))activities.action(...args);},exit:leaveRoom};
 if(s.id==='dungeon'){activeRoomLayout=dungeonLayout(shared);return;}
 if(s.id==='market'){activeRoomLayout=SAKURA_LAYOUT;return;}
 if(s.id==='school'){activeRoomLayout=buildClassroom(shared);return;}
 if(s.id==='mayor-office'){activeRoomLayout=buildMayorOffice(shared);return;}
 if(s.id==='community-kitchen'){activeRoomLayout=buildCommunityKitchen(shared);return;}
 if(s.id==='clinic'){activeRoomLayout=buildClinic(shared);return;}
 if(s.id===CITY_RESTAURANT.id){
  // A fixed scene: no hands in front of the camera, and the dinner menu opens as you sit down.
  activeRoomLayout=buildCityRestaurant({...shared,johansson:playerRecipe()});hands.firstPersonVisible=false;
  const dinner=activeRoomLayout.dinner;
  dinner.leave=()=>{if(current?.id!==CITY_RESTAURANT.id)return;leaveRoom();say('The last boat home: Thuan asleep on your shoulder by Kitano-jima, the island’s lights coming up out of the dark.',6);};
  say('Naha, the top floor of the Hotel Ryūsei. E for the dinner menu.',4);
  setTimeout(()=>{if(!photoStudio?.active&&current?.id===CITY_RESTAURANT.id&&activeRoomLayout?.dinner===dinner)activities.action('city-dinner',CITY_RESTAURANT.title,dinner);},1400);
  return;}
 if(s.familyHome){activeRoomLayout=buildFamilyHome({...shared,household:s.familyHome,title:s.title});return;}
 if(s.id==='mayor-home'){activeRoomLayout=buildMayorHome({...shared,openMaker:()=>{leaveRoomIfModal();openAvatarMaker();},sleep:sleepUntilMorning});return;}
 if(s.id==='onsen'){activeRoomLayout=buildOnsenInterior(shared);return;}
 if(s.id==='koban'){activeRoomLayout=buildKobanInterior(shared);return;}
 if(s.id==='ramen'&&satoRamen()){activeRoomLayout=buildSatoRamenRoom(shared);return;}
 // A home with a room of its own (the office, the police box) keeps it; everyone else gets a flat.
 activeRoomLayout=homeOwner(s)&&s.id!=='yuri-home'&&!s.ownRoom?buildResidentHome({...shared,profile:world.people.find(p=>p.profile.name===homeOwner(s)).profile,box}):s.id==='warehouse'?buildWarehouseInterior(shared):buildCompactShop(shared)||buildSuppliedRoom(shared);
 if(activeRoomLayout||s.id==='izakaya')return;
 if(s.id==='market')return;
 throw Error('No interior defined for '+s.id);
}


/**
 * Doorways.
 *
 * A building used to be a room you teleported into: the screen cut, you were put on a
 * fixed spot, and your heading was thrown away and replaced with the room's. Walking
 * out did the same in reverse. That is what makes an interior read as somewhere else
 * rather than as the inside of the thing you were just looking at.
 *
 * Three things fix most of it without moving the rooms into world space. The heading
 * survives the door, the crossing is a step rather than a cut, and you walk through
 * instead of standing at a prompt.
 */
const DOOR_REACH=1.35,THRESHOLD_HOLD=1.1;
let doorwayArmed=true,doorwayCooldown=0;
/**
 * The way back out, remembered on the way in.
 *
 * Not every interior has a layout to ask: the izakaya builds its room in addRoomProps
 * and leaves activeRoomLayout null, so reading the exit off the layout meant you could
 * walk into Minato and never walk out of it.
 */
let roomDoorway=null;

/**
 * The one rotation that maps between a building's street frame and its room frame.
 *
 * A door faces `entryFacing` in the world and `layout.yaw` in the room, so the two
 * frames differ by exactly that angle — inside and outside, both ways.
 */
/** Everything the player could walk into, which is every site the town gave a door. */
function doorwayUnderfoot(){
 const p=player.position,forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
 if(current){
  if(!roomDoorway)return null;
  const {x:ox,z:oz,inward}=roomDoorway;
  if(Math.hypot(p.x-ox,p.z-oz)>DOOR_REACH)return null;
  // Facing the door, not merely standing by it: you pass this spot walking in as well.
  const outward=inward+Math.PI;
  return forward.dot(new THREE.Vector3(-Math.sin(outward),0,-Math.cos(outward)))>.4?{leave:true}:null;
 }
 for(const s of SITES){
  const d=s.approachPosition||s.door;if(!d)continue;
  const dx=d[0],dz=d[2]??d[1];
  if(Math.hypot(p.x-dx,p.z-dz)>DOOR_REACH)continue;
  const facing=s.entryFacing??0;
  if(forward.dot(new THREE.Vector3(-Math.sin(facing),0,-Math.cos(facing)))<.4)continue;
  return {site:s};
 }
 return null;
}

/**
 * The crossing itself: chime, a short veil over the swap, and the heading carried
 * across. The veil also covers a room that has to stream its model in, which used to
 * be a frozen street and the word "Opening…".
 */
async function crossThreshold(run){
 const veil=$('#threshold');
 townAudio.play('door-chime',.42);
 veil.classList.add('on');
 await new Promise(r=>setTimeout(r,150));
 try{await run();}finally{
  await new Promise(r=>setTimeout(r,60));
  veil.classList.remove('on');
  doorwayCooldown=THRESHOLD_HOLD;doorwayArmed=false;
 }
}

/** Called once a frame from the player update. */
function updateDoorways(dt){
 if(doorwayCooldown>0)doorwayCooldown=Math.max(0,doorwayCooldown-dt);
 if(roomLoading||seated||activities.paused||inspector?.active)return;
 const at=doorwayUnderfoot();
 if(!at){doorwayArmed=true;return;}
 if(!doorwayArmed||doorwayCooldown>0)return;
 // Only when actually walking at it. Standing in a doorway is not going through one.
 if(moveVec.lengthSq()<.0004)return;
 doorwayArmed=false;
 if(at.leave)void crossThreshold(async()=>leaveRoom());
 else void crossThreshold(()=>enterRoom(at.site));
}

let roomLoading=false;
async function enterRoom(s){
 if(roomLoading)return;
 s=SITES.find(site=>site.id===businessId(s.id))||s;
 if(s.id==='market'){roomLoading=true;resetInput();let ready=false;try{ready=await sakuraShop.ready();}finally{roomLoading=false;}if(!ready){say('Could not open Sakura. Please try the door again.',5);return;}}
 // Buildings remain accessible; business hours govern staff and service only.
 if((s.id==='izakaya'||s.id==='ramen'&&satoRamen())&&!izakayaReady('interior')){
  roomLoading=true;resetInput();say('Opening '+s.title+'…',20);
  try{await preloadIzakaya(['interior']);}finally{roomLoading=false;}
  if(!izakayaReady('interior')){say('Could not open '+s.title+'. Please try the door again.',5);return;}
 }
 if(isSuppliedRoom(s.id)&&!(s.id==='ramen'&&satoRamen())&&!suppliedRoomReady(s.id)){
  roomLoading=true;resetInput();say('Opening '+s.title+'…',20);
  let ready=false;
  try{[ready]=await preloadSuppliedRooms([s.id]);}finally{roomLoading=false;}
  if(!ready){say('Could not open '+s.title+'. Please try the door again.',5);return;}
 }
 parkSeat=null;seated=false;activities.close();if(!photoStudio?.active&&!photoReturning)activities.visit(s.id);
 const streetYaw=yaw,streetPitch=pitch;
 current=s;roomView(true,s);roomShell(s);addRoomProps(s);content=buildBusinessContent({site:s,room,register:reg,onAction:activities.action,onInspect:item=>inspector.open(item)});room.traverse(o=>{if(!o.isMesh||o.userData.sharedAsset)return;const b=o.geometry?.parameters;if(b?.height<.25&&o.position.y>3.8||o.position.z>6&&o.position.y>1||o.position.x>6&&o.position.y>1){o.userData.cutaway=true;o.layers.set(0);}});const spawn=activeRoomLayout?.spawn||[0,0,4.3];
 player.position.set(...spawn);unstuckPlayer();workplaceResidents.enter(s,minutes);bookshopCustomers.enter(s,minutes);
 // The dungeon is left by its rope, not by walking back through where you came in.
 roomDoorway=activeRoomLayout?.noDoorway?null:{x:spawn[0],z:spawn[2]??spawn[1],inward:activeRoomLayout?.yaw??0};
 // The heading goes through the door with you. Snapping to the room's own yaw and a
 // level pitch is the single thing that most makes an interior read as a different
 // place: you walk in looking where you were looking, not where the room says.
 yaw=streetToRoom(streetYaw,s,activeRoomLayout);
 pitch=THREE.MathUtils.clamp(streetPitch,-.55,.55);$('#exitRoomButton').classList.remove('hidden');syncView();active=null;$('#place').textContent=s.title.toUpperCase();$('#placeSub').textContent=`${s.jp} · ${s.sub}`;$('#timeText').textContent=s.line;if(!s.arrival)say(s.id==='crystal-room'&&activeRoomLayout?'The timber door closes. Something here does not belong to the street.':`${s.title} · Explore the room. Tap objects nearby to examine them.`,s.id==='crystal-room'?5:3);camera.position.copy(player.position);camera.position.y+=1.7;}
function leaveRoom(){if(!current)return;if(!photoStudio?.active&&!photoReturning&&current.id===NAHA_ARRIVALS.id&&activities.state.island?.journey.location==='naha'){islandPlay.returnFlight();return;}const leavingDungeon=current.id==='dungeon';wearSwim(false);showShopThroughWindow();izakayaTV?.dispose();izakayaTV=null;storeService?.cancel();ramenPlayerService?.dispose();ramenPlayerService=null;venueService?.dispose();venueService=null;beerService?.clear();beerService=null;workplaceResidents.restore();bookshopCustomers.restore();neighbourChats.cancel();chatBubble.hide();inspector?.close();activities.close();resetInput();$('#directory').classList.add('hidden');$('#exitRoomButton').classList.add('hidden');izakayaGuests.restore();onsenGuests.restore();hideRamen();homeGuests.restore();seated=false;parkSeat=null;active=null;const s=current;const roomYaw=yaw,roomPitch=pitch,roomLayout=activeRoomLayout;roomDoorway=null;current=null;roomView(false);if(s?.id===CITY_RESTAURANT.id)hands.firstPersonVisible=!thirdPerson;syncView();room.visible=false;town.visible=true;if(s)placeAtEntrance(s,true);
 // and back out again the same way, by the same rotation: you leave facing where you
 // were facing inside, which for somebody who walked at the door is the street.
 if(s){yaw=roomToStreet(roomYaw,s,roomLayout);pitch=THREE.MathUtils.clamp(roomPitch,-.55,.55);}
 $('#place').textContent='JOHANSSON TOWN';$('#placeSub').textContent="Johansson Town · HARBOUR DISTRICT";$('#timeText').textContent='Shops are open.';say('Johansson Street',1.5);if(leavingDungeon)finishDungeon();}

function welcomeAtCounter(forward){
  if(storeWelcomed||!storeClerk?.visible||storeClerk.userData.visualReady===false||current?.id!=='market')return;
  const towards=storeClerk.position.clone().sub(player.position);towards.y=0;
  // Let the player see the greeting before the dialogue card covers the view.
  // Once per visit, only when approaching and looking towards the counter.
  if(towards.length()>3||forward.dot(towards.normalize())<.65)return;
  storeWelcomed=true;characters.gesture(storeClerk);
}
function interaction(){if(bicycleRide){active=null;$('#prompt').textContent=touch?'ACTION · dismount':'E · dismount Thuan’s bicycle';$('#prompt').classList.add('on');return;}if(seated){active=null;$('#prompt').textContent=Number.isInteger(parkSeat?.ramenSeatId)?(ramenPlayerService?.order?.delivered?'Eat / drink · Stand':ramenPlayerService?.order?'Order on its way · Stand':'Order food · Stand'):'Stand';$('#prompt').classList.add('on');return;}active=null;let best=null,dmax=3.1,bestScore=Infinity;const p=player.position.clone();p.y+=1;const fw=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));welcomeAtCounter(fw);for(const o of interactables){const h=o.userData.hit;const inside=h.inside||!!(o.userData.inMarket&&current?.id==='market');if(o.userData.visualReady===false||!o.visible||current&&!inside||!current&&inside)continue;let visible=true;for(let a=o.parent;a;a=a.parent)if(!a.visible)visible=false;if(!visible)continue;const q=new THREE.Vector3();o.getWorldPosition(q);const target=q.clone(),v=q.sub(p),d=v.length();if(d>dmax)continue;v.y=0;
  // What you are facing, not merely what is nearest: things behind you or well off to the
  // side are out (unless you are all but touching them), and people come before things.
  const facingDot=v.lengthSq()?fw.dot(v.normalize()):1;if(facingDot<.3&&d>.9)continue;
  const score=o.userData.storeItem?shelfAimScore(camera.position,camera.getWorldDirection(new THREE.Vector3()),target):d*(1+(1-facingDot)*1.4)+(o.userData.promptPenalty||0)-(/^Talk to /.test(h.label)?.6:0);if(score>=bestScore)continue;bestScore=score;best={...h,object:o}}const e=$('#prompt');if(best){active=best;e.textContent=(touch?'':'E · ')+best.label;e.classList.add('on')}else e.classList.remove('on')}
function standUp(){if(!seated)return;ramenPlayerService?.cancel();if(parkSeat?.stand)player.position.set(...parkSeat.stand);parkSeat=null;seated=false;unstuckPlayer();ensureDailyQuests(activities.state);if(form3NudgeAllowed(activities.state,minutes)){markDailyDone(activities.state,'form3_sell');activities.save();say(FORM3_NUDGE,6);}else say('You stand up.',2);}
function doInteract(){if(islandPlay?.active)return;if(catchingUp||roomLoading||activities.paused)return;if(bicycleRide){stopBicycleRide();return;}if(seated){if(Number.isInteger(parkSeat?.ramenSeatId))activities.action('store-table');else if(parkSeat?.izakaya)activities.action('izakaya-table');else standUp();return;}if(inspector?.active)return;if($('#directory').classList.contains('hidden')){interaction();if(active)active.fn?.();else if(current?.id==='dungeon')activeRoomLayout?.dungeon?.strike(null);}}
function environmentBlocked(x,z,r=PLAYER_RADIUS){const bounds=current?(activeRoomLayout?suppliedRoomBoundsBlocked(activeRoomLayout,x,z,r):roomBoundsBlocked(x,z,r)):townBoundsBlocked(x,z,r);if(bounds)return true;const list=current?roomColliders:world.colliders;
 const y=current?0:groundHeight(x,z);
 return list.some(c=>standingHitsRect(x,z,r,y,c));}
function entrancePoints(){return SITES.filter(s=>s.door).map(s=>[s.door[0],s.door[2]??s.door[1]]);}
function inEntrance(x,z,r=1.2){return entrancePoints().some(([dx,dz])=>Math.hypot(x-dx,z-dz)<r);}
function indoorNpc(g){return g.userData.inBookshop||g.userData.inWorkplace||g.userData.inIzakaya||g.userData.inOnsen||g.userData.inRamen||g.userData.inHome||g.userData.inMarket;}
function residentInView(g){if(g.userData.visualReady===false)return false;for(let node=g;node;node=node.parent)if(!node.visible)return false;return current?!!indoorNpc(g):!indoorNpc(g);}
function overlapsResident(x,z){return world.people.some(p=>!p.g.userData.playerControlled&&residentInView(p.g)&&circleHitsCircle(x,z,PLAYER_RADIUS,p.g.position.x,p.g.position.z,NPC_RADIUS));}
function residentBlocked(x,z){if(!current&&inEntrance(x,z))return false;return overlapsResident(x,z);}
function collides(x,z){
 // Enter raised surfaces through their steps, rather than snapping up from the side.
 return (!current&&!canStepBetween(groundHeight(player.position.x,player.position.z),groundHeight(x,z)))||environmentBlocked(x,z,PLAYER_RADIUS)||residentBlocked(x,z);
}
function staysOpen(site){return !site||site.id==='home'||homeOwner(site)||['warehouse','office','bus-station'].includes(site.id);}
function occupiedByPerson(x,z){return overlapsResident(x,z);}
function findClear(x0,z0,maxR=6){
 const ok=(x,z)=>!environmentBlocked(x,z)&&!occupiedByPerson(x,z);
 if(ok(x0,z0))return [x0,z0];
 for(let r=.25;r<=maxR;r+=.25){const n=Math.max(8,Math.round(r*14));for(let i=0;i<n;i++){const a=i/n*Math.PI*2,x=x0+Math.cos(a)*r,z=z0+Math.sin(a)*r;if(ok(x,z))return [x,z];}}
 if(!current){const s=world.spawn||FULL_TOWN.spawn;if(s){const x=s[0],z=s[2]??s[1];if(ok(x,z))return [x,z];}}
 else if(activeRoomLayout?.spawn&&ok(activeRoomLayout.spawn[0],activeRoomLayout.spawn[2]))return [activeRoomLayout.spawn[0],activeRoomLayout.spawn[2]];
 else if(ok(0,4.3))return [0,4.3];
 return [x0,z0];
}
function unstuckPlayer(forceStreet=false){
 if(seated&&!forceStreet)return;
 const x=player.position.x,z=player.position.z;
 if(!environmentBlocked(x,z)&&!occupiedByPerson(x,z))return;
 const [nx,nz]=findClear(x,z);
 player.position.set(nx,current?0:groundHeight(nx,nz),nz);
}
function evictIfClosed(){return false;}

function placeAtEntrance(s,leave=false){
 storeService?.cancel();parkSeat=null;seated=false;
 const mapped=doors.get(s.id);
 let x0,z0;
 if(!leave&&s.approachPosition){x0=s.approachPosition[0];z0=s.approachPosition[2];}
 else if(s.exitPosition){x0=s.exitPosition[0];z0=s.exitPosition[2];}
 else if(mapped){x0=mapped.x;z0=mapped.z+(leave?.6:s.id==='izakaya'?-1.2:.7);}
 else return;
 yaw=leave?(s.entryFacing!=null?s.entryFacing+Math.PI:0):(s.entryFacing??(s.id==='izakaya'?Math.PI:s.side?-s.side*Math.PI/2:0));
 const fwX=-Math.sin(yaw),fwZ=-Math.cos(yaw);
 const [x,z]=findClear(x0+fwX*(leave?.6:0),z0+fwZ*(leave?.6:0));
 player.position.set(x,groundHeight(x,z),z);
}
/**
 * Walking into the mouth of the old sea cave: the first time you reach it, a line says
 * what it is and how to go in.
 * Once per approach -- the collision repeats every step you hold the key down.
 */
/**
 * The dungeon under the old sea cave (src/dungeon). A run lasts from climbing down the
 * rope to climbing back out, over as many floors as you go down: your hearts, what you
 * have found and how deep you are. Climb out and you keep it; black out and you lose it.
 */
let dungeonRun=null,dungeonHud='';
const DUNGEON_FOG=new THREE.Fog(0x070605,5,17);
const DUNGEON_SITE={id:'dungeon',title:'The Old Sea Cave',jp:"Old Cave",get sub(){return 'FLOOR B'+(dungeonRun?.floor||1);},get line(){return dungeonHud;},
 exitPosition:[CAVE_MOUTH.x,0,CAVE_MOUTH.z-1.1],entryFacing:Math.PI,arrival:()=>null};
function enterDungeon(){
 if(current||roomLoading)return;
 // Whatever you have to hit with comes down with you; otherwise it is your fists.
 dungeonRun={hp:5,maxHp:5,loot:0,items:[],floor:1,seed:Math.floor(Math.random()*1e9),kills:0,weapon:bestWeapon(activities.state.inventory)};
 fists?.setWeapon(dungeonRun.weapon);
 enterRoom(DUNGEON_SITE);
}
function dungeonLayout(shared){
 return buildDungeon({...shared,run:dungeonRun,say,hud:text=>{dungeonHud=text;if(current?.id==='dungeon')$('#timeText').textContent=text;},
  onDescend:()=>{dungeonRun.floor++;dungeonRun.seed++;activities.state.dungeonDeepest=Math.max(activities.state.dungeonDeepest||0,dungeonRun.floor);activities.save();enterRoom(DUNGEON_SITE);},
  onExit:()=>leaveRoom(),
  onHurt:()=>{flashHurt();johansson?.play('Hurt');},
  onStrike:(target,weapon)=>{const side=fists?.punch();johansson?.play(weapon?'Swipe':side===-1?'JabL':'Jab');},
  onWeapon:name=>fists?.setWeapon(name),
  onFaint:()=>{dungeonRun.lost=true;leaveRoom();}});
}
/** A red edge to the screen for a moment when something down there catches you. */
function flashHurt(){
 let flash=document.getElementById('hurtFlash');
 if(!flash){flash=document.createElement('div');flash.id='hurtFlash';flash.setAttribute('aria-hidden','true');
  flash.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:40;opacity:0;transition:opacity .45s ease-out;background:radial-gradient(ellipse at center,rgba(160,20,10,0) 45%,rgba(160,20,10,.55) 100%)';
  document.body.appendChild(flash);}
 flash.style.transition='none';flash.style.opacity='1';requestAnimationFrame(()=>{flash.style.transition='opacity .45s ease-out';flash.style.opacity='0';});
}
/** Back at the cave mouth: bank what you carried up, or lose it if you were carried. */
function finishDungeon(){
 const run=dungeonRun;dungeonRun=null;fists?.setWeapon(null);fists?.guard(false);if(!run)return;
 const st=activities.state;
 if(run.lost){setTimeout(()=>say('You come to at the cave mouth with a headache and empty pockets. Whatever you found is down there still.',5),60);return;}
 st.yen=(st.yen||0)+run.loot;st.inventory=st.inventory||[];for(const item of run.items)st.inventory.push(item);activities.save();
 const found=run.items.length?' and '+run.items.join(', '):'';
 setTimeout(()=>say(run.loot||run.items.length?'Out into the daylight with ¥'+run.loot+found+'. Deepest: B'+run.floor+'.':'Out into the daylight again. Nothing found this time.',5),60);
}
let tunnelSignAt=-99;
function reachTheTunnelMouth(x,z){
 if(!world.tunnel?.splat?.(x,z)||elapsed-tunnelSignAt<6)return;
 tunnelSignAt=elapsed;
 say("Old Cave · The old sea cave. It goes down into the dark — tap to go in.",3.5);
}
function updatePlayer(dt){
 if(islandPlay?.active)return;
 // Drink wears off with town time, an hour a drink; sleep clears it.
 tipsy=soberUp(tipsy,minutes-(tipsyClock??minutes));tipsyClock=minutes;
 if(!seated&&!bicycleRide)unstuckPlayer();
 const fromX=player.position.x,fromZ=player.position.z;
 const lookX=controllerFrame.look.x+touchSticks.look.x+(keys.KeyL?1:0)-(keys.KeyJ?1:0),lookY=controllerFrame.look.y+touchSticks.look.y+(keys.KeyK?1:0)-(keys.KeyI?1:0);
 ({yaw,pitch}=lookStep(yaw,pitch,THREE.MathUtils.clamp(lookX,-1,1),THREE.MathUtils.clamp(lookY,-1,1),dt,cameraControls.settings));
 let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-touchSticks.move.y-controllerFrame.move.y;
 let s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+touchSticks.move.x+controllerFrame.move.x;
 if(bicycleRide){
  const ride=bicycleRide,oldYaw=ride.controller.state.yaw;
  const fast=!!(keys.ShiftLeft||keys.ShiftRight||touchRunning||controllerFrame.held[4]);
  const result=ride.controller.update(dt,{throttle:f,steer:s,fast,blocked:(x,z,heading)=>bicycleBlocked(x,z,heading,ride.bike.object.scale.x,(px,pz,r)=>environmentBlocked(px,pz,r)||overlapsResident(px,pz))});
  const state=result.state;player.position.set(state.x,groundHeight(state.x,state.z),state.z);player.quaternion.setFromAxisAngle(yAxis,state.yaw);
  yaw+=state.yaw-oldYaw;playerSpeed=Math.abs(state.speed);playerRunning=fast;player.visible=true;
  const travel=-Math.sin(state.yaw)*result.dx-Math.cos(state.yaw)*result.dz;
  ride.wheelAngle-=travel/(.31*ride.bike.object.scale.x);ride.distance=(ride.distance||0)+travel;
  ride.thuan.g.userData.bicyclePhase=(ride.distance/1.6)%1;ride.bike.animateRide(ride.thuan.g.userData.bicyclePhase,true);
  ride.bike.wheels?.forEach(wheel=>wheel.rotation.x=ride.wheelAngle);
  ride.thuan.g.userData.activity=Math.abs(state.speed)>.15?'riding her bicycle':'stopped with her bicycle';
  camera.position.copy(player.position).add(fwVec.set(0,1.45,0));camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);placeThirdPerson(dt);
  const fov=cameraControls.settings.fov-controllerFrame.zoom*18;if(Math.abs(camera.fov-fov)>.01){camera.fov=THREE.MathUtils.damp(camera.fov,fov,12,dt);camera.updateProjectionMatrix();}
  return;
 }
 if(seated){s=0;f=0;}
 // On touch: the stick steers as well as walks, and pushed to its rim it runs.
 const thumb=touchSticks.moving&&!seated,thumbPush=Math.hypot(touchSticks.move.x,touchSticks.move.y);
 if(thumb)yaw+=steerYaw(touchSticks.move,dt,{looking:touchSticks.looking});
 const thumbRun=thumb?touchAutoRun.update(thumbPush,dt):(touchAutoRun.reset(),false);
 // Eased, so walking starts and stops like a person rather than a switch.
 if(move2.set(s,f).lengthSq()>1)move2.normalize();
 const eased=walkMotion.update(move2.x,move2.y,dt);if(seated)walkMotion.reset();move2.set(eased.x,eased.y);
 fwVec.set(-Math.sin(yaw),0,-Math.cos(yaw));rtVec.set(Math.cos(yaw),0,-Math.sin(yaw));moveVec.copy(fwVec).multiplyScalar(move2.y).addScaledVector(rtVec,move2.x);
 if(moveVec.lengthSq()>.0001){
  // Drunk, the feet do not quite go where they are pointed: the way home wanders.
  const drunk=Math.min(1,tipsy/DRUNK);if(drunk>0)moveVec.applyAxisAngle(yAxis,(Math.sin(elapsed*1.3)*.32+Math.sin(elapsed*.47+1)*.22)*drunk);
  const running=!!(keys.ShiftLeft||keys.ShiftRight||touchRunning||thumbRun||controllerFrame.held[4]||activities.state.sprintUntil>performance.now());
  const speed=(running?5.2:3)*dt,nx=player.position.x+moveVec.x*speed,nz=player.position.z+moveVec.z*speed;
  const stoppedX=collides(nx,player.position.z),stoppedZ=collides(player.position.x,nz);
  if(!stoppedX)player.position.x=nx;
  if(!stoppedZ)player.position.z=nz;
  if(stoppedX||stoppedZ)reachTheTunnelMouth(nx,nz);
  turnQ.setFromAxisAngle(yAxis,Math.atan2(-moveVec.x,-moveVec.z));player.quaternion.slerp(turnQ,1-Math.pow(.001,dt));playerRunning=running;
 }
 playerSpeed=THREE.MathUtils.damp(playerSpeed,Math.hypot(player.position.x-fromX,player.position.z-fromZ)/Math.max(dt,1e-3),12,dt);
 updateDoorways(dt);
 player.visible=false;camera.position.copy(player.position).add(fwVec.set(0,seated?(parkSeat?parkSeat.eyeY-player.position.y:1.15):1.7+(cameraControls.settings.bob&&move2.lengthSq()>.02?Math.sin(elapsed*11)*.018:0),0));camera.rotation.order='YXZ';const sway=Math.min(1,tipsy/DRUNK);camera.rotation.set(pitch+Math.sin(elapsed*.9)*.012*sway,yaw+Math.sin(elapsed*.55)*.02*sway,Math.sin(elapsed*.7)*.025*sway);if(thirdPerson)placeThirdPerson(dt);
 const fov=cameraControls.settings.fov-controllerFrame.zoom*18;if(Math.abs(camera.fov-fov)>.01){camera.fov=THREE.MathUtils.damp(camera.fov,fov,12,dt);camera.updateProjectionMatrix();}
}

const fmt=m=>`${String(Math.floor((m%1440)/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;
function setTime(){
 world.updateHours?.(minutes);
 const c=duskClock(minutes,{rain:weather,inside:!!current});
 const day=c.day;
 sun.intensity=c.sunIntensity;
 sun.color.set(c.sun);
 ambient.color.set(c.skyFill);
 ambient.groundColor.set(c.groundFill);
 scene.environmentIntensity=(.12+day*.22)*(current?.4:weather?.65:1);
 const cell=52/(tabletLike?1024:2048),sx=Math.round(player.position.x/cell)*cell,sz=Math.round(player.position.z/cell)*cell;
 sun.position.set(sx-30,12+day*25,sz+12);sun.target.position.set(sx,0,sz);sun.target.updateMatrixWorld();
 townSky.update(camera,day,weather,!!current,c.sky);
 setOceanLight({day,dusk:c.dusk});
 const air=atmosphere(day,weather,!!current,minutes);
 scene.background.set(air.sky);scene.fog=air.fog;
 ambient.intensity=air.ambient*CEL_FILL;
 bounce.intensity=c.bounce;
 renderer.toneMappingExposure=air.exposure;
 pipeline?.setExposure(air.exposure*CEL_EXPOSURE);
 // Night is moonlight: the grade's light and shadow tints go blue as the day goes, so the
 // street reads as night and the lit windows and lamps stand out warm against it.
 {const night=Math.max(0,1-day-c.dusk*.6)*(current?0:1),mix=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();
  pipeline?.tune({uLightTint:mix(NIGHT_TINT.light,0xb4c2f4,night*.6),uShadowTint:mix(NIGHT_TINT.shadow,0x7d86c4,night*.8)});}
 // Underground the sun and the sky do not reach: the lantern, the torches and a little
 // cold fill are all the light there is, and the dark closes in a few tiles off.
 if(current?.id==='dungeon'){sun.intensity=0;bounce.intensity=0;ambient.intensity*=.12;scene.environmentIntensity=.03;scene.background.set(0x050404);scene.fog=DUNGEON_FOG;}
 // and the grade's shadow lift, which keeps the town's shade from ever going black, is
 // taken nearly off down there, or the whole cave sits behind a grey veil.
 pipeline?.tune({uLift:current?.id==='dungeon'?.003:INK_OPTIONS.gradeOptions.lift??GRADE_DEFAULTS.lift});
 // Warmth only. Ink, shadow tint and flatten stay on their cel defaults.
 pipeline?.tune({uWarmth:c.gradeWarmth});
 $('.timecard small').textContent=c.period;
 return day;
}
$('#exitRoomButton').onclick=()=>crossThreshold(async()=>leaveRoom());
function syncView(){
 document.body.classList.remove('diorama');camera.fov=cameraControls.settings.fov;camera.updateProjectionMatrix();
 room.traverse(o=>{if(o.userData.cutaway)o.layers.set(0);});
 player.visible=false;window.__JOHANSSON_CAMERA_MODE__='first';
}
 const placeDirections=s=>s.directions||(FULL_TOWN.active?'Follow the visitor map to '+s.title+' in the canal quarter.':s.id==='izakaya'?'Take the eastern lane from the main street and follow the dining-lane sign.':s.id==='tea-house'?'Follow the shopping street north, then look for the blue-and-white curtains.':s.id==='bus-station'?'Follow the shopping street to the Harbour Line terminal.':'Follow the main street to '+s.title+'.');
function markPlace(s){navigationTarget=s;toggleDir(false);drawMap();say(placeDirections(s)+(current?' Use Exit to street to start walking.':''),7);return false;}
function visitPlace(s){
 if(islandPlay?.active)return false;
 if(s?.id==='airport-island')return markPlace({...s,directions:'Take the local airport ferry from the Minato pier. Tickets are at the harbour terminal.'});
 if(!s)return false;
 // The gate lives at the action itself, so stale buttons and WebMCP share it.
 if(!travelProgress(activities.state).unlocked)return markPlace(s);
 if(current)leaveRoom();placeAtEntrance(s);resetInput();toggleDir(false);navigationTarget=null;drawMap();say(s.title+' · You took a familiar shortcut.',5);return true;
}
function toggleDir(open){if(inspector?.active)return;if(open){updateDirectory();document.exitPointerLock?.();resetInput();}$('#directory').classList.toggle('hidden',!open);$('#directoryButton').setAttribute('aria-expanded',String(open));if(open)$('#closeDirectory').focus();else $('#directoryButton').focus();}
$('#directoryButton').onclick=()=>toggleDir(true);$('#closeDirectory').onclick=()=>toggleDir(false);
function updateDirectory(){
 const grid=$('#directoryGrid');grid.replaceChildren();
 const section=t=>{const h=document.createElement('h3');h.className='directory-section';h.textContent=t;grid.append(h);};
 const row=(title,sub,fn,id)=>{const b=document.createElement('button');b.className='dir-item';if(id)b.dataset.id=id;const strong=document.createElement('b'),small=document.createElement('span');strong.textContent=title;small.textContent=sub;b.append(strong,small);b.onclick=fn;grid.append(b);};
 const progress=travelProgress(activities.state);
 row('Make your islander','Change how you look: face, hair, clothes and all. Share it with a link.',openAvatarMaker,'avatar-maker');
 row('Resident wardrobes','Choose a resident, then change their hair, hat and clothes.',()=>{const grid=$('#directoryGrid');grid.replaceChildren();row('Back to Town book','Return to the town menu',updateDirectory);for(const {name,player:isPlayer} of characters.listCharacters())if(!isPlayer)row(name,'Hair, hats, clothes and appearance',()=>openAvatarMaker(name));},'resident-wardrobes');
 row(progress.unlocked?'Town shortcuts unlocked':'Town shortcuts · '+progress.completed+'/'+progress.total+' favours',progress.unlocked?'Quick travel is ready. Choose a place below.':'Bring Tama home and finish Kenji’s workshop escort.',()=>{toggleDir(false);activities.action('travel-progress');},'travel-progress');
 const destination=(site,title)=>{row(title||site.title,progress.unlocked?site.sub:placeDirections(site),()=>visitPlace(site),site.id);grid.lastChild.dataset.travel=progress.unlocked?'ready':'locked';};
 const teaHouse=SITES.find(s=>s.id==='tea-house');
 if(teaHouse)destination(teaHouse,'Corner Tea House');
 const izakaya=SITES.find(s=>s.id==='izakaya');
 if(izakaya){destination(izakaya,'Minato Izakaya');grid.lastChild.className+=' izakaya-shortcut';}
 section('Street');SITES.filter(s=>!['izakaya','tea-house'].includes(s.id)).forEach(s=>destination(s));
 (world.landmarks||[]).forEach(s=>destination(s));
 section('Residents');const wantNames=wantPool();world.people.forEach(p=>{const name=p.g.userData.name,want=openWant(activities.state,minutes,wantNames,name),hearts=heartLine(activities.state.friendship?.[name]?.points||0);row(name,hearts+' · '+(want?'Would like '+withArticle(want.item.toLowerCase()):p.g.userData.activity||'On the street'),()=>{activities.note(p.g.userData.name+' · '+(p.g.userData.activity||'on the street'));toggleDir(false);});});
 section('Reading and records');content.items.forEach(i=>row(i.title,i.place,()=>{const site=SITES.find(s=>s.id===i.siteId);if(site)markPlace(site);else toggleDir(false);}));
  section('Signals');[['82.1 Harbour Service',RADIO_821],['89.4 JOJO','Journal requests'],['95.7 Sports','Prefectural baseball'],['Payphone','Near the bookshop'],['Minato Ferry','Outer pier · 3 sailings daily']].forEach(([a,b])=>row(a,b,()=>{toggleDir(false);say(a==='82.1 Harbour Service'?b:a+' · '+b,4);}));
}
/**
 * Where the game starts (world/openings.js): one of a few good moments in town, picked
 * for the hour, instead of always the bench across from Sakura. The audit harness keeps
 * the bench unless it names an opening with ?spawn=.
 */
function beginAtOpening(){
 const params=new URLSearchParams(location.search),force=params.get('spawn');
 if(world.townMode!=='peninsula'||params.has('audit')&&!force)return null;
 if(activities.state.island?.journey.location!=='town'&&activities.state.island){islandPlay.recover();return null;}
 const opening=chooseOpening({minutes,rain:weather,force});
 if(opening.id==='sakura-bench')return opening;
 if(opening.room){const door=doors.get(opening.room);if(door){standUpAt(door.x,door.z,Math.PI);}preloadIzakaya(['interior']);return opening;}
 if(opening.stand){const [x,z]=opening.stand==='bus-platform'?transitStop().platform:opening.stand;standUpAt(x,z,opening.facing);return opening;}
 if(opening.seat&&sitOnSeat(opening.seat))return opening;
 return null;
}
function standUpAt(x0,z0,facing=yaw){
 seated=false;parkSeat=null;
 const [x,z]=findClear(x0,z0);player.position.set(x,groundHeight(x,z),z);yaw=facing;pitch=-.05;world.spawn=player.position.toArray();
}
/** Sit on a seat by its label, through the same path as tapping it: the first one of them that is free. */
function sitOnSeat(label){
 for(const o of interactables.filter(o=>o.userData.hit?.label===label&&o.userData.seat)){
  const stand=o.userData.seat.stand;if(stand)standUpAt(stand[0],stand[2]??stand[1]);
  active={...o.userData.hit,object:o};o.userData.hit.fn();active=null;activities.close();
  if(seated)return true;
 }
 return false;
}
async function openInside(opening){
 const site=SITES.find(s=>s.id===opening.room);if(!site)return;
 // Minato and Sato Ramen share one interior model, which can miss its load window while
 // the town itself is still being built; give it a few tries, else leave you at the door.
 for(let tries=0;tries<4&&!izakayaReady('interior');tries++){await preloadIzakaya(['interior']);if(!izakayaReady('interior'))await new Promise(r=>setTimeout(r,1500));}
 if(!izakayaReady('interior')){say(site.title+' is just here. Step inside.',5);return;}
 await enterRoom(site);
 if(current?.id!==opening.room)return;
 if(opening.seat&&sitOnSeat(opening.seat)){
  if(opening.drink)beerService?.serveNow(opening.drink,parkSeat?.izakaya);
  if(opening.meal)ramenPlayerService?.serveNow(opening.meal);
 }
 say(opening.caption+(opening.meal?' E to eat, or stand.':' E to drink, or stand.'),6);
}
// The peninsula omits the parked-bicycle interaction; its seven other street
// activities remain required. Archived layouts retain the bicycle as the eighth.
function runStabilityChecks(){const failures=[];if(!townBoundsBlocked(400,0,PLAYER_RADIUS))failures.push('town edge');if(!roomBoundsBlocked(5.5,0,PLAYER_RADIUS))failures.push('room edge');if(world.colliders.length<20)failures.push('world collider coverage');if((world.quality?.streetInteractions||0)<(world.townMode==='peninsula'?7:8))failures.push('street interaction coverage');for(const [id,p] of doors){const site=SITES.find(s=>s.id===id)||(world.landmarks||[]).find(s=>s.id===id);const facing=site?.exitPosition||id==='warehouse'||homeOwner(site)?site?.entryFacing:null,exitStep=site?.exitPosition ? .6 : .7;const ex=Number.isFinite(facing)?p.x+Math.sin(facing)*exitStep:p.x,ez=Number.isFinite(facing)?p.z+Math.cos(facing)*exitStep:p.z+(id==='izakaya'?-.7:.7);if(environmentBlocked(p.x,p.z,PLAYER_RADIUS)||(!FULL_TOWN.active&&environmentBlocked(ex,ez,PLAYER_RADIUS)))failures.push(`door spawn ${id}`);}window.__JOHANSSON_STABILITY__={ok:failures.length===0,failures,colliders:world.colliders.length,characterCount:world.people.length+1,streetInteractions:world.quality?.streetInteractions||0,renderDpr:renderer.getPixelRatio(),toneMapping:'AgX',shadows};if(failures.length)console.error('Johansson Town stability checks failed',failures);else console.info('Johansson Town stability checks passed',window.__JOHANSSON_STABILITY__)}

const opening=beginAtOpening();
started=true;controlsTouchedAt=performance.now();if(mobile){touchSticks.hint(true);stickHintUntil=performance.now()+4500;}$('#start').classList.add('hidden');$('#hud').classList.remove('hidden');window.__JOHANSSON_RUNNING__=true;camera.position.copy(player.position);camera.position.y+=seated?(parkSeat?.eyeY??1.16):1.7;camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);say(opening?.caption||(seated?'Stand — Sakura is across the street.':'Sakura — step up to meet Thuan.'),5);runStabilityChecks();
if(opening?.room)openInside(opening);
canvas.addEventListener('click',event=>{
 if(!current||!controlsAllowed()||touchSticks.suppressClick())return;
 if(seated){doInteract();return;}
 const rect=canvas.getBoundingClientRect();let best=null,bestDistance=48;
 for(const object of interactables){if(object.userData.visualReady===false||!object.userData.hit?.inside||!object.visible)continue;let hidden=false;for(let p=object.parent;p;p=p.parent)if(!p.visible)hidden=true;if(hidden)continue;const q=object.getWorldPosition(new THREE.Vector3());if(q.distanceTo(player.position)>3.4)continue;q.project(camera);const distance=Math.hypot((q.x+1)*rect.width/2-(event.clientX-rect.left),(1-q.y)*rect.height/2-(event.clientY-rect.top));if(distance<bestDistance){bestDistance=distance;best=object;}}
 if(best){active={...best.userData.hit,object:best};active.fn();}
});
canvas.onclick=()=>{if(!controlsAllowed()||touchSticks.suppressClick())return;if(!touch)canvas.requestPointerLock?.()?.catch?.(()=>{});};
document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||!controlsAllowed())return;const c=cameraControls.settings;yaw-=e.movementX*.0023*c.sensitivity;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0018*c.sensitivity*(c.invertY?-1:1),-1.25,1.15);});
document.addEventListener('keydown',e=>{
 if(photoLoading||photoStudio?.active||cameraControls.active||inspector?.active||itemViewer?.active||activities.paused)return;
 if(e.code==='Escape'){toggleDir(false);return;}
 if(e.code==='KeyC'&&!e.repeat){openCamera();return;}
 if(e.code==='KeyP'&&!e.repeat){openPhotoStudio();return;}
 if(!$('#directory').classList.contains('hidden')){if(e.code==='KeyQ')toggleDir(false);return;}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Home'].includes(e.code))e.preventDefault();keys[e.code]=true;
 if(!started)return;
 if(e.code==='Home'&&!e.repeat)centreCamera();
 if(e.code==='KeyE'&&!e.repeat)doInteract();if(e.code==='KeyR'&&!e.repeat)drinkNow();if(e.code==='KeyQ'&&!e.repeat)toggleDir(true);if(e.code==='KeyB'&&!e.repeat)activities.bag();if(e.code==='KeyN'&&!e.repeat)$('#timeButton').click();if(e.code==='KeyV'&&!e.repeat)setThirdPerson(!thirdPerson);if(e.code==='KeyG'&&!e.repeat)movesMenu();
});document.addEventListener('keyup',e=>keys[e.code]=false);
function setRunning(value){touchRunning=value;$('#run').setAttribute('aria-pressed',String(value));$('#run').innerHTML=runButtonFace(value);}
// Icons on the buttons, and the bag, which only appears when there is something in it.
const hudIcons=dressHud({onBag:()=>{if(started&&!activities.paused){toggleDir(false);activities.bag();}}});$('#run').innerHTML=runButtonFace(false);
function toggleRunning(){if(!started||activities.paused||inspector?.active||seated)return;setRunning(!touchRunning);}
// Touch-down works while another finger holds the movement stick; a synthetic click may be suppressed.
$('#run').onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();pressedControls.add('run');toggleRunning();};
$('#run').onclick=e=>{if(e.detail===0)toggleRunning();};
$('#drink').onpointerdown=e=>{e.preventDefault();pressedControls.add('drink');drinkNow();};$('#act').onpointerdown=e=>{e.preventDefault();pressedControls.add('act');doInteract()};

canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();started=false;const d=$('#fatal');if(d){d.classList.remove('hidden');d.querySelector('p').textContent='Graphics paused safely. Reload Johansson Town to continue.'}});canvas.addEventListener('webglcontextrestored',()=>location.reload());function resizeRenderer(){const view=conversationViewport(innerWidth,innerHeight);renderer.setPixelRatio(renderDpr());renderer.setSize(view.width,view.height,false);canvas.style.width=view.width+'px';canvas.style.height=view.height+'px';camera.aspect=view.width/view.height;camera.updateProjectionMatrix()}
function setConversation(name,text=''){for(const g of [...world.people.map(p=>p.g),...(world.neighbours||[])])if(g.userData.playerConversation){delete g.userData.playerConversation;delete g.userData.chatHold;delete g.userData.speakingUntil;}if(name){neighbourChats.cancel();chatBubble.hide();}
 if(name&&!conversationName){conversationSide=0;shotCut=true;conversationShot='speaker';conversationCamera={rotation:camera.quaternion.clone(),playerVisible:player.visible};johansson?.play('Bow');}
 if(name)johansson?.speak(2.4);
 conversationName=name;resizeRenderer();
 if(name){
  const speaker=name==='Thuan'?storeClerk:world.people.find(p=>p.g.userData.name===name)?.g||world.neighbours?.find(g=>g.userData.name===name);
  if(speaker){speaker.userData.playerConversation=true;speaker.userData.chatHold=true;speaker.userData.speakingUntil=performance.now()+Math.min(6500,Math.max(1400,text.length*43));
   // What the line feels like shows on the face, and the body follows (body-language.js).
   const feeling=lineFeeling(text);speaker.userData.lineFeeling=feeling?{expression:feeling,until:performance.now()+3200}:null;
   // The camera is not taken off you any more: she turns to face you instead, and the
   // line appears over her shoulder. See people/facing.js.
   conversationLine={speaker,name,text};}
  player.visible=false;
 }else{conversationLine=null;if(conversationCamera){player.visible=conversationCamera.playerVisible;conversationCamera=null;}}
}addEventListener('resize',resizeRenderer);window.visualViewport?.addEventListener('resize',resizeRenderer);function resetInput(){setRunning(false);Object.keys(keys).forEach(k=>keys[k]=false);touchSticks.reset();}addEventListener('blur',()=>{resetInput();gamepadInput.suspend();});document.addEventListener('visibilitychange',()=>{resetInput();gamepadInput.suspend();if(document.hidden){activities.save();hiddenAt=Date.now();}else{hiddenAt=0;followClock();clock.getDelta();activities.consumeStorageRestock?.();}});addEventListener('focus',()=>activities.consumeStorageRestock?.());addEventListener('pageshow',()=>activities.consumeStorageRestock?.());addEventListener('pagehide',()=>activities.save());addEventListener('johansson-save',()=>activities.save());

const mapCanvas=$('#minimap'),mapCtx=mapCanvas.getContext('2d');function drawMap(){drawTownMap(mapCtx,mapCanvas.width,mapCanvas.height,{sites:SITES,landmarks:world.landmarks,people:world.people,player:current?doors.get(current.id):player.position,yaw,visited:activities.state.visited,target:navigationTarget});updateWaypoint();}
function updateWaypoint(){
 const button=$('#waypoint');button.classList.toggle('hidden',!navigationTarget);if(!navigationTarget)return;
 const p=current?doors.get(current.id):player.position,d=doors.get(navigationTarget.id),distance=Math.hypot(d.x-p.x,d.z-p.z);
 const angle=Math.atan2(-(d.x-p.x),-(d.z-p.z))-yaw,index=((Math.round(angle/(Math.PI/4))%8)+8)%8,arrow=['↑','↖','←','↙','↓','↘','→','↗'][index];
 button.textContent=(current?'Outside · ':arrow+' ')+navigationTarget.title+' · '+(distance<3?'You’re here':Math.round(distance)+' m')+' ×';button.setAttribute('aria-label','Clear directions to '+navigationTarget.title);
}
$('#waypoint').onclick=()=>{navigationTarget=null;drawMap();};
let elapsed=0,mapTick=0,stepTick=0,accumulator=0,saveTick=0;
// The clock runs at real time: a minute a minute. While the town is catching up on time
// you were away it runs at the old fast-forward rate, a town minute a simulated second.
// It can also be set: a start time chosen on the board before you enter, or from the TIME
// menu, running at one, ten or sixty times real speed (see town-clock.js).
const townClock=createClock(readClockSetting(globalThis.localStorage),minutes);
function advanceTown(dt,playerPaused,fastForward=false){
    minutes+=fastForward?dt:dt*townClock.speed/60;elapsed+=dt;if(!fastForward)islandPlay?.tick(dt);activities.tick(dt);
    if(!catchingUp&&(saveTick+=dt)>=15){activities.save();saveTick=0;}if(!playerPaused&&!islandPlay?.active){characters?.physics?.(dt,current?0:groundHeight(player.position.x,player.position.z));updatePlayer(dt);}
    evictIfClosed();
    if(current?.id==='izakaya')izakayaGuests.sync(minutes,dt);
    if(current?.id==='onsen')onsenGuests.sync(minutes,dt);
    if(current&&!catchingUp)activeRoomLayout?.tick?.(dt,minutes,elapsed);
    if(homeOwner(current))homeGuests.update(dt,minutes);
    // The ramen counter: an order is cooked for five seconds, then set down in front of you.
    venueService?.update(dt);beerService?.update(dt);ramenPlayerService?.update(dt);
    workplaceResidents.update(dt,minutes,weather);bookshopCustomers.update(dt,minutes);
    castAI?.update(dt,minutes,weather);sakuraShop.update(dt);ramenGuests.sync(minutes,dt);ramenMeals.update(dt);satoKitchen?.update(dt);neighbourChats.update(dt,minutes,weather);
    if(!current&&!catchingUp){world.update(dt,elapsed,daylight(minutes),minutes);neighbours?.update(dt,minutes,player.position);if(!activities.state.quickTravelNotified&&travelProgress(activities.state).unlocked)activities.save();world.beats?.update(dt,elapsed,minutes);}
}
/** Keeps the town on the device clock; a gap of more than a minute is caught up, not jumped. */
function followClock(){
 if(photoStudio?.active||!followRealClock||catchingUp)return;
 const real=townClock.target(),gap=real-minutes;
 // A slow device drops frames and the simulation falls a little behind: close that
 // quietly. A real gap -- the tab was asleep -- is fast-forwarded so people move on.
 if(gap>5)advanceAbsentTown(gap);
 else if(gap>.05||gap<-.05)minutes=real;
}
function simulate(frameDt,playerPaused=false){
 followClock();
 accumulator+=Math.min(frameDt,MAX_FRAME_DT);
 while(accumulator>=SIM_STEP){advanceTown(SIM_STEP,playerPaused);accumulator-=SIM_STEP;}
}
const absence=createTownCatchup({advance:(dt,pending)=>{
 activities.state.pendingTownMinutes=pending;advanceTown(dt,true,true);
}});
/** Fast-forwards the town through town minutes it missed, up to a day; beyond that it jumps. */
/** The TIME menu: real time, or a set clock at a chosen hour and speed. */
function clockMenu(){
 const setting=readClockSetting(localStorage),today=Math.floor(minutes/1440)*1440;
 const apply=(start,speed)=>{const s=writeClockSetting(localStorage,{start,speed});
  if(s.start==='real'){townClock.real();townClock.ahead=0;activities.state.clockAhead=0;minutes=realTownMinutes();}
  else{if(start!=='saved'){const [h,m]=start.split(':').map(Number);let t=today+h*60+m;if(t<minutes-1)t+=1440;minutes=t;}townClock.set(minutes,s.speed);}
  evictIfClosed();activities.close();say(clockDescription(),4);};
 const speedLabel=townClock.mode==='real'?'real time':townClock.speed===1?'set time, normal speed':'set time, '+townClock.speed+'× speed';
 const ahead=townClock.mode==='real'&&townClock.ahead>=1?' Time spent in town has put it '+formatAhead(townClock.ahead)+' ahead of your own clock.':'';
 activities.menu('Town clock','It is '+townClockLineAt(minutes)+' in town, running on '+speedLabel+'.'+ahead+'\n\nReal time follows your own clock and date. A set clock can start when you like and run a little faster: at 4× an hour in town takes fifteen minutes.',[
  [townClock.mode==='real'&&townClock.ahead>=1?'Back in step with my clock':'Real time',()=>apply('real',1)],
  ...[1,2,4].filter(v=>!(townClock.mode==='set'&&townClock.speed===v)).map(v=>[v===1?'Keep this time, normal speed':'Speed up · '+v+'×',()=>apply('saved',v)]),
  ...['06:00','12:00','18:00','22:00'].map(t=>['Set to '+t,()=>apply(t,townClock.mode==='set'?townClock.speed:1)]),
  ['Close',()=>activities.close()]]);
}
const formatAhead=m=>m<60?Math.round(m)+' min':Math.floor(m/60)+' h '+Math.round(m%60)+' min';
const clockDescription=()=>(townClock.mode==='real'?'Real time':'Town clock '+townClock.speed+'×')+' · '+townClockLineAt(minutes);
/**
 * The futon at home: sleep through to half past six. The night passes the way an absence
 * does (the residents go home, sleep and get up), and in real time the town then runs
 * that far ahead of your own clock until you bring it back from the clock menu.
 */
function sleepUntilMorning(){
 const day=Math.floor(minutes/1440)*1440;let wake=day+390;if(wake<=minutes+20)wake+=1440;
 const gap=wake-minutes;
 if(townClock.mode==='real'){townClock.pass(gap);activities.state.clockAhead=townClock.ahead;}
 activities.close();advanceAbsentTown(gap);say('You sleep. Half past six, and the generator\'s thud from across the field.',5);
}
const leaveRoomIfModal=()=>activities.close();
function advanceAbsentTown(townMinutes){
 if(!(townMinutes>0))return;
 if(townMinutes>MAX_ABSENCE_MINUTES){minutes+=townMinutes-MAX_ABSENCE_MINUTES;townMinutes=MAX_ABSENCE_MINUTES;}
 absence.add(townMinutes);activities.state.pendingTownMinutes=absence.pending;catchingUp=absence.pending>0;
}
function catchUpFrame(){
 absence.tick();catchingUp=absence.pending>0;
 if(!catchingUp){activities.save();clock.getDelta();}
}

function updateController(dt){
 let pads=[];try{if(!document.hidden)pads=navigator.getGamepads?.()||[];}catch{}
 controllerFrame=gamepadInput.sample(pads,cameraControls.settings.deadzone);const f=controllerFrame;
 if(controllerConnected!==f.connected){controllerConnected=f.connected;cameraControls.status(f.connected);if(f.connected)say('Controller connected · Left stick move · Right stick look · Menu opens town book',5);}
 if(!started||document.hidden||catchingUp)return;
 if(!$('#qte').classList.contains('hidden')){if(f.pressed[1]||f.pressed[9])activities.close();else window.__JOHANSSON_TOUCH_UI__?.controller?.(f);return;}
 const direction=menuRepeat(f,dt);
 if(inspector?.active){
  if(f.pressed[1]||f.pressed[9]){inspector.close();return;}
  inspector.control?.({x:f.look.x,y:f.look.y,zoom:(f.held[6]?1:0)-f.zoom,reset:f.pressed[11]},dt);
  const root=$('#inspect-caption');navigateControls(root,direction);
  if(f.pressed[0]){const items=focusableControls(root);if(items.includes(document.activeElement))document.activeElement.click();else items[0]?.focus();}return;
 }
 const root=cameraControls.active?cameraControls.panel:activities.paused?$('#activity'):!$('#directory').classList.contains('hidden')?$('#directory'):null;
 if(root){
  if(f.pressed[1]||f.pressed[9]){if(cameraControls.active)cameraControls.close();else if(activities.paused)activities.close();else toggleDir(false);return;}
  // In a conversation, A finishes the line being typed, then takes the highlighted reply.
  if(root.id==='activity'&&activities.dialogue?.active&&f.pressed[0]){activities.dialogue.confirm();return;}
  navigateControls(root,direction);
  if(f.pressed[0]){const items=focusableControls(root);if(items.includes(document.activeElement))document.activeElement.click();else items[0]?.focus();}return;
 }
 if(!controlsAllowed())return;
 if(f.pressed[9]||f.pressed[8]){toggleDir(true);return;}
 if(f.pressed[3]){activities.inventory();return;}
 if(f.pressed[11])centreCamera();
 if(f.pressed[0]){doInteract();return;}
 if(f.pressed[2])drinkNow();
 if(f.pressed[5])characters.jump();
}

const releasePressedControls=()=>pressedControls.clear();
addEventListener('pointerup',releasePressedControls);
addEventListener('pointercancel',releasePressedControls);
addEventListener('pointerdown',()=>{controlsTouchedAt=performance.now();});
// Jump is bound inside the character rig, so mark its press here to keep the same
// rule: a button being held stays on screen until the finger leaves it.
$('#jump').addEventListener?.('pointerdown',()=>pressedControls.add('jump'));
function updateContextControls(){
 document.body.classList.toggle('hud-seated',!!seated);
 const blocked=cameraControls.active||roomLoading||activities.paused||inspector?.active||!$('#directory').classList.contains('hidden')||!$('#qte').classList.contains('hidden');
 const exit=activeRoomLayout?.exit||roomDoorway||[0,0,3.8];
 $('#exitRoomButton').classList.toggle('hidden',!roomExitVisible({playing:started,inside:!!current,paused:blocked,seated,position:player.position,exit}));
 const now=performance.now();
 if(!blocked&&(move2.lengthSq()>.02||Math.hypot(touchSticks.move.x,touchSticks.move.y)>.05)){controlsMovingUntil=now+1400;controlsTouchedAt=now;}
 // Hold the action button for a moment after its target is lost. Walking past scenery
 // otherwise blinks it in and out, and a tap can land where the button just was.
 if(!blocked&&active)controlsTargetUntil=now+450;
 const items=activities.state.inventory?.length||0;hudIcons.count(items);
 // While you walk, the top buttons fade back so the street has the screen.
 document.body.classList.toggle('hud-moving',!blocked&&now<controlsMovingUntil);
 const state=controlVisibility({playing:started,paused:blocked,seated,inside:!!current,moving:now<controlsMovingUntil,running:touchRunning,canDrink:!!hands?.canDrink,hasTarget:!!bicycleRide||now<controlsTargetUntil,hasItems:items>0,pressed:[...pressedControls]});
 for(const [id,visible] of Object.entries(state)){
  const element=$('#'+id);
  if(id==='mobile'){element.classList.toggle('hidden',!visible);continue;}
  // The bag lives in the menu, where exploration is deliberately paused.
  const show=id==='bagButton'?started&&items>0:visible;
  element.classList.toggle('control-off',!show);
  if(id==='bagButton')element.hidden=!show;
 }
 if(stickHintUntil&&(now>stickHintUntil||touchSticks.moving)){touchSticks.hint(false);stickHintUntil=0;}
 // Soft quest: quay before evening press (~18:30), once per calendar dayKey if picked.
 // Time of day, not minutes since the save began: it used to fire on load from day two.
 const dayMinute=((minutes%1440)+1440)%1440;
 if(started&&activities?.state&&dayMinute>=1080&&dayMinute<1170){
  ensureDailyQuests(activities.state);
  if(hasDailyQuest(activities.state,'quay_before_press')&&!isDailyDone(activities.state,'quay_before_press')){
   const visited=activities.state.visited||[];
   const sawQuay=visited.some(id=>['office','warehouse','pier','harbour','quay'].includes(id));
   markDailyDone(activities.state,'quay_before_press');activities.save();
   if(!sawQuay)say(QUAY_NUDGE,6);
  }
 }
}
const invalidateDetails=()=>{townSections.invalidate();shopStreetView.invalidate();};
// Feet on whatever is drawn: lanes, aprons, decks (walk-surface.js). Laid once now and
// again whenever a streamed detail arrives.
const walkSurface=createWalkSurface({minX:COAST_BOUNDS.minX-2,maxX:COAST_BOUNDS.maxX+2,minZ:COAST_BOUNDS.minZ-2,maxZ:COAST_BOUNDS.maxZ+2,base:planHeight});
{const t0=performance.now();walkSurface.add(town);setWalkSurface(walkSurface);window.__JOHANSSON_WALK__={ms:Math.round(performance.now()-t0),get triangles(){return walkSurface.triangles;}};}
const detailStream=createDetailStream({onChange:()=>{invalidateDetails();walkSurface.add(town);}});window.__JOHANSSON_STREAMING__=detailStream.stats;
// With ?audit in the address, a harness can put the player anywhere and look down on
// the town from a fixed camera. Nothing reads it otherwise.
if(new URLSearchParams(location.search).has('audit'))window.__JOHANSSON_AUDIT__={
 teleport(x,z,facing){if(seated){seated=false;parkSeat=null;johansson?.seat?.(null);}player.position.set(x,groundHeight(x,z),z);if(Number.isFinite(facing))yaw=facing;},
 camera:null,
 step(milliseconds){const seconds=Math.min(300000,Math.max(0,Number(milliseconds)||0))/1000;const following=followRealClock;followRealClock=false;try{for(let elapsed=0;elapsed<seconds;elapsed+=1/60)simulate(Math.min(1/60,seconds-elapsed),false);}finally{followRealClock=following;}const view=this.camera;if(view){camera.position.set(...view.pos);camera.lookAt(...view.at);camera.updateMatrixWorld();}characters?.update(0);castAI?.pose(0);setTime();updateContextControls();$('#clock').textContent=fmt(minutes);renderer.render(scene,camera);},
 photo:()=>openPhotoStudio(),
 get photoActive(){return !!photoStudio?.active;},
 get world(){return world;},
 /** The ground and the surface under a point, as the simulation reads them (clipping audits). */
 ground(x,z){return groundHeight(x,z);},route(x,z){const r=routeAt(x,z);return r?{id:r.id,surface:r.surface}:null;},
 enter(id){const s=id===CITY_RESTAURANT.id?NAHA_TRIP:SITES.find(site=>site.id===id);return s?enterRoom(s):null;},
 leave(){leaveRoom();},
 interact(){doInteract();},
 get conversation(){const sp=conversationLine?.speaker;if(!sp)return {name:conversationName,speaker:null};const w=sp.getWorldPosition(new THREE.Vector3()),t=characters.conversationTarget(sp);return {name:conversationName,visible:sp.visible,seated,third:thirdPerson,speaker:w.toArray().map(v=>+v.toFixed(2)),target:t?.toArray?.().map(v=>+v.toFixed(2)),player:player.position.toArray().map(v=>+v.toFixed(2)),yaw:+yaw.toFixed(2)};},
 use(label){const o=interactables.find(o=>o.userData.hit?.label===label);if(!o)return false;active={...o.userData.hit,object:o};o.userData.hit.fn();return true;},
 get active(){return active?.label||null;},
 near(r=3.2){const q=new THREE.Vector3();return interactables.map(o=>{o.getWorldPosition(q);return [o.userData.hit?.label,+q.distanceTo(player.position).toFixed(2),o.visible,!!o.userData.hit?.inside];}).filter(x=>x[1]<r);},
 get seated(){return seated;},
 get beer(){return beerService?{pending:beerService.pending,drink:beerService.drink}:null;},
 get paused(){return !!activities?.paused;},
 get blocked(){return {catchingUp,roomLoading,camera:!!cameraControls.active,inspector:!!inspector?.active,directory:!$('#directory').classList.contains('hidden'),started,hidden:document.hidden};},
 get johansson(){return johansson;},
 get room(){return room;},get scene(){return scene;},get renderer(){return renderer;},get layout(){return activeRoomLayout;},
 get island(){return islandPlay;},
 get activities(){return activities;},get bookshopCustomers(){return bookshopCustomers.snapshot();},
 /** The neighbours' small talk: how many chats so far, the one running, and how many the model has written. */
 get chats(){const c=neighbourChats.current;return {count:neighbourChats.count,written:neighbourWriter.written,model:neighbourWriter.ready,current:c?{pair:c.pair.map(p=>p.profile.name),topic:c.topic,text:c.text}:null};},
};
if(window.__JOHANSSON_AUDIT__){
 window.advanceTime=ms=>window.__JOHANSSON_AUDIT__.step(ms);
 window.render_game_to_text=()=>JSON.stringify({coordinates:'x/z in metres; y is height; interiors use local coordinates',room:current?.id||null,home:activeRoomLayout?.snapshot?.()||null,minutes,player:player.position.toArray(),customers:bookshopCustomers.snapshot(),island:islandPlay?.snapshot()});
}
// Where the player is standing and what they are standing on. Read-only, and the same
// answer the simulation uses, so a screenshot can be tied to a place on the ground.
window.__JOHANSSON_POSE__={
 get x(){return player.position.x;},get y(){return player.position.y;},get z(){return player.position.z;},
 get yaw(){return yaw;},get pitch(){return pitch;},get inside(){return current?.id||null;},
 get ground(){return routeAt(player.position.x,player.position.z)?.id||null;},
 get bus(){const run=world.ferry||world.bus;return run?{phase:run.phase,service:run.service??null,z:+run.bus.position.z.toFixed(1),scale:+run.bus.scale.x.toFixed(3),visible:run.bus.visible}:null;},
 get doors(){return (world.shopDoors||[]).map(d=>+d.amount.toFixed(3));},
 /** The town clock, in minutes past midnight, so a routine can be watched against it. */
 get minutes(){return Math.round(minutes);},
 // Who is at the terminus and who has gone, so the boarding can be watched rather
 // than inferred from where somebody was standing a moment ago.
 get transit(){return world.people.filter(p=>['bus','away','station'].includes(p.g.userData.place))
  .map(p=>p.profile.name+':'+p.g.userData.place+(p.g.visible?'':' (gone)'));},
 get surface(){return routeAt(player.position.x,player.position.z)?.surface||null;},
};
// What each of the cast is actually playing. Which animation a body has chosen is
// invisible from a screenshot -- a weight shift and a loop look identical in a still --
// so there is otherwise no way to check from outside that anyone is using more than
// the first take of an idle.
/** Minato's beer service, for watching an order go from the tap to the table. */
window.__JOHANSSON_BEER__=()=>beerService?{pending:beerService.pending,drink:beerService.drink,served:beerService.served}:null;
window.__JOHANSSON_CAST__={
 get takes(){return (characters?.actors||[]).map(a=>({
  name:a.entity?.userData?.name||'?',clip:a.current||null,gesture:a.animator?.gesture||null,
  moving:!!a.moving,speed:+(a.speed||0).toFixed(2),activity:a.entity?.userData?.activity||null,indoors:a.entity?.userData?.indoors||null,visible:!!a.entity?.visible,flags:Object.keys(a.entity?.userData||{}).filter(k=>/^in[A-Z]/.test(k)&&a.entity.userData[k]===true),at:a.entity?[+a.entity.position.x.toFixed(2),+a.entity.position.z.toFixed(2),+a.entity.rotation.y.toFixed(2)]:null}));},
};
// Sakura's books, live rather than as last saved. The shop's day is settled on the
// town clock whether or not anybody is standing in it, and the saved copy lags, so
// there was no way to see from outside whether the meter had actually run.
window.__JOHANSSON_SHOP__={
 get books(){const shop=activities?.state?.sakura;return shop?{
  cash:shop.cash,sales:shop.sales,result:shop.profit,overheads:shop.overheads,
  drawings:shop.drawings,stockSpent:shop.stockSpent,settledDay:shop.settledDay,
  entries:shop.journal.length,kinds:[...new Set(shop.journal.map(r=>r.kind))]}:null;},
};
for(const detail of world.details||[])detailStream.add(detail);

detailStream.add({id:'warehouse',priority:1,x:WAREHOUSE.x,z:WAREHOUSE.z,radius:38,load:()=>world.warehouse?.load()});
// The real shop behind the real window. It streams with the rest of the street rather
// than blocking the entry gate, and the stand-in shelves hold the window until it lands.
{
 const market=SITES.find(s=>s.id==='market'),front=market?.streetFrontage?.position;
 if(front)detailStream.add({id:'sakura-interior',priority:1,x:front[0],z:front[2],radius:40,
  // Not while you are in the shop: the loader can finish after you walk in, and parking the
  // shop behind its glass then took the interior out from round you. Leaving parks it.
  load:async()=>{const ready=await sakuraShop.ready();return ready?(current?.id==='market'?true:showShopThroughWindow()):false;}});
}
let detailsStarted=false;

function loop(){requestAnimationFrame(loop);if(photoStudio?.active){clock.getDelta();photoStudio.render();return;}if(creatorOpen){clock.getDelta();return;}izakayaTV?.update({camera,active:current?.id==='izakaya',paused:!started||document.hidden||roomLoading||!!inspector?.active||!!activities?.paused});if(detailsStarted&&!document.hidden&&!catchingUp)detailStream.update(current?doors.get(current.id)||player.position:player.position,current?null:{x:-Math.sin(yaw),z:-Math.cos(yaw)});updateContextControls();const frameDt=Math.min(clock.getDelta(),MAX_FRAME_DT);governResolution(frameDt);updateWantCards(frameDt);sweepCel(frameDt);updateController(frameDt);activeRoomLayout?.workshop?.update(activities.state,activities.paused?0:frameDt);if(started&&!activities.paused&&!document.hidden)activeRoomLayout?.dungeon?.update(frameDt,player.position);if(fists){fists.visible=!thirdPerson;fists.guard(current?.id==='dungeon'&&!!activeRoomLayout?.dungeon?.nearFoe(player.position));fists.update(frameDt);}if(started&&!document.hidden){const paused=catchingUp||cameraControls.active||roomLoading||inspector?.active||itemViewer?.active||activities.paused||!$('#directory').classList.contains('hidden');const before=player.position.clone();if(catchingUp)catchUpFrame();else simulate(frameDt,!!paused);if(!paused){if(player.position.distanceTo(before)>.01&&(stepTick+=frameDt)>.42){activities.footstep(current?'wood':routeAt(player.position.x,player.position.z)?.surface||'stone');stepTick=0;}interaction();}else{neighbourChats.cancel();chatBubble.hide();resetInput();$('#prompt').classList.remove('on');}townAudio.update({player:player.position,yaw,minutes,rain:weather,inside:!!current,station:activities.state.radioStation||0,paused,relax:!!(seated&&parkSeat?.beachCorner)});$('#clock').textContent=fmt(minutes);setTime();hands?.update(paused?0:frameDt);updateJohansson(paused?0:frameDt);if(!inspector?.active){characters?.update(frameDt);castAI?.pose(frameDt);if(!paused||conversationLine)facing.update(frameDt);}if(!paused||conversationLine){chatBubble.render(conversationLine?null:(neighbourChats.current||residentSpeech()));updateConversationLift(frameDt);}if((mapTick+=frameDt)>.15){drawMap();mapTick=0;}if(subtitleTimer>0&&(subtitleTimer-=frameDt)<=0)$('#subtitle').classList.remove('on');if(current&&activeRoomLayout?.fixedCamera&&!window.__JOHANSSON_AUDIT__?.camera){const f=activeRoomLayout.fixedCamera;camera.position.set(...f.pos);camera.lookAt(...f.at);camera.updateMatrixWorld();}if(current&&window.__JOHANSSON_AUDIT__?.camera){const a=window.__JOHANSSON_AUDIT__.camera;camera.position.set(...a.pos);camera.lookAt(...a.at);camera.updateMatrixWorld();}if(inspector?.active)present(()=>inspector.render(frameDt),inspector.camera);else if(current?.id==='market')present(()=>shopStreetView.render({renderer,scene,camera,town,room,frontage:current.streetFrontage?{...current.streetFrontage,interiorZ:sakuraShop.layout.frontZ}:null}));else if(!current)renderOutdoor();else present(()=>renderer.render(scene,camera))}else{neighbourChats.cancel();chatBubble.hide();}}renderOutdoor();loop();

function renderOutdoor(){
  const audit=window.__JOHANSSON_AUDIT__?.camera;
  if(audit){camera.position.set(...audit.pos);camera.lookAt(...audit.at);camera.updateMatrixWorld();}
  present(()=>townSections.render({renderer,scene,camera,town,position:player.position}));
  if(window.__JOHANSSON_STARTUP__&&!window.__JOHANSSON_STARTUP__.firstFrameMs){window.__JOHANSSON_STARTUP__.firstFrameMs=performance.now()-window.__JOHANSSON_STARTUP__.startedAt;window.__JOHANSSON_STARTUP__.stage='playing';}
}
// Open on the device's clock: a save from earlier today is fast-forwarded to now so the
// town is where it would be; anything older, or from the old fast clock, opens at now.
activities.takeAbsence();
{const setting=readClockSetting(globalThis.localStorage);
 if(setting.start==='real'){townClock.ahead=activities.state.clockAhead||0;const plan=clockCatchUp(activities.state.minutes-townClock.ahead);minutes=plan.start+townClock.ahead;advanceAbsentTown(plan.fastForward);}
 else{minutes=startingMinutes(setting,activities.state.minutes);townClock.set(minutes,setting.speed);}}
// Allow the opening frame to paint before starting any district downloads.
requestAnimationFrame(()=>requestAnimationFrame(()=>{detailsStarted=true;}));

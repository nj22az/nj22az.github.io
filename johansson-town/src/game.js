import {createGamepadInput,createMenuRepeat,lookStep} from './input/analogue.js';
import {createTouchSticks} from './input/touch-sticks.js';
import {createCameraControls,navigateControls,focusableControls} from './input/camera-controls.js';
import {elapsedTownAbsence} from './people/town-absence.js';
import {createTownCleanup} from './world/town-cleanup.js';
import {streetToRoom,roomToStreet} from './world/doorway.js';
import {createRamenPlayerService} from './people/ramen-player-service.js';
import {RAMEN_LAYOUT} from './world/interiors/ramen-layout.js';
import {SAKURA_LAYOUT} from './world/interiors/sakura-layout.js';
import {createSakuraShop} from './people/sakura-shop.js';
import {createBusinesses,businessId} from './world/businesses.js';
import {buildCompactShop} from './world/interiors/compact-shops.js';
import {buildBusinessContent,BUSINESS_CONTENT_CATALOGUE} from './world/interiors/business-content.js';
import {WAREHOUSE} from './world/warehouse.js';
import {assignWorkplaces} from './people/workplaces.js';
import {createHomeResidents} from './people/home-residents.js';
import {homeOwner} from './people/home-life.js';
import {buildResidentHome} from './world/interiors/resident-home.js';
import {createWorkplaceResidents} from './people/workplace-residents.js';
import {createResidentLedger} from './people/resident-personalities.js';
import {createTownActivities} from './people/town-activities.js';
import {createVenueService} from './people/venue-service.js';
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
import {buildIzakayaRoom,preloadIzakaya,izakayaReady} from './world/izakaya.js?snappy=1';
import {createIzakayaGuests} from './people/izakaya-guests.js';
import {controlVisibility} from './interact/control-visibility.js';
import {createTownSky} from './render/sky.js';
import {conversationViewport} from './conversation-layout.js';
import {shelfAimScore} from './interact/aim.js';
import {atmosphere} from './render/atmosphere.js?dusk-1';
import {clock as duskClock, daylight} from './render/dusk.js';
import {loadTownEnvironment} from './render/environment.js';
import {createHands} from './interact/hands.js?ui=compact-2';
import {townAudio} from './audio/town-audio.js?snappy=1';
import {routeAt,groundHeight} from './world/layout.js?snappy=1';
import {drawTownMap} from './world/map.js?snappy=1';
import * as THREE from '../vendor/three.module.js';
import { createTown } from './world/town.js?snappy=1';
import { createActivities } from '../activities.js?snappy=1';
import { createInspector } from '../inspect-3d.js';
import { createCastAI } from './people/schedules.js?snappy=1';
import { createCharacters, preloadCharacter } from './people/characters.js?snappy=1';
import { circleHitsRect,circleHitsCircle,roomBoundsBlocked,townBoundsBlocked } from '../physics.js?snappy=1';
import { createCelPass } from './render/cel.js?snappy=1';
import { createInkPipeline } from './render/ink-pipeline.js?snappy=1';
import { createInkRecovery } from './render/ink-recovery.js';

const $=s=>document.querySelector(s);
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const mobile=isIOS||touch,tabletLike=touch&&Math.min(innerWidth,innerHeight)>=700,highTier=!mobile||tabletLike,shadows=highTier,canvas=$('#game');
const renderDpr=()=>Math.min(window.devicePixelRatio||1,mobile?(tabletLike?1.45:1.2):2);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false,preserveDrawingBuffer:false});
renderer.setPixelRatio(renderDpr());renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=shadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8dce9);scene.fog=null;const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.07,220);
const bands=new Uint8Array([48,48,48,255,115,115,115,255,184,184,184,255,255,255,255,255]),gradient=new THREE.DataTexture(bands,4,1,THREE.RGBAFormat);gradient.needsUpdate=true;gradient.magFilter=THREE.NearestFilter;gradient.minFilter=THREE.NearestFilter;
const outlineMat=new THREE.MeshBasicMaterial({color:0x252821,side:THREE.BackSide}),boxCache=new Map();
const toon=(c,map=null)=>new THREE.MeshStandardMaterial({color:c,map,roughness:.82});
const boxGeo=s=>{const k=s.join(',');if(!boxCache.has(k))boxCache.set(k,new THREE.BoxGeometry(...s));return boxCache.get(k)};
function box(size,pos,color,parent,outline=true){const g=boxGeo(size),m=new THREE.Mesh(g,toon(color));m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);if(false&&outline){const o=new THREE.Mesh(g,outlineMat);o.position.copy(m.position);o.rotation.copy(m.rotation);o.scale.set(1.018,1.018,1.018);parent.add(o)}return m}
function mesh(geo,pos,color,parent,outline=true){const m=new THREE.Mesh(geo,toon(color));m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);if(false&&outline){const o=new THREE.Mesh(geo,outlineMat);o.position.copy(m.position);o.scale.set(1.022,1.022,1.022);parent.add(o)}return m}
function signTex(a,b,accent='#9b4035'){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='#efe3c7';x.fillRect(0,0,512,128);x.fillStyle=accent;x.fillRect(0,0,14,128);x.strokeStyle='#252821';x.lineWidth=5;x.strokeRect(5,5,502,118);x.fillStyle='#252821';x.textAlign='center';x.textBaseline='middle';x.font='700 43px Yu Gothic,system-ui';x.fillText(a,256,50);x.font='800 15px system-ui';x.fillText(b.toUpperCase(),256,99);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}

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
 superScale:mobile?(tabletLike?1.4:1.25):1.5,
 pixelBudget:mobile?2.4e6:4.6e6,
 // FXAA is a single pass and it is the one that resolves the line work, so it is
 // worth having on the devices whose buffers need it most.
 fxaa:true,
 // Sakura Crossing grades flat painted colour. This town is built on photographed
 // concrete and timber, which starts darker and busier, so the darks are tinted
 // less heavily and lifted further than the reference does — otherwise the street
 // goes to mud rather than to violet.
 gradeOptions:{shadowTint:0xd4cfe8,lift:.07,saturation:1.18}
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
const CEL_FILL=1.75;
// With tone mapping off, the grade carries the overall level; flat bands need more
// headroom than the rolled-off highlights AgX used to give.
const CEL_EXPOSURE=1.2;
const ambient=new THREE.HemisphereLight(0xdbe7f2,0x6b5f8c,1.15);scene.add(ambient);
const bounce=new THREE.DirectionalLight(0x9db6e8,1.25);bounce.position.set(26,16,-22);scene.add(bounce);
const uplight=new THREE.DirectionalLight(0xc9b9e0,.35);uplight.position.set(4,-18,6);scene.add(uplight);
const sun=new THREE.DirectionalLight(0xffdca8,highTier?2.6:2.3);sun.position.set(-28,38,18);sun.castShadow=shadows;
if(shadows){sun.shadow.mapSize.set(tabletLike?1024:2048,tabletLike?1024:2048);sun.shadow.camera.left=-26;sun.shadow.camera.right=26;sun.shadow.camera.top=26;sun.shadow.camera.bottom=-26;sun.shadow.camera.near=.5;sun.shadow.camera.far=120;sun.shadow.bias=-.00035;sun.shadow.normalBias=.045}scene.add(sun);

// The peninsula is the published layout: the konbini, the park, the port and the road
// out to the bus stop. The other businesses stay defined and come back by putting
// their ids back in this list, one at a time, once there is a building for them.
//
// Front-Row is the second. On the old street it is an alley unit — a recessed door in
// the side of the supplied night-market kit — and that kit is not built here, so it
// gets a frontage of its own on the west pavement (see west-shops.js) with Minato
// next door to the south and Sakura beyond that. Minato is not in this list because
// buildIzakaya supplies its own site.
const PENINSULA_SITES=['market','frontrow'];
const SITES=createBusinesses().filter(site=>PENINSULA_SITES.includes(site.id));

const interactables=[],roomColliders=[],doors=new Map();
let catchingUp=false,hiddenAt=0;
let inspector=null,content=null,castAI=null,hands=null,storeService=null,ramenPlayerService=null,venueService=null,izakayaTV=null,seated=false,parkSeat=null,touchRunning=false;
// Contextual touch-control state. Declared with the rest of the player state because
// starting play stamps the touch clock, and that can happen while this module runs.
let controlsMovingUntil=0,controlsTargetUntil=0,controlsTouchedAt=0;
let stickHintUntil=0;
// A control under a finger must not be hidden out from under it. Any pointer release
// ends every press, so a control can never stay pinned on by a touch we lost track of.
const pressedControls=new Set();
let conversationName=null,conversationCamera=null,navigationTarget=null;
let activeRoomLayout=null;
let current=null,active=null,started=false,yaw=0,pitch=-.05,minutes=1002,subtitleTimer=0,weather=false,activities=null,timePreset=0,characters=null;
const keys={},clock=new THREE.Clock();
const gamepadInput=createGamepadInput(),menuRepeat=createMenuRepeat();
let controllerFrame=gamepadInput.sample([]),controllerConnected=false;
const cameraControls=createCameraControls({onChange:()=>syncView(),onCentre:centreCamera,onOpen:()=>resetInput(),onClose:()=>resetInput()});
camera.fov=cameraControls.settings.fov;camera.updateProjectionMatrix();
document.documentElement.classList.toggle('touch-controls',touch);
function centreCamera(){pitch=0;camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
function controlsAllowed(){return started&&!document.hidden&&!roomLoading&&!activities?.paused&&!inspector?.active&&!cameraControls.active&&$('#directory').classList.contains('hidden')&&$('#qte').classList.contains('hidden');}
function dragLook(dx,dy){const c=cameraControls.settings;yaw-=dx*.004*c.sensitivity;pitch=THREE.MathUtils.clamp(pitch-dy*.0032*c.sensitivity*(c.invertY?-1:1),-1.25,1.15);}
const touchSticks=createTouchSticks({canvas,movePad:$('#stick'),stickBase:$('#stickBase'),stickKnob:$('#knob'),enabled:controlsAllowed,onDrag:dragLook});
function openCamera(){if(!started||inspector?.active||activities?.paused)return;cameraControls.open();}
$('#cameraButton').onclick=openCamera;$('#cameraMenuButton').onclick=openCamera;
const PLAYER_RADIUS=.28,NPC_RADIUS=.35,MAX_FRAME_DT=.1,SIM_STEP=1/60;
const move2=new THREE.Vector2(),fwVec=new THREE.Vector3(),rtVec=new THREE.Vector3(),moveVec=new THREE.Vector3(),turnQ=new THREE.Quaternion(),yAxis=new THREE.Vector3(0,1,0);

const player=new THREE.Group();scene.add(player);player.position.set(0,0,46);
player.visible=false;

const reg=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};if(!interactables.includes(o))interactables.push(o)};
function say(t,sec=3){const e=$('#subtitle');e.textContent=t;e.classList.add('on');subtitleTimer=sec}

 const world=createTown({scene:town,sites:SITES,townMode:'peninsula',mobile,shadows,maxAnisotropy:renderer.capabilities.getMaxAnisotropy(),register:reg,enter:s=>crossThreshold(()=>enterRoom(s)),getPlayerPosition:()=>player.position,onAction:(...args)=>{if(args[0]==='resident'){const person=world.people.find(p=>p.g.userData.name===args[1]);if(person?.g.userData.sleeping){say(args[1]+' is sleeping. You can stay and watch the morning routine.',4);return;}if(person?.g.userData.waking||person?.g.userData.roomTransition){say(args[1]+' is '+person.g.userData.activity+'.',3);return;}if(person){person.g.userData.facePlayerUntil=performance.now()+1600;characters?.gesture(person.g);}}if(args[1]==='Convex traffic mirror')world.beats?.mirror();activities.action(...args);}});
assignWorkplaces(world,SITES);
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
activities=createActivities({say,onInspectModel:item=>inspector.open(item),getResidentLocations:()=>castAI?.snapshot?.(),getTableService:()=>current?.id==='ramen'&&Number.isInteger(parkSeat?.ramenSeatId)?ramenPlayerService:null,onStand:standUp,onConversation:setConversation,getMinutes:()=>minutes,getSocialContext:()=>({inside:current?.id,thuanAvailable:world.people.some(p=>p.profile.name==='Thuan'&&p.g.userData.inMarket&&p.g.visible&&!p.g.userData.sleeping),names:current?.id==='izakaya'?izakayaGuests.sync(minutes):current?.id==='ramen'?ramenGuests.sync(minutes):[]}),onMap:()=>{const c=document.createElement("canvas");c.width=680;c.height=640;c.style.width="100%";c.style.height="auto";c.style.position="static";c.setAttribute("aria-label","Folded visitor map, Johansson Town, 1988");drawTownMap(c.getContext("2d"),c.width,c.height,{sites:SITES,landmarks:world.landmarks,people:world.people,player:current?doors.get(current.id):player.position,yaw,visited:activities.state.visited});return c;},onPhone:()=>{const p=world.people.find(p=>p.g.userData.name==='Harbour master');if(p&&(FULL_TOWN.active||p.g.position.z<-37)){characters.gesture(p.g);activities.close();say('The harbour master answers from the quay.',4);return true;}return false;},onPurchase:name=>{const p=new THREE.Vector3();active?.object?.getWorldPosition(p);hands.offer(name,p);return true;},onSeat:name=>{if(active?.object?.userData.reservedBy){say('That seat is occupied.',3);return true;}const selected=active?.object?.userData.seat;if(selected?.storeSeatId&&(storeService?.occupied(selected.storeSeatId)||world.people.some(p=>p.g.userData.inMarket&&p.g.userData.storeSeatId===selected.storeSeatId))){say('That chair is occupied.',3);return true;}activities.close();const ax=player.position.x,az=player.position.z,ay=player.position.y,seat=active?.object?.userData.seat,approachClear=!environmentBlocked(ax,az)&&!occupiedByPerson(ax,az);const sit=seat?.position||[ax,ay,az];const stand=approachClear?[ax,ay,az]:seat?.stand||(()=>{const p=findClear(ax,az);return [p[0],ay,p[1]];})();parkSeat={ramenSeatId:seat?.ramenSeatId,storeSeatId:seat?.storeSeatId,position:sit,stand,eyeY:seat?.eyeY??1.15,yaw:Number.isFinite(seat?.yaw)?seat.yaw:yaw,pitch:Number.isFinite(seat?.pitch)?seat.pitch:pitch};player.position.set(...parkSeat.position);if(Number.isFinite(parkSeat.yaw))yaw=parkSeat.yaw;if(Number.isFinite(parkSeat.pitch))pitch=parkSeat.pitch;seated=true;resetInput();say(Number.isInteger(parkSeat.ramenSeatId)?'Ramen counter · E or tap to order, eat or stand':name+' · E to stand',5);return true;},onDrink:name=>{activities.close();if(hands.held===name)hands.drink();else hands.offer(name,player.position,true);return true;},onEscort:()=>{activities.state.kenjiEscort='walking';activities.save();},onWeather:value=>{weather=value;world.setRain(value);},onTime:value=>{if(value&&typeof value==='object'){minutes=value.restore;return;}if(value==='cycle'){timePreset=(timePreset+1)%4;minutes=[1002,1110,1230,540][timePreset];}else minutes+=value;evictIfClosed();}});
syncView();
hands=createHands({scene,camera,say,consume:name=>{const i=activities.state.inventory.indexOf(name);if(i<0)return false;activities.state.inventory.splice(i,1);activities.state.inventory.push('Empty can');activities.save();return true;}});
characters=createCharacters({mobile,shadows,canJump:()=>!seated&&controlsAllowed(),isBlocked:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),onError:(name,error)=>console.warn('Character construction failed:',name,error)});characters.attach(player,'player',1.82);world.people.forEach(p=>characters.attach(p.g,p.g.userData.name,p.profile?.height));
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
const chatBlocked=(a,b)=>!clearChatLine(a,b,current?roomColliders:world.colliders);
const neighbourChats=createNeighbourChats({world,observer:()=>player.position,blocked:chatBlocked,state:()=>activities.state});
const chatBubble=createChatBubble({camera,canvas,target:g=>characters.conversationTarget(g),blocked:chatBlocked});
// Whoever you are talking to turns to face you, unless they are mid-something, in
// which case they answer over their shoulder. See people/facing.js.
const facing=createFacing({world,getPlayerPosition:()=>player.position});
let conversationLine=null;
/** The current conversation line, as the world bubble wants it. */
function conversationChat(){
 if(!conversationLine)return null;
 const speaker=conversationLine.speaker;
 if(!speaker?.visible)return null;
 return {speaker:{g:speaker,profile:{name:conversationLine.name}},text:conversationLine.text};
}
function residentSpeech(){const person=world.people.filter(p=>p.g.userData.residentSpeech?.until>minutes&&p.g.visible&&p.g.userData.hit.inside===!!current&&(!p.g.userData.inMarket||current?.id==='market')).sort((a,b)=>a.g.position.distanceToSquared(player.position)-b.g.position.distanceToSquared(player.position))[0];return person?{speaker:person,text:person.g.userData.residentSpeech.text}:null;}
function roomHit(object,label,kind,title,text){reg(object,label,()=>activities.action(kind,title,text),true);return object;}
function roomCollider(x,z,w,d,height=2.8,minY=0){roomColliders.push({x,z,w,d,height,minY});}

const izakayaGuests=createIzakayaGuests({world,parent:scene,collides:environmentBlocked,getRain:()=>weather,getState:()=>activities.state,onBorrow:npcActivities.release,getThuan:()=>{const g=ensureThuan();if(!interactables.includes(g))reg(g,'Catch up with Thuan',()=>activities.action('resident','Thuan'),true);return g;}});
const ramenLife=new THREE.Group();ramenLife.name='Inakaya continuous dining';ramenLife.userData.sharedAsset=true;ramenLife.visible=false;scene.add(ramenLife);
const ramenBlocked=(x,z,r=.3)=>suppliedRoomBoundsBlocked(RAMEN_LAYOUT,x,z,r)||RAMEN_LAYOUT.colliders.some(c=>circleHitsRect(x,z,r,c));
function hideRamen(){scene.add(ramenLife);ramenLife.visible=false;}
const ramenGuests=createIndoorResidents({world,parent:ramenLife,collides:ramenBlocked,getRain:()=>weather,place:'ramen',onBorrow:npcActivities.release,getState:()=>activities.state}),homeGuests=createHomeResidents({world,parent:scene,getState:()=>activities.state,collides:environmentBlocked,onBorrow:npcActivities.release,getRain:()=>weather});
const ramenMeals=createVenueService({room:ramenLife,place:'ramen',getMinutes:()=>minutes,ledger:residentLedger,getCustomers:()=>world.people.filter(p=>p.g.userData.inRamen)});
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
  if(activeRoomLayout){
    if(s.id==='ramen'){room.add(ramenLife);ramenLife.visible=true;ramenGuests.sync(minutes);ramenPlayerService=createRamenPlayerService({room,getSeat:()=>Number.isInteger(parkSeat?.ramenSeatId)?parkSeat:null,getMinutes:()=>minutes,getBalance:()=>activities.state.yen,pay:activities.spend,say});}
    if(homeOwner(s))homeGuests.enter(s,minutes);
    return;
  }
  if(s.id==='izakaya'){izakayaTV=buildIzakayaRoom({room,box,reg,collider:roomCollider,action:activities.action,exit:leaveRoom,signTexture:signTex}).television;izakayaGuests.sync(minutes);startVenueService('izakaya');const light=new THREE.HemisphereLight(0xffdfaa,0x886d5f,1.6);room.add(light);return;}

}

function clearRoom(){showShopThroughWindow();izakayaTV?.dispose();izakayaTV=null;activeRoomLayout?.workshop?.dispose();storeService?.cancel();ramenPlayerService?.dispose();ramenPlayerService=null;venueService?.dispose();venueService=null;workplaceResidents.restore();neighbourChats.cancel();chatBubble.hide();activeRoomLayout=null;izakayaGuests.restore();hideRamen();homeGuests.restore();roomColliders.length=0;const materials=new Set(),geos=new Set();room.traverse(o=>{for(let p=o;p&&p!==room;p=p.parent)if(p.userData.sharedAsset)return;if(o.isMesh){const list=Array.isArray(o.material)?o.material:[o.material];if(!o.userData.preserveMaterial)list.forEach(m=>m&&materials.add(m));if(![...boxCache.values()].includes(o.geometry))geos.add(o.geometry);}});materials.forEach(m=>{if(!m.map?.userData?.sharedAsset)m.map?.dispose?.();m.dispose?.();});geos.forEach(g=>g.dispose?.());while(room.children.length)room.remove(room.children[0]);for(let i=interactables.length-1;i>=0;i--)if(interactables[i].userData?.hit?.inside&&!interactables[i].userData.persistentShop&&!interactables[i].userData.name)interactables.splice(i,1);}
function roomShell(s){
 clearRoom();town.visible=false;room.visible=true;
 const shared={site:s,room,reg,collider:roomCollider,action:activities.action,exit:leaveRoom};
 if(s.id==='market'){activeRoomLayout=SAKURA_LAYOUT;return;}
 activeRoomLayout=homeOwner(s)&&s.id!=='yuri-home'?buildResidentHome({...shared,profile:world.people.find(p=>p.profile.name===homeOwner(s)).profile,box}):s.id==='warehouse'?buildWarehouseInterior(shared):buildCompactShop(shared)||buildSuppliedRoom(shared);
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
 if(s.id==='izakaya'&&!izakayaReady('interior')){
  roomLoading=true;resetInput();say('Opening '+s.title+'…',20);
  try{await preloadIzakaya(['interior']);}finally{roomLoading=false;}
  if(!izakayaReady('interior')){say('Could not open '+s.title+'. Please try the door again.',5);return;}
 }
 if(isSuppliedRoom(s.id)&&!suppliedRoomReady(s.id)){
  roomLoading=true;resetInput();say('Opening '+s.title+'…',20);
  let ready=false;
  try{[ready]=await preloadSuppliedRooms([s.id]);}finally{roomLoading=false;}
  if(!ready){say('Could not open '+s.title+'. Please try the door again.',5);return;}
 }
 parkSeat=null;seated=false;activities.close();activities.visit(s.id);
 const streetYaw=yaw,streetPitch=pitch;
 current=s;roomShell(s);addRoomProps(s);content=buildBusinessContent({site:s,room,register:reg,onAction:activities.action,onInspect:item=>inspector.open(item)});room.traverse(o=>{if(!o.isMesh||o.userData.sharedAsset)return;const b=o.geometry?.parameters;if(b?.height<.25&&o.position.y>3.8||o.position.z>6&&o.position.y>1||o.position.x>6&&o.position.y>1){o.userData.cutaway=true;o.layers.set(0);}});const spawn=activeRoomLayout?.spawn||[0,0,4.3];
 player.position.set(...spawn);unstuckPlayer();workplaceResidents.enter(s,minutes);
 roomDoorway={x:spawn[0],z:spawn[2]??spawn[1],inward:activeRoomLayout?.yaw??0};
 // The heading goes through the door with you. Snapping to the room's own yaw and a
 // level pitch is the single thing that most makes an interior read as a different
 // place: you walk in looking where you were looking, not where the room says.
 yaw=streetToRoom(streetYaw,s,activeRoomLayout);
 pitch=THREE.MathUtils.clamp(streetPitch,-.55,.55);$('#exitRoomButton').classList.remove('hidden');syncView();active=null;$('#place').textContent=s.title.toUpperCase();$('#placeSub').textContent=`${s.jp} · ${s.sub}`;$('#timeText').textContent=s.line;say(s.id==='crystal-room'&&activeRoomLayout?'The timber door closes. Something here does not belong to the street.':`${s.title} · Explore the room. Tap objects nearby to examine them.`,s.id==='crystal-room'?5:3);camera.position.copy(player.position);camera.position.y+=1.7;}
function leaveRoom(){if(!current)return;showShopThroughWindow();izakayaTV?.dispose();izakayaTV=null;storeService?.cancel();ramenPlayerService?.dispose();ramenPlayerService=null;venueService?.dispose();venueService=null;workplaceResidents.restore();neighbourChats.cancel();chatBubble.hide();inspector?.close();activities.close();resetInput();$('#directory').classList.add('hidden');$('#exitRoomButton').classList.add('hidden');izakayaGuests.restore();hideRamen();homeGuests.restore();seated=false;parkSeat=null;active=null;const s=current;const roomYaw=yaw,roomPitch=pitch,roomLayout=activeRoomLayout;roomDoorway=null;current=null;syncView();room.visible=false;town.visible=true;if(s)placeAtEntrance(s,true);
 // and back out again the same way, by the same rotation: you leave facing where you
 // were facing inside, which for somebody who walked at the door is the street.
 if(s){yaw=roomToStreet(roomYaw,s,roomLayout);pitch=THREE.MathUtils.clamp(roomPitch,-.55,.55);}
 $('#place').textContent='JOHANSSON TOWN';$('#placeSub').textContent='ヨハンソン町 · HARBOUR DISTRICT';$('#timeText').textContent='Shops are open.';say('Johansson Street',1.5)}

function welcomeAtCounter(forward){
  if(storeWelcomed||!storeClerk?.visible||storeClerk.userData.visualReady===false||current?.id!=='market')return;
  const towards=storeClerk.position.clone().sub(player.position);towards.y=0;
  // Let the player see the greeting before the dialogue card covers the view.
  // Once per visit, only when approaching and looking towards the counter.
  if(towards.length()>3||forward.dot(towards.normalize())<.65)return;
  storeWelcomed=true;characters.gesture(storeClerk);
}
function interaction(){if(seated){active=null;$('#prompt').textContent=Number.isInteger(parkSeat?.ramenSeatId)?(ramenPlayerService?.order?.delivered?'Eat / drink · Stand up':ramenPlayerService?.order?'Order on its way · Stand up':'Order food · Stand up'):'Stand up';$('#prompt').classList.add('on');return;}active=null;let best=null,dmax=3.1,bestScore=Infinity;const p=player.position.clone();p.y+=1;const fw=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));welcomeAtCounter(fw);for(const o of interactables){const h=o.userData.hit;if(o.userData.visualReady===false||!o.visible||current&&!h.inside||!current&&h.inside)continue;let visible=true;for(let a=o.parent;a;a=a.parent)if(!a.visible)visible=false;if(!visible)continue;const q=new THREE.Vector3();o.getWorldPosition(q);const target=q.clone(),v=q.sub(p),d=v.length();if(d>dmax)continue;v.y=0;if(v.lengthSq()&&fw.dot(v.normalize())<-.2)continue;const score=o.userData.storeItem?shelfAimScore(camera.position,camera.getWorldDirection(new THREE.Vector3()),target):d;if(score>=bestScore)continue;bestScore=score;best={...h,object:o}}const e=$('#prompt');if(best){active=best;e.textContent=(touch?'':'E · ')+best.label;e.classList.add('on')}else e.classList.remove('on')}
function standUp(){if(!seated)return;ramenPlayerService?.cancel();if(parkSeat?.stand)player.position.set(...parkSeat.stand);parkSeat=null;seated=false;unstuckPlayer();say('You stand up.',2);}
function doInteract(){if(roomLoading||activities.paused)return;if(seated){if(Number.isInteger(parkSeat?.ramenSeatId))activities.action('store-table');else standUp();return;}if(inspector?.active)return;if($('#directory').classList.contains('hidden')){interaction();active?.fn?.();}}
function environmentBlocked(x,z,r=PLAYER_RADIUS){const bounds=current?(activeRoomLayout?suppliedRoomBoundsBlocked(activeRoomLayout,x,z,r):roomBoundsBlocked(x,z,r)):townBoundsBlocked(x,z,r);if(bounds)return true;const list=current?roomColliders:world.colliders;return list.some(c=>circleHitsRect(x,z,r,c));}
function entrancePoints(){return SITES.filter(s=>s.door).map(s=>[s.door[0],s.door[2]??s.door[1]]);}
function inEntrance(x,z,r=1.2){return entrancePoints().some(([dx,dz])=>Math.hypot(x-dx,z-dz)<r);}
function indoorNpc(g){return g.userData.inWorkplace||g.userData.inIzakaya||g.userData.inRamen||g.userData.inHome||g.userData.inMarket;}
function residentInView(g){if(g.userData.visualReady===false)return false;for(let node=g;node;node=node.parent)if(!node.visible)return false;return current?!!indoorNpc(g):!indoorNpc(g);}
function overlapsResident(x,z){return world.people.some(p=>residentInView(p.g)&&circleHitsCircle(x,z,PLAYER_RADIUS,p.g.position.x,p.g.position.z,NPC_RADIUS));}
function residentBlocked(x,z){if(!current&&inEntrance(x,z))return false;return overlapsResident(x,z);}
function collides(x,z){return environmentBlocked(x,z,PLAYER_RADIUS)||residentBlocked(x,z);}
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
 * Running into the painted tunnel.
 *
 * The bus road runs straight at it for thirty metres, so the one thing anybody is
 * going to do with a tunnel that is not a tunnel is run at it. There is rock behind
 * the paint: you bounce, the hill knocks, and you say so. Once per approach — the
 * collision repeats every step you hold the key down against it.
 */
let paintedBumpAt=-99;
function hitThePainting(x,z){
 if(!world.tunnel?.splat?.(x,z)||elapsed-paintedBumpAt<2.4)return;
 paintedBumpAt=elapsed;
 // Far enough back to see what you hit. Stopping dead against the painting filled the
 // screen with the painted dark, which is the one view that does not tell the joke.
 player.position.addScaledVector(moveVec,-1.15);
 if(pitch>-.2)pitch=THREE.MathUtils.clamp(pitch-.2,-1.25,1.15);
 townAudio.play('clunk',.55);
 say('いてっ！ · Ouch. There is rock behind the paint.',3);
}
function updatePlayer(dt){
 if(!seated)unstuckPlayer();
 const lookX=controllerFrame.look.x+touchSticks.look.x+(keys.KeyL?1:0)-(keys.KeyJ?1:0),lookY=controllerFrame.look.y+touchSticks.look.y+(keys.KeyK?1:0)-(keys.KeyI?1:0);
 ({yaw,pitch}=lookStep(yaw,pitch,THREE.MathUtils.clamp(lookX,-1,1),THREE.MathUtils.clamp(lookY,-1,1),dt,cameraControls.settings));
 let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-touchSticks.move.y-controllerFrame.move.y;
 let s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+touchSticks.move.x+controllerFrame.move.x;
 if(seated){s=0;f=0;}
 // Bounced off the painting: half a second of nobody being in charge, so the rebound
 // is visible instead of being walked straight back out of by a held key.
 if(elapsed-paintedBumpAt<.55){s=0;f=0;}
 move2.set(s,f);if(move2.lengthSq()>1)move2.normalize();
 fwVec.set(-Math.sin(yaw),0,-Math.cos(yaw));rtVec.set(Math.cos(yaw),0,-Math.sin(yaw));moveVec.copy(fwVec).multiplyScalar(move2.y).addScaledVector(rtVec,move2.x);
 if(moveVec.lengthSq()>.0001){
  const running=!!(keys.ShiftLeft||keys.ShiftRight||touchRunning||controllerFrame.held[4]||activities.state.sprintUntil>performance.now());
  const speed=(running?5.2:3)*dt,nx=player.position.x+moveVec.x*speed,nz=player.position.z+moveVec.z*speed;
  const stoppedX=collides(nx,player.position.z),stoppedZ=collides(player.position.x,nz);
  if(!stoppedX)player.position.x=nx;
  if(!stoppedZ)player.position.z=nz;
  if(running&&(stoppedX||stoppedZ))hitThePainting(nx,nz);
  turnQ.setFromAxisAngle(yAxis,Math.atan2(-moveVec.x,-moveVec.z));player.quaternion.slerp(turnQ,1-Math.pow(.001,dt));
 }
 updateDoorways(dt);
 player.visible=false;camera.position.copy(player.position).add(fwVec.set(0,seated?(parkSeat?parkSeat.eyeY-player.position.y:1.15):1.7+(cameraControls.settings.bob&&move2.lengthSq()>.02?Math.sin(elapsed*11)*.018:0),0));camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);
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
 const air=atmosphere(day,weather,!!current,minutes);
 scene.background.set(air.sky);scene.fog=air.fog;
 ambient.intensity=air.ambient*CEL_FILL;
 bounce.intensity=c.bounce;
 renderer.toneMappingExposure=air.exposure;
 pipeline?.setExposure(air.exposure*CEL_EXPOSURE);
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
 row(progress.unlocked?'✦ Town shortcuts unlocked':'🔒 Town shortcuts · '+progress.completed+'/'+progress.total+' favours',progress.unlocked?'Quick travel is ready. Choose a place below.':'Bring Tama home and finish Kenji’s workshop escort.',()=>{toggleDir(false);activities.action('travel-progress');},'travel-progress');
 const destination=(site,title)=>{row((progress.unlocked?'Go to ':'Find on foot · ')+(title||site.title),progress.unlocked?site.sub:placeDirections(site),()=>visitPlace(site),site.id);grid.lastChild.dataset.travel=progress.unlocked?'ready':'locked';};
 const teaHouse=SITES.find(s=>s.id==='tea-house');
 if(teaHouse)destination(teaHouse,'🍵 Corner Tea House');
 const izakaya=SITES.find(s=>s.id==='izakaya');
 if(izakaya){destination(izakaya,'🏮 Minato Izakaya');grid.lastChild.className+=' izakaya-shortcut';}
 section('Street');SITES.filter(s=>!['izakaya','tea-house'].includes(s.id)).forEach(s=>destination(s));
 (world.landmarks||[]).forEach(s=>destination(s));
 section('Residents');world.people.forEach(p=>row(p.g.userData.name,p.g.userData.activity||'On the street',()=>{activities.note(p.g.userData.name+' · '+(p.g.userData.activity||'on the street'));toggleDir(false);}));
 section('Reading and records');content.items.forEach(i=>row(i.title,i.place,()=>{const site=SITES.find(s=>s.id===i.siteId);if(site)markPlace(site);else toggleDir(false);}));
  section('Signals');[['82.1 Harbour Service','Harbour notices'],['89.4 JOJO','Journal requests'],['95.7 Sports','Prefectural baseball'],['Payphone','Near the bookshop'],['Harbour Line','Northern bus terminal']].forEach(([a,b])=>row(a,b,()=>{toggleDir(false);say(a+' · '+b,4);}));
}
function runStabilityChecks(){const failures=[];if(!townBoundsBlocked(160,0,PLAYER_RADIUS))failures.push('town edge');if(!roomBoundsBlocked(5.5,0,PLAYER_RADIUS))failures.push('room edge');if(world.colliders.length<20)failures.push('world collider coverage');if((world.quality?.streetInteractions||0)<8)failures.push('street interaction coverage');for(const [id,p] of doors){const site=SITES.find(s=>s.id===id)||(world.landmarks||[]).find(s=>s.id===id);const facing=site?.exitPosition||id==='warehouse'||homeOwner(site)?site?.entryFacing:null,exitStep=site?.exitPosition ? .6 : .7;const ex=Number.isFinite(facing)?p.x+Math.sin(facing)*exitStep:p.x,ez=Number.isFinite(facing)?p.z+Math.cos(facing)*exitStep:p.z+(id==='izakaya'?-.7:.7);if(environmentBlocked(p.x,p.z,PLAYER_RADIUS)||(!FULL_TOWN.active&&environmentBlocked(ex,ez,PLAYER_RADIUS)))failures.push(`door spawn ${id}`);}window.__JOHANSSON_STABILITY__={ok:failures.length===0,failures,colliders:world.colliders.length,characterCount:world.people.length+1,streetInteractions:world.quality?.streetInteractions||0,renderDpr:renderer.getPixelRatio(),toneMapping:'AgX',shadows};if(failures.length)console.error('Johansson Town stability checks failed',failures);else console.info('Johansson Town stability checks passed',window.__JOHANSSON_STABILITY__)}

started=true;controlsTouchedAt=performance.now();if(mobile){touchSticks.hint(true);stickHintUntil=performance.now()+4500;}$('#start').classList.add('hidden');$('#hud').classList.remove('hidden');window.__JOHANSSON_RUNNING__=true;camera.position.copy(player.position);camera.position.y+=seated?(parkSeat?.eyeY??1.16):1.7;camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);say(seated?'Sakura Konbini · Across the street. E to stand.':'Sakura Konbini · Step up to the entrance to meet Thuan.',5);runStabilityChecks();
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
 if(cameraControls.active||inspector?.active||activities.paused)return;
 if(e.code==='Escape'){toggleDir(false);return;}
 if(e.code==='KeyC'&&!e.repeat){openCamera();return;}
 if(!$('#directory').classList.contains('hidden')){if(e.code==='KeyQ')toggleDir(false);return;}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Home'].includes(e.code))e.preventDefault();keys[e.code]=true;
 if(!started)return;
 if(e.code==='Home'&&!e.repeat)centreCamera();
 if(e.code==='KeyE'&&!e.repeat)doInteract();if(e.code==='KeyR'&&!e.repeat)hands.drink();if(e.code==='KeyQ'&&!e.repeat)toggleDir(true);if(e.code==='KeyB'&&!e.repeat)activities.inventory();if(e.code==='KeyN'&&!e.repeat)$('#timeButton').click();
});document.addEventListener('keyup',e=>keys[e.code]=false);
function setRunning(value){touchRunning=value;$('#run').setAttribute('aria-pressed',String(value));$('#run').textContent=value?'RUNNING':'RUN';}
function toggleRunning(){if(!started||activities.paused||inspector?.active||seated)return;setRunning(!touchRunning);}
// Touch-down works while another finger holds the movement stick; a synthetic click may be suppressed.
$('#run').onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();pressedControls.add('run');toggleRunning();};
$('#run').onclick=e=>{if(e.detail===0)toggleRunning();};
$('#drink').onpointerdown=e=>{e.preventDefault();pressedControls.add('drink');hands.drink();};$('#act').onpointerdown=e=>{e.preventDefault();pressedControls.add('act');doInteract()};

canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();started=false;const d=$('#fatal');if(d){d.classList.remove('hidden');d.querySelector('p').textContent='Graphics paused safely. Reload Johansson Town to continue.'}});canvas.addEventListener('webglcontextrestored',()=>location.reload());function resizeRenderer(){const view=conversationViewport(innerWidth,innerHeight);renderer.setPixelRatio(renderDpr());renderer.setSize(view.width,view.height,false);canvas.style.width=view.width+'px';canvas.style.height=view.height+'px';camera.aspect=view.width/view.height;camera.updateProjectionMatrix()}
function setConversation(name,text=''){for(const p of world.people)if(p.g.userData.playerConversation){delete p.g.userData.playerConversation;delete p.g.userData.chatHold;delete p.g.userData.speakingUntil;}if(name){neighbourChats.cancel();chatBubble.hide();}
 if(name&&!conversationName)conversationCamera={rotation:camera.quaternion.clone(),playerVisible:player.visible};
 conversationName=name;resizeRenderer();
 if(name){
  const speaker=name==='Thuan'?storeClerk:world.people.find(p=>p.g.userData.name===name)?.g;
  if(speaker){speaker.userData.playerConversation=true;speaker.userData.chatHold=true;speaker.userData.speakingUntil=performance.now()+Math.min(6500,Math.max(1400,text.length*43));
   // The camera is not taken off you any more: she turns to face you instead, and the
   // line appears over her shoulder. See people/facing.js.
   conversationLine={speaker,name,text};}
  player.visible=false;
 }else{conversationLine=null;if(conversationCamera){player.visible=conversationCamera.playerVisible;conversationCamera=null;}}
}addEventListener('resize',resizeRenderer);window.visualViewport?.addEventListener('resize',resizeRenderer);function resetInput(){setRunning(false);Object.keys(keys).forEach(k=>keys[k]=false);touchSticks.reset();}addEventListener('blur',()=>{resetInput();gamepadInput.suspend();});document.addEventListener('visibilitychange',()=>{resetInput();gamepadInput.suspend();if(document.hidden){activities.save();hiddenAt=Date.now();}else{if(hiddenAt)advanceAbsentTown(elapsedTownAbsence(hiddenAt));hiddenAt=0;clock.getDelta();}});addEventListener('pagehide',()=>activities.save());

const mapCanvas=$('#minimap'),mapCtx=mapCanvas.getContext('2d');function drawMap(){drawTownMap(mapCtx,mapCanvas.width,mapCanvas.height,{sites:SITES,landmarks:world.landmarks,people:world.people,player:current?doors.get(current.id):player.position,yaw,visited:activities.state.visited,target:navigationTarget});updateWaypoint();}
function updateWaypoint(){
 const button=$('#waypoint');button.classList.toggle('hidden',!navigationTarget);if(!navigationTarget)return;
 const p=current?doors.get(current.id):player.position,d=doors.get(navigationTarget.id),distance=Math.hypot(d.x-p.x,d.z-p.z);
 const angle=Math.atan2(-(d.x-p.x),-(d.z-p.z))-yaw,index=((Math.round(angle/(Math.PI/4))%8)+8)%8,arrow=['↑','↖','←','↙','↓','↘','→','↗'][index];
 button.textContent=(current?'Outside · ':arrow+' ')+navigationTarget.title+' · '+(distance<3?'You’re here':Math.round(distance)+' m')+' ×';button.setAttribute('aria-label','Clear directions to '+navigationTarget.title);
}
$('#waypoint').onclick=()=>{navigationTarget=null;drawMap();};
let elapsed=0,mapTick=0,stepTick=0,accumulator=0,saveTick=0;
function advanceTown(dt,playerPaused){
    minutes+=dt;elapsed+=dt;activities.tick(dt);
    if(!catchingUp&&(saveTick+=dt)>=15){activities.save();saveTick=0;}if(!playerPaused){characters?.physics?.(dt,current?0:groundHeight(player.position.x,player.position.z));updatePlayer(dt);}
    evictIfClosed();
    if(current?.id==='izakaya')izakayaGuests.sync(minutes,dt);
    if(homeOwner(current))homeGuests.update(dt,minutes);
    venueService?.update(dt);ramenPlayerService?.update(dt);workplaceResidents.update(dt,minutes,weather);
    castAI?.update(dt,minutes,weather);sakuraShop.update(dt);ramenGuests.sync(minutes,dt);ramenMeals.update(dt);neighbourChats.update(dt,minutes,weather);
    if(!current&&!catchingUp){world.update(dt,elapsed,daylight(minutes),minutes);if(!activities.state.quickTravelNotified&&travelProgress(activities.state).unlocked)activities.save();world.beats?.update(dt,elapsed,minutes);}
}
function simulate(frameDt,playerPaused=false){
 accumulator+=Math.min(frameDt,MAX_FRAME_DT);
 while(accumulator>=SIM_STEP){advanceTown(SIM_STEP,playerPaused);accumulator-=SIM_STEP;}
}
function advanceAbsentTown(seconds){
 if(seconds<1)return;catchingUp=true;
 try{for(let remaining=seconds;remaining>0;){const dt=Math.min(.2,remaining);advanceTown(dt,true);remaining-=dt;}}
 finally{catchingUp=false;}
 activities.save();
}

function updateController(dt){
 let pads=[];try{if(!document.hidden)pads=navigator.getGamepads?.()||[];}catch{}
 controllerFrame=gamepadInput.sample(pads,cameraControls.settings.deadzone);const f=controllerFrame;
 if(controllerConnected!==f.connected){controllerConnected=f.connected;cameraControls.status(f.connected);if(f.connected)say('Controller connected · Left stick move · Right stick look · Menu opens town book',5);}
 if(!started||document.hidden)return;
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
  navigateControls(root,direction);
  if(f.pressed[0]){const items=focusableControls(root);if(items.includes(document.activeElement))document.activeElement.click();else items[0]?.focus();}return;
 }
 if(!controlsAllowed())return;
 if(f.pressed[9]||f.pressed[8]){toggleDir(true);return;}
 if(f.pressed[3]){activities.inventory();return;}
 if(f.pressed[11])centreCamera();
 if(f.pressed[0]){doInteract();return;}
 if(f.pressed[2])hands.drink();
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
 const blocked=cameraControls.active||roomLoading||activities.paused||inspector?.active||!$('#directory').classList.contains('hidden')||!$('#qte').classList.contains('hidden');
 const now=performance.now();
 if(!blocked&&(move2.lengthSq()>.02||Math.hypot(touchSticks.move.x,touchSticks.move.y)>.05)){controlsMovingUntil=now+1400;controlsTouchedAt=now;}
 // Hold the action button for a moment after its target is lost. Walking past scenery
 // otherwise blinks it in and out, and a tap can land where the button just was.
 if(!blocked&&active)controlsTargetUntil=now+450;
 const state=controlVisibility({playing:started,paused:blocked,seated,inside:!!current,moving:now<controlsMovingUntil,running:touchRunning,canDrink:!!hands?.canDrink,hasTarget:now<controlsTargetUntil,pressed:[...pressedControls]});
 for(const [id,visible] of Object.entries(state)){
  const element=$('#'+id);
  if(id==='mobile'){element.classList.toggle('hidden',!visible);continue;}
  element.classList.toggle('control-off',!visible);
 }
 if(stickHintUntil&&(now>stickHintUntil||touchSticks.moving)){touchSticks.hint(false);stickHintUntil=0;}
}
const invalidateDetails=()=>{townSections.invalidate();shopStreetView.invalidate();};
const detailStream=createDetailStream({onChange:invalidateDetails});window.__JOHANSSON_STREAMING__=detailStream.stats;
// Where the player is standing and what they are standing on. Read-only, and the same
// answer the simulation uses, so a screenshot can be tied to a place on the ground.
window.__JOHANSSON_POSE__={
 get x(){return player.position.x;},get y(){return player.position.y;},get z(){return player.position.z;},
 get yaw(){return yaw;},get pitch(){return pitch;},get inside(){return current?.id||null;},
 get ground(){return routeAt(player.position.x,player.position.z)?.id||null;},
 get bus(){const run=world.bus;return run?{phase:run.phase,z:+run.bus.position.z.toFixed(1),scale:+run.bus.scale.x.toFixed(3),visible:run.bus.visible}:null;},
 get doors(){return (world.shopDoors||[]).map(d=>+d.amount.toFixed(3));},
 /** The town clock, in minutes past midnight, so a routine can be watched against it. */
 get minutes(){return Math.round(minutes);},
 // Who is at the terminus and who has gone, so the boarding can be watched rather
 // than inferred from where somebody was standing a moment ago.
 get transit(){return world.people.filter(p=>['bus','away','station'].includes(p.g.userData.place))
  .map(p=>p.profile.name+':'+p.g.userData.place+(p.g.visible?'':' (gone)'));},
 get surface(){return routeAt(player.position.x,player.position.z)?.surface||null;},
};
for(const detail of world.details||[])detailStream.add(detail);
characters.streamDetails(detailStream,invalidateDetails,()=>player.position);
detailStream.add({id:'warehouse',priority:1,x:WAREHOUSE.x,z:WAREHOUSE.z,radius:38,load:()=>world.warehouse?.load()});
// The real shop behind the real window. It streams with the rest of the street rather
// than blocking the entry gate, and the stand-in shelves hold the window until it lands.
{
 const market=SITES.find(s=>s.id==='market'),front=market?.streetFrontage?.position;
 if(front)detailStream.add({id:'sakura-interior',priority:1,x:front[0],z:front[2],radius:40,
  load:async()=>{const ready=await sakuraShop.ready();return ready?showShopThroughWindow():false;}});
}
let detailsStarted=false;

function loop(){requestAnimationFrame(loop);izakayaTV?.update({camera,active:current?.id==='izakaya',paused:!started||document.hidden||roomLoading||!!inspector?.active||!!activities?.paused});if(detailsStarted&&!document.hidden)detailStream.update(current?doors.get(current.id)||player.position:player.position,current?null:{x:-Math.sin(yaw),z:-Math.cos(yaw)});updateContextControls();const frameDt=Math.min(clock.getDelta(),MAX_FRAME_DT);sweepCel(frameDt);updateController(frameDt);if(current?.id==='form3d')activeRoomLayout?.workshop?.update(activities.state,activities.paused?0:frameDt);if(started&&!document.hidden){const paused=cameraControls.active||roomLoading||inspector?.active||activities.paused||!$('#directory').classList.contains('hidden');const before=player.position.clone();simulate(frameDt,!!paused);if(!paused){if(player.position.distanceTo(before)>.01&&(stepTick+=frameDt)>.42){activities.footstep(current?'wood':routeAt(player.position.x,player.position.z)?.surface||'stone');stepTick=0;}interaction();}else{neighbourChats.cancel();chatBubble.hide();resetInput();$('#prompt').classList.remove('on');}townAudio.update({player:player.position,yaw,minutes,rain:weather,inside:!!current,station:activities.state.radioStation||0,paused});$('#clock').textContent=fmt(minutes);setTime();hands?.update(paused?0:frameDt);if(!inspector?.active){characters?.update(frameDt);castAI?.pose(frameDt);if(!paused)facing.update(frameDt);}if(!paused)chatBubble.render(conversationChat()||neighbourChats.current||residentSpeech());if((mapTick+=frameDt)>.15){drawMap();mapTick=0;}if(subtitleTimer>0&&(subtitleTimer-=frameDt)<=0)$('#subtitle').classList.remove('on');if(inspector?.active)present(()=>inspector.render(frameDt),inspector.camera);else if(current?.id==='market')present(()=>shopStreetView.render({renderer,scene,camera,town,room,frontage:current.streetFrontage?{...current.streetFrontage,interiorZ:sakuraShop.layout.frontZ}:null}));else if(!current)renderOutdoor();else present(()=>renderer.render(scene,camera))}else{neighbourChats.cancel();chatBubble.hide();}}renderOutdoor();loop();

function renderOutdoor(){
  present(()=>townSections.render({renderer,scene,camera,town,position:player.position}));
  if(window.__JOHANSSON_STARTUP__&&!window.__JOHANSSON_STARTUP__.firstFrameMs){window.__JOHANSSON_STARTUP__.firstFrameMs=performance.now()-window.__JOHANSSON_STARTUP__.startedAt;window.__JOHANSSON_STARTUP__.stage='playing';}
}
advanceAbsentTown(activities.takeAbsence());
// Allow the opening frame to paint before starting any district downloads.
setTimeout(()=>{detailsStarted=true;void preloadCharacter('Thuan');},0);

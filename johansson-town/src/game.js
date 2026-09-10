import {createStoreService} from './people/store-service.js';
import {STORE_SEATS} from './world/interiors/store-layout.js';
import {createShopStreetView} from './render/shop-street-view.js?konbini-1';
import {createNeighbourChats,createChatBubble,clearChatLine} from './people/neighbour-chats.js?konbini-1';
import {createIndoorResidents} from './people/indoor-residents.js?konbini-1';
import {buildSuppliedRoom,suppliedRoomBoundsBlocked,preloadSuppliedRooms,suppliedRoomReady,isSuppliedRoom} from './world/supplied-rooms.js';
import {FULL_TOWN} from './world/full-town-state.js';
import {travelProgress} from './progression/travel.js';
import {buildIzakayaRoom} from './world/izakaya.js';
import {createIzakayaGuests} from './people/izakaya-guests.js';
import {controlVisibility} from './interact/control-visibility.js';
import {createTownSky} from './render/sky.js';
import {conversationViewport} from './conversation-layout.js';
import {shelfAimScore} from './interact/aim.js';
import {atmosphere} from './render/atmosphere.js?town-light-1';
import {buildConvenienceStore,buildStoreShell} from './world/interiors/convenience.js?konbini-1';
import {loadTownEnvironment} from './render/environment.js';
import {createHands} from './interact/hands.js?ui=compact-2';
import {townAudio} from './audio/town-audio.js';
import {routeAt,groundHeight} from './world/layout.js';
import {drawTownMap} from './world/map.js';
import * as THREE from '../vendor/three.module.js';
import { createTown } from './world/town.js';
import { createActivities } from '../activities.js?konbini-1';
import { createInspector } from '../inspect-3d.js';
import { createContentItems } from '../content-items.js';
import { createCastAI } from './people/schedules.js';
import { createCharacters } from './people/characters.js?konbini-1';
import { circleHitsRect,circleHitsCircle,roomBoundsBlocked,townBoundsBlocked } from '../physics.js';

const $=s=>document.querySelector(s);
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const mobile=isIOS||touch,tabletLike=touch&&Math.min(innerWidth,innerHeight)>=700,highTier=!mobile||tabletLike,shadows=highTier,canvas=$('#game');
const renderDpr=()=>Math.min(window.devicePixelRatio||1,mobile?(tabletLike?1.45:1.2):2);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false,stencil:false,preserveDrawingBuffer:false});
renderer.setPixelRatio(renderDpr());renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=.96;renderer.shadowMap.enabled=shadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8dce9);scene.fog=null;const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.07,220);
const bands=new Uint8Array([48,48,48,255,115,115,115,255,184,184,184,255,255,255,255,255]),gradient=new THREE.DataTexture(bands,4,1,THREE.RGBAFormat);gradient.needsUpdate=true;gradient.magFilter=THREE.NearestFilter;gradient.minFilter=THREE.NearestFilter;
const outlineMat=new THREE.MeshBasicMaterial({color:0x252821,side:THREE.BackSide}),boxCache=new Map();
const toon=(c,map=null)=>new THREE.MeshStandardMaterial({color:c,map,roughness:.82});
const boxGeo=s=>{const k=s.join(',');if(!boxCache.has(k))boxCache.set(k,new THREE.BoxGeometry(...s));return boxCache.get(k)};
function box(size,pos,color,parent,outline=true){const g=boxGeo(size),m=new THREE.Mesh(g,toon(color));m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);if(false&&outline){const o=new THREE.Mesh(g,outlineMat);o.position.copy(m.position);o.rotation.copy(m.rotation);o.scale.set(1.018,1.018,1.018);parent.add(o)}return m}
function mesh(geo,pos,color,parent,outline=true){const m=new THREE.Mesh(geo,toon(color));m.position.set(...pos);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);if(false&&outline){const o=new THREE.Mesh(geo,outlineMat);o.position.copy(m.position);o.scale.set(1.022,1.022,1.022);parent.add(o)}return m}
function signTex(a,b,accent='#9b4035'){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle='#efe3c7';x.fillRect(0,0,512,128);x.fillStyle=accent;x.fillRect(0,0,14,128);x.strokeStyle='#252821';x.lineWidth=5;x.strokeRect(5,5,502,118);x.fillStyle='#252821';x.textAlign='center';x.textBaseline='middle';x.font='700 43px Yu Gothic,system-ui';x.fillText(a,256,50);x.font='800 15px system-ui';x.fillText(b.toUpperCase(),256,99);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}

const shopStreetView=createShopStreetView();window.__JOHANSSON_SHOP_VIEW__=shopStreetView.stats;
const town=new THREE.Group(),room=new THREE.Group();scene.add(town,room);room.visible=false;
loadTownEnvironment(scene,renderer);
const townSky=createTownSky(scene);
const ambient=new THREE.HemisphereLight(0xdde9ec,0x695c4d,1.35);scene.add(ambient);
const sun=new THREE.DirectionalLight(0xffd39a,highTier?3.8:3.2);sun.position.set(-28,38,18);sun.castShadow=shadows;
if(shadows){sun.shadow.mapSize.set(tabletLike?1024:2048,tabletLike?1024:2048);sun.shadow.camera.left=-26;sun.shadow.camera.right=26;sun.shadow.camera.top=26;sun.shadow.camera.bottom=-26;sun.shadow.camera.near=.5;sun.shadow.camera.far=120;sun.shadow.bias=-.00035;sun.shadow.normalBias=.045}scene.add(sun);

const SITES=[
  {id:'office',title:'Johansson Marine Office',jp:'事務所',sub:'MARINE ENGINEERING',side:-1,z:38,color:0x62776e,accent:'#49675d',line:'Charts, travel notes and engineering papers.'},
  {id:'frontrow',title:'Front-Row Books',jp:'前列書房',sub:'THE FRONT-ROW SEAT',side:1,z:30,color:0x735849,accent:'#8b3f36',line:'Aiko closes the bookshop at 18:30.'},
  {id:'form3d',title:'Kenji’s Workshop',jp:'立体工房',sub:'PATTERN SHOP',side:-1,z:18,color:0x566b73,accent:'#385f6e',line:'Small parts, prototypes and fabrication work.'},
  {id:'stepwise',title:'StepWise Instruments',jp:'計算器店',sub:'MEASUREMENT & REPAIR',side:1,z:8,color:0x6b6753,accent:'#6c633d',line:'Measuring tools and calculation instruments.'},
  {id:'journal',title:'Harbour Evening Press',jp:'日報印刷所',sub:'JOURNAL',side:-1,z:-4,color:0x78615c,accent:'#8f433d',line:'Fresh copy stacked beside the press.'},
  {id:'electronics',title:'Johansson Electronics',jp:'電子工作所',sub:'RADIOS & CIRCUITS',side:1,z:-16,color:0x565f68,accent:'#3f515e',line:'Computers, circuits and unfinished experiments.'},
  {id:'market',title:'Sakura Shōten',jp:'桜商店',sub:'DAILY GOODS',side:-1,z:-28,color:0x9d7c7e,accent:'#a76680',line:'Yuri’s convenience store · tea, snacks and everyday things.'},
  {id:'career',title:'Harbour Records',jp:'港務所',sub:'TIDES & SHIPPING',side:1,z:-39,color:0x586c68,accent:'#3f615d',line:'Records from ships, commissioning and field service.'}
];

const interactables=[],roomColliders=[],doors=new Map();
let inspector=null,content=null,castAI=null,hands=null,storeService=null,seated=false,parkSeat=null,touchRunning=false;
let conversationName=null,conversationCamera=null,navigationTarget=null;
let activeRoomLayout=null;
let current=null,active=null,started=false,yaw=0,pitch=-.05,minutes=1002,subtitleTimer=0,weather=false,activities=null,timePreset=0,characters=null;
const keys={},clock=new THREE.Clock(),moveTouch={id:null,cx:0,cy:0,x:0,y:0},lookTouch={id:null,x:0,y:0};
const PLAYER_RADIUS=.28,NPC_RADIUS=.35,MAX_FRAME_DT=.1,SIM_STEP=1/60;
const move2=new THREE.Vector2(),fwVec=new THREE.Vector3(),rtVec=new THREE.Vector3(),moveVec=new THREE.Vector3(),turnQ=new THREE.Quaternion(),yAxis=new THREE.Vector3(0,1,0);

const player=new THREE.Group();scene.add(player);player.position.set(0,0,46);
player.visible=false;

const reg=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};if(!interactables.includes(o))interactables.push(o)};
function say(t,sec=3){const e=$('#subtitle');e.textContent=t;e.classList.add('on');subtitleTimer=sec}

const world=createTown({scene:town,sites:SITES,mobile,shadows,maxAnisotropy:renderer.capabilities.getMaxAnisotropy(),register:reg,enter:enterRoom,getPlayerPosition:()=>player.position,onAction:(...args)=>{if(args[0]==='resident'){const person=world.people.find(p=>p.g.userData.name===args[1]);if(person){person.g.userData.facePlayerUntil=performance.now()+1600;if(!Number.isFinite(person.g.userData.seatHeight)){person.g.lookAt(player.position.x,person.g.position.y,player.position.z);person.g.rotateY(Math.PI);characters?.gesture(person.g);}}}if(args[1]==='Convex traffic mirror')world.beats?.mirror();activities.action(...args);}});
SITES.forEach(s=>doors.set(s.id,new THREE.Vector3(...(s.door||[s.side*4,0,s.z+2.5]))));
if(world.spawn)player.position.set(...world.spawn);
activities=createActivities({say,getTableService:()=>current?.id==='market'&&parkSeat?.storeSeatId?storeService:null,onStand:standUp,onConversation:setConversation,getMinutes:()=>minutes,getSocialContext:()=>({inside:current?.id,names:current?.id==='izakaya'?izakayaGuests.sync(minutes):current?.id==='ramen'?ramenGuests.sync(minutes):[]}),onMap:()=>{const c=document.createElement("canvas");c.width=680;c.height=640;c.style.width="100%";c.style.height="auto";c.style.position="static";c.setAttribute("aria-label","Folded visitor map, Johansson Town, 1988");drawTownMap(c.getContext("2d"),c.width,c.height,{sites:SITES,people:world.people,player:current?doors.get(current.id):player.position,yaw,visited:activities.state.visited});return c;},onPhone:()=>{const p=world.people.find(p=>p.g.userData.name==='Harbour master');if(p&&(FULL_TOWN.active||p.g.position.z<-63)){characters.gesture(p.g);activities.close();say('The harbour master waves from the pier.',4);return true;}return false;},onPurchase:name=>{const p=new THREE.Vector3();active?.object?.getWorldPosition(p);hands.offer(name,p);return true;},onSeat:name=>{const selected=active?.object?.userData.seat;if(selected?.storeSeatId&&(storeService?.occupied(selected.storeSeatId)||world.people.some(p=>p.g.userData.inMarket&&p.g.userData.storeSeatId===selected.storeSeatId))){say('That chair is occupied.',3);return true;}activities.close();const ax=player.position.x,az=player.position.z,ay=player.position.y,seat=active?.object?.userData.seat,approachClear=!environmentBlocked(ax,az)&&!occupiedByPerson(ax,az);const sit=seat?.position||[ax,ay,az];const stand=approachClear?[ax,ay,az]:seat?.stand||(()=>{const p=findClear(ax,az);return [p[0],ay,p[1]];})();parkSeat={storeSeatId:seat?.storeSeatId,position:sit,stand,eyeY:seat?.eyeY??1.15,yaw:Number.isFinite(seat?.yaw)?seat.yaw:yaw,pitch:Number.isFinite(seat?.pitch)?seat.pitch:pitch};player.position.set(...parkSeat.position);if(Number.isFinite(parkSeat.yaw))yaw=parkSeat.yaw;if(Number.isFinite(parkSeat.pitch))pitch=parkSeat.pitch;seated=true;resetInput();say(parkSeat.storeSeatId?'Sakura table · E or tap to order, eat or stand':name+' · E to stand',5);return true;},onDrink:name=>{activities.close();if(hands.held===name)hands.drink();else hands.offer(name,player.position,true);return true;},onEscort:()=>{activities.state.kenjiEscort='walking';activities.save();},onWeather:value=>{weather=value;world.setRain(value);},onTime:value=>{if(value&&typeof value==='object'){minutes=value.restore;return;}if(value==='cycle'){timePreset=(timePreset+1)%4;minutes=[1002,1110,1230,540][timePreset];}else minutes+=value;evictIfClosed();}});
syncView();
hands=createHands({scene,camera,say,consume:name=>{const i=activities.state.inventory.indexOf(name);if(i<0)return false;activities.state.inventory.splice(i,1);activities.state.inventory.push('Empty can');activities.save();return true;}});
characters=createCharacters({mobile,shadows,canJump:()=>!seated,isBlocked:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c)),onError:(name,error)=>console.warn('Character construction failed:',name,error)});characters.attach(player,'player',1.82);world.people.forEach(p=>characters.attach(p.g,p.g.userData.name,p.profile?.height));

inspector=createInspector({scene,camera,renderer,canvas,resetInput,onReturn:item=>{const o=content?.objects.get(item.id);if(o)o.visible=true;},onInspect:item=>{const o=content?.objects.get(item.id);if(o)o.visible=false;activities.inspectItem(item);if(item.id==='model')say(item.note,4);},onLink:()=>{},onContact:()=>{}});
content=createContentItems({placements:world.contentPositions,group:world.group,colliders:world.colliders,register:reg,onInspect:item=>inspector.open(item),onRead:()=>activities.quietRead()});
castAI=createCastAI({world,player,getObserverPosition:()=>current?doors.get(current.id):player.position,state:()=>activities.state,paused:()=>activities.paused||inspector.active,collides:(x,z,r)=>townBoundsBlocked(x,z,r)||world.colliders.some(c=>circleHitsRect(x,z,r,c))});
const chatBlocked=(a,b)=>!clearChatLine(a,b,current?roomColliders:world.colliders);
const neighbourChats=createNeighbourChats({world,observer:()=>player.position,blocked:chatBlocked,state:()=>activities.state});
const chatBubble=createChatBubble({camera,canvas,target:g=>characters.conversationTarget(g),blocked:chatBlocked});
function roomHit(object,label,kind,title,text){reg(object,label,()=>activities.action(kind,title,text),true);return object;}
function roomCollider(x,z,w,d,height=2.8,minY=0){roomColliders.push({x,z,w,d,height,minY});}
function furnitureBox(size,pos,color,label,title,text,kind='inspect',collide=true){const m=box(size,pos,color,room);if(collide)roomCollider(pos[0],pos[2],size[0]+.08,size[2]+.08,pos[1]+size[1]/2,Math.max(0,pos[1]-size[1]/2));return roomHit(m,label,kind,title,text);}
function wallPanel(text,sub,pos,w=2.6,h=.82,accent='#6f5545'){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTex(text,sub,accent)}));p.position.set(...pos);room.add(p);return p;}
function addChair(x,z,title='Chair',text='A sturdy chair polished smooth by years of use.'){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([.7,.12,.68],[0,.62,0],0x4f5d58,g);box([.7,.72,.10],[0,1,.29],0x4f5d58,g);for(const dx of [-.25,.25])for(const dz of [-.25,.25])box([.09,.62,.09],[dx,.31,dz],0x3f4744,g,false);roomCollider(x,z,.78,.78,1.36);g.userData.seat={position:[x,0,z],stand:[x,0,z+.95],eyeY:1.15,yaw:0,pitch:0};roomHit(g,'Sit down','seat',title,text);return g;}
function addDesk(x,z,title='Desk',text='A practical wooden desk with carefully arranged paperwork.'){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([2.2,.18,1],[0,.82,0],0x765b43,g);for(const dx of [-.88,.88])for(const dz of [-.35,.35])box([.16,.72,.16],[dx,.36,dz],0x4b4036,g,false);roomCollider(x,z,2.3,1.08,.91);roomHit(g,'Inspect desk','inspect',title,text);return g;}
function addShelf(x,z,title,text,books=true){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([1.7,2.55,.45],[0,1.28,0],0x5a4636,g);for(let y=.42;y<2.3;y+=.48){box([1.48,.08,.52],[0,y,0],0x8a694c,g,false);if(books)for(let n=0;n<7;n++)box([.13,.3+(n%2)*.06,.22],[-.58+n*.19,y+.19,.25],[0x975544,0x486975,0xb2a57e,0x677c62][n%4],g,false);}roomCollider(x,z,1.8,.62);roomHit(g,'Browse shelves','inspect',title,text);return g;}
function addCabinet(x,z,title,text,color=0x53615f){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([1.1,2.15,.55],[0,1.08,0],color,g);for(let y=.38;y<1.9;y+=.38){box([.86,.29,.035],[0,y,-.292],0x7b8178,g,false);box([.12,.025,.025],[0,y,-.318],0x2c3434,g,false);}roomCollider(x,z,1.2,.65);roomHit(g,'Open cabinet','inspect',title,text);return g;}
function addScreen(x,z,title,text){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([.95,.7,.65],[0,1.48,.28],0x303a39,g);box([.62,.42,.03],[0,1.48,-.055],0x6e8b83,g,false);box([.12,.38,.12],[0,1.08,0],0x303a39,g,false);roomHit(g,'Use terminal','machine',title,text);return g;}
function addMachine(x,z,w,d,h,color,title,text){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([w,h,d],[0,h/2,0],color,g);box([w*.66,.24,.06],[0,h*.72,-d/2-.035],0x253b3e,g,false);for(let i=-1;i<=1;i++)box([.09,.09,.04],[i*w*.18,h*.43,-d/2-.055],[0xb45d46,0xd0aa55,0x5f8b72][i+1],g,false);roomCollider(x,z,w+.12,d+.12);roomHit(g,'Operate '+title,'machine',title,text);return g;}
function addCounter(x,z,w,title,text){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([w,.9,.72],[0,.45,0],0x795d43,g);box([w+.12,.08,.82],[0,.94,0],0x9a7654,g,false);roomCollider(x,z,w+.1,.82);roomHit(g,'Inspect counter','inspect',title,text);return g;}
function addCrates(x,z,title='Delivery crates',text='Wooden crates are stacked with their labels facing the aisle.'){const g=new THREE.Group();g.position.set(x,0,z);room.add(g);box([1,.72,1],[0,.36,0],0x9a764e,g);box([.85,.58,.85],[.8,.29,.55],0x806447,g);roomCollider(x+.3,z+.2,1.8,1.5);roomHit(g,'Inspect crates','inspect',title,text);return g;}
function addLamp(x,z){const stem=box([.08,1.45,.08],[x,.73,z],0x4b4f4a,room,false);const shade=mesh(new THREE.CylinderGeometry(.28,.42,.28,12),[x,1.55,z],0xb99a69,room,false);shade.rotation.x=Math.PI;roomHit(stem,'Switch lamp','inspect','Desk lamp','A compact late-1980s lamp with a warm tungsten bulb.');}

const izakayaGuests=createIzakayaGuests({world,parent:scene,getYuri:()=>{const g=ensureYuri();if(!interactables.includes(g))reg(g,'Catch up with Yuri',()=>activities.action('resident','Yuri'),true);return g;}});
const ramenGuests=createIndoorResidents({world,parent:scene,place:'ramen',getState:()=>activities.state}),marketClerk=createIndoorResidents({world,parent:scene,place:'market',getState:()=>activities.state,getPlayerSeat:()=>parkSeat?.storeSeatId}),homeGuests=createIndoorResidents({world,parent:scene,place:'home'});
let storeClerk=world.people.find(p=>p.profile.name==='Yuri').g,storeWelcomed=false;
function ensureYuri(){return storeClerk;}
function addRoomProps(s){
  if(activeRoomLayout){
    if(s.id==='ramen')ramenGuests.sync(minutes);
    if(s.id==='yuri-home'){homeGuests.sync(minutes);if(storeClerk&&!interactables.includes(storeClerk))reg(storeClerk,'Talk to Yuri',()=>activities.action('resident','Yuri'),true);}
    return;
  }
  if(s.id==='izakaya'){buildIzakayaRoom({room,box,reg,collider:roomCollider,action:activities.action,exit:leaveRoom,signTexture:signTex});izakayaGuests.sync(minutes);const light=new THREE.HemisphereLight(0xffdfaa,0x886d5f,1.6);room.add(light);return;}
  if(s.id==='market'){shopStreetView.invalidate();storeWelcomed=false;marketClerk.sync(minutes);buildConvenienceStore({room,box,reg,collider:roomCollider,action:activities.action,signTexture:signTex,clerk:storeClerk});storeService=createStoreService({clerk:storeClerk,room,getSeat:()=>STORE_SEATS.find(s=>s.id===parkSeat?.storeSeatId),getMinutes:()=>minutes,getBalance:()=>activities.state.yen,pay:activities.spend,say,isBlocked:(x,z)=>Math.hypot(player.position.x-x,player.position.z-z)<.55});return;}
  const warm=new THREE.PointLight(0xffcf91,highTier?2.0:1.35,14,2);warm.position.set(0,3.45,-.5);warm.castShadow=false;room.add(warm);
  box([12.4,.12,12.4],[0,4.25,0],s.id==='market'?0xf2eedf:0x6f7168,room,false);box([12.1,.035,12.1],[0,.04,0],s.id==='market'?0xe0ded2:0x706b5e,room,false);for(const x of [-5.7,5.7])box([.08,3.7,12],[x,2.1,0],0x4b4339,room,false);

  if(s.id==='tea-house'){
    wallPanel('一服どうぞ','TAKE YOUR TIME',[2.8,2.8,-6.25],3.1,.85,s.accent);
    addCounter(-2.5,-3.6,4.5,'Tea counter','Roasted hojicha, a pot of sencha and a handwritten recipe for dorayaki.');
    addShelf(-4.7,-1.9,'Tea tins','Green tins hold sencha; the brown tin smells gently of roasted leaves.');
    for(const [x,z] of [[-2.8,1.1],[2.9,-1.5]]){
      furnitureBox([1.7,.12,1.5],[x,.72,z],0xa78059,'Pause over tea','A quiet table','The cups are warm. Beyond the curtains, footsteps pass along the lane.','inspect');roomCollider(x,z,1.8,1.6);
      for(const dx of [-1.3,1.3])addChair(x+dx,z,'Tea house chair','A cushioned seat beside the little tea table.');
      for(const dx of [-.45,.45]){box([.2,.18,.2],[x+dx,.88,z],0xe7eedc,room,false);box([.32,.025,.32],[x+dx,.795,z],0x719987,room,false);}
      box([.42,.035,.42],[x,.81,z+.38],0xeee0b7,room,false);
    }
    addCabinet(4.6,-4.3,'Cupboard of cups','No two cups quite match. The chipped blue one is the owner’s favourite.');
    addLamp(2.8,-3.2);return;
  }
  if(s.id==='ramen'){
    wallPanel('中華そば 佐藤','RAMEN · ¥300',[0,2.65,-6.25],4,.8,s.accent);
    addCounter(0,-1.8,7.5,'Ramen counter','Worn lacquer, a tin of chopsticks and a small bottle of pepper.');
    for(const x of [-2.7,-.9,.9,2.7])addChair(x,-.35,'Counter stool','A low stool facing the steaming broth kettle.');
    addMachine(-3.5,-4.3,1.6,1,1.6,0x747968,'Broth kettle','The simmering broth has been tended since morning.');
    furnitureBox([.7,.5,.3],[3.4,1.1,-1.8],0x594b35,'Tune ramen radio','Ramen radio','JOJO 89.4. The dial has been repaired with a paper marker.','radio',false);
    const order=new THREE.Object3D();order.position.set(0,1,-.9);room.add(order);reg(order,'Order ramen · ¥300',()=>activities.action('ramen'),true);
    addCabinet(4.6,-3.8,'Bowl cupboard','Blue-rimmed bowls and small saucers dry behind the sliding door.');return;
  }
  if(s.id==='office'){
    wallPanel('世界地図','FIELD SERVICE ROUTES',[-3.3,2.65,-6.25],3.3,1.05,s.accent);addDesk(-2.55,-1.65,'Field-service desk','Route sheets, calibration certificates and handwritten travel notes are spread across the desk.');addScreen(-2.55,-1.7,'Office computer','A beige workstation holds service records and travel planning files.');addChair(-.55,-1.55,'Visitor chair','A plain visitor chair facing the engineering desk.');addCabinet(3.35,-2.35,'Drawing cabinet','Folders contain electrical drawings, calibration sheets and old ship-engine notes.');furnitureBox([1.1,.72,.55],[3.3,.36,.2],0x8a6b4f,'Use typewriter','Typewriter','The keys are slightly stiff. A half-written service report waits in the carriage.','machine');addLamp(-3.3,-.5);
  } else if(s.id==='frontrow'){
    wallPanel('海洋書','MARITIME · HISTORY',[2.8,2.75,-6.25],3.2,.9,s.accent);addShelf(-4.15,-2.7,'Maritime shelf','Voyages, harbour histories and worn biographies fill the shelves.');addShelf(-4.15,.25,'Wapping shelf','Books on London docks, sailors and the Thames sit beside a few annotated manuscripts.');addChair(2.3,-1.55,'Reading chair','A deep chair positioned under the warmest lamp in the bookshop.');furnitureBox([1.35,.12,1.35],[2.3,.58,.1],0x6b533d,'Browse display table','New arrivals','A display of maritime history, Japanese travel books and a copy of The Front-Row Seat.');roomCollider(2.3,.1,1.45,1.45);addCounter(2.9,2.65,2.4,'Bookshop counter','A ledger, pencil cup and small brass bell sit beside the till.');addLamp(1.45,-1.2);
  } else if(s.id==='form3d'){
    wallPanel('立体工房','PROTOTYPE BAY',[2.8,2.75,-6.25],3.1,.9,s.accent);addDesk(-2.8,-1.8,'CAD workbench','Sketches, calipers and dimensioned prototype drawings cover the bench.');addScreen(-2.8,-1.85,'CAD terminal','The monochrome display shows a simple mechanical enclosure model.');addMachine(2.65,-2.25,1.55,1.25,1.55,0x54666b,'Prototype mill','The guarded machine can run a short demonstration cycle.');addCrates(3.35,.5,'Material bins','ABS, aluminium blanks and sample hardware are sorted into labelled bins.');addCabinet(-4.25,1.5,'Tool cabinet','Drills, cutters, gauges and hand tools are arranged by size.');
  } else if(s.id==='stepwise'){
    wallPanel('計測器','MEASUREMENT DESK',[2.7,2.75,-6.25],3.0,.9,s.accent);addCounter(-2.9,-1.55,2.6,'Instrument counter','Micrometers, gauges and reference blocks are laid out on felt.');addMachine(2.65,-1.8,1.45,1.05,1.25,0x4e5b5d,'Bench calibrator','A reference instrument cycles through zero, span and verification checks.');furnitureBox([1.25,.55,.72],[-3.1,.28,1.2],0x59695f,'Try calculator','Desktop calculator','A heavy desktop calculator with bright segmented digits and satisfyingly firm keys.','machine');addCabinet(3.7,1.25,'Reference standards','Cases of certified reference pieces are locked behind glass.');addChair(-.8,-1.45,'Customer chair','A chair beside the instrument counter for reviewing measurements.');
  } else if(s.id==='journal'){
    wallPanel('日報','PRINT ROOM',[2.7,2.75,-6.25],2.8,.9,s.accent);addMachine(2.55,-1.8,1.8,1.35,1.45,0x5a615d,'Printing press','The press smells of ink and warm paper. Its rollers turn slowly during the demonstration.');addDesk(-2.8,-1.9,'Editor desk','Marked proofs, wax pencils and clipped local stories cover the editor’s desk.');furnitureBox([1.45,.75,.95],[-3.3,.38,1.15],0xd4cab0,'Inspect paper stack','Fresh newspapers','Bundles of freshly printed sheets are tied with string for delivery around town.');roomCollider(-3.3,1.15,1.55,1.05);addCabinet(3.65,1.4,'Type cabinet','Metal drawers contain headline type, stamps and printing tools.');
  } else if(s.id==='electronics'){
    wallPanel('電子工作所','TEST BENCH',[2.7,2.75,-6.25],3.0,.9,s.accent);addDesk(-2.8,-1.85,'Electronics bench','Solder, test leads, small circuit boards and handwritten schematics cover the bench.');addScreen(-2.8,-1.9,'Development terminal','A green-on-black terminal is connected to a compact development board.');addMachine(2.55,-1.85,1.45,1.05,1.15,0x43575d,'Oscilloscope','The trace settles into a clean repeating waveform after a short test.');addCabinet(3.65,1.25,'Parts drawers','Resistors, capacitors, connectors and spare ICs are sorted into dozens of small drawers.');furnitureBox([1.0,.52,.55],[-3.7,.26,1.25],0x6e5843,'Tune workshop radio','Workshop radio','A small radio carries weather, baseball scores and harbour traffic reports.','machine');
  } else if(s.id==='career'){
    wallPanel('潮汐表','TIDES · 14 SEPTEMBER',[2.7,2.75,-6.25],3.0,.9,s.accent);addDesk(-2.7,-1.8,'Harbour log desk','The tide chart, berth allocation sheet and morning weather bulletin lie beneath a brass paperweight.');addScreen(-2.7,-1.85,'Harbour radio console','A green lamp marks channel 16. The microphone is returned to its hook after each call.');addCabinet(3.45,-2.3,'Ice ledger','The cold store supplied twenty blocks before dawn. Each boat’s order is written in blue pencil.');addCabinet(3.45,.45,'Berth records','Tonnage, draught and departure times, filed by vessel name. Yesterday’s entries have been checked twice.');addChair(-.55,-1.55,'Skipper’s chair','A canvas cushion softens the chair where captains wait for their clearance.');

  }
}

function clearRoom(){storeService?.dispose();storeService=null;neighbourChats.cancel();chatBubble.hide();activeRoomLayout=null;izakayaGuests.restore();ramenGuests.restore();marketClerk.restore();homeGuests.restore();roomColliders.length=0;const materials=new Set(),geos=new Set();room.traverse(o=>{for(let p=o;p&&p!==room;p=p.parent)if(p.userData.sharedAsset)return;if(o.isMesh){const list=Array.isArray(o.material)?o.material:[o.material];if(!o.userData.preserveMaterial)list.forEach(m=>m&&materials.add(m));if(![...boxCache.values()].includes(o.geometry))geos.add(o.geometry);}});materials.forEach(m=>{m.map?.dispose?.();m.dispose?.();});geos.forEach(g=>g.dispose?.());while(room.children.length)room.remove(room.children[0]);for(let i=interactables.length-1;i>=0;i--)if(interactables[i].userData?.hit?.inside)interactables.splice(i,1);}
function roomShell(s){clearRoom();town.visible=false;room.visible=true;activeRoomLayout=buildSuppliedRoom({site:s,room,reg,collider:roomCollider,action:activities.action,exit:leaveRoom});if(activeRoomLayout)return;if(s.id==='izakaya')return;if(s.id==='market'){buildStoreShell({room,box,reg,exit:leaveRoom});return;}box([13,.18,13],[0,-.08,0],0x9e957f,room,false);box([13,4.4,.24],[0,2.2,-6.45],s.color,room);box([.24,4.4,13],[-6.45,2.2,0],s.color,room);box([.24,4.4,13],[6.45,2.2,0],s.color,room);box([5,4.4,.24],[-4,2.2,6.45],s.color,room);box([5,4.4,.24],[4,2.2,6.45],s.color,room);box([3,1.4,.24],[0,3.7,6.45],s.color,room);const back=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.35),new THREE.MeshStandardMaterial({map:signTex(s.jp,s.title,s.accent),roughness:.85}));back.position.set(0,3.35,-6.28);room.add(back);const notice=new THREE.Mesh(new THREE.PlaneGeometry(3.7,1.7),new THREE.MeshStandardMaterial({map:signTex(s.title,s.line,s.accent),roughness:.85}));notice.position.set(-3.2,1.9,-6.27);room.add(notice);reg(notice,'Read wall notice',()=>activities.action('inspect',`${s.title} notice`,s.line),true);const terminal=box([2.3,2.55,.18],[.4,1.28,-5.95],0x2e3b3a,room);roomColliders.push({x:.4,z:-5.95,w:2.4,d:.32});reg(terminal,'Read the ledger',()=>activities.action('read',s.title+' ledger',s.line+'\n14 September 1988. Evening deliveries are written in blue pencil.'),true);const terminalLabel=new THREE.Mesh(new THREE.PlaneGeometry(1.95,.65),new THREE.MeshBasicMaterial({map:signTex('記録','DAILY LEDGER',s.accent)}));terminalLabel.position.set(.4,1.7,-5.83);room.add(terminalLabel);const exit=new THREE.Mesh(new THREE.PlaneGeometry(2.45,2.7),toon(0x8c684d));exit.position.set(0,1.35,6.31);exit.rotation.y=Math.PI;room.add(exit);reg(exit,'Exit to street',leaveRoom,true);}
let roomLoading=false;
async function enterRoom(s){
 if(roomLoading)return;
 if(world.isOpen&&!world.isOpen(s,minutes)){say('準備中 · Closed. Opens at '+(s.opens||'09:00')+'.',4);return;}
 if(isSuppliedRoom(s.id)&&!suppliedRoomReady(s.id)){
  roomLoading=true;resetInput();say('Opening '+s.title+'…',20);
  let ready=false;
  try{[ready]=await preloadSuppliedRooms([s.id]);}finally{roomLoading=false;}
  if(!ready){say('Could not open '+s.title+'. Please try the door again.',5);return;}
 }
 parkSeat=null;seated=false;activities.close();activities.visit(s.id);current=s;roomShell(s);addRoomProps(s);room.traverse(o=>{if(!o.isMesh||o.userData.sharedAsset)return;const b=o.geometry?.parameters;if(b?.height<.25&&o.position.y>3.8||o.position.z>6&&o.position.y>1||o.position.x>6&&o.position.y>1){o.userData.cutaway=true;o.layers.set(0);}});player.position.set(...(activeRoomLayout?.spawn||[0,0,4.3]));unstuckPlayer();yaw=activeRoomLayout?.yaw??0;pitch=0;$('#exitRoomButton').classList.remove('hidden');syncView();active=null;$('#place').textContent=s.title.toUpperCase();$('#placeSub').textContent=`${s.jp} · ${s.sub}`;$('#timeText').textContent=s.line;say(s.id==='crystal-room'&&activeRoomLayout?'The timber door closes. Something here does not belong to the street.':`${s.title} · Explore the room. Tap objects nearby to examine them.`,s.id==='crystal-room'?5:3);camera.position.copy(player.position);camera.position.y+=1.7;}
function leaveRoom(){if(!current)return;storeService?.dispose();storeService=null;neighbourChats.cancel();chatBubble.hide();inspector?.close();activities.close();resetInput();$('#directory').classList.add('hidden');$('#exitRoomButton').classList.add('hidden');izakayaGuests.restore();ramenGuests.restore();marketClerk.restore();homeGuests.restore();seated=false;parkSeat=null;active=null;const s=current;current=null;syncView();room.visible=false;town.visible=true;if(s)placeAtEntrance(s,true);unstuckPlayer(true);$('#place').textContent='JOHANSSON TOWN';$('#placeSub').textContent='ヨハンソン町 · HARBOUR DISTRICT';$('#timeText').textContent='Shops are open.';say('Johansson Street',1.5)}

function welcomeAtCounter(forward){
  if(storeWelcomed||!storeClerk?.visible||current?.id!=='market')return;
  const towards=storeClerk.position.clone().sub(player.position);towards.y=0;
  // Let the player see the greeting before the dialogue card covers the view.
  // Once per visit, only when approaching and looking towards the counter.
  if(towards.length()>3||forward.dot(towards.normalize())<.65)return;
  storeWelcomed=true;characters.gesture(storeClerk);
}
function interaction(){if(seated){active=null;$('#prompt').textContent=parkSeat?.storeSeatId?(storeService?.order?.delivered?'Eat / drink · Stand up':storeService?.order?'Order on its way · Stand up':'Order food · Stand up'):'Stand up';$('#prompt').classList.add('on');return;}if(storeClerk&&current)storeClerk.visible=(current?.id==='market'&&minutes%1440>=540&&minutes%1440<1200)||(current?.id==='izakaya'&&!!storeClerk.userData.inIzakaya)||(current?.id==='ramen'&&!!storeClerk.userData.inRamen)||(current?.id==='yuri-home'&&!!storeClerk.userData.inHome);active=null;let best=null,dmax=3.1,bestScore=Infinity;const p=player.position.clone();p.y+=1;const fw=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));welcomeAtCounter(fw);for(const o of interactables){const h=o.userData.hit;if(!o.visible||current&&!h.inside||!current&&h.inside)continue;let visible=true;for(let a=o.parent;a;a=a.parent)if(!a.visible)visible=false;if(!visible)continue;const q=new THREE.Vector3();o.getWorldPosition(q);const target=q.clone(),v=q.sub(p),d=v.length();if(d>dmax)continue;v.y=0;if(v.lengthSq()&&fw.dot(v.normalize())<-.2)continue;const score=o.userData.storeItem?shelfAimScore(camera.position,camera.getWorldDirection(new THREE.Vector3()),target):d;if(score>=bestScore)continue;bestScore=score;best={...h,object:o}}const e=$('#prompt');if(best){active=best;e.textContent=(touch?'':'E · ')+best.label;e.classList.add('on')}else e.classList.remove('on')}
function standUp(){if(!seated)return;storeService?.cancel();if(parkSeat?.stand)player.position.set(...parkSeat.stand);parkSeat=null;seated=false;unstuckPlayer();say('You stand up.',2);}
function doInteract(){if(roomLoading||activities.paused)return;if(seated){if(parkSeat?.storeSeatId)activities.action('store-table');else standUp();return;}if(inspector?.active)return;if($('#directory').classList.contains('hidden')){interaction();active?.fn?.();}}
function environmentBlocked(x,z,r=PLAYER_RADIUS){const bounds=current?(activeRoomLayout?suppliedRoomBoundsBlocked(activeRoomLayout,x,z,r):roomBoundsBlocked(x,z,r)):townBoundsBlocked(x,z,r);if(bounds)return true;const list=current?roomColliders:world.colliders;return list.some(c=>circleHitsRect(x,z,r,c));}
function entrancePoints(){return SITES.filter(s=>s.door).map(s=>[s.door[0],s.door[2]??s.door[1]]);}
function inEntrance(x,z,r=1.2){return entrancePoints().some(([dx,dz])=>Math.hypot(x-dx,z-dz)<r);}
function indoorNpc(g){return g.userData.inIzakaya||g.userData.inRamen||g.userData.inHome||g.userData.inMarket;}
function overlapsResident(x,z){return world.people.some(p=>p.g.visible&&(!current||indoorNpc(p.g))&&circleHitsCircle(x,z,PLAYER_RADIUS,p.g.position.x,p.g.position.z,NPC_RADIUS));}
function residentBlocked(x,z){if(current&&storeClerk?.visible&&indoorNpc(storeClerk)&&circleHitsCircle(x,z,PLAYER_RADIUS,storeClerk.position.x,storeClerk.position.z,NPC_RADIUS))return true;return world.people.some(p=>{if(!p.g.visible||(current&&!indoorNpc(p.g)))return false;if(!current&&inEntrance(p.g.position.x,p.g.position.z))return false;return circleHitsCircle(x,z,PLAYER_RADIUS,p.g.position.x,p.g.position.z,NPC_RADIUS);});}
function collides(x,z){return environmentBlocked(x,z,PLAYER_RADIUS)||residentBlocked(x,z);}
function staysOpen(site){return !site||site.id==='home'||site.id==='yuri-home'||site.id==='bus-hut';}
function occupiedByPerson(x,z){
 if(current&&storeClerk&&indoorNpc(storeClerk)&&circleHitsCircle(x,z,PLAYER_RADIUS,storeClerk.position.x,storeClerk.position.z,NPC_RADIUS))return true;
 return world.people.some(p=>{
  if(current)return indoorNpc(p.g)&&circleHitsCircle(x,z,PLAYER_RADIUS,p.g.position.x,p.g.position.z,NPC_RADIUS);
  if(indoorNpc(p.g))return false;
  return circleHitsCircle(x,z,PLAYER_RADIUS,p.g.position.x,p.g.position.z,NPC_RADIUS);
 });
}
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
function evictIfClosed(){
 if(!current||!world.isOpen||staysOpen(current)||world.isOpen(current,minutes))return false;
 const name=current.title;leaveRoom();say(name+' is closing. The door opens onto the street.',4);return true;
}
function placeAtEntrance(s,leave=false){
 const mapped=doors.get(s.id);
 let x0,z0;
 if(s.exitPosition){x0=s.exitPosition[0];z0=s.exitPosition[2];}
 else if(mapped){x0=mapped.x;z0=mapped.z+(leave?.6:s.id==='izakaya'?-1.2:.7);}
 else return;
 yaw=leave?(s.entryFacing!=null?s.entryFacing+Math.PI:0):(s.entryFacing??(s.id==='izakaya'?Math.PI:s.side?-s.side*Math.PI/2:0));
 const fwX=-Math.sin(yaw),fwZ=-Math.cos(yaw);
 const [x,z]=findClear(x0+fwX*(leave?.6:0),z0+fwZ*(leave?.6:0));
 player.position.set(x,groundHeight(x,z),z);
}
function updatePlayer(dt){if(!seated)unstuckPlayer();let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);if(moveTouch.id!==null){s+=THREE.MathUtils.clamp((moveTouch.x-moveTouch.cx)/48,-1,1);f+=THREE.MathUtils.clamp(-(moveTouch.y-moveTouch.cy)/48,-1,1);}if(seated){s=0;f=0;}move2.set(s,f);if(move2.lengthSq()>1)move2.normalize();fwVec.set(-Math.sin(yaw),0,-Math.cos(yaw));rtVec.set(Math.cos(yaw),0,-Math.sin(yaw));moveVec.copy(fwVec).multiplyScalar(move2.y).addScaledVector(rtVec,move2.x);if(moveVec.lengthSq()>.02){const speed=(keys.ShiftLeft||keys.ShiftRight||touchRunning||activities.state.sprintUntil>performance.now()?5.2:3)*dt,nx=player.position.x+moveVec.x*speed,nz=player.position.z+moveVec.z*speed;if(!collides(nx,player.position.z))player.position.x=nx;if(!collides(player.position.x,nz))player.position.z=nz;turnQ.setFromAxisAngle(yAxis,Math.atan2(-moveVec.x,-moveVec.z));player.quaternion.slerp(turnQ,1-Math.pow(.001,dt));}player.visible=false;camera.position.copy(player.position).add(fwVec.set(0,seated?(parkSeat?parkSeat.eyeY-player.position.y:1.15):1.7+(move2.lengthSq()>.02?Math.sin(elapsed*11)*.018:0),0));camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}

const fmt=m=>`${String(Math.floor((m%1440)/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;
const daylight=m=>{const h=(m/60)%24;return h>=7&&h<17?1:h>=17&&h<20?1-(h-17)/3:h>=5&&h<7?(h-5)/2:0};
function setTime(){world.updateHours?.(minutes);const h=(minutes/60)%24,day=daylight(minutes);sun.intensity=(.22+day*3.25)*(weather?.62:1);ambient.intensity=scene.environment?.28+day*.55:.55+day*.95;scene.environmentIntensity=(.12+day*.22)*(current?.4:weather?.65:1);sun.color.set(h>=17&&h<20?0xffad72:0xffddb0);const cell=52/(tabletLike?1024:2048),sx=Math.round(player.position.x/cell)*cell,sz=Math.round(player.position.z/cell)*cell;sun.position.set(sx-30,12+day*25,sz+12);sun.target.position.set(sx,0,sz);sun.target.updateMatrixWorld();townSky.update(camera,day,weather,!!current);const air=atmosphere(day,weather,!!current);scene.background.set(air.sky);scene.fog=air.fog;ambient.intensity=air.ambient;renderer.toneMappingExposure=air.exposure;$('.timecard small').textContent=h<7?'EARLY MORNING':h<17?'AFTERNOON':h<20?'EVENING':'NIGHT';return day;}
$('#exitRoomButton').onclick=()=>leaveRoom();
function syncView(){
 document.body.classList.remove('diorama');camera.fov=65;camera.updateProjectionMatrix();
 room.traverse(o=>{if(o.userData.cutaway)o.layers.set(0);});
 player.visible=false;window.__JOHANSSON_CAMERA_MODE__='first';
}
const placeDirections=s=>FULL_TOWN.active?'Follow the visitor map to '+s.title+' in the canal quarter.':s.id==='izakaya'?'Take the eastern lane from the main street and follow the red IZAKAYA sign.':s.id==='tea-house'?'Follow the residential lane north, then look for the blue-and-white curtains.':'Follow the main street to '+s.title+'.';
function markPlace(s){navigationTarget=s;toggleDir(false);drawMap();say(placeDirections(s)+(current?' Use Exit to street to start walking.':''),7);return false;}
function visitPlace(s){
 if(!s)return false;
 // The gate lives at the action itself, so stale buttons and WebMCP share it.
 if(!travelProgress(activities.state).unlocked)return markPlace(s);
 if(current)leaveRoom();placeAtEntrance(s);resetInput();toggleDir(false);navigationTarget=null;drawMap();say(s.title+' · You took a familiar shortcut.',5);return true;
}
function toggleDir(open){if(inspector?.active)return;if(open){updateDirectory();document.exitPointerLock?.();Object.keys(keys).forEach(k=>keys[k]=false);moveTouch.id=null;}$('#directory').classList.toggle('hidden',!open);$('#directoryButton').setAttribute('aria-expanded',String(open));if(open)$('#closeDirectory').focus();else $('#directoryButton').focus();}
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
 section('Residents');world.people.filter(p=>p.g.visible).forEach(p=>row(p.g.userData.name,p.g.userData.activity||'On the street',()=>{activities.note(p.g.userData.name+' · '+(p.g.userData.activity||'on the street'));toggleDir(false);}));
 section('Reading and records');content.items.forEach(i=>row(i.title,i.place,()=>{activities.note(i.title+' — '+i.place);toggleDir(false);say(i.place,4);}));
 section('Signals');[['82.1 Harbour Service','Harbour notices'],['89.4 JOJO','Journal requests'],['95.7 Sports','Prefectural baseball'],['Payphone','Near the bookshop'],['Harbour Line','Southern bus stop']].forEach(([a,b])=>row(a,b,()=>{toggleDir(false);say(a+' · '+b,4);}));
}
function runStabilityChecks(){const failures=[];if(!townBoundsBlocked(160,0,PLAYER_RADIUS))failures.push('town edge');if(!roomBoundsBlocked(5.5,0,PLAYER_RADIUS))failures.push('room edge');if(world.colliders.length<20)failures.push('world collider coverage');if((world.quality?.streetInteractions||0)<8)failures.push('street interaction coverage');for(const [id,p] of doors)if(environmentBlocked(p.x,p.z,PLAYER_RADIUS)||(!FULL_TOWN.active&&environmentBlocked(p.x,p.z+(id==='izakaya'?-.7:.7),PLAYER_RADIUS)))failures.push(`door spawn ${id}`);window.__JOHANSSON_STABILITY__={ok:failures.length===0,failures,colliders:world.colliders.length,characterCount:world.people.length+1,streetInteractions:world.quality?.streetInteractions||0,renderDpr:renderer.getPixelRatio(),toneMapping:'AgX',shadows};if(failures.length)console.error('Johansson Town stability checks failed',failures);else console.info('Johansson Town stability checks passed',window.__JOHANSSON_STABILITY__)}

started=true;$('#start').classList.add('hidden');$('#hud').classList.remove('hidden');window.__JOHANSSON_RUNNING__=true;camera.position.copy(player.position);camera.position.y+=1.7;say('Aiko is by the book display ahead. The harbour office keeps a blue-taped folio towards the water.',5);runStabilityChecks();
canvas.addEventListener('click',event=>{
 if(!current||activities.paused||inspector?.active)return;
 if(seated){doInteract();return;}
 const rect=canvas.getBoundingClientRect();let best=null,bestDistance=48;
 for(const object of interactables){if(!object.userData.hit?.inside||!object.visible)continue;let hidden=false;for(let p=object.parent;p;p=p.parent)if(!p.visible)hidden=true;if(hidden)continue;const q=object.getWorldPosition(new THREE.Vector3());if(q.distanceTo(player.position)>3.4)continue;q.project(camera);const distance=Math.hypot((q.x+1)*rect.width/2-(event.clientX-rect.left),(1-q.y)*rect.height/2-(event.clientY-rect.top));if(distance<bestDistance){bestDistance=distance;best=object;}}
 if(best){active={...best.userData.hit,object:best};active.fn();}
});
canvas.onclick=()=>{if(inspector?.active||activities.paused)return;if(started&&!touch&&$('#directory').classList.contains('hidden'))canvas.requestPointerLock?.()?.catch?.(()=>{})};document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||activities.paused||inspector?.active)return;yaw-=e.movementX*.0023;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0018,-.95,.85)});document.addEventListener('keydown',e=>{if(activities.paused)return;if(e.code==='Escape'){toggleDir(false);return;}if(!$('#directory').classList.contains('hidden')){if(e.code==='KeyQ')toggleDir(false);return;}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(!started)return;if(e.code==='KeyE'&&!e.repeat)doInteract();if(e.code==='KeyR'&&!e.repeat)hands.drink();if(e.code==='KeyQ'&&!e.repeat)toggleDir(true);if(e.code==='KeyB'&&!e.repeat)activities.inventory();if(e.code==='KeyN'&&!e.repeat)$('#timeButton').click();});document.addEventListener('keyup',e=>keys[e.code]=false);function setRunning(value){touchRunning=value;$('#run').setAttribute('aria-pressed',String(value));$('#run').textContent=value?'RUNNING':'RUN';}
function toggleRunning(){if(!started||activities.paused||inspector?.active||seated)return;setRunning(!touchRunning);}
// Touch-down works while another finger holds the movement stick; a synthetic click may be suppressed.
$('#run').onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();toggleRunning();};
$('#run').onclick=e=>{if(e.detail===0)toggleRunning();};
$('#drink').onpointerdown=e=>{e.preventDefault();hands.drink();};$('#act').onpointerdown=e=>{e.preventDefault();doInteract()};

const stick=$('#stick'),knob=$('#knob');canvas.addEventListener('touchstart',e=>{if(!started||activities.paused||!$('#directory').classList.contains('hidden')||!$('#qte').classList.contains('hidden'))return;const r=stick.getBoundingClientRect();for(const t of e.changedTouches){if(t.clientX<innerWidth*.48&&moveTouch.id===null){moveTouch.id=t.identifier;moveTouch.cx=r.left+r.width/2;moveTouch.cy=r.top+r.height/2;moveTouch.x=t.clientX;moveTouch.y=t.clientY}else if(lookTouch.id===null){lookTouch.id=t.identifier;lookTouch.x=t.clientX;lookTouch.y=t.clientY}}e.preventDefault()},{passive:false});canvas.addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(t.identifier===moveTouch.id){moveTouch.x=t.clientX;moveTouch.y=t.clientY;knob.style.transform=`translate(${THREE.MathUtils.clamp(t.clientX-moveTouch.cx,-42,42)}px,${THREE.MathUtils.clamp(t.clientY-moveTouch.cy,-42,42)}px)`}else if(t.identifier===lookTouch.id){yaw-=(t.clientX-lookTouch.x)*.005;pitch=THREE.MathUtils.clamp(pitch-(t.clientY-lookTouch.y)*.0037,-.95,.85);lookTouch.x=t.clientX;lookTouch.y=t.clientY}}e.preventDefault()},{passive:false});function endTouch(e){for(const t of e.changedTouches){if(t.identifier===moveTouch.id){moveTouch.id=null;knob.style.transform='translate(0,0)'}if(t.identifier===lookTouch.id)lookTouch.id=null}}canvas.addEventListener('touchend',endTouch,{passive:false});canvas.addEventListener('touchcancel',endTouch,{passive:false});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();started=false;const d=$('#fatal');if(d){d.classList.remove('hidden');d.querySelector('p').textContent='Graphics paused safely. Reload Johansson Town to continue.'}});canvas.addEventListener('webglcontextrestored',()=>location.reload());function resizeRenderer(){const view=conversationViewport(innerWidth,innerHeight,!!conversationName);renderer.setPixelRatio(renderDpr());renderer.setSize(view.width,view.height,false);canvas.style.width=view.width+'px';canvas.style.height=view.height+'px';camera.aspect=view.width/view.height;camera.updateProjectionMatrix()}
function setConversation(name){if(name){neighbourChats.cancel();chatBubble.hide();}
 if(name&&!conversationName)conversationCamera={rotation:camera.quaternion.clone(),playerVisible:player.visible};
 conversationName=name;resizeRenderer();
 if(name){
  const speaker=name==='Yuri'?storeClerk:world.people.find(p=>p.g.userData.name===name)?.g;
  if(speaker){camera.lookAt(characters.conversationTarget(speaker));}
  player.visible=false;
 }else if(conversationCamera){camera.quaternion.copy(conversationCamera.rotation);player.visible=conversationCamera.playerVisible;conversationCamera=null;}
}addEventListener('resize',resizeRenderer);window.visualViewport?.addEventListener('resize',resizeRenderer);function resetInput(){setRunning(false);Object.keys(keys).forEach(k=>keys[k]=false);moveTouch.id=null;lookTouch.id=null;knob.style.transform='translate(0,0)';}addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{resetInput();if(!document.hidden)clock.getDelta();});

const mapCanvas=$('#minimap'),mapCtx=mapCanvas.getContext('2d');function drawMap(){drawTownMap(mapCtx,mapCanvas.width,mapCanvas.height,{sites:SITES,people:world.people,player:current?doors.get(current.id):player.position,yaw,visited:activities.state.visited,target:navigationTarget});updateWaypoint();}
function updateWaypoint(){
 const button=$('#waypoint');button.classList.toggle('hidden',!navigationTarget);if(!navigationTarget)return;
 const p=current?doors.get(current.id):player.position,d=doors.get(navigationTarget.id),distance=Math.hypot(d.x-p.x,d.z-p.z);
 const angle=Math.atan2(-(d.x-p.x),-(d.z-p.z))-yaw,index=((Math.round(angle/(Math.PI/4))%8)+8)%8,arrow=['↑','↖','←','↙','↓','↘','→','↗'][index];
 button.textContent=(current?'Outside · ':arrow+' ')+navigationTarget.title+' · '+(distance<3?'You’re here':Math.round(distance)+' m')+' ×';button.setAttribute('aria-label','Clear directions to '+navigationTarget.title);
}
$('#waypoint').onclick=()=>{navigationTarget=null;drawMap();};
let elapsed=0,mapTick=0,stepTick=0,accumulator=0,saveTick=0;
function simulate(frameDt){
  accumulator+=Math.min(frameDt,MAX_FRAME_DT);
  while(accumulator>=SIM_STEP){
    const dt=SIM_STEP;minutes+=dt;elapsed+=dt;
    if((saveTick+=dt)>=15){activities.save();saveTick=0;}characters?.physics?.(dt,current?0:groundHeight(player.position.x,player.position.z));updatePlayer(dt);
    evictIfClosed();
    if(current?.id==='izakaya')izakayaGuests.sync(minutes);
    if(current?.id==='market'){marketClerk.sync(minutes);storeService?.update(dt);}
    if(current?.id==='ramen')ramenGuests.sync(minutes);
    if(current?.id==='yuri-home')homeGuests.sync(minutes);
    castAI?.update(dt,minutes,weather);neighbourChats.update(dt,minutes,weather);
    if(!current){world.update(dt,elapsed,daylight(minutes),minutes);if(!activities.state.quickTravelNotified&&travelProgress(activities.state).unlocked)activities.save();world.beats?.update(dt,elapsed,minutes);}
    accumulator-=SIM_STEP;
  }
}
let controlsMovingUntil=0;
function updateContextControls(){
 const blocked=roomLoading||activities.paused||inspector?.active||!$('#directory').classList.contains('hidden')||!$('#qte').classList.contains('hidden');
 if(!blocked&&(move2.lengthSq()>.02||moveTouch.id!==null))controlsMovingUntil=performance.now()+1400;
 const state=controlVisibility({playing:started,paused:blocked,seated,inside:!!current,moving:performance.now()<controlsMovingUntil,running:touchRunning,canDrink:!!hands?.canDrink,hasTarget:!!active});
 for(const [id,visible] of Object.entries(state)){const element=$('#'+id);if(element.classList.contains('hidden')===visible)element.classList.toggle('hidden',!visible);}
}
function loop(){requestAnimationFrame(loop);updateContextControls();const frameDt=Math.min(clock.getDelta(),MAX_FRAME_DT);if(started&&!document.hidden){const paused=roomLoading||inspector?.active||activities.paused||!$('#directory').classList.contains('hidden');if(!paused){const before=player.position.clone();simulate(frameDt);if(player.position.distanceTo(before)>.01&&(stepTick+=frameDt)>.42){activities.footstep(current?'wood':routeAt(player.position.x,player.position.z)?.surface||'stone');stepTick=0;}interaction();}else{neighbourChats.cancel();chatBubble.hide();accumulator=0;resetInput();$('#prompt').classList.remove('on');}townAudio.update({player:player.position,yaw,minutes,rain:weather,inside:!!current,station:activities.state.radioStation||0,paused});$('#clock').textContent=fmt(minutes);setTime();hands?.update(paused?0:frameDt);if(!inspector?.active){characters?.update(frameDt);castAI?.pose(frameDt);}if(!paused)chatBubble.render(neighbourChats.current);if((mapTick+=frameDt)>.15){drawMap();mapTick=0;}if(subtitleTimer>0&&(subtitleTimer-=frameDt)<=0)$('#subtitle').classList.remove('on');if(inspector?.active)inspector.render(frameDt);else if(current?.id==='market')shopStreetView.render({renderer,scene,camera,town,room,frontage:current.streetFrontage});else renderer.render(scene,camera)}else{neighbourChats.cancel();chatBubble.hide();}}renderer.render(scene,camera);loop();

// Optional scenery streams only after the first town frame, outside the boot gate.
setTimeout(()=>{void world.seaCave?.load();},0);

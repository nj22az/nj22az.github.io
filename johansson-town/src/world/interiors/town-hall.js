import * as THREE from '../../../vendor/three.module.js';
import {buildAvatar} from '../../avatars/build.js';
import {createAvatarAnimator} from '../../avatars/animate.js';
import {normalizeRecipe} from '../../avatars/recipe.js';

/**
 * The town hall's rooms behind their own doors: the mayor's office (町長室), the
 * community kitchen (調理室), the clinic (診療所) and the mayor's home in the east wing
 * (町長宅), where Johansson lives.
 *
 * The building is the old school (港小中学校, 1971). When the junior high closed in 1989
 * the town office moved in. In 2026 the old two-storey block was replaced by a single-storey hall (school.js buildTownHall): the Years 5–6 classroom is one of its rooms
 * (classroom.js), and the rooms along the field face became the town's.
 *
 * Both rooms follow the town's room contract: the door is on the +z wall, you enter
 * facing -z (yaw 0), and the layout gives bounds, spawn and exit. Furniture solids go
 * through `collider`, as the harbour office's do.
 */
const SHELL={w:6.6,d:5.6,h:2.85};
const mats=new Map();
const mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({color:c,roughness:.85,...o}));return mats.get(k);};
function canvasTexture(w,h,draw){
 const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';
const SERIF='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';

/** Walls, floor, ceiling, dado, a window on the east wall, two fluorescent battens. */
function shell(group,{floor,wall,dado,ceiling=0xf3efe2,tatami=false}){
 const {w,d,h}=SHELL,hw=w/2,hd=d/2;
 const box=(size,pos,c,name)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),typeof c==='number'?mat(c):c);m.position.set(...pos);m.receiveShadow=true;if(name)m.name=name;group.add(m);return m;};
 if(tatami){
  // Tatami in the classic 2-by-1 pattern: eight mats with dark cloth borders.
  box([w,.04,d],[0,-.02,0],0xcbc38c,'Tatami floor');
  for(const x of [-hw/2,0,hw/2])box([.04,.012,d],[x,.006,0],0x3f4a3a);
  for(const z of [-hd/2,0,hd/2])box([w,.012,.04],[0,.006,z],0x3f4a3a);
 }else box([w,.04,d],[0,-.02,0],floor,'Floor');
 const wallSet=(len,pos,ry)=>{const g=new THREE.Group();g.position.set(...pos);g.rotation.y=ry;group.add(g);
  const p=(size,at,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));m.position.set(...at);m.receiveShadow=true;g.add(m);};
  p([len,.9,.04],[0,.45,0],dado);p([len,h-.9,.04],[0,.9+(h-.9)/2,0],wall);p([len,.05,.06],[0,.9,.01],0x6f5a44);p([len,.08,.06],[0,.04,.01],0x5a4a3a);};
 wallSet(w,[0,0,-hd-.02],0);wallSet(d,[-hw-.02,0,0],Math.PI/2);wallSet(d,[hw+.02,0,0],-Math.PI/2);
 for(const [x,len] of [[-(hw+.55)/2,hw-.55],[(hw+.55)/2,hw-.55]])wallSet(len,[x,0,hd+.02],Math.PI);
 box([1.1,h-2.1,.04],[0,2.1+(h-2.1)/2,hd+.02],wall);
 for(const x of [-.57,.57])box([.06,2.12,.1],[x,1.06,hd],0x8a9092);
 box([w,.04,d],[0,h+.02,0],ceiling,'Ceiling');
 const tube=new THREE.MeshBasicMaterial({color:0xf6fbf4});
 for(const z of [-1,1]){box([1.2,.05,.2],[0,h-.03,z],0xdedfd6);const t=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1.1,6),tube);t.rotation.z=Math.PI/2;t.position.set(0,h-.07,z);group.add(t);}
 // East window over the field, with its aluminium frame and the light from it.
 box([.06,1.2,2],[hw-.01,1.6,-.6],0xb4b8b6);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.1),new THREE.MeshBasicMaterial({color:0xbfe3ee}));glass.rotation.y=-Math.PI/2;glass.position.set(hw-.03,1.6,-.6);group.add(glass);
 group.add(new THREE.HemisphereLight(0xf4f2ea,0x8a8478,1.0));
 const lamp=new THREE.PointLight(0xfff2dc,.8,9,2);lamp.position.set(0,2.5,0);group.add(lamp);
 return box;
}

function layoutFor(){
 const {w,d}=SHELL;
 return {bounds:{minX:-w/2+.05,maxX:w/2-.05,minZ:-d/2+.05,maxZ:d/2-.05},spawn:[0,0,d/2-.6],exit:[0,1.1,d/2-.04],yaw:0};
}

function plate(group,text,{w,h,at,ry=0,bg='#f3f0e4',fg='#23302a',font=GOTHIC,size=.6,sub=''}){
 const map=canvasTexture(512,Math.round(512*h/w),(ctx,cw,ch)=>{ctx.fillStyle=bg;ctx.fillRect(0,0,cw,ch);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold ${ch*size}px ${font}`;ctx.fillText(text,cw/2,sub?ch*.4:ch*.52,cw*.92);if(sub){ctx.font=`bold ${ch*.2}px ${GOTHIC}`;ctx.fillText(sub,cw/2,ch*.82,cw*.92);}});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.8}));m.position.set(...at);m.rotation.y=ry;m.name='Plate '+text;group.add(m);return m;
}

/**
 * 町長室, the mayor's office. A steel desk under the national and town flags, the island
 * map, a glass-fronted cabinet of minutes, two sofas for visitors around a low table,
 * and the in-tray of petitions: what the island wants from its mayor this week.
 */
/** What is in the tray this week: every petition is from somebody who lives here. */
export const PETITIONS=Object.freeze([
 'From Mr Shimabukuro, the power house next door: The second diesel set needs new injectors before typhoon season. The parts come on the Thursday ferry if the town pays this week.',
 "From Mrs Nakamura, Nakamura Zenzai: The street lamp outside the east row has flickered since the rain. Customers say it makes the zenzai look grey.",
 'From the Higa household, Nishi-machi: May the children use the town hall field on Sunday for eisa practice? Grandmother Higa will supervise. Loudly.',
 'From the ferry company: The new cargo trucks are heavier. We ask the town to strengthen the quay apron where the ramp lands.',
 'From Thuan, Sakura Shōten: A request for a bench at the bus stop by the ferry. People wait there with their shopping.',
]);
export function buildMayorOffice({room,reg,action,collider=()=>{},exit,petitions=()=>PETITIONS}){
 const group=new THREE.Group();group.name='Mayor’s office';room.add(group);
 const box=shell(group,{floor:0x9a8a74,wall:0xefe8d6,dado:0x8a6a4a});
 const {w,d}=SHELL,hw=w/2,hd=d/2;
 const anchor=(pos,label,fn,npc=false)=>{const o=new THREE.Object3D();o.position.set(...pos);o.userData.npcInteraction=npc;group.add(o);reg(o,label,fn,true);return o;};
 // Carpet, the desk and the chair behind it.
 box([3.2,.012,2.4],[0,.006,-1.2],0x7a2f2f,'Office carpet');
 box([1.8,.05,.85],[0,.76,-1.85],0x6b4a32,'Mayor’s desk top');
 for(const x of [-.75,.75])box([.32,.74,.8],[x,.37,-1.85],0x5a3f2a);
 collider(0,-1.85,1.9,.9,.8);
 box([.55,.08,.5],[0,.48,-2.45],0x2a2a2a,'Mayor’s chair seat');box([.55,.7,.08],[0,.9,-2.72],0x2a2a2a,'Mayor’s chair back');
 const name=plate(group,"Mayor Johansson",{w:.56,h:.14,at:[0,.86,-1.43],ry:0,bg:'#2b2f2c',fg:'#e8dfc4',font:SERIF,size:.62});name.rotation.x=-.4;
 box([.36,.24,.02],[-.55,.9,-2.05],0x3a4a52,'Desk photo');box([.26,.02,.34],[.55,.79,-1.75],0xe8e2cf,'Petitions tray');
 // Flags behind the desk: Japan and the town's own, on stands.
 const flag=(x,draw)=>{box([.03,2.1,.03],[x,1.05,-hd+.25],0xc9a64a);const f=new THREE.Mesh(new THREE.PlaneGeometry(.7,.48),new THREE.MeshStandardMaterial({map:canvasTexture(140,96,draw),side:THREE.DoubleSide,roughness:.9}));f.position.set(x+.36,1.78,-hd+.25);group.add(f);};
 flag(-1.6,(c,w0,h0)=>{c.fillStyle='#f4f1ea';c.fillRect(0,0,w0,h0);c.fillStyle='#c8102e';c.beginPath();c.arc(w0/2,h0/2,h0*.3,0,Math.PI*2);c.fill();});
 flag(1.2,(c,w0,h0)=>{c.fillStyle='#2f6f9f';c.fillRect(0,0,w0,h0);c.fillStyle='#f4f1ea';c.font=`bold 44px ${SERIF}`;c.textAlign='center';c.textBaseline='middle';c.fillText("Minato",w0/2,h0/2);});
 // The island map on the west wall.
 const map=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),new THREE.MeshStandardMaterial({roughness:.9,map:canvasTexture(440,280,(c,w0,h0)=>{
  c.fillStyle='#7fb7cf';c.fillRect(0,0,w0,h0);c.fillStyle='#e8dcb8';c.beginPath();
  c.moveTo(70,250);c.lineTo(70,70);c.bezierCurveTo(140,30,250,20,330,60);c.bezierCurveTo(400,90,420,160,380,210);c.lineTo(330,250);c.closePath();c.fill();
  c.fillStyle='#5c9848';c.fillRect(250,60,90,70);c.fillStyle='#a9aeb4';c.fillRect(150,70,14,180);c.fillStyle='#2b2b2b';c.font=`bold 22px ${GOTHIC}`;c.fillText("Minato Town",120,160);
  c.font=`bold 16px ${GOTHIC}`;c.fillText("Kitanojima →",350,262);c.strokeStyle='#3a3a3a';c.lineWidth=4;c.strokeRect(2,2,w0-4,h0-4);})}));
 map.position.set(-hw+.04,1.65,-.4);map.rotation.y=Math.PI/2;map.name='Island map';group.add(map);
 // Visitors' sofas round a low table, and the cabinet of minutes.
 box([.9,.05,.55],[-1.6,.42,.8],0x6b4a32,'Low table');collider(-1.6,.8,.9,.55,.45);
 for(const dz of [-.75,.75]){box([1.2,.42,.55],[-1.6,.21,.8+dz],0x5d6f5a);box([1.2,.45,.14],[-1.6,.55,.8+dz+Math.sign(dz)*.24],0x5d6f5a);collider(-1.6,.8+dz,1.2,.55,.6);}
 box([.45,1.8,1.4],[hw-.3,.9,1.3],0x8a6a4a,'Cabinet of minutes');collider(hw-.3,1.3,.45,1.4,1.8);
 for(let i=0;i<8;i++)box([.05,.3,.22],[hw-.45,1.1+(i>3?.45:0),.85+(i%4)*.3],[0x2f4f6f,0x6f2f2f,0x2f5f3f][i%3]);
 anchor([0,1.0,-1.35],'Sit at the mayor’s desk',()=>action('seat','The mayor’s desk','Your desk. The chair still squeaks the way it did when it was the headmaster’s.'));
 anchor([.55,1.0,-1.5],'Read the petitions',()=>{const list=petitions();action('read','Petitions to the mayor',list.length?list.join('\n\n'):'The tray is empty. A quiet week on the island, or nobody has told you yet.');});
 anchor([-hw+.4,1.4,-.4],'Study the island map',()=>action('inspect','Map of Minato-chō','The island in hand-coloured ink, every lot numbered: the harbour, the shotengai, Nishi-machi inside its seawall, the new houses up at Kitahama, the oil jetty, the town hall and its field. Kitano-jima sits off the corner with its airport and the sewage works. Pins mark this year\'s roadworks.'));
 plate(group,'DOCUMENT REGISTER',{w:1.4,h:.3,at:[hw-.55,1.9,1.3],ry:-Math.PI/2,sub:'COMMUNITY HALL · ONE YEAR'});
 anchor([hw-.8,1.0,1.3],'Open the document register',()=>action('document-archive','Community Hall Document Register'));
 for(let month=0;month<12;month++){const folder=box([.045,.28,.22],[hw-.45,.5+(month>5?.36:0),.72+(month%6)*.2],0xb5a16c,'Archive folder '+(month+1));}
 anchor([hw-.6,1.2,1.3],'Look through the minutes',()=>action('read','Town assembly minutes, 1997','Item 3: the power house\'s second diesel set to be overhauled before typhoon season; the old barber\'s shop to be let to the post office. Item 5: the ferry company asks for a longer ramp so the new cargo trucks can board. Item 7: Mrs Sato\'s complaint about the gulls, again. Item 9: the sewage works on Kitano-jima to be inspected by the prefecture in November.'));
 return {...layoutFor(),office:true};
}

/**
 * 町長宅, the mayor's home in the east wing: Johansson's own rooms. Tatami, a low table
 * with cushions, the futon folded in the corner by day, a kitchenette, a television on a
 * cabinet, the bookshelf of sea charts and Swedish paperbacks, and the wardrobe with the
 * mirror on its door where you choose what to wear.
 */
export function buildMayorHome({room,reg,action,collider=()=>{},exit,openMaker=null,sleep=null}){
 const group=new THREE.Group();group.name='Mayor’s home';room.add(group);
 const box=shell(group,{wall:0xf1e9d6,dado:0xb89c78,tatami:true});
 const {w,d}=SHELL,hw=w/2,hd=d/2;
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);o.userData.npcInteraction=false;group.add(o);reg(o,label,fn,true);return o;};
 // The genkan step inside the door, where shoes come off.
 box([1.4,.12,.7],[0,.06,hd-.35],0x9a958a,'Genkan step');
 // Low table, four cushions.
 box([1.1,.05,.75],[-.6,.36,-.4],0x6b4a32,'Low table');for(const [x,z] of [[-.5,.35],[.5,.35],[-.5,-.35],[.5,-.35]])box([.05,.32,.05],[-.6+x,.17,-.4+z],0x5a3f2a);
 collider(-.6,-.4,1.1,.75,.42);
 for(const [x,z] of [[-.6,.25],[-.6,-1.05],[-1.35,-.4],[.15,-.4]])box([.5,.08,.5],[x,.05,z],0xb2453b,'Zabuton');
 box([.35,.08,.35],[-.75,.43,-.45],0xf2efe6,'Tea tray');box([.08,.1,.08],[-.55,.44,-.3],0x3f7a55,'Teacup');
 // Futon, folded by day, laid out along the north wall.
 const futon=box([1.0,.12,2.0],[hw-.75,.07,-hd+1.15],0xe9dfc8,'Futon');futon.userData.bed=true;
 box([.95,.06,1.4],[hw-.75,.16,-hd+1.35],0x2c3e5c,'Quilt');box([.7,.1,.35],[hw-.75,.18,-hd+.4],0xf3e8d2,'Pillow');
 collider(hw-.75,-hd+1.15,1.0,2.0,.25);
 // Kitchenette on the west wall: counter, sink, two-ring gas, a small fridge.
 box([.6,.9,1.8],[-hw+.32,.45,-1.6],0xd8d2c4,'Kitchen counter');box([.62,.04,1.82],[-hw+.32,.92,-1.6],0x9aa3a6);
 box([.4,.12,.4],[-hw+.32,.88,-1.2],0x8e979a,'Sink');box([.35,.04,.5],[-hw+.32,.95,-2.1],0x2b2b2b,'Gas rings');
 box([.6,1.4,.6],[-hw+.32,.7,-.25],0xe8ebe6,'Fridge');collider(-hw+.32,-1.25,.6,2.6,1.4);
 // Television on a low cabinet, and the bookshelf.
 box([.9,.45,.4],[1.2,.23,-hd+.25],0x6b4a32,'TV cabinet');box([.62,.48,.45],[1.2,.7,-hd+.27],0x2b2b2b,'Television');
 box([.52,.36,.02],[1.2,.72,-hd+.5],0x3a5260,'Television screen');collider(1.2,-hd+.25,.9,.45,1);
 box([.35,1.7,1.1],[hw-.2,.85,.9],0x8a6a4a,'Bookshelf');collider(hw-.2,.9,.35,1.1,1.7);
 for(let i=0;i<12;i++)box([.22,.26,.06],[hw-.24,.35+Math.floor(i/4)*.5,.48+(i%4)*.27],[0x2f4f6f,0xc9a64a,0x6f2f2f,0x3f6a4a][i%4]);
 // The wardrobe with its mirror.
 box([1.0,1.9,.55],[-hw+.6,.95,hd-1.1],0x7a5a3e,'Wardrobe');collider(-hw+.6,hd-1.1,1.0,.55,1.9);
 const mirror=new THREE.Mesh(new THREE.PlaneGeometry(.38,1.3),new THREE.MeshStandardMaterial({color:0xcfe0e6,roughness:.08,metalness:.6}));mirror.position.set(-hw+.6+.22,1.05,hd-1.1+.28);mirror.name='Wardrobe mirror';group.add(mirror);
 // A framed photograph: a harbour in Sweden, and one of the island the year he came.
 box([.5,.38,.03],[0,1.75,-hd+.04],0x3a3a3a,'Photograph frame');
 anchor([-.6,.8,-.4],'Sit at the low table',()=>action('seat','Low table','Tea from the thermos, still warm. The ferry horn comes across the field.'));
 anchor([hw-.75,.6,-hd+1.15],'Lie down on the futon',()=>sleep?sleep():action('inspect','Futon','Folded square every morning, the way the harbour master taught you.'));
 anchor([-hw+.8,1.3,hd-.85],'Look in the wardrobe mirror',()=>openMaker?openMaker():action('inspect','Wardrobe','Three kariyushi shirts, a suit for assembly days and a straw hat.'));
 anchor([1.2,1,-hd+.7],'Watch the television',()=>action('inspect','Television','NHK Okinawa: the weather map with a typhoon symbol far to the south, then sumo highlights. You leave it on low for company.'));
 anchor([hw-.4,1.2,.9],'Look at the bookshelf',()=>action('read','Bookshelf','Sea charts of the Ryūkyū arc. A Swedish–Japanese dictionary with a cracked spine. Three Wallander paperbacks. The town budget for 1997, with coffee rings.'));
 anchor([0,1.7,-hd+.4],'Look at the photograph',()=>action('inspect','Photograph','Two pictures in one frame: a red wooden boathouse on a grey Swedish shore, and this harbour in 1979, the year you stepped off the ferry and did not get back on.'));
 return {...layoutFor(),home:true};
}

/**
 * 調理室, the community centre's kitchen: where the women's association fries sata andagi
 * for the eisa night, the class cooks once a term, and anybody can book the stoves for a
 * family occasion. Two long steel work islands, a row of gas rings and the big rice
 * cookers, the sink run under the window, a fridge, the dish cupboards, and the booking
 * sheet on the wall.
 */
export const KITCHEN_BOOKINGS=Object.freeze([
 "Saturday: Women's Association · women's association, andagi for the eisa night (Mrs Nakamura)",
 "Sunday: Higa family, 33rd anniversary memorial lunch",
 "Wednesday: Years 5–6 cooking class, goya champurū (Yonamine-sensei)",
 "Friday: open to all, 18:00 -- bring your own fish (Kōji has promised tuna)",
]);
export function buildCommunityKitchen({room,reg,action,collider=()=>{}}){
 const group=new THREE.Group();group.name='Community kitchen';room.add(group);
 const box=shell(group,{floor:0xb9bfb0,wall:0xf1ece0,dado:0x9fb8a4});
 const {w,d}=SHELL,hw=w/2,hd=d/2,steel=0xc4c9c6;
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);o.userData.npcInteraction=false;group.add(o);reg(o,label,fn,true);};
 // Two stainless work islands with their gas rings and a pan on each.
 for(const x of [-1.2,1.2]){
  box([1.5,.86,2.2],[x,.43,-.6],steel,'Work island');box([1.56,.04,2.26],[x,.88,-.6],0xdfe3e1);
  for(const dz of [-.6,.3])box([.4,.04,.4],[x+.35,.91,-.6+dz],0x2b2b2b,'Gas ring');
  box([.36,.12,.36],[x+.35,.99,-.9],0x3a3d3f,'Frying pan');
  collider(x,-.6,1.5,2.2,.9);
 }
 // The sink run along the back wall, the rice cookers, the fridge, the cupboards.
 box([w-1.2,.86,.6],[-.3,.43,-hd+.32],steel,'Sink run');box([1,.12,.45],[-.6,.84,-hd+.32],0x8e979a,'Sink');
 collider(-.3,-hd+.32,w-1.2,.6,.9);
 for(const x of [1.6,2.1])box([.38,.4,.38],[x,1.08,-hd+.32],0xf2efe6,'Rice cooker');
 box([.75,1.8,.7],[hw-.42,.9,-hd+.4],0xe8ebe6,'Fridge');collider(hw-.42,-hd+.4,.75,.7,1.8);
 box([.45,1.8,2.4],[-hw+.25,.9,.4],0x9a7a56,'Dish cupboards');collider(-hw+.25,.4,.45,2.4,1.8);
 for(let i=0;i<6;i++)box([.04,.5,.3],[-hw+.48,1.2+((i/3)|0)*.55,-.3+(i%3)*.7],0xc2c8c6);
 // The booking sheet and the aprons on their pegs.
 box([.6,.8,.02],[hw-.04,1.5,1],0xf6f1e6,'Booking sheet');
 for(let i=0;i<4;i++)box([.3,.55,.04],[1.2-i*.4,1.4,hd-.04],[0xe98aa6,0xf4f1ea,0x7fb0d8,0xf4d23c][i],'Apron');
 anchor([hw-.5,1.0,1.5],'Open the Community Hall archive',()=>action('document-archive','Community Hall Document Register'));
 anchor([hw-.5,1.4,1],'Read the booking sheet',()=>action('read',"Community Kitchen · bookings this week",KITCHEN_BOOKINGS.join('\n')));
 anchor([1.2,1,.7],'Look at the work islands',()=>action('inspect','Community kitchen',"Stainless steel worn soft at the edges, a ring of oil round the back burner that no amount of scrubbing will lift, and the smell of yesterday's andagi. A notice in Mrs Nakamura's hand: Return used items to their original locations -- put things back where you found them."));
 anchor([1.85,1.2,-hd+.8],'Look at the rice cookers',()=>action('inspect','Rice cookers','Two five-litre gas rice cookers, enough for the whole island at a funeral or a wedding. The newer one is from 1984.'));
 return {...layoutFor(),kitchen:true};
}

/**
 * 診療所, the island clinic: the old meeting room, given over to the doctor the prefecture
 * posts here for two years at a time (Dr Kakazu, this year). Pink tiles, peach walls, the
 * examination couch behind its pink curtain, the doctor's desk with the beige monitor and
 * the X-ray lightbox, the round green stool for the patient, the glass medicine cabinet,
 * the Landolt-ring eye chart, the drip stand and the scales by the door.
 *
 * Drawn from scratch to the room contract; nothing in it is anybody else's model.
 */
export const CLINIC_HOURS=Object.freeze(["Mon–Fri · Mon–Fri 9:00–12:00, 14:00–17:00","Earth · Sat 9:00–12:00",'After hours: ring the bell, the doctor lives behind the clinic','Emergencies to Naha by the ferry, or the prefecture helicopter from Kitano-jima']);
export const DOCTOR='Dr Kakazu';
const DOCTOR_RECIPE={name:DOCTOR,age:'adult',body:{height:.42,build:.4,skin:'#e3b48e'},head:{size:.46,shape:.5,form:'oval',jaw:.35,cheeks:.4},
 hair:{style:'ponytail',colour:'#1f1813'},eyes:{style:'almond',colour:'#2a1d16',size:.5},brows:{style:'straight',colour:'#1f1813',size:.45},
 nose:{style:'line',size:.4},mouth:{style:'small',colour:'#b8544a',size:.42},glasses:{style:'half',colour:'#5a4a3a'},blush:.15,
 outfit:{top:'jacket',topColour:'#f6f6f2',bottom:'trousers',bottomColour:'#3a4658',shoes:'#f4f1ea',accent:'#7fb0d8'},accessories:{neckwear:'none'}};

export function buildClinic({room,reg,action,collider=()=>{}}){
 const group=new THREE.Group();group.name='Clinic';room.add(group);
 const box=shell(group,{floor:0xf0b8b0,wall:0xf6e2d2,dado:0xeab4b4,ceiling:0xf7f3ea});
 const {w,d,h}=SHELL,hw=w/2,hd=d/2,white=0xf4f3ee,steel=0xc4c9c6;
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);o.userData.npcInteraction=false;group.add(o);reg(o,label,fn,true);return o;};
 // Pink tiles, thirty centimetres, with pale grout.
 if(typeof document!=='undefined'){
  const tiles=canvasTexture(128,128,(c,s)=>{c.fillStyle='#f3c1b8';c.fillRect(0,0,s,s);c.fillStyle='#f7d3cb';c.fillRect(6,6,s/2-12,s/2-12);c.fillRect(s/2+6,s/2+6,s/2-12,s/2-12);c.strokeStyle='#fbe7e1';c.lineWidth=5;for(const v of [0,s/2,s]){c.beginPath();c.moveTo(v,0);c.lineTo(v,s);c.stroke();c.beginPath();c.moveTo(0,v);c.lineTo(s,v);c.stroke();}});
  tiles.wrapS=tiles.wrapT=THREE.RepeatWrapping;tiles.repeat.set(w/.6,d/.6);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({map:tiles,roughness:.55}));floor.rotation.x=-Math.PI/2;floor.position.y=.002;floor.name='Clinic tiles';floor.receiveShadow=true;group.add(floor);
 }
 // The examination couch along the west wall, a paper sheet down it, and its curtain.
 const cx=-hw+.45;
 box([.7,.55,1.9],[cx,.3,-1.35],0xe3ddd2,'Examination couch');box([.66,.08,1.86],[cx,.62,-1.35],0x8fb8b0,'Couch pad');
 box([.5,.012,1.7],[cx,.67,-1.3],white,'Paper sheet');box([.5,.1,.32],[cx,.71,-2.1],white,'Couch pillow');
 collider(cx,-1.35,.75,1.95,.7);
 const rail=-hw+1.25;
 box([.03,.03,2.9],[rail,h-.12,-1.35],steel,'Curtain rail');box([1.25,.03,.03],[-hw+.62,h-.12,-2.8],steel);
 // Drawn half across: a pleated pink curtain on its hooks.
 for(let i=0;i<9;i++)box([.06,1.95,.2],[rail+(i%2?.05:-.03),h-1.16,-.95+i*.13],0xe7a6c4,'Privacy curtain');
 box([.04,.16,.04],[cx+.32,.8,-.4],steel,'Couch step rail');box([.5,.18,.35],[cx+.6,.09,-1.2],0xd8d2c4,'Step');
 // The drip stand at the head of the couch.
 box([.4,.03,.4],[-hw+1.55,.05,-2.45],steel);box([.025,1.85,.025],[-hw+1.55,.95,-2.45],steel,'Drip stand');
 box([.3,.02,.02],[-hw+1.55,1.86,-2.45],steel);box([.1,.18,.04],[-hw+1.66,1.72,-2.45],0xeaf0d8,'Drip bag');
 // The doctor's desk on the north wall: the beige monitor, the keyboard, the chart rack.
 box([2.0,.05,.7],[1.45,.74,-hd+.4],0xe9e4d8,'Doctor’s desk');for(const x of [.5,2.4])box([.06,.72,.66],[x,.37,-hd+.4],0xcfc9bc);
 box([.6,.7,.66],[2.1,.36,-hd+.4],0xd8d2c4,'Desk drawers');collider(1.45,-hd+.4,2.05,.72,.78);
 box([.42,.36,.4],[1.7,.98,-hd+.35],0xe2dccb,'Monitor');box([.34,.26,.02],[1.7,1.0,-hd+.56],0x2c4a46,'Monitor screen');box([.24,.08,.26],[1.7,.8,-hd+.36],0xe2dccb);
 box([.46,.03,.16],[1.6,.78,-hd+.72],0xd8d2c4,'Keyboard');box([.06,.03,.1],[1.98,.78,-hd+.72],0x2b2b2b,'Mouse');
 for(let i=0;i<5;i++)box([.04,.3,.24],[.75+i*.06,.92,-hd+.3],[0xe98aa6,0x7fb0d8,0xf4d23c,0x8fc88a,0xe98aa6][i],'Patient charts');
 box([.09,.11,.09],[1.1,.82,-hd+.55],0xf2efe6,'Pen pot');box([.28,.04,.2],[1.25,.78,-hd+.6],0x2b2b2b,'Stethoscope');
 // The X-ray lightbox above the desk, a chest film clipped to it.
 const film=canvasTexture(192,128,(c,W,H)=>{c.fillStyle='#e9f4f6';c.fillRect(0,0,W,H);c.fillStyle='#1d2428';c.fillRect(12,10,W/2-18,H-20);c.fillRect(W/2+6,10,W/2-18,H-20);
  c.strokeStyle='#cfd8da';c.lineWidth=3;for(let i=0;i<7;i++){c.beginPath();c.ellipse(W/4+3,28+i*12,30,6,0,Math.PI,0);c.stroke();}c.fillStyle='#7a858a';c.beginPath();c.ellipse(W/4+8,H/2+14,18,26,.3,0,Math.PI*2);c.fill();
  c.fillStyle='#3a4246';c.fillRect(W/2+20,24,W/2-46,H-48);});
 box([1.0,.7,.06],[1.45,1.75,-hd+.04],0xdedcd4,'Lightbox');
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(.9,.6),new THREE.MeshBasicMaterial({map:film}));glow.position.set(1.45,1.75,-hd+.08);glow.name='X-ray film';group.add(glow);
 // The doctor's swivel chair, and the patient's round green stool facing it.
 const chair=[1.55,-1.55];
 box([.48,.08,.48],[chair[0],.47,chair[1]],0x2a2a2a,'Doctor’s chair');box([.08,.42,.08],[chair[0],.24,chair[1]],0x5a5a5a);box([.48,.55,.08],[chair[0]+.22,.82,chair[1]],0x2a2a2a);box([.6,.04,.6],[chair[0],.04,chair[1]],0x3a3a3a);
 const stool=[.5,-1.45];
 box([.38,.07,.38],[stool[0],.46,stool[1]],0x3f9a4a,'Patient stool');box([.05,.42,.05],[stool[0],.22,stool[1]],steel);box([.36,.03,.36],[stool[0],.03,stool[1]],steel);
 // The eye chart: Landolt rings shrinking down the card.
 const eye=canvasTexture(160,320,(c,W,H)=>{c.fillStyle='#fbfaf4';c.fillRect(0,0,W,H);c.fillStyle='#111';let y=26,size=20;const gaps=[0,1.5,3,.5,2,2.5,1,3.5];
  for(let row=0;row<8;row++){const n=Math.min(5,1+row);for(let i=0;i<n;i++){const x=W/2+(i-(n-1)/2)*(size*2.6);c.lineWidth=size*.4;c.beginPath();const g=gaps[(row+i)%8]*Math.PI/2;c.arc(x,y,size*.8,g+.35,g+Math.PI*2-.35);c.strokeStyle='#111';c.stroke();}y+=size*2.3+4;size*=.72;}
  c.font='bold 12px sans-serif';c.fillText("Visual acuity chart",W/2-18,H-8);});
 box([.46,.86,.03],[-.75,1.5,-hd+.03],0xdedcd4,'Eye chart frame');
 const chart=new THREE.Mesh(new THREE.PlaneGeometry(.4,.8),new THREE.MeshStandardMaterial({map:eye,roughness:.8}));chart.position.set(-.75,1.5,-hd+.05);chart.name='Eye chart';group.add(chart);
 // The medicine cabinet by the door: white steel, glass front, rows of bottles.
 const mx=-hw+.28,mz=1.35;
 // Hollow, so the bottles show through the glass: back, sides, top and a plinth of drawers.
 box([.04,1.85,1.1],[mx-.23,.93,mz],0xecebe4,'Medicine cabinet');box([.5,.05,1.1],[mx,1.83,mz],0xecebe4);
 for(const dz of [-.53,.53])box([.5,1.85,.04],[mx,.93,mz+dz],0xecebe4);
 collider(mx,mz,.55,1.15,1.9);
 for(let s=0;s<3;s++){box([.44,.02,1.02],[mx,.95+s*.3,mz],0xd6d4cc);for(let i=0;i<6;i++)box([.08,.14+(i%2)*.05,.08],[mx-.02,1.03+s*.3+(i%2)*.025,mz-.4+i*.16],[0xf4f3ee,0xc9864a,0x7fb0d8,0xf4f3ee,0xe98aa6,0xf4f3ee][(i+s)%6]);}
 box([.03,1.05,.03],[mx+.25,1.32,mz],0xbfc4c2,'Cabinet door stile');
 const pane=new THREE.Mesh(new THREE.PlaneGeometry(1.04,1.05),new THREE.MeshPhysicalMaterial({color:0xddeef0,transparent:true,opacity:.18,roughness:.05}));pane.rotation.y=Math.PI/2;pane.position.set(mx+.25,1.32,mz);pane.name='Cabinet glass';group.add(pane);
 box([.48,.5,1.06],[mx,.27,mz],0xdcdad2,'Cabinet drawers');
 // Instrument trolley, scales and height rod, the waiting bench under the window.
 box([.5,.03,.38],[-.55,.82,-2.3],steel,'Instrument trolley');box([.5,.03,.38],[-.55,.35,-2.3],steel);for(const [dx,dz] of [[-.22,-.16],[.22,-.16],[.22,.16],[-.22,.16]])box([.02,.82,.02],[-.55+dx,.41,-2.3+dz],steel);
 box([.3,.02,.14],[-.6,.85,-2.3],0xd8dcdc,'Kidney dish');box([.18,.12,.12],[-.4,.9,-2.25],0xe8ebe6,'Steriliser');
 box([.36,.06,.36],[hw-.4,.03,2.0],0xe8ebe6,'Scales');box([.04,1.9,.04],[hw-.1,.95,2.0],0xd8d2c4,'Height rod');box([.2,.03,.12],[hw-.18,1.62,2.0],0xd8d2c4);
 box([.4,.42,1.2],[hw-.25,.21,.5],0x7fa7b8,'Waiting bench');collider(hw-.25,.5,.42,1.2,.45);
 // The hours board inside the door, and a calendar from the pharmacy in Naha.
 const hours=plate(group,"Clinic",{w:.7,h:.36,at:[1.2,1.75,hd-.03],ry:Math.PI,bg:'#f8f4ea',fg:'#c0392b',sub:"Mon–Fri 9–12 · 14–17 · Earth 9–12"});hours.name='Clinic hours';
 box([.36,.5,.02],[-1.85,1.6,-hd+.03],0xf8f4ea,'Pharmacy calendar');box([.32,.18,.02],[-1.85,1.73,-hd+.04],0x7fb0d8);
 // The doctor at her desk, turned to the patient's stool.
 let doctor=null;
 // Faces are painted on a canvas, so without a page (the room tests) she is left out.
 if(typeof document!=='undefined'&&document.createElement){
  doctor=buildAvatar(normalizeRecipe(DOCTOR_RECIPE),{shadows:true,faceSize:128});doctor.animator=createAvatarAnimator(doctor);
  const seat=new THREE.Group();seat.name=DOCTOR;seat.position.set(chair[0],0,chair[1]);seat.rotation.y=-Math.PI/2+.4;
  doctor.root.rotation.y=0;seat.add(doctor.root);group.add(seat);
 }
 anchor([stool[0],.9,stool[1]],'Sit down for a check-up',()=>action('inspect','Check-up · '+DOCTOR,"She wheels round, warms the stethoscope on her palm and listens: front, back, \"breathe in, hold it.\" Blood pressure 132 over 84. \"The salt in the champurū, Mayor, and the awamori. Walk to the lighthouse and back twice a week and come and see me after Obon.\" She writes it on a pink card and puts it in the chart rack under Yo."));
 anchor([-.75,1.4,-hd+.4],'Read the eye chart',()=>action('inspect',"Visual acuity chart · eye chart",'Rings with a gap in them, smaller row by row: say which way the gap points. You get to the sixth row before the rings close up. 1.0 in the right eye, 0.8 in the left; the reading glasses stay.'));
 anchor([1.45,1.6,-hd+.5],'Look at the X-ray',()=>action('inspect','Chest film',"Somebody's ribs on the lightbox, a name in marker on the corner tape: Oshiro. The doctor has drawn a small circle on the left lung and written old · old, nothing to worry about, with a smiling face."));
 anchor([mx+.5,1.3,mz],'Look in the medicine cabinet',()=>action('read','Medicine cabinet',"Brown bottles and white boxes behind glass, every shelf labelled in the doctor's neat katakana: Antipyretic for fevers, Stomach medicine for stomachs, the habu antivenom in the fridge underneath (two vials, checked monthly, the date on the door), seasickness tablets for the ferry, sting cream for jellyfish season, and one shelf that just says Children · children."));
 anchor([hw-.4,1,2.0],'Weigh yourself',()=>action('inspect','Scales','The needle swings and settles at 84 kilograms. The doctor, without turning round: "Shoes on, Mayor. Call it eighty-three."'));
 anchor([cx+.3,.9,-1.2],'Look at the couch',()=>action('inspect','Examination couch','Green vinyl under a roll of paper sheet, the curtain on its rail half drawn. Every child on the island has had a splinter out here, and most of the fishermen a fish hook.'));
 anchor([1.2,1.6,hd-.4],'Read the clinic hours',()=>action('read',"Minato Clinic · Minato Clinic",CLINIC_HOURS.join('\n')));
 const layout={...layoutFor(),clinic:true};
 if(doctor){const animator=doctor.animator;layout.tick=(dt)=>animator.update(Math.min(.1,dt||0),{speed:0,seated:true,seatHeight:.47,expression:'smile'});layout.tick(0);}
 return layout;
}

import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {rng,trs} from './kit.js';
import {hinpun,shisa,fukugi,potPlant} from './houses.js';
import {fishCrates,buoys,netPile,sabani} from './props.js';
import {poster,LOT_SIGNS} from './signs.js';
import {GROUND} from '../../render/ground-palette.js';
import {townCalendarAt} from '../../town-clock.js';
import {lotRect as rect,lotGround as ground,lotWalls,lotRead as read,LOT_COLOURS as C} from './lots.js';

/**
 * Kitahama's cleared plots (7, 9, 10, 11, 12, Nakasone and Miyagi), given to people who already live here
 * (see lots.js for why no lot is left as lawn). Kept apart from lots.js because the cast-and-housing consolidation
 * brief of 19 October 2026 compacts these blocks: this file and its two lines in quarters.js can be dropped whole.
 */
export const KITAHAMA_LOTS=Object.freeze([
 Object.freeze({
  id:'kitahama-net-yard',formerly:'kitahama-9',use:'net-yard',name:'The net yard',
  rect:rect(6.5,15.5,48,57),walls:Object.freeze({north:'block',south:'block',east:'block',west:'block'}),gates:Object.freeze({north:Object.freeze([[10.4,13]])}),
  owner:'the Gushiken family (in Naha since the house came down)',users:'Kōji, who crews Mr Ōshiro’s boat, from 3 Kitahama across the lane',
  why:'A boat’s nets need somewhere to dry and be mended that is not the quay, and Kōji’s gate is straight across the cross lane. The Gushikens let it to him for a box of fish at New Year.',
  hours:'Nets out on the rack after the boat is in (from 14:00); mended in the evening; the boat in the yard is Mr Ōshiro’s old sabani, waiting to be re-caulked.',
  stories:['Riku mending nets after school','the cat asleep on the net pile','the smell on a hot afternoon'],
 })
,
Object.freeze({
  id:'chinen-garden',formerly:'kitahama-7',use:'vegetable-garden',name:'Grandmother Chinen’s garden',
  rect:rect(-19.5,-9,48,57),walls:Object.freeze({north:'block',south:'block',east:'block',west:'block'}),gates:Object.freeze({north:Object.freeze([[-15.6,-14.4],[-13.65,-12.35]])}),
  owner:'Grandmother Chinen, whose house 7 Kitahama was before she moved to the ground-access home at 5',
  users:'Grandmother Chinen; Tetsuo digs it over when he comes across on the boat',
  why:'She kept the ground when the house came down and grows what an Okinawan kitchen uses: goya, papaya, sweet potato, green onion and handama. What she cannot eat goes on the honesty stand at the gate.',
  hours:'Watered at 07:00 from the drum; the stand is filled after watering and is usually empty by evening (100 yen a bag, coins in the tin).',
  stories:['the honesty stand short by 100 yen','crows and the goya','Tetsuo told to dig deeper'],
 })
,
Object.freeze({
  id:'kitahama-cane',formerly:'kitahama-11 and kitahama-12',use:'cane-field',name:'The lane’s cane',
  rect:rect(-19.5,2.5,62,71.5),walls:Object.freeze({north:null,south:null,east:null,west:null}),gates:Object.freeze({}),
  track:Object.freeze({minZ:65.9,maxZ:67.1}),
  owner:'the Iha and Kohagura families (11 and 12 Kitahama, both in Naha now)',users:'everybody on the lane: it is cut together',
  why:'Two plots side by side, too narrow for anything but a field. Cane is what island ground grows when nobody is home to garden it, and it pays the land tax.',
  hours:'Standing cane through the autumn; cut on Monday 12 January from seven (the notice board), stubble and new shoots until spring.',
  stories:['the cane cut and lunch at Sato Ramen','children chewing a stick of cane','a habu rumour in the rows'],
 })
,
Object.freeze({
  id:'tamashiro-grove',formerly:'kitahama-10',use:'fukugi-grove',name:'The Tamashiro fukugi',
  rect:rect(-32.5,-23.5,62,71.5),walls:Object.freeze({north:'coral',south:'coral',east:'coral',west:'coral'}),gates:Object.freeze({south:Object.freeze([[-28.95,-27.05]])}),
  owner:'the Tamashiro family; Mr Taira across the lane keeps the key to the well',
  users:'the lane, on hot evenings; the island’s west edge, against the wind',
  why:'The house came down but the fukugi are older than it and you do not cut a windbreak on the seaward edge of a village. The coral wall and the hinpun stay with them: taking down a hinpun is asking for trouble.',
  hours:'Shade all day; the bench is taken from about 18:00 in summer.',
  stories:['the old well and its wired lid','the hinpun nobody will move','the lane sitting out on a hot night'],
 })
,
Object.freeze({
  id:'kitahama-gateball',formerly:'nakasone and miyagi',use:'gateball',name:'Kitahama gateball ground',
  rect:rect(-19.5,2.5,75.5,87.5),walls:Object.freeze({north:null,south:null,east:null,west:null}),gates:Object.freeze({}),
  court:rect(-17.5,.5,76.5,86.5),
  owner:'the town (the two houses came down together)',users:'the Minato seniors’ gateball club',
  why:'Gateball needs flat sand and a quiet street; the club lost its court by the seawall when Harbour Park was laid out. The court is short of the rules’ 20 by 15 metres, and the club argues about it every morning.',
  hours:'Played at 07:00 every morning before it gets hot; the shelter and bench are the club’s.',
  stories:['losing to the next village since 1985','the referee who is also the loudest player','a ball in the cane'],
 }),
]);
/** Stains on the lanes the lots make (lane-edges.js lays them with its own). */
export const KITAHAMA_LOT_STAINS=Object.freeze([
 Object.freeze({x:11.8,z:58.2,r:.55,why:'water off the nets carried out of the net yard'}),
 Object.freeze({x:-13,z:58.1,r:.3,why:'earth off Grandmother Chinen’s sandals at the honesty stand'}),
 Object.freeze({x:-1.5,z:73.6,r:.4,why:'where the cane lorry stood last January'}),
]);
const kitahamaLot=id=>KITAHAMA_LOTS.find(l=>l.id===id);

/** The lane's cane, in metres, by the town's date: cut on 12 January, ratoon shoots in spring, tall from late summer. */
export function caneHeight(minutes){
 const d=townCalendarAt(minutes).date,m=d.getMonth(),day=d.getDate();
 if(m===0&&day<12)return 3;
 if(m<=2)return .35;
 return [.35,.35,.35,.8,1.3,1.8,2.3,2.7,3,3,3,3][m];
}

/** Builds the Kitahama lots into the quarter's kit; the cane is its own instanced mesh, its height by the season. */
export function buildKitahamaLots(kit,solid,{anchor,onAction,group,hourly}){
 netYard(kit,solid,kitahamaLot('kitahama-net-yard'),{anchor,onAction});
 chinenGarden(kit,solid,kitahamaLot('chinen-garden'),{anchor,onAction});
 const cane=caneField(kit,solid,kitahamaLot('kitahama-cane'),{anchor,onAction,group});
 tamashiroGrove(kit,solid,kitahamaLot('tamashiro-grove'),{anchor,onAction});
 gateball(kit,solid,kitahamaLot('kitahama-gateball'),{anchor,onAction});
 hourly?.push(minutes=>cane.season(minutes));cane.season(0);
 return {cane};
}

/* The net yard: a lean-to along the back wall, the drying rack, Mr Ōshiro's old sabani on trestles. */
function netYard(kit,solid,lot,{anchor,onAction}){
 const R=lot.rect;
 ground(kit,R,GROUND.sand,'sand');lotWalls(kit,solid,lot);
 // The lean-to on the back (north lane) wall: corrugated roof on four posts, falling to the front.
 const x0=R.minX+.4,x1=R.minX+5.6,z0=R.minZ+.2,z1=R.minZ+2.3;
 for(const x of [x0+.1,(x0+x1)/2,x1-.1]){kit.box(.08,2.05,.08,x,1.02,z1-.05,C.steel);solid(kit.rect(x-.07,x+.07,z1-.12,z1+.02,2.1,'net-yard-post'));}
 kit.box(x1-x0+.3,.04,z1-z0+.5,(x0+x1)/2,2.2,(z0+z1)/2+.1,C.roof,{rx:-.12,finish:'metal'});
 kit.box(x1-x0+.3,.08,.1,(x0+x1)/2,2.06,z1+.04,C.steel);
 // Under it: the outboard on its stand, the fuel can, rope, floats in a net bag and the crates.
 kit.box(.5,.08,.5,x0+.6,.85,z0+.6,C.timberDark);for(const dx of [-.2,.2])kit.box(.05,.85,.4,x0+.6+dx,.42,z0+.6,C.timberDark);
 kit.box(.36,.5,.42,x0+.6,1.15,z0+.62,0x2b2d2f);kit.cyl(.05,.05,.8,x0+.6,.55,z0+.92,0x3c4448,{segments:6,rx:.2});
 kit.box(.3,.4,.18,x0+1.5,.2,z0+.3,0xc8432f);
 kit.cyl(.32,.32,.16,x0+2.3,.08,z0+.55,0xd8c9a2,{segments:12});kit.cyl(.24,.24,.16,x0+2.3,.24,z0+.55,0xcbbb92,{segments:12});
 buoys(kit,x0+3.3,.1,z0+.6,{seed:311,count:7});
 solid(kit.rect(x0+.2,x0+3.8,z0,z0+1.1,1.2,'net-yard-gear'));
 solid(fishCrates(kit,x0+4.3,z0+.4,{rows:2,cols:1,height:4,seed:312}));
 // The drying rack: two posts and a bar, the nets hung over it and a heap below, green with the floats on.
 const rz=R.maxZ-2.2,ra=R.minX+.7,rb=R.minX+3.3;
 for(const x of [ra,rb]){kit.box(.1,2,.1,x,1,rz,C.timber);solid(kit.rect(x-.07,x+.07,rz-.07,rz+.07,2,'net-rack-post'));}
 kit.rod([ra,1.95,rz],[rb,1.95,rz],.04,C.timber);
 // The net hangs in narrow falls of different lengths from its float line, dark green, the orange floats along the top.
 for(let i=0,n=7;i<n;i++){const w=(rb-ra-.2)/n,x=ra+.1+w*(i+.5),len=.9+((i*5)%4)*.22,side=i%2?.05:-.05;
  kit.box(w*.96,len,.02,x,1.93-len/2,rz+side,i%3?C.net:0x24463a,{finish:'thin',rx:side*1.6});kit.sphere(.07,x,1.9,rz+side*2.2,0xe8742a,{finish:'gloss',sy:.8});}
 netPile(kit,R.minX+2,R.maxZ-3.9,{size:.8});solid(kit.rect(R.minX+.8,R.minX+3.2,R.maxZ-4.6,R.maxZ-3.2,.5,'net-pile'));
 // Mr Ōshiro's old sabani, bow to the lane, up on its blocks waiting to be re-caulked.
 solid(sabani(kit,R.maxX-1.3,(R.minZ+R.maxZ)/2+.3,{ry:-Math.PI/2,y:.45,colour:0x7f9aa8}));
 const at=kit.point(11.7,0,R.maxZ+.9);read(anchor,onAction,at.x,at.z,'Look into the net yard',lot,'The nets on the rack are the ones from Mr Ōshiro’s boat. Kōji crews it; the yard is across the lane from his gate at 3 Kitahama.');
}

/* Grandmother Chinen's garden: beds of red earth either side of a path, the goya trellis, papaya, the shed and the drum. */
function chinenGarden(kit,solid,lot,{anchor,onAction}){
 const R=lot.rect,path=[-15.6,-14.4];
 ground(kit,R,C.earth);lotWalls(kit,solid,lot);
 kit.block(path[0],path[1],.045,.055,R.minZ+.1,R.maxZ,C.coral,'sand');
 const r=rng(321);
 // West beds, across the plot: sweet potato on the mounds, green onion, handama with its purple undersides.
 for(const [i,z] of [R.minZ+2.2,R.minZ+4.2,R.minZ+6.2,R.minZ+8].entries()){
  const a=R.minX+.4,b=path[0]-.35;
  kit.block(a,b,.045,.2,z-.45,z+.45,0x7e4a32);solid(kit.rect(a,b,z-.45,z+.45,.25,'garden-bed'));
  for(let x=a+.25;x<b-.1;x+=.42){
   if(i===0){kit.sphere(.2,x,.27,z+(r.next()-.5)*.3,r.pick([0x4f8a3e,0x5c9446]),{sy:.55,detail:0});}
   else if(i===1){for(let k=0;k<4;k++)kit.cyl(.012,.018,.42,x+(k%2)*.06,.41,z-.2+k*.13,0x6fa84a,{segments:4});}
   else if(i===2){kit.sphere(.15,x,.28,z,0x6a8f45,{sy:.6,detail:0});kit.sphere(.1,x,.25,z+.12,0x6e3a6a,{sy:.5,detail:0});}
   else kit.sphere(.17,x,.29,z+(r.next()-.5)*.25,0x3f7a36,{sy:.7,detail:0});
  }
 }
 // The goya trellis over the east beds: posts, a net roof gone green, and the gourds hanging through.
 const tx0=path[1]+.45,tx1=R.maxX-.45,tz0=R.minZ+2.3,tz1=R.maxZ-1.2;
 for(const z of [tz0+.6,(tz0+tz1)/2,tz1-.6]){kit.block(tx0+.2,tx1-.2,.045,.2,z-.5,z+.5,0x7e4a32);solid(kit.rect(tx0+.2,tx1-.2,z-.5,z+.5,.25,'goya-bed'));}
 for(const x of [tx0,(tx0+tx1)/2,tx1])for(const z of [tz0,tz1]){kit.cyl(.04,.05,2,x,1,z,0x6e5a44,{segments:6});solid(kit.rect(x-.07,x+.07,z-.07,z+.07,2,'trellis-post'));}
 kit.box(tx1-tx0,.02,tz1-tz0,(tx0+tx1)/2,1.98,(tz0+tz1)/2,0x3f6b3a,{finish:'thin'});
 for(let i=0;i<30;i++)kit.sphere(.32+r.next()*.22,tx0+.3+r.next()*(tx1-tx0-.6),2.06,tz0+.3+r.next()*(tz1-tz0-.6),r.pick([0x4f8a3e,0x3f7a36,0x5c9446]),{sy:.35,detail:0});
 for(let i=0;i<14;i++)kit.sphere(.07,tx0+.5+r.next()*(tx1-tx0-1),1.7,tz0+.5+r.next()*(tz1-tz0-1),0x6fa84a,{sy:2.6,detail:1});
 // Two papaya at the back wall, fruit under the crown.
 for(const x of [tx0+.8,tx1-.6]){
  const z=R.minZ+.9;kit.cyl(.07,.1,2.6,x,1.3,z,0x8f8a6a,{segments:7});solid(kit.rect(x-.12,x+.12,z-.12,z+.12,2.6,'papaya'));
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2;kit.box(.5,.02,.9,x+Math.cos(a)*.45,2.62,z+Math.sin(a)*.45,0x4c8a3a,{ry:-a+Math.PI/2,rx:.35,finish:'thin'});}
  for(let k=0;k<4;k++)kit.sphere(.09,x+Math.cos(k*1.6)*.12,2.3,z+Math.sin(k*1.6)*.12,0x7aa84a,{sy:1.4,detail:0});
 }
 // The shed: a galvanised store with sliding doors, in the corner by the path's far end.
 const sx0=R.minX+.2,sx1=R.minX+2,sz0=R.minZ+.2,sz1=R.minZ+1.35;
 kit.block(sx0,sx1,.045,1.9,sz0,sz1,C.galv,'metal');kit.block(sx0-.05,sx1+.05,1.9,1.96,sz0-.05,sz1+.08,0x7f8a8d,'metal');
 for(const x of [sx0+.45,sx1-.45])kit.box(.84,1.6,.02,x,.95,sz1+.012,0xb9c1c3,{finish:'metal'});kit.box(.04,.12,.03,(sx0+sx1)/2+.1,1,sz1+.03,0x3c4448);
 solid(kit.rect(sx0,sx1,sz0,sz1,2,'garden-shed'));
 // The blue drum with its hose, filled from the standpipe by the path.
 const dx=path[0]-.55,dz=R.minZ+.75;
 kit.cyl(.29,.29,.88,dx,.49,dz,0x2f5a8a,{segments:12});kit.cyl(.3,.3,.04,dx,.93,dz,0x24486e,{segments:12});
 kit.cyl(.03,.03,.9,dx+.48,.5,dz-.3,C.steel,{segments:6});kit.box(.12,.05,.05,dx+.48,.95,dz-.25,0xb03a3a);
 {const g=new THREE.TorusGeometry(.22,.025,5,14);kit.add(g,trs(dx+.05,.95,dz,Math.PI/2,0,0),0x2f8a4a);g.dispose();}
 solid(kit.rect(dx-.32,dx+.56,dz-.38,dz+.32,1,'garden-drum'));
 // The honesty stand in the front wall: a shelf under a little roof, the bags of the day and the coin tin.
 const hx0=lot.gates.north[1][0],hx1=lot.gates.north[1][1],hz=R.maxZ-.25;
 for(const x of [hx0+.06,hx1-.06]){kit.box(.07,1.5,.07,x,.75,hz,C.timber);}
 kit.box(hx1-hx0,.05,.5,(hx0+hx1)/2,.78,hz,C.timber);kit.box(hx1-hx0+.2,.03,.7,(hx0+hx1)/2,1.52,hz+.05,0x8a3b2e,{rx:.15});
 for(const [i,c] of [0x7aa84a,0x8a5a8a,0x6fa84a].entries())kit.box(.22,.2,.16,hx0+.25+i*.32,.91,hz,c,{finish:'thin'});
 kit.box(.12,.1,.1,hx1-.2,.86,hz+.15,0xb9c1c3,{finish:'metal'});
 kit.sign(poster({...LOT_SIGNS.honestyStand,bg:'#f4ecd6',band:'#4f7d3e'}),.36,.5,(hx0+hx1)/2,1.18,hz+.22,{name:'Chinen garden stall sign'});
 solid(kit.rect(hx0,hx1,hz-.3,hz+.3,1.5,'honesty-stand'));
 const at=kit.point((hx0+hx1)/2,0,R.maxZ+.9);
 anchor(at.x,1.1,at.z,'Look at the honesty stand',()=>onAction?.('read','Grandmother Chinen’s honesty stand','One bag, 100 yen, coins in the tin.\n\n'+lot.why+'\n\n'+lot.hours));
}

/* The cane: rows either side of a cart track, one instanced clump, its height set by the season. */
function caneField(kit,solid,lot,{anchor,onAction,group}){
 const R=lot.rect,T=lot.track;
 ground(kit,R,C.earth);kit.block(R.minX,R.maxX,.045,.052,T.minZ,T.maxZ,C.earthDry);
 const rows=[R.minZ+.7,R.minZ+1.7,R.minZ+2.7,T.maxZ+.9,T.maxZ+1.9,T.maxZ+2.9,R.maxZ-.5],r=rng(331),dummy=new THREE.Object3D(),spots=[];
 for(const z of rows)for(let x=R.minX+.4;x<=R.maxX-.35;x+=.72)spots.push([x+(r.next()-.5)*.18,z+(r.next()-.5)*.14,r.next()]);
 const clump=caneClump(),mesh=new THREE.InstancedMesh(clump,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,side:THREE.DoubleSide}),spots.length);
 spots.forEach(([x,z,u],i)=>{dummy.position.set(x,.045,z);dummy.rotation.set(0,u*Math.PI*2,(u-.5)*.06);dummy.scale.set(.9+u*.25,.9+u*.2,.9+u*.25);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
 mesh.name='Kitahama cane';mesh.userData.walkSurface=false;mesh.castShadow=true;mesh.receiveShadow=true;
 const field=new THREE.Group();field.name='Kitahama cane field';field.add(mesh);group.add(field);
 const blocks=[kit.rect(R.minX+.1,R.maxX-.1,R.minZ+.25,T.minZ-.1,3,'cane'),kit.rect(R.minX+.1,R.maxX-.1,T.maxZ+.4,R.maxZ-.1,3,'cane')];solid(blocks);
 const at=kit.point(R.maxX+.6,0,(T.minZ+T.maxZ)/2);read(anchor,onAction,at.x,at.z,'Look along the cane',lot);
 return {field,mesh,season(minutes){const h=caneHeight(minutes);mesh.scale.y=h/3;mesh.updateMatrixWorld?.();for(const b of blocks)b.height=Math.max(.4,h);}};
}
/** One clump of cane, 3 m: eight jointed stalks and long leaves from the top third, in vertex colour. */
function caneClump(){
 const parts=[],r=rng(341),colour=new THREE.Color(),paint=(g,hex)=>{const out=g.index?g.toNonIndexed():g;out.deleteAttribute('uv');colour.set(hex);const n=out.attributes.position.count,c=new Float32Array(n*3);for(let i=0;i<n;i++)c.set([colour.r,colour.g,colour.b],i*3);out.setAttribute('color',new THREE.BufferAttribute(c,3));return out;};
 for(let i=0;i<8;i++){
  const a=i/8*Math.PI*2+r.next(),d=.05+r.next()*.1,h=2.4+r.next()*.6,lean=(r.next()-.5)*.12;
  parts.push(paint(new THREE.CylinderGeometry(.018,.024,h,5,1,true).translate(0,h/2,0).applyMatrix4(trs(Math.cos(a)*d,0,Math.sin(a)*d,lean,0,-lean)),r.next()<.5?0x8f9a52:0xa39a5a));
  for(let k=0;k<3;k++){
   const y=h*(.62+k*.13),b=a+k*2.1,len=.9+r.next()*.4;
   const leaf=new THREE.PlaneGeometry(.07,len).translate(0,len/2,0).rotateX(-1.1+r.next()*.3).rotateY(b);
   parts.push(paint(leaf.translate(Math.cos(a)*d,y,Math.sin(a)*d),k===2?0x7fb04a:r.next()<.5?0x5f9a3e:0x6ea845));
  }
 }
 const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());g.computeVertexNormals();return g;
}

/* The Tamashiro fukugi: the old coral wall and hinpun kept, a ring of windbreak trees, the well and a bench. */
function tamashiroGrove(kit,solid,lot,{anchor,onAction}){
 const R=lot.rect,cx=(R.minX+R.maxX)/2,gate=lot.gates.south[0];
 ground(kit,R,0x8f8166);lotWalls(kit,solid,lot,{height:1.25});
 for(const gx of gate)shisa(kit,gx,1.45,R.minZ,Math.PI,.7);
 solid(hinpun(kit,cx,R.minZ+1.6,2.4));
 // The fukugi round the inside of the wall, about two metres apart, with a gap behind the hinpun.
 const r=rng(351),trees=[];
 for(let z=R.minZ+.8;z<=R.maxZ-.6;z+=2.1)for(const x of [R.minX+.55,R.maxX-.55])trees.push([x,z]);
 for(let x=R.minX+2.6;x<=R.maxX-2.4;x+=2.1)trees.push([x,R.maxZ-.55]);
 for(const [x,z] of trees)solid(fukugi(kit,x,z,{h:6+r.next()*1.6,seed:360+Math.round(x*3+z*7)}));
 // The well the house drew from, lidded and wired shut, and the concrete bench in the shade.
 const wx=R.maxX-2.6,wz=R.maxZ-3;
 kit.cyl(.5,.52,.62,wx,.31,wz,0xc9c4b6,{segments:14});kit.cyl(.42,.42,.04,wx,.63,wz,C.timber,{segments:14});
 kit.rod([wx-.45,.66,wz],[wx+.45,.66,wz],.01,0x6c7476);kit.cyl(.12,.1,.2,wx+.75,.1,wz+.2,0x7a756c,{segments:8});
 solid(kit.rect(wx-.55,wx+.55,wz-.55,wz+.55,.7,'old-well'));
 const bx=R.minX+2.2,bz=R.maxZ-3.2;
 kit.box(1.6,.08,.42,bx,.44,bz,0xcfc9bb,{ry:Math.PI/2});for(const dz of [-.6,.6])kit.box(.36,.4,.12,bx,.2,bz+dz,0xb9b4a8,{ry:Math.PI/2});
 solid(kit.rect(bx-.25,bx+.25,bz-.82,bz+.82,.5,'grove-bench'));
 const at=kit.point(cx+1.5,0,R.minZ-.9);read(anchor,onAction,at.x,at.z,'Look through the Tamashiro gate',lot);
}

/* Gateball: a sand court, the white lines, three hoops and the post, the balls where the game stopped, a shelter. */
function gateball(kit,solid,lot,{anchor,onAction}){
 const R=lot.rect,G=lot.court,cx=(G.minX+G.maxX)/2,cz=(G.minZ+G.maxZ)/2,top=.047;
 ground(kit,R,GROUND.sand,'sand');
 const line=(x0,x1,z0,z1)=>kit.block(x0,x1,.045,.052,z0,z1,0xf4f1ea);
 line(G.minX,G.maxX,G.minZ,G.minZ+.06);line(G.minX,G.maxX,G.maxZ-.06,G.maxZ);line(G.minX,G.minX+.06,G.minZ,G.maxZ);line(G.maxX-.06,G.maxX,G.minZ,G.maxZ);
 for(const [x,z] of [[G.minX+3.2,G.minZ+1.6],[G.maxX-3,cz+.4],[G.minX+4.2,G.maxZ-1.4]]){
  for(const dx of [-.11,.11])kit.box(.02,.2,.02,x+dx,top+.1,z,0xf4f1ea);kit.box(.24,.02,.02,x,top+.2,z,0xf4f1ea);
  solid(kit.rect(x-.14,x+.14,z-.03,z+.03,.22,'gateball-hoop'));
 }
 kit.cyl(.02,.02,.45,cx,top+.22,cz,0xf4f1ea,{segments:5});solid(kit.rect(cx-.05,cx+.05,cz-.05,cz+.05,.47,'gateball-post'));
 for(const [i,[x,z]] of [[-12.6,78.2],[-9.9,83.6],[-5.2,80.1],[-3.7,84.7],[-14.1,85.2]].entries())kit.sphere(.04,x,top+.04,z,i%2?0xd8342c:0xf4f1ea,{detail:1});
 // The club's shelter on the west end, bench and mallets, and the slate with this morning's score.
 const sx0=R.minX+.2,sx1=R.minX+1.6,sz0=cz-3.6,sz1=cz+3.6;
 kit.block(sx0-.1,sx1+.1,2.3,2.38,sz0-.2,sz1+.2,0x8a3b2e);
 for(const z of [sz0,sz1])for(const x of [sx0+.08,sx1-.08]){kit.box(.1,2.3,.1,x,1.15,z,0x6e5a44);solid(kit.rect(x-.07,x+.07,z-.07,z+.07,2.3,'gateball-shelter-post'));}
 kit.box(.45,.08,sz1-sz0-.6,sx0+.45,.46,cz,0x9a7a55);for(const dz of [-2.4,0,2.4])kit.box(.4,.42,.08,sx0+.45,.21,cz+dz,0x5d6468);
 solid(kit.rect(sx0+.2,sx0+.7,sz0+.3,sz1-.3,.5,'gateball-bench'));
 for(let i=0;i<4;i++)kit.rod([sx1-.2,.05,cz-1.4+i*.5],[sx1-.1,.95,cz-1.5+i*.5],.02,[0xd8342c,0x2f6fb8,0xe0b93a,0xf4f1ea][i]);
 const bx=sx1+.3,bz=sz1+.9;for(const dz of [-.5,.5])kit.box(.06,1.6,.06,bx,.8,bz+dz,C.timberDark);
 kit.box(.04,.7,1.1,bx,1.2,bz,0x2c3a36);kit.sign(poster(LOT_SIGNS.gateballSlate),.36,.5,bx+.03,1.2,bz,{ry:Math.PI/2,name:'gateball slate'});
 solid(kit.rect(bx-.1,bx+.1,bz-.6,bz+.6,1.6,'gateball-slate'));
 const at=kit.point(cx,0,R.minZ-.9);read(anchor,onAction,at.x,at.z,'Watch the gateball',lot,'Five a side, mallets and numbered balls, three hoops and a post, and a referee with a whistle and a stopwatch who is somehow also the loudest player.');
}


import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js?snappy=1';

/**
 * Minato Izakaya, built rather than fetched.
 *
 * The supplied exterior was a generic bar frontage: a flat glazed box that read as an
 * office at a distance and had no eave, no lantern and nothing to tell you what was
 * behind it. This is the building the town actually wants on that plot — a two-storey
 * harbour machiya of about 1988, the kind that has the bar downstairs and the family
 * upstairs, with the frontage doing all the talking:
 *
 *   a tiled pitch with its ridge along the street and a deep eave over the pavement,
 *   koshi lattice over a warm window, a recessed doorway under a noren,
 *   three akachochin on the eave beam, a vertical kanban on the corner,
 *   and the working clutter of a bar — crates, bottle cases, a compressor, a meter.
 *
 * Every colour here is darker than the thing it stands for. This town's sun, its fill
 * and the cel grade together lift a mid tone to cream over an area this size; the
 * bookshop next door was rendered as a blank slab twice before its plaster came down
 * to 0xa79d85. Tone down, never up.
 *
 * Local frame, which is the plot's frame rotated by its yaw (see dining-layout.js):
 * +z runs out to the street, +x runs south along the pavement, y is up. The door sits
 * at local x 0 so that IZAKAYA_DOOR keeps meaning what it meant.
 */

/** The frontage line, shared with the bookshop next door, in the plot's local frame. */
export const MINATO=Object.freeze({
 width:6.7,depth:5.6,front:4.7,centreX:-.88,
 /** Ground-floor head height, wall plate, and the ridge above it. */
 groundH:3.05,upperH:5.75,ridge:7.0,
 /** The doorway, recessed behind the frontage under the noren. */
 doorWidth:1.5,doorHeight:2.1,recess:.55,
 /** How far the eave hangs out over the pavement. */
 eave:.95,
});

/** Indigo cloth with the shop's name, hung in three panels over the doorway. */
function norenTexture(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#1f2c3d';ctx.fillRect(0,0,512,256);
 // A cloth is not a flat colour: a little vertical streaking reads as dye at this size.
 ctx.globalAlpha=.16;
 for(let i=0;i<150;i++){ctx.fillStyle=i%2?'#27364a':'#18222f';const x=Math.random()*512;ctx.fillRect(x,0,2+Math.random()*4,256);}
 ctx.globalAlpha=1;
 ctx.fillStyle='#ddd2b8';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 116px serif';ctx.fillText('みなと',256,128);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/** The corner board: 居酒屋 みなと read from up the pavement, painted on dark timber. */
function kanbanTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#2b1d17';ctx.fillRect(0,0,256,1024);
 ctx.strokeStyle='#8a6a43';ctx.lineWidth=7;ctx.strokeRect(14,14,228,996);
 ctx.fillStyle='#e0bc7c';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 150px serif';
 // Vertical writing, which is how a kanban is read.
 '居酒屋'.split('').forEach((c,i)=>ctx.fillText(c,128,150+i*165));
 ctx.fillStyle='#d8534a';ctx.fillRect(58,648,140,6);
 ctx.fillStyle='#e8d6ae';ctx.font='bold 130px serif';
 'みなと'.split('').forEach((c,i)=>ctx.fillText(c,128,742+i*100));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/** Tonight's dishes, chalked up beside the door. Nobody reads it; everybody expects it. */
function menuTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=352;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#20242a';ctx.fillRect(0,0,256,352);
 ctx.fillStyle='#cfc6ad';ctx.textAlign='left';ctx.font='bold 34px serif';ctx.fillText('本日',18,44);
 ctx.font='26px serif';
 for(const [i,line] of ['やきとり  ￥180','あじフライ ￥320','冷奴    ￥200','枝豆    ￥150','生ビール  ￥400'].entries())
  ctx.fillText(line,18,96+i*46);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent the plot group, already placed and rotated
 * @param {Array} options.colliders collected in the plot's local frame; the caller
 *   rotates them into the world with restaurantCollider
 * @returns {{group:THREE.Group,lit:(open:boolean,day:number)=>void}}
 */
export function buildMinatoFacade({parent,shadows=false,anisotropy=4,colliders=[]}={}){
 const {width,depth,front,centreX,groundH,upperH,ridge,doorWidth,doorHeight,recess,eave}=MINATO;
 const back=front-depth,half=width/2,northX=centreX-half,southX=centreX+half;
 const surfaces=createMaterials({anisotropy});
 const group=new THREE.Group();group.name='Minato izakaya frontage';parent.add(group);

 const cache=new Map();
 const shade=(kind,colour,metres=2)=>{
  const key=kind+'/'+colour+'/'+metres;
  if(!cache.has(key))cache.set(key,surfaces.worldMaterial(kind,colour,metres));
  return cache.get(key);
 };
 const box=(size,position,kind,colour,metres=2)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),shade(kind,colour,metres));
  mesh.position.set(...position);mesh.castShadow=!!shadows;mesh.receiveShadow=true;
  mesh.userData.staticProp=true;group.add(mesh);return mesh;
 };
 /** Painted joinery, which has no photograph behind it and should not pick one up. */
 const paint=(colour,extra={})=>new THREE.MeshStandardMaterial({color:colour,roughness:.82,...extra});
 const painted=(size,position,colour,extra,parentGroup=group)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),paint(colour,extra));
  mesh.position.set(...position);mesh.castShadow=!!shadows;mesh.receiveShadow=true;
  mesh.userData.staticProp=true;parentGroup.add(mesh);return mesh;
 };

 // ---- shell -------------------------------------------------------------------
 box([width+.3,.2,depth+.2],[centreX,.1,(front+back)/2],'concrete',0x8c8578);
 box([width,upperH,.24],[centreX,upperH/2,back-.12],'plaster',0x7d7566);
 for(const side of [-1,1])
  box([.24,upperH,depth],[centreX+side*(half+.12),upperH/2,(front+back)/2],'plaster',0x7a7264);
 // Timber corner posts, the frame the frontage hangs off.
 for(const x of [northX,southX])box([.26,upperH,.26],[x,upperH/2,front-.13],'timber',0x3c3025);

 // ---- ground-floor frontage ----------------------------------------------------
 // The doorway is recessed, so the frontage comes forward each side of it and returns
 // back to the door plane. That shadow is most of what says "bar" from across the road.
 const doorPlane=front-recess,cheekHalf=doorWidth/2+.12;
 const bay=(fromX,toX)=>{
  const runX=Math.abs(toX-fromX),midX=(fromX+toX)/2;
  if(runX<.4)return null;
  // Sill, head and the warm pane between them.
  box([runX,.75,.3],[midX,.375,front-.15],'timber',0x4a3a2a);
  box([runX,.42,.3],[midX,groundH-.21,front-.15],'timber',0x4a3a2a);
  const paneH=groundH-.21-.21-.75/2-.375;
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(runX-.12,groundH-1.38),
   new THREE.MeshStandardMaterial({color:0x4a4034,emissive:0xd8a557,emissiveIntensity:.1,roughness:.5}));
  pane.position.set(midX,(0.75+groundH-.42)/2,front-.29);pane.userData.clearWindow=true;
  pane.userData.minatoGlow=true;group.add(pane);
  // Koshi: vertical slats across the pane, close enough to read as a screen and open
  // enough to let the light through. This is the single most recognisable thing on a
  // frontage like this, and the supplied model had none.
  const slats=Math.max(3,Math.round(runX/.17));
  for(let i=0;i<slats;i++){
   const x=fromX+(i+.5)*(toX-fromX)/slats;
   painted([.045,groundH-1.42,.05],[x,(0.75+groundH-.42)/2,front-.26],0x33291f);
  }
  // Two rails across the slats.
  for(const y of [1.12,2.24])if(y<groundH-.45)painted([runX-.12,.05,.06],[midX,y,front-.255],0x33291f);
  return {midX,runX,paneH};
 };
 bay(northX+.13,-cheekHalf);
 bay(cheekHalf,southX-.13);

 // The recess: two returns and the wall above the doorway.
 for(const side of [-1,1])
  box([.24,groundH,recess],[side*cheekHalf,groundH/2,front-recess/2],'plaster',0x6f6656);
 box([doorWidth+.5,groundH-doorHeight,recess+.02],[0,doorHeight+(groundH-doorHeight)/2,front-recess/2],'plaster',0x6f6656);
 // A threshold stone and the step up off the pavement.
 box([doorWidth+.7,.16,.75],[0,.08,front-.1],'concrete',0x8f887a);

 // The door itself: a timber-framed sliding pair with frosted glazing, standing shut.
 // It is scenery — the entrance prompt is what opens it — so it is built as one leaf
 // pair rather than something that slides.
 painted([doorWidth+.16,.14,.1],[0,doorHeight+.07,doorPlane],0x3c3025);
 for(const side of [-1,1]){
  const leaf=new THREE.Group();leaf.position.set(side*doorWidth/4,0,doorPlane);group.add(leaf);
  const frame=(size,position)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),paint(0x413324));
   m.position.set(...position);m.castShadow=!!shadows;m.userData.staticProp=true;leaf.add(m);};
  frame([doorWidth/2,doorHeight,.07],[0,doorHeight/2,0]);
  const glazing=new THREE.Mesh(new THREE.PlaneGeometry(doorWidth/2-.14,doorHeight-.3),
   new THREE.MeshStandardMaterial({color:0x5d5344,emissive:0xd8a557,emissiveIntensity:.08,roughness:.65,transparent:true,opacity:.9}));
  glazing.position.set(0,doorHeight/2,.045);glazing.userData.clearWindow=true;glazing.userData.minatoGlow=true;leaf.add(glazing);
  // A handle, at the height a hand finds it.
  frame([.05,.34,.05],[side*(doorWidth/4-.14),1.02,.07]);
 }

 // ---- the noren ----------------------------------------------------------------
 // Hung from a pole across the recess, three panels with a gap between them, so you
 // duck through it rather than walk past it. Out when the bar is open; see lit().
 const noren=new THREE.Group();noren.name='Minato noren';noren.position.set(0,0,doorPlane+.1);group.add(noren);
 painted([doorWidth+.44,.055,.055],[0,doorHeight-.06,0],0x2e2418);
 {
  const map=norenTexture();
  const cloth=new THREE.MeshStandardMaterial({map,roughness:.95,side:THREE.DoubleSide});
  const panelW=(doorWidth+.3)/3-.035;
  for(const [i,offset] of [-1,0,1].entries()){
   const panel=new THREE.Mesh(new THREE.PlaneGeometry(panelW,.62),cloth);
   panel.position.set(offset*(panelW+.035),doorHeight-.39,0);
   // A cloth hangs from a pole, so it is not flat: each panel leans out a little.
   panel.rotation.x=-.05-i%2*.02;
   panel.userData.staticProp=true;noren.add(panel);
   const uv=panel.geometry.attributes.uv;
   for(let v=0;v<uv.count;v++)uv.setX(v,(uv.getX(v)+i)/3);
   uv.needsUpdate=true;
  }
 }

 // ---- the eave ------------------------------------------------------------------
 // The line that makes the building. It carries the lanterns and it puts the whole
 // frontage in shade, which is how a bar front reads warm at four in the afternoon.
 const eaveY=groundH+.12;
 box([width+.5,.14,eave+.3],[centreX,eaveY,front+eave/2-.15],'timber',0x473726);
 {
  const shape=new THREE.Shape();
  shape.moveTo(0,0);shape.lineTo(eave+.34,-.46);shape.lineTo(eave+.34,-.58);shape.lineTo(0,-.12);shape.closePath();
  const tiles=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:width+.5,bevelEnabled:false}),
   shade('roof',0x6d736c));
  tiles.rotation.y=Math.PI/2;tiles.position.set(northX-.25,eaveY+.2,front-.15);
  tiles.castShadow=!!shadows;tiles.receiveShadow=true;tiles.userData.staticProp=true;group.add(tiles);
 }
 // Rafter ends under it, which is the detail that stops the eave looking like a shelf.
 for(let x=northX;x<=southX;x+=.52)painted([.07,.1,eave+.2],[x,eaveY-.12,front+eave/2-.1],0x3d2f21);

 // ---- second storey and roof -----------------------------------------------------
 box([width,upperH-eaveY-.14,.26],[centreX,(upperH+eaveY+.14)/2,front-.13],'plaster',0x837a69);
 // Two lattice windows over the street, the flat's own.
 for(const x of [centreX-1.55,centreX+1.55]){
  box([1.62,.16,.3],[x,upperH-1.62,front-.14],'timber',0x4a3a2a);
  box([1.62,.16,.3],[x,upperH-.36,front-.14],'timber',0x4a3a2a);
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.1),
   new THREE.MeshStandardMaterial({color:0x4b4336,emissive:0xd0a35e,emissiveIntensity:.06,roughness:.55}));
  pane.position.set(x,upperH-.99,front-.27);pane.userData.clearWindow=true;pane.userData.minatoGlow=true;group.add(pane);
  for(let i=0;i<7;i++)painted([.04,1.06,.05],[x-.66+i*.22,upperH-.99,front-.25],0x362b20);
  painted([1.5,.05,.06],[x,upperH-.99,front-.245],0x362b20);
 }
 // The main pitch, ridge along the street, eaves front and back: a machiya, not a hut
 // with a gable pointed at the road.
 {
  const shape=new THREE.Shape();
  shape.moveTo(front+.42,0);shape.lineTo((front+back)/2,ridge-upperH);shape.lineTo(back-.42,0);
  shape.lineTo(back-.42,-.24);shape.lineTo((front+back)/2,ridge-upperH-.24);shape.lineTo(front+.42,-.24);shape.closePath();
  const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:width+.44,bevelEnabled:false}),
   shade('roof',0x69706a));
  roof.rotation.y=-Math.PI/2;roof.position.set(southX+.22,upperH,0);
  roof.castShadow=!!shadows;roof.receiveShadow=true;roof.userData.staticProp=true;group.add(roof);
  // A ridge cap, because a bare fold reads as paper.
  painted([width+.5,.2,.34],[centreX,ridge-.06,(front+back)/2],0x5b615b,{roughness:.9});
 }

 // ---- lanterns --------------------------------------------------------------------
 // Three akachochin on the eave beam. They are the reason you can find the place after
 // dark from the far end of the pavement.
 const lanterns=[];
 for(const [i,x] of [centreX-1.9,centreX,centreX+1.9].entries()){
  const hang=new THREE.Group();hang.position.set(x,eaveY-.2,front+.46);group.add(hang);
  painted([.03,.22,.03],[0,-.11,0],0x2b231a,undefined,hang);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.44,12,1,true),
   new THREE.MeshStandardMaterial({color:0x9c3730,emissive:0xd8562e,emissiveIntensity:0,roughness:.9,side:THREE.DoubleSide}));
  // The clock changes this material; a static batch would freeze a cloned copy.
  body.position.y=-.45;body.userData.dynamicProp=true;hang.add(body);
  lanterns.push(body);
  for(const y of [-.24,-.66])painted([.38,.035,.38],[0,y,0],0x241c14,undefined,hang);
  hang.rotation.z=(i-1)*.015;
 }

 // ---- kanban, menu and the clutter of a working bar ---------------------------------
 {
  const map=kanbanTexture();
  const board=new THREE.Mesh(new THREE.BoxGeometry(.1,2.3,.58),
   [paint(0x2b1d17),paint(0x2b1d17),paint(0x2b1d17),paint(0x2b1d17),
    new THREE.MeshStandardMaterial({map,emissiveMap:map,emissive:0xffffff,emissiveIntensity:0,roughness:.85}),
    paint(0x2b1d17)]);
  board.position.set(southX+.2,2.05,front+.34);board.castShadow=!!shadows;board.userData.staticProp=true;group.add(board);
  board.userData.minatoSign=true;lanterns.push(board);
  painted([.09,2.2,.09],[southX+.2,1.1,front+.62],0x33281d);
 }
 {
  const map=menuTexture();
  const menu=new THREE.Mesh(new THREE.PlaneGeometry(.52,.72),new THREE.MeshStandardMaterial({map,roughness:.9}));
  menu.position.set(cheekHalf+.36,1.42,front+.02);menu.userData.staticProp=true;group.add(menu);
 }
 // Beer crates by the north cheek, stacked the way an empties stack actually is.
 for(const [i,[x,y,z,turn]] of [[-2.35,.16,front+.34,.05],[-2.3,.48,front+.32,-.09],[-1.9,.16,front+.4,.22]].entries()){
  const crate=painted([.44,.3,.34],[x,y,z],i%2?0x5c4a33:0x4d3f2d);crate.rotation.y=turn;
 }
 // A bottle case, and two bottles that never made it back into it.
 painted([.4,.26,.3],[-2.72,.13,front+.3],0x3e5044).rotation.y=-.14;
 for(const [x,z] of [[-2.62,front+.56],[-2.44,front+.52]]){
  const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.037,.041,.26,7),paint(0x3b4a2c,{roughness:.45}));
  bottle.position.set(x,.13,z);bottle.userData.staticProp=true;group.add(bottle);
 }
 // The compressor and the meter box on the south flank, which is what 1988 looks like.
 painted([.62,.5,.3],[southX+.14,1.05,front-1.5],0x7b7669,{roughness:.7});
 painted([.3,.38,.24],[southX+.14,1.75,front-2.35],0x8a8578);

 // ---- collision ----------------------------------------------------------------
 // The walls stop you and the recess does not, so the doorway stays a doorway. These
 // are in the plot's local frame; the caller rotates them.
 colliders.push(
  // The two halves of the building, each side of the doorway.
  {x:(northX-cheekHalf)/2,z:(front+back)/2,w:-cheekHalf-northX,d:depth,height:upperH},
  {x:(southX+cheekHalf)/2,z:(front+back)/2,w:southX-cheekHalf,d:depth,height:upperH},
  // Behind the recessed door: the doorway is scenery, and you stop at the leaf.
  {x:0,z:doorPlane-.12,w:doorWidth+.3,d:.24,height:doorHeight},
  // The crates and the kanban post, which are things in the street.
  {x:-2.3,z:front+.36,w:1.1,d:.5,height:.8},
  {x:southX+.2,z:front+.48,w:.34,d:.5,height:2.3},
 );

 /**
  * The frontage after dark and when the bar is open.
  * @param {boolean} open whether Nao has the place running
  * @param {number} day 1 at noon, 0 at night
  * @param {number} [lantern] paper-lantern glow 0–1 from the dusk clock; falls back to 1−day
  */
 const lit=(open,day,lantern)=>{
  const dusk=1-THREE.MathUtils.clamp(day,0,1);
  const paper=lantern==null?dusk:THREE.MathUtils.clamp(lantern,0,1);
  const glow=open?.12+dusk*.95:dusk*.06;
  group.traverse(o=>{if(o.userData.minatoGlow)o.material.emissiveIntensity=glow;});
  const lanternI=open?.35+paper*1.35:0;
  for(const item of lanterns){
   const mat=Array.isArray(item.material)?item.material[4]:item.material;
   if(mat)mat.emissiveIntensity=lanternI;
  }
  noren.visible=open;
 };
 lit(false,1);
 return {group,noren,lanterns,lit};
}

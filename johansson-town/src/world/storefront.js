import {createShopGlass} from './shop-glass.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import * as THREE from '../../vendor/three.module.js';
import {localToWorld} from './landmark-lots.js';
// Original Sakura shopfront: a lit glass frontage and real shelf silhouettes behind it.

/** How tall the sliding door is. The valance over it has to clear this. */
const DOOR_HEIGHT=2.25;
/**
 * @param {object} options
 * @param {{width:number,depth:number,doorX:number}} [options.span] how big the shop is
 *   and where its door is, in metres. The default is the frontage the canal-quarter lot
 *   was cut for. The harbour street asks for one the size of the supplied interior, so
 *   what you see through the glass is the shop you walk into rather than a smaller copy
 *   of it — see WINDOW_FIT in sakura-shop.js.
 */
export function buildStorefront({parent,site,register,enter,label,placement,span}){
 const width=span?.width??10,depth=span?.depth??8.2,doorX=span?.doorX??-2.5;
 const half=width/2,mid=-depth/2,back=-depth;
 const x=placement?.x??site.side*7.55,z=placement?.z??site.z;
 const yaw=placement?.yaw??-site.side*Math.PI/2,scale=placement?.scale??1;
 const sx=scale.x??scale,sy=scale.y??scale,sz=scale.z??scale;
 const group=new THREE.Group();group.name='Sakura glass storefront';group.position.set(x,0,z);group.rotation.y=yaw;group.scale.set(sx,sy,sz);parent.add(group);
 const surfaces=createMaterials(),materials=new Map();function box(size,pos,color,kind=null){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.67}));const o=new THREE.Mesh(new THREE.BoxGeometry(...size),kind?surfaces.material(kind,color):materials.get(color));o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;o.userData.staticProp=true;group.add(o);return o;}
 box([width,.18,depth],[0,.09,mid],0xdad9c8,'plaster');box([width,3.7,.18],[0,1.85,back-.09],0xeee7d1,'plaster');
 for(const wall of [-1,1])box([.18,3.8,depth],[wall*(half+.09),1.9,mid],0xd9d7c9,'plaster');
 box([width+.5,.22,depth+.5],[0,3.9,mid],0xd5d0bd);box([width+.3,.8,.45],[0,3.25,.12],0xb84e45);
 for(const y of [2.88,3.61])box([width+.32,.10,.49],[0,y,.13],0xf5d791);
 const logo=new THREE.Object3D();logo.position.set(0,3.24,.38);group.add(logo);group.updateMatrixWorld(true);site.streetFrontage={position:group.localToWorld(new THREE.Vector3(0,.12,.32)).toArray(),yaw};const wp=logo.getWorldPosition(new THREE.Vector3());label('桜商店','SAKURA · FOOD & DAILY GOODS',wp.toArray(),Math.min(width*.6,8.4)*sx,.62*sy,yaw,'#f6e8bb','#a6333c');
 const glazing=createShopGlass();
 // Glass to either side of the doorway, whatever the frontage is: a pane list authored
 // for a ten-metre shop leaves a wall of nothing when the shop is fourteen.
 const DOOR=1.9,JAMB=.15,panes=[[doorX,DOOR]];
 for(const side of [-1,1]){
  const outer=side*(half-JAMB),inner=doorX+side*DOOR/2,run=Math.abs(outer-inner);
  if(run>.7)panes.push([(outer+inner)/2,run]);
 }
 for(const [lx,paneWidth] of panes){const pane=new THREE.Mesh(new THREE.PlaneGeometry(paneWidth,2.55),glazing);pane.position.set(lx,1.5,.02);pane.name='Sakura clear window pane';pane.userData.clearWindow=true;group.add(pane);for(const edge of [-1,1])box([.065,2.75,.09],[lx+edge*paneWidth/2,1.47,.055],0x879692);box([paneWidth,.08,.09],[lx,.15,.055],0x879692);}
 box([width,.1,.1],[0,2.82,.05],0x84938d);for(const lx of [doorX-.4,doorX+.4])box([.035,.5,.12],[lx,1.4,.12],0x465854);
 const cylinder=new THREE.CylinderGeometry(1,1,1,10);
 function round(radius,height,pos,color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.55}));const m=new THREE.Mesh(cylinder,materials.get(color));m.scale.set(radius,height,radius);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;m.userData.staticProp=true;group.add(m);return m;}
 // Stand-in shelves, for when the real interior has not arrived yet. They read as a
 // shop at street distance, but they are not the shop you walk into, so they are
 // grouped on their own and hidden the moment the supplied interior is in place.
 const standIn=new THREE.Group();standIn.name='Sakura stand-in fittings';group.add(standIn);
 const keep=object=>{standIn.add(object);return object;};
 // Everything here is measured off the frontage rather than written down, because the
 // frontage is not one size any more: the canal lot is ten metres and the harbour shop
 // is fourteen. The numbers below were authored for the ten, and at fourteen they left
 // the shelves huddled in one corner with four metres of lit, empty floor beside them —
 // which from the pavement reads as a shop that has been cleared out.
 const runFrom=doorX+DOOR/2+.4,runTo=half-1.1,runWidth=Math.max(2.6,runTo-runFrom),runX=(runFrom+runTo)/2;
 const bottles=Math.max(4,Math.round(runWidth/.52)),pitch=runWidth/bottles;
 const shelfZ=-depth*.244,frontZ=shelfZ+.35,goodsZ=shelfZ+.18;
 for(const [row,y] of [.48,1.22,1.96].entries()){
  keep(box([runWidth,.055,.65],[runX,y,shelfZ],0xdcdcc9));keep(box([runWidth,.07,.045],[runX,y,frontZ],0xb84e45));
  for(let n=0;n<bottles;n++){
   const x=runFrom+(n+.5)*pitch,z=goodsZ,color=[0x477454,0xb65241,0xd8b56e][row];
   if(row===0){keep(round(.13,.30,[x,y+.18,z],color));for(const dy of [.035,.335])keep(round(.134,.023,[x,y+dy,z],0xc9ccbf));keep(round(.133,.10,[x,y+.19,z],0xf2e4c3));}
   else if(row===1){keep(round(.115,.30,[x,y+.18,z],color));keep(round(.057,.15,[x,y+.395,z],color));keep(round(.060,.045,[x,y+.485,z],0xe7d4a8));keep(round(.118,.11,[x,y+.19,z],0xf2e4c3));}
   else{keep(box([.30,.36,.25],[x,y+.21,z],color));keep(box([.27,.13,.01],[x,y+.23,z+.13],0xf2e4c3));keep(box([.12,.04,.25],[x,y+.41,z],0xe7d4a8));}
  }
 }
 // Two strips, spread over the floor they light rather than over the floor a smaller
 // shop used to have, and long enough to reach the back of this one.
 for(const lx of [doorX-.3,runX+.55])
  {const light=box([.45,.06,depth*.34],[lx,3.64,-depth*.28],0xfff6d4);light.material=light.material.clone();light.material.emissive.set(0xfff3c6);light.material.emissiveIntensity=.8;}
 // The counter, on the door's side of the shop where the till goes.
 const tillX=(-half+1.1+doorX-DOOR/2-.4)/2;
 keep(box([Math.max(1.6,doorX-DOOR/2-.4-(-half+1.1)),1.0,.8],[tillX,.5,shelfZ-.6],0xc4ac84,'bamboo'));
 keep(box([.55,.35,.45],[tillX,1.18,shelfZ-.55],0xe1d8bb));
 const mat=box([1.7,.035,.8],[doorX,.21,.55],0x777064);mat.userData.storeEntrance=true;
 const flag=box([.06,2.4,.42],[half+.05,2.15,.22],0xb84e45);flag.userData.banner=true;
 // Clear of the doorway. It used to hang from 1.08 to 2.63, straight across the
 // opening, so anybody standing in the door was cut off at the waist by a curtain —
 // which you saw from the pavement as a customer with no upper half. A shop with an
 // automatic door hangs a short valance over the head of it instead.
 hangNoren(group,doorX,DOOR_HEIGHT+.26,.09);
 // The back of house. It was never seen while the shop stood in an invisible box with
 // only its frontage on walkable ground; now that you can walk round it, a blank wall
 // the size of the building is the thing you notice.
 if(span){
  // Everything here is dark for its own good: under this town's sun a mid grey renders
  // as cream, and a fitting the colour of the wall it is bolted to is not a fitting.
  const wall=back-.19,door=.9;
  box([1.32,2.32,.1],[door,1.16,wall+.02],0x6b6154);             // door surround
  box([1.05,2.1,.12],[door,1.05,wall-.03],0x42514a);             // the stockroom door
  box([.1,.05,.06],[door+.38,1.0,wall-.11],0xb9b2a0);            // its handle
  box([.1,2.9,.14],[door-1.5,1.45,wall-.06],0x5b5548);           // downpipe
  box([.66,.8,.32],[door-2.5,1.42,wall-.17],0x7a7164);           // meter cupboard
  box([.58,.1,.34],[door-2.5,1.84,wall-.18],0x5d564a);           // its lid
  box([1.2,.86,.5],[-half+2.8,2.3,wall-.26],0x6d736d);           // extractor
  for(const y of [2.12,2.3,2.48])box([1.0,.06,.54],[-half+2.8,y,wall-.3],0x4a4f4a);
  for(const [i,lx] of [-half+4.9,-half+5.8,half-3.1].entries()){
   const h=.44+(i%2)*.2;
   box([.78,h,.62],[lx,h/2,wall-.44],[0x7d5f3f,0x5b6650,0x7a4f45][i%3]);
  }
  box([.9,.06,.7],[half-4.4,.03,wall-.52],0x5d5a50);             // a pallet, flat
 }
 site.standInFittings=standIn;
 const [ax,az]=localToWorld(x,z,yaw,scale,doorX,.85);
 const anchor=new THREE.Object3D();anchor.position.set(ax,1.2,az);parent.add(anchor);register?.(anchor,'Enter '+site.title,()=>enter(site));
 const door=buildSlidingDoor({group,doorX,width:DOOR,glazing,box});
 site.shopDoor=door;
 // Where you stand to come in, and which way you are facing when you do. The shopfront
 // faces along its own +z, so the placement yaw is the heading of somebody walking in
 // through it — which is what carries a heading across the threshold.
 site.entryFacing=yaw;
 site.approachPosition=[door.mat.x,0,door.mat.z];
 return Object.assign(group,{shopDoor:door});
}

/**
 * The doorway, which was a gap.
 *
 * A konbini's door is automatic, and the whole point of the thing is that it moves:
 * people were walking up to a hole in the frontage and being gone. Two leaves part
 * when anybody comes up to the mat — the player, Thuan, a customer, it does not ask —
 * and slide back once they are through, so you can watch somebody use the door
 * instead of arriving at where a door would be.
 *
 * The leaves stop short of the jambs by a hand's width, the way they do when they are
 * parked against the glass rather than pocketed into the wall.
 */
function buildSlidingDoor({group,doorX,width,glazing,box}){
 const HEIGHT=DOOR_HEIGHT,TRAVEL=width/2-.12,leaves=[];
 const rail=box([width+.26,.1,.16],[doorX,HEIGHT+.06,.02],0x879692);rail.userData.staticProp=true;
 for(const side of [-1,1]){
  const leaf=new THREE.Group();leaf.position.set(doorX+side*width/4,0,.02);group.add(leaf);
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(width/2-.06,HEIGHT-.28),glazing);
  pane.position.set(0,HEIGHT/2-.06,0);pane.name='Sakura door pane';pane.userData.clearWindow=true;leaf.add(pane);
  // The frame, in four pieces, so the leaf reads as a leaf edge-on as well as flat.
  const stile=(lx)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.06,HEIGHT,.07),
   new THREE.MeshStandardMaterial({color:0x879692,roughness:.5}));m.position.set(lx,HEIGHT/2,0);m.castShadow=true;leaf.add(m);return m;};
  stile(-(width/4-.03));stile(width/4-.03);
  for(const y of [.04,HEIGHT-.04]){
   const m=new THREE.Mesh(new THREE.BoxGeometry(width/2,.08,.07),new THREE.MeshStandardMaterial({color:0x879692,roughness:.5}));
   m.position.set(0,y,0);m.castShadow=true;leaf.add(m);
  }
  // The handle bar, which is the part you actually look at from the pavement.
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.035,.62,.035),new THREE.MeshStandardMaterial({color:0x465854,roughness:.6}));
  bar.position.set(side*-(width/4-.16),1.06,.06);leaf.add(bar);
  leaves.push({leaf,side,home:leaf.position.x});
 }
 // Where the mat is, in the town's own coordinates, so a person's position can be
 // compared with it without anybody having to know how the shop is placed.
 group.updateMatrixWorld(true);
 const mat=group.localToWorld(new THREE.Vector3(doorX,0,.55));
 let amount=0;
 return {
  group,mat,
  get amount(){return amount;},
  /**
   * @param {number} dt
   * @param {Array<{x:number,z:number}>} bodies everyone who could open it.
   */
  update(dt,bodies){
   if(!(dt>0))return;
   let near=false;
   for(const b of bodies||[]){
    const bx=b?.x??b?.position?.x,bz=b?.z??b?.position?.z;
    if(!Number.isFinite(bx)||!Number.isFinite(bz))continue;
    if((bx-mat.x)**2+(bz-mat.z)**2<2.9*2.9){near=true;break;}
   }
   // Opens briskly and closes slowly, which is how they behave and how you notice them.
   const target=near?1:0,rate=near?4.2:1.9;
   amount+=Math.max(-rate*dt,Math.min(rate*dt,target-amount));
   amount=Math.max(0,Math.min(1,amount));
   for(const {leaf,side,home} of leaves)leaf.position.x=home+side*TRAVEL*amount;
  },
 };
}

function hangNoren(group,x,y,z){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=144;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#6f1f2c';ctx.fillRect(0,0,512,144);
 ctx.fillStyle='#f4e4c8';ctx.fillRect(8,10,496,124);
 ctx.fillStyle='#6f1f2c';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='700 74px serif';ctx.fillText('桜商店',256,66);
 ctx.font='600 22px sans-serif';ctx.fillText('SAKURA SHŌTEN',256,116);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.0,.56),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));
 mesh.position.set(x,y,z);mesh.userData.banner=true;group.add(mesh);
}

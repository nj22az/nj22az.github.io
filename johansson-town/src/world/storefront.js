import {createShopGlass} from './shop-glass.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import * as THREE from '../../vendor/three.module.js';
import {localToWorld} from './landmark-lots.js';
// Original Sakura shopfront: a lit glass frontage and real shelf silhouettes behind it.
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
 for(const [row,y] of [.48,1.22,1.96].entries()){
  keep(box([5.8,.055,.65],[1.25,y,-2.0],0xdcdcc9));keep(box([5.8,.07,.045],[1.25,y,-1.65],0xb84e45));
  for(let n=0;n<10;n++){
   const x=-1.2+n*.52,z=-1.82,color=[0x477454,0xb65241,0xd8b56e][row];
   if(row===0){keep(round(.13,.30,[x,y+.18,z],color));for(const dy of [.035,.335])keep(round(.134,.023,[x,y+dy,z],0xc9ccbf));keep(round(.133,.10,[x,y+.19,z],0xf2e4c3));}
   else if(row===1){keep(round(.115,.30,[x,y+.18,z],color));keep(round(.057,.15,[x,y+.395,z],color));keep(round(.060,.045,[x,y+.485,z],0xe7d4a8));keep(round(.118,.11,[x,y+.19,z],0xf2e4c3));}
   else{keep(box([.30,.36,.25],[x,y+.21,z],color));keep(box([.27,.13,.01],[x,y+.23,z+.13],0xf2e4c3));keep(box([.12,.04,.25],[x,y+.41,z],0xe7d4a8));}
  }
 }
 for(const lx of [-2.8,1.8]){const light=box([.45,.06,2.8],[lx,3.64,-2.3],0xfff6d4);light.material=light.material.clone();light.material.emissive.set(0xfff3c6);light.material.emissiveIntensity=.8;}
 keep(box([2.0,1.0,.8],[-3.0,.5,-2.6],0xc4ac84,'bamboo'));keep(box([.55,.35,.45],[-3,1.18,-2.55],0xe1d8bb));
 const mat=box([1.7,.035,.8],[doorX,.21,.55],0x777064);mat.userData.storeEntrance=true;
 const flag=box([.06,2.4,.42],[half+.05,2.15,.22],0xb84e45);flag.userData.banner=true;
 hangNoren(group,doorX,1.85,.07);
 site.standInFittings=standIn;
 const [ax,az]=localToWorld(x,z,yaw,scale,doorX,.85);
 const anchor=new THREE.Object3D();anchor.position.set(ax,1.2,az);parent.add(anchor);register?.(anchor,'Enter '+site.title,()=>enter(site));
 return group;
}

function hangNoren(group,x,y,z){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#6f1f2c';ctx.fillRect(0,0,256,320);
 ctx.fillStyle='#f4e4c8';ctx.fillRect(6,0,116,300);ctx.fillRect(134,0,116,300);
 ctx.fillStyle='#6f1f2c';ctx.textAlign='center';ctx.font='700 64px sans-serif';
 ctx.fillText('桜',64,130);ctx.fillText('店',192,130);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.55),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));
 mesh.position.set(x,y,z);mesh.userData.banner=true;group.add(mesh);
}

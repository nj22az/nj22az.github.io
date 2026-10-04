import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {SAKURA_SHELVES} from './sakura-layout.js';

/**
 * The edges of Sakura's shelves, the way a konbini dresses them.
 *
 * - A price channel along the lip of every board: a cream strip with a red top line,
 *   which the shelf's price tags (store-advertising.js) sit in. One merged mesh.
 * - Shelf talkers: small cards on a stalk standing out into the aisle at a few boards,
 *   so you see them looking down the aisle rather than face on. One merged mesh.
 *
 * Fridges carry their own strips (shop-refrigerator.js) and are left alone.
 */
const TALKERS=Object.freeze([
 ['NEW!','#d7263d','#ffffff'],['Popular','#ffcf3f','#3b2a1a'],['¥10 off','#2a8fcc','#ffffff'],['Limited','#f06ba8','#ffffff'],
]);
/** Which boards carry a talker: one in a few, chosen so no aisle has two side by side. */
const TALKER_AT=Object.freeze({chips:[0,0],noodles:[1,2],chocolate:[2,0],soap:[3,0],curry:[0,0],pudding:[1,1],battery:[2,0]});

function colourise(geometry,hex){
 const c=new THREE.Color(hex),a=new Float32Array(geometry.attributes.position.count*3);
 for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);geometry.setAttribute('color',new THREE.BufferAttribute(a,3));return geometry;
}
function talkerTexture(){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
 TALKERS.forEach(([text,bg,ink],i)=>{
  const x=i*128;ctx.fillStyle=bg;ctx.beginPath();ctx.arc(x+64,64,60,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=ink;ctx.font=`bold ${text.length>5?24:34}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+64,64,112);
 });
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function buildShelfEdges(room){
 const rails=[],cards=[];
 for(const [id,shelf] of Object.entries(SAKURA_SHELVES)){
  if(!shelf.width||shelf.fridge!=null)continue;
  const front=new THREE.Vector3(Math.sin(shelf.yaw),0,Math.cos(shelf.yaw)),along=new THREE.Vector3(Math.cos(shelf.yaw),0,-Math.sin(shelf.yaw));
  for(const [i,level] of shelf.levels.entries()){
   const put=(g,dx,dy,depth)=>{g.rotateY(shelf.yaw);g.translate(shelf.x+front.x*depth+along.x*dx,level+dy,shelf.z+front.z*depth+along.z*dx);return g;};
   rails.push(colourise(put(new THREE.BoxGeometry(shelf.width,.034,.012),0,-.024,.112),0xf7f1e1));
   rails.push(colourise(put(new THREE.BoxGeometry(shelf.width,.006,.014),0,-.006,.113),0xc8342d));
   const talker=TALKER_AT[id];
   if(talker&&talker[1]===i){
    // A card on a clear stalk at the end of the board, edge on to the shelf front.
    // Two cards back to back, so it reads the right way round from either end of the aisle.
    for(const side of [1,-1]){
     const kind=talker[0],g=new THREE.PlaneGeometry(.12,.12),uv=g.attributes.uv;
     for(let j=0;j<uv.count;j++)uv.setX(j,(kind+uv.getX(j))/TALKERS.length);
     g.rotateY(side*Math.PI/2);g.translate(side*.002,0,0);cards.push(put(g,shelf.width/2-.25,.07,.2));
    }
   }
  }
 }
 const group=new THREE.Group();group.name='Sakura shelf edges';room.add(group);
 if(rails.length){
  const mesh=new THREE.Mesh(mergeGeometries(rails),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}));
  mesh.name='Sakura price channels';group.add(mesh);
 }
 if(cards.length){
  const mesh=new THREE.Mesh(mergeGeometries(cards),new THREE.MeshBasicMaterial({map:talkerTexture(),transparent:true,alphaTest:.5,toneMapped:false}));
  mesh.name='Sakura shelf talkers';group.add(mesh);
 }
 [...rails,...cards].forEach(g=>g.dispose());
 return group;
}

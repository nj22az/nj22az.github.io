import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';

// Fixed layout and shelf datums; surface history is authored, never a random scatter.
export function buildSakuraGondolaDetail(parent){
 const group=new THREE.Group();group.name='Sakura constructed gondolas';parent.add(group);
 const batches=new Map();
 const woodCanvas=document.createElement('canvas');woodCanvas.width=128;woodCanvas.height=512;const c=woodCanvas.getContext('2d');c.fillStyle='#c3aa82';c.fillRect(0,0,128,512);
 for(let k=0;k<48;k++){c.strokeStyle=k%3?'rgba(114,88,53,.10)':'rgba(245,229,195,.16)';c.lineWidth=k%5===0?2:1;c.beginPath();c.moveTo(k*2.8,0);c.bezierCurveTo(k*2.8+3,170,k*2.8-4,340,k*2.8,512);c.stroke();}
 const grain=new THREE.CanvasTexture(woodCanvas);grain.colorSpace=THREE.SRGBColorSpace;
 const mats={paint:new THREE.MeshStandardMaterial({color:0xe6e2d3,roughness:.66,metalness:.08}),back:new THREE.MeshStandardMaterial({color:0xe9e4d5,roughness:.82}),timber:new THREE.MeshStandardMaterial({map:grain,roughness:.68}),steel:new THREE.MeshStandardMaterial({color:0x8c9690,roughness:.4,metalness:.65}),slot:new THREE.MeshStandardMaterial({color:0x68736b,roughness:.8}),wear:new THREE.MeshStandardMaterial({color:0xb3b5a7,roughness:.8}),pet:new THREE.MeshStandardMaterial({color:0xe6f3f0,transparent:true,opacity:.16,roughness:.25,depthWrite:false})};
 function box(x,d,w,depth,h,y,kind){const g=new THREE.BoxGeometry(w,h,depth);g.translate(x+w/2,y+h/2,-d-depth/2);if(!batches.has(kind))batches.set(kind,[]);batches.get(kind).push(g);}
 const tops=[.344,.664,.984];
 for(const x of [1.85,3.8,5.75]){
  // 12 mm laminate-faced hardboard backs; upright flanges retain the panels.
  for(let bay=0;bay<4;bay++)box(x+.444,2.85+bay*.9+.016,.012,.868,1.20,.14,'back');
  for(let bay=0;bay<=4;bay++){
   const d=2.85+bay*.9;box(x+.42,d-.018,.06,.036,1.35,0,'paint');
   for(let y=.18;y<1.31;y+=.05)for(const side of [-1,1])box(x+(side<0?.418:.48),d-.004,.002,.008,.018,y,'slot');
   for(const side of [0,.50])for(const top of tops){
    // Under-deck bracket flanges, clear of stock; no unsupported thick slabs.
    box(x+(side===0?.04:.48),d-.012,.38,.024,.021,top-.022,'steel');box(x+(side===0?.12:.48),d-.012,.30,.024,.018,top-.040,'steel');
   }
   for(const dx of [.075,.795])box(x+dx,d-.025,.03,.05,.038,0,'steel');
  }
  // Steel plinth and base deck, with a recessed kick-space and distinct folded rim.
  box(x+.035,2.43,.83,4.44,.102,.025,'paint');box(x,2.4,.9,4.5,.013,.127,'paint');
  for(const top of tops){
   for(let bay=0;bay<4;bay++)for(const side of [0,.5]){
    const d=2.85+bay*.9;
    box(x+side,d+.002,.40,.896,.002,top-.002,'paint');
    const front=x+(side===0?0:.887);box(front,d+.002,.013,.896,.018,top-.020,'paint');
    // Clear PET retaining strip follows the metal lip, not a glass structural shelf.
    box(x+(side===0?.001:.896),d+.012,.003,.876,.022,top,'pet');
   }
   // Endcap decks stay at the same heights as the existing product plan.
   for(const d of [2.4,6.45]){box(x,d,.9,.448,.002,top-.002,'paint');box(x,d,.9,.010,.018,top-.020,'paint');}
  }
  // Pale wood-effect laminate end panels, with thin metal perimeter trim.
  for(const d of [2.836,6.446]){box(x+.009,d,.882,.012,1.198,.14,'timber');for(const dx of [0,.89])box(x+dx,d-.002,.010,.016,1.35,0,'paint');box(x,d-.002,.9,.016,.014,1.336,'paint');}
  // A few small exposed edge rubs at handling points; no rust or random dirt.
  for(const [side,d,top] of [[0,3.12,.664],[.889,5.78,.344],[0,6.12,.984]]){box(x+side-.0006,d,.0012,.012,.003,top-.014,'wear');}
 }
 for(const [kind,parts]of batches){const m=new THREE.Mesh(mergeGeometries(parts),mats[kind]);m.name='Sakura gondola '+kind;m.castShadow=kind!=='pet';m.receiveShadow=true;group.add(m);parts.forEach(g=>g.dispose());}
 group.userData={materials:{paint:'Cream powder-coated steel shelves and slotted uprights',back:'12 mm laminate-faced hardboard panel inserts',timber:'Pale wood-effect laminate end panels',steel:'Galvanised/brushed steel brackets and levelling feet',pet:'Clear PET retainers; existing price channels remain'},tops,footprintMm:[900,4500],heightMm:1350,productLayoutUnchanged:true};
 return group;
}

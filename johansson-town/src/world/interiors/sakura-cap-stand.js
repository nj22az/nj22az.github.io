import * as THREE from '../../../vendor/three.module.js';
import {placeAsset,catalogCard} from '../../catalog/catalog.js';
import {SEAGULLS_CAP} from '../../commerce/sakura-caps.js';

/**
 * Sakura's cap tree (commerce/sakura-caps.js SEAGULLS_CAP: why it stands by the east window, who buys the caps): a
 * chromed pole on a weighted cast base, two arms to the shop side, each ending in a cap form, a dome the size of the
 * town's head, with a stack of three Seagulls caps on it, crown up and bill out, as they are worn. The caps are the
 * catalogue's own model (assets/catalog/seagulls-cap, the one a resident wears), each copy in its colourway. A card on
 * top says what they are and what they cost, in Japanese, as Sakura's other signs do; looking at it tells the rest in
 * English.
 *
 * Built in the stand's own frame (the pole at the origin, the caps out along +z) and turned to face the shop.
 * Returns {group, caps, ready}: `ready` resolves when every cap's model is in (true) or cannot be had (false).
 */
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP","Noto Sans",system-ui,sans-serif';

/** The card on top of the pole: the team, the line, the price with tax, one size. Both faces print the same. */
export function drawCapCard(ctx,w,h,line=SEAGULLS_CAP){
 ctx.fillStyle='#fbf8f0';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#f4a3bd';ctx.fillRect(0,0,w,h*.2);                  // Sakura's pink band, as on its sale poster
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='#ffffff';ctx.font=`bold ${h*.12}px ${GOTHIC}`;ctx.fillText('さくら商店',w/2,h*.105);
 ctx.fillStyle='#27304d';ctx.font=`900 ${h*.13}px ${GOTHIC}`;ctx.fillText(line.jp.team,w/2,h*.33);
 ctx.font=`900 ${h*.2}px ${GOTHIC}`;ctx.fillText(line.jp.line,w/2,h*.53);
 ctx.fillStyle='#c5281c';ctx.font=`900 ${h*.17}px ${GOTHIC}`;ctx.fillText(line.jp.price,w*.42,h*.76);
 ctx.font=`bold ${h*.08}px ${GOTHIC}`;ctx.fillText(line.jp.tax,w*.74,h*.78);
 ctx.fillStyle='#3b3f55';ctx.font=`bold ${h*.075}px ${GOTHIC}`;ctx.fillText(line.jp.size,w/2,h*.92);
}

function cardTexture(){
 const c=document.createElement('canvas');c.width=512;c.height=320;
 const ctx=c.getContext('2d');if(!ctx)return null;
 drawCapCard(ctx,c.width,c.height);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

/** Where a cap form is cut off, in head radii above its centre: y = mid + tilt·cos(azimuth), inside the cap's band all round
 *  (its band: 0.40 at the front, 0.27 over the ears, 0.03 at the nape, where the opening runs up to 0.30 above the strap). */
export const FORM_RIM=Object.freeze({mid:.32,tilt:.08});
/** A unit cap form: the crown of a unit head down to FORM_RIM, closed underneath. */
function capForm(){
 const pos=[],idx=[],AROUND=28,DOWN=8;
 for(let j=0;j<=DOWN;j++)for(let i=0;i<=AROUND;i++){
  const phi=i/AROUND*Math.PI*2,rim=Math.acos(FORM_RIM.mid+FORM_RIM.tilt*Math.cos(phi)),th=rim*j/DOWN;
  pos.push(Math.sin(th)*Math.sin(phi),Math.cos(th),Math.sin(th)*Math.cos(phi));
 }
 for(let j=0;j<DOWN;j++)for(let i=0;i<AROUND;i++){const a=j*(AROUND+1)+i,b=a+AROUND+1;idx.push(a,b,a+1,a+1,b,b+1);}
 const base=pos.length/3;pos.push(0,FORM_RIM.mid,0);
 for(let i=0;i<AROUND;i++)idx.push(base,DOWN*(AROUND+1)+i+1,DOWN*(AROUND+1)+i);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 return g;
}

export function buildCapStand(room,{anchor,action}={}){
 const C=SEAGULLS_CAP,S=C.stand,card=catalogCard(C.asset),A=card.anchors;
 const group=new THREE.Group();group.name='Sakura cap tree';group.position.set(S.x,0,S.z);group.rotation.y=S.yaw;room.add(group);
 const chrome=new THREE.MeshStandardMaterial({color:0xc9ced3,metalness:.55,roughness:.32});
 const iron=new THREE.MeshStandardMaterial({color:0x4a4f55,roughness:.7});
 const plastic=new THREE.MeshStandardMaterial({color:0xe9e4d8,roughness:.6});
 const add=(geometry,material,x,y,z,name)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;m.castShadow=true;m.receiveShadow=true;group.add(m);return m;};
 // The weighted base and the pole.
 add(new THREE.CylinderGeometry(.17,.18,.035,28),iron,0,.0175,0,'Cap tree base');
 add(new THREE.CylinderGeometry(.04,.06,.03,16),chrome,0,.05,0,'Cap tree collar');
 add(new THREE.CylinderGeometry(.0125,.0125,S.height-.06,12),chrome,0,.06+(S.height-.06)/2,0,'Cap tree pole');
 add(new THREE.SphereGeometry(.018,12,8),chrome,0,S.height,0,'Cap tree finial');
 // The arms and the cap forms: each form is the crown of the head the cap was built on (its card's head anchors), a
 // little smaller, so the sweatband rests on it; cut off along a line inside the band (FORM_RIM), so it never shows under
 // the cap, and so the arm reaches it through the snapback's opening, above the strap, as a real cap tree's does.
 const centre=A['head-centre'],radii=[A['head-left'][0]-centre[0],A['head-top'][1]-centre[1],A['head-front'][2]-centre[2]].map(r=>r*.97);
 const form=capForm(),rimBack=FORM_RIM.mid-FORM_RIM.tilt;
 const caps=[],ready=[];
 for(const {form:tier,caps:colours} of C.stock){
  const y0=S.forms[tier],cy=y0+centre[1];
  const dome=add(form,plastic,0,cy,S.reach,'Cap form');dome.scale.set(...radii);
  const armY=cy+radii[1]*(rimBack+.03),back=S.reach-radii[2]*Math.sqrt(1-(rimBack+.03)**2);
  const arm=add(new THREE.CylinderGeometry(.009,.009,back+.03,10),chrome,0,armY,(back+.03)/2,'Cap tree arm');arm.rotation.x=Math.PI/2;
  colours.forEach((hex,i)=>{
   const cap=placeAsset(C.asset,{parent:group,x:0,y:y0+i*S.nest,z:S.reach,yaw:0,
    // Each copy has its own materials: the cloth takes this cap's colourway, as `hatColour` does on a head.
    onModel:copy=>copy.traverse(o=>{if(o.isMesh&&o.material?.name==='cloth')o.material.color.set(hex);})});
   cap.object.name=`Seagulls cap on the stand (${tier} ${i+1})`;caps.push(cap);ready.push(cap.ready);
  });
 }
 // The card on top, both faces.
 const texture=cardTexture(),cardMat=texture?new THREE.MeshStandardMaterial({map:texture,roughness:.8}):plastic;
 const cardW=.4,cardH=.25,cardY=S.height+.02+cardH/2;
 for(const side of [0,Math.PI]){const m=add(new THREE.PlaneGeometry(cardW,cardH),cardMat,0,cardY,side?-.004:.004,'Cap tree price card');m.rotation.y=side;}
 add(new THREE.BoxGeometry(cardW+.02,.012,.012),chrome,0,cardY-cardH/2-.006,0,'Cap tree card holder');
 group.updateMatrixWorld(true);
 const look=new THREE.Vector3(0,1.45,S.reach+.45).applyMatrix4(group.matrixWorld);
 anchor?.(look.toArray(),'Look at the Seagulls caps',()=>action?.('inspect','Sakura · Seagulls caps',
  `Minato Seagulls caps, ¥${C.price.toLocaleString('en-US')} with tax: Johansson Headwear's six-panel snapback, made in Naha, in the team's night navy, `+
  'white and fukugi green, the gull embroidered on the front and one size with the strap. Thuan keeps them by the window and the till, '+
  'where the boats’ crews pay for their lunch. Kōji bought the first navy one for the catch tables.'));
 return {group,caps,ready:Promise.all(ready).then(all=>all.every(Boolean))};
}

import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {MINATO_1997_POSTERS,KEEP_SHELF,BOTTLE_KEEP} from './izakaya-dressing.js';

/**
 * The things in Minato you can use.
 *
 * - The pink telephone on its shelf by the door (a 1997 izakaya's own public phone,
 *   ¥10 a call): the harbour office, the ferry desk, Sakura.
 * - The bottle keep: read whose bottles they are, or keep one of your own, which then
 *   stands on the shelf with your name on its tag.
 * - The laserdisc karaoke on its cabinet at the end of the koagari.
 * - The posters and the tanuki, each with something to say.
 *
 * The actions are handled in people/izakaya-play.js.
 */
export const PINK_PHONE=Object.freeze({x:3.42,y:.95,z:6.16});
export const KARAOKE=Object.freeze({x:5.86,z:5.2,w:.62,d:.48,h:.72});
const POSTER_LINES=Object.freeze({
 beer:['Umineko Beer · Summer 1997','The summer campaign is still up in October. Nao says she will take it down when the brewery rep brings the winter one, and the brewery rep says the same about her.'],
 enka:['Harbour Lights · Kayoko Shima','An enka evening at the harbour hall on Saturday the 25th. Mr Higa has two tickets and has not yet decided who the second one is for.'],
 police:['If you drink, don’t drive','The police box’s notice. Officer Mori put it up himself, then sat down under it with a beer. He walked home.'],
 calendar:['Zuisen brewery calendar','October 1997. Someone has ringed the 17th in red: Nao’s day off, the only one this month.'],
 karaoke:['Karaoke contest','Last Friday of the month, from nine. The prize is a bottle on the keep shelf with your name on it. Kenji has won it three times running.'],
 baseball:['Minato Seagulls · autumn fixtures','Home to Aoba on the 25th. The Seagulls have not beaten Aoba since 1989, and the whole counter will tell you why.'],
});

function coloured(g,hex){
 const c=new THREE.Color(hex),a=new Float32Array(g.attributes.position.count*3);
 for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);g.setAttribute('color',new THREE.BufferAttribute(a,3));if(g.attributes.uv)g.deleteAttribute('uv');return g;
}
function screenTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=192;const x=c.getContext('2d');
 const g=x.createLinearGradient(0,0,0,192);g.addColorStop(0,'#1d2a6b');g.addColorStop(1,'#6b1d5a');x.fillStyle=g;x.fillRect(0,0,256,192);
 x.fillStyle='#ffe14d';x.font='900 30px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('KARAOKE',128,60);
 x.fillStyle='#ffffff';x.font='700 18px sans-serif';x.fillText('Insert ¥100 · pick a song',128,120);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function buildIzakayaInteractive(room,{anchor,action,collider}){
 const parts=[];
 const box=(w,h,d,x,y,z,hex)=>parts.push(coloured(new THREE.BoxGeometry(w,h,d).translate(x,y,z),hex));
 // The pink phone: on a little shelf, its coin slot and dial facing the room.
 const P=PINK_PHONE;
 box(.4,.03,.26,P.x,P.y,P.z,0x6e4c30);box(.03,.12,.2,P.x-.16,P.y-.07,P.z+.02,0x3a2a1c);box(.03,.12,.2,P.x+.16,P.y-.07,P.z+.02,0x3a2a1c);
 box(.24,.14,.2,P.x,P.y+.085,P.z-.01,0xf08fb0);box(.2,.04,.06,P.x,P.y+.175,P.z+.02,0xe86f98);
 parts.push(coloured(new THREE.CylinderGeometry(.045,.045,.01,16).rotateX(Math.PI/2).translate(P.x+.03,P.y+.09,P.z-.115),0xf6f0e8));
 box(.025,.006,.004,P.x-.07,P.y+.12,P.z-.111,0x2a2a2a);
 // The karaoke: a cabinet with the laserdisc player, a small monitor on top, two mics.
 const K=KARAOKE;
 box(K.w,K.h,K.d,K.x,K.h/2,K.z,0x4a3426);
 box(K.w-.06,.09,K.d-.06,K.x,K.h-.12,K.z-.012,0x2a2a2e);box(.2,.01,.004,K.x,K.h-.12,K.z-K.d/2+.016,0x9aa0a6);
 box(.48,.36,.4,K.x,K.h+.18,K.z+.02,0x2a2a2e);
 for(const dx of [-.22,.22])parts.push(coloured(new THREE.CylinderGeometry(.018,.012,.18,10).rotateZ(Math.PI/2).translate(K.x+dx*.9,K.h+.012,K.z-.17),0x2a2a2e));
 const body=new THREE.Mesh(mergeGeometries(parts),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5}));body.name='Minato phone and karaoke';room.add(body);
 parts.forEach(g=>g.dispose());
 // The karaoke's screen faces the koagari (towards -x and the room).
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.38,.28),new THREE.MeshBasicMaterial({map:screenTexture(),toneMapped:false}));
 screen.position.set(K.x,K.h+.2,K.z-.181);screen.rotation.y=Math.PI;screen.name='Minato karaoke screen';room.add(screen);
 // The player's own bottle: hidden until they keep one (see setPlayerBottle).
 const S=KEEP_SHELF,mine=new THREE.Group();mine.name='Your bottle on the keep shelf';mine.visible=false;
 {const g=mergeGeometries([new THREE.CylinderGeometry(.045,.045,.24,10).translate(0,.12,0),new THREE.CylinderGeometry(.018,.045,.07,10).translate(0,.275,0),new THREE.CylinderGeometry(.017,.017,.06,8).translate(0,.34,0)]);
  const b=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x2c4a33,roughness:.25}));mine.add(b);
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(.085,.042),new THREE.MeshStandardMaterial({color:0xf6efdc,roughness:.9}));tag.position.set(.05,.2,0);tag.rotation.y=Math.PI/2;mine.add(tag);}
 // At the end of the top board, past the regulars'.
 mine.position.set(S.x+.11,S.levels.at(-1),S.z+S.width/2-.05);room.add(mine);
 if(collider){collider(K.x,K.z,K.w,K.d,1.1);collider(P.x,P.z,.4,.26,1.1);}
 if(anchor&&action){
  anchor([P.x,1.25,P.z-.6],'Use the pink telephone',()=>action('izakaya-phone'));
  anchor([S.x+.7,1.6,S.z],'Read the bottle-keep tags',()=>action('bottle-keep'));
  anchor([K.x-.55,1.0,K.z-.45],'Sing at the karaoke',()=>action('karaoke'));
  for(const [cell,x,y,z,yaw] of MINATO_1997_POSTERS){
   const n=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),[title,text]=POSTER_LINES[cell];
   anchor([x+n.x*.45,Math.min(1.75,y),z+n.z*.45],'Read the '+title.split(' · ')[0]+' poster',()=>action('inspect',title,text));
  }
  anchor([2.25,.8,5.3],'Pat the tanuki',()=>action('inspect','The tanuki','A potbellied tanuki in a straw hat, a sake flask in one paw and an unpaid bill in the other. Nao pats his belly on the way in every evening, for trade. So does the Barfly, for luck.'));
 }
 return {
  /** Shows the player's own bottle, tagged, once they keep one at the counter. */
  setPlayerBottle(on){mine.visible=!!on;},
  regulars:BOTTLE_KEEP,
 };
}

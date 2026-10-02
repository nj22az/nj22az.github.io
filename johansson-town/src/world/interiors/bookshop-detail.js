import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
/** Original paper covers and timber shelving, fitted around existing browsing routes. */
export function addBookshopDetail({room,collider,reg,action}){
 const g=new THREE.Group();g.name='Front-Row bookshop collected editions';room.add(g);const batches=new Map();
 const colours=[0x72453d,0x3d6670,0xb5a66b,0x5a7148,0xcebb94,0x696085];
 const piece=(s,p,c)=>{const geo=new THREE.BoxGeometry(...s);geo.translate(...p);if(!batches.has(c))batches.set(c,[]);batches.get(c).push(geo);};
 // Bookshelves behind the arrivals counter, and a full east-wall bookcase.
 for(const y of [1.18,1.66,2.12]){
  piece([7.45,.055,.32],[0,y,-3.32],0x92734f);
  for(let i=0;i<47;i++){const x=-3.63+i*.156,h=.28+(i%4)*.025;piece([.09+(i%3)*.013,h,.21],[x,y+h/2+.03,-3.28],colours[i%6]);piece([.075,.009,.008],[x,y+h*.65,-3.17],0xe3d6b8);}
 }
 piece([.10,2.22,3.8],[4.08,1.11,-.4],0x574837);
 for(const y of [.34,.86,1.38,1.9]){
  piece([.39,.055,3.8],[3.94,y,-.4],0x92734f);
  for(let i=0;i<24;i++){const z=-2.19+i*.15,h=.28+(i%3)*.03;piece([.24,h,.10],[3.93,y+h/2+.03,z],colours[(i+2)%6]);piece([.008,.01,.08],[3.80,y+h*.75,z],0xe3d6b8);}
 }
 collider(3.96,-.4,.43,3.85,2.22);
 // Floor-level stacks under the back display; central aisle remains open.
 for(let i=0;i<7;i++)for(let n=0;n<3;n++)piece([.28,.035,.35],[-.3+i*.54,.12+n*.036,-3.0],colours[(i+n)%6]);
 const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.fillStyle='#eee0bf';x.fillRect(0,0,1024,512);
 const titles=['ISLAND HISTORIES','SEA & SKY','POEMS FOR THE FERRY','THE EVENING PAPER'];
 titles.forEach((title,i)=>{const ox=(i%2)*512,oy=Math.floor(i/2)*256;x.fillStyle=['#55756a','#547e9e','#9a7661','#7c5141'][i];x.fillRect(ox+12,oy+12,488,232);x.fillStyle='#f5ebd2';x.font='bold 30px Georgia';x.fillText(title,ox+30,oy+55,450);x.font='19px Georgia';x.fillText('FRONT-ROW BOOKS · JOHANSSON TOWN',ox+30,oy+88,450);x.beginPath();x.arc(ox+250,oy+160,46,0,Math.PI*2);x.strokeStyle='#dfc998';x.lineWidth=3;x.stroke();});
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 const poster=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.1),new THREE.MeshStandardMaterial({map:texture,roughness:.9}));poster.position.set(1.7,1.35,-3.445); // keep small original posters on the upper rail instead
 poster.scale.set(1,.43,1);poster.position.y=2.43;g.add(poster);
 for(const [colour,geos] of batches){const merged=mergeGeometries(geos,false);const m=new THREE.Mesh(merged,new THREE.MeshStandardMaterial({color:colour,roughness:.9}));m.receiveShadow=true;g.add(m);geos.forEach(o=>o.dispose());}
 const a=new THREE.Object3D();a.position.set(3.6,1,-.4);g.add(a);reg(a,'Browse the collected editions',()=>action('read','Front-Row collected editions','Island histories, pocket poetry, sea guides and old magazines. Aya writes her recommendations on paper slips. Reiko leaves corrected newspaper proofs at the rear desk. You can walk the centre aisle, browse the east shelves and return to the window chair.'),true);
 return g;
}

import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
export const FLOWER_SHOP={name:'Rainflower Florist',staff:'Mrs Kinjō',x:99.3,z:101,open:540,close:1080};
/** Open-front florist, using the existing Mrs Kinjō actor rather than a new clerk. */
export function buildFlowerShop({world,group,register,onAction}){
 const root=new THREE.Group();root.name=FLOWER_SHOP.name;root.position.set(99.3,0,101);group.add(root);const materials=new Map(),parts=new Map();
 const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.85}));return materials.get(c);};
 const box=(n,s,p,c,solid=false)=>{const g=new THREE.BoxGeometry(...s);g.translate(...p);if(!parts.has(c))parts.set(c,[]);parts.get(c).push(g);if(solid)world.colliders.push({id:n,x:99.3+p[0],z:101+p[2],w:s[0],d:s[2],height:p[1]+s[1]/2});};
 const small=(geo,p,c)=>{geo.translate(...p);if(!parts.has(c))parts.set(c,[]);parts.get(c).push(geo);};
 box('Florist tiled floor',[7,.08,8.5],[0,.04,0],0xc5bea6);box('Florist cedar back',[.16,3.1,8.5],[3.44,1.55,0],0x8f7857,true);
 for(const z of [-4.18,4.18])box('Florist side wall',[7,3.1,.16],[0,1.55,z],0xcbbd9e,true);
 box('Flower wrapping counter',[.75,.9,2.0],[2.1,.45,.5],0x7f674a,true);box('Wrapping paper',[.53,.025,.38],[2.1,.923,.6],0xd9ceae);box('Till',[.32,.2,.25],[2.1,1.01,-.1],0x536956);
 // Leave a broad central route from the pavement to the counter.
 for(const [x,z] of [[-2.4,-2.8],[-1.3,-2.8],[.1,-2.8],[1.4,-2.8],[-2.4,2.8],[-.8,2.8],[.6,2.8]]){
  small(new THREE.CylinderGeometry(.24,.18,.48,12),[x,.3,z],0x55675f);world.colliders.push({id:'flower-bucket',x:99.3+x,z:101+z,w:.52,d:.52,height:1.25});
  for(let i=0;i<7;i++){
   const sx=x+(i%3-1)*.13,sz=z+(Math.floor(i/3)-1)*.12,y=.94+(i%3)*.07;
   small(new THREE.CylinderGeometry(.012,.012,.68,5),[sx,.68,sz],0x486a43);
   const colour=[0xf0cc62,0xeee5c7,0xc4677c][i%3];small(new THREE.SphereGeometry(.042,6,4),[sx,y,sz],0xbaa05f);
   for(let k=0;k<5;k++)small(new THREE.SphereGeometry(.045,6,4),[sx+Math.cos(k*Math.PI*.4)*.065,y,sz+Math.sin(k*Math.PI*.4)*.065],colour);
  }
 }
 for(const z of [-2.6,0,2.6]){const wreath=new THREE.TorusGeometry(.25,.075,6,16);wreath.rotateY(Math.PI/2);small(wreath,[3.31,1.95,z],0x3c6953);for(let i=0;i<5;i++)small(new THREE.SphereGeometry(.065,7,4),[3.22,1.95+Math.cos(i*Math.PI*.4)*.23,z+Math.sin(i*Math.PI*.4)*.23],0xc89869);}
 for(const [c,list] of parts){const m=new THREE.Mesh(mergeGeometries(list,false),mat(c));m.receiveShadow=true;root.add(m);list.forEach(g=>g.dispose());}
 const sign=(text,pos,w,h)=>{const c=document.createElement('canvas');c.width=768;c.height=256;const x=c.getContext('2d');x.fillStyle='#376a51';x.fillRect(0,0,768,256);x.fillStyle='#f4ecd4';x.textAlign='center';x.font='bold 52px Georgia';text.split('\n').forEach((t,i)=>x.fillText(t,384,76+i*72,735));const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));m.position.set(...pos);m.rotation.y=-Math.PI/2;root.add(m);};
 sign('雨花生花店\nRainflower Florist · island-grown',[-3.58,3.5,0],5.7,.8);sign('季節の花束\nBouquet ¥250 · 09:00–18:00',[3.31,2.6,.2],3.2,.7);
 let minutes=720;
 const anchor=(pos,label,fn)=>{const a=new THREE.Object3D();a.position.set(...pos);root.add(a);register(a,label,fn);};
 anchor([.6,1,.5],'Buy a Rainflower bouquet · ¥250',()=>((minutes%1440)+1440)%1440>=540&&((minutes%1440)+1440)%1440<1080?onAction('buy','Rainflower bouquet',{cost:250,item:'Rainflower bouquet',text:'Mrs Kinjō wraps island-grown stems in brown paper. A little colour for a home, a dinner table or someone you care about.'}):onAction('read','Rainflower is closed','Mrs Kinjō serves flowers from 09:00 to 18:00. You may still look around the open shop.'));
 anchor([.1,1,-2.3],'Browse the flower buckets',()=>onAction('read','Rainflower Florist','Fresh stems, potted greenery and hand-made wreaths. Mrs Kinjō works here from 09:00 to 18:00, and still reminds her husband that supper will not wait for the tide. The flowers are refreshed when the supply boat brings its morning delivery.'));
 return {root,update(value){minutes=value;}};
}

import {paintedTurf} from '../render/toy-surfaces.js';
import {GROUND} from '../render/ground-palette.js';
import {applyTerrainNormals} from './terrain-surface.js';
import * as THREE from '../../vendor/three.module.js';
import {GARDEN,PARK_ACCESS,gardenApronHeight,gardenAccessHeight,gardenGroundHeight,inGarden} from './garden-layout.js';
import {groundHeight} from './layout.js';
import {createKit} from './okinawa/kit.js';
import {poster} from './okinawa/signs.js';
/** Graded verges and two direct walks turn a distant attraction into the local park. */
export function buildParkAccess(world,{register,onAction}={}){
 const group=new THREE.Group();group.name='Neighbourhood walks to Aoba Garden';world.group.add(group);
 const ground=(x,z)=>gardenGroundHeight(x,z)??groundHeight(x,z);
 const strip=(a,b,width,colour,name,inside=false)=>{const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),n=Math.ceil(length/.5),ox=-dz/length*width/2,oz=dx/length*width/2,p=[],idx=[];
  for(let i=0;i<=n;i++){const x=a[0]+dx*i/n,z=a[1]+dz*i/n;for(const side of [-1,-2/3,-1/3,0,1/3,2/3,1])p.push(x+ox*side,ground(x+ox*side,z+oz*side)+(name==='Park pedestrian walk'?.045:.025),z+oz*side);}
  for(let i=0;i<n;i++)for(let k=0;k<6;k++){const j=i*7+k;const x=(p[j*3]+p[(j+8)*3])/2,z=(p[j*3+2]+p[(j+8)*3+2])/2;if((inGarden(x,z)&&!inside)||(x<-35.5&&z<30))continue;if(name==='Park walk grass verge'&&PARK_ACCESS.some(r=>r.points.slice(1).some((b,i)=>{const a=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<r.width/2;})))continue;idx.push(j,j+1,j+7,j+1,j+8,j+7);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);applyTerrainNormals(g,ground);g.setAttribute('uv',new THREE.Float32BufferAttribute(p.flatMap((_,i)=>i%3===0?[p[i]/2.4,p[i+2]/2.4]:[]),2));const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:colour,map:name==='Park walk grass verge'?paintedTurf():null,roughness:1,side:THREE.DoubleSide}));m.name=name;group.add(m);
 };
 // A tessellated grass bank joins the garden's flat floor to the island datum.
 const bank=1.8,w=GARDEN.maxX-GARDEN.minX+bank*2,d=GARDEN.maxZ-GARDEN.minZ+bank*2,g=new THREE.PlaneGeometry(w,d,64,64);g.rotateX(-Math.PI/2);g.translate((GARDEN.minX+GARDEN.maxX)/2,0,(GARDEN.minZ+GARDEN.maxZ)/2);const p=g.attributes.position,idx=[];
 for(let i=0;i<p.count;i++)p.setY(i,ground(p.getX(i),p.getZ(i))+.005);
 for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i),b=g.index.getX(i+1),c=g.index.getX(i+2);if(!inGarden((p.getX(a)+p.getX(b)+p.getX(c))/3,(p.getZ(a)+p.getZ(b)+p.getZ(c))/3))idx.push(a,b,c);}g.setIndex(idx);applyTerrainNormals(g,ground);for(let i=0;i<p.count;i++)g.attributes.uv.setXY(i,p.getX(i)/2.4,p.getZ(i)/2.4);const skirt=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:GROUND.grass,map:paintedTurf(),roughness:1,side:THREE.DoubleSide}));skirt.name='Graded garden edge';group.add(skirt);
 for(const route of PARK_ACCESS)for(let i=1;i<route.points.length;i++){strip(route.points[i-1],route.points[i],6.1,GROUND.grass,'Park walk grass verge');strip(route.points[i-1],route.points[i],route.width,0xc3b792,'Park pedestrian walk',route.id==='garden-residential-walk');}
 const kit=createKit();
 // Level garden terrace under the full-size bathhouse beyond the compact pond composition.
 const terrace=new THREE.Mesh(new THREE.PlaneGeometry(4.25,28.2),new THREE.MeshStandardMaterial({color:GROUND.grass,map:paintedTurf(),roughness:1}));terrace.rotation.x=-Math.PI/2;terrace.position.set(-7.525,.007,48.1);for(let i=0;i<terrace.geometry.attributes.uv.count;i++){const p=terrace.geometry.attributes.position;terrace.geometry.attributes.uv.setXY(i,(p.getX(i)-7.525)/2.4,(48.1-p.getY(i))/2.4);}terrace.name='Bathhouse garden lawn';group.add(terrace);for(const [x,z,ry] of [[-9,25.4,Math.PI/2],[-35.9,24,0],[-21.8,33,0]]){
  kit.box(.09,1.9,.09,x,.95,z,0x768375);kit.sign(poster({title:'青葉公園',lines:['AOBA GARDEN','公園・銭湯 →','Park & bathhouse'],band:'#3c6653',bg:'#efe9d4'}),.85,.7,x,1.55,z,{ry,name:'Neighbourhood park direction'});world.colliders.push(kit.rect(x-.06,x+.06,z-.06,z+.06,2,'park-direction-post'));
 }kit.finish(group,'Park wayfinding');
 const a=new THREE.Object3D();a.position.set(0,1,14.5);group.add(a);register?.(a,'Follow the path to Aoba Garden',()=>onAction?.('read','Your neighbourhood garden','The garden is just along the paved walk beyond the terminal. Follow the green park signs to the stone gate, the pond and Umi-no-yu. The western homes also have a direct walk from the seawall.'));
 return {group};
}

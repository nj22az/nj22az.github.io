import {writeFile} from 'node:fs/promises';
import * as THREE from '../../vendor/three.module.js';
import {buildConvenienceStore,buildStoreShell} from '../../src/world/interiors/convenience.js';
import {buildStorefront} from '../../src/world/storefront.js';
const room=new THREE.Group(),clerk=new THREE.Group();
const box=(size,pos,color,parent)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));o.position.set(...pos);parent.add(o);return o;};
const texture=(jp,en,accent='#ad5557')=>{const t=new THREE.Texture();t.userData={jp,en,accent};return t;};
buildStoreShell({room,box,reg(){},exit(){}});buildConvenienceStore({room,box,reg(){},collider(){},action(){},signTexture:texture,clerk});box([13,.10,13],[0,4.2,0],0xf2eedf,room);
function dump(group){group.updateMatrixWorld(true);const geometry={},materials={},objects=[];
 group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,m=o.material;
 geometry[g.uuid]??={positions:Array.from(g.attributes.position.array),uv:g.attributes.uv?Array.from(g.attributes.uv.array):null,indices:g.index?Array.from(g.index.array):null};
 materials[m.uuid]??={color:m.color.toArray(),emissive:m.emissive?.toArray(),emission:m.emissiveIntensity,opacity:m.opacity,roughness:m.roughness,label:m.map?.userData};
 const add=matrix=>objects.push({geometry:g.uuid,material:m.uuid,matrix:matrix.toArray()});
 if(o.isInstancedMesh)for(let i=0;i<o.count;i++){const mat=new THREE.Matrix4();o.getMatrixAt(i,mat);add(o.matrixWorld.clone().multiply(mat));}else add(o.matrixWorld);
 });return {geometry,materials,objects};}
await writeFile('/tmp/town-store-interior.json',JSON.stringify({...dump(room),clerk:clerk.position.toArray()}));
const front=new THREE.Group();buildStorefront({parent:front,site:{side:-1,z:0,title:'Sakura Shōten'},register(){},enter(){},label(jp,en,pos,w,h,angle){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture(jp,en),side:THREE.DoubleSide}));o.position.set(...pos);o.rotation.y=angle;front.add(o);}});
await writeFile('/tmp/town-store-exterior.json',JSON.stringify(dump(front)));

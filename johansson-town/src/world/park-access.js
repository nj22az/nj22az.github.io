import {paintedTurf,paintedPaving} from '../render/toy-surfaces.js';
import {GROUND} from '../render/ground-palette.js';
import {applyTerrainNormals} from './terrain-surface.js';
import * as THREE from '../../vendor/three.module.js';
import {gardenGroundHeight,GARDEN_GROUND_BOUNDS,PARK_ACCESS} from './garden-layout.js';
import {onIslandLand} from './coastal-ground.js';
import {shoppingLaneGroundHeight} from './shopping-lane-plan.js';
/** Underlying garden ground only. Paving belongs to the coordinated street mesh. */
export function buildParkAccess(world,{register,onAction}={}){
 const group=new THREE.Group();group.name='Open neighbourhood connector ground';world.group.add(group);
 const ground=(x,z)=>Math.max(gardenGroundHeight(x,z)??-.4,shoppingLaneGroundHeight(x,z)??-.4);
 // A single fine mesh replaces the old flat lawn, separate banks and raised strips. Where no garden or lane lifts
 // it, the ground lies flat under the streets: each row's flat run there is one strip, not a 0.25 m grid (90,000 of
 // its 113,000 triangles were flat, and it still has to fill the seams between the street meshes).
 const bounds=GARDEN_GROUND_BOUNDS,step=.25,nx=Math.round((bounds.maxX-bounds.minX)/step),nz=Math.round((bounds.maxZ-bounds.minZ)/step),positions=[],uv=[],grass=[],paving=[],heights=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=bounds.minX+i*step,z=bounds.minZ+j*step,y=ground(x,z);heights.push(y);positions.push(x,y+.006,z);uv.push(x/6,-z/6);}
 const vertex=(x,z)=>{positions.push(x,-.4+.006,z);uv.push(x/6,-z/6);return positions.length/3-1;};
 const level=k=>heights[k]===-.4&&heights[k+1]===-.4&&heights[k+nx+1]===-.4&&heights[k+nx+2]===-.4;
 for(let j=0;j<nz;j++){let run=-1;for(let i=0;i<=nx;i++){
  const x=bounds.minX+(i+.5)*step,z=bounds.minZ+(j+.5)*step,k=j*(nx+1)+i,land=i<nx&&onIslandLand(x,z),flat=land&&level(k);
  if(flat){if(run<0)run=i;continue;}
  if(run>=0){const x0=bounds.minX+run*step,x1=bounds.minX+i*step,z0=bounds.minZ+j*step,z1=z0+step,a=vertex(x0,z0),b=vertex(x0,z1),c=vertex(x1,z0),d=vertex(x1,z1);grass.push(a,b,c,c,b,d);run=-1;}
  if(land){const onPath=false;(onPath?paving:grass).push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}
 }}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex([...grass,...paving]);geometry.addGroup(0,grass.length,0);geometry.addGroup(grass.length,paving.length,1);applyTerrainNormals(geometry,ground);
 const pathMap=paintedPaving().clone();pathMap.repeat.set(2.5,-2.5);pathMap.needsUpdate=true;const terrain=new THREE.Mesh(geometry,[new THREE.MeshStandardMaterial({color:GROUND.grass,map:paintedTurf(),roughness:1}),new THREE.MeshStandardMaterial({color:GROUND.pavers,map:pathMap,roughness:1})]);terrain.name='Continuous neighbourhood garden ground';terrain.receiveShadow=true;group.add(terrain);
 return {group};
}

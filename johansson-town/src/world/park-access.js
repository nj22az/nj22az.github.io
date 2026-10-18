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
 // A single fine mesh replaces the old flat lawn, separate banks and raised strips.
 const bounds=GARDEN_GROUND_BOUNDS,step=.25,nx=Math.round((bounds.maxX-bounds.minX)/step),nz=Math.round((bounds.maxZ-bounds.minZ)/step),positions=[],uv=[],grass=[],paving=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=bounds.minX+i*step,z=bounds.minZ+j*step;positions.push(x,ground(x,z)+.006,z);uv.push(x/6,-z/6);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=bounds.minX+(i+.5)*step,z=bounds.minZ+(j+.5)*step;if(!onIslandLand(x,z))continue;const onPath=false;const k=j*(nx+1)+i;(onPath?paving:grass).push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex([...grass,...paving]);geometry.addGroup(0,grass.length,0);geometry.addGroup(grass.length,paving.length,1);applyTerrainNormals(geometry,ground);
 const pathMap=paintedPaving().clone();pathMap.repeat.set(2.5,-2.5);pathMap.needsUpdate=true;const terrain=new THREE.Mesh(geometry,[new THREE.MeshStandardMaterial({color:GROUND.grass,map:paintedTurf(),roughness:1}),new THREE.MeshStandardMaterial({color:GROUND.pavers,map:pathMap,roughness:1})]);terrain.name='Continuous neighbourhood garden ground';terrain.receiveShadow=true;group.add(terrain);
 return {group};
}

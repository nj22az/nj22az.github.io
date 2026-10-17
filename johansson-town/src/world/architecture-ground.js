import * as THREE from '../../vendor/three.module.js';
/** The fuel depot is on a level service court, clear of the fishing sheds. */
export const DEPOT_COURT=Object.freeze({id:'fuel-service-court',surface:'stone',minX:34.4,maxX:44.6,minZ:-37.6,maxZ:-27.4,y:0});
export const WORKSHOP_BAY=Object.freeze({id:"quay-workshop-bay",surface:"stone",minX:38.7,maxX:42.3,minZ:-43,maxZ:-37.6,y:0});
export function depotCourtAt(x,z){return [DEPOT_COURT,WORKSHOP_BAY].some(p=>x>=p.minX&&x<=p.maxX&&z>=p.minZ&&z<=p.maxZ);}
export function buildArchitectureGround(parent){
 for(const p of [DEPOT_COURT,WORKSHOP_BAY]){const m=new THREE.Mesh(new THREE.BoxGeometry(p.maxX-p.minX,.45,p.maxZ-p.minZ),new THREE.MeshStandardMaterial({color:0xb6b2a5,roughness:.94}));
 m.position.set((p.minX+p.maxX)/2,-.205,(p.minZ+p.maxZ)/2);m.name='Fuel depot service court';m.receiveShadow=true;parent.add(m);}
}

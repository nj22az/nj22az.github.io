// Resolve linked acting after both bodies are posed and placed. Targets follow actual scaled bones.
import * as THREE from '../johansson-town/vendor/three.module.js';
export function reachHand(avatar,side,target){
 const hand=avatar.bones['hand'+side];
 for(let i=0;i<36;i++)for(const name of ['elbow'+side,'shoulder'+side]){
  avatar.root.updateMatrixWorld(true);const joint=avatar.bones[name],origin=joint.getWorldPosition(new THREE.Vector3());
  const from=hand.getWorldPosition(new THREE.Vector3()).sub(origin),to=target.clone().sub(origin);if(from.lengthSq()<1e-8||to.lengthSq()<1e-8)continue;
  const delta=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize()),world=joint.getWorldQuaternion(new THREE.Quaternion()),parent=joint.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  joint.quaternion.copy(parent.multiply(delta.multiply(world)));
 }
 avatar.root.updateMatrixWorld(true);return hand.getWorldPosition(new THREE.Vector3()).distanceTo(target);
}
export function applySceneContacts(records){
 const byId=new Map(records.map(r=>[r.actor.id,r])),reports=[];
 for(const r of records){if(!r.actor.liftedBy)continue;const carrier=byId.get(r.actor.liftedBy);if(!carrier)continue;const a=r.avatar,b=carrier.avatar;
  const height=b.height*b.root.scale.y,relative=new THREE.Vector3(-.24*height,.20,.12*height).applyAxisAngle(new THREE.Vector3(0,1,0),b.root.rotation.y);
  a.root.position.copy(b.root.position).add(relative);a.root.rotation.y=b.root.rotation.y;a.root.updateMatrixWorld(true);
  const neck=a.bones.neck.getWorldPosition(new THREE.Vector3()),back=new THREE.Vector3(0,0,-.075*a.root.scale.x).applyAxisAngle(new THREE.Vector3(0,1,0),a.root.rotation.y);
  const targetR=neck.clone().add(back).add(new THREE.Vector3(.035,-.10*a.root.scale.x,0));
  const right=reachHand(b,'R',targetR);
  // The comic's teacher lifts by the back of the blouse with one hand; her other hand stays on her hip.
  b.bones.shoulderL.rotation.set(.15,0,.75);b.bones.elbowL.rotation.set(-.3,0,-1.5);b.root.updateMatrixWorld(true);reports.push({actor:r.actor.id,carrier:carrier.actor.id,contact:'back-of-blouse',right});
 }return reports;
}

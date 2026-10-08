import * as THREE from '../../vendor/three.module.js';

/**
 * Johansson's fists, in first person, for when something needs hitting.
 *
 * With nothing in his hands he fights with them: left, right, left, each punch snapping
 * out from the bottom corner of the view to the middle and back. With a weapon he swings
 * that instead, in an arc across the view. Between punches, while there is trouble near,
 * the fists stay up at the bottom of the view in a guard.
 */
export const WEAPONS=Object.freeze({
 'Harisen paper fan':{damage:2,verb:'whack'},
 'Driftwood club':{damage:2,verb:'club'},
 'Rusty boat hook':{damage:3,verb:'hook'},
});
/** The best thing in the bag to hit with, or null for bare hands. */
export function bestWeapon(inventory=[]){
 let best=null;
 for(const name of inventory)if(WEAPONS[name]&&(!best||WEAPONS[name].damage>WEAPONS[best].damage))best=name;
 return best;
}

function buildFist(skin,side,sleeve){
 // A closed fist seen from behind: the back of the hand, four curled fingers along the
 // front, the thumb across them, and his shirt sleeve at the wrist.
 const g=new THREE.Group(),tone=new THREE.Color(skin).multiplyScalar(.9);
 const mat=new THREE.MeshStandardMaterial({color:tone,roughness:.75});
 const hand=new THREE.Mesh(new THREE.SphereGeometry(.05,14,10),mat);hand.scale.set(1.05,.85,1.15);g.add(hand);
 for(let i=0;i<4;i++){
  const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.0135,.022,4,8),mat);
  finger.rotation.z=Math.PI/2;finger.position.set((-.028+i*.019)*side,.012-Math.abs(i-1.5)*.004,-.046);g.add(finger);
 }
 const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.013,.03,4,8),mat);thumb.rotation.set(0,0,Math.PI/2.4*side);thumb.position.set(-.012*side,-.028,-.036);g.add(thumb);
 const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.042,.05,.26,12),new THREE.MeshStandardMaterial({color:sleeve,roughness:.85}));
 cuff.rotation.x=Math.PI/2;cuff.position.z=.17;g.add(cuff);
 return g;
}

function buildWeapon(name){
 const g=new THREE.Group();g.name=name;
 if(name==='Harisen paper fan'){
  // A folded paper fan, the comedy slapstick of every manzai stage.
  const paper=new THREE.MeshStandardMaterial({color:0xf4f1ea,roughness:.9,side:THREE.DoubleSide});
  for(let i=0;i<7;i++){const fold=new THREE.Mesh(new THREE.PlaneGeometry(.05,.34),paper);fold.position.set(-.15+i*.05,.2,0);fold.rotation.y=(i%2?.35:-.35);g.add(fold);}
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.05,.14,.03),new THREE.MeshStandardMaterial({color:0xc93a2e}));grip.position.y=-.02;g.add(grip);
 }else if(name==='Driftwood club'){
  const wood=new THREE.Mesh(new THREE.CylinderGeometry(.035,.022,.55,7),new THREE.MeshStandardMaterial({color:0x9c8a70,roughness:1}));wood.position.y=.22;g.add(wood);
 }else{
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.7,6),new THREE.MeshStandardMaterial({color:0x6d5238}));pole.position.y=.3;g.add(pole);
  const hook=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,6,12,Math.PI*1.3),new THREE.MeshStandardMaterial({color:0x7a4a2e,roughness:.5,metalness:.5}));hook.position.set(.05,.66,0);g.add(hook);
 }
 return g;
}

/** Where each fist rests in guard, and where a punch lands, in the camera's frame. */
const REST=side=>new THREE.Vector3(side*.19,-.235,-.46),HIT=side=>new THREE.Vector3(side*.03,-.08,-.74);

export function createFists({camera,skin=0xd9a57c,sleeve=0x3f6a8a}={}){
 // Hidden until a fight raises them: frames drawn before the first update (the title fly-in,
 // frozen captures) must not show a pair of arms in front of the camera.
 const view=new THREE.Group();view.name='Johansson’s fists';view.visible=false;camera.add(view);
 const fists={1:buildFist(skin,1,sleeve),[-1]:buildFist(skin,-1,sleeve)};
 for(const side of [1,-1]){fists[side].position.copy(REST(side));view.add(fists[side]);}
 let weapon=null,weaponName=null,guard=0,guardWanted=false,punch=null,next=1,shown=true;
 const api={
  /** Nothing held (null) or the name of a weapon from WEAPONS. */
  setWeapon(name){
   if(name===weaponName)return;weaponName=WEAPONS[name]?name:null;weapon?.removeFromParent();weapon=null;
   if(weaponName){weapon=buildWeapon(weaponName);weapon.position.set(0,.03,-.02);weapon.rotation.x=-.5;fists[1].add(weapon);}
  },
  get weapon(){return weaponName;},
  /** Keep the fists up while there is somebody to fight nearby. */
  guard(on){guardWanted=!!on;},
  /** A punch (or a swing): returns which hand threw it, 1 right, -1 left. */
  punch(){
   const side=weaponName?1:next;if(!weaponName)next=-next;
   punch={side,t:0,d:weaponName?.42:.3};guard=Math.max(guard,.6);return side;
  },
  get busy(){return !!punch;},
  set visible(value){shown=!!value;},
  update(dt){
   guard+=((guardWanted||punch?1:0)-guard)*(1-Math.exp(-dt*10));
   view.visible=shown&&guard>.02;
   for(const side of [1,-1]){
    const f=fists[side],rest=REST(side),low=rest.clone().add(new THREE.Vector3(0,-.35*(1-guard),.1*(1-guard)));
    f.position.copy(low);f.rotation.set(0,0,0);
    if(punch&&punch.side===side){
     const u=punch.t/punch.d;
     if(weaponName){
      // A swing: up and back over the shoulder, then across the view.
      const k=u<.35?u/.35:1,sw=u<.35?0:Math.min(1,(u-.35)/.3),back=u>.65?(u-.65)/.35:0;
      f.position.set(.18-.3*sw+.12*back,-.2+.1*k-.12*sw,-.5-.1*sw);
      f.rotation.set(-.6*k+1.4*sw-.8*back,0,.9*k-1.9*sw+1.0*back);
     }else{
      // Snapped out along a straight line and brought back a little slower.
      const out=u<.4?Math.sin(u/.4*Math.PI/2):Math.cos((u-.4)/.6*Math.PI/2);
      f.position.lerpVectors(low,HIT(side),out);f.rotation.set(-.2*out,side*-.25*out,side*.3*out);
     }
    }
   }
   if(punch){punch.t+=dt;if(punch.t>=punch.d)punch=null;}
  },
 };
 return api;
}

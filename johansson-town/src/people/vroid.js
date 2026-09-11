import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';

export const VROID_BASES=['vroid-bob','vroid-casual','vroid-vest','vroid-ponytail','vroid-long'];
// Keep the first lighting comparison bounded to two familiar residents.
const LIGHTING_TRIAL=new Set(['Aya','Kenji']);

function illustratedMaterial(source,lit){
  if(!lit)return source.clone();
  // Respond to existing sun, hemisphere and room lights without skin specular
  // highlights, extra geometry or extra draw calls. Keep the illustrated atlas.
  const material=new THREE.MeshLambertMaterial({
    name:source.name,color:source.color,map:source.map,alphaMap:source.alphaMap,
    alphaTest:source.alphaTest,side:source.side,vertexColors:source.vertexColors,
    transparent:source.transparent,opacity:source.opacity,depthWrite:source.depthWrite,
    dithering:source.dithering,toneMapped:true,
  });
  material.userData={...source.userData,sceneLitAnime:true};
  return material;
}
// Profile model IDs stay stable: schedules, saved relationships and dialogue use
// the existing people. Only their appearance is selected here.
const looks=[
  ['long','#493447',true], ['casual','#343341'], ['bob','#b9b4bd',true],
  ['vest','#95959e',true], ['vest','#303542'], ['casual','#655145'],
  ['vest','#736c6a'], ['bob','#805143'], ['casual','#684836'],
  ['vest','#c7c3bd',true], ['casual','#63544e'], ['bob','#aba9a2'],
  ['long','#463441',true], ['vest','#4d3e48',true], ['ponytail','#755544'],
  ['vest','#bcb7ae',true], ['ponytail','#463c39'], ['casual','#8a8273'],
  ['bob','#d0c5cf',true], ['casual','#815c43'], ['bob','#574337']
];
export function vroidLook(profile){
  const index=Number(profile?.model?.match(/^resident-(\d+)$/)?.[1]);
  if(!Number.isInteger(index)||!looks[index])return null;
  const [base,hair,glasses=false]=looks[index];
  return {base:'vroid-'+base,hair,glasses,index,top:profile.top};
}

function spectacles(model,eyeCentres){
  const head=model.getObjectByName('J_Bip_C_Head');if(!head)return;
  if(!eyeCentres)return;
  // Use the visible irises. VRoid's eye bones are rotation pivots inside the
  // skull, so glasses positioned at those bones would disappear into the face.
  const [l,r]=eyeCentres.map(p=>new THREE.Vector3(...p));
  const spread=Math.abs(l.x-r.x),radius=spread*.38,centre=l.clone().add(r).multiplyScalar(.5);
  centre.z-=.012;
  const parts=[l,r].map(eye=>new THREE.TorusGeometry(radius,.0018,5,28).scale(1,.83,1).translate(eye.x,centre.y,centre.z));
  parts.push(new THREE.CylinderGeometry(.0018,.0018,spread-2*radius,5).rotateZ(Math.PI/2).translate(centre.x,centre.y+.004,centre.z));
  const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());
  const frames=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x66505b,toneMapped:false}));
  frames.name='Town spectacles';head.add(frames);
}

export function styleVroid(model,profile,eyeCentres){
  const look=vroidLook(profile);if(!look)return [];
  const lit=LIGHTING_TRIAL.has(profile.name);
  const faces=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const original=mesh.material;
    const customise=source=>{
      const material=illustratedMaterial(source,lit);material.toneMapped=lit;material.depthWrite=true;
      const palette=material.userData.townPalette;
      if(palette==='hair')material.color.set(look.hair);
      if(palette==='wardrobe')material.color.set(look.top).lerp(new THREE.Color(0xffffff),.24);
      return material;
    };
    mesh.material=Array.isArray(original)?original.map(customise):customise(original);
    if(mesh.morphTargetDictionary?.Blink!==undefined)faces.push(mesh);
  });
  if(look.glasses)spectacles(model,eyeCentres);
  return faces;
}

export function updateVroidExpression(actor,dt){
  actor.expressionTime+=dt;
  const period=3.7+(actor.look.index%5)*.41,phase=actor.expressionTime%period;
  const blink=phase<.18?Math.sin(Math.PI*phase/.18)**2:0;
  const smile=actor.entity.userData.chat?.speaking?.26:actor.gestureTime>0?.3:.12;
  for(const face of actor.faces){
    const dict=face.morphTargetDictionary,weights=face.morphTargetInfluences;
    weights[dict.Blink]=blink;weights[dict.Smile]=smile;
    weights[dict.MouthOpen]=actor.entity.userData.chat?.speaking?.08+.18*Math.sin(actor.expressionTime*13)**2:actor.current==='Eat'?.05+.05*Math.sin(actor.expressionTime*3):0;
  }
  if(actor.cup?.visible){
    actor.model.updateMatrixWorld(true);
    // Keep the cup upright while the VRoid palm follows the forearm.
    actor.cup.parent.getWorldQuaternion(actor.cup.quaternion).invert();
  }
}

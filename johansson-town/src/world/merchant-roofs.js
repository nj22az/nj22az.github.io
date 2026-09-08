import * as THREE from '../../vendor/three.module.js';

// Original modular roof forms. Dimensions are metres; footprints remain unchanged.
export const MERCHANT_FRONTAGES=[
 {roof:'hipped',height:6.3,wall:0xaaa18c,roofColour:0x505750,signWidth:4.8,signHeight:.85,timber:true},
 {roof:'curved-gable',height:6.6,wall:0xc3b59a,roofColour:0x515a58,signWidth:5.8,signHeight:.85,timber:true},
 {roof:'parapet',height:7.2,wall:0x969f98,roofColour:0x717b73,signWidth:4.6,signHeight:1.0,timber:false},
 {roof:'low-gable',height:6.1,wall:0xb4b0a0,roofColour:0x776d5d,signWidth:4.5,signHeight:.8,timber:false},
 {roof:'curved-gable',height:6.9,wall:0xc2b9a4,roofColour:0x5c625b,signWidth:5.3,signHeight:.8,timber:true},
 {roof:'parapet',height:6.4,wall:0xa2a89d,roofColour:0x66756d,signWidth:5.8,signHeight:.9,timber:false},
 {roof:'low-gable',height:6.2,wall:0xb8ac91,roofColour:0x766752,signWidth:5.0,signHeight:.85,timber:true},
 {roof:'hipped',height:7.0,wall:0x9fa69c,roofColour:0x4f5c59,signWidth:4.7,signHeight:.9,timber:false}
];
export function merchantRoofGeometry(kind,width=9.2,depth=10.8){
 if(kind==='hipped'){
  const x=width/2,z=depth/2,rise=1.5,ridge=Math.max(.5,z-x*.68);
  const vertices=[-x,0,-z,x,0,-z,x,0,z,-x,0,z,0,rise,-ridge,0,rise,ridge];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex([0,4,1,1,4,5,1,5,2,2,5,3,3,5,4,3,4,0]);
  const flat=geometry.toNonIndexed(),uv=[],p=flat.attributes.position;
  for(let i=0;i<p.count;i++)uv.push((p.getX(i)+x)/2,(p.getZ(i)+z+p.getY(i))/2);
  flat.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));flat.computeVertexNormals();return flat;
 }
 const half=width/2,rise=kind==='low-gable'?.58:1.52,shape=new THREE.Shape();
 shape.moveTo(-half,0);
 if(kind==='curved-gable'){shape.quadraticCurveTo(-half*.52,.12,0,rise);shape.quadraticCurveTo(half*.52,.12,half,0);}
 else {shape.lineTo(0,rise);shape.lineTo(half,0);}
 shape.lineTo(half,-.16);
 if(kind==='curved-gable'){shape.quadraticCurveTo(half*.52,-.04,0,rise-.16);shape.quadraticCurveTo(-half*.52,-.04,-half,-.16);}
 else{shape.lineTo(0,rise-.16);shape.lineTo(-half,-.16);}
 shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:6,bevelEnabled:false});geometry.translate(0,0,-depth/2);return geometry;
}

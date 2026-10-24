import * as THREE from '../../vendor/three.module.js';

/** The owner's Blender diorama, printed beside Thuan's flyer on the existing board. */
export const WOODLAND_POSTER=Object.freeze({
 title:'Johansson woodland',
 prompt:'Look at the harbour notice board',
 boardImage:'./diorama/woodland/poster-board.webp',
 image:'./diorama/woodland/poster.webp',
 viewer:'./diorama/woodland/index.html',
 width:.62,height:.62*2/3,
 position:Object.freeze([5.12,1.58,-33.11]),
 description:'Johansson, Thuan, Vy, Mr Fujita and Tetsuo among pastel fruit trees, pines and familiar island places.',
});

let printMaterial;
function material(){
 if(!printMaterial){
  const texture=globalThis.document?.baseURI?new THREE.TextureLoader().load(new URL(WOODLAND_POSTER.boardImage,document.baseURI).href):new THREE.Texture();
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  printMaterial=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
 }
 return printMaterial;
}

export function addWoodlandPoster(parent,{register,onAction}={}){
 const {width,height,position,prompt}=WOODLAND_POSTER,group=new THREE.Group();
 group.name='Johansson woodland poster · harbour notice board';group.position.set(...position);parent.add(group);
 const paper=new THREE.Mesh(new THREE.BoxGeometry(width+.012,height+.012,.006),new THREE.MeshStandardMaterial({color:0xfff7e7,roughness:1}));
 // Keep the print 6 mm ahead of its backing, beyond the town's 2 mm depth guard.
 paper.name='Woodland poster paper';paper.position.z=-.009;group.add(paper);
 const print=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material());
 print.name='Johansson woodland poster print';group.add(print);
 for(const x of [-width*.42,width*.42]){
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.009,8,6),new THREE.MeshStandardMaterial({color:0x987858,roughness:.8}));
  pin.name='Woodland poster drawing pin';pin.position.set(x,height/2-.012,.008);group.add(pin);
 }
 // The visible sheet and the board's walking anchor open the same menu. This also
 // gives mouse/touch picking a real surface, without a competing flyer prompt.
 register?.(group,prompt,()=>onAction?.('harbour-notice-board'));
 return group;
}

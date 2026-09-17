import * as THREE from '../../vendor/three.module.js';
import {COASTLINE} from './coastline.js';

// Sparse, walkable headland props so leaving the street is not empty scenery.
const SHORE_SPOTS=[
  {id:'west-lookout',x:-36.5,z:8,label:'Look out over the west channel',title:'West channel lookout',text:'The retaining stones drop to dark water. Fishing boats use the inner quay; this side of the headland is only walked by residents taking the long way home.'},
  {id:'north-wood',x:22,z:44,label:'Walk into the north wood',title:'North wood',text:'Pine and camphor close over the old forest road. The Harbour Line still has a right of way, but the path under the canopy is for walking.'},
  {id:'east-bluff',x:41,z:12,label:'Stand on the east bluff',title:'East bluff',text:'From here the shopping street is a thin strip of signs. The islands across the water stay unnamed on the visitor map.'},
  {id:'south-shelf',x:28,z:-46,label:'Inspect the south shelf',title:'South rock shelf',text:'Barnacles and wet rope marks. The outer pier is west of here; this shelf is not lit after dark.'},
  {id:'west-garden',x:-28,z:-18,label:'Inspect the waste-ground garden',title:'Waste-ground garden',text:'Someone has planted morning glories against a rusted drum. A crate of empty bottles waits for the next collection.'},
];

export function buildPeninsulaLife({parent,colliders=[],register=()=>{},onAction=()=>{},factory=null,shadows=false}={}){
  const group=new THREE.Group();group.name='Peninsula walk life';parent.add(group);
  let anchors=0;
  const box=(size,pos,color)=>{
    if(factory?.box)return factory.box(group,size,pos,color,null,shadows);
    const m=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.9}));
    m.position.set(...pos);m.castShadow=!!shadows;group.add(m);return m;
  };
  for(const spot of SHORE_SPOTS){
    const marker=new THREE.Object3D();marker.position.set(spot.x,1.15,spot.z);marker.name=spot.id;group.add(marker);
    register(marker,spot.label,()=>onAction('inspect',spot.title,spot.text));
    anchors++;
  }
  box([.62,.88,.62],[-28.1,.44,-18.15],0x6a5b48);
  box([.9,.28,.55],[-27.2,.16,-17.4],0x7a684c);
  box([1.6,.12,.42],[-27.6,.28,-19.1],0x5c4a36);
  colliders.push({id:'west-garden-drum',x:-28.1,z:-18.15,w:.7,d:.7},{id:'west-garden-crate',x:-27.2,z:-17.4,w:.95,d:.6});
  const bench=new THREE.Object3D();bench.position.set(-27.6,1,-18.6);group.add(bench);
  register(bench,'Sit on the waste-ground bench',()=>onAction('seat','Waste-ground bench','A split cedar plank facing the west channel. The shopping street is out of sight.'));
  bench.userData.seat={position:[-27.6,0,-19.1],stand:[-27.6,0,-18.4],eyeY:1.26,yaw:Math.PI*.65,pitch:0};
  anchors++;
  box([.7,.35,.7],[41,.18,12],0x7d8478);
  box([.42,.28,.42],[41,.46,12],0x6e756c);
  colliders.push({id:'east-cairn',x:41,z:12,w:.75,d:.75});
  const rockMat=new THREE.MeshStandardMaterial({color:0x7a847c,roughness:1});
  for(const [x,z,s] of [[-38,22,.9],[38,-8,.75],[16,47,.8],[-22,-46,.7]]){
    const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(s,0),rockMat);
    rock.position.set(x,.12,z);rock.scale.set(1.4,.55,1);rock.name='shore-rock';group.add(rock);
    const a=new THREE.Object3D();a.position.set(x,1,z);group.add(a);
    register(a,'Inspect the shore rock',()=>onAction('inspect','Shore rock','Salt-split granite. The same stone as the retaining wall, only this piece never made it into the course.'));
    anchors++;
  }
  const end=COASTLINE[COASTLINE.length-1];
  const tip=new THREE.Object3D();tip.position.set(end[0],1.1,end[1]+2);group.add(tip);
  register(tip,'Read the southern tip notice',()=>onAction('read','Southern tip','Johansson Town visitor map: the headland is closed water on every side. Stay on land. The working pier is the only deck that continues over the harbour.'));
  anchors++;
  return {group,anchors};
}

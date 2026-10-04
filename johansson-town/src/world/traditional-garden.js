import {broadleafGeometry} from './okinawa/trees.js';
import {nearestSegment} from './island-plan.js';
import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {GARDEN_AUTHOR as GARDEN,GARDEN_PATHS_AUTHOR as GARDEN_PATHS,gardenPoint,GARDEN_SCALE} from './garden-layout.js';
/** Original procedural garden, using the user's photograph as a stone-gate reference. */
export function buildTraditionalGarden({world,register,onAction}){
 const group=new THREE.Group();group.name='Aoba Traditional Garden';world.group.add(group);group.scale.set(GARDEN_SCALE,1,GARDEN_SCALE);group.position.set(-6.6,0,-30.2);const addCollider=c=>{const [x,z]=gardenPoint(c.x,c.z);world.colliders.push({...c,x,z,w:c.w*GARDEN_SCALE,d:c.d*GARDEN_SCALE});};const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.95}));return mats.get(c);};
 const box=(name,size,pos,c,solid=false)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));o.name=name;o.position.set(...pos);group.add(o);if(solid)addCollider({id:name,x:pos[0],z:pos[2],w:size[0],d:size[2],height:pos[1]+size[1]/2});return o;};
 const cylinder=(name,r,h,x,y,z,c,solid=false)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.08,h,12),mat(c));o.name=name;o.position.set(x,y,z);group.add(o);if(solid)addCollider({id:name,x,z,w:r*2,d:r*2,height:y+h/2});return o;};
 const anchor=(pos,label,kind,title,text)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,label,()=>onAction(kind,title,text));return a;};
 const treeMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});
 for(const [i,[x,z]] of [[-47,122],[-45,146],[-9,146],[-7,120],[-20,150],[-40,111]].entries()){
  const tree=new THREE.Mesh(broadleafGeometry({form:'spread',variant:i+1}),treeMaterial);tree.name='Garden shade tree';tree.position.set(x,0,z);tree.scale.setScalar(4);tree.castShadow=true;group.add(tree);
  addCollider({id:'Garden shade tree trunk',x,z,w:.44,d:.44,height:2.5});
 }
 for(const route of GARDEN_PATHS.filter(r=>r.id==='garden-bridge'))for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),bridge=route.id==='garden-bridge';const paving=box(bridge?'Wooden garden bridge':'Garden stepping path',[route.width,bridge?.18:.035,len],[(a[0]+b[0])/2,bridge?.01:.02,(a[1]+b[1])/2],bridge?0x826849:0xaba990);paving.rotation.y=Math.atan2(dx,dz);}
 // The wide stone torii, open at ground level; the curved lintel is a solid mesh.
 for(const x of [-31,-25]){box('Torii stone footing',[1.3,.35,1.4],[x,.18,113],0x747c70,true);cylinder('Torii stone pillar',.38,4.4,x,2.3,113,0x8c9185,true);}
 box('Torii lower beam',[8,.42,.55],[-28,3.55,113],0x82897e);const shape=new THREE.Shape();shape.moveTo(-4.8,0);shape.quadraticCurveTo(0,-.65,4.8,0);shape.lineTo(4.8,.5);shape.quadraticCurveTo(0,-.1,-4.8,.5);shape.closePath();const lintel=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:false}),mat(0x717b70));lintel.position.set(-28,4.65,112.65);lintel.name='Curved weathered stone torii lintel';group.add(lintel);
 box('Garden gate English plaque',[1,.9,.12],[-28,3.9,113.4],0x4d3c28);for(const x of [-29.4,-28,-26.6]){const paper=box('Folded paper shrine streamer',[.13,.3,.018],[x,3.12,113.38],0xe5e3cf);paper.rotation.z=.45;cylinder('Gate rope',.017,.5,x,3.48,113.38,0xafa481);}
 const pond=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshStandardMaterial({color:0x547c72,roughness:.25,transparent:true,opacity:.83}));pond.rotation.x=-Math.PI/2;pond.scale.set(GARDEN.pond.rx,GARDEN.pond.rz,1);pond.position.set(-34,GARDEN.pond.waterY,132);pond.name='Garden koi pond';group.add(pond);
 // Pond stones: three groups of one big stone and two smaller ones, and a few singles,
 // the way a garden sets its rocks, rather than an even ring of rubble.
 {const merged=new Merge();const triads=[[-40.8,134.9],[-30.1,127],[-31.3,137.6]],singles=[[-41.2,129.3,.7],[-26.6,134.2,.6],[-36.6,126.3,.65]];
  const stones=[...triads.flatMap(([x,z])=>[[x,z,1.3],[x+1.5,z+.5,.8],[x-1.2,z+.8,.6]]),...singles];
  stones.forEach(([x,z,r],i)=>{const g=new THREE.DodecahedronGeometry(1,0);merged.add(g,new THREE.Matrix4().compose(new THREE.Vector3(x,r*.28,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(.15*(i%3),i*1.9,.1*(i%2))),new THREE.Vector3(r*1.25,r*.72,r)),i%3?0x7b8277:0x8a8b80);
   addCollider({id:'pond-edge-rock',x,z,w:r*1.6,d:r*1.6,height:r*.9});});
  group.add(merged.mesh('Pond stones'));}
 for(const z of [130.8,133.2]){box('Bridge handrail',[20,.08,.1],[-34,.92,z],0x806647);for(const x of [-43,-38,-30,-25])box('Bridge railing post',[.1,.9,.1],[x,.53,z],0x6b5840);addCollider({id:'garden-bridge-rail',x:-34,z,w:20,d:.12,height:1});}
 // Small vermilion shrine, stone lanterns, trimmed shrubs and bamboo enclosure.
 box('Shrine stone plinth',[4.2,.28,3.4],[-35,.14,149],0x717b73,true);box('Small shrine timber body',[3.2,2.5,2.3],[-35,1.55,149],0xa54631,true);box('Shrine doorway',[1.2,1.8,.08],[-35,1.4,147.82],0x403629);box('Shrine curved roof',[4.5,.4,3.8],[-35,3.05,149],0x4d6860);box('Shrine roof ridge',[.3,.35,4],[-35,3.45,149],0x758776);
 for(const [x,z] of [[-38,146],[-32,146],[-42,123],[-23,143],[-33.5,111.5],[-22.5,111.5]]){cylinder('Stone lantern base',.35,.25,x,.12,z,0x7a8377,true);cylinder('Stone lantern column',.15,.9,x,.7,z,0x858c80);box('Lantern chamber',[.52,.5,.52],[x,1.4,z],0x81897b);box('Lantern roof',[.8,.15,.8],[x,1.77,z],0x5f7165);}
 // Clipped shrubs in rounded clusters (tamamono), one of them a flowering azalea.
 {const merged=new Merge();const greens=[0x46703f,0x5b8546,0x3f6640,0x6a9050];
  const clusters=[[-45,116],[-46,141],[-25,142],[-25,120],[-44,150],[-27.5,150.5]];
  const blobs=[[0,0,1.6],[1.5,.6,1.1],[-1.3,.8,1],[.4,-1.4,.9],[-.7,-1.1,.7]];
  clusters.forEach(([cx,cz],c)=>blobs.forEach(([dx,dz,r],b)=>{const x=cx+dx,z=cz+dz;
   if(((x+34)/8)**2+((z-132)/6)**2<1||GARDEN_PATHS.some(q=>q.points.slice(1).some((p,j)=>nearestSegment(x,z,q.points[j],p)<q.width/2+r*.9)))return;
   merged.add(new THREE.IcosahedronGeometry(1,2),new THREE.Matrix4().compose(new THREE.Vector3(x,r*.5,z),new THREE.Quaternion(),new THREE.Vector3(r*1.15,r*.72,r*1.15)),c===2&&b<3?0xd889a6:greens[(c+b)%4]);
   if(b===0)addCollider({id:'garden-shrub',x,z,w:r*2.4,d:r*2.4,height:1.2});}));
  group.add(merged.mesh('Clipped garden shrubs'));}
 world.group.add(bambooFence([[[-48,110],[-48,153],[-6,153],[-6,119.2]],[[-6,114.8],[-6,110]]].map(run=>run.map(([x,z])=>gardenPoint(x,z)))));
 for(const [x,z] of [[-42,144],[-26,143]]){box('Garden bench seat',[2.3,.12,.65],[x,.5,z],0x806547,true);for(const dx of [-.8,.8])box('Garden bench leg',[.16,.5,.4],[x+dx,.25,z],0x5c5541);const a=anchor([x,1,z+.9],'Sit beside the garden pond','seat','Garden pond bench','A quiet view of the pond and stone lanterns.');a.userData.seat={position:[gardenPoint(x,z)[0],0,gardenPoint(x,z)[1]],stand:[gardenPoint(x,z+.9)[0],0,gardenPoint(x,z+.9)[1]],eyeY:1.12,yaw:0,pitch:0};}
 const fish=[];for(let i=0;i<6;i++){const koi=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),mat(i%2?0xdc9861:0xd6ccae));koi.scale.set(.6,.5,2.5);group.add(koi);fish.push(koi);}
 anchor([-28,1.1,110],'Read the traditional garden guide','read','Aoba Traditional Garden','Enter through the stone gate. Walk the pond circuit or cross the wooden bridge. The small shrine is at the back; Umi-no-yu lies along the eastern garden path. Keep the pond clean and leave the stone lanterns undisturbed.');anchor([-35,1,146],'Visit the garden shrine','shrine','Garden shrine','A small island shrine above the pond.');
 return {group,fish,update(time){fish.forEach((k,i)=>{const a=time*.08+i; k.position.set(-34+Math.cos(a)*(3+i*.3),-.25,132+Math.sin(a)*(2+i*.2));k.rotation.y=-a;});}};
}

/**
 * Yotsume-gaki, the open bamboo fence round a Japanese garden: thick posts about every
 * 1.8 m, three bamboo rails lashed across them and a black tie at every crossing. Built
 * in world metres (the garden group is scaled) and merged into one mesh.
 */
export function bambooFence(runs,{height=1.05,spacing=1.8}={}){
 const pieces=[],up=new THREE.Vector3(0,1,0),straw=new THREE.Color(0xc2ad6a),post=new THREE.Color(0x9c8a50),cane=new THREE.Color(0xd2bf7c),tie=new THREE.Color(0x2a2420);
 const put=(g,colour,matrix)=>{g.applyMatrix4(matrix);const c=new Float32Array(g.attributes.position.count*3);for(let i=0;i<c.length;i+=3)colour.toArray(c,i);g.setAttribute('color',new THREE.BufferAttribute(c,3));pieces.push(g.index?g.toNonIndexed():g);};
 const rails=[.32,.64,.96].map(f=>f*height);
 for(const run of runs)for(let i=1;i<run.length;i++){
  const [ax,az]=run[i-1],[bx,bz]=run[i],len=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(len/spacing)),yaw=Math.atan2(bx-ax,bz-az),ox=(bz-az)/len*.07,oz=-(bx-ax)/len*.07;
  for(let k=0;k<=n;k++){if(i>1&&k===0)continue;const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n;
   put(new THREE.CylinderGeometry(.045,.05,height+.12,7),post,new THREE.Matrix4().makeTranslation(x,(height+.12)/2,z));
   put(new THREE.CylinderGeometry(.05,.05,.02,7),post.clone().multiplyScalar(.8),new THREE.Matrix4().makeTranslation(x,height+.13,z));
   for(const y of rails)put(new THREE.BoxGeometry(.1,.06,.1),tie,new THREE.Matrix4().compose(new THREE.Vector3(x+ox*.7,y,z+oz*.7),new THREE.Quaternion().setFromAxisAngle(up,yaw+Math.PI/4),new THREE.Vector3(1,1,1)));
  }
  const q=new THREE.Quaternion().setFromUnitVectors(up,new THREE.Vector3(bx-ax,0,bz-az).normalize());
  // The canes: thin verticals every 30 cm, alternating either side of the rails, which make
  // the open grid ("four eyes") a yotsume-gaki is named for.
  const canes=Math.round(len/.3);
  for(let k=1;k<canes;k++){if(k%6===0)continue;const t=k/canes,side=k%2?1:-1,x=ax+(bx-ax)*t+ox*side*.75,z=az+(bz-az)*t+oz*side*.75;
   put(new THREE.CylinderGeometry(.016,.018,height*.94,5),cane,new THREE.Matrix4().makeTranslation(x,height*.47,z));}
  for(const y of rails)put(new THREE.CylinderGeometry(.03,.03,len+.24,6),straw,new THREE.Matrix4().compose(new THREE.Vector3((ax+bx)/2+ox,y,(az+bz)/2+oz),q,new THREE.Vector3(1,1,1)));
 }
 const mesh=new THREE.Mesh(mergeGeometries(pieces,false),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}));
 pieces.forEach(g=>g.dispose());mesh.name='Garden bamboo fence';mesh.castShadow=true;mesh.receiveShadow=true;
 return mesh;
}

/** Pieces of one look gathered into a single vertex-coloured mesh. */
class Merge{
 constructor(){this.pieces=[];}
 add(geometry,matrix,hex){const g=(geometry.index?geometry.toNonIndexed():geometry).applyMatrix4(matrix),c=new THREE.Color(hex),col=new Float32Array(g.attributes.position.count*3);for(let i=0;i<col.length;i+=3)c.toArray(col,i);g.deleteAttribute('uv');g.setAttribute('color',new THREE.BufferAttribute(col,3));this.pieces.push(g);}
 mesh(name){const m=new THREE.Mesh(mergeGeometries(this.pieces,false),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true}));this.pieces.forEach(g=>g.dispose());m.name=name;m.castShadow=true;m.receiveShadow=true;return m;}
}

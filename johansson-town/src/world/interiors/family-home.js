import * as THREE from '../../../vendor/three.module.js';

/**
 * Inside an island family's house: one tatami room the way Okinawan homes are laid out,
 * with the family altar (仏壇, the tōtōmē) against the back wall where the ancestors'
 * tablets stand, a low table, a futon for each person who lives here folded against the
 * wall by day, the kitchen through the side, the television, and a nameboard by the door
 * that says who they are and what they do (people/island-households.js). A house to let
 * is the same room, swept and empty, with the rental note on the floor.
 *
 * Room contract as everywhere: door on +z, enter facing -z, bounds/spawn/exit.
 */
const W=6.4,D=5.6,H=2.7;
const mats=new Map();
const mat=c=>{if(!mats.has(c))mats.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.85}));return mats.get(c);};
export const FAMILY_HOME_LAYOUT=Object.freeze({bounds:{minX:-W/2+.05,maxX:W/2-.05,minZ:-D/2+.05,maxZ:D/2-.05},spawn:[0,0,D/2-.6],exit:[0,1.1,D/2-.04],yaw:0});

export function buildFamilyHome({room,reg,action,collider=()=>{},household,title='Home'}){
 const group=new THREE.Group();group.name='Family home · '+title;room.add(group);
 const box=(size,pos,c,name)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));m.position.set(...pos);m.receiveShadow=true;if(name)m.name=name;group.add(m);return m;};
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);o.userData.npcInteraction=false;group.add(o);reg(o,label,fn,true);};
 const hw=W/2,hd=D/2,empty=!household||household.toLet||!household.members.length;
 // Tatami, walls with a timber dado line, ceiling, the door gap on +z.
 box([W,.04,D],[0,-.02,0],0xcbc38c,'Tatami');
 for(const x of [-hw/2,0,hw/2])box([.04,.012,D],[x,.006,0],0x3f4a3a);box([W,.012,.04],[0,.006,0],0x3f4a3a);
 for(const [len,pos,ry] of [[W,[0,0,-hd],0],[D,[-hw,0,0],Math.PI/2],[D,[hw,0,0],-Math.PI/2],[hw-.55,[-(hw+.55)/2,0,hd],Math.PI],[hw-.55,[(hw+.55)/2,0,hd],Math.PI]]){
  const g=new THREE.Group();g.position.set(...pos);g.rotation.y=ry;group.add(g);
  const p=(size,at,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(c));m.position.set(...at);g.add(m);};
  p([len,H,.06],[0,H/2,0],0xeee3cc);p([len,.05,.08],[0,.95,.02],0x6d5238);p([len,.08,.08],[0,.04,.02],0x5a4430);
 }
 box([1.1,H-2.05,.06],[0,2.05+(H-2.05)/2,hd],0xeee3cc);box([W,.04,D],[0,H+.02,0],0xf3ece0,'Ceiling');
 group.add(new THREE.HemisphereLight(0xfff0d8,0x8a7a64,1.15));
 const lamp=new THREE.PointLight(0xffe8c8,.7,8,2);lamp.position.set(0,2.4,0);group.add(lamp);
 // The kitchen through the west side; a house to let comes with it.
 box([.6,.9,1.6],[-hw+.32,.45,1.0],0xd8d2c4,'Kitchen counter');box([.62,.04,1.62],[-hw+.32,.92,1.0],0x9aa3a6);collider(-hw+.32,1.0,.6,1.6,.95);
 if(!empty){box([.55,1.3,.55],[-hw+.32,.65,-.3],0xe8ebe6,'Fridge');collider(-hw+.32,-.3,.6,.6,1.3);}
 if(empty){
  box([.3,.01,.42],[0,.01,.6],0xf4ecd6,'Rental note');
  anchor([0,.5,.6],'Read the rental note',()=>action('read',"For rent · Rental house","2DK, tatami, kitchen and bath, water tank on the roof. ¥28,000 a month. Enquiries to the town hall, Residents Division. Somebody new could live here."));
  return {...FAMILY_HOME_LAYOUT,home:true,toLet:true};
 }
 // The family altar: lacquer cabinet, the tablets, offerings of fruit and an incense bowl.
 box([1.2,1.3,.5],[-1.2,.65,-hd+.3],0x3a2a20,'Butsudan');box([1.0,.5,.05],[-1.2,1.1,-hd+.56],0x8a6a2a);
 for(let i=0;i<3;i++)box([.08,.32,.04],[-1.5+i*.3,1.12,-hd+.5],0x1c1612,'Ancestral tablet');
 box([.18,.08,.18],[-1.2,1.32,-hd+.42],0xd9a43a,'Incense bowl');
 for(const [x,c] of [[-1.55,0xe8742a],[-.85,0xf4d23c]])box([.12,.12,.12],[x,1.36,-hd+.42],c,'Offering');
 collider(-1.2,-hd+.3,1.2,.5,1.3);
 // Low table and cushions; the TV in the corner.
 box([1.1,.05,.75],[.2,.36,-.3],0x6b4a32,'Low table');collider(.2,-.3,1.1,.75,.4);
 for(const [x,z] of [[.2,.35],[.2,-.95],[-.55,-.3],[.95,-.3]])box([.48,.07,.48],[x,.04,z],0x3f6f8a);
 box([.8,.42,.4],[hw-.6,.21,-hd+.3],0x6b4a32);box([.58,.44,.42],[hw-.6,.64,-hd+.32],0x2b2b2b,'Television');collider(hw-.6,-hd+.3,.8,.4,.9);
 // One futon per person, folded along the east wall, each in their own colour.
 household.members.forEach((m,i)=>{const c=[0x2c3e5c,0xb2453b,0x3f6a4a,0x8a6aa8][i%4];
  box([.95,.36,.7],[hw-.55,.18+i*.0,-.6+i*.78],0xe9dfc8,'Futon '+m.name);box([.9,.1,.65],[hw-.55,.41,-.6+i*.78],c);});
 collider(hw-.55,-.6+(household.members.length-1)*.39,.95,household.members.length*.78,.5);
 // Who lives here, on the board by the door.
 box([.5,.7,.03],[1.6,1.5,hd-.05],0xf4ecd6,'Household board');
 anchor([1.6,1.4,hd-.4],'Read the household board',()=>action('read',title,household.members.map(m=>m.name+' — '+m.purpose).join('\n')));
 anchor([-1.2,1.1,-hd+.9],'Look at the family altar',()=>action('inspect','Tōtōmē · the family altar','The ancestors\' tablets in their lacquer case, a bowl of incense ash, an orange and a box of sweets. On the first and fifteenth of the month somebody lights three sticks and says the family\'s news out loud.'));
 if(household?.members?.some(m=>m.name==='Thuan')){box([.85,1.8,.5],[-hw+.45,.9,-hd+.65],0x765343,'Thuan’s wardrobe');collider(-hw+.45,-hd+.65,.85,.5,1.8);anchor([-hw+.7,1.1,-hd+1.15],'Open Thuan’s wardrobe',()=>action('thuan-wardrobe'));}
 return {...FAMILY_HOME_LAYOUT,home:true};
}

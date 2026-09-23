/**
 * Minato Elementary & Junior High School (港小中学校), as laid out on the ground.
 *
 * A small combined school of the kind a rural Okinawan port kept in 1997: one
 * two-storey reinforced-concrete block from the early seventies, an open breezeway
 * along its field side, a coral-sand sports ground in front, and the sea behind it on
 * two sides, held off by a seawall and a bank of tetrapods. It stands south of the east
 * lawn, through a gate in the windbreak, at the foot of the tunnel headland.
 *
 * Everything that has to agree -- the Blender model (tools/blender/build-school.py),
 * the walkable ground, the colliders, the map -- reads its measurements from here.
 * World metres; +z runs away from the harbour.
 */
export const SCHOOL=Object.freeze({
 id:'school-grounds',surface:'stone',
 /** The yard you can walk on, wall to wall. */
 minX:12.4,maxX:40.6,minZ:24.6,maxZ:51.3,
 /** The classroom block: field face (north), sea face (south). */
 building:Object.freeze({minX:14.5,maxX:39.5,minZ:40.5,maxZ:48.5,floor:.15,storey:3.3,roof:6.75,parapet:7.45}),
 /** The open breezeway along the field face, under the upper corridor. */
 corridor:Object.freeze({minZ:38.1,maxZ:40.5}),
 /** Column lines along the breezeway, one per structural bay. */
 bays:7,
 /** The stair tower over the entrance, with the clock. */
 tower:Object.freeze({minX:18.4,maxX:22.6,minZ:40.5,maxZ:44.5,top:9.9}),
 /** The entrance (shōkōguchi) in the field face, lined up on the gate. */
 genkan:Object.freeze({x:20.5,half:.95,z:40.5}),
 /** The sports ground. */
 field:Object.freeze({minX:13.2,maxX:39.8,minZ:28.8,maxZ:37.3}),
 /** The gate through the windbreak from the lawn. */
 gate:Object.freeze({x:20.5,half:1.75,z:24.6}),
 /** Sea on two sides: the seawall's inner faces. */
 seawall:Object.freeze({east:41,south:51.6,height:1.05}),
 /** The perimeter wall against the headland. */
 westWall:12,
 bikeShed:Object.freeze({minX:12.8,maxX:17.4,minZ:25.3,maxZ:28}),
 wash:Object.freeze({x:37.1,z:37.55,w:2.8,d:.7}),
 bars:Object.freeze({x:38.3,z:32.5,w:2.6}),
 flagpole:Object.freeze({x:30.5,z:37.35}),
 sandpit:Object.freeze({minX:35.8,maxX:39.4,minZ:29.6,maxZ:31.6}),
});
const B=SCHOOL.building;
/** x of each column line along the breezeway, west to east. */
export const SCHOOL_COLUMNS=Object.freeze(Array.from({length:SCHOOL.bays+1},(_,i)=>+(B.minX+i*(B.maxX-B.minX)/SCHOOL.bays).toFixed(4)));

/** Fukugi, planted close as a windbreak along the headland wall and the field's east side. */
export const FUKUGI=Object.freeze([
 ...Array.from({length:10},(_,i)=>[12.95,26.9+i*2.45]),
 ...Array.from({length:4},(_,i)=>[40.05,26.2+i*2.55]),
 [13.4,49.6],[16.2,50.4],[37.6,50.2],[40.1,49.6],
].map(p=>Object.freeze(p)));

export function schoolAt(x,z,r=0){
 return x>=SCHOOL.minX+r&&x<=SCHOOL.maxX-r&&z>=SCHOOL.minZ&&z<=SCHOOL.maxZ-r;
}

/** Everything on the campus that stops you. */
export function schoolColliders(){
 const list=[];
 const add=(id,x0,x1,z0,z1,height)=>list.push({id,x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,height});
 add('school-block',B.minX,B.maxX,B.minZ,B.maxZ,B.parapet);
 for(const x of SCHOOL_COLUMNS)add('school-column',x-.2,x+.2,SCHOOL.corridor.minZ,SCHOOL.corridor.minZ+.4,B.roof);
 const w=SCHOOL.wash;add('school-wash-station',w.x-w.w/2,w.x+w.w/2,w.z-w.d/2,w.z+w.d/2,1.1);
 const s=SCHOOL.bikeShed;add('school-bike-shed',s.minX,s.maxX,s.minZ+.9,s.maxZ,2.3);
 const g=SCHOOL.gate;for(const side of [-1,1])add('school-gatepost',g.x+side*g.half-.35,g.x+side*g.half+.35,g.z-.35,g.z+.35,2.3);
 add('school-flagpole',SCHOOL.flagpole.x-.15,SCHOOL.flagpole.x+.15,SCHOOL.flagpole.z-.15,SCHOOL.flagpole.z+.15,9);
 const b=SCHOOL.bars;for(const dx of [-b.w/2,0,b.w/2])add('school-iron-bars',b.x+dx-.08,b.x+dx+.08,b.z-.08,b.z+.08,1.4);
 for(const [x,z] of FUKUGI)add('school-fukugi',x-.35,x+.35,z-.35,z+.35,6);
 return list;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';

/**
 * No flashing surfaces in Minato (the owner, 20 October 2026, playing on his iPhone: "Lots of flashing meshes"). Two faces
 * that look the same way, lie within 2 mm of one plane and overlap are drawn at one depth, and a phone's depth buffer
 * picks a different winner from frame to frame: the facade glass in the sliding door's plane, the earth of a raised bed in
 * its edging boards' faces, a corner post in its wall's, the signboard rails in the board's. tools/z-fighting.mjs finds
 * them in the town as the game builds it (each piece of a merged mesh by the line that made it, a face hidden inside
 * another solid left out, decal layers drawn with polygon offset left out). 2 mm is what a 24-bit depth buffer with the
 * game's near plane (0.15 m, game.js) still separates at about 70 m; nothing in town may flash over more than 0.05 m².
 */
installDOM();globalThis.self=globalThis;
// The kit and the static batches record which line made each merged piece, so a finding names its source.
globalThis.__KIT_TRACE__=true;
const {createTown}=await import('../src/world/town.js');const {createBusinesses}=await import('../src/world/businesses.js');
const {coplanarOverlaps}=await import('../tools/z-fighting.mjs');
const scene=new THREE.Scene();
createTown({scene,sites:createBusinesses(),townMode:'peninsula',mobile:true,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
delete globalThis.__KIT_TRACE__;
scene.updateMatrixWorld(true);

/** The places the owner photographed: there, nothing over 0.01 m² (a hand's breadth square) may flash. */
const OWNER={
 'Sakura Shōten, its office storey and side walls':{minX:-22,maxX:-4.5,minZ:-37,maxZ:-17},
 'the Minato izakaya and Sato Ramen':{minX:-17,maxX:-5.5,minZ:-17,maxZ:-4},
 'Nakamura Zenzai':{minX:2,maxX:15,minZ:-16,maxZ:-3},
};
/** All of Minato: Main Street, Kitahama, the police station, the docks and the port building, and everything between. */
const MINATO={minX:-45,maxX:45,minZ:-52,maxZ:66};
// What moves is not scenery: the boats under way, the traffic, the birds and the crabs are placed by the clock.
const moving=o=>{for(let p=o;p;p=p.parent)if(p.userData.dynamicProp||p.userData.vehicle||/^(Scheduled island cargo ship|Road traffic|Harbour gulls and garden butterflies|Beach life)$/.test(p.name))return true;return false;};
const TOLERANCE=.002,MIN_AREA=.05,OWNER_AREA=.01;
const found=coplanarOverlaps(scene,{regions:[MINATO],tolerance:TOLERANCE,minArea:OWNER_AREA,skip:moving});
const inside=(f,b)=>f.at[0]>=b.minX&&f.at[0]<=b.maxX&&f.at[2]>=b.minZ&&f.at[2]<=b.maxZ;
const where=f=>`${f.a} | ${f.b}: ${f.area.toFixed(3)} m² at ${f.at.join(', ')} facing ${f.normal.join(', ')}`;

test('no two surfaces in Minato share a plane over more than 0.05 m² (the flashing the owner saw)',()=>{
 assert.deepEqual(found.filter(f=>f.area>=MIN_AREA).map(where),[]);
});

for(const [name,box] of Object.entries(OWNER))test(`${name}: nothing over 0.01 m² flashes`,()=>{
 assert.deepEqual(found.filter(f=>inside(f,box)).map(where),[]);
});

test('the scan finds what it is for: a pane laid in a wall, and nothing where a decal is offset or a face is buried',()=>{
 const g=new THREE.Group(),wall=new THREE.Mesh(new THREE.BoxGeometry(2,2,.2),new THREE.MeshStandardMaterial({color:0xeeeeee}));wall.position.z=-.1;g.add(wall);
 const pane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({color:0x335577}));pane.position.z=.0005;g.add(pane);
 assert.equal(coplanarOverlaps(g).length,1,'a pane half a millimetre off its wall flashes');
 pane.material.polygonOffset=true;pane.material.polygonOffsetFactor=-1;pane.material.polygonOffsetUnits=-1;
 assert.equal(coplanarOverlaps(g).length,0,'drawn with polygon offset, it does not');
 pane.material.polygonOffset=false;pane.position.z=.01;
 assert.equal(coplanarOverlaps(g).length,0,'a centimetre proud, it does not');
 // A box flush with a bigger box's face, inside the third: never seen.
 const hidden=new THREE.Group(),a=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xff0000})),b=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshStandardMaterial({color:0x00ff00}));
 b.position.set(0,0,.25);hidden.add(a,b);const cover=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,.4),new THREE.MeshStandardMaterial({color:0x0000ff}));cover.position.z=.6;hidden.add(cover);
 assert.equal(coplanarOverlaps(hidden).length,0,'faces buried in another solid are not reported');
 cover.removeFromParent();assert.equal(coplanarOverlaps(hidden).length,1,'uncovered, they are');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {HOME_CATALOGUE,homeFurnitureFactory,restoreHomeItems} from '../src/build/home-furniture.js';
import {createPlacements,footprint} from '../src/build/placements.js';
import {buildMayorHome,MAYOR_HOME_FLOOR} from '../src/world/interiors/town-hall.js';
import {restoreHomeDecor,setHomeDecor} from '../src/progression/home-decor.js';

installDOM();
const lookup=id=>HOME_CATALOGUE.find(f=>f.id===id)||null;
function home(){
 const room=new THREE.Group(),colliders=[];
 buildMayorHome({room,reg(){},action(){},collider:(x,z,w,d,height=2.8,minY=0)=>colliders.push({x,z,w,d,height,minY}),exit(){}});
 const group=room.getObjectByName('Mayor’s home');
 const placements=createPlacements({group,colliders,factory:homeFurnitureFactory(),walkable:MAYOR_HOME_FLOOR.walkable,heightAt:()=>0,doors:MAYOR_HOME_FLOOR.keepClear,lookup,needWhy:false});
 return {room,group,colliders,placements};
}

test('every home piece is real-sized, says what it is for, and its model fits the footprint it claims',()=>{
 const make=homeFurnitureFactory();
 for(const f of HOME_CATALOGUE){
  assert.ok(f.purpose.length>25,f.id);
  const {object}=make[f.id](0,0,0),size=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
  assert.ok(size.x<=f.size[0]+.06&&size.z<=f.size[1]+.06,f.id+' model '+size.toArray()+' within '+f.size);
  assert.ok(Math.abs(size.y-f.size[2])<.12,f.id+' height '+size.y+' is the claimed '+f.size[2]);
  assert.ok(new THREE.Box3().setFromObject(object).min.y>=-1e-6,f.id+' does not sink into the tatami');
 }
});

test('furniture goes on the open floor of the main room, never into the wall, the WC or the existing furniture',()=>{
 const {placements}=home();
 assert.equal(placements.place({kind:'plant',x:-2.5,z:.6}).ok,true,'a palm in the open west corner');
 assert.match(placements.check({kind:'tansu',x:3.2,z:0})[0],/ground/,'through the east wall');
 assert.match(placements.check({kind:'andon',x:2.8,z:2.2})[0],/ground/,'inside the bath');
 assert.match(placements.check({kind:'side-table',x:-.6,z:-.4})[0],/overlaps/,'on the low table');
 assert.match(placements.check({kind:'tansu',x:0,z:2.3}).join(' '),/genkan|doorway|way to/,'in the genkan');
 assert.match(placements.check({kind:'cushion',x:.15,z:-.4}).join(' '),/way to/,'on a seat at the table');
});

test('a rug lies on the floor under other furniture, and people walk over it',()=>{
 const {placements,colliders}=home(),n=colliders.length;
 assert.equal(placements.place({kind:'rug',x:-1.3,z:.9}).ok,true);
 assert.equal(colliders.length,n,'the rug adds nothing to bump into');
 assert.equal(placements.place({kind:'side-table',x:-1.3,z:.9}).ok,true,'a side table can stand on the rug');
});

test('arranged furniture is saved with the player, survives other decor choices, and bad saves are cleaned',()=>{
 const state={homeDecor:{wall:'harbour',items:[{id:'p1',kind:'plant',x:-2.5,z:.6,yaw:0},{id:'p1',kind:'plant',x:0,z:0},{id:'p2',kind:'spaceship',x:0,z:0},{id:'p3',kind:'andon',x:'nope',z:0}]}};
 assert.deepEqual(restoreHomeItems(state.homeDecor.items).map(p=>p.id),['p1']);
 assert.equal(setHomeDecor(state,'textile','coral'),true);
 assert.deepEqual(state.homeDecor.items?.map(p=>p.id),['p1'],'changing the cushions keeps the furniture');
 assert.equal(restoreHomeDecor(state.homeDecor).wall,'harbour');
 const {placements}=home();assert.deepEqual(placements.load(restoreHomeItems(state.homeDecor.items).map(p=>({...p,note:''}))),[]);
});

test('the keep-clear squares sit on the open floor, so they protect real places',()=>{
 for(const [x,z,s] of MAYOR_HOME_FLOOR.keepClear)assert.ok(footprint({x,z,w:s,d:s}).some(([px,pz])=>MAYOR_HOME_FLOOR.walkable(px,pz))||MAYOR_HOME_FLOOR.walkable(x,z),[x,z].join());
});

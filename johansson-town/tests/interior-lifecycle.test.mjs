import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';
const source=readFileSync(new URL('../src/game.js',import.meta.url),'utf8');
const clear=source.slice(source.indexOf('function clearRoom('),source.indexOf('\nfunction roomShell('));
const leave=source.slice(source.indexOf('function leaveRoom('),source.indexOf('\nfunction syncExteriorPlace('));

test('leaving an interior releases resources immediately and preserves borrowed assets and persistent interactions',()=>{
 for(const id of ['izakaya','market']){
  const room=new THREE.Group(),ownedGeometry=new THREE.BoxGeometry(),ownedMaterial=new THREE.MeshStandardMaterial(),ownedTexture=new THREE.Texture();ownedMaterial.map=ownedTexture;
  const owned=new THREE.Mesh(ownedGeometry,ownedMaterial),shared=new THREE.Group();shared.userData.sharedAsset=true;
  const borrowed=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial());shared.add(borrowed);room.add(owned,shared);
  const released=[];for(const [resource,label] of [[ownedGeometry,'geometry'],[ownedMaterial,'material'],[ownedTexture,'texture'],[borrowed.geometry,'borrowed geometry'],[borrowed.material,'borrowed material']])resource.addEventListener('dispose',()=>released.push(label));
  const calls=[],noop=()=>{},service={restore:noop,cancel:noop,dispose:noop,clear:noop,hide:noop};
  const persistent={userData:{persistentShop:true,hit:{inside:true}}},temporary={userData:{hit:{inside:true}}};
  const context={THREE,current:{id},room,roomColliders:[{}],interactables:[persistent,temporary],boxCache:new Map(),town:{visible:false},indoorCeilings:{},activeRoomLayout:{dispose:()=>calls.push('room disposed')},
   townSections:{invalidate:()=>calls.push('outside cache invalidated')},shopStreetView:{dispose:()=>calls.push('portal disposed')},showShopThroughWindow:()=>calls.push('live storefront'),sakuraShop:{hide:noop},
   replayInterrupted:noop,lowerPocket:noop,spawnScene:null,photoStudio:null,photoReturning:false,NAHA_ARRIVALS:{id:'arrivals'},CITY_RESTAURANT:{id:'restaurant'},activities:{state:{},close:noop},wearSwim:noop,inspector:null,resetInput:noop,
   document:{body:{classList:{remove:noop}}},$:()=>({classList:{add:noop}}),seated:true,parkSeat:{},active:{},yaw:.3,pitch:.1,hands:{},thirdPerson:false,syncView:noop,placeAtEntrance:noop,
   roomToStreet:y=>y,player:new THREE.Object3D(),yAxis:new THREE.Vector3(0,1,0),say:noop,syncExteriorPlace:()=>'',finishDungeon:noop,
   izakayaTV:null,storeService:null,ramenPlayerService:null,venueService:null,beerService:null,workplaceResidents:service,bookshopCustomers:service,neighbourChats:service,chatBubble:service,izakayaGuests:service,onsenGuests:service,homeGuests:service,hideRamen:noop};
  vm.runInNewContext(clear+'\n'+leave+'\nleaveRoom();',context);
  assert.equal(context.current,null);assert.equal(room.children.length,0,'Closed interior is not retained while outdoors');
  assert.deepEqual(released.sort(),['geometry','material','texture']);
  assert.deepEqual(calls,['outside cache invalidated','portal disposed','room disposed','live storefront']);
  assert.deepEqual(context.interactables,[persistent]);assert.equal(context.roomColliders.length,0);assert.equal(context.town.visible,true);
 }
});

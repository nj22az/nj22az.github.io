/** CPU Three.js integration check; WebGL review remains a separate gate. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import * as T from '../../../vendor/three.module.js';
import {GLTFLoader} from '../../../vendor/GLTFLoader.js';
import {PROFILES} from '../../../src/people/profiles.js';
import {IZAKAYA_DOOR} from '../../../src/people/social.js';
import {createIzakayaGuests} from '../../../src/people/izakaya-guests.js';
import {createVenueService} from '../../../src/people/venue-service.js';
const out=resolve(process.argv[2]),bytes=await readFile(resolve(out,'minato-barfly.glb'));
const asset=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const street=new T.Group(),room=new T.Group(),g=new T.Group(),profile=PROFILES.find(p=>p.name==='Barfly');street.add(g);g.add(asset.scene);g.position.set(IZAKAYA_DOOR[0],0,IZAKAYA_DOOR[1]);g.userData={hit:{inside:false},indoors:'izakaya'};
const person={profile,g},guests=createIzakayaGuests({world:{people:[person],homes:new Map()},parent:room});let minutes=1100;
const service=createVenueService({room,place:'izakaya',getCustomers:()=>[person],getMinutes:()=>minutes,ledger:{account(){throw Error('Unexpected account');},purchase(){throw Error('Unexpected charge');}}}),mixer=new T.AnimationMixer(asset.scene),samples=[];
for(const time of [179,180,599,600,1100,1439,1440]){
 minutes=time;guests.sync(time,1/60);service.update(1/60);const name=g.userData.socialPose==='Sleep'?'Barfly_Sleep_Loop':'Barfly_Drink_Loop';mixer.stopAllAction();mixer.clipAction(T.AnimationClip.findByName(asset.animations,name)).play();mixer.update(.5);room.updateMatrixWorld(true);
 let meshes=0,finite=true,minY=Infinity,maxY=-Infinity;
 asset.scene.traverse(o=>{if(!o.isSkinnedMesh)return;meshes++;o.skeleton.update();const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const v=new T.Vector3();o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld);finite&&=[v.x,v.y,v.z].every(Number.isFinite);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}});
 if(!finite||g.parent!==room||g.userData.socialPose!==(time%1440>=180&&time%1440<600?'Sleep':'Drink'))throw Error('Runtime integration failed');
 samples.push({minutes:time,clip:name,skinnedMeshes:meshes,minY,maxY,seatHeight:g.userData.seatHeight,finite});
}
const result={threeParse:true,scheduleAndServicePreserved:true,webGLVerified:false,samples};await writeFile(resolve(out,'runtime-review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));

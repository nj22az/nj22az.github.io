import * as THREE from '../../vendor/three.module.js';

export function createHands({scene,camera,say,consume}){
 const hold=new THREE.Group();camera.add(hold);scene.add(camera);hold.position.set(.24,-.29,-.48);hold.rotation.set(.1,-.2,-.15);
 const can=new THREE.Mesh(new THREE.CylinderGeometry(.047,.047,.145,20),new THREE.MeshStandardMaterial({color:0x91734e,roughness:.42,metalness:.45}));hold.add(can);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.043,.003,6,20),new THREE.MeshStandardMaterial({color:0xb8bab1,roughness:.22,metalness:.7}));rim.rotation.x=Math.PI/2;rim.position.y=.075;hold.add(rim);hold.visible=false;
 const dropped=hold.clone(true);scene.add(dropped);dropped.visible=false;let name=null,drop=0,drink=0,autoDrink=false;
 function offer(item,position,drinkAfter=false){name=item;autoDrink=drinkAfter;hold.position.set(.24,-.29,-.48);hold.rotation.set(.1,-.2,-.15);drop=.6;drink=0;hold.visible=false;dropped.visible=true;dropped.position.copy(position||camera.position);dropped.position.y=(position?.y||0)+.45;say(item+' · R to drink',3);}
 function drinkCan(){if(!name||drink>0||drop>0)return false;if(!consume(name)){hold.visible=false;name=null;return false;}drink=.85;return true;}
 return {offer,drink:drinkCan,get held(){return name;},get canDrink(){return !!name&&drop<=0&&drink<=0;},update(dt){if(drop>0){drop-=dt;dropped.position.y=dropped.position.y-dt*.5;if(drop<=0){dropped.visible=false;hold.visible=true;if(autoDrink){autoDrink=false;drinkCan();}}}if(drink>0){drink=Math.max(0,drink-dt);hold.position.y=-.29+Math.sin((.85-drink)/.85*Math.PI)*.22;hold.rotation.z=-.15+Math.sin((.85-drink)/.85*Math.PI)*.8;if(drink===0){hold.visible=false;say('The empty can goes back in your bag.',3);name=null;}}}};
}

import * as THREE from '../../vendor/three.module.js';
import {createDrinkProp} from '../people/izakaya-beer.js';

export function createHands({scene,camera,say,consume,onDrink=()=>{}}){
 // The can is held in front of the first-person camera; `view` hides it when the camera is behind him.
 const view=new THREE.Group(),hold=new THREE.Group();camera.add(view);view.add(hold);scene.add(camera);hold.position.set(.24,-.29,-.48);hold.rotation.set(.1,-.2,-.15);
 const can=new THREE.Mesh(new THREE.CylinderGeometry(.047,.047,.145,20),new THREE.MeshStandardMaterial({color:0x91734e,roughness:.42,metalness:.45}));hold.add(can);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.043,.003,6,20),new THREE.MeshStandardMaterial({color:0xb8bab1,roughness:.22,metalness:.7}));rim.rotation.x=Math.PI/2;rim.position.y=.075;hold.add(rim);hold.visible=false;
 const dropped=hold.clone(true);scene.add(dropped);dropped.visible=false;let name=null,drop=0,drink=0,autoDrink=false;
 function offer(item,position,drinkAfter=false){name=item;autoDrink=drinkAfter;hold.position.set(.24,-.29,-.48);hold.rotation.set(.1,-.2,-.15);drop=.6;drink=0;hold.visible=false;dropped.visible=true;dropped.position.copy(position||camera.position);dropped.position.y=(position?.y||0)+.45;say(item+' · R to drink',3);}
 // A sip from a drink on the table: it comes up to the mouth and goes back down.
 let sipProp=null,sipT=0;
 function sip(kind){if(sipT>0)return false;sipProp?.removeFromParent();sipProp=createDrinkProp(kind);sipProp.position.set(.08,-.34,-.42);sipProp.rotation.set(.15,0,-.05);view.add(sipProp);sipT=1.1;onDrink();return true;}
 function drinkCan(){if(!name||drink>0||drop>0)return false;if(!consume(name)){hold.visible=false;name=null;return false;}drink=.85;onDrink();return true;}
 return {offer,drink:drinkCan,set firstPersonVisible(value){view.visible=!!value;},sip,get held(){return name;},get canDrink(){return !!name&&drop<=0&&drink<=0;},update(dt){if(sipT>0&&sipProp){sipT=Math.max(0,sipT-dt);const k=Math.sin((1.1-sipT)/1.1*Math.PI);sipProp.position.set(.08-.06*k,-.34+.2*k,-.42+.08*k);sipProp.rotation.set(.15+1.1*k,0,-.05);if(sipT===0){sipProp.removeFromParent();sipProp=null;}}if(drop>0){drop-=dt;dropped.position.y=dropped.position.y-dt*.5;if(drop<=0){dropped.visible=false;hold.visible=true;if(autoDrink){autoDrink=false;drinkCan();}}}if(drink>0){drink=Math.max(0,drink-dt);hold.position.y=-.29+Math.sin((.85-drink)/.85*Math.PI)*.22;hold.rotation.z=-.15+Math.sin((.85-drink)/.85*Math.PI)*.8;if(drink===0){hold.visible=false;say('The empty can goes back in your bag.',3);name=null;}}}};
}

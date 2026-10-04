import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from '../avatars/build.js';
import {createAvatarAnimator} from '../avatars/animate.js';
import {FOOD_ART} from '../commerce/food-art.js';
import {GROUND_LAYER} from './ground-layers.js';
import {SHOPPING_LANE_ROWS,SHOPPING_LANE_SCALE,placeShoppingLaneGroup,placeShoppingLaneColliders} from './shopping-lane-plan.js';
const authorX=99.3,authorZ=SHOPPING_LANE_ROWS[2];
/** An open-front island ice-cream shop on Rainflower Lane. All branding and geometry are original. */
export function buildBlueCoralShop({world,group,register,onAction,authored=false}){
 const colliderStart=world.colliders.length,root=new THREE.Group();root.name='Blue Coral ice-cream shop';root.position.set(authorX,0,authorZ);group.add(root);
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.75});
 const box=(name,size,p,c,solid=false)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material(c));m.name=name;m.position.set(...p);root.add(m);if(solid)world.colliders.push({id:name,x:authorX+p[0],z:authorZ+p[2],w:size[0],d:size[2],height:p[1]+size[1]/2});return m;};
 box('Blue Coral tiled shop floor',[7,.06,8.5],[0,.03,0],0xcfc6a7);
 const tileY=GROUND_LAYER.apron+GROUND_LAYER.grass;
 for(let x=-3;x<3.4;x+=.6)for(let z=-4;z<4;z+=.6)if(Math.round((x+3)/.6+(z+4)/.6)%2===0)box('Cream and teal floor tiles',[.58,.008,.58],[x,tileY-.004,z],0x9baaa0);
 box('Cloud mural back wall',[.18,3.1,8.5],[3.45,1.55,0],0x699baf,true);for(const z of [-4.17,4.17])box('Blue Coral side wall',[7,3.1,.18],[0,1.55,z],0x85b5bf,true);
 for(const z of [-2.8,0,2.7])for(const [dz,y,r] of [[0,1.9,.65],[-.45,1.75,.4],[.45,1.75,.4]]){const cloud=new THREE.Mesh(new THREE.SphereGeometry(r,16,10),material(0xe7e3cc));cloud.scale.set(.025,.5,1);cloud.position.set(3.34,y,z+dz);root.add(cloud);}
 box('Blue Coral weathered timber counter',[.95,.86,6.4],[1.45,.43,0],0x315e76,true);
 for(let z=-3.12;z<3.2;z+=.24)box('Blue counter timber boards',[.035,.75,.19],[.955,.42,z],Math.round((z+3.12)/.24)%3?0x456d7c:0x698386);
 box('Glass display steel tray',[1.18,.08,6.6],[1.38,.9,0],0x9aa5a4);
 const glass=new THREE.MeshPhysicalMaterial({color:0xd7f1f3,transparent:true,opacity:.20,roughness:.08,depthWrite:false,side:THREE.DoubleSide});
 const pane=new THREE.Mesh(new THREE.PlaneGeometry(6.55,.72),glass);pane.rotation.y=-Math.PI/2;pane.position.set(.80,1.25,0);root.add(pane);
 const hood=new THREE.Mesh(new THREE.PlaneGeometry(6.55,.80),glass);hood.rotation.set(-Math.PI/2,0,Math.PI/2);hood.position.set(1.2,1.60,0);root.add(hood);
 for(const z of [-3.28,3.28]){const arc=new THREE.CatmullRomCurve3([new THREE.Vector3(.79,.90,z),new THREE.Vector3(.79,1.45,z),new THREE.Vector3(1.00,1.6,z),new THREE.Vector3(1.60,1.6,z)]);root.add(new THREE.Mesh(new THREE.TubeGeometry(arc,18,.045,8,false),material(0x697b83)));}
 for(let i=0;i<8;i++){const z=-2.8+i*.8;box('Scoop tub',[.65,.09,.65],[1.35,.97,z],0xb6c5c4);const scoop=new THREE.Mesh(new THREE.SphereGeometry(.23,16,12),material([0xbe9ac6,0xf3e2bf,0xe2a59b,0x94b895][i%4]));scoop.scale.y=.38;scoop.position.set(1.35,1.02,z);root.add(scoop);}
 function sign(text,pos,width,height,bg='#345a70',ink='#fff2d3'){
  const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='bold 48px serif';text.split('\n').forEach((line,i)=>ctx.fillText(line,384,70+i*64,736));const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture}));m.rotation.y=-Math.PI/2;m.position.set(...pos);root.add(m);
 }
 sign('BLUE CORAL\nIsland ice cream',[.923,.49,0],2.4,.63);
 sign('BLUE CORAL\nIsland scoops · since 1981',[.30,3.32,0],3.3,.55,'#2f738d');
 sign('UBE · VANILLA · GUAVA\nOne cone ¥150\nFresh island scoops',[2.4,2.65,-2.25],2.1,.85);
 sign('ISLAND TEA\nCold bottle ¥120\nPlease order at the counter',[2.4,2.65,2.25],2.1,.85);
 if(typeof Image!=='undefined'){const t=new THREE.TextureLoader().load(FOOD_ART.icecream);t.colorSpace=THREE.SRGBColorSpace;const art=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.02}));art.rotation.y=-Math.PI/2;art.position.set(2.39,2.38,0);root.add(art);}
 for(const z of [-2.4,2.4]){box('Pendant light cable',[.02,.58,.02],[1.3,2.94,z],0x374d55);const shade=new THREE.Mesh(new THREE.ConeGeometry(.3,.15,20,1,true),material(0xf4e8ca));shade.position.set(1.3,2.60,z);root.add(shade);}
 const seller=buildAvatar({name:'Blue Coral attendant',body:{silhouette:'feminine',height:.46},hair:{style:'bob',colour:'#3a2618'},outfit:{top:'apron',topColour:'#b2a2ce',bottom:'pleatedskirt',bottomColour:'#58687b',footwear:'shoes',shoes:'#f4f1ea',accent:'#f4f1ea'}},{shadows:false,faceSize:128});const staff=new THREE.Group();staff.position.set(2.6,0,.7);staff.rotation.y=-Math.PI/2;seller.root.rotation.y=0;staff.add(seller.root);root.add(staff);const motion=createAvatarAnimator(seller);
 const anchor=(z,label,fn)=>{const a=new THREE.Object3D();a.position.set(.05,1,z);root.add(a);register(a,label,fn);};
 anchor(0,'Buy an island scoop at Blue Coral',()=>onAction('buy','Blue Coral island ice cream',{cost:150,item:'Blue Coral ice cream',text:'A freshly scooped cone: ube and island vanilla. ¥150, from the blue glass counter on Rainflower Lane.'}));
 anchor(2.5,'Buy Blue Coral island tea',()=>onAction('buy','Blue Coral island tea',{cost:120,item:'Green tea',text:'A chilled bottle of island tea. ¥120.'}));
 anchor(-2.5,'Talk to the Blue Coral attendant',()=>{seller.paintFace({expression:'happy'});onAction('read','Blue Coral attendant','Welcome! The ube scoop is our favourite. Take your time at the glass counter; the little benches outside catch the sea breeze.');});
 // The compact shop floor must not squeeze the attendant's body.
 staff.scale.set(1/SHOPPING_LANE_SCALE,1,1/SHOPPING_LANE_SCALE);
 if(!authored){placeShoppingLaneGroup(root);placeShoppingLaneColliders(world.colliders,colliderStart);}
 return {root,update(){motion.update(1/60,{expression:seller.faceState.expression,floorHeight:tileY});}};
}

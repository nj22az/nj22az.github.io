import * as THREE from '../../vendor/three.module.js';

/**
 * The children of the 5・6年 class, and their teacher.
 *
 * Built from rounded shapes rather than rigged models: they sit at their desks, turn
 * their heads, eat, and stand behind the serving table in smocks, and that is all the
 * room asks of them. They face +z in their own frame; the classroom turns them.
 *
 * Ten- to twelve-year-olds in the plain clothes an Okinawan elementary school wore in
 * 1997 -- T-shirts and shorts, white indoor shoes with a coloured toe -- and, for the
 * lunch squad, the white smock, cap and gauze mask.
 */
const mats=new Map();
const mat=(hex,rough=.75)=>{const key=hex+':'+rough;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color:hex,roughness:rough}));return mats.get(key);};
const UP=new THREE.Vector3(0,1,0);

/** A rounded limb from a to b. */
function limb(parent,a,b,r,m){
 const d=new THREE.Vector3().subVectors(b,a),len=d.length();
 const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.001,len),4,10),m);
 mesh.position.copy(a).addScaledVector(d,.5);mesh.quaternion.setFromUnitVectors(UP,d.normalize());
 mesh.castShadow=true;parent.add(mesh);return mesh;
}
const v=(x,y,z)=>new THREE.Vector3(x,y,z);

/**
 * @param {object} spec
 * @param {'seated'|'standing'} [spec.pose]
 * @param {number} [spec.shirt] @param {number} [spec.bottom] @param {number} [spec.hair]
 * @param {boolean} [spec.girl] @param {boolean} [spec.adult] @param {boolean} [spec.smock]
 * @param {number} [spec.skin] @param {number} [spec.toe] indoor-shoe band colour (grade)
 */
export function buildFigure({pose='seated',shirt=0x5f86b5,bottom=0x2d3a52,hair=0x1c1714,girl=false,adult=false,smock=false,skin=0xd9a57c,toe=0x3f6fb0,name=''}={}){
 const root=new THREE.Group();root.name=name||'Pupil';
 const body=new THREE.Group();root.add(body);
 const s=adult?1.22:1;body.scale.setScalar(s);
 const skinM=mat(skin,.7),shirtM=mat(smock?0xf6f5f0:shirt,.85),bottomM=mat(bottom,.85),hairM=mat(hair,.55),shoeM=mat(0xf1efe8,.6),toeM=mat(toe,.6),sockM=mat(0xf4f2ec,.9);
 const seated=pose==='seated';
 const hipY=seated?.44/s:.68,shoulderY=hipY+.42,headY=shoulderY+.17;
 // Legs.
 const legs=[];
 for(const side of [-1,1]){
  const hip=v(side*.075,hipY,0);
  const knee=seated?v(side*.08,hipY,.36):v(side*.075,.36,0);
  const ankle=seated?v(side*.085,.08,.4):v(side*.075,.07,0);
  const thigh=limb(body,hip,knee,.062,girl&&!adult?bottomM:bottomM);
  const shin=limb(body,knee,ankle,.048,girl||adult?skinM:skinM);
  const sock=limb(body,v(ankle.x,ankle.y+.07,ankle.z),ankle,.05,sockM);
  const shoe=new THREE.Mesh(new THREE.BoxGeometry(.085,.06,.2),shoeM);shoe.position.set(ankle.x,.03,ankle.z+.05);body.add(shoe);
  const band=new THREE.Mesh(new THREE.BoxGeometry(.088,.025,.05),toeM);band.position.set(ankle.x,.05,ankle.z+.13);body.add(band);
  legs.push(thigh,shin,sock);
 }
 if(adult){legs.forEach(l=>{if(l.material===skinM)l.material=bottomM;});}
 // Hips and torso.
 const pelvis=new THREE.Mesh(new THREE.SphereGeometry(.14,14,10),bottomM);pelvis.scale.set(1,.55,.8);pelvis.position.set(0,hipY+.02,seated?.02:0);body.add(pelvis);
 const torso=new THREE.Group();torso.position.set(0,hipY,0);body.add(torso);
 const chest=new THREE.Mesh(new THREE.CapsuleGeometry(smock?.145:.13,.26,4,12),shirtM);chest.position.y=.22;chest.scale.set(1,1,.72);chest.castShadow=true;torso.add(chest);
 if(girl&&!adult&&!seated){const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.15,.22,.3,14),bottomM);skirt.position.y=-.1;torso.add(skirt);}
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,.08,8),skinM);neck.position.y=.43;torso.add(neck);
 // Head, hair, face.
 const head=new THREE.Group();head.position.set(0,headY-hipY,0);torso.add(head);
 const skull=new THREE.Mesh(new THREE.SphereGeometry(.105,18,14),skinM);skull.scale.set(.95,1.04,.98);skull.castShadow=true;head.add(skull);
 const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.113,18,12,0,Math.PI*2,0,Math.PI*.56),hairM);hairCap.rotation.x=-.28;hairCap.position.set(0,.012,-.008);head.add(hairCap);
 if(girl){
  const back=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.12,4,12),hairM);back.position.set(0,-.05,-.05);back.scale.set(1.05,1,.7);head.add(back);
  if(!adult){const tail=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),hairM);tail.position.set(0,.02,-.12);head.add(tail);}
 }else{const fringe=new THREE.Mesh(new THREE.BoxGeometry(.17,.04,.03),hairM);fringe.position.set(0,.07,.09);fringe.rotation.x=.4;head.add(fringe);}
 for(const side of [-1,1]){
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),mat(0x1a1612,.4));eye.position.set(side*.037,.012,.097);head.add(eye);
  const ear=new THREE.Mesh(new THREE.SphereGeometry(.024,8,6),skinM);ear.position.set(side*.1,0,0);ear.scale.set(.6,1,.8);head.add(ear);
 }
 const mouth=new THREE.Mesh(new THREE.BoxGeometry(.03,.006,.01),mat(0x8a4c3c,.6));mouth.position.set(0,-.045,.1);head.add(mouth);
 if(adult){const glasses=new THREE.Mesh(new THREE.TorusGeometry(.026,.004,6,14),mat(0x2a2a2a,.4));for(const side of [-1,1]){const g=glasses.clone();g.position.set(side*.04,.014,.104);head.add(g);}}
 let cap=null,mask=null;
 if(smock){
  // The cap goes over the hair, which is tucked up under it rather than showing through.
  hairCap.visible=false;
  cap=new THREE.Mesh(new THREE.SphereGeometry(.13,16,10,0,Math.PI*2,0,Math.PI*.52),mat(0xfbfaf6,.9));cap.position.y=.015;cap.rotation.x=-.2;head.add(cap);
  const band=new THREE.Mesh(new THREE.TorusGeometry(.123,.012,6,20),mat(0xf0efe8,.9));band.rotation.x=Math.PI/2-.2;band.position.y=.02;head.add(band);
  mask=new THREE.Mesh(new THREE.BoxGeometry(.1,.06,.02),mat(0xfbfaf6,.95));mask.position.set(0,-.035,.098);head.add(mask);
 }
 // Arms: shoulder, elbow, hand, each a joint the pose can move.
 const arms=[];
 for(const side of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(side*.165,.36,0);torso.add(shoulder);
  const upper=limb(shoulder,v(0,0,0),v(0,-.2,0),.042,smock?shirtM:(adult?shirtM:shirtM));
  const elbow=new THREE.Group();elbow.position.set(0,-.2,0);shoulder.add(elbow);
  const fore=limb(elbow,v(0,0,0),v(0,-.18,0),.036,adult||smock?shirtM:skinM);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),skinM);hand.position.set(0,-.2,0);elbow.add(hand);
  arms.push({shoulder,elbow,hand,side});
 }
 root.userData.figure={body,torso,head,arms,seated,adult,chest};
 setPose(root,seated?'desk':'stand');
 return root;
}

/**
 * Arm poses. 'desk' rests the forearms on the desk; 'eat' brings one hand to the mouth
 * and back; 'serve' holds a ladle out over the table; 'point' is the teacher at the
 * board; 'stand' hangs the arms at the sides.
 */
export function setPose(figure,pose,t=0){
 const f=figure.userData.figure;if(!f)return;
 const [left,right]=f.arms;
 const put=(arm,sx,sz,ex)=>{arm.shoulder.rotation.set(sx,0,sz*arm.side);arm.elbow.rotation.set(ex,0,0);};
 if(pose==='desk'){put(left,-.55,.12,-.95);put(right,-.55,.12,-.95);}
 else if(pose==='eat'){
  const lift=Math.max(0,Math.sin(t));put(left,-.6,.12,-1.0);put(right,-.55-lift*.55,.05,-1.0-lift*1.05);
 }
 else if(pose==='drink'){put(left,-.6,.12,-1.0);put(right,-1.15,.08,-1.9);}
 else if(pose==='serve'){put(left,-.7,.15,-.6);put(right,-.95+Math.sin(t)*.15,.05,-.45);}
 else if(pose==='point'){put(left,.05,.08,-.1);put(right,-1.9,.35,-.3);}
 else if(pose==='sweep'){put(left,-.7,.1,-.7);put(right,-.5+Math.sin(t)*.25,.15,-.8);}
 else {put(left,.05,.08,-.1);put(right,.05,.08,-.1);}
 f.pose=pose;
}

/** Small life: breathing, a turn of the head now and then. */
export function animateFigure(figure,time,seed=0){
 const f=figure.userData.figure;if(!f)return;
 f.chest.scale.y=1+Math.sin(time*1.6+seed)*.012;
 const glance=Math.sin(time*.23+seed*1.7);
 f.head.rotation.y=Math.abs(glance)>.8?Math.sign(glance)*.45*(Math.abs(glance)-.8)/.2:0;
 f.head.rotation.x=f.pose==='eat'?.18:Math.sin(time*.31+seed)*.04;
 if(f.pose==='eat'||f.pose==='serve'||f.pose==='sweep')setPose(figure,f.pose,time*2.1+seed);
}

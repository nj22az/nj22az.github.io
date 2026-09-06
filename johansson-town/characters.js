import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';

// Original procedural townspeople with adult human proportions.
// The previous Kenney Mini Character layer was deliberately removed: these residents
// are synchronous, local, individually modelled silhouettes with no streamed GLB swap.
export function createCharacters({mobile,onError}) {
  const actors=[];
  const materialCache=new Map();
  const skinCache=new Map();

  const profiles={
    player:{height:1.82,skin:0xc28c6e,hair:0x17191a,hairStyle:'short',top:0xe1ded2,outer:0x3b4b52,bottom:0x20282d,shoe:0x17191b,build:1.02,shoulders:1.02,waist:.98,age:38},
    'Aiko':{height:1.64,skin:0xd0a080,hair:0x211d1b,hairStyle:'bob',top:0xe4d9c7,outer:0x824b46,bottom:0x3c3e48,shoe:0x332622,build:.88,shoulders:.88,waist:.82,age:24,skirt:true},
    'Kenji':{height:1.76,skin:0xc89573,hair:0x181817,hairStyle:'crop',top:0xd7d1bc,outer:0x435f70,bottom:0x34434b,shoe:0x24282a,build:1.03,shoulders:1.07,waist:1.0,age:31},
    'Mrs Sato':{height:1.57,skin:0xc89b7d,hair:0x6f6a65,hairStyle:'bun',top:0xd8cdbd,outer:0x746174,bottom:0x4d4b51,shoe:0x322d2b,build:.94,shoulders:.94,waist:1.0,age:67,skirt:true,stoop:.075},
    'Harbour master':{height:1.73,skin:0xb98466,hair:0x34302d,hairStyle:'receding',top:0xc7c0ad,outer:0x334754,bottom:0x29343a,shoe:0x1e2326,build:1.16,shoulders:1.18,waist:1.12,age:58,cap:true}
  };

  function mat(color,roughness=.83){
    const key=`${color}/${roughness}`;
    if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness:0}));
    return materialCache.get(key);
  }
  function skinMat(color){
    if(!skinCache.has(color))skinCache.set(color,new THREE.MeshStandardMaterial({color,roughness:.78,metalness:0}));
    return skinCache.get(color);
  }
  function mesh(geometry,material,parent,position=[0,0,0],scale=[1,1,1]){
    const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.scale.set(...scale);m.castShadow=!mobile;m.receiveShadow=true;parent.add(m);return m;
  }
  function segment(parent,length,rTop,rBottom,material){
    return mesh(new THREE.CylinderGeometry(rTop,rBottom,length,10),material,parent,[0,-length/2,0]);
  }
  function addFace(head,p){
    const eyeMat=mat(0x171717,.7),browMat=mat(p.hair,.9);
    for(const x of [-.066,.066]){
      mesh(new THREE.SphereGeometry(.016,8,6),eyeMat,head,[x,.026,-.174],[1,.72,.55]);
      const brow=mesh(new THREE.BoxGeometry(.068,.012,.012),browMat,head,[x,.064,-.176]);brow.rotation.z=x<0?.06:-.06;
    }
    mesh(new THREE.ConeGeometry(.022,.075,7),skinMat(p.skin),head,[0,-.005,-.191],[.85,1,.85]).rotation.x=-Math.PI/2;
    const mouth=mesh(new THREE.BoxGeometry(.07,.009,.009),mat(0x6b4038,.9),head,[0,-.074,-.18]);mouth.rotation.z=.015;
  }
  function addHair(head,p){
    const hm=mat(p.hair,.92);
    if(p.hairStyle==='bob'){
      mesh(new THREE.SphereGeometry(.198,12,10),hm,head,[0,.085,.012],[1.03,.78,1.03]);
      mesh(new THREE.BoxGeometry(.34,.25,.12),hm,head,[0,-.02,.105]);
      mesh(new THREE.BoxGeometry(.065,.24,.1),hm,head,[-.165,-.015,.02]);
      mesh(new THREE.BoxGeometry(.065,.24,.1),hm,head,[.165,-.015,.02]);
    }else if(p.hairStyle==='bun'){
      mesh(new THREE.SphereGeometry(.198,12,10),hm,head,[0,.09,.018],[1.02,.62,1.02]);
      mesh(new THREE.SphereGeometry(.075,10,8),hm,head,[0,.13,.17],[1,1.1,1]);
    }else if(p.hairStyle==='receding'){
      mesh(new THREE.SphereGeometry(.195,12,10),hm,head,[0,.105,.035],[1,.42,1]);
      for(const x of [-.16,.16])mesh(new THREE.BoxGeometry(.045,.14,.11),hm,head,[x,.015,.03]);
    }else if(p.hairStyle==='crop'){
      mesh(new THREE.SphereGeometry(.198,12,10),hm,head,[0,.105,.02],[1.02,.55,1.02]);
      mesh(new THREE.BoxGeometry(.32,.06,.08),hm,head,[0,.11,-.125]);
    }else{
      mesh(new THREE.SphereGeometry(.2,12,10),hm,head,[0,.1,.025],[1.03,.58,1.03]);
      mesh(new THREE.BoxGeometry(.31,.075,.09),hm,head,[0,.095,-.13]);
    }
    if(p.cap){
      mesh(new THREE.SphereGeometry(.21,12,8),mat(0x293d4a,.88),head,[0,.14,.02],[1.08,.48,1.08]);
      mesh(new THREE.BoxGeometry(.25,.025,.11),mat(0x293d4a,.88),head,[0,.12,-.19]);
    }
  }
  function addClothes(root,p){
    const collar=mesh(new THREE.CylinderGeometry(.105,.145,.1,10),mat(p.top,.86),root,[0,1.44,-.005]);
    collar.scale.z=.85;
    mesh(new THREE.BoxGeometry(.39,.06,.27),mat(0x262726,.9),root,[0,.91,0]);
    if(p.skirt)mesh(new THREE.CylinderGeometry(.22,.31,.48,10),mat(p.bottom,.9),root,[0,.72,0]);
    if(p.age>50)mesh(new THREE.BoxGeometry(.035,.32,.025),mat(0x8b8173,.9),root,[.02,1.19,-.205]);
  }
  function build(entity,p,height){
    const root=new THREE.Group();
    const scale=(height||p.height)/1.8;
    root.scale.setScalar(scale);root.position.y=0;root.rotation.x=p.stoop||0;

    const torso=new THREE.Group();torso.position.set(0,1.08,0);root.add(torso);
    const jacket=mat(p.outer,.86),shirt=mat(p.top,.86),trouser=mat(p.bottom,.9),shoe=mat(p.shoe,.92),skin=skinMat(p.skin);
    mesh(new THREE.CylinderGeometry(.245*p.waist,.32*p.shoulders,.63,10),jacket,torso,[0,.18,0],[p.build,1,1]);
    mesh(new THREE.BoxGeometry(.14,.45,.025),shirt,torso,[0,.19,-.245]);
    for(const x of [-.085,.085]){const lapel=mesh(new THREE.BoxGeometry(.085,.31,.018),jacket,torso,[x,.31,-.264]);lapel.rotation.z=x<0?-.18:.18;}

    mesh(new THREE.CylinderGeometry(.075,.085,.12,9),skin,root,[0,1.48,0]);
    const head=new THREE.Group();head.position.set(0,1.67,-.005);root.add(head);
    mesh(new THREE.SphereGeometry(.19,14,11),skin,head,[0,0,0],[.9,1.12,.88]);
    addFace(head,p);addHair(head,p);

    const hips=new THREE.Group();hips.position.set(0,.88,0);root.add(hips);
    const legs=[];
    for(const side of [-1,1]){
      const hip=new THREE.Group();hip.position.set(side*.135*p.build,0,0);hips.add(hip);
      segment(hip,.43,.085,.095,trouser);
      const knee=new THREE.Group();knee.position.set(0,-.43,0);hip.add(knee);
      segment(knee,.42,.068,.078,trouser);
      const foot=mesh(new THREE.BoxGeometry(.14,.09,.28),shoe,knee,[0,-.44,-.055]);
      legs.push({hip,knee,foot,side});
    }
    const arms=[];
    for(const side of [-1,1]){
      const shoulder=new THREE.Group();shoulder.position.set(side*.34*p.shoulders,1.36,0);root.add(shoulder);
      segment(shoulder,.34,.062*p.build,.072*p.build,jacket);
      const elbow=new THREE.Group();elbow.position.set(0,-.34,0);shoulder.add(elbow);
      segment(elbow,.31,.05,.06,jacket);
      mesh(new THREE.SphereGeometry(.062,9,7),skin,elbow,[0,-.33,0],[.9,1.05,.9]);
      arms.push({shoulder,elbow,side});
    }
    addClothes(root,p);entity.add(root);
    return {root,head,torso,hips,legs,arms};
  }

  function attach(entity,file,height=1.8){
    try{
      const name=entity.userData.name||'player',profile=profiles[name]||profiles.player;
      const fallback=[...entity.children];
      const resolvedHeight=name==='player'?(height||profile.height):profile.height;
      const rig=build(entity,profile,resolvedHeight);
      fallback.forEach(o=>o.visible=false);
      const actor={entity,profile,rig,gesture:0,lastPosition:entity.position.clone(),phase:actors.length*1.731,speed:0};
      actors.push(actor);entity.userData.character=actor;return actor;
    }catch(error){onError?.(file,error);return null;}
  }
  function gesture(entity){const actor=entity.userData.character;if(actor)actor.gesture=1.25;}
  function update(dt){
    const t=performance.now()*.001;
    for(const a of actors){
      const raw=a.entity.position.distanceTo(a.lastPosition)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);
      a.speed=THREE.MathUtils.lerp(a.speed,Math.min(raw,6),1-Math.pow(.01,dt));
      const walking=a.speed>.06,gait=t*(a.speed>3.5?8.4:5.4)+a.phase,amp=walking?(a.speed>3.5?.58:.36):0;
      a.rig.legs.forEach((leg,i)=>{
        const swing=Math.sin(gait+i*Math.PI)*amp;
        leg.hip.rotation.x=THREE.MathUtils.lerp(leg.hip.rotation.x,swing,.22);
        leg.knee.rotation.x=THREE.MathUtils.lerp(leg.knee.rotation.x,Math.max(0,-swing)*.42,.2);
      });
      a.rig.arms.forEach((arm,i)=>{
        const swing=-Math.sin(gait+i*Math.PI)*amp*.72;
        const target=a.gesture>0&&i===1?-1.0:swing;
        arm.shoulder.rotation.x=THREE.MathUtils.lerp(arm.shoulder.rotation.x,target,.2);
        arm.shoulder.rotation.z=THREE.MathUtils.lerp(arm.shoulder.rotation.z,a.gesture>0&&i===1?-.28:0,.18);
        arm.elbow.rotation.x=THREE.MathUtils.lerp(arm.elbow.rotation.x,a.gesture>0&&i===1?-1.05:.08,.18);
      });
      const breathe=Math.sin(t*1.55+a.phase)*.004;
      a.rig.torso.position.y=1.08+breathe+(walking?Math.abs(Math.sin(gait))*.012:0);
      a.rig.head.rotation.y=Math.sin(t*.46+a.phase)*.035;
      if(a.gesture>0){a.gesture-=dt;a.rig.head.rotation.x=Math.sin((1.25-a.gesture)*8)*.055;}else a.rig.head.rotation.x=0;
    }
  }
  return {attach,gesture,update,actors};
}

import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';

// Johansson Town human rigs. These remain entirely local and synchronous so the town
// always has stable characters even when higher-detail external assets are unavailable.
export function createCharacters({mobile,onError,shadows=!mobile}) {
  const actors=[];
  const materialCache=new Map();
  const skinCache=new Map();
  const up=new THREE.Vector3(0,1,0);

  const profiles={
    player:{height:1.82,skin:0xc28c6e,hair:0x17191a,hairStyle:'short',top:0xd8d3c5,outer:0x344b58,bottom:0x20282d,shoe:0x17191b,build:1.02,shoulders:1.04,waist:.98,age:38,brow:.04},
    'Aiko':{height:1.64,skin:0xd0a080,hair:0x211d1b,hairStyle:'bob',top:0xe4d9c7,outer:0x824b46,bottom:0x353943,shoe:0x332622,build:.88,shoulders:.89,waist:.82,age:24,skirt:true,brow:.02},
    'Kenji':{height:1.76,skin:0xc89573,hair:0x181817,hairStyle:'crop',top:0xd7d1bc,outer:0x435f70,bottom:0x34434b,shoe:0x24282a,build:1.03,shoulders:1.08,waist:1.0,age:31,brow:.055},
    'Mrs Sato':{height:1.57,skin:0xc89b7d,hair:0x6f6a65,hairStyle:'bun',top:0xd8cdbd,outer:0x746174,bottom:0x47474c,shoe:0x322d2b,build:.94,shoulders:.94,waist:1.0,age:67,skirt:true,stoop:.06,brow:.025},
    'Harbour master':{height:1.73,skin:0xb98466,hair:0x34302d,hairStyle:'receding',top:0xc7c0ad,outer:0x334754,bottom:0x29343a,shoe:0x1e2326,build:1.16,shoulders:1.18,waist:1.12,age:58,cap:true,brow:.065}
  };

  function mat(color,roughness=.84,metalness=0){
    const key=`${color}/${roughness}/${metalness}`;
    if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));
    return materialCache.get(key);
  }
  function skinMat(color){
    if(!skinCache.has(color))skinCache.set(color,new THREE.MeshStandardMaterial({color,roughness:.68,metalness:0}));
    return skinCache.get(color);
  }
  function mesh(geometry,material,parent,position=[0,0,0],scale=[1,1,1]){
    const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.scale.set(...scale);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);return m;
  }
  function segment(parent,length,rTop,rBottom,material,radial=12){
    const m=mesh(new THREE.CylinderGeometry(rTop,rBottom,length,radial,1),material,parent,[0,-length/2,0]);
    return m;
  }
  function shadow(root,p){
    const sm=new THREE.Mesh(new THREE.CircleGeometry(.34*p.build,24),new THREE.MeshBasicMaterial({color:0x091010,transparent:true,opacity:.18,depthWrite:false}));
    sm.rotation.x=-Math.PI/2;sm.position.y=.012;sm.scale.set(1,.62,1);sm.renderOrder=1;root.add(sm);return sm;
  }
  function addFace(head,p){
    const eyeMat=mat(0x171717,.62),white=mat(0xe2d7c8,.7),browMat=mat(p.hair,.9),skin=skinMat(p.skin);
    const eyelids=[];
    for(const x of [-.067,.067]){
      mesh(new THREE.SphereGeometry(.024,10,7),white,head,[x,.027,-.174],[1.15,.66,.46]);
      mesh(new THREE.SphereGeometry(.012,9,7),eyeMat,head,[x,.026,-.188],[.9,.9,.48]);
      const brow=mesh(new THREE.BoxGeometry(.072,.012,.012),browMat,head,[x,.071,-.179]);brow.rotation.z=x<0?p.brow:-p.brow;
      const lid=mesh(new THREE.BoxGeometry(.062,.013,.012),skin,head,[x,.043,-.19]);eyelids.push(lid);
    }
    for(const x of [-.192,.192])mesh(new THREE.SphereGeometry(.038,9,7),skin,head,[x,-.006,.015],[.48,1,.8]);
    const nose=mesh(new THREE.ConeGeometry(.025,.09,8),skin,head,[0,-.005,-.201],[.9,1,.9]);nose.rotation.x=-Math.PI/2;
    mesh(new THREE.SphereGeometry(.031,9,7),skin,head,[0,-.011,-.213],[1,.68,.72]);
    const mouth=mesh(new THREE.BoxGeometry(.075,.009,.009),mat(p.age>55?0x704942:0x75423d,.9),head,[0,-.079,-.187]);mouth.rotation.z=.01;
    if(p.age>55){
      for(const y of [-.044,-.105])mesh(new THREE.BoxGeometry(.085,.006,.008),mat(0x9a725f,.95),head,[0,y,-.178]);
    }
    return eyelids;
  }
  function addHair(head,p){
    const hm=mat(p.hair,.9);
    if(p.hairStyle==='bob'){
      mesh(new THREE.SphereGeometry(.203,16,12),hm,head,[0,.084,.014],[1.04,.79,1.04]);
      mesh(new THREE.SphereGeometry(.178,14,10),hm,head,[0,-.025,.105],[1.08,.94,.75]);
      for(const x of [-.171,.171])mesh(new THREE.CapsuleGeometry(.035,.19,5,8),hm,head,[x,-.025,.03]);
    }else if(p.hairStyle==='bun'){
      mesh(new THREE.SphereGeometry(.202,15,11),hm,head,[0,.094,.02],[1.02,.62,1.02]);
      mesh(new THREE.SphereGeometry(.083,12,9),hm,head,[0,.13,.17],[1,1.12,1]);
    }else if(p.hairStyle==='receding'){
      mesh(new THREE.SphereGeometry(.198,15,11),hm,head,[0,.115,.038],[1,.39,1]);
      for(const x of [-.158,.158])mesh(new THREE.CapsuleGeometry(.024,.10,4,7),hm,head,[x,.025,.03]);
    }else if(p.hairStyle==='crop'){
      mesh(new THREE.SphereGeometry(.202,15,11),hm,head,[0,.108,.02],[1.02,.54,1.02]);
      mesh(new THREE.BoxGeometry(.325,.055,.09),hm,head,[0,.116,-.126]);
    }else{
      mesh(new THREE.SphereGeometry(.202,15,11),hm,head,[0,.102,.025],[1.03,.58,1.03]);
      mesh(new THREE.BoxGeometry(.315,.07,.09),hm,head,[0,.102,-.132]);
    }
    if(p.cap){
      mesh(new THREE.SphereGeometry(.216,14,10),mat(0x293d4a,.84),head,[0,.145,.02],[1.08,.48,1.08]);
      mesh(new THREE.BoxGeometry(.27,.026,.125),mat(0x293d4a,.84),head,[0,.12,-.195]);
    }
  }
  function addClothes(root,p){
    const shirt=mat(p.top,.88),dark=mat(0x262726,.9);
    const collar=mesh(new THREE.CylinderGeometry(.105,.145,.1,12),shirt,root,[0,1.44,-.005]);collar.scale.z=.85;
    for(const side of [-1,1]){const lapel=mesh(new THREE.BoxGeometry(.11,.34,.018),mat(p.outer,.84),root,[side*.075,1.28,-.247]);lapel.rotation.z=side*.19;}
    mesh(new THREE.BoxGeometry(.38,.055,.27),dark,root,[0,.91,0]);
    if(p.skirt)mesh(new THREE.CylinderGeometry(.225,.315,.5,14),mat(p.bottom,.91),root,[0,.72,0]);
    if(p.age>50)mesh(new THREE.BoxGeometry(.035,.32,.025),mat(0x8b8173,.9),root,[.02,1.19,-.207]);
  }
  function build(entity,p,height){
    const root=new THREE.Group();
    const scale=(height||p.height)/1.8;
    root.scale.setScalar(scale);root.position.y=0;root.rotation.x=p.stoop||0;
    shadow(root,p);

    const jacket=mat(p.outer,.84),shirt=mat(p.top,.88),trouser=mat(p.bottom,.9),shoe=mat(p.shoe,.78),skin=skinMat(p.skin);
    const torso=new THREE.Group();torso.position.set(0,1.07,0);root.add(torso);
    mesh(new THREE.CylinderGeometry(.245*p.waist,.325*p.shoulders,.62,14,2),jacket,torso,[0,.19,0],[p.build,1,1]);
    mesh(new THREE.CylinderGeometry(.19*p.waist,.245*p.waist,.18,12),jacket,torso,[0,-.18,0],[p.build,1,1]);
    mesh(new THREE.BoxGeometry(.145,.43,.026),shirt,torso,[0,.20,-.248]);

    mesh(new THREE.CylinderGeometry(.075,.087,.12,10),skin,root,[0,1.485,0]);
    const head=new THREE.Group();head.position.set(0,1.68,-.006);root.add(head);
    mesh(new THREE.SphereGeometry(.19,18,14),skin,head,[0,0,0],[.9,1.13,.89]);
    mesh(new THREE.SphereGeometry(.152,16,11),skin,head,[0,-.105,-.006],[.88,.56,.85]);
    const eyelids=addFace(head,p);addHair(head,p);

    const hips=new THREE.Group();hips.position.set(0,.89,0);root.add(hips);
    const legs=[];
    for(const side of [-1,1]){
      const hip=new THREE.Group();hip.position.set(side*.137*p.build,0,0);hips.add(hip);
      segment(hip,.42,.09,.105,trouser,12);
      const knee=new THREE.Group();knee.position.set(0,-.42,0);hip.add(knee);
      segment(knee,.41,.068,.083,trouser,12);
      const ankle=new THREE.Group();ankle.position.set(0,-.41,0);knee.add(ankle);
      const foot=mesh(new THREE.BoxGeometry(.145,.095,.30),shoe,ankle,[0,-.045,-.065]);
      foot.geometry.computeVertexNormals();
      legs.push({hip,knee,ankle,foot,side});
    }
    const arms=[];
    for(const side of [-1,1]){
      const shoulder=new THREE.Group();shoulder.position.set(side*.345*p.shoulders,1.36,0);root.add(shoulder);
      mesh(new THREE.SphereGeometry(.085,10,8),jacket,shoulder,[0,-.02,0],[1.1,1,.9]);
      segment(shoulder,.335,.066*p.build,.078*p.build,jacket,12);
      const elbow=new THREE.Group();elbow.position.set(0,-.335,0);shoulder.add(elbow);
      segment(elbow,.30,.052,.063,jacket,11);
      const wrist=new THREE.Group();wrist.position.set(0,-.30,0);elbow.add(wrist);
      mesh(new THREE.SphereGeometry(.065,10,8),skin,wrist,[0,-.04,-.006],[.9,1.05,.82]);
      mesh(new THREE.BoxGeometry(.10,.045,.065),skin,wrist,[0,-.095,-.022],[1,.8,1]);
      arms.push({shoulder,elbow,wrist,side});
    }
    addClothes(root,p);entity.add(root);
    return {root,head,torso,hips,legs,arms,eyelids};
  }

  function attach(entity,file,height=1.8){
    try{
      const name=entity.userData.name||'player',profile=profiles[name]||profiles.player;
      const fallback=[...entity.children];
      const resolvedHeight=name==='player'?(height||profile.height):profile.height;
      const rig=build(entity,profile,resolvedHeight);
      fallback.forEach(o=>o.visible=false);
      const actor={entity,profile,rig,gesture:0,lastPosition:entity.position.clone(),phase:actors.length*1.731,speed:0,blink:0,nextBlink:1.4+actors.length*.47};
      actors.push(actor);entity.userData.character=actor;return actor;
    }catch(error){onError?.(file,error);return null;}
  }
  function gesture(entity){const actor=entity.userData.character;if(actor)actor.gesture=1.25;}
  function update(dt){
    const t=performance.now()*.001;
    for(const a of actors){
      const raw=a.entity.position.distanceTo(a.lastPosition)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);
      a.speed=THREE.MathUtils.damp(a.speed,Math.min(raw,6),8,dt);
      const walking=a.speed>.06,gait=t*(a.speed>3.5?8.2:5.25)+a.phase,amp=walking?(a.speed>3.5?.55:.34):0;
      a.rig.legs.forEach((leg,i)=>{
        const swing=Math.sin(gait+i*Math.PI)*amp;
        leg.hip.rotation.x=THREE.MathUtils.damp(leg.hip.rotation.x,swing,13,dt);
        leg.hip.rotation.z=THREE.MathUtils.damp(leg.hip.rotation.z,walking?Math.sin(gait+i*Math.PI)*.025:0,10,dt);
        leg.knee.rotation.x=THREE.MathUtils.damp(leg.knee.rotation.x,Math.max(0,-swing)*.48,12,dt);
        leg.ankle.rotation.x=THREE.MathUtils.damp(leg.ankle.rotation.x,walking?-swing*.17:0,12,dt);
      });
      a.rig.arms.forEach((arm,i)=>{
        const swing=-Math.sin(gait+i*Math.PI)*amp*.68;
        const target=a.gesture>0&&i===1?-1.0:swing;
        arm.shoulder.rotation.x=THREE.MathUtils.damp(arm.shoulder.rotation.x,target,11,dt);
        arm.shoulder.rotation.z=THREE.MathUtils.damp(arm.shoulder.rotation.z,a.gesture>0&&i===1?-.28:(i?-.035:.035),10,dt);
        arm.elbow.rotation.x=THREE.MathUtils.damp(arm.elbow.rotation.x,a.gesture>0&&i===1?-1.05:.08,10,dt);
      });
      const breathe=Math.sin(t*1.55+a.phase)*.004;
      a.rig.torso.position.y=1.07+breathe+(walking?Math.abs(Math.sin(gait))*.011:0);
      a.rig.torso.rotation.y=THREE.MathUtils.damp(a.rig.torso.rotation.y,walking?Math.sin(gait)*.035:0,8,dt);
      a.rig.hips.rotation.y=THREE.MathUtils.damp(a.rig.hips.rotation.y,walking?-Math.sin(gait)*.045:0,8,dt);
      a.rig.head.rotation.y=Math.sin(t*.46+a.phase)*.032-a.rig.torso.rotation.y*.35;
      a.rig.head.rotation.z=walking?Math.sin(gait)*.008:Math.sin(t*.31+a.phase)*.006;
      a.nextBlink-=dt;if(a.nextBlink<=0){a.blink=.11;a.nextBlink=2.2+((a.phase*1.91)%1)*2.8;}
      if(a.blink>0){a.blink-=dt;const closed=a.blink>.045;a.rig.eyelids.forEach(l=>l.scale.y=closed?3.1:1);}else a.rig.eyelids.forEach(l=>l.scale.y=1);
      if(a.gesture>0){a.gesture-=dt;a.rig.head.rotation.x=Math.sin((1.25-a.gesture)*8)*.05;}else a.rig.head.rotation.x=0;
    }
  }
  return {attach,gesture,update,actors};
}

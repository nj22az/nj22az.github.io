import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';

// Local, deterministic human rigs used as the guaranteed fallback character layer.
// Each named resident has a deliberately different silhouette, wardrobe and posture.
export function createCharacters({mobile,onError,shadows=!mobile}){
  const actors=[];
  const mats=new Map();
  const skins=new Map();
  const geo=new Map();

  const profiles={
    player:{height:1.82,skin:0xc28c6e,hair:0x201b18,hairStyle:'sidepart',top:0xe0d7c4,outer:0x665543,bottom:0x252a2c,shoe:0x191918,build:1.00,shoulders:1.05,waist:.97,age:38,brow:.035,satchel:true,openJacket:true},
    Aiko:{height:1.63,skin:0xd0a080,hair:0x211d1b,hairStyle:'bob',top:0xe7ddc8,outer:0x824b46,bottom:0x34363b,shoe:0x302420,build:.86,shoulders:.88,waist:.81,age:24,brow:.018,skirt:true,scarf:true},
    Kenji:{height:1.77,skin:0xc89573,hair:0x171717,hairStyle:'crop',top:0xcac4ae,outer:0x355468,bottom:0x263b48,shoe:0x202527,build:1.06,shoulders:1.10,waist:1.02,age:31,brow:.055,workCap:true,workwear:true},
    'Mrs Sato':{height:1.56,skin:0xc89b7d,hair:0x6f6a65,hairStyle:'bun',top:0xd9cfbf,outer:0x786275,bottom:0x49474b,shoe:0x302b29,build:.95,shoulders:.93,waist:1.02,age:67,brow:.022,skirt:true,stoop:.065,apron:true},
    'Harbour master':{height:1.74,skin:0xb98466,hair:0x35312e,hairStyle:'receding',top:0xd0c8b6,outer:0x263d4b,bottom:0x252f35,shoe:0x181d20,build:1.17,shoulders:1.20,waist:1.12,age:58,brow:.065,peakedCap:true,coat:true}
  };

  function material(color,rough=.84,metal=0){
    const key=`${color}/${rough}/${metal}`;
    if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal}));
    return mats.get(key);
  }
  function skinMaterial(color){
    if(!skins.has(color))skins.set(color,new THREE.MeshStandardMaterial({color,roughness:.69,metalness:0}));
    return skins.get(color);
  }
  function geometry(key,make){if(!geo.has(key))geo.set(key,make());return geo.get(key)}
  function add(parent,g,m,pos=[0,0,0],scale=[1,1,1]){
    const o=new THREE.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=shadows;o.receiveShadow=shadows;parent.add(o);return o;
  }
  function box(parent,size,m,pos=[0,0,0]){return add(parent,geometry(`b${size}`,()=>new THREE.BoxGeometry(...size)),m,pos)}
  function sphere(parent,r,m,pos=[0,0,0],scale=[1,1,1],seg=14){return add(parent,geometry(`s${r}/${seg}`,()=>new THREE.SphereGeometry(r,seg,Math.max(8,seg-3))),m,pos,scale)}
  function cylinder(parent,h,rt,rb,m,pos=[0,0,0],seg=12){return add(parent,geometry(`c${h}/${rt}/${rb}/${seg}`,()=>new THREE.CylinderGeometry(rt,rb,h,seg,1)),m,pos)}
  function limb(parent,length,rt,rb,m){return cylinder(parent,length,rt,rb,m,[0,-length/2,0],11)}

  function face(head,p){
    const skin=skinMaterial(p.skin),dark=material(0x171717,.7),white=material(0xe7ded0,.72),brow=material(p.hair,.9),lids=[];
    for(const x of [-.066,.066]){
      sphere(head,.023,white,[x,.028,-.174],[1.18,.68,.45],10);
      sphere(head,.011,dark,[x,.027,-.188],[.9,.9,.5],9);
      const b=box(head,[.071,.012,.012],brow,[x,.072,-.179]);b.rotation.z=x<0?p.brow:-p.brow;
      lids.push(box(head,[.061,.012,.011],skin,[x,.044,-.19]));
    }
    for(const x of [-.19,.19])sphere(head,.036,skin,[x,-.005,.013],[.48,1,.8],9);
    const nose=add(head,geometry('nose',()=>new THREE.ConeGeometry(.025,.087,8)),skin,[0,-.005,-.202]);nose.rotation.x=-Math.PI/2;
    sphere(head,.03,skin,[0,-.012,-.212],[1,.67,.72],9);
    box(head,[.074,.009,.009],material(p.age>55?0x6f4942:0x77463f,.9),[0,-.079,-.187]);
    if(p.age>55){box(head,[.08,.006,.008],material(0x98705f,.95),[0,-.047,-.178]);box(head,[.077,.006,.008],material(0x98705f,.95),[0,-.107,-.176]);}
    return lids;
  }

  function hair(head,p){
    const hm=material(p.hair,.92);
    if(p.hairStyle==='bob'){
      sphere(head,.203,hm,[0,.083,.018],[1.04,.8,1.04],16);
      sphere(head,.178,hm,[0,-.026,.105],[1.08,.95,.76],14);
      for(const x of [-.17,.17])cylinder(head,.22,.033,.04,hm,[x,-.025,.035],8);
    }else if(p.hairStyle==='bun'){
      sphere(head,.201,hm,[0,.095,.02],[1.02,.62,1.02],15);
      sphere(head,.083,hm,[0,.13,.17],[1,1.12,1],12);
    }else if(p.hairStyle==='receding'){
      sphere(head,.198,hm,[0,.116,.038],[1,.39,1],15);
      for(const x of [-.156,.156])cylinder(head,.115,.023,.025,hm,[x,.025,.03],7);
    }else if(p.hairStyle==='crop'){
      sphere(head,.202,hm,[0,.11,.022],[1.02,.52,1.02],15);
      box(head,[.32,.05,.085],hm,[0,.116,-.126]);
    }else{
      sphere(head,.202,hm,[0,.104,.025],[1.02,.55,1.03],15);
      const part=box(head,[.19,.06,.1],hm,[-.065,.12,-.135]);part.rotation.z=-.12;
      const sweep=box(head,[.15,.055,.09],hm,[.075,.108,-.13]);sweep.rotation.z=.16;
    }
    if(p.workCap){
      const cap=material(0x243e50,.83);
      sphere(head,.211,cap,[0,.15,.018],[1.07,.42,1.07],13);
      const bill=box(head,[.245,.025,.14],cap,[0,.128,-.185]);bill.rotation.x=-.05;
    }
    if(p.peakedCap){
      const cap=material(0x223743,.8),band=material(0x11191e,.68),metal=material(0xb79a55,.52,.2);
      sphere(head,.218,cap,[0,.153,.02],[1.08,.46,1.08],14);
      box(head,[.31,.035,.13],band,[0,.118,-.16]);
      const bill=box(head,[.31,.025,.17],cap,[0,.105,-.202]);bill.rotation.x=-.08;
      sphere(head,.022,metal,[0,.125,-.222],[1,1,.4],8);
    }
  }

  function clothes(root,p){
    const outer=material(p.outer,.84),shirt=material(p.top,.88),dark=material(0x242625,.9),skin=skinMaterial(p.skin);
    cylinder(root,.10,.105,.145,shirt,[0,1.44,-.005],12).scale.z=.85;
    if(p.openJacket){
      for(const side of [-1,1]){const lapel=box(root,[.115,.37,.022],outer,[side*.085,1.275,-.25]);lapel.rotation.z=side*.2;}
      box(root,[.12,.39,.025],shirt,[0,1.24,-.258]);
    }else{
      for(const side of [-1,1]){const lapel=box(root,[.105,.31,.02],outer,[side*.07,1.285,-.247]);lapel.rotation.z=side*.17;}
    }
    box(root,[.39,.05,.275],dark,[0,.91,0]);
    if(p.skirt)cylinder(root,.5,.225,.315,material(p.bottom,.91),[0,.72,0],14);
    if(p.scarf){const s=material(0xb99a69,.9);cylinder(root,.06,.14,.14,s,[0,1.44,-.015],14);const tail=box(root,[.09,.25,.025],s,[.045,1.31,-.257]);tail.rotation.z=-.12;}
    if(p.satchel){
      const leather=material(0x3c3028,.84),strap=material(0x4b3a2d,.86);
      const st=box(root,[.035,1.0,.035],strap,[.02,1.17,-.29]);st.rotation.z=-.48;
      const bag=box(root,[.34,.36,.13],leather,[.33,.82,.08]);bag.rotation.y=-.12;
      box(root,[.28,.025,.03],material(0x8a7458,.7,.08),[.33,.86,.012]);
    }
    if(p.workwear){
      const pocket=material(0x2d495a,.88);
      box(root,[.17,.15,.025],pocket,[-.13,1.18,-.263]);
      box(root,[.17,.15,.025],pocket,[.13,1.18,-.263]);
      box(root,[.34,.045,.285],material(0x8a7653,.8),[0,.93,0]);
      for(const x of [-.13,.13])box(root,[.11,.13,.025],pocket,[x,.78,-.245]);
    }
    if(p.apron){
      const apron=material(0xb8ab91,.92);
      box(root,[.42,.58,.025],apron,[0,1.02,-.263]);
      box(root,[.055,.82,.025],apron,[-.19,1.22,-.255]).rotation.z=-.18;
      box(root,[.055,.82,.025],apron,[.19,1.22,-.255]).rotation.z=.18;
    }
    if(p.coat){
      box(root,[.48,.45,.04],outer,[0,.76,-.16]);
      for(const x of [-.135,.135])for(const y of [1.28,1.1,.92])sphere(root,.014,material(0xb49a69,.58,.15),[x,y,-.274],[1,1,.45],8);
    }
    if(p.age>50&&!p.coat)box(root,[.032,.31,.024],material(0x8b8173,.9),[.02,1.19,-.207]);
    return {outer,shirt,dark,skin};
  }

  function build(entity,p,height){
    const root=new THREE.Group();
    root.scale.setScalar((height||p.height)/1.8);root.rotation.x=p.stoop||0;
    entity.add(root);
    const outer=material(p.outer,.84),trouser=material(p.bottom,.9),shoe=material(p.shoe,.78),skin=skinMaterial(p.skin),shirt=material(p.top,.88);

    const shadow=new THREE.Mesh(geometry('shadow',()=>new THREE.CircleGeometry(.34,24)),new THREE.MeshBasicMaterial({color:0x091010,transparent:true,opacity:.17,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;shadow.scale.set(p.build,.62,1);shadow.renderOrder=1;root.add(shadow);

    const torso=new THREE.Group();torso.position.set(0,1.07,0);root.add(torso);
    add(torso,geometry('torso',()=>new THREE.CylinderGeometry(.245,.325,.62,14,2)),outer,[0,.19,0],[p.waist*p.build,p.shoulders,1]);
    add(torso,geometry('waist',()=>new THREE.CylinderGeometry(.19,.245,.18,12)),outer,[0,-.18,0],[p.waist*p.build,p.waist,1]);
    box(torso,[.145,.43,.026],shirt,[0,.20,-.248]);

    cylinder(root,.12,.075,.087,skin,[0,1.485,0],10);
    const head=new THREE.Group();head.position.set(0,1.68,-.006);root.add(head);
    sphere(head,.19,skin,[0,0,0],[.9,1.13,.89],18);sphere(head,.152,skin,[0,-.105,-.006],[.88,.56,.85],16);
    const eyelids=face(head,p);hair(head,p);

    const hips=new THREE.Group();hips.position.set(0,.89,0);root.add(hips);const legs=[];
    for(const side of [-1,1]){
      const hip=new THREE.Group();hip.position.set(side*.137*p.build,0,0);hips.add(hip);limb(hip,.42,.09,.105,trouser);
      const knee=new THREE.Group();knee.position.set(0,-.42,0);hip.add(knee);limb(knee,.41,.068,.083,trouser);
      const ankle=new THREE.Group();ankle.position.set(0,-.41,0);knee.add(ankle);box(ankle,[.145,.095,.30],shoe,[0,-.045,-.065]);
      legs.push({hip,knee,ankle,side});
    }
    const arms=[];
    for(const side of [-1,1]){
      const shoulder=new THREE.Group();shoulder.position.set(side*.345*p.shoulders,1.36,0);root.add(shoulder);sphere(shoulder,.085,outer,[0,-.02,0],[1.1,1,.9],10);limb(shoulder,.335,.066*p.build,.078*p.build,outer);
      const elbow=new THREE.Group();elbow.position.set(0,-.335,0);shoulder.add(elbow);limb(elbow,.30,.052,.063,outer);
      const wrist=new THREE.Group();wrist.position.set(0,-.30,0);elbow.add(wrist);sphere(wrist,.065,skin,[0,-.04,-.006],[.9,1.05,.82],10);box(wrist,[.10,.045,.065],skin,[0,-.095,-.022]);
      arms.push({shoulder,elbow,wrist,side});
    }
    clothes(root,p);
    return {root,head,torso,hips,legs,arms,eyelids};
  }

  function attach(entity,file,height=1.8){
    try{
      const name=entity.userData.name||'player';
      const profile=profiles[name]||profiles.player;
      const fallback=[...entity.children];
      const rig=build(entity,profile,name==='player'?(height||profile.height):profile.height);
      fallback.forEach(o=>o.visible=false);
      const actor={entity,profile,rig,gesture:0,lastPosition:entity.position.clone(),phase:actors.length*1.731,speed:0,nextBlink:1.4+actors.length*.47};
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
        const swing=-Math.sin(gait+i*Math.PI)*amp*.68,target=a.gesture>0&&i===1?-1.0:swing;
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
      a.nextBlink-=dt;
      if(a.nextBlink<=0){a.rig.eyelids.forEach(l=>l.scale.y=2.2);a.nextBlink=2.2+((a.phase*1.7)%2.4);setTimeout(()=>a.rig.eyelids.forEach(l=>l.scale.y=1),90);}
      if(a.gesture>0)a.gesture=Math.max(0,a.gesture-dt);
    }
  }

  return {attach,gesture,update,actors};
}

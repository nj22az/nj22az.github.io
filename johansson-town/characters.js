import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';

// Stable local cast for Johansson Town.
// Every named resident is a separately authored procedural character: body proportions,
// head shape, hair silhouette, wardrobe, posture and movement cadence are all distinct.
// Colours support the identity; they are not used as palette-swap substitutes.
export function createCharacters({mobile,onError,shadows=!mobile}){
  const actors=[];
  const mats=new Map(),skins=new Map(),geo=new Map();

  const profiles={
    player:{height:1.82,skin:0xb98264,hair:0x211c19,hairStyle:'sidepart',top:0xd8d0bd,outer:0x4f514a,bottom:0x282c2d,shoe:0x201b18,build:1.08,shoulders:1.18,waist:.99,head:[.93,1.08,.94],jaw:1.07,age:43,brow:.045,openJacket:true,hero:true,stride:1.02},
    Aiko:{height:1.59,skin:0xd3a184,hair:0x1b1716,hairStyle:'ponytail',top:0xe9e1d1,outer:0x9b6f72,bottom:0x3b3b43,shoe:0x3c2b27,build:.82,shoulders:.84,waist:.76,head:[.91,1.12,.90],jaw:.88,age:24,brow:.018,blouse:true,skirt:true,stride:.88},
    Kenji:{height:1.76,skin:0xc68f6e,hair:0x171717,hairStyle:'crop',top:0xc6c0ad,outer:0x355468,bottom:0x273a45,shoe:0x242829,build:1.11,shoulders:1.13,waist:1.05,head:[.98,1.02,.96],jaw:1.12,age:32,brow:.06,workwear:true,stride:1.08},
    'Mrs Sato':{height:1.55,skin:0xc79a7c,hair:0x716c67,hairStyle:'bun',top:0xdcd1c1,outer:0x796879,bottom:0x4d4a4d,shoe:0x312c2a,build:.98,shoulders:.91,waist:1.06,head:[.96,1.00,.95],jaw:1.02,age:68,brow:.02,cardigan:true,skirt:true,apron:true,stoop:.045,stride:.72},
    'Harbour master':{height:1.74,skin:0xb77f61,hair:0x39332f,hairStyle:'receding',top:0xcfc5b3,outer:0x293e4a,bottom:0x273137,shoe:0x1c2021,build:1.20,shoulders:1.22,waist:1.15,head:[1.00,.98,.98],jaw:1.16,age:58,brow:.07,coat:true,peakedCap:true,moustache:true,stride:.92}
  };

  function material(color,rough=.86,metal=0){const k=`${color}/${rough}/${metal}`;if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal}));return mats.get(k)}
  function skinMaterial(color){if(!skins.has(color))skins.set(color,new THREE.MeshStandardMaterial({color,roughness:.72,metalness:0}));return skins.get(color)}
  function geometry(key,make){if(!geo.has(key))geo.set(key,make());return geo.get(key)}
  function add(parent,g,m,pos=[0,0,0],scale=[1,1,1]){const o=new THREE.Mesh(g,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=shadows;o.receiveShadow=shadows;parent.add(o);return o}
  function box(parent,size,m,pos=[0,0,0],scale=[1,1,1]){return add(parent,geometry(`b${size}`,()=>new THREE.BoxGeometry(...size)),m,pos,scale)}
  function sphere(parent,r,m,pos=[0,0,0],scale=[1,1,1],seg=16){return add(parent,geometry(`s${r}/${seg}`,()=>new THREE.SphereGeometry(r,seg,Math.max(10,seg-4))),m,pos,scale)}
  function cylinder(parent,h,rt,rb,m,pos=[0,0,0],seg=14){return add(parent,geometry(`c${h}/${rt}/${rb}/${seg}`,()=>new THREE.CylinderGeometry(rt,rb,h,seg,1)),m,pos)}
  function limb(parent,length,rt,rb,m){return cylinder(parent,length,rt,rb,m,[0,-length/2,0],12)}

  function face(head,p){
    const skin=skinMaterial(p.skin),white=material(0xe7dfd4,.76),dark=material(0x171717,.78),brow=material(p.hair,.9),lids=[];
    const eyeY=p.age>55?.022:.03,eyeSpread=p.jaw>1.1?.069:.064;
    for(const x of [-eyeSpread,eyeSpread]){
      sphere(head,.022,white,[x,eyeY,-.178],[1.12,.60,.42],10);
      sphere(head,.010,dark,[x,eyeY-.001,-.190],[.9,.9,.48],9);
      const b=box(head,[.068,.010,.010],brow,[x,.071,-.180]);b.rotation.z=x<0?p.brow:-p.brow;
      lids.push(box(head,[.060,.010,.009],skin,[x,.044,-.191]));
    }
    for(const x of [-.184,.184])sphere(head,.034,skin,[x,-.005,.012],[.45,1,.78],9);
    const nose=add(head,geometry(`nose-${p.jaw}`,()=>new THREE.ConeGeometry(.024+(p.jaw-1)*.012,.082,9)),skin,[0,-.005,-.203]);nose.rotation.x=-Math.PI/2;
    sphere(head,.028,skin,[0,-.013,-.212],[1,.62,.72],9);
    const mouth=box(head,[p.moustache?.078:.070,.008,.008],material(p.age>55?0x704941:0x7b4a43,.92),[0,-.078,-.188]);
    if(p.moustache){const mm=material(0x3b312c,.94);for(const side of [-1,1]){const m=box(head,[.060,.016,.012],mm,[side*.027,-.055,-.194]);m.rotation.z=side*.12;}}
    if(p.age>55){box(head,[.075,.005,.007],material(0x98715f,.95),[0,-.046,-.180]);box(head,[.070,.005,.007],material(0x98715f,.95),[0,-.108,-.177]);}
    mouth.rotation.z=0;return lids;
  }

  function hair(head,p){
    const hm=material(p.hair,.94);
    if(p.hairStyle==='ponytail'){
      sphere(head,.200,hm,[0,.090,.027],[1.00,.62,1.00],18);for(let i=-3;i<=3;i++)box(head,[.044,.11,.055],hm,[i*.045,.035,-.162]);for(const x of [-.164,.164])cylinder(head,.18,.024,.032,hm,[x,-.005,-.015],8);sphere(head,.055,hm,[0,.070,.185],[.82,.82,.82],12);cylinder(head,.32,.050,.070,hm,[0,-.065,.215],10).rotation.x=.08;
    }else if(p.hairStyle==='bun'){
      sphere(head,.199,hm,[0,.104,.025],[1.00,.54,1.00],16);sphere(head,.079,hm,[0,.145,.175],[1,1.05,1],12);
    }else if(p.hairStyle==='receding'){
      sphere(head,.196,hm,[0,.126,.045],[1,.31,1],16);for(const x of [-.152,.152])cylinder(head,.10,.021,.024,hm,[x,.020,.030],8);
    }else if(p.hairStyle==='crop'){
      sphere(head,.199,hm,[0,.118,.025],[1.02,.42,1.01],16);box(head,[.30,.035,.065],hm,[0,.112,-.144]);
    }else{
      sphere(head,.199,hm,[0,.115,.026],[1.02,.45,1.02],17);const l=box(head,[.18,.045,.075],hm,[-.060,.115,-.145]);l.rotation.z=-.10;const r=box(head,[.13,.040,.070],hm,[.078,.108,-.145]);r.rotation.z=.12;
    }
    if(p.peakedCap){const cap=material(0x223843,.82),band=material(0x121b20,.74),metal=material(0xb79a55,.58,.12);sphere(head,.214,cap,[0,.152,.025],[1.08,.40,1.08],15);box(head,[.31,.030,.115],band,[0,.121,-.157]);const bill=box(head,[.30,.022,.15],cap,[0,.107,-.205]);bill.rotation.x=-.07;sphere(head,.019,metal,[0,.126,-.224],[1,1,.45],8);}
  }

  function clothes(root,p){
    const outer=material(p.outer,.88),shirt=material(p.top,.91),dark=material(0x252726,.92);
    cylinder(root,.10,.105,.145,shirt,[0,1.44,-.005],12).scale.z=.84;
    if(p.hero||p.openJacket){for(const side of [-1,1]){const lapel=box(root,[.105,.34,.021],outer,[side*.082,1.275,-.252]);lapel.rotation.z=side*.18;}box(root,[.12,.36,.023],shirt,[0,1.24,-.260]);}
    else if(p.blouse){box(root,[.35,.08,.025],shirt,[0,1.34,-.255]);for(const side of [-1,1])sphere(root,.035,shirt,[side*.13,1.34,-.262],[1.2,.7,.6],9);}
    else{for(const side of [-1,1]){const lapel=box(root,[.10,.28,.019],outer,[side*.068,1.29,-.248]);lapel.rotation.z=side*.15;}}
    box(root,[.38,.045,.27],dark,[0,.91,0]);
    if(p.skirt)cylinder(root,.48,.22,.30,material(p.bottom,.93),[0,.72,0],15);
    if(p.workwear){const pocket=material(0x2d4a5a,.90);box(root,[.16,.14,.023],pocket,[-.125,1.18,-.264]);box(root,[.16,.14,.023],pocket,[.125,1.18,-.264]);box(root,[.34,.042,.28],material(0x887450,.84),[0,.93,0]);}
    if(p.cardigan){for(const side of [-1,1])box(root,[.12,.42,.026],outer,[side*.115,1.20,-.255]);for(const y of [1.32,1.18,1.04])sphere(root,.011,material(0x6b5b62,.75),[0,y,-.273],[1,1,.55],8);}
    if(p.apron){const apron=material(0xb8ad98,.94);box(root,[.40,.55,.022],apron,[0,1.01,-.267]);box(root,[.20,.12,.024],material(0x9e927d,.94),[0,.91,-.281]);}
    if(p.coat){box(root,[.47,.48,.038],outer,[0,.76,-.15]);for(const x of [-.13,.13])for(const y of [1.27,1.10,.93])sphere(root,.012,material(0xb39a68,.62,.12),[x,y,-.273],[1,1,.5],8);}
    return {outer,shirt,dark};
  }

  function build(entity,p,height){
    const root=new THREE.Group();root.name=`resident-${entity.userData.name||'Johansson'}`;root.scale.setScalar((height||p.height)/1.8);root.rotation.x=p.stoop||0;entity.add(root);
    const outer=material(p.outer,.88),trouser=material(p.bottom,.92),shoe=material(p.shoe,.82),skin=skinMaterial(p.skin),shirt=material(p.top,.91);
    const shadow=new THREE.Mesh(geometry('shadow',()=>new THREE.CircleGeometry(.33,24)),new THREE.MeshBasicMaterial({color:0x091010,transparent:true,opacity:.15,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;shadow.scale.set(p.build,.58,1);root.add(shadow);
    const torso=new THREE.Group();torso.position.set(0,1.07,0);root.add(torso);add(torso,geometry(`torso-${p.build}-${p.shoulders}`,()=>new THREE.CylinderGeometry(.238,.31,.61,16,2)),outer,[0,.19,0],[p.waist*p.build,p.shoulders,1]);add(torso,geometry(`waist-${p.waist}`,()=>new THREE.CylinderGeometry(.185,.24,.18,14)),outer,[0,-.18,0],[p.waist*p.build,p.waist,1]);box(torso,[.14,.40,.024],shirt,[0,.20,-.248]);
    cylinder(root,.115,.072,.084,skin,[0,1.485,0],11);const head=new THREE.Group();head.position.set(0,1.68,-.006);root.add(head);sphere(head,.188,skin,[0,0,0],p.head,20);sphere(head,.147,skin,[0,-.104,-.008],[.86*p.jaw,.54,.84],17);const eyelids=face(head,p);hair(head,p);
    const hips=new THREE.Group();hips.position.set(0,.89,0);root.add(hips);const legs=[];const hipSpread=.132*p.build,thigh=.085*p.build,calf=.067*p.build;
    for(const side of [-1,1]){const hip=new THREE.Group();hip.position.set(side*hipSpread,0,0);hips.add(hip);limb(hip,.42,thigh,thigh*1.12,trouser);const knee=new THREE.Group();knee.position.set(0,-.42,0);hip.add(knee);limb(knee,.40,calf,calf*1.16,trouser);const ankle=new THREE.Group();ankle.position.set(0,-.40,0);knee.add(ankle);box(ankle,[.14*p.build,.085,.27],shoe,[0,-.038,-.055]);legs.push({hip,knee,ankle,side});}
    const arms=[];const armSpread=.315*p.shoulders,upper=.063*p.build;
    for(const side of [-1,1]){const shoulder=new THREE.Group();shoulder.position.set(side*armSpread,1.36,0);root.add(shoulder);sphere(shoulder,.078,outer,[0,-.018,0],[1.05,1,.9],11);limb(shoulder,.315,upper,upper*1.15,outer);const elbow=new THREE.Group();elbow.position.set(0,-.315,0);shoulder.add(elbow);limb(elbow,.285,.050*p.build,.059*p.build,outer);const wrist=new THREE.Group();wrist.position.set(0,-.285,0);elbow.add(wrist);sphere(wrist,.055,skin,[0,-.032,-.005],[.86,1.02,.78],10);sphere(wrist,.047,skin,[0,-.085,-.018],[.88,1.05,.72],10);arms.push({shoulder,elbow,wrist,side});}
    clothes(root,p);return {root,head,torso,hips,legs,arms,eyelids};
  }

  profiles['Bus driver']={...profiles['Harbour master'],height:1.71,outer:0x324c59,top:0x9daea7};
  profiles['Cold-storage kid']={...profiles.Kenji,height:1.68,outer:0x74774c,top:0xb5b7a1,build:.92};
  function attach(entity,file,height=1.8){try{const name=entity.userData.name||'player',profile=profiles[name]||profiles.player;const old=[...entity.children],rig=build(entity,profile,name==='player'?(height||profile.height):profile.height);old.forEach(o=>o.visible=false);const actor={entity,profile,rig,gesture:0,lastPosition:entity.position.clone(),phase:actors.length*.93,speed:0,blink:0,nextBlink:1.5+actors.length*.42};actors.push(actor);entity.userData.character=actor;return actor;}catch(error){onError?.(file,error);return null;}}
  function gesture(entity){const a=entity.userData.character;if(a)a.gesture=.65;}

  function update(dt){
    for(const a of actors){
      const dx=a.entity.position.x-a.lastPosition.x,dz=a.entity.position.z-a.lastPosition.z,raw=Math.hypot(dx,dz)/Math.max(dt,.001);a.lastPosition.copy(a.entity.position);a.speed=THREE.MathUtils.damp(a.speed,Math.min(raw,5.5),7,dt);
      const walking=a.speed>.09,run=a.speed>3.45,stride=a.profile.stride||1;a.phase+=dt*(walking?THREE.MathUtils.clamp(a.speed*2.15*stride,3.0,run?8.2:6.2):.55);const g=Math.sin(a.phase),amp=walking?(run?.46:.28)*stride:0;
      a.rig.legs.forEach((leg,i)=>{const sign=i?-1:1,swing=g*amp*sign;leg.hip.rotation.x=THREE.MathUtils.damp(leg.hip.rotation.x,swing,12,dt);leg.hip.rotation.z=THREE.MathUtils.damp(leg.hip.rotation.z,walking?sign*.012:0,10,dt);leg.knee.rotation.x=THREE.MathUtils.damp(leg.knee.rotation.x,Math.max(0,-swing)*.46,12,dt);leg.ankle.rotation.x=THREE.MathUtils.damp(leg.ankle.rotation.x,walking?-swing*.13:0,12,dt);});
      a.rig.arms.forEach((arm,i)=>{const sign=i?-1:1,walkTarget=-g*amp*.55*sign,gestureTarget=a.gesture>0&&i===1?-.28:walkTarget;arm.shoulder.rotation.x=THREE.MathUtils.damp(arm.shoulder.rotation.x,gestureTarget,10,dt);arm.shoulder.rotation.z=THREE.MathUtils.damp(arm.shoulder.rotation.z,sign*.045,10,dt);arm.elbow.rotation.x=THREE.MathUtils.damp(arm.elbow.rotation.x,a.gesture>0&&i===1?-.32:.06,10,dt);});
      const breathe=Math.sin(a.phase*.35)*.0025;a.rig.torso.position.y=1.07+breathe+(walking?Math.abs(g)*.006:0);a.rig.torso.rotation.y=THREE.MathUtils.damp(a.rig.torso.rotation.y,walking?g*.020:0,8,dt);a.rig.hips.rotation.y=THREE.MathUtils.damp(a.rig.hips.rotation.y,walking?-g*.025:0,8,dt);
      const nod=a.gesture>0?-.035*Math.sin((.65-a.gesture)/.65*Math.PI):0;a.rig.head.rotation.x=THREE.MathUtils.damp(a.rig.head.rotation.x,nod,10,dt);a.rig.head.rotation.y=THREE.MathUtils.damp(a.rig.head.rotation.y,walking?-a.rig.torso.rotation.y*.25:Math.sin(a.phase*.11)*.014,7,dt);a.rig.head.rotation.z=THREE.MathUtils.damp(a.rig.head.rotation.z,0,8,dt);
      a.nextBlink-=dt;if(a.nextBlink<=0&&a.blink<=0){a.blink=.10;a.nextBlink=2.3+(a.phase%1.8);}if(a.blink>0)a.blink=Math.max(0,a.blink-dt);const lidScale=a.blink>0?2.1:1;a.rig.eyelids.forEach(l=>l.scale.y=THREE.MathUtils.damp(l.scale.y,lidScale,35,dt));if(a.gesture>0)a.gesture=Math.max(0,a.gesture-dt);
    }
  }

  return {attach,gesture,update,actors,profiles};
}

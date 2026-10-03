const STORAGE_WALK_SPEED = 2.35;
const STORAGE_RUN_SPEED = 4.2;
const STORAGE_STEP = 1 / 60;
// Tonight's boss from the sea cave (stockroom.js): how close Thuan must be to shoo it, how many
// shoos it takes, and the cave coins it leaves behind (johansson-town/src/commerce/shop-stock.js).
const SHOO_REACH = 1.7, BOSS_HP = 3, BOSS_YEN = 200;
// The boss is the townsperson themselves, playing pretend: their own avatar from Johansson
// Town's creator, with the animal's hood, paws and tail (johansson-town/src/dungeon/pretend.js),
// a touch larger than life. It is loaded from the town; the simple mascot body stands in until
// it arrives, or for good where it cannot load (the tests' sandbox).
const PRETEND_SCALE = 1.06;
let pretendLoad = null;
function loadPretend() {
  pretendLoad ??= (async () => {
    // The town's avatars bring their own Three.js; it is not a second copy of this one in the
    // scene's way, so keep it from announcing itself as one.
    const before = window.__THREE__;
    try { delete window.__THREE__; return await import('/johansson-town/src/dungeon/pretend.js'); }
    finally { if (before !== undefined) window.__THREE__ = before; }
  })().catch(() => null);
  return pretendLoad;
}

function om({canvas,minimap,onHud,gltf=null}) {
  const renderer = new rd({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.75));
  renderer.outputColorSpace=yt;renderer.toneMapping=4;renderer.toneMappingExposure=1.1;
  const scene=new yr();scene.background=new K(0xb8b4a6);scene.fog=new vr(0xc4bfb0,0.0085);
  const camera=new os(50,1,0.06,80);scene.add(camera);
  const controls=kd();controls.attach(canvas);
  const rawSound=id();
  // Audio restrictions must never prevent starting, walking or collecting.
  const sound=Object.fromEntries(Object.keys(rawSound).map(name=>[name,(...args)=>{
    try { return rawSound[name](...args); } catch { return undefined; }
  }]));
  let maze=hd(Math.floor(Math.random()*1e9)),world=Yp(maze);scene.add(world.group);
  let characterReady=false;
  const character=$f({gltf,onReady(){characterReady=true;}});scene.add(character.group);
  characterReady ||= character.ready;
  let phase='title',automatic=false,assisted=false,disposed=false,time=0;
  let px=0,pz=0,vx=0,vz=0,speed=0,yaw=Math.PI,pitch=-0.36;
  let accumulator=0,lastFrame=performance.now(),hudElapsed=0,idleTime=0;
  let reaction='',reactionTime=0,route=[],autoTarget=null,autoWait=0;
  let collectedBefore=0,explored=new Set(),lastPickup='';
  let simTime=0,cameraInitial=true;
  let boomLength=3.55,lookIdle=0.5,guestLine=0,guestCooldown=0,guestPrompt='';
  let boss=null,freeCells=[],bossDefeated=false,yenFound=0,stun=0,knockX=0,knockZ=0,shooCool=0,shooHeld=false,shooQueued=false,chaseReplan=0;
  const focus=new G(),desired=new G(),cameraPosition=new G(),dummy=new lr();
  const dust=Array.from({length:28},(_,i)=>({x:(i*7%29)-14,z:(i*11%29)-14,y:0.6+(i%8)*0.2}));
  function say(text,seconds=3) {reaction=text;reactionTime=seconds;}
  function resetPosition() {
    const start=gd(maze.start.c,maze.start.r,maze);
    px=start.x;pz=start.z;vx=vz=speed=0;yaw=Math.PI;pitch=-0.36;
    time=0;simTime=0;idleTime=0;automatic=false;assisted=false;autoWait=0;route=[];autoTarget=null;
    explored=new Set();collectedBefore=0;lastPickup='';reaction='';reactionTime=0;
    cameraInitial=true;boomLength=3.55;lookIdle=0.5;guestLine=0;guestCooldown=0;guestPrompt='';character.group.position.set(px,0,pz);character.setHeading(yaw,true);
    resetBoss();
    character.setCelebrate(false);character.setWave(true);controls.reset();reveal();
  }
  function reveal() {
    const cell=_d(px,pz,maze);
    for(let r=cell.r-3;r<=cell.r+3;r++)for(let c=cell.c-3;c<=cell.c+3;c++)explored.add(`${c},${r}`);
  }
  function emitHud() {
    const required=world.items.filter(item=>item.needed),collected=required.filter(item=>item.taken).length;
    const cell=_d(px,pz,maze),zone=bd(cell.c,cell.r,maze)?.name ?? 'Main aisle';
    onHud({phase,time,collected,total:required.length,list:required.map(({id,name,taken})=>({id,name,taken,needed:true})),
      readyToStock:collected===required.length,
      boss:boss?{who:boss.who,animal:boss.animal,name:boss.name,hp:Math.max(0,boss.hp),maxHp:BOSS_HP,state:boss.state,about:!!bossAbout(),defeated:bossDefeated,
        tell:{beat:'beating its chest',charge:'charging!',jaws:'jaws open',lunge:'lunging!',rear:'rearing up',swipe:'swiping',kick:'ears back',bray:'braying',pound:'jumping',tired:'worn out — shoo it!',defeated:'head off',leaving:'going home'}[boss.state]??''}:null,
      yenFound,stunned:stun>0,thuanReady:characterReady,pointerLocked:controls.isPointerLocked(),
      zone,assisted,quote:reaction,reaction:reactionTime>0?reaction:'',autoRestocking:automatic,seed:maze.seed,
      explored:[...explored].filter(key=>{const[c,r]=key.split(',').map(Number);return yd(c,r,maze);}).length/maze.cells.filter(v=>v===0).length,guestPrompt,guest:world.guest?{name:world.guest.name,id:world.guest.id}:null});
  }
  function chooseRoute() {
    const from=_d(px,pz,maze);
    // The boss worn out and close by: go and shoo it while it has stars round its head.
    const chase=boss?.state==='tired'&&!boss.hitThisRest&&Math.hypot(boss.x-px,boss.z-pz)<7?boss:null;
    // Re-aimed every moment, so it skips the centre of her own cell: going back to it each
    // time had her jittering on the spot.
    if(chase){const cell=_d(chase.x,chase.z,maze),path=storageRoute(maze,from,cell);if(path.length){route=(path.length>1?path.slice(1):path).map(c=>gd(c.c,c.r,maze));if(path.length===1)route.push({x:chase.x,z:chase.z});autoTarget={id:'thief'};chaseReplan=0.4;return;}}
    const remaining=world.items.filter(item=>item.needed&&!item.taken);
    const options=remaining.length?remaining:[{...maze.exit,id:'exit'}];
    let shortest=null,target=null;
    for(const item of options){const path=storageRoute(maze,from,item);if(path.length&&(!shortest||path.length<shortest.length)){shortest=path;target=item;}}
    if(!shortest){automatic=false;say('I need a clear route. You can guide me.');return;}
    // Include the current cell centre: it prevents cutting diagonally through
    // a rack corner when the player hands over control between grid centres.
    route=shortest.map(cell=>gd(cell.c,cell.r,maze));autoTarget=target;
  }
  function collect() {
    for(const item of world.items) {
      if(item.taken||Math.hypot(item.x-px,item.z-pz)>0.85)continue;
      item.taken=true;item.mesh.visible=false;lastPickup=item.id;sound.pickup();character.playPickup();
      if(item.needed){
        say(item.id==='tea'?'Tea tins. The kettle will be ready soon.':`${item.name}. That goes on the list.`);
        if(automatic&&autoTarget?.id===item.id){route=[];autoTarget=null;autoWait=0.65;}
      }
    }
    const count=world.items.filter(item=>item.needed&&item.taken).length;
    if(count>collectedBefore&&world.items.filter(item=>item.needed).every(item=>item.taken))say('All packed. Back to the pink shop curtain.',5);
    collectedBefore=count;
  }
  function step(dt) {
    if(phase!=='playing')return;
    const look=controls.consumeLook();
    const input=controls.actions;
    if(automatic&&(Math.hypot(input.moveX,input.moveY)>0.12)){automatic=false;route=[];say('Your turn. I have the list.');}
    // Shoo: Space or F, the gamepad's A, or the touch button -- once per press.
    const pads=navigator.getGamepads?.()??[],held=controls.has('Space')||controls.has('KeyF')||[...pads].some(pad=>pad?.buttons?.[0]?.pressed);
    if((held&&!shooHeld)||shooQueued)shoo();shooHeld=held;shooQueued=false;shooCool=Math.max(0,shooCool-dt);
    // Orbit look — slightly snappier stick feel, pitch clamped like a soft third-person shoulder cam.
    yaw-=look.x*0.0045+input.lookHoldX*2.35*dt;
    pitch=Math.max(-0.72,Math.min(-0.08,pitch-look.y*0.0033-input.lookHoldY*1.65*dt));
    const looking=Math.abs(look.x)>0.35||Math.abs(look.y)>0.35||Math.abs(input.lookHoldX)>0.06||Math.abs(input.lookHoldY)>0.06;
    lookIdle=looking?0:lookIdle+dt;
    let targetX=0,targetZ=0;
    if(automatic){
      // Thuan shoos a worn-out boss in reach by herself, and goes over to one close by.
      if(boss?.state==='tired'&&!boss.hitThisRest&&Math.hypot(boss.x-px,boss.z-pz)<SHOO_REACH*.9)shoo();
      if(autoTarget?.id==='thief'&&((chaseReplan-=dt)<=0||boss?.state!=='tired'||boss.hitThisRest)){route=[];autoTarget=null;}
      if(autoTarget&&autoTarget.id!=='thief'&&boss?.state==='tired'&&!boss.hitThisRest&&Math.hypot(boss.x-px,boss.z-pz)<7){route=[];autoTarget=null;}
    }
    // Knocked over: sent along the floor a little way, and a moment to get up.
    if(stun>0){stun-=dt;vx=knockX;vz=knockZ;knockX=X(knockX,0,6,dt);knockZ=X(knockZ,0,6,dt);if(stun<=0){route=[];}}
    else if(automatic) {
      if(autoWait>0){autoWait-=dt;vx=vz=0;}
      else {
        if(!route.length)chooseRoute();
        while(route.length&&Math.hypot(route[0].x-px,route[0].z-pz)<0.09)route.shift();
        if(route.length){
          const dx=route[0].x-px,dz=route[0].z-pz,distance=Math.hypot(dx,dz);
          const pace=Math.min(STORAGE_WALK_SPEED,distance/dt);
          targetX=dx/distance*pace;targetZ=dz/distance*pace;
          if(!look.x&&!input.lookHoldX)yaw=Sd(yaw,Math.atan2(-dx,-dz),1-Math.exp(-2.3*dt));
        }
      }
      vx=targetX;vz=targetZ;
    } else {
      const pace=input.sprint?STORAGE_RUN_SPEED:STORAGE_WALK_SPEED;
      targetX=(Math.cos(yaw)*input.moveX-Math.sin(yaw)*input.moveY)*pace;
      targetZ=(-Math.sin(yaw)*input.moveX-Math.cos(yaw)*input.moveY)*pace;
      vx=X(vx,targetX,16,dt);vz=X(vz,targetZ,16,dt);
      if(Math.hypot(targetX,targetZ)<0.01&&Math.hypot(vx,vz)<0.025)vx=vz=0;
    }
    const oldX=px,oldZ=pz,next=moveStoragePlayer(px,pz,vx*dt,vz*dt,maze);
    px=next.x;pz=next.z;
    // Animation uses the distance actually travelled, not the requested speed.
    vx=(px-oldX)/dt;vz=(pz-oldZ)/dt;speed=Math.hypot(vx,vz);
    if(speed>0.08)character.setHeading(Math.atan2(-vx,-vz));
    // Snap camera behind when walking without active look input (shoulder recenter).
    if(!automatic&&speed>0.35&&lookIdle>0.28){
      yaw=Sd(yaw,Math.atan2(-vx,-vz),1-Math.exp(-3.4*dt));
    }
    if(speed>0.6)sound.footstep(speed);
    idleTime=speed<0.08?idleTime+dt:0;
    time+=dt;reveal();collect();talkToGuest(dt);updateBoss(dt);
    if(world.items.filter(item=>item.needed).every(item=>item.taken)&&Math.hypot(world.exit.x-px,world.exit.z-pz)<1.05){
      phase='won';automatic=false;speed=vx=vz=0;controls.reset();releasePointer();
      reaction=bossDefeated?`Everything is ready, and ${boss.name} has gone back down the hole. Sakura is open.`:bossAbout()?`Everything is ready. ${boss.name} can have the back room. Sakura is open.`:'Everything is ready. Sakura is open.';reactionTime=10;
      character.setCelebrate(true);character.setWave(false);sound.win();emitHud();
    }
  }
  // ---- Tonight's boss --------------------------------------------------------
  // One of Bizarro Minato climbs out of the sea-cave hole (stockroom.js) and behaves like the
  // animal on the suit. Each has a tell before it goes for Thuan and a worn-out moment after,
  // with stars round its head: shoo it then. Three shoos, and the head comes off.
  function resetBoss(){
    boss?.pretend?.dispose?.();
    const look=world.boss;
    boss=look?{...look,name:look.who+' the '+look.animal,state:'waiting',x:world.hole.x,z:world.hole.z,yaw:Math.PI/2,t:0,hp:BOSS_HP,
      phase:0,said:0,path:[],replan:0,dirX:0,dirZ:0,cool:2,appear:0,hitThisRest:false,wander:null,pause:0}:null;
    if(boss){const g=boss.body.group;g.visible=false;g.position.set(boss.x,0,boss.z);dressBoss(boss);}
    freeCells=maze.cells.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
    bossDefeated=false;yenFound=0;stun=0;knockX=knockZ=0;shooCool=0;shooQueued=false;
  }
  /** Swap the stand-in mascot for the townsperson in their pretend costume, once it has loaded. */
  function dressBoss(b){
    loadPretend().then(mod=>{
      if(!mod||boss!==b||b.pretend||disposed)return;
      try{
        const p=mod.buildPretend(b.who,{faceSize:256,shadows:true});
        p.root.scale.setScalar(PRETEND_SCALE/BOSS_SIZE);b.body.suit.add(p.root);
        b.body.suit.traverse(node=>{if(node.userData?.mascot)node.visible=false;});
        b.body.stars.position.y=(p.height*PRETEND_SCALE+.22)/BOSS_SIZE;b.pretend=p;p.face('smile');
      }catch{}
    });
  }
  /** The stand-in's joints onto the avatar's bones. arms[0] and legs[0] are at -x: the avatar's right. */
  function syncPretend(b){
    const p=b.pretend,B=p.bones,body=b.body,e=o=>[o.rotation.x,o.rotation.y,o.rotation.z];
    B.shoulderR.rotation.set(...e(body.arms[0]));B.shoulderL.rotation.set(...e(body.arms[1]));
    B.thighR.rotation.set(...e(body.legs[0]));B.thighL.rotation.set(...e(body.legs[1]));
    B.head.rotation.set(...e(body.head));
    // Knees and elbows follow: folded to sit, bent in the stride, a little crook in the arms.
    const sitting=body.legs[0].rotation.x<-1;
    B.kneeR.rotation.x=sitting?1.45:Math.max(0,-body.legs[0].rotation.x)*.9+.05;
    B.kneeL.rotation.x=sitting?1.45:Math.max(0,-body.legs[1].rotation.x)*.9+.05;
    B.elbowR.rotation.x=B.elbowL.rotation.x=-.2;
    const s=b.state;
    p.face(s==='tired'?'surprised':s==='defeated'||s==='leaving'?'laugh':['beat','charge','skid','pound','jaws','lunge','rear','swipe','kick','bray'].includes(s)?'angry':'smile');
  }
  const bossAbout=()=>boss&&boss.state!=='waiting'&&boss.state!=='gone';
  const bossLine=()=>{const text=boss.lines[boss.said%boss.lines.length];boss.said++;return text;};
  function clearLine(x0,z0,x1,z1){
    const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/.4);
    for(let i=1;i<n;i++){const c=_d(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,maze);if(vd(c.c,c.r,maze))return false;}
    return true;
  }
  function turnBoss(x,z,dt,rate=5){const want=Math.atan2(x-boss.x,z-boss.z);boss.yaw=Sd(boss.yaw,want,dt<0?1:1-Math.exp(-rate*dt));}
  /** Along the aisles to a cell, re-planned now and then. True while it is still going. */
  function walkBoss(cell,pace,dt){
    if((boss.replan-=dt)<=0||!boss.path.length){boss.replan=.6;const path=storageRoute(maze,_d(boss.x,boss.z,maze),cell);boss.path=path.slice(1).map(c=>gd(c.c,c.r,maze));}
    let step=pace*dt,moved=false;
    while(step>0&&boss.path.length){
      const [n]=boss.path,dx=n.x-boss.x,dz=n.z-boss.z,dist=Math.hypot(dx,dz);
      if(dist<=step){boss.x=n.x;boss.z=n.z;boss.path.shift();step-=dist;}else{boss.x+=dx/dist*step;boss.z+=dz/dist*step;step=0;turnBoss(n.x,n.z,dt,8);}
      moved=true;
    }
    return moved;
  }
  /** Straight ahead, stopped by the racks: a charge, a lunge. True when it hit something. */
  function rushBoss(speed,dt){const next=moveStoragePlayer(boss.x,boss.z,boss.dirX*speed*dt,boss.dirZ*speed*dt,maze,.42);boss.x=next.x;boss.z=next.z;return next.hit;}
  function lockOn(){const dx=px-boss.x,dz=pz-boss.z,d=Math.hypot(dx,dz)||1;boss.dirX=dx/d;boss.dirZ=dz/d;boss.yaw=Math.atan2(dx,dz);}
  function hitThuan(power,seconds,text){
    if(stun>0)return false;
    const dx=px-boss.x,dz=pz-boss.z,d=Math.hypot(dx,dz)||1;
    knockX=dx/d*power;knockZ=dz/d*power;stun=seconds;character.playPickup();say(text,2.8);return true;
  }
  function rest(seconds,text){boss.state='tired';boss.t=seconds;boss.hitThisRest=false;if(text)say(text,3);}
  /** A carton still on her list, where she will have to come: a watering hole. */
  function byTheGoods(){
    const left=world.items.filter(item=>item.needed&&!item.taken);if(!left.length)return null;
    if(!boss.goods||boss.goods.taken)boss.goods=left[Math.floor(Math.random()*left.length)];
    return {c:boss.goods.c,r:boss.goods.r};
  }
  function prowl(dt,pace,sight,goods=false){
    // Towards Thuan when she is near; otherwise about the aisles, stopping now and then.
    const d=Math.hypot(px-boss.x,pz-boss.z);
    if(d<sight)return walkBoss(_d(px,pz,maze),pace,dt);
    if(boss.pause>0){boss.pause-=dt;return false;}
    if(!boss.wander||Math.hypot(boss.wander.x-boss.x,boss.wander.z-boss.z)<.2){
      const i=freeCells[Math.floor(Math.random()*freeCells.length)],c=(goods&&byTheGoods())||{c:i%maze.cols,r:Math.floor(i/maze.cols)};
      boss.wander={...gd(c.c,c.r,maze),cell:c};boss.pause=goods?3+Math.random()*3:1+Math.random()*2;boss.path=[];if(goods)boss.goods=null;
    }
    return walkBoss(boss.wander.cell,pace*.7,dt);
  }
  const BEHAVIOUR={
    // Knuckle-walks; at a distance with a clear aisle between, beats its chest and charges in a
    // straight line. Into the racks: it sits down seeing stars. Too close: it jumps and pounds the floor.
    gorilla(dt,d){
      const s=boss.state;
      if(s==='roam'){
        boss.moving=prowl(dt,1.5,11);
        if(boss.cool<=0&&d<2.1){boss.state='pound';boss.t=.9;say(`${boss.name} jumps up, both fists high.`,1.6);}
        else if(boss.cool<=0&&d>2.6&&d<8.5&&clearLine(boss.x,boss.z,px,pz)){boss.state='beat';boss.t=1.4;lockOn();say(`${boss.name} beats its chest. HOO-HOO-HOO! “${bossLine()}”`,2.4);}
      }else if(s==='beat'){turnBoss(px,pz,dt);if((boss.t-=dt)<=0){lockOn();boss.state='charge';boss.t=2;}}
      else if(s==='charge'){
        const wall=rushBoss(6,dt);boss.moving=true;
        if(Math.hypot(px-boss.x,pz-boss.z)<1&&hitThuan(5.5,1,`${boss.name} bowls Thuan over like a skittle.`)){boss.state='skid';boss.t=.5;}
        else if(wall)rest(3,`BONK. ${boss.name} runs into the racks and sits down, seeing stars. Now — shoo it!`);
        else if((boss.t-=dt)<=0)rest(2,`${boss.name} runs out of puff.`);
      }else if(s==='skid'){rushBoss(2.5*boss.t,dt);if((boss.t-=dt)<=0)rest(2.2,`${boss.name} sits down, very pleased with itself, and needs a moment.`);}
      else if(s==='pound'){if((boss.t-=dt)<=0){if(Math.hypot(px-boss.x,pz-boss.z)<2.4)hitThuan(3.5,.9,'THUD. The whole floor jumps, and so does Thuan.');rest(1.8,'');}}
    },
    // Lies flat like a log and drifts closer. Near enough, it lifts its head -- then a lunge and
    // a SNAP. After that it rolls over on its back, worn out.
    crocodile(dt,d){
      const s=boss.state;
      if(s==='roam'){
        // Close: the log drifts towards her. Otherwise it goes and lies by the goods she needs.
        const spot=d<9?_d(px,pz,maze):byTheGoods();boss.moving=spot?walkBoss(spot,d<9?.6:.9,dt):false;
        if(boss.cool<=0&&d<2.9&&clearLine(boss.x,boss.z,px,pz)){boss.state='jaws';boss.t=.55;lockOn();say(`The log by the racks opens its eyes. It is ${boss.name}.`,1.8);}
      }else if(s==='jaws'){turnBoss(px,pz,dt,10);if((boss.t-=dt)<=0){lockOn();boss.state='lunge';boss.t=.45;}}
      else if(s==='lunge'){
        rushBoss(7.5,dt);boss.moving=true;
        if(Math.hypot(px-boss.x,pz-boss.z)<1&&hitThuan(4.5,1,`SNAP! ${boss.name}: “${bossLine()}”`)){rest(2.6,`${boss.name} rolls over on its back, legs in the air, worn out.`);}
        else if((boss.t-=dt)<=0)rest(2.4,`${boss.name} snaps at nothing and rolls over on its back, worn out.`);
      }
    },
    // Ambles after her; close up, rears up on its hind legs with a roar, then swipes. Then it
    // sits down heavily to get its breath back.
    bear(dt,d){
      const s=boss.state;
      if(s==='roam'){
        boss.moving=prowl(dt,1.3,10);
        if(boss.cool<=0&&d<2.5){boss.state='rear';boss.t=1.1;say(`${boss.name} rears up on its hind legs. GRR. “${bossLine()}”`,2.2);}
      }else if(s==='rear'){turnBoss(px,pz,dt);if((boss.t-=dt)<=0){boss.state='swipe';boss.t=.35;}}
      else if(s==='swipe'){if((boss.t-=dt)<=0){if(Math.hypot(px-boss.x,pz-boss.z)<2.7)hitThuan(4,.9,`${boss.name} swipes Thuan across the aisle with a big soft paw.`);rest(2.4,`${boss.name} sits down heavily, puffing.`);}}
    },
    // Wanders and grazes, and will not be moved. Come up in front and she brays you off; come up
    // behind and you get both back hooves. After a kick she has to catch her breath.
    donkey(dt,d){
      const s=boss.state;
      if(s==='roam'){
        boss.moving=prowl(dt,.8,0,true);boss.grazing=!boss.moving;
        if(boss.cool<=0&&d<2){
          const fx=Math.sin(boss.yaw),fz=Math.cos(boss.yaw),dot=((px-boss.x)*fx+(pz-boss.z)*fz)/(d||1);
          if(dot<-.3){boss.state='kick';boss.t=.45;say(`${boss.name} goes very still, ears back.`,1.4);}
          else{boss.state='bray';boss.t=1;turnBoss(px,pz,-1);hitThuan(2.2,.35,`HEE-HAW! ${boss.name}: “${bossLine()}”`);}
        }
      }else if(s==='kick'){if((boss.t-=dt)<=0){if(Math.hypot(px-boss.x,pz-boss.z)<2.2)hitThuan(5,1,`${boss.name} lets fly with both back hooves.`);rest(2.4,`${boss.name} is winded, and stands there catching her breath.`);}}
      else if(s==='bray'){if((boss.t-=dt)<=0){boss.yaw+=Math.PI;boss.state='roam';boss.cool=1.5;}}
    },
  };
  function shoo(){
    if(shooCool>0||phase!=='playing')return;shooCool=0.35;character.playPickup();
    if(!bossAbout()||boss.state==='defeated'||boss.state==='leaving')return;
    const d=Math.hypot(boss.x-px,boss.z-pz);
    if(d>SHOO_REACH){if(d<4)say('Shoo! — a little closer.',1.2);return;}
    if(boss.state!=='tired'||boss.hitThisRest){say(`${boss.name} does not even notice. Wait until it is worn out.`,1.8);return;}
    boss.hp--;boss.hitThisRest=true;sound.pickup();
    if(boss.hp<=0){
      boss.state='defeated';boss.t=2.6;bossDefeated=true;yenFound=BOSS_YEN;
      say(`${boss.name} takes off the ${boss.animal} head: it was ${boss.who==='Bus driver'?'the bus driver':boss.who} all along. A bow, the head back on backwards, and ¥${BOSS_YEN} in old cave coins on the floor.`,5);
      return;
    }
    say(`Shoo! ${boss.name} gets up, cross. “${bossLine()}”`,2.6);boss.t=Math.min(boss.t,.5);
  }
  function updateBoss(dt){
    if(!boss)return;
    const b=boss,g=b.body.group,d=Math.hypot(px-b.x,pz-b.z);b.phase+=dt;b.cool=Math.max(0,b.cool-dt);b.moving=false;b.grazing=false;
    if(b.state==='waiting'){
      if(time>=b.emergeAt){b.state='roam';b.appear=0;g.visible=true;say(`Something big climbs out of the hole at the back: ${b.name}. “${bossLine()}”`,4);}
      return;
    }
    if(b.state==='gone')return;
    b.appear=Math.min(1,b.appear+dt*2);
    if(b.state==='tired'){if((b.t-=dt)<=0){b.state='roam';b.cool=2.2;}}
    else if(b.state==='defeated'){if((b.t-=dt)<=0){b.state='leaving';b.path=[];b.replan=0;}}
    else if(b.state==='leaving'){b.moving=walkBoss(maze.hole,1.4,dt);if(!b.moving&&Math.hypot(b.x-world.hole.x,b.z-world.hole.z)<.3){b.state='gone';g.visible=false;}}
    else BEHAVIOUR[b.animal]?.(dt,d);
    poseBoss(dt);
  }
  /** The body: what the animal is doing, in the suit's joints. A positive z turn swings a hanging arm towards +x. */
  function poseBoss(dt){
    const b=boss,body=b.body,g=body.group,s=b.state,sway=b.moving?Math.sin(b.phase*9):0,a=b.animal;
    body.suit.position.set(0,0,0);body.suit.rotation.set(0,0,sway*.12);body.suit.scale.set(1,1,1);body.head.rotation.set(0,0,0);
    body.arms[0].rotation.set(sway*.6,0,-.12);body.arms[1].rotation.set(-sway*.6,0,.12);body.legs[0].rotation.set(-sway*.5,0,0);body.legs[1].rotation.set(sway*.5,0,0);
    body.stars.visible=s==='tired';body.stars.rotation.y+=dt*4;
    const sit=()=>{body.suit.position.y=-.32;body.suit.rotation.x=-.25;body.legs[0].rotation.x=body.legs[1].rotation.x=-1.4;body.arms[0].rotation.set(-.2,0,-.55);body.arms[1].rotation.set(-.2,0,.55);body.head.rotation.z=Math.sin(b.phase*3)*.15;};
    if(s==='defeated'||s==='leaving'&&!b.moving){body.suit.rotation.x=.55;}
    else if(a==='gorilla'){
      if(s==='roam'){body.suit.rotation.x=.35;body.arms[0].rotation.x=-.45+sway*.35;body.arms[1].rotation.x=-.45-sway*.35;}
      else if(s==='beat'){const k=Math.sin(b.phase*24);body.arms[0].rotation.set(-1.35,0,.75+(k>0?.4:0));body.arms[1].rotation.set(-1.35,0,-.75-(k<0?.4:0));body.head.rotation.x=-.25;}
      else if(s==='charge'||s==='skid'){body.suit.rotation.x=.6;body.arms[0].rotation.x=body.arms[1].rotation.x=-.9+sway*.5;}
      else if(s==='pound'){const k=1-b.t/.9;body.suit.position.y=Math.sin(Math.min(1,k)*Math.PI)*.45;body.arms[0].rotation.set(-2.9,0,-.2);body.arms[1].rotation.set(-2.9,0,.2);}
      else if(s==='tired')sit();
    }else if(a==='crocodile'){
      // Prone, a log on the floor; on its back when worn out.
      body.suit.rotation.x=s==='tired'?-1.45:1.45;body.suit.position.y=.3;
      if(s==='jaws')body.head.rotation.x=-.6;
      if(s==='tired'){body.arms[0].rotation.x=body.arms[1].rotation.x=-1.5+Math.sin(b.phase*10)*.3;body.legs[0].rotation.x=body.legs[1].rotation.x=-1.5+Math.cos(b.phase*10)*.3;}
      else{body.arms[0].rotation.x=-1.6+sway*.4;body.arms[1].rotation.x=-1.6-sway*.4;}
    }else if(a==='bear'){
      if(s==='rear'){if(b.pretend)body.suit.position.y=.06;else body.suit.scale.y=1.15;body.arms[0].rotation.set(-2.7,0,-.3);body.arms[1].rotation.set(-2.7,0,.3);body.head.rotation.x=-.3;}
      else if(s==='swipe'){const k=1-b.t/.35;body.arms[0].rotation.set(-2.7+2.3*k,0,-.3-.6*k);body.arms[1].rotation.set(-2.7+2.3*k,0,.3+.6*k);}
      else if(s==='tired')sit();
      else body.suit.rotation.z=sway*.2;
    }else if(a==='donkey'){
      if(b.grazing)body.head.rotation.x=.6+Math.sin(b.phase*4)*.08;
      if(s==='kick'){const k=b.t<.15?1:0;body.suit.rotation.x=.55;body.legs[0].rotation.x=body.legs[1].rotation.x=k?1.3:.2;}
      else if(s==='bray'){body.head.rotation.x=-.45;body.suit.rotation.z=Math.sin(b.phase*30)*.05;}
      else if(s==='tired'){body.suit.rotation.x=.3;body.head.rotation.x=.5;body.suit.position.y=Math.sin(b.phase*6)*.02;}
    }
    g.position.set(b.x,b.moving&&a!=='crocodile'?Math.abs(Math.sin(b.phase*9))*.05:0,b.z);g.rotation.y=b.yaw;
    g.scale.setScalar(BOSS_SIZE*(.15+.85*b.appear));
    if(b.pretend)syncPretend(b);
  }
  function talkToGuest(dt) {
    guestCooldown=Math.max(0,guestCooldown-dt);
    guestPrompt='';
    const guest=world.guest;if(!guest||phase!=='playing')return;
    const near=Math.hypot(guest.x-px,guest.z-pz)<1.15;
    if(!near){guestLine=0;return;}
    guestPrompt='Talk with '+guest.name;
    if(guestCooldown>0)return;
    // Auto-chat on linger — short TalkFun lines, then yield so routes stay clear.
    if(idleTime>0.45||near){
      const line=guest.lines[Math.min(guestLine,guest.lines.length-1)];
      say(guest.name+': '+line,3.4);
      guestLine=Math.min(guestLine+1,guest.lines.length);
      guestCooldown=guestLine>=guest.lines.length?8:2.6;
    }
  }
  function updateCamera(dt) {
    let cameraYaw=yaw,cameraPitch=pitch,boom=boomLength;
    if(phase==='title'){cameraYaw=-Math.PI/2;cameraPitch=-0.14;boom=3.35;character.setHeading(-Math.PI/2,true);}
    if(phase==='won'){cameraYaw=yaw+Math.sin(simTime*0.32)*0.65;cameraPitch=-0.22;}
    focus.set(px,0.98,pz);
    const dx=Math.sin(cameraYaw)*Math.cos(cameraPitch)*boom;
    const dz=Math.cos(cameraYaw)*Math.cos(cameraPitch)*boom;
    const dy=-Math.sin(cameraPitch)*boom;
    const distance=Math.hypot(dx,dy,dz)||1;
    const safe=xd(focus.x,focus.y,focus.z,dx,dy,dz,distance,maze);
    desired.set(focus.x+dx/distance*safe,focus.y+dy/distance*safe,focus.z+dz/distance*safe);
    if(cameraInitial){cameraPosition.copy(desired);cameraInitial=false;}
    else cameraPosition.lerp(desired,1-Math.exp(-7.5*dt)); // softer follow
    const offset=cameraPosition.clone().sub(focus),length=offset.length();
    const clipped=xd(focus.x,focus.y,focus.z,offset.x,offset.y,offset.z,length,maze);
    if(clipped<length)cameraPosition.copy(focus).addScaledVector(offset.normalize(),clipped);
    camera.position.copy(cameraPosition);camera.lookAt(focus);
    // Soft FOV breath with boom zoom (third-person, not FPS head-bob).
    const targetFov=48+(boomLength-2.6)*1.1;
    camera.fov+=(targetFov-camera.fov)*(1-Math.exp(-6*dt));
    camera.updateProjectionMatrix();
  }
  function onWheel(event){
    if(phase!=='playing'&&phase!=='title')return;
    event.preventDefault();
    boomLength=Math.max(2.55,Math.min(5.1,boomLength+Math.sign(event.deltaY)*0.18));
  }
  let pinchStart=0;
  function onTouchStart(event){
    if(event.touches?.length===2){
      const a=event.touches[0],b=event.touches[1];
      pinchStart=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    }
  }
  function onTouchMove(event){
    if(event.touches?.length!==2||!pinchStart)return;
    const a=event.touches[0],b=event.touches[1];
    const dist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    const delta=(pinchStart-dist)*0.01;
    pinchStart=dist;
    boomLength=Math.max(2.55,Math.min(5.1,boomLength+delta));
  }
  function resize(){const w=canvas.clientWidth||1,h=canvas.clientHeight||1;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function releasePointer(){if(controls.isPointerLocked())document.exitPointerLock?.();}
  function pause(){if(phase!=='playing')return;phase='paused';speed=vx=vz=0;lookIdle=0.5;controls.reset();releasePointer();emitHud();}
  function visibility(){if(document.hidden)pause();}
  function start(auto=false){
    sound.unlock();controls.reset();accumulator=0;lastFrame=performance.now();
    if(phase==='title'||phase==='paused'||phase==='restocking')phase='playing';
    automatic=auto;assisted ||= auto;route=[];autoTarget=null;character.setWave(false);cameraInitial=true;
    say(auto?'I will collect the list. You can take over at any time.':'Tea, biscuits, and a little order. Let us begin.',4);emitHud();
  }
  resetPosition();resize();
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  window.addEventListener('resize',resize);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',visibility);
  canvas.addEventListener('wheel',onWheel,{passive:false});
  canvas.addEventListener('touchstart',onTouchStart,{passive:true});
  canvas.addEventListener('touchmove',onTouchMove,{passive:true});
  renderer.setAnimationLoop(()=>{
    if(disposed)return;
    const now=performance.now(),dt=Math.min((now-lastFrame)/1000,0.1);lastFrame=now;
    if(phase!=='paused'){
      simTime+=dt;reactionTime=Math.max(0,reactionTime-dt);accumulator+=dt;
      while(accumulator>=STORAGE_STEP){step(STORAGE_STEP);accumulator-=STORAGE_STEP;}
      character.group.position.set(px,0,pz);
      character.setWave(phase==='title'&&simTime<4 || phase==='playing'&&idleTime>8&&idleTime%14<10);
      character.setCelebrate(phase==='won');character.update(dt,phase==='playing'?speed:0,0,simTime);
      updateCamera(dt);
      dust.forEach((p,index)=>{dummy.position.set(p.x+Math.sin(simTime*0.2+index)*0.15,p.y+Math.sin(simTime*0.1+index)*0.15,p.z);dummy.rotation.set(simTime*0.1,index,0);dummy.scale.set(1,1,1);dummy.updateMatrix();world.motes.setMatrixAt(index,dummy.matrix);});
      world.motes.instanceMatrix.needsUpdate=true;
    }
    const exitCell=_d(world.exit.x,world.exit.z,maze);
    Md({canvas:minimap,maze,explored,x:px,z:pz,yaw,charms:world.items,exit:world.exit,exitKnown:explored.has(`${exitCell.c},${exitCell.r}`)});
    renderer.render(scene,camera);hudElapsed+=dt;if(hudElapsed>0.12){hudElapsed=0;emitHud();}
  });
  emitHud();
  return {
    start:()=>start(false),autoRestock:()=>start(true),pause,
    resume(){if(phase==='paused'){controls.reset();phase='playing';emitHud();}},
    takeControl(){automatic=false;route=[];controls.reset();say('Your turn. I have the list.');emitHud();},
    shoo(){shooQueued=true;},
    /** Tests only: put Thuan and tonight's boss where a behaviour can be watched. */
    _stage({thuan,boss:at}={}){
      if(thuan){px=thuan[0];pz=thuan[1];vx=vz=0;character.group.position.set(px,0,pz);}
      if(at&&boss){if(boss.state==='waiting'){boss.body.group.visible=true;}Object.assign(boss,{x:at[0],z:at[1],yaw:at[2]??boss.yaw,state:'roam',cool:0,appear:1,path:[],wander:null,pause:at[3]??9});}
      automatic=false;route=[];stun=0;
    },
    restart(seed){sound.unlock();scene.remove(world.group);world.dispose();maze=hd(seed==='same'?maze.seed:seed??(Math.random()*1e9|0));world=Yp(maze);scene.add(world.group);phase='title';resetPosition();emitHud();},
    setMuted:muted=>sound.setMuted(muted),
    setTouchMove:(x,y)=>controls.setTouchMove(x,y),setTouchLook:(x,y)=>controls.setTouchLook(x,y),setTouchSprint:value=>controls.setTouchSprint(value),requestLock:()=>controls.tryPointerLock(canvas),
    dispose(){disposed=true;renderer.setAnimationLoop(null);controls.detach();observer.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('touchstart',onTouchStart);canvas.removeEventListener('touchmove',onTouchMove);releasePointer();sound.dispose();world.dispose();character.dispose();renderer.dispose();},
  };
}

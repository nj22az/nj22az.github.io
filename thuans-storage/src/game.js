const STORAGE_WALK_SPEED = 2.35;
const STORAGE_RUN_SPEED = 4.2;
const STORAGE_STEP = 1 / 60;
// Bizarro Minato in the stockroom (stockroom.js): how fast they waddle, how close Thuan
// must be to shoo one, what a shooed one drops, and how long a bop leaves her dizzy.
const INTRUDER_SPEED = 1.35, INTRUDER_SLOW = 1.05, INTRUDER_CARRY = 0.75, RUMMAGE = 6;
const SHOO_REACH = 1.45, SHOO_YEN = 50, BOP_REACH = 0.85, BOP_STUN = 0.7;

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
  let intruders=[],shooed=0,yenFound=0,stun=0,shooCool=0,shooHeld=false,shooQueued=false,chaseReplan=0;
  const focus=new G(),desired=new G(),cameraPosition=new G(),dummy=new lr();
  const dust=Array.from({length:28},(_,i)=>({x:(i*7%29)-14,z:(i*11%29)-14,y:0.6+(i%8)*0.2}));
  function say(text,seconds=3) {reaction=text;reactionTime=seconds;}
  function resetPosition() {
    const start=gd(maze.start.c,maze.start.r,maze);
    px=start.x;pz=start.z;vx=vz=speed=0;yaw=Math.PI;pitch=-0.36;
    time=0;simTime=0;idleTime=0;automatic=false;assisted=false;autoWait=0;route=[];autoTarget=null;
    explored=new Set();collectedBefore=0;lastPickup='';reaction='';reactionTime=0;
    cameraInitial=true;boomLength=3.55;lookIdle=0.5;guestLine=0;guestCooldown=0;guestPrompt='';character.group.position.set(px,0,pz);character.setHeading(yaw,true);
    resetIntruders();
    character.setCelebrate(false);character.setWave(true);controls.reset();reveal();
  }
  function reveal() {
    const cell=_d(px,pz,maze);
    for(let r=cell.r-3;r<=cell.r+3;r++)for(let c=cell.c-3;c<=cell.c+3;c++)explored.add(`${c},${r}`);
  }
  function emitHud() {
    const required=world.items.filter(item=>item.needed),collected=required.filter(item=>item.taken).length,lost=required.filter(item=>item.lost);
    const cell=_d(px,pz,maze),zone=bd(cell.c,cell.r,maze)?.name ?? 'Main aisle';
    onHud({phase,time,collected,total:required.length,list:required.map(({id,name,taken,lost})=>({id,name,taken,lost:!!lost,needed:true})),
      readyToStock:required.every(item=>item.taken||item.lost),lost:lost.length,lostNames:lost.map(item=>item.name),lostIds:lost.map(item=>item.id),
      shooed,yenFound,intrudersAbout:intruders.filter(v=>v.state!=='waiting'&&v.state!=='gone').length,intrudersTotal:intruders.length,
      thief:intruders.find(v=>v.carrying)?.name??'',thuanReady:characterReady,pointerLocked:controls.isPointerLocked(),
      zone,assisted,quote:reaction,reaction:reactionTime>0?reaction:'',autoRestocking:automatic,seed:maze.seed,
      explored:[...explored].filter(key=>{const[c,r]=key.split(',').map(Number);return yd(c,r,maze);}).length/maze.cells.filter(v=>v===0).length,guestPrompt,guest:world.guest?{name:world.guest.name,id:world.guest.id}:null});
  }
  function chooseRoute() {
    const from=_d(px,pz,maze);
    // A carton on its way down the hole comes first: after it, and shoo.
    const thief=intruders.find(v=>v.carrying&&v.state==='flee');
    // Then one going through a carton on the list: get there before they lift it.
    const rummager=thief?null:intruders.find(v=>v.state==='rummage');
    const chase=thief||rummager;
    // Re-aimed every moment, so it skips the centre of her own cell: going back to it each
    // time had her jittering on the spot while the thief walked off.
    if(chase){const cell=_d(chase.x,chase.z,maze),path=storageRoute(maze,from,cell);if(path.length){route=(path.length>1?path.slice(1):path).map(c=>gd(c.c,c.r,maze));if(path.length===1)route.push({x:chase.x,z:chase.z});autoTarget={id:'thief'};chaseReplan=0.4;return;}}
    const remaining=world.items.filter(item=>item.needed&&!item.taken&&!item.lost&&!item.carriedBy);
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
      if(item.taken||item.lost||item.carriedBy||Math.hypot(item.x-px,item.z-pz)>0.85)continue;
      item.taken=true;item.mesh.visible=false;lastPickup=item.id;sound.pickup();character.playPickup();
      if(item.needed){
        say(item.id==='tea'?'Tea tins. The kettle will be ready soon.':`${item.name}. That goes on the list.`);
        if(automatic&&autoTarget?.id===item.id){route=[];autoTarget=null;autoWait=0.65;}
      }
    }
    const count=world.items.filter(item=>item.needed&&item.taken).length;
    if(count>collectedBefore&&world.items.filter(item=>item.needed).every(item=>item.taken||item.lost))say('All packed. Back to the pink shop curtain.',5);
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
      // Thuan shoos anyone in reach by herself, and re-aims at a moving thief.
      if(intruders.some(v=>activeIntruder(v)&&Math.hypot(v.x-px,v.z-pz)<SHOO_REACH*.9))shoo();
      if(autoTarget?.id==='thief'&&(chaseReplan-=dt)<=0)route=[];
      if(autoTarget&&autoTarget.id!=='thief'&&autoTarget.id!=='exit'&&(autoTarget.carriedBy||autoTarget.lost||autoTarget.taken)){route=[];autoTarget=null;}
      if(autoTarget&&autoTarget.id!=='thief'&&intruders.some(v=>v.carrying&&v.state==='flee'||v.state==='rummage')){route=[];autoTarget=null;}
    }
    if(stun>0){stun-=dt;targetX=targetZ=0;vx=X(vx,0,10,dt);vz=X(vz,0,10,dt);}
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
    time+=dt;reveal();collect();talkToGuest(dt);updateIntruders(dt);
    if(world.items.filter(item=>item.needed).every(item=>item.taken||item.lost)&&Math.hypot(world.exit.x-px,world.exit.z-pz)<1.05){
      phase='won';automatic=false;speed=vx=vz=0;controls.reset();releasePointer();
      const lost=world.items.filter(item=>item.needed&&item.lost).map(item=>item.name.toLowerCase());
      reaction=lost.length?`Sakura opens without the ${lost.join(' or the ')}. Sold out until the next delivery.`:shooed?'Everything is ready, and nothing went down the hole. Sakura is open.':'Everything is ready. Sakura is open.';reactionTime=10;
      character.setCelebrate(true);character.setWave(false);sound.win();emitHud();
    }
  }
  // ---- Bizarro Minato -------------------------------------------------------
  function resetIntruders(){
    intruders=(world.intruders||[]).map(look=>({...look,name:look.who+' the '+look.animal,state:'waiting',x:world.hole.x,z:world.hole.z,
      path:[],target:null,carrying:null,stunned:0,bopCool:0,leave:0,said:0,appear:0,phase:Math.random()*6}));
    for(const v of intruders){v.body.group.visible=false;v.body.group.scale.setScalar(1);v.body.carry.clear();}
    shooed=0;yenFound=0;stun=0;shooCool=0;shooQueued=false;chaseReplan=0;
    for(const item of world.items){delete item.lost;delete item.carriedBy;}
  }
  const activeIntruder=v=>v.state==='raid'||v.state==='rummage'||v.state==='flee';
  const holeCell=()=>maze.hole;
  function line(v){const text=v.lines[v.said%v.lines.length];v.said++;return text;}
  function headFor(v,cell){const from=_d(v.x,v.z,maze),path=storageRoute(maze,from,cell);v.path=path.slice(1).map(c=>gd(c.c,c.r,maze));return path.length>0;}
  function pickTarget(v){
    // The nearest carton on the list that nobody else is after.
    const from=_d(v.x,v.z,maze);let best=null,length=Infinity;
    for(const item of world.items){
      if(!item.needed||item.taken||item.lost||item.carriedBy||intruders.some(o=>o!==v&&o.target===item))continue;
      const path=storageRoute(maze,from,item);if(path.length&&path.length<length){length=path.length;best=item;}
    }
    v.target=best;if(best)headFor(v,best);else{v.state='leaving';headFor(v,holeCell());}
  }
  function dropCarton(v){
    const item=v.carrying;if(!item)return;
    // It lands where they stood, on the nearest clear floor, for Thuan to pick back up.
    const cell=_d(v.x,v.z,maze),p=gd(cell.c,cell.r,maze);
    item.c=cell.c;item.r=cell.r;item.x=p.x;item.z=p.z;item.carriedBy=null;v.carrying=null;
    v.body.carry.remove(item.mesh);world.group.add(item.mesh);item.mesh.position.set(p.x,0.5,p.z);item.mesh.scale.setScalar(1.6);
  }
  function shoo(){
    if(shooCool>0||phase!=='playing')return;shooCool=0.35;character.playPickup();
    let near=null,d=Infinity;
    for(const v of intruders){if(!activeIntruder(v))continue;const dd=Math.hypot(v.x-px,v.z-pz);if(dd<d){d=dd;near=v;}}
    if(!near||d>SHOO_REACH){if(near&&d<4)say('Shoo! — a little closer.',1.2);return;}
    const had=near.carrying?.name;dropCarton(near);
    near.state='stunned';near.stunned=0.9;near.target=null;shooed++;yenFound+=SHOO_YEN;sound.pickup();
    say(`Shoo! ${near.name}${had?' drops the '+had.toLowerCase():''} and ¥${SHOO_YEN} in old cave coins: “${line(near)}”`,3.4);
  }
  function updateIntruders(dt){
    for(const v of intruders){
      const body=v.body,g=body.group;v.phase+=dt;v.bopCool=Math.max(0,v.bopCool-dt);
      if(v.state==='waiting'){if(time>=v.emergeAt){v.state='raid';v.appear=0;g.visible=true;g.position.set(v.x,0,v.z);say(`Something climbs out of the hole at the back: ${v.name}. “${line(v)}”`,3.6);pickTarget(v);}continue;}
      if(v.state==='gone')continue;
      v.appear=Math.min(1,v.appear+dt*2.5);
      let moving=false;
      if(v.state==='stunned'){
        v.stunned-=dt;body.suit.rotation.y+=dt*9;
        if(v.stunned<=0){body.suit.rotation.y=0;v.state='leaving';headFor(v,holeCell());}
      }else{
        // Raiding: re-aim if the carton went (Thuan took it, or another got there first).
        if(v.state==='raid'&&(!v.target||v.target.taken||v.target.lost||v.target.carriedBy))pickTarget(v);
        if(v.state==='rummage'){moving=false;body.head.rotation.x=.45+Math.sin(v.phase*7)*.15;}else body.head.rotation.x=0;
        const pace=v.state==='flee'?INTRUDER_CARRY:v.slow?INTRUDER_SLOW:INTRUDER_SPEED;
        let step=pace*dt;
        while(step>0&&v.path.length){
          const [n]=v.path,dx=n.x-v.x,dz=n.z-v.z,dist=Math.hypot(dx,dz);
          if(dist<=step){v.x=n.x;v.z=n.z;v.path.shift();step-=dist;}else{v.x+=dx/dist*step;v.z+=dz/dist*step;step=0;g.rotation.y=Math.atan2(dx,dz);}
          moving=true;
        }
        if(!v.path.length){
          if(v.state==='raid'&&v.target){
            const item=v.target;
            if(Math.hypot(item.x-v.x,item.z-v.z)<1.2){
              // First they go through it, reading the labels backwards: the moment to get there.
              v.state='rummage';v.rummage=RUMMAGE;
              say(`${v.name} is going through the ${item.name.toLowerCase()} by the ${(bd(item.c,item.r,maze)?.name??'racks').toLowerCase()}. “${line(v)}”`,3.6);
            }else headFor(v,item);
          }else if(v.state==='rummage'){
            const item=v.target;
            if(!item||item.taken||item.lost||item.carriedBy){v.state='raid';pickTarget(v);}
            else if((v.rummage-=dt)<=0){
              // Up over the head and away: “Everything is free!”
              item.carriedBy=v;v.carrying=item;v.target=null;v.state='flee';
              world.group.remove(item.mesh);body.carry.add(item.mesh);item.mesh.position.set(0,0,0);item.mesh.scale.setScalar(1);
              say(`${v.name} has the ${item.name.toLowerCase()}! After them, before the hole. “${line(v)}”`,3.6);headFor(v,holeCell());
            }
          }else if(v.state==='flee'||v.state==='leaving'){
            const item=v.carrying;
            if(item){item.lost=true;item.carriedBy=null;v.carrying=null;body.carry.remove(item.mesh);item.mesh.visible=false;
              say(`${v.name} goes down the hole with the ${item.name.toLowerCase()}. Sakura will be out of it tomorrow.`,4);}
            v.state='gone';g.visible=false;
          }
        }
        // Bumping into one that is not carrying anything: a bop, a dizzy moment, a line.
        if(v.state==='raid'&&v.bopCool<=0&&stun<=0&&Math.hypot(v.x-px,v.z-pz)<BOP_REACH){v.bopCool=3;stun=BOP_STUN;say(`${v.name} bops Thuan on the head. “${line(v)}”`,2.6);}
      }
      // A waddle: side to side as they go, arms up holding a carton overhead, a bow on the way out.
      const sway=moving?Math.sin(v.phase*9):0;
      g.position.set(v.x,moving?Math.abs(Math.sin(v.phase*9))*.06:0,v.z);g.scale.setScalar(.15+.85*v.appear);
      if(v.state!=='stunned')body.suit.rotation.set(v.state==='leaving'&&!moving?.5:0,0,sway*.14);
      const up=v.carrying?-2.9:0;
      body.arms[0].rotation.set(up||sway*.6,0,v.carrying?-.25:.12);body.arms[1].rotation.set(up||-sway*.6,0,v.carrying?.25:-.12);
    }
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
    restart(seed){sound.unlock();scene.remove(world.group);world.dispose();maze=hd(seed==='same'?maze.seed:seed??(Math.random()*1e9|0));world=Yp(maze);scene.add(world.group);phase='title';resetPosition();emitHud();},
    setMuted:muted=>sound.setMuted(muted),
    setTouchMove:(x,y)=>controls.setTouchMove(x,y),setTouchLook:(x,y)=>controls.setTouchLook(x,y),setTouchSprint:value=>controls.setTouchSprint(value),requestLock:()=>controls.tryPointerLock(canvas),
    dispose(){disposed=true;renderer.setAnimationLoop(null);controls.detach();observer.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('touchstart',onTouchStart);canvas.removeEventListener('touchmove',onTouchMove);releasePointer();sound.dispose();world.dispose();character.dispose();renderer.dispose();},
  };
}

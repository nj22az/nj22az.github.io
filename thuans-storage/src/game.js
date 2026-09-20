const STORAGE_WALK_SPEED = 2.35;
const STORAGE_RUN_SPEED = 4.2;
const STORAGE_STEP = 1 / 60;

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
  const focus=new G(),desired=new G(),cameraPosition=new G(),dummy=new lr();
  const dust=Array.from({length:28},(_,i)=>({x:(i*7%29)-14,z:(i*11%29)-14,y:0.6+(i%8)*0.2}));
  function say(text,seconds=3) {reaction=text;reactionTime=seconds;}
  function resetPosition() {
    const start=gd(maze.start.c,maze.start.r,maze);
    px=start.x;pz=start.z;vx=vz=speed=0;yaw=Math.PI;pitch=-0.36;
    time=0;simTime=0;idleTime=0;automatic=false;assisted=false;autoWait=0;route=[];autoTarget=null;
    explored=new Set();collectedBefore=0;lastPickup='';reaction='';reactionTime=0;
    cameraInitial=true;boomLength=3.55;lookIdle=0.5;guestLine=0;guestCooldown=0;guestPrompt='';character.group.position.set(px,0,pz);character.setHeading(yaw,true);
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
      readyToStock:collected===required.length,thuanReady:characterReady,pointerLocked:controls.isPointerLocked(),
      zone,assisted,quote:reaction,reaction:reactionTime>0?reaction:'',autoRestocking:automatic,seed:maze.seed,
      explored:[...explored].filter(key=>{const[c,r]=key.split(',').map(Number);return yd(c,r,maze);}).length/maze.cells.filter(v=>v===0).length,guestPrompt,guest:world.guest?{name:world.guest.name,id:world.guest.id}:null});
  }
  function chooseRoute() {
    const from=_d(px,pz,maze),remaining=world.items.filter(item=>item.needed&&!item.taken);
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
    // Orbit look — slightly snappier stick feel, pitch clamped like a soft third-person shoulder cam.
    yaw-=look.x*0.0045+input.lookHoldX*2.35*dt;
    pitch=Math.max(-0.72,Math.min(-0.08,pitch-look.y*0.0033-input.lookHoldY*1.65*dt));
    const looking=Math.abs(look.x)>0.35||Math.abs(look.y)>0.35||Math.abs(input.lookHoldX)>0.06||Math.abs(input.lookHoldY)>0.06;
    lookIdle=looking?0:lookIdle+dt;
    let targetX=0,targetZ=0;
    // Forward look: character heading. Face toward travel before stepping (no moonwalk).
    const faceTowardTravel=(tx,tz)=>{
      const travel=Math.hypot(tx,tz);
      if(travel<1e-4)return {x:0,z:0,yaw:character.getHeading()};
      const travelYaw=Math.atan2(-tx,-tz);
      character.setHeading(travelYaw);
      const facing=character.getHeading();
      let delta=travelYaw-facing;
      while(delta>Math.PI)delta-=Math.PI*2;
      while(delta<-Math.PI)delta+=Math.PI*2;
      // Turn in place when facing away; otherwise scale pace by alignment.
      if(Math.abs(delta)>=0.9)return {x:0,z:0,yaw:travelYaw};
      const align=alignedStep(delta);
      return {x:tx*align,z:tz*align,yaw:travelYaw};
    };
    if(automatic) {
      if(autoWait>0){autoWait-=dt;vx=vz=0;}
      else {
        if(!route.length)chooseRoute();
        while(route.length&&Math.hypot(route[0].x-px,route[0].z-pz)<0.09)route.shift();
        if(route.length){
          const dx=route[0].x-px,dz=route[0].z-pz,distance=Math.hypot(dx,dz);
          const pace=Math.min(STORAGE_WALK_SPEED,distance/dt);
          const faced=faceTowardTravel(dx/distance*pace,dz/distance*pace);
          targetX=faced.x;targetZ=faced.z;
          if(!look.x&&!input.lookHoldX)yaw=Sd(yaw,faced.yaw,1-Math.exp(-2.3*dt));
        }
      }
      vx=targetX;vz=targetZ;
    } else {
      const pace=input.sprint?STORAGE_RUN_SPEED:STORAGE_WALK_SPEED;
      const rawX=(Math.cos(yaw)*input.moveX-Math.sin(yaw)*input.moveY)*pace;
      const rawZ=(-Math.sin(yaw)*input.moveX-Math.cos(yaw)*input.moveY)*pace;
      const faced=faceTowardTravel(rawX,rawZ);
      targetX=faced.x;targetZ=faced.z;
      // No residual slide while turning in place — that was reading as a moonwalk.
      if(Math.hypot(targetX,targetZ)<0.01){vx=vz=0;}
      else {
        vx=X(vx,targetX,16,dt);vz=X(vz,targetZ,16,dt);
        if(Math.hypot(vx,vz)<0.025)vx=vz=0;
      }
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
    time+=dt;reveal();collect();talkToGuest(dt);
    if(world.items.filter(item=>item.needed).every(item=>item.taken)&&Math.hypot(world.exit.x-px,world.exit.z-pz)<1.05){
      phase='won';automatic=false;speed=vx=vz=0;controls.reset();controls.clearSprint();releasePointer();
      reaction='Everything is ready. Sakura is open.';reactionTime=10;
      character.setCelebrate(true);character.setWave(false);sound.win();emitHud();
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
  function pause(){if(phase!=='playing')return;phase='paused';speed=vx=vz=0;lookIdle=0.5;controls.reset();controls.clearSprint();releasePointer();emitHud();}
  function visibility(){if(document.hidden)pause();}
  function start(auto=false){
    sound.unlock();controls.reset();controls.clearSprint();accumulator=0;lastFrame=performance.now();
    if(phase==='title'||phase==='paused'||phase==='restocking')phase='playing';
    automatic=auto;assisted ||= auto;route=[];autoTarget=null;character.setWave(false);cameraInitial=true;
    // Leave the title pose: face into the stockroom (yaw), snap so she does not moonwalk on the first step.
    character.setHeading(yaw,true);
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
    resume(){if(phase==='paused'){controls.reset();controls.clearSprint();character.setHeading(yaw,true);phase='playing';emitHud();}},
    takeControl(){automatic=false;route=[];controls.reset();controls.clearSprint();character.setHeading(yaw,true);say('Your turn. I have the list.');emitHud();},
    restart(seed){sound.unlock();scene.remove(world.group);world.dispose();maze=hd(seed==='same'?maze.seed:seed??(Math.random()*1e9|0));world=Yp(maze);scene.add(world.group);phase='title';resetPosition();emitHud();},
    setMuted:muted=>sound.setMuted(muted),
    setTouchMove:(x,y)=>controls.setTouchMove(x,y),setTouchLook:(x,y)=>controls.setTouchLook(x,y),setTouchSprint:value=>controls.setTouchSprint(value),requestLock:()=>controls.tryPointerLock(canvas),
    dispose(){disposed=true;renderer.setAnimationLoop(null);controls.detach();observer.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('wheel',onWheel);canvas.removeEventListener('touchstart',onTouchStart);canvas.removeEventListener('touchmove',onTouchMove);releasePointer();sound.dispose();world.dispose();character.dispose();renderer.dispose();},
  };
}

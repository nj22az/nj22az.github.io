// Original, exact-time choreography. The four saved panels remain the source of truth.
export const FPS=30,DURATION=20,BEATS=[0,3.2,10,13.2,20];
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,u)=>a+(b-a)*u;
export function frameAt(project,time,motions,envelopes={}){
 const t=Math.max(0,Math.min(DURATION-1/FPS,time));
 const beat=t<BEATS[1]?0:t<BEATS[2]?1:t<BEATS[3]?2:3,local=t-BEATS[beat];
 const scene=structuredClone(project.panelScenes[beat]),vy=scene.actors[0];scene.time=local;
 // Audio has subtitles below the image, leaving the original comic compositions unobstructed.
 for(const a of scene.actors){a.speech='';a.speechStyle='bubble';}scene.top='';scene.bottom='';
 const pulse=(start,d=.14)=>Math.max(0,1-Math.abs(local-start)/d);
 const face=(actor,pose,talk=0)=>{actor.take={format:'johansson-actor-take',version:1,name:'Classroom facial performance',duration:20,frames:[0,20].map(t=>({t,pose,expression:actor.expression,head:[.025*Math.sin(local*2),.04*Math.sin(local*1.3),.025*Math.sin(local*1.7)],look:[beat===0?.35*Math.sin(local):0,0],talk,blinkL:pulse(1.8),blinkR:pulse(1.8),brow:beat===1?.4:0,smile:0,strength:1}))};};
 const level=who=>envelopes[who]?.[Math.max(0,Math.floor(local*FPS))]||0;
 if(beat===0){face(vy,'SchoolRest');scene.camera.fov-=ease(local/3.2)*1.5;}
 if(beat===1){face(vy,'SchoolProtest',level('vy'));vy.bodyMotion=motions.protest;vy.motionTime=Math.min(6.8,local);scene.camera.fov-=ease(local/6.8)*2;}
 if(beat===2){
  scene.effect='escape';scene.exitLabel='LỐI RA';vy.pose='SchoolRun';vy.y=0;vy.bodyMotion=motions.run;vy.motionTime=Math.min(1.1,local*.5)%motions.run.times.at(-1);
  // Exit is ahead at x=.9..1.65, z=-.45. Start with a brief anticipation, then run towards it.
  const travel=ease((local-.35)/2.5);vy.x=mix(.14,.76,travel);vy.z=mix(-.05,-.32,travel);face(vy,'SchoolRun',local<.6?.9:0);
  if(local<.28)vy.propTouch={prop:'desk',side:'L'};
  const tumble=ease((local-.28)/.85);
  const end=project.panelScenes[2].furniture;
  for(const id of ['desk','chair']){
   const rest=id==='desk'?{position:[-.4,0,.25],rotation:[0,-Math.PI/2,0]}:{position:[-.4,0,-.11],rotation:[0,-Math.PI/2,0]};
   scene.furniture[id]={...end[id],size:id==='desk'?1:end[id].size,supportY:.16*Math.sin(Math.PI*tumble),position:rest.position.map((v,i)=>mix(v,end[id].position[i],tumble)),rotation:rest.rotation.map((v,i)=>mix(v,end[id].rotation[i],tumble))};
  }
  scene.camera.target[0]+=travel*.12;
 }
 if(beat===3){face(vy,'LiftedBack');face(scene.actors[1],'HoldBack',level('teacher'));scene.camera.fov-=ease(local/6.8)*1;}
 return {scene,beat,local};
}
export const subtitles=[
 {start:3.2,end:7.3,text:'Trời nắng đẹp thế này mà mình phải ngồi trong lớp sao?!'},
 {start:7.3,end:9.8,text:'Mình chỉ sống một lần thôi!!'},
 {start:10,end:10.7,text:'ÁÁÁÁÁÁÁ!'},
 {start:13.2,end:18.8,text:'Lần sau, em uống một ly nước và hít thở sâu hai lần nhé.'}
];

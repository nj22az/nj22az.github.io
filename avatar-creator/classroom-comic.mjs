// Four editable shots exercising props, linked acting, expressive poses and exact camera framing.
export function classroomComic(recipeFor){
 const actor=(id,name,pose,expression,x=0,z=-.11)=>({id,name,recipe:recipeFor(name),x,z,y:0,size:1,seat:'',turn:-10,pose,expression,speech:''});
 const shot=(actors,furniture={})=>({version:2,location:'classroom',format:'portrait',style:'comic',top:'',bottom:'',camera:{orbit:0,elevation:0,zoom:1,position:[1.4,1.65,3.2],target:[0,.95,.05],fov:43},actors,furniture});
 const a=actor('vy','Vy','SchoolRest','drowsy');a.seat='classroom-desk';
 const b=actor('vy','Vy','SchoolProtest','bawling');b.speech='THE SUN IS OUT! WHY AM I STILL IN HERE? I ONLY GET ONE LIFE!';
 const c=actor('vy','Vy','SchoolRun','bawling',.8,.0);c.y=.08;c.turn=65;c.speech='AAAAAAH!';
 const d=actor('vy','Vy','LiftedBack','embarrassed');d.liftedBy='teacher';
 const t=actor('teacher','Miss Higa','HoldBack','dry',.4,-.25);t.name='Mrs Kubo';t.recipe=structuredClone(t.recipe);t.recipe.name='Mrs Kubo';t.recipe.body.height=.98;t.recipe.body.build=.86;t.recipe.head.form='round';t.recipe.head.cheeks=.7;t.recipe.hair.style='bun';t.recipe.hair.colour='#6a6257';t.recipe.glasses.style='round';t.recipe.eyes.style='narrow';t.recipe.brows.style='thick';t.recipe.wrinkles=.65;t.recipe.outfit.topColour='#9a8054';t.recipe.outfit.bottomColour='#6d6554';t.size=1.2;t.turn=-12;t.speech='Next time, a glass of water and two deep breaths.';
 const third=shot([c],{desk:{position:[-.62,.55,.3],rotation:[0,-Math.PI/2,-1.95]},chair:{position:[-.5,.32,-.6],rotation:[1.4,-Math.PI/2,.3]}});third.camera.position=[0,1.7,3.4];third.camera.fov=54;third.camera.target=[.2,.95,.0];third.effect='dash';
 const fourth=shot([d,t],{desk:{visible:false},chair:{visible:false}});fourth.camera.position=[3.6,1.7,1.0];fourth.camera.target=[.05,1.08,0];fourth.camera.fov=47;
 const first=shot([a]);first.camera.position=[.25,1.3,2.3];first.camera.target=[0,1.05,-.02];first.camera.fov=37;
 const second=shot([b]);second.camera.position=[.22,1.45,2.2];second.camera.target=[0,1.10,-.02];second.camera.fov=42;
 return [first,second,third,fourth];
}

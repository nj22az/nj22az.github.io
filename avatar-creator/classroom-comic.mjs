// Four editable shots exercising props, linked acting, expressive poses and exact camera framing.
export function classroomComic(recipeFor){
 const actor=(id,name,pose,expression,x=0,z=-.11)=>({id,name,recipe:recipeFor(name),x,z,y:0,size:1,seat:'',turn:-10,pose,expression,speech:''});
 const shot=(actors,furniture={})=>({version:2,location:'classroom',format:'portrait',style:'comic',backdrop:'paper',top:'',bottom:'',camera:{orbit:0,elevation:0,zoom:1,position:[1.4,1.65,3.2],target:[0,.95,.05],fov:43},actors,furniture});
 const a=actor('vy','Vy','SchoolRest','drowsy');a.seat='classroom-desk';
 const b=actor('vy','Vy','SchoolProtest','raging');b.speechStyle='shout';b.speech='WHY AM I STUCK IN HERE WHEN THE SUN IS SHINING?! I ONLY GET ONE LIFE!!';
 const c=actor('vy','Vy','SchoolRun','scared',.8,.0);c.y=0;c.turn=120;c.speechStyle='shout';c.speech='AAAAAAH!';
 for(const v of [b,c]){v.recipe=structuredClone(v.recipe);v.recipe.mouth.size=1;v.recipe.mouth.width=1;}
 const d=actor('vy','Vy','LiftedBack','embarrassed');d.liftedBy='teacher';
 const t=actor('teacher','Miss Higa','HoldBack','dry',.4,-.25);t.name='Mrs Kubo';t.recipe=structuredClone(t.recipe);t.recipe.name='Mrs Kubo';t.recipe.body.height=.98;t.recipe.body.build=.86;t.recipe.head.form='round';t.recipe.head.cheeks=.7;t.recipe.hair.style='bun';t.recipe.hair.colour='#6a6257';t.recipe.glasses.style='round';t.recipe.eyes.style='narrow';t.recipe.brows.style='thick';t.recipe.wrinkles=.65;t.recipe.outfit.topColour='#9a8054';t.recipe.outfit.bottomColour='#6d6554';t.size=1.2;t.turn=-12;t.speechStyle='large';t.speech='Next time, a glass of water and two deep breaths.';
 const third=shot([c],{desk:{position:[-.62,.55,.3],rotation:[0,-Math.PI/2,-1.95]},chair:{position:[-.5,.32,-.6],rotation:[1.4,-Math.PI/2,.3]}});third.camera.position=[0,1.7,3.4];third.camera.fov=54;third.camera.target=[.2,1.3,.0];third.effect='dash';third.time=.3;
 const fourth=shot([d,t],{desk:{visible:false},chair:{visible:false}});fourth.camera.position=[3.5,1.8,3.1];fourth.camera.target=[.05,1.35,0];fourth.camera.fov=44;
 const first=shot([a]);first.camera.position=[1.5,1.3,2.05];first.camera.target=[0,1.05,-.02];first.camera.fov=37;
 const second=shot([b]);second.camera.position=[.1,1.55,2.7];second.camera.target=[0,1.35,-.02];second.camera.fov=45;
 return [first,second,third,fourth];
}

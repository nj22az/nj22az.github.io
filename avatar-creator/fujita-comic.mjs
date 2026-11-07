// Editable built-in comic; recipes always come from the shared cast.
export function fujitaComic(recipeFor){
 const actor=(id,name,x,z,pose,expression,turn,speech='')=>({id,name,recipe:recipeFor(name),x,z:z-1.45,y:0,size:1,seat:'',turn,pose,expression,speech,speechStyle:speech?'large':'bubble'});
 const shot=(actors,camera,bottom='')=>({version:2,location:'fujita-shed',format:'square',style:'comic',top:'',bottom,camera:{orbit:0,elevation:0,zoom:1,...camera},actors});
 const camera={position:[2.25,1.6,.6],target:[.3,.95,.45],fov:75};
 const j=actor('j','Johansson',0,0,'SitBeer','smile',0,'Fujita! Travel! Learn something! Live life to the full!');j.seat='table';j.heldItem='beer';
 const f=actor('f','Mr Fujita',.35,.8,'Sit','neutral',180);f.seat='fujita-armchair';
 const fb=actor('f','Mr Fujita',0,0,'SitDrink','neutral',180);fb.seat='window';fb.heldItem='beer';
 const s1=shot([j,fb],{position:[.2,1.6,2.4],target:[-2.15,1.22,2.4],fov:55});s1.location='minato';
 const f2=actor('f','Mr Fujita',.361,.039,'ResolveFist','excited',20,"You're right! I'm going to make every minute count!");
 const s2=shot([f2],{position:[-.2,.8,2.9],target:[-1.1,1.15,1.3],fov:50});s2.location='minato';
 const f3=structuredClone(f);f3.pose='SitDrink';f3.heldItem='beer';
 const s3=shot([f3],{position:[2.2,1.35,.55],target:[.15,.85,-.15],fov:75},'TV: “...and after the break, our samurai marathon continues!”');
 return [s1,s2,s3];
}

/** Physical upper floor of Sakura. Metres, in the street's coordinate system. */
export const SAKURA_UPSTAIRS=Object.freeze({
 floor:4.03,roof:4.01,top:6.73,
 minX:-18.3,maxX:-8.8,minZ:-33.93,maxZ:-20.67,
 stairX:-19.25,stairWidth:1.6,from:-36.6,to:-30.4,steps:24,
 landingEnd:-28.8,doorZ:-29.65,doorWidth:1.8,terraceX:-7.65,
});
const U=SAKURA_UPSTAIRS;
/** Continuous support through the treads; accepts only reachable height, never lifts
 * a pedestrian underneath the landing or through the shop's ceiling. */
export function sakuraUpperFloor(x,z,feetY){
 let y=null;
 if(Math.abs(x-U.stairX)<=U.stairWidth/2&&z>=U.from&&z<=U.to)y=U.floor*(z-U.from)/(U.to-U.from);
 else if(x>=U.stairX-U.stairWidth/2&&x<=U.minX+.15&&z>=U.to&&z<=U.landingEnd)y=U.floor;
 else if(x>=U.minX&&x<=U.terraceX&&z>=U.minZ&&z<=U.maxZ)y=U.floor;
 return y!==null&&Math.abs(y-feetY)<.45?y:null;
}
export function overlapsHeight(c,y,height=1.82){
 const bottom=c.minY??0,top=Number.isFinite(c.height)?bottom+c.height:Infinity;
 return bottom<y+height&&top>y+.06;
}

/** All furniture and rails use the district's merged material buckets. */
export function buildSakuraUpstairs(kit,solid,{inspect=()=>{}}={}){
 const wall=0xe7dcc2,steel=0x58686b,wood=0xbda27c;
 const box=(id,x,z,w,d,h,base=U.floor,colour=wall)=>{
  kit.box(w,h,d,x,base+h/2,z,colour);solid({id:'sakura-upper-'+id,x,z,w,d,minY:base,height:h});
 };
 const table=(id,x,z,w,d,h)=>{
  solid({id:'sakura-upper-'+id,x,z,w,d,minY:U.floor,height:h});
  kit.box(w,.06,d,x,U.floor+h-.03,z,wood);
  for(const dx of [-w/2+.08,w/2-.08])for(const dz of [-d/2+.08,d/2-.08])kit.box(.06,h-.06,.06,x+dx,U.floor+(h-.06)/2,z+dz,wood);
 };
 // Hollow plaster shell with a genuine opening at the rear landing.
 kit.block(U.minX,U.maxX,U.roof,U.floor,U.minZ,U.maxZ,wood);
 kit.block(U.minX-.1,U.maxX+.1,U.top,U.top+.16,U.minZ-.1,U.maxZ+.1,wall,'plaster');
 const west=(a,b)=>box('rear-wall',U.minX,(a+b)/2,.16,b-a,2.7);
 west(U.minZ,U.doorZ-U.doorWidth/2);west(U.doorZ+U.doorWidth/2,U.maxZ);
 box('door-lintel',U.minX,U.doorZ,.16,U.doorWidth,.5,U.floor+2.2);
 for(const z of [U.minZ,U.maxZ])box('end-wall',(U.minX+U.maxX)/2,z,U.maxX-U.minX,.16,2.7);
 // Terrace doorway at the centre, windows and frames remain on the exterior.
 box('front-wall',U.maxX,(U.minZ-28.2)/2,.16,-28.2-U.minZ,2.7);
 box('front-wall',U.maxX,(-26.4+U.maxZ)/2,.16,U.maxZ+26.4,2.7);
 box('front-lintel',U.maxX,-27.3,.16,1.8,.5,U.floor+2.2);
 // A supported steel stair: closed risers, two stringers and aligned handrails.
 const run=(U.to-U.from)/U.steps,rise=U.floor/U.steps,left=U.stairX-U.stairWidth/2,right=U.stairX+U.stairWidth/2;
 for(let i=0;i<U.steps;i++){
  const y=rise*(i+.5),z=U.from+run*(i+.5);
  kit.box(U.stairWidth,.06,run+.02,U.stairX,y-.03,z,steel,{finish:'matte'});
  kit.box(U.stairWidth,rise,.035,U.stairX,y-rise/2,z-run/2,steel,{finish:'matte'});
 }
 for(const x of [left,right]){
  kit.rod([x,.02,U.from],[x,U.floor-.05,U.to],.065,steel,{finish:'matte'});
  kit.rod([x,1,U.from],[x,U.floor+1,U.to],.035,steel,{finish:'matte'});
  kit.rod([x,.55,U.from],[x,U.floor+.55,U.to],.025,steel,{finish:'matte'});
  for(let i=0;i<=U.steps;i+=4){const z=U.from+run*i,y=rise*i;kit.rod([x,y,z],[x,y+1,z],.025,steel,{finish:'matte'});}
  // Narrow plan colliders keep the player on the stair at every elevation.
  solid({id:'sakura-stair-rail',x,z:(U.from+U.to)/2,w:.06,d:U.to-U.from,minY:0,height:U.floor+1});
 }
 kit.block(left,U.minX+.1,U.floor-.12,U.floor,U.to,U.landingEnd,steel,'matte');
 for(const z of [U.to,U.landingEnd]){
  kit.box(.1,U.floor,.1,left+.1,U.floor/2,z,steel,{finish:'matte'});
  kit.rod([left+.1,.15,z],[U.minX-.1,U.floor-.15,z],.035,steel,{finish:'matte'});
 }
 // Slim bars instead of a solid visual wall; matching collision envelopes.
 const guard=(id,a,b)=>{
  kit.rod([a[0],U.floor+1,a[1]],[b[0],U.floor+1,b[1]],.03,steel,{finish:'matte'});
  kit.rod([a[0],U.floor+.5,a[1]],[b[0],U.floor+.5,b[1]],.02,steel,{finish:'matte'});
  const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.65);
  for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;kit.rod([x,U.floor,z],[x,U.floor+1,z],.02,steel,{finish:'matte'});}
  solid({id,x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,w:Math.max(.05,Math.abs(b[0]-a[0])),d:Math.max(.05,Math.abs(b[1]-a[1])),minY:U.floor,height:1});
 };
 guard('sakura-landing-rail',[left,U.to],[left,U.landingEnd]);
 guard('sakura-landing-end',[left,U.landingEnd],[U.minX,U.landingEnd]);
 guard('sakura-terrace-front',[U.terraceX,U.minZ],[U.terraceX,U.maxZ]);
 for(const z of [U.minZ,U.maxZ])guard('sakura-terrace-end',[U.maxX,z],[U.terraceX,z]);
 // Rear threshold, timber jambs, porch canopy and a warm lamp.
 for(const z of [U.doorZ-.9,U.doorZ+.9])kit.box(.22,2.2,.07,U.minX-.02,U.floor+1.1,z,wood);
 kit.box(.24,.08,1.87,U.minX-.02,U.floor+2.2,U.doorZ,wood);
 kit.box(1.5,.12,2.15,U.minX-.65,U.floor+2.45,U.doorZ,0xa56b57);
 kit.box(.14,.25,.18,U.minX-.15,U.floor+1.9,U.doorZ+1.15,0xffdf9d,{finish:'glow'});
 // Genkan and a clear central passage. Bed/wardrobe at the quiet north end;
 // kitchen, dining table and sewing desk along the opposite walls.
 // Timber boards and woven rugs give the floor a domestic scale.
 for(let x=U.minX+.3;x<U.maxX;x+=.55)kit.box(.008,.004,U.maxZ-U.minZ-.3,x,U.floor+.003,(U.minZ+U.maxZ)/2,0xa99070);
 kit.box(1.3,.015,1.6,U.minX+.8,U.floor+.015,U.doorZ,0x858b7d);
 kit.box(3.8,.014,3.7,-15.4,U.floor+.016,-22.5,0xaab38b);
 for(let z=-24.2;z<-20.8;z+=.35)kit.box(3.7,.005,.009,-15.4,U.floor+.024,z,0x929d77);
 kit.box(3.4,.014,2.6,-11.9,U.floor+.016,-26,0xc6a17c);
 // Bedroom screen and shelving, with a wide opening beside the terrace route.
 box('bedroom-screen',-16.05,-24.65,3.5,.1,2.2,U.floor,0xd6c8a8);
 for(const x of [-17.7,-16.9,-16.1,-15.3,-14.4])kit.box(.035,2.2,.13,x,U.floor+1.1,-24.65,wood);
 for(const y of [.7,1.4,2.1])kit.box(3.5,.035,.13,-16.05,U.floor+y,-24.65,wood);
 box('sofa',-10.5,-25.1,2,.8,.45,U.floor,0x778e81);
 kit.box(2,.55,.13,-10.5,U.floor+.65,-24.75,0x778e81);
 for(const x of [-11.45,-9.55])kit.box(.12,.35,.75,x,U.floor+.58,-25.1,0x667c70);
 table('coffee-table',-10.5,-26.2,1.25,.5,.38);
 kit.box(.28,.025,.2,-10.6,U.floor+.4,-26.2,0xf2e7d2);
 // Interior window recesses and gathered curtains match the exterior apertures.
 for(const [x,z,w] of [[U.minX+.09,-26,1.6],[U.minX+.09,-22.6,1.2],[U.maxX-.09,-31.4,1.9],[U.maxX-.09,-23.2,1.9]]){
  kit.box(.025,1,w,x,U.floor+1.45,z,0xffdcab,{finish:'glow'});
  kit.box(.05,.05,w+.12,x,U.floor+.92,z,wood);
  kit.box(.05,.05,w+.12,x,U.floor+1.98,z,wood);
  for(const side of [-1,1]){
   kit.box(.06,1.08,.25,x+(x<-15?.02:-.02),U.floor+1.45,z+side*(w/2-.08),0xe0aab0);
   for(let k=0;k<3;k++)kit.box(.02,1.08,.018,x+(x<-15?.055:-.055),U.floor+1.45,z+side*(w/2-.08)+k*.07-.07,0xc99199);
  }
 }
 kit.box(.04,.75,.6,-17.99,U.floor+1.6,-28.4,0x8a785d);
 kit.box(.055,.62,.48,-17.96,U.floor+1.6,-28.4,0xd8e5cc);

 box('shoe-cabinet',-17.7,-31,.7,.45,.8,U.floor,wood);
 box('kitchen',-12.5,-33.4,3.4,.7,.86,U.floor,0xdedbd1);
 kit.box(3.5,.07,.76,-12.5,U.floor+.9,-33.4,0x727d7b);
 kit.box(.8,.025,.5,-12.6,U.floor+.95,-33.4,0x9ca7a7);for(const x of [-11.6,-11.2])kit.cyl(.13,.13,.025,x,U.floor+.96,-33.4,0x363b3b);
 kit.rod([-12.7,U.floor+.95,-33.65],[-12.7,U.floor+1.2,-33.65],.025,steel);
 box('fridge',-9.6,-33.1,.7,.8,1.65,U.floor,0xece7d8);
 table('table',-12.4,-30.5,1.4,1.0,.73);
 for(const x of [-13.5,-11.3]){table('chair',x,-30.5,.45,.48,.46);kit.box(.06,.45,.48,x+(x<-12.4?-.2:.2),U.floor+.7,-30.5,wood);}
 table('sewing-desk',-17.7,-26.4,.8,1.6,.76);
 kit.box(.36,.24,.48,-17.7,U.floor+.9,-26.4,0xece7dc);kit.box(.45,.03,.6,-17.7,U.floor+.8,-26.4,0xe19b9c);
 box('sewing-stool',-16.7,-26.4,.45,.45,.45,U.floor,wood);
 box('bed',-15.4,-22.3,2.1,2.7,.45,U.floor,wood);
 kit.box(2,.12,2.5,-15.4,U.floor+.51,-22.3,0xdca4aa);
 kit.box(.9,.16,.5,-15.4,U.floor+.65,-21.5,0xf1e6d5);
 box('wardrobe',-17.5,-22,.8,1.8,1.9,U.floor,wood);
 box('bedside',-13.8,-21.8,.45,.55,.5,U.floor,wood);
 kit.box(.22,.03,.3,-13.8,U.floor+.52,-21.8,0x657c65);
 inspect(-16.8,U.floor+1,-29.65,'Look around Thuan’s upstairs home','Thuan’s home above Sakura','Shoes stay by the door. A sewing machine faces the yard, the kettle waits beside the sink, and a pink quilt covers the bed at the quiet end of the flat. The terrace looks down on the shopfront.');
 inspect(-16.4,U.floor+1,-26.4,'Examine Thuan’s sewing desk','The sewing desk','Cloth folded by colour, a shirt waiting for its final seam, and a small machine kept clean after every use.');
 return U;
}

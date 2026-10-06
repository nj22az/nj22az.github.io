import {FURNITURE_HEIGHTS} from '../furniture-standards.js';
import {addOwnedCharacter} from '../../people/owned-characters.js';
import {addSakuraFlyer} from '../sakura-flyers.js';
import * as THREE from '../../../vendor/three.module.js';
import {createShopProduct} from '../../commerce/shop-product.js';
import {buildSakuraBackroom} from './sakura-backroom.js';
import {buildSakuraRestroom} from './sakura-restroom.js';

/**
 * The things that make Sakura somebody's shop rather than a set.
 *
 * - Jaga-bō, KOGANE crisps' mascot: a lumpy potato with one big googly eye, one small
 *   one, a crooked grin and a single tooth, on a plinth by the door with a bag of crisps.
 *   He bobs, his pupils rattle, and you can pat him.
 * - On the shop floor: the "assistant manager" (Thuan's plant by the door, with its name
 *   tag), an umbrella stand, a beckoning cat and a charity box on the counter.
 * - In the office: a cork board of photos and notes, a mini fridge with a little CRT and
 *   games console on top, fairy lights, a cat clock, a rug, a plush Jaga-bō and manga.
 * - In the storage room: cardboard stand-ups from old campaigns leaning on the back wall
 *   either side of the delivery door (x 2.86..4.4, kept clear),
 *   a hand truck, a mop and bucket, stacked crates and a step ladder. The stocked rack,
 *   noticeboard, exit sign and delivery pieces are in sakura-backroom.js.
 *
 * All plain geometry and small canvas prints. Positions are in the shop's own frame
 * (sakura-layout.js): shop floor z -3.99..3.88, back room behind it, office to the east.
 */
const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';
// Older Safari has no roundRect; a plain rectangle is a fine stand-in there.
const ensureRoundRect=ctx=>{if(ctx&&!ctx.roundRect)ctx.roundRect=(x,y,w,h)=>ctx.rect(x,y,w,h);return ctx;};
const canvasTex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(ensureRoundRect(c.getContext('2d')),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;};
const text=(ctx,s,x,y,size,colour,align='center')=>{ctx.fillStyle=colour;ctx.font=`bold ${size}px ${MARU}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);};
const std=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,...extra});
const hash=(i,s=0)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};

function kit(parent,name){
 const group=new THREE.Group();group.name=name;parent.add(group);
 const mesh=(geometry,material,x,y,z,label=name)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=label;group.add(m);return m;};
 const box=(w,h,d,x,y,z,color,label)=>mesh(new THREE.BoxGeometry(w,h,d),typeof color==='number'?std(color):color,x,y,z,label);
 const print=(tex,w,h,x,y,z,yaw=0,label=name+' print')=>{const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.9,side:THREE.DoubleSide,transparent:true,alphaTest:.05}),x,y,z,label);m.rotation.y=yaw;return m;};
 return {group,mesh,box,print};
}

/** Jaga-bō, drawn flat: for the stand-ups, the office board and his speech card. */
export function drawJagabo(ctx,cx,cy,s){
 ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);
 ctx.fillStyle='#e8b95c';ctx.strokeStyle='#6b4a1c';ctx.lineWidth=6;
 ctx.beginPath();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,r=1+.07*Math.sin(a*5)+.04*Math.cos(a*3);ctx.lineTo(Math.cos(a)*90*r,Math.sin(a)*110*r);}ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#c8913f';for(const [x,y,r] of [[-50,40,8],[40,70,6],[55,-60,7],[-30,-80,5]]){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(-30,-25,30,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(35,-15,18,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#222';ctx.beginPath();ctx.arc(-18,-15,12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(30,-22,8,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#6b2a1c';ctx.lineWidth=6;ctx.beginPath();ctx.arc(5,25,40,.15*Math.PI,.85*Math.PI);ctx.stroke();
 ctx.fillStyle='#fff';ctx.fillRect(0,58,14,14);ctx.strokeRect(0,58,14,14);
 ctx.fillStyle='#f07a8a';ctx.beginPath();ctx.ellipse(-12,66,10,7,0,0,Math.PI);ctx.fill();
 ctx.restore();
}

// ============================================================ Jaga-bō, in the round
// By the west window between the magazine rack and the assistant manager: he stood at
// (2.25, 3.05), square in the walk from the door to the till.
export const MASCOT=Object.freeze({x:-2.45,z:3.16,r:.36});
function buildMascot(parent,anchor,action){
 const {group,mesh,box}=kit(parent,'Jaga-bo mascot');
 group.position.set(MASCOT.x,0,MASCOT.z);group.rotation.y=Math.PI*.92;
 // Plinth: a pink drum with the brand on it.
 mesh(new THREE.CylinderGeometry(.34,.38,.22,24),std(0xf06b9a),0,.11,0,'Jaga-bo plinth');
 mesh(new THREE.CylinderGeometry(.36,.36,.03,24),std(0xffffff),0,.235,0,'Jaga-bo plinth rim');
 const body=new THREE.Group();body.position.y=.25;group.add(body);
 // The potato: a lumpy egg, knobbly in a fixed, friendly way.
 const g=new THREE.SphereGeometry(.3,32,24),p=g.attributes.position,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();const lump=1+.06*Math.sin(v.x*7+1)*Math.cos(v.y*5)+.04*Math.sin(v.z*9+v.y*3);v.multiplyScalar(.3*lump);p.setXYZ(i,v.x*1.0,v.y*1.25,v.z*.9);}
 g.computeVertexNormals();
 const potato=new THREE.Mesh(g,std(0xe8b95c,{roughness:.85}));potato.position.y=.4;potato.name='Jaga-bo body';body.add(potato);
 for(const [x,y,z,r] of [[.17,.55,.19,.03],[-.2,.28,.17,.025],[.1,.18,.24,.02],[-.12,.62,.2,.018]]){const s=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),std(0xb9853a));s.position.set(x,y,z);s.scale.z=.35;s.lookAt(x*3,y,z*3);body.add(s);}
 // Googly eyes, mismatched, each pupil loose inside its eye.
 const eyes=[];
 for(const [x,y,r] of [[-.1,.55,.085],[.1,.6,.055]]){
  const white=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),std(0xffffff,{roughness:.3}));white.position.set(x,y,.24);white.scale.z=.55;body.add(white);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(r*.45,12,8),std(0x111111,{roughness:.2}));pupil.position.set(x,y,.24+r*.5);pupil.scale.z=.4;body.add(pupil);
  eyes.push({pupil,x,y,r,phase:x*10});
 }
 // A crooked grin, one tooth, a bit of tongue.
 const grin=new THREE.Mesh(new THREE.TorusGeometry(.09,.012,6,20,Math.PI*.75),std(0x6b2a1c));grin.position.set(.01,.42,.265);grin.rotation.set(0,0,Math.PI*1.12);body.add(grin);
 const tooth=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.012),std(0xffffff));tooth.position.set(.02,.345,.275);tooth.rotation.z=.15;body.add(tooth);
 const tongue=new THREE.Mesh(new THREE.SphereGeometry(.028,10,6),std(0xf07a8a));tongue.position.set(-.035,.35,.265);tongue.scale.set(1.2,.7,.5);body.add(tongue);
 // A single crisp for a hat, jauntily.
 const crisp=new THREE.Mesh(new THREE.SphereGeometry(.09,16,8,0,Math.PI*2,0,Math.PI*.35),std(0xf2cf6b,{side:THREE.DoubleSide}));crisp.position.set(.05,.8,0);crisp.rotation.set(.3,0,-.4);body.add(crisp);
 // Stubby arms; the right one holds up a bag of KOGANE.
 const arm=std(0xd9a24e);
 const left=new THREE.Mesh(new THREE.CapsuleGeometry(.03,.16,4,8),arm);left.position.set(-.3,.4,.05);left.rotation.z=-1.1;body.add(left);
 const right=new THREE.Mesh(new THREE.CapsuleGeometry(.03,.16,4,8),arm);right.position.set(.29,.5,.08);right.rotation.z=.5;body.add(right);
 const bag=createShopProduct('chips');bag.scale.setScalar(1.3);bag.position.set(.36,.52,.12);bag.rotation.set(0,-.4,-.25);body.add(bag);
 // Red trainers.
 for(const s of [-1,1]){const shoe=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),std(0xd7263d));shoe.position.set(s*.1,.03,.05);shoe.scale.set(1,.55,1.5);body.add(shoe);}
 // His speech card, on a stick in the plinth.
 const card=canvasTex(512,320,(ctx,w,h)=>{ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(8,8,w-16,h-60,40);ctx.fill();ctx.beginPath();ctx.moveTo(90,h-54);ctx.lineTo(70,h-8);ctx.lineTo(150,h-54);ctx.fill();ctx.strokeStyle='#f06b9a';ctx.lineWidth=10;ctx.beginPath();ctx.roundRect(8,8,w-16,h-60,40);ctx.stroke();
  text(ctx,"Quickly Happiness!",w/2,70,48,'#d7263d');text(ctx,"KOGANE Potato",w/2,140,56,'#6b4a1c');text(ctx,"Usushio ¥100",w/2,210,40,'#f06b9a');});
 const stick=mesh(new THREE.CylinderGeometry(.008,.008,1.1,6),std(0x888888),-.3,.75,-.05,'Jaga-bo card stick');
 const sign=mesh(new THREE.PlaneGeometry(.5,.31),new THREE.MeshBasicMaterial({map:card,transparent:true,side:THREE.DoubleSide,toneMapped:false}),-.3,1.4,-.04,'Jaga-bo speech card');
 void stick;void sign;void box;
 anchor([MASCOT.x,1.0,MASCOT.z],'Pat Jaga-bō, the KOGANE mascot',()=>action('inspect',"Jagabo · Jaga-bō",
  'KOGANE crisps’ mascot, on loan from the rep who delivers the crisps. One eye is bigger than the other; the rep swears it was designed that way.\n\nYou pat his head. His pupils rattle round and settle looking in two different directions. Thuan, from the till: "Be gentle. He is the only one here who works harder than the assistant manager."'));
 let wobble=0;
 return {
  pat(){wobble=1;},
  tick(time,dt=.016){
   wobble=Math.max(0,wobble-dt*.8);
   body.position.y=.25+Math.abs(Math.sin(time*2.2))*.025;
   body.rotation.z=Math.sin(time*1.7)*.05+Math.sin(time*18)*.08*wobble;
   for(const e of eyes){e.pupil.position.x=e.x+Math.sin(time*3.1+e.phase)*e.r*.3;e.pupil.position.y=e.y+Math.cos(time*2.3+e.phase*2)*e.r*.25;}
  },
 };
}

// ================================================================ the shop floor
// Kept inside the glass (local z 3.61 is the window): it used to push its leaves out
// through the pane onto the street.
export const PLANT=Object.freeze({x:-1.35,z:3.18});
function buildShopFloor(parent,anchor,action){
 const {group,mesh,box,print}=kit(parent,'Sakura lived-in');
 // The assistant manager: a rubber plant (Ficus elastica) in a glazed pot on a saucer.
 // Three stems of different heights, each with broad glossy leaves set alternately up
 // it, held out and up the way a healthy one holds them, older leaves lower and wider.
 const pot=std(0x2a6fb0,{roughness:.22,metalness:.05});
 mesh(new THREE.CylinderGeometry(.24,.2,.04,24),std(0x1f5a92,{roughness:.3}),PLANT.x,.02,PLANT.z,'Assistant manager saucer');
 mesh(new THREE.CylinderGeometry(.2,.15,.36,24),pot,PLANT.x,.22,PLANT.z,'Assistant manager pot');
 mesh(new THREE.TorusGeometry(.2,.02,8,24),pot,PLANT.x,.4,PLANT.z,'Assistant manager pot rim').rotation.x=Math.PI/2;
 mesh(new THREE.CylinderGeometry(.19,.19,.02,20),std(0x4a3220,{roughness:1}),PLANT.x,.38,PLANT.z,'Assistant manager soil');
 {
  const outline=new THREE.Shape();outline.moveTo(0,0);outline.bezierCurveTo(.07,.04,.075,.2,0,.27);outline.bezierCurveTo(-.075,.2,-.07,.04,0,0);
  const leafGeometry=new THREE.ShapeGeometry(outline,10);leafGeometry.rotateX(-Math.PI/2);
  const leafMat=std(0x2c6a36,{roughness:.28,side:THREE.DoubleSide}),young=std(0x4f9a4a,{roughness:.3,side:THREE.DoubleSide});
  const rib=std(0x9fc77a,{roughness:.5}),sheath=std(0xb8434a,{roughness:.5}),stemMat=std(0x5b6b3a);
  for(const [sx,sz,height,turn] of [[.03,.02,1.12,0],[-.07,.05,.86,1.3],[.06,-.06,.68,2.6]]){
   const x0=PLANT.x+sx,z0=PLANT.z+sz;
   mesh(new THREE.CylinderGeometry(.012,.018,height-.38,6),stemMat,x0,.38+(height-.38)/2,z0,'Assistant manager stem');
   const count=Math.round((height-.5)/.09);
   for(let i=0;i<count;i++){
    const t=i/(count-1||1),y=.5+(height-.5)*t,a=turn+i*2.4,size=1.25-t*.45;
    const pivot=new THREE.Group();pivot.position.set(x0,y,z0);pivot.rotation.y=a;group.add(pivot);
    const leaf=new THREE.Mesh(leafGeometry,i===count-1?young:leafMat);leaf.name='Assistant manager leaf';leaf.scale.setScalar(size);leaf.rotation.x=.25+t*.55;pivot.add(leaf);
    const vein=new THREE.Mesh(new THREE.BoxGeometry(.006,.004,.25*size),rib);vein.position.set(0,.003,-.125*size);leaf.add(vein);
   }
   // The new leaf comes wrapped in a red sheath at the top of the stem.
   const bud=mesh(new THREE.ConeGeometry(.014,.08,6),sheath,x0,height+.04,z0,'Assistant manager sheath');bud.rotation.z=.15;
  }
 }
 const tag=canvasTex(256,128,(ctx,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#d7263d';ctx.lineWidth=8;ctx.strokeRect(4,4,w-8,h-8);text(ctx,"Assistant Manager",w/2,h*.42,50,'#3b3f55');text(ctx,'ASST. MANAGER',w/2,h*.8,20,'#d7263d');});
 print(tag,.16,.08,PLANT.x,.28,PLANT.z+.155,0,'Assistant manager name tag');
 anchor([PLANT.x,.9,PLANT.z],'Say hello to the assistant manager',()=>action('inspect',"Assistant Manager · The assistant manager",
  'Thuan’s rubber plant, promoted for loyalty. Its name tag was laminated at the post office. It has never once counted the change correctly, but it has also never been late.'));
 // Umbrella stand by the door: a stainless rack with a ring for each umbrella and a drip
 // tray, the kind every shop put out in the rainy season. Three umbrellas were left in
 // it: a red one, a navy one, and the clear vinyl ¥500 one everybody owns.
 const U={x:1.2,z:3.22};
 {
  const steel=std(0xc9ced2,{metalness:.6,roughness:.3}),tray=std(0x8a9396,{metalness:.5,roughness:.4});
  mesh(new THREE.BoxGeometry(.52,.04,.24),tray,U.x,.02,U.z,'Umbrella stand tray');
  for(const sx of [-1,1])for(const sz of [-1,1])mesh(new THREE.CylinderGeometry(.01,.01,.52,6),steel,U.x+sx*.24,.28,U.z+sz*.1,'Umbrella stand post');
  for(const y of [.3,.52])for(const sz of [-1,1])mesh(new THREE.BoxGeometry(.5,.015,.015),steel,U.x,y,U.z+sz*.1,'Umbrella stand rail');
  for(let i=0;i<4;i++){const ring=mesh(new THREE.TorusGeometry(.045,.007,6,16),steel,U.x-.18+i*.12,.52,U.z,'Umbrella stand ring');ring.rotation.x=Math.PI/2;}
  const umbrella=(colour,i,lean,clear=false)=>{
   const g=new THREE.Group();g.position.set(U.x-.18+i*.12,.06,U.z);g.rotation.set(lean,0,lean*.6);g.name='Umbrella';group.add(g);
   const cloth=clear?std(0xeef4f6,{transparent:true,opacity:.55,roughness:.15}):std(colour,{roughness:.55});
   // The furled canopy: eight folds round the shaft, widest under the runner.
   const canopy=new THREE.Mesh(new THREE.CylinderGeometry(.035,.012,.6,8,1),cloth);canopy.position.y=.36;g.add(canopy);
   const strap=new THREE.Mesh(new THREE.CylinderGeometry(.037,.037,.03,8),clear?std(0xd8e2e6):std(new THREE.Color(colour).multiplyScalar(.7).getHex()));strap.position.y=.48;g.add(strap);
   const tip=new THREE.Mesh(new THREE.CylinderGeometry(.006,.004,.06,6),std(0x9aa1a4,{metalness:.5}));tip.position.y=.03;g.add(tip);
   const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.24,6),std(0x9aa1a4,{metalness:.5}));shaft.position.y=.78;g.add(shaft);
   const handle=new THREE.Mesh(new THREE.TorusGeometry(.04,.011,8,14,Math.PI),std(clear?0xe8e2d6:0x3a2a1e,{roughness:.4}));handle.position.set(.04,.9,0);handle.rotation.z=Math.PI;g.add(handle);
   const grip=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.09,8),handle.material);grip.position.y=.86;g.add(grip);
  };
  umbrella(0xd7263d,0,.05);umbrella(0x27304d,1,-.04);umbrella(0xffffff,3,.06,true);
 }
 // On the counter, Thuan's side: a beckoning cat and a charity box.
 // At the south end beyond the oden pot, clear of the clerk and customer sightline.
 const cat=addOwnedCharacter({parent:group,kind:'Maneki_neko_Colorful',height:.23,position:[4.84,FURNITURE_HEIGHTS.serviceCounter,3.66],yaw:-Math.PI/2});
 anchor([4.4,FURNITURE_HEIGHTS.serviceCounter+.2,3.66],'Look at Thuan’s lucky cat',()=>action('inspect','Maneki-neko · Lucky cat','Thuan keeps her colourful lucky cat beside the till. It welcomes every customer, from the first newspaper buyer to the last harbour worker of the evening.'));
 box(.1,.14,.08,4.9,FURNITURE_HEIGHTS.serviceCounter+.07,.2,0xffffff,'Charity box');
 const charity=canvasTex(256,256,(ctx,w,h)=>{ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#7ccc4a';ctx.fillRect(0,0,w,70);text(ctx,"Donation box",w/2,36,44,'#ffffff');text(ctx,"Thank you",w/2,130,30,'#3b3f55');ctx.fillStyle='#3b3f55';ctx.fillRect(80,190,96,10);});
 print(charity,.075,.075,4.849,FURNITURE_HEIGHTS.serviceCounter+.08,.2,-Math.PI/2,'Charity box label');
 return {ready:cat.ready,tick(){},dispose:()=>cat.dispose()};
}


// ================================================================ the office door
/**
 * A panelled door in the office doorway (x 5.16..6.26, z -1.17). It is hinged on the
 * west jamb and swings into the office, flat against nothing, when Thuan or anyone
 * else comes within reach, and closes behind them. It has no collider: it is always
 * open by the time you get to it, so nobody is ever shut in or out.
 */
export const OFFICE_DOOR=Object.freeze({hingeX:5.16,z:-1.17,width:1.1,height:2.14,reach:1.35,openAngle:1.45});
function buildOfficeDoor(parent){
 const D=OFFICE_DOOR,pivot=new THREE.Group();pivot.name='Sakura office door';pivot.position.set(D.hingeX,0,D.z);parent.add(pivot);
 const leafMat=std(0xd8c7a2,{roughness:.62}),panelMat=std(0xcbb88f,{roughness:.66}),metal=std(0xb8b2a4,{metalness:.6,roughness:.3});
 const part=(w,h,d,x,y,z,m,label)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=label;pivot.add(o);return o;};
 const W=D.width,H=D.height;
 part(W,H,.04,W/2,H/2,0,leafMat,'Sakura office door leaf');
 // Two raised panels and a kick plate on each face, a lever handle on both sides.
 for(const s of [-1,1]){
  for(const [y,h] of [[1.52,.9],[.62,.72]])part(W-.26,h,.012,W/2,y,s*.024,panelMat,'Sakura office door panel');
  part(W-.08,.16,.006,W/2,.1,s*.023,metal,'Sakura office door kick plate');
  part(.04,.04,.05,W-.1,1.0,s*.04,metal,'Sakura office door handle');part(.14,.025,.025,W-.16,1.0,s*.065,metal,'Sakura office door handle');
 }
 let angle=0;
 return {pivot,get angle(){return angle;},
  /** points: [x,z] pairs in the shop's frame; dt in seconds. */
  update(dt,points=[]){
   const cx=D.hingeX+W/2,near=points.some(p=>p&&Math.hypot(p[0]-cx,p[1]-D.z)<D.reach);
   const target=near?D.openAngle:0,step=Math.min(1,dt*(near?6:3.5));
   angle+=(target-angle)*step;if(Math.abs(target-angle)<.002)angle=target;
   pivot.rotation.y=angle;
  }};
}

// ================================================================== the office
function buildOfficeFun(parent){
 const {group,mesh,box,print}=kit(parent,'Sakura office life');
 // Cork board on the west wall (x 4.66), facing the desk.
 const board=canvasTex(768,512,(ctx,w,h)=>{
  ctx.fillStyle='#b98a55';ctx.fillRect(0,0,w,h);for(let i=0;i<2400;i++){ctx.fillStyle=`rgba(${hash(i)>.5?90:230},${hash(i)>.5?60:200},40,.18)`;ctx.fillRect(hash(i,1)*w,hash(i,2)*h,2,2);}
  ctx.strokeStyle='#7a5530';ctx.lineWidth=18;ctx.strokeRect(0,0,w,h);
  const photo=(x,y,r,draw,caption)=>{ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.fillStyle='#ffffff';ctx.fillRect(-70,-80,140,170);draw(-60,-70,120,120);text(ctx,caption,0,72,18,'#3b3f55');ctx.fillStyle='#d7263d';ctx.beginPath();ctx.arc(0,-76,7,0,Math.PI*2);ctx.fill();ctx.restore();};
  photo(110,130,-.12,(x,y,w,h)=>{ctx.fillStyle='#86cff2';ctx.fillRect(x,y,w,h);ctx.fillStyle='#ffe28a';ctx.beginPath();ctx.arc(x+95,y+25,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a8fcc';ctx.fillRect(x,y+80,w,40);ctx.fillStyle='#1c1714';ctx.beginPath();ctx.arc(x+45,y+62,14,0,Math.PI*2);ctx.arc(x+78,y+62,14,0,Math.PI*2);ctx.fill();},"Thao & me · Minato");
  photo(290,120,.08,(x,y,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(x,y,w,h);drawJagabo(ctx,x+60,y+64,.45);},"Jagabo!!");
  photo(470,150,-.05,(x,y,w,h)=>{ctx.fillStyle='#7ccc4a';ctx.fillRect(x,y,w,h);ctx.fillStyle='#3f8f46';for(let i=0;i<6;i++){ctx.beginPath();ctx.ellipse(x+60+Math.cos(i)*25,y+50+Math.sin(i)*20,18,8,i,0,Math.PI*2);ctx.fill();}},"Assistant Manager 1st day");
  for(const [x,y,r,c,t] of [[640,110,.1,'#ffe28a',"Milk Order!"],[620,260,-.08,'#ff9dc6',"Battery ×12"],[150,360,.06,'#a6e57c','Thao B-day 9/13'],[340,380,-.1,'#9fd6f0',"Taking out the garbage Tuesday/Friday"],[540,390,.12,'#ffe28a',"Good luck!"]]){
   ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.fillStyle=c;ctx.fillRect(-70,-50,140,100);text(ctx,t,0,0,t.length>6?20:26,'#3b3f55');ctx.restore();}
 });
 print(board,.9,.6,4.68,1.5,-2.55,Math.PI/2,'Office cork board');
 // Mini fridge in the corner, with magnets, and a tiny CRT and games console on top.
 const F={x:4.98,z:-3.62};
 box(.46,.82,.48,F.x,.41,F.z,0xf2f5f7,'Office mini fridge');
 box(.02,.2,.03,F.x+.12,.55,F.z+.25,0x8a969a,'Office fridge handle');
 for(const [dx,dy,c] of [[-.1,.65,0xf06b9a],[.02,.42,0xffc93c],[-.06,.3,0x5ec8f2]])mesh(new THREE.CylinderGeometry(.025,.025,.012,10),std(c),F.x+dx,dy,F.z+.245,'Fridge magnet').rotation.x=Math.PI/2;
 box(.34,.28,.3,F.x,.96,F.z,0x3b3f55,'Office CRT');
 const screen=canvasTex(128,96,(ctx,w,h)=>{ctx.fillStyle='#1f5a8c';ctx.fillRect(0,0,w,h);ctx.fillStyle='#7ccc4a';ctx.fillRect(0,h*.7,w,h*.3);ctx.fillStyle='#ffe28a';ctx.fillRect(40,40,14,14);ctx.fillStyle='#ffffff';ctx.font='bold 12px monospace';ctx.fillText('PRESS START',20,20);});
 const tv=mesh(new THREE.PlaneGeometry(.26,.2),new THREE.MeshBasicMaterial({map:screen,toneMapped:false}),F.x,.97,F.z+.152,'Office CRT screen');void tv;
 box(.22,.05,.16,F.x,1.125,F.z-.02,0xc9ced2,'Office games console');
 box(.08,.02,.05,F.x+.2,.83,F.z+.18,0x6b6f7a,'Office controller');
 // Fairy lights along the back wall (z -3.93) above the desk.
 const bulbs=[];const lights=[0xff6b6b,0xffc93c,0x5ec8f2,0x7ccc4a,0xf06ba8];
 for(let i=0;i<14;i++){const t=i/13,x=4.75+t*1.95,y=2.2-Math.sin(t*Math.PI)*.18;
  const m=new THREE.MeshStandardMaterial({color:lights[i%5],emissive:lights[i%5],emissiveIntensity:.9});bulbs.push(m);
  mesh(new THREE.SphereGeometry(.025,8,6),m,x,y,-3.9,'Office fairy light');}
 const wire=new THREE.CatmullRomCurve3(Array.from({length:14},(_,i)=>{const t=i/13;return new THREE.Vector3(4.75+t*1.95,2.2-Math.sin(t*Math.PI)*.18+.02,-3.91);}));
 mesh(new THREE.TubeGeometry(wire,40,.004,4),std(0x3a5a3a),0,0,0,'Office fairy wire');
 // A cat clock over the door frame, on the back wall.
 const clock=canvasTex(256,256,(ctx,w,h)=>{ctx.fillStyle='#3b3f55';ctx.beginPath();ctx.moveTo(40,70);ctx.lineTo(70,10);ctx.lineTo(100,60);ctx.lineTo(156,60);ctx.lineTo(186,10);ctx.lineTo(216,70);ctx.arc(128,140,100,-.2,Math.PI+.2);ctx.fill();ctx.fillStyle='#fff7df';ctx.beginPath();ctx.arc(128,140,78,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3b3f55';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(128,140);ctx.lineTo(128,84);ctx.moveTo(128,140);ctx.lineTo(170,150);ctx.stroke();ctx.fillStyle='#f06b9a';ctx.beginPath();ctx.arc(128,140,8,0,Math.PI*2);ctx.fill();});
 print(clock,.32,.32,5.9,2.25,-3.91,0,'Office cat clock');
 // A round rug under the chair, a plush Jaga-bō, manga and a cactus on the desk.
 const rug=canvasTex(256,256,(ctx,w,h)=>{for(let r=5;r>0;r--){ctx.fillStyle=['#ff9dc6','#ffe28a','#9fd6f0','#a6e57c','#fff7df'][r-1];ctx.beginPath();ctx.arc(w/2,h/2,r*25,0,Math.PI*2);ctx.fill();}});
 const rugMesh=mesh(new THREE.CircleGeometry(.62,32),new THREE.MeshStandardMaterial({map:rug,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}),5.7,.006,-2.7,'Office rug');rugMesh.rotation.x=-Math.PI/2;
 const plush=new THREE.Group();plush.position.set(6.55,.74,-3.15);plush.rotation.y=-Math.PI/2;plush.scale.setScalar(.22);plush.name='Plush Jaga-bo';group.add(plush);
 const pb=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),std(0xe8b95c,{roughness:1}));pb.position.y=.34;pb.scale.set(1,1.2,.9);plush.add(pb);
 for(const [x,y,r] of [[-.1,.42,.08],[.1,.46,.05]]){const e=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),std(0xffffff));e.position.set(x,y,.24);plush.add(e);const p=new THREE.Mesh(new THREE.SphereGeometry(r*.5,8,6),std(0x111111));p.position.set(x+.01,y-.01,.24+r*.6);plush.add(p);}
 const manga=[0xd7263d,0x2a8fcc,0xffc93c,0x7ccc4a];manga.forEach((c,i)=>box(.13,.02,.18,6.55,.75+i*.021,-2.25,c,'Office manga'));
 mesh(new THREE.CylinderGeometry(.04,.035,.06,10),std(0xf06b9a),6.62,.77,-2.02,'Office cactus pot');
 const cactus=mesh(new THREE.CapsuleGeometry(.025,.06,4,8),std(0x57a52f),6.62,.84,-2.02,'Office cactus');void cactus;
 return {tick(time){bulbs.forEach((m,i)=>m.emissiveIntensity=.55+.45*Math.max(0,Math.sin(time*2+i*1.3)));}};
}

// =============================================================== the storage room
/** Cardboard stand-ups, drawn on canvas and cut out by transparency. */
function standee(width,height,draw){
 return canvasTex(width,height,(ctx,w,h)=>{draw(ctx,w,h);});
}
function buildStorage(parent){
 const {group,mesh,box,print}=kit(parent,'Sakura storage life');
 const cardboard=0xc8a473;
 const cutouts=[
  // Jaga-bō, life-size-ish, holding a sign.
  [.8,1.3,2.35,-6.55,.1,standee(400,650,(ctx,w,h)=>{ctx.fillStyle='#d9b07a';ctx.beginPath();ctx.ellipse(w/2,h*.45,190,260,0,0,Math.PI*2);ctx.fill();drawJagabo(ctx,w/2,h*.42,1.55);ctx.fillStyle='#ffffff';ctx.fillRect(40,h-150,w-80,110);ctx.strokeStyle='#d7263d';ctx.lineWidth=8;ctx.strokeRect(40,h-150,w-80,110);text(ctx,"New release!",w/2,h-115,50,'#d7263d');text(ctx,"KOGANE Usushio",w/2,h-65,34,'#6b4a1c');})],
  // The cola campaign girl (an original drawing): big hair, a wink, a bottle.
  [.7,1.55,1.6,-6.6,-.08,standee(360,800,(ctx,w,h)=>{ctx.fillStyle='#d9b07a';ctx.beginPath();ctx.ellipse(w/2,h*.5,170,390,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#2a8fcc';ctx.beginPath();ctx.moveTo(90,380);ctx.lineTo(270,380);ctx.lineTo(300,700);ctx.lineTo(60,700);ctx.fill();
   ctx.fillStyle='#f6d2b0';ctx.beginPath();ctx.arc(w/2,240,95,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c1714';ctx.beginPath();ctx.arc(w/2,200,112,Math.PI*1.02,Math.PI*1.98);ctx.fill();ctx.fillRect(75,190,40,170);ctx.fillRect(245,190,40,170);
   ctx.strokeStyle='#1c1714';ctx.lineWidth=6;ctx.beginPath();ctx.arc(145,250,14,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.moveTo(200,250);ctx.lineTo(228,245);ctx.stroke();ctx.fillStyle='#f07a8a';ctx.beginPath();ctx.arc(w/2,290,16,0,Math.PI);ctx.fill();
   ctx.fillStyle='#b63231';ctx.fillRect(250,420,40,110);ctx.fillStyle='#ffffff';ctx.fillRect(250,460,40,26);
   ctx.fillStyle='#ffffff';ctx.fillRect(40,720,w-80,60);text(ctx,"Sea Breeze Cola",w/2,750,40,'#b63231');})],
  // Tanabata star and a summer palm from past campaigns.
  [.75,.75,.9,-6.62,.15,standee(400,400,(ctx,w,h)=>{ctx.fillStyle='#ffc93c';ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?80:190;ctx.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r);}ctx.fill();text(ctx,"Tanabata",w/2,h/2,64,'#d7263d');})],
  [.8,1.4,4.95,-6.45,-.2,standee(400,700,(ctx,w,h)=>{ctx.fillStyle='#8a5a30';ctx.fillRect(180,260,40,420);ctx.fillStyle='#57a52f';for(let i=0;i<7;i++){ctx.save();ctx.translate(200,260);ctx.rotate(-Math.PI/2+(i-3)*.45);ctx.beginPath();ctx.ellipse(0,-120,40,130,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.fillStyle='#ffffff';ctx.fillRect(30,590,340,90);ctx.fillStyle='#2a8fcc';ctx.font=`bold 40px ${MARU}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText("夏だ！冷たいものどうぞ",w/2,635,320);})],
 ];
 for(const [w,h,x,z,tilt,tex] of cutouts){
  const front=print(tex,w,h,x,h/2+.02,z,0,'Cardboard stand-up');front.rotation.x=-.08;front.rotation.y=tilt;
  // The strut behind it, so it reads as cardboard from the side.
  const strut=box(.02,h*.6,.3,x,h*.3,z-.14,cardboard,'Cardboard stand-up strut');strut.rotation.y=tilt;
 }
 // A hand truck against the east wall, a mop in a yellow bucket, crates and a ladder.
 box(.05,1.1,.05,5.45,.55,-5.2,0x3b3f55,'Hand truck');box(.05,1.1,.05,5.45,.55,-4.8,0x3b3f55,'Hand truck');box(.3,.03,.45,5.3,.02,-5.0,0x8a969a,'Hand truck plate');
 for(const s of [-1,1])mesh(new THREE.CylinderGeometry(.08,.08,.05,12),std(0x222222),5.5,.08,-5+s*.24,'Hand truck wheel').rotation.x=Math.PI/2;
 mesh(new THREE.CylinderGeometry(.16,.14,.3,14,1,true),std(0xffc93c,{side:THREE.DoubleSide}),5.45,.15,-6.2,'Mop bucket');
 const mop=mesh(new THREE.CylinderGeometry(.012,.012,1.3,6),std(0x9b7650),5.47,.75,-6.22,'Mop');mop.rotation.z=.18;
 [[0xd7263d,0],[0x2a8fcc,1],[0x7ccc4a,2]].forEach(([c,i])=>box(.45,.28,.34,-.97+(i%2)*.05,.14+i*.29,-6.35,c,'Plastic crate'));
 // Step ladder, folded open.
 for(const s of [-1,1]){const rail=box(.04,1.2,.04,3.6+s*.16,.58,-5.5,0xc9ced2,'Step ladder');rail.rotation.x=.18;const back=box(.04,1.2,.04,3.6+s*.16,.58,-5.9,0xc9ced2,'Step ladder');back.rotation.x=-.18;}
 for(let i=0;i<3;i++)box(.36,.03,.12,3.6,.3+i*.32,-5.6+i*.04,0xc9ced2,'Step ladder step');
 void group;
}

export function buildSakuraLife(room,{anchor,action}){
 // In the gap between the bun steamer and the oden pot, long side across the counter.
 addSakuraFlyer(room,{position:[4.76,FURNITURE_HEIGHTS.serviceCounter+.015,2.875],width:.25,rotation:[-Math.PI/2,0,-Math.PI/2+.06],stack:true});
 anchor([4.4,FURNITURE_HEIGHTS.serviceCounter+.2,2.875],'Pick up Thuan’s shop flyer',()=>action('sakura-flyer','Sakura counter'));
 const mascot=buildMascot(room,anchor,action);
 const floor=buildShopFloor(room,anchor,action);
 const office=buildOfficeFun(room);
 buildStorage(room);
 const backroom=buildSakuraBackroom(room,{anchor,action});
 const restroom=buildSakuraRestroom(room,{anchor,action});
 const officeDoor=buildOfficeDoor(room);
 let last=0;
 return {officeDoor,ready:Promise.all([floor.ready,backroom.ready]),tick(time){const dt=Math.min(.1,Math.max(0,time-last));last=time;mascot.tick(time,dt);floor.tick(time);office.tick(time);backroom.tick(time);restroom.tick(time);},mascot,dispose(){floor.dispose();backroom.dispose();}};
}

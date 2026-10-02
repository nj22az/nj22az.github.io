import * as THREE from '../../vendor/three.module.js';

/**
 * The flat over the shop, where the Sakurai family who own Sakura live: Grandmother
 * Sakurai, whose parents opened the shop in 1963. Thuan keeps the shop for her and goes
 * home to Kitahama at night (people/island-households.js). The function keeps its old
 * name.
 *
 * The floor above Sakura belongs to the Okinawan quarter's kit building: a plaster
 * front about a metre behind the shop's glass, with a balcony rail along it. Measured
 * in the storefront's own frame (it faces +z): the wall at z -1.05 from y 4.2 to 7, the
 * balcony rail at z -0.2 round y 5. Dressed here so it reads as someone's home from the
 * pavement — curtains, washing on a line with her yellow shirt, pots on the balcony, an
 * air-conditioner, a wind chime and her name on the door.
 */
const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';
const WALL=-1.03,FLOOR=4.2,LINE_Y=6.05,LINE_Z=-.55;
const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};

export function buildThuanFlat(parent,{halfWidth=4.6}={}){
 const group=new THREE.Group();group.name="The Sakurai flat";parent.add(group);
 const std=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extra});
 const mesh=(g,m,x,y,z,name)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=true;group.add(o);return o;};
 // Curtains in the two windows either end: pink gingham, drawn back with ties.
 const gingham=tex(128,128,(ctx,w,h)=>{ctx.fillStyle='#fff3f6';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(240,107,154,.45)';for(let i=0;i<8;i++){ctx.fillRect(i*16,0,8,h);ctx.fillRect(0,i*16,w,8);}});
 gingham.wrapS=gingham.wrapT=THREE.RepeatWrapping;gingham.repeat.set(2,3);
 const curtain=new THREE.MeshStandardMaterial({map:gingham,roughness:.9,side:THREE.DoubleSide});
 for(const x of [-halfWidth+.1,halfWidth-.1])for(const s of [-1,1]){
  const panel=mesh(new THREE.PlaneGeometry(.42,1.25,6,1),curtain,x+s*.42,5.75,WALL+.015,"Sakurai curtain");
  // A gathered edge: the panel is waved along its width.
  const p=panel.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*28)*.02);panel.geometry.computeVertexNormals();
  mesh(new THREE.TorusGeometry(.05,.012,6,12),std(0xf06b9a),x+s*.33,5.5,WALL+.04,"Curtain tie");
 }
 // The washing line, pole to pole across the balcony, and what is pegged on it.
 for(const x of [-halfWidth+.5,halfWidth-.5])mesh(new THREE.CylinderGeometry(.018,.018,1.9,8),std(0xc9ced2,{metalness:.4}),x,FLOOR+.95,LINE_Z,'Washing pole');
 const line=mesh(new THREE.CylinderGeometry(.005,.005,halfWidth*2-1,4),std(0xffffff),0,LINE_Y,LINE_Z,'Washing line');line.rotation.z=Math.PI/2;
 const cloth=(w,h,x,colour,shape,name)=>{
  const t=tex(128,128,(ctx,W,H)=>{ctx.clearRect(0,0,W,H);ctx.fillStyle=colour;
   if(shape==='shirt'){ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(98,0);ctx.lineTo(128,30);ctx.lineTo(104,46);ctx.lineTo(100,128);ctx.lineTo(28,128);ctx.lineTo(24,46);ctx.lineTo(0,30);ctx.closePath();ctx.fill();ctx.fillStyle='#ffffff';for(const [a,b] of [[50,60],[80,90],[60,100]]){ctx.beginPath();ctx.arc(a,b,7,0,Math.PI*2);ctx.fill();}}
   else if(shape==='sock'){ctx.fillRect(40,0,40,90);ctx.beginPath();ctx.ellipse(70,100,34,22,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.fillRect(40,0,40,14);}
   else{ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(0,H-16,W,6);}
  });
  const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.1,side:THREE.DoubleSide,roughness:.95}),x,LINE_Y-h/2-.01,LINE_Z,name);
  m.rotation.y=(x*.7)%.3;
  for(const s of [-1,1])mesh(new THREE.BoxGeometry(.018,.04,.018),std(0xf06b9a),x+s*w*.35,LINE_Y,LINE_Z,'Clothes peg');
  return m;
 };
 cloth(.55,.6,-2.4,'#f4d23c','shirt',"Yellow shirt");
 cloth(.5,.55,-1.4,'#9fd6f0','towel','Towel');
 cloth(.18,.26,-.7,'#ff9dc6','sock','Sock');cloth(.18,.26,-.45,'#ff9dc6','sock','Sock');
 cloth(.55,.6,.4,'#27304d','shirt','Work trousers on the line');
 cloth(.6,.5,1.5,'#ffffff','towel','Sakura apron');
 // Pots along the balcony floor, a watering can, and the outdoor air-conditioner unit.
 [[-3.3,0x2a8fcc,0x3f8f46],[-2.9,0xf06b9a,0x57a52f],[2.2,0xffc93c,0x3f8f46]].forEach(([x,pot,leaf])=>{
  mesh(new THREE.CylinderGeometry(.14,.1,.22,12),std(pot),x,FLOOR+.11,-.45,'Balcony pot');
  for(let i=0;i<5;i++){const l=mesh(new THREE.SphereGeometry(.09,8,6),std(leaf),x+Math.cos(i*1.3)*.06,FLOOR+.3+i*.04,-.45+Math.sin(i*1.3)*.06,'Balcony plant');l.scale.set(1,.6,1);}
 });
 mesh(new THREE.BoxGeometry(.7,.52,.3),std(0xf2f2ee),3.3,FLOOR+.27,-.78,'Air-conditioner unit');
 const fan=mesh(new THREE.CircleGeometry(.18,20),std(0x6b6f7a),3.2,FLOOR+.27,-.62,'Air-conditioner fan');void fan;
 mesh(new THREE.CylinderGeometry(.04,.05,.1,10),std(0x7ccc4a),-2.55,FLOOR+.05,-.35,'Watering can');
 // A glass wind chime by the balcony door, with its paper tail.
 mesh(new THREE.SphereGeometry(.06,12,8,0,Math.PI*2,0,Math.PI*.55),std(0xbfe6ff,{transparent:true,opacity:.7,side:THREE.DoubleSide}),-.9,6.45,-.5,'Furin');
 const tail=tex(64,160,(ctx,w,h)=>{ctx.fillStyle='#fff7df';ctx.fillRect(0,0,w,h);ctx.fillStyle='#d7263d';ctx.font=`bold 30px ${MARU}`;ctx.textAlign='center';ctx.fillText("Summer",w/2,60);ctx.fillStyle='#2a8fcc';ctx.fillRect(10,100,44,6);});
 mesh(new THREE.PlaneGeometry(.07,.18),new THREE.MeshStandardMaterial({map:tail,side:THREE.DoubleSide}),-.9,6.25,-.5,'Furin tail');
 // The family's nameplate by the balcony door.
 const plate=tex(256,96,(ctx,w,h)=>{ctx.fillStyle='#f4e4c8';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#6b4a1c';ctx.lineWidth=6;ctx.strokeRect(3,3,w-6,h-6);ctx.fillStyle='#3b3f55';ctx.font=`bold 48px ${MARU}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText("Sakurai",w/2,h/2);});
 mesh(new THREE.PlaneGeometry(.36,.135),new THREE.MeshStandardMaterial({map:plate,roughness:.8}),.95,5.95,WALL+.02,"Sakurai nameplate");
 return group;
}

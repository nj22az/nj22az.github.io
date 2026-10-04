import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';

/**
 * Minato in October 1997: the things on its walls and tables.
 *
 * - Six posters of the year, sun-faded and taped up: Umineko Beer's summer campaign
 *   (still up in autumn, as they are), the awamori brewery's calendar open at October,
 *   the island team's autumn fixtures, an enka singer at the harbour hall, the police's
 *   drink-driving notice, and the karaoke contest.
 * - The bottle keep: the regulars' own bottles of awamori on a shelf by the counter's
 *   end, each with its owner's name on a tag round the neck.
 * - A condiment set at every pair of stools and on every table, the oshibori warmer,
 *   red lanterns along the counter, and a tanuki by the door.
 *
 * All of it is one print sheet and a handful of merged or instanced meshes.
 * Room coordinates: Minato is x -6.3..6.3, z -6.3..6.3; the counter's customer ledge is
 * at y 1.11 (z -2.1..-2.4), the tables at 0.945, the koagari's low tables at 0.77.
 */
const MINCHO='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';
const GOTHIC='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';

/** The regulars who keep a bottle (and so whose names are on the shelf). */
export const BOTTLE_KEEP=Object.freeze([
 {name:'Kenji',drink:'Zuisen awamori',colour:0x5a3b22},{name:'Mr Higa',drink:'Kumesen awamori',colour:0x2c4a33},
 {name:'Officer Mori',drink:'Shochu, barley',colour:0xd8dccf},{name:'Hiroshi',drink:'Awamori, 10 years',colour:0x5a3b22},
 {name:'Tetsuo',drink:'Shochu, sweet potato',colour:0x34465a},{name:'Harbour master',drink:'Awamori, 5 years',colour:0x2c4a33},
 {name:'Mr Fujita',drink:'Shochu, rice',colour:0xd8dccf},{name:'Masaru',drink:'Awamori',colour:0x5a3b22},
 {name:'Reiko',drink:'Plum wine',colour:0x7a2b2b},{name:'Mr Tanabe',drink:'Awamori, 3 years',colour:0x34465a},
 {name:'Aya',drink:'Plum wine',colour:0x7a2b2b},{name:'Daichi',drink:'Shochu, barley',colour:0xd8dccf},
]);
/** The shelf, on the west wall beside the counter's end. */
export const KEEP_SHELF=Object.freeze({x:-6.29,z:-2.9,width:1.15,levels:Object.freeze([1.45,1.86]),depth:.2});
/** Posters: [cell, x, y, z, yaw, width, height]. */
export const MINATO_1997_POSTERS=Object.freeze([
 ['beer',6.29,2.02,-1.45,-Math.PI/2,.6,.86],
 ['enka',-6.29,2.02,4.55,Math.PI/2,.6,.86],
 ['police',-6.29,1.92,-1.35,Math.PI/2,.46,.66],
 ['calendar',-5.35,2.0,6.29,Math.PI,.56,.8],
 ['karaoke',2.75,2.08,6.29,Math.PI,.5,.72],
 ['baseball',6.29,2.02,4.3,-Math.PI/2,.6,.86],
]);

const SHEET={w:2048,h:1024},P=[300,430];
const CELLS={
 beer:[0,0,...P],enka:[300,0,...P],baseball:[600,0,...P],calendar:[900,0,...P],police:[1200,0,...P],karaoke:[1500,0,...P],
};
BOTTLE_KEEP.forEach((b,i)=>{CELLS['tag'+i]=[(i%16)*128,440+Math.floor(i/16)*64,128,64];});

function sheet(){
 const c=document.createElement('canvas');c.width=SHEET.w;c.height=SHEET.h;const ctx=c.getContext('2d');
 ctx.fillStyle='#000';ctx.fillRect(0,0,SHEET.w,SHEET.h);
 const at=(name,draw)=>{const [x,y,w,h]=CELLS[name];ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();draw(ctx,w,h);ctx.restore();};
 const write=(c,s,x,y,size,colour,font=GOTHIC,weight=900,max=280)=>{c.fillStyle=colour;c.font=`${weight} ${size}px ${font}`;c.textAlign='center';c.textBaseline='middle';c.fillText(s,x,y,max);};
 // Four months of sun through the window: a faded print and a lighter top edge.
 const fade=(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,248,230,.22)');g.addColorStop(.5,'rgba(255,248,230,.06)');g.addColorStop(1,'rgba(255,248,230,0)');c.fillStyle=g;c.fillRect(0,0,w,h);};
 at('beer',(c,w,h)=>{
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#2a8fcc');sky.addColorStop(.62,'#8fd3f0');sky.addColorStop(.63,'#f2d8a0');sky.addColorStop(1,'#e9c27a');c.fillStyle=sky;c.fillRect(0,0,w,h);
  c.fillStyle='#ffffff';c.beginPath();c.arc(230,70,36,0,Math.PI*2);c.fill();
  // The can, cold and sweating, on the sand.
  c.fillStyle='#f4f1e6';c.fillRect(110,170,80,150);c.fillStyle='#c8102e';c.fillRect(110,205,80,40);c.fillStyle='#8a9aa3';c.fillRect(110,166,80,8);
  write(c,'UMINEKO',150,225,22,'#ffffff');
  write(c,"夏だ！ウミネコ",w/2,48,36,'#ffffff',MINCHO);write(c,'UMINEKO BEER · SUMMER 1997',w/2,372,19,'#7a2b14',GOTHIC,800);write(c,'Drinking is for adults',w/2,404,14,'#7a2b14',GOTHIC,700);
  fade(c,w,h);
 });
 at('enka',(c,w,h)=>{
  c.fillStyle='#3a1630';c.fillRect(0,0,w,h);
  c.fillStyle='#f2c14e';c.beginPath();c.arc(w/2,170,92,0,Math.PI*2);c.fill();
  c.fillStyle='#1c0d18';c.beginPath();c.arc(w/2,150,40,0,Math.PI*2);c.fill();c.fillRect(w/2-56,186,112,80);
  write(c,"港の灯",w/2,42,46,'#f2c14e',MINCHO);
  write(c,'HARBOUR LIGHTS',w/2,300,26,'#f2c14e',GOTHIC,900);write(c,'Kayoko Shima · enka evening',w/2,334,17,'#ffffff',GOTHIC,700);
  write(c,'Harbour Hall · Sat 25 Oct · ¥3,000',w/2,368,16,'#ffffff',GOTHIC,700);fade(c,w,h);
 });
 at('baseball',(c,w,h)=>{
  c.fillStyle='#f4efe2';c.fillRect(0,0,w,h);c.fillStyle='#1b4f8a';c.fillRect(0,0,w,86);
  write(c,'MINATO SEAGULLS',w/2,32,28,'#ffffff');write(c,'AUTUMN FIXTURES 1997',w/2,66,18,'#ffd23f',GOTHIC,800);
  c.fillStyle='#ffffff';c.strokeStyle='#c8102e';c.lineWidth=4;c.beginPath();c.arc(w/2,140,34,0,Math.PI*2);c.fill();c.stroke();
  [['4 Oct','v Kitahama','H'],['11 Oct','v Port Ferries','A'],['18 Oct','v Airport Club','H'],['25 Oct','v Aoba','H'],['1 Nov','Island cup final','H']].forEach(([d,v,ha],i)=>{
   const y=206+i*42;c.fillStyle=i%2?'#e9e1cc':'#f4efe2';c.fillRect(14,y-18,w-28,38);
   c.fillStyle='#1b4f8a';c.font=`800 17px ${GOTHIC}`;c.textAlign='left';c.textBaseline='middle';c.fillText(d,22,y);c.fillStyle='#2a2a2a';c.fillText(v,96,y,170);c.fillStyle=ha==='H'?'#c8102e':'#555';c.textAlign='right';c.fillText(ha==='H'?'Home':'Away',w-22,y);
  });
  fade(c,w,h);
 });
 at('calendar',(c,w,h)=>{
  c.fillStyle='#fbf7ee';c.fillRect(0,0,w,h);
  // A brewery's calendar: a picture of the still-house over the month.
  c.fillStyle='#5a3b22';c.fillRect(0,0,w,150);c.fillStyle='#e9c27a';for(let i=0;i<5;i++)c.fillRect(30+i*52,70,36,64);
  write(c,"瑞泉酒造",w/2,36,32,'#ffffff',MINCHO);
  write(c,'OCTOBER 1997',w/2,176,22,'#5a3b22',GOTHIC,900);
  const days=['S','M','T','W','T','F','S'];days.forEach((d,i)=>write(c,d,26+i*41,206,15,i===0?'#c8102e':'#555',GOTHIC,800));
  // 1 October 1997 was a Wednesday.
  for(let d=1;d<=31;d++){const k=d+2,col=k%7,row=Math.floor(k/7);write(c,String(d),26+col*41,234+row*34,16,col===0?'#c8102e':'#2a2a2a',GOTHIC,700);}
  c.strokeStyle='#c8102e';c.lineWidth=3;c.beginPath();c.arc(26+5*41,234+2*34,14,0,Math.PI*2);c.stroke();
  fade(c,w,h);
 });
 at('police',(c,w,h)=>{
  c.fillStyle='#ffffff';c.fillRect(0,0,w,h);c.fillStyle='#c8102e';c.fillRect(0,0,w,74);
  write(c,"飲んだら乗るな",w/2,38,34,'#ffffff',GOTHIC);
  c.strokeStyle='#c8102e';c.lineWidth=12;c.beginPath();c.arc(w/2,190,80,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(w/2-56,134);c.lineTo(w/2+56,246);c.stroke();
  c.fillStyle='#2a2a2a';c.fillRect(w/2-44,182,88,30);c.beginPath();c.arc(w/2-26,216,12,0,Math.PI*2);c.arc(w/2+26,216,12,0,Math.PI*2);c.fill();
  write(c,"IF YOU DRINK, DON'T DRIVE",w/2,312,19,'#c8102e',GOTHIC,900);write(c,'Minato Police Box',w/2,350,16,'#2a2a2a',GOTHIC,700);write(c,'Ask Nao to call a taxi',w/2,380,15,'#2a2a2a',GOTHIC,700);
 });
 at('karaoke',(c,w,h)=>{
  c.fillStyle='#ffe14d';c.fillRect(0,0,w,h);
  c.fillStyle='#e8346c';for(let i=0;i<12;i++){c.save();c.translate(w/2,150);c.rotate(i*Math.PI/6);c.fillRect(-6,0,12,160);c.restore();}
  c.fillStyle='#2a2a2a';c.beginPath();c.arc(w/2,150,44,0,Math.PI*2);c.fill();c.fillStyle='#777';c.fillRect(w/2-10,190,20,60);
  write(c,"カラオケ大会",w/2,40,38,'#e8346c',GOTHIC);
  write(c,'KARAOKE CONTEST',w/2,300,24,'#2a2a2a',GOTHIC,900);write(c,'Last Friday of the month · 21:00',w/2,334,16,'#2a2a2a',GOTHIC,700);
  write(c,'Prize: a bottle on the keep shelf',w/2,364,15,'#2a2a2a',GOTHIC,700);
 });
 BOTTLE_KEEP.forEach((b,i)=>at('tag'+i,(c,w,h)=>{c.fillStyle='#f6efdc';c.fillRect(0,0,w,h);c.strokeStyle='#8a6a3a';c.lineWidth=3;c.strokeRect(2,2,w-4,h-4);write(c,b.name,w/2,h/2,b.name.length>10?17:22,'#2a2018',MINCHO,700,w-10);}));
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function printed(name,w,h){
 const [x,y,cw,ch]=CELLS[name],g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(x+uv.getX(i)*cw)/SHEET.w,1-(y+(1-uv.getY(i))*ch)/SHEET.h);
 return g;
}
function coloured(g,hex){
 const c=new THREE.Color(hex),a=new Float32Array(g.attributes.position.count*3);
 for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);g.setAttribute('color',new THREE.BufferAttribute(a,3));if(g.attributes.uv)g.deleteAttribute('uv');return g;
}
const at=(g,x,y,z,yaw=0)=>{g.rotateY(yaw);g.translate(x,y,z);return g;};

export function buildIzakayaDressing(room,{collider}={}){
 const prints=[],solids=[],glow=[];
 const box=(w,h,d,x,y,z,hex,yaw=0)=>solids.push(coloured(at(new THREE.BoxGeometry(w,h,d),x,y,z,yaw),hex));
 const cyl=(r,h,x,y,z,hex,rTop=r,seg=10)=>solids.push(coloured(at(new THREE.CylinderGeometry(rTop,r,h,seg),x,y,z),hex));
 // The posters, taped, a hair off the wall.
 for(const [cell,x,y,z,yaw,w,h] of MINATO_1997_POSTERS){
  const out=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)).multiplyScalar(.012);
  prints.push(at(printed(cell,w,h),x+out.x,y,z+out.z,yaw));
  for(const [sx,sy] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const t=new THREE.BoxGeometry(.07,.028,.002);t.rotateZ(sx*sy*.6);t.translate(sx*(w/2-.02),sy*(h/2-.01),0);solids.push(coloured(at(t,x+out.x*1.2,y,z+out.z*1.2,yaw),0xf2ecd2));}
 }
 // The bottle keep: two boards on brackets, the bottles in a row, tags on their necks.
 const K=KEEP_SHELF;
 for(const y of K.levels){box(K.depth,.03,K.width,K.x+K.depth/2,y-.015,K.z,0x6e4c30);box(.04,.12,.03,K.x+.02,y-.08,K.z-K.width/2+.08,0x3a2a1c);box(.04,.12,.03,K.x+.02,y-.08,K.z+K.width/2-.08,0x3a2a1c);}
 const bottle=mergeGeometries([new THREE.CylinderGeometry(.045,.045,.24,10).translate(0,.12,0),new THREE.CylinderGeometry(.018,.045,.07,10).translate(0,.275,0),new THREE.CylinderGeometry(.017,.017,.06,8).translate(0,.34,0)]);
 const bottles=new THREE.InstancedMesh(bottle,new THREE.MeshStandardMaterial({roughness:.25,metalness:.05}),BOTTLE_KEEP.length);bottles.name='Minato bottle keep';
 const dummy=new THREE.Object3D(),perRow=Math.ceil(BOTTLE_KEEP.length/K.levels.length),spacing=(K.width-.12)/perRow;
 BOTTLE_KEEP.forEach((b,i)=>{
  const level=K.levels[Math.floor(i/perRow)],z=K.z-K.width/2+.06+spacing*(i%perRow+.5);
  dummy.position.set(K.x+.11,level,z);dummy.updateMatrix();bottles.setMatrixAt(i,dummy.matrix);bottles.setColorAt(i,new THREE.Color(b.colour));
  // The tag hangs on the bottle's front, facing the room.
  prints.push(at(printed('tag'+i,.085,.042),K.x+.11+.05,level+.2,z,Math.PI/2));
 });
 bottles.computeBoundingSphere();
 // A condiment set: soy, shichimi, a toothpick pot and the chopstick box.
 const caddy=(x,y,z,yaw=0)=>{
  const d=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  cyl(.022,.1,x-d.x*.08,y+.05,z-d.z*.08,0x3a1f14,.014);
  cyl(.017,.07,x-d.x*.03,y+.035,z-d.z*.03,0xc8102e);
  cyl(.018,.05,x+d.x*.02,y+.025,z+d.z*.02,0xe9dcc0);
  box(.2,.06,.07,x+d.x*.14,y+.03,z+d.z*.14,0x8a5a32,yaw);
 };
 for(const x of [-3.05,-1.55,-.05,1.45])caddy(x,1.11,-2.24);
 for(const [x,z] of [[-4.55,2.2],[1.55,2.0]])caddy(x,.945,z,Math.PI/2);
 caddy(5.0,.77,.25,Math.PI/2);
 // The oshibori warmer on the work top, by Nao's station.
 box(.3,.2,.22,2.9,.95+.1,-2.95,0xf2f0ea);box(.26,.13,.01,2.9,.95+.1,-2.835,0xb8c0c4);box(.05,.02,.02,2.9,.95+.13,-2.825,0x2a8a3a);
 // Red lanterns along the counter, between the bell pendants.
 const lantern=mergeGeometries([
  coloured(new THREE.SphereGeometry(.1,12,10).scale(1,1.25,1),0xc8241a),
  coloured(new THREE.CylinderGeometry(.055,.055,.03,10).translate(0,.135,0),0x1a1a1a),
  coloured(new THREE.CylinderGeometry(.055,.055,.03,10).translate(0,-.135,0),0x1a1a1a),
  coloured(new THREE.CylinderGeometry(.004,.004,.6,4).translate(0,.45,0),0x1a1a1a),
 ]);
 for(const x of [-3.05,-1.55,-.05,1.45])glow.push(lantern.clone().translate(x,2.62,-1.72));
 lantern.dispose();
 // The tanuki by the door: straw hat, sake flask, a belly for luck.
 const T={x:2.25,z:5.78};
 cyl(.17,.04,T.x,.02,T.z,0x6e5a44,.17);
 solids.push(coloured(at(new THREE.SphereGeometry(.2,12,10).scale(1,1.1,.9),T.x,.25,T.z),0x7a5a3a));
 solids.push(coloured(at(new THREE.SphereGeometry(.14,12,10).scale(1,1.1,.5),T.x,.24,T.z-.1),0xe9dcc0));
 solids.push(coloured(at(new THREE.SphereGeometry(.12,12,10),T.x,.55,T.z),0x7a5a3a));
 solids.push(coloured(at(new THREE.ConeGeometry(.2,.12,12),T.x,.68,T.z),0xd8b26a));
 cyl(.04,.12,T.x+.17,.24,T.z-.06,0xe9dcc0,.03);
 for(const sx of [-1,1])solids.push(coloured(at(new THREE.SphereGeometry(.035,8,6),T.x+sx*.06,.58,T.z-.11),0xf4f0e6));
 if(collider){collider(T.x,T.z,.42,.38,.8);collider(K.x+K.depth/2,K.z,K.depth,K.width,2.0);}
 const group=new THREE.Group();group.name='Minato 1997 dressing';room.add(group);
 const posters=new THREE.Mesh(mergeGeometries(prints),new THREE.MeshStandardMaterial({map:sheet(),roughness:.9}));posters.name='Minato posters and tags';group.add(posters);
 const props=new THREE.Mesh(mergeGeometries(solids),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6}));props.name='Minato table and counter things';group.add(props);
 const lanterns=new THREE.Mesh(mergeGeometries(glow),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,emissive:0x5a1408,emissiveIntensity:.8}));lanterns.name='Minato red lanterns';group.add(lanterns);
 group.add(bottles);
 [...prints,...solids,...glow].forEach(g=>g.dispose());
 return {group,bottles};
}

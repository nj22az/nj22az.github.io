import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {assetURL} from '../../assets.js';
import {SAKURA_HOURS,SAKURA_HOURS_TEXT,sakuraClerkAt} from '../../commerce/sakura-rota.js';
import {townCalendarAt} from '../../town-clock.js';
import DATA from './sakura-wall-dressing.json' with {type:'json'};

const W=512,H=256,COLS=4,ROWS=5,FONT='SakuraJP, Figtree, sans-serif';
export function buildSakuraWallDressing(room){
 const canvas=document.createElement('canvas');canvas.width=W*COLS;canvas.height=H*ROWS;
 const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const prints=[],backs=[],records=[],copy=DATA.copy;let minutes=295*1440+740,lastDay=-1,image=null;
 const hours=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
 const state=()=>{const date=townCalendarAt(minutes).date;return {date,hours:SAKURA_HOURS_TEXT,till:hours(SAKURA_HOURS.till),clerk:sakuraClerkAt(minutes)};};
 function text(s,it,x,y,value,mm,ink='#2d5947',align='center'){
  const scale=(W/it.width_mm)/(H/it.height_mm);s.save();s.translate(x,y);s.scale(scale,1);s.fillStyle=ink;s.textAlign=align;s.textBaseline='middle';s.font=`700 ${mm*H/it.height_mm}px ${FONT}`;s.fillText(value,0,0,(W-32)/scale);s.restore();
 }
 function flower(c,x,y,r){c.fillStyle='#cf8191';for(let k=0;k<5;k++){const a=k*Math.PI*2/5;c.beginPath();c.arc(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,r*.42,0,Math.PI*2);c.fill();}c.fillStyle='#dfba5e';c.beginPath();c.arc(x,y,r*.18,0,Math.PI*2);c.fill();}
 function paint(index){
  const it=DATA.items[index],x=index%COLS*W,y=Math.floor(index/COLS)*H,s=ctx;s.save();s.translate(x,y);s.clearRect(0,0,W,H);
  const blue=it.id==='N02',header=blue||it.id.startsWith('W')||['N01','E04','E07','I01'].includes(it.id),transparent=it.id==='S03';
  if(!transparent){s.fillStyle=header?(blue?'#3f6d83':'#28654e'):'#fff4dd';s.fillRect(0,0,W,H);}
  const ink=header?'#fff3d8':'#2d5947',date=state().date;
  if(['E01','S01'].includes(it.id)){
   text(s,it,W/2,H*.12,'J COFFEE',it.height_mm*.1,'#704f37');
   if(image){const ratio=image.width/image.height,fw=it.width_mm*.94,fh=fw/ratio;const ph=Math.min(fh,it.height_mm*.65),pw=ph*ratio;s.drawImage(image,(1-pw/it.width_mm)*W/2,H*.25,pw/it.width_mm*W,ph/it.height_mm*H);}
   else text(s,it,W/2,H*.5,'J COFFEE',it.height_mm*.13,'#704f37');
   text(s,it,W/2,H*.9,copy.coffee,it.height_mm*.065,'#704f37');
  }else if(it.id==='S02'){
   for(let k=0;k<5;k++){const xx=150+k*55,yy=100+Math.sin(k*2)*25;s.strokeStyle='#6f8b54';s.lineWidth=5;s.beginPath();s.moveTo(255,213);s.lineTo(xx,yy);s.stroke();flower(s,xx,yy,28);}
   text(s,it,W/2,32,copy.flowers,32);text(s,it,W/2,238,'SAKURA SHOTEN',14);
  }else if(it.id==='E05'){
   text(s,it,W/2,22,copy.calendar,23);text(s,it,W/2,49,date.getFullYear()+' / '+String(date.getMonth()+1).padStart(2,'0'),28);
   const first=new Date(date.getFullYear(),date.getMonth(),1).getDay(),days=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
   for(let k=0;k<7;k++)text(s,it,42+k*71,78,['S','M','T','W','T','F','S'][k],16,k===0?'#ad4b43':'#4d6455');
   for(let d=1;d<=days;d++){const k=first+d-1,xx=42+(k%7)*71,yy=103+Math.floor(k/7)*26;if(d===date.getDate()){s.fillStyle='#e9bb91';s.beginPath();s.arc(xx,yy,16,0,Math.PI*2);s.fill();}text(s,it,xx,yy,String(d),20,k%7===0?'#ad4b43':'#374f43');}
  }else if(it.id==='E06'){
   s.fillStyle='#bd9972';s.fillRect(0,0,W,H);s.fillStyle='#fff6e4';s.fillRect(14,12,W-28,H-24);text(s,it,W/2,34,copy.rota,35);
   for(let k=0;k<7;k++){const weekday=(date.getDay()+6)%7,at=minutes+(k-weekday)*1440;const keeper=sakuraClerkAt(Math.floor(at/1440)*1440+720);text(s,it,35,66+k*20,[...copy.weekdays][k],25,'#3a5445','left');text(s,it,180,66+k*20,keeper||'',22,'#3a5445','left');text(s,it,430,66+k*20,SAKURA_HOURS_TEXT,20);}
   text(s,it,W/2,230,copy.deliveries,23);
  }else if(it.id==='R01'){
   s.clearRect(0,0,W,H);s.fillStyle='#455650';s.beginPath();s.ellipse(W/2,H/2,W*.49,H*.49,0,0,Math.PI*2);s.fill();s.fillStyle='#fff7e0';s.beginPath();s.ellipse(W/2,H/2,W*.44,H*.44,0,0,Math.PI*2);s.fill();
   for(let k=0;k<12;k++){const a=k*Math.PI/6;s.strokeStyle='#455650';s.lineWidth=4;s.beginPath();s.moveTo(W/2+Math.sin(a)*W*.37,H/2-Math.cos(a)*H*.37);s.lineTo(W/2+Math.sin(a)*W*.41,H/2-Math.cos(a)*H*.41);s.stroke();}

  }else if(it.id==='S04'){
   text(s,it,W/2,45,copy.hours,29);text(s,it,W/2,122,SAKURA_HOURS_TEXT,45);text(s,it,W/2,205,copy.till+' '+hours(SAKURA_HOURS.till),18);
  }else if(it.id==='R02'){
   s.fillStyle='#bd9972';s.fillRect(0,0,W,H);s.fillStyle='#fff6e4';s.fillRect(22,20,W-44,H-40);text(s,it,W/2,58,copy.rest,52);text(s,it,W/2,118,copy.rest_message,31);text(s,it,W/2,177,SAKURA_HOURS_TEXT,39);text(s,it,W/2,217,copy.staff,27);
  }else{
   const lines=it.id==='E02'?[copy.services,'COPY / FAX - ASK AT THE COUNTER']:it.id==='E03'?[copy.wash,'STAFF PREPARATION AREA']:[it.artwork_copy];
   lines.forEach((v,k)=>text(s,it,W/2,lines.length===1?H/2:H*(.36+k*.39),v,Math.min(it.height_mm*(k===0?(header?.72:.40):.17),it.width_mm/(v.length*.85+1)),ink));
  }
  s.restore();texture.needsUpdate=true;
 }
 for(const [index,it] of DATA.items.entries()){
  const w=it.width_mm/1000,h=it.height_mm/1000,n=new THREE.Vector3(...it.three_inward_normal),rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n),pos=new THREE.Vector3(...it.three_center_m);
  const g=it.id==='R01'?new THREE.CircleGeometry(.15,40):new THREE.PlaneGeometry(w-.006,h-.006),uv=g.attributes.uv;
  for(let j=0;j<uv.count;j++)uv.setXY(j,((index%COLS)+(3+uv.getX(j)*(W-6))/W)/COLS,1-(Math.floor(index/COLS)+(3+(1-uv.getY(j))*(H-6))/H)/ROWS);
  g.applyQuaternion(rotation);g.translate(...pos.toArray());prints.push(g);
  if(!['S03','R01'].includes(it.id)){const b=new THREE.BoxGeometry(w,h,.006);b.applyQuaternion(rotation);b.translate(...pos.clone().addScaledVector(n,-.005).toArray());backs.push(b);}
  records.push({...it,center:[...it.three_center_m],normal:[...it.three_inward_normal]});paint(index);
 }
 const group=new THREE.Group();group.name='Sakura CAD wall dressing';room.add(group);
 const mesh=new THREE.Mesh(mergeGeometries(prints),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.1,toneMapped:false}));mesh.name='Sakura measured wall prints';mesh.userData.placements=records;group.add(mesh);
 if(backs.length){const backing=new THREE.Mesh(mergeGeometries(backs),new THREE.MeshStandardMaterial({color:0xb08a5e,roughness:.8}));backing.name='Sakura shallow wall-board backing';group.add(backing);}
 [...prints,...backs].forEach(g=>g.dispose());
 const clock=DATA.items.find(i=>i.id==='R01'),hands=new THREE.Group();hands.name='Sakura receiving clock hands';hands.position.set(...clock.three_center_m);hands.position.addScaledVector(new THREE.Vector3(...clock.three_inward_normal),.003);group.add(hands);
 const makeHand=(length,width)=>{const g=new THREE.BoxGeometry(width,length,.002);g.translate(0,length/2-.008,0);const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x394b41,roughness:.6}));hands.add(m);return m;};const hourHand=makeHand(.085,.006),minuteHand=makeHand(.115,.0035);minuteHand.position.z=.003;
 const ready=new Promise(resolve=>{new THREE.ImageLoader().load(assetURL('graphics/advertising/j-coffee-island-banner.webp'),img=>{image=img;for(const id of ['E01','S01'])paint(DATA.items.findIndex(i=>i.id===id));resolve(true);},undefined,()=>resolve(false));});
 return {group,mesh,placements:records,atlas:canvas,ready,state,refresh(time){if(!Number.isFinite(time))return;minutes=time;const m=((time%1440)+1440)%1440;hourHand.rotation.z=-m/720*Math.PI*2;minuteHand.rotation.z=-m/60*Math.PI*2;if(Math.floor(time/1440)===lastDay)return;lastDay=Math.floor(time/1440);for(const id of ['E05','E06'])paint(DATA.items.findIndex(i=>i.id===id));}};
}

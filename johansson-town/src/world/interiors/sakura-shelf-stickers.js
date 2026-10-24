import {crayon} from './sakura-crayon.js';
import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {GROCERY_ITEMS} from '../../commerce/catalogue.js';
import COPY from './sakura-shelf-stickers.json' with {type:'json'};
import POP from './sakura-starburst-pop.json' with {type:'json'};

// Original Sakura drawings, generated directly into one atlas; no imported character artwork.
const COLS=8,TILE_W=320,TILE_H=128,FONT='SakuraJP, Figtree, sans-serif';
function flower(c,x,y,r){c.fillStyle='#db8290';for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2;c.beginPath();c.ellipse(x+Math.cos(a)*r*.48,y+Math.sin(a)*r*.48,r*.38,r*.49,a+Math.PI/2,0,Math.PI*2);c.fill();}c.fillStyle='#f4cd65';c.beginPath();c.arc(x,y,r*.17,0,Math.PI*2);c.fill();}
function face(c,x,y){c.fillStyle='#3c4b3d';for(const dx of [-8,8]){c.beginPath();c.arc(x+dx,y,2,0,Math.PI*2);c.fill();}c.strokeStyle='#3c4b3d';c.lineWidth=2;c.beginPath();c.arc(x,y+3,6,.15,Math.PI-.15);c.stroke();c.fillStyle='#e5a09c';for(const dx of [-14,14]){c.beginPath();c.ellipse(x+dx,y+6,4,2,0,0,Math.PI*2);c.fill();}}
function icon(c,kind,x,y){
 if(kind==='rice'){c.fillStyle='#fffdf3';c.strokeStyle='#70816d';c.lineWidth=2;c.beginPath();c.moveTo(x,y-31);c.quadraticCurveTo(x+8,y-33,x+30,y+21);c.quadraticCurveTo(x,y+35,x-30,y+21);c.quadraticCurveTo(x-10,y-20,x,y-31);c.closePath();c.fill();c.stroke();c.fillStyle='#41674e';c.fillRect(x-9,y+14,18,15);face(c,x,y+1);}
 else if(kind==='coffee'){c.strokeStyle='#6b553f';c.lineWidth=4;c.beginPath();c.arc(x+24,y+1,11,-Math.PI/2,Math.PI/2);c.stroke();c.fillStyle='#fffdf3';c.fillRect(x-24,y-18,48,43);c.strokeRect(x-24,y-18,48,43);c.fillStyle='#8e6241';c.fillRect(x-20,y-15,40,5);face(c,x,y+1);for(const dx of [-9,7]){c.beginPath();c.moveTo(x+dx,y-25);c.quadraticCurveTo(x+dx-9,y-34,x+dx,y-40);c.stroke();}}
 else if(kind==='leaf'){c.fillStyle='#c66b40';c.beginPath();c.moveTo(x,y-32);for(const [dx,dy] of [[8,-12],[23,-22],[19,-4],[32,0],[12,14],[17,23],[0,18],[-17,23],[-12,14],[-32,0],[-19,-4],[-23,-22],[-8,-12]])c.lineTo(x+dx,y+dy);c.closePath();c.fill();c.strokeStyle='#6b553f';c.lineWidth=2;c.beginPath();c.moveTo(x,y+28);c.lineTo(x,y-17);c.stroke();}
 else flower(c,x,y,33);
}
// Deterministic wax-pencil lettering: individually tilted glyphs and small pigment gaps.

function starCard(c,t){
 c.beginPath();t.outline_mm.forEach(([x,y],i)=>{const xx=4+(x/t.width_mm+.5)*312,yy=4+(y/t.height_mm+.5)*120;if(i)c.lineTo(xx,yy);else c.moveTo(xx,yy);});c.closePath();c.fillStyle=t.paper;c.fill();c.strokeStyle=t.ink;c.lineWidth=2;c.stroke();
 c.save();c.clip();c.fillStyle='rgba(250,245,217,.72)';for(const x of [131,177]){c.save();c.translate(x,16);c.rotate(x===131?-.12:.10);c.fillRect(0,0,18,13);c.restore();}
 crayon(c,t.lines[0],160,55,30,t.ink);crayon(c,t.lines[1],160,88,30,t.ink);c.restore();
}
export function buildSakuraShelfStickers(room,{shelves}){
 const labels=[],tiles=[],geometries=[],cards=COPY.cards.map(c=>{const pop=POP.find(p=>p.id===c.id);return pop?{...c,...pop,pop:true}:c;}),rows=Math.ceil((GROCERY_ITEMS.length+cards.length)/COLS);
 const canvas=document.createElement('canvas');canvas.width=COLS*TILE_W;canvas.height=rows*TILE_H;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const draw=(autumn=true)=>{
  const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
  tiles.forEach((t,i)=>{const x=(i%COLS)*TILE_W,y=Math.floor(i/COLS)*TILE_H;c.save();c.translate(x,y);if(t.pop){starCard(c,t);c.restore();return;}c.fillStyle=t.paper||'#fff7df';c.fillRect(3,3,314,122);c.strokeStyle=t.price?'#a35043':'#829474';c.lineWidth=2;c.strokeRect(7,7,306,114);
   if(t.price){flower(c,28,28,14);c.fillStyle='#56614b';c.textAlign='left';c.font=`700 23px ${FONT}`;c.fillText(t.jp,50,36,254);c.font=`16px ${FONT}`;c.fillText(t.name,16,60,275);c.fillStyle='#23392f';c.font=`800 48px ${FONT}`;c.textAlign='right';c.fillText('¥'+t.cost,301,108,232);c.font=`15px ${FONT}`;c.textAlign='left';c.fillText(COPY.tax,16,105,45);}
   else{const seasonal=t.copy==='autumn'&&autumn;icon(c,t.icon==='leaf'&&!autumn?'flower':t.icon,55,65);c.fillStyle='#3d5b45';c.textAlign='center';c.font=`700 33px ${FONT}`;c.fillText(COPY[seasonal?'autumn':t.copy==='autumn'?'everyday':t.copy],205,58,195);c.font=`700 18px ${FONT}`;c.fillText(t.copy==='recommend'?"THUAN'S PICK":'SAKURA SHOTEN',205,91,195);}
   c.restore();});texture.needsUpdate=true;
 };
 function place(tile,id,s,level,w,h,along=0,kind='price',outline=null){
  const front=s.fridge!=null?(s.x<-5?.34:.37):.207;
  // The whole ticket hangs below the deck, in front of stock, within its bay's span.
  const position=[s.x+Math.sin(s.yaw)*front+Math.cos(s.yaw)*along,level-(kind==='starburst'?.0075+h/2:.040),s.z+Math.cos(s.yaw)*front-Math.sin(s.yaw)*along];
  const g=outline?new THREE.ShapeGeometry(new THREE.Shape(outline.map(([x,y])=>new THREE.Vector2(x/1000,-y/1000)))):new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
  if(outline)for(let j=0;j<uv.count;j++)uv.setXY(j,g.attributes.position.getX(j)/w+.5,g.attributes.position.getY(j)/h+.5);
  for(let j=0;j<uv.count;j++){uv.setXY(j,((tile%COLS)*TILE_W+4+uv.getX(j)*(TILE_W-8))/canvas.width,1-(Math.floor(tile/COLS)*TILE_H+4+(1-uv.getY(j))*(TILE_H-8))/canvas.height);}
  g.rotateY(s.yaw);g.translate(...position);geometries.push(g);labels.push({id,kind,position,width:w,height:h,yaw:s.yaw,level,along,front,price:kind==='price'?GROCERY_ITEMS.find(p=>p.id===id).cost:null,outline_mm:outline});
 }
 for(const p of GROCERY_ITEMS){const s=shelves[p.id];if(!s)continue;const tile=tiles.length;tiles.push({price:true,cost:p.cost,name:p.name,jp:COPY.products[p.id]});for(const level of s.levels)place(tile,p.id,s,level,.20,.065);}
 for(const card of cards){const s=shelves[card.id];if(!s)continue;const tile=tiles.length;tiles.push(card);const width=card.pop?card.width_mm/1000:s.width<.75?.085:.14,height=card.pop?card.height_mm/1000:.065;place(tile,card.id,s,s.levels[1],width,height,s.width/2-width/2-.015,card.pop?'starburst':'decoration',card.pop?card.outline_mm:null);}
 draw();
 const group=new THREE.Group();group.name='Sakura cute shelf stickers';room.add(group);
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.5,toneMapped:false});
 const mesh=new THREE.Mesh(mergeGeometries(geometries),material);mesh.name='Sakura prices and paper stickers';mesh.userData.labels=labels;group.add(mesh);geometries.forEach(g=>g.dispose());
 let lastAutumn=true;
 return {mesh,group,labels,posters:new THREE.Group(),updateStock(){},setMonth(month){const autumn=month>=9&&month<=11;if(autumn!==lastAutumn){lastAutumn=autumn;draw(autumn);}},atlas:canvas};
}

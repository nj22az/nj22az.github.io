import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import CAD from './sakura-counter-operations.json' with {type:'json'};
import {SAKURA_REBUILD_OFFSET} from './sakura-rebuild-layout.js';

// Corrected OPS-01 Rev B: all dimensions and the pen tether come from the audited CAD.
export function buildSakuraCounterOperations(room){
 const group=new THREE.Group();group.name='Sakura counter operational props';group.position.set(...SAKURA_REBUILD_OFFSET);room.add(group);
 const solid=[],clear=[],printed=[],color=new THREE.Color();
 const part=(g,hex,pet=false)=>{if(pet)clear.push(g);else{color.set(hex);const a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3)a.set([color.r,color.g,color.b],i);g.setAttribute('color',new THREE.BufferAttribute(a,3));solid.push(g);}};
 const box=(x,d,w,l,h,y,c,pet=false)=>{const g=new THREE.BoxGeometry(w/1000,h/1000,l/1000);g.translate((x+w/2)/1000,(y+h/2)/1000,-(d+l/2)/1000);part(g,c,pet);};
 const point=([x,d,y])=>new THREE.Vector3(x/1000,y/1000,-d/1000);
 const rod=(a,b,r,c)=>{const p=point(a),q=point(b),v=q.clone().sub(p),g=new THREE.CylinderGeometry(r/1000,r/1000,v.length(),8);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));g.translate(...p.add(q).multiplyScalar(.5).toArray());part(g,c);};
 const print=(id,x,d,y,w,h,flat=false)=>{const g=new THREE.PlaneGeometry(w/1000,h/1000);if(flat)g.rotateX(-Math.PI/2);else g.rotateY(-Math.PI/2);g.translate(x/1000,y/1000,-d/1000);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(id%2+.025+uv.getX(i)*.95)/2,1-(Math.floor(id/2)+.025+(1-uv.getY(i))*.95)/2);printed.push(g);};
 for(const p of CAD.props){
  const [x,d,w,l]=p.box,y=p.bottom,h=p.height;
  if(p.id==='waybills'){
   box(x,d,w,l,4,y,0x557d78);box(x,d,4,l,h,y,0x557d78);
   for(let k=0;k<3;k++){
    const yy=y+4+k*35;box(x+4,d,w-4,l,3,yy,0x90aaa0);
    for(const dd of [d,d+l-3])box(x+4,dd,w-4,3,24,yy,0x557d78);
    for(let n=0;n<3;n++)box(x+12,d+20,190,110,1,yy+3+n, [0xe9e1c1,0xe2c6bc,0xc2d2d9][k]);
    print(0,x+107,d+75,yy+6.2,180,100,true);
   }
  }else if(p.id==='pen'){
   rod([p.stand[0],p.stand[1],y],[p.stand[0],p.stand[1],y+6],27,0x3b5551);
   rod([p.stand[0],p.stand[1],y+6],[p.stand[0],p.stand[1],y+120],15,0x617a77);
   rod(...p.penEnds,4.5,0x2c4d73);rod(p.penEnds[0],[12050,3855,812],2,0xa9b4ae);
   const path=new THREE.CurvePath();for(let i=1;i<p.tether.length;i++)path.add(new THREE.LineCurve3(point(p.tether[i-1]),point(p.tether[i])));const g=new THREE.TubeGeometry(path,64,.0015,5,false);part(g,0x394b47);
  }else if(p.id==='charity'){
   box(x,d,w,l,3,y,0x90aaa0);
   for(const xx of [x,x+w-3])box(xx,d,3,l,h,y,0xc6e4de,true);
   for(const dd of [d,d+l-3])box(x,dd,w,3,h,y,0xc6e4de,true);
   // A real 80x4 opening in the removable acrylic lid.
   box(x,d,w,48,3,y+h-3,0xc6e4de,true);box(x,d+52,w,48,3,y+h-3,0xc6e4de,true);
   box(x,d+48,30,4,3,y+h-3,0xc6e4de,true);box(x+110,d+48,30,4,3,y+h-3,0xc6e4de,true);
   print(1,x-.4,d+50,y+73,80,70);
   // Three loose, non-spendable scenery coins rest on the inside floor.
   for(const [xx,dd]of [[x+30,d+28],[x+75,d+60],[x+105,d+40]])rod([xx,dd,y+3],[xx,dd,y+5],8,0xb5a369);
  }else if(p.id==='karashi'){
   box(x,d,w,l,2,y,0xd2b757);
   for(const xx of [x,x+w-2])box(xx,d,2,l,45,y,0xd2b757);
   for(const dd of [d,d+l-2])box(x,dd,w,2,45,y,0xd2b757);
   for(let i=0;i<p.sachets;i++){const dd=d+5+i*9;box(x+35,dd,45,3,65,y+2,0xf3d768);print(2,x+34.6,dd+1.5,y+36,2,43);}
   // Folded bridge attaches to the vat rim ten millimetres beyond the holder.
   box(x+15,d+l-2,12,15,2,y+45,0x9eaaa4);box(x+15,d+l+11,12,2,12,y+35,0x9eaaa4);
   print(2,x-.4,d+l/2,y+26,60,32);
  }
 }
 const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d');c.fillStyle='#f5eed8';c.fillRect(0,0,512,512);
 // Original paper forms: ruled boxes rather than an invented carrier brand/service claim.
 c.strokeStyle='#627f7a';c.lineWidth=2;for(let k=0;k<5;k++){c.strokeRect(18,58+k*32,220,24);}c.fillStyle='#466c61';c.font='bold 21px sans-serif';c.fillText('SAKURA / MEMO',18,35);
 c.save();c.translate(256,0);c.fillStyle='#ecd8ac';c.fillRect(0,0,256,256);c.fillStyle='#c8783e';c.beginPath();c.ellipse(128,111,63,52,0,0,Math.PI*2);c.fill();for(const [a,b]of [[73,80],[183,80]]){c.beginPath();c.moveTo(a-18,b+10);c.lineTo(a,b-40);c.lineTo(a+18,b+10);c.fill();}c.strokeStyle='#4a453a';c.lineWidth=5;for(const x of [104,152]){c.beginPath();c.arc(x,108,8,0,Math.PI);c.stroke();}c.fillStyle='#694c41';c.beginPath();c.arc(128,130,6,0,Math.PI*2);c.fill();c.fillStyle='#426557';c.textAlign='center';c.font='bold 23px sans-serif';c.fillText('HARBOUR CATS',128,203,235);c.font='17px sans-serif';c.fillText('a little kindness',128,231,235);c.restore();
 c.fillStyle='#f3d768';c.fillRect(0,256,256,256);c.fillStyle='#705738';c.textAlign='center';c.font='bold 34px sans-serif';c.fillText('KARASHI',128,354,235);c.font='22px sans-serif';c.fillText('MUSTARD',128,398,235);c.font='17px sans-serif';c.fillText('please ask staff',128,443,235);
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
 for(const [list,mat,name]of [[solid,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.67}),'solid'],[clear,new THREE.MeshStandardMaterial({color:0xc6e4de,transparent:true,opacity:.23,depthWrite:false,roughness:.2}),'acrylic'],[printed,new THREE.MeshBasicMaterial({map:tx,toneMapped:false}),'prints']]){
  const mesh=new THREE.Mesh(mergeGeometries(list),mat);list.forEach(g=>g.dispose());mesh.name='Sakura operational '+name;mesh.castShadow=name==='solid';mesh.receiveShadow=true;group.add(mesh);
 }
 group.userData={drawing:CAD.drawing,revision:CAD.revision,props:CAD.props,stockChanges:false,newInteractions:false,routeChanges:false};return group;
}

import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import DATA from './sakura-roof-design.json' with {type:'json'};

// CAD millimetres -> unshifted shop frame. All services are scenery, no new enter prompt.
export function buildSakuraRoof(parent){
 const group=new THREE.Group();group.name='Sakura roof services Rev C';parent.add(group);
 const batches=new Map(),records=[];
 const point=p=>new THREE.Vector3(p[0]/1000,p[2]/1000,-p[1]/1000);
 const add=(g,color,metal=false)=>{const key=color+':'+metal;if(!batches.has(key))batches.set(key,{color,metal,list:[]});batches.get(key).list.push(g);};
 const box=(x,d,w,l,h,y,color=0x9ba3a0)=>{const g=new THREE.BoxGeometry(w/1000,h/1000,l/1000);g.translate((x+w/2)/1000,(y+h/2)/1000,-(d+l/2)/1000);add(g,color);};
 const rod=(a,b,r=22,color=0x80928d)=>{const p=point(a),q=point(b),v=q.clone().sub(p);if(v.length()<1e-6)return;const g=new THREE.CylinderGeometry(r/1000,r/1000,v.length(),8);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));g.translate(...p.add(q).multiplyScalar(.5).toArray());add(g,color,true);};
 const cylinder=(x,d,y,r,h,color)=>{const g=new THREE.CylinderGeometry(r/1000,r/1000,h/1000,24);g.translate(x/1000,(y+h/2)/1000,-d/1000);add(g,color,true);};
 const rail=(a,b)=>{rod(a,b);rod([a[0],a[1],a[2]-550],[b[0],b[1],b[2]-550],16);const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1000));for(let i=0;i<=n;i++){const p=a.map((v,k)=>v+(b[k]-v)*i/n);rod([p[0],p[1],p[2]-1100],p,20);}};
 box(-180,-180,14260,11000,150,3860,0xc2c4b8);
 // Open guards: front/sides and north with a 1000 mm roof gate opening.
 for(const [a,b] of [[[0,0,5110],[13900,0,5110]],[[0,0,5110],[0,10640,5110]],[[13900,0,5110],[13900,10640,5110]],[[0,10640,5110],[4500,10640,5110]],[[5500,10640,5110],[13900,10640,5110]]])rail(a,b);
 // Closed roof gate, visibly hinged; no claim of usable roof traversal.
 rail([4500,10640,5110],[5500,10640,5110]);for(const y of [4300,4800])cylinder(4500,10640,y,32,90,0x626f69);
 const s=DATA.stair,rise=s.rise;
 for(const [index,f] of s.flights.entries()){
  const [x,d,w,l]=f,base=index===0?0:2005;
  for(let i=0;i<10;i++){const tx=index===0?x+i*260:x+(9-i)*260;box(tx,d,260,l,45,base+(i+1)*rise-45,0x929f9b);}
  for(const edge of [d,d+l]){const a=index===0?[x,edge,base]:[x+w,edge,base],b=index===0?[x+w,edge,base+2005]:[x,edge,base+2005];rod(a,b,45,0x596b62);rail([a[0],a[1],a[2]+1100],[b[0],b[1],b[2]+1100]);}
 }
 for(const [rect,level] of [[s.midLanding,2005],[s.topLanding,4010]]){const [x,d,w,l]=rect;box(x,d,w,l,80,level-80);for(const xx of [x+40,x+w-40])for(const dd of [d+40,d+l-40])box(xx-30,dd-30,60,60,level-80,0,0x596b62);}
 rail([8100,13070,3105],[9100,13070,3105]);rail([9100,10820,3105],[9100,13070,3105]);rail([8100,10820,3105],[9100,10820,3105]);
 rail([4500,10640,5110],[4500,11820,5110]);rail([4500,11820,5110],[5500,11820,5110]);
 // Raised four-legged steel tank frame; body is a compact insulated cylinder.
 const t=DATA.tank,[bx,bd,bw,bl]=t.base;
 for(const x of [bx+100,bx+bw-100])for(const d of [bd+100,bd+bl-100]){box(x-45,d-45,90,90,310,4010,0x687e75);box(x-90,d-90,180,180,20,4010,0x596b62);}
 box(bx,bd,bw,bl,40,4320,0x8d9f97);cylinder(...t.center,4360,600,1200,0xdce2d9);
 for(const y of [4420,4960,5500]){const g=new THREE.TorusGeometry(.604,.018,6,40);g.rotateX(Math.PI/2);g.translate(10.9,y/1000,-8.5);add(g,0x869b91,true);}
 cylinder(10500,8500,5560,225,35,0x9baa9e);rod([10400,8500,5620],[10600,8500,5620],15);
 const [px,pd,pw,pl,py]=t.inspectionPlatform;box(px,pd,pw,pl,40,py-40);
 for(let i=0;i<3;i++)box(9200+i*200,8150,200,700,35,4010+(i+1)*250-35);
 for(const d of [8150,8850]){rod([9200,d,5060],[9800,d,5810],18);rod([9200,d,4010],[9800,d,4760],25);}
 for(const x of [px+35,px+pw-35])for(const d of [pd+35,pd+pl-35])box(x-20,d-20,40,40,py-4010-40,4010,0x596b62);
 rail([px,pd,py+1100],[px+pw,pd,py+1100]);rail([px,pd+pl,py+1100],[px+pw,pd+pl,py+1100]);rail([px+pw,pd,py+1100],[px+pw,pd+pl,py+1100]);
 const c=DATA.serviceCurb;box(...c.box,c.top-4010,4010,0xb4b9aa);
 for(const p of [...DATA.pipes,...DATA.branches]){const color=p.color?Number(p.color.replace('#','0x')):0x708b99;for(let i=1;i<p.points.length;i++)rod(p.points[i-1],p.points[i],p.dn/2,color);records.push({id:p.id,dn:p.dn,points:p.points});}
 for(const [x,d] of DATA.roof.drains){box(x-80,d-80,160,160,20,4010,0x475a52);rod([x,d,4010],[x,10870,3980],38,0x7c8c86);rod([x,10870,3980],[x,10870,150],38,0x7c8c86);}
 const [vx,vd,diam,vy]=DATA.roof.wcVent;rod([vx,vd,3000],[vx,vd,vy],diam/2,0x899b91);cylinder(vx,vd,vy,70,30,0x64796d);
 // Separate visible air gaps at the rear. Both discharge ends remain above the receiver.
 for(const x of [12900,12980]){cylinder(x,10870,430,55,100,0x74877d);rod([x,10870,430],[x,10870,150],27,0x74877d);}
 for(const [x,d,y] of [[12600,10870,600],[11550,8400,4440],[11350,8750,4360]]){rod([x,d,y-40],[x,d,y+40],35,0xb19a5b);rod([x-70,d,y],[x+70,d,y],12,0xa25142);}
 // Refrigeration condensers moved clear of the revised delivery door and stair.
 for(const x of [3200,3750]){box(x,10820,450,500,100,0,0xb8b9a9);box(x,10850,450,350,650,100,0xd3d7c9);box(x+35,11205,380,20,380,235,0x485e57);for(let n=0;n<7;n++)box(x+45+n*50,11225,15,12,360,245,0x99a99d);}
 box(10000,10830,400,100,550,950,0x7c887b);
 for(const b of batches.values()){const geometry=mergeGeometries(b.list);b.list.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:b.color,metalness:b.metal?.45:.15,roughness:.7}));mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='Sakura roof construction';group.add(mesh);}
 group.userData={revision:DATA.revision,roofLevel:4010,stair:s,pipeRoutes:records,site:DATA.site,tank:t,access:'Scenery only; no roof entry or walking level'};
 return group;
}

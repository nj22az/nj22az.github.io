// Sakura Shoten Rev E: standalone design prototype, not game runtime wiring.
// CAD (x,depth,z-height) in mm -> Three (x/1000,height/1000,-depth/1000).
export function buildSakuraShotenInterior(THREE){
 const root=new THREE.Group();root.name='SakuraShoten_RevE';
 const groups={},batches=new Map(),solids=[],labels=[];
 const palettes={floor:0xf0ece3,backfloor:0xc3c9c4,wall:0xeee5cf,partition:0xf4f0e5,cream:0xded9c7,shelf:0xbcb7a8,steel:0x959f9c,cold:0xd7e4e5,light:0xecf7ff,glass:0xabcacb,wood:0xbd946b,top:0xf1e9d9,beige:0xc9c0aa,screen:0x234938,green:0x28654e,orange:0xbf663c,blue:0x477386,futon:0xf5e8d8,red:0x9c4b3f,pink:0xd29a8a,yellow:0xd9b564};
 const mats=Object.fromEntries(Object.entries(palettes).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='steel'?.35:.8,metalness:k==='steel'?.35:0,...(k==='light'?{emissive:0xe4f1ff,emissiveIntensity:.7}:{}),...(k==='screen'?{emissive:0x224a33,emissiveIntensity:.3}:{}),...(k==='glass'?{transparent:true,opacity:.2,depthWrite:false}:{} )})]));
 function group(n){if(!groups[n]){groups[n]=new THREE.Group();groups[n].name=n;root.add(groups[n]);}return groups[n];}
 function box(g,x,z,w,d,h,mat,y=0,name=''){
  const key=g+':'+mat;if(!batches.has(key))batches.set(key,{g,mat,items:[]});batches.get(key).items.push({x,z,w,d,h,y,name});
  if(name)solids.push({name,x,z,w,d,h,y});
 }
 const textMatCache=new Map();
 function text(g,x,z,y,w,jp,en='',color='#285b48',yaw=0){
  const key=[jp,en,color].join('|');let material=textMatCache.get(key);
  if(!material){const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1024,256);ctx.fillStyle='#fff8e8';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 76px SakuraJP, sans-serif';ctx.fillText(jp,512,en?100:130,950);if(en){ctx.font='32px sans-serif';ctx.fillText(en,512,202,950);}const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;material=new THREE.MeshBasicMaterial({map:tx});textMatCache.set(key,material);}
  const t=new THREE.Group();t.position.set(x/1000,y/1000,-z/1000);t.rotation.y=yaw;
  for(const flip of [0,Math.PI]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w/1000,w/4000),material);m.rotation.y=flip;m.position.z=flip?-.028:.028;t.add(m);}
  group(g).add(t);labels.push({jp,en,x,z,y,w});return t;
 }
 function productRun(g,x,z,w,d,y,rows=1,columns=10){for(let r=0;r<rows;r++)for(let i=0;i<columns;i++){const colors=['red','green','yellow','blue','pink'];const pw=Math.min(100,w/columns-12),pd=Math.min(100,d/rows-8);box(g,x+(i+.5)*w/columns-pw/2,z+(r+.5)*d/rows-pd/2,pw,pd,150,colors[(i+r)%5],y);}}
 box('Floors',0,0,13900,8240,80,'floor',-80);box('Floors',0,8240,13900,2400,80,'backfloor',-80);
 // Existing exterior dimensions and family-shop cream/timber identity are retained.
 box('ExteriorWalls',-180,-180,180,11000,3860,'wall');box('ExteriorWalls',13900,-180,180,11000,3860,'wall');
 box('ExteriorWalls',0,10640,10975,180,3860,'wall');box('ExteriorWalls',12025,10640,1875,180,3860,'wall');box('ExteriorWalls',10975,10640,1050,180,1760,'wall',2100);
 for(const [x,w]of [[0,6000],[7900,6000]]){box('ExteriorWalls',x,-180,w,180,400,'wood');box('ExteriorWalls',x,-95,w,30,1800,'glass',400);}
 box('ExteriorWalls',6000,-90,1900,30,2200,'glass');box('ExteriorWalls',-180,-220,14260,220,500,'wood',2300);
 box('ExteriorWalls',-180,-180,14260,180,1060,'wall',2800);
 text('ExteriorWalls',6950,-260,2540,5600,'さくら商店','SAKURA SHOTEN','#6b4b33');
 // Rear partitions have actual openings: the supplied solid wall would trap staff.
 for(const [x,w]of [[0,3300],[4200,1000]])box('Partitions',x,8240,w,100,2600,'partition');
 for(const x of [1400,2400])for(const [z,d]of [[8340,960],[10200,440]])box('Partitions',x-50,z,100,d,2600,'partition');
 box('Partitions',5150,8240,50,2400,2600,'partition');
 box('Fixtures',250,9800,450,650,420,'top');box('Fixtures',250,10280,450,170,500,'top',420);box('Fixtures',1720,8420,450,400,780,'top');
 box('Fixtures',4100,8540,1000,2000,120,'futon');box('Fixtures',4200,10240,800,250,100,'blue',120);box('Fixtures',2600,8700,500,500,700,'wood');box('Fixtures',2500,10200,1400,350,300,'cream',1700);
 text('RoomLabels',1870,8290,2300,700,'手洗い','STAFF WASH','#62685d');text('RoomLabels',3750,8270,2300,850,'休憩室','STAFF REST','#62685d');
 // 5,200 x 2,200 cold room: 75 insulation, 700 racks and 1,350 clear lane.
 box('ColdRoom',5200,8240,75,2200,2500,'cold');box('ColdRoom',5200,10365,5200,75,2500,'cold');
 for(const [z,d]of [[8240,1060],[10200,240]])box('ColdRoom',10325,z,75,d,2500,'cold');
 box('Ceiling',5200,8240,5200,2200,75,'cold',2500);
 for(let s=0;s<5;s++){const y=300+s*380;box('ColdRoom',5275,8315,5050,700,28,'steel',y);productRun('Stock',5350,8400,4800,500,y+28,3,40);}
 for(let i=0;i<8;i++){const x=5400+i*600;box('ColdRoom',x,8220,590,50,210,'steel');box('ColdRoom',x,8220,590,50,150,'steel',2210);box('ColdRoom',x,8230,590,20,2000,'glass',210);box('ColdRoom',x+565,8190,18,30,420,'steel',1000);box('ColdRoom',x,8220,16,50,2360,'steel');}
 text('RoomLabels',7800,8190,2480,2600,'酒・ソフトドリンク','BEER / SAKE / DRINKS','#3e6578');
 // Receiving racks leave the relocated rear door and cold-room lane unobstructed.
 for(let y=150;y<1850;y+=420){box('Fixtures',13400,8340,500,1700,30,'steel',y);productRun('Stock',13430,8380,400,1600,y+30,9,3);}
 box('Fixtures',12350,10040,900,500,800,'blue');box('Fixtures',10600,8400,600,800,90,'steel',80);box('Fixtures',10600,9080,600,45,800,'steel');
 // Raised shift office with openings, low desk and observation glazing.
 box('Floors',11400,6200,2500,2040,150,'backfloor');
 box('Partitions',11400,6200,90,2040,850,'partition',150);box('Partitions',11400,6200,90,2040,500,'partition',2100);box('Partitions',11420,6350,25,1200,1000,'glass',1100);
 for(const[x,w]of[[11400,800],[13100,800]])box('Partitions',x,6200,w,100,2600,'partition');
 for(const[x,w]of[[10400,1600],[12900,1000]])box('Partitions',x,8240,w,100,2600,'partition');
 box('Fixtures',13200,6660,600,1100,720,'wood',150);box('Fixtures',11550,7660,450,450,650,'steel',150);box('Fixtures',12700,7100,450,450,420,'blue',150);
 box('Fixtures',13300,6900,350,400,300,'beige',870);box('Fixtures',13270,6930,25,320,220,'screen',920);
 // Full west chiller. Thin product cards sit on shelves instead of intersecting them.
 box('Fixtures',0,1200,700,7040,320,'cold');box('Fixtures',0,1200,90,7040,1800,'light',320);box('Fixtures',0,1200,700,7040,150,'green',1970);
 for(let s=0;s<4;s++){let y=520+s*350;box('Fixtures',90,1220,570,7000,25,'top',y);productRun('Stock',140,1270,450,6900,y+25,38,3);}
 text('RoomLabels',720,3550,2090,1600,'お弁当・おにぎり','BENTO / ONIGIRI','#285b48',Math.PI/2);
 const lines=[['パン・カップ麺','BREAD / NOODLES',1850],['菓子・おつまみ','SNACKS / CANDY',3800],['日用品・文具','DAILY GOODS',5750]];
 for(const[jp,en,x]of lines){let z=2400;box('Fixtures',x+415,z+450,70,3600,1350,'cream');box('Fixtures',x,z,900,4500,140,'cream');for(let y=320;y<=960;y+=320){for(const side of [0,500]){box('Fixtures',x+side,z+450,400,3600,24,'shelf',y);productRun('Stock',x+side+25,z+500,340,3500,y+24,18,3);}for(const zz of [z,z+4050]){box('Fixtures',x,zz,900,440,24,'shelf',y);productRun('Stock',x+25,zz+25,850,380,y+24,2,7);}}
  text('HangingSigns',x+450,2200,2300,1400,jp,en,x===3800?'#9b5738':'#285b48');
 }
 // Low freezer with stock below its glass lids.
 box('Fixtures',7700,2300,900,4500,760,'cold');box('Fixtures',7760,2360,780,4380,40,'glass',790);box('Fixtures',7700,2300,900,4500,35,'blue',755);
 productRun('Stock',7800,2400,700,4300,620,20,4);
 // All work surfaces share the accepted 780 mm datum (the supplied HTML used 850).
 box('Fixtures',11300,1400,800,4800,740,'wood');box('Fixtures',11300,1400,800,4800,40,'top',740);box('Fixtures',13300,1400,600,4800,740,'wood');box('Fixtures',13300,1400,600,4800,40,'steel',740);
 for(const z of [2800,4100]){box('Fixtures',11700,z,400,450,120,'beige',780);box('Fixtures',11720,z+50,350,350,270,'beige',900);box('Fixtures',12060,z+90,15,260,180,'screen',950);}
 box('Fixtures',11500,3450,500,500,80,'blue',780);
 for(const[z,d,h,mat]of[[4800,600,100,'steel'],[5400,350,580,'orange'],[5750,450,400,'orange']]){box('Fixtures',11650,z,450,d,h,mat,780);if(h>100)box('Fixtures',11640,z+15,10,d-30,h-30,'glass',800);}
 for(const z of [1550,1950])box('Fixtures',11650,z,260,260,340,'top',780);
 for(const z of [1800,2900]){box('Fixtures',13300,z,580,650,360,'steel',780);box('Fixtures',13290,z+40,12,560,250,'screen',840);}
 box('Fixtures',13300,4200,600,500,90,'cold',780);box('Fixtures',13500,4800,350,1300,750,'beige',1450);productRun('Stock',13470,4850,50,1200,1500,12,1);
 // Front row; future ATM is a marked bay, not an active 1997 machine.
 for(let s=0;s<3;s++){box('Fixtures',0,0,5800,550-s*120,320,'cream',s*310);productRun('Stock',80,80,5600,300,s*310+325,1,24);}
 box('Fixtures',5500,800,400,500,600,'blue');for(let i=0;i<3;i++)box('Fixtures',8200+i*470,0,440,600,850,'top');
 box('Fixtures',9700,0,600,800,1450,'beige');box('Fixtures',9790,770,420,15,300,'screen',1020);box('Fixtures',10400,0,1000,800,950,'beige');
 text('RoomLabels',11950,50,500,850,'将来用','RESERVED','#62685d');
 // Acoustic ceiling is separately hideable for inspection.
 box('Ceiling',0,0,13900,10640,60,'partition',2800);
 for(let x=0;x<=13900;x+=600)box('Ceiling',x,0,8,10640,8,'steel',2792);
 for(let z=0;z<=10640;z+=600)box('Ceiling',0,z,13900,8,8,'steel',2792);
 addCeilingAndSigns();
 function addCeilingAndSigns(){
  for(const z of [2000,5320,8600])for(const x of [2000,5500,9000]){box('Fluorescents',x-700,z-150,1400,300,80,'steel',2720);box('Fluorescents',x-600,z-60,1200,120,35,'light',2680);}
  // Each board spans Y=2.125..2.475; wires stop at 2.8 m, never above ceiling.
  const wireMat=new THREE.LineBasicMaterial({color:0x635f55});for(const[, ,x]of lines){box('HangingSigns',x-250,2175,1400,50,350,x===3800?'orange':'green',2125);const pts=[];for(const dx of [-.6,.6])pts.push(new THREE.Vector3((x+450)/1000+dx,2.475,-2.2),new THREE.Vector3((x+450)/1000+dx,2.8,-2.2));group('HangingSigns').add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),wireMat));}
 }
 // Roof, tank and compact external stair are visible in the roof inspection mode.
 box('Roof',-180,-180,14260,11000,150,'wall',3860);
 for(const x of [-100,13900])box('Roof',x,0,60,10640,1100,'steel',4010);
 box('Roof',0,0,13900,60,1100,'steel',4010);box('Roof',0,10600,13000,60,1100,'steel',4010);
 box('Roof',10100,7700,1600,1600,200,'steel',4010);const tank=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,1.2,24),mats.cold);tank.position.set(10.9,4.81,-8.5);tank.castShadow=true;group('Roof').add(tank);
 const rise=200.5;
 for(let i=0;i<9;i++){box('Roof',13000-(i+1)*250,10820,250,900,(i+1)*rise,'steel');box('Roof',10750+i*250,11840,250,900,(i+1)*rise,'steel',2005);}
 box('Roof',9850,10820,900,1920,120,'steel',1885);box('Roof',13000,10340,900,2400,120,'steel',3890);
 // Continuous rails follow both stair flights; roof gate remains clear.
 function rail(a,b){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),delta=q.clone().sub(p);const m=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,delta.length(),6),mats.steel);m.position.copy(p.add(q).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());group('Roof').add(m);}
 for(const z of [-10.82,-11.72])rail([13,1,z],[10.75,3.005,z]);
 for(const z of [-11.84,-12.74])rail([10.75,3.005,z],[13,5.01,z]);
 for(const x of [13,13.9])rail([x,5.01,-10.34],[x,5.01,-12.74]);
 rail([9.85,3.005,-10.82],[9.85,3.005,-12.74]);rail([9.85,3.005,-10.82],[10.75,3.005,-10.82]);rail([9.85,3.005,-12.74],[10.75,3.005,-12.74]);
 for(const [x,z,y]of [[13000,10820,0],[10750,10820,2005],[10750,11720,2005],[10750,11840,2005],[13000,11840,4010],[13000,12740,4010],[13900,12740,4010],[13900,10340,4010],[9850,10820,2005],[9850,12740,2005]])box('Roof',x-22,z-22,44,44,1000,'steel',y);
 // Material/parent batches reduce hundreds of boxes to a bounded draw set.
 const unit=new THREE.BoxGeometry(1,1,1),o=new THREE.Object3D();
 for(const b of batches.values()){const mesh=new THREE.InstancedMesh(unit,mats[b.mat],b.items.length);mesh.name=b.g+':'+b.mat;mesh.castShadow=b.mat!=='glass'&&b.mat!=='light';mesh.receiveShadow=true;for(let i=0;i<b.items.length;i++){const q=b.items[i];o.position.set((q.x+q.w/2)/1000,(q.y+q.h/2)/1000,-(q.z+q.d/2)/1000);o.scale.set(q.w/1000,q.h/1000,q.d/1000);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);}mesh.computeBoundingSphere();group(b.g).add(mesh);}
 groups.Ceiling.visible=false;groups.Roof.visible=false;groups.ExteriorWalls.visible=false;
 root.userData={groups,labels,solids,boxCount:[...batches.values()].reduce((n,b)=>n+b.items.length,0),pointLightsAdded:0,fixtureCount:9,ceilingHeight:2.8,signWireTop:2.8};
 return root;
}

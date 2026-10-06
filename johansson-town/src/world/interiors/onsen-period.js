import * as THREE from '../../../vendor/three.module.js';

// An older local bath still in service in 1997. Sources and inference limits:
// docs/qa/umi-no-yu-dfe99ddc/period-references.md. All surfaces are authored here.
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
export function ceramicTileMaterial(base=[139,170,173]){
 const size=256,color=new Uint8Array(size*size*4),relief=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,tx=x%64,ty=y%64,edge=Math.min(tx,ty,63-tx,63-ty),grout=edge<2;
  const glaze=Math.sin(tx/64*Math.PI)*Math.sin(ty/64*Math.PI),tone=(hash(Math.floor(x/64),Math.floor(y/64))-.5)*12,grain=(hash(x,y)-.5)*3;
  const c=grout?[175+grain,174+grain,160+grain]:base.map(v=>v+tone+grain+glaze*7);
  color.set([...c,255],i);const h=grout?40:170+glaze*35;relief.set([h,h,h,255],i);
  const r=grout?240:110+hash(x>>4,y>>4)*25;rough.set([r,r,r,255],i);
 }
 const tex=(data,srgb=false)=>{const t=new THREE.DataTexture(data,size,size);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=4;t.needsUpdate=true;return t;};
 const m=new THREE.MeshStandardMaterial({map:tex(color,true),bumpMap:tex(relief),bumpScale:.003,roughnessMap:tex(rough),roughness:.85});m.name='Aged glazed ceramic';return m;
}
export function sizeCeramic(m,w,d){
 const copy=m.clone();for(const key of ['map','bumpMap','roughnessMap']){copy[key]=m[key].clone();copy[key].repeat.set(w/.6,d/.6);copy[key].needsUpdate=true;}return copy;
}
export function wovenBasket(room,x,y,z){
 const g=new THREE.Group();g.name='Rattan basket';g.position.set(x,y,z);room.add(g);
 const material=new THREE.MeshStandardMaterial({color:0xbd945d,roughness:.94});
 const strips=[];
 // Open top, a woven bottom, and strips on four faces; no solid block of wicker.
 for(let i=0;i<15;i++){const p=-.18+i*.026;strips.push({p:[p,.009,0],s:[.014,.014,.38]},{p:[0,.018,p],s:[.38,.014,.014]});
  for(const side of [-1,1])strips.push({p:[p,.11,side*.19],s:[.014,.21,.013]},{p:[side*.19,.11,p],s:[.013,.21,.014]});}
 for(let i=0;i<7;i++)for(const side of [-1,1])strips.push({p:[0,.04+i*.026,side*.19],s:[.4,.012,.016]},{p:[side*.19,.04+i*.026,0],s:[.016,.012,.4]});
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,strips.length),o=new THREE.Object3D();mesh.name='Basket weave';
 strips.forEach(({p,s},i)=>{o.position.set(...p);o.scale.set(...s);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return g;
}
function sign(lines){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=512;c.height=384;const ctx=c.getContext?.('2d');if(!ctx?.fillRect)return null;
 ctx.fillStyle='#e9e0c9';ctx.fillRect(0,0,512,384);ctx.strokeStyle='#777b6b';ctx.lineWidth=8;ctx.strokeRect(8,8,496,368);ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=0;i<lines.length;i++){ctx.fillStyle=i?'#454b46':'#8c3b2b';ctx.font=`${i?30:46}px "Noto Sans CJK JP","Yu Gothic",sans-serif`;ctx.fillText(lines[i],256,65+i*75,470);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
export function buildOnsenPeriodDetails({room,box,cyl,mat,anchor,action,R}){
 const metal=mat(0xa5aba6,.48,{metalness:.45}),dark=mat(0x434e4d,.9),cream=mat(0xe1d4b3,.82);
 const group=new THREE.Group();group.name='Umi-no-yu period fittings';room.add(group);
 // Flush channels on the wet side: no raised lip across the central circulation route.
 for(const z of [-1.38,-4.18]){
  box([1.35,.007,.09],[.12,.004,z],dark,'Wet threshold drain',group);
  const grate=new THREE.InstancedMesh(new THREE.BoxGeometry(.009,.008,.085),metal,28),o=new THREE.Object3D();grate.name='Threshold drain grate';
  for(let i=0;i<28;i++){o.position.set(-.53+i*.048,.008,z);o.updateMatrix();grate.setMatrixAt(i,o.matrix);}group.add(grate);
 }
 // The non-electronic bath temperature instrument, in a guarded metal case.
 box([.1,.55,.035],[1.25,1.45,-1.31],cream,'Bath thermometer case',group);
 box([.012,.42,.008],[1.25,1.46,-1.335],mat(0xd2d5c5,.4),'Thermometer glass',group);
 box([.004,.26,.012],[1.25,1.38,-1.344],mat(0xa64f36,.5),'Thermometer column',group);
 for(let i=0;i<11;i++)box([i%5===0?.033:.02,.003,.008],[1.27,1.27+i*.034,-1.345],dark,'Thermometer graduation',group);
 anchor([1.1,1.45,-1.7],'Read the bath thermometer',()=>action('inspect','Bath thermometer','The guarded glass thermometer reads about 42°C. Higa-san checks the inlet and the temperature before the evening visitors arrive.'));
 const notice=sign(['ご入浴の前に','体を洗ってから湯船へ','タオルは湯船に入れない','WASH FIRST · KEEP TOWELS OUT']);
 if(notice){const m=new THREE.Mesh(new THREE.PlaneGeometry(.64,.48),new THREE.MeshStandardMaterial({map:notice,roughness:.88}));m.position.set(.95,1.72,-1.31);m.rotation.y=Math.PI; m.name='Enamel bathing notice';group.add(m);}
 // Water-mark deposits belong at the inlet and water line, rather than random grime.
 const deposit=mat(0xc0b697,.98);
 box([R.tub.maxX-R.tub.minX-.3,.025,.006],[(R.tub.minX+R.tub.maxX)/2,R.tub.water+.012,R.tub.maxZ-.143],deposit,'Mineral waterline',group);
 box([.006,.025,R.tub.maxZ-R.tub.minZ-.3],[R.tub.minX+.143,R.tub.water+.012,(R.tub.minZ+R.tub.maxZ)/2],deposit,'Mineral waterline',group);
 box([.28,.035,.018],[4.54,.63,-2.55],deposit,'Spout mineral deposit',group);
 // Ventilation high on the wet-room wall, represented by one grille draw call.
 box([.035,.32,.64],[-4.89,2.44,-2.95],cream,'Wet-room vent frame',group);
 const slats=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.016,.55),metal,9),o=new THREE.Object3D();slats.name='Vent louvres';
 for(let i=0;i<9;i++){o.position.set(-4.865,2.32+i*.03,-2.95);o.rotation.z=.25;o.updateMatrix();slats.setMatrixAt(i,o.matrix);}group.add(slats);
 return {group};
}

/** Original painted coast for the indoor bath; no copied photograph or advertising art. */
export function harbourMuralTexture(){
 if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext?.('2d');if(!ctx?.fillRect)return null;
 const sky=ctx.createLinearGradient(0,0,0,145);sky.addColorStop(0,'#87afb9');sky.addColorStop(1,'#dce0c4');ctx.fillStyle=sky;ctx.fillRect(0,0,768,256);
 ctx.fillStyle='#718d82';ctx.beginPath();ctx.moveTo(0,144);for(let x=0;x<=768;x+=12)ctx.lineTo(x,124-Math.sin(x*.013)*12-Math.cos(x*.027)*6);ctx.lineTo(768,190);ctx.lineTo(0,190);ctx.fill();
 ctx.fillStyle='#477c7b';ctx.fillRect(0,148,768,108);
 ctx.fillStyle='#466846';ctx.beginPath();ctx.moveTo(0,137);ctx.lineTo(90,120);ctx.lineTo(170,135);ctx.lineTo(222,150);ctx.lineTo(304,172);ctx.lineTo(0,189);ctx.fill();
 ctx.strokeStyle='#d9d1a6';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,189);ctx.quadraticCurveTo(150,183,304,172);ctx.stroke();
 for(let i=0;i<120;i++){const x=hash(i,3)*768,y=153+hash(i,5)*100;ctx.strokeStyle=i%3?'rgba(211,224,197,.27)':'rgba(36,71,72,.25)';ctx.lineWidth=1+hash(i,7)*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8+hash(i,9)*30,y-1);ctx.stroke();}
 for(let i=0;i<8;i++){const x=22+i*17,y=144+i*.8;ctx.fillStyle='#d9ccb0';ctx.fillRect(x,y,12,10);ctx.fillStyle='#a3573d';ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x+6,y-6);ctx.lineTo(x+14,y);ctx.fill();}
 ctx.strokeStyle='#e6e1c9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(545,161);ctx.lineTo(545,199);ctx.stroke();ctx.fillStyle='#ddd7b5';ctx.beginPath();ctx.moveTo(550,163);ctx.lineTo(575,186);ctx.lineTo(550,186);ctx.fill();ctx.fillStyle='#6d4c36';ctx.beginPath();ctx.moveTo(531,201);ctx.lineTo(575,201);ctx.lineTo(565,208);ctx.lineTo(539,208);ctx.fill();
 // Thin paint strokes and small losses at the lower edge of an old wall painting.
 for(let i=0;i<400;i++){ctx.fillStyle=i%2?'rgba(241,225,184,.05)':'rgba(53,69,65,.05)';ctx.fillRect(hash(i,11)*768,hash(i,12)*256,6+hash(i,13)*14,1);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

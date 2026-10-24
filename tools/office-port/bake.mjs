// Authoring only: freeze the real harbour into a compact, merged scene for the homepage.
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
import {chromium} from '../../johansson-town/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {resolve} from 'node:path';
const root=resolve(new URL('../..',import.meta.url).pathname),server=await serveGame({root,mounts:['johansson-town','tools']});
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto(server.url+'tools/office-port/render.html');await page.waitForFunction(()=>window.__READY__,null,{timeout:120000});
 const result=await page.evaluate(async()=>{
  const THREE=await import('/johansson-town/vendor/three.module.js');
  const {createStandIn}=await import('/johansson-town/src/render/static-props.js');
  const {mergeVertices}=await import('/johansson-town/vendor/BufferGeometryUtils.js');
  window.officePort.select('Johansson');window.officePort.frame();
  const source=window.officePort.world,region=new THREE.Box3(new THREE.Vector3(-40,-3,-105),new THREE.Vector3(50,24,0)),root=new THREE.Group();
  source.group.updateMatrixWorld(true);
  let included=0;
  source.group.traverse(o=>{
   if(!o.isMesh||o.isSkinnedMesh||!o.layers.isEnabled(0))return;
   for(let p=o;p;p=p.parent)if(!p.visible)return;
   const box=new THREE.Box3().setFromObject(o);if(!box.intersectsBox(region))return;
   const size=box.getSize(new THREE.Vector3());if(size.length()<.12)return;
   const clone=o.clone(false);clone.matrix.copy(o.matrixWorld);clone.matrixAutoUpdate=false;clone.userData={};root.add(clone);included++;
  });
  root.updateMatrixWorld(true);const stand=createStandIn(root,{name:'Minato harbour'});stand.group.updateMatrixWorld(true);
  const textures=new Map();
  for(const mesh of stand.group.children){
   mesh.geometry=mergeVertices(mesh.geometry,.001);mesh.material.userData={};mesh.castShadow=false;mesh.receiveShadow=false;
   for(const kind of ['map','normalMap','roughnessMap','metalnessMap','alphaMap','emissiveMap']){
    const tex=mesh.material[kind];if(!tex?.image)continue;
    if(!textures.has(tex.uuid)){const image=tex.image,canvas=document.createElement('canvas'),scale=Math.min(1,256/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');if(image.data){const src=document.createElement('canvas');src.width=image.width;src.height=image.height;const pixels=src.getContext('2d').createImageData(image.width,image.height),channels=image.data.length/(image.width*image.height);for(let i=0;i<image.width*image.height;i++)for(let c=0;c<4;c++)pixels.data[i*4+c]=c<channels?image.data[i*channels+c]*(image.data instanceof Float32Array?255:1):255;src.getContext('2d').putImageData(pixels,0,0);ctx.drawImage(src,0,0,canvas.width,canvas.height);}else ctx.drawImage(image,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/webp',.72);canvas.toDataURL=()=>data;const copy=tex.clone();copy.image=canvas;copy.needsUpdate=true;textures.set(tex.uuid,copy);}
    mesh.material[kind]=textures.get(tex.uuid);
   }
  }
  const json=stand.group.toJSON(),chunks=[];let offset=0,vertices=0,triangles=0;
  for(const g of json.geometries){
   for(const [name,a] of Object.entries(g.data.attributes)){
    let type=name==='normal'?'Int8Array':name==='color'?'Uint8Array':a.type;
    let array=name==='normal'?Int8Array.from(a.array,v=>Math.round(Math.max(-1,Math.min(1,v))*127)):name==='color'?Uint8Array.from(a.array,v=>Math.round(Math.max(0,Math.min(1,v))*255)):new globalThis[a.type](a.array);
    if(name==='position'){vertices+=array.length/3;const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){const c=i%3;min[c]=Math.min(min[c],array[i]);max[c]=Math.max(max[c],array[i]);}const range=max.map((v,c)=>v-min[c]||1);a.quantization={min,range};array=Uint16Array.from(array,(v,i)=>Math.round((v-min[i%3])/range[i%3]*65535));type='Uint16Array';}
    const bytes=new Uint8Array(array.buffer);chunks.push(bytes);a.bufferView={offset,length:bytes.length};a.type=type;a.normalized=name==='normal'||name==='color';delete a.array;offset+=bytes.length;
   }
   if(g.data.index){const a=g.data.index,arr=new globalThis[a.type](a.array);triangles+=arr.length/3;const bytes=new Uint8Array(arr.buffer);chunks.push(bytes);a.bufferView={offset,length:bytes.length};delete a.array;offset+=bytes.length;}
  }
  const ship=source.ferry.ferry;ship.updateMatrixWorld(true);
  const w=v=>ship.localToWorld(new THREE.Vector3(...v)).toArray();
  json.officePort={bridge:{actor:w([3.5,8.11,4.05]),from:w([6.9,13.1,2]),to:w([6.5,13.1,2.5]),target:w([1,3.6,12.75])}};
  const header=new TextEncoder().encode(JSON.stringify(json)),padding=(4-header.length%4)%4,buffer=new Uint8Array(4+header.length+padding+offset);new DataView(buffer.buffer).setUint32(0,header.length,true);buffer.set(header,4);let at=4+header.length+padding;for(const chunk of chunks){buffer.set(chunk,at);at+=chunk.length;}
  let binary='';for(let i=0;i<buffer.length;i+=32768)binary+=String.fromCharCode(...buffer.subarray(i,i+32768));
  return {data:btoa(binary),stats:{included,meshes:stand.group.children.length,vertices,triangles,bytes:buffer.length,headerBytes:header.length}};
 });
 await mkdir(resolve(root,'assets/office-port'),{recursive:true});const packed=gzipSync(Buffer.from(result.data,'base64'),{level:9});if(packed.length>4500000)throw Error('Harbour exceeds the 4.5 MB scene budget');
 await writeFile(resolve(root,'assets/office-port/harbour.scene.gz'),packed);await writeFile(resolve(root,'assets/office-port/scene.json'),JSON.stringify({...result.stats,gzipBytes:packed.length},null,2)+'\n');console.log({...result.stats,gzipBytes:packed.length});
}finally{await browser.close();await server.close();}

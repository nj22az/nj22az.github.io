// Compile first. Inspect the exact workshop builder shipped to World, without loading the whole island on SwiftShader.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import playwright from '../../johansson-town/node_modules/playwright/index.js';
import {serveGame} from '../../johansson-town/tools/mcp/static-server.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=root+'output/studio-mcp/workshop-qa/';await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(root+'johansson-town/runtime/.vite/manifest.json','utf8')),chunk=Object.values(manifest).find(m=>m.name==='compact-shops').file;
const history=JSON.parse(await readFile(root+'johansson-town/data/studio/rooms/dock-workshop.json','utf8')),release=history.releases.at(-1),table=release.layout?.objects.find(o=>o.id==='pattern-table')?.position||[3.2,0,.3];
const server=await serveGame({root,mounts:['johansson-town','avatar-creator']}),browser=await playwright.chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']}),errors=[];
try{
 for(const [width,height] of [[960,675],[390,844]]){
  const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),p=await c.newPage();p.setDefaultTimeout(90000);p.on('pageerror',e=>errors.push(e.message));await p.goto(server.url+'avatar-creator/?agent');
  const r=await p.evaluate(async({chunk,table,width,height})=>{
   const THREE=await import('/johansson-town/vendor/three.module.js'),module=await import('/johansson-town/runtime/'+chunk),factory=Object.values(module).find(f=>typeof f==='function'&&f.toString().includes('Workshop concrete floor'));
   if(!factory)throw Error('Compiled workshop builder is missing');
   const room=new THREE.Group(),colliders=[],targets=[],site={id:'form3d',title:'Dock Electrical & Repair Workshop',industrialWorkshop:true};
   const api=factory({site,room,collider:(x,z,w,d,height,minY=0)=>colliders.push({x,z,w,d,height,minY}),reg:(object,label)=>targets.push({object,label}),action(){},exit(){}});if(!await api.ready)throw Error('Compiled pump motor did not load');room.updateMatrixWorld(true);
   const at=room.getObjectByName('world-room:pattern-table').position.toArray(),hit=(x,z,r)=>colliders.some(b=>b.height>.15&&b.minY<1.65&&Math.hypot(Math.max(Math.abs(x-b.x)-b.w/2,0),Math.max(Math.abs(z-b.z)-b.d/2,0))<r);
   const report={table:at,expectedTable:table,doorBlocked:hit(0,2.9,.28),staffBlocked:[hit(-1.25,-1.9,.35),hit(1.5,-1.9,.35)],tableBlocked:hit(table[0],table[2],.1),targets:targets.map(t=>({label:t.label,position:t.object.getWorldPosition(new THREE.Vector3()).toArray()}))};
   const scene=new THREE.Scene();scene.background=new THREE.Color(0xe8e4d8);scene.add(room,new THREE.HemisphereLight(0xfff5e5,0x80949c,1.1));const sun=new THREE.DirectionalLight(0xfff3de,1.3);sun.position.set(4,7,3);scene.add(sun);
   const canvas=document.createElement('canvas');canvas.id='compiled-workshop';document.body.replaceChildren(canvas);document.body.style.margin='0';const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(width,height);renderer.outputColorSpace=THREE.SRGBColorSpace;
   const camera=new THREE.PerspectiveCamera(width<500?85:65,width/height,.05,50);camera.position.set(0,2.15,3.1);camera.lookAt(-.4,1.05,-1.5);renderer.render(scene,camera);const image=canvas.toDataURL('image/png');api.workshop.dispose();api.dispose();renderer.dispose();return {...report,image};
  },{chunk,table,width,height});
  assert.deepEqual(r.table,table);assert.equal(r.doorBlocked,false);assert.ok(r.staffBlocked.every(v=>!v));assert.equal(r.tableBlocked,true);assert.ok(r.targets.some(t=>/Play Star Port/.test(t.label)));assert.ok(r.targets.some(t=>/Form 3D/.test(t.label)));
  await writeFile(out+'compiled-world-'+width+'.png',Buffer.from(r.image.split(',')[1],'base64'));delete r.image;await writeFile(out+'compiled-world-'+width+'.json',JSON.stringify(r,null,2));await c.close();console.log('Compiled workshop builder passed:',width,'published revision',history.revision);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();await server.close();}

import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(new URL('../../johansson-town/package.json',import.meta.url))('playwright');
const base=process.env.STUDIO_TEST_URL||'http://127.0.0.1:8765',out=new URL('../../johansson-town/docs/qa/motion-terminal/',import.meta.url);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/avatar-creator/',{waitUntil:'domcontentloaded'});
 await page.locator('.shm-motion > summary').click({timeout:120000});
 await page.getByRole('button',{name:'Try wave',exact:true}).click();
 await page.locator('.shm-motion [role=status]').filter({hasText:'Playing'}).waitFor();
 const saved=page.waitForEvent('download');await page.getByRole('button',{name:'Save motion',exact:true}).click();const motionFile=await saved;const motion=JSON.parse(await readFile(await motionFile.path(),'utf8'));assert.equal(motion.format,'johansson-motion');assert.equal(motion.times.at(-1),3);
 const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export animated GLB',exact:true}).click();const file=await exported,bytes=await readFile(await file.path());assert.equal(bytes.readUInt32LE(0),0x46546c67);
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());assert.equal(json.animations.length,1);assert.ok(json.skins.length>0);
 await page.locator('.shm-motion input[type=file]').setInputFiles({name:'wave.glb',mimeType:'model/gltf-binary',buffer:bytes});
 await page.locator('.shm-motion [role=status]').filter({hasText:'Playing'}).waitFor();
 await page.screenshot({path:new URL('studio-desktop.png',out).pathname});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:new URL('studio-phone.png',out).pathname});
 assert.deepEqual(errors,[]);
 // Isolated native room preview. This verifies the real builder, not full-game navigation.
 const roomPage=await browser.newPage({viewport:{width:1280,height:800}}),roomErrors=[];roomPage.on('pageerror',e=>roomErrors.push(e.message));
 await roomPage.goto(base+'/');await roomPage.setContent('<style>html,body{margin:0;background:#d9d3c3;overflow:hidden}</style>');
 await roomPage.evaluate(async()=>{
  const THREE=await import('/johansson-town/vendor/three.module.js'),{buildPortHall}=await import('/johansson-town/src/world/interiors/port-hall.js');
  const scene=new THREE.Scene(),room=new THREE.Group();scene.add(room);const hall=buildPortHall({room,reg:(o,label,fn)=>{o.userData.hit={label,fn};},action(){}});hall.tick(1,780);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1280,800);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xd9d3c3);document.body.append(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(65,1280/800,.05,30);camera.position.set(.15,1.65,2.7);camera.lookAt(-.5,1.9,-2.6);renderer.render(scene,camera);
  window.terminalView=()=>{camera.position.set(-3.6,1.6,1.8);camera.lookAt(.5,1.7,-1.8);renderer.render(scene,camera);};
 });
 await roomPage.screenshot({path:new URL('terminal-counter.png',out).pathname});await roomPage.evaluate(()=>window.terminalView());await roomPage.screenshot({path:new URL('terminal-seating.png',out).pathname});assert.deepEqual(roomErrors,[]);
 console.log('Studio motion download/import/export, desktop/phone screenshots and native terminal room previews passed.');
}finally{await browser.close();}

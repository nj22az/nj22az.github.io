/** Isolated WebGL acceptance of Blender's garment candidate, not Creator integration.
 * node avatar-creator/render-skirt-runtime-candidate.mjs /absolute/study-folder
 */
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,basename} from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('../johansson-town/package.json',import.meta.url))('playwright');
const out=resolve(process.argv[2]);
const server=createServer(async(req,res)=>{
 try{
  if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated skirt candidate review</title>');return;}
  const name=basename(req.url),vendor=req.url.startsWith('/vendor/');
  if(!/^[\w.-]+$/.test(name))throw Error('Invalid path');
  const path=vendor?new URL('../johansson-town/vendor/'+name,import.meta.url):resolve(out,name);
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.glb')?'model/gltf-binary':'image/png');
  res.end(await readFile(path));
 }catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);
 const result=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{GLTFLoader}=await import('/vendor/GLTFLoader.js');
  const gltf=await new GLTFLoader().loadAsync('/Vy-skirt-runtime-candidate.glb');
  const scene=new THREE.Scene();scene.add(gltf.scene);
  scene.add(new THREE.HemisphereLight(0xffffff,0x676b70,2));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-2,3,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(2,1,-3);scene.add(rim);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(900,900);renderer.setClearColor('#e7e5e1');
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  const centre=new THREE.Vector3(0,-.24,.025),half=.26;
  const camera=new THREE.OrthographicCamera(-half,half,half,-half,.01,20);
  const meshes=[];gltf.scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
  const report={meshes:meshes.length,triangles:0,materials:[],morphs:[],images:[],drawCalls:0};
  for(const mesh of meshes){
   report.triangles+=(mesh.geometry.index?.count||mesh.geometry.attributes.position.count)/3;
   const m=mesh.material;
   report.materials.push({type:m.type,sheen:m.sheen,sheenColour:m.sheenColor?.toArray(),normalMap:!!m.normalMap,normalScale:m.normalScale?.toArray()});
   const keys=Object.keys(mesh.morphTargetDictionary||{});report.morphs.push(keys);
   if(keys.length!==6)throw Error('Missing six morph controls');
   for(let target=0;target<6;target++){
    mesh.morphTargetInfluences[target]=.75;
    const sample=new THREE.Vector3();mesh.getVertexPosition(0,sample);
    if(!sample.toArray().every(Number.isFinite))throw Error('Nonfinite morph output');
    mesh.morphTargetInfluences[target]=0;
   }
   if(!m.isMeshPhysicalMaterial||!m.normalMap||!(m.sheen>0))throw Error('Cloth material did not survive loading');
  }
  if(report.triangles!==1472)throw Error('Unexpected triangle budget');
  for(const angle of [0,60,120,180,270]){
   const a=angle*Math.PI/180;camera.position.copy(centre).add(new THREE.Vector3(3*Math.sin(a),.04,3*Math.cos(a)));camera.lookAt(centre);
   renderer.render(scene,camera);report.drawCalls=renderer.info.render.calls;
   report.images.push({name:'webgl-'+angle+'.png',data:renderer.domElement.toDataURL('image/png')});
  }
  renderer.dispose();return report;
 });
 for(const {name,data} of result.images)await writeFile(resolve(out,name),Buffer.from(data.split(',')[1],'base64'));
 delete result.images;result.pageErrors=errors;
 if(errors.length)throw Error(errors.join('\n'));
 result.scope='Actual project Three.js/GLTFLoader, Chromium software WebGL; isolated rest mesh only. No game integration or hardware performance acceptance.';
 await writeFile(resolve(out,'webgl-verification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}finally{await browser?.close();await new Promise(r=>server.close(r));}

/** Real WebGL shared-avatar review; no substitute image generation. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname),out=resolve(root,'docs/qa/thao-dress');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const file=resolve(root,'.'+new URL(req.url,'http://x').pathname);if(!file.startsWith(root+'/'))throw Error('outside');const b=await readFile(file);res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json'})[extname(file)]||'application/octet-stream');res.end(b);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH||'/tmp/johansson-chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={kind:'Actual WebGL shared avatar renderer; software Chromium; not physical-device acceptance',errors:[],views:[]};
try{
 const page=await browser.newPage({viewport:{width:900,height:1100}});page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/guide/residents.json');
 const captures=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{buildAvatar}=await import('/src/avatars/build.js'),{recipeFor}=await import('/src/avatars/cast.js'),{createAvatarAnimator}=await import('/src/avatars/animate.js');
  const canvas=document.createElement('canvas'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setSize(900,1100);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#e9eff2',1);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x71828a,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,-4);scene.add(key);
  const a=buildAvatar(recipeFor('Thao'),{shadows:false,faceSize:1024});scene.add(a.root);a.paintFace({expression:'neutral',blink:0,talk:0});
  const captures=[],h=a.height,camera=new THREE.OrthographicCamera(-.82,.82,1,-1,.1,20);
  for(const [name,angle,portrait] of [['game-front',0,false],['game-three-quarter',.55,false],['game-side',Math.PI/2,false],['game-back',Math.PI,false],['game-portrait',.15,true]]){
   const size=portrait?.78:1.85;camera.left=-size/2*900/1100;camera.right=-camera.left;camera.top=size/2;camera.bottom=-size/2;camera.updateProjectionMatrix();
   const y=portrait?h*.80:h*.51;camera.position.set(4*Math.sin(angle),y+.10,-4*Math.cos(angle));camera.lookAt(0,y,0);scene.updateMatrixWorld(true);a.body.skeleton.update();renderer.render(scene,camera);
   captures.push({name,png:canvas.toDataURL('image/png').split(',')[1]});
  }
  a.dispose();renderer.dispose();return captures;
 });
 for(const c of captures){await writeFile(resolve(out,c.name+'.png'),Buffer.from(c.png,'base64'));report.views.push(c.name);}
}finally{await browser.close();server.close();await writeFile(resolve(out,'webgl-report.json'),JSON.stringify(report,null,2)+'\n');}
if(report.errors.length)throw Error(report.errors.join('\n'));console.log('Rendered '+report.views.length+' real WebGL views');

import {createRequire} from 'node:module';
import {readFile,stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const {chromium}=createRequire(process.env.PLAYWRIGHT_PACKAGE||root+'/johansson-town/package.json')('playwright');
const server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!path.startsWith(root+'/'))throw Error();if((await stat(path)).isDirectory())path+='/index.html';res.setHeader('Content-Type',extname(path)==='.js'?'text/javascript':extname(path)==='.html'?'text/html':'application/octet-stream');res.end(await readFile(path));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.POSE_CHROME,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1600,height:1400},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.setContent('<style>body{margin:0}</style>');
 await page.evaluate(async({gesture,side})=>{
 const THREE=await import('/johansson-town/vendor/three.module.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js'),{createAvatarAnimator}=await import('/johansson-town/src/avatars/animate.js'),{applyHands}=await import('/johansson-town/src/avatars/hands.js');
 const a=buildAvatar(recipeFor('Johansson'),{articulatedHands:true,faceSize:1024}),anim=createAvatarAnimator(a,{initialTime:0,random:()=>.5});anim.play('Peace');for(let i=0;i<75;i++)anim.update(1/60,{speed:0});applyHands(a,{enabled:true,[side]:{preset:gesture},[side==='R'?'L':'R']:{preset:'relaxed'}});a.paintFace({expression:'smile',blink:0,talk:0});
 a.root.rotation.y=0;a.root.updateMatrixWorld(true);const sign=side==='R'?-1:1;const shoulder=a.bones['shoulder'+side],elbow=a.bones['elbow'+side],wrist=a.bones['hand'+side];if(gesture==='peace'||gesture==='open'){shoulder.rotation.set(0,0,sign*1.15);elbow.rotation.set(0,0,sign*1.99);wrist.rotation.set(0,0,0);}else if(gesture==='thumbsDown'){shoulder.rotation.set(-.80,0,sign*1.0);elbow.rotation.set(0,0,-sign*2.57);wrist.rotation.set(0,0,0);}else{shoulder.rotation.set(-.45,0,sign*.4);elbow.rotation.set(0,0,sign*1.17);wrist.rotation.set(0,0,0);}const scene=new THREE.Scene();scene.background=new THREE.Color('#e8e5dc');scene.add(a.root,new THREE.HemisphereLight(0xffffff,0x8896aa,1.8));const light=new THREE.DirectionalLight(0xffffff,2.2);light.position.set(-3,4,5);scene.add(light);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1600,1400);renderer.setPixelRatio(1);document.body.append(renderer.domElement);const camera=new THREE.PerspectiveCamera(28,1600/1400,.01,30),H=a.measure.H;camera.position.set(-.03,H*.68,2.5);camera.lookAt(-.03,H*.68,0);scene.updateMatrixWorld(true);renderer.render(scene,camera);window.captureAgain=()=>renderer.render(scene,camera);
 },{gesture:process.env.HAND_GESTURE||'peace',side:process.env.HAND_SIDE||'R'});await page.evaluate(()=>captureAgain());await page.screenshot({path:root+'/avatar-creator/experiments/connected-hands/johansson-'+(process.env.HAND_GESTURE||'peace')+'-'+(process.env.HAND_SIDE||'R')+'-'+(process.env.HAND_RENDER_TAG||'outlined')+'.png'});
}finally{await browser?.close();await new Promise(r=>server.close(r));}

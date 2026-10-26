#!/usr/bin/env node
/**
 * Review sheets of a Pixar body (src/avatars/pixar.js) in the game's own renderer (the town's ink pipeline), in headless
 * Chromium (software GL in a cloud session: judge shapes and lines, not speed).
 *
 *   node tools/pixar-sheet.mjs [name] [out-directory]        (default: Thuan, output/pixar)
 *
 * Two sheets: `<name>-eyes.png`, her rigged eyes close (at rest, looking about, through a blink, the feelings, turned),
 * and `<name>-body.png`, the whole body turned round and in a few of World's moves. TOWN_CHROMIUM_PATH points at
 * another Chromium.
 */
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {serveGame} from './mcp/static-server.mjs';

const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=createRequire(new URL('../../steam-deck/package.json',import.meta.url))('playwright');}
const name=process.argv[2]||'Thuan',out=resolve(process.argv[3]||'output/pixar');mkdirSync(out,{recursive:true});

// [label, face state, turn of the body (radians, + to her left)]
const EYES=[
 ['at rest',{expression:'neutral'},0],
 ['look left',{expression:'neutral',look:[-1,0]},0],
 ['look right',{expression:'neutral',look:[1,0]},0],
 ['look up',{expression:'neutral',look:[0,-1]},0],
 ['look down',{expression:'neutral',look:[0,1]},0],
 ['blink 0.5',{expression:'neutral',blink:.5},0],
 ['blink 1',{expression:'neutral',blink:1},0],
 ['wink (left)',{expression:'neutral',blinkLeft:1,blinkRight:0},0],
 ['three-quarter',{expression:'neutral',look:[.4,0]},.62],
 ['side',{expression:'neutral'},1.2],
 ['smile',{expression:'smile'},0],
 ['happy',{expression:'happy'},0],
 ['angry',{expression:'angry'},0],
 ['sad',{expression:'sad'},0],
 ['surprised',{expression:'surprised'},0],
 ['worried',{expression:'worried'},0],
 ['shy',{expression:'shy'},0],
 ['shock',{expression:'shock'},0],
 ['daze',{expression:'daze'},0],
 ['sleep',{expression:'sleep'},0],
 ['talking',{expression:'neutral',talk:1},0],
 ['grin',{expression:'happy',talk:0},0],
 ['laugh',{expression:'laugh'},0],
 ['grumpy',{expression:'grumpy'},0],
 ['wink',{expression:'wink'},0],
 ['kiss',{expression:'kiss'},0],
 ['smug',{expression:'smug'},0],
 ['pain',{expression:'pain'},0],
 ['scared',{expression:'scared'},0],
 ['cartoon today',{expression:'neutral'},0,true],
];
// [label, turn, move (animate.js gesture) or null, seconds into it]
const BODY=[['front',0],['three-quarter',.7],['side',Math.PI/2],['back',Math.PI],['walking',.5,'walk',.4],['wave',0,'Wave',.9],['think',.35,'Think',1.2],['cartoon today',0,null,0,true]];

const server=await serveGame(resolve(new URL('..',import.meta.url).pathname));
const browser=await playwright.chromium.launch({executablePath:process.env.TOWN_CHROMIUM_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(server.url+'src/avatars/face.js?pixar='+name.toLowerCase());
 const result=await page.evaluate(async({name,eyes,body})=>{
  const T=await import('/johansson-town/vendor/three.module.js'),{buildAvatar}=await import('/johansson-town/src/avatars/build.js'),{recipeFor}=await import('/johansson-town/src/avatars/cast.js');
  const {createInkPipeline}=await import('/johansson-town/src/render/ink-pipeline.js'),{loadPixarBodies}=await import('/johansson-town/src/avatars/pixar.js'),{createAvatarAnimator:createAnimator}=await import('/johansson-town/src/avatars/animate.js');
  // assets/ resolve against the page (assets.js): the game's folder, as on its own page
  const base=document.createElement('base');base.href='/johansson-town/';document.head.append(base);
  const got=await loadPixarBodies();if(!got.includes(name))throw new Error('no Pixar body for '+name);
  const scene=new T.Scene();scene.background=new T.Color('#c9d6cf');
  const fill=new T.HemisphereLight(0xffffff,0x887766,1.5),sun=new T.DirectionalLight(0xffffff,2);sun.position.set(2,5,4);scene.add(fill,sun);
  const pixar=buildAvatar(recipeFor(name),{shadows:false}),cartoon=buildAvatar(recipeFor(name),{shadows:false,pixar:null});
  for(const a of [pixar,cartoon]){a.root.rotation.y=0;scene.add(a.root);}
  pixar.pixar.smooth=false;   // each cell its feeling at once (the game eases between them)
  const report={name,triangles:0,cells:[]};pixar.root.traverse(o=>{if(o.isMesh&&o.visible&&o.geometry.index)report.triangles+=o.geometry.index.count/3;});
  const sheet=(cells,size,cols,draw)=>{
   const renderer=new T.WebGLRenderer({preserveDrawingBuffer:true});renderer.setSize(size[0],size[1]);
   const camera=new T.PerspectiveCamera(22,size[0]/size[1],.05,50),pipeline=createInkPipeline(renderer,{superScale:1,samples:0,fxaa:true});
   const rows=Math.ceil(cells.length/cols),c=document.createElement('canvas');c.width=cols*size[0];c.height=rows*(size[1]+22);
   const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
   cells.forEach((cell,i)=>{draw(cell,camera);scene.updateMatrixWorld(true);camera.updateProjectionMatrix();camera.updateMatrixWorld();
    pipeline.setCamera?.(camera);pipeline.render(r=>r.render(scene,camera));
    const x=(i%cols)*size[0],y=Math.floor(i/cols)*(size[1]+22);g.drawImage(renderer.domElement,x,y);
    g.fillStyle='#222';g.font='15px sans-serif';g.fillText(cell[0],x+8,y+size[1]+16);});
   pipeline.dispose();renderer.dispose();renderer.forceContextLoss();return c.toDataURL('image/png');
  };
  const show=a=>{pixar.root.visible=a===pixar;cartoon.root.visible=a===cartoon;};
  const headAt=a=>{a.root.updateMatrixWorld(true);return a.bones.head.getWorldPosition(new T.Vector3());};
  const eyesPng=sheet(eyes,[320,320],6,([label,state,turn,old],camera)=>{
   const a=old?cartoon:pixar;show(a);a.root.rotation.y=turn;
   for(const b of Object.values(a.bones))b.rotation.set(0,0,0);
   a.paintFace({blink:0,talk:0,look:[0,0],gaze:null,blinkLeft:undefined,blinkRight:undefined,...state});
   const h=headAt(a),up=old?a.measure.headCentre-a.measure.headY:.075;
   camera.position.set(h.x,h.y+up+.01,h.z+(old?1.55:.95));camera.lookAt(h.x,h.y+up,h.z);
   report.cells.push({label,showing:a.pixar?a.pixar.eyes.showing:null});
  });
  const anim=createAnimator(pixar),animOld=createAnimator(cartoon);
  const bodyPng=sheet(body,[300,520],8,([label,turn,move,t,old],camera)=>{
   const a=old?cartoon:pixar,an=old?animOld:anim;show(a);a.root.rotation.y=turn;a.root.position.set(0,0,0);
   for(const b of Object.values(a.bones))b.rotation.set(0,0,0);
   if(move==='walk'){for(let k=0;k<Math.round(t*60)+30;k++)an.update(1/60,{speed:1.4});}
   else if(move){an.play?.(move);for(let k=0;k<Math.round(t*60);k++)an.update(1/60,{});}
   else for(let k=0;k<30;k++)an.update(1/60,{});
   a.root.position.set(0,0,0);
   camera.position.set(0,.95,5.6);camera.lookAt(0,.82,0);
  });
  pixar.dispose();cartoon.dispose();
  return {report,eyesPng,bodyPng};
 },{name,eyes:EYES,body:BODY});
 writeFileSync(resolve(out,name+'-eyes.png'),Buffer.from(result.eyesPng.split(',')[1],'base64'));
 writeFileSync(resolve(out,name+'-body.png'),Buffer.from(result.bodyPng.split(',')[1],'base64'));
 writeFileSync(resolve(out,name+'.json'),JSON.stringify(result.report,null,1)+'\n');
 console.log(name,result.report.triangles,'triangles ->',out);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
}finally{await browser.close();await server.close();}

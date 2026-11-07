// The Pocket faces: the residents' heads, found by the camera's own face pack on their sticker sheets, drawn through the
// Pocket Look at the Game Boy Camera's 128 × 112 and scribbled over on the landmarks, as the Game Boy Camera's hidden
// faces were photographs of Nintendo's staff drawn on. They turn up when something goes wrong in Pocket Camera, and
// the sheet of them is unlocked by a game (camera/pocket-faces.js, camera/unlocks.js).
// Run from the repository root (Playwright's Chromium; the face pack and the Look engine run in the page):
//   node tools/draw-pocket-faces.mjs [--out camera/stickers/pocket-faces] [--sheet]   (--sheet also writes a contact sheet)
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {serveGame} from '../johansson-town/tools/mcp/static-server.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');

const args=process.argv.slice(2),opt={out:'camera/stickers/pocket-faces',sheet:false};
for(let i=0;i<args.length;i++){if(args[i]==='--sheet')opt.sheet=true;else if(args[i].startsWith('--'))opt[args[i].slice(2)]=args[++i];}
const out=resolve(opt.out);await mkdir(out,{recursive:true});

/**
 * The faces. `kind` is how the app asks for one (pocket-faces.js); `from` the sticker whose head it is; `marks` the
 * vandalism, drawn on the found landmarks; `line` what the face says (the sticker's own balloon line, and the caption
 * of the moment it belongs to); `gloss` names the face for whoever cannot see it.
 */
const FACES=[
 {kind:'run',from:'thuan-pixar/Fume',marks:['angryBrows','xEye:right','spiral:left'],line:'Who are you running from?',gloss:'Thuan, fuming, scribbled over: angry brows, a cross over one eye, a spiral on her cheek'},
 {kind:'hide',from:'thao-pixar/Shush',marks:['glasses','moustache'],line:'Who are you hiding from?',gloss:'Thao, shushing, scribbled over: round glasses and a curly moustache'},
 {kind:'oops',from:'thuan-pixar/JawDrop',marks:['sweat','scrawl','stubble'],line:'Well. That did not go to plan.',gloss:'Thuan, jaw dropped, scribbled over: sweat drops, a scrawl on the forehead, stubble'},
 {kind:'silly',from:'johansson-pixar/Huff',marks:['horns','monocle:right','spiral:left'],line:'Don’t be so silly!',gloss:'Johansson, huffing, scribbled over: devil horns, a monocle, a spiral on his cheek'},
 {kind:'full',from:'johansson-pixar/OhNo',marks:['tears:left','tears:right','zigzagMouth'],line:'Thirty photos. A Game Boy Camera would be full by now.',gloss:'Johansson, aghast, scribbled over: tears and a zigzag mouth'},
 {kind:'secret',from:'thao-pixar/Tada',marks:['partyHat','stars','blushLines'],line:'The secret sheet is yours!',gloss:'Thao, ta-da, scribbled over: a party hat, stars and blush lines'},
 {kind:'wait',from:'thuan-pixar/Eyeroll',marks:['glasses','beard','sweat'],line:'Still getting ready. Try again.',gloss:'Thuan, rolling her eyes, scribbled over: glasses, a beard and a sweat drop'},
 {kind:'nope',from:'johansson-pixar/Think',marks:['xEye:left','moustache','horns'],line:'That is not going to work.',gloss:'Johansson, thinking, scribbled over: a cross over one eye, a moustache and horns'},
];

const repo=fileURLToPath(new URL('../',import.meta.url));
const server=await serveGame({root:repo,mounts:['camera','johansson-town']});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>{throw e;});
 page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
 await page.goto(`${server.url}camera/looks-gl.js`);
 const made=await page.evaluate(async FACES=>{
  const looks=await import('/camera/looks-gl.js'),{findFaces}=await import('/camera/face-pack.js'),{loadStickerSets,stickerById}=await import('/camera/stickers.js');
  await loadStickerSets();
  const W=256,H=224;   // the Game Boy Camera's 128 × 112, two pixels a cell
  const gl=document.createElement('canvas');gl.width=W;gl.height=H;const engine=looks.createLookEngine(gl);
  const DARK='rgb(24,48,32)',LIGHT='rgb(200,212,138)';
  // A hand's wobble, the same every run.
  let seed=7;const rand=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
  const results=[];
  for(const face of FACES){
   const s=stickerById(face.from);if(!s)throw new Error(`no sticker ${face.from}`);
   const img=new Image();img.src=s.url;await img.decode();
   const iw=img.naturalWidth,ih=img.naturalHeight;
   // The head is small on a whole-figure sticker: the finder looks in a window round where a standing figure's head is,
   // then, failing that, at the whole sticker.
   let found=await findFaces(img,{max:1,around:{x:.5,y:.17}});
   if(!found.length)found=await findFaces(img,{max:1,around:{x:.5,y:.24}});
   if(!found.length)found=await findFaces(img,{max:1});
   if(!found.length){results.push({kind:face.kind,missing:true});continue;}
   const f=found[0];
   // The crop: the oval with room for the hair and a little of the shoulders, 8 by 7 as the Camera's picture is.
   let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of f.oval){x0=Math.min(x0,x*iw);y0=Math.min(y0,y*ih);x1=Math.max(x1,x*iw);y1=Math.max(y1,y*ih);}
   const oh=y1-y0,ch=oh*1.75,cw=ch*W/H,cx=(x0+x1)/2,cy=(y0+y1)/2-oh*.08;
   const crop={x:cx-cw/2,y:cy-ch/2,w:cw,h:ch};
   const photo=document.createElement('canvas');photo.width=W;photo.height=H;const g=photo.getContext('2d');
   // A grey wall behind the head, lit from the top left, as a staff photograph's background.
   const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#cfcfcf');bg.addColorStop(1,'#8a8a8a');g.fillStyle=bg;g.fillRect(0,0,W,H);
   g.imageSmoothingQuality='high';g.drawImage(img,crop.x,crop.y,crop.w,crop.h,0,0,W,H);
   engine.setSource('face',photo,W,H);
   const px=engine.render(looks.normalRecipe({layers:[{look:'pocket'}]}),{source:'face',width:W,height:H});
   const art=document.createElement('canvas');art.width=W;art.height=H;const a=art.getContext('2d');
   a.putImageData(new ImageData(px.data,W,H),0,0);
   // The landmarks in the crop's pixels.
   const P=([x,y])=>[(x*iw-crop.x)*W/crop.w,(y*ih-crop.y)*H/crop.h];
   const centre=loop=>{let sx=0,sy=0;for(const p of loop){const [x,y]=P(p);sx+=x;sy+=y;}return [sx/loop.length,sy/loop.length];};
   const eyeL=P([f.eyes[0].x,f.eyes[0].y]),eyeR=P([f.eyes[1].x,f.eyes[1].y]);
   const mouth=centre(f.lipsOuter),nose=P(f.noseTip),forehead=P(f.forehead),chin=P(f.chin),cheekL=P(f.cheekL),cheekR=P(f.cheekR),browL=centre(f.browL),browR=centre(f.browR);
   const eyeW=Math.hypot(eyeR[0]-eyeL[0],eyeR[1]-eyeL[1]);
   // The marks are sized to the face (a fifth of the eye distance), not to the iris, which is small on a drawn face.
   const r=Math.max(f.eyes[0].r*iw*W/crop.w,eyeW*.2);
   const pick=side=>side==='left'?{eye:eyeL,cheek:cheekL,brow:browL}:{eye:eyeR,cheek:cheekR,brow:browR};
   a.strokeStyle=DARK;a.fillStyle=DARK;a.lineCap='round';a.lineJoin='round';a.lineWidth=4;
   const wob=k=>(rand()-.5)*k;
   // A stroke drawn by hand: short pieces, each a little off.
   const stroke=pts=>{a.beginPath();pts.forEach(([x,y],i)=>{const X=x+wob(1.6),Y=y+wob(1.6);i?a.lineTo(X,Y):a.moveTo(X,Y);});a.stroke();};
   // A mark over the hair: a light halo first, so the marker shows on the dark.
   const haloed=pts=>{a.save();a.strokeStyle=LIGHT;a.lineWidth=9;stroke(pts);a.restore();stroke(pts);};
   const arc=(x,y,rad,from,to,n=18)=>{const pts=[];for(let i=0;i<=n;i++){const t=from+(to-from)*i/n;pts.push([x+Math.cos(t)*rad,y+Math.sin(t)*rad]);}return pts;};
   const draw={
    'xEye':side=>{const {eye}=pick(side);const d=r*1.5;stroke([[eye[0]-d,eye[1]-d],[eye[0]+d,eye[1]+d]]);stroke([[eye[0]+d,eye[1]-d],[eye[0]-d,eye[1]+d]]);},
    'spiral':side=>{const {cheek}=pick(side);const pts=[];for(let i=0;i<=40;i++){const t=i/40*Math.PI*5,rad=r*.25+t/(Math.PI*5)*r*1.7;pts.push([cheek[0]+Math.cos(t)*rad,cheek[1]+Math.sin(t)*rad]);}stroke(pts);},
    'glasses':()=>{for(const eye of [eyeL,eyeR])stroke(arc(eye[0],eye[1],r*2.1,0,Math.PI*2,28));stroke([[eyeL[0]+r*2.1,eyeL[1]],[eyeR[0]-r*2.1,eyeR[1]]]);stroke([[eyeL[0]-r*2.1,eyeL[1]],[eyeL[0]-r*3.4,eyeL[1]-r*.6]]);stroke([[eyeR[0]+r*2.1,eyeR[1]],[eyeR[0]+r*3.4,eyeR[1]-r*.6]]);},
    'monocle':side=>{const {eye}=pick(side);stroke(arc(eye[0],eye[1],r*2.2,0,Math.PI*2,28));const pts=[];for(let i=0;i<=14;i++)pts.push([eye[0]+r*2.2+Math.sin(i*1.2)*r*.5,eye[1]+r*.6+i*r*.55]);stroke(pts);},
    'moustache':()=>{const y=(nose[1]*.45+mouth[1]*.55),w=eyeW*.75;const pts=[];for(let i=0;i<=24;i++){const t=i/24,x=nose[0]-w/2+w*t;pts.push([x,y-Math.sin(t*Math.PI)*r*.9+Math.sin(t*Math.PI*6)*r*.35]);}stroke(pts);stroke(arc(nose[0]-w/2,y-r*.3,r*.7,Math.PI*.3,Math.PI*1.3,10));stroke(arc(nose[0]+w/2,y-r*.3,r*.7,Math.PI*1.7,Math.PI*2.7,10));},
    'angryBrows':()=>{for(const [brow,sign] of [[browL,1],[browR,-1]])stroke([[brow[0]-sign*r*2,brow[1]-r*.9],[brow[0]+sign*r*1.6,brow[1]+r*.7]]);},
    'horns':()=>{const top=forehead[1]-r*.4;for(const sign of [-1,1]){const x=forehead[0]+sign*eyeW*.55;stroke([[x-r*1.1,top+r*.2],[x,top-r*2.6],[x+r*1.1,top+r*.2]]);}},
    'tears':side=>{const {eye}=pick(side);for(let k=0;k<2;k++){const x=eye[0]+(k?r*.8:-r*.8),y0=eye[1]+r*1.6+k*r*.5;stroke([[x,y0],[x+wob(.5),y0+r*1.8]]);stroke(arc(x,y0+r*2.1,r*.5,0,Math.PI*2,10));}},
    'zigzagMouth':()=>{const w=eyeW*.9,pts=[];for(let i=0;i<=8;i++)pts.push([mouth[0]-w/2+w*i/8,mouth[1]+(i%2?r*.7:-r*.7)]);stroke(pts);},
    'sweat':()=>{const x=eyeR[0]+eyeW*.6,y=eyeR[1]-r*1.2;stroke([[x,y],[x-r*.6,y+r*1.8],[x+r*.6,y+r*1.8],[x,y]]);stroke([[x+r*1.5,y+r*.8],[x+r*1.2,y+r*2.4]]);},
    'scrawl':()=>{const pts=[];for(let i=0;i<=30;i++)pts.push([forehead[0]-eyeW*.5+eyeW*i/30,forehead[1]+r*.2+Math.sin(i*2.3)*r*.8+wob(2)]);stroke(pts);},
    'stubble':()=>{for(let i=0;i<40;i++){const x=chin[0]+(rand()-.5)*eyeW*1.4,y=chin[1]-r*2.2+(rand()-.3)*r*3;if(Math.abs(x-mouth[0])<eyeW*.4&&Math.abs(y-mouth[1])<r)continue;a.fillRect(Math.round(x),Math.round(y),3,3);}},
    'beard':()=>{const pts=[];for(let i=0;i<=24;i++){const t=i/24;pts.push([chin[0]-eyeW*.7+eyeW*1.4*t,chin[1]-r*.8+Math.sin(t*Math.PI)*r*2.4+Math.sin(t*Math.PI*9)*r*.6]);}stroke(pts);},
    'partyHat':()=>{const x=forehead[0],y=forehead[1]-r*.6,w=eyeW*1.0,h=eyeW*1.5;haloed([[x-w/2,y],[x,y-h],[x+w/2,y],[x-w/2,y]]);for(let i=1;i<4;i++)haloed([[x-w/2*(1-i/4),y-h*i/4],[x+w/2*(1-i/4),y-h*i/4]]);haloed(arc(x,y-h,r*.6,0,Math.PI*2,10));},
    'stars':()=>{for(const [dx,dy] of [[-1.25,-.1],[1.25,-.3],[-1.2,.9],[1.25,.8]]){const x=forehead[0]+dx*eyeW,y=forehead[1]+dy*eyeW+r;for(const seg of [[[x-r,y],[x+r,y]],[[x,y-r],[x,y+r]],[[x-r*.6,y-r*.6],[x+r*.6,y+r*.6]],[[x+r*.6,y-r*.6],[x-r*.6,y+r*.6]]])haloed(seg);}},
    'blushLines':()=>{for(const cheek of [cheekL,cheekR])for(let k=-1;k<=1;k++)stroke([[cheek[0]+k*r*.9-r*.5,cheek[1]-r*.7],[cheek[0]+k*r*.9+r*.5,cheek[1]+r*.7]]);},
   };
   for(const mark of face.marks){const [name,side]=mark.split(':');draw[name](side);}
   // Twice the size, pixel for pixel, so the cells stay crisp as a sticker.
   const big=document.createElement('canvas');big.width=W*2;big.height=H*2;const b=big.getContext('2d');b.imageSmoothingEnabled=false;b.drawImage(art,0,0,W*2,H*2);
   results.push({kind:face.kind,url:big.toDataURL('image/png'),thumb:art.toDataURL('image/png'),width:W*2,height:H*2,eyeR:+r.toFixed(1)});
  }
  return results;
 },FACES);
 const stickers=[];
 for(const m of made){
  const face=FACES.find(f=>f.kind===m.kind);
  if(m.missing){console.error(`${m.kind}: no face found on ${face.from}`);continue;}
  await writeFile(join(out,`${m.kind}.png`),Buffer.from(m.url.split(',')[1],'base64'));
  await writeFile(join(out,`${m.kind}.thumb.png`),Buffer.from(m.thumb.split(',')[1],'base64'));
  stickers.push({id:`pocket-faces/${m.kind}`,src:`pocket-faces/${m.kind}.png`,thumb:`pocket-faces/${m.kind}.thumb.png`,width:m.width,height:m.height,line:face.line,gloss:face.gloss,from:face.from});
  console.log(`${m.kind}: ${face.from}, eye radius ${m.eyeR} px`);
 }
 const manifest={id:'pocket-faces',name:'Pocket faces',tab:'Faces',who:'',kind:'secret',locked:'game',source:'tools/draw-pocket-faces.mjs',
  note:'The faces that turn up when something goes wrong, as the Game Boy Camera had them: the residents, scribbled over.',stickers};
 await writeFile(join(out,'..','pocket-faces.json'),JSON.stringify(manifest,null,1)+'\n');
 if(opt.sheet){
  const sheet=await page.evaluate(async made=>{
   const c=document.createElement('canvas');c.width=512*4;c.height=448*2+40;const g=c.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,c.width,c.height);
   let i=0;for(const m of made){if(m.missing)continue;const img=new Image();img.src=m.url;await img.decode();g.drawImage(img,(i%4)*512,Math.floor(i/4)*(448+20)+20);g.fillStyle='#fff';g.font='bold 16px system-ui';g.fillText(m.kind,(i%4)*512+8,Math.floor(i/4)*(448+20)+14);i++;}
   return c.toDataURL('image/png');
  },made);
  await writeFile(join(out,'..','pocket-faces-sheet.png'),Buffer.from(sheet.split(',')[1],'base64'));
 }
 console.log(`${stickers.length} of ${FACES.length} faces written to ${out}`);
}finally{await browser.close();await server.close();}

import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from '../avatars/build.js';
import {createAvatarAnimator,GESTURES} from '../avatars/animate.js';
import {recipeFor} from '../avatars/cast.js';
import {drawBackground,drawFaceFx,drawSfx} from './manga-fx.js';
import {buildServingDrink} from '../people/izakaya-serving-visuals.js';
import {fitAvatarHeldProp,poseAvatarConsumption} from '../avatars/consume.js';

/**
 * Draws the storyteller's comics in the browser, as a Sunday funny page: rounded panels in a
 * grid. Every panel is shot inside a real place. tools/render-feed-backdrops.mjs captured each
 * place from the game with its camera, a depth map and the spots a resident can stand, sit or
 * lean at; here the same camera is rebuilt, the room's depth is written first and the residents
 * (live avatar recipes, posed by the photo studio's animator) are drawn into it, so counters,
 * tables and doorways hide them as the room would. Bubbles, marks and sound effects go on top.
 */
const PAGE=1080,GAP=18,RADIUS=22,INK='#111';
const FONT='"LINE Seed JP","Noto Sans JP","Hiragino Sans",system-ui,sans-serif';
const VIEW_W=1600,VIEW_H=1200;
let renderer=null,views=null;const images=new Map();

export function releaseComicRenderer(){renderer?.dispose();renderer?.forceContextLoss();renderer=null;}
function context(w,h){
 if(!renderer){renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.autoClear=false;}
 renderer.setSize(w,h,false);return renderer;
}
const load=url=>{if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Missing comic set: '+url));img.src=url;}));return images.get(url);};
async function placeViews(base){views??=fetch(base+'assets/images/feed/views.json').then(r=>r.ok?r.json():{}).catch(()=>({}));return views;}

function pose(avatar,name,expression,seatHeight){
 const animator=createAvatarAnimator(avatar),duration=GESTURES[name],time=Number.isFinite(duration)?duration*.43:.7;
 if(duration)animator.play(name);
 const steps=Math.max(1,Math.ceil(time/.025));
 for(let i=0;i<steps;i++)animator.update(time/steps,{expression,seated:name==='Sit',seatHeight:seatHeight??.48});
 avatar.paintFace({expression,blink:0,talk:0,look:[0,0]});
}

/** Wraps at spaces; a word longer than the line is broken only as a last resort. */
function wrap(ctx,text,maxW,maxLines){
 const lines=[];let line='';
 for(const word of String(text).split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width<=maxW||!line){line=next;continue;}lines.push(line);line=word;}
 if(line)lines.push(line);
 if(lines.length>maxLines){const kept=lines.slice(0,maxLines);kept[maxLines-1]=kept[maxLines-1].replace(/\s*\S*$/,'')+'…';return kept;}
 return lines;
}
/** A speech bubble with its tail on the speaker, or a narration box when nobody speaks. */
function bubble(ctx,text,w,h,{x,y,maxW,tx=null,ty=null}){
 if(!text)return;
 const size=w<420?19:22;ctx.font=`700 ${size}px ${FONT}`;
 const lh=size*1.32,lines=wrap(ctx,text,maxW,4),bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+32,bh=lines.length*lh+22;
 const left=Math.max(10,Math.min(w-bw-10,x-bw/2)),top=Math.max(10,y);
 ctx.lineWidth=3;ctx.strokeStyle=INK;ctx.fillStyle='#fff';
 ctx.beginPath();ctx.roundRect(left,top,bw,bh,tx==null?8:22);ctx.fill();ctx.stroke();
 if(tx!=null&&ty>top+bh+8){
  const bx=Math.max(left+24,Math.min(left+bw-24,tx)),by=top+bh,tipY=Math.min(ty,by+52);
  ctx.beginPath();ctx.moveTo(bx-12,by-2);ctx.lineTo(tx,tipY);ctx.lineTo(bx+12,by-2);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(bx-12,by);ctx.lineTo(tx,tipY);ctx.lineTo(bx+12,by);ctx.stroke();
 }
 ctx.fillStyle=INK;ctx.textBaseline='middle';ctx.textAlign='left';
 lines.forEach((line,i)=>ctx.fillText(line,left+16,top+11+lh/2+i*lh));
}

/**
 * The Sunday page: establishing shots and stares take a whole row, the rest share rows of two,
 * or three when a run of panels is odd.
 */
export function pageLayout(panels){
 const full=p=>p.shot==='wide'||p.shot==='eyes';
 const rows=[];let run=[];
 const flush=()=>{while(run.length){const n=run.length===3||run.length===5?3:run.length===1?1:2;rows.push(run.splice(0,n));}};
 panels.forEach((p,i)=>{if(full(p)){flush();rows.push([i]);}else run.push(i);});flush();
 const cells=[];let y=GAP;
 for(const row of rows){
  const one=panels[row[0]],h=row.length===1?(one.shot==='eyes'?240:410):row.length===2?440:360,w=(PAGE-GAP*(row.length+1))/row.length;
  row.forEach((index,k)=>cells[index]={x:Math.round(GAP+k*(w+GAP)),y,w:Math.round(w),h});
  y+=h+GAP;
 }
 return {width:PAGE,height:y,cells};
}

/** Draws the room's depth (and nothing else) so the residents are hidden behind what is in front of them. */
function depthPass(r,camera,depthTex,data){
 const view=camera.view;
 const m=new THREE.ShaderMaterial({uniforms:{tex:{value:depthTex},far:{value:data.depthFar},near:{value:camera.near},cfar:{value:camera.far},
   offset:{value:new THREE.Vector4(view.offsetX/view.fullWidth,1-(view.offsetY+view.height)/view.fullHeight,view.width/view.fullWidth,view.height/view.fullHeight)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:'uniform sampler2D tex;uniform float far,near,cfar;uniform vec4 offset;varying vec2 vUv;void main(){vec2 uv=offset.xy+vUv*offset.zw;vec4 c=texture2D(tex,uv);float z=(c.r*255.*256.+c.g*255.)/65535.*far;gl_FragDepth=z>=far*.999?1.:clamp((1./near-1./z)/(1./near-1./cfar),0.,1.);gl_FragColor=vec4(0.);}',
  colorWrite:false,depthWrite:true,depthTest:false});
 const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m),scene=new THREE.Scene();quad.frustumCulled=false;scene.add(quad);
 r.render(scene,new THREE.Camera());quad.geometry.dispose();m.dispose();
}

/**
 * Where the residents stand in a place, once per strip so every panel agrees: open spots a
 * conversation apart near the middle of the pushed-in view; sometimes a seat for the first.
 */
function blocking(set,count,seed,sitting=false){
 const view=set.push||set.wide;let s=seed;const rand=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 // Spots from every view of the place, seen through the pushed-in camera that most panels use:
 // open floor a comfortable distance away, side by side across the picture rather than one
 // behind the other.
 const camera=sceneCamera(view),cam=camera.position;
 const seen=list=>{const out=[],keys=new Set();for(const v of Object.values(set))for(const a of v.spots[list]){const key=Math.round(a[0]/.4)+','+Math.round(a[2]/.4);if(keys.has(key))continue;keys.add(key);
  const q=new THREE.Vector3(a[0],a[1],a[2]).project(camera);if(q.z<1&&Math.abs(q.x)<.8&&q.y>-1&&q.y<.6)out.push({x:a[0],y:a[1],z:a[2],sx:(q.x+1)/2,d:Math.hypot(a[0]-cam.x,a[2]-cam.z)});}return out;};
 const good=a=>Math.abs(a.d-3.2)+Math.abs(a.sx-.5)*2;
 const stands=seen('stand').filter(a=>a.d>2&&a.d<6).sort((a,b)=>good(a)-good(b)),seats=seen('seat').sort((a,b)=>good(a)-good(b));
 const pick=[];
 // Sitting together: two seats a conversation apart (across a table, along a counter or bench).
 if(sitting&&seats.length>1){
  outer:for(const a of seats.slice(0,8))for(const b of seats){const d=Math.hypot(a.x-b.x,a.z-b.z);if(a!==b&&d>.55&&d<2.2&&Math.abs(a.sx-b.sx)>.08){pick.push({...a,seat:true},{...b,seat:true});break outer;}}
 }
 if(sitting&&!pick.length&&seats.length&&rand()<.8)pick.push({...seats[Math.floor(rand()*Math.min(3,seats.length))],seat:true});
 const fits=(spot,min)=>pick.every(p=>{const d=Math.hypot(p.x-spot.x,p.z-spot.z);return d>min&&d<2.4&&Math.abs(p.sx-spot.sx)>.13&&Math.abs(p.d-spot.d)<1.2;});
 for(const min of [1,.8,.6])for(const spot of stands){if(pick.length>=count)break;if(fits(spot,min))pick.push({...spot,seat:false});}
 for(const spot of stands){if(pick.length>=count)break;if(!pick.some(p=>p.x===spot.x&&p.z===spot.z))pick.push({...spot,seat:false});}
 return pick.map(p=>({x:p.x,y:p.seat?view.floor:p.y,z:p.z,seat:p.seat?p.y-view.floor:null}));
}

const VIEWS={wide:'wide',medium:'push',close:'push',low:'low',high:'high',dutch:'push','close-thing':'push'};

function sceneCamera(data){
 const c=new THREE.PerspectiveCamera(data.camera.fov,data.camera.aspect,.1,200);
 c.position.fromArray(data.camera.position);c.quaternion.fromArray(data.camera.quaternion);c.updateMatrixWorld(true);return c;
}

/** Renders a strip ({panels, place}) as one Sunday-page image; returns a data URL. */
export async function renderComic({panels,place,props={},sitting=false},{base='./',quality=.86}={}){
 // The lettering is set in the interface face; wait for it so the first page is not in a fallback.
 try{await Promise.all(['700 22px','800 40px'].map(f=>document.fonts?.load(f+' "LINE Seed JP"')));}catch{}
 const set=(await placeViews(base))[place];
 const layout=pageLayout(panels);
 const page=document.createElement('canvas');page.width=layout.width;page.height=layout.height;
 const out=page.getContext('2d');out.fillStyle='#fff';out.fillRect(0,0,page.width,page.height);
 const names=[...new Set(panels.flatMap(p=>p.actors.map(a=>a.name)))];
 const cast=new Map(names.map(name=>{const avatar=buildAvatar(recipeFor(name),{shadows:false,faceSize:512}),holder=new THREE.Group();holder.add(avatar.root);avatar.root.rotation.y=0;return [name,{avatar,holder}];}));
 const seed=[...place+names.join()].reduce((a,c)=>(a*31+c.charCodeAt(0))%2147483647,7)||7;
 // Everyone keeps their spot for the whole strip; a resident who walks in late gets one of their own.
 // Seats are found by their height alone, without the way they face, so for now everyone
 // stands; sitting returns with the rooms' own seat data.
 const marks=set?blocking(set,names.length,seed,false&&sitting):null,markOf=new Map(names.map((n,j)=>[n,marks?.[j]??null]));
 try{
  for(const [i,p] of panels.entries()){
   const cell=layout.cells[i],w=cell.w,h=cell.h;
   const panel=document.createElement('canvas');panel.width=w;panel.height=h;const ctx=panel.getContext('2d');
   const shot=p.shot||'medium',scene=new THREE.Scene();
   const actors=p.actors.map(a=>({...a,...cast.get(a.name),mark:markOf.get(a.name),drink:props[a.name]||null}));
   if(set&&shot!=='eyes'&&actors.every(a=>a.mark))await drawSetPanel({ctx,w,h,set,p,shot,actors,scene,base,place,i});
   else await drawStudioPanel({ctx,w,h,p,shot,actors,scene,base,place,i});
   // A rounded panel with an ink border, set into the page.
   out.save();out.beginPath();out.roundRect(cell.x,cell.y,w,h,RADIUS);out.clip();out.drawImage(panel,cell.x,cell.y);out.restore();
   out.lineWidth=4;out.strokeStyle=INK;out.beginPath();out.roundRect(cell.x+2,cell.y+2,w-4,h-4,RADIUS-2);out.stroke();
  }
 }finally{
  for(const c of cast.values()){c.avatar.body.skeleton.dispose();c.avatar.dispose();}
  renderer?.renderLists.dispose();
 }
 return page.toDataURL('image/webp',quality);
}

/** A panel inside the captured room: backdrop, depth, residents on their spots, then the lettering. */
async function drawSetPanel({ctx,w,h,set,p,shot,actors,scene,base,place,i}){
 const viewName=set[VIEWS[shot]]?VIEWS[shot]:set.push?'push':'wide',data=set[viewName];
 const [img,depthImg]=await Promise.all([load(`${base}assets/images/feed/${place}-${viewName}.webp`),load(`${base}assets/images/feed/${place}-${viewName}-depth.webp`)]);
 const camera=sceneCamera(data),show=shot!=='close-thing';
 // Stage the residents on their marks, turned towards the camera and a little towards each other.
 const centre=new THREE.Vector3();actors.forEach(a=>centre.add(new THREE.Vector3(a.mark.x,0,a.mark.z)));centre.divideScalar(actors.length);
 for(const a of actors){
  a.holder.position.set(a.mark.x,a.mark.y,a.mark.z);
  const toCam=Math.atan2(camera.position.x-a.mark.x,camera.position.z-a.mark.z),toOther=Math.atan2(centre.x-a.mark.x,centre.z-a.mark.z);
  const turn=actors.length>1?Math.atan2(Math.sin(toOther-toCam),Math.cos(toOther-toCam)):0;
  // In conversation they face each other, opened a little to the camera, as on a stage.
  a.holder.rotation.y=actors.length>1?toCam+Math.max(-1.15,Math.min(1.15,turn*.78)):toCam;
  const sit=a.mark.seat!=null&&!['Crouch','Bow','HeelKick','Kachashi'].includes(a.pose);
  pose(a.avatar,sit?'Sit':a.pose,a.expression,a.mark.seat);
  if(show)scene.add(a.holder);
 }
 scene.updateMatrixWorld(true);actors.forEach(a=>a.avatar.body.skeleton.update());
 holdDrinks(actors,i);
 scene.updateMatrixWorld(true);actors.forEach(a=>a.avatar.body.skeleton.update());
 // Frame the panel round the residents (or the focus) inside the captured view: each shot
 // wants the people a certain size in the panel, whatever the view's distance.
 const heads=actors.map(headOf),focus=heads[Math.max(0,actors.findIndex(a=>a.name===p.focus))];
 const px=v=>{const q=v.clone().project(camera);return [(q.x+1)/2*VIEW_W,(1-q.y)/2*VIEW_H];};
 const feet=actors.map(a=>px(new THREE.Vector3(a.mark.x,a.mark.y,a.mark.z))),crowns=heads.map(hd=>px(hd.top));
 const tall=Math.max(40,...actors.map((a,j)=>feet[j][1]-crowns[j][1])),faceH=Math.max(20,px(focus.top.clone().setY(focus.top.y-focus.size))[1]-px(focus.top)[1]);
 let ch={wide:tall/.38,medium:tall/.72,low:tall/.66,high:tall/.62,dutch:tall/.72,close:faceH/.48,'close-thing':VIEW_H/2.6}[shot]||tall/.7;
 ch=Math.min(VIEW_H,Math.max(VIEW_H/4.2,ch));let cw=ch*w/h;if(cw>VIEW_W){cw=VIEW_W;ch=cw*h/w;}
 const left=Math.min(...crowns.map(c=>c[0])),right=Math.max(...crowns.map(c=>c[0]));
 let cx=VIEW_W*(.3+((i*37)%40)/100),cy=VIEW_H*.5;
 if(shot==='close'){const c=px(focus.centre);cx=c[0];cy=c[1]+ch*.12;}
 else if(shot!=='close-thing'){cx=(left+right)/2;const top=Math.min(...crowns.map(c=>c[1])),bottom=Math.max(...feet.map(f=>f[1]));cy=shot==='wide'?(top+bottom)/2+ch*.05:top+ch*.5-ch*.2;}
 const ox=Math.max(0,Math.min(VIEW_W-cw,cx-cw/2)),oy=Math.max(0,Math.min(VIEW_H-ch,cy-ch/2));
 camera.setViewOffset(VIEW_W,VIEW_H,ox,oy,cw,ch);camera.updateProjectionMatrix();
 // The backdrop: the same part of the captured picture, softened for close shots.
 const layer=document.createElement('canvas');layer.width=w;layer.height=h;const lc=layer.getContext('2d');
 const k=img.width/VIEW_W;if(shot==='close')lc.filter='blur(3px)';lc.drawImage(img,ox*k,oy*k,cw*k,ch*k,0,0,w,h);lc.filter='none';
 // Light the residents in the colour of the room.
 const tone=averageColour(lc,w,h);
 scene.add(new THREE.HemisphereLight(new THREE.Color().setRGB(.7+tone[0]*.55,.7+tone[1]*.55,.7+tone[2]*.55),0x6a5a48,2.1));
 const key=new THREE.DirectionalLight(0xfff2e0,2.2);key.position.copy(camera.position).add(new THREE.Vector3(1.5,2.5,0));key.target.position.copy(centre);scene.add(key,key.target);
 const tops=show?heads.map(hd=>toPanel(hd,camera,w,h)):[];
 if(p.bg)drawBackground(lc,p.bg,w,h,[tops.reduce((t,v)=>t+v.x,0)/(tops.length||1)||w/2,(tops[0]?.y??h*.3)+(tops[0]?.s??60)*.6],i*7919+31);
 if(show){
  // A soft shadow where each resident meets the floor.
  for(const a of actors){
   const f=new THREE.Vector3(a.mark.x,a.mark.y+.01,a.mark.z).project(camera),g2=new THREE.Vector3(a.mark.x+.32,a.mark.y+.01,a.mark.z).project(camera);
   const fx=(f.x+1)/2*w,fy=(1-f.y)/2*h,size=Math.max(10,Math.abs((g2.x-f.x)/2*w));
   if(fy>0&&fy<h*1.15){const g=lc.createRadialGradient(fx,fy,0,fx,fy,size);g.addColorStop(0,'rgba(0,0,0,.38)');g.addColorStop(1,'rgba(0,0,0,0)');lc.fillStyle=g;lc.beginPath();lc.ellipse(fx,fy,size,size*.35,0,0,Math.PI*2);lc.fill();}
  }
  const r=context(w,h);r.setClearColor(0,0);r.clear();
  const depthTex=new THREE.Texture(depthImg);depthTex.needsUpdate=true;depthTex.minFilter=depthTex.magFilter=THREE.NearestFilter;depthTex.generateMipmaps=false;depthTex.colorSpace=THREE.NoColorSpace;
  depthPass(r,camera,depthTex,data.camera);depthTex.dispose();
  r.render(scene,camera);lc.drawImage(r.domElement,0,0,w,h);
 }
 // A Dutch angle tips the whole picture; the lettering stays level.
 const tilt=shot==='dutch'?(i%2?1:-1)*.16:0;
 if(tilt){ctx.save();ctx.translate(w/2,h/2);ctx.rotate(tilt);ctx.scale(1.3,1.3);ctx.drawImage(layer,-w/2,-h/2);ctx.restore();}
 else ctx.drawImage(layer,0,0);
 const tipped=v=>{if(!tilt)return v;const dx=(v.x-w/2)*1.3,dy=(v.y-h/2)*1.3,c=Math.cos(tilt),s=Math.sin(tilt);return {x:w/2+dx*c-dy*s,y:h/2+dx*s+dy*c,s:v.s*1.3};};
 letter(ctx,w,h,p,actors,tops.map(tipped),i);
 scene.clear();
}

/** The stare, and any place without a captured set: the residents alone, the room blurred behind. */
async function drawStudioPanel({ctx,w,h,p,shot,actors,scene,base,place,i}){
 const img=await load(`${base}assets/images/feed/${place}.webp`).catch(()=>null);
 actors.forEach((a,j)=>{const solo=actors.length===1;a.holder.position.set(solo?.05:j?.5:-.5,0,0);a.holder.rotation.y=solo||shot==='eyes'?0:j?-.32:.32;pose(a.avatar,a.pose,a.expression);scene.add(a.holder);});
 scene.updateMatrixWorld(true);actors.forEach(a=>a.avatar.body.skeleton.update());
 const heads=actors.map(headOf),fh=heads[Math.max(0,actors.findIndex(a=>a.name===p.focus))],tall=Math.max(...actors.map(a=>a.avatar.height));
 const camera=new THREE.PerspectiveCamera(30,w/h,.05,60);
 if(shot==='eyes'){const y=fh.centre.y-fh.size*.13;camera.position.set(fh.centre.x,y,fh.centre.z+fh.front+fh.size*.95);camera.lookAt(fh.centre.x,y,fh.centre.z);}
 else{camera.position.set(0,tall*.7,tall*(actors.length>1?2.15:1.8));camera.lookAt(0,tall*.7,0);}
 camera.updateMatrixWorld(true);
 ctx.fillStyle='#222';ctx.fillRect(0,0,w,h);
 if(img){ctx.filter=shot==='eyes'?'blur(8px)':'none';const sw=img.width/1.3,sh=Math.min(img.height,sw*h/w);ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)*.45,sw,sh,0,0,w,h);ctx.filter='none';}
 scene.add(new THREE.HemisphereLight(0xffffff,0x8a8070,2.2));const key=new THREE.DirectionalLight(0xfff4e6,2.4);key.position.set(1.5,3,4);scene.add(key);
 const r=context(w,h);r.setClearColor(0,0);r.clear();r.render(scene,camera);ctx.drawImage(r.domElement,0,0,w,h);
 if(shot==='eyes'){
  // A thin strip of eyes between black bars, the line lettered in the bar.
  const bar=h*.22;ctx.fillStyle=INK;ctx.fillRect(0,0,w,bar);ctx.fillRect(0,h-bar,w,bar);
  ctx.fillStyle='#fff';ctx.font=`900 28px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.say?'“'+p.line+'”':p.line,w/2,h-bar/2,w*.9);
  if(p.sfx&&p.sfx!=='…')drawSfx(ctx,p.sfx,w,h*.7,i);
 }else letter(ctx,w,h,p,actors,heads.map(hd=>toPanel(hd,camera,w,h)),i);
 scene.clear();
}

/**
 * A drink in the hand that is not busy: the right, unless the right is pointing or waving.
 * On a quiet beat (standing about, listening) the glass goes up to the lips instead.
 */
function holdDrinks(actors,i){
 for(const a of actors){
  a.prop?.removeFromParent();a.prop=null;if(!a.drink)continue;
  const busyRight=['Point','Wave','Peace','Heart','Coy'].includes(a.pose),quiet=['Idle','Think','Sit','Shrug'].includes(a.pose)&&(i+a.name.length)%3===0;
  const side=busyRight?'L':'R',prop=buildServingDrink(a.drink,{held:true}).group;a.avatar.bones['hand'+side].add(prop);a.prop=prop;
  const lift=quiet&&side==='R'?.95:0;
  if(lift){a.avatar.root.updateMatrixWorld(true);poseAvatarConsumption(a.avatar,lift,false,prop);a.avatar.root.updateMatrixWorld(true);}
  fitAvatarHeldProp(a.avatar,prop,lift,side);
 }
}

/** The head of a posed avatar: an ellipsoid round headCentre, measured from the head bone. */
function headOf(a){
 const bone=a.avatar.bones?.head,m=a.avatar.measure;
 if(bone&&m){const R=m.Rh*(m.headSY||1),centre=bone.localToWorld(new THREE.Vector3(0,m.headCentre-m.headY,0)),up=new THREE.Vector3(0,1,0).applyQuaternion(bone.getWorldQuaternion(new THREE.Quaternion()));return {centre,top:centre.clone().addScaledVector(up,R),size:R*2,front:m.Rh};}
 const top=a.holder.localToWorld(new THREE.Vector3(0,a.avatar.height,0));return {centre:top.clone().setY(top.y-a.avatar.height*.15),top,size:a.avatar.height*.3,front:a.avatar.height*.15};
}
function toPanel(hd,camera,w,h){
 const t=hd.top.clone().project(camera),c=hd.top.clone().setY(hd.top.y-hd.size).project(camera);
 const x=(t.x+1)/2*w,y=(1-t.y)/2*h,chin=(1-c.y)/2*h;return {x,y,s:Math.min(150,Math.max(24,chin-y))};
}
function averageColour(ctx,w,h){
 const d=ctx.getImageData(0,0,w,h).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4*97){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 return [r/n/255,g/n/255,b/n/255];
}
/** Marks, sound effects and the bubble. */
function letter(ctx,w,h,p,actors,tops,i){
 (p.fx||[]).forEach((kind,j)=>tops[j]&&drawFaceFx(ctx,kind,tops[j].x,tops[j].y,tops[j].s,i+j));
 drawSfx(ctx,p.sfx,w,h,i+(p.say===actors[0]?.name?1:0));
 const speaker=actors.findIndex(a=>a.name===p.say);
 if(speaker>=0&&tops[speaker]){const {x,y}=tops[speaker];bubble(ctx,p.line,w,h,{x:Math.max(150,Math.min(w-150,x+(x<w/2?50:-50))),y:12,maxW:w*.72,tx:x,ty:y-8});}
 else bubble(ctx,p.line,w,h,{x:w/2,y:12,maxW:w*.84});
}

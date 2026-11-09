/**
 * Ball: the Game & Watch juggle of 1980, as the Game Boy Camera played it with the photographer's own face on the
 * juggler (the owner, 5 November 2026: "I would like 2 also"; 6 November: "The ball game should have four frames and
 * the ball game doesn't quite work as you made it"). The juggler's arms swing together to the side you press: a tap
 * on the left (or the left arrow) puts both hands on the left, a tap on the right puts them on the right. A ball flies
 * from one hand over the head to the other side in seven segments; it is caught when the hands are on that side as
 * it comes down, and thrown straight back, so the hands have to be moved again. A catch is ten points, as the Camera's
 * Game B scored; a drop ends the game; two balls at first, a third at a hundred points; every catch quickens the tempo
 * and every hundred points gives a breather, as the original slowed after each hundred. Five hundred, the Camera's own
 * mark (its last stamps unlocked there), opens the secret sheet and makes the juggler, your face and all, a sticker.
 *
 * The face is four frames, as the Camera took four photographs of you in four ovals and showed them in turn: the
 * booth here takes four pictures from the front camera, each cut to the oval you held your face in, and the juggler's
 * head changes between them while you play. A face from a photo (the album's, or a chosen one) is one frame.
 *
 * The screen is an LCD: every segment a ball or an arm can show is there faintly, the balls step from segment to
 * segment, never between. createBallGame() is the game alone, for the checks (camera/tests/ball.test.mjs);
 * createBall() the screen.
 */
import {createResultShare} from './social-share.js?v=20261109brand2';

/** Ball positions across the LCD: 0 is the left hand, STEPS-1 the right; a crossing is STEPS-1 moves. */
export const STEPS=7;
export const CATCH_POINTS=10,WIN_SCORE=500,THIRD_BALL_AT=100;
/** The tempo: a tick's length to start, how much each catch shortens it, the quickest it gets, the breather at each hundred. */
export const TEMPO={start:420,quicken:.975,floor:170,breather:1.25};
/** The sides, and the tick (modulo a crossing) each ball sets out on: no two balls ever come down on the same tick. */
const CROSSING=STEPS-1,PHASES=[{tick:1,side:'left'},{tick:4,side:'right'},{tick:2,side:'left'}];

/** The game alone: the hands' side, the balls, the score; tick() moves every ball one segment and tells what happened. */
export function createBallGame({balls=2}={}){
 const g={hands:'left',balls:[],score:0,caught:0,over:false,won:false,ticks:0,tempo:TEMPO.start,pending:balls,launched:0,hundreds:0};
 const throwFrom=(b,side)=>{b.from=side;b.pos=side==='left'?0:STEPS-1;};
 function tick(){
  if(g.over)return [];
  g.ticks++;const events=[];
  // The balls join one after another, each on its own tick of the crossing, so their landings never coincide.
  if(g.pending>0){const phase=PHASES[g.launched];if(g.ticks%CROSSING===phase.tick){const b={};throwFrom(b,phase.side);g.balls.push(b);g.pending--;g.launched++;}}
  for(const b of g.balls){
   b.pos+=b.from==='left'?1:-1;
   const end=b.from==='left'?STEPS-1:0;
   if(b.pos!==end)continue;
   const side=b.from==='left'?'right':'left';
   if(g.hands===side){
    g.score+=CATCH_POINTS;g.caught++;g.tempo=Math.max(TEMPO.floor,Math.round(g.tempo*TEMPO.quicken));events.push({type:'catch',side});
    if(Math.floor(g.score/100)>g.hundreds){g.hundreds=Math.floor(g.score/100);g.tempo=Math.min(TEMPO.start,Math.round(g.tempo*TEMPO.breather));events.push({type:'hundred'});
     if(g.hundreds===THIRD_BALL_AT/100&&g.launched<3){g.pending++;events.push({type:'third'});}}
    if(!g.won&&g.score>=WIN_SCORE){g.won=true;events.push({type:'win'});}
    throwFrom(b,side);
   }else{g.over=true;b.dropped=true;events.push({type:'miss',side});}
  }
  return events;
 }
 return {
  get state(){return g;},tick,
  /** The hands swing together to this side. */
  moveHands(side){if(!g.over&&(side==='left'||side==='right'))g.hands=side;},
 };
}

/**
 * A face as the juggler wears it: an oval cut out of a picture with a soft edge, on a square of `size` pixels, as a
 * PNG data URL. `oval` is a list of points in the picture's 0..1 coordinates (a face pack face's oval, or the booth's
 * ellipse); `mirror` flips the picture, as a front camera's is.
 */
export async function cropOval(picture,oval,{size=160,mirror=false}={}){
 const img=picture instanceof HTMLImageElement||picture instanceof ImageBitmap||picture instanceof HTMLCanvasElement||picture instanceof HTMLVideoElement?picture:await createImageBitmap(picture);
 const W=img.videoWidth||img.naturalWidth||img.width,H=img.videoHeight||img.naturalHeight||img.height;
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of oval){x0=Math.min(x0,x*W);y0=Math.min(y0,y*H);x1=Math.max(x1,x*W);y1=Math.max(y1,y*H);}
 const side=Math.max(x1-x0,y1-y0)*1.12,cx=(x0+x1)/2,cy=(y0+y1)/2,k=size/side,ox=size/2-cx*k,oy=size/2-cy*k;
 const path=g=>{g.beginPath();oval.forEach(([x,y],i)=>{const X=x*W*k+ox,Y=y*H*k+oy;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();};
 const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
 g.save();path(g);g.clip();g.imageSmoothingQuality='high';
 if(mirror){g.translate(size,0);g.scale(-1,1);g.drawImage(img,size-(ox+W*k),oy,W*k,H*k);}else g.drawImage(img,ox,oy,W*k,H*k);
 g.restore();
 // A soft edge: the oval's rim faded over a few pixels.
 const soft=document.createElement('canvas');soft.width=soft.height=size;const s=soft.getContext('2d');
 s.filter=`blur(${Math.max(1.5,size*.012)}px)`;s.fillStyle='#000';if(mirror){s.translate(size,0);s.scale(-1,1);}path(s);s.fill();
 g.globalCompositeOperation='destination-in';g.drawImage(soft,0,0);g.globalCompositeOperation='source-over';
 if(img instanceof ImageBitmap&&img!==picture)img.close();
 return c.toDataURL('image/png');
}
/** A face pack face's oval, as cropOval takes it. */
export const cropFace=(picture,face,size=160)=>cropOval(picture,face.oval,{size});
/** The booth's oval, in the camera picture's 0..1 coordinates: centred in the square the booth shows, 0.56 wide and 0.72 tall of its side. */
export function boothOval(W,H,n=36){
 const side=Math.min(W,H),rx=side*.28/W,ry=side*.36/H;
 return Array.from({length:n},(_,i)=>[.5+rx*Math.cos(i/n*2*Math.PI),.5+ry*Math.sin(i/n*2*Math.PI)]);
}

const LCD={paper:'#b7bda2',ink:'#262a24',ghost:'rgba(38,42,36,.09)'};
/** Seven-segment digits, as the LCD showed the score. */
const SEGS={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcdfg'};
function drawDigits(g,text,x,y,h,on,off){
 const w=h*.55,t=h*.11,gap=h*.3;
 for(let i=0;i<text.length;i++){
  const d=SEGS[text[i]]||'',X=x-(text.length-i)*(w+gap);
  const seg={a:[X+t,y,w-2*t,t],b:[X+w-t,y+t,t,h/2-1.5*t],c:[X+w-t,y+h/2+t/2,t,h/2-1.5*t],d:[X+t,y+h-t,w-2*t,t],e:[X,y+h/2+t/2,t,h/2-1.5*t],f:[X,y+t,t,h/2-1.5*t],g:[X+t,y+h/2-t/2,w-2*t,t]};
  for(const [k,r] of Object.entries(seg)){g.fillStyle=d.includes(k)?on:off;g.fillRect(...r);}
 }
}
/** A kept face, old or new: `frames` of pictures and where it came from. */
const normalFace=f=>!f?null:Array.isArray(f.frames)&&f.frames.length?{frames:f.frames.filter(u=>typeof u==='string').slice(0,4),from:f.from||'photo'}:typeof f.url==='string'?{frames:[f.url],from:f.from||'photo'}:null;

/**
 * The Ball screen inside `root`: the setup (your face: a Pocket face, the booth's four frames, the album's photos with
 * a face found, a chosen photo; the best score; Play), the LCD and the game over. `faces()` resolves to the photos
 * with a found face [{id,label,blob,thumb,face}]; `pickFace()` asks for a photo and resolves to {blob,face} or null;
 * `defaultFace()` resolves to a picture URL for the juggler until a face is chosen; `camera()` resolves to a
 * MediaStream of the front camera for the booth, or throws; `store` keeps the chosen face (`gameFace`) and the best
 * score (`ballBest`); `onWin({score,juggler})` is told once a game reaches 500, with a canvas of the juggler for the
 * sticker; `onLeave()` goes back to the games.
 */
export function createBall(root,{faces=async()=>[],pickFace=async()=>null,defaultFace=async()=>null,camera=null,store,sound=()=>{},onWin=()=>{},onLeave=()=>{},reduceMotion=false}){
 root.classList.add('ball-game');
 root.innerHTML=`<div class="ball-setup"><p class="ball-lead">Juggle. Tap the side a ball is coming down on: the hands swing there together. Ten points a catch; a drop ends it.</p>
  <h3>Your face</h3><div class="ball-faces" role="radiogroup" aria-label="The juggler's face"></div><p class="ball-note"></p>
  <div class="ball-go"><p class="ball-best"></p><button type="button" class="button primary ball-play">Play</button></div></div>
  <div class="ball-booth" hidden><p class="ball-lead">Four faces, one picture each. Fit your face in the oval and take it; pull a different face each time.</p>
  <div class="ball-booth-view"><video class="ball-video" playsinline muted autoplay></video><div class="ball-oval" aria-hidden="true"></div><div class="ball-booth-count" aria-live="polite"></div></div>
  <div class="ball-booth-frames" aria-label="Your four faces"></div>
  <div class="ball-booth-actions"><button type="button" class="button ball-booth-cancel">Cancel</button><button type="button" class="button primary ball-booth-take">Take</button><button type="button" class="button primary ball-booth-use" hidden>Use these</button><button type="button" class="button ball-booth-again" hidden>Again</button></div>
  <p class="ball-note ball-booth-note"></p></div>
  <div class="ball-stage" hidden><canvas class="ball-lcd" aria-label="Ball" role="img"></canvas>
  <div class="ball-hands"><button type="button" class="ball-hand" data-side="left" aria-label="Hands to the left">◀ Left</button><p class="ball-status" role="status" aria-live="polite"></p><button type="button" class="ball-hand" data-side="right" aria-label="Hands to the right">Right ▶</button></div>
  <div class="ball-over" hidden></div></div>`;
 const q=s=>root.querySelector(s);
 const setup=q('.ball-setup'),booth=q('.ball-booth'),stage=q('.ball-stage'),canvas=q('.ball-lcd'),status=q('.ball-status'),over=q('.ball-over'),facesEl=q('.ball-faces'),note=q('.ball-note'),bestEl=q('.ball-best');
 const video=q('.ball-video'),boothCount=q('.ball-booth-count'),boothFrames=q('.ball-booth-frames'),boothNote=q('.ball-booth-note'),take=q('.ball-booth-take'),use=q('.ball-booth-use'),again=q('.ball-booth-again');
 const ctx=canvas.getContext('2d');
 let game=null,timer=0,faceImgs=[],faceChoice=normalFace(store.read().gameFace),defaultURL=null,defaultImg=null,destroyed=false,frameIndex=0,stream=null,shots=[];
 const best=()=>store.read().ballBest||0;
 const loadFace=url=>new Promise(res=>{if(!url){res(null);return;}const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=url;});
 const loadFaces=async choice=>(await Promise.all((choice?.frames||[]).map(loadFace))).filter(Boolean);
 async function useFace(choice){faceChoice=normalFace(choice);store.write({...store.read(),gameFace:faceChoice});faceImgs=await loadFaces(faceChoice);frameIndex=0;draw();renderFaces();}
 async function renderFaces(){
  facesEl.textContent='';
  const choice=(id,html,checked,onClick,extra='')=>{const b=document.createElement('button');b.type='button';b.className='ball-face'+extra;b.setAttribute('role','radio');b.dataset.face=id;b.setAttribute('aria-checked',String(checked));b.innerHTML=html;b.addEventListener('click',onClick);facesEl.append(b);return b;};
  choice('own',`<img alt="" src="${defaultURL||''}"><span>A Pocket face</span>`,!faceChoice,()=>{sound('tick');useFace(null);});
  if(faceChoice?.from==='booth')choice('booth',`<img alt="" src="${faceChoice.frames[0]}"><span>Your four faces</span>`,true,()=>{sound('tick');});
  if(camera)choice('take','<span class="ball-pick-mark">📷</span><span>Take four faces</span>',false,()=>{sound('tick');openBooth();},' ball-pick');
  let list=[];try{list=await faces();}catch{}
  for(const f of list){
   const b=choice(f.id,'',faceChoice?.from===f.id,async()=>{sound('tick');b.disabled=true;try{useFace({frames:[await cropFace(f.blob,f.face)],from:f.id});}finally{b.disabled=false;}});
   const img=document.createElement('img');img.alt='';img.src=URL.createObjectURL(f.thumb||f.blob);const span=document.createElement('span');span.textContent=f.label;b.append(img,span);
  }
  choice('pick','<span class="ball-pick-mark">+</span><span>Choose a photo</span>',false,async()=>{sound('tick');const got=await pickFace();if(got)useFace({frames:[await cropFace(got.blob,got.face)],from:'photo'});else note.textContent='No face was found in that photo.';},' ball-pick');
  note.textContent=list.length?'':'Photos with a face found in them appear here too.';
 }
 // ---------- The booth: four faces from the front camera ----------
 async function openBooth(){
  shots=[];boothFrames.textContent='';boothNote.textContent='';boothCount.textContent='1 of 4';take.hidden=false;use.hidden=true;again.hidden=true;
  setup.hidden=true;booth.hidden=false;
  try{stream=await camera();video.srcObject=stream;await video.play().catch(()=>{});}
  catch(err){boothNote.textContent=err?.name==='NotAllowedError'?'The camera is not allowed for this page. Choose a photo instead.':'No camera could be opened here. Choose a photo instead.';take.disabled=true;}
 }
 function closeBooth(){for(const t of stream?.getTracks?.()||[])t.stop();stream=null;video.srcObject=null;take.disabled=false;booth.hidden=true;setup.hidden=false;}
 async function snap(){
  if(!video.videoWidth||shots.length>=4)return;
  sound('shutter');
  const url=await cropOval(video,boothOval(video.videoWidth,video.videoHeight),{mirror:true});
  shots.push(url);const img=document.createElement('img');img.alt=`Face ${shots.length}`;img.src=url;boothFrames.append(img);
  boothCount.textContent=shots.length<4?`${shots.length+1} of 4`:'Four faces';
  if(shots.length===4){take.hidden=true;use.hidden=false;again.hidden=false;use.focus({preventScroll:true});}
 }
 take.addEventListener('click',snap);
 use.addEventListener('click',()=>{sound('tick');const frames=shots.slice(0,4);closeBooth();useFace({frames,from:'booth'});});
 again.addEventListener('click',()=>{sound('tick');shots=[];boothFrames.textContent='';boothCount.textContent='1 of 4';take.hidden=false;use.hidden=true;again.hidden=true;});
 q('.ball-booth-cancel').addEventListener('click',()=>{sound('tick');closeBooth();});
 // ---------- The game ----------
 function showSetup(){
  stop();game=null;setup.hidden=false;stage.hidden=true;over.hidden=true;root.classList.remove('playing');
  bestEl.textContent=best()?`Best: ${best()} points`:'No game yet';
 }
 function start(){
  stop();game=createBallGame({balls:2});over.hidden=true;setup.hidden=true;stage.hidden=false;root.classList.add('playing');
  size();draw();status.textContent='0 points';
  timer=setTimeout(tickOnce,game.state.tempo);
 }
 function stop(){clearTimeout(timer);timer=0;}
 function tickOnce(){
  if(!game||destroyed)return;
  const events=game.tick();
  if(faceImgs.length>1&&game.state.ticks%2===0)frameIndex=(frameIndex+1)%faceImgs.length;
  for(const e of events){
   if(e.type==='catch')sound('pop');
   else if(e.type==='third')status.textContent=`${game.state.score} points · a third ball`;
   else if(e.type==='win'){sound('win');onWin({score:game.state.score,juggler:jugglerCanvas()});}
   else if(e.type==='miss')sound('nope');
  }
  if(events.some(e=>e.type==='catch'))status.textContent=`${game.state.score} points`;
  draw();
  if(game.state.over){finish();return;}
  timer=setTimeout(tickOnce,game.state.tempo);
 }
 function finish(){
  stop();const s=game.state,record=best(),better=s.score>record;
  if(better)store.write({...store.read(),ballBest:s.score});
  status.textContent=`Dropped. ${s.score} points`;
  setTimeout(()=>{
   if(!game||destroyed)return;
   over.innerHTML='';
   const h=document.createElement('h3');h.textContent=better&&record?'New best!':s.score>=WIN_SCORE?'Five hundred!':'Dropped';
   const p=document.createElement('p');p.textContent=`${s.score} points · ${s.caught} ${s.caught===1?'catch':'catches'}${better&&record?` (was ${record})`:record?` · best ${record}`:''}`;
   const againB=document.createElement('button');againB.type='button';againB.className='button primary';againB.textContent='Play again';againB.addEventListener('click',()=>{sound('tick');start();});
   const other=document.createElement('button');other.type='button';other.className='button';other.textContent='Other games';other.addEventListener('click',()=>{sound('tick');onLeave();});
   const buttons=document.createElement('div');buttons.className='ball-over-buttons';buttons.append(againB,other);
   over.append(h,p,buttons,createResultShare({game:'Ball',headline:`${s.score} points`,detail:`${s.caught} catches`}));over.hidden=false;againB.focus({preventScroll:true});
  },reduceMotion?200:900);
 }
 // ---------- The LCD ----------
 function size(){
  const w=Math.max(240,Math.min(stage.clientWidth-24,640)),h=Math.round(w*.56),dpr=Math.min(3,devicePixelRatio||1);
  canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 }
 new ResizeObserver(()=>{if(!stage.hidden){size();draw();}}).observe(stage);
 /** Where things are in a width W and height H: the two catch points and the path between them over the head. */
 function layout(W,H){
  const cx=W/2,hand={left:[cx-W*.3,H*.42],right:[cx+W*.3,H*.42]};
  const spot=i=>{const t=i/(STEPS-1);return [hand.left[0]+(hand.right[0]-hand.left[0])*t,hand.left[1]-Math.sin(Math.PI*t)*(hand.left[1]-H*.05)];};
  return {cx,hand,spot,ground:H*.9,ballR:W*.02};
 }
 function figure(g,W,H,L,side,head){
  const {cx,hand,ground}=L,s=side==='left'?-1:1;
  g.fillStyle=LCD.ink;g.strokeStyle=LCD.ink;g.lineCap='round';g.lineJoin='round';
  // Legs and feet, the body.
  g.lineWidth=W*.028;g.beginPath();g.moveTo(cx-W*.04,ground-H*.22);g.lineTo(cx-W*.06,ground);g.moveTo(cx+W*.04,ground-H*.22);g.lineTo(cx+W*.06,ground);g.stroke();
  g.lineWidth=W*.02;g.beginPath();g.moveTo(cx-W*.09,ground);g.lineTo(cx-W*.03,ground);g.moveTo(cx+W*.03,ground);g.lineTo(cx+W*.09,ground);g.stroke();
  g.beginPath();g.moveTo(cx-W*.07,ground-H*.44);g.lineTo(cx+W*.07,ground-H*.44);g.lineTo(cx+W*.055,ground-H*.2);g.lineTo(cx-W*.055,ground-H*.2);g.closePath();g.fill();
  // Both arms swung to one side: the near arm up to the catch point, the far arm across the body below it.
  const near=[cx+s*W*.065,ground-H*.42],far=[cx-s*W*.065,ground-H*.42],catchAt=hand[side],low=[cx+s*W*.2,ground-H*.26];
  g.lineWidth=W*.024;g.beginPath();g.moveTo(...near);g.lineTo(cx+s*W*.16,ground-H*.36);g.lineTo(...catchAt);g.stroke();
  g.beginPath();g.moveTo(...far);g.lineTo(cx+s*W*.04,ground-H*.3);g.lineTo(...low);g.stroke();
  g.lineWidth=W*.016;g.beginPath();g.arc(catchAt[0],catchAt[1]-W*.012,W*.028,Math.PI*.15,Math.PI*.85,true);g.stroke();
  g.beginPath();g.arc(low[0],low[1]-W*.01,W*.022,Math.PI*.15,Math.PI*.85,true);g.stroke();
  // The head: your face (the frame of the moment), a Pocket face, or a plain disc.
  const r=W*.085,hy=ground-H*.44-r*1.05;
  g.save();g.beginPath();g.arc(cx,hy,r,0,Math.PI*2);g.closePath();g.clip();
  if(head)g.drawImage(head,cx-r,hy-r,2*r,2*r);else{g.fillStyle=LCD.ink;g.fillRect(cx-r,hy-r,2*r,2*r);}
  g.restore();
  g.lineWidth=W*.012;g.strokeStyle=LCD.ink;g.beginPath();g.arc(cx,hy,r,0,Math.PI*2);g.stroke();
 }
 const headNow=()=>faceImgs.length?faceImgs[frameIndex%faceImgs.length]:defaultImg;
 function draw(){
  if(stage.hidden)return;
  const dpr=canvas.width/parseFloat(canvas.style.width||'1'),W=canvas.width/dpr,H=canvas.height/dpr,g=ctx;
  g.setTransform(dpr,0,0,dpr,0,0);
  g.fillStyle=LCD.paper;g.fillRect(0,0,W,H);
  const L=layout(W,H),s=game?.state;
  // Every segment, faintly: the arms the other way, the balls' places along the path.
  g.save();g.globalAlpha=.09;figure(g,W,H,L,(s?.hands||'left')==='left'?'right':'left',null);g.restore();
  g.fillStyle=LCD.ghost;for(let i=0;i<STEPS;i++){const [x,y]=L.spot(i);g.beginPath();g.arc(x,y,L.ballR,0,Math.PI*2);g.fill();}
  figure(g,W,H,L,s?s.hands:'left',headNow());
  if(s){
   g.fillStyle=LCD.ink;
   for(const b of s.balls){
    const [x,y]=L.spot(b.pos);
    if(b.dropped){g.beginPath();g.arc(x,L.ground-L.ballR,L.ballR,0,Math.PI*2);g.fill();g.beginPath();g.arc(x,y+H*.14,L.ballR*.8,0,Math.PI*2);g.fill();continue;}
    g.beginPath();g.arc(x,y,L.ballR,0,Math.PI*2);g.fill();
   }
   drawDigits(g,String(s.score).padStart(4,'0'),W-W*.04,H*.07,H*.13,LCD.ink,LCD.ghost);
  }else drawDigits(g,'0000',W-W*.04,H*.07,H*.13,LCD.ink,LCD.ghost);
 }
 /** The juggler alone on nothing, for the sticker. */
 function jugglerCanvas(){
  const W=512,H=Math.round(W*.56),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  figure(g,W,H,layout(W,H),game?game.state.hands:'left',faceImgs[0]||defaultImg);
  return c;
 }
 // ---------- Input ----------
 const swing=side=>{if(!game||game.state.over)return;if(game.state.hands!==side){game.moveHands(side);sound('tick');draw();}};
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();swing(e.clientX-r.left<r.width/2?'left':'right');});
 for(const b of root.querySelectorAll('.ball-hand'))b.addEventListener('click',()=>swing(b.dataset.side));
 const keys=e=>{if(root.hidden||stage.hidden||!game)return;if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A'){e.preventDefault();swing('left');}else if(e.key==='ArrowRight'||e.key==='d'||e.key==='D'){e.preventDefault();swing('right');}};
 document.addEventListener('keydown',keys);
 q('.ball-play').addEventListener('click',()=>{sound('tick');start();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&game&&!game.state.over){stop();}else if(!document.hidden&&game&&!game.state.over&&!timer)timer=setTimeout(tickOnce,game.state.tempo);});
 // ---------- Open ----------
 (async()=>{
  defaultURL=await defaultFace().catch(()=>null);defaultImg=await loadFace(defaultURL);
  faceImgs=await loadFaces(faceChoice);
  if(destroyed)return;renderFaces();showSetup();
 })();
 return {
  start,showSetup,
  destroy(){destroyed=true;stop();closeBooth();document.removeEventListener('keydown',keys);root.classList.remove('ball-game','playing');root.replaceChildren();},
  get game(){return game;},
  get face(){return faceChoice;},
  get frame(){return frameIndex;},
  /** For the checks: a tick on demand, with the clock stopped; the booth's shutter. */
  step(){stop();tickOnce();stop();},
  snap,jugglerCanvas,
 };
}

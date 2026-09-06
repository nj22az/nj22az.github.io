// Touch-first controls for Johansson Town. No image dependency: the controls are CSS/vector shapes,
// so they remain sharp on Retina displays and cannot fail because an external asset host is unavailable.
const coarse=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const canvas=document.querySelector('#game');
const stick=document.querySelector('#stick');
const knob=document.querySelector('#knob');
const act=document.querySelector('#act');
const prompt=document.querySelector('#prompt');
const qte=document.querySelector('#qte');
const qteGlyph=document.querySelector('#qteGlyph');
const qteText=document.querySelector('#qteText');
const qteTimer=document.querySelector('#qteTimer');
let moveId=null,qteState=null,qteStart=null,lastRound=0;

function setActionLabel(){
  if(!act||!prompt)return;
  const text=prompt.textContent.trim();
  const active=prompt.classList.contains('on')&&text;
  let verb='ACTION',glyph='◎';
  if(active){
    if(/^Talk/i.test(text)){verb='TALK';glyph='◇';}
    else if(/^Enter/i.test(text)){verb='ENTER';glyph='→';}
    else if(/cat/i.test(text)){verb='GREET';glyph='♡';}
    else if(/fish|Cast/i.test(text)){verb='USE';glyph='⌁';}
    else if(/buy|order/i.test(text)){verb='BUY';glyph='¥';}
    else if(/read|browse/i.test(text)){verb='READ';glyph='▤';}
    else if(/play/i.test(text)){verb='PLAY';glyph='▶';}
    else {verb='INSPECT';glyph='○';}
  }
  act.classList.toggle('available',!!active);
  act.innerHTML=`<span class="act-glyph">${glyph}</span><b class="act-label">${verb}</b>`;
  act.setAttribute('aria-label',active?text:'Context action');
}

if(prompt){
  const observer=new MutationObserver(setActionLabel);
  observer.observe(prompt,{attributes:true,childList:true,characterData:true,subtree:true});
  setActionLabel();
}

function placeStick(t){
  if(!coarse||!stick)return;
  const radius=58,edge=18;
  const x=Math.max(edge+radius,Math.min(innerWidth-edge-radius,t.clientX));
  const y=Math.max(edge+radius,Math.min(innerHeight-edge-radius,t.clientY));
  stick.style.left=`${x}px`;stick.style.top=`${y}px`;stick.style.right='auto';stick.style.bottom='auto';
  stick.classList.add('active');
}
function hideStick(){stick?.classList.remove('active');}

// Capture phase intentionally runs before main.js reads the stick bounds. This turns the existing
// analogue input maths into a floating thumbstick without duplicating or fighting the movement system.
if(coarse&&canvas){
  canvas.addEventListener('touchstart',e=>{
    if(qteState)return;
    for(const t of e.changedTouches){
      if(moveId===null&&t.clientX<innerWidth*.48){moveId=t.identifier;placeStick(t);break;}
    }
  },{capture:true,passive:true});
  canvas.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===moveId){moveId=null;hideStick();}}, {capture:true,passive:true});
  canvas.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)if(t.identifier===moveId){moveId=null;hideStick();}}, {capture:true,passive:true});
}

const directions={
  left:{glyph:'←',text:'SWIPE LEFT'},
  right:{glyph:'→',text:'SWIPE RIGHT'},
  up:{glyph:'↑',text:'SWIPE UP'},
  down:{glyph:'↓',text:'SWIPE DOWN'},
  tap:{glyph:'◎',text:'TAP'}
};
const roundPattern=['left','up','tap'];
function classify(dx,dy,elapsed){
  const ax=Math.abs(dx),ay=Math.abs(dy);
  if(elapsed<380&&Math.max(ax,ay)<34)return'tap';
  if(Math.max(ax,ay)<54)return null;
  return ax>ay?(dx<0?'left':'right'):(dy<0?'up':'down');
}
function disarmQTE(){
  qteState=null;qteStart=null;
  qte?.classList.add('hidden');qte?.classList.remove('good','bad');
  if(qteTimer){qteTimer.style.transition='none';qteTimer.style.transform='scaleX(1)';}
}
function completeQTE(ok){
  if(!qteState)return;
  qte?.classList.toggle('good',ok);qte?.classList.toggle('bad',!ok);
  if(navigator.vibrate)navigator.vibrate(ok?18:[18,30,18]);
  if(ok){
    const dock=[...document.querySelectorAll('#activityActions button')].find(b=>b.textContent.trim()==='DOCK');
    setTimeout(()=>{dock?.click();disarmQTE();},90);
  }else setTimeout(()=>{qte?.classList.remove('bad');},180);
}
function armQTE(round){
  if(!qte||round===lastRound&&qteState)return;
  lastRound=round;
  const direction=roundPattern[(round-1)%roundPattern.length];
  qteState={direction};
  qteGlyph.textContent=directions[direction].glyph;qteText.textContent=directions[direction].text;
  qte.classList.remove('hidden','good','bad');
  if(qteTimer){
    qteTimer.style.transition='none';qteTimer.style.transform='scaleX(1)';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{qteTimer.style.transition='transform 1.8s linear';qteTimer.style.transform='scaleX(0)';}));
  }
}

if(qte){
  qte.addEventListener('pointerdown',e=>{if(qteState)qteStart={x:e.clientX,y:e.clientY,time:performance.now()};});
  qte.addEventListener('pointerup',e=>{
    if(!qteState||!qteStart)return;
    const gesture=classify(e.clientX-qteStart.x,e.clientY-qteStart.y,performance.now()-qteStart.time);
    qteStart=null;if(gesture)completeQTE(gesture===qteState.direction);
  });
}

document.addEventListener('keydown',e=>{
  if(!qteState)return;
  const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'tap',Enter:'tap'};
  const gesture=map[e.code];if(!gesture)return;e.preventDefault();e.stopImmediatePropagation();completeQTE(gesture===qteState.direction);
},{capture:true});

function fixCredits(){
  const body=document.querySelector('#activityBody p');
  if(body)body.textContent='Original town, buildings, activities and current procedural human rigs: Johansson Town. Road, plaster, timber and roof photography: Poly Haven (CC0). Three.js: MIT licence. Legacy Kenney Mini Character files remain archived but are not loaded by the v11 game.';
  const old=[...document.querySelectorAll('#activityActions button')].find(b=>b.textContent.includes('Character credits'));
  if(old)old.textContent='Legacy character archive';
}

const title=document.querySelector('#activityTitle');
if(title){
  const watch=new MutationObserver(()=>{
    const text=title.textContent;
    const match=text.match(/STAR PORT · Round (\d)\/3/);
    if(match)armQTE(Number(match[1]));else if(qteState){lastRound=0;disarmQTE();}
    if(text==='Credits')requestAnimationFrame(fixCredits);
  });
  watch.observe(title,{childList:true,characterData:true,subtree:true});
}

window.__JOHANSSON_TOUCH_UI__={version:11,floatingStick:true,contextAction:true,qteGestures:true};

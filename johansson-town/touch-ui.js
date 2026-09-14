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
let qteState=null,qteStart=null,lastRound=0;

function setActionLabel(){
  if(!act||!prompt)return;
  const text=prompt.textContent.trim();
  const active=prompt.classList.contains('on')&&text;
  let verb='ACTION',glyph='◎';
  if(active){
    if(/^Stand/i.test(text)){verb='STAND';glyph='↑';}
    else if(/^Talk/i.test(text)){verb='TALK';glyph='◇';}
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

const title=document.querySelector('#activityTitle');
if(title){
  const watch=new MutationObserver(()=>{
    const text=title.textContent;
    const match=text.match(/STAR PORT · Round (\d)\/3/);
    if(match)armQTE(Number(match[1]));else if(qteState){lastRound=0;disarmQTE();}
  });
  watch.observe(title,{childList:true,characterData:true,subtree:true});
}

window.__JOHANSSON_TOUCH_UI__={version:12,dualSticks:true,contextAction:true,qteGestures:true,controller(frame){if(!qteState)return;const gesture=frame.pressed[0]?'tap':frame.pressed[12]?'up':frame.pressed[13]?'down':frame.pressed[14]?'left':frame.pressed[15]?'right':null;if(gesture)completeQTE(gesture===qteState.direction);}};

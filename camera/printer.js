/**
 * The printer accompanies Share (the owner, 30 October: Save only saves to the app's album; printing opens Share).
 * Its animation never holds up the native share sheet. A white toy
 * printer in the app icon's plastic rises at the foot of the screen; the photo feeds up out of its slot in the
 * stepper motor's small jerks, on warm paper, while its light blinks and it buzzes; it is torn off against the slot's
 * teeth (a serrated edge) and flies to where the photo now lives: the album's thumbnail, or the photo itself.
 * A tap skips to the tear. With reduced motion nothing plays and the caller shows the photo as before.
 */
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// The torn edge: small teeth along the foot of the paper, as a polygon for clip-path.
function torn(teeth=22,depth=2.6){
 const points=['0% 0%','100% 0%'];
 for(let i=teeth;i>=0;i--){const x=i/teeth*100;points.push(`${x}% ${i%2?100-depth:100}%`);}
 return `polygon(${points.join(',')})`;
}

export function createPrinter({sound=()=>{},reduceMotion=false}={}){
 let running=null,cancelPrint=null;
 /**
  * Prints `src` (an image URL, the photo as saved, width × height). `to()` gives the rectangle the print flies into
  * (asked when it flies, so the screen underneath may change while it prints); without it the print is lifted away.
  * Resolves when it has landed; false if nothing was played (reduced motion, or a print already running).
  */
 async function print(src,{width,height,to=null}={}){
  if(reduceMotion||running||!width||!height)return false;
  let done;running=new Promise(r=>{done=r;});
  const vw=innerWidth,vh=innerHeight,top=Math.max(56,vh*.07);
  const pw0=Math.min(vw*.82,380),ph0=pw0*.42;
  const bodyTop=vh-Math.max(28,vh*.07)-ph0,slotY=bodyTop+ph0*.22;
  // Paper: a margin of 6% of its width round the photo, a deeper foot for the tear.
  const ratio=height/width,paperW=Math.min(pw0*.78,(slotY-top)/(.156+.88*ratio)),margin=paperW*.06,paperH=margin*2.6+(paperW-2*margin)*ratio;
  const scene=document.createElement('div');scene.className='printer-scene';scene.setAttribute('role','status');scene.setAttribute('aria-label','Printing your photo');
  // The printer first, the paper's window over it: the paper rises in front of the printer's back edge, and the window
  // ends at the slot, so below it the paper is still inside.
  scene.innerHTML=`<div class="printer"><i class="printer-slot"></i><i class="printer-button"></i><i class="printer-light"></i></div><div class="printer-window"><div class="printer-paper"><div class="printer-sheet"><img alt=""></div></div></div>`;
  const win=scene.querySelector('.printer-window'),paper=scene.querySelector('.printer-paper'),sheet=paper.firstElementChild,img=sheet.firstElementChild,body=scene.querySelector('.printer');
  Object.assign(body.style,{left:`${(vw-pw0)/2}px`,top:`${bodyTop}px`,width:`${pw0}px`,height:`${ph0}px`,borderRadius:`${ph0*.28}px`});
  Object.assign(win.style,{left:`${(vw-paperW)/2-8}px`,top:`${top-12}px`,width:`${paperW+16}px`,height:`${slotY-top+12}px`});
  // The shadow is on the paper, the torn edge on the sheet inside it (a clip would cut the shadow off).
  Object.assign(paper.style,{width:`${paperW}px`,height:`${paperH}px`});
  Object.assign(sheet.style,{padding:`${margin}px ${margin}px ${margin*1.6}px`,clipPath:torn()});
  img.src=src;
  let skip=false,feed=null,cancelled=false,motor=null;
  cancelPrint=()=>{cancelled=true;for(const el of [scene,body,paper])for(const a of el.getAnimations())a.cancel();scene.remove();paper.remove();};
  scene.addEventListener('pointerdown',()=>{skip=true;feed?.finish();});
  document.body.append(scene);
  try{
   await img.decode().catch(()=>{});
   if(cancelled)return false;
   // The printer rises; then the feed, a step at a time, with the motor's buzz on every other step.
   scene.animate([{opacity:0},{opacity:1}],{duration:220,fill:'forwards'});
   await body.animate([{transform:`translateY(${ph0*1.6}px)`},{transform:'translateY(0)'}],{duration:skip?1:380,easing:'cubic-bezier(.32,1.3,.5,1)',fill:'forwards'}).finished;
   const steps=Math.max(24,Math.min(64,Math.round(paperH/7))),feedMs=Math.min(2200,1300+paperH*1.6);
   scene.classList.add('printing');
   feed=paper.animate([{transform:`translateY(${paperH}px)`},{transform:'translateY(0)'}],{duration:skip?1:feedMs,easing:`steps(${steps},end)`,fill:'forwards'});
   let step=0;motor=setInterval(()=>{if(step++%2===0)sound('feed');},feedMs/steps);
   await feed.finished.catch(()=>{});clearInterval(motor);
   if(cancelled)return false;
   scene.classList.remove('printing');
   if(!skip)await wait(220);
   if(cancelled)return false;
   // Torn off against the teeth: a tug up and a little twist.
   sound('tear');navigator.vibrate?.(8);
   await paper.animate([{transform:'translateY(0)'},{transform:'translate(-3px,-14px) rotate(-2.5deg)'}],{duration:170,easing:'ease-out',fill:'forwards'}).finished;
   // Out of the printer's window, to fly on its own from exactly where it is (the box of its turned shape keeps its centre).
   const r=paper.getBoundingClientRect(),flyer=paper;
   for(const a of paper.getAnimations())a.cancel();
   document.body.append(flyer);flyer.classList.add('printer-flyer');
   Object.assign(flyer.style,{left:`${r.left+r.width/2-paperW/2}px`,top:`${r.top+r.height/2-paperH/2}px`,transform:'rotate(-2.5deg)'});
   scene.animate([{opacity:1},{opacity:0}],{duration:320,fill:'forwards'});
   body.animate([{transform:'translateY(0)'},{transform:`translateY(${ph0*1.4}px)`}],{duration:320,easing:'ease-in',fill:'forwards'});
   const target=to?.();
   if(target&&target.width&&target.height){
    const dx=target.left+target.width/2-(r.left+r.width/2),dy=target.top+target.height/2-(r.top+r.height/2),k=Math.min(target.width/paperW,target.height/paperH);
    await flyer.animate([{transform:'rotate(-2.5deg)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(${k})`,opacity:.92}],{duration:560,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'}).finished;
   }else{
    await flyer.animate([{transform:'rotate(-2.5deg)',opacity:1},{transform:'translateY(-60px) rotate(-4deg) scale(1.04)',opacity:0}],{duration:420,easing:'ease-in',fill:'forwards'}).finished;
   }
   flyer.remove();
   return true;
  }catch(err){if(cancelled)return false;throw err;}
  finally{clearInterval(motor);scene.remove();paper.remove();running=null;cancelPrint=null;done();}
 }
 return {print,cancel(){cancelPrint?.();},get busy(){return !!running;}};
}

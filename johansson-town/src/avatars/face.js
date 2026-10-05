/**
 * Faces, painted. A face is flat shapes on the front of a round head -- which is what
 * makes a crowd of these read as one family -- so it is drawn on a canvas in a 256-unit
 * square and laid on the head as a texture (build.js). Every part is a small vector
 * drawing of our own; the recipe says which, where, how big and what colour, and the
 * state says what the face is doing right now: an expression, a blink, a word.
 *
 * Expressions: neutral, happy, laugh, smile, sad, angry, shy, surprised, worried,
 * thinking, grumpy, content, sleep.
 */
const TAU=Math.PI*2;
/** Mouth colours that are just a mouth; anything else is lipstick. */
export const NATURAL_LIPS=Object.freeze(['#b8544a','#a8433e','#9a4a40']);

function shade(hex,k){
 const n=parseInt(hex.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));
 return '#'+[f(n>>16),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');
}

/** Where the parts sit, in canvas units, from the recipe's sliders. */
export function faceLayout(recipe){
 const e=recipe.eyes,b=recipe.brows,n=recipe.nose,m=recipe.mouth,g=recipe.glasses||{},f=recipe.facial||{},spot=recipe.moleSpot||{};
 const eyeY=104+(e.height-.5)*-56,spread=38+(e.spacing-.5)*36,eyeS=1.16+e.size*.8;
 return {
  eyeY,spread,eyeS,eyeW:.85+(e.width??.5)*.7,eyeTilt:(e.tilt-.5)*.85,
  browY:70+(b.height-.5)*-48,browSpread:spread+((b.spacing??.5)-.5)*32,browS:.75+b.size*.6,browTilt:(b.tilt-.5)*.85,
  noseY:134+(n.height-.5)*-48,noseX:128+((n.x??.5)-.5)*48,noseS:.7+n.size*.7,
  mouthY:160+(m.height-.5)*-54,mouthX:128+((m.x??.5)-.5)*56,mouthS:1+m.size*.8,mouthW:.65+(m.width??.5)*.7,
  glassS:.7+(g.size??.5)*.6,glassY:eyeY+((g.height??.5)-.5)*-40,
  facialS:.7+(f.size??.5)*.6,facialDY:((f.height??.5)-.5)*-24,
  moleX:64+(spot.x??.77)*128,moleY:200-(spot.height??.33)*140,moleR:1.2+(spot.size??.5)*2.4,
 };
}

const MOOD=Object.freeze({
 neutral:{eyes:'open',brow:0,browLift:0,mouth:null,blush:0},
 smile:{eyes:'smiling',brow:0,browLift:3,mouth:'smile',blush:.15},
 content:{eyes:'content',brow:0,browLift:1,mouth:'smile',blush:.1},
 happy:{eyes:'happy',brow:0,browLift:10,mouth:'grin',blush:.4},
 laugh:{eyes:'happy',brow:0,browLift:14,mouth:'laugh',blush:.55},
 sad:{eyes:'sad',brow:-1,browLift:3,mouth:'frown',blush:0},
 worried:{eyes:'worry',brow:-1.35,browLift:10,mouth:'wobble',blush:0},
 angry:{eyes:'angry',brow:1.4,browLift:-5,mouth:'snarl',blush:.15},
 grumpy:{eyes:'angry',brow:.6,browLift:-2,mouth:'frown',blush:0},
 shy:{eyes:'shy',brow:-.4,browLift:3,mouth:'small',blush:1},
 surprised:{eyes:'wide',brow:0,browLift:20,mouth:'o',blush:0},
 thinking:{eyes:'side',brow:.3,browLift:0,mouth:'hmm',blush:0},
 sleep:{eyes:'closed',brow:0,browLift:-1,mouth:'small',blush:0},
});
export const EXPRESSION_NAMES=Object.freeze(Object.keys(MOOD));

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recipe normalized
 * @param {{expression?:string,blink?:number,talk?:number,look?:[number,number],size?:number}} state
 */
export function drawFace(ctx,recipe,state={}){
 const size=state.size||256,k=size/256;
 const mood=MOOD[state.expression]||MOOD.neutral;
 const L=faceLayout(recipe),skin=recipe.body.skin,line='#2b2623';
 ctx.canvas.__skin=skin;
 ctx.save();ctx.setTransform(k,0,0,k,0,0);
 ctx.fillStyle=skin;ctx.fillRect(0,0,256,256);
 ctx.lineCap='round';ctx.lineJoin='round';
 // Age, freckles, a mole: drawn first so the parts sit over them.
 if(recipe.wrinkles>.05){
  ctx.strokeStyle=shade(skin,.8);ctx.lineWidth=1.6;ctx.globalAlpha=Math.min(1,recipe.wrinkles);
  for(const s of [-1,1]){const x=128+s*(L.spread+16*L.eyeS);for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(x,L.eyeY-4+i*7);ctx.lineTo(x+s*8,L.eyeY-6+i*9);ctx.stroke();}
   ctx.beginPath();ctx.arc(128+s*22,L.mouthY-6,14,s>0?-.2:Math.PI-.6,s>0?.6:Math.PI+.2);ctx.stroke();}
  for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(104,L.browY-14-i*7);ctx.quadraticCurveTo(128,L.browY-18-i*7,152,L.browY-14-i*7);ctx.stroke();}
  ctx.globalAlpha=1;
 }
 if(recipe.freckles){ctx.fillStyle=shade(skin,.72);for(const s of [-1,1])for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(128+s*(L.spread+(i%3)*5-2),L.noseY-2+Math.floor(i/3)*6,1.5,0,TAU);ctx.fill();}}
 if(recipe.mole){ctx.fillStyle='#4a3024';ctx.beginPath();ctx.arc(L.moleX,L.moleY,L.moleR,0,TAU);ctx.fill();}
 // Blush: the recipe's own, and more when shy or pleased.
 const blush=Math.min(1,recipe.blush*.8+mood.blush);
 if(blush>.02){for(const s of [-1,1]){const x=128+s*(L.spread+8),y=L.noseY+2;const g=ctx.createRadialGradient(x,y,1,x,y,17);g.addColorStop(0,`rgba(236,110,120,${.55*blush})`);g.addColorStop(1,'rgba(236,110,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,18,12,0,0,TAU);ctx.fill();}
  if(mood.blush>=.9){ctx.strokeStyle='rgba(210,80,90,.7)';ctx.lineWidth=1.6;for(const s of [-1,1])for(let i=0;i<3;i++){const x=128+s*(L.spread+2+i*6);ctx.beginPath();ctx.moveTo(x-2,L.noseY+6);ctx.lineTo(x+2,L.noseY-2);ctx.stroke();}}}
 // Eyes.
 const blink=Math.max(0,Math.min(1,state.blink||0));
 const eyesState=blink>.5&&mood.eyes!=='happy'?'closed':mood.eyes;
 const look=state.look||[0,0];
 for(const s of [-1,1])drawEye(ctx,128+s*L.spread,L.eyeY,L.eyeS,s,recipe.eyes,eyesState,look,L.eyeTilt,L.eyeW);
 // Brows.
 if(recipe.brows.style!=='none')for(const s of [-1,1])drawBrow(ctx,128+s*L.browSpread,L.browY-mood.browLift,L.browS,s,recipe.brows,L.browTilt,mood.brow);
 drawNose(ctx,L.noseX,L.noseY,L.noseS,recipe.nose.style,skin,line);
 drawMouth(ctx,L.mouthX,L.mouthY,L.mouthS,recipe.mouth,mood.mouth,state.talk||0,line,L.mouthW);
 drawFacialHair(ctx,L,recipe.facial);
 drawGlasses(ctx,L,recipe.glasses);
 ctx.restore();
}

function drawEye(ctx,x,y,s,side,eyes,state,look,tilt,width=1){
 const style=eyes.style,line='#2b2623';
 ctx.save();ctx.translate(x,y);ctx.rotate(side*tilt*-1);ctx.scale(s*width,s);
 ctx.strokeStyle=line;ctx.fillStyle=line;ctx.lineWidth=3.2;
 // Big outlined reaction eyes stay readable across every authored eye style.
 if(state==='wide'||state==='worry'){
  const rx=state==='wide'?15:13,ry=state==='wide'?19:16;
  ctx.fillStyle='#fbfaf6';ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=eyes.colour;ctx.beginPath();ctx.ellipse(look[0]*3,look[1]*3,rx*.58,ry*.62,0,0,TAU);ctx.fill();
  ctx.fillStyle=line;ctx.beginPath();ctx.ellipse(look[0]*3,look[1]*3,rx*.36,ry*.42,0,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(3,-5,3,0,TAU);ctx.fill();
  if(style==='lashes')for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(side*rx*.8,-9+i*5);ctx.lineTo(side*(rx+6),-12+i*6);ctx.stroke();}
  ctx.restore();return;
 }
 if(state==='closed'||state==='content'){
  ctx.beginPath();ctx.arc(0,state==='content'?-3:-6,11,Math.PI*.18,Math.PI*.82);ctx.stroke();
  if(style==='lashes'){ctx.beginPath();ctx.moveTo(side*9,2);ctx.lineTo(side*14,5);ctx.stroke();}
  ctx.restore();return;
 }
 if(state==='happy'){ctx.lineWidth=5.2;ctx.beginPath();ctx.moveTo(-13,4);ctx.quadraticCurveTo(0,-21,13,4);ctx.stroke();ctx.restore();return;}
 const wide=state==='wide'?1.3:1;
 const rx=(style==='narrow'?12:style==='dot'?6:style==='sparkle'?13:style==='doe'?12.5:style==='cat'||style==='heavy'?12:11.5)*wide,
  ry=(style==='narrow'?4.2:style==='dot'?9:style==='almond'?9.5:style==='cat'?9:style==='sparkle'?15:style==='doe'?15:style==='heavy'?12:13.5)*wide;
 // Simple dark ovals and drawn lids keep emotions readable at street scale.
 // Almond and sparkle eyes retain their authored iris shapes.
 if(['round','gentle','lashes','sleepy','bright','tired','starry'].includes(style)){
  const h=(style==='sleepy'?6:style==='gentle'?9:style==='bright'?13.5:style==='tired'?11:12)*wide;
  ctx.save();ctx.beginPath();ctx.ellipse(look[0]*2,look[1]*2,(style==='bright'?10:9)*wide,h,0,0,TAU);ctx.clip();ctx.fill();
  ctx.fillStyle=ctx.canvas.__skin;
  if(state==='angry'||state==='sad'){
   const direction=state==='angry'?-side:side;
   ctx.beginPath();ctx.moveTo(-14,-h-2);ctx.lineTo(14,-h-2);ctx.lineTo(direction*14,1);ctx.closePath();ctx.fill();
  }else if(state==='shy')ctx.fillRect(-14,-h-2,28,h*.7);
  else if(state==='smiling'){ctx.beginPath();ctx.ellipse(0,h+5,15,9,0,0,TAU);ctx.fill();}
  ctx.restore();
  // One restrained catchlight gives the simple oval eyes a livelier expression.
  if(!['angry','sad','shy'].includes(state)){
   const cx=look[0]*2+2,cy=-h*.35+look[1]*2;ctx.fillStyle='#fbfaf6';ctx.beginPath();
   if(style==='starry'){for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,r=i%2?1.3:4;ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}ctx.closePath();}
   else ctx.arc(cx,cy,style==='bright'?2.6:1.8,0,TAU);
   ctx.fill();
   if(style==='bright'){ctx.beginPath();ctx.arc(look[0]*2-2.5,h*.4+look[1]*2,1.3,0,TAU);ctx.fill();}
  }
  // Tired eyes: a soft bag under each.
  if(style==='tired'){ctx.strokeStyle='rgba(43,38,35,.45)';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,h*.2,10,Math.PI*.2,Math.PI*.8);ctx.stroke();ctx.strokeStyle=line;}
  if(style==='lashes'){ctx.lineWidth=2.8;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(side*5,-5-i*3);ctx.lineTo(side*(11+i*2),-8-i*4);ctx.stroke();}}
 }else if(style==='dot'){
  ctx.beginPath();ctx.ellipse(look[0]*2,look[1]*2,rx,ry,0,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(2+look[0]*2,-3,2.2,0,TAU);ctx.fill();
 }else if(style==='narrow'){
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fill();
 }else if(style==='squint'){
  // Screwed-up, cheerful: a short thick arch.
  ctx.lineWidth=4.2;ctx.beginPath();ctx.moveTo(-11,3);ctx.quadraticCurveTo(0,-9,11,3);ctx.stroke();
 }else{
  // White, iris, pupil, a catchlight.
  ctx.fillStyle='#fbfaf6';ctx.beginPath();
  if(style==='almond'){ctx.moveTo(-rx,1);ctx.quadraticCurveTo(-2,-ry*1.5,rx,-1);ctx.quadraticCurveTo(0,ry*1.3,-rx,1);}
  // A cat's eye lifts at its outer corner.
  else if(style==='cat'){ctx.moveTo(-side*rx,2);ctx.quadraticCurveTo(0,-ry*1.5,side*rx,-4);ctx.quadraticCurveTo(0,ry*1.3,-side*rx,2);}
  else ctx.ellipse(0,0,rx,ry,0,0,TAU);
  ctx.fill();
  ctx.save();ctx.clip();
  const ir=style==='sparkle'?10:style==='doe'?8.6:7.4,ix=look[0]*4,iy=look[1]*3+(style==='gentle'?3:1);
  ctx.fillStyle=eyes.colour;ctx.beginPath();ctx.arc(ix,iy,ir,0,TAU);ctx.fill();
  ctx.fillStyle='#120c0a';ctx.beginPath();ctx.arc(ix,iy,ir*.5,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ix+ir*.38,iy-ir*.4,ir*.3,0,TAU);ctx.fill();
  if(style==='sparkle'){ctx.beginPath();ctx.arc(ix-ir*.35,iy+ir*.4,ir*.16,0,TAU);ctx.fill();}
  // Lids: what makes the eye sleepy, gentle, sad or cross.
  ctx.fillStyle=ctx.canvas.__skin||'#e8bf98';
  if(style==='sleepy'||state==='shy'){ctx.fillRect(-rx-2,-ry-2,rx*2+4,ry*.9);}
  if(style==='heavy'&&state!=='shy'){ctx.fillRect(-rx-2,-ry-2,rx*2+4,ry*.7);}
  if(style==='droopy'&&state!=='sad'){ctx.beginPath();ctx.moveTo(-rx-2,-ry-2);ctx.lineTo(rx+2,-ry-2);ctx.lineTo(side*rx+2*side,-ry*.15);ctx.closePath();ctx.fill();}
  if(state==='sad'){ctx.beginPath();ctx.moveTo(-rx-2,-ry-2);ctx.lineTo(rx+2,-ry-2);ctx.lineTo(side*rx+2*side,-ry*.1);ctx.closePath();ctx.fill();}
  if(state==='angry'){ctx.beginPath();ctx.moveTo(-rx-2,-ry-2);ctx.lineTo(rx+2,-ry-2);ctx.lineTo(-side*rx-2*side,-ry*.05);ctx.closePath();ctx.fill();}
  ctx.restore();
  ctx.lineWidth=2.4;ctx.beginPath();
  if(style==='almond'){ctx.moveTo(-rx,1);ctx.quadraticCurveTo(-2,-ry*1.5,rx,-1);ctx.stroke();}
  else if(style==='cat'){ctx.moveTo(-side*rx,2);ctx.quadraticCurveTo(0,-ry*1.5,side*rx,-4);ctx.lineTo(side*(rx+7),-9);ctx.stroke();}
  else if(style==='heavy'){ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(-rx-1,-ry*.3);ctx.quadraticCurveTo(0,-ry*.48,rx+1,-ry*.3);ctx.stroke();}
  else{ctx.ellipse(0,0,rx,ry,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
  if(style==='doe'){ctx.lineWidth=1.8;for(let i=0;i<2;i++){const a=Math.PI/2-side*(.7+i*.35);ctx.beginPath();ctx.moveTo(Math.cos(a)*rx*.95,Math.sin(a)*ry*.95);ctx.lineTo(Math.cos(a)*(rx+4),Math.sin(a)*(ry+3));ctx.stroke();}}
  if(style==='gentle'){ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,ry*.3,rx*1.02,Math.PI*1.12,Math.PI*1.88);ctx.stroke();}
  if(style==='lashes'){ctx.lineWidth=2.2;for(let i=0;i<3;i++){const a=-Math.PI/2+side*(.55+i*.28);ctx.beginPath();ctx.moveTo(Math.cos(a)*rx*.95,Math.sin(a)*ry*.95);ctx.lineTo(Math.cos(a)*(rx+6),Math.sin(a)*(ry+5));ctx.stroke();}}
 }
 if(state==='sad'){ctx.strokeStyle='rgba(120,180,230,.7)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(side*-4,ry);ctx.lineTo(side*-5,ry+8);ctx.stroke();}
 ctx.restore();
}

function drawBrow(ctx,x,y,s,side,brows,tilt,mood){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 // Positive mood tilts the inner end down (cross), negative lifts it (worried, sad).
 ctx.rotate(side*(tilt*-1+mood*.48));
 const ink=shade(brows.colour,.68);ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineCap='round';
 const style=brows.style;
 const w=style==='thick'||style==='bushy'?7:style==='thin'?2.4:style==='short'?5.4:style==='feathered'?3:4.2;
 ctx.lineWidth=w;ctx.beginPath();
 if(style==='arched'){ctx.moveTo(-13,3);ctx.quadraticCurveTo(0,-7,13,2);}
 else if(style==='worried'){ctx.moveTo(-13,-3);ctx.quadraticCurveTo(0,0,13,3);}
 else if(style==='bushy'){ctx.moveTo(-14,2);ctx.quadraticCurveTo(0,-5,14,1);ctx.stroke();ctx.lineWidth=2;for(let i=-12;i<=12;i+=4){ctx.beginPath();ctx.moveTo(i,-2);ctx.lineTo(i+2*side,-7);ctx.stroke();}ctx.restore();return;}
 // The inner end of each brow is toward the nose: -side.
 else if(style==='angled'){ctx.moveTo(-side*13,3);ctx.lineTo(side*5,-5);ctx.lineTo(side*13,1);}
 else if(style==='short'){ctx.moveTo(-6,1);ctx.quadraticCurveTo(0,-2,6,1);}
 else if(style==='rounded'){ctx.arc(0,8,13,Math.PI*1.18,Math.PI*1.82);}
 else if(style==='tapered'){ctx.moveTo(-side*13,-4);ctx.quadraticCurveTo(0,-6,side*13,0);ctx.quadraticCurveTo(0,-1,-side*13,4);ctx.closePath();ctx.fill();ctx.restore();return;}
 else if(style==='maro'){ctx.ellipse(0,-3,6.5,4.2,0,0,TAU);ctx.fill();ctx.restore();return;}
 else if(style==='feathered'){ctx.moveTo(-13,1);ctx.quadraticCurveTo(0,-4,13,1);ctx.stroke();ctx.lineWidth=1.6;for(let i=-10;i<=10;i+=4){ctx.beginPath();ctx.moveTo(i,-1);ctx.lineTo(i+3*side,-5);ctx.stroke();}ctx.restore();return;}
 else{ctx.moveTo(-13,1);ctx.quadraticCurveTo(0,-3,13,1);}
 ctx.stroke();ctx.restore();
}

function drawNose(ctx,x,y,s,style,skin,line){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=shade(skin,.62);ctx.fillStyle=shade(skin,.8);ctx.lineWidth=2.4;
 if(style==='button'){ctx.beginPath();ctx.ellipse(0,0,7,5.5,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(-2,-2,2,0,TAU);ctx.fill();}
 else if(style==='dot'){ctx.fillStyle=shade(skin,.6);for(const sx of [-3,3]){ctx.beginPath();ctx.arc(sx,0,1.6,0,TAU);ctx.fill();}}
 else if(style==='line'){ctx.beginPath();ctx.moveTo(1,-12);ctx.quadraticCurveTo(-2,0,3,4);ctx.lineTo(-3,4);ctx.stroke();}
 else if(style==='wide'){ctx.beginPath();ctx.moveTo(-10,-2);ctx.quadraticCurveTo(-11,6,-3,5);ctx.moveTo(10,-2);ctx.quadraticCurveTo(11,6,3,5);ctx.stroke();ctx.beginPath();ctx.ellipse(0,1,6,4,0,0,TAU);ctx.fill();}
 else if(style==='hook'){ctx.beginPath();ctx.moveTo(-1,-16);ctx.quadraticCurveTo(8,2,1,6);ctx.lineTo(-4,4);ctx.stroke();}
 else if(style==='pointed'){ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(5,4);ctx.lineTo(-2,4);ctx.stroke();}
 else if(style==='snub'){ctx.beginPath();ctx.moveTo(-7,1);ctx.quadraticCurveTo(0,8,7,1);ctx.stroke();ctx.fillStyle=shade(skin,.6);for(const sx of [-3,3]){ctx.beginPath();ctx.arc(sx,1.5,1.4,0,TAU);ctx.fill();}}
 else if(style==='bulb'){ctx.beginPath();ctx.ellipse(0,1,9.5,7.5,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(-3,-2,2.4,0,TAU);ctx.fill();}
 else if(style==='ridge'){ctx.beginPath();ctx.moveTo(-3,-15);ctx.quadraticCurveTo(-3.5,-1,-7,4);ctx.moveTo(3,-15);ctx.quadraticCurveTo(3.5,-1,7,4);ctx.stroke();ctx.fillStyle=shade(skin,.6);for(const sx of [-3,3]){ctx.beginPath();ctx.arc(sx,4,1.4,0,TAU);ctx.fill();}}
 ctx.restore();
}

function drawMouth(ctx,x,y,s,mouth,moodMouth,talk,line,width=1){
 ctx.save();ctx.translate(x,y);ctx.scale(s*width,s);
 const lips=mouth.colour,lipstick=!NATURAL_LIPS.includes(lips.toLowerCase());
 ctx.strokeStyle=lipstick?lips:line;ctx.lineWidth=lipstick?3.6:3.4;ctx.lineCap='round';
 const inside='#2b2623',tongue='#e07a80',teeth='#fbfaf6';
 const open=(w,h,curve=0)=>{
  ctx.fillStyle=inside;ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-curve,w,0);ctx.quadraticCurveTo(0,h*2,-w,0);ctx.fill();
  ctx.save();ctx.clip();ctx.fillStyle=teeth;ctx.fillRect(-w,-h,w*2,h*.55+curve*.2);ctx.fillStyle=tongue;ctx.beginPath();ctx.ellipse(0,h*1.3,w*.55,h*.55,0,0,TAU);ctx.fill();ctx.restore();
  ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-curve,w,0);ctx.quadraticCurveTo(0,h*2,-w,0);ctx.stroke();
 };
 const shape=talk>.5?'talk':moodMouth||mouth.style;
 ctx.beginPath();
 switch(shape){
  case 'talk':{const big=['grin','laugh','o'].includes(moodMouth);open(big?19:12,(big?13:7)+talk*3,big?6:2);break;}
  case 'grin':open(24,15,5);break;
  case 'laugh':open(28,23,7);break;
  case 'o':ctx.fillStyle=inside;ctx.ellipse(0,3,13,20,0,0,TAU);ctx.fill();ctx.stroke();break;
  case 'frown':ctx.arc(0,12,13,Math.PI*1.2,Math.PI*1.8);ctx.stroke();break;
  case 'snarl':ctx.moveTo(-12,4);ctx.lineTo(-4,0);ctx.lineTo(4,0);ctx.lineTo(12,4);ctx.stroke();break;
  case 'wobble':ctx.moveTo(-14,1);ctx.quadraticCurveTo(0,5,14,1);ctx.moveTo(-14,-4);ctx.quadraticCurveTo(-10,1,-14,7);ctx.moveTo(14,-4);ctx.quadraticCurveTo(10,1,14,7);ctx.stroke();break;
  case 'hmm':ctx.moveTo(-8,2);ctx.lineTo(8,-1);ctx.stroke();break;
  case 'smile':ctx.moveTo(-16,-1);ctx.quadraticCurveTo(0,15,16,-1);ctx.stroke();break;
  case 'flat':ctx.moveTo(-11,1);ctx.lineTo(11,1);ctx.stroke();break;
  case 'small':ctx.arc(0,-3,6,Math.PI*.25,Math.PI*.75);ctx.stroke();break;
  case 'wide':ctx.arc(0,-10,18,Math.PI*.22,Math.PI*.78);ctx.stroke();break;
  case 'smirk':ctx.moveTo(-10,2);ctx.quadraticCurveTo(2,4,11,-4);ctx.stroke();break;
  case 'pout':ctx.fillStyle=lips;ctx.ellipse(0,1,6,4.5,0,0,TAU);ctx.fill();break;
  case 'cat':ctx.moveTo(-12,-2);ctx.quadraticCurveTo(-6,7,0,-1);ctx.quadraticCurveTo(6,7,12,-2);ctx.stroke();break;
  case 'teeth':ctx.fillStyle=teeth;if(ctx.roundRect)ctx.roundRect(-13,-4,26,9,4);else ctx.rect(-13,-4,26,9);ctx.fill();ctx.stroke();ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-12,.5);ctx.lineTo(12,.5);ctx.stroke();break;
  case 'open':open(10,6,1);break;
  case 'lopsided':ctx.moveTo(-14,3);ctx.quadraticCurveTo(-2,7,12,-6);ctx.stroke();break;
  case 'tongue':ctx.moveTo(-15,-1);ctx.quadraticCurveTo(0,13,15,-1);ctx.stroke();ctx.fillStyle=tongue;ctx.beginPath();ctx.ellipse(4,8,5,5.5,0,0,Math.PI);ctx.fill();ctx.lineWidth=2;ctx.stroke();break;
  case 'buck':ctx.moveTo(-14,-1);ctx.quadraticCurveTo(0,10,14,-1);ctx.stroke();ctx.fillStyle=teeth;ctx.lineWidth=1.6;for(const x of [-4.5,0]){ctx.beginPath();ctx.rect(x,4,4.5,5.5);ctx.fill();ctx.stroke();}break;
  case 'soft':ctx.moveTo(-9,0);ctx.quadraticCurveTo(0,7,9,0);ctx.stroke();break;
  default:ctx.arc(0,-8,13,Math.PI*.2,Math.PI*.8);ctx.stroke();
 }
 // Lipstick is worn as a colour, not just a line.
 if(lipstick&&['smile','small','wide','flat','smirk','wobble','soft','lopsided'].includes(shape)){ctx.fillStyle=lips;ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(0,2,shape==='wide'?13:9,3.2,0,0,TAU);ctx.fill();ctx.globalAlpha=1;}
 ctx.restore();
}

/** Moustache and beard, from a normalized recipe or an older one that gave one `style`. */
const MOUSTACHES=['moustache','walrus','handlebar','pencil'];
function facialParts(facial){
 if(facial.moustache!==undefined||facial.beard!==undefined)return {moustache:facial.moustache||'none',beard:facial.beard||'none'};
 return {moustache:MOUSTACHES.includes(facial.style)?facial.style:'none',beard:facial.style&&facial.style!=='none'&&!MOUSTACHES.includes(facial.style)?facial.style:'none'};
}
function drawFacialHair(ctx,L,facial){
 const {moustache,beard}=facialParts(facial);
 if(moustache==='none'&&beard==='none')return;
 const S=L.facialS??1,DY=L.facialDY??0;
 ctx.save();ctx.fillStyle=facial.colour;ctx.strokeStyle=facial.colour;ctx.lineCap='round';
 // The beard first, sized about the mouth and moved with the moustache, which sits over it.
 if(beard!=='none'){
  ctx.save();ctx.translate(128,L.mouthY+DY*.5);ctx.scale(S,S);ctx.translate(-128,-L.mouthY);
  if(beard==='stubble'){ctx.globalAlpha=.35;for(let i=0;i<140;i++){const a=Math.PI*(.1+.8*(i%47)/46),r=46+(i*7%11);const x=128+Math.cos(a)*r*.95,yy=L.mouthY-26+Math.sin(a)*r*.8;if(yy>L.noseY+8){ctx.fillRect(x,yy,1.6,1.6);}}ctx.globalAlpha=1;}
  else if(beard==='beard'){ctx.beginPath();ctx.moveTo(84,L.noseY);ctx.quadraticCurveTo(90,L.mouthY+40,128,L.mouthY+42);ctx.quadraticCurveTo(166,L.mouthY+40,172,L.noseY);ctx.lineTo(160,L.noseY+4);ctx.quadraticCurveTo(150,L.mouthY+18,128,L.mouthY+16);ctx.quadraticCurveTo(106,L.mouthY+18,96,L.noseY+4);ctx.closePath();ctx.fill();}
  else if(beard==='goatee'){ctx.beginPath();ctx.ellipse(128,L.mouthY+18,9,11,0,0,TAU);ctx.fill();}
  else if(beard==='chinstrap'){ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(86,L.noseY+2);ctx.quadraticCurveTo(92,L.mouthY+38,128,L.mouthY+40);ctx.quadraticCurveTo(164,L.mouthY+38,170,L.noseY+2);ctx.stroke();}
  ctx.restore();
 }
 if(moustache!=='none'){
  const y=(L.noseY+L.mouthY)/2+2;
  ctx.save();ctx.translate(128,y+DY);ctx.scale(S,S);ctx.translate(-128,-y);
  if(moustache==='moustache'||moustache==='handlebar'){ctx.beginPath();ctx.moveTo(128,y-3);ctx.quadraticCurveTo(114,y-6,108,y+3);ctx.quadraticCurveTo(118,y+1,128,y+2);ctx.quadraticCurveTo(138,y+1,148,y+3);ctx.quadraticCurveTo(142,y-6,128,y-3);ctx.fill();}
  // A handlebar's ends curl up and round.
  if(moustache==='handlebar'){ctx.lineWidth=3;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(128+s*19,y+2);ctx.quadraticCurveTo(128+s*28,y+2,128+s*27,y-6);ctx.quadraticCurveTo(128+s*25,y-9,128+s*23,y-6);ctx.stroke();}}
  else if(moustache==='walrus'){ctx.beginPath();ctx.ellipse(128,y+1,24,8,0,0,TAU);ctx.fill();}
  else if(moustache==='pencil'){ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(113,y+1);ctx.quadraticCurveTo(128,y-3,143,y+1);ctx.stroke();}
  ctx.restore();
 }
 ctx.restore();
}

function drawGlasses(ctx,L,glasses){
 if(glasses.style==='none')return;
 ctx.save();ctx.strokeStyle=glasses.colour;ctx.lineWidth=3.2;
 const r=(15*L.eyeS+2)*(L.glassS??1),y=L.glassY??L.eyeY,rx=r*L.eyeW;
 for(const s of [-1,1]){
  const x=128+s*L.spread;ctx.beginPath();
  if(glasses.style==='round')ctx.ellipse(x,y,rx,r,0,0,TAU);
  else if(glasses.style==='half')ctx.ellipse(x,y-2,rx,r,0,Math.PI*.05,Math.PI*.95);
  else if(ctx.roundRect)ctx.roundRect(x-rx*1.1,y-r*.8,rx*2.2,r*1.6,6);else ctx.rect(x-rx*1.1,y-r*.8,rx*2.2,r*1.6);
  if(glasses.style==='sun'){ctx.fillStyle='rgba(30,34,40,.9)';ctx.fill();}
  ctx.stroke();
  if(glasses.style!=='sun'){ctx.save();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+r*.3,y-r*.55);ctx.lineTo(x+r*.6,y-r*.25);ctx.stroke();ctx.restore();}
 }
 ctx.beginPath();ctx.moveTo(128-L.spread+rx*(glasses.style==='round'||glasses.style==='half'?1:1.1),y-2);ctx.quadraticCurveTo(128,y-8,128+L.spread-rx*(glasses.style==='round'||glasses.style==='half'?1:1.1),y-2);ctx.stroke();
 ctx.restore();
}

/**
 * One feature on its own, centred and enlarged on a skin-coloured tile: the pictures in
 * the maker's part grids. Drawn with the same painters as the face, so a part looks in
 * the grid exactly as it will on the head.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} recipe normalized
 * @param {'eyes'|'brows'|'nose'|'mouth'|'glasses'|'facial'|'moustache'|'beard'} part
 * @param {number} [size] canvas size in pixels
 */
export function drawPart(ctx,recipe,part,size=ctx.canvas.width){
 const skin=recipe.body.skin,line='#2b2623';
 // A neutral layout, so every tile in a grid is framed alike whatever the sliders say.
 const flat={...recipe,eyes:{...recipe.eyes,height:.5,spacing:.5,size:.5,tilt:.5},brows:{...recipe.brows,height:.5,spacing:.5,size:.5,tilt:.5},
  nose:{...recipe.nose,height:.5,x:.5,size:.5},mouth:{...recipe.mouth,height:.5,x:.5,size:.5,width:.5},
  glasses:{...recipe.glasses,size:.5,height:.5},facial:{...recipe.facial,size:.5,height:.5}};
 // The moustache and beard grids each show their own half alone.
 const fp=facialParts(recipe.facial);
 const facial=part==='moustache'?{...flat.facial,moustache:fp.moustache,beard:'none'}:part==='beard'?{...flat.facial,moustache:'none',beard:fp.beard}:flat.facial;
 const shown=part==='moustache'?fp.moustache:part==='beard'?fp.beard:facial.beard!=='none'?facial.beard:fp.moustache;
 const L=faceLayout(flat);
 const focus={eyes:[128,L.eyeY,1.75],glasses:[128,L.eyeY,1.6],brows:[128,L.browY,2],nose:[128,L.noseY,3.4],mouth:[128,L.mouthY+2,2.7],facial:[128,(L.noseY+L.mouthY)/2+(['beard','chinstrap'].includes(shown)?18:shown==='goatee'?14:2),['beard','chinstrap'].includes(shown)?1.5:2.2]}[part==='moustache'||part==='beard'?'facial':part]||[128,128,1];
 const k=size/256;
 ctx.save();ctx.setTransform(k,0,0,k,0,0);
 ctx.canvas.__skin=skin;ctx.fillStyle=skin;ctx.fillRect(0,0,256,256);
 ctx.translate(128,128);ctx.scale(focus[2],focus[2]);ctx.translate(-focus[0],-focus[1]);
 ctx.lineCap='round';ctx.lineJoin='round';
 if(part==='eyes'||part==='glasses')for(const s of [-1,1])drawEye(ctx,128+s*L.spread,L.eyeY,L.eyeS,s,flat.eyes,'open',[0,0],L.eyeTilt,L.eyeW);
 if(part==='brows'&&recipe.brows.style!=='none')for(const s of [-1,1])drawBrow(ctx,128+s*L.browSpread,L.browY,L.browS,s,flat.brows,L.browTilt,0);
 if(part==='nose')drawNose(ctx,L.noseX,L.noseY,L.noseS,recipe.nose.style,skin,line);
 if(part==='mouth')drawMouth(ctx,L.mouthX,L.mouthY,L.mouthS,flat.mouth,null,0,line,L.mouthW);
 if(part==='facial'||part==='moustache'||part==='beard'){drawMouth(ctx,L.mouthX,L.mouthY,L.mouthS,{...flat.mouth,style:'flat'},null,0,'rgba(43,38,35,.35)',L.mouthW);drawFacialHair(ctx,L,facial);}
 if(part==='glasses')drawGlasses(ctx,L,flat.glasses);
 ctx.restore();
 // "None" reads as an empty tile with a soft slash, the way a blank slot should.
 const empty=(part==='brows'&&recipe.brows.style==='none')||(part==='nose'&&recipe.nose.style==='none')||(part==='glasses'&&recipe.glasses.style==='none')||(['facial','moustache','beard'].includes(part)&&shown==='none');
 if(empty){ctx.save();ctx.strokeStyle='rgba(43,38,35,.25)';ctx.lineWidth=size*.04;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(size*.3,size*.7);ctx.lineTo(size*.7,size*.3);ctx.stroke();ctx.restore();}
}

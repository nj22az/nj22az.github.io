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
 const e=recipe.eyes,b=recipe.brows,n=recipe.nose,m=recipe.mouth;
 const eyeY=112+(e.height-.5)*-36,spread=30+(e.spacing-.5)*26,eyeS=.78+e.size*.62;
 return {
  eyeY,spread,eyeS,eyeTilt:(e.tilt-.5)*.55,
  browY:eyeY-24*eyeS-4+(b.height-.5)*-22,browS:.75+b.size*.6,browTilt:(b.tilt-.5)*.6,
  noseY:eyeY+30+(n.height-.5)*-20,noseS:.7+n.size*.7,
  mouthY:eyeY+56+(m.height-.5)*-24,mouthS:.7+m.size*.7,
 };
}

const MOOD=Object.freeze({
 neutral:{eyes:'open',brow:0,browLift:0,mouth:null,blush:0},
 smile:{eyes:'open',brow:0,browLift:2,mouth:'smile',blush:.1},
 content:{eyes:'content',brow:0,browLift:1,mouth:'smile',blush:.1},
 happy:{eyes:'happy',brow:0,browLift:4,mouth:'grin',blush:.25},
 laugh:{eyes:'happy',brow:0,browLift:6,mouth:'laugh',blush:.35},
 sad:{eyes:'sad',brow:-1,browLift:3,mouth:'frown',blush:0},
 worried:{eyes:'open',brow:-1,browLift:3,mouth:'wobble',blush:0},
 angry:{eyes:'angry',brow:1,browLift:-3,mouth:'snarl',blush:.15},
 grumpy:{eyes:'angry',brow:.6,browLift:-2,mouth:'frown',blush:0},
 shy:{eyes:'shy',brow:-.4,browLift:2,mouth:'wobble',blush:1},
 surprised:{eyes:'wide',brow:0,browLift:10,mouth:'o',blush:0},
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
 const L=faceLayout(recipe),skin=recipe.body.skin,line='#2a1d16';
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
 if(recipe.mole){ctx.fillStyle='#4a3024';ctx.beginPath();ctx.arc(128+L.spread*.9,L.mouthY-6,2.4,0,TAU);ctx.fill();}
 // Blush: the recipe's own, and more when shy or pleased.
 const blush=Math.min(1,recipe.blush*.8+mood.blush);
 if(blush>.02){for(const s of [-1,1]){const x=128+s*(L.spread+8),y=L.noseY+2;const g=ctx.createRadialGradient(x,y,1,x,y,17);g.addColorStop(0,`rgba(236,110,120,${.55*blush})`);g.addColorStop(1,'rgba(236,110,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,18,12,0,0,TAU);ctx.fill();}
  if(mood.blush>=.9){ctx.strokeStyle='rgba(210,80,90,.7)';ctx.lineWidth=1.6;for(const s of [-1,1])for(let i=0;i<3;i++){const x=128+s*(L.spread+2+i*6);ctx.beginPath();ctx.moveTo(x-2,L.noseY+6);ctx.lineTo(x+2,L.noseY-2);ctx.stroke();}}}
 // Eyes.
 const blink=Math.max(0,Math.min(1,state.blink||0));
 const eyesState=blink>.5&&mood.eyes!=='happy'?'closed':mood.eyes;
 const look=state.look||[0,0];
 for(const s of [-1,1])drawEye(ctx,128+s*L.spread,L.eyeY,L.eyeS,s,recipe.eyes,eyesState,look,L.eyeTilt);
 // Brows.
 if(recipe.brows.style!=='none')for(const s of [-1,1])drawBrow(ctx,128+s*L.spread,L.browY-mood.browLift,L.browS,s,recipe.brows,L.browTilt,mood.brow);
 drawNose(ctx,128,L.noseY,L.noseS,recipe.nose.style,skin,line);
 drawMouth(ctx,128,L.mouthY,L.mouthS,recipe.mouth,mood.mouth,state.talk||0,line);
 drawFacialHair(ctx,L,recipe.facial);
 drawGlasses(ctx,L,recipe.glasses);
 ctx.restore();
}

function drawEye(ctx,x,y,s,side,eyes,state,look,tilt){
 const style=eyes.style,line='#241a14';
 ctx.save();ctx.translate(x,y);ctx.rotate(side*tilt*-1);ctx.scale(s,s);
 ctx.strokeStyle=line;ctx.fillStyle=line;ctx.lineWidth=2.6;
 if(state==='closed'||state==='content'){
  ctx.beginPath();ctx.arc(0,state==='content'?-3:-6,11,Math.PI*.18,Math.PI*.82);ctx.stroke();
  if(style==='lashes'){ctx.beginPath();ctx.moveTo(side*9,2);ctx.lineTo(side*14,5);ctx.stroke();}
  ctx.restore();return;
 }
 if(state==='happy'){ctx.lineWidth=3.2;ctx.beginPath();ctx.arc(0,6,11,Math.PI*1.15,Math.PI*1.85);ctx.stroke();ctx.restore();return;}
 const wide=state==='wide'?1.18:1;
 const rx=(style==='narrow'?12:style==='dot'?6:style==='sparkle'?13:11.5)*wide,ry=(style==='narrow'?4.2:style==='dot'?9:style==='almond'?9.5:style==='sparkle'?15:13.5)*wide;
 if(style==='dot'){
  ctx.beginPath();ctx.ellipse(look[0]*2,look[1]*2,rx,ry,0,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(2+look[0]*2,-3,2.2,0,TAU);ctx.fill();
 }else if(style==='narrow'){
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.fill();
 }else{
  // White, iris, pupil, a catchlight.
  ctx.fillStyle='#fbfaf6';ctx.beginPath();
  if(style==='almond'){ctx.moveTo(-rx,1);ctx.quadraticCurveTo(-2,-ry*1.5,rx,-1);ctx.quadraticCurveTo(0,ry*1.3,-rx,1);}
  else ctx.ellipse(0,0,rx,ry,0,0,TAU);
  ctx.fill();
  ctx.save();ctx.clip();
  const ir=style==='sparkle'?10:7.4,ix=look[0]*4,iy=look[1]*3+(style==='gentle'?3:1);
  ctx.fillStyle=eyes.colour;ctx.beginPath();ctx.arc(ix,iy,ir,0,TAU);ctx.fill();
  ctx.fillStyle='#120c0a';ctx.beginPath();ctx.arc(ix,iy,ir*.5,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ix+ir*.38,iy-ir*.4,ir*.3,0,TAU);ctx.fill();
  if(style==='sparkle'){ctx.beginPath();ctx.arc(ix-ir*.35,iy+ir*.4,ir*.16,0,TAU);ctx.fill();}
  // Lids: what makes the eye sleepy, gentle, sad or cross.
  ctx.fillStyle=ctx.canvas.__skin||'#e8bf98';
  if(style==='sleepy'||state==='shy'){ctx.fillRect(-rx-2,-ry-2,rx*2+4,ry*.9);}
  if(state==='sad'){ctx.beginPath();ctx.moveTo(-rx-2,-ry-2);ctx.lineTo(rx+2,-ry-2);ctx.lineTo(side*rx+2*side,-ry*.1);ctx.closePath();ctx.fill();}
  if(state==='angry'){ctx.beginPath();ctx.moveTo(-rx-2,-ry-2);ctx.lineTo(rx+2,-ry-2);ctx.lineTo(-side*rx-2*side,-ry*.05);ctx.closePath();ctx.fill();}
  ctx.restore();
  ctx.lineWidth=2.4;ctx.beginPath();
  if(style==='almond'){ctx.moveTo(-rx,1);ctx.quadraticCurveTo(-2,-ry*1.5,rx,-1);ctx.stroke();}
  else{ctx.ellipse(0,0,rx,ry,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
  if(style==='gentle'){ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,ry*.3,rx*1.02,Math.PI*1.12,Math.PI*1.88);ctx.stroke();}
  if(style==='lashes'){ctx.lineWidth=2.2;for(let i=0;i<3;i++){const a=-Math.PI/2+side*(.55+i*.28);ctx.beginPath();ctx.moveTo(Math.cos(a)*rx*.95,Math.sin(a)*ry*.95);ctx.lineTo(Math.cos(a)*(rx+6),Math.sin(a)*(ry+5));ctx.stroke();}}
 }
 if(state==='sad'){ctx.strokeStyle='rgba(120,180,230,.7)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(side*-4,ry);ctx.lineTo(side*-5,ry+8);ctx.stroke();}
 ctx.restore();
}

function drawBrow(ctx,x,y,s,side,brows,tilt,mood){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 // Positive mood tilts the inner end down (cross), negative lifts it (worried, sad).
 ctx.rotate(side*(tilt*-1+mood*.38));
 ctx.strokeStyle=brows.colour;ctx.fillStyle=brows.colour;ctx.lineCap='round';
 const style=brows.style;
 const w=style==='thick'||style==='bushy'?7:style==='thin'?2.4:4.2;
 ctx.lineWidth=w;ctx.beginPath();
 if(style==='arched'){ctx.moveTo(-13,3);ctx.quadraticCurveTo(0,-7,13,2);}
 else if(style==='worried'){ctx.moveTo(-13,-3);ctx.quadraticCurveTo(0,0,13,3);}
 else if(style==='bushy'){ctx.moveTo(-14,2);ctx.quadraticCurveTo(0,-5,14,1);ctx.stroke();ctx.lineWidth=2;for(let i=-12;i<=12;i+=4){ctx.beginPath();ctx.moveTo(i,-2);ctx.lineTo(i+2*side,-7);ctx.stroke();}ctx.restore();return;}
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
 ctx.restore();
}

function drawMouth(ctx,x,y,s,mouth,moodMouth,talk,line){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 const lips=mouth.colour,lipstick=!NATURAL_LIPS.includes(lips.toLowerCase());
 ctx.strokeStyle=lipstick?lips:shade(lips,.75);ctx.lineWidth=lipstick?3.6:2.8;ctx.lineCap='round';
 const inside='#6a2626',tongue='#e07a80',teeth='#fbfaf6';
 const open=(w,h,curve=0)=>{
  ctx.fillStyle=inside;ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-curve,w,0);ctx.quadraticCurveTo(0,h*2,-w,0);ctx.fill();
  ctx.save();ctx.clip();ctx.fillStyle=teeth;ctx.fillRect(-w,-h,w*2,h*.55+curve*.2);ctx.fillStyle=tongue;ctx.beginPath();ctx.ellipse(0,h*1.3,w*.55,h*.55,0,0,TAU);ctx.fill();ctx.restore();
  ctx.beginPath();ctx.moveTo(-w,0);ctx.quadraticCurveTo(0,-curve,w,0);ctx.quadraticCurveTo(0,h*2,-w,0);ctx.stroke();
 };
 const shape=talk>.5?'talk':moodMouth||mouth.style;
 ctx.beginPath();
 switch(shape){
  case 'talk':open(10,6+talk*3,2);break;
  case 'grin':open(14,7,3);break;
  case 'laugh':open(16,11,4);break;
  case 'o':ctx.fillStyle=inside;ctx.ellipse(0,2,6,8,0,0,TAU);ctx.fill();ctx.stroke();break;
  case 'frown':ctx.arc(0,12,13,Math.PI*1.2,Math.PI*1.8);ctx.stroke();break;
  case 'snarl':ctx.moveTo(-12,4);ctx.lineTo(-4,0);ctx.lineTo(4,0);ctx.lineTo(12,4);ctx.stroke();break;
  case 'wobble':ctx.moveTo(-10,1);ctx.quadraticCurveTo(-5,-3,0,1);ctx.quadraticCurveTo(5,5,10,1);ctx.stroke();break;
  case 'hmm':ctx.moveTo(-8,2);ctx.lineTo(8,-1);ctx.stroke();break;
  case 'flat':ctx.moveTo(-11,1);ctx.lineTo(11,1);ctx.stroke();break;
  case 'small':ctx.arc(0,-3,6,Math.PI*.25,Math.PI*.75);ctx.stroke();break;
  case 'wide':ctx.arc(0,-10,18,Math.PI*.22,Math.PI*.78);ctx.stroke();break;
  case 'smirk':ctx.moveTo(-10,2);ctx.quadraticCurveTo(2,4,11,-4);ctx.stroke();break;
  case 'pout':ctx.fillStyle=lips;ctx.ellipse(0,1,6,4.5,0,0,TAU);ctx.fill();break;
  default:ctx.arc(0,-8,13,Math.PI*.2,Math.PI*.8);ctx.stroke();
 }
 // Lipstick is worn as a colour, not just a line.
 if(lipstick&&['smile','small','wide','flat','smirk','wobble'].includes(shape)){ctx.fillStyle=lips;ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(0,2,shape==='wide'?13:9,3.2,0,0,TAU);ctx.fill();ctx.globalAlpha=1;}
 ctx.restore();
}

function drawFacialHair(ctx,L,facial){
 if(facial.style==='none')return;
 ctx.save();ctx.fillStyle=facial.colour;ctx.strokeStyle=facial.colour;
 const y=(L.noseY+L.mouthY)/2+2;
 if(facial.style==='moustache'){ctx.beginPath();ctx.moveTo(128,y-3);ctx.quadraticCurveTo(114,y-6,108,y+3);ctx.quadraticCurveTo(118,y+1,128,y+2);ctx.quadraticCurveTo(138,y+1,148,y+3);ctx.quadraticCurveTo(142,y-6,128,y-3);ctx.fill();}
 else if(facial.style==='walrus'){ctx.beginPath();ctx.ellipse(128,y+1,24,8,0,0,TAU);ctx.fill();}
 else if(facial.style==='stubble'){ctx.globalAlpha=.35;for(let i=0;i<140;i++){const a=Math.PI*(.1+.8*(i%47)/46),r=46+(i*7%11);const x=128+Math.cos(a)*r*.95,yy=L.mouthY-26+Math.sin(a)*r*.8;if(yy>L.noseY+8){ctx.fillRect(x,yy,1.6,1.6);}}ctx.globalAlpha=1;}
 else if(facial.style==='beard'){ctx.beginPath();ctx.moveTo(84,L.noseY);ctx.quadraticCurveTo(90,L.mouthY+40,128,L.mouthY+42);ctx.quadraticCurveTo(166,L.mouthY+40,172,L.noseY);ctx.lineTo(160,L.noseY+4);ctx.quadraticCurveTo(150,L.mouthY+18,128,L.mouthY+16);ctx.quadraticCurveTo(106,L.mouthY+18,96,L.noseY+4);ctx.closePath();ctx.fill();}
 else if(facial.style==='goatee'){ctx.beginPath();ctx.ellipse(128,L.mouthY+18,9,11,0,0,TAU);ctx.fill();}
 ctx.restore();
}

function drawGlasses(ctx,L,glasses){
 if(glasses.style==='none')return;
 ctx.save();ctx.strokeStyle=glasses.colour;ctx.lineWidth=3.2;
 const r=15*L.eyeS+2,y=L.eyeY;
 for(const s of [-1,1]){
  const x=128+s*L.spread;ctx.beginPath();
  if(glasses.style==='round')ctx.arc(x,y,r,0,TAU);
  else if(glasses.style==='half')ctx.arc(x,y-2,r,Math.PI*.05,Math.PI*.95);
  else if(ctx.roundRect)ctx.roundRect(x-r*1.1,y-r*.8,r*2.2,r*1.6,6);else ctx.rect(x-r*1.1,y-r*.8,r*2.2,r*1.6);
  if(glasses.style==='sun'){ctx.fillStyle='rgba(30,34,40,.9)';ctx.fill();}
  ctx.stroke();
  if(glasses.style!=='sun'){ctx.save();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+r*.3,y-r*.55);ctx.lineTo(x+r*.6,y-r*.25);ctx.stroke();ctx.restore();}
 }
 ctx.beginPath();ctx.moveTo(128-L.spread+r*(glasses.style==='round'||glasses.style==='half'?1:1.1),y-2);ctx.quadraticCurveTo(128,y-8,128+L.spread-r*(glasses.style==='round'||glasses.style==='half'?1:1.1),y-2);ctx.stroke();
 ctx.restore();
}

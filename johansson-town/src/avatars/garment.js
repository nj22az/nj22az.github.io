import * as THREE from '../../vendor/three.module.js';

/**
 * The shirt, painted.
 *
 * Collars, plackets, buttons, pockets and prints used to be little pieces of geometry
 * stuck on the torso -- white triangles, grey balls, flowers half sunk into the cloth --
 * each with its own ink outline. Close up it read as clutter. A Tomodachi Life Mii wears
 * one smooth garment with its details drawn on: a collar is a shape with a line round
 * it, a button is a dot. So the torso keeps its vertex colour (the cloth, which the ink
 * outline follows) and a texture laid round it by angle and height draws the details
 * over it. Transparent texels leave the cloth as it is.
 *
 * The texture: u runs once round the body, 0.5 at the front (+z) and the seam at the
 * back; v carries the torso from just below the hips (t=T0) to the top of the neck
 * (t=T1). The strip under V0 is left empty for every other part of the body to sample.
 */
export const GARMENT=Object.freeze({width:512,height:256,V0:.06,T0:-.1,T1:1.05});
/** Where every part that is not the torso samples: the empty strip. */
export const PLAIN_UV=Object.freeze([.5,.02]);

/** The torso's UV at a model-space point, from the lathe's angle and the torso height. */
export function torsoUV(p,m){
 const u=.5+Math.atan2(p.x/(m.width/2),p.z/(m.depth/2))/(Math.PI*2);
 const t=(p.y-m.hipY)/m.torso;
 return [u,GARMENT.V0+(1-GARMENT.V0)*THREE.MathUtils.clamp((t-GARMENT.T0)/(GARMENT.T1-GARMENT.T0),0,1)];
}

const shade=(hex,f)=>'#'+new THREE.Color(hex).multiplyScalar(f).getHexString();
const lighten=(hex,f)=>'#'+new THREE.Color(hex).lerp(new THREE.Color('#ffffff'),f).getHexString();
const COLLARED=['polo','blouse','kariyushi','jacket','smock','cardigan'];

/**
 * Paints a top's details onto ctx. Pure drawing from the recipe and the body's
 * measurements; returns the list of what was drawn, for tests and the studio.
 */
export function paintGarment(ctx,recipe,m,radiusAt){
 const {width:TW,height:TH,V0,T0,T1}=GARMENT,o=recipe.outfit,top=o.topColour,marks=[];
 ctx.clearRect(0,0,TW,TH);
 const W=m.width,D=m.depth;
 const Y=t=>(1-(V0+(1-V0)*(t-T0)/(T1-T0)))*TH;
 // The angle round the lathe at which the cloth is x metres across from the centre line.
 const theta=(x,t)=>Math.asin(THREE.MathUtils.clamp(x/(W/2*Math.max(.05,radiusAt(t))),-1,1));
 const X=(x,t,back=false)=>{const a=theta(x,t);return (.5+(back?Math.PI-a:a)/(Math.PI*2))*TW;};
 const pxPerY=(1-V0)*TH/((T1-T0)*m.torso);
 const pxPerX=(a,t)=>TW/(Math.PI*2)/(Math.max(.05,radiusAt(t))*Math.hypot(W/2*Math.cos(a),D/2*Math.sin(a)));
 const ink=shade(top,.5),line=Math.max(1.5,TW/300);
 // The back straddles the seam at u=1: draw it once each side.
 const wrapped=(back,fn)=>{fn();if(back){ctx.save();ctx.translate(-TW,0);fn();ctx.restore();}};
 const poly=(pts,fill,{stroke=ink,back=false,width=line}={})=>wrapped(back,()=>{
  ctx.beginPath();pts.forEach(([x,t],i)=>{const px=X(x,t,back),py=Y(t);i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}
 });
 const path=(pts,stroke,width=line,back=false)=>{ctx.beginPath();pts.forEach(([x,t],i)=>{const px=X(x,t,back),py=Y(t);i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 // A round thing of radius r metres at x,t on the front, kept round on the curved cloth.
 const dotAt=(x,t,r,fill,stroke=null)=>{
  const a=theta(x,t);ctx.beginPath();ctx.ellipse(X(x,t),Y(t),r*pxPerX(a,t),r*pxPerY,0,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line*.8;ctx.stroke();}
 };
 const buttons=(ts,r,fill)=>{for(const t of ts)dotAt(0,t,r*m.k,fill,shade(fill,.6));marks.push('buttons:'+ts.length);};
 const k=m.k,neck=.92,hem=.15;

 // Stripes and prints first, so collars and pockets sit over them.
 if(o.pattern==='stripes'&&!['tank','overalls','sundress'].includes(o.top)){
  const band=m.torso*.12*pxPerY,from=Y(1.0),to=Y(hem);
  ctx.fillStyle='#f4f1ea';for(let y=to-band;y>from;y-=band*2)ctx.fillRect(0,Math.max(from,y-band),TW,Math.min(band,y-from));
  marks.push('stripes');
 }
 if(o.pattern==='flowers'||o.pattern==='dots'){
  const flowers=o.pattern==='flowers',big=o.top==='kariyushi';
  const r=k*(flowers?(big?.05:.036):.016),petal=flowers?'#f8f6ef':o.accent,centre='#f4c83c';
  // A half-drop repeat, as printed cloth is, with a little play so it is not a grid.
  const cols=flowers?(big?7:8):14,rows=flowers?(big?4:5):9,spots=[];
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const j=Math.abs(Math.sin(row*12.9898+col*78.233)*43758.5453)%1;
   spots.push([((col+(row%2)*.5+j*.18)/cols)*Math.PI*2-Math.PI,hem+.07+(row+.5+j*.15)/rows*(neck-hem-.1),row*cols+col]);
  }
  for(const [a,t,i] of spots){
   // Leave the button line clear on a shirt that opens down the front.
   if(COLLARED.includes(o.top)&&Math.abs(a)<.2)continue;
   const cx=(.5+a/(Math.PI*2))*TW,cy=Y(t),sx=r*pxPerX(a,t),sy=r*pxPerY;
   for(const off of [0,-TW,TW]){
    ctx.save();ctx.translate(cx+off,cy);ctx.scale(sx,sy);ctx.rotate(i*.7);
    if(flowers){
     ctx.fillStyle=petal;for(let p=0;p<5;p++){ctx.beginPath();ctx.ellipse(Math.cos(p*1.2566)*.5,Math.sin(p*1.2566)*.5,.42,.42,0,0,Math.PI*2);ctx.fill();}
     ctx.fillStyle=centre;ctx.beginPath();ctx.arc(0,0,.28,0,Math.PI*2);ctx.fill();
    }else{ctx.fillStyle=petal;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();}
    ctx.restore();
   }
  }
  marks.push(o.pattern);
 }

 // The neckline: a rib round a crew neck, the opening of a shirt.
 const rib=(colour=shade(top,.86))=>{ctx.fillStyle=colour;ctx.fillRect(0,Y(1.03),TW,Y(.985)-Y(1.03));ctx.strokeStyle=ink;ctx.lineWidth=line*.8;ctx.beginPath();ctx.moveTo(0,Y(.985));ctx.lineTo(TW,Y(.985));ctx.stroke();marks.push('neckline');};
 // A pair of folded collar points either side of the front, out from the neck.
 const collar=(fill,{drop=.84,spread=.115,round=false}={})=>{
  for(const s of [-1,1]){
   if(round){
    const pts=[];for(let i=0;i<=10;i++){const a=i/10*Math.PI;pts.push([s*(.012+Math.sin(a)*spread*.62)*k,1.0-(1-Math.cos(a))*.5*(1-drop)*1.2]);}
    pts.push([s*.012*k,1.0]);poly(pts,fill);
   }else poly([[s*.008*k,.99],[s*spread*k,1.0],[s*spread*.9*k,.95],[s*.03*k,drop]],fill);
  }
  // Round the back of the neck the collar is a band.
  ctx.fillStyle=fill;ctx.fillRect(0,Y(1.035),TW,Y(.975)-Y(1.035));
  ctx.fillRect(X(-.012*k,.99),Y(1.035),X(.012*k,.99)-X(-.012*k,.99),Y(.985)-Y(1.035));
  ctx.strokeStyle=ink;ctx.lineWidth=line*.8;ctx.beginPath();ctx.moveTo(0,Y(.975));ctx.lineTo(X(-spread*k,1.0),Y(.975));ctx.moveTo(X(spread*k,1.0),Y(.975));ctx.lineTo(TW,Y(.975));ctx.stroke();
  marks.push('collar');
 };
 const placket=(from,to,w=.022)=>{poly([[-w*k,from],[w*k,from],[w*k,to],[-w*k,to]],null,{width:line*.8});marks.push('placket');};
 const pocket=(x,t,w,h,fill=null)=>{poly([[x-w/2,t+h/2],[x+w/2,t+h/2],[x+w/2,t-h/2],[x-w/2,t-h/2]],fill,{width:line*.8});path([[x-w/2,t+h/2-.035],[x+w/2,t+h/2-.035]],ink,line*.6);marks.push('pocket');};
 const hemRound=()=>{ctx.strokeStyle=shade(top,.72);ctx.lineWidth=line*.7;ctx.beginPath();ctx.moveTo(0,Y(hem+.035));ctx.lineTo(TW,Y(hem+.035));ctx.stroke();};

 switch(o.top){
  case 'tee':rib();hemRound();break;
  case 'hoodie':{
   rib(shade(top,.9));
   // The kangaroo pocket and the drawstrings.
   const pw=W*.36,pt=.36;poly([[-pw,pt+.13],[pw,pt+.13],[pw*1.12,pt-.12],[-pw*1.12,pt-.12]],shade(top,.93));
   for(const s of [-1,1]){path([[s*.024*k,.97],[s*.03*k,.74]],o.accent,line*1.6);dotAt(s*.03*k,.73,.007*k,o.accent);}
   marks.push('pocket','drawstrings');hemRound();break;
  }
  case 'polo':collar(lighten(top,.12));placket(.97,.78);buttons([.9,.82],.0075,lighten(top,.5));hemRound();break;
  case 'blouse':collar('#f8f6ef',{drop:.88,spread:.1,round:true});placket(.97,hem+.04,.018);buttons([.85,.69,.53,.37],.007,'#f8f6ef');break;
  case 'smock':collar('#f8f6ef',{drop:.88,spread:.1,round:true});pocket(0,.42,W*.5,.16,shade(top,.94));hemRound();break;
  case 'kariyushi':{
   // An open neck: a V of skin, lapels folded back over it, buttons down the front.
   const skin=recipe.body.skin;
   poly([[-.07*k,1.0],[.07*k,1.0],[0,.8]],skin,{stroke:null});
   const lapel=lighten(top,.22);marks.push('lapels');
   for(const s of [-1,1])poly([[s*.012*k,1.0],[s*.14*k,.995],[s*.12*k,.9],[s*.012*k,.79]],lapel,{width:line*1.2});
   ctx.fillStyle=lapel;ctx.fillRect(0,Y(1.035),TW,Y(.975)-Y(1.035));
   placket(.8,hem+.03,.02);buttons([.72,.58,.44,.3],.0085,'#f8f6ef');
   pocket(W*.25,.62,W*.22,.17,top);hemRound();break;
  }
  case 'jacket':{
   // Notched lapels over a white shirt, two buttons, flap pockets.
   poly([[-.06*k,1.0],[.06*k,1.0],[0,.66]],'#f4f1ea',{stroke:null});
   for(const s of [-1,1])poly([[s*.01*k,1.0],[s*.12*k,.99],[s*.13*k,.86],[s*.09*k,.84],[s*.1*k,.78],[s*.012*k,.62]],shade(top,.88));
   path([[0,.62],[0,hem]],ink,line*.8);buttons([.52,.4],.009,shade(top,.7));
   for(const s of [-1,1])path([[s*W*.16,.32],[s*W*.36,.32]],ink,line);marks.push('lapels','pocket');break;
  }
  case 'cardigan':{
   // Open down the front over a pale top, with ribbed bands and buttons.
   poly([[-.05*k,1.0],[.05*k,1.0],[.02*k,.7],[-.02*k,.7]],lighten(top,.7),{stroke:null});
   for(const s of [-1,1])poly([[s*.012*k,1.0],[s*.06*k,1.0],[s*.035*k,.7],[s*.035*k,hem],[s*.008*k,hem],[s*.008*k,.7]],o.accent,{width:line*.8});
   buttons([.62,.5,.38,.26],.008,shade(o.accent,.8));ctx.fillStyle=o.accent;ctx.fillRect(0,Y(hem+.05),TW,Y(hem)-Y(hem+.05));marks.push('bands');break;
  }
  case 'festival':{
   // A happi coat: wide collar bands crossing, a sash.
   for(const s of [-1,1])poly([[s*.13*k,1.0],[s*.07*k,1.0],[-s*.06*k,.45],[-s*.13*k,.45]],o.accent);
   ctx.fillStyle=shade(o.accent,.85);ctx.fillRect(0,Y(.4),TW,Y(.3)-Y(.4));marks.push('bands','sash');break;
  }
  case 'sailor':{
   // A square collar at the back, its points tied in a V at the front with a scarf.
   const c=o.accent,w=lighten(c,.85);
   wrapped(true,()=>{
    ctx.fillStyle=c;ctx.fillRect(X(-W*.3,.75,true),Y(1.03),X(W*.3,.75,true)-X(-W*.3,.75,true),Y(.72)-Y(1.03));
    ctx.strokeStyle=w;ctx.lineWidth=line*1.4;ctx.strokeRect(X(-W*.26,.75,true),Y(1.0),X(W*.26,.75,true)-X(-W*.26,.75,true),Y(.76)-Y(1.0));
   });
   for(const s of [-1,1]){poly([[s*.012*k,1.0],[s*.16*k,1.0],[s*.03*k,.66],[s*.0*k,.66]],c);path([[s*.13*k,.985],[s*.02*k,.69]],w,line*1.2);}
   poly([[-.045*k,.7],[.045*k,.7],[0,.56]],'#d8342c');marks.push('collar','scarf');break;
  }
  case 'overalls':{
   // The bib, its straps and their buttons, in the trousers' cloth.
   const b=o.bottomColour,bw=W*.3,bt=.74;
   poly([[-bw,bt],[bw,bt],[bw*1.05,hem],[-bw*1.05,hem]],b);
   pocket(0,.58,bw*.9,.14,shade(b,.94));
   for(const s of [-1,1]){
    poly([[s*bw*.95,bt],[s*bw*.55,bt],[s*W*.18,1.0],[s*W*.32,1.0]],b,{width:line*.8});
    poly([[s*W*.32,1.0],[s*W*.18,1.0],[-s*W*.1,.5],[-s*W*.25,.5]],b,{back:true,width:line*.8});
    dotAt(s*bw*.75,bt-.03,.012*k,'#e2b84a',shade('#e2b84a',.6));
   }
   marks.push('bib','straps');break;
  }
  case 'sundress':for(const s of [-1,1]){poly([[s*W*.3,.8],[s*W*.18,.8],[s*W*.16,1.02],[s*W*.28,1.02]],top,{width:line*.8});poly([[s*W*.3,.8],[s*W*.18,.8],[s*W*.16,1.02],[s*W*.28,1.02]],top,{back:true,width:line*.8});}ctx.fillStyle=shade(top,.7);ctx.fillRect(0,Y(.795),TW,line*.8);marks.push('straps');break;
  case 'apron':collar('#f8f6ef',{drop:.88,spread:.1,round:true});break;
 }
 return marks;
}

// Photo-aware Surprise: small, on-device comparisons, not a learned aesthetic model.
// Artist-picked pairings remain the search vocabulary; the actual photograph chooses the result.
export const MIXES=[
 ['Ink & wash','watercolour','lines',.7],['Comic colour','watercolour','manga',.5],['Sunday comic','flat','manga',.45],
 ['Pencil & wash','watercolour','pencilManga',.5],['Inked oils','oil','manga',.4],['Line & colour','flat','lines',.6],
 ['Cartridge TV','snes','crt',1],['Hand-held TV','pocket','crt',1],['Late show','mono','crt',1],['Old reel','sepia','crt',.8],
 ['Toy town','print','tilt',1],['Model village','watercolour','tilt',1],['Diorama','oil','tilt',1],["Architect's model",'sketchbook','tilt',1],
 ['Two-colour print','lines','riso',1],['Poster','print','riso',.6],
 ['Home video','instant','camcorder',1],['Comic book','flat','halftone',1],["Engineer's plan",'lines','cyanotype',1],['Night watch','nightVision','crt',.8],
];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ink=new Set(['pocket','lines','manga','print','riso','pencilManga','stamp','cyanotype','nightVision']);

/** Tone/colour statistics and a coarse spatial grid; never stores the original photo or identifies people. */
export function measureImage({data,width,height}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||data?.length!==width*height*4)throw new TypeError('A complete RGBA image is required');
 const count=width*height,hist=new Uint32Array(256),grid=new Float64Array(64),bins=new Uint32Array(64);
 let mean=0,saturation=0,red=0,blue=0,black=0,white=0,edge=0;
 const luma=new Float32Array(count);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const n=y*width+x,i=n*4,r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,v=.2126*r+.7152*g+.0722*b;
  const cell=Math.min(7,Math.floor(y*8/height))*8+Math.min(7,Math.floor(x*8/width));
  luma[n]=v;hist[Math.round(v*255)]++;mean+=v;red+=r;blue+=b;grid[cell]+=v;bins[cell]++;
  const hi=Math.max(r,g,b),lo=Math.min(r,g,b);saturation+=hi?(hi-lo)/hi:0;
  black+=v<.015;white+=v>.985;
  if(x)edge+=Math.abs(v-luma[n-1]);if(y)edge+=Math.abs(v-luma[n-width]);
 }
 let total=0;const quantile=q=>{let sum=0;for(let i=0;i<256;i++){sum+=hist[i];if(sum>=Math.max(1,count*q))return i/255;}return 1;};
 for(let i=0;i<64;i++){grid[i]=bins[i]?grid[i]/bins[i]:mean/count;total+=grid[i];}
 return {mean:mean/count,median:quantile(.5),range:quantile(.95)-quantile(.05),saturation:saturation/count,
  red:red/count,blue:blue/count,black:black/count,white:white/count,edge:edge/Math.max(1,2*count-width-height),grid,gridMean:total/64};
}

export function photoSettings(photo){
 return {adjust:{light:clamp((.48-photo.median)*.85,-.24,.30),contrast:clamp((.55-photo.range)*.3,-.1,.14),
  colour:clamp((.28-photo.saturation)*.3,-.12,.1),warmth:clamp((photo.blue-photo.red)*.22,-.06,.06),
  pattern:photo.edge>.10?.12:0,detail:photo.edge>.10?-.18:.04},enhance:.2+Math.abs(.48-photo.median)*.3};
}

/** At most sixteen previews: new families plus refinements of the preceding match. */
export function photoCandidates(photo,{random=Math.random,previous,available=()=>true}={}){
 const tuning=photoSettings(photo),r=()=>clamp(random()),styles=MIXES.filter(([,a,b])=>available(a)&&available(b));
 const ranked=styles.map(style=>({style,rank:r()+((photo.edge>.1&&['watercolour','oil','instant'].includes(style[1]))?.35:0)})).sort((a,b)=>b.rank-a.rank).slice(0,6);
 const selected=[['Soft photo','instant','mono',.12],...ranked.map(x=>x.style)].filter(([,a,b])=>available(a)&&available(b));
 const out=[];
 for(const [name,a,b,strength] of selected)for(let k=0;k<2;k++){
  const adjust={...tuning.adjust};
  // Small search steps preserve the direction of the photo's tonal correction.
  for(const key of ['light','contrast','colour','warmth'])adjust[key]=clamp(adjust[key]+(r()-.5)*.05,-1,1);
  out.push({name,layers:[{look:a,amount:.58+r()*.35},{look:b,amount:clamp(strength*(.4+r()*.45),.06,.85)}],adjust,enhance:tuning.enhance});
 }
 if(previous?.layers?.every(l=>available(l.look)))for(const direction of [-1,1])out.push({name:previous.name,
  layers:previous.layers.map(l=>({...l,amount:clamp(l.amount+direction*.06,.05,1)})),
  adjust:{...tuning.adjust,contrast:clamp(tuning.adjust.contrast+direction*.04,-1,1)},enhance:tuning.enhance});
 return out.slice(0,16);
}

/** A bounded quality proxy: structure, usable tones, clipping and colour. It is not a beauty guarantee. */
export function scorePhoto(reference,result,layers){
 let covariance=0,sourceVar=0,resultVar=0,difference=0;
 for(let i=0;i<64;i++){
  const a=reference.grid[i]-reference.gridMean,b=result.grid[i]-result.gridMean;
  covariance+=a*b;sourceVar+=a*a;resultVar+=b*b;difference+=Math.abs(reference.grid[i]-result.grid[i]);
 }
 const structure=sourceVar<1e-6?(resultVar<.015?1:.35):clamp(covariance/Math.sqrt(Math.max(1e-12,sourceVar*resultVar)));
 const printed=layers.some(l=>ink.has(l.look)&&l.amount>.35),allowance=printed?.35:.04;
 const clipping=clamp(Math.max(0,result.white-reference.white-allowance)+Math.max(0,result.black-reference.black-allowance));
 const tone=1-clamp(Math.abs(result.median-clamp(reference.median,.32,.68))*1.6);
 const range=reference.range<.03?1:clamp(result.range/Math.max(.15,reference.range*.6));
 const colour=1-clamp((result.saturation-.88)*3),style=clamp((difference/64)/.08);
 const score=.42*structure+.21*tone+.17*range+.1*colour+.1*style-.4*clipping;
 return Number.isFinite(score)?clamp(score):0;
}

/** Keep variety inside the strongest results, and avoid repeating the preceding family when possible. */
export function choosePhotoCandidate(candidates,{lastName,random=Math.random}={}){
 const sorted=candidates.filter(c=>Number.isFinite(c.score)&&c.score>=.5).sort((a,b)=>b.score-a.score);
 if(!sorted.length)return null;
 let pool=sorted.filter(c=>c.score>=sorted[0].score-.035);
 const different=pool.filter(c=>c.name!==lastName);if(different.length)pool=different;
 const families=[...new Set(pool.map(c=>c.name))].slice(0,3);
 const name=families[Math.min(families.length-1,Math.floor(clamp(random())*families.length))];
 return pool.find(c=>c.name===name);
}

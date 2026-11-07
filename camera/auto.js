/**
 * Auto: the good photo first, with nothing to do. The photo is measured (a small copy: its light, its contrast, its
 * colour and any cast) and Enhance and Pop are set to levels that suit it: a dull or flat photo gets more, a bright,
 * contrasty one less, a portrait a little less Pop (its skin). The levels go into the recipe like any other setting:
 * Original compares, the fine-tune changes them, off is the exact photo.
 */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
/** Measures a picture (anything drawImage takes) and returns {enhance, pop} in 0–1, two decimals. */
export function autoLevels(source,{faces=[],canvas=null}={}){
 const W=source.naturalWidth||source.videoWidth||source.width,H=source.naturalHeight||source.videoHeight||source.height;
 if(!(W>0&&H>0))return {enhance:0,pop:0};
 const k=Math.min(1,160/Math.max(W,H)),w=Math.max(1,Math.round(W*k)),h=Math.max(1,Math.round(H*k));
 const c=canvas||document.createElement('canvas');c.width=w;c.height=h;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,w,h);
 const d=g.getImageData(0,0,w,h).data;
 return levelsFromPixels(d,w,h,faces);
}
/** The same, from RGBA pixels (tests). */
export function levelsFromPixels(d,w,h,faces=[]){
 const n=w*h,hist=new Uint32Array(256);let sat=0,rSum=0,gSum=0,bSum=0,lSum=0;
 for(let i=0;i<n;i++){
  const r=d[4*i],gg=d[4*i+1],b=d[4*i+2];
  const y=(.2126*r+.7152*gg+.0722*b)|0;hist[y]++;lSum+=y;
  const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);sat+=mx?(mx-mn)/mx:0;
  rSum+=r;gSum+=gg;bSum+=b;
 }
 const pct=p=>{let acc=0;for(let v=0;v<256;v++){acc+=hist[v];if(acc>=p*n)return v/255;}return 1;};
 const p2=pct(.02),p50=pct(.5),p98=pct(.98),contrast=clamp(p98-p2,0,1),mean=lSum/n/255;
 const meanSat=sat/n,rm=rSum/n,gm=gSum/n,bm=bSum/n,avg=(rm+gm+bm)/3||1;
 // A colour cast: how far the channel means sit from grey, as a share of the mean.
 const cast=clamp((Math.abs(rm-avg)+Math.abs(gm-avg)+Math.abs(bm-avg))/avg/.6,0,1);
 const portrait=faces.length>0;
 // Dull (low contrast), dark or washed-out (the median far from the middle), or cast: more Enhance. A warm scene is a
 // look, not a fault, so a cast counts a little; a portrait is held back (its skin is the subject).
 const enhance=clamp(.2+.35*(1-contrast)+.45*Math.abs(p50-.45)+.15*cast,.15,portrait?.5:.6);
 // Flat and pale: more Pop; a face a little less, so skin stays skin.
 const pop=clamp(.14+.45*(1-contrast)+.5*Math.max(0,.3-meanSat),.1,.55)*(portrait?.75:1);
 return {enhance:Math.round(enhance*100)/100,pop:Math.round(pop*100)/100,measured:{contrast:+contrast.toFixed(3),median:+p50.toFixed(3),mean:+mean.toFixed(3),saturation:+meanSat.toFixed(3),cast:+cast.toFixed(3)}};
}

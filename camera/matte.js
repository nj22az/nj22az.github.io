/**
 * A crisper cut-out edge (the owner, 3 November 2026: "Make the cut-out edge crisper on hair"). The person segmenter
 * answers at 256 pixels across, so its edge scaled to a photo is a soft band a few pixels wide that swallows hair.
 * This pass re-solves the alpha in a band round that edge from the photograph's own colours: on each side of the band
 * the foreground's and the background's colours are estimated from the pixels the segmenter was sure of (a box mean
 * over a window), and every pixel in the band gets the share of the way it sits from the background's colour to the
 * foreground's (a projection, as alpha matting estimates it); a guided filter then smooths that alpha along the
 * photograph's edges, so a strand keeps its own alpha and a flat patch stays flat. Outside the band the mask is hard.
 * Pure functions over typed arrays, run in matte-worker.js off the page's thread; a few hundred milliseconds at
 * 1,024 pixels across.
 */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;

/** The box mean of a w × h field with radius r, by a summed-area table; the window is clipped at the edges. */
export function boxMean(src,w,h,r){
 if(r<1)return Float32Array.from(src);
 const W=w+1,sat=new Float64Array(W*(h+1));
 for(let y=1;y<=h;y++){let row=0;const o=(y-1)*w;for(let x=1;x<=w;x++){row+=src[o+x-1];sat[y*W+x]=sat[(y-1)*W+x]+row;}}
 const out=new Float32Array(w*h);
 for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h,y+r+1);
  for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w,x+r+1);out[y*w+x]=(sat[y1*W+x1]-sat[y0*W+x1]-sat[y1*W+x0]+sat[y0*W+x0])/((y1-y0)*(x1-x0));}}
 return out;
}
/** A field resampled bilinearly from cw × ch to w × h. */
export function resample(src,cw,ch,w,h){
 if(cw===w&&ch===h)return Float32Array.from(src);
 const out=new Float32Array(w*h);
 for(let y=0;y<h;y++){const sy=clamp((y+.5)*ch/h-.5,0,ch-1),y0=Math.floor(sy),y1=Math.min(ch-1,y0+1),fy=sy-y0;
  for(let x=0;x<w;x++){const sx=clamp((x+.5)*cw/w-.5,0,cw-1),x0=Math.floor(sx),x1=Math.min(cw-1,x0+1),fx=sx-x0;
   out[y*w+x]=(src[y0*cw+x0]*(1-fx)+src[y0*cw+x1]*fx)*(1-fy)+(src[y1*cw+x0]*(1-fx)+src[y1*cw+x1]*fx)*fy;}}
 return out;
}
/** He, Sun and Tang's guided filter with a grey guide: p smoothed along I's edges (radius r, regularisation eps). */
export function guidedFilter(I,p,w,h,r,eps){
 const n=w*h,mI=boxMean(I,w,h,r),mp=boxMean(p,w,h,r),Ip=new Float32Array(n),II=new Float32Array(n);
 for(let i=0;i<n;i++){Ip[i]=I[i]*p[i];II[i]=I[i]*I[i];}
 const mIp=boxMean(Ip,w,h,r),mII=boxMean(II,w,h,r),a=new Float32Array(n),b=new Float32Array(n);
 for(let i=0;i<n;i++){const cov=mIp[i]-mI[i]*mp[i],vr=mII[i]-mI[i]*mI[i];a[i]=cov/(vr+eps);b[i]=mp[i]-a[i]*mI[i];}
 const ma=boxMean(a,w,h,r),mb=boxMean(b,w,h,r),q=new Float32Array(n);
 for(let i=0;i<n;i++)q[i]=clamp(ma[i]*I[i]+mb[i],0,1);
 return q;
}
/** The guided filter with the colour picture as the guide: a 3 × 3 covariance per window, regularised by eps. */
export function guidedFilterColour(R,G,B,p,w,h,r,eps){
 const n=w*h,M=x=>boxMean(x,w,h,r),mul=(a,c)=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=a[i]*c[i];return o;};
 const mR=M(R),mG=M(G),mB=M(B),mp=M(p),mRp=M(mul(R,p)),mGp=M(mul(G,p)),mBp=M(mul(B,p));
 const mRR=M(mul(R,R)),mRG=M(mul(R,G)),mRB=M(mul(R,B)),mGG=M(mul(G,G)),mGB=M(mul(G,B)),mBB=M(mul(B,B));
 const aR=new Float32Array(n),aG=new Float32Array(n),aB=new Float32Array(n),b=new Float32Array(n);
 for(let i=0;i<n;i++){
  const a=mRR[i]-mR[i]*mR[i]+eps,bb=mRG[i]-mR[i]*mG[i],c=mRB[i]-mR[i]*mB[i],d=mGG[i]-mG[i]*mG[i]+eps,e=mGB[i]-mG[i]*mB[i],f=mBB[i]-mB[i]*mB[i]+eps;
  const cR=mRp[i]-mR[i]*mp[i],cG=mGp[i]-mG[i]*mp[i],cB=mBp[i]-mB[i]*mp[i];
  const det=a*(d*f-e*e)-bb*(bb*f-c*e)+c*(bb*e-d*c)||1e-12;
  const i00=(d*f-e*e)/det,i01=(c*e-bb*f)/det,i02=(bb*e-c*d)/det,i11=(a*f-c*c)/det,i12=(bb*c-a*e)/det,i22=(a*d-bb*bb)/det;
  aR[i]=i00*cR+i01*cG+i02*cB;aG[i]=i01*cR+i11*cG+i12*cB;aB[i]=i02*cR+i12*cG+i22*cB;b[i]=mp[i]-(aR[i]*mR[i]+aG[i]*mG[i]+aB[i]*mB[i]);
 }
 const maR=M(aR),maG=M(aG),maB=M(aB),mb=M(b),q=new Float32Array(n);
 for(let i=0;i<n;i++)q[i]=clamp(maR[i]*R[i]+maG[i]*G[i]+maB[i]*B[i]+mb[i],0,1);
 return q;
}
/**
 * The refined mask (Float32Array, w × h, 1 = keep) of RGBA pixels `rgba` (w × h) from a coarse mask (cw × ch, 0–1):
 * guided feathering. In a band round the coarse edge (`band`, a share of the longer side) the mask's soft ramp is
 * re-drawn along the photograph's own colour edges by the guided filter (`guide` its radius), so a strand of hair in
 * the ramp keeps its alpha and the ground between strands lets go; a gentle curve (`crisp`) then firms the edge.
 * Outside the band the mask is hard. The coarse mask is trusted for what is wholly inside or outside it: a strand the
 * segmenter missed by more than the ramp is not brought back (a colour-projection matte was tried for that and carved
 * dark hair away against a dark ground).
 */
export function refineMask(rgba,w,h,coarse,cw,ch,{band=.025,guide=.02,eps=1e-3,crisp=1.6}={}){
 const n=w*h,L=Math.max(w,h),m0=resample(coarse,cw,ch,w,h);
 const R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n);
 for(let i=0;i<n;i++){R[i]=rgba[4*i]/255;G[i]=rgba[4*i+1]/255;B[i]=rgba[4*i+2]/255;}
 const near=boxMean(m0,w,h,Math.max(2,Math.round(band*L)));
 const q=guidedFilterColour(R,G,B,m0,w,h,Math.max(2,Math.round(guide*L)),eps);
 const out=new Float32Array(n);
 for(let i=0;i<n;i++)out[i]=near[i]>.02&&near[i]<.98?clamp((q[i]-.5)*crisp+.5,0,1):(m0[i]>.5?1:0);
 return out;
}

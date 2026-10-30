// Original Pocket Camera photo treatments. No code is ported from the reference repositories.
// Bodies run over World's shared luma/noise/hash/unit helpers; World is unchanged.
export const FILM_GLOW=`
vec3 hotFilm(vec2 uv){
 vec3 c=texture2D(tDiffuse,uv).rgb;return c*smoothstep(.68,.98,luma(c));
}
vec3 filmHalation(vec2 uv,float u){
 vec3 glow=vec3(0.0);
#ifdef LIGHT
 const int N=6;
#else
 const int N=12;
#endif
 for(int i=0;i<N;i++){
  float a=float(i)*6.2831853/float(N);vec2 d=vec2(cos(a),sin(a))*uTexel*u;
  glow+=hotFilm(uv+d*10.0);
#ifndef LIGHT
  glow+=hotFilm(uv+d*23.0)*.55;
#endif
 }
#ifdef LIGHT
 glow/=float(N);
#else
 glow/=float(N)*1.55;
#endif
 // A halo around the light, not an orange veil over the whole photograph.
 float halo=max(0.0,luma(glow)-luma(hotFilm(uv))*.5);
 return vec3(1.0,.27,.075)*halo*.34;
}
`;
export const COLOUR_FILM_BODY=`${FILM_GLOW}
void main(){
 float u=unit();vec2 p=vUv*uResolution/u;vec3 c=texture2D(tDiffuse,vUv).rgb;float l=luma(c);
 c=mix(c,c*c*(3.0-2.0*c),.16);c=mix(vec3(.025,.035,.035),vec3(.985,.97,.935),c);
 c=1.0-(1.0-c)*(1.0-filmHalation(vUv,u));
 float grain=(noise(p*.62)*.55+hash(floor(p*.9))*.45-.5)*(.018+.027*4.0*l*(1.0-l));
 gl_FragColor=vec4(clamp(c+grain,0.0,1.0),1.0);
}`;

export const DISPOSABLE_BODY=`
void main(){
 float u=unit();vec2 p=(vUv-.5)*vec2(uResolution.x/uResolution.y,1.0);
 float r2=dot(p,p),corner=.25*(1.0+pow(uResolution.x/uResolution.y,2.0));
 vec2 uv=.5+(vUv-.5)*(1.0+.20*r2)/(1.0+.20*corner);
 float outer=smoothstep(.10,.48,r2);vec2 fringe=(vUv-.5)*.004*outer;
 vec3 c=texture2D(tDiffuse,uv).rgb*.5;
 for(int i=0;i<6;i++){float a=float(i)*1.0472;c+=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*u*mix(.35,2.8,outer)).rgb/12.0;}
 c.r=mix(c.r,texture2D(tDiffuse,uv+fringe).r,.65);
 c.b=mix(c.b,texture2D(tDiffuse,uv-fringe).b,.65);
 // A small direct flash reaches the centre; the cheap lens falls off towards the corners.
 c*=.83+.27*exp(-r2*4.0);c+=vec3(.018,.022,.008)*exp(-r2*6.0);
 c=mix(vec3(.035,.045,.038),vec3(.98,.96,.87),c);
 c+=(hash(floor(vUv*uResolution/u))-.5)*.035;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;

export const LUT_LOOKS=Object.freeze({warmSlide:'warm-slide',softNegative:'soft-negative'});
export const LUT_BODY=`
uniform highp sampler3D tGrade;
void main(){
 vec3 c=clamp(texture2D(tDiffuse,vUv).rgb,0.0,1.0);
 // Texel-centre addressing preserves black/white endpoints; hardware interpolates all three colour axes.
 gl_FragColor=vec4(texture(tGrade,c*(31.0/32.0)+vec3(.5/32.0)).rgb,1.0);
}`;

export const MAC_BODY=`
float ordered8(ivec2 p){
 int rank=0;
 for(int bit=0;bit<3;bit++){int x=(p.x>>bit)&1,y=(p.y>>bit)&1;rank=rank*4+((x^y)*2+y);}
 return (float(rank)+.5)/64.0;
}
void main(){
 float cell=max(1.0,floor(3.0*unit()));ivec2 pixel=ivec2(floor(vUv*uResolution/cell));
 vec2 uv=(vec2(pixel)+.5)*cell/uResolution;float l=luma(texture2D(tDiffuse,uv).rgb);
 float ink=step(ordered8(pixel),l);
 gl_FragColor=vec4(vec3(ink),1.0);
}`;

// An authored cabinet of sixteen material ramps, sixteen shades each (at most 256 RGB colours).
export const VGA_BODY=`
vec3 adventureRamp(int family,float shade){
 vec3 hues[16];
 hues[0]=vec3(.46,.46,.47);hues[1]=vec3(.73,.48,.34);hues[2]=vec3(.55,.29,.22);hues[3]=vec3(.75,.26,.27);
 hues[4]=vec3(.77,.56,.18);hues[5]=vec3(.66,.65,.28);hues[6]=vec3(.35,.52,.23);hues[7]=vec3(.17,.39,.29);
 hues[8]=vec3(.16,.49,.49);hues[9]=vec3(.23,.48,.68);hues[10]=vec3(.22,.29,.57);hues[11]=vec3(.41,.31,.57);
 hues[12]=vec3(.61,.31,.53);hues[13]=vec3(.80,.47,.59);hues[14]=vec3(.56,.46,.33);hues[15]=vec3(.36,.38,.43);
 vec3 base=hues[family];
 return shade<8.0?mix(vec3(.018,.019,.026),base,pow(shade/8.0,.88)):mix(base,vec3(.97,.955,.91),pow((shade-8.0)/7.0,1.12));
}
void main(){
 vec2 grid=vec2(floor(200.0*uResolution.x/uResolution.y),200.0),cell=floor(vUv*grid);
 vec3 c=texture2D(tDiffuse,(cell+.5)/grid).rgb;float l=luma(c);
 c=clamp(c+(bayer4(cell)-.5)*.025,0.0,1.0);
 vec3 best=vec3(0.0);float distance=1e5;
 for(int family=0;family<16;family++){
  float mid=luma(adventureRamp(family,8.0));
  float shade=l<mid?8.0*pow(clamp((l-.02)/max(.01,mid-.02),0.0,1.0),1.0/.88):8.0+7.0*pow(clamp((l-mid)/max(.01,.955-mid),0.0,1.0),1.0/1.12);
  for(int next=0;next<2;next++){
   vec3 p=adventureRamp(family,clamp(floor(shade)+float(next),0.0,15.0)),d=c-p;
   vec3 metric=vec3(luma(d)*1.5,d.r-d.b,d.g-(d.r+d.b)*.5);float error=dot(metric,metric);
   if(error<distance){distance=error;best=p;}
  }
 }
 gl_FragColor=vec4(best,1.0);
}`;

// Fresh analytic approximation of Kyprianidis/Kang/Döllner (2009): smoothed structure tensor, an oriented ellipse,
// eight overlapping Gaussian angular/radial sectors, and a low-variance weighted blend. No reference code port.
export const KUWAHARA=`
vec3 anisotropicPaint(vec2 uv,float reach){
 float xx=0.0,yy=0.0,xy=0.0;vec2 tex=uTexel*unit();
 for(int k=0;k<5;k++){
  vec2 offset=k==0?vec2(0.0):k==1?vec2(3.0,0.0):k==2?vec2(-3.0,0.0):k==3?vec2(0.0,3.0):vec2(0.0,-3.0);
  vec2 q=uv+offset*tex;float w=k==0?.4:.15;
  vec3 gx=texture2D(tDiffuse,q+vec2(tex.x,0.0)).rgb-texture2D(tDiffuse,q-vec2(tex.x,0.0)).rgb;
  vec3 gy=texture2D(tDiffuse,q+vec2(0.0,tex.y)).rgb-texture2D(tDiffuse,q-vec2(0.0,tex.y)).rgb;
  xx+=dot(gx,gx)*w;yy+=dot(gy,gy)*w;xy+=dot(gx,gy)*w;
 }
 float trace=xx+yy,coherence=clamp(sqrt((xx-yy)*(xx-yy)+4.0*xy*xy)/max(trace,1e-5),0.0,.9);
 float angle=trace>1e-5?.5*atan(2.0*xy,xx-yy)+1.5707963:0.0;
 vec2 along=vec2(cos(angle),sin(angle)),across=vec2(-along.y,along.x);
 mat2 ellipse=mat2(along*mix(1.0,1.9,coherence),across*mix(1.0,.65,coherence));
 vec3 sum[8],square[8];float weights[8];
 for(int s=0;s<8;s++){sum[s]=vec3(0.0);square[s]=vec3(0.0);weights[s]=0.0;}
#ifdef LIGHT
 const int R=2;
#else
 const int R=4;
#endif
 for(int y=-R;y<=R;y++)for(int x=-R;x<=R;x++){
  vec2 q=vec2(float(x),float(y))/float(R);float r2=dot(q,q);if(r2>1.0)continue;
  vec3 c=texture2D(tDiffuse,uv+(ellipse*q)*tex*8.0*reach).rgb;
  float a=atan(q.y,q.x+1e-7),radial=exp(-r2*2.2);
  for(int s=0;s<8;s++){
   float difference=abs(mod(a-float(s)*.78539816+3.14159265,6.2831853)-3.14159265);
   float w=r2<.001?1.0:radial*exp(-difference*difference/ .30);
   sum[s]+=c*w;square[s]+=c*c*w;weights[s]+=w;
  }
 }
 vec3 paint=vec3(0.0);float total=0.0;
 for(int s=0;s<8;s++){
  vec3 mean=sum[s]/max(weights[s],1e-5),variance=max(vec3(0.0),square[s]/max(weights[s],1e-5)-mean*mean);
  float w=1.0/(1.0+pow(sqrt(luma(variance))*18.0,4.0));paint+=mean*w;total+=w;
 }
 return paint/max(total,1e-5);
}
`;
export const OIL_BODY=`${KUWAHARA}
void main(){
 vec3 raw=texture2D(tDiffuse,vUv).rgb,col=anisotropicPaint(vUv,1.0);
 float feature=smoothstep(.12,.28,abs(luma(raw)-luma(col)));col=mix(col,raw,feature*.4);
 col=mix(vec3(.035,.06,.07),vec3(.98,.965,.92),col);
 vec2 p=vUv*uResolution/unit(),q=mat2(.8,-.6,.6,.8)*p;
 col*=1.0+(noise(vec2(q.x*.025,q.y*.18))-.5)*.08+(sin(p.x*1.9)*sin(p.y*1.9))*.012;
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
export const ANIME_BODY=`${KUWAHARA}
void main(){
 vec3 c=anisotropicPaint(vUv,1.4);float l=luma(c),plane=floor(l*11.0+.5)/11.0;
 c*=mix(1.0,plane/max(l,.02),.3);c=pow(max(c,vec3(0.0)),vec3(.94));
 c=mix(vec3(luma(c)),c,1.04);c+=vec3(.025,.025,.01)*smoothstep(.3,.8,l);
 c=mix(c,vec3(.98,.97,.92),smoothstep(.78,1.0,l)*.045);
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;

export const SORT_STAGES=Object.freeze([2,4,8,16].flatMap(size=>{
 const stages=[];for(let stride=size/2;stride>=1;stride/=2)stages.push(Object.freeze({size,stride}));return stages;
}));
export const GLITCH_BODY=`
#ifndef LIGHT
uniform sampler2D tSortBase;
uniform int uSortSize,uSortStride,uSortFinal;
#endif
void main(){
#ifdef LIGHT
 // Sorting is a still-photo treatment on a phone; never run ten passes on its live camera.
 gl_FragColor=texture2D(tDiffuse,vUv);
#else
 float cell=max(1.0,floor(4.0*unit()));int column=int(floor(vUv.x*uResolution.x/cell));
 int index=column&15,block=column-index,partner=block+(index^uSortStride);
 vec2 ownUV=vec2((float(column)+.5)*cell/uResolution.x,vUv.y);
 vec2 otherUV=vec2((float(partner)+.5)*cell/uResolution.x,vUv.y);
 vec4 own=texture2D(tDiffuse,ownUV);float eligible=own.a;
 if(uSortSize==2){
  eligible=1.0;
  // Entire 16-cell runs qualify, so comparison exchanges never jump over a black/white barrier.
  for(int i=0;i<16;i++){
   vec2 uv=vec2((float(block+i)+.5)*cell/uResolution.x,vUv.y);
   float l=luma(texture2D(tSortBase,uv).rgb);
   if(l<.08||l>.92||uv.x>1.0)eligible=0.0;
  }
 }
 if(eligible<.5){gl_FragColor=vec4(texture2D(tSortBase,vUv).rgb,0.0);return;}
 vec3 other=texture2D(tDiffuse,otherUV).rgb;
 bool ascending=(index&uSortSize)==0,lower=(index&uSortStride)==0,takeMinimum=ascending==lower;
 bool exchange=takeMinimum?luma(own.rgb)>luma(other):luma(own.rgb)<luma(other);
 gl_FragColor=vec4(exchange?other:own.rgb,1.0);
#endif
}`;

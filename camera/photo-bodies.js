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

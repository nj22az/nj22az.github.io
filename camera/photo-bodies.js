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

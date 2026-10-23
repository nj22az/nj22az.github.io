/** Shared illustration stages, selected at shader creation rather than branching per pixel. */
export const CEL_GLSL=`
vec3 celColour(vec3 c,float strength){float y=luma(c);float tier=y<.32?.24:y<.7?.52:.86;vec3 paint=c*(mix(y,tier,strength)/max(y,.03));paint/=max(1.0,max(paint.r,max(paint.g,paint.b)));return paint*mix(vec3(.94,.93,.98),vec3(1.0),step(.52,y));}
`;
export const PENCIL_GLSL=`float strokes(vec2 p,vec2 dir,float spacing){
 float along=dot(p,vec2(-dir.y,dir.x));
 float across=dot(p,dir)+noise(vec2(along*0.02,dot(p,dir)*0.05))*4.0;
 float lane=floor(across/spacing);
 // Each stroke has its own pressure, and fades in and out along its length.
 float pressure=0.55+0.45*hash(vec2(lane,7.0));
 float body=1.0-abs(fract(across/spacing)-0.5)*2.0;
 float segment=floor(along/28.0+hash(vec2(lane,11.0)));
 float phase=fract(along/28.0+hash(vec2(lane,11.0)));
 float run=smoothstep(.03,.16,phase)*(1.0-smoothstep(.68,.94,phase));
 float wax=smoothstep(.17,.67,noise(p*2.4+hash(vec2(lane,segment))*7.0));
 return smoothstep(0.15,0.75,body)*pressure*run*mix(.22,1.0,wax);
}`;
export const DOT_GLSL=`float tone(vec2 p,float l){
 // Dots on a rotated grid, their radius from how dark it is; anti-aliased edges.
 vec2 r=mat2(0.7071,-0.7071,0.7071,0.7071)*p/6.0;
 float d=length(fract(r)-0.5);
 float density=clamp(1.0-l,0.0,1.0);
 float radius=sqrt(min(density,1.0-density))*0.56419;
 float dotInk=1.0-smoothstep(radius-0.06,radius+0.06,d);
 return density>.5?1.0-dotInk:dotInk;
}
float hatch(vec2 p,vec2 dir,float spacing,float width){
 float s=abs(fract(dot(p,dir)/spacing)-0.5)*spacing;
 return 1.0-smoothstep(width-0.6,width+0.6,s);
}`;
export const OIL_GLSL=`
vec3 oilCluster(vec2 uv){
 float u=unit();
 vec2 p=uv*uResolution/u;
 vec2 t=uTexel*3.0*u;
 float xx=0.0,yy=0.0,xy=0.0;
 for(int k=0;k<5;k++){
  vec2 q=k==0?uv:k==1?uv+vec2(2.0*u*uTexel.x,0.0):k==2?uv-vec2(2.0*u*uTexel.x,0.0):k==3?uv+vec2(0.0,2.0*u*uTexel.y):uv-vec2(0.0,2.0*u*uTexel.y);
  vec3 gx=texture2D(tDiffuse,q+vec2(uTexel.x*u,0.0)).rgb-texture2D(tDiffuse,q-vec2(uTexel.x*u,0.0)).rgb;
  vec3 gy=texture2D(tDiffuse,q+vec2(0.0,uTexel.y*u)).rgb-texture2D(tDiffuse,q-vec2(0.0,uTexel.y*u)).rgb;
  xx+=dot(gx,gx);yy+=dot(gy,gy);xy+=dot(gx,gy);
 }
 float trace=xx+yy,anisotropy=clamp(sqrt((xx-yy)*(xx-yy)+4.0*xy*xy)/max(trace,.00001),0.0,1.0);
 float angle=trace>.00001?.5*atan(2.0*xy,xx-yy)+1.570796:0.0;
 vec2 along=vec2(cos(angle),sin(angle)),across=vec2(-along.y,along.x);
 mat2 brush=mat2(along*mix(1.0,1.65,anisotropy),across*mix(1.0,.65,anisotropy));
 // A phone or tablet (LIGHT) takes 2x2 samples a square, spread over the same reach, instead of 4x4.
#ifdef LIGHT
 const int R=1;const float STEP=4.0;const float OFF=0.0;const float N=4.0;
#else
 const int R=4;const float STEP=1.0;const float OFF=0.0;const float N=25.0;
#endif
 vec3 m[4];vec3 s[4];
 for(int k=0;k<4;k++){m[k]=vec3(0.0);s[k]=vec3(0.0);}
 for(int j=0;j<=R;j++)for(int i=0;i<=R;i++){
  vec2 o=vec2(float(i)*STEP+OFF,float(j)*STEP+OFF);
  vec3 a=texture2D(tDiffuse,uv+(brush*vec2(-o.x,-o.y))*t).rgb;m[0]+=a;s[0]+=a*a;
  vec3 b=texture2D(tDiffuse,uv+(brush*vec2(o.x,-o.y))*t).rgb;m[1]+=b;s[1]+=b*b;
  vec3 c=texture2D(tDiffuse,uv+(brush*o)*t).rgb;m[2]+=c;s[2]+=c*c;
  vec3 d=texture2D(tDiffuse,uv+(brush*vec2(-o.x,o.y))*t).rgb;m[3]+=d;s[3]+=d*d;
 }
 vec3 col=vec3(0.0);float best=1e9;
 for(int k=0;k<4;k++){
  vec3 mean=m[k]/N;vec3 v=abs(s[k]/N-mean*mean);
  float var=v.r+v.g+v.b;
  if(var<best){best=var;col=mean;}
 }
 // A restrained light-catching ridge between clustered paint dabs, not the canvas grid.
 float ridge=clamp(length(fwidth(col))*3.0,0.0,1.0);
 col+=col*.05*ridge;

 return col;
}
`;
export const WASH_GLSL=`
vec3 paperWash(vec3 c,float strength){vec3 paper=vec3(.98,.96,.91);float chroma=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));float deposit=mix(.20,.78,smoothstep(.035,.20,chroma));deposit=max(deposit,(1.0-smoothstep(.48,.9,luma(c)))*.70);return mix(paper,c,deposit*strength);}
vec3 wetEdge(vec3 paint,vec2 uv){float rim=edges(uv,1.1*unit(),.20);return paint*(1.0-.10*clamp(rim,0.0,1.0));}
`;
export const SURFACE_GLSL=`
vec2 illustrationCoord(vec2 uv){vec2 p=uv*uResolution/unit();
#ifdef HAS_DEPTH
 if(readDepth(uv)<.999999){vec3 position=surfacePosition(uv);vec3 n=vec3(0,0,1);
#ifdef HAS_NORMALS
 n=abs((uCameraWorld*vec4(texture2D(tNormal,uv).rgb*2.0-1.0,0)).xyz);
#endif
 p=(n.z>n.x&&n.z>n.y?position.xy:n.y>n.x?position.xz:position.zy)*150.0;}
#endif
 return p;}
float pencilShade(vec2 p,float light){float primary=strokes(p,vec2(.7071,.7071),4.0)*(1.0-smoothstep(.62,.75,light));float crossed=strokes(p,vec2(.5,-.866),3.5)*(1.0-smoothstep(.32,.45,light));return max(primary,crossed);}
`;

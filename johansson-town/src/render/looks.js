/**
 * Looks: the whole town redrawn in another style, chosen under Settings in the Town book.
 *
 * Inspired by Super Mario Odyssey's Snapshot Mode as recreated by Daniel Ilett in
 * smo-shaders (MIT, https://github.com/daniel-ilett/smo-shaders): greyscale, sepia,
 * the hand-held and 16-bit pixel looks, the line drawing and the CRT. Manga and
 * Pencil crayon are this town's own, as are Miniature (tilt-shift), Woodblock
 * print (ukiyo-e), Watercolour and Oil painting (a Kuwahara filter). The shaders are written fresh for three.js;
 * Unity's HLSL does not port line for line.
 *
 * A look is one more full-screen pass at the very end of the ink pipeline
 * (ink-pipeline.js): it reads the finished, graded sRGB picture and the scene's depth,
 * and writes the screen. Natural adds no pass at all. Each look compiles the first
 * time it is chosen, never at startup. Only the 3D canvas is redrawn; menus, speech
 * and signs on the HUD stay as they are.
 *
 * Every pattern (dither, screentone, hatching, paper) is fixed to the screen and
 * never animated, so nothing shimmers while the camera is still.
 */

/** In the order the menu offers them. `css` is the stand-in where the town draws without the ink pipeline. */
export const LOOKS=Object.freeze({
 none:{label:'Natural',short:'Natural',hint:'The town as it is drawn.'},
 mono:{label:'Black & white',short:'B&W',hint:'Greyscale, a little punch in the contrast.',css:'grayscale(1) contrast(1.12)'},
 sepia:{label:'Sepia',short:'Sepia',hint:'An old brown photograph.',css:'sepia(.9) contrast(.95)'},
 pocket:{label:'Pocket Gentleman',short:'Pocket',hint:'Four greens and big pixels, like the hand-held camera.'},
 snes:{label:'16-bit',short:'16-bit',hint:'Chunky pixels and a short palette, like a cartridge game.'},
 lines:{label:'Line drawing',short:'Lines',hint:'Pencil outlines on white paper.'},
 crt:{label:'Old TV',short:'TV',hint:'A curved tube with scanlines.'},
 manga:{label:'Manga',short:'Manga',hint:'Black ink, screentone dots and hatching, as in a printed comic.'},
 crayon:{label:'Pencil crayon',short:'Crayon',hint:'Coloured pencil strokes on textured paper.'},
 tilt:{label:'Miniature',short:'Mini',hint:'Tilt-shift: the top and bottom go soft, and the island looks like a model.'},
 print:{label:'Woodblock print',short:'Print',hint:'Ukiyo-e: flat woodblock colours, bold outlines, a graded sky on paper.'},
 watercolour:{label:'Watercolour',short:'Paint',hint:'Soft washes that bleed and pool at their edges on rough paper.'},
 // 64 samples a pixel: offered on computers only (game.js drawableLooks), never on a phone or tablet.
 oil:{label:'Oil painting',short:'Oil',hint:'Thick brushwork on canvas.',heavy:true},
});

/** Where an earlier build saved the look. The owner (22 October 2026): every start is Natural, whatever was used last, so
 * the choice is not saved any more and an old saved one is removed (clearSavedLook). */
export const LOOK_KEY='johansson-town-look';
export const isLook=name=>Object.hasOwn(LOOKS,name);
export function clearSavedLook(storage){try{storage?.removeItem(LOOK_KEY);}catch{}}
/** The CSS filter for the canvas when there is no pipeline to run the look: only the colour looks have one. */
export const lookCSS=name=>LOOKS[name]?.css||'none';
/** Whether a look can show at all without the ink pipeline. */
export const lookNeedsPipeline=name=>name!=='none'&&!LOOKS[name]?.css;
/** Too heavy for a phone or tablet's GPU every frame. */
export const lookIsHeavy=name=>!!LOOKS[name]?.heavy;

// Shared by every look. tDiffuse is the graded sRGB picture; tDepth the scene's depth.
const COMMON=`
#include <packing>
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec2 uTexel;
uniform vec2 uResolution;
uniform float uNear,uFar,uSkyDepth;
varying vec2 vUv;

float luma(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
float viewDepth(vec2 uv){return -perspectiveDepthToViewZ(texture2D(tDepth,uv).x,uNear,uFar);}
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
}
// Ordered dither thresholds without an array (GLSL ES 1.0 cannot index one by a variable).
float bayer2(vec2 a){a=floor(a);return fract(dot(a,vec2(0.5,a.y*0.75)));}
float bayer4(vec2 a){return bayer2(0.5*a)*0.25+bayer2(a);}
// How much of a device pixel at 1080 lines one pattern pixel is, so patterns keep their size on any screen.
float unit(){return max(1.0,uResolution.y/1080.0);}

// Outlines: the second difference of depth (silhouettes and creases, as the ink pass
// finds them) plus a luminance Sobel (painted detail, window frames, signs).
float edges(vec2 uv,float width,float detail){
 vec2 t=uTexel*width;
 float dc=viewDepth(uv);
 float sx=(viewDepth(uv-vec2(t.x,0.0))+viewDepth(uv+vec2(t.x,0.0))-2.0*dc)/dc;
 float sy=(viewDepth(uv+vec2(0.0,t.y))+viewDepth(uv-vec2(0.0,t.y))-2.0*dc)/dc;
 // Depth is stored in fixed point: on ground seen at a grazing angle its rounding alone reaches a few
 // thousandths and draws stripes across the road, so a crease has to stand well clear of that.
 float shape=smoothstep(0.012,0.03,max(0.0,sx)+max(0.0,sy));
 float tl=luma(texture2D(tDiffuse,uv+vec2(-t.x,t.y)).rgb),tc=luma(texture2D(tDiffuse,uv+vec2(0.0,t.y)).rgb),tr=luma(texture2D(tDiffuse,uv+t).rgb);
 float ml=luma(texture2D(tDiffuse,uv-vec2(t.x,0.0)).rgb),mr=luma(texture2D(tDiffuse,uv+vec2(t.x,0.0)).rgb);
 float bl=luma(texture2D(tDiffuse,uv-t).rgb),bc=luma(texture2D(tDiffuse,uv-vec2(0.0,t.y)).rgb),br=luma(texture2D(tDiffuse,uv+vec2(t.x,-t.y)).rgb);
 float gx=(tr+2.0*mr+br)-(tl+2.0*ml+bl),gy=(tl+2.0*tc+tr)-(bl+2.0*bc+br);
 float paint=smoothstep(0.32,0.62,length(vec2(gx,gy)))*detail;
 float e=max(shape,paint);
 // Distance thins the lines out, so the horizon is not scribbled over.
 return e*(1.0-smoothstep(uSkyDepth*0.35,uSkyDepth,dc));
}
`;

const FRAGMENTS={
 mono:`
void main(){
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=clamp((luma(c)-0.5)*1.12+0.5,0.0,1.0);
 gl_FragColor=vec4(vec3(l),1.0);
}`,
 sepia:`
void main(){
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 // The Filter Effects matrix for sepia(0.9), then contrast(0.95): the photo studio's own film.
 mat3 m=mat3(0.4537,0.3141,0.2448, 0.6921,0.7174,0.4806, 0.1701,0.1512,0.2179);
 vec3 s=clamp(m*c,0.0,1.0);
 gl_FragColor=vec4(clamp((s-0.5)*0.95+0.5,0.0,1.0),1.0);
}`,
 // The Pocket Gentleman's four greens (pocket-camera.js), over 144 lines, ordered dither.
 pocket:`
void main(){
 float px=max(2.0,floor(uResolution.y/144.0));
 vec2 cell=floor(vUv*uResolution/px);
 vec2 centre=(cell+0.5)*px/uResolution;
 float l=luma(texture2D(tDiffuse,centre).rgb);
 l=clamp((l-0.14)*1.4,0.0,1.0);
 float shade=floor(clamp(l*3.0+bayer4(cell)-0.5,0.0,3.0)+0.5);
 vec3 c=shade<0.5?vec3(24.0,48.0,32.0):shade<1.5?vec3(62.0,98.0,56.0):shade<2.5?vec3(130.0,158.0,76.0):vec3(200.0,212.0,138.0);
 gl_FragColor=vec4(c/255.0,1.0);
}`,
 // 256 lines, sixteen steps a channel, a light dither between them.
 snes:`
void main(){
 float px=max(2.0,floor(uResolution.y/240.0));
 vec2 cell=floor(vUv*uResolution/px);
 vec3 c=texture2D(tDiffuse,(cell+0.5)*px/uResolution).rgb;
 c=floor(c*15.0+bayer4(cell)*0.9+0.05)/15.0;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`,
 lines:`
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 paper=vec3(0.985,0.975,0.95)-0.035*noise(p*0.45);
 float e=edges(vUv,1.2*u,0.8);
 // A touch of tone in the darkest places, so a dark doorway does not read as paper.
 float l=luma(texture2D(tDiffuse,vUv).rgb);
 float tone=(1.0-smoothstep(0.08,0.3,l))*0.22;
 gl_FragColor=vec4(mix(paper,vec3(0.17,0.17,0.2),clamp(max(e,tone),0.0,1.0)),1.0);
}`,
 crt:`
void main(){
 vec2 q=vUv*2.0-1.0;
 q*=1.0+dot(q,q)*vec2(0.035,0.05);
 vec2 uv=q*0.5+0.5;
 if(any(lessThan(uv,vec2(0.0)))||any(greaterThan(uv,vec2(1.0)))){gl_FragColor=vec4(0.0,0.0,0.0,1.0);return;}
 vec3 c=texture2D(tDiffuse,uv).rgb;
 // A soft bleed of the neighbouring colour, as a tube smears.
 c=mix(c,texture2D(tDiffuse,uv+vec2(uTexel.x*2.0,0.0)).rgb,0.25);
 float lines=uResolution.y/max(2.0,floor(uResolution.y/270.0));
 float scan=0.78+0.22*cos(uv.y*lines*6.2831853);
 float slot=mod(floor(gl_FragCoord.x/max(1.0,unit())),3.0);
 vec3 mask=slot<0.5?vec3(1.0,0.86,0.86):slot<1.5?vec3(0.86,1.0,0.86):vec3(0.86,0.86,1.0);
 c*=scan*mask*1.12;
 // The tube's own vignette: the corners fall away.
 vec2 v=uv*(1.0-uv.yx);
 c*=pow(clamp(v.x*v.y*18.0,0.0,1.0),0.28);
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`,
 // Printed-comic black and white: solid ink outlines, white highlights, a 45-degree
 // screentone in the mid tones that grows into hatching and then solid black.
 manga:`
float tone(vec2 p,float l){
 // Dots on a rotated grid, their radius from how dark it is; anti-aliased edges.
 vec2 r=mat2(0.7071,-0.7071,0.7071,0.7071)*p/6.0;
 float d=length(fract(r)-0.5);
 float radius=sqrt(clamp(1.0-l,0.0,1.0))*0.62;
 return 1.0-smoothstep(radius-0.08,radius+0.08,d);
}
float hatch(vec2 p,vec2 dir,float spacing,float width){
 float s=abs(fract(dot(p,dir)/spacing)-0.5)*spacing;
 return 1.0-smoothstep(width-0.6,width+0.6,s);
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=clamp((luma(c)-0.5)*1.25+0.52,0.0,1.0);
 float ink=0.0;
 if(l<0.82)ink=tone(p,mix(1.0,l,smoothstep(0.82,0.7,l)));
 if(l<0.36)ink=max(ink,hatch(p,vec2(0.7071,0.7071),5.0,1.1));
 if(l<0.22)ink=max(ink,hatch(p,vec2(0.7071,-0.7071),5.0,1.1));
 if(l<0.1)ink=1.0;
 // The sky keeps clean paper with a light tone, as a background page would.
 if(viewDepth(vUv)>uSkyDepth)ink=min(ink,tone(p,0.86));
 ink=max(ink,edges(vUv,1.5*u,1.0));
 vec3 paper=vec3(0.97,0.965,0.95);
 gl_FragColor=vec4(mix(paper,vec3(0.06,0.06,0.08),clamp(ink,0.0,1.0)),1.0);
}`,
 // Coloured pencil on rough paper: the colour goes down in diagonal strokes that skip
 // the paper's tooth, a second layer crosses the darks, and a graphite outline.
 crayon:`
float strokes(vec2 p,vec2 dir,float spacing){
 float along=dot(p,vec2(-dir.y,dir.x));
 float across=dot(p,dir)+noise(vec2(along*0.02,dot(p,dir)*0.05))*4.0;
 float lane=floor(across/spacing);
 // Each stroke has its own pressure, and fades in and out along its length.
 float pressure=0.55+0.45*hash(vec2(lane,7.0));
 float body=1.0-abs(fract(across/spacing)-0.5)*2.0;
 float run=0.5+0.5*noise(vec2(along*0.035,lane*1.7));
 return smoothstep(0.15,0.75,body)*pressure*run;
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=luma(c);
 // Pencils are brighter and softer than paint: lift the colour towards pastel.
 vec3 pigment=clamp(mix(vec3(l),c,1.18)*0.92+0.04,0.0,1.0);
 float tooth=noise(p*0.9)*0.6+noise(p*2.3)*0.4;
 vec3 paper=vec3(0.975,0.96,0.93)-0.05*tooth;
 float dark=1.0-l;
 float cover=strokes(p,vec2(0.6,0.8),4.0)*smoothstep(0.0,0.55,dark+0.35);
 cover=max(cover,strokes(p,vec2(-0.8,0.6),3.5)*smoothstep(0.35,0.8,dark));
 // The pigment catches on the tooth's peaks first.
 cover*=smoothstep(0.15,0.65,tooth+cover*0.6);
 cover=clamp(cover*1.25,0.0,1.0);
 vec3 col=mix(paper,pigment*mix(vec3(1.0),paper,0.12),cover);
 // A little burnish where the darkest colour is pressed hard.
 col=mix(col,pigment*0.82,smoothstep(0.7,0.95,dark)*0.5);
 // Graphite lines, wobbling a little as a hand-drawn line does.
 vec2 wobble=(vec2(noise(p*0.05),noise(p*0.05+17.0))-0.5)*uTexel*2.5*u;
 float e=edges(vUv+wobble,1.3*u,0.7)*(0.55+0.45*noise(p*0.3));
 col=mix(col,vec3(0.24,0.23,0.26),clamp(e,0.0,1.0)*0.85);
 gl_FragColor=vec4(col,1.0);
}`,
 // Tilt-shift: a sharp band across the middle and a growing blur above and below it, with the colour lifted a
 // little, as a photograph of a model railway. The blur is a golden-angle disc of 24 taps.
 tilt:`
void main(){
 float u=unit();
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float away=abs(vUv.y-0.46);
 float radius=smoothstep(0.07,0.42,away)*16.0*u;
 if(radius>0.4){
  vec3 sum=c;float n=1.0;
  for(int i=1;i<24;i++){
   float fi=float(i),r=sqrt(fi/24.0)*radius,a=fi*2.39996;
   sum+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*r*uTexel).rgb;n+=1.0;
  }
  c=sum/n;
 }
 float l=luma(c);
 c=mix(vec3(l),c,1.45);
 c=(c-0.5)*1.12+0.53;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`,
 // Ukiyo-e: every colour goes to the nearest of a woodblock printer's few inks, printed flat on cream paper with a
 // key-block outline; the sky becomes the printed gradient (bokashi) from Prussian blue to paper.
 print:`
vec3 inkFor(vec3 c){
 vec3 best=vec3(0.0);float d=1e9;
 vec3 inks[10];
 inks[0]=vec3(0.95,0.91,0.81);inks[1]=vec3(0.12,0.23,0.37);inks[2]=vec3(0.18,0.36,0.54);inks[3]=vec3(0.56,0.70,0.79);
 inks[4]=vec3(0.78,0.27,0.18);inks[5]=vec3(0.85,0.64,0.25);inks[6]=vec3(0.49,0.60,0.42);inks[7]=vec3(0.16,0.14,0.13);
 inks[8]=vec3(0.85,0.55,0.55);inks[9]=vec3(0.54,0.35,0.23);
 for(int i=0;i<10;i++){vec3 e=(c-inks[i])*vec3(1.0,1.25,0.8);float k=dot(e,e);if(k<d){d=k;best=inks[i];}}
 return best;
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 // A little more colour first, so pale painted walls still find their ink.
 float l=luma(c);
 vec3 col=inkFor(clamp(mix(vec3(l),c,1.35),0.0,1.0));
 if(viewDepth(vUv)>uSkyDepth){
  float t=smoothstep(0.55,1.0,vUv.y);
  col=mix(vec3(0.93,0.89,0.79),vec3(0.17,0.33,0.52),t);
 }
 // Paper and wood grain show through the ink, stronger along the grain.
 float grain=noise(vec2(p.x*0.04,p.y*0.9))*0.6+noise(p*0.5)*0.4;
 col*=0.94+0.08*grain;
 float e=edges(vUv,1.4*u,0.9);
 col=mix(col,vec3(0.13,0.11,0.10),clamp(e,0.0,1.0));
 gl_FragColor=vec4(col,1.0);
}`,
 // Watercolour: the colour is sampled a little off where it belongs (the wash wanders), lightened as a transparent
 // pigment, darkened where washes meet (the wet edge), and granulated by rough paper.
 watercolour:`
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 // The wash wanders off the drawing, a few pixels and on two scales.
 vec2 wander=((vec2(noise(p*0.012),noise(p*0.012+31.0))-0.5)*12.0+(vec2(noise(p*0.06),noise(p*0.06+7.0))-0.5)*4.0)*uTexel*u;
 vec2 uv=vUv+wander;
 vec3 sum=vec3(0.0);
 for(int i=0;i<8;i++){float a=float(i)*0.785398;sum+=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*3.0*u).rgb;}
 vec3 soft=sum/8.0;
 // Fewer, flatter tones: a painter mixes a handful of washes, not every shade.
 soft=floor(soft*6.0+0.5)/6.0*0.6+soft*0.4;
 vec3 paper=vec3(0.985,0.97,0.935);
 // Transparent pigment over paper, darker and lighter in blooms across each wash.
 float bloom=noise(p*0.008)*0.6+noise(p*0.03)*0.4;
 vec3 wash=mix(paper,soft,0.55+0.4*bloom);
 // Where washes meet, the pigment pools and dries to a darker rim.
 float edge=edges(uv,1.8*u,1.0);
 wash=mix(wash,soft*0.62,clamp(edge,0.0,1.0)*0.75);
 // Rough paper: pigment settles in the hollows (granulation).
 float tooth=noise(p*0.55)*0.55+noise(p*1.7)*0.45;
 wash*=0.88+0.16*tooth;
 // Some of the white of the paper is left unpainted in the lightest places.
 wash=mix(wash,paper,smoothstep(0.8,0.95,luma(soft))*0.7);
 gl_FragColor=vec4(clamp(wash,0.0,1.0),1.0);
}`,
 // Oil painting: a Kuwahara filter (each pixel takes the mean of whichever of its four neighbouring squares is
 // calmest), so areas flatten into strokes and edges stay crisp, on a canvas weave.
 oil:`
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec2 t=uTexel*2.6*u;
 vec3 m[4];vec3 s[4];
 for(int k=0;k<4;k++){m[k]=vec3(0.0);s[k]=vec3(0.0);}
 for(int j=0;j<=3;j++)for(int i=0;i<=3;i++){
  vec3 a=texture2D(tDiffuse,vUv+vec2(-float(i),-float(j))*t).rgb;m[0]+=a;s[0]+=a*a;
  vec3 b=texture2D(tDiffuse,vUv+vec2(float(i),-float(j))*t).rgb;m[1]+=b;s[1]+=b*b;
  vec3 c=texture2D(tDiffuse,vUv+vec2(float(i),float(j))*t).rgb;m[2]+=c;s[2]+=c*c;
  vec3 d=texture2D(tDiffuse,vUv+vec2(-float(i),float(j))*t).rgb;m[3]+=d;s[3]+=d*d;
 }
 vec3 col=vec3(0.0);float best=1e9;
 for(int k=0;k<4;k++){
  vec3 mean=m[k]/16.0;vec3 v=abs(s[k]/16.0-mean*mean);
  float var=v.r+v.g+v.b;
  if(var<best){best=var;col=mean;}
 }
 col=mix(vec3(luma(col)),col,1.35);
 col=(col-0.5)*1.1+0.5;
 // Brush strokes: short diagonal marks catching the light, and the canvas weave under them.
 vec2 q=mat2(0.8,-0.6,0.6,0.8)*p;
 float stroke=noise(vec2(q.x*0.035,q.y*0.32));
 float weave=(sin(p.x*1.9)*sin(p.y*1.9))*0.5+0.5;
 col*=0.94+0.09*stroke+0.04*weave;
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`
};

/** The full fragment shader for a look, or null for Natural. */
export function lookFragment(name){
 const body=FRAGMENTS[name];
 return body?COMMON+body:null;
}

/** Whether a look samples the scene's depth (and so must be fed the depth texture). */
export const lookUsesDepth=name=>/viewDepth|edges\(/.test(FRAGMENTS[name]||'');

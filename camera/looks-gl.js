/**
 * Pocket Camera's engine: Johansson World's Looks (johansson-town/src/render/looks.js), run on a photograph or a
 * camera frame instead of the town. The shaders are World's own, imported, never copied: each Look is built without
 * depth (the picture-only version Studio's comic panels use), turned into WebGL2's GLSL, and wrapped so that it can
 * be mixed back into what came before it. That makes Looks stackable: Manga, then Old TV over it, then Miniature.
 *
 * One change is made to World's source, by replacement: unit(), which sizes every pattern (dots, strokes, lines) to
 * a 1080-line screen, follows the picture's own height instead. A pattern then covers the same share of the photo in
 * the viewfinder, in a thumbnail and in a 12-megapixel save, so what is seen is what is saved.
 *
 * Every picture goes through a first pass of our own: crop, mirror, the trick lens (Twin, Quad), Light, Contrast,
 * Colour and Warmth, and for the Looks that draw lines a light edge-keeping smoothing, so camera noise is not inked as
 * detail (Detail sets how much).
 */
import {LOOKS as WORLD_LOOKS,lookFragment,lookUsesDepth} from '../johansson-town/src/render/looks.js?v=20261029-camera';

// Camera-only original Looks. They build on World's shared sampling helpers, without adding World Looks. The five after
// Adventure Ink came with the owner's "Yes add" (29 October 2026): an instant print, an 80s camcorder tape, comic
// dots, a blueprint and night vision.
export const LOOKS=Object.freeze({...WORLD_LOOKS,
 adventureInk:Object.freeze({label:'Adventure Ink',short:'Adventure',hint:'Bright cel colours and clean manga-inspired ink.'}),
 instant:Object.freeze({label:'Instant film',short:'Instant',hint:'An instant print: a soft matte fade, warm light, a leak of light in the corner.'}),
 camcorder:Object.freeze({label:'VHS camcorder',short:'VHS',hint:'A home video tape of the 80s: colours that bleed, soft lines, a wobble at the foot.'}),
 halftone:Object.freeze({label:'Comic dots',short:'Dots',hint:'A printed comic page: the picture in cyan, magenta, yellow and black dots.'}),
 cyanotype:Object.freeze({label:'Blueprint',short:'Blueprint',hint:'A cyanotype: Prussian blue and paper white, as an engineer\'s plans were printed.'}),
 nightVision:Object.freeze({label:'Night vision',short:'Night',hint:'Green phosphor through an image tube: the dark brought up, with grain.'}),
 // The game consoles (the owner, 30 October 2026: "I want more video game shaders, n64, Gameboy color, PlayStation etc").
 colourHandheld:Object.freeze({label:'Colour hand-held',short:'Colour',hint:'The colour hand-held of 1998: tiny pixels, every tile in four shades of its own colour.'}),
 redVisor:Object.freeze({label:'Red visor',short:'Visor',hint:'The red visor of 1995: four shades of LED red on black.'}),
 eightBit:Object.freeze({label:'8-bit',short:'8-bit',hint:'A home console of the 80s: wide pixels, every colour from its fixed palette.'}),
 thirtyTwoBit:Object.freeze({label:'32-bit',short:'32-bit',hint:'The grey disc console of 1994: sharp pixels, 15-bit colour and its four-by-four dither.'}),
 sixtyFourBit:Object.freeze({label:'64-bit',short:'64-bit',hint:'The cartridge console of 1996: small textures filtered smooth, soft haze and a fine dither.'}),
});
/** The World Look whose little house stands in for a camera-only Look until its live thumbnail is drawn. */
export const LOOK_STANDIN=Object.freeze({adventureInk:'flat',instant:'sepia',camcorder:'crt',halftone:'riso',cyanotype:'mono',nightVision:'pocket',
 colourHandheld:'snes',redVisor:'riso',eightBit:'snes',thirtyTwoBit:'snes',sixtyFourBit:'tilt'});

// Clean coloured-comic panels: preserve the photo's hue, group the light into five gentle cel bands, and keep small
// dark details (especially eyes) as well as colour boundaries. No copied characters, art or shader code is used.
const ADVENTURE_BODY=`
// Smooth small photo texture while keeping strong boundaries. A five-tap, edge-aware brush makes a more legible
// colour cel than posterising the original pixel noise. Five taps per probe keeps the live-camera cost bounded.
vec3 adventureSmooth(vec2 p,float radius){
 vec3 c=texture2D(tDiffuse,p).rgb;
 vec2 d=uTexel*radius;
 vec3 a=texture2D(tDiffuse,p+vec2(d.x,0.0)).rgb;
 vec3 b=texture2D(tDiffuse,p-vec2(d.x,0.0)).rgb;
 vec3 e=texture2D(tDiffuse,p+vec2(0.0,d.y)).rgb;
 vec3 f=texture2D(tDiffuse,p-vec2(0.0,d.y)).rgb;
 vec3 da=a-c,db=b-c,de=e-c,df=f-c;
 float wa=exp(-dot(da,da)*16.0),wb=exp(-dot(db,db)*16.0);
 float we=exp(-dot(de,de)*16.0),wf=exp(-dot(df,df)*16.0);
 return (c+a*wa+b*wb+e*we+f*wf)/(1.0+wa+wb+we+wf);
}
void main(){
 float u=unit();
 vec3 orig=texture2D(tDiffuse,vUv).rgb;
 vec3 source=adventureSmooth(vUv,2.1*u);
 float l=luma(source);
 float band=.14+.15*smoothstep(.18,.25,l)+.19*smoothstep(.36,.43,l)
   +.21*smoothstep(.57,.64,l)+.18*smoothstep(.77,.84,l);
 // A shared gain keeps skin and strong colours in hue; gentle transitions prevent speckles near a tone boundary.
 float target=mix(l,band,.68);
 vec3 col=source*(target/max(l,.035));
 col/=max(1.0,max(col.r,max(col.g,col.b)));
 col=clamp(mix(vec3(luma(col)),col,1.11)*1.04,0.0,1.0);
 // Ink only broad, stable differences between smoothed regions, not tiny photo texture.
 vec2 t=uTexel*2.0*u;
 vec3 gx=adventureSmooth(vUv+vec2(t.x,0.0),2.1*u)-adventureSmooth(vUv-vec2(t.x,0.0),2.1*u);
 vec3 gy=adventureSmooth(vUv+vec2(0.0,t.y),2.1*u)-adventureSmooth(vUv-vec2(0.0,t.y),2.1*u);
 float strength=length(vec2(length(gx),length(gy)))*.577;
 float ink=smoothstep(.14,.38,strength)*.72;
 // Restore very dark marks only, preserving eyes and thin lettering without outlining every bit of texture.
 float dark=1.0-smoothstep(.025,.15,luma(orig));
 col=mix(col,orig,dark*.80);
 col=mix(col,vec3(.09,.095,.12),ink);
 gl_FragColor=vec4(col,1.0);
}`;

// An instant print: a gentle S curve, then a matte fade (blacks lifted, whites softened), cool shadows and warm
// highlights, a leak of orange light from the top right corner, soft corners and a fine grain.
const INSTANT_BODY=`
void main(){
 float u=unit();
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=luma(c);
 c=mix(vec3(l),c,.78);
 c=mix(c,c*c*(3.0-2.0*c),.45);
 c=mix(vec3(.16,.13,.15),vec3(.97,.91,.78),c);
 c+=vec3(.06,.025,-.05)*smoothstep(.4,1.0,l)+vec3(-.03,.01,.05)*(1.0-smoothstep(0.0,.45,l));
 vec2 q=(vUv-vec2(1.02,1.02))*vec2(1.5,1.0);
 c+=vec3(.75,.30,.08)*exp(-dot(q,q)*3.2)*.7;
 vec2 v=vUv-.5;
 c*=1.0-dot(v,v)*.8;
 c+=(hash(floor(vUv*uResolution/(1.4*u)))-.5)*.06;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
// A home video tape: the picture split into brightness and colour as a VHS recorder does, the colour smeared and late
// along each line, every line a hair off its neighbours and the bottom few torn sideways (the head switch), a few
// specks of tape noise and faint lines. Still, as every Look is: nothing moves with time.
const CAMCORDER_BODY=`
vec3 toYiq(vec3 c){return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(.596,-.274,-.322)),dot(c,vec3(.211,-.523,.312)));}
vec3 fromYiq(vec3 y){return vec3(y.x+.956*y.y+.621*y.z,y.x-.272*y.y-.647*y.z,y.x-1.106*y.y+1.703*y.z);}
void main(){
 float u=unit();
 float row=floor(vUv.y*uResolution.y/(2.0*u));
 float jitter=(hash(vec2(row,7.0))-.5)*2.0*u*uTexel.x+(1.0-smoothstep(0.0,.07,vUv.y))*(.01+hash(vec2(row,3.0))*.02);
 vec2 p=vec2(vUv.x+jitter,vUv.y);
 float y=0.0;vec2 iq=vec2(0.0);
 for(int i=-2;i<=2;i++){y+=toYiq(texture2D(tDiffuse,p+vec2(float(i)*2.2*u*uTexel.x,0.0)).rgb).x*(i==0?.32:.17);}
 for(int i=0;i<8;i++){iq+=toYiq(texture2D(tDiffuse,p+vec2((float(i)+1.5)*5.0*u*uTexel.x,0.0)).rgb).yz;}
 vec3 c=fromYiq(vec3(y*.96+.03,iq/8.0*1.45));
 c+=step(.998,hash(vec2(floor(vUv.x*uResolution.x/(4.0*u)),row)))*.4;
 c*=.88+.12*step(.5,fract(vUv.y*uResolution.y/(3.0*u)));
 c=mix(c,vec3(luma(c)),.06);
 c=c*vec3(1.06,1.0,.94)*1.04-.02;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
// A printed comic page: the picture separated into cyan, magenta, yellow and black, each printed as a grid of round
// dots at its own screen angle on cream paper, the dots as big as their ink's share of the colour.
const HALFTONE_BODY=`
float comicDot(vec2 px,float angle,float cell,float cover){
 float s=sin(angle),c=cos(angle);
 vec2 f=fract(mat2(c,-s,s,c)*px/cell)-.5;
 float r=sqrt(clamp(cover,0.0,1.0))*.62;
 return 1.0-smoothstep(r-.07,r+.07,length(f));
}
void main(){
 float u=unit(),cell=max(6.0,13.0*u);
 vec2 px=vUv*uResolution;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float k=1.0-max(c.r,max(c.g,c.b));
 vec3 cmy=(1.0-c-k)/max(1.0-k,.001)*.9;
 vec3 col=vec3(.98,.96,.90);
 col*=mix(vec3(1.0),vec3(0.0,.66,.92),comicDot(px,.26,cell,cmy.x));
 col*=mix(vec3(1.0),vec3(.92,.16,.52),comicDot(px,1.31,cell,cmy.y));
 col*=mix(vec3(1.0),vec3(1.0,.90,.05),comicDot(px,0.0,cell,cmy.z));
 // Black only where the picture is truly dark, as a comic's key plate: the shadows, not every middle tone.
 col*=mix(vec3(1.0),vec3(.13,.12,.14),comicDot(px,.79,cell,smoothstep(.38,1.0,k)*.95));
 gl_FragColor=vec4(col,1.0);
}`;
// A cyanotype: the light of the picture printed from Prussian blue to paper white, with the paper's grain and its
// brushed-on edges a little darker.
const CYANOTYPE_BODY=`
void main(){
 float u=unit();
 float l=pow(smoothstep(.04,.96,luma(texture2D(tDiffuse,vUv).rgb)),.85);
 vec3 deep=vec3(.03,.17,.36),mid=vec3(.13,.39,.62),paper=vec3(.90,.94,.95);
 vec3 col=l<.5?mix(deep,mid,l*2.0):mix(mid,paper,(l-.5)*2.0);
 col+=(noise(vUv*uResolution/(3.0*u))-.5)*.05;
 vec2 v=vUv-.5;
 col*=1.0-dot(v,v)*.35;
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Night vision: the picture's light amplified into green phosphor, the bright parts glowing out a little, grain and
// faint lines, seen through the round end of an image tube.
const NIGHT_BODY=`
void main(){
 float u=unit();
 vec3 c=texture2D(tDiffuse,vUv).rgb,g=vec3(0.0);
 for(int i=0;i<8;i++){float a=float(i)*.785;g+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*uTexel*5.0*u).rgb;}
 float l=smoothstep(.03,.95,luma(c)*.85+luma(g/8.0)*.3);
 l=pow(l,.9);
 l+=(hash(floor(vUv*uResolution/(1.5*u)))-.5)*.14;
 l*=.92+.08*step(.5,fract(vUv.y*uResolution.y/(3.0*u)));
 vec2 v=(vUv-.5)*vec2(uResolution.x/uResolution.y,1.0);
 float tube=1.0-smoothstep(.42,.72,length(v));
 gl_FragColor=vec4(clamp(vec3(.10,1.0,.32)*l*tube+vec3(0.0,.03,0.0),0.0,1.0),1.0);
}`;
// Shared by the camera's photo versions of World's drawn Looks: pencil strokes laid by tone, and a line finder.
const PHOTO_STROKES=`
// How finished the drawing is here: full in the middle, lighter towards the picture's edges.
float finished(vec2 uv,float least){return mix(least,1.0,1.0-smoothstep(.5,1.1,length((uv-.5)*2.0)));}
// One layer of pencil strokes along dir: a value per pixel, 1 on a stroke's middle line, falling to 0 at its sides,
// so a tone is drawn by keeping what is above (1 - cover). Each stroke is straight, as a hand draws one: its own length,
// start and pressure, set a little off its lane and leaning a little, tapering at both ends.
float pencilLane(vec2 p,vec2 dir,float spacing,float seed){
 float along=dot(p,dir),across=dot(p,vec2(-dir.y,dir.x));
 float lane=floor(across/spacing);
 float len=mix(18.0,44.0,hash(vec2(lane,seed+3.0)));
 float s=along/len+hash(vec2(lane,seed+5.0)),seg=floor(s),ph=fract(s);
 float stroke=lane*1.37+seg*7.31;
 float shift=(hash(vec2(stroke,seed+1.0))-.5)*.5+(ph-.5)*(hash(vec2(stroke,seed+2.0))-.5)*.45;
 float f=across/spacing-lane-shift;
 float pressure=mix(.5,1.0,hash(vec2(stroke,seed+9.0)));
 float taper=smoothstep(0.0,.18,ph)*(1.0-smoothstep(.72,1.0,ph));
 float body=max(0.0,1.0-abs(f-.5)*2.0);
 return body*(.75+.25*body)*mix(.3,1.0,taper)*pressure;
}
// A hatch in exactly the direction a (radians), as much of it as cover asks for.
float pencilHatch(vec2 p,float a,float spacing,float cover,float seed){
 float edge=1.0-cover;
 return smoothstep(edge-.16,edge+.16,pencilLane(p,vec2(cos(a),sin(a)),spacing,seed))*step(.003,cover);
}
// Strokes in the direction a (radians), drawn from the four directions 45 degrees apart either side of it, so the
// pattern holds together however the direction turns across the picture.
float pencilLayer(vec2 p,float a,float spacing,float cover,float seed){
 float b=mod(a,3.14159265)/.78539816,i=mod(floor(b),4.0),j=mod(i+1.0,4.0),t=smoothstep(.2,.8,fract(b));
 vec2 d0=vec2(cos(i*.78539816),sin(i*.78539816)),d1=vec2(cos(j*.78539816),sin(j*.78539816));
 float s0=pencilLane(p,d0,spacing,seed+i*13.0),s1=pencilLane(p,d1,spacing,seed+j*13.0);
 float edge=1.0-cover,soft=.16;
 return mix(smoothstep(edge-soft,edge+soft,s0),smoothstep(edge-soft,edge+soft,s1),t)*step(.003,cover);
}
`;
// Ink lines for a photograph, as photo-to-drawing work finds them (an extended difference of Gaussians): a point is on
// a line where it is darker than what is round it, so each edge gets one line, on its dark side, as heavy as the edge is
// strong, and a uniform area (a dark shirt, a bright wall) gets none. The camera's first pass has already smoothed the
// photo's noise away, so the near ring is the small blur and the rings round it the wide one.
const PHOTO_LINES=`
float ringLuma(vec2 uv,float r){
 float s=0.0;
 for(int k=0;k<8;k++){float a=float(k)*.785398+.39;s+=luma(texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*r).rgb);}
 return s*.125;
}
vec3 ringColour(vec2 uv,float r){
 vec3 s=vec3(0.0);
 for(int k=0;k<8;k++){float a=float(k)*.785398;s+=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*r).rgb;}
 return s*.125;
}
// What is round a point: the mean light of two rings (one in the light build).
float around(vec2 uv,float u,float r){
#ifdef LIGHT
 return ringLuma(uv,r*u);
#else
 return ringLuma(uv,r*u)*.6+ringLuma(uv,r*2.2*u)*.4;
#endif
}
// 0 on paper, 1 on a line, from a point's light l and the light round it m.
float inkLine(float l,float m,float threshold,float soft){return smoothstep(threshold,threshold+soft,m-l);}
// A contour where colours meet strongly, on both sides, so a silhouette is kept where the tone of one side takes over
// (a neckline against a black top, a pale cheek against a pale wall).
float contour(vec2 uv,float u){return smoothstep(.45,.85,edges(uv,1.2*u,1.0));}
`;
// Pencil crayon for a photograph (the owner, 30 October 2026: "Proceed"). World's Crayon lays its strokes along the
// town's walls and floors, from depth and normals a photo does not have; on a photo it fell back to two fixed diagonal
// grids four pixels apart, an even mesh over face and background alike, with the colour washed to grey. Here the
// strokes follow the picture's own shapes (the direction of its edges, in four directions blended), are long and far
// enough apart to read as strokes on a phone, and carry the photo's colour as pencils do: a vivid pigment with paper
// between the strokes, as much of it as the tone needs, and a darker pencil crossing the shadows. The edges of the
// picture are left lighter, as a drawing is finished in the middle first.
const CRAYON_BODY=`${PHOTO_STROKES}
// The direction of the picture's edges here (doubled, so a line and its reverse agree), weighted by how clear it is.
vec2 pencilFlow(vec2 uv,float r){
 vec2 t=uTexel*r;
 float gx=luma(texture2D(tDiffuse,uv+vec2(t.x,0.0)).rgb)-luma(texture2D(tDiffuse,uv-vec2(t.x,0.0)).rgb);
 float gy=luma(texture2D(tDiffuse,uv+vec2(0.0,t.y)).rgb)-luma(texture2D(tDiffuse,uv-vec2(0.0,t.y)).rgb);
 return vec2(gy*gy-gx*gx,-2.0*gx*gy);
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 // A drawing is kept lighter than life in the middle tones (a face is not hatched dark); its blacks stay black.
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=luma(c);
 c=clamp(c*pow(max(l,.002),.9)/max(l,.002),0.0,1.0);
 l=luma(c);
 float tooth=noise(p*.9)*.6+noise(p*2.3)*.4;
 vec3 paper=vec3(.975,.962,.93)-.035*tooth;
 // Finished in the middle, lighter towards the edges; a dark part is drawn in full wherever it is (a night sky).
 vec2 v=(vUv-.5)*2.0;
 float finish=mix(mix(.5,1.0,1.0-smoothstep(.5,1.1,length(v))),1.0,1.0-smoothstep(.12,.4,l));
 // The strokes run along the picture's shapes where it has clear ones, and on the hand's natural diagonal elsewhere.
 vec2 flow=pencilFlow(vUv,4.0*u);
#ifndef LIGHT
 flow+=pencilFlow(vUv,11.0*u)*1.6;
#endif
 float clear=smoothstep(.006,.03,length(flow));
 vec2 natural=vec2(cos(2.0*1.0472),sin(2.0*1.0472));
 vec2 dir2=mix(natural,normalize(flow+1e-6),clear*.75);
 float a=.5*atan(dir2.y,dir2.x);
 // Two pencils for every colour. The first lays the colour itself, at a light value, vivid, with paper between the
 // strokes, as much as that tone needs; the second, a darker pencil of the same colour, crosses it in the shadows.
 // A colour is trusted less the darker it is: the faint tint of a black is the camera's noise, not a colour.
 float top=max(c.r,max(c.g,c.b)),sat=(top-min(c.r,min(c.g,c.b)))/max(top,.04)*smoothstep(.05,.3,top);
 vec3 hue=mix(vec3(1.0),c/max(top,.04),smoothstep(.05,.3,top));
 vec3 light=mix(vec3(1.0),hue,min(1.0,sat*1.35))*max(top,.8);
 vec3 absorb=clamp(1.0-light/paper,0.0,1.0);
 float need=max(absorb.r,max(absorb.g,absorb.b));
 vec3 pigment=1.0-absorb/max(need,.06)*.72;
 float cover1=min(need/.72,.78)*finish;
 float m1=pencilLayer(p,a,6.5,cover1,1.0);
 m1*=mix(.3+.7*smoothstep(.2,.75,tooth),1.0,cover1*cover1);
 vec3 col=paper*mix(vec3(1.0),pigment,m1);
 vec3 shade=mix(mix(vec3(1.0),hue,sat),vec3(.92,.9,1.0),.3*(1.0-sat))*mix(.13,.45,smoothstep(.04,.4,l));
 float after=luma(paper*mix(vec3(1.0),pigment,cover1));
 float cover2=clamp((after-l)/max(after-luma(shade*paper),.05),0.0,mix(.9,.78,smoothstep(.06,.2,l)))*finish;
 float m2=pencilLayer(p,a+1.1,5.5,cover2,40.0);
 m2*=mix(.25+.75*smoothstep(.25,.8,tooth),1.0,cover2*cover2);
 col*=mix(vec3(1.0),shade,m2);
 // The darkest parts are burnished: pressed hard with the dark pencil until the strokes close up, the tooth still
 // catching a few flecks of paper.
 float burnish=(1.0-smoothstep(.05,.2,l))*finish*mix(.7,.95,smoothstep(.2,.6,tooth));
 col=mix(col,paper*shade*1.15,burnish);
 // Lines: only the clear edges, in the dark pencil, wobbling a little as a hand-drawn line does.
 vec2 wobble=(vec2(noise(p*.05),noise(p*.05+17.0))-.5)*uTexel*2.5*u;
 float e=smoothstep(.45,1.0,edges(vUv+wobble,1.5*u,1.0))*(.55+.45*noise(p*.3));
#ifndef LIGHT
 e=max(e,spotBlack(vUv,u)*.9);
#endif
 col=mix(col,shade*.8,clamp(e,0.0,1.0)*.85*mix(.7,1.0,finish));
 gl_FragColor=vec4(col,1.0);
}`;
// The rubber stamp for a photograph. World's Stamp inks everything darker than one grey; on a photo a dark wall or
// background then became one block that swallowed the hair and the shoulder against it, a shaded cheek a blot, and the
// ink was a fine speckle everywhere, sandpaper rather than rubber. Here each tone is judged against what is round it
// (a light shape keeps its edge against a dark one, a soft shadow on a face is not darkened), and the ink is laid as a
// stamp lays it: pressed harder on one side of the print than the other, pooled darker at the cut edges, and missing in
// clumps where the rubber did not meet the paper, with the paper's own fibre under it.
const STAMP_BODY=`
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 raw=texture2D(tDiffuse,vUv).rgb;
 float l=luma(raw);
 // What is round this point, near and wider.
 float near=0.0,wide=0.0;
 for(int k=0;k<8;k++){
  vec2 d=vec2(cos(float(k)*.785398+.2),sin(float(k)*.785398+.2))*uTexel*u;
  near+=luma(texture2D(tDiffuse,vUv+d*9.0).rgb);
#ifndef LIGHT
  wide+=luma(texture2D(tDiffuse,vUv+d*26.0).rgb);
#endif
 }
#ifdef LIGHT
 float around=near/8.0;
#else
 float around=near/16.0+wide/16.0;
#endif
 // Lifted where lighter than its surroundings (a shoulder against a dark wall stays paper), darkened only a little
 // where darker (a soft shadow on a cheek does not become a blot).
 float tone=l+1.25*max(0.0,l-around)-.3*max(0.0,around-l);
 tone+=(noise(p*.55)-.5)*.025;
 // The pressure across the print: heavier on one side, and in broad patches.
 float press=clamp(.5+.8*dot(vUv-.5,vec2(.8,-.6))+.5*(noise(p*.004)-.5)+.25*(noise(p*.012+7.0)-.5),0.0,1.0);
 float cut=.41+.03*(press-.5);
 float w=max(fwidth(tone)*.8,.006);
 float fill=1.0-smoothstep(cut-w,cut+w,tone);
 // Ink gathers at the cut edges. Where the pressure was light it thins in a mottle and misses the paper in ragged
 // patches, never at an edge; under it, the paper's fibre.
 float rim=fill*(1.0-smoothstep(.0,.07,cut-tone));
 float mottle=noise(p*.03)*.6+noise(p*.075)*.4;
 float clumps=noise(p*.045)*.65+noise(p*.13)*.35;
 float voids=smoothstep(.70+.3*press,.75+.3*press,clumps)*(1.0-rim);
 float fibre=noise(p*1.6)*.5+noise(p*.7)*.5;
 float deposit=fill*(.74+.1*fibre+.16*mix(mottle,1.0,press))*(1.0-voids*.88)+rim*.14;
 // Carved lines and the small dark marks of a face, which the carver keeps.
 float line=smoothstep(.45,.9,edges(vUv,1.9*u,1.0))*(.85+.15*fibre);
 deposit=max(deposit,line*mix(.75,.95,press));
#ifndef LIGHT
 deposit=max(deposit,spotBlack(vUv,u)*.95);
#endif
 vec3 paper=vec3(.985,.965,.90)-.025*(fibre-.5),ink=vec3(.49,.09,.16);
 gl_FragColor=vec4(mix(paper,ink,clamp(deposit,0.0,1.0)),1.0);
}`;
// The drawn Looks for a photograph (the owner, 30 October 2026: "Yes proceed but you need audit yourself imagine you are
// a professional designer"). On a photo World's Line drawing and Pencil manga drew colour edges only and left a black
// shirt or dark hair as paper or a grey wash, so the person vanished and a face kept its eyes but lost its nose and
// mouth; Manga screened every grain of the photo into speckled tone; Sketchbook was the photo itself on a little grain.
// Each now finds its lines with PHOTO_LINES and draws the dark masses in its own medium.

// Line drawing: graphite outlines on white paper, the dark masses shaded with the same pencil.
const LINES_BODY=`${PHOTO_STROKES}${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float l=luma(texture2D(tDiffuse,vUv).rgb);
 vec3 paper=vec3(.985,.975,.95)-.035*noise(p*.45);
 // The outline, heavier on a strong edge, its pressure changing along it.
 float line=max(inkLine(l,around(vUv,u,2.0),.012,.05),contour(vUv,u))*(.75+.25*noise(p*.35));
 // Dark masses shaded: one layer of diagonal strokes from the shadows down, a second crossing it in the darks. (Ink
 // Looks see the picture exposed to a middle grey, so a black shirt arrives at about a quarter.)
 float f=finished(vUv,.35);
 float shade=pencilHatch(p,.7854,4.5,(1.0-smoothstep(.26,.56,l))*.85*f,3.0);
 shade=max(shade,pencilHatch(p,2.0,4.0,(1.0-smoothstep(.12,.34,l))*.85*f,8.0));
 float g=max(line*.95,shade*.8);
 gl_FragColor=vec4(mix(paper,vec3(.17,.17,.2),clamp(g,0.0,1.0)),1.0);
}`;
// Pencil manga: crisp ink contours, the deepest blacks filled, broken graphite strokes in the deep shadows, white paper.
const PENCIL_MANGA_BODY=`${PHOTO_STROKES}${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float l=luma(texture2D(tDiffuse,vUv).rgb);
 float m=around(vUv,u,1.8);
 float line=max(inkLine(l,m,.014,.035),contour(vUv,u))*(.82+.18*noise(p*.9));
 // The deepest blacks filled with ink, their edges cut clean.
 float k=mix(l,m,.5),w=max(fwidth(k),.004);
 float solid=1.0-smoothstep(.16-w,.16+w,k);
 float f=finished(vUv,.4);
 float shade=pencilHatch(p,.7854,5.0,(1.0-smoothstep(.27,.45,l))*.75*f,5.0);
 shade=max(shade,pencilHatch(p,2.0,4.2,(1.0-smoothstep(.18,.32,l))*.75*f,9.0));
 // Graphite, not printer's ink: the fills are a dark lead grey with a sheen and the paper's tooth in them.
 float lead=.86+.1*noise(p*.8)-.08*noise(p*.07);
 float ink=max(max(line,solid*lead),shade*.8);
 gl_FragColor=vec4(mix(vec3(1.0),vec3(.1,.1,.11),clamp(ink,0.0,1.0)),1.0);
}`;
// Manga: black ink, screentone and hatching, one bit as printed. The tones are cut from a simplified picture (an
// artist screens shapes, not every grain): paper, a light screen, a dark screen, the dark screen hatched, solid black.
const MANGA_BODY=`${PHOTO_LINES}
float mangaDots(vec2 p,float cover,float cell){
 vec2 r=mat2(.7071,-.7071,.7071,.7071)*p/cell;
 float radius=sqrt(cover)*.56419,d=length(fract(r)-.5),aa=max(fwidth(d),.02)*.8;
 return 1.0-smoothstep(radius-aa,radius+aa,d);
}
float mangaHatch(vec2 p,vec2 dir,float spacing){
 float s=abs(fract(dot(p,dir)/spacing)-.5)*spacing,aa=max(fwidth(dot(p,dir)),.5)*.6;
 return 1.0-smoothstep(.75-aa,.75+aa,s);
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float l=luma(texture2D(tDiffuse,vUv).rgb);
 float line=max(inkLine(l,around(vUv,u,1.8),.016,.035),contour(vUv,u));
#ifdef LIGHT
 float wide=ringLuma(vUv,8.0*u);
#else
 float wide=ringLuma(vUv,7.0*u)*.5+ringLuma(vUv,14.0*u)*.5;
#endif
 float t=clamp((mix(l,wide,.4)-.5)*1.2+.52,0.0,1.0),w=max(fwidth(t),.003);
 float light=1.0-smoothstep(.64-w,.64+w,t),dark=1.0-smoothstep(.44-w,.44+w,t);
 float hatched=1.0-smoothstep(.30-w,.30+w,t),black=1.0-smoothstep(.20-w,.20+w,t);
 float ink=mix(mangaDots(p,.2,6.0)*light,mangaDots(p,.5,6.0),dark);
 ink=max(max(ink,mangaHatch(p,vec2(.7071,-.7071),7.0)*hatched),black);
 // Dots, lines and fills are ink or paper; only their edges are smoothed, never a grey wash under them.
 ink=max(ink,line);
 gl_FragColor=vec4(vec3(1.0-clamp(ink,0.0,1.0)),1.0);
}`;
// Architectural sketchbook: a loose watercolour wash laid in three transparent layers by tone (the lights left as
// paper, the colour simplified, a darker rim where each layer dried, the pigment settling in the paper's grain), then
// broken, porous graphite lines and a little pencil shading in the darks.
const SKETCHBOOK_BODY=`${PHOTO_STROKES}${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float l=luma(c);
 vec3 paper=vec3(.98,.96,.91)-.03*noise(p*.5);
 // The wash: the picture's colour simplified (what is round it), laid a little off the pencil as a quick sketch is, in
 // three pale transparent layers, each over the one before; the lights left as paper, the edges wandering.
 vec2 off=(vec2(noise(p*.012),noise(p*.012+9.0))-.5)*uTexel*9.0*u;
 vec3 w=mix(texture2D(tDiffuse,vUv+off).rgb,ringColour(vUv+off,6.0*u),.6);
 float wl=luma(w),loose=wl+(noise(p*.02)-.5)*.1;
 float a1=1.0-smoothstep(.72,.84,loose),a2=1.0-smoothstep(.44,.52,loose),a3=1.0-smoothstep(.2,.28,loose);
 // Each layer takes the wash a step darker in its own colour (a navy stays navy), pale as a quick sketch's washes
 // are; the highlights are left as paper.
 float value=mix(.9,mix(.76,.6,a3),a2);
 vec3 wash=clamp(mix(vec3(value),w*(value/max(wl,.03)),.6),0.0,1.0);
 // A darker rim where a layer dried, and the pigment settling in the paper's grain.
 float rim=(1.0-smoothstep(.0,.04,.50-loose))*a2+(1.0-smoothstep(.0,.04,.28-loose))*a3;
 float grain=1.0-(1.0-noise(p*.6)*noise(p*.23+5.0))*.08*a1;
 vec3 col=paper*mix(vec3(1.0),wash,a1)*grain*(1.0-.07*clamp(rim,0.0,1.0));
 // Graphite does the drawing: lines broken along their length and porous, and the pencil shading the darks.
 float f=finished(vUv,.4);
 float line=inkLine(l,around(vUv,u,2.0),.014,.05)*mix(.45,1.0,smoothstep(.25,.5,noise(p*.06+3.0)))*(.7+.3*noise(p*.9));
 float shade=pencilHatch(p,.7854,4.2,(1.0-smoothstep(.2,.42,l))*.7*f,4.0);
 shade=max(shade,pencilHatch(p,2.0,3.8,(1.0-smoothstep(.1,.26,l))*.7*f,7.0));
 col=mix(col,vec3(.24,.22,.23),clamp(max(line,shade*.6),0.0,1.0)*.9);
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Woodblock print for a photograph. World's print gives each pixel the nearest of ten inks, judged mostly by lightness,
// which on a photo put a shaded cheek in ochre or green and broke the shading of a face into patches. Here the colour is
// flattened first (a print is cut in shapes), the inks are judged by hue as much as by lightness, and the palette has
// what a portrait needs from the printer's cabinet: a pale and a shaded flesh, and mouse grey (nezumi) for the greys.
// The key block's outline is printed a hair out of register, as World's is.
const PRINT_BODY=`${PHOTO_LINES}
vec3 printInk(vec3 c){
 vec3 best=vec3(0.0);float d=1e9;
 vec3 inks[12];
 inks[0]=vec3(.95,.91,.81);inks[1]=vec3(.12,.23,.37);inks[2]=vec3(.18,.36,.54);inks[3]=vec3(.56,.70,.79);
 inks[4]=vec3(.78,.27,.18);inks[5]=vec3(.85,.64,.25);inks[6]=vec3(.49,.60,.42);inks[7]=vec3(.16,.14,.13);
 inks[8]=vec3(.92,.78,.63);inks[9]=vec3(.54,.35,.23);inks[10]=vec3(.78,.57,.44);inks[11]=vec3(.58,.56,.52);
 for(int i=0;i<12;i++){
  vec3 rgb=c-inks[i];
  vec3 e=vec3(dot(rgb,vec3(.25,.5,.25)),rgb.r-rgb.b,rgb.g-(rgb.r+rgb.b)*.5)*vec3(1.4,1.0,1.25);
  float k=dot(e,e);if(k<d){d=k;best=inks[i];}
 }
 return best;
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 raw=texture2D(tDiffuse,vUv).rgb;
 vec3 c=raw*.3+ringColour(vUv,3.5*u)*.35+ringColour(vUv,7.0*u)*.35;
 float l=luma(c);
 vec3 col=printInk(clamp(mix(vec3(l),c,1.25),0.0,1.0));
 // Paper and wood grain show through the ink, stronger along the grain.
 float grain=noise(vec2(p.x*.04,p.y*.9))*.6+noise(p*.5)*.4;
 col*=.94+.08*grain;
 vec2 key=vUv+vec2(.9,-.65)*uTexel*u;
 float e=inkLine(luma(texture2D(tDiffuse,key).rgb),around(key,u,2.0),.016,.05);
 col=mix(col,vec3(.13,.11,.10),clamp(e,0.0,1.0));
 gl_FragColor=vec4(col,1.0);
}`;
// Pocket Gentleman for a photograph: four greens and big pixels. World's version turns any edge in a cell into the
// darkest green, and a photo has edges everywhere (every wrinkle and hair), so faces came out blotched. The hand-held
// camera sharpened its picture before it dithered it instead: here each cell is the average of its own pixels,
// sharpened against the cells round it, then dithered into the four greens.
const POCKET_BODY=`${PHOTO_LINES}
void main(){
 float px=max(2.0,floor(uResolution.y/144.0));
 vec2 cell=floor(vUv*uResolution/px);
 vec2 centre=(cell+.5)*px/uResolution,q=uTexel*px*.25;
 float l=(luma(texture2D(tDiffuse,centre+q).rgb)+luma(texture2D(tDiffuse,centre-q).rgb)
  +luma(texture2D(tDiffuse,centre+vec2(q.x,-q.y)).rgb)+luma(texture2D(tDiffuse,centre+vec2(-q.x,q.y)).rgb))*.25;
 l=clamp(l+1.1*(l-ringLuma(centre,px*1.7)),0.0,1.0);
 l=smoothstep(.1,.9,l);
 float shade=floor(clamp(l*3.0+bayer4(cell)-.5,0.0,3.0)+.5);
 vec3 c=shade<.5?vec3(24.0,48.0,32.0):shade<1.5?vec3(62.0,98.0,56.0):shade<2.5?vec3(130.0,158.0,76.0):vec3(200.0,212.0,138.0);
 gl_FragColor=vec4(c/255.0,1.0);
}`;
// Watercolour for a photograph, after World's (the wash wandering off the drawing, blooms, a darker rim where washes
// meet, granulation, the lightest paper left white). World's steps each colour channel on its own into a handful of
// washes, which on a photo's smooth skin made false pink and green patches; here the wash is stepped by its lightness
// and keeps its hue.
const WATERCOLOUR_BODY=`${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec2 wander=((vec2(noise(p*.012),noise(p*.012+31.0))-.5)*6.0+(vec2(noise(p*.06),noise(p*.06+7.0))-.5)*2.0)*uTexel*u;
 vec2 uv=vUv+wander;
 vec3 soft=ringColour(uv,3.0*u);
 // Fewer, flatter tones: a painter mixes a handful of washes, not every shade; each keeps its colour.
 float sl=luma(soft);
 soft=mix(soft,soft*((floor(sl*6.0+.5)/6.0)/max(sl,.02)),.6);
 vec3 paper=vec3(.985,.97,.935);
 float bloom=noise(p*.008)*.6+noise(p*.03)*.4;
 vec3 wash=mix(paper,soft,.72+.18*bloom);
 float edge=edges(uv,1.8*u,1.0);
 wash=mix(wash,soft*.62,clamp(edge,0.0,1.0)*.75);
 float tooth=noise(p*.55)*.55+noise(p*1.7)*.45;
 wash*=.88+.16*tooth;
 wash=mix(wash,paper,smoothstep(.8,.95,luma(soft))*.7);
 gl_FragColor=vec4(clamp(wash,0.0,1.0),1.0);
}`;
// The game consoles (the owner, 30 October 2026: "I want more video game shaders, n64, Gameboy color, PlayStation
// etc"). Each draws a photo under the constraints its machine drew a picture under, not as a tint: its lines on the
// screen, its colours and how it dithered or filtered them. No machine is named in the app, as with Pocket and 16-bit.
// One cell of a console's picture: its own pixels averaged (four samples), so a big pixel is the colour of what it covers.
const CONSOLE_GRID=`
vec3 cellColour(vec2 centre,vec2 size){
 vec2 q=size*.25;
 return (texture2D(tDiffuse,centre+q).rgb+texture2D(tDiffuse,centre-q).rgb
  +texture2D(tDiffuse,centre+vec2(q.x,-q.y)).rgb+texture2D(tDiffuse,centre+vec2(-q.x,q.y)).rgb)*.25;
}
`;
// The colour hand-held of 1998: 160 by 144 pixels, and every 8 by 8 tile drawn from a palette of its own of four
// colours. A photo on it is a mosaic of tiles, each in four shades of the colour it mostly is, dithered; 15-bit colour.
const HANDHELD_COLOUR_BODY=`${CONSOLE_GRID}
void main(){
 float px=max(2.0,floor(uResolution.y/144.0));
 vec2 cell=floor(vUv*uResolution/px),size=vec2(px)/uResolution;
 vec2 centre=(cell+.5)*size;
 vec3 c=cellColour(centre,size);
 // The tile's colour: four points across its 8 by 8 cells.
 vec2 tile=floor(cell/8.0)*8.0;
 vec3 t=(cellColour((tile+vec2(2.0,2.0))*size,size*2.0)+cellColour((tile+vec2(6.0,2.0))*size,size*2.0)
  +cellColour((tile+vec2(2.0,6.0))*size,size*2.0)+cellColour((tile+vec2(6.0,6.0))*size,size*2.0))*.25;
 float top=max(t.r,max(t.g,t.b));
 vec3 hue=mix(vec3(1.0),t/max(top,.05),smoothstep(.04,.25,top));
 hue=clamp(mix(vec3(luma(hue)),hue,1.35),0.0,1.0);
 // Its four shades: near black in the colour, the colour dark, the colour, the colour pale.
 float l=clamp((luma(c)-.06)*1.15,0.0,1.0);
 float shade=floor(clamp(l*3.0+bayer4(cell)-.5,0.0,3.0)+.5);
 vec3 col=shade<.5?hue*.16:shade<1.5?hue*.48:shade<2.5?mix(hue,vec3(1.0),.12)*.86:mix(hue,vec3(1.0),.62);
 gl_FragColor=vec4(floor(clamp(col,0.0,1.0)*31.0+.5)/31.0,1.0);
}`;
// The 8-bit home console of the 80s: 256 by 240 pixels, slightly wide, and every colour one of its fixed palette of
// fifty-odd; a photo is matched to the palette with an ordered dither.
const EIGHT_BIT_BODY=`${CONSOLE_GRID}
vec3 eightBitInk(vec3 c){
 vec3 pal[54];
 pal[0]=vec3(124,124,124);pal[1]=vec3(0,0,252);pal[2]=vec3(0,0,188);pal[3]=vec3(68,40,188);pal[4]=vec3(148,0,132);
 pal[5]=vec3(168,0,32);pal[6]=vec3(168,16,0);pal[7]=vec3(136,20,0);pal[8]=vec3(80,48,0);pal[9]=vec3(0,120,0);
 pal[10]=vec3(0,104,0);pal[11]=vec3(0,88,0);pal[12]=vec3(0,64,88);pal[13]=vec3(0,0,0);
 pal[14]=vec3(188,188,188);pal[15]=vec3(0,120,248);pal[16]=vec3(0,88,248);pal[17]=vec3(104,68,252);pal[18]=vec3(216,0,204);
 pal[19]=vec3(228,0,88);pal[20]=vec3(248,56,0);pal[21]=vec3(228,92,16);pal[22]=vec3(172,124,0);pal[23]=vec3(0,184,0);
 pal[24]=vec3(0,168,0);pal[25]=vec3(0,168,68);pal[26]=vec3(0,136,136);
 pal[27]=vec3(248,248,248);pal[28]=vec3(60,188,252);pal[29]=vec3(104,136,252);pal[30]=vec3(152,120,248);pal[31]=vec3(248,120,248);
 pal[32]=vec3(248,88,152);pal[33]=vec3(248,120,88);pal[34]=vec3(252,160,68);pal[35]=vec3(248,184,0);pal[36]=vec3(184,248,24);
 pal[37]=vec3(88,216,84);pal[38]=vec3(88,248,152);pal[39]=vec3(0,232,216);pal[40]=vec3(120,120,120);
 pal[41]=vec3(252,252,252);pal[42]=vec3(164,228,252);pal[43]=vec3(184,184,248);pal[44]=vec3(216,184,248);pal[45]=vec3(248,184,248);
 pal[46]=vec3(248,164,192);pal[47]=vec3(240,208,176);pal[48]=vec3(252,224,168);pal[49]=vec3(248,216,120);pal[50]=vec3(216,248,120);
 pal[51]=vec3(184,248,184);pal[52]=vec3(184,248,216);pal[53]=vec3(0,252,252);
 vec3 best=vec3(0.0);float d=1e9;
 for(int i=0;i<54;i++){
  vec3 q=pal[i]/255.0,e=c-q;float r=(c.r+q.r)*.5;
  float k=(2.0+r)*e.r*e.r+4.0*e.g*e.g+(3.0-r)*e.b*e.b;
  if(k<d){d=k;best=q;}
 }
 return best;
}
void main(){
 float py=max(2.0,floor(uResolution.y/240.0));
 vec2 size=vec2(py*8.0/7.0,py);
 vec2 cell=floor(vUv*uResolution/size),px=size/uResolution;
 vec3 c=cellColour((cell+.5)*px,px);
 c=clamp(mix(vec3(luma(c)),c,1.2),0.0,1.0);
 gl_FragColor=vec4(eightBitInk(clamp(c+(bayer4(cell)-.5)*.12,0.0,1.0)),1.0);
}`;
// The grey 32-bit disc console of 1994: 320 by 240 sharp pixels, 15-bit colour, and the dither its graphics chip laid
// over every gradient, a fixed four by four pattern added before the colour was cut to five bits a channel.
const THIRTY_TWO_BIT_BODY=`${CONSOLE_GRID}
float psDither(vec2 cell){
 vec2 m=mod(cell,4.0);
 float r0=m.x<.5?-4.0:m.x<1.5?0.0:m.x<2.5?-3.0:1.0;
 float r1=m.x<.5?2.0:m.x<1.5?-2.0:m.x<2.5?3.0:-1.0;
 float r2=m.x<.5?-3.0:m.x<1.5?1.0:m.x<2.5?-4.0:0.0;
 float r3=m.x<.5?3.0:m.x<1.5?-1.0:m.x<2.5?2.0:-2.0;
 return m.y<.5?r0:m.y<1.5?r1:m.y<2.5?r2:r3;
}
void main(){
 float px=max(2.0,floor(uResolution.y/240.0));
 vec2 cell=floor(vUv*uResolution/px),size=vec2(px)/uResolution;
 // Its textures were smaller than the screen and never filtered: texels of two by two pixels, in few colours.
 vec2 t=floor(cell/2.0);
 vec3 c=cellColour((t+.5)*size*2.0,size*2.0);
 c=clamp(mix(vec3(luma(c)),c,1.15),0.0,1.0);
 vec3 eight=clamp(c*255.0+psDither(cell)*2.0,0.0,255.0);
 gl_FragColor=vec4(floor(eight/17.0+.5)*17.0/255.0,1.0);
}`;
// The 64-bit cartridge console of 1996: its textures were small and filtered smooth by a three-point blend (the
// diagonal smear players remember), its picture 320 by 240 with 16-bit colour and a fine noise dither, and its worlds
// sat in a soft haze. A photo becomes a low-resolution texture, three-point filtered, hazed and cut to the screen.
const SIXTY_FOUR_BIT_BODY=`${CONSOLE_GRID}
vec3 texel(vec2 t,vec2 size){return cellColour((t+.5)*size,size);}
void main(){
 float px=max(2.0,floor(uResolution.y/240.0));
 vec2 screen=floor(vUv*uResolution/px),ssize=vec2(px)/uResolution;
 vec2 at=(screen+.5)*ssize;
 // The texture: about 96 texels down the picture.
 vec2 tsize=vec2(uResolution.y/96.0)/uResolution;
 vec2 g=at/tsize-.5,t=floor(g),f=fract(g);
 vec3 c;
 if(f.x+f.y<1.0){vec3 a=texel(t,tsize),b=texel(t+vec2(1,0),tsize),d=texel(t+vec2(0,1),tsize);c=a+f.x*(b-a)+f.y*(d-a);}
 else{vec3 a=texel(t+vec2(1,1),tsize),b=texel(t+vec2(0,1),tsize),d=texel(t+vec2(1,0),tsize);c=a+(1.0-f.x)*(b-a)+(1.0-f.y)*(d-a);}
 // Brighter, rounder colour and the haze of a world drawn with fog.
 c=clamp(mix(vec3(luma(c)),c,1.15),0.0,1.0);
 c=mix(c,vec3(.80,.83,.88),.10+.10*smoothstep(.4,1.0,vUv.y));
 vec3 five=floor(c*31.0+hash(screen)*.999)/31.0;
 gl_FragColor=vec4(clamp(five,0.0,1.0),1.0);
}`;
// The red visor of 1995: 384 by 224 pixels in four shades of LED red on black, the dark between the pixels showing.
const RED_VISOR_BODY=`${CONSOLE_GRID}
void main(){
 float px=max(2.0,floor(uResolution.y/224.0));
 vec2 cell=floor(vUv*uResolution/px),size=vec2(px)/uResolution;
 vec2 centre=(cell+.5)*size;
 float l=luma(cellColour(centre,size));
 l=pow(clamp((l-.06)*1.15,0.0,1.0),1.5);
 float shade=floor(clamp(l*3.0+bayer4(cell)-.5,0.0,3.0)+.5);
 vec2 inPixel=fract(vUv*uResolution/px);
 float gap=step(.12,inPixel.x)*step(.12,inPixel.y)*(px>2.5?1.0:.0)+(px>2.5?0.0:1.0);
 vec3 red=vec3(1.0,.04,.05)*(shade*.31)*mix(.55,1.0,gap);
 gl_FragColor=vec4(red,1.0);
}`;
/** The camera's own Looks: each a main of its own over World's shared helpers (Cartoon's program supplies them). Crayon,
 * Stamp, Line drawing, Pencil manga, Manga, Sketchbook, Woodblock print, Pocket and Watercolour keep World's names and
 * swatches but draw a photograph with these, made for one. */
const CAMERA_BODIES={adventureInk:ADVENTURE_BODY,instant:INSTANT_BODY,camcorder:CAMCORDER_BODY,halftone:HALFTONE_BODY,cyanotype:CYANOTYPE_BODY,nightVision:NIGHT_BODY,crayon:CRAYON_BODY,stamp:STAMP_BODY,lines:LINES_BODY,pencilManga:PENCIL_MANGA_BODY,manga:MANGA_BODY,sketchbook:SKETCHBOOK_BODY,print:PRINT_BODY,pocket:POCKET_BODY,watercolour:WATERCOLOUR_BODY,
 colourHandheld:HANDHELD_COLOUR_BODY,eightBit:EIGHT_BIT_BODY,thirtyTwoBit:THIRTY_TWO_BIT_BODY,sixtyFourBit:SIXTY_FOUR_BIT_BODY,redVisor:RED_VISOR_BODY};

/** In the order World's menu offers them. */
export const LOOK_NAMES=Object.freeze(Object.keys(LOOKS));
/** The trick lenses, as the hand-held cameras had them: Twin mirrors the left half onto the right, Quad the top left
 * quarter into all four. */
export const TRICKS=Object.freeze(['none','twin','quad']);
/** The longest side and the most pixels a save may have (iOS Safari refuses canvases over 16.7 million pixels). */
export const MAX_SIDE=4096,MAX_PIXELS=16e6;

const WORLD_UNIT='float unit(){return max(1.0,uResolution.y/1080.0);}';
const PHOTO_UNIT='uniform float uLines;uniform float uUnitFloor;\nfloat unit(){return max(uUnitFloor,uResolution.y/uLines);}';

/** World's fragment for a Look as GLSL ES 3.00, mixed into its input by uAmount; null for Natural. */
export function photoFragment(name,{light=false}={}){
 const own=CAMERA_BODIES[name];
 let world=lookFragment(own?'flat':name,{light,depth:false});
 if(!world)return null;
 if(own){
  // flat's program is the final main after the shared helpers; replace only it, retaining the camera conversion.
  const main=world.lastIndexOf('void main()');
  if(main<0)throw new Error('World Look helper entry point changed');
  world=world.slice(0,main)+own;
 }
 const body=world.replace('#include <packing>','').replace(WORLD_UNIT,PHOTO_UNIT).replace(/void\s+main\s*\(\s*\)/,'void lookMain()');
 return `#version 300 es
precision highp float;precision highp int;
#define varying in
#define texture2D texture
vec4 lookColor;
#define gl_FragColor lookColor
${body}
uniform float uAmount;
out highp vec4 fragColor;
void main(){lookMain();vec3 before=texture(tDiffuse,vUv).rgb;fragColor=vec4(mix(before,clamp(lookColor.rgb,0.0,1.0),uAmount),1.0);}`;
}

/** Whether a Look draws outlines (and so wants camera noise smoothed away first). */
export const lookDrawsLines=name=>name==='adventureInk'||(name!=='none'&&lookUsesDepth(name));
/**
 * The Looks that print a picture in a few inks at fixed thresholds. World's town is bright and evenly lit, and they
 * are set for it; a photo of a shady garden would print almost solid. So, as the town's Pocket camera exposes each
 * photo before its dither (src/photo/pocket-camera.js), a picture is exposed for them first: its average brought to
 * the town's middle.
 */
export const INK_LOOKS=Object.freeze(['pocket','snes','lines','manga','print','riso','pencilManga','stamp','halftone','cyanotype','nightVision','colourHandheld','redVisor','eightBit']);

/** A recipe with every field present and in range. */
export function normalRecipe(recipe={}){
 const n=(v,lo,hi,d)=>Number.isFinite(+v)?Math.min(hi,Math.max(lo,+v)):d;
 const layers=(Array.isArray(recipe.layers)?recipe.layers:[]).slice(0,3)
  .map(l=>({look:Object.hasOwn(LOOKS,l?.look)?l.look:'none',amount:n(l?.amount,0,1,1)}));
 if(!layers.length)layers.push({look:'none',amount:1});
 const a=recipe.adjust||{};
 // Stickers (stickers.js): centre, height as a share of the picture's height, angle in degrees, mirrored or not; a
 // balloon (lettering.js) also keeps its words.
 const stickers=(Array.isArray(recipe.stickers)?recipe.stickers:[]).filter(s=>typeof s?.id==='string').slice(0,40)
  .map(s=>({id:s.id,x:n(s.x,-.2,1.2,.5),y:n(s.y,-.2,1.2,.5),size:n(s.size,.06,1.6,.42),angle:n(s.angle,-3600,3600,0),flip:!!s.flip,
   ...(s.id.startsWith('balloon:')?{text:String(s.text??'').slice(0,140)}:{})}));
 return {layers,
  adjust:{light:n(a.light,-1,1,0),contrast:n(a.contrast,-1,1,0),colour:n(a.colour,-1,1,0),warmth:n(a.warmth,-1,1,0),pattern:n(a.pattern,-1,1,0),detail:n(a.detail,-1,1,0)},
  stamp:!!recipe.stamp,stickers,
  // The print's border (frames.js) and the trick lens.
  frame:typeof recipe.frame==='string'&&/^[a-z]{1,20}$/.test(recipe.frame)?recipe.frame:'none',
  trick:TRICKS.includes(recipe.trick)?recipe.trick:'none'};
}

/** The size a save of a w×h crop may have: as it is, or scaled down to the limits. */
export function exportSize(w,h,limit=MAX_SIDE){
 const s=Math.min(1,limit/Math.max(w,h),Math.sqrt(MAX_PIXELS/(w*h)));
 return {width:Math.max(1,Math.round(w*s)),height:Math.max(1,Math.round(h*s))};
}

const VERTEX=`#version 300 es
in vec2 aPos;out vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;

// Crop, mirror and the adjustments, from a source whose first row is the top of the picture.
const PREPARE=`#version 300 es
precision highp float;
in vec2 vUv;out vec4 fragColor;
uniform sampler2D tSource;
uniform vec4 uCrop;
uniform float uMirror,uSmooth,uAuto,uBias,uTrick,uLight,uContrast,uColour,uWarmth;
uniform vec2 uStep;
uniform float uMeanLod;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 at(vec2 p){
 if(uTrick>.5)p.x=.5-abs(p.x-.5);
 if(uTrick>1.5)p.y=.5+abs(p.y-.5);
 vec2 q=vec2(p.x,1.0-p.y);if(uMirror>.5)q.x=1.0-q.x;
 return texture(tSource,uCrop.xy+q*uCrop.zw,uBias).rgb;
}
void main(){
 vec3 c=at(vUv);
 if(uSmooth>0.0){
  // Edge-keeping smoothing on two rings: neighbours much unlike the centre count for little.
  vec3 sum=c;float total=1.0;
  for(int r=1;r<=2;r++)for(int k=0;k<8;k++){
   float a=float(k)*.785398+float(r)*.3927;vec3 n=at(vUv+vec2(cos(a),sin(a))*uStep*float(r));
   vec3 d=n-c;float w=exp(-dot(d,d)*90.0)*(r==1?1.0:.6);sum+=n*w;total+=w;
  }
  c=mix(c,sum/total,uSmooth);
 }
 if(uAuto>0.0){
  // The average of the part of the picture that is kept (the crop, so the viewfinder and the save agree), from nine
  // samples of a mipmap about a third of it across.
  float mean=0.0;
  for(int j=0;j<3;j++)for(int i=0;i<3;i++)mean+=luma(textureLod(tSource,uCrop.xy+(vec2(i,j)+.5)/3.0*uCrop.zw,uMeanLod).rgb);
  mean=clamp(mean/9.0,.02,.98);
  c=pow(max(c,vec3(0.0)),vec3(mix(1.0,clamp(log(.56)/log(mean),.45,2.2),uAuto)));
 }
 c=pow(max(c,vec3(0.0)),vec3(exp2(-uLight*.85)));
 c=(c-.5)*(1.0+uContrast*.6)+.5;
 c=mix(vec3(luma(c)),c,1.0+uColour);
 c*=vec3(1.0+uWarmth*.09,1.0+uWarmth*.015,1.0-uWarmth*.1);
 fragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;

const COPY=`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;uniform sampler2D tDiffuse;
void main(){fragColor=vec4(texture(tDiffuse,vUv).rgb,1.0);}`;

/**
 * The engine on one canvas. `light` asks for the versions of the heavy Looks a phone or tablet can afford in the
 * viewfinder; a save always uses the full ones.
 */
export function createLookEngine(canvas,{light=false}={}){
 const gl=canvas.getContext('webgl2',{antialias:false,alpha:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
 if(!gl)throw new Error('WebGL2 is not available');
 const parallel=gl.getExtension('KHR_parallel_shader_compile');
 const maxTexture=gl.getParameter(gl.MAX_TEXTURE_SIZE);
 const triangle=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,triangle);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const programs=new Map(),sources=new Map(),targets=new Map();

 function shader(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);return s;}
 function build(key,fragment){
  const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,VERTEX),f=shader(gl.FRAGMENT_SHADER,fragment);
  gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aPos');gl.linkProgram(p);
  const entry={program:p,vertex:v,fragment:f,uniforms:null,failed:false};programs.set(key,entry);return entry;
 }
 function finish(entry,key){
  if(entry.uniforms||entry.failed)return entry;
  // A lost context answers nothing; that is not the shader's fault, so nothing is marked as failed.
  if(gl.isContextLost())return entry;
  if(!gl.getProgramParameter(entry.program,gl.LINK_STATUS)){
   entry.failed=true;console.error(`Pocket Camera: ${key} did not compile`,gl.getShaderInfoLog(entry.fragment)||gl.getProgramInfoLog(entry.program));return entry;
  }
  const u={},count=gl.getProgramParameter(entry.program,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<count;i++){const name=gl.getActiveUniform(entry.program,i).name;u[name]=gl.getUniformLocation(entry.program,name);}
  entry.uniforms=u;return entry;
 }
 // Only the Looks with a lighter build (#ifdef or #ifndef LIGHT: Oil, Heavy brush, Crayon, Stamp) have two programs on a
 // phone.
 const lighter=new Map(),hasLight=name=>{if(!lighter.has(name))lighter.set(name,/#ifn?def LIGHT/.test(photoFragment(name)||''));return lighter.get(name);};
 const lookKey=(name,full)=>name+(full||!light||!hasLight(name)?':full':':light');
 /** Starts compiling a Look without waiting for it (thumbnails ask for every Look at once). */
 function request(name,full=false){
  const key=lookKey(name,full);
  return programs.get(key)||build(key,photoFragment(name,{light:key.endsWith(':light')}));
 }
 const ready=entry=>entry.uniforms||entry.failed||!parallel||gl.getProgramParameter(entry.program,parallel.COMPLETION_STATUS_KHR);
 /** The compiled program for a Look, compiling it now if need be; null if it failed. */
 function look(name,full=false){
  if(gl.isContextLost())return undefined;
  const key=lookKey(name,full),e=finish(request(name,full),key);
  // A full build that will not compile on this device falls back to the light one.
  if(e.failed&&full&&key!==lookKey(name,false))return look(name,false);
  return e.failed?null:e;
 }
 const fixed=(key,text)=>{const e=finish(programs.get(key)||build(key,text),key);return e.failed||!e.uniforms?null:e;};

 function texture(w,h){
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(w)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  return t;
 }
 /** Two textures to ping-pong between, at one size, kept under a name. */
 function pair(name,w,h){
  let p=targets.get(name);
  if(p&&(p.w!==w||p.h!==h)){release(name);p=null;}
  if(!p){
   p={w,h,items:[0,1].map(()=>{const t=texture(w,h),f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f};})};
   targets.set(name,p);
  }
  return p;
 }
 function release(name){const p=targets.get(name);if(!p)return;for(const i of p.items){gl.deleteTexture(i.t);gl.deleteFramebuffer(i.f);}targets.delete(name);}

 /** Uploads a picture (an image, a canvas, a bitmap or a playing video) under a name, with its mipmaps. */
 function setSource(name,element,width,height){
  let s=sources.get(name);
  if(!s){s={t:texture()};sources.set(name,s);}
  gl.bindTexture(gl.TEXTURE_2D,s.t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,element);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  s.width=width;s.height=height;
 }
 function dropSource(name){const s=sources.get(name);if(s){gl.deleteTexture(s.t);sources.delete(name);}}

 // One full-screen pass, into a framebuffer (or the canvas) over a viewport, in tiles when asked so that a large
 // save never hands the GPU one draw long enough for the system to reset it.
 function pass(entry,input,output,[x,y,w,h],set,tile=0){
  gl.useProgram(entry.program);
  gl.bindFramebuffer(gl.FRAMEBUFFER,output);
  gl.viewport(x,y,w,h);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,input);
  const u=entry.uniforms;
  if(u.tDiffuse)gl.uniform1i(u.tDiffuse,0);
  if(u.tSource)gl.uniform1i(u.tSource,0);
  set?.(u);
  gl.bindBuffer(gl.ARRAY_BUFFER,triangle);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  if(!tile){gl.drawArrays(gl.TRIANGLES,0,3);return;}
  gl.enable(gl.SCISSOR_TEST);
  for(let ty=0;ty<h;ty+=tile)for(let tx=0;tx<w;tx+=tile){gl.scissor(x+tx,y+ty,Math.min(tile,w-tx),Math.min(tile,h-ty));gl.drawArrays(gl.TRIANGLES,0,3);gl.flush();}
  gl.disable(gl.SCISSOR_TEST);
 }

 const f1=(l,v)=>{if(l)gl.uniform1f(l,v);};
 function prepare(recipe,source,crop,mirror,w,h,smooth,auto){
  const a=recipe.adjust,s=sources.get(source);
  const meanLod=Math.max(0,Math.log2(Math.max(crop.w*s.width,crop.h*s.height)/3));
  // A Look that draws lines finds them in the detail of a picture about as tall as its patterns are sized for (the
  // viewfinder's): a larger save reads its source that much softer, so its lines are the viewfinder's lines, not the
  // floor's grain as well. Patterns, outlines and dots are still drawn at the save's full size.
  // Detail: less (-1) smooths wider and reads softer still, for fewer, bolder lines; more (+1) smooths nothing.
  const d=a.detail||0,bias=smooth?Math.max(0,Math.log2(h/(1080*2**-a.pattern))*(1-Math.max(0,d))+Math.max(0,-d)*1.3):0;
  const smoothing=smooth?Math.min(1,1-d):0,reach=2**-d;
  return u=>{
   f1(u.uBias,bias);f1(u.uMeanLod,meanLod);
   gl.uniform4f(u.uCrop,crop.x,crop.y,crop.w,crop.h);f1(u.uMirror,mirror?1:0);f1(u.uSmooth,smoothing);f1(u.uAuto,auto?1:0);
   f1(u.uTrick,TRICKS.indexOf(recipe.trick||'none'));
   // Smoothing reaches about a thousandth of the picture's height, whatever its size.
   if(u.uStep)gl.uniform2f(u.uStep,reach*h/(900*w),reach/900);
   f1(u.uLight,a.light);f1(u.uContrast,a.contrast);f1(u.uColour,a.colour);f1(u.uWarmth,a.warmth);
  };
 }
 const lookUniforms=(amount,w,h,pattern,floor=.5)=>u=>{
  f1(u.uAmount,amount);if(u.uTexel)gl.uniform2f(u.uTexel,1/w,1/h);if(u.uResolution)gl.uniform2f(u.uResolution,w,h);
  // Pattern: -1 finer, +1 coarser, a factor of two either way.
  f1(u.uLines,1080*2**-pattern);f1(u.uUnitFloor,floor);
  f1(u.uComic,1);f1(u.uSkyDepth,120);f1(u.uFocusDistance,6);f1(u.uFocusRange,3);f1(u.uNear,.05);f1(u.uFar,60);
 };

 /**
  * Runs a recipe from a source into `output` (a framebuffer, null for the canvas, or 'pair' to leave the result in the
  * target pair and get its framebuffer back). Returns false while a Look in it is still compiling (nothing is drawn
  * then), so a frame never shows half a recipe. `expose` exposes the picture as for an ink Look whatever the recipe.
  */
 function run(recipe,{source,crop={x:0,y:0,w:1,h:1},mirror=false,width,height,output=null,viewport,targetName='view',full=false,tile=0,layers=recipe.layers,expose=false}){
  if(!sources.has(source)||gl.isContextLost())return false;
  const active=layers.filter(l=>l.look!=='none'&&l.amount>0);
  const entries=active.map(l=>full?look(l.look,true):(ready(request(l.look))?look(l.look):undefined));
  if(entries.some(e=>e===undefined))return false;
  if(full&&entries.some(e=>!e))throw new Error(`${active[entries.indexOf(null)].look} cannot be drawn on this device`);
  const prep=fixed('prepare',PREPARE),src=sources.get(source).t,intoPair=output==='pair';
  if(!prep)return false;
  const steps=active.map((l,i)=>({layer:l,entry:entries[i]})).filter(s=>s.entry);
  const smooth=steps.some(s=>lookDrawsLines(s.layer.look)),auto=expose||steps.some(s=>INK_LOOKS.includes(s.layer.look));
  const vp=viewport||[0,0,width,height];
  if(!steps.length&&!intoPair){pass(prep,src,output,vp,prepare(recipe,source,crop,mirror,width,height,false,auto),tile);return true;}
  const p=pair(targetName,width,height);let read=0;
  pass(prep,src,p.items[0].f,[0,0,width,height],prepare(recipe,source,crop,mirror,width,height,smooth,auto),tile);
  steps.forEach(({layer,entry},i)=>{
   const last=i===steps.length-1&&!intoPair;
   pass(entry,p.items[read].t,last?output:p.items[1-read].f,last?vp:[0,0,width,height],lookUniforms(layer.amount,width,height,recipe.adjust.pattern),tile);
   read=1-read;
  });
  return intoPair?p.items[read].f:true;
 }

 return {
  gl,maxTexture,
  setSource,dropSource,hasSource:name=>sources.has(name),
  sourceSize:name=>{const s=sources.get(name);return s?{width:s.width,height:s.height}:null;},
  /** Starts compiling Looks in the background. */
  warm(names){if(parallel)for(const n of names)if(n!=='none')request(n);},
  isReady:name=>name==='none'||ready(request(name)),
  /** Draws a recipe on the canvas at the canvas's own size. */
  draw(recipe,options){
   // The full builds a save will use start compiling now, not when the shutter is pressed.
   if(light)for(const l of recipe.layers)if(l.look!=='none'&&hasLight(l.look))request(l.look,true);
   return run(recipe,{...options,width:canvas.width,height:canvas.height,output:null});
  },
  /**
   * Draws one small square per Look into an atlas and hands back its pixels (rows top first): each Look as the
   * chosen layer would be, over the layers before it. Looks still compiling are left out (`missing`).
   */
  thumbnails(recipe,{source,crop,mirror,size,names,layer=0}){
   if(!sources.has(source)||gl.isContextLost())return null;
   const n=names.length,w=size*n,h=size,atlas=pair('atlas',w,h),missing=[];
   gl.bindFramebuffer(gl.FRAMEBUFFER,atlas.items[0].f);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
   const before={...recipe,layers:recipe.layers.slice(0,layer)};
   // Two pictures to draw the tiles over: as the layers before leave it, and exposed for an ink Look, as choosing one
   // would expose it.
   const base=pair('thumb-base',size,size);
   if(!run(before,{source,crop,mirror,width:size,height:size,output:base.items[0].f,targetName:'thumb'}))return null;
   if(!run(before,{source,crop,mirror,width:size,height:size,output:base.items[1].f,targetName:'thumb',expose:true}))return null;
   // Without background compiling, a few new Looks are compiled per call, so the strip fills in without a long stall.
   let budget=parallel?Infinity:3;
   names.forEach((name,i)=>{
    if(name==='none'){const copy=fixed('copy',COPY);if(copy)pass(copy,base.items[0].t,atlas.items[0].f,[i*size,0,size,size]);return;}
    const e=programs.get(lookKey(name,false));
    if(!e&&budget<=0){missing.push(name);return;}
    if(!e)budget--;
    if(!ready(request(name))){missing.push(name);return;}
    const entry=look(name);if(!entry){missing.push(name);return;}
    pass(entry,base.items[INK_LOOKS.includes(name)?1:0].t,atlas.items[0].f,[i*size,0,size,size],lookUniforms(1,size,size,recipe.adjust.pattern,.35));
   });
   const pixels=new Uint8Array(w*h*4);
   gl.bindFramebuffer(gl.FRAMEBUFFER,atlas.items[0].f);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   return {width:w,height:h,data:flipRows(pixels,w,h),missing};
  },
  /** The recipe at full quality and full size, as pixels (rows top first). */
  render(recipe,{source,crop,mirror,width,height}){
   if(gl.isContextLost())throw new Error('The graphics were lost');
   try{
    const result=run(recipe,{source,crop,mirror,width,height,output:'pair',targetName:'export',full:true,tile:1024});
    if(!result)throw new Error('The picture could not be drawn');
    const pixels=new Uint8Array(width*height*4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,result);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    // A context lost while drawing reads back nothing: never hand that on as a black photo.
    if(gl.isContextLost())throw new Error('The graphics were lost');
    return {width,height,data:flipRows(pixels,width,height)};
   }finally{release('export');}
  },
  failed:name=>!!programs.get(lookKey(name,false))?.failed,
  lost:()=>gl.isContextLost(),
 };
}

/** WebGL reads rows bottom first; pictures want them top first. Turned over in place: a save is too big to copy. */
export function flipRows(pixels,w,h){
 const row=w*4,spare=new Uint8Array(row);
 for(let top=0,bottom=h-1;top<bottom;top++,bottom--){
  const a=pixels.subarray(top*row,(top+1)*row),b=pixels.subarray(bottom*row,(bottom+1)*row);
  spare.set(a);a.set(b);b.set(spare);
 }
 return new Uint8ClampedArray(pixels.buffer,pixels.byteOffset,pixels.length);
}

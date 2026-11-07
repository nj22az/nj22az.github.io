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
import {normalCrop} from './crop.js?v=20261030crop1';

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
 // Risograph in the duplicator's own inks (the owner, 30 October 2026: "I do love Risograph can there be several
 // variations on Risograph?"). World's Risograph keeps its coral and teal.
 risoPinkBlue:Object.freeze({label:'Riso pink & blue',short:'Pink & blue',hint:'Fluorescent pink and blue on two drums, overprinting to violet in the darks.'}),
 risoRedNavy:Object.freeze({label:'Riso red & navy',short:'Red & navy',hint:'Bright red and federal blue, a poster printed on two drums.'}),
 risoBlackPink:Object.freeze({label:'Riso black & pink',short:'Black & pink',hint:'Black and fluorescent pink: a zine on two drums.'}),
 risoThree:Object.freeze({label:'Riso three-colour',short:'3-colour',hint:'Yellow, fluorescent pink and blue on three drums: the whole picture in Riso inks.'}),
 sixtyFourBit:Object.freeze({label:'64-bit',short:'64-bit',hint:'The cartridge console of 1996: small textures filtered smooth, soft haze and a fine dither.'}),
});
/** The World Look whose little house stands in for a camera-only Look until its live thumbnail is drawn. */
export const LOOK_STANDIN=Object.freeze({adventureInk:'flat',instant:'sepia',camcorder:'crt',halftone:'riso',cyanotype:'mono',nightVision:'pocket',
 colourHandheld:'snes',redVisor:'riso',risoPinkBlue:'riso',risoRedNavy:'riso',risoBlackPink:'riso',risoThree:'riso',eightBit:'snes',thirtyTwoBit:'snes',sixtyFourBit:'tilt'});


// An instant print: a gentle S curve, then a matte fade (blacks lifted, whites softened), cool shadows and warm
// highlights, a leak of orange light from the top right corner, soft corners and a fine grain.
const INSTANT_BODY=`
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 // Instant film has no grain, and its lens is sharp in the middle and soft towards the edges; its dyes a gentle mottle.
 float edgeSoft=smoothstep(.2,.6,length(vUv-.5));
 vec3 c=texture2D(tDiffuse,vUv).rgb*.4;
 for(int i=0;i<6;i++){float a=float(i)*1.0472;c+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*uTexel*mix(.6,1.8,edgeSoft)*u).rgb*.1;}
 float l=luma(c);
 c=mix(vec3(l),c,.8);
 c=mix(c,c*c*(3.0-2.0*c),.4);
 // The matte fade: blacks lifted to a teal-black, whites softened to cream; warm highlights, cool shadows.
 c=mix(vec3(.13,.13,.1),vec3(.97,.92,.8),c);
 c+=vec3(.05,.02,-.04)*smoothstep(.45,1.0,l)+vec3(-.03,.01,.02)*(1.0-smoothstep(0.0,.4,l));
 c*=1.0+(noise(p*.012)-.5)*.06;
 // The developer spreads from the pod at the bottom edge and thins out: the picture there develops unevenly, a warm
 // pale band with a ragged top, and the very edges a little lighter. No light leaks: the film is sealed.
 float edge=min(min(vUv.x,1.0-vUv.x),1.0-vUv.y);
 float bottom=vUv.y+(noise(vec2(p.x*.02,3.0))-.5)*.035;
 c=mix(c,vec3(.95,.85,.68),(1.0-smoothstep(.0,.06,bottom))*.55);
 c=mix(c,vec3(.93,.9,.84),(1.0-smoothstep(.0,.025,edge))*.35);
 vec2 v=vUv-.5;
 c*=1.0-dot(v,v)*.5;
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
 // Each line a hair off its neighbours; at the foot, the head switch pulls the picture sideways in one hook.
 float foot=1.0-smoothstep(0.0,.035,vUv.y);
 float jitter=(hash(vec2(row,7.0))-.5)*2.0*u*uTexel.x+foot*foot*.03;
 vec2 p=vec2(vUv.x+jitter,vUv.y);
 float y=0.0;vec2 iq=vec2(0.0);
 // The tape's narrow bandwidth: the picture soft along each line (about 240 lines' worth of detail across).
 for(int i=-2;i<=2;i++){y+=toYiq(texture2D(tDiffuse,p+vec2(float(i)*3.2*u*uTexel.x,0.0)).rgb).x*(i==0?.28:i==1||i==-1?.2:.16);}
 // Tape colour arrives late and smeared wide: what is seen here was recorded to the left, so colour trails right.
 for(int i=0;i<8;i++){iq+=toYiq(texture2D(tDiffuse,p-vec2((float(i)+1.0)*7.0*u*uTexel.x,0.0)).rgb).yz;}
 vec3 c=fromYiq(vec3(y*.96+.03,iq/8.0*1.45));
 // Dropouts: rare short white streaks along a line, where the tape lost its oxide.
 c+=step(.9993,hash(vec2(floor(vUv.x*uResolution.x/(40.0*u)),row)))*.55*smoothstep(0.0,.3,fract(vUv.x*uResolution.x/(40.0*u)));
 c*=.9+.1*step(.5,fract(vUv.y*uResolution.y/(3.0*u)));
 // The head-switch band: the bottom lines torn, brighter and noisy.
 c=mix(c,vec3(luma(c))*1.15+(hash(vec2(floor(vUv.x*uResolution.x/(3.0*u)),row))-.5)*.25,foot*.6);
 c=mix(c,vec3(luma(c)),.06);
 c=c*vec3(1.06,1.0,.94)*1.04-.02;
 gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
// A cyanotype: the light of the picture printed from Prussian blue to paper white, with the paper's grain and its
// brushed-on edges a little darker.
const CYANOTYPE_BODY=`
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float l=pow(smoothstep(.04,.96,luma(texture2D(tDiffuse,vUv).rgb)),.85);
 // The sensitiser brushed on by hand: its edge ragged with the brush's strokes, a margin of bare paper outside it, and
 // the coat uneven inside it, thicker in streaks along the brush.
 // The brush ran along each edge: its marks lengthwise there (down the sides, across the top and bottom).
 vec2 eb=min(vUv,1.0-vUv)*vec2(uResolution.x/uResolution.y,1.0);
 vec2 along=eb.x<eb.y?vec2(p.y,p.x):p;
 float brush=noise(vec2(along.x*.004,along.y*.06))*.6+noise(vec2(along.x*.02,along.y*.2))*.4;
 vec2 e=min(vUv,1.0-vUv)*vec2(uResolution.x/uResolution.y,1.0);
 float coat=smoothstep(.0,.025,min(e.x,e.y)-.018-.022*brush);
 vec3 deep=vec3(.03,.16,.36),mid=vec3(.13,.39,.62),paper=vec3(.95,.95,.92);
 vec3 col=l<.5?mix(deep,mid,l*2.0):mix(mid,paper,(l-.5)*2.0);
 col=mix(col,col*.93,(brush-.5)*.6);
 // The paper's fibre in the blue, and the bare paper warm and clear where it was washed out.
 float fibre=noise(p*.8)*.5+noise(vec2(p.x*2.2,p.y*.4))*.5;
 col*=1.0+(fibre-.5)*.06;
 col=mix(vec3(.96,.95,.91)+(fibre-.5)*.03,col,coat);
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Night vision: the picture's light amplified into green phosphor, the bright parts glowing out a little, grain and
// faint lines, seen through the round end of an image tube.
// Shared by the camera's photo versions of World's drawn Looks: pencil strokes laid by tone, and a line finder.
const PHOTO_STROKES=`
// How finished the drawing is here: full in the middle, lighter towards the picture's edges; a dark part is drawn in full
// wherever it is (a night sky, a black coat at the edge).
float finished(vec2 uv,float least,float l){
 return mix(mix(least,1.0,1.0-smoothstep(.5,1.1,length((uv-.5)*2.0))),1.0,1.0-smoothstep(.12,.36,l));
}
// One layer of pencil strokes along dir: a value per pixel, 1 on a stroke's middle line, falling to 0 at its sides,
// so a tone is drawn by keeping what is above (1 - cover). Each stroke is straight, as a hand draws one: its own length,
// start and pressure, set a little off its lane and leaning a little, tapering at both ends.
float pencilLane(vec2 p,vec2 dir,float spacing,float seed){
 float along=dot(p,dir),across=dot(p,vec2(-dir.y,dir.x));
 // The lanes bow together a little, as a hand's strokes do across a page.
 across+=(noise(vec2(along*.018,across*.003+seed))-.5)*spacing*1.3;
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
// The direction of the picture's edges here (doubled, so a line and its reverse agree), weighted by how clear it is.
vec2 pencilFlow(vec2 uv,float r){
 vec2 t=uTexel*r;
 float gx=luma(texture2D(tDiffuse,uv+vec2(t.x,0.0)).rgb)-luma(texture2D(tDiffuse,uv-vec2(t.x,0.0)).rgb);
 float gy=luma(texture2D(tDiffuse,uv+vec2(0.0,t.y)).rgb)-luma(texture2D(tDiffuse,uv-vec2(0.0,t.y)).rgb);
 return vec2(gy*gy-gx*gx,-2.0*gx*gy);
}
// The direction a hand would lay strokes here: along the picture's clear edges (a cheek, an arm, a braid), on the
// natural diagonal where it has none.
float flowAngle(vec2 uv,float u){
 vec2 flow=pencilFlow(uv,4.0*u);
#ifndef LIGHT
 flow+=pencilFlow(uv,11.0*u)*1.6;
#endif
 vec2 d=mix(vec2(-.5,.866),normalize(flow+1e-6),smoothstep(.006,.03,length(flow))*.75);
 return .5*atan(d.y,d.x);
}
// A hatch in exactly the direction a (radians), as much of it as cover asks for.
float pencilHatch(vec2 p,float a,float spacing,float cover,float seed){
 float edge=1.0-cover;
 return smoothstep(edge-.16,edge+.16,pencilLane(p,vec2(cos(a),sin(a)),spacing,seed))*step(.003,cover);
}
// Strokes in the direction a (radians), drawn from the four directions 45 degrees apart either side of it, so the
// pattern holds together however the direction turns across the picture.
float pencilLayer(vec2 p,float a,float spacing,float cover,float seed){
 float b=mod(a,3.14159265)/.78539816,i=mod(floor(b),4.0),j=mod(i+1.0,4.0),t=smoothstep(.4,.6,fract(b));
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
// A line at uv: the point itself is seen a little soft (a gap between teeth, a pore or a grain of granite is narrower than
// a pen line and is not drawn), against the rings round it at radius r.
float lineAt(vec2 uv,float u,float r,float threshold,float soft){
 float c=luma(texture2D(tDiffuse,uv).rgb)*.3+ringLuma(uv,1.7*u)*.7;
 // Teeth are one white shape: a light, thin mark inside a bright area is not drawn (an eye or a lip line is darker).
 float bright=smoothstep(.46,.64,ringLuma(uv,4.0*u))*smoothstep(.24,.38,c);
 return inkLine(c,around(uv,u,r),threshold,soft)*(1.0-.85*bright);
}
// A contour where colours meet strongly, on both sides, so a silhouette is kept where the tone of one side takes over
// (a neckline against a black top, a pale cheek against a pale wall).
float contour(vec2 uv,float u){return smoothstep(.45,.85,edges(uv,1.2*u,1.0));}
// The drawing of a face as an inker draws it: the lines and contours, except inside a row of teeth. Where the brightest
// thing a few pixels round is white with little colour (a tooth) and the mark itself is not truly dark (the shaded gap
// between two teeth, not the dark of the mouth or a lash), nothing is drawn, so the teeth are one white shape.
float inked(vec2 uv,float u,float r,float threshold,float soft,float contourAmount){
 float line=max(lineAt(uv,u,r,threshold,soft),contour(uv,u)*contourAmount);
#ifndef LIGHT
 // A pen draws strokes, not specks: a mark is kept only where the drawing carries on a few pixels along its own direction
 // (one side is enough, so a line's end stays). A dash shorter than about twelve pixels, a pore, a grain of granite or a
 // fleck of foliage is left out. The phone's viewfinder skips it; a save draws it.
 vec2 t=uTexel*1.5*u;
 float gx=luma(texture2D(tDiffuse,uv+vec2(t.x,0.0)).rgb)-luma(texture2D(tDiffuse,uv-vec2(t.x,0.0)).rgb);
 float gy=luma(texture2D(tDiffuse,uv+vec2(0.0,t.y)).rgb)-luma(texture2D(tDiffuse,uv-vec2(0.0,t.y)).rgb);
 vec2 along=normalize(vec2(-gy,gx)+vec2(1e-5,0.0))*uTexel*6.0*u;
 float on=max(max(lineAt(uv+along,u,r,threshold,soft),contour(uv+along,u)*contourAmount),
  max(lineAt(uv-along,u,r,threshold,soft),contour(uv-along,u)*contourAmount));
 line*=smoothstep(.15,.45,on);
#endif
 vec3 brightest=vec3(0.0);
 for(int k=0;k<8;k++){float a=float(k)*.785398;vec3 c=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*3.0*u).rgb;if(luma(c)>luma(brightest))brightest=c;}
 // A tooth is judged against its surroundings (warm light tints teeth too, and an exposed picture lightens skin): far
 // less coloured than the skin and lips round it, and lighter than them.
 vec3 round=ringColour(uv,8.0*u);
 float chroma=(max(brightest.r,max(brightest.g,brightest.b))-min(brightest.r,min(brightest.g,brightest.b)))/max(luma(brightest),.05);
 float roundChroma=(max(round.r,max(round.g,round.b))-min(round.r,min(round.g,round.b)))/max(luma(round),.05);
 float tooth=smoothstep(.34,.5,luma(brightest))*(1.0-smoothstep(.62,.9,chroma/max(roundChroma,.05)))
  *smoothstep(.0,.06,luma(brightest)-luma(round));
 float here=luma(texture2D(tDiffuse,uv).rgb);
 // A mark that is itself light is no line at all, however it differs from its surroundings: the shaded gap between two
 // teeth in dim light, a pale fold of skin. A lip line, an eye or a lash is dark.
 float darkest=here;
 for(int k=0;k<4;k++){float a=float(k)*1.5708+.785;darkest=min(darkest,luma(texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*1.5*u).rgb));}
 float light=smoothstep(.44,.56,darkest)*smoothstep(.5,.64,luma(brightest));
 return line*(1.0-.9*tooth*smoothstep(.14,.24,here))*(1.0-.85*light);
}
`;
// Cel colour for a photograph, as an anime colour designer sets a character: each material one flat base colour and
// one hard shadow (a cooler, darker version of the same colour), the boundary anti-aliased, the photo's texture gone.
// The base is the colour round a point among pixels like it (an edge-keeping average on two rings); the material's
// own lightness, wider still, decides what is lit and what is in shadow.
const PHOTO_CEL=`
vec3 celSmooth(vec2 uv,float r,vec3 c0,float k){
 vec3 s=c0;float w=1.0;
 for(int i=0;i<8;i++){float a=float(i)*.785398+.2;vec3 c=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*r).rgb;vec3 d=c-c0;float e=exp(-dot(d,d)*k);s+=c*e;w+=e;}
 return s/w;
}
vec3 celBase(vec2 uv,float u,out float material){
 vec3 c=texture2D(tDiffuse,uv).rgb;
 // A colourist paints the cheek, not its pores and wrinkles: a point darker than the ring round it is a thin dark mark
 // (narrower than the ring) and takes the ring's colour; a large dark area, whose ring is dark too, keeps its own. The
 // ink line draws the marks that matter.
 vec3 ring=ringColour(uv,2.5*u);
 c=mix(c,ring,smoothstep(.03,.1,luma(ring)-luma(c)));
 vec3 b=celSmooth(uv,2.5*u,c,40.0);
#ifndef LIGHT
 b=celSmooth(uv,6.0*u,b,30.0);
#endif
 vec3 m=celSmooth(uv,13.0*u,b,14.0);
#ifndef LIGHT
 m=celSmooth(uv,26.0*u,m,10.0);
#endif
 material=luma(m);
 return b;
}
`;
// Wax crayon for photographs: broad, overlapping strokes retain the colour mass. Pigment catches the tooth,
// fills it as pressure builds, and burnishes in dark passages. Paper stock is a separate optional finishing pass.
const CRAYON_BODY=`${PHOTO_STROKES}
vec3 waxColour(vec2 uv,float u){
 vec3 centre=texture2D(tDiffuse,uv).rgb,sum=centre*2.0;float total=2.0;
 // Keep edges while grouping photographic pores and grain into coloured strokes.
 for(int i=0;i<8;i++){
  float a=float(i)*.785398+.2;
  vec3 c=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*u*4.5).rgb;
  vec3 delta=c-centre;float w=exp(-dot(delta,delta)*24.0);sum+=c*w;total+=w;
#ifndef LIGHT
  vec3 wide=texture2D(tDiffuse,uv+vec2(cos(a),sin(a))*uTexel*u*10.0).rgb;
  delta=wide-centre;w=exp(-dot(delta,delta)*36.0)*.5;sum+=wide*w;total+=w;
#endif
 }
 return sum/total;
}
void main(){
 float u=unit();vec2 p=vUv*uResolution/u;
 vec3 under=waxColour(vUv,u);
 // Colour is already in the underdrawing: a pale peach or blue must not vanish into unmarked paper.
 float a=flowAngle(vUv,u);vec2 d=vec2(cos(a),sin(a)),n=vec2(-d.y,d.x);
 vec2 r=vec2(dot(p,d),dot(p,n));
 r.y+=(noise(p*.012)-.5)*7.0;
 float lane=floor(r.y/13.0),travel=r.x+hash(vec2(lane,8.0))*48.0;
 vec2 cell=floor(vec2(travel/48.0,r.y/13.0)),f=fract(vec2(travel/48.0,r.y/13.0));
 vec2 shift=(.5-f.x)*48.0*d+(.5-f.y)*13.0*n;
 vec3 laid=texture2D(tDiffuse,vUv+shift*uTexel*u*.65).rgb;
 float edge=length(laid-under);
 float strokeBody=smoothstep(.0,.2,f.x)*(1.0-smoothstep(.75,1.0,f.x))*smoothstep(.0,.2,f.y)*(1.0-smoothstep(.75,1.0,f.y));
 vec3 c=mix(under,laid,strokeBody*(.45-.35*smoothstep(.08,.30,edge)));
 // A small set of wax mixtures, blended by pressure rather than a continuous photographic gradient.
 c=mix(c,floor(c*12.0+.5)/12.0,.28);
 float l=luma(c);c=clamp(mix(vec3(l),c,1.10*smoothstep(.035,.17,l))*.99+.008,0.0,1.0);
 // Broad side-of-crayon marks with rounded, overlapping ends, not crossed pencil lanes.
 float end=smoothstep(.0,.14,f.x)*(1.0-smoothstep(.80,1.0,f.x));
 float side=smoothstep(.0,.12,f.y)*(1.0-smoothstep(.85,1.0,f.y));
 float pressure=mix(.55,1.0,hash(cell+vec2(4.0,19.0)))*mix(.72,1.0,end*side);
 float tooth=noise(p*1.45)*.55+noise(p*.63+7.0)*.45;
 float striae=noise(vec2(r.x*.12,r.y*1.6)+13.0);
 float shadow=1.0-smoothstep(.12,.55,l);
 // Successive wax layers leave little paper in the lights and almost none in a burnished dark.
 float deposit=.78+.20*pressure+.16*(tooth-.5)+.10*(striae-.5);
 deposit=mix(deposit,.974+.025*(tooth-.5),shadow*.85);
 vec3 paper=vec3(.988,.982,.968);
 vec3 col=mix(paper,c,clamp(deposit,0.0,1.0));
 // A shallow wax ridge changes pressure, not the drawing's hue or its outline.
 col*=1.0+(pressure-.72)*.075+(striae-.5)*.045;
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// The rubber stamp for a photograph. World's Stamp inks everything darker than one grey; on a photo a dark wall or
// background then became one block that swallowed the hair and the shoulder against it, a shaded cheek a blot, and the
// ink was a fine speckle everywhere, sandpaper rather than rubber. Here each tone is judged against what is round it
// (a light shape keeps its edge against a dark one, a soft shadow on a face is not darkened), and the ink is laid as a
// stamp lays it: pressed harder on one side of the print than the other, pooled darker at the cut edges, and missing in
// clumps where the rubber did not meet the paper, with the paper's own fibre under it.
const STAMP_BODY=`${PHOTO_LINES}
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
 float ring=near/8.0;
#else
 float ring=near/16.0+wide/16.0;
#endif
 // Lifted where lighter than its surroundings (a shoulder against a dark wall stays paper), darkened only a little
 // where darker (a soft shadow on a cheek does not become a blot).
 float tone=l+1.25*max(0.0,l-ring)-.3*max(0.0,ring-l);
 tone+=(noise(p*.55)-.5)*.025;
 // The pressure across the print: heavier on one side, and in broad patches.
 float press=clamp(.5+.8*dot(vUv-.5,vec2(.8,-.6))+.5*(noise(p*.004)-.5)+.25*(noise(p*.012+7.0)-.5),0.0,1.0);
 float cut=.32+.03*(press-.5);
 float w=max(fwidth(tone)*.8,.006);
 float fill=1.0-smoothstep(cut-w,cut+w,tone);
 // Ink gathers at the cut edges. Where the pressure was light it thins in a mottle and misses the paper in ragged
 // patches, never at an edge; under it, the paper's fibre.
 float rim=fill*(1.0-smoothstep(.0,.07,cut-tone));
 float mottle=noise(p*.03)*.6+noise(p*.075)*.4;
 float fibre=noise(p*1.6)*.5+noise(p*.7)*.5;
 // Where the block met the paper lightly the ink is starved: it catches only on the paper's raised fibres.
 float starved=smoothstep(.22,.5,noise(p*.18)*.6+noise(p*.07)*.4);
 float deposit=fill*(.84+.06*fibre+.1*mix(mottle,1.0,press))*mix(1.0,starved,(1.0-smoothstep(.0,.45,press))*.75*(1.0-rim))+rim*.14;
 // Carved lines and the small dark marks of a face, which the carver keeps.
 // The carved lines: the drawing the carver keeps, faces included (no blots where a mouth's corner is dark).
 float line=max(lineAt(vUv,u,2.0,.02,.05),contour(vUv,u))*(.85+.15*fibre);
 deposit=max(deposit,line*mix(.7,.95,press));
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
 // The outline first, heavier on a strong edge, its pressure changing along it; only edges wider than a hair.
 float line=inked(vUv,u,2.0,.016,.05,1.0)*(.75+.25*noise(p*.35));
 // Shading in the shadows only, the light left as paper: long strokes along the form, crossed in the darks. (Ink Looks
 // see the picture exposed to a middle grey, so a black shirt arrives at about a quarter.)
 float f=finished(vUv,.35,l),a=flowAngle(vUv,u);
 // A pen, not a pencil: one direction of hatching, only in the shadows, crossed only in the deepest dark.
 float shade=pencilLayer(p,a,4.5,(1.0-smoothstep(.14,.34,l))*.85*f,3.0);
 shade=max(shade,pencilLayer(p,a+1.1,4.0,(1.0-smoothstep(.03,.12,l))*.85*f,8.0));
 float g=max(line,shade*.85);
 gl_FragColor=vec4(mix(paper,vec3(.06,.06,.08),clamp(g,0.0,1.0)),1.0);
}`;
// Pencil manga: crisp ink contours, the deepest blacks filled, broken graphite strokes in the deep shadows, white paper.
const PENCIL_MANGA_BODY=`${PHOTO_STROKES}${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float l=luma(texture2D(tDiffuse,vUv).rgb);
 float m=around(vUv,u,1.8);
 float line=inked(vUv,u,1.8,.016,.035,1.0)*(.82+.18*noise(p*.9));
 // The deepest values are the densest strokes, not a fill: three layers along the form, crossing, pressed harder the
 // darker it is, until they close up in the blacks with the paper's tooth still showing.
 float f=finished(vUv,.4,l),a=flowAngle(vUv,u),k=mix(l,m,.5);
 float shade=pencilLayer(p,a,4.6,(1.0-smoothstep(.2,.42,k))*.8*f,5.0);
 shade=max(shade,pencilLayer(p,a+1.1,4.0,(1.0-smoothstep(.12,.3,k))*.85*f,9.0));
 shade=max(shade,pencilLayer(p,a-.6,3.6,(1.0-smoothstep(.05,.2,k))*.95,13.0));
 float lead=.82+.12*noise(p*.8)-.1*noise(p*.07);
 // Graphite smudged into a soft tone under the strokes, as a mangaka's pencils are: the shadow a grey wash of lead with
 // the paper's tooth in it, the strokes darker over it; graphite grey, never printer's black.
 float tooth=noise(p*1.4)*.5+noise(p*.6)*.5;
 float smudge=(1.0-smoothstep(.12,.46,k))*.42*f*(.8+.2*tooth);
 float ink=max(max(line*.95,smudge),shade*mix(.7,.9,1.0-smoothstep(.05,.2,k))*lead);
 gl_FragColor=vec4(mix(vec3(.985,.98,.97),vec3(.29,.29,.3),clamp(ink,0.0,1.0)),1.0);
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
 float line=inked(vUv,u,1.8,.018,.035,1.0);
 // The tones are given to masses, not to the photo's grain: a surface is one tone.
#ifdef LIGHT
 float wide=ringLuma(vUv,5.0*u);
#else
 float wide=ringLuma(vUv,4.0*u)*.4+ringLuma(vUv,9.0*u)*.6;
#endif
 float t=clamp((mix(l,wide,.6)-.5)*1.2+.52,0.0,1.0),w=max(fwidth(t),.003);
 // Black clothing and dark hair are solid black, as an inker fills them; the screens are for the middle tones.
 float light=1.0-smoothstep(.66-w,.66+w,t),dark=1.0-smoothstep(.48-w,.48+w,t);
 float hatched=1.0-smoothstep(.37-w,.37+w,t),black=1.0-smoothstep(.29-w,.29+w,t);
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
 // A dark is a Payne's grey wash (indigo and black), however blue or violet the photo's dark was.
 wash=mix(wash,vec3(.3,.32,.38)*value/.6,(1.0-smoothstep(.12,.3,wl))*.7);
 // A darker rim where a layer dried, and the pigment settling in the paper's grain.
 float rim=(1.0-smoothstep(.0,.04,.50-loose))*a2+(1.0-smoothstep(.0,.04,.28-loose))*a3;
 float grain=1.0-(1.0-noise(p*.6)*noise(p*.23+5.0))*.08*a1;
 // The wash stops short of the page's edges in a ragged line, as a sketch on site leaves the margins as paper.
 vec2 e=min(vUv,1.0-vUv)*vec2(uResolution.x/uResolution.y,1.0);
 float page=smoothstep(.0,.025,min(e.x,e.y)-.02-.035*noise(p*.01+4.0));
 vec3 col=paper*mix(vec3(1.0),wash,a1*page)*grain*(1.0-.07*clamp(rim,0.0,1.0)*page);
 // Graphite does the drawing: lines broken along their length and porous, and the pencil shading the darks.
 float f=finished(vUv,.4,l),a=flowAngle(vUv,u);
 float line=lineAt(vUv,u,2.0,.016,.05)*mix(.45,1.0,smoothstep(.25,.5,noise(p*.06+3.0)))*(.7+.3*noise(p*.9));
 float shade=pencilLayer(p,a,4.2,(1.0-smoothstep(.1,.3,l))*.7*f,4.0);
 shade=max(shade,pencilLayer(p,a+1.1,3.8,(1.0-smoothstep(.04,.18,l))*.7*f,7.0));
 // Past the wash's edge the pencil trails off: a few lines, no shading.
 col=mix(col,vec3(.24,.22,.23),clamp(max(line*mix(.45,1.0,page),shade*.6*page),0.0,1.0)*.9);
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
  vec3 e=vec3(dot(rgb,vec3(.25,.5,.25)),rgb.r-rgb.b,rgb.g-(rgb.r+rgb.b)*.5)*vec3(1.2,1.6,1.6);
  float k=dot(e,e);if(k<d){d=k;best=inks[i];}
 }
 return best;
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 raw=texture2D(tDiffuse,vUv).rgb;
 vec3 c=raw*.2+ringColour(vUv,4.0*u)*.4+ringColour(vUv,9.0*u)*.4;
 float l=luma(c);
 vec3 col=printInk(clamp(mix(vec3(l),c,1.25),0.0,1.0));
 // Bokashi: an even sky (dark at night, pale by day) in the upper picture is printed as a graded band, deep at the top
 // and fading towards the horizon, as Hiroshige's skies and Hasui's night streets are.
 float even=1.0-smoothstep(.03,.1,abs(l-around(vUv,u,10.0)));
 // A pale sky is not warm: a lit forehead is never taken for one.
 float warm=smoothstep(.02,.08,c.r-c.b);
 float sky=smoothstep(.55,.85,vUv.y)*even*max(1.0-smoothstep(.12,.3,l),smoothstep(.74,.9,l)*(1.0-warm));
 float g=smoothstep(.45,1.0,vUv.y);
 vec3 bokashi=l<.5?mix(vec3(.2,.29,.44),vec3(.08,.13,.26),g):mix(vec3(.95,.91,.81),vec3(.36,.55,.72),g);
 col=mix(col,bokashi,sky);
 // Paper and wood grain show through the ink, stronger along the grain.
 float grain=noise(vec2(p.x*.04,p.y*.9))*.6+noise(p*.5)*.4;
 col*=.94+.08*grain;
 vec2 key=vUv+vec2(.9,-.65)*uTexel*u;
 float e=max(lineAt(key,u,2.0,.018,.05),contour(key,u)*.8);
 col=mix(col,vec3(.13,.11,.10),clamp(e,0.0,1.0));
 gl_FragColor=vec4(col,1.0);
}`;
// Pocket Gentleman for a photograph: four greens and big pixels. World's version turns any edge in a cell into the
// darkest green, and a photo has edges everywhere (every wrinkle and hair), so faces came out blotched. The hand-held
// camera sharpened its picture before it dithered it instead: here each cell is the average of its own pixels,
// sharpened against the cells round it, then dithered into the four greens.
const POCKET_BODY=`${PHOTO_LINES}
void main(){
 float px=max(2.0,floor(uResolution.y/112.0+.5));
 vec2 cell=floor(vUv*uResolution/px);
 vec2 centre=(cell+.5)*px/uResolution,q=uTexel*px*.25;
 float l=(luma(texture2D(tDiffuse,centre+q).rgb)+luma(texture2D(tDiffuse,centre-q).rgb)
  +luma(texture2D(tDiffuse,centre+vec2(q.x,-q.y)).rgb)+luma(texture2D(tDiffuse,centre+vec2(-q.x,q.y)).rgb))*.25;
 l=clamp(l+1.5*(l-ringLuma(centre,px*1.2)),0.0,1.0);
 l=smoothstep(.08,.98,l);
 float shade=floor(clamp(l*3.0+bayer4(cell)-.5,0.0,3.0)+.5);
 vec3 c=shade<.5?vec3(24.0,48.0,32.0):shade<1.5?vec3(62.0,98.0,56.0):shade<2.5?vec3(130.0,158.0,76.0):vec3(200.0,212.0,138.0);
 gl_FragColor=vec4(c/255.0,1.0);
}`;
// Black and white as Daidō Moriyama's pushed film (30 October 2026): the contrast up, the blacks kept with a little
// separation (World's put a third of a night photo at pure black), real grain (clumped, strongest in the middle
// greys, as Tri-X pushed is) and halation, the light of a bright sign spreading into the dark round it.
const MONO_BODY=`${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 c=texture2D(tDiffuse,vUv).rgb;
 float x=clamp((dot(c,vec3(.28,.6,.12))-.5)*1.28+.5,0.0,1.0);
 x=mix(x,x*x*(3.0-2.0*x),.5);
 x+=max(0.0,dot(ringColour(vUv,6.0*u),vec3(.28,.6,.12))-.72)*.7;
 x=.025+.96*x;
 x=mix(x,x*x*(3.0-2.0*x),.35);
 // Grain clumped over two or three pixels, visible on a phone, strongest in the middle greys.
 float grain=noise(p*.3)*.4+noise(p*.62)*.35+hash(floor(p*.45))*.25-.5;
 x+=grain*(.05+.24*x*(1.0-x)*4.0*.5);
 gl_FragColor=vec4(vec3(clamp(x,0.0,1.0)),1.0);
}`;
// Sepia, judged as a Meiji studio portrait photographer: the plates were blue-sensitive (a blue cloth prints pale, a
// brown face and red lips dark), the print is a toned silver print with its blacks a low chocolate that keeps some
// separation, and a portrait lens softens and darkens towards the edges.
const SEPIA_BODY=`${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec2 v=vUv-.5;
 float soft=smoothstep(.15,.55,length(v));
 vec3 c=mix(texture2D(tDiffuse,vUv).rgb,ringColour(vUv,2.5*u),soft*.8);
 float l=clamp(dot(c,vec3(.12,.28,.6))*1.15+.02,0.0,1.0);
 l=clamp((l-.48)*1.08+.5,0.0,1.0);
 vec3 shadow=vec3(.2,.13,.09),mid=vec3(.6,.43,.28),paper=vec3(.96,.91,.8);
 vec3 col=l<.5?mix(shadow,mid,smoothstep(.0,.5,l)):mix(mid,paper,smoothstep(.5,1.0,l));
 col*=1.0-dot(v,v)*.55;
 // The album print faded at its borders, and the paper's own fibre.
 // A rounded print, as a carte de visite's corners were: the faded edge follows a rounded rectangle.
 vec2 q=abs(vUv-.5)*vec2(uResolution.x/uResolution.y,1.0),hb=vec2(.5*uResolution.x/uResolution.y,.5)-.06;
 float rr=length(max(q-hb+.06,0.0))-.06;
 col=mix(col,paper*.97,smoothstep(-.16,.02,rr)*.42);
 col*=1.0+(noise(p*.7)-.5)*.03;
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Old TV, judged as a family watching a Shōwa-era set: a bright, glowing picture on a curved tube with strongly rounded
// corners and a smooth edge, the composite signal soft along each line, scanlines that widen where the picture is
// bright, and lights that bloom.
const CRT_BODY=`${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 q=vUv*2.0-1.0;
 q*=1.0+dot(q,q)*vec2(.035,.05);
 vec2 uv=q*.5+.5;
 vec2 a=abs(q)-vec2(.86,.8);
 float box=length(max(a,0.0))-.14+min(max(a.x,a.y),0.0);
 float screen=1.0-smoothstep(-.012,.004,box);
 vec2 h=vec2(uTexel.x*3.4*u,0.0);
 vec3 c=texture2D(tDiffuse,uv).rgb*.4+(texture2D(tDiffuse,uv+h).rgb+texture2D(tDiffuse,uv-h).rgb)*.22+texture2D(tDiffuse,uv-h*2.5).rgb*.16;
 float fringe=dot(q,q)*1.2*uTexel.x;
 c.r=mix(c.r,texture2D(tDiffuse,uv+vec2(fringe,0.0)).r,.6);c.b=mix(c.b,texture2D(tDiffuse,uv-vec2(fringe,0.0)).b,.6);
 c+=max(vec3(0.0),ringColour(uv,6.0*u)-.6)*.7+max(vec3(0.0),ringColour(uv,14.0*u)-.62)*.5;
 float lines=uResolution.y/max(2.0,floor(uResolution.y/270.0+.5));
 float y=fract(uv.y*lines),bright=luma(c);
 float scan=mix(.62,1.0,smoothstep(.5-.35*bright-.12,.5,1.0-abs(y-.5)*2.0+.0));
 c*=scan*1.28;
 vec2 v=uv*(1.0-uv.yx);
 c*=pow(clamp(v.x*v.y*20.0,0.0,1.0),.12);
 gl_FragColor=vec4(clamp(c,0.0,1.0)*screen,1.0);
}`;
// Heavy brush for a photograph, after Van Gogh: distinct dabs of loaded paint, each one colour, laid along the form
// (round a hat's cone, down a braid), overlapping in a random order, with the bristles' ridges in them and gaps of the
// darker underpainting between; the colour lifted and pushed to its complement in the shadows, and the drawing in
// Prussian blue. (World's Heavy brush smears; on a photo it left black blotches at a mouth's corners.)
const BRUSH_OIL_BODY=`${PHOTO_STROKES}${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float a=flowAngle(vUv,u)+1.5708;
 vec2 dir=vec2(cos(a),sin(a)),side=vec2(-dir.y,dir.x);
 float S=9.0,L=19.0,W=6.5;
 vec2 cell=floor(p/S);
 vec3 col=vec3(0.0);float best=-1.0,ridge=0.0;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
  vec2 c=cell+vec2(float(i),float(j));
  vec2 centre=(c+.5+(vec2(hash(c),hash(c+7.3))-.5)*.9)*S;
  vec2 d=p-centre;
  float len=L*mix(.75,1.2,hash(c+3.1)),along=dot(d,dir),across=dot(d,side);
  float hw=W*.5*mix(.8,1.15,hash(c+5.7))*(1.0-.35*smoothstep(.2,.5,abs(along)/len));
  if(abs(along)<len*.5&&abs(across)<hw){
   float z=hash(c+11.9);
   if(z>best){best=z;col=texture2D(tDiffuse,centre*u/uResolution).rgb;ridge=across/hw;}
  }
 }
 vec3 under=texture2D(tDiffuse,vUv).rgb*.72;
 if(best<0.0)col=under;
 // He never painted black: the darkest parts are a deep Prussian blue, so a night sky carries its strokes.
 col=max(col,vec3(.05,.08,.2)*(1.0-smoothstep(.02,.08,luma(col))));
 // The bristles' grooves along the stroke, and the light catching its raised edge.
 float bristle=noise(vec2(dot(p,side)*1.3,dot(p,dir)*.08));
 col*=(.9+.16*bristle)*(1.0+.08*ridge*step(0.0,best));
 // Colour lifted, warm in the light, cool in the shade.
 float l=luma(col);
 col=clamp(mix(vec3(l),col,1.3)+vec3(.05,.03,-.05)*(l-.4),0.0,1.0);
 col=mix(col,col*vec3(.75,.85,1.15),(1.0-smoothstep(.1,.4,l))*.5);
 float line=lineAt(vUv,u,2.0,.025,.06)*.75;
 col=mix(col,vec3(.12,.2,.38),line);
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
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
 vec3 w=mix(texture2D(tDiffuse,uv).rgb,ringColour(uv,3.0*u),.5);
 float wl=luma(w)+(noise(p*.02)-.5)*.08;
 // Three transparent washes, each laid where the picture is darker than its value; the lightest left as paper.
 float a1=1.0-smoothstep(.8,.88,wl),a2=1.0-smoothstep(.52,.58,wl),a3=1.0-smoothstep(.27,.33,wl);
 float value=mix(.9,mix(.7,.46,a3),a2);
 vec3 wash=clamp(w*(value/max(wl,.03)),0.0,1.0);
 // The darks glazed in transparent indigo or sepia, as the colour leans, never grey.
 float top=max(w.r,max(w.g,w.b)),cool=smoothstep(-.05,.1,w.b-w.r);
 vec3 glaze=mix(vec3(.42,.3,.24),vec3(.26,.3,.46),cool);
 wash=mix(wash,glaze,(1.0-smoothstep(.1,.3,wl))*.75);
 vec3 paper=vec3(.985,.97,.935);
 float tooth=noise(p*.55)*.55+noise(p*1.7)*.45,bloom=noise(p*.008)*.6+noise(p*.03)*.4;
 vec3 col=mix(paper,paper*mix(vec3(1.0),wash/paper,.88+.12*bloom),a1);
 // The lights are the paper itself, left unpainted.
 col=mix(col,paper,smoothstep(.76,.84,luma(texture2D(tDiffuse,uv).rgb)));
 // Where each wash dried, its outer rim a little darker, soft on the inside: no line round anything.
 float rim=(1.0-smoothstep(0.0,.035,.84-wl))*a1+(1.0-smoothstep(0.0,.03,.55-wl))*a2+(1.0-smoothstep(0.0,.03,.3-wl))*a3;
 col*=1.0-.1*clamp(rim,0.0,1.0);
 // The pigment settles in the paper's grain.
 col*=1.0-.07*a1*(1.0-tooth);
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
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
// 16-bit, judged as Super Famicom pixel artists: 15-bit colour in palettes of shades per material, each a five-step
// ramp from dark to light (skin, wood, foliage, grass, sky, water, stone grey, red, violet, gold), a pixel taking its
// colour's ramp and the nearest step, with a light ordered dither and a dark outline at the strongest edges.
const SNES_BODY=`${CONSOLE_GRID}
vec3 snesRamp(int r,float t){
 vec3 dark,light;
 if(r==0){dark=vec3(.36,.18,.14);light=vec3(1.0,.86,.72);}
 else if(r==1){dark=vec3(.24,.13,.08);light=vec3(.86,.6,.36);}
 else if(r==2){dark=vec3(.06,.18,.12);light=vec3(.62,.84,.4);}
 else if(r==3){dark=vec3(.08,.12,.32);light=vec3(.7,.86,1.0);}
 else if(r==4){dark=vec3(.04,.18,.26);light=vec3(.5,.84,.86);}
 else if(r==5){dark=vec3(.1,.1,.14);light=vec3(.96,.96,.94);}
 else if(r==6){dark=vec3(.32,.04,.08);light=vec3(1.0,.5,.42);}
 else if(r==7){dark=vec3(.18,.08,.3);light=vec3(.94,.6,.98);}
 else {dark=vec3(.3,.18,.02);light=vec3(1.0,.94,.5);}
 vec3 mid=r==5?vec3(.52,.52,.56):r==0?vec3(.86,.56,.42):r==1?vec3(.6,.36,.2):r==2?vec3(.24,.52,.26):r==3?vec3(.24,.42,.8)
  :r==4?vec3(.12,.5,.6):r==6?vec3(.86,.16,.16):r==7?vec3(.58,.3,.78):vec3(.9,.66,.12);
 return t<.5?mix(dark,mid,t*2.0):mix(mid,light,t*2.0-1.0);
}
void main(){
 float px=max(2.0,floor(uResolution.y/224.0+.5));
 vec2 cell=floor(vUv*uResolution/px),size=vec2(px)/uResolution;
 vec3 c=cellColour((cell+.5)*size,size);
 float top=max(c.r,max(c.g,c.b)),low=min(c.r,min(c.g,c.b)),sat=(top-low)/max(top,.05)*smoothstep(.06,.25,top);
 float h=0.0;
 if(top>low){vec3 q=(c-low)/(top-low);h=top==c.r?mod(q.g-q.b,6.0):top==c.g?2.0+q.b-q.r:4.0+q.r-q.g;h=mod(h*60.0,360.0);}
 float rh[9];rh[0]=22.0;rh[1]=28.0;rh[2]=110.0;rh[3]=220.0;rh[4]=190.0;rh[5]=0.0;rh[6]=358.0;rh[7]=285.0;rh[8]=48.0;
 float rs[9];rs[0]=.5;rs[1]=.68;rs[2]=.6;rs[3]=.6;rs[4]=.6;rs[5]=0.0;rs[6]=.95;rs[7]=.55;rs[8]=.8;
 int ramp=5;float d=1e9;
 if(sat>.12)for(int i=0;i<9;i++){if(i==5)continue;float e=abs(h-rh[i]);e=min(e,360.0-e)/40.0+abs(sat-rs[i])*1.4;if(e<d){d=e;ramp=i;}}
 float t=clamp(pow(luma(c),.9)+(bayer4(cell)-.5)*.07,0.0,1.0);
 t=floor(t*4.0+.5)/4.0;
 vec3 col=floor(snesRamp(ramp,t)*31.0+.5)/31.0;
 float boundary=edges((cell+.5)*size,px,.3);
 col=mix(col,snesRamp(ramp,0.0)*.6,step(.82,boundary)*.8);
 gl_FragColor=vec4(col,1.0);
}`;
// The colour hand-held of 1998: 160 by 144 pixels, and every 8 by 8 tile drawn from a palette of its own of four
// colours. A photo on it is a mosaic of tiles, each in four shades of the colour it mostly is, dithered; 15-bit colour.
const HANDHELD_COLOUR_BODY=`${CONSOLE_GRID}
// The machine held eight background palettes of four colours at once, shared by every tile on the screen: here eight
// ramps a pixel artist would set up for a photo (skin, leaves, sky and water, wood, red, violet, grey, sunlight). Each
// 8 by 8 tile takes the ramp its colour is nearest to, and its pixels the ramp's four shades, in flat colour; only a
// narrow band where two shades meet is checkered, as the games' artists did.
vec3 gbcRamp(int i){
 return i==0?vec3(.98,.76,.6):i==1?vec3(.46,.78,.32):i==2?vec3(.42,.66,.98):i==3?vec3(.78,.55,.32)
  :i==4?vec3(.95,.27,.22):i==5?vec3(.66,.44,.88):i==6?vec3(.78,.78,.8):vec3(1.0,.88,.3);
}
void main(){
 float px=max(2.0,floor(uResolution.y/144.0+.5));
 vec2 cell=floor(vUv*uResolution/px),size=vec2(px)/uResolution;
 vec3 c=cellColour((cell+.5)*size,size);
 vec2 tile=floor(cell/8.0)*8.0;
 vec3 t=(cellColour((tile+vec2(2.0,2.0))*size,size*2.0)+cellColour((tile+vec2(6.0,2.0))*size,size*2.0)
  +cellColour((tile+vec2(2.0,6.0))*size,size*2.0)+cellColour((tile+vec2(6.0,6.0))*size,size*2.0))*.25;
 float top=max(t.r,max(t.g,t.b)),sat=(top-min(t.r,min(t.g,t.b)))/max(top,.05)*smoothstep(.05,.25,top);
 // The nearest ramp by hue and by how strong the colour is (a pale skin and a rich wood are both orange).
 float low=min(t.r,min(t.g,t.b)),h=0.0;
 if(top>low){vec3 q=(t-low)/(top-low);h=top==t.r?mod(q.g-q.b,6.0):top==t.g?2.0+q.b-q.r:4.0+q.r-q.g;h=mod(h*60.0,360.0);}
 float rh[7];rh[0]=22.0;rh[1]=88.0;rh[2]=212.0;rh[3]=30.0;rh[4]=4.0;rh[5]=272.0;rh[6]=50.0;
 float rs[7];rs[0]=.3;rs[1]=.55;rs[2]=.5;rs[3]=.6;rs[4]=.75;rs[5]=.5;rs[6]=.7;
 int best=6;float d=1e9;
 if(sat>.14)for(int i=0;i<7;i++){float e=abs(h-rh[i]);e=min(e,360.0-e)/40.0;e+=abs(sat-rs[i])*1.5;if(e<d){d=e;best=i==6?7:i;}}
 // The artists kept a face in one palette: any warm, moderately coloured tile is skin (a red only when strongly red,
 // wood only when dark), so a clash never crosses an eye.
 float warmHue=min(abs(h-25.0),360.0-abs(h-25.0));
 if(warmHue<34.0&&sat<.9&&luma(t)>.2)best=0;
 vec3 ramp=gbcRamp(best);
 float l=clamp((luma(c)-.05)*1.12,0.0,1.0);
 float checker=mod(cell.x+cell.y,2.0);
 float x=l*3.0,f=fract(x);
 float shade=floor(x)+step(.5,f+(checker-.5)*.3*(1.0-smoothstep(.12,.3,abs(f-.5))));
 shade=clamp(shade,0.0,3.0);
 vec3 col=shade<.5?ramp*.14+vec3(.03,.03,.06):shade<1.5?ramp*.46:shade<2.5?ramp:mix(ramp,vec3(1.0),.5);
 gl_FragColor=vec4(floor(clamp(col,0.0,1.0)*31.0+.5)/31.0,1.0);
}`;
// The 8-bit home console of the 80s: 256 by 240 pixels, slightly wide, and every colour one of its fixed palette of
// fifty-odd; a photo is matched to the palette with an ordered dither.
const EIGHT_BIT_BODY=`${CONSOLE_GRID}
// The console's palette as its artists knew it: a grey column and twelve hue columns, each four rows from dark to pale.
vec3 nesColour(int column,int row){
 vec3 pal[52];
 pal[0]=vec3(80,80,80);pal[1]=vec3(0,0,252);pal[2]=vec3(0,0,188);pal[3]=vec3(68,40,188);pal[4]=vec3(148,0,132);pal[5]=vec3(168,0,32);
 pal[6]=vec3(168,16,0);pal[7]=vec3(136,20,0);pal[8]=vec3(80,48,0);pal[9]=vec3(0,120,0);pal[10]=vec3(0,104,0);pal[11]=vec3(0,88,0);pal[12]=vec3(0,64,88);
 pal[13]=vec3(124,124,124);pal[14]=vec3(0,120,248);pal[15]=vec3(0,88,248);pal[16]=vec3(104,68,252);pal[17]=vec3(216,0,204);pal[18]=vec3(228,0,88);
 pal[19]=vec3(248,56,0);pal[20]=vec3(228,92,16);pal[21]=vec3(172,124,0);pal[22]=vec3(0,184,0);pal[23]=vec3(0,168,0);pal[24]=vec3(0,168,68);pal[25]=vec3(0,136,136);
 pal[26]=vec3(188,188,188);pal[27]=vec3(60,188,252);pal[28]=vec3(104,136,252);pal[29]=vec3(152,120,248);pal[30]=vec3(248,120,248);pal[31]=vec3(248,88,152);
 pal[32]=vec3(248,120,88);pal[33]=vec3(252,160,68);pal[34]=vec3(248,184,0);pal[35]=vec3(184,248,24);pal[36]=vec3(88,216,84);pal[37]=vec3(88,248,152);pal[38]=vec3(0,232,216);
 pal[39]=vec3(248,248,248);pal[40]=vec3(164,228,252);pal[41]=vec3(184,184,248);pal[42]=vec3(216,184,248);pal[43]=vec3(248,184,248);pal[44]=vec3(248,164,192);
 pal[45]=vec3(240,208,176);pal[46]=vec3(252,224,168);pal[47]=vec3(248,216,120);pal[48]=vec3(216,248,120);pal[49]=vec3(184,248,184);pal[50]=vec3(184,248,216);pal[51]=vec3(0,252,252);
 return pal[row*13+column]/255.0;
}
// Every 16 by 16 block of the screen used one sub-palette: three colours and the black backdrop. A block takes the hue
// column its colour is nearest to (the grey column if it has little colour), and three rows of it, darker or paler as
// the block is; each pixel then the nearest of black and those three, with an ordered dither. That clash of blocks is
// the console's look.
void main(){
 float py=max(2.0,floor(uResolution.y/224.0+.5));
 vec2 size=vec2(py*8.0/7.0,py);
 vec2 cell=floor(vUv*uResolution/size),px=size/uResolution;
 vec3 c=cellColour((cell+.5)*px,px);
 vec2 block=floor(cell/16.0)*16.0;
 vec3 b=(cellColour((block+vec2(4.0,4.0))*px,px*4.0)+cellColour((block+vec2(12.0,4.0))*px,px*4.0)
  +cellColour((block+vec2(4.0,12.0))*px,px*4.0)+cellColour((block+vec2(12.0,12.0))*px,px*4.0))*.25;
 float top=max(b.r,max(b.g,b.b)),low=min(b.r,min(b.g,b.b)),sat=(top-low)/max(top,.05)*smoothstep(.06,.25,top);
 float h=0.0;
 if(top>low){vec3 q=(b-low)/(top-low);h=top==b.r?mod((q.g-q.b),6.0):top==b.g?2.0+q.b-q.r:4.0+q.r-q.g;h=mod(h*60.0,360.0);}
 // A background has four sub-palettes of three colours and one shared black: here warm (skin, wood, brick), green
 // (leaves), blue (sky, water, cloth) and grey; every block takes the one nearest its colour, so the screen holds at
 // most thirteen colours, as the console's did.
 int column=0;
 if(sat>.2){
  float warm=min(abs(h-25.0),360.0-abs(h-25.0)),green=abs(h-115.0),blue=abs(h-225.0);
  column=warm<=min(green,blue)&&warm<70.0?7:green<=blue&&green<60.0?10:blue<75.0?2:7;
 }
 int first=1;
 vec3 cols[4];cols[0]=vec3(0.0);cols[1]=nesColour(column,first);cols[2]=nesColour(column,first+1);cols[3]=nesColour(column,first+2);
 vec3 q=clamp(c+(bayer4(cell)-.5)*.1,0.0,1.0);
 vec3 best=cols[0];float k=1e9;
 for(int i=0;i<4;i++){vec3 e=q-cols[i];float r=(q.r+cols[i].r)*.5;float m=(2.0+r)*e.r*e.r+4.0*e.g*e.g+(3.0-r)*e.b*e.b;if(m<k){k=m;best=cols[i];}}
 gl_FragColor=vec4(best,1.0);
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
// The photo as the console drew a textured surface: a mesh of triangles whose corners wobble (its vertices were
// snapped to whole screen pixels and computed in fixed point, so they never sat quite where they belonged), the
// texture laid across each triangle without perspective correction. Straight lines in the photo kink where the
// triangles meet, and the photographer's framing is kept.
vec2 psCorner(vec2 g){
 vec2 j=(vec2(hash(g+3.7),hash(g+9.1))-.5)*vec2(.05,.06);
 if(g.x<.5||g.x>5.5)j.x=0.0;if(g.y<.5||g.y>3.5)j.y=0.0;
 return floor((g/vec2(6.0,4.0)+j)*vec2(320.0,240.0)+.5)/vec2(320.0,240.0);
}
void main(){
 vec2 screen=vec2(320.0,240.0);
 vec2 cell=floor(vUv*screen),s=(cell+.5)/screen;
 // The mesh cell this pixel falls in, and the triangle of it, taken from the undisturbed grid; the texture coordinates
 // are the grid's, the corners the wobbling ones.
 vec2 g=s*vec2(6.0,4.0),i=floor(g),f=fract(g);
 vec2 a=i,b=i+vec2(1.0,0.0),c=i+vec2(0.0,1.0);
 if(f.x+f.y>1.0){a=i+vec2(1.0,1.0);b=i+vec2(0.0,1.0);c=i+vec2(1.0,0.0);}
 vec2 pa=psCorner(a),pb=psCorner(b),pc=psCorner(c);
 vec2 v0=pb-pa,v1=pc-pa,v2=s-pa;
 float den=v0.x*v1.y-v1.x*v0.y;
 float wb=(v2.x*v1.y-v1.x*v2.y)/den,wc=(v0.x*v2.y-v2.x*v0.y)/den;
 vec2 uv=clamp((a+(b-a)*wb+(c-a)*wc)/vec2(6.0,4.0),0.0,1.0);
 // Textures smaller than the screen and never filtered: texels of two by two pixels.
 vec2 tex=vec2(160.0,120.0),tc=(floor(uv*tex)+.5)/tex;
 vec3 col=cellColour(tc,1.0/tex);
 col=clamp(mix(vec3(luma(col)),col,1.15),0.0,1.0);
 // 15-bit colour: the graphics chip's four by four dither added, then five bits a channel.
 vec3 v=clamp(col*255.0+psDither(cell),0.0,255.0);
 gl_FragColor=vec4(floor(v/8.0)/31.0,1.0);
}`;
// The 64-bit cartridge console of 1996: its textures were small and filtered smooth by a three-point blend (the
// diagonal smear players remember), its picture 320 by 240 with 16-bit colour and a fine noise dither, and its worlds
// sat in a soft haze. A photo becomes a low-resolution texture, three-point filtered, hazed and cut to the screen.
const SIXTY_FOUR_BIT_BODY=`${CONSOLE_GRID}
// Its 4 KB of texture memory meant tiny textures: the photo as a texture about 64 texels tall, each texel cut to 15-bit
// colour first, then smeared by the three-point filter across the screen. Fog only in the distance (the top of the
// picture, never over its blacks); 16-bit colour on screen with a fine noise dither.
vec3 texel(vec2 t,vec2 size){return floor(cellColour((t+.5)*size,size)*31.0+.5)/31.0;}
void main(){
 // The filter is the console's own smooth three-point blend, worked out for every pixel (no stair-steps); the
 // texture about 64 texels tall, enough to keep a face, small enough that the smear shows.
 vec2 screen=vec2(floor(240.0*uResolution.x/uResolution.y),240.0);
 vec2 cell=floor(vUv*screen),at=vUv;
 vec2 rows=vec2(floor(64.0*uResolution.x/uResolution.y),64.0),tsize=1.0/rows;
 vec2 g=at*rows-.5,t=floor(g),f=fract(g);
 vec3 c;
 if(f.x+f.y<1.0){vec3 a=texel(t,tsize),b=texel(t+vec2(1,0),tsize),d=texel(t+vec2(0,1),tsize);c=a+f.x*(b-a)+f.y*(d-a);}
 else{vec3 a=texel(t+vec2(1,1),tsize),b=texel(t+vec2(0,1),tsize),d=texel(t+vec2(1,0),tsize);c=a+(1.0-f.x)*(b-a)+(1.0-f.y)*(d-a);}
 c=clamp(mix(vec3(luma(c)),c,1.2),0.0,1.0);
 c=mix(c,vec3(.78,.82,.9),.18*smoothstep(.55,1.0,vUv.y)*smoothstep(.15,.45,luma(c)));
 gl_FragColor=vec4(clamp(floor(c*31.0+hash(cell)*.999)/31.0,0.0,1.0),1.0);
}`;
// The red visor of 1995: 384 by 224 pixels in four shades of LED red on black, the dark between the pixels showing.
const RED_VISOR_BODY=`${CONSOLE_GRID}
// One column of 224 red LEDs swept across the eye by a mirror: four shades of red, the rows a hair apart (a dark line
// between them), and a picture that floats on black, as its games did. The camera exposes the photo first (as for the
// ink Looks), then this sets it low: a face is a dim red, only the brightest things full.
void main(){
 float px=max(2.0,floor(uResolution.y/224.0+.5));
 vec2 cell=floor(vUv*uResolution/px),size=vec2(px)/uResolution;
 float l=luma(cellColour((cell+.5)*size,size));
 l=pow(smoothstep(.12,.98,l),1.8);
 float shade=floor(clamp(l*3.0+bayer4(cell)-.5,0.0,3.0)+.5);
 float row=step(1.0/px+.01,fract(vUv.y*uResolution.y/px));
 gl_FragColor=vec4(vec3(1.0,.04,.05)*shade*.31*mix(.45,1.0,row),1.0);
}`;
// A printed comic page, as the 1960s colour comics were made: the colour simplified into flat areas, each plate (cyan,
// magenta, yellow, black) laid as a tint in fixed steps (a quarter, a half, three quarters, solid), round dots at the
// plate's own screen angle swelling a little in the press (dot gain), true solids, and the drawing on the black plate
// as a keyline over the tints. Not exposed like the ink Looks: a printed page is a little darker than the photo, never
// lighter. (Rebuilt 30 October 2026: the comic printers' judge scored the first version 1 out of 10, faces erased.)
const HALFTONE_BODY=`${PHOTO_LINES}
float comicDot(vec2 px,float angle,float cell,float cover){
 float s=sin(angle),c=cos(angle);
 vec2 f=fract(mat2(c,-s,s,c)*px/cell)-.5;
 float d=length(f),r=sqrt(clamp(cover,0.0,1.0))*.7071,aa=max(fwidth(d),.01)*.85;
 return (1.0-smoothstep(r-aa,r+aa,d))*step(.02,cover);
}
// A plate's tint: the nearest of the steps a colourist could ask for, then the press's dot gain.
float tint(float cover){float q=floor(clamp(cover,0.0,1.0)*4.0+.5)*.25;return min(1.0,q+.1*q*(1.0-q));}
void main(){
 float u=unit(),cell=max(5.0,9.0*u);
 vec2 px=vUv*uResolution;
#ifdef LIGHT
 vec3 c=mix(texture2D(tDiffuse,vUv).rgb,ringColour(vUv,3.0*u),.6);
#else
 vec3 c=texture2D(tDiffuse,vUv).rgb*.3+ringColour(vUv,2.5*u)*.35+ringColour(vUv,5.0*u)*.35;
#endif
 c=pow(c,vec3(.95));
 float k=1.0-max(c.r,max(c.g,c.b));
 // Light tints for the colours (skin is a quarter of magenta and of yellow, not half), black for the shadows.
 vec3 cmy=clamp((1.0-c-k)/max(1.0-k,.001)*vec3(.85,.66,.62),0.0,1.0);
 float black=smoothstep(.55,.94,k);
 vec3 col=vec3(.98,.96,.90);
 col*=mix(vec3(1.0),vec3(0.0,.62,.9),comicDot(px,.26,cell,tint(cmy.x)));
 col*=mix(vec3(1.0),vec3(.9,.14,.5),comicDot(px,1.31,cell,tint(cmy.y)));
 col*=mix(vec3(1.0),vec3(1.0,.88,.06),comicDot(px,0.0,cell,tint(cmy.z)));
 col*=mix(vec3(1.0),vec3(.12,.11,.13),comicDot(px,.79,cell,tint(black)));
 // The keyline: the drawing, solid on the black plate.
 float line=inked(vUv,u,1.8,.02,.04,1.0);
 col=mix(col,vec3(.1,.09,.11),clamp(line,0.0,1.0));
 gl_FragColor=vec4(col,1.0);
}`;
const NIGHT_BODY=`${PHOTO_LINES}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float l=luma(texture2D(tDiffuse,vUv).rgb);
 // The tube's automatic brightness: highlights rolled off, not clipped, so a lit sign keeps its lettering.
 l=l/(l+.45)*1.1;
 // Bright lights bloom into a halo on the phosphor.
 l+=max(0.0,ringLuma(vUv,7.0*u)-.7)*.9+max(0.0,ringLuma(vUv,16.0*u)-.75)*.5;
 // Scintillation: a sparkle of single photons, densest where it is dark; the fibre plate's faint honeycomb in the light.
 float spark=step(.988-.03*(1.0-smoothstep(.0,.35,l)),hash(floor(p*.8)));
 vec2 h=p*.55;float comb=(sin(h.x)+sin(h.x*.5+h.y*.866)+sin(h.x*.5-h.y*.866))/3.0;
 l=l*(1.0+.035*comb*smoothstep(.4,.9,l))+spark*.35+(noise(p*.6)-.5)*.06;
 vec2 v=(vUv-.5)*uResolution/min(uResolution.x,uResolution.y);
 float tube=1.0-smoothstep(.46,.6,length(v));
 // P43 phosphor: yellow-green, washing towards a pale green in the brightest parts.
 vec3 col=mix(vec3(.42,1.0,.22)*l,vec3(.85,1.0,.75),smoothstep(.85,1.3,l)*.6)*tube;
 gl_FragColor=vec4(clamp(col+vec3(0.0,.02,0.0),0.0,1.0),1.0);
}`;
// Cartoon, judged as a TV anime colour designer (Crayon Shin-chan, Doraemon): a base and one shadow per material, a
// thick brush-pen outline on every silhouette, nothing of the photo's grain.
const CARTOON_BODY=`${PHOTO_LINES}${PHOTO_CEL}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float m;vec3 b=celBase(vUv,u,m);
 float l=luma(b);
 vec3 hue=b/max(l,.03);
 // Exactly two values per colour: the base (the material's own light) and a shadow, cooler and darker, cut hard.
 float value=m*1.14+.09;
 vec3 base=hue*value;base/=max(1.0,max(base.r,max(base.g,base.b)));
 base=mix(vec3(luma(base)),base,1.15);
 vec3 shade=base*vec3(.68,.68,.82);
 float d=l-m*.84,w=max(fwidth(d),.004);
 vec3 col=mix(shade,base,smoothstep(-w,w,d));
 // The outline: thick and steady on the silhouettes and the strongest features only, never on texture.
 vec2 wob=(vec2(noise(p*.035),noise(p*.035+9.0))-.5)*uTexel*2.0*u;
 // Found at twice the scale, so a mark a few pixels wide (a wrinkle, a pore) is no outline; shapes are.
 float line=inked(vUv+wob,u*2.0,3.0,.07,.06,.8);
 col=mix(col,vec3(.16,.12,.13),smoothstep(.4,.7,line));
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Adventure Ink, judged as Akira Toriyama's colour pages: bright cel colours, a base, one hard shadow and a small
// highlight on what shines, and a confident ink contour, finer than the Cartoon's, with the eyes kept as ink.
const ADVENTURE_BODY=`${PHOTO_LINES}${PHOTO_CEL}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 float m;vec3 b=celBase(vUv,u,m);
 float l=luma(b);
 vec3 hue=b/max(l,.03);
 // Toriyama's colour pages: bright clean colour, the shading airbrushed (soft, over a few pixels), a small highlight.
 float value=m*1.1+.07;
 vec3 base=hue*value;base/=max(1.0,max(base.r,max(base.g,base.b)));
 base=clamp(mix(vec3(luma(base)),base,1.32),0.0,1.0);
 vec3 shade=base*vec3(.64,.62,.78);
 float d=l-m*.88;
 vec3 col=mix(shade,base,smoothstep(-.06,.06,d));
 col=mix(col,mix(base,vec3(1.0),.5),smoothstep(.0,.08,l-m*1.28)*step(.55,l));
 // A thin, clean ink line: one pixel of pen, only where the drawing is clear.
 float line=inked(vUv,u,1.6,.065,.04,.6);
 col=mix(col,vec3(.08,.07,.09),smoothstep(.45,.75,line));
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
// Risograph, in the duplicator's own inks (the owner, 30 October 2026: "I do love Risograph can there be several
// variations on Risograph?"). A Riso prints one drum per ink, each ink translucent over the one before, so a photo is
// separated into how much of each ink every point needs: overprinted inks multiply, which in optical density is a sum,
// so the amounts are found exactly (least squares on densities, kept between none and full). The darks come out as the
// inks printed over each other, as on a real Riso, not as a third black. Each drum prints a little out of register,
// through Riso's grain screen (a stochastic dither, not a dot grid), with the roller's streaks along the feed and a
// starved mottle in the big solids; the darker drum carries the drawing's contours.
const RISO_INKS={
 riso:[[.86,.25,.22],[.12,.48,.52]],
 risoPinkBlue:[[1.0,.33,.6],[.12,.47,.75]],
 risoRedNavy:[[.95,.2,.25],[.15,.22,.42]],
 risoBlackPink:Object.assign([[1.0,.33,.6],[.1,.1,.12]],{duo:true}),
 // Real Riso inks pass a little of every colour (a yellow lets some blue through), so none is endlessly dense in one.
 risoThree:[[1.0,.88,.3],[1.0,.33,.6],[.12,.47,.75]],
};
function risoBody(inks){
 const v=c=>`vec3(${c.map(x=>x.toFixed(3)).join(',')})`,n=inks.length;
 const offsets=[[0,0],[1.4,-.9],[-1.1,1.2]];
 return `${PHOTO_LINES}
vec3 risoD(vec3 c){return -log(clamp(c,vec3(.02),vec3(1.0))/vec3(.975,.955,.9));}
// How much of each ink the colour at uv needs.
vec3 risoSeparate(vec2 uv,float u){
#ifdef LIGHT
 vec3 c=texture2D(tDiffuse,uv).rgb;
#else
 vec3 c=mix(texture2D(tDiffuse,uv).rgb,ringColour(uv,1.5*u),.4);
#endif
 vec3 D=risoD(c);
${inks.duo?` float l=luma(c);
 // A duotone, as a zine prints black and a colour: the colour carries the middle tones, black the shadows.
 return vec3((1.0-smoothstep(.22,.95,l))*.9,1.0-smoothstep(.06,.46,l),0.0);`:n===2?` vec3 a=risoD(${v(inks[0])}),b=risoD(${v(inks[1])});
 float aa=dot(a,a),bb=dot(b,b),ab=dot(a,b),da=dot(D,a),db=dot(D,b);
 vec2 k=vec2(bb*da-ab*db,aa*db-ab*da)/max(aa*bb-ab*ab,1e-5);
 if(k.x<0.0)k=vec2(0.0,db/bb);else if(k.y<0.0)k=vec2(da/aa,0.0);
 return vec3(clamp(k,0.0,1.0),0.0);`:` mat3 M=mat3(risoD(${v(inks[0])}),risoD(${v(inks[1])}),risoD(${v(inks[2])}));
 vec3 k=clamp(inverse(M)*D,0.0,1.0);
 // A few steps of projected descent keep the amounts possible (none to full) and the colour as close as it can be.
 mat3 T=transpose(M)*M;float step=1.0/max(T[0][0]+T[1][1]+T[2][2],1e-3);
 for(int i=0;i<6;i++)k=clamp(k-step*(T*k-transpose(M)*D),0.0,1.0);
 return k;`}
}
// One drum's grain: a stochastic screen, clumped a little as the master's emulsion is.
float risoGrain(vec2 p,float cover,float seed){
 // Interleaved gradient noise on cells of two pixels: an even, blue-noise-like grain (white noise reads as TV static),
 // with a little of the master's clumping.
 vec2 cell=floor(p*.5)+seed*vec2(5.0,3.0);
 float th=fract(52.9829189*fract(dot(cell,vec2(.06711056,.00583715))))*.78+noise(p*.35+seed)*.22;
 return smoothstep(th-.06,th+.06,cover);
}
void main(){
 float u=unit();
 vec2 p=vUv*uResolution/u;
 vec3 paper=vec3(.975,.955,.9)-.02*noise(p*1.3);
 float streak=.92+.08*noise(vec2(p.x*.09,p.y*.003));
 vec3 col=paper;
${inks.map((ink,i)=>{const o=offsets[i];return ` {
  vec2 uv=vUv+uTexel*u*vec2(${o[0].toFixed(1)},${o[1].toFixed(1)});
  float k=risoSeparate(uv,u)[${i}]*streak;
  // A drum lays down at least a light tint where it prints at all, so a face is never blown out to paper.
  k=k>.015?mix(.1,.92,pow(k,.8)):0.0;
  k*=1.0-.14*smoothstep(.75,1.0,k)*noise(p*.03+${i*5}.0);
${i===n-1?`  k=max(k,lineAt(uv,u,1.8,.02,.04)*.95);
`:''}  float g=risoGrain(p+vec2(${o[0].toFixed(1)},${o[1].toFixed(1)}),k,${i+1}.0);
  col*=mix(vec3(1.0),${v(ink)}/vec3(.975,.955,.9),g*(.9+.1*noise(p*.2+${i*3}.0)));
 }`;}).join('\n')}
 gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;
}
/** The camera's own Looks: each a main of its own over World's shared helpers (Cartoon's program supplies them). Crayon,
 * Stamp, Line drawing, Pencil manga, Manga, Sketchbook, Woodblock print, Pocket and Watercolour keep World's names and
 * swatches but draw a photograph with these, made for one. */
const CAMERA_BODIES={adventureInk:ADVENTURE_BODY,flat:CARTOON_BODY,instant:INSTANT_BODY,camcorder:CAMCORDER_BODY,halftone:HALFTONE_BODY,cyanotype:CYANOTYPE_BODY,nightVision:NIGHT_BODY,crayon:CRAYON_BODY,stamp:STAMP_BODY,lines:LINES_BODY,pencilManga:PENCIL_MANGA_BODY,manga:MANGA_BODY,sketchbook:SKETCHBOOK_BODY,print:PRINT_BODY,pocket:POCKET_BODY,watercolour:WATERCOLOUR_BODY,brushOil:BRUSH_OIL_BODY,mono:MONO_BODY,sepia:SEPIA_BODY,crt:CRT_BODY,snes:SNES_BODY,
 colourHandheld:HANDHELD_COLOUR_BODY,eightBit:EIGHT_BIT_BODY,
 ...Object.fromEntries(Object.entries(RISO_INKS).map(([name,inks])=>[name,risoBody(inks)])),thirtyTwoBit:THIRTY_TWO_BIT_BODY,sixtyFourBit:SIXTY_FOUR_BIT_BODY,redVisor:RED_VISOR_BODY};

/** In the order World's menu offers them. */
export const LOOK_NAMES=Object.freeze(Object.keys(LOOKS));
/** The trick lenses, as the hand-held cameras had them: Twin mirrors the left half onto the right, Quad the top left
 * quarter into all four. */
export const TRICKS=Object.freeze(['none','twin','quad']);
/** The longest side and the most pixels a save may have (iOS Safari refuses canvases over 16.7 million pixels). */
export const MAX_SIDE=4096,MAX_PIXELS=16e6;

const WORLD_UNIT='float unit(){return max(1.0,uResolution.y/1080.0);}';
const PHOTO_UNIT='uniform float uLines;uniform float uUnitFloor;uniform float uFocusY;\nfloat unit(){return max(uUnitFloor,uResolution.y/uLines);}';

// Small changes to a World Look for photographs, by exact replacement of its own lines (World's source stays the one
// copy; a line World changes makes the camera refuse to start rather than draw something else). Oil painting, judged as
// Hopper (30 October 2026): no clipping to black and white (a night is a deep green-blue), the flat light and dark
// marks only for real features (they put white specks on skin and black triangles at a mouth's corners), and the
// brushwork in all of the paint.
const PHOTO_EDITS={
 // Miniature, judged as Olivo Barbieri: the model look is bright, flat light, not burnt skin.
 // The plane of focus where the subject is: where the photographer tapped (uFocusY, the height from the foot), or else
 // in an upright photo a person's face, in its upper third (the band fell on a necklace and blurred the face), and a
 // little above the middle in a wide one.
 tilt:[['c=mix(vec3(l),c,1.45);\n c=(c-0.5)*1.12+0.53;','c=mix(vec3(l),c,1.12);\n c=(c-0.5)*1.04+0.53;'],
  ['float away=abs(vUv.y-0.46);','float away=abs(vUv.y-(uFocusY>=0.0?uFocusY:uResolution.y>uResolution.x*1.05?0.66:0.54));']],
 oil:[
  ['col=mix(col,vec3(0.97,0.95,0.9),smoothstep(0.1,0.22,light)*near);','col=mix(col,vec3(0.97,0.95,0.9),smoothstep(0.24,0.42,light)*near*.6);'],
  ['col=mix(col,vec3(0.16,0.12,0.11),smoothstep(0.1,0.22,dark)*near*0.9);','col=mix(col,vec3(0.16,0.12,0.11),smoothstep(0.2,0.36,dark)*near*0.6);'],
  ['col=mix(vec3(luma(col)),col,1.35);\n col=(col-0.5)*1.1+0.5;','col=mix(vec3(luma(col)),col,1.15);\n col=mix(vec3(.05,.09,.11),vec3(.97,.95,.88),col);'],
  ['col*=1.0+thinPaint*((stroke-.5)*.035+(weave-.5)*.016);','col*=1.0+mix(.6,1.0,thinPaint)*((stroke-.5)*.07+(weave-.5)*.025);'],
 ],
};
/** World's fragment for a Look as GLSL ES 3.00, mixed into its input by uAmount; null for Natural. */
export function photoFragment(name,{light=false}={}){
 const own=CAMERA_BODIES[name];
 let world=lookFragment(own?'flat':name,{light,depth:false});
 if(!world)return null;
 for(const [from,to] of own?[]:PHOTO_EDITS[name]||[]){
  if(!world.includes(from))throw new Error(`World's ${name} changed: the camera's photo edit no longer applies`);
  world=world.replace(from,to);
 }
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
export const INK_LOOKS=Object.freeze(['pocket','lines','manga','print','riso','pencilManga','stamp','cyanotype','nightVision','redVisor','risoPinkBlue','risoRedNavy','risoBlackPink','risoThree']);
export const PAPERS=Object.freeze([{id:'none',label:'None'},{id:'drawing',label:'Drawing'},{id:'rough',label:'Rough'},{id:'warm',label:'Warm'}]);

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
 return {layers,crop:normalCrop(recipe.crop),paper:PAPERS.some(p=>p.id===recipe.paper)?recipe.paper:'none',
  adjust:{light:n(a.light,-1,1,0),contrast:n(a.contrast,-1,1,0),colour:n(a.colour,-1,1,0),warmth:n(a.warmth,-1,1,0),pattern:n(a.pattern,-1,1,0),detail:n(a.detail,-1,1,0)},
  stamp:!!recipe.stamp,stickers,
  // The print's border (frames.js) and the trick lens.
  frame:typeof recipe.frame==='string'&&/^[a-z]{1,20}$/.test(recipe.frame)?recipe.frame:'none',
  // Where Miniature's plane of focus lies, as a height from the picture's foot (0 to 1); -1 lets it find the subject.
  focus:n(recipe.focus,-1,1,-1),
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
uniform vec3 uDown;
float luma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec2 sourceAt(vec2 p){
 if(uTrick>.5)p.x=.5-abs(p.x-.5);
 if(uTrick>1.5)p.y=.5+abs(p.y-.5);
 vec2 q=vec2(p.x,1.0-p.y);if(uMirror>.5)q.x=1.0-q.x;
 return uCrop.xy+q*uCrop.zw;
}
vec3 at(vec2 p){return texture(tSource,sourceAt(p),uBias).rgb;}
// A photo made smaller for the picture, as sharp as it can be: four samples a quarter of a pixel either side, each from
// the mipmap level twice the picture's size (the GPU's own blend between levels softens a picture shrunk by less than
// half, losing about a quarter of its fine detail).
vec3 downsized(vec2 p){
 vec2 c=sourceAt(p),d=uDown.xy*.25;
 return (textureLod(tSource,c+d,uDown.z).rgb+textureLod(tSource,c-d,uDown.z).rgb
  +textureLod(tSource,c+vec2(d.x,-d.y),uDown.z).rgb+textureLod(tSource,c+vec2(-d.x,d.y),uDown.z).rgb)*.25;
}
// With the small negative lobes of a Lanczos filter: the picture against the four pixels round it, a little sharpened.
vec3 resized(vec2 p){
 vec3 c=downsized(p);
 vec2 o=uDown.xy/uCrop.zw;
 vec3 ring=(downsized(p+vec2(o.x,0.0))+downsized(p-vec2(o.x,0.0))+downsized(p+vec2(0.0,o.y))+downsized(p-vec2(0.0,o.y)))*.25;
 return clamp(c+(c-ring)*.32,0.0,1.0);
}
void main(){
 // (A picture not made smaller, or one a Look smooths or reads softer, is read as it is.)
 vec3 c=uSmooth>0.0||uBias>0.0||uDown.z<0.0?at(vUv):resized(vUv);
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

// Optional stock after all Looks, before frames/lettering/stickers. No texture asset or network request.
const PAPER=`#version 300 es
precision highp float;in vec2 vUv;out vec4 fragColor;
uniform sampler2D tDiffuse;uniform vec2 uResolution;uniform float uStock;
float phash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float pnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(phash(i),phash(i+vec2(1,0)),f.x),mix(phash(i+vec2(0,1)),phash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec3 c=texture(tDiffuse,vUv).rgb;
 vec2 p=vUv*uResolution/max(.5,uResolution.y/1080.0);
 float fine=pnoise(p*1.4)*.6+pnoise(p*.58+9.0)*.4;
 float rough=pnoise(p*.35)*.65+pnoise(p*.8+11.0)*.35;
 float fibre=pnoise(vec2(p.x*.12,p.y*1.9)+23.0);
 float relief=uStock<1.5?(fine-.5)*.055:uStock<2.5?(rough-.5)*.17+(fine-.5)*.045:(fine-.5)*.07+(fibre-.5)*.035;
 vec3 tint=uStock>2.5?vec3(.99,.958,.875):uStock>1.5?vec3(.985,.978,.954):vec3(.995,.993,.985);
 fragColor=vec4(clamp(c*tint*(1.0+relief),0.0,1.0),1.0);
}`;

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
   // One picture pixel in the source's coordinates, and the level twice the picture's size to sample it from.
   const shrink=Math.max(crop.w*s.width/w,crop.h*s.height/h);
   if(u.uDown)gl.uniform3f(u.uDown,crop.w/w,crop.h/h,shrink>1.05?Math.max(0,Math.log2(shrink)-1):-1);
   gl.uniform4f(u.uCrop,crop.x,crop.y,crop.w,crop.h);f1(u.uMirror,mirror?1:0);f1(u.uSmooth,smoothing);f1(u.uAuto,auto?1:0);
   f1(u.uTrick,TRICKS.indexOf(recipe.trick||'none'));
   // Smoothing reaches about a thousandth of the picture's height, whatever its size.
   if(u.uStep)gl.uniform2f(u.uStep,reach*h/(900*w),reach/900);
   f1(u.uLight,a.light);f1(u.uContrast,a.contrast);f1(u.uColour,a.colour);f1(u.uWarmth,a.warmth);
  };
 }
 const lookUniforms=(amount,w,h,pattern,floor=.5,focus=-1)=>u=>{
  f1(u.uAmount,amount);f1(u.uFocusY,focus);if(u.uTexel)gl.uniform2f(u.uTexel,1/w,1/h);if(u.uResolution)gl.uniform2f(u.uResolution,w,h);
  // Pattern: -1 finer, +1 coarser, a factor of two either way.
  f1(u.uLines,1080*2**-pattern);f1(u.uUnitFloor,floor);
  f1(u.uComic,1);f1(u.uSkyDepth,120);f1(u.uFocusDistance,6);f1(u.uFocusRange,3);f1(u.uNear,.05);f1(u.uFar,60);
 };
 const paperUniforms=(recipe,w,h)=>u=>{gl.uniform2f(u.uResolution,w,h);f1(u.uStock,PAPERS.findIndex(p=>p.id===recipe.paper));};

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
  if(recipe.paper&&recipe.paper!=='none'){
   const entry=fixed('paper',PAPER);if(!entry)return false;steps.push({entry,paper:true});
  }
  const vp=viewport||[0,0,width,height];
  if(!steps.length&&!intoPair){pass(prep,src,output,vp,prepare(recipe,source,crop,mirror,width,height,false,auto),tile);return true;}
  const p=pair(targetName,width,height);let read=0;
  pass(prep,src,p.items[0].f,[0,0,width,height],prepare(recipe,source,crop,mirror,width,height,smooth,auto),tile);
  steps.forEach(({layer,entry,paper},i)=>{
   const last=i===steps.length-1&&!intoPair;
   pass(entry,p.items[read].t,last?output:p.items[1-read].f,last?vp:[0,0,width,height],paper?paperUniforms(recipe,width,height):lookUniforms(layer.amount,width,height,recipe.adjust.pattern,.5,recipe.focus??-1),tile);
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
   const before={...recipe,paper:'none',layers:recipe.layers.slice(0,layer)};
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
    pass(entry,base.items[INK_LOOKS.includes(name)?1:0].t,atlas.items[0].f,[i*size,0,size,size],lookUniforms(1,size,size,recipe.adjust.pattern,.35,recipe.focus??-1));
   });
   let result=atlas.items[0].f;
   if(recipe.paper&&recipe.paper!=='none'){
    const paper=fixed('paper',PAPER);if(!paper)return null;
    pass(paper,atlas.items[0].t,atlas.items[1].f,[0,0,w,h],paperUniforms(recipe,w,h));result=atlas.items[1].f;
   }
   const pixels=new Uint8Array(w*h*4);
   gl.bindFramebuffer(gl.FRAMEBUFFER,result);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
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

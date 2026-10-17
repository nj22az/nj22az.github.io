#include "render.h"
#include "platform.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stddef.h>

#define PI 3.14159265359f
#define MAX_VERTICES 180000
#define GL_FN(ret,name,args) static ret (*name) args
GL_FN(unsigned,glCreateShader,(unsigned));GL_FN(void,glShaderSource,(unsigned,int,const char*const*,const int*));
GL_FN(void,glCompileShader,(unsigned));GL_FN(void,glGetShaderiv,(unsigned,unsigned,int*));
GL_FN(void,glGetShaderInfoLog,(unsigned,int,int*,char*));GL_FN(unsigned,glCreateProgram,(void));
GL_FN(void,glAttachShader,(unsigned,unsigned));GL_FN(void,glBindAttribLocation,(unsigned,unsigned,const char*));
GL_FN(void,glLinkProgram,(unsigned));GL_FN(void,glGetProgramiv,(unsigned,unsigned,int*));
GL_FN(void,glGetProgramInfoLog,(unsigned,int,int*,char*));GL_FN(void,glDeleteShader,(unsigned));
GL_FN(void,glUseProgram,(unsigned));GL_FN(int,glGetUniformLocation,(unsigned,const char*));
GL_FN(void,glUniformMatrix4fv,(int,int,unsigned char,const float*));GL_FN(void,glGenBuffers,(int,unsigned*));
GL_FN(void,glBindBuffer,(unsigned,unsigned));GL_FN(void,glBufferData,(unsigned,ptrdiff_t,const void*,unsigned));
GL_FN(void,glEnableVertexAttribArray,(unsigned));GL_FN(void,glVertexAttribPointer,(unsigned,int,unsigned,unsigned char,int,const void*));
GL_FN(void,glDrawArrays,(unsigned,int,int));GL_FN(void,glClearColor,(float,float,float,float));
GL_FN(void,glClear,(unsigned));GL_FN(void,glEnable,(unsigned));GL_FN(void,glDisable,(unsigned));
GL_FN(void,glViewport,(int,int,int,int));GL_FN(void,glReadPixels,(int,int,int,int,unsigned,unsigned,void*));
GL_FN(void,glPixelStorei,(unsigned,int));GL_FN(void,glDeleteBuffers,(int,const unsigned*));GL_FN(void,glDeleteProgram,(unsigned));
GL_FN(const unsigned char*,glGetString,(unsigned));GL_FN(unsigned,glGetError,(void));
#define LOAD(n) do{*(void **)(&n)=platform_gl(#n);if(!n){fprintf(stderr,"Missing GL symbol %s\n",#n);return false;}}while(0)

typedef struct {float x,y,z;} Vec;
typedef struct {float r,g,b;} Colour;
typedef struct {Vec p;Colour c;} Vertex;
static Vertex vertices[MAX_VERTICES];static int used,static_count;
static unsigned program,buffers[3],triangles;static int matrix_location;
static int width,height;static float aspect=1;
static Colour rgb(unsigned c){return (Colour){((c>>16)&255)/255.f,((c>>8)&255)/255.f,(c&255)/255.f};}
static Colour shade(Colour c,float s){return (Colour){c.r*s,c.g*s,c.b*s};}
static Vec add(Vec a,Vec b){return (Vec){a.x+b.x,a.y+b.y,a.z+b.z};}
static Vec sub(Vec a,Vec b){return (Vec){a.x-b.x,a.y-b.y,a.z-b.z};}
static Vec mul(Vec a,float s){return (Vec){a.x*s,a.y*s,a.z*s};}
static float dot(Vec a,Vec b){return a.x*b.x+a.y*b.y+a.z*b.z;}
static Vec cross(Vec a,Vec b){return (Vec){a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x};}
static Vec norm(Vec a){float d=sqrtf(dot(a,a));return d>.0001f?mul(a,1/d):(Vec){0,1,0};}
static void tri(Vec a,Vec b,Vec c,Colour colour,bool lit){
    if(used+3>MAX_VERTICES){fprintf(stderr,"Vertex budget exceeded\n");exit(2);}
    if(lit){Vec n=norm(cross(sub(b,a),sub(c,a)));float l=dot(n,norm((Vec){-.35f,.85f,.55f}));float s=l>.65f?1:l>.12f?.86f:.68f;colour=shade(colour,s);}
    vertices[used++]=(Vertex){a,colour};vertices[used++]=(Vertex){b,colour};vertices[used++]=(Vertex){c,colour};
}
static void quad(Vec a,Vec b,Vec c,Vec d,Colour col){tri(a,b,c,col,true);tri(a,c,d,col,true);}
static void box(Vec p,Vec s,Colour c){
    s=mul(s,.5f);Vec v[8];for(int i=0;i<8;i++)v[i]=add(p,(Vec){i&1?s.x:-s.x,i&2?s.y:-s.y,i&4?s.z:-s.z});
    const int face[6][4]={{0,2,3,1},{4,5,7,6},{0,4,6,2},{1,3,7,5},{0,1,5,4},{2,6,7,3}};
    for(int i=0;i<6;i++)quad(v[face[i][0]],v[face[i][1]],v[face[i][2]],v[face[i][3]],c);
}
static Vec sphere_point(Vec p,Vec scale,float u,float v){return add(p,(Vec){cosf(u)*sinf(v)*scale.x,cosf(v)*scale.y,sinf(u)*sinf(v)*scale.z});}
static void ellipsoid(Vec p,Vec scale,Colour c,int seg,int rings){
    for(int j=0;j<rings;j++)for(int i=0;i<seg;i++){
        float u=i*2*PI/seg,u1=(i+1)*2*PI/seg,v=j*PI/rings,v1=(j+1)*PI/rings;
        Vec a=sphere_point(p,scale,u,v),b=sphere_point(p,scale,u,v1),d=sphere_point(p,scale,u1,v),e=sphere_point(p,scale,u1,v1);
        if(j>0)tri(a,b,d,c,true);
        if(j<rings-1)tri(d,b,e,c,true);
    }
}
static void beam(Vec a,Vec b,float r,Colour c,int sides){
    Vec dir=norm(sub(b,a)),u=norm(cross(dir,fabsf(dir.y)<.95f?(Vec){0,1,0}:(Vec){1,0,0})),v=cross(dir,u);
    for(int i=0;i<sides;i++){
        float t=i*2*PI/sides,t1=(i+1)*2*PI/sides;
        Vec d=mul(add(mul(u,cosf(t)),mul(v,sinf(t))),r),e=mul(add(mul(u,cosf(t1)),mul(v,sinf(t1))),r);
        quad(add(a,d),add(b,d),add(b,e),add(a,e),c);
        tri(a,add(a,e),add(a,d),c,true);tri(b,add(b,d),add(b,e),c,true);
    }
}
static void disk(Vec p,float rx,float rz,Colour c){for(int i=0;i<24;i++){float a=i*2*PI/24,b=(i+1)*2*PI/24;tri(p,add(p,(Vec){rx*cosf(a),0,rz*sinf(a)}),add(p,(Vec){rx*cosf(b),0,rz*sinf(b)}),c,false);}}
static void ring(Vec p,float r,Colour c){for(int i=0;i<24;i++){float a=i*2*PI/24,b=(i+1)*2*PI/24;beam(add(p,(Vec){r*cosf(a),r*sinf(a),0}),add(p,(Vec){r*cosf(b),r*sinf(b),0}),.012f,c,4);}}

static void arena(void){
    Colour deck=rgb(0x557a78),white=rgb(0xf1eedb),red=rgb(0xc65746),yellow=rgb(0xf2cf70),rail=rgb(0xdfebdf),navy=rgb(0x183b45);
    // Native recreation from ferry-ship.js: 34.5 x 8.4 m; combat origin is station 24 m.
    box((Vec){0,-2,0},(Vec){180,.2f,180},rgb(0x62aaa9));
    for(int i=0;i<14;i++)box((Vec){(i%2?1:-1)*(12+i*1.8f),-1.87f,-15+i*3.f},(Vec){6,.012f,.035f},rgb(0x9bc8bc));
    ellipsoid((Vec){-23,-1.1f,-40},(Vec){22,6,8},rgb(0x7c9c85),12,4);
    ellipsoid((Vec){27,-1.4f,-47},(Vec){27,5,9},rgb(0x96ab91),12,4);
    box((Vec){0,-.18f,-6.75f},(Vec){8.4f,.36f,34.5f},deck);
    // Raised white sides and continuous handrails.
    for(int side=-1;side<=1;side+=2){float x=side*4.15f;
        box((Vec){x,.35f,-6.75f},(Vec){.14f,.7f,34.5f},white);
        for(int z=-23;z<=10;z+=2)beam((Vec){x,.7f,z},(Vec){x,1.08f,z},.032f,rail,6);
        beam((Vec){x,1.08f,-24},(Vec){x,1.08f,10.5f},.035f,rail,6);
        box((Vec){side*3.48f,.01f,1.0f},(Vec){1.16f,.02f,9.8f},red);
        box((Vec){side*2.78f,.026f,1},(Vec){.07f,.015f,9.8f},yellow);
        // Aft casings, passenger deck and bow houses retain the source arrangement.
        box((Vec){side*3.43f,1.32f,-12.5f},(Vec){1.3f,2.64f,17},white);
        box((Vec){side*3.2f,1.2f,8.2f},(Vec){1.9f,2.4f,4.4f},white);
        box((Vec){side*2.91f,.78f,-3.94f},(Vec){.43f,.65f,.08f},red);
        box((Vec){side*2.61f,.25f,-3.8f},(Vec){.12f,.45f,.12f},red);
        box((Vec){side*2.6f,2.77f,6.32f},(Vec){.08f,.8f,.08f},navy);
        box((Vec){side*2.6f,3.2f,6.32f},(Vec){.3f,.67f,.18f},navy);
        for(int l=0;l<3;l++)ellipsoid((Vec){side*2.6f,3.41f-l*.21f,6.44f},(Vec){.075f,.075f,.035f},rgb(l==0?0xf47859:0x354f48),8,4);
    }
    box((Vec){0,2.8f,-12.5f},(Vec){8.4f,.28f,17},white);
    box((Vec){0,3.5f,-13.5f},(Vec){6.8f,1.25f,14},white);
    for(int x=-3;x<=3;x++)box((Vec){x,3.62f,-6.46f},(Vec){.65f,.53f,.04f},rgb(0x356571));
    box((Vec){0,4.22f,-13.5f},(Vec){7.3f,.2f,14.4f},white);
    // Closed bow ramp and red/white vehicle barrier. No ring-out into the sea.
    box((Vec){0,1.34f,10.35f},(Vec){4.6f,2.68f,.24f},rgb(0x426a68));
    for(int i=0;i<12;i++)box((Vec){-2.15f+i*.39f,.94f,5.3f},(Vec){.39f,.16f,.13f},i%2?white:red);
    box((Vec){-2.23f,.46f,5.3f},(Vec){.1f,.9f,.1f},white);box((Vec){2.23f,.46f,5.3f},(Vec){.1f,.9f,.1f},white);
    // Vehicle-lane markings and a chalk sparring rectangle in the clear forward deck.
    for(int z=-22;z<5;z+=3)box((Vec){0,.012f,z},(Vec){.05f,.014f,1.3f},yellow);
    for(int s=-1;s<=1;s+=2){box((Vec){s*2.6f,.027f,0},(Vec){.045f,.018f,5.1f},white);box((Vec){0,.027f,s*2.55f},(Vec){5.2f,.018f,.045f},white);}
    // Mooring bollards and hose reels remain outside the fighting area.
    for(int s=-1;s<=1;s+=2){beam((Vec){s*3.6f,.03f,4.4f},(Vec){s*3.6f,.35f,4.4f},.12f,navy,8);beam((Vec){s*3.8f,.3f,4.4f},(Vec){s*3.4f,.3f,4.4f},.08f,navy,8);}
}
static Vec origin;static float yaw,body_drop,fall;
static Vec local(Vec p){float c=cosf(yaw),s=sinf(yaw);if(fall>0){float y=p.y*cosf(fall)-p.z*sinf(fall),z=p.y*sinf(fall)+p.z*cosf(fall);p.y=y;p.z=z;}return (Vec){origin.x+p.x*c+p.z*s,origin.y+p.y-body_drop,origin.z-p.x*s+p.z*c};}
static void part(Vec p,Vec scale,Colour c){if(fall>0){float y=scale.y*cosf(fall)+scale.z*sinf(fall),z=scale.y*sinf(fall)+scale.z*cosf(fall);scale.y=y;scale.z=z;}ellipsoid(local(p),scale,c,12,7);}
static void limb(Vec a,Vec b,float r,Colour c){beam(local(a),local(b),r,c,8);}
static float attack_pose(const Fighter *f){
    if(f->action!=LIGHT&&f->action!=HEAVY)return 0;
    float start=(float)attack_startup(f->action),end=(float)attack_end(f->action),t=(float)f->frame;
    if(t<start)return -.15f*sinf(t/start*PI);
    if(t<=end)return 1;
    return fmaxf(0,1-(t-end)/(attack_duration(f->action)-end));
}
static void fighter(const Fighter *f,int who,unsigned tick){
    bool thao=who==0;Colour skin=rgb(thao?0xecc6a0:0xe8bd9e),hair=rgb(0x1c1714),shirt=rgb(thao?0xf4f1ea:0xf4d23c),pants=rgb(thao?0x7fb0d8:0x27304d),shoe=rgb(0xf4f1ea);
    bool stunned=f->action==STUN,down=f->action==DOWN;
    if(stunned&&f->frame<6){shirt=rgb(0xffe5cb);skin=rgb(0xffdcbd);}
    origin=(Vec){f->x,.045f,f->z};yaw=atan2f(f->fx,f->fz);
    float pose=attack_pose(f),breath=sinf(tick*.075f+who)*.012f;
    body_drop=f->action==DODGE?.19f:0;fall=down?fminf(f->frame/24.f,1)*1.50f:0;
    disk((Vec){f->x,.038f,f->z},.42f,.30f,rgb(0x3e6261));
    // Distinctive low-poly interpretations of the live cast recipes, not final mesh exports.
    float walk=f->action==IDLE?sinf((f->x+f->z)*14)*.06f:0;
    float head_y=1.57f+breath+(thao?.035f:0);
    part((Vec){0,.94f+breath,.01f},(Vec){.225f,.34f,.16f},shirt);
    part((Vec){0,.66f,0},(Vec){.21f,.13f,.15f},pants);
    limb((Vec){0,1.15f,0},(Vec){0,1.3f,0},.09f,skin);
    for(int side=-1;side<=1;side+=2){
        bool kick=f->action==HEAVY&&side==-1;
        Vec hip={side*.13f,.65f,0},knee={side*.15f,.38f,kick?pose*.56f:side*walk},foot={side*.16f,.105f,kick?pose*.96f:.035f-side*walk};
        if(kick){knee.y+=pose*.28f;foot.y+=pose*.62f;}
        limb(hip,knee,.10f,pants);limb(knee,foot,thao?.067f:.086f,thao?skin:pants);
        part(foot,(Vec){.105f,.07f,.17f},shoe);
        Vec shoulder={side*.235f,1.13f+breath,0},elbow={side*.29f,.96f,.17f},hand={side*.20f,1.16f,.30f};
        if(f->guard){elbow.y=1.15f;hand.y=1.39f;hand.z=.29f;}
        if(side==-1&&f->action==LIGHT){elbow.z+=pose*.26f;elbow.y+=pose*.17f;hand.z+=pose*.55f;hand.y+=pose*.09f;}
        if(stunned){elbow.z=-.05f;hand.z=-.13f;hand.y=.86f;}
        limb(shoulder,add(shoulder,(Vec){side*.06f,-.10f,.05f}),.095f,shirt);
        limb(shoulder,elbow,.07f,skin);limb(elbow,hand,.061f,skin);part(hand,(Vec){.078f,.079f,.073f},skin);
    }
    yaw*=.72f;
    part((Vec){0,head_y,-.015f},(Vec){.34f,.36f,.30f},hair);
    part((Vec){0,head_y-.035f,.067f},(Vec){.305f,.31f,.265f},skin);
    // Scalp cap and side-swept fringe leave the face open.
    part((Vec){0,head_y+.24f,-.01f},(Vec){.325f,.15f,.29f},hair);
    part((Vec){-.13f,head_y+.19f,.22f},(Vec){.17f,.10f,.11f},hair);
    part((Vec){-.30f,head_y-.01f,.02f},(Vec){.06f,.09f,.055f},skin);part((Vec){.30f,head_y-.01f,.02f},(Vec){.06f,.09f,.055f},skin);
    if(thao){
        part((Vec){-.10f,head_y+.36f,-.20f},(Vec){.13f,.14f,.15f},hair);
        for(int j=0;j<4;j++)part((Vec){-.17f+sinf(tick*.09f)*j*.009f,head_y+.38f-j*.10f,-.28f-j*.035f},(Vec){.115f-j*.014f,.11f,.10f},hair);
    }else for(int s=-1;s<=1;s+=2){
        for(int j=0;j<5;j++)part((Vec){s*(.27f+j*.007f),head_y-.12f-j*.105f,-.04f+sinf(tick*.08f)*j*.008f},(Vec){.073f,.084f,.073f},hair);
        part((Vec){s*.30f,head_y-.59f,-.04f},(Vec){.088f,.045f,.075f},rgb(0xf4d23c));
    }
    for(int s=-1;s<=1;s+=2){
        part((Vec){s*.12f,head_y+.015f,.302f},(Vec){.052f,thao?.035f:.059f,.027f},rgb(0xfffaf0));
        part((Vec){s*.12f,head_y+.015f,.326f},(Vec){.026f,thao?.032f:.044f,.012f},rgb(0x2a1d16));
        part((Vec){s*.112f-.008f,head_y+.035f,.337f},(Vec){.010f,.011f,.005f},rgb(0xffffff));
        limb((Vec){s*.07f,head_y+.095f,.30f},(Vec){s*.17f,head_y+.105f,.285f},.012f,hair);
        part((Vec){s*.20f,head_y-.07f,.274f},(Vec){.05f,.022f,.012f},rgb(0xd98d7d));
        if(!thao){
            for(int j=0;j<20;j++){float a=j*2*PI/20,b=(j+1)*2*PI/20;
                limb((Vec){s*.13f+.10f*cosf(a),head_y+.02f+.10f*sinf(a),.339f},(Vec){s*.13f+.10f*cosf(b),head_y+.02f+.10f*sinf(b),.339f},.010f,rgb(0xe06a7a));}
        }
    }
    if(!thao)limb((Vec){-.03f,head_y+.025f,.34f},(Vec){.03f,head_y+.025f,.34f},.009f,rgb(0xe06a7a));
    part((Vec){0,head_y-.045f,.337f},(Vec){.035f,.037f,.040f},skin);
    limb((Vec){-.053f,head_y-.143f,.304f},(Vec){.053f,head_y-.143f,.304f},.014f,rgb(thao?0xb8544a:0xa94f4b));
    if(!thao){
        for(int i=0;i<5;i++){float x=(i%2?-.1f:.1f),y=.81f+i*.06f;part((Vec){x,y,.164f},(Vec){.028f,.03f,.009f},rgb(0xfff5db));}
        part((Vec){0,1.11f,.172f},(Vec){.025f,.029f,.012f},rgb(0xd8ad4b));
    }
    if(f->guard){Vec p=local((Vec){0,1.25f,.47f});ring(p,.24f,rgb(0xa6dfd4));}
}

static void identity(float *m){memset(m,0,16*sizeof(float));m[0]=m[5]=m[10]=m[15]=1;}
static void camera_matrix(float *m,Vec eye,Vec target){
    Vec f=norm(sub(target,eye)),r=norm(cross(f,(Vec){0,1,0})),u=cross(r,f);
    float v[16]={r.x,u.x,-f.x,0,r.y,u.y,-f.y,0,r.z,u.z,-f.z,0,-dot(r,eye),-dot(u,eye),dot(f,eye),1};
    float t=1/tanf(50*PI/360),near=.15f,far=180;
    float p[16]={t/aspect,0,0,0,0,t,0,0,0,0,-(far+near)/(far-near),-1,0,0,-2*far*near/(far-near),0};
    for(int col=0;col<4;col++)for(int row=0;row<4;row++){m[col*4+row]=0;for(int k=0;k<4;k++)m[col*4+row]+=p[k*4+row]*v[col*4+k];}
}
static void bind(unsigned buffer){glBindBuffer(0x8892,buffer);glVertexAttribPointer(0,3,0x1406,0,sizeof(Vertex),(void*)0);glVertexAttribPointer(1,3,0x1406,0,sizeof(Vertex),(void*)sizeof(Vec));}
static void upload(unsigned buffer,unsigned usage){glBindBuffer(0x8892,buffer);glBufferData(0x8892,(ptrdiff_t)used*sizeof(Vertex),vertices,usage);}
static void rect(float x,float y,float w,float h,Colour c){
    float l=x/360-1,r=(x+w)/360-1,t=1-y/360,b=1-(y+h)/360;
    tri((Vec){l,t,0},(Vec){l,b,0},(Vec){r,t,0},c,false);tri((Vec){r,t,0},(Vec){l,b,0},(Vec){r,b,0},c,false);
}
static const char *glyphs[]={
"01110100011000111111100011000110001", /* A */
"11110100011000111110100011000111110",
"01111100001000010000100001000001111",
"11110100011000110001100011000111110",
"11111100001000011110100001000011111",
"11111100001000011110100001000010000",
"01111100001000010111100011000101111",
"10001100011000111111100011000110001",
"11111001000010000100001000010011111",
"00111000100001000010100101001001100",
"10001100101010011000101001001010001",
"10000100001000010000100001000011111",
"10001110111010110101100011000110001",
"10001110011010110011100011000110001",
"01110100011000110001100011000101110",
"11110100011000111110100001000010000",
"01110100011000110001101011001001101",
"11110100011000111110101001001010001",
"01111100001000001110000010000111110",
"11111001000010000100001000010000100",
"10001100011000110001100011000101110",
"10001100011000110001100010101000100",
"10001100011000110101101011101110001",
"10001100010101000100010101000110001",
"10001100010101000100001000010000100",
"11111000010001000100010001000011111",
"01110100011001110101110011000101110", /* 0 */
"00100011000010000100001000010001110",
"01110100010000100110010001000011111",
"11110000010000101110000010000111110",
"00010001100101010010111110001000010",
"11111100001000011110000010000111110",
"01110100001000011110100011000101110",
"11111000010001000100010000100001000",
"01110100011000101110100011000101110",
"01110100011000101111000010000101110"};
static void text(const char *s,float x,float y,float scale,Colour c){
    for(;*s;s++,x+=6*scale){int idx=*s>='A'&&*s<='Z'?*s-'A':*s>='0'&&*s<='9'?26+*s-'0':-1;
        if(idx>=0){const char *p=glyphs[idx];for(int j=0;j<35;j++)if(p[j]=='1')rect(x+(j%5)*scale,y+(j/5)*scale,scale,scale,c);}
        else if(*s=='-')rect(x,y+3*scale,5*scale,scale,c);
        else if(*s==':'){rect(x+2*scale,y+2*scale,scale,scale,c);rect(x+2*scale,y+5*scale,scale,scale,c);}
        else if(*s=='/')for(int j=0;j<7;j++)rect(x+(4-j*4/6)*scale,y+j*scale,scale,scale,c);
    }
}
static void centre(const char *s,float y,float scale,Colour c){text(s,(720-strlen(s)*6*scale)/2,y,scale,c);}
static void panel(float x,float y,float w,float h){rect(x+4,y+5,w,h,rgb(0x244650));rect(x,y,w,h,rgb(0x173640));rect(x,y,w,3,rgb(0xf0cf83));}
static void hud(const Match *m,int player,bool diagnostic){
    Colour paper=rgb(0xf9f0d6),muted=rgb(0xadc7bd),gold=rgb(0xf4ce73),pink=rgb(0xf2a299);
    panel(20,20,680,104);
    centre("JOHANSSON WORLD",32,2,muted);
    text("THAO",38,62,3,paper);text("THUAN",586,62,3,paper);
    for(int i=0;i<2;i++){
        float x=i?403:38;rect(x,95,279,12,rgb(0x304c51));
        float health=m->fighters[i].hp/100*275;
        rect(i?x+277-health:x+2,97,health,8,i?gold:pink);
        for(int j=0;j<2;j++)rect(i?666-j*16:38+j*16,112,9,5,j<m->fighters[i].wins?gold:rgb(0x4c6567));
    }
    char number[32];snprintf(number,sizeof(number),"%02d",(m->remaining+59)/60);centre(number,65,4,paper);
    snprintf(number,sizeof(number),"ROUND %d",m->round);centre(number,100,1.5f,muted);
    panel(20,628,680,72);
    text(player?"YOU: THUAN":"YOU: THAO",36,642,2,paper);text(m->training?"TRAINING":"VS COMPUTER",480,642,2,muted);
    text("X / J  JAB     Y / K  KICK",36,670,2,paper);text("A / L GUARD  B DODGE",412,670,1.7f,muted);
    if(m->phase==TITLE){
        panel(55,160,610,414);centre("FERRY DECK",188,6,paper);centre("FIGHTERS",242,7,gold);
        centre("THAO  VS  THUAN",317,3,pink);centre("MINATO MARU - CAR DECK",353,2,muted);
        centre("START / ENTER TO SPAR",402,3,paper);
        centre("STICK / WASD   MOVE",451,2,muted);centre("TAB / L1   CHANGE FIGHTER",478,2,muted);
        centre("T / R1   TRAINING",505,2,muted);centre("FRIENDLY SPARRING - FIRST TO TWO",543,1.7f,gold);
    }else if(m->phase==READY){
        panel(190,168,340,76);centre(m->phase_ticks>30?"READY":"SPAR",188,5,gold);
    }else if(m->phase==PAUSE){
        panel(95,196,530,251);centre("PAUSED",221,5,paper);centre("START / ENTER TO RESUME",289,2.5f,gold);
        centre("BACK / ESC TO TITLE",335,2.5f,muted);centre("TAB SWAP    T TRAINING",389,2,muted);
    }else if(m->phase==RESULT){
        panel(100,163,520,167);char title[40];snprintf(title,sizeof(title),"%s",m->winner<0?"DRAW":m->winner==0?"THAO WINS":"THUAN WINS");centre(title,186,4,paper);
        centre(m->fighters[0].wins>=2||m->fighters[1].wins>=2?"MATCH COMPLETE":"ROUND COMPLETE",239,2,gold);centre("START / ENTER TO CONTINUE",285,2,muted);
    }
    if(diagnostic){char line[80];snprintf(line,sizeof(line),"NATIVE C / SDL2   %u TRIANGLES",triangles);text(line,25,605,1.5f,paper);}
}
static unsigned compile_shader(unsigned type,const char *source){unsigned s=glCreateShader(type);glShaderSource(s,1,&source,NULL);glCompileShader(s);int ok=0;glGetShaderiv(s,0x8b81,&ok);if(!ok){char log[1024];glGetShaderInfoLog(s,sizeof(log),NULL,log);fprintf(stderr,"Shader: %s\n",log);return 0;}return s;}
bool render_init(bool gles){
    LOAD(glCreateShader);LOAD(glShaderSource);LOAD(glCompileShader);LOAD(glGetShaderiv);LOAD(glGetShaderInfoLog);
    LOAD(glCreateProgram);LOAD(glAttachShader);LOAD(glBindAttribLocation);LOAD(glLinkProgram);LOAD(glGetProgramiv);LOAD(glGetProgramInfoLog);
    LOAD(glDeleteShader);LOAD(glUseProgram);LOAD(glGetUniformLocation);LOAD(glUniformMatrix4fv);LOAD(glGenBuffers);LOAD(glBindBuffer);LOAD(glBufferData);
    LOAD(glEnableVertexAttribArray);LOAD(glVertexAttribPointer);LOAD(glDrawArrays);LOAD(glClearColor);LOAD(glClear);LOAD(glEnable);LOAD(glDisable);
    LOAD(glViewport);LOAD(glReadPixels);LOAD(glPixelStorei);LOAD(glDeleteBuffers);LOAD(glDeleteProgram);LOAD(glGetString);LOAD(glGetError);
    const char *vs="attribute vec3 a_pos;attribute vec3 a_col;uniform mat4 u_mvp;varying vec3 v_col;void main(){v_col=a_col;gl_Position=u_mvp*vec4(a_pos,1.0);}";
    const char *fs=gles?"precision mediump float;varying vec3 v_col;void main(){gl_FragColor=vec4(v_col,1.0);}":"varying vec3 v_col;void main(){gl_FragColor=vec4(v_col,1.0);}";
    unsigned v=compile_shader(0x8b31,vs),f=compile_shader(0x8b30,fs);if(!v||!f)return false;
    program=glCreateProgram();glAttachShader(program,v);glAttachShader(program,f);glBindAttribLocation(program,0,"a_pos");glBindAttribLocation(program,1,"a_col");glLinkProgram(program);
    int ok=0;glGetProgramiv(program,0x8b82,&ok);if(!ok){char log[1024];glGetProgramInfoLog(program,sizeof(log),NULL,log);fprintf(stderr,"Program: %s\n",log);return false;}
    glDeleteShader(v);glDeleteShader(f);glUseProgram(program);matrix_location=glGetUniformLocation(program,"u_mvp");glGenBuffers(3,buffers);
    glEnableVertexAttribArray(0);glEnableVertexAttribArray(1);
    used=0;arena();static_count=used;upload(buffers[0],0x88e4);
    printf("Renderer: %s | %s\n",glGetString(0x1f01),glGetString(0x1f02));
    return true;
}
void render_frame(const Match *m,int player,bool diagnostic){
    platform_size(&width,&height);if(width<1||height<1)return;
    // Preserve the square composition on desktop and handheld without stretching.
    int side=width<height?width:height;glViewport((width-side)/2,(height-side)/2,side,side);aspect=1;
    glClearColor(.65f,.79f,.76f,1);glClear(0x4000|0x100);glEnable(0x0b71);
    float midx=(m->fighters[0].x+m->fighters[1].x)*.5f,midz=(m->fighters[0].z+m->fighters[1].z)*.5f;
    float matrix[16];camera_matrix(matrix,(Vec){midx*.3f,3.5f,5.1f},(Vec){midx*.5f,1.05f,midz*.4f});
    glUniformMatrix4fv(matrix_location,1,0,matrix);bind(buffers[0]);glDrawArrays(4,0,static_count);triangles=static_count/3;
    used=0;fighter(&m->fighters[0],0,m->tick);fighter(&m->fighters[1],1,m->tick);
    if(m->effect_ticks){Colour c=rgb(m->effect_block?0xb1e5dc:0xffe3a2);for(int i=0;i<8;i++){
        float a=i*2*PI/8,r=(12-m->effect_ticks)*.028f;Vec p={m->effect_x+cosf(a)*r,1.16f+sinf(a)*r,m->effect_z};ellipsoid(p,(Vec){.027f,.055f,.027f},c,4,3);}}
    upload(buffers[1],0x88e0);bind(buffers[1]);glDrawArrays(4,0,used);triangles+=used/3;
    glDisable(0x0b71);identity(matrix);glUniformMatrix4fv(matrix_location,1,0,matrix);
    used=0;hud(m,player,diagnostic);upload(buffers[2],0x88e0);bind(buffers[2]);glDrawArrays(4,0,used);
}
bool render_capture(const char *path){
    if(width<=0||height<=0)return false;
    // ES 2.0 guarantees RGBA/UNSIGNED_BYTE readback; RGB is not portable.
    size_t bytes=(size_t)width*height*4;unsigned char *pixels=malloc(bytes),*row=malloc((size_t)width*3);
    if(!pixels||!row){free(pixels);free(row);return false;}
    glPixelStorei(0x0d05,1);glReadPixels(0,0,width,height,0x1908,0x1401,pixels);
    if(glGetError()!=0){free(pixels);free(row);return false;}
    FILE *f=fopen(path,"wb");if(!f){free(pixels);free(row);return false;}fprintf(f,"P6\n%d %d\n255\n",width,height);
    bool ok=true;for(int y=height-1;y>=0;y--){
        for(int x=0;x<width;x++)memcpy(row+x*3,pixels+((size_t)y*width+x)*4,3);
        if(fwrite(row,1,width*3,f)!=(size_t)width*3)ok=false;
    }
    free(row);
    if(fclose(f)!=0)ok=false;
    free(pixels);return ok;
}
void render_close(void){if(program){glDeleteBuffers(3,buffers);glDeleteProgram(program);}}
unsigned render_triangles(void){return triangles;}

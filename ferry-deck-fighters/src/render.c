#include "render.h"
#include "model.h"
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
GL_FN(void,glGenTextures,(int,unsigned*));GL_FN(void,glBindTexture,(unsigned,unsigned));
GL_FN(void,glTexImage2D,(unsigned,int,int,int,int,int,unsigned,unsigned,const void*));GL_FN(void,glTexParameteri,(unsigned,unsigned,int));
GL_FN(void,glDeleteTextures,(int,const unsigned*));GL_FN(void,glUniform1i,(int,int));GL_FN(void,glBlendFunc,(unsigned,unsigned));GL_FN(void,glDepthMask,(unsigned char));GL_FN(void,glCullFace,(unsigned));GL_FN(void,glUniform1f,(int,float));
GL_FN(const unsigned char*,glGetString,(unsigned));GL_FN(unsigned,glGetError,(void));
#define LOAD(n) do{*(void **)(&n)=platform_gl(#n);if(!n){fprintf(stderr,"Missing GL symbol %s\n",#n);return false;}}while(0)

typedef struct {float x,y,z;} Vec;
typedef struct {float r,g,b;} Colour;
typedef struct {Vec p;Colour c;float u,v,mode,alpha;Vec normal;} Vertex;
static NativeModel models[2];static unsigned textures[4];
static Vertex vertices[MAX_VERTICES];static int used,static_count;
static unsigned program,buffers[4],triangles;static int ferry_count,ferry_opaque;static int matrix_location,outline_location;
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
    vertices[used++]=(Vertex){a,colour,0,0,0,1,{0,0,0}};vertices[used++]=(Vertex){b,colour,0,0,0,1,{0,0,0}};vertices[used++]=(Vertex){c,colour,0,0,0,1,{0,0,0}};
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
static void disk(Vec p,float rx,float rz,Colour c){for(int i=0;i<24;i++){float a=i*2*PI/24,b=(i+1)*2*PI/24;tri(p,add(p,(Vec){rx*cosf(a),0,rz*sinf(a)}),add(p,(Vec){rx*cosf(b),0,rz*sinf(b)}),c,false);}}


static void arena(void){
    // Environmental backdrop only. All vessel geometry comes from the World asset.
    box((Vec){0,-1.3f,0},(Vec){180,.2f,180},rgb(0x62aaa9));
    for(int i=0;i<14;i++)box((Vec){(i%2?1:-1)*(12+i*1.8f),-1.17f,-15+i*3.f},(Vec){6,.012f,.035f},rgb(0x9bc8bc));
    ellipsoid((Vec){-23,-1.1f,-40},(Vec){22,6,8},rgb(0x7c9c85),12,4);
    ellipsoid((Vec){27,-1.4f,-47},(Vec){27,5,9},rgb(0x96ab91),12,4);
}

static Vec origin;static float yaw,body_drop,fall,heading_cos,heading_sin,fall_cos,fall_sin;
static Vec local(Vec p){float c=heading_cos,s=heading_sin;if(fall>0){float y=p.y*fall_cos-p.z*fall_sin,z=p.y*fall_sin+p.z*fall_cos;p.y=y;p.z=z;}return (Vec){origin.x+p.x*c+p.z*s,origin.y+p.y-body_drop,origin.z-p.x*s+p.z*c};}
static void fighter(const Fighter *f,int who,unsigned tick){
    NativeModel *m=&models[who];origin=(Vec){f->x,.045f,f->z};yaw=atan2f(f->fx,f->fz);
    body_drop=0;fall=f->action==DOWN?fminf(f->frame/24.f,1)*1.5f:0;
    heading_cos=cosf(yaw);heading_sin=sinf(yaw);fall_cos=cosf(fall);fall_sin=sinf(fall);
    const Vec light_direction=norm((Vec){-.35f,.85f,.55f});
    disk((Vec){f->x,.038f,f->z},.32f,.23f,rgb(0x3e6261));
    model_pose(m,f,yaw,tick);
    for(unsigned i=0;i<m->count;i++){
        if(used>=MAX_VERTICES){fprintf(stderr,"Studio mesh exceeds vertex budget\n");exit(2);}
        float p[3],n[3],ink[3];model_vertex(m,i,p,n,ink);const float *v=m->vertices+i*24;
        float c=heading_cos,s=heading_sin;Vec normal=norm((Vec){n[0]*c+n[2]*s,n[1],-n[0]*s+n[2]*c});
        float l=dot(normal,light_direction);float light=l>.65f?1:l>.05f?.94f:.84f;
        vertices[used++]=(Vertex){local((Vec){p[0],p[1],p[2]}),{v[6]*light,v[7]*light,v[8]*light},v[10],v[11],v[12],v[9],{ink[0]*c+ink[2]*s,ink[1],-ink[0]*s+ink[2]*c}};
    }
}

static void identity(float *m){memset(m,0,16*sizeof(float));m[0]=m[5]=m[10]=m[15]=1;}
static void camera_matrix(float *m,Vec eye,Vec target){
    Vec f=norm(sub(target,eye)),r=norm(cross(f,(Vec){0,1,0})),u=cross(r,f);
    float v[16]={r.x,u.x,-f.x,0,r.y,u.y,-f.y,0,r.z,u.z,-f.z,0,-dot(r,eye),-dot(u,eye),dot(f,eye),1};
    float t=1/tanf(50*PI/360),near=.15f,far=180;
    float p[16]={t/aspect,0,0,0,0,t,0,0,0,0,-(far+near)/(far-near),-1,0,0,-2*far*near/(far-near),0};
    for(int col=0;col<4;col++)for(int row=0;row<4;row++){m[col*4+row]=0;for(int k=0;k<4;k++)m[col*4+row]+=p[k*4+row]*v[col*4+k];}
}
static void bind(unsigned buffer){glBindBuffer(0x8892,buffer);glVertexAttribPointer(0,3,0x1406,0,sizeof(Vertex),(void*)0);glVertexAttribPointer(1,3,0x1406,0,sizeof(Vertex),(void*)sizeof(Vec));glVertexAttribPointer(2,2,0x1406,0,sizeof(Vertex),(void*)offsetof(Vertex,u));glVertexAttribPointer(3,1,0x1406,0,sizeof(Vertex),(void*)offsetof(Vertex,mode));glVertexAttribPointer(4,1,0x1406,0,sizeof(Vertex),(void*)offsetof(Vertex,alpha));glVertexAttribPointer(5,3,0x1406,0,sizeof(Vertex),(void*)offsetof(Vertex,normal));}
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
    text(fighter_style(&m->fighters[0])->name,38,84,1.1f,muted);text(fighter_style(&m->fighters[1])->name,564,84,1.1f,muted);
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
    text("X / J PUNCH   Y / K KICK",36,670,2,paper);text("A / L GUARD  B DODGE",412,670,1.7f,muted);
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
bool render_init(bool gles,const char *assets){
    LOAD(glCreateShader);LOAD(glShaderSource);LOAD(glCompileShader);LOAD(glGetShaderiv);LOAD(glGetShaderInfoLog);
    LOAD(glCreateProgram);LOAD(glAttachShader);LOAD(glBindAttribLocation);LOAD(glLinkProgram);LOAD(glGetProgramiv);LOAD(glGetProgramInfoLog);
    LOAD(glDeleteShader);LOAD(glUseProgram);LOAD(glGetUniformLocation);LOAD(glUniformMatrix4fv);LOAD(glGenBuffers);LOAD(glBindBuffer);LOAD(glBufferData);
    LOAD(glEnableVertexAttribArray);LOAD(glVertexAttribPointer);LOAD(glDrawArrays);LOAD(glClearColor);LOAD(glClear);LOAD(glEnable);LOAD(glDisable);
    LOAD(glViewport);LOAD(glReadPixels);LOAD(glPixelStorei);LOAD(glDeleteBuffers);LOAD(glDeleteProgram);LOAD(glGetString);LOAD(glGetError);
    LOAD(glGenTextures);LOAD(glBindTexture);LOAD(glTexImage2D);LOAD(glTexParameteri);LOAD(glDeleteTextures);LOAD(glUniform1i);LOAD(glBlendFunc);LOAD(glDepthMask);LOAD(glCullFace);LOAD(glUniform1f);
    const char *vs="#ifdef GL_ES\nprecision mediump float;\n#define HIGHP highp\n#else\n#define HIGHP\n#endif\nattribute HIGHP vec3 a_pos;attribute vec3 a_normal;uniform float u_outline;attribute vec3 a_col;attribute vec2 a_uv;attribute float a_mode;attribute float a_alpha;uniform HIGHP mat4 u_mvp;varying vec3 v_col;varying vec2 v_uv;varying float v_mode;varying float v_alpha;void main(){v_col=a_col;v_uv=a_uv;v_mode=a_mode;v_alpha=a_alpha;gl_Position=u_mvp*vec4(a_pos+a_normal*u_outline*.011,1.0);}";
    const char *fragment="varying vec3 v_col;varying vec2 v_uv;varying float v_mode;varying float v_alpha;uniform sampler2D u_map;uniform float u_outline;void main(){vec4 texel=texture2D(u_map,v_uv);vec3 c=v_col;float alpha=v_alpha;if(v_mode>1.5){c*=texel.rgb;alpha*=texel.a;if(alpha<.02)discard;}else if(v_mode>.5)c=mix(c,texel.rgb,texel.a);if(u_outline>.5)c=v_col*vec3(.32,.27,.27);gl_FragColor=vec4(c,alpha);}";
    char fs_buffer[2048];snprintf(fs_buffer,sizeof(fs_buffer),"%s%s",gles?"precision mediump float;":"",fragment);const char *fs=fs_buffer;

    unsigned v=compile_shader(0x8b31,vs),f=compile_shader(0x8b30,fs);if(!v||!f)return false;
    program=glCreateProgram();glAttachShader(program,v);glAttachShader(program,f);glBindAttribLocation(program,0,"a_pos");glBindAttribLocation(program,1,"a_col");glBindAttribLocation(program,2,"a_uv");glBindAttribLocation(program,3,"a_mode");glBindAttribLocation(program,4,"a_alpha");glBindAttribLocation(program,5,"a_normal");glLinkProgram(program);
    int ok=0;glGetProgramiv(program,0x8b82,&ok);if(!ok){char log[1024];glGetProgramInfoLog(program,sizeof(log),NULL,log);fprintf(stderr,"Program: %s\n",log);return false;}
    glDeleteShader(v);glDeleteShader(f);glUseProgram(program);matrix_location=glGetUniformLocation(program,"u_mvp");outline_location=glGetUniformLocation(program,"u_outline");glGenBuffers(4,buffers);
    for(unsigned i=0;i<6;i++)glEnableVertexAttribArray(i);
    glEnable(0x0be2);glBlendFunc(0x0302,0x0303);
    glUniform1i(glGetUniformLocation(program,"u_map"),0);glGenTextures(4,textures);
    for(int i=0;i<3;i++){
        glBindTexture(0x0de1,textures[i]);glTexParameteri(0x0de1,0x2801,0x2601);glTexParameteri(0x0de1,0x2800,0x2601);glTexParameteri(0x0de1,0x2802,0x812f);glTexParameteri(0x0de1,0x2803,0x812f);
        if(i<2){char path[1024];snprintf(path,sizeof(path),"%s/%s.jwf",assets,i?"thuan":"thao");if(!model_load(&models[i],path))return false;NativeModel *m=&models[i];glTexImage2D(0x0de1,0,0x1908,m->width,m->height,0,0x1908,0x1401,m->pixels);free(m->pixels);m->pixels=NULL;printf("%s: %u triangle corners / %u unique deformations\n",i?"Thuan":"Thao",m->count,m->unique_count);}
        else {unsigned char white[4]={255,255,255,255};glTexImage2D(0x0de1,0,0x1908,1,1,0,0x1908,0x1401,white);}
    }
    used=0;arena();static_count=used;upload(buffers[0],0x88e4);
    {NativeModel stage;char path[1024];snprintf(path,sizeof(path),"%s/../ferry/minato-maru.jwf",assets);
     if(!model_load(&stage,path))return false;
     glBindTexture(0x0de1,textures[3]);glTexParameteri(0x0de1,0x2801,0x2601);glTexParameteri(0x0de1,0x2800,0x2601);glTexParameteri(0x0de1,0x2802,0x812f);glTexParameteri(0x0de1,0x2803,0x812f);
     glTexImage2D(0x0de1,0,0x1908,stage.width,stage.height,0,0x1908,0x1401,stage.pixels);
     used=0;for(unsigned i=0;i<stage.count;i++){
      const float *v=stage.vertices+i*24;Vec normal=norm((Vec){v[3],v[4],v[5]});float l=dot(normal,norm((Vec){-.35f,.85f,.55f}));float light=l>.65f?1:l>.05f?.94f:.84f;
      if(used>=MAX_VERTICES){model_free(&stage);return false;}
      vertices[used++]=(Vertex){{v[0],v[1],v[2]},{v[6]*light,v[7]*light,v[8]*light},v[10],v[11],v[12],v[9],{0,0,0}};
     }
     ferry_count=used;ferry_opaque=stage.opaque_count;upload(buffers[3],0x88e4);model_free(&stage);
    }

    printf("Renderer: %s | %s\n",glGetString(0x1f01),glGetString(0x1f02));
    return true;
}
void render_frame(const Match *m,int player,bool diagnostic){
    platform_size(&width,&height);if(width<1||height<1)return;
    // Preserve the square composition on desktop and handheld without stretching.
    int side=width<height?width:height;glViewport((width-side)/2,(height-side)/2,side,side);aspect=1;
    glClearColor(.65f,.79f,.76f,1);glClear(0x4000|0x100);glEnable(0x0b71);
    float midx=(m->fighters[0].x+m->fighters[1].x)*.5f,midz=(m->fighters[0].z+m->fighters[1].z)*.5f;
    float matrix[16];camera_matrix(matrix,(Vec){midx*.3f,2.9f,4.7f},(Vec){midx*.5f,.9f,midz*.4f});
    glUniformMatrix4fv(matrix_location,1,0,matrix);glBindTexture(0x0de1,textures[2]);bind(buffers[0]);glDrawArrays(4,0,static_count);triangles=static_count/3;
    glBindTexture(0x0de1,textures[3]);bind(buffers[3]);glDrawArrays(4,0,ferry_opaque);glDepthMask(0);glDrawArrays(4,ferry_opaque,ferry_count-ferry_opaque);glDepthMask(1);triangles+=ferry_count/3;

    for(int i=0;i<2;i++){
        used=0;fighter(&m->fighters[i],i,m->tick);upload(buffers[1],0x88e0);bind(buffers[1]);glBindTexture(0x0de1,textures[i]);
        int shadow=72,opaque=(int)models[i].opaque_count;
        glEnable(0x0b44);glCullFace(0x0404);glUniform1f(outline_location,1);glDrawArrays(4,shadow,opaque);glUniform1f(outline_location,0);glDisable(0x0b44);
        glDrawArrays(4,0,shadow+opaque);glDepthMask(0);glDrawArrays(4,shadow+opaque,used-shadow-opaque);glDepthMask(1);triangles+=used/3+opaque/3;
    }
    used=0;glBindTexture(0x0de1,textures[2]);
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
void render_close(void){if(program){glDeleteBuffers(4,buffers);glDeleteTextures(4,textures);glDeleteProgram(program);for(int i=0;i<2;i++)model_free(&models[i]);}}
unsigned render_triangles(void){return triangles;}

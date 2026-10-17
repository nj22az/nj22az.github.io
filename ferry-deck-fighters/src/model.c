#define _GNU_SOURCE
#include "model.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdint.h>
#include <dlfcn.h>
static bool u32(FILE *f,uint32_t *v){unsigned char b[4];if(fread(b,1,4,f)!=4)return false;*v=(uint32_t)b[0]|(uint32_t)b[1]<<8|(uint32_t)b[2]<<16|(uint32_t)b[3]<<24;return true;}
static bool f32(FILE *f,float *v){uint32_t bits;if(!u32(f,&bits))return false;memcpy(v,&bits,4);return isfinite(*v);}
void model_free(NativeModel *m){free(m->vertices);free(m->pixels);memset(m,0,sizeof(*m));}
static FILE *open_model(const char *path,void **memory){
 FILE *f=fopen(path,"rb");if(f)return f;
 char compressed[1024];if(snprintf(compressed,sizeof(compressed),"%s.gz",path)>=(int)sizeof(compressed))return NULL;
 void *z=dlopen("libz.so.1",RTLD_NOW|RTLD_LOCAL);if(!z)return NULL;
 void *(*open_gz)(const char*,const char*);int (*read_gz)(void*,void*,unsigned);int (*close_gz)(void*);
 *(void **)(&open_gz)=dlsym(z,"gzopen");*(void **)(&read_gz)=dlsym(z,"gzread");*(void **)(&close_gz)=dlsym(z,"gzclose");
 if(!open_gz||!read_gz||!close_gz){dlclose(z);return NULL;}
 void *stream=open_gz(compressed,"rb");if(!stream){dlclose(z);return NULL;}
 const size_t limit=20*1024*1024;unsigned char *data=malloc(limit);size_t used=0;int got=0;
 if(data)do{got=read_gz(stream,data+used,(unsigned)fmin((double)(limit-used),65536));if(got>0)used+=(unsigned)got;}while(got>0&&used<limit);
 int status=close_gz(stream);dlclose(z);
 if(!data||got<0||status!=0||used==limit||used==0){free(data);return NULL;}
 f=fmemopen(data,used,"rb");if(!f){free(data);return NULL;}*memory=data;return f;
}
bool model_load(NativeModel *m,const char *path){
 memset(m,0,sizeof(*m));void *memory=NULL;FILE *f=open_model(path,&memory);if(!f){fprintf(stderr,"Cannot load Studio fighter: %s\n",path);return false;}
 uint32_t magic,n,b,w,h,o;bool ok=u32(f,&magic)&&u32(f,&n)&&u32(f,&b)&&u32(f,&w)&&u32(f,&h)&&u32(f,&o)&&f32(f,&m->height_m);
 if(!ok||magic!=0x3346574a||n>150000||n%3||b==0||b>MODEL_BONES||w!=512||h!=1024||o>n||o%3||m->height_m<.5f||m->height_m>3)goto fail;
 m->count=n;m->opaque_count=o;m->bone_count=b;m->width=w;m->height=h;
 for(unsigned i=0;i<b;i++){
  ModelBone *bone=&m->bones[i];uint32_t parent;
  if(fread(bone->name,1,32,f)!=32||!u32(f,&parent))goto fail;
  bone->name[31]=0;bone->parent=(int32_t)parent;if(bone->parent>=(int)i||bone->parent< -1)goto fail;
  for(int k=0;k<3;k++)if(!f32(f,&bone->rest[k]))goto fail;
  for(int k=0;k<16;k++)if(!f32(f,&bone->inverse[k]))goto fail;
 }
 m->vertices=malloc((size_t)n*96);m->pixels=malloc((size_t)w*h*4);if(!m->vertices||!m->pixels)goto fail;
 for(unsigned i=0;i<n;i++){
  float *v=m->vertices+i*24;for(int j=0;j<24;j++)if(!f32(f,&v[j]))goto fail;
  float sum=0;for(int j=0;j<4;j++){if(v[13+j]<0||v[13+j]>=b||floorf(v[13+j])!=v[13+j]||v[17+j]<0||v[17+j]>1)goto fail;sum+=v[17+j];}
  if(fabsf(sum-1)>.005f||v[9]<0||v[9]>1||v[12]<0||v[12]>2)goto fail;
 }
 if(fread(m->pixels,1,(size_t)w*h*4,f)!=(size_t)w*h*4||fgetc(f)!=EOF)goto fail;
 fclose(f);free(memory);return true;
fail:fprintf(stderr,"Invalid or incomplete Studio fighter: %s\n",path);fclose(f);free(memory);model_free(m);return false;
}
static void multiply(float *out,const float *a,const float *b){for(int c=0;c<4;c++)for(int r=0;r<4;r++){out[c*4+r]=0;for(int k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];}}
static float pose_amount(const Fighter *f){if(f->action!=LIGHT&&f->action!=HEAVY)return 0;float start=attack_startup(f->action),end=attack_end(f->action),t=f->frame;if(t<start)return -.18f*sinf(t/start*3.14159265f);if(t<=end)return 1;return fmaxf(0,1-(t-end)/(attack_duration(f->action)-end));}
void model_pose(NativeModel *m,const Fighter *f,float yaw,unsigned tick){
 float world[MODEL_BONES][16],amount=pose_amount(f);
 for(unsigned i=0;i<m->bone_count;i++){
  ModelBone *b=&m->bones[i];float x=0,y=0,z=0,dy=0;const char *name=b->name;
  if(!strcmp(name,"hips"))dy=sinf(tick*.075f)*.006f;
  if(!strncmp(name,"shoulder",8)){x=-.62f;z=name[8]=='L'?.13f:-.13f;}
  if(!strncmp(name,"elbow",5))x=-1.65f;
  if(!strcmp(name,"head"))y=-yaw*.25f;
  if(f->guard){if(!strncmp(name,"shoulder",8))x=-.95f;if(!strncmp(name,"elbow",5))x=-1.65f;}
  if(f->action==LIGHT){if(!strcmp(name,"shoulderR"))x=-.62f-amount*.95f;if(!strcmp(name,"elbowR"))x=-1.65f+amount*1.60f;if(!strcmp(name,"chest"))y=-amount*.12f;}
  if(f->action==HEAVY){if(!strcmp(name,"thighR"))x=-amount*1.55f;if(!strcmp(name,"kneeR"))x=amount*.08f;if(!strcmp(name,"spine"))x=amount*.14f;}
  if(f->action==DODGE){if(!strcmp(name,"hips"))dy-=.13f;if(!strncmp(name,"thigh",5))x=-.4f;if(!strncmp(name,"knee",4))x=.8f;if(!strcmp(name,"spine"))x=.3f;}
  if(f->action==STUN){if(!strcmp(name,"chest"))x=-.22f;if(!strcmp(name,"head"))x=-.15f;}
  float a=cosf(x),s=sinf(x),c=cosf(y),d=sinf(y),e=cosf(z),g=sinf(z);
  float local[16]={c*e,a*g+s*d*e,s*g-a*d*e,0,-c*g,a*e-s*d*g,s*e+a*d*g,0,d,-s*c,a*c,0,b->rest[0],b->rest[1]+dy,b->rest[2],1};
  if(b->parent<0)memcpy(world[i],local,sizeof(local));else multiply(world[i],world[b->parent],local);
  multiply(b->skin,world[i],b->inverse);
 }
}
void model_vertex(const NativeModel *m,unsigned index,float p[3],float n[3],float outline[3]){
 const float *v=m->vertices+index*24;p[0]=p[1]=p[2]=n[0]=n[1]=n[2]=outline[0]=outline[1]=outline[2]=0;
 for(int j=0;j<4;j++){float w=v[17+j];if(w<.00001f)continue;const float *s=m->bones[(unsigned)v[13+j]].skin;
  for(int k=0;k<3;k++){p[k]+=w*(s[k]*v[0]+s[4+k]*v[1]+s[8+k]*v[2]+s[12+k]);n[k]+=w*(s[k]*v[3]+s[4+k]*v[4]+s[8+k]*v[5]);outline[k]+=w*(s[k]*v[21]+s[4+k]*v[22]+s[8+k]*v[23]);}}
}

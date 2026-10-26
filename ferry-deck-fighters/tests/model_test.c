#include "../src/model.h"
#include <assert.h>
#include <math.h>
#include <stdio.h>
int main(void){
 const char *names[]={"thao","thuan"};unsigned counts[]={49914,59478};
 for(int who=0;who<2;who++){
  char path[256];snprintf(path,sizeof(path),"assets/characters/%s.jwf",names[who]);NativeModel m;assert(model_load(&m,path));
  assert(m.count==counts[who]&&m.bone_count==28&&m.width==512&&m.height==1024);
  Fighter f={.hp=100,.action=IDLE};model_pose(&m,&f,0,0);unsigned checked=0;
  for(unsigned i=0;i<m.count;i++){
   const float *v=m.vertices+i*24;float p[3],n[3],ink[3];model_vertex(&m,i,p,n,ink);
   for(int k=0;k<3;k++){assert(isfinite(p[k])&&isfinite(n[k]));}
   if(v[13]==5&&v[17]>.9999f){for(int k=0;k<3;k++)assert(fabsf(p[k]-v[k])<.00001f);checked++;}
  }
  assert(checked>5000);assert(m.unique_count>0&&m.unique_count<m.count/4);
  f.style=who?KARATE:KICKBOXING;f.action=LIGHT;f.frame=8;model_pose(&m,&f,0,100);
  unsigned moved=0;for(unsigned i=0;i<m.count;i++){const float *v=m.vertices+i*24;if(v[13]==9&&v[17]>.99f){float p[3],n[3],ink[3];model_vertex(&m,i,p,n,ink);if(fabsf(p[2]-v[2])>.01f)moved++;}}
  assert(moved>100);
  for(int pose=0;pose<3;pose++){
   f.action=pose==0?HEAVY:pose==1?CROSS:DODGE;f.frame=pose==0?18:8;model_pose(&m,&f,.6f,120);
   for(unsigned i=0;i<m.count;i++){float cached[9],reference[9];model_vertex(&m,i,cached,cached+3,cached+6);m.pose_valid=false;model_vertex(&m,i,reference,reference+3,reference+6);m.pose_valid=true;for(int k=0;k<9;k++)assert(cached[k]==reference[k]);}
  }
  printf("PASS deformation cache: %u/%u transforms; exact reference equality for kick, cross and dodge\n",m.unique_count,m.count);
  model_free(&m);printf("PASS %s: exported mesh counts, rest head/hair identity and articulated attack\n",names[who]);
 }
 NativeModel ferry;assert(model_load(&ferry,"assets/ferry/minato-maru.jwf"));assert(ferry.count==102066&&ferry.opaque_count==100236&&ferry.bone_count==1&&ferry.width==2048&&ferry.height==2048);
 float xmin=100,xmax=-100,zmin=100,zmax=-100;unsigned deck=0;
 for(unsigned i=0;i<ferry.count;i++){const float *v=ferry.vertices+i*24;xmin=fminf(xmin,v[0]);xmax=fmaxf(xmax,v[0]);zmin=fminf(zmin,v[2]);zmax=fmaxf(zmax,v[2]);if(fabsf(v[1])<.001f)deck++;}
 assert(xmin< -4&&xmax>4&&zmin< -10&&zmax>10&&deck>100);model_free(&ferry);puts("PASS original ferry export: geometry, atlas, deck origin and structural extent");
 FILE *bad=fopen("build/truncated.jwf","wb");assert(bad);fwrite("JWF3",1,4,bad);fclose(bad);NativeModel m;assert(!model_load(&m,"build/truncated.jwf"));remove("build/truncated.jwf");
 puts("PASS malformed model is rejected");return 0;
}

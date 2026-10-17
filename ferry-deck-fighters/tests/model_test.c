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
  assert(checked>5000);
  f.action=LIGHT;f.frame=8;model_pose(&m,&f,0,100);
  unsigned moved=0;for(unsigned i=0;i<m.count;i++){const float *v=m.vertices+i*24;if(v[13]==9&&v[17]>.99f){float p[3],n[3],ink[3];model_vertex(&m,i,p,n,ink);if(fabsf(p[2]-v[2])>.01f)moved++;}}
  assert(moved>100);model_free(&m);printf("PASS %s: exported mesh counts, rest head/hair identity and articulated attack\n",names[who]);
 }
 FILE *bad=fopen("build/truncated.jwf","wb");assert(bad);fwrite("JWF3",1,4,bad);fclose(bad);NativeModel m;assert(!model_load(&m,"build/truncated.jwf"));remove("build/truncated.jwf");
 puts("PASS malformed model is rejected");return 0;
}

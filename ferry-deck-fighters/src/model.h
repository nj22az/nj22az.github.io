#ifndef FDF_MODEL_H
#define FDF_MODEL_H
#include <stdbool.h>
#include "combat.h"
#define MODEL_BONES 64
/* JWF3 vertex: position, normal, sRGB colour, opacity, atlas UV, texture mode,
 * four bone indices and four weights; 24 little-endian floats (including the source ink expansion vector). */
typedef struct {char name[32];int parent;float rest[3],inverse[16],skin[16];} ModelBone;
typedef struct {unsigned count,opaque_count,bone_count,width,height;float height_m;float *vertices;unsigned char *pixels;ModelBone bones[MODEL_BONES];} NativeModel;
bool model_load(NativeModel *m,const char *path);
void model_free(NativeModel *m);
void model_pose(NativeModel *m,const Fighter *f,float yaw,unsigned tick);
void model_vertex(const NativeModel *m,unsigned index,float position[3],float normal[3],float outline[3]);
#endif

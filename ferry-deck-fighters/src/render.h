#ifndef FDF_RENDER_H
#define FDF_RENDER_H
#include "combat.h"
bool render_init(bool gles);
void render_frame(const Match *m,int player,bool diagnostic);
bool render_capture(const char *path);
void render_close(void);
unsigned render_triangles(void);
#endif

#ifndef FDF_PLATFORM_H
#define FDF_PLATFORM_H
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

/* Narrow, dynamically loaded SDL2 ABI. No vendored SDL implementation or headers.
 * SDL2 opaque handles stay opaque; SDL_Event is oversized/aligned and only its
 * documented Uint32 type is read. Input uses stable scancodes/controller enums. */
typedef struct {
    bool left,right,up,down,light,heavy,guard,dodge,start,back,swap,training,quit,focus_lost;
    float ax,az;
} Controls;
bool platform_open(bool gles,bool fullscreen,int size);
void platform_close(void);
Controls platform_poll(void);
double platform_time(void);
void platform_sleep(unsigned ms);
void platform_swap(void);
void platform_size(int *w,int *h);
void *platform_gl(const char *name);
const char *platform_error(void);
void platform_audio_hit(bool blocked);
#endif

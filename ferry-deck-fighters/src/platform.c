#define _POSIX_C_SOURCE 200809L
#include "platform.h"
#include <dlfcn.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <math.h>

static void *library,*window,*context,*pad;
static unsigned audio_device;
static char failure[256];
#define SDL_FN(ret,name,args) static ret (*name) args
SDL_FN(int,SDL_Init,(uint32_t));SDL_FN(void,SDL_Quit,(void));
SDL_FN(const char*,SDL_GetError,(void));
SDL_FN(void*,SDL_CreateWindow,(const char*,int,int,int,int,uint32_t));
SDL_FN(void,SDL_DestroyWindow,(void*));SDL_FN(int,SDL_GL_SetAttribute,(int,int));
SDL_FN(void*,SDL_GL_CreateContext,(void*));SDL_FN(void,SDL_GL_DeleteContext,(void*));
SDL_FN(int,SDL_GL_SetSwapInterval,(int));SDL_FN(void,SDL_GL_SwapWindow,(void*));
SDL_FN(void*,SDL_GL_GetProcAddress,(const char*));SDL_FN(void,SDL_GL_GetDrawableSize,(void*,int*,int*));
SDL_FN(int,SDL_PollEvent,(void*));SDL_FN(const uint8_t*,SDL_GetKeyboardState,(int*));
SDL_FN(int,SDL_NumJoysticks,(void));SDL_FN(int,SDL_IsGameController,(int));
SDL_FN(void*,SDL_GameControllerOpen,(int));SDL_FN(void,SDL_GameControllerClose,(void*));
SDL_FN(int,SDL_GameControllerGetAttached,(void*));SDL_FN(int16_t,SDL_GameControllerGetAxis,(void*,int));
SDL_FN(uint8_t,SDL_GameControllerGetButton,(void*,int));
typedef struct {int freq;uint16_t format;uint8_t channels,silence;uint16_t samples,padding;uint32_t size;void (*callback)(void*,uint8_t*,int);void *userdata;} AudioSpec;
SDL_FN(uint32_t,SDL_OpenAudioDevice,(const char*,int,const AudioSpec*,AudioSpec*,int));
SDL_FN(void,SDL_PauseAudioDevice,(uint32_t,int));SDL_FN(int,SDL_QueueAudio,(uint32_t,const void*,uint32_t));
SDL_FN(uint32_t,SDL_GetQueuedAudioSize,(uint32_t));SDL_FN(void,SDL_CloseAudioDevice,(uint32_t));
#define LOAD(name) do {*(void **)(&name)=dlsym(library,#name);if(!name){snprintf(failure,sizeof(failure),"Missing SDL2 symbol %s",#name);return false;}}while(0)
bool platform_open(bool gles,bool fullscreen,int size){
    library=dlopen("libSDL2-2.0.so.0",RTLD_NOW|RTLD_LOCAL);
    if(!library){snprintf(failure,sizeof(failure),"SDL2 runtime is required: %s",dlerror());return false;}
    LOAD(SDL_Init);LOAD(SDL_Quit);LOAD(SDL_GetError);LOAD(SDL_CreateWindow);LOAD(SDL_DestroyWindow);
    LOAD(SDL_GL_SetAttribute);LOAD(SDL_GL_CreateContext);LOAD(SDL_GL_DeleteContext);LOAD(SDL_GL_SetSwapInterval);
    LOAD(SDL_GL_SwapWindow);LOAD(SDL_GL_GetProcAddress);LOAD(SDL_GL_GetDrawableSize);LOAD(SDL_PollEvent);LOAD(SDL_GetKeyboardState);
    LOAD(SDL_NumJoysticks);LOAD(SDL_IsGameController);LOAD(SDL_GameControllerOpen);LOAD(SDL_GameControllerClose);
    LOAD(SDL_GameControllerGetAttached);LOAD(SDL_GameControllerGetAxis);LOAD(SDL_GameControllerGetButton);
    LOAD(SDL_OpenAudioDevice);LOAD(SDL_PauseAudioDevice);LOAD(SDL_QueueAudio);LOAD(SDL_GetQueuedAudioSize);LOAD(SDL_CloseAudioDevice);
    if(SDL_Init(0x20|0x2000|0x4000)!=0){snprintf(failure,sizeof(failure),"%s",SDL_GetError());return false;}
    // GLES 2.0 for the handheld; GL 2.1 uses the same shader subset on desktop.
    SDL_GL_SetAttribute(17,2);SDL_GL_SetAttribute(18,gles?0:1);
    SDL_GL_SetAttribute(21,gles?4:0);SDL_GL_SetAttribute(6,24);SDL_GL_SetAttribute(5,1);
    window=SDL_CreateWindow("Johansson World - Ferry Deck Fighters",0x2fff0000,0x2fff0000,size,size,2|32|(fullscreen?0x1001:0));
    if(window)context=SDL_GL_CreateContext(window);
    if(!window||!context){snprintf(failure,sizeof(failure),"%s",SDL_GetError());return false;}
    SDL_GL_SetSwapInterval(1);
    // Audio is optional: video/input remain usable without a sound device.
    if(SDL_Init(0x10)==0){AudioSpec want={.freq=22050,.format=0x8010,.channels=1,.samples=512};
        audio_device=SDL_OpenAudioDevice(NULL,0,&want,NULL,0);if(audio_device)SDL_PauseAudioDevice(audio_device,0);}
    return true;
}
const char *platform_error(void){return failure;}
void platform_close(void){if(audio_device)SDL_CloseAudioDevice(audio_device);if(pad)SDL_GameControllerClose(pad);if(context)SDL_GL_DeleteContext(context);if(window)SDL_DestroyWindow(window);if(SDL_Quit)SDL_Quit();if(library)dlclose(library);}
void *platform_gl(const char *name){return SDL_GL_GetProcAddress(name);}
void platform_size(int *w,int *h){SDL_GL_GetDrawableSize(window,w,h);}
void platform_swap(void){SDL_GL_SwapWindow(window);}
double platform_time(void){struct timespec t;clock_gettime(CLOCK_MONOTONIC,&t);return t.tv_sec+t.tv_nsec/1e9;}
void platform_sleep(unsigned ms){struct timespec t={ms/1000,(long)(ms%1000)*1000000};nanosleep(&t,NULL);}
static float axis(int i){float v=SDL_GameControllerGetAxis(pad,i)/32767.f;return fabsf(v)<.2f?0:copysignf((fabsf(v)-.2f)/.8f,v);}
static bool button(int i){return pad&&SDL_GameControllerGetButton(pad,i)!=0;}
Controls platform_poll(void){
    Controls c={0};union {uint64_t align;uint8_t bytes[128];} event;
    while(SDL_PollEvent(&event)){uint32_t type;memcpy(&type,event.bytes,4);if(type==0x100)c.quit=true;
        // Focus loss freezes the match, including when the OS suspends the window.
        if(type==0x200&&event.bytes[12]==13)c.focus_lost=true;
    }
    if(pad&&!SDL_GameControllerGetAttached(pad)){SDL_GameControllerClose(pad);pad=NULL;}
    if(!pad)for(int i=0;i<SDL_NumJoysticks();i++)if(SDL_IsGameController(i)){pad=SDL_GameControllerOpen(i);break;}
    const uint8_t *k=SDL_GetKeyboardState(NULL);
    c.left=k[4]||k[80]||button(13);c.right=k[7]||k[79]||button(14);
    c.up=k[26]||k[82]||button(11);c.down=k[22]||k[81]||button(12);
    c.light=k[13]||button(2);c.heavy=k[14]||button(3);c.guard=k[15]||button(0);c.dodge=k[44]||button(1);
    c.start=k[40]||button(6);c.back=c.back||k[41]||button(4);c.swap=k[43]||button(9);c.training=k[23]||button(10);
    if(pad){c.ax=axis(0);c.az=axis(1);}
    return c;
}
void platform_audio_hit(bool blocked){
    if(!audio_device||SDL_GetQueuedAudioSize(audio_device)>22050)return;
    int16_t samples[2205];uint32_t noise=0x1234;
    for(int i=0;i<2205;i++){float t=i/22050.f,env=1-i/2205.f;noise=noise*1664525u+1013904223u;
        float n=((noise>>16)/32768.f-1);samples[i]=(int16_t)(env*env*(sinf(t*(blocked?900:170)*6.2831853f)*.6f+n*.4f)*6500);}
    SDL_QueueAudio(audio_device,samples,sizeof(samples));
}

#include "combat.h"
#include "platform.h"
#include "render.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

static void help(void){puts("Ferry Deck Fighters\n  --gles         Request OpenGL ES 2.0 (handheld)\n  --fullscreen   Fullscreen square viewport\n  --demo         AI versus AI\n  --frames N     Exit after N rendered frames\n  --capture PATH Save final native framebuffer as PPM\n  --pose NAME    title, arena, jab, kick, guard, victory\n  --size N       Square window size (default 720)\nControls: WASD/stick move, J/X jab, K/Y kick, L/A guard, Space/B dodge\nEnter/Start start/pause, Escape/Back pause/title, Tab/L1 swap, T/R1 training");}
int main(int argc,char **argv){
    bool gles=false,fullscreen=false,demo=false;int frames=0,size=720;const char *capture=NULL,*pose=NULL,*assets="assets/characters";
    for(int i=1;i<argc;i++){
        if(!strcmp(argv[i],"--assets")&&i+1<argc)assets=argv[++i];
        else if(!strcmp(argv[i],"--gles"))gles=true;else if(!strcmp(argv[i],"--fullscreen"))fullscreen=true;else if(!strcmp(argv[i],"--demo"))demo=true;
        else if(!strcmp(argv[i],"--frames")&&i+1<argc)frames=atoi(argv[++i]);
        else if(!strcmp(argv[i],"--size")&&i+1<argc)size=atoi(argv[++i]);
        else if(!strcmp(argv[i],"--capture")&&i+1<argc)capture=argv[++i];
        else if(!strcmp(argv[i],"--pose")&&i+1<argc)pose=argv[++i];
        else if(!strcmp(argv[i],"--help")){help();return 0;}
        else {fprintf(stderr,"Unknown or incomplete argument: %s\n",argv[i]);return 2;}
    }
    if(size<240||size>2160||frames<0){fprintf(stderr,"Invalid size/frame count\n");return 2;}
    if(!platform_open(gles,fullscreen,size)){fprintf(stderr,"Platform: %s\n",platform_error());platform_close();return 1;}
    if(!render_init(gles,assets)){platform_close();return 1;}
    Match m;match_init(&m);int player=0,count=0;Controls last={0};
    if(demo||pose){match_start(&m);m.phase=FIGHT;}
    if(pose){
        if(!strcmp(pose,"title"))m.phase=TITLE;
        else if(!strcmp(pose,"arena")){}
        else if(!strcmp(pose,"jab")){m.fighters[0].x=-.32f;m.fighters[1].x=.32f;m.fighters[0].action=LIGHT;m.fighters[0].frame=8;}
        else if(!strcmp(pose,"kick")){m.fighters[0].x=-.43f;m.fighters[1].x=.43f;m.fighters[1].action=HEAVY;m.fighters[1].frame=18;}
        else if(!strcmp(pose,"guard")){m.fighters[0].x=-.32f;m.fighters[1].x=.32f;m.fighters[1].guard=true;}
        else if(!strcmp(pose,"victory")){m.phase=RESULT;m.winner=0;m.fighters[0].wins=2;m.fighters[1].hp=0;m.fighters[1].action=DOWN;m.fighters[1].frame=30;}
        else {fprintf(stderr,"Unknown pose: %s\n",pose);render_close();platform_close();return 2;}
    }
    double previous=platform_time(),accumulator=0,start=previous;bool running=true;
    while(running){
        Controls c=platform_poll();if(c.quit)break;
        if(c.focus_lost&&(m.phase==FIGHT||m.phase==READY))match_pause(&m);
        if(c.back&&!last.back){if(m.phase==PAUSE)m.phase=TITLE;else if(m.phase==TITLE)running=false;else match_pause(&m);}
        if(c.start&&!last.start){if(m.phase==TITLE)match_start(&m);else if(m.phase==RESULT)match_next(&m);else match_pause(&m);}
        if(c.swap&&!last.swap&&(m.phase==TITLE||m.phase==PAUSE))player=1-player;
        if(c.training&&!last.training&&(m.phase==TITLE||m.phase==PAUSE))m.training=!m.training;
        double now=platform_time(),elapsed=now-previous;previous=now;if(elapsed>.25)elapsed=.25;accumulator+=elapsed;
        Input pending={.x=c.right-c.left+c.ax,.z=c.down-c.up+c.az,.guard=c.guard,.light=c.light&&!last.light,.heavy=c.heavy&&!last.heavy,.dodge=c.dodge&&!last.dodge};
        // Preserve button edges until a simulation tick consumes them, including at high render rates.
        static bool jab,kick,dodge;jab|=pending.light;kick|=pending.heavy;dodge|=pending.dodge;
        while(accumulator>=1.0/SIM_HZ&&!pose){
            Input a,b;pending.light=jab;pending.heavy=kick;pending.dodge=dodge;
            if(demo){a=match_ai(&m,0);b=match_ai(&m,1);}else if(player==0){a=pending;b=match_ai(&m,1);}else{a=match_ai(&m,0);b=pending;}
            int effect=m.effect_ticks;match_step(&m,a,b);if(m.effect_ticks>effect)platform_audio_hit(m.effect_block);
            jab=kick=dodge=false;accumulator-=1.0/SIM_HZ;
            if(demo&&m.phase==RESULT&&m.phase_ticks>120)match_next(&m);
        }
        if(pose)accumulator=0;
        last=c;render_frame(&m,player,demo);count++;
        if(frames&&count>=frames){if(capture&&!render_capture(capture)){fprintf(stderr,"Capture failed\n");render_close();platform_close();return 1;}break;}
        platform_swap();
        // Vsync is preferred; the limiter also bounds offscreen/non-vsync CPU use.
        double used=platform_time()-now;if(used<1.0/60)platform_sleep((unsigned)((1.0/60-used)*1000));
    }
    printf("Rendered %d frames in %.3f s; scene %u triangles. Device FPS unverified.\n",count,platform_time()-start,render_triangles());
    render_close();platform_close();return 0;
}

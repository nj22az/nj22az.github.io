#include "combat.h"
#include <math.h>
#include <string.h>

static float clampf(float x,float lo,float hi){return x<lo?lo:x>hi?hi:x;}
static uint32_t random_u32(Match *m){uint32_t x=m->rng;x^=x<<13;x^=x>>17;x^=x<<5;return m->rng=x;}
static const StyleDef STYLES[2]={
 {"KICKBOXING",.039f,.087f,.60f,48,0,{
  {"LEAD JAB",5,8,20,15,9,7,.69f,.86f},
  {"ROUNDHOUSE",15,20,40,23,15,16,.89f,.48f},
  {"REAR CROSS",7,10,27,19,12,11,.77f,.80f}}},
 {"OKINAWAN KARATE",.032f,.074f,.82f,56,4,{
  {"LEAD STRAIGHT",9,12,28,20,12,10,.74f,.88f},
  {"FRONT KICK",18,22,44,26,17,19,.98f,.90f},
  {"REVERSE PUNCH",9,12,31,22,14,13,.79f,.86f}}}
};
const StyleDef *fighter_style(const Fighter *f){return &STYLES[f->style==KARATE?1:0];}
const MoveDef *fighter_move(const Fighter *f,Action a){return &fighter_style(f)->moves[a==HEAVY?1:a==CROSS?2:0];}
int attack_startup(const Fighter *f,Action a){return fighter_move(f,a)->startup;}
int attack_end(const Fighter *f,Action a){return fighter_move(f,a)->active_end;}
int attack_duration(const Fighter *f,Action a){return fighter_move(f,a)->duration;}
float attack_reach(const Fighter *f,Action a){return fighter_move(f,a)->reach;}
static bool attacking(Action a){return a==LIGHT||a==HEAVY||a==CROSS;}

static void reset_round(Match *m){
    int w0=m->fighters[0].wins,w1=m->fighters[1].wins;
    memset(m->fighters,0,sizeof(m->fighters));
    m->fighters[0]=(Fighter){.x=-1.12f,.fx=1,.hp=100,.style=KICKBOXING,.wins=w0};
    m->fighters[1]=(Fighter){.x=1.12f,.fx=-1,.hp=100,.style=KARATE,.wins=w1};
    m->remaining=ROUND_TICKS;m->hitstop=0;m->effect_ticks=0;
    m->phase=READY;m->phase_ticks=90;m->winner=-1;
}
void match_init(Match *m){memset(m,0,sizeof(*m));m->rng=0x4d415255u;m->winner=-1;m->round=1;reset_round(m);m->phase=TITLE;}
void match_start(Match *m){m->fighters[0].wins=m->fighters[1].wins=0;m->round=1;reset_round(m);}
void match_next(Match *m){
    if(m->fighters[0].wins>=2||m->fighters[1].wins>=2)match_start(m);
    else {m->round++;reset_round(m);}
}
void match_pause(Match *m){
    if(m->phase==PAUSE)m->phase=m->previous_phase;
    else if(m->phase==FIGHT||m->phase==READY){m->previous_phase=m->phase;m->phase=PAUSE;}
}
static void finish(Match *m){
    float a=m->fighters[0].hp,b=m->fighters[1].hp;
    m->winner=a==b?-1:a>b?0:1;
    if(m->winner>=0)m->fighters[m->winner].wins++;
    for(int i=0;i<2;i++)if(m->fighters[i].hp<=0){m->fighters[i].action=DOWN;m->fighters[i].frame=0;}
    m->phase=RESULT;m->phase_ticks=0;
}
static void update_fighter(Fighter *f,Input in){
    const StyleDef *style=fighter_style(f);f->moving=false;
    if(f->counter_ticks>0)f->counter_ticks--;
    if(f->buffer_ticks>0)f->buffer_ticks--;
    if(in.light){f->buffered=LIGHT;f->buffer_ticks=6;}else if(in.heavy){f->buffered=HEAVY;f->buffer_ticks=6;}
    // Confirmed strings have explicit cancel windows, never arbitrary animation skips.
    if(f->action==LIGHT&&f->connected&&f->buffered==LIGHT&&f->buffer_ticks>0&&f->frame>=attack_end(f,LIGHT)&&f->frame<=attack_end(f,LIGHT)+7){f->action=CROSS;f->frame=0;f->connected=false;f->buffer_ticks=0;}
    if(f->dodge_cooldown>0)f->dodge_cooldown--;
    if(f->guard_stun>0)f->guard_stun--;
    if(f->action!=IDLE){
        f->frame++;
        int length=attacking(f->action)?attack_duration(f,f->action):f->action==DODGE?19:f->stun_ticks>0?f->stun_ticks:20;
        if(f->action!=DOWN&&f->frame>=length){f->action=IDLE;f->frame=0;}
    }
    f->guard=in.guard&&f->action==IDLE;
    f->guard_ticks=f->guard?f->guard_ticks+1:0;
    if(f->action==IDLE&&f->guard_stun==0){
        if(in.dodge&&f->dodge_cooldown==0){f->action=DODGE;f->frame=0;f->dodge_cooldown=style->dodge_cooldown;f->guard=false;}
        else if(!f->guard&&f->buffer_ticks>0){f->action=f->buffered;f->frame=0;f->connected=false;f->buffer_ticks=0;}
    }
    if(f->action!=IDLE&&f->action!=DODGE)return;
    float len=sqrtf(in.x*in.x+in.z*in.z);if(len>1){in.x/=len;in.z/=len;}
    float speed=f->action==DODGE?style->dodge:f->guard?style->walk*.38f:style->walk;
    f->moving=len>.12f;
    f->x=clampf(f->x+in.x*speed,-ARENA_X,ARENA_X);
    f->z=clampf(f->z+in.z*speed,-ARENA_Z,ARENA_Z);
}
static void separate(Match *m){
    Fighter *a=&m->fighters[0],*b=&m->fighters[1];
    float dx=b->x-a->x,dz=b->z-a->z,d=sqrtf(dx*dx+dz*dz);
    if(d<.55f){
        if(d<.001f){dx=1;dz=0;d=1;}
        float push=(.55f-fminf(d,.55f))*.5f;
        // Coincident centres need the full separation even when the direction is substituted.
        if(fabsf(a->x-b->x)+fabsf(a->z-b->z)<.001f)push=.275f;
        a->x=clampf(a->x-dx/d*push,-ARENA_X,ARENA_X);a->z=clampf(a->z-dz/d*push,-ARENA_Z,ARENA_Z);
        b->x=clampf(b->x+dx/d*push,-ARENA_X,ARENA_X);b->z=clampf(b->z+dz/d*push,-ARENA_Z,ARENA_Z);
    }
}
typedef struct {bool hit,blocked,parried;int hitstun,blockstun;float damage,nx,nz;} Hit;
static Hit assess(Fighter *a,Fighter *b){
    Hit h={0};
    if(!attacking(a->action)||a->connected||a->frame<attack_startup(a,a->action)||a->frame>attack_end(a,a->action))return h;
    if(b->action==DOWN||(b->action==DODGE&&b->frame>=2&&b->frame<=12))return h;
    float dx=b->x-a->x,dz=b->z-a->z,d=sqrtf(dx*dx+dz*dz);
    if(d>attack_reach(a,a->action)||d<.001f)return h;
    if((dx*a->fx+dz*a->fz)/d<fighter_move(a,a->action)->cone)return h;
    h.hit=true;h.nx=dx/d;h.nz=dz/d;
    h.blocked=b->guard&&(a->x-b->x)*b->fx+(a->z-b->z)*b->fz>0;
    const MoveDef *move=fighter_move(a,a->action);
    h.parried=h.blocked&&b->guard_ticks<=fighter_style(b)->parry_window;
    h.hitstun=move->hitstun;h.blockstun=move->blockstun;
    h.damage=h.blocked?0:move->damage+(a->counter_ticks>0?4:0)+(attacking(b->action)?3:0);
    return h;
}
void match_step(Match *m,Input a,Input b){
    if(m->phase==TITLE||m->phase==PAUSE)return;
    m->tick++;
    if(m->effect_ticks>0)m->effect_ticks--;
    if(m->phase==RESULT){m->phase_ticks++;for(int i=0;i<2;i++)m->fighters[i].frame++;return;}
    if(m->phase==READY){if(--m->phase_ticks<=0)m->phase=FIGHT;return;}
    if(m->hitstop>0){m->hitstop--;return;}
    m->remaining--;
    update_fighter(&m->fighters[0],a);update_fighter(&m->fighters[1],b);separate(m);
    for(int i=0;i<2;i++){
        Fighter *f=&m->fighters[i],*o=&m->fighters[1-i];
        if(f->action==IDLE||f->action==DODGE){float dx=o->x-f->x,dz=o->z-f->z,d=sqrtf(dx*dx+dz*dz);if(d>.001f){f->fx=dx/d;f->fz=dz/d;}}
    }
    // Assess both before applying either: attacks on the same tick can trade fairly.
    Hit hits[2]={assess(&m->fighters[0],&m->fighters[1]),assess(&m->fighters[1],&m->fighters[0])};
    for(int i=0;i<2;i++)if(hits[i].hit){
        Fighter *f=&m->fighters[i],*o=&m->fighters[1-i];Hit h=hits[i];
        f->connected=true;if(!h.blocked)f->counter_ticks=0;o->hp=fmaxf(0,o->hp-h.damage);
        if(h.parried){o->counter_ticks=40;f->guard_stun=18;f->action=STUN;f->frame=0;f->stun_ticks=18;}
        else if(h.blocked)o->guard_stun=h.blockstun;
        else {o->action=STUN;o->frame=0;o->stun_ticks=h.hitstun;o->guard=false;}
        float push=h.blocked?.08f:f->action==LIGHT?.07f:.18f;
        o->x=clampf(o->x+h.nx*push,-ARENA_X,ARENA_X);o->z=clampf(o->z+h.nz*push,-ARENA_Z,ARENA_Z);
        m->hitstop=h.blocked?3:5;m->effect_ticks=11;m->effect_x=(f->x+o->x)*.5f;m->effect_z=(f->z+o->z)*.5f;m->effect_block=h.blocked;
    }
    if(m->fighters[0].hp<=0||m->fighters[1].hp<=0||m->remaining<=0)finish(m);
}
Input match_ai(Match *m,int who){
    Input in={0};if(m->phase!=FIGHT||m->training)return in;
    Fighter *f=&m->fighters[who],*o=&m->fighters[1-who];
    float dx=o->x-f->x,dz=o->z-f->z,d=sqrtf(dx*dx+dz*dz);
    const StyleDef *style=fighter_style(f);
    if(d>style->preferred_range){in.x=dx/fmaxf(d,.01f)*.72f;in.z=dz/fmaxf(d,.01f)*.72f;}
    // Decisions occur on a fixed cadence; no input reading or instantaneous counters.
    unsigned cadence=f->style==KARATE?59:37;unsigned rhythm=(m->tick+who*13)%cadence;
    in.guard=attacking(o->action)&&o->frame>4&&rhythm<25;
    if(rhythm==0&&d<attack_reach(f,HEAVY)){if(d<=attack_reach(f,LIGHT)&&(f->style==KICKBOXING||random_u32(m)%3==0))in.light=true;else in.heavy=true;}
    if(f->action==LIGHT&&f->connected&&f->frame==attack_end(f,LIGHT)+1)in.light=true;
    if(rhythm==33&&d<.72f){in.dodge=true;in.x=-dx/fmaxf(d,.01f);in.z=.5f;}
    return in;
}

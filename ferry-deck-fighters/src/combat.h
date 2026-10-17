#ifndef FDF_COMBAT_H
#define FDF_COMBAT_H
#include <stdbool.h>
#include <stdint.h>

#define SIM_HZ 60
#define ROUND_TICKS (60 * SIM_HZ)
#define ARENA_X 2.28f
#define ARENA_Z 2.15f

typedef enum { IDLE, LIGHT, HEAVY, CROSS, STUN, DODGE, DOWN } Action;
typedef enum { TITLE, READY, FIGHT, RESULT, PAUSE } Phase;
typedef struct { float x,z; bool light,heavy,guard,dodge; } Input;
typedef enum { KICKBOXING, KARATE } FightingStyle;
typedef struct {const char *name;int startup,active_end,duration,hitstun,blockstun;float damage,reach,cone;} MoveDef;
typedef struct {const char *name;float walk,dodge,preferred_range;int dodge_cooldown,parry_window;MoveDef moves[3];} StyleDef;
typedef struct {
    float x,z,fx,fz,hp;
    FightingStyle style;
    int guard_ticks,counter_ticks,stun_ticks,buffer_ticks;
    Action buffered;
    bool moving;
    Action action;
    int frame,guard_stun,dodge_cooldown,wins;
    bool guard,connected;
} Fighter;
typedef struct {
    Fighter fighters[2];
    Phase phase,previous_phase;
    int phase_ticks,remaining,round,winner,hitstop,effect_ticks;
    float effect_x,effect_z;
    bool effect_block,training;
    uint32_t rng;
    unsigned tick;
} Match;

void match_init(Match *m);
void match_start(Match *m);
void match_next(Match *m);
void match_pause(Match *m);
void match_step(Match *m,Input a,Input b);
Input match_ai(Match *m,int who);
const StyleDef *fighter_style(const Fighter *f);
const MoveDef *fighter_move(const Fighter *f,Action a);
int attack_startup(const Fighter *f,Action a);
int attack_end(const Fighter *f,Action a);
int attack_duration(const Fighter *f,Action a);
float attack_reach(const Fighter *f,Action a);
#endif

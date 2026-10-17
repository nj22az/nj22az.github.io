#ifndef FDF_COMBAT_H
#define FDF_COMBAT_H
#include <stdbool.h>
#include <stdint.h>

#define SIM_HZ 60
#define ROUND_TICKS (60 * SIM_HZ)
#define ARENA_X 2.28f
#define ARENA_Z 2.15f

typedef enum { IDLE, LIGHT, HEAVY, STUN, DODGE, DOWN } Action;
typedef enum { TITLE, READY, FIGHT, RESULT, PAUSE } Phase;
typedef struct { float x,z; bool light,heavy,guard,dodge; } Input;
typedef struct {
    float x,z,fx,fz,hp;
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
int attack_startup(Action a);
int attack_end(Action a);
int attack_duration(Action a);
float attack_reach(Action a);
#endif

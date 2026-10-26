#include "../src/combat.h"
#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <string.h>

static const Input none={0};
static Match setup(void){Match m;match_init(&m);match_start(&m);for(int i=0;i<90;i++)match_step(&m,none,none);assert(m.phase==FIGHT);return m;}
static void close_range(Match *m){m->fighters[0].x=-.32f;m->fighters[1].x=.32f;}
static void step(Match *m,int n,Input a,Input b){for(int i=0;i<n;i++)match_step(m,a,b);}
int main(void){
    Match m=setup();close_range(&m);
    match_step(&m,(Input){.light=true},none);step(&m,4,none,none);assert(m.fighters[1].hp==100);
    match_step(&m,none,none);assert(m.fighters[1].hp==93);step(&m,40,none,none);assert(m.fighters[1].hp==93);
    puts("PASS startup, active window, damage and one hit per attack");
    m=setup();m.fighters[0].x=-2;m.fighters[1].x=2;match_step(&m,(Input){.heavy=true},none);step(&m,50,none,none);assert(m.fighters[1].hp==100);
    puts("PASS attacks cannot hit out of range");
    m=setup();close_range(&m);match_step(&m,(Input){.light=true},(Input){.guard=true});step(&m,12,none,(Input){.guard=true});assert(m.fighters[1].hp==100);assert(m.effect_block);
    puts("PASS frontal guard prevents damage");
    m=setup();close_range(&m);match_step(&m,(Input){.light=true},none);step(&m,2,none,none);match_step(&m,none,(Input){.dodge=true});step(&m,5,none,none);assert(m.fighters[1].hp==100);
    puts("PASS dodge invulnerability timing");
    m=setup();close_range(&m);m.fighters[1].style=KICKBOXING;match_step(&m,(Input){.heavy=true},(Input){.heavy=true});step(&m,15,none,none);assert(m.fighters[0].hp==81&&m.fighters[1].hp==81);
    puts("PASS simultaneous attacks trade symmetrically");
    m=setup();m.fighters[0].z=1.6f;m.fighters[1].z=-1.6f;step(&m,600,(Input){.x=-1},(Input){.x=1});assert(fabsf(m.fighters[0].x)<=ARENA_X&&fabsf(m.fighters[1].x)<=ARENA_X);
    puts("PASS deck boundary containment");
    m=setup();Match saved=m;match_pause(&m);step(&m,100,(Input){.heavy=true,.x=1},none);assert(m.tick==saved.tick&&m.remaining==saved.remaining&&m.fighters[0].x==saved.fighters[0].x);match_pause(&m);assert(m.phase==FIGHT);
    puts("PASS pause freezes timer, input and simulation");
    m=setup();m.remaining=1;match_step(&m,none,none);assert(m.phase==RESULT&&m.winner==-1);assert(m.fighters[0].wins==0&&m.fighters[1].wins==0);
    puts("PASS timeout draw does not award a win");
    m=setup();close_range(&m);m.fighters[1].hp=7;match_step(&m,(Input){.light=true},none);step(&m,8,none,none);assert(m.phase==RESULT&&m.winner==0&&m.fighters[0].wins==1&&m.fighters[1].action==DOWN);
    match_next(&m);assert(m.round==2&&m.fighters[0].wins==1&&m.fighters[1].hp==100);m.fighters[0].wins=2;match_next(&m);assert(m.round==1&&m.fighters[0].wins==0);
    puts("PASS knockout, round progression and match reset");
    m=setup();Match n=m;for(int i=0;i<6000;i++){Input a=match_ai(&m,0),b=match_ai(&m,1);Input c=match_ai(&n,0),d=match_ai(&n,1);match_step(&m,a,b);match_step(&n,c,d);}
    assert(memcmp(&m,&n,sizeof(m))==0);assert(m.phase==RESULT);assert(m.fighters[0].hp<100||m.fighters[1].hp<100);
    puts("PASS reproducible AI match reaches a result");
    m=setup();m.training=true;Input ai=match_ai(&m,1);assert(!ai.light&&!ai.heavy&&ai.x==0&&ai.z==0);
    puts("PASS training opponent stays passive");
    m=setup();assert(attack_startup(&m.fighters[0],LIGHT)<attack_startup(&m.fighters[1],LIGHT));assert(attack_reach(&m.fighters[1],HEAVY)>attack_reach(&m.fighters[0],HEAVY));
    float x0=m.fighters[0].x,x1=m.fighters[1].x;match_step(&m,(Input){.z=1},(Input){.z=1});assert(m.fighters[0].z>m.fighters[1].z&&m.fighters[0].x==x0&&m.fighters[1].x==x1);
    puts("PASS styles have distinct timing, range and footwork");
    m=setup();close_range(&m);match_step(&m,(Input){.light=true},none);step(&m,3,none,none);step(&m,2,none,(Input){.guard=true});assert(m.fighters[1].hp==100&&m.fighters[1].counter_ticks>0&&m.fighters[0].action==STUN);
    puts("PASS timed karate guard deflects and opens counter window");
    m=setup();close_range(&m);step(&m,10,none,(Input){.guard=true});match_step(&m,(Input){.light=true},(Input){.guard=true});step(&m,6,none,(Input){.guard=true});assert(m.fighters[0].action==LIGHT&&m.fighters[1].counter_ticks==0&&m.fighters[1].hp==100);
    puts("PASS sustained guard blocks without repeated deflections");
    m=setup();close_range(&m);match_step(&m,(Input){.light=true},none);while(m.fighters[0].frame<9)match_step(&m,none,none);match_step(&m,(Input){.light=true},none);assert(m.fighters[0].action==CROSS);step(&m,8,none,none);assert(m.fighters[1].hp==82);
    puts("PASS confirmed jab cross connects inside explicit cancel window");
    m=setup();match_step(&m,(Input){.light=true},none);step(&m,10,none,none);match_step(&m,(Input){.light=true},none);assert(m.fighters[0].action==LIGHT);step(&m,15,none,none);assert(m.fighters[0].action==IDLE);
    puts("PASS whiff cannot cancel and stale buffered input expires");
    puts("16 combat groups passed");return 0;
}

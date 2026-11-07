// Ball's game alone (camera/ball.js createBallGame): the hands swing together to a side; the balls set out one after
// another on their own ticks of the crossing so no two ever come down on the same tick; a ball is caught when the hands
// are on its side as it comes down and thrown straight back; a catch is ten points and quickens the tempo, a drop ends
// the game, a third ball joins at a hundred, every hundred gives a breather, five hundred is won once.
// Run: node camera/tests/ball.test.mjs
import assert from 'node:assert/strict';
import {createBallGame,STEPS,CATCH_POINTS,WIN_SCORE,THIRD_BALL_AT,TEMPO} from '../ball.js';

const landingSide=b=>b.from==='left'?'right':'left';
const aboutToLand=b=>Math.abs(b.pos-(b.from==='left'?STEPS-1:0))===1;

{const game=createBallGame(),s=game.state;
 assert.equal(s.hands,'left');assert.equal(s.balls.length,0);
 game.tick();assert.equal(s.balls.length,1,'the first ball sets out from the left on the first tick');assert.equal(s.balls[0].pos,1);
 game.tick();game.tick();assert.equal(s.balls.length,1);
 game.tick();assert.equal(s.balls.length,2,'the second from the right on the fourth');assert.equal(s.balls[1].from,'right');assert.equal(s.balls[1].pos,STEPS-2);
 game.tick();
 // The first ball comes down on the right on the sixth tick: the hands are still on the left, so it drops.
 const miss=game.tick();assert.deepEqual(miss.map(e=>e.type),['miss']);assert.equal(s.over,true);assert.equal(s.balls[0].dropped,true);assert.equal(s.score,0);
 assert.deepEqual(game.tick(),[],'nothing moves after a drop');game.moveHands('right');assert.equal(s.hands,'left','nor the hands');
}
{const game=createBallGame(),s=game.state;
 for(let i=0;i<5;i++)game.tick();
 game.moveHands('right');const ev=game.tick();
 assert.deepEqual(ev.map(e=>e.type),['catch']);assert.equal(s.score,CATCH_POINTS);assert.equal(s.caught,1);
 assert.equal(s.balls[0].from,'right','thrown straight back from the hand that caught it');assert.equal(s.balls[0].pos,STEPS-1);
 assert.equal(s.tempo,Math.round(TEMPO.start*TEMPO.quicken),'the tempo quickens');
 game.moveHands('up');assert.equal(s.hands,'right','only left or right');
}
// Played perfectly (the hands swung to each ball's side a tick before it comes down), the score climbs, a third ball
// joins at a hundred, every hundred gives a breather, five hundred is reported once, the tempo never drops below its
// floor, no two balls ever come down on the same tick and no two share a segment going the same way.
{const game=createBallGame(),s=game.state;let wins=0,thirds=0,hundreds=0,breathers=0;
 for(let t=0;t<3000&&!s.over;t++){
  const landing=s.balls.filter(aboutToLand);
  assert.ok(landing.length<=1,`two balls coming down on tick ${t+1}`);
  if(landing.length)game.moveHands(landingSide(landing[0]));
  const before=s.tempo,ev=game.tick();
  wins+=ev.filter(e=>e.type==='win').length;thirds+=ev.filter(e=>e.type==='third').length;
  if(ev.some(e=>e.type==='hundred')){hundreds++;if(before<TEMPO.start)assert.ok(s.tempo>=before,'a breather at each hundred');breathers++;}
  const seen=new Set();for(const b of s.balls){const key=`${b.from}:${b.pos}`;assert.ok(!seen.has(key),`two balls at ${key} on tick ${t+1}`);seen.add(key);}
  if(s.score>=THIRD_BALL_AT+60)assert.equal(s.balls.length,3,'three balls after a hundred');
 }
 assert.equal(s.over,false,'a perfect game never drops');assert.ok(s.score>WIN_SCORE);assert.equal(wins,1,'five hundred reported once');assert.equal(thirds,1);
 assert.ok(hundreds>=5&&breathers===hundreds);assert.ok(s.tempo>=TEMPO.floor);assert.equal(s.score,s.caught*CATCH_POINTS);
}
console.log('ball: the hands swing to a side, the balls set out apart, catches and the drop, the third ball, breathers, five hundred once');

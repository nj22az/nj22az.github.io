import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LANDMARK_LOTS,localToWorld} from '../src/world/landmark-lots.js';


test('Landmark placements face the walking street at the canal quarter doors',()=>{
 const sakura=LANDMARK_LOTS.find(l=>l.id==='sakura'),ramen=LANDMARK_LOTS.find(l=>l.id==='ramen'),home=LANDMARK_LOTS.find(l=>l.id==='yuri-home');
 assert.ok(Math.abs(sakura.yaw-Math.PI)<1e-6);assert.ok(Math.abs(ramen.yaw-Math.PI)<1e-6);
 assert.ok(Math.abs(home.yaw-Math.PI/2)<1e-6,'Thuan’s house faces the canal boardwalk');
 assert.ok(sakura.scale.y>=.9,'Konbini keeps a full building height on the street');
 assert.ok(ramen.scale.y>=.9,'Ramen keeps a full building height on the street');
 assert.ok(home.scale.y>=.9,'Thuan’s house keeps a two-storey height on the canal');
 const [sx,sz]=localToWorld(sakura.x,sakura.z,sakura.yaw,sakura.scale,0,.85);
 assert.ok(sz<sakura.z,'Sakura door is on the street side of the lot');
 assert.ok(sx>4&&sx<10);
 const [rx,rz]=localToWorld(ramen.x,ramen.z,ramen.yaw,ramen.scale,.65,4.7);
 assert.ok(rz<3.5,'Ramen door sits on the walking street');
 assert.ok(rx>-13&&rx<-6);
 const [hx,hz]=localToWorld(home.x,home.z,home.yaw,home.scale,.077,3.374);
 assert.ok(hx>home.x,'Thuan’s door is on the canal side of the lot');
 assert.ok(hx>-5.3&&hx<-4.8);
 assert.ok(hz>11&&hz<12);
});

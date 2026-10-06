// A fixed, bounded route through the real MCP server; larger tours remain local.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {TourClient} from './tour-client.mjs';

const tour=new TourClient('ci-smoke');
const report={passed:false,checks:[]};
const clean=()=>{
 assert.deepEqual(tour.state.errors,[], 'Browser errors');
 assert.deepEqual(tour.state.invalidTransforms,[], 'Invalid scene transforms');
 assert.ok(tour.state.game.player.every(Number.isFinite), 'Finite player position');
};
const deadline=setTimeout(()=>{console.error('MCP CI smoke exceeded five minutes');process.exit(1);},300000);
try{
 await tour.connect();
 await tour.call('start_session',{spawn:'sakura-bench',time:'12:00'});
 assert.equal(tour.state.ui.running,true);assert.equal(tour.state.seated,true);clean();
 report.checks.push('boot');
 const move=await tour.call('press_control',{control:'forward',durationMs:350});
 assert.equal(move.accepted,true);assert.ok(move.displacement>.3);assert.equal(tour.state.seated,false);clean();
 report.checks.push('movement');
 if(tour.state.view.thirdPerson)await tour.call('press_control',{control:'view',durationMs:34});
 const walk=await tour.call('follow_path',{points:[{x:-2,z:-20.5},{x:-2,z:-32.73},{x:-5.8,z:-32.73}],maxSeconds:30});
 assert.equal(walk.reached,true,'Reach the vending machine through real controls');
 await tour.face(-7,-32.73);await tour.call('press_control',{control:'interact',durationMs:16});
 const wallet=()=>Number(tour.state.ui.wallet.replace(/[^\d]/g,''));
 const yen=wallet();assert.ok(Number.isFinite(yen)&&yen>=120);
 assert.ok(tour.state.ui.activity?.actions.some(a=>a.label==='Dockside Coffee · ¥120'));
 assert.equal((await tour.call('choose_action',{label:'Dockside Coffee · ¥120'})).accepted,true);
 assert.equal(wallet(),yen-120,'Purchase charges once');
 await tour.call('press_control',{control:'close',durationMs:16});clean();
 report.checks.push('interaction');
 const approach=await tour.call('follow_path',{points:[{x:-2,z:-32.73},{x:-2,z:-27.3},{x:-4.4,z:-27.3}],maxSeconds:20});
 assert.equal(approach.reached,true,'Reach Sakura doorway');
 const shop=tour.state.sites.find(s=>s.id==='market');assert.ok(shop?.door);
 await tour.face(shop.door[0],shop.door[2]);
 await tour.call('press_control',{control:'interact',durationMs:16});
 // Asynchronous room assets may complete between deterministic simulation ticks.
 const roomDeadline=performance.now()+30000;
 while((tour.state.game.room!=='market'||tour.state.blocked.roomLoading)&&performance.now()<roomDeadline)await tour.call('wait',{durationMs:100});
 assert.equal(tour.state.game.room,'market');assert.equal(tour.state.blocked.roomLoading,false);clean();
 report.checks.push('interior transition');
 await tour.shot('interior');clean();
 assert.equal((await tour.call('get_state')).ui.running,true);
 report.checks.push('clean state and screenshot');report.passed=true;
 console.log('MCP CI smoke passed: '+report.checks.join(', '));
}catch(error){report.failure=error.stack;try{await tour.shot('failure');}catch(captureError){report.captureFailure=captureError.message;}throw error;
}finally{
 try{await writeFile(resolve(tour.output,'report.json'),JSON.stringify(report,null,2)+'\n');}finally{await tour.close();clearTimeout(deadline);}
}

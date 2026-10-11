#!/usr/bin/env node
/**
 * The live check for Sakura's products: walk into Sakura Shōten through the johansson-town-audit MCP server (real
 * keyboard and camera, no teleporting), stop in front of the cold cabinet, look at the beer column, pick up a can of
 * Umineko lager (the close-up), and screenshot each. With --source the game runs from src/ as it is on disk, so a change
 * can be walked before runtime/ is rebuilt.
 *
 *   node johansson-town/tools/studio/cabinet-walk.mjs <label> [--source] [--phone]
 *
 * Screenshots go to output/studio-mcp/walks/<label>/ (git ignores it). Compare two walks by eye: people and the clock
 * move, so the pictures are not expected to match pixel for pixel; the products must look the same.
 */
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {TourClient} from '../mcp/tour-client.mjs';

const label=process.argv[2];
if(!/^[a-z0-9][a-z0-9.-]{0,40}$/.test(label||'')){console.error('Usage: cabinet-walk.mjs <label> [--source] [--phone]');process.exit(2);}
const source=process.argv.includes('--source'),viewport=process.argv.includes('--phone')?'phone':'desktop';
const client=new TourClient('studio-cabinet');
client.output=resolve(fileURLToPath(new URL('../../../output/studio-mcp/walks/',import.meta.url)),label);
const report={label,source,viewport,shots:[]};
try{
 await mkdir(resolve(client.output,'calls'),{recursive:true});
 // The audit server with this process's environment (where Playwright finds Chromium), and a source start loads every
 // module on its own and can take minutes, so every call gets the time it needs.
 client.client=new Client({name:'studio-cabinet-walk',version:'1'});
 client.transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../mcp/server.mjs',import.meta.url))],env:process.env,stderr:'pipe'});
 await client.client.connect(client.transport,{timeout:240000});client.connected=true;
 const raw=client.client.callTool.bind(client.client);client.client.callTool=(params,options)=>raw(params,{...options,timeout:900000});
 await client.call('start_session',{viewport,spawn:'sakura-bench',time:'12:00',source});
 await client.call('press_control',{control:'interact',durationMs:16});await client.settle();
 if(client.state.view.thirdPerson)await client.call('press_control',{control:'view',durationMs:34});
 const shop=client.state.sites.find(s=>s.id==='market'&&s.door);
 if(!shop)throw Error('Sakura Shōten is not among the sites: '+client.state.sites.map(s=>s.id).join(', '));
 const entered=await client.enter(shop);
 if(!entered.entered)throw Error('Could not walk into Sakura Shōten: '+JSON.stringify(entered.reason||entered));
 report.room=client.state.game.room;
 const shoot=async(name,x,z,face,down=12)=>{
  const walk=await client.navigate(x,z,{inside:true,tolerance:.45});
  await client.face(face[0],face[1]);await client.call('look',{degrees:0,verticalDegrees:down});
  const state=await client.shot(name);report.shots.push({name,walk:walk.reached,player:state.game.player,errors:state.errors});
 };
 await shoot('cold-cabinet',.4,-2.35,[.4,-3.48],8);
 await shoot('beer-column',2.39,-2.62,[2.39,-3.48],14);
 const examine=client.state.targets.find(t=>/^Examine .*Umineko lager/.test(t.label));
 if(examine){
  await client.face(examine.position[0],examine.position[2]);
  await client.call('press_control',{control:'interact',durationMs:16});await client.call('wait',{durationMs:1500});
  const state=await client.shot('beer-close-up');report.shots.push({name:'beer-close-up',viewer:state.blocked?.viewer??null,errors:state.errors});
  await client.call('press_control',{control:'close',durationMs:34});
 }else report.shots.push({name:'beer-close-up',missing:'No "Examine … Umineko lager" target in reach.'});
 report.passed=true;
 console.log(JSON.stringify(report,null,1));
}catch(error){report.failure=error.message;console.error(error.message);process.exitCode=1;}
finally{await writeFile(resolve(client.output,'report.json'),JSON.stringify(report,null,1)+'\n').catch(()=>{});await client.close();}

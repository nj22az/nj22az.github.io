#!/usr/bin/env node
/**
 * The johansson-studio MCP server (.mcp.json): Claude's way into Johansson Studio, to look at and change the town's
 * characters (and, from stage 2, its products and labels). Every tool is also on the command line (cli.mjs), for when
 * the host times the connection out. Startup loads only the SDK, zod and the tool table; World's code loads on the
 * first call and Chromium only for a render. Write tools are dry runs unless dryRun:false, and nothing commits.
 * How to use it: avatar-creator/docs/STUDIO-MCP.md.
 */
import {McpServer} from '@modelcontextprotocol/server';
import {StdioServerTransport} from '@modelcontextprotocol/server/stdio';
import * as z from 'zod';
import {TOOLS,context,callTool} from './tools.mjs';

const server=new McpServer({name:'johansson-studio',version:'1.0.0'},{instructions:'Johansson Studio: the town\'s characters (and, from stage 2, its products and labels). Look first (character_list, character_get, render_portrait), then change with a dry run, show the creator, and apply with dryRun:false only when they agree. Writes go to Studio\'s data, never to git: World changes only when the creator says "update World" (publish_check, then commit, merge main, push, check the live workflow).'});
const ctx=await context();
let queue=Promise.resolve();
const serial=task=>{const run=queue.then(task);queue=run.catch(()=>{});return run;};
const text=data=>({content:[{type:'text',text:JSON.stringify(data,null,1)}]});
for(const tool of TOOLS){
 server.registerTool(tool.name,{description:tool.description,inputSchema:z.fromJSONSchema(tool.input),
  annotations:{readOnlyHint:!!tool.readOnly,destructiveHint:false,idempotentHint:!!tool.readOnly,openWorldHint:false}},
  args=>serial(async()=>{
   const result=await callTool(tool.name,args,ctx);
   if(result?.error)return {...text(result),isError:true};
   if(tool.image)return {content:[{type:'image',data:result.image,mimeType:result.mimeType},{type:'text',text:JSON.stringify(result.data)}]};
   return text(result);
  }));
}
let stopping=null;
const shutdown=()=>stopping??=(async()=>{await queue;await ctx.close();await server.close();})();
process.once('SIGINT',()=>shutdown().finally(()=>process.exit(0)));process.once('SIGTERM',()=>shutdown().finally(()=>process.exit(0)));
process.stdin.once('end',()=>shutdown());
await server.connect(new StdioServerTransport());

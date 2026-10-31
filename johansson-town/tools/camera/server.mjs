#!/usr/bin/env node
/** Local stdio MCP server. No public HTTP MCP endpoint, personal profile, capture or publishing tool. */
import {McpServer} from '@modelcontextprotocol/server';
import {StdioServerTransport} from '@modelcontextprotocol/server/stdio';
import * as z from 'zod';
import {CameraSession} from './session.mjs';
import {TOOLS,callTool} from './tools.mjs';

const session=new CameraSession();
const server=new McpServer({name:'johansson-camera',version:'1.0.0'},{instructions:'Operate Johansson Pocket Camera through its real editor. Open, inspect catalog, import only user-approved images, edit and preview. Preview returns image pixels to the AI host. Save and export only on request with confirm:true. All saves are copies. The isolated album lasts only until close; export anything to keep. Never imply this is the user\'s iPhone album, a live Safari connection, a cloud service or a published site change. No camera capture, deletion, native sharing or deployment tools are provided.'});
let queue=Promise.resolve(),stopping=false;
const serial=fn=>{const task=queue.then(fn);queue=task.catch(()=>{});return task;};
const text=value=>({content:[{type:'text',text:JSON.stringify(value,null,2)}]});
for(const tool of TOOLS){
 server.registerTool(tool.name,{description:tool.description,inputSchema:z.fromJSONSchema(tool.input),annotations:{readOnlyHint:!!tool.readOnly,destructiveHint:!!tool.destructive,idempotentHint:!!tool.readOnly,openWorldHint:false}},(args,extra)=>serial(async()=>{
  const signal=extra?.mcpReq?.signal??extra?.signal;
  if(stopping||signal?.aborted)return {...text({error:'Camera request was cancelled.'}),isError:true};
  // Cancellation closes the private session so no abandoned edit/save keeps running. Exports remain on disk.
  const cancel=()=>{void session.close();};signal?.addEventListener('abort',cancel,{once:true});
  try{
   const result=await callTool(tool.name,args,session);
   if(signal?.aborted)throw Error('Cancelled; the temporary browser session was closed.');
   return result?.image?{content:[{type:'image',data:result.image,mimeType:result.mimeType},{type:'text',text:JSON.stringify(result.data)}]}:text(result);
  }catch(error){return {...text({error:error.message}),isError:true};}
  finally{signal?.removeEventListener('abort',cancel);}
 }));
}
let stoppingTask;
function shutdown(){return stoppingTask??=(async()=>{stopping=true;await session.close();await queue;await server.close();})();}
process.once('SIGINT',()=>shutdown().finally(()=>process.exit(0)));
process.once('SIGTERM',()=>shutdown().finally(()=>process.exit(0)));
process.stdin.once('end',()=>{void shutdown();});
await server.connect(new StdioServerTransport());

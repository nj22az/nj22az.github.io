const {app,BrowserWindow,protocol,net,session,ipcMain,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {writeSnapshot,readSnapshot}=require('./storage.cjs');
const {createUpdater}=require('./updater.cjs');
app.setName('Johansson World');
protocol.registerSchemesAsPrivileged([{scheme:'johansson',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true}}]);
let window,readyToClose=false,updater;
const root=path.join(__dirname,'site');
const saveDir=()=>path.join(app.getPath('userData'),'saves');
if(!process.argv.includes('--smoke')&&!app.requestSingleInstanceLock())app.quit();
app.on('second-instance',()=>{window?.show();window?.focus();});
app.whenReady().then(async()=>{
 // A stable local origin preserves all world/Studio slots between package updates.
 protocol.handle('johansson',request=>{
  try{
   const url=new URL(request.url);if(url.hostname!=='world')return new Response('Not found',{status:404});
   let relative=decodeURIComponent(url.pathname);
   if(relative.endsWith('/'))relative+='index.html';
   const file=path.resolve(root,'.'+relative);
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return new Response('Not found',{status:404});
   const real=fs.realpathSync(file);if(!real.startsWith(fs.realpathSync(root)+path.sep))return new Response('Forbidden',{status:403});
   return net.fetch(pathToFileURL(real).href,{headers:request.headers});
  }catch{return new Response('Bad request',{status:400});}
 });
 // Renderer/gameplay cannot reach the network. Only an explicit main-process
 // update request may fetch the GitHub release channel.
 session.defaultSession.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 session.defaultSession.setPermissionRequestHandler((_contents,permission,callback)=>callback(['fullscreen','pointerLock'].includes(permission)));
 updater=createUpdater({version:app.getVersion(),installRoot:process.env.JOHANSSON_INSTALL_ROOT});
 ipcMain.on('read-backup',event=>{event.returnValue=readSnapshot(saveDir());});
 ipcMain.handle('save-backup',(_event,data)=>writeSnapshot(saveDir(),data));
 ipcMain.handle('app-info',()=>({version:app.getVersion(),savePath:saveDir(),offline:true}));
 ipcMain.handle('check-update',()=>updater.check());
 ipcMain.handle('install-update',()=>updater.install());
 ipcMain.handle('restart-update',()=>{const executable=updater.readyExecutable();if(!executable)throw Error('No verified update is ready');readyToClose=true;app.relaunch({execPath:executable,args:[]});app.exit(0);});
 ipcMain.handle('quit-world',()=>window?.close());
 ipcMain.on('close-saved',()=>{readyToClose=true;window?.close();});
 window=new BrowserWindow({width:1280,height:800,minWidth:800,minHeight:600,fullscreen:!process.argv.includes('--windowed'),backgroundColor:'#f7f8f9',autoHideMenuBar:true,icon:path.join(root,'johansson-town/assets/icons/town-192.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:true}});
 window.webContents.setWindowOpenHandler(()=>{window.webContents.send('offline-link');return {action:'deny'};});
 window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('johansson://world/'))event.preventDefault();});
 window.on('close',event=>{if(readyToClose)return;event.preventDefault();window.webContents.send('save-before-close');setTimeout(()=>{readyToClose=true;window?.close();},5000).unref();});
 await window.loadURL('johansson://world/johansson-town/?desktop=1');
 if(process.argv.includes('--smoke')){
  // CI exercises the same local protocol and starts the real island.
  window.webContents.on('console-message',(_event,_level,message)=>console.log(message));
  setTimeout(async()=>{try{
   const result=await window.webContents.executeJavaScript('(async()=>{await window.__JOHANSSON_PREVIEW_PROMISE__;document.getElementById("enter").click();await new Promise(r=>setTimeout(r,12000));return {running:!!window.__JOHANSSON_RUNNING__,stability:window.__JOHANSSON_STABILITY__,version:window.__JOHANSSON_RUNTIME_VERSION__};})()');
   console.log('WORLD_SMOKE',JSON.stringify(result));
   if(!result.running)throw Error('World did not start');
   const festival=await window.webContents.executeJavaScript('(async()=>{dispatchEvent(new Event("johansson-festival-menu"));const press=(text)=>{const b=[...document.querySelectorAll("#activityActions button")].find(b=>b.textContent===text);if(!b)throw Error("Missing festival action: "+text);b.click();};press("Harbour quay · Chin");press("Take part");await new Promise(r=>setTimeout(r,1500));return {stage:!!document.getElementById("festivalHUD"),text:document.getElementById("activityBody")?.textContent};})()');
   console.log('FESTIVAL_SMOKE',JSON.stringify(festival));if(!festival.stage)throw Error('Actual quay stage did not start: '+festival.text);

   if(process.env.WORLD_SCREENSHOT)fs.writeFileSync(process.env.WORLD_SCREENSHOT,(await window.webContents.capturePage()).toPNG());
   readyToClose=true;app.exit(0);
  }catch(error){console.error(error);readyToClose=true;app.exit(1);}},3000);
 }
});
app.on('window-all-closed',()=>app.quit());

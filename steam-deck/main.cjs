const {app,BrowserWindow,protocol,net,session,ipcMain,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const {writeSnapshot,readSnapshot}=require('./storage.cjs');
const {createUpdater}=require('./updater.cjs');
const {syncDesktopIcon}=require('./desktop-integration.cjs');
app.setName('Johansson World');
// Acceptance must not load or overwrite a player's saved preferences/progress.
if(process.argv.includes('--smoke'))app.setPath('userData',fs.mkdtempSync(path.join(app.getPath('temp'),'johansson-world-smoke-')));
protocol.registerSchemesAsPrivileged([{scheme:'johansson',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true}}]);
let window,readyToClose=false,updater;
const root=path.join(__dirname,'site');
const saveDir=()=>path.join(app.getPath('userData'),'saves');
if(!process.argv.includes('--smoke')&&!app.requestSingleInstanceLock())app.quit();
app.on('second-instance',()=>{window?.show();window?.focus();});
app.whenReady().then(async()=>{
 try{syncDesktopIcon({installRoot:process.env.JOHANSSON_INSTALL_ROOT});}catch(error){console.warn('Launcher icon could not refresh:',error.message);}
 // A stable local origin preserves all world/Studio slots between package updates.
 protocol.handle('johansson',request=>{
  try{
   const url=new URL(request.url);if(url.pathname==='/')return Response.redirect('johansson://world/johansson-town/');if(url.hostname!=='world')return new Response('Not found',{status:404});
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
 updater=createUpdater({version:app.getVersion(),bundleRoot:path.resolve(__dirname,'../..'),installRoot:process.env.JOHANSSON_INSTALL_ROOT});
 ipcMain.on('read-backup',event=>{event.returnValue=readSnapshot(saveDir());});
 ipcMain.handle('save-backup',(_event,data)=>writeSnapshot(saveDir(),data));
 ipcMain.handle('performance-info',()=>app.getAppMetrics().map(p=>({type:p.type,workingSetMiB:Math.round(p.memory.workingSetSize/1024)})));
 ipcMain.on('app-info',event=>{event.returnValue={version:app.getVersion(),offline:true};});
 ipcMain.handle('check-update',()=>updater.check());
 ipcMain.handle('install-update',()=>updater.install());
 ipcMain.handle('restart-update',()=>{const executable=updater.readyExecutable();if(!executable)throw Error('No verified update is ready');readyToClose=true;app.relaunch({execPath:executable,args:[]});app.exit(0);});
 ipcMain.handle('quit-world',()=>window?.close());
 ipcMain.on('close-saved',()=>{readyToClose=true;window?.close();});
 window=new BrowserWindow({width:1280,height:800,minWidth:800,minHeight:600,fullscreen:!process.argv.includes('--windowed'),backgroundColor:'#f7f8f9',autoHideMenuBar:true,icon:path.join(root,'desktop/icons/johansson-world-256.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:true}});
 window.webContents.setWindowOpenHandler(()=>{window.webContents.send('offline-link');return {action:'deny'};});
 window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('johansson://world/'))event.preventDefault();});
 window.on('close',event=>{if(readyToClose)return;event.preventDefault();window.webContents.send('save-before-close');setTimeout(()=>{readyToClose=true;window?.close();},5000).unref();});
 await window.loadURL('johansson://world/johansson-town/?desktop=1'+(process.argv.includes('--smoke')?'&audit':''));
 if(process.argv.includes('--smoke')){
  // CI exercises the same local protocol and starts the real island.
  window.webContents.on('console-message',details=>console.log(details.message));
  setTimeout(async()=>{try{
   const result=await window.webContents.executeJavaScript('(async()=>{const until=async(test,ms)=>{const end=Date.now()+ms;while(!test()&&Date.now()<end)await new Promise(r=>setTimeout(r,250));return test();};const enter=document.getElementById("enter");await until(()=>enter&&!enter.disabled,240000);enter.click();await until(()=>window.__JOHANSSON_RUNNING__===true&&window.__JOHANSSON_STABILITY__,120000);return {running:!!window.__JOHANSSON_RUNNING__,stability:window.__JOHANSSON_STABILITY__,version:window.__JOHANSSON_RUNTIME_VERSION__,desktopVersion:window.johanssonDesktop.version};})()');
   console.log('WORLD_SMOKE',JSON.stringify(result));
   if(result.desktopVersion!==app.getVersion())throw Error('Displayed version differs from running application');
   if(!result.running||!result.stability?.ok)throw Error('World startup checks failed: '+JSON.stringify(result.stability));
   // The real clock may start Johansson asleep inside his cabin. Outdoor smoke
   // stages need an explicit fixture exit; the contextual B/Exit button is only
   // offered beside the doorway and is separately checked by console acceptance.
   await window.webContents.executeJavaScript(`(async()=>{
    document.querySelector('#desktopMenu:not([hidden]) [data-action=resume]')?.click();
    await window.johanssonLinuxWorld?.wake();
    const audit=window.__JOHANSSON_AUDIT__;
    if(audit.player.room)await audit.leave();
    const ready=()=>!audit.player.room&&!audit.blocked.roomLoading&&!audit.blocked.catchingUp;
    const deadline=Date.now()+120000;
    while(!ready()&&Date.now()<deadline)await new Promise(r=>setTimeout(r,100));
    if(!ready())throw Error('Outdoor smoke setup did not settle: '+JSON.stringify({player:audit.player,blocked:audit.blocked}));
    audit.setTime(8*60+35);audit.step(100);audit.teleport(-7,-15,0,0);
   })()`);
   if(process.env.WORLD_SCREENSHOT)fs.writeFileSync(process.env.WORLD_SCREENSHOT.replace('.png','-island.png'),(await window.webContents.capturePage()).toPNG());
   const peaceful=await window.webContents.executeJavaScript(`(async()=>{
    const a=window.__JOHANSSON_AUDIT__,funds=a.activities.state.yen;
    for(const [x,z] of [[-7,-15],[4,3],[0,15],[19.8,-40]]){a.teleport(x,z,0,0);dispatchEvent(new Event('johansson-festival-menu'));a.step(200);}
    a.setTime(289*1440+720);a.step(100);
    for(const code of ['KeyJ','KeyK','KeyL','Space']){document.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));}
    await new Promise(r=>setTimeout(r,500));
    return {hud:!!document.getElementById('festivalHUD'),launcher:!!document.getElementById('festivalButton'),api:!!a.festival,unchanged:a.activities.state.yen===funds};
   })()`);
   console.log('PEACEFUL_SMOKE',JSON.stringify(peaceful));if(peaceful.hud||peaceful.launcher||peaceful.api||!peaceful.unchanged)throw Error('Retired combat remained accessible');
   if(process.env.WORLD_SCREENSHOT)fs.writeFileSync(process.env.WORLD_SCREENSHOT,(await window.webContents.capturePage()).toPNG());
   const desktop=await window.webContents.executeJavaScript(`(async()=>{window.johanssonDesktopUI.open();const menu=document.getElementById('desktopMenu');const opened=!menu.hidden;menu.querySelector('[data-action="save"]').click();await new Promise(r=>setTimeout(r,1000));menu.querySelector('[data-tab="settings"]').click();menu.querySelector('[data-action="display"]').click();menu.querySelector('[data-action="hud"]').click();const hidden=document.documentElement.classList.contains('desktop-hide-hud');return {opened,hidden,status:document.getElementById('desktopStatus').textContent};})()`);
   console.log('DESKTOP_SMOKE',JSON.stringify(desktop));if(!desktop.opened||!desktop.hidden)throw Error('Desktop pause/HUD controls failed');
   if(!readSnapshot(saveDir()))throw Error('Save backup was not written');

   readyToClose=true;app.exit(0);
  }catch(error){console.error(error);readyToClose=true;app.exit(1);}},3000);
 }
});
app.on('window-all-closed',()=>app.quit());

/* The harbour viewer is opt-in: no WebGL or scene download during page load. */
(function () {
 'use strict';
 var root=document.getElementById('office-port');if(!root)return;
 var open=root.querySelector('[data-diorama-open]'),panel=root.querySelector('[data-diorama]');if(!open||!panel)return;
 var host=panel.querySelector('[data-diorama-stage]'),status=panel.querySelector('[role="status"]'),close=panel.querySelector('[data-diorama-close]');
 var scene=null,request=null,revision=0,active=false,visible=true;
 function suspend(){scene?.setActive(active&&visible&&!document.hidden);}
 function exit(message){
  revision++;active=false;request?.abort();request=null;scene?.dispose();scene=null;
  panel.hidden=true;root.removeAttribute('data-exploring');root.removeAttribute('aria-busy');
  open.setAttribute('aria-expanded','false');open.textContent=message||'Explore harbour';
  root.dispatchEvent(new Event('harbourviewclose'));open.focus();
 }
 open.addEventListener('click',async function(){
  if(active)return;active=true;var version=++revision;request=new AbortController();
  root.setAttribute('data-exploring','');root.setAttribute('aria-busy','true');panel.hidden=false;
  open.setAttribute('aria-expanded','true');status.textContent='Opening Minato harbour…';close.focus();
  root.dispatchEvent(new Event('harbourviewopen'));
  try{
   var module=await import('/assets/js/office-diorama-scene.js?v=20261101a');
   if(version!==revision)return;
   var instance=await module.createHarbourDiorama({host,signal:request.signal,onError:function(){if(version===revision)exit('Try harbour again');}});
   if(version!==revision){instance.dispose();return;}
   scene=instance;root.removeAttribute('aria-busy');status.textContent='Drag to look around · choose a view below';
   panel.querySelectorAll('[data-harbour-view]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.harbourView==='quay'));});suspend();
  }catch(error){if(version===revision)exit('Try harbour again');}
 });
 close.addEventListener('click',function(){exit();});
 panel.addEventListener('keydown',function(event){if(event.key==='Escape'){event.preventDefault();exit();}});
 panel.querySelectorAll('[data-harbour-view]').forEach(function(button){button.addEventListener('click',function(){
  if(!scene)return;scene.setView(button.dataset.harbourView);
  panel.querySelectorAll('[data-harbour-view]').forEach(function(other){other.setAttribute('aria-pressed',String(other===button));});
 });});
 panel.querySelectorAll('[data-harbour-action]').forEach(function(button){button.addEventListener('click',function(){scene?.control(button.dataset.harbourAction);});});
 document.addEventListener('visibilitychange',suspend);
 var observer;if('IntersectionObserver' in window){observer=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;suspend();});observer.observe(root);}
 window.addEventListener('pagehide',function(event){if(!event.persisted){observer?.disconnect();if(active)exit();}else scene?.setActive(false);});
 window.addEventListener('pageshow',suspend);
 open.hidden=false;
})();

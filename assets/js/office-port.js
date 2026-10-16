/* Finished video arrivals; no 3D runtime or unfinished frames reach the homepage. */
(function () {
 'use strict';
 var root=document.getElementById('office-port');if(!root)return;
 var people=[{id:'fujita',name:'Fujita'},{id:'johansson',name:'Johansson'},{id:'thuan',name:'Thuận'},{id:'tetsuo',name:'Tetsuo'}];
 var places=[{id:'quay',title:'Outer pier',poster:'harbour.webp'},{id:'pier',title:'Pier end',poster:'pier.webp'},{id:'bridge',title:'Minato Maru · bridge wing',poster:'bridge.webp'}];
 var key='office-port-selection-v2',state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}if(typeof state!=='object'||Array.isArray(state))state={};
 function choose(items,type){var seen=Array.isArray(state[type])?state[type]:[],pool=items.filter(function(p){return !seen.includes(p.id);});if(!pool.length){seen=[];pool=items;}var fresh=pool.filter(function(p){return p.id!==state['last'+type];});if(fresh.length)pool=fresh;var choice=pool[Math.floor(Math.random()*pool.length)];state[type]=seen.concat(choice.id);state['last'+type]=choice.id;return choice;}
 var person=choose(people,'people'),place=choose(places,'places');
 function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(_){}}save();
 var img=root.querySelector('img'),host=root.querySelector('[data-port-stage]'),caption=root.querySelector('[data-resident]'),button=root.querySelector('[data-port-play]'),next=root.querySelector('[data-next-arrival]');if(!host||!button)return;
 var reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 var loaded=false,visible=false,intent='auto',failed=false,disposed=false,finished=false,video=null,revision=0,attempt=0,starting=false;
 var stillRemaining=10000,stillSince=null,stillTimer=null,posterReady=false,posterRequested=null;
 function holdStill(){
  var now=performance.now();if(stillSince!==null){stillRemaining=Math.max(0,stillRemaining-(now-stillSince));stillSince=null;}
  window.clearTimeout(stillTimer);stillTimer=null;
  if(stillRemaining>0&&posterReady&&loaded&&visible&&!document.hidden&&!disposed){stillSince=now;stillTimer=window.setTimeout(reconcile,stillRemaining);}
  button.disabled=stillRemaining>0;return stillRemaining===0;
 }
 function permitted(){return intent==='play'||(!reduced.matches&&!(connection&&(connection.saveData||/(^|-)2g$/.test(connection.effectiveType||''))));}
 function shouldPlay(){return loaded&&visible&&!document.hidden&&permitted()&&intent!=='pause'&&!failed&&!disposed&&!finished;}
 function label(playing){root.toggleAttribute('data-playing',playing);button.setAttribute('aria-label',playing?'Pause arrival':finished?'Replay arrival':'Play arrival');button.title=playing?'Pause arrival':finished?'Replay arrival':'Play arrival';}
 function poster(){var version=revision,url='/assets/office-port/'+place.poster;caption.textContent=place.title+' · Johansson World';if(posterRequested===url)return;posterRequested=url;var ready=new Image();ready.onload=function(){if(disposed||version!==revision)return;img.src=url;img.alt=place.id==='bridge'?'View from the ferry bridge wing over the port and vehicle loading deck':'A finished view of Minato port';window.requestAnimationFrame(function(){window.requestAnimationFrame(function(){if(disposed||version!==revision)return;posterReady=true;reconcile();});});};ready.onerror=function(){if(version===revision)posterRequested=null;};ready.src=url;}
 function pause(){attempt++;starting=false;if(video)video.pause();label(false);}
 function clear(){pause();root.removeAttribute('data-motion');root.removeAttribute('aria-busy');if(video){var old=video;video=null;old.removeAttribute('src');old.load();old.remove();}}
 function fail(){failed=true;clear();button.hidden=true;poster();}
 function create(){
  var v=document.createElement('video'),version=revision;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='auto';v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.tabIndex=-1;v.disablePictureInPicture=true;
  v.addEventListener('error',function(){if(video===v&&version===revision)fail();});
  v.addEventListener('ended',function(){if(video!==v)return;finished=true;label(false);});
  v.addEventListener('pause',function(){if(video===v)label(false);});
  v.src='/assets/office-port/'+(place.id==='quay'?'':place.id+'-')+person.id+'.mp4?v=short-1';host.appendChild(v);video=v;return v;
 }
 function reconcile(){
  var waited=holdStill();
  if(!shouldPlay()||!waited){pause();if(!permitted()){root.removeAttribute('data-motion');poster();}return;}
  if(starting||(video&&!video.paused))return;
  var v=video||create(),token=++attempt;starting=true;root.setAttribute('aria-busy','true');
  function current(){return video===v&&token===attempt&&!disposed;}
  function reveal(){if(!current()||!shouldPlay()||v.readyState<2)return;starting=false;root.removeAttribute('aria-busy');root.setAttribute('data-motion','');caption.textContent=person.name+' · '+place.title;label(true);}
  Promise.resolve(v.play()).then(function(){if(!current())return;if(!shouldPlay()){pause();return;}if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(reveal);else window.requestAnimationFrame(function(){window.requestAnimationFrame(reveal);});}).catch(function(){if(!current())return;starting=false;root.removeAttribute('aria-busy');intent='pause';label(false);});
 }
 button.hidden=false;if(next)next.hidden=false;
 button.addEventListener('click',function(){if(video&&!video.paused){intent='pause';reconcile();return;}intent='play';loaded=true;visible=true;if(finished){finished=false;if(video)video.currentTime=0;}reconcile();});
 if(next)next.addEventListener('click',function(){revision++;clear();stillRemaining=10000;stillSince=null;window.clearTimeout(stillTimer);posterReady=false;posterRequested=null;person=choose(people,'people');place=choose(places,'places');save();finished=false;failed=false;button.hidden=false;intent='auto';label(false);poster();reconcile();});
 function preferenceChanged(){intent='auto';reconcile();}if(reduced.addEventListener)reduced.addEventListener('change',preferenceChanged);else if(reduced.addListener)reduced.addListener(preferenceChanged);if(connection&&connection.addEventListener)connection.addEventListener('change',preferenceChanged);
 document.addEventListener('visibilitychange',reconcile);
 var observer;if('IntersectionObserver' in window){observer=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;reconcile();},{threshold:.15});observer.observe(root);}
 function afterLoad(){var start=function(){if(disposed)return;poster();loaded=true;reconcile();};if('requestIdleCallback' in window)window.requestIdleCallback(start,{timeout:2000});else window.setTimeout(start,250);}
 if(document.readyState==='complete')afterLoad();else window.addEventListener('load',afterLoad,{once:true});
 window.addEventListener('pagehide',function(event){if(event.persisted){holdStill();window.clearTimeout(stillTimer);stillSince=null;pause();return;}disposed=true;window.clearTimeout(stillTimer);observer?.disconnect();clear();});window.addEventListener('pageshow',function(event){if(event.persisted)reconcile();});
})();

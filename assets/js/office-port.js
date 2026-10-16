/* Lazy live Three.js arrivals. The complete first frame replaces the still atomically. */
(function () {
 'use strict';
 var root=document.getElementById('office-port');if(!root)return;
 var people=[{id:'fujita',name:'Fujita'},{id:'johansson',name:'Johansson'},{id:'thuan',name:'Thuận'},{id:'tetsuo',name:'Tetsuo'}];
 var places=[{id:'quay',title:'Outer pier',poster:'harbour.webp'},{id:'pier',title:'Pier end',poster:'pier.webp'},{id:'bridge',title:'Minato Maru · bridge wing',poster:'bridge.webp'}];
 var key='office-port-selection-v2',state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}if(typeof state!=='object'||Array.isArray(state))state={};
 function choose(items,type){var seen=Array.isArray(state[type])?state[type]:[],pool=items.filter(function(p){return !seen.includes(p.id);});if(!pool.length){seen=[];pool=items;}var fresh=pool.filter(function(p){return p.id!==state['last'+type];});if(fresh.length)pool=fresh;var choice=pool[Math.floor(Math.random()*pool.length)];state[type]=seen.concat(choice.id);state['last'+type]=choice.id;return choice;}
 var person=choose(people,'people'),place=choose(places,'places');
 function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(_){}}save();
 var img=root.querySelector('img'),host=root.querySelector('[data-port-stage]'),caption=root.querySelector('[data-resident]'),button=root.querySelector('[data-port-play]'),next=root.querySelector('[data-next-arrival]');
 if(!host||!button)return;
 var reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 var loaded=false,visible=false,intent='auto',failed=false,disposed=false,playing=false,finished=false,instance=null,pending=null,revision=0;
 function permitted(){return intent==='play'||(!reduced.matches&&!(connection&&(connection.saveData||/(^|-)2g$/.test(connection.effectiveType||''))));}
 var posterShown=null;
 function poster(){
  var url='/assets/office-port/'+place.poster,version=revision,title=place.title+' · Johansson World';
  if(posterShown===url){if(!instance||!permitted()||failed)caption.textContent=title;return;}
  var alt=place.id==='bridge'?'View from the ferry bridge wing over the port and vehicle loading deck':place.id==='pier'?'The end of Minato pier with the ferry and harbour beyond':'The quay, boats and harbour buildings at Minato port',ready=new Image();
  ready.onload=function(){if(disposed||version!==revision)return;img.src=url;img.alt=alt;posterShown=url;if(!instance||!permitted()||failed)caption.textContent=title;};ready.src=url;
 }

 function label(s){if(failed||disposed)return;playing=s.playing;finished=s.finished;root.toggleAttribute('data-playing',playing);root.toggleAttribute('data-signature',!playing||s.time>=5);button.setAttribute('aria-label',playing?'Pause 3D scene':finished?'Replay 3D arrival':'Play 3D arrival');button.title=playing?'Pause 3D scene':finished?'Replay arrival':'Play 3D arrival';}
 function fail(){failed=true;playing=false;root.removeAttribute('data-motion');root.removeAttribute('data-playing');root.removeAttribute('aria-busy');button.hidden=true;poster();if(instance){instance.dispose();instance=null;}}
 function shouldPlay(){return loaded&&visible&&!document.hidden&&permitted()&&intent!=='pause'&&!failed&&!disposed&&!finished;}
 async function ensure(){
  if(instance)return instance;if(pending)return pending;var version=revision;root.setAttribute('aria-busy','true');
  pending=import('/assets/js/office-port-live.js?v=1').then(function(module){return module.createPortScene({host:host,person:person,place:place,onState:label,onError:fail});}).then(function(view){
   if(disposed||failed){view.dispose();return null;}instance=view;if(version!==revision)instance.select(person,place);root.removeAttribute('aria-busy');if(permitted())root.setAttribute('data-motion','');caption.textContent=person.name+' · '+place.title;return instance;
  }).catch(function(){if(!disposed)fail();return null;}).finally(function(){pending=null;});return pending;
 }
 function reconcile(){
  if(!shouldPlay()){if(instance)instance.pause();if(!permitted()||failed){root.removeAttribute('data-motion');poster();}return;}
  ensure().then(function(view){if(view&&shouldPlay()){root.setAttribute('data-motion','');view.play();}});
 }
 button.hidden=false;if(next)next.hidden=false;
 button.addEventListener('click',function(){intent=playing?'pause':'play';if(finished&&!playing){finished=false;if(instance)instance.play(true);}loaded=true;visible=true;reconcile();});
 if(next)next.addEventListener('click',function(){person=choose(people,'people');place=choose(places,'places');save();revision++;finished=false;playing=false;intent='auto';poster();root.removeAttribute('data-motion');if(instance){try{instance.select(person,place);}catch(error){fail();return;}if(permitted())root.setAttribute('data-motion','');caption.textContent=person.name+' · '+place.title;}reconcile();});
 function preferenceChanged(){intent='auto';reconcile();}if(reduced.addEventListener)reduced.addEventListener('change',preferenceChanged);else if(reduced.addListener)reduced.addListener(preferenceChanged);if(connection&&connection.addEventListener)connection.addEventListener('change',preferenceChanged);
 document.addEventListener('visibilitychange',reconcile);
 var observer;if('IntersectionObserver' in window){observer=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;reconcile();},{threshold:.15});observer.observe(root);}
 function afterLoad(){var start=function(){if(disposed)return;poster();loaded=true;reconcile();};if('requestIdleCallback' in window)window.requestIdleCallback(start,{timeout:2000});else window.setTimeout(start,250);}
 if(document.readyState==='complete')afterLoad();else window.addEventListener('load',afterLoad,{once:true});
 window.addEventListener('pagehide',function(event){if(event.persisted){instance?.pause();return;}disposed=true;observer?.disconnect();instance?.dispose();});
 window.addEventListener('pageshow',function(event){if(event.persisted)reconcile();});
})();

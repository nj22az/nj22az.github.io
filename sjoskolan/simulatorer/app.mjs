import {createSession} from './session.mjs?v=20261003-erik';
import {RIGS,MODES} from './multimeter/model.mjs';
import {STATION_A_PROTOKOLL} from './multimeter/stationA-protokoll.mjs';
import {mountProtocol} from '../gemensamt/labbprotokoll.mjs?v=20260929-not';
import {markHtml} from '../gemensamt/markering.mjs';
const $=s=>document.querySelector(s);
let storage;try{storage=localStorage;}catch{}
const session=createSession(storage);let room=null,active='black',flat=false,view='bench',alternate=false;
for(const id of ['red','black']){
  $( '#'+id).innerHTML='<option value="">Lossad</option>'+session.nodes.map(n=>`<option value="${n}">${n}</option>`).join('');
}
$('#rig').innerHTML=RIGS.map(r=>`<option value="${r.id}">${r.name}${r.id===5?' · felsökningsrigg':''}</option>`).join('');
function message(text){$('#feedback').textContent=text;}
function change(key,value){const error=session.change(key,value);if(error)message(error);else message('');render();}
function renderFlat(){
  const s=session.state,coords={P:[80,100],A:[205,100],B:[320,100],N:[435,100],'Ref+':[220,235],'Ref−':[360,235]};
  let h='<path d="M80 100 V175 H435 V100" fill="none" stroke="#607e8d" stroke-width="3"/>';
  h+=`<path d="M80 100 ${s.link?'H205':'L180 65'}" fill="none" stroke="#607e8d" stroke-width="3"/><path d="M205 100 H240 M285 100 H320 M320 100 H350 M395 100 H435" stroke="#607e8d" stroke-width="3"/><rect x="240" y="87" width="45" height="26" fill="#d4c5a7" stroke="#163248"/><rect x="350" y="87" width="45" height="26" fill="#d4c5a7" stroke="#163248"/>`;
  h+='<text x="242" y="65" font-size="18">R1 · 1 kΩ</text><text x="350" y="140" font-size="18">R2 · 2 kΩ</text><text x="65" y="205" font-size="18">SELV · DC</text><text x="240" y="290" font-size="18">Referens 5,000 V</text>';
  for(const [name,[x,y]] of Object.entries(coords)){const fill=s.red===name?'#c54338':s.black===name?'#263640':'white';h+=`<g class="flat-node" data-node="${name}" role="button" tabindex="0" aria-label="Mätpunkt ${name}"><circle cx="${x}" cy="${y}" r="18" style="fill:${fill}"/><text x="${x}" y="${y-25}" text-anchor="middle">${name}</text></g>`;}
  $('#flat-diagram').innerHTML=h;
}
function render(){
  const s=session.state,m=session.reading(),p=session.progress;
  $('#reading').textContent=m.text;$('#unit').textContent=m.unit;$('#detail').textContent=m.detail;
  for(const id of ['mode','jack','rig'])$('#'+id).value=s[id];for(const id of ['red','black'])$('#'+id).value=s[id]||'';
  $('#power').textContent=s.power?'Bryt matningen':`Slå på ${RIGS[s.rig].Unom} V`;$('#power').setAttribute('aria-pressed',String(s.power));
  $('#link').textContent=s.link?'Öppna länken P–A':'Slut länken P–A';$('#link').setAttribute('aria-pressed',String(!s.link));
  $('#reset-protection').hidden=!s.trip&&!s.fuse;
  $('#free').textContent=session.free?'Till guidad övning':'Fri övning';$('#free').setAttribute('aria-pressed',String(session.free));
  $('#step-heading').textContent=session.free?'Fri övning · Station A':p.done?'Station A klar':`Steg ${p.stage+1} av 9`;
  $('#task').innerHTML=markHtml(session.free?'Undersök riggen: jämför Ω och kΩ, byt polaritet eller välj felsökningsrigg 5. Matningen ska vara bruten när du kopplar om.':session.step.task);
  $('#hint').hidden=session.free;$('#hint-text').innerHTML=markHtml(session.step.hint);
  $('#check').hidden=session.free||session.passed;$('#next').hidden=session.free||!session.passed||p.done;
  $('#progress').textContent=`${p.done?'Station A genomförd.':`${p.stage} av 9 steg genomförda.`} ${p.records.length} sparade mätningar. Framsteg sparas separat från veckolabbet.`;
  $('#storage-status').textContent=session.storageOK?'':'Webbläsaren kan inte spara lokalt. Du kan fortsätta öva och exportera protokollet.';
  room?.setState(s);renderFlat();
}
for(const id of ['mode','jack','rig','red','black'])$('#'+id).addEventListener('change',e=>change(id,id==='rig'?Number(e.target.value):e.target.value||null));
$('#power').addEventListener('click',()=>change('power',!session.state.power));$('#link').addEventListener('click',()=>change('link',!session.state.link));
$('#disconnect').addEventListener('click',()=>{const e=session.change('red',null)||session.change('black',null);message(e);render();});
$('#reset-protection').addEventListener('click',()=>{message(session.resetProtection());render();});
$('#check').addEventListener('click',()=>{const ok=session.check();message(ok?session.step.why:`Kontrollera mätfunktion, uttag, matning, länk och mätpunkter. ${session.reading().detail}`);render();});
$('#next').addEventListener('click',()=>{session.next();$('#hint').open=false;message('');render();});
$('#free').addEventListener('click',()=>{session.setFree(!session.free);message('');render();});
$('#restart').addEventListener('click',()=>{session.restart();message('Stegen är återställda. Tidigare mätningar och protokoll finns kvar.');render();});
function choose(probe){active=probe;room?.setActive(probe);for(const id of ['black','red'])$('#choose-'+id).setAttribute('aria-pressed',String(id===probe));}
for(const id of ['black','red'])$('#choose-'+id).addEventListener('click',()=>choose(id));
function pick(probe,node){if(view==='overview')setView('bench');change(probe,node);}
$('#flat-diagram').addEventListener('click',e=>{const node=e.target.closest('[data-node]');if(node)pick(active,node.dataset.node);});
$('#flat-diagram').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.dataset.node){e.preventDefault();pick(active,e.target.dataset.node);}});
function setFlat(value){flat=value;$('#flat-diagram').toggleAttribute('hidden',!flat);$('#scene').hidden=flat;$('#flat').setAttribute('aria-pressed',String(flat));$('#flat').textContent=flat?'Visa 3D-maskinrum':'Använd 2D-vy';room?.setVisible(!flat);$('#walk-controls').hidden=flat||view!=='overview';}
function setView(value){view=value;room?.setView(value);$('#bench').setAttribute('aria-pressed',String(view==='bench'));$('#overview').setAttribute('aria-pressed',String(view==='overview'));$('#walk-controls').hidden=flat||view!=='overview';$('#room-caption').textContent=view==='bench'?'Johansson · elektrisk verkstad · SELV':'Johansson · maskinrum · WASD / piltangenter';}
$('#bench').addEventListener('click',()=>setView('bench'));$('#overview').addEventListener('click',()=>setView('overview'));$('#camera').addEventListener('click',()=>{alternate=!alternate;room?.setAlternate(alternate);$('#camera').setAttribute('aria-pressed',String(alternate));});
$('#flat').addEventListener('click',()=>{if(room)setFlat(!flat);else{setFlat(true);$('#scene-status').hidden=false;$('#scene-status').textContent='3D är inte tillgängligt. Alla mätningar fungerar i 2D-vyn.';}});
for(const button of document.querySelectorAll('[data-move]')){
  const stop=()=>room?.move(button.dataset.move,false);
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);room?.move(button.dataset.move,true);});
  for(const type of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(type,stop);
  button.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();room?.move(button.dataset.move,true);}});button.addEventListener('keyup',stop);
}
mountProtocol($('#protocol'),{...STATION_A_PROTOKOLL,key:'maskinrum-stationA-v1',rowMessages:true,station:'Maskinrummet · elektrisk verkstad · Station A',snapshot(plan){const m=session.reading(),s=session.state,n=plan?.need||{};const wrong=[];if(n.mode&&s.mode!==n.mode)wrong.push(`välj ${MODES[n.mode]}`);if(n.red&&(s.red!==n.red||s.black!==n.black))wrong.push(`röd på ${n.red} och svart på ${n.black}`);if(n.pair&&[s.red,s.black].sort().join()!==n.pair.slice().sort().join())wrong.push(`spetsarna på ${n.pair.join(' och ')}`);if(n.power!==undefined&&s.power!==n.power)wrong.push(n.power?'slå på matningen':'bryt matningen');if(n.link!==undefined&&s.link!==n.link)wrong.push(n.link?'slut länken P–A':'öppna länken P–A');if(wrong.length)return {error:`Den här protokollraden kräver en annan koppling: ${wrong.join(', ')}.`};if(m.code!=='reading')return {error:'Anslut mätaren och välj rätt mätfunktion först.'};return {varde:`${m.text} ${m.unit}`,punkter:`röd ${s.red} / svart ${s.black}`,drift:`${MODES[s.mode]}, ${s.jack}-uttag, rigg ${s.rig}, matning ${s.power?'till':'bruten'}, länk ${s.link?'sluten':'öppen'}`};}});
render();
try{
  const {mountRoom}=await import('./scene.mjs?v=20261003-erik');
  room=mountRoom($('#scene'),{onPick:pick,onFailure(){setFlat(true);$('#scene-status').hidden=false;$('#scene-status').textContent='3D-vyn avbröts. Fortsätt med samma mätning i 2D.';}});room.setActive(active);room.setState(session.state);$('#scene-status').hidden=true;
}catch(error){console.warn('Maskinrum: 2D-reservläge',error);setFlat(true);$('#scene-status').textContent='3D är inte tillgängligt. Alla mätningar fungerar i 2D-vyn.';$('#overview').disabled=true;$('#camera').disabled=true;}
export function inspect(){return {state:session.state,progress:session.progress,scene:room?.inspect()||null,flat};}
export function contactScreen(name){return room?.contactScreen(name);}

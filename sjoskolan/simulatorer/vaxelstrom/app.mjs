import {createStationB,STEG,instrumentVisning} from './session.mjs?v=20261003-erik';
import {takter,sladdar,vinkel} from './manus.mjs?v=20261003-erik';
import {mittD} from '../../gemensamt/elevtal.mjs?v=20260930';
import {markHtml as m,markText} from '../../gemensamt/markering.mjs?v=20260928';
import {hjalpHtml} from '../../gemensamt/raknehjalp.mjs?v=20260929c';
import {LESSONS} from '../../vecka-40/aktuell/lektioner.mjs?v=20260930u';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const n2=v=>Number.isFinite(v)?v.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2}):'–';
const tid=iso=>iso?new Date(iso).toLocaleString('sv-SE',{dateStyle:'short',timeStyle:'short'}):'';
let storage;try{storage=localStorage;}catch{}
const station=createStationB(storage,mittD());
let room=null,flat=false;

// Läshänvisning till delsidan i vecka 40, som i veckans labb.
const EJ_TEORI=['mal','exempel','eget','klart','labb','matarna','protokoll'];
function las(task){const l=LESSONS.find(x=>x.id===task.lesson);if(!l)return '';const s=l.slides.find(x=>x.id===task.theory),d=l.number+1,sida=`../../vecka-40/aktuell/Del_${l.number}.html`;
  const teori=l.slides.filter(x=>!EJ_TEORI.includes(x.id)&&!x.example&&!x.tur),j=teori.findIndex(x=>x.id===task.theory);
  const [href,text]=!s?[sida,`del ${d}`]:j>=0?[`${sida}#teori-${s.id}`,`del ${d}, teori ${j+1}: ${m(s.title)}`]:[`${sida}#exempel-${s.id}`,`del ${d}: ${m(s.title)}`];
  return `Kan du inte metoden? Läs <a href="${href}" target="_blank" rel="noopener">${text}</a> (öppnas i ny flik).`;}

function setScene(revealed){
  if(!room)return;const t=station.task;
  room.setDisplays(instrumentVisning(t),revealed);
  room.setLeads(revealed?sladdar(t):[]);
  room.setShot(revealed?vinkel(t):vinkel(t));
}

function render(focus=false){
  const t=station.task,p=station.phase,r=station.row,i=station.tasks.indexOf(t);
  const lesson=LESSONS.find(l=>l.id===t.lesson);
  const status=x=>{const w=station.rows[x.id];return w?.explanation?' · förklarad':w?.shown?' · avläst':'';};
  $('#task-pick').innerHTML=station.tasks.map((x,k)=>`<option value="${x.id}"${x.id===t.id?' selected':''}>${k+1}. ${esc(markText(x.title))}${status(x)}</option>`).join('');
  $('#task-head').innerHTML=`<p class="sj-kicker">Uppgift ${i+1} av ${station.tasks.length} · del ${lesson?lesson.number+1:''} ${lesson?esc(lesson.title):''}</p><h2>${m(t.title)}</h2><p class="source">${m(t.source)}</p>`;
  $('#steps').innerHTML=STEG.map((s,k)=>`<li${k===p?' aria-current="step"':''}${k<p?' class="klart"':''}>${k+1}. ${s}</li>`).join('');
  const box=$('#work');
  if(p===0){
    box.innerHTML=`<p class="prompt">${m(t.prompt)}</p><details><summary>Visa metod och exempel</summary><p>${m(t.method)}</p></details>${hjalpHtml([t.prompt,t.method,t.source].join(' '))}
    <form id="predict" novalidate>${t.fields.map(([k,l,u])=>`<label>Min förutsägelse: ${m(l)} (${u})<input name="${k}" inputmode="decimal" autocomplete="off" value="${Number.isFinite(r.predicted?.[k])?esc(n2(r.predicted[k])):''}"></label>`).join('')}
    <p id="err" role="alert"></p><button type="submit" class="primary">Spara förutsägelsen – Erik visar mätningen</button></form>`;
    box.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const f=e.target,inp={};for(const [k] of t.fields)inp[k]=f.elements[k].value;
      const fel=station.predict(inp);if(fel){$('#err').textContent=fel;return;}render(true);startDemo();});
    setScene(false);
  }else if(p===1){
    const lines=takter(t,room?room.points:{}).map(b=>b.say).filter(Boolean);
    box.innerHTML=`<p class="erik-note">Din förutsägelse är sparad. Nu visar Erik hur mätningen görs. Avläsningen syns när han är klar.</p>
    <ol class="erik-lines">${lines.map((s,k)=>`<li data-line="${k}">${esc(s)}</li>`).join('')}</ol>
    <div class="row"><button id="replay" type="button">Visa igen</button><button id="skip" type="button" class="primary">${room?'Hoppa fram till avläsningen':'Visa avläsningen'}</button></div>`;
    $('#replay').onclick=startDemo;$('#skip').onclick=()=>{if(room)room.skip();else{station.shown();render(true);}};
    setScene(false);
  }else if(p===2){
    const v=station.verdict(),alla=v.every(x=>x.ok);
    box.innerHTML=`<p class="verdict ${alla?'ok':'fel'}">${alla?'✓ Rätt! Din förutsägelse stämmer med avläsningen.':'! Din förutsägelse skiljer sig från avläsningen. Kontrollera metod och enheter, eller ändra din beräkning.'}</p>
    <dl class="readings">${v.map(x=>`<div><dt>${m(x.label)}</dt><dd>Din förutsägelse: <strong>${n2(x.predicted)} ${x.unit}</strong></dd><dd>Avläst: <strong>${n2(x.value)} ${x.unit}</strong> · ${m(x.kalla.text)}</dd><dd>${x.ok?'Rätt!':'Skiljer sig'}</dd></div>`).join('')}</dl>
    <p class="muted">Avläsningarna är simulerade, med ideala komponenter.</p>
    <div class="row"><button id="revise" type="button">Ändra förutsägelsen</button><button id="explain" type="button" class="primary">Förklara</button></div>`;
    $('#revise').onclick=()=>{station.revise();render(true);};$('#explain').onclick=()=>{station.toExplain();render(true);};
    setScene(true);
  }else{
    const nx=station.next();
    box.innerHTML=`<p class="prompt">${m(t.explain)}</p><p class="muted">${m(t.hint)}</p><form id="expl" novalidate><label>Min förklaring<textarea name="x" rows="4">${esc(r.explanation)}</textarea></label><p id="err" role="alert"></p>
    <div class="row"><button type="submit" class="primary">Spara förklaringen</button><button id="again" type="button">Se avläsningen igen</button></div></form>
    ${r.explanation?`<p class="saved">Sparad. Läraren bedömer din metod och förklaring.</p>${nx?`<button id="next" type="button" class="primary">Nästa uppgift: ${m(nx.title)}</button>`:'<p><strong>Alla åtta uppgifter är gjorda.</strong> Skriv ut protokollet nedan.</p>'}`:''}`;
    box.querySelector('form').onsubmit=e=>{e.preventDefault();const fel=station.explain(e.target.elements.x.value);if(fel){$('#err').textContent=fel;return;}render(true);};
    $('#again').onclick=()=>{station.select(t.id);render(true);};
    if(nx&&r.explanation)$('#next').onclick=()=>{station.select(nx.id);room?.goHome();render(true);};
    setScene(true);
  }
  $('#read').innerHTML=las(t);
  $('#progress').textContent=`${station.done()} av ${station.tasks.length} uppgifter förklarade. Svaren sparas bara i den här webbläsaren${station.storageOK?'':' – lagring är blockerad, skriv ut eller ladda ner protokollet'}.`;
  renderProtocol();
  if(focus)$('#task-head h2')?.focus?.({preventScroll:false});
}

function startDemo(){
  const t=station.task;
  if(!room){render();return;}
  const beats=takter(t,room.points);
  room.play(beats,{onSay(s){$('#erik-say').textContent=s?`Erik: ${s}`:'';document.querySelectorAll('.erik-lines li').forEach(li=>li.classList.toggle('now',li.textContent===s));},
    onDone(){if(station.phase===1&&station.task===t){station.shown();render();}}});
}

function renderProtocol(){
  const rows=station.protocol();
  $('#protocol').innerHTML=`<p>D = ${station.D} · utskrivet ${tid(new Date().toISOString())} · ideal simulering i Maskinrummet (Station B)</p><table><thead><tr><th>Uppgift</th><th>Storhet</th><th>Första förutsägelse</th><th>Försök</th><th>Avläst</th><th>Stämde första</th><th>Förklaring</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${m(x.uppgift)}</td><td>${m(x.storhet)}</td><td>${Number.isFinite(x.forsta)?`${n2(x.forsta)} ${x.enhet}<br><small>${tid(x.forstaTid)}</small>`:'–'}</td><td>${x.forsok||'–'}</td><td>${Number.isFinite(x.varde)?`${n2(x.varde)} ${x.enhet}<br><small>${m(x.kalla)}</small>`:'–'}</td><td>${x.stammer===null?'–':x.stammer?'Ja':'Nej'}</td><td>${esc(x.forklaring)||'–'}</td></tr>`).join('')}</tbody></table>`;
}
function csv(){
  const cell=s=>'"'+String(s??'').replace(/^(\s*[=+@-])/,"'$1").replaceAll('"','""')+'"';
  const lines=[['D',station.D],['Typ','Maskinrummet Station B, ideal simulering'],['Uppgift','Övning','Storhet','Enhet','Första förutsägelse','Tid första','Senaste förutsägelse','Försök','Avläst','Stämde första','Förklaring']];
  for(const x of station.protocol())lines.push([markText(x.uppgift),x.ovning,markText(x.storhet),x.enhet,n2(x.forsta),tid(x.forstaTid),n2(x.senaste),x.forsok,Number.isFinite(x.varde)?n2(x.varde):'',x.stammer===null?'':x.stammer?'Ja':'Nej',x.forklaring]);
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+lines.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv'}));a.download='maskinrummet-station-b.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}

$('#task-pick').addEventListener('change',e=>{station.select(e.target.value);room?.goHome();render(true);});
$('#print').addEventListener('click',()=>{$('#protocol-box').open=true;window.print();});
$('#csv').addEventListener('click',csv);
$('#overview').addEventListener('click',()=>room?.setShot('bank'));
$('#flat').addEventListener('click',()=>{flat=!flat;$('#scene').hidden=flat;room?.setVisible(!flat);$('#flat').setAttribute('aria-pressed',String(flat));$('#flat').textContent=flat?'Visa 3D':'Bara text';});

render();
try{
  const {mountStationB}=await import('./scen.mjs?v=20261003-erik');
  room=mountStationB($('#scene'),{onFailure(){room=null;$('#scene').hidden=true;$('#scene-status').hidden=false;$('#scene-status').textContent='3D-vyn avbröts. Allt fungerar med texten bredvid.';render();}});
  $('#scene-status').hidden=true;render();room.snap();
  if(station.phase===1)startDemo();
}catch(error){console.warn('Station B: textläge',error);$('#scene').hidden=true;$('#scene-status').textContent='3D är inte tillgängligt. Eriks steg står i texten bredvid, och alla uppgifter fungerar.';$('#overview').disabled=true;$('#flat').disabled=true;render();}

export function inspect(){return {task:station.task.id,phase:station.phase,D:station.D,scene:room?.inspect()||null};}
export function screenPoint(name){return room?.screenPoint(name);}
export function snap(){room?.snap();}

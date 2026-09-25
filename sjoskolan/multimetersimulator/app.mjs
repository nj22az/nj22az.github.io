import { initialState, network, measure, lampCurrent, MODES, RIGS, rigOf } from './model.mjs';
import { mountProtocol } from '../gemensamt/labbprotokoll.mjs?v=20260926';
import { STATION_A_PROTOKOLL } from './stationA-protokoll.mjs?v=20260926';
import { LESSONS, acceptsAnswer } from './lessons.mjs?v=20260926';
import { protocolCSV } from './protocol.mjs';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = 'sjoskolan-multimeter-v1';
let saved = {done:[],records:[],revisions:{}}, storageOK = true;
try {
  const data = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (data) saved = {done:Array.isArray(data.done) ? data.done.filter(id=>LESSONS.some(l=>l.id===id&&(!l.revision||data.revisions?.[id]===l.revision))) : [], records:Array.isArray(data.records) ? data.records.filter(r=>typeof r.lesson==='string'&&typeof r.time==='string').slice(-200) : [], revisions:data.revisions||{}};
} catch { storageOK = false; }
let lessonIndex = 0, stage = 0, passed = false, free = false, choice = null;
let state = initialState(), activeProbe = 'black', sound = false, audioContext = null;
let answers = {};
// Varje elev får en egen rigg (1–6), som på en fysisk station. Läraren kan tilldela med ?rigg=3.
function myRig(){
  const asked=Number(new URLSearchParams(location.search).get('rigg'));
  if(asked>=1&&asked<=6)return asked;
  try{const r=Number(localStorage.getItem('sjoskolan-station-a-rigg'));if(r>=1&&r<=6)return r;const n=1+Math.floor(Math.random()*6);localStorage.setItem('sjoskolan-station-a-rigg',String(n));return n;}catch{return 1+Math.floor(Math.random()*6);}
}
let drag = null, ignoreClickUntil = 0, confirmClear = false;
const dialStops = $$('#functions [data-mode]').map(button => ({
  mode:button.dataset.mode, angle:Number(button.dataset.angle), button
}));
const dialNames = {off:'OFF, avstängd', dc:'Likspänning, V ⎓', ac:'Växelspänning, V ~', ohm:'Resistans, Ω', continuity:'Kontinuitet, summer', current:'Likström, A ⎓'};
let dialDrag = null;
// Printed labels and detent marks share the knob's angle convention: zero is up.
for (const stop of dialStops) {
  const radians=stop.angle*Math.PI/180;
  stop.button.style.left=`${50+42*Math.sin(radians)}%`;
  stop.button.style.top=`${50-42*Math.cos(radians)}%`;
  const tick=document.createElement('span');
  tick.className='dial-tick';tick.setAttribute('aria-hidden','true');
  tick.style.left=`${50+29*Math.sin(radians)}%`;
  tick.style.top=`${50-29*Math.cos(radians)}%`;
  tick.style.transform=`translate(-50%,-50%) rotate(${stop.angle}deg)`;
  $('#functions').append(tick);
}
const positions = {
  lamp:{K1:[210,75],K2:[365,75],P1:[485,135],P2:[300,235]},
  resistor:{A:[140,165],B:[460,165]},
  fuse:{A:[145,160],B:[455,160]},
  divider:{S:[150,65],M:[390,165],G:[300,265]},
  station:{P:[170,70],A:[280,70],B:[420,165],N:[300,265],'Ref+':[535,95],'Ref−':[535,160]}
};
const titles = {lamp:'Hyttbelysning',resistor:'Resistorer · frikopplad krets',fuse:'Säkring · urtagen',divider:'Spänningsdelare · 10 V DC',station:'Station A · DC-delare'};
const principle = {
  lamp:['V parallellt · A i serie','V-ingången har hög resistans. A-ingången har låg resistans och får aldrig kopplas direkt över en spänningskälla.'],
  resistor:['Mätaren ser alla strömvägar','Mät spänningslöst. En parallell komponent ändrar det värde som ohmmetern visar.'],
  fuse:['OL är inte noll','En öppen krets ger OL. Låg resistans ger kontaktsignal i summerläget.'],
  divider:['Mätaren är en del av kretsen','Ingångsresistansen ligger parallellt med den del du mäter över. Därför kan mätvärdet ändras.'],
  station:['Samma station som på den fysiska träffen','Kontrollera instrumentet mot referensen, mät R spänningslöst och räkna förväntade värden innan du mäter. Riggens verkliga värden avviker lite från de nominella, precis som på en fysisk rigg. Fyll i labbprotokollet under simulatorn.'],
  category:['Läs hela märkningen','Kontrollera mätmiljö, spänning, uttag och tillbehör. Ett högre volt-tal ersätter inte rätt CAT-kategori.']
};
function save() {
  try {localStorage.setItem(KEY,JSON.stringify(saved));storageOK=true;} catch {storageOK=false;}
  renderProgress();
}
function feedback(title,text,type='info') {
  $('#feedback-title').textContent=title; $('#feedback-text').textContent=text;
  $('#feedback').className=`feedback ${type}`;
}
function currentLesson(){return LESSONS[lessonIndex];}
function currentStep(){return currentLesson().steps[stage];}
function isLoading(){return !free&&currentLesson().id==='loading';}
function clearAnswer(){choice=null;$('#number-answer').value='';$('#lesson-comment').value='';}
function renderProtocol(){
  const rows=$('#protocol-rows');rows.replaceChildren();
  for(const r of saved.records){
    const tr=document.createElement('tr');
    for(const value of [`${r.lesson} / ${r.step}`,r.moment||'Mätning / svar',r.reading,r.comment||'—']){
      const td=document.createElement('td');td.textContent=value;tr.append(td);
    }
    rows.append(tr);
  }
}

function renderProgress(){
  $('#progress').textContent=`${saved.done.length} av ${LESSONS.length} klara`;
  $('#record-count').textContent=`${saved.records.length ? saved.records.length+' kontrollerade moment.' : 'Inga kontrollerade mätningar ännu.'} ${storageOK ? 'Framsteg sparas på denna enhet.' : 'Lagring är avstängd. Ladda ner protokollet innan du lämnar sidan.'}`;
  $('#download-log').disabled=!saved.records.length;
  $('#lesson-select').innerHTML=LESSONS.map((l,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${l.title}${saved.done.includes(l.id)?' · klar':''}</option>`).join('');
  $('#lesson-select').value=lessonIndex;
  renderProtocol();
}
function startLesson(index, updateURL=true) {
  lessonIndex=index;stage=0;passed=false;free=false;answers={};clearAnswer();
  const l=currentLesson();state={...initialState(l.circuit),...l.setup};
  if(l.circuit==='station')state.rig=myRig();
  activeProbe='black';$('#hint').open=false;
  if(updateURL) history.replaceState(null,'',`?ovning=${l.id}`);
  renderAll();feedback('Börja med uppgiften',l.id==='loading'?'Läs schemat och svara först utan att koppla. Mätaren används i mätstegen.':l.circuit==='category'?'Läs situationen, välj ett alternativ och kontrollera ditt svar.':'Förutsäg mätvärdet. Välj sedan funktion och uttag, och anslut mätspetsarna.');
}
function renderLesson() {
  const l=currentLesson(),step=currentStep();
  $('#free-mode').setAttribute('aria-pressed',String(free));
  $('#free-mode').textContent=free?'Till handledd övning':'Fri övning';
  $('#lesson-number').textContent=free?'Fri övning':`Övning ${String(lessonIndex+1).padStart(2,'0')} / ${String(LESSONS.length).padStart(2,'0')}`;
  $('#slide-ref').textContent=free?'':`Bild ${l.slides}`;
  $('#lesson-title').textContent=free?'Undersök själv':l.title;
  $('#lesson-goal').textContent=free?'Ändra koppling och inställningar. Se vad som händer.':l.goal;
  $('#task').textContent=step.task;
  $('#task-heading').textContent=`Steg ${stage+1} av ${l.steps.length}${step.label?' · '+step.label:''}`;
  $('#task').hidden=free;$('#task-heading').hidden=free;$('#step-marker').hidden=free;
  $('#hint').hidden=free;$('#check').hidden=free||passed;$('#next').hidden=free||!passed;
  $('#check').textContent=l.circuit==='category'||step.kind&&step.kind!=='measurement'?'Kontrollera svaret':'Kontrollera mätningen';
  $('#next').textContent=stage<l.steps.length-1?'Nästa steg →':lessonIndex<LESSONS.length-1?'Nästa övning →':'Se ditt resultat';
  $('#hint-text').textContent=step.hint;
  $('#step-marker').innerHTML=l.steps.map((_,i)=>`<span class="${i<stage?'done':i===stage?'active':''}"></span>`).join('');
  $('#step-marker').setAttribute('aria-label',`Steg ${stage+1} av ${l.steps.length}`);
  $('#free-settings').hidden=!free;$('#free-circuit').value=state.circuit;
  const p=principle[state.circuit];$('#principle-title').textContent=p[0];$('#principle-text').textContent=p[1];
  const cat=state.circuit==='category';$('#workbench').hidden=cat;$('#category-area').hidden=!cat;$('#meter-detail').hidden=cat;
  renderLoading();
  if(cat){$('#cat-question').textContent=step.task;$('#cat-choices').innerHTML=step.choices.map((label,i)=>`<button data-choice="${i}" aria-pressed="${i===choice}">${label}</button>`).join('');}
}
function renderLoading() {
  const active=isLoading(),step=currentStep(),theory=active&&step.kind!=='measurement';
  for(const el of $$('#nodes, .probe-selects, .circuit-controls, .meter, .probe'))el.inert=Boolean(theory||active&&passed);
  $('#workbench').classList.toggle('prediction-mode',theory);
  $('#lesson-answer').hidden=!theory;
  for(const id of ['number-label','number-answer','number-help'])$('#'+id).hidden=step.kind!=='number';
  $('#number-answer').disabled=passed;
  $('#comment-field').hidden=!step.comment;
  $('#lesson-comment').disabled=passed;
  $('#lesson-choices').replaceChildren();
  if(theory&&step.choices)step.choices.forEach((label,i)=>{
    const b=document.createElement('button');b.type='button';b.dataset.answerChoice=i;b.textContent=label;
    b.setAttribute('aria-pressed',String(choice===i));b.disabled=passed;$('#lesson-choices').append(b);
  });
  $('#loading-comparison').hidden=!active||!answers.unloaded;
  $('#loading-working').hidden=!answers.measure1;
  $('#loading-results').replaceChildren();
  for(const [key,label] of [['unloaded','Utan mätare (beräknat)'],['measure10','Mätt med 10 MΩ'],['measure1','Mätt med 1 MΩ']]){
    const tr=document.createElement('tr'),name=document.createElement('th'),value=document.createElement('td');
    name.scope='row';name.textContent=label;value.textContent=answers[key]?(key==='unloaded'?'5,00 V':Math.abs(answers[key].value).toFixed(2).replace('.',',')+' V'):'Inte mätt ännu';tr.append(name,value);$('#loading-results').append(tr);
  }
  $('#measurement-actions').hidden=!active||theory;
  $('#check-reading').hidden=passed;$('#next-reading').hidden=!passed;
  $('#measurement-help').textContent=passed?'Mätningen är sparad. Fortsätt till nästa steg.':'När displayen visar ett värde: kontrollera här.';
}
function renderLoadingCircuit(){
  const active=isLoading(),step=currentStep(),divider=state.circuit==='divider';
  $('#input-help').hidden=!divider;$('#divider-key').hidden=!divider;
  $('#wiring-guide').hidden=!active||step.kind!=='measurement';
  const points=['M','G'].includes(state.red)&&['M','G'].includes(state.black)&&state.red!==state.black;
  const checks=[['Välj V ⎓ på ratten',state.mode==='dc'],['Röd sladd i V Ω-uttaget',state.jack==='v'],['Svart spets till G och röd till M (eller tvärtom)',points],[`Simulerad ingångsresistans: ${step.input===1e6?'1':'10'} MΩ`,state.input===step.input],['Slå på 10 V',state.power]];
  $('#wiring-checklist').replaceChildren();
  if(active&&step.kind==='measurement')for(const [label,done] of checks){const li=document.createElement('li');li.textContent=(done?'Klart: ':'Nästa: ')+label;li.classList.toggle('complete',done);$('#wiring-checklist').append(li);}
  if($('#input'))$('#input').disabled=active&&step.key!=='measure1';
  const panel=$('#loading-observation');panel.hidden=!active;
  if(!active)return;
  const m=measure(state);
  if(step.key==='unloaded')panel.textContent=passed?'Beräknat utan mätare: 10 V / 2 = 5,00 V mellan M och G.':'Tänk först: R1 och R2 är lika stora. Mätspetsarna är ännu inte anslutna.';
  else if(step.key==='predict10')panel.textContent='Förutsäg först. En voltmeter är en extra strömväg – vad händer med spänningen?';
  else if(step.key==='predict1')panel.textContent='Mätningen med 10 MΩ är sparad. Förutsäg nu vad en lägre ingångsresistans gör.';
  else if(points&&state.jack==='v'&&state.mode==='dc'&&m.code==='reading'&&state.power){
    panel.textContent=`Mätaren ligger parallellt med R2. Display: ${m.text} V. `+(step.key==='kirchhoff'&&!passed?'Beräkna nu spänningsfallet över R1 utan att flytta mätaren.':step.key==='explain'||step.key==='kirchhoff'&&passed?'I samma koppling: 6,67 V över R1 + 3,33 V över R2 = 10,00 V.':'Jämför med 5,00 V utan mätare.');
  } else panel.textContent='Den streckade grenen visas när V-ingången är ansluten mellan två olika mätpunkter. Följ kopplingshjälpen nedan.';
}
function loadingHint(m){
  const step=currentStep();
  if(state.trip)return m.detail;
  if(state.jack!=='v')return 'Bryt matningen och flytta röd sladd till V Ω. Strömuttaget används inte här.';
  if(state.mode!=='dc')return 'Välj V ⎓ på ratten. Kretsen matas med likspänning.';
  if(!['M','G'].includes(state.red)||!['M','G'].includes(state.black)||state.red===state.black)return 'Sätt en spets på M och den andra på G. Mätaren ska ligga parallellt med R2.';
  if(state.input!==step.input)return `Välj ${step.input===1e6?'1':'10'} MΩ under schemat.`;
  if(!state.power)return 'Slå på 10 V under schemat för att mäta spänningen.';
  return m.detail;
}
function circuitSVG() {
  const wire = d=>`<path class="wire" d="${d}"/>`;
  const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
  let body='';
  if(state.circuit==='lamp') {
    const lit=lampCurrent(state)>.005;
    body=wire('M 210 75 H 105 V 144 M 105 166 V 235 H 485 V 188 M 365 75 H 485 V 142')+
      `<path class="part" d="M 84 144 H 126 M 92 166 H 118"/><text x="67" y="140">+</text><text x="67" y="177">−</text>`+
      label(105,210,`${state.voltage} V DC`)+
      `<circle class="part ${lit?'live-lamp':''}" cx="485" cy="165" r="23"/><path class="wire" d="M 469 149 L 501 181 M 501 149 L 469 181"/>`+
      label(485,215,`${state.load} Ω`)+label(290,39,state.link?'Länk sluten':'Länk öppen')+
      wire(state.link?'M 210 75 H 365':'M 210 75 L 327 49')+
      label(300,293,lit?'Lampan lyser':'Lampan släckt');
  } else if(state.circuit==='resistor') {
    body=wire('M 140 165 V 100 H 260 M 340 100 H 460 V 165')+`<rect class="part" x="260" y="87" width="80" height="26"/>`+label(300,68,'R1 · 1 kΩ')+
      wire('M 140 165 V 235 H 195 M 225 235 H 260 M 340 235 H 460 V 165')+
      `<rect class="part" x="260" y="222" width="80" height="26"/>`+wire(state.parallel?'M 195 235 H 225':'M 195 235 L 218 212')+label(300,277,'R2 · 1 kΩ')+label(300,165,'Ingen extern matning');
  } else if(state.circuit==='fuse') {
    body=wire('M 145 160 H 245 M 355 160 H 455')+`<rect class="part" x="245" y="139" width="110" height="42" rx="5"/>`+
      wire(state.broken?'M 245 160 H 282 M 316 160 H 355':'M 245 160 H 355')+label(300,103,state.broken?'Avbrott i säkringen':'Hel säkring · 0,2 Ω')+label(300,225,'Urtagen och spänningslös');
  } else if(state.circuit==='divider') {
    body=wire('M 150 65 H 390 V 92 M 390 138 V 192 M 390 238 V 265 H 100 V 172 M 100 150 V 65 H 150')+
      `<path class="part" d="M 79 150 H 121 M 87 172 H 113"/><text x="64" y="146">+</text><text x="64" y="184">−</text>`+
      `<rect class="part" x="377" y="92" width="26" height="46"/><rect class="part" x="377" y="192" width="26" height="46"/>`+
      label(100,217,'10 V DC')+label(285,122,'R1 · 1 MΩ')+label(285,220,'R2 · 1 MΩ');
    if(state.jack==='v'&&['dc','ac'].includes(state.mode)&&state.red&&state.black&&state.red!==state.black){
      const ys={S:65,M:165,G:265},top=Math.min(ys[state.red],ys[state.black]),bottom=Math.max(ys[state.red],ys[state.black]),mid=(top+bottom)/2;
      body+=`<g class="meter-branch"><title>Mätarens ingångsresistans mellan ${state.red} och ${state.black}</title><path d="M 390 ${top} H 535 V ${mid-19} M 535 ${mid+19} V ${bottom} H 390"/><rect x="522" y="${mid-19}" width="26" height="38"/>${label(535,top-13,'Mätaren')}${label(510,bottom+24,'Rin = '+(state.input/1e6)+' MΩ')}</g>`;
    }
  } else if(state.circuit==='station') {
    const g=rigOf(state);
    body=wire('M 100 150 V 70 H 170 M 280 70 H 420 V 95 M 420 141 V 192 M 420 238 V 265 H 100 V 172')+
      `<path class="part" d="M 79 150 H 121 M 87 172 H 113"/><text x="64" y="146">+</text><text x="64" y="184">−</text>`+
      wire(state.link?'M 170 70 H 280':'M 170 70 L 262 46')+label(225,100,state.link?'Länk P–A sluten':'Länk P–A öppen')+
      `<rect class="part" x="407" y="95" width="26" height="46"/><rect class="part" x="407" y="192" width="26" height="46"/>`+
      label(100,217,`${g.Unom} V DC`)+label(100,236,'SELV')+label(335,114,'R1 · 1 kΩ')+label(335,134,'±5 %')+label(335,212,'R2 · 2 kΩ')+label(335,232,'±5 %')+
      `<rect class="part" x="497" y="70" width="76" height="115" rx="6"/>`+label(535,210,'Referens')+label(535,230,'5,000 V')+
      label(250,325,`${g.name} · strömgräns 100 mA`);
  }
  return `<title id="diagram-title">${titles[state.circuit]}. Använd knapparna för mätpunkterna.</title>${body}`;
}
function renderCircuit() {
  if(state.circuit==='category')return;
  $('#diagram').innerHTML=circuitSVG();
  $('#circuit-title').textContent=state.circuit==='lamp'?`${titles.lamp} · ${state.voltage} V DC`:titles[state.circuit];
  $('#source-status').textContent=['resistor','fuse'].includes(state.circuit)?'Frikopplad':state.power?'Matning till':'Matning bruten';
  if(state.circuit==='station')$('#circuit-title').textContent=`${titles.station} · ${rigOf(state).name}`;
  $('#source-status').classList.toggle('on',state.power);
  const points=positions[state.circuit];
  $('#nodes').innerHTML=Object.entries(points).map(([name,[x,y]])=>`<button class="node" data-node="${name}" data-black="${state.black===name}" data-red="${state.red===name}" style="left:${x/6}%;top:${y/3.4}%" aria-label="Mätpunkt ${name}${state.black===name?', svart ansluten':''}${state.red===name?', röd ansluten':''}"><span class="node-dot"></span><span class="node-name">${name}</span></button>`).join('');
  const options='<option value="">Ej ansluten</option>'+Object.keys(points).map(n=>`<option value="${n}">${n}</option>`).join('');
  for(const color of ['black','red']){
    $(`#${color}-node`).innerHTML=options;$(`#${color}-node`).value=state[color]||'';
    const probe=$(`#probe-${color}`);probe.setAttribute('aria-pressed',String(activeProbe===color));
  }
  let controls='';
  if(['lamp','divider','station'].includes(state.circuit))controls+=`<button id="power" aria-pressed="${state.power}">${state.power?'Bryt matningen':'Slå på '+(state.circuit==='lamp'?state.voltage:state.circuit==='station'?rigOf(state).Unom:10)+' V'}</button>`;
  if(state.circuit==='station')controls+=`<button id="link" aria-pressed="${!state.link}">${state.link?'Öppna länken P–A':'Slut länken P–A'}</button><label>Rigg<select id="rig">${RIGS.filter(g=>free||g.id>0).map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select></label>`;
  if(state.circuit==='lamp'){
    controls+=`<button id="link" aria-pressed="${!state.link}">${state.link?'Öppna länken K1–K2':'Slut länken K1–K2'}</button>`;
    if(free)controls+=`<label>Källa<select id="voltage"><option value="12">12 V</option><option value="24">24 V</option></select></label><label>Lampa<select id="load"><option value="120">120 Ω</option><option value="30">30 Ω</option></select></label>`;
  }
  if(state.circuit==='resistor')controls+=`<button id="parallel" aria-pressed="${state.parallel}">${state.parallel?'Frikoppla R2':'Anslut R2 parallellt'}</button>`;
  if(state.circuit==='fuse')controls+=`<button id="broken" aria-pressed="${state.broken}">${state.broken?'Sätt i hel säkring':'Simulera avbrott'}</button>`;
  if(state.circuit==='divider')controls+=`<label>Simulerad ingångsresistans<select id="input" aria-describedby="input-help"><option value="10000000">10 MΩ</option><option value="1000000">1 MΩ</option></select></label>`;
  $('#circuit-controls').innerHTML=controls;
  for(const k of ['voltage','load','input','rig'])if($(`#${k}`))$(`#${k}`).value=state[k];
  renderLoadingCircuit();
  $('#connection-help').textContent=`${activeProbe==='black'?'Svart':'Röd'} spets vald. Tryck på en mätpunkt, dra spetsen eller välj i listan nedan.`;
}
function drawLeads(pointer=null) {
  if(state.circuit==='category')return;
  const bench=$('#workbench').getBoundingClientRect();
  if(!bench.width)return;
  $('#leads').setAttribute('viewBox',`0 0 ${bench.width} ${bench.height}`);
  const center=el=>{const r=el.getBoundingClientRect();return{x:r.left+r.width/2-bench.left,y:r.top+r.height/2-bench.top};};
  let paths='';
  for(const c of ['black','red']){
    const anchor=c==='black'?$('#black-anchor'):$(`.jack[data-jack="${state.jack}"] i`);
    const target=state[c]?$(`.node[data-node="${state[c]}"]`):$(`#probe-${c}`);
    if(!anchor||!target)continue;
    const a=center(anchor),b=pointer&&drag?.color===c?{x:pointer.x-bench.left,y:pointer.y-bench.top}:center(target);
    const offset=c==='black'?18:35,route=Math.min(bench.height-7,Math.max(a.y,b.y)+offset);
    paths+=`<path d="M ${a.x} ${a.y} C ${a.x} ${route}, ${b.x} ${route}, ${b.x} ${b.y}" fill="none" stroke="white" stroke-width="6" opacity=".65"/><path d="M ${a.x} ${a.y} C ${a.x} ${route}, ${b.x} ${route}, ${b.x} ${b.y}" fill="none" stroke="${c==='black'?'#263540':'#be313b'}" stroke-width="3.5" stroke-linecap="round"/>`;
  }
  $('#leads').innerHTML=paths;
}
function renderMeter() {
  if(state.circuit==='category')return;
  const m=measure(state);
  $('#reading').textContent=m.text;$('#unit').textContent=m.unit;$('#meter-detail').textContent=m.detail;
  $('#screen-mode').textContent=MODES[state.mode];$('#screen-range').textContent=['dc','ac'].includes(state.mode)?(state.range==='auto'?'AUTO':state.range+' V'):'';
  $('#beep-status').textContent=m.beep?'KONTAKT · TON':'\u00a0';
  dialStops.forEach(stop=>stop.button.setAttribute('aria-pressed',String(stop.mode===state.mode)));
  const dialIndex=dialStops.findIndex(stop=>stop.mode===state.mode);
  $('#dial-knob').style.setProperty('--dial-angle',`${dialStops[dialIndex].angle}deg`);
  $('#dial-knob').setAttribute('aria-valuenow',String(dialIndex));
  $('#dial-knob').setAttribute('aria-valuetext',dialNames[state.mode]);
  $$('.jack').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.jack===state.jack)));
  $('#range').value=state.range;$('#range').disabled=!['dc','ac'].includes(state.mode);
  $('#reset-protection').hidden=!state.trip&&!state.fuse;
  if(m.beep&&sound)beep();
}
function renderAll(){renderProgress();renderLesson();renderCircuit();renderMeter();requestAnimationFrame(()=>drawLeads());}
function selectProbe(color){activeProbe=color;renderCircuit();drawLeads();}
function change(key,value) {
  const rewiring=['jack','link','voltage','load','rig'].includes(key)||(['red','black'].includes(key)&&state.jack!=='v');
  if(state.power&&rewiring){
    feedback('Bryt matningen före omkoppling','Tryck på ”Bryt matningen”. Ändra sedan kretsen, strömuttaget eller mätspetsarnas placering.','warning');
    renderCircuit();renderMeter();drawLeads();return;
  }
  if(key==='power'&&value&&state.trip){feedback('Återställ mätarskyddet först','Lossa båda spetsarna och använd knappen ”Återställ mätarskydd”.','warning');return;}
  state[key]=value;
  const m=measure(state);
  if(m.trip){state.trip=m.trip;state.power=false;if(m.trip==='fuse')state.fuse=true;}
  renderCircuit();renderMeter();drawLeads();
  if(m.trip)feedback('Mätningen stoppades',m.detail+' Bryt, lossa spetsarna och rätta kopplingen före ett nytt försök.','danger');
  else if(['live-ohm','jack','fuse','tripped','overrange'].includes(m.code))feedback(m.code==='overrange'?'Området räcker inte':'Kontrollera kopplingen',m.detail,'warning');
  else if(free)feedback('Fri övning',m.detail);
  else feedback('Läs av och kontrollera',passed?'Steget är redan kontrollerat. Fortsätt med knappen i handledningen.':currentStep().task);
}
function check() {
  if(passed||free)return;
  const l=currentLesson(),step=currentStep(),theory=step.kind&&step.kind!=='measurement',m=l.circuit==='category'||theory?null:measure(state);
  const answer={value:$('#number-answer').value,choice,comment:$('#lesson-comment').value.trim()};
  const correct=theory?acceptsAnswer(step,answer):l.circuit==='category'?choice===step.correct:!state.trip&&step.test(state,m);
  if(correct){
    passed=true;
    answers[step.key||stage]=m?{value:m.value,text:m.text}:answer;
    const reading=m?`${m.text} ${m.unit}`:step.choices?step.choices[choice]:`${answer.value} ${step.unit}`;
    saved.records.push({time:new Date().toISOString(),lesson:l.title,step:stage+1,moment:step.label||step.task,kind:step.kind||'measurement',mode:m?state.mode:'',jack:m?state.jack:'',red:m?state.red||'':'',black:m?state.black||'':'',reading,input:m&&state.circuit==='divider'?state.input:'',comment:step.comment?answer.comment:'',revision:l.revision||1});
    saved.records=saved.records.slice(-200);
    if(stage===l.steps.length-1){if(!saved.done.includes(l.id))saved.done.push(l.id);saved.revisions[l.id]=l.revision||1;}
    save();renderLesson();renderCircuit();drawLeads();
    const polarity=isLoading()&&m?.value<0?' Beloppet är rätt. Minustecknet betyder att spetsarna är omvända.':'';
    feedback(theory?'Svaret är sparat':m?'Mätningen är sparad':'Rätt svar',step.why+polarity,'success');
  } else {
    let detail;
    if(theory)detail=step.kind==='number'?(answer.value.trim()?step.hint:'Skriv ditt svar i volt först.'):choice===null?'Välj ett alternativ först.':choice!==step.correct?step.hint:'Skriv också en egen förklaring med minst tre ord (minst 12 tecken). Den sparas i protokollet för lärarens uppföljning.';
    else if(l.circuit==='category')detail=choice===null?'Välj ett alternativ först.':step.hint;
    else if(isLoading())detail=loadingHint(m);
    else detail=m.code!=='reading'&&m.code!=='open'?m.detail:`Avläsningen är ${m.text} ${m.unit}. Kontrollera mätfunktion, uttag och placering mot uppgiften. ${step.hint}`;
    feedback('Prova igen',detail,'warning');
  }
}
function next() {
  if(!passed||free)return;
  if(stage<currentLesson().steps.length-1){stage++;passed=false;clearAnswer();if(isLoading()&&currentStep().key==='measure10')state.power=false;$('#hint').open=false;renderLesson();renderCircuit();renderMeter();drawLeads();feedback('Nästa steg',currentStep().task);$('#task-heading').scrollIntoView({behavior:'smooth',block:'nearest'});}
  else if(lessonIndex<LESSONS.length-1)startLesson(lessonIndex+1);
  else {feedback('Övningen är klar',`Du har klarat ${saved.done.length} av ${LESSONS.length} övningar. Ladda ner ditt mätprotokoll eller fortsätt med en annan övning.`,'success');$('#next').hidden=true;$('#record-count').scrollIntoView({behavior:'smooth',block:'center'});}
}
function beep(){
  try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.frequency.value=1800;g.gain.value=.025;o.connect(g);g.connect(audioContext.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.15);o.stop(audioContext.currentTime+.16);}catch{feedback('Ljud kunde inte spelas','Den synliga signalen KONTAKT visar kontinuitet även utan ljud.');}
}
$('#lesson-select').addEventListener('change',e=>startLesson(Number(e.target.value)));
$('#functions').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(b)change('mode',b.dataset.mode);});
function setDial(index) {
  const stop=dialStops[Math.max(0,Math.min(dialStops.length-1,index))];
  if(stop.mode!==state.mode)change('mode',stop.mode);
}
$('#dial-knob').addEventListener('keydown',e=>{
  const index=dialStops.findIndex(stop=>stop.mode===state.mode);
  const targets={ArrowRight:index+1,ArrowUp:index+1,ArrowLeft:index-1,ArrowDown:index-1,Home:0,End:dialStops.length-1};
  if(e.key in targets){e.preventDefault();setDial(targets[e.key]);}
});
function pointerAngle(e) {
  const rect=$('#dial-knob').getBoundingClientRect();
  const x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;
  return Math.hypot(x,y)<8?null:Math.atan2(x,-y)*180/Math.PI;
}
$('#dial-knob').addEventListener('pointerdown',e=>{
  if(e.button!==0||dialDrag)return;
  e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);
  dialDrag={id:e.pointerId,previous:pointerAngle(e),angle:dialStops.find(stop=>stop.mode===state.mode).angle};
  e.currentTarget.classList.add('turning');
});
$('#dial-knob').addEventListener('pointermove',e=>{
  if(!dialDrag||e.pointerId!==dialDrag.id)return;
  const angle=pointerAngle(e);if(angle===null)return;
  if(dialDrag.previous===null){dialDrag.previous=angle;return;}
  // Unwrap across 180 degrees, then enforce the physical OFF/A end stops.
  const delta=((angle-dialDrag.previous+540)%360)-180;
  dialDrag.previous=angle;
  dialDrag.angle=Math.max(dialStops[0].angle,Math.min(dialStops.at(-1).angle,dialDrag.angle+delta));
  const nearest=dialStops.reduce((best,stop,i)=>Math.abs(stop.angle-dialDrag.angle)<Math.abs(dialStops[best].angle-dialDrag.angle)?i:best,0);
  setDial(nearest);
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('#dial-knob').addEventListener(event,e=>{
  if(dialDrag&&dialDrag.id===e.pointerId){dialDrag=null;e.currentTarget.classList.remove('turning');}
});
$('.jacks').addEventListener('click',e=>{const b=e.target.closest('[data-jack]');if(b)change('jack',b.dataset.jack);});
$('#range').addEventListener('change',e=>change('range',e.target.value));
for(const color of ['black','red']){
  $(`#${color}-node`).addEventListener('change',e=>change(color,e.target.value||null));
  const probe=$(`#probe-${color}`);
  probe.addEventListener('click',()=>{if(Date.now()>ignoreClickUntil)selectProbe(color);});
  probe.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    activeProbe=color;drag={color,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};probe.setPointerCapture(e.pointerId);
    $$('.probe').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.probe===color)));
  });
  probe.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;
    if(drag.moved)drawLeads({x:e.clientX,y:e.clientY});
  });
  probe.addEventListener('pointerup',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const moved=drag.moved;drag=null;
    if(moved){
      ignoreClickUntil=Date.now()+300;
      const nearest=$$('.node').map(el=>{const r=el.getBoundingClientRect();return{el,d:Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)};}).sort((a,b)=>a.d-b.d)[0];
      if(nearest&&nearest.d<=38)change(color,nearest.el.dataset.node);
      else{drawLeads();feedback('Ingen mätpunkt vald','Släpp spetsen på en märkt mätpunkt. Du kan också välja mätpunkten i listan.');}
    } else selectProbe(color);
  });
  probe.addEventListener('pointercancel',()=>{drag=null;drawLeads();});
}
$('#nodes').addEventListener('click',e=>{const b=e.target.closest('[data-node]');if(b)change(activeProbe,b.dataset.node);});
$('#disconnect').addEventListener('click',()=>{state.red=null;state.black=null;renderCircuit();renderMeter();drawLeads();feedback('Mätspetsarna är lossade','Båda mätspetsarna är nu fria från kretsen.');});
$('#circuit-controls').addEventListener('click',e=>{
  const id=e.target.closest('button')?.id;if(['power','link','parallel','broken'].includes(id))change(id,!state[id]);
});
$('#circuit-controls').addEventListener('change',e=>{if(['voltage','load','input','rig'].includes(e.target.id))change(e.target.id,Number(e.target.value));});
$('#reset-protection').addEventListener('click',()=>{
  if(state.power||state.red||state.black){feedback('Lossa mätspetsarna först','Matningen ska vara bruten och båda spetsarna lossade innan skyddet återställs.','warning');return;}
  state.trip=null;state.fuse=false;renderMeter();feedback('Mätarskyddet återställt','Kontrollera funktion, uttag och koppling innan du slår på matningen igen.');
});
$('#sound').addEventListener('change',e=>{sound=e.target.checked;if(sound&&measure(state).beep)beep();});
$('#check').addEventListener('click',check);$('#next').addEventListener('click',next);
$('#check-reading').addEventListener('click',()=>{check();$('#feedback').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('#next-reading').addEventListener('click',next);
$('#lesson-choices').addEventListener('click',e=>{const b=e.target.closest('[data-answer-choice]');if(!b||passed)return;choice=Number(b.dataset.answerChoice);$$('#lesson-choices button').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.answerChoice)===choice)));});
$('#number-answer').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check();}});
$('#restart').addEventListener('click',()=>{if(free){state=initialState(state.circuit);renderAll();feedback('Kretsen återställd','Gör en ny koppling och undersök mätvärdet.');}else startLesson(lessonIndex);});
$('#cat-choices').addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b||passed)return;choice=Number(b.dataset.choice);renderLesson();});
$('#free-mode').addEventListener('click',()=>{
  if(free){startLesson(lessonIndex);return;}
  free=true;state=initialState();history.replaceState(null,'','?ovning=fri');renderAll();feedback('Fri övning','Välj krets och undersök hur mätvärdet påverkas. Du kan också prova felkopplingar i denna modell.');
});
$('#free-circuit').addEventListener('change',e=>{state=initialState(e.target.value);renderAll();feedback('Ny övningskrets','Välj funktion och uttag och anslut mätspetsarna.');});
$('#download-log').addEventListener('click',()=>{
  const csv=protocolCSV(saved.records,MODES);
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Multimeter_matprotokoll_'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('#clear-progress').addEventListener('click',()=>{
  if(!confirmClear){confirmClear=true;$('#clear-progress').textContent='Ja, nollställ framsteg';return;}
  saved={done:[],records:[],revisions:{}};save();confirmClear=false;$('#clear-progress').textContent='Nollställ framsteg';startLesson(0);
});
new ResizeObserver(()=>drawLeads()).observe($('#workbench'));
window.addEventListener('resize',()=>drawLeads());
const requested=new URLSearchParams(location.search).get('ovning');
startLesson(Math.max(0,LESSONS.findIndex(l=>l.id===requested)),false);
if(requested==='fri')$('#free-mode').click();

// Labbprotokoll för Station A: hämtar aktuell avläsning från simulatorn
mountProtocol(document.getElementById('labbprotokoll'),{...STATION_A_PROTOKOLL,snapshot(plan){
  if(state.circuit==='category')return {error:'Välj uppgiften ”Station A: DC-delare” i simulatorn.'};
  if(state.circuit!=='station')return {error:'Protokollet gäller Station A. Välj uppgiften ”Station A: DC-delare” eller kretsen Station A i fri övning.'};
  const n=plan?.need||{},pts=[state.red,state.black];
  const wrong=[];
  if(n.mode&&state.mode!==n.mode)wrong.push(`välj ${MODES[n.mode]}`);
  if(n.red&&(state.red!==n.red||state.black!==n.black))wrong.push(`röd på ${n.red} och svart på ${n.black}`);
  if(n.pair&&pts.slice().sort().join()!==n.pair.slice().sort().join())wrong.push(`spetsarna på ${n.pair.join(' och ')}`);
  if(n.power!==undefined&&state.power!==n.power)wrong.push(n.power?'slå på matningen':'bryt matningen');
  if(n.link!==undefined&&state.link!==n.link)wrong.push(n.link?'slut länken P–A':'öppna länken P–A');
  if(wrong.length)return {error:`Mätning ${STATION_A_PROTOKOLL.rows.indexOf(plan)+1} gäller en annan koppling: ${wrong.join(', ')}.`};
  const m=measure(state);
  if(m.code!=='reading')return {error:`Ingen giltig avläsning: ${m.detail}`};
  const jack=state.jack==='v'?'V Ω':state.jack==='ma'?'mA':'A';
  const drift=[`${MODES[state.mode]}, ${jack}-uttag`,['resistor','fuse'].includes(state.circuit)?'frikopplad':`matning ${state.power?'till':'bruten'}`];
  if(state.circuit==='station')drift.push(`länk ${state.link?'sluten':'öppen'}`,rigOf(state).name);
  return {punkter:`röd ${state.red} / svart ${state.black}`,drift:drift.join(', '),varde:`${m.text} ${m.unit}`};
}});

/* EL-LABB DC trainer – no login wall */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const state = {
    labId: "sakerhet", pendingJack: null, wires: [],
    switches: { start: false, stop: true, load: false, main: true },
    psuV: 12, batteryWeak: false, fuseBlown: false, relayOn: false,
    dmm: { mode: "V", com: null, pos: null }, fault: null,
    user: { name: "Gast", group: "" }, done: {}
  };
  const LABS = [
    { id: "sakerhet", nr: "0", title: "Elsakerhet", sub: "Mal 7 riskbedomning" },
    { id: "batteri", nr: "1", title: "Batteri tomgang/last", sub: "Mal 4-6 U0 UL Ri" },
    { id: "ohm", nr: "2", title: "Ohms lag", sub: "Mal 4-5 U I R" },
    { id: "serie", nr: "3", title: "Serie och parallell", sub: "Mal 4-5" },
    { id: "fall", nr: "4", title: "Spanningsfall", sub: "Mal 5-6" },
    { id: "meter", nr: "5", title: "Multimeterns lagen", sub: "Mal 6" },
    { id: "hall", nr: "6", title: "Hallkrets", sub: "Mal 4 och 8" },
    { id: "fel", nr: "7", title: "Felsokning", sub: "Mal 9" },
    { id: "schema", nr: "8", title: "Tolkning av schema", sub: "Mal 8" }
  ];
  const LAB_TEXT = {
    sakerhet: { h: "Labb 0 Riskbedomning", body: "<p>Bocka checklistan. Huvudbrytare OFF innan koppling. SELV 12/24 V.</p>" },
    batteri: { h: "Labb 1 Batteri", body: "<ol><li>Voltmeter over BAT, last OFF, nota U0.</li><li>Last ON, nota UL.</li><li>Mat I.</li><li>Ri = (U0-UL)/I.</li></ol>" },
    ohm: { h: "Labb 2 Ohms lag", body: "<p>PSU 12 V och R100 eller R220. Mat U och I. R = U/I.</p>" },
    serie: { h: "Labb 3 Serie och parallell", body: "<p>Tva lampor. Serie: delspanning. Parallell: stromdelning.</p>" },
    fall: { h: "Labb 4 Spanningsfall", body: "<p>PSU - KABEL - lampa. Mat U vid kalla och last.</p>" },
    meter: { h: "Labb 5 Multimeter", body: "<p>V over last, A i serie, ohm bara spanningslost.</p>" },
    hall: { h: "Labb 6 Hallkrets", body: "<p>24 V. PSU+ sakring stopp start A1. A2 till minus. 11-14 parallellt med start.</p>" },
    fel: { h: "Labb 7 Felsokning", body: "<p>Plantera fel. Mat bakat fran last.</p>" },
    schema: { h: "Labb 8 Dokumentera", body: "<p>Bygg en krets. Skriv kalla, last och skydd.</p>" }
  };
  function storageKey(){ return "ellab-progress:" + (state.user.name||"gast").toLowerCase(); }
  function loadUser(){ try{ const raw=localStorage.getItem("ellab-user"); if(raw) state.user=JSON.parse(raw); const p=localStorage.getItem(storageKey()); if(p) state.done=JSON.parse(p);}catch(e){} }
  function saveUser(){ localStorage.setItem("ellab-user", JSON.stringify(state.user)); localStorage.setItem(storageKey(), JSON.stringify(state.done)); }
  function jackEl(id){ return document.querySelector('[data-jack="'+id+'"]'); }
  function jackCenter(id){ const el=jackEl(id), board=$("#board"); if(!el||!board) return {x:0,y:0}; const hole=el.querySelector(".hole"); if(!hole) return {x:0,y:0}; const a=hole.getBoundingClientRect(); const b=board.getBoundingClientRect(); return {x:a.left+a.width/2-b.left,y:a.top+a.height/2-b.top}; }
  function drawWires(){ const svg=$("#wires"); if(!svg) return; const b=$("#board").getBoundingClientRect(); svg.setAttribute("viewBox","0 0 "+b.width+" "+b.height); svg.innerHTML=state.wires.map((w)=>{ const p1=jackCenter(w.a), p2=jackCenter(w.b), mid=(p1.x+p2.x)/2; return '<path d="M '+p1.x+' '+p1.y+' C '+mid+' '+p1.y+', '+mid+' '+p2.y+', '+p2.x+' '+p2.y+'" fill="none" stroke="'+w.color+'" stroke-width="5" stroke-linecap="round"/>'; }).join(""); }
  function addWire(a,b){ if(a===b) return; if(state.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a))) return; const colors=["#f0c14b","#e85d5d","#5da8e8","#3ee0b4","#d17bff","#ffa36b"]; state.wires.push({a,b,color:colors[state.wires.length%colors.length]}); render(); }
  function removeLastWire(){ state.wires.pop(); render(); }
  function clearWires(){ state.wires=[]; state.pendingJack=null; state.dmm.com=null; state.dmm.pos=null; render(); }
  function simulate(){
    const parts=[]; const link=(a,b,R,tag)=>{ if(R>1e8) return; parts.push({a,b,R,tag}); };
    state.wires.forEach(w=>link(w.a,w.b,0.02,"trad"));
    const psuOn=state.switches.main && !state.fuseBlown; const psuV=psuOn?state.psuV:0;
    const batV=state.batteryWeak?11.6:12.62; const batRi=state.batteryWeak?0.22:0.035;
    if(state.fault!=="spole") link("A1","A2",380,"spole"); else link("A1","A2",1e9,"spole-oppen");
    const lampR=6.86; link("L1+","L1-",lampR,"lampa1"); link("L2+","L2-",lampR,"lampa2");
    link("R100a","R100b",100,"R100"); link("R220a","R220b",220,"R220"); link("R470a","R470b",470,"R470");
    link("CAB+","CAB-", state.fault==="kabel"?1e9:0.42,"kabel");
    if(state.switches.load && state.fault!=="lastglapp") link("LOADA","LOADB",0.02,"lastbrytare");
    if(state.switches.main) link("MAINA","MAINB",0.02,"huvud");
    if(state.switches.start) link("STAR+","STAR-",0.03,"start");
    if(state.switches.stop && state.fault!=="stopp") link("STOP+","STOP-",0.03,"stopp");
    link("FUSE+","FUSE-", (state.fuseBlown||state.fault==="sakring")?1e9:0.02,"sakring");
    const sources=[]; if(psuV) sources.push({plus:"PSU+",minus:"PSU-",V:psuV,Ri:0.04,name:"PSU"});
    sources.push({plus:"BAT+",minus:"BAT-",V:batV,Ri:batRi,name:"BAT"});
    function solve(extra){
      const all=parts.concat(extra||[]);
      const ids=[...new Set(all.flatMap(p=>[p.a,p.b]).concat(sources.flatMap(s=>[s.plus,s.minus])))];
      const idx=Object.fromEntries(ids.map((n,i)=>[n,i])); const n=ids.length; if(!n) return {V:{},Icomp:{}};
      const k=sources.length, N=n+k; const G=Array.from({length:N},()=>Array(N).fill(0)); const z=Array(N).fill(0);
      const stamp=(a,b,R)=>{ const g=1/Math.max(R,1e-6); const i=idx[a], j=idx[b]; if(i==null||j==null) return; G[i][i]+=g; G[j][j]+=g; G[i][j]-=g; G[j][i]-=g; };
      all.forEach(p=>stamp(p.a,p.b,p.R)); sources.forEach(s=>stamp(s.plus,s.minus,s.Ri));
      sources.forEach((s,si)=>{ const ip=idx[s.plus], im=idx[s.minus], row=n+si; if(ip!=null){G[row][ip]+=1;G[ip][row]+=1;} if(im!=null){G[row][im]-=1;G[im][row]-=1;} z[row]=s.V; });
      const ref=idx["BAT-"]??idx["PSU-"]??0; for(let c=0;c<N;c++){G[ref][c]=0;G[c][ref]=0;} G[ref][ref]=1; z[ref]=0;
      const x=numericSolve(G,z); const V={}; ids.forEach((id,i)=>{V[id]=x[i]||0;}); const Icomp={};
      all.forEach(p=>{ Icomp[p.tag]=((V[p.a]||0)-(V[p.b]||0))/p.R; }); sources.forEach((s,si)=>{ Icomp[s.name]=x[n+si]||0; });
      return {V,Icomp};
    }
    let extra=[], sol=solve(extra); let relay=Math.abs(sol.Icomp.spole||0)>0.025 && state.fault!=="spole";
    if(relay) extra.push({a:"R11",b:"R14",R:0.03,tag:"NO"}); else extra.push({a:"R11",b:"R12",R:0.03,tag:"NC"});
    sol=solve(extra); relay=Math.abs(sol.Icomp.spole||0)>0.025 && state.fault!=="spole"; state.relayOn=relay;
    const Il1=Math.abs(((sol.V["L1+"]||0)-(sol.V["L1-"]||0))/lampR);
    const Il2=Math.abs(((sol.V["L2+"]||0)-(sol.V["L2-"]||0))/lampR);
    const fuseI=Math.abs(sol.Icomp.sakring||0);
    const result={V:sol.V,I:sol.Icomp,lamps:{L1:Il1,L2:Il2},relay,fuseI,warn:[],meter:"-",meterUnit:""};
    if(fuseI>8){ state.fuseBlown=true; result.warn.push("Sakring utlost over 8 A."); }
    result.warn=result.warn.concat(meterRead(sol,result)); return result;
  }
  function meterRead(sol,result){
    const warn=[]; const a=state.dmm.pos, b=state.dmm.com; if(!a||!b){ result.meter="-"; return warn; }
    const Va=sol.V[a], Vb=sol.V[b];
    if(state.dmm.mode==="V"){ const dv=(Va||0)-(Vb||0); result.meter=Number.isFinite(dv)?dv.toFixed(2):"-"; result.meterUnit="V"; }
    else if(state.dmm.mode==="A"){ const w=state.wires.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a)); if(w){ result.meter=(((sol.V[w.a]||0)-(sol.V[w.b]||0))/0.02).toFixed(2); result.meterUnit="A"; } else { result.meter="0.00"; result.meterUnit="A"; warn.push("A-lage: mat i serie genom en trad."); } }
    else { const live=Math.max(...Object.values(sol.V||{}).map(v=>Math.abs(v||0)),0); if(live>1.5){ result.meter="OL"; warn.push("Ohm mot spanning."); } else { const map=[["L1+","L1-",6.86],["L2+","L2-",6.86],["R100a","R100b",100],["R220a","R220b",220],["R470a","R470b",470]]; const hit=map.find(m=>(a===m[0]&&b===m[1])||(a===m[1]&&b===m[0])); result.meter=hit?hit[2].toFixed(1):"OL"; result.meterUnit="Ohm"; } }
    return warn;
  }
  function numericSolve(A,b){ const n=b.length; const M=A.map((row,i)=>row.concat([b[i]])); for(let i=0;i<n;i++){ let max=i; for(let r=i+1;r<n;r++) if(Math.abs(M[r][i])>Math.abs(M[max][i])) max=r; [M[i],M[max]]=[M[max],M[i]]; const piv=M[i][i]; if(Math.abs(piv)<1e-12) continue; for(let c=i;c<=n;c++) M[i][c]/=piv; for(let r=0;r<n;r++){ if(r===i) continue; const f=M[r][i]; for(let c=i;c<=n;c++) M[r][c]-=f*M[i][c]; } } return M.map(row=>row[n]||0); }
  function setPending(id){ if(state.pendingJack===id) state.pendingJack=null; else if(state.pendingJack){ addWire(state.pendingJack,id); state.pendingJack=null; } else state.pendingJack=id; render(); }
  function probe(which,id){ state.dmm[which]=id; render(); }
  function renderLabs(){ const finished=Object.keys(state.done).filter(k=>state.done[k]).length; $("#lab-list").innerHTML=LABS.map(l=>'<button class="lab-btn '+(state.labId===l.id?"active":"")+'" data-lab="'+l.id+'"><strong>'+(state.done[l.id]?"OK ":"")+l.nr+'. '+l.title+'</strong><small>'+l.sub+'</small></button>').join("")+'<p class="hint">'+finished+'/'+LABS.length+' moment · '+(state.user.name||"Gast")+'</p>'; const t=LAB_TEXT[state.labId]; $("#lab-copy").innerHTML='<div class="step"><h3>'+t.h+'</h3>'+t.body+'</div>'; }
  function renderBoardState(sim){ $("#lamp1").classList.toggle("on",(sim.lamps.L1||0)>0.15); $("#lamp2").classList.toggle("on",(sim.lamps.L2||0)>0.15); $("#sw-load").classList.toggle("on",state.switches.load); $("#sw-main").classList.toggle("on",state.switches.main); $("#sw-stop").classList.toggle("on",state.switches.stop); $("#sw-start").classList.toggle("held",state.switches.start); $("#psu-val").textContent=state.psuV.toFixed(1)+" V"; $("#relay-led").textContent=state.relayOn?"ANKARE TILL":"ANKARE FRAN"; $("#relay-led").style.color=state.relayOn?"var(--accent)":"var(--muted)"; $$(".jack").forEach(j=>j.classList.toggle("selected",j.dataset.jack===state.pendingJack)); $("#dmm-read").textContent=sim.meter; $("#dmm-unit").textContent=sim.meterUnit; $("#dmm-sub").textContent="PROBE+ "+(state.dmm.pos||"-")+" COM "+(state.dmm.com||"-")+" "+state.dmm.mode; $$(".mode").forEach(m=>m.classList.toggle("active",m.dataset.mode===state.dmm.mode)); const msgs=[]; if(state.fuseBlown) msgs.push("Sakring utlost."); if(state.fault) msgs.push("Fel: "+state.fault); if(sim.warn) msgs.push(...sim.warn); $("#alerts").innerHTML=msgs.map(m=>'<div class="warn">'+m+'</div>').join(""); $("#stat-left").textContent=state.pendingJack?("Andra hylsan fran "+state.pendingJack):(state.wires.length+" tradar"); $("#stat-right").textContent="PSU "+state.psuV.toFixed(1)+" V"; }
  function checkProtocol(){ const lab=state.labId; const out=$("#check-out"); if(!out) return; const num=id=>{ const el=$(id); return el?parseFloat(String(el.value).replace(",",".")):NaN; }; let ok=[], bad=[];
    if(lab==="sakerhet"){ const n=$$("#checks input:checked").length; if(n>=4) ok.push("Checklista ifylld."); else bad.push("Bocka minst fyra punkter."); }
    if(lab==="batteri"){ const u0=num("#p-u0"), ul=num("#p-ul"); if(u0>11.5&&u0<13.2) ok.push("U0 rimlig."); else bad.push("U0 runt 12.6 V."); if(ul&&u0&&ul<u0) ok.push("UL < U0."); else bad.push("UL ska vara lagre an U0."); }
    if(lab==="ohm"){ const u=num("#p-u"), i=num("#p-i"), r=num("#p-r"); if(u&&i&&r&&Math.abs(u/i-r)/r<0.15) ok.push("U/I stammer."); else bad.push("Rakna R = U/I."); }
    if(lab==="hall"){ if(state.relayOn) ok.push("Relat haller."); else bad.push("Bygg hallkretsen pa 24 V."); }
    if(lab==="schema"){ const note=($("#p-note")&&$("#p-note").value.trim())||""; if(note.length>20) ok.push("Dokumentation finns."); else bad.push("Skriv kalla, last och skydd."); }
    if(ok.length && !bad.length){ state.done[lab]=true; saveUser(); }
    out.innerHTML=ok.map(x=>'<div class="okbox">'+x+'</div>').join("")+bad.map(x=>'<div class="warn">'+x+'</div>').join(""); }
  function protocolFields(){ if(state.labId==="sakerhet") return '<div class="step" id="checks"><h3>Checklista</h3><label><input type="checkbox"> Inga ringar</label><br><label><input type="checkbox"> Brytare OFF</label><br><label><input type="checkbox"> Sakring i plus</label><br><label><input type="checkbox"> Ohm aldrig mot spanning</label><br><label><input type="checkbox"> Max 21 W last</label></div>'; return '<div class="step"><h3>Protokoll</h3><label>U0 / U kalla (V)</label><input id="p-u0" inputmode="decimal"><label>U last (V)</label><input id="p-ul" inputmode="decimal"><label>U (V)</label><input id="p-u" inputmode="decimal"><label>I (A)</label><input id="p-i" inputmode="decimal"><label>R eller Ri</label><input id="p-r"><input id="p-ri" placeholder="Ri"><label>Anteckning</label><textarea id="p-note" rows="3"></textarea></div>'; }
  function render(){ renderLabs(); $("#proto").innerHTML=protocolFields()+'<button class="check" id="btn-check">Kontrollera protokoll</button><div id="check-out"></div>'; const sim=simulate(); renderBoardState(sim); requestAnimationFrame(drawWires); }
  function on(id, ev, fn){ const el=$(id); if(el) el.addEventListener(ev, fn); }
  function bind(){
    on("#lab-list","click",e=>{ const b=e.target.closest("[data-lab]"); if(!b) return; state.labId=b.dataset.lab; render(); });
    on("#board","click",e=>{ const jack=e.target.closest("[data-jack]"); if(!jack) return; const mode=($("#probe-mode")||{}).value||"wire"; if(mode==="wire") setPending(jack.dataset.jack); if(mode==="pos") probe("pos",jack.dataset.jack); if(mode==="com") probe("com",jack.dataset.jack); });
    on("#sw-load","click",()=>{state.switches.load=!state.switches.load;render();});
    on("#sw-main","click",()=>{state.switches.main=!state.switches.main;render();});
    on("#sw-stop","click",()=>{state.switches.stop=!state.switches.stop;render();});
    const start=$("#sw-start"); if(start){ const down=()=>{state.switches.start=true;render();}; const up=()=>{state.switches.start=false;render();}; start.addEventListener("pointerdown",down); start.addEventListener("pointerup",up); start.addEventListener("pointerleave",up); }
    on("#psu","input",e=>{state.psuV=+e.target.value;render();});
    on("#btn-clear","click",clearWires);
    on("#btn-undo","click",removeLastWire);
    on("#btn-fuse","click",()=>{state.fuseBlown=false;render();});
    on("#btn-weak","click",()=>{state.batteryWeak=!state.batteryWeak;render();});
    on("#modes","click",e=>{ const m=e.target.closest("[data-mode]"); if(!m) return; state.dmm.mode=m.dataset.mode; render(); });
    document.addEventListener("click",e=>{ if(e.target.id==="btn-check") checkProtocol(); });
    on("#fault","change",e=>{state.fault=e.target.value||null;render();});
    on("#who-name","change",e=>{ state.user.name=e.target.value.trim()||"Gast"; saveUser(); renderLabs(); });
    window.addEventListener("resize",drawWires);
  }
  function boot(){ loadUser(); const nameBox=$("#who-name"); if(nameBox && state.user.name && state.user.name!=="Gast") nameBox.value=state.user.name; bind(); render(); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

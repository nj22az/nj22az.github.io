import {verbatim} from './browser-translation.mjs?v=2026.11.02.3';
import {AFS5_URL,AFS11_URL,REQUIREMENTS,PROCEDURE_OPTIONS,normalisePressure,validatePressure,applicableRequirements,evaluatePressure,controlStatus,validDate} from './pressure-core.mjs?v=2026.11.02.2';
import {initPressureOperations} from './pressure-operations.mjs?v=2026.11.02.2';

/** Pressure-equipment evidence support. A recorded status is never permission to operate. */
export function initPressureUI(api){
  const {e,field,select,area,modal,form,card,btn,badge,uid,today,asset}=api;
  const getDB=()=>api.getDB();
  normalisePressure(getDB());
  const data=()=>getDB().pressure;
  const profile=aid=>data().profiles.find(p=>p.assetId===aid);
  const selected=()=>api.getSelected?.()||location.hash.slice(1).split('/')[1]||'';
  const note=s=>`<p class="pressure-note">${s}</p>`;
  const source=(url,label)=>`<a href="${url}" target="_blank" rel="noopener">${e(label)}</a>`;
  const check=(name,label,checked=false,required=false)=>`<label class="check field full"><input type="checkbox" name="${name}" ${checked?'checked':''} ${required?'required':''}><span>${e(label)}</span></label>`;
  const clean=formElement=>Object.fromEntries([...new FormData(formElement)].map(([k,v])=>[k,typeof v==='string'?v.trim():v]));
  const attach=handler=>{
    const formElement=document.querySelector('#edit-form');
    formElement.querySelectorAll('button:not([type])').forEach(button=>button.type='button');
    formElement.onsubmit=event=>{event.preventDefault();handler(clean(event.target),event);};
  };
  const defaultProfile=aid=>({assetId:aid,scope:'unknown',scopeReason:'',role:'user',route:'unknown',category:'unknown',equipmentType:'unknown',phase:'unknown',fluidGroup:'unknown',fluid:'',ps:'',volume:'',dn:'',tsMin:'',tsMax:'',module:'',classificationRef:'',marketDate:'',legacyBasis:'',operationalScope:'unknown',operationalClass:'unknown',operationalReason:'',inspectionBody:'',assessor:'',reviewedOn:'',stopped:false,stopReason:'',revision:1});
  function journal(s,aid,action,by){s.journal.push({id:uid(),assetId:aid,action,by,at:new Date().toISOString()});}

  // Persist the complete candidate before publishing it to the live workspace.
  // Failed validation or browser storage leaves the live pressure register intact.
  function commit(aid,action,by,mutate){
    if(!asset(aid)||typeof by!=='string'||!by.trim()){alert('A valid asset and named responsible person are required.');return false;}
    const candidate=structuredClone(getDB());normalisePressure(candidate);
    try{
      mutate(candidate.pressure,candidate);
      journal(candidate.pressure,aid,action,by.trim());
      if(!validatePressure(candidate,today()))throw new Error('The pressure-equipment record is incomplete or invalid. Check dates, evidence links and required fields.');
      if(typeof api.persistCandidate==='function'){
        if(api.persistCandidate(candidate)===false)throw new Error('The workspace could not be saved.');
      }else localStorage.setItem(api.storageKey||api.KEY||'johansson-maintenance-public-demo-v1',JSON.stringify(candidate));
      getDB().pressure=candidate.pressure;
      const status=document.querySelector('#save-state');if(status)status.textContent='Saved on this device';
      const dialog=document.querySelector('#modal');if(dialog?.open)dialog.close();
      api.render?.();api.toast?.('Pressure-equipment record saved');return true;
    }catch(error){alert(error.message||'Unable to save. Export a backup before closing this workspace.');return false;}
  }

  const options={
    scope:[['unknown','Not assessed'],['in','Within product scope'],['excluded','Excluded under §2'],['below','PS ≤0.5 bar · outside threshold']],
    role:[['user','Employer / equipment user'],['manufacturer','Manufacturer'],['importer','Importer'],['distributor','Distributor'],['representative','Authorised representative']],
    route:[['unknown','Not assessed'],['ped','PED conformity assessment · CE route'],['sep','§8 good engineering practice · no CE under this AFS'],['user-body','§40 user inspection body · no CE under this route'],['legacy','Legacy / transitional assessment'],['special-assembly','§7 second paragraph · special hot-water assembly']],
    category:[['unknown','Not assessed'],['SEP','§8 good engineering practice (SEP)'],['I','Category I'],['II','Category II'],['III','Category III'],['IV','Category IV'],['LEGACY','Legacy legislation / transitional basis'],['SPECIAL','Special §7 second-paragraph assembly']],
    equipmentType:[['unknown','Not assessed'],['vessel','Pressure vessel'],['piping','Piping'],['heated','Fired / heated pressure equipment'],['accessory','Pressure accessory'],['safety','Safety accessory'],['assembly','Assembly']],
    phase:[['unknown','Not assessed'],['gas','Gas / vapour classification'],['liquid','Liquid classification']],
    fluidGroup:[['unknown','Not assessed'],['1','Group 1'],['2','Group 2']],
    operationalScope:[['unknown','Not assessed'],['in','Within operational scope'],['excluded','Outside operational scope · separate basis']],
    operationalClass:[['unknown','Not assessed'],['A','Class A'],['B','Class B'],['other','Other · reviewed classification basis']]
  };

  window.pressureProfile=aid=>{
    if(!asset(aid))return;
    const p=profile(aid)||defaultProfile(aid);
    const fields=note('Record the reviewed product scope and operating scope separately. PED categories I–IV are not operational classes A/B. Unknown selections remain open findings. A nameplate or a completed service alone does not establish conformity.')+
      `<h3 class="field full pressure-form-heading">Product scope · ${source(AFS5_URL,'AFS 2023:5')}</h3>`+
      select('Product applicability','scope',options.scope,p.scope)+select('Your role for this product','role',options.role,p.role)+
      area('Exact scope / exclusion basis, including §2 item where relevant','scopeReason',p.scopeReason)+
      select('Equipment type','equipmentType',options.equipmentType,p.equipmentType)+field('Fluid identity / composition','fluid',p.fluid)+
      select('Reviewed fluid group','fluidGroup',options.fluidGroup,String(p.fluidGroup))+select('Classification phase','phase',options.phase,p.phase)+
      field('Maximum allowable pressure PS (bar)','ps',p.ps,false,'number')+field('Volume V (litres)','volume',p.volume,false,'number')+
      field('Nominal size DN','dn',p.dn,false,'number')+field('Minimum allowable temperature TS (°C)','tsMin',p.tsMin,false,'number')+
      field('Maximum allowable temperature TS (°C)','tsMax',p.tsMax,false,'number')+
      select('Reviewed product category / special basis','category',options.category,p.category)+select('Conformity / historical route','route',options.route,p.route)+
      select('Assessment procedure / module','module',PROCEDURE_OPTIONS,p.module||'')+
      field('Classification evidence / signed assessment reference','classificationRef',p.classificationRef)+
      field('Original market / putting-into-service date','marketDate',p.marketDate,false,'date')+
      area('Original legislation, exact transitional provision or special assembly basis','legacyBasis',p.legacyBasis)+
      note('Legacy records require the original pre-2025 market/putting-into-service date and legal basis. Special §7 assemblies require their own assessed route and scope; they must not be assigned a normal PED category by assumption.')+
      `<h3 class="field full pressure-form-heading">Use and inspection · ${source(AFS11_URL,'AFS 2023:11')}</h3>`+
      select('Separate operational applicability','operationalScope',options.operationalScope,p.operationalScope)+
      select('Reviewed operational classification','operationalClass',options.operationalClass,p.operationalClass)+
      area('Operational classification / exclusion basis','operationalReason',p.operationalReason)+
      field('Responsible accredited inspection body','inspectionBody',p.inspectionBody)+
      field('Named profile reviewer','assessor',p.assessor,true)+field('Profile review date','reviewedOn',p.reviewedOn||today(),true,'date')+
      note('Saving a changed profile increases its revision and requires previous requirement reviews to be checked again. Existing inspection certificates and operational history are retained.');
    modal('Pressure-equipment profile · '+e(asset(aid).tag),form(fields));
    for(const name of ['ps','tsMin','tsMax'])document.querySelector(`[name="${name}"]`)?.removeAttribute('min');
    attach(d=>{
      if(!validDate(d.reviewedOn)||d.reviewedOn>today()){alert('Enter a valid profile review date that is not in the future.');return;}
      const old=profile(aid),next={...defaultProfile(aid),...old,...d,assetId:aid,revision:(old?.revision||0)+1};
      // An operational hold has an independent release workflow.
      next.stopped=old?.stopped||false;next.stopReason=old?.stopReason||'';
      commit(aid,old?'Pressure profile revised; requirement reviews require renewal':'Pressure profile created',d.assessor,s=>{
        const index=s.profiles.findIndex(x=>x.assetId===aid);if(index<0)s.profiles.push(next);else s.profiles[index]=next;
      });
    });
  };
  window.pressureProfileForm=window.pressureProfile;

  function evidenceOptions(aid){return [['','Select retained evidence'],...data().evidence.filter(x=>x.assetId===aid).map(x=>[x.id,x.title+' · '+x.reference])];}
  window.pressureEvidence=aid=>{
    if(!asset(aid))return;
    modal('Register controlled evidence',form(note('Record the retained document’s identity and location. This register does not upload, authenticate or independently archive the source document. Retain the original document under your organisation’s document-control rules.')+
      field('Document title','title','',true)+field('Controlled reference / revision','reference','',true)+
      field('Issue date','issuedOn','',false,'date')+field('Retain until · applicable basis governs','retainUntil','',false,'date')+
      field('Controlled HTTPS document location (optional)','url','',false,'url',true)+
      area('Document purpose, custody, retention basis and limitations','notes')+field('Recorded by','by','',true)));
    attach(d=>commit(aid,'Controlled evidence reference added: '+d.title,d.by,s=>{const {by,...record}=d;s.evidence.push({...record,id:uid(),assetId:aid});}));
  };
  window.pressureEvidenceForm=window.pressureEvidence;

  window.pressureReview=(aid,rid='')=>{
    const p=profile(aid);if(!p){window.pressureProfile(aid);return;}
    const requirements=applicableRequirements(p);if(!requirements.length){alert('No requirements apply to the recorded scopes. Review the scope decision and its basis.');return;}
    const r=requirements.find(x=>x.id===rid)||requirements[0];
    modal('Review requirement evidence',form(note('A review records a person’s assessment of the retained evidence. It does not certify equipment or replace a notified/accredited body’s decision.')+
      select('Applicable requirement','requirementId',requirements.map(x=>[x.id,x.title]),r.id)+
      select('Review outcome','status',[['pending','Pending review'],['evidenced','Evidence reviewed and recorded'],['gap','Gap / action required'],['na','Not applicable · reasoned assessment']],'pending')+
      select('Supporting controlled evidence','evidenceId',evidenceOptions(aid),'')+
      field('Named reviewer','reviewer','',true)+field('Review date','date',today(),true,'date')+
      area('Assessment, exact non-applicability basis or action required','reason')+
      note(source(r.url,r.ref)+' · Previous reviews remain in the record. A profile revision makes earlier reviews stale.')));
    const requirementSelect=document.querySelector('[name=requirementId]');
    requirementSelect.addEventListener('change',()=>{const req=requirements.find(x=>x.id===requirementSelect.value);const notes=document.querySelectorAll('#edit-form .pressure-note');if(req&&notes.length)notes[notes.length-1].innerHTML=source(req.url,req.ref)+' · Previous reviews remain in the record. A profile revision makes earlier reviews stale.';});
    attach(d=>{
      if(d.status==='evidenced'&&!d.evidenceId){alert('Select the controlled evidence supporting this review.');return;}
      if(['gap','na'].includes(d.status)&&!d.reason){alert('Record the gap or exact non-applicability basis.');return;}
      commit(aid,'Requirement review added: '+d.requirementId,d.reviewer,s=>s.assessments.push({...d,id:uid(),assetId:aid,profileRevision:p.revision}));
    });
  };
  window.pressureReviewForm=window.pressureReview;

  window.pressureControl=aid=>{
    if(!profile(aid)){window.pressureProfile(aid);return;}
    const controls=data().controls.filter(c=>c.assetId===aid);
    const kinds=[['first','First control'],['periodic','Recurring driftprov'],['internal','Internal / external examination'],['revision','Revision control']];
    modal('Record independent control decision',form(note('Transcribe the inspection body’s actual certificate and decision. A maintenance completion is not an independent control. The due month and interval come from the certificate and applicable rules; this planner does not select a legal interval.')+
      select('Control type','kind',kinds,'first')+select('Inspection-body result','result',[['accepted','Accepted'],['conditional','Conditional / restrictions'],['rejected','Rejected']],'accepted')+
      field('Date control performed','performedOn',today(),true,'date')+field('Accredited inspection body','body',profile(aid).inspectionBody,true)+
      field('Certificate / decision reference','certificate','',true)+select('Retained certificate evidence','evidenceId',evidenceOptions(aid),'')+
      field('Certificate next due month (if applicable)','dueMonth','',false,'month')+field('Certificate interval (months, if applicable)','intervalMonths','',false,'number')+
      select('Earlier same-type decision explicitly replaced','supersedesId',[['','Does not replace an earlier decision'],...controls.map(c=>[c.id,c.kind+' · '+c.performedOn+' · '+c.certificate])],'')+
      area('Decision, restrictions, conditions and next-control basis','notes')+field('Recorded by','by','',true)+
      note('The statutory window is a planning calculation from the recorded certificate: six months before the due month; six months after, or only the due month where the interval is six months. An unresolved rejected or conditional decision remains visible until an accepted same-type decision explicitly supersedes it.')));
    attach(d=>{
      if(!d.evidenceId){alert('Register and select the retained inspection certificate first.');return;}
      if(!d.notes){alert('Record the decision, restrictions and basis for the next control or its absence.');return;}
      if(Boolean(d.dueMonth)!==Boolean(d.intervalMonths)){alert('Record both the due month and interval, or leave both blank and explain why.');return;}
      if(d.supersedesId){const old=controls.find(c=>c.id===d.supersedesId);if(!old||old.kind!==d.kind||d.result!=='accepted'){alert('Only an accepted decision of the same control type can explicitly replace an earlier decision.');return;}}
      commit(aid,'Independent control decision recorded: '+d.kind+' / '+d.result,d.by,s=>{
        const {by,...record}=d;s.controls.push({...record,id:uid(),assetId:aid,intervalMonths:d.intervalMonths?Number(d.intervalMonths):''});
        if(d.result!=='accepted'){const p=s.profiles.find(x=>x.assetId===aid);p.stopped=true;p.stopReason='Inspection body decision requires review: '+d.result+' · '+d.certificate+'. '+d.notes;}
      });
    });
  };
  window.pressureControlForm=window.pressureControl;

  window.pressureHold=aid=>{
    const p=profile(aid);if(!p){window.pressureProfile(aid);return;}
    modal(p.stopped?'Review recorded use stop':'Record use stop / restriction',form(note('A software hold records the responsible person’s decision. Physically isolate and secure dangerous equipment under the approved site procedure. Changing this register does not itself isolate equipment or authorise a return to use.')+
      select('Record action','action',[['stop','Stop use / retain restriction'],['release','Record separately authorised release assessment']],p.stopped?'stop':'stop')+
      field('Responsible person','by','',true)+select('Supporting evidence (required for release)','evidenceId',evidenceOptions(aid),'')+
      area('Reason, affected equipment, isolation / restrictions and decision basis','reason',p.stopReason||'')+
      check('isolationAcknowledged','I have addressed physical isolation and site restrictions under the approved procedure; this software entry does not perform isolation.',false,true)+
      check('releaseAcknowledged','For a release: I have checked the necessary control-body decisions, unresolved hazards and the responsible person’s authorisation. This entry does not grant that authorisation.')));
    attach(d=>{
      if(!d.reason||!d.isolationAcknowledged){alert('Record the reason and acknowledge the physical-isolation responsibility.');return;}
      if(d.action==='release'&&(!d.evidenceId||!d.releaseAcknowledged)){alert('A release record requires retained evidence and the separate authorisation acknowledgement.');return;}
      if(d.action==='release'){
        const snapshot=structuredClone(data()),candidate=snapshot.profiles.find(x=>x.assetId===aid);candidate.stopped=false;
        const result=evaluatePressure(candidate,snapshot,today());
        if(result.tone==='overdue'){alert('Critical inspection or remaining-life findings remain unresolved. Resolve these and retain the supporting decision before recording a release.');return;}
      }
      commit(aid,d.action==='release'?'Use-stop release assessment recorded: '+d.reason:'Use stopped / restriction recorded: '+d.reason,d.by,s=>{const p=s.profiles.find(x=>x.assetId===aid);p.stopped=d.action!=='release';p.stopReason=d.action==='release'?'':d.reason;});
    });
  };
  window.pressureStop=window.pressureHold;
  window.pressureHoldForm=window.pressureHold;

  window.pressureExport=aid=>{
    const a=asset(aid);if(!a)return;
    const p=profile(aid),s=data();
    const dossier={schema:'maintenance-pressure-dossier-v1',exportedAt:new Date().toISOString(),notice:'Evidence register export. User-entered records are not independently verified. This export is not conformity certification or permission to operate.',sources:[AFS5_URL,AFS11_URL],asset:structuredClone(a),profile:p?structuredClone(p):null,status:evaluatePressure(p,s,today()),...Object.fromEntries(['evidence','assessments','controls','journal','operations','classifications'].map(k=>[k,(s[k]||[]).filter(x=>x.assetId===aid)]))};
    const url=URL.createObjectURL(new Blob([JSON.stringify(dossier,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='pressure-dossier-'+(a.tag||aid).replace(/[^\w-]/g,'-')+'-'+today()+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  window.exportPressureDossier=window.pressureExport;

  function pressureWorkFindings(aid){
    const p=profile(aid);if(!p)return asset(aid)?.pressure?[{text:'Pressure-equipment applicability has not been assessed.',action:`go('assess','${aid}')`}]:[];
    const findings=evaluatePressure(p,data(),today()).findings,shown=findings.slice(0,3);if(findings.length>3)shown.push(`${findings.length-3} additional pressure-equipment reviews remain open.`);return shown.map(text=>({text:'Pressure equipment: '+text,action:`go('pressure','${aid}')`}));
  }
  window.pressureWorkFindings=pressureWorkFindings;
  if(api.packFindings){const previous=api.packFindings;api.setPackFindings?.(aid=>[...previous(aid),...pressureWorkFindings(aid)]);}

  function requirementRows(p){
    const requirements=applicableRequirements(p);
    return requirements.length?requirements.map(r=>{
      const a=data().assessments.filter(x=>x.assetId===p.assetId&&x.requirementId===r.id).at(-1),current=a&&+a.profileRevision===+p.revision;
      const label=!a?'Review required':!current?'Profile changed · re-review required':({pending:'Pending review',evidenced:'Evidence recorded',gap:'Gap / action required',na:'Non-applicability recorded'})[a.status];
      return `<div class="pressure-requirement"><div><h3>${e(r.title)}</h3><p>${source(r.url,r.ref)}</p>${badge(!current||!a||['pending','gap'].includes(a.status)?'review':'blue',label)}${a?note(e(a.reviewer||'Reviewer not recorded')+' · '+e(a.date||'Date not recorded')+(a.reason?' · '+e(a.reason):'')):''}</div>${btn('Review',`pressureReview('${p.assetId}','${r.id}')`,'small')}</div>`;
    }).join(''):note('No product or operational requirements are selected by the recorded scope. Retain and review the exact scope or exclusion basis.');
  }
  const operations=initPressureOperations({...api,commit});

  function profileFacts(p){
    const list=[['Product scope',options.scope.find(x=>x[0]===p.scope)?.[1]],['Role',options.role.find(x=>x[0]===p.role)?.[1]],['Route',options.route.find(x=>x[0]===p.route)?.[1]],['PED category / basis',p.category],['PS',p.ps===''?'Not recorded':p.ps+' bar'],['V / DN',(p.volume!==''?p.volume+' L':'—')+' / '+(p.dn||'—')],['Fluid',p.fluid||'Not recorded'],['TS minimum / maximum',(p.tsMin===''?'—':p.tsMin)+' / '+(p.tsMax===''?'—':p.tsMax)+' °C'],['Procedure / module',p.module||'Not recorded'],['Classification reference',p.classificationRef||'Not recorded'],['Operational scope / class',p.operationalScope+' / '+p.operationalClass],['Inspection body',p.inspectionBody||'Not recorded'],['Reviewer',p.assessor||'Not recorded'],['Reviewed on / revision',(p.reviewedOn||'Not recorded')+' / '+p.revision]];
    return `<div class="kv">${list.map(([k,v])=>`<div><label>${e(k)}</label><b>${e(v||'—')}</b></div>`).join('')}</div>${p.scopeReason?note('Scope basis: '+e(p.scopeReason)):''}${p.operationalReason?note('Operational basis: '+e(p.operationalReason)):''}${p.marketDate?note('Original market / putting-into-service date: '+e(p.marketDate)):''}${p.legacyBasis?note('Historical / special basis: '+e(p.legacyBasis)):''}`;
  }
  function pressurePage(){
    const aid=selected(),a=asset(aid);
    const heading=api.heading||((eyebrow,title,description,actions='')=>`<div class="page-head"><div><div class="eyebrow">${e(eyebrow)}</div><h1>${title}</h1><p>${e(description)}</p></div><div class="actions">${actions}</div></div>`);
    const intro=`<div class="notice pressure-disclaimer"><div><strong>Pressure-equipment evidence register</strong><p>AFS 2023:5 product conformity and AFS 2023:11 use/control records are assessed separately. “Recorded evidence complete” is a document status; it is not legal certification or permission to operate.</p>${source(AFS5_URL,'AFS 2023:5 · official PDF')} · ${source(AFS11_URL,'AFS 2023:11 · official current rules')}</div></div>`;
    if(!a){
      return heading('PRESSURE EQUIPMENT','Pressure equipment','Reviewed scope, retained evidence, independent controls and operating records.')+intro+
        card('Asset dossiers','Select an asset. Register only the scopes and decisions supported by the actual equipment documents.',`<div class="card-body pressure-register">${getDB().assets.length?getDB().assets.map(a=>{
          const p=profile(a.id),state=evaluatePressure(p,data(),today());return `<div class="pressure-row"><div><h3><a href="#pressure/${a.id}">${e(a.name)}</a></h3><p>${verbatim(a.tag)} · ${e(a.location||'Location not recorded')}</p>${badge(state.tone,state.label)}${p?note(state.covered+' / '+state.total+' applicable requirement reviews recorded for profile revision '+p.revision):note('No pressure-equipment applicability review recorded.')}</div><a class="btn small" href="#pressure/${a.id}">Open dossier</a></div>`;
        }).join(''):note('Register an asset before preparing its pressure-equipment dossier.')}</div>`);
    }
    const p=profile(aid),state=evaluatePressure(p,data(),today()),records=data().evidence.filter(x=>x.assetId===aid),controls=data().controls.filter(x=>x.assetId===aid);
    const actions=`<a class="btn" href="#workpack/${aid}">Work pack</a>`+btn(p?'Edit profile':'Assess applicability',`pressureProfile('${aid}')`,'primary')+btn('Export dossier',`pressureExport('${aid}')`)+btn('Print dossier','window.print()')+`<a class="btn" href="#assess/${aid}">Classify / assess item</a>`;
    let html=heading('PRESSURE-EQUIPMENT DOSSIER',e(a.name),a.tag+' · '+(a.location||'Location not recorded'),actions)+intro+
      card('Dossier status','The status reflects recorded decisions and evidence, including missing or stale reviews.',`<div class="card-body">${badge(state.tone,state.label)}${p?note(state.covered+' / '+state.total+' requirement reviews recorded for current profile revision '+p.revision):''}${state.findings.length?`<ul class="pressure-findings">${state.findings.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`:note('No open findings in the recorded scope. Verify the underlying evidence and actual equipment before making any operating decision.')}${p?btn(p.stopped?'Review use stop':'Record use stop / restriction',`pressureHold('${aid}')`,p.stopped?'primary small':'small'):btn('Record profile',`pressureProfile('${aid}')`,'primary')}</div>`);
    if(p)html+=card('Reviewed profile','Product category, economic role and operational class remain separate.',`<div class="card-body">${profileFacts(p)}</div>`)+
      card('Requirement review matrix','Each applicable requirement needs a current evidence review or a reasoned non-applicability assessment.',`<div class="card-body">${requirementRows(p)}</div>`,btn('Add review',`pressureReview('${aid}')`,'small'));
    html+=card('Controlled evidence','Keep the original documents in the controlled location identified by each reference.',`<div class="card-body">${records.length?records.map(r=>`<article class="pressure-evidence"><h3>${e(r.title)}</h3><p>${e(r.reference)}</p>${note((r.issuedOn?'Issued '+e(r.issuedOn)+' · ':'')+(r.retainUntil?'Retain until '+e(r.retainUntil):'Retention date / basis requires review'))}${r.url?`<a href="${e(r.url)}" target="_blank" rel="noopener">Open controlled document</a>`:''}${r.notes?note(e(r.notes)):''}</article>`).join(''):note('No evidence references recorded.')}</div>`,btn('Add evidence',`pressureEvidence('${aid}')`,'small'));
    if(p)html+=card('Independent controls','Certificate decisions and dates remain separate from recurring maintenance.',`<div class="card-body">${controls.length?controls.slice().reverse().map(c=>{
      const superseded=controls.some(x=>x.result==='accepted'&&x.supersedesId===c.id),status=controlStatus(c,today());return `<article class="pressure-control"><div class="pressure-row"><div><h3>${e(c.kind)} · ${e(c.performedOn)}</h3><p>${e(c.body)} · ${e(c.certificate)}</p></div>${badge(superseded?'blue':status.tone,superseded?'Explicitly superseded':status.label)}</div>${c.dueMonth?note('Certificate due month '+e(c.dueMonth)+' · Interval '+e(c.intervalMonths)+' months'+(status.opens?' · Planning window '+e(status.opens)+' to '+e(status.closes):'')):note('No next-control window recorded. Review the certificate and applicable exception basis.')}${c.notes?note(e(c.notes)):''}</article>`;
    }).join(''):note('No independent control certificates recorded.')}</div>`,btn('Record control',`pressureControl('${aid}')`,'small'))+operations.render(aid);
    const entries=data().journal.filter(x=>x.assetId===aid);
    html+=card('Local record history','Append-only application history. Browser storage and exported JSON can still be changed outside this application.',`<div class="card-body">${entries.length?`<ol class="pressure-journal">${entries.slice(-20).reverse().map(x=>`<li><strong>${e(x.action)}</strong><p>${e(x.by??x.actor)} · ${e(x.at)}</p></li>`).join('')}</ol>`:note('No pressure-equipment changes recorded.')}${entries.length>20?note('The latest twenty entries are shown. Export the dossier for the complete local record history.'):''}</div>`);
    return html;
  }
  if(api.pages)api.pages.pressure=pressurePage;
  if(api.titles)api.titles.pressure='Pressure equipment';
  if(api.NAV_NAMES)api.NAV_NAMES.pressure='Pressure';
  if(api.nav&&!api.nav.some(x=>x[0]==='pressure'))api.nav.splice(3,0,['pressure','▤','Pressure equipment']);

  // Existing asset edits can invalidate the identity that supporting reviews refer to.
  // The host may call this explicitly as part of its own atomic asset transaction.
  window.pressureInvalidateIdentity=(aid,by='Asset record editor')=>{
    if(!profile(aid))return true;
    return commit(aid,'Asset identity changed; profile and requirement reviews require renewal',by,s=>{
      const p=s.profiles.find(x=>x.assetId===aid);p.revision++;p.assessor='';p.reviewedOn='';
    });
  };
  for(const key of ['detail','workpack']){const base=api.pages?.[key];if(base)api.pages[key]=()=>{const aid=selected(),a=asset(aid),p=profile(aid),status=evaluatePressure(p,data(),today());return base()+(a?card('Pressure-equipment evidence','Product classification, statutory controls and operating restrictions.',`<div class="card-body">${badge(status.tone,status.label)}<p><a class="btn small" href="#pressure/${aid}">Open pressure dossier</a></p></div>`):'');};}
  const baseComplete=window.completeForm;
  if(baseComplete)window.completeForm=id=>{baseComplete(id);const task=getDB().tasks.find(x=>x.id===id),p=profile(task?.assetId);if(!p)return;const result=evaluatePressure(p,data(),today());if(p.stopped||result.tone==='overdue'){const target=document.querySelector('#complete-form');target?.insertAdjacentHTML('afterbegin',`<p class="pressure-stop pressure-note">Operating restriction or overdue control: ${e(p.stopReason||result.findings.join(' '))}. Recording maintenance does not release this equipment.</p><label class="check"><input type="checkbox" required><span>I confirm the approved isolation and work authorisation for this restricted equipment.</span></label>`);}};
  return {commit};
}

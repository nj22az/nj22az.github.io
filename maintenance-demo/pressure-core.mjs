import {validateOperations, operationFindings} from './pressure-operations.mjs?v=2026.11.02.2';
/** Evidence support only: never automatic legal approval or classification. */
export const AFS5_URL='https://www.av.se/globalassets/filer/publikationer/foreskrifter/produkter-tryckbarande-anordningar-afs2023-5.pdf';
export const AFS11_URL='https://www.av.se/arbetsmiljoarbete-och-inspektioner/publikationer/foreskrifter/afs-202311/';
const economic=['manufacturer','importer','distributor','representative'];
const allRoles=['user',...economic];
const req=(id,title,ref,roles=allRoles,extra={})=>({id,title,ref,url:id.startsWith('op-')?AFS11_URL:AFS5_URL,roles,...extra});
export const REQUIREMENTS=[
 req('scope','Product scope, exclusions and economic-operator role','AFS 2023:5 §§1–4'),
 req('classification','Technical data and externally reviewed PED classification','AFS 2023:5 §§6–11; Annex 2'),
 req('identity','Manufacturer, serial identification, nameplate and operating limits','AFS 2023:5 §17; Annex 1 §3.3'),
 req('instructions','Swedish installation, use, maintenance and inspection instructions','AFS 2023:5 §18; Annex 1 §3.4'),
 req('conformity','Conformity assessment, selected module and body records','AFS 2023:5 §§10–11; Annexes 2–3',allRoles,{routes:['ped','special-assembly']}),
 req('declaration','Swedish EU declaration and covered equipment','AFS 2023:5 §12; Annex 4',allRoles,{routes:['ped','special-assembly']}),
 req('marking','CE marking and notified-body identification where required','AFS 2023:5 §§36–37',allRoles,{routes:['ped','special-assembly']}),
 req('sep','Good engineering practice, Swedish instructions and no CE under this AFS','AFS 2023:5 §8',allRoles,{routes:['sep']}),
 req('user-body','Special user-inspection-body route, group use and no CE under this route','AFS 2023:5 §40',allRoles,{routes:['user-body']}),
 req('market','Conditions for market supply and putting into service','AFS 2023:5 §§5–7',allRoles),
 req('standards','Harmonised-standard claims and versioned evidence','AFS 2023:5 §13',['manufacturer','representative']),
 req('manufacturer','Manufacturer conformity, technical file and applicable retention','AFS 2023:5 §§14–15; Annex 3',['manufacturer','representative']),
 req('production','Production consistency, sampling and complaints','AFS 2023:5 §16',['manufacturer']),
 req('manufacturer-correction','Manufacturer corrective action, recall and authority cooperation','AFS 2023:5 §§19–20',['manufacturer']),
 req('mandate','Written mandate, representative duties and retention','AFS 2023:5 §21',['representative']),
 req('importer','Importer verification, identification, instructions and storage','AFS 2023:5 §§22–25',['importer']),
 req('importer-correction','Importer corrective action, declaration retention and cooperation','AFS 2023:5 §§26–27',['importer']),
 req('distributor','Distributor verification, instructions and storage','AFS 2023:5 §§28–30',['distributor']),
 req('distributor-correction','Distributor corrective action and authority cooperation','AFS 2023:5 §§31–33',['distributor']),
 req('role-change','Modification or rebranding: reassess manufacturer role','AFS 2023:5 §34'),
 req('traceability','Supply-chain identity and receipt/delivery ten-year retention','AFS 2023:5 §35',['manufacturer','importer','distributor']),
 req('risk-design','Hazard analysis and essential safety requirements','AFS 2023:5 Annex 1 introductory observations; §1',['manufacturer','representative']),
 req('design','Strength, handling, examination access and protective devices','AFS 2023:5 Annex 1 §§2.1–2.12',['manufacturer','representative']),
 req('fabrication','Manufacture, permanent joints, personnel, NDT and traceability','AFS 2023:5 Annex 1 §§3.1.1–3.1.5',['manufacturer','representative']),
 req('final-test','Final assessment, pressure proof and safety devices','AFS 2023:5 Annex 1 §§3.2.1–3.2.3',['manufacturer','representative']),
 req('materials','Material suitability, certification and approval route','AFS 2023:5 §§38–39; Annex 1 §§4.1–4.3',['manufacturer','representative']),
 req('heated','Additional heated-equipment requirements','AFS 2023:5 Annex 1 §5',['manufacturer','representative']),
 req('piping','Additional piping requirements','AFS 2023:5 Annex 1 §6',['manufacturer','representative']),
 req('quantitative','Quantitative safety requirements or justified equivalent safety','AFS 2023:5 Annex 1 §§7.1–7.5',['manufacturer','representative']),
 req('transition','Manufacture/market dates and any transitional basis','AFS 2023:5 transitional provisions'),
 req('special-assembly','Manually solid-fuel-fired hot-water assembly and limited essential requirements','AFS 2023:5 §7 second paragraph; Annex 2 diagram 4 note',allRoles,{routes:['special-assembly']}),
 req('op-scope','Separate operational scope and A/B classification','AFS 2023:11 9 kap. §§23–35'),
 req('op-risk','Risk assessment and foreseeable abnormal conditions','AFS 2023:11 9 kap. §6'),
 req('op-maintenance','Supervision, documented routines, responsible person and review','AFS 2023:11 9 kap. §§9–10, 38'),
 req('op-register','Equipment register and documented remaining life by component','AFS 2023:11 9 kap. §§36–39'),
 req('op-repairs','Substantial repairs and changes: documentation and reassessment','AFS 2023:11 9 kap. §§40–42'),
 req('op-competence','Assigned responsibilities and applicable boiler knowledge','AFS 2023:11 10 kap. §30'),
 req('op-control','Control-body decisions, restrictions and revision requirements','AFS 2023:11 10 kap. §§7–26; Annex 7'),
 req('op-first-control','First-control certificate or applicable documented exception','AFS 2023:11 10 kap. §9'),
 req('op-recurring-control','Recurring driftprov certificate and next due point','AFS 2023:11 10 kap. §10; Annex 7'),
 req('op-internal-control','Internal/external examination certificate or applicable exception','AFS 2023:11 10 kap. §10; Annex 7')
];
export const PROCEDURE_OPTIONS=[['','Not assessed / original legacy procedure'],...['A','A2','D1','E1','B (konstruktionstyp) + D','B (konstruktionstyp) + F','B (produktionstyp) + E','B (produktionstyp) + C2','H','B (produktionstyp) + D','B (produktionstyp) + F','G','H1','C2','F','B (konstruktionstyp)'].map(x=>[x,x])];
const procedureRanks={'A':1,'A2':2,'D1':2,'E1':2,'B (konstruktionstyp) + D':3,'B (konstruktionstyp) + F':3,'B (produktionstyp) + E':3,'B (produktionstyp) + C2':3,'H':3,'B (produktionstyp) + D':4,'B (produktionstyp) + F':4,'G':4,'H1':4};
export function procedureAllowed(category,module){return ['I','II','III','IV'].includes(category)&&Boolean(procedureRanks[module])&&procedureRanks[module]>=['I','II','III','IV'].indexOf(category)+1}
const scopes=['unknown','in','excluded','below'], routes=['unknown','ped','sep','user-body','legacy','special-assembly'];
const categories=['unknown','SEP','I','II','III','IV','LEGACY','SPECIAL'], kinds=['first','periodic','internal','revision'], results=['accepted','rejected','conditional'];
const text=x=>typeof x==='string'&&x.trim().length>0;
const blank=x=>x===undefined||x===null||x==='';
const safeId=x=>typeof x==='string'&&/^[\w-]+$/.test(x);
const num=x=>!blank(x)&&['number','string'].includes(typeof x)&&!(typeof x==='string'&&!x.trim())&&Number.isFinite(Number(x));
const positiveInt=x=>num(x)&&Number.isInteger(Number(x))&&Number(x)>0;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
export function validDate(x){if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===x}
const month=x=>typeof x==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(x)&&+x.slice(0,4)>=1000;
const optionalDate=x=>blank(x)||validDate(x);
const signed=p=>text(p.assessor)&&validDate(p.reviewedOn);
const extension=p=>p?.pressure??p;
export function normalisePressure(db){if(db.pressure===undefined)db.pressure={version:1,profiles:[],evidence:[],assessments:[],controls:[],journal:[],operations:[]};else if(db.pressure&&db.pressure.operations===undefined)db.pressure.operations=[];return db}
export function applicableRequirements(p){if(!p)return[];return REQUIREMENTS.filter(r=>{
 if(r.id.startsWith('op-'))return p.operationalScope==='in'&&(!['op-control','op-first-control','op-recurring-control','op-internal-control'].includes(r.id)||['A','B'].includes(p.operationalClass))&&(r.id!=='op-internal-control'||p.operationalClass==='A');
 if(!r.roles.includes(p.role||'user')||p.scope!=='in')return false;
 if(p.route==='legacy')return ['scope','identity','instructions','role-change','transition'].includes(r.id);
 if(r.routes&&!r.routes.includes(p.route))return false;
 if(p.route==='sep'&&['standards','risk-design','design','fabrication','final-test','materials','heated','piping','quantitative'].includes(r.id))return false;
 return true;
})}
export function statutoryWindow(dueMonth,intervalMonths){
 if(!month(dueMonth)||!positiveInt(intervalMonths))return null;
 const[y,m]=dueMonth.split('-').map(Number);
 return{opens:new Date(Date.UTC(y,m-7,1)).toISOString().slice(0,10),closes:new Date(Date.UTC(y,m-1+(Number(intervalMonths)===6?1:6),0)).toISOString().slice(0,10)};
}
export function controlStatus(c,at=today()){
 if(!c||!validDate(at))return{label:'Review required',tone:'review',findings:['Valid control and assessment date required.']};
 if(c.result==='rejected'||c.result==='conditional')return{label:c.result==='rejected'?'Rejected control — review required':'Conditional control — restrictions require review',tone:'overdue',findings:[c.result==='rejected'?'Rejected control remains unresolved.':'Record and resolve inspection-body conditions.']};
 if(c.result!=='accepted')return{label:'Control outcome missing',tone:'review',findings:['Inspection-body outcome is not recorded.']};
 const w=statutoryWindow(c.dueMonth,c.intervalMonths);
 if(!w)return{label:'Next control not established',tone:'review',findings:['Record the certificate due month and interval, or document why no further control applies.']};
 if(at>w.closes)return{label:'Control window elapsed',tone:'overdue',findings:['The recorded control window has elapsed; obtain an inspection-body decision before use.'],...w};
 return{label:at>=w.opens?'Control window open':'Before next control window',tone:at>=w.opens?'review':'blue',findings:[],...w};
}
/** Structural register rules are software validation, not legal assessment. */
export function validateControl(c,p,at=today()){
 p=extension(p);
 if(!c||!safeId(c.id)||!safeId(c.assetId)||!kinds.includes(c.kind)||!results.includes(c.result))return false;
 if(!validDate(c.performedOn)||c.performedOn>at||!text(c.body)||!text(c.certificate)||!safeId(c.evidenceId))return false;
 if(!p?.evidence?.some(e=>e.id===c.evidenceId&&e.assetId===c.assetId))return false;
 if(!blank(c.dueMonth)&&!month(c.dueMonth)||!blank(c.intervalMonths)&&!positiveInt(c.intervalMonths))return false;
 if(Boolean(c.dueMonth)!==!blank(c.intervalMonths))return false;
 if(c.supersedesId!==undefined&&!blank(c.supersedesId)&&(!safeId(c.supersedesId)||c.supersedesId===c.id))return false;
 return true;
}
export function validatePressure(db,at=today()){
 if(!db||!Array.isArray(db.assets)||!validDate(at))return false;
 if(db.pressure===undefined)return true;
 const p=db.pressure;
 if(!p||p.version!==1||!['profiles','evidence','assessments','controls','journal'].every(k=>Array.isArray(p[k]))||p.operations!==undefined&&!Array.isArray(p.operations))return false;
 const aids=new Set(db.assets.map(a=>a?.id));
 if(p.profiles.some(x=>!x||!aids.has(x.assetId))||new Set(p.profiles.map(x=>x.assetId)).size!==p.profiles.length)return false;
 for(const k of ['evidence','assessments','controls','journal'])if(p[k].some(x=>!x||!safeId(x.id)||!aids.has(x.assetId))||new Set(p[k].map(x=>x.id)).size!==p[k].length)return false;
 for(const x of p.profiles){
  if(!scopes.includes(x.scope)||!allRoles.includes(x.role)||!routes.includes(x.route)||!categories.includes(x.category)||!positiveInt(x.revision))return false;
  if(!['unknown','in','excluded'].includes(x.operationalScope)||!['unknown','A','B','other'].includes(x.operationalClass))return false;
  if(!['unknown','1','2'].includes(String(x.fluidGroup))||!['unknown','gas','liquid'].includes(x.phase)||!['unknown','vessel','piping','heated','accessory','safety','assembly'].includes(x.equipmentType))return false;
  if(!['ps','volume','dn','tsMin','tsMax'].every(k=>blank(x[k])||num(x[k])))return false;
  if(['volume','dn'].some(k=>!blank(x[k])&&Number(x[k])<0)||!blank(x.ps)&&Number(x.ps)<0&&x.scope!=='below'||['tsMin','tsMax'].some(k=>!blank(x[k])&&Number(x[k])< -273.15))return false;
  if(!blank(x.tsMin)&&!blank(x.tsMax)&&Number(x.tsMin)>Number(x.tsMax))return false;
  if(x.procedureMinimum!==undefined&&x.procedureMinimum!==''&&!['I','II','III','IV'].includes(x.procedureMinimum))return false;
  if(!optionalDate(x.marketDate))return false;
  if(!optionalDate(x.reviewedOn)||x.reviewedOn&&x.reviewedOn>at||x.stopped!==undefined&&typeof x.stopped!=='boolean')return false;
 }
 for(const x of p.evidence){
  if(!text(x.title)||!text(x.reference)||!optionalDate(x.issuedOn)||!optionalDate(x.retainUntil)||x.retainUntil&&x.issuedOn&&x.retainUntil<x.issuedOn)return false;
  if(!blank(x.url)){try{if(new URL(x.url).protocol!=='https:')return false}catch{return false}}
 }
 for(const x of p.assessments){
  if(!REQUIREMENTS.some(r=>r.id===x.requirementId)||!['pending','evidenced','gap','na'].includes(x.status)||!positiveInt(x.profileRevision))return false;
  if(!optionalDate(x.date)||x.date&&x.date>at)return false;
  const evidence=p.evidence.some(e=>e.id===x.evidenceId&&e.assetId===x.assetId);
  if(x.status==='evidenced'&&(!text(x.reviewer)||!validDate(x.date)||!evidence))return false;
  if(x.status==='na'&&(!text(x.reviewer)||!validDate(x.date)||!text(x.reason)))return false;
  if(x.status==='gap'&&!text(x.reason))return false;
  if(!blank(x.evidenceId)&&!evidence)return false;
 }
 if(p.controls.some(c=>!validateControl(c,p,at)))return false;
 for(const c of p.controls)if(c.supersedesId){const older=p.controls.find(x=>x.id===c.supersedesId);if(!older||older.assetId!==c.assetId||older.kind!==c.kind||older.performedOn>c.performedOn||c.result!=='accepted')return false}
 for(const x of p.journal)if(!text(x.action)||!text(x.by??x.actor)||typeof x.at!=='string'||!Number.isFinite(Date.parse(x.at)))return false;
 const allIds=['evidence','assessments','controls','journal','operations'].flatMap(k=>(p[k]||[]).map(x=>x?.id));
 if(new Set(allIds).size!==allIds.length||!validateOperations(db,at))return false;
 return true;
}
export function evaluatePressure(p,data,at=today()){
 data=extension(data);const findings=[];let covered=0;const requirements=applicableRequirements(p);
 if(!p||!data)return{label:'Review required',tone:'review',findings:['Pressure-equipment profile is not recorded.'],covered:0,total:0};
 if(!validDate(at))return{label:'Review required',tone:'review',findings:['Assessment date is invalid.'],covered:0,total:requirements.length};
 let critical=false;
 const add=x=>findings.push(x);
 const lastClassification=data.classifications?.filter(x=>x.assetId===p.assetId&&x.decision==='reviewed').at(-1);
 if(lastClassification&&lastClassification.profileRevision===p.revision&&data.classificationRulesVersion&&lastClassification.version!==data.classificationRulesVersion)add('Classification rule version changed; reassess the retained calculation before relying on its evidence.');
 if(p.stopped)add('Use has been stopped: '+(p.stopReason||'reason not recorded')+'.');
 if(!scopes.includes(p.scope)||p.scope==='unknown')add('AFS 2023:5 product scope has not been assessed.');
 if(!signed(p)||p.reviewedOn>at)add('A named reviewer and a valid review date are required.');
 if(['excluded','below'].includes(p.scope)&&!text(p.scopeReason))add('Record the legal basis for product exclusion or pressure threshold.');
 if(p.scope==='below'&&(!num(p.ps)||Number(p.ps)>.5))add('Outside-threshold basis requires a documented finite PS no higher than 0.5 bar.');
 if(p.scope==='in'){
  if(!num(p.ps)||Number(p.ps)<=.5)add('In-scope product requires documented PS above 0.5 bar.');
  if(!allRoles.includes(p.role))add('Economic-operator/user role is missing.');
  if(!text(p.classificationRef))add('Classification evidence/reference is missing.');
  if(!categories.includes(p.category)||p.category==='unknown')add('Reviewed PED category or §8 basis is missing.');
  if(!routes.includes(p.route)||p.route==='unknown')add('Conformity-assessment route is missing.');
  if(p.route==='sep'&&p.category!=='SEP')add('The §8 route must use the separately reviewed SEP category.');
  if(p.route==='ped'&&!['I','II','III','IV'].includes(p.category))add('PED CE route requires a reviewed category I–IV.');
  if(p.route==='ped'&&text(p.module)&&!procedureAllowed(p.category,p.module))add('The selected procedure must be one listed for the actual or a higher category in §10.');
  if(p.route==='ped'&&p.procedureMinimum&&(!['I','II','III','IV'].includes(p.procedureMinimum)||!procedureAllowed(p.procedureMinimum,p.module)))add('The documented special-case design procedure must meet at least category '+p.procedureMinimum+'; this does not raise the actual product category.');
  if(p.route==='user-body'&&(!['I','II','III','IV'].includes(p.category)||!['A2','C2','F','G'].includes(p.module)))add('The §40 route requires category I–IV and a procedure A2, C2, F or G; applicability needs specialist review.');
  if(p.route==='legacy'){
   if(p.category!=='LEGACY')add('The transitional route requires the separate LEGACY assessment selection.');
   if(!validDate(p.marketDate)||p.marketDate>='2025-01-01')add('Record the original pre-2025 market/putting-into-service date for this legacy route.');
   if(!text(p.legacyBasis))add('The original applicable legislation and exact transitional basis are missing.');
  }
  if(p.route==='special-assembly'){
   if(p.category!=='SPECIAL'||p.equipmentType!=='assembly')add('The special §7 second-paragraph route requires the SPECIAL assessment and assembly type.');
   if(!['B (konstruktionstyp)','H'].includes(p.module))add('Special hot-water assembly requires B (konstruktionstyp) or H per Annex 2 diagram 4.');
   if(!num(p.tsMax)||+p.tsMax>110||!num(p.ps)||!num(p.volume)||+p.ps*+p.volume<=50)add('Special hot-water assembly needs maximum temperature ≤110°C and documented PS × V >50 bar·litres.');
   if(!text(p.legacyBasis)&&!text(p.scopeReason))add('Record the manually solid-fuel-fired hot-water assembly basis for §7 second paragraph.');
  }
  if(p.category==='LEGACY'&&p.route!=='legacy'||p.category==='SPECIAL'&&p.route!=='special-assembly')add('Special/legacy assessment must use its matching separately reviewed route.');
  if(['ped','user-body'].includes(p.route)&&!text(p.module))add('Record the selected conformity-assessment module and basis.');
  if(!text(p.fluid))add('Fluid identity is missing.');
  if(p.route!=='legacy'&&!['1','2'].includes(String(p.fluidGroup)))add('Reviewed fluid group is missing.');
  if(p.route!=='legacy'&&!['gas','liquid'].includes(p.phase))add('Fluid phase for classification is missing.');
  if(!p.equipmentType||p.equipmentType==='unknown')add('Pressure-equipment type is missing.');
  if(p.equipmentType==='vessel'&&(!num(p.volume)||+p.volume<=0))add('Vessel volume in litres is missing.');
  if(p.equipmentType==='piping'&&(!num(p.dn)||+p.dn<=0))add('Piping nominal size DN is missing.');
  if(!num(p.tsMin)||!num(p.tsMax))add('Minimum and maximum allowable temperatures are missing.');
 }
 if(!['in','excluded'].includes(p.operationalScope))add('Separate AFS 2023:11 operational scope has not been assessed.');
 if(p.operationalScope==='excluded'&&!text(p.operationalReason))add('Record the separate basis for operational exclusion.');
 if(p.operationalScope==='in'){
  if(!['A','B','other'].includes(p.operationalClass))add('Operational A/B class or reviewed other classification is missing.');
  if(!text(p.operationalReason))add('Operational classification basis is missing.');
  if(['A','B'].includes(p.operationalClass)&&!text(p.inspectionBody))add('Responsible inspection body is missing.');
 }
 for(const r of requirements){
  const a=data.assessments?.filter(a=>a.assetId===p.assetId&&a.requirementId===r.id).at(-1);
  const isSigned=a&&text(a.reviewer)&&validDate(a.date)&&a.date<=at;
  const current=a&&+a.profileRevision===+p.revision;
  const evidence=a&&data.evidence?.find(e=>e.id===a.evidenceId&&e.assetId===p.assetId&&text(e.reference));
  if(current&&isSigned&&(a.status==='evidenced'&&evidence||a.status==='na'&&text(a.reason)))covered++;
  else add(r.title+': '+(a&&!current?'profile changed; re-review required':a?.status==='gap'?'gap recorded':'review/evidence required')+'.');
 }
 const controls=data.controls?.filter(c=>c.assetId===p.assetId)||[];
 const superseded=new Set(controls.filter(c=>c.result==='accepted').map(c=>c.supersedesId).filter(Boolean));
 const active=controls.filter(c=>!superseded.has(c.id));
 for(const c of active)if(c.result!=='accepted'){critical=true;add(c.kind+' control: '+controlStatus(c,at).label+'.');}
 if(p.operationalScope==='in'&&['A','B'].includes(p.operationalClass)){
  const exempt=rid=>{const a=data.assessments?.filter(x=>x.assetId===p.assetId&&x.requirementId===rid).at(-1);return a?.status==='na'&&text(a.reason)&&text(a.reviewer)&&validDate(a.date)&&a.date<=at&&+a.profileRevision===+p.revision};
  if(!exempt('op-first-control')&&!active.some(c=>c.kind==='first'&&c.result==='accepted'))add('First-control certificate or documented applicable exception is missing.');
  for(const kind of ['periodic',...(p.operationalClass==='A'?['internal']:[])]){
   if(exempt(kind==='periodic'?'op-recurring-control':'op-internal-control'))continue;
   const latest=active.filter(c=>(c.kind===kind||kind==='periodic'&&c.kind==='first'&&c.dueMonth)&&c.result==='accepted').sort((a,b)=>b.performedOn.localeCompare(a.performedOn))[0];
   if(!latest)add((kind==='internal'?'Internal/external examination':'Recurrent driftprov')+' certificate/schedule is missing.');
   else{const status=controlStatus(latest,at);if(status.tone==='overdue')critical=true;for(const f of status.findings)add(kind+': '+f);}
  }
 }
 const operationalFindings=operationFindings(p,data,at);
 if(operationalFindings.some(x=>x.startsWith('Life limit reached')))critical=true;
 findings.push(...operationalFindings);
 return{label:findings.length?(p.stopped?'Use stopped — review required':'Review required'):p.scope!=='in'&&p.operationalScope!=='in'?'Outside recorded scopes — basis recorded':'Recorded evidence complete',tone:findings.length?(p.stopped||critical?'overdue':'review'):'blue',findings,covered,total:requirements.length};
}

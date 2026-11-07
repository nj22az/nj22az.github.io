/**
 * Source-traceable pressure-product classification support.
 * Ordinary scalar diagrams were checked visually against printed pp. 52–60.
 * An output category is a calculation from declared data, never a certificate.
 */
export const RULESET_VERSION='AFS2023-5-annex2-2026-11-02.1';
export const SOURCE_URL='https://www.av.se/globalassets/filer/publikationer/foreskrifter/produkter-tryckbarande-anordningar-afs2023-5.pdf';
export const CHECKED_ON='2026-11-02';
const rank={SEP:0,I:1,II:2,III:3,IV:4};
const diagramBasis={
 1:'§6 entry: (V > 1 L and PS × V > 25) or PS > 200 bar. I/II: PS × V 50; II/III: PS × V 200 (PS 200 for V ≤ 1); III/IV: PS × V 1,000 (PS 1,000 for V ≤ 1).',
 2:'§6 entry: (V > 1 L and PS × V > 50) or PS > 1,000 bar, plus specified portable containers. I/II: PS × V 200; II/III: PS × V 1,000; IV needs PS > 4 and PS × V > 3,000 (PS 3,000 for V ≤ 1).',
 3:'§6 entry: (V > 1 L and PS × V > 200) or PS > 500 bar. Category I up to PS 10; II above PS 10; III needs both V > 1 and PS > 500.',
 4:'§6 entry: (PS > 10 bar and PS × V > 10,000) or PS > 1,000 bar. Category II additionally needs both V > 10 L and PS > 500; otherwise in-scope equipment is I.',
 6:'§6 entry: DN > 25. I/II: DN > 100 or PS × DN > 1,000. III: DN > 350 or both DN > 100 and PS × DN > 3,500.',
 7:'§6 entry: DN > 32 and PS × DN > 1,000. II: DN > 100 and PS × DN > 3,500. III: DN > 250 and PS × DN > 5,000, plus the specified temperature exception.',
 8:'§6 entry: DN > 25 and PS × DN > 2,000. Category I up to PS 10; II above PS 10 up to PS 500; III above PS 500.',
 9:'§6 entry requires PS > 10, DN > 200 and PS × DN > 5,000 together. Category I up to PS 500; II above PS 500.'
};
const knownBoolean=value=>value===true||value==='yes'?true:value===false||value==='no'?false:null;
const NUMBER=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const number=value=>((typeof value==='number'||typeof value==='string')&&String(value).length<100&&NUMBER.test(String(value).trim())&&Number.isFinite(Number(value)))?Number(value):null;
const positive=value=>number(value)!==null&&number(value)>0&&exactDecimal(value)!==null;
const exactDecimal=value=>{
 const text=String(value).trim();
 const match=/^([+-]?)(\d+(?:\.\d*)?|\.\d+)(?:e([+-]?\d+))?$/i.exec(text);
 if(!match)return null;
 const exponent=Number(match[3]||0);if(Math.abs(exponent)>200)return null;
 const fraction=(match[2].split('.')[1]||'').length;
 let numerator=BigInt(match[2].replace('.',''))*(match[1]==='-'?-1n:1n),denominator=1n;
 const scale=exponent-fraction;
 if(scale>=0)numerator*=10n**BigInt(scale);else denominator=10n**BigInt(-scale);
 return{numerator,denominator};
};
// Decimal inputs are compared as rationals so an exact diagram boundary is
// not promoted because binary floating-point multiplication rounded upwards.
const productAbove=(a,b,limit)=>{
 const x=exactDecimal(a),y=exactDecimal(b);if(!x||!y)return false;
 return x.numerator*y.numerator>BigInt(limit)*x.denominator*y.denominator;
};
const scalarAbove=(value,limit)=>productAbove(value,1,limit);
function output(input,extras={}){
 const ps=number(input.ps),volume=number(input.volume),dn=number(input.dn);
 return{status:'review',category:null,diagram:null,ref:'AFS 2023:5 §§1–2, 6–9; Annex 2',ruleId:'unresolved',reasons:[],required:[],sourceUrl:SOURCE_URL,checkedOn:CHECKED_ON,ruleset:RULESET_VERSION,boundaryRule:'Diagram boundaries are the upper limits of the lower category.',calculations:{ps,volume,dn,psV:ps!==null&&volume!==null&&Number.isFinite(ps*volume)?ps*volume:null,psDN:ps!==null&&dn!==null&&Number.isFinite(ps*dn)?ps*dn:null},inputs:{...input},...extras};
}
const review=(input,reasons,required=[],extras={})=>output(input,{reasons,required,...extras});
const calculated=(input,category,diagram,reasons=[],extras={})=>output(input,{status:'calculated',category,diagram,ruleId:'annex2-diagram-'+diagram,ref:`AFS 2023:5 §6; Annex 2 diagram ${diagram}, introductory point 4`,reasons,required:[],...extras});
function scalarDiagram(input,type){
 const ps=number(input.ps),v=number(input.volume),dn=number(input.dn),g=String(input.fluidGroup),phase=input.phase;
 const dimensions=type==='vessel'?['volume']:['dn'];
 const missing=[];
 if(!['1','2'].includes(g))missing.push('fluidGroup');
 if(!['gas','liquid'].includes(phase))missing.push('phase');
 for(const key of dimensions)if(!positive(input[key]))missing.push(key);
 if(missing.length)return review(input,['The diagram requires documented fluid grouping, vapour-pressure phase branch and a positive dimensional value.'],missing);
 const pv=ps*v,pdn=ps*dn,abovePV=n=>productAbove(input.ps,input.volume,n),abovePDN=n=>productAbove(input.ps,input.dn,n);
 if(!Number.isFinite(type==='vessel'?pv:pdn))return review(input,['The PS product exceeds the supported numeric display range. Verify the units and obtain a specialist assessment.'],[type==='vessel'?'volume':'dn','ps']);
 let category='SEP',diagram;
 if(type==='vessel'){
  if(phase==='gas'&&g==='1'){
   diagram=1;
   const inScope=v>1&&abovePV(25)||ps>200;
   if(inScope){
    if(v<=1?ps>1000:abovePV(1000))category='IV';
    else if(v<=1?ps>200:abovePV(200))category='III';
    else category=abovePV(50)?'II':'I';
   }
  }else if(phase==='gas'&&g==='2'){
   diagram=2;
   const inScope=v>1&&abovePV(50)||ps>1000;
   if(inScope){
    if(ps>4&&(v<=1?ps>3000:abovePV(3000)))category='IV';
    else if(v<=1?ps>1000:abovePV(1000))category='III';
    else category=abovePV(200)?'II':'I';
   }
  }else if(phase==='liquid'&&g==='1'){
   diagram=3;
   const inScope=v>1&&abovePV(200)||ps>500;
   if(inScope)category=ps>500&&v>1?'III':ps>10?'II':'I';
  }else{
   diagram=4;
   const inScope=ps>10&&abovePV(10000)||ps>1000;
   if(inScope)category=ps>500&&v>10?'II':'I';
  }
 }else{
  if(phase==='gas'&&g==='1'){
   diagram=6;
   if(dn>25)category=dn>350||dn>100&&abovePDN(3500)?'III':dn>100||abovePDN(1000)?'II':'I';
  }else if(phase==='gas'&&g==='2'){
   diagram=7;
   if(dn>32&&abovePDN(1000))category=dn>250&&abovePDN(5000)?'III':dn>100&&abovePDN(3500)?'II':'I';
  }else if(phase==='liquid'&&g==='1'){
   diagram=8;
   if(dn>25&&abovePDN(2000))category=ps>500?'III':ps>10?'II':'I';
  }else{
   diagram=9;
   if(ps>10&&dn>200&&abovePDN(5000))category=ps>500?'II':'I';
  }
 }
 const reasons=[`Selected diagram ${diagram}: ${type}, ${phase} branch, fluid group ${g}.`,`${type==='vessel'?'PS × V':'PS × DN'} = ${type==='vessel'?pv:pdn}; exact boundary equality stays in the lower category.`,diagramBasis[diagram]];
 if(category==='SEP')reasons.push('At or below the §6 thresholds: §8 good engineering practice applies; no CE marking under this AFS.');
 if((diagram===1||diagram===6)&&['I','II'].includes(category)){
  const unstable=knownBoolean(input.unstableGas);
  if(unstable===null)return review(input,[...reasons,'Confirm whether the gas is unstable before applying the diagram exception.'],['unstableGas'],{diagram,candidateCategory:category,ruleId:'unstable-gas-unresolved'});
  if(unstable){category='III';reasons.push('Unstable-gas exception raises diagram I/II to category III.');}
 }
 if(diagram===2&&rank[category]<3&&input.equipmentType!=='accessory'){
  const extinguisher=knownBoolean(input.fireExtinguisher),breathing=knownBoolean(input.breathingBottle);
  if(extinguisher===true||breathing===true){category='III';reasons.push('Portable fire extinguisher / breathing-apparatus bottle: minimum category III.');}
  else if(extinguisher===null||breathing===null)return review(input,[...reasons,'Confirm the portable extinguisher and breathing-bottle exceptions.'],[...(extinguisher===null?['fireExtinguisher']:[]),...(breathing===null?['breathingBottle']:[])],{diagram,candidateCategory:category,ruleId:'portable-container-unresolved'});
 }
 if(type==='vessel'&&diagram!==2&&rank[category]<3&&input.equipmentType!=='accessory'){
  const extinguisher=knownBoolean(input.fireExtinguisher),breathing=knownBoolean(input.breathingBottle);
  if(extinguisher===true||breathing===true)return review(input,[...reasons,'This is a declared portable extinguisher or breathing-apparatus bottle outside the ordinary diagram 2 fluid branch. Obtain the manufacturer’s classification and applicable special-route assessment before accepting a low category.'],['manufacturerCategoryEvidence'],{diagram,candidateCategory:category,ruleId:'portable-cross-branch-review',ref:'AFS 2023:5 §6(a)(i); Annex 2 diagram 2 exception'});
  if(extinguisher===null||breathing===null)return review(input,[...reasons,'Confirm that this low-category vessel is neither a portable extinguisher nor a breathing-apparatus bottle.'],[...(extinguisher===null?['fireExtinguisher']:[]),...(breathing===null?['breathingBottle']:[])],{diagram,candidateCategory:category,ruleId:'portable-container-unresolved'});
 }
 if(diagram===7&&category==='II'){
  const temperature=number(input.tsMax);
  if(temperature===null)return review(input,[...reasons,'Temperature is required to assess the diagram 7 exception.'],['tsMax'],{diagram,candidateCategory:category,ruleId:'high-temperature-unresolved'});
  if(temperature>350){category='III';reasons.push('Diagram 7 category II piping above 350 °C is raised to category III.');}
 }
 return calculated(input,category,diagram,reasons);
}

/**
 * Supported input is one documented scalar fluid/chamber, not an inferred
 * reading of an asset's free-text description. Scope exclusions are declared
 * by a responsible reviewer before any product category can be calculated.
 */
export function productClassify(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))return review({},['Equipment data must be an object.'],['equipmentType']);
 if(input.productExclusion==='excluded'){
  if(typeof input.exclusionReason!=='string'||!input.exclusionReason.trim())return review(input,['A product-scope exclusion needs its exact §2 point and supporting basis.'],['exclusionReason']);
  return output(input,{status:'outside',ruleId:'section-2-exclusion',ref:'AFS 2023:5 §2',reasons:['Declared product-scope exclusion: '+input.exclusionReason.trim()+'. Assess use and inspection rules separately.']});
 }
 if(input.tsMax!==undefined&&input.tsMax!==''){const ts=number(input.tsMax);if(ts===null||ts< -273.15)return review(input,['The supplied maximum allowable temperature is invalid or below absolute zero. Verify its source.'],['tsMax']);}
 const ps=number(input.ps);
 if(ps===null||!exactDecimal(input.ps))return review(input,['Enter a finite maximum allowable gauge pressure PS in bar from the nameplate or approved documentation.'],['ps']);
 if(ps<=.5)return output(input,{status:'outside',ruleId:'section-1-pressure-threshold',ref:'AFS 2023:5 §1',reasons:['PS is not higher than 0.5 bar; the product is outside §1. This does not determine AFS 2023:11 use class.']});
 if(input.productExclusion!=='none')return review(input,['Confirm all applicable product-scope exclusions before calculating a PED category.'],['productExclusion']);
 const type=input.equipmentType;
 if(type==='assembly')return review(input,['An assembly needs component-by-component classification, integration and protective-system assessment. Do not assign a single scalar diagram category to the complete assembly.'],['componentAssessments'],{ref:'AFS 2023:5 §§7, 11',ruleId:'assembly-specialist'});
 if(type==='safety'){
  if(knownBoolean(input.protectsInScope)!==true)return review(input,['Confirm that this safety accessory protects pressure equipment within §6. Its name alone does not establish the product-law route.'],['protectsInScope'],{ref:'AFS 2023:5 §6(d); Annex 2 introductory point 2'});
  if(input.safetyException==='none')return output(input,{status:'calculated',category:'IV',ruleId:'safety-category-IV',ref:'AFS 2023:5 Annex 2 introductory point 2',reasons:['Safety equipment protecting §6 equipment follows category IV by the general rule; no manufacturer-specific exception has been claimed.']});
  return review(input,['Safety equipment is normally category IV. A manufacturer-specific exception needs the protected equipment category and supporting manufacturer assessment.'],['safetyException','protectedEquipmentEvidence'],{ref:'AFS 2023:5 Annex 2 introductory point 2',ruleId:'safety-exception-review'});
 }
 if(!['vessel','piping','heated','accessory'].includes(type))return review(input,['Identify the actual pressure-retaining item. A pump, compressor or machine name alone does not establish the pressure-equipment type or product scope.'],['equipmentType']);
 if(input.configuration==='multiple'||knownBoolean(input.multipleChambers)===true||knownBoolean(input.multipleFluids)===true)return review(input,['Assess every chamber/fluid case and select the highest category; one scalar calculation cannot classify the declared multiple-case configuration.'],['componentAssessments'],{ref:'AFS 2023:5 §9 final paragraph',ruleId:'multiple-cases-review'});
 if(['vessel','accessory','heated','piping'].includes(type)){
  const config=input.configuration||(knownBoolean(input.multipleChambers)===false&&knownBoolean(input.multipleFluids)===false?'single':knownBoolean(input.multipleChambers)===true||knownBoolean(input.multipleFluids)===true?'multiple':'unknown');
  if(config!=='single')return review(input,['For multiple chambers or fluids, assess each case and use the highest resulting category. The scalar calculator requires confirmation of a single relevant chamber/fluid operating case.'],['configuration'],{ref:'AFS 2023:5 §9 final paragraph',ruleId:'multiple-cases-review'});
 }
 if(type==='heated'){
  const pressureCooker=knownBoolean(input.pressureCooker),steam=knownBoolean(input.steamOrHotWater),overheat=knownBoolean(input.overheatingRisk),v=number(input.volume),ts=number(input.tsMax);
  const missing=[];if(pressureCooker===null)missing.push('pressureCooker');if(!positive(input.volume))missing.push('volume');
  if(pressureCooker!==true){if(steam===null)missing.push('steamOrHotWater');if(overheat===null)missing.push('overheatingRisk');if(ts===null)missing.push('tsMax');}
  if(missing.length)return review(input,['The heated-equipment route needs the intended steam/hot-water duty, overheating risk, volume, temperature and pressure-cooker decision.'],missing,{diagram:5});
  if(pressureCooker&&v<=2)return review(input,['All pressure cookers fall under §6(b), but this small cooker is outside the ordinary V > 2 L part of diagram 5. Obtain a manufacturer/specialist category assessment; its design procedure must meet at least category III.'],['manufacturerCategoryEvidence'],{diagram:5,ref:'AFS 2023:5 §6(b); Annex 2 diagram 5 exception',designProcedureMinimum:'III'});
  if(pressureCooker!==true&&!(steam&&overheat&&ts>110))return review(input,['The declared data do not establish the ordinary §6(b) heated steam/hot-water route. Review whether another vessel/fluid route or a special assembly rule applies.'],['appropriateProductRoute'],{diagram:5,ref:'AFS 2023:5 §6(b), §7'});
  if(v<=2)return review(input,['The ordinary §6(b) heated route has V > 2 L. Review the actual product route and manufacturer category rather than transferring the heated chart to another equipment type.'],['manufacturerCategoryEvidence'],{diagram:5});
  const pv=ps*v;
  if(!Number.isFinite(pv))return review(input,['The PS × V product exceeds the supported numeric display range. Verify pressure and volume units.'],['ps','volume'],{diagram:5});
  const category=ps>32||v>1000||productAbove(input.ps,input.volume,3000)?'IV':productAbove(input.ps,input.volume,200)?'III':productAbove(input.ps,input.volume,50)?'II':'I';
  const reasons=[`Diagram 5: PS × V = ${pv}; PS = ${ps} bar; V = ${v} L.`, 'Diagram boundaries are upper category limits; category IV applies above PS 32 bar, V 1,000 L or PS × V 3,000.'];
  if(pressureCooker)reasons.push('Pressure-cooker design requires a procedure corresponding to at least category III, independently of the calculated product category.');
  return calculated(input,category,5,reasons,pressureCooker?{designProcedureMinimum:'III'}:{});
 }
 if(type==='accessory'){
  const basis=input.accessoryBasis;
  if(!['volume','dn','both'].includes(basis))return review(input,['Determine whether volume, nominal size or both are relevant to this pressure accessory.'],['accessoryBasis'],{ref:'AFS 2023:5 Annex 2 introductory point 3'});
  const branches=(basis==='both'?['vessel','piping']:basis==='volume'?['vessel']:['piping']).map(branch=>scalarDiagram(input,branch));
  if(branches.some(x=>x.status!=='calculated'))return review(input,['Every relevant pressure-accessory branch must be resolved before selecting the higher category.'],[...new Set(branches.flatMap(x=>x.required))],{branches,ref:'AFS 2023:5 Annex 2 introductory point 3',ruleId:'accessory-unresolved'});
  const highest=branches.reduce((a,b)=>rank[a.category]>=rank[b.category]?a:b);
  return{...highest,inputs:{...input},ruleId:'accessory-highest-relevant-branch',ref:'AFS 2023:5 Annex 2 introductory point 3; diagrams '+branches.map(x=>x.diagram).join(' and '),reasons:[...highest.reasons,'Pressure accessory: use the highest category from every relevant V/DN branch.'],branches};
 }
 return scalarDiagram(input,type);
}

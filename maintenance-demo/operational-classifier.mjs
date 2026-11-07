/* AFS 2023:11, 9 kap. 23–35 §§, consolidated through AFS 2024:4.
 * Source tables were checked against the rendered official PDF, printed pp. 88–94.
 * This is a documented classification aid, not a control-body decision or release.
 */
export const OPERATIONAL_SOURCE='https://www.av.se/globalassets/filer/publikationer/foreskrifter/konsoliderade-foreskrifter/arbetsutrustning-och-personlig-skyddsutrustning-saker-anvandning-afs2023-11-konsoliderad.pdf';
const text=value=>typeof value==='string'&&value.trim().length>0;
const tri=value=>value==='yes'?'yes':value==='no'?'no':'unknown';
const pow=n=>10n**BigInt(n);

// Compare decimal input products without binary floating-point rounding at a class boundary.
function decimal(value){
  if(typeof value!=='number'&&typeof value!=='string'||typeof value==='number'&&!Number.isFinite(value))return null;
  let raw=String(value).trim().replace(',','.');if(raw.length>512||!Number.isFinite(Number(raw)))return null;
  if(typeof value==='string'&&!/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw))return null;
  const match=/^(-?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(raw);if(!match||!(match[2]||match[3]))return null;
  let n=BigInt((match[1]||'')+(match[2]||'0')+(match[3]||'')),s=(match[3]||'').length-Number(match[4]||0);
  if(s<0){n*=pow(-s);s=0;}return {n,s,value:Number(raw)};
}
const compare=(a,b)=>{b=typeof b==='object'?b:decimal(b);const s=Math.max(a.s,b.s),an=a.n*pow(s-a.s),bn=b.n*pow(s-b.s);return an<bn?-1:an>bn?1:0;};
const above=(a,b)=>compare(a,b)>0;
const atMost=(a,b)=>compare(a,b)<=0;
const product=(a,b)=>({n:a.n*b.n,s:a.s+b.s,value:a.value*b.value});
function exact(a){let raw=(a.n<0n?-a.n:a.n).toString().padStart(a.s+1,'0');if(a.s)raw=raw.slice(0,-a.s)+'.'+raw.slice(-a.s);raw=raw.replace(/\.?(0+)$/,m=>raw.includes('.')?m.replace(/0/g,''):m);if(raw.endsWith('.'))raw=raw.slice(0,-1);return (a.n<0n?'-':'')+raw;}

export function operationalClassify(input={}){
  if(!input||typeof input!=='object'||Array.isArray(input))input={};
  const inputs={...input},calculations={},required=[],reasons=[];
  let ref='AFS 2023:11 · 9 kap. 23–35 §§',ruleId='op-review';
  const result=(status,className,message,id=ruleId,reference=ref)=>({status,className,ref:reference,ruleId:id,reasons:[...reasons,...(message?[message]:[])],required:[...new Set(required)],calculations:{...calculations},inputs});
  const review=(message,fields=[],id='op-review',reference=ref)=>{required.push(...fields);return result('review',null,message,id,reference);};
  const classified=(value,id,message)=>result('calculated',value,message,id);
  const number=(name,{positive=false,nonnegative=false}={})=>{const d=decimal(input[name]);if(!d||positive&&!above(d,0)||nonnegative&&above(decimal(0),d)){required.push(name);return null;}calculations[name]=d.value;return d;};
  const basis=()=>['body','safety','manufacturer'].includes(input.operationalLimitsBasis)&&text(input.operationalLimitsReference);
  if(input.operationalExclusion==='excluded'){
    if(!text(input.operationalExclusionReason))return review('Record the exact operational exclusion and its legal basis.',['operationalExclusionReason'],'op-exclusion-basis');
    return result('outside','other','Operational exclusion recorded; this does not determine product scope or other applicable rules.','op-excluded','AFS 2023:11 · 9 kap. 1, 3–4 §§');
  }
  if(input.operationalExclusion!=='none')return review('Assess operational scope separately from PED product exclusions.',['operationalExclusion'],'op-scope');
  if(input.temperature!==undefined&&input.temperature!==''){const temperature=decimal(input.temperature);if(!temperature||compare(temperature,-273.15)<0)return review('The supplied temperature is invalid or below absolute zero. Verify the documented limit.',['temperature'],'op-invalid-temperature');}
  const type=input.operationalType;
  if(!['vessel','piping','boiler','water-heater','heated','cistern','vacuum'].includes(type))return review('Confirm the equipment definition or obtain a specialist classification.',['operationalType'],'op-type','AFS 2023:11 · 9 kap. 2 §');
  if(!basis())return review('Record the §28 pressure/temperature limit source: control-body decision first, then protective trip limits, then manufacturer limits where no safety equipment exists. Normal operating readings do not establish these limits.',['operationalLimitsBasis','operationalLimitsReference'],'op-limit-basis','AFS 2023:11 · 9 kap. 28 §');
  if(tri(input.multipleFluids)!=='no')return review('Assess the whole device as filled with the fluid producing the most extensive requirements; this single-fluid calculator cannot resolve the combination.',['multipleFluids'],'op-multiple-fluids','AFS 2023:11 · 9 kap. 26 §');
  if(type!=='piping'&&tri(input.multipleCompartments)!=='no')return review('Assess every compartment and the most demanding result. A heated pressurised jacket around a charge space requires their combined volume; this needs a separate documented assessment.',['multipleCompartments'],'op-multiple-spaces','AFS 2023:11 · 9 kap. 27 §');
  if(type==='piping'&&tri(input.branchPipe)!=='no')return review('A smaller branch inherits the main-pipe class up to and including the first isolation valve. Record that system assessment rather than calculating the branch alone.',['branchPipe'],'op-branch-pipe','AFS 2023:11 · 9 kap. 33 §');

  if(type==='boiler'){
    ref='AFS 2023:11 · 9 kap. 29 §';
    if(tri(input.flowThroughCoil)==='yes'){
      const coil=number('coilVolume',{positive:true});if(!coil)return review('Enter the flow-through coil volume in litres.',['coilVolume'],'op-boiler-coil');
      if(atMost(coil,25))return classified('other','op-boiler-coil-exception','A flow-through boiler with coil volume at most 25 litres is outside classes A and B.');
    }
    const t=number('temperature'),power=number('ratedPower',{nonnegative:true});if(!t||!power)return review('Enter the documented classification temperature and marked boiler power in kW.');
    const c=above(t,110)&&above(power,5)?'A':above(t,65)&&atMost(t,110)&&above(power,100)?'B':'other';
    if(c!=='other'&&tri(input.flowThroughCoil)==='unknown')return review('Determine whether the flow-through coil exception applies.',['flowThroughCoil'],'op-boiler-coil-review');
    return classified(c,'op-boiler-'+c.toLowerCase(),'Boiler class calculated from temperature and marked power; no generic 0.5-bar gate is applied.');
  }
  if(type==='water-heater'){
    ref='AFS 2023:11 · 9 kap. 2, 30 §§';const t=number('temperature');if(!t)return review('Enter the documented classification temperature.');
    if(atMost(t,65)||above(t,110))return review('The water-heater definition is electric tap-water heating above 65°C and at most 110°C. Reassess the equipment type outside this range.',['operationalType'],'op-water-heater-definition');
    const v=number('volume',{positive:true});if(!v)return review('Enter the water-heater volume in litres.');
    return classified(above(v,2000)?'A':above(v,500)?'B':'other','op-water-heater','Electric tap-water heater: A above 2000 L; B above 500 L through 2000 L.');
  }

  const group=input.opGroup;
  const groupMissing=!['1a','2a'].includes(group)||!text(input.fluidEvidenceReference);
  const missingGroup=()=>review('Record the operational fluid group under §25 and its reviewed fluid evidence. PED groups 1/2 are not interchangeable with 1a/2a.',['opGroup','fluidEvidenceReference'],'op-fluid-group','AFS 2023:11 · 9 kap. 25 §');
  if(type==='cistern'||type==='vacuum'){
    if(groupMissing)return missingGroup();
    ref=`AFS 2023:11 · 9 kap. ${type==='cistern'?'34':'35'} §`;
    if(input.p!==undefined&&input.p!==''){
      const p=number('p');if(!p)return review('Enter a plain gauge-pressure value if pressure is recorded.');
      if(type==='cistern'&&(above(p,.5)||above(decimal(-.0065),p)))return review('The entered gas-head pressure is outside the cistern definition (−0.0065 to +0.5 bar gauge). Confirm the equipment type.',['operationalType'],'op-cistern-definition');
      if(type==='vacuum'&&!above(decimal(-.0065),p))return review('A vacuum vessel is designed for gauge pressure below −0.0065 bar. Confirm the equipment type.',['operationalType'],'op-vacuum-definition');
    }
    const v=number('volume',{positive:true});if(!v)return review('Enter the vessel volume in litres.');
    let c='other';
    if(group==='1a')c=type==='cistern'?(above(v,10000)?'A':above(v,5000)?'B':'other'):(above(v,5000)?'A':above(v,1000)?'B':'other');
    else{const t=number('temperature');if(!t)return review('Group 2a cistern/vacuum classification requires the documented temperature.');if(above(t,65))c=type==='cistern'?(above(v,50000)?'B':'other'):(above(v,500000)?'A':above(v,50000)?'B':'other');}
    return classified(c,'op-'+type+'-'+group,'Class calculated from volume, operational group and any applicable temperature condition; no positive-pressure threshold is applied.');
  }

  let p=number('p',{nonnegative:true});if(!p)return review('Enter the classification pressure p in bar gauge. Negative-pressure equipment needs its own type assessment.');
  if(atMost(p,.5))return classified('other','op-pressure-at-most-half','The vessel/piping pressure tables require p above 0.5 bar. This result does not classify a cistern or vacuum vessel.');

  // A deliberately heated non-boiler is classified under §31 only when both conditions apply.
  if(type==='heated'||type==='vessel'){
    const oh=tri(input.overheatingRisk),sw=tri(input.steamOrHotWater),maybeT=decimal(input.temperature);
    const possibleHot=!maybeT||above(maybeT,110);
    if(oh!=='no'&&sw!=='no'&&possibleHot){
      if(oh==='unknown'||sw==='unknown')return review('Screen this non-boiler vessel for overheating risk and steam/hot-water production above 110°C before using the ordinary vessel tables.',['overheatingRisk','steamOrHotWater'],'op-heated-screen','AFS 2023:11 · 9 kap. 31–32 §§');
      if(!text(input.heatedAssessmentReference))return review('Record the technical basis for the heated-vessel branch.',['heatedAssessmentReference'],'op-heated-basis','AFS 2023:11 · 9 kap. 31 §');
      const t=number('temperature'),v=number('volume',{positive:true});if(!t||!v)return review('Enter classification temperature and the applicable total vessel volume.');
      ref='AFS 2023:11 · 9 kap. 31 §, tabell 2';const pv=product(p,v);calculations.pV=pv.value;calculations.pVExact=exact(pv);
      if(!above(v,2))return classified('other','op-heated-volume','The heated-vessel table requires volume above 2 litres.');
      const c=atMost(p,32)?(above(pv,200)?'A':above(pv,50)?'B':'other'):(above(pv,64)?'A':'other');
      return classified(c,'op-heated-table2','Heated non-boiler class calculated using table 2 and its strict lower boundaries.');
    }
    if(type==='heated')reasons.push('The documented conditions do not select §31; ordinary vessel tables are evaluated instead.');
  }
  if(groupMissing)return missingGroup();
  if(!['gas','liquid'].includes(input.opPhase)||!text(input.phaseBasis))return review('Record the classification phase under §24, including the boiling-point/maximum-temperature rule and any evidenced vapour-pressure exception.',['opPhase','phaseBasis'],'op-phase','AFS 2023:11 · 9 kap. 24 §');
  const phase=input.opPhase;
  const t=decimal(input.temperature);
  if(phase==='liquid'&&group==='2a'){
    if(!t){required.push('temperature');return review('The 65°C exception requires the §28 classification temperature.');}
    calculations.temperature=t.value;
    if(atMost(t,65))return classified('other','op-liquid-2a-cool','Group 2a liquid at a classification temperature at most 65°C is outside the applicable vessel/piping table.');
  }

  if(type==='piping'){
    ref=`AFS 2023:11 · 9 kap. 33 §, tabell ${phase==='gas'?'5':'6'}`;
    const dn=number('dn',{positive:true});if(!dn)return review('Enter the largest applicable DN, or documented equivalent inner diameter, in millimetres.');
    const pdn=product(p,dn);calculations.pDN=pdn.value;calculations.pDNExact=exact(pdn);
    let c='other';
    if(phase==='gas'){
      if(group==='1a')c=above(dn,100)?'A':above(dn,25)?(above(pdn,1000)?'A':'B'):'other';
      else c=above(dn,250)?(above(pdn,5000)?'A':above(pdn,3500)?'B':'other'):above(dn,100)&&above(pdn,3500)?'B':'other';
      if(c==='B'&&group==='1a'){
        if(tri(input.unstableGas)==='unknown')return review('Determine whether the group 1a gas is unstable under CLP.',['unstableGas'],'op-pipe-unstable-review');
        if(tri(input.unstableGas)==='yes'){c='A';reasons.push('A table-B unstable group 1a gas is promoted to class A.');}
      }
      if(c==='B'&&group==='2a'){
        if(!t){required.push('temperature');return review('Determine whether group 2a gas temperature exceeds 350°C.');}
        calculations.temperature=t.value;if(above(t,350)){c='A';reasons.push('A table-B group 2a gas above 350°C is promoted to class A.');}
      }
    }else if(group==='1a'){if(above(dn,25)&&above(pdn,2000))c=above(p,10)?'A':'B';}
    else if(above(dn,200)&&above(p,10)&&above(pdn,5000))c='B';
    return classified(c,'op-piping-'+phase+'-'+group,'Piping class calculated with the table’s diameter and pressure-product limits. Vessel air/nitrogen exemptions do not apply to piping.');
  }

  ref=`AFS 2023:11 · 9 kap. 32 §, tabell ${phase==='gas'?'3':'4'}`;
  const v=number('volume',{positive:true});if(!v)return review('Enter the applicable vessel volume in litres.');
  function gasClass(pressure){const pv=product(pressure,v);if(group==='1a')return above(v,1)?(above(pv,200)?'A':above(pv,50)?'B':'other'):above(v,.1)&&above(pressure,200)?'A':'other';return above(v,1)?(above(pv,1000)?'A':above(pv,200)?'B':'other'):above(v,.1)&&above(pressure,1000)?'A':'other';}
  let c='other';
  if(phase==='gas'){
    const air=tri(input.airOrNitrogen),water=tri(input.waterPressurisedAir);
    if(group==='1a'&&(air==='yes'||water==='yes'))return review('Pure air/nitrogen and the water-compressed-air exception conflict with the selected group 1a assessment. Reassess the fluid.',['opGroup','fluidEvidenceReference'],'op-air-group-conflict');
    if(group==='2a'&&water==='yes'){
      if(air==='no')return review('The water-pumping exception is specifically for air compressed in an initially unpressurised vessel. Resolve the inconsistent air answer.',['airOrNitrogen','waterPressurisedAir'],'op-water-air-conflict');
      p=decimal(1);reasons.push('The documented initially unpressurised, water-compressed-air case uses p = 1 bar for table 3.');
    }
    c=gasClass(p);
    if(group==='2a'&&water==='unknown'&&air!=='no'){
      const possible=gasClass(decimal(1)),afterException=possible==='B'?'other':possible;
      const noWaterResult=c==='B'&&(air==='yes'||tri(input.refrigeration)==='yes')?'other':c;
      if(afterException!==noWaterResult)return review('Determine whether air was compressed by pumping water into an initially unpressurised vessel; this can change the classification pressure to 1 bar.',['waterPressurisedAir'],'op-water-air-review');
    }
    if(c==='B'&&group==='1a'){
      if(tri(input.unstableGas)==='unknown')return review('Determine whether this group 1a gas is unstable under CLP.',['unstableGas'],'op-vessel-unstable-review');
      if(tri(input.unstableGas)==='yes'){c='A';reasons.push('A table-B unstable group 1a gas is promoted to class A.');}
    }
    if(c==='B'&&group==='2a'){
      if(air==='yes'||water==='yes'){c='other';reasons.push('A table-B air/nitrogen vessel is outside A/B; the exception does not demote a table-A vessel.');}
      else if(tri(input.refrigeration)==='yes'){c='other';reasons.push('A table-B group 2a gas vessel in a refrigeration/heat-pump installation is outside A/B.');}
      else if(air==='unknown'||tri(input.refrigeration)==='unknown')return review('Determine the B-only air/nitrogen and group 2a refrigeration/heat-pump exceptions.',['airOrNitrogen','refrigeration'],'op-vessel-b-exceptions');
    }
  }else if(group==='1a'){
    const pv=product(p,v);if(above(v,1))c=above(p,10)?(above(pv,2000)?'A':above(pv,200)?'B':'other'):(above(pv,200)?'B':'other');
    else if(above(v,.1)&&above(p,500))c='B';
  }else{const pv=product(p,v);if(above(v,10)&&above(p,500)&&above(pv,10000))c='B';}
  const pv=product(p,v);calculations.effectiveP=p.value;calculations.pV=pv.value;calculations.pVExact=exact(pv);
  return classified(c,'op-vessel-'+phase+'-'+group,'Vessel class calculated from the applicable table and explicit special-case answers.');
}

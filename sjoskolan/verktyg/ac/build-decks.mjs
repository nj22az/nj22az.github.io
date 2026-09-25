import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
import {LESSONS} from '../../vecka-40/aktuell/lektioner.mjs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const SKILL=process.env.PRESENTATION_SKILL_ROOT;if(!SKILL)throw Error('Set PRESENTATION_SKILL_ROOT to the installed Presentations skill');
const {finalizePresentation,applyPresentationChartFont}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')));
const workspaceDir=path.resolve(process.argv[2]||'ac-build');
await fs.mkdir(path.join(workspaceDir,'tmp'),{recursive:true});await fs.mkdir(path.join(workspaceDir,'output-final'),{recursive:true});

const BLUE='#064f91',INK='#172f43';
function box(slide,name,text,x,y,w,h,size=28,color=INK,bold=false){const s=slide.shapes.add({name,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});s.text=text;s.text.style={typeface:'Calibri',fontSize:size,color,bold,autoFit:'none',verticalAlignment:'top',insets:{left:0,right:0,top:0,bottom:0}};return s;}
function diagram(slide,kind){
 const position={left:90,top:142,width:780,height:250};
 if(['wave','period','peak','resistor','rl'].includes(kind)){
  const phase=kind==='rl'?Math.atan(30/40):0,normalized=['rl','resistor'].includes(kind),xs=Array.from({length:161},(_,i)=>i/4),peak=normalized?1:12*Math.SQRT2;
  const series=[{name:normalized?'Spänning u (normaliserad)':'Spänning (V)',xValues:xs,values:xs.map(t=>Number((peak*Math.sin(2*Math.PI*t/20)).toFixed(8))),line:{fill:BLUE,width:2.5},marker:{symbol:'none'}}];
  if(normalized)series.push({name:'Ström i (normaliserad)',xValues:xs,values:xs.map(t=>Number(Math.sin(2*Math.PI*t/20-phase).toFixed(8))),line:{fill:'#ad5018',width:2.5,dash:'dash'},marker:{symbol:'none'}});
  const chart=slide.charts.add('scatter',{position,series,hasLegend:normalized,legend:{position:'bottom',textStyle:{fontSize:14,typeface:'Calibri'}},scatterOptions:{style:'line'},xAxis:{title:'Tid (ms)',min:0,max:40,majorUnit:10,textStyle:{fontSize:14,typeface:'Calibri'}},yAxis:{title:normalized?'Normaliserad amplitud':'Spänning (V)',min:normalized?-1:-20,max:normalized?1:20,majorUnit:normalized?1:10,textStyle:{fontSize:14,typeface:'Calibri'},majorGridlines:{fill:'#dfe7ee',width:1}},chartFill:'#FFFFFF',plotAreaFill:'#FFFFFF'});applyPresentationChartFont(chart,{fontFamily:'Calibri'});
  if(kind==='period')box(slide,'period-label','En hel period: 0 till 20 ms',530,143,310,28,20,BLUE,true);
  if(kind==='peak')box(slide,'peak-label','Topp från noll: 16,97 V',525,143,320,28,20,BLUE,true);
 }else if(['triangle','powerTriangle'].includes(kind)){
  const isZ=kind==='triangle',a=isZ?40:1150,b=isZ?30:Math.sqrt(2300**2-1150**2),scale=190/b;
  const ox=isZ?285:350,oy=330,dx=a*scale,dy=b*scale;
  const segment=(name,x1,y1,x2,y2,color)=>slide.shapes.add({name,geometry:'custom',position:{left:Math.min(x1,x2),top:Math.min(y1,y2),width:Math.max(1,Math.abs(x2-x1)),height:Math.max(1,Math.abs(y2-y1))},fill:'none',line:{fill:color,width:3},customPaths:[{width:Math.max(1,Math.abs(x2-x1)),height:Math.max(1,Math.abs(y2-y1)),commands:[{moveTo:{x:x1-Math.min(x1,x2),y:y1-Math.min(y1,y2)}},{lineTo:{x:x2-Math.min(x1,x2),y:y2-Math.min(y1,y2)}}]}]});
  segment('real-leg',ox,oy,ox+dx,oy,INK);segment('reactive-leg',ox+dx,oy,ox+dx,oy-dy,'#ad5018');segment('hypotenuse',ox,oy,ox+dx,oy-dy,BLUE);
  segment('right-angle-h',ox+dx-12,oy-12,ox+dx,oy-12,'#8394a1');segment('right-angle-v',ox+dx-12,oy-12,ox+dx-12,oy,'#8394a1');
  box(slide,'horizontal-label',isZ?'R = 40 Ω':'P = 1 150 W',ox-5,338,280,30,22,INK,true);
  box(slide,'vertical-label',isZ?'XL ≈ 30 Ω':'Q ≈ 1 992 var',ox+dx+20,225,270,30,22,'#ad5018',true);
  box(slide,'diagonal-label',isZ?'|Z| ≈ 50 Ω':'S = 2 300 VA',120,155,230,30,24,BLUE,true);
 }else{
  const rows=kind==='calibration'?[['True RMS','10,00 V'],['Sinuskalibrerad','10,00 V']]:kind==='meters'?[['Sinus','12,00 V'],['Fyrkant','13,33 V'],['Triangel','11,54 V']]:kind==='rms'?[['Multimeter, true RMS','12,00 V'],['Kurvans topp','16,97 V']]:[['PF = 1,00','5,00 A'],['PF = 0,50','10,00 A']];
  const step=rows.length===3?70:100;
  rows.forEach((r,i)=>{box(slide,'meter-label-'+i,r[0],100,155+i*step,430,40,28);box(slide,'meter-value-'+i,r[1],570,149+i*step,290,60,40,BLUE,true);});
 }
}
await fs.mkdir(path.join(workspaceDir,'rendered'),{recursive:true});
for(const lesson of LESSONS){
 const input=fileURLToPath(new URL('../../vecka-40/arkiv/2026-09-25/'+lesson.deck,import.meta.url));
 const presentation=await PresentationFile.importPptx(await FileBlob.load(input));
 const original=[...presentation.slides.items],cover=original[0],template=original[1];
 // Keep the supplied cover, artwork, footer, theme, masters and 4:3 dimensions.
 const authored=[];
 for(const [i,content]of lesson.slides.entries()){
  const slide=template.duplicate();slide.shapes.deleteAll();authored.push(slide);
  box(slide,'title',content.title,60,45,840,82,content.title.length>43?34:40,'#111111',true);
  if(content.visual){diagram(slide,content.visual);box(slide,'body',content.body.join('\n\n'),80,410,800,220,22);if(content.formula)box(slide,'formula',content.formula,85,373,790,32,23,BLUE,true);}
  else {box(slide,'body',content.body.join('\n\n'),80,167,800,content.formula?345:370,28);if(content.formula)box(slide,'formula',content.formula,80,520,800,65,30,BLUE,true);}
  if(content.check&&!content.visual)box(slide,'check',content.check,80,582,800,46,23,BLUE,true);
  box(slide,'section',content.advanced?'Fördjupning':'Grunddel',190,674,440,28,17,'#FFFFFF');
  box(slide,'page',String(i+2),870,676,45,30,20,'#FFFFFF');
  slide.speakerNotes.textFrame.setText([content.note||'',content.check?`Kontrollfråga: ${content.check}\nFacit: ${content.answer}`:'',`Webbgenomgång: https://nj22az.github.io/sjoskolan/vecka-40/aktuell/Genomgang.html?del=${lesson.id}&avsnitt=${content.id}`,`Guidad labb: https://nj22az.github.io/sjoskolan/vaxelstromslabbet/?lage=guidad&del=${lesson.id}`,content.id==='likriktat'||content.id==='kurvformer'?'Källa: https://www.fluke.com/en-gb/learn/blog/electrical/true-measurements-of-non-linear-loads-require-a-true-rms-measurement-tool':''].filter(Boolean).join('\n\n'));
 }
 for(const s of original.slice(1))s.delete();cover.moveTo(0);authored.forEach((s,i)=>s.moveTo(i+1));
 const dir=path.join(workspaceDir,'rendered',lesson.id);await fs.mkdir(dir,{recursive:true});
 const candidate=path.join(workspaceDir,'tmp',lesson.id+'-candidate.pptx');await(await PresentationFile.exportPptx(presentation)).save(candidate);
 const finalPath=path.join(workspaceDir,'output-final',lesson.deck);
 const result=await finalizePresentation({workspaceDir,candidatePath:candidate,finalPath,pythonExecutable:process.env.CODEX_PRIMARY_RUNTIME_PYTHON,integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','9144000,6858000','--validate-heading-fit'],fontPolicy:{basis:'reference',families:['Calibri'],referencePath:input,referenceSha256:createHash('sha256').update(await fs.readFile(input)).digest('hex')},materializeLiteralChartWorkbooks:true,verifyArtifactToolImport:true,receiptPath:path.join(workspaceDir,'tmp',lesson.id+'-validation-final.json')});
 console.log('FINAL',lesson.id,presentation.slides.items.length,result.finalPath||finalPath);
 for(const [i,s]of presentation.slides.items.entries()){const img=await s.export({format:'png',scale:1});await fs.writeFile(path.join(dir,String(i+1).padStart(2,'0')+'.png'),new Uint8Array(await img.arrayBuffer()));}
}

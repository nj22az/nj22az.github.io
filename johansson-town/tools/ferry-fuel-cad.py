#!/usr/bin/env python3
"""C1 fuel-only addendum. mm model-space geometry; A3 1:50 PDF views.
External swept envelopes only; no claimed fabrication bends or certified machinery geometry.
"""
from pathlib import Path
import json,csv,math,hashlib
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/minato-maru/fuel-c1'
d=json.loads((OUT/'engineering.json').read_text());S=d['summary'];MM=72/25.4
C=canvas.Canvas(str(OUT/'Minato_Maru_Fuel_C1.pdf'),pagesize=(420*MM,297*MM),pageCompression=1)
C.setTitle('Minato Maru - Fuel piping - C1 design review');C.setAuthor('Generated engineering design review')
INK='#24343c';FUEL='#8a6a3a';RED='#963d34';TEAL='#28666c';GRAY='#a3abad'
reg=[];doc=None
conv=lambda p: [(p[2]+d['ship']['length']/2)*1000,p[0]*1000,(p[1]+d['ship']['draft'])*1000]
def text(x,y,s,h=2.5,col=INK,bold=False):
 C.setFillColor(HexColor(col));C.setFont('Helvetica-Bold' if bold else 'Helvetica',h*MM);C.drawString(x*MM,y*MM,str(s))
def line(a,b,col=INK,width=.25):
 C.setStrokeColor(HexColor(col));C.setLineWidth(width*MM);C.line(a[0]*MM,a[1]*MM,b[0]*MM,b[1]*MM)
def wrap(x,y,s,w,h=2.5):
 words=str(s).split();row=''
 for word in words:
  nxt=(row+' '+word).strip()
  if stringWidth(nxt,'Helvetica',h*MM)>w*MM and row:text(x,y,row,h);y-=h*1.6;row=word
  else:row=nxt
 if row:text(x,y,row,h);y-=h*1.6
 return y

def sheet(no,title,scale='NTS'):
 global doc
 if reg:C.showPage()
 doc=ezdxf.new('R2010');doc.units=4;doc.header['$INSUNITS']=4
 for n,c in [('EQUIPMENT',8),('FUEL',30),('OTHER_SERVICES',8),('ACCESS',3),('TERMINALS',1),('ANNOTATION',7)]:doc.layers.new(n,dxfattribs={'color':c})
 reg.append({'number':no,'title':title,'revision':'C1','scale':scale,'pdfPage':len(reg)+1,'status':S['status']})
 C.setStrokeColor(HexColor(INK));C.setLineWidth(.4*MM);C.rect(10*MM,10*MM,400*MM,277*MM)
 text(18,275,no+' | '+title,4.8,bold=True)
 text(18,267,S['status'],3,RED,bold=True)
 line((18,49),(402,49));text(18,40,'JOHANSSON SHIPYARD | HULL 127 | MINATO MARU',3,bold=True)
 text(18,33,'REV C1 | 2026-10-17 | FUEL-ONLY ADDENDUM | A3 | SCALE '+scale,2.6)
 text(18,26,'DRAWN: generated | CHECK: internal geometric checks | APPROVAL: NONE',2.4)
 text(18,19,'Reference: immutable Revision B (13 October 2026). Proposed interfaces; no supplier or construction approval.',2.3)
 text(360,19,'Sheet '+str(len(reg)),2.4)

def save():
 no=reg[-1]['number'];layout=doc.layouts.get('Layout1');layout.page_setup(size=(420,297),margins=(0,0,0,0),units='mm')
 layout.add_lwpolyline([(10,10),(410,10),(410,287),(10,287)],close=True)
 for y,s in [(40,no+' | REV C1 | '+reg[-1]['title']),(32,S['status']),(24,'APPROVAL: NONE | PDF controls multi-view composition')]:layout.add_text(s,dxfattribs={'height':2.6,'insert':(18,y)})
 # A single physical view per sheet: model space is 1:1 mm, viewport locked at 1:50.
 if reg[-1]['scale']=='1:50':
  view=reg[-1].get('view','plan');center=(12600,0 if view=='plan' else 1800)
  vp=layout.add_viewport(center=(210,155),size=(375,205),view_center_point=center,view_height=10250,status=2);vp.dxf.flags=16384
 (OUT/'dxf').mkdir(exist_ok=True);doc.saveas(OUT/'dxf'/f'{no}.dxf')

def table(headers,rows,widths,y=248,h=6.5,size=2.3):
 x=18;W=sum(widths)
 for j,row in enumerate([headers]+rows):
  line((18,y+2),(18+W,y+2),GRAY,.15);xx=x
  for val,w in zip(row,widths):
   s=str(val)
   while stringWidth(s,'Helvetica',size*MM)>(w-3)*MM and len(s)>3:s=s[:-4]+'...'
   text(xx+1,y-h+2,s,size,bold=j==0);xx+=w
  y-=h
 return y

# Physical source geometry and proposed access constraints. Views show accepted external routes only.
for view in ['plan','profile']:
 sheet('JS127-FUEL-C1-'+('01' if view=='plan' else '02'),'Fuel external routes - '+view,'1:50');reg[-1]['view']=view
 def xy(p):
  q=conv(p);return (q[0],q[1] if view=='plan' else q[2])
 # View origin X=8.3 m at 25 mm; plan Y=-4 m at 75 mm; profile baseline at 90 mm.
 def plot(p):
  X,Y=xy(p);return (25+(X-8300)/50, (155+Y/50) if view=='plan' else (100+Y/50))
 for o in d['obstacles']:
  # End walls/floor are constraint geometry; keep visible envelopes near the fuel equipment only.
  if max(o['a'][1],o['b'][1])<-.99 or min(o['a'][2],o['b'][2])>-.4 or max(o['a'][2],o['b'][2])<-8.6:continue
  p=plot(o['a']);q=plot(o['b']);layer='ACCESS' if o['name'].startswith('reserved') else 'EQUIPMENT'
  col='#ccd8d4' if layer=='ACCESS' else '#aeb8ba'
  points=[(p[0],p[1]),(q[0],p[1]),(q[0],q[1]),(p[0],q[1]),p]
  for a,b in zip(points,points[1:]):line(a,b,col,.15)
  a,b=xy(o['a']),xy(o['b']);doc.modelspace().add_lwpolyline([a,(b[0],a[1]),b,(a[0],b[1])],close=True,dxfattribs={'layer':layer})
 for routes,layer,col,width in [(d['otherRoutes'],'OTHER_SERVICES','#bec4c5',.12),(d['routes'],'FUEL',FUEL,.4)]:
  for r in routes:
   pts=r['points']
   for a,b in zip(pts,pts[1:]):line(plot(a),plot(b),col,width)
   doc.modelspace().add_lwpolyline([xy(p) for p in pts],dxfattribs={'layer':layer})
 for i,t in enumerate(d['interfaces']['ports'].values(),1):
  a=plot(t['pos']);C.setFillColor(HexColor(RED));C.circle(a[0]*MM,a[1]*MM,.65*MM,fill=1,stroke=0)
  doc.modelspace().add_circle(xy(t['pos']),25,dxfattribs={'layer':'TERMINALS'})
 text(281,249,'ROUTE KEY',3,TEAL,True)
 y=242
 for r in d['schedule']:
  label=f"{int(r['lineId'].split('#')[1])+1:02}  {r['from']} > {r['to']}  DN{r['DN_mm']}"
  text(281,y,label,2.35,FUEL if r['currentStatus']=='geometry-clear' else RED);y-=5.5
 text(25,68,'5 m calibration bar: 100 mm at 1:50',2.4);line((25,63),(125,63),INK,.7)
 wrap(281,108,'Brown: revised fuel routes. Grey: accepted source services. Pale green: proposed access reservations. Red dots: proposed ports; see terminal schedule.',117,2.4)
 wrap(281,80,'Sharp corners show clearance envelopes only. Bend/flange/support design remains open. Tank partitions and internal manifold assemblies are not fabricated geometry.',117,2.35)
 save()

ports=list(d['interfaces']['ports'].values())
for start in range(0,len(ports),24):
 sheet('JS127-FUEL-C1-'+str(3+start//24).zfill(2),'Proposed terminal schedule '+str(start//24+1))
 rows=[]
 for t in ports[start:start+24]:
  p=conv(t['pos']);rows.append([t['id'].replace('fuel/',''),*[f'{n:.0f}' for n in p],t['dir'],t.get('owner') or 'proposed assembly/reservation'])
 table(['Port / source node','X mm','Y mm','Z mm','Outward','Owner / basis'],rows,[100,33,30,30,30,160],h=6.7,size=2.3)
 wrap(18,76,'All coordinates are proposed interfaces. Tank Z=680 mm is the shared reservation roof, not a verified tank roof. Pump/purifier branches require selected-maker manifolds. Bunker station has a common inlet/tee with two isolated outlets; internal assembly is a design hold.',382,2.5)
 save()

sheet('JS127-FUEL-C1-05','Connection disposition and sizing basis')
rows=[[r['lineId'].split('/')[1],r['previousReason'] or 'geometry-clear',r['currentStatus'],r['length_m'],r['minPipeSurfaceGap_mm']] for r in d['schedule']]
table(['Connection','Rev B issue','C1 external geometry','Length m','Pipe gap mm'],rows,[111,91,85,45,51],h=6.7,size=2.35)
wrap(18,80,'DN retained. At nominal ID=25 mm only: 2 m3/h implies 1.1318 m/s; 0.25 m3/h implies 0.1415 m/s. These arithmetic screens are not a pipe class or hydraulic sizing approval. Bunker/return/overflow/sludge design flows and actual IDs are unavailable.',382,2.5)
save()

sheet('JS127-FUEL-C1-06','Scope, open holds and revision control')
y=248
for i,hold in enumerate(S['holds'],1):y=wrap(18,y,str(i)+'. '+hold,382,2.8)-5
counts=S['counts'];y-=3
for s in [f"Fuel external routes: {counts['fuelGeometryClear']} geometry-clear, {counts['fuelUnresolved']} open; {counts['geometricIssuesResolved']} prior geometric issues resolved.",f"Whole vessel register: {counts['allGeometryClear']} geometry-clear, {counts['allUnresolved']} unresolved positive-bore connections.",'Original Revision B bytes are unchanged. C1 supersedes fuel routing/interfaces only; all other Revision B holds remain.','Validation is internal, against a fictional source model. No flag, class, surveyor or professional engineering certification is claimed.']:
 y=wrap(18,y,s,382,2.8)-4
save();C.save();(OUT/'drawing_register.json').write_text(json.dumps(reg,indent=2)+'\n')

# Physical swept envelope meshes in CAD coordinates (mm), not zero-width centre-lines.
verts=[];faces=[];obj=['# C1 proposed clearance envelopes; units mm; CONSTRUCTION NOT APPROVED','mtllib Minato_Maru_Fuel_C1.mtl'];offset=0
model=ezdxf.new('R2010');model.units=4;model.layers.new('FUEL');model.layers.new('EQUIPMENT');msp=model.modelspace()
def mesh(name,vv,ff,material,layer):
 global offset
 obj.extend(['o '+name.replace(' ','_'),'usemtl '+material]);obj.extend('v '+' '.join(f'{v:.3f}' for v in p) for p in vv)
 for f in ff:
  obj.append('f '+' '.join(str(offset+i+1) for i in f))
  v=[vv[i] for i in f];msp.add_3dface(v if len(v)==4 else [*v,v[-1]],dxfattribs={'layer':layer})
 offset+=len(vv)
for i,o in enumerate(d['obstacles']):
 lo=conv(o['a']);hi=conv(o['b']);a=[min(v,w) for v,w in zip(lo,hi)];b=[max(v,w) for v,w in zip(lo,hi)]
 vv=[[x,y,z] for z in [a[2],b[2]] for y in [a[1],b[1]] for x in [a[0],b[0]]]
 mesh('E'+str(i)+'_'+o['name'],vv,[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]],'equipment','EQUIPMENT')
for route in d['routes']:
 for j,(p,q) in enumerate(zip(route['points'],route['points'][1:])):
  a=conv(p);b=conv(q);axis=next(k for k in range(3) if abs(a[k]-b[k])>.0001);axes=[k for k in range(3) if k!=axis];r=next(s['reservedRadius_mm'] for s in d['schedule'] if s['lineId']==route['lineId'])
  vv=[]
  for c in [a,b]:
   for n in range(16):
    t=c.copy();t[axes[0]]+=r*math.cos(n*math.pi/8);t[axes[1]]+=r*math.sin(n*math.pi/8);vv.append(t)
  ff=[[n,(n+1)%16,(n+1)%16+16,n+16] for n in range(16)]
  mesh(route['lineId'].replace('/','_')+'_'+str(j),vv,ff,'fuel','FUEL')
(OUT/'models').mkdir(exist_ok=True)
(OUT/'models/Minato_Maru_Fuel_C1.obj').write_text('\n'.join(obj)+'\n');(OUT/'models/Minato_Maru_Fuel_C1.mtl').write_text('newmtl fuel\nKd 0.54 0.42 0.23\nnewmtl equipment\nKd 0.55 0.62 0.63\nd 0.25\n')
model.saveas(OUT/'models/Minato_Maru_Fuel_C1_3D.dxf')
print(len(reg),'sheets;',len(d['routes']),'swept external routes')

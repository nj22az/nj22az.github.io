#!/usr/bin/env python3
"""Independent numeric/export inspection using Python; no class or certification claim."""
from pathlib import Path
import json,math,hashlib
import ezdxf
from pypdf import PdfReader
from PIL import Image
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection,Line3DCollection
root=Path(__file__).resolve().parents[1];out=root/'docs/minato-maru/fuel-c1'
d=json.loads((out/'engineering.json').read_text());routes=d['routes'];other=d['otherRoutes'];ports=d['interfaces']['ports']
radius=lambda dn:max(.012,dn*.0006+.004)
def segments(r):return list(zip(r['points'],r['points'][1:]))
def distance(a,b,c,e):return math.sqrt(sum(max(min(a[k],b[k])-max(c[k],e[k]),min(c[k],e[k])-max(a[k],b[k]),0)**2 for k in range(3)))
minimum=math.inf
for route_index,r in enumerate(routes):
 a,b=r['terminals'];assert r['points'][0]==a['pos'] and r['points'][-1]==b['pos']
 assert a['node']==r['from'] and b['node']==r['to']
 for i in range(1,len(r['points'])-1):
  p,q,v=r['points'][i-1:i+2];assert sum((q[k]-p[k])*(v[k]-q[k]) for k in range(3))>=-1e-9
 for i,(p,q) in enumerate(segments(r)):
  for v,w in segments(r)[i+2:]:assert distance(p,q,v,w)>1e-7
 for j,(p,q) in enumerate(segments(r)):
  assert sum(abs(p[k]-q[k])>1e-7 for k in range(3))==1
  for s in other+routes[:route_index]:
   for u,v in segments(s):
    gap=distance(p,q,u,v)-radius(r['dn'])-radius(s['dn']);assert gap>=.01-1e-7,(r['lineId'],s['lineId'],gap);minimum=min(minimum,gap)
  for o in d['obstacles']:
   terminals=([a] if j==0 else [])+([b] if j==len(r['points'])-2 else [])
   if any(t.get('owner')==o['name'] or o['name'] in t.get('penetrates',[]) for t in terminals):continue
   lo=[min(v,w)-radius(r['dn']) for v,w in zip(o['a'],o['b'])];hi=[max(v,w)+radius(r['dn']) for v,w in zip(o['a'],o['b'])]
   overlap=all(max(p[k],q[k])>lo[k]+1e-9 and min(p[k],q[k])<hi[k]-1e-9 for k in range(3))
   assert not overlap,(r['lineId'],o['name'],j)
for p in (out/'dxf').glob('*.dxf'):
 doc=ezdxf.readfile(p);assert doc.units==4;assert len(doc.audit().errors)==0
 if '-01' in p.stem or '-02' in p.stem:
  vps=[v for v in doc.layouts.get('Layout1').query('VIEWPORT') if v.dxf.status>=2];assert len(vps)==1;assert vps[0].dxf.flags&16384;assert abs(vps[0].dxf.view_height/205-50)<1e-8
model=ezdxf.readfile(out/'models/Minato_Maru_Fuel_C1_3D.dxf');assert model.units==4;assert not model.audit().errors
pdf=PdfReader(out/'Minato_Maru_Fuel_C1.pdf');assert len(pdf.pages)==6
for p in pdf.pages:
 assert abs(float(p.mediabox.width)*25.4/72-420)<.01;assert abs(float(p.mediabox.height)*25.4/72-297)<.01
 assert 'CONSTRUCTION NOT APPROVED' in p.extract_text()
for name,h in json.loads((out/'revb-reference-hashes.json').read_text()).items():assert hashlib.sha256((out.parent/'cad-revb'/name).read_bytes()).hexdigest()==h
# Inspect only the machinery/fuel volume, using exact exported routes and same-source boxes.
fig=plt.figure(figsize=(15,10),facecolor='white');ax=fig.add_subplot(111,projection='3d')
for o in d['obstacles']:
 if o['name'].startswith('reserved') or 'bulkhead' in o['name'] or 'boundary' in o['name']:continue
 a=o['a'];b=o['b'];p=[[x,z+17.25,y+1.9] for y in [a[1],b[1]] for z in [a[2],b[2]] for x in [a[0],b[0]]]
 if min(a[1],b[1])>.9:continue
 ff=[[p[k] for k in face] for face in [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]]
 ax.add_collection3d(Poly3DCollection(ff,facecolors='#97a7a9',edgecolors='#7a8b8e',linewidths=.3,alpha=.12))
for collection,color,width in [(other,'#b4c0c2',.7),(routes,'#8a5726',2.5)]:
 lines=[[[p[0],p[2]+17.25,p[1]+1.9],[q[0],q[2]+17.25,q[1]+1.9]] for r in collection for p,q in segments(r)]
 ax.add_collection3d(Line3DCollection(lines,colors=color,linewidths=width,alpha=.9))
ax.set(xlim=(-4.05,4.05),ylim=(8.5,16.5),zlim=(.6,3.6),xlabel='Port + / starboard - (m)',ylabel='Forward of transom (m)',zlabel='Above baseline (m)')
ax.set_box_aspect((8.1,8,3));ax.view_init(elev=32,azim=-48)
fig.suptitle('Minato Maru | C1 external fuel geometry\nProposed interfaces and clearance envelopes - CONSTRUCTION NOT APPROVED',fontsize=16)
fig.text(.5,.035,'Brown: revised fuel. Grey: retained accepted services. Equipment boxes: source envelopes. Internal assemblies, fittings and final tank design remain open.',ha='center',fontsize=10)
fig.savefig(out/'geometry-review.png',dpi=130,bbox_inches='tight');plt.close(fig)
result={'status':'internal independent-language checks only; construction not approved','fuelRoutes':len(routes),'minimumOtherPipeSurfaceGap_mm':minimum*1000,'DXFSheets':len(list((out/'dxf').glob('*.dxf'))),'PDFPages':len(pdf.pages),'PDFPaper_mm':[420,297],'lockedPhysicalViewScale':'1:50','sourceReferencePreserved':True,'checks':['Python endpoint/topology/orthogonality','radius-expanded equipment and access AABBs','all fuel vs fuel and retained-service swept-radius separations','DXF parser/auditor, units and locked view scales','PDF paper sizes and approval labels','all Revision B reference hashes']}
(out/'export-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

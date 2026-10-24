from pathlib import Path
import json,math,textwrap
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3,landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
P=Path(__file__).resolve().parent;D=json.loads((P/'schedule.json').read_text())
for n,f in [('R','DejaVuSans.ttf'),('B','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(n,'/usr/share/fonts/truetype/dejavu/'+f))
def overlap(a,b):return a[0]<b[0]+b[2] and a[0]+a[2]>b[0] and a[1]<b[1]+b[3] and a[1]+a[3]>b[1]
reach={}
for i,p in enumerate(D['props']):
 x,d,w,l=p['box'];assert 11300<=x<x+w<=12100 and 1400<=d<d+l<=6200;assert p['bottom']==D['top']
 for q in D['props'][i+1:]+D['retained']:assert not overlap(p['box'],q['box']),(p['id'],q['id'])
 tx,td,ty=p['target'];reach[p['id']]=round(math.hypot(D['shoulderX']-tx,D['shoulderHeight']-ty),3);assert reach[p['id']]<=D['staticReach']
pen=D['props'][1];pts=pen['tether'];assert all(12020<=x<=12080 and 3820<=d<=3950 and 780<=y<=920 for x,d,y in pts)
assert math.dist(pen['penEnds'][0],pen['penEnds'][1])<141
W,H=landscape(A3);c=canvas.Canvas(str(P/'Sakura-Counter-Operations-CAD.pdf'),pagesize=(W,H));doc=ezdxf.new('R2010');ms=doc.modelspace()
c.setFillColorRGB(.97,.96,.92);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColorRGB(.13,.27,.21);c.setFont('B',23);c.drawString(35,H-42,'Sakura / the working counter');c.setFont('R',11);c.drawString(35,H-64,'JW-SAK-OPS-01 / REV B / 24 OCT 2026 / MILLIMETRES / corrected before construction')
o=(50,160);sc=.225
# Cropped plan, dimensions use full original coordinates.
def rect(r,col,label):
 x,d,w,l=r;xx=o[0]+(x-11300)*sc;yy=o[1]+(d-3500)*sc;c.setFillColorRGB(*col);c.rect(xx,yy,w*sc,l*sc,fill=1,stroke=1);c.setFillColorRGB(.13,.27,.21);c.setFont('R',8);c.drawString(xx+3,yy+l*sc/2,label)
rect([11300,3500,800,1900],(.88,.84,.73),'COUNTER');rect([12100,3500,1200,1900],(.88,.92,.86),'1200 STAFF AISLE')
for p in D['retained']:
 x,d,w,l=p['box']
 if x<12100 and d>=3500 and d+l<=5400:rect(p['box'],(.73,.77,.73),p['id'])
colors=[(.61,.78,.76),(.55,.67,.74),(.82,.71,.6),(.9,.78,.4)]
for i,p in enumerate(D['props']):
 rect(p['box'],colors[i],str(i+1));x,d,w,l=p['box'];ms.add_lwpolyline([(x,d),(x+w,d),(x+w,d+l),(x,d+l)],close=True,dxfattribs={'layer':p['id']});ms.add_text(p['id'],dxfattribs={'height':18,'insert':(x,d+l+12)});ms.add_linear_dim(base=(x,d-30),p1=(x,d),p2=(x+w,d),angle=0).render()
# Preserve measured context in the editable CAD, including retained source envelopes.
for name,r in [('COUNTER',D['counter']),('STAFF_AISLE',D['staffAisle'])]+[(p['id'],p['box']) for p in D['retained']]:
 x,d,w,l=r;ms.add_lwpolyline([(x,d),(x+w,d),(x+w,d+l),(x,d+l)],close=True,dxfattribs={'layer':name});ms.add_text(name,dxfattribs={'height':18,'insert':(x,d+10)})
for p in D['props']:
 x,d,w,l=p['box'];ms.add_linear_dim(base=(x-35,d),p1=(x,d),p2=(x,d+l),angle=90).render()
 ms.add_linear_dim(base=(x+15000+w+40,780),p1=(x+15000+w,780),p2=(x+15000+w,780+p['height']),angle=90).render()
c.setStrokeColorRGB(.17,.28,.25);path=c.beginPath()
for i,(x,d,y) in enumerate(pts):(path.moveTo if i==0 else path.lineTo)(o[0]+(x-11300)*sc,o[1]+(d-3500)*sc)
c.drawPath(path);ms.add_polyline3d(pts,dxfattribs={'layer':'PEN_TETHER'})
c.setFont('R',9);c.drawString(50,135,'PLAN CROP / D3500-5400 / counter X11300-12100 / top +780');c.drawString(50,117,'Protected scanner cord and retained ticket / oden / gum remain clear.')
x0=560;y0=H-110
for i,p in enumerate(D['props']):
 y=y0-i*116;x,d,w,l=p['box'];c.setFont('B',13);c.drawString(x0,y,f'{i+1}. '+p['id'].upper());c.setFont('R',10)
 for j,t in enumerate([f'X{x}  D{d} / {w} x {l} x {p["height"]} / base +780',f'Static staff pickup reach {reach[p["id"]]:.0f} / {D["staticReach"]:.0f} available',textwrap.wrap(p['purpose'],58)[0]]):c.drawString(x0,y-20-j*17,t)
 # Each elevation has an explicit width/height, not an implied scalable diagram.
 ex=x0+450;ey=y-69;s=.25;c.setFillColorRGB(*colors[i]);c.rect(ex,ey,w*s,p['height']*s,fill=1,stroke=1);
 if i==0:
  c.setStrokeColorRGB(.13,.27,.21)
  for k in range(3):c.line(ex,ey+(4+k*35)*s,ex+w*s,ey+(4+k*35)*s)
 if i==2:
  c.setFillColorRGB(.97,.96,.92);c.rect(ex+12*s,ey+36*s,110*s,70*s,fill=1);c.setFillColorRGB(.13,.27,.21);c.setFont('R',5);c.drawString(ex+16*s,ey+65*s,'CATS')
 if i==3:
  c.setStrokeColorRGB(.13,.27,.21)
  for k in range(8):c.line(ex+16*s,ey+(8+k*9)*s,ex+61*s,ey+(8+k*9)*s)
 c.setFillColorRGB(.13,.27,.21);c.setFont('R',8);c.drawString(ex,ey-13,f'{w} x {p["height"]}')
 ms.add_lwpolyline([(x+15000,780),(x+15000+w,780),(x+15000+w,780+p['height']),(x+15000,780+p['height'])],close=True,dxfattribs={'layer':p['id']+'_ELEVATION'})
c.setFont('B',12);c.drawString(560,220,'AUDIT / REV A FINDINGS CORRECTED');c.setFont('R',10)
lines=['Original charity / mustard positions failed staff replenishment reach.', 'Move to staff edge; no customer self-service or live donation interaction.', 'Rack moved90 east; pen moved clear of rack and original scanner cord.', 'All four bases meet +780. No floor, collider, aisle, stock or save changes.', 'Static shoulder approach X12350, height948.41; no live grasp acceptance.', 'Original product detail, packaging, prices and register retained.', 'Virtual scene coordination only; not a certified industrial installation.']
for i,t in enumerate(lines):c.drawString(560,198-i*18,t)
c.setFont('R',9);c.drawString(35,25,'Plan + local elevations / editable DXF / written dimensions govern / roof chain and frontage are separate work');c.save();doc.saveas(P/'Sakura-Counter-Operations.dxf');assert not ezdxf.readfile(P/'Sakura-Counter-Operations.dxf').audit().errors
(P/'audit.json').write_text(json.dumps({'drawing':D['drawing'],'revision':D['revision'],'counterOverlaps':0,'retainedOverlaps':0,'staffAisle':1200,'staticReachMm':reach,'availableReachMm':D['staticReach'],'supportLevel':780,'dxfErrors':0,'correctedFindings':D['corrections'],'limits':D['limits']},indent=2)+'\n');print(json.dumps(reach))

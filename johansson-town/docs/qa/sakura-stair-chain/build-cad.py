"""Separate scenery barrier proposal. Does not construct or change navigation."""
from pathlib import Path
import json, math
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
P=Path(__file__).resolve().parent
source=json.loads((P.parent/'sakura-atmosphere/next-pass-coordinate-proposals.json').read_text())['stair_chain_proposal']
roof=json.loads((P.parent/'sakura-posters-roof/design.json').read_text())
s=roof['stair']; b=source; landing=s['groundLanding']; radius=b['base_diameter']/2
# Rail bore is 956 within the nominal 1000 tread. Include the full base radius.
clear=[s['flights'][0][1]+22,s['flights'][0][1]+1000-22]
for x,d in b['post_centres']:
 assert landing[0]<=x-radius and x+radius<=landing[0]+landing[2]
 assert clear[0]<=d-radius and d+radius<=clear[1]
assert b['post_centres'][0][0]+radius<s['flights'][0][0]
assert clear==[12092,13048]
# Absolute elevation: +40 apron plus 780 attachment, sag110 -> +710 centreline.
end=b['ground']+b['chain']['end_height']; low=end-b['chain']['sag']; plate_low=b['plate']['bottom']
assert 0<plate_low<plate_low+b['plate']['height']<low
# Safety detail is still unbuilt: support anchorage, release and egress not accepted.
D={'drawing':'JW-SAK-CHAIN-01','revision':'A','date':'2026-10-24','units':'mm','status':'CAD proposal only; unbuilt',
 'basis':'6f1570f91347976f04f199546301dc73e42869c9','groundLanding':landing,'clearDepth':clear,
 'barrier':b,'absoluteChainEnd':end,'absoluteChainLow':low,'firstTreadX':s['flights'][0][0],
 'audit':{'baseDepthBounds':[12092,13048],'firstTreadGap':10,'outerPassageUnchanged':855,'dxfErrors':0},
 'limits':['Not a certified stair or emergency-exit design.','Release hardware, sign hangers, anchorage and actual worker sightlines require detail before construction.','No traversal, collider, prompt or escape-gameplay change.','No claim that the existing +40 apron and stair start at0 form a compliant physical threshold.']}
(P/'schedule.json').write_text(json.dumps(D,indent=2)+'\n')
for name,file in [('R','DejaVuSans.ttf'),('B','DejaVuSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
W,H=landscape(A3);c=canvas.Canvas(str(P/'Sakura-Stair-Chain-CAD.pdf'),pagesize=(W,H));doc=ezdxf.new('R2010');m=doc.modelspace()
c.setFillColorRGB(.97,.96,.92);c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColorRGB(.13,.27,.21);c.setFont('B',22);c.drawString(35,H-42,'Sakura / staff stair barrier');c.setFont('R',11);c.drawString(35,H-65,'JW-SAK-CHAIN-01 / REV A / MILLIMETRES / CAD PROPOSAL ONLY - UNBUILT')
def text(x,y,t,bold=False,size=11):c.setFillColorRGB(.13,.27,.21);c.setFont('B' if bold else 'R',size);c.drawString(x,y,t)
# Plan and front elevation share a .35 drawing scale.
k=.35;ox=55;oy=260
rect=lambda x,d: (ox+(x-4500)*k,oy+(d-12070)*k)
c.setStrokeColorRGB(.2,.35,.28);c.setFillColorRGB(.86,.90,.84)
x,y=rect(4500,12070);c.rect(x,y,1000*k,1000*k,fill=1)
text(55,oy+380,'PLAN / existing 1000 x 1000 ground landing',True)
for x,d in b['post_centres']:
 xx,yy=rect(x,d);c.setFillColorRGB(.68,.72,.66);c.circle(xx,yy,radius*k,fill=1);c.setFillColorRGB(.22,.38,.31);c.circle(xx,yy,30*k,fill=1)
 m.add_circle((x,d),radius,dxfattribs={'layer':'BASES'});m.add_circle((x,d),30,dxfattribs={'layer':'POSTS'})
x,y=rect(5500,12070);c.line(x,y,x,y+1000*k);text(x+12,y+120,'First tread X5500')
x1,y1=rect(*b['post_centres'][0]);x2,y2=rect(*b['post_centres'][1]);c.line(x1,y1,x2,y2)
text(55,oy-25,'Post X5350; centres D12232 / D12908; span676')
text(55,oy-44,'Bases diameter280 / posts diameter60 / inset140 from clear edges')
text(55,oy-63,'Base edge X5490 -> first tread X5500:10 clearance')
# Elevation looking east along X. Grade datum and vertical dimensions explicit.
ex=580;ey=315
text(ex,oy+380,'ELEVATION / looking east',True)
c.line(ex-20,ey,ex+360,ey);text(ex+365,ey-4,'+40 grade')
for d in [12232,12908]:
 xx=ex+(d-12200)*k;c.setFillColorRGB(.46,.56,.49);c.rect(xx-30*k,ey,60*k,850*k,fill=1)
 m.add_lwpolyline([(d-30,40),(d+30,40),(d+30,890),(d-30,890)],close=True,dxfattribs={'layer':'ELEVATION'})
points=[]
for i in range(41):
 t=i/40;d=12232+676*t;h=end-4*110*t*(1-t);points.append((5350,d,h))
 if i:c.line(ex+(points[i-1][1]-12200)*k,ey+(points[i-1][2]-40)*k,ex+(d-12200)*k,ey+(h-40)*k)
m.add_polyline3d(points,dxfattribs={'layer':'CHAIN_CENTRELINE'})
xx=ex+(12570-12200)*k;c.setFillColorRGB(.86,.80,.61);c.rect(xx-150*k,ey+(450-40)*k,300*k,200*k,fill=1);text(xx-41,ey+(550-40)*k,'STAFF ONLY',True,10)
text(ex,285,'Top +890 / chain ends +820 / low +710 / plate +450-650')
text(ex,265,'Chain diameter12 / sag110; sign300 x200 x4')
text(55,135,'SELF-AUDIT',True,13)
for i,line in enumerate(['Bases remain inside D12092-13048; protected855 outer passage retained.',
 'Both bases fit the ground landing; each base stops10 before the first tread.',
 'The barrier is a scenery proposal, not a usable escape route or a compliance statement.',
 'Before construction: draw release, sign hangers and anchors; verify worker sightlines and grade interface.']):text(55,114-i*19,line)
text(35,25,'Existing non-traversable stair remains unchanged. Written coordinates govern; editable DXF included.',size=9)
c.save();doc.saveas(P/'Sakura-Stair-Chain.dxf');assert not ezdxf.readfile(P/'Sakura-Stair-Chain.dxf').audit().errors
print(json.dumps(D['audit']))

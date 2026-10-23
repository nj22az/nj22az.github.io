from pathlib import Path
import json,ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3,landscape
p=Path(__file__).resolve().parent
spec=json.loads((p.parents[2]/'src/world/interiors/sakura-counter-density.json').read_text())
doc=ezdxf.new('R2010');doc.units=4;m=doc.modelspace()
for name,col in [('FIXTURE',7),('PACKS',3),('DIMENSIONS',4),('PROPOSAL',2)]:doc.layers.new(name,dxfattribs={'color':col})
def rect(x,y,w,h,layer='FIXTURE'):
 m.add_lwpolyline([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],close=True,dxfattribs={'layer':layer})
def txt(s,x,y,h=45):m.add_text(s,dxfattribs={'height':h,'insert':(x,y),'layer':'DIMENSIONS'})
c=spec['cabinet'];rect(0,0,c['length'],c['height'])
for x in [20,c['length']-40]:rect(x,-c['supportHeight'],20,c['supportHeight'])
for r in range(c['rows']):
 for k in range(c['columns']):rect(35+k*103,55+r*c['rowPitch'],70,c['packHeight'],'PACKS')
txt('EAST ELEVATION - TOBACCO CABINET 1300 x 550 x 600',0,1900)
txt('48 numbered front packs / 4 rows x 12 slots',0,1800,35)
rect(0,1450,1300,180);txt('EXISTING TOBACCO HEADER - HEIGHT 2300 TO 2480',0,1680,32)
e=spec['endcap'];rect(1900,0,e['width'],e['height'],'PROPOSAL')
for h in e['decks']:rect(1900,h-20,900,20,'PROPOSAL')
txt('FRONT ENDCAP - 900 W x 450 D x 1350 H',1900,1530)
txt('CAD ONLY - stock at original product scale',1900,1450,35)
rect(3200,0,4800,780);txt('SERVICE COUNTER - 4800 LONG / 780 TOP',3200,1250)
for id in ['oden','impulse','ticketStand']:
 o=spec[id];rect(3200+o['depth']-1400,o['bottom'],o['length'],o['height']);txt(id,3200+o['depth']-1400,1080,32)
doc.saveas(p/'Sakura-Counter-Endcap-CAD.dxf');assert not ezdxf.readfile(p/'Sakura-Counter-Endcap-CAD.dxf').audit().errors
# Vector, dimensioned review sheets: same data as the editable CAD.
out=p/'Sakura-Counter-Endcap-CAD.pdf';cv=canvas.Canvas(str(out),pagesize=landscape(A3));W,H=landscape(A3)
def head(title,sub):
 cv.setFillColorRGB(.10,.25,.20);cv.setFont('Helvetica-Bold',22);cv.drawString(38,H-45,title)
 cv.setFont('Helvetica',11);cv.drawString(38,H-66,sub)
def box(x,y,w,h,color=(.9,.89,.84)):
 cv.setFillColorRGB(*color);cv.setStrokeColorRGB(.2,.3,.27);cv.setLineWidth(.6);cv.rect(x,y,w,h,fill=1,stroke=1)
def text(s,x,y,size=10):cv.setFillColorRGB(.15,.23,.2);cv.setFont('Helvetica',size);cv.drawString(x,y,s)
head('Sakura Shoten | Counter elevation','JW-SAK-CTR-01 Rev B / millimetres / measured candidate / 23 October 2026')
s=.30;ox=110;oy=155
box(ox,oy,1300*s,c['height']*s)
for x in [20,c['length']-40]:box(ox+x*s,oy-c['supportHeight']*s,20*s,c['supportHeight']*s,(.64,.68,.65))
colors=[(.83,.37,.25),(.25,.45,.42),(.92,.85,.66),(.36,.48,.64),(.67,.36,.33),(.95,.93,.85)]
for r in range(4):
 for k in range(12):
  x=ox+(35+k*103)*s;y=oy+(55+r*c['rowPitch'])*s;box(x,y,70*s,c['packHeight']*s,colors[k%6]);text(str(r*12+k+1),x,y-5,5)
text('1300',ox+170,oy-30);text('550 high / 600 deep',ox+410,oy+100)
box(ox,oy+1450*s,1300*s,180*s,(.2,.38,.31));text('Existing tobacco header retained',ox,oy+1690*s)
text('Cabinet 850-1400 / 70 mm support feet to worktop at 780',ox,oy-55)
text('12 slots x 4 rows = 48 visible packs. Reach-corrected dispenser; staff aisle stays 1200 clear.',ox,oy-80)
text('Original wall notices and office glazing remain clear. Fictional packs: scenery only.',ox,oy-100)
# Counter plan, shown separately to preserve readable scale.
ox=680;oy=190;s=.095
box(ox,oy,800*s,4800*s,(.93,.88,.77))
for key,col in [('oden',(.65,.7,.68)),('impulse',(.76,.4,.28)),('ticketStand',(.3,.5,.42))]:
 o=spec[key];x=ox+(o['x']-11300)*s;y=oy+(o['depth']-1400)*s;box(x,y,o['width']*s,o['length']*s,col);text(key,x+105,y+6)
text('Counter plan: 800 x 4800',665,170);text('All additions on existing top at 780',665,150)
text('Retain register, scanner, tray, steamer and food.',665,130)
cv.showPage();head('Sakura Shoten | Endcap proposal','CAD first / existing shelf footprint / stocking is a separate pass')
s=.35;ox=130;oy=170
box(ox,oy,900*s,1350*s)
for h in e['decks']:box(ox,oy+(h-20)*s,900*s,20*s,(.64,.68,.65));text(str(h)+' deck top',ox+335,oy+h*s)
text('900 wide',ox+110,oy-30);text('450 deep / 1350 high',ox+335,oy+450)
text('Keep the existing 2300 mm front cross-aisle.',650,540,13)
text('Proposal: original cup-noodle cartons on three decks.',650,505,13)
text('Keep product scale, packaging and stock identities.',650,470,13)
text('Use small shelf-edge POP; no aisle projections.',650,435,13)
text('No stocked endcap is claimed in this implementation.',650,385,12)
text('Drawing coordinates: SW interior origin; exterior shell unchanged.',38,40)
cv.save();(p/'validation.json').write_text(json.dumps({'cabinet_fronts':48,'dxf_errors':0,'counter_top_mm':780,'staff_aisle_mm':1200,'endcap_status':'proposal only'},indent=2)+'\n');print(out)

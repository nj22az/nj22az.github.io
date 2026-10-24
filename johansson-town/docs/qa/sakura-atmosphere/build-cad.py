from pathlib import Path
import json,math
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('SakuraRegular','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SakuraBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
from reportlab.lib.pagesizes import A3,landscape
import ezdxf
P=Path(__file__).resolve().parent;D=json.loads((P/'schedule.json').read_text());R=D['roof'];C=D['counter'];K=D['crates']
def overlap(a,b):return a[0]<b[0]+b[2] and a[0]+a[2]>b[0] and a[1]<b[1]+b[3] and a[1]+a[3]>b[1]
for prop in [C['chopsticks'],C['supplies']]:
 x,d,w,l=prop['box'];assert 13300<=x<x+w<=13900 and 1400<=d<d+l<=6200
 for old in C['retained']:assert not overlap(prop['box'],old['box']),(prop,old)
assert not overlap(C['chopsticks']['box'],C['supplies']['box'])
for pad in R['pads']:
 x,d,w,l=pad;assert 0<=x<x+w<=13900 and 0<=d<d+l<=10640
 for obs in [[10100,7700,1600,1600],[5000,8200,2000,1000],[9200,8150,1100,700],[1650,9750,100,100]]:assert not overlap(pad,obs),(pad,obs)
x,d,w,l=K['box'];assert 5500<x<x+w<8100 and 12070<d<d+l<13070
underside=(math.floor((x-5500)/260)+1)*4010/22-45;crateTop=K['bottom']+K['count']*K['height'];assert underside>crateTop+300
assert C['odenTag']['depth']+C['odenTag']['width']/2<4800
stock=json.loads((P/'stock-audit.json').read_text());assert stock['overlaps']==0 and len(stock['rotatedSlots'])==3
out=P/'Sakura-Atmosphere-CAD.pdf';W,H=landscape(A3);c=canvas.Canvas(str(out),pagesize=(W,H));doc=ezdxf.new('R2010');ms=doc.modelspace()
def title(n,t):
 c.setFillColorRGB(.97,.96,.92);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColorRGB(.15,.28,.22);c.setFont('SakuraBold',22);c.drawString(35,H-42,t);c.setFont('SakuraRegular',10);c.drawString(35,H-63,'JW-SAK-ATM-01 / REV B / 24 OCT 2026 / CAD mm / fixed exterior and working routes retained');c.drawString(35,22,str(n)+' / 2 - GAME ENVIRONMENT COORDINATION')
def rect(box,origin,scale,color,label,off=0):
 x,d,w,l=box;ox,oy=origin;c.setFillColorRGB(*color);c.rect(ox+x*scale,oy+d*scale,w*scale,l*scale,fill=1,stroke=1);c.setFillColorRGB(.15,.28,.22);c.setFont('SakuraRegular',8);c.drawString(ox+x*scale+2,oy+(d+l/2)*scale,label);ms.add_lwpolyline([(x+off,d),(x+w+off,d),(x+w+off,d+l),(x+off,d+l)],close=True,dxfattribs={'layer':label.replace(' ','_')})
def notes(lines,x,y):
 for i,t in enumerate(lines):c.setFont('SakuraRegular',11);c.drawString(x,y-i*21,t)
title(1,'Roof service finishes / return crates / contact shadows');o=(40,80);sc=.041
rect([-180,-180,14260,11000],o,sc,(.85,.85,.77),'SHELL')
for a in R['trim']:rect(a,o,sc,(.48,.57,.52),'DRAIN EDGE')
for a in R['pads']:rect(a,o,sc,(.62,.67,.63),'SERVICE PADS')
rect([10100,7700,1600,1600],o,sc,(.7,.8,.84),'TANK')
for a in [[5500,12070,2600,1000],[5500,10820,2600,1000],[8100,10820,1000,2250],[4500,10640,1000,1180]]:rect(a,o,sc,(.72,.76,.7),'EXISTING STAIR')
rect(K['box'],o,sc,(.82,.66,.25),'3 EMPTY CRATES')
notes(['AUDIT BEFORE CONSTRUCTION','Service pads:20 thick,400 pitch,20 joints.', '800 wide main route;600 final approach to steps.', 'Dark edge finish:100 wide; gate remains clear.', 'No change to roof levels, grades or traversal.', 'Crates:460 x400 x280,3 high; base +40.',f'Crate top +{crateTop}; underside >=+{underside:.0f}.', 'Over300 vertical clearance; no delivery intrusion.', 'Existing855 outer passage retained.', 'Soft contact at tank feet and stair posts.', 'Contact opacity0.18, +1.5mm, depthWrite=false.', 'No new light or shadow-map workload.', 'All crate/product branding remains original.', 'Units/stock/save counts unchanged.'],675,H-100)
# Front elevation clarifies moulded bands / raised panel before final construction review.
c.setFont('SakuraBold',11);c.drawString(710,325,'RETURN CRATE ELEVATION')
for i in range(3):
 yy=90+i*64.4;c.setFillColorRGB(*((.4,.6,.72) if i==1 else (.8,.7,.36)));c.rect(710,yy,105.8,64.4,fill=1);c.setFillColorRGB(.3,.43,.35)
 for xx in range(8):c.rect(714+xx*12.8,yy+4,2.8,54,fill=1,stroke=0)
 c.rect(710,yy+28.5,105.8,5.5,fill=1);c.setFillColorRGB(.93,.9,.75);c.rect(735.3,yy+19.1,50.6,20.7,fill=1);c.setFillColorRGB(.18,.3,.25);c.setFont('SakuraBold',7);c.drawCentredString(760.6,yy+31,K['labelPanel']['copy'][i]);c.setFont('SakuraRegular',4.5);c.drawCentredString(760.6,yy+23,'RETURN CRATE')
 y=K['bottom']+i*K['height'];ms.add_lwpolyline([(32000,y),(32460,y),(32460,y+280),(32000,y+280)],close=True,dxfattribs={'layer':'CRATE_ELEVATION'});ms.add_lwpolyline([(32110,y+83),(32330,y+83),(32330,y+173),(32110,y+173)],close=True,dxfattribs={'layer':'CRATE_LABEL'})
c.setFont('SakuraRegular',10);c.drawString(840,200,'460 x280 each / three stacked');c.drawString(840,182,'Top +880 / apron +40');c.drawString(840,164,'Original Sakura / Higa marks')
c.showPage();title(2,'Counter additions / retained equipment / chiller merchandising');o=(-1780,-170);sc=.145
# Drafting origin is shared counter x values; retain exact CAD points in DXF offset only.
rect([13300,1400,600,4800],o,sc,(.85,.86,.8),'BACK WORKTOP',17000)
for old in C['retained']:
 if old['box'][0]>=13300:rect(old['box'],o,sc,(.72,.77,.74),old['id'],17000)
for key in ['chopsticks','supplies','basin']:rect(C[key]['box'],o,sc,(.65,.81,.81),key.upper(),17000)
notes(['INVENTORY / CORRECTIONS','Coin tray, cups, bags, chopsticks and gum already exist.', 'Retain them; no duplicate tray or second gum display.', 'Chopsticks:clear acrylic cup; shift80mm to clear bags.', 'New divided holder:260 x150 x140, top +920.', 'Microwaves and all other retained objects stay clear.', 'Oden tag:100 x65; bottom1010; X11296,D4670.', 'Original oden vat remains on the FRONT counter.', 'White placeholder is the handwash basin, not oden.', 'Replace basin within its600 x500 x90 envelope.', 'Faint cyan chiller back/shelves; packaging unchanged.', 'Three rice balls rotate -2,+3,-2.5 degrees.', 'All36 rice facings and24 counted units retained.', 'Rotated conservative bounds:zero product overlap.', 'Empty spaces appear through actual stock depletion.', 'No imaginary discount, new arrival or toilet policy.'],480,H-105)
t=C['odenTag'];c.setFillColorRGB(1,.89,.45);shape=c.beginPath()
for i,(x,y) in enumerate(t['outline']):
 (shape.moveTo if i==0 else shape.lineTo)(650+x*2,200-y*2)
shape.close();c.drawPath(shape,fill=1);c.setFillColorRGB(.5,.23,.16);c.setFont('SakuraBold',14);c.drawCentredString(650,205,'ODEN');c.setFont('SakuraBold',10);c.drawCentredString(650,187,'HOT & READY');c.setFont('SakuraRegular',10);c.drawString(520,112,'POP profile:100 x65 / bottom1010 / 24 measured vertices')
ms.add_polyline3d([(t['x'],t['depth']+x,t['bottom']+t['height']/2-y)for x,y in t['outline']]+[(t['x'],t['depth']+t['outline'][0][0],t['bottom']+t['height']/2-t['outline'][0][1])],dxfattribs={'layer':'POP_3D'})
c.save();doc.saveas(P/'Sakura-Atmosphere.dxf');assert not ezdxf.readfile(P/'Sakura-Atmosphere.dxf').audit().errors
A={'drawing':D['drawing'],'revision':D['revision'],'checks':{'counter_overlaps':0,'roof_obstruction_overlaps':0,'crate_top':crateTop,'minimum_stair_underside':round(underside,3),'delivery_and_passage_unchanged':True,'stock':stock,'dxf_errors':0},'corrected_findings':['Existing opaque chopstick cup moved80mm clear of bags; new clear cup base lowered6mm to the worktop','First crate render read as cages; add moulded waist bands and branded raised panels within the audited envelope'],'limits':['Visual game dressing only; no new traversal, live hydraulics, full flicker or physical-device acceptance']};(P/'audit.json').write_text(json.dumps(A,indent=2)+'\n');print(out)

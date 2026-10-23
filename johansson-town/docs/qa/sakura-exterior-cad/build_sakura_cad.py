from pathlib import Path
import math,json,zipfile
import ezdxf
from ezdxf.enums import TextEntityAlignment
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3,landscape
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

ROOT=Path(__file__).parent
PDF=ROOT/'Sakura-Konbini-CAD.pdf'
doc=ezdxf.new('R2010');doc.units=ezdxf.units.MM;ms=doc.modelspace()
COL={'EXTERIOR':'#23333b','FLOOR':'#64737a','WALLS':'#23333b','FIXTURES':'#42706b','COLD':'#46798d','STAFF':'#957345','DIM':'#7b8589','ROUTE':'#b26a46','TEXT':'#23333b'}
for k,col in COL.items():doc.layers.new(k,dxfattribs={'color':{'EXTERIOR':7,'FLOOR':8,'WALLS':7,'FIXTURES':3,'COLD':4,'STAFF':30,'DIM':8,'ROUTE':1,'TEXT':7}[k]})
c=canvas.Canvas(str(PDF),pagesize=landscape(A3));W,H=landscape(A3)
c.setTitle('Sakura Konbini - exterior-led CAD proposal - 23 October 2026')
page=0
def txt(x,y,s,size=9,bold=False,color='#23333b'):
 c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.setFillColor(HexColor(color));c.drawString(x,y,s)
def para(x,y,s,width,size=9,lead=13):
 for line in simpleSplit(s,'Helvetica',size,width):txt(x,y,line,size);y-=lead
 return y
def header(title,sub):
 global page
 page+=1
 txt(14*mm,H-15*mm,'JOHANSSON WORLD  /  SAKURA SHOTEN',10,True)
 txt(14*mm,H-28*mm,title,23,True)
 txt(14*mm,H-36*mm,sub,9)
 c.setStrokeColor(HexColor('#cbd2d1'));c.line(14*mm,H-41*mm,W-14*mm,H-41*mm)
 txt(14*mm,12*mm,'23 OCT 2026  |  EXTERIOR-LED DESIGN PROPOSAL  |  GAME NOT MODIFIED',8)
 txt(W-70*mm,12*mm,f'JW-SAK-CAD-{page:02d} / Rev D',8)
def end():c.showPage()
class Drawing:
 def __init__(self,px,py,scale=60,dx=0,dy=0):self.px=px;self.py=py;self.k=mm/scale;self.dx=dx;self.dy=dy
 def pt(self,x,y):return self.px+x*self.k,self.py+y*self.k
 def line(self,x,y,a,b,layer='FIXTURES',dash=False):
  c.setStrokeColor(HexColor(COL[layer]));c.setLineWidth(1.25 if layer in ['EXTERIOR','WALLS'] else .65);c.setDash(3,2) if dash else c.setDash();c.line(*self.pt(x,y),*self.pt(a,b));c.setDash()
  ms.add_line((self.dx+x,self.dy+y),(self.dx+a,self.dy+b),dxfattribs={'layer':layer})
 def rect(self,x,y,w,h,layer='FIXTURES',fill=None,dash=False):
  if fill:c.setFillColor(HexColor(fill));c.rect(*self.pt(x,y),w*self.k,h*self.k,fill=1,stroke=0)
  for a,b in [((x,y),(x+w,y)),((x+w,y),(x+w,y+h)),((x+w,y+h),(x,y+h)),((x,y+h),(x,y))]:self.line(*a,*b,layer,dash)
 def poly(self,pts,layer='FLOOR'):
  for a,b in zip(pts,pts[1:]+pts[:1]):self.line(*a,*b,layer)
 def label(self,x,y,s,size=7,layer='TEXT',angle=0):
  px,py=self.pt(x,y)
  c.saveState();c.translate(px,py);c.rotate(angle);c.setFillColor(HexColor(COL[layer]));c.setFont('Helvetica',size)
  for i,t in enumerate(s.split('\n')):c.drawCentredString(0,-i*(size+2),t)
  c.restoreState()
  for i,t in enumerate(s.split('\n')):ms.add_text(t,dxfattribs={'layer':layer,'height':size/self.k/4,'rotation':angle}).set_placement((self.dx+x,self.dy+y-i*(size+2)/self.k),align=TextEntityAlignment.MIDDLE_CENTER)
 def circle(self,x,y,r,layer='ROUTE',dash=False):
  c.setStrokeColor(HexColor(COL[layer]));c.setLineWidth(.6);c.setDash(3,2) if dash else c.setDash();c.circle(*self.pt(x,y),r*self.k,stroke=1,fill=0);c.setDash();ms.add_circle((self.dx+x,self.dy+y),r,dxfattribs={'layer':layer})
 def arrow(self,pts,layer='ROUTE'):
  for a,b in zip(pts,pts[1:]):self.line(*a,*b,layer)
  a,b=pts[-2:];ang=math.atan2(b[1]-a[1],b[0]-a[0]);L=150
  for q in [-.5,.5]:self.line(*b,b[0]-L*math.cos(ang+q),b[1]-L*math.sin(ang+q),layer)
 def dim(self,a,b,offset,text=None,vertical=False):
  layer='DIM'
  if vertical:
   x=offset;self.line(x,a[1],x,b[1],layer)
   for p in [a,b]:self.line(p[0],p[1],x-70,p[1],layer);self.line(x-70,p[1]-60,x+70,p[1]+60,layer)
   self.label(x-90,(a[1]+b[1])/2,text or str(round(abs(b[1]-a[1]))),7,layer,90)
   dim=ms.add_linear_dim(base=(self.dx+x,self.dy+a[1]),p1=(self.dx+a[0],self.dy+a[1]),p2=(self.dx+b[0],self.dy+b[1]),angle=90,override={'dimtxt':110,'dimasz':80,'dimdec':0,'dimclrd':8,'dimclre':8,'dimclrt':8})
  else:
   y=offset;self.line(a[0],y,b[0],y,layer)
   for p in [a,b]:self.line(p[0],p[1],p[0],y+70,layer);self.line(p[0]-60,y-60,p[0]+60,y+60,layer)
   self.label((a[0]+b[0])/2,y+110,text or str(round(abs(b[0]-a[0]))),7,layer)
   dim=ms.add_linear_dim(base=(self.dx+a[0],self.dy+y),p1=(self.dx+a[0],self.dy+a[1]),p2=(self.dx+b[0],self.dy+b[1]),angle=0,override={'dimtxt':110,'dimasz':80,'dimdec':0,'dimclrd':8,'dimclre':8,'dimclrt':8})
  dim.render()

# Coordinates: mm from new clear floor front-left; exterior box is fixed.
FLOOR=[(0,0),(13900,0),(13900,10640),(0,10640)]
fixtures=[]
def fixture(d,id,name,x,y,w,h,layer='FIXTURES',fill='#edf2eb',label=True):
 d.rect(x,y,w,h,layer,fill);fixtures.append(dict(id=id,name=name,x=x,y=y,w=w,d=h))
 if label:d.label(x+w/2,y+h/2,name)
header('One storey. The whole exterior box.','01 / Revised ground-floor plan 1:60 at A3, print at 100%  |  Dimensions in mm  |  Front faces Main Street')
d=Drawing(25*mm,59*mm,60)
d.rect(-180,-180,14260,11000,'EXTERIOR')
d.poly(FLOOR,'FLOOR');d.label(6950,11200,'EXTERIOR BOX 14,260 x 11,000 / SINGLE STOREY',8)
d.line(0,0,6000,0,'COLD');d.line(7900,0,13900,0,'COLD')
for a,b in [(6000,6950),(6950,7900)]:d.line(a,50,b,50,'COLD')
d.arrow([(6950,-800),(6950,950)]);d.label(6950,-1100,'MAIN STREET / CENTRAL SLIDING ENTRANCE 1,900',8)
d.dim((-180,-180),(14080,-180),-1450,'14,260 fixed exterior')
d.dim((-180,-180),(-180,10820),-1050,'11,000 fixed exterior',True)
# Full-width rear stockroom. No internal stair, no upper occupied floor.
for x,w in [(0,9950),(11050,2850)]:d.rect(x,7380,w,120,'WALLS',fill='#d8dedc')
d.line(9950,7440,11050,7440,'STAFF');d.label(10500,7160,'STOCKROOM / 1,100',6)
d.label(7200,9650,'RECEIVING / DRY STOCK / ARCHIVE',8)
d.label(7200,9360,'Full-width rear stockroom - all storage stays on site',6)
# Ground-level rest room, with futon; no staircase beside it.
for x,y,w,h in [(2120,5200,120,2180),(0,5080,1050,120),(1950,5080,290,120)]:d.rect(x,y,w,h,'WALLS',fill='#d8dedc')
d.line(1050,5140,1950,5140,'STAFF')
d.label(1700,6250,'STAFF REST / 2,000 x 2,180',6,angle=90)
d.rect(300,5330,1000,2000,'STAFF','#f1e8d7');d.label(790,6260,'FUTON',6,angle=90)
# Office remains close to Thuan's till; upper-floor functions now live at ground level.
for x,y,w,h in [(11260,5500,120,1880),(11380,5500,350,120),(12630,5500,1270,120)]:d.rect(x,y,w,h,'WALLS',fill='#d8dedc')
d.line(11730,5560,12630,5560,'STAFF')
d.label(12600,7150,'SHIFT OFFICE / SAFE',7)
d.rect(13180,5900,600,1100,'STAFF','#f1e8d7');d.circle(12720,6450,240,'STAFF');d.rect(11550,6810,450,450,'STAFF','#f1e8d7')
for id,name,x in [('G1','PANTRY',2400),('G2','SNACKS',4900),('G3','DAILY GOODS',7600)]:
 fixture(d,id,name,x,1900,900,2700,label=False);d.line(x+450,1900,x+450,4600)
 for yy in [2800,3700]:d.line(x,yy,x+900,yy)
 d.label(x+450,3250,name,7,angle=90)
d.dim((3300,4600),(4900,4600),4880,'1,600 aisle')
d.dim((5800,4600),(7600,4600),4880,'1,800 main aisle')
fixture(d,'C1','FRESH FOOD',120,1900,850,2600,'COLD','#e3eff2',False);d.label(545,3200,'BENTO / ONIGIRI / MILK',6,angle=90)
fixture(d,'C2','DRINKS / BEER / DAIRY',4700,6580,4800,800,'COLD','#e3eff2')
for xx in range(5500,9500,800):d.line(xx,6580,xx,7380,'COLD')
fixture(d,'F1','ICE / FROZEN',2800,6500,1200,700,'COLD','#e3eff2')
fixture(d,'M1','MAGAZINES / NEWSPAPERS',1200,120,2700,450)
fixture(d,'S1','COPY / FAX',9250,120,700,600)
fixture(d,'P1','FLOWERS',11300,120,900,650)
fixture(d,'B1','BASKETS',5150,120,450,450,label=False);d.label(5375,850,'BASKETS',6)
fixture(d,'T1','CHECKOUT',11400,1300,600,3000,'STAFF','#f1e8d7',False);d.label(11700,2800,'TILL / BAGGING / HOT CASE',6,angle=90)
fixture(d,'T2','BACK WORKTOP',13230,1300,550,3000,'STAFF','#f1e8d7',False);d.label(13500,2800,'MICROWAVE / HOT WATER / HAND BASIN',6,angle=90)
d.rect(11400,1500,600,600,'STAFF','#d5c7ab');d.label(11520,1840,'POS',6,angle=90)
d.circle(12350,1800,240,'STAFF');d.label(12540,1170,'THUAN',7)
for i,y in enumerate([2000,3000,4000]):d.circle(10700,y,240);d.label(10700,y+70,str(i+1),7)
d.label(10000,4200,'QUEUE',7)
d.arrow([(6950,1100),(10350,1100),(10700,1800)])
d.circle(6700,5550,750,'ROUTE',True);d.label(6700,5560,'1,500',6);d.label(6700,5300,'turning zone',6)
d.dim((12000,4300),(13230,4300),4720,'1,230 staff aisle')
d.dim((970,1900),(2400,1900),1650,'1,430')
# WC inside the storage area, behind a small hygiene lobby, not on the sales floor.
for x,y,w,h in [(1920,8580,120,450),(1920,9930,120,590),(0,8460,2040,120),(2040,8580,1200,120),(3120,8580,120,150),(3120,9630,120,890)]:d.rect(x,y,w,h,'WALLS',fill='#d8dedc')
d.line(1980,9030,1980,9930,'STAFF');d.line(3180,8730,3180,9630,'STAFF')
d.rect(0,10520,3240,120,'WALLS',fill='#d8dedc')
d.label(980,10290,'STAFF WC',7);d.label(980,10020,'1,800 x 1,940',6)
d.rect(370,9250,420,700,'FIXTURES','#f4f4ee');d.circle(580,9730,150,'FIXTURES')
d.rect(1320,9950,460,400,'COLD','#e3eff2');d.label(1510,9700,'basin',5)
d.label(2590,10070,'HYGIENE',6);d.label(2590,9810,'LOBBY',6)
# Tea/meal corner is separated from WC by its solid front wall.
fixture(d,'K1','TEA / MEAL BREAK',11100,7560,1800,600,'STAFF','#f1e8d7')
d.label(12000,8490,'SINK / KETTLE / LUNCH',5)
fixture(d,'R1','DRY STOCK',3500,10020,3500,500,'STAFF','#f1e8d7')
fixture(d,'R2','COLD BACKSTOCK',8800,10020,1400,500,'COLD','#e3eff2')
fixture(d,'R3','EMPTIES',12880,10020,900,500,'STAFF','#f1e8d7')
fixture(d,'R4','CHECK-IN',13080,8160,700,1200,'STAFF','#f1e8d7')
fixture(d,'R5','ARCHIVE / DECOR',3500,7620,2500,500,'STAFF','#f1e8d7')
d.rect(6500,7940,600,800,'STAFF','#f1e8d7');d.label(6800,8310,'CART',6)
# The existing rear door axis is retained; outside service stair is on sheet 2.
rear_door_x=7850;d.line(7325,10640,8375,10640,'STAFF')
d.arrow([(7850,11250),(7850,8840),(10500,8840),(10500,7080)])
d.label(10700,11150,'DELIVERIES / OUTSIDE TO ROOF STAIR',6)
x=285*mm;y=H-52*mm
for title,body in [
 ('ONE STOREY ONLY','The former upper floor and internal staircase are removed from this proposal. The 14.26 x 11.00 m exterior box controls the new full rectangular plan.'),
 ('USE THE WHOLE BOX','A proposed 180 mm perimeter allowance leaves 13.90 x 10.64 m inside, approximately 147.90 m2 before internal partitions. The old stepped interior is retired; there are no unused rear corners.'),
 ('TOILET IN THE STOCKROOM','The staff WC opens through a small hygiene lobby within the rear stockroom. It has no door directly onto the sales floor. A separate hand basin remains at the food-service worktop.'),
 ('THUAN AT GROUND LEVEL','Shift desk and safe stay near the till. A dedicated lie-down room, tea/meal corner, archive and decoration stock are all on the ground floor.'),
 ('ROOF ACCESS ONLY','A compact external rear steel stair serves the water tank and roof escape. It connects ground to roof only, never to a second storey. Its plan and water-tank service space are shown on sheet 2.')]:
 txt(x,y,title,9,True);y-=15;y=para(x,y,body,108*mm,9,13)-17
d.line(0,-2200,3000,-2200,'DIM')
for xx in range(0,3001,1000):d.line(xx,-2300,xx,-2100,'DIM');d.label(xx,-2500,f'{xx//1000} m',7)
txt(25*mm,29*mm,'180 mm perimeter allowance is proposed. Register against the existing exterior mesh before construction in the game.',7)
end()

header('A service roof, not another floor','02 / Roof plan 1:90 and side elevation 1:90 at A3  |  Counter detail 1:20  |  Dimensions in mm')
r=Drawing(27*mm,104*mm,90,dx=18000)
r.rect(-180,-180,14260,11000,'EXTERIOR');r.rect(0,0,13900,10640,'FLOOR')
r.label(6950,5000,'SINGLE-STOREY SHOP BELOW',8)
r.label(6950,4600,'ROOF: MAINTENANCE AND ESCAPE ONLY',7)
# A guarded route connects the rear service stair with a 1.2 m tank service ring.
r.circle(10900,8500,600,'COLD');r.label(10900,8550,'WATER',6);r.label(10900,8100,'TANK',6)
r.rect(9100,6700,3600,3600,'COLD',dash=True);r.label(10900,6350,'1,200 SERVICE CLEARANCE',6)
r.arrow([(12600,10640),(12600,9200),(12400,8500)],'ROUTE')
# External dogleg service/escape stair, 20 risers, not interior floor area.
sx=9850;sy=10820;run=2250;landing=900;top=900
for yy in [sy,sy+1020]:
 r.rect(sx,yy,4050,900,'STAFF')
 for i in range(10):r.line(sx+landing+i*250,yy,sx+landing+i*250,yy+900,'STAFF')
r.arrow([(13400,11270),(10000,11270),(10000,12290),(13400,12290)],'STAFF')
r.label(11850,13200,'EXTERNAL ROOF STAIR: 4,050 x 1,920',7)
r.label(11850,12850,'20 RISERS / 900 CLEAR / GUARDED LANDINGS',6)
# Top landing comes back over the roof edge through a guarded bridge.
r.rect(13000,10340,900,1500,'STAFF',dash=True);r.label(12600,10050,'SELF-CLOSING ROOF GATE',5)
r.label(6950,-450,'FRONT / MAIN STREET',7)
txt(26*mm,245*mm,'ROOF PLAN 1:90',9,True)
# Single-storey side elevation: no windows or rooms above the shop.
v=Drawing(27*mm,36*mm,90,dx=18000,dy=18000)
v.line(-180,0,14080,0,'EXTERIOR');v.rect(-180,0,14260,4010,'EXTERIOR')
v.line(-180,2700,14080,2700,'FLOOR',True);v.label(4800,2850,'2,700 SALES CEILING / SERVICES ABOVE',6)
v.rect(10300,4210,1200,1200,'COLD');v.rect(10100,4010,1600,200,'STAFF')
v.line(-180,5110,14080,5110,'STAFF')
for xx in range(0,13901,1800):v.line(xx,4010,xx,5110,'STAFF')
v.label(4800,5310,'GUARDED ROOF EDGE',6)
v.label(4800,1450,'ONE OCCUPIED FLOOR',8)
v.dim((-180,0),(-180,4010),-750,'4,010 ROOF DECK',True)
v.label(6950,-650,'ELEVATION 1:90 / ROOF DATUM TAKEN FROM EXISTING LOWER BUILDING',7)
# Compact till detail on right-hand side.
q=Drawing(254*mm,147*mm,20,dx=36000)
q.label(1200,1650,'COUNTER SECTION 1:20',9)
q.line(-100,0,2500,0,'EXTERIOR');q.rect(0,0,600,780,'STAFF','#f1e8d7');q.rect(1830,0,550,780,'STAFF','#f1e8d7')
q.rect(100,780,300,260,'STAFF','#d5c7ab');q.label(300,1160,'LOW POS',6)
q.line(1000,0,1000,770,'ROUTE');q.line(1000,770,960,1130,'ROUTE');q.circle(960,1270,135,'ROUTE');q.line(960,1130,470,850,'ROUTE')
q.dim((0,0),(0,780),-150,'780',True);q.dim((600,0),(1830,0),-220,'1,230 CLEAR')
x=248*mm;y=110*mm
for title,body in [('ROOF SERVICE','Proposed tank: 1,200 mm diameter x 1,200 mm high on a 200 mm curb. Clear maintenance ring 1,200 mm. Tank size and support are placeholders for the game model, to be checked before detailing.'),('COMPACT EXTERNAL ACCESS','Two 900 mm-wide steel flights, 20 risers x 200.5 mm, 250 mm goings and 900 mm landings. Handrails and guarded roof entry; a 1,100 mm edge guard is proposed. Ground service access and outward escape operation must be resolved together.'),('NO SECOND STOREY','Roof deck at approximately 4,010 mm retains the lower building/signboard height. Remove the former office-storey walls and windows. No upstairs office, rest room, archive or internal stair remains.')]:
 txt(x,y,title,9,True);y-=14;y=para(x,y,body,150*mm,8,11)-13
end()

header('The shop programme, all on one floor','03 / Fixture and space schedule  |  Supersedes Rev C and its retained upper-storey arrangement')
rows=[
 ('G1-G3','3 low double-sided gondolas','900 x 2,700; H1,400','Pantry, snacks and daily goods. Four decks; 64.8 m shelf edge in total.'),
 ('C1','Fresh-food wall chiller','850 x 2,600','Bento, onigiri, sandwiches and dairy near the front; no WC beside it.'),
 ('C2 / F1','Drinks cabinet; chest freezer','4,800 x 800; 1,200 x 700','Cold drinks, beer, milk, ice and frozen food, clear of the stockroom door.'),
 ('T1 / T2','Checkout and worktop','600 / 550 deep; H780','Thuan serves at a low counter; 1,230 mm staff aisle and short work routes.'),
 ('M1 / S1','Magazines; copier/fax','2,700 x 450; 700 x 600','Window-side reading and neighbourhood services, leaving the door clear.'),
 ('Office','Daily desk and secure cash','2,400 x 1,760 clear','Ground-floor ledger, phone, chair and safe beside the till.'),
 ('Rest','Dedicated staff lie-down room','2,000 x 2,180 clear','A 1,000 x 2,000 futon, sliding entrance; no separate upstairs room.'),
 ('K1','Tea and meal-break corner','1,800 x 600 worktop','Ground-level staff sink, kettle and lunch area, outside the WC enclosure.'),
 ('WC','Stockroom WC and hygiene lobby','WC 1,800 x 1,940 clear','Access only through the rear stock area; no door onto the sales floor.'),
 ('R1-R5','Receiving, stock, archive, decor','Full-width rear band','Dry and cold backstock, counted deliveries, trolley, empties and archives.'),
 ('Roof','Tank and external roof stair','Stair 4,050 x 1,920','Maintenance and escape access only. It is not an occupied second floor.')]
xx=[14*mm,40*mm,112*mm,175*mm];yy=H-53*mm
for x,t in zip(xx,['ID','FITTING / SPACE','SIZE / BASIS','PURPOSE']):txt(x,yy,t,8,True)
yy-=7*mm
for row in rows:
 c.setStrokeColor(HexColor('#dce1df'));c.line(14*mm,yy+4*mm,W-14*mm,yy+4*mm)
 for i,(x,t) in enumerate(zip(xx,row)):para(x,yy,t,[24,70,61,230][i]*mm,8,10)
 yy-=12*mm
yy-=6*mm
txt(14*mm,yy,'OWNER CHANGE - 23 OCTOBER',9,True)
y=para(14*mm,yy-15,'A single-storey konbini using the whole exterior box. Remove the large staircase and second floor. Put the toilet within the stockroom. Provide only a small roof-access stair for the water tank and fire escape. This supersedes the earlier instruction to retain upstairs support rooms.',190*mm,9,13)
y=para(14*mm,y-8,'The earlier support functions remain at Sakura, now on the ground floor: daily desk/cash, tea/meal break, dedicated lie-down space and stock/archive/decor. The full rectangular floor replaces the old stepped imported interior.',190*mm,9,13)
y=para(14*mm,y-8,'Customer route: central entry, fresh food or short aisles, queue beside the till. Delivery route: rear door, receiving, cold/dry stock, stockroom door. Toilet and roof service remain behind the shop operation.',190*mm,9,13)
txt(218*mm,yy,'BASIS AND NEXT VALIDATION',9,True)
y=para(218*mm,yy-15,'Exterior guide: current source span 14.26 x 11.00 m. Proposed wall allowance 180 mm each side; clear floor 13.90 x 10.64 m = 147.896 m2 before partitions. This is a new proposed fit, not a claim about the old stepped model.',187*mm,8,11)
y=para(218*mm,y-7,'New Yokosuka informs merchandising and human-scale fittings through the inherited 19 October repository study. It does not determine the size of Sakura. No reference assets or code are copied.',187*mm,8,11)
y=para(218*mm,y-7,'Next: register the new rectangular floor to the actual exterior mesh; check ground-level support/storage capacity, Thuan reach, camera and shopper/trolley routes, WC privacy, roof tank/service route and the rear stair against the lane. Stair projection is outside the fixed shop box and requires site-clearance validation.',187*mm,8,11)
y=para(218*mm,y-7,'CAD only. No game, save, door, staffing, inventory or live building change has been implemented. Single-storey implementation must retire upstairs entry and migrate old upstairs saves safely.',187*mm,8,11)
txt(14*mm,27*mm,'Sources: existing Sakura exterior source; New Yokosuka measured lessons; owner single-storey revision of 23 October 2026.',7)
end();c.save();doc.saveas(ROOT/'Sakura-Konbini-CAD.dxf')
area=13900*10640/1e6
data={'revision':'D','date':'2026-10-23','units':'mm','building_storeys':1,'exterior_nominal_span':[14260,11000],'proposed_perimeter_allowance_mm':180,'floor_polygon':FLOOR,'proposed_clear_floor_area_m2':area,'fixture_envelopes':fixtures,'toilet':{'x':120,'y':8580,'w':1800,'d':1940,'access':'stockroom through hygiene lobby'},'roof':{'deck_height':4010,'tank':{'centre':[10900,8500],'diameter':1200,'height':1200,'curb':200,'service_clearance':1200},'external_stair':{'x':9850,'y':10820,'w':4050,'d':1920,'flight_width':900,'risers':20,'rise':200.5,'going':250,'access':'ground to roof only; no second floor'}},'internal_stair':None,'upper_occupied_floor':False,'principal_aisles_mm':[1430,1600,1800],'staff_aisle_mm':1230,'counter_height_mm':780}
(ROOT/'Sakura-Konbini-Layout.json').write_text(json.dumps(data,indent=2))
audit=ezdxf.readfile(ROOT/'Sakura-Konbini-CAD.dxf').audit();assert not audit.errors
for f in fixtures:assert 0<=f['x']<=f['x']+f['w']<=13900 and 0<=f['y']<=f['y']+f['d']<=10640,f['id']
for i,a in enumerate(fixtures):
 for b in fixtures[i+1:]:assert not (min(a['x']+a['w'],b['x']+b['w'])>max(a['x'],b['x']) and min(a['y']+a['d'],b['y']+b['d'])>max(a['y'],b['y'])),(a['id'],b['id'])
checks={'revision':'D','dxf_audit_errors':len(audit.errors),'dxf_audit_fixes':len(audit.fixes),'units':'millimetres','proposed_clear_floor_area_m2':area,'entities':len(ms),'fixture_count':len(fixtures),'fixture_corners_inside_floor':True,'fixture_envelopes_do_not_overlap':True,'building_storeys':1,'internal_stair_removed':True,'toilet_access':'stockroom only','roof_stair':'external ground-to-roof service/escape only','gameplay_tested':False}
(ROOT/'Sakura-CAD-Checks.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks))

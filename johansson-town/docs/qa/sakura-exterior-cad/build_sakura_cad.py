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
 txt(W-70*mm,12*mm,f'JW-SAK-CAD-{page:02d} / Rev E',8)
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

# Rev E: owner-supplied merchandising grid, resolved to buildable drawing zones.
FLOOR=[(0,0),(13900,0),(13900,10640),(0,10640)]
fixtures=[]
def fixture(d,id,name,x,y,w,h,layer='FIXTURES',fill='#edf2eb',label=True):
 d.rect(x,y,w,h,layer,fill);fixtures.append(dict(id=id,name=name,x=x,y=y,w=w,d=h))
 if label:d.label(x+w/2,y+h/2,name)
header('Sakura: the complete konbini grid','01 / Ground plan 1:60 at A3, print at 100%  |  Dimensions in mm  |  One storey, fixed exterior box')
d=Drawing(25*mm,59*mm,60)
d.rect(-180,-180,14260,11000,'EXTERIOR');d.poly(FLOOR,'FLOOR')
d.label(6950,11200,'14,260 x 11,000 EXTERIOR / 13,900 x 10,640 CLEAR BOX',8)
d.dim((-180,-180),(14080,-180),-1450,'14,260 fixed shell')
d.dim((-180,-180),(-180,10820),-1050,'11,000 fixed shell',True)
# Rear 2,400 mm service strip; room allocations are gross partition zones.
for x,w in [(0,3300),(4200,1000),(5200,5200),(10400,1600),(12900,1000)]:
 if x!=5200:d.line(x,8240,x+w,8240,'WALLS')
d.line(3300,8240,4200,8240,'STAFF');d.label(3750,7990,'STAFF ONLY',5)
for x in [1400,2400]:
 for a,b in [(8240,9300),(10200,10640)]:d.line(x,a,x,b,'WALLS')
 d.line(x,9300,x,10200,'STAFF')
d.line(5200,8240,5200,10640,'WALLS')
d.label(690,10330,'STAFF WC',6);d.label(1860,10330,'HYGIENE',6);d.label(1860,10080,'LOBBY',5)
d.rect(300,9540,420,700,'FIXTURES','#f2f0e7');d.circle(510,10020,150,'FIXTURES')
d.rect(1700,8380,450,400,'COLD','#e3eff2')
d.label(3720,10330,'REST / ARCHIVE',6)
d.rect(4100,8540,1000,2000,'STAFF','#f1e8d7');d.label(4600,9540,'FUTON',6,angle=90)
d.rect(2600,8700,500,500,'STAFF','#f1e8d7');d.label(2850,9480,'TEA',5)
d.rect(2500,10200,1400,350,'STAFF',dash=True);d.label(3200,10410,'ARCHIVE ABOVE',5)
# Cold-room 75 mm insulated envelope: 700 rack + 1,350 clear lane + walls = 2,200.
d.rect(5200,8240,5200,2200,'COLD','#edf5f6')
d.rect(5275,8315,5050,700,'COLD','#d9e9ed')
d.label(7800,8680,'700 DEEP GRAVITY RACKS',6)
d.label(7800,9690,'1,350 CLEAR COLD-ROOM WALKWAY',6)
for i in range(8):
 d.rect(5400+i*600,8240,600,75,'COLD')
 d.label(5700+i*600,8420,str(i+1),5)
d.label(7800,10580,'WALK-IN DRINKS / 8 x 600 GLASS DOORS',6)
d.line(10400,9300,10400,10200,'STAFF');d.label(10150,9740,'900 DOOR',5,angle=90)
d.label(12050,10580,'RECEIVING',6)
fixture(d,'DRY','DRY STOCK',13400,8340,500,1700,'STAFF','#f1e8d7',False);d.label(13650,9190,'DRY STOCK',5,angle=90)
fixture(d,'RETURN','EMPTIES',12350,10040,900,500,'STAFF','#f1e8d7')
fixture(d,'CART','STOCK CART',10600,8400,600,800,'STAFF','#f1e8d7',False);d.label(10900,8800,'CART',5)
# Explicitly proposed rear-door relocation, not the previous 7,850 mm source axis.
d.line(10975,10640,12025,10640,'STAFF')
d.arrow([(11500,11200),(11500,9760),(10600,9760)])
d.label(11500,11430,'REAR DOOR: PROPOSED X=11,500',6)
# Shift office zone and its two controlled staff doors.
for a,b in [(6200,8240)]:d.line(11400,a,11400,b,'WALLS')
for a,b in [(11400,12200),(13100,13900)]:d.line(a,6200,b,6200,'WALLS')
d.line(12200,6200,13100,6200,'STAFF');d.line(12000,8240,12900,8240,'STAFF')
d.label(12650,7890,'SHIFT OFFICE / SAFE',6);d.label(12650,7640,'FLOOR +150 / CCTV',5)
d.rect(13200,6660,600,1100,'STAFF','#f1e8d7');d.circle(12750,7210,220,'STAFF');d.rect(11550,7660,450,450,'STAFF','#f1e8d7')
d.line(11400,6500,11400,7700,'COLD');d.label(11650,7050,'OBSERVATION GLASS',5,angle=90)
# West wall - continuous refrigerated fresh-food run.
fixture(d,'FRESH','FRESH-FOOD MULTIDECK',0,1200,700,7040,'COLD','#e3eff2',False)
for y in [2960,4720,6480]:d.line(0,y,700,y,'COLD')
for y,s in [(2000,'ONIGIRI / SANDWICH'),(3800,'BENTO'),(5500,'NOODLES / SALAD'),(7350,'MILK / PAPER PACK')]:d.label(350,y,s,5,angle=90)
# 3,600 body + 450 endcaps = 4,500 total, Y 2,400..6,900.
for id,name,x in [('G1','BREAD / PANTRY',1850),('G2','SNACKS / CANDY',3800),('G3','DAILY / STATIONERY',5750)]:
 fixture(d,id,name,x,2400,900,4500,label=False)
 d.line(x,2850,x+900,2850);d.line(x,6450,x+900,6450);d.line(x+450,2850,x+450,6450)
 for y in [3750,4650,5550]:d.line(x,y,x+900,y)
 d.label(x+450,4650,name,6,angle=90)
 d.label(x+450,2630,'ENDCAP',5);d.label(x+450,6670,'ENDCAP',5)
for a,b,t in [(700,1850,'1,150'),(2750,3800,'1,050'),(4700,5750,'1,050'),(6650,7700,'1,050')]:d.dim((a,2400),(b,2400),2150,t)
fixture(d,'ICE','ICE CREAM / BAGGED ICE',7700,2300,900,4500,'COLD','#e3eff2',False);d.label(8150,4550,'ICE CREAM / BAGGED ICE / H850',6,angle=90)
d.dim((6650,6900),(6650,8240),7040,'1,340 rear aisle',True)
# Counter spine. Gate at south end, office at north end; low service counter retained.
fixture(d,'TILL','SERVICE COUNTER',11300,1400,800,4800,'STAFF','#f1e8d7',False)
fixture(d,'WORK','BACK COUNTER',13300,1400,600,4800,'STAFF','#f1e8d7',False)
d.line(12100,1400,13300,1400,'STAFF');d.label(12700,1230,'STAFF GATE',5)
d.label(12700,4200,'1,200 STAFF AISLE',5,angle=90)
# 1.4 m hot zone: 600 oden + 350 steamer + 450 small hot case.
for y,h,s in [(4800,600,'ODEN'),(5400,350,'BUNS'),(5750,450,'HOT CASE')]:d.rect(11650,y,450,h,'STAFF','#e3d1ac');d.label(11875,y+h/2,s,4,angle=90)
for y in [2800,4100]:d.rect(11700,y,400,450,'STAFF','#d5c7ab');d.label(11890,y+220,'POS',5,angle=90)
d.rect(11500,3450,500,500,'STAFF','#e2dfd6');d.label(11750,3690,'BASKET',4,angle=90)
d.label(11700,1900,'PARCELS / HOT WATER',5,angle=90)
for y in [1800,2900]:d.rect(13300,y,600,650,'STAFF','#d5c7ab');d.label(13600,y+325,'MICRO',4,angle=90)
d.rect(13300,4200,600,500,'COLD','#e3eff2');d.label(13600,4450,'SINK',5,angle=90)
d.label(13600,5500,'TOBACCO / PREP',5,angle=90)
d.circle(12420,3100,220,'STAFF');d.label(12700,2800,'THUAN',5)
for i,y in enumerate([5300,4300,3300,2300]):d.circle(10100,y,220);d.label(10100,y+60,str(i+1),6)
d.label(9700,6000,'QUEUE / 2,700 BUFFER',6)
d.dim((8600,6800),(11300,6800),7120,'2,700 queue buffer')
# Front glass, tachiyomi, utility corner and central entrance.
fixture(d,'MAG','MAGAZINES / MANGA',0,0,5800,550,'FIXTURES','#edf2eb')
d.line(900,0,900,550);d.label(440,790,'PAPERS',5)
d.line(0,0,6000,0,'COLD');d.line(7900,0,13900,0,'COLD')
for a,b in [(6000,6950),(6950,7900)]:d.line(a,50,b,50,'COLD')
d.rect(5950,0,2000,1200,'FLOOR',dash=True);d.label(6950,500,'ENTRY MAT',5)
fixture(d,'BASKET','BASKETS',5500,800,400,500,label=False);d.label(5700,1520,'BASKETS',5)
fixture(d,'BINS','SORTED BINS',8200,0,1400,600,'FIXTURES','#edf2eb')
fixture(d,'KIOSK','TICKETS',9700,0,600,800,'FIXTURES','#edf2eb',False);d.label(10000,430,'TICKETS',5,angle=90)
fixture(d,'COPY','COPY / FAX',10400,0,1000,800)
d.rect(11500,0,900,800,'DIM',dash=True);d.label(11950,420,'ATM BAY',5);d.label(11950,175,'RESERVED',4)
# Exterior accessories: design candidates, not yet placed in the town lane.
d.label(3650,-600,'PAYPHONE / UMBRELLAS',5);d.label(10050,-600,'FLOWERS / ASHTRAY',5)
d.arrow([(6950,-800),(6950,1250),(7175,1800),(7175,7350),(8000,7770)])
d.label(6950,-1100,'MAIN STREET / CENTRAL 1,900 SLIDING DOOR',7)
x=285*mm;y=H-52*mm
for title,body in [
 ('OWNER GRID, RESOLVED','Rear service strip Y=8,240..10,640. WC/lobby, staff rest, cold room and receiving share the rear. Shift office remains in the east spine. No internal stair or second floor.'),
 ('AREA ACCOUNTING','Rear strip 33.36 m2 plus office 5.10 m2 = 38.46 m2, about 26% of the clear box. The remaining 74% includes retail fixtures and the service counter. This is zoning, not net walkable sales area.'),
 ('ISLAND AND AISLE FIT','Each island is 3,600 mm plus two 450 mm endcaps: 4,500 mm overall, Y=2,400..6,900. Rear cross-aisle is 1,340 mm. Body heights 1,350; freezer 850. Front circulation is 1,850 mm from the magazine rack.'),
 ('STAFF ACCESS ADDED','A controlled rear-aisle door reaches the rest room and WC lobby. Receiving has direct cold-room and office access. The 1,350 mm cold-room lane stays free of crates; backstock uses the racks.'),
 ('REAR DOOR CHANGE','Your X~11,500 delivery door is shown as a proposed relocation from the earlier X=7,850 axis. Its width is 1,050 mm. Register the new opening against the real rear facade before implementation.'),
 ('1997 AND WORKING REACH','Ticket terminal is an early-style original prop; FamiPort is excluded. ATM footprint is reserved, not an active 1997 service. Counter stays 780 mm high; the 800 mm depth needs actual Thuan hand-off tests.')]:
 txt(x,y,title,9,True);y-=14;y=para(x,y,body,108*mm,8,11)-14
d.line(0,-2200,3000,-2200,'DIM')
for xx in range(0,3001,1000):d.line(xx,-2300,xx,-2100,'DIM');d.label(xx,-2500,f'{xx//1000} m',7)
txt(25*mm,29*mm,'Room zone dimensions are before partition deductions. Cooler internal rack/lane fit uses 75 mm insulation.',7)
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
v.line(-180,2800,14080,2800,'FLOOR',True);v.label(4800,2850,'2,800 SALES CEILING / SERVICES ABOVE',6)
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
q.line(-100,0,2500,0,'EXTERIOR');q.rect(0,0,800,780,'STAFF','#f1e8d7');q.rect(2000,0,600,780,'STAFF','#f1e8d7')
q.rect(100,780,300,260,'STAFF','#d5c7ab');q.label(300,1160,'LOW POS',6)
q.line(1000,0,1000,770,'ROUTE');q.line(1000,770,960,1130,'ROUTE');q.circle(960,1270,135,'ROUTE');q.line(960,1130,470,850,'ROUTE')
q.dim((0,0),(0,780),-150,'780',True);q.dim((800,0),(2000,0),-220,'1,200 CLEAR')
x=248*mm;y=110*mm
for title,body in [('ROOF SERVICE','Proposed tank: 1,200 mm diameter x 1,200 mm high on a 200 mm curb. Clear maintenance ring 1,200 mm. Tank size and support are placeholders for the game model, to be checked before detailing.'),('COMPACT EXTERNAL ACCESS','Two 900 mm-wide steel flights, 20 risers x 200.5 mm, 250 mm goings and 900 mm landings. Handrails and guarded roof entry; a 1,100 mm edge guard is proposed. Ground service access and outward escape operation must be resolved together.'),('NO SECOND STOREY','Roof deck at approximately 4,010 mm retains the lower building/signboard height. Remove the former office-storey walls and windows. No upstairs office, rest room, archive or internal stair remains.')]:
 txt(x,y,title,9,True);y-=14;y=para(x,y,body,150*mm,8,11)-13
end()

header('A working 1997 shop, with clear limits','03 / Fixture schedule and coordination record  |  CAD proposal only, not an implemented game interior')
rows=[
 ('Rear','Full-width service strip','13,900 x 2,400','WC/lobby, staff rest/archive, walk-in cooler, receiving and dry stock.'),
 ('WC','WC + hygiene lobby zones','1,400 + 1,000 wide','WC reached via lobby and staff rest; no direct door to the sales floor.'),
 ('Rest','Staff rest / tea / archive','2,800 x 2,400 zone','1,000 x 2,000 futon, compact tea table, archive shelf above; staff-only access.'),
 ('Cold','Back-loaded drinks cold room','5,200 x 2,200 external','Eight 600 mm glass fronts; 700 rack + 1,350 clear lane + 2 x 75 insulation.'),
 ('Receive','Receiving / dry / empties','3,500 x 2,400 zone','Relocated rear delivery door at X=11,500; trolley bay and 900 cold-room door.'),
 ('Office','Shift office / safe / CRT','2,500 x 2,040 zone','Floor +150; ledger/computer, safe, CCTV and 1,200 observation window.'),
 ('Counter','Till / hot food / parcel service','800 x 4,800; H780','Two POS, basket well, oden, compact bun steamer and hot case; service pots.'),
 ('Work','Rear worktop / staff aisle','600 deep / 1,200 clear','Two microwaves, separate hand basin, prep fridge and tobacco above.'),
 ('Fresh','West multi-deck refrigeration','700 x 7,040','Onigiri/sandwiches, bento, chilled noodles/salads, milk/paper-pack drinks.'),
 ('G1-G3','Three double-sided islands','900 x 4,500; H1,350','3,600 body + 450 endcaps each end. 86.4 m body shelf edge at four decks.'),
 ('Ice','Long island freezer','900 x 4,500; H850','Ice cream and bagged ice beside a 2,700 mm queue buffer.'),
 ('Front','Magazine / utility window bays','See plan coordinates','Tachiyomi, bins, early ticket prop, copier/fax; reserved future ATM footprint.')]
xx=[14*mm,40*mm,112*mm,175*mm];yy=H-53*mm
for x,t in zip(xx,['ID','ZONE / FITTING','SIZE / BASIS','PURPOSE']):txt(x,yy,t,8,True)
yy-=7*mm
for row in rows:
 c.setStrokeColor(HexColor('#dce1df'));c.line(14*mm,yy+4*mm,W-14*mm,yy+4*mm)
 for i,(x,t) in enumerate(zip(xx,row)):para(x,yy,t,[24,70,61,230][i]*mm,8,10)
 yy-=12*mm
yy-=4*mm
txt(14*mm,yy,'COORDINATION CHANGES',9,True)
y=para(14*mm,yy-15,'The exterior footprint, central front door and one-storey roof remain. The supplied rear-door position conflicts with the previous door axis, so this revision explicitly proposes relocating that opening to X=11,500. The exterior roof-only stair and tank remain as on sheet 2.',190*mm,8,11)
y=para(14*mm,y-6,'The island schedule had a 100 mm length discrepancy. Starting the 4,500 mm total islands at Y=2,400 and ending at Y=6,900 resolves it and preserves the specified 1,340 mm rear aisle. Room allocations are gross zones; walls/doors require detailing.',190*mm,8,11)
y=para(14*mm,y-6,'The office glazing is an observation window; one-way appearance depends on relative lighting. Counter hot-food appliances are sized to fit the 1,400 mm zone: 600 mm oden, 350 mm steamer and 450 mm compact hot case. Staff-side handles must remain reachable.',190*mm,8,11)
txt(218*mm,yy,'PERIOD EVIDENCE AND NEXT CHECKS',9,True)
y=para(218*mm,yy-15,'Lawson Entertainment records online ticket sales through Loppi from September 1997; an early ticket-terminal concept is plausible, not evidence of installation at an independent island shop. FamilyMart records FamiPort introduction in 2000. A typical chain ATM is not assumed for 1997; its bay is reserved.',187*mm,8,11)
y=para(218*mm,y-6,'References: www.ent.lawson.co.jp/company/ ; www.family.co.jp/company/familymart/corporate_history.html ; www.lawson.jp/en/ir/library/annual_report/2022/ar01.html . New Yokosuka remains proportion/merchandising inspiration through the earlier repository study.',187*mm,7,10)
y=para(218*mm,y-6,'Next: actual mesh registration, rear-door relocation and lane clearance, all staff/reader/customer routes, 1,050 mm aisle navigation, Thuan reach across the deeper counter, raised-office step/camera, cooling doors/ventilation, stock capacity and safe migration of old upstairs saves. No gameplay/device acceptance claimed.',187*mm,8,11)
txt(14*mm,26*mm,'CAD design values are not a certified architectural standard or proof of compliance. Original fictional products/signage will be used.',7)
end();c.save();doc.saveas(ROOT/'Sakura-Konbini-CAD.dxf')
area=13900*10640/1e6;boh=13900*2400/1e6+2500*2040/1e6
data={'revision':'E','date':'2026-10-23','units':'mm','building_storeys':1,'exterior_nominal_span':[14260,11000],'proposed_perimeter_allowance_mm':180,'floor_polygon':FLOOR,'proposed_clear_floor_area_m2':area,'dedicated_rear_plus_office_m2':boh,'dedicated_rear_plus_office_pct':100*boh/area,'fixture_envelopes':fixtures,'rear_zones':[{'id':'WC-lobby','x':[0,2400],'y':[8240,10640]},{'id':'rest-archive','x':[2400,5200],'y':[8240,10640]},{'id':'cold-room','x':[5200,10400],'y':[8240,10440]},{'id':'receiving','x':[10400,13900],'y':[8240,10640]}],'rear_delivery_door':{'centre_x':11500,'width':1050,'y':10640,'status':'proposed relocation from earlier 7850 axis'},'cold_room':{'glass_doors':8,'door_width':600,'rack_depth':700,'clear_lane':1350,'insulation':75,'east_staff_door':900},'gondola':{'body_length':3600,'endcaps':[450,450],'total_length':4500,'y':[2400,6900],'height':1350,'aisles':[1150,1050,1050,1050]},'roof':{'deck_height':4010,'tank':{'centre':[10900,8500],'diameter':1200,'height':1200,'curb':200,'service_clearance':1200},'external_stair':{'x':9850,'y':10820,'w':4050,'d':1920,'flight_width':900,'risers':20,'rise':200.5,'going':250}},'internal_stair':None,'upper_occupied_floor':False,'counter_height_mm':780,'counter_depth_mm':800,'period':{'ticket_terminal':'early 1997-style original prop','FamiPort':False,'ATM':'reserved footprint only'}}
(ROOT/'Sakura-Konbini-Layout.json').write_text(json.dumps(data,indent=2))
audit=ezdxf.readfile(ROOT/'Sakura-Konbini-CAD.dxf').audit();assert not audit.errors
for f in fixtures:assert 0<=f['x']<=f['x']+f['w']<=13900 and 0<=f['y']<=f['y']+f['d']<=10640,f['id']
for i,a in enumerate(fixtures):
 for b in fixtures[i+1:]:assert not (min(a['x']+a['w'],b['x']+b['w'])>max(a['x'],b['x']) and min(a['y']+a['d'],b['y']+b['d'])>max(a['y'],b['y'])),(a['id'],b['id'])
assert 8*600<=5200 and 700+1350+2*75==2200 and 8240-6900==1340
checks={'revision':'E','dxf_audit_errors':len(audit.errors),'dxf_audit_fixes':len(audit.fixes),'units':'millimetres','clear_box_m2':area,'rear_plus_office_m2':boh,'rear_plus_office_pct':round(100*boh/area,2),'entities':len(ms),'scheduled_fixture_count':len(fixtures),'scheduled_fixtures_fit_and_do_not_overlap':True,'cold_room_section_sums_mm':2200,'eight_doors_fit':True,'rear_cross_aisle_mm':1340,'gameplay_tested':False}
(ROOT/'Sakura-CAD-Checks.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks))

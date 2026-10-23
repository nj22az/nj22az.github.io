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
 txt(W-70*mm,12*mm,f'JW-SAK-CAD-{page:02d} / Rev C',8)
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

# Coordinates: mm, source floor front-left (0,0), depth towards rear.
FLOOR=[(0,0),(13600,0),(13600,7830),(12500,7830),(12500,10660),(1100,10660),(1100,7830),(0,7830)]
fixtures=[]
def fixture(d,id,name,x,y,w,h,layer='FIXTURES',fill='#edf2eb',label=True):
 d.rect(x,y,w,h,layer,fill);fixtures.append(dict(id=id,name=name,x=x,y=y,w=w,d=h))
 if label:d.label(x+w/2,y+h/2,name)

header('A new shop within the existing exterior','01 / Ground-floor plan 1:60 at A3, print at 100%  |  All dimensions in mm  |  Front faces Main Street')
d=Drawing(25*mm,59*mm,60)
# Exterior guide: nominal frontage/depth in live harbour/storefront source.
d.rect(-330,-170,14260,11000,'EXTERIOR')
d.poly(FLOOR,'FLOOR');d.label(6800,11200,'EXISTING EXTERIOR: 14,260 x 11,000 nominal span',8)
# Front glazing and central sliding door, kept on existing axis.
d.line(0,0,5850,0,'COLD');d.line(7750,0,13600,0,'COLD')
for a,b in [(5850,6800),(6800,7750)]:d.line(a,50,b,50,'COLD')
d.arrow([(6800,-800),(6800,950)]);d.label(6800,-1100,'MAIN STREET / EXISTING CENTRAL ENTRANCE',8)
d.dim((-330,-170),(13930,-170),-1450,'14,260 exterior guide')
d.dim((-330,-170),(-330,10830),-1050,'11,000 exterior guide',True)
# Back-of-house partition with a 1.0 m sliding stockroom door.
for x,w in [(0,9550),(10550,3050)]:d.rect(x,7710,w,120,'WALLS',fill='#d8dedc')
d.line(9550,7770,10550,7770,'STAFF');d.label(10050,7520,'D2 1,000',6)
# WC and office walls, sliding entrances (no door sweep in circulation).
for x,y,w,h in [(2120,5450,120,2260),(0,5330,800,120),(1700,5330,540,120),(10960,5500,120,2210),(11080,5500,500,120),(12480,5500,1120,120)]:d.rect(x,y,w,h,'WALLS',fill='#d8dedc')
d.line(800,5390,1700,5390,'STAFF');d.line(11580,5560,12480,5560,'STAFF')
d.label(1200,7500,'STAFF WC',7);d.label(1200,7270,'2,000 x 2,260',6)
d.rect(400,6550,420,700,'FIXTURES','#f4f4ee');d.circle(610,7030,160,'FIXTURES')
d.rect(1470,6870,500,400,'COLD','#e5eff3');d.label(1715,6500,'basin',6)
d.label(12300,7470,'SHIFT OFFICE',7);d.label(12300,7250,'desk + secure cash',6)
d.rect(12880,5930,600,1100,'STAFF','#f1e8d7');d.circle(12420,6470,240,'STAFF');d.rect(11250,6940,450,500,'STAFF','#f1e8d7')
# Three short gondolas, 900 deep, 3 bays x 900; centre aisle is clear on door axis.
for id,name,x in [('G1','PANTRY',2400),('G2','SNACKS',4900),('G3','DAILY GOODS',7600)]:
 fixture(d,id,name,x,1900,900,2700,label=False)
 d.line(x+450,1900,x+450,4600)
 for yy in [2800,3700]:d.line(x,yy,x+900,yy)
 d.label(x+450,3250,name,7,angle=90)
d.dim((3300,4600),(4900,4600),4930,'1,600 aisle')
d.dim((5800,4600),(7600,4600),4930,'1,800 main aisle')
# Chilled wall, freezer, magazines, shop services and flowers.
fixture(d,'C1','FRESH FOOD',120,1900,850,3200,'COLD','#e3eff2',False);d.label(545,3500,'BENTO / ONIGIRI / MILK',6,angle=90)
fixture(d,'C2','DRINKS / BEER / DAIRY',4100,6910,4800,800,'COLD','#e3eff2')
for xx in range(4900,8900,800):d.line(xx,6910,xx,7710,'COLD')
fixture(d,'F1','ICE / FROZEN',2500,6500,1200,700,'COLD','#e3eff2')
fixture(d,'M1','MAGAZINES / NEWSPAPERS',1200,120,2700,450)
fixture(d,'S1','COPY / FAX',9100,120,700,600)
fixture(d,'P1','FLOWERS',11000,120,900,650)
fixture(d,'B1','BASKETS',5000,120,450,450,label=False);d.label(5225,850,'BASKETS',6)
# Checkout along east edge, with short walking route to worktop rather than reaching across it.
fixture(d,'T1','CHECKOUT',11100,1300,600,3000,'STAFF','#f1e8d7',False);d.label(11400,2800,'TILL / BAGGING / HOT CASE',6,angle=90)
fixture(d,'T2','BACK WORKTOP',12930,1300,550,3000,'STAFF','#f1e8d7',False);d.label(13200,2800,'MICROWAVE / HOT WATER / HAND BASIN',6,angle=90)
d.rect(11100,1500,600,600,'STAFF','#d5c7ab');d.label(11220,1840,'POS',6,angle=90)
d.circle(12050,1800,240,'STAFF');d.label(12240,1170,'THUAN',7)
for i,y in enumerate([2000,3000,4000]):d.circle(10400,y,240);d.label(10400,y+70,str(i+1),7)
d.label(9700,4200,'QUEUE',7)
d.arrow([(6800,1100),(10050,1100),(10400,1800)])
d.circle(6700,5550,750,'ROUTE',True);d.label(6700,5560,'1,500',6);d.label(6700,5300,'turning zone',6)
d.dim((11700,4300),(12930,4300),4720,'1,230 staff aisle')
d.dim((970,1900),(2400,1900),1650,'1,430')
# Rear stockroom, retained at Sakura. Full physical staircase inside reserved envelope.
d.rect(1100,7830,5220,2830,'STAFF',fill='#f7f2e9')
d.rect(6200,7830,120,120,'WALLS',fill='#d8dedc')
d.rect(6200,9050,120,1610,'WALLS',fill='#d8dedc')
d.label(6610,8530,'1,100',5)
d.label(8800,9500,'RECEIVING / STOCK / ARCHIVE',7)
d.label(8800,9230,'Upper storage retained; no stock moved off site',6)
fixture(d,'R1','DRY STOCK',6500,9200,500,1340,'STAFF','#f1e8d7')
fixture(d,'R2','COLD BACKSTOCK',9200,10040,1400,500,'COLD','#e3eff2')
fixture(d,'R3','EMPTIES',11400,10040,800,500,'STAFF','#f1e8d7')
fixture(d,'R4','CHECK-IN',11680,8250,700,1200,'STAFF','#f1e8d7')
d.rect(6500,8150,600,800,'STAFF','#f1e8d7');d.label(6800,8520,'CART',6)
# Original exterior rear door is 0.9 m right of the central entrance axis.
rear_door_x=7700;d.line(rear_door_x-525,10660,rear_door_x+525,10660,'STAFF')
d.arrow([(rear_door_x,11250),(rear_door_x,8850),(10050,8850),(10050,7200)])
d.label(10100,11150,'REAR DELIVERY DOOR / 1,050',7)
# Full U stair: 24 risers, two flights, 11 goings each; upper/lower overlap only in section.
sx=1220;sy=7950;landing=1100;going=250;run=2750;top=1100
for yy in [sy,sy+1220]:
 d.rect(sx,yy,landing+run+top,1100,'STAFF')
 for i in range(12):d.line(sx+landing+i*going,yy,sx+landing+i*going,yy+1100,'STAFF')
d.line(sx,sy+1100,sx+1100,sy+1100,'STAFF')
d.arrow([(sx+landing+run-100,sy+550),(sx+landing+100,sy+550),(sx+550,sy+550),(sx+550,sy+1770),(sx+landing+run-100,sy+1770)],'STAFF')
d.label(3700,10380,'FULL U-STAIR / 24 RISERS / UP',6)
d.label(5350,8480,'FOOT',5);d.label(5350,9710,'TOP',5)
# Side notes and scale bar.
x=285*mm;y=H-52*mm
for title,body in [
 ('EXTERIOR IS THE LIMIT','Heavy outline = the existing 14.26 x 11.00 m nominal storefront span. It is not enlarged to fit furniture. The inset stepped floor retains the source 138.75 m2 footprint.'),
 ('A LEGIBLE SMALL SHOP','Three 2.7 m shelf runs; 1.43-1.80 m principal browsing aisles. Fresh food is easy to reach; drinks pull customers to the rear. The queue sits clear of the central entrance.'),
 ('THUAN CAN WORK HERE','Low 780 mm counter; 600 mm depth. Clear 1,230 mm work aisle and 1,200 mm opening around its rear end. Shift desk and cash safe stay nearby.'),
 ('SUPPORT ROOMS STAY','Ground floor: WC, shift office, receiving and stock. Upstairs: tea/meal corner, dedicated rest room, archive and decoration stores. No demolition or stock relocation.'),
 ('DRAWING STATUS','Proposed partitions: 120 mm. Fixture and aisle dimensions are design values. Actual avatar reach, camera movement, stock quantities and upstairs stair alignment require the next greybox check.')]:
 txt(x,y,title,9,True);y-=15;y=para(x,y,body,108*mm,9,13)-17
d.line(0,-2200,3000,-2200,'DIM')
for xx in range(0,3001,1000):d.line(xx,-2300,xx,-2100,'DIM');d.label(xx,-2500,f'{xx//1000} m',7)
txt(25*mm,29*mm,'Exterior outline aligned to the source floor for fit comparison; wall skins/eaves are excluded from nominal span.',7)
end()

header('Human-scale fittings and a complete stair','02 / Counter section and stair section  |  Dimensions in mm  |  Proposed working heights')
q=Drawing(40*mm,165*mm,20,dx=18000)
q.label(1420,1780,'A-A / CHECKOUT WORKING SECTION  1:20',10)
q.line(-200,0,2900,0,'EXTERIOR')
q.rect(0,0,600,780,'STAFF','#f1e8d7');q.label(300,400,'COUNTER',8)
q.rect(1830,0,550,780,'STAFF','#f1e8d7');q.label(2105,400,'WORKTOP',8)
q.rect(1830,780,500,350,'COLD','#e3eff2');q.label(2090,1240,'MICROWAVE',7)
q.rect(100,780,300,260,'STAFF','#e2dfd6');q.label(250,1150,'LOW POS',7)
q.line(1000,0,1000,770,'ROUTE');q.line(1000,770,960,1130,'ROUTE');q.circle(960,1270,135,'ROUTE');q.line(960,1130,720,920,'ROUTE');q.line(720,920,470,850,'ROUTE')
q.dim((0,0),(0,780),-120,'780',True)
q.dim((600,0),(1830,0),-210,'1,230 CLEAR')
q.dim((0,780),(600,780),1530,'600 COUNTER DEPTH')
q.label(1200,-510,'Figure is schematic: use the actual Thuan rig for final reach validation.',8)
x=285*mm;y=H-56*mm
for title,body in [('WORKING REACH','Keep scanner, cash drawer, bags and hot-case handle within a proposed 350 mm routine reach of the clerk-side edge. Thuan walks to the microwave and hand basin rather than reaching across the whole work aisle.'),('SHELVES','Gondolas: 900 mm overall depth, 1,400 mm top, four decks at 300 / 600 / 900 / 1,200 mm. Heavy rice and detergent low; daily-use goods below 1,200 mm. Wall chillers 800-850 mm deep; maximum case height 2,000 mm.'),('CEILING AND SERVICES','Proposed sales ceiling 2,700 mm, below the existing approximately 4,010 mm upper-floor level. Space above allows lighting, wiring and cooling services. Use flush fluorescent fittings, a tiled floor, cooler hum and restrained signage.'),('PERIOD AND OPERATIONS','1997: cash, receipt roll, telephone/fax, copier and phone cards. No smartphone checkout or modern self-service coffee tower. Packaged bento, onigiri and sandwiches; warm buns and microwave service at the staffed counter.')]:
 txt(x,y,title,9,True);y-=15;y=para(x,y,body,108*mm,9,13)-17
# Schematic full U stair section developed along travel line, compressed at 1:40.
s=Drawing(40*mm,50*mm,60,dx=18000,dy=5000)
s.label(4400,4950,'B-B / FULL STAIR, DEVELOPED SECTION  1:60',10)
rise=4010/24
pts=[(0,0),(1100,0)]
for i in range(12):
 xx=1100+i*250;pts.extend([(xx,(i+1)*rise),(xx+250,(i+1)*rise)])
# 12 risers have 11 going spaces before the landing; draw last tread as landing transition.
pts=[(0,0),(1100,0)]
for i in range(12):
 xx=1100+min(i,11)*250;pts.append((xx,(i+1)*rise))
 if i<11:pts.append((xx+250,(i+1)*rise))
pts.append((4950,2005))
for i in range(12):
 xx=4950+min(i,11)*250;pts.append((xx,2005+(i+1)*rise))
 if i<11:pts.append((xx+250,2005+(i+1)*rise))
pts.append((8800,4010))
for a,b in zip(pts,pts[1:]):s.line(*a,*b,'STAFF')
s.line(0,0,8800,0,'FLOOR');s.line(7700,4010,8800,4010,'EXTERIOR')
s.dim((0,0),(0,4010),-450,'4,010 floor to floor',True)
s.label(1800,-400,'12 RISERS',8);s.label(6100,-400,'12 RISERS',8)
s.label(4400,-830,'24 x 167.083 rise; 250 going; 1,100 clear flights and landings.',8)
s.label(4400,-1190,'Both flights, return landing, closed risers and rails exist; room change may still fade.',8)
txt(26*mm,24*mm,'Section is developed along the U-shaped route. Stairwell plan is 4,950 x 2,320; align both floor frames before modelling.',8)
end()

header('What Sakura needs, and why it is placed there','03 / Fixture schedule, operating brief and source record  |  Planning basis for the next modelling stage')
rows=[
 ('G1-G3','3 double-sided gondolas','900 x 2,700 each','Pantry; snacks; household goods. Low enough for counter sightlines.'),
 ('C1','Open fresh-food chiller','850 x 3,200','Bento, onigiri, sandwiches, milk and small chilled foods near the front.'),
 ('C2','Six-door cold cabinet','4,800 x 800','Tea, water, canned coffee, soft drinks, dairy and beer at the rear.'),
 ('F1','Chest freezer','1,200 x 700','Ice, frozen meals and packaged ice cream; lid needs clear opening space.'),
 ('T1','Staffed service counter','600 x 3,000; H780','Low till, bagging surface, hot case/bun steamer, stamps and ferry tickets.'),
 ('T2','Worktop and hygiene point','550 x 3,000; H780','Microwave, hot-water pot, hand basin, supplies; separate from the WC basin.'),
 ('M1 / S1','Magazine rack; copier/fax','2,700 x 450; 700 x 600','Window-side reading and practical neighbourhood services.'),
 ('P1 / B1','Flower display; baskets','900 x 650; 450 x 450','Sakura sells bouquets and everyday goods; keep the door and its sensors clear.'),
 ('R1-R4','Receiving and backstock','See editable floor plan','Count deliveries, date chilled goods, stage trolley, sort empties and cardboard.'),
 ('Office','Shift desk and secure cash','2,400 x 2,090 clear','Ledger, telephone, safe and staff belongings; short route back to the till.'),
 ('WC','Toilet and wash basin','2,000 x 2,260 clear','Staff sanitary provision; enclosed sliding entry from the shop.'),
 ('Upper','Tea, rest, archive, decorations','Existing upper outline retained','Keep all four previously requested support functions at Sakura; no stock moved away.')]
xx=[14*mm,40*mm,112*mm,175*mm]; yy=H-53*mm
for x,t in zip(xx,['ID','FITTING / SPACE','SIZE / BASIS','PURPOSE']):txt(x,yy,t,8,True)
yy-=7*mm
for row in rows:
 c.setStrokeColor(HexColor('#dce1df'));c.line(14*mm,yy+4*mm,W-14*mm,yy+4*mm)
 for i,(x,t) in enumerate(zip(xx,row)):para(x,yy,t,[24,70,61,230][i]*mm,8,10)
 yy-=12*mm
yy-=3*mm
left=14*mm;right=218*mm
txt(left,yy,'DESIGN LOGIC',9,True)
y=para(left,yy-15,'A customer enters on the existing centre line, picks up a basket, chooses fresh food or a short aisle, and pays without blocking the door. Three queue spots sit beside the till. A 1,500 mm turning zone is reserved behind the gondolas.',190*mm,9,13)
y=para(left,y-8,'Thuan opens and checks the cold stock, faces shelves, serves at the till, checks deliveries at the back and writes the shift ledger beside the counter. Tea and a lie-down remain available upstairs. No new staffing or hours are assumed.',190*mm,9,13)
y=para(left,y-8,'The three gondolas provide 64.8 linear metres of shelf edge at four decks (3 runs x 2 faces x 2.7 m x 4). This is fixture capacity, not proof that all existing retail, archive and decoration quantities fit.',190*mm,9,13)
txt(right,yy,'SOURCE AND VERIFICATION LIMITS',9,True)
y=para(right,yy-15,'Exterior: current main e15be1738e2e, harbour.js -> buildStorefront, span 14.26 x 11.00 m, central door 1.90 m. Side wall skins project beyond that nominal span; no nominal-span expansion is proposed. Floor: sakura-layout.js, 138.75 m2 stepped polygon.',187*mm,8,11)
y=para(right,y-7,'New Yokosuka: repository study new-yokosuka-lessons.md (19 Oct), DCBN store shell 8.03 x 4.23 m, 2.41 m ceiling; near-door counter 1.6 x 1.2 m and window rack 2.1 x 0.45 m. These are inherited research measurements, not fresh measurements in this session. The live viewer catalogue did not populate.',187*mm,8,11)
y=para(right,y-7,'Open PR #366 Rev B supplied the on-site support requirements. Open #364 models a complete staircase. Open #363 proposes Sakura alcohol consolidation; its future stock capacity must be reconciled. No PR is merged by this drawing.',187*mm,8,11)
y=para(right,y-7,'Next: 1:1 greybox against the actual exterior mesh, actual Thuan rig/reach, stock capacity, door and camera paths, both stair frames and shop save/service checks. Drawing clearances are geometric design values; no gameplay or physical-device acceptance is claimed.',187*mm,8,11)
txt(14*mm,27*mm,'References: github.com/brynnb/new-yokosuka  |  www.newyokosuka.com/asset-viewer/  |  github.com/nj22az/nj22az.github.io/pull/366',7)
end();c.save()
doc.saveas(ROOT/'Sakura-Konbini-CAD.dxf')
area=abs(sum(x*b-y*a for (x,y),(a,b) in zip(FLOOR,FLOOR[1:]+FLOOR[:1])))/2/1e6
assert abs(area-138.75)<.001
data={'revision':'C','date':'2026-10-23','units':'mm','basis_commit':'e15be1738e2e68c1f1ba323b9992dc89661751f4','exterior_nominal_span':[14260,11000],'exterior_guide_rect':[-330,-170,14260,11000],'guide_alignment':'Conservative fit comparison, not an exterior mesh survey; side wall skins/eaves excluded from nominal span.','floor_polygon':FLOOR,'floor_area_m2':area,'fixture_envelopes':fixtures,'stair':{'risers':24,'rise':4010/24,'going':250,'width':1100,'plan':[1220,7950,4950,2320]},'principal_aisles_mm':[1430,1600,1800],'staff_aisle_mm':1230,'counter_height_mm':780,'new_yokosuka_measurements':'Inherited repository study of 19 October; live catalogue unavailable in this session.'}
(ROOT/'Sakura-Konbini-Layout.json').write_text(json.dumps(data,indent=2))
audit=ezdxf.readfile(ROOT/'Sakura-Konbini-CAD.dxf').audit()
assert not audit.errors
assert doc.units==4
checks={'dxf_audit_errors':len(audit.errors),'dxf_audit_fixes':len(audit.fixes),'units':'millimetres','floor_polygon_area_m2':area,'entities':len(ms),'fixture_count':len(fixtures),'gameplay_tested':False}
(ROOT/'Sakura-CAD-Checks.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(checks))

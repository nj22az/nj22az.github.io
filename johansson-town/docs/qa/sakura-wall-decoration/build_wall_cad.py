from pathlib import Path
import json, csv, html, math
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT=Path(__file__).resolve().parent
C={'ink':'#263a3c','muted':'#657776','fixture':'#dfe5df','glass':'#e5f0f1','paper':'#fbfaf5','green':'#23634f','orange':'#b45d38','blue':'#3f6d83','clear':'#c17462','line':'#a9b6b1'}
items=[]
def item(i,wall,s,w,b,h,name,copy,material,why):
 items.append(dict(id=i,wall=wall,start_mm=s,width_mm=w,bottom_mm=b,height_mm=h,name=name,artwork_copy=copy,material=material,purpose=why,status='proposed',projection_mm=8))
item('N01','north_sales',3425,650,2310,160,'Staff rest door plate','休憩室','cream enamel / dark green print','Keep customers out of staff rest without obscuring the doorway.')
item('N02','north_sales',5400,4800,2400,240,'Beverage category header','酒・ソフトドリンク','blue painted fascia / cream print','Identify the rear drinks wall from the entrance; replace existing floating board.')
item('W01','west',1400,1400,2230,220,'Onigiri / sandwich header','おにぎり・サンドイッチ','green washable fascia','Breakfast and quick lunches nearest the front.')
item('W02','west',3000,1400,2230,220,'Bento header','お弁当','green washable fascia','Main meal category over its original products.')
item('W03','west',4600,1400,2230,220,'Noodles / salad header','麺・サラダ','green washable fascia','Chilled meal grouping, clear of the open case.')
item('W04','west',6200,1600,2230,220,'Milk / chilled drinks header','牛乳・チルド飲料','green washable fascia','Daily needs next to rear beverage circulation.')
item('E01','east',1450,594,1600,420,'J Coffee advertisement','J COFFEE','A2 landscape print / shallow frame','Reuse Sakura/J Coffee artwork near the microwave and hot-water service.')
item('E02','east',2700,850,1650,400,'Counter service board','宅配便・公共料金','cream board / dark green print','Explain the parcel and payment services already supported by the shop.')
item('E03','east',3900,650,1550,350,'Staff hygiene instruction','手洗い・清潔に','laminated washable print','Readable working reminder above the preparation area.')
item('E04','east',4800,1300,2300,180,'Tobacco cabinet header','たばこ','timber fascia / cream print','Label the retained cabinet without covering stock or its access.')
item('E05','east',6500,420,1300,594,'Office calendar','1997年10月','paper calendar / clip','Give Thuan a practical date reference beside the desk; calendar is dynamic.')
item('E06','east',7200,700,1500,500,'Office rota / delivery board','勤務表・納品予定','cork / timber frame','Use existing shop rota and delivery data, not arbitrary paperwork.')
item('E07','east',8500,1300,2050,220,'Receiving rack label','在庫・返品','cream washable board','Identify stock and returns over the rack; preserve loading clearance.')
item('S01','south',1000,594,1400,420,'J Coffee window poster','J COFFEE','A2 landscape print, inward facing','Reuse an existing brand; keep most of the shop window transparent.')
item('S02','south',4250,297,1400,420,'Flower service poster','お花あります','A3 portrait print, inward facing','Show Sakura now supplies flowers; no obsolete florist branding.')
item('S03','south',8300,900,1900,180,'Window service strip','宅配便・コピー','cream transparent-film lettering','Signpost services above the bins without covering the entrance.')
item('S04','south',8050,300,1250,210,'Opening-hours plate','営業時間','cream small plate','Print actual game hours from shop data; no invented 24-hour claim.')
item('R01','rear',12300,300,1800,300,'Receiving clock','CLOCK','original analogue clock','Delivery-time reference above returns; clear of rear door.')
item('R02','rear',2750,700,1300,600,'Staff rest noticeboard','スタッフ連絡','cork / cream paper','Retain archive and ordinary staff notices in the rest room.')
item('I01','office_south',11500,500,2280,150,'Shift office door plate','事務室','cream enamel / dark green print','Mark office on the solid west pier; do not cover the observation glazing.')

# Explicit centres and inward normals for direct Three.js placement.
for it in items:
 a=it['start_mm']+it['width_mm']/2;h=it['bottom_mm']+it['height_mm']/2
 wall=it['wall'];x,d,n=(a,8232,[0,0,1]) if wall=='north_sales' else (8,a,[1,0,0]) if wall=='west' else (13892,a,[-1,0,0]) if wall=='east' else (a,8,[0,0,-1]) if wall=='south' else (a,10632,[0,0,1]) if wall=='rear' else (a,6192,[0,0,1])
 it['cad_center_mm']=[x,d,h];it['three_center_m']=[round(x/1000-6.95,4),round(h/1000,4),round(3.91-d/1000,4)];it['three_inward_normal']=n

# One shared data schedule drives vector, PDF and CAD geometry.
data=dict(drawing='JW-SAK-DEC-01',revision='A',date='2026-10-23',source_commit='bdb7c824a21b3ac7ebe2947d269056545010999f',units='mm',exterior=[14260,11000],clear_interior=[13900,10640],ceiling_mm=2800,origin='SW internal floor corner; X east, depth north, height above finished floor',status='Design coordination proposal; decoration not yet placed in runtime',items=items)
(OUT/'Sakura-Wall-Decoration-Schedule.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
with (OUT/'Sakura-Wall-Decoration-Schedule.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=list(items[0]));writer.writeheader();writer.writerows(items)

pdfmetrics.registerFont(TTFont('DrawSans','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DrawBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
MM=72/25.4
pdf=canvas.Canvas(str(OUT/'Sakura-Wall-Decoration-CAD.pdf'),pagesize=(594*MM,420*MM))
pdf.setTitle('Sakura Shoten - Wall decoration CAD - Rev A')
class Sheet:
 def __init__(self,num,title):
  self.num=num;self.svg=[]
  self.rect(0,0,594,420,C['paper'],None)
  self.line(12,12,582,12,C['ink'],.4);self.line(12,392,582,392,C['ink'],.35)
  self.text(16,24,'SAKURA SHOTEN',7.4,C['ink'],True)
  self.text(16,33,title,3.8,C['muted'])
  self.text(578,23,'WALL DECORATION / REV A',3.2,C['green'],True,'end')
  self.text(578,32,f'23 OCT 2026   |   JW-SAK-DEC-0{num}',2.8,C['muted'],False,'end')
  self.text(16,401,'DESIGN COORDINATION  /  PROPOSED DECORATION  /  NOT CONSTRUCTION OR FIRE-CODE APPROVAL',2.6,C['muted'])
  self.text(578,401,f'A2 LANDSCAPE  |  PRINT 100%  |  {num} / 2',2.7,C['ink'],True,'end')
  self.text(16,409,'Fixed exterior 14,260 x 11,000  |  Clear interior 13,900 x 10,640  |  All dimensions mm; heights above finished floor.',2.6,C['muted'])
 def line(self,x,y,x2,y2,col=None,lw=.25,dash=False):
  col=col or C['ink'];self.svg.append(f'<line x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{lw}"'+(' stroke-dasharray="2,1.5"' if dash else '')+'/>')
  pdf.setStrokeColor(HexColor(col));pdf.setLineWidth(lw*MM);pdf.setDash([2*MM,1.5*MM] if dash else []);pdf.line(x*MM,(420-y)*MM,x2*MM,(420-y2)*MM)
 def rect(self,x,y,w,h,fill=None,stroke=None,lw=.2,dash=False):
  self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill or "none"}" stroke="{stroke or "none"}" stroke-width="{lw}"'+(' stroke-dasharray="2,1"' if dash else '')+'/>')
  pdf.setDash([2*MM,MM] if dash else []);pdf.setLineWidth(lw*MM)
  if fill:pdf.setFillColor(HexColor(fill))
  if stroke:pdf.setStrokeColor(HexColor(stroke))
  pdf.rect(x*MM,(420-y-h)*MM,w*MM,h*MM,fill=bool(fill),stroke=bool(stroke))
 def text(self,x,y,s,size=3,col=None,bold=False,anchor='start'):
  col=col or C['ink'];self.svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{col}" font-family="DejaVu Sans,sans-serif" font-weight="{700 if bold else 400}" text-anchor="{anchor}">{html.escape(s)}</text>')
  pdf.setFillColor(HexColor(col));pdf.setFont('DrawBold' if bold else 'DrawSans',size*MM)
  fun=pdf.drawRightString if anchor=='end' else pdf.drawCentredString if anchor=='middle' else pdf.drawString;fun(x*MM,(420-y)*MM,s)
 def dim(self,x,y,w,label):
  self.line(x,y,x+w,y,C['muted'],.17)
  for xx in [x,x+w]:self.line(xx,y-1.8,xx,y+1.8,C['muted'],.17);self.line(xx-.7,y+.7,xx+.7,y-.7,C['muted'],.17)
  self.text(x+w/2,y-1.6,label,2.5,C['muted'],anchor='middle')
 def finish(self):
  (OUT/f'Sakura-Wall-Decoration-0{self.num}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm" viewBox="0 0 594 420">'+''.join(self.svg)+'</svg>')
  pdf.showPage()

cad=ezdxf.new('R2010',setup=True);cad.styles.get('Standard').dxf.font='DejaVuSans.ttf';cad.dimstyles.get('EZDXF').dxf.dimtxt=90;cad.dimstyles.get('EZDXF').dxf.dimasz=70;cad.units=4;cad.header['$INSUNITS']=4
for name,color in [('EXISTING',8),('GLAZING',4),('PROPOSED',3),('KEEP_CLEAR',1),('DIMENSIONS',9),('TEXT',7)]:cad.layers.new(name,dxfattribs={'color':color})
ms=cad.modelspace()
def cr(x,y,w,h,layer):ms.add_lwpolyline([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],close=True,dxfattribs={'layer':layer})
def ct(x,y,t,h=90,layer='TEXT'):ms.add_text(t,dxfattribs={'height':h,'insert':(x,y),'layer':layer})
def elevation(sh,wall,title,x,base,length,cadorigin):
 scale=1/50
 sh.text(x,base-68,title,3.8,C['ink'],True);sh.text(x,base-61,'1:50  |  Coordinate elevation  |  ' + ('S to N' if wall in ['west','east'] else 'W to E'),2.6,C['muted'])
 sh.rect(x,base-56,length*scale,56,'#f6f2e8',C['ink'],.35)
 sh.line(x,base-56,x+length*scale,base-56,C['blue'],.3)
 sh.text(x+length*scale,base-58,'CEILING +2,800',2.4,C['blue'],anchor='end')
 sh.text(x+length*scale,base+4,'FFL +0',2.3,C['muted'],anchor='end');sh.dim(x,base+10,length*scale,f'{length:,}')
 ox,oy=cadorigin;cr(ox,oy,length,2800,'EXISTING');ct(ox,oy+3300,title,150)
 def obj(s,w,b,h,label='',glass=False,clear=False):
  fill=C['glass'] if glass else C['fixture'];stroke=C['clear'] if clear else C['line']
  sh.rect(x+s*scale,base-(b+h)*scale,w*scale,h*scale,fill,stroke,.2,clear)
  if label:sh.text(x+(s+w/2)*scale,base-(b+h/2)*scale+1,label,2.3,C['muted'],anchor='middle')
  cr(ox+s,oy+b,w,h,'KEEP_CLEAR' if clear else 'GLAZING' if glass else 'EXISTING')
 if wall=='north_sales':
  obj(3300,900,0,2100,'REST',clear=True);obj(5200,5200,0,2500,'',glass=True)
  for s in range(5400,10200,600):obj(s,590,210,2000,'',glass=True)
  obj(10400,3500,0,2100,'SERVICE DEPTH / OFFICE BEYOND',clear=True)
  sh.text(x+157,base-28,'8 REACH-IN DOORS',2.5,C['blue'],anchor='middle')
 elif wall=='west':
  obj(1200,7040,0,2120,'OPEN CHILLER - NO POSTERS ON AIR INTAKE')
  for b in [520,870,1220,1570]:sh.line(x+24,base-b*scale,x+164.8,base-b*scale,C['line'],.18)
  obj(8240,2400,0,2600,'STAFF REST / WC BEYOND')
 elif wall=='south':
  for s,w in [(0,6000),(7900,6000)]:obj(s,w,400,1800,'',glass=True)
  obj(6000,1900,0,2200,'ENTRY',glass=True,clear=True)
  obj(0,5800,0,970,'MAGAZINES');obj(8200,1400,0,850,'BINS');obj(9700,600,0,1450);obj(10400,1000,0,950,'COPY');obj(11500,900,0,1500,'RESERVED',clear=True)
  sh.text(x+139,base-48,'ENTRANCE / DOOR TRACK: KEEP CLEAR',2.4,C['clear'],anchor='middle')
 elif wall=='east':
  obj(1400,4800,0,780,'WORKTOP +780');obj(1800,650,780,360);obj(2900,650,780,360)
  obj(4200,500,780,90);obj(4800,1300,1450,750,'TOBACCO')
  obj(6660,1100,0,720,'DESK');obj(8340,1700,0,1860,'STOCK RACK')
 for it in [i for i in items if i['wall']==wall]:
  s,w,b,h=[it[k] for k in ['start_mm','width_mm','bottom_mm','height_mm']]
  sh.rect(x+s*scale,base-(b+h)*scale,w*scale,h*scale,C['green'] if wall not in ['south'] else C['orange'],None)
  # IDs sit above the proposed rectangles; leaders preserve real artwork sizes.
  yy=base-(b+h)*scale-1.5
  sh.text(x+(s+w/2)*scale,yy,it['id'],2.5,C['green'],True,'middle')
  cr(ox+s,oy+b,w,h,'PROPOSED');ct(ox+s,oy+b+h+80,it['id'],95)
 ms.add_linear_dim(base=(ox,oy-450),p1=(ox,oy),p2=(ox+length,oy),dimstyle='EZDXF',dxfattribs={'layer':'DIMENSIONS'}).render()
 ms.add_linear_dim(base=(ox-600,oy),p1=(ox,oy),p2=(ox,oy+2800),angle=90,dimstyle='EZDXF',dxfattribs={'layer':'DIMENSIONS'}).render()
 return obj

s=Sheet(1,'Perimeter elevations - fixture constraints and proposed decoration')
elevation(s,'north_sales','01 / NORTH SALES BOUNDARY',16,130,13900,(0,0))
elevation(s,'west','02 / WEST WALL',326,130,10640,(18000,0))
elevation(s,'south','03 / SOUTH WINDOW FRONTAGE',16,245,13900,(0,-5500))
elevation(s,'east','04 / EAST WORK / OFFICE WALL',326,245,10640,(18000,-5500))
s.text(16,153,'N01 is on the existing rest-door head. N02 replaces the small floating drinks sign.',2.7,C['muted'])
s.text(326,153,'Canopy top +2,120. Header band +2,230 to +2,450.',2.7,C['muted'])
s.text(16,268,'Window graphic bounding boxes: 2.8% of the 12,000 x 1,800 glazed area. No new mullions.',2.7,C['muted'])
s.text(326,268,'Keep +780 worktops; no raised office floor or upper storey.',2.7,C['muted'])
s.line(16,281,578,281,C['line'])
s.text(16,293,'DRAWING RULES',3.4,C['ink'],True)
for y,t in zip([302,310,318,326,334,342],[
 '1  Grey: existing fixture envelope. Blue tint: glazing. Green / terracotta: proposed decoration.',
 '2  Red dashed areas remain clear: door leaves, movement openings and reserved service space.',
 '3  Reuse original Sakura / J Coffee / flower artwork and props. New category copy is original.',
 '4  Keep refrigeration fans, vents, door handles, sensors and shelf access free of decoration.',
 '5  Poster layer offsets: 8 mm nominal; frames 20 mm maximum. Verify face normals and no flicker.',
 '6  Drawings are a proposal against branch geometry, not proof that all assets are already relocated.']):s.text(16,y,t,2.8,C['muted'])
s.text(326,293,'FINISH PALETTE',3.4,C['ink'],True)
for y,color,title,desc in [(301,'#eee5cf','Warm cream','Retain the family-shop wall finish.'),(318,'#23634f','Sakura green','Category strips / cream lettering.'),(335,'#b08a5e','Warm timber','Original counter and shallow frames.'),(352,'#3f6d83','Drinks blue','One controlled rear-wall accent.')]:
 s.rect(326,y,12,10,color,None);s.text(343,y+4,title,3,C['ink'],True);s.text(343,y+9,desc,2.7,C['muted'])
s.text(16,364,'Height datum: finished floor +0. No wall decoration above +2,650. Ceiling remains +2,800.',3,C['blue'],True)
s.dim(16,378,100,'5,000 mm AT 1:50 - SCALE CHECK')
s.finish()

s=Sheet(2,'Decoration setting-out plan, placement schedule and staff-wall details')
# Plan is 1:50, north up. Coordinates originate at SW interior corner.
px,py=22,61;sc=.02
P=lambda x,d:(px+x*sc,py+(10640-d)*sc)
def pr(x,d,w,dep,label='',fill=None):
 xx,yy=P(x,d+dep);s.rect(xx,yy,w*sc,dep*sc,fill or C['fixture'],C['line'],.2)
 if label:s.text(xx+w*sc/2,yy+dep*sc/2+1,label,2.5,C['muted'],anchor='middle')
s.text(22,48,'05 / SETTING-OUT PLAN',3.8,C['ink'],True);s.text(22,55,'1:50  |  North up  |  Internal SW origin (0,0)',2.7,C['muted'])
pr(-180,-180,14260,11000,'','#f6f2e8');pr(0,0,13900,10640,'','#fbfaf5')
for args in [(0,1200,700,7040,'CHILLER'),(5200,8240,5200,2200,'DRINK COOLER'),(11400,6200,2500,2040,'OFFICE'),(0,8240,2400,2400,'WC'),(2400,8240,2800,2400,'REST'),(10400,8240,3500,2400,'RECEIVING'),(11300,1400,800,4800,''),(13300,1400,600,4800,''),(7700,2300,900,4500,'')]:pr(*args)
for x in [1850,3800,5750]:pr(x,2400,900,4500)
pr(6000,-180,1900,180,'',C['glass']);pr(10975,10640,1050,180,'',C['glass'])
for it in items:
 wall=it['wall'];a=it['start_mm'];w=it['width_mm'];i=it['id']
 if wall=='west':p,q=P(0,a),P(0,a+w);lx,ly=p[0]-5,(p[1]+q[1])/2
 elif wall=='east':p,q=P(13900,a),P(13900,a+w);lx,ly=p[0]+5,(p[1]+q[1])/2
 elif wall=='south':p,q=P(a,0),P(a+w,0);lx,ly=(p[0]+q[0])/2,p[1]+7
 elif wall=='rear':p,q=P(a,10640),P(a+w,10640);lx,ly=(p[0]+q[0])/2,p[1]-4
 elif wall=='north_sales':p,q=P(a,8240),P(a+w,8240);lx,ly=(p[0]+q[0])/2,p[1]+7
 else:p,q=P(a,6200),P(a+w,6200);lx,ly=(p[0]+q[0])/2,p[1]+6
 s.line(*p,*q,C['green'],.85);s.text(lx,ly,i,2.5,C['green'],True,'middle')
s.dim(px,285,278,'13,900 INTERNAL / 14,260 OUTSIDE')
s.text(22,295,'Entrance: 1,900 clear. Rear door: 1,050, centre X=11,500 (candidate proposal).',2.7,C['muted'])
# CAD plan in mm separate from elevations
ox,oy=0,-24000;cr(ox-180,oy-180,14260,11000,'EXISTING');cr(ox,oy,13900,10640,'EXISTING');ct(ox,oy+11700,'05 SETTING-OUT PLAN / NORTH UP',160)
for it in items:
 a,w=it['start_mm'],it['width_mm'];wall=it['wall']
 if wall in ['west','east']:x=0 if wall=='west' else 13900;pts=[(ox+x,oy+a),(ox+x,oy+a+w)]
 else:d={'north_sales':8240,'rear':10640,'south':0,'office_south':6200}[wall];pts=[(ox+a,oy+d),(ox+a+w,oy+d)]
 ms.add_lwpolyline(pts,dxfattribs={'layer':'PROPOSED'});ct(pts[0][0]+60,pts[0][1]+80,it['id'],85)
# Compact precise schedule
s.text(326,48,'PLACEMENT SCHEDULE',3.8,C['ink'],True)
s.text(326,55,'Start = X for N/S/R/I; depth from south for W/E. See JSON for copy and purpose.',2.5,C['muted'])
cols=[326,340,432,459,482,506,530];heads=['ID','ITEM','START','W','H','BASE','TOP']
s.rect(324,60,254,9,C['green'],None)
for x,h in zip(cols,heads):s.text(x,66,h,2.6,'#ffffff',True)
for j,it in enumerate(items):
 y=69+j*8.2
 if j%2==0:s.rect(324,y,254,8.2,'#edf0e9',None)
 vals=[it['id'],it['name'],str(it['start_mm']),str(it['width_mm']),str(it['height_mm']),str(it['bottom_mm']),str(it['bottom_mm']+it['height_mm'])]
 for x,v in zip(cols,vals):s.text(x,y+5.4,v,2.45,C['ink'],x==326)
s.text(326,243,'Artwork stays Japanese on physical signs; interaction UI stays English.',2.7,C['muted'])
s.text(326,251,'All dimensions are millimetres. Top = base + height. No product rescaling.',2.7,C['muted'])
s.text(326,259,'Existing 1997 equipment is retained; ATM bay remains a reservation.',2.7,C['muted'])
s.line(16,308,578,308,C['line'])
s.text(22,319,'06 / OFFICE OBSERVATION WALL',3.4,C['ink'],True)
s.text(22,326,'1:50  |  Depth 6,200 to 8,240  |  No posters over glazing',2.5,C['muted'])
s.rect(22,332,40.8,52,C['fixture'],C['ink']);s.rect(25,345,24,20,C['glass'],C['blue'])
s.text(69,345,'Glass: +950 to +1,950.',2.6,C['muted'])
s.text(69,354,'Keep view of till / entry.',2.6,C['muted'])
s.text(69,363,'I01: south solid pier.',2.6,C['muted'])
s.text(69,372,'Both doors: 1,100 clear.',2.6,C['muted'])
s.text(160,319,'07 / REAR INTERIOR WALL',3.4,C['ink'],True)
s.text(160,326,'1:100  |  W to E  |  Delivery door shown dashed',2.5,C['muted'])
s.rect(160,356,139,28,'#f6f2e8',C['ink'])
s.rect(269.75,363,10.5,21,C['glass'],C['clear'],dash=True)
for it in [i for i in items if i['wall']=='rear']:
 xx=160+it['start_mm']/100;yy=384-(it['bottom_mm']+it['height_mm'])/100
 s.rect(xx,yy,it['width_mm']/100,it['height_mm']/100,C['green']);s.text(xx+it['width_mm']/200,yy-1.5,it['id'],2.3,C['green'],True,'middle')
cr(18000,-14500,2040,2600,'EXISTING');cr(18150,-13550,1200,1000,'GLAZING');ct(18000,-11300,'06 OFFICE OBSERVATION WALL',150)
s.text(326,281,'IMPLEMENTATION ORDER',3.2,C['ink'],True)
for y,t in [(289,'1  Keep the measured shell; mark these IDs in the scene.'),(297,'2  Move the original artwork / props into their allocated rectangles.'),(319,'3  Replace duplicated category boards; do not stack old and new.'),(327,'4  Verify from entrance, queue, Thuận and phone cameras.'),(335,'5  Check doors, cold-air paths, sightlines and surface flicker.')]:s.text(326,y,t,2.7,C['muted'])
s.text(326,351,'R01 / R02: interior rear wall, X=12,300 / 2,750.',2.7,C['muted'])
s.text(326,359,'Neither overlaps rear delivery opening X=10,975 to 12,025.',2.7,C['muted'])
s.text(326,375,'Basis: Sakura rebuild branch bdb7c824; fixture envelopes from source.',2.6,C['muted'])
s.finish();pdf.save()
# Rear elevation adds the actual wall/decor relation in CAD at full size.
cr(18000,-22000,13900,2800,'EXISTING');cr(28975,-22000,1050,2100,'KEEP_CLEAR');ct(18000,-18700,'07 REAR INTERIOR WALL / W TO E',150)
for it in items:
 if it['wall']=='rear':cr(18000+it['start_mm'],-22000+it['bottom_mm'],it['width_mm'],it['height_mm'],'PROPOSED');ct(18000+it['start_mm'],-22000+it['bottom_mm']+it['height_mm']+80,it['id'])
# I01 office south plate also receives a dimensioned model rectangle.
cr(35000,0,2500,2600,'EXISTING');cr(35700,0,1100,2100,'KEEP_CLEAR');cr(35100,2280,500,150,'PROPOSED');ct(35100,2510,'I01',90);ct(35000,3300,'08 OFFICE SOUTH / X 11400 TO 13900',150)
cad.saveas(OUT/'Sakura-Wall-Decoration-CAD.dxf')

# Meaningful checks on the actual schedule, not just file existence.
limits={'north_sales':13900,'south':13900,'west':10640,'east':10640,'rear':13900,'office_south':13900}
assert len({i['id'] for i in items})==len(items)
for i in items:
 assert 0<=i['start_mm']<i['start_mm']+i['width_mm']<=limits[i['wall']],i['id']
 assert 0<i['bottom_mm']<i['bottom_mm']+i['height_mm']<=2650,i['id']
 assert i['bottom_mm']+i['height_mm']<2800,i['id']
for wall in limits:
 group=[i for i in items if i['wall']==wall]
 for j,a in enumerate(group):
  for b in group[j+1:]:
   assert not (max(a['start_mm'],b['start_mm'])<min(a['start_mm']+a['width_mm'],b['start_mm']+b['width_mm']) and max(a['bottom_mm'],b['bottom_mm'])<min(a['bottom_mm']+a['height_mm'],b['bottom_mm']+b['height_mm'])),(a['id'],b['id'])
assert all(i['start_mm']+i['width_mm']<=6000 or i['start_mm']>=7900 for i in items if i['wall']=='south')
assert all(i['bottom_mm']>2120 for i in items if i['wall']=='west')
assert not ezdxf.readfile(OUT/'Sakura-Wall-Decoration-CAD.dxf').audit().has_errors
(OUT/'validation.json').write_text(json.dumps({'decoration_count':len(items),'same_wall_overlaps':0,'all_below_ceiling':True,'west_chiller_clear':True,'front_entrance_clear':True,'dxf_audit_errors':0,'source_commit':data['source_commit']},indent=2)+'\n')
print('Created 2 A2 sheets, PDF, model-space DXF, SVGs and placement schedule;',len(items),'decoration IDs.')

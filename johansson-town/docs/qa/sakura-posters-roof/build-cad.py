"""Measured game-design coordination: PDF, editable DXF, shared schedule and self-audit."""
from pathlib import Path
from io import BytesIO
import json,math
import ezdxf
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3,landscape
from reportlab.lib.utils import ImageReader
P=Path(__file__).resolve().parent
D=json.loads((P/'design-rev-b.json').read_text());S=D['shell'];T=D['tank'];ST=D['stair'];R=D['roof']
WALL=json.loads((P/'retained-wall-placements.json').read_text())['items']
OUT=P/'Sakura-Posters-Exterior-Roof-CAD.pdf'
# Audit measurements before drafting/any construction. A clear failure stops output.
def overlap(a,b):return a[0]<b[0]+b[2]-1e-6 and a[0]+a[2]>b[0]+1e-6 and a[1]<b[1]+b[3]-1e-6 and a[1]+a[3]>b[1]+1e-6
for a in D['posters']:
 assert a['bottom']>=0 and a['bottom']+a['height']<=S['ceiling']
 assert (P/'assets'/a['asset']).is_file()
 for b in D['posters']:
  if a['id']<b['id'] and a['wall']==b['wall']:assert not overlap([a['start'],a['bottom'],a['width'],a['height']],[b['start'],b['bottom'],b['width'],b['height']])
 for b in WALL:
  if a['wall']!=b['wall']:continue
  start=(3.91-b['three_center_m'][2])*1000-b['width_mm']/2
  box=[start,b['three_center_m'][1]*1000-b['height_mm']/2,b['width_mm'],b['height_mm']]
  assert not overlap([a['start'],a['bottom'],a['width'],a['height']],box),(a['id'],b['id'])
assert math.isclose(ST['risers']*ST['rise'],S['roofLevel'],abs_tol=.001)
assert ST['flightRisers']*2==ST['risers'] and ST['flightGoings']*ST['going']==ST['flights'][0][3]
assert T['standTop']==S['roofLevel']+T['standHeight'] and T['top']==T['standTop']+T['bodyHeight']
assert D['serviceCurb']['top']<4360-25/2,'Scour pipe needs fall over the sleeve curb'
obstacles=[T['base'],R['equipmentReserve'],[9600,8150,700,700],[1650,9750,100,100]]
for a,b in zip(R['serviceWalk'],R['serviceWalk'][1:]):
 width=R['walkWidth'];rect=[min(a[0],b[0])-width/2,min(a[1],b[1])-width/2,abs(a[0]-b[0])+width,abs(a[1]-b[1])+width]
 for o in obstacles:assert not overlap(rect,o),('service walk',rect,o)
for id in ['OF','DR']:
 h=next(p for p in D['pipes'] if p['id']==id)['points'];assert all(a[2]>=b[2] for a,b in zip(h,h[1:])),id
assert ST['topLanding'][0]+ST['topLanding'][2]<S['delivery'][0]
for p in D['pipes']+D['branches']:
 for a,b in zip(p['points'],p['points'][1:]):assert sum(abs(a[i]-b[i])>1e-6 for i in [0,1])<=1,(p['id'],'diagonal plan pipe')
AUDIT={'drawing':D['drawing'],'revision':D['revision'],'source_commit':D['source_commit'],'status':'Geometric checks passed; physical/site dependencies below block runtime roof construction','checks':{'posters':4,'same_face_poster_and_retained_notice_overlaps':0,'poster_tops_below_ceiling':True,'stair_risers':22,'stair_total_rise':round(ST['rise']*22,3),'service_walk_width':1000,'walk_obstacle_overlaps':0,'delivery_door_clear_of_stair':True,'tank_height_and_sleeve_clearance':True,'overflow_and_drain_nonascending':True,'orthogonal_pipe_plan_routes':True},'corrected_findings':[{'issue':'Prototype stair levels did not match its step sequence','correction':'22 equal 182.273 mm rises, two flights of 11; 10 goings x 260 mm per flight'},{'issue':'Prototype stair crowded the rear delivery area','correction':'Separate west rear stair; delivery opening retained at X10975-12025'},{'issue':'200 mm tank pad did not leave enough space over a 300 mm roof sleeve upstand','correction':'350 mm level stand; outlet/drain above the 4310 sleeve top'},{'issue':'A service walkway near the rear edge or inspection steps would conflict','correction':'Rear walk at depth10140, west approach at X9000; 1000 mm clear width checked'}],'unverified':D['unverified'],'construction':'No runtime, exterior collision, stair traversal or plumbing implementation in this drawing pass'}
# Editable CAD: separate elevation drafting origins are documented in README.
doc=ezdxf.new('R2010');doc.units=4;m=doc.modelspace()
for n,c in [('EXISTING',8),('PROPOSED',3),('WATER_FILL',4),('WATER_SUPPLY',5),('OVERFLOW',30),('DRAIN',1),('KEEP_CLEAR',2),('TEXT',7),('PIPES_3D',6)]:doc.layers.new(n,dxfattribs={'color':c})
def cadrect(x,y,w,h,layer='EXISTING'):
 m.add_lwpolyline([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],close=True,dxfattribs={'layer':layer})
def ctext(s,x,y,h=90):m.add_text(s,dxfattribs={'height':h,'insert':(x,y),'layer':'TEXT'})
cadrect(*S['outside']);cadrect(*T['base'],'PROPOSED');cadrect(*T['serviceZone'],'KEEP_CLEAR');m.add_circle(T['center'],T['diameter']/2,dxfattribs={'layer':'PROPOSED'})
for b in ST['flights']+[ST['groundLanding'],ST['midLanding'],ST['topLanding']]:cadrect(*b,'PROPOSED')
for b in ST['flights']:
 for i in range(11):m.add_line((b[0],b[1]+i*260),(b[0]+1000,b[1]+i*260),dxfattribs={'layer':'PROPOSED'})
cadrect(*R['equipmentReserve'],'KEEP_CLEAR');m.add_lwpolyline(R['serviceWalk'],dxfattribs={'layer':'KEEP_CLEAR','const_width':1000})
for p in D['pipes']:
 layer={'CW-F':'WATER_FILL','CW-S':'WATER_SUPPLY','OF':'OVERFLOW','DR':'DRAIN','VT':'PROPOSED'}[p['id']]
 m.add_lwpolyline([(q[0],q[1]) for q in p['points']],dxfattribs={'layer':layer});m.add_polyline3d(p['points'],dxfattribs={'layer':'PIPES_3D'});ctext(p['id']+' DN'+str(p['dn']),p['points'][0][0]+90,p['points'][0][1]+70,65)
for p in D['branches']:m.add_polyline3d(p['points'],dxfattribs={'layer':'PIPES_3D'})
for x,y in R['drains']:m.add_circle((x,y),75,dxfattribs={'layer':'DRAIN'})
m.add_arc((2250,10640),1000,0,90,dxfattribs={'layer':'PROPOSED'});m.add_line((2250,10640),(2250,11640),dxfattribs={'layer':'PROPOSED'})
ctext('ROOF PLAN - SW INTERNAL ORIGIN / mm',0,-1100)
for name,ox,oy,length in [('SOUTH',0,-10000,14260),('NORTH',17000,-10000,14260),('WEST',0,-19000,11000),('EAST',17000,-19000,11000)]:
 cadrect(ox,oy,length,S['roofLevel']);m.add_line((ox,oy+S['wallTop']),(ox+length,oy+S['wallTop']),dxfattribs={'layer':'EXISTING'});ctext(name+' ELEVATION',ox,oy-600)
 if name=='SOUTH':
  for start,end in [(180,6180),(8080,14080)]:cadrect(ox+start,oy+400,end-start,1800)
  cadrect(ox+6180,oy,1900,2200)
 if name=='NORTH':cadrect(ox+11155,oy,1050,2100,'PROPOSED')
for p in D['posters']:
 ox=17000 if p['wall']=='east' else 0;cadrect(ox+p['start'],-27000+p['bottom'],p['width'],p['height'],'PROPOSED');ctext(p['id'],ox+p['start'],-27000+p['bottom']-120,60)
ctext('POSTER ELEVATIONS: WEST AT X0 / EAST AT X17000',0,-28000)
# Poster reference JPEGs remain editable linked images, not flattened CAD geometry.
for p in D['posters']:
 im=Image.open(P/'assets'/p['asset']).convert('RGB');name='CAD-'+p['id']+'.jpg';im.save(P/'assets'/name,'JPEG',quality=88,optimize=True)
 image=doc.add_image_def(filename='assets/'+name,size_in_pixel=im.size)
 ox=17000 if p['wall']=='east' else 0
 m.add_image(image,insert=(ox+p['start'],-27000+p['bottom']),size_in_units=(p['width'],p['height']))
for name,ox,oy,length in [('SOUTH',0,-10000,14260),('NORTH',17000,-10000,14260),('WEST',0,-19000,11000),('EAST',17000,-19000,11000)]:
 for u in range(0,length+1,1200):m.add_line((ox+u,oy+4010),(ox+u,oy+5110),dxfattribs={'layer':'PROPOSED'})
 m.add_line((ox,oy+5110),(ox+length,oy+5110),dxfattribs={'layer':'PROPOSED'})
 for u in range(0,length+1,100):m.add_line((ox+u,oy+4010),(ox+u,oy+5110),dxfattribs={'layer':'EXISTING'})
 center=11080 if name in ['SOUTH','NORTH'] else 8680
 cadrect(ox+center-600,oy+4360,1200,1200,'PROPOSED')
 for dx in [-400,400]:m.add_line((ox+center+dx,oy+4010),(ox+center+dx,oy+4360),dxfattribs={'layer':'PROPOSED'})
 m.add_line((ox+center+150,oy+5560),(ox+center+150,oy+5760),dxfattribs={'layer':'PROPOSED'})
 if name=='SOUTH':cadrect(ox,oy+2300,14260,500,'PROPOSED')
 if name=='NORTH':
  for u in [12780,13080,13160]:m.add_line((ox+u,oy+600),(ox+u,oy+3650),dxfattribs={'layer':'PROPOSED'})
  for u in [780,13380]:m.add_line((ox+u,oy),(ox+u,oy+4010),dxfattribs={'layer':'DRAIN'})
# Tank section: drawing origin (0,-36000); x is actual CAD x, y is height.
oy=-36000
cadrect(9900,oy+3860,2500,150);cadrect(10100,oy+4010,1600,350,'PROPOSED');cadrect(10300,oy+4360,1200,1200,'PROPOSED');cadrect(11500,oy+4010,200,300,'PROPOSED')
for p in D['pipes']:
 m.add_lwpolyline([(q[0],q[2]+oy) for q in p['points']],dxfattribs={'layer':'PROPOSED'})
ctext('TANK / PIPE SECTION - x actual, height offset -36000',9900,oy+6000)
# Exact equal-rise unfolded stair profile.
oy=-44000;x=1000;y=0
for f in range(2):
 for i in range(11):
  m.add_line((x,oy+y),(x,oy+y+ST['rise']),dxfattribs={'layer':'PROPOSED'});y+=ST['rise']
  if i<10:m.add_line((x,oy+y),(x+260,oy+y),dxfattribs={'layer':'PROPOSED'});x+=260
 if f==0:m.add_line((x,oy+y),(x+1000,oy+y),dxfattribs={'layer':'PROPOSED'});x+=1000
ctext('UNFOLDED STAIR - 22 EQUAL RISES / ROOF 4010',1000,oy+5400)

doc.layers.get('PIPES_3D').off();doc.saveas(P/'Sakura-Exterior-Roof-Posters.dxf');AUDIT['checks']['dxf_reopen_errors']=len(ezdxf.readfile(P/'Sakura-Exterior-Roof-Posters.dxf').audit().errors);assert AUDIT['checks']['dxf_reopen_errors']==0
(P/'audit.json').write_text(json.dumps(AUDIT,indent=2)+'\n')
# Review PDF: dimensioned vectors and reusable, compact raster poster art.
W,H=landscape(A3);C=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1);C.setTitle('Sakura Shoten | Posters, exterior, roof and water tank CAD');C.setAuthor('Johansson World')
INK='#234b41';MUTED='#68766d';CREAM='#f4efdf';STEEL='#9da9a5';RED='#b44735';TEAL='#42868a'
def col(h):return tuple(int(h[i:i+2],16)/255 for i in [1,3,5])
def fill(h):C.setFillColorRGB(*col(h))
def stroke(h):C.setStrokeColorRGB(*col(h))
def txt(s,x,y,size=10,color=INK,bold=False):fill(color);C.setFont('Helvetica-Bold' if bold else 'Helvetica',size);C.drawString(x,y,str(s))
def rect(x,y,w,h,color=None,edge=INK,lw=.6):
 if color:fill(color)
 stroke(edge);C.setLineWidth(lw);C.rect(x,y,w,h,fill=int(bool(color)),stroke=1)
def line(x,y,a,b,color=INK,lw=.7):stroke(color);C.setLineWidth(lw);C.line(x,y,a,b)
def dash(on=True):C.setDash(4,3) if on else C.setDash()
def poly(points,color=None,edge=INK,lw=.7):
 p=C.beginPath();p.moveTo(*points[0]);[p.lineTo(*v) for v in points[1:]];p.close();stroke(edge);C.setLineWidth(lw)
 if color:fill(color)
 C.drawPath(p,fill=int(bool(color)),stroke=1)
def circ(x,y,r,color=None,edge=INK):
 if color:fill(color)
 stroke(edge);C.circle(x,y,r,stroke=1,fill=int(bool(color)))
def title(n,t,sub):
 txt('SAKURA SHOTEN',38,H-35,10,bold=True);txt(t,38,H-66,25,bold=True);txt(sub,38,H-87,10,MUTED)
 line(38,H-101,W-38,H-101,INK,.6);txt(D['drawing']+' / Rev '+D['revision']+' / 23 OCT 2026',38,22,8,MUTED);txt(f'{n} / 9',W-70,22,9);txt('GAME COORDINATION CAD - PROPOSAL, NOT BUILT',W-350,H-35,8,RED)
def end():C.showPage()
def dim(x1,y1,x2,y2,label):
 line(x1,y1,x2,y2,TEAL,.5)
 if abs(y2-y1)<.1:
  for x in [x1,x2]:line(x,y1-4,x,y1+4,TEAL,.5)
  txt(label,(x1+x2)/2-len(label)*2.2,y1+6,9,TEAL)
 else:
  for y in [y1,y2]:line(x1-4,y,x1+4,y,TEAL,.5)
  txt(label,x1+7,(y1+y2)/2,9,TEAL)
def notes(items,x,y,width=65,step=16,size=10):
 import textwrap
 for s in items:
  for row in textwrap.wrap(s,width):txt(row,x,y,size);y-=step
  y-=7
 return y
IM={}
for p in D['posters']:
 im=Image.open(P/'assets'/p['asset']).convert('RGB');im.thumbnail((700,990));b=BytesIO();im.save(b,'JPEG',quality=67,optimize=True);IM[p['id']]=ImageReader(b)
def art(id,x,y,w,h):C.drawImage(IM[id],x,y,w,h,preserveAspectRatio=True,anchor='c',mask='auto')
# 1: full-colour campaign artwork.
title(1,'Small shop. Very loud posters.','Finished artwork / Kogane chips, Hamabe senbei and hot oden / A2 portrait 420 x 594 mm')
for i,p in enumerate(D['posters'][:3]):
 x=55+i*375;art(p['id'],x,180,330,467);txt(p['id']+'  '+p['title'],x,151,13,bold=True);txt('420 x 594 mm / matte paper / taped or framed',x,130,10);txt('No invented discounts or changed packaging.',x,110,10,MUTED)
end()
# 2: absurd glamour campaign.
title(2,'Tissue Diva','An adult fictional model makes ordinary facial tissues look absurdly luxurious.')
art('P04',75,105,415,587);txt('P04 / A2 / 420 x 594 mm',550,635,17,bold=True)
notes(['For onions. For heartbreak. For everything.','A straight-faced 1990s glamour advertisement for a real Sakura catalogue category: tissues.','Original adult model and illustrated onion. No real celebrity, medical claim, price or sale promise.','Proposed on the west wall near the front magazines, above their top and before the fresh-food chiller.','All four artworks were generated with the built-in image tool. Complete prompts and asset provenance are included with the drawing files.'],550,595,67,18,12)
end()
# 3: measured wall placement, retaining all 20 existing notices.
title(3,'Poster placement / measured wall elevations','A2 full artwork in the available wall zones / all heights above finished floor / units mm')
s=.092;ox=75;oy=440;rect(ox,oy,10640*s,2800*s,CREAM)
rect(ox+1400*s,oy,4800*s,780*s,'#bfaa88');txt('Back worktop +780',ox+1470*s,oy+40,9)
rect(ox+4800*s,oy+850*s,1300*s,550*s,'#d1d7cf');txt('48-slot dispenser',ox+4820*s,oy+1000*s,7)
rect(ox+6200*s,oy,2040*s,2600*s,'#e2e6df');txt('OFFICE / retained notices',ox+6300*s,oy+900*s,8)
for b in WALL:
 if b['wall']!='east':continue
 start=(3.91-b['three_center_m'][2])*1000-b['width_mm']/2;bottom=b['three_center_m'][1]*1000-b['height_mm']/2
 rect(ox+start*s,oy+bottom*s,b['width_mm']*s,b['height_mm']*s,'#ede3c9');txt(b['id'],ox+start*s+2,oy+(bottom+b['height_mm']/2)*s,6)
for p in D['posters'][:3]:
 art(p['id'],ox+p['start']*s,oy+p['bottom']*s,p['width']*s,p['height']*s);txt(p['id'],ox+p['start']*s,oy+p['bottom']*s-12,8,RED)
dim(ox,oy-25,ox+10640*s,oy-25,'10640 clear east wall');txt('EAST / south at left, north at right / 1:30.8 at A3',ox,oy+2800*s+16,10)
# West front detail.
s=.15;ox=95;oy=95;rect(ox,oy,1400*s,2000*s,CREAM);rect(ox,oy,550*s,1080*s,'#c6b28f');rect(ox+1200*s,oy,200*s,2000*s,'#cfdddd')
p=D['posters'][3];art('P04',ox+p['start']*s,oy+p['bottom']*s,p['width']*s,p['height']*s);txt('P04',ox+p['start']*s+70,oy+1700*s,9,RED);txt('WEST / front corner detail',ox,oy-20,10)
notes(['P01: depth 5000-5420 / height 1600-2194','P02: depth 5520-5940 / height 1600-2194','P03: depth 4050-4470 / height 2030-2624','P04: depth 300-720 / height 1300-1894','No poster overlaps a retained wall notice. All tops below +2800 ceiling. Door, observation glazing, chiller air path and price tickets remain protected.'],430,300,82,16,11)
end()
# 4: affine 3D coordination view; no invented game screenshot.
title(4,'Counter wall / combined effect','CAD axonometric with the actual poster artwork - a coordination view, not a game screenshot')
def q(x,d,h):return (75+(d-3000)*.20+(x-11300)*.10,100+(d-3000)*.025+(x-11300)*.045+h*.15)
poly([q(11000,3000,0),q(13900,3000,0),q(13900,6200,0),q(11000,6200,0)],'#ece8d9')
poly([q(13900,3000,0),q(13900,6200,0),q(13900,6200,2800),q(13900,3000,2800)],CREAM)
for b in WALL:
 if b['wall']!='east':continue
 start=(3.91-b['three_center_m'][2])*1000-b['width_mm']/2;bottom=b['three_center_m'][1]*1000-b['height_mm']/2
 if start<3000 or start+b['width_mm']>6200:continue
 poly([q(13900,start,bottom),q(13900,start+b['width_mm'],bottom),q(13900,start+b['width_mm'],bottom+b['height_mm']),q(13900,start,bottom+b['height_mm'])],'#e8dfc9');v=q(13900,start,bottom+40);txt(b['id'],*v,8)
for p in D['posters'][:3]:
 e,f=q(13900,p['start'],p['bottom']);C.saveState();C.transform(.20,.025,0,.15,e,f);art(p['id'],0,0,p['width'],p['height']);C.restoreState()
def block(x,d,w,l,h,y,color):
 poly([q(x,d,y),q(x,d+l,y),q(x,d+l,y+h),q(x,d,y+h)],color)
 poly([q(x,d,y+h),q(x+w,d,y+h),q(x+w,d+l,y+h),q(x,d+l,y+h)],'#bec8c0')
 poly([q(x,d+l,y),q(x+w,d+l,y),q(x+w,d+l,y+h),q(x,d+l,y+h)],'#a6b2a8')
block(13300,3000,600,3200,780,0,'#baa17d');block(13300,4800,600,1300,550,850,'#c8d0c7')
for row in range(4):
 for k in range(12):
  d=4835+k*103;y=905+row*110;poly([q(13299,d,y),q(13299,d+70,y),q(13299,d+70,y+85),q(13299,d,y+85)],['#ba573e','#386c58','#e9d9b0','#506e89'][k%4],lw=.3)
block(11300,3000,800,3200,780,0,'#d6bd96');block(11650,4800,450,600,100,780,'#9daaa5');block(11650,5400,450,350,580,780,'#c49776')

for i,t in enumerate(['Artwork sits above equipment; original service/hygiene notices and tobacco header are retained.','Realistic A2 poster sizes: 420 x 594 mm. The original product packaging stays intact.','Coordination drawing only; no runtime products, character reach, stock counts or collisions changed.']):txt(t,75,73-i*18,9)
end()
# 5: roof plan.
title(5,'Roof plan / tank, access and service route','Fixed 14260 x 11000 mm exterior / deck +4010 / one storey / roof-only stair')
s=.038;ox=75;oy=105
X=lambda x:ox+x*s;Y=lambda d:oy+d*s
rect(X(-180),Y(-180),14260*s,11000*s,'#f1eee3');rect(X(0),Y(0),13900*s,10640*s,None,STEEL)
# Open guards, with the one controlled gate left clear.
for a,b in [((-100,0),(-100,10640)),((13900,0),(13900,10640)),((0,-100),(13900,-100)),((0,10640),(2250,10640)),((3250,10640),(13900,10640))]:line(X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),INK,1.8)
for x,y,w,h in ST['flights']+[ST['groundLanding'],ST['midLanding'],ST['topLanding']]:rect(X(x),Y(y),w*s,h*s,'#d0d7d1')
for b in ST['flights']:
 for i in range(11):line(X(b[0]),Y(b[1]+i*260),X(b[0]+1000),Y(b[1]+i*260),INK,.4)
txt('UP',X(1260),Y(12600),8);txt('UP',X(2460),Y(12600),8);txt('+2005 landing',X(1150),Y(14800),7);txt('Gate',X(2300),Y(10550),7);C.arc(X(1250),Y(9640),X(3250),Y(11640),0,90);line(X(2250),Y(10640),X(2250),Y(11640),INK,.6)
x,y,w,h=T['serviceZone'];dash();rect(X(x),Y(y),w*s,h*s,None,TEAL);dash(False)
x,y,w,h=T['base'];rect(X(x),Y(y),w*s,h*s,'#b7c7c4');circ(X(10900),Y(8500),600*s,'#dce6df');circ(X(10500),Y(8500),225*s,None,INK)
rect(X(9800),Y(8150),500*s,700*s,'#d5c5a6');rect(X(9600),Y(8275),200*s,450*s,'#b5bdb7');txt('TANK',X(10450),Y(8500),8)
C.saveState();stroke('#d3ddd2');C.setLineWidth(1000*s);path=C.beginPath();path.moveTo(X(R['serviceWalk'][0][0]),Y(R['serviceWalk'][0][1]));[path.lineTo(X(v[0]),Y(v[1])) for v in R['serviceWalk'][1:]];C.drawPath(path);C.restoreState()
for a,b in zip(R['serviceWalk'],R['serviceWalk'][1:]):line(X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),TEAL,.8)
# Re-outline equipment after route band.
circ(X(10900),Y(8500),600*s,None,INK)
x,y,w,h=R['equipmentReserve'];dash();rect(X(x),Y(y),w*s,h*s,None,MUTED);dash(False);txt('AC reserve only',X(x+60),Y(y+430),7)
for p in D['pipes']:
 if p['id']=='VT':continue
 pts=p['points'];dash()
 for a,b in zip(pts,pts[1:]):line(X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),p['color'],1)
 dash(False)
for x,y in R['drains']:circ(X(x),Y(y),75*s,'#667b77');txt('RW',X(x)-5,Y(y)-15,7)
circ(X(1700),Y(9800),60*s,STEEL);txt('WC vent',X(1150),Y(9400),7)
line(X(10975),Y(10820),X(12025),Y(10820),RED,3);txt('Delivery door retained',X(10250),Y(11400),8,RED)
dim(X(-180),Y(-600),X(14080),Y(-600),'14260 outside');dim(X(-650),Y(-180),X(-650),Y(10820),'11000')
notes(['Tank: diameter1200 x body1200; level stand1600 x1600, raised350. Tank top +5560; vent +5760.','1000 mm service route from the roof gate, clear of tank support, inspection steps, WC vent and equipment reserve.','External stair: two 1000 mm clear flights, 22 equal rises, top +4010, midpoint +2005. Requires4600 mm rear-yard projection.','Roof drainage: indicative1:100 finish fall toward rear RW drains; separate emergency scupper.','Dashed coloured lines: concealed/plenum pipe routes, not pipe obstacles laid across the walking route.','No upstairs room, second-storey door or internal stair. The service stair stays outside.'],680,670,67,16,11)
notes(['AUDIT HOLD: rear-yard dimensions and actual town/exterior registration are not verified. Do not construct this stair in runtime until those dependencies are resolved.'],680,230,67,17,11)
end()
# 6: roof section and stair.
title(6,'Roof access / equal-rise stair and level tank stand','Unfolded stair section; use the plan for its U-turn / dimensions are proposal geometry, not code certification')
s=.105;ox=100;oy=155;x=0;y=0
line(ox-30,oy,ox+1000*s,oy,INK,1);x=1000
for flight in range(2):
 for i in range(11):
  ny=y+ST['rise'];line(ox+x*s,oy+y*s,ox+x*s,oy+ny*s,INK,1);y=ny
  if i<10:line(ox+x*s,oy+y*s,ox+(x+260)*s,oy+y*s,INK,1);x+=260
 if flight==0:line(ox+x*s,oy+y*s,ox+(x+1000)*s,oy+y*s,INK,1);x+=1000
line(ox+x*s,oy+y*s,ox+(x+1000)*s,oy+y*s,INK,1)
line(ox+1000*s,oy+1100*s,ox+3600*s,oy+3105*s,TEAL,1.4);line(ox+4600*s,oy+3105*s,ox+7200*s,oy+5110*s,TEAL,1.4)
line(ox+3600*s,oy+3105*s,ox+4600*s,oy+3105*s,TEAL,1.4);line(ox+7200*s,oy+5110*s,ox+8200*s,oy+5110*s,TEAL,1.4)
for xx in [3600,4600]:line(ox+xx*s,oy,ox+xx*s,oy+2005*s,STEEL,2)
for xx,yy in [(1000,0),(3600,2005),(4600,2005),(7200,4010),(8200,4010)]:line(ox+xx*s,oy+yy*s,ox+xx*s,oy+(yy+1100)*s,TEAL,1)
dim(ox+1000*s,oy-32,ox+3600*s,oy-32,'10 x 260 = 2600');dim(ox+4600*s,oy-32,ox+7200*s,oy-32,'10 x 260 = 2600');dim(ox-25,oy,ox-25,oy+4010*s,'4010')
txt('11 rises = 2005',ox+160*s,oy+2100*s,11);txt('11 rises = 2005',ox+4700*s,oy+4300*s,11)

for i,t in enumerate(['22 x 182.273 = 4010 mm. Two flights of 11 rises / 10 goings at 260; 1000 mm clear flights and landings.','Roof 4010 = wall 3860 + slab 150; ceiling 2800. Service void only. No upstairs room or internal stair.','Galvanised open steel treads/strings and 1100 guards. Gate opens toward external landing; U-turn is shown in plan.','350 mm tank stand clears the 4310 sleeve curb. Anchors, load path and 4600 mm rear-yard fit remain unverified.']):txt(t,75,110-i*20,10)
end()
# 7: tank piping, schematic scaled section plus route schedule.
title(7,'Tank piping / fill, supply, overflow, drain and vent','Domestic-water visual coordination only / nominal pipe diameters are placeholders, not hydraulic sizing')
ox=105;oy=175;s=.15
XX=lambda x:ox+(x-9900)*s;YY=lambda h:oy+(h-3800)*s
rect(XX(10100),YY(4010),1600*s,350*s,'#a3b4ad');rect(XX(10300),YY(4360),1200*s,1200*s,'#dce6df');rect(XX(11500),YY(4010),200*s,300*s,'#b6bfb5')
line(XX(10000),YY(4010),XX(12300),YY(4010),INK,1.2);txt('Roof +4010',XX(11770),YY(4010)+6,9)
line(XX(10300),YY(5560),XX(11500),YY(5560),INK,1);txt('Tank top +5560',XX(10300),YY(5560)+17,10)
for x in [10500,11300]:line(XX(x),YY(4010),XX(x),YY(4360),INK,1)
# Project the service connection points into a readable section; side offsets remain in schedule/DXF.
for id in ['CW-F','CW-S','OF','DR']:
 p=next(q for q in D['pipes'] if q['id']==id);h={'CW-F':5480,'CW-S':4440,'OF':5480,'DR':4345}[id];off={'CW-F':0,'CW-S':80,'OF':160,'DR':240}[id];x=11600+off
 line(XX(11450),YY(h),XX(x),YY(h),p['color'],1.8);line(XX(x),YY(h),XX(x),YY(3820),p['color'],1.8)
 ly=155-['CW-F','CW-S','OF','DR'].index(id)*14;line(XX(x),YY(3820),440,ly+3,p['color'],.6);txt(id+' DN'+str(p['dn']),450,ly,8,p['color'])
line(XX(11050),YY(5560),XX(11050),YY(5760),'#598369',2);line(XX(11050),YY(5760),XX(11150),YY(5760),'#598369',2);line(XX(11150),YY(5760),XX(11150),YY(5680),'#598369',2)
txt('Screened vent +5760',XX(10700),YY(5800),9);txt('350 mm support zone',XX(10200),YY(4120),9);txt('Flashed sleeve curb +4310',410,245,9);line(XX(11600),YY(4310),405,248,TEAL,.5)
notes(['CW-F DN25: rear meter/isolation at +600 -> concealed BOH plenum -> roof sleeve -> tank float inlet.','CW-S DN32: low tank outlet/isolation -> sleeve -> receiving manifold. Branches to staff washbasin, WC cistern and counter handwash.','OF DN50: screened overflow -> continuously descending dedicated route -> rear visible tundish/air gap.','DR DN25: low-point scour valve -> separate descending route -> visible air gap. No direct foul-waste connection.','VT DN50: downturned screened tank vent. Separate WC soil vent and DN75 rainwater downpipes.','Rear risers at X12600 /12900 /12980, outside north wall, clear of1050 delivery opening. All exposed lines get clamps; roof sleeves are flashed.'],600,670,75,17,11)
# Ground discharge schematic.
x=640;y=135;line(x,y+90,x,y+25,'#ce7c30',2);line(x+35,y+90,x+35,y+25,'#a95742',2);rect(x-10,y-15,60,20,'#d7dcd4');txt('Visible air gap',x+85,y+30,10);txt('Drain outfall to be verified',x+85,y+10,10)
notes(['Audit: all fill/supply roof-level connections sit inside the protected tank/curb zone. The walking route has no horizontal pipe crossing. Pipe routes in the PDF section are schematic projections; exact3D coordinates are in design.json and the DXF PIPES_3D layer.'],75,95,170,14,10)
end()
# 8-9: all four exterior elevations, preserving exterior mass/openings.
def elevation(name,x,y,scale,front=False,rear=False,side=False):
 length=14260 if not side else 11000;s=scale
 rect(x,y,length*s,3860*s,CREAM);rect(x,y+3860*s,length*s,150*s,'#b1bdb5')
 if front:
  for a,b in [(180,6180),(8080,14080)]:rect(x+a*s,y+400*s,(b-a)*s,1800*s,'#c7dadd')
  rect(x+6180*s,y,1900*s,2200*s,'#b6d0d1');line(x+7130*s,y,x+7130*s,y+2200*s,INK,.6)
  rect(x,y+2300*s,length*s,500*s,'#466d5a');txt('SAKURA SHOTEN',x+length*s*.38,y+2460*s,12,'#fff7de',True)
  for u in [1680,3180,4680,9580,11080,12580]:line(x+u*s,y+400*s,x+u*s,y+2200*s,INK,.5)
 if rear:
  rect(x+11155*s,y,1050*s,2100*s,'#b6c5ba');txt('Delivery',x+11000*s,y+2250*s,7);txt('Gate',x+2650*s,y+4600*s,6)
  for u,color in [(12780,'#297ca0'),(13080,'#ce7c30'),(13160,'#a95742')]:line(x+u*s,y+600*s,x+u*s,y+3650*s,color,1.2)
  for u in [780,13380]:line(x+u*s,y,x+u*s,y+4010*s,TEAL,1.4)
 # Open mesh guard, not an upper storey facade.
 for u in range(0,length+1,100):line(x+u*s,y+4010*s,x+u*s,y+5110*s,'#d0d7d1',.25)
 line(x,y+4560*s,x+length*s,y+4560*s,STEEL,.45)
 for u in range(0,length+1,1200):line(x+u*s,y+4010*s,x+u*s,y+5110*s,STEEL,.6)
 line(x,y+5110*s,x+length*s,y+5110*s,STEEL,.8)
 if not side:
  tx=x+(10900+180-600)*s;rect(tx,y+4360*s,1200*s,1200*s,'#dce6df');line(tx+750*s,y+5560*s,tx+750*s,y+5760*s,TEAL,1)
 else:
  tx=x+(8500+180-600)*s;rect(tx,y+4360*s,1200*s,1200*s,'#dce6df');line(tx+750*s,y+5560*s,tx+750*s,y+5760*s,TEAL,1)
 # Visible stand legs connect the tank to its roof support level.
 for u in [200,1000]:line(tx+u*s,y+4010*s,tx+u*s,y+4360*s,STEEL,1.5)
 if rear:
  for j,a in enumerate([1180,2430]):
   high=2005 if j==0 else 4010;rect(x+a*s,y,1000*s,high*s,None,STEEL)
   for i in range(1,12):
    h=i*ST['rise']+(0 if j==0 else 2005);line(x+a*s,y+h*s,x+(a+1000)*s,y+h*s,STEEL,.4)
 if side:
  line(x+11000*s,y,x+15800*s,y,STEEL,.6)
  for u,level in [(12000,4010),(14600,2005),(15600,2005)]:line(x+u*s,y,x+u*s,y+level*s,STEEL,1)
  off=x+(11820+180)*s
  for i in range(10):
   lo=(i+1)*ST['rise'];hi=4010-(i+1)*ST['rise']
   for h in [lo,hi]:line(off+i*260*s,y+h*s,off+(i+1)*260*s,y+h*s,STEEL,.55)
   line(off+i*260*s,y+(lo-ST['rise'])*s,off+i*260*s,y+lo*s,STEEL,.55)
   line(off+i*260*s,y+hi*s,off+i*260*s,y+(hi+ST['rise'])*s,STEEL,.55)
  line(off,y+1100*s,off+2600*s,y+3105*s,STEEL,.7);line(off,y+5110*s,off+2600*s,y+3105*s,STEEL,.7)
  line(x+10820*s,y+4010*s,x+12000*s,y+4010*s,INK,.8);line(off+2600*s,y+2005*s,off+3600*s,y+2005*s,INK,.8)

 txt(name,x,y-20,12,bold=True);dim(x,y-43,x+length*s,y-43,str(length)+' outside')
title(8,'Exterior / street front and rear service elevation','Existing exterior shell and centred entrance retained / roof tank and rear services coordinated')
elevation('SOUTH / MAIN STREET',70,430,.047,front=True);elevation('NORTH / DELIVERY AND ROOF ACCESS',70,85,.047,rear=True)
notes(['Single storey: wall3860 / roof4010 / lightweight guards5110 / tank5560 / vent5760.','Rear stair shown in projection; its full4600 mm yard extension is on the roof plan.','Cream/timber identity and1900 entrance retained. Front mullions are proposed frame subdivision, not new openings.'],940,430,34,15,10)
end()
title(9,'Exterior / west and east side elevations','No new side doors, upstairs windows or internal stair / north at right in both coordination views')
elevation('WEST / FRONT CORNER POSTER INSIDE',60,470,.04,side=True);elevation('EAST / COUNTER SIDE',60,110,.04,side=True)
notes(['Solid side-wall mass retained.','Stair beyond the rear is shown in side projection; the actual U-plan determines both flights.','Tank, pipe upstands, guards, drainage and delivery fit must be registered to the town exterior before runtime construction.'],870,490,43,17,11)
notes(['AUDIT STATUS','Poster/notice overlap: zero.','22 equal stair rises: checked.','1000 service walk: clear.','DXF reopen: zero errors.','Open: site fit, anchors/load path, hydraulic sizing and actual exterior registration.','This package does not change the game runtime or establish a usable fire escape.'],870,260,43,15,10)
end();C.save()
print(json.dumps({'pdf':str(OUT),'bytes':OUT.stat().st_size,'pages':9,'audit':AUDIT['checks']},indent=2))

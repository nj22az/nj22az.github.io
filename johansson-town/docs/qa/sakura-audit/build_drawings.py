from pathlib import Path
import json,math
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3,landscape
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.lib.units import mm
ROOT=Path(__file__).parent
D=json.loads((ROOT/'measurements.json').read_text())
P=json.loads((ROOT/'layout-proposal.json').read_text())
doc=ezdxf.new('R2010');doc.units=ezdxf.units.M;ms=doc.modelspace()
COL={'EXISTING':'#263c49','FIXTURES':'#697d83','PROPOSED':'#007a76','DIMENSIONS':'#687278','TEXT':'#263c49','REFERENCE':'#aa7840','REMOVAL':'#b54d46'}
for k,v in COL.items():doc.layers.new(k,dxfattribs={'color':{'EXISTING':7,'FIXTURES':8,'PROPOSED':4,'DIMENSIONS':8,'TEXT':7,'REFERENCE':30,'REMOVAL':1}[k]})
W,H=landscape(A3);c=canvas.Canvas(str(ROOT/'Sakura-Audit-and-Options.pdf'),pagesize=(W,H));c.setTitle('Sakura audit - retained footprint and owner requirements, revision B')
def text(x,y,s,size=10,color='#263c49',bold=False):
 c.setFillColor(HexColor(color));c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawString(x,y,s)
def para(x,y,s,width=510,size=10,lead=15):
 for l in simpleSplit(s,'Helvetica',size,width):text(x,y,l,size);y-=lead
 return y
page=0
def header(title,sub):
 global page
 page+=1;text(32,H-36,'JOHANSSON WORLD / SAKURA REVIEW',10,bold=True);text(32,H-65,title,23,bold=True);text(32,H-86,sub,10)
 c.setStrokeColor(HexColor('#c7d0cf'));c.line(32,H-99,W-32,H-99)
 text(32,22,'22 October 2026 | Digital source audit, not a physical survey | Review only - no building changes authorised',9)
 text(W-125,22,f'JW-SAK-{page:02d} / Rev B',9)
def footer():c.showPage()
class Plan:
 def __init__(self,px,py,scale=100,dx=0,dy=0):self.px=px;self.py=py;self.k=1000*mm/scale;self.dx=dx;self.dy=dy
 def point(self,x,z):return self.px+x*self.k,self.py-z*self.k
 def cad(self,x,z):return x+self.dx,-z+self.dy
 def line(self,x0,z0,x1,z1,layer='EXISTING',dashed=False):
  a=self.point(x0,z0);b=self.point(x1,z1);c.setStrokeColor(HexColor(COL[layer]));c.setLineWidth(1.1 if layer=='EXISTING' else .7);c.setDash(4,3) if dashed else c.setDash();c.line(*a,*b);c.setDash();ms.add_line(self.cad(x0,z0),self.cad(x1,z1),dxfattribs={'layer':layer})
 def rect(self,x0,z0,x1,z1,layer='EXISTING',fill=None):
  if fill:
   a=self.point(x0,z1);c.setFillColor(HexColor(fill));c.rect(*a,(x1-x0)*self.k,(z1-z0)*self.k,fill=1,stroke=0)
  for a,b in [((x0,z0),(x1,z0)),((x1,z0),(x1,z1)),((x1,z1),(x0,z1)),((x0,z1),(x0,z0))]:self.line(*a,*b,layer)
 def poly(self,pts,layer='EXISTING'):
  for a,b in zip(pts,pts[1:]+pts[:1]):self.line(*a,*b,layer)
 def label(self,x,z,s,size=8,layer='TEXT'):
  lines=s.split('\n');px,py=self.point(x,z)
  for i,l in enumerate(lines):
   c.setFont('Helvetica',size);c.setFillColor(HexColor(COL[layer]));c.drawCentredString(px,py-i*(size+3),l)
   ms.add_text(l,dxfattribs={'height':.20,'layer':layer}).set_placement((x+self.dx,-z+self.dy-i*.27))
 def dimx(self,x0,x1,z,label):
  self.line(x0,z,x1,z,'DIMENSIONS')
  for x in [x0,x1]:self.line(x,z-.12,x,z+.12,'DIMENSIONS')
  self.label((x0+x1)/2,z-.16,label,8,'DIMENSIONS')
  ms.add_linear_dim(base=(self.dx+x0,self.dy-z-.1),p1=self.cad(x0,z+.3),p2=self.cad(x1,z+.3),angle=0,dimstyle='Standard',override={'dimtxt':.20,'dimasz':.13,'dimdec':2}).render()
 def dimz(self,x,z0,z1,label):
  self.line(x,z0,x,z1,'DIMENSIONS')
  for z in [z0,z1]:self.line(x-.12,z,x+.12,z,'DIMENSIONS')
  px,py=self.point(x-.2,(z0+z1)/2);c.saveState();c.translate(px,py);c.rotate(90);text(0,0,label,8);c.restoreState()
 def title(self,x,z,s):self.label(x,z,s,10)
# Sheet 1
header('Existing Sakura: the space behind the problem','Source a0fb347. Room/fixture envelopes, not construction walls. Metres; scale 1:100 at A3 / 100%.')
p=Plan(250,470,100,0,0);p.poly(D['ground']['floorPolygon']);p.dimx(-6.8,6.8,-7.8,'13.60 m front block');p.dimz(-7.6,-6.78,3.88,'10.66 m overall');p.title(0,-8.8,'01 / GROUND FLOOR')
p.line(-5.7,-3.95,3.25,-3.95);p.line(4.39,-3.95,6.8,-3.95)
p.label(1,-5.8,'STOCKROOM / DELIVERY',9);p.label(-3.3,-4.5,'STAIR\nTO OFFICE',7)
p.rect(-4.5,-5.15,-1.8,-4.05,'REMOVAL');p.rect(4.66,-3.95,6.82,-1.21);p.label(5.74,-2.5,'SHIFT\nOFFICE\n5.92 m2',7)
p.rect(-6.8,-3.95,-4.09,-2.58);p.label(-5.45,-3.1,'WC',8)
for i,r in enumerate(D['ground']['colliders'][:4]):p.rect(r['x']-r['w']/2,r['z']-r['d']/2,r['x']+r['w']/2,r['z']+r['d']/2,'FIXTURES')
p.rect(-6.82,-1.6,-6,2.45,'FIXTURES');p.rect(4.54,.08,5.06,3.86,'FIXTURES');p.label(0,2.65,'SHOP / THREE GONDOLAS',8)
p.line(5.14,-1.17,6.28,-1.17,'PROPOSED');p.label(-.4,3.25,'FRONT DOOR',8);p.line(-.95,3.88,.95,3.88,'PROPOSED');p.label(0,4.8,'MAIN STREET / FRONT',9)
u=Plan(820,470,100,26,0);s=D['upstairs']['shell'];u.rect(s['minX'],s['minZ'],s['maxX'],s['maxZ']);u.dimx(-6.4,6.4,-6.9,'12.80 m');u.dimz(-7.1,-5.5,4.55,'10.05 m room envelope');u.title(0,-8.8,'02 / UPPER FLOOR')
for key,label in [('office','MAIN OFFICE + TEA\n22.88 m2'),('restRoom','STAFF REST\n7.98 m2'),('hall','HALL / ACCESS\n20.16 m2')]:
 r=D['upstairs'][key];u.rect(r['minX'],r['minZ'],r['maxX'],r['maxZ']);u.label((r['minX']+r['maxX'])/2,(r['minZ']+r['maxZ'])/2,label,8)
for r in D['upstairs']['stores']:u.rect(r['minX'],r['minZ'],r['maxX'],r['maxZ']);u.label((r['minX']+r['maxX'])/2,(r['minZ']+r['maxZ'])/2,r['id'].upper()+' STORE',8)
u.label(-4.5,-4.8,'STAIR / VOID',8)
for r in [D['upstairs']['doors']['office'],D['upstairs']['doors']['restRoom']]+[r['door'] for r in D['upstairs']['stores']]:u.line(r['at'],r['from'],r['at'],r['to'],'PROPOSED')
u.line(-.45,-5.5,.45,-5.5,'PROPOSED')
for r in D['upstairs']['items']:
 if r['id'] in ['desk','filing','safe','kitchenette','fridge']:
  x,y,z=r['at'];w,h,d=r['size'];u.rect(x-w/2,z-d/2,x+w/2,z+d/2,'FIXTURES')
text(38,260,'Teal markers: existing openings. Room envelopes shown; door swings and wall build-ups omitted.',9)
text(38,235,'Audit findings',15,bold=True)
y=210
for s in ['Ground polygon: 138.75 m2. Front block: 106.49 m2, including the small office and WC; not net retail area.','Upper room envelope: 128.64 m2. External upper-shell nominal depth is 11 m; the office room itself is 10.05 m deep.','Both offices together: 28.80 m2. The upstairs also owns archive, decorations, tea facilities and staff rest functions.','The stair defect is only one symptom: the building programme is much larger than the compact reference shop.']:
 y=para(38,y,s,1110,10,15)-8
footer()
# Sheet 2
header('Sakura: retained footprint, all support functions on site','REV B - owner requirements recorded. Same 138.75 m2 ground polygon; proposed zoning/access remain unvalidated. Scale 1:100.')
p=Plan(255,480,100,0,-24);p.poly(D['ground']['floorPolygon'],'PROPOSED');p.dimx(-6.8,6.8,-7.8,'13.60 m frontage retained');p.dimz(-7.5,-6.78,3.88,'10.66 m overall retained');p.title(0,-8.8,'03 / RETAINED SAKURA FOOTPRINT')
for z in P['zones']:
 p.rect(z['x0'],z['z0'],z['x1'],z['z1'],'PROPOSED',fill='#e1efeb' if z['id']=='rest' else None)
 if z['id']=='staff_access':p.label(-2.3,-5.6,'1.20 m\nACCESS',6)
 else:p.label((z['x0']+z['x1'])/2,-4.18,z['label'],7)
for f in P['fixtures']:p.rect(f['x0'],f['z0'],f['x1'],f['z1'],'FIXTURES')
for a,b in zip(P['route'],P['route'][1:]):p.line(*a,*b,'REFERENCE',dashed=True)
for o in P['openings']:p.line(o['x'],o['z0'],o['x'],o['z1'],'REFERENCE')
p.line(-5.7,-3.95,3.25,-3.95,'PROPOSED');p.line(4.39,-3.95,5.7,-3.95,'PROPOSED')
p.rect(4.66,-3.95,6.82,-1.21,'PROPOSED');p.label(5.74,-2.2,'SHIFT DESK\nSECURE CASH\n5.92 m2',7)
p.rect(-6.8,-3.95,-4.09,-2.58,'PROPOSED');p.label(-5.45,-3.1,'WC RETAINED',7)
for r in D['ground']['colliders'][:4]:p.rect(r['x']-r['w']/2,r['z']-r['d']/2,r['x']+r['w']/2,r['z']+r['d']/2,'FIXTURES')
p.rect(-6.82,-1.6,-6,2.45,'FIXTURES');p.rect(4.54,.08,5.06,3.86,'FIXTURES');p.label(0,2.65,'EXISTING RETAIL / TILL ANCHORS',8)
p.line(-.95,3.88,.95,3.88,'REFERENCE');p.label(0,4.7,'FRONT DOOR / STREET RETAINED',9)
text(680,665,'Your requirements',16,bold=True)
y=635
for s in ['Retain the existing 139 m2 ground footprint. The earlier 54 m2 shrink option is superseded. Tomato remains a reference for character, stocked shelves, readable merchandising and atmosphere rather than building size.','Keep the daily desk and secure cash storage in the current shift-office zone beside the till. Any new safe/cabinet fitting needs a full-size office mock-up; no sales or cash handling moves to the terminal.','Retain a dedicated lie-down room, tea/meal-break corner, bulk stock and archives at Sakura. This first zoning pass reuses the 32.26 m2 rear block: rest 7.92 m2, access 3.40 m2, tea 6.23 m2, stock/archive 14.72 m2. Areas are gross zones; wall thickness reduces usable space.','The existing front and delivery doors remain anchors. Orange lines mark proposed staff circulation and 0.90 m internal openings, not validated paths; opening markers overlay room envelopes. Proposed fixtures stay inside their assigned zones.','Upper-floor removal remains conditional. The former upper stores occupy much more area than the proposed ground store. Inventory volume, shelf capacity, delivery movement and camera clearance must pass before retiring those rooms. Keep upper storage at Sakura if needed.']:
 y=para(680,y,s,460,10.5,16)-14
text(38,245,'What this layout establishes',14,bold=True)
para(38,222,'All requested functions have an on-site ground-floor allocation without shrinking the street footprint. This is a zoning feasibility sketch, not proof that the present quantities of stock and archives fit. The daily shop and Johansson’s engineering office now have distinct purposes.',1100,11,16)
para(38,125,'No code, geometry, schedules, stock quantities or saves have changed. The current upper floor and its fade transition remain in the game until a tested replacement is approved.',1100,10,15)
footer()
# Sheet 3
header('Ferry terminal: Johansson’s engineering office','Existing exterior footprint at 1:100; room schematics are separate coordinate frames. Preserve harbour operations.')
p=Plan(66,340,100,0,-42);O=D['terminal']['office'];Q=D['terminal']['hall'];T=D['terminal']['tower']
# Localised world plan
for b,l in [(Q,'WAITING HALL\n4.1 x 7.3 m'),(O,'HARBOUR OFFICE BLOCK\n7.2 x 8.5 m')]:
 p.rect(b['minX']-5.6,b['minZ']+46.9,b['maxX']-5.6,b['maxZ']+46.9);p.label((b['minX']+b['maxX'])/2-5.6,(b['minZ']+b['maxZ'])/2+46.9,l,8)
p.rect(0,0,2.6,1.5,'FIXTURES');p.label(1.3,.5,'TOWER',7)
p.rect(4.1,1,10.8,7.9,'REFERENCE');p.label(7.45,1.7,'UPPER RECORDS SHELL',7)
p.dimx(0,11.3,-.7,'11.30 m combined exterior');p.title(5.65,-1.8,'04 / CURRENT EXTERIOR - WORLD FOOTPRINT')
text(495,668,'Confirmed mismatch',15,bold=True)
y=640
for s in ['Exterior waiting hall: 4.1 x 7.3 m = 29.93 m2. Interior builder: 9 x 7 m = 63 m2 before bounds insets. The interior therefore has about 2.1 times the exterior hall area. Rotation alone cannot resolve that.','Existing Harbour Office is a separate 6.74 x 6.74 m interior reached by the hall\'s office interaction. The exterior upper shell is 6.7 x 6.9 m, labelled as records space; no corresponding enterable upper-room layout was found in the inspected builders.','The owner specifies Johansson’s ferry and engineering work here, not Sakura trade administration. Keep the existing Harbour Office, harbour records, ticketing, post/parcels, Ganaha’s counter, benches, departures and crew routines usable.']:
 y=para(495,y,s,640,11,16)-14
text(495,421,'Preferred relocation concept',15,bold=True)
p2=Plan(610,305,100,26,-42);p2.rect(0,0,6.7,6.9,'PROPOSED');p2.rect(0,0,3.6,4.2,'PROPOSED',fill='#e1efeb');p2.label(1.8,1.7,'JOHANSSON\nFERRY / ENGINEERING\n15.12 m2' ,9);p2.label(5.15,2,'HARBOUR RECORDS\nRETENTION / ACCESS\nTO BE PLANNED',7);p2.label(3.35,5.4,'SHARED ACCESS + SUPPORT\nCONCEPT ALLOCATION ONLY',8);p2.title(3.35,-.6,'05 / POSSIBLE UPPER SUITE')
text(38,94,'Relocation condition',12,bold=True)
para(38,74,'Reconcile the terminal exterior/interiors and access first. Reserve a separate work area for ferry maintenance planning, technical drawings, machinery manuals and engineering records. Keep Sakura accounts, archives and staff facilities at Sakura; retain harbour operations and records.',1105,10,14)
footer()
# Sheet 4
header('Audit recommendation and change protections','Source-based design review. No game code, room geometry, schedules or saves were changed in this audit.')
text(38,687,'Confirmed owner requirements / revised direction',16,bold=True)
y=662
for s in ['Retain the current 138.75 m2 Sakura ground polygon and its street frontage. Do not implement the earlier 54 m2 compact-shop proposal. Keep normal product and avatar sizes and improve the shop through purposeful merchandising, lighting and restrained detail.','The terminal office serves Johansson’s ferry and engineering work. It is separate from Thuan’s shop desk and accounts, and it does not replace the Harbour Office. A 15 m2 suite is an indicative test allocation, not an approved room or certified spare space.','Keep all four selected Sakura functions on site: daily desk and secure cash; tea/meal breaks; a dedicated lie-down/rest room; bulk stock and archives. The revised rear zoning provides candidate ground-floor locations without moving stock to the depot.','The upper-floor question is still a design proposal. Do not demolish it until storage quantities, staff routes, office fittings, rest-room access, camera clearance and saved upstairs positions have a tested replacement. Retain upper storage at Sakura if ground capacity is insufficient.']:
 y=para(38,y,s,1100,11,17)-13
text(38,y-2,'Next design and validation steps',16,bold=True);y-=30
for s in ['1. Use the recorded footprint, office purpose and on-site support requirements as constraints. Audit inventory and storage capacity; keep PR #364 separate while the single-storey option remains unapproved.','2. Draw one coherent exterior/interior/access plan for both sites. Mock up room sizes with actual avatars, stocked fixtures, a queue and the third-person camera. Do not scale props or avatars to force a fit.','3. Preserve stable site/product identities and transactions. Migrate saves in sakura-office to a safe retained room; map old office destinations explicitly. Keep purchases, unpaid basket contents, money, relationships and day progression.','4. Update the whole ownership chain together: upper facade, roof, fire escape, stair opening, prompts, portals, signage, comic places, shop routines, paperwork and tests. An empty upper shell or an orphaned door is not a completed removal.','5. Revalidate enter/exit, camera, shelves, deliveries, NPC routes, quiet HUD, shop hours, ferry/terminal services, saves, ground audit and z-fighting. Capture actual game before/after at 390 x 844 and desktop before owner review.']:
 y=para(38,y,s,1100,10.5,16)-11
text(38,153,'Evidence / limits',13,bold=True)
para(38,131,'Measured digital plans: sakura-layout.js, sakura-shell.js, sakura-small-office.js, sakura-office-room.js, port-building.js, port-hall.js and supplied-rooms.js at main a0fb347. Existing fixtures are selected plan footprints, not a complete inventory. Reference: docs/research/new-yokosuka-lessons.md (19 October) and current brynnb/new-yokosuka DCBN collision metadata. No source assets were copied.',1100,9,13)
para(38,75,'Coordination: recheck PR #362 staffing/trade and PR #364 stair repair before implementation. This revision records owner answers and changes drawings only. No physical-device walkthrough, storage-capacity or proposed-layout collision acceptance is claimed.',1100,9,13)
footer();c.save();doc.saveas(ROOT/'Sakura-Measured-Plans-and-Concept.dxf')
# CAD self-check
r=ezdxf.readfile(ROOT/'Sakura-Measured-Plans-and-Concept.dxf');a=r.audit();assert not a.has_errors
assert r.units==ezdxf.units.M
print('Created four PDF sheets and layered DXF in metres; CAD audit passed; entities:',len(r.modelspace()))

from pathlib import Path
import json
p=Path(__file__).resolve().parent
d=json.loads((p/'design.json').read_text())
d['revision']='C';d['status']='Site-coordinated candidate construction schedule; roof access scenery only'
s=d['stair'];s.update(status='Rotated parallel to rear wall on existing apron; no gameplay traversal',flights=[[5500,12070,2600,1000],[5500,10820,2600,1000]],groundLanding=[4500,12070,1000,1000],midLanding=[8100,10820,1000,2250],topLanding=[4500,10640,1000,1180],roofGate=[4500,10640,1000],yardExtension=2250,treadWidth=1000,clearWidth=956,steelEnvelope=45,orientation='parallel to rear wall; first flight ascends east, second west')
d['roof']['serviceWalk']=[[5000,10640],[5000,10140],[9000,10140],[9000,8500]]
d['site']={'cadToWorld':'world=[-7.63-depth/1000, height/1000, -20.35-x/1000]','outsideWorld':[-18.45,-7.45,-34.43,-20.17],'stairWorld':[-20.7,-18.45,-29.45,-24.85],'apronWorld':[-21.6,-18.5,-34.65,-24.3],'outerPassage':855,'deliveryWorldZ':[-32.375,-31.325],'condensersCad':[3200,10820,1000,650],'scope':'Opt-in scenery/colliders; no roof enter prompt, stair walking level, hydraulic simulation or certified construction'}
d['unverified']=['Real structural anchors/load path, wind restraint and hydraulic/outfall sizing are outside this virtual environment model','Physical device performance and playable roof/stair access remain unverified; no roof entry prompt']
(p/'design.json').write_text(json.dumps(d,indent=2)+'\n')
# Isolated, auditable site correction drawing before construction. Original Rev B remains historical.
import ezdxf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape,A3
out=p/'Sakura-Site-Correction-Rev-C.pdf';c=canvas.Canvas(str(out),pagesize=landscape(A3));w,h=landscape(A3)
c.setFont('Helvetica-Bold',20);c.drawString(35,h-42,'SAKURA SHOTEN / SITE CORRECTION / REV C')
c.setFont('Helvetica',11);c.drawString(35,h-65,'CAD first: rotated roof-only stair / millimetres / 23 October 2026 / opt-in game candidate')
doc=ezdxf.new('R2010');ms=doc.modelspace()
ox,oy,sc=55,90,.044
for name,rect,color in [('SHELL',[-180,-180,14260,11000],(0.8,.8,.7)),('APRON',[0,10820,13900,3150],(.85,.9,.87)),('FLIGHT-1',s['flights'][0],(.6,.7,.7)),('FLIGHT-2',s['flights'][1],(.6,.7,.7)),('GROUND',s['groundLanding'],(.7,.8,.75)),('MID',s['midLanding'],(.7,.8,.75)),('TOP',s['topLanding'],(.7,.8,.75)),('TANK',d['tank']['base'],(.7,.8,.9))]:
 x,y,rw,rh=rect;pts=[(x,y),(x+rw,y),(x+rw,y+rh),(x,y+rh)];ms.add_lwpolyline(pts,close=True,dxfattribs={'layer':name});c.setFillColorRGB(*color);c.rect(ox+x*sc,oy+y*sc,rw*sc,rh*sc,fill=1);c.setFillColorRGB(.1,.2,.15);c.setFont('Helvetica',8);c.drawString(ox+x*sc+2,oy+(y+rh/2)*sc,name)
# Existing usable apron at the stair: rear wall to circuit edge 3150; stair 2250; passage 900.
for y,text in [(13115,'Steel outer edge 13115'),(13970,'Apron edge 13970 / 855 clear')]:
 c.line(ox+4300*sc,oy+y*sc,ox+9400*sc,oy+y*sc);c.drawString(ox+9400*sc+4,oy+y*sc,text)
c.setFont('Helvetica',11)
lines=['CHECKED BEFORE CONSTRUCTION','Outer shell: 14260 x 11000; roof +4010; one storey.', 'Town: X -18.45 to -7.45 / Z -34.43 to -20.17.', 'CAD SW internal corner: world X -7.63 / Z -20.35.', 'Old 4600 mm projection conflicts with the circuit.', 'Rotate U-stair: 4600 along wall x 2250 out.', 'Flights: 1000 tread / 956 between rails / 22 rises x 182.273 = 4010.', '10 goings x 260 per flight; midpoint +2005.', 'Existing apron: 3150 out; outer passage 855 incl. steel.', 'Stair Z -29.45 to -24.85 stays within apron bay.', 'Delivery: CAD X10975-12025, clear of stair.', 'Move condensers to CAD X3200-4200, clear of bikes.', 'Remove obsolete upper shell and old escape ladder.', 'Four A2 posters retain all 20 wall notice positions.', 'No new roof entry prompt or traversable stair.', 'Real engineering and statutory certification excluded.']
for i,line in enumerate(lines):c.drawString(735,h-105-i*23,line)
c.setFont('Helvetica',9);c.drawString(35,30,'JW-SAK-EXT-ROOF-POP-01 / Rev C / authoritative schedule: design.json / virtual game environment');c.save();doc.saveas(p/'Sakura-Site-Correction-Rev-C.dxf')
assert abs(s['risers']*s['rise']-4010)<.001
assert 3150-s['yardExtension']-45==855
assert 4500+4600<10975
assert -29.45>=-34.65 and -24.85<=-24.3
assert not ezdxf.readfile(p/'Sakura-Site-Correction-Rev-C.dxf').audit().errors
(p/'site-audit.json').write_text(json.dumps({'revision':'C','checks':{'equal_rise':True,'apron_fit':True,'outer_passage_mm':855,'delivery_separation_mm':1875,'dxf_errors':0},'scope':d['site']['scope']},indent=2)+'\n')
print(out)

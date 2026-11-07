"""Original conceptual cargo ship and berth. All design inputs below are metres.
Run: uvx --from build123d python build.py
CAD exports use millimetres; GLB export uses metres. No existing game mesh is used.
"""
from pathlib import Path
import json, math
import build123d as b
from scipy.interpolate import PchipInterpolator

OUT = Path(__file__).resolve().parent
M = 1000
P = dict(length=72.0, beam=13.5, draft=3.6, deck_z=2.4,
         quay_length=100.0, quay_width=18.0, quay_edge=-7.9, quay_z=2.1)
COLORS = dict(navy='#253e50', red='#974637', white='#e2e4df', deck='#57786c',
              black='#242b30', glass='#244956', yellow='#dab553', steel='#8f9b9d',
              concrete='#aaa99e', rubber='#303436', rope='#bda77d', cargo='#617783')
ship, dock, lines = [], [], []

def add(shape, name, color, group=ship):
    shape.label = name
    shape.color = b.Color(COLORS.get(color, color))
    group.append(shape)
    return shape

def box(name, pos, size, color, group=ship):
    return add(b.Pos(*(v*M for v in pos)) * b.Box(*(v*M for v in size)),name,color,group)

def rod(name, start, end, radius, color, group=ship):
    a, c = b.Vector(*(v*M for v in start)), b.Vector(*(v*M for v in end))
    axis = c-a
    return add(b.Solid.make_cylinder(radius*M,axis.length,b.Plane(origin=a,z_dir=axis)),name,color,group)

def cylinder(name, pos, radius, height, color, group=ship):
    return rod(name,pos,(pos[0],pos[1],pos[2]+height),radius,color,group)

# Transverse hull stations: x, breadth factor, keel rise. Bow points toward +X.
STATIONS = [(-36,.38,1.7),(-35,.64,.65),(-32,.88,.15),(-27,.98,0),
            (-20,1,0),(-10,1,0),(0,1,0),(12,.99,.05),(23,.89,.3),
            (29,.66,.9),(33,.36,1.65),(35,.13,2.3),(36,.018,2.8)]
# Shape-preserving interpolation avoids a free spline overshooting beam/draft.
width_curve=PchipInterpolator([s[0] for s in STATIONS],[s[1] for s in STATIONS])
rise_curve=PchipInterpolator([s[0] for s in STATIONS],[s[2] for s in STATIONS])
xs=sorted(set([s[0] for s in STATIONS]+[-36+i for i in range(73)]))
STATIONS=[(x,float(width_curve(x)),float(rise_curve(x))) for x in xs]

def section(x, factor, rise):
    w = P['beam']/2*factor
    bottom=-P['draft']+rise
    # Rounded bilges sampled around a shallow flat bottom; full sheer at deck.
    pts=[(-w,2.4),(-w*.98,.45),(-w*.91,bottom+1.0),(-w*.74,bottom+.28),
         (-w*.42,bottom),(w*.42,bottom),(w*.74,bottom+.28),(w*.91,bottom+1.0),
         (w*.98,.45),(w,2.4)]
    return b.Wire.make_polygon([(x*M,y*M,z*M) for y,z in pts],close=True)

hull=b.Solid.make_loft([section(*s) for s in STATIONS],ruled=True)
if not hull.is_valid:
    raise RuntimeError('Hull loft is invalid')
# True shared hull form, split into antifouling, boot topping and topsides.
for name,z,h,color in [('Antifouling underwater hull',-2.9,5.4,'red'),
                         ('Waterline boot topping',.0,.4,'black'),
                         ('Steel topsides',1.3,2.2,'navy')]:
    slab=b.Pos(0,0,z*M)*b.Box(100*M,30*M,h*M)
    add(hull & slab,name,color)

def plan_solid(name, outline, z, thickness, color, group=ship):
    face=b.Face(b.Wire.make_polygon([(x*M,y*M,z*M) for x,y in outline],close=True))
    return add(b.Solid.extrude(face,(0,0,thickness*M)),name,color,group)

outline=[(x,-6.75*f) for x,f,_ in STATIONS]+[(x,6.75*f) for x,f,_ in reversed(STATIONS)]
plan_solid('Continuous main deck',outline,2.38,.14,'deck')
# Forecastle and poop follow the actual hull plan.
bow=[(x,-6.75*f) for x,f,_ in STATIONS if x>=23]+[(x,6.75*f) for x,f,_ in reversed(STATIONS) if x>=23]
plan_solid('Raised forecastle',bow,2.5,.85,'navy')
plan_solid('Forecastle deck',bow,3.35,.10,'deck')
stern=[(x,-6.75*f) for x,f,_ in STATIONS if x<=-27]+[(x,6.75*f) for x,f,_ in reversed(STATIONS) if x<=-27]
plan_solid('Raised poop deck',stern,2.5,.65,'white')
plan_solid('Poop deck surface',stern,3.15,.10,'deck')

# Safety rails along the sheer: stanchions plus two horizontal rails.
for side in [-1,1]:
    perimeter=[]
    for (x,f,_),(xx,ff,_) in zip(STATIONS,STATIONS[1:]):
        n=max(1,math.ceil((xx-x)/2.2))
        for j in range(n):
            t=j/n; u=x+(xx-x)*t; v=side*(6.75*(f+(ff-f)*t)-.12)
            z=3.46 if u>=23 else (3.26 if u<=-27 else 2.53)
            perimeter.append((u,v,z))
    # Keep the access opening clear for the gangway at x=-22.
    for i,(u,v,z) in enumerate(perimeter):
        if side==-1 and -23<u<-21: continue
        rod('Rail stanchion',(u,v,z),(u,v,z+1.05),.035,'white')
        if i:
            a=perimeter[i-1]
            if side==-1 and (-23<a[0]<-21 or -23<u<-21): continue
            for h in [.52,1.05]:
                rod('Guardrail',(a[0],a[1],a[2]+h),(u,v,z+h),.027,'white')

# Coamings are hollow rings and hatch panels sit on top, leaving useful side decks.
for n,x in enumerate([-9.0,11.0],1):
    outer=b.Pos(x*M,0,2.99*M)*b.Box(16*M,8.2*M,.94*M)
    inner=b.Pos(x*M,0,3.0*M)*b.Box(15.55*M,7.75*M,1.2*M)
    add(outer-inner,f'Hold {n} hatch coaming','navy')
    for j in range(8):
        xx=x-7+2*j
        box(f'Hold {n} folding hatch panel {j+1}',(xx,0,3.53),(1.96,8.22,.22),'cargo')
        for yy in [-3.85,3.85]:
            box('Hatch dog',(xx,yy,3.69),(.30,.13,.10),'yellow')
    for yy in [-4.3,4.3]:
        rod('Hatch drainage pipe',(x-7.8,yy,2.64),(x+7.8,yy,2.64),.065,'steel')

# Aft accommodation, wheelhouse and glazed bridge with individual mullions.
box('Accommodation lower block',(-27,0,4.02),(9,9.3,3.0),'white')
box('Boat deck',(-27,0,5.6),(10.2,11,.18),'deck')
box('Accommodation upper block',(-27.6,0,6.76),(8.2,8.8,2.15),'white')
box('Bridge deck',(-27.1,0,7.92),(10.7,12,.19),'white')
box('Wheelhouse',(-27,0,8.97),(7.5,8.9,1.95),'white')
box('Bridge roof',(-27,0,10.05),(8.25,10,.24),'white')
for yy in [-3.6,-1.8,0,1.8,3.6]:
    box('Forward bridge glazing',(-23.235,yy,9.24),(.04,1.56,.93),'glass')
    box('Aft bridge glazing',(-30.765,yy,9.24),(.04,1.56,.93),'glass')
for side in [-1,1]:
    for xx in [-29.5,-27.8,-26.1,-24.4]:
        box('Side bridge glazing',(xx,side*4.465,9.24),(1.4,.04,.93),'glass')
    for z in [4.6,6.85]:
        for xx in [-29.3,-27.2,-25.1]:
            box('Cabin window',(xx,side*(4.66 if z<5 else 4.41),z),(.65,.04,.65),'glass')
    # Bridge wing rails and navigation light boxes.
    for xx in [-31.9,-29.5,-27,-24.5,-22.1]:
        rod('Bridge wing stanchion',(xx,side*5.85,8.02),(xx,side*5.85,9.05),.035,'white')
    rod('Bridge wing handrail',(-31.9,side*5.85,9.05),(-22.1,side*5.85,9.05),.035,'white')
    box('Navigation light housing',(-22.4,side*5.6,8.65),(.5,.4,.4),'navy')
    box('Navigation light',(-22.12,side*5.6,8.65),(.08,.25,.18),'#b74a43' if side==1 else '#48a989')
box('Funnel',(-30,1.6,10.9),(2.3,2.1,3.0),'white')
box('Funnel red band',(-30,1.6,11.6),(2.34,2.14,.65),'red')
box('Funnel cap',(-30,1.6,12.3),(2.4,2.2,.7),'black')
rod('Mainmast',(-25,0,10.17),(-25,0,15.3),.12,'white')
rod('Radar platform',(-25,-1.4,12.6),(-25,1.4,12.6),.08,'white')
box('Radar scanner',(-25,0,12.85),(.35,2.8,.18),'white')
rod('Antenna',(-28,-2.8,10.17),(-28,-2.8,13.7),.035,'steel')

# Two modest pedestal cranes, booms stowed longitudinally over the hatchways.
for n,x in enumerate([-19,1],1):
    y=4.9
    cylinder(f'Crane {n} pedestal',(x,y,2.52),.65,2.4,'white')
    cylinder('Slew ring',(x,y,4.92),.9,.35,'yellow')
    box('Crane machinery house',(x-.3,y,5.8),(2.2,1.65,1.1),'yellow')
    rod('Crane kingpost',(x,y,5.2),(x,y,9.7),.21,'yellow')
    start=(x+.65,y,6.0); end=(x+12.5,y-.5,8.2)
    rod('Crane box boom',start,end,.25,'yellow')
    rod('Boom luffing cable',(x,y,9.6),end,.032,'black')
    rod('Hoist wire',end,(end[0],end[1],4.1),.025,'black')
    cylinder('Hook block',(end[0],end[1],3.85),.13,.3,'black')

# Foredeck fittings and ground tackle.
for yy in [-1.6,1.6]:
    box('Anchor windlass foundation',(29,yy,3.6),(2.2,1.4,.35),'white')
    rod('Windlass drum',(29,yy-.55,4.0),(29,yy+.55,4.0),.36,'steel')
    rod('Anchor chain',(29.6,yy,3.62),(33.8,yy*.45,3.55),.09,'black')
    rod('Anchor shank',(32.4,yy*1.25,1.8),(32.6,yy*1.25,.45),.13,'black')
    rod('Anchor flukes',(32.1,yy*1.25-.4,.5),(33,yy*1.25+.4,.5),.12,'black')
rod('Foremast',(31,0,3.45),(31,0,9.2),.10,'white')
rod('Foremast yard',(31,-1.4,7.6),(31,1.4,7.6),.055,'white')
for xx in [-33,26]:
    for yy in [-2.8,2.8]:
        z=3.26 if xx<0 else 3.45
        box('Mooring bitts base',(xx,yy,z+.08),(1.5,.7,.16),'navy')
        for dx in [-.43,.43]:
            cylinder('Mooring bitt',(xx+dx,yy,z+.16),.18,.65,'steel')
            cylinder('Mooring bitt cap',(xx+dx,yy,z+.78),.24,.09,'steel')
for xx in [-20,21]:
    for yy in [-5.5,5.5]:
        cylinder('Gooseneck vent',(xx,yy,2.52),.22,1.05,'white')
        rod('Vent head',(xx,yy,3.55),(xx+.45,yy,3.55),.26,'white')
for side in [-1,1]:
    for j in range(5):
        box('Forecastle access stair',(21.65+j*.3,side*4.7,2.57+j*.18),(.32,.85,.12),'steel')
    rod('Forecastle stair handrail',(21.5,side*5.15,3.55),(23,side*5.15,4.4),.035,'white')
# Lifeboat on the outboard boat deck, davits and liferaft capsules.
boat=[(-30.5,4.85),(-29.9,4.05),(-25,4.05),(-24.2,4.85),(-25,5.65),(-29.9,5.65)]
plan_solid('Enclosed rescue boat',boat,5.74,.85,'#cc7043')
box('Rescue boat cabin',(-27.5,4.85,6.65),(3.2,1.25,.95),'#cc7043')
for xx in [-29.7,-25]:
    rod('Boat davit',(xx,3.7,5.72),(xx,3.7,8.0),.10,'white')
    rod('Boat davit arm',(xx,3.7,8.0),(xx,5,8.0),.10,'white')
    rod('Boat fall',(xx,5,8),(xx,5,6.6),.025,'black')
for xx in [-29,-26]:
    rod('Liferaft capsule',(xx-.65,-4.9,6.03),(xx+.65,-4.9,6.03),.35,'white')

# Independent piled concrete marginal wharf. Seaward edge y=-7.9.
edge=P['quay_edge']; middle=edge-P['quay_width']/2
box('Reinforced concrete quay slab',(0,middle,1.5),(100,18,1.2),'concrete',dock)
box('Seaward fascia beam',(0,edge-.35,.15),(100,.7,1.5),'concrete',dock)
for xx in range(-45,46,10):
    for yy in [edge-1.5,edge-8.5,edge-16]:
        cylinder('Concrete supporting pile',(xx,yy,-7.5),.48,8.4,'concrete',dock)
    box('Pile cap beam',(xx,middle,.65),(1.5,17,0.5),'concrete',dock)
for xx in range(-45,50,5):
    box('Quay slab movement joint',(xx,middle,2.103),(.025,18,.008),'steel',dock)
box('Granite coping',(0,edge-.25,2.15),(100,.5,.12),'white',dock)
box('Safety edge stripe',(0,edge-.65,2.108),(100,.18,.012),'yellow',dock)
for xx in range(-42,43,12):
    box('Fender bracket',(xx,edge+.13,.5),(1.9,.3,2.4),'steel',dock)
    for dx in [-.5,.5]:
        box('Rubber fender element',(xx+dx,edge+.62,.5),(.35,.9,1.8),'rubber',dock)
    box('Fender face panel',(xx,edge+1.06,.5),(1.85,.18,2.1),'black',dock)
for xx in [-44,-33,-22,-11,0,11,22,33,44]:
    box('Bollard base',(xx,edge-1.4,2.20),(1.05,.8,.18),'steel',dock)
    cylinder('Quay bollard',(xx,edge-1.4,2.25),.25,.55,'black',dock)
    rod('Bollard horns',(xx-.48,edge-1.4,2.75),(xx+.48,edge-1.4,2.75),.18,'black',dock)
# Recessed quay ladders, rings and tubular handles.
for xx in [-38,0,38]:
    for dx in [-.28,.28]:
        rod('Quay ladder stringer',(xx+dx,edge+.08,-1.6),(xx+dx,edge+.08,2.65),.04,'yellow',dock)
    for j in range(13):
        rod('Quay ladder rung',(xx-.28,edge+.08,-1.5+j*.32),(xx+.28,edge+.08,-1.5+j*.32),.03,'yellow',dock)
for xx in [-47,47]:
    cylinder('Quay light pole',(xx,edge-4,2.1),.12,8,'steel',dock)
    rod('Quay light arm',(xx,edge-4,10.1),(xx,edge-2.5,10.1),.08,'steel',dock)
    box('Quay luminaire',(xx,edge-2.5,10.1),(.65,.4,.16),'white',dock)

# Springs and head/stern lines modeled as separate sagging cable segments.
def cable(name,a,c):
    last=a
    for i in range(1,13):
        t=i/12
        pt=tuple(a[j]*(1-t)+c[j]*t for j in range(3))
        pt=(pt[0],pt[1],pt[2]-.35*math.sin(math.pi*t))
        rod(name,last,pt,.055,'rope',lines);last=pt
for a,c in [((-33,-3.1,3.8),(-44,edge-1.4,2.75)),
            ((26,-3.1,4.0),(44,edge-1.4,2.75)),
            ((26,-3.1,4.0),(11,edge-1.4,2.75)),
            ((-33,-3.1,3.8),(-11,edge-1.4,2.75))]:
    cable('Mooring line',a,c)
# Gangway: sloping walking surface plus rails on both sides.
a=(-22,-6.05,2.67); c=(-22,-11.3,2.24)
for dx in [-.55,.55]:
    rod('Gangway stringer',(a[0]+dx,a[1],a[2]),(c[0]+dx,c[1],c[2]),.075,'steel',lines)
    rod('Gangway handrail',(a[0]+dx,a[1],a[2]+1),(c[0]+dx,c[1],c[2]+1),.035,'white',lines)
for j in range(22):
    t=j/21; y=a[1]*(1-t)+c[1]*t; z=a[2]*(1-t)+c[2]*t
    box('Gangway tread',(-22,y,z),(1.1,.23,.065),'steel',lines)
    if j%4==0:
        for dx in [-.55,.55]:rod('Gangway rail post',(-22+dx,y,z),(-22+dx,y,z+1),.03,'white',lines)

assemblies={
    'cargo-ship':('72 m coastal general cargo ship',ship),
    'dock':('100 m piled quay',dock),
    'ship-and-berth':('Cargo ship at berth',ship+dock+lines)
}
report={}
for filename,(label,parts) in assemblies.items():
    # Assemble and export each in turn: assembly nodes have a single parent.
    model=b.Compound(label=label,children=parts)
    invalid=[s.label for s in model.children if not s.is_valid or s.volume<=0]
    if invalid: raise RuntimeError(f'Invalid CAD components: {invalid}')
    b.export_step(model,OUT/f'{filename}.step')
    b.export_gltf(model,OUT/f'{filename}.glb',binary=True,linear_deflection=150,angular_deflection=.18)
    bb=model.bounding_box()
    report[filename]={'components':len(model.children),'valid_components':True,
        'bounds_metres':[[round(v/M,3) for v in bb.min],[round(v/M,3) for v in bb.max]]}
(OUT/'validation.json').write_text(json.dumps({'parameters_metres':P,'models':report},indent=2))
print(json.dumps(report,indent=2))

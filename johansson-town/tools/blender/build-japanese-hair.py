"""Original Japanese salon-inspired shared avatar hair; no copied salon/game meshes.
Run Blender --background --python tools/blender/build-japanese-hair.py.
Coordinates use unit head radius, +z face. Collections retain editable parts.
"""
import bpy, math, json
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
styles={}; active=None
mat=bpy.data.materials.new('Recolourable hair');mat.diffuse_color=(.20,.13,.08,1)
def part(name,vs,fs,shade=1,kind='head'):
 vs=[[round(v,5) for v in p] for p in vs]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update()
 ob=bpy.data.objects.new(name,mesh);active.objects.link(ob);ob.data.materials.append(mat)
 for f in mesh.polygons:f.use_smooth=True
 styles[active.name].append(dict(name=name,kind=kind,shade=shade,vertices=vs,indices=[i for f in fs for i in f]))
def cap(front=.63,side=-.18,back=-.55,radius=1.065,parted=False):
 vs=[];fs=[];cols=40;rows=12
 for row in range(rows+1):
  for col in range(cols+1):
   phi=2*math.pi*col/cols;f=max(0,math.cos(phi));b=max(0,-math.cos(phi));edge=side+(front-side)*f+(back-side)*b
   if parted:edge+=.18*f*math.exp(-(math.sin(phi)/.15)**2)
   theta=.006+(math.acos(edge)-.006)*row/rows
   rr=radius+.014*math.cos(phi*12)*math.sin(theta)**2
   vs.append([rr*math.sin(theta)*math.sin(phi),rr*math.cos(theta),rr*math.sin(theta)*math.cos(phi)])
 for row in range(rows):
  for col in range(cols):a=row*(cols+1)+col;fs.extend([(a,a+cols+1,a+1),(a+1,a+cols+1,a+cols+2)])
 # Inward bottom lip closes the hairline against the scalp.
 for col in range(cols+1):vs.append([v*.94 for v in vs[rows*(cols+1)+col]])
 for col in range(cols):a=rows*(cols+1)+col;b=(rows+1)*(cols+1)+col;fs.extend([(a,a+1,b),(a+1,b+1,b)])
 part('Scalp shell',vs,fs,.92)
def lock(name,controls,radius=.1,depth=.65,shade=1.1,kind='head',blunt=False):
 vs=[];fs=[];steps=12;sides=8;ps=[Vector(p) for p in controls]
 def centre(t):return ps[0]*(1-t)**3+ps[1]*3*(1-t)**2*t+ps[2]*3*(1-t)*t*t+ps[3]*t**3
 for row in range(steps+1):
  t=row/steps;p=centre(t);tangent=(centre(min(1,t+.005))-centre(max(0,t-.005))).normalized();normal=tangent.cross(Vector((0,0,1)))
  if normal.length<.01:normal=tangent.cross(Vector((1,0,0)))
  normal.normalize();binormal=tangent.cross(normal).normalized()
  r=radius*(.8+.2*math.sin(math.pi*t))*(1 if blunt else max(.035,(1-t)**.35))
  for col in range(sides):
   a=2*math.pi*col/sides;vs.append(list(p+normal*(math.cos(a)*r)+binormal*(math.sin(a)*r*depth)))
 for row in range(steps):
  for col in range(sides):a=row*sides+col;b=row*sides+(col+1)%sides;c=a+sides;d=b+sides;fs.extend([(a,b,c),(b,d,c)])
 fs.extend([(0,i+1,i) for i in range(1,sides-1)]);base=steps*sides;fs.extend([(base,base+i,base+i+1) for i in range(1,sides-1)])
 part(name,vs,fs,shade,kind)
def fringe(mode='wispy',n=7):
 for i in range(n):
  x=(i-(n-1)/2)*(.14 if mode=='wispy' else .18);end=.36 if mode=='blunt' else .34+.08*abs(x)
  lock('Fringe %02d'%i,[(x*.7,.88,.58),(x,.70,.87),(x+.035,.46,1.00),(x+.04,end,.97)],.055 if mode=='wispy' else .11,shade=1.02+i*.018,blunt=mode=='blunt')
def centrepart(comma=False):
 for s in [-1,1]:
  for i in range(3):
   lock('Parted sweep %s %s'%(s,i),[(s*.025,.99,.38-i*.12),(s*.32,1.16,.57-i*.1),(s*.66,.71,.82-i*.05),(s*(.64 if not comma else .37),.34+i*.1,.78)],.13-i*.013,shade=1.05+i*.055)
def sides(length=.7,flip=False,blunt=False,layer=False):
 for s in [-1,1]:
  for i in range(4):
   z=.40-i*.33;x=s*(.80+.08*math.sin(i));y=-length+(i*.12 if layer else 0)
   endx=x+s*(.24 if flip else -.06)
   lock('Side length %s %s'%(s,i),[(x,.42,z),(s*1.05,0,z),(s*.97,y+.26,z),(endx,y,z+.1)],.18,shade=1.04+i*.022,blunt=blunt)
def back(length):
 for i in range(5):
  x=(i-2)*.28
  lock('Back length %s'%i,[(x,.1,-.99),(x,-.45,-1.08),(x,-length+.15,-.91),(x,-length,-.80)],.19,shade=.94+i*.025,kind='tail')
def crown(spiky=False,curly=False):
 for i in range(5):
  x=(i-2)*.24;z=.12+(i%2)*.16
  if spiky:
   controls=[(x,.90,z),(x+.04,1.16,z),(x+.19,1.29+(i%2)*.06,z),(x+.23,1.19+(i%2)*.06,z-.04)]
  else:
   controls=[(x,.91,z),(x-.02,1.04,z),(x+.10,1.10,z),(x+.18,1.00,z-.06)]
  lock('Crown texture %s'%i,controls,.065 if not spiky else .085,shade=1.08+(i%3)*.04)
def start(style):
 global active
 active=bpy.data.collections.new(style);bpy.context.scene.collection.children.link(active);styles[style]=[]
start('jpmash');cap(.48,-.10,-.45,1.10);fringe('blunt');crown(curly=True)
start('jptwoblock');cap(.69,.02,-.33,1.025);centrepart()
start('jpcentre');cap(.74,-.12,-.5,1.065,True);centrepart();sides(.42)
start('jpcomma');cap(.70,-.05,-.4,1.06,True);centrepart(True)
start('jpspiky');cap(.64,.06,-.36,1.03);crown(spiky=True);fringe('wispy',3)
start('jpwolf');cap(.64,-.10,-.63);centrepart();sides(.82,True,layer=True);back(1.06)
start('jpminibob');cap(.63,-.43,-.65,1.085);fringe('blunt');sides(.74,blunt=True);back(.79)
start('jpseethrough');cap(.76,-.45,-.64,1.07);fringe();sides(.83,blunt=True);back(.91)
start('jpoutward');cap(.69,-.36,-.58);fringe();sides(1.12,True);back(1.20)
start('jplayered');cap(.74,-.3,-.59,1.065,True);centrepart();sides(1.20,True,layer=True);back(1.51)
start('jphime');cap(.66,-.25,-.58);fringe('blunt');sides(.56,blunt=True);back(1.72)
for s in [-1,1]:lock('Hime straight length %s'%s,[(s*.86,.28,-.22),(s*.97,-.24,-.22),(s*.91,-1.15,-.18),(s*.86,-1.73,-.12)],.16,shade=1.06,kind='tail',blunt=True)
start('jplongwaves');cap(.78,-.32,-.58,1.065,True);centrepart();back(1.78)
for s in [-1,1]:
 for i in range(4):
  z=.35-i*.30;x=s*(.86+i*.025)
  lock('Loose wave %s %s'%(s,i),[(x,.34,z),(s*1.34,-.37,z),(s*.60,-1.07,z),(s*1.01,-1.64+i*.07,z)],.18,shade=1.04+i*.025,kind='tail')
# Blender collections stay at origin for editing; gallery layout is made at runtime.
bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/avatars/japanese-hair-library.blend'),compress=True)
(root/'src/avatars/japanese-hair-mesh.js').write_text('// Generated by tools/blender/build-japanese-hair.py. Original reusable meshes.\nexport const JAPANESE_HAIR=Object.freeze('+json.dumps(styles,separators=(',',':'))+');\n')
print('Exported',len(styles),'styles;',sum(len(v) for v in styles.values()),'parts')

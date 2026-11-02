"""Blender 4.2+: build/editable collections, render thumbnails and export GLBs.
blender -b --python build-equipment.py [-- --from-blend equipment-library.blend]
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent; APP=ROOT.parent
items=json.loads((ROOT/'catalogue.json').read_text());args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if '--from-blend' in args:bpy.ops.wm.open_mainfile(filepath=str(Path(args[args.index('--from-blend')+1]).resolve()))
else:bpy.ops.wm.read_factory_settings(use_empty=True)
if '--from-blend' in args:
 keep={o for s in items for o in bpy.data.collections[s['collection']].all_objects}
 for o in list(bpy.data.objects):
  if o not in keep:bpy.data.objects.remove(o,do_unlink=True)
 for c in list(bpy.data.collections):
  if c.name not in {s['collection'] for s in items} and not c.all_objects:bpy.data.collections.remove(c)
M={}
def material(name,col,metal=0,rough=.35):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;M[name]=m;return m
for n,c,met in [('blue',(.035,.25,.46),.35),('teal',(.025,.38,.39),.35),('orange',(.9,.32,.045),.25),('steel',(.52,.58,.62),.8),('dark',(.045,.06,.075),.35),('rubber',(.025,.03,.035),0),('white',(.88,.91,.92),.1),('screen',(.07,.15,.18),.1)]:material(n,c,met)
active=None

def finish(o,name,mat,bevel=0):
 o.name=name
 for c in list(o.users_collection):c.objects.unlink(o)
 active.objects.link(o);o.data.materials.append(M[mat]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  b=o.modifiers.new('Machined edge radius','BEVEL');b.width=bevel;b.segments=2
  n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o

def box(name,loc,size,mat='blue',bevel=.012):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size;return finish(o,name,mat,bevel)
def cyl(name,loc,r,depth,mat='steel',axis='Z',verts=32):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=loc);o=bpy.context.object
 if axis=='X':o.rotation_euler[1]=math.pi/2
 if axis=='Y':o.rotation_euler[0]=math.pi/2
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,mat,.003)
def sphere(name,loc,scale,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=loc);o=bpy.context.object;o.scale=scale
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,mat)
def pipe(name,pts,r,mat='rubber'):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2
 s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for p,co in zip(s.bezier_points,pts):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,c);active.objects.link(o);c.materials.append(M[mat]);return o

def motor(x,z,r=.14,length=.37):
 cyl('Motor casing',(x,0,z),r,length,'blue','X')
 for xx in [x-length/2+.02+i*(length-.04)/11 for i in range(12)]:cyl('Cooling fin',(xx,0,z),r*1.09,.012,'blue','X')
 box('Terminal box',(x,-.015,z+r+.035),(.13,.13,.07),'blue');box('Motor foot',(x,0,z-r-.035),(.28,.27,.07),'blue')
 cyl('Fan cover',(x+length/2+.03,0,z),r*1.07,.055,'dark','X')
def gauge(x,y,z,r=.045):
 cyl('Gauge rim',(x,y,z),r,.025,'steel','Y');cyl('Gauge face',(x,y-.015,z),r*.85,.004,'white','Y')
 needle=box('Gauge pointer',(x+.008,y-.02,z+.012),(.004,.004,r*.65),'dark',0);needle.rotation_euler[1]=-.5

def pump():
 box('Pump skid',(0,0,.04),(1.2,.43,.08),'steel')
 for x in [-.48,.45]:
  for y in [-.16,.16]:cyl('Anchor bolt',(x,y,.087),.014,.015,'dark',verts=6)
 motor(.25,.32)
 box('Coupling guard',(-.1,0,.29),(.22,.24,.25),'orange')
 for x in [-.18,-.14,-.1,-.06]:box('Guard ventilation slot',(x,-.122,.32),(.014,.006,.12),'dark',.002)
 cyl('Volute casing',(-.35,0,.3),.19,.20,'teal','X');box('Pump pedestal',(-.35,0,.14),(.24,.23,.15),'teal')
 cyl('Suction neck',(-.51,0,.3),.065,.14,'teal','X');cyl('Suction flange',(-.59,0,.3),.105,.025,'steel','X');cyl('Suction opening',(-.604,0,.3),.06,.004,'dark','X')
 cyl('Discharge riser',(-.35,0,.51),.052,.14,'teal');cyl('Discharge flange',(-.35,0,.59),.09,.025,'steel');cyl('Discharge opening',(-.35,0,.605),.048,.003,'dark')
 for y in [-.075,.075]:
  for z in [.225,.375]:cyl('Flange bolt',(-.61,y,z),.011,.016,'dark','X',6)

def compressor():
 cyl('Receiver shell',(0,0,.40),.25,.98,'teal','X');sphere('Receiver end left',(-.49,0,.4),(.16,.25,.25),'teal');sphere('Receiver end right',(.49,0,.4),(.16,.25,.25),'teal')
 for x in [-.36,.36]:box('Receiver support',(x,0,.14),(.14,.40,.18),'dark');box('Anchored foot',(x,0,.035),(.22,.5,.07),'steel')
 box('Compressor deck',(0,0,.69),(1.0,.45,.055),'steel');motor(.27,.86,.13,.30)
 for x in [-.3,-.13]:
  cyl('Compression cylinder',(x,0,.91),.075,.30,'dark')
  for z in [.78+i*.025 for i in range(10)]:cyl('Cylinder fin',(x,0,z),.1,.01,'steel')
  box('Cylinder head',(x,0,1.08),(.17,.17,.055),'steel')
 box('Belt enclosure',(.02,.2,.87),(.85,.065,.34),'dark')
 for x in [-.31+i*.055 for i in range(12)]:box('Belt guard slot',(x,.237,.87),(.012,.003,.22),'steel',0)
 pipe('Discharge tube',[(-.21,-.06,1.08),(-.45,-.18,.98),(-.48,-.16,.67)],.014,'steel')
 cyl('Gauge stem',(.47,-.12,.7),.018,.13);gauge(.47,-.14,.79)
 cyl('Drain valve',(0,0,.1),.022,.12,'steel');box('Drain handle',(0,0,.11),(.12,.025,.018),'orange')
 cyl('Outlet connection',(.62,0,.43),.026,.12,'steel','X')

def generator():
 box('Common skid',(0,0,.075),(1.5,.72,.15),'dark');box('Fuel tank',(-.08,0,.22),(1.15,.58,.18),'steel')
 for x in [-.5,.45]:
  for y in [-.24,.24]:box('Resilient mount',(x,y,.35),(.14,.12,.07),'rubber')
 box('Engine block',(-.16,0,.56),(.56,.48,.35),'teal');box('Cylinder cover',(-.17,0,.8),(.52,.36,.15),'teal')
 for x in [-.32,-.17,-.02]:box('Rocker cover',(x,0,.9),(.12,.25,.055),'teal')
 cyl('Alternator',(.43,0,.56),.23,.41,'blue','X');cyl('Alternator end',(.66,0,.56),.22,.055,'dark','X')
 box('Radiator',(-.62,0,.61),(.12,.62,.63),'dark')
 for y in [-.25+i*.035 for i in range(15)]:box('Radiator cooling slat',(-.69,y,.61),(.014,.013,.49),'steel',.001)
 box('Control housing',(.38,-.25,.88),(.36,.16,.26),'dark');box('Readout',(.36,-.335,.93),(.2,.006,.09),'screen',.002)
 cyl('Emergency stop',(.5,-.35,.83),.027,.035,'orange','Y')
 pipe('Exhaust riser',[(-.2,.18,.73),(-.2,.28,.96),(-.05,.28,1.0)],.025,'steel');cyl('Silencer',(.08,.28,1.0),.067,.30,'steel','X')
 cyl('Oil filter',(-.1,-.28,.55),.047,.17,'white');pipe('Coolant hose',[(-.48,.16,.88),(-.56,.19,.89),(-.61,.18,.78)],.025)

def probe():
 box('Handheld readout',(-.12,0,.075),(.18,.28,.07),'dark',.02);box('Readout display',(-.12,-.035,.113),(.13,.10,.006),'screen',.006)
 for x in [-.17,-.12,-.07]:cyl('Readout button',(x,.065,.114),.013,.008,'orange')
 pipe('Flexible sensor cable',[(-.13,.14,.08),(-.05,.2,.04),(.1,.15,.025),(.12,-.03,.026),(.17,-.10,.035)],.006)
 cyl('Probe handle',(.23,-.10,.035),.024,.12,'dark','X');cyl('Probe stem',(.375,-.1,.035),.008,.18,'steel','X');sphere('Probe tip',(.465,-.1,.035),(.008,.008,.008),'steel')

if '--from-blend' not in args:
 for spec in items:
  active=bpy.data.collections.new(spec['collection']);bpy.context.scene.collection.children.link(active)
  globals()[spec['kind']]()
  # Fit uniformly into the declared illustrative envelope and ground at Z=0.
  bpy.context.view_layer.update()
  objs=list(active.objects);points=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box]
  lo=Vector(tuple(min(p[i] for p in points) for i in range(3)));hi=Vector(tuple(max(p[i] for p in points) for i in range(3)))
  factor=min(spec['envelopeMm'][i]/1000/max(hi[i]-lo[i],1e-6) for i in range(3))
  centre=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
  for o in objs:o.location=(o.location-centre)*factor;o.scale*=factor

scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.length_unit='METERS'
# Separate studio rig; never included in equipment GLBs.
active=bpy.data.collections.new('Studio rig');scene.collection.children.link(active)
box('Studio ground',(0,0,-.025),(200,200,.04),'white',0)
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=896;scene.render.resolution_y=672;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world=bpy.data.worlds.new('Neutral studio world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.76,.8,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
bpy.ops.object.camera_add();camera=bpy.context.object;camera.data.type='ORTHO';scene.camera=camera
for name,loc,power,size in [('Key',(3,-4,6),700,5),('Fill',(-4,-2,3),450,4),('Rim',(1,4,5),700,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.4))-o.location).to_track_quat('-Z','Y').to_euler()
scene.view_settings.view_transform='AgX'
report=[]
for spec in items:
 col=bpy.data.collections.get(spec['collection'])
 if not col:raise RuntimeError('Missing collection '+spec['collection'])
 for item in items:bpy.data.collections[item['collection']].hide_render=item['id']!=spec['id']
 bpy.ops.object.select_all(action='DESELECT')
 for o in col.all_objects:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.update()
 points=[o.matrix_world@Vector(c) for o in col.all_objects if o.type in {'MESH','CURVE'} for c in o.bound_box]
 lo=Vector(tuple(min(p[i] for p in points) for i in range(3)));hi=Vector(tuple(max(p[i] for p in points) for i in range(3)));size=hi-lo;target=(hi+lo)/2
 camera.location=target+Vector((2.7,-3.8,2.7))*max(size);camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=max(size.x,size.y,size.z)*1.65
 bpy.ops.export_scene.gltf(filepath=str(APP/'models'/f'{spec["id"]}.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=False)
 scene.render.filepath=str(APP/'images'/f'{spec["id"]}.png');bpy.ops.render.render(write_still=True)
 report.append({'id':spec['id'],'boundsMetres':[round(x,4) for x in size],'parts':len(col.all_objects),'glbBytes':(APP/'models'/f'{spec["id"]}.glb').stat().st_size})
for item in items:bpy.data.collections[item['collection']].hide_render=item['id']!='pump'
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'equipment-library.blend'),compress=True)
(ROOT/'geometry-review.json').write_text(json.dumps(report,indent=2))
public=[{'id':s['id'],'label':s['label'],'image':f'./images/{s["id"]}.png','model':f'./models/{s["id"]}.glb'} for s in items]
(APP/'object-catalogue.mjs').write_text('// Generated by Blender build-equipment.py. Illustrative visuals, no technical defaults.\nexport const OBJECT_MODELS = '+json.dumps(public,indent=2)+';\n')
print('EQUIPMENT_EXPORT_COMPLETE',json.dumps(report))

"""Blender 4.5: original option-A overlook from JW-PH-001 C, no external assets.
Run: blender -b --factory-startup --python tools/blender/build-seawall-photo.py
Exports editable .blend, glb and synchronous runtime meshes derived from the evaluated Blender mesh.
"""
import bpy, json, math, struct, base64
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
D=json.loads((ROOT/'docs/seawall-photo/design.json').read_text()); OUT=ROOT/'assets/models/harbour'
bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
M={}
def mat(n,c,rough=.85):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Roughness'].default_value=rough;M[n]=m;return m
mat('navy',(0.035,.105,.13));mat('concrete',(.65,.69,.65));mat('wet',(.24,.36,.35));mat('stone',(.61,.62,.54));mat('iron',(.34,.39,.38),.55);mat('foam',(.82,.91,.89));mat('sand',(.74,.72,.60))
def xyz(p):x,y,z=p;return (x,-z,y)
def box(n,p,size,m='concrete',bevel=.01,runtime=True):
 bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p));o=bpy.context.object;o.name=n;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(M[m]);o['runtime']=runtime
 if bevel:
  mod=o.modifiers.new('Small cast/painted edge','BEVEL');mod.width=bevel;mod.segments=1
  norm=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');norm.keep_sharp=True
 return o
p=D['pier'];r=D['rail'];top=p['top'];cx=(p['minX']+p['maxX'])/2;cz=(p['minZ']+p['maxZ'])/2
# Standard-ground slab retained in Blender for construction/preview, omitted from runtime mesh export.
box('Ground-standard-deck',(cx,top-p['slab']/2,cz),(p['maxX']-p['minX'],p['slab'],2.4),bevel=0,runtime=False)
for i,x in enumerate(p['bentX']):
 box('Crosshead-%02d'%i,(x,-.265,cz),(.44,.29,2.5))
 for z in p['pileZ']:
  # Sectioned concrete piles with a visible wet band, no overlapping coplanar faces.
  for a,b,m in [(p['pileBottom'],-.68,'wet'),(-.68,-.44,'wet'),(-.44,-.41,'concrete')]:
   box('Bearing-pile-%02d'%i,(x,(a+b)/2,z),(.25,b-a,.25),m,bevel=.008)
# longitudinal underdeck beams visibly bear on every crosshead
for z in p['pileZ']:box('Longitudinal-edge-beam',(cx,-.16,z),(16.1,.12,.16),bevel=.006)
# pier rails: two sides and closed end; root completely open
for z in [p['minZ']+.05,p['maxZ']-.05]:
 for x in [p['minX']+.05]+p['bentX'][:-1]+[p['maxX']-.05]:box('Pier-rail-post',(x,top+.55,z),(.09,1.1,.09),'navy',.008)
 for h in [.5,1.075]:box('Pier-horizontal-rail',(cx,top+h,z),(p['maxX']-p['minX'],.05,.065),'navy',.006)
for h in [.5,1.075]:box('Pier-end-rail',(p['minX']+.05,top+h,cz),(.065,.05,2.3),'navy',.006)
# portrait bay: plinth, 5 main posts, three flush recessed rails
box('Portrait-low-plinth',(r['x'],.04,-7.3),(.6,.2,6),'stone',.012)
for z in [-10.3,-8.8,-7.3,-5.8,-4.3]:
 box('Portrait-rail-post',(r['x'],(.14+r['top'])/2,z),(.14,r['top']-.14,.14),'navy',.012)
 box('Portrait-post-cap',(r['x'],r['top']-.02,z),(.16,.04,.16),'navy',.006)
 # two through-bolt heads on landward face
 for y in [.39,1.165]:box('Flush-rail-bolt',(r['x']+.074,y,z),(.012,.024,.024),'iron',.004)
for z0,z1 in [(-10.3,-8.8),(-8.8,-7.3),(-7.3,-5.8),(-5.8,-4.3)]:
 for y in r['railCentres']:box('Portrait-horizontal-rail',(r['x'],y,(z0+z1)/2),(.07,.1,z1-z0-.14),'navy',.006)
# sloping stone armour under portrait rail: explicit quad, three strips, no floating decorative chunks
for i in range(3):
 v0=i*.8;v1=(i+1)*.8;y0=-.10-v0*.46/2.4;y1=-.10-v1*.46/2.4
 verts=[xyz(q) for q in [(-39.85-v0,y0,-10.3),(-39.85-v1,y1,-10.3),(-39.85-v1,y1,-4.3),(-39.85-v0,y0,-4.3)]]
 mesh=bpy.data.meshes.new('Pitched-stone-apron');mesh.from_pydata(verts,[],[(0,1,2,3)]);mesh.materials.append(M['stone']);o=bpy.data.objects.new('Shore-pitch-%d'%i,mesh);bpy.context.collection.objects.link(o);o['runtime']=True
# quiet foam ribbons, geometry safely separated from the pitch; no heavy particle simulation
for j in range(12):
 z=-10.3+(j+.5)*.5;x=-42.25-.12*math.sin(j*2.1)
 o=box('Foam-at-armour-toe',(x,-.51,z),(.12,.012,.30+.10*math.cos(j)),'foam',.003)
# camera marker is metadata, not a prop in the game
bpy.ops.object.camera_add(location=xyz(D['photo']['camera']));cam=bpy.context.object;cam.name='Reference-photo-camera';cam.rotation_euler=(Vector(xyz(D['photo']['target']))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='PERSP';cam.data.lens_unit='FOV';cam.data.angle=math.radians(D['photo']['fov']);bpy.context.scene.camera=cam
# runtime buckets from actual evaluated Blender objects; transform to Three world frame.
buckets={};deps=bpy.context.evaluated_depsgraph_get()
for o in list(bpy.context.scene.objects):
 if o.type!='MESH' or not o.get('runtime'):continue
 ev=o.evaluated_get(deps);mesh=ev.to_mesh();mesh.calc_loop_triangles();name=o.data.materials[0].name;b=buckets.setdefault(name,{'p':[],'n':[]})
 for tri in mesh.loop_triangles:
  # Blender xyz -> Three x,z,-y is a proper rotation, so winding is preserved.
  for li in tri.loops:
   vi=mesh.loops[li].vertex_index;v=ev.matrix_world@mesh.vertices[vi].co;n=ev.matrix_world.to_3x3()@mesh.loops[li].normal
   b['p'] += [round(v.x,6),round(v.z,6),round(-v.y,6)];b['n'] += [round(n.x,6),round(n.z,6),round(-n.y,6)]
 ev.to_mesh_clear()
models=[]
for name,b in buckets.items():
 def enc(v):return base64.b64encode(struct.pack('<%sf'%len(v),*v)).decode()
 col=M[name].diffuse_color[:3];models.append({'material':name,'color':list(col),'positions':enc(b['p']),'normals':enc(b['n']),'vertices':len(b['p'])//3})
(ROOT/'src/world/seawall-photo-mesh.js').write_text('// Generated by Blender build-seawall-photo.py; actual evaluated mesh, Three world metres.\nexport const SEAWALL_MESH='+json.dumps(models,separators=(',',':'))+';\n')
# Export original model, including standard slab, without preview environment.
for o in bpy.context.scene.objects:o.select_set(o.type=='MESH')
bpy.ops.export_scene.gltf(filepath=str(OUT/'nishi-photo-overlook.glb'),export_format='GLB',use_selection=True,export_yup=True)
# Preview environment only, kept out of all exports.
box('Preview-walk',(-37,.015,-5),(4.5,.05,18),'sand',0,False)
box('Preview-sea',(-65,-.58,-5),(60,.02,75),'wet',0,False)
world=bpy.context.scene.world;world.color=(.55,.65,.7)
bpy.ops.object.light_add(type='AREA',location=(-28,9,14));bpy.context.object.data.energy=2600;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=20
bpy.ops.object.light_add(type='SUN',location=(0,0,20));bpy.context.object.data.energy=2;bpy.context.object.rotation_euler=(.4,-.3,-.5)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'docs/seawall-photo/Nishi_Photo_Overlook.blend'),compress=True)
scene.render.filepath=str(ROOT/'docs/seawall-photo/blender-photo-view.png');bpy.ops.render.render(write_still=True)
cam.location=xyz((-25,14,-23));cam.rotation_euler=(Vector(xyz((-45,0,-4)))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=45
scene.render.filepath=str(ROOT/'docs/seawall-photo/blender-overview.png');bpy.ops.render.render(write_still=True)
print('JW_PHOTO',json.dumps({'vertices':sum(m['vertices'] for m in models),'triangles':sum(m['vertices'] for m in models)//3,'materials':len(models)}))

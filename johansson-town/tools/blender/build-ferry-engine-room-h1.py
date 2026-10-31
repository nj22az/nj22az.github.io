"""Build CAD H1 from shared game geometry; Blender 4.0+; no Meshy attribution.
Run: blender -b --python tools/blender/build-ferry-engine-room-h1.py -- --render
"""
import bpy, json, math, sys
from pathlib import Path
from mathutils import Vector, Matrix
ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'art/ferry-engine-room/geometry-h1.json'
OUT=ROOT/'art/ferry-engine-room';OUT.mkdir(parents=True,exist_ok=True)
D=json.loads(DATA.read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
collection=bpy.data.collections.new('CAD H1 - retained machinery');scene.collection.children.link(collection)
objects=[];mats={}
def P(p):return Vector((p[0],-p[2],p[1]))
def material(hex,cls='paint'):
 key=(hex,cls)
 if key in mats:return mats[key]
 def linear(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
 m=bpy.data.materials.new(f'{cls} {hex:06x}');m.diffuse_color=tuple(linear(((hex>>s)&255)/255) for s in[16,8,0])+(1,)
 m.use_nodes=True;bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=m.diffuse_color;bs.inputs['Roughness'].default_value=.7;bs.inputs['Metallic'].default_value=.25 if cls=='metal'else .02
 mats[key]=m;return m
def keep(o,name,hex,cls):
 o.name=name or 'source fitting';o['source']='ferry-interior.js / CAD C-H1';o['purpose']='retained machinery / support / access'
 for c in list(o.users_collection):c.objects.unlink(o)
 collection.objects.link(o);o.data.materials.append(material(hex,cls));objects.append(o);return o
for k,b in enumerate(D['boxes']):
 a,c=Vector(b['a']),Vector(b['b']);size=c-a
 if min(abs(x)for x in size)<.00001:continue
 bpy.ops.mesh.primitive_cube_add(size=1,location=P((a+c)/2));o=bpy.context.object;o.dimensions=(abs(size.x),abs(size.z),abs(size.y));bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 keep(o,b.get('name')or f'CAD component {k}',b['hex'],b.get('cls','paint'))
for c in D['cyls']:
 n=min(20,max(8,c.get('seg',12)));x,y,z=c.get('rot',[0,0,0])
 rx=Matrix.Rotation(x,3,'X');ry=Matrix.Rotation(y,3,'Y');rz=Matrix.Rotation(z,3,'Z');rot=ry@rx@rz
 v=[P(rot@Vector((r*math.cos(t*2*math.pi/n),h,r*math.sin(t*2*math.pi/n)))+Vector(c['pos']))for h,r in[(-c['h']/2,c['rb']),(c['h']/2,c['rt'])]for t in range(n)]
 faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n)for i in range(n)]
 mesh=bpy.data.meshes.new(c.get('name')or'cylinder');mesh.from_pydata(v,[],faces);mesh.update();o=bpy.data.objects.new(mesh.name,mesh);collection.objects.link(o);keep(o,c.get('name'),c['hex'],c.get('cls','metal'))
for b in D['bars']:
 a,c=P(b['a']),P(b['b']);dv=c-a
 if dv.length<.0001:continue
 bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=b['r'],depth=dv.length,location=(a+c)/2);o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=dv.to_track_quat('Z','Y');keep(o,'pipe / guard / support',b['hex'],b.get('cls','metal'))
# Maker plates are render-only; World retains its live dial/label planes rather
# than drawing a second coincident set from the GLB.
T=Matrix(((1,0,0),(0,0,-1),(0,1,0)))
for p in D['plates']:
 lines=[str(a)for a in p.get('lines',[])if str(a)]
 if not lines or p.get('kind')not in['text',None]:continue
 lines=[''.join(c for c in line if ord(c)<256)for line in lines]
 if not any(lines):continue
 curve=bpy.data.curves.new('Label '+p.get('name',''),'FONT');curve.body='\n'.join(lines);curve.align_x='CENTER';curve.align_y='CENTER';curve.size=min(p['h']/max(1,len(lines))*.72,p['w']/max(map(len,lines))*.95)
 o=bpy.data.objects.new(curve.name,curve);scene.collection.objects.link(o)
 R=Matrix.Rotation(p.get('rotY',0),3,'Y')@Matrix.Rotation(p.get('rotX',0),3,'X')
 o.location=P(Vector(p['pos'])+R@Vector((0,0,.002)));o.rotation_euler=(T@R).to_euler();curve.materials.append(material(0xe9e4d6 if p.get('fg')=='#ffffff'else 0x172b2d))
# Match actual deck luminaires; sources are render lights, not extra machinery.
for X,Y in D['basis']['luminaires']:
 data=bpy.data.lights.new('CAD H1-03 overhead fixture','AREA');data.energy=105;data.shape='DISK';data.size=.65;data.color=(1,.94,.84)
 o=bpy.data.objects.new(data.name,data);scene.collection.objects.link(o);o.location=P((Y,(3.5 if X in [9.5,12.5,24.4] else 3.38)-1.9,X-17.25));o.rotation_euler=(0,0,0)
world=bpy.data.worlds.new('Machinery-space ambient');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.34,.42,.46,1);world.node_tree.nodes['Background'].inputs[1].default_value=.28
for s in D['shots']:
 def cp(a):X,Y,Z=a;return P((Y,Z-1.9,X-17.25))
 data=bpy.data.cameras.new(s['id']);o=bpy.data.objects.new(s['id'],data);scene.collection.objects.link(o);o.location=cp(s['pos']);o.rotation_euler=(cp(s['at'])-o.location).to_track_quat('-Z','Y').to_euler();data.type='PERSP';data.sensor_fit='VERTICAL';data.lens=(data.sensor_height/2)/math.tan(math.radians(s['fov'])/2);data.clip_start=.05;data.clip_end=60;o['label']=s['label'];o['locked']=True
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=64;scene.cycles.use_denoising=False
scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard';scene.view_settings.look='Medium High Contrast';scene.view_settings.exposure=.25
for s in D['shots']:
 o=bpy.data.objects[s['id']];o.lock_location=(True,True,True);o.lock_rotation=(True,True,True);o.lock_scale=(True,True,True)
scene.camera=bpy.data.objects[D['shots'][0]['id']]
scene['CAD_revision']='C-H1';scene['clear_headroom_m']=2.4;scene['nominal_height_m']=2.7;scene['Meshy_status']='No generated Meshy assets; account connection pending';scene['release']='Development geometry study only'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Minato_Maru_Engine_Room_H1.blend'),compress=True)
# Keep the named/editable original objects in the .blend. Export one vertex-colour
# mesh so the game does not inherit a draw call for every material or fitting.
copies=[]
for src in objects:
 o=src.copy();o.data=src.data.copy();scene.collection.objects.link(o);copies.append(o)
 attr=o.data.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='CORNER')
 col=src.data.materials[0].diffuse_color
 for v in attr.data:v.color=col
 o.data.materials.clear()
bpy.ops.object.select_all(action='DESELECT')
for o in copies:o.select_set(True)
bpy.context.view_layer.objects.active=copies[0];bpy.ops.object.join();merged=bpy.context.object;merged.name='Minato Maru H1 machinery - CAD source'
m=bpy.data.materials.new('H1 painted machinery - vertex colours');m.use_nodes=True;n=m.node_tree.nodes.new('ShaderNodeVertexColor');n.layer_name='Color';bs=m.node_tree.nodes.get('Principled BSDF');m.node_tree.links.new(n.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.72;merged.data.materials.append(m)
path=ROOT/'assets/models/ferry-engine-room';path.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(path/'minato-engine-room-h1.glb'),export_format='GLB',use_selection=True,export_apply=True,export_cameras=False,export_lights=False,export_yup=True)
bpy.data.objects.remove(merged,do_unlink=True)
if '--render'in sys.argv:
 if '--preview'in sys.argv:scene.cycles.samples=32;scene.render.resolution_x=960;scene.render.resolution_y=720
 render=OUT/'renders';render.mkdir(exist_ok=True)
 only=next((a.split('=',1)[1] for a in sys.argv if a.startswith('--shots=')),None)
 for s in D['shots']:
  if only and s['id'] not in only.split(','):continue
  scene.camera=bpy.data.objects[s['id']];scene.render.filepath=str(render/(s['id']+'.png'));bpy.ops.render.render(write_still=True)
print('H1_BUILD_COMPLETE',len(objects),'retained source components')

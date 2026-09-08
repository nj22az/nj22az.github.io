"""Repair and review the user-supplied Meshy biped ZIP in Blender 4.2.
Run: blender -b --python tools/blender/repair-yuri-biped.py -- --root /path/to/johansson-town --zip /path/to/biped.zip
"""
import argparse,sys,tempfile,zipfile
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--root',required=True);parser.add_argument('--zip',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);projectRoot=Path(args.root);work=Path(tempfile.mkdtemp(prefix='yuri-rig-'))
with zipfile.ZipFile(args.zip) as archive:
 for info in archive.infolist():
  if info.filename.endswith(('Walking_withSkin.glb','Running_withSkin.glb')):(work/Path(info.filename).name).write_bytes(archive.read(info))
import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
p=next(Path(str(work)).glob('*Walking*'));bpy.ops.import_scene.gltf(filepath=str(p))
s=bpy.context.scene;s.frame_set(1)
report=[]
for o in list(s.objects):
 if o.type=='ARMATURE':print('RIG',o.name,[(b.name,list(b.head_local),list(b.tail_local)) for b in o.data.bones])
 if o.type!='MESH':continue
 bm=bmesh.new();bm.from_mesh(o.data)
 report.append(dict(name=o.name,verts=len(bm.verts),faces=len(bm.faces),degenerate=sum(f.calc_area()<1e-10 for f in bm.faces),loose=sum(not v.link_faces for v in bm.verts),boundary=sum(e.is_boundary for e in bm.edges),nonmanifold=sum(not e.is_manifold for e in bm.edges),groups=[g.name for g in o.vertex_groups],bounds=[list(c) for c in o.bound_box]));bm.free()
print('REPORT',json.dumps(report));print('ACTIONS',[(a.name,list(a.frame_range)) for a in bpy.data.actions])
points=[o.matrix_world@Vector(c) for o in s.objects if o.type=='MESH' for c in o.bound_box];lo=Vector(tuple(min(v[i] for v in points) for i in range(3)));hi=Vector(tuple(max(v[i] for v in points) for i in range(3)));center=(lo+hi)/2;h=hi.z-lo.z
world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.65;s.world=world
for off,power in [((2,-3,4),500),((-2,-1,2),200)]:
 d=bpy.data.lights.new('Softbox','AREA');d.energy=power;d.size=4;o=bpy.data.objects.new('Softbox',d);s.collection.objects.link(o);o.location=center+Vector(off);o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=center+Vector((h*.35,-h*2,h*.10)));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=h*1.2;s.camera=cam;s.render.engine='CYCLES';s.cycles.samples=12;s.render.resolution_x=800;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.filepath=str(work/'yuri-biped-before.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(work/'yuri-biped-inspect.blend'))


import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector,Quaternion
bpy.ops.wm.open_mainfile(filepath=str(work/'yuri-biped-inspect.blend'))
s=bpy.context.scene;rig=next(o for o in s.objects if o.type=='ARMATURE');mesh=next(o for o in s.objects if o.type=='MESH' and o.vertex_groups)
# Keep UV data on loops and bone weights on vertices when welding coincident UV-seam duplicates.
bm=bmesh.new();bm.from_mesh(mesh.data);before=(len(bm.verts),sum(e.is_boundary for e in bm.edges));bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));after=(len(bm.verts),sum(e.is_boundary for e in bm.edges));bm.to_mesh(mesh.data);bm.free()
if mesh.data.has_custom_normals:
 bpy.context.view_layer.objects.active=mesh;mesh.select_set(True);bpy.ops.mesh.customdata_custom_splitnormals_clear()
for p in mesh.data.polygons:p.use_smooth=True
for m in mesh.data.materials:
 m.use_backface_culling=False
 for n in m.node_tree.nodes:
  if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=.35
# All points well above the neck belong to the rigid head, including the hat/bow.
head=mesh.vertex_groups.get('Head');fixed=0
for v in mesh.data.vertices:
 if v.co.z>1.10:
  old=[(g.group,g.weight) for g in v.groups]
  if any(g!=head.index and w>.001 for g,w in old):fixed+=1
  for g in mesh.vertex_groups:g.remove([v.index])
  head.add([v.index],1,'REPLACE')
# One subdivision pass rounds jagged silhouette edges and interpolates skin weights.
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);bpy.context.view_layer.objects.active=mesh
sub=mesh.modifiers.new('Gentle surface refinement','SUBSURF');sub.levels=1;sub.render_levels=1
while mesh.modifiers.find(sub.name)>0:bpy.ops.object.modifier_move_up(modifier=sub.name)
bpy.ops.object.modifier_apply(modifier=sub.name)

# Collar cloth follows the chest, not stray arm/head influences from auto-rigging.
bs=next(n for n in mesh.data.materials[0].node_tree.nodes if n.type=='BSDF_PRINCIPLED');im=bs.inputs['Base Color'].links[0].from_node.image
px=list(im.pixels);iw,ih=im.size;collar=set()
for poly in mesh.data.polygons:
 for li in poly.loop_indices:
  v=mesh.data.vertices[mesh.data.loops[li].vertex_index]
  if not (.95<v.co.z<1.08 and v.co.y<0):continue
  uv=mesh.data.uv_layers.active.data[li].uv;k=((int(uv.y*ih)%ih)*iw+int(uv.x*iw)%iw)*4;rgb=px[k:k+3]
  if min(rgb)>.6 and max(rgb)-min(rgb)<.13:collar.add(v.index)
for vi in collar:
 for vg in mesh.vertex_groups:vg.remove([vi])
 mesh.vertex_groups['Spine'].add([vi],1,'REPLACE')
print('COLLAR WEIGHTS',len(collar))

print('REPAIR',before,after,'HEAD WEIGHTS',fixed)

# Import the run take, keep only its action and discard its duplicate mesh/rig.
beforeObjects=set(bpy.data.objects);beforeActions=set(bpy.data.actions)
bpy.ops.import_scene.gltf(filepath=str(next(Path(str(work)).glob('*Running*'))))
run=max(set(bpy.data.actions)-beforeActions,key=lambda a:a.frame_range[1]-a.frame_range[0]);run.name='Run';run.use_fake_user=True
for o in set(bpy.data.objects)-beforeObjects:bpy.data.objects.remove(o,do_unlink=True)
walk=max((a for a in beforeActions if 'Walking' in a.name),key=lambda a:a.frame_range[1]-a.frame_range[0]);walk.name='Walk';walk.use_fake_user=True

for track in list(rig.animation_data.nla_tracks):rig.animation_data.nla_tracks.remove(track)
# Drop horizontal root motion, retain the small vertical gait motion; the game moves the actor.
for a in [walk,run]:
 for fc in a.fcurves:
  if fc.data_path=='pose.bones["Hips"].location' and fc.array_index in [0,1]:
   for k in fc.keyframe_points:k.co.y=0;k.handle_left.y=0;k.handle_right.y=0
# A quiet idle starts from the supplied rig's neutral pose, with upper arms lowered.
rig.animation_data.action=None
for pb in rig.pose.bones:pb.location=(0,0,0);pb.rotation_mode='QUATERNION';pb.rotation_quaternion=(1,0,0,0);pb.scale=(1,1,1)
for name in ['LeftArm','RightArm']:
 pb=rig.pose.bones[name];axis=pb.bone.matrix_local.to_3x3().inverted()@Vector((0,1,0));pb.rotation_quaternion=Quaternion(axis,math.radians(67 if name=='LeftArm' else -67))
idle=bpy.data.actions.new('Idle_Neutral');rig.animation_data.action=idle
for frame,angle in [(1,0),(31,.009),(61,0)]:
 for pb in rig.pose.bones:
  if pb.name=='Spine':pb.rotation_quaternion=Quaternion((1,0,0),angle)
  pb.keyframe_insert('rotation_quaternion',frame=frame);pb.keyframe_insert('location',frame=frame);pb.keyframe_insert('scale',frame=frame)
idle.use_fake_user=True
for a in list(bpy.data.actions):
 if a not in [walk,run,idle]:bpy.data.actions.remove(a)
# Only character mesh and rig are exported; Blender importer helper shapes stay out.
s.frame_set(1);bpy.context.view_layer.update();points=[mesh.matrix_world@v.co for v in mesh.evaluated_get(bpy.context.evaluated_depsgraph_get()).data.vertices];lo=Vector(tuple(min(v[i] for v in points) for i in range(3)));hi=Vector(tuple(max(v[i] for v in points) for i in range(3)));c=(lo+hi)/2;h=hi.z-lo.z
cam=s.camera;cam.location=c+Vector((h*.22,-h*2,h*.05));cam.rotation_euler=(c-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=h*1.15
s.render.filepath=str(work/'yuri-biped-after.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(work/'yuri-biped-clean.blend'))
print('IDLE HEIGHT',h)


import bpy,json
from pathlib import Path
root=projectRoot;out=root/'art/characters/yuri-biped';out.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(work/'yuri-biped-clean.blend'));s=bpy.context.scene;rig=next(o for o in s.objects if o.type=='ARMATURE');mesh=next(o for o in s.objects if o.type=='MESH' and o.vertex_groups)
rig.animation_data.action=bpy.data.actions['Idle_Neutral'];s.frame_set(1)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(out/'yuri.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);mesh.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(root/'assets/characters/realistic/yuri-meshy.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_nla_strips=False,export_force_sampling=True,export_frame_range=False,export_skins=True,export_morph=False,export_cameras=False,export_lights=False)
for name,frame in [('Idle_Neutral',1),('Walk',7),('Walk',18),('Run',5),('Run',13)]:
 rig.animation_data.action=bpy.data.actions[name];s.frame_set(frame);s.render.filepath=str(out/(name+'-'+str(frame)+'.png'));bpy.ops.render.render(write_still=True)
print('DONE')


import bpy
from pathlib import Path
bpy.ops.wm.open_mainfile(filepath=str(work/'yuri-biped-clean.blend'));s=bpy.context.scene;rig=next(o for o in s.objects if o.type=='ARMATURE');out=(projectRoot/'art/characters/yuri-biped')
bpy.ops.outliner.orphans_purge(do_recursive=True)
rig.animation_data.action=bpy.data.actions['Idle_Neutral'];s.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=str(out/'yuri.blend'),compress=True)
rig.animation_data.action=bpy.data.actions['Walk'];s.frame_set(7);s.render.filepath=str(out/'Walk-7.png');bpy.ops.render.render(write_still=True)

"""Finish the Blender-authored Kenji and export a self-contained animated GLB.
Run after build-resident.py, with --root pointing to the game directory.
"""
import bpy,sys,argparse,math,json,os
from pathlib import Path
from mathutils import Vector,Quaternion,Matrix
p=argparse.ArgumentParser();p.add_argument('--root',required=True);args=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(args.root);out=root/'art/characters/kenji'
bpy.ops.wm.open_mainfile(filepath=str(out/'kenji-review.blend'))
rig=bpy.data.objects['Kenji.Rig'];meshes=[o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith('Kenji.')]
# Re-encode scaled texture pixels before packing so the .blend and GLB share the same sizes.
texture_dir=Path('/tmp/town-kenji-textures');texture_dir.mkdir(exist_ok=True)
for image in list(bpy.data.images):
 if image.source!='FILE':continue
 _=image.pixels[0] # Load packed pixels before checking dimensions or resizing.
 limit=2048 if 'young_' in image.name else 1024
 w,h=image.size;factor=min(1,limit/max(w,h));image.scale(max(1,int(w*factor)),max(1,int(h*factor)))
 # A fresh datablock prevents Blender reusing the original packed 2K/4K file.
 import array
 pixels=array.array('f',[0])*(image.size[0]*image.size[1]*4);image.pixels.foreach_get(pixels)
 baked=bpy.data.images.new('Town.'+image.name,width=image.size[0],height=image.size[1],alpha=True)
 baked.colorspace_settings.name=image.colorspace_settings.name;baked.pixels.foreach_set(pixels)
 opaque=not any(x in image.name for x in ['short01','eyebrow','normal'])
 baked.file_format='JPEG' if opaque else 'PNG';baked.filepath_raw=str(texture_dir/(image.name.split('.')[0]+('.jpg' if opaque else '.png')));baked.save();baked.pack()
 for material in bpy.data.materials:
  if material.use_nodes:
   for node in material.node_tree.nodes:
    if node.type=='TEX_IMAGE' and node.image==image:node.image=baked
 bpy.data.images.remove(image)
# Standardise the hierarchy and keep the actual standing height at Kenji's 1.76 metres.
for o in meshes:
 world=o.matrix_world.copy();o.parent=rig;o.matrix_world=world
for b in rig.pose.bones:b.rotation_mode='QUATERNION';b.rotation_quaternion=Quaternion()
bpy.context.view_layer.update();bounds=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box];height=max(v.z for v in bounds)-min(v.z for v in bounds);rig.scale*=1.76/height
# Trim the shoe pack's tall sock cuffs where they poke through the fitted jeans.
import bmesh
shoes=next(o for o in meshes if 'shoes01' in o.name)
bpy.context.view_layer.update();bm=bmesh.new();bm.from_mesh(shoes.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if (shoes.matrix_world@v.co).z>.15],context='VERTS');bm.to_mesh(shoes.data);bm.free()
# Authored local clips: six portable actions, no service calls or external animation links.
def aim(name,direction):
 b=rig.pose.bones.get(name)
 if not b:return
 bpy.context.view_layer.update();delta=(b.tail-b.head).normalized().rotation_difference(Vector(direction).normalized());m=delta.to_matrix().to_4x4()@b.matrix;m.translation=b.matrix.translation;b.matrix=m
 bpy.context.view_layer.update()
def pose(phase=0,amount=0,wave=0):
 for b in rig.pose.bones:b.rotation_quaternion=Quaternion();b.location=(0,0,0)
 for side,sign in [('l',1),('r',-1)]:
  step=math.sin(phase+(0 if side=='l' else math.pi))*amount
  aim('thigh_'+side,(0,math.sin(step),-math.cos(step)))
  knee=step+max(0,math.sin(phase+(0 if side=='l' else math.pi)))*amount*.9
  aim('calf_'+side,(0,math.sin(knee),-math.cos(knee)))
  foot=rig.pose.bones['foot_'+side];m=foot.bone.matrix_local.copy();m.translation=foot.matrix.translation;foot.matrix=m;bpy.context.view_layer.update()
  swing=-step*.45;aim('upperarm_'+side,(sign*.12,math.sin(swing)-.025,-1))
  aim('lowerarm_'+side,(sign*.02,math.sin(swing)-.13,-1));aim('hand_'+side,(sign*.015,math.sin(swing)-.12,-1))
 if wave:
  aim('upperarm_r',(-.7,-.12,.35));aim('lowerarm_r',(-.15+math.sin(phase*3)*.14,-.08,1));aim('hand_r',(math.sin(phase*3)*.25,-.05,1))
 head=rig.pose.bones.get('head');head.rotation_quaternion=Quaternion((1,0,0),math.sin(phase)*.012)
 spine=rig.pose.bones.get('spine_03') or rig.pose.bones.get('spine_02');spine.rotation_quaternion=Quaternion((1,0,0),math.sin(phase)*.008)
 bpy.context.view_layer.update()
 # Plant the lowest sole. The original clips keep locomotion in place for the game controller.
 evaluated=shoes.evaluated_get(bpy.context.evaluated_depsgraph_get())
 floor=min((evaluated.matrix_world@v.co).z for v in evaluated.data.vertices)
 pelvis=rig.pose.bones['pelvis'];m=pelvis.matrix.copy();m.translation.z-=floor/rig.scale.z;pelvis.matrix=m
 bpy.context.view_layer.update()
scene=bpy.context.scene;scene.render.fps=24;rig.animation_data_create()
for name,frames,amount,wave in [('Idle_Neutral',72,0,0),('Idle',72,0,0),('Walk',24,.42,0),('Run',16,.70,0),('Wave',48,0,1),('Interact',48,0,0)]:
 action=bpy.data.actions.new(name);rig.animation_data.action=action
 for frame in range(1,frames+2,2):
  pose((frame-1)/frames*math.tau,amount,wave)
  for bone in rig.pose.bones:
   bone.keyframe_insert('rotation_quaternion',frame=frame,group=bone.name)
   bone.keyframe_insert('location',frame=frame,group=bone.name)
 for curve in action.fcurves:
  for k in curve.keyframe_points:k.interpolation='LINEAR'
 action.use_fake_user=True;print('ACTION',name,flush=True)
rig.animation_data.action=bpy.data.actions['Idle_Neutral'];scene.frame_set(1)
# Non-destructive editable source; decimation is applied only to the export/review copy.
for o in meshes:
 ratio=.55 if o.name=='Kenji.Body' else .35 if 'casualsuit' in o.name else .40 if 'short01' in o.name else .55 if 'shoes' in o.name else 1
 if ratio<1:
  mod=o.modifiers.new('Browser reduction','DECIMATE');mod.ratio=ratio;mod.use_collapse_triangulate=True
  # Evaluate reduction before armature deformation.
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_move_up(modifier=mod.name)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.25
bpy.data.lights['Key'].energy=250;bpy.data.lights['Key'].size=2.2;bpy.data.lights['Fill'].energy=80;bpy.data.lights['Rim'].energy=210
scene.view_settings.look='AgX - Medium High Contrast'
cam=scene.camera;cam.location=(2.0,-5,1.45);cam.rotation_euler=(Vector((0,0,.91))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=2.04
scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.filepath=str(out/'kenji-full.png')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'kenji.blend'),compress=True)
for o in meshes:
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 for mod in list(o.modifiers):
  if mod.type=='DECIMATE':bpy.ops.object.modifier_apply(modifier=mod.name)
# Export all named actions. Blender's Y-up conversion makes the character face +Z in glTF.
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=rig
model=root/'assets/characters/realistic/kenji.glb';model.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(model),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_nla_strips=False,export_force_sampling=True,export_frame_range=False,export_skins=True,export_morph=False,export_cameras=False,export_lights=False)
report={'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes),'meshes':[{'name':o.name,'vertices':len(o.data.vertices),'triangles':sum(len(p.vertices)-2 for p in o.data.polygons)} for o in meshes],'clips':[a.name for a in bpy.data.actions],'textures':[{'name':i.name,'size':list(i.size)} for i in bpy.data.images if i.source=='FILE'],'bytes':model.stat().st_size,'heightMetres':1.76}
(out/'export-report.json').write_text(json.dumps(report,indent=2)+'\n');print('EXPORTED',report,flush=True)
bpy.ops.render.render(write_still=True)
# Close-up framed around the actual head bone rather than an assumed height.
head=rig.matrix_world@rig.pose.bones['head'].head;target=head+Vector((0,-.03,.06));cam.location=target+Vector((.28,-2.7,.07));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.56;scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.filepath=str(out/'kenji-face.png');bpy.ops.render.render(write_still=True)
rig.animation_data.action=bpy.data.actions['Walk'];scene.frame_set(7);cam.location=(2,-5,1.4);cam.rotation_euler=(Vector((0,0,.91))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=2.04;scene.render.resolution_y=1100;scene.render.filepath=str(out/'kenji-walk.png');bpy.ops.render.render(write_still=True)
print('TOWN_CHARACTER_EXPORTED',flush=True)

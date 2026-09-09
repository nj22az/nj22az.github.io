import bpy,sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2];out=root/'art/neighbours';out.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
rigs=[]
for i,number in enumerate(['00','01','02','09']):
 before=set(bpy.data.objects);before_actions=set(bpy.data.actions)
 bpy.ops.import_scene.gltf(filepath=str(root/'assets/characters/neighbours'/('resident-'+number+'.glb')))
 objects=set(bpy.data.objects)-before;acts=set(bpy.data.actions)-before_actions
 empty=bpy.data.objects.new('Review placement '+number,None);bpy.context.collection.objects.link(empty);empty.location.x=(i-1.5)*1.1
 for obj in objects:
  if obj.parent not in objects:obj.parent=empty
  if obj.animation_data:
   for track in obj.animation_data.nla_tracks:track.mute=True
 rig=next(o for o in objects if o.type=='ARMATURE');rigs.append((rig,acts));print('RIG',number,[ac.name for ac in acts],flush=True)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=20;scene.cycles.use_denoising=True
scene.render.resolution_x=1500;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.32,.36,.41,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;mat=bpy.data.materials.new('floor');mat.diffuse_color=(.18,.21,.24,1);floor.data.materials.append(mat)
for name,loc,power,size in [('Key',(-3,-4,5),600,5),('Fill',(4,-2,3),250,4),('Rim',(0,3,4),700,4)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,1))-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.4,-6,2));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=5;scene.camera=cam
for pose,frame in [('Walk',5),('Sit',48),('Run',4)]:
 for rig,acts in rigs:
  action=next(ac for ac in acts if ac.name.startswith(pose))
  rig.animation_data.action=action
 scene.frame_set(frame);scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/('fitted-cast-'+pose+'.png'));bpy.ops.render.render(write_still=True)

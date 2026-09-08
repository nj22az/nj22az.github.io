"""Render exported runtime GLBs, with the same guest seats as the game. No browser/GPU claim."""
import bpy,sys,argparse,json,math
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--root',required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(a.root).resolve();profiles=json.loads((root/'src/people/profiles.json').read_text())
def load(path,position,rotation=0,clip='Idle_Neutral'):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));added=set(bpy.data.objects)-before
 holder=bpy.data.objects.new('Placement',None);bpy.context.collection.objects.link(holder);holder.location=(position[0],-position[2],position[1]);holder.rotation_euler.z=-rotation
 for o in added:
  if o.parent not in added:o.parent=holder
  if o.type=='ARMATURE' and o.animation_data:
   actions=[o.animation_data.action]+[strip.action for track in o.animation_data.nla_tracks for strip in track.strips]
   action=next((ac for ac in actions if ac and ac.name.startswith(clip)),None)
   if action:o.animation_data.action=action
 return holder
bpy.ops.wm.read_factory_settings(use_empty=True)
load(root/'assets/models/izakaya/minato-interior.glb',(0,0,0))
for name,x,z,rot,clip in [('Nao',3.5,-3.8,math.pi,'Idle_Neutral'),('Aiko',-3.8,-1.42,0,'Sit'),('Kenji',-2.3,-1.42,0,'Drink'),('Mrs Sato',-.8,-1.42,0,'Sit'),('Emi',-4.1,1.12,math.pi,'Sit'),('Harbour master',2,3.08,0,'Sit')]:
 profile=next(p for p in profiles if p['name']==name);load(root/'assets/characters/living'/(profile['model']+'.glb'),(x,0,z),rot,clip)
scene=bpy.context.scene;scene.frame_set(24);scene.world=bpy.data.worlds.new('Warm room');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.73,.80,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.75
for at,energy,size in [((0,-5,10),1400,8),((-5,2,6),500,5)]:
 bpy.ops.object.light_add(type='AREA',location=at);bpy.context.object.data.energy=energy;bpy.context.object.data.size=size
bpy.ops.object.camera_add(location=(12,-19,15));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=19;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=1300;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.filepath=str(root/'art/izakaya/inhabited-review.png');bpy.ops.render.render(write_still=True)

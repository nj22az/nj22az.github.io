"""Local deformation review: run with Blender/Python bpy, -- --output <build dir>."""
import argparse,json,sys
from pathlib import Path
import bpy
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--output',required=True)
out=Path(p.parse_args(sys.argv[sys.argv.index('--')+1:]).output)
bpy.ops.wm.open_mainfile(filepath=str(out/'minato-barfly.blend'))
arm=bpy.data.objects['Barfly_Rig'];scene=bpy.context.scene
for track in arm.animation_data.nla_tracks:track.mute=True
arm.animation_data.action=None
for bone in arm.pose.bones:bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
def points(o,marker=None):
 bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(dg);m=e.to_mesh();v=[e.matrix_world@x.co for x in m.vertices if marker is None or any(g.group==o.vertex_groups[marker].index and g.weight>0 for g in x.groups)];e.to_mesh_clear();return v
fingers={}
for bone in arm.pose.bones:
 if not bone.name.startswith('finger.'):continue
 objects=[o for o in scene.objects if o.type=='MESH' and bone.name in o.vertex_groups]
 before=[v for o in objects for v in points(o)]
 bone.rotation_euler.x=.4
 after=[v for o in objects for v in points(o)]
 fingers[bone.name]=max((a-b).length for a,b in zip(before,after));bone.rotation_euler.x=0
morphs={}
for o in scene.objects:
 if o.type!='MESH' or not o.data.shape_keys:continue
 keys=o.data.shape_keys.key_blocks
 for key in list(keys)[1:]:
  morphs[o.name+'/'+key.name]=max((a.co-b.co).length for a,b in zip(key.data,keys[0].data))
poses={}
for name in ['Barfly_Drink_Loop','Barfly_Sleep_Loop']:
 arm.animation_data.action=bpy.data.actions[name]
 for obj in scene.objects:
  if obj.type=='MESH' and obj.data.shape_keys and obj.data.shape_keys.animation_data:
   keys=obj.data.shape_keys
   for track in keys.animation_data.nla_tracks:track.mute=True
   keys.animation_data.action=bpy.data.actions.get(obj.name+' | '+name)
 scene.frame_set(49)
 def part(name):
  marker='part:'+name
  obj=next(o for o in scene.objects if o.type=='MESH' and marker in o.vertex_groups)
  return points(obj,marker)
 mp=part('Mouth');gp=part('Beer rim');center=sum(mp,Vector())/len(mp)
 # Distance to nearest glass vertex is a useful failure diagnostic, not a complete contact test.
 samples=[]
 for frame in ([1,37,49,61,97,145] if 'Drink' in name else [1,37,73,109,145]):
  scene.frame_set(frame);bpy.context.view_layer.update()
  mp=part('Mouth');gp=part('Beer rim');center=sum(mp,Vector())/len(mp)
  samples.append({'frame':frame,'mouth_to_rim_m':min((v-center).length for v in gp),'head_z':(arm.matrix_world@arm.pose.bones['head'].head).z,'closed_eyes':all(obj.data.shape_keys.key_blocks['Blink.'+side].value>.99 for side in ['L','R'] for obj in [bpy.data.objects['Eye white.'+side],bpy.data.objects['Iris.'+side]])})
 poses[name]={'samples':samples}
 scene.frame_set(49)
 scene.render.resolution_percentage=75;scene.cycles.samples=16
 scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
report={'finger_displacement_m':fingers,'morph_max_delta_m':morphs,'poses':poses,'deformation_controls_passed':len(fingers)==28 and min(fingers.values())>.001 and min(morphs.values())>0}
(out/'deformation-review.json').write_text(json.dumps(report,indent=2)+'\n')
assert report['deformation_controls_passed'],report

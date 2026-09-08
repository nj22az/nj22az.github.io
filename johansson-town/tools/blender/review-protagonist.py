"""Render the actual Three.js-skinned poses exported by review-protagonist-geometry.mjs.
blender -b --python tools/blender/review-protagonist.py -- --root . --poses /tmp/protagonist-geometry.json
"""
import argparse,json,sys,math
from pathlib import Path
import bpy
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--root',required=True);p.add_argument('--poses',required=True);p.add_argument('--output');p.add_argument('--samples',type=int,default=24);a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(a.root).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'assets/characters/protagonist/johansson.glb'))
material=next(o for o in bpy.context.scene.objects if o.type=='MESH').data.materials[0]
for obj in list(bpy.context.scene.objects):bpy.data.objects.remove(obj,do_unlink=True)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=a.samples;s.render.resolution_x=600;s.render.resolution_y=720;s.render.resolution_percentage=100
s.world=bpy.data.worlds.new('Studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.74,.73,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.5
center=Vector((0,0,.95))
for loc,power,size in [((2,-3,4),400,3),((-2,-1,2),220,3),((0,3,3),300,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.65,-4,1.25));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.25;s.camera=cam
out=Path(a.output) if a.output else root/'art/characters/protagonist';out.mkdir(parents=True,exist_ok=True)
for frame in json.loads(Path(a.poses).read_text()):
 if frame['name']=='Wave':continue
 coords=frame['positions'];vertices=[(coords[i],-coords[i+2],coords[i+1]) for i in range(0,len(coords),3)];idx=frame['indices'];faces=[idx[i:i+3] for i in range(0,len(idx),3)]
 mesh=bpy.data.meshes.new(frame['name']);mesh.from_pydata(vertices,[],faces);mesh.update();uv=mesh.uv_layers.new(name='UVMap')
 for poly in mesh.polygons:
  poly.use_smooth=True
  for li in poly.loop_indices:
   v=mesh.loops[li].vertex_index;uv.data[li].uv=(frame['uv'][v*2],1-frame['uv'][v*2+1])
 o=bpy.data.objects.new(frame['name'],mesh);s.collection.objects.link(o);mesh.materials.append(material)
 s.render.filepath=str(out/(frame['name'].lower()+'.png'));bpy.ops.render.render(write_still=True);bpy.data.objects.remove(o,do_unlink=True)

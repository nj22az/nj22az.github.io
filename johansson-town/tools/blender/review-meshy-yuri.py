import bpy,math,sys,argparse
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument("--root",required=True);a=p.parse_args(sys.argv[sys.argv.index("--")+1:]);root=Path(a.root)
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'assets/characters/realistic/yuri-meshy.glb'))
world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.6;bpy.context.scene.world=world
for loc,power,size in [((2,-3,4),350,4),((-2,-1,1),100,3)]:
 d=bpy.data.lights.new('Softbox','AREA');d.energy=power;d.size=size;o=bpy.data.objects.new('Softbox',d);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(1,-2, .7));cam=bpy.context.object;cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=1.35
s=bpy.context.scene;s.camera=cam;s.render.engine='CYCLES';s.cycles.samples=12;s.render.resolution_x=700;s.render.resolution_y=700;s.render.resolution_percentage=100;s.render.filepath=str(root/'art/characters/yuri-meshy/preview.png');bpy.ops.render.render(write_still=True)

"""Render the actual source bridge plus exported Blender practice prop.
Run node tools/export-bridge-lantern-review.mjs first. This is Blender visual
evidence, not a claim about the browser renderer or physical device performance.
"""
import bpy,json,math,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/qa/bridge-polish-2026-11-02';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def B(p):return (p[0],-p[2],p[1])
for d in json.loads((OUT/'bridge-source-geometry.json').read_text()):
 mesh=bpy.data.meshes.new(d['name']);mesh.from_pydata([B(d['points'][i:i+3]) for i in range(0,len(d['points']),3)],[],[(i,i+1,i+2)for i in range(0,len(d['points'])//3,3)]);mesh.update()
 color=mesh.color_attributes.new(name='Col',type='FLOAT_COLOR',domain='CORNER')
 for i,v in enumerate(color.data):v.color=(*d['colours'][i*3:i*3+3],1)
 mat=bpy.data.materials.new(d['name']);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.6
 v=mat.node_tree.nodes.new('ShaderNodeVertexColor');v.layer_name='Col';mat.node_tree.links.new(v.outputs['Color'],bs.inputs['Base Color'])
 if d['glass']:bs.inputs['Transmission Weight'].default_value=.85;bs.inputs['Roughness'].default_value=.12
 o=bpy.data.objects.new(d['name'],mesh);bpy.context.collection.objects.link(o);mesh.materials.append(mat)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/models/ferry-bridge/bridge-lantern-v2.glb'))
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.cycles.use_denoising=True;s.render.threads_mode='FIXED';s.render.threads=2;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX'
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.8,.9,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.8
for name,p,power,size in [('Bridge daylight',(1,-2,5),650,5),('Room fill',(0,4,3),400,4)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=p;o.rotation_euler=(Vector((2,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
for name,p,target,scale in [
 ('console',(1.78,1.8,-1.60),(2.12,1.09,-.45),2.05),
 ('circuit-overview',(3.4,2.9,-1.9),(2.8,1.0,-.5),3.65),
 ('external-lamp',(3.35,1.75,-1.8),(3.99,1.14,-.84),1.20)]:
 if '--console-only' in sys.argv and name!='console':continue
 d=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(cam);cam.location=B(p);cam.rotation_euler=(Vector(B(target))-cam.location).to_track_quat('-Z','Y').to_euler();d.type='ORTHO';d.ortho_scale=scale;s.camera=cam;s.render.resolution_x=960;s.render.resolution_y=600;s.render.filepath=str(OUT/(name+'-final.png'));bpy.ops.render.render(write_still=True)

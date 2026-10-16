"""Render the game's original Johansson + Shush pose, not a re-drawn likeness."""
import bpy,sys,math,json
from pathlib import Path
from mathutils import Vector
root=Path(sys.argv[sys.argv.index('--')+1]).resolve();bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(root/'art/private-course-link/johansson-shush.glb'))
meshes=[o for o in scene.objects if o.type=='MESH']
# Reproduce the original game's garment shader exactly: alpha-mix paint over vertex colour.
# Standard glTF multiplies these, which would turn unpainted skin/clothes black.
for mesh in meshes:
 if not mesh.data.color_attributes:continue
 for material in mesh.data.materials:
  if not material or not material.use_nodes:continue
  nodes=material.node_tree.nodes;links=material.node_tree.links
  image=next((n for n in nodes if n.type=='TEX_IMAGE'),None);bsdf=next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
  if not image or not bsdf:continue
  vertex=nodes.new('ShaderNodeVertexColor');vertex.layer_name=mesh.data.color_attributes[0].name
  mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MIX';links.new(image.outputs['Alpha'],mix.inputs[0]);links.new(vertex.outputs['Color'],mix.inputs[1]);links.new(image.outputs['Color'],mix.inputs[2]);links.new(mix.outputs[0],bsdf.inputs['Base Color']);bsdf.inputs['Alpha'].default_value=1
points=[o.matrix_world@Vector(c)for o in meshes for c in o.bound_box];low=min(p.z for p in points);high=max(p.z for p in points)
# High-key studio lighting and transparent output. No browser renderer or extra homepage runtime.
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.film_transparent=True;scene.world=bpy.data.worlds.new('Studio');scene.world.color=(.32,.32,.32)
scene.view_settings.view_transform='Standard';scene.view_settings.exposure=-.5
for p,power,size in [((3,-4,6),230,4),((-3,-2,4),150,3)]:
 bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,(high+low)/2))-o.location).to_track_quat('-Z','Y').to_euler()
# Original avatar faces Three.js +Z, which is Blender -Y. Slight three-quarter front.
mid=(high+low)/2;bpy.ops.object.camera_add(location=(2,-6,mid+.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,mid))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=(high-low)*1.1;scene.camera=cam
scene.render.resolution_x=768;scene.render.resolution_y=1024;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(root/'art/private-course-link/johansson-shush.png');bpy.ops.render.render(write_still=True)
# Keep editable source with the exact posed rig and texture images packed.
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(root/'art/private-course-link/johansson-shush.blend'),compress=True)

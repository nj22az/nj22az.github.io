"""Import the actual shared avatar mesh/weights, save rigged Thao, render review views.
These are Blender renders of runtime geometry, not WebGL screenshots.
"""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2];qa=root/'docs/qa/thao-dress';out=root/'assets/models/wardrobe/ribbon-dress'
data=json.loads((qa/'thao-runtime.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def xyz(p):return (p[0],-p[2],p[1])
materials=[]
for item in data['materials']:
 mat=bpy.data.materials.new(item['name']);mat.use_nodes=True;n=mat.node_tree.nodes;l=mat.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Roughness'].default_value=.82
 base=None
 if item['vertexColors']:
  attr=n.new('ShaderNodeVertexColor');attr.layer_name='Color';base=attr.outputs['Color']
 if item['texture']:
  tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(qa/item['texture']));tex.image.pack()
  if item['garment']:
   mix=n.new('ShaderNodeMixRGB');mix.blend_type='MIX';l.new(tex.outputs['Alpha'],mix.inputs[0]);l.new(base,mix.inputs[1]);l.new(tex.outputs['Color'],mix.inputs[2]);base=mix.outputs[0]
  else:base=tex.outputs['Color']
 if base:l.new(base,bs.inputs['Base Color'])
 else:bs.inputs['Base Color'].default_value=(*item['color'],1)
 materials.append(mat)
# Exact shared bones and vertex weights from the runtime.
arm_data=bpy.data.armatures.new('Johansson shared skeleton');arm=bpy.data.objects.new('Thao - shared rig',arm_data);bpy.context.collection.objects.link(arm);bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for b in data['bones']:
 e=arm_data.edit_bones.new(b['name']);e.head=xyz(b['position']);e.tail=Vector(e.head)+Vector((0,0,.06))
for b in data['bones']:
 e=arm_data.edit_bones[b['name']]
 if b['parent']:e.parent=arm_data.edit_bones[b['parent']]
 # Aim at first meaningful child, preserving nonzero terminal bone length.
 children=[x for x in data['bones'] if x['parent']==b['name']]
 if children:
  p=Vector(xyz(children[0]['position']))
  if (p-e.head).length>.001:e.tail=p
bpy.ops.object.mode_set(mode='OBJECT');arm.show_in_front=True
for item in data['meshes']:
 pos=item['positions'];verts=[xyz(pos[i:i+3]) for i in range(0,len(pos),3)];idx=item['index'];faces=[idx[i:i+3] for i in range(0,len(idx),3)]
 m=bpy.data.meshes.new(item['name']);m.from_pydata(verts,[],faces);m.update();o=bpy.data.objects.new(item['name'],m);bpy.context.collection.objects.link(o);m.materials.append(materials[item['material']])
 for p in m.polygons:p.use_smooth=True
 if item.get('normals'):m.normals_split_custom_set_from_vertices([xyz(item['normals'][i:i+3]) for i in range(0,len(item['normals']),3)])
 if item['uv']:
  layer=m.uv_layers.new(name='UVMap');uv=item['uv']
  for i,loop in enumerate(m.loops):j=loop.vertex_index;layer.data[i].uv=uv[j*2:j*2+2]
 if item['colors']:
  colors=item['colors'];layer=m.color_attributes.new(name='Color',type='FLOAT_COLOR',domain='POINT')
  for i,v in enumerate(layer.data):v.color=(*colors[i*3:i*3+3],1)
 if item['skinIndex']:
  groups={n:o.vertex_groups.new(name=n) for n in item['bones']}
  for i in range(len(verts)):
   for k in range(4):
    w=item['skinWeight'][i*4+k]
    if w>.00001:groups[item['bones'][item['skinIndex'][i*4+k]]].add([i],w,'REPLACE')
 elif item['bone']:
  o.vertex_groups.new(name=item['bone']).add(list(range(len(verts))),1,'REPLACE')
 mod=o.modifiers.new('Shared avatar skeleton','ARMATURE');mod.object=arm;o.parent=arm
 o['source']='Exact shared runtime topology and weights; Blender-authored dress and waves'
# Neutral studio with broad soft lighting and a warm grey floor.
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012));floor=bpy.context.object;floor.name='Review floor'
fmat=bpy.data.materials.new('Warm grey');fmat.diffuse_color=(.22,.24,.24,1);floor.data.materials.append(fmat)
world=bpy.context.scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.42,.44,.46,1);world.node_tree.nodes['Background'].inputs[1].default_value=.3
for name,loc,power,size in [('Key',(-3,-4,5),260,4),('Fill',(3,-2,3),140,3),('Rim',(1,3,4),300,3)]:
 l=bpy.data.lights.new(name,'AREA');l.energy=power;l.shape='DISK';l.size=size;o=bpy.data.objects.new(name,l);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.9))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Thao review';cam.data.type='ORTHO';bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.render.image_settings.file_format='PNG'
def view(name,loc,target,scale):
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale;scene.render.filepath=str(qa/(name+'.png'));bpy.ops.render.render(write_still=True)
# Save the useful editable complete model, all face textures packed into the file.
cam.location=(2,-4,2);cam.rotation_euler=(Vector((0,0,.85))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=1.85
arm['recipe']=json.dumps(data['recipe']);bpy.ops.wm.save_as_mainfile(filepath=str(out/'Thao-ribbon-dress.blend'),compress=True)
# Portable rigged model as a second consumer of the same Blender reconstruction.
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for o in arm.children:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/'Thao-ribbon-dress.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False)
view('thao-front',(0,-4,1.15),(0,0,.82),1.84)
view('thao-three-quarter',(2,-4,1.5),(0,0,.84),1.84)
view('thao-back',(1.8,4,1.5),(0,0,.84),1.84)
view('thao-portrait',(.6,-4,1.55),(0,-.015,1.22),.85)
view('dress-detail',(.8,-4,1.25),(0,-.03,.85),.79)
print('THAO_REVIEW_COMPLETE')

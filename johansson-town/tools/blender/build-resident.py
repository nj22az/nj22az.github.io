"""Blender 4.2 LTS offline character authoring. Requires MPFB and CC0 system assets.
blender -b --factory-startup --python tools/blender/build-resident.py -- --mpfb /path/to/mpfb/src/mpfb --assets /path/to/system-assets --root /path/to/game
"""
import bpy, sys, os, shutil, importlib, argparse, math, json
from pathlib import Path
from mathutils import Vector,Quaternion
parser=argparse.ArgumentParser();parser.add_argument('--mpfb',required=True);parser.add_argument('--assets',required=True);parser.add_argument('--root',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(args.root);assets=Path(args.assets)
repo_path='/tmp/town-blender-extensions';os.makedirs(repo_path,exist_ok=True)
if not os.path.exists(repo_path+'/mpfb'):shutil.copytree(args.mpfb,repo_path+'/mpfb')
bpy.ops.preferences.extension_repo_add(name='town_authoring',use_custom_directory=True,custom_directory=repo_path,type='LOCAL')
repo=next(r for r in bpy.context.preferences.extensions.repos if r.directory==repo_path);module='bl_ext.'+repo.module+'.mpfb';bpy.ops.preferences.addon_enable(module=module)
HumanService=importlib.import_module(module+'.services.humanservice').HumanService
TargetService=importlib.import_module(module+'.services.targetservice').TargetService
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
macro={'age':.35,'gender':1.,'height':.5,'muscle':.56,'weight':.47,'proportions':.52,'cupsize':.5,'firmness':.5,'race':{'asian':1.,'caucasian':0.,'african':0.}}
base=HumanService.create_human(macro_detail_dict=macro);base.name='Kenji.Body'
rig=HumanService.add_builtin_rig(base,'game_engine');rig.name='Kenji.Rig'
print('RIG',[(b.name,tuple(b.head_local),tuple(b.tail_local)) for b in rig.data.bones],flush=True)

def simple_material(obj,mhmat,skin=False,hair=False):
 values={}
 for line in Path(mhmat).read_text().splitlines():
  words=line.strip().split(maxsplit=1)
  if len(words)==2 and not words[0].startswith('#'):values[words[0]]=words[1]
 mat=bpy.data.materials.new(obj.name+'.PBR');mat.use_nodes=True;nodes=mat.node_tree.nodes;links=mat.node_tree.links;bsdf=nodes.get('Principled BSDF')
 bsdf.inputs['Roughness'].default_value=.68 if skin else .82;bsdf.inputs['Specular IOR Level'].default_value=.27
 if skin:bsdf.inputs['Subsurface Weight'].default_value=.055
 for field,socket,colour in [('diffuseTexture','Base Color',True),('normalmapTexture','Normal',False)]:
  if field not in values:continue
  image_path=(Path(mhmat).parent/values[field]).resolve()
  if not image_path.exists():continue
  image=bpy.data.images.load(str(image_path),check_existing=True)
  limit=2048 if skin else 1024
  if max(image.size)>limit:image.scale(max(1,int(image.size[0]*limit/max(image.size))),max(1,int(image.size[1]*limit/max(image.size))))
  tex=nodes.new('ShaderNodeTexImage');tex.image=image;image.colorspace_settings.name='sRGB' if colour else 'Non-Color'
  if colour:
   links.new(tex.outputs['Color'],bsdf.inputs[socket])
   if hair:links.new(tex.outputs['Alpha'],bsdf.inputs['Alpha']);mat.surface_render_method='DITHERED'
  else:
   normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.55;links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],bsdf.inputs[socket])
  image.pack()
 obj.data.materials.clear();obj.data.materials.append(mat)
 return mat

simple_material(base,assets/'skins/young_asian_male/young_asian_male.mhmat',skin=True)
specs=[('clothes','male_casualsuit01','Clothes'),('clothes','shoes01','Clothes'),('hair','short01','Hair'),('eyes','low-poly','Eyes'),('eyebrows','eyebrow001','Eyebrows')]
meshes=[base]
for folder,name,kind in specs:
 path=assets/folder/name/(name+'.mhclo');obj=HumanService.add_mhclo_asset(str(path),base,asset_type=kind,subdiv_levels=0,material_type='NONE');obj.name='Kenji.'+name
 material_line=next(line.split(maxsplit=1)[1] for line in path.read_text().splitlines() if line.startswith('material '));simple_material(obj,(path.parent/material_line).resolve(),hair=kind in ['Hair','Eyebrows'])
 meshes.append(obj);print('FITTED',obj.name,len(obj.data.vertices),flush=True)
# Apply fitted macro shape and helper/covered-body masks before any optimisation.
for obj in meshes:
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
 if obj.data.shape_keys:bpy.ops.object.shape_key_remove(all=True,apply_mix=True)
 for mod in list(obj.modifiers):
  if mod.type=='MASK':bpy.ops.object.modifier_apply(modifier=mod.name)
 for poly in obj.data.polygons:poly.use_smooth=True
# Keep an editable, packed Blender source before decimation.
source=root/'art/characters/kenji';source.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source/'kenji-source.blend'),compress=True)
# Stage a natural standing pose by rotating upper arms toward the body.
for bone in rig.pose.bones:bone.rotation_mode='QUATERNION'
for name in ['upperarm_l','upperarm_r']:
 bone=rig.pose.bones.get(name)
 if bone:
  rest=bone.bone;direction=(rest.tail_local-rest.head_local).normalized();desired=Vector((.10 if name.endswith('_l') else -.10,-.025,-1)).normalized()
  global_rotation=direction.rotation_difference(desired);basis=rest.matrix_local.to_quaternion();bone.rotation_quaternion=basis.inverted()@global_rotation@basis
bpy.context.view_layer.update()
# CPU studio render is an actual asset render, not a generated concept image.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.world.color=(.10,.10,.10)
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.21,.24,.27,1);world.node_tree.nodes['Background'].inputs[1].default_value=.4
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.006));floor=bpy.context.object;floor.name='StudioFloor';mat=bpy.data.materials.new('StudioFloor');mat.diffuse_color=(.12,.14,.15,1);floor.data.materials.append(mat)
for name,loc,power,size in [('Key',(-3,-4,4),450,4),('Fill',(3,-2,2.5),170,3),('Rim',(0,2,3),500,3)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,1.2))-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(2.2,-4.7,1.55));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.04))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.25;scene.camera=cam
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(source/'kenji-full.png');bpy.ops.render.render(write_still=True)
cam.location=(.30,-2.7,1.68);cam.rotation_euler=(Vector((0,-.02,1.53))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.72;scene.render.resolution_x=900;scene.render.resolution_y=1000;scene.render.filepath=str(source/'kenji-face.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source/'kenji-review.blend'),compress=True)
report={'phenotype':macro,'meshes':[{'name':o.name,'vertices':len(o.data.vertices),'triangles':sum(len(p.vertices)-2 for p in o.data.polygons)} for o in meshes],'bones':[b.name for b in rig.data.bones]}
(source/'construction.json').write_text(json.dumps(report,indent=2)+'\n')
print('TOWN_CHARACTER_RENDERED',source,flush=True)

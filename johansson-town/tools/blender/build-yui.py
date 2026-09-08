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
macro={'age':.28,'gender':0.,'height':.5,'muscle':.30,'weight':.50,'proportions':.45,'cupsize':.30,'firmness':.5,'race':{'asian':1.,'caucasian':0.,'african':0.}}
base=HumanService.create_human(macro_detail_dict=macro);base.name='Yui.Body'
# Subtle authored facial changes, fitted before the eyes, hair and rig.
face_targets={'nose/nose-scale-depth-decr':.40,'chin/chin-height-decr':.35,'chin/chin-bones-decr':.22,'mouth/mouth-upperlip-volume-decr':.48,'mouth/mouth-lowerlip-volume-decr':.40,'mouth/mouth-upperlip-ext-up':.65,'mouth/mouth-lowerlip-ext-up':.55,'cheek/l-cheek-volume-incr':.22,'cheek/r-cheek-volume-incr':.22,'eyes/l-eye-scale-decr':.08,'eyes/r-eye-scale-decr':.08}
face_targets.update({'expression/units/asian/mouth-corner-puller':.38,'expression/units/asian/mouth-upward-retraction':.12,'expression/units/asian/eye-left-slit':.07,'expression/units/asian/eye-right-slit':.07})
for fragment,weight in face_targets.items():
 TargetService.load_target(base,str(Path(args.mpfb)/'data/targets'/(fragment+'.target.gz')),weight=weight)
rig=HumanService.add_builtin_rig(base,'game_engine');rig.name='Yui.Rig'
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

simple_material(base,assets/'skins/young_asian_female/young_asian_female.mhmat',skin=True)
specs=[('clothes','female_elegantsuit01','Clothes'),('clothes','shoes03','Clothes'),('hair','long01','Hair'),('eyes','low-poly','Eyes'),('eyebrows','eyebrow001','Eyebrows')]
meshes=[base]
for folder,name,kind in specs:
 path=assets/folder/name/(name+'.mhclo');obj=HumanService.add_mhclo_asset(str(path),base,asset_type=kind,subdiv_levels=0,material_type='NONE');obj.name='Yui.'+name
 material_line=next(line.split(maxsplit=1)[1] for line in path.read_text().splitlines() if line.startswith('material '));simple_material(obj,(path.parent/material_line).resolve(),hair=kind in ['Hair','Eyebrows'])
 meshes.append(obj);print('FITTED',obj.name,len(obj.data.vertices),flush=True)
# Apply fitted macro shape and helper/covered-body masks before any optimisation.
for obj in meshes:
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
 if obj.data.shape_keys:bpy.ops.object.shape_key_remove(all=True,apply_mix=True)
 for mod in list(obj.modifiers):
  if mod.type=='MASK':bpy.ops.object.modifier_apply(modifier=mod.name)
 for poly in obj.data.polygons:poly.use_smooth=True
# Original pink store uniform and head accessories, inspired by the supplied style reference.
cloth=next(o for o in meshes if 'elegantsuit' in o.name)
for node in cloth.active_material.node_tree.nodes:
 if node.type=='TEX_IMAGE' and node.image.colorspace_settings.name=='sRGB':
  image=node.image;_=image.pixels[0];image.scale(1024,1024)
  import array
  pixels=array.array('f',[0])*(1024*1024*4);image.pixels.foreach_get(pixels)
  for i in range(0,len(pixels),4):
   light=.86+.14*(pixels[i]+pixels[i+1]+pixels[i+2])/3
   pixels[i]=light*.78;pixels[i+1]=light*.43;pixels[i+2]=light*.51
  fresh=bpy.data.images.new('Yui.PinkCotton',width=1024,height=1024);fresh.pixels.foreach_set(pixels);fresh.pack();node.image=fresh
hairObj=next(o for o in meshes if 'long01' in o.name)
for node in hairObj.active_material.node_tree.nodes:
 if node.type=='TEX_IMAGE' and node.image.colorspace_settings.name=='sRGB':
  old=node.image;_=old.pixels[0];old.scale(1024,1024);pixels=array.array('f',[0])*(1024*1024*4);old.pixels.foreach_get(pixels)
  for i in range(0,len(pixels),4):
   value=(pixels[i]+pixels[i+1]+pixels[i+2])/3;pixels[i]=value*.20;pixels[i+1]=value*.17;pixels[i+2]=value*.16
  fresh=bpy.data.images.new('Yui.long01.black',width=1024,height=1024,alpha=True);fresh.pixels.foreach_set(pixels);fresh.pack();node.image=fresh
# Ease the skirt into an A-line; retain its original skin weights.
for v in cloth.data.vertices:
 if .38<v.co.z<.78:
  flare=1+.42*(.78-v.co.z)/.40;v.co.x*=flare;v.co.y*=1+(flare-1)*.6
pink=bpy.data.materials.new('Yui.RibbonPink');pink.diffuse_color=(.58,.20,.30,1);pink.use_nodes=True;pink.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=pink.diffuse_color
cream=bpy.data.materials.new('Yui.CreamCotton');cream.diffuse_color=(.9,.84,.71,1);cream.use_nodes=True;cream.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=cream.diffuse_color
metal=bpy.data.materials.new('Yui.RoseGlasses');metal.diffuse_color=(.40,.22,.22,1);metal.use_nodes=True;metal.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=metal.diffuse_color;metal.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value=.65
accessories=[]
def bind(obj,name,material,bone):
 obj.name='Yui.'+name;obj.data.materials.append(material)
 group=obj.vertex_groups.new(name=bone);group.add(list(range(len(obj.data.vertices))),1,'REPLACE');mod=obj.modifiers.new('Armature','ARMATURE');mod.object=rig
 for face in obj.data.polygons:face.use_smooth=True
 meshes.append(obj);accessories.append(obj);return obj
def ellipsoid(name,location,scale,material,bone):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=location);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return bind(o,name,material,bone)
head=rig.data.bones['head'];neck=rig.data.bones['neck_01'].head_local
# Fit sewn cloth to the actual chest surface.
def surfaceY(x,z):
 candidates=sorted((v.co for v in base.data.vertices if v.co.y<0),key=lambda v:(v.x-x)**2+(v.z-z)**2)[:6]
 return min(v.y for v in candidates)-.012
# Flat sewn Peter Pan collar, not inflated spheres.
for side in [-1,1]:
 outline=[(0,0),(.027,.004)]+[(.032+.022*math.cos(t),-.018+.027*math.sin(t)) for t in [1.25,.95,.65,.35,0,-.35,-.7,-1.05,-1.4,-1.75,-2.1,-2.45]]+[(.012,-.022)]
 verts=[(side*x,surfaceY(side*x,neck.z+z-.007),neck.z+z-.007) for x,z in outline]
 data=bpy.data.meshes.new('SewnCollar');data.from_pydata(verts,[],[(0,i+1,i) if side<0 else (0,i,i+1) for i in range(1,len(verts)-1)]);data.update();o=bpy.data.objects.new('Collar',data);bpy.context.scene.collection.objects.link(o);bind(o,'Collar',cream,'spine_03')
 solid=o.modifiers.new('Cloth thickness','SOLIDIFY');solid.thickness=.0015
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=solid.name)
# A small cloth tie covers the blouse opening.
verts=[(-.012,neck.y-.080,neck.z-.026),(.012,neck.y-.080,neck.z-.026),(.018,neck.y-.072,neck.z-.125),(0,neck.y-.072,neck.z-.147),(-.018,neck.y-.072,neck.z-.125)]
verts=[(x,surfaceY(x,z)-.003,z) for x,y,z in verts]
data=bpy.data.meshes.new('CottonTie');data.from_pydata(verts,[],[(0,1,2,3,4)]);o=bpy.data.objects.new('Tie',data);bpy.context.scene.collection.objects.link(o);bind(o,'CollarTie',pink,'spine_03')
# Fit the glasses to the exported eyes rather than a guessed face position.
eyes=next(o for o in meshes if 'low-poly' in o.name);points=[eyes.matrix_world@v.co for v in eyes.data.vertices];eyeZ=(min(v.z for v in points)+max(v.z for v in points))/2;eyeY=min(v.y for v in points)-.010
for side in [-1,1]:
 verts=[(side*.035+.027*math.cos(i*math.tau/32),eyeY,eyeZ+.014*math.sin(i*math.tau/32)) for i in range(33)]
 curve=bpy.data.curves.new('Glasses rim','CURVE');curve.dimensions='3D';curve.bevel_depth=.0009;curve.bevel_resolution=2;spline=curve.splines.new('POLY');spline.points.add(32)
 for point,co in zip(spline.points,verts):point.co=(*co,1)
 o=bpy.data.objects.new('Rim',curve);scene=bpy.context.scene;scene.collection.objects.link(o);bpy.ops.object.select_all(action='DESELECT');bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');bind(bpy.context.object,'GlassesRim',metal,'head');bpy.ops.object.select_all(action='DESELECT')
ellipsoid('GlassesBridge',(0,eyeY,eyeZ+.004),(.01,.0016,.0016),metal,'head')
hair=next(o for o in meshes if 'long01' in o.name);hatZ=max((hair.matrix_world@v.co).z for v in hair.data.vertices)-.058
# Keep the hidden scalp cards underneath the fitted hat brim.
for covered in [hair,base]:
 for vertex in covered.data.vertices:
  if vertex.co.z>hatZ+.005:vertex.co.z=hatZ+.005
# Brim and crown form one continuous hat mesh.
verts=[];faces=[];profile=[(.125,-.020),(.105,-.017),(.098,.012),(.081,.038),(.040,.048),(.002,.048)]
for r,dz in profile:
 for n in range(48):
  angle=n*math.tau/48;verts.append((r*math.cos(angle),.005+r*.93*math.sin(angle),hatZ+dz+.028))
for row in range(len(profile)-1):
 for n in range(48):faces.append((row*48+n,row*48+(n+1)%48,(row+1)*48+(n+1)%48,(row+1)*48+n))
data=bpy.data.meshes.new('BrimmedHat');data.from_pydata(verts,[],faces);o=bpy.data.objects.new('Hat',data);bpy.context.scene.collection.objects.link(o);hatMat=cream.copy();hatMat.name='Yui.Straw';hatMat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.72,.61,.42,1);hatMat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.92;bind(o,'CreamBeret',hatMat,'head')
for side in [-1,1]:
 o=ellipsoid('RibbonLoop',(-.103+side*.021,-.020,hatZ-.025),(.025,.004,.015),pink,'head');o.rotation_euler.y=side*.45
ellipsoid('RibbonKnot',(-.103,-.033,hatZ-.026),(.012,.010,.013),pink,'head')
for side in [-1,1]:
 o=ellipsoid('RibbonTail',(-.103+side*.012,-.005,hatZ-.090),(.010,.002,.045),pink,'head');o.rotation_euler.y=side*.17
# Keep an editable, packed Blender source before decimation.
source=root/'art/characters/yui';source.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source/'yui-source.blend'),compress=True)
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
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(source/'yui-full.png');bpy.ops.render.render(write_still=True)
cam.location=(.30,-2.7,1.68);cam.rotation_euler=(Vector((0,-.02,1.53))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.72;scene.render.resolution_x=900;scene.render.resolution_y=1000;scene.render.filepath=str(source/'yui-face.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(source/'yui-review.blend'),compress=True)
report={'phenotype':macro,'faceTargets':face_targets,'meshes':[{'name':o.name,'vertices':len(o.data.vertices),'triangles':sum(len(p.vertices)-2 for p in o.data.polygons)} for o in meshes],'bones':[b.name for b in rig.data.bones]}
(source/'construction.json').write_text(json.dumps(report,indent=2)+'\n')
print('TOWN_CHARACTER_RENDERED',source,flush=True)

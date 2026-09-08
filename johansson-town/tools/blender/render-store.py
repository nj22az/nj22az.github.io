"""CPU review of actual Three.js store geometry exported by tools/review/export-store.mjs."""
import bpy,json,sys,argparse
from pathlib import Path
from mathutils import Matrix,Vector
p=argparse.ArgumentParser();p.add_argument('--root',required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(a.root)
for kind in ['interior','exterior']:
 bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
 data=json.loads(Path('/tmp/town-store-'+kind+'.json').read_text());mats={};geos={}
 for key,m in data['materials'].items():
  mat=bpy.data.materials.new(key);mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(*m['color'],1);bs.inputs['Roughness'].default_value=m.get('roughness',.7);bs.inputs['Alpha'].default_value=m.get('opacity',1)
  if m.get('emissive'):bs.inputs['Emission Color'].default_value=(*m['emissive'],1);bs.inputs['Emission Strength'].default_value=m.get('emission',0)
  path=Path('/tmp/town-review-labels')/(key+'.png')
  if path.exists():tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path));mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
  mats[key]=mat
 conversion=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
 for entry in data['objects']:
  key=entry['geometry'];cache=(key,entry['material'])
  if cache not in geos:
   g=data['geometry'][key];vertices=list(zip(*[iter(g['positions'])]*3));indices=g['indices'] or list(range(len(vertices)));faces=list(zip(*[iter(indices)]*3));mesh=bpy.data.meshes.new(key);mesh.from_pydata(vertices,[],faces);mesh.materials.append(mats[entry['material']]);mesh.update()
   if g['uv']:
    uv=mesh.uv_layers.new();coords=list(zip(*[iter(g['uv'])]*2))
    for poly in mesh.polygons:
     for li in poly.loop_indices:uv.data[li].uv=coords[mesh.loops[li].vertex_index]
   geos[cache]=mesh
  o=bpy.data.objects.new('StoreGeometry',geos[cache]);scene.collection.objects.link(o);values=entry['matrix'];o.matrix_world=conversion@Matrix([values[i:i+4] for i in range(0,16,4)]).transposed()
 if kind=='interior':
  before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(root/'assets/characters/realistic/yui.glb'));added=set(bpy.data.objects)-before;holder=bpy.data.objects.new('Yuri',None);scene.collection.objects.link(holder)
  for o in added:
   if o.parent not in added:o.parent=holder
  scene.frame_set(1);bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();points=[o.matrix_world@v.co for o in added if o.type=='MESH' for v in o.evaluated_get(deps).data.vertices];height=max(v.z for v in points)-min(v.z for v in points);factor=1.62/height;holder.scale*=factor;holder.location=(2.7,2.25,.08-min(v.z for v in points)*factor)
  for x in [-3.4,2.9]:
   for y in [-1.4,3.0]:
    lamp=bpy.data.lights.new('Fluorescent','AREA');lamp.energy=110;lamp.shape='RECTANGLE';lamp.size=.5;lamp.size_y=1.8;o=bpy.data.objects.new('Fluorescent',lamp);scene.collection.objects.link(o);o.location=(x,y,3.82)
  camera=(.1,-5.2,1.72);target=(0,1.6,1.7)
 else:
  bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;mat=bpy.data.materials.new('Street');mat.diffuse_color=(.34,.37,.35,1);floor.data.materials.append(mat)
  lamp=bpy.data.lights.new('Sun','SUN');lamp.energy=2.0;o=bpy.data.objects.new('Sun',lamp);scene.collection.objects.link(o);o.rotation_euler=(.6,-.4,-.6);camera=(2.4,-8.5,2.5);target=(-8.8,0,1.8)
 scene.world=bpy.data.worlds.new('Clear September');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.70,.82,.89,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.55
 bpy.ops.object.camera_add(location=camera);cam=bpy.context.object;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=23 if kind=='interior' else 35;scene.camera=cam
 scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.view_settings.look='AgX - Medium High Contrast';scene.render.resolution_x=1280;scene.render.resolution_y=820;scene.render.resolution_percentage=100;scene.render.filepath=str(root/'art/store'/('sakura-'+kind+'.png'));scene.render.image_settings.file_format='PNG';bpy.ops.render.render(write_still=True)

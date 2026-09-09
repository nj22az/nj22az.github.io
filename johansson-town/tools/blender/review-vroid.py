"""CPU review of the shipped geometry, atlases and clips; Blender 4.2 LTS.

blender -b -t 4 -P tools/blender/review-vroid.py -- /path/to/review-output
These renders inspect assets, not a browser or a mocked game screenshot.
"""
import bpy, math, sys, json, struct
from pathlib import Path
from mathutils import Vector

root=Path(__file__).resolve().parents[2]
out=Path(sys.argv[sys.argv.index('--')+1]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
cast=[('Aiko','long','#493447','#967a99',1.59),('Kenji','casual','#343341','#527d99',1.76),
      ('Mrs Sato','bob','#b9b4bd','#ad6178',1.55),('Harbour master','vest','#95959e','#405d7e',1.74),
      ('Emi','ponytail','#755544','#c37889',1.61),('Nao','bob','#574337','#b87359',1.65)]
rigs=[]
def colour(s):
    rgb=[int(s[i:i+2],16)/255 for i in (1,3,5)]
    return [c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb]
for index,(name,base,hair,top,height) in enumerate(cast):
    before=set(bpy.data.objects);actions=set(bpy.data.actions)
    path=root/'assets/characters/vroid'/('vroid-'+base+'.glb')
    raw=path.read_bytes();data=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]])
    bpy.ops.import_scene.gltf(filepath=str(path))
    objects=set(bpy.data.objects)-before;actions=set(bpy.data.actions)-actions
    rig=next(o for o in objects if o.type=='ARMATURE');rigs.append((rig,actions))
    meshes=[o for o in objects if o.type=='MESH'];bpy.context.view_layer.update()
    positions=[data['accessors'][p['attributes']['POSITION']] for m in data['meshes'] for p in m['primitives']]
    scale=height/(max(p['max'][1] for p in positions)-min(p['min'][1] for p in positions))
    place=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(place)
    for o in objects:
        if o.parent not in objects:o.parent=place
        if o.animation_data:
            for track in o.animation_data.nla_tracks:track.mute=True
    place.scale=(scale,scale,scale);place.location.x=(index-2.5)*.88
    for obj in meshes:
        if obj.data.shape_keys:
            for k in obj.data.shape_keys.key_blocks:
                if k.name=='Smile':k.value=.12
        for slot in obj.material_slots:
            mat=slot.material.copy();slot.material=mat
            tint=colour(hair) if 'hair' in mat.name else [c*.76+.24 for c in colour(top)] if 'wardrobe' in mat.name else None
            if not tint:continue
            nodes=mat.node_tree.nodes;links=mat.node_tree.links
            texture=next(n for n in nodes if n.type=='TEX_IMAGE')
            destinations=[l.to_socket for l in list(links) if l.from_socket==texture.outputs['Color']]
            mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*tint,1)
            links.new(texture.outputs['Color'],mix.inputs[1])
            for socket in destinations:links.new(mix.outputs[0],socket)
    # The actual runtime adds head-bound spectacles for these profiles. Match
    # their open-frame geometry here to inspect fit, without drawing lenses.
    if name in ['Aiko','Mrs Sato','Harbour master']:
        bpy.context.view_layer.update()
        head=rig.pose.bones['J_Bip_C_Head'];head_pos=rig.matrix_world@head.head
        centres=[head_pos+Vector((-p[0],p[2],p[1]))*scale for p in data['extras']['eyeCentres']];spread=(centres[0]-centres[1]).length;radius=spread*.38
        curves=bpy.data.curves.new(name+' frames','CURVE');curves.dimensions='3D';curves.bevel_depth=.0018*scale;curves.bevel_resolution=2
        for centre in centres:
            s=curves.splines.new('POLY');s.points.add(27);s.use_cyclic_u=True
            for j,p in enumerate(s.points):
                a=j*math.tau/28;p.co=(*((centre+Vector((math.cos(a)*radius,-.012*scale,math.sin(a)*radius*.83))).to_tuple()),1)
        frame=bpy.data.objects.new(name+' spectacles',curves);bpy.context.collection.objects.link(frame)
        # Keep world placement when binding to the animated head.
        frame.parent=rig;frame.parent_type='BONE';frame.parent_bone=head.name
        frame.matrix_parent_inverse=(rig.matrix_world@head.matrix@__import__('mathutils').Matrix.Translation((0,head.length,0))).inverted()
        mat=bpy.data.materials.new('Frames');mat.diffuse_color=(.13,.08,.11,1);curves.materials.append(mat)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.resolution_x=1680;scene.render.resolution_y=780;scene.render.resolution_percentage=100
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.76,.77,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.75
scene.view_settings.view_transform='Standard';scene.render.film_transparent=False
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;mat=bpy.data.materials.new('Review floor');mat.diffuse_color=(.56,.63,.61,1);floor.data.materials.append(mat)
bpy.ops.object.light_add(type='AREA',location=(-3,-4,6));bpy.context.object.data.energy=500;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=5
bpy.ops.object.camera_add(location=(.12,-7,1.95));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=5.7;scene.camera=cam
scene.render.image_settings.file_format='PNG';scene.render.fps=24
for pose,frame in [('Sit',36),('Idle_Neutral',1),('Walk',5),('Wave',24),('Drink',48)]:
    requested=sys.argv[sys.argv.index('--')+2:]
    if requested and pose not in requested:continue
    for rig,actions in rigs:rig.animation_data.action=next(a for a in actions if a.name.startswith(pose))
    scene.frame_set(frame);scene.render.filepath=str(out/(pose+'.png'));bpy.ops.render.render(write_still=True)

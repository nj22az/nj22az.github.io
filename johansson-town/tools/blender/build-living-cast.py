"""Original soft-styled neighbourhood cast, rigid-weighted articulated meshes.
Yuri is intentionally excluded: her supplied model and animation remain untouched.
"""
import bpy, math, json, sys, argparse
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--root',required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(a.root).resolve();out=root/'assets/characters/living';out.mkdir(parents=True,exist_ok=True);art=root/'art/living-cast';art.mkdir(parents=True,exist_ok=True)
profiles=json.loads((root/'src/people/profiles.json').read_text());report=[]
def color(v):
 v=v.lstrip('#');return tuple((int(v[i:i+2],16)/255)**2.2 for i in (0,2,4))
def material(name,c,rough=.65):
 m=bpy.data.materials.new(name);m.use_nodes=True;bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(*color(c),1);bs.inputs['Roughness'].default_value=rough;return m
def xyz(v):return(v[0],-v[2],v[1])
for index,p in enumerate(profiles):
 bpy.ops.wm.read_factory_settings(use_empty=True);parts=[]
 skin=material('Warm skin',['e6b99b','d8a788','c99476'][index%3],.6);hair=material('Hair','b8aaa0' if p['age']>60 else ['292127','45302b','322e37'][index%3],.72);coat=material('Clothing',p['top']);shirt=material('Cotton','f7e8cc');trousers=material('Trousers','41445b');shoe=material('Shoes','473333',.42);white=material('Eye white','fff7e9',.4);iris=material('Warm brown iris','674334',.3);pupil=material('Pupil','241c27',.28);lip=material('Smile','a66565');blush=material('Cheeks','dfa197');brass=material('Buttons','dfb76a',.38)
 female=p['female'];build=p['build'];h=p['height'];scale=h/1.8
 def register(o,m,bone):
  o.data.materials.append(m);g=o.vertex_groups.new(name=bone);g.add(list(range(len(o.data.vertices))),1,'REPLACE');parts.append(o);return o
 def ell(name,at,sz,m,bone='Head',segments=16):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=8,radius=1,location=xyz(at));o=bpy.context.object;o.name=name;o.scale=(sz[0],sz[2],sz[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
  for f in o.data.polygons:f.use_smooth=True
  return register(o,m,bone)
 def box(name,at,sz,m,bone='Spine',bevel=.025):
  bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(at));o=bpy.context.object;o.name=name;o.dimensions=(sz[0],sz[2],sz[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);b=o.modifiers.new('Tailored soft edge','BEVEL');b.width=min(bevel,min(sz)/3);b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name);o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=o.modifiers[-1].name);return register(o,m,bone)
 def curve(name,points,r,m,bone='Head'):
  c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=3;c.bevel_depth=r;c.bevel_resolution=1;s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
  for b,pt in zip(s.bezier_points,points):b.co=xyz(pt);b.handle_left_type='AUTO';b.handle_right_type='AUTO'
  o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.select_set(False);return register(o,m,bone)
 def tailored(name,rings,m,bone):
  vertices=[];faces=[];count=20
  for y,rx,rz in rings:
   for i in range(count):
    t=i*math.tau/count;vertices.append(xyz((math.cos(t)*rx,y,math.sin(t)*rz)))
  for j in range(len(rings)-1):
   for i in range(count):a=j*count+i;b=j*count+(i+1)%count;faces.append((a,b,b+count,a+count))
  faces.append(tuple(reversed(range(count))));faces.append(tuple((len(rings)-1)*count+i for i in range(count)))
  mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
  for f in mesh.polygons:f.use_smooth=True
  return register(o,m,bone)
 # Rounded cloth volumes, shoulders narrower than head-to-body reference exaggerations.
 tailored('Tailored torso',[(.9,.19*build,.13),(.96,.21*build,.145),(1.17,.235*build,.15),(1.34,.24*build,.14),(1.40,.205*build,.115),(1.435,.085,.06)],coat,'Spine')
 ell('Hips',(0,.9,0),(.21*build,.14,.14),trousers,'Hips')
 box('Shirt front',(0,1.23,-.141),(.15,.31,.028),shirt)
 for side in [-1,1]:
  o=box('Collar',(side*.057,1.40,-.12),(.09,.11,.035),shirt);o.rotation_euler.y=side*.28
  for y in [1.28,1.16,1.04]:ell('Button',(0,y,-.165),(.011,.011,.007),brass,'Spine',12)
 ell('Neck',(0,1.47,0),(.064,.10,.06),skin,'Spine')
 # Face: gently tapered chin, eyes set within the front plane, small smiling mouth.
 ell('Face',(0,1.63,-.005),(.147 if female else .158,.185,.135),skin)
 ell('Chin',(0,1.525,-.030),(.101,.078,.097),skin)
 for side in [-1,1]:
  x=side*.061
  ell('Ear',(side*.152,1.61,.0),(.028,.044,.024),skin)
  ell('Eyes',(x,1.647,-.128),(.038,.021,.012),white)
  ell('Iris',(x,1.647,-.139),(.017,.020,.006),iris)
  ell('Pupil',(x,1.647,-.144),(.009,.015,.003),pupil)
  ell('Eye sparkle',(x-.006,1.654,-.147),(.005,.005,.002),white,segments=12)
  curve('Upper lid',[(x-.037,1.649,-.137),(x,1.668,-.139),(x+.034,1.649,-.137)],.0035,hair)
  curve('Soft brow',[(x-.031,1.699,-.120),(x,1.709,-.125),(x+.032,1.701,-.119)],.005,hair)
  ell('Cheek',(side*.095,1.599,-.12),(.026,.009,.004),blush)
 ell('Nose',(0,1.61,-.143),(.020,.028,.025),skin)
 curve('Smile',[(-.034,1.56,-.128),(0,1.552,-.135),(.034,1.56,-.128)],.0035,lip)
 # Hair cap above eyes; asymmetric swept locks instead of a helmet crossing the forehead.
 ell('Hair crown',(0,1.738,.016),(.157,.092,.142),hair)
 style=p['hairStyle']
 if style!='receding':
  for i in range(7):
   x=-.125+i*.038
   curve('Swept fringe',[(x,1.776,-.03),(x-.018,1.746,-.115),(x-.027,1.711+(i%3)*.007,-.127)],.024 if style!='curly' else .031,hair)
 for side in [-1,1]:ell('Side hair',(side*.135,1.678,.025),(.033,.09,.109),hair)
 if style=='bob':
  for side in [-1,1]:ell('Bob curtain',(side*.14,1.61,.055),(.044,.15,.11),hair)
  ell('Bob back',(0,1.625,.11),(.15,.16,.063),hair)
 if style in ['bun','pony','braid']:
  ell('Hair tie',(0,1.70,.14),(.047,.043,.03),coat)
  if style=='bun':ell('Loose bun',(0,1.75,.16),(.071,.064,.065),hair)
  else:
   for j in range(5 if style=='braid' else 3):ell('Hair tail',(((-1)**j*.015 if style=='braid' else .018*j),1.67-j*.064,.16),(.041,.052,.043),hair)
 if style=='curly':
  for i in range(9):ell('Soft curl',(-.12+(i%5)*.06,1.76+(i%2)*.035,-.015+(i//5)*.085),(.043,.045,.047),hair,segments=16)
 if index in [0,12,13,18]:
  for side in [-1,1]:
   x=side*.061
   curve('Spectacles',[(x+math.cos(t)*.045,1.646+math.sin(t)*.032,-.15) for t in [i*math.tau/16 for i in range(17)]],.003,brass)
  curve('Bridge',[(-.018,1.655,-.15),(0,1.66,-.16),(.018,1.655,-.15)],.003,brass)
 if p['name'] in ['Harbour master','Mr Fujita']:
  for side in [-1,1]:ell('Moustache',(side*.022,1.582,-.143),(.024,.008,.009),hair)
 if female:ell('Hair ornament',(.15,1.718,-.045),(.022,.025,.013),coat)
 outfit=p['outfit']
 if outfit=='apron':
  box('Apron bib',(0,1.19,-.158),(.28,.31,.025),shirt)
  box('Apron skirt',(0,.89,-.167),(.38,.34,.034),coat,'Hips',.05)
  box('Apron pocket',(0,.99,-.19),(.19,.10,.024),shirt,'Hips')
 if outfit in ['work','jacket']:
  for side in [-1,1]:box('Chest pocket',(side*.137,1.25,-.137),(.105,.105,.028),coat)
 if outfit=='vest':
  for side in [-1,1]:box('Vest panel',(side*.105,1.18,-.146),(.09,.34,.04),coat)
 bones={'Hips':((0,.91,0),(0,1.05,0),None),'Spine':((0,1.05,0),(0,1.46,0),'Hips'),'Head':((0,1.46,0),(0,1.8,0),'Spine')}
 for side,suffix in [(-1,'L'),(1,'R')]:
  sx=side*.245*build;legx=side*.105*build
  bones['UpperArm'+suffix]=((sx,1.37,0),(sx,1.10,0),'Spine');bones['Forearm'+suffix]=((sx,1.10,0),(sx,.85,0),'UpperArm'+suffix)
  bones['Thigh'+suffix]=((legx,.9,0),(legx,.49,0),'Hips');bones['Calf'+suffix]=((legx,.49,0),(legx,.09,0),'Thigh'+suffix)
  armMat=shirt if outfit in ['vest','apron'] else coat
  ell('Sleeve',(sx,1.245,0),(.076,.185,.078),armMat,'UpperArm'+suffix)
  ell('Forearm sleeve',(sx,.98,0),(.059,.174,.062),armMat,'Forearm'+suffix)
  ell('Hand',(sx,.815,-.008),(.041,.066,.034),skin,'Forearm'+suffix)
  ell('Thumb',(sx-side*.033,.83,-.016),(.018,.034,.023),skin,'Forearm'+suffix,16)
  ell('Trouser thigh',(legx,.695,0),(.092*build,.27,.094),trousers,'Thigh'+suffix)
  ell('Trouser calf',(legx,.29,0),(.075*build,.26,.078),trousers,'Calf'+suffix)
  ell('Leather shoe',(legx,.058,-.049),(.071,.058,.132),shoe,'Calf'+suffix)
  box('Shoe sole',(legx,.025,-.052),(.143,.028,.23),shoe,'Calf'+suffix,.01)
 # Join retains vertex groups and turns many shapes into a single skinned mesh.
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();body=bpy.context.object;body.name=p['name']+' body';bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 # Scale in mesh and bone space so runtime bounds match animation metres.
 for v in body.data.vertices:v.co*=scale
 arm=bpy.data.armatures.new('Neighbour rig');rig=bpy.data.objects.new(p['name'],arm);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;body.select_set(False);rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 for name,(head,tail,parent) in bones.items():
  b=arm.edit_bones.new(name);b.head=Vector(xyz(head))*scale;b.tail=Vector(xyz(tail))*scale
  if parent:b.parent=arm.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT');body.parent=rig;mod=body.modifiers.new('Articulated cast','ARMATURE');mod.object=rig
 for clip,duration in [('Idle_Neutral',72),('Walk',32),('Wave',48),('Sit',72),('Eat',72),('Drink',72)]:
  rig.animation_data_create();action=bpy.data.actions.new(clip);rig.animation_data.action=action
  for frame in range(1,duration+2,4):
   t=(frame-1)/duration;phase=t*math.tau
   for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0)
   rig.pose.bones['Hips'].location=(0,(-.24*scale if clip in ['Sit','Eat','Drink'] else 0),0)
   if clip=='Walk':
    for sign,suffix in [(-1,'L'),(1,'R')]:rig.pose.bones['Thigh'+suffix].rotation_euler.x=sign*math.sin(phase)*.32;rig.pose.bones['Calf'+suffix].rotation_euler.x=max(0,-sign*math.sin(phase))*.32;rig.pose.bones['UpperArm'+suffix].rotation_euler.x=-sign*math.sin(phase)*.22
   elif clip=='Wave':
    amount=math.sin(math.pi*t)**.5;rig.pose.bones['UpperArmR'].rotation_euler.y=-.65*amount;rig.pose.bones['ForearmR'].rotation_euler.x=-1.5*amount;rig.pose.bones['ForearmR'].rotation_euler.y=math.sin(phase*2)*.13*amount
   elif clip in ['Sit','Eat','Drink']:
    for suffix in ['L','R']:rig.pose.bones['Thigh'+suffix].rotation_euler.x=-1.35;rig.pose.bones['Calf'+suffix].rotation_euler.x=1.35
    rig.pose.bones['UpperArmR'].rotation_euler.x=-.45;rig.pose.bones['ForearmR'].rotation_euler.x=-.85-(.4*(1+math.sin(phase)) if clip in ['Eat','Drink'] else 0)
   rig.pose.bones['Head'].rotation_euler.y=math.sin(phase)*(.035 if clip=='Wave' else .012)
   for b in rig.pose.bones:b.keyframe_insert('rotation_euler',frame=frame,group=b.name)
   rig.pose.bones['Hips'].keyframe_insert('location',frame=frame)
  for fc in action.fcurves:
   for k in fc.keyframe_points:k.interpolation='LINEAR'
  track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1,action);track.mute=True
 rig.animation_data.action=bpy.data.actions.get('Idle_Neutral');bpy.context.scene.frame_set(1)
 bpy.ops.wm.save_as_mainfile(filepath=str(art/(p['model']+'.blend')),compress=True)
 bpy.ops.export_scene.gltf(filepath=str(out/(p['model']+'.glb')),export_format='GLB',export_animations=True,export_nla_strips=True,export_animation_mode='ACTIONS',export_skins=True)
 report.append({'name':p['name'],'model':p['model'],'vertices':len(body.data.vertices),'triangles':sum(len(f.vertices)-2 for f in body.data.polygons),'bytes':(out/(p['model']+'.glb')).stat().st_size,'style':p['look']})
(art/'export-report.json').write_text(json.dumps(report,indent=2))

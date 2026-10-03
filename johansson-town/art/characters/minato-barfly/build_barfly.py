"""Build the bespoke Minato Barfly rig and review exports.

Run with Blender 4.x:
  blender --background --factory-startup --python build_barfly.py -- --output ./out

Outputs: minato-barfly.blend, minato-barfly.glb, minato-barfly-review.png,
         minato-barfly-rig-audit.json
"""
from __future__ import annotations
import argparse
import json
import math
import os
import sys
from pathlib import Path
import bpy
from mathutils import Vector

VERSION = "1.1.0"


def args_after_dashes():
    values = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="./out")
    return parser.parse_args(values)


def mat(name, color, roughness=0.78, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return m


SKIN = mat("Skin | warm tan", (0.49, 0.265, 0.16))
SHIRT = mat("Shirt | Minato red", (0.43, 0.055, 0.045))
LEAF = mat("Shirt print | pale sage", (0.63, 0.69, 0.53))
CREAM = mat("Shirt print | cream", (0.91, 0.79, 0.58))
TROUSERS = mat("Trousers | charcoal", (0.075, 0.073, 0.08))
HAIR = mat("Hair | salt and pepper", (0.24, 0.235, 0.22))
HAIR_LIGHT = mat("Hair | silver strands", (0.54, 0.53, 0.49))
EYE = mat("Eyes | deep brown", (0.075, 0.037, 0.025), 0.35)
WHITE = mat("Eyes | ivory", (0.9, 0.83, 0.69))
MOUTH = mat("Mouth | dark umber", (0.12, 0.035, 0.025))
GOLD = mat("Watch | brushed brass", (0.58, 0.39, 0.12), 0.35, 0.7)
BEER = mat("Glass | amber beer", (0.66, 0.29, 0.045), 0.25)


def smooth(obj, material, bone, armature):
    obj.name = obj.name.replace(".", "_")
    obj.data.materials.append(material)
    for face in obj.data.polygons:
        face.use_smooth = True
    if bone:
        vg = obj.vertex_groups.new(name=bone)
        vg.add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
        mod = obj.modifiers.new("Barfly armature", "ARMATURE")
        mod.object = armature
    return obj


def uv(name, loc, scale, material, bone, armature, segments=16, rings=10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return smooth(o, material, bone, armature)


def cube(name, loc, scale, material, bone, armature, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new("Soft tailored edges", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    return smooth(o, material, bone, armature)


def cylinder_between(name, a, b, radius, material, bone, armature, vertices=10):
    a, b = Vector(a), Vector(b)
    delta = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=delta.length, location=(a+b)*0.5)
    o = bpy.context.object
    o.name = name
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = delta.to_track_quat("Z", "Y")
    return smooth(o, material, bone, armature)


def digit_points(side, finger, spread):
    sign = -1 if side == "L" else 1
    segments = 2 if finger == "thumb" else 3
    if side == "R":
        z = {"index":.985,"middle":.96,"ring":.935,"pinky":.91,"thumb":.94}[finger]
        angles = [210,255,300] if finger == "thumb" else [150,95,40,-15]
        return [(.51+.057*math.cos(math.radians(a)), -.09+.057*math.sin(math.radians(a)), z) for a in angles]
    base = (sign*.48+sign*spread, -.045, .925)
    return [(base[0]+sign*.014*i,base[1]-.018*i,base[2]-.018*i) for i in range(segments+1)]


def make_rig():
    data = bpy.data.armatures.new("Barfly | full body, face and fingers")
    arm = bpy.data.objects.new("Barfly_Rig", data)
    bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    eb = data.edit_bones
    def bone(name, head, tail, parent=None, connected=False):
        b = eb.new(name)
        b.head, b.tail = head, tail
        if parent:
            b.parent = eb[parent]
            b.use_connect = connected
        return b
    bone("root", (0,0,0.05), (0,0,0.18))
    bone("pelvis", (0,0,0.80), (0,0,1.00), "root")
    bone("spine", (0,0,0.95), (0,0,1.22), "pelvis")
    bone("chest", (0,0,1.20), (0,0,1.48), "spine")
    bone("neck", (0,0,1.45), (0,0,1.55), "chest")
    bone("head", (0,0,1.52), (0,0,1.76), "neck")
    bone("jaw", (0,-0.015,1.57), (0,-0.12,1.53), "head")
    bone("brow.L", (-0.07,-0.015,1.69), (-0.07,-0.06,1.70), "head")
    bone("brow.R", (0.07,-0.015,1.69), (0.07,-0.06,1.70), "head")
    bone("eyelid.L", (-0.07,-0.04,1.66), (-0.07,-0.07,1.66), "head")
    bone("eyelid.R", (0.07,-0.04,1.66), (0.07,-0.07,1.66), "head")
    for side, sign in (("L", -1), ("R", 1)):
        x = sign
        bone("thigh."+side, (x*0.105,0,0.91), (x*0.12,0,0.53), "pelvis")
        bone("shin."+side, (x*0.12,0,0.53), (x*0.12,-0.01,0.14), "thigh."+side, True)
        bone("foot."+side, (x*0.12,-0.01,0.14), (x*0.12,-0.16,0.07), "shin."+side, True)
        bone("upperarm."+side, (x*0.27,0,1.39), (x*0.40,0,1.17), "chest")
        bone("forearm."+side, (x*0.40,0,1.17), (x*0.47,-0.01,0.98), "upperarm."+side, True)
        bone("hand."+side, (x*0.47,-0.01,0.98), (x*0.48,-0.04,0.91), "forearm."+side, True)
        for finger, spread in (("thumb",0.105),("index",0.07),("middle",0.025),("ring",-0.02),("pinky",-0.065)):
            segments = 2 if finger == "thumb" else 3
            points = digit_points(side, finger, spread)
            for i in range(segments):
                name = f"finger.{finger}.{side}.{i+1}"
                start, end = points[i:i+2]
                parent = f"hand.{side}" if i == 0 else f"finger.{finger}.{side}.{i}"
                bone(name, start, end, parent)
    bpy.ops.object.mode_set(mode="OBJECT")
    arm.show_in_front = True
    arm.data.display_type = "OCTAHEDRAL"
    return arm


def add_action(arm, name, frames):
    bpy.context.view_layer.objects.active = arm
    arm.animation_data_create()
    arm.animation_data.action = None
    bpy.ops.object.mode_set(mode="POSE")
    for p in arm.pose.bones:
        p.rotation_mode = "XYZ"
        p.rotation_euler = (0,0,0)
        p.location = (0,0,0)
        p.keyframe_insert(data_path="rotation_euler", frame=1, group=p.name)
        p.keyframe_insert(data_path="location", frame=1, group=p.name)
    for frame, poses in frames:
        for bone_name, rotation in poses.items():
            if bone_name.endswith(".location"):
                p=arm.pose.bones[bone_name[:-9]]
                p.location=rotation
                p.keyframe_insert(data_path="location", frame=frame, group=p.name)
                continue
            p = arm.pose.bones[bone_name]
            p.rotation_euler = rotation
            p.keyframe_insert(data_path="rotation_euler", frame=frame, group=bone_name)
        if not poses:
            for p in arm.pose.bones:
                p.rotation_euler=(0,0,0)
                p.location=(0,0,0)
                p.keyframe_insert(data_path="rotation_euler", frame=frame, group=p.name)
                p.keyframe_insert(data_path="location", frame=frame, group=p.name)
    action = arm.animation_data.action
    action.name = name
    for fc in action.fcurves:
        for key in fc.keyframe_points:
            key.interpolation = "BEZIER"
    bpy.ops.object.mode_set(mode="OBJECT")
    return action


def build(output):
    bpy.ops.object.mode_set(mode="OBJECT") if bpy.context.object and bpy.context.object.mode != "OBJECT" else None
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.armatures, bpy.data.cameras, bpy.data.lights):
        pass
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.world.color = (0.12,0.12,0.12)
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    arm = make_rig()

    # Broad, slightly stooped 1980s regular; default stance keeps every limb visible for review.
    uv("Torso | broad shirt", (0,0,1.28), (0.33,0.20,0.34), SHIRT, "chest", arm, 20, 12)
    uv("Belly | shirt", (0,-0.015,1.08), (0.30,0.205,0.25), SHIRT, "spine", arm, 20, 12)
    # Two lapels imply the open-neck shirt without obscuring the face.
    for s in (-1,1):
        mesh=bpy.data.meshes.new("Tailored lapel")
        mesh.from_pydata([(s*.035,-.166,1.48),(s*.105,-.158,1.47),(s*.075,-.19,1.405)],[],[(0,1,2) if s==1 else (2,1,0)])
        lapel=bpy.data.objects.new("Collar lapel",mesh);scene.collection.objects.link(lapel)
        smooth(lapel,CREAM,"chest",arm)
    # Loose trousers and shoes.
    uv("Trousers | hips", (0,0,0.91), (0.245,0.16,0.17), TROUSERS, "pelvis", arm)
    for s, side in ((-1,"L"),(1,"R")):
        cylinder_between("Trouser thigh", (s*.105,0,.91), (s*.12,0,.53), .115, TROUSERS, "thigh."+side, arm, 16)
        uv("Trouser knee", (s*.12,0,.53), (.115,.115,.115), TROUSERS, "shin."+side, arm)
        cylinder_between("Trouser shin", (s*.12,0,.53), (s*.12,-.01,.14), .095, TROUSERS, "shin."+side, arm, 16)
        uv("Shoe", (s*.12,-.08,.095), (.105,.21,.075), TROUSERS, "foot."+side, arm)
        uv("Sleeve", (s*.32,0,1.36), (.145,.18,.16), SHIRT, "upperarm."+side, arm)
        cylinder_between("Upper arm", (s*.27,0,1.39), (s*.40,0,1.17), .075, SKIN, "upperarm."+side, arm)
        uv("Elbow", (s*.40,0,1.17), (.075,.075,.075), SKIN, "forearm."+side, arm)
        cylinder_between("Forearm", (s*.40,0,1.17), (s*.47,-.01,.98), .075, SKIN, "forearm."+side, arm)
        uv("Hand", (s*.48,-.03,.93), (.065,.045,.08), SKIN, "hand."+side, arm)
        # Each phalanx is a separate weighted mesh so all 28 finger joints deform independently.
        for finger, spread in (("thumb",.105),("index",.07),("middle",.025),("ring",-.02),("pinky",-.065)):
            segs = 2 if finger == "thumb" else 3
            points = digit_points(side, finger, spread)
            for i in range(segs):
                bname = f"finger.{finger}.{side}.{i+1}"
                start,end=points[i:i+2]
                cylinder_between("Digit | "+bname,start,end,.016 if finger!="pinky" else .013,SKIN,bname,arm,8)
                uv("Knuckle | "+bname,end,(.016,.015,.016),SKIN,bname,arm,10,6)
    # Neck and head.
    cylinder_between("Neck", (0,0,1.43), (0,0,1.56), .095, SKIN, "neck", arm)
    head = uv("Barfly_Head", (0,-.005,1.66), (.17,.15,.205), SKIN, "head", arm, 24, 16)
    # Face shape keys are exported as glTF morph targets.
    bpy.context.view_layer.objects.active = head
    head.select_set(True)
    head.shape_key_add(name="Basis")
    for key_name, mode in (("Smile", "smile"),("Frown", "frown"),("JawOpen", "jaw"),("Blink.L", "blink_l"),("Blink.R", "blink_r")):
        key=head.shape_key_add(name=key_name)
        for v in head.data.vertices:
            x,y,z=v.co
            front = y < -0.055
            if mode in ("smile","frown") and front and -0.12 < z < -0.035 and abs(x) < .10:
                amount=(abs(x)/.10)*(.018 if mode=="smile" else -.012)
                key.data[v.index].co.z += amount
                key.data[v.index].co.y -= .004
            elif mode=="jaw" and front and z < -.07:
                key.data[v.index].co.z -= .025
            elif mode.startswith("blink") and front and .005 < abs(x) < .09 and .005 < z < .055:
                eye_sign=-1 if mode.endswith("l") else 1
                if x*eye_sign > 0:
                    key.data[v.index].co.z -= .025
    # Facial features, each driven by the relevant face control bone.
    for s, side in ((-1,"L"),(1,"R")):
        for eye_name, eye_loc, eye_scale, eye_mat in (
            ("Eye white", (s*.067,-.143,1.683), (.039,.018,.023), WHITE),
            ("Iris", (s*.067,-.162,1.682), (.014,.009,.016), EYE),
        ):
            eye=uv(eye_name, eye_loc, eye_scale, eye_mat, "head", arm, 12, 8)
            eye.name=f"{eye_name}.{side}"
            eye.shape_key_add(name="Basis")
            blink=eye.shape_key_add(name="Blink."+side)
            for vertex in eye.data.vertices:
                blink.data[vertex.index].co.z *= .02
                blink.data[vertex.index].co.y += .05
        uv("Eyebrow", (s*.067,-.145,1.723), (.047,.018,.012), HAIR, "brow."+side, arm, 12, 6)
        uv("Eyelid", (s*.067,-.154,1.686), (.040,.010,.008), SKIN, "eyelid."+side, arm, 12, 6)
    uv("Nose", (0,-.16,1.65), (.029,.035,.042), SKIN, "head", arm, 12, 8)
    uv("Mouth", (0,-.146,1.605), (.045,.014,.010), MOUTH, "jaw", arm, 12, 6)
    # Moustache stubble, sideburns and salt-and-pepper crop.
    for s in (-1,1):
        uv("Sideburn", (s*.155,-.012,1.69), (.025,.09,.08), HAIR, "head", arm, 12, 8)
        uv("Moustache", (s*.024,-.15,1.62), (.027,.012,.009), HAIR, "head", arm, 12, 6)
    uv("Hair cap", (0,.005,1.80), (.172,.15,.078), HAIR, "head", arm, 20, 8)
    for i in range(7):
        x=(i-3)*.042
        uv("Silver hair fleck", (x,-.098,1.823+0.012*(1-abs(i-3)/3)), (.009,.006,.007), HAIR_LIGHT if i%2==0 else HAIR, "head", arm, 10, 6)
    # Repeating restrained leaf/diamond print on the front of the shirt.
    for row in range(4):
        z=1.12+row*.09
        for col in range(4):
            x=(col-1.5)*.115
            y=-.20*math.sqrt(max(.05,1-(x/.33)**2-((z-1.28)/.34)**2))-.003
            mesh=bpy.data.meshes.new("Flat shirt motif")
            mesh.from_pydata([(x-.018,y,z),(x,y,z-.028),(x+.018,y,z),(x,y,z+.028)],[],[(0,1,2),(0,2,3)])
            motif=bpy.data.objects.new("Aloha print",mesh);scene.collection.objects.link(motif)
            smooth(motif,LEAF if (row+col)%2 else CREAM,"chest",arm)
    # Brass wristwatch on left wrist.
    watch = uv("Wristwatch | case", (-.476,-.025,.98), (.036,.02,.035), GOLD, "hand.L", arm, 12, 8)
    cube("Wristwatch | strap", (-.476,-.023,.98), (.09,.012,.018), GOLD, "hand.L", arm, .003)
    # Prop: a simple beer glass weighted to right hand.
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=.055, depth=.15, location=(.51,-.09,.95))
    glass=smooth(bpy.context.object, BEER, "hand.R", arm)
    glass.name="BeerGlass | right hand prop"
    # Visible rim, foam and handle; all share the right-hand skin binding.
    for name,z,radius,depth,material in [("Beer foam",1.022,.051,.012,CREAM),("Beer base",.876,.055,.009,CREAM)]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=radius,depth=depth,location=(.51,-.09,z))
        obj=smooth(bpy.context.object,material,"hand.R",arm);obj.name=name
    bpy.ops.mesh.primitive_torus_add(major_segments=16,minor_segments=6,major_radius=.054,minor_radius=.005,location=(.51,-.09,1.025))
    smooth(bpy.context.object,CREAM,"hand.R",arm).name="Beer rim"
    # Seated bar stool is a separate static prop included only in Blender review scene.
    stool_mat=mat("Stool | dark timber",(.12,.075,.045))
    cylinder_between("Review stool post",(0,.11,.03),(0,.11,.53),.035,stool_mat,None,None)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=.23, depth=.055, location=(0,.11,.5375))
    smooth(bpy.context.object,stool_mat,None,None)
    bpy.context.object.name="Review stool seat"
    # Animation actions: repeating drink loop and overnight seated sleep pose.
    seated={"pelvis.location":(0,-.15,0),"thigh.L":(-math.pi/2,0,0),"thigh.R":(-math.pi/2,0,0),"shin.L":(math.pi/2,0,0),"shin.R":(math.pi/2,0,0)}
    # Solve the two-arm chain against the rim contact target, then bake the
    # rotations and remove the constraint/target: no new exported bones.
    for name,value in seated.items():
        if name.endswith(".location"):arm.pose.bones[name[:-9]].location=value
        else:arm.pose.bones[name].rotation_mode="XYZ";arm.pose.bones[name].rotation_euler=value
    target=bpy.data.objects.new("Drink wrist target",None);scene.collection.objects.link(target)
    target.location=(.005,-.066,1.410)
    ik=arm.pose.bones["forearm.R"].constraints.new("IK");ik.target=target;ik.chain_count=2
    bpy.context.view_layer.update()
    rotations={}
    for name in ["upperarm.R","forearm.R"]:
        bone=arm.pose.bones[name]
        local=arm.convert_space(pose_bone=bone,matrix=bone.matrix,from_space="POSE",to_space="LOCAL")
        rotations[name]=tuple(local.to_euler())
    hand=arm.pose.bones["hand.R"]
    desired=arm.data.bones["hand.R"].matrix_local.copy();desired.translation=hand.matrix.translation
    local=arm.convert_space(pose_bone=hand,matrix=desired,from_space="POSE",to_space="LOCAL")
    rotations["hand.R"]=tuple(local.to_euler())
    arm.pose.bones["forearm.R"].constraints.remove(ik);bpy.data.objects.remove(target,do_unlink=True)
    drink_pose={**seated,**rotations}
    rest_pose={**seated,"upperarm.R":(.10,0,-.08),"forearm.R":(-.25,0,0),"hand.R":(0,0,0)}
    sleep_pose={**seated,"spine":(.10,.02,0),"head":(.28,.02,.03),"upperarm.L":(.18,0,.1),"forearm.L":(-.22,0,0),"upperarm.R":(.18,0,-.1),"forearm.R":(-.22,0,0)}
    act_drink=add_action(arm,"Barfly_Drink_Loop",[(1,rest_pose),(37,drink_pose),(61,drink_pose),(97,rest_pose),(145,rest_pose)])
    act_sleep=add_action(arm,"Barfly_Sleep_Loop",[(1,sleep_pose),(73,{**sleep_pose,"spine":(.115,.02,0)}),(145,sleep_pose)])
    # Each eye's exported morph animation follows the same named NLA clips.
    for obj in scene.objects:
        if obj.type!="MESH" or not obj.data.shape_keys:continue
        keys=obj.data.shape_keys
        for clip,value in [("Barfly_Drink_Loop",0.0),("Barfly_Sleep_Loop",1.0)]:
            keys.animation_data_create();keys.animation_data.action=None
            for key in keys.key_blocks:
                if not key.name.startswith("Blink."):continue
                for frame in [1,145]:key.value=value;key.keyframe_insert(data_path="value",frame=frame)
            action=keys.animation_data.action;action.name=obj.name+" | "+clip
            track=keys.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,1 if value==0 else 147,action).extrapolation="NOTHING"
            keys.animation_data.action=None
    # Keep both actions available as named NLA clips in the interchange export.
    arm.animation_data.action = act_drink
    track=arm.animation_data.nla_tracks.new(); track.name="Barfly_Drink_Loop"; strip=track.strips.new("Barfly_Drink_Loop",1,act_drink); strip.repeat=1;strip.extrapolation="NOTHING"
    track2=arm.animation_data.nla_tracks.new(); track2.name="Barfly_Sleep_Loop"; strip=track2.strips.new("Barfly_Sleep_Loop",147,act_sleep); strip.repeat=1;strip.extrapolation="NOTHING"
    arm.animation_data.action=None
    scene.frame_end=292
    # Consolidate rigid detail meshes by material. Morph-bearing head and eyes
    # remain separate so their five facial targets and blink tracks survive.
    batches={}
    for obj in list(scene.objects):
        if obj.type=="MESH" and not obj.data.shape_keys and any(m.type=="ARMATURE" for m in obj.modifiers):
            marker=obj.vertex_groups.new(name="part:"+obj.name);marker.add(list(range(len(obj.data.vertices))),1,"REPLACE")
            batches.setdefault(obj.data.materials[0].name,[]).append(obj)
    for material,objects in batches.items():
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join();bpy.context.object.name="Barfly batch | "+material
    # Match the resident profile's stated 1.72 m height.
    for obj in scene.objects:
        if obj.type == "ARMATURE" or (obj.type == "MESH" and any(m.type=="ARMATURE" and m.object==arm for m in obj.modifiers)):
            obj.location *= .925
            obj.scale *= .925
    # Neutral rig review pose, with a clear finger spread.
    scene.frame_set(1)
    # Add camera, floor, soft key and fill lights for a repeatable presentation render.
    floor_mat=mat("Studio floor",(.20,.22,.23))
    cube("Studio floor",(0,0,-.025),(200,200,.05),floor_mat,None,None)
    bpy.ops.object.camera_add(location=(2.8,-5.3,2.45))
    cam=bpy.context.object; cam.name="Review Camera"
    target=Vector((0,0,0.94)); cam.rotation_euler=(target- cam.location).to_track_quat("-Z","Y").to_euler(); cam.data.type="ORTHO"; cam.data.ortho_scale=2.45; scene.camera=cam
    def area(name,loc,power,size,color):
        bpy.ops.object.light_add(type="AREA",location=loc)
        light=bpy.context.object;light.name=name;light.data.energy=power;light.data.shape="DISK";light.data.size=size;light.data.color=color
        light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat("-Z","Y").to_euler()
    area("Key | warm",(2,-3,4),480,4,(1.0,.84,.68))
    area("Fill | cool",(-3,-2,2.5),350,3,(.68,.82,1.0))
    area("Rim",(0,2,3),600,3,(1.0,.72,.45))
    scene.render.filepath=str(output/"minato-barfly-review.png")
    # Save source before exporting; the file retains the full editable rig and review setup.
    bpy.ops.wm.save_as_mainfile(filepath=str(output/"minato-barfly.blend"))
    bpy.ops.render.render(write_still=True)
    # Export the armature-driven character and its two named animation clips.
    bpy.ops.object.select_all(action="DESELECT")
    for obj in scene.objects:
        if obj.type in {"MESH","ARMATURE"} and not obj.name.startswith("Review") and not obj.name.startswith("Studio"):
            obj.select_set(True)
    bpy.context.view_layer.objects.active=arm
    bpy.ops.export_scene.gltf(filepath=str(output/"minato-barfly.glb"), export_format="GLB", use_selection=True,
        export_animations=True, export_skins=True, export_morph=True, export_nla_strips=True,
        export_apply=False, export_yup=True)
    audit(output, arm)


def audit(output, arm):
    bones=set(arm.data.bones.keys())
    required={"root","pelvis","spine","chest","neck","head","jaw","brow.L","brow.R","eyelid.L","eyelid.R"}
    for side in ("L","R"):
        required|={f"thigh.{side}",f"shin.{side}",f"foot.{side}",f"upperarm.{side}",f"forearm.{side}",f"hand.{side}"}
        for finger in ("thumb","index","middle","ring","pinky"):
            for seg in range(1, 3 if finger=="thumb" else 4): required.add(f"finger.{finger}.{side}.{seg}")
    missing=sorted(required-bones)
    head=bpy.data.objects.get("Barfly_Head")
    keys=set(head.data.shape_keys.key_blocks.keys()) if head and head.data.shape_keys else set()
    required_keys={"Basis","Smile","Frown","JawOpen","Blink.L","Blink.R"}
    missing_keys=sorted(required_keys-keys)
    actions=sorted(a.name for a in bpy.data.actions if a.name.startswith("Barfly_"))
    required_actions={"Barfly_Drink_Loop","Barfly_Sleep_Loop"}
    missing_actions=sorted(required_actions-set(actions))
    deformers=[o.name for o in bpy.data.objects if o.type=="MESH" and any(m.type=="ARMATURE" and m.object==arm for m in o.modifiers)]
    groups={vg.name for o in bpy.data.objects if o.name in deformers for vg in o.vertex_groups
            if any(g.group == vg.index and g.weight > 0 for v in o.data.vertices for g in v.groups)}
    missing_finger_groups=sorted(name for name in required if name.startswith("finger.") and name not in groups)
    missing_eye_blinks=[]
    for side in ("L","R"):
        eyes=[bpy.data.objects.get(f"{name}.{side}") for name in ("Eye white", "Iris")]
        if any(o is None or o.data.shape_keys is None or "Blink."+side not in o.data.shape_keys.key_blocks for o in eyes):
            missing_eye_blinks.append(side)
    action_channels={a.name:{fc.data_path for fc in a.fcurves} for a in bpy.data.actions if a.name.startswith("Barfly_")}
    drink_ok=any('pose.bones["forearm.R"]' in path for path in action_channels.get("Barfly_Drink_Loop",set()))
    sleep_ok=any('pose.bones["spine"]' in path for path in action_channels.get("Barfly_Sleep_Loop",set()))
    report={"asset":"Minato Barfly","version":VERSION,"blender":bpy.app.version_string,"height_m":1.72,
        "armature":arm.name,"bone_count":len(bones),"required_bones":sorted(required),"missing_bones":missing,
        "facial_shape_keys":sorted(keys),"missing_shape_keys":missing_keys,"actions":actions,
        "missing_actions":missing_actions,"missing_finger_weights":missing_finger_groups,
        "missing_eye_blink_targets":missing_eye_blinks,"drink_has_forearm_channel":drink_ok,
        "sleep_has_spine_channel":sleep_ok,"skinned_meshes":deformers,
        "passed":not (missing or missing_keys or missing_actions or missing_finger_groups or missing_eye_blinks)
                 and drink_ok and sleep_ok and len(deformers)>0}
    (output/"minato-barfly-rig-audit.json").write_text(json.dumps(report,indent=2)+"\n")
    if not report["passed"]:
        raise RuntimeError("Rig audit failed: "+json.dumps(report))


if __name__ == "__main__":
    output=Path(args_after_dashes().output).resolve()
    output.mkdir(parents=True,exist_ok=True)
    build(output)

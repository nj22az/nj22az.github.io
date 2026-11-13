"""Keep an arm's pull to the arm.

    blender -b cast.blend -P fix_weights.py -- singer dancer        (saves the file in place)

Meshy's automatic skinning gives part of the chest to the upper-arm bones: on the singer, lifting an arm dragged
her bodice out with it (the owner: "her bustier expands with her arm raise"). Here every vertex's weight to an
arm bone is kept only near that arm: whole within 7 cm of the bone's own line (for a figure 1.7 m tall), none
beyond 12.5 cm, and what is taken away is given to the upper spine, so the bodice stays with the ribs.
"""
import bpy, sys
from mathutils import Vector

names = sys.argv[sys.argv.index('--') + 1:]
ARMS = (('LeftArm', 'LeftForeArm'), ('RightArm', 'RightForeArm'), ('LeftForeArm', 'LeftHand'), ('RightForeArm', 'RightHand'))


def sstep(a, b, v):
    u = max(0.0, min(1.0, (v - a) / (b - a))); return u * u * (3 - 2 * u)


for who in names:
    arm = bpy.data.objects[who]; ob = bpy.data.objects[who + '-mesh']
    bpy.context.view_layer.update()
    MW = ob.matrix_world; J = lambda n: arm.matrix_world @ arm.data.bones[n].head_local
    s = max((MW @ Vector(c)).z for c in ob.bound_box) / 1.7
    spine = ob.vertex_groups.get('Spine02') or ob.vertex_groups.new(name='Spine02')
    moved = 0; total = 0.0
    for bone, child in ARMS:
        g = ob.vertex_groups.get(bone)
        if g is None: continue
        p0, p1 = J(bone), J(child); ax = p1 - p0; L2 = ax.length_squared
        for v in ob.data.vertices:
            w = next((ge.weight for ge in v.groups if ge.group == g.index), 0.0)
            if w <= 0.0: continue
            p = MW @ v.co; t = max(0.0, min(1.0, (p - p0).dot(ax) / L2)); d = (p - (p0 + ax * t)).length
            keep = 1.0 - sstep(0.07 * s, 0.125 * s, d)
            if keep >= 0.999: continue
            g.add([v.index], w * keep, 'REPLACE'); spine.add([v.index], w * (1 - keep), 'ADD')
            moved += 1; total += w * (1 - keep)
    print(f'{who}: {moved} vertex weights eased off the arms ({total:.1f} of weight given to the spine)')
bpy.ops.wm.save_mainfile()

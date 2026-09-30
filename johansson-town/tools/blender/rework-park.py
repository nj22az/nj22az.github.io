"""Harbour Park, fitted to the town. Blender 4.2+ (or `pip install bpy==4.2.0`).
Run: python tools/blender/rework-park.py -- --root .

The supplied park came with a ring of bush clumps whose leaf texture never survives the
trip into the town's cel shading: they arrived as pale, faceted boulders around the hill.
This takes them out -- the lawn's own shrubs (east-lawn.js) do the planting now -- and
writes the park back in place. Everything else the game reads from the model (the turf,
the paths, the sakura, the bench, the lamps, the rope fence) keeps its name and position.
The original is in git history.
"""
import bpy, sys, argparse
from pathlib import Path
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
p = argparse.ArgumentParser(); p.add_argument('--root', required=True); a = p.parse_args(args)
path = Path(a.root).resolve() / 'assets/models/park/park-spring.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(path))
REMOVE = ('mtParkBush00t_mat',)
for o in [o for o in bpy.context.scene.objects if o.name.split('.')[0] in REMOVE]:
    bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', export_yup=True, export_animations=False,
                          export_image_format='AUTO', export_apply=True)
print('park', sorted(o.name for o in bpy.context.scene.objects if o.type == 'MESH'))

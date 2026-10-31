"""Audit saved metric cameras; optionally render selected views without rebuilding meshes."""
import bpy,json,math,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'art/ferry-engine-room'
bpy.ops.wm.open_mainfile(filepath=str(ART/'Minato_Maru_Engine_Room_H1.blend'))
scene=bpy.context.scene;data=json.loads((ART/'geometry-h1.json').read_text());rows=[]
assert scene.unit_settings.system=='METRIC' and scene.unit_settings.scale_length==1
for shot in data['shots']:
 camera=bpy.data.objects[shot['id']];x,y,z=camera.location
 pos=[17.25-y,x,z+1.9];fov=math.degrees(2*math.atan(camera.data.sensor_height/(2*camera.data.lens)))
 assert max(abs(a-b)for a,b in zip(pos,shot['pos']))<.00001
 assert abs(fov-shot['fov'])<.00001
 camera.lock_location=(True,True,True);camera.lock_rotation=(True,True,True);camera.lock_scale=(True,True,True)
 rows.append({'id':shot['id'],'CAD_position':pos,'vertical_fov':fov,'transforms_locked':True})
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'Minato_Maru_Engine_Room_H1.blend'),compress=True)
out=ROOT/'docs/qa/ferry-engine-room-h1';out.mkdir(parents=True,exist_ok=True)
(out/'blender-audit.json').write_text(json.dumps({'units':'metres','source_components':len(bpy.data.collections['CAD H1 - retained machinery'].objects),'cameras':rows,'Meshy':scene['Meshy_status']},indent=2)+'\n')
if '--render'in sys.argv:
 selected=next((a.split('=',1)[1].split(',')for a in sys.argv if a.startswith('--shots=')),['engines-aft','control'])
 scene.cycles.samples=32;scene.render.resolution_x=960;scene.render.resolution_y=720
 for name in selected:
  scene.camera=bpy.data.objects[name];scene.render.filepath=str(ART/'renders'/f'{name}.png');bpy.ops.render.render(write_still=True)
print('H1_SAVED_SCENE_AUDIT',len(rows),'cameras match CAD')

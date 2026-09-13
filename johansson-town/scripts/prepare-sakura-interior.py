"""Prepare the user-supplied convenience-store GLB. Usage: python script.py source.glb.
Keep the supplied architecture and fittings, remove its loose merchandise and
advertising for the game's individually stocked, fictional branded products.
"""
from pathlib import Path
import sys, json, hashlib
import numpy as np
import trimesh
source=Path(sys.argv[1]);destination=Path(__file__).resolve().parents[1]/'assets/models/sakura-interior'
destination.mkdir(parents=True,exist_ok=True)
scene=trimesh.load(source,force='scene');output=trimesh.Scene();groups={};kept=[]
colours={'building':[220,211,188,255],'fridge':[211,219,208,255],'register':[51,66,54,255],'shelf':[176,180,159,255],'door':[108,83,59,255],'light':[247,237,199,255],'toilet':[233,229,212,255]}
for name in scene.graph.nodes_geometry:
 transform,geom=scene.graph[name];mesh=scene.geometry[geom].copy();material=getattr(mesh.visual,'material',None);mat=getattr(material,'name','')
 if mat in ['merch','soda','outline','Book','pastry','glass','gradient','gradient.001','poster_1','poster_2','poster_wide','cardboard_box','mart','beverage','checkout','resetroom','welcome','front_sign']:continue
 if any(word in name.lower() for word in ['outline','gradient','roof','building.sign','building.001','building.cieling.002','building.backroom.001']):continue
 mesh.apply_transform(transform);b=mesh.bounds
 if b[0][0]<-6.95 or b[1][0]>6.95 or b[0][2]<-6.95 or b[1][2]>4.15 or b[0][1]>3.05:continue
 if name.startswith('fridge.door') or name.startswith('fridge.handle') or name.startswith('pastry_cabinent.door') or name.startswith('pastry_cabinent.handle'):continue
 if mat in ['floor','backroom_floor','cieling']:
  if mat=='cieling':mesh.visual=trimesh.visual.ColorVisuals(mesh=mesh,vertex_colors=[223,217,194,255]);groups.setdefault('ceiling',[]).append(mesh)
  else:output.add_geometry(mesh,node_name=name,geom_name=name)
 else:
  colour=colours.get(mat,[203,203,182,255]);key=mat
  if mat=='shelf' and name.startswith('Cube') and b[1][1]>1.45:colour=[135,61,47,255];key='shelf-ends'
  if name=='building.front_counter':colour=[100,126,102,255];key='counter'
  mesh.visual=trimesh.visual.ColorVisuals(mesh=mesh,vertex_colors=colour);groups.setdefault(key,[]).append(mesh)
 kept.append(name)
for key,parts in groups.items():output.add_geometry(trimesh.util.concatenate(parts),node_name='sakura-'+key,geom_name='sakura-'+key)
path=destination/'sakura-interior.glb';path.write_bytes(output.export(file_type='glb'))
(destination/'source.json').write_text(json.dumps({'source':'the-convenience-store.zip / source/8 16 20 conveniance_store.glb','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sourceBytes':source.stat().st_size,'preparedBytes':path.stat().st_size,'keptNodes':kept,'adaptation':'Original architecture, aisles, refrigerators, checkout booth and back room; batched static fittings, warm colours, open refrigerated displays; merchandise and signage replaced by runtime stock and original fictional artwork.'},indent=2)+'\n')
print(path,path.stat().st_size,'bytes',len(output.geometry),'draw groups')

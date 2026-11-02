"""Encode Blender render outputs for the browser; no geometry or artistic edits."""
from pathlib import Path
import json
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parent;app=root.parent
items=json.loads((root/'catalogue.json').read_text());public=[]
board=Image.new('RGB',(1200,1020),'#f5f5f7');draw=ImageDraw.Draw(board)
for i,s in enumerate(items):
 image=Image.open(app/'images'/f'{s["id"]}.png').convert('RGB')
 image.save(app/'images'/f'{s["id"]}.webp',quality=88,method=6)
 public.append({'id':s['id'],'label':s['label'],'image':f'./images/{s["id"]}.webp','model':f'./models/{s["id"]}.glb'})
 if i<4:
  tile=ImageOps.contain(image,(580,435));x=10+(i%2)*600;y=20+(i//2)*500
  board.paste(tile,(x,y));draw.text((x+20,y+440),s['label'],fill='#1d1d1f',font_size=24)
board.save(app/'images'/'equipment-library-preview.jpg',quality=91)
(app/'object-catalogue.mjs').write_text('// Generated from the Blender catalogue. Illustrative visuals, no technical defaults.\nexport const OBJECT_MODELS = '+json.dumps(public,indent=2)+';\n')

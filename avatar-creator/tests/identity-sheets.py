from PIL import Image,ImageDraw,ImageFont,ImageChops
from pathlib import Path
import sys,json
p=Path(sys.argv[1] if len(sys.argv)>1 else 'avatar-creator/docs/qa/identity-v2/raw')
out=p.parent
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
names=['Johansson','Thuan','Tetsu','Grandmother Higa','Mai']
for i,name in enumerate(names):
 sheet=Image.new('RGB',(1232,4*(300)+75),'#eee8dc');d=ImageDraw.Draw(sheet);d.text((20,12),f'{name} — original / Johansson v2 | main 9f7ccd4c',font=font,fill='#303632')
 for j,view in enumerate(['front','quarter','profile','body']):
  im=Image.open(p/f'compare-{i}-{view}.png').convert('RGB');im.thumbnail((1232,270))
  sheet.paste(im,((1232-im.width)//2,75+j*300+26));d.text((20,75+j*300),view,font=small,fill='#303632')
 sheet.save(out/f'review-{i}.jpg',quality=90)
 frames=[]
 for f in range(12):
  sheet=Image.new('RGB',(1232,644),'#eee8dc');d=ImageDraw.Draw(sheet);d.text((20,8),name+' — current / study, walking above; sipping tea below',font=font,fill='#303632')
  for j,action in enumerate(['walk','sip']):
   im=Image.open(p/f'{i}-{action}-{f:02}.png').convert('RGB');im.thumbnail((1232,300));sheet.paste(im,((1232-im.width)//2,40+j*300))
  frames.append(sheet.resize((924,483)))
 frames[0].save(out/f'motion-{i}.gif',save_all=True,append_images=frames[1:],duration=200,loop=0,optimize=True)
 # Expressions and contact review stay in a separate sheet so portraits remain comparable.
 sheet=Image.new('RGB',(1232,4*300+50),'#eee8dc');d=ImageDraw.Draw(sheet);d.text((20,10),name+' — expressions, seated support, tea grip (current / study)',font=font,fill='#303632')
 for j,action in enumerate(['smile','surprise','sit','hold']):
  im=Image.open(p/f'{i}-{action}.png').convert('RGB');im.thumbnail((1232,270));sheet.paste(im,((1232-im.width)//2,50+j*300+26));d.text((20,50+j*300),action,font=small,fill='#303632')
 sheet.save(out/f'performance-{i}.jpg',quality=90)
# Compare frozen main pixels with the unchanged left-hand renderer on the feature branch.
checks=[]
for i in range(5):
 for view in ['front','quarter','profile','body']:
  a=Image.open(p/f'baseline-{i}-{view}.png').convert('RGB');b=Image.open(p/f'compare-{i}-{view}.png').convert('RGB');box=(0,0,a.width//2,a.height)
  exact=ImageChops.difference(a.crop(box),b.crop(box)).getbbox() is None;checks.append((i,view,exact))
print(checks)
assert all(c[2] for c in checks)

report=json.loads((p/'report.json').read_text())
report['baselinePixelMatches']=checks
report['rawCaptures']='Reproducible intermediates under raw/; not committed'
report['evidence']=[f'{kind}-{i}.{ext}' for i in range(5) for kind,ext in [('review','jpg'),('performance','jpg'),('motion','gif')]]
(out/'report.json').write_text(json.dumps(report,indent=2)+'\n')
# Larger front comparisons and a working-customisation strip for owner review.
for i,name in [(0,'Johansson'),(1,'Thuan')]:
 im=Image.open(p/f'compare-{i}-front.png').convert('RGB');sheet=Image.new('RGB',(im.width,im.height+50),'#eee8dc');sheet.paste(im,(0,50));d=ImageDraw.Draw(sheet);d.text((20,12),name+' — current',font=font,fill='#303632');d.text((im.width//2+20,12),'Johansson prototype — original island eyes',font=font,fill='#303632');sheet.save(out/f'portrait-{i}.jpg',quality=93)
sheet=Image.new('RGB',(1232,770),'#eee8dc');d=ImageDraw.Draw(sheet);d.text((20,12),'The same characters, with selectable Johansson head shapes',font=font,fill='#303632')
for i,name in [(0,'Johansson'),(1,'Thuan')]:
 d.text((20,i*355+50),name,font=font,fill='#303632')
 for j,label in enumerate(['Current','New default','Round','Soft square']):
  im=Image.open(p/(f'compare-{i}-front.png' if j==0 else f'custom-{i}-{j-1}.png')).convert('RGB');im=im.crop((0 if j==0 else im.width//2,0,im.width//2 if j==0 else im.width,im.height));im.thumbnail((308,282));sheet.paste(im,(j*308,i*355+110));d.text((j*308+20,i*355+82),label,font=font,fill='#303632')
sheet.save(out/'customisation.jpg',quality=93)

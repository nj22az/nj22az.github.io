"""Label actual material-review renders and encode a paired, silent turntable.
Requires Pillow and ffmpeg. Run after tests/material-study.browser.mjs from repo root.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess

out=Path(__file__).resolve().parents[1]/'docs/qa/material-study'
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',23)
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
ink='#243b3e';paper='#f4f1e9'
for name in ['thuan','johansson']:
    for lighting in ['neutral','daylight','interior']:
        sheet=Image.new('RGB',(1536,1420),paper);d=ImageDraw.Draw(sheet)
        for row,mode in enumerate(['legacy','enhanced']):
            for col,view in enumerate(['face','full','hand']):
                x=col*512;y=row*710
                d.text((x+16,y+10),f'{name.title()} · {lighting} · {view}',font=font,fill=ink)
                d.text((x+16,y+40),'BEFORE · original' if row==0 else 'AFTER · soft surfaces / cotton',font=small,fill=ink)
                sheet.paste(Image.open(out/f'{name}-{lighting}-{view}-{mode}.png'),(x,y+70))
        sheet.save(out/f'{name}-{lighting}-comparison.png')
    sheet=Image.new('RGB',(960,890),paper);d=ImageDraw.Draw(sheet)
    for row,mode in enumerate(['legacy','enhanced']):
        for col,lighting in enumerate(['neutral','daylight','interior']):
            x=col*320;y=row*445
            d.text((x+10,y+6),lighting.title()+' · '+('BEFORE' if row==0 else 'AFTER'),font=small,fill=ink)
            sheet.paste(Image.open(out/f'{name}-{lighting}-face-{mode}.png').resize((320,400),Image.Resampling.LANCZOS),(x,y+35))
    sheet.save(out/f'{name}-lighting-faces.png')
sheet=Image.new('RGB',(1024,710),paper);d=ImageDraw.Draw(sheet)
for col,cloth in enumerate(['cotton','satin']):
    d.text((col*512+16,15),'Thuan · '+cloth+' · neutral portrait',font=font,fill=ink)
    sheet.paste(Image.open(out/f'thuan-finish-{cloth}.png'),(col*512,70))
sheet.save(out/'thuan-finishes.png')
for i in range(24):
    sheet=Image.new('RGB',(1024,710),paper);d=ImageDraw.Draw(sheet)
    for col,mode in enumerate(['legacy','enhanced']):
        d.text((col*512+15,14),'BEFORE · original' if col==0 else 'AFTER · soft surfaces',font=font,fill=ink)
        d.text((col*512+15,43),'Thuan · neutral portrait · cotton',font=small,fill=ink)
        sheet.paste(Image.open(out/f'turntable-{mode}-{i:02}.png'),(col*512,70))
    sheet.save(out/f'turntable-pair-{i:02}.png')
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','6','-i',str(out/'turntable-pair-%02d.png'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','18',str(out/'thuan-turntable.mp4')],check=True)
# These reproducible intermediates are not shipped beside the encoded review movie.
for p in out.glob('turntable-*.png'):
    p.unlink()
print('Labelled comparison sheets and 24-frame turntable encoded.')

from PIL import Image
from pathlib import Path
im=Image.open('art/private-course-link/johansson-shush.png').convert('RGBA')
im=im.crop(im.getbbox())
im.thumbnail((244,380),Image.Resampling.LANCZOS)
out=Image.new('RGBA',(264,400))
out.alpha_composite(im,((264-im.width)//2,(400-im.height)//2))
p=Path('assets/private-course-link/johansson-whisper.webp')
p.parent.mkdir(parents=True,exist_ok=True)
out.save(p,quality=92,method=6)

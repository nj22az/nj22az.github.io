"""Trace the owner's logo to vector paths, part by part, with the corrections he asked for on 13 November 2026:
the hand on the anchor has three fingers and a thumb like the other hand (one dividing line taken out), and the outer ring is a true circle on
the inner ring's centre, with an even gap all round."""
import subprocess, numpy as np, re, math, json, sys
from scipy import ndimage
p=sys.argv[1]
w,h=1096,1009
gray=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',p,'-f','rawvideo','-pix_fmt','gray','-']),np.uint8).reshape(h,w).astype(np.float32)
# the parts are told apart on the drawing as it came, before anything is redrawn
lab,n=ndimage.label(gray<128)

# ---- the hand on the anchor. As drawn it had four fingers (three dividing lines); the fist has three. The owner,
# 13 November 2026, after a redrawn hand: "why the ugly redraw, cant you just remove one of the lines for the finger".
# So the drawing is kept as he drew it: the lowest dividing line is taken out, and the other two, his own strokes
# unaltered, are moved down so that the three fingers are of a height. Nothing is drawn by this script.
yy,xx=np.mgrid[0:h,0:w]
orig=gray.copy()
X0,X1=733,768                                                                    # from the palm-side outline to the lines' points
LINES={'top':(396,409,5),'mid':(410,426,9),'low':(428,440,None)}                 # rows: a clean one above, a clean one below; and its move
ink={}
for k,(a_,b_,dy) in LINES.items():
    f=((np.arange(a_,b_+1)-a_)/(b_-a_))[:,None]
    clean=orig[a_,X0:X1][None,:]*(1-f)+orig[b_,X0:X1][None,:]*f                  # the hand here had no line been drawn
    ink[k]=np.clip(clean-orig[a_:b_+1,X0:X1],0,255)                              # what the line added
    gray[a_:b_+1,X0:X1]=clean
for k,(a_,b_,dy) in LINES.items():
    if dy is not None: gray[a_+dy:b_+1+dy,X0:X1]=np.clip(gray[a_+dy:b_+1+dy,X0:X1]-ink[k],0,255)
redrawn=(gray<128)&(xx>=724)&(xx<=794)&(yy>=384)&(yy<=452)                        # the hand as it now is
GROUPS={'title':[1,2,3,4],'prop_l':[13],'prop_r':[14],'anchor_l':[17],'anchor_r':[18],
        'bottom':[27,23,36,28,24,35,21,29,30,20,33,31,32,26,25,34],'copy_mark':[37,51],'copy_name':list(range(38,51))}
used=set(sum(GROUPS.values(),[]))
GROUPS['mark']=[i for i in range(1,n+1) if i not in used and i!=11]          # 11 is a piece of the old outer ring
def mask(ids): return np.isin(lab,ids)

# ---- the rings. Read off the drawing: the inner ring's centre (583.7, 387.6), radius 197; the outer ring's centre
# (581.7, 371.0), radius 276, ten thick: 17 higher than the inner, so the gap between them was 53 below and 63 beside.
IN=(583.7,387.6,197.0); OLD=(581.7,371.0,276.0,10.0)
GAP=56.0; NEW_R=IN[2]+GAP+OLD[3]                                               # the new outer ring's outer edge
mk=mask(GROUPS['mark']).copy(); gone=np.zeros_like(mk)
rs=np.arange(250,300,0.25)
for a in np.radians(np.arange(0,360,0.1)):
    xs=np.round(OLD[0]+rs*math.cos(a)).astype(int); ys=np.round(OLD[1]+rs*math.sin(a)).astype(int)
    ok=(xs>=0)&(xs<w)&(ys>=0)&(ys<h); v=np.zeros(len(rs),bool); v[ok]=mk[ys[ok],xs[ok]]
    mid=int((OLD[2]-OLD[3]/2-250)/0.25)
    if not v[mid-12:mid+13].any(): continue
    k=mid-12+int(np.argmax(v[mid-12:mid+13])); i0=k
    while i0>0 and v[i0-1]: i0-=1
    i1=k
    while i1<len(rs)-1 and v[i1+1]: i1+=1
    if (i1-i0)*0.25<=16.5 and abs((rs[i0]+rs[i1])/2-(OLD[2]-OLD[3]/2))<=5:      # a run as thick as the ring, where the ring is
        gone[ys[i0:i1+1],xs[i0:i1+1]]=True
gone=ndimage.binary_dilation(gone,iterations=1)&mk
mk&=~gone
l2,n2=ndimage.label(mk); sizes=ndimage.sum(mk,l2,range(1,n2+1))
for i,sz in enumerate(sizes):
    if sz<30: mk[l2==i+1]=False                                                # crumbs of the old ring
    elif sz<700:                                                               # slivers of it left beside the lettering:
        py,px=np.nonzero(l2==i+1)                                              # small pieces wholly outside the inner ring
        if np.hypot(px-IN[0],py-IN[1]).min()>IN[2]+12: mk[l2==i+1]=False
mk|=redrawn
print('old outer ring: %d pixels taken out; mark keeps %d'%(gone.sum(),mk.sum()))
json.dump({'cx':IN[0],'cy':IN[1],'r_in':IN[2],'ring_r':NEW_R-OLD[3]/2,'ring_w':OLD[3],'r':NEW_R},open('measure.json','w'))

S=4; big=ndimage.zoom(gray,S,order=3)
def trace(name,m,fill_holes=False):
    mm=ndimage.binary_dilation(m,iterations=2)
    mm=ndimage.zoom(mm.astype(np.float32),S,order=1)>0.5
    bw=np.where(mm,big,255.0)<128
    if fill_holes: bw=ndimage.binary_fill_holes(bw)
    H,W=bw.shape
    open(name+'.pbm','wb').write(b'P4\n%d %d\n'%(W,H)+np.packbits(bw,axis=1).tobytes())
    subprocess.run(['potrace','-s','-t','8','-a','1.1','-O','0.4','-o',name+'.svg',name+'.pbm'],check=True)
    s=open(name+'.svg').read()
    return re.search(r'<g transform="([^"]+)"',s).group(1), ''.join(re.findall(r'<path d="[^"]+"/>',s,flags=re.S))
out={}
for name,ids in GROUPS.items():
    if name!='mark': out[name]=trace(name,mask(ids))
out['mark']=trace('mark',mk); out['mark_back']=trace('mark_back',mk,True)
out['title_back']=trace('title_back',mask(GROUPS['title']),True)
json.dump(out,open('paths.json','w'))
print({k:len(v[1]) for k,v in out.items()})

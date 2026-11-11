"""Cut the sailor puppet out of the owner's own drawing.

Source: art/reference/character-sheet-actions.png, the walk pose (second row, third drawing).
Every piece keeps the owner's ink line: it is enlarged four times, the soft scan edge is firmed up,
and the paper round it is made transparent. Coordinates are pixels of the sheet.

    python3 tools/cut_parts.py        # writes art/parts/*.png and art/parts/parts.json
"""
import json
from collections import deque
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / 'art' / 'reference' / 'character-sheet-actions.png'
OUT = ROOT / 'art' / 'parts'
UP = 4   # enlargement

# name: polygon to keep (sheet px), pivot (the joint it turns on); `seal` = black lines that close
# an outline the cut leaves open; `erase` = (centre, radius) spots of a neighbour's ink to remove.
PARTS = {
    'head': dict(
        poly=[(748, 404), (896, 404), (896, 512), (886, 530), (873, 543), (856, 544), (838, 538),
              (824, 531), (812, 524), (806, 520), (800, 518), (790, 516), (781, 510), (774, 500), (748, 486)],
        pivot=(822, 522)),
    'torso': dict(
        poly=[(806, 528), (815, 527), (825, 531), (840, 538), (858, 544), (873, 544), (882, 546),
              (892, 547), (898, 550), (899, 580), (892, 600), (889, 617), (806, 617), (806, 600),
              (797, 579), (797, 572), (806, 566), (810, 556), (809, 543), (806, 530)],
        # the collar is under the beard on the sheet: close it in black, where the beard sits
        seal=[((807, 530), (825, 534)), ((825, 534), (858, 547)), ((858, 547), (897, 551))],
        fill=[[(809, 531), (825, 535), (858, 548), (894, 552), (812, 552)]],
        pivot=(846, 612)),
    'arm_near': dict(
        poly=[(698, 515), (780, 515), (800, 519), (808, 525), (815, 545), (814, 562), (806, 570),
              (797, 576), (790, 583), (780, 628), (698, 628)],
        pivot=(790, 548)),
    # the same arm in two pieces, so it can bend like a rubber hose: cut along the hem of the sleeve
    'sleeve': dict(
        poly=[(770, 527), (780, 515), (800, 519), (808, 525), (815, 545), (814, 562), (806, 570),
              (797, 576), (790, 581), (782, 577), (789, 570), (791, 556), (785, 542), (771, 534)],
        seal=[((772, 531), (786, 540)), ((786, 540), (792, 555)), ((792, 555), (790, 570)),
              ((790, 570), (784, 576))],
        pivot=(790, 548)),
    'forearm': dict(
        poly=[(698, 515), (772, 515), (775, 530), (789, 540), (795, 556), (793, 571), (786, 578),
              (790, 583), (780, 628), (698, 628)],
        seal=[((772, 531), (786, 540)), ((786, 540), (792, 555)), ((792, 555), (790, 570)),
              ((790, 570), (784, 576))],
        pivot=(781, 553)),
    'arm_far': dict(
        poly=[(894, 488), (966, 488), (966, 594), (894, 594)],
        seal=[((896, 538), (896, 592))],
        pivot=(893, 546)),
    # trailing boot, flat on the quay; cut along the rim of the rolled cuff, where the leg goes in
    'foot_flat': dict(
        poly=[(740, 660), (765, 645), (785, 636), (797, 639), (801, 641), (800, 655), (803, 666),
              (811, 677), (818, 682), (823, 690), (829, 702), (827, 711), (821, 716.5), (763, 716.5), (752, 706),
              (740, 700)],
        seal=[((797, 643), (795.5, 655)), ((795.5, 655), (798, 665)), ((798, 665), (806.5, 676)),
              ((806.5, 676), (814, 681))],
        fill=[[(754, 676), (770, 663), (790, 690), (815, 695), (819, 709), (772, 709), (760, 695)],
              [(752, 679), (757, 672), (765, 700), (772, 709), (768, 709), (757, 698)],
              [(778, 655), (790, 645), (793, 665), (803, 680), (790, 683), (778, 670)],
              [(749, 672), (757, 668), (763, 690), (768, 702), (790, 708), (820, 708), (822, 713),
               (770, 714), (757, 704), (749, 690)]],
        pivot=(806, 660), heel=(758, 716), ball=(815, 716)),
    # leading boot at heel strike, toe up, sole showing
    'foot_heel': dict(
        poly=[(899, 636), (886, 640), (875, 652), (867, 668), (868, 684), (876, 696), (888, 703),
              (897, 716.5), (927, 716.5), (934, 711.5), (982, 711.5), (982, 632), (945, 622),
              (925, 631), (913, 643), (906, 641)],
        fill=[[(880, 652), (900, 646), (915, 651), (945, 637), (964, 643), (964, 655), (945, 675),
               (925, 700), (908, 708), (890, 699), (877, 682), (876, 665)],
              [(895, 700), (905, 696), (918, 706), (912, 714), (903, 714)],
              [(955, 640), (968, 644), (972, 652), (966, 660), (958, 650)]],
        pivot=(880, 656), heel=(906, 716)),
}


def cut(name, spec):
    xs = [p[0] for p in spec['poly']]; ys = [p[1] for p in spec['poly']]
    x0, y0 = int(min(xs)) - 2, int(min(ys)) - 2
    x1, y1 = int(max(xs)) + 3, int(max(ys)) + 3
    src = Image.open(SHEET).convert('L').crop((x0, y0, x1, y1))
    big = src.resize((src.width * UP, src.height * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.6))
    ink = np.asarray(big) < 140
    keep = Image.new('L', big.size, 0)
    ImageDraw.Draw(keep).polygon([((x - x0) * UP, (y - y0) * UP) for x, y in spec['poly']], fill=255)
    ink = ink & (np.asarray(keep) > 0)
    for a, b in spec.get('seal', []):
        m = Image.new('L', big.size, 0)
        ImageDraw.Draw(m).line([((a[0] - x0) * UP, (a[1] - y0) * UP), ((b[0] - x0) * UP, (b[1] - y0) * UP)],
                               fill=255, width=round(6 * UP))
        ink = ink | ((np.asarray(m) > 0) & (np.asarray(keep) > 0))
    for c, r in spec.get('erase', []):
        m = Image.new('L', big.size, 0)
        ImageDraw.Draw(m).ellipse([(c[0] - r - x0) * UP, (c[1] - r - y0) * UP,
                                   (c[0] + r - x0) * UP, (c[1] + r - y0) * UP], fill=255)
        ink = ink & ~(np.asarray(m) > 0)
    # paper = everything not ink that the outside can reach
    h, w = ink.shape
    paper = np.zeros((h, w), bool)
    q = deque()
    edge = [(y, x) for x in range(w) for y in (0, h - 1)] + [(y, x) for y in range(h) for x in (0, w - 1)]
    for y, x in edge:
        if not ink[y, x] and not paper[y, x]:
            paper[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < h and 0 <= xx < w and not paper[yy, xx] and not ink[yy, xx]:
                paper[yy, xx] = True; q.append((yy, xx))
    if 'fill' in spec:      # paper the cut let in: this area is inside the piece
        m = Image.new('L', big.size, 0)
        for poly in spec['fill']:
            ImageDraw.Draw(m).polygon([((x - x0) * UP, (y - y0) * UP) for x, y in poly], fill=255)
        paper = paper & ~(np.asarray(m) > 0)
    la = np.zeros((h, w, 2), np.uint8)
    la[..., 0] = np.where(ink | paper, 0, 255)      # paper is stored black, so a turned piece gets no white fringe
    la[..., 1] = np.where(paper, 0, 255)
    Image.fromarray(la, 'LA').save(OUT / f'{name}.png', optimize=True)
    meta = dict(origin=[x0, y0], pivot=list(spec['pivot']), size=[w, h])
    for k in ('heel', 'ball'):
        if k in spec:
            meta[k] = list(spec[k])
    return meta


# ---- faces: the same head drawing with the mouth and eye redrawn ---------------------------------
GRIN = [(826, 495), (875, 495), (877, 510), (850, 518), (828, 516)]     # the teeth, inside the beard
PUCKER = {'w1': ((859, 504), 7.5, 9.5, 3.0, 4.4), 'w2': ((860.5, 504), 9.5, 11.5, 4.4, 6.2)}
EYE = (832.5, 473.5)


def faces(meta):
    base = Image.open(OUT / 'head.png')
    x0, y0 = meta['head']['origin']
    P = lambda x, y: ((x - x0) * UP, (y - y0) * UP)
    for mouth in ('grin', 'w1', 'w2'):
        for eye in ('open', 'shut'):
            if (mouth, eye) == ('grin', 'open'):
                continue
            im = base.copy()
            ink = im.getchannel(0)
            d = ImageDraw.Draw(ink)
            if mouth != 'grin':
                d.polygon([P(*q) for q in GRIN], fill=0)
                (cx, cy), rx, ry, hx, hy = PUCKER[mouth]
                d.ellipse([*P(cx - rx, cy - ry), *P(cx + rx, cy + ry)], fill=255)      # pursed lips
                d.ellipse([*P(cx - hx + 1, cy - hy), *P(cx + hx + 1, cy + hy)], fill=0)
            if eye == 'shut':
                d.ellipse([*P(EYE[0] - 8.5, EYE[1] - 12.5), *P(EYE[0] + 8.5, EYE[1] + 12.5)], fill=255)
                import math
                pts = [P(EYE[0] + 8 * math.cos(math.radians(a)), EYE[1] + 5 + 8 * math.sin(math.radians(a)))
                       for a in range(200, 345, 10)]
                d.line(pts, fill=0, width=round(5 * UP), joint='curve')
            im.putalpha(base.getchannel(1)) if False else None
            out = Image.merge('LA', (ink, base.getchannel(1)))
            name = f'head_{mouth}_{eye}'
            out.save(OUT / f'{name}.png', optimize=True)
            meta[name] = dict(meta['head'])


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {n: cut(n, s) for n, s in PARTS.items()}
    faces(meta)
    (OUT / 'parts.json').write_text(json.dumps(dict(up=UP, parts=meta), indent=1) + '\n')
    print(meta)

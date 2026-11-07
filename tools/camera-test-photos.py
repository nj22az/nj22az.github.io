#!/usr/bin/env python3
"""Pocket Camera's test bench: six photographs a Look is judged on, cut to the camera's 4:3 (upright 3:4) and at most
1440 px on the long side, as tools/render-camera-looks.mjs expects them.

    python3 tools/camera-test-photos.py <out-folder>

Two are the owner's, in the repository (IMG_2855.jpeg, the riverside café; assets/images/nils-lake-hero.jpg, a shady
garden). Four are fetched, if the network allows, and are not kept in the repository:
  portrait-restaurant  Pexels 29747506, Vladislav Anchuk (Pexels licence): a woman at a restaurant at night, black top, glasses
  portrait-braids      Pexels 28890349, Ozan Çulha (Pexels licence): a woman with braids on a dark background
  portrait-hat         Pexels 3024599, Yulia Rozanova (Pexels licence): an elderly woman in a conical hat, daylight
  night                "Dotonbori, Osaka, at night, November 2016", Martin Falbisoner, CC BY-SA 4.0 (Wikimedia Commons)
A photo that cannot be fetched is reported and skipped; judge on the rest, and say which were missing.
"""
import io
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent
FETCHED = {
    'portrait-restaurant': 'https://images.pexels.com/photos/29747506/pexels-photo-29747506.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'portrait-braids': 'https://images.pexels.com/photos/28890349/pexels-photo-28890349.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'portrait-hat': 'https://images.pexels.com/photos/3024599/pexels-photo-3024599.jpeg?auto=compress&cs=tinysrgb&w=1600',
    'night': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Dotonbori%2C_Osaka%2C_at_night%2C_November_2016.jpg/'
             '3840px-Dotonbori%2C_Osaka%2C_at_night%2C_November_2016.jpg',
}
# Wikimedia's robot policy (https://w.wiki/4wJS) asks for a user agent that says what is asking and how to reach it.
AGENT = 'PocketCameraTestBench/1.0 (https://github.com/nj22az/nj22az.github.io; test photos for camera/)'
LOCAL = {'cafe': REPO / 'IMG_2855.jpeg', 'garden': REPO / 'assets/images/nils-lake-hero.jpg'}
# Where a tall photo is cut from, as a share of what is cut away above it: the braids portrait keeps her face.
TOP = {'portrait-braids': .25}


def fit(name, im):
    """The camera's shape, 4:3 or upright 3:4 as the photo is, cut from the middle (or TOP), at most 1440 px."""
    im = ImageOps.exif_transpose(im).convert('RGB')
    w, h = im.size
    ratio = 3 / 4 if h > w else 4 / 3
    if w / h > ratio:
        nw = int(h * ratio)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / ratio)
        top = int((h - nh) * TOP.get(name, .5))
        im = im.crop((0, top, w, top + nh))
    im.thumbnail((1440, 1440), Image.LANCZOS)
    return im


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    made, missing = [], []
    for name, path in LOCAL.items():
        fit(name, Image.open(path)).save(out / f'{name}.jpg', quality=92)
        made.append(name)
    for name, url in FETCHED.items():
        try:
            request = urllib.request.Request(url, headers={'User-Agent': AGENT})
            data = urllib.request.urlopen(request, timeout=60).read()
            fit(name, Image.open(io.BytesIO(data))).save(out / f'{name}.jpg', quality=92)
            made.append(name)
        except Exception as error:  # the network may be closed; the bench still runs on what it has
            missing.append(f'{name} ({error})')
    print('made:', ', '.join(made))
    if missing:
        print('not fetched:', '; '.join(missing))


if __name__ == '__main__':
    main()

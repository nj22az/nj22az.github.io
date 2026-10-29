#!/usr/bin/env python3
"""Pocket Camera's pixel frames (tools/draw-camera-frames.py): the files in camera/frames are what the drawing makes
(nobody edits a frame's pixels by hand), and every frame covers its whole border, with no gap, round a photo of any
shape the camera takes or opens, leaving the photo itself clear. Run: python3 tools/draw-camera-frames.test.py"""
import importlib.util, json, tempfile, unittest
from pathlib import Path
from PIL import Image, ImageChops

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('frames', HERE / 'draw-camera-frames.py')
frames = importlib.util.module_from_spec(spec)
spec.loader.exec_module(frames)
SHAPES = [4 / 3, 3 / 4, 1, 16 / 9, 9 / 16, 3 / 2, 1.13]


class PixelFrames(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.built = frames.build(Path(cls.tmp.name), quiet=True)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_committed_files_are_the_drawing(self):
        committed = frames.OUT
        self.assertEqual(json.loads((committed / 'frames.json').read_text()), json.loads((Path(self.tmp.name) / 'frames.json').read_text()),
                         'frames.json is stale: run python3 tools/draw-camera-frames.py')
        for _, meta in self.built:
            a = Image.open(committed / f"{meta['id']}.png").convert('RGBA')
            b = Image.open(Path(self.tmp.name) / f"{meta['id']}.png").convert('RGBA')
            self.assertEqual(a.size, b.size, meta['id'])
            self.assertIsNone(ImageChops.difference(a, b).getbbox(), f"{meta['id']}.png is stale: run python3 tools/draw-camera-frames.py")

    def test_every_border_is_whole_and_the_photo_clear(self):
        for sheet, meta in self.built:
            for aspect in SHAPES:
                w, h = frames.grid(aspect)
                art = frames.compose(sheet, meta, w, h)
                alpha = art.getchannel('A')
                b = meta['border']
                gaps = [(x, y) for y in range(h) for x in range(w)
                        if (x < b or x >= w - b or y < b or y >= h - b) and alpha.getpixel((x, y)) < 255]
                self.assertEqual(gaps[:5], [], f"{meta['id']} at {w}x{h}: border pixels left open")
                # The photo is clear but where a scene is set over it on purpose (the ferry's bow, Fuji).
                window = [(x, y) for y in range(b, h - b) for x in range(b, w - b)]
                covered = sum(1 for x, y in window if alpha.getpixel((x, y)))
                # Fuji stands in front of the photo's corner, as a resident in a sticker would; the others keep to the border.
                limit = .14 if meta['id'] == 'haisai' else .03
                self.assertLess(covered / len(window), limit, f"{meta['id']} at {w}x{h} covers {covered / len(window):.0%} of the photo")

    def test_four_shades_each(self):
        for sheet, meta in self.built:
            colours = {c for c in sheet.getdata() if c[3]}
            self.assertLessEqual(len(colours), 4, f"{meta['id']} uses {len(colours)} colours")


if __name__ == '__main__':
    unittest.main()

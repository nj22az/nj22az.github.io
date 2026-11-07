#!/usr/bin/env python3
"""The manga marks: the committed files are what tools/draw-manga-marks.py draws, ten of them, each a picture with
clear corners and ink in it, no bigger than 512 px.

    python3 tools/draw-manga-marks.test.py
"""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('marks', HERE / 'draw-manga-marks.py')
marks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(marks)


class Marks(unittest.TestCase):
    def test_committed_files_are_the_drawing(self):
        committed = json.loads((marks.OUT / 'marks.json').read_text(encoding='utf-8'))
        with tempfile.TemporaryDirectory() as tmp:
            marks.OUT = Path(tmp)
            marks.build()
            drawn = json.loads((Path(tmp) / 'marks.json').read_text(encoding='utf-8'))
        marks.OUT = HERE.parent / 'camera' / 'stickers'
        self.assertEqual(drawn, committed, 'run python3 tools/draw-manga-marks.py and commit what it draws')

    def test_each_mark(self):
        manifest = json.loads((marks.OUT / 'marks.json').read_text(encoding='utf-8'))
        self.assertEqual(manifest['kind'], 'marks')
        self.assertEqual(len(manifest['stickers']), 10)
        for entry in manifest['stickers']:
            im = Image.open(marks.OUT / entry['src'].split('?')[0]).convert('RGBA')
            self.assertLessEqual(max(im.size), 512, entry['id'])
            self.assertEqual((im.width, im.height), (entry['width'], entry['height']), entry['id'])
            alpha = im.getchannel('A')
            self.assertEqual(alpha.getpixel((0, 0)), 0, f"{entry['id']}: a clear corner")
            dark = sum(1 for r, g, b, a in im.getdata() if a > 200 and r + g + b < 120)
            self.assertGreater(dark, 200, f"{entry['id']}: inked")


if __name__ == '__main__':
    unittest.main()

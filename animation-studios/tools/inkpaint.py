"""Ink and paint, as a cel is made: Blender renders every part of the scene as a flat code colour
(which part it is, and whether it is painted white or black); this turns that into the drawing.

A line is inked wherever two different parts meet and at least one of them is white, and wherever
white meets the open air. Black on black, and black against the air, need no line. Shapes given the
same part number (a face and its eyes, a shirt and its hoops) are painted without a line between. The picture is rendered large and reduced, so the ink is smooth.
"""
import math
import numpy as np
from PIL import Image, ImageFilter


def inked(id_image, scale, ink_px):
    """id_image: RGBA render, R and G = the part's number in steps of 16, B = 255 for white paint and 0 for black,
    A = something is there. scale: how many times larger than the film it was rendered.
    Returns the film-size RGBA picture."""
    a = np.asarray(id_image.convert('RGBA'))
    part = (a[..., 0].astype(np.int16) + 8) // 16 + ((a[..., 1].astype(np.int16) + 8) // 16) * 15
    solid = a[..., 3] > 127
    white = (a[..., 2] > 127) & solid
    part = np.where(solid, part, 0)
    edge = np.zeros(part.shape, bool)
    for axis in (0, 1):
        p0, p1 = part, np.roll(part, -1, axis)
        w0, w1 = white, np.roll(white, -1, axis)
        s0, s1 = solid, np.roll(solid, -1, axis)
        e = (p0 != p1) & (w0 | w1)                # two parts meet, or a part meets the air, and one is white
        if axis == 0:
            e[-1, :] = False
        else:
            e[:, -1] = False
        edge |= e | np.roll(e, 1, axis)
    # grow the hairline to the ink's width with round ends: thicken it a little (so that slanting
    # lines are solid), blur it, and cut where a line of the full width would end
    r = ink_px * scale / 2
    core = 9
    m = Image.fromarray((edge * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(core))
    sigma = r * 0.5
    grown = np.asarray(m.filter(ImageFilter.GaussianBlur(sigma)), dtype=np.float32) / 255
    phi = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    half = (core + 1) / 2
    ink = grown > phi((r + half) / sigma) - phi((r - half) / sigma)
    lum = np.where(white & ~ink, 255, 0).astype(np.uint8)
    alpha = np.where(solid | ink, 255, 0).astype(np.uint8)
    out = Image.merge('LA', (Image.fromarray(lum), Image.fromarray(alpha))).convert('RGBA')
    # black where nothing is, so the reduced edge has no white fringe
    return out.resize((out.width // scale, out.height // scale), Image.LANCZOS)

"""
Her maker's mark: an invisible watermark in the model's own numbers.

The owner, 12 November 2026: "I need you to water mark, models, with my logo and these icons, incase someone just steals
them, these are invisible watermarks, one shouldnt be able to download the 3d models, its just a demo".

What it is. The page's model keeps each corner's place as three whole numbers (assemble.py: 65,535 steps across her
breadth, her height and her length). Across her breadth one step is 0.3 mm. For every corner, the last bit of that number
is not left to chance: it is set to a bit worked out from the corner's own place and a secret key. Nothing can be seen of
it (a corner moves 0.3 mm sideways or not at all, and two corners at one place move alike, so no seam opens), but with the
key one can go through any copy of her and count how many corners carry the right bit: all of them in a copy of hers,
half of them in anything else.

What it survives: being saved in another format, having its corners put in another order, being cut up (each corner
carries its own bit: a single deck or a single fitting still answers), as long as the corners keep their places to a
tenth of a millimetre. What it does not survive: being scaled or moved without saying by how much, being remeshed or
decimated, having its corners snapped to a coarser grid. It proves whose a copy is; it does not stop the copying.

The key is never in this repository (which is public): it is read from the environment (CHISUM_MARK_KEY, hex) or from
~/.config/chisum/watermark.key. Without it the model is not assembled for publishing. Only its fingerprint, which gives
nothing away, is written into the file. `ferry/tools/watermark.py` makes a key, reads a copy and says whose it is.

Plain Python with numpy; no Blender.
"""
import hashlib
import os
import numpy as np

SCHEME = 'x-lsb-keyed-1'
OWNER = 'Johansson Animation Studios'
NOTICE = ('(c) 2026 Nils Johansson, Johansson Animation Studios. All rights reserved. This model is shown as a demonstration on '
          'nj22az.github.io only: it may not be downloaded, copied, converted, redistributed or used elsewhere without written permission. '
          'It carries its maker\'s marks, visible and invisible.')
KEY_FILE = os.path.expanduser('~/.config/chisum/watermark.key')


def key(required=True):
    """The secret key: from the environment, or from the file outside the repository. None if there is none and it is not required."""
    env = os.environ.get('CHISUM_MARK_KEY')
    if env:
        return bytes.fromhex(env.strip())
    if os.path.exists(KEY_FILE):
        return bytes.fromhex(open(KEY_FILE).read().strip())
    if required:
        raise SystemExit(f'no watermark key: none in CHISUM_MARK_KEY and none at {KEY_FILE}. Make one with `python3 ferry/tools/watermark.py --new-key` '
                         '(once, and keep a copy of it: without the key the mark cannot be proven), or assemble with --unmarked for a build that is not to be published.')
    return None


def fingerprint(k):
    """What may be published of a key: enough to tell two keys apart, nothing that helps to find one."""
    return hashlib.blake2b(b'chisum maker\'s mark, public fingerprint', key=k, digest_size=8).hexdigest()


def bits(q, k):
    """The bit each corner should carry: from its place (its number across her breadth without its last bit, its height, its
    length) and the key. `q` is whole numbers, n by 3 (x, y, z as the file keeps them)."""
    q = np.asarray(q, dtype=np.uint16)
    base = np.empty((len(q), 3), dtype='<u2')
    base[:, 0] = q[:, 0] & 0xFFFE
    base[:, 1:] = q[:, 1:]
    # each different place once: the same place always gets the same bit
    uniq, inverse = np.unique(base, axis=0, return_inverse=True)
    raw = uniq.tobytes()
    out = np.empty(len(uniq), dtype=np.uint8)
    h = hashlib.blake2b
    for i in range(len(uniq)):
        out[i] = h(raw[6 * i:6 * i + 6], key=k, digest_size=1).digest()[0] & 1
    return out[inverse.reshape(-1)]


def embed(q, k):
    """The same corners, each carrying its bit."""
    q = np.array(q, dtype=np.uint16, copy=True)
    q[:, 0] = (q[:, 0] & 0xFFFE) | bits(q, k)
    return q


def read(q, k):
    """How many of these corners carry the right bit: (the share, how many were looked at, how far that share is from chance in
    standard deviations). A copy of hers: a share of 1. Anything else: about a half."""
    q = np.asarray(q, dtype=np.uint16)
    if not len(q):
        return 0.0, 0, 0.0
    # each different corner counts once
    uniq = np.unique(q, axis=0)
    right = int(((uniq[:, 0] & 1) == bits(uniq, k)).sum())
    n = len(uniq)
    return right / n, n, (right - n / 2) / (0.5 * n ** 0.5)


def quantise(pos, lo, hi):
    """Places in metres (the ship's axes) → the whole numbers the file keeps, by her bounds."""
    lo, hi = np.asarray(lo, dtype=np.float64), np.asarray(hi, dtype=np.float64)
    return np.clip(np.rint((np.asarray(pos, dtype=np.float64) - lo) / (hi - lo) * 65535), 0, 65535).astype(np.uint16)

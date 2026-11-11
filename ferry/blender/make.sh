#!/bin/bash
# The whole build of the Chisum and every check on it, in order. It stops at the first that fails: she is not built until
# all of them pass (JSY-STD-401, 402, 403).
#
#   ferry/blender/make.sh [part file] [blend file]
#
# Then, with the site served on port 8765 (python3 -m http.server 8765): the page's own checks, ferry/checks/*.cjs.
set -e
cd "$(dirname "$0")/../.."
PART=${1:-/tmp/chisum.npz}
BLEND=${2:-/tmp/chisum.blend}
python3 ferry/blender/ga.py
blender -b -P ferry/blender/build.py -- --part "$PART" --blend "$BLEND" | grep -E "inner face|structure behind|solids|moving parts|triangles$|wrote|stairs outside|through|inside-out|do not agree|Error|Traceback" || true
test -f "$PART"
python3 ferry/blender/assemble.py --part "$PART"
python3 ferry/blender/check.py
python3 ferry/blender/zfight.py --part "$PART"
python3 ferry/blender/afloat.py --part "$PART" --allow ferry/blender/afloat-known.json
python3 ferry/blender/spans.py --part "$PART"
echo "built: every check passed"

#!/bin/sh
# Here -> Town. Makes the branch claude/minato-maru in the Town from BASE and commits the files of town/ on it.
# Usage: temp/minato-maru/bring-back.sh /path/to/johansson-town   (a clone of nj22az/johansson-town)
# The branch starts at BASE, not at today's main, so merging it into main merges like any branch: nothing that
# changed on main since is overwritten.
set -eu
town=${1:?the path of the Town clone}
here=$(cd "$(dirname "$0")" && pwd)
base=$(cat "$here/BASE")
branch=${2:-claude/minato-maru}
git -C "$town" checkout -b "$branch" "$base"
(cd "$here/town" && find . -type f) | while IFS= read -r f; do
 f=${f#./}
 mkdir -p "$town/$(dirname "$f")"
 cp "$here/town/$f" "$town/$f"
 git -C "$town" add -- "$f"
done
while IFS= read -r f; do [ -z "$f" ] || git -C "$town" rm -q -- "$f"; done < "$here/DELETED"
git -C "$town" commit -q -m "Minato Maru: working drawings Rev C and her fixes, from the Office repository's temp/minato-maru" -m "$(cat "$here/COMMITS")"
echo "Branch $branch is ready in $town. Next: npm run build:runtime, node tools/ci-guard.mjs, then merge on the owner's word."

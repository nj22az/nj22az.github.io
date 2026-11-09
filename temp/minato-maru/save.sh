#!/bin/sh
# Town -> here. Copies every file the Town branch changes against BASE into town/, in the Town's own paths.
# Usage: temp/minato-maru/save.sh /path/to/johansson-town   (the Town checkout, with the work committed)
set -eu
town=${1:?the path of the Town checkout}
here=$(cd "$(dirname "$0")" && pwd)
base=$(cat "$here/BASE")
[ -z "$(git -C "$town" status --porcelain --untracked-files=no)" ] || { echo "The Town checkout has uncommitted changes: commit them first." >&2; exit 1; }
rm -rf "$here/town"
mkdir -p "$here/town"
git -C "$town" diff --name-only --diff-filter=d "$base" HEAD | while IFS= read -r f; do
 mkdir -p "$here/town/$(dirname "$f")"
 cp "$town/$f" "$here/town/$f"
done
git -C "$town" diff --name-only --diff-filter=D "$base" HEAD > "$here/DELETED"
git -C "$town" log --format='%h %ad %s' --date=short "$base..HEAD" > "$here/COMMITS"
echo "Saved $(find "$here/town" -type f | wc -l | tr -d ' ') files from $(git -C "$town" rev-parse --short HEAD)."

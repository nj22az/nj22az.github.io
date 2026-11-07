#!/usr/bin/env bash
# Prune the repository's remote branches, from a computer with push rights.
#
#   tools/prune-branches.sh                 # dry run: lists what would go and what stays
#   tools/prune-branches.sh --delete        # deletes the branches already merged into main
#   tools/prune-branches.sh --stale 60      # also lists unmerged branches untouched for 60 days (no open PR)
#   tools/prune-branches.sh --stale 60 --delete
#
# A branch merged into main is redundant: its commits are on main. An unmerged branch is only listed, and deleted
# only with --stale N --delete when its last commit is older than N days and no open pull request points at it
# (checked with `gh`; when gh is missing or not signed in, unmerged branches are never deleted). Never touched: main,
# the Linux port (codex/johansson-world-steam-deck), release/*, archive/*, backup-main, and the branch named in KEEP.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
REMOTE=${REMOTE:-origin}
KEEP_RE='^(main|backup-main|codex/johansson-world-steam-deck|claude/sjoskolan-youtube-strategy-gofi3o|release/.*|archive/.*)$'
DELETE=0;STALE=0
while [ $# -gt 0 ];do case "$1" in --delete)DELETE=1;;--stale)STALE=$2;shift;;*)echo "unknown option $1">&2;exit 2;;esac;shift;done
git fetch --prune -q "$REMOTE"
open_prs="";pr_check=0
if command -v gh >/dev/null 2>&1 && open_prs=$(gh pr list --state open --limit 500 --json headRefName -q '.[].headRefName' 2>/dev/null);then pr_check=1;fi
[ "$STALE" -gt 0 ] && [ "$pr_check" = 0 ] && echo "note: open pull requests could not be checked (gh missing or not signed in), so no unmerged branch is deleted">&2
has_pr(){ printf '%s\n' "$open_prs"|grep -qx -- "$1"; }
merged=();stale=();kept=()
now=$(date +%s)
while read -r ref;do
 b=${ref#"$REMOTE"/}
 [[ "$b" == "HEAD" || "$b" =~ $KEEP_RE ]] && continue
 if git merge-base --is-ancestor "$ref" "$REMOTE/main";then merged+=("$b");continue;fi
 age=$(( (now-$(git log -1 --format=%ct "$ref"))/86400 ))
 if [ "$STALE" -gt 0 ] && [ "$age" -ge "$STALE" ] && ! has_pr "$b";then stale+=("$b ($age days)");else kept+=("$b ($age days$(has_pr "$b" && echo ', open PR' || true))");fi
done < <(git branch -r --format='%(refname:short)')
echo "Merged into main (${#merged[@]}):";printf '  %s\n' "${merged[@]:-}"
if [ "$STALE" -gt 0 ];then echo "Unmerged and untouched for $STALE days, no open PR (${#stale[@]}):";printf '  %s\n' "${stale[@]:-}";fi
echo "Kept (${#kept[@]}):";printf '  %s\n' "${kept[@]:-}"
if [ "$DELETE" = 1 ];then
 todo=("${merged[@]}");for s in "${stale[@]:-}";do [ -n "$s" ] && todo+=("${s%% *}");done
 [ ${#todo[@]} -eq 0 ] && { echo "nothing to delete";exit 0; }
 [ "$STALE" -gt 0 ] && [ "$pr_check" = 0 ] && todo=("${merged[@]}")
 echo "Deleting ${#todo[@]} branches on $REMOTE…"
 printf '%s\n' "${todo[@]}"|xargs -n 20 git push "$REMOTE" --delete
else
 echo "(dry run: add --delete to remove the merged ones$( [ "$STALE" -gt 0 ] && echo ' and the stale ones'))"
fi

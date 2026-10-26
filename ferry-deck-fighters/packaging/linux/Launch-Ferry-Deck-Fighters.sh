#!/bin/sh
# Native Linux launcher. All game paths are relative to this portable folder.
set -u
game_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
state_dir=${XDG_STATE_HOME:-"$HOME/.local/state"}/ferry-deck-fighters
mkdir -p "$state_dir" || exit 1
log=$state_dir/latest.log
if "$game_dir/bin/ferry-deck-fighters" --assets "$game_dir/assets/characters" --gles --fullscreen "$@" >"$log" 2>&1; then
    exit 0
else
    result=$?
    message="Ferry Deck Fighters could not start. See $log for details. This build needs the Linux SDL2 runtime, zlib and working GLES2 drivers."
    printf '%s\n' "$message" >&2
    if command -v kdialog >/dev/null 2>&1; then
        kdialog --error "$message" || true
    elif command -v zenity >/dev/null 2>&1; then
        zenity --error --text="$message" || true
    fi
    exit "$result"
fi

#!/bin/sh
# Draft launcher; requires a firmware-compatible SDL2/EGL environment.
# Place beside the ARM64 executable. This is not a complete PortMaster package.
set -eu
cd "$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
if [ ! -x ./ferry-deck-fighters.aarch64 ]; then
    echo 'Missing executable: ferry-deck-fighters.aarch64' >&2
    exit 1
fi
exec ./ferry-deck-fighters.aarch64 --assets ../assets/characters --gles --fullscreen "$@"

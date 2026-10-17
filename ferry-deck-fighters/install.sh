#!/bin/sh
set -eu
curl -fsSL https://raw.githubusercontent.com/nj22az/nj22az.github.io/johansson-world-linux-v0.2.2/steam-deck/install.sh -o /tmp/johansson-world-install.sh
exec sh /tmp/johansson-world-install.sh

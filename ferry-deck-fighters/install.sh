#!/bin/sh
set -eu
curl -fL --progress-bar https://raw.githubusercontent.com/nj22az/nj22az.github.io/main/johansson-world/install.sh -o /tmp/johansson-world-install.sh
exec sh /tmp/johansson-world-install.sh

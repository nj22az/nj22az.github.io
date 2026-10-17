#!/bin/sh
set -eu
curl -fsSL https://nj22az.github.io/johansson-world/install.sh -o /tmp/johansson-world-install.sh
exec sh /tmp/johansson-world-install.sh

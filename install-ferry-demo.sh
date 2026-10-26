#!/bin/sh
# Ferry Deck Fighters demo installer for Steam Deck and x86-64 Linux.
# Installs only within your user account. No sudo or system changes.
set -eu
if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ]; then
    echo 'This installer is for Steam Deck / x86-64 Linux. The CubeXX needs a firmware-specific ARM64 package.' >&2
    exit 1
fi
for tool in curl tar sha256sum mktemp; do
    command -v "$tool" >/dev/null 2>&1 || { echo "Missing required command: $tool" >&2; exit 1; }
done
version=2026.10.17.1
url=https://raw.githubusercontent.com/nj22az/nj22az.github.io/be2f8cc77231f5fcc0532d756856299d7303971c/ferry-deck-fighters/demo/Ferry-Deck-Fighters-Linux-Demo.tar.gz
expected=51f469610ace263b865402d45af410ba94959ee828e8bd25991ebd2b751f4ca9
work=$(mktemp -d)
trap 'rm -f "$work/demo.tar.gz"; rmdir "$work" 2>/dev/null || true' EXIT
trap 'exit 1' HUP INT TERM
archive=$work/demo.tar.gz
echo 'Downloading Ferry Deck Fighters Linux demo...'
curl --proto '=https' --tlsv1.2 -fL --retry 2 "$url" -o "$archive"
printf '%s  %s\n' "$expected" "$archive" | sha256sum -c -
data_dir=${XDG_DATA_HOME:-"$HOME/.local/share"}
install_dir=$data_dir/ferry-deck-fighters/demo-$version
if [ -e "$install_dir" ]; then
    if [ ! -f "$install_dir/.ferry-demo-$version" ]; then
        echo "Install folder already exists and is not a recognised installation: $install_dir" >&2
        exit 1
    fi
    echo 'This demo version is already installed.'
else
    mkdir -p "$install_dir"
    tar -xzf "$archive" -C "$install_dir" --strip-components=1
    chmod +x "$install_dir/bin/ferry-deck-fighters" "$install_dir/Launch-Ferry-Deck-Fighters.sh"
    printf '%s\n' "$expected" > "$install_dir/.ferry-demo-$version"
fi
app_dir=$data_dir/applications
mkdir -p "$app_dir"
# Escape the launcher path for the desktop-entry Exec and quoted Path fields.
launch_path=$(printf '%s' "$install_dir/Launch-Ferry-Deck-Fighters.sh" | sed 's/\\/\\\\/g;s/"/\\"/g;s/%/%%/g;s/\$/\\$/g;s/`/\\`/g')
cat > "$app_dir/ferry-deck-fighters.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Ferry Deck Fighters
Comment=Thao and Thuan on the Minato Maru ferry deck
Exec="$launch_path"
Terminal=false
Categories=Game;
StartupNotify=false
DESKTOP
chmod +x "$app_dir/ferry-deck-fighters.desktop"
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$app_dir" >/dev/null 2>&1 || true
fi
printf '\nInstalled: %s\n' "$install_dir"
echo 'Steam Deck: Steam > Add a Game > Add a Non-Steam Game > Ferry Deck Fighters.'
echo 'If it is not listed, Browse to Launch-Ferry-Deck-Fighters.sh in the installed folder.'
echo 'Leave forced Proton compatibility disabled and select a Gamepad controller layout.'
echo 'Then return to Gaming Mode and launch.'


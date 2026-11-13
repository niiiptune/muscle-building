#!/bin/sh
# Re-renders the body figure from Z-Anatomy and rebuilds assets/ and figure-masks.js.
# Needs Blender, cwebp and node. ZANATOMY points at the Z-Anatomy Startup.blend.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
root=$(dirname "$here")
blender=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
blend=${ZANATOMY:-$HOME/Developer/.zanatomy/template/Z-Anatomy/Startup.blend}
out="$here/out"
mkdir -p "$out" "$root/assets"

for view in front back; do
  "$blender" -b "$blend" -P "$here/render-figure.py" -- view=$view mode=matcap res=1600 out="$out/body-$view.png"
  "$blender" -b "$blend" -P "$here/render-figure.py" -- view=$view mode=mask res=1200 out="$out/mask-$view.png"
  cwebp -quiet -q 84 -alpha_q 100 "$out/body-$view.png" -o "$root/assets/body-$view.webp"
done

node "$here/build-masks.mjs" "$out"

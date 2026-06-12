#!/bin/sh
# Convert the recorded demo walkthrough (largest webm from `pnpm demo`) into
# the README GIF + an mp4. Requires ffmpeg. Run after `pnpm demo`.
set -e
SRC=$(find test-results/demo -name "*.webm" -exec ls -S {} + 2>/dev/null | head -1)
[ -z "$SRC" ] && echo "no demo video — run 'pnpm demo' first" && exit 1
echo "source: $SRC"
ffmpeg -y -i "$SRC" -vf "fps=12,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" assets/demo-workbench.gif
ffmpeg -y -i "$SRC" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart assets/demo-workbench.mp4
echo "wrote assets/demo-workbench.{gif,mp4}"

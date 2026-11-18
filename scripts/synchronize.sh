#!/usr/bin/env bash
#
# Synchronize one DSFR Figma file into its Penpot file with figpot (v2+)
#
# Usage: scripts/synchronize.sh <pictogrammes|fondamentaux|composants|modeles|beta> [extra figpot options...]
#
# Environment:
# - FIGPOT: command to run figpot (default `npx --yes @betagouv/figpot@^2`), for a local checkout (no build needed) use for example
#   FIGPOT="npm --prefix ../betagouv-figpot run --silent cli:unsecure --"
# - FIGMA_ACCESS_TOKEN, PENPOT_ACCESS_TOKEN, PENPOT_BASE_URL (see figpot documentation)
#
# Files are synchronized as-is (no page, component, color or typography exclusion) so the Penpot files are a faithful copy
# of the Figma ones, and so components used by mockups transferred with the Penpot Exporter Figma plugin can always be bound.
# The only exception is the presentation frames of Composants (see below)
#

set -euo pipefail

# Data (Figma cache, mapping files...) always lives in this repository, whatever the directory figpot is run from
DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/data"

FIGPOT="${FIGPOT:-npx --yes @betagouv/figpot@^2}"

# Figma file key : Penpot file ID
PICTOGRAMMES='LvF3nrRe78xEq04CoMh0Cb:b4b906dd-9024-819c-8008-f0bd485d3fac'
FONDAMENTAUX='IAK0vJ81qzdNQsLrsvHIv4:51f2d744-23b9-8138-8008-f0bd7ae54484'
COMPOSANTS='1KbbYzOMcFHmtiurClFxQv:110d30a4-9d92-80de-8008-f0bd80c81e78'
MODELES='utZfOiJzvpa7ZqDVGJ8fsu:b4b906dd-9024-819c-8008-f0bd87ca31d3'
BETA='TdCIBjiJD9kBchMhBrLjQQ:51f2d744-23b9-8138-8008-f0bd8d18df08'

file="${1:-}"
shift || true

# Media visuals get their ratio (16:9, 4:3...) from an invisible grid of small frames named "🚫 / <ratio>" (about 730 nodes each)
# whose height follows the width in Figma. Penpot cannot reproduce it (no ratio in its layouts) so they only weigh: about half of
# Composants, and its "Carte" page could not be loaded by a browser tab (out of memory). They are excluded from the files having
# them (Fondamentaux defines them, Composants uses them), and figpot keeps the Figma size of the visuals emptied this way
RATIO_GRIDS_EXCLUSION='^🚫 /'

case "$file" in
  # Pictogrammes is kept standalone so it can be imported first: its only external instances (an icon and a few links on
  # the "Lisez-moi" page) are kept as plain shapes, otherwise it would depend on files that depend on it
  pictogrammes) arguments=(-d "$PICTOGRAMMES" --skip-libraries) ;;
  # Fondamentaux uses a few components of Composants in its presentation pages, whereas Composants depends on Fondamentaux:
  # they are kept as plain shapes to avoid a circular dependency. Any other library referenced will stop the synchronization
  # (to spot Figma files not linked to the right libraries)
  fondamentaux)
    arguments=(
      -d "$FONDAMENTAUX" -l "$PICTOGRAMMES" --detach-library "${COMPOSANTS%%:*}"
      --exclude-node-pattern="$RATIO_GRIDS_EXCLUSION"
    )
    ;;
  # The desktop and mobile presentation frames (light and dark) are excluded: built from instances, they are about 40% of the
  # file. With them (about 261k nodes) the file once hydrated by Penpot exceeds what a browser can load (the 545 MB response is
  # over the maximum string length of the browser engine, 512 MB), so it cannot be opened anymore
  composants)
    arguments=(
      -d "$COMPOSANTS" -l "$FONDAMENTAUX" -l "$PICTOGRAMMES"
      --exclude-node-pattern='- Desktop - Thème clair'
      --exclude-node-pattern='- Mobile - Thème clair'
      --exclude-node-pattern='- Desktop et mobile - Thème clair'
      --exclude-node-pattern='- Desktop - Thème sombre'
      --exclude-node-pattern='- Mobile - Thème sombre'
      --exclude-node-pattern='- Desktop et mobile - Thème sombre'
      --exclude-node-pattern="$RATIO_GRIDS_EXCLUSION"
    )
    ;;
  modeles) arguments=(-d "$MODELES" -l "$PICTOGRAMMES" -l "$FONDAMENTAUX" -l "$COMPOSANTS") ;;
  beta) arguments=(-d "$BETA" -l "$PICTOGRAMMES" -l "$FONDAMENTAUX" -l "$COMPOSANTS") ;;
  *)
    echo "usage: $0 <pictogrammes|fondamentaux|composants|modeles|beta> [extra figpot options...]" >&2
    exit 1
    ;;
esac

# Hydration opens each page in the Penpot interface (with PENPOT_USER_EMAIL and PASSWORD, and a display, e.g. through `xvfb-run`)
# so Penpot computes what figpot cannot and applies pending library updates, so opening the files later does not change them.
# Pass `--no-hydrate` to skip it
# Figma exposes the font as "Marianne " (with a trailing space) whereas it's "Marianne" on Penpot
# shellcheck disable=SC2086
exec $FIGPOT document synchronize "${arguments[@]}" \
  --replace-font-pattern='^Marianne :Marianne' \
  --data-dir "$DATA_DIR" \
  "$@"

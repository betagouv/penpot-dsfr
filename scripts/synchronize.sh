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
PICTOGRAMMES='LvF3nrRe78xEq04CoMh0Cb:8303d8ee-1557-802d-8008-d5b5dc75ca7e'
FONDAMENTAUX='IAK0vJ81qzdNQsLrsvHIv4:8303d8ee-1557-802d-8008-d5b5da05829d'
COMPOSANTS='1KbbYzOMcFHmtiurClFxQv:8303d8ee-1557-802d-8008-d5b5d753f872'
MODELES='utZfOiJzvpa7ZqDVGJ8fsu:74db4ea5-7f73-8164-8008-d5b5d2565be8'
BETA='TdCIBjiJD9kBchMhBrLjQQ:74db4ea5-7f73-8164-8008-d5b5c9a3247a'

file="${1:-}"
shift || true

case "$file" in
  # Pictogrammes is kept standalone so it can be imported first: its only external instances (an icon and a few links on
  # the "Lisez-moi" page) are kept as plain shapes, otherwise it would depend on files that depend on it
  pictogrammes) arguments=(-d "$PICTOGRAMMES" --skip-libraries) ;;
  # Fondamentaux uses a few components of Composants in its presentation pages, whereas Composants depends on Fondamentaux:
  # they are kept as plain shapes to avoid a circular dependency. Any other library referenced will stop the synchronization
  # (to spot Figma files not linked to the right libraries)
  fondamentaux) arguments=(-d "$FONDAMENTAUX" -l "$PICTOGRAMMES" --detach-library "${COMPOSANTS%%:*}") ;;
  # The desktop and mobile presentation frames (light and dark) are excluded: built from instances, they are half of the file
  # (about 250k elements). With them, each update got slower as the Penpot file grew, since the instance loads and checks the
  # whole file at every update. Past about 60 seconds its proxy gives up (gateway timeout, the update may still be applied
  # behind) or the instance itself fails (server error). Once the file reached about 370k nodes on Penpot, even an empty
  # update failed, so the synchronization could not go further. The components (light and dark) and the welcome page are kept
  composants)
    arguments=(
      -d "$COMPOSANTS" -l "$FONDAMENTAUX" -l "$PICTOGRAMMES"
      --exclude-node-pattern='- Desktop - Thème clair'
      --exclude-node-pattern='- Mobile - Thème clair'
      --exclude-node-pattern='- Desktop et mobile - Thème clair'
      --exclude-node-pattern='- Desktop - Thème sombre'
      --exclude-node-pattern='- Mobile - Thème sombre'
      --exclude-node-pattern='- Desktop et mobile - Thème sombre'
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

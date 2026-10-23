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
# Files are synchronized as-is (no page, node, component, color or typography exclusion) so the Penpot files are a faithful copy
# of the Figma ones, and so components used by mockups transferred with the Penpot Exporter Figma plugin can always be bound
#

set -euo pipefail

# Data (Figma cache, mapping files...) always lives in this repository, whatever the directory figpot is run from
DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/data"

FIGPOT="${FIGPOT:-npx --yes @betagouv/figpot@^2}"

# Figma file key : Penpot file ID
PICTOGRAMMES='LvF3nrRe78xEq04CoMh0Cb:e25681ff-0a72-80e7-8008-d43fe8b8f7b6'
FONDAMENTAUX='IAK0vJ81qzdNQsLrsvHIv4:e25681ff-0a72-80e7-8008-d43ff975221d'
COMPOSANTS='1KbbYzOMcFHmtiurClFxQv:f7e4e924-d5db-819f-8008-d4405d9f92be'
MODELES='utZfOiJzvpa7ZqDVGJ8fsu:f7e4e924-d5db-819f-8008-d4406779827e'
BETA='TdCIBjiJD9kBchMhBrLjQQ:e25681ff-0a72-80e7-8008-d4406eaf8091'

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
  composants) arguments=(-d "$COMPOSANTS" -l "$FONDAMENTAUX" -l "$PICTOGRAMMES") ;;
  modeles) arguments=(-d "$MODELES" -l "$PICTOGRAMMES" -l "$FONDAMENTAUX" -l "$COMPOSANTS") ;;
  beta) arguments=(-d "$BETA" -l "$PICTOGRAMMES" -l "$FONDAMENTAUX" -l "$COMPOSANTS") ;;
  *)
    echo "usage: $0 <pictogrammes|fondamentaux|composants|modeles|beta> [extra figpot options...]" >&2
    exit 1
    ;;
esac

# Hydration is skipped: it opens the Penpot interface with the user credentials, and the files must be kept exactly as computed from Figma
# Figma exposes the font as "Marianne " (with a trailing space) whereas it's "Marianne" on Penpot
# shellcheck disable=SC2086
exec $FIGPOT document synchronize "${arguments[@]}" \
  --replace-font-pattern='^Marianne :Marianne' \
  --data-dir "$DATA_DIR" \
  --no-hydrate \
  "$@"

#!/usr/bin/env bash
# Ensure dist/smoovdeck CEF bundle matches current UI + host sources.
#
# Escape hatches:
#   SMOOVDECK_SKIP_REBUILD=1   — never rebuild; fail if bundle missing
#   SMOOVDECK_FORCE_REBUILD=1  — always rebuild UI + CEF
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/dist/smoovdeck"
APP="$DIR/smoovdeck"
UI_DIST="$ROOT/packages/ui/dist/index.html"
UI_DIR="$ROOT/packages/ui"

log() { echo "smoovdeck: $*" >&2; }

if [[ "${SMOOVDECK_SKIP_REBUILD:-}" == "1" ]]; then
  if [[ ! -x "$APP" || ! -f "$DIR/libcef.so" ]]; then
    log "missing CEF build in $DIR (SMOOVDECK_SKIP_REBUILD=1)"
    log "Run: deno task desktop:linux"
    exit 1
  fi
  exit 0
fi

newest_mtime() {
  local path newest=0 mt
  for path in "$@"; do
    [[ -e "$path" ]] || continue
    mt="$(stat -c '%Y' "$path" 2>/dev/null || stat -f '%m' "$path" 2>/dev/null || echo 0)"
    if (( mt > newest )); then
      newest=$mt
    fi
  done
  printf '%s' "$newest"
}

newest_under() {
  local dir newest=0 mt
  for dir in "$@"; do
    [[ -d "$dir" ]] || continue
    while IFS= read -r -d '' path; do
      mt="$(stat -c '%Y' "$path" 2>/dev/null || echo 0)"
      if (( mt > newest )); then
        newest=$mt
      fi
    done < <(find "$dir" -type f \
      ! -path '*/node_modules/*' \
      ! -path '*/dist/*' \
      ! -path '*/.git/*' \
      ! -name '*.map' \
      -print0 2>/dev/null)
  done
  printf '%s' "$newest"
}

need_ui=0
need_cef=0

if [[ "${SMOOVDECK_FORCE_REBUILD:-}" == "1" ]]; then
  need_ui=1
  need_cef=1
else
  if [[ ! -f "$UI_DIST" ]]; then
    need_ui=1
  else
    ui_src="$(newest_under "$UI_DIR/src")"
    ui_cfg="$(newest_mtime \
      "$UI_DIR/index.html" \
      "$UI_DIR/package.json" \
      "$UI_DIR/vite.config.ts" \
      "$UI_DIR/tsconfig.json")"
    ui_dist_mt="$(newest_mtime "$UI_DIST")"
    assets_mt="$(newest_under "$UI_DIR/dist/assets")"
    (( assets_mt > ui_dist_mt )) && ui_dist_mt=$assets_mt
    ui_in=$ui_src
    (( ui_cfg > ui_in )) && ui_in=$ui_cfg
    if (( ui_in > ui_dist_mt )); then
      need_ui=1
    fi
  fi

  if [[ ! -x "$APP" || ! -f "$DIR/libcef.so" ]]; then
    need_cef=1
  elif (( need_ui == 1 )); then
    need_cef=1
  else
    entry_mt="$(newest_mtime "$ROOT/main.ts" "$ROOT/deno.json" "$ROOT/deno.lock")"
    ui_out_mt="$(newest_mtime "$UI_DIST")"
    bundle_mt="$(newest_mtime "$APP" "$DIR/libcef.so")"
    in_mt=$entry_mt
    (( ui_out_mt > in_mt )) && in_mt=$ui_out_mt
    if (( in_mt > bundle_mt )); then
      need_cef=1
    fi
  fi
fi

if (( need_ui == 1 )); then
  log "UI sources newer than packages/ui/dist — building UI..."
  (
    cd "$UI_DIR"
    if [[ ! -d node_modules ]]; then
      npm ci
    fi
    npm run build
  )
fi

if (( need_cef == 1 )); then
  if [[ ! -f "$UI_DIST" ]]; then
    log "UI dist still missing after build"
    exit 1
  fi
  log "CEF bundle stale or missing — running deno desktop --backend cef..."
  (
    cd "$ROOT"
    if command -v deno >/dev/null 2>&1; then
      deno task desktop:build:cef
    else
      mise exec -- deno task desktop:build:cef
    fi
  )
else
  log "CEF bundle up to date"
fi

if [[ ! -x "$APP" || ! -f "$DIR/libcef.so" ]]; then
  log "CEF build missing after ensure ($DIR)"
  exit 1
fi

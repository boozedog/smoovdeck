#!/usr/bin/env bash
# NixOS entry: CEF (deno desktop) only. WebKit webview is not a target.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "${SMOOVDECK_BACKEND:-cef}" != "cef" ]]; then
  echo "smoovdeck: unknown SMOOVDECK_BACKEND=${SMOOVDECK_BACKEND} (use cef)" >&2
  exit 2
fi

bash "$ROOT/desktop/ensure-cef-build.sh"

FHS_OUT="$ROOT/desktop/.fhs-run"

if [[ ! -x "$FHS_OUT/bin/smoovdeck" ]]; then
  echo "smoovdeck: building FHS runtime (first run may take a minute)..." >&2
  nix-build "$ROOT/desktop/fhs.nix" -o "$FHS_OUT"
fi

exec "$FHS_OUT/bin/smoovdeck" "$ROOT/desktop/run-nix.sh" "$@"

#!/usr/bin/env bash
# NixOS launcher for deno desktop CEF builds.
#
# Flag policy (same working path as other CEF apps on this host):
#   Prefer Wayland ozone. Do NOT pass --no-sandbox or --disable-dev-shm-usage
#   by default — those correlated with a black client area.
# Escape hatches:
#   SMOOVDECK_CEF_NO_SANDBOX=1
#   SMOOVDECK_CEF_DISABLE_DEV_SHM=1
#   SMOOVDECK_CEF_X11=1
#   SMOOVDECK_SW_RENDER=1
#   SMOOVDECK_CEF_DEBUG=<port>
set -euo pipefail

if [[ -n "${SMOOVDECK_ROOT:-}" ]]; then
  ROOT="$SMOOVDECK_ROOT"
elif [[ -f "$(dirname "$0")/../deno.json" ]]; then
  ROOT="$(cd "$(dirname "$0")/.." && pwd)"
else
  ROOT="$(pwd)"
fi
DIR="$ROOT/dist/smoovdeck"
APP="$DIR/smoovdeck"

cef_backend() {
  [[ -f "$DIR/libcef.so" || -x "$DIR/laufey" ]]
}

if ! cef_backend || [[ ! -x "$APP" ]]; then
  echo "smoovdeck: missing CEF build in $DIR" >&2
  echo "Run: deno task desktop:linux" >&2
  exit 1
fi

# Bundled CEF GL/EGL must resolve before FHS Mesa.
export LD_LIBRARY_PATH="$DIR${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# Hyprland/SSH shells often have WAYLAND_DISPLAY but unset XDG_SESSION_TYPE.
if [[ -z "${OZONE_PLATFORM:-}" ]]; then
  if [[ "${SMOOVDECK_CEF_X11:-}" == "1" ]]; then
    GDK_BACKEND=x11
    OZONE_PLATFORM=x11
  else
    GDK_BACKEND="${XDG_SESSION_TYPE:-wayland}"
    OZONE_PLATFORM="${XDG_SESSION_TYPE:-wayland}"
    if [[ -z "${XDG_SESSION_TYPE:-}" && -n "${WAYLAND_DISPLAY:-}" ]]; then
      GDK_BACKEND=wayland
      OZONE_PLATFORM=wayland
    fi
  fi
fi
export GDK_BACKEND OZONE_PLATFORM
export NIXOS_OZONE_WL="${NIXOS_OZONE_WL:-1}"

CEF_FLAGS=()
if [[ "${SMOOVDECK_CEF_NO_SANDBOX:-}" == "1" ]]; then
  CEF_FLAGS+=(--no-sandbox)
fi
if [[ "${SMOOVDECK_CEF_DISABLE_DEV_SHM:-}" == "1" ]]; then
  CEF_FLAGS+=(--disable-dev-shm-usage)
fi
CEF_FLAGS+=(--ozone-platform="$OZONE_PLATFORM")
if [[ "$OZONE_PLATFORM" == "wayland" ]]; then
  CEF_FLAGS+=(--enable-wayland-ime=true)
  CEF_FLAGS+=(--wayland-text-input-version=3)
fi
if [[ "${SMOOVDECK_SW_RENDER:-}" == "1" ]]; then
  CEF_FLAGS+=(--disable-gpu --use-gl=swiftshader)
fi
if [[ -n "${SMOOVDECK_CEF_DEBUG:-}" ]]; then
  export LAUFEY_REMOTE_DEBUGGING_PORT="${SMOOVDECK_CEF_DEBUG}"
  CEF_FLAGS+=(--remote-debugging-port="${SMOOVDECK_CEF_DEBUG}")
fi

resolve_nixgl() {
  if [[ -n "${NIXGL_BIN:-}" && -x "$NIXGL_BIN" ]]; then
    echo "$NIXGL_BIN"
    return
  fi
  local candidate store_bin
  for candidate in nixGLDefault nixGL nixVulkanNvidia nixVulkanIntel; do
    if command -v "$candidate" >/dev/null 2>&1; then
      command -v "$candidate"
      return
    fi
  done
  for store_bin in /nix/store/*/bin/nixGL /nix/store/*/bin/nixGLDefault; do
    [[ -x "$store_bin" ]] || continue
    printf '%s' "$store_bin"
    return 0
  done
}

if [[ -x "$DIR/laufey" ]]; then
  LAUFEY_ARGS=(
    "$DIR/laufey"
    "${CEF_FLAGS[@]}"
    --runtime "$DIR/smoovdeck.so"
  )
else
  LAUFEY_ARGS=(
    "$APP"
    "${CEF_FLAGS[@]}"
  )
fi

echo "smoovdeck: CEF launch ozone=$OZONE_PLATFORM" >&2
echo "smoovdeck: flags=${CEF_FLAGS[*]:-(none)}" >&2

NIXGL="$(resolve_nixgl || true)"
if [[ -n "$NIXGL" ]]; then
  exec "$NIXGL" "${LAUFEY_ARGS[@]}" "$@"
fi

echo "smoovdeck: no nixGL in PATH — CEF may still work with bundled GL" >&2
exec "${LAUFEY_ARGS[@]}" "$@"

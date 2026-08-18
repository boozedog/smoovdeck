# smoovdeck desktop (Linux / NixOS)

**Shell:** `deno desktop --backend cef`. WebKit webview is not a target.

## Quick start (NixOS / Hyprland)

```bash
# From repo root — rebuilds UI/CEF when stale, then launches
deno task desktop:run:nix
```

| Knob | Meaning |
| --- | --- |
| (default) | Rebuild when sources newer than bundle |
| `SMOOVDECK_SKIP_REBUILD=1` | Launch only; error if bundle missing |
| `SMOOVDECK_FORCE_REBUILD=1` | Always rebuild UI + CEF |

Explicit full rebuild: `deno task desktop:linux`.

## What “green” looks like

- Window title **smoovdeck**
- Painted board (stage cards), not a black client area
- Logs show the UI dist path and a listening address
- Process stays up

## Architecture (CEF on NixOS)

| Piece | Role |
| --- | --- |
| `deno desktop --backend cef` | Produces `dist/smoovdeck/smoovdeck` + `libcef.so` |
| `desktop/fhs.nix` | `buildFHSEnv` so prebuilt CEF finds a normal `/lib` layout |
| `desktop/run-nix.sh` | Ozone/Wayland flags |
| `desktop/launch-nix.sh` | Host entry: ensure build, enter FHS, run CEF |

There is **no** sqlite `RTLD_DEEPBIND` shim. This app does not load Deno’s
`@db/sqlite` plug, so the CEF-vs-plug collision that other desktop apps hit
does not apply here. Do not copy that preload unless sqlite lands.

### Flag policy

Default:

```text
--ozone-platform=wayland
--enable-wayland-ime=true
--wayland-text-input-version=3
```

**Do not** pass by default:

```text
--no-sandbox
--disable-dev-shm-usage
```

Those correlated with black paint when `/dev/shm` is healthy.

## Environment knobs

| Var | Effect |
| --- | --- |
| `SMOOVDECK_CEF_X11=1` | Force X11 ozone |
| `SMOOVDECK_CEF_NO_SANDBOX=1` | Opt in `--no-sandbox` |
| `SMOOVDECK_CEF_DISABLE_DEV_SHM=1` | Opt in `--disable-dev-shm-usage` |
| `SMOOVDECK_SW_RENDER=1` | SwiftShader / no GPU |
| `SMOOVDECK_CEF_DEBUG=<port>` | Remote debugging port |

## Footguns

1. **Stale `desktop/.fhs-run`** — rebuild with
   `nix-build desktop/fhs.nix -o desktop/.fhs-run`
2. **Stale CEF bundle** — `desktop:run:nix` rebuilds when sources change.
   If you skipped rebuild, run `deno task desktop:ensure`.

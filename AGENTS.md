# smoovdeck

Desktop control deck for parallel coding workspaces and agent sessions.

This is a **new** implementation. Do not port the previous GPUI UI. Do not
treat any earlier prototype as source of truth for layout, chrome, or
interaction.

## Stack direction

- **UI:** Foldkit MVU + published foldstryx primitives
  (`@foldstryx/foldkit@0.3.2`, `@foldstryx/styles@0.2.2`, Foldkit `0.147`,
  Effect `4.0.0-rc.109`). Views take the frame builder: `view(config, h)`.
  No React as the public surface.
- **Chrome first.** foldstryx sidebar + inset header + workspace×stage board
  (`Table.*` matrix, interactive cells). Do not invent a card board.
- **Agents:** speak each tool's native protocol (ACP for Grok Build and
  Cursor Agent, Pi RPC for Pi). Do not scrape PTYs for agent control.
- **Terminals:** PTY only for real terminal sessions (shell, git TUI).
- **Host:** Deno Desktop with **CEF only** (`deno desktop --backend cef`).
  Do not add Electron, Tauri, or WebKit webview. On NixOS follow
  `desktop/README.md` (FHS + Wayland ozone). Do not add a sqlite
  `RTLD_DEEPBIND` shim unless this app starts loading `@db/sqlite`.

## Non-negotiables

1. **Blank-slate UI.** Invent the board and focused views in Foldkit. Do not
   recreate the GPUI screens.
2. **Zero foldstryx domain leak.** Product vocabulary stays in this repo.
   foldstryx primitives stay generic.
3. **Public GitHub.** Do not commit internal infrastructure: private forge
   URLs, hostnames, tailnets, fleet or service topology, private dependency
   names, or secrets. If internal tracking must be mentioned, use generic
   wording with no names or URLs.
4. **Effect-first** in TypeScript application code. No `async`/`await` /
   `new Promise` in library-shaped modules unless a written exception exists.
   Effect Lens is the gate: `nub run check:effect-lens` (unified, workspace
   `packages/ui`). Pre-commit installs the same check via `hk.pkl`. UI
   scripts use Nub (`nub run dev`, `nub test`, …); the Deno host uses
   `deno task` / `deno.json`.
5. **No commit or push** unless the user has approved the exact message
   (commit) or asked to push.

## Quality

Match foldstryx / Foldkit practice: typed `Model` / `Message` / `update` /
`view`, Story and Scene tests for interactive behavior, and a real browser
check for any UI that a user will see.

## Agent UI inspection (foldkit MCP + agent-browser)

Two tools on the **same browser tab** — state vs pixels. Do not add a composite
MCP until this workflow feels insufficient.

| Need | Tool |
| --- | --- |
| Model, message history, replay, dispatch | **`foldkit-devtools` MCP** (`foldkit_*` tools) |
| Screenshot, a11y snapshot, click, type | **`agent-browser` CLI** (global policy; not MCP) |

**Prerequisites:** `nub run dev` (relay on `127.0.0.1:9992`), app open in a tab.
Cursor loads MCP from `.cursor/mcp.json` → `.mcp.json`. Restart the agent after
MCP config changes.

**Same tab:** `foldkit_list_runtimes` lists every connected tab. With multiple
tabs, pass `runtime_id` on foldkit calls. Default is the most recently connected
runtime. Drive one tab with `agent-browser --session <name> open …` and target
that same tab on the relay (or use `agent-browser --auto-connect` to attach to
an existing Brave window).

**Typical loop:**

1. `agent-browser --session smoovdeck open http://127.0.0.1:5173/`
2. `foldkit_list_runtimes` — note `connectionId` if several runtimes
3. Pixels: `agent-browser screenshot`, `snapshot -i`, click/fill by `@ref`
4. State: `foldkit_get_model`, `foldkit_list_messages`, `foldkit_dispatch_message`
5. Foldkit dispatch updates the same DOM agent-browser sees; browser typing
   produces real `Message` entries foldkit can read.

First `agent-browser` use in a task: `agent-browser --help` or
`agent-browser skills get core --full` when skills are installed. Do not guess
flags. Do not wire `chrome-devtools-mcp` or `agent-browser mcp`.

**CI / regression:** Vitest browser mode + `toMatchScreenshot` is separate from
this live loop (not wired in this repo yet).

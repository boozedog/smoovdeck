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

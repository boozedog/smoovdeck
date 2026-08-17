# smoovdeck

Desktop control deck for parallel coding workspaces and agent sessions.

This is a **new** implementation. Do not port the previous GPUI UI. Do not
treat any earlier prototype as source of truth for layout, chrome, or
interaction.

## Stack direction

- **UI:** Foldkit MVU + [foldstryx](https://github.com/boozedog/foldstryx)
  named primitives. No React as the public surface.
- **Agents:** speak each tool's native protocol (ACP for Grok Build and
  Cursor Agent, Pi RPC for Pi). Do not scrape PTYs for agent control.
- **Terminals:** PTY only for real terminal sessions (shell, git TUI).
- **Host:** undecided. Do not add Electron, Tauri, or Deno Desktop scaffolding
  until that choice is written down here.

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
5. **No commit or push** unless the user has approved the exact message
   (commit) or asked to push.

## Quality

Match foldstryx / Foldkit practice: typed `Model` / `Message` / `update` /
`view`, Story and Scene tests for interactive behavior, and a real browser
check for any UI that a user will see.

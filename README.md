# smoovdeck

A desktop control deck for parallel coding workspaces and agent sessions.

Rows are local workspaces. Columns are stages of work. Each cell is a session
you can prompt, watch, approve, or stop — coding agents through their native
protocols, and a real terminal where you still need one.

The UI is a Foldkit app styled with
[foldstryx](https://github.com/boozedog/foldstryx). The host is
[Deno Desktop](https://docs.deno.com/go/desktop) with the **CEF** backend.

## Status

Early. The foldstryx sidebar, inset header, and workspace×stage board paint.
Agents are not wired yet.

## Develop

Requires [Deno](https://deno.com) (canary / 2.9+) for the host, Node 22+ and
[Nub](https://github.com/nubjs/nub) for the UI toolchain (Foldkit/Vite).
On NixOS, CEF runs inside the FHS env in `desktop/`.

```bash
# Install UI deps (once)
nub install

# Browser board (Vite + HMR)
nub run dev

# Deno host serving a production UI build
deno task build:ui
deno task dev

# NixOS CEF window
deno task desktop:run:nix
```

**Deno** ships the app (static server + Deno Desktop/CEF). **Nub** builds the
Foldkit UI in `packages/ui` — same split as using npm, but aligned with
foldstryx.

See [desktop/README.md](./desktop/README.md) for CEF flags and NixOS notes.

## License

MIT. See [LICENSE](./LICENSE).

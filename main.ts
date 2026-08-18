const DEFAULT_PORT = 8787;

function fileUrlPath(url: URL): string {
  return decodeURIComponent(url.pathname);
}

function joinRoot(root: string, ...parts: string[]): string {
  let result = root.endsWith("/") ? root.slice(0, -1) : root;
  for (const part of parts) {
    const trimmed = part.replace(/^\/+|\/+$/g, "");
    if (trimmed.length === 0) continue;
    result += `/${trimmed}`;
  }
  return result;
}

export function isDesktopMode(): boolean {
  return Deno.env.has("DENO_SERVE_ADDRESS");
}

export function resolveUiDistRoot(): string {
  const override = Deno.env.get("SMOOVDECK_UI_DIST");
  if (override) return override;
  return fileUrlPath(new URL("./packages/ui/dist/", import.meta.url));
}

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function contentType(pathname: string): string {
  const dot = pathname.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  return MIME[pathname.slice(dot)] ?? "application/octet-stream";
}

export function safeJoin(root: string, requestPath: string): string | null {
  const decoded = decodeURIComponent(requestPath);
  if (decoded.split("/").includes("..")) return null;
  const rootUrl = new URL(
    root.endsWith("/") ? root : `${root}/`,
    "file://",
  );
  const candidate = new URL(decoded.replace(/^\/+/, ""), rootUrl);
  if (
    candidate.pathname !== rootUrl.pathname &&
    !candidate.pathname.startsWith(rootUrl.pathname)
  ) {
    return null;
  }
  return fileUrlPath(candidate);
}

export function createHandler(
  uiRoot: string,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const cors = {
      "access-control-allow-origin": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health") {
      return Response.json({ ok: true, name: "smoovdeck" }, { headers: cors });
    }

    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = safeJoin(uiRoot, path);
    if (filePath === null) {
      return new Response("forbidden", { status: 403, headers: cors });
    }

    try {
      const file = await Deno.readFile(filePath);
      return new Response(file, {
        headers: {
          ...cors,
          "content-type": contentType(filePath),
        },
      });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }

    if (!path.includes(".")) {
      try {
        const index = await Deno.readFile(joinRoot(uiRoot, "index.html"));
        return new Response(index, {
          headers: {
            ...cors,
            "content-type": "text/html; charset=utf-8",
          },
        });
      } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) throw error;
      }
    }

    return new Response("not found", { status: 404, headers: cors });
  };
}

export function startServer(
  uiRoot: string = resolveUiDistRoot(),
): Deno.HttpServer {
  const handler = createHandler(uiRoot);
  if (isDesktopMode()) {
    return Deno.serve(handler);
  }
  const port = Number(Deno.env.get("PORT") ?? DEFAULT_PORT);
  const hostname = Deno.env.get("HOSTNAME") ?? "127.0.0.1";
  return Deno.serve({ hostname, port }, handler);
}

if (import.meta.main) {
  const uiRoot = resolveUiDistRoot();
  console.error(`[smoovdeck] ui dist: ${uiRoot}`);
  startServer(uiRoot);
}

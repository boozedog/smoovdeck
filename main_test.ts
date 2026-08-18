import { assertEquals } from "jsr:@std/assert@^1.0.19";

import { createHandler, isDesktopMode, safeJoin } from "./main.ts";

Deno.test("isDesktopMode is false without DENO_SERVE_ADDRESS", () => {
  assertEquals(isDesktopMode(), false);
});

Deno.test("health reports ok", async () => {
  const root = await Deno.makeTempDir();
  const handler = createHandler(root);
  const response = await handler(new Request("http://127.0.0.1/health"));
  assertEquals(response.status, 200);
  assertEquals(await response.json(), { ok: true, name: "smoovdeck" });
});

Deno.test("serves index.html at /", async () => {
  const root = await Deno.makeTempDir();
  await Deno.writeTextFile(
    `${root}/index.html`,
    "<!doctype html><title>smoovdeck</title>",
  );
  const handler = createHandler(root);
  const response = await handler(new Request("http://127.0.0.1/"));
  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type"),
    "text/html; charset=utf-8",
  );
  assertEquals((await response.text()).includes("smoovdeck"), true);
});

Deno.test("rejects path traversal", () => {
  assertEquals(safeJoin("/tmp/smoovdeck-ui", "/../../etc/passwd"), null);
});

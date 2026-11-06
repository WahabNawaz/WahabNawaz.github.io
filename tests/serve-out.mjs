// Tiny static server for the exported site in /out (what GitHub Pages serves),
// used by the Playwright tests. No dependencies.
// Usage: node tests/serve-out.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../out/", import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

async function file(path) {
  try {
    const s = await stat(path);
    if (s.isDirectory()) return file(join(path, "index.html"));
    return { body: await readFile(path), type: TYPES[extname(path)] || "application/octet-stream" };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, "");
  let hit = (await file(join(ROOT, safe))) || (await file(join(ROOT, safe + ".html")));
  // Next's route payloads are named like "work/__next.work.__PAGE__.txt". A build made
  // on Windows writes them as folders instead ("work/__next.work/__PAGE__.txt"); builds
  // on Linux (the GitHub Actions deploy) do not. Look there too, for local tests.
  const m = !hit && safe.match(/^(.*[\\/])__next\.(.+)\.txt$/);
  if (m) hit = await file(join(ROOT, m[1], "__next." + m[2].split(".").join("/") + ".txt"));
  if (hit) {
    res.writeHead(200, { "content-type": hit.type });
    res.end(hit.body);
    return;
  }
  const nf = await file(join(ROOT, "404.html"));
  res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
  res.end(nf ? nf.body : "Not found");
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));

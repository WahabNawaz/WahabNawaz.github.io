// Static server for the project folder, used to render the illustrations and to
// try out 3D assets in a plain three.js page. Usage: node tools/render/serve.mjs [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const PORT = Number(process.argv[2] || 4300);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  const path = join(ROOT, normalize(url).replace(/^(\.\.[/\\])+/, ""));
  try {
    const s = await stat(path);
    const p = s.isDirectory() ? join(path, "index.html") : path;
    res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" });
    res.end(await readFile(p));
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));

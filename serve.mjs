import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.PORT || 4177);
const ROOT = path.resolve("sites/nepc_static_clone/dist");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const joined = path.join(ROOT, decoded);
  const normalized = path.normalize(joined);
  if (!normalized.startsWith(ROOT)) return null;
  return normalized;
}

async function findFile(urlPath) {
  const requested = safePath(urlPath);
  if (!requested) return null;

  try {
    const stat = await fs.stat(requested);
    if (stat.isFile()) return requested;
    if (stat.isDirectory()) return path.join(requested, "index.html");
  } catch {
    if (!path.extname(requested)) return path.join(requested, "index.html");
  }

  return null;
}

http
  .createServer(async (req, res) => {
    const file = await findFile(req.url || "/");
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    try {
      const body = await fs.readFile(file);
      res.writeHead(200, { "content-type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  })
  .listen(PORT, () => {
    console.log(`NEPC static clone: http://localhost:${PORT}`);
  });

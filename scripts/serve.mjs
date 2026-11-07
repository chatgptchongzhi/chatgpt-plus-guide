import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".png": "image/png" };

createServer((request, response) => {
  const pathname = decodeURIComponent((request.url || "/").split("?")[0]).replace(/^\/chatgpt-plus-guide/, "") || "/";
  let file = normalize(join(root, pathname));
  if (!file.startsWith(root)) file = join(root, "404.html");
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    response.statusCode = 404;
    file = join(root, "404.html");
  }
  response.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
  createReadStream(file).pipe(response);
}).listen(4173, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173/chatgpt-plus-guide/"));

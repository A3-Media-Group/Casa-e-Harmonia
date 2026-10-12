// Servidor local de desenvolvimento (não é usado na hospedagem).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist");
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
http
  .createServer((req, res) => {
    let url = decodeURIComponent(req.url.split("?")[0]);
    if (url.endsWith("/")) url += "index.html";
    let p = path.resolve(root, "." + url);
    if (!p.startsWith(root + path.sep)) return res.writeHead(403).end();
    // Imita o DirectorySlash do Apache: /ferramentas -> /ferramentas/
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return res.writeHead(301, { Location: url + "/" }).end();
    fs.readFile(p, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": tipos[".html"] });
        return res.end(fs.existsSync(root + "/404.html") ? fs.readFileSync(root + "/404.html") : "Página não encontrada");
      }
      res.setHeader("Content-Type", tipos[path.extname(p)] || "application/octet-stream");
      res.end(data);
    });
  })
  .listen(5173, "127.0.0.1", () => console.log("http://127.0.0.1:5173"));

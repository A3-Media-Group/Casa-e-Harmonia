// Auditoria de SEO on-page sobre o site gerado em dist/.
// Uso: npm run build && npm run audit
import fs from "node:fs";
import path from "node:path";

const root = "dist";
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(root).filter((f) => f.endsWith(".html"));
const urlOf = (f) => "/" + path.relative(root, f).split(path.sep).join("/").replace(/(^|\/)index\.html$/, "$1");
const norm = (href) => {
  let u = href.split("#")[0].split("?")[0];
  if (u.endsWith("/index.html")) u = u.slice(0, -10);
  return u || "/";
};
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<");
const pages = new Map();
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const title = decode(html.match(/<title>(.*?)<\/title>/)?.[1] || "");
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "");
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || "";
  const article = html.match(/<article>[\s\S]*?<\/article>/)?.[0] || main;
  const words = article.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
  const out = new Set(
    [...main.matchAll(/href="(\/[^"]*)"/g)].map((m) => norm(m[1])).filter((u) => !/\.(css|js|png|webp|svg|ico|xml|txt)$/.test(u)),
  );
  pages.set(urlOf(f), { title, desc, words, out, inbound: new Set(), noindex });
}
for (const [url, p] of pages) for (const t of p.out) if (t !== url && pages.has(t)) pages.get(t).inbound.add(url);
const rows = [...pages].filter(([, p]) => !p.noindex).sort(([a], [b]) => a.localeCompare(b));
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("URL", 52), pad("title", 6), pad("desc", 5), pad("…", 2), pad("palavras", 9), pad("entrada", 8), "saída");
let orfas = 0, cortadas = 0, titulosLongos = 0;
for (const [url, p] of rows) {
  const cut = p.desc.endsWith("…") || p.title.endsWith("…");
  if (cut) cortadas++;
  if (p.title.length > 60) titulosLongos++;
  const fromContent = [...p.inbound].filter((u) => u !== "/").length;
  if (url.startsWith("/artigos/") && fromContent < 2) orfas++;
  console.log(pad(url, 52), pad(p.title.length, 6), pad(p.desc.length, 5), pad(cut ? "✗" : "", 2), pad(p.words, 9), pad(p.inbound.size, 8), p.out.size);
}
const guias = rows.filter(([u]) => u.startsWith("/artigos/"));
console.log("\nResumo");
console.log("Páginas indexáveis:", rows.length);
console.log("Guias:", guias.length, "· média de palavras no <article>:", Math.round(guias.reduce((s, [, p]) => s + p.words, 0) / (guias.length || 1)));
console.log("Titles/descriptions cortados com …:", cortadas);
console.log("Titles com mais de 60 caracteres:", titulosLongos);
console.log("Guias com menos de 2 links de entrada vindos de outros guias/hubs/ferramentas:", orfas);
console.log("Links para /index.html em páginas:", files.reduce((s, f) => s + (fs.readFileSync(f, "utf8").match(/href="[^"]*index\.html/g) || []).length, 0));

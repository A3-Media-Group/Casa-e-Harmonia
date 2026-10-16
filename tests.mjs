import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

// Carrega a base e todas as ferramentas sem DOM: só as funções puras ficam disponíveis.
const context = vm.createContext({ Number, Error, Math, String, Array, Object, JSON, URLSearchParams });
vm.runInContext(fs.readFileSync("scripts.js", "utf8"), context);
for (const f of fs.readdirSync("js/ferramentas")) vm.runInContext(fs.readFileSync(`js/ferramentas/${f}`, "utf8"), context);
const CH = context.CH;
const fn = (slug) => CH.ferramentas[slug].fn;

test("número aceita vírgula, ponto e milhar; vazio é inválido", () => {
  assert.equal(CH.num("2,5"), 2.5);
  assert.equal(CH.num("2.5"), 2.5);
  assert.equal(CH.num("1.234,5"), 1234.5);
  assert.equal(CH.num(" 0,53 "), 0.53);
  assert.ok(Number.isNaN(CH.num("")));
  assert.ok(Number.isNaN(CH.num("abc")));
  assert.ok(Number.isNaN(CH.num("2,5,1")));
});
test("tinta por demão e rendimento acabado não duplicam aplicações", () => {
  const { paint } = fn("calculadora-de-tinta");
  assert.equal(paint([[4, 2.5]], 2, 2, 8, 10).liters, 2.2);
  assert.equal(paint([[4, 2.5]], 2, 1, 4, 10).liters, 2.2);
  assert.throws(() => paint([[4, 2]], 9, 2, 10, 10));
  assert.throws(() => paint([[4, NaN]], 0, 2, 10, 10), /altura/);
  assert.throws(() => paint([[4, 2.5]], 0, 0, 10, 10), /demãos/);
});
test("exemplo da página de tinta confere com a calculadora", () => {
  const { paint, cans } = fn("calculadora-de-tinta");
  const r = paint([[4, 2.7], [4, 2.7], [3, 2.7], [3, 2.7]], 3.6, 2, 8, 10);
  assert.equal(r.liters, 9.41);
  const c = cans(r.liters);
  assert.deepEqual([c.lata, c.galao, c.quarto, c.total], [0, 2, 3, 9.9]);
});
test("sugestão de embalagens cobre a quantidade com a menor sobra", () => {
  const { cans } = fn("calculadora-de-tinta");
  assert.equal(cans(2.2).total, 2.7);
  assert.equal(cans(3.6).galao, 1);
  const big = cans(20);
  assert.ok(big.total >= 20 && big.total <= 20.7);
});
test("piso arredonda caixas sem erro de ponto flutuante", () => {
  const { floor, floorExtras } = fn("calculadora-de-piso-e-revestimento");
  assert.equal(floor(4, 5, 10, 2.2).boxes, 10);
  assert.equal(floor(4, 5, 11, 2.2).boxes, 11);
  assert.throws(() => floor(4, 5, 10, 0));
  const x = floorExtras(4, 5, 0.8);
  assert.equal(x.baseboard, 19);
  assert.equal(x.mortarBags, 4);
  assert.equal(floorExtras(4, 5, 0.8, 8).mortarBags, 8);
});
test("BTU segue a regra prática e escolhe o modelo comercial", () => {
  const { btu } = fn("calculadora-de-btu");
  const r = btu(12, 2, 1, "manha");
  assert.equal(r.needed, 8400);
  assert.equal(r.model, 9000);
  assert.equal(btu(12, 1, 0, "tarde").needed, 9600);
  assert.equal(btu(200, 1, 0, "tarde").model, null);
  assert.throws(() => btu(0, 1, 0, "manha"));
  assert.throws(() => btu(12, 1.5, 0, "manha"), /inteiro/);
});
test("consumo de energia em kWh e custo com bandeira", () => {
  const { energy } = fn("calculadora-de-consumo-de-energia");
  const chuveiro = [{ name: "Chuveiro", qty: 1, watts: 5500, hours: 0.5, days: 30 }];
  const r = energy(chuveiro, 1, 0.1);
  assert.equal(r.kwh, 82.5);
  assert.equal(Math.round(r.cost * 100) / 100, 90.75);
  assert.equal(Math.round(energy(chuveiro, 0.85).cost * 100) / 100, 70.13);
  assert.throws(() => energy([{ name: "X", qty: 1, watts: 100, hours: 25, days: 30 }], 1));
  assert.throws(() => energy([], 1));
});
test("papel de parede com rapport", () => {
  const { wallpaper } = fn("calculadora-de-papel-de-parede");
  const r = wallpaper(3.5, 2.6, 0, 0.53, 10, 0);
  assert.deepEqual([r.strips, r.perRoll, r.rolls], [7, 3, 3]);
  assert.equal(wallpaper(3.5, 2.6, 0, 0.53, 10, 64).rolls, 4);
  assert.throws(() => wallpaper(3, 12, 0, 0.53, 10, 0));
});
test("churrasco por convidado", () => {
  const { barbecue } = fn("calculadora-de-churrasco");
  const r = barbecue(6, 6, 2, 8, 4);
  assert.equal(Math.round(r.meat * 100) / 100, 4.5);
  assert.equal(r.charcoal, 5);
  assert.throws(() => barbecue(1, 1, 0, 5, 4));
  assert.throws(() => barbecue(0, 0, 0, 0, 4));
});
test("orçamento de reforma, cronograma e paletas", () => {
  const { budget } = fn("simulador-de-orcamento-de-reforma");
  assert.equal(budget(30, 35, 15).total, 1207.5);
  assert.throws(() => budget(2.5, 180, 10, true), /inteiro/);
  const { tarefas } = fn("cronograma-de-limpeza");
  assert.equal(tarefas({ tamanho: "pequena", minutos: "15", pets: true }).length, 19);
  assert.equal(fn("paletas-de-cores").paleta("japandi").cores.length, 3);
});

test("ferramentas novas: exemplos publicados conferem", () => {
  const t = fn("calculadora-de-tijolos-e-blocos").blocos(4, 2.8, 1.68, 29, 19, 14, 1, 5);
  assert.equal(t.total, 167);
  assert.equal(Math.round(t.argamassaL), 109);
  assert.throws(() => fn("calculadora-de-tijolos-e-blocos").blocos(4, 2.8, 20, 29, 19, 14, 1, 5));
  const r = fn("calculadora-de-rejunte").rejunte(60, 60, 9, 2, 20, 10, 1.6);
  assert.equal(Math.round(r.kgM2 * 1000) / 1000, 0.096);
  assert.equal(Math.round(r.total * 100) / 100, 2.11);
  assert.equal(r.emb5, 1);
  assert.equal(Math.round(fn("calculadora-de-rejunte").rejunte(30, 30, 8, 2, 1, 0, 1.5).kgM2 * 100) / 100, 0.16);
  assert.equal(fn("calculadora-de-argamassa").argamassa(20, 8, 20, 5).sacos, 9);
  const c = fn("calculadora-de-cortina").cortina(2, 20, 2.6, 1, 2, 2.8, 20);
  assert.deepEqual([c.trilho, c.franzida, c.corte, c.deitado, c.metros], [2.4, 4.8, 2.79, true, 4.8]);
  assert.equal(fn("calculadora-de-cortina").cortina(2, 20, 2.6, 1, 2, 1.4, 20).faixas, 4);
  assert.equal(fn("calculadora-de-iluminacao").iluminacao(150, 15, 806, 0.7).lampadas, 4);
  assert.throws(() => fn("calculadora-de-iluminacao").iluminacao(150, 15, 806, 0));
  const ch = fn("quanto-gasta-o-chuveiro-eletrico").chuveiro(5500, 10, 3, 30, 0.85);
  assert.equal(ch.kwh, 82.5);
  assert.equal(ch.kwhMenos2, 66);
  const ar = fn("consumo-mensal-do-ar-condicionado").ar;
  assert.equal(ar("potencia", 800, 0, 8, 30, 0.85).kwh, 192);
  assert.equal(Math.round(ar("etiqueta", 0, 600, 8, 30, 0.85).kwh * 10) / 10, 69.2);
  const tp = fn("tamanho-ideal-de-tapete").tapete;
  assert.deepEqual([...tp("sala", 2.1, 1.9, 20).comum], [2, 2.5]);
  assert.equal(tp("quarto", 1.38, 1.88, 50).largura, 2.38);
  const q = fn("altura-de-quadros").quadro;
  assert.equal(q("livre", 150, 60, 5).prego, 175);
  assert.equal(q("movel", 150, 60, 5, 85, 20).prego, 160);
  const d = fn("checklist-de-mudanca").datas("2026-11-15");
  assert.deepEqual(Array.from(d.slice(0, 3), (x) => x[1]), ["18/10/2026", "01/11/2026", "08/11/2026"]);
  assert.throws(() => fn("checklist-de-mudanca").datas(""));
  const cv = fn("conversor-de-medidas").converter;
  assert.equal(Math.round(cv("comprimento", 55, "pol").cm * 10) / 10, 139.7);
  assert.equal(Math.round(cv("area", 120, "pe2").m2 * 100) / 100, 11.15);
  assert.throws(() => cv("area", 1, "pol"));
});

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk("dist").filter((f) => f.endsWith(".html"));

test("páginas, assets, links internos e JSON-LD válidos", () => {
  for (const f of files) {
    if (f === path.join("dist", "ferramentas.html")) continue; // redirecionamento legado
    const html = fs.readFileSync(f, "utf8");
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, f);
    assert.match(html, /<main id="conteudo"/);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g))
      assert.ok(fs.existsSync("dist" + m[1] + (m[1].endsWith("/") ? "index.html" : "")), f + " → " + m[1]);
    for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)) JSON.parse(m[1]);
    for (const m of html.matchAll(/<img [^>]*>/g)) assert.match(m[0], /alt="[^"]+"/, f);
  }
  for (const slug of Object.keys(CH.ferramentas)) {
    const html = fs.readFileSync(`dist/ferramentas/${slug}/index.html`, "utf8");
    assert.match(html, new RegExp(`data-tool="${slug}"`));
    assert.match(html, /aria-live="polite"/);
  }
});

test("cada guia tem foto própria, sem repetição", () => {
  const capas = new Map();
  for (const f of files.filter((f) => /dist\/artigos\//.test(f))) {
    const html = fs.readFileSync(f, "utf8");
    const src = html.match(/<img class="cover" src="([^"]+)"/)?.[1];
    assert.ok(src, "sem imagem de capa: " + f);
    assert.ok(!capas.has(src), `imagem repetida em ${f} e ${capas.get(src)}`);
    capas.set(src, f);
  }
  assert.equal(capas.size, 31);
});

test("o site não tem referências a receitas", () => {
  for (const f of files) assert.doesNotMatch(fs.readFileSync(f, "utf8"), /\/receitas|"Recipe"|Receitas/, f);
});

/* ------------------------------- SEO (Fase 8) ------------------------------- */
const ORIGEM = "https://casaeharmonia.com.br";
const urlDe = (f) => "/" + path.relative("dist", f).split(path.sep).join("/").replace(/(^|\/)index\.html$/, "$1");
const ler = (f) => fs.readFileSync(f, "utf8");
const indexaveis = files.filter((f) => !/<meta name="robots" content="noindex/.test(ler(f)));
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<");
const N = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

test("title ≤ 60 e description 120–155, sem reticências e únicos", () => {
  const titulos = new Map(), descs = new Map();
  for (const f of indexaveis) {
    const html = ler(f);
    const t = decode(html.match(/<title>(.*?)<\/title>/)[1]);
    const d = decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
    assert.ok(t.length <= 60 && !t.endsWith("…"), `${f}: title (${t.length}) ${t}`);
    assert.ok(d.length >= 120 && d.length <= 155 && !d.endsWith("…"), `${f}: description (${d.length})`);
    assert.ok(!titulos.has(t), `title repetido em ${f} e ${titulos.get(t)}`);
    assert.ok(!descs.has(d), `description repetida em ${f} e ${descs.get(d)}`);
    titulos.set(t, f);
    descs.set(d, f);
  }
});

test("canonical absoluta, og:image local com 1200 px e zero links para /index.html", () => {
  for (const f of indexaveis) {
    const html = ler(f);
    const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canon && canon.startsWith(ORIGEM + "/"), `${f}: canonical ${canon}`);
    assert.equal(canon, ORIGEM + urlDe(f), `${f}: canonical não corresponde à URL`);
    assert.doesNotMatch(html, /href="[^"]*index\.html/, f);
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)[1];
    assert.ok(og.startsWith(ORIGEM + "/assets/og/"), `${f}: og:image ${og}`);
    assert.doesNotMatch(og, /logo/);
    const buf = fs.readFileSync("dist" + og.slice(ORIGEM.length));
    // Largura de um JPEG: marcador SOF (0xFFC0–0xFFC2).
    let i = 2, largura = 0;
    while (i < buf.length) {
      const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xc2) {
        largura = buf.readUInt16BE(i + 7);
        break;
      }
      i += 2 + len;
    }
    assert.ok(largura >= 1200, `${f}: og:image com ${largura}px`);
  }
});

test("sitemap e páginas indexáveis coincidem, sem priority", () => {
  const xml = fs.readFileSync("dist/sitemap.xml", "utf8");
  assert.doesNotMatch(xml, /<priority>/);
  const noSitemap = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(ORIGEM.length)));
  for (const u of noSitemap) assert.ok(fs.existsSync("dist" + u + (u.endsWith("/") ? "index.html" : "")), "sitemap → inexistente: " + u);
  for (const f of indexaveis) assert.ok(noSitemap.has(urlDe(f)), "fora do sitemap: " + urlDe(f));
  assert.equal(noSitemap.size, indexaveis.length);
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) assert.match(m[1], /^\d{4}-\d{2}-\d{2}$/);
});

test("nenhuma URL antiga foi removida", () => {
  const antigas = ["index.html", "sobre.html", "dicas.html", "ferramentas.html", "404.html", ...["japandi", "biofilia", "iluminacao-led", "plantas-para-sala", "cozinha-funcional", "casa-inteligente", "cores-terrosas", "organizacao-5s", "sofa-perfeito", "varanda-pequena", "cores-sala-pequena", "como-calcular-tinta", "rotina-limpeza", "como-tirar-mofo-da-parede", "como-limpar-sofa", "como-desentupir-pia", "economizar-conta-de-luz", "decorar-quarto-pequeno", "organizar-guarda-roupa", "horta-em-apartamento", "tirar-manchas-de-roupa", "quantos-btus-ar-condicionado", "organizar-geladeira"].map((s) => `artigos/${s}.html`)];
  for (const a of antigas) assert.ok(fs.existsSync("dist/" + a) && fs.existsSync(a), "URL removida: " + a);
  assert.match(fs.readFileSync("dist/.htaccess", "utf8"), /RewriteRule \^ferramentas\\\.html\$ \/ferramentas\/ \[R=301/);
  assert.match(ler("dist/ferramentas.html"), /noindex/);
});

test("todo guia recebe ao menos 2 links de outros guias e tem links contextuais", () => {
  const guias = files.filter((f) => f.includes(`${path.sep}artigos${path.sep}`));
  const entrada = new Map(guias.map((g) => [urlDe(g), new Set()]));
  for (const g of guias) {
    const art = ler(g).match(/<article>[\s\S]*?<\/article>/)[0];
    for (const m of art.matchAll(/href="(\/artigos\/[^"#]+)"/g)) if (m[1] !== urlDe(g)) entrada.get(m[1])?.add(urlDe(g));
    const secoes = art.split(/<p class="related-title">/)[0];
    const contextuais = new Set([...secoes.matchAll(/<section id="sec\d+">[\s\S]*?<\/section>/g)].flatMap((s) => [...s[0].matchAll(/href="\/artigos\/([^"]+)"/g)].map((m) => m[1])));
    assert.ok(contextuais.size >= 2, `${g}: ${contextuais.size} link(s) contextual(is)`);
  }
  for (const [u, de] of entrada) assert.ok(de.size >= 2, `${u}: só ${de.size} link(s) de outros guias`);
});

test("palavra-chave nas primeiras 100 palavras e em pelo menos 2 H2", async () => {
  const { guiasOriginais } = await import("./data/guias-originais.mjs");
  const { artigosNovos } = await import("./data/artigos.mjs");
  const { guiasDicas } = await import("./data/guias-dicas.mjs");
  for (const a of [...guiasOriginais, ...artigosNovos, ...guiasDicas]) {
    const main = ler(`dist/artigos/${a.slug}.html`).match(/<main[\s\S]*<\/main>/)[0];
    const depoisH1 = main.slice(main.indexOf("</h1>")).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).slice(0, 100).join(" ");
    assert.ok(N(depoisH1).includes(N(a.kw)), `${a.slug}: "${a.kw}" fora das 100 primeiras palavras`);
    const h2 = [...main.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].filter((m) => N(m[1]).includes(N(a.kw))).length;
    assert.ok(h2 >= 2, `${a.slug}: "${a.kw}" em ${h2} H2`);
  }
});

test("hubs e páginas de ferramenta completas", () => {
  for (const f of files.filter((f) => f.includes(`${path.sep}guias${path.sep}`))) {
    const html = ler(f);
    assert.match(html, /"@type":"BreadcrumbList"/, f);
    assert.match(html, /class="hub-list"/, f);
  }
  for (const slug of Object.keys(CH.ferramentas)) {
    const html = ler(`dist/ferramentas/${slug}/index.html`);
    for (const trecho of ["Como calculamos", "Exemplo resolvido", "Perguntas frequentes", "Guias relacionados", "Fontes", '"@type":"WebApplication"'])
      assert.ok(html.includes(trecho), `${slug}: falta ${trecho}`);
    assert.doesNotMatch(html, /aggregateRating|"review"/, slug);
  }
  assert.equal(Object.keys(CH.ferramentas).length, 20);
});

test("dados estruturados: BreadcrumbList nas internas, Article nos guias, WebSite/Organization na home, robots coerente", () => {
  const tipos = (html) =>
    [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap((m) => {
      const d = JSON.parse(m[1]);
      return (d["@graph"] || [d]).map((i) => i["@type"]);
    });
  for (const f of indexaveis) {
    const t = tipos(ler(f));
    if (urlDe(f) === "/") assert.deepEqual(t.sort(), ["Organization", "WebSite"], f);
    else assert.ok(t.includes("BreadcrumbList"), `${f}: sem BreadcrumbList`);
    if (/dist\/artigos\//.test(f)) assert.ok(t.includes("Article"), `${f}: sem Article`);
    assert.doesNotMatch(ler(f), /noindex|aggregateRating|"review"/, f);
  }
  assert.match(fs.readFileSync("dist/robots.txt", "utf8"), new RegExp(`^Sitemap: ${ORIGEM}/sitemap\\.xml$`, "m"));
  assert.ok(fs.existsSync("dist/sitemap.xml") && !fs.existsSync("dist/sitemap-index.xml"));
});

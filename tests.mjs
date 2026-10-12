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

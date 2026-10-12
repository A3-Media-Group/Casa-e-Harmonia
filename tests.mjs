import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
const context = vm.createContext({
  document: { getElementById: () => null },
  Number,
  Error,
  Math,
});
vm.runInContext(fs.readFileSync("scripts.js", "utf8"), context);
const run = (code) => vm.runInContext(code, context);

test("tinta por demão e rendimento acabado não duplicam aplicações", () => {
  assert.equal(run("paint([[4,2.5]],2,2,8,10).liters"), 2.2);
  assert.equal(run("paint([[4,2.5]],2,1,4,10).liters"), 2.2);
  assert.throws(() => run("paint([[4,2]],9,2,10,10)"));
});
test("sugestão de embalagens cobre a quantidade com a menor sobra", () => {
  const c = run("cans(2.2)");
  assert.equal(c.total, 2.7); // 3 quartos de 0,9 L
  assert.equal(run("cans(3.6).galao"), 1);
  const big = run("cans(20)");
  assert.ok(big.total >= 20 && big.total <= 20.7);
});
test("piso arredonda caixas sem erro de ponto flutuante", () => {
  assert.equal(run("floor(4,5,10,2.2).boxes"), 10);
  assert.equal(run("floor(4,5,11,2.2).boxes"), 11);
  assert.throws(() => run("floor(4,5,10,0)"));
  const x = run("floorExtras(4,5,0.8)");
  assert.equal(x.baseboard, 19); // (18 - 0,8) × 1,1 = 18,92
  assert.equal(x.mortarBags, 5); // 20 m² × 5 kg ÷ 20 kg
});
test("BTU segue a regra prática e escolhe o modelo comercial", () => {
  const r = run('btu(12,2,1,"manha")');
  assert.equal(r.needed, 8400);
  assert.equal(r.model, 9000);
  assert.equal(run('btu(12,1,0,"tarde")').needed, 9600);
  assert.equal(run('btu(200,1,0,"tarde")').model, null);
  assert.throws(() => run('btu(0,1,0,"manha")'));
});
test("consumo de energia em kWh e custo com bandeira", () => {
  const r = run('energy([{name:"Chuveiro",qty:1,watts:5500,hours:0.5,days:30}],1,0.1)');
  assert.equal(r.kwh, 82.5);
  assert.equal(Math.round(r.cost * 100) / 100, 90.75);
  assert.throws(() => run('energy([{name:"X",qty:1,watts:100,hours:25,days:30}],1)'));
});
test("papel de parede com rapport", () => {
  const r = run("wallpaper(3.5,2.6,0,0.53,10,0)");
  assert.equal(r.strips, 7);
  assert.equal(r.perRoll, 3);
  assert.equal(r.rolls, 3);
  assert.equal(run("wallpaper(3.5,2.6,0,0.53,10,64)").rolls, 4);
  assert.throws(() => run("wallpaper(3,12,0,0.53,10,0)"));
});
test("churrasco por convidado", () => {
  const r = run("barbecue(6,6,2,8,4)");
  assert.equal(Math.round(r.meat * 100) / 100, 4.5);
  assert.equal(r.charcoal, 5);
  assert.throws(() => run("barbecue(1,1,0,5,4)"));
});
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk("dist").filter((f) => f.endsWith(".html"));

test("páginas, assets, links internos e JSON-LD válidos", () => {
  assert.equal(files.length, 28);
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, f);
    assert.match(html, /<main id="conteudo"/);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g))
      assert.ok(fs.existsSync("dist" + m[1]), f + " → " + m[1]);
    for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))
      JSON.parse(m[1]);
    for (const m of html.matchAll(/<img [^>]*>/g)) assert.match(m[0], /alt="[^"]+"/, f);
  }
  const tools = fs.readFileSync("dist/ferramentas.html", "utf8");
  for (const id of ["floor-form", "btu-form", "energy-form", "bbq-form", "wallpaper-form"])
    assert.match(tools, new RegExp(`id="${id}"`));
  assert.match(fs.readFileSync("dist/index.html", "utf8"), /cores-sala-pequena/);
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
  assert.equal(capas.size, 23);
});
test("o site não tem mais referências a receitas", () => {
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(html, /\/receitas|"Recipe"|Receitas/, f);
  }
  assert.ok(!fs.existsSync("dist/receitas.html"));
});

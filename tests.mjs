import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
const context = vm.createContext({
  document: { getElementById: () => null },
  Number,
  Error,
});
vm.runInContext(fs.readFileSync("scripts.js", "utf8"), context);
test("tinta por demão e rendimento acabado não duplicam aplicações", () => {
  assert.equal(
    vm.runInContext("paint([[4,2.5]],2,2,8,10).liters", context),
    2.2,
  );
  assert.equal(
    vm.runInContext("paint([[4,2.5]],2,1,4,10).liters", context),
    2.2,
  );
  assert.throws(() => vm.runInContext("paint([[4,2]],9,2,10,10)", context));
});
test("piso arredonda caixas sem erro de ponto flutuante", () => {
  assert.equal(vm.runInContext("floor(4,5,10,2.2).boxes", context), 10);
  assert.equal(vm.runInContext("floor(4,5,11,2.2).boxes", context), 11);
  assert.throws(() => vm.runInContext("floor(4,5,10,0)", context));
});
test("páginas, assets, links internos e JSON-LD válidos", () => {
  const walk = (d) =>
    fs
      .readdirSync(d, { withFileTypes: true })
      .flatMap((e) =>
        e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
      );
  const files = walk("dist").filter((f) => f.endsWith(".html"));
  assert.equal(files.length, 17);
  for (const f of files) {
    const html = fs.readFileSync(f, "utf8");
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, f);
    assert.match(html, /<main id="conteudo"/);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g))
      assert.ok(fs.existsSync("dist" + m[1]), f + " → " + m[1]);
    for (const m of html.matchAll(
      /<script type="application\/ld\+json">(.*?)<\/script>/g,
    ))
      JSON.parse(m[1]);
  }
  assert.match(
    fs.readFileSync("dist/ferramentas.html", "utf8"),
    /id="floor-form"/,
  );
  assert.match(
    fs.readFileSync("dist/index.html", "utf8"),
    /cores-sala-pequena/,
  );
});

// Baixa as fotos do Pexels registradas em data/imagens.mjs para assets/ (sem dependências).
// Uso, em uma máquina com internet:  npm run fotos && npm run build
//
// Para cada foto gera:
// - assets/fotos/{chave}-600.webp e -1200.webp (16:9, recorte central), usadas no srcset;
// - assets/og/{guia}.jpg (1200 × 675) para Open Graph/Discover, substituindo o cartão tipográfico.
// O crédito e o link da licença Pexels continuam vindo de data/imagens.mjs.
// Arquivos existentes não são baixados de novo, exceto com --todos.
import fs from "node:fs";
import { imagens } from "../data/imagens.mjs";

const todos = process.argv.includes("--todos");
const ogDe = { hero: "home", dicasCapa: "dicas" };
const pexels = Object.entries(imagens).filter(([, p]) => p.src.includes("images.pexels.com"));
fs.mkdirSync("assets/fotos", { recursive: true });
fs.mkdirSync("assets/og", { recursive: true });

async function baixar(url, destinoSemExt, aceitarWebp) {
  const res = await fetch(url, {
    headers: { Accept: aceitarWebp ? "image/webp,image/*" : "image/jpeg,image/*", "User-Agent": "casa-e-harmonia-build" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw Error(`${res.status} em ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const webp = buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP";
  const destino = `${destinoSemExt}.${webp ? "webp" : "jpg"}`;
  fs.writeFileSync(destino, buf);
  return destino;
}

let ok = 0;
for (const [chave, p] of pexels) {
  const id = p.src.match(/photos\/(\d+)\//)[1];
  const base = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;
  try {
    for (const [w, h] of [
      [600, 338],
      [1200, 675],
    ]) {
      const alvo = `assets/fotos/${chave}-${w}`;
      if (!todos && (fs.existsSync(alvo + ".webp") || fs.existsSync(alvo + ".jpg"))) continue;
      await baixar(`${base}?auto=compress,format&fit=crop&w=${w}&h=${h}&fm=webp`, alvo, true);
    }
    const og = `assets/og/${ogDe[chave] || "artigos-" + chave}`;
    await baixar(`${base}?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=675&fm=jpg`, og, false);
    ok++;
    console.log("✓", chave);
  } catch (e) {
    console.error("✗", chave, e.message);
  }
}
// O build escolhe .webp quando existir; se a CDN devolver JPEG, o arquivo fica .jpg e também é aceito.
console.log(`${ok}/${pexels.length} fotos baixadas. Rode npm run build para usar as versões locais.`);

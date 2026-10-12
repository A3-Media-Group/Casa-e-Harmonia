import fs from "node:fs";
import { imagens } from "./data/imagens.mjs";
import { artigosNovos } from "./data/artigos.mjs";
import { guiasOriginais } from "./data/guias-originais.mjs";
import { hubs } from "./data/hubs.mjs";
import crypto from "node:crypto";
import { dicas, ideias } from "./data/dicas.mjs";

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const origin = process.env.SITE_URL || "https://casaeharmonia.com.br";
// Datas de última alteração real do conteúdo de cada página fixa (não usar a data do build).
const DATAS = {
  home: "2026-10-12",
  ferramentas: "2026-10-12",
  dicas: "2026-10-12",
  sobre: "2026-10-12",
};
// Versão de CSS/JS pelo conteúdo: muda só quando o arquivo muda, permitindo cache longo.
const versao = (f) => crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex").slice(0, 8);
const V = { css: versao("styles.css"), js: versao("scripts.js") };

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const falha = (msg) => {
  throw Error(msg);
};
const abs = (src) => (src.startsWith("http") ? src : origin + src);

// ---------- Imagens: cada fotografia pertence a um único conteúdo ----------
// Versões locais 16:9 (assets/fotos/{chave}-600|1200.webp) geradas por scripts/gerar-imagens.py
// ou baixadas por scripts/baixar-fotos.mjs. Sem elas, usa a origem registrada em data/imagens.mjs.
const fotoLocal = (key) => {
  for (const ext of ["webp", "jpg"]) {
    const g = `/assets/fotos/${key}-1200.${ext}`;
    if (fs.existsSync("." + g)) return [`/assets/fotos/${key}-600.${ext}`, g];
  }
  return null;
};
const manifesto = { fotosLocais: {}, og: [] };
for (const [k, p] of Object.entries(imagens)) if (p.src.startsWith("/assets/")) manifesto.fotosLocais[k] = p.src;
const donos = new Map();
function img(key, cls = "", { eager = false, dono = key, sizes } = {}) {
  const p = imagens[key];
  if (!p) throw Error("Imagem não registrada: " + key);
  const atual = donos.get(key);
  if (atual && atual !== dono)
    throw Error(`Imagem "${key}" repetida em "${atual}" e "${dono}"`);
  donos.set(key, dono);
  const local = fotoLocal(key);
  const src = local ? local[1] : p.src;
  const set = local ? `${local[0]} 600w, ${local[1]} 1200w` : p.srcset;
  const srcset = set ? ` srcset="${esc(set)}" sizes="${sizes || "(max-width: 900px) 100vw, 50vw"}"` : "";
  return `<img class="${cls}" src="${esc(src)}"${srcset} width="1200" height="675" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async" alt="${esc(p.alt)}" onerror="this.onerror=null;this.src='/assets/sem-foto.svg'">`;
}
const credito = (key) => {
  const p = imagens[key];
  return `<p class="photo-credit">Foto: <a href="${esc(p.fonte)}" rel="noopener">${esc(p.credito)}</a>${p.licencaUrl ? ` · <a href="${esc(p.licencaUrl)}" rel="noopener">licença</a>` : ""}</p>`;
};

// ---------- Guias: originais + novos ----------
const valida = (onde, title, desc) => {
  if (title.length > 60 || /…$/.test(title)) throw Error(`Title inválido (${title.length}) em ${onde}: ${title}`);
  if (desc.length < 120 || desc.length > 155 || /…$/.test(desc)) throw Error(`Description inválida (${desc.length}) em ${onde}`);
};
const artigos = [...guiasOriginais, ...artigosNovos.map((a) => ({ ...a, novo: true }))];
const hubDe = (a) => hubs.find((h) => h.slug === a.cluster) || falha(`Guia sem hub: ${a.slug}`);
const hubUrl = (h) => `/guias/${h.slug}/`;
const dataTxt = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][m - 1]} de ${y}`;
};

// ---------- Layout ----------
const nav = `<header><a class="brand" href="/"><img src="/assets/logo.webp" alt="Casa e Harmonia" width="150" height="82"></a><nav aria-label="Principal"><a href="/#artigos">Guias</a><a href="/dicas.html">Dicas</a><a href="/ferramentas.html">Ferramentas</a><a href="/sobre.html">Sobre</a></nav><a class="header-cta" href="/ferramentas.html">Ferramentas grátis <span>↗</span></a></header>`;
const footer = `<footer><div><strong>CASA E HARMONIA</strong><p>Ideias para morar bem. Espaço para viver melhor.</p></div><div><b>Explore</b><a href="/#artigos">Guias da casa</a><a href="/dicas.html">Dicas do dia a dia</a><a href="/ferramentas.html">Ferramentas gratuitas</a></div><div><b>Mais lidos</b><a href="/artigos/como-tirar-mofo-da-parede.html">Tirar mofo da parede</a><a href="/artigos/economizar-conta-de-luz.html">Economizar na conta de luz</a><a href="/artigos/quantos-btus-ar-condicionado.html">Quantos BTUs preciso?</a><a href="/artigos/como-limpar-sofa.html">Como limpar o sofá</a></div><div><b>Temas</b>${hubs.map((h) => `<a href="${hubUrl(h)}">${h.nome}</a>`).join("")}</div><div><b>Portal</b><a href="/sobre.html">Sobre e privacidade</a></div><small>© 2026 Casa e Harmonia · Feito para a vida em casa.</small></footer>`;
const ogDe = (path) => (path === "index.html" ? "home" : path.replace(/\/index\.html$/, "").replace(/\.html$/, "").replace(/\//g, "-"));
function page(title, desc, body, path, schema = {}, { image = "hero", type, eyebrow = "Casa e Harmonia" } = {}) {
  if (!path.startsWith("404")) valida(path, title, desc);
  const canon = path === "index.html" ? origin + "/" : `${origin}/${path.replace(/index\.html$/, "")}`;
  const ogKey = ogDe(path);
  const ogFile = `/assets/og/${ogKey}.jpg`;
  const foto = imagens[image]?.src.startsWith("/assets/") ? imagens[image].src : null;
  if (!path.startsWith("404")) manifesto.og.push({ arquivo: ogFile, titulo: title.replace(/ \| Casa e Harmonia$/, ""), eyebrow, foto });
  const og = origin + ogFile;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canon}"><meta property="og:site_name" content="Casa e Harmonia"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="${type || (path.startsWith("artigos/") ? "article" : "website")}"><meta property="og:url" content="${canon}"><meta property="og:locale" content="pt_BR"><meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="675"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${og}"><meta name="theme-color" content="#2d503e"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32"><link rel="icon" href="/assets/icone-192.png" type="image/png" sizes="192x192"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="preload" href="/assets/fontes/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preconnect" href="https://images.pexels.com"><link rel="stylesheet" href="/styles.css?v=${V.css}"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", ...schema }).replaceAll("</", "<\\/")}</script><script src="/scripts.js?v=${V.js}" defer></script></head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a>${nav}${body.replace(/<main(?=[ >])/, '<main id="conteudo"')}${footer}</body></html>`;
}
const breadcrumb = (itens) => ({
  "@type": "BreadcrumbList",
  itemListElement: itens.map(([name, url], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: origin + url,
  })),
});
// Páginas indexáveis entram no sitemap com a data real da última alteração do conteúdo.
const sitemap = [];
const write = (path, html, lastmod) => {
  fs.mkdirSync(`${out}/${path}`.replace(/\/[^/]+$/, ""), { recursive: true });
  fs.writeFileSync(`${out}/${path}`, html);
  if (lastmod) sitemap.push([path === "index.html" ? "" : path.replace(/index\.html$/, ""), lastmod]);
};

// ---------- Cartões reutilizáveis ----------
const ferramentas = [
  ["tinta", "▧", "Quanto de tinta?", "Litros e latas para pintar suas paredes."],
  ["btu", "❄", "Quantos BTUs?", "O ar-condicionado certo para o cômodo."],
  ["energia", "ϟ", "Conta de luz", "Consumo e custo de cada aparelho."],
  ["churrasco", "♨", "Calculadora de churrasco", "Carne, carvão e bebidas por pessoa."],
  ["papel", "▤", "Papel de parede", "Quantos rolos comprar, com rapport."],
  ["piso", "▦", "Piso e revestimento", "Caixas, argamassa e rodapé."],
  ["reforma", "⌑", "Orçamento de reforma", "Estimativa com reserva para imprevistos."],
  ["organizacao", "☷", "Cronograma da casa", "Rotina de limpeza que cabe no dia."],
  ["paletas", "◐", "Paletas de cores", "Combinações para testar no seu lar."],
];
const toolGrid = (lista) =>
  `<div class="tool-grid">${lista.map(([id, icon, h, p]) => `<a href="/ferramentas.html#${id}"><span class="tool-icon" aria-hidden="true">${icon}</span><div><h3>${h}</h3><p>${p}</p></div><b>↗</b></a>`).join("")}</div>`;
const articleCard = (a) =>
  `<a class="article-card" data-category="${esc(a.cat)}" href="/artigos/${a.slug}.html">${img(a.slug, "", { dono: a.slug, sizes: "(max-width: 600px) 100vw, 33vw" })}<div><span class="eyebrow">${a.cat}${a.novo ? " · NOVO" : ""}</span><h3>${a.card}</h3><p>${a.intro.split(". ")[0]}.</p><span class="read">Ler o guia <b>↗</b></span></div></a>`;
const tipCard = ([cat, h, p, link]) =>
  `<article class="tip-card" data-category="${esc(cat)}"><span class="eyebrow">${cat}</span><h3>${h}</h3><p>${p}</p>${link ? `<a href="${link}">Saiba mais ↗</a>` : ""}</article>`;
const searchTools = (id, label, placeholder, cats, total, nome) =>
  `<div class="search-tools" data-search="${id}"><label for="${id}-search">${label}<input id="${id}-search" type="search" placeholder="${placeholder}"></label><label for="${id}-filter">Filtrar por categoria<select id="${id}-filter"><option value="">Todas</option>${cats.map((c) => `<option>${c}</option>`).join("")}</select></label></div><p id="${id}-count" class="search-count" role="status" data-label="${nome}">${total} ${nome}</p>`;
const uniq = (arr) => [...new Set(arr)];
// Endereço de cada ferramenta (centralizado para a migração de /ferramentas.html#id para páginas próprias).
const toolUrl = (id) => `/ferramentas.html#${id}`;

// ---------- Home ----------
write(
  "index.html",
  page(
    "Casa e Harmonia | Guias, dicas e ferramentas para sua casa",
    "Decoração, limpeza, organização e ferramentas grátis: calcule tinta, BTUs, conta de luz, piso, papel de parede e churrasco. Ideias práticas para morar bem.",
    `<main><section class="hero"><div class="hero-copy"><p class="eyebrow">INSPIRAÇÃO PARA A VIDA REAL</p><h1>Mais cor. Mais calma.<br><em>Mais a sua casa.</em></h1><p>Guias de decoração, limpeza e organização e calculadoras grátis para a casa: tinta, BTU de ar-condicionado, conta de luz, piso e muito mais, com dicas práticas para morar melhor.</p><a class="button" href="#artigos">Encontre sua inspiração <span>↗</span></a><div class="hero-stats"><span><b>${artigos.length}</b> guias</span><span><b>${ferramentas.length}</b> ferramentas</span><span><b>${dicas.length}</b> dicas</span></div></div><a class="hero-image" href="/artigos/cores-sala-pequena.html">${img("hero", "hero-cover", { eager: true, dono: "home" })}<span class="image-label">SALA COM PERSONALIDADE <b>Monte sua paleta de cores ↗</b></span></a></section><nav class="category-strip" aria-label="Temas"><span>UM LAR, MUITAS POSSIBILIDADES</span>${hubs.map((h) => `<a href="${hubUrl(h)}">${h.nome}</a>`).join("")}</nav><section class="tools-band"><div class="section-head"><div><p class="eyebrow">DO PLANO À PRÁTICA</p><h2>Ferramentas gratuitas, sem cadastro.</h2></div><a href="/ferramentas.html">Todas as ${ferramentas.length} ferramentas ↗</a></div>${toolGrid(ferramentas.slice(0, 6))}</section><section id="artigos" class="articles"><div class="section-head"><div><p class="eyebrow">IDEIAS PARA O SEU PRÓXIMO CAPÍTULO</p><h2>Guias práticos para cada canto da casa.</h2></div><span>${artigos.length} guias para morar melhor</span></div>${searchTools("article", "O que você quer resolver?", "Busque por mofo, sofá, luz, plantas…", uniq(artigos.map((a) => a.cat)), artigos.length, "guias")}<div class="article-grid" data-grid="article">${[...artigos].reverse().map(articleCard).join("")}</div><p id="article-empty" class="empty" hidden>Nenhum guia encontrado. Experimente outro termo ou escolha todas as categorias.</p></section><section class="tips-band"><div class="section-head"><div><p class="eyebrow">DICAS DO DIA A DIA</p><h2>Pequenos truques, grande diferença.</h2></div><a href="/dicas.html">Ver todas as ${dicas.length} dicas ↗</a></div><div class="tip-grid">${[0, 7, 14, 20, 26, 30].map((i) => tipCard(dicas[i])).join("")}</div></section><section class="closing"><p class="eyebrow">MAIS INTENÇÃO, MENOS EXCESSO</p><h2>Uma casa melhor começa<br>com uma ideia possível.</h2><a href="/ferramentas.html" class="button">Vamos colocar em prática ↗</a></section></main>`,
    "index.html",
    {
      "@graph": [
        {
          "@type": "WebSite",
          name: "Casa e Harmonia",
          url: origin + "/",
          inLanguage: "pt-BR",
        },
        {
          "@type": "Organization",
          name: "Casa e Harmonia",
          url: origin + "/",
          logo: origin + "/assets/icone-512.png",
        },
      ],
    },
    { eyebrow: "Guias, dicas e ferramentas" },
  ),
  DATAS.home,
);

// ---------- Páginas de artigos ----------
for (const a of artigos) {
  const relacionados = a.relacionados.map((s) => artigos.find((b) => b.slug === s) || falha(`Relacionado inexistente em ${a.slug}: ${s}`));
  const ferramentasDoGuia = a.ferramentas.map((id) => ferramentas.find((f) => f[0] === id) || falha(`Ferramenta inexistente em ${a.slug}: ${id}`));
  const contexto = (j) => (a.contexto || []).filter(([k]) => k === j).map(([, h]) => h).join("");
  const body = `<main class="post"><nav class="breadcrumb" aria-label="Trilha"><a href="/">Início</a> / <a href="${hubUrl(hubDe(a))}">${hubDe(a).nome}</a> / <span>${a.title}</span></nav><p class="eyebrow">${a.cat} · GUIA PRÁTICO</p><h1>${a.title}</h1><p class="intro">${a.intro}</p><p class="byline"><a href="/sobre.html">Redação Casa e Harmonia</a> · Atualizado em ${dataTxt(a.atualizado)}</p><figure class="cover-figure">${img(a.slug, "cover", { eager: true, dono: a.slug, sizes: "(max-width: 900px) 100vw, 1100px" })}<figcaption>${credito(a.slug)}</figcaption></figure><div class="post-layout"><article><nav class="contents" aria-label="Neste artigo"><strong>Neste guia</strong>${a.sections.map((s, j) => `<a href="#sec${j}">${s[0]}</a>`).join("")}<a href="#faq">Perguntas frequentes</a></nav>${a.resumo ? `<aside class="summary"><strong>Resumo rápido</strong><ul>${a.resumo.map((r) => `<li>${r}</li>`).join("")}</ul></aside>` : ""}${a.sections.map((s, j) => `<section id="sec${j}"><h2>${s[0]}</h2>${s[1]}${contexto(j)}</section>`).join("")}<h2 id="faq">Perguntas frequentes sobre ${a.tema}</h2>${a.faq.map((f) => `<details class="faq" open><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}<aside class="post-cta"><p class="eyebrow">SEU PRÓXIMO PASSO</p><p class="cta-title">${a.cta}.</p><a class="button" href="${a.tool[0]}">${a.tool[1]} ↗</a></aside><p class="related-title">Leia também</p><ul class="related">${relacionados.map((b) => `<li><a href="/artigos/${b.slug}.html"><span class="eyebrow">${b.cat}</span>${b.title}</a></li>`).join("")}</ul><h2>Fontes e referências</h2><p>Este guia reúne orientações gerais para adaptar ao seu espaço. Para serviços técnicos, siga os manuais dos produtos e a orientação de um profissional qualificado.</p>${a.sources.map(([l, u]) => `<p><a href="${u}" rel="noopener">${l}</a>.</p>`).join("")}</article><aside class="reading-aside"><p class="eyebrow">FERRAMENTAS GRÁTIS</p><p class="aside-title">Faça as contas antes de começar.</p><ul>${ferramentasDoGuia.map(([id, , h]) => `<li><a href="${toolUrl(id)}">${h} ↗</a></li>`).join("")}</ul><p class="eyebrow">NO DIA A DIA</p><ul><li><a href="/dicas.html">Dicas rápidas para a casa ↗</a></li></ul></aside></div></main>`;
  write(
    `artigos/${a.slug}.html`,
    page(
      a.seo || a.title,
      a.desc,
      body,
      `artigos/${a.slug}.html`,
      {
        "@graph": [
          {
            "@type": "Article",
            headline: a.title,
            description: a.desc,
            author: { "@type": "Organization", name: "Redação Casa e Harmonia", url: origin + "/sobre.html" },
            publisher: { "@type": "Organization", name: "Casa e Harmonia", logo: { "@type": "ImageObject", url: origin + "/assets/icone-512.png" } },
            datePublished: a.publicado,
            dateModified: a.atualizado,
            mainEntityOfPage: `${origin}/artigos/${a.slug}.html`,
            image: [`${origin}/assets/og/${ogDe(`artigos/${a.slug}.html`)}.jpg`],
            inLanguage: "pt-BR",
          },
          {
            "@type": "FAQPage",
            mainEntity: a.faq.map((f) => ({
              "@type": "Question",
              name: f[0],
              acceptedAnswer: { "@type": "Answer", text: f[1] },
            })),
          },
          breadcrumb([["Início", "/"], [hubDe(a).nome, hubUrl(hubDe(a))], [a.title, `/artigos/${a.slug}.html`]]),
        ],
      },
      { image: a.slug, eyebrow: a.cat },
    ),
    a.atualizado,
  );
}

// ---------- Hubs por tema ----------
for (const h of hubs) {
  const guias = h.guias.map((s) => artigos.find((a) => a.slug === s) || falha(`Hub ${h.slug}: guia inexistente ${s}`));
  for (const g of guias) if (g.cluster !== h.slug) falha(`Guia ${g.slug} listado no hub ${h.slug}, mas com cluster ${g.cluster}`);
  const palavras = h.intro.join(" ").split(/\s+/).length;
  if (palavras < 300 || palavras > 500) falha(`Hub ${h.slug}: introdução com ${palavras} palavras (esperado 300–500)`);
  const urlsGuias = new Set(guias.map((g) => `/artigos/${g.slug}.html`));
  const dicasDoTema = dicas.filter((d) => urlsGuias.has(d[3]));
  const ferramentasDoHub = h.ferramentas.map((id) => ferramentas.find((f) => f[0] === id) || falha(`Hub ${h.slug}: ferramenta ${id}`));
  write(
    `guias/${h.slug}/index.html`,
    page(
      h.title,
      h.desc,
      `<main class="post hub"><nav class="breadcrumb" aria-label="Trilha"><a href="/">Início</a> / <span>${h.nome}</span></nav><p class="eyebrow">GUIAS POR TEMA</p><h1>${h.nome}</h1><div class="hub-intro">${h.intro.map((p) => `<p>${p}</p>`).join("")}</div><h2>Guias de ${h.nome.toLowerCase()}</h2><ul class="hub-list">${guias.map((g) => `<li><a href="/artigos/${g.slug}.html"><span class="eyebrow">${g.cat}</span><b>${g.title}</b><span>${g.desc}</span></a></li>`).join("")}</ul><h2>Ferramentas para ${h.nome.toLowerCase()}</h2>${toolGrid(ferramentasDoHub)}${dicasDoTema.length ? `<h2>Dicas rápidas sobre ${h.nome.toLowerCase()}</h2><div class="tip-grid">${dicasDoTema.map(tipCard).join("")}</div>` : ""}<p class="hub-outros">Outros temas: ${hubs.filter((o) => o !== h).map((o) => `<a href="${hubUrl(o)}">${o.nome}</a>`).join(" · ")}</p></main>`,
      `guias/${h.slug}/index.html`,
      {
        "@graph": [
          {
            "@type": "CollectionPage",
            name: h.title,
            description: h.desc,
            url: origin + hubUrl(h),
            inLanguage: "pt-BR",
            mainEntity: {
              "@type": "ItemList",
              itemListElement: guias.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/artigos/${g.slug}.html`, name: g.title })),
            },
          },
          breadcrumb([["Início", "/"], [h.nome, hubUrl(h)]]),
        ],
      },
      { eyebrow: "Guias por tema" },
    ),
    h.atualizado,
  );
}

// ---------- Dicas ----------
write(
  "dicas.html",
  page(
    "Dicas para o dia a dia em casa | Casa e Harmonia",
    `${dicas.length} dicas práticas de limpeza, cozinha, economia, organização, plantas e segurança, além de ideias criativas para renovar a casa sem gastar muito.`,
    `<main class="listing"><section class="listing-hero"><div><p class="eyebrow">TRUQUES QUE FUNCIONAM</p><h1>Dicas para o dia a dia</h1><p class="intro">Soluções rápidas para limpar, organizar, economizar e cuidar da casa, reunidas em um só lugar. Filtre pelo assunto ou busque um problema específico.</p></div>${img("dicasCapa", "", { eager: true, dono: "dicas" })}</section>${searchTools("tip", "Qual é o problema de hoje?", "Busque por panela, conta de luz, plantas…", uniq(dicas.map((d) => d[0])), dicas.length, "dicas")}<div class="tip-grid" data-grid="tip">${dicas.map(tipCard).join("")}</div><p id="tip-empty" class="empty" hidden>Nenhuma dica encontrada.</p><section class="ideas"><p class="eyebrow">IDEIAS BACANAS</p><h2>Projetos de fim de semana</h2><div class="idea-grid">${ideias.map(([h, p], i) => `<article><span>${String(i + 1).padStart(2, "0")}</span><h3>${h}</h3><p>${p}</p></article>`).join("")}</div></section></main>`,
    "dicas.html",
    {
      "@graph": [
        {
          "@type": "ItemList",
          name: "Dicas para o dia a dia",
          itemListElement: dicas.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d[1] })),
        },
        breadcrumb([["Início", "/"], ["Dicas", "/dicas.html"]]),
      ],
    },
    { image: "dicasCapa", eyebrow: "Dicas do dia a dia" },
  ),
  DATAS.dicas,
);

// ---------- Ferramentas ----------
const field = (id, label, value, min = 0, step = ".1", extra = "") =>
  `<label>${label}<input id="${id}" type="number" value="${value}" min="${min}" step="${step}" required${extra}></label>`;
const panel = (n, id, eyebrow, h2, p, form, result, guia) =>
  `<section class="tool-panel" id="${id}"><div><p class="eyebrow">${String(n).padStart(2, "0")} / ${eyebrow}</p><h2>${h2}</h2><p>${p}</p>${form}${guia ? `<p class="tool-guide">Entenda a conta: <a href="${guia[0]}">${guia[1]} ↗</a></p>` : ""}</div><div class="result" id="${id}-result" aria-live="polite">${result}</div></section>`;
const opts = (arr) => arr.map(([v, t, sel]) => `<option value="${v}"${sel ? " selected" : ""}>${t}</option>`).join("");
const ferramentasHtml = [
  panel(1, "tinta", "RENOVE AS CORES", "Calculadora de tinta",
    "Some as paredes, desconte portas e janelas e veja quantos litros e quais embalagens comprar.",
    `<form id="paint-form"><div id="walls"><div class="wall-row">${field("width", "Largura (m)", 4, 0.1)}${field("height", "Altura (m)", 2.7, 0.1)}</div></div><button type="button" id="add-wall" class="text-button">+ Adicionar parede</button><div class="form-grid">${field("openings", "Portas e janelas (m²)", 0)}<label>Tipo de rendimento<select id="yield-mode"><option value="coat">Por demão</option><option value="finished">Acabado (todas as demãos)</option></select></label>${field("coats", "Demãos", 2, 1, 1)}${field("yield", "Rendimento informado (m²/L)", 10, 0.1)}${field("waste", "Margem adicional (%)", 10, 0, 1)}${field("paint-price", "Preço do galão 3,6 L (R$, opcional)", 0, 0, ".01")}</div><p class="form-note">Referência: porta comum ≈ 1,6 m²; janela de 1,2 × 1 m = 1,2 m².</p><button class="button">Calcular quantidade ↗</button></form>`,
    `<p class="eyebrow">SEU PLANEJAMENTO</p><h3>Uma nova cor.<br>Na medida certa.</h3><p>Confira o rendimento no rótulo. Para converter m²/lata em m²/L, divida a área coberta pelo volume da embalagem.</p>`,
    ["/artigos/como-calcular-tinta.html", "Como calcular tinta"]),
  panel(2, "btu", "CLIMA NA MEDIDA", "Calculadora de BTU para ar-condicionado",
    "Descubra a capacidade indicada considerando área, pessoas, sol e aparelhos que geram calor.",
    `<form id="btu-form"><div class="form-grid">${field("btu-area", "Área do ambiente (m²)", 12, 1, ".5")}${field("btu-people", "Pessoas no ambiente", 2, 1, 1)}${field("btu-devices", "Eletrônicos (TV, PC, geladeira)", 1, 0, 1)}<label>Sol no ambiente<select id="btu-sun">${opts([["manha", "Sem sol ou só de manhã", 1], ["tarde", "Sol da tarde"]])}</select></label></div><button class="button">Calcular BTUs ↗</button></form>`,
    `<p class="eyebrow">CONFORTO TÉRMICO</p><h3>Nem fraco demais,<br>nem forte demais.</h3><p>Regra prática usada no mercado: 600 BTU/h por m² (800 com sol da tarde), mais 600 por pessoa extra e por eletrônico.</p>`,
    ["/artigos/quantos-btus-ar-condicionado.html", "Quantos BTUs preciso?"]),
  panel(3, "energia", "CONTA DE LUZ SOB CONTROLE", "Calculadora de consumo de energia",
    "Monte a lista de aparelhos da casa e veja o consumo em kWh e o custo de cada um no mês.",
    `<form id="energy-form"><div class="energy-table" id="energy-rows"></div><div class="energy-add"><label>Adicionar aparelho<select id="energy-preset"></select></label><button type="button" id="energy-add" class="text-button">+ Adicionar</button></div><div class="form-grid">${field("energy-tariff", "Tarifa (R$/kWh com impostos)", 0.85, 0.01, ".01")}<label>Bandeira tarifária<select id="energy-flag">${opts([["0", "Verde (sem acréscimo)", 1], ["0.01885", "Amarela (+R$ 1,885/100 kWh)"], ["0.04463", "Vermelha P1 (+R$ 4,463/100 kWh)"], ["0.07877", "Vermelha P2 (+R$ 7,877/100 kWh)"]])}</select></label></div><p class="form-note">Tarifa e bandeiras são referências ilustrativas. Use o valor por kWh da sua conta e a bandeira vigente divulgada pela ANEEL.</p><button class="button">Calcular consumo ↗</button></form>`,
    `<p class="eyebrow">ONDE ESTÁ O GASTO?</p><h3>Descubra o vilão<br>da sua conta.</h3><p>Consumo mensal = potência (W) × horas por dia × dias de uso ÷ 1000. A potência está na etiqueta ou no manual do aparelho.</p>`,
    ["/artigos/economizar-conta-de-luz.html", "15 hábitos para economizar energia"]),
  panel(4, "churrasco", "RECEBA SEM SOBRAS", "Calculadora de churrasco",
    "Quantidade de carne, carvão, pão de alho e bebidas para o seu número de convidados.",
    `<form id="bbq-form"><div class="form-grid">${field("bbq-men", "Homens", 6, 0, 1)}${field("bbq-women", "Mulheres", 6, 0, 1)}${field("bbq-kids", "Crianças", 2, 0, 1)}${field("bbq-drinkers", "Adultos que bebem cerveja", 8, 0, 1)}${field("bbq-hours", "Duração (horas)", 4, 1, 1)}</div><button class="button">Calcular churrasco ↗</button></form>`,
    `<p class="eyebrow">PLANEJE A FESTA</p><h3>Carne na medida,<br>festa sem aperto.</h3><p>Referência para até 4 horas: 400 g de carne por homem, 300 g por mulher e 150 g por criança. Ajuste ao apetite do seu grupo.</p>`, null),
  panel(5, "papel", "PAREDE NOVA", "Calculadora de papel de parede",
    "Calcule as faixas e os rolos necessários, considerando o rapport (repetição da estampa).",
    `<form id="wallpaper-form"><div class="form-grid">${field("wp-width", "Largura total das paredes (m)", 3.5, 0.1)}${field("wp-height", "Altura do pé-direito (m)", 2.6, 0.5)}${field("wp-discount", "Largura de portas/janelas a descontar (m)", 0, 0)}${field("wp-roll-width", "Largura do rolo (m)", 0.53, 0.1, ".01")}${field("wp-roll-length", "Comprimento do rolo (m)", 10, 1, ".1")}${field("wp-repeat", "Rapport da estampa (cm)", 0, 0, 1)}</div><p class="form-note">O rolo padrão mede 0,53 × 10 m (cerca de 5,3 m²). Estampa lisa ou sem casamento: rapport 0.</p><button class="button">Calcular rolos ↗</button></form>`,
    `<p class="eyebrow">COMPRA CERTA</p><h3>Faixas contadas,<br>estampa alinhada.</h3><p>Compre todos os rolos do mesmo lote de fabricação para evitar diferença de tom.</p>`,
    ["/artigos/decorar-quarto-pequeno.html", "Ideias para quarto pequeno"]),
  panel(6, "piso", "COMPRA BEM PLANEJADA", "Calculadora de piso e revestimento",
    "Caixas inteiras, argamassa e rodapé para o seu cômodo, com custo estimado.",
    `<form id="floor-form"><div class="form-grid"><label>Largura (m)<input id="floor-width" type="number" min="0.01" step="0.01" value="4" required></label><label>Comprimento (m)<input id="floor-length" type="number" min="0.01" step="0.01" value="5" required></label><label>Margem de recortes (%)<input id="floor-waste" type="number" min="0" step="1" value="10" required></label><label>Cobertura por caixa (m²)<input id="floor-box" type="number" min="0.01" step="0.01" value="2.2" required></label>${field("floor-doors", "Largura das portas (m)", 0.8, 0, ".1")}${field("floor-price", "Preço por m² (R$, opcional)", 0, 0, ".01")}</div><p class="form-note">Margem comum: 10% para assentamento reto e 15% para diagonal ou peças grandes.</p><button class="button">Calcular caixas ↗</button></form>`,
    `<h3>Do tamanho do seu projeto.</h3><p>Para cômodos irregulares, divida em retângulos e some as áreas. Confirme a paginação com o instalador.</p>`, null),
  panel(7, "reforma", "PLANEJE A MUDANÇA", "Simulador de orçamento de reforma",
    "Uma referência inicial com custos unitários editáveis para a sua região.",
    `<form id="budget-form"><div class="form-grid"><label>Cômodo<select id="room">${opts([["Cozinha", "Cozinha", 1], ["Banheiro", "Banheiro"], ["Sala", "Sala"], ["Quarto", "Quarto"], ["Área de serviço", "Área de serviço"], ["Varanda", "Varanda"]])}</select></label><label>Intervenção<select id="intervention">${opts([["paint", "Pintura", 1], ["floor", "Troca de piso"], ["wall", "Revestimento de parede"], ["ceiling", "Forro de gesso"], ["light", "Pontos de iluminação"], ["joinery", "Marcenaria (metro linear)"]])}</select></label>${field("quantity", "Quantidade (m² de parede)", 30, 0.1)}${field("unit", "Custo unitário (R$)", 35, 0.01, ".01")}${field("reserve", "Reserva para imprevistos (%)", 15, 0, 1)}</div><p class="form-note" id="budget-note">Premissa ilustrativa: R$ 35/m² de parede, materiais e mão de obra. Não é uma cotação de mercado.</p><button class="button">Estimar orçamento ↗</button></form>`,
    `<p class="eyebrow">ESPAÇO PARA PLANEJAR</p><h3>Antes de reformar,<br>faça as contas.</h3><p>Substitua o custo unitário por orçamentos locais. Demolição, entulho e alterações estruturais não estão incluídos.</p>`, null),
  `<section class="tool-panel" id="organizacao"><div><p class="eyebrow">08 / SIMPLIFIQUE A ROTINA</p><h2>Cronograma de limpeza e organização</h2><p>Um plano flexível com tarefas diárias, semanais e mensais, salvo somente neste navegador.</p><form id="schedule-form"><div class="form-grid"><label>Tamanho da casa<select id="size"><option value="small">Até 60 m²</option><option value="medium">De 61 a 120 m²</option><option value="large">Acima de 120 m²</option></select></label><label>Tempo disponível por dia<select id="routine"><option value="15">15 minutos</option><option value="30">30 minutos</option><option value="60">60 minutos</option></select></label><label class="check-inline"><input type="checkbox" id="has-pets"> Tenho pets</label><label class="check-inline"><input type="checkbox" id="has-kids"> Tenho crianças</label><label class="check-inline"><input type="checkbox" id="has-plants"> Tenho plantas</label></div><button class="button">Gerar meu cronograma ↗</button></form><p id="storage-status" role="status"></p><p class="tool-guide">Entenda a conta: <a href="/artigos/rotina-limpeza.html">Rotina de limpeza leve ↗</a></p></div><div class="result schedule"><div class="progress" id="progress" hidden><span></span><b></b></div><div id="checklist"><h3>Uma rotina possível<br>é uma rotina que fica.</h3><p>Escolha seu tempo e gere um plano para começar.</p></div><div class="actions"><button id="export" class="text-button" hidden>↓ Exportar checklist (.txt)</button><button id="reset-schedule" class="text-button" hidden>↺ Desmarcar tudo</button></div></div></section>`,
  `<section class="tool-panel" id="paletas"><div><p class="eyebrow">09 / ENCONTRE SEU CLIMA</p><h2>Paletas de cores para a casa</h2><p>Seis combinações com base, apoio e destaque. Veja a simulação e copie os códigos.</p><label>Qual atmosfera combina com você?<select id="palette"><option value="natural">Natural e acolhedora</option><option value="solar">Solar e criativa</option><option value="serena">Serena e fresca</option><option value="japandi">Japandi minimalista</option><option value="terrosa">Terrosa e quente</option><option value="noturna">Sofisticada e escura</option></select></label><p>Use a base nas áreas maiores (paredes), o apoio em móveis e tecidos e o destaque em detalhes. Uma proporção de referência é 60/30/10.</p><p class="tool-guide">Saiba mais: <a href="/artigos/cores-sala-pequena.html">Como testar sua paleta ↗</a></p></div><div class="result"><div id="palette-preview" aria-live="polite"></div><p class="form-note">Cores digitais de referência, sem equivalência com marcas de tinta. Teste amostras no ambiente antes de comprar.</p></div></section>`,
].join("");
write(
  "ferramentas.html",
  page(
    "Ferramentas grátis para casa: tinta, BTU, energia e mais",
    "Calculadoras gratuitas e sem cadastro: tinta, BTU de ar-condicionado, conta de luz, churrasco, papel de parede, piso, reforma, cronograma e paletas.",
    `<main class="tools-page"><p class="eyebrow">MENOS IMPROVISO, MAIS HARMONIA</p><h1>Seu próximo projeto<br>começa aqui.</h1><p class="intro">${ferramentas.length} ferramentas gratuitas, sem cadastro. Os cálculos acontecem no seu navegador.</p><nav class="tool-tabs" aria-label="Ferramentas">${ferramentas.map(([id, icon, h]) => `<a href="#${id}"><span aria-hidden="true">${icon}</span> ${h}</a>`).join("")}</nav>${ferramentasHtml}</main>`,
    "ferramentas.html",
    {
      "@graph": [
        {
          "@type": "WebApplication",
          name: "Ferramentas Casa e Harmonia",
          url: origin + "/ferramentas.html",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
          featureList: ferramentas.map((f) => f[2]),
        },
        breadcrumb([["Início", "/"], ["Ferramentas", "/ferramentas.html"]]),
      ],
    },
    { eyebrow: "Ferramentas grátis" },
  ),
  DATAS.ferramentas,
);

// ---------- Sobre, 404, sitemap ----------
write(
  "sobre.html",
  page(
    "Sobre e privacidade | Casa e Harmonia",
    "Conheça o portal, a política editorial, a origem das fotografias e como as ferramentas usam o armazenamento local do navegador.",
    `<main class="post narrow"><h1>Sobre o Casa e Harmonia</h1><p>Um portal sobre decoração, limpeza, organização e jardinagem, com guias, dicas e ferramentas práticas para planejar a vida em casa.</p><h2>Critério editorial</h2><p>Guias introdutórios com sugestões adaptáveis. Os temas são escolhidos a partir de dúvidas frequentes de quem cuida da casa e de tendências públicas de busca. Estimativas de tinta, energia, BTU e materiais dependem do produto e do local. Custos de reforma e tarifas são premissas editáveis, não cotações. Trabalhos técnicos exigem avaliação de um profissional.</p><h2>Privacidade</h2><p>Não há cadastro nem formulário de coleta de dados. O cronograma e suas marcações ficam no localStorage deste navegador e podem ser apagados nas configurações do navegador. Os cálculos das ferramentas acontecem no seu dispositivo. A tipografia usa o Google Fonts e parte das fotografias é carregada do Pexels (images.pexels.com); esses serviços recebem os dados normais de conexão ao carregar os arquivos.</p><h2>Publicidade</h2><p>Nenhum anúncio ou rastreador está ativo nesta versão. Conteúdos patrocinados, quando houver, serão identificados.</p><h2>Fotografias</h2><p>As fotos vêm do Pexels (licença gratuita, sem necessidade de cadastro) e do Wikimedia Commons (licenças Creative Commons). O crédito e o link para a página original aparecem abaixo de cada imagem. As imagens são ilustrativas.</p><h2>Correções e contato</h2><p>Encontrou um erro? <a href="https://github.com/A3-Media-Group/Casa-e-Harmonia/issues">Envie uma sugestão pelo repositório oficial</a>. Esse canal é público; não inclua dados pessoais. O portal é mantido pela A3 Media Group.</p></main>`,
    "sobre.html",
    {},
    { eyebrow: "Sobre o portal" },
  ),
  DATAS.sobre,
);
write(
  "404.html",
  page(
    "Página não encontrada | Casa e Harmonia",
    "Encontre os guias, dicas e ferramentas do Casa e Harmonia.",
    '<main class="post narrow"><h1>Vamos encontrar outro caminho?</h1><p>Esta página não está disponível. Que tal começar por aqui?</p><p><a href="/#artigos">Guias da casa</a> · <a href="/dicas.html">Dicas</a> · <a href="/ferramentas.html">Ferramentas</a></p><a class="button" href="/">Voltar para o início</a></main>',
    "404.html",
  ).replace('content="index,follow,max-image-preview:large"', 'content="noindex"'),
);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(([p, d]) => `<url><loc>${origin}/${p}</loc><lastmod>${d}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);

for (const file of ["styles.css", "scripts.js", "favicon.ico"]) if (fs.existsSync(file)) fs.copyFileSync(file, out + "/" + file);
fs.copyFileSync("hospedagem/htaccess", out + "/.htaccess");
fs.writeFileSync(out + "/imagens-manifest.json", JSON.stringify(manifesto, null, 1));
const faltando = manifesto.og.filter((o) => !fs.existsSync("." + o.arquivo)).length;
if (faltando) console.warn(`Aviso: ${faltando} imagem(ns) Open Graph faltando. Rode: python3 scripts/gerar-imagens.py`);
fs.cpSync("assets", out + "/assets", { recursive: true });
// Cópia na raiz para hospedagens que servem o repositório diretamente.
for (const file of fs.readdirSync(out)) {
  if (file === "assets" || file === "imagens-manifest.json") continue;
  fs.cpSync(out + "/" + file, file, { recursive: true });
}
console.log(
  `Site gerado: ${artigos.length} guias, ${dicas.length} dicas, ${ferramentas.length} ferramentas, ${donos.size} imagens únicas.`,
);

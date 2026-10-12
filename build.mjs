import fs from "node:fs";
import { imagens } from "./data/imagens.mjs";
import { artigosNovos } from "./data/artigos.mjs";
import { guiasOriginais } from "./data/guias-originais.mjs";
import { hubs } from "./data/hubs.mjs";
import { ferramentas as dadosFerramentas, grupos as gruposFerramentas } from "./data/ferramentas.mjs";
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
const V = { css: versao("styles.css"), js: versao("scripts.js"), print: versao("print.css") };

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
const nav = `<header><a class="brand" href="/"><img src="/assets/logo.webp" alt="Casa e Harmonia" width="150" height="82"></a><nav aria-label="Principal"><a href="/#artigos">Guias</a><a href="/dicas.html">Dicas</a><a href="/ferramentas/">Ferramentas</a><a href="/sobre.html">Sobre</a></nav><a class="header-cta" href="/ferramentas/">Ferramentas grátis <span>↗</span></a></header>`;
const footer = `<footer><div><strong>CASA E HARMONIA</strong><p>Ideias para morar bem. Espaço para viver melhor.</p></div><div><b>Explore</b><a href="/#artigos">Guias da casa</a><a href="/dicas.html">Dicas do dia a dia</a><a href="/ferramentas/">Ferramentas gratuitas</a></div><div><b>Mais lidos</b><a href="/artigos/como-tirar-mofo-da-parede.html">Tirar mofo da parede</a><a href="/artigos/economizar-conta-de-luz.html">Economizar na conta de luz</a><a href="/artigos/quantos-btus-ar-condicionado.html">Quantos BTUs preciso?</a><a href="/artigos/como-limpar-sofa.html">Como limpar o sofá</a></div><div><b>Temas</b>${hubs.map((h) => `<a href="${hubUrl(h)}">${h.nome}</a>`).join("")}</div><div><b>Portal</b><a href="/sobre.html">Sobre e privacidade</a></div><small>© 2026 Casa e Harmonia · Feito para a vida em casa.</small></footer>`;
const ogDe = (path) => (path === "index.html" ? "home" : path.replace(/\/index\.html$/, "").replace(/\.html$/, "").replace(/\//g, "-"));
function page(title, desc, body, path, schema = {}, { image = "hero", type, eyebrow = "Casa e Harmonia" } = {}) {
  if (!path.startsWith("404")) valida(path, title, desc);
  const canon = path === "index.html" ? origin + "/" : `${origin}/${path.replace(/index\.html$/, "")}`;
  const ogKey = ogDe(path);
  const ogFile = `/assets/og/${ogKey}.jpg`;
  const foto = imagens[image]?.src.startsWith("/assets/") ? imagens[image].src : null;
  if (!path.startsWith("404")) manifesto.og.push({ arquivo: ogFile, titulo: title.replace(/ \| Casa e Harmonia$/, ""), eyebrow, foto });
  const og = origin + ogFile;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canon}"><meta property="og:site_name" content="Casa e Harmonia"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="${type || (path.startsWith("artigos/") ? "article" : "website")}"><meta property="og:url" content="${canon}"><meta property="og:locale" content="pt_BR"><meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="675"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${og}"><meta name="theme-color" content="#2d503e"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32"><link rel="icon" href="/assets/icone-192.png" type="image/png" sizes="192x192"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="preload" href="/assets/fontes/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preconnect" href="https://images.pexels.com"><link rel="stylesheet" href="/styles.css?v=${V.css}"><link rel="stylesheet" href="/print.css?v=${V.print}" media="print"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", ...schema }).replaceAll("</", "<\\/")}</script><script src="/scripts.js?v=${V.js}" defer></script></head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a>${nav}${body.replace(/<main(?=[ >])/, '<main id="conteudo"')}${footer}</body></html>`;
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
// Metadados das ferramentas (cards e links), a partir de data/ferramentas.mjs.
const ferramentas = dadosFerramentas.map((t) => [t.id, t.icone, t.nome, t.resumo, t.slug]);
const toolGrid = (lista) =>
  `<div class="tool-grid">${lista.map(([id, icon, h, p]) => `<a href="${toolUrl(id)}" data-evento="clicou_ferramenta"><span class="tool-icon" aria-hidden="true">${icon}</span><div><h3>${h}</h3><p>${p}</p></div><b>↗</b></a>`).join("")}</div>`;
const articleCard = (a) =>
  `<a class="article-card" data-category="${esc(a.cat)}" href="/artigos/${a.slug}.html">${img(a.slug, "", { dono: a.slug, sizes: "(max-width: 600px) 100vw, 33vw" })}<div><span class="eyebrow">${a.cat}${a.novo ? " · NOVO" : ""}</span><h3>${a.card}</h3><p>${a.intro.split(". ")[0]}.</p><span class="read">Ler o guia <b>↗</b></span></div></a>`;
const tipCard = ([cat, h, p, link]) =>
  `<article class="tip-card" data-category="${esc(cat)}"><span class="eyebrow">${cat}</span><h3>${h}</h3><p>${p}</p>${link ? `<a href="${link}">Saiba mais ↗</a>` : ""}</article>`;
const searchTools = (id, label, placeholder, cats, total, nome) =>
  `<div class="search-tools" data-search="${id}"><label for="${id}-search">${label}<input id="${id}-search" type="search" placeholder="${placeholder}"></label><label for="${id}-filter">Filtrar por categoria<select id="${id}-filter"><option value="">Todas</option>${cats.map((c) => `<option>${c}</option>`).join("")}</select></label></div><p id="${id}-count" class="search-count" role="status" data-label="${nome}">${total} ${nome}</p>`;
const uniq = (arr) => [...new Set(arr)];
// Endereço de cada ferramenta: página própria em /ferramentas/{slug}/ (id = âncora legada de /ferramentas.html#id).
const toolUrl = (id) => `/ferramentas/${(dadosFerramentas.find((t) => t.id === id || t.slug === id) || falha(`Ferramenta inexistente: ${id}`)).slug}/`;

// ---------- Home ----------
write(
  "index.html",
  page(
    "Casa e Harmonia | Guias, dicas e ferramentas para sua casa",
    "Decoração, limpeza, organização e ferramentas grátis: calcule tinta, BTUs, conta de luz, piso, papel de parede e churrasco. Ideias práticas para morar bem.",
    `<main><section class="hero"><div class="hero-copy"><p class="eyebrow">INSPIRAÇÃO PARA A VIDA REAL</p><h1>Mais cor. Mais calma.<br><em>Mais a sua casa.</em></h1><p>Guias de decoração, limpeza e organização e calculadoras grátis para a casa: tinta, BTU de ar-condicionado, conta de luz, piso e muito mais, com dicas práticas para morar melhor.</p><a class="button" href="#artigos">Encontre sua inspiração <span>↗</span></a><div class="hero-stats"><span><b>${artigos.length}</b> guias</span><span><b>${ferramentas.length}</b> ferramentas</span><span><b>${dicas.length}</b> dicas</span></div></div><a class="hero-image" href="/artigos/cores-sala-pequena.html">${img("hero", "hero-cover", { eager: true, dono: "home" })}<span class="image-label">SALA COM PERSONALIDADE <b>Monte sua paleta de cores ↗</b></span></a></section><nav class="category-strip" aria-label="Temas"><span>UM LAR, MUITAS POSSIBILIDADES</span>${hubs.map((h) => `<a href="${hubUrl(h)}">${h.nome}</a>`).join("")}</nav><section class="tools-band"><div class="section-head"><div><p class="eyebrow">DO PLANO À PRÁTICA</p><h2>Ferramentas gratuitas, sem cadastro.</h2></div><a href="/ferramentas/">Todas as ${ferramentas.length} ferramentas ↗</a></div>${toolGrid(ferramentas.slice(0, 6))}</section><section id="artigos" class="articles"><div class="section-head"><div><p class="eyebrow">IDEIAS PARA O SEU PRÓXIMO CAPÍTULO</p><h2>Guias práticos para cada canto da casa.</h2></div><span>${artigos.length} guias para morar melhor</span></div>${searchTools("article", "O que você quer resolver?", "Busque por mofo, sofá, luz, plantas…", uniq(artigos.map((a) => a.cat)), artigos.length, "guias")}<div class="article-grid" data-grid="article">${[...artigos].reverse().map(articleCard).join("")}</div><p id="article-empty" class="empty" hidden>Nenhum guia encontrado. Experimente outro termo ou escolha todas as categorias.</p></section><section class="tips-band"><div class="section-head"><div><p class="eyebrow">DICAS DO DIA A DIA</p><h2>Pequenos truques, grande diferença.</h2></div><a href="/dicas.html">Ver todas as ${dicas.length} dicas ↗</a></div><div class="tip-grid">${[0, 7, 14, 20, 26, 30].map((i) => tipCard(dicas[i])).join("")}</div></section><section class="closing"><p class="eyebrow">MAIS INTENÇÃO, MENOS EXCESSO</p><h2>Uma casa melhor começa<br>com uma ideia possível.</h2><a href="/ferramentas/" class="button">Vamos colocar em prática ↗</a></section></main>`,
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
  const body = `<main class="post"><nav class="breadcrumb" aria-label="Trilha"><a href="/">Início</a> / <a href="${hubUrl(hubDe(a))}">${hubDe(a).nome}</a> / <span>${a.title}</span></nav><p class="eyebrow">${a.cat} · GUIA PRÁTICO</p><h1>${a.title}</h1><p class="intro">${a.intro}</p><p class="byline"><a href="/sobre.html">Redação Casa e Harmonia</a> · Atualizado em ${dataTxt(a.atualizado)}</p><figure class="cover-figure">${img(a.slug, "cover", { eager: true, dono: a.slug, sizes: "(max-width: 900px) 100vw, 1100px" })}<figcaption>${credito(a.slug)}</figcaption></figure><div class="post-layout"><article><nav class="contents" aria-label="Neste artigo"><strong>Neste guia</strong>${a.sections.map((s, j) => `<a href="#sec${j}">${s[0]}</a>`).join("")}<a href="#faq">Perguntas frequentes</a></nav>${a.resumo ? `<aside class="summary"><strong>Resumo rápido</strong><ul>${a.resumo.map((r) => `<li>${r}</li>`).join("")}</ul></aside>` : ""}${a.sections.map((s, j) => `<section id="sec${j}"><h2>${s[0]}</h2>${s[1]}${contexto(j)}</section>`).join("")}<h2 id="faq">Perguntas frequentes sobre ${a.tema}</h2>${a.faq.map((f) => `<details class="faq" open><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}<aside class="post-cta"><p class="eyebrow">SEU PRÓXIMO PASSO</p><p class="cta-title">${a.cta}.</p><a class="button" href="${a.tool[0]}" data-evento="guia_clicou_ferramenta">${a.tool[1]} ↗</a></aside><p class="related-title">Leia também</p><ul class="related">${relacionados.map((b) => `<li><a href="/artigos/${b.slug}.html"><span class="eyebrow">${b.cat}</span>${b.title}</a></li>`).join("")}</ul><h2>Fontes e referências</h2><p>Este guia reúne orientações gerais para adaptar ao seu espaço. Para serviços técnicos, siga os manuais dos produtos e a orientação de um profissional qualificado.</p>${a.sources.map(([l, u]) => `<p><a href="${u}" rel="noopener">${l}</a>.</p>`).join("")}</article><aside class="reading-aside"><p class="eyebrow">FERRAMENTAS GRÁTIS</p><p class="aside-title">Faça as contas antes de começar.</p><ul>${ferramentasDoGuia.map(([id, , h]) => `<li><a href="${toolUrl(id)}" data-evento="guia_clicou_ferramenta">${h} ↗</a></li>`).join("")}</ul><p class="eyebrow">NO DIA A DIA</p><ul><li><a href="/dicas.html">Dicas rápidas para a casa ↗</a></li></ul></aside></div></main>`;
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

// ---------- Ferramentas: índice e uma página por ferramenta ----------
const vJs = (slug) => versao(`js/ferramentas/${slug}.js`);
const legado = Object.fromEntries(dadosFerramentas.map((t) => [t.id, `/ferramentas/${t.slug}/`]));
for (const t of dadosFerramentas) {
  if (!gruposFerramentas.includes(t.grupo)) falha(`Ferramenta ${t.slug}: grupo inválido ${t.grupo}`);
  if (t.faq.length < 4 || t.faq.length > 6) falha(`Ferramenta ${t.slug}: FAQ deve ter de 4 a 6 perguntas`);
  if (!fs.existsSync(`js/ferramentas/${t.slug}.js`)) falha(`Ferramenta ${t.slug}: falta js/ferramentas/${t.slug}.js`);
  const guias = t.guias.map((s) => artigos.find((a) => a.slug === s) || falha(`Ferramenta ${t.slug}: guia inexistente ${s}`));
  const irmas = dadosFerramentas.filter((o) => o.grupo === t.grupo && o.slug !== t.slug);
  const url = `/ferramentas/${t.slug}/`;
  write(
    `ferramentas/${t.slug}/index.html`,
    page(
      t.title,
      t.desc,
      `<main class="post tool-page"><nav class="breadcrumb" aria-label="Trilha"><a href="/">Início</a> / <a href="/ferramentas/">Ferramentas</a> / <span>${t.nome}</span></nav><p class="eyebrow">${t.grupo} · FERRAMENTA GRÁTIS</p><h1>${t.h1}</h1><div class="intro">${t.intro}</div><section class="tool-panel" data-tool="${t.slug}" data-src="/js/ferramentas/${t.slug}.js?v=${vJs(t.slug)}" aria-label="${t.nome}"><form novalidate>${t.form}<button class="button" data-evento="ferramenta_clicou_calcular">Calcular ↗</button><noscript><p class="form-note">Ative o JavaScript para usar a calculadora. A fórmula está logo abaixo.</p></noscript></form><div class="result"><div data-resultado aria-live="polite">${t.resultado}</div><div class="tool-actions" data-acoes hidden><button type="button" class="text-button" data-acao="copiar">Copiar resultado</button><button type="button" class="text-button" data-acao="compartilhar">Compartilhar link</button><button type="button" class="text-button" data-acao="imprimir">Imprimir</button><p class="form-note" data-status role="status"></p></div></div></section><article><h2>Como calculamos</h2>${t.como}<p class="aviso"><b>Atenção:</b> ${t.aviso}</p><h2>Exemplo resolvido</h2>${t.exemplo}<h2 id="faq">Perguntas frequentes: ${t.nome[0].toLowerCase() + t.nome.slice(1)}</h2>${t.faq.map(([q, r]) => `<details class="faq" open><summary>${q}</summary><p>${r}</p></details>`).join("")}<h2>Guias relacionados</h2><ul class="related">${guias.map((g) => `<li><a href="/artigos/${g.slug}.html"><span class="eyebrow">${g.cat}</span>${g.title}</a></li>`).join("")}</ul>${irmas.length ? `<p class="related-title">Outras ferramentas de ${t.grupo.toLowerCase()}</p><ul class="related">${irmas.map((o) => `<li><a href="/ferramentas/${o.slug}/">${o.nome}</a></li>`).join("")}</ul>` : ""}<h2>Fontes</h2>${t.fontes.length ? t.fontes.map(([l, u]) => (u ? `<p><a href="${u}" rel="noopener">${l}</a>.</p>` : `<p>${l}.</p>`)).join("") : "<p>Referências editoriais de uso comum, sem fonte oficial específica. Por isso todas as premissas são editáveis.</p>"}<p>Os cálculos acontecem no seu navegador; nada é enviado ao servidor.</p></article></main>`,
      `ferramentas/${t.slug}/index.html`,
      {
        "@graph": [
          {
            "@type": "WebApplication",
            name: t.nome,
            url: origin + url,
            description: t.desc,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            inLanguage: "pt-BR",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
          },
          {
            "@type": "FAQPage",
            mainEntity: t.faq.map(([q, r]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: r } })),
          },
          breadcrumb([["Início", "/"], ["Ferramentas", "/ferramentas/"], [t.nome, url]]),
        ],
      },
      { eyebrow: `Ferramenta grátis · ${t.grupo}` },
    ),
    t.atualizado,
  );
}
write(
  "ferramentas/index.html",
  page(
    "Ferramentas grátis para casa: calculadoras sem cadastro",
    "Calculadoras grátis para a casa, sem cadastro: tinta, piso, papel de parede, BTU, consumo de energia, orçamento de reforma, churrasco e limpeza.",
    `<main class="tools-page" data-legado='${JSON.stringify(legado)}'><nav class="breadcrumb" aria-label="Trilha"><a href="/">Início</a> / <span>Ferramentas</span></nav><p class="eyebrow">MENOS IMPROVISO, MAIS HARMONIA</p><h1>Ferramentas grátis para a casa</h1><p class="intro">${dadosFerramentas.length} calculadoras e planejadores gratuitos, sem cadastro. Cada ferramenta mostra a fórmula, as premissas e um exemplo resolvido, e os cálculos acontecem no seu navegador.</p>${gruposFerramentas
      .filter((g) => dadosFerramentas.some((t) => t.grupo === g))
      .map((g) => `<section class="tool-group"><h2>${g}</h2>${toolGrid(dadosFerramentas.filter((t) => t.grupo === g).map((t) => [t.id, t.icone, t.nome, t.resumo]))}</section>`)
      .join("")}</main>`,
    "ferramentas/index.html",
    {
      "@graph": [
        {
          "@type": "ItemList",
          name: "Ferramentas Casa e Harmonia",
          itemListElement: dadosFerramentas.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/ferramentas/${t.slug}/`, name: t.nome })),
        },
        breadcrumb([["Início", "/"], ["Ferramentas", "/ferramentas/"]]),
      ],
    },
    { eyebrow: "Ferramentas grátis" },
  ),
  DATAS.ferramentas,
);
// Endereço antigo: a hospedagem responde 301 (ver .htaccess); esta página cobre servidores sem .htaccess
// e preserva âncoras antigas (#tinta → página da ferramenta).
write(
  "ferramentas.html",
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Ferramentas | Casa e Harmonia</title><meta name="robots" content="noindex"><link rel="canonical" href="${origin}/ferramentas/"><script>var m=${JSON.stringify(legado)};location.replace(m[location.hash.slice(1)]||"/ferramentas/");</script><meta http-equiv="refresh" content="0; url=/ferramentas/"></head><body><p><a href="/ferramentas/">Ferramentas do Casa e Harmonia</a></p></body></html>`,
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
    '<main class="post narrow"><h1>Vamos encontrar outro caminho?</h1><p>Esta página não está disponível. Que tal começar por aqui?</p><p><a href="/#artigos">Guias da casa</a> · <a href="/dicas.html">Dicas</a> · <a href="/ferramentas/">Ferramentas</a></p><a class="button" href="/">Voltar para o início</a></main>',
    "404.html",
  ).replace('content="index,follow,max-image-preview:large"', 'content="noindex"'),
);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(([p, d]) => `<url><loc>${origin}/${p}</loc><lastmod>${d}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);

for (const file of ["styles.css", "scripts.js", "print.css", "favicon.ico"]) if (fs.existsSync(file)) fs.copyFileSync(file, out + "/" + file);
fs.cpSync("js", out + "/js", { recursive: true });
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

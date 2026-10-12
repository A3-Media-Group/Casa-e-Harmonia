/* Casa e Harmonia — script do site (busca, eventos e base das ferramentas).
 * As calculadoras ficam em js/ferramentas/{slug}.js e só são carregadas na página que tem
 * um elemento [data-tool]. Nada é enviado a servidores: cálculos e marcações ficam no navegador. */
var CH = (globalThis.CH = globalThis.CH || {});
var temDom = typeof document !== "undefined" && typeof document.querySelector === "function";

/* ------------------------------ Utilitários ------------------------------ */
// Aceita "2,5", "2.5" e "1.234,5". Vazio vira NaN.
CH.num = (v) => {
  if (typeof v === "number") return v;
  let s = String(v == null ? "" : v).trim().replace(/\s/g, "");
  if (!s) return NaN;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  return /^-?\d*\.?\d+$/.test(s) ? Number(s) : NaN;
};
CH.fmt = (v, d = 2) => v.toLocaleString("pt-BR", { maximumFractionDigits: d });
CH.moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
CH.esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
CH.norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
CH.arred2 = (v) => Math.round(Number((v * 100).toPrecision(14))) / 100;
// Exige número finito dentro dos limites; a mensagem nomeia o campo.
CH.exigir = (v, nome, { min = -Infinity, max = Infinity, inteiro = false, minExclusivo = false } = {}) => {
  if (!Number.isFinite(v)) throw Error(`Preencha ${nome} com um número.`);
  if (minExclusivo ? v <= min : v < min) throw Error(`${nome[0].toUpperCase() + nome.slice(1)} deve ser ${minExclusivo ? "maior que" : "no mínimo"} ${CH.fmt(min)}.`);
  if (v > max) throw Error(`${nome[0].toUpperCase() + nome.slice(1)} deve ser no máximo ${CH.fmt(max)}.`);
  if (inteiro && !Number.isInteger(v)) throw Error(`${nome[0].toUpperCase() + nome.slice(1)} deve ser um número inteiro.`);
  return v;
};

/* ------------------- Eventos para medição futura (sem tracker) ------------------- */
// Empilha eventos em window.dataLayer. Sem Google Analytics instalado, nada sai do navegador.
CH.evento = (nome, dados = {}) => {
  globalThis.dataLayer = globalThis.dataLayer || [];
  globalThis.dataLayer.push({ event: nome, ...dados });
};

/* ------------------------------ Ferramentas ------------------------------ */
CH.ferramentas = CH.ferramentas || {};
CH.registrar = (slug, def) => {
  CH.ferramentas[slug] = def;
  if (temDom && document.querySelector(`[data-tool="${slug}"]`)) iniciarFerramenta(slug, def);
};

function lerCampos(form) {
  const v = {};
  form.querySelectorAll("[name]").forEach((el) => {
    if (el.type === "checkbox") v[el.name] = el.checked;
    else if (el.inputMode === "decimal" || el.inputMode === "numeric") v[el.name] = CH.num(el.value);
    else v[el.name] = el.value;
  });
  return v;
}

function iniciarFerramenta(slug, def) {
  const root = document.querySelector(`[data-tool="${slug}"]`);
  const form = root.querySelector("form");
  const saida = root.querySelector("[data-resultado]");
  const acoes = root.querySelector("[data-acoes]");
  let texto = "";
  if (def.montar) def.montar(root);

  const params = new URLSearchParams(location.search);
  const temParams = [...params.keys()].length > 0;
  if (temParams) {
    form.querySelectorAll("[name]").forEach((el) => {
      if (!params.has(el.name)) return;
      if (el.type === "checkbox") el.checked = params.get(el.name) === "1";
      else el.value = params.get(el.name);
    });
    if (def.restaurar) def.restaurar(root, params);
  }

  function atualizarUrl() {
    const q = new URLSearchParams();
    form.querySelectorAll("[name]").forEach((el) => {
      if (el.type === "checkbox") {
        if (el.checked) q.set(el.name, "1");
      } else if (el.value !== "") q.set(el.name, el.value);
    });
    if (def.serializar) for (const [k, val] of Object.entries(def.serializar(root))) q.set(k, val);
    history.replaceState(null, "", `${location.pathname}?${q}`);
  }

  function calcular(registrar = true) {
    try {
      const r = def.calcular(lerCampos(form), root);
      saida.innerHTML = r.html;
      if (r.depois) r.depois(saida);
      texto = r.texto || saida.textContent.trim();
      if (acoes) acoes.hidden = false;
      atualizarUrl();
      if (registrar) CH.evento("ferramenta_calculou", { ferramenta: slug });
    } catch (erro) {
      saida.innerHTML = `<p class="error" role="alert">${CH.esc(erro.message)}</p>`;
      if (acoes) acoes.hidden = true;
    }
  }
  CH.recalcular = calcular;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calcular();
  });
  if (def.automatico) form.addEventListener("change", () => calcular(false));

  if (acoes) {
    acoes.addEventListener("click", async (e) => {
      const b = e.target.closest("button[data-acao]");
      if (!b) return;
      const status = acoes.querySelector("[data-status]");
      const mensagem = `${document.title}\n${texto}\n${location.href}`;
      if (b.dataset.acao === "imprimir") return window.print();
      try {
        if (b.dataset.acao === "compartilhar" && navigator.share) {
          await navigator.share({ title: document.title, text: texto, url: location.href });
        } else {
          await navigator.clipboard.writeText(b.dataset.acao === "compartilhar" ? location.href : mensagem);
          status.textContent = b.dataset.acao === "compartilhar" ? "Link copiado." : "Resultado copiado.";
        }
        CH.evento("ferramenta_compartilhou", { ferramenta: slug, acao: b.dataset.acao });
      } catch {
        status.textContent = "Não foi possível copiar automaticamente. Copie o endereço da barra do navegador.";
      }
    });
  }
  if (temParams || def.automatico) calcular(false);
}

if (temDom) {
  // Carrega o script da ferramenta presente na página (data-tool + data-src versionado).
  const alvo = document.querySelector("[data-tool][data-src]");
  if (alvo) {
    const s = document.createElement("script");
    s.src = alvo.dataset.src;
    s.defer = true;
    document.head.append(s);
  }

  // Links antigos /ferramentas.html#tinta → página própria da ferramenta.
  const legado = document.querySelector("[data-legado]");
  if (legado && location.hash) {
    const destino = JSON.parse(legado.dataset.legado)[location.hash.slice(1)];
    if (destino) location.replace(destino);
  }

  // Eventos de clique marcados com data-evento (ex.: guia_clicou_ferramenta).
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-evento]");
    if (el) CH.evento(el.dataset.evento, { destino: el.getAttribute("href") || "", origem: location.pathname });
  });

  /* ---------------------------- Busca e filtros ---------------------------- */
  document.querySelectorAll("[data-search]").forEach((box) => {
    const id = box.dataset.search;
    const grid = document.querySelector(`[data-grid="${id}"]`);
    if (!grid) return;
    const cards = [...grid.children];
    const $ = (x) => document.getElementById(x);
    const count = $(`${id}-count`);
    const filter = () => {
      const q = CH.norm($(`${id}-search`).value.trim()),
        cat = $(`${id}-filter`).value;
      let total = 0;
      cards.forEach((c) => {
        c.hidden = !(CH.norm(c.textContent).includes(q) && (!cat || c.dataset.category === cat));
        if (!c.hidden) total++;
      });
      count.textContent = `Resultados: ${total} ${count.dataset.label}`;
      $(`${id}-empty`).hidden = total > 0;
    };
    $(`${id}-search`).addEventListener("input", filter);
    $(`${id}-filter`).addEventListener("change", filter);
  });
}

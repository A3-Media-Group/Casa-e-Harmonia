/* Calculadora de tinta. Funções puras em fn (testadas em tests.mjs). */
(function () {
  function paint(walls, openings, coats, yieldRate, waste) {
    if (!walls.length) throw Error("Adicione pelo menos uma parede.");
    walls.forEach(([w, h], i) => {
      CH.exigir(w, `a largura da parede ${i + 1}`, { min: 0, minExclusivo: true });
      CH.exigir(h, `a altura da parede ${i + 1}`, { min: 0, minExclusivo: true });
    });
    CH.exigir(openings, "a área de portas e janelas", { min: 0 });
    CH.exigir(coats, "o número de demãos", { min: 1, max: 10, inteiro: true });
    CH.exigir(yieldRate, "o rendimento", { min: 0, minExclusivo: true });
    CH.exigir(waste, "a margem", { min: 0, max: 100 });
    const area = walls.reduce((s, [w, h]) => s + w * h, 0) - openings;
    if (area <= 0) throw Error("A área de portas e janelas deve ser menor que a soma das paredes.");
    return { area, liters: Math.ceil(Number((((area * coats) / yieldRate) * (1 + waste / 100) * 100).toPrecision(14))) / 100 };
  }
  // Lata 18 L, galão 3,6 L e quarto 0,9 L: menor volume que cobre a necessidade; no empate, menos embalagens.
  function cans(liters) {
    CH.exigir(liters, "a quantidade de tinta", { min: 0, minExclusivo: true });
    let best = null;
    for (let a = 0; a <= Math.ceil(liters / 18); a++)
      for (let b = 0; b <= 5; b++)
        for (let c = 0; c <= 4; c++) {
          const total = CH.arred2(a * 18 + b * 3.6 + c * 0.9);
          if (total + 1e-9 < liters) continue;
          const items = a + b + c;
          if (!best || total < best.total - 1e-9 || (Math.abs(total - best.total) < 1e-9 && items < best.items))
            best = { lata: a, galao: b, quarto: c, total, items };
        }
    return best;
  }
  const linha = (w = "3", h = "2,7") => {
    const row = document.createElement("div");
    row.className = "wall-row";
    row.innerHTML = `<label class="campo"><span>Largura</span><span class="input-unit"><input type="text" inputmode="decimal" value="${CH.esc(w)}" aria-label="Largura da parede (m)"><em>m</em></span></label><label class="campo"><span>Altura</span><span class="input-unit"><input type="text" inputmode="decimal" value="${CH.esc(h)}" aria-label="Altura da parede (m)"><em>m</em></span></label><button type="button" class="text-button" aria-label="Remover parede">Remover</button>`;
    row.querySelector("button").onclick = () => row.remove();
    return row;
  };
  const paredes = (root) => [...root.querySelectorAll(".wall-row")].map((r) => [...r.querySelectorAll("input")].map((i) => CH.num(i.value)));
  CH.registrar("calculadora-de-tinta", {
    fn: { paint, cans },
    montar(root) {
      const box = root.querySelector("#walls");
      box.append(linha("4", "2,7"));
      root.querySelector('[data-acao="add-parede"]').onclick = () => box.append(linha());
      const modo = root.querySelector('[name="modo"]');
      const sync = () => (root.querySelector('[name="demaos"]').disabled = modo.value === "acabado");
      modo.addEventListener("change", sync);
      sync();
    },
    restaurar(root, p) {
      const v = p.get("paredes");
      if (!v) return;
      const box = root.querySelector("#walls");
      box.replaceChildren(...v.split("_").map((par) => linha(...par.split("x"))));
      root.querySelector('[name="demaos"]').disabled = root.querySelector('[name="modo"]').value === "acabado";
    },
    serializar: (root) => ({ paredes: [...root.querySelectorAll(".wall-row")].map((r) => [...r.querySelectorAll("input")].map((i) => i.value.trim()).join("x")).join("_") }),
    calcular(v, root) {
      const acabado = v.modo === "acabado";
      const r = paint(paredes(root), v.vaos, acabado ? 1 : v.demaos, v.rendimento, v.margem);
      const c = cans(r.liters);
      const partes = [c.lata && `${c.lata} lata(s) de 18 L`, c.galao && `${c.galao} galão(ões) de 3,6 L`, c.quarto && `${c.quarto} quarto(s) de 0,9 L`].filter(Boolean).join(" + ");
      const custo = Number.isFinite(v.preco) && v.preco > 0 ? ` Custo estimado: ${CH.moeda((c.total / 3.6) * v.preco)}.` : "";
      return {
        html: `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${CH.fmt(r.liters)} <small>litros</small></div><p>Área líquida: ${CH.fmt(r.area)} m² · ${acabado ? "rendimento acabado (demãos incluídas)" : `${v.demaos} demão(s)`} · margem de ${CH.fmt(v.margem)}%.</p><p class="highlight"><b>Sugestão de compra:</b> ${partes} (${CH.fmt(c.total)} L).${custo}</p>`,
        texto: `Tinta: ${CH.fmt(r.liters)} L para ${CH.fmt(r.area)} m². Compra sugerida: ${partes}.`,
      };
    },
  });
})();

/* Simulador de orçamento de reforma (custos ilustrativos, editáveis). */
(function () {
  const TIPOS = {
    pintura: [35, "m² de parede", "m²"],
    piso: [150, "m² de piso", "m²"],
    revestimento: [160, "m² de revestimento", "m²"],
    forro: [90, "m² de forro", "m²"],
    luz: [180, "pontos de luz", "ponto"],
    marcenaria: [1500, "metros lineares", "metro linear"],
  };
  function budget(q, unit, reserve, inteiro = false) {
    CH.exigir(q, "a quantidade", { min: 0, minExclusivo: true, inteiro });
    CH.exigir(unit, "o custo unitário", { min: 0, minExclusivo: true });
    CH.exigir(reserve, "a reserva", { min: 0, max: 100 });
    const base = q * unit;
    return { base, total: base * (1 + reserve / 100) };
  }
  CH.registrar("simulador-de-orcamento-de-reforma", {
    fn: { budget },
    montar(root) {
      const servico = root.querySelector('[name="servico"]');
      servico.addEventListener("change", () => {
        const [preco] = TIPOS[servico.value];
        root.querySelector('[name="unitario"]').value = String(preco);
        root.querySelector('[name="quantidade"]').value = servico.value === "luz" ? "4" : servico.value === "marcenaria" ? "3" : "30";
      });
    },
    calcular(v) {
      const [, unidade, singular] = TIPOS[v.servico] || TIPOS.pintura;
      const r = budget(v.quantidade, v.unitario, v.reserva, v.servico === "luz");
      return {
        html: `<p class="eyebrow">${CH.esc(v.comodo.toUpperCase())} · ESTIMATIVA</p><div class="number">${CH.moeda(r.total)}</div><p>${CH.fmt(v.quantidade)} ${unidade} × ${CH.moeda(v.unitario)} por ${singular} = ${CH.moeda(r.base)}<br>Reserva (${CH.fmt(v.reserva)}%): ${CH.moeda(r.total - r.base)}</p><p>Referência de planejamento, não cotação.</p>`,
        texto: `Reforma (${v.comodo}): ${CH.moeda(r.total)}, incluindo ${CH.fmt(v.reserva)}% de reserva.`,
      };
    },
  });
})();

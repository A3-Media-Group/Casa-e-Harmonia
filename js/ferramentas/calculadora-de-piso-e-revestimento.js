/* Calculadora de piso e revestimento: caixas, rodapé e argamassa. */
(function () {
  function floor(w, l, waste, box) {
    CH.exigir(w, "a largura", { min: 0, minExclusivo: true, max: 1000 });
    CH.exigir(l, "o comprimento", { min: 0, minExclusivo: true, max: 1000 });
    CH.exigir(waste, "a margem", { min: 0, max: 100 });
    CH.exigir(box, "a cobertura por caixa", { min: 0, minExclusivo: true });
    const area = w * l,
      buy = area * (1 + waste / 100),
      boxes = Math.ceil(Number((buy / box).toPrecision(14)));
    return { area, buy, boxes, purchased: boxes * box };
  }
  function floorExtras(w, l, doors, kgPorM2 = 4, saco = 20) {
    CH.exigir(doors, "a largura das portas", { min: 0 });
    CH.exigir(kgPorM2, "o consumo de argamassa", { min: 0, minExclusivo: true });
    CH.exigir(saco, "o peso do saco", { min: 0, minExclusivo: true });
    const perimeter = Math.max(0, 2 * (w + l) - doors);
    return {
      baseboard: Math.ceil(Number((perimeter * 1.1).toPrecision(14))),
      mortarBags: Math.ceil(Number(((w * l * kgPorM2) / saco).toPrecision(14))),
    };
  }
  CH.registrar("calculadora-de-piso-e-revestimento", {
    fn: { floor, floorExtras },
    calcular(v) {
      const r = floor(v.largura, v.comprimento, v.margem, v.caixa);
      const x = floorExtras(v.largura, v.comprimento, v.portas, v.argamassa, v.saco);
      const custo = Number.isFinite(v.preco) && v.preco > 0 ? `<br>Custo do piso: ${CH.moeda(r.purchased * v.preco)}` : "";
      return {
        html: `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${r.boxes} <small>caixas</small></div><p>Área: ${CH.fmt(r.area)} m² · com margem: ${CH.fmt(r.buy)} m² · em caixas inteiras: ${CH.fmt(r.purchased)} m²</p><p class="highlight">Rodapé: ${x.baseboard} m lineares · Argamassa: ${x.mortarBags} saco(s) de ${CH.fmt(v.saco, 0)} kg${custo}</p>`,
        texto: `Piso: ${r.boxes} caixas (${CH.fmt(r.purchased)} m²), ${x.baseboard} m de rodapé, ${x.mortarBags} saco(s) de argamassa.`,
      };
    },
  });
})();

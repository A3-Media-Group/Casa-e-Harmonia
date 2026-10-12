/* Calculadora de iluminação: lúmens = lux × área ÷ fator. */
(function () {
  function iluminacao(lux, area, lmLampada, fator) {
    CH.exigir(lux, "a iluminância", { min: 1, max: 5000 });
    CH.exigir(area, "a área", { min: 0, minExclusivo: true, max: 10000 });
    CH.exigir(lmLampada, "o fluxo da lâmpada", { min: 1, max: 100000 });
    CH.exigir(fator, "o fator de aproveitamento", { min: 0, minExclusivo: true, max: 1 });
    const lumens = (lux * area) / fator;
    return { lumens, lampadas: Math.ceil(Number((lumens / lmLampada).toPrecision(12))) };
  }
  CH.registrar("calculadora-de-iluminacao", {
    fn: { iluminacao },
    montar(root) {
      const sel = root.querySelector('[name="comodo"]');
      sel.addEventListener("change", () => (root.querySelector('[name="lux"]').value = String(parseInt(sel.value, 10))));
    },
    calcular(v) {
      const r = iluminacao(v.lux, v.area, v.lumens, v.fator);
      return {
        html: `<p class="eyebrow">LUZ NECESSÁRIA</p><div class="number">${CH.fmt(r.lumens, 0)} <small>lúmens</small></div><p class="highlight">${r.lampadas} lâmpada(s) de ${CH.fmt(v.lumens, 0)} lm.</p><p>${CH.fmt(v.lux, 0)} lx × ${CH.fmt(v.area)} m² ÷ ${CH.fmt(v.fator)}. Distribua as lâmpadas pelo ambiente e use luz de tarefa onde precisar de mais.</p>`,
        texto: `Iluminação: ${CH.fmt(r.lumens, 0)} lm, ${r.lampadas} lâmpada(s) de ${CH.fmt(v.lumens, 0)} lm.`,
      };
    },
  });
})();

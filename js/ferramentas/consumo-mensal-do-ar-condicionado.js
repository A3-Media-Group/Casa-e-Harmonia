/* Consumo mensal do ar-condicionado: pela potência ou pela etiqueta (ciclo de 2.080 h/ano). */
(function () {
  const CICLO = 2080;
  function ar(modo, watts, anual, horas, dias, tarifa, bandeira = 0) {
    CH.exigir(horas, "as horas por dia", { min: 0, max: 24 });
    CH.exigir(dias, "os dias de uso", { min: 0, max: 31, inteiro: true });
    CH.exigir(tarifa, "a tarifa", { min: 0, minExclusivo: true, max: 10 });
    let kwhHora;
    if (modo === "etiqueta") kwhHora = CH.exigir(anual, "o consumo anual", { min: 1, max: 50000 }) / CICLO;
    else kwhHora = CH.exigir(watts, "a potência", { min: 1, max: 20000 }) / 1000;
    const kwh = kwhHora * horas * dias;
    return { kwhHora, kwh, custo: kwh * (tarifa + bandeira) };
  }
  CH.registrar("consumo-mensal-do-ar-condicionado", {
    fn: { ar },
    calcular(v) {
      const r = ar(v.modo, v.potencia, v.anual, v.horas, v.dias, v.tarifa, CH.num(v.bandeira));
      return {
        html: `<p class="eyebrow">ESTIMATIVA MENSAL</p><div class="number">${CH.moeda(r.custo)}</div><p>${CH.fmt(r.kwh, 1)} kWh por mês · ${CH.fmt(r.kwhHora, 3)} kWh por hora de uso (${v.modo === "etiqueta" ? "pela etiqueta, ciclo de 2.080 h/ano" : "pela potência elétrica"}).</p><p>Dimensionou o aparelho? Use a <a href="/ferramentas/calculadora-de-btu/">calculadora de BTU</a>.</p>`,
        texto: `Ar-condicionado: ${CH.fmt(r.kwh, 1)} kWh/mês, ${CH.moeda(r.custo)}.`,
      };
    },
  });
})();

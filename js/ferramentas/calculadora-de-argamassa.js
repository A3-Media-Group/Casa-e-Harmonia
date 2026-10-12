/* Calculadora de argamassa colante. */
(function () {
  function argamassa(area, kgM2, saco, perda) {
    CH.exigir(area, "a área", { min: 0, minExclusivo: true, max: 100000 });
    CH.exigir(kgM2, "o consumo por m²", { min: 0, minExclusivo: true, max: 30 });
    CH.exigir(saco, "o peso do saco", { min: 1, max: 100 });
    CH.exigir(perda, "a perda", { min: 0, max: 50 });
    const kg = area * kgM2 * (1 + perda / 100);
    return { kg, sacos: Math.ceil(Number((kg / saco).toPrecision(12))) };
  }
  CH.registrar("calculadora-de-argamassa", {
    fn: { argamassa },
    calcular(v) {
      const consumo = v.aplicacao === "outro" ? v.consumo : CH.num(v.aplicacao);
      const r = argamassa(v.area, consumo, v.saco, v.perda);
      return {
        html: `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${r.sacos} <small>saco(s) de ${CH.fmt(v.saco, 0)} kg</small></div><p>${CH.fmt(r.kg, 1)} kg para ${CH.fmt(v.area)} m² a ${CH.fmt(consumo)} kg/m², com ${CH.fmt(v.perda)}% de perda.</p><p>Para o rejunte, use a <a href="/ferramentas/calculadora-de-rejunte/">calculadora de rejunte</a>; para as caixas de piso, a <a href="/ferramentas/calculadora-de-piso-e-revestimento/">calculadora de piso</a>.</p>`,
        texto: `Argamassa colante: ${r.sacos} saco(s) de ${CH.fmt(v.saco, 0)} kg (${CH.fmt(r.kg, 1)} kg).`,
      };
    },
  });
})();

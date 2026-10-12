/* Calculadora de tijolos e blocos (alvenaria de vedação). */
(function () {
  function blocos(comp, alt, vaos, bc, bh, be, junta, perda) {
    CH.exigir(comp, "o comprimento da parede", { min: 0, minExclusivo: true, max: 1000 });
    CH.exigir(alt, "a altura da parede", { min: 0, minExclusivo: true, max: 30 });
    CH.exigir(vaos, "a área de portas e janelas", { min: 0 });
    CH.exigir(bc, "o comprimento do bloco", { min: 1, max: 100 });
    CH.exigir(bh, "a altura do bloco", { min: 1, max: 100 });
    CH.exigir(be, "a espessura do bloco", { min: 1, max: 60 });
    CH.exigir(junta, "a junta", { min: 0, max: 5 });
    CH.exigir(perda, "a perda", { min: 0, max: 50 });
    const area = comp * alt - vaos;
    if (area <= 0) throw Error("A área de portas e janelas deve ser menor que a área da parede.");
    const porM2 = 1 / (((bc + junta) / 100) * ((bh + junta) / 100));
    const total = Math.ceil(Number((area * porM2 * (1 + perda / 100)).toPrecision(12)));
    const fracJunta = 1 - (bc * bh) / ((bc + junta) * (bh + junta));
    const argamassaL = area * (be / 100) * fracJunta * 1000;
    return { area, porM2, total, argamassaL };
  }
  CH.registrar("calculadora-de-tijolos-e-blocos", {
    fn: { blocos },
    calcular(v) {
      const r = blocos(v.comprimento, v.altura, v.vaos, v.bc, v.bh, v.be, v.junta, v.perda);
      return {
        html: `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${r.total} <small>blocos</small></div><p>Área líquida: ${CH.fmt(r.area)} m² · ${CH.fmt(r.porM2, 2)} blocos/m² · perda de ${CH.fmt(v.perda)}%.</p><p class="highlight">Argamassa de assentamento: cerca de ${CH.fmt(r.argamassaL, 0)} litros (${CH.fmt(r.argamassaL / 1000, 3)} m³).</p><p>Somente alvenaria de vedação. Estrutura exige profissional habilitado.</p>`,
        texto: `Alvenaria: ${r.total} blocos para ${CH.fmt(r.area)} m² (${CH.fmt(r.porM2, 2)} por m²), cerca de ${CH.fmt(r.argamassaL, 0)} L de argamassa.`,
      };
    },
  });
})();

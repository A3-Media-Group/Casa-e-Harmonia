/* Calculadora de rejunte: volume das juntas × densidade. */
(function () {
  function rejunte(cCm, lCm, eMm, jMm, area, perda, dens) {
    CH.exigir(cCm, "o comprimento da peça", { min: 1, max: 400 });
    CH.exigir(lCm, "a largura da peça", { min: 1, max: 400 });
    CH.exigir(eMm, "a espessura da peça", { min: 1, max: 50 });
    CH.exigir(jMm, "a largura da junta", { min: 0.5, max: 30 });
    CH.exigir(area, "a área", { min: 0, minExclusivo: true, max: 100000 });
    CH.exigir(perda, "a perda", { min: 0, max: 50 });
    CH.exigir(dens, "a densidade", { min: 0.5, max: 3 });
    const C = cCm * 10, L = lCm * 10;
    const kgM2 = ((C + L) / (C * L)) * jMm * eMm * dens;
    const total = kgM2 * area * (1 + perda / 100);
    return { kgM2, total, emb1: Math.ceil(Number(total.toPrecision(12))), emb5: Math.ceil(Number((total / 5).toPrecision(12))) };
  }
  CH.registrar("calculadora-de-rejunte", {
    fn: { rejunte },
    calcular(v) {
      const r = rejunte(v.pc, v.pl, v.espessura, v.junta, v.area, v.perda, v.densidade);
      return {
        html: `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${CH.fmt(r.total)} <small>kg</small></div><p>Consumo: ${CH.fmt(r.kgM2, 3)} kg/m² · com ${CH.fmt(v.perda)}% de perda.</p><p class="highlight">Compra: ${r.emb5} embalagem(ns) de 5 kg ou ${r.emb1} de 1 kg.</p><p>Para a argamassa de assentamento, use a <a href="/ferramentas/calculadora-de-argamassa/">calculadora de argamassa colante</a>.</p>`,
        texto: `Rejunte: ${CH.fmt(r.total)} kg (${CH.fmt(r.kgM2, 3)} kg/m²); ${r.emb5} embalagem(ns) de 5 kg.`,
      };
    },
  });
})();

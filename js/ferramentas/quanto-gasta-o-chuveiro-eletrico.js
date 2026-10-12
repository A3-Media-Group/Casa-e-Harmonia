/* Quanto gasta o chuveiro elétrico. */
(function () {
  function chuveiro(watts, minutos, banhos, dias, tarifa, bandeira = 0) {
    CH.exigir(watts, "a potência", { min: 1, max: 15000 });
    CH.exigir(minutos, "os minutos por banho", { min: 0, max: 120 });
    CH.exigir(banhos, "os banhos por dia", { min: 0, max: 50, inteiro: true });
    CH.exigir(dias, "os dias no mês", { min: 0, max: 31, inteiro: true });
    CH.exigir(tarifa, "a tarifa", { min: 0, minExclusivo: true, max: 10 });
    const kwh = (watts * (minutos / 60) * banhos * dias) / 1000;
    const kwhMenos2 = (watts * (Math.max(0, minutos - 2) / 60) * banhos * dias) / 1000;
    return { kwh, custo: kwh * (tarifa + bandeira), kwhMenos2, economia: (kwh - kwhMenos2) * (tarifa + bandeira) };
  }
  CH.registrar("quanto-gasta-o-chuveiro-eletrico", {
    fn: { chuveiro },
    calcular(v) {
      const r = chuveiro(v.potencia, v.minutos, v.banhos, v.dias, v.tarifa, CH.num(v.bandeira));
      return {
        html: `<p class="eyebrow">CUSTO DO BANHO</p><div class="number">${CH.moeda(r.custo)} <small>por mês</small></div><p>${CH.fmt(r.kwh, 1)} kWh por mês.</p><p class="highlight">Com 2 minutos a menos por banho: ${CH.fmt(r.kwhMenos2, 1)} kWh, economia de ${CH.moeda(r.economia)} por mês.</p>`,
        texto: `Chuveiro: ${CH.fmt(r.kwh, 1)} kWh/mês, ${CH.moeda(r.custo)}. Com 2 minutos a menos: economia de ${CH.moeda(r.economia)}.`,
      };
    },
  });
})();

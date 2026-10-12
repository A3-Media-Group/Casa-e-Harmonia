/* Calculadora de papel de parede com rapport. */
(function () {
  function wallpaper(width, height, discount, rollWidth, rollLength, repeatCm) {
    CH.exigir(width, "a largura das paredes", { min: 0, minExclusivo: true, max: 500 });
    CH.exigir(height, "a altura", { min: 0, minExclusivo: true, max: 20 });
    CH.exigir(discount, "a largura a descontar", { min: 0 });
    CH.exigir(rollWidth, "a largura do rolo", { min: 0, minExclusivo: true });
    CH.exigir(rollLength, "o comprimento do rolo", { min: 0, minExclusivo: true });
    CH.exigir(repeatCm, "o rapport", { min: 0, max: 200 });
    const net = width - discount;
    if (net <= 0) throw Error("O desconto deve ser menor que a largura total.");
    const strips = Math.ceil(Number((net / rollWidth).toPrecision(14)));
    const stripLength = height + repeatCm / 100 + 0.1;
    const perRoll = Math.floor(Number((rollLength / stripLength).toPrecision(14)));
    if (perRoll < 1) throw Error("O rolo é mais curto que a altura da parede somada ao rapport.");
    return { strips, perRoll, rolls: Math.ceil(strips / perRoll), stripLength };
  }
  CH.registrar("calculadora-de-papel-de-parede", {
    fn: { wallpaper },
    calcular(v) {
      const r = wallpaper(v.largura, v.altura, v.desconto, v.rolo, v.comprimento, v.rapport);
      return {
        html: `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${r.rolls} <small>rolo(s)</small></div><p>${r.strips} faixa(s) de ${CH.fmt(r.stripLength)} m (altura + rapport + 10 cm). Cada rolo rende ${r.perRoll} faixa(s).</p><p>Considere um rolo extra para reparos, principalmente em estampas com casamento.</p>`,
        texto: `Papel de parede: ${r.rolls} rolo(s), ${r.strips} faixas de ${CH.fmt(r.stripLength)} m.`,
      };
    },
  });
})();

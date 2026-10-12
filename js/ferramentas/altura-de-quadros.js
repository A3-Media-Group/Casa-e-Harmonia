/* Altura de quadros (regras editoriais). */
(function () {
  function quadro(modo, centro, altura, gancho, movel, espaco, larguraMovel) {
    CH.exigir(altura, "a altura do quadro", { min: 1, max: 400 });
    CH.exigir(gancho, "a distância do gancho ao topo", { min: 0, max: altura });
    let prego, base;
    if (modo === "movel") {
      CH.exigir(movel, "a altura do móvel", { min: 0, max: 300 });
      CH.exigir(espaco, "o espaço acima do móvel", { min: 0, max: 200 });
      base = movel + espaco;
      prego = base + altura - gancho;
    } else {
      CH.exigir(centro, "a altura do centro", { min: 50, max: 300 });
      base = centro - altura / 2;
      prego = centro + altura / 2 - gancho;
    }
    if (base < 0) throw Error("O quadro ficaria abaixo do piso: reduza a altura do quadro ou aumente o centro.");
    const largura = Number.isFinite(larguraMovel) && larguraMovel > 0 ? [larguraMovel / 2, (larguraMovel * 2) / 3] : null;
    return { prego: CH.arred2(prego), base: CH.arred2(base), largura };
  }
  CH.registrar("altura-de-quadros", {
    fn: { quadro },
    calcular(v) {
      const r = quadro(v.modo, v.centro, v.altura, v.gancho, v.movel, v.espaco, v.larguraMovel);
      return {
        html: `<p class="eyebrow">ONDE FURAR</p><div class="number">${CH.fmt(r.prego, 1)} <small>cm do piso</small></div><p>Base do quadro a ${CH.fmt(r.base, 1)} cm do piso; topo a ${CH.fmt(r.base + v.altura, 1)} cm.</p>${r.largura ? `<p class="highlight">Largura sugerida do quadro ou composição: entre ${CH.fmt(r.largura[0], 0)} e ${CH.fmt(r.largura[1], 0)} cm.</p>` : ""}`,
        texto: `Quadro: prego a ${CH.fmt(r.prego, 1)} cm do piso (base a ${CH.fmt(r.base, 1)} cm).`,
      };
    },
  });
})();

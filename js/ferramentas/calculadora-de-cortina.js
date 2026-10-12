/* Calculadora de cortina (regras editoriais editáveis). */
(function () {
  function cortina(vao, sobraCm, altura, folgaCm, franzido, tecido, barrasCm) {
    CH.exigir(vao, "a largura do vão", { min: 0, minExclusivo: true, max: 50 });
    CH.exigir(sobraCm, "a sobra lateral", { min: 0, max: 200 });
    CH.exigir(altura, "a altura", { min: 0.3, max: 15 });
    CH.exigir(folgaCm, "a folga até o piso", { min: 0, max: 100 });
    CH.exigir(franzido, "o franzido", { min: 1, max: 4 });
    CH.exigir(tecido, "a largura do tecido", { min: 0.3, max: 6 });
    CH.exigir(barrasCm, "as barras", { min: 0, max: 100 });
    const trilho = vao + (2 * sobraCm) / 100;
    const franzida = trilho * franzido;
    const corte = altura - folgaCm / 100 + barrasCm / 100;
    if (corte <= 0) throw Error("A folga é maior que a altura.");
    const deitado = tecido >= corte;
    const faixas = deitado ? 1 : Math.ceil(Number((franzida / tecido).toPrecision(12)));
    const metros = CH.arred2(deitado ? franzida : faixas * corte);
    return { trilho: CH.arred2(trilho), franzida: CH.arred2(franzida), corte: CH.arred2(corte), deitado, faixas, metros };
  }
  CH.registrar("calculadora-de-cortina", {
    fn: { cortina },
    calcular(v) {
      const r = cortina(v.vao, v.sobra, v.altura, v.folga, CH.num(v.franzido), v.tecido, v.barras);
      return {
        html: `<p class="eyebrow">MEDIDAS DA CORTINA</p><div class="number">${CH.fmt(r.metros)} <small>m de tecido</small></div><p>Trilho ou varão: <b>${CH.fmt(r.trilho)} m</b> · largura franzida: ${CH.fmt(r.franzida)} m · altura de corte: ${CH.fmt(r.corte)} m.</p><p class="highlight">${r.deitado ? "O rolo cobre a altura: tecido usado deitado, sem emendas." : `O rolo não cobre a altura: ${r.faixas} faixa(s) de ${CH.fmt(r.corte)} m com emendas verticais.`}</p>`,
        texto: `Cortina: trilho de ${CH.fmt(r.trilho)} m e ${CH.fmt(r.metros)} m de tecido (largura franzida ${CH.fmt(r.franzida)} m, corte ${CH.fmt(r.corte)} m).`,
      };
    },
  });
})();

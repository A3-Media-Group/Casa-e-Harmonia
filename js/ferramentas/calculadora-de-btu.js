/* Calculadora de BTU (regra prática de mercado; premissas editáveis). */
(function () {
  const MODELOS = [7500, 9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000];
  function btu(area, people, devices, sun, base = 600, baseTarde = 800, extra = 600) {
    CH.exigir(area, "a área", { min: 0, minExclusivo: true, max: 1000 });
    CH.exigir(people, "o número de pessoas", { min: 1, max: 100, inteiro: true });
    CH.exigir(devices, "o número de eletrônicos", { min: 0, max: 50, inteiro: true });
    [base, baseTarde, extra].forEach((p) => CH.exigir(p, "a premissa de BTU", { min: 0, minExclusivo: true }));
    const needed = area * (sun === "tarde" ? baseTarde : base) + (people - 1) * extra + devices * extra;
    return { needed: Math.round(needed), model: MODELOS.find((m) => m >= needed) || null };
  }
  CH.registrar("calculadora-de-btu", {
    fn: { btu },
    calcular(v) {
      const r = btu(v.area, v.pessoas, v.eletronicos, v.sol, v.btum2, v.btum2tarde, v.extra);
      const modelo = r.model ? `${CH.fmt(r.model, 0)} <small>BTU/h</small>` : "+60.000 <small>BTU/h</small>";
      return {
        html: `<p class="eyebrow">CAPACIDADE INDICADA</p><div class="number">${modelo}</div><p>Carga estimada: ${CH.fmt(r.needed, 0)} BTU/h. ${r.model ? "Modelo comercial igual ou imediatamente acima." : "Acima de 60.000 BTU/h, o ambiente precisa de projeto de climatização."}</p>`,
        texto: `Ar-condicionado: carga estimada de ${CH.fmt(r.needed, 0)} BTU/h; modelo indicado ${r.model ? CH.fmt(r.model, 0) + " BTU/h" : "acima de 60.000 BTU/h"}.`,
      };
    },
  });
})();

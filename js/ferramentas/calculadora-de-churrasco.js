/* Calculadora de churrasco (referências editoriais, premissas editáveis). */
(function () {
  function barbecue(men, women, kids, drinkers, hours, g = { h: 400, m: 300, c: 150, cerveja: 1.2 }) {
    CH.exigir(men, "o número de homens", { min: 0, inteiro: true, max: 1000 });
    CH.exigir(women, "o número de mulheres", { min: 0, inteiro: true, max: 1000 });
    CH.exigir(kids, "o número de crianças", { min: 0, inteiro: true, max: 1000 });
    CH.exigir(drinkers, "o número de adultos que bebem", { min: 0, inteiro: true });
    CH.exigir(hours, "a duração", { min: 1, max: 24, inteiro: true });
    for (const [k, nome] of [["h", "a carne por homem"], ["m", "a carne por mulher"], ["c", "a carne por criança"], ["cerveja", "a cerveja por pessoa"]]) CH.exigir(g[k], nome, { min: 0 });
    if (men + women + kids === 0) throw Error("Informe pelo menos um convidado.");
    if (drinkers > men + women) throw Error("Quem bebe cerveja não pode passar do número de adultos.");
    const factor = 1 + Math.max(0, hours - 4) * 0.1;
    const meat = ((men * g.h + women * g.m + kids * g.c) / 1000) * factor;
    const people = men + women + kids;
    return {
      meat,
      beef: meat * 0.6,
      sausage: meat * 0.2,
      chicken: meat * 0.2,
      charcoal: Math.ceil(Number(meat.toPrecision(12))),
      garlicBread: Math.ceil(men + women + kids * 0.5),
      beer: drinkers * g.cerveja * factor,
      soda: people * 0.6 * factor,
      water: people * 0.5 * factor,
      ice: Math.ceil(people * 0.5),
    };
  }
  CH.registrar("calculadora-de-churrasco", {
    fn: { barbecue },
    calcular(v) {
      const r = barbecue(v.homens, v.mulheres, v.criancas, v.bebem, v.horas, { h: v.gh, m: v.gm, c: v.gc, cerveja: v.cerveja });
      const L = (x) => `${CH.fmt(x, 1)} L`;
      return {
        html: `<p class="eyebrow">LISTA DE COMPRAS</p><div class="number">${CH.fmt(r.meat, 1)} <small>kg de carne</small></div><table><tbody><tr><td>Carne bovina</td><td>${CH.fmt(r.beef, 1)} kg</td></tr><tr><td>Linguiça</td><td>${CH.fmt(r.sausage, 1)} kg</td></tr><tr><td>Frango</td><td>${CH.fmt(r.chicken, 1)} kg</td></tr><tr><td>Pão de alho</td><td>${r.garlicBread} un.</td></tr><tr><td>Carvão</td><td>${r.charcoal} kg</td></tr><tr><td>Cerveja</td><td>${L(r.beer)} (≈ ${Math.ceil((r.beer * 1000) / 350)} latas de 350 ml)</td></tr><tr><td>Refrigerante</td><td>${L(r.soda)}</td></tr><tr><td>Água</td><td>${L(r.water)}</td></tr><tr><td>Gelo</td><td>${r.ice} kg</td></tr></tbody></table>`,
        texto: `Churrasco: ${CH.fmt(r.meat, 1)} kg de carne (${CH.fmt(r.beef, 1)} bovina, ${CH.fmt(r.sausage, 1)} linguiça, ${CH.fmt(r.chicken, 1)} frango), ${r.charcoal} kg de carvão, ${CH.fmt(r.beer, 1)} L de cerveja, ${CH.fmt(r.soda, 1)} L de refrigerante, ${CH.fmt(r.water, 1)} L de água, ${r.ice} kg de gelo.`,
      };
    },
  });
})();

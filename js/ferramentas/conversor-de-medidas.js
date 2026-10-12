/* Conversor de medidas da casa. Fatores exatos: 1 pol = 2,54 cm; 1 pé = 30,48 cm. */
(function () {
  const COMP = { m: 1, cm: 0.01, mm: 0.001, pol: 0.0254, pe: 0.3048 };
  const AREA = { m2: 1, cm2: 0.0001, pe2: 0.09290304 };
  const NOMES = { m: "m", cm: "cm", mm: "mm", pol: "pol", pe: "pés", m2: "m²", cm2: "cm²", pe2: "pés²" };
  function converter(tipo, valor, de) {
    CH.exigir(valor, "o valor", { min: 0, max: 1e9 });
    const tabela = tipo === "area" ? AREA : COMP;
    if (!(de in tabela)) throw Error(tipo === "area" ? "Escolha uma unidade de área (m², cm² ou pés²)." : "Escolha uma unidade de comprimento (m, cm, mm, pol ou pés).");
    const base = valor * tabela[de];
    return Object.fromEntries(Object.entries(tabela).map(([u, f]) => [u, base / f]));
  }
  CH.registrar("conversor-de-medidas", {
    fn: { converter },
    automatico: true,
    montar(root) {
      const tipo = root.querySelector('[name="tipo"]');
      const de = root.querySelector('[name="de"]');
      const sync = () => {
        const unidades = tipo.value === "area" ? AREA : COMP;
        [...de.options].forEach((o) => (o.hidden = !(o.value in unidades)));
        if (!(de.value in unidades)) de.value = Object.keys(unidades)[0];
      };
      tipo.addEventListener("change", sync);
      sync();
    },
    calcular(v) {
      const r = converter(v.tipo, v.valor, v.de);
      const linhas = Object.entries(r).map(([u, x]) => `<tr><td>${NOMES[u]}</td><td>${CH.fmt(x, 4)}</td></tr>`).join("");
      return {
        html: `<p class="eyebrow">${CH.fmt(v.valor, 4)} ${NOMES[v.de]} EQUIVALEM A</p><table><tbody>${linhas}</tbody></table>`,
        texto: `${CH.fmt(v.valor, 4)} ${NOMES[v.de]} = ` + Object.entries(r).map(([u, x]) => `${CH.fmt(x, 4)} ${NOMES[u]}`).join("; "),
      };
    },
  });
})();

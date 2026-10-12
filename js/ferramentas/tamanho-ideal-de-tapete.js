/* Tamanho ideal de tapete (regras editoriais) e tamanho comum mais próximo. */
(function () {
  const COMUNS = [[1, 1.4], [1.5, 2], [2, 2.5], [2, 3], [2.5, 3], [2.5, 3.5], [3, 4]];
  function tapete(ambiente, largura, prof, sobraCm) {
    CH.exigir(largura, "a largura do móvel", { min: 0.3, max: 10 });
    CH.exigir(prof, "a profundidade ou comprimento", { min: 0.3, max: 10 });
    CH.exigir(sobraCm, "a sobra", { min: 0, max: 150 });
    const s = sobraCm / 100;
    let w, l;
    if (ambiente === "sala") [w, l] = [largura + 2 * s, prof - 0.3];
    else if (ambiente === "quarto") [w, l] = [largura + 2 * s, (prof * 2) / 3 + s];
    else if (ambiente === "jantar") [w, l] = [largura + 2 * s, prof + 2 * s];
    else throw Error("Escolha o ambiente.");
    if (l <= 0) throw Error("A profundidade precisa ser maior que 30 cm.");
    [w, l] = [CH.arred2(w), CH.arred2(l)];
    const [a, b] = [Math.min(w, l), Math.max(w, l)];
    const comum = COMUNS.find(([x, y]) => x >= a - 1e-9 && y >= b - 1e-9) || null;
    return { largura: w, comprimento: l, comum };
  }
  CH.registrar("tamanho-ideal-de-tapete", {
    fn: { tapete },
    montar(root) {
      const sel = root.querySelector('[name="ambiente"]');
      sel.addEventListener("change", () => (root.querySelector('[name="sobra"]').value = { sala: "20", quarto: "50", jantar: "70" }[sel.value]));
    },
    calcular(v) {
      const r = tapete(v.ambiente, v.largura, v.profundidade, v.sobra);
      const m = (x) => x.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return {
        html: `<p class="eyebrow">MEDIDA MÍNIMA</p><div class="number">${m(r.largura)} × ${m(r.comprimento)} <small>m</small></div><p class="highlight">${r.comum ? `Tamanho comum sugerido: <b>${m(r.comum[0])} × ${m(r.comum[1])} m</b>.` : "Maior que os tamanhos comuns: considere um tapete sob medida."}</p><p>Confira a circulação em volta antes de comprar.</p>`,
        texto: `Tapete: mínimo de ${m(r.largura)} × ${m(r.comprimento)} m${r.comum ? `; tamanho comum ${m(r.comum[0])} × ${m(r.comum[1])} m` : ""}.`,
      };
    },
  });
})();

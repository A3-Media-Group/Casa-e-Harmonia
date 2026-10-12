/* Paletas de cores: simulação de sala e cópia dos códigos. */
(function () {
  const PALETAS = {
    natural: ["Natural e acolhedora", ["Creme", "#F0E8D7"], ["Sálvia", "#A4B398"], ["Terracota", "#AF624C"]],
    solar: ["Solar e criativa", ["Areia", "#F3E5CC"], ["Ocre", "#D6AD52"], ["Azul profundo", "#385C6A"]],
    serena: ["Serena e fresca", ["Névoa", "#E8EDE7"], ["Azul suave", "#A3BDC3"], ["Oliva", "#737C50"]],
    japandi: ["Japandi minimalista", ["Branco quente", "#F4F0E8"], ["Madeira clara", "#C8A27A"], ["Grafite", "#3E4142"]],
    terrosa: ["Terrosa e quente", ["Argila clara", "#E9D5C0"], ["Caramelo", "#B9773F"], ["Verde-musgo", "#5B6B3A"]],
    noturna: ["Sofisticada e escura", ["Off-white", "#EFEDE7"], ["Azul-petróleo", "#24464F"], ["Dourado velho", "#B38B45"]],
  };
  const PAPEIS = ["Base · 60%", "Apoio · 30%", "Destaque · 10%"];
  function paleta(chave) {
    const p = PALETAS[chave];
    if (!p) throw Error("Escolha uma paleta da lista.");
    const [nome, ...cores] = p;
    return { nome, cores };
  }
  CH.registrar("paletas-de-cores", {
    fn: { paleta },
    automatico: true,
    calcular(v) {
      const { nome, cores } = paleta(v.paleta);
      return {
        html: `<p class="result-title">${nome}</p><div class="room-preview" style="--base:${cores[0][1]};--apoio:${cores[1][1]};--destaque:${cores[2][1]}" role="img" aria-label="Simulação de sala com as cores da paleta ${nome}"><span class="rp-sofa"></span><span class="rp-art"></span><span class="rp-pillow"></span></div><div class="swatches">${cores.map(([n, hex], i) => `<div class="swatch"><span style="background:${hex}"></span><small>${PAPEIS[i]}<br>${n}<br><button type="button" class="copy-hex" data-hex="${hex}">${hex} ⧉</button></small></div>`).join("")}</div>`,
        texto: `Paleta ${nome}: ${cores.map(([n, hex], i) => `${PAPEIS[i].split(" ")[0]} ${n} ${hex}`).join(", ")}.`,
        depois(saida) {
          saida.querySelectorAll(".copy-hex").forEach((b) => {
            b.onclick = async () => {
              try {
                await navigator.clipboard.writeText(b.dataset.hex);
                b.textContent = "Copiado ✓";
              } catch {
                b.textContent = b.dataset.hex;
              }
            };
          });
        },
      };
    },
  });
})();

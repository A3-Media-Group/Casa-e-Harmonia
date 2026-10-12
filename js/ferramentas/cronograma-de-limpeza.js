/* Cronograma de limpeza: lista gerada no navegador, marcações em localStorage. */
(function () {
  const GRUPOS = ["Diário", "Semanal", "Mensal"];
  const CHAVE = "casa-harmonia-schedule-v1";
  function tarefas({ tamanho, minutos, pets, criancas, plantas }) {
    const m = Number(minutos);
    if (![15, 30, 60].includes(m)) throw Error("Escolha o tempo disponível por dia.");
    const zonas = tamanho === "pequena" ? "um ambiente" : tamanho === "media" ? "dois ambientes" : "um setor da casa por vez";
    const itens = [
      ["Diário", `Reservar ${Math.min(m, 15)} minutos para devolver objetos ao lugar.`],
      ["Diário", "Lavar a louça ou esvaziar a lava-louças e liberar a pia."],
      ["Diário", "Passar pano na bancada e no fogão após cozinhar."],
      ["Diário", "Separar roupas usadas e levar o lixo orgânico."],
      ["Diário", "Arrumar a cama ao levantar."],
      ["Semanal", `Revisar ${zonas}, alternando os demais ao longo da semana.`],
      ["Semanal", "Limpar banheiro: vaso, pia, box e espelho."],
      ["Semanal", "Trocar roupa de cama e toalhas."],
      ["Semanal", "Aspirar ou varrer e passar pano no piso."],
      ["Semanal", "Tirar o pó de móveis e eletrônicos."],
      ["Semanal", "Conferir a geladeira e planejar as refeições."],
      ["Semanal", m === 15 ? "Dividir tarefas maiores em blocos de 15 minutos em dias diferentes." : `Reservar um bloco de ${m} minutos para cozinha e áreas de maior uso.`],
      ["Mensal", "Limpar a geladeira e descartar itens vencidos."],
      ["Mensal", "Lavar lixeiras e limpar o micro-ondas."],
      ["Mensal", "Escolher uma gaveta ou prateleira para organizar e separar doações."],
      ["Mensal", "Limpar filtros (ar-condicionado, coifa, máquina de lavar) conforme os manuais."],
      ["Mensal", "Limpar vidros e janelas."],
    ];
    if (pets) itens.push(["Diário", "Limpar a caixa de areia ou o tapete higiênico e trocar a água do pet."], ["Semanal", "Lavar caminhas, potes e cobertas do pet."]);
    if (criancas) itens.push(["Diário", "Guardar brinquedos com as crianças antes de dormir."], ["Mensal", "Separar brinquedos e roupas que não servem mais."]);
    if (plantas) itens.push(["Semanal", "Verificar a umidade da terra e regar quem precisa."], ["Mensal", "Limpar folhas, girar vasos e adubar quando indicado."]);
    return itens.map(([grupo, texto]) => ({ grupo, texto, feito: false }));
  }
  let plano = null;
  const salvar = () => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(plano));
    } catch {}
  };
  function desenhar(saida) {
    const feitos = plano.itens.filter((t) => t.feito).length;
    const pct = Math.round((feitos / plano.itens.length) * 100);
    saida.innerHTML = `<div class="progress"><span style="width:${pct}%"></span><b>${feitos} de ${plano.itens.length} tarefas · ${pct}%</b></div><div class="checklist"></div><button type="button" class="text-button" data-reset>↺ Desmarcar tudo</button>`;
    const lista = saida.querySelector(".checklist");
    for (const g of GRUPOS) {
      const h = document.createElement("p");
      h.className = "check-group";
      h.textContent = g;
      lista.append(h);
      plano.itens.filter((t) => t.grupo === g).forEach((t) => {
        const label = document.createElement("label");
        label.className = "check-item";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = t.feito;
        input.onchange = () => {
          t.feito = input.checked;
          salvar();
          desenhar(saida);
        };
        label.append(input, document.createTextNode(t.texto));
        lista.append(label);
      });
    }
    saida.querySelector("[data-reset]").onclick = () => {
      plano.itens.forEach((t) => (t.feito = false));
      salvar();
      desenhar(saida);
    };
  }
  const textoPlano = () => "MEU CRONOGRAMA DE LIMPEZA\n" + plano.itens.map((t) => `${t.grupo} · [${t.feito ? "x" : " "}] ${t.texto}`).join("\n");
  CH.registrar("cronograma-de-limpeza", {
    fn: { tarefas },
    montar(root) {
      if (location.search) return;
      try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE));
        if (salvo && Array.isArray(salvo.itens) && salvo.itens.length && salvo.itens.every((t) => GRUPOS.includes(t.grupo) && typeof t.texto === "string")) {
          plano = salvo;
          desenhar(root.querySelector("[data-resultado]"));
          root.querySelector("[data-acoes]").hidden = false;
        }
      } catch {}
    },
    calcular(v) {
      plano = { itens: tarefas(v) };
      salvar();
      return { html: "", texto: textoPlano(), depois: desenhar };
    },
  });
})();

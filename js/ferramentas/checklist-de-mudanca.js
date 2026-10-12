/* Checklist de mudança com datas por etapa; marcações em localStorage. */
(function () {
  const CHAVE = "casa-harmonia-mudanca-v1";
  const ETAPAS = [
    ["4 semanas antes", -28],
    ["2 semanas antes", -14],
    ["1 semana antes", -7],
    ["Véspera", -1],
    ["Dia da mudança", 0],
    ["Primeira semana na casa nova", 1],
  ];
  function datas(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) throw Error("Escolha a data da mudança.");
    const [y, m, d] = iso.split("-").map(Number);
    const base = Date.UTC(y, m - 1, d);
    if (!Number.isFinite(base)) throw Error("Data inválida.");
    return ETAPAS.map(([nome, off]) => {
      const dt = new Date(base + off * 86400000);
      return [nome, `${String(dt.getUTCDate()).padStart(2, "0")}/${String(dt.getUTCMonth() + 1).padStart(2, "0")}/${dt.getUTCFullYear()}`];
    });
  }
  function tarefas({ apartamento, pets, criancas, cidade }) {
    const t = [
      [0, "Pedir orçamentos a pelo menos três empresas de mudança ou fretes."],
      [0, "Separar o que vai, o que será doado, vendido ou descartado."],
      [0, "Medir a casa nova e conferir se os móveis grandes passam pelas portas."],
      [0, "Solicitar a transferência ou o desligamento de luz, água, gás e internet."],
      [1, "Comprar ou separar caixas, fita, plástico-bolha e etiquetas."],
      [1, "Embalar primeiro o que menos usa (livros, roupas de outra estação, decoração)."],
      [1, "Atualizar o endereço em banco, trabalho, escola, lojas e assinaturas."],
      [2, "Confirmar data, horário e valor com a empresa de mudança."],
      [2, "Usar o que tem na geladeira e no congelador e evitar novas compras."],
      [2, "Etiquetar as caixas com o cômodo de destino e o conteúdo."],
      [3, "Separar a mala da primeira noite: documentos, remédios, carregadores, roupas e itens de higiene."],
      [3, "Descongelar e secar a geladeira, se ela for transportada."],
      [3, "Fotografar a leitura dos medidores do imóvel que você está deixando."],
      [4, "Conferir a casa vazia: armários, varanda, depósito e área de serviço."],
      [4, "Acompanhar a chegada e a montagem dos móveis na casa nova."],
      [4, "Anotar a leitura dos medidores do novo imóvel."],
      [5, "Montar primeiro cama, banheiro e cozinha."],
      [5, "Verificar o funcionamento de luz, água, gás e internet."],
      [5, "Testar fechaduras e, se possível, trocar o segredo das portas."],
    ];
    if (apartamento) t.push([1, "Agendar o uso do elevador e o horário de mudança com o condomínio de saída e o de chegada."]);
    if (pets) t.push([3, "Combinar onde o pet fica no dia da mudança e separar ração, água e caminha."], [5, "Atualizar o endereço na plaquinha de identificação do pet."]);
    if (criancas) t.push([2, "Separar uma caixa com brinquedos e itens favoritos das crianças para o primeiro dia."]);
    if (cidade) t.push([0, "Pesquisar escola, posto de saúde e serviços próximos na nova cidade."], [5, "Atualizar documentos e cadastros que dependem do endereço, conforme as regras locais."]);
    return t.map(([etapa, texto]) => ({ etapa, texto, feito: false }));
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
    saida.innerHTML = `<div class="progress"><span style="width:${pct}%"></span><b>${feitos} de ${plano.itens.length} tarefas · ${pct}%</b></div><div class="checklist"></div>`;
    const lista = saida.querySelector(".checklist");
    plano.datas.forEach(([nome, data], i) => {
      const h = document.createElement("p");
      h.className = "check-group";
      h.textContent = `${nome} · a partir de ${data}`;
      lista.append(h);
      plano.itens.filter((t) => t.etapa === i).forEach((t) => {
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
    });
  }
  CH.registrar("checklist-de-mudanca", {
    fn: { datas, tarefas },
    montar(root) {
      if (location.search) return;
      try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE));
        if (salvo && Array.isArray(salvo.itens) && Array.isArray(salvo.datas) && salvo.itens.every((t) => typeof t.texto === "string" && Number.isInteger(t.etapa))) {
          plano = salvo;
          root.querySelector('[name="data"]').value = salvo.data || "";
          desenhar(root.querySelector("[data-resultado]"));
          root.querySelector("[data-acoes]").hidden = false;
        }
      } catch {}
    },
    calcular(v) {
      plano = { data: v.data, datas: datas(v.data), itens: tarefas(v) };
      salvar();
      const texto = "CHECKLIST DE MUDANÇA\n" + plano.datas.map(([n, d], i) => `\n${n} (${d})\n` + plano.itens.filter((t) => t.etapa === i).map((t) => `[ ] ${t.texto}`).join("\n")).join("\n");
      return { html: "", texto, depois: desenhar };
    },
  });
})();

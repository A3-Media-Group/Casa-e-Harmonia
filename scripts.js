const $ = (id) => document.getElementById(id);
const n = (id) => Number($(id).value);
const fmt = (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function paint(walls, openings, coats, yieldRate, waste) {
  if (
    !walls.length ||
    walls.some((w) => w.some((v) => !Number.isFinite(v) || v <= 0)) ||
    ![openings, coats, yieldRate, waste].every(Number.isFinite) ||
    openings < 0 ||
    coats < 1 ||
    !Number.isInteger(coats) ||
    yieldRate <= 0 ||
    waste < 0
  )
    throw Error(
      "Confira as medidas, o rendimento e o número inteiro de demãos.",
    );
  let area = walls.reduce((sum, [w, h]) => sum + w * h, 0) - openings;
  if (area <= 0)
    throw Error("A área descontada deve ser menor que a soma das paredes.");
  return {
    area,
    liters:
      Math.ceil(
        Number(
          (((area * coats) / yieldRate) * (1 + waste / 100) * 100).toPrecision(
            14,
          ),
        ),
      ) / 100,
  };
}
if ($("paint-form")) {
  $("add-wall").onclick = () => {
    const row = document.createElement("div");
    row.className = "wall-row";
    row.innerHTML =
      '<label>Largura (m)<input type="number" min=".1" step=".1" value="3" required></label><label>Altura (m)<input type="number" min=".1" step=".1" value="2.7" required></label><button type="button" class="text-button">Remover parede</button>';
    row.querySelector("button").onclick = () => row.remove();
    $("walls").append(row);
  };
  function showPaint(input) {
    const r = paint(
      input.walls,
      input.openings,
      input.coats,
      input.yieldRate,
      input.waste,
    );
    $("paint-result").innerHTML =
      `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${fmt(r.liters)} <small>L</small></div><p>Para ${fmt(r.area)} m² de área líquida, ${input.finished ? "rendimento acabado (demãos já incluídas)" : input.coats + " demão(s)"} e ${input.waste}% de margem.</p><p>Fórmula: ${input.finished ? "área ÷ rendimento acabado" : "área × demãos ÷ rendimento por demão"} × (1 + margem ÷ 100). Arredonde a compra para as embalagens disponíveis. Textura, absorção e cor anterior podem alterar o consumo.</p>`;
    return r;
  }
  $("paint-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      showPaint({
        walls: [...document.querySelectorAll(".wall-row")].map((row) =>
          [...row.querySelectorAll("input")].map((i) => Number(i.value)),
        ),
        openings: n("openings"),
        finished: $("yield-mode").value === "finished",
        coats: $("yield-mode").value === "finished" ? 1 : n("coats"),
        yieldRate: n("yield"),
        waste: n("waste"),
      });
    } catch (error) {
      $("paint-result").textContent = error.message;
    }
  };
  $("intervention").onchange = () => {
    const mode = $("intervention").value;
    const [price, unit] =
      mode === "floor"
        ? [150, "m² de piso"]
        : mode === "light"
          ? [180, "pontos de luz"]
          : [35, "m² de parede"];
    $("unit").value = price;
    $("quantity").parentElement.firstChild.textContent = `Quantidade (${unit})`;
    $("quantity").value = mode === "light" ? 4 : 30;
    $("quantity").step = mode === "light" ? "1" : ".1";
    $("budget-note").textContent =
      `Premissa ilustrativa: ${currency(price)} por ${unit}, materiais e mão de obra. Ajuste com uma cotação local.`;
  };
  $("budget-form").onsubmit = (e) => {
    e.preventDefault();
    const q = n("quantity"),
      unit = n("unit"),
      reserve = n("reserve");
    if (
      ![q, unit, reserve].every(Number.isFinite) ||
      q <= 0 ||
      unit <= 0 ||
      reserve < 0 ||
      ($("intervention").value === "light" && !Number.isInteger(q))
    ) {
      $("budget-result").textContent =
        "Confira os valores. Pontos de luz devem ser inteiros.";
      return;
    }
    let base = q * unit,
      total = base * (1 + reserve / 100);
    $("budget-result").innerHTML =
      `<p class="eyebrow">${$("room").value.toUpperCase()} · ESTIMATIVA</p><div class="number" style="font-size:38px">${currency(total)}</div><p>Subtotal: ${currency(base)}<br>Reserva (${reserve}%): ${currency(total - base)}</p><p>Referência de planejamento, não cotação. Não inclui demolição, retirada de entulho, alterações estruturais ou adequações não previstas. Confirme o escopo com um profissional local.</p>`;
  };
  let schedule = null;
  const key = "casa-harmonia-schedule-v1";
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(schedule));
      $("storage-status").textContent = "Cronograma salvo neste navegador.";
    } catch {
      $("storage-status").textContent =
        "Não foi possível salvar neste navegador. Use a exportação para guardar o plano.";
    }
  }
  function render() {
    const root = $("checklist");
    root.replaceChildren();
    for (const group of ["Diário", "Semanal", "Mensal"]) {
      const h = document.createElement("h4");
      h.textContent = group;
      root.append(h);
      schedule.items
        .filter((t) => t.group === group)
        .forEach((t) => {
          const label = document.createElement("label");
          label.className = "check-item";
          const input = document.createElement("input");
          input.type = "checkbox";
          input.checked = t.done;
          input.onchange = () => {
            t.done = input.checked;
            save();
          };
          label.append(input, document.createTextNode(t.text));
          root.append(label);
        });
    }
    $("export").hidden = false;
  }
  $("schedule-form").onsubmit = (e) => {
    e.preventDefault();
    let minutes = n("routine"),
      size = $("size").value;
    const zones =
      size === "small"
        ? "um ambiente"
        : size === "medium"
          ? "dois ambientes"
          : "um setor da casa por vez";
    schedule = {
      size,
      minutes,
      items: [
        [
          "Diário",
          `Reservar ${Math.min(minutes, 15)} minutos para devolver objetos ao lugar.`,
        ],
        ["Diário", "Liberar a pia e a superfície de preparo após o uso."],
        ["Diário", "Separar roupas usadas e verificar resíduos."],
        [
          "Semanal",
          `Revisar ${zones}, alternando os demais ao longo da semana.`,
        ],
        [
          "Semanal",
          "Limpar banheiro, trocar roupa de cama e cuidar do piso em blocos separados.",
        ],
        [
          "Semanal",
          minutes === 15
            ? "Dividir tarefas maiores em blocos de 15 minutos em dias diferentes."
            : `Reservar um bloco de ${minutes} minutos para cozinha e áreas de maior uso.`,
        ],
        ["Mensal", "Revisar validade dos alimentos e produtos armazenados."],
        ["Mensal", "Escolher uma gaveta para organizar e separar doações."],
        ["Mensal", "Limpar filtros e revisar manutenção conforme os manuais."],
      ].map(([group, text]) => ({ group, text, done: false })),
    };
    save();
    render();
  };
  $("export").onclick = () => {
    if (!schedule) return;
    const text =
      "CASA E HARMONIA — MEU CRONOGRAMA\n\n" +
      schedule.items
        .map((t) => `${t.group} · [${t.done ? "x" : " "}] ${t.text}`)
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "cronograma-casa-e-harmonia.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (
      data &&
      Array.isArray(data.items) &&
      data.items.every(
        (t) =>
          ["Diário", "Semanal", "Mensal"].includes(t.group) &&
          typeof t.text === "string" &&
          typeof t.done === "boolean",
      )
    ) {
      schedule = data;
      $("size").value = data.size;
      $("routine").value = data.minutes;
      render();
    }
  } catch {
    $("storage-status").textContent = "Gere um novo cronograma para começar.";
  }
  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(
        document.modelContext.registerTool({
          name: "calculate_paint",
          description: "Calcula a tinta e exibe o resultado na calculadora.",
          inputSchema: {
            type: "object",
            properties: {
              walls: {
                type: "array",
                items: {
                  type: "array",
                  items: { type: "number" },
                  minItems: 2,
                  maxItems: 2,
                },
                minItems: 1,
              },
              openings: { type: "number", minimum: 0 },
              coats: { type: "integer", minimum: 1 },
              yieldRate: { type: "number", exclusiveMinimum: 0 },
              waste: { type: "number", minimum: 0 },
            },
            required: ["walls", "openings", "coats", "yieldRate", "waste"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input) => showPaint(input),
        }),
      ).catch(() => {});
    } catch {}
  }
}

if ($("yield-mode"))
  $("yield-mode").onchange = () => {
    $("coats").disabled = $("yield-mode").value === "finished";
  };
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
if ($("article-search")) {
  const cards = [...document.querySelectorAll(".article-card")];
  function filter() {
    const q = norm($("article-search").value.trim()),
      cat = $("category-filter").value;
    let total = 0;
    cards.forEach((c) => {
      c.hidden = !(
        norm(c.textContent).includes(q) &&
        (!cat || c.dataset.category === cat)
      );
      if (!c.hidden) total++;
    });
    $("search-count").textContent = total + " guia(s) encontrado(s)";
    $("no-results").hidden = total > 0;
  }
  $("article-search").oninput = filter;
  $("category-filter").onchange = filter;
  document.querySelectorAll("[data-filter]").forEach(
    (a) =>
      (a.onclick = () => {
        $("category-filter").value = a.dataset.filter;
        $("article-search").value = "";
        filter();
      }),
  );
}
function floor(w, l, waste, box) {
  if (
    ![w, l, waste, box].every(Number.isFinite) ||
    w <= 0 ||
    l <= 0 ||
    box <= 0 ||
    waste < 0
  )
    throw Error("Confira as medidas e a cobertura por caixa.");
  const area = w * l,
    buy = area * (1 + waste / 100),
    boxes = Math.ceil(Number((buy / box).toPrecision(14)));
  if (!Number.isFinite(buy) || !Number.isSafeInteger(boxes))
    throw Error("As medidas ultrapassam o limite de cálculo.");
  return { area, buy, boxes, purchased: boxes * box };
}
if ($("floor-form"))
  $("floor-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const r = floor(
        n("floor-width"),
        n("floor-length"),
        n("floor-waste"),
        n("floor-box"),
      );
      $("floor-result").innerHTML =
        '<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">' +
        r.boxes +
        " caixas</div><p>Área do ambiente: " +
        fmt(r.area) +
        " m²<br>Com margem: " +
        fmt(r.buy) +
        " m²<br>Compra em caixas inteiras: " +
        fmt(r.purchased) +
        " m²</p><p>Fórmula: largura × comprimento × (1 + margem ÷ 100), dividida pela cobertura da caixa e arredondada para cima. Confirme a paginação e os recortes antes de comprar.</p>";
    } catch (error) {
      $("floor-result").textContent = error.message;
    }
  };
if ($("palette")) {
  const palettes = {
    natural: [
      "Natural e acolhedora",
      ["Creme", "#F0E8D7"],
      ["Sálvia", "#A4B398"],
      ["Terracota", "#AF624C"],
    ],
    solar: [
      "Solar e criativa",
      ["Areia", "#F3E5CC"],
      ["Ocre", "#D6AD52"],
      ["Azul profundo", "#385C6A"],
    ],
    serena: [
      "Serena e fresca",
      ["Névoa", "#E8EDE7"],
      ["Azul suave", "#A3BDC3"],
      ["Oliva", "#737C50"],
    ],
  };
  const renderPalette = () => {
    const [name, ...colors] = palettes[$("palette").value];
    $("palette-preview").innerHTML =
      "<h3>" +
      name +
      '</h3><div class="swatches">' +
      colors
        .map(
          ([name, hex], i) =>
            '<div class="swatch"><span style="background:' +
            hex +
            '"></span><small>' +
            ["Base", "Apoio", "Destaque"][i] +
            " · " +
            name +
            "<br>" +
            hex +
            "</small></div>",
        )
        .join("") +
      "</div>";
  };
  $("palette").onchange = renderPalette;
  renderPalette();
}

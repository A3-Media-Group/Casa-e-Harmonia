const $ = (id) => document.getElementById(id);
const n = (id) => Number($(id).value);
const fmt = (v, d = 2) => v.toLocaleString("pt-BR", { maximumFractionDigits: d });
const currency = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const round2 = (v) => Math.round(Number((v * 100).toPrecision(14))) / 100;
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
const fail = (id, error) => {
  $(id).innerHTML = "";
  const p = document.createElement("p");
  p.className = "error";
  p.textContent = error.message;
  $(id).append(p);
};

/* ------------------------- Cálculos (funções puras) ------------------------- */

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
    throw Error("Confira as medidas, o rendimento e o número inteiro de demãos.");
  let area = walls.reduce((sum, [w, h]) => sum + w * h, 0) - openings;
  if (area <= 0)
    throw Error("A área descontada deve ser menor que a soma das paredes.");
  return {
    area,
    liters:
      Math.ceil(
        Number((((area * coats) / yieldRate) * (1 + waste / 100) * 100).toPrecision(14)),
      ) / 100,
  };
}

// Combinação de embalagens (lata 18 L, galão 3,6 L, quarto 0,9 L) com menor sobra e menos itens.
function cans(liters) {
  if (!Number.isFinite(liters) || liters <= 0) throw Error("Quantidade inválida.");
  let best = null;
  const max18 = Math.ceil(liters / 18);
  for (let a = 0; a <= max18; a++)
    for (let b = 0; b <= 5; b++)
      for (let c = 0; c <= 4; c++) {
        const total = round2(a * 18 + b * 3.6 + c * 0.9);
        if (total + 1e-9 < liters) continue;
        const items = a + b + c;
        if (!best || total < best.total - 1e-9 || (Math.abs(total - best.total) < 1e-9 && items < best.items))
          best = { lata: a, galao: b, quarto: c, total, items };
      }
  return best;
}

function floor(w, l, waste, box) {
  if (![w, l, waste, box].every(Number.isFinite) || w <= 0 || l <= 0 || box <= 0 || waste < 0)
    throw Error("Confira as medidas e a cobertura por caixa.");
  const area = w * l,
    buy = area * (1 + waste / 100),
    boxes = Math.ceil(Number((buy / box).toPrecision(14)));
  if (!Number.isFinite(buy) || !Number.isSafeInteger(boxes))
    throw Error("As medidas ultrapassam o limite de cálculo.");
  return { area, buy, boxes, purchased: boxes * box };
}

// Rodapé (m lineares com 10% de recortes) e argamassa (5 kg/m², sacos de 20 kg).
function floorExtras(w, l, doors) {
  if (![w, l, doors].every(Number.isFinite) || w <= 0 || l <= 0 || doors < 0)
    throw Error("Confira as medidas.");
  const perimeter = Math.max(0, 2 * (w + l) - doors);
  return {
    baseboard: Math.ceil(Number((perimeter * 1.1).toPrecision(14))),
    mortarBags: Math.ceil(Number(((w * l * 5) / 20).toPrecision(14))),
  };
}

const BTU_MODELOS = [7500, 9000, 12000, 18000, 22000, 24000, 30000, 36000, 48000, 60000];
function btu(area, people, devices, sun) {
  if (![area, people, devices].every(Number.isFinite) || area <= 0 || people < 1 || devices < 0)
    throw Error("Informe a área, ao menos uma pessoa e o número de eletrônicos.");
  const needed = area * (sun === "tarde" ? 800 : 600) + (people - 1) * 600 + devices * 600;
  return { needed: Math.round(needed), model: BTU_MODELOS.find((m) => m >= needed) || null };
}

function energy(rows, tariff, flag = 0) {
  if (!Number.isFinite(tariff) || tariff <= 0 || !Number.isFinite(flag) || flag < 0)
    throw Error("Informe uma tarifa válida.");
  const items = rows.map((r) => {
    if (![r.qty, r.watts, r.hours, r.days].every(Number.isFinite) || r.qty < 0 || r.watts < 0 || r.hours < 0 || r.hours > 24 || r.days < 0 || r.days > 31)
      throw Error(`Confira os valores de "${r.name}". Horas por dia vão de 0 a 24 e dias de 0 a 31.`);
    const kwh = (r.qty * r.watts * r.hours * r.days) / 1000;
    return { ...r, kwh, cost: kwh * (tariff + flag) };
  });
  const kwh = items.reduce((s, i) => s + i.kwh, 0);
  return { items, kwh, cost: kwh * (tariff + flag) };
}

// Gramas por xícara de 240 ml (valores aproximados de uso doméstico).
const INGREDIENTES = {
  "Farinha de trigo": 120,
  "Açúcar refinado": 180,
  "Açúcar mascavo": 150,
  "Açúcar de confeiteiro": 120,
  "Chocolate ou cacau em pó": 90,
  Manteiga: 200,
  "Óleo": 220,
  "Leite ou água": 240,
  "Arroz cru": 190,
  "Aveia em flocos": 80,
  "Fubá": 140,
  "Amido de milho": 150,
  Polvilho: 150,
  Mel: 340,
  "Coco ralado": 80,
  "Queijo ralado": 90,
};
function measure(qty, unit, ingredient) {
  const gCup = INGREDIENTES[ingredient];
  if (!gCup || !Number.isFinite(qty) || qty <= 0) throw Error("Informe uma quantidade válida.");
  const ml = unit === "g" ? (qty / gCup) * 240 : qty * Number(unit);
  if (!Number.isFinite(ml)) throw Error("Medida inválida.");
  return { ml, g: (ml / 240) * gCup, cups: ml / 240, tbsp: ml / 15 };
}

function wallpaper(width, height, discount, rollWidth, rollLength, repeatCm) {
  if (![width, height, discount, rollWidth, rollLength, repeatCm].every(Number.isFinite) || width <= 0 || height <= 0 || discount < 0 || rollWidth <= 0 || rollLength <= 0 || repeatCm < 0)
    throw Error("Confira as medidas.");
  const net = width - discount;
  if (net <= 0) throw Error("O desconto deve ser menor que a largura total.");
  const strips = Math.ceil(Number((net / rollWidth).toPrecision(14)));
  const stripLength = height + repeatCm / 100 + 0.1;
  const perRoll = Math.floor(Number((rollLength / stripLength).toPrecision(14)));
  if (perRoll < 1) throw Error("O rolo é mais curto que a altura da parede.");
  return { strips, perRoll, rolls: Math.ceil(strips / perRoll), stripLength };
}

function barbecue(men, women, kids, drinkers, hours) {
  const v = [men, women, kids, drinkers, hours];
  if (!v.every((x) => Number.isInteger(x) && x >= 0) || hours < 1 || men + women + kids === 0)
    throw Error("Informe números inteiros e pelo menos um convidado.");
  if (drinkers > men + women) throw Error("Quem bebe cerveja não pode passar do número de adultos.");
  const factor = 1 + Math.max(0, hours - 4) * 0.1;
  const meat = (men * 0.4 + women * 0.3 + kids * 0.15) * factor;
  const people = men + women + kids;
  return {
    meat,
    beef: meat * 0.6,
    sausage: meat * 0.2,
    chicken: meat * 0.2,
    charcoal: Math.ceil(meat),
    garlicBread: Math.ceil((men + women) * 1 + kids * 0.5),
    beer: drinkers * 1.2 * factor,
    soda: people * 0.6 * factor,
    water: people * 0.5 * factor,
    ice: Math.ceil(people * 0.5),
  };
}

function fmtQty(v) {
  if (v == null) return "";
  if (v >= 20) return String(Math.round(v));
  const inteiro = Math.floor(v + 1e-9);
  const resto = v - inteiro;
  const fr = [
    [0, ""],
    [0.25, "¼"],
    [1 / 3, "⅓"],
    [0.5, "½"],
    [2 / 3, "⅔"],
    [0.75, "¾"],
    [1, ""],
  ].reduce((a, b) => (Math.abs(b[0] - resto) < Math.abs(a[0] - resto) ? b : a));
  const base = fr[0] === 1 ? inteiro + 1 : inteiro;
  if (!base && !fr[1]) return String(Math.round(v * 100) / 100).replace(".", ",");
  return (base ? String(base) : "") + fr[1];
}

/* ------------------------------- Interface ------------------------------- */

if ($("paint-form")) {
  $("add-wall").onclick = () => {
    const row = document.createElement("div");
    row.className = "wall-row";
    row.innerHTML =
      '<label>Largura (m)<input type="number" min=".1" step=".1" value="3" required></label><label>Altura (m)<input type="number" min=".1" step=".1" value="2.7" required></label><button type="button" class="text-button">Remover parede</button>';
    row.querySelector("button").onclick = () => row.remove();
    $("walls").append(row);
  };
  $("yield-mode").onchange = () => {
    $("coats").disabled = $("yield-mode").value === "finished";
  };
  function showPaint(input) {
    const r = paint(input.walls, input.openings, input.coats, input.yieldRate, input.waste);
    const c = cans(r.liters);
    const parts = [
      c.lata && `${c.lata} lata(s) de 18 L`,
      c.galao && `${c.galao} galão(ões) de 3,6 L`,
      c.quarto && `${c.quarto} quarto(s) de 0,9 L`,
    ].filter(Boolean);
    const price = Number($("paint-price")?.value || 0);
    $("tinta-result").innerHTML =
      `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${fmt(r.liters)} <small>L</small></div><p>Para ${fmt(r.area)} m² de área líquida, ${input.finished ? "rendimento acabado (demãos já incluídas)" : input.coats + " demão(s)"} e ${input.waste}% de margem.</p><p class="highlight"><b>Sugestão de compra:</b> ${parts.join(" + ")} (${fmt(c.total)} L).${price > 0 ? ` Custo estimado: ${currency((c.total / 3.6) * price)}.` : ""}</p><p>Fórmula: ${input.finished ? "área ÷ rendimento acabado" : "área × demãos ÷ rendimento por demão"} × (1 + margem ÷ 100). Textura, absorção e cor anterior podem alterar o consumo.</p>`;
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
      fail("tinta-result", error);
    }
  };
  if (document.modelContext?.registerTool) {
    try {
      Promise.resolve(
        document.modelContext.registerTool({
          name: "calculate_paint",
          description: "Calcula a tinta e exibe o resultado na calculadora.",
          inputSchema: {
            type: "object",
            properties: {
              walls: { type: "array", items: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 }, minItems: 1 },
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

if ($("btu-form"))
  $("btu-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const r = btu(n("btu-area"), n("btu-people"), n("btu-devices"), $("btu-sun").value);
      $("btu-result").innerHTML = `<p class="eyebrow">CAPACIDADE INDICADA</p><div class="number">${r.model ? fmt(r.model, 0) : "+60.000"} <small>BTU/h</small></div><p>Carga térmica estimada: ${fmt(r.needed, 0)} BTU/h. ${r.model ? "Modelo comercial igual ou imediatamente acima." : "Acima de 60.000 BTU/h, o ambiente precisa de projeto de climatização com mais de um aparelho."}</p><p>Pé-direito acima de 2,7 m, paredes de vidro, cobertura sem laje ou cozinha integrada pedem margem maior. Confirme com o instalador.</p>`;
    } catch (error) {
      fail("btu-result", error);
    }
  };

if ($("energy-form")) {
  const presets = [
    ["Chuveiro elétrico", 1, 5500, 0.5, 30],
    ["Geladeira", 1, 150, 9, 30],
    ["Ar-condicionado 9.000 BTU", 1, 800, 8, 30],
    ["TV LED", 1, 100, 5, 30],
    ["Computador", 1, 200, 6, 22],
    ["Máquina de lavar", 1, 500, 1, 12],
    ["Ferro de passar", 1, 1000, 1, 8],
    ["Micro-ondas", 1, 1200, 0.2, 30],
    ["Air fryer", 1, 1500, 0.5, 20],
    ["Lâmpada LED 9 W", 8, 9, 6, 30],
    ["Ventilador", 1, 100, 8, 30],
    ["Secador de cabelo", 1, 1500, 0.2, 20],
    ["Carregador de celular", 2, 10, 3, 30],
    ["Outro aparelho", 1, 100, 1, 30],
  ];
  $("energy-preset").innerHTML = presets.map((p, i) => `<option value="${i}">${p[0]}</option>`).join("");
  const addRow = ([name, qty, w, h, d]) => {
    const row = document.createElement("div");
    row.className = "energy-row";
    row.innerHTML = `<label class="energy-name">Aparelho<input type="text" value="${name}" maxlength="40"></label><label>Qtd.<input type="number" min="0" step="1" value="${qty}"></label><label>Potência (W)<input type="number" min="0" step="1" value="${w}"></label><label>Horas/dia<input type="number" min="0" max="24" step=".1" value="${h}"></label><label>Dias/mês<input type="number" min="0" max="31" step="1" value="${d}"></label><button type="button" class="text-button" aria-label="Remover ${name}">✕</button>`;
    row.querySelector("button").onclick = () => row.remove();
    $("energy-rows").append(row);
  };
  presets.slice(0, 5).forEach(addRow);
  $("energy-add").onclick = () => addRow(presets[Number($("energy-preset").value)]);
  $("energy-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const rows = [...document.querySelectorAll(".energy-row")].map((row) => {
        const [name, ...nums] = [...row.querySelectorAll("input")].map((i) => i.value);
        const [qty, watts, hours, days] = nums.map(Number);
        return { name: name.trim() || "Aparelho", qty, watts, hours, days };
      });
      if (!rows.length) throw Error("Adicione pelo menos um aparelho.");
      const r = energy(rows, n("energy-tariff"), Number($("energy-flag").value));
      const sorted = [...r.items].sort((a, b) => b.kwh - a.kwh);
      const table = document.createElement("table");
      table.innerHTML = "<thead><tr><th>Aparelho</th><th>kWh/mês</th><th>R$/mês</th><th>%</th></tr></thead>";
      const tb = document.createElement("tbody");
      for (const i of sorted) {
        const tr = document.createElement("tr");
        for (const v of [i.name, fmt(i.kwh, 1), currency(i.cost), r.kwh ? fmt((i.kwh / r.kwh) * 100, 0) + "%" : "0%"]) {
          const td = document.createElement("td");
          td.textContent = v;
          tr.append(td);
        }
        tb.append(tr);
      }
      table.append(tb);
      $("energia-result").innerHTML = `<p class="eyebrow">ESTIMATIVA MENSAL</p><div class="number">${currency(r.cost)}</div><p>${fmt(r.kwh, 1)} kWh por mês.${sorted[0] && sorted[0].kwh > 0 ? ' O maior consumo é: <b class="hl"></b>.' : ""}</p>`;
      if (sorted[0]) $("energia-result").querySelector(".hl")?.append(sorted[0].name);
      $("energia-result").append(table);
      const note = document.createElement("p");
      note.className = "form-note";
      note.textContent = "Estimativa sem taxas fixas, iluminação pública e impostos que não estejam na tarifa informada. Geladeira e ar-condicionado ligam e desligam; as horas representam o tempo efetivo de funcionamento.";
      $("energia-result").append(note);
    } catch (error) {
      fail("energia-result", error);
    }
  };
}

if ($("measure-form")) {
  $("measure-ing").innerHTML = Object.keys(INGREDIENTES).map((k) => `<option>${k}</option>`).join("");
  const run = () => {
    try {
      const ing = $("measure-ing").value;
      const r = measure(n("measure-qty"), $("measure-unit").value, ing);
      const g = INGREDIENTES[ing];
      $("medidas-result").innerHTML = `<p class="eyebrow">${ing.toUpperCase()}</p><div class="number">${fmt(r.g, 0)} <small>g</small></div><p>≈ ${fmt(r.ml, 0)} ml · ${fmt(r.cups, 2)} xícara(s) · ${fmt(r.tbsp, 1)} colher(es) de sopa</p><table><thead><tr><th>Medida</th><th>Peso aproximado</th></tr></thead><tbody><tr><td>1 xícara</td><td>${fmt(g, 0)} g</td></tr><tr><td>½ xícara</td><td>${fmt(g / 2, 0)} g</td></tr><tr><td>⅓ xícara</td><td>${fmt(g / 3, 0)} g</td></tr><tr><td>¼ xícara</td><td>${fmt(g / 4, 0)} g</td></tr><tr><td>1 colher de sopa</td><td>${fmt(g / 16, 1)} g</td></tr><tr><td>1 colher de chá</td><td>${fmt(g / 48, 1)} g</td></tr></tbody></table><p class="form-note">Valores aproximados para medidas niveladas. Para confeitaria, prefira a balança.</p>`;
    } catch (error) {
      fail("medidas-result", error);
    }
  };
  $("measure-form").onsubmit = (e) => {
    e.preventDefault();
    run();
  };
  $("measure-ing").onchange = run;
  $("measure-unit").onchange = run;
}

if ($("bbq-form"))
  $("bbq-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const r = barbecue(n("bbq-men"), n("bbq-women"), n("bbq-kids"), n("bbq-drinkers"), n("bbq-hours"));
      $("churrasco-result").innerHTML = `<p class="eyebrow">LISTA DE COMPRAS</p><div class="number">${fmt(r.meat, 1)} <small>kg de carne</small></div><table><tbody><tr><td>Carne bovina (picanha, fraldinha, maminha)</td><td>${fmt(r.beef, 1)} kg</td></tr><tr><td>Linguiça</td><td>${fmt(r.sausage, 1)} kg</td></tr><tr><td>Frango (coxinha da asa, coração)</td><td>${fmt(r.chicken, 1)} kg</td></tr><tr><td>Pão de alho</td><td>${r.garlicBread} un.</td></tr><tr><td>Carvão</td><td>${r.charcoal} kg</td></tr><tr><td>Cerveja</td><td>${fmt(r.beer, 1)} L (≈ ${Math.ceil((r.beer * 1000) / 350)} latas)</td></tr><tr><td>Refrigerante</td><td>${fmt(r.soda, 1)} L</td></tr><tr><td>Água</td><td>${fmt(r.water, 1)} L</td></tr><tr><td>Gelo</td><td>${r.ice} kg</td></tr></tbody></table><p class="form-note">Divisão sugerida: 60% bovina, 20% linguiça e 20% frango. Acima de 4 horas, a calculadora acrescenta 10% por hora. Inclua arroz, farofa, vinagrete e opções vegetarianas conforme o grupo.</p>`;
    } catch (error) {
      fail("churrasco-result", error);
    }
  };

if ($("wallpaper-form"))
  $("wallpaper-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const r = wallpaper(n("wp-width"), n("wp-height"), n("wp-discount"), n("wp-roll-width"), n("wp-roll-length"), n("wp-repeat"));
      $("papel-result").innerHTML = `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${r.rolls} <small>rolo(s)</small></div><p>${r.strips} faixa(s) de ${fmt(r.stripLength)} m (altura + rapport + 10 cm para acabamento). Cada rolo rende ${r.perRoll} faixa(s).</p><p>Considere um rolo extra para reparos futuros, principalmente em estampas com casamento.</p>`;
    } catch (error) {
      fail("papel-result", error);
    }
  };

if ($("floor-form"))
  $("floor-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const r = floor(n("floor-width"), n("floor-length"), n("floor-waste"), n("floor-box"));
      const x = floorExtras(n("floor-width"), n("floor-length"), n("floor-doors"));
      const price = n("floor-price");
      $("piso-result").innerHTML = `<p class="eyebrow">QUANTIDADE ESTIMADA</p><div class="number">${r.boxes} <small>caixas</small></div><p>Área do ambiente: ${fmt(r.area)} m²<br>Com margem: ${fmt(r.buy)} m²<br>Compra em caixas inteiras: ${fmt(r.purchased)} m²</p><p class="highlight">Rodapé: ${x.baseboard} m lineares · Argamassa: ${x.mortarBags} saco(s) de 20 kg${price > 0 ? `<br>Custo do piso: ${currency(r.purchased * price)}` : ""}</p><p>Argamassa estimada em 5 kg/m² (colagem simples). Peças grandes e dupla colagem consomem mais: siga o fabricante.</p>`;
    } catch (error) {
      fail("piso-result", error);
    }
  };

if ($("budget-form")) {
  const tipos = {
    paint: [35, "m² de parede", "m² de parede"],
    floor: [150, "m² de piso", "m² de piso"],
    wall: [160, "m² de revestimento", "m² de revestimento"],
    ceiling: [90, "m² de forro", "m² de forro"],
    light: [180, "pontos de luz", "ponto de luz"],
    joinery: [1500, "metros lineares", "metro linear"],
  };
  $("intervention").onchange = () => {
    const mode = $("intervention").value;
    const [price, unit, singular] = tipos[mode];
    $("unit").value = price;
    $("quantity").parentElement.firstChild.textContent = `Quantidade (${unit})`;
    $("quantity").value = mode === "light" ? 4 : mode === "joinery" ? 3 : 30;
    $("quantity").step = mode === "light" ? "1" : ".1";
    $("budget-note").textContent = `Premissa ilustrativa: ${currency(price)} por ${singular}, materiais e mão de obra. Ajuste com uma cotação local.`;
  };
  $("budget-form").onsubmit = (e) => {
    e.preventDefault();
    const q = n("quantity"),
      unit = n("unit"),
      reserve = n("reserve");
    if (![q, unit, reserve].every(Number.isFinite) || q <= 0 || unit <= 0 || reserve < 0 || ($("intervention").value === "light" && !Number.isInteger(q))) {
      fail("reforma-result", Error("Confira os valores. Pontos de luz devem ser inteiros."));
      return;
    }
    const base = q * unit,
      total = base * (1 + reserve / 100);
    $("reforma-result").innerHTML = `<p class="eyebrow">${$("room").value.toUpperCase()} · ESTIMATIVA</p><div class="number" style="font-size:38px">${currency(total)}</div><p>Subtotal: ${currency(base)}<br>Reserva (${reserve}%): ${currency(total - base)}</p><p>Referência de planejamento, não cotação. Peça ao menos três orçamentos com escopo detalhado. Demolição, entulho e alterações estruturais não estão incluídos.</p>`;
  };
}

if ($("schedule-form")) {
  let schedule = null;
  const key = "casa-harmonia-schedule-v1";
  const groups = ["Diário", "Semanal", "Mensal"];
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(schedule));
      $("storage-status").textContent = "Cronograma salvo neste navegador.";
    } catch {
      $("storage-status").textContent = "Não foi possível salvar neste navegador. Use a exportação para guardar o plano.";
    }
  }
  function progress() {
    const done = schedule.items.filter((t) => t.done).length;
    const pct = Math.round((done / schedule.items.length) * 100);
    $("progress").hidden = false;
    $("progress").querySelector("span").style.width = pct + "%";
    $("progress").querySelector("b").textContent = `${done} de ${schedule.items.length} tarefas · ${pct}%`;
  }
  function render() {
    const root = $("checklist");
    root.replaceChildren();
    for (const group of groups) {
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
            progress();
          };
          label.append(input, document.createTextNode(t.text));
          root.append(label);
        });
    }
    $("export").hidden = false;
    $("reset-schedule").hidden = false;
    progress();
  }
  $("schedule-form").onsubmit = (e) => {
    e.preventDefault();
    const minutes = n("routine"),
      size = $("size").value;
    const zones = size === "small" ? "um ambiente" : size === "medium" ? "dois ambientes" : "um setor da casa por vez";
    const items = [
      ["Diário", `Reservar ${Math.min(minutes, 15)} minutos para devolver objetos ao lugar.`],
      ["Diário", "Lavar a louça ou esvaziar a lava-louças e liberar a pia."],
      ["Diário", "Passar pano na bancada e no fogão após cozinhar."],
      ["Diário", "Separar roupas usadas e levar o lixo orgânico."],
      ["Diário", "Arrumar a cama ao levantar."],
      ["Semanal", `Revisar ${zones}, alternando os demais ao longo da semana.`],
      ["Semanal", "Limpar banheiro: vaso, pia, box e espelho."],
      ["Semanal", "Trocar roupa de cama e toalhas."],
      ["Semanal", "Aspirar ou varrer e passar pano no piso."],
      ["Semanal", "Tirar o pó de móveis e eletrônicos."],
      ["Semanal", "Conferir a geladeira e planejar as refeições."],
      ["Semanal", minutes === 15 ? "Dividir tarefas maiores em blocos de 15 minutos em dias diferentes." : `Reservar um bloco de ${minutes} minutos para cozinha e áreas de maior uso.`],
      ["Mensal", "Limpar a geladeira e descartar itens vencidos."],
      ["Mensal", "Lavar lixeiras e limpar o micro-ondas."],
      ["Mensal", "Escolher uma gaveta ou prateleira para organizar e separar doações."],
      ["Mensal", "Limpar filtros (ar-condicionado, coifa, máquina de lavar) conforme os manuais."],
      ["Mensal", "Limpar vidros e janelas."],
    ];
    if ($("has-pets").checked)
      items.push(["Diário", "Limpar a caixa de areia ou o tapete higiênico e trocar a água do pet."], ["Semanal", "Lavar caminhas, potes e cobertas do pet."]);
    if ($("has-kids").checked)
      items.push(["Diário", "Guardar brinquedos com as crianças antes de dormir."], ["Mensal", "Separar brinquedos e roupas que não servem mais."]);
    if ($("has-plants").checked)
      items.push(["Semanal", "Verificar a umidade da terra e regar quem precisa."], ["Mensal", "Limpar folhas, girar vasos e adubar quando indicado."]);
    schedule = { size, minutes, items: items.map(([group, text]) => ({ group, text, done: false })) };
    save();
    render();
  };
  $("reset-schedule").onclick = () => {
    if (!schedule) return;
    schedule.items.forEach((t) => (t.done = false));
    save();
    render();
  };
  $("export").onclick = () => {
    if (!schedule) return;
    const text = "CASA E HARMONIA — MEU CRONOGRAMA\n\n" + schedule.items.map((t) => `${t.group} · [${t.done ? "x" : " "}] ${t.text}`).join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cronograma-casa-e-harmonia.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (data && Array.isArray(data.items) && data.items.length && data.items.every((t) => groups.includes(t.group) && typeof t.text === "string" && typeof t.done === "boolean")) {
      schedule = data;
      $("size").value = data.size;
      $("routine").value = data.minutes;
      render();
    }
  } catch {
    $("storage-status").textContent = "Gere um novo cronograma para começar.";
  }
}

if ($("palette")) {
  const palettes = {
    natural: ["Natural e acolhedora", ["Creme", "#F0E8D7"], ["Sálvia", "#A4B398"], ["Terracota", "#AF624C"]],
    solar: ["Solar e criativa", ["Areia", "#F3E5CC"], ["Ocre", "#D6AD52"], ["Azul profundo", "#385C6A"]],
    serena: ["Serena e fresca", ["Névoa", "#E8EDE7"], ["Azul suave", "#A3BDC3"], ["Oliva", "#737C50"]],
    japandi: ["Japandi minimalista", ["Branco quente", "#F4F0E8"], ["Madeira clara", "#C8A27A"], ["Grafite", "#3E4142"]],
    terrosa: ["Terrosa e quente", ["Argila clara", "#E9D5C0"], ["Caramelo", "#B9773F"], ["Verde-musgo", "#5B6B3A"]],
    noturna: ["Sofisticada e escura", ["Off-white", "#EFEDE7"], ["Azul-petróleo", "#24464F"], ["Dourado velho", "#B38B45"]],
  };
  const render = () => {
    const [name, ...colors] = palettes[$("palette").value];
    $("palette-preview").innerHTML =
      `<h3>${name}</h3><div class="room-preview" style="--base:${colors[0][1]};--apoio:${colors[1][1]};--destaque:${colors[2][1]}" role="img" aria-label="Simulação de sala com as cores da paleta"><span class="rp-sofa"></span><span class="rp-art"></span><span class="rp-pillow"></span></div><div class="swatches">` +
      colors.map(([cname, hex], i) => `<div class="swatch"><span style="background:${hex}"></span><small>${["Base · 60%", "Apoio · 30%", "Destaque · 10%"][i]}<br>${cname}<br><button type="button" class="copy-hex" data-hex="${hex}">${hex} ⧉</button></small></div>`).join("") +
      "</div>";
    $("palette-preview").querySelectorAll(".copy-hex").forEach((b) => {
      b.onclick = async () => {
        try {
          await navigator.clipboard.writeText(b.dataset.hex);
          b.textContent = "Copiado ✓";
        } catch {
          b.textContent = b.dataset.hex;
        }
      };
    });
  };
  $("palette").onchange = render;
  render();
}

/* --------------------------- Busca e filtros --------------------------- */
if (document.querySelectorAll)
  document.querySelectorAll("[data-search]").forEach((box) => {
    const id = box.dataset.search;
    const grid = document.querySelector(`[data-grid="${id}"]`);
    if (!grid) return;
    const cards = [...grid.children];
    const count = $(`${id}-count`);
    const filter = () => {
      const q = norm($(`${id}-search`).value.trim()),
        cat = $(`${id}-filter`).value;
      let total = 0;
      cards.forEach((c) => {
        c.hidden = !(norm(c.textContent).includes(q) && (!cat || c.dataset.category === cat));
        if (!c.hidden) total++;
      });
      count.textContent = `Resultados: ${total} ${count.dataset.label}`;
      $(`${id}-empty`).hidden = total > 0;
    };
    $(`${id}-search`).oninput = filter;
    $(`${id}-filter`).onchange = filter;
    document.querySelectorAll("[data-filter]").forEach(
      (a) =>
        (a.onclick = () => {
          $(`${id}-filter`).value = a.dataset.filter;
          $(`${id}-search`).value = "";
          filter();
        }),
    );
  });

/* ------------------------------ Receitas ------------------------------ */
if ($("servings")) {
  const base = Number(document.querySelector(".recipe").dataset.base);
  const update = () => {
    const v = Math.max(1, Math.min(200, Math.round(n("servings")) || base));
    const plural = [["lata", "latas"], ["xícara", "xícaras"], ["colher (sopa)", "colheres (sopa)"], ["colher (chá)", "colheres (chá)"], ["medida", "medidas"], ["dente", "dentes"]];
    document.querySelectorAll(".qty").forEach((q) => {
      const val = (Number(q.dataset.qty) * v) / base;
      q.textContent = fmtQty(val);
      const u = q.parentElement.querySelector(".unit");
      const pair = u && plural.find((p) => p.includes(u.textContent));
      if (pair) u.textContent = pair[val > 1 ? 1 : 0];
    });
  };
  $("servings").oninput = update;
  document.querySelectorAll(".step").forEach(
    (b) =>
      (b.onclick = () => {
        $("servings").value = Math.max(1, n("servings") + Number(b.dataset.step));
        update();
      }),
  );
  $("copy-ingredients").onclick = async () => {
    const text = [...document.querySelectorAll(".ing-list li")].map((li) => (li.classList.contains("ing-group") ? `\n${li.textContent}:` : `- ${li.textContent.trim()}`)).join("\n");
    try {
      await navigator.clipboard.writeText(`${document.querySelector("h1").textContent}\n${text}`);
      $("copy-status").textContent = "Lista copiada para a área de transferência.";
    } catch {
      $("copy-status").textContent = "Não foi possível copiar automaticamente. Selecione a lista e copie.";
    }
  };
}

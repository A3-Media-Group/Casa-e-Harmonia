/* Calculadora de consumo de energia por aparelho. */
(function () {
  function energy(rows, tariff, flag = 0) {
    CH.exigir(tariff, "a tarifa", { min: 0, minExclusivo: true, max: 10 });
    CH.exigir(flag, "o acréscimo da bandeira", { min: 0 });
    if (!rows.length) throw Error("Adicione pelo menos um aparelho.");
    const items = rows.map((r) => {
      CH.exigir(r.qty, `a quantidade de "${r.name}"`, { min: 0, inteiro: true });
      CH.exigir(r.watts, `a potência de "${r.name}"`, { min: 0 });
      CH.exigir(r.hours, `as horas por dia de "${r.name}"`, { min: 0, max: 24 });
      CH.exigir(r.days, `os dias por mês de "${r.name}"`, { min: 0, max: 31 });
      const kwh = (r.qty * r.watts * r.hours * r.days) / 1000;
      return { ...r, kwh, cost: kwh * (tariff + flag) };
    });
    const kwh = items.reduce((s, i) => s + i.kwh, 0);
    return { items, kwh, cost: kwh * (tariff + flag) };
  }
  const PRESETS = [
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
  const fmtCampo = (n) => String(n).replace(".", ",");
  function linha([name, qty, w, h, d]) {
    const row = document.createElement("div");
    row.className = "energy-row";
    row.innerHTML = `<label class="campo energy-name"><span>Aparelho</span><input type="text" maxlength="40"></label><label class="campo"><span>Qtd.</span><input type="text" inputmode="numeric" value="${CH.esc(qty)}"></label><label class="campo"><span>Potência (W)</span><input type="text" inputmode="decimal" value="${CH.esc(fmtCampo(w))}"></label><label class="campo"><span>Horas/dia</span><input type="text" inputmode="decimal" value="${CH.esc(fmtCampo(h))}"></label><label class="campo"><span>Dias/mês</span><input type="text" inputmode="numeric" value="${CH.esc(d)}"></label><button type="button" class="text-button" aria-label="Remover aparelho">✕</button>`;
    row.querySelector("input").value = name;
    row.querySelector("button").onclick = () => row.remove();
    return row;
  }
  const ler = (root) =>
    [...root.querySelectorAll(".energy-row")].map((row) => {
      const [name, ...nums] = [...row.querySelectorAll("input")].map((i) => i.value);
      const [qty, watts, hours, days] = nums.map(CH.num);
      return { name: name.trim() || "Aparelho", qty, watts, hours, days };
    });
  CH.registrar("calculadora-de-consumo-de-energia", {
    fn: { energy },
    montar(root) {
      const box = root.querySelector("#energy-rows");
      const sel = root.querySelector("#energy-preset");
      sel.innerHTML = PRESETS.map((p, i) => `<option value="${i}">${p[0]}</option>`).join("");
      PRESETS.slice(0, 5).forEach((p) => box.append(linha(p)));
      root.querySelector('[data-acao="add-aparelho"]').onclick = () => box.append(linha(PRESETS[Number(sel.value)]));
    },
    restaurar(root, p) {
      const v = p.get("aparelhos");
      if (!v) return;
      root.querySelector("#energy-rows").replaceChildren(...v.split("|").map((s) => linha(s.split("~"))));
    },
    serializar: (root) => ({
      aparelhos: [...root.querySelectorAll(".energy-row")].map((row) => [...row.querySelectorAll("input")].map((i) => i.value.replace(/[|~]/g, " ")).join("~")).join("|"),
    }),
    calcular(v, root) {
      const r = energy(ler(root), v.tarifa, CH.num(v.bandeira));
      const ord = [...r.items].sort((a, b) => b.kwh - a.kwh);
      const linhas = ord.map((i) => `<tr><td>${CH.esc(i.name)}</td><td>${CH.fmt(i.kwh, 1)}</td><td>${CH.moeda(i.cost)}</td><td>${r.kwh ? CH.fmt((i.kwh / r.kwh) * 100, 0) : 0}%</td></tr>`).join("");
      return {
        html: `<p class="eyebrow">ESTIMATIVA MENSAL</p><div class="number">${CH.moeda(r.cost)}</div><p>${CH.fmt(r.kwh, 1)} kWh por mês.${ord[0] && ord[0].kwh > 0 ? ` Maior consumo: <b>${CH.esc(ord[0].name)}</b>.` : ""}</p><table><thead><tr><th>Aparelho</th><th>kWh/mês</th><th>R$/mês</th><th>%</th></tr></thead><tbody>${linhas}</tbody></table>`,
        texto: `Consumo estimado: ${CH.fmt(r.kwh, 1)} kWh/mês, ${CH.moeda(r.cost)}. Maior consumo: ${ord[0] ? ord[0].name : "-"}.`,
      };
    },
  });
})();

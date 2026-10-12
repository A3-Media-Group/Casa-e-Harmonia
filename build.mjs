import fs from "node:fs";
import { imagens } from "./data/imagens.mjs";
import { artigosNovos } from "./data/artigos.mjs";
import { dicas, ideias } from "./data/dicas.mjs";

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const origin = process.env.SITE_URL || "https://casaeharmonia.com.br";
const HOJE = "2026-10-12";
const HOJE_TXT = "12 de outubro de 2026";
const topics = [
  [
    "japandi",
    "Decoração",
    "Japandi: simplicidade que acolhe",
    "Estilo Japandi: como criar uma casa leve e acolhedora",
    "O estilo Japandi une a simplicidade japonesa ao aconchego escandinavo. Mais do que comprar móveis claros, a proposta é escolher menos peças, valorizar materiais e deixar espaço para a vida acontecer.",
    "Comece pelo que você já tem|Retire os objetos sem função e observe a circulação. Uma mesa de madeira, uma manta de textura natural e uma luminária bem posicionada já ajudam a construir uma composição tranquila. Não é necessário trocar todos os móveis.",
    "Escolha uma paleta com profundidade|Combine branco quente, madeira e pequenos pontos de grafite. Use o verde das plantas como cor de apoio. Teste amostras de tinta em paredes diferentes e observe a aparência pela manhã e à noite.",
    "Texturas antes de enfeites|Linho, algodão, cerâmica e fibras trazem variedade sem excesso visual. Prefira um objeto de escala adequada a muitos acessórios pequenos. Reserve superfícies livres para o uso cotidiano.",
    "Como aplicar em uma sala pequena?|Meça a circulação antes de comprar. Escolha móveis proporcionais e mantenha os caminhos livres; uma peça multifuncional pode substituir duas.",
    "É preciso usar apenas bege?|Não. Contrastes escuros e cores naturais funcionam bem quando a composição é equilibrada.",
    "tinta",
  ],
  [
    "biofilia",
    "Jardinagem",
    "Um pouco mais de natureza, dentro de casa",
    "Design biofílico em apartamentos pequenos: por onde começar",
    "O design biofílico em apartamentos pequenos aproxima a rotina da natureza por meio de luz, vegetação, ventilação e materiais. Comece entendendo seu espaço, sem transformar a casa em uma coleção difícil de cuidar.",
    "Mapeie a luz de cada janela|Observe onde há sol direto e por quanto tempo. Claridade não é igual a sol. Escolha espécies compatíveis com as condições reais e evite vasos em ambientes totalmente escuros.",
    "Crie um ponto verde possível|Agrupe poucos vasos em um suporte estável e com proteção contra água. Preserve passagens e acesso às janelas. Uma planta bem cuidada faz mais sentido que muitas em condições inadequadas.",
    "Combine elementos naturais|Madeira, tecidos e vistas para áreas externas também participam da experiência. Abra cortinas quando apropriado e posicione a área de leitura perto da luz natural sem ofuscamento.",
    "Preciso de uma parede verde?|Não. Vasos, iluminação natural e materiais já permitem começar com menos manutenção.",
    "Posso colocar plantas no banheiro?|Somente se houver luz e ventilação adequadas à espécie. Um banheiro sem janela geralmente não atende essas condições.",
    "organizacao",
  ],
  [
    "iluminacao-led",
    "Arquitetura",
    "A luz certa muda tudo",
    "LED quente ou frio: escolha a luz de cada cômodo",
    "Escolher LED quente ou frio depende da atmosfera desejada e da tarefa. A temperatura de cor, expressa em kelvin, descreve a aparência da luz; ela não indica sozinha a luminosidade ou o consumo.",
    "Entenda os kelvin|Luzes de 2700 a 3000 K costumam criar sensação acolhedora. Em torno de 4000 K, a aparência é mais neutra. Valores maiores produzem luz mais fria. Compare lâmpadas no próprio ambiente.",
    "Planeje por atividade|Na sala, combine iluminação geral e luz de leitura. Na cozinha, ilumine a bancada sem projetar a sombra do corpo sobre o trabalho. No banheiro, luz frontal ou lateral ao espelho reduz sombras no rosto.",
    "Leia além da potência|Verifique lúmens, índice de reprodução de cor e compatibilidade com dimmer. Watts medem consumo, não brilho. Instalações e alterações de circuito devem ser feitas por profissional qualificado.",
    "Luz fria ilumina mais?|Não necessariamente. Compare os lúmens, a distribuição e a posição da luminária.",
    "Posso misturar temperaturas?|Sim, em cenas ou áreas distintas. Evite diferenças involuntárias entre lâmpadas lado a lado.",
    "reforma",
  ],
  [
    "plantas-para-sala",
    "Jardinagem",
    "7 plantas para uma sala mais viva",
    "7 plantas resistentes para a sala: cuidados sem mitos",
    "Plantas para a sala trazem vida ao ambiente, mas não substituem ventilação ou controle de poluentes. A fama de “purificar o ar” vem de resultados de laboratório que não se traduzem em uma limpeza relevante em casas comuns.",
    "Escolha pela luz, não pela aparência|Zamioculca e espada-de-são-jorge toleram intervalos maiores entre regas, mas ainda precisam de luz. Jiboia se adapta à luz indireta; clorofito prefere boa claridade. Nenhuma espécie é indestrutível.",
    "Mais três opções para conhecer|Peperômia, aspidistra e palmeira-chamaedórea ampliam as opções de formatos. As necessidades variam entre espécies e cultivares; confirme o nome botânico e os cuidados com o produtor.",
    "Regue observando o substrato|Verifique a umidade antes de regar, use vasos com drenagem e não deixe água acumulada. A frequência muda com o clima e a luz. Mantenha espécies potencialmente tóxicas longe de crianças e animais e confira a identificação antes de comprar.",
    "Plantas realmente purificam o ar da sala?|Não em escala suficiente para substituir ventilação em condições domésticas habituais.",
    "Qual é o erro mais comum?|Regar por calendário sem observar a umidade, a drenagem e a necessidade da espécie.",
    "organizacao",
  ],
  [
    "cozinha-funcional",
    "Organização",
    "Cada centímetro pode trabalhar a seu favor",
    "Cozinha funcional: 10 soluções para aproveitar o espaço",
    "Uma cozinha funcional começa com o percurso entre guardar, lavar, preparar e cozinhar. Antes de encomendar marcenaria, meça eletrodomésticos, aberturas e pontos existentes e liste o que precisa ficar acessível.",
    "1 a 4: organize o uso diário|1. Gavetas com divisores ajustáveis. 2. Panelas perto do preparo. 3. Despensa com prateleiras reguláveis. 4. Lixeira em posição acessível. Essas escolhas reduzem movimentos e evitam pilhas difíceis de usar.",
    "5 a 7: aproveite sem apertar|5. Gavetões para itens pesados nas áreas baixas. 6. Soluções de canto escolhidas pela frequência de uso. 7. Nichos dimensionados para os aparelhos, respeitando a ventilação indicada pelo fabricante.",
    "8 a 10: detalhe antes de executar|8. Porta-temperos longe de calor intenso. 9. Divisórias verticais para formas. 10. Espaço para produtos de limpeza separado dos alimentos. Confira ferragens, abertura das portas e acesso para manutenção.",
    "Armários até o teto valem a pena?|Podem ampliar o armazenamento de itens pouco usados, desde que o acesso seja seguro.",
    "Devo comprar os aparelhos primeiro?|Defina modelos e consulte suas medidas e folgas técnicas antes de aprovar a marcenaria.",
    "reforma",
  ],
  [
    "casa-inteligente",
    "Funcionalidades",
    "Uma casa inteligente começa pequena",
    "Casa inteligente acessível: automatize uma tarefa por vez",
    "Uma casa inteligente acessível começa com um problema concreto: apagar uma luz esquecida, programar uma luminária ou controlar um aparelho compatível. Escolha um primeiro uso e amplie depois de testar.",
    "Comece com uma rotina simples|Uma lâmpada conectada pode criar horários e cenas. Uma tomada inteligente pode controlar equipamentos dentro de sua capacidade elétrica. Verifique tensão, corrente, potência e as restrições do fabricante antes de conectar.",
    "Confira a compatibilidade|Veja se o produto exige hub, qual rede Wi-Fi utiliza e quais plataformas suporta. O selo Matter pode ajudar na interoperabilidade, mas recursos específicos ainda variam por dispositivo e controlador.",
    "Proteja o acesso|Use senhas únicas, atualizações e autenticação adicional quando disponível. Considere se o produto mantém controles físicos e funções úteis sem internet. Evite depender de automação para uma tarefa crítica.",
    "Preciso de assistente de voz?|Não. Muitos dispositivos podem ser controlados pelo aplicativo ou por programação.",
    "Qual o primeiro investimento?|Um dispositivo compatível com uma necessidade real. Compare custo total, incluindo eventual hub.",
    "reforma",
  ],
  [
    "cores-terrosas",
    "Decoração",
    "O aconchego mora nas cores",
    "Cores terrosas na sala: combinações que acolhem",
    "Cores terrosas na sala criam uma base expressiva com terracota, areia, argila e marrom. O interesse por tons naturais aparece em pesquisas internacionais de decoração; em casa, a melhor escolha depende da luz e dos materiais existentes.",
    "Escolha uma cor protagonista|Use uma parede ou um móvel como ponto de partida e mantenha as demais superfícies mais tranquilas. Compare a cor com o piso: madeiras avermelhadas e amareladas produzem efeitos diferentes.",
    "Monte três combinações|Terracota com branco quente cria contraste suave. Marrom com verde-oliva aproxima a composição da natureza. Areia com grafite produz uma leitura mais sóbria. Ajuste a proporção ao tamanho e à luminosidade do ambiente.",
    "Teste antes de pintar|Aplique amostras conforme orientação do fabricante e observe sob luz natural e artificial. Calcule a área líquida e confirme rendimento, demãos e preparação da superfície no rótulo.",
    "Cores escuras diminuem a sala?|A percepção depende do conjunto. Boa iluminação e contraste planejado podem criar profundidade.",
    "Como começar sem pintar?|Use capas de almofada, uma manta ou cerâmica em uma cor escolhida.",
    "tinta",
  ],
  [
    "organizacao-5s",
    "Organização",
    "Menos bagunça. Mais espaço para viver.",
    "Organização minimalista: aplique o método 5S em casa",
    "Organização minimalista com o método 5S adapta cinco práticas de gestão à rotina doméstica: utilização, ordenação, limpeza, padronização e disciplina. O objetivo é facilitar o cotidiano, não impor uma casa de catálogo.",
    "Separe e dê um lugar a cada coisa|Comece por uma gaveta. Diferencie o que é usado, o que pode ser doado e o que precisa de descarte adequado. Guarde cada item perto de onde ele é utilizado, com acesso compatível à frequência de uso.",
    "Limpe e simplifique a manutenção|Limpe a área antes de reorganizar. Evite comprar caixas antes de conhecer o volume que ficará. Use etiquetas apenas quando ajudarem outras pessoas da casa a manter o sistema.",
    "Crie uma rotina que caiba no dia|Reserve um bloco curto para devolver objetos ao lugar. Distribua tarefas semanais e mensais conforme disponibilidade, compartilhando responsabilidades. Reavalie o sistema quando uma etapa não funcionar.",
    "Preciso organizar tudo de uma vez?|Não. Uma área pequena concluída costuma ser mais sustentável que várias interrompidas.",
    "Como manter a organização?|Crie lugares simples de usar e uma revisão curta e recorrente, adaptada à sua rotina.",
    "organizacao",
  ],
  [
    "sofa-perfeito",
    "Decoração",
    "O sofá certo para a sua vida real",
    "Como escolher o sofá: medidas, tecidos e conforto",
    "Escolher o sofá exige olhar além da aparência. Medidas do ambiente, acesso ao imóvel, profundidade do assento e tecido devem funcionar para quem senta, deita, recebe visitas e limpa a casa.",
    "Meça o caminho inteiro|Confira portas, corredores, elevador e escadas, além da parede onde o sofá ficará. Marque o tamanho no piso com fita e simule a circulação, considerando a abertura de modelos retráteis.",
    "Experimente o conforto|Sente e apoie as costas na posição habitual. A densidade da espuma não é uma nota universal de qualidade: construção, camadas, molas e recomendação de uso também importam. Consulte o fabricante.",
    "Escolha o tecido pela rotina|Considere manutenção, resistência e sensação ao toque. Capas removíveis facilitam alguns cuidados, mas devem seguir as instruções de lavagem. Peça amostras para ver cor e textura na luz da casa.",
    "Densidade maior é sempre melhor?|Não. Ela deve ser avaliada junto ao conjunto do assento e ao uso previsto.",
    "Qual medida devo priorizar?|Largura, profundidade e altura, somadas às folgas de circulação e ao percurso de entrega.",
    "organizacao",
  ],
  [
    "varanda-pequena",
    "Arquitetura",
    "Sua varanda, um novo lugar de encontro",
    "Varanda gourmet pequena: ideias para receber com conforto",
    "Uma varanda gourmet pequena pode ser um lugar agradável de convivência quando o projeto respeita circulação, ventilação e limites da edificação. Comece definindo como você quer usar o espaço no dia a dia.",
    "Defina a atividade principal|Se a prioridade é tomar café, uma mesa compacta pode bastar. Para refeições, avalie assentos proporcionais e móveis dobráveis. Não preencha a varanda antes de testar a circulação com portas abertas.",
    "Escolha materiais para a exposição|Considere sol, chuva e vento antes de escolher madeira, tecidos e ferragens. Use vasos estáveis e mantenha ralos e acessos desobstruídos. Inclua luz de apoio adequada às condições de instalação.",
    "Verifique antes de transformar|Fechamentos, equipamentos, pontos elétricos e churrasqueiras exigem verificação das regras do condomínio e avaliação técnica quando aplicável. Não improvise combustão em ambientes fechados nem sobrecarregue a estrutura.",
    "Posso instalar qualquer churrasqueira?|Não. Confirme as condições de exaustão, a infraestrutura e as regras aplicáveis antes da compra.",
    "Como aproveitar uma varanda estreita?|Use peças rasas, escolha uma função principal e preserve uma passagem confortável.",
    "reforma",
  ],
  [
    "cores-sala-pequena",
    "Decoração",
    "Sala pequena, personalidade de sobra",
    "Cores para sala pequena: monte uma paleta que combina com você",
    "Uma sala pequena pode ter cor sem perder a leveza. Comece pelas peças que ficam e escolha uma mudança por vez: uma parede, uma cortina ou uma composição de almofadas.",
    "Observe a base da sua sala|Fotografe mentalmente os elementos que você não vai trocar: piso, sofá e marcenaria. Escolha uma cor de fundo que converse com eles e uma cor de destaque. Não existe obrigação de pintar tudo de branco.",
    "Experimente antes de pintar|Faça uma amostra na parede e observe de manhã e à noite, com as lâmpadas que usa no dia a dia. A tela serve como inspiração; a aparência real depende da luz, do acabamento e da superfície.",
    "Comece com uma mudança reversível|Em imóvel alugado, confirme as condições para alterações. Tecidos, quadros apoiados em móveis estáveis e luminárias de mesa permitem testar o conjunto. Escolha primeiro o que faz falta na rotina, depois os acessórios.",
    "Posso usar uma cor escura?|Sim, como escolha estética. Teste uma amostra e avalie o ambiente inteiro, sem esperar que a tinta resolva a falta de iluminação.",
    "Como combinar sem comprar tudo de novo?|Repita uma cor que já existe em uma peça e acrescente um contraste em poucos acessórios.",
    "paletas",
  ],
  [
    "como-calcular-tinta",
    "Decoração",
    "Tinta na medida, sem conta em dobro",
    "Como calcular tinta: área, demãos e rendimento acabado",
    "Antes de comprar, meça as paredes e leia a unidade de rendimento da embalagem. Saber se o valor se refere a uma demão ou à pintura acabada muda a conta.",
    "Meça a área que vai receber tinta|Multiplique largura por altura de cada parede, some os resultados e subtraia portas e janelas que não serão pintadas. Uma parede de 4 m por 2,5 m tem 10 m². Com uma abertura de 2 m², ficam 8 m².",
    "Confira o tipo de rendimento|No rendimento por demão, a área é multiplicada pelo número de aplicações. No rendimento acabado, as aplicações previstas já estão consideradas. Se o rótulo trouxer m² por lata, divida esse valor pelos litros da lata para obter m²/L.",
    "Transforme a estimativa em compra|Para 8 m² e rendimento acabado de 4 m²/L, são 2 L antes da margem. Com 10% ilustrativos, a estimativa é 2,2 L. Arredonde para as embalagens disponíveis. A condição da parede e o preparo podem mudar o consumo; siga o fabricante.",
    "Devo multiplicar rendimento acabado pelas demãos?|Não. Use a área dividida pelo rendimento acabado por litro; as demãos previstas já fazem parte desse rendimento.",
    "A margem de 10% é obrigatória?|Não. É uma premissa ajustável de planejamento. Avalie a superfície e a orientação do fabricante.",
    "tinta",
  ],
  [
    "rotina-limpeza",
    "Organização",
    "Uma rotina leve para cuidar da casa",
    "Rotina de limpeza: divida as tarefas sem sobrecarregar o dia",
    "Um cronograma útil começa pela disponibilidade real. Organize as tarefas por prioridade e distribua os cuidados entre quem usa a casa. O plano pode mudar em semanas mais corridas.",
    "Separe manutenção de limpeza maior|No dia a dia, cuide da pia, dos resíduos e dos objetos fora do lugar. Reserve momentos separados para banheiro e piso. Em vez de prometer uma casa inteira em quinze minutos, use esse tempo para concluir uma tarefa.",
    "Monte blocos que cabem na agenda|Escolha um cômodo por vez. Anote o que foi feito e transfira o restante para outro bloco. A frequência depende do uso, da quantidade de moradores e das necessidades do ambiente; o checklist é um ponto de partida.",
    "Use cada produto conforme o rótulo|Não misture produtos de limpeza, mesmo quando cada um parece seguro isoladamente. Mantenha-os na embalagem original, siga as instruções de uso e guarde fora do alcance de crianças e animais.",
    "Preciso limpar tudo todos os dias?|Não. Priorize o que precisa de cuidado imediato e distribua as demais tarefas conforme o uso.",
    "Como acompanhar sem criar uma planilha?|Gere o cronograma na ferramenta, marque as tarefas e exporte uma cópia de texto. Os dados ficam neste navegador.",
    "organizacao",
  ],
];
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const abs = (src) => (src.startsWith("http") ? src : origin + src);

// ---------- Imagens: cada fotografia pertence a um único conteúdo ----------
const donos = new Map();
function img(key, cls = "", { eager = false, dono = key, sizes } = {}) {
  const p = imagens[key];
  if (!p) throw Error("Imagem não registrada: " + key);
  const atual = donos.get(key);
  if (atual && atual !== dono)
    throw Error(`Imagem "${key}" repetida em "${atual}" e "${dono}"`);
  donos.set(key, dono);
  const srcset = p.srcset
    ? ` srcset="${esc(p.srcset)}" sizes="${sizes || "(max-width: 900px) 100vw, 50vw"}"`
    : "";
  return `<img class="${cls}" src="${esc(p.src)}"${srcset} width="1200" height="800" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async" alt="${esc(p.alt)}" onerror="this.onerror=null;this.src='/assets/sem-foto.svg'">`;
}
const credito = (key) => {
  const p = imagens[key];
  return `<p class="photo-credit">Foto: <a href="${esc(p.fonte)}" rel="noopener">${esc(p.credito)}</a>${p.licencaUrl ? ` · <a href="${esc(p.licencaUrl)}" rel="noopener">licença</a>` : ""}</p>`;
};

// ---------- Artigos: originais + novos ----------
const ferramentaPor = {
  tinta: ["/ferramentas.html#tinta", "Calcular a tinta"],
  organizacao: ["/ferramentas.html#organizacao", "Gerar meu cronograma"],
  reforma: ["/ferramentas.html#reforma", "Simular o orçamento"],
  paletas: ["/ferramentas.html#paletas", "Explorar paletas de cores"],
};
const fontesAntigas = {
  "plantas-para-sala": [["Revisão científica sobre plantas e qualidade do ar interior", "https://doi.org/10.1038/s41370-019-0175-9"]],
  japandi: [["Suvinil: escolha de cores e teste na iluminação real", "https://www.suvinil.com.br/cores"]],
  "cores-terrosas": [["Suvinil: escolha de cores e teste na iluminação real", "https://www.suvinil.com.br/cores"]],
  "cores-sala-pequena": [["Suvinil: escolha de cores e teste na iluminação real", "https://www.suvinil.com.br/cores"]],
  "como-calcular-tinta": [["Suvinil: rendimento e cálculo da quantidade de tinta", "https://www.suvinil.com.br/calculadora-de-tinta"]],
  "rotina-limpeza": [["Anvisa: cuidados com misturas de produtos de limpeza", "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2025/todo-cuidado-e-pouco-com-as-misturas-caseiras-para-limpeza-1/"]],
};
const artigos = [
  ...topics.map((t, i) => ({
    slug: t[0],
    cat: t[1],
    card: t[2],
    title: t[3],
    intro: t[4],
    sections: t.slice(5, 8).map((s) => {
      const [h, p] = s.split("|");
      return [h, `<p>${p}</p>`];
    }),
    faq: t.slice(8, 10).map((x) => x.split("|")),
    tool: ferramentaPor[t[10]],
    sources: fontesAntigas[t[0]] || [],
    publicado: i < 10 ? "2026-09-12" : "2026-09-14",
    atualizado: "2026-09-14",
  })),
  ...artigosNovos.map((a) => ({ ...a, publicado: HOJE, atualizado: HOJE, novo: true })),
];
const dataTxt = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][m - 1]} de ${y}`;
};

// ---------- Layout ----------
const nav = `<header><a class="brand" href="/index.html"><img src="/assets/logo.png" alt="Casa e Harmonia" width="150" height="83"></a><nav aria-label="Principal"><a href="/index.html#artigos">Guias</a><a href="/dicas.html">Dicas</a><a href="/ferramentas.html">Ferramentas</a><a href="/sobre.html">Sobre</a></nav><a class="header-cta" href="/ferramentas.html">Ferramentas grátis <span>↗</span></a></header>`;
const footer = `<footer><div><strong>CASA E HARMONIA</strong><p>Ideias para morar bem. Espaço para viver melhor.</p></div><div><b>Explore</b><a href="/index.html#artigos">Guias da casa</a><a href="/dicas.html">Dicas do dia a dia</a><a href="/ferramentas.html">Ferramentas gratuitas</a></div><div><b>Mais lidos</b><a href="/artigos/como-tirar-mofo-da-parede.html">Tirar mofo da parede</a><a href="/artigos/economizar-conta-de-luz.html">Economizar na conta de luz</a><a href="/artigos/quantos-btus-ar-condicionado.html">Quantos BTUs preciso?</a><a href="/artigos/como-limpar-sofa.html">Como limpar o sofá</a></div><div><b>Portal</b><a href="/sobre.html">Sobre e privacidade</a></div><small>© 2026 Casa e Harmonia · Feito para a vida em casa.</small></footer>`;
function page(title, desc, body, path, schema = {}, { image = "hero", type } = {}) {
  const og = abs(imagens[image].src);
  const canon = path === "index.html" ? origin + "/" : `${origin}/${path}`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canon}"><meta property="og:site_name" content="Casa e Harmonia"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="${type || (path.startsWith("artigos/") ? "article" : "website")}"><meta property="og:url" content="${canon}"><meta property="og:locale" content="pt_BR"><meta property="og:image" content="${esc(og)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(og)}"><meta name="theme-color" content="#2d503e"><link rel="icon" href="/assets/logo.png"><link rel="preconnect" href="https://images.pexels.com"><link rel="stylesheet" href="/styles.css"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", ...schema }).replaceAll("</", "<\\/")}</script><script src="/scripts.js" defer></script></head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a>${nav}${body.replace(/<main(?=[ >])/, '<main id="conteudo"')}${footer}</body></html>`;
}
const breadcrumb = (itens) => ({
  "@type": "BreadcrumbList",
  itemListElement: itens.map(([name, url], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: origin + url,
  })),
});
const write = (path, html) => {
  fs.mkdirSync(`${out}/${path}`.replace(/\/[^/]+$/, ""), { recursive: true });
  fs.writeFileSync(`${out}/${path}`, html);
};

// ---------- Cartões reutilizáveis ----------
const ferramentas = [
  ["tinta", "▧", "Quanto de tinta?", "Litros e latas para pintar suas paredes."],
  ["btu", "❄", "Quantos BTUs?", "O ar-condicionado certo para o cômodo."],
  ["energia", "ϟ", "Conta de luz", "Consumo e custo de cada aparelho."],
  ["churrasco", "♨", "Calculadora de churrasco", "Carne, carvão e bebidas por pessoa."],
  ["papel", "▤", "Papel de parede", "Quantos rolos comprar, com rapport."],
  ["piso", "▦", "Piso e revestimento", "Caixas, argamassa e rodapé."],
  ["reforma", "⌑", "Orçamento de reforma", "Estimativa com reserva para imprevistos."],
  ["organizacao", "☷", "Cronograma da casa", "Rotina de limpeza que cabe no dia."],
  ["paletas", "◐", "Paletas de cores", "Combinações para testar no seu lar."],
];
const toolGrid = (lista) =>
  `<div class="tool-grid">${lista.map(([id, icon, h, p]) => `<a href="/ferramentas.html#${id}"><span class="tool-icon" aria-hidden="true">${icon}</span><div><h3>${h}</h3><p>${p}</p></div><b>↗</b></a>`).join("")}</div>`;
const articleCard = (a) =>
  `<a class="article-card" data-category="${esc(a.cat)}" href="/artigos/${a.slug}.html">${img(a.slug, "", { dono: a.slug, sizes: "(max-width: 600px) 100vw, 33vw" })}<div><span class="eyebrow">${a.cat}${a.novo ? " · NOVO" : ""}</span><h3>${a.card}</h3><p>${a.intro.split(". ")[0]}.</p><span class="read">Ler o guia <b>↗</b></span></div></a>`;
const tipCard = ([cat, h, p, link]) =>
  `<article class="tip-card" data-category="${esc(cat)}"><span class="eyebrow">${cat}</span><h3>${h}</h3><p>${p}</p>${link ? `<a href="${link}">Saiba mais ↗</a>` : ""}</article>`;
const searchTools = (id, label, placeholder, cats, total, nome) =>
  `<div class="search-tools" data-search="${id}"><label for="${id}-search">${label}<input id="${id}-search" type="search" placeholder="${placeholder}"></label><label for="${id}-filter">Filtrar por categoria<select id="${id}-filter"><option value="">Todas</option>${cats.map((c) => `<option>${c}</option>`).join("")}</select></label></div><p id="${id}-count" class="search-count" role="status" data-label="${nome}">${total} ${nome}</p>`;
const uniq = (arr) => [...new Set(arr)];

// ---------- Home ----------
write(
  "index.html",
  page(
    "Casa e Harmonia | Guias, dicas e ferramentas para sua casa",
    "Decoração, limpeza, organização e ferramentas grátis: calcule tinta, BTUs, conta de luz, piso, papel de parede e churrasco. Ideias práticas para morar bem.",
    `<main><section class="hero"><div class="hero-copy"><p class="eyebrow">INSPIRAÇÃO PARA A VIDA REAL</p><h1>Mais cor. Mais calma.<br><em>Mais a sua casa.</em></h1><p>Guias práticos, dicas do dia a dia e ${ferramentas.length} ferramentas gratuitas para decorar, limpar, organizar e economizar.</p><a class="button" href="#artigos">Encontre sua inspiração <span>↗</span></a><div class="hero-stats"><span><b>${artigos.length}</b> guias</span><span><b>${ferramentas.length}</b> ferramentas</span><span><b>${dicas.length}</b> dicas</span></div></div><a class="hero-image" href="/artigos/cores-sala-pequena.html">${img("hero", "hero-cover", { eager: true, dono: "home" })}<span class="image-label">SALA COM PERSONALIDADE <b>Monte sua paleta de cores ↗</b></span></a></section><div class="category-strip"><span>UM LAR, MUITAS POSSIBILIDADES</span>${uniq(artigos.map((a) => a.cat)).map((c) => `<a href="#artigos" data-filter="${c}">${c}</a>`).join("")}</div><section class="tools-band"><div class="section-head"><div><p class="eyebrow">DO PLANO À PRÁTICA</p><h2>Ferramentas gratuitas, sem cadastro.</h2></div><a href="/ferramentas.html">Todas as ${ferramentas.length} ferramentas ↗</a></div>${toolGrid(ferramentas.slice(0, 6))}</section><section id="artigos" class="articles"><div class="section-head"><div><p class="eyebrow">IDEIAS PARA O SEU PRÓXIMO CAPÍTULO</p><h2>Guias práticos para cada canto da casa.</h2></div><span>${artigos.length} guias para morar melhor</span></div>${searchTools("article", "O que você quer resolver?", "Busque por mofo, sofá, luz, plantas…", uniq(artigos.map((a) => a.cat)), artigos.length, "guias")}<div class="article-grid" data-grid="article">${[...artigos].reverse().map(articleCard).join("")}</div><p id="article-empty" class="empty" hidden>Nenhum guia encontrado. Experimente outro termo ou escolha todas as categorias.</p></section><section class="tips-band"><div class="section-head"><div><p class="eyebrow">DICAS DO DIA A DIA</p><h2>Pequenos truques, grande diferença.</h2></div><a href="/dicas.html">Ver todas as ${dicas.length} dicas ↗</a></div><div class="tip-grid">${[0, 7, 14, 20, 26, 30].map((i) => tipCard(dicas[i])).join("")}</div></section><section class="closing"><p class="eyebrow">MAIS INTENÇÃO, MENOS EXCESSO</p><h2>Uma casa melhor começa<br>com uma ideia possível.</h2><a href="/ferramentas.html" class="button">Vamos colocar em prática ↗</a></section></main>`,
    "index.html",
    {
      "@graph": [
        {
          "@type": "WebSite",
          name: "Casa e Harmonia",
          url: origin + "/",
          inLanguage: "pt-BR",
        },
        {
          "@type": "Organization",
          name: "Casa e Harmonia",
          url: origin + "/",
          logo: origin + "/assets/logo.png",
        },
      ],
    },
  ),
);

// ---------- Páginas de artigos ----------
for (const a of artigos) {
  const relacionados = [
    ...artigos.filter((b) => b.cat === a.cat && b.slug !== a.slug),
    ...artigos.filter((b) => b.cat !== a.cat),
  ].slice(0, 3);
  const body = `<main class="post"><nav class="breadcrumb" aria-label="Trilha"><a href="/index.html">Início</a> / <a href="/index.html#artigos">${a.cat}</a></nav><p class="eyebrow">${a.cat} · GUIA PRÁTICO</p><h1>${a.title}</h1><p class="intro">${a.intro}</p><p class="byline"><a href="/sobre.html">Redação Casa e Harmonia</a> · Atualizado em ${dataTxt(a.atualizado)}</p><figure class="cover-figure">${img(a.slug, "cover", { eager: true, dono: a.slug, sizes: "(max-width: 900px) 100vw, 1100px" })}<figcaption>${credito(a.slug)}</figcaption></figure><div class="post-layout"><article><nav class="contents" aria-label="Neste artigo"><strong>Neste guia</strong>${a.sections.map((s, j) => `<a href="#sec${j}">${s[0]}</a>`).join("")}<a href="#faq">Perguntas frequentes</a></nav>${a.resumo ? `<aside class="summary"><strong>Resumo rápido</strong><ul>${a.resumo.map((r) => `<li>${r}</li>`).join("")}</ul></aside>` : ""}${a.sections.map((s, j) => `<section id="sec${j}"><h2>${s[0]}</h2>${s[1]}</section>`).join("")}<h2 id="faq">Perguntas frequentes</h2>${a.faq.map((f) => `<details class="faq" open><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}<aside class="post-cta"><p class="eyebrow">SEU PRÓXIMO PASSO</p><h2>Transforme a leitura em um plano.</h2><a class="button" href="${a.tool[0]}">${a.tool[1]} ↗</a></aside><h2>Leia também</h2><ul class="related">${relacionados.map((b) => `<li><a href="/artigos/${b.slug}.html"><span class="eyebrow">${b.cat}</span>${b.title}</a></li>`).join("")}</ul><h2>Fontes e referências</h2><p>Este guia reúne orientações gerais para adaptar ao seu espaço. Para serviços técnicos, siga os manuais dos produtos e a orientação de um profissional qualificado.</p>${a.sources.map(([l, u]) => `<p><a href="${u}" rel="noopener">${l}</a>.</p>`).join("")}</article><aside class="reading-aside"><p class="eyebrow">FERRAMENTAS GRÁTIS</p><h3>Faça as contas<br>antes de começar.</h3><ul>${ferramentas.slice(0, 6).map(([id, , h]) => `<li><a href="/ferramentas.html#${id}">${h} ↗</a></li>`).join("")}</ul><p class="eyebrow">NO DIA A DIA</p><ul><li><a href="/dicas.html">Dicas rápidas para a casa ↗</a></li></ul></aside></div></main>`;
  write(
    `artigos/${a.slug}.html`,
    page(
      a.title.length > 60 ? a.title.slice(0, 57).replace(/\s\S*$/, "") + "…" : a.title,
      a.intro.length > 155 ? a.intro.slice(0, 152).replace(/\s\S*$/, "") + "…" : a.intro,
      body,
      `artigos/${a.slug}.html`,
      {
        "@graph": [
          {
            "@type": "Article",
            headline: a.title,
            description: a.intro,
            author: { "@type": "Organization", name: "Redação Casa e Harmonia", url: origin + "/sobre.html" },
            publisher: { "@type": "Organization", name: "Casa e Harmonia", logo: { "@type": "ImageObject", url: origin + "/assets/logo.png" } },
            datePublished: a.publicado,
            dateModified: a.atualizado,
            mainEntityOfPage: `${origin}/artigos/${a.slug}.html`,
            image: [abs(imagens[a.slug].src)],
            inLanguage: "pt-BR",
          },
          {
            "@type": "FAQPage",
            mainEntity: a.faq.map((f) => ({
              "@type": "Question",
              name: f[0],
              acceptedAnswer: { "@type": "Answer", text: f[1] },
            })),
          },
          breadcrumb([["Início", "/index.html"], [a.cat, "/index.html#artigos"], [a.title, `/artigos/${a.slug}.html`]]),
        ],
      },
      { image: a.slug },
    ),
  );
}

// ---------- Dicas ----------
write(
  "dicas.html",
  page(
    "Dicas para o dia a dia em casa | Casa e Harmonia",
    `${dicas.length} dicas práticas de limpeza, cozinha, economia, organização, plantas e segurança, além de ideias criativas para renovar a casa sem gastar muito.`,
    `<main class="listing"><section class="listing-hero"><div><p class="eyebrow">TRUQUES QUE FUNCIONAM</p><h1>Dicas para o dia a dia</h1><p class="intro">Soluções rápidas para limpar, organizar, economizar e cuidar da casa, reunidas em um só lugar. Filtre pelo assunto ou busque um problema específico.</p></div>${img("dicasCapa", "", { eager: true, dono: "dicas" })}</section>${searchTools("tip", "Qual é o problema de hoje?", "Busque por panela, conta de luz, plantas…", uniq(dicas.map((d) => d[0])), dicas.length, "dicas")}<div class="tip-grid" data-grid="tip">${dicas.map(tipCard).join("")}</div><p id="tip-empty" class="empty" hidden>Nenhuma dica encontrada.</p><section class="ideas"><p class="eyebrow">IDEIAS BACANAS</p><h2>Projetos de fim de semana</h2><div class="idea-grid">${ideias.map(([h, p], i) => `<article><span>${String(i + 1).padStart(2, "0")}</span><h3>${h}</h3><p>${p}</p></article>`).join("")}</div></section></main>`,
    "dicas.html",
    {
      "@graph": [
        {
          "@type": "ItemList",
          name: "Dicas para o dia a dia",
          itemListElement: dicas.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d[1] })),
        },
        breadcrumb([["Início", "/index.html"], ["Dicas", "/dicas.html"]]),
      ],
    },
    { image: "dicasCapa" },
  ),
);

// ---------- Ferramentas ----------
const field = (id, label, value, min = 0, step = ".1", extra = "") =>
  `<label>${label}<input id="${id}" type="number" value="${value}" min="${min}" step="${step}" required${extra}></label>`;
const panel = (n, id, eyebrow, h2, p, form, result, guia) =>
  `<section class="tool-panel" id="${id}"><div><p class="eyebrow">${String(n).padStart(2, "0")} / ${eyebrow}</p><h2>${h2}</h2><p>${p}</p>${form}${guia ? `<p class="tool-guide">Entenda a conta: <a href="${guia[0]}">${guia[1]} ↗</a></p>` : ""}</div><div class="result" id="${id}-result" aria-live="polite">${result}</div></section>`;
const opts = (arr) => arr.map(([v, t, sel]) => `<option value="${v}"${sel ? " selected" : ""}>${t}</option>`).join("");
const ferramentasHtml = [
  panel(1, "tinta", "RENOVE AS CORES", "Calculadora de tinta",
    "Some as paredes, desconte portas e janelas e veja quantos litros e quais embalagens comprar.",
    `<form id="paint-form"><div id="walls"><div class="wall-row">${field("width", "Largura (m)", 4, 0.1)}${field("height", "Altura (m)", 2.7, 0.1)}</div></div><button type="button" id="add-wall" class="text-button">+ Adicionar parede</button><div class="form-grid">${field("openings", "Portas e janelas (m²)", 0)}<label>Tipo de rendimento<select id="yield-mode"><option value="coat">Por demão</option><option value="finished">Acabado (todas as demãos)</option></select></label>${field("coats", "Demãos", 2, 1, 1)}${field("yield", "Rendimento informado (m²/L)", 10, 0.1)}${field("waste", "Margem adicional (%)", 10, 0, 1)}${field("paint-price", "Preço do galão 3,6 L (R$, opcional)", 0, 0, ".01")}</div><p class="form-note">Referência: porta comum ≈ 1,6 m²; janela de 1,2 × 1 m = 1,2 m².</p><button class="button">Calcular quantidade ↗</button></form>`,
    `<p class="eyebrow">SEU PLANEJAMENTO</p><h3>Uma nova cor.<br>Na medida certa.</h3><p>Confira o rendimento no rótulo. Para converter m²/lata em m²/L, divida a área coberta pelo volume da embalagem.</p>`,
    ["/artigos/como-calcular-tinta.html", "Como calcular tinta"]),
  panel(2, "btu", "CLIMA NA MEDIDA", "Calculadora de BTU para ar-condicionado",
    "Descubra a capacidade indicada considerando área, pessoas, sol e aparelhos que geram calor.",
    `<form id="btu-form"><div class="form-grid">${field("btu-area", "Área do ambiente (m²)", 12, 1, ".5")}${field("btu-people", "Pessoas no ambiente", 2, 1, 1)}${field("btu-devices", "Eletrônicos (TV, PC, geladeira)", 1, 0, 1)}<label>Sol no ambiente<select id="btu-sun">${opts([["manha", "Sem sol ou só de manhã", 1], ["tarde", "Sol da tarde"]])}</select></label></div><button class="button">Calcular BTUs ↗</button></form>`,
    `<p class="eyebrow">CONFORTO TÉRMICO</p><h3>Nem fraco demais,<br>nem forte demais.</h3><p>Regra prática usada no mercado: 600 BTU/h por m² (800 com sol da tarde), mais 600 por pessoa extra e por eletrônico.</p>`,
    ["/artigos/quantos-btus-ar-condicionado.html", "Quantos BTUs preciso?"]),
  panel(3, "energia", "CONTA DE LUZ SOB CONTROLE", "Calculadora de consumo de energia",
    "Monte a lista de aparelhos da casa e veja o consumo em kWh e o custo de cada um no mês.",
    `<form id="energy-form"><div class="energy-table" id="energy-rows"></div><div class="energy-add"><label>Adicionar aparelho<select id="energy-preset"></select></label><button type="button" id="energy-add" class="text-button">+ Adicionar</button></div><div class="form-grid">${field("energy-tariff", "Tarifa (R$/kWh com impostos)", 0.85, 0.01, ".01")}<label>Bandeira tarifária<select id="energy-flag">${opts([["0", "Verde (sem acréscimo)", 1], ["0.01885", "Amarela (+R$ 1,885/100 kWh)"], ["0.04463", "Vermelha P1 (+R$ 4,463/100 kWh)"], ["0.07877", "Vermelha P2 (+R$ 7,877/100 kWh)"]])}</select></label></div><p class="form-note">Tarifa e bandeiras são referências ilustrativas. Use o valor por kWh da sua conta e a bandeira vigente divulgada pela ANEEL.</p><button class="button">Calcular consumo ↗</button></form>`,
    `<p class="eyebrow">ONDE ESTÁ O GASTO?</p><h3>Descubra o vilão<br>da sua conta.</h3><p>Consumo mensal = potência (W) × horas por dia × dias de uso ÷ 1000. A potência está na etiqueta ou no manual do aparelho.</p>`,
    ["/artigos/economizar-conta-de-luz.html", "15 hábitos para economizar energia"]),
  panel(4, "churrasco", "RECEBA SEM SOBRAS", "Calculadora de churrasco",
    "Quantidade de carne, carvão, pão de alho e bebidas para o seu número de convidados.",
    `<form id="bbq-form"><div class="form-grid">${field("bbq-men", "Homens", 6, 0, 1)}${field("bbq-women", "Mulheres", 6, 0, 1)}${field("bbq-kids", "Crianças", 2, 0, 1)}${field("bbq-drinkers", "Adultos que bebem cerveja", 8, 0, 1)}${field("bbq-hours", "Duração (horas)", 4, 1, 1)}</div><button class="button">Calcular churrasco ↗</button></form>`,
    `<p class="eyebrow">PLANEJE A FESTA</p><h3>Carne na medida,<br>festa sem aperto.</h3><p>Referência para até 4 horas: 400 g de carne por homem, 300 g por mulher e 150 g por criança. Ajuste ao apetite do seu grupo.</p>`, null),
  panel(5, "papel", "PAREDE NOVA", "Calculadora de papel de parede",
    "Calcule as faixas e os rolos necessários, considerando o rapport (repetição da estampa).",
    `<form id="wallpaper-form"><div class="form-grid">${field("wp-width", "Largura total das paredes (m)", 3.5, 0.1)}${field("wp-height", "Altura do pé-direito (m)", 2.6, 0.5)}${field("wp-discount", "Largura de portas/janelas a descontar (m)", 0, 0)}${field("wp-roll-width", "Largura do rolo (m)", 0.53, 0.1, ".01")}${field("wp-roll-length", "Comprimento do rolo (m)", 10, 1, ".1")}${field("wp-repeat", "Rapport da estampa (cm)", 0, 0, 1)}</div><p class="form-note">O rolo padrão mede 0,53 × 10 m (cerca de 5,3 m²). Estampa lisa ou sem casamento: rapport 0.</p><button class="button">Calcular rolos ↗</button></form>`,
    `<p class="eyebrow">COMPRA CERTA</p><h3>Faixas contadas,<br>estampa alinhada.</h3><p>Compre todos os rolos do mesmo lote de fabricação para evitar diferença de tom.</p>`,
    ["/artigos/decorar-quarto-pequeno.html", "Ideias para quarto pequeno"]),
  panel(6, "piso", "COMPRA BEM PLANEJADA", "Calculadora de piso e revestimento",
    "Caixas inteiras, argamassa e rodapé para o seu cômodo, com custo estimado.",
    `<form id="floor-form"><div class="form-grid"><label>Largura (m)<input id="floor-width" type="number" min="0.01" step="0.01" value="4" required></label><label>Comprimento (m)<input id="floor-length" type="number" min="0.01" step="0.01" value="5" required></label><label>Margem de recortes (%)<input id="floor-waste" type="number" min="0" step="1" value="10" required></label><label>Cobertura por caixa (m²)<input id="floor-box" type="number" min="0.01" step="0.01" value="2.2" required></label>${field("floor-doors", "Largura das portas (m)", 0.8, 0, ".1")}${field("floor-price", "Preço por m² (R$, opcional)", 0, 0, ".01")}</div><p class="form-note">Margem comum: 10% para assentamento reto e 15% para diagonal ou peças grandes.</p><button class="button">Calcular caixas ↗</button></form>`,
    `<h3>Do tamanho do seu projeto.</h3><p>Para cômodos irregulares, divida em retângulos e some as áreas. Confirme a paginação com o instalador.</p>`, null),
  panel(7, "reforma", "PLANEJE A MUDANÇA", "Simulador de orçamento de reforma",
    "Uma referência inicial com custos unitários editáveis para a sua região.",
    `<form id="budget-form"><div class="form-grid"><label>Cômodo<select id="room">${opts([["Cozinha", "Cozinha", 1], ["Banheiro", "Banheiro"], ["Sala", "Sala"], ["Quarto", "Quarto"], ["Área de serviço", "Área de serviço"], ["Varanda", "Varanda"]])}</select></label><label>Intervenção<select id="intervention">${opts([["paint", "Pintura", 1], ["floor", "Troca de piso"], ["wall", "Revestimento de parede"], ["ceiling", "Forro de gesso"], ["light", "Pontos de iluminação"], ["joinery", "Marcenaria (metro linear)"]])}</select></label>${field("quantity", "Quantidade (m² de parede)", 30, 0.1)}${field("unit", "Custo unitário (R$)", 35, 0.01, ".01")}${field("reserve", "Reserva para imprevistos (%)", 15, 0, 1)}</div><p class="form-note" id="budget-note">Premissa ilustrativa: R$ 35/m² de parede, materiais e mão de obra. Não é uma cotação de mercado.</p><button class="button">Estimar orçamento ↗</button></form>`,
    `<p class="eyebrow">ESPAÇO PARA PLANEJAR</p><h3>Antes de reformar,<br>faça as contas.</h3><p>Substitua o custo unitário por orçamentos locais. Demolição, entulho e alterações estruturais não estão incluídos.</p>`, null),
  `<section class="tool-panel" id="organizacao"><div><p class="eyebrow">08 / SIMPLIFIQUE A ROTINA</p><h2>Cronograma de limpeza e organização</h2><p>Um plano flexível com tarefas diárias, semanais e mensais, salvo somente neste navegador.</p><form id="schedule-form"><div class="form-grid"><label>Tamanho da casa<select id="size"><option value="small">Até 60 m²</option><option value="medium">De 61 a 120 m²</option><option value="large">Acima de 120 m²</option></select></label><label>Tempo disponível por dia<select id="routine"><option value="15">15 minutos</option><option value="30">30 minutos</option><option value="60">60 minutos</option></select></label><label class="check-inline"><input type="checkbox" id="has-pets"> Tenho pets</label><label class="check-inline"><input type="checkbox" id="has-kids"> Tenho crianças</label><label class="check-inline"><input type="checkbox" id="has-plants"> Tenho plantas</label></div><button class="button">Gerar meu cronograma ↗</button></form><p id="storage-status" role="status"></p><p class="tool-guide">Entenda a conta: <a href="/artigos/rotina-limpeza.html">Rotina de limpeza leve ↗</a></p></div><div class="result schedule"><div class="progress" id="progress" hidden><span></span><b></b></div><div id="checklist"><h3>Uma rotina possível<br>é uma rotina que fica.</h3><p>Escolha seu tempo e gere um plano para começar.</p></div><div class="actions"><button id="export" class="text-button" hidden>↓ Exportar checklist (.txt)</button><button id="reset-schedule" class="text-button" hidden>↺ Desmarcar tudo</button></div></div></section>`,
  `<section class="tool-panel" id="paletas"><div><p class="eyebrow">09 / ENCONTRE SEU CLIMA</p><h2>Paletas de cores para a casa</h2><p>Seis combinações com base, apoio e destaque. Veja a simulação e copie os códigos.</p><label>Qual atmosfera combina com você?<select id="palette"><option value="natural">Natural e acolhedora</option><option value="solar">Solar e criativa</option><option value="serena">Serena e fresca</option><option value="japandi">Japandi minimalista</option><option value="terrosa">Terrosa e quente</option><option value="noturna">Sofisticada e escura</option></select></label><p>Use a base nas áreas maiores (paredes), o apoio em móveis e tecidos e o destaque em detalhes. Uma proporção de referência é 60/30/10.</p><p class="tool-guide">Saiba mais: <a href="/artigos/cores-sala-pequena.html">Como testar sua paleta ↗</a></p></div><div class="result"><div id="palette-preview" aria-live="polite"></div><p class="form-note">Cores digitais de referência, sem equivalência com marcas de tinta. Teste amostras no ambiente antes de comprar.</p></div></section>`,
].join("");
write(
  "ferramentas.html",
  page(
    "Ferramentas grátis para casa: tinta, BTU, energia e mais",
    "Calculadoras gratuitas e sem cadastro: tinta, BTU de ar-condicionado, conta de luz, churrasco, papel de parede, piso, reforma, cronograma e paletas.",
    `<main class="tools-page"><p class="eyebrow">MENOS IMPROVISO, MAIS HARMONIA</p><h1>Seu próximo projeto<br>começa aqui.</h1><p class="intro">${ferramentas.length} ferramentas gratuitas, sem cadastro. Os cálculos acontecem no seu navegador.</p><nav class="tool-tabs" aria-label="Ferramentas">${ferramentas.map(([id, icon, h]) => `<a href="#${id}"><span aria-hidden="true">${icon}</span> ${h}</a>`).join("")}</nav>${ferramentasHtml}</main>`,
    "ferramentas.html",
    {
      "@graph": [
        {
          "@type": "WebApplication",
          name: "Ferramentas Casa e Harmonia",
          url: origin + "/ferramentas.html",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
          featureList: ferramentas.map((f) => f[2]),
        },
        breadcrumb([["Início", "/index.html"], ["Ferramentas", "/ferramentas.html"]]),
      ],
    },
  ),
);

// ---------- Sobre, 404, sitemap ----------
write(
  "sobre.html",
  page(
    "Sobre e privacidade | Casa e Harmonia",
    "Conheça o portal, a política editorial, a origem das fotografias e como as ferramentas usam o armazenamento local do navegador.",
    `<main class="post narrow"><h1>Sobre o Casa e Harmonia</h1><p>Um portal sobre decoração, limpeza, organização e jardinagem, com guias, dicas e ferramentas práticas para planejar a vida em casa.</p><h2>Critério editorial</h2><p>Guias introdutórios com sugestões adaptáveis. Os temas são escolhidos a partir de dúvidas frequentes de quem cuida da casa e de tendências públicas de busca. Estimativas de tinta, energia, BTU e materiais dependem do produto e do local. Custos de reforma e tarifas são premissas editáveis, não cotações. Trabalhos técnicos exigem avaliação de um profissional.</p><h2>Privacidade</h2><p>Não há cadastro nem formulário de coleta de dados. O cronograma e suas marcações ficam no localStorage deste navegador e podem ser apagados nas configurações do navegador. Os cálculos das ferramentas acontecem no seu dispositivo. A tipografia usa o Google Fonts e parte das fotografias é carregada do Pexels (images.pexels.com); esses serviços recebem os dados normais de conexão ao carregar os arquivos.</p><h2>Publicidade</h2><p>Nenhum anúncio ou rastreador está ativo nesta versão. Conteúdos patrocinados, quando houver, serão identificados.</p><h2>Fotografias</h2><p>As fotos vêm do Pexels (licença gratuita, sem necessidade de cadastro) e do Wikimedia Commons (licenças Creative Commons). O crédito e o link para a página original aparecem abaixo de cada imagem. As imagens são ilustrativas.</p><h2>Correções e contato</h2><p>Encontrou um erro? <a href="https://github.com/A3-Media-Group/Casa-e-Harmonia/issues">Envie uma sugestão pelo repositório oficial</a>. Esse canal é público; não inclua dados pessoais. O portal é mantido pela A3 Media Group.</p></main>`,
    "sobre.html",
  ),
);
write(
  "404.html",
  page(
    "Página não encontrada | Casa e Harmonia",
    "Encontre os guias, dicas e ferramentas do Casa e Harmonia.",
    '<main class="post narrow"><h1>Vamos encontrar outro caminho?</h1><p>Esta página não está disponível. Que tal começar por aqui?</p><p><a href="/index.html#artigos">Guias da casa</a> · <a href="/dicas.html">Dicas</a> · <a href="/ferramentas.html">Ferramentas</a></p><a class="button" href="/index.html">Voltar para o início</a></main>',
    "404.html",
  ).replace('content="index,follow,max-image-preview:large"', 'content="noindex"'),
);
const paginas = [
  ["", HOJE, "1.0"],
  ["ferramentas.html", HOJE, "0.9"],
  ["dicas.html", HOJE, "0.8"],
  ["sobre.html", HOJE, "0.3"],
  ...artigos.map((a) => [`artigos/${a.slug}.html`, a.atualizado, "0.7"]),
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paginas.map(([p, d, pr]) => `<url><loc>${origin}/${p}</loc><lastmod>${d}</lastmod><priority>${pr}</priority></url>`).join("")}</urlset>`,
);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);

for (const file of ["styles.css", "scripts.js"]) fs.copyFileSync(file, out + "/" + file);
fs.cpSync("assets", out + "/assets", { recursive: true });
// Cópia na raiz para hospedagens que servem o repositório diretamente.
for (const file of fs.readdirSync(out)) {
  if (file === "assets") continue;
  fs.cpSync(out + "/" + file, file, { recursive: true });
}
console.log(
  `Site gerado: ${artigos.length} guias, ${dicas.length} dicas, ${ferramentas.length} ferramentas, ${donos.size} imagens únicas.`,
);

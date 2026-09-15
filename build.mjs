import fs from "node:fs";
const out = "dist";
fs.mkdirSync(out, { recursive: true });
const origin =
  process.env.SITE_URL ||
  "https://casa-e-harmonia-portal.adm-a3mediagroup.chatgpt.site";
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
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
let photos = [];
try {
  photos = JSON.parse(fs.readFileSync("photos-local.json", "utf8"));
} catch {}
const mapping = [0, 2, 6, 1, 3, 7, 8, 9, 8, 5, 8, 0, 4];
const bodies = [
  [8, 9],
  [1, 5],
  [0, 8],
  [2, 5],
  [4, 9],
  [6, 3],
  [0, 6],
  [3, 9],
  [0, 6],
  [2, 3],
  [0, 6],
  [6, 8],
  [3, 9],
];
const pic = (i, cls = "", raw = false) => {
  let p = photos[raw ? i : mapping[i % mapping.length]];
  return p
    ? `<img class="${cls}" src="${esc(p.url)}" width="1200" height="800" loading="${cls === "cover" || cls === "hero-cover" ? "eager" : "lazy"}" ${cls === "hero-cover" ? 'fetchpriority="high"' : ""} alt="${esc(p.alt || p.title)}">`
    : `<div class="photo-pending ${cls}"></div>`;
};
const nav = `<header><a class="brand" href="/index.html"><img src="/assets/logo.png" alt="Casa e Harmonia" width="150" height="83"></a><nav aria-label="Principal"><a href="/index.html#artigos">Inspirações</a><a href="/sobre.html">Sobre o portal</a><a href="/ferramentas.html">Ferramentas</a></nav><a class="header-cta" href="/ferramentas.html">Planeje seu espaço <span>↗</span></a></header>`;
const footer = `<footer><div><strong>CASA E HARMONIA</strong><p>Ideias para morar bem. Espaço para viver melhor.</p></div><div><a href="/index.html">Início</a><a href="/ferramentas.html">Ferramentas gratuitas</a><a href="/sobre.html">Sobre e privacidade</a></div><small>© 2026 Casa e Harmonia · Feito para a vida em casa.</small></footer>`;
function page(title, desc, body, path = "index.html", schema = {}) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${origin}/${path}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="${path.startsWith("artigos/") ? "article" : "website"}"><meta property="og:url" content="${origin}/${path}"><meta property="og:locale" content="pt_BR"><meta property="og:image" content="${origin}/assets/photo-1.webp"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><link rel="icon" href="/assets/logo.png"><link rel="stylesheet" href="/styles.css"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", ...schema })}</script><script src="/scripts.js" defer></script></head><body><a class="skip" href="#conteudo">Pular para o conteúdo</a>${nav}${body.replace(/<main(?=[ >])/, '<main id="conteudo"')}${footer}</body></html>`;
}
const ad = () => "";
const unusedAd = () =>
  `<aside class="ad" aria-label="Espaço reservado para publicidade"><span>PUBLICIDADE</span><div class="adsbygoogle">Espaço reservado</div></aside>`;
const toolcards = `<div class="tool-grid"><a href="/ferramentas.html#tinta"><span class="tool-icon">▧</span><div><h3>Quanto de tinta?</h3><p>Calcule os litros para renovar suas paredes.</p></div><b>↗</b></a><a href="/ferramentas.html#reforma"><span class="tool-icon">⌑</span><div><h3>Quanto vai custar?</h3><p>Simule o orçamento da sua próxima reforma.</p></div><b>↗</b></a><a href="/ferramentas.html#organizacao"><span class="tool-icon">☷</span><div><h3>Por onde começar?</h3><p>Monte uma rotina de organização que cabe no dia.</p></div><b>↗</b></a></div>`;
fs.writeFileSync(
  `${out}/index.html`,
  page(
    "Casa e Harmonia | Inspiração para morar bem",
    "Decoração, jardinagem e organização para sua casa. Explore guias e ferramentas gratuitas para pintar, reformar e organizar.",
    `<main><section class="hero"><div class="hero-copy"><p class="eyebrow">INSPIRAÇÃO PARA A VIDA REAL</p><h1>Mais cor. Mais calma.<br><em>Mais a sua casa.</em></h1><p>Inspiração bonita, escolhas possíveis. Encontre seu estilo e planeje mudanças que cabem na sua vida.</p><a class="button" href="#artigos">Encontre sua inspiração <span>↗</span></a><div class="hero-note"><span>CASA VIVA</span> Ideias que viram novos começos</div></div><a class="hero-image" href="/artigos/japandi.html">${pic(0, "hero-cover")}<span class="image-label">O ESSENCIAL TAMBÉM ACOLHE <b>Conheça o estilo Japandi ↗</b></span></a></section><div class="category-strip"><span>UM LAR, MUITAS POSSIBILIDADES</span><a href="#artigos" data-filter="Decoração">Decoração</a><a href="#artigos" data-filter="Arquitetura">Arquitetura</a><a href="#artigos" data-filter="Jardinagem">Jardinagem</a><a href="#artigos" data-filter="Organização">Organização</a></div><section class="tools-band"><div class="section-head"><div><p class="eyebrow">DO PLANO À PRÁTICA</p><h2>Uma ajuda para tirar as ideias do papel.</h2></div><a href="/ferramentas.html">Todas as ferramentas ↗</a></div>${toolcards}</section><section id="artigos" class="articles"><div class="section-head"><div><p class="eyebrow">IDEIAS PARA O SEU PRÓXIMO CAPÍTULO</p><h2>Inspire-se. Faça do seu jeito.</h2></div><span>${topics.length} guias para morar melhor</span></div><div class="search-tools"><label for="article-search">O que você quer transformar?<input id="article-search" type="search" placeholder="Busque por plantas, sala, cores…"></label><label for="category-filter">Explore por assunto<select id="category-filter"><option value="">Todos os assuntos</option>${[...new Set(topics.map((t) => t[1]))].map((c) => `<option>${c}</option>`).join("")}</select></label></div><p id="search-count" role="status">${topics.length} guias disponíveis</p><div class="article-grid">${topics.map((t, i) => `<a class="article-card" data-category="${t[1]}" href="/artigos/${t[0]}.html">${pic(i)}<div><span class="eyebrow">${t[1]}</span><h3>${t[2]}</h3><p>${t[4].split(". ")[0]}.</p><span class="read">Ler o guia <b>↗</b></span></div></a>`).join("")}</div><p id="no-results" hidden>Nenhum guia encontrado. Experimente outro termo ou escolha todos os assuntos.</p></section><section class="closing"><p class="eyebrow">MAIS INTENÇÃO, MENOS EXCESSO</p><h2>Uma casa melhor começa<br>com uma ideia possível.</h2><a href="/ferramentas.html" class="button">Vamos colocar em prática ↗</a></section></main>`,
    "index.html",
    { "@type": "WebSite", name: "Casa e Harmonia", url: origin },
  ),
);
fs.mkdirSync(`${out}/artigos`, { recursive: true });
for (let i = 0; i < topics.length; i++) {
  const t = topics[i],
    faq = t.slice(8, 10).map((x) => x.split("|"));
  const sections = t.slice(5, 8).map((x) => x.split("|"));
  const body = `<main class="post"><a class="breadcrumb" href="/index.html#artigos">Início / ${t[1]}</a><p class="eyebrow">${t[1]} · GUIA PRÁTICO</p><h1>${t[3]}</h1><p class="intro">${t[4]}</p><p class="byline"><a href="/sobre.html">Redação Casa e Harmonia</a> · Atualizado em 14 de setembro de 2026</p>${pic(i, "cover")}${ad()}<div class="post-layout"><article><nav class="contents" aria-label="Neste artigo"><strong>Neste guia</strong>${sections.map((s, j) => `<a href="#sec${j}">${s[0]}</a>`).join("")}</nav>${sections.map((s, j) => `<section id="sec${j}"><h2>${s[0]}</h2><p>${s[1]}</p>${j < 2 ? pic(bodies[i][j], "body-photo", true) : ""}${j === 1 ? ad() : ""}</section>`).join("")}<h2>Perguntas frequentes</h2>${faq.map((f) => `<section class="faq"><h3>${f[0]}</h3><p>${f[1]}</p></section>`).join("")}<aside class="post-cta"><p class="eyebrow">SEU PRÓXIMO PASSO</p><h2>Transforme a leitura em um plano.</h2><a class="button" href="/ferramentas.html#${t[10]}">Usar ferramenta gratuita ↗</a></aside><h2>Fontes e referências</h2><p>Este guia reúne sugestões editoriais para adaptar ao seu espaço. Para executar serviços, siga os manuais dos produtos e a orientação do profissional responsável.</p>${i === 3 ? '<p><a href="https://doi.org/10.1038/s41370-019-0175-9">Revisão científica sobre plantas e qualidade do ar interior</a>.</p>' : ""}${[0, 6, 10].includes(i) ? '<p><a href="https://www.suvinil.com.br/cores">Suvinil: escolha de cores e teste na iluminação real</a>.</p>' : ""}${i === 11 ? '<p><a href="https://www.suvinil.com.br/calculadora-de-tinta">Suvinil: rendimento e cálculo da quantidade de tinta</a>.</p>' : ""}${i === 12 ? '<p><a href="https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2025/todo-cuidado-e-pouco-com-as-misturas-caseiras-para-limpeza-1/">Anvisa: cuidados com misturas de produtos de limpeza</a>.</p>' : ""}<details><summary>Créditos das fotografias</summary>${[
    mapping[i],
    ...bodies[i],
  ]
    .map((k) => {
      let p = photos[k];
      return p
        ? `<p><a href="${esc(p.source)}">${esc(p.title)}</a> · ${esc(p.author || "Wikimedia Commons")} · <a href="${esc(p.licenseUrl)}">${esc(p.license || "Ver licença na fonte")}</a> · Redimensionada e convertida para WebP.</p>`
        : "";
    })
    .join(
      "",
    )}</details>${ad()}</article><aside class="reading-aside"><p class="eyebrow">CASA EM MOVIMENTO</p><h3>Uma ideia.<br>Seu próximo projeto.</h3><p>Planeje a pintura, estime a reforma ou organize a rotina.</p><a href="/ferramentas.html">Conheça as ferramentas ↗</a></aside></div></main>`;
  fs.writeFileSync(
    `${out}/artigos/${t[0]}.html`,
    page(
      t[3].slice(0, 60),
      t[4].slice(0, 152) + "…",
      body,
      `artigos/${t[0]}.html`,
      {
        "@graph": [
          {
            "@type": "Article",
            headline: t[3],
            author: {
              "@type": "Organization",
              name: "Redação Casa e Harmonia",
            },
            datePublished: i < 10 ? "2026-09-12" : "2026-09-14",
            mainEntityOfPage: `${origin}/artigos/${t[0]}.html`,
            dateModified: "2026-09-14",
            image: photos.length ? [origin + photos[mapping[i]].url] : [],
          },
          {
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f[0],
              acceptedAnswer: { "@type": "Answer", text: f[1] },
            })),
          },
        ],
      },
    ),
  );
}
const field = (id, label, value, min = 0, step = ".1") =>
  `<label>${label}<input id="${id}" type="number" value="${value}" min="${min}" step="${step}" required></label>`;
fs.writeFileSync(
  `${out}/ferramentas.html`,
  page(
    "Ferramentas para pintar, reformar e organizar | Casa",
    "Calcule tinta, simule custos de reforma e crie um checklist doméstico. Ferramentas gratuitas, sem cadastro, com salvamento no navegador.",
    `<main class="tools-page"><p class="eyebrow">MENOS IMPROVISO, MAIS HARMONIA</p><h1>Seu próximo projeto<br>começa aqui.</h1><p class="intro">Cinco ferramentas simples para cuidar da casa com intenção.</p><nav class="tool-tabs"><a href="#tinta">01 · Pintura</a><a href="#reforma">02 · Reforma</a><a href="#organizacao">03 · Organização</a><a href="#piso">04 · Piso</a><a href="#paletas">05 · Paletas</a></nav><section class="tool-panel" id="tinta"><div><p class="eyebrow">01 / RENOVE AS CORES</p><h2>Calculadora de tinta</h2><p>Adicione as paredes e desconte a área total de portas e janelas.</p><form id="paint-form"><div id="walls"><div class="wall-row">${field("width", "Largura (m)", 4, 0.1)}${field("height", "Altura (m)", 2.7, 0.1)}</div></div><button type="button" id="add-wall" class="text-button">+ Adicionar parede</button><div class="form-grid">${field("openings", "Portas e janelas (m²)", 0)}<label>Tipo de rendimento<select id="yield-mode"><option value="coat">Por demão</option><option value="finished">Acabado (todas as demãos)</option></select></label>${field("coats", "Demãos", 2, 1, 1)}${field("yield", "Rendimento informado (m²/L)", 10, 0.1)}${field("waste", "Margem adicional (%)", 10, 0, 1)}</div><button class="button">Calcular quantidade ↗</button></form></div><div class="result" id="paint-result" aria-live="polite"><p class="eyebrow">SEU PLANEJAMENTO</p><h3>Uma nova cor.<br>Na medida certa.</h3><p>Confira o rendimento informado pelo fabricante. Selecione o tipo de rendimento. Para converter m²/lata em m²/L, divida a área coberta pelo volume da embalagem.</p></div></section><section class="tool-panel" id="reforma"><div><p class="eyebrow">02 / PLANEJE A MUDANÇA</p><h2>Simulador de reforma</h2><p>Uma referência inicial com valores editáveis para a sua região.</p><form id="budget-form"><div class="form-grid"><label>Cômodo<select id="room"><option>Cozinha</option><option>Banheiro</option><option>Sala</option></select></label><label>Intervenção<select id="intervention"><option value="paint">Pintura</option><option value="floor">Troca de piso</option><option value="light">Iluminação</option></select></label>${field("quantity", "Quantidade (m² de parede)", 30, 0.1)}${field("unit", "Custo unitário (R$)", 35, 0.01, ".01")}${field("reserve", "Reserva para imprevistos (%)", 15, 0, 1)}</div><p class="form-note" id="budget-note">Premissa ilustrativa: R$ 35/m² de parede, materiais e mão de obra. Não é uma cotação de mercado.</p><button class="button">Estimar orçamento ↗</button></form></div><div class="result" id="budget-result" aria-live="polite"><p class="eyebrow">ESPAÇO PARA PLANEJAR</p><h3>Antes de reformar,<br>faça as contas.</h3><p>Substitua o custo unitário por um orçamento local. Demolição, entulho e alterações estruturais não estão incluídos.</p></div></section><section class="tool-panel" id="organizacao"><div><p class="eyebrow">03 / SIMPLIFIQUE A ROTINA</p><h2>Cronograma de organização</h2><p>Um plano flexível, salvo somente neste navegador.</p><form id="schedule-form"><div class="form-grid"><label>Tamanho da casa<select id="size"><option value="small">Até 60 m²</option><option value="medium">De 61 a 120 m²</option><option value="large">Acima de 120 m²</option></select></label><label>Tempo disponível por dia<select id="routine"><option value="15">15 minutos</option><option value="30">30 minutos</option><option value="60">60 minutos</option></select></label></div><button class="button">Gerar meu cronograma ↗</button></form><p id="storage-status" role="status"></p></div><div class="result schedule"><div id="checklist"><h3>Uma rotina possível<br>é uma rotina que fica.</h3><p>Escolha seu tempo e gere um plano para começar.</p></div><button id="export" class="text-button" hidden>↓ Exportar checklist (.txt)</button></div></section><section class="tool-panel" id="piso"><div><p class="eyebrow">04 / COMPRA BEM PLANEJADA</p><h2>Calculadora de piso</h2><p>Estime a área de compra e a quantidade de caixas inteiras.</p><form id="floor-form"><div class="form-grid"><label>Largura (m)<input id="floor-width" type="number" min="0.01" step="0.01" value="4" required></label><label>Comprimento (m)<input id="floor-length" type="number" min="0.01" step="0.01" value="5" required></label><label>Margem de recortes (%)<input id="floor-waste" type="number" min="0" step="1" value="10" required></label><label>Cobertura por caixa (m²)<input id="floor-box" type="number" min="0.01" step="0.01" value="2.2" required></label></div><button class="button">Calcular caixas ↗</button></form></div><div class="result" id="floor-result" aria-live="polite"><h3>Do tamanho do seu projeto.</h3><p>A margem inicial é ilustrativa. Confirme recortes, paginação e reserva com o instalador. Para cômodos irregulares, divida em retângulos e some as áreas.</p></div></section><section class="tool-panel" id="paletas"><div><p class="eyebrow">05 / ENCONTRE SEU CLIMA</p><h2>Inspirações de cores</h2><p>Três combinações para experimentar no seu lar.</p><label>Qual atmosfera combina com você?<select id="palette"><option value="natural">Natural e acolhedora</option><option value="solar">Solar e criativa</option><option value="serena">Serena e fresca</option></select></label><p>Use a base nas áreas maiores, o apoio em móveis e o destaque nos detalhes. São sugestões, sem proporções obrigatórias.</p><a href="/artigos/cores-sala-pequena.html">Veja como testar sua paleta ↗</a></div><div class="result"><div id="palette-preview" aria-live="polite"></div><p class="form-note">Cores digitais de referência, sem equivalência com marcas de tinta. Teste amostras no ambiente antes de comprar.</p></div></section></main>`,
    "ferramentas.html",
    {
      "@type": "WebApplication",
      name: "Ferramentas Casa e Harmonia",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
  ),
);
fs.writeFileSync(
  `${out}/sobre.html`,
  page(
    "Sobre e privacidade | Casa e Harmonia",
    "Conheça o portal, a política editorial e como o checklist usa o armazenamento local do navegador.",
    `<main class="post narrow"><h1>Sobre o Casa e Harmonia</h1><p>Um portal editorial sobre decoração, arquitetura, jardinagem e organização, com ferramentas práticas para planejar pequenas mudanças.</p><h2>Critério editorial</h2><p>Guias introdutórios com sugestões adaptáveis. Estimativas de tinta dependem do produto e da superfície. Custos de reforma são premissas editáveis, não cotações. Trabalhos técnicos exigem avaliação do local.</p><h2>Privacidade</h2><p>Não há cadastro nem formulário de coleta de dados. O cronograma e suas marcações ficam no localStorage deste navegador. Você pode apagá-los nas configurações do navegador. As fotografias são servidas pelo próprio portal. A tipografia usa o serviço Google Fonts, que recebe os dados normais de conexão ao carregar as fontes.</p><h2>Publicidade</h2><p>Nenhum anúncio ou rastreador do AdSense está ativo nesta versão. Conteúdos patrocinados, quando houver, devem ser identificados. A ativação de publicidade exige configuração da conta e revisão desta política.</p><h2>Correções e contato</h2><p>Encontrou um erro? <a href="https://github.com/A3-Media-Group/Casa-Harmonia/issues">Envie uma sugestão pelo repositório oficial</a>. Esse canal é público; não inclua dados pessoais. O portal é mantido pela A3 Media Group.</p><h2>Fotografias</h2><p>Os créditos, autores e licenças estão nos artigos. As imagens são ilustrativas; não representam projetos assinados pelo portal.</p></main>`,
    "sobre.html",
  ),
);
const paths = [
  "index.html",
  "ferramentas.html",
  "sobre.html",
  ...topics.map((t) => `artigos/${t[0]}.html`),
];
fs.writeFileSync(
  `${out}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}/${p}</loc></url>`).join("")}</urlset>`,
);
fs.writeFileSync(
  `${out}/robots.txt`,
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);

for (const file of ["styles.css", "scripts.js"])
  fs.copyFileSync(file, out + "/" + file);
fs.cpSync("assets", out + "/assets", { recursive: true });
fs.writeFileSync(
  out + "/404.html",
  page(
    "Página não encontrada | Casa e Harmonia",
    "Encontre os guias e ferramentas do Casa e Harmonia.",
    '<main class="post narrow"><h1>Vamos encontrar outro caminho?</h1><p>Esta página não está disponível.</p><a class="button" href="/index.html">Voltar para o início</a></main>',
    "404.html",
  ).replace(
    '<meta name="description"',
    '<meta name="robots" content="noindex"><meta name="description"',
  ),
);
for (const file of fs.readdirSync(out)) {
  if (file === "assets") continue;
  fs.cpSync(out + "/" + file, file, { recursive: true });
}
console.log("Site gerado: " + topics.length + " artigos, 5 ferramentas.");

// Registro único de imagens. Cada chave deve ser usada por uma só página
// (o teste de build falha se uma fotografia aparecer em dois conteúdos diferentes).
// Fotos "pexels": licença Pexels — uso gratuito, sem cadastro e sem atribuição obrigatória.
// Mesmo assim, o crédito e o link da página original são exibidos no conteúdo.
import fs from "node:fs";

const locais = JSON.parse(fs.readFileSync("photos-local.json", "utf8"));
const local = (n, alt) => {
  const p = locais[n - 1];
  return {
    src: p.url,
    alt: alt || p.alt,
    credito: `${p.author || "Wikimedia Commons"} · ${p.license}`,
    fonte: p.source,
    licencaUrl: p.licenseUrl,
  };
};
const pexels = (id, alt, pagina) => ({
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  srcset: [600, 1200]
    .map(
      (w) =>
        `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w} ${w}w`,
    )
    .join(", "),
  alt,
  credito: "Pexels · Licença Pexels (uso gratuito)",
  fonte: `https://www.pexels.com/photo/${pagina}-${id}/`,
  licencaUrl: "https://www.pexels.com/license/",
});

export const imagens = {
  // Home e páginas institucionais
  hero: pexels(5825380, "Sala clara com sofá, plantas e luz natural", "living-room-interior-with-furniture-and-plants-at-home"),
  receitasCapa: local(4, "Cozinha com bancada de preparo e armários"),
  dicasCapa: pexels(4740484, "Sala moderna com móveis e várias plantas", "modern-living-room-interior-with-furniture-and-assorted-plants"),

  // Artigos originais (uma foto exclusiva por guia)
  japandi: local(7, "Quarto claro em estilo escandinavo com cama de linho e luz natural"),
  biofilia: local(3),
  "iluminacao-led": pexels(13613289, "Pendentes acesos com luz quente em ambiente minimalista", "skymningen-pendant-lamp"),
  "plantas-para-sala": local(2),
  "cozinha-funcional": local(5),
  "casa-inteligente": local(8),
  "cores-terrosas": local(9),
  "organizacao-5s": local(10),
  "sofa-perfeito": local(1),
  "varanda-pequena": local(6),
  "cores-sala-pequena": pexels(11076073, "Sala com sofá verde como cor de destaque", "green-sofa-in-a-living-room"),
  "como-calcular-tinta": pexels(1669754, "Mão aplicando tinta branca na parede com rolo", "person-holding-paint-roller-on-wall"),
  "rotina-limpeza": pexels(28576626, "Borrifador e esponja de limpeza sobre bancada", "minimalist-cleaning-supplies-on-grey-background"),

  // Novos guias
  "como-tirar-mofo-da-parede": pexels(4049450, "Parede com pintura descascando por umidade", "white-peeling-paint-on-wall"),
  "como-limpar-sofa": pexels(4401538, "Pessoa aspirando o estofado de uma poltrona", "cleaner-vacuuming-a-sofa-chair"),
  "como-desentupir-pia": pexels(220612, "Ralo de pia de inox com gotas de água", "stainless-steel-sink-drainage"),
  "economizar-conta-de-luz": pexels(36272732, "Plugue conectado a uma tomada na parede", "electric-socket-with-plug-on-grey-wall"),
  "decorar-quarto-pequeno": pexels(5490384, "Quarto pequeno e claro com roupa de cama clara e luminária", "minimal-interior-design-of-light-cozy-bedroom"),
  "organizar-guarda-roupa": pexels(5705496, "Guarda-roupa branco com roupas em cabides e caixas organizadoras", "blue-and-black-clothes-hanging-in-white-wooden-cabinet"),
  "horta-em-apartamento": pexels(4750311, "Ervas e temperos crescendo em caixote", "herbs-growing-in-crate"),
  "tirar-manchas-de-roupa": pexels(4440652, "Pessoa colocando roupas na máquina de lavar", "a-person-putting-clothes-in-a-washing-machine"),
  "quantos-btus-ar-condicionado": pexels(38788452, "Ar-condicionado split instalado na parede de um ambiente", "wall-mounted-air-conditioner-in-modern-interior"),
  "organizar-geladeira": pexels(4443442, "Frutas e verduras organizadas dentro da geladeira", "assorted-fruits-and-vegetables-in-refrigerator"),

  // Receitas
  "morango-do-amor": pexels(19478157, "Doces vermelhos brilhantes com calda de açúcar caramelizada, a mesma calda do morango do amor", "candy-apples-on-display"),
  "batata-frita-air-fryer": pexels(2962450, "Batatas fritas douradas e crocantes", "macro-photography-of-french-fries"),
  "pudim-de-leite": pexels(18089587, "Pudim de leite com calda de caramelo", "spanish-flan-dessert"),
  "bolo-de-cenoura": pexels(5741969, "Fatia de bolo de cenoura vista de cima", "top-view-of-a-slice-of-carrot-cake"),
  brigadeiro: pexels(9285197, "Brigadeiros enrolados no granulado", "close-up-of-brigadeiro-cookies"),
  "panqueca-simples": pexels(4725646, "Panquecas finas dobradas em prato branco", "close-up-photo-of-crepes-on-white-plate"),
  "coxa-de-frango-air-fryer": pexels(2611917, "Frango assado dourado", "close-up-photo-of-cooked-chicken"),
  "lasanha-a-bolonhesa": pexels(4079522, "Fatia de lasanha à bolonhesa em prato branco", "lasagna-on-white-ceramic-plate"),
  "bolo-de-banana": pexels(830894, "Fatias de bolo de banana em pires", "close-up-photography-of-banana-bread-on-saucer"),
  "omelete-de-legumes": pexels(10934498, "Omelete com tomate e ervas em prato branco", "directly-above-view-of-omelette-on-plate"),
  "pao-caseiro": pexels(7693958, "Fatias de pão caseiro sobre tábua de madeira", "slices-of-delicious-homemade-bread"),
  "strogonoff-de-frango": pexels(4661880, "Cogumelos refogando na frigideira para o strogonoff", "photo-of-mushroom-cooking-in-frying-pan"),
};

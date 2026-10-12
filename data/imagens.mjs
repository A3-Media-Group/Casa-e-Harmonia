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
  // Guias criados a partir das dicas
  "como-limpar-panela-queimada": pexels(3768169, "Panela de inox sobre a boca do fogão", "stainless-steel-cooking-pot-on-stove"),
  "como-limpar-rejunte": pexels(7303903, "Escova de limpeza apoiada sobre um pano", "a-brush-lying-on-a-cloth"),
  "como-limpar-micro-ondas": pexels(9462228, "Pessoa limpando o interior do micro-ondas com pano", "a-person-cleaning-a-microwave-oven"),
  "como-higienizar-colchao": pexels(212269, "Cama com edredom e lençóis brancos", "white-bed-comforter"),
  "como-saber-se-o-ovo-esta-bom": pexels(6294430, "Ovos vermelhos em caixa, um deles quebrado", "carton-container-with-eggs-in-rows"),
  "como-cortar-cebola-sem-chorar": pexels(10432426, "Mãos cortando cebola roxa sobre tábua de madeira", "woman-cutting-onion-with-knife"),
  "como-limpar-box-de-vidro": pexels(271631, "Banheiro com box de vidro transparente", "clear-glass-shower-room"),
  "como-descobrir-vazamento-de-agua": pexels(67184, "Gotas de água caindo de uma torneira", "water-drops-from-faucet"),
};

# Casa e Harmonia

Portal estático em português: 31 guias, 5 páginas-hub por tema, 20 ferramentas com página própria e 31 dicas do dia a dia, sem dependências de produção. Logo e fotografias originais recuperados da cópia local do projeto; as URLs dos 10 artigos existentes foram preservadas.

## Desenvolvimento e publicação

Requer Node.js 22 ou superior.

```sh
npm run build
npm test
npm start
```

A prévia fica em http://localhost:5173. Publique o **conteúdo de `dist/`** na raiz do domínio. O build também atualiza os HTMLs da raiz e `artigos/`, mantendo a compatibilidade com hospedagens que servem diretamente os arquivos do repositório. `build.mjs` é a fonte dos textos e páginas; `styles.css` e `scripts.js` são os arquivos editáveis de estilo e comportamento.

O domínio original de prévia permanece como padrão porque o domínio definitivo ainda precisa ser confirmado. **Antes de publicar**, configure `SITE_URL` com a origem HTTPS pública, sem barra final, e rode o build. Exemplo no PowerShell:

```powershell
$env:SITE_URL = 'https://seu-dominio.com.br'
npm run build
```

Configure a hospedagem para usar `404.html` com status HTTP 404. Não redirecione páginas inexistentes para a home. O servidor local serve apenas para desenvolvimento.

## Conteúdo e ferramentas

- Busca por texto sem distinção de acentos e filtro de categorias.
- Tinta com rendimento por demão ou acabado; sem duplicar demãos e com correção de arredondamento decimal.
- Reforma com custo unitário editável e premissas identificadas como ilustrativas.
- Cronograma com armazenamento local e exportação de texto.
- Piso com margem editável e caixas inteiras.
- Três paletas digitais com nomes, códigos e orientação para teste real.

Os três novos guias abordam cores em sala pequena, quantidade de tinta e rotina de limpeza. Leia `PESQUISA.md` para fontes, critérios e próximos passos editoriais.

## SEO e monetização

HTML legível sem JavaScript, títulos e descrições, canonical, Open Graph, sitemap, robots, Article e FAQPage. Dados estruturados não garantem resultados especiais no Google. A imagem da capa dos artigos no schema corresponde à fotografia exibida. Imagens locais têm dimensões, textos alternativos e carregamento tardio, exceto imagens de destaque.

Não há identificadores de Search Console, Analytics ou AdSense nem anúncios ativos. Após confirmar o domínio: verificar propriedade no Search Console, enviar sitemap, acompanhar indexação e Core Web Vitals reais. Ative publicidade apenas com a conta configurada e atualize privacidade e consentimento conforme a implementação. Não foram fabricados `ads.txt`, IDs, avaliações ou números de tráfego.

Google Fonts é a única dependência externa de apresentação. O checklist não é enviado ao servidor. Créditos fotográficos estão nos artigos; licenças e autores originais em `photos-local.json`.

## Validação

`npm test` confere os cálculos, páginas, arquivos de imagens, links internos e sintaxe JSON-LD. A conferência no navegador inclui busca, rendimento acabado, piso, paletas e layout a 390 px.

## Atualização de outubro de 2026

- Conteúdo em `data/`: `artigos.mjs` (10 guias novos), `dicas.mjs` e `imagens.mjs` (registro de fotos).
- Cada guia tem foto exclusiva; o build falha se uma foto for usada em dois conteúdos e `npm test` confere a unicidade das capas.
- Fotos novas do Pexels (licença gratuita, sem cadastro), carregadas de `images.pexels.com`, com crédito e link da página original. Se uma foto não carregar, aparece `assets/sem-foto.svg`.
- Novas ferramentas: BTU de ar-condicionado, consumo de energia, churrasco e papel de parede. Tinta sugere embalagens; piso calcula argamassa e rodapé; cronograma tem progresso e opções para pets, crianças e plantas; paletas passaram de 3 para 6, com simulação e cópia do código.
- A seção de receitas e o conversor de medidas culinárias foram retirados por não fazerem parte do conceito do portal.
- O `SITE_URL` padrão agora é `https://casaeharmonia.com.br`; a home usa canonical `/`.

## Hospedagem (Hostinger) e `.htaccess`

A fonte é `hospedagem/htaccess`; o build grava `dist/.htaccess` e a cópia da raiz. Ele faz:

- `/index.html` e `/pasta/index.html` → `https://casaeharmonia.com.br/` e `/pasta/` (um único 301, mesmo vindo de `http://` ou `www.`);
- `http://` e `www.` → `https://casaeharmonia.com.br` (um único 301);
- endereços da versão anterior do site → página equivalente (um único 301): `/decoracao/` → `/guias/decoracao-e-cores/`, `/jardinagem/` → `/guias/plantas-e-natureza/`, `/sobre/` → `/sobre.html`, `/politica-de-privacidade/` e `/politica-de-cookies/` → `/privacidade/`. `/feng-shui-bem-estar/` e `/ferramentas/quiz-de-estilo/` não têm equivalente e respondem 404;
- `ErrorDocument 404 /404.html` (status 404 real);
- Brotli/gzip, cache de 1 ano para fontes, 30 dias para imagens e 1 ano para CSS/JS (versionados por `?v=<hash>`); HTML sempre revalida;
- 404 para arquivos e pastas ocultos (`.git/`, `.github/`, `.env`, `.gitignore`…), exceto `/.well-known/` (validação de SSL e domínio);
- 404 para arquivos de código e dados do repositório (`data/`, `scripts/`, `*.mjs`, `*.md`…).

Teste depois de publicar (as quatro variantes devem terminar em `https://casaeharmonia.com.br/` com um único 301):

```sh
curl -sIL http://casaeharmonia.com.br/      | grep -iE '^(HTTP|location)'
curl -sIL http://www.casaeharmonia.com.br/  | grep -iE '^(HTTP|location)'
curl -sIL https://www.casaeharmonia.com.br/ | grep -iE '^(HTTP|location)'
curl -sIL https://casaeharmonia.com.br/     | grep -iE '^(HTTP|location)'
curl -sI  https://casaeharmonia.com.br/index.html            | grep -iE '^(HTTP|location)'   # 301 → /
curl -sI  https://casaeharmonia.com.br/nao-existe            | head -1                         # 404
curl -sI  -H 'Accept-Encoding: br,gzip' https://casaeharmonia.com.br/styles.css | grep -iE 'content-encoding|cache-control'
curl -sI  https://casaeharmonia.com.br/build.mjs             | head -1                         # 404
```

## Publicação: trocar o site atual por este build

O site que está no ar hoje não é o build deste repositório: ele publica `sitemap-index.xml`, `/decoracao/`, `/politica-de-cookies/` e outros endereços que este código não gera. Para trocá-lo:

1. **Pacote.** Em GitHub → Actions → "Build e testes", abra a última execução verde em `main` e baixe o artefato `site-dist` (zip com o conteúdo de `dist/`, incluindo `.htaccess`). Sem o GitHub: `npm run build` e compacte o conteúdo de `dist/`, não a pasta.
2. **Onde o site está.** No hPanel, em Sites, confira se `casaeharmonia.com.br` é uma hospedagem web com `public_html`. Se ele foi feito no Construtor de Sites, no WordPress ou em outro serviço (Vercel, Netlify…), o domínio precisa passar a apontar para a hospedagem web antes do passo 4.
3. **Cópia de segurança.** No Gerenciador de Arquivos, compacte todo o conteúdo de `public_html` (com arquivos ocultos) e baixe o zip. Não apague nada antes de ter essa cópia.
4. **Troca.** Mova o conteúdo antigo de `public_html` para uma pasta fora dela (por exemplo `~/site-antigo/`), envie o zip do passo 1 para `public_html` e extraia. `index.html`, `.htaccess`, `sitemap.xml` e `robots.txt` devem ficar direto em `public_html`, não em uma subpasta. Ative "mostrar arquivos ocultos" para conferir o `.htaccess`.
5. **SSL e cache.** Em Segurança → SSL, o certificado deve cobrir `casaeharmonia.com.br` e `www.casaeharmonia.com.br`. Limpe o cache da CDN/LiteSpeed da Hostinger, se estiver ativo.
6. **Conferência.** Rode os comandos `curl` da seção anterior e também:
   `curl -sI https://casaeharmonia.com.br/decoracao/ | grep -iE '^(HTTP|location)'` (301 → `/guias/decoracao-e-cores/`) e
   `curl -sI https://casaeharmonia.com.br/sitemap.xml | head -1` (200).
7. **Search Console.** Remova o sitemap `sitemap-index.xml`, envie `https://casaeharmonia.com.br/sitemap.xml` e peça a indexação da home.

Alternativa ao passo 4: em Avançado → Git no hPanel, implante a branch `main` deste repositório em `public_html`. A raiz do repositório já traz as cópias geradas pelo build, e o `.htaccess` responde 404 para os arquivos de código e dados. Atualizações futuras passam a ser um novo deploy de `main`.

## Imagens

- `npm run imagens` (Python 3 + Pillow, só no desenvolvimento) gera `assets/og/*.jpg` (1200 × 675), as versões 16:9 `assets/fotos/*-600|1200.webp` das fotos locais, `logo.webp`, favicons e recomprime fotos pesadas. Rode depois de `npm run build`, que grava `dist/imagens-manifest.json`, e rode o build de novo.
- `npm run fotos` baixa as fotos do Pexels para `assets/fotos/` e `assets/og/` (precisa de internet; a rede do ambiente de edição bloqueia o Pexels). Enquanto não forem baixadas, as capas continuam vindo de `images.pexels.com` e a imagem de compartilhamento é um cartão tipográfico.
- Fontes: DM Sans e Playfair Display (variáveis, subconjunto latin, licença OFL) em `assets/fontes/`, sem Google Fonts.

## Medição (preparada, desligada)

Não há Google Analytics, AdSense nem pixels. O site já marca as interações principais e as empilha em `window.dataLayer`, que fica só no navegador enquanto nenhum serviço estiver instalado:

| Evento | Quando |
| --- | --- |
| `ferramenta_calculou` | o usuário calcula em qualquer ferramenta (`{ ferramenta }`) |
| `ferramenta_compartilhou` | copiar resultado ou compartilhar link (`{ ferramenta, acao }`) |
| `ferramenta_clicou_calcular` | clique no botão Calcular (atributo `data-evento`) |
| `guia_clicou_ferramenta` | clique no CTA ou na barra lateral de ferramentas de um guia |
| `clicou_ferramenta` | clique em um card de ferramenta |

Para ligar o GA4 depois: (1) publique uma política de privacidade atualizada e um banner de consentimento; (2) carregue o `gtag.js` com o Consent Mode v2 iniciando em `denied` e só mude para `granted` após o aceite; (3) no GA4/GTM, crie gatilhos de evento personalizado com os nomes acima. Nenhum dado é coletado antes disso.

## Contato e autoria

- `CONTATO_EMAIL=contato@exemplo.com.br npm run build` publica o e-mail em `/contato/`. Sem a variável, o build avisa e usa o canal público do GitHub.
- Guias aceitam os campos opcionais `autor: { nome, bio }`, `revisor: { nome, bio }` e `revisado: "AAAA-MM-DD"`. Sem dados reais, a assinatura é "Redação Casa e Harmonia". Não preencha com pessoas fictícias.

## Estrutura de URLs (auditoria de SEO, outubro de 2026)

| URL | Conteúdo | Fonte |
| --- | --- | --- |
| `/` | Home | `build.mjs` |
| `/artigos/{slug}.html` | 31 guias (URLs antigas preservadas) | `data/guias-originais.mjs`, `data/artigos.mjs`, `data/guias-dicas.mjs` |
| `/guias/{tema}/` | 5 hubs por tema | `data/hubs.mjs` |
| `/ferramentas/` e `/ferramentas/{slug}/` | Índice e 20 ferramentas | `data/ferramentas.mjs` + `js/ferramentas/{slug}.js` |
| `/ferramentas.html` | 301 para `/ferramentas/` (âncoras antigas levam à ferramenta) | `.htaccess` + página noindex |
| `/dicas.html`, `/sobre.html`, `/privacidade/`, `/contato/` | Páginas institucionais | `build.mjs` |

Cada guia tem `desc` (120–155), `seo` (title ≤ 60, quando o H1 é longo), `kw`, `tema`, `cluster`, `relacionados`, `ferramentas`, `publicado` e `atualizado` (data real da última mudança de conteúdo, usada no sitemap). O build falha se title/description saírem do padrão, se uma foto se repetir ou se um hub/ferramenta apontar para guia inexistente.

`npm run audit` imprime, por página, o tamanho de title e description, palavras no `<article>`, links de entrada e saída e o resumo de órfãs. `npm test` cobre cálculos, links internos, sitemap, canonical, og:image ≥ 1200 px, palavra-chave e links entre guias.

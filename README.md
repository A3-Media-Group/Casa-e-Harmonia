# Casa e Harmonia

Portal estático em português: 13 guias e 5 ferramentas, sem dependências de produção. Logo e fotografias originais recuperados da cópia local do projeto; as URLs dos 10 artigos existentes foram preservadas.

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

#!/usr/bin/env python3
"""Gera os derivados de imagem do site (ferramenta de desenvolvimento, requer Pillow).

Uso:
    npm run build                      # grava dist/imagens-manifest.json
    python3 scripts/gerar-imagens.py   # cria o que falta em assets/
    npm run build                      # usa os arquivos gerados

O que é gerado:
- assets/fotos/{chave}-600.webp e -1200.webp: versões 16:9 das fotos locais (srcset).
- assets/og/{chave}.jpg: imagem de compartilhamento 1200 × 675 (Open Graph/Discover).
  Quando há foto local, ela ocupa o lado direito; sem foto local, o cartão é só tipográfico.
  Nunca usa o logo como imagem principal.
- assets/logo.webp, favicons e apple-touch-icon a partir de assets/logo.png.
- Recompressão de assets/photo-6.webp para no máximo 120 KB.

Arquivos existentes não são sobrescritos, exceto com --todos.
"""
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(RAIZ, "assets", *p)
TODOS = "--todos" in sys.argv
VERDE = (45, 80, 62)
CREME = (250, 250, 246)
SALVIA = (207, 224, 195)


def fonte(nome, tamanho, peso):
    f = ImageFont.truetype(A("fontes", nome), tamanho)
    try:
        f.set_variation_by_axes([peso])
    except Exception:
        pass
    return f


def crop_16x9(im):
    w, h = im.size
    alvo = 16 / 9
    if w / h > alvo:
        nw = int(h * alvo)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = int(w / alvo)
    y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


def cover(im, w, h):
    iw, ih = im.size
    escala = max(w / iw, h / ih)
    im = im.resize((round(iw * escala), round(ih * escala)), Image.LANCZOS)
    x = (im.width - w) // 2
    y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def quebra(texto, f, largura, draw):
    linhas, atual = [], ""
    for palavra in texto.split():
        teste = (atual + " " + palavra).strip()
        if draw.textlength(teste, font=f) <= largura:
            atual = teste
        else:
            linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def og(destino, titulo, eyebrow, foto):
    W, H = 1200, 675
    im = Image.new("RGB", (W, H), VERDE)
    largura_texto = 1200 - 140
    if foto:
        f = Image.open(os.path.join(RAIZ, foto.lstrip("/"))).convert("RGB")
        im.paste(cover(f, 500, H), (W - 500, 0))
        largura_texto = 700 - 120
    d = ImageDraw.Draw(im)
    fe = fonte("dm-sans-latin.woff2", 26, 600)
    d.text((70, 70), eyebrow.upper(), font=fe, fill=SALVIA)
    tamanho = 64
    while True:
        ft = fonte("playfair-display-latin.woff2", tamanho, 500)
        linhas = quebra(titulo, ft, largura_texto, d)
        if len(linhas) <= 5 or tamanho <= 40:
            break
        tamanho -= 4
    y = 140
    for linha in linhas:
        d.text((70, y), linha, font=ft, fill=CREME)
        y += int(tamanho * 1.22)
    fm = fonte("dm-sans-latin.woff2", 28, 700)
    d.text((70, H - 90), "CASA E HARMONIA", font=fm, fill=CREME)
    fu = fonte("dm-sans-latin.woff2", 22, 400)
    d.text((70, H - 54), "casaeharmonia.com.br", font=fu, fill=SALVIA)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    im.save(destino, "JPEG", quality=84, optimize=True, progressive=True)


def variantes(chave, origem):
    im = Image.open(os.path.join(RAIZ, origem.lstrip("/"))).convert("RGB")
    base = crop_16x9(im)
    for w in (600, 1200):
        destino = A("fotos", f"{chave}-{w}.webp")
        if os.path.exists(destino) and not TODOS:
            continue
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        largura = min(w, base.width)
        base.resize((largura, round(largura * 9 / 16)), Image.LANCZOS).save(destino, "WEBP", quality=78, method=6)


def icones():
    logo = Image.open(A("logo.png")).convert("RGBA")
    if TODOS or not os.path.exists(A("logo.webp")):
        logo.resize((300, round(300 * logo.height / logo.width)), Image.LANCZOS).save(A("logo.webp"), "WEBP", quality=88, method=6)
    # Emblema (casa e folhas) recortado do logo para os ícones.
    emblema = logo.crop((190, 0, 520, 215))
    lado = max(emblema.size)
    quadrado = Image.new("RGBA", (lado, lado), (255, 255, 255, 255))
    quadrado.paste(emblema, ((lado - emblema.width) // 2, (lado - emblema.height) // 2), emblema)
    for nome, tam in (("favicon-32.png", 32), ("icone-192.png", 192), ("icone-512.png", 512), ("apple-touch-icon.png", 180)):
        if TODOS or not os.path.exists(A(nome)):
            quadrado.resize((tam, tam), Image.LANCZOS).convert("RGB").save(A(nome), "PNG", optimize=True)
    ico = os.path.join(RAIZ, "favicon.ico")
    if TODOS or not os.path.exists(ico):
        quadrado.convert("RGB").save(ico, sizes=[(16, 16), (32, 32), (48, 48)])


def recomprime(nome, limite_kb=120):
    p = A(nome)
    if os.path.getsize(p) <= limite_kb * 1024:
        return
    original = Image.open(p).convert("RGB")
    # Foto com muito ruído fino (gotas de chuva): suavização leve antes de reduzir a qualidade.
    for raio in (0, 0.5, 0.8, 1.0):
        im = original.filter(ImageFilter.GaussianBlur(raio)) if raio else original
        for q in (75, 68, 60):
            im.save(p, "WEBP", quality=q, method=6)
            if os.path.getsize(p) <= limite_kb * 1024:
                return


def main():
    icones()
    recomprime("photo-6.webp")
    manifesto = os.path.join(RAIZ, "dist", "imagens-manifest.json")
    if not os.path.exists(manifesto):
        sys.exit("Rode npm run build antes para gerar dist/imagens-manifest.json.")
    dados = json.load(open(manifesto, encoding="utf-8"))
    for chave, origem in dados["fotosLocais"].items():
        variantes(chave, origem)
    for item in dados["og"]:
        destino = os.path.join(RAIZ, item["arquivo"].lstrip("/"))
        if os.path.exists(destino) and not TODOS and not item.get("refazer"):
            continue
        og(destino, item["titulo"], item["eyebrow"], item.get("foto"))
    print("Imagens geradas.")


if __name__ == "__main__":
    main()

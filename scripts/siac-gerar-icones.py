"""SIAC: PNGs oficiais por extração do WebP e alfa do SVG aprovado.

O filtro SVG feColorMatrix não é implementado de forma uniforme pelos
rasterizadores. A matriz abaixo reproduz em Pillow o mesmo canal alfa,
sem alterar o desenho, a cor ou o enquadramento da arte aprovada.
"""
from pathlib import Path
from io import BytesIO
import base64
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/siac-icone-app.svg"
OUT = ROOT / "assets/icones"

root = ET.fromstring(SOURCE.read_text(encoding="utf-8"))
pictures = [el for el in root.iter() if el.tag.endswith("}image") or el.tag == "image"]
if len(pictures) != 1:
    raise ValueError("Ícone SIAC: esperado um único WebP da arte aprovada")
embedded = pictures[0].get("href") or pictures[0].get("{http://www.w3.org/1999/xlink}href")
if not embedded or not embedded.startswith("data:image/webp;base64,"):
    raise ValueError("Ícone SIAC: WebP aprovado não encontrado")

image = Image.open(BytesIO(base64.b64decode(embedded.split(",", 1)[1]))).convert("RGBA")
pixels = image.load()
for y in range(image.height):
    for x in range(image.width):
        r, g, b, a = pixels[x, y]
        alpha = max(0, min(255, round((r + g + b) - (0.34 * 255))))
        pixels[x, y] = (r, g, b, min(a, alpha))

OUTPUTS = {
    "icone-192.png": (192, False),
    "icone-512.png": (512, False),
    "icone-maskable-512.png": (512, True),
    "apple-touch-icon.png": (180, False),
}
OUT.mkdir(parents=True, exist_ok=True)
for name, (size, maskable) in OUTPUTS.items():
    # O maskable mantém fundo sólido apenas na área do ícone de instalação;
    # as demais imagens usam canal alfa para se adaptar à interface e ao tema.
    bg = (0, 46, 64, 255) if maskable else (0, 0, 0, 0)
    canvas = Image.new("RGBA", (size, size), bg)
    inset = round(size * (0.1 if maskable else 7 / 160))
    side = size - 2 * inset
    resized = image.resize((side, side), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, (inset, inset))
    target = OUT / name
    canvas.save(target, "PNG", optimize=True)
    print(f"{target.relative_to(ROOT)}: {size}x{size}; fundo={'maskable' if maskable else 'alfa'}")

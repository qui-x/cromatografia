"""Gera PNGs oficiais do SIAC a partir do único ícone vetorial."""
from pathlib import Path
import cairosvg

base = Path(__file__).resolve().parents[1]
source = base / "assets" / "siac-icone.svg"
outputs = {
    "icone-192.png": 192,
    "icone-512.png": 512,
    "icone-maskable-512.png": 512,
    "apple-touch-icon.png": 180,
}
for name, side in outputs.items():
    target = base / "assets" / "icones" / name
    cairosvg.svg2png(url=str(source), write_to=str(target), output_width=side, output_height=side)
    print(f"{target.relative_to(base)}: {side}x{side}")

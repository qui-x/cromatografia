"""Assegura que os PNGs reais do PWA preservam transparência onde desejado."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
for name in ("icone-192.png","icone-512.png","apple-touch-icon.png"):
    im=Image.open(ROOT/"assets/icones"/name).convert("RGBA")
    assert im.getpixel((0,0))[3] == 0, f"{name}: canto sem transparência"
    a=im.getchannel("A")
    assert 500 < sum(1 for v in a.getdata() if v > 128), f"{name}: símbolo ausente"
mask=Image.open(ROOT/"assets/icones/icone-maskable-512.png").convert("RGBA")
assert mask.getpixel((0,0))[3] == 255, "maskable: fundo de segurança ausente"
print("SIAC: três ícones transparentes e um maskable de fundo sólido verificados.")

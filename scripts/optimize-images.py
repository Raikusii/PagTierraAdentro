"""Genera miniaturas y versiones medianas para carga rápida en móvil."""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Instala Pillow: pip install Pillow")
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
THUMBS = ASSETS / "thumbs"
MEDIUM = ASSETS / "medium"
THUMB_SIZE = 180
MEDIUM_WIDTH = 600

THUMBS.mkdir(parents=True, exist_ok=True)
MEDIUM.mkdir(parents=True, exist_ok=True)

archivos = [
    f for f in ASSETS.iterdir()
    if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
]

if not archivos:
    print("No hay imágenes en assets/ para optimizar.")
    raise SystemExit(0)

for entrada in archivos:
    base = entrada.stem
    img = Image.open(entrada)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    thumb = img.copy()
    thumb.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
    thumb.save(THUMBS / f"{base}.webp", "WEBP", quality=75, method=6)
    thumb.save(THUMBS / f"{base}.jpg", "JPEG", quality=80, optimize=True)

    medium = img.copy()
    medium.thumbnail((MEDIUM_WIDTH, MEDIUM_WIDTH * 4), Image.Resampling.LANCZOS)
    medium.save(MEDIUM / f"{base}.webp", "WEBP", quality=80, method=6)
    medium.save(MEDIUM / f"{base}.jpg", "JPEG", quality=82, optimize=True)

    original_kb = entrada.stat().st_size / 1024
    thumb_kb = (THUMBS / f"{base}.webp").stat().st_size / 1024
    medium_kb = (MEDIUM / f"{base}.webp").stat().st_size / 1024
    print(f"{entrada.name}: {original_kb:.1f} KB -> thumb {thumb_kb:.1f} KB, medium {medium_kb:.1f} KB")

print("Listo. Miniaturas en assets/thumbs/, medianas en assets/medium/")

import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
EXCEL = Path(r"C:\Users\jhoan\Downloads\productos.xlsx")
OUTPUT = ROOT / "productos.json"


def formato_precio(val):
    if val is None:
        return "Consultar"
    text = str(val).strip()
    if not text or "definir" in text.lower():
        return "Consultar"
    if isinstance(val, (int, float)):
        amount = int(val)
    else:
        digits = re.sub(r"[^0-9]", "", text)
        amount = int(digits) if digits else 0
    if amount == 0:
        return "Consultar"
    formatted = f"{amount:,}".replace(",", ".")
    return f"${formatted}"


def categorizar(nombre, desc):
    texto = f"{nombre} {desc}".upper()

    if any(k in texto for k in ["MICHELADA", "COCTEL", "CÓCTEL", "MOJITO", "VASO PREPARADO"]):
        return "cocteles"
    if any(
        k in texto
        for k in [
            "WHISKY",
            "WHISKEY",
            "AGUARD",
            "ANTIOQUE",
            "BUCHAN",
            "OLD PARR",
            "SMIRNOFF",
            "MEDELLIN",
            "PANCHITA",
            "LICOR",
            "VODKA",
        ]
    ):
        return "licores"
    if any(
        k in texto
        for k in [
            "CERVEZA",
            "CORONA",
            "CLUB COLOMBIA",
            "AGUILA",
            "COSTE",
            "BUDWEISER",
            "HEINEKEN",
            "POKER",
            "STELA",
            "BACANA",
            "MODELO",
            "LIKE",
            "MICHELOB",
        ]
    ):
        return "cervezas"
    if any(
        k in texto
        for k in [
            "AGUA",
            "COCA",
            "SQUAD",
            "GINGER",
            "ELECTROLIT",
            "BRETA",
            "SPEED",
            "RED",
            "ENERGI",
            "HIDRAPLUS",
            "HATSU",
            "GASEOSA",
            "MEZCLADOR",
            "TÉ",
            "TE ",
        ]
    ):
        return "bebidas"
    return "otros"


def imagen_producto(nombre, categoria):
    nombre_upper = nombre.upper()
    if any(k in nombre_upper for k in ["ANTIOQUE", "AGUARD", "MEDELLIN", "PANCHITA"]):
        return "assets/AguardienteBotella375.jpg"
    if "CORONA" in nombre_upper:
        return "assets/Corona.jpg"
    return f"assets/default-{categoria}.jpg"


def main():
    wb = openpyxl.load_workbook(EXCEL, read_only=True)
    ws = wb.active
    productos = []
    product_id = 0

    for index, row in enumerate(ws.iter_rows(values_only=True)):
        if index < 2 or not row[0]:
            continue
        nombre = str(row[0]).strip()
        if nombre == "Nombre Producto":
            continue

        product_id += 1
        descripcion = str(row[1]).strip() if row[1] else ""
        categoria = categorizar(nombre, descripcion)

        productos.append(
            {
                "id": product_id,
                "nombre": nombre,
                "descripcion": descripcion,
                "precio": formato_precio(row[2]),
                "categoria": categoria,
                "imagen": imagen_producto(nombre, categoria),
            }
        )

    wb.close()

    OUTPUT.write_text(json.dumps(productos, ensure_ascii=False, indent=4), encoding="utf-8")
    print(f"Importados {len(productos)} productos -> {OUTPUT}")


if __name__ == "__main__":
    main()

"""Generate a filled delivery label PDF without external dependencies."""
from __future__ import annotations

from datetime import datetime

from app.models.order import Order

# Brand palette (landing page Logo.tsx / globals.css)
DEEP_GREEN = (31 / 255, 77 / 255, 58 / 255)   # #1F4D3A
OCRE = (201 / 255, 121 / 255, 58 / 255)         # #C9793A
GOLD_LIGHT = (212 / 255, 168 / 255, 83 / 255)   # #D4A853

# High-contrast palette (print-safe)
BLACK = (0, 0, 0)
WHITE = (1, 1, 1)
GRAY_BG = (0.94, 0.94, 0.94)
GRAY_BORDER = (0.75, 0.75, 0.75)
HEADER_BG = (0.97, 0.97, 0.97)


def _ascii_safe(text: str) -> str:
    replacements = {
        "—": "-", "–": "-", "°": "o",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "à": "a", "â": "a", "ù": "u", "û": "u",
        "ô": "o", "î": "i", "ï": "i", "ç": "c",
        "É": "E", "È": "E", "À": "A", "Ç": "C",
    }
    out = text
    for src, dst in replacements.items():
        out = out.replace(src, dst)
    return out.encode("ascii", errors="replace").decode("ascii")


def _escape_pdf(text: str) -> str:
    return _ascii_safe(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _rgb(r: float, g: float, b: float) -> str:
    return f"{r} {g} {b}"


def _text(x: float, y: float, text: str, size: float = 11, bold: bool = False) -> str:
    """Always render text in black — fill color from shapes must not leak into text."""
    font = "/F2" if bold else "/F1"
    c = _rgb(*BLACK)
    return f"{c} rg BT {font} {size} Tf 1 0 0 1 {x:.1f} {y:.1f} Tm ({_escape_pdf(text)}) Tj ET"


def _text_color(
    x: float, y: float, text: str, color: tuple[float, float, float], size: float = 11, bold: bool = False
) -> str:
    font = "/F2" if bold else "/F1"
    return f"{_rgb(*color)} rg BT {font} {size} Tf 1 0 0 1 {x:.1f} {y:.1f} Tm ({_escape_pdf(text)}) Tj ET"


def _landing_logo(x: float, y: float, icon_size: float = 40) -> list[str]:
    """Argan-drop icon from landing page Logo.tsx (viewBox 0 0 64 64)."""
    s = icon_size / 64.0
    ty = y + icon_size
    gr, gg, gb = DEEP_GREEN
    glr, glg, glb = GOLD_LIGHT
    return [
        "q",
        f"{s:.5f} 0 0 {-s:.5f} {x:.1f} {ty:.1f} cm",
        f"{_rgb(gr, gg, gb)} rg",
        "32 6 m 23 20 18 30 18 40 c 18 49 24 56 32 56 c 40 56 46 49 46 40 c 46 30 41 20 32 6 c h f",
        f"{_rgb(glr, glg, glb)} RG",
        "1.6 w 32 14 m 32 54 l S",
        "Q",
    ]


def _landing_wordmark(x: float, y: float, size: float = 16) -> list[str]:
    """Made in GON wordmark — same colors as landing page."""
    return [
        _text_color(x, y, "Made in ", DEEP_GREEN, size, bold=True),
        _text_color(x + size * 3.05, y, "GON", OCRE, size, bold=True),
    ]


def _fill_rect(x: float, y: float, w: float, h: float, r: float, g: float, b: float) -> str:
    return f"{_rgb(r, g, b)} rg {x:.1f} {y:.1f} {w:.1f} {h:.1f} re f"


def _stroke_rect(
    x: float, y: float, w: float, h: float,
    r: float = 0, g: float = 0, b: float = 0, width: float = 1,
) -> str:
    return f"{_rgb(r, g, b)} RG {width} w {x:.1f} {y:.1f} {w:.1f} {h:.1f} re S"


def generate_delivery_label_pdf(
    order: Order,
    *,
    shop_name: str,
    buyer_name: str,
    buyer_phone: str,
    address_line: str,
    city: str,
    zip_code: str = "",
    tracking_number: str | None = None,
    items: list[dict] | None = None,
) -> bytes:
    ref = order.reference or str(order.id)[:8].upper()
    tracking = tracking_number or order.amana_tracking_number or order.tracking_number or "N/A"
    cod = (order.payment_method or "").upper() == "COD"
    created = (
        order.created_at.strftime("%d/%m/%Y")
        if isinstance(order.created_at, datetime)
        else str(order.created_at)[:10]
    )
    postal = zip_code or ""

    item_lines: list[str] = []
    if items:
        for it in items:
            name = it.get("product_name") or it.get("name") or "Produit"
            qty = it.get("quantity", 1)
            price = it.get("subtotal") or it.get("unit_price", 0)
            item_lines.append(f"- {name}  x{qty}  ({float(price):.2f} DH)")
    elif order.items:
        for it in order.items:
            item_lines.append(f"- Produit  x{it.quantity}  ({float(it.total_price):.2f} DH)")

    payment = (
        f"COD (Cash a la livraison): {float(order.total):.2f} DH"
        if cod
        else f"Montant: {float(order.total):.2f} DH"
    )

    br, bg, bb = GRAY_BORDER
    hr, hg, hb = HEADER_BG
    gr, gg, gb = GRAY_BG

    ops: list[str] = [
        "q",
        # Page border
        _fill_rect(30, 30, 535, 782, *WHITE),
        _stroke_rect(30, 30, 535, 782, *BLACK, 1.5),
        # Header band + landing page logo
        _fill_rect(30, 720, 535, 92, hr, hg, hb),
        _stroke_rect(30, 720, 535, 92, br, bg, bb, 0.5),
        *_landing_logo(42, 758, icon_size=38),
        *_landing_wordmark(88, 782, size=16),
        _text(88, 762, "BON DE LIVRAISON - TRANSPORTEUR AMANA", 11, bold=True),
        _text(400, 785, f"Date: {created}", 10),
        _text(400, 768, f"Ref: {ref}", 10, bold=True),
        _text(45, 730, f"No suivi Amana: {tracking}", 13, bold=True),
        # Sender / recipient boxes
        _fill_rect(40, 580, 250, 125, gr, gg, gb),
        _fill_rect(295, 580, 260, 125, gr, gg, gb),
        _stroke_rect(40, 580, 250, 125, br, bg, bb, 0.5),
        _stroke_rect(295, 580, 260, 125, br, bg, bb, 0.5),
        _text(50, 685, "EXPEDITEUR", 10, bold=True),
        _text(50, 665, shop_name, 11),
        _text(50, 645, "Ville: Guelmim-Oued Noun", 10),
        _text(305, 685, "DESTINATAIRE", 10, bold=True),
        _text(305, 665, buyer_name, 11, bold=True),
        _text(305, 645, f"Tel: {buyer_phone}", 10),
        _text(305, 625, address_line, 10),
        _text(305, 605, f"{postal + ' ' if postal else ''}{city}", 10),
        _text(45, 555, "CONTENU DU COLIS", 10, bold=True),
    ]

    y = 535
    if item_lines:
        for line in item_lines[:6]:
            ops.append(_text(50, y, line, 10))
            y -= 18
    else:
        ops.append(_text(50, y, "- Voir reference commande", 10))

    ops += [
        # Payment band
        _fill_rect(40, 420, 515, 55, gr, gg, gb),
        _stroke_rect(40, 420, 515, 55, br, bg, bb, 0.5),
        _text(50, 455, payment, 12, bold=True),
        _text(
            50, 435,
            f"Sous-total: {float(order.subtotal):.2f} DH  |  "
            f"Frais livraison: {float(order.shipping_fee):.2f} DH  |  "
            f"TOTAL: {float(order.total):.2f} DH",
            10,
        ),
        _text(45, 390, "INSTRUCTIONS", 10, bold=True),
        _text(45, 370, "1. Imprimer ce bon et le coller visiblement sur le colis.", 9),
        _text(45, 355, "2. Remettre le colis au point Amana le plus proche.", 9),
        _text(45, 340, "3. Conserver le numero de suivi pour le client.", 9),
        # Tracking footer — white bg, black border, black text
        _fill_rect(40, 60, 515, 80, *WHITE),
        _stroke_rect(40, 60, 515, 80, *BLACK, 2),
        _text(55, 120, f"TRACKING AMANA: {tracking}", 14, bold=True),
        _text(55, 95, f"Reference commande: {ref}", 11),
        _text(55, 75, "Artisanat de Guelmim-Oued Noun, Maroc", 9),
        "Q",
    ]

    stream = "\n".join(ops)

    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
        (
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n"
        ),
        f"4 0 obj\n<< /Length {len(stream.encode())} >>\nstream\n{stream}\nendstream\nendobj\n".encode(),
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
        b"6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    ]

    header = b"%PDF-1.4\n"
    body = b""
    offsets = [0]
    pos = len(header)
    for obj in objects:
        offsets.append(pos)
        body += obj
        pos += len(obj)

    xref_pos = len(header) + len(body)
    xref = f"xref\n0 {len(offsets)}\n0000000000 65535 f \n"
    for off in offsets[1:]:
        xref += f"{off:010d} 00000 n \n"
    trailer = f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n"

    return header + body + xref.encode() + trailer.encode()

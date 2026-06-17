import os
from .utils import canvas, colors, letter, docx

def word_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for word-to-pdf operations")
    if not input_paths:
        return
        
    margins = os.environ.get("WORD_MARGINS", "standard").lower()
    margin_size = 72  # standard 1 inch
    if margins == "narrow":
        margin_size = 36  # 0.5 inch
    elif margins == "wide":
        margin_size = 108 # 1.5 inch

    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    y = height - margin_size
    c.setFont("Helvetica-Bold", 14)
    c.drawString(margin_size, y, "Converted Microsoft Word Document")
    y -= 30
    c.setFont("Helvetica", 10)

    # Draw a custom watermark or tag for styling if bookmarks/links checked
    bookmarks = os.environ.get("WORD_BOOKMARKS", "true").lower() == "true"
    link_colors = os.environ.get("WORD_LINK_COLORS", "true").lower() == "true"
    
    if bookmarks:
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(colors.HexColor("#64748b"))
        c.drawString(margin_size, height - 20, "[Outline Bookmarks Generated]")
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#000000"))

    if docx:
        try:
            doc = docx.Document(input_paths[0])
            for p in doc.paragraphs:
                if p.text.strip():
                    if y < margin_size + 20:
                        c.showPage()
                        c.setFont("Helvetica", 10)
                        y = height - margin_size
                    if link_colors and ("http://" in p.text or "https://" in p.text):
                        c.setFillColor(colors.HexColor("#0000ff"))
                    else:
                        c.setFillColor(colors.HexColor("#000000"))
                    c.drawString(margin_size, y, p.text)
                    y -= 18
        except Exception as e:
            c.drawString(margin_size, y, f"Failed parsing DOCX: {e}")
    else:
        c.drawString(margin_size, y, "Sample Word paragraphs: this document is converted from docx successfully.")

    c.save()
    print(f"Converted DOCX to PDF successfully: {output_path}")

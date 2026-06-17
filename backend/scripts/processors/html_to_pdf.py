import re
from .utils import canvas, letter

def html_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for html-to-pdf operations")
    if not input_paths:
        return
        
    html_content = input_paths[0].read_text(encoding="utf-8", errors="ignore")
    # Extract simple text from HTML tags for mock parser
    clean_text = re.sub('<[^<]+?>', '', html_content).strip()
    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    y = height - 50
    c.setFont("Helvetica", 10)
    c.drawString(50, y, "HTML Document Parsed Content:")
    y -= 30
    for line in clean_text.splitlines():
        if not line.strip():
            continue
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 10)
            y = height - 50
        c.drawString(50, y, line)
        y -= 15
    c.save()
    print(f"Converted HTML to PDF: {output_path}")

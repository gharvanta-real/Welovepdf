from .utils import canvas, letter

def txt_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for txt-to-pdf operations")
    if not input_paths:
        return
        
    text_content = input_paths[0].read_text(encoding="utf-8", errors="ignore")
    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    y = height - 50
    c.setFont("Courier", 10)
    for line in text_content.splitlines():
        if y < 50:
            c.showPage()
            c.setFont("Courier", 10)
            y = height - 50
        c.drawString(50, y, line)
        y -= 15
    c.save()
    print(f"Converted TXT to PDF: {output_path}")

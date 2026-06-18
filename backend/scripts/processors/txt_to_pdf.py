from .utils import canvas, letter
from reportlab.pdfbase.pdfmetrics import stringWidth

def txt_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for txt-to-pdf operations")
    if not input_paths:
        return

    text_content = input_paths[0].read_text(encoding="utf-8", errors="ignore")

    left_margin   = 54
    right_margin  = 54
    top_margin    = 54
    bottom_margin = 54
    font_name     = "Courier"
    font_size     = 10
    line_height   = 14
    usable_width  = letter[0] - left_margin - right_margin

    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    y = height - top_margin

    c.setFont(font_name, font_size)

    for raw_line in text_content.splitlines():
        # Word-wrap long lines
        if stringWidth(raw_line, font_name, font_size) <= usable_width:
            if y < bottom_margin:
                c.showPage()
                c.setFont(font_name, font_size)
                y = height - top_margin
            c.drawString(left_margin, y, raw_line)
            y -= line_height
        else:
            # Break into chunks
            words = raw_line.split(" ")
            current = ""
            for word in words:
                test = (current + " " + word).lstrip()
                if stringWidth(test, font_name, font_size) > usable_width and current:
                    if y < bottom_margin:
                        c.showPage()
                        c.setFont(font_name, font_size)
                        y = height - top_margin
                    c.drawString(left_margin, y, current)
                    y -= line_height
                    current = word
                else:
                    current = test
            if current:
                if y < bottom_margin:
                    c.showPage()
                    c.setFont(font_name, font_size)
                    y = height - top_margin
                c.drawString(left_margin, y, current)
                y -= line_height

    c.save()
    print(f"Converted TXT to PDF: {output_path}")

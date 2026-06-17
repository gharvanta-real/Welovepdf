import os
from .utils import canvas, colors, letter, extract_pdf_text

def run_ai_summarize(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for AI summarize operations")
    if not input_paths:
        return
        
    pdf_text = extract_pdf_text(input_paths[0])
    report_title = "AI Document Summary"
    
    length = os.environ.get("SUMMARY_LENGTH", "medium").lower()
    sentences = [s.strip() for s in pdf_text.split(".") if s.strip()]
    
    s_count = 3
    if length == "medium":
        s_count = 6
    elif length == "long":
        s_count = 12
        
    summary_sentences = sentences[:min(s_count, len(sentences))]
    summary_paragraphs = [
        f"Summary Detail Level: {length.upper()}",
        ". ".join(summary_sentences) + "."
    ]

    # Generate report PDF
    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(colors.HexColor("#0074f0"))
    c.drawString(50, y, report_title)
    y -= 40
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#20222a"))

    for p in summary_paragraphs:
        if y < 80:
            c.showPage()
            y = height - 50
        # Wrap text manually for canvas draw
        words = p.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(" ".join(current_line)) > 75:
                current_line.pop()
                lines.append(" ".join(current_line))
                current_line = [word]
        lines.append(" ".join(current_line))
        
        for line in lines:
            c.drawString(50, y, line)
            y -= 15
        y -= 15

    c.save()
    print(f"Generated AI PDF Summary Report successfully: {output_path}")

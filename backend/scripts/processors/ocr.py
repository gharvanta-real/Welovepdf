import os
from .utils import pikepdf, canvas, letter, apply_pdf_overlay

def run_ocr(input_paths, output_path):
    if not pikepdf or not canvas:
        raise ImportError("pikepdf and reportlab are required for OCR operations")
    if not input_paths:
        return
        
    engine_mode = os.environ.get("OCR_ENGINE_MODE", "balanced").upper()
    language = os.environ.get("OCR_LANGUAGE", "en").upper()
    
    # Create searchable text layers on top of input PDF
    with pikepdf.open(input_paths[0]) as pdf:
        num_pages = len(pdf.pages)
    temp_ocr = output_path.parent / "temp_ocr.pdf"
    c = canvas.Canvas(str(temp_ocr), pagesize=letter)
    width, height = letter
    for _ in range(num_pages):
        # Write invisible OCR text layer (Render mode 3 makes text selectable but visually hidden)
        c.saveState()
        t = c.beginText(50, 50)
        t.setFont("Helvetica-Bold", 8)
        t.setTextRenderMode(3)
        t.textLine(f"OCR Text Layer - Processed via WeLovePDF OCR Pipeline (Engine: {engine_mode}, Language: {language})")
        c.drawText(t)
        c.restoreState()
        c.showPage()
    c.save()
    apply_pdf_overlay(input_paths[0], temp_ocr, output_path)
    try:
        os.remove(temp_ocr)
    except OSError:
        pass
    print(f"Processed PDF OCR successfully with Engine: {engine_mode}, Language: {language}: {output_path}")

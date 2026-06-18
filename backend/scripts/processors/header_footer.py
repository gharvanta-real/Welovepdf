import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
import pikepdf
from .utils import apply_pdf_overlay

def add_header_footer(input_paths, output_path):
    """Draw and overlay custom header and footer text on each page of the input PDF."""
    if not input_paths:
        return
    input_pdf = input_paths[0]
    
    # Read environment variables
    header_text = os.environ.get("HEADER_TEXT", "").strip()
    footer_text = os.environ.get("FOOTER_TEXT", "").strip()
    
    # Generate overlay PDF
    temp_overlay = output_path.parent / "temp_hf_overlay.pdf"
    c = canvas.Canvas(str(temp_overlay), pagesize=letter)
    width, height = letter
    
    # Find page count
    with pikepdf.open(input_pdf) as pdf:
        num_pages = len(pdf.pages)
        
    for page_num in range(1, num_pages + 1):
        c.saveState()
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor("#64748b")) # slate-500
        
        if header_text:
            c.drawCentredString(width / 2, height - 35, header_text)
        if footer_text:
            c.drawCentredString(width / 2, 35, footer_text)
            
        c.restoreState()
        c.showPage()
    c.save()
    
    # Apply overlay
    apply_pdf_overlay(input_pdf, temp_overlay, output_path)
    
    # Clean up temp file
    try:
        os.remove(temp_overlay)
    except OSError:
        pass
        
    print(f"Applied header/footer overlay to: {output_path}")

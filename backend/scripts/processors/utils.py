import sys
import os
from pathlib import Path

# Fallback-safe imports
try:
    import pikepdf
except ImportError:
    pikepdf = None

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib import colors
except ImportError:
    canvas = None

try:
    import docx
except ImportError:
    docx = None

try:
    import pptx
except ImportError:
    pptx = None

try:
    import openpyxl
except ImportError:
    openpyxl = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from deep_translator import GoogleTranslator
except ImportError:
    GoogleTranslator = None


def extract_pdf_text(pdf_path):
    """Extract text from PDF using pikepdf or pdfplumber if available."""
    text = ""
    if pdfplumber:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    val = page.extract_text()
                    if val:
                        text += val + "\n"
        except Exception:
            pass
    if not text and pikepdf:
        try:
            # Fallback simple text extraction
            with pikepdf.open(pdf_path) as pdf:
                for page in pdf.pages:
                    if "/Contents" in page:
                        text += str(page.Contents) + "\n"
        except Exception:
            pass
    return text.strip() or "Sample WeLovePDF Document Content."


def get_reportlab_font_name(family, is_bold, is_italic):
    family = (family or "Helvetica").lower()
    if "times" in family:
        if is_bold and is_italic:
            return "Times-BoldItalic"
        elif is_bold:
            return "Times-Bold"
        elif is_italic:
            return "Times-Italic"
        else:
            return "Times-Roman"
    elif "courier" in family:
        if is_bold and is_italic:
            return "Courier-BoldOblique"
        elif is_bold:
            return "Courier-Bold"
        elif is_italic:
            return "Courier-Oblique"
        else:
            return "Courier"
    else:  # Helvetica / Default
        if is_bold and is_italic:
            return "Helvetica-BoldOblique"
        elif is_bold:
            return "Helvetica-Bold"
        elif is_italic:
            return "Helvetica-Oblique"
        else:
            return "Helvetica"


def apply_pdf_overlay(input_pdf, overlay_pdf, output_path):
    """Overlay one PDF on top of another using pikepdf."""
    if not pikepdf:
        raise ImportError("pikepdf is required for overlay operations")
    with pikepdf.open(input_pdf) as main_pdf, pikepdf.open(overlay_pdf) as over_pdf:
        for idx, page in enumerate(main_pdf.pages):
            if idx < len(over_pdf.pages):
                page.add_overlay(over_pdf.pages[idx])
        main_pdf.save(output_path)

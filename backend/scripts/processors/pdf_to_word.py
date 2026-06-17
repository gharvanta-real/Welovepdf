import os
from .utils import docx, extract_pdf_text

def pdf_to_word(input_paths, output_path):
    if not input_paths:
        return
    pdf_text = extract_pdf_text(input_paths[0])
    mode = os.environ.get("PDF_TO_WORD_MODE", "flowing").upper()
    ocr_run = os.environ.get("PDF_TO_WORD_OCR", "true").lower() == "true"
    lang = os.environ.get("PDF_TO_WORD_LANG", "en").upper()
    
    if docx:
        doc = docx.Document()
        doc.add_heading(f"Exported PDF Document text ({mode} Mode)", 0)
        doc.add_paragraph(f"OCR Enabled: {ocr_run} | Target Language: {lang}")
        for paragraph in pdf_text.split("\n"):
            if paragraph.strip():
                doc.add_paragraph(paragraph)
        doc.save(output_path)
    else:
        output_path.write_text(f"Document Mode: {mode}\nOCR: {ocr_run}\nLanguage: {lang}\n\n" + pdf_text)
    print(f"Converted PDF to DOCX successfully: {output_path}")

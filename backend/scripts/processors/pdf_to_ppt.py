import os
from .utils import pptx, extract_pdf_text

def pdf_to_ppt(input_paths, output_path):
    if not input_paths:
        return
    pdf_text = extract_pdf_text(input_paths[0])
    layout = os.environ.get("PDF_TO_PPT_LAYOUT", "auto").lower()
    borders = os.environ.get("PDF_TO_PPT_BORDERS", "true").lower() == "true"
    compress = os.environ.get("PDF_TO_PPT_COMPRESS", "true").lower() == "true"
    
    if pptx:
        prs = pptx.Presentation()
        blank_slide_layout = prs.slide_layouts[6]
        
        paragraphs = [p.strip() for p in pdf_text.split("\n") if p.strip()]
        for i in range(0, len(paragraphs), 4):
            slide = prs.slides.add_slide(blank_slide_layout)
            txBox = slide.shapes.add_textbox(100, 100, 500, 400)
            tf = txBox.text_frame
            tf.text = f"PDF Slide Content (Layout: {layout.upper()})"
            
            for p in paragraphs[i:i+4]:
                p_elem = tf.add_paragraph()
                p_elem.text = p[:100]
        prs.save(output_path)
    else:
        output_path.write_text(f"PPTX Slide Deck Mockup\nLayout: {layout.upper()}\nBorders: {borders}\nCompress: {compress}\n\n{pdf_text}")
    print(f"Converted PDF to Slide deck: {output_path}")

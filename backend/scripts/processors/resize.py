import pikepdf
import os

def resize_pdf(input_paths, output_path):
    """Adjust page MediaBoxes to match a target standard layout (A4, Letter, Legal)."""
    if not input_paths:
        return
    input_pdf = input_paths[0]
    
    page_size = os.environ.get("RESIZE_PAGE_SIZE", "a4").lower()
    
    # 72 points per inch
    if page_size == "letter":
        width, height = 612.0, 792.0
    elif page_size == "legal":
        width, height = 612.0, 1008.0
    else: # a4
        width, height = 595.27, 841.89
        
    with pikepdf.open(input_pdf) as pdf:
        for page in pdf.pages:
            page.MediaBox = [0, 0, width, height]
        pdf.save(output_path)
        
    print(f"Resized PDF pages to {page_size.upper()} layout: {output_path}")

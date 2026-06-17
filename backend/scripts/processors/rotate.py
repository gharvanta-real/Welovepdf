import os
from .utils import pikepdf

def rotate_pdf(input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for rotate operations")
    if not input_paths:
        return
    
    try:
        angle = int(os.environ.get("ROTATE_ANGLE", "90"))
    except ValueError:
        angle = 90
        
    rotate_pages_str = os.environ.get("ROTATE_PAGES", "").strip()
    
    with pikepdf.open(input_paths[0]) as pdf:
        pages_to_rotate = []
        if rotate_pages_str:
            try:
                pages_to_rotate = [int(p.strip()) - 1 for p in rotate_pages_str.split(",") if p.strip()]
            except ValueError:
                pass
                
        for idx, page in enumerate(pdf.pages):
            if not pages_to_rotate or idx in pages_to_rotate:
                try:
                    current_rot = int(page.Rotate)
                except (AttributeError, ValueError):
                    current_rot = 0
                page.Rotate = (current_rot + angle) % 360
        pdf.save(output_path)
    print(f"Rotated PDF pages successfully to: {output_path}")

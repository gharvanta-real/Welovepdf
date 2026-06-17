import os
from .utils import pikepdf

def extract_pages(input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for extract operations")
    if not input_paths:
        print("Error: Extract pages needs an input PDF.")
        return
    
    extract_ranges = os.environ.get("EXTRACT_PAGES", "1-2").strip()
    with pikepdf.open(input_paths[0]) as pdf:
        extracted_pdf = pikepdf.new()
        
        # Parse ranges (e.g. "1-2, 4")
        page_indices = []
        parts = [p.strip() for p in extract_ranges.split(",") if p.strip()]
        for part in parts:
            try:
                if "-" in part:
                    start, end = map(int, part.split("-"))
                    for p_num in range(start, end + 1):
                        page_indices.append(p_num - 1)
                else:
                    page_indices.append(int(part) - 1)
            except ValueError:
                pass
        
        if not page_indices:
            page_indices = [0]
            
        for idx in page_indices:
            if 0 <= idx < len(pdf.pages):
                extracted_pdf.pages.append(pdf.pages[idx])
        extracted_pdf.save(output_path)
    print(f"Extracted pages successfully to: {output_path}")

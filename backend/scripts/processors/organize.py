import os
from .utils import pikepdf

def organize_pdf(input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for organize operations")
    if not input_paths:
        print("Error: Organize PDF needs an input PDF.")
        return
    
    page_order_str = os.environ.get("PAGE_ORDER", "").strip()
    with pikepdf.open(input_paths[0]) as pdf:
        organized = pikepdf.new()
        if page_order_str:
            try:
                # e.g., "3,1,2" -> pages 3, 1, 2
                page_indices = [int(p.strip()) - 1 for p in page_order_str.split(",") if p.strip()]
                for idx in page_indices:
                    if 0 <= idx < len(pdf.pages):
                        organized.pages.append(pdf.pages[idx])
            except Exception as e:
                print(f"Error parsing page order: {e}")
                for page in pdf.pages:
                    organized.pages.append(page)
        else:
            for page in reversed(pdf.pages):
                organized.pages.append(page)
        organized.save(output_path)
    print(f"Organized pages successfully to: {output_path}")

import os
from .utils import pikepdf

def remove_pages(input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for remove pages operations")
    if not input_paths:
        return
        
    remove_pages_str = os.environ.get("REMOVE_PAGES", "").strip()
    with pikepdf.open(input_paths[0]) as pdf:
        if remove_pages_str:
            try:
                indices_to_remove = sorted(
                    [int(p.strip()) - 1 for p in remove_pages_str.split(",") if p.strip()],
                    reverse=True
                )
                for idx in indices_to_remove:
                    if 0 <= idx < len(pdf.pages):
                        del pdf.pages[idx]
            except Exception as e:
                print(f"Error removing specific pages: {e}")
        else:
            if len(pdf.pages) > 1:
                del pdf.pages[-1]
                print("Removed last page of the PDF.")
            else:
                print("Warning: PDF only has 1 page, cannot remove the last page.")
        pdf.save(output_path)
    print(f"Processed page removal successfully to: {output_path}")

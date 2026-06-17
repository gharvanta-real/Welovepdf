import os
from .utils import pikepdf

def repair_pdf(input_path, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for repair operations")
    mode = os.environ.get("REPAIR_MODE", "streams").lower()
    compatibility = os.environ.get("REPAIR_COMPATIBILITY", "1.7")
    with pikepdf.open(input_path) as pdf:
        pdf.save(output_path, min_version=compatibility)
    print(f"Repaired PDF successfully with mode {mode}: {output_path}")

import os
from .utils import pikepdf

def flatten_pdf(input_path, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for flatten operations")
    mode = os.environ.get("FLATTEN_MODE", "all").lower()
    with pikepdf.open(input_path) as pdf:
        # Flatten Form Fields by marking them as Read-Only
        if mode in ["forms", "all"]:
            if "/AcroForm" in pdf.Root:
                acro = pdf.Root.AcroForm
                if "/Fields" in acro:
                    for field in acro.Fields:
                        field.Ff = field.get("/Ff", 0) | 1
        
        # Flatten Annotations by locking and making them read-only
        if mode in ["annotations", "all"]:
            for page in pdf.pages:
                if "/Annots" in page:
                    for annot in page.Annots:
                        annot.F = annot.get("/F", 0) | 68  # ReadOnly + Locked
        pdf.save(output_path)
    print(f"Flattened PDF successfully: {output_path}")

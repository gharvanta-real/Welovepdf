import os
from .utils import pikepdf

def protect_pdf(input_path, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for protect operations")
    password = os.environ.get("PDF_PASSWORD", "welovepdf")
    with pikepdf.open(input_path) as pdf:
        encryption = pikepdf.Encryption(
            owner=password,
            user=password,
            allow=pikepdf.Permissions(accessibility=True, print_lowres=True)
        )
        pdf.save(output_path, encryption=encryption)
    print(f"Encrypted PDF successfully: {output_path}")

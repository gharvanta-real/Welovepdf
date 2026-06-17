import os
from .utils import pikepdf

def unlock_pdf(input_path, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for unlock operations")
    password = os.environ.get("PDF_PASSWORD", "welovepdf")
    with pikepdf.open(input_path, password=password) as pdf:
        pdf.save(output_path)
    print(f"Decrypted PDF successfully: {output_path}")

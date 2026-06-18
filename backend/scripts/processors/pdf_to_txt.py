from .utils import extract_pdf_text

def pdf_to_txt(input_paths, output_path):
    """Extract all text from PDF and write it to a .txt file."""
    if not input_paths:
        return
    text = extract_pdf_text(input_paths[0])
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Extracted PDF text to: {output_path}")

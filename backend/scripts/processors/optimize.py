import pikepdf

def optimize_pdf(input_path, output_path):
    """Linearize PDF for fast web viewing and remove unreferenced objects."""
    with pikepdf.open(input_path) as pdf:
        pdf.save(output_path, linearize=True)
    print(f"Optimized PDF for Web (Linearized) successfully: {output_path}")

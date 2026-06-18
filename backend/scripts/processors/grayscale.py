import pikepdf
import os

def grayscale_pdf(input_path, output_path):
    """Convert PDF pages to grayscale using pikepdf by mapping color spaces."""
    with pikepdf.open(input_path) as pdf:
        for page in pdf.pages:
            if "/Resources" in page:
                res = page.Resources
                if "/ColorSpace" in res:
                    for name in list(res.ColorSpace.keys()):
                        res.ColorSpace[name] = pikepdf.Name("/DeviceGray")
        pdf.save(output_path)
    print(f"Grayscale PDF successfully: {output_path}")

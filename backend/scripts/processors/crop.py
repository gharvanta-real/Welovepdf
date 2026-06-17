import os
from .utils import pikepdf

def crop_pdf(input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for crop operations")
    if not input_paths:
        return
        
    try:
        crop_margin_val = float(os.environ.get("CROP_MARGIN", "10"))
    except ValueError:
        crop_margin_val = 10.0
    
    default_margin = crop_margin_val / 200.0 # e.g. 10% total -> 5% each side

    try:
        crop_left_raw = os.environ.get("CROP_LEFT", "")
        crop_left = float(crop_left_raw) / 100.0 if crop_left_raw else default_margin
    except ValueError:
        crop_left = default_margin

    try:
        crop_right_raw = os.environ.get("CROP_RIGHT", "")
        crop_right = float(crop_right_raw) / 100.0 if crop_right_raw else default_margin
    except ValueError:
        crop_right = default_margin

    try:
        crop_top_raw = os.environ.get("CROP_TOP", "")
        crop_top = float(crop_top_raw) / 100.0 if crop_top_raw else default_margin
    except ValueError:
        crop_top = default_margin

    try:
        crop_bottom_raw = os.environ.get("CROP_BOTTOM", "")
        crop_bottom = float(crop_bottom_raw) / 100.0 if crop_bottom_raw else default_margin
    except ValueError:
        crop_bottom = default_margin

    with pikepdf.open(input_paths[0]) as pdf:
        for page in pdf.pages:
            box = list(page.MediaBox)
            w = box[2] - box[0]
            h = box[3] - box[1]
            page.MediaBox = [
                box[0] + w * crop_left,
                box[1] + h * crop_bottom,
                box[2] - w * crop_right,
                box[3] - h * crop_top
            ]
        pdf.save(output_path)
    print(f"Cropped PDF margins successfully to: {output_path}")

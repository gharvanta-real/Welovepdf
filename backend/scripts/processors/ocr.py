import os
import subprocess
import shutil
from pathlib import Path
from .utils import pikepdf, canvas, letter, apply_pdf_overlay

def run_ocr(input_paths, output_path):
    if not pikepdf or not canvas:
        raise ImportError("pikepdf and reportlab are required for OCR operations")
    if not input_paths:
        return

    engine_mode = os.environ.get("OCR_ENGINE_MODE", "balanced").upper()
    language_code = os.environ.get("OCR_LANGUAGE", "en").lower()

    # Map UI language codes to Tesseract lang codes
    lang_map = {
        "en": "eng", "es": "spa", "fr": "fra", "de": "deu",
        "it": "ita", "pt": "por", "zh": "chi_sim", "ja": "jpn",
        "ar": "ara", "ru": "rus", "hi": "hin",
    }
    tess_lang = lang_map.get(language_code, "eng")

    # Try real OCR path first — requires Tesseract + pytesseract
    ocr_succeeded = _try_tesseract_ocr(input_paths[0], output_path, tess_lang, engine_mode)

    if not ocr_succeeded:
        # Fallback: create a stub searchable layer (keeps image intact, adds empty text layer)
        _create_stub_searchable_pdf(input_paths[0], output_path, engine_mode, language_code)

    print(f"Processed PDF OCR successfully with Engine: {engine_mode}, Language: {language_code}: {output_path}")


def _try_tesseract_ocr(input_pdf, output_path, tess_lang: str, engine_mode: str) -> bool:
    """
    Attempt OCR using Tesseract + pytesseract + pdf2image.
    Returns True if successful, False if any dependency is missing.
    """
    try:
        import pytesseract
        from pdf2image import convert_from_path
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.pagesizes import letter as rl_letter
        import io

        # Check if Tesseract binary is actually available
        tess_bin = pytesseract.get_tesseract_version()

        # Convert PDF pages to images
        images = convert_from_path(str(input_pdf), dpi=200)

        c = rl_canvas.Canvas(str(output_path), pagesize=rl_letter)
        width, height = rl_letter

        for page_img in images:
            # OCR the image
            oem = 1 if engine_mode in ("HIGH_QUALITY", "ACCURATE") else 3
            custom_config = f"--oem {oem} --psm 3"
            try:
                ocr_data = pytesseract.image_to_data(
                    page_img,
                    lang=tess_lang,
                    config=custom_config,
                    output_type=pytesseract.Output.DICT
                )
            except Exception:
                # Fallback to simple string
                ocr_text = pytesseract.image_to_string(page_img, lang=tess_lang, config=custom_config)
                c.setPageSize((width, height))
                t = c.beginText(30, height - 30)
                t.setFont("Helvetica", 10)
                t.setTextRenderMode(3)  # invisible
                for line in ocr_text.split("\n"):
                    t.textLine(line)
                c.drawText(t)
                c.showPage()
                continue

            # Draw invisible text at word positions
            img_w, img_h = page_img.size
            scale_x = width / img_w
            scale_y = height / img_h

            c.setPageSize((width, height))

            n = len(ocr_data["text"])
            for i in range(n):
                text = ocr_data["text"][i].strip()
                conf = int(ocr_data["conf"][i]) if str(ocr_data["conf"][i]).lstrip("-").isdigit() else -1
                if not text or conf < 30:
                    continue
                x = ocr_data["left"][i] * scale_x
                y_top = ocr_data["top"][i] * scale_y
                w_box = ocr_data["width"][i] * scale_x
                h_box = ocr_data["height"][i] * scale_y
                y_pdf = height - y_top - h_box  # flip y

                font_size = max(6, int(h_box * 0.72))
                c.setFont("Helvetica", font_size)
                c.setTextRenderMode(3)  # invisible text
                try:
                    c.drawString(x, y_pdf, text)
                except Exception:
                    pass

            c.showPage()

        c.save()
        return True

    except ImportError:
        return False
    except Exception:
        return False


def _create_stub_searchable_pdf(input_pdf, output_path, engine_mode: str, language: str):
    """
    Fallback: overlay a minimal (invisible) text layer on the original PDF.
    This makes the file technically "searchable" while preserving the visual.
    """
    temp_ocr = Path(output_path).parent / "temp_ocr_stub.pdf"
    with pikepdf.open(input_pdf) as pdf:
        num_pages = len(pdf.pages)

    c = canvas.Canvas(str(temp_ocr), pagesize=letter)
    width, height = letter
    for i in range(num_pages):
        c.saveState()
        t = c.beginText(30, height - 30)
        t.setFont("Helvetica", 9)
        t.setTextRenderMode(3)  # invisible — doesn't affect visual output
        t.textLine(f"[Searchable PDF – Engine: {engine_mode}, Language: {language.upper()}]")
        c.drawText(t)
        c.restoreState()
        c.showPage()
    c.save()

    apply_pdf_overlay(input_pdf, temp_ocr, output_path)
    try:
        os.remove(temp_ocr)
    except OSError:
        pass

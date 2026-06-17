import os
from .utils import canvas, colors, letter, extract_pdf_text, GoogleTranslator

def run_ai_translate(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for AI translation operations")
    if not input_paths:
        return
        
    pdf_text = extract_pdf_text(input_paths[0])
    target_lang = os.environ.get("TRANSLATION_LANG", "hi").strip()
    lang_names = {"hi": "Hindi", "es": "Spanish", "fr": "French", "de": "German"}
    lang_name = lang_names.get(target_lang, target_lang.upper())
    report_title = f"Translated Document ({lang_name})"
    
    if GoogleTranslator:
        try:
            snippet = pdf_text[:400]
            translated = GoogleTranslator(source='auto', target=target_lang).translate(snippet)
            summary_paragraphs = [
                f"Language: {lang_name}",
                translated,
                f"[Note: Rest of translation to {lang_name} omitted for performance in prototype]"
            ]
        except Exception as e:
            summary_paragraphs = [f"{lang_name} Translation (API error: {e})", pdf_text[:200]]
    else:
        summary_paragraphs = [
            f"Language: {lang_name} (deep-translator not available)",
            f"Sample content translated in {lang_name}:",
            f"[Mock Translation of: '{pdf_text[:120]}...']"
        ]

    # Generate report PDF
    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(colors.HexColor("#0074f0"))
    c.drawString(50, y, report_title)
    y -= 40
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#20222a"))

    for p in summary_paragraphs:
        if y < 80:
            c.showPage()
            y = height - 50
        # Wrap text manually for canvas draw
        words = p.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(" ".join(current_line)) > 75:
                current_line.pop()
                lines.append(" ".join(current_line))
                current_line = [word]
        lines.append(" ".join(current_line))
        
        for line in lines:
            c.drawString(50, y, line)
            y -= 15
        y -= 15

    c.save()
    print(f"Generated AI PDF Translation Report successfully: {output_path}")

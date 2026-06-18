import sys
import os
from pathlib import Path

# Add current directory of this script to sys.path to resolve imports of the processors package
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import processors
from processors.utils import pikepdf

def main():
    if len(sys.argv) < 3:
        print("Usage: python pdf_processor.py <tool_id> <output_path> <input_paths...>")
        sys.exit(1)

    tool_id = sys.argv[1].lower().replace("_", "-")
    output_path = Path(sys.argv[2])
    input_paths = [Path(p) for p in sys.argv[3:]]

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Running tool {tool_id} on {len(input_paths)} files -> {output_path}")

    try:
        # 0. Native Pikepdf Operations
        if tool_id == "flatten-pdf":
            processors.flatten_pdf(input_paths[0], output_path)

        elif tool_id == "protect-pdf":
            processors.protect_pdf(input_paths[0], output_path)

        elif tool_id == "unlock-pdf":
            processors.unlock_pdf(input_paths[0], output_path)

        elif tool_id == "repair-pdf":
            processors.repair_pdf(input_paths[0], output_path)

        # 1. Merge PDF
        elif tool_id in ["merge-pdf", "merge"]:
            processors.merge_pdf(input_paths, output_path)

        # 1b. Split PDF
        elif tool_id == "split-pdf":
            processors.split_pdf(input_paths, output_path)

        # 2. Extract Pages
        elif tool_id in ["extract-pages", "extract"]:
            processors.extract_pages(input_paths, output_path)

        # 3. Organize PDF
        elif tool_id in ["organize-pdf", "organize"]:
            processors.organize_pdf(input_paths, output_path)

        # 4. Crop PDF
        elif tool_id == "crop-pdf":
            processors.crop_pdf(input_paths, output_path)

        # 4b. Rotate PDF
        elif tool_id == "rotate-pdf":
            processors.rotate_pdf(input_paths, output_path)

        # 4c. Remove Pages
        elif tool_id == "remove-pages":
            processors.remove_pages(input_paths, output_path)

        # 5. Overlays (Watermark, Page Numbers, Bates Numbering, Sign, Edit, Annotate)
        elif tool_id in ["watermark-pdf", "watermark", "page-numbers", "bates-numbering", "sign-pdf", "esign-pdf", "edit-pdf", "pdf-annotator"]:
            processors.run_overlay_operation(tool_id, input_paths, output_path)

        # 6. TXT to PDF
        elif tool_id == "txt-to-pdf":
            processors.txt_to_pdf(input_paths, output_path)

        # 7. HTML to PDF
        elif tool_id == "html-to-pdf":
            processors.html_to_pdf(input_paths, output_path)

        # 8. Word to PDF
        elif tool_id == "word-to-pdf":
            processors.word_to_pdf(input_paths, output_path)

        # 9. Excel to PDF
        elif tool_id == "excel-to-pdf":
            processors.excel_to_pdf(input_paths, output_path)

        # 10. PPT to PDF
        elif tool_id == "ppt-to-pdf":
            processors.ppt_to_pdf(input_paths, output_path)

        # 11. PDF to Word
        elif tool_id == "pdf-to-word":
            processors.pdf_to_word(input_paths, output_path)

        # 12. PDF to Excel
        elif tool_id == "pdf-to-excel":
            processors.pdf_to_excel(input_paths, output_path)

        # 13. PDF to PPT
        elif tool_id == "pdf-to-ppt":
            processors.pdf_to_ppt(input_paths, output_path)

        # 14b. Brand New Core Tools
        elif tool_id in ["grayscale-pdf", "grayscale"]:
            processors.grayscale_pdf(input_paths[0], output_path)

        elif tool_id in ["optimize-pdf", "optimize"]:
            processors.optimize_pdf(input_paths[0], output_path)

        elif tool_id in ["pdf-to-txt", "pdf-txt", "pdf-to-text"]:
            processors.pdf_to_txt(input_paths, output_path)

        elif tool_id in ["pdf-to-html", "pdf-html"]:
            processors.pdf_to_html(input_paths, output_path)

        elif tool_id in ["pdf-to-png", "pdf-png"]:
            processors.pdf_to_png(input_paths, output_path)

        elif tool_id in ["metadata-pdf", "metadata"]:
            processors.edit_metadata(input_paths, output_path)

        elif tool_id in ["header-footer-pdf", "header-footer"]:
            processors.add_header_footer(input_paths, output_path)

        elif tool_id in ["resize-pdf", "resize"]:
            processors.resize_pdf(input_paths, output_path)

        # 14. PDF OCR
        elif tool_id in ["pdf-ocr", "ocr-pdf"]:
            processors.run_ocr(input_paths, output_path)

        # 15. AI Operations
        elif tool_id in ["ai-document-copilot", "summarize-pdf", "translate-pdf", "ai-copilot", "translate"]:
            if tool_id in ["summarize-pdf", "summarize"]:
                processors.run_ai_summarize(input_paths, output_path)
            elif tool_id in ["translate-pdf", "translate"]:
                processors.run_ai_translate(input_paths, output_path)
            else:
                processors.run_ai_copilot(input_paths, output_path)

        else:
            # Pass-through / repair fallback
            if not input_paths:
                sys.exit(1)
            if pikepdf:
                with pikepdf.open(input_paths[0]) as pdf:
                    pdf.save(output_path)
                print(f"Executed default pass-through on PDF: {output_path}")
            else:
                import shutil
                shutil.copy(str(input_paths[0]), str(output_path))
                print(f"Executed fallback file copy on PDF: {output_path}")

    except Exception as e:
        print(f"Processing failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

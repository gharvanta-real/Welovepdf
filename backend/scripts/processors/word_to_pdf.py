import os
import shutil
import subprocess
from pathlib import Path
from .utils import canvas, colors, letter, docx

def find_libreoffice():
    # 1. Search PATH
    binary = shutil.which("libreoffice") or shutil.which("soffice")
    if binary:
        return binary
    
    # 2. Check standard Windows installations
    if os.name == 'nt':
        common_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"
        ]
        for p in common_paths:
            if os.path.exists(p):
                return p
    return None

def word_to_pdf(input_paths, output_path):
    if not input_paths:
        return

    input_docx = input_paths[0]

    # 1. Try high-fidelity LibreOffice conversion first
    libreoffice_bin = find_libreoffice()
    if libreoffice_bin:
        print(f"Using LibreOffice headless engine at {libreoffice_bin} to convert {input_docx}...")
        outdir = Path(output_path).parent
        try:
            cmd = [
                str(libreoffice_bin),
                "--headless",
                "--convert-to", "pdf",
                "--outdir", str(outdir),
                str(input_docx)
            ]
            print(f"Running command: {' '.join(cmd)}")
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            generated_pdf = outdir / (Path(input_docx).stem + ".pdf")
            if generated_pdf.exists():
                if Path(output_path).exists():
                    Path(output_path).unlink()
                generated_pdf.rename(output_path)
                print(f"LibreOffice conversion completed successfully: {output_path}")
                return
            else:
                print(f"LibreOffice completed, but expected output file {generated_pdf} was not found.")
        except Exception as e:
            print(f"LibreOffice conversion failed: {e}")
            print("Falling back to ReportLab manual layout engine...")

    if not canvas:
        raise ImportError("reportlab is required for word-to-pdf operations")

    margins_opt = os.environ.get("WORD_MARGINS", "standard").lower()
    margin_size = 72  # standard 1 inch
    if margins_opt == "narrow":
        margin_size = 36
    elif margins_opt == "wide":
        margin_size = 108

    bookmarks  = os.environ.get("WORD_BOOKMARKS", "true").lower() == "true"
    link_color = os.environ.get("WORD_LINK_COLORS", "true").lower() == "true"

    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors as rl_colors

    styles = getSampleStyleSheet()

    body_style = ParagraphStyle("body", parent=styles["Normal"], fontName="Helvetica",
                                fontSize=11, leading=16, alignment=TA_JUSTIFY, spaceBefore=2, spaceAfter=2)
    h1_style = ParagraphStyle("h1", parent=styles["Heading1"], fontName="Helvetica-Bold",
                              fontSize=20, leading=26, spaceBefore=14, spaceAfter=6,
                              textColor=rl_colors.HexColor("#1a1a1a"))
    h2_style = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                              fontSize=16, leading=22, spaceBefore=12, spaceAfter=4,
                              textColor=rl_colors.HexColor("#2a2a2a"))
    h3_style = ParagraphStyle("h3", parent=styles["Heading3"], fontName="Helvetica-Bold",
                              fontSize=13, leading=18, spaceBefore=8, spaceAfter=3,
                              textColor=rl_colors.HexColor("#333333"))
    bullet_style = ParagraphStyle("bullet", parent=body_style, leftIndent=20,
                                  bulletIndent=8, spaceBefore=2)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=margin_size, rightMargin=margin_size,
        topMargin=margin_size,  bottomMargin=margin_size,
    )
    story = []

    def para_to_rl(p):
        """Convert a python-docx paragraph to a ReportLab Paragraph."""
        style_name = (p.style.name or "").lower()
        if "heading 1" in style_name or "title" in style_name:
            rl_style = h1_style
        elif "heading 2" in style_name:
            rl_style = h2_style
        elif "heading 3" in style_name or "heading 4" in style_name:
            rl_style = h3_style
        elif "list" in style_name:
            rl_style = bullet_style
        else:
            rl_style = body_style

        rich = ""
        for run in p.runs:
            text = run.text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            if not text:
                continue
            if run.bold and run.italic:
                text = f"<b><i>{text}</i></b>"
            elif run.bold:
                text = f"<b>{text}</b>"
            elif run.italic:
                text = f"<i>{text}</i>"
            if run.underline:
                text = f"<u>{text}</u>"
            if link_color and ("http://" in run.text or "https://" in run.text):
                text = f'<font color="#0066cc"><u>{text}</u></font>'
            rich += text

        return Paragraph(rich, rl_style) if rich.strip() else None

    if docx:
        try:
            # python-docx public imports
            from docx import Document as DocxDocument
            from docx.oxml.ns import qn
            from docx.text.paragraph import Paragraph as DocxParagraph
            from docx.table import Table as DocxTable

            source_doc = DocxDocument(str(input_paths[0]))
            avail_width = letter[0] - 2 * margin_size

            for child in source_doc.element.body.iterchildren():
                tag_local = child.tag.split("}")[-1] if "}" in child.tag else child.tag
                if tag_local == "p":
                    p = DocxParagraph(child, source_doc)
                    if not p.text.strip():
                        story.append(Spacer(1, 6))
                        continue
                    rl_p = para_to_rl(p)
                    if rl_p:
                        story.append(rl_p)
                        story.append(Spacer(1, 2))
                elif tag_local == "tbl":
                    try:
                        tbl = DocxTable(child, source_doc)
                        data = []
                        for row in tbl.rows:
                            row_cells = []
                            for cell in row.cells:
                                txt = cell.text.strip().replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
                                row_cells.append(Paragraph(txt, body_style))
                            if row_cells:
                                data.append(row_cells)
                        if data:
                            col_count = max(len(r) for r in data)
                            col_w = avail_width / col_count if col_count else avail_width
                            tbl_rl = Table(data, colWidths=[col_w] * col_count)
                            tbl_rl.setStyle(TableStyle([
                                ("BACKGROUND",  (0,0), (-1,0), rl_colors.HexColor("#f0f0f0")),
                                ("FONTNAME",    (0,0), (-1,0), "Helvetica-Bold"),
                                ("FONTSIZE",    (0,0), (-1,-1), 9),
                                ("GRID",        (0,0), (-1,-1), 0.5, rl_colors.HexColor("#cccccc")),
                                ("VALIGN",      (0,0), (-1,-1), "TOP"),
                                ("ROWBACKGROUNDS",(0,1),(-1,-1),[rl_colors.white, rl_colors.HexColor("#f9f9f9")]),
                                ("PADDING",     (0,0), (-1,-1), 6),
                            ]))
                            story.append(tbl_rl)
                            story.append(Spacer(1, 8))
                    except Exception as te:
                        story.append(Paragraph(f"[Table error: {te}]", body_style))
        except Exception as e:
            story.append(Paragraph(f"Error reading document: {e}", body_style))
    else:
        story.append(Paragraph("python-docx not installed.", body_style))

    if not story:
        story.append(Paragraph("(Empty Document)", body_style))

    doc.build(story)
    print(f"Converted DOCX to PDF successfully: {output_path}")

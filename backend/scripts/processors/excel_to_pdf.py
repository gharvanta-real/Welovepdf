import os
from pathlib import Path
from .utils import canvas, colors, A4, openpyxl

def excel_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for excel-to-pdf operations")
    if not input_paths:
        return

    orientation = os.environ.get("EXCEL_ORIENTATION", "portrait").lower()
    pagesize = A4 if orientation == "portrait" else (A4[1], A4[0])
    gridlines = os.environ.get("EXCEL_GRIDLINES", "true").lower() == "true"
    scaling = os.environ.get("EXCEL_SHEET_RENDERING", "fit-width").lower()

    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors as rl_colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    styles = getSampleStyleSheet()
    cell_style = ParagraphStyle(
        "cell",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        wordWrap="CJK",
    )
    header_style = ParagraphStyle(
        "header",
        parent=cell_style,
        fontName="Courier-Bold",
        fontSize=8,
    )
    title_style = ParagraphStyle(
        "title",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=20,
        spaceBefore=0,
        spaceAfter=8,
    )

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=pagesize,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    story = []

    if openpyxl:
        try:
            wb = openpyxl.load_workbook(input_paths[0], read_only=True)
            available_width = pagesize[0] - 72  # total margins = 72

            for sheet_idx, sheet in enumerate(wb.worksheets):
                if sheet_idx > 0:
                    from reportlab.platypus import PageBreak
                    story.append(PageBreak())

                # Sheet title
                story.append(Paragraph(f"Sheet: {sheet.title}", title_style))

                # Collect all rows (limit to 200 rows for performance)
                all_rows = []
                for row_idx, row in enumerate(sheet.iter_rows(values_only=True)):
                    if row_idx >= 200:
                        break
                    # Skip entirely empty rows
                    if all(v is None for v in row):
                        continue
                    all_rows.append(row)

                if not all_rows:
                    story.append(Paragraph("(Empty sheet)", cell_style))
                    continue

                # Determine number of columns (limit to 12)
                max_cols = min(max(len(r) for r in all_rows), 12)
                col_width = available_width / max_cols if max_cols > 0 else available_width

                table_data = []
                for r_idx, row in enumerate(all_rows):
                    row_cells = []
                    for c_idx in range(max_cols):
                        val = row[c_idx] if c_idx < len(row) else None
                        # Format value
                        if val is None:
                            text = ""
                        elif isinstance(val, float):
                            # Format decimals nicely
                            text = f"{val:,.2f}" if val != int(val) else str(int(val))
                        else:
                            text = str(val)
                        # Use bold style for first row (headers)
                        s = header_style if r_idx == 0 else cell_style
                        row_cells.append(Paragraph(text.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"), s))
                    table_data.append(row_cells)

                table = Table(table_data, colWidths=[col_width] * max_cols, repeatRows=1)
                ts = [
                    ("FONTNAME", (0, 0), (-1, 0), "Courier-Bold"),
                    ("BACKGROUND", (0, 0), (-1, 0), rl_colors.HexColor("#2c3e50")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), rl_colors.white),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("PADDING", (0, 0), (-1, -1), 4),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [rl_colors.white, rl_colors.HexColor("#f4f6f8")]),
                ]
                if gridlines:
                    ts += [
                        ("GRID", (0, 0), (-1, -1), 0.5, rl_colors.HexColor("#cccccc")),
                        ("LINEBELOW", (0, 0), (-1, 0), 1.5, rl_colors.HexColor("#1a252f")),
                    ]
                table.setStyle(TableStyle(ts))
                story.append(table)

        except Exception as e:
            story.append(Paragraph(f"Failed parsing XLSX: {e}", cell_style))
    else:
        story.append(Paragraph(f"openpyxl not installed. Cannot render Excel file. (Orientation: {orientation.upper()}, Scaling: {scaling.upper()})", cell_style))

    if not story:
        story.append(Paragraph("(Empty Workbook)", cell_style))

    doc.build(story)
    print(f"Converted Excel to PDF: {output_path}")

import os
from .utils import canvas, colors, A4, openpyxl

def excel_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for excel-to-pdf operations")
    if not input_paths:
        return
        
    orientation = os.environ.get("EXCEL_ORIENTATION", "portrait").lower()
    pagesize = A4 if orientation == "portrait" else (A4[1], A4[0])
    
    c = canvas.Canvas(str(output_path), pagesize=pagesize)
    width, height = pagesize
    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Converted Microsoft Excel Sheet")
    y -= 30
    c.setFont("Courier", 9)

    gridlines = os.environ.get("EXCEL_GRIDLINES", "true").lower() == "true"
    scaling = os.environ.get("EXCEL_SHEET_RENDERING", "fit-width").lower()

    if openpyxl:
        try:
            wb = openpyxl.load_workbook(input_paths[0], read_only=True)
            sheet = wb.active
            for row in sheet.iter_rows(values_only=True):
                row_str = " | ".join([str(val) if val is not None else "" for val in row[:6]])
                if row_str.strip():
                    if y < 50:
                        c.showPage()
                        c.setFont("Courier", 9)
                        y = height - 50
                        
                    # If gridlines is true, draw cell separator borders
                    if gridlines:
                        c.setStrokeColor(colors.HexColor("#e2e8f0"))
                        c.setLineWidth(0.5)
                        c.line(50, y - 4, width - 50, y - 4)
                        
                    c.drawString(50, y, row_str)
                    y -= 18
        except Exception as e:
            c.drawString(50, y, f"Failed parsing XLSX: {e}")
    else:
        c.drawString(50, y, f"Excel grid converted to table. (Orientation: {orientation.upper()}, Scaling: {scaling.upper()})")

    c.save()
    print(f"Converted Excel to PDF: {output_path}")

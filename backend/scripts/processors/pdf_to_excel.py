import os
from .utils import openpyxl, extract_pdf_text

def pdf_to_excel(input_paths, output_path):
    if not input_paths:
        return
    pdf_text = extract_pdf_text(input_paths[0])
    data_mode = os.environ.get("PDF_TO_EXCEL_DATA", "all-tables").upper()
    sep = "," if os.environ.get("PDF_TO_EXCEL_SEPARATOR", "period").lower() == "comma" else "."
    detect = os.environ.get("PDF_TO_EXCEL_DETECT_NUM", "true").lower() == "true"
    
    if openpyxl:
        wb = openpyxl.Workbook()
        sheet = wb.active
        sheet.title = "PDF Table"
        sheet.cell(row=1, column=1, value=f"Mode: {data_mode} | Separator: '{sep}' | Detect Numeric: {detect}")
        
        for r_idx, line in enumerate(pdf_text.split("\n")):
            cells = line.split("  ")
            for c_idx, cell in enumerate(cells):
                val = cell.strip()
                if val:
                    if detect:
                        try:
                            val = float(val.replace(sep, ".").replace(",", ""))
                        except ValueError:
                            pass
                    sheet.cell(row=r_idx + 2, column=c_idx + 1, value=val)
        wb.save(output_path)
    else:
        lines = [f"Mode: {data_mode} | Separator: '{sep}' | Detect: {detect}"]
        for line in pdf_text.split("\n"):
            lines.append(",".join(line.split()))
        output_path.write_text("\n".join(lines))
    print(f"Converted PDF to Excel sheet: {output_path}")

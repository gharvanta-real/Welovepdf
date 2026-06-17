import os
from .utils import pikepdf, canvas, colors, letter, apply_pdf_overlay

def merge_pdf(input_paths, output_path):
    if not pikepdf or not canvas:
        raise ImportError("pikepdf and reportlab are required for merge operations")
        
    include_toc = os.environ.get("INCLUDE_TOC", "false").lower() == "true"
    filename_stamps = os.environ.get("FILENAME_STAMPS", "false").lower() == "true"
    
    merged_pdf = pikepdf.new()
    
    # Generate Table of Contents first page if enabled
    if include_toc:
        toc_temp = output_path.parent / "temp_toc.pdf"
        c = canvas.Canvas(str(toc_temp), pagesize=letter)
        width, height = letter
        c.setFont("Helvetica-Bold", 22)
        c.setFillColor(colors.HexColor("#0074f0"))
        c.drawString(50, height - 60, "Table of Contents")
        
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#64748b"))
        c.drawString(50, height - 80, "Merged Document Index - Created via WeLovePDF")
        
        c.setStrokeColor(colors.HexColor("#cbd5e1"))
        c.setLineWidth(1)
        c.line(50, height - 90, width - 50, height - 90)
        
        y = height - 130
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.HexColor("#1e293b"))
        
        running_page = 2  # TOC is page 1
        for path in input_paths:
            file_name = path.name
            with pikepdf.open(path) as temp_pdf:
                p_count = len(temp_pdf.pages)
            
            c.drawString(50, y, f"•  {file_name}")
            c.drawRightString(width - 50, y, f"Page {running_page}")
            y -= 30
            running_page += p_count
            
            if y < 60:
                c.showPage()
                y = height - 60
                
        c.save()
        with pikepdf.open(toc_temp) as toc_pdf:
            merged_pdf.pages.append(toc_pdf.pages[0])
        try:
            os.remove(toc_temp)
        except OSError:
            pass
            
    # Append source PDFs and optionally stamp names
    for path in input_paths:
        if filename_stamps:
            stamp_temp = output_path.parent / "temp_stamp.pdf"
            with pikepdf.open(path) as temp_pdf:
                num_p = len(temp_pdf.pages)
            
            c = canvas.Canvas(str(stamp_temp), pagesize=letter)
            width, height = letter
            for _ in range(num_p):
                c.saveState()
                c.setFont("Helvetica-Oblique", 8)
                c.setFillColor(colors.HexColor("#64748b"))
                c.drawRightString(width - 50, height - 20, f"Source: {path.name}")
                c.restoreState()
                c.showPage()
            c.save()
            
            stamped_path = output_path.parent / f"stamped_{path.name}"
            apply_pdf_overlay(path, stamp_temp, stamped_path)
            
            with pikepdf.open(stamped_path) as stamped_pdf:
                for page in stamped_pdf.pages:
                    merged_pdf.pages.append(page)
                    
            try:
                os.remove(stamp_temp)
                os.remove(stamped_path)
            except OSError:
                pass
        else:
            with pikepdf.open(path) as src_pdf:
                for page in src_pdf.pages:
                    merged_pdf.pages.append(page)
                    
    merged_pdf.save(output_path)
    print(f"Merged {len(input_paths)} files successfully: {output_path}")

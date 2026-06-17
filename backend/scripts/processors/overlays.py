import os
from .utils import pikepdf, canvas, colors, letter, apply_pdf_overlay
from .visual_editor import process_visual_editor

def create_overlay_pdf(output_path, num_pages, overlay_type, text=""):
    """Create a temporary PDF overlaying page numbers, watermark, signatures, or Bates stamps."""
    if not canvas:
        raise ImportError("reportlab is required for creating overlays")
        
    c = canvas.Canvas(str(output_path), pagesize=letter)
    width, height = letter

    for page_num in range(1, num_pages + 1):
        if overlay_type == "watermark":
            wm_text = os.environ.get("WATERMARK_TEXT", text or "CONFIDENTIAL")
            wm_color = os.environ.get("WATERMARK_COLOR", "#e2e8f0")
            try:
                wm_opacity = float(os.environ.get("WATERMARK_OPACITY", "0.2"))
            except ValueError:
                wm_opacity = 0.2
            
            c.saveState()
            c.setFont("Helvetica-Bold", 60)
            try:
                col = colors.HexColor(wm_color)
            except Exception:
                col = colors.HexColor("#e2e8f0")
            c.setFillColor(col, alpha=wm_opacity)
            c.translate(width / 2, height / 2)
            c.rotate(45)
            c.drawCentredString(0, 0, wm_text)
            c.restoreState()

        elif overlay_type == "numbers":
            pos = os.environ.get("PAGE_NUMBER_POS", "bottom-center").lower()
            try:
                size = int(os.environ.get("PAGE_NUMBER_SIZE", "10"))
            except ValueError:
                size = 10

            c.saveState()
            c.setFont("Helvetica", size)
            c.setFillColor(colors.HexColor("#475569"))
            
            label = f"Page {page_num} of {num_pages}"
            
            if "top" in pos:
                y_pos = height - 30
            else:
                y_pos = 30
                
            if "left" in pos:
                c.drawString(50, y_pos, label)
            elif "right" in pos:
                c.drawRightString(width - 50, y_pos, label)
            else: # center
                c.drawCentredString(width / 2, y_pos, label)
            c.restoreState()

        elif overlay_type == "bates":
            prefix = os.environ.get("BATES_PREFIX", "BATES-").strip()
            try:
                start = int(os.environ.get("BATES_START", "1"))
            except ValueError:
                start = 1
            stamp_num = start + page_num - 1

            c.saveState()
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(colors.HexColor("#ef4444"))
            c.drawRightString(width - 50, height - 30, f"{prefix}{stamp_num:06d}")
            c.restoreState()

        elif overlay_type == "sign":
            sign_text = os.environ.get("SIGNATURE_TEXT", text or "John Doe")
            sign_style = os.environ.get("SIGNATURE_STYLE", "cursive").lower()
            
            # Draw a signature block at bottom right of first page only
            if page_num == 1:
                c.saveState()
                c.setStrokeColor(colors.HexColor("#0074f0"))
                c.setLineWidth(1.5)
                c.rect(width - 220, 50, 170, 60)
                
                font_name = "Courier-BoldOblique"
                if sign_style == "serif":
                    font_name = "Times-BoldItalic"
                elif sign_style == "sans":
                    font_name = "Helvetica-BoldOblique"
                
                c.setFont(font_name, 14)
                c.setFillColor(colors.HexColor("#0074f0"))
                c.drawString(width - 200, 85, sign_text)
                
                c.setFont("Helvetica", 8)
                c.setFillColor(colors.HexColor("#64748b"))
                c.drawString(width - 200, 65, "Verified via WeLovePDF")
                c.restoreState()

        elif overlay_type == "edit":
            c.saveState()
            c.setFont("Helvetica-Bold", 10)
            c.setFillColor(colors.HexColor("#0074f0"))
            c.drawString(50, height - 30, "EDITED WITH WELOVEPDF")
            c.restoreState()

        elif overlay_type == "annotate":
            tool = os.environ.get("ANNOTATE_TOOL", "highlight").lower()
            color_hex = os.environ.get("ANNOTATE_COLOR", "#fef08a")
            text = os.environ.get("ANNOTATE_TEXT", "Reviewed and approved")
            opacity_str = os.environ.get("ANNOTATE_OPACITY", "0.5")
            thickness_str = os.environ.get("ANNOTATE_THICKNESS", "2")

            try:
                opacity = float(opacity_str)
            except ValueError:
                opacity = 0.5

            try:
                thickness = float(thickness_str)
            except ValueError:
                thickness = 2.0

            try:
                col = colors.HexColor(color_hex)
            except Exception:
                col = colors.HexColor("#fef08a")

            c.saveState()

            if tool == "highlight":
                # Highlight a rectangular strip at the top-mid section of the page
                c.setFillColor(col, alpha=opacity)
                c.rect(50, height - 120, width - 100, 24, fill=True, stroke=False)
                
                # Draw small comment badge
                c.setFont("Helvetica-Bold", 8)
                c.setFillColor(colors.HexColor("#334155"))
                c.drawString(50, height - 90, f"Comment: {text}")
                
            elif tool == "pen":
                # Draw freehand drawing mock overlay (a signature/scribble style squiggly line at bottom-left)
                c.setStrokeColor(col)
                c.setLineWidth(thickness)
                
                # Draw squiggly line path
                p = c.beginPath()
                p.moveTo(100, 100)
                p.curveTo(120, 120, 140, 80, 160, 110)
                p.curveTo(180, 130, 200, 90, 220, 100)
                c.drawPath(p, fill=False, stroke=True)
                
                # Comment
                c.setFont("Helvetica-Bold", 8)
                c.setFillColor(colors.HexColor("#334155"))
                c.drawString(100, 75, f"Pen Note: {text}")
                
            else: # Text Comment
                # Draw a comment box card in the top-right corner
                c.setStrokeColor(colors.HexColor("#cbd5e1"))
                c.setFillColor(colors.HexColor("#f8fafc"))
                c.setLineWidth(1)
                c.roundRect(width - 220, height - 150, 170, 80, 4, fill=True, stroke=True)
                
                # Header of comment card
                c.setFillColor(col)
                c.roundRect(width - 220, height - 90, 170, 20, 4, fill=True, stroke=False)
                # Text comment label
                c.setFont("Helvetica-Bold", 8)
                c.setFillColor(colors.HexColor("#ffffff"))
                c.drawString(width - 210, height - 82, "REVIEWER COMMENT")
                
                # Content
                c.setFont("Helvetica", 9)
                c.setFillColor(colors.HexColor("#1e293b"))
                
                # Text wrapping
                words = text.split()
                lines = []
                curr_line = []
                for word in words:
                    curr_line.append(word)
                    if len(" ".join(curr_line)) > 24:
                        curr_line.pop()
                        lines.append(" ".join(curr_line))
                        curr_line = [word]
                lines.append(" ".join(curr_line))
                
                y_text = height - 105
                for line in lines[:3]: # show up to 3 lines
                    c.drawString(width - 210, y_text, line)
                    y_text -= 12
            
            c.restoreState()

        c.showPage()
    c.save()


def run_overlay_operation(tool_id, input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for overlay operations")
    if not input_paths:
        return

    # Check if we should use the custom visual editor pipeline
    if "EDITOR_OVERLAYS" in os.environ or "PAGE_ORDER" in os.environ or "REMOVE_PAGES" in os.environ or "ROTATE_PAGES" in os.environ:
        process_visual_editor(input_paths[0], output_path)
    else:
        # Fallback to existing mock overlays
        overlay_type = "watermark"
        text = "CONFIDENTIAL"
        if tool_id == "page-numbers":
            overlay_type = "numbers"
        elif tool_id == "bates-numbering":
            overlay_type = "bates"
        elif tool_id in ["sign-pdf", "esign-pdf"]:
            overlay_type = "sign"
            text = "John Doe"
        elif tool_id == "edit-pdf":
            overlay_type = "edit"
        elif tool_id == "pdf-annotator":
            overlay_type = "annotate"

        # Find page count
        with pikepdf.open(input_paths[0]) as pdf:
            num_pages = len(pdf.pages)

        # Generate overlay PDF
        temp_overlay = output_path.parent / "temp_overlay.pdf"
        create_overlay_pdf(temp_overlay, num_pages, overlay_type, text)

        # Apply overlay
        apply_pdf_overlay(input_paths[0], temp_overlay, output_path)

        # Cleanup overlay file
        try:
            os.remove(temp_overlay)
        except OSError:
            pass
        print(f"Applied {overlay_type} overlay successfully to: {output_path}")

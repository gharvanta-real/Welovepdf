import os
import json
import shutil
import math
from pathlib import Path
from .utils import pikepdf, canvas, colors, get_reportlab_font_name, apply_pdf_overlay

def process_visual_editor(input_path, output_path):
    if not pikepdf or not canvas:
        raise ImportError("pikepdf and reportlab are required for visual editor operations")

    # Get options from environment variables
    editor_overlays_str = os.environ.get("EDITOR_OVERLAYS", "").strip()
    page_order_str = os.environ.get("PAGE_ORDER", "").strip()
    remove_pages_str = os.environ.get("REMOVE_PAGES", "").strip()
    rotate_pages_str = os.environ.get("ROTATE_PAGES", "").strip()
    
    # Page setup options
    page_size_str = os.environ.get("PAGE_SIZE", "Letter").strip()
    page_orientation_str = os.environ.get("PAGE_ORIENTATION", "Portrait").strip()
    page_margins_str = os.environ.get("PAGE_MARGINS", "None").strip()

    # Calculate target dimensions
    target_w, target_h = 612.0, 792.0
    if page_size_str.upper() == "A4":
        target_w, target_h = 595.27, 841.89
    elif page_size_str.upper() == "LEGAL":
        target_w, target_h = 612.0, 1008.0

    if page_orientation_str.lower() == "landscape":
        target_w, target_h = target_h, target_w

    # Calculate margin in points
    margin = 0.0
    if page_margins_str.lower() == "narrow":
        margin = 36.0  # 0.5 inch
    elif page_margins_str.lower() == "normal":
        margin = 72.0  # 1.0 inch
    elif page_margins_str.lower() == "wide":
        margin = 144.0 # 2.0 inches

    # 1. Open original PDF
    with pikepdf.open(input_path) as pdf:
        modified_pdf = pikepdf.new()
        num_pages = len(pdf.pages)
        pages = list(range(num_pages))
        
        # Apply PAGE_ORDER if present
        if page_order_str:
            try:
                pages = [int(p.strip()) - 1 for p in page_order_str.split(",") if p.strip()]
            except Exception as e:
                print(f"Error parsing PAGE_ORDER: {e}")
                
        # Apply REMOVE_PAGES if present
        if remove_pages_str:
            try:
                to_remove = set(int(p.strip()) - 1 for p in remove_pages_str.split(",") if p.strip())
                pages = [p for p in pages if p not in to_remove]
            except Exception as e:
                print(f"Error parsing REMOVE_PAGES: {e}")
                
        # Append pages to new document and scale/layout them
        for idx in pages:
            if 0 <= idx < num_pages:
                orig_page = pdf.pages[idx]
                
                # Check if we should change layout / scale
                has_layout_change = (page_size_str != "Letter" or page_orientation_str != "Portrait" or page_margins_str != "None")
                
                if has_layout_change:
                    box = orig_page.MediaBox
                    orig_w = float(box[2] - box[0])
                    orig_h = float(box[3] - box[1])
                    
                    printable_w = target_w - 2 * margin
                    printable_h = target_h - 2 * margin
                    
                    scale = min(printable_w / orig_w, printable_h / orig_h)
                    scaled_w = orig_w * scale
                    scaled_h = orig_h * scale
                    tx = margin + (printable_w - scaled_w) / 2.0
                    ty = margin + (printable_h - scaled_h) / 2.0
                    
                    transform_cmd = f"q {scale:.6f} 0 0 {scale:.6f} {tx:.6f} {ty:.6f} cm\n".encode('utf-8')
                    restore_cmd = b"\nQ\n"
                    
                    if '/Contents' in orig_page:
                        contents = orig_page.Contents
                        if isinstance(contents, pikepdf.Array):
                            tf_stream = pdf.make_stream(transform_cmd)
                            res_stream = pdf.make_stream(restore_cmd)
                            orig_page.Contents.insert(0, tf_stream)
                            orig_page.Contents.append(res_stream)
                        else:
                            original_data = contents.read_bytes()
                            new_data = transform_cmd + original_data + restore_cmd
                            new_stream = pdf.make_stream(new_data)
                            orig_page.Contents = new_stream
                            
                    orig_page.MediaBox = [0, 0, target_w, target_h]
                    if '/CropBox' in orig_page:
                        orig_page.CropBox = [0, 0, target_w, target_h]
                
                modified_pdf.pages.append(orig_page)
                
        # Check if we ended up with no pages
        if len(modified_pdf.pages) == 0:
            modified_pdf = pikepdf.open(input_path)
            
        # 2. Apply ROTATE_PAGES
        if rotate_pages_str:
            try:
                if ":" in rotate_pages_str:
                    parts = rotate_pages_str.split(",")
                    for part in parts:
                        if ":" in part:
                            p_str, a_str = part.split(":", 1)
                            p_idx = int(p_str.strip()) - 1
                            angle = int(a_str.strip())
                            if 0 <= p_idx < len(modified_pdf.pages):
                                page = modified_pdf.pages[p_idx]
                                try:
                                    current_rot = int(page.Rotate)
                                except (AttributeError, ValueError):
                                    current_rot = 0
                                page.Rotate = (current_rot + angle) % 360
                else:
                    pages_to_rotate = [int(p.strip()) - 1 for p in rotate_pages_str.split(",") if p.strip()]
                    for p_idx in pages_to_rotate:
                        if 0 <= p_idx < len(modified_pdf.pages):
                            page = modified_pdf.pages[p_idx]
                            try:
                                current_rot = int(page.Rotate)
                            except (AttributeError, ValueError):
                                current_rot = 0
                            page.Rotate = (current_rot + 90) % 360
            except Exception as e:
                print(f"Error parsing ROTATE_PAGES: {e}")
                
        temp_preprocessed = output_path.parent / "temp_preprocessed.pdf"
        modified_pdf.save(temp_preprocessed)
        
    # 3. Apply EDITOR_OVERLAYS if present
    if editor_overlays_str:
        try:
            elements = json.loads(editor_overlays_str)
        except Exception as e:
            print(f"Error parsing EDITOR_OVERLAYS: {e}")
            elements = []
            
        if elements:
            temp_overlay = output_path.parent / "temp_overlay.pdf"
            c = canvas.Canvas(str(temp_overlay))
            
            with pikepdf.open(temp_preprocessed) as pdf:
                for page_num in range(1, len(pdf.pages) + 1):
                    # Get size of preprocessed page to draw overlay
                    box = pdf.pages[page_num - 1].MediaBox
                    w = float(box[2] - box[0])
                    h = float(box[3] - box[1])
                    c.setPageSize((w, h))
                    
                    # Find all elements for this page
                    page_elements = [el for el in elements if el.get("page") == page_num]
                    for el in page_elements:
                        el_type = el.get("type")
                        
                        if el_type == "text":
                            c.saveState()
                            font_name = get_reportlab_font_name(el.get("fontFamily"), el.get("isBold"), el.get("isItalic"))
                            c.setFont(font_name, el.get("fontSize", 12))
                            c.setFillColor(colors.HexColor(el.get("color", "#000000")))
                            
                            text_x = (el["x"] / 100.0) * w
                            text_y = h - (el["y"] / 100.0) * h - (el.get("fontSize", 12) * 0.8)
                            
                            align = el.get("align", "left")
                            content = el.get("content", "")
                            
                            if el.get("isUnderline"):
                                text_width = c.stringWidth(content, font_name, el.get("fontSize", 12))
                                c.setStrokeColor(colors.HexColor(el.get("color", "#000000")))
                                c.setLineWidth(1)
                                if align == "center":
                                    c.line(text_x - text_width/2.0, text_y - 2, text_x + text_width/2.0, text_y - 2)
                                elif align == "right":
                                    c.line(text_x - text_width, text_y - 2, text_x, text_y - 2)
                                else:
                                    c.line(text_x, text_y - 2, text_x + text_width, text_y - 2)
                                    
                            if align == "center":
                                c.drawCentredString(text_x, text_y, content)
                            elif align == "right":
                                c.drawRightString(text_x, text_y, content)
                            else:
                                c.drawString(text_x, text_y, content)
                                
                            c.restoreState()
                            
                        elif el_type == "drawing":
                            if el.get("points") and len(el["points"]) >= 2:
                                c.saveState()
                                c.setStrokeColor(colors.HexColor(el.get("color", "#000000")))
                                c.setLineWidth(el.get("thickness", 2))
                                c.setLineCap(1) # Round
                                c.setLineJoin(1) # Round
                                
                                p = c.beginPath()
                                first_pt = el["points"][0]
                                p.moveTo((first_pt["x"] / 100.0) * w, h - (first_pt["y"] / 100.0) * h)
                                
                                for pt in el["points"][1:]:
                                    p.lineTo((pt["x"] / 100.0) * w, h - (pt["y"] / 100.0) * h)
                                    
                                c.drawPath(p, fill=False, stroke=True)
                                c.restoreState()
                                
                        elif el_type == "highlight":
                            c.saveState()
                            rect_x = (el["x"] / 100.0) * w
                            rect_w = (el.get("width", 30) / 100.0) * w
                            rect_h = (el.get("height", 4) / 100.0) * h
                            rect_y = h - ((el["y"] + el.get("height", 4)) / 100.0) * h
                            
                            c.setFillColor(colors.HexColor(el.get("color", "#fef08a")), alpha=el.get("opacity", 0.4))
                            c.rect(rect_x, rect_y, rect_w, rect_h, fill=True, stroke=False)
                            c.restoreState()
                            
                        elif el_type == "shape":
                            c.saveState()
                            rect_x = (el["x"] / 100.0) * w
                            rect_w = (el.get("width", 15) / 100.0) * w
                            rect_h = (el.get("height", 10) / 100.0) * h
                            rect_y = h - ((el["y"] + el.get("height", 10)) / 100.0) * h
                            
                            c.setStrokeColor(colors.HexColor(el.get("color", "#000000")))
                            c.setLineWidth(el.get("thickness", 2))
                            
                            shape_type = el.get("shapeType", "rectangle")
                            if shape_type == "rectangle":
                                c.rect(rect_x, rect_y, rect_w, rect_h, fill=False, stroke=True)
                            elif shape_type == "circle":
                                c.ellipse(rect_x, rect_y, rect_x + rect_w, rect_y + rect_h, fill=False, stroke=True)
                            elif shape_type == "line":
                                c.line(rect_x, rect_y + rect_h, rect_x + rect_w, rect_y)
                            elif shape_type == "arrow":
                                x1, y1 = rect_x, rect_y + rect_h
                                x2, y2 = rect_x + rect_w, rect_y
                                c.line(x1, y1, x2, y2)
                                angle = math.atan2(y2 - y1, x2 - x1)
                                arrow_len = 10
                                x_arrow1 = x2 - arrow_len * math.cos(angle - math.pi / 6)
                                y_arrow1 = y2 - arrow_len * math.sin(angle - math.pi / 6)
                                x_arrow2 = x2 - arrow_len * math.cos(angle + math.pi / 6)
                                y_arrow2 = y2 - arrow_len * math.sin(angle + math.pi / 6)
                                c.line(x2, y2, x_arrow1, y_arrow1)
                                c.line(x2, y2, x_arrow2, y_arrow2)
                            c.restoreState()
                            
                        elif el_type == "redact":
                            c.saveState()
                            rect_x = (el["x"] / 100.0) * w
                            rect_w = (el.get("width", 25) / 100.0) * w
                            rect_h = (el.get("height", 6) / 100.0) * h
                            rect_y = h - ((el["y"] + el.get("height", 6)) / 100.0) * h
                            
                            c.setFillColor(colors.HexColor(el.get("color", "#0f172a")))
                            c.rect(rect_x, rect_y, rect_w, rect_h, fill=True, stroke=False)
                            
                            redact_txt = el.get("redactText", "REDACTED")
                            if redact_txt:
                                c.setFillColor(colors.HexColor("#ffffff"))
                                c.setFont("Helvetica-Bold", max(6, int(rect_h * 0.6)))
                                c.drawCentredString(rect_x + rect_w / 2.0, rect_y + rect_h / 2.0 - (rect_h * 0.2), redact_txt)
                            c.restoreState()
                            
                        elif el_type in ["signature", "image"]:
                            if el.get("dataUrl") and "base64," in el["dataUrl"]:
                                try:
                                    import base64
                                    import tempfile
                                    
                                    header, base64_data = el["dataUrl"].split("base64,", 1)
                                    img_data = base64.b64decode(base64_data)
                                    
                                    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_img:
                                        temp_img.write(img_data)
                                        temp_img_path = temp_img.name
                                        
                                    rect_x = (el["x"] / 100.0) * w
                                    rect_w = (el.get("width", 22) / 100.0) * w
                                    rect_h = (el.get("height", 10) / 100.0) * h
                                    rect_y = h - ((el["y"] + el.get("height", 10)) / 100.0) * h
                                    
                                    c.drawImage(temp_img_path, rect_x, rect_y, width=rect_w, height=rect_h, mask="auto")
                                    
                                    try:
                                        os.remove(temp_img_path)
                                    except OSError:
                                        pass
                                except Exception as img_err:
                                    print(f"Error drawing base64 image: {img_err}")
                                    
                    c.showPage()
            c.save()
            
            # Apply overlay
            apply_pdf_overlay(temp_preprocessed, temp_overlay, output_path)
            
            # Clean up
            try:
                os.remove(temp_preprocessed)
                os.remove(temp_overlay)
            except OSError:
                pass
        else:
            shutil.move(str(temp_preprocessed), str(output_path))
    else:
        shutil.move(str(temp_preprocessed), str(output_path))
    
    print(f"Processed visual editor pipeline successfully to: {output_path}")

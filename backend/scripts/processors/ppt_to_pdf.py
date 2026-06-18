import os
from pathlib import Path
from .utils import canvas, colors, pptx

# Slide dimensions for 16:9 and 4:3
SLIDE_16x9 = (792, 446)  # in points (11 x 6.19 inches)
SLIDE_4x3  = (720, 540)  # in points (10 x 7.5 inches)


def _hex_to_rgb(hex_color: str):
    """Parse a hex color string (with or without #) into (r, g, b) 0-1 floats."""
    h = hex_color.lstrip("#")
    if len(h) == 6:
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        return r / 255, g / 255, b / 255
    return 0, 0, 0


def ppt_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for ppt-to-pdf operations")
    if not input_paths:
        return

    ppt_orientation = os.environ.get("PPT_ORIENTATION", "landscape").lower()
    layout = os.environ.get("PPT_SLIDES_LAYOUT", "1-slide").lower()
    notes_enabled = os.environ.get("PPT_NOTES", "false").lower() == "true"

    # Choose page size
    if ppt_orientation == "portrait":
        pagesize = (595, 842)
        content_w, content_h = 515, 752
        offset_x, offset_y = 40, 40
    else:
        pagesize = SLIDE_16x9
        content_w, content_h = pagesize[0] - 60, pagesize[1] - 60
        offset_x, offset_y = 30, 30

    c = canvas.Canvas(str(output_path), pagesize=pagesize)
    width, height = pagesize

    # Color palette for slide backgrounds (cycles)
    bg_colors = [
        "#1e2d3d", "#2c3e50", "#1a1a2e", "#16213e", "#0f3460",
        "#1b4332", "#283618", "#3d405b", "#2d3561",
    ]
    text_colors_for_bg = ["#ffffff"] * len(bg_colors)

    accent_colors = [
        "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
        "#1abc9c", "#e67e22", "#34495e",
    ]

    if pptx:
        try:
            prs = pptx.Presentation(input_paths[0])
            for slide_idx, slide in enumerate(prs.slides):
                bg_hex = bg_colors[slide_idx % len(bg_colors)]
                accent_hex = accent_colors[slide_idx % len(accent_colors)]
                text_hex = "#ffffff"

                # --- Draw slide background ---
                bg_r, bg_g, bg_b = _hex_to_rgb(bg_hex)
                c.setFillColorRGB(bg_r, bg_g, bg_b)
                c.rect(0, 0, width, height, fill=1, stroke=0)

                # Decorative accent bar at top
                ac_r, ac_g, ac_b = _hex_to_rgb(accent_hex)
                c.setFillColorRGB(ac_r, ac_g, ac_b)
                c.rect(0, height - 6, width, 6, fill=1, stroke=0)

                # Subtle bottom bar
                c.setFillColorRGB(1, 1, 1)
                c.setFillAlpha(0.05)
                c.rect(0, 0, width, 30, fill=1, stroke=0)
                c.setFillAlpha(1.0)

                # Slide number
                c.setFillColorRGB(1, 1, 1)
                c.setFillAlpha(0.4)
                c.setFont("Helvetica", 8)
                c.drawRightString(width - 10, 10, f"{slide_idx + 1}")
                c.setFillAlpha(1.0)

                # --- Render shapes ---
                y_cursor = height - 40
                title_drawn = False

                for shape_idx, shape in enumerate(slide.shapes):
                    if not hasattr(shape, "text") or not shape.text.strip():
                        continue

                    shape_text = shape.text.strip()
                    shape_name = (shape.name or "").lower()

                    # Determine if this is a title shape
                    is_title = (
                        not title_drawn
                        and (
                            "title" in shape_name
                            or shape_idx == 0
                            or (hasattr(shape, "placeholder_format") and shape.placeholder_format and shape.placeholder_format.idx == 0)
                        )
                    )

                    if is_title or (not title_drawn and slide_idx == 0):
                        # Draw as title
                        c.setFillColorRGB(1, 1, 1)
                        c.setFont("Helvetica-Bold", 28 if ppt_orientation != "portrait" else 22)
                        # Truncate if too long
                        max_chars = int(width / 12)
                        disp = shape_text[:max_chars] + ("..." if len(shape_text) > max_chars else "")
                        c.drawString(offset_x, height - 55, disp)
                        # Underline title with accent color
                        c.setStrokeColorRGB(ac_r, ac_g, ac_b)
                        c.setLineWidth(2)
                        c.line(offset_x, height - 60, offset_x + min(len(disp) * 11, width - 80), height - 60)
                        y_cursor = height - 90
                        title_drawn = True
                    else:
                        # Body text — render each line
                        c.setFillColorRGB(1, 1, 1)
                        for line in shape_text.split("\n"):
                            line = line.strip()
                            if not line:
                                y_cursor -= 8
                                continue
                            if y_cursor < offset_y + 30:
                                break
                            # Bullet point
                            is_bullet = line.startswith(("•", "-", "*", "–"))
                            indent = 0
                            if not is_bullet and y_cursor < height - 100:
                                c.setFillColorRGB(ac_r, ac_g, ac_b)
                                c.setFont("Helvetica-Bold", 9)
                                c.drawString(offset_x, y_cursor, "•")
                                c.setFillColorRGB(1, 1, 1)
                                indent = 14

                            c.setFont("Helvetica", 12)
                            # Wrap long lines
                            max_line_chars = int((content_w - indent) / 6.5)
                            words = line.split()
                            current_line = ""
                            for word in words:
                                test = (current_line + " " + word).strip()
                                if len(test) > max_line_chars and current_line:
                                    c.drawString(offset_x + indent, y_cursor, current_line)
                                    y_cursor -= 16
                                    current_line = word
                                    if y_cursor < offset_y + 30:
                                        break
                                else:
                                    current_line = test
                            if current_line and y_cursor >= offset_y + 30:
                                c.drawString(offset_x + indent, y_cursor, current_line)
                                y_cursor -= 16

                        y_cursor -= 8

                # Notes (if enabled)
                if notes_enabled and slide.has_notes_slide:
                    notes_text = slide.notes_slide.notes_text_frame.text.strip()
                    if notes_text:
                        c.setFillColorRGB(1, 1, 1)
                        c.setFillAlpha(0.5)
                        c.setFont("Helvetica-Oblique", 8)
                        c.drawString(offset_x, offset_y, f"Notes: {notes_text[:120]}")
                        c.setFillAlpha(1.0)

                c.showPage()

        except Exception as e:
            c.setFillColorRGB(0.1, 0.1, 0.1)
            c.rect(0, 0, width, height, fill=1, stroke=0)
            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 14)
            c.drawString(offset_x, height - 60, f"PPTX Parse Error: {e}")
            c.showPage()
    else:
        # Fallback: single demo slide
        c.setFillColorRGB(0.12, 0.18, 0.24)
        c.rect(0, 0, width, height, fill=1, stroke=0)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(offset_x, height - 60, "Slide Presentation")
        c.setFont("Helvetica", 12)
        c.drawString(offset_x, height - 90, f"(python-pptx not installed — Layout: {layout.upper()})")
        c.showPage()

    c.save()
    print(f"Converted PPTX to PDF successfully: {output_path}")

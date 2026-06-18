import re
import html
from pathlib import Path
from .utils import canvas, letter

# Tag-to-style mapping
_BLOCK_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "section", "article",
               "header", "footer", "main", "li", "dt", "dd", "blockquote", "pre", "code"}
_INLINE_TAGS = {"b", "strong", "i", "em", "u", "span", "a", "small", "mark"}
_SKIP_TAGS   = {"script", "style", "head", "noscript", "svg", "iframe", "nav", "meta", "link"}

_HEADING_STYLES = {
    "h1": ("Helvetica-Bold", 22),
    "h2": ("Helvetica-Bold", 18),
    "h3": ("Helvetica-Bold", 15),
    "h4": ("Helvetica-Bold", 13),
    "h5": ("Helvetica-Bold", 11),
    "h6": ("Helvetica-BoldOblique", 11),
}


def _strip_and_collect(html_content: str):
    """
    Walk through HTML and yield (text, font_name, font_size, is_new_block, indent) tuples.
    Does NOT use any external HTML parsing library.
    """
    from html.parser import HTMLParser

    segments = []  # list of (text, font, size, new_block, indent)

    class _Parser(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self._stack = []     # tag stack
            self._skip = 0       # skip depth for script/style etc.
            self._bold = 0
            self._italic = 0
            self._list_depth = 0
            self._in_pre = False

        def _current_font(self):
            base = "Helvetica"
            if self._bold and self._italic:
                return base + "-BoldOblique"
            elif self._bold:
                return base + "-Bold"
            elif self._italic:
                return base + "-Oblique"
            return base

        def handle_starttag(self, tag, attrs):
            tag = tag.lower()
            if tag in _SKIP_TAGS:
                self._skip += 1
                return
            if self._skip:
                return

            self._stack.append(tag)

            if tag in ("b", "strong"):
                self._bold += 1
            elif tag in ("i", "em"):
                self._italic += 1
            elif tag == "pre":
                self._in_pre = True
            elif tag in ("ul", "ol"):
                self._list_depth += 1
            elif tag == "li":
                # Add bullet prefix as a block
                bullet = "  " * (self._list_depth - 1) + "•  "
                segments.append((bullet, "Helvetica-Bold", 10, True, self._list_depth * 12))
            elif tag in _HEADING_STYLES:
                segments.append(("", "", 0, True, 0))  # new block separator
            elif tag in ("p", "div", "section", "article", "blockquote", "header", "footer"):
                segments.append(("", "", 0, True, 0))
            elif tag == "br":
                segments.append(("\n", self._current_font(), 10, False, 0))
            elif tag == "hr":
                segments.append(("---", "Helvetica", 10, True, 0))

        def handle_endtag(self, tag):
            tag = tag.lower()
            if tag in _SKIP_TAGS:
                self._skip = max(0, self._skip - 1)
                return
            if self._skip:
                return

            if self._stack and self._stack[-1] == tag:
                self._stack.pop()

            if tag in ("b", "strong"):
                self._bold = max(0, self._bold - 1)
            elif tag in ("i", "em"):
                self._italic = max(0, self._italic - 1)
            elif tag == "pre":
                self._in_pre = False
            elif tag in ("ul", "ol"):
                self._list_depth = max(0, self._list_depth - 1)
            elif tag in _HEADING_STYLES or tag in _BLOCK_TAGS:
                segments.append(("", "", 0, True, 0))  # block end

        def handle_data(self, data):
            if self._skip:
                return
            if not data.strip() and not self._in_pre:
                return

            # Determine font and size
            # Check if we are inside a heading
            font, size = self._current_font(), 10
            for tag in reversed(self._stack):
                if tag in _HEADING_STYLES:
                    font, size = _HEADING_STYLES[tag]
                    break
                if tag == "pre":
                    font, size = "Courier", 9
                    break
                if tag == "code":
                    font, size = "Courier", 9
                    break
                if tag == "small":
                    size = 8

            indent = 0
            # Check if inside a list
            list_depth = self._list_depth
            if list_depth > 0:
                indent = list_depth * 12

            new_block = False
            for tag in reversed(self._stack):
                if tag in _BLOCK_TAGS:
                    new_block = True
                    break

            if self._in_pre:
                # Preserve line breaks in pre blocks
                for line in data.split("\n"):
                    segments.append((line, font, size, True, 0))
            else:
                # Collapse whitespace
                cleaned = re.sub(r"\s+", " ", data).strip()
                if cleaned:
                    segments.append((cleaned, font, size, new_block, indent))

    parser = _Parser()
    try:
        parser.feed(html_content)
    except Exception:
        pass
    return segments


def html_to_pdf(input_paths, output_path):
    if not canvas:
        raise ImportError("reportlab is required for html-to-pdf operations")
    if not input_paths:
        return

    html_content = Path(input_paths[0]).read_text(encoding="utf-8", errors="ignore")

    segments = _strip_and_collect(html_content)

    c = canvas.Canvas(str(output_path), pagesize=letter)
    page_width, page_height = letter

    left_margin = 54
    right_margin = 54
    top_margin = 54
    bottom_margin = 54
    usable_width = page_width - left_margin - right_margin

    y = page_height - top_margin

    def new_page():
        nonlocal y
        c.showPage()
        y = page_height - top_margin

    def draw_line(text, font_name, font_size, indent=0):
        nonlocal y
        if y < bottom_margin + font_size:
            new_page()
        c.setFont(font_name, font_size)
        c.drawString(left_margin + indent, y, text)
        y -= font_size * 1.4

    def word_wrap_draw(text, font_name, font_size, indent=0):
        nonlocal y
        from reportlab.pdfbase.pdfmetrics import stringWidth
        max_w = usable_width - indent
        words = text.split(" ")
        current_line = ""
        for word in words:
            test = (current_line + " " + word).strip()
            if stringWidth(test, font_name, font_size) > max_w and current_line:
                draw_line(current_line, font_name, font_size, indent)
                current_line = word
            else:
                current_line = test
        if current_line:
            draw_line(current_line, font_name, font_size, indent)

    last_was_block = False
    for text, font_name, font_size, is_block, indent in segments:
        if not font_name or not font_size:
            if is_block and not last_was_block:
                y -= 8  # paragraph spacing
            last_was_block = True
            continue

        last_was_block = False

        if text == "---":
            # Horizontal rule
            if y < bottom_margin + 20:
                new_page()
            c.setLineWidth(0.5)
            c.setStrokeGray(0.7)
            c.line(left_margin, y, page_width - right_margin, y)
            y -= 16
            continue

        if "\n" in text:
            for sub in text.split("\n"):
                if sub.strip():
                    word_wrap_draw(sub, font_name, font_size, indent)
                else:
                    y -= font_size * 0.7
        else:
            word_wrap_draw(text, font_name, font_size, indent)

    c.save()
    print(f"Converted HTML to PDF: {output_path}")

import os
import html as html_mod
from .utils import extract_pdf_text

def pdf_to_html(input_paths, output_path):
    """Convert PDF text to a styled, responsive HTML document."""
    if not input_paths:
        return

    text = extract_pdf_text(input_paths[0])
    mode = os.environ.get("PDF_TO_HTML_MODE", "responsive").lower()
    include_styles = os.environ.get("PDF_TO_HTML_STYLES", "true").lower() == "true"

    lines = text.split("\n")

    # Build HTML paragraphs with basic heuristic heading detection
    body_parts = []
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue

        safe = html_mod.escape(line)

        # Heading heuristic: short line, followed by blank
        is_heading = (
            len(line) < 70
            and not line.endswith((".", ",", ";", ":"))
            and (i + 1 >= len(lines) or not lines[i + 1].strip())
        )
        if is_heading:
            body_parts.append(f'    <h2 class="section-title">{safe}</h2>')
        elif line.startswith(("• ", "- ", "* ", "– ")):
            body_parts.append(f'    <li>{html_mod.escape(line.lstrip("•-*–").strip())}</li>')
        else:
            body_parts.append(f'    <p>{safe}</p>')

        i += 1

    body_html = "\n".join(body_parts)

    css = """
        :root {
          --primary: #1e2d3d;
          --accent: #3498db;
          --surface: #ffffff;
          --bg: #f0f4f8;
          --text: #1a1a2e;
          --muted: #64748b;
          --border: #e2e8f0;
          --radius: 12px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.7;
          color: var(--text);
          background: var(--bg);
          padding: 40px 20px;
        }
        .page-wrap {
          max-width: 860px;
          margin: 0 auto;
        }
        .doc-header {
          background: var(--primary);
          color: #fff;
          border-radius: var(--radius) var(--radius) 0 0;
          padding: 32px 40px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .doc-header-icon {
          width: 48px; height: 48px;
          background: var(--accent);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .doc-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.4px;
          margin: 0 0 4px 0;
        }
        .doc-meta {
          font-size: 0.78rem;
          opacity: 0.65;
          font-family: 'JetBrains Mono', monospace;
        }
        .doc-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 var(--radius) var(--radius);
          padding: 40px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        h2.section-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--primary);
          margin: 28px 0 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--accent);
          letter-spacing: -0.3px;
        }
        h2.section-title:first-child { margin-top: 0; }
        p {
          font-size: 1rem;
          color: var(--text);
          margin-bottom: 12px;
          text-align: justify;
        }
        ul { margin: 8px 0 16px 20px; }
        li {
          font-size: 0.97rem;
          color: var(--text);
          margin-bottom: 6px;
          list-style: disc;
        }
        .doc-footer {
          text-align: center;
          font-size: 0.75rem;
          color: var(--muted);
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .doc-footer a { color: var(--accent); text-decoration: none; }
        @media (max-width: 600px) {
          .doc-card { padding: 24px; }
          .doc-header { padding: 20px 24px; }
          body { padding: 16px 8px; }
        }
    """ if include_styles else ""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Document – WeLovePDF</title>
  <meta name="description" content="PDF document converted to HTML by WeLovePDF">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>{css}</style>
</head>
<body>
  <div class="page-wrap">
    <div class="doc-header">
      <div class="doc-header-icon">📄</div>
      <div>
        <h1>Converted Document</h1>
        <div class="doc-meta">EXPORTED VIA WELOVEPDF · MODE: {mode.upper()}</div>
      </div>
    </div>
    <div class="doc-card">
{body_html}
      <div class="doc-footer">
        Converted by <a href="https://welovepdf.com" target="_blank">WeLovePDF</a> &mdash; Fast, Free PDF Tools
      </div>
    </div>
  </div>
</body>
</html>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Converted PDF to HTML at: {output_path}")

from .utils import extract_pdf_text

def pdf_to_html(input_paths, output_path):
    """Convert PDF text to a styled, responsive HTML document."""
    if not input_paths:
        return
    text = extract_pdf_text(input_paths[0])
    paragraphs = text.split("\n")
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Converted Document - WeLovePDF</title>
    <style>
        body {{
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
            background-color: #f8fafc;
        }}
        .card {{
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }}
        h1 {{
            font-size: 1.8rem;
            color: #0f172a;
            margin-bottom: 24px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 12px;
        }}
        p {{
            margin-bottom: 16px;
            font-size: 1rem;
        }}
    </style>
</head>
<body>
    <div class="card">
        <h1>Converted Document</h1>
        {"".join(f"<p>{p}</p>" for p in paragraphs if p.strip())}
    </div>
</body>
</html>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Converted PDF to HTML at: {output_path}")

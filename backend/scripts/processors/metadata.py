import pikepdf
import os

def edit_metadata(input_paths, output_path):
    """Edit metadata properties of a PDF document using pikepdf."""
    if not input_paths:
        return
    input_pdf = input_paths[0]
    
    # Read environment variables forwarded from frontend options
    title = os.environ.get("METADATA_TITLE", "").strip()
    author = os.environ.get("METADATA_AUTHOR", "").strip()
    subject = os.environ.get("METADATA_SUBJECT", "").strip()
    keywords = os.environ.get("METADATA_KEYWORDS", "").strip()
    
    with pikepdf.open(input_pdf) as pdf:
        # Update Document Info dictionary
        if title:
            pdf.docinfo["/Title"] = title
        if author:
            pdf.docinfo["/Author"] = author
        if subject:
            pdf.docinfo["/Subject"] = subject
        if keywords:
            pdf.docinfo["/Keywords"] = keywords
            
        pdf.save(output_path)
    print(f"Updated metadata successfully on PDF: {output_path}")

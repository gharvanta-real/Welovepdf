import os
import zipfile
from .utils import pikepdf

def split_pdf(input_paths, output_path):
    if not pikepdf:
        raise ImportError("pikepdf is required for split operations")
    if not input_paths:
        print("Error: Split PDF needs at least 1 input file.")
        return
    
    split_mode = os.environ.get("SPLIT_MODE", "extract").lower()
    split_ranges = os.environ.get("SPLIT_RANGES", "all").lower().strip()
    
    with pikepdf.open(input_paths[0]) as pdf:
        temp_files = []
        
        if split_mode == "ranges":
            range_parts = [r.strip() for r in split_ranges.split(",") if r.strip()]
            for idx, r_part in enumerate(range_parts):
                try:
                    if "-" in r_part:
                        start, end = map(int, r_part.split("-"))
                    else:
                        start = end = int(r_part)
                    
                    start_idx = max(0, start - 1)
                    end_idx = min(end, len(pdf.pages))
                    
                    if start_idx < end_idx:
                        new_pdf = pikepdf.new()
                        for p_idx in range(start_idx, end_idx):
                            new_pdf.pages.append(pdf.pages[p_idx])
                        
                        temp_path = output_path.parent / f"range_{start}_{end}.pdf"
                        new_pdf.save(temp_path)
                        temp_files.append(temp_path)
                except Exception as e:
                    print(f"Skipping invalid range part '{r_part}': {e}")
                    
        else:
            if split_ranges == "all":
                for idx, page in enumerate(pdf.pages):
                    single_page_pdf = pikepdf.new()
                    single_page_pdf.pages.append(page)
                    temp_path = output_path.parent / f"page_{idx + 1}.pdf"
                    single_page_pdf.save(temp_path)
                    temp_files.append(temp_path)
            else:
                page_nums = []
                for num in split_ranges.split(","):
                    try:
                        page_nums.append(int(num.strip()))
                    except ValueError:
                        pass
                
                for num in page_nums:
                    idx = num - 1
                    if 0 <= idx < len(pdf.pages):
                        single_page_pdf = pikepdf.new()
                        single_page_pdf.pages.append(pdf.pages[idx])
                        temp_path = output_path.parent / f"page_{num}.pdf"
                        single_page_pdf.save(temp_path)
                        temp_files.append(temp_path)

        if not temp_files:
            single_page_pdf = pikepdf.new()
            single_page_pdf.pages.append(pdf.pages[0])
            temp_path = output_path.parent / "page_1.pdf"
            single_page_pdf.save(temp_path)
            temp_files.append(temp_path)

        with zipfile.ZipFile(output_path, 'w') as zipf:
            for file_path in temp_files:
                zipf.write(file_path, file_path.name)
                try:
                    os.remove(file_path)
                except OSError:
                    pass
    print(f"Successfully split PDF into ZIP: {output_path}")

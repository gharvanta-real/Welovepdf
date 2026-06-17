import os
import sys
import subprocess
from pathlib import Path

# Set up paths
scripts_dir = Path(__file__).parent
pdf_processor = scripts_dir / "pdf_processor.py"
temp_dir = scripts_dir / "temp_test_run"
temp_dir.mkdir(exist_ok=True)

# Minimal valid PDF content
MINIMAL_PDF = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 40 120 Td (WeLovePDF) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<< /Root 1 0 R /Size 5 >>
startxref
298
%%EOF"""

input_pdf = temp_dir / "input.pdf"
input_pdf.write_bytes(MINIMAL_PDF)

input_txt = temp_dir / "input.txt"
input_txt.write_text("Hello World from WeLovePDF text converter!")

def run_tool(tool_id, output_name, *inputs):
    output_path = temp_dir / output_name
    cmd = [sys.executable, str(pdf_processor), tool_id, str(output_path)] + [str(p) for p in inputs]
    print(f"Running: {' '.join(cmd)}")
    
    # We pass some dummy env variables for options
    env = os.environ.copy()
    env["PDF_PASSWORD"] = "testpass"
    env["FLATTEN_MODE"] = "all"
    env["COPILOT_MODE"] = "general"
    
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if res.returncode != 0:
        print(f"ERROR running {tool_id}: {res.stderr}\nStdout: {res.stdout}")
        return False
    
    if not output_path.exists():
        print(f"ERROR: Output file {output_path} was not created.")
        return False
    
    print(f"SUCCESS: {tool_id} output size: {output_path.stat().st_size} bytes")
    return True

def main():
    success = True
    
    # Test txt-to-pdf
    success &= run_tool("txt-to-pdf", "output_txt.pdf", input_txt)
    
    # Test merge-pdf
    success &= run_tool("merge-pdf", "merged.pdf", input_pdf, input_pdf)
    
    # Test split-pdf
    success &= run_tool("split-pdf", "split.zip", input_pdf)
    
    # Test protect-pdf
    success &= run_tool("protect-pdf", "protected.pdf", input_pdf)
    
    # Test unlock-pdf
    protected_pdf = temp_dir / "protected.pdf"
    if protected_pdf.exists():
        success &= run_tool("unlock-pdf", "unlocked.pdf", protected_pdf)
        
    # Test repair-pdf
    success &= run_tool("repair-pdf", "repaired.pdf", input_pdf)
    
    # Test AI copilot
    success &= run_tool("ai-copilot", "copilot_report.pdf", input_pdf)
    
    # Clean up files
    for p in temp_dir.iterdir():
        try:
            p.unlink()
        except OSError:
            pass
    temp_dir.rmdir()
    
    if success:
        print("\nALL PROCESSORS PASSED SMOKE TESTS SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\nSOME PROCESSORS FAILED SMOKE TESTS!")
        sys.exit(1)

if __name__ == "__main__":
    main()

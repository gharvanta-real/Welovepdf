use pdf_engine::{
    operations::{run_compress::run_compress_job, run_merge::run_merge_job},
    EngineConfig,
};
use std::{fs, path::Path};

#[test]
fn compress_job_rejects_missing_input() {
    let config = EngineConfig::default();
    let result = run_compress_job(&config, Path::new("missing.pdf").to_path_buf(), "recommended");

    assert!(result.is_err());
}

#[test]
fn merge_job_rejects_single_input() {
    let config = EngineConfig::default();
    let result = run_merge_job(&config, vec![Path::new("one.pdf").to_path_buf()]);

    assert!(result.is_err());
}

#[test]
fn fixture_pdf_is_available_for_future_smoke_tests() {
    let dir = std::env::temp_dir().join("welovepdf-fixture-test");
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("create temp dir");

    let pdf = dir.join("fixture.pdf");
    write_minimal_pdf(&pdf);

    assert!(pdf.exists());
    assert!(fs::metadata(pdf).expect("metadata").len() > 100);
    let _ = fs::remove_dir_all(dir);
}

fn write_minimal_pdf(path: &Path) {
    let content = b"%PDF-1.4
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
%%EOF";

    fs::write(path, content).expect("write fixture pdf");
}

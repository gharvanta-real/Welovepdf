# WeLovePDF Backend

This backend is designed as a lightweight Rust-first PDF engine foundation.

## Principles
- Rust owns API, jobs, validation, registry, pipeline planning, verification, cleanup, and safety.
- Proven PDF binaries do low-level document work. We do not fake a from-scratch PDF engine.
- Every tool lives in its own module.
- Shared behavior stays in the engine crate.
- Files should stay under 300 lines where practical.

## Crates
- `crates/pdf-engine`: tool registry, capability detection, pipeline plans.
- `crates/pdf-api`: HTTP API for frontend and future workers.

## Current API
- `GET /health`
- `GET /tools`
- `GET /capabilities`
- `GET /tools/{tool_id}/plan`
- `POST /jobs/merge`
- `POST /jobs/compress`

## Required Native Tools
Install these before real file processing:

- `qpdf`: merge, split, rotate, structural operations.
- `poppler`: PDF rendering and PDF-to-image.
- `img2pdf`: image-to-PDF packaging.
- `mutool`: MuPDF inspection/rendering support.
- Optional: `ghostscript` for advanced target-size compression.
- Later: `tesseract`, `libreoffice`.

## Setup
```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-native-tools.ps1
powershell -ExecutionPolicy Bypass -File scripts/check-native-tools.ps1
```

Current local setup has qpdf, poppler, mutool, and img2pdf ready. Ghostscript is optional and not installed yet.

## Run
```bash
cd backend
cargo run -p pdf-api
```

Then open:

```text
http://127.0.0.1:8080/health
http://127.0.0.1:8080/engine/status
http://127.0.0.1:8080/tools
http://127.0.0.1:8080/capabilities
```

## First Ready Tools
- `merge_pdf`
- `split_pdf`
- `compress_pdf` with qpdf baseline optimization
- `jpg_to_pdf`
- `pdf_to_jpg`

## Dev Job API
Merge PDFs from local paths:

```json
{
  "inputs": ["E:/path/one.pdf", "E:/path/two.pdf"]
}
```

Compress a PDF from a local path:

```json
{
  "input": "E:/path/input.pdf"
}
```

These endpoints are for local development. Public upload APIs should use multipart uploads and never accept arbitrary server paths.

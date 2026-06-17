# Backend Engine Memory

## Decision
Use Rust as the primary backend and PDF engine orchestration layer.

## Honest Capability Model
We will not claim a fully custom low-level PDF engine. PDF internals are complex and risky. The advanced part of WeLovePDF will be:

- tool registry
- pipeline planner
- capability detection
- safe temp workspaces
- per-tool isolation
- output verification
- smart compression strategy
- repeatable workflows
- clean UX over the backend state

## Native Engines
- qpdf for structural PDF operations
- Ghostscript for compression
- Poppler or MuPDF for rendering
- img2pdf for image-to-PDF
- Tesseract for OCR later
- LibreOffice for Office-to-PDF later

## Architecture Direction
Frontend talks to Rust API. API creates jobs. Workers process jobs using isolated tool modules. Each tool declares:

- spec
- required binaries
- pipeline plan
- validation rules
- verification rules

## First Backend Phase
1. Rust workspace
2. PDF engine crate
3. API crate
4. tool registry
5. capability detection
6. pipeline plan endpoint
7. later: actual job execution and file processing

## Local Setup Status
- qpdf installed and detected.
- poppler installed and detected.
- mutool installed and detected.
- img2pdf installed with Python user packages and detected.
- Ghostscript is still optional and not installed.
- Initial backend reports 5/5 MVP tools ready.

## Execution Status
- Local dev job endpoints added for merge and compress.
- `POST /jobs/compress` runs qpdf baseline compression and verifies output.
- `POST /jobs/merge` runs qpdf merge and verifies output.
- Smoke test passed with generated PDFs: compressed output valid, merged output valid with 2 pages.
- These dev endpoints accept local paths only for internal testing. Public upload endpoints must use multipart upload and isolated storage.

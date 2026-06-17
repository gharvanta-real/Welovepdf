# WeLovePDF Engineering Rules

## Core Principle
The system must be modular, fast, isolated, and easy to change. A change in one PDF tool must not break another tool.

## DRY And Simplicity
- Follow DRY: shared behavior should live in small reusable helpers/components.
- Do not build a hardcore or over-engineered system before the product needs it.
- Do not build monolithic files or monolithic modules.
- Keep each source file easy to understand and maintain.
- Maximum preferred file size: 300 lines per file.
- If a file grows near 300 lines, split by responsibility before adding more features.

## Preferred Stack
- Frontend: React or Next.js with TypeScript.
- Styling: Tailwind CSS with a small design-token layer.
- Backend: Rust with Axum or Actix Web.
- Database: PostgreSQL.
- Queue/cache/rate limits: Redis initially.
- Temporary storage: S3-compatible storage such as Cloudflare R2, MinIO, or AWS S3.
- Processing workers: Rust orchestration with proven CLI tools.
- Python: allowed only when it is the practical choice for document/image/OCR processing.

## Processing Tools
- PDF structure: qpdf, pdf-lib where useful.
- Compression: Ghostscript, qpdf.
- PDF rendering/images: Poppler, MuPDF.
- Office conversion: LibreOffice headless.
- OCR: Tesseract.
- Image handling: Pillow, img2pdf.

## Layered Architecture
1. Presentation layer: public pages, dashboard, upload UI, pricing, auth.
2. Application layer: tool definitions, limits, jobs, workflow rules, billing checks.
3. Processing layer: isolated workers and tool adapters.
4. Infrastructure layer: database, storage, queue, logs, cleanup, monitoring, rate limits.

## Tool Contract
Every tool should follow the same lifecycle:

```text
ToolInput -> Validate -> Create Job -> Store Temp Files -> Worker Process -> Output File -> Download -> Auto Delete
```

## Isolation Rules
- Every tool has its own module.
- Shared code is allowed only for validation, file storage, queues, auth, billing, and common job state.
- Tool-specific logic must not leak into dashboard or auth code.
- Processing commands must run in restricted temp directories.
- Every uploaded file gets a retention policy and cleanup job.

## Security Rules
- Never trust uploaded file names, MIME types, or extensions.
- Validate file size, extension, MIME sniffing, and page count where possible.
- Store uploads outside public web roots.
- Delete temporary files automatically.
- Log job metadata, not document contents.
- Add rate limits before public launch.

## Performance Rules
- Use streaming uploads/downloads where possible.
- Avoid loading large files fully into memory.
- Use async APIs for job creation and status updates.
- Heavy processing must run in workers, not request handlers.
- Cache static public pages aggressively.

# WeLovePDF Backend Roadmap: 0-100%

## Current Backend Completion

Current honest status: **38-42% complete**.

Why not higher:
- Rust backend foundation is real.
- Native PDF tools are installed and detected.
- Some real jobs work locally.
- Upload/status/download code has been started.
- But full public-safe upload flow, async workers, preview system, cleanup scheduler, and smart compression are not fully verified yet.

## What Is Already Done

### 10%: Research And Engine Direction
Status: **complete**

- Chose Rust as primary backend engine.
- Decided not to fake a custom low-level PDF engine.
- Decided to use proven native tools:
  - qpdf
  - poppler
  - mutool
  - img2pdf
  - optional Ghostscript later
- Stored backend strategy in `.welovepdf/.memory/backend-engine.md`.

### 20%: Rust Backend Foundation
Status: **complete**

- Created Rust workspace at `backend/`.
- Added `pdf-engine` crate.
- Added `pdf-api` crate.
- Added tool registry.
- Added capability detection.
- Added pipeline plans.
- Added native tool setup scripts.
- Added backend README.

### 30%: Native Tool Setup
Status: **complete**

Installed/detected:
- qpdf: ready
- poppler: ready
- mutool: ready
- img2pdf: ready

Optional:
- Ghostscript: not installed yet

Backend reports:

```text
tools_total: 5
tools_ready: 5
```

### 35%: First Real Job Execution
Status: **complete**

Working local dev jobs:
- `compress_pdf`
- `merge_pdf`

Implemented:
- isolated `.work` job folders
- input validation
- qpdf command runner
- qpdf output verification
- qpdf baseline compression
- qpdf merge
- job result metadata

Verified earlier:
- qpdf compressed PDF output valid
- qpdf merged PDF output valid
- merged PDF had 2 pages

## In Progress

### 40%: Upload/Download Public-Safe API
Status: **partially done, needs verification**

Started:
- multipart upload endpoints
- safe file name handling
- max file size checks
- download endpoint by `job_id`
- job output includes `job_id`

Endpoints started:

```text
POST /upload/merge
POST /upload/compress
POST /upload/jpg-to-pdf
POST /upload/pdf-to-jpg
GET  /download/{job_id}/{file_name}
```

Needs verification:
- multipart upload smoke test
- download output smoke test
- invalid upload/error cases
- path traversal safety check
- file cleanup behavior

### 45%: More Real Tool Runners
Status: **partially done, needs verification**

Started:
- `jpg_to_pdf`
- `pdf_to_jpg`

Endpoints started:

```text
POST /jobs/jpg-to-pdf
POST /jobs/pdf-to-jpg
```

Needs verification:
- JPG to PDF output opens
- PDF to JPG output exists
- page count/image count checks
- output naming for multiple JPG pages

### 50%: Job Status Store
Status: **started**

Started:
- in-memory job store
- completed job records
- progress value
- `GET /jobs/{job_id}`

Current limitation:
- only records completed synchronous jobs
- no queued/running/failed lifecycle yet
- not persistent
- resets when API restarts

## Remaining Roadmap

### 55%: Split/Rotate/Remove Pages
Status: **not started**

Need to implement:
- split PDF by ranges
- rotate pages
- remove selected pages
- range parser
- page count validation
- output verification

Tools:
- qpdf

### 60%: Metadata And Preview Engine
Status: **started lightly**

Started:
- `pdfinfo` metadata inspection code
- `/inspect/pdf` endpoint

Need to finish:
- page count extraction verification
- encrypted PDF detection
- PDF version extraction
- thumbnail generation with poppler/mutool
- preview download endpoints
- page-level metadata model

### 65%: Async Jobs And Worker Model
Status: **not started**

Need to implement:
- job state machine:
  - queued
  - running
  - completed
  - failed
  - expired
- worker process/task
- progress updates
- cancellation support
- retry policy
- timeout policy per tool

Initial version can use in-memory queue.
Production version should use Redis/NATS later.

### 70%: Smart Compression Engine
Status: **not started**

Need to implement:
- compression presets:
  - light
  - balanced
  - strong
  - target size
- qpdf baseline optimization
- Ghostscript optional advanced optimization
- scanned vs text PDF detection
- retry strategy for target size
- before/after size report
- quality warning when aggressive compression is used

This is the real "smart engine" milestone.

## 70-100% Production Roadmap

### 75%: Cleanup And Retention

Need:
- cleanup scheduler
- auto-delete expired jobs
- retention config
- manual delete endpoint
- logs without document content

### 80%: Security Hardening

Need:
- stricter MIME sniffing
- extension validation
- page count limits
- file size limits per plan
- command sandboxing
- path traversal tests
- malicious PDF handling policy
- per-job isolated command directories

### 85%: Auth, Limits, And Rate Limiting

Need:
- anonymous session IDs
- user accounts
- per-IP rate limits
- per-user limits
- premium limits
- API key model later

### 90%: Observability And Reliability

Need:
- structured logs
- metrics
- job duration tracking
- error categories
- dashboard for failures
- health checks for native binaries
- startup readiness report

### 95%: Production Storage And Scale

Need:
- S3/R2/MinIO storage adapter
- Redis queue
- worker scaling
- CDN/download strategy
- multi-worker cleanup
- resumable upload later

### 100%: Production PDF Ecosystem Backend

Ready when:
- all MVP tools run through public-safe upload flow
- async jobs are stable
- outputs are verified
- cleanup is automatic
- security rules are tested
- frontend is connected
- deployment is documented
- monitoring exists
- no tool can break another tool

## Recommended Next Steps

### Immediate Next Step: Finish 40-45%

1. Verify multipart upload endpoints.
2. Verify download endpoint.
3. Verify JPG to PDF.
4. Verify PDF to JPG.
5. Add tests for safe file names and invalid upload cases.

### Then: Move To 55-60%

1. Implement split PDF.
2. Implement rotate PDF.
3. Implement remove pages.
4. Finish metadata endpoint.
5. Add thumbnail generation.

### Then: Move To 65-70%

1. Add async job queue.
2. Add real job lifecycle.
3. Add progress states.
4. Add smart compression presets.
5. Add target-size compression.

## Current Backend Grade

```text
Architecture discipline: good
Rust foundation: good
Native tool setup: good
Actual PDF execution: early but real
Public upload safety: started
Async job system: missing
Smart engine layer: missing
Production readiness: not yet
```

Current percent: **40% approx**.


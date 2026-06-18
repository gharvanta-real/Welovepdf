# PDFMount Developer Guide

This document describes how to contribute, build, and add new features and PDF tools to the PDFMount platform.

## 1. Local Development Setup

Prerequisites:
- Node.js (v18+ recommended)
- Rust & Cargo
- Python 3 with ReportLab, PyPDF, or PDFminer installed (for auxiliary tools)

To run the frontend:
```bash
npm install
npm run dev
```

To run the backend:
```bash
cd backend
cargo run --bin pdf-api
```

## 2. Guide: How to Add a New PDF Tool to PDFMount

Adding a new tool involves updating three main layers: the Tool Registry, the Python Processor, and the Frontend UI.

### Step 1: Define the Tool in `tools.ts`
Add a metadata object for your tool in `src/data/tools.ts`:
```typescript
{
  id: "my-new-tool",
  name: "My New Tool",
  group: "Popular",
  description: "Briefly explain what the tool does here",
  icon: Sparkles, // Use an icon imported from lucide-react
  sitemapGroup: "View & Edit",
  status: "beta" // "live" | "beta" | "coming-soon"
}
```

### Step 2: Add SEO Metadata in `seoPages.ts`
Add a keyword-rich entry matching your tool ID in `src/data/seoPages.ts`:
```typescript
"my-new-tool": {
  title: "My New Tool Online - Free PDF editor | PDFMount",
  desc: "Convert or edit your documents instantly with My New Tool.",
  h1: "My New Tool Online",
  intro: "A detailed 1-sentence intro explanation.",
  steps: [
    "Upload your PDF files.",
    "Click the start action.",
    "Download the output."
  ],
  faqs: [
    { q: "Is it free?", a: "Yes, PDFMount provides this tool 100% free." }
  ],
  detailedContent: [
    "A paragraphs explaining how it helps the user."
  ]
}
```

### Step 3: Register in the Rust Backend
Open `backend/crates/pdf-engine/src/registry.rs` (or `backend/crates/pdf-api/src/main.rs`) and register your tool capabilities:
```rust
// Register capability in the tools list response
```

### Step 4: Map backend upload routes
Add a mapping route for the generic processor in `backend/crates/pdf-api/src/main.rs`. In most cases, generic upload parameters map automatically to `/upload/{tool_id}`:
```rust
.route("/upload/my-new-tool", post(upload_generic))
```

### Step 5: Implement the Processor in Python
In `backend/scripts/pdf_processor.py`, add a matching case matching your tool ID:
```python
elif tool_type == "my-new-tool":
    # Call your library/command or process arguments
    # Save the final file into output_path
```

## 3. Local Verification

Verify code integrity before making a pull request:
1. Run `cargo clippy --workspace --all-targets -- -D warnings`
2. Run `cargo test --workspace`
3. Run `npm run build`

## 4. CI/CD Automated Deployment

This project uses a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically test and deploy changes to the live AWS Lightsail server on push to the `main` branch.

### Prerequisites (GitHub Repository Secrets)
Ensure the following Secrets are configured under **Settings > Secrets and variables > Actions** in the GitHub repository:
- `LIGHTSAIL_SSH_KEY`: The complete plaintext content of the SSH private key (`LightsailDefaultKey-ap-south-1.from-vidlord.pem` or `from-ssh.pem`).
- `LIGHTSAIL_HOST`: The server's public IP address (`3.109.44.87`).

The workflow will:
1. Run backend tests (`cargo test --workspace`) in the GitHub Actions runner.
2. If tests pass, sync modified repository files to the server at `/opt/pdfmount/` via `rsync`.
3. Update server dependencies and rebuild the Vite client and Rust backend release binary.
4. Restart the `pdfmount.service` to apply changes live.

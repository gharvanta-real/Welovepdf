# PDFMount AWS Deployment Notes

This file documents how PDFMount was deployed on the same AWS EC2 server where `vidlord.xyz` is already live, so another developer can understand the setup without guessing.

## Current Live Setup

- Domain: `pdfmount.online`
- Public URL: `https://pdfmount.online`
- Server IP: `3.109.44.87`
- Server OS: Ubuntu 22.04 on AWS EC2/Lightsail-style instance
- SSH user used: `ubuntu`
- Existing site on same server: `vidlord.xyz`
- PDFMount frontend: React/Vite static build
- PDFMount backend: Rust Axum binary
- Reverse proxy: Nginx
- SSL: Let's Encrypt / Certbot

## Important Port Separation

`vidlord.xyz` was already using backend port `8080`.

To avoid any clash:

- Vidlord keeps using `0.0.0.0:8080`
- PDFMount runs on `127.0.0.1:8081`
- Nginx routes only `pdfmount.online` PDFMount API/backend routes to `127.0.0.1:8081`

Do not move PDFMount back to port `8080` unless Vidlord is also reconfigured.

## Local Source Change Made

File:

```text
backend/crates/pdf-api/src/main.rs
```

The backend originally had port `8080` hardcoded. It was changed to support an environment variable:

```text
PDFMOUNT_PORT
```

Behavior:

- If `PDFMOUNT_PORT` is set, the backend listens on that port.
- If not set, it defaults to `8080`.

Production service sets:

```text
PDFMOUNT_PORT=8081
```

## Server Paths

PDFMount application:

```text
/opt/pdfmount
```

Frontend static files:

```text
/opt/pdfmount/dist
```

Backend source and release binary:

```text
/opt/pdfmount/backend
/opt/pdfmount/backend/target/release/pdf-api
```

PDF working directory:

```text
/var/lib/pdfmount/work
```

PDF binary/tool lookup directory:

```text
/usr/bin
```

## Systemd Service

Service name:

```text
pdfmount.service
```

Service file:

```text
/etc/systemd/system/pdfmount.service
```

Current service configuration:

```ini
[Unit]
Description=PDFMount Axum API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/opt/pdfmount/backend
Environment=PDFMOUNT_PORT=8081
Environment=WELOVEPDF_WORK_DIR=/var/lib/pdfmount/work
Environment=WELOVEPDF_BIN_DIR=/usr/bin
Environment=WELOVEPDF_TIMEOUT_SECS=120
Environment=WELOVEPDF_MAX_INPUT_BYTES=524288000
ExecStart=/opt/pdfmount/backend/target/release/pdf-api
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Useful commands:

```bash
sudo systemctl status pdfmount.service
sudo systemctl restart pdfmount.service
sudo journalctl -u pdfmount.service -n 100 --no-pager
```

## Nginx Setup

Nginx site file:

```text
/etc/nginx/sites-available/pdfmount
```

Enabled symlink:

```text
/etc/nginx/sites-enabled/pdfmount
```

Main behavior:

- HTTP redirects to HTTPS.
- `www.pdfmount.online` redirects to `pdfmount.online`.
- Static frontend is served from `/opt/pdfmount/dist`.
- API and PDF job routes proxy to `http://127.0.0.1:8081`.

Important proxied routes:

```text
/api/
/health
/engine/
/tools
/capabilities
/jobs/
/inspect/
/upload/
/download/
```

Useful nginx commands:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx
```

## SSL / Certbot

Certificate path:

```text
/etc/letsencrypt/live/pdfmount.online/fullchain.pem
/etc/letsencrypt/live/pdfmount.online/privkey.pem
```

Certificate was issued for:

```text
pdfmount.online
www.pdfmount.online
```

Certbot renews automatically. Dry-run command:

```bash
sudo certbot renew --dry-run --cert-name pdfmount.online
```

Note: Certbot initially failed because the server was trying IPv6 for Let's Encrypt and getting TLS resets. The fix added IPv4 preference in:

```text
/etc/gai.conf
```

Line added:

```text
precedence ::ffff:0:0/96  100
```

## Native Dependencies Installed

PDFMount uses native PDF tools. These were installed on the server:

```text
qpdf
poppler-utils
img2pdf
mupdf-tools
ghostscript
imagemagick
libreoffice
tesseract-ocr
python3-pip
python3-reportlab
python3-docx
python3-openpyxl
```

Python packages installed via pip:

```text
deep-translator
python-pptx
python-docx
openpyxl
reportlab
pikepdf
pdf2docx
```

Capability check endpoint:

```bash
curl https://pdfmount.online/capabilities
```

At deployment time, the core tools were ready:

- merge PDF
- split PDF
- compress PDF
- JPG to PDF
- PDF to JPG

## Deployment Build Flow Used

Local frontend build:

```bash
npm run build
```

Local backend check:

```bash
cd backend
cargo check -p pdf-api
```

Server release build:

```bash
cd /opt/pdfmount/backend
. ~/.cargo/env
cargo build --release -p pdf-api
```

Restart backend after rebuilding:

```bash
sudo systemctl restart pdfmount.service
```

Reload nginx after config changes:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Verification Commands

Health check:

```bash
curl -fsS https://pdfmount.online/health
```

Expected response:

```json
{"status":"ok","service":"welovepdf-pdf-api"}
```

Frontend check:

```bash
curl -I https://pdfmount.online/
```

Vidlord still OK:

```bash
curl -I https://vidlord.xyz/
```

Ports check on server:

```bash
ss -ltnp | grep -E ':8080|:8081'
```

Expected:

- Vidlord on `8080`
- PDFMount on `127.0.0.1:8081`

## Smoke Test Performed

A real PDF compress upload was tested:

```bash
curl -fsS -F 'file=@/tmp/pdfmount-smoke.pdf' https://pdfmount.online/upload/compress
```

It returned a completed job with an output PDF path under:

```text
/var/lib/pdfmount/work/<job-id>/output/compressed.pdf
```

## Things Not To Break

- Do not bind PDFMount to `8080`; Vidlord already uses it.
- Do not remove `/etc/nginx/sites-enabled/vidlord`; that controls `vidlord.xyz`.
- Do not replace the nginx default SSL fallback unless you know the Vidlord config.
- Do not delete `/var/lib/pdfmount/work`; it is used for temporary PDF processing.
- Do not delete `/opt/pdfmount/backend/target/release/pdf-api` unless you rebuild before restarting the service.

## Quick Troubleshooting

If `pdfmount.online` frontend works but API fails:

```bash
sudo systemctl status pdfmount.service
curl http://127.0.0.1:8081/health
sudo journalctl -u pdfmount.service -n 100 --no-pager
```

If nginx returns 502:

```bash
sudo systemctl restart pdfmount.service
sudo nginx -t
sudo systemctl reload nginx
```

If SSL renewal fails:

```bash
sudo certbot renew --dry-run --cert-name pdfmount.online
```

If tools show unavailable:

```bash
curl https://pdfmount.online/capabilities
which qpdf pdftoppm img2pdf mutool gs libreoffice tesseract
```


# PDFMount Production Deployment Guide

This guide details the systemd configuration, Nginx setup, static headers enforcement, and service deployment workflows to host PDFMount in a production environment.

## 1. Directory Structure

Ensure the following directory structure is set up under the `/opt/pdfmount` prefix:

```text
/opt/pdfmount/
├── backend/            # Backend cargo source code
│   └── target/release/ # Pre-compiled pdf-api binary
├── dist/               # Bundled frontend SPA assets (Vite production)
└── data/               # Persistent SQLite database and volatile storage workspaces
```

Create data and uploads folders:
```bash
mkdir -p /opt/pdfmount/data/uploads
chmod -R 775 /opt/pdfmount/data
```

## 2. Environment Configuration

Create `/opt/pdfmount/backend/.env` with production variables:
```ini
PORT=8081
HOST=127.0.0.1
PDFMOUNT_WORK_DIR=/opt/pdfmount/data
PYTHON_BIN=python3
```

## 3. Systemd Service

Create `/etc/systemd/system/pdfmount.service`:
```ini
[Unit]
Description=PDFMount Backend API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pdfmount/backend
ExecStart=/opt/pdfmount/backend/target/release/pdf-api
Restart=always
RestartSec=5
Environment=PATH=/usr/bin:/usr/local/bin
EnvironmentFile=/opt/pdfmount/backend/.env

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable pdfmount.service
sudo systemctl start pdfmount.service
sudo systemctl status pdfmount.service
```

## 4. Nginx Server Configuration

Create the server block in `/etc/nginx/sites-available/pdfmount` (and link it to `/etc/nginx/sites-enabled/`):

```nginx
server {
    listen 80;
    server_name pdfmount.online;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pdfmount.online;

    ssl_certificate /etc/letsencrypt/live/pdfmount.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pdfmount.online/privkey.pem;

    # Nginx security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co;" always;

    # Client limits (maximum body upload limit 500 MB)
    client_max_body_size 500M;

    # Static assets routing
    location / {
        root /opt/pdfmount/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy Routing
    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads Proxy Routing
    location /upload/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Downloads Proxy Routing
    location /download/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

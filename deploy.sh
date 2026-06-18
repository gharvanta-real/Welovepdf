#!/bin/bash
# PDFMount Server Production Deployment Script
# Automatically pulls changes, builds client SPA, recompiles Rust APIs, and restarts systemd services.

set -e

PROJECT_DIR="/opt/pdfmount"
SERVICE_NAME="pdfmount.service"

echo "=== starting pdfmount deploy ==="

# 1. Pull changes
echo "[1/4] pulling latest changes from git..."
cd $PROJECT_DIR
git pull origin main

# Update Python dependencies
echo "[1.5/4] updating python dependencies..."
pip3 install pdf2docx

# 2. Build Frontend
echo "[2/4] building frontend client assets..."
npm install
npm run build

# 3. Build Backend
echo "[3/4] recompiles rust backend..."
cd $PROJECT_DIR/backend
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi
cargo build --release --workspace

# 4. Restart Services
echo "[4/4] restarting systemd service..."
sudo systemctl daemon-reload
sudo systemctl restart $SERVICE_NAME

echo "=== deploy completed successfully ==="

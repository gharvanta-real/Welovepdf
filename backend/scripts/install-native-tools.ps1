$ErrorActionPreference = "Stop"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  throw "winget not found. Install qpdf/poppler/mutool manually or place binaries in backend/bin."
}

winget install --id QPDF.QPDF --accept-package-agreements --accept-source-agreements --silent
winget install --id oschwartz10612.Poppler --accept-package-agreements --accept-source-agreements --silent
winget install --id ArtifexSoftware.mutool --accept-package-agreements --accept-source-agreements --silent

if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m pip install --user img2pdf
}

Write-Host "Ghostscript is optional for advanced target-size compression."
Write-Host "If PATH was modified, restart the terminal before checking tools."

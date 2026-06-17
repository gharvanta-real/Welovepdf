$ErrorActionPreference = "Stop"

function Find-ToolPath {
  param([string[]]$Commands)

  foreach ($command in $Commands) {
    $path = Get-Command $command -ErrorAction SilentlyContinue
    if ($path) { return $path.Source }
  }

  $roots = @(
    "$PSScriptRoot\..\bin",
    "$env:APPDATA\Python\Python312\Scripts",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages",
    "C:\Program Files"
  )

  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    foreach ($command in $Commands) {
      $match = Get-ChildItem $root -Recurse -Filter "$command.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1
      if ($match) { return $match.FullName }
    }
  }

  return ""
}

$tools = @(
  @{ Name = "qpdf"; Commands = @("qpdf") },
  @{ Name = "poppler"; Commands = @("pdftoppm", "pdfinfo") },
  @{ Name = "mupdf"; Commands = @("mutool") },
  @{ Name = "ghostscript"; Commands = @("gswin64c", "gswin32c", "gs") },
  @{ Name = "img2pdf"; Commands = @("img2pdf") }
)

foreach ($tool in $tools) {
  $found = Find-ToolPath -Commands $tool.Commands

  [PSCustomObject]@{
    Tool = $tool.Name
    Ready = $found.Length -gt 0
    Path = $found
  }
}

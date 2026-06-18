import React from "react";

interface PdfToPngSettingsProps {
  pngDpi: string;
  setPngDpi: (val: string) => void;
}

export function PdfToPngSettings({
  pngDpi,
  setPngDpi,
}: PdfToPngSettingsProps) {
  return (
    <div className="options-group">
      <label className="Image Resolution (DPI)">Image Resolution (DPI)</label>
      <select
        className="options-select"
        value={pngDpi}
        onChange={(e) => setPngDpi(e.target.value)}
        style={{ marginTop: "4px" }}
      >
        <option value="72">72 DPI (Web quality, compact size)</option>
        <option value="150">150 DPI (Standard quality, clear text)</option>
        <option value="300">300 DPI (Print quality, very sharp)</option>
      </select>
      <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
        Pages are exported as high-fidelity PNG image frames packaged inside a ZIP download.
      </span>
    </div>
  );
}

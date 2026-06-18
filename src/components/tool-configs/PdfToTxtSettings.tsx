import React from "react";

interface PdfToTxtSettingsProps {
  txtEncoding: string;
  setTxtEncoding: (val: string) => void;
}

export function PdfToTxtSettings({
  txtEncoding,
  setTxtEncoding,
}: PdfToTxtSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Text Encoding</label>
      <select
        className="options-select"
        value={txtEncoding}
        onChange={(e) => setTxtEncoding(e.target.value)}
        style={{ marginTop: "4px" }}
      >
        <option value="utf-8">UTF-8 (Unicode - recommended)</option>
        <option value="ascii">ASCII (Plain English Text)</option>
        <option value="latin-1">ISO-8859-1 (Latin-1)</option>
      </select>
      <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
        Extracts structural text elements into a standard format text file.
      </span>
    </div>
  );
}

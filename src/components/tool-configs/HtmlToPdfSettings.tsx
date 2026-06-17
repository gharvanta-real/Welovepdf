import React from "react";

interface HtmlToPdfSettingsProps {
  htmlPageSize: string;
  setHtmlPageSize: (val: string) => void;
}

export function HtmlToPdfSettings({
  htmlPageSize,
  setHtmlPageSize,
}: HtmlToPdfSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Page Layout Dimensions</label>
      <select
        className="options-select"
        value={htmlPageSize}
        onChange={(e) => setHtmlPageSize(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      >
        <option value="letter">US Letter (8.5 x 11 in)</option>
        <option value="a4">ISO A4 (210 x 297 mm)</option>
      </select>
    </div>
  );
}

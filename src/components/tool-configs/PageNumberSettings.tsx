import React from "react";

interface PageNumberSettingsProps {
  pageNumberPos: string;
  setPageNumberPos: (val: string) => void;
  pageNumberSize: string;
  setPageNumberSize: (val: string) => void;
}

export function PageNumberSettings({
  pageNumberPos,
  setPageNumberPos,
  pageNumberSize,
  setPageNumberSize,
}: PageNumberSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Position Alignment</label>
      <select
        className="options-select"
        value={pageNumberPos}
        onChange={(e) => setPageNumberPos(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      >
        <option value="bottom-center">Bottom Center</option>
        <option value="bottom-left">Bottom Left</option>
        <option value="bottom-right">Bottom Right</option>
        <option value="top-center">Top Center</option>
        <option value="top-left">Top Left</option>
        <option value="top-right">Top Right</option>
      </select>
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Font Size (px)</label>
      <input
        type="number"
        className="options-input"
        value={pageNumberSize}
        onChange={(e) => setPageNumberSize(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
    </div>
  );
}

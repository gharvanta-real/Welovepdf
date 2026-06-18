import React from "react";

interface HeaderFooterSettingsProps {
  headerText: string;
  setHeaderText: (val: string) => void;
  footerText: string;
  setFooterText: (val: string) => void;
}

export function HeaderFooterSettings({
  headerText,
  setHeaderText,
  footerText,
  setFooterText,
}: HeaderFooterSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Header Text</label>
      <input
        type="text"
        className="options-input"
        value={headerText}
        onChange={(e) => setHeaderText(e.target.value)}
        placeholder="Enter header text (e.g. Doc Title)..."
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Footer Text</label>
      <input
        type="text"
        className="options-input"
        value={footerText}
        onChange={(e) => setFooterText(e.target.value)}
        placeholder="Enter footer text (e.g. Confidential)..."
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      
      <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "10px", display: "block" }}>
        Adds small, clean slate-colored headers and footers on every page centered horizontally.
      </span>
    </div>
  );
}

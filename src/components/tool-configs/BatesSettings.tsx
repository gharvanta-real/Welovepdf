import React from "react";

interface BatesSettingsProps {
  batesPrefix: string;
  setBatesPrefix: (val: string) => void;
  batesStart: string;
  setBatesStart: (val: string) => void;
}

export function BatesSettings({
  batesPrefix,
  setBatesPrefix,
  batesStart,
  setBatesStart,
}: BatesSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Bates Prefix</label>
      <input
        type="text"
        className="options-input"
        value={batesPrefix}
        onChange={(e) => setBatesPrefix(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Starting Number</label>
      <input
        type="number"
        className="options-input"
        value={batesStart}
        onChange={(e) => setBatesStart(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
    </div>
  );
}

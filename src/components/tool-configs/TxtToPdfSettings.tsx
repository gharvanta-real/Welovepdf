import React from "react";

interface TxtToPdfSettingsProps {
  txtFontSize: string;
  setTxtFontSize: (val: string) => void;
}

export function TxtToPdfSettings({
  txtFontSize,
  setTxtFontSize,
}: TxtToPdfSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Font Size</label>
      <input
        type="number"
        className="options-input"
        value={txtFontSize}
        onChange={(e) => setTxtFontSize(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
    </div>
  );
}

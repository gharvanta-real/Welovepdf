import React from "react";

interface SignSettingsProps {
  signatureText: string;
  setSignatureText: (val: string) => void;
  signatureStyle: string;
  setSignatureStyle: (val: string) => void;
}

export function SignSettings({
  signatureText,
  setSignatureText,
  signatureStyle,
  setSignatureStyle,
}: SignSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Signature Text</label>
      <input
        type="text"
        className="options-input"
        value={signatureText}
        onChange={(e) => setSignatureText(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Signature Font Style</label>
      <select
        className="options-select"
        value={signatureStyle}
        onChange={(e) => setSignatureStyle(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      >
        <option value="cursive">Cursive (Handwritten)</option>
        <option value="serif">Formal Serif</option>
        <option value="sans">Clean Sans-Serif</option>
      </select>
    </div>
  );
}

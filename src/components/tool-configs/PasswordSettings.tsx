import React from "react";

interface PasswordSettingsProps {
  pdfPassword: string;
  setPdfPassword: (val: string) => void;
  isProtect: boolean;
}

export function PasswordSettings({
  pdfPassword,
  setPdfPassword,
  isProtect,
}: PasswordSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">PDF Password</label>
      <input
        type="password"
        className="options-input"
        value={pdfPassword}
        onChange={(e) => setPdfPassword(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
        {isProtect ? "Set a secure password lock for this document." : "Enter the password required to open the PDF."}
      </span>
    </div>
  );
}

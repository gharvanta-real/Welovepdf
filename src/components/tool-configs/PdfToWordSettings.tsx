import React from "react";

interface PdfToWordSettingsProps {
  pdfToWordMode: "flowing" | "frames" | "text-only";
  setPdfToWordMode: (val: "flowing" | "frames" | "text-only") => void;
  pdfToWordOcr: boolean;
  setPdfToWordOcr: (val: boolean) => void;
  pdfToWordLang: string;
  setPdfToWordLang: (val: string) => void;
  toolColor: string;
}

export function PdfToWordSettings({
  pdfToWordMode,
  setPdfToWordMode,
  pdfToWordOcr,
  setPdfToWordOcr,
  pdfToWordLang,
  setPdfToWordLang,
  toolColor,
}: PdfToWordSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Text Layout Reconstruction</label>
        <div className="options-vertical-list">
          <button
            className={`option-card ${pdfToWordMode === "flowing" ? "active" : ""}`}
            style={{ borderColor: pdfToWordMode === "flowing" ? toolColor : "" }}
            onClick={() => setPdfToWordMode("flowing")}
          >
            <span className="option-title">Flowing Text (Highly Editable)</span>
            <span className="option-desc">Preserves paragraphs, tables and document flow.</span>
          </button>
          <button
            className={`option-card ${pdfToWordMode === "frames" ? "active" : ""}`}
            style={{ borderColor: pdfToWordMode === "frames" ? toolColor : "" }}
            onClick={() => setPdfToWordMode("frames")}
          >
            <span className="option-title">Visual Layout (Frames)</span>
            <span className="option-desc">Keeps elements in exact visual positions using text boxes.</span>
          </button>
          <button
            className={`option-card ${pdfToWordMode === "text-only" ? "active" : ""}`}
            style={{ borderColor: pdfToWordMode === "text-only" ? toolColor : "" }}
            onClick={() => setPdfToWordMode("text-only")}
          >
            <span className="option-title">Plain Text Only</span>
            <span className="option-desc">Extract raw text strings without markup.</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">OCR Options</label>
        <div className="options-checkbox-list">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={pdfToWordOcr}
              onChange={(e) => setPdfToWordOcr(e.target.checked)}
            />
            <span>Run OCR to extract text from scanned images</span>
          </label>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Language for Text Parsing</label>
        <select
          className="options-select"
          value={pdfToWordLang}
          onChange={(e) => setPdfToWordLang(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="en">English (US/UK)</option>
          <option value="es">Spanish (Español)</option>
          <option value="fr">French (Français)</option>
        </select>
      </div>
    </>
  );
}

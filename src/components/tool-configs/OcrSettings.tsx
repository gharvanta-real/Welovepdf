import React from "react";

interface OcrSettingsProps {
  ocrEngineMode: "balanced" | "quality" | "fast";
  setOcrEngineMode: (val: "balanced" | "quality" | "fast") => void;
  ocrLanguage: string;
  setOcrLanguage: (val: string) => void;
  toolColor: string;
}

export function OcrSettings({
  ocrEngineMode,
  setOcrEngineMode,
  ocrLanguage,
  setOcrLanguage,
  toolColor,
}: OcrSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">OCR Engine Accuracy</label>
        <div className="options-vertical-list">
          <button
            className={`option-card ${ocrEngineMode === "balanced" ? "active" : ""}`}
            style={{ borderColor: ocrEngineMode === "balanced" ? toolColor : "" }}
            onClick={() => setOcrEngineMode("balanced")}
          >
            <span className="option-title">Balanced Quality</span>
            <span className="option-desc">Standard conversion layout and accuracy.</span>
          </button>
          <button
            className={`option-card ${ocrEngineMode === "quality" ? "active" : ""}`}
            style={{ borderColor: ocrEngineMode === "quality" ? toolColor : "" }}
            onClick={() => setOcrEngineMode("quality")}
          >
            <span className="option-title">Maximum Quality (Slow)</span>
            <span className="option-desc">High precision pixel scanning and formatting.</span>
          </button>
          <button
            className={`option-card ${ocrEngineMode === "fast" ? "active" : ""}`}
            style={{ borderColor: ocrEngineMode === "fast" ? toolColor : "" }}
            onClick={() => setOcrEngineMode("fast")}
          >
            <span className="option-title">Fast Recognition</span>
            <span className="option-desc">Optimized speed, simple overlay structure.</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Primary Document Language</label>
        <select
          className="options-select"
          value={ocrLanguage}
          onChange={(e) => setOcrLanguage(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="en">English (US/UK)</option>
          <option value="es">Spanish (Español)</option>
          <option value="fr">French (Français)</option>
          <option value="de">German (Deutsch)</option>
          <option value="hi">Hindi (हिन्दी)</option>
        </select>
      </div>
    </>
  );
}

import React from "react";

interface PdfToJpgSettingsProps {
  conversionMode: "page" | "extract";
  setConversionMode: (val: "page" | "extract") => void;
  toolColor: string;
}

export function PdfToJpgSettings({
  conversionMode,
  setConversionMode,
  toolColor,
}: PdfToJpgSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Extraction Mode</label>
      <div className="options-vertical-list">
        <button
          className={`option-card ${conversionMode === "page" ? "active" : ""}`}
          style={{ borderColor: conversionMode === "page" ? toolColor : "" }}
          onClick={() => setConversionMode("page")}
        >
          <span className="option-title">Page to JPG</span>
          <span className="option-desc">Convert entire PDF pages to JPG images.</span>
        </button>
        <button
          className={`option-card ${conversionMode === "extract" ? "active" : ""}`}
          style={{ borderColor: conversionMode === "extract" ? toolColor : "" }}
          onClick={() => setConversionMode("extract")}
        >
          <span className="option-title">Extract Images</span>
          <span className="option-desc">Extract all single images inside the PDF.</span>
        </button>
      </div>
    </div>
  );
}

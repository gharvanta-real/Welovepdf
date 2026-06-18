import React from "react";

interface PdfToHtmlSettingsProps {
  htmlLayout: "formatted" | "simple";
  setHtmlLayout: (val: "formatted" | "simple") => void;
  toolColor: string;
}

export function PdfToHtmlSettings({
  htmlLayout,
  setHtmlLayout,
  toolColor,
}: PdfToHtmlSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Output Webpage Layout</label>
      <div className="options-vertical-list" style={{ marginTop: "4px" }}>
        {(["formatted", "simple"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`option-card ${htmlLayout === mode ? "active" : ""}`}
            onClick={() => setHtmlLayout(mode)}
            style={htmlLayout === mode ? { borderColor: toolColor, backgroundColor: `${toolColor}08` } : {}}
          >
            <span className="option-title">
              {mode === "formatted" ? "Modern Layout" : "Flowable Paragraphs"}
            </span>
            <span className="option-desc">
              {mode === "formatted"
                ? "Styled web layouts wrapped inside a clean responsive card container."
                : "Simple raw HTML tags, best for copying text directly into web editors."}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

import React from "react";

interface AnnotateSettingsProps {
  annotateTool: "highlight" | "pen" | "text-comment";
  setAnnotateTool: (val: "highlight" | "pen" | "text-comment") => void;
  annotateColor: string;
  setAnnotateColor: (val: string) => void;
  annotateText: string;
  setAnnotateText: (val: string) => void;
  annotateOpacity: string;
  setAnnotateOpacity: (val: string) => void;
  annotateThickness: string;
  setAnnotateThickness: (val: string) => void;
  toolColor: string;
}

export function AnnotateSettings({
  annotateTool,
  setAnnotateTool,
  annotateColor,
  setAnnotateColor,
  annotateText,
  setAnnotateText,
  annotateOpacity,
  setAnnotateOpacity,
  annotateThickness,
  setAnnotateThickness,
  toolColor,
}: AnnotateSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Annotation Tool</label>
        <div className="options-vertical-list">
          <button
            className={`option-card ${annotateTool === "highlight" ? "active" : ""}`}
            style={{ borderColor: annotateTool === "highlight" ? toolColor : "" }}
            onClick={() => setAnnotateTool("highlight")}
          >
            <span className="option-title">Highlight Marker</span>
            <span className="option-desc">Semi-transparent text selection highlight.</span>
          </button>
          <button
            className={`option-card ${annotateTool === "pen" ? "active" : ""}`}
            style={{ borderColor: annotateTool === "pen" ? toolColor : "" }}
            onClick={() => setAnnotateTool("pen")}
          >
            <span className="option-title">Freehand Pen Outline</span>
            <span className="option-desc">Draw a customizable review outline path.</span>
          </button>
          <button
            className={`option-card ${annotateTool === "text-comment" ? "active" : ""}`}
            style={{ borderColor: annotateTool === "text-comment" ? toolColor : "" }}
            onClick={() => setAnnotateTool("text-comment")}
          >
            <span className="option-title">Reviewer Comment Card</span>
            <span className="option-desc">Insert a sticky text comment card on page header.</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Annotation Color</label>
        <input
          type="color"
          value={annotateColor}
          onChange={(e) => setAnnotateColor(e.target.value)}
          style={{ width: "100%", height: "38px", border: "1px solid var(--border)", background: "none", cursor: "pointer", marginTop: "4px", borderRadius: "var(--radius-sm)" }}
        />
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label" htmlFor="annotate-text-input">Annotation / Comment Text</label>
        <input
          type="text"
          id="annotate-text-input"
          className="options-input"
          value={annotateText}
          onChange={(e) => setAnnotateText(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        />
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Opacity ({Math.round(parseFloat(annotateOpacity) * 100)}%)</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={annotateOpacity}
          onChange={(e) => setAnnotateOpacity(e.target.value)}
          style={{ width: "100%", marginTop: "4px" }}
        />
      </div>
      {annotateTool === "pen" && (
        <div className="options-group" style={{ marginTop: "14px" }}>
          <label className="options-label">Pen Line Thickness ({annotateThickness}px)</label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={annotateThickness}
            onChange={(e) => setAnnotateThickness(e.target.value)}
            style={{ width: "100%", marginTop: "4px" }}
          />
        </div>
      )}
    </>
  );
}

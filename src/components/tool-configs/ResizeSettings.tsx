import React from "react";

interface ResizeSettingsProps {
  resizePageSize: "a4" | "letter" | "legal";
  setResizePageSize: (val: "a4" | "letter" | "legal") => void;
  toolColor: string;
}

export function ResizeSettings({
  resizePageSize,
  setResizePageSize,
  toolColor,
}: ResizeSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Target Page Size</label>
      <div className="options-vertical-list" style={{ marginTop: "4px" }}>
        {(["a4", "letter", "legal"] as const).map((size) => (
          <button
            key={size}
            type="button"
            className={`option-card ${resizePageSize === size ? "active" : ""}`}
            onClick={() => setResizePageSize(size)}
            style={resizePageSize === size ? { borderColor: toolColor, backgroundColor: `${toolColor}08` } : {}}
          >
            <span className="option-title">
              {size === "a4" ? "A4 Format" : size === "letter" ? "US Letter" : "US Legal"}
            </span>
            <span className="option-desc">
              {size === "a4"
                ? "Resize all pages to A4 dimension limits (595 x 842 points)."
                : size === "letter"
                ? "Resize all pages to US Letter dimension limits (612 x 792 points)."
                : "Resize all pages to US Legal dimension limits (612 x 1008 points)."}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

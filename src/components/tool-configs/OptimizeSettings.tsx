import React from "react";

interface OptimizeSettingsProps {
  optimizeLevel: "standard" | "maximum" | "minimum";
  setOptimizeLevel: (val: "standard" | "maximum" | "minimum") => void;
  toolColor: string;
}

export function OptimizeSettings({
  optimizeLevel,
  setOptimizeLevel,
  toolColor,
}: OptimizeSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Optimization Level</label>
      <div className="options-vertical-list" style={{ marginTop: "4px" }}>
        {(["standard", "maximum", "minimum"] as const).map((level) => (
          <button
            key={level}
            type="button"
            className={`option-card ${optimizeLevel === level ? "active" : ""}`}
            onClick={() => setOptimizeLevel(level)}
            style={optimizeLevel === level ? { borderColor: toolColor, backgroundColor: `${toolColor}08` } : {}}
          >
            <span className="option-title">
              {level === "standard" ? "Standard Web" : level === "maximum" ? "Max Compression" : "Min Compression (HQ)"}
            </span>
            <span className="option-desc">
              {level === "standard"
                ? "Perfect balance between file size and document display quality."
                : level === "maximum"
                ? "Drastically reduces size by heavily compressing images."
                : "Slight size reduction while preserving high-resolution print quality."}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

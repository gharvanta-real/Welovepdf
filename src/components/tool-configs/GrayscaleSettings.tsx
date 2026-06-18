import React from "react";

interface GrayscaleSettingsProps {
  grayscaleMode: "all" | "images" | "text";
  setGrayscaleMode: (val: "all" | "images" | "text") => void;
  toolColor: string;
}

export function GrayscaleSettings({
  grayscaleMode,
  setGrayscaleMode,
  toolColor,
}: GrayscaleSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Conversion Target</label>
      <div className="options-vertical-list" style={{ marginTop: "4px" }}>
        {(["all", "images", "text"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`option-card ${grayscaleMode === mode ? "active" : ""}`}
            onClick={() => setGrayscaleMode(mode)}
            style={grayscaleMode === mode ? { borderColor: toolColor, backgroundColor: `${toolColor}08` } : {}}
          >
            <span className="option-title">
              {mode === "all" ? "Grayscale All" : mode === "images" ? "Grayscale Images Only" : "Grayscale Text Only"}
            </span>
            <span className="option-desc">
              {mode === "all"
                ? "Convert all text, images, graphics, and elements to grayscale."
                : mode === "images"
                ? "Convert photos and raster graphics, leaving text colored."
                : "Convert text and typography, preserving image colors."}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

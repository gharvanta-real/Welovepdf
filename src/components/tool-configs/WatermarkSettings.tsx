import React from "react";

interface WatermarkSettingsProps {
  watermarkText: string;
  setWatermarkText: (val: string) => void;
  watermarkColor: string;
  setWatermarkColor: (val: string) => void;
  watermarkOpacity: string;
  setWatermarkOpacity: (val: string) => void;
}

export function WatermarkSettings({
  watermarkText,
  setWatermarkText,
  watermarkColor,
  setWatermarkColor,
  watermarkOpacity,
  setWatermarkOpacity,
}: WatermarkSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Watermark Text</label>
      <input
        type="text"
        className="options-input"
        value={watermarkText}
        onChange={(e) => setWatermarkText(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Text Color</label>
      <input
        type="color"
        value={watermarkColor}
        onChange={(e) => setWatermarkColor(e.target.value)}
        style={{ width: "100%", height: "38px", border: "1px solid var(--border)", background: "none", cursor: "pointer", marginTop: "4px", borderRadius: "var(--radius-sm)" }}
      />
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Opacity ({Math.round(parseFloat(watermarkOpacity) * 100)}%)</label>
      <input
        type="range"
        min="0.1"
        max="1.0"
        step="0.05"
        value={watermarkOpacity}
        onChange={(e) => setWatermarkOpacity(e.target.value)}
        style={{ width: "100%", marginTop: "4px" }}
      />
    </div>
  );
}

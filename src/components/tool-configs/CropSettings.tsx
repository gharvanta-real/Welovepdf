import React from "react";

interface CropSettingsProps {
  cropMargin: string;
  setCropMargin: (val: string) => void;
}

export function CropSettings({
  cropMargin,
  setCropMargin,
}: CropSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Crop Margin Percentage ({cropMargin}%)</label>
      <input
        type="range"
        min="2"
        max="30"
        step="1"
        value={cropMargin}
        onChange={(e) => setCropMargin(e.target.value)}
        style={{ width: "100%", marginTop: "4px" }}
      />
      <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
        Applies equal crop boundary margins to all four page edges.
      </span>
    </div>
  );
}

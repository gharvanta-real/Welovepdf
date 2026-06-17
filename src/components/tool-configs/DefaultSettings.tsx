import React from "react";

interface DefaultSettingsProps {
  outputQuality: "normal" | "high" | "compact";
  setOutputQuality: (val: "normal" | "high" | "compact") => void;
  toolColor: string;
}

export function DefaultSettings({
  outputQuality,
  setOutputQuality,
  toolColor,
}: DefaultSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Output Quality</label>
        <div className="options-grid cols-3">
          <button
            className={`option-card center-align compact ${outputQuality === "normal" ? "active" : ""}`}
            style={{ borderColor: outputQuality === "normal" ? toolColor : "" }}
            onClick={() => setOutputQuality("normal")}
          >
            <span className="option-title">Normal</span>
          </button>
          <button
            className={`option-card center-align compact ${outputQuality === "high" ? "active" : ""}`}
            style={{ borderColor: outputQuality === "high" ? toolColor : "" }}
            onClick={() => setOutputQuality("high")}
          >
            <span className="option-title">High</span>
          </button>
          <button
            className={`option-card center-align compact ${outputQuality === "compact" ? "active" : ""}`}
            style={{ borderColor: outputQuality === "compact" ? toolColor : "" }}
            onClick={() => setOutputQuality("compact")}
          >
            <span className="option-title">Compact</span>
          </button>
        </div>
      </div>

      <div className="options-group">
        <label className="checkbox-row mt-4">
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Optimize output for web view</span>
        </label>
      </div>
    </>
  );
}

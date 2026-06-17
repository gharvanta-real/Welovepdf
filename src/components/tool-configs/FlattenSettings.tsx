import React from "react";

interface FlattenSettingsProps {
  flattenMode: "all" | "forms" | "annotations";
  setFlattenMode: (val: "all" | "forms" | "annotations") => void;
  toolColor: string;
}

export function FlattenSettings({
  flattenMode,
  setFlattenMode,
  toolColor,
}: FlattenSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Flattening Mode</label>
      <div className="options-vertical-list">
        <button
          className={`option-card ${flattenMode === "all" ? "active" : ""}`}
          style={{ borderColor: flattenMode === "all" ? toolColor : "" }}
          onClick={() => setFlattenMode("all")}
        >
          <span className="option-title">Flatten All Elements</span>
          <span className="option-desc">Flatten both form fields and annotations.</span>
        </button>
        <button
          className={`option-card ${flattenMode === "forms" ? "active" : ""}`}
          style={{ borderColor: flattenMode === "forms" ? toolColor : "" }}
          onClick={() => setFlattenMode("forms")}
        >
          <span className="option-title">Flatten Form Fields Only</span>
          <span className="option-desc">Keep annotations interactive, flatten form fields.</span>
        </button>
        <button
          className={`option-card ${flattenMode === "annotations" ? "active" : ""}`}
          style={{ borderColor: flattenMode === "annotations" ? toolColor : "" }}
          onClick={() => setFlattenMode("annotations")}
        >
          <span className="option-title">Flatten Annotations Only</span>
          <span className="option-desc">Keep form fields interactive, flatten annotations.</span>
        </button>
      </div>
    </div>
  );
}

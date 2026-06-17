import React from "react";

interface SummarizeSettingsProps {
  summarizeLength: "short" | "medium" | "long";
  setSummarizeLength: (val: "short" | "medium" | "long") => void;
  toolColor: string;
}

export function SummarizeSettings({
  summarizeLength,
  setSummarizeLength,
  toolColor,
}: SummarizeSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Summary Length</label>
      <div className="options-vertical-list">
        <button
          className={`option-card ${summarizeLength === "short" ? "active" : ""}`}
          style={{ borderColor: summarizeLength === "short" ? toolColor : "" }}
          onClick={() => setSummarizeLength("short")}
        >
          <span className="option-title">Short (3 Sentences)</span>
          <span className="option-desc">Highly condensed overview.</span>
        </button>
        <button
          className={`option-card ${summarizeLength === "medium" ? "active" : ""}`}
          style={{ borderColor: summarizeLength === "medium" ? toolColor : "" }}
          onClick={() => setSummarizeLength("medium")}
        >
          <span className="option-title">Medium (6 Sentences)</span>
          <span className="option-desc">Standard descriptive outline.</span>
        </button>
        <button
          className={`option-card ${summarizeLength === "long" ? "active" : ""}`}
          style={{ borderColor: summarizeLength === "long" ? toolColor : "" }}
          onClick={() => setSummarizeLength("long")}
        >
          <span className="option-title">Long (12 Sentences)</span>
          <span className="option-desc">Deep structural details.</span>
        </button>
      </div>
    </div>
  );
}

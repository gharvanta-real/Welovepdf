import React from "react";

interface CopilotSettingsProps {
  copilotMode: string;
  setCopilotMode: (val: string) => void;
  toolColor: string;
}

export function CopilotSettings({
  copilotMode,
  setCopilotMode,
  toolColor,
}: CopilotSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Copilot Analysis Mode</label>
      <div className="options-vertical-list">
        <button
          className={`option-card ${copilotMode === "general" ? "active" : ""}`}
          style={{ borderColor: copilotMode === "general" ? toolColor : "" }}
          onClick={() => setCopilotMode("general")}
        >
          <span className="option-title">General Summary</span>
          <span className="option-desc">Broad, semantic review.</span>
        </button>
        <button
          className={`option-card ${copilotMode === "technical" ? "active" : ""}`}
          style={{ borderColor: copilotMode === "technical" ? toolColor : "" }}
          onClick={() => setCopilotMode("technical")}
        >
          <span className="option-title">Technical Audit</span>
          <span className="option-desc">Inspect structural tags and elements.</span>
        </button>
        <button
          className={`option-card ${copilotMode === "financial" ? "active" : ""}`}
          style={{ borderColor: copilotMode === "financial" ? toolColor : "" }}
          onClick={() => setCopilotMode("financial")}
        >
          <span className="option-title">Financial Audit</span>
          <span className="option-desc">Extract tabular data and metrics.</span>
        </button>
      </div>
    </div>
  );
}

import React from "react";

interface RepairSettingsProps {
  repairMode: "streams" | "tables" | "catalog";
  setRepairMode: (val: "streams" | "tables" | "catalog") => void;
  repairCompatibility: string;
  setRepairCompatibility: (val: string) => void;
  toolColor: string;
}

export function RepairSettings({
  repairMode,
  setRepairMode,
  repairCompatibility,
  setRepairCompatibility,
  toolColor,
}: RepairSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Repair Intensity</label>
        <div className="options-vertical-list">
          <button
            className={`option-card ${repairMode === "streams" ? "active" : ""}`}
            style={{ borderColor: repairMode === "streams" ? toolColor : "" }}
            onClick={() => setRepairMode("streams")}
          >
            <span className="option-title">Recover Corrupted Streams</span>
            <span className="option-desc">Deep scan stream blocks for errors.</span>
          </button>
          <button
            className={`option-card ${repairMode === "tables" ? "active" : ""}`}
            style={{ borderColor: repairMode === "tables" ? toolColor : "" }}
            onClick={() => setRepairMode("tables")}
          >
            <span className="option-title">Rebuild Cross-References</span>
            <span className="option-desc">Restore page indexes and offsets.</span>
          </button>
          <button
            className={`option-card ${repairMode === "catalog" ? "active" : ""}`}
            style={{ borderColor: repairMode === "catalog" ? toolColor : "" }}
            onClick={() => setRepairMode("catalog")}
          >
            <span className="option-title">Fix Catalog Metadata</span>
            <span className="option-desc">Rebuild corrupt catalog root descriptors.</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">PDF Compatibility Output</label>
        <select
          className="options-select"
          value={repairCompatibility}
          onChange={(e) => setRepairCompatibility(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="1.4">Acrobat 5.0 (PDF 1.4)</option>
          <option value="1.7">Acrobat 8.0 (PDF 1.7 - Default)</option>
          <option value="2.0">Acrobat X (PDF 2.0)</option>
        </select>
      </div>
    </>
  );
}

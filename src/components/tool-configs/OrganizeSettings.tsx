import React from "react";

interface OrganizeSettingsProps {
  setPageOrder: React.Dispatch<React.SetStateAction<number[]>>;
  totalPdfPages: number;
}

export function OrganizeSettings({
  setPageOrder,
  totalPdfPages,
}: OrganizeSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Sequence operations</label>
      <button
        className="option-card center-align compact"
        onClick={() => {
          setPageOrder(prev => [...prev].reverse());
        }}
        style={{ width: "100%", padding: "12px", border: "1px dashed var(--border)", display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px", cursor: "pointer" }}
      >
        <span>Reverse page order</span>
      </button>
      <button
        className="option-card center-align compact"
        onClick={() => {
          const s = [];
          for (let i = 1; i <= totalPdfPages; i++) s.push(i);
          setPageOrder(s);
        }}
        style={{ width: "100%", padding: "12px", border: "1px dashed var(--border)", display: "flex", justifyContent: "center", gap: "8px", cursor: "pointer" }}
      >
        <span>Reset to default order</span>
      </button>
    </div>
  );
}

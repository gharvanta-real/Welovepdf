import React from "react";

interface RotateSettingsProps {
  totalPdfPages: number;
  rotationMap: { [pageNum: number]: number };
  setRotationMap: (val: { [pageNum: number]: number }) => void;
}

export function RotateSettings({
  totalPdfPages,
  rotationMap,
  setRotationMap,
}: RotateSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Global Rotate</label>
      <button
        className="option-card center-align compact"
        onClick={() => {
          const next: { [pageNum: number]: number } = {};
          for (let i = 1; i <= totalPdfPages; i++) {
            next[i] = ((rotationMap[i] || 0) + 90) % 360;
          }
          setRotationMap(next);
        }}
        style={{ width: "100%", padding: "12px", border: "1px dashed var(--border)", display: "flex", justifyContent: "center", gap: "8px" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
        <span>Rotate all pages 90°</span>
      </button>
    </div>
  );
}

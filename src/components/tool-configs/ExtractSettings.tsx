import React from "react";

interface ExtractSettingsProps {
  selectedPages: Set<number>;
  setSelectedPages: (val: Set<number>) => void;
  totalPdfPages: number;
}

export function ExtractSettings({
  selectedPages,
  setSelectedPages,
  totalPdfPages,
}: ExtractSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Extraction Ranges</label>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px 0" }}>
        {selectedPages.size} of {totalPdfPages} pages selected for extraction.
      </p>
      <div className="options-grid cols-2" style={{ gap: "8px" }}>
        <button
          className="quiet-button"
          style={{ 
            border: "1px solid var(--border)", 
            padding: "8px 12px", 
            borderRadius: "8px", 
            background: "var(--c-bg)", 
            color: "var(--c-text)", 
            cursor: "pointer", 
            transition: "all 0.15s ease", 
            fontSize: "0.8rem", 
            fontWeight: 550,
            fontFamily: "Plus Jakarta Sans, sans-serif"
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "var(--s-primary)";
            e.currentTarget.style.color = "var(--s-on-primary)";
            e.currentTarget.style.borderColor = "var(--s-primary)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "var(--c-bg)";
            e.currentTarget.style.color = "var(--c-text)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          onClick={() => {
            const s = new Set<number>();
            for (let i = 1; i <= totalPdfPages; i++) s.add(i);
            setSelectedPages(s);
          }}
        >
          Select All
        </button>
        <button
          className="quiet-button"
          style={{ 
            border: "1px solid var(--border)", 
            padding: "8px 12px", 
            borderRadius: "8px", 
            background: "var(--c-bg)", 
            color: "var(--c-text)", 
            cursor: "pointer", 
            transition: "all 0.15s ease", 
            fontSize: "0.8rem", 
            fontWeight: 550,
            fontFamily: "Plus Jakarta Sans, sans-serif"
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "var(--s-primary)";
            e.currentTarget.style.color = "var(--s-on-primary)";
            e.currentTarget.style.borderColor = "var(--s-primary)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "var(--c-bg)";
            e.currentTarget.style.color = "var(--c-text)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          onClick={() => setSelectedPages(new Set())}
        >
          Deselect All
        </button>
      </div>
    </div>
  );
}

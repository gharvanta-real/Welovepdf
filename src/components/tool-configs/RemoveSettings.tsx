import React from "react";

interface RemoveSettingsProps {
  removedPages: Set<number>;
  setRemovedPages: (val: Set<number>) => void;
}

export function RemoveSettings({
  removedPages,
  setRemovedPages,
}: RemoveSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Selection Summary</label>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px 0" }}>
        {removedPages.size} {removedPages.size === 1 ? "page" : "pages"} selected for removal.
      </p>
      {removedPages.size > 0 && (
        <button
          className="quiet-button"
          style={{ width: "100%", padding: "10px", border: "1px solid var(--border)", background: "transparent" }}
          onClick={() => setRemovedPages(new Set())}
        >
          Clear all deletions
        </button>
      )}
    </div>
  );
}

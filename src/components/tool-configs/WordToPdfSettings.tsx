import React from "react";

interface WordToPdfSettingsProps {
  wordMargins: "standard" | "narrow" | "wide";
  setWordMargins: (val: "standard" | "narrow" | "wide") => void;
  wordBookmarks: boolean;
  setWordBookmarks: (val: boolean) => void;
  wordLinkColors: boolean;
  setWordLinkColors: (val: boolean) => void;
}

export function WordToPdfSettings({
  wordMargins,
  setWordMargins,
  wordBookmarks,
  setWordBookmarks,
  wordLinkColors,
  setWordLinkColors,
}: WordToPdfSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Margins</label>
        <select
          className="options-select"
          value={wordMargins}
          onChange={(e) => setWordMargins(e.target.value as any)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="standard">Standard (1.0 in / 2.54 cm)</option>
          <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
          <option value="wide">Wide (1.5 in / 3.81 cm)</option>
        </select>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Layout Rules</label>
        <div className="options-checkbox-list">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={wordBookmarks}
              onChange={(e) => setWordBookmarks(e.target.checked)}
            />
            <span>Convert headings to document bookmarks</span>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={wordLinkColors}
              onChange={(e) => setWordLinkColors(e.target.checked)}
            />
            <span>Preserve source link styling and colors</span>
          </label>
        </div>
      </div>
    </>
  );
}

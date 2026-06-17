import React from "react";

interface PptToPdfSettingsProps {
  pptOrientation: "landscape" | "portrait";
  setPptOrientation: (val: "landscape" | "portrait") => void;
  pptSlidesLayout: "1-slide" | "2-slides" | "4-slides";
  setPptSlidesLayout: (val: "1-slide" | "2-slides" | "4-slides") => void;
  pptNotes: boolean;
  setPptNotes: (val: boolean) => void;
  toolColor: string;
}

export function PptToPdfSettings({
  pptOrientation,
  setPptOrientation,
  pptSlidesLayout,
  setPptSlidesLayout,
  pptNotes,
  setPptNotes,
  toolColor,
}: PptToPdfSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Slide Orientation</label>
        <div className="options-grid cols-2">
          <button
            className={`option-card center-align ${pptOrientation === "landscape" ? "active" : ""}`}
            style={{ borderColor: pptOrientation === "landscape" ? toolColor : "" }}
            onClick={() => setPptOrientation("landscape")}
          >
            <span className="option-title">Landscape</span>
          </button>
          <button
            className={`option-card center-align ${pptOrientation === "portrait" ? "active" : ""}`}
            style={{ borderColor: pptOrientation === "portrait" ? toolColor : "" }}
            onClick={() => setPptOrientation("portrait")}
          >
            <span className="option-title">Portrait</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Slides Layout</label>
        <select
          className="options-select"
          value={pptSlidesLayout}
          onChange={(e) => setPptSlidesLayout(e.target.value as any)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="1-slide">1 Slide Per Page</option>
          <option value="2-slides">2 Slides Per Page (Vertical List)</option>
          <option value="4-slides">4 Slides Per Page (2x2 Handout Grid)</option>
        </select>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <div className="options-checkbox-list">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={pptNotes}
              onChange={(e) => setPptNotes(e.target.checked)}
            />
            <span>Include presenter notes page under slides</span>
          </label>
        </div>
      </div>
    </>
  );
}

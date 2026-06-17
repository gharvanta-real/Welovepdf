import React from "react";

interface SplitSettingsProps {
  splitMode: "ranges" | "extract";
  setSplitMode: (val: "ranges" | "extract") => void;
  splitRanges: string;
  setSplitRanges: (val: string) => void;
  toolColor: string;
}

export function SplitSettings({
  splitMode,
  setSplitMode,
  splitRanges,
  setSplitRanges,
  toolColor,
}: SplitSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Split Mode</label>
        <div className="options-grid cols-2">
          <button
            className={`option-card center-align ${splitMode === "ranges" ? "active" : ""}`}
            style={{ borderColor: splitMode === "ranges" ? toolColor : "" }}
            onClick={() => {
              setSplitMode("ranges");
              setSplitRanges("1-2");
            }}
          >
            <span className="option-title">Split by Range</span>
          </button>
          <button
            className={`option-card center-align ${splitMode === "extract" ? "active" : ""}`}
            style={{ borderColor: splitMode === "extract" ? toolColor : "" }}
            onClick={() => {
              setSplitMode("extract");
              setSplitRanges("all");
            }}
          >
            <span className="option-title">Extract Pages</span>
          </button>
        </div>
      </div>

      <div className="options-group">
        {splitMode === "ranges" ? (
          <>
            <label className="options-label" htmlFor="split-ranges-input">Custom page ranges</label>
            <input
              type="text"
              id="split-ranges-input"
              className="options-input"
              value={splitRanges}
              onChange={(e) => setSplitRanges(e.target.value)}
              placeholder="e.g. 1-2, 3-5"
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              Split the document into separate files of specified page ranges.
            </span>
          </>
        ) : (
          <>
            <label className="options-label" htmlFor="split-extract-input">Page numbers to extract</label>
            <input
              type="text"
              id="split-extract-input"
              className="options-input"
              value={splitRanges}
              onChange={(e) => setSplitRanges(e.target.value)}
              placeholder="e.g. all or 1, 3, 5"
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <span className="options-subtext" style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              Enter page numbers separated by commas, or write "all" to split every page.
            </span>
          </>
        )}
      </div>
    </>
  );
}

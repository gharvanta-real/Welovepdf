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
  const isRanges = splitMode === "ranges";
  const isExtractPages = splitMode === "extract" && splitRanges !== "all";
  const isSplitEveryPage = splitMode === "extract" && splitRanges === "all";

  return (
    <>
      <div className="options-group">
        <label className="options-label">Split Mode</label>
        <div className="options-vertical-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          
          {/* 1. Split by Range */}
          <button
            className={`option-card ${isRanges ? "active" : ""}`}
            style={{ 
              borderColor: isRanges ? toolColor : "", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "flex-start", 
              gap: "4px", 
              textAlign: "left", 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "8px", 
              border: "1px solid var(--border)", 
              background: "var(--c-bg)", 
              cursor: "pointer" 
            }}
            onClick={() => {
              setSplitMode("ranges");
              setSplitRanges("1-2");
            }}
          >
            <span className="option-title" style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--c-text)" }}>Split by Range</span>
            <span className="option-desc" style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
              Divide PDF into multiple files by custom range blocks (e.g. 1-3, 4-6).
            </span>
          </button>

          {/* 2. Extract Specific Pages */}
          <button
            className={`option-card ${isExtractPages ? "active" : ""}`}
            style={{ 
              borderColor: isExtractPages ? toolColor : "", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "flex-start", 
              gap: "4px", 
              textAlign: "left", 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "8px", 
              border: "1px solid var(--border)", 
              background: "var(--c-bg)", 
              cursor: "pointer" 
            }}
            onClick={() => {
              setSplitMode("extract");
              setSplitRanges("1, 3, 5");
            }}
          >
            <span className="option-title" style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--c-text)" }}>Extract Specific Pages</span>
            <span className="option-desc" style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
              Pull specific individual page numbers into one single new PDF.
            </span>
          </button>

          {/* 3. Split Every Page */}
          <button
            className={`option-card ${isSplitEveryPage ? "active" : ""}`}
            style={{ 
              borderColor: isSplitEveryPage ? toolColor : "", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "flex-start", 
              gap: "4px", 
              textAlign: "left", 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "8px", 
              border: "1px solid var(--border)", 
              background: "var(--c-bg)", 
              cursor: "pointer" 
            }}
            onClick={() => {
              setSplitMode("extract");
              setSplitRanges("all");
            }}
          >
            <span className="option-title" style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--c-text)" }}>Split Every Page</span>
            <span className="option-desc" style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
              Export each page independently. Outputs as multiple PDFs inside a ZIP folder.
            </span>
          </button>

        </div>
      </div>

      {/* Dynamic Input Options Group */}
      <div className="options-group" style={{ marginTop: "16px" }}>
        {isRanges && (
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
            <span className="options-subtext" style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              Split the document into separate files of specified page ranges.
            </span>
          </>
        )}

        {isExtractPages && (
          <>
            <label className="options-label" htmlFor="split-extract-input">Page numbers to extract</label>
            <input
              type="text"
              id="split-extract-input"
              className="options-input"
              value={splitRanges}
              onChange={(e) => setSplitRanges(e.target.value)}
              placeholder="e.g. 1, 3, 5"
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
            />
            <span className="options-subtext" style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
              Enter page numbers separated by commas (e.g. 1, 3, 5).
            </span>
          </>
        )}

        {isSplitEveryPage && (
          <div style={{ 
            padding: "12px", 
            borderRadius: "8px", 
            border: "1px solid var(--border)", 
            backgroundColor: "var(--accent-soft)", 
            fontSize: "0.76rem", 
            color: "var(--text-muted)", 
            lineHeight: 1.45,
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <span style={{ fontWeight: 600, color: "var(--c-text)" }}>💡 No Input Required</span>
            <span>Every single page in the PDF will automatically be extracted into its own independent file and packaged inside a ZIP archive.</span>
          </div>
        )}
      </div>
    </>
  );
}

import React from "react";

interface JpgToPdfSettingsProps {
  pageOrientation: "portrait" | "landscape";
  setPageOrientation: (val: "portrait" | "landscape") => void;
  pageSize: "a4" | "letter" | "fit";
  setPageSize: (val: "a4" | "letter" | "fit") => void;
  pageMargin: "none" | "small" | "big";
  setPageMargin: (val: "none" | "small" | "big") => void;
  mergeAll: boolean;
  setMergeAll: (val: boolean) => void;
  toolColor: string;
}

export function JpgToPdfSettings({
  pageOrientation,
  setPageOrientation,
  pageSize,
  setPageSize,
  pageMargin,
  setPageMargin,
  mergeAll,
  setMergeAll,
  toolColor,
}: JpgToPdfSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Page orientation</label>
        <div className="options-grid cols-2">
          <button
            className={`option-card center-align ${pageOrientation === "portrait" ? "active" : ""}`}
            style={{ borderColor: pageOrientation === "portrait" ? toolColor : "" }}
            onClick={() => setPageOrientation("portrait")}
          >
            <div className="orientation-icon portrait"></div>
            <span className="option-title">Portrait</span>
          </button>
          <button
            className={`option-card center-align ${pageOrientation === "landscape" ? "active" : ""}`}
            style={{ borderColor: pageOrientation === "landscape" ? toolColor : "" }}
            onClick={() => setPageOrientation("landscape")}
          >
            <div className="orientation-icon landscape"></div>
            <span className="option-title">Landscape</span>
          </button>
        </div>
      </div>

      <div className="options-group">
        <label className="options-label">Page size</label>
        <select
          className="options-select"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as any)}
        >
          <option value="a4">A4 (297x210 mm)</option>
          <option value="letter">US Letter (8.5x11 in)</option>
          <option value="fit">Fit (same page size as image)</option>
        </select>
      </div>

      <div className="options-group">
        <label className="options-label">Margin</label>
        <div className="options-grid cols-3">
          <button
            className={`option-card center-align compact ${pageMargin === "none" ? "active" : ""}`}
            style={{ borderColor: pageMargin === "none" ? toolColor : "" }}
            onClick={() => setPageMargin("none")}
          >
            <span className="option-title">No margin</span>
          </button>
          <button
            className={`option-card center-align compact ${pageMargin === "small" ? "active" : ""}`}
            style={{ borderColor: pageMargin === "small" ? toolColor : "" }}
            onClick={() => setPageMargin("small")}
          >
            <span className="option-title">Small</span>
          </button>
          <button
            className={`option-card center-align compact ${pageMargin === "big" ? "active" : ""}`}
            style={{ borderColor: pageMargin === "big" ? toolColor : "" }}
            onClick={() => setPageMargin("big")}
          >
            <span className="option-title">Big</span>
          </button>
        </div>
      </div>

      <div className="options-group">
        <label className="checkbox-row mt-4">
          <input
            type="checkbox"
            checked={mergeAll}
            onChange={(e) => setMergeAll(e.target.checked)}
          />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Merge all images in one PDF file</span>
        </label>
      </div>
    </>
  );
}

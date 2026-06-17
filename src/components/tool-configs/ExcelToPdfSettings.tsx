import React from "react";

interface ExcelToPdfSettingsProps {
  excelOrientation: "portrait" | "landscape";
  setExcelOrientation: (val: "portrait" | "landscape") => void;
  excelSheetRendering: "fit-width" | "fit-all-columns" | "actual-size";
  setExcelSheetRendering: (val: "fit-width" | "fit-all-columns" | "actual-size") => void;
  excelGridlines: boolean;
  setExcelGridlines: (val: boolean) => void;
  toolColor: string;
}

export function ExcelToPdfSettings({
  excelOrientation,
  setExcelOrientation,
  excelSheetRendering,
  setExcelSheetRendering,
  excelGridlines,
  setExcelGridlines,
  toolColor,
}: ExcelToPdfSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Orientation</label>
        <div className="options-grid cols-2">
          <button
            className={`option-card center-align ${excelOrientation === "portrait" ? "active" : ""}`}
            style={{ borderColor: excelOrientation === "portrait" ? toolColor : "" }}
            onClick={() => setExcelOrientation("portrait")}
          >
            <span className="option-title">Portrait</span>
          </button>
          <button
            className={`option-card center-align ${excelOrientation === "landscape" ? "active" : ""}`}
            style={{ borderColor: excelOrientation === "landscape" ? toolColor : "" }}
            onClick={() => setExcelOrientation("landscape")}
          >
            <span className="option-title">Landscape</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Sheet Scaling</label>
        <select
          className="options-select"
          value={excelSheetRendering}
          onChange={(e) => setExcelSheetRendering(e.target.value as any)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="fit-width">Fit Sheet to One Page Wide</option>
          <option value="fit-all-columns">Fit All Columns on One Page</option>
          <option value="actual-size">No Scaling (Actual Size)</option>
        </select>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <div className="options-checkbox-list">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={excelGridlines}
              onChange={(e) => setExcelGridlines(e.target.checked)}
            />
            <span>Render visible gridlines in output PDF</span>
          </label>
        </div>
      </div>
    </>
  );
}

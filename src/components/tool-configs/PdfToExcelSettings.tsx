import React from "react";

interface PdfToExcelSettingsProps {
  pdfToExcelData: "all-tables" | "single-sheet" | "table-per-page";
  setPdfToExcelData: (val: "all-tables" | "single-sheet" | "table-per-page") => void;
  pdfToExcelSeparator: "period" | "comma";
  setPdfToExcelSeparator: (val: "period" | "comma") => void;
  pdfToExcelDetectNum: boolean;
  setPdfToExcelDetectNum: (val: boolean) => void;
  toolColor: string;
}

export function PdfToExcelSettings({
  pdfToExcelData,
  setPdfToExcelData,
  pdfToExcelSeparator,
  setPdfToExcelSeparator,
  pdfToExcelDetectNum,
  setPdfToExcelDetectNum,
  toolColor,
}: PdfToExcelSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Table Extraction Format</label>
        <select
          className="options-select"
          value={pdfToExcelData}
          onChange={(e) => setPdfToExcelData(e.target.value as any)}
          style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
        >
          <option value="all-tables">Extract All Tables to Separate Sheets</option>
          <option value="single-sheet">Merge All Tables into One Sheet</option>
          <option value="table-per-page">Create One Excel Sheet Per PDF Page</option>
        </select>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <label className="options-label">Formatting Separator</label>
        <div className="options-grid cols-2">
          <button
            className={`option-card center-align ${pdfToExcelSeparator === "period" ? "active" : ""}`}
            style={{ borderColor: pdfToExcelSeparator === "period" ? toolColor : "" }}
            onClick={() => setPdfToExcelSeparator("period")}
          >
            <span className="option-title">Period (.) Decimal</span>
          </button>
          <button
            className={`option-card center-align ${pdfToExcelSeparator === "comma" ? "active" : ""}`}
            style={{ borderColor: pdfToExcelSeparator === "comma" ? toolColor : "" }}
            onClick={() => setPdfToExcelSeparator("comma")}
          >
            <span className="option-title">Comma (,) Decimal</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <div className="options-checkbox-list">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={pdfToExcelDetectNum}
              onChange={(e) => setPdfToExcelDetectNum(e.target.checked)}
            />
            <span>Automatically detect numeric string formatting</span>
          </label>
        </div>
      </div>
    </>
  );
}

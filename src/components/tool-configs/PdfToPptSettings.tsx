import React from "react";

interface PdfToPptSettingsProps {
  pdfToPptLayout: "auto" | "page-image";
  setPdfToPptLayout: (val: "auto" | "page-image") => void;
  pdfToPptBorders: boolean;
  setPdfToPptBorders: (val: boolean) => void;
  pdfToPptCompress: boolean;
  setPdfToPptCompress: (val: boolean) => void;
  toolColor: string;
}

export function PdfToPptSettings({
  pdfToPptLayout,
  setPdfToPptLayout,
  pdfToPptBorders,
  setPdfToPptBorders,
  pdfToPptCompress,
  setPdfToPptCompress,
  toolColor,
}: PdfToPptSettingsProps) {
  return (
    <>
      <div className="options-group">
        <label className="options-label">Slide Creation Layout</label>
        <div className="options-vertical-list">
          <button
            className={`option-card ${pdfToPptLayout === "auto" ? "active" : ""}`}
            style={{ borderColor: pdfToPptLayout === "auto" ? toolColor : "" }}
            onClick={() => setPdfToPptLayout("auto")}
          >
            <span className="option-title">Auto Content Flow</span>
            <span className="option-desc">Convert PDF paragraphs into bullet slides.</span>
          </button>
          <button
            className={`option-card ${pdfToPptLayout === "page-image" ? "active" : ""}`}
            style={{ borderColor: pdfToPptLayout === "page-image" ? toolColor : "" }}
            onClick={() => setPdfToPptLayout("page-image")}
          >
            <span className="option-title">Page as Backdrop Image</span>
            <span className="option-desc">Rasterize each page as a static slide background.</span>
          </button>
        </div>
      </div>
      <div className="options-group" style={{ marginTop: "14px" }}>
        <div className="options-checkbox-list">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={pdfToPptBorders}
              onChange={(e) => setPdfToPptBorders(e.target.checked)}
            />
            <span>Add thin slide border lines</span>
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={pdfToPptCompress}
              onChange={(e) => setPdfToPptCompress(e.target.checked)}
            />
            <span>Compress embedded images to 150 DPI</span>
          </label>
        </div>
      </div>
    </>
  );
}

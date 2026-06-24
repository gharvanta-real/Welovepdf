import React from "react";
import { Play } from "lucide-react";

interface WorkspaceOptionsProps {
  activeTool: string;
  stagedFiles: File[] | null;
  onExecute: () => void;
  isProcessing: boolean;
  
  // States
  compressionLevel: "extreme" | "recommended" | "less";
  setCompressionLevel: (val: "extreme" | "recommended" | "less") => void;
  
  conversionMode: "page" | "extract";
  setConversionMode: (val: "page" | "extract") => void;
  
  outputQuality: "normal" | "high" | "compact";
  setOutputQuality: (val: "normal" | "high" | "compact") => void;
  
  pdfPassword: string;
  setPdfPassword: (val: string) => void;
  
  watermarkText: string;
  setWatermarkText: (val: string) => void;

  translateLang: string;
  setTranslateLang: (val: string) => void;
}

export function WorkspaceOptions({
  activeTool,
  stagedFiles,
  onExecute,
  isProcessing,
  
  compressionLevel,
  setCompressionLevel,
  conversionMode,
  setConversionMode,
  outputQuality,
  setOutputQuality,
  pdfPassword,
  setPdfPassword,
  watermarkText,
  setWatermarkText,
  translateLang,
  setTranslateLang
}: WorkspaceOptionsProps) {
  
  const hasFiles = stagedFiles && stagedFiles.length > 0;

  const renderToolOptions = () => {
    switch (activeTool) {
      case "Compress PDF":
        return (
          <div className="uw-options-section">
            <span className="uw-options-label">Compression Level</span>
            <div className="uw-radio-card-group">
              <div 
                className={`uw-radio-card ${compressionLevel === "recommended" ? "active" : ""}`}
                onClick={() => setCompressionLevel("recommended")}
              >
                <div className="uw-radio-circle" />
                <div>
                  <span className="uw-radio-card-title">Recommended Compression</span>
                  <span className="uw-radio-card-desc">Good balance of size and quality (150 DPI)</span>
                </div>
              </div>
              <div 
                className={`uw-radio-card ${compressionLevel === "extreme" ? "active" : ""}`}
                onClick={() => setCompressionLevel("extreme")}
              >
                <div className="uw-radio-circle" />
                <div>
                  <span className="uw-radio-card-title">Extreme Compression</span>
                  <span className="uw-radio-card-desc">Max size reduction, lower quality (72 DPI)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "PDF to Word":
      case "Word to PDF":
        return (
          <div className="uw-options-section">
            <span className="uw-options-label">Conversion Mode</span>
            <div className="uw-radio-card-group">
              <div 
                className={`uw-radio-card ${conversionMode === "page" ? "active" : ""}`}
                onClick={() => setConversionMode("page")}
              >
                <div className="uw-radio-circle" />
                <div>
                  <span className="uw-radio-card-title">Basic Editable Layout</span>
                  <span className="uw-radio-card-desc">Keep flowable text paragraphs editable</span>
                </div>
              </div>
              <div 
                className={`uw-radio-card ${conversionMode === "extract" ? "active" : ""}`}
                onClick={() => setConversionMode("extract")}
              >
                <div className="uw-radio-circle" />
                <div>
                  <span className="uw-radio-card-title">Exact Formatting</span>
                  <span className="uw-radio-card-desc">Preserve pixel-perfect visual elements (Pro)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "PDF to JPG":
      case "JPG to PDF":
        return (
          <div className="uw-options-section">
            <span className="uw-options-label">Output Quality</span>
            <div className="uw-radio-card-group">
              <div 
                className={`uw-radio-card ${outputQuality === "normal" ? "active" : ""}`}
                onClick={() => setOutputQuality("normal")}
              >
                <div className="uw-radio-circle" />
                <div>
                  <span className="uw-radio-card-title">Standard Resolution</span>
                  <span className="uw-radio-card-desc">Perfect for web sharing and mobile viewing (150 DPI)</span>
                </div>
              </div>
              <div 
                className={`uw-radio-card ${outputQuality === "high" ? "active" : ""}`}
                onClick={() => setOutputQuality("high")}
              >
                <div className="uw-radio-circle" />
                <div>
                  <span className="uw-radio-card-title">High Resolution</span>
                  <span className="uw-radio-card-desc">Perfect for professional layouts and printing (300 DPI)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "Protect PDF":
        return (
          <div className="uw-options-section">
            <span className="uw-options-label">Set Document Password</span>
            <input
              type="password"
              className="v2-input"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              placeholder="Enter secure password"
              style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>
        );

      case "Watermark PDF":
        return (
          <div className="uw-options-section">
            <span className="uw-options-label">Watermark Text</span>
            <input
              type="text"
              className="v2-input"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="CONFIDENTIAL"
              style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px" }}
            />
          </div>
        );

      case "Translate PDF":
        return (
          <div className="uw-options-section">
            <span className="uw-options-label">Target Language</span>
            <select
              value={translateLang}
              onChange={(e) => setTranslateLang(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px", backgroundColor: "#fff" }}
            >
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        );

      default:
        return (
          <div style={{ color: "#64748b", fontSize: "14px", textAlign: "center", marginTop: "20px" }}>
            No additional configurations needed for this tool.
          </div>
        );
    }
  };

  return (
    <aside className="uw-options-panel">
      <div className="uw-options-scroll">
        <h2 className="uw-options-header">{activeTool}</h2>
        <span className="uw-options-subtitle">
          {hasFiles ? "Configure settings before processing" : "Please select files to continue"}
        </span>
        
        {hasFiles && renderToolOptions()}
      </div>

      <div className="uw-options-footer">
        <button
          className="uw-action-btn"
          onClick={onExecute}
          disabled={!hasFiles || isProcessing}
        >
          <Play size={16} fill="currentColor" />
          <span>
            {isProcessing ? "Processing..." : `Execute ${activeTool}`}
          </span>
        </button>
      </div>
    </aside>
  );
}

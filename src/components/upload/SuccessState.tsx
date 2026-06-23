import React from "react";
import { Check, File, Download, Share2, Cloud, RotateCcw, ArrowRight, FileText } from "lucide-react";
import { Footer } from "../Footer";

interface SuccessStateProps {
  selectedTool: string;
  blockColor: string;
  activeJob: any;
  copied: boolean;
  handleShare: () => void;
  clearSelection: () => void;
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
  onOpenInEditor?: (fileName: string) => void;
}

export function SuccessState({
  selectedTool,
  blockColor,
  activeJob,
  copied,
  handleShare,
  clearSelection,
  onToolSelect,
  onViewChange,
  onOpenInEditor,
}: SuccessStateProps) {
  return (
    <div style={{ width: "100%", background: "#f9f9f9", display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "48px 24px 80px 24px", boxSizing: "border-box", flex: 1 }}>
        {/* Header Section */}
        <header style={{ marginBottom: "40px" }}>
          <span className="eyebrow" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "14px", color: "var(--s-primary)", letterSpacing: "0.54px", display: "block", marginBottom: "16px", textTransform: "uppercase" }}>
            PROCESS COMPLETE
          </span>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 340, letterSpacing: "-1.5px", lineHeight: 1.05, margin: 0, color: "var(--s-primary)" }}>
            Success!
          </h1>
        </header>

        {/* Success Grid */}
        <div className="success-grid-layout">
          {/* Left Side: Status & Identity */}
          <div className="success-left-col">
            {/* Visual Anchor */}
            <div style={{
              background: blockColor,
              borderRadius: "16px",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "320px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "80px",
                  height: "110px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid var(--s-hairline)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff"
                  }}>
                    <Check size={20} strokeWidth={3} />
                  </div>
                </div>
                <p style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "20px",
                  fontWeight: 540,
                  color: "#000000",
                  textAlign: "center",
                  margin: 0,
                  maxWidth: "280px",
                  lineHeight: 1.3
                }}>
                  Your PDF is ready for high-fidelity output.
                </p>
              </div>
              {/* Abstract pattern icon floating in background */}
              <div style={{ position: "absolute", top: "0", right: "0", padding: "32px", opacity: 0.05, pointerEvents: "none" }}>
                <File size={200} />
              </div>
            </div>

            {/* Process Logs */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              border: "1px solid var(--s-hairline)",
              width: "100%",
              boxSizing: "border-box"
            }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "20px", fontWeight: 600, margin: "0 0 24px 0" }}>Process Logs</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--s-surface-low)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--s-on-surface)" }}>Document parsed successfully</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--s-surface-low)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--s-on-surface)" }}>Processed by our high-performance engine</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "16px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--s-surface-low)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "var(--s-on-surface)" }}>Output formatted to specification</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side: Actions & File Info */}
          <div className="success-right-col">
            {/* File Info Card */}
            <div style={{
              backgroundColor: "var(--s-surface-soft, #F5F5F5)",
              borderRadius: "16px",
              padding: "32px",
              border: "1px solid var(--s-hairline)"
            }}>
              <div style={{ display: "flex", alignItems: "start", gap: "16px", marginBottom: "32px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "var(--s-primary)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  flexShrink: 0
                }}>
                  <File size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "20px", fontWeight: 600, margin: "0 0 4px 0", wordBreak: "break-all", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={activeJob.file}>{activeJob.file}</h4>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "14px", color: "var(--s-on-surface-variant)", opacity: 0.6, margin: 0 }}>
                    {activeJob.size} • {activeJob.downloadUrl?.toLowerCase().endsWith(".zip") ? "ZIP Archive" : "PDF Document"}
                    {selectedTool === "Compress PDF" && activeJob.originalSizeBytes && activeJob.finalSizeBytes && (
                      <span className="savings-badge">
                        ({Math.round(((activeJob.originalSizeBytes - activeJob.finalSizeBytes) / activeJob.originalSizeBytes) * 100)}% smaller!)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Primary Action Button */}
              {selectedTool === "PDF to Word" && onOpenInEditor && (
                <button
                  onClick={() => onOpenInEditor(activeJob.file)}
                  style={{
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                    border: "none",
                    marginBottom: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: "8px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#111827"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1f2937"}
                >
                  <FileText size={18} />
                  Edit in Document Editor
                </button>
              )}

              <a 
                href={activeJob.downloadUrl} 
                className="download-btn"
                style={{ textDecoration: "none", marginBottom: "16px" }}
                download={
                  activeJob.downloadUrl?.toLowerCase().endsWith(".zip")
                    ? (activeJob.file.toLowerCase().endsWith(".pdf")
                        ? activeJob.file.slice(0, -4) + ".zip"
                        : (activeJob.file.toLowerCase().endsWith(".zip") ? activeJob.file : activeJob.file + ".zip"))
                    : activeJob.file
                }
              >
                <Download size={18} />
                {activeJob.downloadUrl?.toLowerCase().endsWith(".zip") ? "Download ZIP Archive" : "Download File"}
              </a>

              {/* Secondary Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button className="sub-action-sidebar-btn" onClick={handleShare}>
                  <Share2 size={15} />
                  <span>{copied ? "Link Copied!" : "Copy Share Link"}</span>
                </button>
                <button 
                  className="sub-action-sidebar-btn" 
                  onClick={() => alert("Google Drive integration coming soon!")}
                >
                  <Cloud size={15} />
                  <span>Save to Google Drive</span>
                </button>
                <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid var(--s-hairline)" }} />
                <button className="sub-action-sidebar-btn" onClick={clearSelection}>
                  <RotateCcw size={15} />
                  <span>Start Over</span>
                </button>
              </div>
            </div>

            {/* Integration Suggestion */}
            <div style={{
              backgroundColor: "var(--s-block-navy)",
              color: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}>
              <span className="eyebrow" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "var(--s-block-mint)", letterSpacing: "1px", display: "block" }}>
                POWER UP
              </span>
              <h5 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "20px", fontWeight: 600, margin: 0 }}>Integrate with your API</h5>
              <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "14px", opacity: 0.7, margin: 0, lineHeight: 1.4 }}>
                Automate your PDF workflows with our high-performance processing engine.
              </p>
              <a 
                href="#api-docs" 
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--s-block-mint)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onClick={(e) => { e.preventDefault(); alert("API integration documentation is coming soon!"); }}
              >
                View API Documentation
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer onToolSelect={onToolSelect} onViewChange={onViewChange} />
    </div>
  );
}

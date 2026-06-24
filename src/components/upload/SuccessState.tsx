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
    <div style={{ width: "100%", background: "#F8FAFC", display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "48px 24px 80px 24px", boxSizing: "border-box", flex: 1 }}>
        {/* Header Section */}
        <header style={{ marginBottom: "40px" }}>
          <span className="eyebrow" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#2563eb", letterSpacing: "1px", display: "block", marginBottom: "16px", textTransform: "uppercase", fontWeight: 600 }}>
            PROCESS COMPLETE
          </span>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.05, margin: 0, color: "#0F172A" }}>
            Success!
          </h1>
        </header>

        {/* Success Grid */}
        <div className="success-grid-layout">
          {/* Left Side: Status & Identity */}
          <div className="success-left-col">
            {/* Visual Anchor */}
            <div style={{
              background: "linear-gradient(135deg, #F0F6FF, #E5EDFF)",
              borderRadius: "24px",
              padding: "48px",
              border: "1px solid #D0E1FD",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "320px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)"
            }}>
              <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: "80px",
                  height: "110px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(37,99,235,0.08)",
                  border: "1px solid #D0E1FD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "28px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff"
                  }}>
                    <Check size={22} strokeWidth={3} />
                  </div>
                </div>
                <p style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "19px",
                  fontWeight: 650,
                  color: "#1E293B",
                  textAlign: "center",
                  margin: 0,
                  maxWidth: "280px",
                  lineHeight: 1.35
                }}>
                  Your PDF is ready for high-fidelity output.
                </p>
              </div>
              {/* Abstract pattern icon floating in background */}
              <div style={{ position: "absolute", top: "0", right: "0", padding: "32px", opacity: 0.05, pointerEvents: "none", color: "#2563eb" }}>
                <File size={200} />
              </div>
            </div>

            {/* Process Logs */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "36px 32px",
              border: "1px solid #E2E8F0",
              width: "100%",
              boxSizing: "border-box",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "20px", fontWeight: 700, margin: "0 0 24px 0", color: "#1E293B" }}>Process Logs</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "15px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#EBF2FF", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#475569", fontWeight: 500 }}>Document parsed successfully</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "15px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#EBF2FF", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#475569", fontWeight: 500 }}>Processed by our high-performance engine</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "15px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#EBF2FF", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: "#475569", fontWeight: 500 }}>Output formatted to specification</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side: Actions & File Info */}
          <div className="success-right-col">
            {/* File Info Card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "36px 32px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#EBF2FF",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb",
                  flexShrink: 0,
                  border: "1px solid #D0E1FD"
                }}>
                  <File size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "19px", fontWeight: 700, margin: "0 0 4px 0", color: "#1E293B", wordBreak: "break-all", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={activeJob.file}>{activeJob.file}</h4>
                  <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "13.5px", color: "#64748B", margin: 0, fontWeight: 500 }}>
                    {activeJob.size} • {activeJob.downloadUrl?.toLowerCase().endsWith(".zip") ? "ZIP Archive" : "PDF Document"}
                    {selectedTool === "Compress PDF" && activeJob.originalSizeBytes && activeJob.finalSizeBytes && (
                      <span className="savings-badge" style={{ color: "#16a34a", fontWeight: 700 }}>
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
                    backgroundColor: "#000000",
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
                    transition: "opacity 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
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
                <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #E2E8F0" }} />
                <button className="sub-action-sidebar-btn" onClick={clearSelection}>
                  <RotateCcw size={15} />
                  <span>Start Over</span>
                </button>
              </div>
            </div>

            {/* Integration Suggestion */}
            <div style={{
              backgroundColor: "#0F172A",
              color: "#ffffff",
              borderRadius: "24px",
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              border: "1px solid #1E293B",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
            }}>
              <span className="eyebrow" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#38BDF8", letterSpacing: "1px", display: "block", fontWeight: 600 }}>
                POWER UP
              </span>
              <h5 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "20px", fontWeight: 700, margin: 0 }}>Integrate with your API</h5>
              <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "14px", opacity: 0.75, margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
                Automate your PDF workflows with our high-performance processing engine.
              </p>
              <a 
                href="#api-docs" 
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#38BDF8",
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

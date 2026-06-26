import React from "react";
import { ArrowRight } from "lucide-react";

interface CreativeWorkflowsSectionProps {
  onToolSelect: (toolName: string) => void;
}

export function CreativeWorkflowsSection({ onToolSelect }: CreativeWorkflowsSectionProps) {
  return (
    <section className="v2-tools-section" style={{ borderTop: "1px solid var(--v2-border-light)", backgroundColor: "var(--v2-bg-surface)" }}>
      <div className="v2-container">
        
        {/* Section Header */}
        <div className="v2-section-header">
          <div className="v2-section-title-wrap">
            <h2>Explore Creative Document Workflows</h2>
            <p>Unlock high-productivity sequences to edit, sign, and shrink files for immediate use.</p>
          </div>
        </div>

        {/* 3 Creative Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px"
        }}>
          {/* Workflow Card 1 */}
          <div 
            onClick={() => onToolSelect("PDF to Word")}
            className="v2-workflow-card" 
            style={{ padding: "32px 28px", border: "1px solid var(--v2-border)", borderRadius: "8px", backgroundColor: "var(--v2-bg-card)", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}
          >
            <img 
              src="/scan-document.png" 
              alt="Scan &amp; Convert Documents" 
              style={{ width: "100%", height: "160px", objectFit: "contain", margin: "0 auto 20px", display: "block" }} 
            />
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--v2-text-main)", marginBottom: "12px" }}>
                1. Scan &amp; Convert Documents
              </h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                Quickly convert scanned invoices, receipts, and books into clean, editable formats inside your browser.
              </p>
              <div className="v2-tool-cta">
                <span>Start Converting</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Workflow Card 2 */}
          <div 
            onClick={() => onToolSelect("Sign PDF")}
            className="v2-workflow-card" 
            style={{ padding: "32px 28px", border: "1px solid var(--v2-border)", borderRadius: "8px", backgroundColor: "var(--v2-bg-card)", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}
          >
            <img 
              src="/secure-and-sign-agreements.png" 
              alt="Secure &amp; Sign Agreements" 
              style={{ width: "100%", height: "160px", objectFit: "contain", margin: "0 auto 20px", display: "block" }} 
            />
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--v2-text-main)", marginBottom: "12px" }}>
                2. Secure &amp; Sign Agreements
              </h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                Draw, type, or upload signatures to securely sign contracts and download verified copies.
              </p>
              <div className="v2-tool-cta">
                <span>E-Sign Contract</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Workflow Card 3 */}
          <div 
            onClick={() => onToolSelect("Compress PDF")}
            className="v2-workflow-card" 
            style={{ padding: "32px 28px", border: "1px solid var(--v2-border)", borderRadius: "8px", backgroundColor: "var(--v2-bg-card)", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}
          >
            <img 
              src="/merge-and-shrink-for-portals.png" 
              alt="Merge &amp; Shrink for Portals" 
              style={{ width: "100%", height: "160px", objectFit: "contain", margin: "0 auto 20px", display: "block" }} 
            />
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--v2-text-main)", marginBottom: "12px" }}>
                3. Merge &amp; Shrink for Portals
              </h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                Merge documents and spreadsheets into a PDF, then optimize and shrink the file size for easy uploads.
              </p>
              <div className="v2-tool-cta">
                <span>Optimize Size</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
export default CreativeWorkflowsSection;

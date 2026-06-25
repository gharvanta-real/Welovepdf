import React from "react";
import { ArrowRight, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";

// Creative SVG Workflow 1: Scan & Edit (OCR Text Extraction)
const ScanEditSVG = () => (
  <svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", maxWidth: "240px", margin: "0 auto 20px" }}>
    {/* Background Sheet */}
    <rect x="50" y="20" width="140" height="120" rx="8" fill="#FFFFFF" stroke="#EBF2FF" strokeWidth="4" />
    <rect x="50" y="20" width="140" height="120" rx="8" fill="url(#ocr-bg-grad)" />
    
    {/* Scanned Lines representing document content */}
    <rect x="68" y="44" width="70" height="6" rx="3" fill="#D0E1FD" />
    <rect x="68" y="58" width="104" height="6" rx="3" fill="#EBF2FF" />
    <rect x="68" y="72" width="94" height="6" rx="3" fill="#EBF2FF" />
    <rect x="68" y="86" width="104" height="6" rx="3" fill="#D0E1FD" />
    <rect x="68" y="100" width="50" height="6" rx="3" fill="#EBF2FF" />
    
    {/* Scanner Line sweeping down */}
    <g>
      <line x1="42" y1="80" x2="198" y2="80" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
      <rect x="42" y="72" width="156" height="16" fill="url(#scan-glow-grad)" opacity="0.45" />
    </g>

    {/* Editable Highlight Block */}
    <rect x="64" y="54" width="112" height="14" rx="4" fill="rgba(37, 99, 235, 0.08)" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
    
    {/* Interactive Cursor node */}
    <circle cx="176" cy="68" r="4" fill="#2563EB" />
    <path d="M176 68L186 78M186 78H180M186 78V72" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Gradients */}
    <defs>
      <linearGradient id="ocr-bg-grad" x1="50" y1="20" x2="190" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F9FF" />
        <stop offset="1" stopColor="#FFFFFF" />
      </linearGradient>
      <linearGradient id="scan-glow-grad" x1="120" y1="72" x2="120" y2="88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" stopOpacity="0" />
        <stop offset="0.5" stopColor="#2563EB" />
        <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

// Creative SVG Workflow 2: Certified E-Signature & Stamp
const SignContractSVG = () => (
  <svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", maxWidth: "240px", margin: "0 auto 20px" }}>
    {/* Main Sheet */}
    <rect x="50" y="20" width="140" height="120" rx="8" fill="#FFFFFF" stroke="#EBF2FF" strokeWidth="4" />
    
    {/* Document Details */}
    <rect x="70" y="44" width="100" height="5" rx="2.5" fill="#E2E8F0" />
    <rect x="70" y="58" width="80" height="5" rx="2.5" fill="#E2E8F0" />
    <rect x="70" y="72" width="90" height="5" rx="2.5" fill="#E2E8F0" />
    
    {/* Signature Line and Sign Indicator */}
    <line x1="70" y1="108" x2="130" y2="108" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
    <path d="M72 104C85 92 100 92 110 102C120 112 125 102 135 96" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

    {/* Validation Stamp Seal */}
    <g transform="translate(142, 86)">
      <circle cx="20" cy="20" r="20" fill="rgba(34, 197, 94, 0.08)" stroke="#22C55E" strokeWidth="2" />
      <circle cx="20" cy="20" r="16" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M14 20L18 24L26 16" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Fountain Pen drawing */}
    <g transform="translate(132, 48)">
      <path d="M0 40L24 0L30 4L6 44L0 40Z" fill="#0F172A" />
      <path d="M0 40L6 44L3 46L0 40Z" fill="#E2E8F0" />
      <circle cx="12" cy="20" r="2" fill="#FFFFFF" />
    </g>
  </svg>
);

// Creative SVG Workflow 3: Compress & Merge (Portal Optimization)
const PortalCompressSVG = () => (
  <svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", maxWidth: "240px", margin: "0 auto 20px" }}>
    {/* Multiple Documents Merging */}
    <g opacity="0.45" transform="rotate(-8 80 50)">
      <rect x="52" y="24" width="70" height="90" rx="6" fill="#FFFFFF" stroke="#D6C4FF" strokeWidth="2" />
      <rect x="66" y="44" width="42" height="4" rx="2" fill="#EBF2FF" />
      <rect x="66" y="56" width="32" height="4" rx="2" fill="#EBF2FF" />
    </g>
    
    <g opacity="0.65" transform="rotate(6 140 50)">
      <rect x="110" y="24" width="70" height="90" rx="6" fill="#FFFFFF" stroke="#ADEFD1" strokeWidth="2" />
      <rect x="124" y="44" width="42" height="4" rx="2" fill="#EBF2FF" />
      <rect x="124" y="56" width="32" height="4" rx="2" fill="#EBF2FF" />
    </g>

    {/* Center Target Compact File (Representing successful Merge & Compress) */}
    <rect x="80" y="32" width="80" height="106" rx="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
    
    {/* Content inside Compact File */}
    <rect x="94" y="52" width="52" height="6" rx="3" fill="#D0E1FD" />
    <rect x="94" y="66" width="38" height="6" rx="3" fill="#EBF2FF" />
    
    {/* Merge & Compression Graphic arrows */}
    <path d="M42 80H70" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M198 80H170" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
    <path d="M66 80L72 83V77L66 80Z" fill="#2563EB" />
    <path d="M174 80L168 83V77L174 80Z" fill="#2563EB" />

    {/* Size tag graphics: 5MB -> 100KB */}
    <g transform="translate(90, 88)">
      <rect x="0" y="0" width="60" height="22" rx="4" fill="#EBF2FF" stroke="#2563EB" strokeWidth="1" />
      <text x="30" y="14" fill="#2563EB" fontSize="8px" fontWeight="bold" fontFamily="system-ui" textAnchor="middle">5MB → 100KB</text>
    </g>
  </svg>
);

export function CreativeWorkflowsSection() {
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
          <div style={{ padding: "32px 28px", border: "1px solid var(--v2-border)", borderRadius: "8px", backgroundColor: "var(--v2-bg-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <ScanEditSVG />
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--v2-text-main)", marginBottom: "12px" }}>
                1. Scan &amp; Convert Documents
              </h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                Extract structured paragraphs from scanned invoices, receipts, and book pages into clean, editable formats inside your browser.
              </p>
              <div className="v2-tool-cta">
                <span>Start Converting</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Workflow Card 2 */}
          <div style={{ padding: "32px 28px", border: "1px solid var(--v2-border)", borderRadius: "8px", backgroundColor: "var(--v2-bg-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <SignContractSVG />
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--v2-text-main)", marginBottom: "12px" }}>
                2. Secure &amp; Sign Agreements
              </h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                Quickly draw, type, or upload certified electronic signatures to endorse legal contracts and download verified audit-trail copies.
              </p>
              <div className="v2-tool-cta">
                <span>E-Sign Contract</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Workflow Card 3 */}
          <div style={{ padding: "32px 28px", border: "1px solid var(--v2-border)", borderRadius: "8px", backgroundColor: "var(--v2-bg-card)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <PortalCompressSVG />
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--v2-text-main)", marginBottom: "12px" }}>
                3. Merge &amp; Shrink for Portals
              </h3>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--v2-text-muted)", margin: "0 0 24px 0" }}>
                Combine multiple forms and spreadsheets into a single consolidated PDF, then optimize and shrink the file size down for portal uploads.
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

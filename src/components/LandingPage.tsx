// LandingPage component for WeLovePDF application
import { tools, sitemapGroups } from "../data/tools";
import { FileUp, ShieldCheck, Check, ArrowRight, ChevronRight, Award, Users, Star, Headset, FolderPlus, Download, Type, PenTool, Trash2, MessageSquare, Image, FileText, Square, Circle, Minimize2, Edit2 } from "lucide-react";
import React from "react";
import { ToolIcon, getToolColor } from "./ToolIcon";

type LandingPageProps = {
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: "home" | "pricing" | "privacy" | "terms" | "faq" | "contact") => void;
};

const popularToolIds = ["pdf-word", "merge", "jpg-pdf", "esign", "split", "compress"];

const featuresData = [
  {
    id: "editor",
    title: "Work directly on your files",
    description: "View, redact, or organize your PDFs with our easy-to-use tools. Adjust page layout boundaries and verify document integrity in real-time.",
    illustrationText: "Document Editor Preview"
  },
  {
    id: "signature",
    title: "Digital signatures made easy",
    description: "Fill out forms, stamp pages, and electronically sign your contracts in seconds. Zero compliance issues, fully secure, and private by design.",
    illustrationText: "Secure Signatures Workspace"
  },
  {
    id: "organizer",
    title: "Create the perfect document",
    description: "Merge multiple marksheets, split application forms, or extract ranges into stable files. All structural conversions run without rasterizing your vector graphics.",
    illustrationText: "Merge & Page Organizer"
  },
  {
    id: "dashboard",
    title: "Manage your work in one place",
    description: "Keep track of all your recent conversions in a single session dashboard. Download outputs instantly or chain tools together without re-uploading.",
    illustrationText: "Session Dashboard Queue"
  }
];

// ── Feature Mockup Components ──────────────────────────────────────────────

function EditorMockup() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", fontSize: "0.58rem", overflow: "hidden", color: "var(--c-text)", background: "var(--c-bg, #f8fafc)" }}>
      {/* Top ribbon bar */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "4px 8px", backgroundColor: "var(--c-surface, #ffffff)" }}>
        <span style={{ fontWeight: "700", color: "var(--c-accent, #4f46e5)", marginRight: "4px" }}>WeLovePDF Editor</span>
        <div style={{ display: "flex", gap: "2px" }}>
          {["Text", "Highlight", "Pen", "Shape"].map((tool, i) => (
            <span key={tool} style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: i === 1 ? "var(--accent-soft, #e0e7ff)" : "transparent", color: i === 1 ? "var(--c-accent, #4f46e5)" : "var(--text-muted, #64748b)", fontWeight: "600" }}>{tool}</span>
          ))}
        </div>
      </div>
      {/* Main body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Thumbnails */}
        <div style={{ width: "24px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px", padding: "4px", backgroundColor: "var(--c-surface, #ffffff)" }}>
          {[1, 2, 3].map(num => (
            <div key={num} style={{ aspectRatio: "1", border: num === 2 ? "1px solid var(--c-accent, #4f46e5)" : "1px solid var(--border, #e2e8f0)", borderRadius: "2px", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ fontSize: "0.4rem", color: num === 2 ? "var(--c-accent)" : "var(--text-muted)" }}>{num}</span>
            </div>
          ))}
        </div>
        {/* Editor workspace */}
        <div style={{ flex: 1, backgroundColor: "color-mix(in srgb, var(--c-surface, #ffffff) 90%, var(--c-text, #1e293b))", padding: "8px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
          {/* Main page */}
          <div style={{ width: "85%", height: "95%", backgroundColor: "#fff", borderRadius: "3px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", padding: "8px", position: "relative", display: "flex", flexDirection: "column", gap: "4px" }}>
            {/* Mock text lines */}
            <div style={{ height: "4px", width: "40%", backgroundColor: "#e2e8f0", borderRadius: "2px" }}></div>
            <div style={{ height: "4px", width: "80%", backgroundColor: "#e2e8f0", borderRadius: "2px" }}></div>
            {/* Highlighted text block */}
            <div style={{ position: "relative", height: "6px", width: "90%", display: "flex", alignItems: "center" }}>
              <div style={{ height: "4px", width: "30%", backgroundColor: "#e2e8f0", borderRadius: "2px" }}></div>
              <div style={{ position: "absolute", left: "10%", right: "30%", top: 0, bottom: 0, backgroundColor: "#fef08a", opacity: 0.7, borderRadius: "2px", border: "1px dashed #ca8a04" }}></div>
            </div>
            <div style={{ height: "4px", width: "60%", backgroundColor: "#e2e8f0", borderRadius: "2px" }}></div>
            
            {/* Selection overlay box */}
            <div style={{ position: "absolute", top: "42%", left: "15%", width: "60%", height: "30%", border: "1px dashed var(--c-accent, #4f46e5)", backgroundColor: "rgba(99,102,241,0.05)", borderRadius: "2px", padding: "2px", boxSizing: "border-box" }}>
              <span style={{ position: "absolute", top: "-6px", left: "2px", fontSize: "0.35rem", color: "var(--c-accent)", fontWeight: "600", backgroundColor: "#fff", padding: "0 2px" }}>Text Box</span>
              <span style={{ fontSize: "0.45rem", fontWeight: "600", color: "#1e293b", display: "block", marginTop: "1px" }}>Interactive PDF Edit</span>
              {/* resize handle */}
              <div style={{ position: "absolute", bottom: "-2.5px", right: "-2.5px", width: "4px", height: "4px", border: "1px solid var(--c-accent)", borderRadius: "50%", backgroundColor: "#fff" }}></div>
            </div>
          </div>
        </div>
        {/* Properties panel */}
        <div style={{ width: "44px", borderLeft: "1px solid var(--border)", backgroundColor: "var(--c-surface, #ffffff)", padding: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontWeight: "600", color: "var(--text-muted, #64748b)", fontSize: "0.45rem" }}>Properties</span>
          <div style={{ height: "1px", backgroundColor: "var(--border, #e2e8f0)" }}></div>
          <div style={{ display: "flex", gap: "2px" }}>
            {["B", "I", "U"].map((style) => (
              <span key={style} style={{ width: "10px", height: "10px", border: "1px solid var(--border, #e2e8f0)", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.4rem", fontWeight: "700" }}>{style}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "2px", alignItems: "center", marginTop: "2px" }}>
            <span style={{ fontSize: "0.38rem" }}>Color:</span>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#3b82f6", border: "1px solid rgba(0,0,0,0.1)" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureMockup() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", fontSize: "0.58rem", position: "relative", color: "var(--c-text)", background: "var(--c-bg, #f8fafc)", overflow: "hidden" }}>
      {/* Background document layout */}
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px", opacity: 0.35, filter: "blur(0.5px)" }}>
        <div style={{ alignSelf: "center", fontWeight: "800", fontSize: "0.7rem", color: "#1e293b", letterSpacing: "0.05em" }}>MUTUAL NDA AGREEMENT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px" }}>
          <div style={{ height: "4px", width: "100%", backgroundColor: "#94a3b8", borderRadius: "1px" }}></div>
          <div style={{ height: "4px", width: "95%", backgroundColor: "#94a3b8", borderRadius: "1px" }}></div>
          <div style={{ height: "4px", width: "98%", backgroundColor: "#94a3b8", borderRadius: "1px" }}></div>
          <div style={{ height: "4px", width: "80%", backgroundColor: "#94a3b8", borderRadius: "1px" }}></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", padding: "0 8px" }}>
          <div>
            <div style={{ height: "3px", width: "40px", backgroundColor: "#94a3b8" }}></div>
            <div style={{ fontSize: "0.4rem", color: "#94a3b8", marginTop: "2px" }}>Date</div>
          </div>
          <div>
            <div style={{ height: "1px", width: "60px", backgroundColor: "#475569" }}></div>
            <div style={{ fontSize: "0.4rem", color: "#94a3b8", marginTop: "2px" }}>Signature of Party B</div>
          </div>
        </div>
      </div>
      
      {/* Signature Modal Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.15)", backdropFilter: "blur(1px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "75%", backgroundColor: "var(--c-surface, #ffffff)", borderRadius: "8px", border: "1px solid var(--border, #e2e8f0)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)", padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: "800", fontSize: "0.65rem" }}>Electronic Signature</span>
            <span style={{ color: "var(--text-muted, #64748b)", fontSize: "0.5rem" }}>Draw Mode</span>
          </div>
          {/* Signature Canvas Area */}
          <div style={{ height: "48px", border: "1px dashed var(--border, #e2e8f0)", borderRadius: "4px", backgroundColor: "var(--c-bg, #f8fafc)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Draw curve via SVG */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 15 65 Q 25 25 38 60 T 68 35 Q 78 50 88 40" fill="none" stroke="var(--c-accent, #4f46e5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: "0.38rem", color: "var(--text-muted, #64748b)", position: "absolute", bottom: "2px", right: "4px" }}>Clear</span>
          </div>
          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
            <span style={{ padding: "2px 6px", borderRadius: "9999px", border: "1px solid var(--border, #e2e8f0)", fontSize: "0.45rem", cursor: "pointer", fontWeight: "500" }}>Cancel</span>
            <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "var(--c-accent, #4f46e5)", color: "#fff", fontSize: "0.45rem", cursor: "pointer", fontWeight: "700" }}>Insert Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizerMockup() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", fontSize: "0.58rem", color: "var(--c-text)", background: "var(--c-bg, #f8fafc)", overflow: "hidden" }}>
      {/* Header toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "4px 8px", backgroundColor: "var(--c-surface, #ffffff)" }}>
        <span style={{ fontWeight: "700" }}>Page Organizer</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <span style={{ padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--c-accent, #4f46e5)", color: "#fff", fontWeight: "700" }}>Merge Files</span>
          <span style={{ padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border, #e2e8f0)", fontWeight: "500" }}>Add Page</span>
        </div>
      </div>
      
      {/* Organize Grid */}
      <div style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", gap: "6px", backgroundColor: "color-mix(in srgb, var(--c-surface, #ffffff) 90%, var(--c-text, #1e293b))" }}>
        {/* Source files info */}
        <div style={{ display: "flex", gap: "10px", fontSize: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "2px", backgroundColor: "#3b82f6" }}></span>
            <span>Doc_A.pdf (2 pgs)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "2px", backgroundColor: "#10b981" }}></span>
            <span>Doc_B.pdf (2 pgs)</span>
          </div>
        </div>
        
        {/* Grid of pages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", flex: 1, alignItems: "center" }}>
          {[
            { id: 1, doc: "A", color: "#3b82f6", num: "pg. 1" },
            { id: 2, doc: "A", color: "#3b82f6", num: "pg. 2", rotated: 90 },
            { id: 3, doc: "B", color: "#10b981", num: "pg. 3 (Move)", active: true },
            { id: 4, doc: "B", color: "#10b981", num: "pg. 4", deleted: true }
          ].map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: "4px",
                border: item.active ? "1.5px solid var(--c-accent, #4f46e5)" : "1px solid var(--border, #e2e8f0)",
                backgroundColor: "#fff",
                padding: "4px",
                position: "relative",
                aspectRatio: "0.75",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: item.active ? "0 4px 10px rgba(99,102,241,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
                transform: item.rotated ? `rotate(${item.rotated}deg)` : item.active ? "translateY(-3px)" : "none",
                opacity: item.deleted ? 0.4 : 1,
                transition: "all 0.2s"
              }}
            >
              {/* Page content representation */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ height: "3px", width: "100%", backgroundColor: item.color, borderRadius: "1px" }}></div>
                <div style={{ height: "2px", width: "70%", backgroundColor: "#e2e8f0" }}></div>
                <div style={{ height: "2px", width: "50%", backgroundColor: "#e2e8f0" }}></div>
              </div>
              
              {/* Page footer marker */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.38rem", color: "var(--text-muted, #64748b)", fontWeight: "700" }}>{item.num}</span>
                {item.deleted && (
                  <span style={{ color: "#ef4444", fontWeight: "900", fontSize: "0.55rem" }}>✕</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", fontSize: "0.58rem", color: "var(--c-text)", background: "var(--c-bg, #f8fafc)", overflow: "hidden" }}>
      {/* Dashboard Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", padding: "4px 8px", backgroundColor: "var(--c-surface, #ffffff)" }}>
        <span style={{ fontWeight: "700" }}>Conversion Queue</span>
        <span style={{ padding: "1px 6px", borderRadius: "9999px", backgroundColor: "var(--accent-soft, #e0e7ff)", color: "var(--c-accent, #4f46e5)", fontSize: "0.45rem", fontWeight: "700" }}>3 Active Tasks</span>
      </div>
      
      {/* Dashboard Queue list */}
      <div style={{ flex: 1, padding: "6px", display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "color-mix(in srgb, var(--c-surface, #ffffff) 90%, var(--c-text, #1e293b))" }}>
        {[
          { name: "invoice_compress.pdf", tool: "Compress", status: "Completed -64%", color: "#22c55e", badgeBg: "rgba(34,197,94,0.1)", action: "Download" },
          { name: "mutual_nda_signed.pdf", tool: "Sign PDF", status: "Completed", color: "#22c55e", badgeBg: "rgba(34,197,94,0.1)", action: "Download" },
          { name: "annual_report.pdf", tool: "AI Summarize", status: "AI processing...", color: "#f59e0b", badgeBg: "rgba(245,158,11,0.1)", progress: 60 }
        ].map((job, idx) => (
          <div
            key={idx}
            style={{
              padding: "4px 8px",
              backgroundColor: "var(--c-surface, #ffffff)",
              borderRadius: "5px",
              border: "1px solid var(--border, #e2e8f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            {/* File info */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.name}</span>
              <span style={{ fontSize: "0.42rem", color: "var(--text-muted, #64748b)" }}>Tool: {job.tool}</span>
            </div>
            
            {/* Status with badge or progress bar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", width: "70px" }}>
              <span
                style={{
                  padding: "1px 4px",
                  borderRadius: "9999px",
                  color: job.color,
                  backgroundColor: job.badgeBg,
                  fontSize: "0.4rem",
                  fontWeight: "700",
                  whiteSpace: "nowrap"
                }}
              >
                {job.status}
              </span>
              {job.progress !== undefined && (
                <div style={{ width: "100%", height: "2.5px", backgroundColor: "var(--border, #e2e8f0)", borderRadius: "1px", overflow: "hidden" }}>
                  <div style={{ width: `${job.progress}%`, height: "100%", backgroundColor: job.color, borderRadius: "1px" }}></div>
                </div>
              )}
            </div>

            {/* Action button */}
            {job.action ? (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  backgroundColor: "var(--c-accent, #4f46e5)",
                  color: "#fff",
                  fontSize: "0.42rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                {job.action}
              </span>
            ) : (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  border: "1px solid var(--border, #e2e8f0)",
                  color: "var(--text-muted, #64748b)",
                  fontSize: "0.42rem",
                  cursor: "not-allowed"
                }}
              >
                Wait
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const whyChooseData = [
  {
    title: "Pro Tools",
    description: "Access premium PDF compression and advanced formatting tools built on native performance.",
    icon: Star
  },
  {
    title: "Security First",
    description: "Fully compliant with ISO/IEC 27001, GDPR, and standard secure document deletion cycles.",
    icon: ShieldCheck
  },
  {
    title: "Over 1 Billion Users",
    description: "Trusted globally by individuals, teams, and developers who love frictionless utilities.",
    icon: Users
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock responsive documentation, tutorials, and human helper agents.",
    icon: Headset
  },
  {
    title: "20+ PDF Tools",
    description: "A comprehensive suite of conversion, structural optimization, and AI capabilities.",
    icon: FolderPlus
  },
  {
    title: "Award-winning UX",
    description: "Recognized as G2 Category Leader for simplicity and functional web design interfaces.",
    icon: Award
  }
];



export function BrowserMockup() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Decorative Background Shapes */}
      <span className="deco-shape deco-plus-1" style={{ position: "absolute", zIndex: 1, top: "25%", left: "6%", color: "rgba(148, 163, 184, 0.5)", fontSize: "1.4rem", pointerEvents: "none" }}>+</span>
      <span className="deco-shape deco-plus-2" style={{ position: "absolute", zIndex: 1, top: "15%", right: "6%", color: "rgba(148, 163, 184, 0.4)", fontSize: "1.4rem", pointerEvents: "none" }}>+</span>
      <span className="deco-shape deco-circle-1" style={{ position: "absolute", zIndex: 1, top: "28%", left: "12%", width: "8px", height: "8px", border: "1.5px solid rgba(148, 163, 184, 0.5)", borderRadius: "50%", pointerEvents: "none" }}></span>
      <span className="deco-shape deco-circle-2" style={{ position: "absolute", zIndex: 1, bottom: "14%", left: "18%", width: "10px", height: "10px", border: "1.5px solid rgba(148, 163, 184, 0.4)", borderRadius: "50%", pointerEvents: "none" }}></span>
      <span className="deco-shape deco-circle-3" style={{ position: "absolute", zIndex: 1, top: "22%", right: "8%", width: "7px", height: "7px", border: "1.5px solid rgba(148, 163, 184, 0.5)", borderRadius: "50%", pointerEvents: "none" }}></span>

      {/* Skewed decorative background card */}
      <div style={{
        position: "absolute",
        width: "98%",
        height: "86%",
        left: "0%",
        top: "8%",
        background: "linear-gradient(135deg, rgba(235, 244, 255, 0.95) 0%, rgba(243, 247, 254, 0.95) 100%)",
        transform: "rotate(-5.5deg)",
        borderRadius: "28px",
        boxShadow: "0 20px 50px rgba(37, 99, 235, 0.05)",
        opacity: 0.98,
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Browser Frame */}
      <div style={{
        position: "relative",
        width: "82%",
        height: "76%",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 2
      }}>
        {/* Browser Header */}
        <div style={{
          height: "38px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: "12px"
        }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ff5f56", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }}></span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ffbd2e", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }}></span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#27c93f", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.1)" }}></span>
          </div>

          {/* Browser Tab */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#ffffff",
            height: "30px",
            padding: "0 12px",
            borderRadius: "6px 6px 0 0",
            border: "1px solid #e2e8f0",
            borderBottom: "none",
            fontSize: "0.72rem",
            fontWeight: "700",
            color: "#1e293b",
            marginTop: "8px"
          }}>
            {/* Tiny grid logo */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 3px)", gap: "1px" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <span key={i} style={{ width: "3px", height: "3px", backgroundColor: i <= 3 ? "#1d4ed8" : i <= 6 ? "#2563eb" : "#60a5fa" }}></span>
              ))}
            </div>
            <span>WeLovePDF</span>
          </div>

          <div style={{
            flex: 1,
            maxWidth: "180px",
            height: "22px",
            background: "#f1f5f9",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.62rem",
            color: "#64748b",
            border: "1px solid #e2e8f0"
          }}>
            welovepdf.com/edit
          </div>
        </div>

        {/* Mock Toolbar */}
        <div style={{
          height: "32px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: "4px"
        }}>
          {/* Active selection cursor tool */}
          <div style={{
            width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "4px", background: "rgba(37, 99, 235, 0.08)", color: "#2563eb", cursor: "pointer"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5,3v15.2l3.9-3.9l2.8,6.8l2.9-1.2l-2.8-6.8l5.2,0.1L4.5,3z" />
            </svg>
          </div>
          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b", fontSize: "11px", fontWeight: "700" }}>T</div>
          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b" }}><PenTool size={12} /></div>
          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <polyline points="9 11 12 14 22 4" />
            </svg>
          </div>
          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b" }}><Square size={12} /></div>
          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b" }}><Download size={12} /></div>

          <div style={{ width: "1px", height: "16px", backgroundColor: "#e2e8f0", margin: "0 4px" }}></div>

          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4 }}><span style={{ fontSize: "10px" }}>↶</span></div>
          <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4 }}><span style={{ fontSize: "10px" }}>↷</span></div>
        </div>

        {/* Document Canvas */}
        <div style={{
          flex: 1,
          backgroundColor: "#f1f5f9",
          padding: "12px",
          display: "flex",
          justifyContent: "center",
          overflow: "hidden"
        }}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "320px",
            height: "100%",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "4px",
            padding: "16px 12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}>
            {/* Horizontal lines simulating text paragraphs */}
            <div style={{ height: "4px", width: "90%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>
            <div style={{ height: "4px", width: "80%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>
            <div style={{ height: "4px", width: "85%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>

            {/* Text selection box "Hello!" */}
            <div style={{
              position: "absolute",
              top: "32px",
              left: "12px",
              width: "75px",
              height: "22px",
              border: "1.5px solid #2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <span style={{ fontSize: "0.72rem", fontWeight: "600", color: "#2563eb", lineHeight: 1 }}>Hello!</span>
              {/* 8-point resize handles */}
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", left: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", right: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", left: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", right: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", left: "50%", transform: "translateX(-50%)", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", left: "50%", transform: "translateX(-50%)", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", left: "-3px", top: "50%", transform: "translateY(-50%)", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", right: "-3px", top: "50%", transform: "translateY(-50%)", boxSizing: "border-box" }}></span>
            </div>

            <div style={{ height: "4px", width: "95%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginTop: "24px", marginBottom: "8px" }}></div>
            <div style={{ height: "4px", width: "70%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>

            {/* Shape selection circle */}
            <div style={{
              position: "absolute",
              top: "60px",
              right: "15px",
              width: "52px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {/* Actual circle */}
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "1.5px solid #2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.08)"
              }} />
              {/* corner resize handles */}
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", left: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", right: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", left: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", right: "-3px", boxSizing: "border-box" }}></span>
            </div>

            <div style={{ height: "4px", width: "88%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginTop: "28px", marginBottom: "8px" }}></div>
            <div style={{ height: "4px", width: "60%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>

            {/* Signature scribble */}
            <div style={{
              position: "absolute",
              bottom: "18px",
              left: "20px",
              width: "100px",
              height: "32px",
              border: "1.5px dashed rgba(37, 99, 235, 0.4)",
              backgroundColor: "rgba(37, 99, 235, 0.04)",
              borderRadius: "2px"
            }}>
              <svg viewBox="0 0 120 40" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
                <path d="M10,25 C25,18 35,8 48,22 C58,35 62,15 72,18 C82,21 88,32 98,16" />
                <path d="M30,26 C42,26 68,27 88,25" />
              </svg>
              {/* resize handles */}
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", left: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", top: "-3px", right: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", left: "-3px", boxSizing: "border-box" }}></span>
              <span style={{ position: "absolute", width: "5px", height: "5px", backgroundColor: "#ffffff", border: "1.5px solid #2563eb", borderRadius: "50%", bottom: "-3px", right: "-3px", boxSizing: "border-box" }}></span>
              
              {/* Pointer Cursor hovering over bottom-right resize handle */}
              <div style={{
                position: "absolute",
                bottom: "-12px",
                right: "-8px",
                zIndex: 10,
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))"
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5,3v15.2l3.9-3.9l2.8,6.8l2.9-1.2l-2.8-6.8l5.2,0.1L4.5,3z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badges exactly matching user screenshot, wrapped with float animations */}
      {/* Left Pencil Draw Badge (slate-gray #708099) */}
      <div className="float-anim-1" style={{ position: "absolute", top: "43%", left: "2%", zIndex: 10 }}>
        <div
          className="floating-badge"
          style={{
            backgroundColor: "#708099",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(112, 128, 153, 0.35)",
            color: "#ffffff"
          }}
          title="Annotate PDF"
        >
          <PenTool size={16} />
        </div>
      </div>

      {/* Top Document List Badge (deep navy #2d3d52) */}
      <div className="float-anim-2" style={{ position: "absolute", top: "4%", left: "54%", zIndex: 10 }}>
        <div
          className="floating-badge"
          style={{
            backgroundColor: "#2d3d52",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(45, 61, 82, 0.35)",
            color: "#ffffff"
          }}
          title="Merge PDF"
        >
          <FileText size={16} />
        </div>
      </div>

      {/* Top Address Edit Badge (slate-blue #4d607b) */}
      <div className="float-anim-3" style={{ position: "absolute", top: "10%", right: "13%", zIndex: 10 }}>
        <div
          className="floating-badge"
          style={{
            backgroundColor: "#4d607b",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(77, 96, 123, 0.35)",
            color: "#ffffff"
          }}
          title="eSign PDF"
        >
          <Edit2 size={16} />
        </div>
      </div>

      {/* Right Image Badge (light blue-gray #b9c5d6) */}
      <div className="float-anim-4" style={{ position: "absolute", top: "54%", right: "2%", zIndex: 10 }}>
        <div
          className="floating-badge"
          style={{
            backgroundColor: "#b9c5d6",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(185, 197, 214, 0.35)",
            color: "#ffffff"
          }}
          title="JPG to PDF"
        >
          <Image size={16} />
        </div>
      </div>

      {/* Bottom-Right Word 'W' Badge (slate #78829c) */}
      <div className="float-anim-5" style={{ position: "absolute", bottom: "16%", right: "3%", zIndex: 10 }}>
        <div
          className="floating-badge"
          style={{
            backgroundColor: "#78829c",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(120, 130, 156, 0.35)",
            color: "#ffffff"
          }}
          title="Word to PDF"
        >
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff" }}>W</span>
        </div>
      </div>

      {/* Bottom Compress Badge (dark slate-blue #1e293b) */}
      <div className="float-anim-6" style={{ position: "absolute", bottom: "3%", right: "15%", zIndex: 10 }}>
        <div
          className="floating-badge"
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(30, 41, 59, 0.35)",
            color: "#ffffff"
          }}
          title="Compress PDF"
        >
          <Minimize2 size={16} />
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ onToolSelect, onViewChange }: LandingPageProps) {
  const popularTools = popularToolIds
    .map((id) => tools.find((t) => t.id === id))
    .filter((t): t is typeof tools[0] => t !== undefined);

  function scrollToTools() {
    document.getElementById("tools-grid-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero landing-section">
        <div className="landing-hero-copy">
          <h1 style={{ color: "var(--c-text)" }}>We make PDF easy.</h1>
          <p>
            All the tools you’ll need to be more productive and work smarter with documents.
          </p>
          <div className="hero-actions">
            <button className="primary-button hero-cta-btn" onClick={scrollToTools}>
              Get Pro Now
            </button>
            <button className="quiet-button outline-cta-btn" onClick={scrollToTools}>
              Explore All PDF Tools
            </button>
          </div>
        </div>

        <div className="landing-hero-illustration-container">
          <BrowserMockup />
        </div>
      </section>

      {/* Popular Tools Section */}
      <section id="tools-grid-section" className="landing-section" style={{ padding: "40px 0" }}>
        <div className="section-head">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "700", color: "var(--c-text)" }}>Most Popular PDF Tools</h2>
        </div>

        <div className="landing-popular-grid">
          {popularTools.map((tool) => {
            const toolColor = getToolColor(tool.id);
            return (
              <button 
                className="popular-card" 
                key={tool.id} 
                onClick={() => onToolSelect(tool.name)}
                style={{ "--tool-color": toolColor } as React.CSSProperties}
              >
                <ToolIcon toolNameOrId={tool.id} size={26} style={{ width: "44px", height: "44px", borderRadius: "10px" }} />
                <div className="text-container">
                  <strong>{tool.name}</strong>
                  <span>{tool.description}</span>
                </div>
                <ChevronRight size={18} className="card-arrow" />
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button className="primary-button see-all-btn" onClick={scrollToTools}>
            See all PDF tools
          </button>
        </div>
      </section>

      {/* Product Walkthrough Sections */}
      <section className="landing-section" style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
        <div className="section-head">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "700", color: "var(--c-text)" }}>Keep your simple tasks simple</h2>
        </div>

        {featuresData.map((feature, idx) => (
          <div className={`landing-feature-row ${idx % 2 !== 0 ? "reverse" : ""}`} key={feature.title}>
            <div className="landing-feature-copy">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <button 
                className="quiet-button" 
                onClick={scrollToTools} 
                style={{ padding: 0, minHeight: "auto", border: 0, background: "transparent", color: "var(--c-accent)", fontWeight: "600" }}
              >
                Start processing files
                <ArrowRight size={16} style={{ marginLeft: "4px" }} />
              </button>
            </div>

            <div className="landing-illustration">
              <div className="window-header">
                <span className="dot" style={{ backgroundColor: "#ef4444" }}></span>
                <span className="dot" style={{ backgroundColor: "#eab308" }}></span>
                <span className="dot" style={{ backgroundColor: "#22c55e" }}></span>
              </div>
              <div className="window-body" style={{ border: "none", padding: 0, overflow: "hidden", backgroundColor: "transparent" }}>
                {feature.id === "editor" && <EditorMockup />}
                {feature.id === "signature" && <SignatureMockup />}
                {feature.id === "organizer" && <OrganizerMockup />}
                {feature.id === "dashboard" && <DashboardMockup />}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Why Choose Section */}
      <section className="landing-section" style={{ padding: "40px 0" }}>
        <div className="section-head">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "700", color: "var(--c-text)" }}>Why Choose WeLovePDF?</h2>
        </div>

        <div className="landing-popular-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {whyChooseData.map((prop) => {
            const Icon = prop.icon;
            return (
              <div className="popular-card" key={prop.title} style={{ cursor: "default", borderColor: "var(--border)" }}>
                <div className="icon-container" style={{ background: "var(--border)", color: "var(--c-text)" }}>
                  <Icon size={20} />
                </div>
                <div className="text-container">
                  <strong>{prop.title}</strong>
                  <span>{prop.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing/Limits Section */}
      <section className="pricing-section landing-section">
        <div className="section-head">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "700", color: "var(--c-text)" }}>100% Free & Unlimited Features</h2>
        </div>

        <div className="pricing-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h3>WeLovePDF Free & Fair Use Plan</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>We don't sell premium subscriptions. All conversion features, page organization, and translation tools are fully unlocked for everyone.</p>
          <div className="price" style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "20px" }}>
            ₹0 <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: "normal" }}>/ forever (Ad-supported)</span>
          </div>
          <button className="primary-button" style={{ width: "100%", marginBottom: "20px" }} onClick={() => onViewChange("pricing")}>
            View Server Limits & Donations
          </button>
          <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--c-accent)" }} /> 100% Free features & tools access</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--c-accent)" }} /> Standard multi-threaded execution queue</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--c-accent)" }} /> 50 MB maximum upload limit per file</li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--c-accent)" }} /> Complete automated deletion after 1 hour</li>
          </ul>
        </div>
      </section>

      {/* Footer Sitemap */}
      <footer className="landing-footer">
        <div className="landing-section">
          <div className="landing-footer-grid">
            {sitemapGroups.map((group) => {
              const groupTools = tools.filter((tool) => tool.sitemapGroup === group);
              return (
                <div className="footer-col" key={group}>
                  <h5>{group}</h5>
                  <ul>
                    {groupTools.map((tool) => (
                      <li key={tool.id}>
                        <a 
                          href={`#${tool.id}`} 
                          onClick={(e) => {
                            e.preventDefault();
                            onToolSelect(tool.name);
                          }}
                          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                        >
                          <ToolIcon toolNameOrId={tool.id} size={15} style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
                          <span>{tool.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="footer-bottom" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <span>&copy; {new Date().getFullYear()} WeLovePDF. Made with ❤️.</span>
            <div className="footer-links-row" style={{ display: "flex", gap: "16px", fontSize: "0.75rem" }}>
              <a href="#faq" onClick={(e) => { e.preventDefault(); onViewChange("faq"); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--c-accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>FAQ</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); onViewChange("contact"); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--c-accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Contact</a>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); onViewChange("privacy"); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--c-accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); onViewChange("terms"); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--c-accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>Terms of Service</a>
            </div>
            <span style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
              <ShieldCheck size={14} style={{ color: "var(--c-accent)" }} />
              ISO/IEC 27001 Certified · Privacy Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

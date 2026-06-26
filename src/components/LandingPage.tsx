// LandingPage component for Pdfmount.online application
import { tools, sitemapGroups } from "../data/tools";
import { FileUp, ShieldCheck, Check, ArrowRight, ChevronRight, Award, Users, Star, Headset, FolderPlus, Download, Type, PenTool, Trash2, MessageSquare, Image, FileText, Square, Circle, Minimize2, Edit2 } from "lucide-react";
import React from "react";
import { ToolIcon, getToolColor, isMsOfficeTool } from "./ToolIcon";
import { Footer } from "./Footer";

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

// ── Premium Browser & Canvas Mockup Components (Built from Scratch) ─────────────────────────

interface PremiumBrowserMockupProps {
  url?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  floatingBadges?: React.ReactNode;
}

export function PremiumBrowserMockup({ url = "pdfmount.online/edit", toolbar, children, floatingBadges }: PremiumBrowserMockupProps) {
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
        width: "100%",
        height: "94%",
        left: "0%",
        top: "3%",
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
        width: "92%",
        height: "88%",
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
             <img src="/favicon-16x16.png" alt="" style={{ width: "12px", height: "12px", borderRadius: "2px", objectFit: "contain" }} />
             <span>Pdfmount</span>
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
            {url}
          </div>
        </div>

        {/* Mock Toolbar */}
        {toolbar}

        {/* Document Canvas */}
        <div style={{
          flex: 1,
          backgroundColor: "#f1f5f9",
          padding: "12px",
          display: "flex",
          justifyContent: "center",
          overflow: "hidden"
        }}>
          {children}
        </div>
      </div>

      {/* Floating Badges */}
      {floatingBadges}
    </div>
  );
}

export function PremiumEditorMockup() {
  const toolbar = (
    <div style={{ height: "32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "4px" }}>
      <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", background: "rgba(37, 99, 235, 0.08)", color: "#2563eb" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5,3v15.2l3.9-3.9l2.8,6.8l2.9-1.2l-2.8-6.8l5.2,0.1L4.5,3z" />
        </svg>
      </div>
      <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b", fontSize: "11px", fontWeight: "700" }}>T</div>
      <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b" }}><PenTool size={12} /></div>
      <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", color: "#64748b" }}><Square size={12} /></div>
    </div>
  );

  const floatingBadges = (
    <>
      <div className="float-anim-1" style={{ position: "absolute", top: "43%", left: "0%", zIndex: 10 }}>
        <div className="floating-badge" style={{ backgroundColor: "#708099", border: "1px solid rgba(255, 255, 255, 0.15)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(112, 128, 153, 0.35)", color: "#ffffff" }}>
          <PenTool size={16} />
        </div>
      </div>
      <div className="float-anim-4" style={{ position: "absolute", top: "54%", right: "0%", zIndex: 10 }}>
        <div className="floating-badge" style={{ backgroundColor: "#b9c5d6", border: "1px solid rgba(255, 255, 255, 0.15)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(185, 197, 214, 0.35)", color: "#ffffff" }}>
          <Image size={16} />
        </div>
      </div>
    </>
  );

  return (
    <PremiumBrowserMockup url="pdfmount.online/edit" toolbar={toolbar} floatingBadges={floatingBadges}>
      <div style={{ position: "relative", width: "100%", maxWidth: "320px", height: "100%", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "16px 12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
        <div style={{ height: "4px", width: "90%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>
        <div style={{ height: "4px", width: "80%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>
        <div style={{ position: "relative", height: "24px", width: "90%", border: "1.5px solid #2563eb", backgroundColor: "rgba(37, 99, 235, 0.08)", borderRadius: "2px", display: "flex", alignItems: "center", padding: "0 6px", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.62rem", fontWeight: "600", color: "#2563eb" }}>Interactive PDF Text Edit</span>
          <span style={{ position: "absolute", width: "4px", height: "4px", backgroundColor: "#ffffff", border: "1px solid #2563eb", borderRadius: "50%", bottom: "-2.5px", right: "-2.5px" }}></span>
        </div>
        <div style={{ height: "4px", width: "95%", backgroundColor: "#e2e8f0", borderRadius: "2px", marginBottom: "8px" }}></div>
        <div style={{ position: "relative", width: "140px", height: "28px", border: "1.5px solid #22c55e", backgroundColor: "rgba(34, 197, 94, 0.06)", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "0.55rem", color: "#22c55e", fontWeight: "600" }}>Annotate & Highlight</span>
          <span style={{ position: "absolute", width: "4px", height: "4px", backgroundColor: "#ffffff", border: "1px solid #22c55e", borderRadius: "50%", bottom: "-2.5px", right: "-2.5px" }}></span>
        </div>
      </div>
    </PremiumBrowserMockup>
  );
}

export function PremiumSignatureMockup() {
  const toolbar = (
    <div style={{ height: "32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", gap: "4px" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#1e293b" }}>Electronic Signature</span>
      <div style={{ width: "1px", height: "14px", backgroundColor: "#e2e8f0", margin: "0 4px" }}></div>
      <span style={{ fontSize: "0.55rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(79, 70, 229, 0.08)", color: "#4f46e5", fontWeight: "700" }}>Secure Mode</span>
    </div>
  );

  const floatingBadges = (
    <>
      <div className="float-anim-3" style={{ position: "absolute", top: "2%", right: "10%", zIndex: 10 }}>
        <div className="floating-badge" style={{ backgroundColor: "#4d607b", border: "1px solid rgba(255, 255, 255, 0.15)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(77, 96, 123, 0.35)", color: "#ffffff" }}>
          <Edit2 size={16} />
        </div>
      </div>
    </>
  );

  return (
    <PremiumBrowserMockup url="pdfmount.online/sign" toolbar={toolbar} floatingBadges={floatingBadges}>
      <div style={{ position: "relative", width: "100%", maxWidth: "320px", height: "100%", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "16px 12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ alignSelf: "center", fontWeight: "800", fontSize: "0.68rem", color: "#1e293b", letterSpacing: "0.05em" }}>MUTUAL NDA AGREEMENT</div>
        <div style={{ height: "4px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "1px" }}></div>
        <div style={{ height: "4px", width: "95%", backgroundColor: "#e2e8f0", borderRadius: "1px" }}></div>
        <div style={{ height: "4px", width: "80%", backgroundColor: "#e2e8f0", borderRadius: "1px" }}></div>
        <div style={{ border: "1.5px dashed rgba(79, 70, 229, 0.4)", borderRadius: "4px", backgroundColor: "rgba(79, 70, 229, 0.03)", padding: "6px", position: "relative", marginTop: "16px" }}>
          <svg viewBox="0 0 120 30" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "24px" }}>
            <path d="M15,22 C30,16 38,4 52,16 C62,26 66,8 76,10 C86,12 92,22 102,10" />
          </svg>
          <span style={{ position: "absolute", top: "-5px", left: "6px", fontSize: "0.42rem", color: "#4f46e5", backgroundColor: "#fff", padding: "0 2px", fontWeight: "600" }}>Authorized Signature</span>
        </div>
      </div>
    </PremiumBrowserMockup>
  );
}

export function PremiumOrganizerMockup() {
  const toolbar = (
    <div style={{ height: "32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", justifyContent: "space-between" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#1e293b" }}>Page Organizer</span>
      <span style={{ fontSize: "0.55rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#2563eb", color: "#fff", fontWeight: "700" }}>Merge PDF</span>
    </div>
  );

  const floatingBadges = (
    <>
      <div className="float-anim-2" style={{ position: "absolute", top: "-4%", left: "54%", zIndex: 10 }}>
        <div className="floating-badge" style={{ backgroundColor: "#2d3d52", border: "1px solid rgba(255, 255, 255, 0.15)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(45, 61, 82, 0.35)", color: "#ffffff" }}>
          <FileText size={16} />
        </div>
      </div>
    </>
  );

  return (
    <PremiumBrowserMockup url="pdfmount.online/organize" toolbar={toolbar} floatingBadges={floatingBadges}>
      <div style={{ position: "relative", width: "100%", maxWidth: "320px", height: "100%", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "12px 10px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", height: "100%", alignItems: "center" }}>
          {[
            { id: 1, num: "Page 1", color: "#3b82f6" },
            { id: 2, num: "Page 2 (Move)", color: "#10b981", active: true },
            { id: 3, num: "Page 3 (Rotated)", color: "#f59e0b", rotated: 90 },
          ].map(p => (
            <div key={p.id} style={{ border: p.active ? "1.5px solid #2563eb" : "1px solid #e2e8f0", borderRadius: "4px", padding: "6px", aspectRatio: "0.75", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: p.rotated ? "rotate(90deg)" : "none", boxShadow: p.active ? "0 4px 10px rgba(37,99,235,0.15)" : "none" }}>
              <div style={{ height: "3px", width: "100%", backgroundColor: p.color, borderRadius: "1px" }}></div>
              <div style={{ height: "2px", width: "60%", backgroundColor: "#e2e8f0" }}></div>
              <span style={{ fontSize: "0.45rem", fontWeight: "700", color: "#64748b" }}>{p.num}</span>
            </div>
          ))}
        </div>
      </div>
    </PremiumBrowserMockup>
  );
}

export function PremiumDashboardMockup() {
  const toolbar = (
    <div style={{ height: "32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 8px", justifyContent: "space-between" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#1e293b" }}>Conversion Queue</span>
      <span style={{ fontSize: "0.5rem", padding: "1px 6px", borderRadius: "9999px", backgroundColor: "#dcfce7", color: "#15803d", fontWeight: "700" }}>3 Completed</span>
    </div>
  );

  const floatingBadges = (
    <>
      <div className="float-anim-6" style={{ position: "absolute", bottom: "-4%", right: "18%", zIndex: 10 }}>
        <div className="floating-badge" style={{ backgroundColor: "#1e293b", border: "1px solid rgba(255, 255, 255, 0.15)", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(30, 41, 59, 0.35)", color: "#ffffff" }}>
          <Minimize2 size={16} />
        </div>
      </div>
    </>
  );

  return (
    <PremiumBrowserMockup url="pdfmount.online/dashboard" toolbar={toolbar} floatingBadges={floatingBadges}>
      <div style={{ position: "relative", width: "100%", maxWidth: "320px", height: "100%", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", gap: "6px" }}>
        {[
          { name: "tax_return_2026.pdf", size: "1.2 MB", status: "Compressed -70%" },
          { name: "contract_final_signed.pdf", size: "450 KB", status: "Signed" },
          { name: "invoice_merge.pdf", size: "2.1 MB", status: "Merged" }
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", border: "1px solid #f1f5f9", borderRadius: "4px", backgroundColor: "#f8fafc" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.55rem", fontWeight: "700", color: "#1e293b" }}>{f.name}</span>
              <span style={{ fontSize: "0.45rem", color: "#94a3b8" }}>{f.size}</span>
            </div>
            <span style={{ fontSize: "0.45rem", padding: "2px 6px", borderRadius: "9999px", backgroundColor: "#dcfce7", color: "#15803d", fontWeight: "700" }}>{f.status}</span>
          </div>
        ))}
      </div>
    </PremiumBrowserMockup>
  );
}

const whyChooseData = [
  {
    title: "Pro Tools",
    description: "Get powerful PDF tools and layouts that do exactly what you want, in one place.",
    icon: Star
  },
  {
    title: "Security First",
    description: "We respect your privacy. All your uploaded documents are automatically deleted after one hour.",
    icon: ShieldCheck
  },
  {
    title: "Loved Globally",
    description: "Designed for students, writers, and professionals who value privacy and simplicity.",
    icon: Users
  },
  {
    title: "Helpful Support",
    description: "Friendly help whenever you need it. We've got clear guides and a support team ready to assist.",
    icon: Headset
  },
  {
    title: "20+ PDF Tools",
    description: "More than 20 tools. Merge, compress, convert, edit, and sign PDFs without jumping between websites.",
    icon: FolderPlus
  },
  {
    title: "Clean & Simple",
    description: "No cluttered menus or complicated options — just click, process, and go.",
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
        width: "100%",
        height: "94%",
        left: "0%",
        top: "3%",
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
        width: "92%",
        height: "88%",
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
             {/* Brand favicon logo */}
             <img src="/favicon-16x16.png" alt="" style={{ width: "12px", height: "12px", borderRadius: "2px", objectFit: "contain" }} />
             <span>Pdfmount</span>
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
            pdfmount.online/edit
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
      <div className="float-anim-1" style={{ position: "absolute", top: "43%", left: "0%", zIndex: 10 }}>
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
      <div className="float-anim-2" style={{ position: "absolute", top: "-4%", left: "54%", zIndex: 10 }}>
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
      <div className="float-anim-3" style={{ position: "absolute", top: "2%", right: "10%", zIndex: 10 }}>
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
      <div className="float-anim-4" style={{ position: "absolute", top: "54%", right: "0%", zIndex: 10 }}>
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
      <div className="float-anim-5" style={{ position: "absolute", bottom: "16%", right: "0%", zIndex: 10 }}>
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
      <div className="float-anim-6" style={{ position: "absolute", bottom: "-4%", right: "18%", zIndex: 10 }}>
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
    document.getElementById("stitch-tools-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="stitch-landing">

      {/* ── HERO ── */}
      <section className="stitch-hero">
        <div className="stitch-hero-inner">
          {/* Left copy */}
          <div className="stitch-hero-copy">
            <h1>All PDF tools at your<br/>fingertips.</h1>
            <p className="stitch-hero-sub">
              Edit, convert, merge, and sign PDF documents in seconds.
              Professional-grade utilities wrapped in a minimalist, high-fidelity workspace.
            </p>
            <div className="stitch-hero-actions">
              <button className="stitch-pill-primary" onClick={scrollToTools}>
                Explore All Tools
              </button>
            </div>
          </div>

          {/* Right illustration — interactive-looking Canvas/Browser Mockup */}
          <div className="stitch-hero-illustration" style={{ width: "100%", height: "520px", display: "flex", position: "relative" }}>
            <div className="stitch-hero-glow" />
            <BrowserMockup />
          </div>
        </div>
      </section>

      {/* ── POPULAR TOOLS — Block Mint ── */}
      <section className="stitch-block-section stitch-block-mint" id="stitch-tools-section">
        <div className="stitch-container">
          <div className="stitch-block-header">
            <div>
              <h2 className="stitch-block-heading">Popular Utilities</h2>
            </div>
            <button className="stitch-pill-outline" onClick={scrollToTools}>
              See 20+ more
            </button>
          </div>

          <div className="stitch-tools-grid">
            {popularTools.map((tool) => {
              const toolColor = getToolColor(tool.id);
              return (
                <button
                  key={tool.id}
                  className="stitch-tool-card tool-card-hover"
                  onClick={() => onToolSelect(tool.name)}
                  style={{ "--tool-color": toolColor } as React.CSSProperties}
                >
                  <div className="stitch-tool-card-top">
                    <div 
                      className="stitch-tool-icon"
                      style={isMsOfficeTool(tool.id) ? { backgroundColor: "transparent", background: "none", border: "none" } : {}}
                    >
                      <ToolIcon toolNameOrId={tool.id} size={28} />
                    </div>
                    <span className="stitch-tool-category eyebrow" style={{ fontSize: "11px", marginBottom: 0, color: "rgba(0,0,0,0.35)" }}>
                      {tool.group || "PDF Tool"}
                    </span>
                  </div>
                  <h3 className="stitch-tool-name" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between", margin: "0 0 8px" }}>
                    <span>{tool.name}</span>
                    {tool.status === "beta" && (
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#d97706", fontWeight: "bold" }}>Beta</span>
                    )}
                  </h3>
                  <p className="stitch-tool-desc">{tool.description}</p>
                  <div className="stitch-tool-cta">
                    <span>Open Tool</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE / SIGNING — Block Lime ── */}
      <section className="stitch-block-section stitch-block-lime">
        <div className="stitch-container">
          <div className="stitch-split-section has-large-visual">
            {/* Left visual */}
            <div className="stitch-split-visual" style={{ width: "100%", height: "520px", display: "flex", position: "relative" }}>
              <PremiumSignatureMockup />
            </div>

            {/* Right copy */}
            <div className="stitch-split-copy">
              <h2 style={{ fontSize: "28px", fontWeight: 540, letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: "20px" }}>
                Secure Enterprise Signing for Modern Teams
              </h2>
              <p style={{ fontSize: "14px", fontWeight: 330, lineHeight: 1.6, color: "rgba(0,0,0,0.6)", marginBottom: "28px" }}>
                Collect legally binding signatures globally with end-to-end encryption.
                Our enterprise suite integrates with your favourite tools to automate
                document workflows effortlessly.
              </p>
              <ul className="stitch-feature-list">
                <li><Check size={18} /> AES-256 Bit Encryption</li>
                <li><Check size={18} /> Unlimited Signers &amp; Requests</li>
                <li><Check size={18} /> Audit Trail Documentation</li>
              </ul>
              <button className="stitch-pill-primary" onClick={() => onToolSelect("Sign PDF")}>
                Go Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES WALKTHROUGH ── */}
      <section className="stitch-features-section">
        <div className="stitch-container">
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 340, letterSpacing: "-0.8px" }}>
              Keep your simple tasks simple
            </h2>
          </div>

          {featuresData.map((feature, idx) => (
            <div className={`stitch-feature-row ${idx % 2 !== 0 ? "reverse" : ""} ${feature.id === "signature" ? "has-large-visual" : ""}`} key={feature.title}>
              <div className="stitch-feature-copy">
                <h3 style={{ fontSize: "28px", fontWeight: 540, letterSpacing: "-0.3px", marginBottom: "16px" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "14px", fontWeight: 320, lineHeight: 1.6, color: "rgba(0,0,0,0.6)", marginBottom: "24px" }}>
                  {feature.description}
                </p>
                <button
                  className="stitch-text-link"
                  onClick={scrollToTools}
                >
                  Start processing files <ArrowRight size={14} />
                </button>
              </div>

              <div className="stitch-feature-visual" style={{ width: "100%", height: "520px", display: "flex", position: "relative" }}>
                {feature.id === "editor" && <PremiumEditorMockup />}
                {feature.id === "signature" && <PremiumSignatureMockup />}
                {feature.id === "organizer" && <PremiumOrganizerMockup />}
                {feature.id === "dashboard" && <PremiumDashboardMockup />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE — Block Lilac ── */}
      <section className="stitch-block-section stitch-block-lilac">
        <div className="stitch-container">
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 340, letterSpacing: "-0.8px" }}>
              Built for real workflows.
            </h2>
          </div>

          <div className="stitch-why-grid">
            {whyChooseData.map((prop) => {
              const Icon = prop.icon;
              return (
                <div className="stitch-why-card" key={prop.title}>
                  <div className="stitch-why-icon">
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.2px" }}>{prop.title}</h3>
                  <p style={{ fontSize: "14px", fontWeight: 320, lineHeight: 1.6, color: "rgba(0,0,0,0.6)", margin: 0 }}>{prop.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="stitch-cta-section">
        <div className="stitch-container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 340, letterSpacing: "-0.96px", marginBottom: "20px" }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: "14px", fontWeight: 330, color: "rgba(0,0,0,0.55)", maxWidth: "560px", margin: "0 auto 40px" }}>
            Join professionals, students, and creators who trust Pdfmount.online for their daily document tasks.
          </p>
          <div className="stitch-cta-actions">
            <button className="stitch-pill-primary stitch-pill-lg" onClick={scrollToTools}>
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER — Dark Navy ── */}
      <Footer onToolSelect={onToolSelect} onViewChange={onViewChange} />
    </div>
  );
}

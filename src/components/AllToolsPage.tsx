import React from "react";
import { tools, sitemapGroups } from "../data/tools";
import { ToolIcon, getToolColor } from "./ToolIcon";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Footer } from "./Footer";

interface AllToolsPageProps {
  onToolSelect: (toolName: string) => void;
  onPricingClick: () => void;
  onContactSalesClick: () => void;
  onBack: () => void;
  onViewChange: (view: any) => void;
}

export function AllToolsPage({ onToolSelect, onPricingClick, onContactSalesClick, onBack, onViewChange }: AllToolsPageProps) {
  // We'll define a popular list matching the figma specs exactly:
  // PDF to Word, Merge PDF, JPG to PDF, Sign PDF, Split PDF, Compress PDF
  const popularTools = [
    { name: "PDF to Word", desc: "Convert documents with OCR precision, maintaining original layouts.", cat: "Conversion" },
    { name: "Merge PDF", desc: "Combine multiple files into a single, cohesive document.", cat: "Management" },
    { name: "JPG to PDF", desc: "Convert image galleries into clean, high-resolution PDF portfolios.", cat: "Media" },
    { name: "Sign PDF", desc: "Request signatures or sign documents yourself with eIDAS security.", cat: "Security" },
    { name: "Split PDF", desc: "Extract pages or split your PDF into independent files by range.", cat: "Management" },
    { name: "Compress PDF", desc: "Reduce file size dramatically while maintaining visual fidelity.", cat: "Optimization" }
  ];

  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--s-background, #f9f9f9)" }}>
      <div className="stitch-container" style={{ paddingTop: "60px" }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="stitch-pill-outline"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 20px", 
            fontSize: "14px", 
            marginBottom: "40px"
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Hero Section */}
        <div style={{ marginBottom: "64px", maxWidth: "900px" }}>
          <span className="eyebrow" style={{ color: "var(--s-secondary)", textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px", display: "block", marginBottom: "16px" }}>
            Ultimate Productivity
          </span>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 76px)", fontWeight: 340, letterSpacing: "-1.50px", lineHeight: 1.05, marginBottom: "24px", color: "var(--s-primary)" }}>
            All PDF tools at your fingertips.
          </h1>
          <p style={{ color: "var(--s-on-surface-variant)", fontSize: "22px", fontWeight: 320, lineHeight: 1.5, margin: 0, maxWidth: "700px" }}>
            Edit, convert, merge, and sign PDF documents in seconds. Professional-grade utilities wrapped in a minimalist, high-fidelity workspace.
          </p>
        </div>

        {/* Popular Utilities Block (Mint Block) */}
        <div 
          style={{ 
            backgroundColor: "var(--s-block-mint, #ADEFD1)", 
            borderRadius: "24px", 
            padding: "clamp(32px, 5vw, 64px)", 
            marginBottom: "64px",
            border: "1px solid var(--s-hairline)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <span className="eyebrow" style={{ textTransform: "uppercase", fontSize: "12px", color: "rgba(0,0,0,0.5)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                Suite Core
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 540, letterSpacing: "-0.5px", margin: 0, color: "var(--s-primary)" }}>
                Popular Utilities
              </h2>
            </div>
            <a 
              href="#sitemap" 
              className="stitch-pill-outline" 
              style={{ backgroundColor: "rgba(255,255,255,0.4)", borderColor: "var(--s-hairline)", color: "var(--s-primary)", fontSize: "14px" }}
            >
              See All {tools.filter(t => t.status !== "coming-soon").length} Tools
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {popularTools.map((pop) => {
              const matchedTool = tools.find(t => t.name === pop.name);
              const toolColor = matchedTool ? getToolColor(matchedTool.name) : "var(--s-primary)";
              return (
                <div 
                  key={pop.name} 
                  className="stitch-why-card" 
                  onClick={() => onToolSelect(pop.name)}
                  style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.8)", 
                    backdropFilter: "blur(8px)", 
                    cursor: "pointer", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-between", 
                    minHeight: "220px", 
                    padding: "32px", 
                    transition: "transform 0.2s, background-color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                      <div 
                        style={{ 
                          width: "56px", 
                          height: "56px", 
                          borderRadius: "12px", 
                          backgroundColor: "#ffffff", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          border: "1px solid var(--s-hairline)",
                          color: toolColor
                        }}
                      >
                        <ToolIcon toolNameOrId={pop.name} size={20} style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                      </div>
                      <span className="eyebrow" style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", textTransform: "uppercase", fontWeight: "600" }}>{pop.cat}</span>
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "8px", color: "var(--s-primary)", letterSpacing: "-0.2px" }}>{pop.name}</h3>
                    <p style={{ fontSize: "14px", fontWeight: 320, color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>{pop.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--s-primary)", fontWeight: "600", fontSize: "14px", marginTop: "24px" }}>
                    <span>Open Tool</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enterprise Signing Banner (Block Lime) */}
        <div 
          style={{ 
            backgroundColor: "var(--s-block-lime, #D3F57B)", 
            borderRadius: "24px", 
            padding: "clamp(32px, 5vw, 64px)", 
            marginBottom: "84px",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "48px",
            alignItems: "center",
            border: "1px solid var(--s-hairline)"
          }}
        >
          <div style={{ flex: "1 1 350px", display: "flex", justifyContent: "center" }}>
            <div 
              style={{ 
                backgroundColor: "#ffffff", 
                borderRadius: "16px", 
                padding: "24px", 
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)", 
                border: "1px solid var(--s-hairline)",
                width: "100%",
                maxWidth: "400px" 
              }}
            >
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }}></span>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#eab308" }}></span>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }}></span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ height: "12px", width: "35%", backgroundColor: "var(--s-surface-low)", borderRadius: "4px" }}></div>
                <div style={{ height: "8px", width: "80%", backgroundColor: "var(--s-surface-low)", borderRadius: "4px" }}></div>
                <div style={{ height: "1px", backgroundColor: "var(--s-hairline-soft)", margin: "8px 0" }}></div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--s-block-mint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: "bold" }}>✓</span>
                  </div>
                  <div style={{ flex: 1, height: "8px", backgroundColor: "var(--s-surface-low)", borderRadius: "4px" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: "1 1 400px" }}>
            <span className="eyebrow" style={{ color: "rgba(0,0,0,0.5)", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "16px" }}>
              Premium Feature
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 540, letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: "20px", color: "var(--s-primary)" }}>
              Secure Enterprise Signing for Modern Teams
            </h2>
            <p style={{ color: "var(--s-on-surface-variant)", fontSize: "16px", fontWeight: 320, lineHeight: 1.6, marginBottom: "28px" }}>
              Collect legally binding signatures globally with end-to-end encryption. Our enterprise suite integrates with your favorite tools to automate document workflows effortlessly.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["AES-256 Bit Encryption", "Unlimited Signers & Requests", "Audit Trail Documentation"].map(feat => (
                <li key={feat} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "500" }}>
                  <CheckCircle2 size={18} style={{ color: "var(--s-primary)" }} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={onContactSalesClick}
              className="stitch-pill-primary" 
              style={{ padding: "14px 36px", fontSize: "16px" }}
            >
              Go Enterprise
            </button>
          </div>
        </div>

        {/* Structured Sitemap Directory */}
        <div id="sitemap" style={{ borderTop: "1px solid var(--s-hairline)", paddingTop: "64px", marginBottom: "80px" }}>
          <div style={{ marginBottom: "40px" }}>
            <span className="eyebrow" style={{ textTransform: "uppercase", fontSize: "12px", color: "var(--s-secondary)", fontWeight: "600", display: "block", marginBottom: "8px" }}>
              Suite Index
            </span>
            <h2 style={{ fontSize: "32px", fontWeight: 540, letterSpacing: "-0.5px", margin: 0, color: "var(--s-primary)" }}>
              Browse all {tools.filter(t => t.status !== "coming-soon").length} available tools
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "40px 30px" }}>
            {sitemapGroups.map(group => {
              const groupTools = tools.filter(t => t.sitemapGroup === group && t.status !== "coming-soon");
              return (
                <div key={group} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--s-secondary)", borderBottom: "1px solid var(--s-hairline)", paddingBottom: "10px", margin: 0 }}>
                    {group}
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {groupTools.map(tool => {
                      const toolColor = getToolColor(tool.name);
                      const isBeta = tool.status === "beta";
                      return (
                        <li key={tool.id}>
                          <a 
                            href={`#${tool.id}`} 
                            onClick={(e) => { e.preventDefault(); onToolSelect(tool.name); }}
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "8px", 
                              textDecoration: "none", 
                              color: "var(--s-on-surface)", 
                              fontSize: "14px", 
                              fontWeight: "450", 
                              padding: "4px 0",
                              transition: "color 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = toolColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--s-on-surface)"}
                          >
                            <ToolIcon toolNameOrId={tool.name} size={14} style={{ width: "22px", height: "22px", borderRadius: "5px" }} />
                            <span>{tool.name}</span>
                            {isBeta && (
                              <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#d97706", fontWeight: "bold", marginLeft: "4px" }}>Beta</span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Block */}
        <div 
          style={{ 
            backgroundColor: "var(--s-primary)", 
            color: "var(--s-on-primary)", 
            borderRadius: "24px", 
            padding: "clamp(48px, 6vw, 96px)", 
            textAlign: "center",
            marginBottom: "80px"
          }}
        >
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 340, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "24px" }}>
            Ready to streamline your workflow?
          </h2>
          <p style={{ opacity: 0.7, fontSize: "18px", fontWeight: 320, maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.5 }}>
            Join professionals, students, and creators who trust Pdfmount.online for their daily document tasks.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => onToolSelect("Merge PDF")} 
              className="stitch-pill-outline" 
              style={{ backgroundColor: "#ffffff", borderColor: "#ffffff", color: "var(--s-primary)", padding: "16px 40px", fontSize: "16px" }}
            >
              Get Started for Free
            </button>
            <button 
              onClick={onContactSalesClick}
              className="stitch-pill-outline" 
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", padding: "16px 40px", fontSize: "16px" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Contact Sales
            </button>
          </div>
          <p className="eyebrow" style={{ fontSize: "11px", opacity: 0.5, marginTop: "24px", textTransform: "uppercase", letterSpacing: "1px" }}>
            No credit card required
          </p>
        </div>

      </div>
      <Footer onToolSelect={onToolSelect} onViewChange={onViewChange} />
    </div>
  );
}

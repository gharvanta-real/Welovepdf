import { tools, sitemapGroups } from "../data/tools";
import { FileUp, ShieldCheck, Check, ArrowRight, ChevronRight, Award, Users, Star, Headset, FolderPlus } from "lucide-react";
import React from "react";
import { ToolIcon, getToolColor } from "./ToolIcon";

type LandingPageProps = {
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: "home" | "pricing" | "privacy" | "terms" | "faq" | "contact") => void;
};

const popularToolIds = ["pdf-word", "merge", "jpg-pdf", "esign", "split", "compress"];

const featuresData = [
  {
    title: "Work directly on your files",
    description: "View, redact, or organize your PDFs with our easy-to-use tools. Adjust page layout boundaries and verify document integrity in real-time.",
    illustrationText: "Document Editor Preview"
  },
  {
    title: "Digital signatures made easy",
    description: "Fill out forms, stamp pages, and electronically sign your contracts in seconds. Zero compliance issues, fully secure, and private by design.",
    illustrationText: "Secure Signatures Workspace"
  },
  {
    title: "Create the perfect document",
    description: "Merge multiple marksheets, split application forms, or extract ranges into stable files. All structural conversions run without rasterizing your vector graphics.",
    illustrationText: "Merge & Page Organizer"
  },
  {
    title: "Manage your work in one place",
    description: "Keep track of all your recent conversions in a single session dashboard. Download outputs instantly or chain tools together without re-uploading.",
    illustrationText: "Session Dashboard Queue"
  }
];

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
    <div className="browser-mockup-wrapper">
      {/* Decorative background cards */}
      <div className="bg-card bg-card-1"></div>
      <div className="bg-card bg-card-2"></div>
      <div className="bg-card bg-card-3"></div>
      
      {/* Browser Frame */}
      <div className="mock-browser">
        <div className="mock-browser-header">
          <div className="browser-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="browser-tab">
            <div className="brand-logo-grid mini">
              <span style={{ backgroundColor: "#1e3a8a" }}></span>
              <span style={{ backgroundColor: "#1d4ed8" }}></span>
              <span style={{ backgroundColor: "#2563eb" }}></span>
              <span style={{ backgroundColor: "#3b82f6" }}></span>
              <span style={{ backgroundColor: "#0074f0" }}></span>
              <span style={{ backgroundColor: "#60a5fa" }}></span>
              <span style={{ backgroundColor: "#93c5fd" }}></span>
              <span style={{ backgroundColor: "#0284c7" }}></span>
              <span style={{ backgroundColor: "#0ea5e9" }}></span>
            </div>
            <span className="tab-title">WeLovePDF</span>
          </div>
          <div className="browser-address">welovepdf.com/edit</div>
        </div>
        
        {/* Mock Toolbar */}
        <div className="mock-editor-toolbar">
          <div className="toolbar-icon active" title="Select">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </div>
          <div className="toolbar-icon" title="Text">
            <span style={{ fontSize: "12px", fontWeight: "600" }}>T</span>
          </div>
          <div className="toolbar-icon" title="Draw">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <div className="toolbar-icon" title="Highlight">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="toolbar-icon" title="Shape">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <div className="toolbar-icon" title="Signature">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 20H4" />
              <path d="M12 4v12" />
              <path d="m8 12 4 4 4-4" />
            </svg>
          </div>
          <div className="toolbar-divider"></div>
          <div className="toolbar-icon disabled" title="Undo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </div>
          <div className="toolbar-icon disabled" title="Redo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
          </div>
        </div>
        
        {/* Document Canvas */}
        <div className="mock-doc-canvas">
          <div className="canvas-page">
            {/* Horizontal lines simulating text paragraphs */}
            <div className="canvas-line" style={{ width: "90%" }}></div>
            <div className="canvas-line" style={{ width: "80%" }}></div>
            <div className="canvas-line" style={{ width: "85%" }}></div>
            
            {/* Text selection box "Hello!" */}
            <div className="mock-selection-box text-selection">
              <span className="selection-label">Hello!</span>
              <span className="handle tl"></span>
              <span className="handle tr"></span>
              <span className="handle bl"></span>
              <span className="handle br"></span>
            </div>
            
            <div className="canvas-line" style={{ width: "95%", marginTop: "24px" }}></div>
            <div className="canvas-line" style={{ width: "70%" }}></div>
            
            {/* Shape selection circle */}
            <div className="mock-selection-box shape-selection">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <ellipse cx="50" cy="50" rx="46" ry="46" fill="#cbe0ff" fillOpacity="0.4" stroke="#0074f0" strokeWidth="1.5" />
              </svg>
              <span className="handle tl"></span>
              <span className="handle tr"></span>
              <span className="handle bl"></span>
              <span className="handle br"></span>
            </div>
            
            <div className="canvas-line" style={{ width: "88%", marginTop: "28px" }}></div>
            <div className="canvas-line" style={{ width: "60%" }}></div>
            
            {/* Signature scribble */}
            <div className="mock-signature-scribble">
              <svg viewBox="0 0 120 40" fill="none" stroke="#0074f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10,25 C25,18 35,8 48,22 C58,35 62,15 72,18 C82,21 88,32 98,16" />
                <path d="M30,26 C42,26 68,27 88,25" />
              </svg>
              <span className="handle tl"></span>
              <span className="handle tr"></span>
              <span className="handle bl"></span>
              <span className="handle br"></span>
            </div>
            
            {/* Cursor */}
            <div className="mock-mouse-cursor">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.5,3v15.2l3.9-3.9l2.8,6.8l2.9-1.2l-2.8-6.8l5.2,0.1L4.5,3z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Badges */}
      <div className="floating-badge badge-cyan float-badge-1" title="Annotate PDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
        </svg>
      </div>
      <div className="floating-badge badge-purple float-badge-2" title="Merge PDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      </div>
      <div className="floating-badge badge-pink float-badge-3" title="eSign PDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
      <div className="floating-badge badge-yellow float-badge-4" title="JPG to PDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      <div className="floating-badge badge-blue float-badge-5" title="Word to PDF">
        <span style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>W</span>
      </div>
      <div className="floating-badge badge-red float-badge-6" title="Compress PDF">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 14h6v6" />
          <path d="M20 10h-6V4" />
          <path d="M14 10l7-7" />
          <path d="M10 14l-7 7" />
        </svg>
      </div>
      
      {/* Extra floating shapes */}
      <span className="deco-shape deco-plus-1">+</span>
      <span className="deco-shape deco-plus-2">+</span>
      <span className="deco-shape deco-circle-1"></span>
      <span className="deco-shape deco-circle-2"></span>
      <span className="deco-shape deco-circle-3"></span>
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
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <div className="window-body">
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  {feature.illustrationText}
                </div>
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

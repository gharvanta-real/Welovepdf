import { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, X, Menu, LayoutGrid } from "lucide-react";
import { ToolIcon, getToolColor } from "./ToolIcon";
import { tools } from "../data/tools";

type HeaderProps = {
  onLogoClick: () => void;
  onToolSelect: (toolName: string) => void;
  onLoginClick: () => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
  onAvatarClick: () => void;
  onPricingClick: () => void;
  onToolsClick?: () => void;
  onContactSalesClick?: () => void;
  onWorkspaceClick?: () => void;
};

interface DropdownItem { name: string; }
interface DropdownGroup { title: string; items: DropdownItem[]; }

const dropdownColumns: DropdownGroup[][] = [
  [
    { title: "Optimize", items: [{ name: "Compress PDF" }, { name: "Flatten PDF" }, { name: "Repair PDF" }] }
  ],
  [
    { title: "Page Operations", items: [
      { name: "Merge PDF" }, 
      { name: "Split PDF" }, 
      { name: "Rotate PDF" }, 
      { name: "Remove Pages" }, 
      { name: "Extract Pages" }, 
      { name: "Organize PDF" },
      { name: "Crop PDF" },
      { name: "Page Numbers" },
      { name: "PDF Annotator" },
      { name: "Document Editor" }
    ] }
  ],
  [
    { title: "Convert to PDF", items: [{ name: "Word to PDF" }, { name: "Excel to PDF" }, { name: "PPT to PDF" }, { name: "JPG to PDF" }, { name: "HTML to PDF" }, { name: "TXT to PDF" }] }
  ],
  [
    { title: "Convert from PDF", items: [{ name: "PDF to Word" }, { name: "PDF to Excel" }, { name: "PDF to PPT" }, { name: "PDF to JPG" }] },
    { title: "Sign & Protect", items: [
      { name: "Sign PDF" }, 
      { name: "Unlock PDF" }, 
      { name: "Protect PDF" }, 
      { name: "Watermark PDF" },
      { name: "Bates Numbering" }
    ] }
  ]
];

// Flatten all tools for mobile menu
const allNavLinks = [
  { label: "Convert", tool: "PDF to Word" },
  { label: "Compress", tool: "Compress PDF" },
  { label: "Merge", tool: "Merge PDF" },
  { label: "Edit", tool: "Organize PDF" },
  { label: "Sign", tool: "Sign PDF" },
];

export function Header({ 
  onLogoClick, 
  onToolSelect, 
  onLoginClick, 
  currentUser, 
  onLogout, 
  onAvatarClick, 
  onPricingClick,
  onToolsClick,
  onContactSalesClick,
  onWorkspaceClick
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 860) {
        setIsMobileMenuOpen(false);
        setMobileToolsExpanded(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) { setIsDropdownOpen(false); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  function handleToolSelect(toolName: string) {
    onToolSelect(toolName);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setMobileToolsExpanded(false);
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {/* Logo */}
          <a
            className="stitch-brand"
            href="#home"
            aria-label="Pdfmount.online home"
            onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); setIsMobileMenuOpen(false); onLogoClick(); }}
            style={{ display: "flex", alignItems: "center" }}
          >
            <img src="/logo.png" alt="Pdfmount.online" style={{ height: "30px", width: "auto", objectFit: "contain" }} />
          </a>

          {/* Desktop Center nav */}
          <nav className="stitch-nav stitch-nav-desktop">
            {/* Tools dropdown trigger */}
            <div className="nav-dropdown-trigger" ref={triggerRef}>
              <button
                className={`stitch-nav-link stitch-nav-tools ${isDropdownOpen ? "active" : ""}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
              >
                <LayoutGrid size={14} style={{ opacity: 0.8 }} />
                Tools
                <ChevronDown size={13} style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {isDropdownOpen && (
                <div className="mega-dropdown" ref={dropdownRef}>
                  <div className="mega-dropdown-inner">
                    {dropdownColumns.map((column, colIdx) => (
                      <div className="mega-column" key={colIdx}>
                        {column.map((group, groupIdx) => (
                          <div className="mega-group" key={groupIdx}>
                            <h4 className="mega-group-title">{group.title}</h4>
                            <ul className="mega-group-list">
                              {group.items.map((item, itemIdx) => {
                                const toolColor = getToolColor(item.name);
                                const softBg = `color-mix(in srgb, ${toolColor} 12%, var(--s-surface-low))`;
                                const matchedTool = tools.find(t => t.name === item.name);
                                const isComingSoon = matchedTool?.status === "coming-soon";
                                const isBeta = matchedTool?.status === "beta";
                                return (
                                  <li key={itemIdx}>
                                    <a
                                      href={`#${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                                      className="mega-item"
                                      style={{
                                        "--icon-color-strong": isComingSoon ? "#94a3b8" : toolColor,
                                        "--icon-bg-soft": isComingSoon ? "#f1f5f9" : softBg,
                                        opacity: isComingSoon ? 0.55 : 1,
                                        cursor: isComingSoon ? "not-allowed" : "pointer",
                                      } as React.CSSProperties}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (isComingSoon) {
                                          alert("This tool is coming soon in a future release! Please stay tuned.");
                                          return;
                                        }
                                        handleToolSelect(item.name);
                                      }}
                                    >
                                      <ToolIcon toolNameOrId={item.name} size={14} className="mega-icon" style={{ width: "22px", height: "22px", borderRadius: "5px", opacity: isComingSoon ? 0.6 : 1 }} />
                                      <span className="mega-item-name" style={{ color: isComingSoon ? "#64748b" : "inherit" }}>{item.name}</span>
                                      {isComingSoon && (
                                        <span style={{ marginLeft: "auto", fontSize: "10px", padding: "1px 5px", borderRadius: "4px", backgroundColor: "#e2e8f0", color: "#64748b", fontWeight: "bold" }}>Soon</span>
                                      )}
                                      {isBeta && (
                                        <span style={{ marginLeft: "auto", fontSize: "10px", padding: "1px 5px", borderRadius: "4px", backgroundColor: "#fef3c7", color: "#d97706", fontWeight: "bold" }}>Beta</span>
                                      )}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mega-dropdown-footer">
                    <a 
                      href="#all-tools" 
                      className="mega-dropdown-footer-link"
                      onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolsClick?.(); }}
                    >
                      Browse All Tools <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Use Tools Links */}
            <a className="stitch-nav-link" href="#pdf-to-word" onClick={(e) => { e.preventDefault(); handleToolSelect("PDF to Word"); }}>Convert</a>
            <a className="stitch-nav-link" href="#compress" onClick={(e) => { e.preventDefault(); handleToolSelect("Compress PDF"); }}>Compress</a>
            <a className="stitch-nav-link" href="#merge" onClick={(e) => { e.preventDefault(); handleToolSelect("Merge PDF"); }}>Merge</a>
            <a className="stitch-nav-link" href="#organize" onClick={(e) => { e.preventDefault(); handleToolSelect("Organize PDF"); }}>Edit</a>
            <a className="stitch-nav-link" href="#esign" onClick={(e) => { e.preventDefault(); handleToolSelect("Sign PDF"); }}>Sign</a>
          </nav>
        </div>

        {/* Right actions */}
        <div className="stitch-header-actions">
          {/* Workspace & Pricing Links (Desktop Only) */}
          <div className="stitch-desktop-only" style={{ display: "flex", alignItems: "center", gap: "20px", marginRight: "8px" }}>
            <a 
              className="stitch-nav-link" 
              href="#pricing" 
              onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onPricingClick(); }}
            >
              Pricing
            </a>
            {currentUser && (
              <a 
                className="stitch-nav-link" 
                href="#workspace" 
                style={{ fontWeight: "600" }} 
                onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onWorkspaceClick?.(); }}
              >
                My Workspace
              </a>
            )}
          </div>

          {!currentUser ? (
            <>
              <button
                className="stitch-login-btn stitch-desktop-only"
                onClick={() => { setIsDropdownOpen(false); onLoginClick(); }}
              >
                Log In
              </button>
              <button
                className="stitch-cta-btn"
                onClick={() => { setIsDropdownOpen(false); onLoginClick(); }}
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              className="header-avatar-btn"
              onClick={onAvatarClick}
              title={`Account: ${currentUser.email}`}
              aria-label="Open account menu"
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
            >
              <div className="user-avatar dynamic-avatar-gradient" style={{ color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "55%", height: "55%" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? "is-open" : ""}`}>
        <div className="mobile-menu-header">
          <span className="stitch-brand" style={{ fontSize: "16px" }}>Pdfmount.online</span>
          <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          {/* Quick Links */}
          <div className="mobile-nav-section">
            <span className="mobile-nav-label">Quick Tools</span>
            <div className="mobile-nav-links">
              {allNavLinks.map(({ label, tool }) => (
                <button key={tool} className="mobile-nav-link" onClick={() => handleToolSelect(tool)}>
                  {label}
                </button>
              ))}
              {currentUser && (
                <button className="mobile-nav-link" style={{ fontWeight: 600 }} onClick={() => { setIsMobileMenuOpen(false); onWorkspaceClick?.(); }}>
                  My Workspace
                </button>
              )}
            </div>
          </div>

          {/* All Tools Expandable */}
          <div className="mobile-nav-section">
            <button 
              className="mobile-nav-expand-btn"
              onClick={() => setMobileToolsExpanded(!mobileToolsExpanded)}
            >
              <span>All Tools</span>
              <ChevronDown size={16} style={{ transform: mobileToolsExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>
            {mobileToolsExpanded && (
              <div className="mobile-tools-grid">
                {dropdownColumns.flat().flatMap(group => group.items).map((item) => {
                  const toolColor = getToolColor(item.name);
                  return (
                    <button
                      key={item.name}
                      className="mobile-tool-item"
                      onClick={() => handleToolSelect(item.name)}
                      style={{ "--tool-color": toolColor } as React.CSSProperties}
                    >
                      <ToolIcon toolNameOrId={item.name} size={16} style={{ width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0 }} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auth Action */}
          {!currentUser ? (
            <div className="mobile-nav-section mobile-auth-section">
              <button className="mobile-auth-btn-primary" onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}>
                Get Started — Free
              </button>
              <button className="mobile-auth-btn-ghost" onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }}>
                Log In
              </button>
            </div>
          ) : (
            <div className="mobile-nav-section mobile-auth-section">
              <button className="mobile-auth-btn-ghost" onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}>
                Log Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

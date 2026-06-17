import { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { ToolIcon, getToolColor } from "./ToolIcon";

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
    { title: "Optimize", items: [{ name: "Compress PDF" }, { name: "Flatten PDF" }, { name: "Repair PDF" }] },
    { title: "AI Intelligence", items: [{ name: "AI Document Copilot" }, { name: "Summarize PDF" }, { name: "Translate PDF" }] }
  ],
  [
    { title: "Page Operations", items: [{ name: "Merge PDF" }, { name: "Split PDF" }, { name: "Rotate PDF" }, { name: "Remove Pages" }, { name: "Extract Pages" }, { name: "Organize PDF" }] }
  ],
  [
    { title: "Convert to PDF", items: [{ name: "Word to PDF" }, { name: "Excel to PDF" }, { name: "PPT to PDF" }, { name: "JPG to PDF" }, { name: "HTML to PDF" }, { name: "TXT to PDF" }] }
  ],
  [
    { title: "Convert from PDF", items: [{ name: "PDF to Word" }, { name: "PDF to Excel" }, { name: "PDF to PPT" }, { name: "PDF to JPG" }] },
    { title: "Sign & Protect", items: [{ name: "Sign PDF" }, { name: "Unlock PDF" }, { name: "Protect PDF" }, { name: "PDF OCR" }] }
  ]
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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
      if (event.key === "Escape") setIsDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="app-header">
      {/* Logo */}
      <a
        className="stitch-brand"
        href="#home"
        aria-label="WeLovePDF home"
        onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onLogoClick(); }}
      >
        WeLovePDF
      </a>

      {/* Center nav */}
      <nav className="stitch-nav">
        {/* Tools dropdown trigger */}
        <div className="nav-dropdown-trigger" ref={triggerRef}>
          <button
            className={`stitch-nav-link stitch-nav-tools ${isDropdownOpen ? "active" : ""}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
            </svg>
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
                            return (
                              <li key={itemIdx}>
                                <a
                                  href={`#${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                                  className="mega-item"
                                  style={{ "--item-hover-bg": `color-mix(in srgb, ${toolColor} 8%, var(--s-surface-soft))` } as React.CSSProperties}
                                  onClick={(e) => { e.preventDefault(); onToolSelect(item.name); setIsDropdownOpen(false); }}
                                >
                                  <ToolIcon toolNameOrId={item.name} size={14} className="mega-icon" style={{ width: "22px", height: "22px", borderRadius: "5px" }} />
                                  <span className="mega-item-name">{item.name}</span>
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
              <div 
                style={{ 
                  borderTop: "1px solid var(--s-hairline)", 
                  padding: "16px 24px", 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  backgroundColor: "var(--s-surface-soft)" 
                }}
              >
                <a 
                  href="#all-tools" 
                  onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolsClick?.(); }}
                  style={{ fontSize: "14px", fontWeight: "600", color: "var(--s-primary)", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                >
                  Browse All 24 Tools <ArrowRight size={14} />
                </a>
              </div>
            </div>
          )}
        </div>

        {currentUser && (
          <a className="stitch-nav-link" href="#workspace" style={{ fontWeight: "600" }} onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onWorkspaceClick?.(); }}>My Workspace</a>
        )}
        <a className="stitch-nav-link" href="#pricing" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onPricingClick(); }}>Pricing</a>
        <a className="stitch-nav-link" href="#contact-sales" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onContactSalesClick?.(); }}>Contact Sales</a>
      </nav>

      {/* Right actions */}
      <div className="stitch-header-actions">
        {!currentUser ? (
          <>
            <button
              className="stitch-login-btn"
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
            <div className="user-avatar" style={{ background: "var(--s-primary)", color: "var(--s-on-primary)" }}>
              {currentUser.name ? currentUser.name[0].toUpperCase() : currentUser.email[0].toUpperCase()}
            </div>
          </button>
        )}
      </div>
    </header>
  );
}

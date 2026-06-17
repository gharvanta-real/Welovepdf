import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { ToolIcon, getToolColor } from "./ToolIcon";

type HeaderProps = {
  onLogoClick: () => void;
  onToolSelect: (toolName: string) => void;
  onLoginClick: () => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
  onAvatarClick: () => void;
  onPricingClick: () => void;
};

interface DropdownItem {
  name: string;
}

interface DropdownGroup {
  title: string;
  items: DropdownItem[];
}

const dropdownColumns: DropdownGroup[][] = [
  // Column 1: Optimize & Smart AI
  [
    {
      title: "Optimize",
      items: [
        { name: "Compress PDF" },
        { name: "Flatten PDF" },
        { name: "Repair PDF" }
      ]
    },
    {
      title: "AI Intelligence",
      items: [
        { name: "AI Document Copilot" },
        { name: "Summarize PDF" },
        { name: "Translate PDF" }
      ]
    }
  ],
  // Column 2: Organize & Manage
  [
    {
      title: "Page Operations",
      items: [
        { name: "Merge PDF" },
        { name: "Split PDF" },
        { name: "Rotate PDF" },
        { name: "Remove Pages" },
        { name: "Extract Pages" },
        { name: "Organize PDF" }
      ]
    }
  ],
  // Column 4: Create PDF (Convert To)
  [
    {
      title: "Convert to PDF",
      items: [
        { name: "Word to PDF" },
        { name: "Excel to PDF" },
        { name: "PPT to PDF" },
        { name: "JPG to PDF" },
        { name: "HTML to PDF" },
        { name: "TXT to PDF" }
      ]
    }
  ],
  // Column 5: Export & Security
  [
    {
      title: "Convert from PDF",
      items: [
        { name: "PDF to Word" },
        { name: "PDF to Excel" },
        { name: "PDF to PPT" },
        { name: "PDF to JPG" }
      ]
    },
    {
      title: "Sign & Protect",
      items: [
        { name: "Sign PDF" },
        { name: "Unlock PDF" },
        { name: "Protect PDF" },
        { name: "PDF OCR" }
      ]
    }
  ]
];

export function Header({ onLogoClick, onToolSelect, onLoginClick, currentUser, onLogout, onAvatarClick, onPricingClick }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <a 
          className="brand" 
          href="#home" 
          aria-label="WeLovePDF home"
          onClick={(e) => {
            e.preventDefault();
            setIsDropdownOpen(false);
            onLogoClick();
          }}
        >
          <div className="brand-logo-grid">
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
          <span className="brand-name">WeLovePDF</span>
        </a>
      </div>

      <div className="header-right">
        <nav className="top-nav">
          <div className="nav-dropdown-trigger" ref={triggerRef}>
            <a 
              href="#tools" 
              onClick={(e) => {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }} 
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
              className={`nav-dropdown-btn ${isDropdownOpen ? "active" : ""}`}
            >
              <span className="grid-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </span>
              Tools <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </a>

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
                                    style={{
                                      "--item-hover-bg": `color-mix(in srgb, ${toolColor} 8%, var(--c-bg))`
                                    } as React.CSSProperties}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onToolSelect(item.name);
                                      setIsDropdownOpen(false);
                                    }}
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
              </div>
            )}
          </div>
          <a href="#compress" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolSelect("Compress PDF"); }}>Compress</a>
          <a href="#convert" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolSelect("JPG to PDF"); }}>Convert</a>
          <a href="#merge" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolSelect("Merge PDF"); }}>Merge</a>
          <a href="#sign" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolSelect("Sign PDF"); }}>Sign</a>
          <a href="#ai-pdf" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onToolSelect("Summarize PDF"); }}>AI PDF</a>
          {!currentUser && (
            <button 
              className="primary-button login-btn" 
              onClick={(e) => { e.preventDefault(); setIsDropdownOpen(false); onLoginClick(); }}
              style={{ fontSize: "0.75rem", padding: "6px 18px", minHeight: "32px" }}
            >
              Log In
            </button>
          )}
        </nav>
        {currentUser && (
          <button 
            className="header-avatar-btn" 
            onClick={onAvatarClick}
            title={`Account: ${currentUser.email}`}
            aria-label="Open account menu"
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <div className="user-avatar" style={{ backgroundColor: "#0074f0" }}>
              {currentUser.name ? currentUser.name[0].toUpperCase() : currentUser.email[0].toUpperCase()}
            </div>
          </button>
        )}
      </div>
    </header>
  );
}

import React, { useState } from "react";

interface FooterV2Props {
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
  onLogoClick: () => void;
}

export function FooterV2({ onToolSelect, onViewChange, onLogoClick }: FooterV2Props) {
  const [activeTab, setActiveTab] = useState("popular");

  const handleLink = (e: React.MouseEvent, view: any) => {
    e.preventDefault();
    onViewChange(view);
  };

  // Define tab data structures with only our own supported tools
  const footerTabs = [
    {
      id: "popular",
      label: "Popular Tools",
      links: [
        { name: "Merge PDF", action: "Merge PDF", route: "/merge-pdf" },
        { name: "Split PDF", action: "Split PDF", route: "/split-pdf" },
        { name: "Compress PDF", action: "Compress PDF", route: "/compress-pdf" },
        { name: "PDF to Word", action: "PDF to Word", route: "/pdf-to-word" },
        { name: "Word to PDF", action: "Word to PDF", route: "/word-to-pdf" },
        { name: "JPG to PDF", action: "JPG to PDF", route: "/jpg-to-pdf" },
        { name: "PDF to JPG", action: "PDF to JPG", route: "/pdf-to-jpg" },
        { name: "Sign PDF", action: "Sign PDF", route: "/sign-pdf" },
        { name: "Protect PDF", action: "Protect PDF", route: "/protect-pdf" },
        { name: "Page Numbers", action: "Page Numbers", route: "/page-numbers" },
        { name: "Organize PDF", action: "Organize PDF", route: "/organize-pdf" },
        { name: "PDF Annotator", action: "PDF Annotator", route: "/pdf-annotator" },
      ]
    },
    {
      id: "convert",
      label: "Convert PDF",
      links: [
        { name: "Word to PDF", action: "Word to PDF", route: "/word-to-pdf" },
        { name: "Excel to PDF", action: "Excel to PDF", route: "/excel-pdf" },
        { name: "PPT to PDF", action: "PPT to PDF", route: "/ppt-pdf" },
        { name: "JPG to PDF", action: "JPG to PDF", route: "/jpg-to-pdf" },
        { name: "HTML to PDF", action: "HTML to PDF", route: "/html-pdf" },
        { name: "TXT to PDF", action: "TXT to PDF", route: "/txt-pdf" },
        { name: "PDF to Word", action: "PDF to Word", route: "/pdf-to-word" },
        { name: "PDF to Excel", action: "PDF to Excel", route: "/pdf-excel" },
        { name: "PDF to PPT", action: "PDF to PPT", route: "/pdf-ppt" },
        { name: "PDF to JPG", action: "PDF to JPG", route: "/pdf-to-jpg" },
        { name: "PDF to PNG", action: "PDF to PNG", route: "/pdf-png" },
        { name: "PDF to TXT", action: "PDF to TXT", route: "/pdf-txt" },
        { name: "PDF to HTML", action: "PDF to HTML", route: "/pdf-html" },
      ]
    },
    {
      id: "organize",
      label: "Organize & Edit",
      links: [
        { name: "Merge PDF", action: "Merge PDF", route: "/merge-pdf" },
        { name: "Split PDF", action: "Split PDF", route: "/split-pdf" },
        { name: "Compress PDF", action: "Compress PDF", route: "/compress-pdf" },
        { name: "Organize PDF", action: "Organize PDF", route: "/organize-pdf" },
        { name: "Rotate PDF", action: "Rotate PDF", route: "/rotate-pdf" },
        { name: "Remove Pages", action: "Remove Pages", route: "/remove-pages" },
        { name: "Extract Pages", action: "Extract Pages", route: "/extract-pages" },
        { name: "Crop PDF", action: "Crop PDF", route: "/crop-pdf" },
        { name: "Flatten PDF", action: "Flatten PDF", route: "/flatten-pdf" },
        { name: "Repair PDF", action: "Repair PDF", route: "/repair-pdf" },
        { name: "Grayscale PDF", action: "Grayscale PDF", route: "/grayscale-pdf" },
        { name: "Optimize PDF", action: "Optimize PDF", route: "/optimize-pdf" },
        { name: "Page Numbers", action: "Page Numbers", route: "/page-numbers" },
        { name: "PDF Annotator", action: "PDF Annotator", route: "/pdf-annotator" },
        { name: "Header & Footer", action: "Header & Footer", route: "/header-footer-pdf" },
        { name: "Resize PDF Pages", action: "Resize PDF Pages", route: "/resize-pdf" },
        { name: "Document Editor", action: "Document Editor", route: "/document-editor" },
      ]
    },
    {
      id: "secure",
      label: "Sign & Secure",
      links: [
        { name: "Sign PDF", action: "Sign PDF", route: "/sign-pdf" },
        { name: "Unlock PDF", action: "Unlock PDF", route: "/unlock-pdf" },
        { name: "Protect PDF", action: "Protect PDF", route: "/protect-pdf" },
        { name: "Watermark PDF", action: "Watermark PDF", route: "/watermark-pdf" },
        { name: "Bates Numbering", action: "Bates Numbering", route: "/bates-numbering" },
        { name: "Edit PDF Metadata", action: "Edit PDF Metadata", route: "/edit-pdf-metadata" },
        { name: "PDF OCR", action: "PDF OCR", route: "/ocr-pdf" },
      ]
    }
  ];

  const activeTabObj = footerTabs.find(t => t.id === activeTab) || footerTabs[0];

  return (
    <footer className="v2-footer-wrapper">
      {/* Dynamic Styling matches Booking.com precisely */}
      <style>{`
        .v2-footer-wrapper {
          font-family: "Google Sans", "Google Sans Text", "Plus Jakarta Sans", sans-serif;
          width: 100%;
          border-top: 1px solid #E2E8F0;
          background-color: #FFFFFF;
        }
        .theme-dark .v2-footer-wrapper {
          border-top-color: #1E293B;
          background-color: #0F172A;
        }
        .v2-footer-top-section {
          padding: 48px 0 32px;
          background-color: #FFFFFF;
        }
        .theme-dark .v2-footer-top-section {
          background-color: #0F172A;
        }
        .v2-footer-tabs-title {
          font-size: 20px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 20px;
          letter-spacing: -0.3px;
        }
        .theme-dark .v2-footer-tabs-title {
          color: #F8FAFC;
        }
        .v2-footer-tabs-row {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          align-items: center;
        }
        .v2-footer-tabs-row::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .v2-footer-tab-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 100px;
          border: 1px solid transparent;
          background: transparent;
          color: #474747;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .theme-dark .v2-footer-tab-btn {
          color: #A0A0A0;
        }
        .v2-footer-tab-btn:hover {
          background-color: #F2F2F2;
          color: #006CE4;
        }
        .theme-dark .v2-footer-tab-btn:hover {
          background-color: #1E293B;
          color: #3B82F6;
        }
        .v2-footer-tab-btn.active {
          border-color: #006CE4;
          color: #FFFFFF;
          background-color: #006CE4;
        }
        .theme-dark .v2-footer-tab-btn.active {
          border-color: #3B82F6;
          color: #FFFFFF;
          background-color: #3B82F6;
        }
        .v2-footer-links-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px 12px;
          margin-bottom: 12px;
        }
        .v2-footer-grid-link {
          font-size: 13px;
          color: #1A1A1A;
          text-decoration: none;
          line-height: 1.4;
          transition: color 0.15s;
        }
        .theme-dark .v2-footer-grid-link {
          color: #94A3B8;
        }
        .v2-footer-grid-link:hover {
          color: #006CE4;
          text-decoration: underline;
        }
        .theme-dark .v2-footer-grid-link:hover {
          color: #3B82F6;
        }
        .v2-footer-corporate-section {
          background-color: #F5F5F5;
          padding: 48px 0 40px;
          border-top: 1px solid #E0E0E0;
        }
        .theme-dark .v2-footer-corporate-section {
          background-color: #0B0F19;
          border-top-color: #1E293B;
        }
        .v2-footer-columns-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 32px 20px;
          margin-bottom: 40px;
        }
        .v2-footer-col h4 {
          font-size: 14px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 16px 0;
          letter-spacing: 0.2px;
        }
        .theme-dark .v2-footer-col h4 {
          color: #F8FAFC;
        }
        .v2-footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .v2-footer-corp-link {
          font-size: 13px;
          color: #1A1A1A;
          text-decoration: none;
          transition: color 0.15s;
        }
        .theme-dark .v2-footer-corp-link {
          color: #E2E8F0;
        }
        .v2-footer-corp-link:hover {
          color: #006CE4;
          text-decoration: underline;
        }
        .theme-dark .v2-footer-corp-link:hover {
          color: #3B82F6;
        }
        .v2-footer-flag-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #1A1A1A;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .theme-dark .v2-footer-flag-indicator {
          color: #F8FAFC;
        }
        .v2-footer-flag-indicator:hover {
          background-color: #EAEAEA;
        }
        .theme-dark .v2-footer-flag-indicator:hover {
          background-color: #1E293B;
        }
        .v2-footer-flag-icon {
          font-size: 16px;
          line-height: 1;
        }
        .v2-footer-flag-text {
          line-height: 1;
        }
        .v2-footer-bottom {
          border-top: 1px solid #E0E0E0;
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        .theme-dark .v2-footer-bottom {
          border-top-color: #1E293B;
        }
        .v2-footer-logo-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .v2-footer-brand-logo {
          font-size: 14px;
          font-weight: 800;
          color: #8C8C8C;
          text-decoration: none;
          opacity: 0.8;
          transition: all 0.2s ease;
        }
        .theme-dark .v2-footer-brand-logo {
          color: #94A3B8;
        }
        .v2-footer-brand-logo:hover {
          opacity: 1;
        }
        .v2-footer-brand-logo.pdfmount:hover { color: #2563EB; }
        
        @media (max-width: 1024px) {
          .v2-footer-links-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .v2-footer-columns-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .v2-footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .v2-footer-columns-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .v2-footer-links-grid {
            grid-template-columns: 1fr;
          }
          .v2-footer-columns-grid {
            grid-template-columns: 1fr;
          }
          .v2-footer-logo-row {
            gap: 16px;
          }
        }
      `}</style>

      {/* Top Part: Tabbed Popular Utilities Grid */}
      <div className="v2-footer-top-section">
        <div className="stitch-container">
          <h2 className="v2-footer-tabs-title">Popular with users from India</h2>
          
          {/* Tabs header row */}
          <div className="v2-footer-tabs-row">
            {footerTabs.map(tab => (
              <button
                key={tab.id}
                className={`v2-footer-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Links Grid */}
          <div className="v2-footer-links-grid">
            {activeTabObj.links.map((link: any, index) => (
              <a
                key={index}
                href={link.route || `#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="v2-footer-grid-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (link.route) {
                    window.history.pushState({}, "", link.route);
                    window.dispatchEvent(new Event("popstate"));
                  } else {
                    onToolSelect(link.action);
                  }
                }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Part: 5 Column Sitemap & Corporate Branding */}
      <div className="v2-footer-corporate-section">
        <div className="stitch-container">
          <div className="v2-footer-columns-grid">
            {/* Column 1: Support */}
            <div className="v2-footer-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#contact" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "contact")}>Contact Support</a></li>
                <li><a href="#faq" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "faq")}>FAQs Help</a></li>
              </ul>
            </div>

            {/* Column 2: Discover */}
            <div className="v2-footer-col">
              <h4>Discover</h4>
              <ul>
                <li><a href="#tools" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "tools")}>All PDF Tools</a></li>
              </ul>
            </div>

            {/* Column 3: Workspace */}
            <div className="v2-footer-col">
              <h4>Workspace</h4>
              <ul>
                <li><a href="#settings" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "settings")}>My Workspace</a></li>
                <li><a href="#settings" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "settings")}>Account Settings</a></li>
              </ul>
            </div>

            {/* Column 4: Terms & Legal */}
            <div className="v2-footer-col">
              <h4>Terms &amp; Legal</h4>
              <ul>
                <li><a href="#privacy" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "privacy")}>Privacy Notice</a></li>
                <li><a href="#terms" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "terms")}>Terms of Service</a></li>
              </ul>
            </div>

            {/* Column 5: About */}
            <div className="v2-footer-col">
              <h4>About</h4>
              <ul>
                <li><a href="#about" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "about")}>About Us</a></li>
                <li><a href="#security" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "security")}>Security Policy</a></li>
                <li><a href="#file-privacy" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "file-privacy")}>File Privacy</a></li>
                <li><a href="#data-deletion" className="v2-footer-corp-link" onClick={(e) => handleLink(e, "data-deletion")}>Data Deletion</a></li>
              </ul>
            </div>
          </div>

          {/* Flag & Currency Indicator */}
          <div style={{ display: "flex", width: "100%", justifyContent: "flex-start", marginBottom: "24px" }}>
            <span className="v2-footer-flag-indicator">
              <span className="v2-footer-flag-icon">🇮🇳</span>
              <span className="v2-footer-flag-text">INR</span>
            </span>
          </div>

          {/* Bottom Bar: Copyright, Brand Row */}
          <div className="v2-footer-bottom">
            {/* Copyright */}
            <div style={{ width: "100%", textAlign: "center" }}>
              <p style={{ margin: 0, color: "#8C8C8C", fontSize: "12px" }}>
                Copyright © 2026 Pdfmount.online™. All rights reserved.
              </p>
            </div>

            {/* Partner Brand Logos Row */}
            <div className="v2-footer-logo-row">
              <a href="#home" className="v2-footer-brand-logo pdfmount" style={{ fontWeight: "800" }} onClick={(e) => { e.preventDefault(); onLogoClick(); }}>PDFMount</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterV2;

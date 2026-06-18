import { ShieldCheck, Mail, Globe, Sparkles } from "lucide-react";
import { tools, sitemapGroups } from "../data/tools";

interface FooterProps {
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
}

export function Footer({ onToolSelect, onViewChange }: FooterProps) {
  return (
    <footer className="stitch-footer">
      <div className="stitch-container">
        <div className="stitch-footer-grid">
          <div className="stitch-footer-brand">
            <a 
              className="stitch-footer-logo" 
              href="#home" 
              onClick={(e) => { 
                e.preventDefault(); 
                window.scrollTo({ top: 0, behavior: "smooth" }); 
                onViewChange("home"); 
              }}
              style={{ display: "inline-flex", alignItems: "center", marginBottom: "20px" }}
            >
              <img src="/logo.png" alt="Pdfmount.com" style={{ height: "32px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </a>
            <p className="stitch-footer-tagline" style={{ fontSize: "14px", lineHeight: "1.6", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
              Secure, browser-first tools designed to handle your documents with absolute privacy. We process files locally on your device, ensuring they never leave your sight.
            </p>
            
            {/* Trust Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "16px 0" }}>
              <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "5px 10px", borderRadius: "100px", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                🔒 Browser-Side Processing
              </span>
              <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "5px 10px", borderRadius: "100px", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                🛡️ Zero Server Retention
              </span>
            </div>

            {/* Live Status indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "16px" }}>
              <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }}></span>
              <span>All operations locally active</span>
            </div>
          </div>

          {sitemapGroups.slice(0, 3).map((group) => {
            const groupTools = tools.filter((tool) => tool.sitemapGroup === group);
            return (
              <div className="stitch-footer-col" key={group}>
                <span className="eyebrow" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "18px" }}>{group}</span>
                <ul>
                  {groupTools.slice(0, 6).map((tool) => (
                    <li key={tool.id}>
                      <a href={`#${tool.id}`} onClick={(e) => { e.preventDefault(); onToolSelect(tool.name); }}>
                        {tool.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="stitch-footer-col">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "18px" }}>Legal & Trust</span>
            <ul>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); onViewChange("about"); }}>About Us</a></li>
              <li><a href="#pricing" onClick={(e) => { e.preventDefault(); onViewChange("pricing"); }}>Pricing Plans</a></li>
              <li><a href="#security" onClick={(e) => { e.preventDefault(); onViewChange("security"); }}>Security Policy</a></li>
              <li><a href="#file-privacy" onClick={(e) => { e.preventDefault(); onViewChange("file-privacy"); }}>File Privacy</a></li>
              <li><a href="#data-deletion" onClick={(e) => { e.preventDefault(); onViewChange("data-deletion"); }}>Data Deletion</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); onViewChange("privacy"); }}>Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); onViewChange("terms"); }}>Terms of Service</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); onViewChange("faq"); }}>FAQ</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); onViewChange("contact"); }}>Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="stitch-footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "32px", display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", width: "100%" }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} Pdfmount.com. Made with ❤️ for a faster, secure web.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={15} style={{ color: "#34d399" }} />
              <span>ISO 27001 standard security</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={15} />
              <span>100% Client-Side Suite</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

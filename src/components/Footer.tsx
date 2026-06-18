import { ShieldCheck } from "lucide-react";
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
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <img src="/favicon-32x32.png" alt="" style={{ width: "22px", height: "22px", borderRadius: "5px", objectFit: "contain" }} />
              Pdfmount.com
            </a>
            <p className="stitch-footer-tagline">
              Simple, fast, and free PDF tools to help you get work done.
              No sign-up or installation required.
            </p>
          </div>

          {sitemapGroups.slice(0, 3).map((group) => {
            const groupTools = tools.filter((tool) => tool.sitemapGroup === group);
            return (
              <div className="stitch-footer-col" key={group}>
                <span className="eyebrow" style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "16px" }}>{group}</span>
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
            <span className="eyebrow" style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "16px" }}>Legal</span>
            <ul>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); onViewChange("about"); }}>About Us</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); onViewChange("privacy"); }}>Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); onViewChange("terms"); }}>Terms of Service</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); onViewChange("faq"); }}>FAQ</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); onViewChange("contact"); }}>Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="stitch-footer-bottom">
          <p>© {new Date().getFullYear()} Pdfmount.com. All rights reserved.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={14} />
            <span>ISO/IEC 27001 Certified · Privacy Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

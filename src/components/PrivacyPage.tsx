import { ArrowLeft, Shield, Clock, Lock } from "lucide-react";

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", color: "var(--c-text)", fontFamily: "'Inter', sans-serif" }}>
      <button 
        onClick={onBack} 
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", padding: "6px 16px", borderRadius: "9999px", cursor: "pointer", fontSize: "0.75rem", marginBottom: "24px", outline: "none" }}
      >
        <ArrowLeft size={14} /> Back to Tools
      </button>

      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>Last updated: June 17, 2026. Your privacy is our highest priority.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Highlight Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "20px", backgroundColor: "var(--c-surface)", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Clock size={20} style={{ color: "var(--c-accent)", marginBottom: "12px" }} />
            <h3 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>Auto Deletion</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>All uploaded files are automatically and permanently deleted from our servers after exactly 1 hour.</p>
          </div>
          <div style={{ padding: "20px", backgroundColor: "var(--c-surface)", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Shield size={20} style={{ color: "var(--c-accent)", marginBottom: "12px" }} />
            <h3 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>No File Inspection</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>We never open, read, or inspect your document contents. All processing is fully automated.</p>
          </div>
          <div style={{ padding: "20px", backgroundColor: "var(--c-surface)", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Lock size={20} style={{ color: "var(--c-accent)", marginBottom: "12px" }} />
            <h3 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>SSL Encrypted</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>Files are transferred via secure HTTPS streams and processed locally or on isolated secure servers.</p>
          </div>
        </div>

        {/* Text Block */}
        <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>1. Information We Collect</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              WeLovePDF is a zero-registration document helper. We do not ask for personal details unless you contact support or submit feedback. We collect basic server logging information (such as anonymized IP addresses and browser configurations) solely to run rate limits and optimize server performance.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>2. Document File Safety</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Any PDF, image, or document file uploaded to our website is held strictly in temporary server workspaces. Our automated cleanup task purges all session folders older than 60 minutes. Your files are never shared with third parties or stored in database logs.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>3. Cookies & Ads</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              We use standard session cookies to remember your workspace settings (like current theme or tool selections). Our monetization model relies on display advertisements. Third-party ad networks (like Google AdSense) may set cookies to serve personalized ads based on your browser history.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>4. Compliance</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              We adhere strictly to secure data processing standards. We do not sell user data. Our server storage pipelines are ISO/IEC 27001 compliant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

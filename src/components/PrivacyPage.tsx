import { ArrowLeft, Shield, Clock, Lock } from "lucide-react";

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--s-background, #f9f9f9)", paddingBottom: "80px" }}>
      <div className="stitch-container" style={{ paddingTop: "60px", paddingBottom: "40px" }}>
        
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
          <ArrowLeft size={16} /> Back to Tools
        </button>

        {/* Hero Header */}
        <div style={{ marginBottom: "56px" }}>
          <span className="eyebrow" style={{ color: "rgba(0,0,0,0.5)", display: "block", marginBottom: "12px" }}>Data &amp; Security</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 340, letterSpacing: "-0.8px", marginBottom: "16px", lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: "16px", fontWeight: 320, margin: 0 }}>
            Last updated: June 17, 2026 · We hold your document privacy as our highest priority.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          
          {/* Highlight Cards */}
          <div className="stitch-why-grid">
            <div className="stitch-why-card" style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--s-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.1px" }}>Auto Deletion</h3>
                <p style={{ fontSize: "14px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>
                  All uploaded files are automatically and permanently deleted from our servers after exactly 1 hour.
                </p>
              </div>
            </div>

            <div className="stitch-why-card" style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--s-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.1px" }}>No File Inspection</h3>
                <p style={{ fontSize: "14px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>
                  We never open, read, or inspect your document contents. All processing is fully automated.
                </p>
              </div>
            </div>

            <div className="stitch-why-card" style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.05)", color: "var(--s-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.1px" }}>SSL Encrypted</h3>
                <p style={{ fontSize: "14px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>
                  Files are transferred via secure HTTPS streams and processed locally or on isolated secure servers.
                </p>
              </div>
            </div>
          </div>

          {/* Text Blocks */}
          <div 
            style={{ 
              backgroundColor: "#ffffff", 
              padding: "40px", 
              borderRadius: "24px", 
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex", 
              flexDirection: "column", 
              gap: "36px" 
            }}
          >
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>1. Information We Collect</h2>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
                WeLovePDF is a zero-registration document helper. We do not ask for personal details unless you contact support or submit feedback. We collect basic server logging information (such as anonymized IP addresses and browser configurations) solely to run rate limits and optimize server performance.
              </p>
            </div>

            <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>2. Document File Safety</h2>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
                Any PDF, image, or document file uploaded to our website is held strictly in temporary server workspaces. Our automated cleanup task purges all session folders older than 60 minutes. Your files are never shared with third parties or stored in database logs.
              </p>
            </div>
            
            <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>3. Cookies &amp; Ads</h2>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
                We use standard session cookies to remember your workspace settings (like current theme or tool selections). Our monetization model relies on display advertisements. Third-party ad networks (like Google AdSense) may set cookies to serve personalized ads based on your browser history.
              </p>
            </div>

            <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>4. Compliance</h2>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
                We adhere strictly to secure data processing standards. We do not sell user data. Our server storage pipelines are ISO/IEC 27001 compliant.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

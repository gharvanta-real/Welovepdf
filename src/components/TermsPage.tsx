import { ArrowLeft } from "lucide-react";

interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
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
          <span className="eyebrow" style={{ color: "rgba(0,0,0,0.5)", display: "block", marginBottom: "12px" }}>Legal &amp; Policy</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 340, letterSpacing: "-0.8px", marginBottom: "16px", lineHeight: 1.1 }}>
            Terms of Service
          </h1>
          <p style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: "16px", fontWeight: 320, margin: 0 }}>
            Last updated: June 17, 2026 · Please read these terms carefully before utilizing our tools.
          </p>
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
            <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>1. Acceptance of Terms</h2>
            <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
              By accessing and using WeLovePDF, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>2. Free Service &amp; Monetization</h2>
            <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
              WeLovePDF is provided 100% Free of charge for all users. We display third-party advertisements and support optional UPI tips to fund server and operations costs. We do not sell subscriptions or charge for individual PDF features.
            </p>
          </div>

          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>3. Usage Restrictions &amp; Quotas</h2>
            <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
              You agree to use WeLovePDF only for lawful purposes. You must not attempt to scrape our web tools, automate uploads via external scripts, upload malicious files containing viruses, or intentionally overload our servers. We enforce a client-side and server-side rate limit per IP address to ensure fair server availability for all users.
            </p>
          </div>

          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>4. Intellectual Property</h2>
            <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
              You retain full ownership of all PDF documents, images, and texts you upload. WeLovePDF does not claim any rights, copyright, or ownership over your files.
            </p>
          </div>

          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.05)" }} />

          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "12px", letterSpacing: "-0.2px" }}>5. Disclaimer of Warranties</h2>
            <p style={{ fontSize: "16px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, margin: 0 }}>
              Our tools are provided "as is" and "as available". While we strive for high conversion fidelity, WeLovePDF makes no warranties regarding the accuracy, completeness, or reliability of converted outputs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

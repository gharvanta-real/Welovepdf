import { ArrowLeft } from "lucide-react";

interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", color: "var(--c-text)", fontFamily: "'Inter', sans-serif" }}>
      <button 
        onClick={onBack} 
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", padding: "6px 16px", borderRadius: "9999px", cursor: "pointer", fontSize: "0.75rem", marginBottom: "24px", outline: "none" }}
      >
        <ArrowLeft size={14} /> Back to Tools
      </button>

      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>Terms of Service</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>Last updated: June 17, 2026. Please read these terms carefully.</p>

      <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>1. Acceptance of Terms</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            By accessing and using WeLovePDF, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>2. Free Service & Monetization</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            WeLovePDF is provided 100% Free of charge for all users. We display third-party advertisements and support optional UPI tips to fund server and operations costs. We do not sell subscriptions or charge for individual PDF features.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>3. Usage Restrictions & Quotas</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            You agree to use WeLovePDF only for lawful purposes. You must not attempt to scrape our web tools, automate uploads via external scripts, upload malicious files containing viruses, or intentionally overload our servers. We enforce a client-side and server-side rate limit per IP address to ensure fair server availability for all users.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>4. Intellectual Property</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            You retain full ownership of all PDF documents, images, and texts you upload. WeLovePDF does not claim any rights, copyright, or ownership over your files.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "8px" }}>5. Disclaimer of Warranties</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
            Our tools are provided "as is" and "as available". While we strive for high conversion fidelity, WeLovePDF makes no warranties regarding the accuracy, completeness, or reliability of converted outputs.
          </p>
        </div>
      </div>
    </div>
  );
}

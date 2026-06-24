import { Shield, Clock, Lock } from "lucide-react";

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Data Safety & Trust
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            We care deeply about your privacy. Here is a simple, straightforward explanation of how we protect your information.
          </p>
        </div>

        {/* Flat Section Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={20} style={{ color: "var(--v2-primary)" }} /> 1. Automatic Deletion in 1 Hour
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Any file you upload is processed in a temporary, secure folder. We have an automated cleaner that permanently deletes all uploaded documents and conversions after exactly 60 minutes. Once deleted, they are gone forever.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Shield size={20} style={{ color: "var(--v2-primary)" }} /> 2. No Human Inspection
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Everything we do is fully automated. No human being ever opens, inspects, or reads your files. Our servers only run the specific conversion or edit command you request, and then immediately output the new file back to you.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock size={20} style={{ color: "var(--v2-primary)" }} /> 3. Secure Encryption
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              We use secure HTTPS connections for all file transfers. This means your documents are fully encrypted while traveling between your browser and our servers, keeping them safe from any network snooping.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              4. The Information We Collect
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              PDFMount is a helper tool that does not require registration. We do not collect names or emails unless you voluntarily sign up for an account or write to us for support. We only keep basic log details (like generic browser information) to help prevent server abuse and run rate limits.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              5. Cookies and Advertisements
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: "0 0 16px 0" }}>
              We use basic cookies to remember preferences like your theme or active tool. To keep our tools free for everyone, we display clean, non-intrusive advertisements. Third-party ad networks (such as Google AdSense) use cookies to serve personalized ads based on your visits to our site and other pages on the internet.
            </p>
            <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0, paddingLeft: "16px", borderLeft: "3px solid var(--v2-primary)" }}>
              • Google uses cookies to show ads on our website.<br />
              • You can easily opt out of personalized ads by visiting the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "var(--v2-primary)", textDecoration: "underline" }}>Google Ads Settings</a> page.<br />
              • You can also manage other ad cookie preferences at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: "var(--v2-primary)", textDecoration: "underline" }}>www.aboutads.info</a>.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              6. Got Questions?
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              If you have any questions or suggestions regarding how we handle your files or manage our systems, feel free to get in touch with us at <a href="mailto:support@pdfmount.online" style={{ color: "var(--v2-primary)", textDecoration: "none", fontWeight: 600 }}>support@pdfmount.online</a>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

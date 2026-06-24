interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Terms & Guidelines
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Welcome to PDFMount! Please read these simple rules and guidelines for using our services.
          </p>
        </div>

        {/* Flat Section Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              1. Using Our Tools
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              By using PDFMount, you agree to these terms. We build these tools to help you manage, convert, and edit your files. You are welcome to use them as much as you like within the daily limits we set to ensure our servers stay healthy and responsive.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              2. Free Plan & Pro Account Limits
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Our tools are free to use. To prevent server overload, we set standard daily quotas on how many files you can process. If you need higher limits or larger file support, you can voluntarily sign up for our Pro plans. We never sell your data to fund our servers; instead, we rely on subscription fees and clean ads.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              3. Fair Play & Server Security
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Please be fair when using our service. You must not attempt to scrape our tools, automate file uploads using custom scripts, or upload malicious files containing viruses. We enforce automated rate limits per IP address to ensure equal server access for all users.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              4. You Own Your Files
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              Any document, image, or text you upload belongs 100% to you. PDFMount does not claim any ownership, copyright, or rights over your files. We only process them and return the results, immediately discarding them from our systems after 1 hour.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              5. Service Disclaimer
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              We work hard to make our conversion tools highly accurate and reliable. However, our services are provided "as is" without any strict warranties. We cannot guarantee that all conversions will be perfect, and we are not liable for any file loss during transit. Always keep a backup of your original documents!
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              6. Contact Us
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              If you have any questions about these terms or need help with your account, please send us an email at <a href="mailto:support@pdfmount.online" style={{ color: "var(--v2-primary)", textDecoration: "none", fontWeight: 600 }}>support@pdfmount.online</a>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

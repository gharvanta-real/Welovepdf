import { FileText, Users, Server, AlertCircle, ShieldOff, Mail } from "lucide-react";

interface TermsPageProps {
  onBack: () => void;
}

const sections = [
  {
    icon: FileText,
    title: "Using Our Tools",
    body: "By accessing PDFMount, you agree to these terms. Our tools are built to help you manage, convert, merge, compress, and edit your PDF and document files. You are welcome to use them freely within the usage limits set for your account tier to ensure fair server access for all users.",
  },
  {
    icon: Users,
    title: "Free Plan & Pro Account Limits",
    body: "Our core tools are free for everyone. To prevent server overload, we apply standard daily processing quotas based on your plan. Guest users can upload files up to 25 MB. Free account holders up to 50 MB. Pro members up to 500 MB. We never sell your data — server costs are covered by optional Pro plans and clean advertising.",
  },
  {
    icon: Server,
    title: "Fair Use & Server Security",
    body: "Please use our service responsibly. You must not attempt to scrape or automate file uploads using bots or custom scripts. Do not upload files containing malicious code, viruses, or copyrighted material you do not own. We enforce automated rate limits per IP address to ensure equal access for all users worldwide.",
  },
  {
    icon: ShieldOff,
    title: "You Own Your Files",
    body: "Any document, image, or text you upload belongs 100% to you. PDFMount does not claim any ownership, copyright, or intellectual property rights over your files. We process them, return the output, and then discard all copies from our servers automatically after 1 hour.",
  },
  {
    icon: AlertCircle,
    title: "Service Disclaimer",
    body: "We work hard to make our tools accurate and highly reliable. However, services are provided \"as is\" without strict warranties. We cannot guarantee that all conversions will be pixel-perfect, and we are not liable for any file loss during transit. Always keep a backup of your original documents before using any conversion tool.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    body: "If you have any questions about these terms or need help with your account, send us an email anytime.",
    email: "support@pdfmount.online",
  },
];

export function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div
      className="stitch-landing-v2 theme-blue"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "var(--v2-text-main)",
        fontFamily: "var(--v2-font-sans)",
        paddingBottom: "100px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* ── Hero ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "48px",
            padding: "64px 0 56px",
            borderBottom: "1px solid var(--v2-border)",
          }}
        >
          <div>

            <h1
              style={{
                fontSize: "clamp(30px, 4vw, 44px)",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                lineHeight: 1.15,
                color: "var(--v2-text-main)",
                margin: "0 0 16px",
              }}
            >
              Terms of Service
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--v2-text-muted)",
                lineHeight: 1.65,
                margin: "0 0 20px",
                maxWidth: "520px",
              }}
            >
              Please read these simple rules and guidelines before using our services.
              By continuing to use PDFMount, you accept these terms.
            </p>
            <p style={{ fontSize: "13px", color: "var(--v2-text-light)", margin: 0 }}>
              Effective date: June 2025 &nbsp;·&nbsp; Applies to all users
            </p>
          </div>
          <img
            src="/illus-terms.png"
            alt="Terms of service illustration"
            style={{ width: "clamp(180px, 22vw, 300px)", objectFit: "contain" }}
          />
        </div>

        {/* ── Sections ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr",
                  gap: "20px",
                  padding: "36px 0",
                  borderBottom: i < sections.length - 1 ? "1px solid var(--v2-border)" : "none",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "var(--v2-primary-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                    border: "none",
                  }}
                >
                  <Icon size={18} style={{ color: "var(--v2-primary)" }} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "var(--v2-text-main)",
                      margin: "0 0 10px",
                    }}
                  >
                    {i + 1}. {s.title}
                  </h2>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "var(--v2-text-muted)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {s.body}
                  </p>
                  {s.email && (
                    <a
                      href={`mailto:${s.email}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "12px",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--v2-primary)",
                        textDecoration: "none",
                      }}
                    >
                      <Mail size={15} /> {s.email}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default TermsPage;

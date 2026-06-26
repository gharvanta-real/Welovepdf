import { Shield, Clock, Lock, Eye, Cookie, Mail } from "lucide-react";

interface PrivacyPageProps {
  onBack: () => void;
}

const sections = [
  {
    icon: Clock,
    title: "Automatic File Deletion — 1 Hour",
    body: "Any file you upload is processed inside a secure, temporary folder on our server. We run an automated cleanup script that permanently deletes all uploaded documents and outputs after exactly 60 minutes. Once gone, they cannot be recovered by anyone — including us.",
  },
  {
    icon: Eye,
    title: "No Human Inspection",
    body: "Everything is fully automated. No employee, engineer, or third party ever opens, reads, or inspects your files. Our servers execute only the specific operation you request (merge, compress, convert, etc.) and immediately return the result to your browser.",
  },
  {
    icon: Lock,
    title: "Encrypted Connections (HTTPS / TLS)",
    body: "All file transfers between your browser and our servers use industry-standard HTTPS encryption. Your documents travel in a fully encrypted tunnel — protected from any network snooping or interception.",
  },
  {
    icon: Shield,
    title: "What Information We Collect",
    body: "PDFMount does not require registration to use. We do not collect your name or email unless you voluntarily sign up for an account or contact us for support. We only retain basic server logs (anonymous IP, browser type) to prevent abuse and manage rate limits.",
  },
  {
    icon: Cookie,
    title: "Cookies & Advertisements",
    body: "We use minimal cookies to remember your preferences (theme, active tool). To keep our tools free for everyone, we display clean, non-intrusive ads. Third-party ad networks like Google AdSense may use cookies to show relevant ads based on your browsing history.",
    extra: [
      "Google uses cookies to serve ads on our site.",
      "Opt out of personalized ads via Google Ads Settings (google.com/settings/ads).",
      "Manage broader ad preferences at aboutads.info.",
    ],
  },
  {
    icon: Mail,
    title: "Got Questions?",
    body: "If you have any concerns about how we handle your data, reach out to us anytime.",
    email: "support@pdfmount.online",
  },
];

export function PrivacyPage({ onBack }: PrivacyPageProps) {
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
              Privacy Policy
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
              We care deeply about your privacy. Here is a simple, transparent explanation
              of how we protect your information and your files.
            </p>
            <p style={{ fontSize: "13px", color: "var(--v2-text-light)", margin: 0 }}>
              Last updated: June 2025 &nbsp;·&nbsp; Effective immediately
            </p>
          </div>
          <img
            src="/illus-privacy.png"
            alt="Privacy illustration"
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
                {/* Icon */}
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
                  }}
                >
                  <Icon size={18} style={{ color: "var(--v2-primary)" }} />
                </div>

                {/* Content */}
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

                  {s.extra && (
                    <ul
                      style={{
                        margin: "12px 0 0",
                        paddingLeft: "0",
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {s.extra.map((item, j) => (
                        <li
                          key={j}
                          style={{
                            fontSize: "14px",
                            color: "var(--v2-text-muted)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              backgroundColor: "var(--v2-primary)",
                              marginTop: "8px",
                              flexShrink: 0,
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

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

export default PrivacyPage;

import { ArrowRight } from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
  onViewChange: (view: any) => void;
}

const SimplicityIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <circle cx="32" cy="32" r="24" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="32" cy="32" r="20" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2" />
    <path d="M34 16L22 34h9v14l12-18h-9l6-10z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PrivacyIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <circle cx="32" cy="32" r="24" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
    <rect x="20" y="26" width="24" height="20" rx="4" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2" />
    <path d="M26 26V20a6 6 0 1112 0v6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="35" r="3" fill="#1E3A8A" />
    <path d="M32 38v4" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EveryoneIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <circle cx="32" cy="32" r="24" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="20" cy="28" r="6" fill="#CBD5E1" opacity="0.6" />
    <path d="M10 44c0-5 4-9 9-9s9 4 9 9v2h-18v-2z" fill="#CBD5E1" opacity="0.6" />
    <circle cx="44" cy="28" r="6" fill="#CBD5E1" opacity="0.6" />
    <path d="M36 44c0-5 4-9 9-9s9 4 9 9v2h-18v-2z" fill="#CBD5E1" opacity="0.6" />
    <circle cx="32" cy="24" r="8" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2" />
    <path d="M20 44c0-6.6 5.4-12 12-12s12 5.4 12 12v2H20v-2z" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2" />
  </svg>
);

const principles = [
  {
    illustration: SimplicityIllustration,
    title: "Pure Simplicity",
    desc: "No complex settings or options. Select a tool, upload your file, and get your result in seconds.",
  },
  {
    illustration: PrivacyIllustration,
    title: "Privacy First",
    desc: "Files are processed in secure, temporary workspaces and deleted after 60 minutes. We never store or share your documents.",
  },
  {
    illustration: EveryoneIllustration,
    title: "Built for Everyone",
    desc: "From students to professionals — our tools stay free through clean, non-intrusive advertising and optional Pro plans.",
  },
];

const stats = [
  { value: "20+", label: "PDF Tools" },
  { value: "128K+", label: "Files Processed Today" },
  { value: "1 hr", label: "Auto File Deletion" },
  { value: "100%", label: "Automated — No Human Access" },
];

export function AboutPage({ onBack, onViewChange }: AboutPageProps) {
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
              About PDFMount
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--v2-text-muted)",
                lineHeight: 1.65,
                margin: "0",
                maxWidth: "520px",
              }}
            >
              We build simple, fast, and private tools to help you manage your PDF files
              — without the hassle of downloading software or paying hidden fees.
            </p>
          </div>
          <img
            src="/illus-about.png"
            alt="About PDFMount illustration"
            style={{ width: "clamp(180px, 22vw, 300px)", objectFit: "contain" }}
          />
        </div>

        {/* ── Stats Row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            backgroundColor: "var(--v2-border)",
            borderRadius: "12px",
            overflow: "hidden",
            margin: "40px 0",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#ffffff",
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "var(--v2-primary)",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--v2-text-muted)", lineHeight: 1.4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Story ── */}
        <div
          style={{
            padding: "36px 0",
            borderBottom: "1px solid var(--v2-border)",
            borderTop: "1px solid var(--v2-border)",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--v2-text-main)",
              margin: "0 0 16px",
            }}
          >
            Our Story
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "var(--v2-text-muted)",
              lineHeight: 1.75,
              margin: 0,
              maxWidth: "720px",
            }}
          >
            PDFMount was started with a simple goal: make editing, converting, and organizing
            PDF documents quick and easy for everyone. Most people just want to perform simple
            tasks — merge files, compress a large document, or sign a contract — without
            downloading heavy software, subscribing to expensive services, or worrying about
            where their personal files are being stored.
            <br /><br />
            That's why we built a lightweight, browser-based toolset that runs instantly,
            keeps your data completely secure, and is entirely free for everyday use.
          </p>
        </div>

        {/* ── Core Principles ── */}
        <div style={{ padding: "36px 0", borderBottom: "1px solid var(--v2-border)" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--v2-text-main)",
              margin: "0 0 24px",
            }}
          >
            Our Core Principles
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {principles.map((p, i) => {
              const Illustration = p.illustration;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "28px 24px",
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--v2-border)",
                    boxSizing: "border-box",
                  }}
                >
                  <Illustration />
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        margin: "12px 0 8px",
                        color: "var(--v2-text-main)",
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--v2-text-muted)",
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA ── */}
        <div
          style={{
            padding: "36px 0",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--v2-text-main)", margin: 0 }}>
            Need help or have suggestions?
          </h2>
          <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.65, margin: 0, maxWidth: "540px" }}>
            We'd love to hear how we can make PDFMount better for you. Reach out to our team or
            start using our tools right away.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => onViewChange("home")}
              className="v2-pill-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                padding: "11px 24px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Explore Tools <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onViewChange("contact")}
              className="v2-pill-outline"
              style={{
                fontSize: "14px",
                padding: "11px 24px",
                cursor: "pointer",
              }}
            >
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutPage;

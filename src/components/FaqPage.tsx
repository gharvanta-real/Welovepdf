import { useState } from "react";
import { ChevronDown, HelpCircle, Mail } from "lucide-react";

interface FaqPageProps {
  onBack: () => void;
}

interface FaqItem {
  category: string;
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    category: "General",
    q: "Is PDFMount really free to use?",
    a: "Yes, 100% free. You can merge, split, compress, and convert files without spending a penny. We cover server costs through clean, non-intrusive advertising and optional tips from users who want to support us.",
  },
  {
    category: "Privacy",
    q: "Are my uploaded files safe?",
    a: "Absolutely. All uploaded documents and converted files are automatically deleted after exactly 60 minutes. We do not read, scan, store, or share your file contents. Your files remain completely yours.",
  },
  {
    category: "Privacy",
    q: "Can I delete my files immediately instead of waiting an hour?",
    a: "Yes! You can click the delete or trash icon next to your file in the download panel to remove it from our servers instantly. You don't need to wait for the automatic cleanup.",
  },
  {
    category: "Tools",
    q: "Why are some tools like Edit PDF, Annotate, and Page Numbers hidden?",
    a: "These features are currently in our testing phase to ensure they work perfectly before release. We want a stable, bug-free experience, so we have temporarily hidden them until they pass our quality checks.",
  },
  {
    category: "Limits",
    q: "Are there file size limits for uploading?",
    a: "Yes. Guest users can process files up to 25 MB. Free account holders can upload up to 50 MB. Pro members can upload files up to 500 MB. These limits keep our servers fast and reliable for everyone.",
  },
  {
    category: "General",
    q: "How can I support PDFMount?",
    a: "If our tools saved you time, you can scan our UPI QR code in the Contact page to buy the developers a chai! Sharing PDFMount with your friends and colleagues is also a massive help.",
  },
];

const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];

export function FaqPage({ onBack }: FaqPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? faqs : faqs.filter(f => f.category === activeCategory);

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
              Frequently Asked Questions
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--v2-text-muted)",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: "500px",
              }}
            >
              Everything you need to know about our free tools, safety protocols, and file limits.
            </p>
          </div>
          <img
            src="/illus-faq.png"
            alt="FAQ illustration"
            style={{ width: "clamp(160px, 20vw, 280px)", objectFit: "contain" }}
          />
        </div>

        {/* ── Category chips ── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            padding: "28px 0 0",
          }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              style={{
                padding: "7px 18px",
                borderRadius: "999px",
                border: activeCategory === cat ? "1.5px solid var(--v2-primary)" : "1.5px solid var(--v2-border)",
                backgroundColor: activeCategory === cat ? "var(--v2-primary-soft)" : "transparent",
                color: activeCategory === cat ? "var(--v2-primary)" : "var(--v2-text-muted)",
                fontSize: "13px",
                fontWeight: activeCategory === cat ? 700 : 500,
                cursor: "pointer",
                fontFamily: "var(--v2-font-sans)",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Accordion ── */}
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", borderTop: "1px solid var(--v2-border)" }}>
          {filtered.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid var(--v2-border)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "22px 0",
                    background: "transparent",
                    border: "none",
                    color: "var(--v2-text-main)",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "var(--v2-font-sans)",
                    gap: "16px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <HelpCircle
                      size={16}
                      style={{
                        color: isOpen ? "var(--v2-primary)" : "var(--v2-text-light)",
                        flexShrink: 0,
                        transition: "color 0.15s",
                      }}
                    />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "var(--v2-text-light)",
                      flexShrink: 0,
                    }}
                  />
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? "400px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--v2-text-muted)",
                      lineHeight: 1.75,
                      margin: "0 0 22px 28px",
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Contact fallback ── */}
        <div
          style={{
            marginTop: "40px",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid var(--v2-border)",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px", color: "var(--v2-text-main)" }}>
              Still have a question?
            </p>
            <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>
              Our team reads every message and replies within 24 hours.
            </p>
          </div>
          <a
            href="mailto:support@pdfmount.online"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              backgroundColor: "var(--v2-primary)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Mail size={14} /> Email Support
          </a>
        </div>

      </div>
    </div>
  );
}

export default FaqPage;

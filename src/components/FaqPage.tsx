import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqPageProps {
  onBack: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

export function FaqPage({ onBack }: FaqPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      q: "Is PDFMount really free to use?",
      a: "Yes, 100% free! You can merge, split, compress, and convert files without spending a penny. We cover our server costs using simple, non-intrusive advertisements and optional tips from users who want to buy us a cup of hot tea."
    },
    {
      q: "Are my uploaded files safe?",
      a: "Absolutely. We automatically delete all uploaded documents and converted files after exactly 60 minutes. We do not read, scan, store, or share your document contents. Your files remain completely yours."
    },
    {
      q: "Why are some tools like Edit PDF, Annotate, and Page Numbers missing?",
      a: "These features are currently in our testing phase to make sure they work perfectly before release. We want to ensure a stable, bug-free experience, so we have temporarily hidden them until they are ready."
    },
    {
      q: "Are there size limits for uploading files?",
      a: "Yes, to keep our servers running smoothly for everyone. Guest users can convert files up to 25 MB. If you sign up for a free account, you can upload files up to 50 MB. Pro members can upload files up to 500 MB."
    },
    {
      q: "Can I delete my files immediately instead of waiting an hour?",
      a: "Yes! If you don't want to wait, you can click the delete or trash icon next to your file in the download panel to delete it from our servers instantly."
    },
    {
      q: "How can I support PDFMount?",
      a: "If our tools saved you time, you can scan our UPI QR code in the support section to buy the developers a chai! Sharing PDFMount with your friends and coworkers is also a massive help."
    }
  ];

  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Common Inquiries
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Everything you need to know about our free tools, safety protocols, and server guidelines.
          </p>
        </div>

        {/* Flat Accordion Rows */}
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--v2-border)", overflow: "hidden" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                style={{
                  borderBottom: idx === faqs.length - 1 ? "none" : "1px solid var(--v2-border-light)",
                  backgroundColor: isOpen ? "rgba(37, 99, 235, 0.01)" : "transparent",
                  transition: "background-color 0.2s ease"
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "24px 32px",
                    background: "transparent",
                    border: "none",
                    color: "var(--v2-text-main)",
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: "17px",
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "var(--v2-font-sans)"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <HelpCircle size={18} style={{ color: "var(--v2-primary)", opacity: 0.8 }} />
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={18} 
                    style={{ 
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
                      transition: "transform 0.25s ease",
                      color: "var(--v2-text-light)",
                      flexShrink: 0,
                      marginLeft: "16px"
                    }} 
                  />
                </button>

                <div 
                  style={{
                    maxHeight: isOpen ? "600px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "all 0.25s ease",
                    padding: isOpen ? "0 32px 24px 62px" : "0 32px 0 62px"
                  }}
                >
                  <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

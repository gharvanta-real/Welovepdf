import { useState } from "react";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";

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
      q: "Is Pdfmount.com really free to use?",
      a: "Yes, 100% free! You can use all conversions, page organization, AI summaries, and security tools without paying anything. We support server expenses by showing clean, non-intrusive advertisements and accepting optional UPI tips."
    },
    {
      q: "Is my personal document secure on your servers?",
      a: "Absolutely. We employ an automated server cleanup task that deletes all uploaded documents and processed outputs exactly 1 hour after conversion. We do not read, scan, store, or share your document contents."
    },
    {
      q: "Why are some tools like Edit PDF, Annotator, and Page Numbers missing from the menu?",
      a: "These features are currently undergoing developer testing (Beta phase) to ensure they work smoothly. We have temporarily hidden them to maintain a highly stable, production-ready tool suite."
    },
    {
      q: "Are there size limits for uploading files?",
      a: "Yes. Guest (not logged in) users can process up to 10 tools per day, with files up to 25 MB each. Logged-in free users can upload up to 50 MB per file with the same 10 jobs/day limit. Pro users get 500 MB per file and 100 jobs per day."
    },
    {
      q: "Can I cancel or delete my files before the 1-hour auto-delete timer?",
      a: "Yes. You can clear your session history or delete files instantly by clicking the 'Reset' button in the dashboard, which purges your staged file cache immediately."
    },
    {
      q: "How can I support Pdfmount.com?",
      a: "If our free tools saved you time, you can scan our UPI QR code in the feedback section or donate panel to buy the developers a cup of hot chai! Sharing Pdfmount.com with your colleagues and friends is also a huge help."
    }
  ];

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
          <span className="eyebrow" style={{ color: "rgba(0,0,0,0.5)", display: "block", marginBottom: "12px" }}>Common Inquiries</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <HelpCircle size={36} style={{ color: "var(--s-primary)" }} />
            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 340, letterSpacing: "-0.8px", margin: 0, lineHeight: 1.1 }}>
              Frequently Asked Questions
            </h1>
          </div>
          <p style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: "18px", fontWeight: 320, margin: 0 }}>
            Everything you need to know about our free PDF tools, security, and usage constraints.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid var(--s-hairline)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  overflow: "hidden",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "24px 28px",
                    background: "transparent",
                    border: "none",
                    color: "var(--s-on-surface)",
                    textAlign: "left",
                    fontWeight: 540,
                    fontSize: "18px",
                    letterSpacing: "-0.1px",
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    style={{ 
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
                      transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      color: "rgba(0,0,0,0.45)",
                      flexShrink: 0,
                      marginLeft: "16px"
                    }} 
                  />
                </button>

                <div 
                  style={{
                    maxHeight: isOpen ? "300px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    padding: isOpen ? "0 28px 24px" : "0 28px"
                  }}
                >
                  <div style={{ height: "1px", backgroundColor: "var(--s-hairline-soft)", marginBottom: "16px" }} />
                  <p style={{ fontSize: "16px", fontWeight: 320, color: "var(--s-on-surface-variant)", lineHeight: 1.6, margin: 0 }}>
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

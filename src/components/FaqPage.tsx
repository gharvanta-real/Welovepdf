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
      q: "Is WeLovePDF really free to use?",
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
      a: "To keep our servers fast for everyone, files are capped at 50MB per upload. Most normal documents, presentations, and images fall well within this limit."
    },
    {
      q: "Can I cancel or delete my files before the 1-hour auto-delete timer?",
      a: "Yes. You can clear your session history or delete files instantly by clicking the 'Reset' button in the dashboard, which purges your staged file cache immediately."
    },
    {
      q: "How can I support WeLovePDF?",
      a: "If our free tools saved you time, you can scan our UPI QR code in the feedback section or donate panel to buy the developers a cup of hot chai! Sharing WeLovePDF with your colleagues and friends is also a huge help."
    }
  ];

  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", color: "var(--c-text)", fontFamily: "'Inter', sans-serif" }}>
      <button 
        onClick={onBack} 
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", padding: "6px 16px", borderRadius: "9999px", cursor: "pointer", fontSize: "0.75rem", marginBottom: "24px", outline: "none" }}
      >
        <ArrowLeft size={14} /> Back to Tools
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <HelpCircle size={28} style={{ color: "var(--c-accent)" }} />
        <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: 0 }}>Frequently Asked Questions</h1>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px", paddingLeft: "36px" }}>Everything you need to know about our free PDF tools, security, and usage constraints.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingLeft: "36px" }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              style={{
                backgroundColor: "var(--c-surface)",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                overflow: "hidden",
                transition: "all 0.2s ease"
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "transparent",
                  border: "none",
                  color: "var(--c-text)",
                  textAlign: "left",
                  fontWeight: "500",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
                    transition: "transform 0.2s ease",
                    color: "var(--text-muted)"
                  }} 
                />
              </button>

              <div 
                style={{
                  maxHeight: isOpen ? "200px" : "0px",
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  padding: isOpen ? "0 20px 16px" : "0 20px"
                }}
              >
                <div style={{ height: "1px", backgroundColor: "var(--border)", marginBottom: "12px" }} />
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

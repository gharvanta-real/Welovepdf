import { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Coffee } from "lucide-react";

interface ContactPageProps {
  onBack: () => void;
}

export function ContactPage({ onBack }: ContactPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 4000);
    }, 1200);
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", color: "var(--c-text)", fontFamily: "'Inter', sans-serif" }}>
      <button 
        onClick={onBack} 
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--text-muted)", padding: "6px 16px", borderRadius: "9999px", cursor: "pointer", fontSize: "0.75rem", marginBottom: "24px", outline: "none" }}
      >
        <ArrowLeft size={14} /> Back to Tools
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", marginTop: "12px" }}>
        
        {/* Left Column: Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={24} style={{ color: "var(--c-accent)" }} />
            <h1 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0 }}>Get in Touch</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.4, margin: 0 }}>
            Have a feature request, bug report, or want to say hello? Send us a message, and our developer team will get back to you!
          </p>

          <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle2 size={48} style={{ color: "#10b981", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "4px" }}>Feedback Received!</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Thank you for writing to us. We will reply shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label htmlFor="contact-name" style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-muted)" }}>Name</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    required 
                    placeholder="Ankit Sharma" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px", borderRadius: "9999px", border: "1px solid var(--border)", backgroundColor: "var(--c-bg)", color: "var(--c-text)", fontSize: "0.75rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label htmlFor="contact-email" style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-muted)" }}>Email Address</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    required 
                    placeholder="ankit.sharma@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px", borderRadius: "9999px", border: "1px solid var(--border)", backgroundColor: "var(--c-bg)", color: "var(--c-text)", fontSize: "0.75rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label htmlFor="contact-subject" style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-muted)" }}>Subject (Optional)</label>
                  <input 
                    type="text" 
                    id="contact-subject" 
                    placeholder="Suggestion / Bug Report" 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px", borderRadius: "9999px", border: "1px solid var(--border)", backgroundColor: "var(--c-bg)", color: "var(--c-text)", fontSize: "0.75rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label htmlFor="contact-msg" style={{ fontSize: "0.7rem", fontWeight: "500", color: "var(--text-muted)" }}>Message</label>
                  <textarea 
                    id="contact-msg" 
                    required 
                    rows={4} 
                    placeholder="How can we help you?" 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--c-bg)", color: "var(--c-text)", fontSize: "0.75rem", outline: "none", resize: "none" }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: "var(--c-accent)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "9999px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600", transition: "opacity 0.2s" }}
                >
                  {loading ? "Sending..." : <><Send size={12} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: UPI Donate QR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Coffee size={24} style={{ color: "#ea580c" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>Buy the Dev a Chai ☕</h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.4, margin: 0 }}>
            WeLovePDF is a completely free utility running on self-funded servers. If you appreciate the speed and ad-supported nature, scan the code to support our chai fund!
          </p>

          <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", border: "1px dashed var(--border)" }}>
            <div style={{ width: "160px", height: "160px", backgroundColor: "#ffffff", padding: "10px", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Simple stylized SVG for QR Code mock */}
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ color: "#000000" }}>
                <rect x="0" y="0" width="24" height="24" fill="currentColor" />
                <rect x="3" y="3" width="18" height="18" fill="#ffffff" />
                <rect x="7" y="7" width="10" height="10" fill="currentColor" />

                <rect x="76" y="0" width="24" height="24" fill="currentColor" />
                <rect x="79" y="3" width="18" height="18" fill="#ffffff" />
                <rect x="83" y="7" width="10" height="10" fill="currentColor" />

                <rect x="0" y="76" width="24" height="24" fill="currentColor" />
                <rect x="3" y="79" width="18" height="18" fill="#ffffff" />
                <rect x="83" y="79" width="10" height="10" fill="currentColor" />

                {/* Random QR pixels */}
                <rect x="30" y="4" width="4" height="8" fill="currentColor" />
                <rect x="30" y="15" width="8" height="4" fill="currentColor" />
                <rect x="42" y="10" width="4" height="12" fill="currentColor" />
                <rect x="55" y="2" width="6" height="4" fill="currentColor" />
                <rect x="65" y="8" width="4" height="10" fill="currentColor" />

                <rect x="10" y="30" width="8" height="4" fill="currentColor" />
                <rect x="15" y="42" width="4" height="8" fill="currentColor" />
                <rect x="25" y="35" width="10" height="4" fill="currentColor" />
                <rect x="30" y="45" width="4" height="12" fill="currentColor" />

                <rect x="45" y="30" width="12" height="12" fill="currentColor" />
                <rect x="48" y="33" width="6" height="6" fill="#ffffff" />

                <rect x="70" y="30" width="4" height="8" fill="currentColor" />
                <rect x="85" y="30" width="8" height="4" fill="currentColor" />
                <rect x="80" y="40" width="4" height="12" fill="currentColor" />

                <rect x="4" y="60" width="6" height="4" fill="currentColor" />
                <rect x="15" y="65" width="4" height="8" fill="currentColor" />

                <rect x="30" y="76" width="4" height="14" fill="currentColor" />
                <rect x="40" y="80" width="12" height="4" fill="currentColor" />
                <rect x="50" y="60" width="4" height="16" fill="currentColor" />
                <rect x="62" y="70" width="10" height="4" fill="currentColor" />
                
                <rect x="60" y="85" width="12" height="12" fill="currentColor" />
                <rect x="80" y="65" width="14" height="4" fill="currentColor" />
                <rect x="85" y="76" width="4" height="12" fill="currentColor" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--c-text)" }}>Scan UPI Code</span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Supports BHIM, GPay, PhonePe, Paytm, etc.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

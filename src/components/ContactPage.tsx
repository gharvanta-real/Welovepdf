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

        <div className="stitch-split-section" style={{ gap: "60px", marginTop: "12px" }}>
          
          {/* Left Column: Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MessageSquare size={32} style={{ color: "var(--s-primary)" }} />
              <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 540, letterSpacing: "-0.5px", margin: 0, lineHeight: 1.1 }}>
                Get in Touch
              </h1>
            </div>
            <p style={{ color: "rgba(0,0,0,0.6)", fontSize: "16px", fontWeight: 320, lineHeight: 1.5, margin: 0 }}>
              Have a feature request, bug report, or want to say hello? Send us a message, and our developer team will get back to you!
            </p>

            <div 
              style={{ 
                backgroundColor: "#ffffff", 
                padding: "36px", 
                borderRadius: "24px", 
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)"
              }}
            >
              {submitted ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <CheckCircle2 size={56} style={{ color: "#10b981", margin: "0 auto 16px" }} />
                  <h3 style={{ fontSize: "20px", fontWeight: 540, marginBottom: "8px" }}>Feedback Received!</h3>
                  <p style={{ fontSize: "15px", fontWeight: 320, color: "rgba(0,0,0,0.5)" }}>Thank you for writing to us. We will reply shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="contact-name" style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(0,0,0,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Name</label>
                    <input 
                      type="text" 
                      id="contact-name" 
                      required 
                      placeholder="Ankit Sharma" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "10px 18px", 
                        borderRadius: "9999px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="contact-email" style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(0,0,0,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Email Address</label>
                    <input 
                      type="email" 
                      id="contact-email" 
                      required 
                      placeholder="ankit.sharma@example.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "10px 18px", 
                        borderRadius: "9999px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="contact-subject" style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(0,0,0,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Subject (Optional)</label>
                    <input 
                      type="text" 
                      id="contact-subject" 
                      placeholder="Suggestion / Bug Report" 
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "10px 18px", 
                        borderRadius: "9999px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="contact-msg" style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(0,0,0,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Message</label>
                    <textarea 
                      id="contact-msg" 
                      required 
                      rows={5} 
                      placeholder="How can we help you?" 
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "14px 18px", 
                        borderRadius: "16px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none", 
                        resize: "none",
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="stitch-pill-primary"
                    style={{ 
                      width: "100%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: "8px", 
                      padding: "12px 24px", 
                      fontSize: "15px", 
                      marginTop: "8px"
                    }}
                  >
                    {loading ? "Sending..." : <><Send size={14} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: UPI Donate QR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", justifyContent: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Coffee size={32} style={{ color: "#ea580c" }} />
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 540, letterSpacing: "-0.3px", margin: 0, lineHeight: 1.1 }}>
                Buy the Dev a Chai ☕
              </h2>
            </div>
            <p style={{ color: "rgba(0,0,0,0.6)", fontSize: "16px", fontWeight: 320, lineHeight: 1.5, margin: 0 }}>
              WeLovePDF is a completely free utility running on self-funded servers. If you appreciate the speed and ad-supported nature, scan the code to support our chai fund!
            </p>

            <div 
              style={{ 
                backgroundColor: "#ffffff", 
                padding: "36px", 
                borderRadius: "24px", 
                border: "1px dashed rgba(0,0,0,0.15)",
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "20px" 
              }}
            >
              <div style={{ 
                backgroundColor: "#ffffff", 
                padding: "16px", 
                borderRadius: "16px", 
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)", 
                border: "1px solid rgba(0,0,0,0.05)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                {/* Simple stylized SVG for QR Code mock */}
                <svg width="150" height="150" viewBox="0 0 100 100" style={{ color: "#000000" }}>
                  <rect x="0" y="0" width="24" height="24" fill="currentColor" />
                  <rect x="3" y="3" width="18" height="18" fill="#ffffff" />
                  <rect x="7" y="7" width="10" height="10" fill="currentColor" />

                  <rect x="76" y="0" width="24" height="24" fill="currentColor" />
                  <rect x="79" y="3" width="18" height="18" fill="#ffffff" />
                  <rect x="83" y="7" width="10" height="10" fill="currentColor" />

                  <rect x="0" y="76" width="24" height="24" fill="currentColor" />
                  <rect x="3" y="79" width="18" height="18" fill="#ffffff" />
                  <rect x="7" y="83" width="10" height="10" fill="currentColor" />

                  <rect x="76" y="76" width="24" height="24" fill="currentColor" />
                  <rect x="79" y="79" width="18" height="18" fill="#ffffff" />
                  <rect x="83" y="83" width="10" height="10" fill="currentColor" />

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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--s-on-surface)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Scan UPI Code</span>
                <span className="eyebrow" style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>GPay, PhonePe, Paytm, BHIM</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

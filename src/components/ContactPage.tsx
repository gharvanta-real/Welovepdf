import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, Coffee } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to send message");
      }
      setSubmitted(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Contact Us
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Have questions, feedback, or need help? Send us a message or buy us a cup of hot tea to keep us going!
          </p>
        </div>

        {/* Flat Columns Layout inside a single clean container */}
        <div style={{ backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px" }}>
          
          {/* Left Column: Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MessageSquare size={24} style={{ color: "var(--v2-primary)" }} />
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>Send a Message</h2>
            </div>
            
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CheckCircle2 size={48} style={{ color: "#10b981", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--v2-text-main)" }}>Thank you!</h3>
                <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>We have received your message and will reply shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="contact-name" style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Name</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    required 
                    placeholder="Enter your name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      border: "1.5px solid var(--v2-border)", 
                      backgroundColor: "transparent", 
                      color: "var(--v2-text-main)", 
                      fontSize: "14px", 
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="contact-email" style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Email Address</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    required 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      border: "1.5px solid var(--v2-border)", 
                      backgroundColor: "transparent", 
                      color: "var(--v2-text-main)", 
                      fontSize: "14px", 
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="contact-subject" style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Subject (Optional)</label>
                  <input 
                    type="text" 
                    id="contact-subject" 
                    placeholder="How can we help?" 
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      border: "1.5px solid var(--v2-border)", 
                      backgroundColor: "transparent", 
                      color: "var(--v2-text-main)", 
                      fontSize: "14px", 
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="contact-msg" style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Message</label>
                  <textarea 
                    id="contact-msg" 
                    required 
                    rows={5} 
                    placeholder="Write your message here..." 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "12px 16px", 
                      borderRadius: "8px", 
                      border: "1.5px solid var(--v2-border)", 
                      backgroundColor: "transparent", 
                      color: "var(--v2-text-main)", 
                      fontSize: "14px", 
                      outline: "none", 
                      resize: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="v2-pill-primary"
                  style={{ 
                    width: "100%", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    padding: "12px 24px", 
                    fontSize: "14px", 
                    marginTop: "8px",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  {loading ? "Sending..." : <><Send size={14} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Support / QR Code */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Coffee size={24} style={{ color: "#ea580c" }} />
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>Buy the Dev a Chai ☕</h2>
            </div>
            
            <p style={{ color: "var(--v2-text-muted)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              PDFMount is a free utility run by independent developers. If our tools saved you time, scan the UPI QR code below to donate a hot cup of chai and support our server fees!
            </p>

            <div 
              style={{ 
                padding: "24px", 
                borderRadius: "12px", 
                border: "1px dashed var(--v2-border)",
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "16px" 
              }}
            >
              <div style={{ 
                backgroundColor: "#ffffff", 
                padding: "16px", 
                borderRadius: "12px", 
                border: "1px solid var(--v2-border-light)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
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
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--v2-text-main)" }}>Scan UPI Code</span>
                <span style={{ fontSize: "11px", color: "var(--v2-text-light)" }}>GPay, PhonePe, Paytm, BHIM</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ContactPage;

import { useState } from "react";
import { Send, CheckCircle2, MessageSquare, Mail, Clock, Coffee } from "lucide-react";

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
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1.5px solid var(--v2-border)",
    backgroundColor: "#ffffff",
    color: "var(--v2-text-main)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--v2-font-sans)",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,
    color: "var(--v2-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
    display: "block",
  };

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
              Contact Us
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "var(--v2-text-muted)",
                lineHeight: 1.65,
                margin: 0,
                maxWidth: "480px",
              }}
            >
              Have a question, bug report, or feedback? We read every message and typically reply within 24 hours.
            </p>
          </div>
          <img
            src="/illus-contact.png"
            alt="Contact illustration"
            style={{ width: "clamp(160px, 20vw, 280px)", objectFit: "contain" }}
          />
        </div>

        {/* ── Body: Form + Info ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "48px",
            paddingTop: "48px",
            alignItems: "start",
          }}
        >
          {/* Left: Form */}
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 24px", color: "var(--v2-text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={18} style={{ color: "var(--v2-primary)" }} /> Send a Message
            </h2>

            {submitted ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "64px 0",
                  gap: "16px",
                  textAlign: "center",
                }}
              >
                <CheckCircle2 size={48} style={{ color: "#10b981" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>
                  Message Sent!
                </h3>
                <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>
                  We've received your message and will reply within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label htmlFor="contact-name" style={labelStyle}>Name</label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" style={labelStyle}>Email Address</label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" style={labelStyle}>Subject (Optional)</label>
                  <input
                    type="text"
                    id="contact-subject"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="contact-msg" style={labelStyle}>Message</label>
                  <textarea
                    id="contact-msg"
                    required
                    rows={6}
                    placeholder="Write your message here..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="v2-pill-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 28px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    alignSelf: "flex-start",
                  }}
                >
                  {loading ? "Sending..." : <><Send size={14} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Right: Info Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email card */}
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid var(--v2-border)",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "var(--v2-primary-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mail size={16} style={{ color: "var(--v2-primary)" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--v2-text-main)" }}>
                  Email Support
                </span>
              </div>
              <a
                href="mailto:support@pdfmount.online"
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--v2-primary)",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                support@pdfmount.online
              </a>
              <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", margin: 0, lineHeight: 1.5 }}>
                For account issues, billing, or bugs.
              </p>
            </div>

            {/* Response time */}
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid var(--v2-border)",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "var(--v2-primary-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={16} style={{ color: "var(--v2-primary)" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--v2-text-main)" }}>
                  Response Time
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0, lineHeight: 1.6 }}>
                We typically reply within <strong style={{ color: "var(--v2-text-main)" }}>24–48 hours</strong> on business days.
              </p>
            </div>

            {/* Chai support */}
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px dashed var(--v2-border)",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(234, 88, 12, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Coffee size={16} style={{ color: "#ea580c" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--v2-text-main)" }}>
                  Buy the Dev a Chai ☕
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", margin: "0 0 12px", lineHeight: 1.55 }}>
                PDFMount is run by independent developers. If our tools saved your time, scan the UPI QR to support us!
              </p>
              {/* UPI QR placeholder */}
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  border: "1px solid var(--v2-border)",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="120" height="120" viewBox="0 0 100 100" style={{ color: "#000" }}>
                  <rect x="0" y="0" width="24" height="24" fill="currentColor" />
                  <rect x="3" y="3" width="18" height="18" fill="#f9f9f9" />
                  <rect x="7" y="7" width="10" height="10" fill="currentColor" />
                  <rect x="76" y="0" width="24" height="24" fill="currentColor" />
                  <rect x="79" y="3" width="18" height="18" fill="#f9f9f9" />
                  <rect x="83" y="7" width="10" height="10" fill="currentColor" />
                  <rect x="0" y="76" width="24" height="24" fill="currentColor" />
                  <rect x="3" y="79" width="18" height="18" fill="#f9f9f9" />
                  <rect x="7" y="83" width="10" height="10" fill="currentColor" />
                  <rect x="30" y="4" width="4" height="8" fill="currentColor" />
                  <rect x="42" y="10" width="4" height="12" fill="currentColor" />
                  <rect x="55" y="2" width="6" height="4" fill="currentColor" />
                  <rect x="65" y="8" width="4" height="10" fill="currentColor" />
                  <rect x="10" y="30" width="8" height="4" fill="currentColor" />
                  <rect x="15" y="42" width="4" height="8" fill="currentColor" />
                  <rect x="25" y="35" width="10" height="4" fill="currentColor" />
                  <rect x="30" y="45" width="4" height="12" fill="currentColor" />
                  <rect x="45" y="30" width="12" height="12" fill="currentColor" />
                  <rect x="48" y="33" width="6" height="6" fill="#f9f9f9" />
                  <rect x="70" y="30" width="4" height="8" fill="currentColor" />
                  <rect x="85" y="30" width="8" height="4" fill="currentColor" />
                  <rect x="80" y="40" width="4" height="12" fill="currentColor" />
                  <rect x="30" y="76" width="4" height="14" fill="currentColor" />
                  <rect x="40" y="80" width="12" height="4" fill="currentColor" />
                  <rect x="50" y="60" width="4" height="16" fill="currentColor" />
                  <rect x="62" y="70" width="10" height="4" fill="currentColor" />
                  <rect x="80" y="65" width="14" height="4" fill="currentColor" />
                  <rect x="85" y="76" width="4" height="12" fill="currentColor" />
                </svg>
                <span style={{ fontSize: "12px", color: "var(--v2-text-muted)" }}>GPay · PhonePe · Paytm · BHIM</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ContactPage;

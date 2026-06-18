import React, { useState } from "react";
import { ArrowLeft, Rocket, Shield, Code2, Coffee, CheckCircle2 } from "lucide-react";

interface ContactSalesPageProps {
  onBack: () => void;
}

export function ContactSalesPage({ onBack }: ContactSalesPageProps) {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [volume, setVolume] = useState("10,000 - 50,000 docs");
  const [message, setMessage] = useState("");
  
  // Submit state
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !message) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email,
          subject: `Sales Inquiry (${company || "No Company"}) - Volume: ${volume}`,
          message: message,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to submit sales inquiry");
      }

      setSubmitted(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCompany("");
      setVolume("10,000 - 50,000 docs");
      setMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const marqueeStyle = `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--s-background, #f9f9f9)", paddingBottom: "120px" }}>
      <style>{marqueeStyle}</style>
      <div className="stitch-container" style={{ paddingTop: "60px" }}>
        
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
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Hero Section */}
        <div style={{ marginBottom: "64px", maxWidth: "900px" }}>
          <span className="eyebrow" style={{ color: "var(--s-secondary)", textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px", display: "block", marginBottom: "16px" }}>
            Enterprise Solutions
          </span>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 76px)", fontWeight: 340, letterSpacing: "-1.50px", lineHeight: 1.05, marginBottom: "24px", color: "var(--s-primary)" }}>
            Scale your document workflows.
          </h1>
          <p style={{ color: "var(--s-on-surface-variant)", fontSize: "22px", fontWeight: 320, lineHeight: 1.5, margin: 0, maxWidth: "700px" }}>
            Customized API limits, dedicated support, and advanced security protocols built for high-volume document processing across global teams.
          </p>
        </div>

        {/* Split Grid for Form and Benefits (Mint Color Block) */}
        <div 
          style={{ 
            backgroundColor: "var(--s-block-mint, #ADEFD1)", 
            borderRadius: "24px", 
            padding: "clamp(32px, 5vw, 64px)", 
            display: "flex", 
            flexDirection: "row", 
            flexWrap: "wrap", 
            gap: "64px", 
            alignItems: "flex-start",
            border: "1px solid rgba(0,0,0,0.05)",
            marginBottom: "64px"
          }}
        >
          {/* Left Column: Mission Description & Features */}
          <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 540, letterSpacing: "-0.5px", margin: 0, color: "var(--s-primary)", lineHeight: 1.15 }}>
              Let's build your custom plan.
            </h2>
            <p style={{ fontSize: "17px", fontWeight: 320, color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>
              Our enterprise experts will reach out within 4 hours to discuss volume licensing, technical integrations, and SOC2 compliance requirements.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--s-primary)", marginTop: "4px" }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" }}>Priority SLA</h4>
                  <p style={{ fontSize: "13px", color: "var(--s-secondary)", margin: 0 }}>Uptime guarantees you can rely on.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--s-primary)", marginTop: "4px" }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" }}>TAM Support</h4>
                  <p style={{ fontSize: "13px", color: "var(--s-secondary)", margin: 0 }}>Assigned account management.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div 
            style={{ 
              flex: "1 1 450px", 
              backgroundColor: "#ffffff", 
              borderRadius: "16px", 
              padding: "clamp(24px, 4vw, 48px)", 
              border: "1px solid var(--s-hairline)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.02)",
              width: "100%"
            }}
          >
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CheckCircle2 size={56} style={{ color: "#10b981", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "22px", fontWeight: 540, marginBottom: "12px" }}>Request Received!</h3>
                <p style={{ fontSize: "15px", fontWeight: 320, color: "var(--s-secondary)" }}>
                  Thank you for writing. Our enterprise team will get back to you within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>First Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)}
                      style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)}
                      style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                    />
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Work Email *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="jane@company.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Company Name</label>
                  <input 
                    type="text" 
                    placeholder="Acme Inc." 
                    value={company} 
                    onChange={e => setCompany(e.target.value)}
                    style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Estimated Monthly Volume</label>
                  <select 
                    value={volume} 
                    onChange={e => setVolume(e.target.value)}
                    style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", backgroundColor: "#fff", fontFamily: "inherit", appearance: "none" }}
                  >
                    <option>10,000 - 50,000 docs</option>
                    <option>50,000 - 250,000 docs</option>
                    <option>250,000+ docs</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Message</label>
                  <textarea 
                    rows={4} 
                    placeholder="Tell us about your project goals..." 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    style={{ padding: "12px 18px", borderRadius: "16px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", resize: "none", fontFamily: "inherit" }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="stitch-pill-primary"
                  style={{ width: "100%", padding: "16px", fontSize: "15px", marginTop: "10px" }}
                >
                  {loading ? "Sending Request..." : "Send Request"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Corporate Client Logo Marquee */}
        <div 
          style={{ 
            backgroundColor: "#ffffff", 
            borderTop: "1px solid var(--s-hairline)", 
            borderBottom: "1px solid var(--s-hairline)", 
            padding: "48px 0",
            marginBottom: "64px" 
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span className="eyebrow" style={{ fontSize: "12px", color: "var(--s-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Powering Global Leaders
            </span>
          </div>
          
          <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
            <div 
              style={{ 
                display: "inline-block", 
                animation: "marquee 20s linear infinite",
                paddingLeft: "100%"
              }}
            >
              {[
                "STELLAR_CORP", "QUANTUM_SYS", "NEBULA_LABS", "VERTEX_PRO", "ORBIT_DIGITAL", "NOVA_LEGAL",
                "STELLAR_CORP", "QUANTUM_SYS", "NEBULA_LABS", "VERTEX_PRO", "ORBIT_DIGITAL", "NOVA_LEGAL"
              ].map((name, i) => (
                <span 
                  key={i} 
                  style={{ 
                    fontSize: "36px", 
                    fontWeight: "bold", 
                    opacity: 0.25, 
                    marginRight: "96px",
                    fontFamily: "var(--font-display-lg)" 
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grids (Lime, Coral, Pink bg shapes) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", marginBottom: "64px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "var(--s-block-lime)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={20} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>High Velocity</h3>
            <p style={{ fontSize: "15px", color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>
              Optimized endpoints designed for parallel processing of millions of files simultaneously.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "var(--s-block-coral)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Bank-Grade Security</h3>
            <p style={{ fontSize: "15px", color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>
              End-to-end encryption with data residency options in over 40 global regions.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "var(--s-block-pink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Code2 size={20} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>API-First</h3>
            <p style={{ fontSize: "15px", color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>
              Robust SDKs for Python, Node.js, and Java to integrate PDF editing into your existing stack.
            </p>
          </div>

        </div>

        {/* UPI Chai Donation Block */}
        <div 
          style={{ 
            backgroundColor: "#ffffff", 
            padding: "48px", 
            borderRadius: "24px", 
            border: "1px dashed var(--s-hairline)",
            display: "flex", 
            flexDirection: "row", 
            flexWrap: "wrap", 
            alignItems: "center", 
            justifyContent: "space-between", 
            gap: "32px" 
          }}
        >
          <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Coffee size={28} style={{ color: "#ea580c" }} />
              <h2 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>Buy the Dev a Chai ☕</h2>
            </div>
            <p style={{ color: "var(--s-on-surface-variant)", fontSize: "15px", lineHeight: 1.5, margin: 0 }}>
              Pdfmount.com is a completely free utility running on self-funded servers. If you appreciate the speed and ad-supported nature, scan the code to support our chai fund!
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ 
              backgroundColor: "#ffffff", 
              padding: "16px", 
              borderRadius: "16px", 
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)", 
              border: "1px solid var(--s-hairline)"
            }}>
              {/* QR Mock */}
              <svg width="100" height="100" viewBox="0 0 100 100">
                <rect x="0" y="0" width="24" height="24" fill="#000" />
                <rect x="3" y="3" width="18" height="18" fill="#fff" />
                <rect x="7" y="7" width="10" height="10" fill="#000" />
                <rect x="76" y="0" width="24" height="24" fill="#000" />
                <rect x="79" y="3" width="18" height="18" fill="#fff" />
                <rect x="83" y="7" width="10" height="10" fill="#000" />
                <rect x="0" y="76" width="24" height="24" fill="#000" />
                <rect x="3" y="79" width="18" height="18" fill="#fff" />
                <rect x="7" y="83" width="10" height="10" fill="#000" />
                <rect x="30" y="30" width="40" height="40" fill="#000" opacity="0.8" />
                <rect x="35" y="35" width="30" height="30" fill="#fff" />
                <rect x="40" y="40" width="20" height="20" fill="#000" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>Scan UPI Code</span>
              <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)" }}>GPay, PhonePe, Paytm, BHIM</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

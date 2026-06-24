import React, { useState } from "react";
import { Rocket, Shield, Code2, Coffee, CheckCircle2 } from "lucide-react";

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
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <style>{marqueeStyle}</style>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Enterprise Solutions
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            Scale Your Document Workflows
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Customized limits, dedicated support, and advanced integrations built for high-volume document processing.
          </p>
        </div>

        {/* Flat Content Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "48px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px" }}>
            
            {/* Left Column: Mission Description & Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>
                Let's build your custom plan
              </h2>
              <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
                Our team will reach out shortly to discuss custom volume licensing, API integrations, and dedicated hosting options.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ color: "var(--v2-primary)", marginTop: "4px" }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0" }}>Priority SLA</h4>
                    <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>High availability and uptime guarantees you can rely on.</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ color: "var(--v2-primary)", marginTop: "4px" }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0" }}>Dedicated TAM</h4>
                    <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>Assigned account management and fast support channels.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <CheckCircle2 size={48} style={{ color: "#10b981", margin: "0 auto 16px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--v2-text-main)" }}>Request Received!</h3>
                  <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>
                    Thank you. Our enterprise team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>First Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Jane" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Last Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Doe" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Work Email *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="jane@company.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Company Name</label>
                    <input 
                      type="text" 
                      placeholder="Acme Inc." 
                      value={company} 
                      onChange={e => setCompany(e.target.value)}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Estimated Monthly Volume</label>
                    <select 
                      value={volume} 
                      onChange={e => setVolume(e.target.value)}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", backgroundColor: "#fff", boxSizing: "border-box" }}
                    >
                      <option>10,000 - 50,000 docs</option>
                      <option>50,000 - 250,000 docs</option>
                      <option>250,000+ docs</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase" }}>Message</label>
                    <textarea 
                      rows={4} 
                      placeholder="Tell us about your project goals..." 
                      value={message} 
                      onChange={e => setMessage(e.target.value)}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1.5px solid var(--v2-border)", outline: "none", fontSize: "14px", resize: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="v2-pill-primary"
                    style={{ width: "100%", padding: "12px 24px", fontSize: "14px", border: "none", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {loading ? "Sending Request..." : "Send Request"}
                  </button>
                </form>
              )}
            </div>

          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          {/* Corporate Client Logo Marquee */}
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--v2-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
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
                      fontSize: "24px", 
                      fontWeight: "bold", 
                      opacity: 0.15, 
                      marginRight: "96px"
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          {/* Core Benefits */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--v2-bg-badge)", color: "var(--v2-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Rocket size={18} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>High Velocity</h3>
              <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
                Optimized server nodes built to support parallel processing and high-concurrency document requests.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--v2-bg-badge)", color: "var(--v2-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={18} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>Enterprise Security</h3>
              <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
                Secure connections and automated server purges to protect proprietary client documents.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--v2-bg-badge)", color: "var(--v2-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Code2 size={18} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>API Integrations</h3>
              <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
                Straightforward endpoints and JSON requests that easily integrate with your active tech stack.
              </p>
            </div>

          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          {/* Donate Chai Section */}
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "32px" }}>
            <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Coffee size={24} style={{ color: "#ea580c" }} />
                <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--v2-text-main)" }}>Buy the Dev a Chai ☕</h3>
              </div>
              <p style={{ color: "var(--v2-text-muted)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                PDFMount is a free utility run by independent developers. If our tools saved you time, scan the code to support our chai fund!
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ 
                backgroundColor: "#ffffff", 
                padding: "12px", 
                borderRadius: "12px", 
                border: "1px solid var(--v2-border)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <svg width="80" height="80" viewBox="0 0 100 100">
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
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
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

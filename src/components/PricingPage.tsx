import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface PricingPageProps {
  currentUser: { name: string; email: string; plan?: string } | null;
  onUpgradeSuccess: (planName: string) => void;
  onLoginRequired: () => void;
  onBack: () => void;
}

export function PricingPage({ currentUser, onUpgradeSuccess, onLoginRequired, onBack }: PricingPageProps) {
  const [copied, setCopied] = useState(false);

  const handleProUpgrade = () => {
    if (currentUser) {
      onUpgradeSuccess("Pro");
    } else {
      onLoginRequired();
    }
  };

  const handleEnterpriseClick = () => {
    if (currentUser) {
      onUpgradeSuccess("Enterprise");
    } else {
      onLoginRequired();
    }
  };

  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff", color: "#1b1b1b", paddingBottom: "120px" }}>
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
          <ArrowLeft size={16} /> Back to Tools
        </button>

        {/* Hero & Pricing Tiers: Lime Block */}
        <section style={{
          backgroundColor: "var(--s-block-lime, #D3F57B)",
          borderRadius: "16px",
          padding: "80px 48px 120px",
          overflow: "hidden",
          marginBottom: "80px"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "64px" }}>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "14px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "rgba(0,0,0,0.55)",
                display: "block",
                marginBottom: "24px"
              }}>Transparent Pricing</span>
              <h1 style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "clamp(36px, 6vw, 72px)",
                lineHeight: 1.05,
                fontWeight: 340,
                color: "#000000",
                letterSpacing: "-1.5px",
                marginBottom: "20px",
                maxWidth: "800px"
              }}>
                Plans for every team.
              </h1>
              <p style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "18px",
                lineHeight: "1.55",
                color: "rgba(0,0,0,0.7)",
                maxWidth: "600px",
                fontWeight: 320,
                margin: "0 auto"
              }}>
                Whether you're a solo creator or a global enterprise, we have the tools to accelerate your document workflow.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "stretch"
            }}>
              
              {/* Starter Card */}
              <div style={{
                backgroundColor: "#ffffff",
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid var(--s-hairline)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "box-shadow 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.06)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "22px", fontWeight: 540, marginBottom: "8px" }}>Starter</h3>
                  <p style={{ fontSize: "14px", color: "var(--s-secondary)" }}>For individuals and light projects.</p>
                </div>
                <div style={{ marginBottom: "32px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 340 }}>$0</span>
                  <span style={{ fontSize: "14px", color: "var(--s-secondary)" }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px 0", display: "flex", flexDirection: "column", gap: "16px", flexGrow: 1 }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    5 PDF edits per month
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    Basic annotation tools
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    2GB Cloud storage
                  </li>
                </ul>
                <button 
                  onClick={onBack}
                  className="stitch-pill-primary" 
                  style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                >
                  Get Started
                </button>
              </div>

              {/* Pro Card (Black / Featured) */}
              <div style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid #000000",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                position: "relative",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                transform: "scale(1.02)",
                zIndex: 2
              }}>
                <div style={{
                  position: "absolute",
                  top: "-14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  padding: "4px 16px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "JetBrains Mono, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                  Most Popular
                </div>
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "22px", fontWeight: 540, marginBottom: "8px", color: "#ffffff" }}>Pro</h3>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>For professionals and heavy users.</p>
                </div>
                <div style={{ marginBottom: "32px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 340, color: "#ffffff" }}>$19</span>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px 0", display: "flex", flexDirection: "column", gap: "16px", flexGrow: 1 }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#ffffff" }} />
                    Unlimited PDF edits
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#ffffff" }} />
                    OCR text recognition
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#ffffff" }} />
                    50GB Cloud storage
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#ffffff" }} />
                    Custom watermarks
                  </li>
                </ul>
                <button 
                  onClick={handleProUpgrade}
                  style={{ 
                    width: "100%", 
                    justifyContent: "center", 
                    padding: "14px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    border: "none",
                    borderRadius: "9999px",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: "16px",
                    fontFamily: "Plus Jakarta Sans, sans-serif"
                  }}
                >
                  {currentUser?.plan === "Pro" ? "Current Plan" : "Get Started"}
                </button>
              </div>

              {/* Enterprise Card */}
              <div style={{
                backgroundColor: "#ffffff",
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid var(--s-hairline)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "box-shadow 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.06)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "22px", fontWeight: 540, marginBottom: "8px" }}>Enterprise</h3>
                  <p style={{ fontSize: "14px", color: "var(--s-secondary)" }}>For teams requiring control and scale.</p>
                </div>
                <div style={{ marginBottom: "32px" }}>
                  <span style={{ fontSize: "48px", fontWeight: 340 }}>Custom</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px 0", display: "flex", flexDirection: "column", gap: "16px", flexGrow: 1 }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    SSO &amp; Advanced Security
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    Admin dashboard
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    Unlimited storage
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}>
                    <CheckCircle2 size={16} style={{ color: "#000000" }} />
                    Dedicated support
                  </li>
                </ul>
                <button 
                  onClick={handleEnterpriseClick}
                  className="stitch-pill-primary" 
                  style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                >
                  Contact Sales
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Comparison Table Section */}
        <section style={{ marginBottom: "80px" }}>
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: 540, letterSpacing: "-0.5px", margin: "0 0 8px 0" }}>Compare Features</h2>
            <p style={{ fontSize: "16px", color: "var(--s-secondary)", margin: 0 }}>Deep dive into the specifics of each tier.</p>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--s-hairline)" }}>
                  <th style={{ padding: "16px 8px", fontSize: "16px", fontWeight: 600, width: "40%" }}>Core Features</th>
                  <th style={{ padding: "16px 8px", fontSize: "16px", fontWeight: 500, color: "var(--s-secondary)", textAlign: "center" }}>Starter</th>
                  <th style={{ padding: "16px 8px", fontSize: "16px", fontWeight: 600, color: "#000000", textAlign: "center" }}>Pro</th>
                  <th style={{ padding: "16px 8px", fontSize: "16px", fontWeight: 500, color: "var(--s-secondary)", textAlign: "center" }}>Enterprise</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "15px" }}>
                <tr style={{ borderBottom: "1px solid var(--s-hairline-soft)" }}>
                  <td style={{ padding: "20px 8px" }}>Unlimited Monthly Documents</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-outline)", textAlign: "center" }}>—</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--s-hairline-soft)" }}>
                  <td style={{ padding: "20px 8px" }}>OCR Technology (12 languages)</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-outline)", textAlign: "center" }}>—</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--s-hairline-soft)" }}>
                  <td style={{ padding: "20px 8px" }}>Collaborative Live Editing</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-secondary)", textAlign: "center" }}>View Only</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--s-hairline-soft)" }}>
                  <td style={{ padding: "20px 8px" }}>API Access</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-outline)", textAlign: "center" }}>—</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-secondary)", textAlign: "center" }}>Add-on</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--s-hairline-soft)" }}>
                  <td style={{ padding: "20px 8px" }}>Custom Branding</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-outline)", textAlign: "center" }}>—</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--s-hairline-soft)" }}>
                  <td style={{ padding: "20px 8px" }}>Priority Support</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-outline)", textAlign: "center" }}>—</td>
                  <td style={{ padding: "20px 8px", color: "var(--s-secondary)", textAlign: "center" }}>24/5</td>
                  <td style={{ padding: "20px 8px", textAlign: "center", fontWeight: "bold" }}>24/7 VIP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA Banner Block */}
        <section style={{
          backgroundColor: "var(--s-surface-soft, #F5F5F5)",
          borderRadius: "16px",
          padding: "64px 32px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "32px", fontWeight: 340, letterSpacing: "-0.5px", marginBottom: "32px" }}>Ready to transform your PDFs?</h2>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => {
                if (currentUser) {
                  onUpgradeSuccess("Pro");
                } else {
                  onLoginRequired();
                }
              }}
              className="stitch-pill-primary" 
              style={{ padding: "16px 36px" }}
            >
              Create Free Account
            </button>
            <button 
              onClick={onBack}
              className="stitch-pill-secondary" 
              style={{ padding: "16px 36px", backgroundColor: "#ffffff" }}
            >
              View Demo Tools
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

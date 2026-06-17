import { useState } from "react";
import { ArrowLeft, ShieldCheck, Heart, Coffee, Info, AlertTriangle, CheckCircle } from "lucide-react";

interface PricingPageProps {
  currentUser: { name: string; email: string; plan?: string } | null;
  onUpgradeSuccess: (planName: string) => void;
  onLoginRequired: () => void;
  onBack: () => void;
}

export function PricingPage({ onBack }: PricingPageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("anshu@upi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto", color: "var(--c-text)", fontFamily: "'Inter', sans-serif" }}>
      {/* Back Button */}
      <button 
        onClick={onBack} 
        style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px", 
          border: "1px solid var(--border)", 
          background: "var(--c-bg)", 
          color: "var(--text-muted)", 
          padding: "6px 16px", 
          borderRadius: "9999px", 
          cursor: "pointer", 
          fontSize: "0.75rem", 
          marginBottom: "24px", 
          outline: "none",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--c-accent)";
          e.currentTarget.style.color = "var(--c-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <ArrowLeft size={14} /> Back to Tools
      </button>

      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "9999px", backgroundColor: "color-mix(in srgb, var(--c-accent) 10%, var(--c-bg))", color: "var(--c-accent)", fontSize: "0.75rem", fontWeight: "600", marginBottom: "16px" }}>
          <Heart size={12} fill="var(--c-accent)" /> 100% Free & Open Initiative
        </div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "12px", color: "var(--c-text)" }}>Pricing & Limits</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.5 }}>
          We don't sell subscriptions, lock features behind paywalls, or force credit card checks. WeLovePDF is built on a free, ad-supported model with voluntary UPI donations.
        </p>
      </div>

      {/* Quotas & Limits Block */}
      <div style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={20} style={{ color: "var(--c-accent)" }} /> Fair Use Quota Limits
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          
          {/* Size Limit */}
          <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>50 MB Max File Size</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                To keep our high-speed Rust-based document compilers running efficiently for everyone, uploads are limited to 50 MB per file queue.
              </p>
            </div>
          </div>

          {/* Retention Limit */}
          <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>1-Hour Auto Delete</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                Your security is guaranteed. All files in your workspace are automatically and permanently deleted from our servers exactly 60 minutes after conversion.
              </p>
            </div>
          </div>

          {/* Queue Limit */}
          <div style={{ backgroundColor: "var(--c-surface)", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Coffee size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>Fair Processing Queue</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                All document jobs are routed through a shared, standard processing queue. We utilize multi-threaded execution to return your outputs in seconds.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Support / UPI Section */}
      <div style={{ 
        backgroundColor: "var(--c-surface)", 
        borderRadius: "16px", 
        border: "1px dashed var(--border)", 
        padding: "32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "32px",
        alignItems: "center"
      }}>
        
        {/* Pitch */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Coffee size={28} style={{ color: "#ea580c" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>Buy the Dev a Chai ☕</h2>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
            Running PDF document engines, OCR utilities, and file storage pipelines incurs real server expenses every month. 
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
            If WeLovePDF has saved you time and money, consider scanning the UPI QR code to voluntarily support our chai fund! Every single rupee helps us keep the servers running ad-supported and free of paywalls.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)" }}>Donation Milestones:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "0.7rem", backgroundColor: "var(--c-bg)", padding: "4px 10px", borderRadius: "9999px", border: "1px solid var(--border)" }}>₹10 · Ginger Chai ☕</span>
              <span style={{ fontSize: "0.7rem", backgroundColor: "var(--c-bg)", padding: "4px 10px", borderRadius: "9999px", border: "1px solid var(--border)" }}>₹20 · Masala Chai ☕</span>
              <span style={{ fontSize: "0.7rem", backgroundColor: "var(--c-bg)", padding: "4px 10px", borderRadius: "9999px", border: "1px solid var(--border)" }}>₹50 · Chai + Samosa 🥟</span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ 
            backgroundColor: "#ffffff", 
            padding: "16px", 
            borderRadius: "12px", 
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* Styled Mock QR Code */}
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

              {/* QR Dots */}
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

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <button 
              onClick={handleCopyUpi}
              style={{
                background: "transparent",
                border: "none",
                color: copied ? "#10b981" : "var(--c-accent)",
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
                padding: "2px 8px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              {copied ? <><CheckCircle size={12} /> Copied! </> : "Copy UPI ID: anshu@upi"}
            </button>
            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Scan QR via GPay, PhonePe, Paytm, or BHIM</span>
          </div>
        </div>

      </div>

    </div>
  );
}

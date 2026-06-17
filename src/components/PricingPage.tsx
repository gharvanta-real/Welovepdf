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
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div 
            className="eyebrow" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "6px 16px", 
              borderRadius: "9999px", 
              backgroundColor: "rgba(0, 0, 0, 0.05)", 
              color: "var(--s-primary, #000000)", 
              fontSize: "12px", 
              fontWeight: "600", 
              marginBottom: "24px" 
            }}
          >
            <Heart size={12} fill="var(--s-primary, #000000)" /> 100% Free &amp; Open Initiative
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 340, letterSpacing: "-0.96px", marginBottom: "20px", lineHeight: 1.1 }}>
            Pricing &amp; Limits
          </h1>
          <p style={{ color: "rgba(0, 0, 0, 0.6)", fontSize: "20px", fontWeight: 320, maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
            We don't sell subscriptions, lock features behind paywalls, or force credit card checks. WeLovePDF is built on a free, ad-supported model with voluntary UPI donations.
          </p>
        </div>

        {/* Quotas & Limits Block */}
        <div style={{ marginBottom: "80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", justifyContent: "center" }}>
            <Info size={24} style={{ color: "var(--s-primary)" }} />
            <h2 style={{ fontSize: "24px", fontWeight: 540, letterSpacing: "-0.2px", margin: 0 }}>
              Fair Use Quota Limits
            </h2>
          </div>
          
          <div className="stitch-why-grid">
            
            {/* Size Limit */}
            <div className="stitch-why-card" style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.1px" }}>50 MB Max File Size</h3>
                <p style={{ fontSize: "15px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>
                  To keep our high-speed Rust-based document compilers running efficiently for everyone, uploads are limited to 50 MB per file queue.
                </p>
              </div>
            </div>

            {/* Retention Limit */}
            <div className="stitch-why-card" style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.1px" }}>1-Hour Auto Delete</h3>
                <p style={{ fontSize: "15px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>
                  Your security is guaranteed. All files in your workspace are automatically and permanently deleted from our servers exactly 60 minutes after conversion.
                </p>
              </div>
            </div>

            {/* Queue Limit */}
            <div className="stitch-why-card" style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#ffffff" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coffee size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 540, marginBottom: "8px", letterSpacing: "-0.1px" }}>Fair Processing Queue</h3>
                <p style={{ fontSize: "15px", fontWeight: 320, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>
                  All document jobs are routed through a shared, standard processing queue. We utilize multi-threaded execution to return your outputs in seconds.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Support / UPI Section - Beautiful Stitch Color Block */}
      <section className="stitch-block-section stitch-block-cream">
        <div className="stitch-container">
          <div className="stitch-split-section" style={{ alignItems: "center" }}>
            
            {/* Pitch */}
            <div className="stitch-split-copy">
              <span className="eyebrow" style={{ color: "rgba(0,0,0,0.5)" }}>Support the developer</span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 540, letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: "20px" }}>
                Buy the Dev a Chai ☕
              </h2>
              <p style={{ fontSize: "18px", fontWeight: 320, lineHeight: 1.6, color: "rgba(0,0,0,0.65)", marginBottom: "16px" }}>
                Running PDF document engines, OCR utilities, and file storage pipelines incurs real server expenses every month. 
              </p>
              <p style={{ fontSize: "18px", fontWeight: 320, lineHeight: 1.6, color: "rgba(0,0,0,0.65)", marginBottom: "24px" }}>
                If WeLovePDF has saved you time and money, consider scanning the UPI QR code to voluntarily support our chai fund! Every single rupee helps us keep the servers running ad-supported and free of paywalls.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span className="eyebrow" style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>Donation Milestones:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 400, backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "9999px", border: "1px solid rgba(0,0,0,0.06)" }}>₹10 · Ginger Chai ☕</span>
                  <span style={{ fontSize: "13px", fontWeight: 400, backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "9999px", border: "1px solid rgba(0,0,0,0.06)" }}>₹20 · Masala Chai ☕</span>
                  <span style={{ fontSize: "13px", fontWeight: 400, backgroundColor: "#ffffff", padding: "6px 12px", borderRadius: "9999px", border: "1px solid rgba(0,0,0,0.06)" }}>₹50 · Chai + Samosa 🥟</span>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", justifyContent: "center" }}>
              <div style={{ 
                backgroundColor: "#ffffff", 
                padding: "24px", 
                borderRadius: "20px", 
                boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {/* Styled Mock QR Code */}
                <svg width="180" height="180" viewBox="0 0 100 100" style={{ color: "#000000" }}>
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
                    color: copied ? "#10b981" : "var(--s-primary)",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: "4px 12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  {copied ? <><CheckCircle size={14} /> Copied! </> : "Copy UPI ID: anshu@upi"}
                </button>
                <span className="eyebrow" style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>Scan via BHIM, GPay, PhonePe, or Paytm</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}


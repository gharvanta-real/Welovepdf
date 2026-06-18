import React, { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";

interface CookieBannerProps {
  onPrivacyPolicyClick: () => void;
}

export function CookieBanner({ onPrivacyPolicyClick }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("pdfmount-cookie-consent");
    if (!consent) {
      // Show with a slight delay for a premium entrance effect
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("pdfmount-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("pdfmount-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 99999,
        backgroundColor: "#ffffff",
        border: "1px solid var(--s-hairline)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
        maxWidth: "380px",
        width: "calc(100% - 48px)",
        boxSizing: "border-box",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div 
          style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%", 
            backgroundColor: "var(--s-surface-low)", 
            color: "var(--s-primary)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <ShieldAlert size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0", color: "var(--s-primary)" }}>
            Cookie Preference
          </h4>
          <p style={{ fontSize: "13px", color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0, fontWeight: 320 }}>
            We use cookies to save your settings and deliver personalized advertising. Learn more in our{" "}
            <a 
              href="#privacy" 
              onClick={(e) => { e.preventDefault(); onPrivacyPolicyClick(); }} 
              style={{ color: "var(--s-primary)", textDecoration: "underline", fontWeight: "600" }}
            >
              Privacy Policy
            </a>.
          </p>
        </div>
        <button 
          onClick={handleDecline} 
          aria-label="Close cookie consent banner"
          style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "var(--s-secondary)" }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
        <button
          onClick={handleDecline}
          className="stitch-pill-outline"
          style={{ 
            flex: 1, 
            padding: "10px 18px", 
            fontSize: "13px", 
            fontWeight: "600",
            backgroundColor: "transparent",
            border: "1px solid var(--s-hairline)",
            color: "var(--s-primary)"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--s-surface-low)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="stitch-pill-primary"
          style={{ 
            flex: 1.2, 
            padding: "10px 18px", 
            fontSize: "13px", 
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
